# Proje Devir Notu

## Son durum

- 5 Kasım 2026'da Coolify deployment `cmemivbboruz7xi1ssp3li4t` tamamlandı ve canlı kabul geçti.
- Canlı `https://skywork.seymata.com/`, `/api/projects`, `/api/skills`, `/api/tasks`, `/manifest.webmanifest` ve `/sw.js` HTTP 200 dönüyor.
- Canlı migration başlangıç verisi doğrulandı: 6 proje ve 6 beceri; planlanmış görev koleksiyonu geçerli biçimde boş.
- Kök neden: Docker başlangıcında veritabanı şeması kurulmamıştı. Ayrıca `/api/setup` tabloları siliyor fakat yeniden oluşturmuyordu.
- `script/migrate.mjs` eklendi. Şemayı ve küçük demo başlangıç verisini transaction içinde, tekrar-safe biçimde kuruyor.
- Docker başlangıcı artık önce migration'ı, başarılı olursa Next.js sunucusunu çalıştırıyor.
- `/api/setup` içindeki yıkıcı DROP işlemleri kaldırıldı ve eksik CREATE TABLE adımları geri getirildi.

## 5 Kasım 2026 — ikinci inceleme ("uygulama çalışmıyor")

- Canlıda çökme yok: `/`, `/api/projects|skills|tasks`, `/skills`, `/manifest.webmanifest`, `/sw.js` HTTP 200; veri geliyor.
- Commit'lenmemiş 13 dosyalık diff yalnızca lint/tip düzeltmesi; regresyon yok (yerel build + start + API 200 doğrulandı).
- Asıl neden: uygulama bir **arayüz demosu**; çekirdek işlevler hiç yazılmamış:
  - `ChatInput`: gönderim/handler yoktu, prompt hiçbir yere gitmiyor. API yalnız `GET` (POST/üretim rotası yok).
  - `QuickActionTabs` butonlarının `onClick`'i yok; sidebar `#` linkleri ve `/?action=new` bir şey yapmıyor.
  - Giriş: `AuthModal` hiç mount edilmiyor; "Giriş Yap" `RightPanel`'i açıyor, sağlayıcı butonları işlevsiz (auth yok).
  - `/scheduled` oluştur/aç-kapat/sil yalnızca istemci state'i (yenileyince kaybolur).
- Bu oturumda yapılan dar düzeltmeler (commit'lenmedi):
  - Chat: Enter/Gönder artık "demo, üretim bağlı değil" uyarısı gösteriyor (sessiz başarısızlık yerine).
  - Giriş paneli dar ekranda içeriği ezmiyor (`mr-[360px]` → `lg:mr-[360px]`, panel `max-w-full`).
  - TR metin: "ile devam et Google" → "Google ile devam et" (`auth.continueWith` değişkenli).
  - Duyuru modalı: çift X kaldırıldı; tarayıcı başına bir kez gösteriliyor (`localStorage`).
- Bekleyen karar (kullanıcı): gerçek üretim hattı (prompt → LLM → çıktı), sağlayıcı/anahtar ve gerçek auth.

## 6 Kasım 2026 — Better Auth girişi (kullanıcı kararı)

- Kullanıcı kararları: giriş = Better Auth; eklentilerden yalnızca "Giriş sistemi"; 4 UI düzeltmesi QA sonrası commit+push. Gemini/AI chat bu turda seçilmedi, uygulanmadı.
- Eklenenler: `src/lib/auth.ts` (lazy init; `BETTER_AUTH_SECRET` yoksa `null`), `src/lib/auth-client.ts`, `/api/auth/[...all]` (yapılandırılmamışsa 503), `/api/auth-config`, `RightPanel` gerçek e-posta giriş/kayıt/çıkış, Navbar kullanıcı adı.
- Şema: Better Auth `"User"` tablosunu kullanır (+`emailVerified`); `Session`/`Account`/`Verification` migrate.mjs'te idempotent. `getMigrations` farkı boş.
- Doğrulandı (yerel): migration 2x, kayıt 200, oturum, çıkış→null, yanlış şifre 401, tekrar kayıt 422, şifre hash'li, UI giriş; secret yokken 503 ve ana sayfa 200.
- Canlıya almadan önce Coolify'da `BETTER_AUTH_SECRET` ve `BETTER_AUTH_URL` girilmeli (Coolify MCP 401, ajan giremiyor). Google/GitHub isteğe bağlı.
- `src/lib/db.ts`: başka bir ajanın bıraktığı, izlenmeyen ve kullanılmayan dosya; dokunulmadı, commit'e alınmayacak.

## 6 Kasım 2026 — Google girişi, Gemini chat, kalıcı görevler (commit'lenmedi)

- Kullanıcı isteği: Google girişi + kalan eksikler. `better-auth-best-practices` skill'i uygulandı.
- Google: `GOOGLE_CLIENT_ID/SECRET` varsa aktif; scope `openid email profile`, `prompt=select_account`,
  PKCE; callback `/api/auth/callback/google`. Hesap bağlama: trustedProviders=google,
  `requireLocalEmailVerified: true` (pre-hijack koruması). `ipAddressHeaders: x-forwarded-for`.
- gcloud ile OAuth istemcisi oluşturulamadı: yerel gcloud token'ı süresi dolmuş (`invalid_grant`),
  ayrıca standart Web OAuth istemcisi/onay ekranı gcloud ile oluşturulamıyor → README'de adım adım talimat.
- Google logosu SVG (`src/components/icons/ProviderIcons.tsx`); giriş hataları `authErrors.*` ile Türkçe;
  OAuth `?error=` panelde gösterilip URL'den temizleniyor (kod store'da).
- Chat: `/api/chat` (AI SDK 7 + `@ai-sdk/google`, `gemini-flash-latest`, `GEMINI_MODEL` ile değişir).
  Anahtar yalnız `GOOGLE_GENERATIVE_AI_API_KEY` env'den. Giriş şartı, 20 istek/10 dk/kullanıcı,
  4000 karakter, son 12 mesaj, `X-Accel-Buffering: no`. Anahtar yoksa GET enabled:false → demo uyarısı.
- Görevler: `/api/tasks` GET/POST, `/api/tasks/[id]` PATCH/DELETE; kullanıcıya özel, cron/modül doğrulamalı.
  Anonim GET `{tasks:[], signedIn:false}`. Otomatik çalıştırıcı yok (UI'da belirtiliyor).
- Duyuru penceresi dar ekranda kenar boşluklu, tek sütun.
- `npm audit`: `npm audit fix` + `next`/`eslint-config-next` 16.2.6→16.4.5 (aynı major). 33→13 bulgu,
  kritik/yüksek 0. Kalan 13 (2 düşük, 11 orta) dev araçları/`shadcn` CLI; düzeltmeleri semver-major.
- Yerel doğrulama: migration 2x; görev CRUD + kullanıcılar arası izolasyon (404); chat 401/400/429,
  akış başlıkları; Google yönlendirme URL'si; tarayıcıda 607px: Google logosu, TR hata mesajları,
  görev kalıcılığı, modal kenar boşluğu. Gerçek Gemini yanıtı test edilmedi (anahtar yok).

## 6 Kasım 2026 — Araçlar gerçek dosya üretiyor (commit'lenmedi)

- Kullanıcı şikâyeti: "Araçları bağla çalışmıyor", çıktı başlıksız/paragrafsız, sunum yerine öneri geliyor.
- `/api/generate` (AI SDK 7 `generateText` + `Output.object` + zod; `generateObject` v7'de deprecated):
  SLIDES/DOCUMENT/SHEET/WEBSITE/VIDEO(storyboard)/IMAGE. Sonuç `"Project"."content"` JSONB (migrate.mjs'te
  `ADD COLUMN IF NOT EXISTS`), `isPublic=false`, kullanıcıya ait. Yükleme/indirme öncesi `parseProjectContent` ile
  yeniden doğrulanıyor. İndirme sunucuda: pptxgenjs / docx / exceljs (hepsi MIT; SheetJS kullanılmadı).
- `/api/my-projects`, `/api/my-projects/[id]` (GET/DELETE), `/[id]/download?format=` — sahibi değilse 404.
- UI: "Araçları Bağla" popover (6 araç + sohbet), seçili araç çipi, hızlı eylem düğmeleri ve beceri şablonları
  aracı seçer; `/projects` ve `/projects/[id]` görüntüleyiciler. Chat yanıtı `components/Markdown.tsx`
  (react-markdown + remark-gfm, `skipHtml`). Sohbet sistem istemi: Türkçe, başlıklı, bitmiş içerik.
- Web sitesi: `sanitizeGeneratedHtml` belgeyi her zaman yeniden kurar (CSP meta tek `<head>`'in başında; `<head>` öncesi
  yük CSP'yi body'ye düşüremez), `[\s/"']on*=` olay öznitelikleri, varlık kodlu `javascript:`/`data:text/html` URL'leri,
  script/iframe/meta http-equiv temizlenir; önizleme `sandbox=""` iframe. QA P2 (`<svg/onload>`, `src=x/onerror`) kapatıldı:
  ham yük tarayıcıda başlığı "PWNED" yaptı, temizlenmiş çıktı yapmadı. Gönderimde `useRef` kilidi (çift tık = tek üretim).
- Hız sınırı: üretim 10/10 dk, doğrulamadan sonra sayılıyor. Chat 20/10 dk aynen.
- `SKYWORK_AI_MOCK=1`: yalnız test, `MockLanguageModelV4` sabit çıktılar (`src/lib/ai-mock.ts`).
- `npm audit`: pptxgenjs → image-size yüksek bulgusu `overrides: image-size ^2.1.0` ile kapatıldı (pptxgenjs
  image-size'ı require etmiyor). Kritik/yüksek 0; uuid (exceljs, buf'suz kullanım) orta olarak kaldı.
- Service worker artık yalnız production'da kaydediliyor; dev'de eski kayıt kaldırılıyor. Neden: cache-first
  SW, `next dev`'de eski chunk'ları sunup sayfayı saniyede ~10 kez yeniden yükleme döngüsüne sokuyordu.
- Yerel doğrulama (mock): 6 modül 201; .pptx (9 slayt, 8 not), .docx (Heading 1–3, tablo), .xlsx (sayısal hücre),
  storyboard .docx, PNG python-pptx/python-docx/openpyxl ile açıldı; HTML'de script/onclick yok; başka kullanıcı
  404; 12 hatalı + 11 geçerli üretim → 10×201 + 429; chat Markdown'da `<script>`/`<b>` öğesi oluşmadı.
- Test aracı kısıtı: vi3ecode tarayıcı paneli `srcdoc`/`blob:` iframe'leri yüklemiyor ve ekran görüntüsünde iframe
  içeriği görünmüyor; önizleme gerçek tarayıcıda (Chrome/Safari/Firefox) kontrol edilmeli.
- Gerçek Gemini çıktısı (özellikle görsel modeli ve uzun web sayfaları) yalnız canlıda doğrulanabilir.

## 6 Kasım 2026 — içerik doldurma + P3 (commit'lenmedi, tek push'a girecek)

- Kullanıcı kararı: önce içerik, sonra tek commit/push; P3'ler bu tura eklendi.
- migrate.mjs: +12 proje (`showcase-*`, her türden 2; toplam 18, her tür 3) ve +6 beceri (`skill-*`; toplam 12),
  `ON CONFLICT ("id") DO NOTHING`. Boş DB ve HEAD şemasından yükseltme ikişer kez doğrulandı (18/12).
- Kapaklar: `public/covers/{tür}-{1,2}.svg` (özgün, /tmp'deki üreticiyle çizildi). `src/lib/covers.ts` yalnız
  `/covers/*.svg` kabul eder, yoksa türe göre deterministik kapak. Şema genişletilmedi (beğeni alanı yok).
- ProjectGrid: kapak + başlık + istem + Türkçe tür; tıklayınca istem sohbete yazılır (`chatDraft` store'da).
- Vitrin artık `/api/projects` kullanıyor (mock-data hiçbir sayfada kullanılmıyor).
- Beceriler: Türkçe modül rozetleri; "Şablonu kullan" → `defaultParams.examplePrompt` (yoksa ad) sohbete.
- /scheduled: liste boşken 5 Türkçe şablon (girişsizse panel açılır); silme onay penceresi; modül adları
  `modules.*` ile Türkçe (Base UI Select'e `items` verildi).
- /api/chat: hız sınırı sayacı artık doğrulamadan sonra (25 hatalı istek hak tüketmedi, 21. geçerli 429).
- Gotcha: `public/sw.js` CSS/JS için cache-first; yerel `next dev`'de sabit chunk adları yüzünden eski CSS
  görünebilir (tarayıcıda SW'yi kaldırın). Production'da dosya adları hash'li olduğundan sorun değil.

## Doğrulama

- `npm run build`: geçti.
- Migration temiz test veritabanında iki kez çalıştırıldı: ikisi de geçti; `User`, `Project`, `ScheduledTask`, `Skill` tabloları oluştu.
- Yerel production server testinde `/api/projects`, `/api/skills`, `/api/tasks`: HTTP 200.
- `npm run lint`: 5 Kasım 2026'da temizlendi — 14 `no-explicit-any` hatası ve 9 kullanılmayan değişken uyarısı giderildi (`any` → `unknown`/tipli; kullanılmayan import'lar kaldırıldı; postcss default export adlandırıldı). `npm run lint` artık sıfır sorunla geçiyor; `npx tsc --noEmit` hatasız.
- `npm audit --omit=dev`: 27 bulgu (1 düşük, 8 orta, 16 yüksek, 2 kritik); ayrı bağımlılık güncellemesi gerekli.

## Kaynak repo incelemesi

- Git geçmişinin ilk commit'i `5f2d92f` (`feat: Skywork.ai clone - full PRD implementation`), yazar yerel kullanıcı; upstream/fork kaydı yok.
- GitHub'daki resmi `SkyworkAI/Skywork`, `Skywork-R1V` ve `Skywork-Skills` depoları sırasıyla model/araştırma veya Python ajan becerisi projeleri. Bu Next.js UI uygulamasının upstream'i değiller.
- Lisansı veya doğrudan kod ilişkisi kanıtlanmayan üçüncü taraf repo kodu birleştirilmedi.

## Bekleyenler

- Bağımlılık güvenlik bulgularını ayrı, kontrollü güncelleme ile ele al.
- Tarayıcı paneli bu oturumda erişilemediği için görsel kullanıcı smoke testi ayrıca yapılabilir; HTTP ve veri kabulü tamamlandı.
