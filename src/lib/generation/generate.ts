import { APICallError, generateText, Output } from 'ai';
import {
  getGeminiThinkingOptions,
  getImageModelCandidates,
  getTextModelCandidates,
  isImageModel,
} from '@/lib/ai';
import { sanitizeGeneratedHtml } from '@/lib/generation/sanitize-html';
import {
  documentSchema,
  imageContentSchema,
  sheetSchema,
  slidesSchema,
  storyboardSchema,
  websiteSchema,
  type GenerationModule,
  type ProjectContent,
} from '@/lib/generation/schemas';

const BASE =
  'Sen Skywork çalışma alanının üretim motorusun. Kullanıcının istediği ürünü TAMAMLANMIŞ ve ' +
  'kullanıma hazır olarak üret; asla "öneri", "taslak", "şablon", "örnek yapı" ya da "buraya ... yazın" ' +
  'gibi yer tutucular bırakma. Gerçekçi, somut ve özgün içerik yaz. Kullanıcı başka bir dil istemedikçe ' +
  'Türkçe yaz. Çıktıyı yalnızca istenen şemaya uygun ver.';

const INSTRUCTIONS: Record<Exclude<GenerationModule, 'IMAGE'>, string> = {
  SLIDES:
    `${BASE} Görev: 8–12 slaytlık bitmiş bir sunum. Her slaytta net bir başlık, 3–5 tam cümle madde ` +
    've sunucunun okuyabileceği konuşmacı notu olsun. İlk slayt giriş, son slayt sonuç/çağrı olsun.',
  DOCUMENT:
    `${BASE} Görev: bitmiş bir belge. Markdown kullan: tek bir # başlık, ## ve ### alt başlıklar, ` +
    'her bölümde en az bir dolu paragraf, gerektiğinde madde ve tablolar. Yönetici özeti ve sonuç bölümü ekle.',
  SHEET:
    `${BASE} Görev: doğrudan kullanılabilecek bir tablo. Sütun adları açık olsun, sayısal değerleri sayı ` +
    'olarak ver (birim sütun adında), en az 8 anlamlı satır üret; toplam satırı gerekiyorsa son satıra ekle.',
  WEBSITE:
    `${BASE} Görev: yayına hazır, tek dosya bir web sayfası. <!doctype html> ile başlayan tam HTML ver; ` +
    'tüm CSS satır içi <style> içinde olsun, mobil uyumlu olsun, gerçek metinler yaz. JavaScript, <script>, ' +
    'olay öznitelikleri (onclick vb.) ve harici betik KULLANMA.',
  VIDEO:
    `${BASE} Görev: video çekimi/kurgusu için bitmiş bir storyboard (bu bir video dosyası değildir). ` +
    'Zaman kodlu sahneler, görüntü/kamera tarifi, seslendirme metni ve ekran yazısı ver.',
};

// Added only when the interface is in English: the default instructions above ask for Turkish.
const ENGLISH_DIRECTIVE =
  ' The user interface language is English: write ALL content in English (titles, body text, notes, ' +
  'column names), unless the user explicitly asks for another language. This overrides the default-language instruction above.';

export type OutputLang = 'tr' | 'en';

const SCHEMAS = {
  SLIDES: slidesSchema,
  DOCUMENT: documentSchema,
  SHEET: sheetSchema,
  WEBSITE: websiteSchema,
  VIDEO: storyboardSchema,
} as const;

export class GenerationError extends Error {
  constructor(public code: 'image_unavailable' | 'invalid_output') {
    super(code);
  }
}

export interface GeneratedArtifact {
  title: string;
  content: ProjectContent;
}

function isFallbackableApiError(error: unknown): boolean {
  if (!APICallError.isInstance(error)) return false;
  const code = error.statusCode;
  return code === 400 || code === 403 || code === 404 || code === 429 || code === 503;
}

export async function generateArtifact(
  module: GenerationModule,
  prompt: string,
  abortSignal?: AbortSignal,
  lang: OutputLang = 'tr'
): Promise<GeneratedArtifact> {
  if (module === 'IMAGE') return generateImageArtifact(prompt, abortSignal);

  const schema = SCHEMAS[module];
  const isDeepModule = module === 'SLIDES' || module === 'DOCUMENT' || module === 'WEBSITE';
  const maxOutputTokens = isDeepModule ? 32_768 : 16_384;
  const thinkingLevel = isDeepModule ? 'medium' : 'low';
  const candidates = await getTextModelCandidates(module);

  let output: unknown;
  let lastError: unknown;
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      const res = await generateText({
        model: candidate.model,
        system: lang === 'en' ? INSTRUCTIONS[module] + ENGLISH_DIRECTIVE : INSTRUCTIONS[module],
        prompt,
        output: Output.object({ schema }),
        maxOutputTokens,
        providerOptions: getGeminiThinkingOptions(candidate.id, thinkingLevel),
        abortSignal,
      });
      output = res.output;
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      const hasNext = i < candidates.length - 1;
      if (!hasNext || !isFallbackableApiError(err)) throw err;
      console.warn(`[generate] ${candidate.id} failed for ${module}, falling back to ${candidates[i + 1].id}`);
    }
  }
  if (lastError) throw lastError;

  // Output.object already validated against the schema; parse again so nothing unvalidated is stored.
  const parsed = schema.safeParse(output);
  if (!parsed.success) throw new GenerationError('invalid_output');
  const data = parsed.data;

  if (module === 'WEBSITE') {
    const site = data as { title: string; html: string };
    return { title: site.title, content: { module, title: site.title, html: sanitizeGeneratedHtml(site.html) } };
  }
  return { title: data.title, content: { module, ...data } as ProjectContent };
}

async function generateImageArtifact(prompt: string, abortSignal?: AbortSignal): Promise<GeneratedArtifact> {
  const candidates = await getImageModelCandidates();
  let lastError: unknown;

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const hasNext = i < candidates.length - 1;
    try {
      const result = await generateText({
        model: candidate.model,
        prompt: `${prompt}\n\nYüksek kaliteli, metin içermeyen tek bir görsel üret.`,
        providerOptions: isImageModel(candidate.id)
          ? { google: { responseModalities: ['TEXT', 'IMAGE'] } }
          : undefined,
        abortSignal,
      });
      const file = result.files.find((f) => f.mediaType?.startsWith('image/'));
      if (!file) {
        if (hasNext) {
          console.warn(`[generate] ${candidate.id} returned no image, falling back to ${candidates[i + 1].id}`);
          continue;
        }
        throw new GenerationError('image_unavailable');
      }

      const parsed = imageContentSchema.safeParse({
        mediaType: file.mediaType,
        base64: file.base64,
        caption: result.text.trim().slice(0, 2000),
      });
      if (!parsed.success) throw new GenerationError('invalid_output');
      const title = prompt.trim().slice(0, 80) || 'Görsel';
      return { title, content: { module: 'IMAGE', ...parsed.data } };
    } catch (err) {
      lastError = err;
      if (!hasNext || (err instanceof GenerationError && err.code !== 'image_unavailable')) throw err;
      if (!isFallbackableApiError(err) && !(err instanceof GenerationError)) throw err;
      console.warn(`[generate] ${candidate.id} image failed, falling back to ${candidates[i + 1].id}`);
    }
  }

  throw lastError ?? new GenerationError('image_unavailable');
}
