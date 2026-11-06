import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { APICallError } from 'ai';
import { getSessionUser } from '@/lib/auth';
import { getPool } from '@/lib/pool';
import { isAiEnabled } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { GenerationError, generateArtifact } from '@/lib/generation/generate';
import { isGenerationModule } from '@/lib/generation/schemas';

export const dynamic = 'force-dynamic';
// Long generations (decks, sites) can take a while; self-hosted Node has no platform limit.
export const maxDuration = 300;

const MAX_PROMPT = 4000;
const RATE_LIMIT = 10; // generations
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes per user

function fail(error: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: Request) {
  if (!isAiEnabled()) return fail('ai_disabled', 503);
  const pool = getPool();
  if (!pool) return fail('database_unavailable', 503);

  const user = await getSessionUser(request);
  if (!user) return fail('unauthorized', 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('invalid_request', 400);
  }
  const { module, prompt } = (body ?? {}) as { module?: unknown; prompt?: unknown };
  if (!isGenerationModule(module)) return fail('invalid_module', 400);
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > MAX_PROMPT) return fail('invalid_prompt', 400);

  // Counted only after validation so malformed requests do not burn the quota.
  const limit = checkRateLimit(`generate:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) return fail('rate_limited', 429, { 'Retry-After': String(limit.retryAfterSec) });

  try {
    const artifact = await generateArtifact(module, prompt.trim(), request.signal);
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO "Project" ("id", "userId", "title", "type", "prompt", "isPublic", "content")
       VALUES ($1, $2, $3, $4, $5, false, $6::jsonb)
       RETURNING id, title, type, prompt, "createdAt"`,
      [id, user.id, artifact.title.slice(0, 200), module, prompt.trim(), JSON.stringify(artifact.content)]
    );
    return NextResponse.json({ project: result.rows[0] }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof GenerationError) return fail(e.code, 502);
    if (APICallError.isInstance(e) && e.statusCode === 429) return fail('quota_exceeded', 429);
    if (e instanceof Error && e.name === 'AbortError') return fail('aborted', 499);
    console.error('[generate]', module, e instanceof Error ? `${e.name}: ${e.message}` : e);
    return fail('generation_failed', 502);
  }
}
