import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
const root=resolve('docs/design/characters/van-hai-monster-concepts-v1');
const output=resolve('artifacts/monster-concepts');await mkdir(output,{recursive:true});
const pack=JSON.parse(await readFile(resolve(root,'production.json'),'utf8'));
const registration=JSON.parse(await readFile(resolve(root,'registration.json'),'utf8'));
const plan=JSON.parse(await readFile(pack.sourcePlan,'utf8'));
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
assert.equal(pack.actors.length,11);assert.equal(pack.actors.filter(a=>a.rank==='mob').length,8);assert.equal(pack.actors.filter(a=>a.rank==='elite').length,3);
assert.equal(pack.artApproved,false);assert.equal(pack.ownerApproved,false);assert.equal(pack.runtimeConsumable,false);
assert.deepEqual(pack.directionsProduced,['southeast']);assert.equal(pack.directionsPending.length,7);
assert.equal(await hash(pack.sourcePlan),pack.sourcePlanSha256);
for(const a of pack.actors){
 assert.equal(await hash(resolve(root,a.raw)),a.rawSha256);assert.equal(await hash(resolve(root,a.sprite)),a.spriteSha256);assert.equal(await hash(resolve(root,a.prompt)),a.promptSha256);
 assert.equal(a.artApproved,false);assert.equal(a.runtimeImplemented,false);assert.equal(a.animationProduced,false);assert.equal(a.pixelsResampled,true);
 assert.ok(a.inputFiles.length);for(const ref of a.inputFiles)assert.equal(await hash(ref.file),ref.sha256);
 const n=plan.enemies.find(n=>n.id===a.id),r=registration.actors.find(r=>r.id===a.id);
 assert.equal(n.concept.artApproved,false);assert.equal(n.concept.animationProduced,false);assert.equal(n.runtimeImplemented,false);
 assert.deepEqual(r.pivot,a.pivot);assert.equal(r.nativeBounds[3],a.pivot[1]);assert.equal(r.nativeBounds[3]-r.nativeBounds[1],a.measuredBodyHeightPx);
 assert.equal(r.alphaPolicy.rgbPainted,false);assert.equal(r.alphaPolicy.componentsRemoved,0);
}
const basis=JSON.parse(await readFile('docs/design/characters/actor-animation-standard-v2/approval.json','utf8'));
for(const p of basis.targets)assert.equal(await hash(p.file),p.sha256,`Approved basis changed: ${p.file}`);
assert.equal(await hash('docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp'),'4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8');
const fixture=await mkdtemp(resolve(output,'fixture-')),config=resolve(fixture,'vite.mjs'),origin='http://127.0.0.1:5225';
await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
const vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5225'],origin);let browser;
const errors=[],api=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/|\/matchmake\//.test(r.url()))api.push(r.url());});
 await page.goto(origin+'/@fs/'+root.replaceAll('\\','/')+'/index.html');await page.waitForSelector('body[data-ready=true]');
 const before=await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]);
 assert.equal(await page.locator('.actor-card').count(),11);
 const alpha=await page.evaluate(async actors=>{const out=[];for(const a of actors){const im=new Image();im.src=a.sprite;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const c=cv.getContext('2d');c.drawImage(im,0,0);const d=c.getImageData(0,0,cv.width,cv.height).data;const values=new Set();for(let i=3;i<d.length;i+=4)values.add(d[i]);out.push({id:a.id,size:[im.width,im.height],alpha:[...values].sort((a,b)=>a-b)});}return out;},pack.actors);
 for(const a of alpha){assert.deepEqual(a.alpha,[0,255]);assert.deepEqual(a.size,pack.actors.find(p=>p.id===a.id).canvas);}
 // A large source canvas may extend outside its card, but no opaque BODY may.
 const clipping=await page.locator('.actor-card').evaluateAll((nodes,rows)=>nodes.map(n=>{const a=rows.find(a=>a.id===n.dataset.id),b=n.querySelector('.sprite-stage').getBoundingClientRect(),im=n.querySelector('img').getBoundingClientRect(),r=a.nativeBounds;return {id:a.id,clips:im.left+r[0]*3<b.left-1||im.top+r[1]*3<b.top-1||im.left+r[2]*3>b.right+1||im.top+r[3]*3>b.bottom+1};}),registration.actors);
 assert.deepEqual(clipping.filter(v=>v.clips),[],'Card clips body silhouette');
 await page.screenshot({path:resolve(output,'gallery-desktop.png'),fullPage:true});
 await page.locator('[data-filter=elite]').click();assert.equal(await page.locator('.actor-card').count(),3);
 await page.locator('[data-filter=mob]').click();assert.equal(await page.locator('.actor-card').count(),8);
 await page.locator('[data-filter=all]').click();
 for(const a of pack.actors){await page.locator('#actor').selectOption(a.id);assert.equal(await page.locator('#detail h3').innerText(),a.name);}
 await page.locator('#actor').selectOption('ELITE-VH-JADE-GUARD');await page.locator('#stage').screenshot({path:resolve(output,'jade-elite-map-1x.png')});
 assert.equal(await page.locator('#stage').evaluate(e=>e.getBoundingClientRect().width),960);
 await page.locator('[data-zoom="2"]').click();await page.locator('#stage').screenshot({path:resolve(output,'jade-elite-map-2x.png')});
 await page.locator('#scene').selectOption('light');await page.locator('#roots').uncheck();await page.locator('#shadows').uncheck();await page.locator('#silhouette').check();await page.locator('#stage').screenshot({path:resolve(output,'silhouette-light.png')});
 await page.locator('#scene').selectOption('dark');await page.locator('#silhouette').uncheck();await page.locator('#actor').selectOption('MOB-VH-INK-BAT');await page.locator('#stage').screenshot({path:resolve(output,'bat-body-no-shadow.png')});
 await page.setViewportSize({width:390,height:844});await page.locator('[data-zoom="1"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#stage').evaluate(e=>e.getBoundingClientRect().width),960);assert.ok(await page.locator('.stage-scroll').evaluate(e=>e.scrollWidth>e.clientWidth));await page.screenshot({path:resolve(output,'gallery-mobile.png'),fullPage:true});
 assert.deepEqual(await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]),before);
 await page.goto(origin+'/@fs/'+resolve('docs/design/world/van-hai-living-world-v1/index.html').replaceAll('\\','/'));await page.locator('[data-view=mob]').click();await page.locator('.select[data-id="ELITE-VH-JADE-GUARD"]').click();assert.equal(await page.locator('#detail img').count(),1);await page.locator('#detail img').evaluate(i=>i.decode());assert.match(await page.locator('#detail').innerText(),/Art concept/);
 assert.deepEqual(api,[]);assert.deepEqual(errors,[]);
 const report={passed:true,date:'2026-10-13',mobs:8,elites:3,neutralPoses:11,viewsPerActor:1,approvedBasisFilesVerified:basis.targets.length,checks:['raw/prompt/input/native SHA256','native canvas/body/root and binary alpha','no opaque silhouette clipped by cards','eleven actor selections','8/3 rank filters','1x/2x map and light/dark silhouette review','body/ground/lift separation','mobile preserves native canvas without page overflow','existing world brief links candidate art','no game API or browser storage writes'],errors,api,artApproved:false,runtimeImplemented:false,ownerMapEdited:false,ownerDatabaseUsed:false};
 await writeFile(resolve(output,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser?.close();vite.stop();}
