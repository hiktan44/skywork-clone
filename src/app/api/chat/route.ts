import { NextResponse } from 'next/server';
import { streamText, type ModelMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getSessionUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_MESSAGES = 12;
const MAX_CHARS = 4000;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes per user

const SYSTEM_PROMPT =
  'Sen SkyClaw adlı, Skywork çalışma alanının yardımcı yapay zekâ asistanısın. ' +
  'Kullanıcının dilinde (varsayılan Türkçe) kısa, net ve yardımcı yanıtlar ver. ' +
  'Sunum, belge, tablo ve web sitesi taslakları için yapılandırılmış Markdown kullan.';

function chatEnabled(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

/** Lets the client know whether real generation is available (runtime env, not build-time). */
export async function GET() {
  return NextResponse.json({ enabled: chatEnabled() });
}

function parseMessages(body: unknown): ModelMessage[] | null {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_MESSAGES);
  const messages: ModelMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim();
    if (!text || text.length > MAX_CHARS) return null;
    messages.push({ role, content: text });
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') return null;
  return messages;
}

export async function POST(request: Request) {
  if (!chatEnabled()) {
    return NextResponse.json({ error: 'chat_disabled' }, { status: 503 });
  }

  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const messages = parseMessages(body);
  if (!messages) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Count only well-formed requests so malformed ones cannot burn the user's quota.
  const limit = checkRateLimit(`chat:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  const result = streamText({
    model: google(process.env.GEMINI_MODEL || 'gemini-flash-latest'),
    system: SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 2048,
    abortSignal: request.signal,
    onError: ({ error }) => {
      console.error('[chat] generation failed:', error instanceof Error ? error.message : error);
    },
  });

  // Disable proxy buffering so tokens stream through Traefik/nginx.
  return result.toTextStreamResponse({
    headers: { 'X-Accel-Buffering': 'no', 'Cache-Control': 'no-cache, no-transform' },
  });
}
