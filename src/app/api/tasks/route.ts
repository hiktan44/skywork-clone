import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getPool } from '@/lib/pool';
import { getSessionUser } from '@/lib/auth';
import { parseTaskInput, TASK_COLUMNS } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

function errorResponse(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  console.error('[tasks]', message);
  return NextResponse.json({ error: 'server_error' }, { status: 500 });
}

/** Lists the signed-in user's tasks; anonymous visitors get an empty list. */
export async function GET(request: Request) {
  try {
    const pool = getPool();
    if (!pool) return NextResponse.json({ error: 'database_unavailable' }, { status: 503 });
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ tasks: [], signedIn: false });

    const result = await pool.query(
      `SELECT ${TASK_COLUMNS} FROM "ScheduledTask" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [user.id]
    );
    return NextResponse.json({ tasks: result.rows, signedIn: true });
  } catch (e: unknown) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const pool = getPool();
    if (!pool) return NextResponse.json({ error: 'database_unavailable' }, { status: 503 });
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }
    const parsed = parseTaskInput(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { name, cron, module, prompt } = parsed.value;
    const result = await pool.query(
      `INSERT INTO "ScheduledTask" ("id", "userId", "name", "cron", "module", "prompt", "active")
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING ${TASK_COLUMNS}`,
      [randomUUID(), user.id, name, cron, module, prompt]
    );
    return NextResponse.json({ task: result.rows[0] }, { status: 201 });
  } catch (e: unknown) {
    return errorResponse(e);
  }
}
