import { Client } from 'pg';
import { setupSchema } from './database-schema.mjs';

if (process.argv.length !== 3 || process.argv[2] !== '--apply') {
  console.error('Veritabanı değişikliği açıkça seçilmelidir: npm run db:setup -- --apply');
  process.exitCode = 1;
} else if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL tanımlanmalıdır.');
  process.exitCode = 1;
} else {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await setupSchema(client);
    console.log('Veritabanı şeması hazır; mevcut kayıtlar korundu.');
  } catch {
    // Bağlantı bilgileri veya SQL ayrıntıları günlüğe aktarılmaz.
    console.error('Kurulum başarısız; transaction geri alındı. Yetkili yönetici şema ve bağlantıyı incelemelidir.');
    process.exitCode = 1;
  } finally { await client.end(); }
}
