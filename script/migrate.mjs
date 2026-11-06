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

    -- Better Auth: reuses "User"; adds its session/account/verification tables.
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;

    -- Generated artifact (slides/document/sheet/website/image/storyboard) for user projects.
    ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "content" JSONB;

    CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMPTZ,
      "refreshTokenExpiresAt" TIMESTAMPTZ,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
    CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
    CREATE INDEX IF NOT EXISTS "Verification_identifier_idx" ON "Verification"("identifier");

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

    -- Showcase content (Kasım 2026): 2 more public projects per type, original SVG covers in /public/covers.
    INSERT INTO "Project" ("id", "userId", "title", "type", "prompt", "isPublic", "thumbnailUrl", "createdAt") VALUES
      ('showcase-slides-pitch', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Fintech Yatırımcı Sunumu', 'SLIDES', 'Ön tohum aşamasındaki bir fintech girişimi için 12 slaytlık yatırımcı sunumu hazırla: problem, çözüm, pazar büyüklüğü, iş modeli, ekip ve yatırım talebi', true, '/covers/slides-2.svg', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
      ('showcase-slides-q3', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Q3 Satış Performansı', 'SLIDES', 'Üçüncü çeyrek satış performansını bölge bazında karşılaştıran, hedef-gerçekleşen grafikleri içeren yönetim sunumu oluştur', true, '/covers/slides-1.svg', CURRENT_TIMESTAMP - INTERVAL '14 hours'),
      ('showcase-document-kvkk', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'KVKK Uyum Kontrol Listesi', 'DOCUMENT', 'Küçük bir e-ticaret şirketi için KVKK uyum kontrol listesi ve aydınlatma metni taslağı hazırla', true, '/covers/document-2.svg', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
      ('showcase-document-plan', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Kafe İş Planı', 'DOCUMENT', 'İzmir''de açılacak üçüncü nesil bir kahve dükkanı için 3 yıllık iş planı ve finansal özet yaz', true, '/covers/document-1.svg', CURRENT_TIMESTAMP - INTERVAL '20 hours'),
      ('showcase-image-social', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Lansman Sosyal Medya Görseli', 'IMAGE', 'Yeni mobil uygulama lansmanı için Instagram ve LinkedIn gönderi görseli tasarla; mor-turuncu palet, sade tipografi', true, '/covers/image-2.svg', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
      ('showcase-image-menu', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Restoran Menü Kartı', 'IMAGE', 'Ege mutfağı sunan bir restoran için A4 menü kartı tasarla: başlangıçlar, ana yemekler, tatlılar', true, '/covers/image-1.svg', CURRENT_TIMESTAMP - INTERVAL '26 hours'),
      ('showcase-sheet-crm', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'B2B Satış Hunisi Tablosu', 'SHEET', 'B2B satış ekibi için aşama, olasılık, beklenen gelir ve sorumlu sütunları olan satış hunisi tablosu oluştur', true, '/covers/sheet-2.svg', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
      ('showcase-sheet-stock', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Stok ve Sipariş Takibi', 'SHEET', 'Küçük bir butik mağaza için ürün, stok adedi, kritik seviye ve tedarikçi bilgisi içeren stok takip tablosu hazırla', true, '/covers/sheet-1.svg', CURRENT_TIMESTAMP - INTERVAL '30 hours'),
      ('showcase-website-clinic', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Diş Kliniği Web Sitesi', 'WEBSITE', 'Bir diş kliniği için hizmetler, doktor kadrosu, online randevu ve iletişim bölümleri olan tek sayfalık web sitesi oluştur', true, '/covers/website-2.svg', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
      ('showcase-website-portfolio', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Mimar Portfolyo Sitesi', 'WEBSITE', 'Serbest çalışan bir iç mimar için proje galerisi, hakkımda ve iletişim sayfaları olan portfolyo sitesi tasarla', true, '/covers/website-1.svg', CURRENT_TIMESTAMP - INTERVAL '34 hours'),
      ('showcase-video-reels', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Ürün Tanıtım Reels', 'VIDEO', 'Akıllı termos için 30 saniyelik dikey tanıtım videosu: sahne planı, seslendirme metni ve altyazılar', true, '/covers/video-2.svg', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
      ('showcase-video-onboarding', (SELECT "id" FROM "User" WHERE "email" = 'demo@skywork.ai'), 'Yeni Çalışan Oryantasyonu', 'VIDEO', 'Yeni işe başlayanlar için şirket kültürünü ve ilk hafta adımlarını anlatan 2 dakikalık oryantasyon videosu senaryosu', true, '/covers/video-1.svg', CURRENT_TIMESTAMP - INTERVAL '38 hours')
    ON CONFLICT ("id") DO NOTHING;

    -- Six more skills (12 total). defaultParams.examplePrompt prefills the chat via "Şablonu kullan".
    INSERT INTO "Skill" ("id", "name", "description", "module", "tags", "sortOrder", "systemPrompt", "defaultParams") VALUES
      ('skill-pitch-deck', 'Yatırımcı Sunumu', 'Girişiminizi problem, çözüm, pazar ve finansal hedeflerle anlatan yatırımcı sunumu hazırlar', 'SLIDES', ARRAY['sunum', 'yatırımcı', 'girişim'], 11, 'Her slaytta net bir başlık, en fazla 4 madde ve konuşmacı notu kullan.', '{"examplePrompt": "SaaS girişimim için 10 slaytlık yatırımcı sunumu hazırla"}'::jsonb),
      ('skill-meeting-notes', 'Toplantı Özeti', 'Toplantı notlarını karar listesi, sorumlular ve tarihli aksiyon maddelerine dönüştürür', 'DOCUMENT', ARRAY['toplantı', 'özet', 'aksiyon'], 12, 'Kararlar, aksiyonlar (sorumlu + tarih) ve açık sorular başlıklarıyla özetle.', '{"examplePrompt": "Şu toplantı notlarını karar ve aksiyon listesine dönüştür: "}'::jsonb),
      ('skill-social-pack', 'Sosyal Medya İçerik Paketi', 'Bir hafta için gönderi metinleri, görsel brifi ve hashtag önerileri üretir', 'IMAGE', ARRAY['sosyal medya', 'içerik', 'görsel'], 21, 'Her gönderi için başlık, metin, görsel brifi ve 5 hashtag öner.', '{"examplePrompt": "Kafem için bir haftalık Instagram içerik paketi hazırla"}'::jsonb),
      ('skill-finance-report', 'Finansal Özet Tablosu', 'Gelir-gider verisinden aylık özet, marj ve trend tablosu çıkarır', 'SHEET', ARRAY['finans', 'tablo', 'rapor'], 31, 'Sonuçları Markdown tablo olarak ver; toplam, marj ve aylık değişim sütunları ekle.', '{"examplePrompt": "Aylık gelir-gider verimden kâr marjı tablosu oluştur"}'::jsonb),
      ('skill-landing-copy', 'Landing Page Metni', 'Ürün açılış sayfası için başlık, fayda maddeleri, SSS ve çağrı metinleri yazar', 'WEBSITE', ARRAY['web sitesi', 'metin', 'dönüşüm'], 41, 'Bölümleri Hero, Faydalar, Nasıl çalışır, SSS ve CTA olarak yapılandır.', '{"examplePrompt": "Online muhasebe uygulamam için landing page metni yaz"}'::jsonb),
      ('skill-video-script', 'Video Senaryosu', 'Kısa video için sahne sahne senaryo, seslendirme ve altyazı metni hazırlar', 'VIDEO', ARRAY['video', 'senaryo', 'reels'], 51, 'Zaman kodlu sahneler, görüntü açıklaması ve seslendirme metni ver.', '{"examplePrompt": "Ürünüm için 30 saniyelik Reels senaryosu yaz"}'::jsonb)
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
