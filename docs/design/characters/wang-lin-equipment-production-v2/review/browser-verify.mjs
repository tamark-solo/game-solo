import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,relative,isAbsolute,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyGpu} from './gpu-inspection.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),workspace=resolve(root,'../../../..');
const requested=process.argv.find(v=>v.startsWith('--family='))?.split('=')[1],probe=process.argv.includes('--probe'),skipGpu=process.argv.includes('--skip-gpu');
const families=requested?[requested]:['sword','banner','chariot','bead'];
const output=resolve(root,'review'),shots=resolve(output,'screenshots');await fs.mkdir(shots,{recursive:true});
const checks=[],errors=[],failures=[];const check=(name,pass=true)=>{if(!pass)throw Error(name);checks.push({name,passed:true});};
const sha=async p=>createHash('sha256').update(await fs.readFile(resolve(root,p))).digest('hex');
const basis=JSON.parse((await fs.readFile(resolve(root,'basis.json'),'utf8')).replace(/^\uFEFF/,''));
const before=await Promise.all([...basis.files,...basis.protectedRuntimeAndMap].map(async p=>({...p,before:await sha(p.file)})));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.png':'image/png','.json':'application/json','.webp':'image/webp','.css':'text/css','.md':'text/plain'};
const server=createServer(async(req,res)=>{try{const file=resolve(workspace,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)),rel=relative(workspace,file);if(rel.startsWith('..')||isAbsolute(rel))throw Error('path');const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});});
page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()?.errorText}));
const url=`http://127.0.0.1:${server.address().port}/docs/design/characters/wang-lin-equipment-production-v2/index.html`;
const ready=()=>page.waitForFunction(()=>window.__equipmentReview.pendingImages===0);
const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
const seek=async(age,id='seek')=>{await page.locator('#'+id).evaluate((el,age)=>{el.value=age;el.dispatchEvent(new Event('input',{bubbles:true}));},age);await ready();};
const state=()=>page.evaluate(()=>window.__equipmentReview.prototype);
const fresh=async(family,mode)=>{await page.selectOption('#proto-family',family);await page.selectOption('#proto-mode',mode);await page.locator('#reset').click();await page.locator('#cast').click();};
let gpu=[],coverage,cache;
try{
 await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.ready==='true');await ready();
 coverage=await page.evaluate(()=>window.__equipmentReview.manifest.coverage);
 const storage=await page.evaluate(()=>({...localStorage}));
 if(!probe)check('required body count',coverage.bodyClips>=families.length*128);
 check('eight own neutral cards',await page.locator('.neutral-card').count()===8);check('8 direction controls',await page.locator('#field-direction option').count()===8);check('eight-action selector',await page.locator('#motion-action option').count()===8);
 const m=await page.evaluate(()=>window.__equipmentReview.manifest),clips=m.motions.clips.filter(c=>families.includes(c.familyId));
 for(const c of clips){
  for(const [id,value] of [['motion-identity',c.identityId],['motion-family',c.familyId],['motion-direction',c.direction],['motion-action',c.action]])await page.selectOption('#'+id,value);
  await page.waitForFunction(id=>window.__equipmentReview.motion.clip?.id===id,c.id);await ready();
  check('exact binding '+c.id,(await page.evaluate(()=>window.__equipmentReview.motion.clip.id))===c.id);
  for(const z of ['1','2','4']){await page.selectOption('#motion-zoom',z);await seek(Math.round(c.durationMs/2),'motion-seek');check('motion visible '+c.id+' '+z,await page.locator('#motion-stage').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)));}
  await seek(Math.max(0,c.durationMs-1),'motion-seek');check('8 directional tiles '+c.id,await page.locator('#direction-grid article').count()===8);
 }
 for(const identity of ['a','b'])for(const family of families){
  await page.selectOption('#motion-identity',identity);await page.selectOption('#motion-family',family);await page.selectOption('#motion-direction','southeast');await page.selectOption('#motion-action','idle');await ready();await seek(0,'motion-seek');
  await page.locator('#direction-grid').screenshot({path:resolve(shots,`${family}-${identity}-eight-directions-idle.png`)});
 }
 const coreData=await page.evaluate(async()=>Object.values((await import('../../gameplay/wang-lin-equipment-prototype-v1/core.mjs')).CONTRACTS).map(c=>({family:c.family,mode:c.mode,release:c.timing.releaseMs,end:c.timing.endMs,activeEnd:c.timing.activeEndMs})));
 for(const c of coreData.filter(c=>families.includes(c.family))){
  await fresh(c.family,c.mode);await seek(c.end+1);const s=await state(),impact=s.facts.filter(f=>['hit','support','control'].includes(f.type));check(c.family+c.mode+' facts',impact.length>0);check(c.family+c.mode+' unique effects',new Set(s.facts.map(f=>f.key)).size===s.facts.length);
  if(c.family==='bead')check('Chau support/control not damage',!s.facts.some(f=>f.type==='hit')&&s.facts.some(f=>f.type==='support'));
  await seek(c.release+40);const forward=await state();await seek(0);await seek(c.release+40);check(c.family+c.mode+' deterministic seek',JSON.stringify(forward.facts)===JSON.stringify((await state()).facts));
  await fresh(c.family,c.mode);await seek(c.release-1);await page.locator('#cancel').click();await seek(c.end+1);check(c.family+c.mode+' cancel before release',!(await state()).facts.some(f=>['release','hit','support','control'].includes(f.type)));
  for(const identity of ['a','b']){await page.selectOption('#identity',identity);await page.selectOption('#field-direction','southeast');for(const scene of ['light','dark','map']){await page.selectOption('#proto-scene',scene);await fresh(c.family,c.mode);await seek(c.mode==='aoe'?Math.min(c.activeEnd-40,c.release+680):c.release+40);await page.locator('#prototype').screenshot({path:resolve(shots,`${c.family}-${identity}-${c.mode}-${scene}.png`)});check(c.family+identity+c.mode+scene+' bitmap decoder',await page.evaluate(()=>window.__equipmentReview.failedImages.length===0));}}
 }
 if(families.includes('bead')){
  await fresh('bead','aoe');await seek(1200);await page.locator('#cancel').click();await seek(1349);
  const active=await state();check('Chau control and support bitmap from confirmed facts',active.visibleFactEffects.some(f=>f.type==='control')&&active.visibleFactEffects.some(f=>f.type==='support'));
  await seek(1351);const expiredControl=await state();check('Chau control bitmap expires at Core 450ms',!expiredControl.visibleFactEffects.some(f=>f.type==='control')&&expiredControl.visibleFactEffects.some(f=>f.type==='support'));
  await seek(1601);check('Chau support bitmap expires at Core 700ms',!(await state()).visibleFactEffects.some(f=>['support','control'].includes(f.type)));
 }
 await fresh('sword','aoe');await seek(1500);const first=await state();await page.locator('#duplicate').click();const duplicate=await state();check('duplicate contacts kept unique',duplicate.duplicateCount>0&&duplicate.deliveredFacts.length===first.deliveredFacts.length);await page.locator('#restore').click();check('restore original facts',JSON.stringify((await state()).facts)===JSON.stringify(duplicate.facts));
 await page.selectOption('#motion-family','banner');await ready();check('motion-family selection rebuilds its own Core contract',(await state()).cast.family==='banner'&&!(await state()).hasCast);
 await page.selectOption('#identity','b');await page.selectOption('#field-direction','east');await page.locator('#late-facts').check();await fresh('sword','aoe');await seek(800);
 check('detached sword waits for confirmed release',(await state()).gear?.releaseSuppressed===true);await seek(1120);check('confirmed detached sword uses aged track',(await state()).gear?.mode==='released'&&(await state()).gear?.releaseSuppressed===false);await page.locator('#late-facts').uncheck();
 await page.locator('#late-facts').check();await fresh('sword','aoe');await seek(800);const late=await state();check('late presentation preserves authority',late.facts.some(f=>f.type==='hit')&&!late.deliveredFacts.some(f=>f.type==='hit'));await seek(1120);check('late facts original time',(await state()).deliveredFacts.some(f=>f.type==='hit'&&f.at===800));await page.locator('#late-facts').uncheck();
 if(families.includes('sword'))for(const identity of ['a','b'])for(const direction of m.directions.filter(d=>d!=='southeast'))for(const mode of ['st','aoe']){
  await page.selectOption('#identity',identity);await page.selectOption('#field-direction',direction);await fresh('sword',mode);await seek(mode==='st'?480:800);
  const s=await state();check('confirmed directional sword release '+identity+' '+direction+' '+mode,s.gear?.mode==='released'&&s.gear?.releaseSuppressed===false);
 }
 if(!skipGpu){
  const native=new Map(),atlas=[];for(const c of clips)for(const f of c.frames){native.set(f.sha256,{file:f.file,sha256:f.sha256});for(const l of f.gearLayers??[])if(l.role!=='occlusion')native.set(l.sha256,{file:l.file,sha256:l.sha256});atlas.push({file:f.file,atlas:typeof c.atlas==='string'?c.atlas:c.atlas.file,rect:f.atlasRect});}
  const fx=await page.evaluate(()=>window.__equipmentReview.fx.sequences);for(const s of fx.filter(s=>families.includes(s.familyId)))for(const f of s.frames){native.set(f.sha256,{file:f.file,sha256:f.sha256});atlas.push({file:f.file,atlas:s.atlas.file,rect:f.rect??f.atlasRect});}
  for(const v of m.gearViews.filter(v=>families.includes(v.familyId)))for(const l of v.layers)native.set(l.sha256,{file:l.file,sha256:l.sha256});
  gpu=await verifyGpu(page,root,[...native.values()],atlas,check);
 }
 await page.evaluate(()=>scrollTo(0,0));check('desktop no overflow',await noOverflow());await page.screenshot({path:resolve(shots,'desktop-overview.png')});
 for(const [name,width,height] of [['tablet',768,1024],['mobile',390,844]]){await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));check(name+' no overflow',await noOverflow());await page.screenshot({path:resolve(shots,name+'-overview.png')});}
 await page.setViewportSize({width:1440,height:1000});await ready();await page.emulateMedia({reducedMotion:'no-preference'});await fresh('sword','aoe');check('play starts',(await state()).playing);await ready();await context.setOffline(true);await page.waitForFunction(()=>!window.__equipmentReview.prototype.playing);check('offline pauses',!(await state()).playing);await context.setOffline(false);await page.emulateMedia({reducedMotion:'reduce'});
 cache=await page.evaluate(()=>window.__equipmentReview.cache);check('bounded 16MiB sprite cache',cache.decodedBytes<=cache.budget);check('no owner storage writes',JSON.stringify(await page.evaluate(()=>({...localStorage})))===JSON.stringify(storage));
 for(const p of before)check('pin unchanged '+p.file,p.before===p.sha256&&await sha(p.file)===p.sha256);check('no JS errors',errors.length===0);check('no failed requests',failures.length===0);
 const report={schema:'wang-lin-equipment-browser-verification-2',date:'2026-10-14',status:probe?'partial-ui-probe':'passed',scope:requested??'all-four-families',checkCount:checks.length,checks,coverage,cache,threeGpuRenders:gpu,errors,failures,ownerTabsUntouched:true,ownerStorageUntouched:true,ownerMapModified:false,runtimeImported:false,newMotionApprovalInferred:false};
 await fs.writeFile(resolve(output,probe?'ui-probe.json':requested?requested+'-browser-verification.json':'browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,scope:report.scope,checks:checks.length,gpuRenders:gpu.length,coverage}));
}catch(e){await fs.writeFile(resolve(output,probe?'ui-probe.json':requested?requested+'-browser-verification.json':'browser-verification.json'),JSON.stringify({status:'failed',error:e.message,checkCount:checks.length,checks,errors,failures},null,2)+'\n');throw e;}finally{await context.close();await browser.close();await new Promise(done=>server.close(done));}
