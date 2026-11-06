import { z } from 'zod';

/** Modules that produce a finished artifact (chat is the default, module-less mode). */
export const GENERATION_MODULES = ['SLIDES', 'DOCUMENT', 'SHEET', 'WEBSITE', 'IMAGE', 'VIDEO'] as const;
export type GenerationModule = (typeof GENERATION_MODULES)[number];

export function isGenerationModule(value: unknown): value is GenerationModule {
  return typeof value === 'string' && (GENERATION_MODULES as readonly string[]).includes(value);
}

const text = (max: number) => z.string().trim().min(1).max(max);

export const slidesSchema = z.object({
  title: text(160).describe('Sunumun başlığı'),
  subtitle: z.string().max(240).describe('Kısa alt başlık'),
  slides: z
    .array(
      z.object({
        title: text(160).describe('Slayt başlığı'),
        bullets: z.array(text(300)).min(1).max(6).describe('Bitmiş, tam cümle maddeler'),
        notes: z.string().max(1500).describe('Konuşmacı notu'),
      })
    )
    .min(3)
    .max(15),
});

export const documentSchema = z.object({
  title: text(200),
  markdown: text(60_000).describe('Başlıklı (##, ###), paragraflı, bitmiş belge metni (Markdown)'),
});

const cell = z.union([z.string().max(500), z.number()]);
export const sheetSchema = z.object({
  title: text(160),
  columns: z.array(text(80)).min(1).max(15),
  rows: z.array(z.array(cell).max(15)).min(1).max(300),
  notes: z.string().max(2000).describe('Tabloyu açıklayan kısa not'),
});

export const websiteSchema = z.object({
  title: text(160),
  html: text(120_000).describe('Tek dosya, satır içi <style> içeren tam HTML belgesi; JavaScript yok'),
});

export const storyboardSchema = z.object({
  title: text(160),
  durationSec: z.number().int().min(5).max(1800),
  summary: z.string().max(1500),
  scenes: z
    .array(
      z.object({
        time: text(40).describe('Zaman aralığı, ör. 00:00–00:05'),
        visual: text(800).describe('Görüntü / kamera açıklaması'),
        voiceover: z.string().max(800).describe('Seslendirme metni'),
        onScreenText: z.string().max(200).describe('Ekran yazısı'),
      })
    )
    .min(2)
    .max(40),
});

export const imageContentSchema = z.object({
  mediaType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  base64: z.string().min(1).max(8_000_000),
  caption: z.string().max(2000),
});

export type SlidesContent = z.infer<typeof slidesSchema>;
export type DocumentContent = z.infer<typeof documentSchema>;
export type SheetContent = z.infer<typeof sheetSchema>;
export type WebsiteContent = z.infer<typeof websiteSchema>;
export type StoryboardContent = z.infer<typeof storyboardSchema>;
export type ImageContent = z.infer<typeof imageContentSchema>;

/** What is persisted in "Project"."content". */
export type ProjectContent =
  | ({ module: 'SLIDES' } & SlidesContent)
  | ({ module: 'DOCUMENT' } & DocumentContent)
  | ({ module: 'SHEET' } & SheetContent)
  | ({ module: 'WEBSITE' } & WebsiteContent)
  | ({ module: 'VIDEO' } & StoryboardContent)
  | ({ module: 'IMAGE' } & ImageContent);

/** Re-validates stored content before it is rendered or exported. */
export function parseProjectContent(value: unknown): ProjectContent | null {
  if (!value || typeof value !== 'object') return null;
  const kind = (value as { module?: unknown }).module;
  const schemas = {
    SLIDES: slidesSchema,
    DOCUMENT: documentSchema,
    SHEET: sheetSchema,
    WEBSITE: websiteSchema,
    VIDEO: storyboardSchema,
    IMAGE: imageContentSchema,
  } as const;
  if (!isGenerationModule(kind)) return null;
  const parsed = schemas[kind].safeParse(value);
  return parsed.success ? ({ module: kind, ...parsed.data } as ProjectContent) : null;
}
