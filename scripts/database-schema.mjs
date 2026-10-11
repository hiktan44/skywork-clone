// Bu modül yalnız yetkili CLI ve izole PostgreSQL testlerinden çağrılır.
export async function setupSchema(client, { schema = 'public' } = {}) {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Geçersiz şema adı.');
  await client.query('BEGIN');
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query(`SET LOCAL search_path TO "${schema}", pg_catalog`);
    await client.query(`DO $setup$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE t.typname='Plan' AND n.nspname=current_schema()) THEN
          CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE t.typname='ProjectType' AND n.nspname=current_schema()) THEN
          CREATE TYPE "ProjectType" AS ENUM ('SLIDES', 'DOCUMENT', 'IMAGE', 'SHEET', 'WEBSITE', 'VIDEO');
        END IF;
      END $setup$;`);
    await client.query(`CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT, image TEXT,
      plan "Plan" NOT NULL DEFAULT 'FREE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS "Project" (
      id TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      title TEXT NOT NULL, type "ProjectType" NOT NULL, "outputUrl" TEXT, "thumbnailUrl" TEXT,
      "isPublic" BOOLEAN NOT NULL DEFAULT FALSE, prompt TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS "ScheduledTask" (
      id TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      name TEXT NOT NULL, cron TEXT NOT NULL, module "ProjectType" NOT NULL, prompt TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE, "lastRun" TIMESTAMP(3), "nextRun" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS "Skill" (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, module "ProjectType" NOT NULL,
      "systemPrompt" TEXT, "defaultParams" JSONB, tags TEXT[], "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    for (const [table, column] of [['Project', 'userId'], ['Project', 'type'], ['Project', 'isPublic'], ['ScheduledTask', 'userId'], ['ScheduledTask', 'active'], ['Skill', 'module'], ['Skill', 'isActive']]) {
      await client.query(`CREATE INDEX IF NOT EXISTS "${table}_${column}_idx" ON "${table}"("${column}")`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
