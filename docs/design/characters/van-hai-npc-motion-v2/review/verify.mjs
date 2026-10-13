import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {resolve, dirname, relative, isAbsolute, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), workspace = resolve(root, '../../../..');
const directions = ['north','northeast','east','southeast','south','southwest','west','northwest'], actions = ['idle','talk','profession'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex'), hashFile = async file => digest(await readFile(file));
function safe(base, file) { const path = resolve(base, file), rel = relative(base, path); assert.ok(!rel.startsWith('..') && !isAbsolute(rel), `Outside ${base}: ${file}`); return path; }
const local = file => safe(root, file), inWorkspace = file => safe(workspace, file), asset = file => inWorkspace(relative(workspace, resolve(root, file)));
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const rawRgba = async file => sharp(file).ensureAlpha().raw().toBuffer();
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-motion-v2');
await mkdir(local('review'),{recursive:true});
const fixturePilot=process.argv.includes('--fixture-pilot');
const baselineRoot=resolve(root,'../van-hai-npc-motion-v1');
async function pilotFixture(){
 const original=await json(resolve(baselineRoot,'catalog.json')), clips={};
 const actors=original.actors.map(actor=>{
  const motions=Object.fromEntries(actions.map(action=>{const motion=actor.clips[action],clip={...motion,atlas:'../van-hai-npc-motion-v1/'+motion.atlas,frames:motion.frames.map(frame=>({...frame,file:'../van-hai-npc-motion-v1/'+frame.file}))};clips[clip.id]=clip;return[action,clip];}));
  return {id:actor.id,slug:actor.slug,name:actor.name,views:{southeast:{direction:'southeast',neutralSprite:'../van-hai-npc-motion-v1/'+actor.neutralSprite,neutralSha256:actor.neutralSha256,artApproved:true,clips:motions}}};
 });
 return {...original,actors,clips,sources:[],coverage:{requiredClips:96,producedClips:12,poses:72},runtimeImported:false};
}
const catalog=fixturePilot?await pilotFixture():await json(local('catalog.json'));
const registration=fixturePilot?{registrationInput:'../van-hai-npc-motion-v1/registration-input.json',registrationInputSha256:await hashFile(resolve(baselineRoot,'registration-input.json')),sources:[],artApproved:false,ownerApproved:false,runtimeImported:false}:await json(local('registration.json'));
const productionPlan=fixturePilot?null:await json(local('production-plan.json'));
assert.equal(catalog.actors.length,4);
assert.deepEqual(new Set(catalog.actors.map(actor=>actor.id)),new Set(['NPC-HN-GUIDE','NPC-HN-CULTIVATION','NPC-HN-TRAINING','NPC-HN-PREPARATION']));
assert.equal(catalog.runtimeImported,false); assert.deepEqual(catalog.contract.canvas,[96,96]); assert.deepEqual(catalog.contract.pivot,[48,88]);
const approval=await json(resolve(baselineRoot,'approval.json'));
const approvalSha256=await hashFile(resolve(baselineRoot,'approval.json'));
assert.equal(approval.ownerApproved,true); assert.equal(approval.motionApproved,true);
assert.deepEqual(approval.scope.directions,['southeast']); assert.equal(approval.scope.clips,12); assert.equal(approval.scope.poses,72);
async function baselineUnchanged(){for(const pinned of approval.pinnedFiles)assert.equal(await hashFile(safe(baselineRoot,pinned.file)),pinned.sha256,'Approved v1 changed: '+pinned.file);assert.equal(await hashFile(resolve(baselineRoot,'approval.json')),approvalSha256,'Approval file changed.');}
await baselineUnchanged();
const standardRoot=resolve(root,'../van-hai-npc-visual-standard-v1'), standard=await json(resolve(standardRoot,'directions.json'));
if(catalog.morphologyBasis?.directionsSha256)assert.equal(await hashFile(resolve(standardRoot,'directions.json')),catalog.morphologyBasis.directionsSha256);
if(catalog.gdd)assert.equal(await hashFile(inWorkspace(catalog.gdd.file)),catalog.gdd.sha256);
assert.deepEqual(new Set(standard.directions.map(reference=>reference.direction)),new Set(directions));
const refs=Object.fromEntries(standard.directions.map(reference=>[reference.direction,reference]));
for(const reference of standard.directions){
 assert.equal(await hashFile(safe(standardRoot,reference.native)),reference.nativeSha256);
 assert.equal(await hashFile(safe(standardRoot,reference.nearest8x)),reference.nearest8xSha256);
 assert.equal(await hashFile(inWorkspace(reference.atlas)),reference.atlasSha256);
 const live=await sharp(inWorkspace(reference.atlas)).extract({left:reference.rect.x,top:reference.rect.y,width:reference.rect.w,height:reference.rect.h}).ensureAlpha().raw().toBuffer();
 assert.deepEqual(live,await rawRgba(safe(standardRoot,reference.native)),'Wang native must equal actual same-direction live frame.');
}
const producedClips=catalog.actors.reduce((sum,actor)=>sum+Object.keys(actor.views).length*3,0), producedPoses=producedClips*6;
const missing=catalog.actors.flatMap(actor=>directions.filter(direction=>!actor.views[direction]).map(direction=>({actor:actor.id,direction})));
assert.equal(catalog.coverage.producedClips,producedClips);assert.equal(catalog.coverage.poses,producedPoses);assert.equal(catalog.coverage.requiredClips,96);
assert.equal(Object.values(catalog.clips).length,producedClips);
if(!fixturePilot){
 assert.equal(catalog.coverage.fullDirectionalSet,missing.length===0);
 assert.deepEqual(new Set(catalog.coverage.missing.map(item=>(item.actorId??item.actor)+'/'+item.direction)),new Set(missing.map(item=>item.actor+'/'+item.direction)));
 for(const actor of catalog.actors)assert.deepEqual(new Set(catalog.coverage.producedDirectionsByActor[actor.id]),new Set(Object.keys(actor.views)));
}
if(process.argv.includes('--require-full')){assert.equal(producedClips,96);assert.equal(missing.length,0);}
assert.equal(await hashFile(asset(registration.registrationInput)),registration.registrationInputSha256);
assert.equal(registration.runtimeImported,false);assert.equal(registration.artApproved,false);assert.equal(registration.ownerApproved,false);
assert.equal(catalog.sources.length,producedClips/3-4);assert.equal(registration.sources.length,catalog.sources.length);
for(const source of catalog.sources){
 const reference=refs[source.direction],measurement=registration.sources.find(item=>item.slug===source.slug&&item.direction===source.direction);
 assert.ok(measurement);assert.equal(source.sha256,measurement.sourceSha256);assert.equal(await hashFile(asset(source.file)),source.sha256);
 assert.equal(await hashFile(asset(source.prompt)),source.promptSha256);assert.equal(await hashFile(asset(source.routerMetadata)),source.routerMetadataSha256);
 const request=productionPlan.requests.find(item=>item.slug===source.slug&&item.direction===source.direction);
 assert.ok(request,'Source requires a matching planned actor/direction.');assert.equal(request.source,source.file,'Catalog must use the selected planned source.');
 const policy=source.referencePolicy??{stage:'new-neutral-or-view',editTargetFirst:false,primaryStyleImageIndex:1};
 if(policy.stage==='action-correction'){
  assert.equal(request.referencePolicy?.stage,'action-correction','Action correction must be explicitly declared in the plan.');
  assert.equal(policy.editTargetFirst,true);assert.equal(policy.primaryStyleImageIndex,2);assert.equal(source.primaryStyleImageIndex,2);assert.equal(policy.neutralIntentPreserved,true);
  for(const key of ['editTargetFirst','primaryStyleImageIndex','neutralIntentPreserved','editTargetFile','editTargetSha256'])assert.equal(policy[key],request.referencePolicy[key],'Action source policy must match the pinning plan.');
  assert.ok(new RegExp('^raw/'+source.slug+'-'+source.direction+'(?:-[a-z0-9]+)*\\.png$').test(policy.editTargetFile),'Action target must be this same NPC and actual direction.');
  assert.notEqual(policy.editTargetFile,source.file,'Action target must be a retained previous source.');
  assert.ok(request.sourceRevisions?.some(revision=>revision.source===policy.editTargetFile&&revision.sha256===policy.editTargetSha256),'Action target must occur in pinned previous same-direction source revisions.');
  assert.equal(await hashFile(asset(policy.editTargetFile)),policy.editTargetSha256);
  const targetMetadata=await json(asset(policy.editTargetFile.replace(/\.png$/i,'.json')));
  assert.equal(targetMetadata.model,'gpt-image-2');assert.equal(targetMetadata.operation,'edit');assert.equal(targetMetadata.image.sha256,policy.editTargetSha256);
  assert.equal(targetMetadata.inputImages?.[0]?.sha256,reference.nearest8xSha256,'Existing neutral/view target must originate from same-direction live Wang Image1.');
  for(const input of targetMetadata.inputImages??[])assert.equal(await hashFile(inWorkspace(input.path)),input.sha256,'Original action-target generation input changed.');
  assert.equal(source.inputs[0].sha256,policy.editTargetSha256,'Action Image1 must be the pinned same-NPC/same-direction edit target.');
  assert.equal(source.inputs[0].role,'edit-target','Action Image1 must be the declared edit target.');
  assert.equal(inWorkspace(source.inputs[0].path),asset(policy.editTargetFile),'Action Image1 must resolve to the pinned target file.');
  assert.equal(source.inputs[1].sha256,reference.nearest8xSha256,'Action Image2 must be same-direction live Wang, still the primary style/anatomy reference.');
 }else{
  assert.equal(policy.stage,'new-neutral-or-view','No other reference order is accepted.');assert.equal(policy.editTargetFirst??false,false);assert.equal(policy.primaryStyleImageIndex??1,1);assert.equal(source.primaryStyleImageIndex??1,1);
  assert.ok(!request.referencePolicy||request.referencePolicy.stage==='new-neutral-or-view');
  assert.equal(source.inputs[0].sha256,reference.nearest8xSha256,'New neutral/view Image1 must be actual live Wang in the source direction.');
 }
 for(const input of source.inputs)assert.equal(await hashFile(inWorkspace(input.path)),input.sha256);
 assert.equal(measurement.frames.length,18);assert.ok(Math.abs(measurement.scale-80/measurement.neutralHeight)<1e-9);
 for(const frame of measurement.frames){assert.equal(frame.scale,measurement.scale);assert.equal(frame.rgbPainted,false);assert.equal(frame.resampling,'nearest-once');assert.equal(frame.opaquePixelsDropped,0);}
}
let framesVerified=0, guttersVerified=0, neutralVerified=0;
for(const actor of catalog.actors){
 assert.ok(actor.views.southeast,'Approved SE view is required.');
 for(const [direction,view]of Object.entries(actor.views)){
  assert.ok(directions.includes(direction));assert.equal(view.direction,direction);assert.equal(view.artApproved,direction==='southeast');
  assert.equal(await hashFile(asset(view.neutralSprite)),view.neutralSha256);neutralVerified++;
  if(direction==='southeast')assert.ok(view.neutralSprite.startsWith('../van-hai-npc-motion-v1/'),'SE must link pinned v1.');
  for(const action of actions){
   const clip=view.clips[action];assert.equal(clip.direction,direction);assert.equal(clip.action,action);assert.equal(clip.actor,actor.id);
   assert.deepEqual(catalog.clips[clip.id],clip);assert.equal(clip.frames.length,6);assert.deepEqual(clip.canvas,[96,96]);assert.deepEqual(clip.pivot,[48,88]);assert.equal(clip.atlasPadding,2);
   assert.equal(await hashFile(asset(clip.atlas)),clip.atlasSha256);assert.equal(clip.frames.reduce((sum,frame)=>sum+frame.durationMs,0),clip.durationMs);
   const metadata=await sharp(asset(clip.atlas)).metadata();assert.deepEqual([metadata.width,metadata.height],clip.atlasSize);
   const raw=await rawRgba(asset(clip.atlas)), pixelHashes=[];
   for(const frame of clip.frames){
    assert.equal(await hashFile(asset(frame.file)),frame.sha256);assert.ok(frame.durationMs>0);assert.equal(frame.w,96);assert.equal(frame.h,96);
    assert.ok(frame.x>=2&&frame.y>=2&&frame.x+96+2<=metadata.width&&frame.y+96+2<=metadata.height);
    const pixels=await sharp(asset(clip.atlas)).extract({left:frame.x,top:frame.y,width:frame.w,height:frame.h}).ensureAlpha().raw().toBuffer();
    assert.deepEqual(pixels,await rawRgba(asset(frame.file)),'Canonical / atlas pixels must match.');pixelHashes.push(digest(pixels));framesVerified++;
    for(let y=frame.y-2;y<frame.y+98;y++)for(let x=frame.x-2;x<frame.x+98;x++)if(x<frame.x||x>=frame.x+96||y<frame.y||y>=frame.y+96)assert.equal(raw[(y*metadata.width+x)*4+3],0,'Transparent 2px gutter prevents neighbour bleed.');guttersVerified++;
   }
   assert.ok(new Set(pixelHashes).size>1,'Actual clip poses must change pixels.');
   if(direction==='southeast'){assert.ok(clip.atlas.startsWith('../van-hai-npc-motion-v1/'));for(const frame of clip.frames)assert.ok(frame.file.startsWith('../van-hai-npc-motion-v1/'));}
  }
 }
}
assert.equal(framesVerified,producedPoses);
const mapFile=inWorkspace('docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp'),mapHash=await hashFile(mapFile);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{try{const path=inWorkspace('.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const bytes=fixturePilot&&path===local('catalog.json')?Buffer.from(JSON.stringify(catalog)):await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))requests.push({url:response.url(),status:response.status()});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-motion-v2/index.html');
 await page.waitForFunction(()=>['true','error'].includes(document.body.dataset.ready));
 assert.equal(await page.locator('body').getAttribute('data-ready'),'true',await page.locator('#status').textContent());
 assert.equal(await page.locator('.actor-card').count(),4);assert.equal(await page.locator('#actor option').count(),4);assert.equal(await page.locator('#direction option').count(),8);
 await page.locator('#roots').uncheck();
 const state=()=>page.evaluate(()=>window.__npcMotionReview());
 const stageHash=async()=>digest(Buffer.from((await page.locator('#stage').evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64'));
 const stageBodyHash=async()=>digest(Buffer.from(await page.locator('#stage').evaluate(canvas=>Array.from(canvas.getContext('2d').getImageData(642,382,96,96).data))));
 let scenarios=0,contactPoses=0,motionClips=0,missingChecked=0,neutralPairsChecked=0,stagePrimaryReferencesChecked=0;
 const setSceneZoom=async(scene,zoom)=>page.evaluate(({scene,zoom})=>{const selector=document.querySelector('#scene');selector.value=scene;selector.dispatchEvent(new Event('change'));document.querySelector(`[data-zoom="${zoom}"]`).click();},{scene,zoom});
 for(const actor of catalog.actors){
  await page.locator('#actor').selectOption(actor.id);assert.equal(await page.locator('#detail h3').textContent(),actor.name);assert.equal(await page.locator('.direction-card').count(),8);
  for(const direction of directions){
   const reference=refs[direction],view=actor.views[direction];await page.locator('#direction').selectOption(direction);
   const initial=await state();assert.equal(initial.direction,direction);assert.equal(initial.primaryHash,reference.nativeSha256);assert.equal(initial.primaryPath,'../van-hai-npc-visual-standard-v1/'+reference.native);assert.equal(initial.playing,false);assert.equal(initial.timeMs,0);
   await setSceneZoom('light',1);
   const stagePrimaryPixels=Buffer.from(await page.locator('#stage').evaluate(canvas=>Array.from(canvas.getContext('2d').getImageData(238,382,64,96).data)));
   const expectedPrimaryPixels=await rawRgba(safe(standardRoot,reference.native));
   for(let index=0;index<expectedPrimaryPixels.length;index+=4)if(expectedPrimaryPixels[index+3]===255)for(let channel=0;channel<3;channel++)assert.equal(stagePrimaryPixels[index+channel],expectedPrimaryPixels[index+channel],'Stage must draw Wang in the same actual direction at1x.');stagePrimaryReferencesChecked++;
   const matrixBytes=Buffer.from((await page.locator(`.direction-card[data-direction="${direction}"] canvas`).evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64');
   const matrixPlayer=await sharp(matrixBytes).extract({left:16,top:0,width:128,height:192}).ensureAlpha().raw().toBuffer();
   assert.deepEqual(matrixPlayer,await sharp(safe(standardRoot,reference.native)).resize(128,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),'Matrix primary reference must be same-direction Wang byte pixels at 2x.');
   if(!view){assert.equal(initial.available,false);assert.equal(await page.locator('.pose').count(),0);assert.equal(await page.locator('#play').isDisabled(),true);assert.equal(initial.frameIndex,null);missingChecked++;continue;}
   const matrixNeutral=await sharp(matrixBytes).extract({left:160,top:0,width:192,height:192}).ensureAlpha().raw().toBuffer();
   assert.deepEqual(matrixNeutral,await sharp(asset(view.neutralSprite)).resize(192,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),'Matrix neutral must retain source pixels at 2x.');neutralPairsChecked++;
   assert.equal(initial.available,true);assert.equal(initial.viewArtApproved,direction==='southeast');assert.equal(await page.locator('.pose').count(),18);assert.equal(await page.locator('#play').isDisabled(),false);
   for(const action of actions){
    const clip=view.clips[action];await page.locator('#action').selectOption(action);assert.equal((await state()).action,action);assert.equal((await state()).frameIndex,0);assert.equal((await state()).timeMs,0);
    for(const scene of ['map','light','dark'])for(const zoom of [1,2,4]){await setSceneZoom(scene,zoom);scenarios++;assert.equal((await state()).zoom,zoom);}
    await setSceneZoom('light',1);
    for(let index=0;index<6;index++){
     await page.locator(`.pose[data-action="${action}"][data-index="${index}"]`).click();const current=await state();assert.equal(current.frameIndex,index);assert.equal(current.playing,false);
     assert.deepEqual([current.frameRect.x,current.frameRect.y,current.frameRect.w,current.frameRect.h],[clip.frames[index].x,clip.frames[index].y,96,96]);
     const cellBytes=Buffer.from((await page.locator(`.pose[data-action="${action}"][data-index="${index}"] canvas`).evaluate(canvas=>canvas.toDataURL())).split(',')[1],'base64');
     assert.deepEqual(await sharp(cellBytes).ensureAlpha().raw().toBuffer(),await sharp(asset(clip.frames[index].file)).resize(192,192,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),'Contact sheet must draw actual atlas frame pixels.');contactPoses++;
    }
    await page.locator('#seek').evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},clip.durationMs);
    assert.equal((await state()).frameIndex,5);assert.equal((await state()).timeMs,clip.durationMs);
    const terminal=await stageHash();await page.waitForTimeout(35);assert.equal(await stageHash(),terminal,'Paused terminal seek remains stable.');
    await page.locator('#reset').click();assert.equal((await state()).frameIndex,0);assert.equal((await state()).timeMs,0);
    const startImage=await stageBodyHash(),differentIndex=clip.frames.findIndex(frame=>frame.sha256!==clip.frames[0].sha256);
    await page.locator('#play').click();await page.waitForFunction(index=>window.__npcMotionReview().frameIndex===index,differentIndex,{timeout:5000});
    await page.locator('#play').click();assert.equal((await state()).playing,false);assert.notEqual(await stageBodyHash(),startImage,'Playback must draw a different actual frame.');
    const paused=await stageHash(),pausedState=await state();await page.waitForTimeout(35);assert.equal(await stageHash(),paused);assert.equal((await state()).timeMs,pausedState.timeMs);motionClips++;
   }
   await setSceneZoom('map',1);await page.locator('#action').selectOption('profession');await page.locator('.pose[data-action="profession"][data-index="3"]').click();
   if(!fixturePilot&&(direction==='north'||direction==='southeast'))await page.locator('#stage').screenshot({path:local(`review/${actor.slug}-${direction}-profession-map-1x.png`)});
  }
 }
 assert.equal(scenarios,producedClips*9);assert.equal(contactPoses,producedPoses);assert.equal(motionClips,producedClips);assert.equal(missingChecked,missing.length);
 await page.locator('#direction').selectOption('southeast');await page.locator('#action').selectOption('idle');await page.locator('#reset').click();
 await page.locator('#speed').selectOption('2');assert.equal((await state()).speed,2);await page.locator('#speed').selectOption('0.5');assert.equal((await state()).speed,.5);await page.locator('#speed').selectOption('1');
 await page.locator('#play').click();await page.waitForTimeout(90);
 const speedTransition=await page.evaluate(()=>{const before=window.__npcMotionReview();const input=document.querySelector('#speed');input.value='2';input.dispatchEvent(new Event('change'));return {before,after:window.__npcMotionReview()};});
 assert.equal(speedTransition.after.playing,true);assert.equal(speedTransition.after.speed,2);assert.ok(speedTransition.after.timeMs>=speedTransition.before.timeMs&&speedTransition.after.timeMs-speedTransition.before.timeMs<20,'Changing speed preserves absolute clip age.');
 await page.locator('#play').click();await page.locator('#speed').selectOption('1');await page.locator('#reset').click();
 for(const toggle of ['roots','shadows','silhouette']){await page.locator('#'+toggle).check();await page.locator('#'+toggle).uncheck();}
 await page.locator('#play').click();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));assert.equal((await state()).playing,false);
 await page.locator('#play').click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await state()).playing,false);
 await page.evaluate(()=>{delete document.hidden;});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>document.body.dataset.ready==='true');assert.equal((await state()).reducedMotion,true);assert.equal((await state()).playing,false);
 await page.locator('#play').click();assert.equal((await state()).playing,true);await page.locator('#play').click();await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('#scene').selectOption('map');await page.locator('#actor').selectOption(catalog.actors[0].id);await page.locator('#direction').selectOption('southeast');
 await page.screenshot({path:local(fixturePilot?'review/fixture-desktop.png':'review/desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#stage').evaluate(canvas=>canvas.getBoundingClientRect().width),960);assert.equal(await page.locator('.pose canvas').first().evaluate(canvas=>canvas.getBoundingClientRect().width),192);
 await page.screenshot({path:local(fixturePilot?'review/fixture-mobile.png':'review/mobile.png'),fullPage:true});assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);assert.equal(await hashFile(mapFile),mapHash);await baselineUnchanged();
 const result={passed:true,fixturePilot,actors:4,requiredDirections:directions,producedClips,poses:producedPoses,missing,canonicalAtlasFramesVerified:framesVerified,guttersVerified,neutralViewsVerified:neutralVerified,neutralReferencePairsVerified:neutralPairsChecked,browserSceneZoomScenarios:scenarios,contactPosesVerified:contactPoses,actualMotionClipsVerified:motionClips,pauseStable:true,seekEndStable:true,selectionResetsTime:true,speedChangePreservesAbsoluteAge:true,sameDirectionLiveWangRgbaMatched:8,stagePrimaryReferencesAtNativeVerified:stagePrimaryReferencesChecked,hiddenOfflinePause:true,reducedMotionInitialPaused:true,mobileWidth:390,nativeStagePreserved:true,approvedV1PinsUnchanged:approval.pinnedFiles.length,ownerMapEdited:false,runtimeImported:false,errors,requests};
 await writeFile(local(fixturePilot?'review/fixture-verification.json':'review/verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();await new Promise(done=>server.close(done));}
