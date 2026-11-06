import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getPool } from '@/lib/pool';
import { loadOwnedProject } from '@/lib/my-projects';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const ERRORS = { 401: 'unauthorized', 404: 'not_found', 503: 'database_unavailable' } as const;

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const result = await loadOwnedProject(request, id);
  if ('status' in result) return NextResponse.json({ error: ERRORS[result.status] }, { status: result.status });
  return NextResponse.json({ project: result.project });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const pool = getPool();
  if (!pool) return NextResponse.json({ error: 'database_unavailable' }, { status: 503 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const result = await pool.query(`DELETE FROM "Project" WHERE "id" = $1 AND "userId" = $2`, [id, user.id]);
  if (result.rowCount === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
