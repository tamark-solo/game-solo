import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';

const captures=resolve('artifacts/content-catalog'),origin='http://127.0.0.1:5248',endpoint='http://127.0.0.1:2648';
await mkdir(captures,{recursive:true});const folder=await mkdtemp(resolve(captures,'fixture-')),catalogPath=resolve(folder,'catalog.json'),dbPath=resolve(folder,'profiles.sqlite');
const original=await readFile('docs/design/systems/content-registry-v1/catalog.json','utf8');await writeFile(catalogPath,original);
let backend,vite,browser,page;const checks=[],layouts=[],errors=[];
const api=()=>{let cookie='',csrf='';return {async request(path,method='GET',body){const r=await fetch(endpoint+'/api/game'+path,{method,headers:{Origin:origin,Cookie:cookie,...(method==='GET'?{}:{'Content-Type':'application/json','X-Game-Client':'h5','X-Game-CSRF':csrf})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];const data=await r.json();if(data.csrf)csrf=data.csrf;return {status:r.status,data,trace:r.headers.get('x-request-id')};}};};
try{
  backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/ready',{PORT:'2648',GAME_DB_PATH:dbPath,GAME_CONTENT_CATALOG_PATH:catalogPath,GAME_LOCAL_ADMIN_SHORT_PASSWORD:'1',GAME_BOOTSTRAP_ADMIN_LOGIN:'catalogoperator',GAME_BOOTSTRAP_ADMIN_PASSWORD:'fixture123'});
  const anonymous=api(),player=api(),admin=api();
  assert.equal((await anonymous.request('/admin/catalog')).status,401);
  assert.equal((await player.request('/register','POST',{login:'catalogplayer',password:'fixture123'})).status,400);
  await player.request('/register','POST',{login:'catalogplayer',password:'fixture-player-password'});const denied=await player.request('/admin/catalog');assert.equal(denied.status,403);assert.ok(denied.trace);
  await player.request('/characters','POST',{requestId:'catalog-profile',realmId:'hang-nhac-1',avatarId:'CHR-WANG-LIN-CHIBI',name:'Catalog Fixture'});
  const before=(await player.request('/characters?realmId=hang-nhac-1')).data;
  await admin.request('/login','POST',{login:'catalogoperator',password:'fixture123'});const loaded=await admin.request('/admin/catalog');assert.equal(loaded.status,200);assert.equal(loaded.data.catalog.records.length,96);assert.equal(loaded.data.catalog.runtimeConsumable,false);
  assert.equal((await admin.request('/admin/catalog','POST',{path:'server/data/profiles.sqlite'})).status,404);
  assert.deepEqual((await player.request('/characters?realmId=hang-nhac-1')).data,before);
  checks.push('Local short-password admin login; player registration remains strict; anonymous/player denied; catalog read does not mutate profiles');
  const config=resolve(folder,'vite.mjs');await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(folder,'cache'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5248'],origin,{VITE_SERVER_URL:endpoint});
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});page=await browser.newPage({viewport:{width:1366,height:900}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/admin.html?view=catalog');await page.locator('#admin-login').waitFor();await page.locator('#admin-login').fill('catalogoperator');await page.locator('#admin-password').fill('fixture123');await page.locator('[data-admin-form="login"] button').click();
  const ready=()=>page.waitForFunction(()=>window.__gameAdmin?.().catalogRecords===96&&!window.__gameAdmin().busy);
  await ready();assert.equal(await page.locator('.catalog-list tbody tr').count(),96);
  await page.locator('#catalog-domain').selectOption('cosmetic');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.equal(await page.locator('.catalog-list tbody tr').count(),8);
  await page.locator('#catalog-subtype').selectOption('aura');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.equal(await page.locator('.catalog-list tbody tr').count(),3);
  await page.locator('[data-catalog-record="cosmetic:aura-sinh-tu-wheel-v4"]').first().click();assert.match(await page.locator('#catalog-detail').innerText(),/static concept/);assert.match(await page.locator('#catalog-detail').innerText(),/Chưa triển khai/);
  await page.locator('#catalog-subtype').selectOption('outfit');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.equal(await page.locator('.catalog-list tbody tr').count(),5);
  await page.locator('#catalog-subtype').selectOption('');
  checks.push('Retained appearance library: five outfits and three approved static aura concepts remain unreleased in admin catalog');
  await page.locator('#catalog-query').fill('ngoc');await page.locator('#catalog-domain').selectOption('item');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.equal(await page.locator('.catalog-list tbody tr').count(),3);
  await page.locator('[data-catalog-record="item:hn-training-jade"]').first().click();await page.locator('#catalog-detail').getByRole('button',{name:'recipe:hn-refine-training-jade',exact:true}).first().click();assert.match(await page.locator('#catalog-detail').innerText(),/Tiêu nguyên liệu/);assert.match(await page.locator('#catalog-detail').innerText(),/Biến đổi cùng một món/);
  await page.locator('#catalog-query').fill('');await page.locator('#catalog-subtype').selectOption('artifact');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.equal(await page.locator('.catalog-list tbody tr').count(),1);await page.locator('#catalog-subtype').selectOption('');await page.locator('#catalog-query').fill('');await page.locator('#catalog-domain').selectOption('item');await page.locator('#catalog-implementation').selectOption('implemented-local');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.equal(await page.locator('.catalog-list tbody tr').count(),3);
  await page.locator('#catalog-domain').selectOption('mount');await page.locator('[data-admin-form="catalog-filter"] button').click();assert.match(await page.locator('.catalog-list').innerText(),/Chưa có bản ghi/);
  await page.locator('#catalog-domain').selectOption('');await page.locator('#catalog-implementation').selectOption('');await page.locator('[data-admin-form="catalog-filter"] button').click();
  checks.push('Vietnamese accent-insensitive search, domain/status filtering, empty domain and typed source/use navigation');
  for(const [width,height] of [[320,740],[390,844],[844,390],[1366,900]]){
    await page.setViewportSize({width,height});const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,small:[...document.querySelectorAll('button,input,select,summary')].filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height<44;}).map(n=>n.textContent)}));assert.equal(metrics.overflow,false,JSON.stringify({width,height,metrics}));assert.deepEqual(metrics.small,[]);layouts.push({width,height,...metrics});await page.evaluate(()=>window.scrollTo(0,0));if(width===390||width===1366)await page.screenshot({path:resolve(captures,width===390?'mobile.png':'desktop.png'),fullPage:false});
  }
  const malformed=JSON.parse(original);malformed.records[0].source.path='docs/absent-source.md';await writeFile(catalogPath,JSON.stringify(malformed));await page.locator('[data-admin-action="refresh"]').click();await page.waitForFunction(()=>window.__gameAdmin?.().catalogErrors>0&&!window.__gameAdmin().busy);assert.equal(await page.locator('.catalog-errors').count(),1);assert.match(await page.locator('.catalog-errors').innerText(),/Nguồn thiếu/);
  await writeFile(catalogPath,'{');await page.locator('[data-admin-action="refresh"]').click();await page.waitForFunction(()=>!window.__gameAdmin().busy&&window.__gameAdmin().catalogErrors===1);assert.match(await page.locator('.catalog-errors').innerText(),/JSON hợp lệ/);
  const escaped=JSON.parse(original);escaped.records[0].displayName='<img src=x onerror="globalThis.catalogXss=true">';await writeFile(catalogPath,JSON.stringify(escaped));await page.locator('[data-admin-action="refresh"]').click();await ready();assert.equal(await page.locator('.catalog-list img').count(),0);assert.equal(await page.evaluate(()=>globalThis.catalogXss),undefined);
  await writeFile(catalogPath,original);await page.locator('[data-admin-action="refresh"]').click();await ready();
  checks.push('4 responsive layouts; invalid JSON/source fail closed and recover; content strings render safely');
  await page.locator('[data-admin-tab="operations"]').click();await page.waitForFunction(()=>window.__gameAdmin?.().tab==='operations'&&!window.__gameAdmin().busy);assert.equal(await page.locator('.admin-realms').count(),1);await page.locator('[data-admin-tab="catalog"]').click();await ready();await page.reload();await ready();
  await page.locator('[data-admin-action="logout"]').click();await page.locator('#admin-login').waitFor();assert.equal(await page.locator('.catalog-list').count(),0);
  assert.deepEqual(errors,[]);assert.equal(await readFile('docs/design/systems/content-registry-v1/catalog.json','utf8'),original);
  checks.push('Existing operations tab, session reload and logout remain functional; fixtures never touch owner catalog/DB');
  await writeFile('artifacts/content-catalog-verification.json',JSON.stringify({checks,layouts,pageErrors:errors,fixtureOnly:true,ownerDataWritten:false},null,2)+'\n');console.log(`Content catalog: ${checks.length} groups, ${layouts.length} layouts passed.`);
}catch(error){if(page)await page.screenshot({path:resolve(captures,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
finally{await browser?.close();vite?.stop();backend?.stop();}
