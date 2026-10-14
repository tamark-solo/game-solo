import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const reportFile=path.join(root,'review/browser-verification.json');
const screenshotDir=path.join(root,'review/screenshots');
const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
const url=process.argv[2] || `http://127.0.0.1:5173/@fs/${root.replaceAll('\\','/')}/index.html`;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1,acceptDownloads:true});
const page=await context.newPage();
const consoleErrors=[],requestFailures=[],loadedImages=new Map(),checks=[];
page.on('pageerror',e=>consoleErrors.push(e.message));
page.on('requestfailed',r=>requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
page.on('response',r=>{if(r.status()>=400)requestFailures.push({url:r.url(),status:r.status()});});
const check=(name,result=true,details)=>{assert.ok(result,name);checks.push({name,passed:true,...(details?{details}:{})});};
async function waitImages(){await page.evaluate(async()=>{await Promise.all(Array.from(document.images).map(async img=>{img.loading='eager';if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',()=>reject(new Error(`Image failed: ${img.src}`)),{once:true});});if(!img.naturalWidth)throw new Error(`Image empty: ${img.src}`);await img.decode();}));});const dimensions=await page.evaluate(()=>Array.from(document.images).map(i=>({url:i.getAttribute('src'),naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight})));dimensions.forEach(d=>loadedImages.set(d.url,d));}
async function state(){return page.evaluate(()=>window.__conceptV5.getState());}
async function choice(selector){await page.locator(selector.startsWith('[data-')?'button'+selector:selector).click();await page.waitForFunction(()=>document.body.dataset.ready==='true');}
async function screenshotSection(id,name){await page.locator(id).screenshot({path:path.join(screenshotDir,name)});}
try {
  await mkdir(screenshotDir,{recursive:true});
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.ready==='true');
  const selectionHash=await page.evaluate(()=>location.hash);
  for(const [label,id] of [['Nhân vật','characters'],['Đạo đồ','development'],['Đơn mục tiêu & AOE','combat']]){
    await page.getByRole('link',{name:label,exact:true}).click();
    await page.waitForFunction(id=>{const top=document.getElementById(id).getBoundingClientRect().top;return top>=-1&&top<=40;},id);
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('.board-image img')).every(img=>img.width>0&&img.height>0));
    check(`nav-lands-at-section-${id}`,await page.locator('#'+id).evaluate(el=>el.getBoundingClientRect().top>=-1&&el.getBoundingClientRect().top<=40));
    check(`nav-keeps-selection-hash-${id}`,await page.evaluate(()=>location.hash)===selectionHash);
  }
  await page.locator('.brand').click();check('brand-nav-returns-top',await page.evaluate(()=>scrollY<1));check('brand-nav-keeps-selection-hash',await page.evaluate(()=>location.hash)===selectionHash);
  await waitImages();
  const counts=await page.evaluate(()=>window.__conceptV5.counts);
  check('four-families',counts.families===4,counts);check('two-new-identity-masters',counts.identities===2,counts);check('eight-character-options',counts.options===8,counts);
  const oldKey='game-solo:wang-lin-equipment-options-v3:favorites';
  await page.evaluate(key=>localStorage.setItem(key,'isolated-test-sentinel'),oldKey);
  const geom=[];
  for(const family of manifest.families){
    await choice(`[data-family="${family.id}"]`);await waitImages();
    const sourceBefore=await page.locator('#combat-board').getAttribute('src');
    check(`combat-original-image-link-${family.id}`,(await page.locator('#combat-open').getAttribute('href'))===sourceBefore);
    check(`progression-original-image-link-${family.id}`,(await page.locator('#progression-open').getAttribute('href'))===(await page.locator('#progression-board').getAttribute('src')));
    const optionIds=await page.locator('[data-option]').evaluateAll(b=>b.map(x=>x.dataset.option));
    for(const optionId of optionIds){
      await choice(`[data-option="${optionId}"]`);await waitImages();const s=await state();
      check(`option-control-${optionId}`,s.option===optionId);
      check(`selected-card-${optionId}`,await page.locator(`[data-concept="${optionId}"]`).evaluate(e=>e.classList.contains('selected')));
      const palette=family.palettes.find(p=>p.optionId===optionId);if(palette)check(`palette-matches-image-${optionId}`,s.palette===palette.id);
    }
    const paletteIds=await page.locator('[data-palette]').evaluateAll(b=>b.map(x=>x.dataset.palette));
    for(const paletteId of paletteIds){await choice(`[data-palette="${paletteId}"]`);const s=await state(),p=family.palettes.find(p=>p.id===paletteId);check(`real-palette-select-${family.id}-${paletteId}`,s.palette===paletteId&&(!p.optionId||s.option===p.optionId));}
    const stages=await page.locator('[data-milestone]').evaluateAll(b=>b.map(x=>x.dataset.milestone));
    for(const milestone of stages){
      await choice(`[data-milestone="${milestone}"]`);check(`milestone-${family.id}-${milestone}`,(await state()).milestone===milestone);
      for(const mode of ['singleTarget','aoe']){
        await choice(`[data-mode="${mode}"]`);
        for(const phase of ['warning','lock','release','fade']){
          await choice(`[data-phase="${phase}"]`);const s=await state(),attrs=await page.locator('#range-diagram').evaluate(e=>({...e.dataset}));
          check(`diagram-${family.id}-${milestone}-${mode}-${phase}`,s.mode===mode&&s.phase===phase&&attrs.family===family.id&&attrs.mode===mode&&attrs.phase===phase);
          check(`board-stays-static-${family.id}-${milestone}-${mode}-${phase}`,(await page.locator('#combat-board').getAttribute('src'))===sourceBefore);
        }
      }
    }
    await choice('[data-mode="aoe"]');await choice('[data-phase="release"]');
    geom.push({family:family.id,geometry:await page.locator('#range-diagram').evaluate(svg=>JSON.stringify(Array.from(svg.querySelectorAll('path,ellipse,rect')).map(el=>({tag:el.tagName,attributes:Array.from(el.attributes).filter(a=>['d','cx','cy','rx','ry','x','y','width','height'].includes(a.name)).map(a=>[a.name,a.value])}))))});
    check(`four-beats-${family.id}`,await page.locator('#combat-beats > div').count()===4);
    await screenshotSection('#characters',`desktop-${family.id}-characters.png`);
    await screenshotSection('#combat',`desktop-${family.id}-combat.png`);
    await screenshotSection('#development',`desktop-${family.id}-progression.png`);
  }
  check('four-distinct-aoe-geometries',new Set(geom.map(g=>g.geometry)).size===4);
  await choice('[data-family="sword"]');await choice('[data-identity="a"]');await choice('[data-family="banner"]');
  check('master-a-persists-across-families',(await state()).identity==='a'&&(await state()).option==='banner-a');
  await choice('[data-identity="b"]');await choice('[data-family="chariot"]');
  check('master-b-persists-across-families',(await state()).identity==='b'&&(await state()).option==='chariot-b');
  await choice('#pin-choice');await choice('[data-family="bead"]');await choice('#pin-choice');
  check('two-preferences-pinned',await page.locator('.preference-card').count()===2);
  await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.ready==='true');await waitImages();
  check('preferences-survive-reload',await page.locator('.preference-card').count()===2);
  check('old-review-storage-untouched',await page.evaluate(key=>localStorage.getItem(key),oldKey)==='isolated-test-sentinel');
  const downloadPromise=page.waitForEvent('download');await choice('#export-choices');const download=await downloadPromise;
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  check('export-json-real-selections',exported.selections.length===2&&exported.selections.every(s=>s.paletteIntentOnly===false));
  check('export-keeps-approval-separate',exported.status==='preferences-not-art-motion-runtime-approval');
  await page.locator('[data-apply]').first().click();check('apply-saved-preference',(await state()).family==='chariot');
  await page.locator('[data-remove]').first().click();check('remove-preference',await page.locator('.preference-card').count()===1);
  await page.locator('[data-remove]').first().click();check('empty-state-after-remove',await page.locator('.preference-card').count()===0);
  await page.waitForFunction(()=>!document.querySelector('#toast').classList.contains('visible'));check('feedback-toast-clears',true);
  await page.setViewportSize({width:390,height:844});await choice('[data-family="banner"]');await waitImages();
  check('mobile-390-no-horizontal-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check('mobile-concept-image-visible',await page.locator('.concept-art').first().evaluate(el=>el.clientWidth>300&&el.clientWidth<=390));
  check('native-preview-actual-1x-on-mobile',await page.locator('.native-scale-proof img').evaluateAll(images=>images.every(img=>Math.abs(img.getBoundingClientRect().width-img.naturalWidth)<.5&&Math.abs(img.getBoundingClientRect().height-img.naturalHeight)<.5)));
  await page.screenshot({path:path.join(screenshotDir,'mobile-top.png')});await screenshotSection('#characters','mobile-characters.png');await screenshotSection('#combat','mobile-combat.png');
  await page.setViewportSize({width:768,height:1024});check('tablet-768-no-horizontal-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1440,height:1050});await choice('[data-family="banner"]');await choice('[data-identity="a"]');await waitImages();await page.locator('.family-heading').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(screenshotDir,'desktop-overview.png')});
  const claims=await page.locator('body').innerText();check('live-reference-only-scale-style',claims.includes('chỉ làm chuẩn tỷ lệ')&&claims.includes('CONCEPT MỚI'));check('static-boards-explicit',claims.includes('Bảng concept tĩnh'));check('not-runtime-approved',claims.includes('chưa duyệt ART, motion hoặc runtime'));
  check('all-image-dimensions-positive',[...loadedImages.values()].every(i=>i.naturalWidth>0&&i.naturalHeight>0));
  check('no-page-errors',consoleErrors.length===0,consoleErrors);check('no-failed-requests',requestFailures.length===0,requestFailures);
  const report={schema:'wang-lin-concept-direction-v5-browser-verification',date:new Date().toISOString(),url,passed:true,checks,counts,diagramScenarios:4*3*2*4,loadedImages:[...loadedImages.values()],consoleErrors,requestFailures,storageIsolated:true,userTabsTouched:false,status:'technical-check-not-art-motion-runtime-approval'};
  await writeFile(reportFile,JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,checks:checks.length,diagramScenarios:report.diagramScenarios,loadedImages:loadedImages.size,report:reportFile}));
} catch(error){await writeFile(reportFile,JSON.stringify({passed:false,error:error.stack,checks,consoleErrors,requestFailures},null,2));throw error;} finally{await context.close();await browser.close();}
