import { getSessionUser } from '@/lib/auth';
import { getPool } from '@/lib/pool';
import { parseProjectContent, type ProjectContent } from '@/lib/generation/schemas';

export interface OwnedProject {
  id: string;
  title: string;
  type: string;
  prompt: string;
  createdAt: string;
  content: ProjectContent | null;
}

/** Loads a project only if it belongs to the signed-in user; content is re-validated. */
export async function loadOwnedProject(
  request: Request,
  id: string
): Promise<{ status: 401 | 404 | 503 } | { project: OwnedProject }> {
  const pool = getPool();
  if (!pool) return { status: 503 };
  const user = await getSessionUser(request);
  if (!user) return { status: 401 };
  const result = await pool.query(
    `SELECT id, title, type, prompt, "createdAt", "content" FROM "Project" WHERE "id" = $1 AND "userId" = $2`,
    [id, user.id]
  );
  const row = result.rows[0];
  if (!row) return { status: 404 };
  return { project: { ...row, content: parseProjectContent(row.content) } };
}
