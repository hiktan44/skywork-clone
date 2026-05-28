import { NextResponse } from 'next/server'

const DATABASE_URL = process.env.DATABASE_URL

async function rawQuery(sql: string, params?: any[]) {
  const { Client } = await import('pg')
  const client = new Client(DATABASE_URL)
  await client.connect()
  try {
    const result = await client.query(sql, params)
    return result
  } finally {
    await client.end()
  }
}

export async function GET() {
  if (!DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }

  const logs: string[] = []

  try {
    logs.push('Creating enums...')
    await rawQuery(`CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');`)
    logs.push('✓ Plan enum created')
  } catch (e: any) {
    logs.push(`Plan enum: ${e.message}`)
  }

  try {
    await rawQuery(`CREATE TYPE "ProjectType" AS ENUM ('SLIDES', 'DOCUMENT', 'IMAGE', 'SHEET', 'WEBSITE', 'VIDEO');`)
    logs.push('✓ ProjectType enum created')
  } catch (e: any) {
    logs.push(`ProjectType enum: ${e.message}`)
  }

  try {
    logs.push('Creating tables...')
    await rawQuery(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "image" TEXT,
        "plan" "Plan" NOT NULL DEFAULT 'FREE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await rawQuery(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "type" "ProjectType" NOT NULL,
        "outputUrl" TEXT,
        "thumbnailUrl" TEXT,
        "isPublic" BOOLEAN NOT NULL DEFAULT false,
        "prompt" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await rawQuery(`
      CREATE TABLE IF NOT EXISTS "ScheduledTask" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL,
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
    `)

    await rawQuery(`
      CREATE TABLE IF NOT EXISTS "Skill" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "module" "ProjectType" NOT NULL,
        "systemPrompt" TEXT,
        "defaultParams" JSONB,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    logs.push('✓ Tables created')

    logs.push('Creating indexes...')
    await rawQuery(`CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");`)
    await rawQuery(`CREATE INDEX IF NOT EXISTS "Project_type_idx" ON "Project"("type");`)
    await rawQuery(`CREATE INDEX IF NOT EXISTS "Project_isPublic_idx" ON "Project"("isPublic");`)
    await rawQuery(`CREATE INDEX IF NOT EXISTS "ScheduledTask_userId_idx" ON "ScheduledTask"("userId");`)
    await rawQuery(`CREATE INDEX IF NOT EXISTS "ScheduledTask_active_idx" ON "ScheduledTask"("active");`)
    await rawQuery(`CREATE INDEX IF NOT EXISTS "Skill_module_idx" ON "Skill"("module");`)
    await rawQuery(`CREATE INDEX IF NOT EXISTS "Skill_isActive_idx" ON "Skill"("isActive");`)

    await rawQuery(`ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`)
    await rawQuery(`ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`)
    logs.push('✓ Indexes and foreign keys created')

  } catch (e: any) {
    if (e.message.includes('already exists')) {
      logs.push('Tables/indexes already exist, continuing...')
    } else {
      logs.push(`Table creation note: ${e.message}`)
    }
  }

  try {
    logs.push('Seeding data...')

    const userResult = await rawQuery(
      `INSERT INTO "User" ("email", "name", "plan") VALUES ($1, $2, $3) ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name" RETURNING "id"`,
      ['demo@skywork.ai', 'Demo Kullanıcı', 'PRO']
    )
    const userId = userResult.rows[0].id
    logs.push(`✓ User created/found: ${userId}`)

    const projects = [
      { title: 'Kahve Kafe Sunumu', type: 'SLIDES', prompt: 'Bir kahve kafe için sunum oluştur', isPublic: true },
      { title: 'Pazar Analizi Raporu', type: 'DOCUMENT', prompt: 'Q4 pazar analizi raporu', isPublic: true },
      { title: 'Ürün Tanıtım Görseli', type: 'IMAGE', prompt: 'Modern ürün tanıtım görseli', isPublic: true },
      { title: 'Bütçe Tablosu', type: 'SHEET', prompt: 'Aylık bütçe takip tablosu', isPublic: true },
      { title: 'Landing Page', type: 'WEBSITE', prompt: 'SaaS ürün landing page', isPublic: true },
      { title: 'Tutorial Videosu', type: 'VIDEO', prompt: 'Ürün kullanım tutorial', isPublic: true },
      { title: 'Q2 Sunumu', type: 'SLIDES', prompt: 'İkinci çeyrek sunumu', isPublic: true },
      { title: 'Blog Yazısı', type: 'DOCUMENT', prompt: 'AI trendleri blog yazısı', isPublic: true },
      { title: 'Sosyal Medya Görseli', type: 'IMAGE', prompt: 'Instagram gönderi tasarımı', isPublic: true },
      { title: 'CRM Tablosu', type: 'SHEET', prompt: 'Müşteri ilişkileri yönetim tablosu', isPublic: true },
      { title: 'E-Ticaret Sitesi', type: 'WEBSITE', prompt: 'Online mağaza web sitesi', isPublic: true },
      { title: 'Ürün Tanıtım Filmi', type: 'VIDEO', prompt: '30 saniyelik ürün reklam videosu', isPublic: true },
      { title: 'Şirket Sunumu', type: 'SLIDES', prompt: 'Kurumsal tanıtım sunumu', isPublic: false },
      { title: 'Teknik Dokümantasyon', type: 'DOCUMENT', prompt: 'API dokümantasyonu', isPublic: false },
      { title: 'Logo Tasarımı', type: 'IMAGE', prompt: 'Minimalist logo konsepti', isPublic: true },
      { title: 'Finansal Rapor', type: 'SHEET', prompt: 'Çeyreklik finansal özet', isPublic: false },
      { title: 'Blog Sitesi', type: 'WEBSITE', prompt: 'Kişisel blog web sitesi', isPublic: true },
      { title: 'Eğitim Videosu', type: 'VIDEO', prompt: 'Yazılım eğitim serisi', isPublic: true },
      { title: 'Strateji Sunumu', type: 'SLIDES', prompt: 'Yıllık strateji planı sunumu', isPublic: false },
      { title: 'İş Planı', type: 'DOCUMENT', prompt: 'Girişim iş planı', isPublic: true },
    ]

    let projectCount = 0
    for (const p of projects) {
      await rawQuery(
        `INSERT INTO "Project" ("userId", "title", "type", "prompt", "isPublic") VALUES ($1, $2, $3::"ProjectType", $4, $5) ON CONFLICT DO NOTHING`,
        [userId, p.title, p.type, p.prompt, p.isPublic]
      )
      projectCount++
    }
    logs.push(`✓ ${projectCount} projects seeded`)

    const tasks = [
      { name: 'Pazartesi Pazar Raporu', cron: '0 9 * * 1', module: 'DOCUMENT', prompt: 'Haftalık pazar analizi raporu oluştur', active: true },
      { name: 'Aylık Bütçe Kontrolü', cron: '0 10 1 * *', module: 'SHEET', prompt: 'Aylık bütçe durumunu özetle', active: true },
      { name: 'Günlük Görsel Üretimi', cron: '0 8 * * *', module: 'IMAGE', prompt: 'Günün trend konusu için sosyal medya görseli üret', active: true },
      { name: 'Haftalık Bülten', cron: '0 14 * * 5', module: 'DOCUMENT', prompt: 'Haftalık şirket bülteni hazırla', active: false },
      { name: 'Aylık Video Özeti', cron: '0 11 1 * *', module: 'VIDEO', prompt: 'Bir önceki ayın en önemli olaylarını özetleyen video planla', active: true },
    ]

    let taskCount = 0
    for (const t of tasks) {
      await rawQuery(
        `INSERT INTO "ScheduledTask" ("userId", "name", "cron", "module", "prompt", "active", "nextRun") VALUES ($1, $2, $3, $4::"ProjectType", $5, $6, NOW() + interval '1 day') ON CONFLICT DO NOTHING`,
        [userId, t.name, t.cron, t.module, t.prompt, t.active]
      )
      taskCount++
    }
    logs.push(`✓ ${taskCount} scheduled tasks seeded`)

    const skills = [
      { name: 'Genel Asistan', description: 'Çok adımlı görevleri yönetebilen genel çalışma alanı asistanı', module: 'DOCUMENT', tags: ['genel', 'asistan', 'çok adımlı'], systemPrompt: 'Sen genel amaçlı bir AI asistanısın. Kullanıcının tüm görevlerinde yardımcı ol.', sortOrder: 0 },
      { name: 'Profesyonel Belge Oluşturucu', description: 'Derin analiz ile profesyonel belgeler, raporlar ve makaleler oluşturur', module: 'DOCUMENT', tags: ['belge', 'rapor', 'profesyonel', 'makale'], systemPrompt: 'Profesyonel belgeler oluştur. Resmi dil kullan, yapılandırılmış format tercih et.', sortOrder: 1 },
      { name: 'SEO Blog Yazısı', description: 'SEO uyumlu, anahtar kelime optimize edilmiş blog yazıları', module: 'DOCUMENT', tags: ['seo', 'blog', 'içerik', 'anahtar kelime'], systemPrompt: 'SEO uyumlu blog yazıları oluştur. Başlık, meta açıklama, H2/H3 başlıkları ve iç bağlantı önerileri ekle.', sortOrder: 2 },
      { name: 'Teknik Dokümantasyon', description: 'API dokümantasyonu, kullanıcı kılavuzu ve teknik spesifikasyon', module: 'DOCUMENT', tags: ['teknik', 'dokümantasyon', 'API', 'kılavuz'], systemPrompt: 'Teknik dokümantasyon oluştur. API endpoint tabloları, kod örnekleri ve kullanım kılavuzları ekle.', sortOrder: 3 },
      { name: 'İş Planı Oluşturucu', description: 'Kapsamlı iş planı, pazar analizi ve finansal projeksiyon', module: 'DOCUMENT', tags: ['iş planı', 'pazar analizi', 'finansal', 'girişim'], systemPrompt: 'Detaylı iş planı oluştur. Yönetici özeti, pazar analizi, rekabet avantajı ve finansal projeksiyon ekle.', sortOrder: 4 },
      { name: 'Toplantı Notu ve Özet', description: 'Toplantı tutanakları, karar listesi ve aksiyon maddeleri', module: 'DOCUMENT', tags: ['toplantı', 'not', 'tutanak', 'aksiyon'], systemPrompt: 'Toplantı tutanakları oluştur. Katılımcılar, gündem, kararlar ve aksiyon maddeleri listele.', sortOrder: 5 },
      { name: 'E-posta Kampanya Tasarımı', description: 'E-posta bültenleri ve pazarlama kampanyaları', module: 'DOCUMENT', tags: ['e-posta', 'kampanya', 'pazarlama', 'bülten'], systemPrompt: 'E-posta kampanya içerikleri oluştur. Konu satırı, gövde metni ve CTA butonu önerileri üret.', sortOrder: 6 },
      { name: 'Podcast Üretici', description: 'Otomatik araştırma ve kayıt — tek tıkla podcast içeriği oluşturur', module: 'DOCUMENT', tags: ['podcast', 'ses', 'otomatik araştırma'], systemPrompt: 'Podcast bölümleri için senaryo ve konuşma metinleri oluştur. Doğal ve akıcı bir dil kullan.', sortOrder: 7 },
      { name: 'Sosyal Medya Strateji Belgesi', description: 'Kapsamlı sosyal medya stratejisi ve içerik planı', module: 'DOCUMENT', tags: ['sosyal medya', 'strateji', 'içerik planı', 'pazarlama'], systemPrompt: 'Sosyal medya strateji belgesi oluştur. Hedef kitle analizi, platform stratejisi ve içerik takvimi ekle.', sortOrder: 8 },
      { name: 'Sunum Oluşturucu', description: 'Anlatıları profesyonel slaytlara dönüştürür, PowerPoint ve HTML çıktı üretir', module: 'SLIDES', tags: ['sunum', 'slayt', 'ppt', 'powerpoint'], systemPrompt: 'Etkileyici sunumlar oluştur. Her slayt için başlık, madde işaretleri ve görsel önerisi ver.', sortOrder: 10 },
      { name: 'Pazarlama Pitch Deck', description: 'Yatırımcı sunumu ve pazarlama stratejisi şablonu', module: 'SLIDES', tags: ['pazarlama', 'yatırımcı', 'sunum', 'pitch'], systemPrompt: 'Profesyonel yatırımcı sunumları oluştur. Problem-çözüm-pazar modeli kullan.', sortOrder: 11 },
      { name: 'Eğitim Sunumu', description: 'Eğitim ve öğretim amaçlı interaktif sunum şablonları', module: 'SLIDES', tags: ['eğitim', 'öğretim', 'sunum', 'interaktif'], systemPrompt: 'Eğitim sunumları oluştur. Öğrenme hedefleri, sorular ve etkileşimli öğeler ekle.', sortOrder: 12 },
      { name: 'Görsel Oluşturucu ve Düzenleyici', description: 'Metinden görsel oluşturma, referans tabanlı düzenleme ve iyileştirme', module: 'IMAGE', tags: ['görsel', 'tasarım', 'düzenleme', 'AI görsel'], systemPrompt: 'Yüksek kaliteli görseller oluştur. Detaylı açıklamalardan görsel promptları üret.', sortOrder: 20 },
      { name: 'Kahve Kültürü Posteri', description: 'Kahve kültürü temasında sosyal medya afişi ve poster tasarımı', module: 'IMAGE', tags: ['kahve', 'poster', 'sosyal medya', 'tasarım'], systemPrompt: 'Kahve temalı poster ve sosyal medya görselleri oluştur. Sıcak tonlar ve vintage stil kullan.', sortOrder: 21 },
      { name: 'Ürün Tanıtım Görseli', description: 'E-ticaret ve sosyal medya için ürün tanıtım görselleri', module: 'IMAGE', tags: ['e-ticaret', 'ürün', 'tanıtım', 'sosyal medya'], systemPrompt: 'Ürün tanıtım görselleri oluştur. Temiz arka plan, profesyonel aydınlatma ve marka uyumu.', sortOrder: 22 },
      { name: 'Sosyal Medya İçerik Paketi', description: 'Instagram, Twitter, LinkedIn için içerik takvimi ve görseller', module: 'IMAGE', tags: ['sosyal medya', 'instagram', 'linkedin', 'içerik takvimi'], systemPrompt: 'Sosyal medya içerik paketi oluştur. Platforma uygun boyutlarda görseller ve caption metinleri üret.', sortOrder: 23 },
      { name: 'Restoran Menü Tasarımı', description: 'Restoran ve kafe için profesyonel menü kartı ve fiyat listesi', module: 'IMAGE', tags: ['restoran', 'menü', 'kafe', 'tasarım'], systemPrompt: 'Restoran menü tasarımları oluştur. Kategorilere ayrılmış menü, fiyat listesi ve görsel düzen.', sortOrder: 24 },
      { name: 'İnfografik Oluşturucu', description: 'Verileri görsel infografiklere dönüştürür', module: 'IMAGE', tags: ['infografik', 'veri görselleştirme', 'bilgi grafiği'], systemPrompt: 'Veri odaklı infografikler oluştur. İstatistikleri görsel grafikler ve ikonlarla sun.', sortOrder: 25 },
      { name: 'Logo Konsept Oluşturucu', description: 'Marka kimliği için logo konseptleri ve varyasyonlar', module: 'IMAGE', tags: ['logo', 'marka', 'kimlik', 'tasarım'], systemPrompt: 'Logo konseptleri oluştur. Minimal, modern ve sektör uyumlu tasarımlar üret.', sortOrder: 26 },
      { name: 'Veri Analizi ve Tablo', description: 'Ham veriyi düzenli tablolara ve analitik raporlara dönüştürür', module: 'SHEET', tags: ['tablo', 'veri', 'analiz', 'rapor', 'excel'], systemPrompt: 'Verileri analiz et ve düzenli tablolar oluştur. İstatistiksel özet ve grafik önerileri ekle.', sortOrder: 30 },
      { name: 'Finansal Rapor Oluşturucu', description: 'Çeyreklik ve yıllık finansal raporlar, grafikler ve tablolar', module: 'SHEET', tags: ['finans', 'rapor', 'grafik', 'bütçe'], systemPrompt: 'Finansal raporlar oluştur. Gelir-gider tabloları, nakit akış grafikleri ve KPI özetleri ekle.', sortOrder: 31 },
      { name: 'Proje Yönetim Tablosu', description: 'Gantt şeması, görev takibi ve kaynak planlama tablosu', module: 'SHEET', tags: ['proje yönetimi', 'gantt', 'görev takibi', 'planlama'], systemPrompt: 'Proje yönetim tablosu oluştur. Görev listesi, sorumlular, deadline ve durum takibi ekle.', sortOrder: 32 },
      { name: 'CRM Veri Tablosu', description: 'Müşteri ilişkileri yönetimi için veri tablosu ve analiz', module: 'SHEET', tags: ['CRM', 'müşteri', 'veri', 'analiz'], systemPrompt: 'CRM veri tablosu oluştur. Müşteri listesi, iletişim geçmişi, satış hunisi ve takip tablosu ekle.', sortOrder: 33 },
      { name: 'Anket ve Rapor Oluşturucu', description: 'Anket soruları, veri toplama ve analiz raporu', module: 'SHEET', tags: ['anket', 'veri toplama', 'rapor', 'istatistik'], systemPrompt: 'Anket soruları ve analiz raporu oluştur. Çoktan seçmeli sorular, grafikler ve istatistiksel özet ekle.', sortOrder: 34 },
      { name: 'Web Sitesi Oluşturucu', description: 'Doğal dil ile tam kapsamlı web siteleri oluşturur ve canlı ön izleme sunar', module: 'WEBSITE', tags: ['web sitesi', 'landing page', 'full-stack'], systemPrompt: 'Modern, responsive web siteleri oluştur. Tailwind CSS ve Next.js standartlarına uygun kod yaz.', sortOrder: 40 },
      { name: 'Portfolio Web Sitesi', description: 'Kişisel veya kurumsal portfolio sitesi şablonu', module: 'WEBSITE', tags: ['portfolio', 'kişisel', 'web sitesi', 'şablon'], systemPrompt: 'Modern portfolio web sitesi oluştur. Hakkında, projeler, beceriler ve iletişim bölümleri ekle.', sortOrder: 41 },
      { name: 'E-Ticaret Ürün Sayfası', description: 'Ürün detay sayfası tasarımı ve açıklama metni oluşturma', module: 'WEBSITE', tags: ['e-ticaret', 'ürün sayfası', 'sepette', 'dönüşüm'], systemPrompt: 'E-ticaret ürün sayfası oluştur. Ürün açıklaması, özellikler tablosu, yorumlar ve CTA butonları ekle.', sortOrder: 42 },
      { name: 'MVC Web Uygulama Şablonu', description: 'Model-View-Controller mimarisinde web uygulama iskeleti', module: 'WEBSITE', tags: ['MVC', 'web uygulama', 'şablon', 'full-stack'], systemPrompt: 'MVC mimarisinde web uygulama şablonu oluştur. Kullanıcı kimlik doğrulama, CRUD işlemleri ve dashboard ekle.', sortOrder: 43 },
      { name: 'Video Planlayıcı', description: 'Görselden videoya dönüşüm, storyboard ve montaj planlaması yapar', module: 'VIDEO', tags: ['video', 'storyboard', 'montaj', 'görselden videoya'], systemPrompt: 'Video storyboard ve senaryolar oluştur. Sahne açıklamaları, kamera açıları ve süre notları ekle.', sortOrder: 50 },
      { name: 'YouTube Video Planlayıcı', description: 'YouTube video konsepti, senaryo ve thumbnail tasarımı', module: 'VIDEO', tags: ['youtube', 'video', 'senaryo', 'thumbnail'], systemPrompt: 'YouTube video planı oluştur. Video başlığı, açıklama, etiketler, senaryo ve thumbnail önerisi üret.', sortOrder: 51 },
    ]

    let skillCount = 0
    for (const s of skills) {
      await rawQuery(
        `INSERT INTO "Skill" ("name", "description", "module", "systemPrompt", "tags", "sortOrder") VALUES ($1, $2, $3::"ProjectType", $4, $5, $6) ON CONFLICT DO NOTHING`,
        [s.name, s.description, s.module, s.systemPrompt, s.tags, s.sortOrder]
      )
      skillCount++
    }
    logs.push(`✓ ${skillCount} skills seeded`)

    const counts = await rawQuery(`
      SELECT
        (SELECT COUNT(*) FROM "User") as users,
        (SELECT COUNT(*) FROM "Project") as projects,
        (SELECT COUNT(*) FROM "ScheduledTask") as tasks,
        (SELECT COUNT(*) FROM "Skill") as skills
    `)

    logs.push(`---`)
    logs.push(`Database summary:`)
    logs.push(`  Users: ${counts.rows[0].users}`)
    logs.push(`  Projects: ${counts.rows[0].projects}`)
    logs.push(`  Scheduled Tasks: ${counts.rows[0].tasks}`)
    logs.push(`  Skills: ${counts.rows[0].skills}`)
    logs.push('✅ Database setup complete!')

    return NextResponse.json({ success: true, logs })

  } catch (e: any) {
    logs.push(`❌ Seed error: ${e.message}`)
    return NextResponse.json({ success: false, logs, error: e.message }, { status: 500 })
  }
}
