import { randomUUID } from 'node:crypto';
import { Client, type QueryResultRow } from 'pg';

export class TaskStoreError extends Error {}

export async function taskQuery<Row extends QueryResultRow>(sql: string, values: unknown[] = []) {
  if (!process.env.DATABASE_URL) throw new TaskStoreError('Veritabanı yapılandırılmamış.');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    return await client.query<Row>(sql, values);
  } catch {
    throw new TaskStoreError('Görev kayıtlarına erişilemiyor.');
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function googleUser(email: string, name?: string | null, image?: string | null) {
  const normalized = email.toLowerCase();
  const existing = await taskQuery<{id: string; email: string}>(
    'SELECT id, email FROM "User" WHERE LOWER(email) = $1', [normalized]);
  if (existing.rows.length > 1) throw new TaskStoreError('E-posta eşleşmesi belirsiz.');
  if (existing.rows.length === 1) return existing.rows[0];
  const created = await taskQuery<{id: string; email: string}>(
    `INSERT INTO "User" (id,email,name,image,"updatedAt") VALUES ($1,$2,$3,$4,NOW())
     ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id,email`,
    [randomUUID(), normalized, name ?? null, image ?? null]);
  return created.rows[0];
}

export async function currentTaskOwner(id: string, email: string) {
  const user = await taskQuery<{id: string}>(
    'SELECT id FROM "User" WHERE id=$1 AND LOWER(email)=$2', [id, email.toLowerCase()]);
  return user.rows[0] ?? null;
}
