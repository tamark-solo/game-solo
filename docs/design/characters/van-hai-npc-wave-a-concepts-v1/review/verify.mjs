import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {resolve,dirname,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),workspace=resolve(root,'../../../..');
const expectedIds=['NPC-HN-HERBALIST','NPC-HN-FORGE','NPC-HN-ROUTE-KEEPER','NPC-HN-GATE-WARDEN','NPC-HN-DISCIPLE-WATER','NPC-HN-DISCIPLE-SWORD'];
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-concepts-v1');
const safe=(base,file)=>{const path=resolve(base,file),rel=relative(base,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),`Outside fixture scope: ${file}`);return path;};
const local=file=>safe(root,file),inWorkspace=file=>safe(workspace,file);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex'),hashFile=async file=>digest(await readFile(file));
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const rgba=async file=>sharp(file).ensureAlpha().raw().toBuffer();
await mkdir(local('review'),{recursive:true});
const catalog=await json(local('catalog.json')),registration=await json(local('registration.json')),gdd=await json(inWorkspace('docs/design/world/van-hai-living-world-v1/plan.json'));
const catalogSha256=await hashFile(local('catalog.json')),registrationSha256=await hashFile(local('registration.json'));
assert.equal(catalog.actors.length,6);assert.deepEqual(new Set(catalog.actors.map(actor=>actor.id)),new Set(expectedIds));
assert.equal(catalog.coverage.actors,6);assert.equal(catalog.coverage.neutralViews,6);assert.deepEqual(catalog.coverage.directionsProduced,['southeast']);assert.equal(catalog.coverage.animationClips,0);
assert.equal(catalog.artApproved,false);assert.equal(catalog.runtimeImported,false);
assert.equal(registration.artApproved,false);assert.equal(registration.runtimeImported,false);assert.equal(registration.sources.length,6);
assert.equal(await hashFile(local(registration.measurementFile)),registration.measurementSha256);
if(catalog.gdd?.file)assert.equal(await hashFile(inWorkspace(catalog.gdd.file)),catalog.gdd.sha256);
const standardRoot=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1'),directions=await json(resolve(standardRoot,'directions.json'));
const standard=directions.directions.find(reference=>reference.direction==='southeast');assert.ok(standard);
const reference=catalog.primaryReference,referenceFile=local(reference.file);
assert.equal(await hashFile(referenceFile),reference.sha256);assert.equal(reference.sha256,standard.nativeSha256);
assert.deepEqual(await rgba(referenceFile),await rgba(safe(standardRoot,standard.native)));
assert.equal(await hashFile(inWorkspace(standard.atlas)),standard.atlasSha256);
const live=await sharp(inWorkspace(standard.atlas)).extract({left:standard.rect.x,top:standard.rect.y,width:standard.rect.w,height:standard.rect.h}).ensureAlpha().raw().toBuffer();
assert.deepEqual(live,await rgba(referenceFile),'Primary reference must be the actual live Wang atlas frame.');
const basisPins=[{file:referenceFile,sha256:reference.sha256},{file:inWorkspace(standard.atlas),sha256:standard.atlasSha256},{file:inWorkspace('docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp')}];
for(const pin of basisPins)pin.sha256??=await hashFile(pin.file);
let sourceHashesChecked=0;
for(const actor of catalog.actors){
 assert.deepEqual(actor.canvas,[64,96]);assert.deepEqual(actor.pivot,[32,88]);assert.equal(actor.bodyHeightPx,80);assert.equal(actor.direction,'southeast');
 assert.deepEqual(actor.brief,gdd.npcs.find(npc=>npc.id===actor.id),'Review must show the authored GDD record.');
 assert.equal(actor.brief.wave,'A');assert.equal(actor.brief.animation.directions,8);assert.deepEqual(actor.brief.animation.minimum,['idle','talk']);
 assert.equal(await hashFile(local(actor.sprite)),actor.spriteSha256);
 const measured=registration.sources.find(source=>source.id===actor.id);assert.ok(measured);assert.equal(measured.spriteSha256,actor.spriteSha256);assert.equal(measured.sourceSha256,actor.sourceSha256);assert.equal(measured.visuallyReviewed,true);assert.equal(measured.alphaThreshold,128);assert.equal(measured.rgbPainted,false);assert.equal(measured.componentsRemoved,0);assert.deepEqual(measured.canvas,actor.canvas);assert.deepEqual(measured.pivot,actor.pivot);assert.ok(Math.abs(measured.scale-80/(measured.sourcePivot[1]-measured.bodyTopY))<1e-9,'Native body keeps one measured source scale.');assert.ok(measured.rootBasis.length>20);assert.ok(measured.nativeBounds[0]>=0&&measured.nativeBounds[1]>=0&&measured.nativeBounds[2]<=actor.canvas[0]&&measured.nativeBounds[3]<=actor.canvas[1]);
 const metadata=await sharp(local(actor.sprite)).metadata();assert.deepEqual([metadata.width,metadata.height],[64,96]);assert.equal(metadata.hasAlpha,true);
 const pixels=await rgba(local(actor.sprite));assert.ok(pixels.some((value,index)=>index%4===3&&value===255),'Native sprite must contain opaque subject pixels.');assert.ok(pixels.some((value,index)=>index%4===3&&value===0),'Native must have transparency.');
 for(const [fileKey,hashKey]of [['raw','rawSha256'],['prompt','promptSha256'],['routerMetadata','routerMetadataSha256'],['metadata','metadataSha256']])if(actor[fileKey]){await readFile(local(actor[fileKey]));if(actor[hashKey]){assert.equal(await hashFile(local(actor[fileKey])),actor[hashKey]);sourceHashesChecked++;}}
 const metadataFile=actor.routerMetadata??actor.metadata??actor.raw.replace(/\.png$/i,'.json');
 const router=await json(local(metadataFile));assert.equal(router.model,'gpt-image-2');assert.equal(router.operation,'edit');
 assert.equal(router.image.sha256,await hashFile(local(actor.raw)),'Router source image hash must match selected raw.');
 assert.equal(actor.sourceSha256,router.image.sha256);
 assert.equal(router.inputImages[0].sha256,standard.nearest8xSha256,'New neutral Image1 must use live Wang SE.');
 for(const input of router.inputImages){const path=isAbsolute(input.path)?input.path:inWorkspace(input.path);safe(workspace,relative(workspace,path));assert.equal(await hashFile(path),input.sha256);}
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{try{const path=inWorkspace('.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const comparePixels=(actual,expected,label)=>{assert.equal(actual.length,expected.length,label);for(let index=0;index<expected.length;index+=4){assert.equal(actual[index+3],expected[index+3],`${label}: alpha`);if(expected[index+3]===255)for(let channel=0;channel<3;channel++)assert.equal(actual[index+channel],expected[index+channel],`${label}: opaque RGB`);}};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[],failedRequests=[],writes=[];
 await page.addInitScript(()=>{window.__reviewWrites=[];for(const method of ['setItem','removeItem','clear'])Object.defineProperty(Storage.prototype,method,{configurable:true,value(){window.__reviewWrites.push(method);throw Error('Review attempted storage write');}});Object.defineProperty(IDBFactory.prototype,'open',{configurable:true,value(){window.__reviewWrites.push('indexedDB.open');throw Error('Review attempted database open');}});});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.method()!=='GET')writes.push({url:request.url(),method:request.method()});assert.ok(!/\/api\/|\/room\b|\/commands\b/.test(request.url()),'Review must not request gameplay APIs.');});
 page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))failedRequests.push({url:response.url(),status:response.status()});});
 const url='http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-wave-a-concepts-v1/index.html';
 await page.goto(url);await page.waitForFunction(()=>['true','error'].includes(document.body.dataset.ready));assert.equal(await page.locator('body').getAttribute('data-ready'),'true',await page.locator('#status').textContent());
 assert.equal(await page.locator('.actor-card').count(),6);assert.equal(await page.locator('#actor option').count(),6);
 assert.equal(await page.locator('#stage').evaluate(canvas=>canvas.width),960);assert.equal(await page.locator('#stage').evaluate(canvas=>canvas.height),420);
 await page.locator('#roots').uncheck();
 const state=()=>page.evaluate(()=>window.__npcNeutralReview());
 let browserScenarios=0,pixelPairs=0,cardPairs=0,lineupSprites=0;
 for(const actor of catalog.actors){
  const card=page.locator(`.actor-card[data-id="${actor.id}"] canvas`),bytes=Buffer.from((await card.evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64');
  const expectedWang=await sharp(referenceFile).resize(128,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),expectedActor=await sharp(local(actor.sprite)).resize(128,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();
  comparePixels(await sharp(bytes).extract({left:12,top:0,width:128,height:192}).ensureAlpha().raw().toBuffer(),expectedWang,'Card Wang');
  comparePixels(await sharp(bytes).extract({left:148,top:0,width:128,height:192}).ensureAlpha().raw().toBuffer(),expectedActor,'Card NPC');cardPairs++;
  await page.locator('#actor').selectOption(actor.id);assert.equal(await page.locator('#detail h3').textContent(),actor.name);assert.equal(await page.evaluate(()=>new URLSearchParams(location.hash.slice(1)).get('actor')),actor.id);
  assert.ok((await page.locator('#detail').textContent()).includes(actor.brief.look));assert.ok((await page.locator('#detail').textContent()).includes(actor.brief.brief));
  for(const scene of ['map','light','dark'])for(const zoom of [1,2]){
   await page.locator('#scene').selectOption(scene);await page.locator(`[data-zoom="${zoom}"]`).click();const current=await state();assert.equal(current.actor,actor.id);assert.equal(current.zoom,zoom);assert.equal(current.scene,scene);assert.equal(current.direction,'southeast');assert.equal(current.referenceHash,reference.sha256);assert.deepEqual(current.positions,[[270,320],[690,320]]);
   for(const [index,file]of [referenceFile,local(actor.sprite)].entries()){
    const [x,y]=current.positions[index],left=x-32*zoom,top=y-88*zoom,actual=Buffer.from(await page.locator('#stage').evaluate((canvas,rect)=>Array.from(canvas.getContext('2d').getImageData(rect.left,rect.top,rect.width,rect.height).data),{left,top,width:64*zoom,height:96*zoom}));
    const expected=await sharp(file).resize(64*zoom,96*zoom,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();
    for(let pixel=0;pixel<expected.length;pixel+=4)if(expected[pixel+3]===255)for(let channel=0;channel<3;channel++)assert.equal(actual[pixel+channel],expected[pixel+channel],`${actor.name} ${scene} ${zoom}x: actual subject RGB`);
   }
   browserScenarios++;pixelPairs++;
   if(scene==='map')await page.locator('#stage').screenshot({path:local(`review/${actor.slug}-map-${zoom}x.png`)});
  }
 }
 assert.equal(browserScenarios,36);assert.equal(pixelPairs,36);assert.equal(cardPairs,6);
 for(const zoom of [1,2]){
  await page.locator(`[data-zoom="${zoom}"]`).click();const current=await state();
  for(const [index,file]of [referenceFile,...catalog.actors.map(actor=>local(actor.sprite))].entries()){
   const [x,y]=current.lineupPositions[index],actual=Buffer.from(await page.locator('#lineup').evaluate((canvas,rect)=>Array.from(canvas.getContext('2d').getImageData(rect.left,rect.top,rect.width,rect.height).data),{left:x-32*zoom,top:y-88*zoom,width:64*zoom,height:96*zoom}));
   const expected=await sharp(file).resize(64*zoom,96*zoom,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();for(let pixel=0;pixel<expected.length;pixel+=4)if(expected[pixel+3]===255)for(let channel=0;channel<3;channel++)assert.equal(actual[pixel+channel],expected[pixel+channel],'Lineup must draw actual subject at the shared floor.');lineupSprites++;
  }
  await page.locator('#lineup').screenshot({path:local(`review/lineup-${zoom}x.png`)});
 }
 await page.locator('#roots').check();await page.locator('#roots').uncheck();await page.locator('#silhouette').check();assert.equal((await state()).silhouette,true);await page.locator('#silhouette').uncheck();
 assert.ok((await page.locator('#coverage-counts').textContent()).includes('0 clip chuyển động'));
 await page.screenshot({path:local('review/desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#stage').evaluate(canvas=>canvas.getBoundingClientRect().width),960);assert.equal(await page.locator('#lineup').evaluate(canvas=>canvas.getBoundingClientRect().width),1008);await page.screenshot({path:local('review/mobile.png'),fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.deepEqual(await page.evaluate(()=>window.__reviewWrites),[]);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
 for(const pin of basisPins)assert.equal(await hashFile(pin.file),pin.sha256,'Live Wang and map reference must remain unchanged.');
 assert.equal(await hashFile(local('catalog.json')),catalogSha256,'Catalog changed during fixture verification.');assert.equal(await hashFile(local('registration.json')),registrationSha256,'Registration changed during fixture verification.');
 const result={passed:true,catalogSha256,registrationSha256,actors:6,neutralViews:6,directionsProduced:['southeast'],animationClips:0,browserScenarios,actualPixelPairs:pixelPairs,transparentCardPairs:cardPairs,lineupSpritesVerified:lineupSprites,nativeCanvas:[64,96],nativePivot:[32,88],nativeHeightPx:80,styleBasis:'live-Wang-Lin-Pixel02-primary-reference',primaryReferenceSha256:reference.sha256,sourceHashesChecked,mobileWidth:390,nativeSizePreserved:true,storageWrites:writes,errors,failedRequests,artApproved:false,runtimeImported:false,ownerMapEdited:false,verificationScope:'Technical pixel/geometry/browser verification; owner appearance review remains separate.'};
 await writeFile(local('review/verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();await new Promise(done=>server.close(done));}
