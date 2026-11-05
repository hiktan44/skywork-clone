# Skywork DB startup root cause

5 Kasım 2026'da canlı ana sayfa HTTP 200 iken `/api/projects` HTTP 500 ve
`relation "Project" does not exist` dönüyordu. Docker başlangıcında şema kurulmadığı,
`/api/setup` rotasının ise tabloları silip yeniden oluşturmadığı doğrulandı.
`4012ad9` commit'i idempotent `script/migrate.mjs`, migration-before-server Docker
başlangıcı ve yıkıcı olmayan setup şema kontrolünü ekledi. Temiz PostgreSQL üzerinde
iki ardışık migration, build ve üç production API testi geçti. Push sonrası otomatik
Coolify deploy tetiklenmedi; canlı kabul hâlâ ayrıca gereklidir.
