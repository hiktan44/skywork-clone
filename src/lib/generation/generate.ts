import { generateText, Output } from 'ai';
import { getImageModel, getTextModel } from '@/lib/ai';
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

export async function generateArtifact(
  module: GenerationModule,
  prompt: string,
  abortSignal?: AbortSignal
): Promise<GeneratedArtifact> {
  if (module === 'IMAGE') return generateImageArtifact(prompt, abortSignal);

  const schema = SCHEMAS[module];
  const { output } = await generateText({
    model: await getTextModel(module),
    system: INSTRUCTIONS[module],
    prompt,
    output: Output.object({ schema }),
    maxOutputTokens: module === 'WEBSITE' || module === 'DOCUMENT' ? 16_000 : 8_000,
    abortSignal,
  });

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
  const result = await generateText({
    model: await getImageModel(),
    prompt: `${prompt}\n\nYüksek kaliteli, metin içermeyen tek bir görsel üret.`,
    abortSignal,
  });
  const file = result.files.find((f) => f.mediaType?.startsWith('image/'));
  if (!file) throw new GenerationError('image_unavailable');

  const parsed = imageContentSchema.safeParse({
    mediaType: file.mediaType,
    base64: file.base64,
    caption: result.text.trim().slice(0, 2000),
  });
  if (!parsed.success) throw new GenerationError('invalid_output');
  const title = prompt.trim().slice(0, 80) || 'Görsel';
  return { title, content: { module: 'IMAGE', ...parsed.data } };
}
