import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import net from 'node:net';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import ts from 'typescript';
import {Client} from 'pg';
import {encode} from 'next-auth/jwt';
import {setupSchema} from '../scripts/database-schema.mjs';

const root=new URL('../',import.meta.url);
const secret='fictional-skywork-auth-secret-for-tests-20261011';
const replacement='fictional-skywork-replacement-secret-for-tests-20261011';
const cookieName='authjs.session-token';
let control, schema, scopedUrl, child, base, configModule, storeModule, context;
let serverLogs='';

async function stopServer() {
  if (!child || child.exitCode!==null || child.signalCode!==null) return;
  const current=child;
  const ended=once(current,'exit');
  try {process.kill(-current.pid,'SIGTERM');} catch(error) {if(error.code!=='ESRCH')throw error;}
  const timer=setTimeout(()=>{try{process.kill(-current.pid,'SIGKILL');}catch{}},5000);
  try {await ended;} finally {clearTimeout(timer);}
  await fs.appendFile(new URL('../skywork-task-server.log',root),serverLogs);
  child=null;
}
async function startServer(currentSecret) {
  const socket=net.createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
  const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
  base=`http://127.0.0.1:${port}`;
  serverLogs='';
  child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port',String(port)],{
    cwd:root,detached:true,
    env:{PATH:process.env.PATH,NEXT_TELEMETRY_DISABLED:'1',DATABASE_URL:scopedUrl.href,
      AUTH_SECRET:currentSecret,AUTH_URL:base,AUTH_TRUST_HOST:'true',
      AUTH_GOOGLE_ID:'fictional-google-client',AUTH_GOOGLE_SECRET:'fictional-google-secret'},
    stdio:['ignore','pipe','pipe'],
  });
  child.stdout.on('data',data=>{serverLogs+=data.toString();});
  child.stderr.on('data',data=>{serverLogs+=data.toString();});
  const deadline=Date.now()+60000;
  while(!serverLogs.includes('Ready')) {
    if(child.exitCode!==null || child.signalCode!==null) throw new Error('Yerel Next sunucusu başlamadı: '+serverLogs);
    if(Date.now()>deadline) throw new Error('Yerel sunucu zaman aşımı: '+serverLogs);
    await new Promise(resolve=>setTimeout(resolve,100));
  }
}

async function loadModule(file) {
  const source=await fs.readFile(new URL(file,root),'utf8');
  const module=new vm.SourceTextModule(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText,{context});
  await module.link(async specifier=>{
    if(specifier==='./task-store') return storeModule;
    const native=await import(specifier);
    return new vm.SyntheticModule(Object.keys(native),function(){for(const key of Object.keys(native))this.setExport(key,native[key]);},{context});
  });
  await module.evaluate();return module;
}

before(async()=>{
  const url=new URL(process.env.TEST_DATABASE_URL || '');
  assert.ok(['127.0.0.1','localhost'].includes(url.hostname) && url.pathname==='/codex_skywork_test','Yalnız ayrılmış yerel test veritabanı kullanılabilir.');
  control=new Client({connectionString:url.href});await control.connect();
  schema='f53_'+crypto.randomBytes(8).toString('hex');
  await control.query(`CREATE SCHEMA "${schema}"`);
  await control.query(`SET search_path TO "${schema}",pg_catalog`);
  await setupSchema(control,{schema});
  await control.query(`INSERT INTO "User" (id,email) VALUES ('owner','owner@example.invalid'),('other','other@example.invalid'),('removed','removed@example.invalid')`);
  await control.query(`INSERT INTO "ScheduledTask" (id,"userId",name,cron,module,prompt) VALUES ('task_owner','owner','Kurgusal A','0 9 * * *','DOCUMENT','A özel deneme'),('task_other','other','Kurgusal B','0 10 * * *','DOCUMENT','B özel deneme')`);
  scopedUrl=new URL(url);scopedUrl.searchParams.set('options',`-c search_path=${schema},pg_catalog`);
  context=vm.createContext({process:{env:{DATABASE_URL:scopedUrl.href,AUTH_SECRET:secret,AUTH_GOOGLE_ID:'fixture',AUTH_GOOGLE_SECRET:'fixture'}},Buffer});
  storeModule=await loadModule('src/lib/task-store.ts');
  configModule=await loadModule('src/lib/task-auth-config.ts');
  await startServer(secret);
});
after(async()=>{
  await stopServer();
  if(control){if(schema)await control.query(`DROP SCHEMA "${schema}" CASCADE`);await control.end();}
});

async function cookie(identity={uid:'owner',email:'owner@example.invalid'},key=secret,maxAge=3600) {
  return cookieName+'='+await encode({token:identity,secret:key,salt:cookieName,maxAge});
}
async function request(path='/api/tasks',identity={uid:'owner',email:'owner@example.invalid'},key=secret,maxAge=3600) {
  return fetch(base+path,{headers:{Cookie:await cookie(identity,key,maxAge)},signal:AbortSignal.timeout(30000)});
}

for(const [provider,profile] of [
  [undefined,undefined],['github',{email:'owner@example.invalid',email_verified:true}],
  ['google',{email:'owner@example.invalid'}],['google',{email:'owner@example.invalid',email_verified:false}],
  ['google',{email:'owner@example.invalid',email_verified:'true'}],['google',{email:123,email_verified:true}],
  ['google',{email:' owner@example.invalid',email_verified:true}],['google',{email:'invalid',email_verified:true}],
]) test('doğrulanmamış veya farklı sağlayıcı profili reddedilir: '+JSON.stringify([provider,profile]),()=>{
  assert.equal(configModule.namespace.verifiedGoogleEmail(provider,profile),null);
});
test('doğrulanmış Google e-postası kabul edilip normalize edilir',()=>{
  assert.equal(configModule.namespace.verifiedGoogleEmail('google',{email:'Owner@Example.Invalid',email_verified:true}),'owner@example.invalid');
});
for(const value of [undefined,'','short',' '.repeat(40)])test('harici imza anahtarı eksik/kısa ise yapılandırma reddedilir: '+String(value),()=>{
  context.process.env.AUTH_SECRET=value;
  try{assert.throws(()=>configModule.namespace.taskAuthConfig(),/AUTH_SECRET/);}finally{context.process.env.AUTH_SECRET=secret;}
});

test('Google callback kullanıcıyı gerçek PostgreSQL kaydına bağlar; mevcut plan değişmez',async()=>{
  await control.query(`UPDATE "User" SET plan='PRO' WHERE id='owner'`);
  const cfg=configModule.namespace.taskAuthConfig();
  const account={provider:'google'};
  const profile={email:'Owner@Example.Invalid',email_verified:true};
  assert.equal(await cfg.callbacks.signIn({account,profile}),true);
  const token=await cfg.callbacks.jwt({token:{},account,profile,user:{name:'Fixture'}});
  assert.equal(token.uid,'owner');assert.equal(token.email,'owner@example.invalid');
  assert.equal((await control.query(`SELECT plan FROM "User" WHERE id='owner'`)).rows[0].plan,'PRO');
  const session=await cfg.callbacks.session({session:{user:{id:'forged'}},token});
  assert.equal(session.user.id,'owner');
});
test('yeni doğrulanmış Google kimliği bir kullanıcıya bağlanır; eşzamanlı ilk giriş tek kayıt olur',async()=>{
  const [one,two]=await Promise.all([storeModule.namespace.googleUser('new@example.invalid'),storeModule.namespace.googleUser('NEW@example.invalid')]);
  assert.equal(one.id,two.id);
  assert.equal((await control.query(`SELECT count(*)::int AS n FROM "User" WHERE LOWER(email)='new@example.invalid'`)).rows[0].n,1);
});
test('belirsiz büyük/küçük harf e-posta eşleşmesi kullanıcıya bağlanmaz',async()=>{
  await control.query(`INSERT INTO "User" (id,email) VALUES ('dup1','DUP@example.invalid'),('dup2','dup@example.invalid')`);
  await assert.rejects(storeModule.namespace.googleUser('dup@example.invalid'),/belirsiz/);
});
test('istemci oturum güncellemesi uid değiştiremez',async()=>{
  const cfg=configModule.namespace.taskAuthConfig();
  const token={uid:'owner',email:'owner@example.invalid'};
  const updated=await cfg.callbacks.jwt({token,trigger:'update',session:{uid:'other'},account:undefined});
  assert.equal(updated.uid,'owner');
});

test('kimliksiz HTTP, userId sorgusu ve kullanıcı başlığıyla görev okuyamaz',async()=>{
  const response=await fetch(base+'/api/tasks?userId=owner',{headers:{'x-user-id':'owner'},signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,401);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.ok(!(await response.text()).includes('A özel deneme'));
});
test('gerçek Auth.js oturumu yalnız A kullanıcısının görevlerini döndürür; istek B kimliğini seçemez',async()=>{
  const response=await request('/api/tasks?userId=other');
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  const data=await response.json();assert.deepEqual(data.tasks.map(x=>x.id),['task_owner']);
  assert.equal(data.tasks[0].prompt,'A özel deneme');assert.equal(data.tasks[0].userId,undefined);
});
test('B kullanıcısının gerçek oturumu yalnız B görevlerini döndürür',async()=>{
  const response=await request('/api/tasks',{uid:'other',email:'other@example.invalid'});
  assert.equal(response.status,200);assert.deepEqual((await response.json()).tasks.map(x=>x.id),['task_other']);
});
test('sahte cookie ve yanlış imza anahtarı reddedilir',async()=>{
  assert.equal((await fetch(base+'/api/tasks',{headers:{Cookie:cookieName+'='+JSON.stringify({uid:'owner'})}})).status,401);
  assert.equal((await request('/api/tasks',undefined,replacement)).status,401);
});
test('süresi geçmiş ve kullanıcı id alanı bulunmayan oturum reddedilir',async()=>{
  assert.equal((await request('/api/tasks',undefined,secret,-120)).status,401);
  assert.equal((await request('/api/tasks',{email:'owner@example.invalid'})).status,401);
});
test('silinmiş kullanıcı ve güncel e-postayla eşleşmeyen oturum reddedilir',async()=>{
  await control.query(`DELETE FROM "User" WHERE id='removed'`);
  assert.equal((await request('/api/tasks',{uid:'removed',email:'removed@example.invalid'})).status,401);
  assert.equal((await request('/api/tasks',{uid:'owner',email:'other@example.invalid'})).status,401);
});
test('veritabanı hatası 503 döndürür; kimliksiz istek veritabanı erişimi beklemez',async()=>{
  await control.query('ALTER TABLE "User" RENAME TO "UnavailableUser"');
  try{
    assert.equal((await fetch(base+'/api/tasks')).status,401);
    const response=await request();assert.equal(response.status,503);
    const text=await response.text();assert.ok(!text.includes(schema));assert.ok(!text.includes('SELECT'));
  }finally{await control.query('ALTER TABLE "UnavailableUser" RENAME TO "User"');}
});
test('Google giriş yolu ve CSRF endpoint gerçek Next/Auth.js üzerinde kullanılabilir',async()=>{
  const providers=await fetch(base+'/api/auth/providers');assert.equal(providers.status,200);
  const data=await providers.json();assert.equal(data.google.id,'google');
  assert.equal(new URL(data.google.callbackUrl).pathname,'/api/auth/callback/google');
  const csrf=await fetch(base+'/api/auth/csrf');assert.equal(csrf.status,200);
  assert.equal(typeof (await csrf.json()).csrfToken,'string');
});
test('gerçek Auth.js çıkışı oturum cookie alanını temizler; sonraki cookiesiz istek reddedilir',async()=>{
  const csrf=await fetch(base+'/api/auth/csrf');
  const csrfValue=(await csrf.json()).csrfToken;
  const csrfCookie=csrf.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  const response=await fetch(base+'/api/auth/signout',{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Auth-Return-Redirect':'1',Cookie:csrfCookie+'; '+await cookie()},
    body:new URLSearchParams({csrfToken:csrfValue,callbackUrl:base+'/scheduled'}),redirect:'manual',
  });
  assert.equal(response.status,200);
  assert.ok(response.headers.getSetCookie().some(value=>value.startsWith(cookieName+'=;') && /Max-Age=0/i.test(value)));
  assert.equal((await fetch(base+'/api/tasks')).status,401);
});
test('harici anahtar değişimi eski gerçek oturumu reddeder; yeni oturum çalışır',async()=>{
  await stopServer();await startServer(replacement);
  assert.equal((await request()).status,401);
  assert.equal((await request('/api/tasks',undefined,replacement)).status,200);
});
test('anahtar eksikken HTTP görev ve giriş rotaları 503 ile kapalıdır',async()=>{
  await stopServer();await startServer('');
  assert.equal((await fetch(base+'/api/tasks',{signal:AbortSignal.timeout(30000)})).status,503);
  assert.equal((await fetch(base+'/api/auth/providers',{signal:AbortSignal.timeout(30000)})).status,503);
});
