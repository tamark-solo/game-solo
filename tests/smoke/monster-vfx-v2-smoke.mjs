import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
import {cueGraph,presentationEnd} from '../../docs/design/vfx/van-hai-monster-vfx-v2/cues.mjs';
import {productionFrameAge} from '../../client/src/core/actor-animation-production.ts';
const bodyRoot=resolve('docs/design/characters/van-hai-monster-animation-v1'),out=resolve('artifacts/monster-vfx-v2');await mkdir(out,{recursive:true});
const body=JSON.parse(await readFile(bodyRoot+'/catalog.json','utf8')),fx=JSON.parse(await readFile('docs/design/vfx/van-hai-monster-vfx-v2/catalog.json','utf8'));
const fixture=await mkdtemp(out+'/fixture-'),config=fixture+'/vite.mjs',origin='http://127.0.0.1:5227';
await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
const vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5227'],origin);let browser;
const errors=[],requests=[];let bindings=0;
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/|\/matchmake\//.test(r.url()))requests.push(r.url());});
 await page.goto(origin+'/@fs/'+bodyRoot.replaceAll('\\','/')+'/index.html');await page.waitForSelector('body[data-ready=true]');await page.locator('#play').click();await page.locator('#repeat').uncheck();await page.locator('#action').selectOption('attack');await page.locator('#roots').uncheck();
 const storage=await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]);
 assert.equal(await page.locator('#vfxset').inputValue(),'new');
 async function seek(age){const id=await page.evaluate(()=>['actor','action','direction'].map(k=>document.getElementById(k).value).join('-'));await page.locator('#age').evaluate((e,v)=>{e.max=String(v+2000);e.value=String(v);e.dispatchEvent(new Event('input'));},age);await page.waitForFunction(({id,age})=>{const s=document.querySelector('#stage').dataset;return s.clip===id&&Math.abs(Number(s.age)-age)<=1;},{id,age});}
 for(const kit of fx.actors){
  await page.locator('#actor').selectOption(kit.id);
  for(const direction of body.directions){
   await page.locator('#direction').selectOption(direction);const c=body.clips[kit.id+'-attack-'+direction],release=productionFrameAge(c,3),charge=productionFrameAge(c,1);
   await seek(Math.ceil((charge+release)/2));assert.equal(await page.locator('#stage').getAttribute('data-charge'),'true');assert.equal(await page.locator('#stage').getAttribute('data-release'),'false');
   assert.equal(await page.locator('#stage').evaluate(e=>{const b=JSON.parse(e.dataset.contentBounds);return b[0]>=20&&b[1]>=20&&b[2]<=e.width-20&&b[3]<=e.height-20;}),true);
   const graph=cueGraph(c,release,'hit',kit,fx);await seek(Math.ceil(graph.facts.hitAt+100));assert.equal(await page.locator('#stage').getAttribute('data-release'),'true');assert.equal(await page.locator('#stage').getAttribute('data-impact'),'true');
   await seek(Math.ceil(presentationEnd(c,kit,fx)));try{await page.waitForFunction(()=>document.querySelector('#stage').dataset.impact==='false',{},{timeout:5000});}catch(e){console.log({kit:kit.id,direction,end:presentationEnd(c,kit,fx),actual:await page.locator('#stage').evaluate(e=>({...e.dataset})),errors});throw e;}assert.equal(await page.locator('#stage').getAttribute('data-release'),'false');bindings++;
  }
  await page.locator('#direction').selectOption('southeast');const c=body.clips[kit.id+'-attack-southeast'],release=productionFrameAge(c,3),age=Math.ceil(cueGraph(c,release,'hit',kit,fx).facts.hitAt+100);
  await seek(age);await page.locator('#stage').screenshot({path:out+'/'+kit.id+'-map-1x.png'});
  await page.locator('#zoom').selectOption('2');await page.locator('#stage').screenshot({path:out+'/'+kit.id+'-map-2x.png'});
  await page.locator('#scene').selectOption('light');await page.locator('#stage').screenshot({path:out+'/'+kit.id+'-light-2x.png'});
  await page.locator('#scene').selectOption('dark');await page.locator('#stage').screenshot({path:out+'/'+kit.id+'-dark-2x.png'});await page.locator('#scene').selectOption('map');await page.locator('#zoom').selectOption('1');
 }
 await page.locator('#actor').selectOption('black-silk-adept');await page.locator('#direction').selectOption('southeast');await page.locator('#zoom').selectOption('2');
 const kit=fx.actors.find(a=>a.id==='black-silk-adept'),c=body.clips['black-silk-adept-attack-southeast'],release=productionFrameAge(c,3),hitAge=Math.ceil(cueGraph(c,release,'hit',kit,fx).facts.hitAt+100);
 await seek(hitAge);await page.screenshot({path:out+'/review-new-desktop.png',fullPage:true});await page.screenshot({path:out+'/review-new-viewport.png',fullPage:false});
 await page.locator('#fact').selectOption('miss');await page.waitForFunction(()=>document.querySelector('#stage').dataset.impact==='false');assert.equal(await page.locator('#stage').getAttribute('data-release'),'true');
 await page.locator('#fact').selectOption('cancel');await page.waitForFunction(()=>document.querySelector('#stage').dataset.phase==='cancelled');for(const p of ['charge','release','impact'])assert.equal(await page.locator('#stage').getAttribute('data-'+p),'false');
 await page.locator('#fact').selectOption('hit');await page.locator('#fx').uncheck();await page.waitForFunction(()=>document.querySelector('#stage').dataset.release==='false');await page.locator('#fx').check();
 await page.waitForFunction(()=>document.querySelector('#stage').dataset.release==='true');const beforeAB=await page.locator('#stage').evaluate(e=>({width:e.width,height:e.height,bodyFrame:e.dataset.frame}));
 await page.locator('#vfxset').selectOption('old');await seek(Math.ceil(release+100));await page.waitForFunction(()=>document.querySelector('#stage').dataset.vfx==='old');await page.screenshot({path:out+'/review-old-desktop.png',fullPage:true});assert.equal(await page.locator('#stage').getAttribute('data-charge'),'false');
 await page.locator('#vfxset').selectOption('new');await seek(hitAge);await page.waitForFunction(()=>document.querySelector('#stage').dataset.vfx==='new');assert.deepEqual(await page.locator('#stage').evaluate(e=>({width:e.width,height:e.height,bodyFrame:e.dataset.frame})),beforeAB);
 await page.locator('#zoom').selectOption('3');await page.locator('#direction').selectOption('south');await seek(hitAge);assert.equal(await page.locator('#stage').evaluate(e=>{const b=JSON.parse(e.dataset.contentBounds);return b[0]>=20&&b[1]>=20&&b[2]<=e.width-20&&b[3]<=e.height-20;}),true);
 await page.locator('#direction').selectOption('east');await seek(hitAge);assert.equal(await page.locator('#stage').evaluate(e=>{const b=JSON.parse(e.dataset.contentBounds);return b[0]>=20&&b[1]>=20&&b[2]<=e.width-20&&b[3]<=e.height-20;}),true);
 await page.locator('#zoom').selectOption('1');await page.locator('#direction').selectOption('southeast');await seek(300);await page.locator('#play').click();
 await context.setOffline(true);await page.waitForTimeout(60);const offlineAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),offlineAge);await context.setOffline(false);await page.waitForTimeout(80);await page.locator('#play').click();
 await page.emulateMedia({reducedMotion:'reduce'});const reducedAge=await page.locator('#stage').getAttribute('data-age');await page.waitForTimeout(180);assert.equal(await page.locator('#stage').getAttribute('data-age'),reducedAge);await page.emulateMedia({reducedMotion:'no-preference'});
 const cache=JSON.parse(await page.locator('body').getAttribute('data-cache'));assert.ok(cache.decodedBytes<=cache.budgetBytes);
 for(const width of [768,390]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#stage').evaluate(e=>e.getBoundingClientRect().width),960);}await page.screenshot({path:out+'/review-mobile.png',fullPage:true});
 assert.deepEqual(await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]),storage);assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);assert.equal(await page.locator('body').getAttribute('data-error'),null);
 const report={passed:true,date:'2026-10-13',bindings,actorCount:fx.actors.length,errors,requests,cache,checks:['88 actor/direction attack bindings','charge/release/contact separate and tail expires','hit/miss/pre-release cancel','new/old A-B on same body','generated images on map/light/dark at1x/2x','3x preview height expands rather than resizing actor','offline/reduced motion pauses','390/768 native canvas without page overflow','decoded FX+body cache within16MiB','no API/storage writes; isolated fixture only'],artApproved:false,runtimeImplemented:false};await writeFile(out+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser?.close();vite.stop();}
