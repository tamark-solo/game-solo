import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
import {productionDuration,productionFrameAge,productionSample} from '../../client/src/core/actor-animation-production.ts';
import {trial} from '../../docs/design/characters/dark-seal-officer-animation-v1/fixture.mjs';

const root=resolve('docs/design/characters/dark-seal-officer-animation-v1');
const out=resolve('artifacts/dark-seal-officer-animation-v1');await mkdir(out,{recursive:true});
const catalog=JSON.parse(await readFile(root+'/catalog.json','utf8'));
const kit=JSON.parse(await readFile(root+'/kit.json','utf8'));
assert.equal(Object.keys(catalog.clips).length,72);assert.equal(catalog.coverage.poses,432);assert.deepEqual(catalog.coverage.missing,[]);
const fixture=await mkdtemp(out+'/fixture-'),config=fixture+'/vite.mjs';
const port=process.env.OFFICER_REVIEW_PORT||'5234',origin='http://127.0.0.1:'+port;
// No owner asset builder, backend, authored map or database plugin is loaded.
await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
const vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port',port],origin);
const errors=[],requests=[],socketAttempts=[];let browser,bodySamples=0,fixtureCases=0;
function near(actual,expected,label){assert.equal(actual.length,expected.length);for(let i=0;i<actual.length;i++)assert.ok(Math.abs(actual[i]-expected[i])<.001,label+' '+actual+' != '+expected);}
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/|\/matchmake\/|\/rooms\//.test(r.url()))requests.push(r.url());});
 page.on('websocket',socket=>socketAttempts.push(socket.url()));
 await page.goto(origin+'/@fs/'+root.replaceAll('\\','/')+'/index.html');
 await page.waitForSelector('body[data-ready=true]');
 assert.equal(await page.locator('#stage').evaluate(e=>e.clientWidth),1120,'desktop native canvas must not be CSS stretched');
 if(await page.locator('#play').getAttribute('aria-pressed')==='true')await page.locator('#play').click();
 const storage=await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]);
 async function seek(age){
  const clip=await page.evaluate(()=>document.querySelector('#action').value+'-'+document.querySelector('#direction').value);
  const mode=await page.locator('#mode').inputValue();
  await page.locator('#seek').evaluate((e,v)=>{e.max=String(v+2500);e.value=String(v);e.dispatchEvent(new Event('input'));},Math.ceil(age));
  await page.waitForFunction(({clip,mode,age})=>{const s=document.querySelector('#stage').dataset;return s.clip===clip&&s.mode===mode&&Math.abs(Number(s.age)-age)<=1;},{clip,mode,age:Math.ceil(age)});
  return await page.locator('#stage').evaluate(e=>({...e.dataset}));
 }
 async function select(action,direction,mode='hit'){
  await page.locator('#action').selectOption(action);await page.locator('#direction').selectOption(direction);await page.locator('#mode').selectOption(mode);
 }
 for(const action of catalog.actions)for(const direction of catalog.directions){
  await select(action,direction);const clip=catalog.clips[action+'-'+direction];
  for(let i=0;i<6;i++){
   const age=Math.ceil(productionFrameAge(clip,i)),s=await seek(age);
   assert.equal(Number(s.frame),productionSample(clip,age).index,clip.id+' frame '+i);
   assert.equal(s.action,action);assert.equal(s.direction,direction);bodySamples++;
  }
  if(!clip.loop){const s=await seek(productionDuration(clip)+100);assert.equal(Number(s.frame),5,clip.id+' last body pose');}
 }
 for(const action of Object.keys(kit.skills))for(const direction of catalog.directions){
  for(const mode of ['hit','miss','cancel']){
   await select(action,direction,mode);const t=trial(kit,action,direction,mode);
   let s=await seek(t.lock-1);assert.equal(s.warning,'true');assert.equal(s.locked,'false');
   s=await seek(t.lock+1);assert.equal(s.warning,'true');assert.equal(s.locked,'true');
   s=await seek(t.release+40);
   assert.equal(s.release,mode==='cancel'?'false':'true',action+'/'+direction+'/'+mode+' release');
   assert.equal(s.contact,'false');
   s=await seek(t.resolve+50);assert.equal(s.contact,mode==='hit'?'true':'false',action+'/'+direction+'/'+mode+' contact');
   near(JSON.parse(s.bossOffset),t.factsAt(Math.ceil(t.resolve+50)).bossOffset,'boss foot');
   near(JSON.parse(s.playerOffset),t.playerAt(Math.ceil(t.resolve+50)),'player foot');
   s=await seek(t.end+2000);assert.equal(s.release,'false');assert.equal(s.contact,'false');
   near(JSON.parse(s.bossOffset),t.factsAt(Math.ceil(t.end+2000)).bossOffset,'stationary caster held through recovery');
   fixtureCases++;
  }
 }
 for(const action of ['dao_an','phan_phu','an_hoi','attack']){
  await select(action,'southeast','hit');const t=trial(kit,action,'southeast','hit');
  await seek(t.resolve+50);await page.locator('#zoom').selectOption('1');await page.locator('#scene').selectOption('map');await seek(t.resolve+50);
  await page.locator('#stage').screenshot({path:out+'/'+action+'-map-1x.png'});
  await page.locator('#zoom').selectOption('2');await seek(t.resolve+50);await page.locator('#stage').screenshot({path:out+'/'+action+'-map-2x.png'});
  for(const scene of ['light','dark']){await page.locator('#scene').selectOption(scene);await seek(t.resolve+50);await page.locator('#stage').screenshot({path:out+'/'+action+'-'+scene+'-2x.png'});}
 }
 await select('phan_phu','southeast','hit');const phantom=trial(kit,'phan_phu','southeast','hit');let ghost=await seek(phantom.release+10);assert.equal(ghost.decoys,'2');assert.equal(ghost.decoyDamage,'false');await page.locator('#decoys').uncheck();ghost=await seek(phantom.release+10);assert.equal(ghost.decoys,'0');await page.locator('#decoys').check();
 await page.locator('#stage').screenshot({path:out+'/phan-phu-before-resolve.png'});
 await select('dao_an','southeast','hit');const t=trial(kit,'dao_an','southeast','hit');await page.locator('#scene').selectOption('map');await page.locator('#zoom').selectOption('1');await seek(t.resolve+50);
 await page.screenshot({path:out+'/review-desktop.png',fullPage:true});
 await page.locator('#fx').uncheck();let s=await seek(t.resolve+50);assert.equal(s.release,'false');assert.equal(s.contact,'false');await page.locator('#fx').check();
 await select('idle','south');await seek(100);await page.locator('#play').click();await page.waitForTimeout(50);
 await context.setOffline(true);await page.waitForTimeout(80);const offlineAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),offlineAge);await context.setOffline(false);
 await page.waitForTimeout(50);if(await page.locator('#play').getAttribute('aria-pressed')==='true')await page.locator('#play').click();
 await page.locator('#play').click();await page.waitForTimeout(50);await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(80);assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');const reducedAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),reducedAge);await page.emulateMedia({reducedMotion:'no-preference'});
 const cache=JSON.parse(await page.locator('body').getAttribute('data-cache'));assert.ok(cache.decodedBytes<=cache.budgetBytes);assert.equal(cache.budgetBytes,16*1024*1024);
 for(const width of [768,390]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'page overflow at '+width);}
 await page.screenshot({path:out+'/review-mobile.png',fullPage:true});
 assert.deepEqual(await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]),storage);
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const gameplaySockets=socketAttempts.filter(url=>{const u=new URL(url);return u.hostname!=='127.0.0.1'||u.port!==port||u.pathname!=='/';});
 assert.deepEqual(gameplaySockets,[]);assert.equal(await page.locator('body').getAttribute('data-error'),null);
 const report={passed:true,date:'2026-10-13',bodySamples,fixtureCases,cache,errors,requests,gameplaySockets,artApproved:false,runtimeImplemented:false,checks:['432 Core-selected native frames across72 bindings','four attacks ×eight directions ×hit/miss/pre-release cancel','warning/lock/release/contact facts remain separate','Phân Phù: two presentation-only decoys, origin held, toggle independent','FX tail expires and FX toggle affects presentation only','native1x/nearest2x screenshots on map/light/dark','offline/reduced-motion pauses','16MiB decoded cache bound','390/768 no page overflow','isolated Vite fixture; no API/backend WebSocket/storage writes'],limits:['screenshots require owner review for actual anatomy/motion quality','cache verification does not benchmark MMO GPU or server load']};
 await writeFile(out+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser?.close();vite.stop();}
