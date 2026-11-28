import type { LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { GenerationModule } from '@/lib/generation/schemas';

export const DEFAULT_TEXT_MODEL = 'gemini-4-hydrogen';
export const DEFAULT_DEEP_MODEL = 'gemini-4-neon';
export const DEFAULT_IMAGE_MODEL = 'gemini-nano-banana-2.1';
export const DEFAULT_IMAGE_FALLBACK_MODEL = 'gemini-3-pro-image';

const DEEP_MODULES = new Set<GenerationModule>(['SLIDES', 'DOCUMENT', 'WEBSITE']);

export type GeminiThinkingLevel = 'low' | 'medium' | 'high';

export interface ModelCandidate {
  id: string;
  model: LanguageModel;
}

export function isGemini4Model(modelId: string): boolean {
  return /^gemini-4(?:-|$)/i.test(modelId.trim());
}

export function isImageModel(modelId: string): boolean {
  return /image|nano-banana/i.test(modelId.trim());
}

/**
 * Test-only switch: SKYWORK_AI_MOCK=1 swaps Gemini for deterministic AI SDK mock models so
 * every module can be exercised without a real key. Never set it in production.
 */
export function isAiMock(): boolean {
  return process.env.SKYWORK_AI_MOCK === '1';
}

function getApiKey(): string | undefined {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
}

export function isAiEnabled(): boolean {
  return isAiMock() || Boolean(getApiKey());
}

function google() {
  // The key is read only from the environment, never from requests or files.
  return createGoogleGenerativeAI({ apiKey: getApiKey() });
}

export function getTextModelIds(mode?: GenerationModule | 'CHAT'): string[] {
  const general = process.env.GEMINI_MODEL?.trim() || DEFAULT_TEXT_MODEL;
  if (mode && mode !== 'CHAT' && DEEP_MODULES.has(mode)) {
    const deep = process.env.GEMINI_DEEP_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || DEFAULT_DEEP_MODEL;
    return Array.from(new Set([deep, general, DEFAULT_TEXT_MODEL]));
  }
  return Array.from(new Set([general]));
}

export function getImageModelIds(): string[] {
  const primary = process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
  const fallback = process.env.GEMINI_IMAGE_FALLBACK_MODEL?.trim() || DEFAULT_IMAGE_FALLBACK_MODEL;
  return Array.from(new Set([primary, fallback]));
}

export function getGeminiThinkingOptions(modelId: string, level: GeminiThinkingLevel) {
  if (!isGemini4Model(modelId)) return undefined;
  return {
    google: {
      thinkingConfig: {
        thinkingLevel: level,
      },
    },
  };
}

export async function getTextModelCandidates(mockFor?: GenerationModule | 'CHAT'): Promise<ModelCandidate[]> {
  if (isAiMock()) {
    const { createMockTextModel } = await import('@/lib/ai-mock');
    return [{ id: `mock-${(mockFor ?? 'CHAT').toLowerCase()}`, model: createMockTextModel(mockFor ?? 'CHAT') }];
  }
  const provider = google();
  return getTextModelIds(mockFor).map((id) => ({ id, model: provider(id) }));
}

export async function getTextModel(mockFor?: GenerationModule | 'CHAT'): Promise<LanguageModel> {
  const [primary] = await getTextModelCandidates(mockFor);
  return primary.model;
}

export async function getImageModelCandidates(): Promise<ModelCandidate[]> {
  if (isAiMock()) {
    const { createMockImageModel } = await import('@/lib/ai-mock');
    return [{ id: 'mock-image', model: createMockImageModel() }];
  }
  const provider = google();
  return getImageModelIds().map((id) => ({ id, model: provider(id) }));
}

export async function getImageModel(): Promise<LanguageModel> {
  const [primary] = await getImageModelCandidates();
  return primary.model;
}
