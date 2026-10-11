# Görev sahipliği ve giriş — F53

`GET /api/tasks` Auth.js oturumunu doğrular, güncel `User` kaydını kontrol eder ve yalnız bu kaydın `id` değeriyle `ScheduledTask.userId` filtresi uygular. İstek içindeki e-posta, `userId` veya kullanıcı başlıkları kimlik seçemez. Oturumsuz/silinmiş kullanıcıya 401; veritabanı veya giriş yapılandırması hatasına ayrıntı sızdırmadan 503 döner. Yanıt `no-store` kullanır; mevcut service worker `/api/` isteklerini önbelleğe almaz.

Depoda çalışır bir giriş sağlayıcısı yoktu; düğmeler oturum oluşturmuyordu. Google girişini Auth.js ile bağlayan API, Türkçe giriş/çıkış penceresi ve gerçek pencereyi açan menü düğmeleri eklendi. Görev ekranı artık giriş gerektiğinde boş liste göstermek yerine giriş düğmesi sunar. Google'ın OAuth/OIDC doğrulamasından gelen profilde `email_verified` gerçek boolean `true` olmalıdır. İstemciden gönderilen e-posta veya profil verisiyle oturum oluşturulmaz.

## Coolify ve Google ayarları

Bu dal [F52 PR #1](https://github.com/hiktan44/skywork-clone/pull/1) üzerine kuruludur. Önce veritabanı kurulum değişikliğini, ardından bu değişikliği birleştirin.

Sunucuya `DATABASE_URL`, rastgele en az 32 baytlık `AUTH_SECRET`, uygulamanın dış HTTPS adresi olarak `AUTH_URL`, `AUTH_GOOGLE_ID` ve `AUTH_GOOGLE_SECRET` tanımlayın. Google OAuth istemcisinin izinli yönlendirme adresi `https://skywork.seymata.com/api/auth/callback/google` olmalıdır; başka alan adı kullanılıyorsa hem bu adresi hem `AUTH_URL` değerini değiştirin. Coolify proxy için `AUTH_TRUST_HOST=true` kullanılır; uygulama sunucusuna yalnız doğru host başlıklarını ileten proxy erişmelidir. Gerçek anahtarları Git'e veya sohbete eklemeyin. AUTH_SECRET eksik/kısa ise görev API'si kapalı kalır. Google istemci ayarları yoksa yeni Google girişi etkinleşmez; önceden verilmiş oturumları iptal etmek için AUTH_SECRET döndürülmelidir. Sahte giriş veya varsayılan imza anahtarı kullanılmaz.

Doğrulanmış Google e-postası mevcut kullanıcıya bağlanır; mevcut planı değiştirmez. İlk doğrulanmış girişte aynı e-postayla tek kullanıcı oluşturulur. Büyük/küçük harf dışında aynı e-postaya ait birden çok eski kayıt varsa giriş durur; önce bu belirsizliği üretim kayıtlarının sahipliğini doğrulayarak çözün. Görev sahibinin e-postasını değiştirmek veya kullanıcısını silmek eski oturumun görev erişimini keser.

## Giriş ve çıkış

**Giriş / Hesap → Google ile devam et** akışını kullanın. Oturum açınca görev ekranına yönlendirilirsiniz. **Giriş / Hesap → Çıkış yap** mevcut tarayıcı oturum çerezini temizler. Google hesabının parolası uygulama veritabanında tutulmaz; değişiklik Google hesabı üzerinden yapılır.

Auth.js JWT oturumu yedi günlük süre kullanır. Çıkış, önceden kopyalanmış bir JWT'yi sunucuda tek başına iptal etmez; hesap başına oturum sürümü veya oturum listesi bu değişiklikte eklenmedi. `AUTH_SECRET` değiştirip tüm kopyaları yeniden başlatmak eski şifreli oturumları geçersiz kılar. Gerçek secret veya kullanıcı kayıtları bu çalışma sırasında değiştirilmedi.

Görev oluşturma, geçici etkinlik değiştirme ve silme düğmeleri mevcut istemci durumuyla çalışır. Sunucuya kalıcı görev CRUD veya zamanlayıcı çalıştırma özelliği bu güvenlik düzeltmesinde eklenmedi; bu düğmelerin kalıcı kayıt yaptığı varsayılmamalıdır.

## Test kapsamı

`npm run test:tasks` yalnız `TEST_DATABASE_URL` ile verilen yerel `codex_skywork_test` veritabanındaki rastgele test şemasını kullanır. Gerçek Next sunucusu, Auth.js JWE oturumları, giriş/CSRF/çıkış rotaları ve PostgreSQL sahiplik sorguları çalışır. Google profil callback testleri sentetiktir; gerçek Google hesabı veya OAuth sağlayıcısı çağrılmaz. Yerel HTTP ve callback testleri gerçek tarayıcı tıklaması veya canlı Coolify kabulü yerine geçmez.

Testler kurgusal e-postalar ve anahtarlarla çalışır; yalnız kendi test sunucusu süreç grubunu durdurup test şemasını temizler. `npm run test:database` F52 veri koruma/rollback kontrollerini tekrarlar. Tam TypeScript, değişen dosyaların ESLint kontrolü ve Next üretim derlemesi ayrıca çalıştırılır. Yeni test toplamı önceki denetimin test toplamına eklenmez.

[Auth.js kurulum belgeleri](https://authjs.dev/getting-started/installation) ve [Google sağlayıcı belgeleri](https://authjs.dev/getting-started/providers/google) yapılandırma sözleşmesini açıklar. Next'in bu sürümdeki yerel Route Handlers ve Authentication rehberleri de uygulamadan önce okundu.
