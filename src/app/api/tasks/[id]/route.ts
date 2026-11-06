import { NextResponse } from 'next/server';
import { getPool } from '@/lib/pool';
import { getSessionUser } from '@/lib/auth';
import { TASK_COLUMNS } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

function errorResponse(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  console.error('[tasks/:id]', message);
  return NextResponse.json({ error: 'server_error' }, { status: 500 });
}

/** Toggles `active` on one of the signed-in user's tasks. */
export async function PATCH(request: Request, ctx: Ctx) {
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
    const active = (body as { active?: unknown } | null)?.active;
    if (typeof active !== 'boolean') return NextResponse.json({ error: 'invalid_request' }, { status: 400 });

    const { id } = await ctx.params;
    const result = await pool.query(
      `UPDATE "ScheduledTask" SET "active" = $1, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $2 AND "userId" = $3
       RETURNING ${TASK_COLUMNS}`,
      [active, id, user.id]
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ task: result.rows[0] });
  } catch (e: unknown) {
    return errorResponse(e);
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const pool = getPool();
    if (!pool) return NextResponse.json({ error: 'database_unavailable' }, { status: 503 });
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { id } = await ctx.params;
    const result = await pool.query(`DELETE FROM "ScheduledTask" WHERE "id" = $1 AND "userId" = $2`, [id, user.id]);
    if (result.rowCount === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    return errorResponse(e);
  }
}
