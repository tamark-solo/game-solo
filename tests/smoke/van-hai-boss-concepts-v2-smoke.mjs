import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
const root=resolve('docs/design/characters/van-hai-boss-concepts-v2'),output=resolve('artifacts/boss-concepts-v2');
await mkdir(output,{recursive:true});
const pack=JSON.parse(await readFile(resolve(root,'production.json'),'utf8'));
const registration=JSON.parse(await readFile(resolve(root,'registration.json'),'utf8'));
const plan=JSON.parse(await readFile(pack.sourcePlan,'utf8'));
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
assert.equal(await hash(pack.sourcePlan),pack.sourcePlanSha256,'Pinned world plan must remain unchanged');
assert.deepEqual(pack.actors.map(a=>a.id).sort(),plan.enemies.filter(a=>a.rank==='boss').map(a=>a.id).sort());
assert.equal(pack.actors.length,4);assert.equal(pack.runtimeConsumable,false);assert.equal(pack.artApproved,false);assert.equal(pack.ownerApproved,false);
assert.deepEqual(pack.directionsProduced,['southeast']);assert.equal(pack.directionsPending.length,7);
for(const a of pack.actors){
 assert.equal(a.rank,'boss');assert.equal(a.artApproved,a.reusedFromApprovedConcept);assert.equal(a.runtimeImplemented,false);assert.equal(a.animationProduced,false);assert.equal(a.pixelsResampled,true);assert.equal(a.ownerApproved,a.reusedFromApprovedConcept);assert.equal(await hash(resolve(root,a.previousConcept.sprite)),a.previousConcept.spriteSha256);
 assert.equal(await hash(resolve(root,a.raw)),a.rawSha256);assert.equal(await hash(resolve(root,a.sprite)),a.spriteSha256);assert.equal(await hash(resolve(root,a.prompt)),a.promptSha256);
 for(const r of a.inputFiles)assert.equal(await hash(r.file),r.sha256,r.file);
 if(a.refinement){assert.equal(await hash(resolve(root,a.refinement.prompt)),a.refinement.promptSha256);assert.equal(await hash(resolve(root,a.refinement.editTarget)),a.refinement.editTargetSha256);}
 const r=registration.actors.find(r=>r.id===a.id);assert.deepEqual(r.pivot,a.pivot);assert.deepEqual(r.canvas,a.canvas);assert.equal(r.nativeBounds[3],a.pivot[1]);assert.equal(r.nativeBounds[3]-r.nativeBounds[1],a.bodyHeightPx);
 assert.equal(r.alphaPolicy.rgbPainted,false);assert.equal(r.alphaPolicy.componentsRemoved,0);
}
for(const f of pack.preservedBoss01)assert.equal(await hash(f.file),f.sha256,'Boss01 changed: '+f.file);
const wolf=pack.actors.find(a=>a.reusedFromApprovedConcept),approval=JSON.parse(await readFile(resolve(root,wolf.approval),'utf8'));assert.deepEqual(pack.approvedActorIds,[wolf.id]);assert.equal(approval.artApproved,true);for(const f of approval.targets)assert.equal(await hash(f.file),f.sha256);
const basis=JSON.parse(await readFile('docs/design/characters/actor-animation-standard-v2/approval.json','utf8'));
for(const p of basis.targets)assert.equal(await hash(p.file),p.sha256,p.file);
const monsterPack=JSON.parse(await readFile('docs/design/characters/van-hai-monster-concepts-v1/production.json','utf8'));
for(const a of monsterPack.actors){assert.equal(await hash(resolve('docs/design/characters/van-hai-monster-concepts-v1',a.raw)),a.rawSha256);assert.equal(await hash(resolve('docs/design/characters/van-hai-monster-concepts-v1',a.sprite)),a.spriteSha256);}
assert.equal(await hash('docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp'),'4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8');
const fixture=await mkdtemp(resolve(output,'fixture-')),config=resolve(fixture,'vite.mjs'),origin='http://127.0.0.1:5231';
await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(fixture,'cache'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
const vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5231'],origin);let browser;
const errors=[],api=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/|\/matchmake\//.test(r.url()))api.push(r.url());});
 const base=origin+'/@fs/'+root.replaceAll('\\','/')+'/index.html';
 await page.goto(base);await page.waitForSelector('body[data-ready=true]');
 const storage=await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]);
 assert.equal(await page.locator('.actor-card').count(),4);
 const pixels=await page.evaluate(async actors=>{const rows=[];for(const a of actors){const im=new Image();im.src=a.sprite;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const c=cv.getContext('2d');c.drawImage(im,0,0);const data=c.getImageData(0,0,cv.width,cv.height).data;const alpha=new Set();let b=[cv.width,cv.height,-1,-1];for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){const v=data[(y*cv.width+x)*4+3];alpha.add(v);if(v){b=[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x+1),Math.max(b[3],y+1)];}}rows.push({id:a.id,size:[im.width,im.height],alpha:[...alpha].sort((x,y)=>x-y),bounds:b});}return rows;},pack.actors);
 for(const p of pixels){const a=pack.actors.find(a=>a.id===p.id);assert.deepEqual(p.size,a.canvas);assert.deepEqual(p.alpha,[0,255]);assert.deepEqual(p.bounds,a.nativeBounds);assert.equal(p.bounds[3],a.pivot[1]);}
 // Canvas alpha verifies that the actual rendered 2x card body has margins.
 const thumbBounds=await page.locator('.thumb').evaluateAll(nodes=>nodes.map(cv=>{const data=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let b=[cv.width,cv.height,-1,-1];for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(data[(y*cv.width+x)*4+3]>128){b=[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x+1),Math.max(b[3],y+1)];}return b;}));
 for(const b of thumbBounds){assert.ok(b[0]>0&&b[1]>0&&b[2]<600&&b[3]<400,'Thumbnail body clipped');}
 await page.screenshot({path:resolve(output,'gallery-desktop.png'),fullPage:true});
 for(const a of pack.actors){
  await page.locator('#actor').selectOption(a.id);assert.equal(await page.locator('#detail h3').innerText(),a.name);
  for(const z of [1,2]){await page.locator(`button[data-zoom="${z}"]`).click();for(const mode of ['revision','family']){await page.locator('#compare').selectOption(mode);for(const scene of ['map','light','dark']){await page.locator('#scene').selectOption(scene);assert.equal(await page.locator('body').getAttribute('data-zoom'),String(z));assert.equal(await page.locator('#stage').evaluate(cv=>cv.getContext('2d').getImageData(1359,559,1,1).data[3]),255,'Background must fill the whole native canvas');}}}
  await page.locator('#compare').selectOption('revision');await page.locator('button[data-zoom="1"]').click();await page.locator('#scene').selectOption('map');await page.locator('#stage').screenshot({path:resolve(output,a.slug+'-map-1x.png')});
 }
 await page.locator('#actor').selectOption('BOSS-VH-ANCIENT-ROOT');await page.locator('button[data-zoom="2"]').click();await page.locator('#stage').screenshot({path:resolve(output,'ancient-root-map-2x.png')});
 await page.locator('#silhouette').check();await page.locator('#shadows').uncheck();await page.locator('#roots').uncheck();await page.locator('#scene').selectOption('light');await page.locator('#stage').screenshot({path:resolve(output,'root-silhouette-2x.png')});
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Page overflow: ${width}`);assert.equal(await page.locator('#stage').evaluate(e=>e.getBoundingClientRect().width),1360);assert.ok(await page.locator('.stage-scroll').evaluate(e=>e.scrollWidth>e.clientWidth));assert.equal(await page.locator('.thumb').first().evaluate(e=>e.getBoundingClientRect().width),600);}
 await page.screenshot({path:resolve(output,'gallery-mobile.png'),fullPage:true});
 assert.deepEqual(await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]),storage);
 await page.goto(base+'#actor=BOSS-HN-THREE-SEAL-PUPPET');await page.waitForSelector('body[data-ready=true]');assert.equal(await page.locator('#actor').inputValue(),'BOSS-HN-THREE-SEAL-PUPPET');
 await page.goto(origin+'/@fs/'+resolve('docs/design/world/van-hai-living-world-v1/index.html').replaceAll('\\','/'));await page.locator('[data-view=boss]').click();
 for(const a of pack.actors){await page.locator(`.select[data-id="${a.id}"]`).click();assert.equal(await page.locator('#detail img').count(),1);await page.locator('#detail img').evaluate(i=>i.decode());assert.match(await page.locator('#detail').innerText(),/Art concept/);assert.ok(await page.locator('#detail a').filter({hasText:'camera1×'}).count());}
 assert.deepEqual(api,[]);assert.deepEqual(errors,[]);
 const report={passed:true,date:'2026-10-13',id:pack.id,bosses:4,neutralPoses:4,viewsPerActor:1,directionsPending:7,sources:4,approvedBossNeutrals:1,newBossNeutralsPending:3,preservedBoss01Hashes:pack.preservedBoss01.length,approvedPlayerHashesVerified:basis.targets.length,monsterConceptRawNativeHashesVerified:22,sourcePlanUnchanged:true,ownerMapEdited:false,ownerDatabaseUsed:false,runtimeImplemented:false,artApproved:false,checks:['prompt/input/raw/native hashes','measured source support and native feet/binary alpha','actual 2x card body not clipped','four selections x 1x/2x x revision/family x map/light/dark','accepted wolf source/native unchanged','15 previous boss ART/metadata files preserved','native canvas scroll at mobile/desktop widths','root/shadow/silhouette controls','deep link restored','four candidate concepts linked from world brief','no game API or browser storage writes'],errors,api,files:pack.actors.map(a=>({id:a.id,rawSha256:a.rawSha256,spriteSha256:a.spriteSha256,bodyHeightPx:a.measuredBodyHeightPx,canvas:a.canvas,pivot:a.pivot}))};
 await writeFile(resolve(output,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log('Boss02 passed: wolf unchanged, three refinements; 48 compare/scene/zoom combinations and pinned basis verified.');
}finally{await browser?.close();vite.stop();}
