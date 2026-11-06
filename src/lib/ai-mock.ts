import { MockLanguageModelV4 } from 'ai/test';
import type { GenerationModule } from '@/lib/generation/schemas';

// Deterministic fixtures used only when SKYWORK_AI_MOCK=1 (local/QA testing without a key).
const usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 50, text: 50, reasoning: 0 },
};
const finishReason = { unified: 'stop' as const, raw: 'STOP' };

const CHAT_REPLY = [
  '## Kahve Dükkânı Açılış Planı',
  '',
  'Bu plan, ilk üç ayda **başabaş noktasına** ulaşmayı hedefler.',
  '',
  '### 1. Konum ve Kira',
  '',
  'Üniversite ve ofis yoğunluğu yüksek bir cadde seçilmelidir. Aylık kira bütçesi 45.000 TL ile sınırlandırılır.',
  '',
  '### 2. Menü',
  '',
  '- Espresso bazlı içecekler',
  '- Demleme kahveler (V60, Chemex)',
  '- Günlük taze tatlılar',
  '',
  '| Kalem | Aylık Gider (TL) |',
  '|---|---|',
  '| Kira | 45.000 |',
  '| Personel | 90.000 |',
  '',
  '<script>alert("xss")</script><b>ham html gösterilmemeli</b>',
].join('\n');

const FIXTURES: Record<GenerationModule, unknown> = {
  SLIDES: {
    title: 'Kahve Dükkânı Yatırımcı Sunumu',
    subtitle: 'Üçüncü nesil kahve, İzmir 2027',
    slides: Array.from({ length: 8 }, (_, i) => ({
      title: ['Problem', 'Çözüm', 'Pazar', 'Ürün', 'İş Modeli', 'Rekabet', 'Finansal Plan', 'Yatırım Talebi'][i],
      bullets: [
        `Madde ${i + 1}.1: İzmir'de nitelikli kahve talebi yılda %18 büyüyor.`,
        `Madde ${i + 1}.2: Hedef kitle 22–40 yaş arası beyaz yakalı çalışanlar.`,
        `Madde ${i + 1}.3: İlk yıl ciro hedefi 4,2 milyon TL.`,
      ],
      notes: `Slayt ${i + 1} için konuşmacı notu: rakamları kaynaklarıyla birlikte anlatın.`,
    })),
  },
  DOCUMENT: {
    title: 'KVKK Uyum Raporu',
    markdown: [
      '# KVKK Uyum Raporu',
      '',
      '## 1. Yönetici Özeti',
      '',
      'Şirketin kişisel veri işleme süreçleri incelenmiş ve **üç kritik** eksik tespit edilmiştir.',
      '',
      '## 2. Bulgular',
      '',
      '### 2.1 Aydınlatma Metni',
      '',
      'Web sitesindeki aydınlatma metni güncel değildir.',
      '',
      '- Veri sorumlusu bilgisi eksik',
      '- Saklama süreleri belirtilmemiş',
      '',
      '| Süreç | Risk | Öncelik |',
      '|---|---|---|',
      '| Üyelik | Yüksek | 1 |',
      '| Bülten | Orta | 2 |',
      '',
      '## 3. Aksiyon Planı',
      '',
      '1. Aydınlatma metnini güncelleyin.',
      '2. Açık rıza formlarını ayırın.',
    ].join('\n'),
  },
  SHEET: {
    title: 'Aylık Bütçe Tablosu',
    columns: ['Ay', 'Gelir (TL)', 'Gider (TL)', 'Kâr (TL)'],
    rows: [
      ['Ocak', 320000, 250000, 70000],
      ['Şubat', 340000, 255000, 85000],
      ['Mart', 365000, 262000, 103000],
    ],
    notes: 'Kâr = Gelir − Gider.',
  },
  WEBSITE: {
    title: 'Diş Kliniği',
    html: '<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Gülüş Diş Kliniği</title><style>body{font-family:system-ui;margin:0}header{background:#4f46e5;color:#fff;padding:48px 24px}section{padding:24px}</style></head><body><header><h1>Gülüş Diş Kliniği</h1><p>Online randevu ile 7/24 hizmet.</p></header><section><h2>Hizmetler</h2><ul><li>İmplant</li><li>Ortodonti</li></ul><button onclick="alert(1)">Randevu</button></section><script>document.body.innerHTML="hacked"</script></body></html>',
  },
  VIDEO: {
    title: 'Akıllı Termos Reels',
    durationSec: 30,
    summary: '30 saniyelik dikey tanıtım videosu için storyboard.',
    scenes: [
      { time: '00:00–00:05', visual: 'Sabah, masada buğulu termos yakın çekim.', voiceover: 'Kahven hep ilk yudumdaki gibi.', onScreenText: '12 saat sıcak' },
      { time: '00:05–00:15', visual: 'Ekranda sıcaklık uygulaması.', voiceover: 'Sıcaklığı telefondan takip et.', onScreenText: 'Akıllı sensör' },
      { time: '00:15–00:30', visual: 'Logo ve indirim kodu.', voiceover: 'Şimdi %20 indirimle.', onScreenText: 'KOD: SICAK20' },
    ],
  },
  IMAGE: {},
};

export function createMockTextModel(mode: GenerationModule | 'CHAT') {
  const text = mode === 'CHAT' ? CHAT_REPLY : JSON.stringify(FIXTURES[mode]);
  return new MockLanguageModelV4({
    provider: 'skywork-mock',
    modelId: `mock-${mode.toLowerCase()}`,
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
      finishReason,
      usage,
      warnings: [],
    }),
    doStream: async () => {
      const parts = text.match(/[\s\S]{1,40}/g) ?? [text];
      return {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({ type: 'stream-start', warnings: [] });
            controller.enqueue({ type: 'text-start', id: 't1' });
            for (const delta of parts) controller.enqueue({ type: 'text-delta', id: 't1', delta });
            controller.enqueue({ type: 'text-end', id: 't1' });
            controller.enqueue({ type: 'finish', finishReason, usage });
            controller.close();
          },
        }),
      };
    },
  });
}

// 1×1 purple PNG.
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export function createMockImageModel() {
  return new MockLanguageModelV4({
    provider: 'skywork-mock',
    modelId: 'mock-image',
    doGenerate: async () => ({
      content: [
        { type: 'text', text: 'Mor tonlarda minimalist ürün görseli.' },
        { type: 'file', mediaType: 'image/png', data: { type: 'data', data: PNG_BASE64 } },
      ],
      finishReason,
      usage,
      warnings: [],
    }),
  });
}
