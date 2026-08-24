'use client';

import { useLang, pickByLang } from './use-lang';

export type Translations = {
  [key: string]: string | Translations;
};

// Comprehensive translation dictionary
export const DICT: Translations = {
  // Navigation
  nav: {
    home: {
      en: 'Home',
      tr: 'Ana Sayfa',
    },
    new: {
      en: 'New Projects',
      tr: 'Yeni Projeler',
    },
    skills: {
      en: 'Explore Skills',
      tr: 'Yetenekleri Keşfet',
    },
    projects: {
      en: 'Projects',
      tr: 'Projeler',
    },
    scheduled: {
      en: 'Scheduled Tasks',
      tr: 'Zamanlanmış Görevler',
    },
    showcase: {
      en: 'Showcase',
      tr: 'Vitrin',
    },
    connect: {
      en: 'Connect IM channel',
      tr: 'IM kanalına bağlan',
    },
    search: {
      en: 'Search',
      tr: 'Ara',
    },
    help: {
      en: 'Help',
      tr: 'Yardım',
    },
    desktopView: {
      en: 'Desktop View',
      tr: 'Masaüstü Görünümü',
    },
    tabletView: {
      en: 'Tablet View',
      tr: 'Tablet Görünümü',
    },
  },

  // Authentication
  auth: {
    signIn: {
      en: 'Sign in / Sign up',
      tr: 'Giriş Yap / Kayıt Ol',
    },
    signInDesc: {
      en: 'Access your account or create a new one',
      tr: 'Hesabınıza erişin veya yeni hesap oluşturun',
    },
    continueWith: {
      en: 'Continue with',
      tr: 'ile devam et',
    },
    terms: {
      en: 'By continuing, you accept our terms of service',
      tr: 'Devam ederek kullanım şartlarımızı kabul etmiş olursunuz',
    },
    notLoggedIn: {
      en: 'Not logged in',
      tr: 'Giriş yapılmadı',
    },
  },

  // Dashboard
  dashboard: {
    trending: {
      en: 'Trending Projects',
      tr: 'Trend Projeler',
    },
    loading: {
      en: 'Loading...',
      tr: 'Yükleniyor...',
    },
    noProjects: {
      en: 'No projects yet',
      tr: 'Henüz proje yok',
    },
  },

  // Chat Input
  chat: {
    greeting: {
      en: "Hi, I'm SkyClaw",
      tr: 'Merhaba, ben SkyClaw',
    },
    subtitle: {
      en: 'Always here to help you get things done',
      tr: 'Size işleri halletmenizde her zaman yardımcı olurum',
    },
    placeholder: {
      en: 'Try tasks, workflows, or rescheduling tasks — type @ to add files or skills',
      tr: 'Görevleri, iş akışlarını veya yeniden planlamayı deneyin — dosya veya yetenek eklemek için @ yazın',
    },
    connectTools: {
      en: 'Connect Tools',
      tr: 'Araçları Bağla',
    },
    skills: {
      en: 'Skills',
      tr: 'Yetenekler',
    },
    autoModel: {
      en: 'Auto Model',
      tr: 'Otomatik Model',
    },
  },

  // Quick Actions
  quickActions: {
    slides: {
      en: 'Slides',
      tr: 'Slaytlar',
    },
    documents: {
      en: 'Documents',
      tr: 'Belgeler',
    },
    images: {
      en: 'Images',
      tr: 'Görseller',
    },
    sheets: {
      en: 'Sheets',
      tr: 'Tablolar',
    },
    websites: {
      en: 'Websites',
      tr: 'Web Siteleri',
    },
    videos: {
      en: 'Videos',
      tr: 'Videolar',
    },
    allSkills: {
      en: 'All Skills',
      tr: 'Tüm Yetenekler',
    },
  },

  // Skills Page
  skills: {
    title: {
      en: 'Explore Skills',
      tr: 'Yetenekleri Keşfet',
    },
    description: {
      en: 'Discover and use ready-made AI workflow templates',
      tr: 'Hazır AI iş akışı şablonlarını keşfedin ve kullanın',
    },
    useTemplate: {
      en: 'Use Template',
      tr: 'Şablonu Kullan',
    },
  },

  // Showcase Page
  showcase: {
    title: {
      en: 'Showcase',
      tr: 'Vitrin',
    },
    description: {
      en: 'Best projects created by the community',
      tr: 'Topluluk tarafından oluşturulan en iyi projeler',
    },
  },

  // Scheduled Tasks
  tasks: {
    title: {
      en: 'Scheduled Tasks',
      tr: 'Zamanlanmış Görevler',
    },
    description: {
      en: 'Plan automated workflows with AI',
      tr: 'AI ile otomatik iş akışları planlayın',
    },
    new: {
      en: 'New Task',
      tr: 'Yeni Görev',
    },
    active: {
      en: 'Active',
      tr: 'Aktif',
    },
    passive: {
      en: 'Passive',
      tr: 'Pasif',
    },
    cron: {
      en: 'Cron',
      tr: 'Cron',
    },
    module: {
      en: 'Module',
      tr: 'Modül',
    },
    prompt: {
      en: 'Prompt',
      tr: 'Prompt',
    },
    nextRun: {
      en: 'Next run',
      tr: 'Sonraki çalışma',
    },
    newTaskTitle: {
      en: 'New Scheduled Task',
      tr: 'Yeni Zamanlanmış Görev',
    },
    taskName: {
      en: 'Task Name',
      tr: 'Görev Adı',
    },
    cronExpression: {
      en: 'Cron Expression',
      tr: 'Cron İfadesi',
    },
    taskDescription: {
      en: 'Task description',
      tr: 'Görev açıklaması',
    },
    cancel: {
      en: 'Cancel',
      tr: 'İptal',
    },
    create: {
      en: 'Create',
      tr: 'Oluştur',
    },
    placeholderName: {
      en: 'Ex: Monday Market Report',
      tr: 'Örn: Pazartesi Pazar Raporu',
    },
    placeholderCron: {
      en: 'Ex: 0 9 * * 1 (Every Monday 09:00)',
      tr: 'Örn: 0 9 * * 1 (Her Pazartesi 09:00)',
    },
  },

  // Announcement Modal
  announcement: {
    features: {
      en: 'New Features!',
      tr: 'Yeni Özellikler!',
    },
    toolsDesc: {
      en: 'Powerful AI tools to help you work more efficiently',
      tr: 'Daha verimli çalışmanızı sağlayan güçlü AI araçları',
    },
    automate: {
      en: 'Automate Your Workflow',
      tr: 'İş Akışınızı Otomatize Edin',
    },
    aiNote: {
      en: 'Automatically take notes in your meetings with AI Note Taker',
      tr: 'AI Note Taker ile toplantılarınızı otomatik olarak not alın',
    },
    scheduledTasks: {
      en: 'Schedule periodic tasks with Scheduled Tasks',
      tr: 'Scheduled Tasks ile periyodik görevleri planlayın',
    },
    imIntegration: {
      en: 'Connect your favorite messaging apps with IM integration',
      tr: 'IM entegrasyonu ile favori mesajlaşma uygulamalarınızı bağlayın',
    },
    close: {
      en: 'Close',
      tr: 'Kapat',
    },
    tryFree: {
      en: 'Try Free',
      tr: 'Ücretsiz Dene',
    },
    limitedOffer: {
      en: 'Limited Time Offer',
      tr: 'Sınırlı Süreli Teklif',
    },
    newBadge: {
      en: 'New · AI Note Taker',
      tr: 'Yeni · AI Not Alıcı',
    },
  },

  // Common
  common: {
    loading: {
      en: 'Loading...',
      tr: 'Yükleniyor...',
    },
    new: {
      en: 'New',
      tr: 'Yeni',
    },
  },
};

// Get translation by key with dot notation
export function t(key: string, lang: 'tr' | 'en' = 'tr', vars?: Record<string, string>): string {
  if (!lang || (lang !== 'tr' && lang !== 'en')) {
    lang = 'tr'; // Default fallback
  }

  const keys = key.split('.');
  let value: any = DICT;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key if translation missing
    }
  }

  // Handle nested objects - if we get a nested object, try to get the language-specific value
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('tr' in value && 'en' in value) {
      value = lang === 'tr' ? value.tr : value.en;
    } else {
      console.warn(`Translation value is a nested object without language keys: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}, got: ${typeof value}`);
    return key;
  }

  let result = value;

  // Replace variables if provided
  if (vars) {
    Object.entries(vars).forEach(([varKey, varValue]) => {
      result = result.replace(`{{${varKey}}}`, varValue);
    });
  }

  return result;
}

// Hook to use translation with current language
export function useT() {
  const [lang] = useLang();
  
  return (key: string, vars?: Record<string, string>) => t(key, lang, vars);
}

// Helper to pick value based on language
export { pickByLang };