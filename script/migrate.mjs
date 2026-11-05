import pg from "pg";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query("BEGIN");

  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "ProjectType" AS ENUM ('SLIDES', 'DOCUMENT', 'IMAGE', 'SHEET', 'WEBSITE', 'VIDEO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "image" TEXT,
      "plan" "Plan" NOT NULL DEFAULT 'FREE',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "title" TEXT NOT NULL,
      "type" "ProjectType" NOT NULL,
      "outputUrl" TEXT,
      "thumbnailUrl" TEXT,
      "isPublic" BOOLEAN NOT NULL DEFAULT false,
      "prompt" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ScheduledTask" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "name" TEXT NOT NULL,
      "cron" TEXT NOT NULL,
      "module" "ProjectType" NOT NULL,
      "prompt" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "lastRun" TIMESTAMP(3),
      "nextRun" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Skill" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "module" "ProjectType" NOT NULL,
      "systemPrompt" TEXT,
      "defaultParams" JSONB,
      "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");
    CREATE INDEX IF NOT EXISTS "Project_type_idx" ON "Project"("type");
    CREATE INDEX IF NOT EXISTS "Project_isPublic_idx" ON "Project"("isPublic");
    CREATE INDEX IF NOT EXISTS "ScheduledTask_userId_idx" ON "ScheduledTask"("userId");
    CREATE INDEX IF NOT EXISTS "ScheduledTask_active_idx" ON "ScheduledTask"("active");
    CREATE INDEX IF NOT EXISTS "Skill_module_idx" ON "Skill"("module");
    CREATE INDEX IF NOT EXISTS "Skill_isActive_idx" ON "Skill"("isActive");

    INSERT INTO "User" ("id", "email", "name", "plan")
    VALUES ('demo-user', 'demo@skywork.ai', 'Demo Kullanıcı', 'PRO')
    ON CONFLICT ("email") DO NOTHING;

    INSERT INTO "Project" ("id", "userId", "title", "type", "prompt", "isPublic") VALUES
      ('demo-project-slides', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Kahve Kafe Sunumu', 'SLIDES', 'Bir kahve kafe için sunum oluştur', true),
      ('demo-project-document', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Pazar Analizi Raporu', 'DOCUMENT', 'Q4 pazar analizi raporu', true),
      ('demo-project-image', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Ürün Tanıtım Görseli', 'IMAGE', 'Modern ürün tanıtım görseli', true),
      ('demo-project-sheet', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Bütçe Tablosu', 'SHEET', 'Aylık bütçe takip tablosu', true),
      ('demo-project-website', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Landing Page', 'WEBSITE', 'SaaS ürün landing page', true),
      ('demo-project-video', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Tutorial Videosu', 'VIDEO', 'Ürün kullanım tutorial', true)
    ON CONFLICT ("id") DO NOTHING;

    INSERT INTO "Skill" ("id", "name", "description", "module", "tags", "sortOrder") VALUES
      ('demo-skill-document', 'Profesyonel Belge Oluşturucu', 'Profesyonel belgeler, raporlar ve makaleler oluşturur', 'DOCUMENT', ARRAY['belge', 'rapor'], 1),
      ('demo-skill-slides', 'Sunum Oluşturucu', 'Anlatıları profesyonel slaytlara dönüştürür', 'SLIDES', ARRAY['sunum', 'slayt'], 10),
      ('demo-skill-image', 'Görsel Oluşturucu', 'Metinden görsel taslakları oluşturur', 'IMAGE', ARRAY['görsel', 'tasarım'], 20),
      ('demo-skill-sheet', 'Veri Analizi ve Tablo', 'Ham veriyi düzenli tablolara dönüştürür', 'SHEET', ARRAY['tablo', 'veri'], 30),
      ('demo-skill-website', 'Web Sitesi Oluşturucu', 'Doğal dil ile web sitesi taslakları oluşturur', 'WEBSITE', ARRAY['web sitesi', 'landing page'], 40),
      ('demo-skill-video', 'Video Planlayıcı', 'Storyboard ve montaj planlaması yapar', 'VIDEO', ARRAY['video', 'storyboard'], 50)
    ON CONFLICT ("id") DO NOTHING;
  `);

  await client.query("COMMIT");
  console.log("Database schema is ready");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Database migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
