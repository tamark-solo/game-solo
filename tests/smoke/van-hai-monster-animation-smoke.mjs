import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
import {sample,duration,frameAge} from '../../docs/design/characters/van-hai-monster-animation-v1/presentation.mjs';
const root=resolve('docs/design/characters/van-hai-monster-animation-v1'),out=resolve('artifacts/monster-animation');await mkdir(out,{recursive:true});
const C=JSON.parse(await readFile(resolve(root,'catalog.json'),'utf8'));
const fixture=await mkdtemp(resolve(out,'fixture-')),config=resolve(fixture,'vite.mjs'),origin='http://127.0.0.1:5226';
await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
const vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5226'],origin);let browser;
const errors=[],api=[];let traversed=0;
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/|\/matchmake\//.test(r.url()))api.push(r.url());});
 await page.goto(origin+'/@fs/'+root.replaceAll('\\','/')+'/index.html');await page.waitForSelector('body[data-ready=true]');await page.locator('#play').click();
 await page.locator('#vfxset').selectOption('old');
 const before=await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]);
 assert.equal(await page.locator('#actor option').count(),11);
 async function seek(age){const id=await page.evaluate(()=>['actor','action','direction'].map(id=>document.getElementById(id).value).join('-'));const expected=sample(C.clips[id],age).age;await page.locator('#age').evaluate((e,v)=>{e.max=String(v+2000);e.value=String(v);e.dispatchEvent(new Event('input'));},age);try{await page.waitForFunction(({age,id})=>{const d=document.querySelector('#stage').dataset;return d.clip===id&&Math.abs(Number(d.age)-age)<=1;},{age:expected,id},{timeout:10000});}catch(e){console.log({failedSeek:{id,age,expected},actual:await page.evaluate(()=>({data:{...document.querySelector('#stage').dataset},error:document.body.dataset.error,range:document.querySelector('#age').value})),errors});throw e;}}
 for(const a of C.actors){
  await page.locator('#actor').selectOption(a.slug);
  await seek(0);
  const radius=Math.max(...Object.values(C.clips).filter(c=>c.actor===a.id).flatMap(c=>c.frames.map(f=>Math.max(Math.abs(f.bounds[0]-c.pivot[0]),Math.abs(f.bounds[2]-c.pivot[0])))));
  assert.ok(await page.locator('#directions').evaluate(e=>e.width/8)>=2*(radius+32),'Eight-view lane clips extreme poses/props');
  for(const action of C.actions){
   await page.locator('#action').selectOption(action);
   for(const direction of C.directions){
    await page.locator('#direction').selectOption(direction);await seek(0);
    const c=C.clips[a.slug+'-'+action+'-'+direction],release=c.durations.slice(0,3).reduce((a,b)=>a+b,0)*1000/c.fps;
    await seek(Math.ceil(action==='attack'?release+100:120));
    assert.equal(await page.locator('#stage').getAttribute('data-frame'),String(sample(c,Math.ceil(action==='attack'?release+100:120)).index));
    traversed++;
   }
  }
 }
 await page.locator('#actor').selectOption('black-silk-adept');await page.locator('#action').selectOption('attack');await page.locator('#direction').selectOption('southeast');await page.locator('#repeat').uncheck();
 const attack=C.clips['black-silk-adept-attack-southeast'],release=frameAge(attack,3);
 await seek(Math.floor(release)-1);assert.equal(await page.locator('#stage').getAttribute('data-release'),'false');
 await seek(Math.ceil(release)+100);assert.equal(await page.locator('#stage').getAttribute('data-release'),'true');assert.equal(await page.locator('#stage').getAttribute('data-impact'),'true');assert.equal(await page.locator('#stage').getAttribute('data-prop'),'true');
 await page.locator('#zoom').selectOption('2');await page.locator('#stage').screenshot({path:resolve(out,'adept-cast-map-2x.png')});await page.locator('#zoom').selectOption('1');
 await page.locator('#fact').selectOption('miss');await page.waitForFunction(()=>document.querySelector('#stage').dataset.impact==='false');assert.equal(await page.locator('#stage').getAttribute('data-release'),'true');
 await page.locator('#fact').selectOption('cancel');await page.waitForFunction(()=>document.querySelector('#stage').dataset.phase==='cancelled');assert.equal(await page.locator('#stage').getAttribute('data-release'),'false');assert.equal(await page.locator('#stage').getAttribute('data-impact'),'false');
 await page.locator('#fact').selectOption('hit');await page.locator('#fx').uncheck();await page.waitForFunction(()=>document.querySelector('#stage').dataset.release==='false');await page.locator('#fx').check();
 await page.locator('#props').uncheck();await page.waitForFunction(()=>document.querySelector('#stage').dataset.prop==='false');await page.locator('#props').check();await page.waitForFunction(()=>document.querySelector('#stage').dataset.prop==='true');
 for(const a of ['cloud-wolf','talisman-sprout','jade-guard','spirit-fungus','quiet-wisp','dark-talisman-rogue']){
  await page.locator('#actor').selectOption(a);const c=C.clips[a+'-attack-southeast'];await seek(Math.ceil(frameAge(c,3))+100);await page.locator('#zoom').selectOption('2');await page.locator('#stage').screenshot({path:resolve(out,a+'-cast-map-2x.png')});await page.locator('#zoom').selectOption('1');
 }
 await page.locator('#actor').selectOption('cloud-wolf');await page.locator('#action').selectOption('death');await seek(1000);assert.equal(await page.locator('#stage').getAttribute('data-frame'),'5');
 await page.locator('#action').selectOption('idle');await seek(100);await page.locator('#play').click();await page.waitForTimeout(80);await context.setOffline(true);await page.waitForTimeout(80);const offlineAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),offlineAge);await context.setOffline(false);await page.waitForTimeout(100);await page.locator('#play').click();
 await page.emulateMedia({reducedMotion:'reduce'});const reducedAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),reducedAge);await page.emulateMedia({reducedMotion:'no-preference'});
 await seek(100);await page.locator('#play').click();await page.waitForTimeout(80);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 const hiddenAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),hiddenAge);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(80);await page.locator('#play').click();
 const cache=JSON.parse(await page.locator('body').getAttribute('data-cache'));assert.ok(cache.decodedBytes<=cache.budgetBytes&&cache.evictions>0);
 await page.locator('#actor').selectOption('jade-guard');await page.locator('#action').selectOption('attack');await seek(400);await page.screenshot({path:resolve(out,'review-desktop.png'),fullPage:true});
 for(const width of [768,390]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#stage').evaluate(e=>e.getBoundingClientRect().width),960);assert.ok(await page.locator('.stage-scroll').first().evaluate(e=>e.scrollWidth>e.clientWidth));}await page.screenshot({path:resolve(out,'review-mobile.png'),fullPage:true});
 assert.deepEqual(await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]),before);assert.deepEqual(api,[]);assert.deepEqual(errors,[]);assert.equal(await page.locator('body').getAttribute('data-error'),null);
 const report={passed:true,date:'2026-10-13',clipsTraversed:traversed,checks:['440 action/direction bindings sampled with Core clock','confirmed hit / miss / pre-release cancel fixture','VFX + held prop toggles','death terminal hold','hidden/offline/reduced motion pause','1x/2x scene playback screenshots','native canvas at768/390 without page overflow','16MiB actor/FX decoded bitmap cache + eviction','no API or browser storage writes'],cache,errors,api,artApproved:false,runtimeImplemented:false};await writeFile(resolve(out,'browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser?.close();vite.stop();}
