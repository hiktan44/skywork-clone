# Proje Devir Notu

## Son durum

- Canlı `https://skywork.seymata.com/` ana sayfası HTTP 200, fakat 5 Kasım 2026 kontrolünde `/api/projects` HTTP 500 dönüyordu: `relation "Project" does not exist`.
- Kök neden: Docker başlangıcında veritabanı şeması kurulmamıştı. Ayrıca `/api/setup` tabloları siliyor fakat yeniden oluşturmuyordu.
- `script/migrate.mjs` eklendi. Şemayı ve küçük demo başlangıç verisini transaction içinde, tekrar-safe biçimde kuruyor.
- Docker başlangıcı artık önce migration'ı, başarılı olursa Next.js sunucusunu çalıştırıyor.
- `/api/setup` içindeki yıkıcı DROP işlemleri kaldırıldı ve eksik CREATE TABLE adımları geri getirildi.

## Doğrulama

- `npm run build`: geçti.
- Migration temiz test veritabanında iki kez çalıştırıldı: ikisi de geçti; `User`, `Project`, `ScheduledTask`, `Skill` tabloları oluştu.
- Yerel production server testinde `/api/projects`, `/api/skills`, `/api/tasks`: HTTP 200.
- `npm run lint`: mevcut 14 `no-explicit-any` hatası nedeniyle başarısız; bu değişiklikten önceki dosyalarda da aynı borç mevcut.
- `npm audit --omit=dev`: 27 bulgu (1 düşük, 8 orta, 16 yüksek, 2 kritik); ayrı bağımlılık güncellemesi gerekli.

## Kaynak repo incelemesi

- Git geçmişinin ilk commit'i `5f2d92f` (`feat: Skywork.ai clone - full PRD implementation`), yazar yerel kullanıcı; upstream/fork kaydı yok.
- GitHub'daki resmi `SkyworkAI/Skywork`, `Skywork-R1V` ve `Skywork-Skills` depoları sırasıyla model/araştırma veya Python ajan becerisi projeleri. Bu Next.js UI uygulamasının upstream'i değiller.
- Lisansı veya doğrudan kod ilişkisi kanıtlanmayan üçüncü taraf repo kodu birleştirilmedi.

## Bekleyenler

- Değişiklikleri commit/push edip Coolify deploy sonucunu doğrula.
- Deploy sonrası `/api/projects`, `/api/skills`, `/api/tasks` için HTTP 200 ve kullanıcı ekranında kartların görünmesini smoke test et.
- Bağımlılık güvenlik bulgularını ayrı, kontrollü güncelleme ile ele al.
