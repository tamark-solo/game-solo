import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startService } from '../support/services.mjs';

const url='http://127.0.0.1:5185';
let service,browser;
const errors=[],checks=[];
const diag=page=>page.evaluate(()=>window.__starterDiagnostics());
try {
  service=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5185'],url);
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  await mkdir('artifacts',{recursive:true});
  const context=await browser.newContext({viewport:{width:1440,height:1120},deviceScaleFactor:1});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url+'/starter-region.html');await page.waitForFunction(()=>typeof window.__starterDiagnostics==='function');
  let d=await diag(page);assert.deepEqual(d.worldSize,[3840,2560]);assert.deepEqual(d.frameSize,[64,96]);assert.equal(d.zoom,1);assert.equal(d.loadedAssets,3);assert.equal(d.walkable,true);assert.equal(d.combatImplemented,false);checks.push('large_region_native_scale_and_real_atlases');
  await page.locator('#stage').click();const before=await diag(page);await page.keyboard.down('d');await page.waitForTimeout(550);await page.keyboard.up('d');await page.waitForTimeout(120);const moved=await diag(page);assert.ok(moved.player.x>before.player.x+15);assert.equal(moved.player.direction,'east');assert.ok(moved.player.frame.includes('stand_east'));await page.waitForTimeout(250);assert.equal((await diag(page)).player.x,moved.player.x);checks.push('wasd_camera_and_stop_without_drift');
  const zones=['ZONE-SECT','ZONE-SPRING','ZONE-GARDEN','ZONE-PINE','ZONE-RAVINE','ZONE-CAVE'];
  for(const zone of zones){await page.selectOption('#zone-select',zone);await page.click('#visit-zone');d=await diag(page);assert.equal(d.zoneId,zone);assert.equal(d.walkable,true);}
  await page.evaluate(async()=>{
    const select=document.querySelector('#zone-select');select.value='ZONE-GARDEN';select.dispatchEvent(new Event('change'));document.querySelector('#visit-zone').click();
    select.value='ZONE-PINE';select.dispatchEvent(new Event('change'));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  assert.equal(await page.locator('#zone-select').inputValue(),'ZONE-PINE');await page.click('#visit-zone');assert.equal((await diag(page)).zoneId,'ZONE-PINE');checks.push('requested_zone_survives_camera_render_updates');
  await page.selectOption('#zone-select','ZONE-RAVINE');await page.click('#visit-zone');await page.locator('#stage').click();await page.keyboard.down('d');await page.waitForFunction(()=>window.__starterDiagnostics().nearestPortalId==='PORTAL-WOLF',null,{timeout:8000});await page.keyboard.up('d');await page.waitForTimeout(120);await page.keyboard.press('e');await page.waitForTimeout(80);assert.equal((await diag(page)).sceneId,'INSTANCE-WOLF');await page.screenshot({path:'artifacts/starter-boss-layout.png',fullPage:true});await page.keyboard.press('e');await page.waitForTimeout(80);assert.equal((await diag(page)).sceneId,'REGION-HENG-YUE');checks.push('all_six_zones_and_boss_portal_roundtrip');
  for(const id of ['AVATAR-NOVICE-FEMALE','CHR-WANG-LIN-CHIBI','AVATAR-NOVICE-MALE']){await page.selectOption('#actor',id);assert.equal((await diag(page)).player.assetId,id);assert.deepEqual((await diag(page)).frameSize,[64,96]);}
  await page.selectOption('#zone-select','ZONE-SECT');await page.click('#visit-zone');await page.selectOption('#zoom','2');assert.equal((await diag(page)).zoom,2);await page.selectOption('#zoom','1');await page.selectOption('#quest-select','Q10');assert.match(await page.locator('#quest-title').textContent(),/Bình yên/);await page.selectOption('#quest-select','Q02');checks.push('actor_zoom_and_quest_script_controls');
  await page.screenshot({path:'artifacts/starter-region-desktop.png',fullPage:true});
  const mobile=await browser.newContext({viewport:{width:360,height:900},deviceScaleFactor:2,isMobile:true,hasTouch:true});const small=await mobile.newPage();small.on('pageerror',e=>errors.push(e.message));await small.goto(url+'/starter-region.html');await small.waitForFunction(()=>typeof window.__starterDiagnostics==='function');
  assert.ok(await small.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const origin=await diag(small);const touch=await small.locator('[data-direction=east]').boundingBox();assert.ok(touch);await small.locator('[data-direction=east]').scrollIntoViewIfNeeded();const box=await small.locator('[data-direction=east]').boundingBox();await small.mouse.move(box.x+box.width/2,box.y+box.height/2);await small.mouse.down();await small.waitForTimeout(500);await small.mouse.up();await small.waitForTimeout(100);const after=await diag(small);assert.ok(after.player.x>origin.player.x+10);assert.equal(after.player.moving,false);assert.deepEqual(after.frameSize,[64,96]);await small.screenshot({path:'artifacts/starter-region-mobile.png',fullPage:true});checks.push('mobile_360_touch_native_size_no_overflow');
  assert.deepEqual(errors,[]);const result={passed:true,checks,browserErrors:errors,regionSizePx:[3840,2560],characterFrameSizePx:[64,96],combatAndQuestsPlayable:false};await writeFile('artifacts/starter-region-verification.json',JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify(result)+'\n');
} finally {await browser?.close();service?.stop();}
