import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {resolve, dirname, relative, isAbsolute, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), workspace = resolve(root, '../../../..');
const actions = ['idle', 'talk', 'profession'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const hashFile = async file => digest(await readFile(file));
function safe(base, file) { const path = resolve(base, file), rel = relative(base, path); assert.ok(!rel.startsWith('..') && !isAbsolute(rel), `Outside ${base}: ${file}`); return path; }
const local = file => safe(root, file), inWorkspace = file => safe(workspace, file);
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const rawRgba = async file => sharp(file).ensureAlpha().raw().toBuffer();
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-wave-a-motion-v1');
const catalog = await json(local('catalog.json')), registration = await json(local('registration.json'));
const catalogSha256=await hashFile(local('catalog.json')),registrationSha256=await hashFile(local('registration.json'));
const expectedIds=['NPC-HN-HERBALIST','NPC-HN-FORGE','NPC-HN-ROUTE-KEEPER','NPC-HN-GATE-WARDEN','NPC-HN-DISCIPLE-WATER','NPC-HN-DISCIPLE-SWORD'];
assert.equal(catalog.actors.length, 6);
assert.deepEqual(new Set(catalog.actors.map(actor => actor.id)), new Set(expectedIds));
assert.deepEqual(catalog.coverage.producedDirections, ['southeast']);
assert.equal(catalog.coverage.pendingDirections.length, 7);
assert.deepEqual(new Set(catalog.coverage.pendingDirections),new Set(['north','northeast','east','south','southwest','west','northwest']));
assert.equal(catalog.coverage.clips, 18); assert.equal(catalog.coverage.poses, 108); assert.equal(catalog.coverage.fullDirectionalSet, false);
assert.equal(catalog.artApproved, false); assert.equal(catalog.ownerApproved, false); assert.equal(catalog.runtimeImported, false);
assert.equal(registration.artApproved, false); assert.equal(registration.ownerApproved, false); assert.equal(registration.runtimeImported, false);
assert.deepEqual(catalog.contract.canvas, [96,96]); assert.deepEqual(catalog.contract.pivot, [48,88]);
assert.equal(catalog.contract.paddingOnly,true);assert.equal(Object.values(catalog.clips).length,18);
const neutralRoot=resolve(root,'../van-hai-npc-wave-a-concepts-v1'),neutralCatalog=await json(resolve(neutralRoot,'catalog.json'));
const approvalFile=resolve(neutralRoot,'approval.json'),approval=await json(approvalFile),approvalSha256=await hashFile(approvalFile);
assert.equal(catalog.neutralApproval.file,'../van-hai-npc-wave-a-concepts-v1/approval.json');assert.equal(catalog.neutralApproval.sha256,approvalSha256);assert.equal(catalog.neutralApproval.pinnedCount,45);
assert.equal(approval.ownerApproved,true);assert.equal(approval.artApproved,true);assert.equal(approval.motionApproved,false);assert.equal(approval.runtimeApproved,false);assert.equal(approval.pinnedFiles.length,45);
assert.equal(approval.scope.pose,'neutral');assert.equal(approval.scope.clips,0);assert.equal(approval.scope.poses,6);assert.deepEqual(approval.scope.directions,['southeast']);assert.deepEqual(new Set(approval.scope.actors.map(actor=>actor.id)),new Set(expectedIds));
async function neutralUnchanged(){for(const pin of approval.pinnedFiles)assert.equal(await hashFile(safe(neutralRoot,pin.file)),pin.sha256,'Approved neutral changed: '+pin.file);assert.equal(await hashFile(approvalFile),approvalSha256);}
await neutralUnchanged();
assert.equal(await hashFile(local(registration.registrationInput)), registration.registrationInputSha256);
assert.equal(await hashFile(inWorkspace(catalog.gdd.file)), catalog.gdd.sha256);
for (const target of catalog.morphologyBasis.targets) assert.equal(await hashFile(inWorkspace(target.file)), target.sha256);
assert.equal(await hashFile(inWorkspace(catalog.morphologyBasis.liveNativeFile)), catalog.morphologyBasis.liveNativeSha256);
const standard = await json(inWorkspace(catalog.morphologyBasis.basisFile));
assert.equal(await hashFile(inWorkspace(standard.sourceCatalog)), standard.sourceCatalogSha256);
assert.equal(await hashFile(inWorkspace(standard.atlas)), standard.atlasSha256);
const live = await sharp(inWorkspace(standard.atlas)).extract({left:standard.rect.x,top:standard.rect.y,width:standard.rect.w,height:standard.rect.h}).ensureAlpha().raw().toBuffer();
assert.deepEqual(live, await rawRgba(inWorkspace(catalog.morphologyBasis.liveNativeFile)), 'Primary NPC comparison must equal live Wang frame RGBA.');
for (const source of catalog.sources) {
 assert.equal(await hashFile(local(source.file)), source.sha256);
 assert.equal(await hashFile(local(source.prompt)), source.promptSha256);
 assert.equal(await hashFile(local(source.routerMetadata)), source.routerMetadataSha256);
 assert.ok(source.inputs.some(input => input.sha256 === standard.nearest8x.sha256), 'Actual live Wang input required.');
 for (const input of source.inputs) assert.equal(await hashFile(inWorkspace(input.path)), input.sha256);
}
let framesVerified = 0;
for (const actor of catalog.actors) {
 const approved=neutralCatalog.actors.find(item=>item.id===actor.id),identity=actor.identityReference;assert.ok(approved);assert.ok(identity);assert.deepEqual(identity.canvas,[64,96]);assert.deepEqual(identity.pivot,[32,88]);assert.equal(identity.sha256,approved.spriteSha256);assert.equal(await hashFile(local(identity.file)),identity.sha256);assert.deepEqual(await rawRgba(local(identity.file)),await rawRgba(safe(neutralRoot,approved.sprite)),'Motion identity reference must retain the accepted neutral pixels.');
 assert.equal(await hashFile(local(actor.neutralSprite)), actor.neutralSha256);
 const measure = registration.actors.find(item => item.slug === actor.slug); assert.ok(measure);
 assert.equal(measure.frames.length, 18); assert.equal(measure.scale, actor.sourceScale);
 for (const frame of measure.frames) { assert.equal(frame.scale, actor.sourceScale); assert.equal(frame.rgbPainted, false); assert.equal(frame.resampling, 'nearest-once'); }
 for (const action of actions) {
  const clip = actor.clips[action]; assert.equal(clip.frames.length,6); assert.deepEqual(clip.canvas,[96,96]); assert.deepEqual(clip.pivot,[48,88]);
  assert.equal(clip.actor,actor.id);assert.equal(clip.action,action);assert.equal(clip.direction,'southeast');assert.equal(clip.loop,action!=='profession');assert.deepEqual(catalog.clips[clip.id],clip);assert.equal(clip.atlasPadding,2);
  assert.equal(await hashFile(local(clip.atlas)), clip.atlasSha256);
  assert.ok(new Set(clip.frames.map(frame => frame.sha256)).size > 1, 'Motion must contain different actual poses.');
  assert.equal(clip.frames.reduce((sum,frame)=>sum+frame.durationMs,0),clip.durationMs);
  const metadata = await sharp(local(clip.atlas)).metadata(); assert.deepEqual([metadata.width,metadata.height],clip.atlasSize);
  const atlasRaw=await rawRgba(local(clip.atlas));
  for (const frame of clip.frames) {
   assert.equal(await hashFile(local(frame.file)),frame.sha256); assert.ok(frame.durationMs>0);
   assert.equal(frame.w,96); assert.equal(frame.h,96);
   const atlasPixels=await sharp(local(clip.atlas)).extract({left:frame.x,top:frame.y,width:frame.w,height:frame.h}).ensureAlpha().raw().toBuffer();
   assert.deepEqual(atlasPixels,await rawRgba(local(frame.file)),'Canonical / atlas pixels must match.'); framesVerified++;
   for(let y=frame.y-2;y<frame.y+98;y++)for(let x=frame.x-2;x<frame.x+98;x++)if(x<frame.x||x>=frame.x+96||y<frame.y||y>=frame.y+96)assert.equal(atlasRaw[(y*metadata.width+x)*4+3],0,'Atlas gutter must stay transparent.');
  }
 }
}
assert.equal(framesVerified,108);
const mapFile=inWorkspace('docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp'), mapHash=await hashFile(mapFile);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{try{const path=inWorkspace('.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const bytes=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[],requests=[],writes=[];
 await page.addInitScript(()=>{window.__reviewWrites=[];for(const method of ['setItem','removeItem','clear'])Object.defineProperty(Storage.prototype,method,{configurable:true,value(){window.__reviewWrites.push(method);throw Error('Review attempted storage write');}});Object.defineProperty(IDBFactory.prototype,'open',{configurable:true,value(){window.__reviewWrites.push('indexedDB.open');throw Error('Review attempted database open');}});});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.method()!=='GET'||/\/api\/|\/room\b|\/commands\b/.test(request.url()))writes.push({url:request.url(),method:request.method()});});
 page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))requests.push({url:response.url(),status:response.status()});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-wave-a-motion-v1/index.html');
 await page.waitForFunction(()=>['true','error'].includes(document.body.dataset.ready));
 assert.equal(await page.locator('body').getAttribute('data-ready'),'true',await page.locator('#status').textContent());
 assert.equal(await page.locator('.actor-card').count(),6); assert.equal(await page.locator('#actor option').count(),6);assert.equal(await page.locator('body').getAttribute('data-neutral-approved'),'true');
 await page.locator('#roots').uncheck();
 const state=()=>page.evaluate(()=>window.__npcMotionReview());
 const stageHash=async()=>digest(Buffer.from((await page.locator('#stage').evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64'));
 const stageBodyHash=async()=>digest(Buffer.from(await page.locator('#stage').evaluate(canvas=>Array.from(canvas.getContext('2d').getImageData(872,382,96,96).data))));
 let scenarios=0, contactPoses=0, motionClips=0,identityRefsVerified=0,loopWraps=0,oneShots=0;
 for (const actor of catalog.actors) {
  await page.locator('#actor').selectOption(actor.id);
  assert.equal(await page.locator('#detail h3').textContent(),actor.name);
  assert.equal(await page.locator('.pose').count(),18);
  await page.locator('#scene').selectOption('light');await page.locator('[data-zoom="1"]').click();
  const initial=await state();assert.equal(initial.neutralApproved,true);assert.equal(initial.motionArtApproved,false);assert.deepEqual(initial.positions,[[220,470],[560,470],[920,470]]);assert.equal(initial.identityReference.sha256,actor.identityReference.sha256);assert.equal(initial.primaryHash,catalog.morphologyBasis.liveNativeSha256);
  const pairBytes=Buffer.from((await page.locator('#identity-pair').evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64');
  assert.deepEqual(await sharp(pairBytes).extract({left:36,top:0,width:128,height:192}).ensureAlpha().raw().toBuffer(),await sharp(local(actor.identityReference.file)).resize(128,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),'Identity pair must use the accepted neutral pixels.');
  assert.deepEqual(await sharp(pairBytes).extract({left:204,top:0,width:192,height:192}).ensureAlpha().raw().toBuffer(),await sharp(local(actor.neutralSprite)).resize(192,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),'Identity pair must use the generated neutral calibration pixels.');
  for(const [file,left]of [[inWorkspace(catalog.morphologyBasis.liveNativeFile),188],[local(actor.identityReference.file),528]]){
   const pixels=Buffer.from(await page.locator('#stage').evaluate((canvas,left)=>Array.from(canvas.getContext('2d').getImageData(left,382,64,96).data),left)),expected=await rawRgba(file);
   for(let index=0;index<expected.length;index+=4)if(expected[index+3]===255)for(let channel=0;channel<3;channel++)assert.equal(pixels[index+channel],expected[index+channel],'Wang and accepted NPC reference must draw at native1x on the shared floor.');
  }identityRefsVerified++;
  for (const action of actions) {
   await page.locator('#action').selectOption(action);
   assert.equal((await state()).action,action); assert.equal((await state()).frameIndex,0); assert.equal((await state()).timeMs,0);
   for (const scene of ['map','light','dark']) for (const zoom of [1,2,4]) {
    await page.locator('#scene').selectOption(scene); await page.locator('[data-zoom="'+zoom+'"]').click(); scenarios++;
    if(scene==='map'&&zoom===1)await page.locator('#stage').screenshot({path:local('review/'+actor.slug+'-'+action+'-map-1x.png')});
   }
   await page.locator('#scene').selectOption('light'); await page.locator('[data-zoom="1"]').click();
   for(let index=0;index<6;index++){
    await page.locator(`.pose[data-action="${action}"][data-index="${index}"]`).click();
    const current=await state(); assert.equal(current.frameIndex,index); assert.equal(current.playing,false);
    assert.deepEqual([current.frameRect.x,current.frameRect.y,current.frameRect.w,current.frameRect.h],[actor.clips[action].frames[index].x,actor.clips[action].frames[index].y,96,96]);
    const cell=page.locator(`.pose[data-action="${action}"][data-index="${index}"] canvas`);
    const cellBytes=Buffer.from((await cell.evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64');
    const expectedPixels=await sharp(local(actor.clips[action].frames[index].file)).resize(192,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();
    assert.deepEqual(await sharp(cellBytes).ensureAlpha().raw().toBuffer(),expectedPixels,'Contact cell must display actual atlas pose pixels.');
    const stagePixels=Buffer.from(await page.locator('#stage').evaluate(canvas=>Array.from(canvas.getContext('2d').getImageData(872,382,96,96).data))),expectedStage=await rawRgba(local(actor.clips[action].frames[index].file));
    for(let pixel=0;pixel<expectedStage.length;pixel+=4)if(expectedStage[pixel+3]===255)for(let channel=0;channel<3;channel++)assert.equal(stagePixels[pixel+channel],expectedStage[pixel+channel],'Stage must draw actual current atlas pose at native1x.');
    contactPoses++;
   }
   const end=actor.clips[action].durationMs;
   await page.locator('#seek').evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},end);
   assert.equal((await state()).frameIndex,5); assert.equal((await state()).timeMs,end);
   const terminal=await stageHash(); await page.waitForTimeout(100); assert.equal(await stageHash(),terminal,'Paused seek-end must remain stable.');
   await page.locator('#reset').click(); assert.equal((await state()).frameIndex,0); assert.equal((await state()).timeMs,0);
   const startImage=await stageBodyHash(),differentIndex=actor.clips[action].frames.findIndex(frame=>frame.sha256!==actor.clips[action].frames[0].sha256);
   await page.locator('#play').click();
   await page.waitForFunction(index=>window.__npcMotionReview().frameIndex===index,differentIndex,{timeout:5000});
   await page.locator('#play').click(); assert.equal((await state()).playing,false); assert.notEqual(await stageBodyHash(),startImage,'Playback must draw another actual frame in the body region.');
   const paused=await stageHash(), pausedState=await state(); await page.waitForTimeout(100);
   assert.equal(await stageHash(),paused,'Paused canvas must remain stable.'); assert.equal((await state()).timeMs,pausedState.timeMs);
   await page.locator('#speed').selectOption('2');
   if(actor.clips[action].loop){
    await page.locator('#seek').evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},end-20);await page.locator('#play').click();
    await page.waitForFunction(()=>{const current=window.__npcMotionReview();return current.playing&&current.timeMs<current.durationMs/2;},null,{timeout:5000});await page.locator('#play').click();assert.equal((await state()).playing,false);loopWraps++;
   }else{
    await page.locator('#reset').click();await page.locator('#play').click();await page.waitForFunction(()=>{const current=window.__npcMotionReview();return !current.playing&&current.timeMs===current.durationMs;},null,{timeout:5000});assert.equal((await state()).frameIndex,5);assert.equal((await state()).scheduled,false);oneShots++;
   }
   await page.locator('#speed').selectOption('1');
   motionClips++;
  }
 }
 assert.equal(scenarios,162); assert.equal(contactPoses,108); assert.equal(motionClips,18);assert.equal(identityRefsVerified,6);assert.equal(loopWraps,12);assert.equal(oneShots,6);
 await page.locator('#speed').selectOption('2'); assert.equal((await state()).speed,2);
 await page.locator('#speed').selectOption('0.5'); assert.equal((await state()).speed,0.5);
 await page.locator('#speed').selectOption('1');
 for(const toggle of ['roots','shadows','silhouette']){await page.locator('#'+toggle).check();await page.locator('#'+toggle).uncheck();}
 await page.locator('#action').selectOption('idle');await page.locator('#reset').click();await page.locator('#play').click();assert.equal((await state()).playing,true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await state()).playing,false);assert.equal((await state()).scheduled,false);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await state()).playing,false);
 await page.locator('#play').click();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));assert.equal((await state()).playing,false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));assert.equal((await state()).playing,false);
 await page.locator('#play').click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>{const current=window.__npcMotionReview();return current.reducedMotion&&!current.playing&&!current.scheduled&&document.querySelector('#play').disabled;},null,{timeout:5000});assert.equal((await state()).playing,false);assert.equal((await state()).scheduled,false);assert.equal(await page.locator('#play').isDisabled(),true);assert.equal((await state()).mediaWatcherActive,true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await state()).mediaWatcherActive,false);assert.equal((await state()).playing,false);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await state()).mediaWatcherActive,true);assert.equal((await state()).playing,false);
 await page.evaluate(()=>window.dispatchEvent(new Event('offline')));assert.equal((await state()).mediaWatcherActive,false);assert.equal((await state()).playing,false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));assert.equal((await state()).mediaWatcherActive,true);assert.equal((await state()).playing,false);
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert.equal((await state()).mediaWatcherActive,false);assert.equal((await state()).pageActive,false);await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));assert.equal((await state()).mediaWatcherActive,true);assert.equal((await state()).playing,false);
 await page.locator('.pose[data-action="idle"][data-index="2"]').click();assert.equal((await state()).frameIndex,2);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!window.__npcMotionReview().reducedMotion&&!document.querySelector('#play').disabled&&!window.__npcMotionReview().mediaWatcherActive,null,{timeout:5000});assert.equal((await state()).playing,false);assert.equal(await page.locator('#play').isDisabled(),false);
 await page.locator('#action').selectOption('idle'); await page.locator('#reset').click(); await page.locator('#scene').selectOption('map');
 await page.screenshot({path:local('review/desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.locator('#stage').evaluate(canvas=>canvas.getBoundingClientRect().width),1120);
 assert.equal(await page.locator('.pose canvas').first().evaluate(canvas=>canvas.getBoundingClientRect().width),192,'Contact cells retain integer2x on mobile.');
 await page.screenshot({path:local('review/mobile.png'),fullPage:true});
 assert.deepEqual(await page.evaluate(()=>window.__reviewWrites),[]);assert.deepEqual(writes,[]);
 const neutralPage=await browser.newPage({viewport:{width:1440,height:1050}});neutralPage.on('pageerror',error=>errors.push(error.message));await neutralPage.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-wave-a-concepts-v1/index.html');await neutralPage.waitForFunction(()=>['true','error'].includes(document.body.dataset.ready));assert.equal(await neutralPage.locator('body').getAttribute('data-ready'),'true');assert.equal(await neutralPage.locator('body').getAttribute('data-neutral-approved'),'true');assert.ok((await neutralPage.locator('.badges').textContent()).includes('Owner đã duyệt sáu neutral Đông Nam'));assert.ok((await neutralPage.locator('#coverage-counts').textContent()).includes('0 clip chuyển động'));await neutralPage.screenshot({path:local('review/approved-neutral-badge.png'),fullPage:true});await neutralPage.close();
 assert.deepEqual(errors,[]); assert.deepEqual(requests,[]); assert.equal(await hashFile(mapFile),mapHash);await neutralUnchanged();assert.equal(await hashFile(local('catalog.json')),catalogSha256);assert.equal(await hashFile(local('registration.json')),registrationSha256);
 const result={passed:true,catalogSha256,registrationSha256,approvedNeutralPinCount:45,approvedNeutralUnchanged:true,approvedNeutralBadgeVerified:true,actors:6,directions:['southeast'],directionsPending:7,clips:18,canonicalAtlasFramesVerified:framesVerified,contactPosesVerified:contactPoses,browserSceneZoomScenarios:scenarios,actualMotionClipsVerified:motionClips,approvedIdentityReferencesVerified:identityRefsVerified,loopWrapsVerified:loopWraps,professionOneShotsVerified:oneShots,pauseStable:true,seekEndStable:true,actionReset:true,hiddenOfflineReducedMotionPaused:true,mobileWidth:390,nativeStagePreserved:true,liveWangRgbaMatched:true,errors,requests,storageWrites:writes,artApproved:false,ownerApproved:false,runtimeImported:false,ownerMapEdited:false};
 await mkdir(local('review'),{recursive:true}); await writeFile(local('review/verification.json'),JSON.stringify(result,null,2)+'\n'); console.log(JSON.stringify(result,null,2));
} finally {await browser.close();await new Promise(done=>server.close(done));}
