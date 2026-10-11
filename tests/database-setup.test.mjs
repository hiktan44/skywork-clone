import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { Client } from 'pg';
import { setupSchema } from '../scripts/database-schema.mjs';

const source = await fs.readFile(new URL('../src/app/api/setup/route.ts', import.meta.url), 'utf8');
const context = vm.createContext({ process: { env: { DATABASE_URL: 'fixture-unreachable-url' } } });
const dep = new vm.SyntheticModule(['NextResponse'], function () {
  this.setExport('NextResponse', { json: (body, options) => ({ body, ...options }) });
}, { context });
const module = new vm.SourceTextModule(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText, { context });
await module.link(specifier => { assert.equal(specifier, 'next/server', 'HTTP yolu veritabanı modülünü bile yüklememelidir.'); return dep; });
await module.evaluate();

test('HTTP kurulum isteği bağlantı kurmadan 410 ve Türkçe açıklama döndürür', async () => {
  const res = await module.namespace.GET();
  assert.equal(res.status, 410); assert.match(res.body.error, /kaldırıldı/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('CLI açık --apply olmadan veritabanına bağlanmaz', () => {
  const res = spawnSync(process.execPath, ['scripts/setup-database.mjs'], { cwd: new URL('../', import.meta.url), env: { ...process.env, DATABASE_URL: 'fixture-unreachable-url' }, encoding: 'utf8' });
  assert.equal(res.status, 1); assert.match(res.stderr, /açıkça seçilmelidir/);
});
test('CLI --apply ile de bağlantı ayarı eksikse başarısız olur', () => {
  const res = spawnSync(process.execPath, ['scripts/setup-database.mjs', '--apply'], { cwd: new URL('../', import.meta.url), env: { ...process.env, DATABASE_URL: '' }, encoding: 'utf8' });
  assert.equal(res.status, 1); assert.match(res.stderr, /DATABASE_URL tanımlanmalıdır/);
});

async function fixture(t) {
  const url = new URL(process.env.TEST_DATABASE_URL || '');
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname.startsWith('/codex_'), 'Yalnız açıkça ayrılmış yerel test veritabanı kullanılabilir.');
  const client = new Client({ connectionString: url.href }); await client.connect();
  const schema = 'f52_' + crypto.randomBytes(8).toString('hex');
  await client.query(`CREATE SCHEMA "${schema}"`);
  t.after(async () => { await client.query(`DROP SCHEMA "${schema}" CASCADE`); await client.end(); });
  await client.query(`SET search_path TO "${schema}", pg_catalog`);
  return { client, schema };
}
test('gerçek PostgreSQL: boş şema, enumlar, dört tablo ve sahiplik bağlantıları kurulur', async t => {
  const { client, schema } = await fixture(t); await setupSchema(client, { schema });
  const tables = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema=$1', [schema]);
  assert.deepEqual(tables.rows.map(r => r.table_name).sort(), ['Project', 'ScheduledTask', 'Skill', 'User']);
  await assert.rejects(client.query(`INSERT INTO "ScheduledTask" (id,"userId",name,cron,module,prompt) VALUES ('task','missing','Fixture','* * * * *','VIDEO','Özel')`), e => e.code === '23503');
});
test('gerçek PostgreSQL: ikinci kurulum mevcut kullanıcı/proje/görev/skill kayıtlarını korur', async t => {
  const { client, schema } = await fixture(t); await setupSchema(client, { schema });
  await client.query(`INSERT INTO "User" (id,email) VALUES ('owner','fixture@example.invalid')`);
  await client.query(`INSERT INTO "Project" (id,"userId",title,type,prompt) VALUES ('project','owner','Fixture','VIDEO','Özel proje')`);
  await client.query(`INSERT INTO "ScheduledTask" (id,"userId",name,cron,module,prompt) VALUES ('task','owner','Fixture','* * * * *','VIDEO','Özel görev')`);
  await client.query(`INSERT INTO "Skill" (id,name,description,module) VALUES ('skill','Fixture','Fixture','VIDEO')`);
  await setupSchema(client, { schema });
  for (const table of ['User', 'Project', 'ScheduledTask', 'Skill']) assert.equal((await client.query(`SELECT count(*)::int AS n FROM "${table}"`)).rows[0].n, 1);
  assert.equal((await client.query('SELECT prompt FROM "ScheduledTask"')).rows[0].prompt, 'Özel görev');
});
test('gerçek PostgreSQL: uyumsuz mevcut şema hata verirse bütün yeni DDL geri alınır', async t => {
  const { client, schema } = await fixture(t);
  await client.query('CREATE TABLE "User" (legacy TEXT)'); await client.query(`INSERT INTO "User" VALUES ('korunmalı')`);
  await assert.rejects(setupSchema(client, { schema }));
  assert.equal((await client.query('SELECT legacy FROM "User"')).rows[0].legacy, 'korunmalı');
  assert.equal((await client.query('SELECT 1 FROM information_schema.tables WHERE table_schema=$1 AND table_name=$2', [schema, 'Project'])).rowCount, 0);
  assert.equal((await client.query(`SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=$1 AND t.typname='Plan'`, [schema])).rowCount, 0);
});
