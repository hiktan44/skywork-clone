import { PrismaClient, ProjectType, Plan } from '@prisma/client';
import { mockSkills } from '../src/lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  await prisma.user.upsert({
    where: { email: 'demo@skywork.ai' },
    update: {},
    create: {
      email: 'demo@skywork.ai',
      name: 'Demo Kullanıcı',
      plan: Plan.PRO,
    },
  });

  const user = await prisma.user.findUnique({ where: { email: 'demo@skywork.ai' } });
  if (!user) throw new Error('Kullanıcı oluşturulamadı');

  console.log('✅ Demo kullanıcı oluşturuldu');

  const existingSkills = await prisma.skill.count();
  if (existingSkills === 0) {
    for (const skill of mockSkills) {
      await prisma.skill.create({
        data: {
          name: skill.name,
          description: skill.description,
          module: skill.module as ProjectType,
          systemPrompt: skill.systemPrompt || null,
          defaultParams: skill.defaultParams || {},
          tags: skill.tags,
          isActive: true,
          sortOrder: 0,
        },
      });
    }
    console.log(`✅ ${mockSkills.length} skill yüklendi`);
  } else {
    console.log(`⏭️  ${existingSkills} skill zaten mevcut, atlanıyor`);
  }

  const existingProjects = await prisma.project.count();
  if (existingProjects === 0) {
    const projects = [
      { title: 'Kahve Kafe Sunumu', type: ProjectType.SLIDES, prompt: 'Bir kahve kafe için sunum oluştur', isPublic: true },
      { title: 'Pazar Analizi Raporu', type: ProjectType.DOCUMENT, prompt: 'Q4 pazar analizi raporu', isPublic: true },
      { title: 'Ürün Tanıtım Görseli', type: ProjectType.IMAGE, prompt: 'Modern ürün tanıtım görseli', isPublic: true },
      { title: 'Bütçe Tablosu', type: ProjectType.SHEET, prompt: 'Aylık bütçe takip tablosu', isPublic: true },
      { title: 'Landing Page', type: ProjectType.WEBSITE, prompt: 'SaaS ürün landing page', isPublic: true },
      { title: 'Tutorial Videosu', type: ProjectType.VIDEO, prompt: 'Ürün kullanım tutorial', isPublic: true },
      { title: 'Q2 Sunumu', type: ProjectType.SLIDES, prompt: 'İkinci çeyrek sunumu', isPublic: true },
      { title: 'Blog Yazısı', type: ProjectType.DOCUMENT, prompt: 'AI trendleri blog yazısı', isPublic: true },
    ];

    for (const project of projects) {
      await prisma.project.create({
        data: {
          ...project,
          userId: user.id,
        },
      });
    }
    console.log(`✅ ${projects.length} proje oluşturuldu`);
  }

  console.log('🎉 Seed tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
