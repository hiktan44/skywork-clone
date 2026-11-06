import { Pool } from 'pg';

declare global {
  // Reused across hot reloads and route modules so we keep a single small pool.
  var __skyworkAppPool: Pool | undefined;
}

export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  globalThis.__skyworkAppPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return globalThis.__skyworkAppPool;
}
