import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { resolve, dirname, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const folder=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const workspace=resolve(folder,'../../../..');
const digest=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const production=JSON.parse(await readFile(resolve(folder,'production.json'),'utf8'));
const registration=JSON.parse(await readFile(resolve(folder,'registration.json'),'utf8'));
assert.ok(production.actors.length>=1);
assert.equal(registration.coverage.animationClips,0);
assert.equal(registration.artApproved,false);
assert.equal(registration.productionSha256AtPack,await digest(resolve(folder,'production.json')));
assert.equal(registration.measurementsSha256,await digest(resolve(folder,'review/source-measurements.json')));
for(const a of production.actors){
 const r=registration.actors.find(r=>r.id===a.id);
 assert.equal(await digest(resolve(folder,a.raw)),r.sourceSha256);
 assert.equal(await digest(resolve(folder,a.sprite)),r.spriteSha256);
 assert.equal(await digest(resolve(folder,a.prompt)),r.promptSha256);
 assert.equal(r.measuredBodyHeightPx,80);
 assert.equal(r.alphaPolicy.magentaKeyEnabled,false);
 assert.equal(r.nativeBounds[3],88);
 assert.equal(r.artApproved,false);
}
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{try{const target=resolve(workspace,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const rel=relative(workspace,target);if(rel.startsWith('..')||isAbsolute(rel))throw Error('outside');const body=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]??'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-concepts-v3/index.html');
 await page.waitForFunction(()=>document.body.dataset.ready==='true');
 assert.equal(await page.locator('.actor-card').count(),production.actors.length);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 await page.screenshot({path:resolve(folder,'review/desktop.png'),fullPage:true});
 let scenarios=0;
 for(const actor of production.actors){
  await page.locator('#actor').selectOption(actor.id);
  assert.equal(await page.locator('#detail h3').textContent(),actor.name);
  for(const scene of ['map','light','dark'])for(const zoom of [1,2]){
   await page.locator('#scene').selectOption(scene);
   await page.locator('[data-zoom="'+zoom+'"]').click();
   scenarios++;
   if(scene==='map')await page.locator('#stage').screenshot({path:resolve(folder,'review/'+actor.slug+'-map-'+zoom+'x.png')});
  }
 }
 for(const toggle of ['roots','shadows','silhouette']){await page.locator('#'+toggle).check();await page.locator('#'+toggle).uncheck();}
 await page.locator('#scene').selectOption('light');
 await page.locator('#stage').screenshot({path:resolve(folder,'review/light-2x.png')});
 await page.locator('#scene').selectOption('dark');
 await page.locator('#stage').screenshot({path:resolve(folder,'review/dark-2x.png')});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.locator('#stage').evaluate(e=>e.getBoundingClientRect().width),960);
 await page.screenshot({path:resolve(folder,'review/mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 const result={passed:true,actors:production.actors.length,viewsPerActor:1,posesPerActor:1,animationClips:0,browserScenarios:scenarios,nativeHeightPx:80,mobileWidth:390,stagePreservesNativePixels:true,errors,artApproved:false,anatomyCompatible:false,anatomyLimitation:'Compact v3 proportions improve versus v1; shorter hair, brighter robe and more frontal face remain differences; owner visual review pending.',runtimeImported:false,ownerMapEdited:false};
 await writeFile(resolve(folder,'review/verification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
} finally {await browser.close();await new Promise(done=>server.close(done));}
