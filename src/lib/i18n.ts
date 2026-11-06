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
      en: 'Continue with {{provider}}',
      tr: '{{provider}} ile devam et',
    },
    terms: {
      en: 'By continuing, you accept our terms of service',
      tr: 'Devam ederek kullanım şartlarımızı kabul etmiş olursunuz',
    },
    notLoggedIn: {
      en: 'Not logged in',
      tr: 'Giriş yapılmadı',
    },
    notConfigured: {
      en: 'Sign-in is not configured on this server yet.',
      tr: 'Bu sunucuda giriş henüz yapılandırılmadı.',
    },
    name: {
      en: 'Name',
      tr: 'Ad',
    },
    email: {
      en: 'Email',
      tr: 'E-posta',
    },
    password: {
      en: 'Password (min. 8 characters)',
      tr: 'Şifre (en az 8 karakter)',
    },
    signInAction: {
      en: 'Sign in',
      tr: 'Giriş yap',
    },
    signUpAction: {
      en: 'Create account',
      tr: 'Hesap oluştur',
    },
    toSignUp: {
      en: "Don't have an account? Sign up",
      tr: 'Hesabınız yok mu? Kayıt olun',
    },
    toSignIn: {
      en: 'Already have an account? Sign in',
      tr: 'Zaten hesabınız var mı? Giriş yapın',
    },
    or: {
      en: 'or',
      tr: 'veya',
    },
    signedInAs: {
      en: 'Signed in as',
      tr: 'Giriş yapan',
    },
    signOut: {
      en: 'Sign out',
      tr: 'Çıkış yap',
    },
    account: {
      en: 'Account',
      tr: 'Hesap',
    },
    genericError: {
      en: 'Something went wrong. Please try again.',
      tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    },
  },

  // Dashboard
  dashboard: {
    useAsPrompt: {
      en: 'Use this prompt',
      tr: 'Bu istemi kullan',
    },
    loadError: {
      en: 'Content could not be loaded.',
      tr: 'İçerik yüklenemedi.',
    },
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
    send: {
      en: 'Send',
      tr: 'Gönder',
    },
    signInRequired: {
      en: 'Sign in to chat with SkyClaw.',
      tr: 'SkyClaw ile sohbet etmek için giriş yapın.',
    },
    rateLimited: {
      en: 'You are sending messages too quickly. Please wait a few minutes.',
      tr: 'Çok hızlı mesaj gönderiyorsunuz. Lütfen birkaç dakika bekleyin.',
    },
    error: {
      en: 'The reply could not be generated. Please try again.',
      tr: 'Yanıt üretilemedi. Lütfen tekrar deneyin.',
    },
    thinking: {
      en: 'Thinking…',
      tr: 'Düşünüyor…',
    },
    you: {
      en: 'You',
      tr: 'Siz',
    },
    clear: {
      en: 'New chat',
      tr: 'Yeni sohbet',
    },
    demoNotice: {
      en: 'This is a demo workspace: AI generation is not connected yet, so your request was not processed.',
      tr: 'Bu bir demo çalışma alanı: yapay zekâ üretimi henüz bağlı değil, bu yüzden isteğiniz işlenmedi.',
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
    templatesTitle: {
      en: 'Start with a template',
      tr: 'Bir şablonla başlayın',
    },
    templatesHint: {
      en: 'Add an example task with one click and edit it later.',
      tr: 'Örnek bir görevi tek tıkla ekleyin.',
    },
    addTemplate: {
      en: 'Add',
      tr: 'Ekle',
    },
    deleteTitle: {
      en: 'Delete this task?',
      tr: 'Bu görev silinsin mi?',
    },
    deleteDescription: {
      en: '“{{name}}” will be permanently removed.',
      tr: '“{{name}}” kalıcı olarak silinecek.',
    },
    delete: {
      en: 'Delete',
      tr: 'Sil',
    },
    signInRequired: {
      en: 'Sign in to create and keep your scheduled tasks.',
      tr: 'Zamanlanmış görev oluşturmak ve saklamak için giriş yapın.',
    },
    empty: {
      en: 'No scheduled tasks yet.',
      tr: 'Henüz zamanlanmış görev yok.',
    },
    saveError: {
      en: 'The task could not be saved. Please try again.',
      tr: 'Görev kaydedilemedi. Lütfen tekrar deneyin.',
    },
    invalidCron: {
      en: 'Enter a 5-field cron expression, e.g. 0 9 * * 1',
      tr: '5 alanlı bir cron ifadesi girin, ör. 0 9 * * 1',
    },
    runNote: {
      en: 'Tasks are saved to your account; automatic execution is not enabled yet.',
      tr: 'Görevler hesabınıza kaydedilir; otomatik çalıştırma henüz etkin değil.',
    },
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

  // Project/skill/task module names
  modules: {
    SLIDES: {
      en: 'Slides',
      tr: 'Sunum',
    },
    DOCUMENT: {
      en: 'Document',
      tr: 'Belge',
    },
    IMAGE: {
      en: 'Image',
      tr: 'Görsel',
    },
    SHEET: {
      en: 'Sheet',
      tr: 'Tablo',
    },
    WEBSITE: {
      en: 'Website',
      tr: 'Web Sitesi',
    },
    VIDEO: {
      en: 'Video',
      tr: 'Video',
    },
  },

  // Example scheduled-task templates shown on an empty /scheduled page
  taskTemplates: {
    weeklyReportName: {
      en: 'Monday market report',
      tr: 'Pazartesi pazar raporu',
    },
    weeklyReportPrompt: {
      en: 'Prepare a weekly market and competitor summary report',
      tr: 'Haftalık pazar ve rakip özet raporunu hazırla',
    },
    budgetName: {
      en: 'Monthly budget check',
      tr: 'Aylık bütçe kontrolü',
    },
    budgetPrompt: {
      en: 'Summarise this month’s income, expenses and budget variance in a table',
      tr: 'Bu ayın gelir, gider ve bütçe sapmasını tablo hâlinde özetle',
    },
    socialName: {
      en: 'Daily social post',
      tr: 'Günlük sosyal medya görseli',
    },
    socialPrompt: {
      en: 'Create a social media visual brief for today’s trending topic',
      tr: 'Günün trend konusu için sosyal medya görsel brifi oluştur',
    },
    newsletterName: {
      en: 'Friday newsletter',
      tr: 'Cuma bülteni',
    },
    newsletterPrompt: {
      en: 'Draft the weekly company newsletter with highlights and next week’s plan',
      tr: 'Haftanın öne çıkanları ve gelecek hafta planıyla şirket bültenini hazırla',
    },
    salesDeckName: {
      en: 'Quarterly sales deck',
      tr: 'Çeyreklik satış sunumu',
    },
    salesDeckPrompt: {
      en: 'Build a quarterly sales performance presentation for management',
      tr: 'Yönetim için çeyreklik satış performansı sunumu hazırla',
    },
  },

  // Generation tools selectable from the chat box
  tools: {
    menuTitle: {
      en: 'Tools',
      tr: 'Araçlar',
    },
    chat: {
      en: 'Chat (no tool)',
      tr: 'Sohbet (araçsız)',
    },
    SLIDES: {
      en: 'Presentation (.pptx)',
      tr: 'Sunum (.pptx)',
    },
    DOCUMENT: {
      en: 'Document (.docx)',
      tr: 'Belge (.docx)',
    },
    SHEET: {
      en: 'Spreadsheet (.xlsx)',
      tr: 'Tablo (.xlsx)',
    },
    WEBSITE: {
      en: 'Website (.html)',
      tr: 'Web sitesi (.html)',
    },
    IMAGE: {
      en: 'Image (Gemini)',
      tr: 'Görsel (Gemini)',
    },
    VIDEO: {
      en: 'Video storyboard (.docx)',
      tr: 'Video storyboard (.docx)',
    },
    active: {
      en: 'Tool',
      tr: 'Araç',
    },
    clear: {
      en: 'Remove tool',
      tr: 'Aracı kaldır',
    },
    videoNote: {
      en: 'Real video files are not generated; you get a scene-by-scene storyboard.',
      tr: 'Gerçek video dosyası üretilmez; sahne sahne storyboard hazırlanır.',
    },
  },

  // Artifact generation states
  generate: {
    progress: {
      en: 'Generating… this can take 20–90 seconds.',
      tr: 'Hazırlanıyor… Bu işlem 20–90 saniye sürebilir.',
    },
    signIn: {
      en: 'Sign in to generate files.',
      tr: 'Dosya üretmek için giriş yapın.',
    },
    rate_limited: {
      en: 'Too many generations. Please wait a few minutes.',
      tr: 'Çok fazla üretim isteği. Lütfen birkaç dakika bekleyin.',
    },
    quota_exceeded: {
      en: 'The AI quota is exhausted. Please try again later.',
      tr: 'Yapay zekâ kotası doldu. Lütfen daha sonra tekrar deneyin.',
    },
    image_unavailable: {
      en: 'The image model did not return an image (it may be unsupported or out of quota).',
      tr: 'Görsel modeli bir görsel döndürmedi (model desteklenmiyor ya da kota dolmuş olabilir).',
    },
    invalid_output: {
      en: 'The AI output could not be validated. Please try again.',
      tr: 'Yapay zekâ çıktısı doğrulanamadı. Lütfen tekrar deneyin.',
    },
    failed: {
      en: 'The file could not be generated. Please try again.',
      tr: 'Dosya üretilemedi. Lütfen tekrar deneyin.',
    },
  },

  // Generated projects (Projelerim)
  projects: {
    title: {
      en: 'My Projects',
      tr: 'Projelerim',
    },
    description: {
      en: 'Files you generated with Skywork tools.',
      tr: 'Skywork araçlarıyla ürettiğiniz dosyalar.',
    },
    empty: {
      en: 'You have no generated projects yet. Pick a tool in the chat box to create one.',
      tr: 'Henüz üretilmiş projeniz yok. Sohbet kutusundan bir araç seçerek oluşturun.',
    },
    signIn: {
      en: 'Sign in to see your projects.',
      tr: 'Projelerinizi görmek için giriş yapın.',
    },
    open: {
      en: 'Open',
      tr: 'Aç',
    },
    back: {
      en: 'My Projects',
      tr: 'Projelerim',
    },
    download: {
      en: 'Download',
      tr: 'İndir',
    },
    delete: {
      en: 'Delete',
      tr: 'Sil',
    },
    deleteConfirm: {
      en: 'Delete this project permanently?',
      tr: 'Bu proje kalıcı olarak silinsin mi?',
    },
    notFound: {
      en: 'Project not found.',
      tr: 'Proje bulunamadı.',
    },
    noContent: {
      en: 'This project has no generated file.',
      tr: 'Bu projede üretilmiş bir dosya yok.',
    },
    slide: {
      en: 'Slide',
      tr: 'Slayt',
    },
    prev: {
      en: 'Previous',
      tr: 'Önceki',
    },
    next: {
      en: 'Next',
      tr: 'Sonraki',
    },
    notes: {
      en: 'Speaker notes',
      tr: 'Konuşmacı notu',
    },
    storyboardNotice: {
      en: 'This is a storyboard, not a video file.',
      tr: 'Bu bir video değil, storyboard (sahne planı).',
    },
    websiteNote: {
      en: 'Preview runs in a sandbox with scripts disabled.',
      tr: 'Önizleme, betikler kapalı bir sandbox içinde çalışır.',
    },
    sceneTime: {
      en: 'Time',
      tr: 'Zaman',
    },
    sceneVisual: {
      en: 'Visual',
      tr: 'Görüntü',
    },
    sceneVoice: {
      en: 'Voice-over',
      tr: 'Seslendirme',
    },
    sceneText: {
      en: 'On-screen text',
      tr: 'Ekran yazısı',
    },
  },

  // Better Auth error codes (API + OAuth callback)
  authErrors: {
    INVALID_EMAIL_OR_PASSWORD: {
      en: 'Invalid email or password.',
      tr: 'E-posta veya şifre hatalı.',
    },
    INVALID_EMAIL: {
      en: 'Please enter a valid email address.',
      tr: 'Lütfen geçerli bir e-posta adresi girin.',
    },
    INVALID_PASSWORD: {
      en: 'Invalid password.',
      tr: 'Şifre geçersiz.',
    },
    PASSWORD_TOO_SHORT: {
      en: 'Password must be at least 8 characters.',
      tr: 'Şifre en az 8 karakter olmalı.',
    },
    PASSWORD_TOO_LONG: {
      en: 'Password is too long.',
      tr: 'Şifre çok uzun.',
    },
    USER_ALREADY_EXISTS: {
      en: 'An account with this email already exists.',
      tr: 'Bu e-posta ile kayıtlı bir hesap zaten var.',
    },
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
      en: 'An account with this email already exists.',
      tr: 'Bu e-posta ile kayıtlı bir hesap zaten var.',
    },
    FAILED_TO_CREATE_USER: {
      en: 'Could not create the account. Please try again.',
      tr: 'Hesap oluşturulamadı. Lütfen tekrar deneyin.',
    },
    EMAIL_NOT_VERIFIED: {
      en: 'Your email address is not verified.',
      tr: 'E-posta adresiniz doğrulanmamış.',
    },
    TOO_MANY_REQUESTS: {
      en: 'Too many attempts. Please wait a moment.',
      tr: 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin.',
    },
    account_not_linked: {
      en: 'This email already has a password account. Sign in with your email and password.',
      tr: 'Bu e-posta ile şifreli bir hesap zaten var. Lütfen e-posta ve şifrenizle giriş yapın.',
    },
    access_denied: {
      en: 'Google sign-in was cancelled.',
      tr: 'Google ile giriş iptal edildi.',
    },
    state_mismatch: {
      en: 'Sign-in session expired. Please try again.',
      tr: 'Giriş oturumunun süresi doldu. Lütfen tekrar deneyin.',
    },
    email_not_found: {
      en: 'Your Google account did not share an email address.',
      tr: 'Google hesabınız bir e-posta adresi paylaşmadı.',
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
  let value: unknown = DICT;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key if translation missing
    }
  }

  // Handle nested objects - if we get a nested object, try to get the language-specific value
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('tr' in value && 'en' in value) {
      const langValue = value as Record<'tr' | 'en', unknown>;
      value = lang === 'tr' ? langValue.tr : langValue.en;
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