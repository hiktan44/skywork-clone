# F52: Veritabanı kurulumunun HTTP'den kaldırılması

`GET /api/setup` artık 410 ve Türkçe bir açıklama döndürür. Veritabanı modülü yüklenmez ve bağlantı açılmaz. Eski dört tablo/iki enum silme işlemleri kaldırıldı.

## Kontrollü kurulum

Yetkili sunucu terminalinde, doğru veritabanı adresi `DATABASE_URL` olarak hazırlanıp yedek doğrulandıktan sonra:

```sh
npm run db:setup -- --apply
```

`--apply` veya bağlantı ayarı yoksa işlem başlamaz. Komut dört modelin eksik tablo/enum/indekslerini bir transaction içinde oluşturur. Mevcut kayıtları silmez veya güncellemez; demo kullanıcı, görev ve proje eklemez. Tekrar çalıştırılabilir. Mevcut şema uyumsuzsa hata verir ve bu çalıştırmada yapılan DDL geri alınır; otomatik olarak eski veriyi yeniden kurmaya çalışmaz. Kurulumu aynı anda birden fazla süreçten çalıştırmayın.

Prisma'nın mevcut şema/seed ve sürüm uyumluluğu ayrı konudur; bu komut Prisma istemcisine bağlı değildir. Mevcut tablo yapısı farklıysa ayrıca incelenmiş sürümlü bir migration gerekir.

## Üretim kabulü

- İnceleme ve dağıtım sonrası setup URL'sinin 410 verdiğini doğrulayın. Canlı testte eski setup kodunu çağırmayın.
- Uygulamanın PostgreSQL hesabı tabloların sahibi veya süper kullanıcı olmamalıdır. Migration için ayrı rol kullanın; uygulama rolüne yalnız gerekli tablo/sequence CRUD yetkilerini verin. PostgreSQL'de sahiplikten gelen DROP/ALTER yetkisi yalnız GRANT/REVOKE ile giderilemez; sahiplik ve rol üyelikleri birlikte incelenmelidir.
- Bu PR üretim bağlantısına erişmez, rol/yetki değiştirmez ve otomatik migration çalıştırmaz.
- F53 görevlerin kullanıcıya göre sınırlandırılması halen ayrı bir açık bulgudur.

## Doğrulama

Altı test geçti: HTTP işleyicisinin bağlantı açmadan 410 vermesi; CLI'nin açık seçime ve bağlantı ayarına ihtiyaç duyması; gerçek yerel PostgreSQL 14'te boş kurulum, ikinci kurulumda dört tablonun kayıtlarının korunması ve uyumsuz şemada DDL rollback. HTTP taşıması NextResponse fixture'ıdır; PostgreSQL testleri yalnız ayrı `codex_` veritabanlarında çalışır. Setup route tür/lint kontrolü geçti. Tüm uygulamanın derlemesi bu dar kapsamlı düzeltmede yapılmadı.
