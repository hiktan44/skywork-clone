import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getPool } from '@/lib/pool';

export const dynamic = 'force-dynamic';

/** The signed-in user's generated projects (newest first). */
export async function GET(request: Request) {
  const pool = getPool();
  if (!pool) return NextResponse.json({ error: 'database_unavailable' }, { status: 503 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ projects: [], signedIn: false });
  try {
    const result = await pool.query(
      `SELECT id, title, type, prompt, "createdAt", ("content" IS NOT NULL) AS "hasContent"
       FROM "Project" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 200`,
      [user.id]
    );
    return NextResponse.json({ projects: result.rows, signedIn: true });
  } catch (e: unknown) {
    console.error('[my-projects]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
