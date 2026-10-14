import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const v5=path.resolve(root,'../wang-lin-concept-direction-v5');
const output=path.join(root,'review');
const shots=path.join(output,'screenshots');
const url=process.argv[2]||`http://127.0.0.1:5173/@fs/${root.replaceAll('\\','/')}/index.html`;
const conceptUrl=`http://127.0.0.1:5173/@fs/${v5.replaceAll('\\','/')}/index.html`;
const plan=JSON.parse(await readFile(path.join(root,'plan.json'),'utf8'));
const approval=JSON.parse(await readFile(path.join(v5,'approval.json'),'utf8'));
const manifest=JSON.parse(await readFile(path.join(v5,'manifest.json'),'utf8'));
const basisPaths=['manifest.json','generation.json','brief.json','review/browser-verification.json','review/source-verification.json'].filter(f=>approval.files.some(p=>(p.file||p.path)===f));
const hash=async f=>createHash('sha256').update(await readFile(path.join(v5,f))).digest('hex');
const basisBefore=Object.fromEntries(await Promise.all(basisPaths.map(async f=>[f,await hash(f)])));
const checks=[],errors=[],requestFailures=[],images=new Map();
const check=(name,ok=true,details)=>{assert.ok(ok,name);checks.push({name,passed:true,...(details?{details}:{})});};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('requestfailed',r=>requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
page.on('response',r=>{if(r.status()>=400)requestFailures.push({url:r.url(),status:r.status()});});
const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
async function imagesDecoded(){
  const dimensions=await page.evaluate(async()=>{await Promise.all(Array.from(document.images).map(async img=>{img.loading='eager';await img.decode();if(!img.naturalWidth)throw new Error(`Empty image: ${img.src}`);}));return Array.from(document.images).map(img=>({file:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight}));});
  dimensions.forEach(d=>images.set(d.file,d));return dimensions;
}
try{
  await mkdir(shots,{recursive:true});
  await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.ready==='true');await imagesDecoded();
  const beforeStorage=await page.evaluate(()=>({...localStorage}));
  check('both-characters-present',await page.locator('.character-card').count()===2);
  check('canonical-approved-character-names',(await page.locator('.character-card h3').allTextContents()).join('|')==='Huyễn Tâm|Tịch Bạch');
  check('four-approved-artifact-families',await page.locator('.family-card').count()===4);
  check('approval-counts-match-pinned-scope',(await page.locator('#approval-stats strong').allTextContents()).join('|')===`${approval.files.length}|${approval.coverage.selectedSources}|${approval.coverage.nativeConceptPreviews}`);
  const phaseCount=(plan.phases||plan.stages||[]).length;
  check('actual-plan-phases-present',await page.locator('.phase-card').count()===phaseCount,{phaseCount});
  const ids=await page.locator('.phase-card').evaluateAll(els=>els.map(e=>e.dataset.phase));
  check('phase-ids-follow-plan',ids.join('|')===(plan.phases||plan.stages||[]).map(p=>p.id).join('|'));
  check('phase-gates-present',(await page.locator('.phase-gate').allTextContents()).every(v=>v.length>30));
  for(const filter of ['art','integration','all']){await page.locator(`[data-filter="${filter}"]`).click();const result=await page.locator('.phase-card').count();check(`phase-filter-${filter}`,result>0&&(filter==='all'?result===phaseCount:result<phaseCount),{visible:result});check(`phase-filter-pressed-${filter}`,await page.locator(`[data-filter="${filter}"]`).getAttribute('aria-pressed')==='true');}
  for(const [stages,numbers] of [[1,['512','704','40']],[3,['1.536','2.112','120']]]){await page.locator(`[data-stages="${stages}"]`).click();check(`scope-counts-${stages}-milestones`,(await page.locator('.scope-total strong').allTextContents()).join('|')===numbers.join('|'));check(`scope-estimate-label-${stages}`,(await page.locator('#scope-caption').textContent()).includes('chưa phải tài sản đã sản xuất'));check(`scope-rows-${stages}`,await page.locator('#scope-rows tr').count()===6);}
  await page.locator('[data-stages="1"]').click();
  const allLinks=await page.locator('a[href]').evaluateAll(els=>els.map(a=>({href:a.getAttribute('href'),url:a.href})).filter(a=>!a.href.startsWith('#')));
  for(const item of allLinks){const response=await context.request.get(item.url);check(`link-loads-${item.href}`,response.ok(),{status:response.status()});}
  for(const [label,id] of [['Nhân vật','characters'],['Gói đầu tiên','pilot'],['Lộ trình','phases'],['Khối lượng','scope']]){await page.getByRole('link',{name:label,exact:true}).click();await page.waitForFunction(id=>{const top=document.getElementById(id).getBoundingClientRect().top;return top>=0&&top<100;},id);check(`navigation-${id}`,await page.locator('#'+id).evaluate(el=>el.getBoundingClientRect().top>=0&&el.getBoundingClientRect().top<100));}
  check('plan-does-not-write-browser-storage',JSON.stringify(await page.evaluate(()=>({...localStorage})))===JSON.stringify(beforeStorage));
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(shots,'desktop-overview.png')});
  await page.locator('#pilot').screenshot({path:path.join(shots,'desktop-pilot.png')});
  await page.locator('#phases').screenshot({path:path.join(shots,'desktop-roadmap.png')});
  check('desktop-no-horizontal-overflow',await noOverflow());
  for(const [label,width,height] of [['tablet',768,1024],['mobile',390,844]]){await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));check(`${label}-no-horizontal-overflow`,await noOverflow());await page.screenshot({path:path.join(shots,`${label}-overview.png`)});if(label==='mobile')await page.locator('#pilot').screenshot({path:path.join(shots,'mobile-pilot.png')});}
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(conceptUrl+'#family=bead&identity=b&option=bead-b&palette=bead-b&milestone=domain&mode=aoe&phase=release',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.ready==='true');await imagesDecoded();
  const conceptStorage=await page.evaluate(()=>({...localStorage}));
  check('v5-concept-approval-status-visible',(await page.locator('#approval-status').textContent()).includes('CONCEPT ĐÃ DUYỆT'));
  check('v5-both-characters-approved-summary',(await page.locator('#approval-summary').textContent()).includes('Cả Huyễn Tâm và Tịch Bạch'));
  check('v5-production-status-remains-pending',await page.evaluate(()=>window.__conceptV5.status==='static-concept-approved'&&window.__conceptV5.approval.motionApproved===false&&window.__conceptV5.approval.runtimeApproved===false));
  check('v5-overlay-does-not-rewrite-historical-manifest',manifest.identities.find(i=>i.id==='a').name==='Huyền Tâm');
  for(const family of manifest.families){await page.locator(`[data-family="${family.id}"]`).click();for(const identity of ['a','b']){await page.locator(`[data-identity="${identity}"]`).click();check(`v5-character-${family.id}-${identity}`,await page.evaluate(({family,identity})=>window.__conceptV5.getState().family===family&&window.__conceptV5.getState().identity===identity,{family:family.id,identity}));check(`v5-option-canonical-name-${family.id}-${identity}`,!(await page.locator('.concept-copy h3').allTextContents()).some(v=>v.includes('Huyền Tâm')));}
    check(`v5-board-is-identity-a-direction-${family.id}`,(await page.locator('#combat-caption').textContent()).includes('diễn họa Huyễn Tâm')&&(await page.locator('#progression-caption').textContent()).includes('Tịch Bạch'));await imagesDecoded();}
  check('v5-overlay-does-not-write-storage',JSON.stringify(await page.evaluate(()=>({...localStorage})))===JSON.stringify(conceptStorage));
  const implementationLink=await page.locator('#implementation-link').getAttribute('href');check('v5-links-to-new-implementation-plan',implementationLink==='../wang-lin-implementation-plan-v1/index.html');
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(shots,'v5-approved-overlay.png')});
  await page.setViewportSize({width:390,height:844});check('v5-mobile-overlay-no-overflow',await noOverflow());await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(shots,'v5-approved-overlay-mobile.png')});
  for(const f of basisPaths)check(`v5-pinned-file-preserved-${f}`,basisBefore[f]===await hash(f));
  check('no-javascript-errors',errors.length===0,errors);check('no-failed-requests',requestFailures.length===0,requestFailures);
  await writeFile(path.join(output,'browser-verification.json'),JSON.stringify({schema:'wang-lin-implementation-plan-browser-verification-1',status:'passed',date:'2026-10-14',method:'separate headless Chromium context, new plan and V5 approval overlay only',ownerTabsUntouched:true,ownerStorageUntouched:true,oldV5ReportsOverwritten:false,checkCount:checks.length,checks,decodedImages:[...images.values()],errors,requestFailures},null,2)+'\n');
  console.log(JSON.stringify({status:'passed',checkCount:checks.length,decodedImages:images.size,screenshotDirectory:shots},null,2));
}catch(error){await writeFile(path.join(output,'browser-verification.json'),JSON.stringify({status:'failed',error:error.message,checkCount:checks.length,checks,errors,requestFailures},null,2)+'\n');throw error;}finally{await context.close();await browser.close();}
