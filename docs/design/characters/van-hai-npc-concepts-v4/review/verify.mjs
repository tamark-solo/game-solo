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
assert.equal(production.actors.length,3);
assert.deepEqual(new Set(production.actors.map(a=>a.id)),new Set(['NPC-HN-CULTIVATION','NPC-HN-TRAINING','NPC-HN-PREPARATION']));
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
 assert.equal(r.alphaPolicy.rgbPainted,false);
 assert.equal(r.resampling,'nearest-once');
 assert.deepEqual(r.canvas,a.canvas);
 assert.deepEqual(r.pivot,[a.canvas[0]/2,88]);
 assert.ok(r.nativeBounds[0]>=2&&r.nativeBounds[1]>=2&&r.nativeBounds[2]<=r.canvas[0]-2&&r.nativeBounds[3]<=r.canvas[1]-2);
 assert.equal(r.artApproved,false);
}
const referenceManifest=registration.inputReferences;
assert.equal(await digest(resolve(folder,registration.morphologyStyleBasis.file)),registration.morphologyStyleBasis.sha256);
assert.equal(await digest(resolve(folder,referenceManifest.manifest)),referenceManifest.manifestSha256);
for(const input of referenceManifest.images)assert.equal(await digest(resolve(folder,'inputs',input.path)),input.sha256);
for(const key of ['approvedPlayerReference','confirmedNpcStyleReference']){
 const reference=registration[key];
 assert.equal(await digest(resolve(workspace,reference.file)),reference.sha256);
 assert.equal(reference.modified,false);
}
assert.equal(registration.confirmedNpcStyleReference.ownerStyleConfirmed,true);
for(const actor of registration.actors){
 const provenance=actor.inputProvenance;
 assert.equal(await digest(resolve(folder,provenance.metadata)),provenance.metadataSha256);
 assert.ok(provenance.images.length>=2);
 for(const input of provenance.images)assert.equal(await digest(resolve(workspace,input.path)),input.sha256);
}
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{try{const target=resolve(workspace,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const rel=relative(workspace,target);if(rel.startsWith('..')||isAbsolute(rel))throw Error('outside');const body=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]??'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-concepts-v4/index.html');
 await page.waitForFunction(()=>document.body.dataset.ready==='true');
 assert.equal(await page.locator('.actor-card').count(),production.actors.length);
 assert.equal(await page.locator('#actor option').count(),3);
 assert.equal(await page.locator('#stage').evaluate(e=>e.width),960);
 assert.equal(await page.locator('#stage').evaluate(e=>e.height),420);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 await page.screenshot({path:resolve(folder,'review/desktop.png'),fullPage:true});
 let scenarios=0;
 for(const actor of production.actors){
  await page.locator('#actor').selectOption(actor.id);
  assert.equal(await page.locator('#detail h3').textContent(),actor.name);
  assert.equal(await page.evaluate(()=>new URLSearchParams(location.hash.slice(1)).get('actor')),actor.id);
  for(const scene of ['map','light','dark'])for(const zoom of [1,2]){
   await page.locator('#scene').selectOption(scene);
   await page.locator('[data-zoom="'+zoom+'"]').click();
   scenarios++;
   if(scene==='map')await page.locator('#stage').screenshot({path:resolve(folder,'review/'+actor.slug+'-map-'+zoom+'x.png')});
  }
 }
 assert.equal(scenarios,18);
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
 const result={passed:true,actors:production.actors.length,viewsPerActor:1,posesPerActor:1,animationClips:0,browserScenarios:scenarios,nativeHeightPx:80,mobileWidth:390,stagePreservesNativePixels:true,errors,artApproved:false,anatomyAssessment:'owner-review-pending',styleBasis:'live-Wang-Lin-Pixel02-primary-reference',artApprovalMeaning:'Technical verification does not approve NPC appearance or animation.',runtimeImported:false,ownerMapEdited:false};
 await writeFile(resolve(folder,'review/verification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
} finally {await browser.close();await new Promise(done=>server.close(done));}
