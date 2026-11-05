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
