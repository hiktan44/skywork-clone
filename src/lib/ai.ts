import type { LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { GenerationModule } from '@/lib/generation/schemas';

/**
 * Test-only switch: SKYWORK_AI_MOCK=1 swaps Gemini for deterministic AI SDK mock models so
 * every module can be exercised without a real key. Never set it in production.
 */
export function isAiMock(): boolean {
  return process.env.SKYWORK_AI_MOCK === '1';
}

export function isAiEnabled(): boolean {
  return isAiMock() || Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

function google() {
  // The key is read only from the environment, never from requests or files.
  return createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
}

export async function getTextModel(mockFor?: GenerationModule | 'CHAT'): Promise<LanguageModel> {
  if (isAiMock()) {
    const { createMockTextModel } = await import('@/lib/ai-mock');
    return createMockTextModel(mockFor ?? 'CHAT');
  }
  return google()(process.env.GEMINI_MODEL || 'gemini-flash-latest');
}

export async function getImageModel(): Promise<LanguageModel> {
  if (isAiMock()) {
    const { createMockImageModel } = await import('@/lib/ai-mock');
    return createMockImageModel();
  }
  return google()(process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview');
}
