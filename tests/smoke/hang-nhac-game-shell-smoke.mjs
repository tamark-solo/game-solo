import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startService } from '../support/services.mjs';

const origin='http://127.0.0.1:5204',endpoint='http://127.0.0.1:2601';
await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-game-shell-')),dbPath=resolve(folder,'profiles.sqlite');
const backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2601',GAME_DB_PATH:dbPath});
let vite,browser,page;const errors=[],checks=[];
const game=()=>page.evaluate(()=>window.__hangNhacR01());
const diagnostic=()=>page.evaluate(()=>window.__hangNhacDiagnostics());
const frame=async()=>{
  const box=await page.locator('#stage').boundingBox(),viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight}));
  assert.equal(box.x,0);assert.equal(box.y,0);assert.equal(box.width,viewport.width);assert.equal(box.height,viewport.height);assert.equal(viewport.overflow,false);
  assert.equal(await page.locator('#stage').evaluate(element=>getComputedStyle(element).position),'absolute');
  assert.ok(await page.locator('link[rel=stylesheet]').evaluateAll(links=>links.some(link=>Array.from(link.sheet?.cssRules??[]).some(rule=>rule.selectorText==='#game-shell'))),'critical shell CSS must load directly from HTML, not an empty JS style module');
};
try{
  const config=resolve(folder,'vite.mjs');
  await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5204'],origin,{VITE_SERVER_URL:endpoint});
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const noScriptContext=await browser.newContext({viewport:{width:1024,height:768},javaScriptEnabled:false});
  try{
    const noScriptPage=await noScriptContext.newPage();await noScriptPage.goto(origin+'/hang-nhac.html?devGuest=1');
    const loading=await noScriptPage.locator('#loading').boundingBox();assert.deepEqual(loading,{x:0,y:0,width:1024,height:768});
    assert.equal(await noScriptPage.locator('#stage').evaluate(element=>getComputedStyle(element).position),'absolute');
    assert.equal(await noScriptPage.locator('#loading').isVisible(),true);checks.push('shell_and_loading_visible_before_Javascript_without_white_page');
  }finally{await noScriptContext.close();}
  const failureContext=await browser.newContext({viewport:{width:1024,height:768}});
  try{
    const failurePage=await failureContext.newPage();
    await failurePage.route('**/assets/catalog.json',route=>route.fulfill({status:503,body:'isolated asset failure'}));
    await failurePage.goto(origin+'/hang-nhac.html?devGuest=1');
    await failurePage.waitForFunction(()=>document.querySelector('#loading')?.textContent.includes('Không mở được Hằng Nhạc'));
    assert.equal(await failurePage.locator('#loading').isVisible(),true);
    assert.deepEqual(await failurePage.locator('#loading').boundingBox(),{x:0,y:0,width:1024,height:768});
    assert.equal(await failurePage.locator('#game-shell').getAttribute('data-phase'),'loading');
    checks.push('asset_failure_keeps_visible_error_overlay_instead_of_blank_game');
  }finally{await failureContext.close();}
  const context=await browser.newContext({viewport:{width:1440,height:980}});page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)errors.push(`HTTP ${response.status()}: ${response.url()}`);});
  await page.goto(origin+'/hang-nhac.html?devGuest=1');await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().shell.phase==='entry');
  await frame();assert.equal(await page.locator('#entry-screen').isVisible(),true);assert.equal(await page.locator('#sect-objective').isVisible(),false);
  const initial=(await diagnostic()).actors.find(a=>a.own);await page.locator('#stage').focus();
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(300);await page.keyboard.up('ArrowRight');await page.keyboard.press('1');
  const idle=(await diagnostic()).actors.find(a=>a.own);assert.equal(idle.x,initial.x);assert.equal(idle.y,initial.y);assert.equal((await game()).own,undefined);
  await page.screenshot({path:'artifacts/hang-nhac-game-shell-entry.png'});checks.push('full_window_entry_no_preview_movement_or_cast');
  await page.locator('#join').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().shell.phase==='playing');
  await frame();assert.equal(await page.locator('#entry-screen').isVisible(),false);assert.equal(await page.locator('#sect-objective').isVisible(),true);
  assert.equal(await page.locator('a[href*="map-editor"]').count(),0);assert.equal(await page.locator('#game-shell>header,#game-shell>footer').count(),0);
  const identity=(await game()).own.profileId,hotbar=await page.locator('.game-hotbar').boundingBox();assert.equal(hotbar.width,760);assert.equal(hotbar.height,140);
  await page.locator('#stage').focus();await page.keyboard.press('Escape');await page.locator('#game-menu').waitFor({state:'visible'});
  const before=(await game()).own;await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');await page.keyboard.press('1');
  const after=(await game()).own;assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(after.casts,before.casts);
  await page.locator('#hud-effects').uncheck();assert.equal(await page.locator('.game-hotbar').getAttribute('data-effects'),'off');await page.locator('#hud-effects').check();
  await page.screenshot({path:'artifacts/hang-nhac-game-shell-menu.png'});
  if(await page.evaluate(()=>document.fullscreenEnabled)){
    await page.locator('#fullscreen-toggle').click();await page.waitForFunction(()=>!!document.fullscreenElement);await frame();
    assert.equal((await game()).own.profileId,identity);await page.locator('#fullscreen-toggle').click();await page.waitForFunction(()=>!document.fullscreenElement);await frame();
    checks.push('user_gesture_fullscreen_and_exit_keep_profile');
  }
  await page.locator('#menu-close').click();await page.waitForFunction(()=>document.activeElement?.id==='stage');assert.equal(await page.evaluate(()=>document.activeElement.id),'stage');
  await page.bringToFront();await page.mouse.click(720,600);await page.waitForFunction(()=>document.hasFocus());
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.keyboard.down('ArrowRight');
  try{await page.waitForFunction(x=>window.__hangNhacR01().own.x>x+8,before.x);}finally{await page.keyboard.up('ArrowRight');}
  const aim=(await game()).input.aim,casts=(await game()).own.casts;await page.locator('#character-name').click();
  assert.deepEqual((await game()).input.aim,aim);assert.equal((await game()).own.casts,casts);
  checks.push('real_game_no_page_chrome_native_hotbar_menu_blocks_gameplay_and_UI_does_not_aim');
  for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:1024,height:768},{width:390,height:844},{width:320,height:568},{width:844,height:390}]){
    await page.setViewportSize(size);await page.waitForTimeout(180);await frame();
    const d=await diagnostic();assert.equal(d.zoom,1);assert.deepEqual(d.actors.find(a=>a.own).frameSize,[64,96]);assert.deepEqual(d.actors.find(a=>a.own).anchor,[32,88]);
    if(size.width<=760&&size.height>=568){
      const tracker=await page.locator('#sect-objective').boundingBox(),utility=await page.locator('.skill-panel').boundingBox();
      for(const panel of [tracker,utility])assert.ok(panel.y+panel.height<size.height/2-36,`clear native actor at ${size.width}x${size.height}`);
      assert.ok(utility.x+utility.width<=tracker.x,'left/right HUD panels must not overlap');
      for(const selector of ['#menu-button','#leave','#journal','[data-input=north]']){const touch=await page.locator(selector).boundingBox();assert.ok(touch.width>=44&&touch.height>=44,selector);}
    }
    if(size.width===1366)await page.screenshot({path:'artifacts/hang-nhac-game-shell-desktop.png'});
    if(size.width===390)await page.screenshot({path:'artifacts/hang-nhac-game-shell-mobile.png'});
    if(size.height===390)await page.screenshot({path:'artifacts/hang-nhac-game-shell-landscape.png'});
  }
  checks.push('six_viewports_no_document_scroll_native_scale_and_mobile_controls');
  await page.setViewportSize({width:1440,height:980});const saved=(await game()).own;
  await page.reload();await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().shell.phase==='playing');await frame();
  assert.equal((await game()).own.profileId,identity);assert.equal((await game()).own.casts,saved.casts);assert.ok(Math.abs((await game()).own.x-saved.x)<.1);assert.equal(await page.locator('#entry-screen').isVisible(),false);
  await page.locator('#leave').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().shell.phase==='entry');
  assert.equal(await page.locator('#join:enabled').isVisible(),true);assert.equal((await game()).own,undefined);
  checks.push('reload_resumes_profile_and_explicit_character_switch_returns_to_entry');
  assert.deepEqual(errors,[]);const report={passed:true,checks,errors,fixtureDatabase:dbPath,ownerDatabaseUsed:false,ownerMapEdited:false};
  await writeFile('artifacts/hang-nhac-game-shell-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){console.error(JSON.stringify({checks,errors,diagnostic:page?await page.evaluate(()=>({shell:window.__hangNhacDiagnostics?.().shell,viewport:window.__hangNhacDiagnostics?.().viewport,actors:window.__hangNhacDiagnostics?.().actors,input:window.__hangNhacR01?.().input,focus:document.hasFocus(),active:document.activeElement?.id})):undefined,backend:backend.output(),vite:vite?.output()},null,2));await page?.screenshot({path:'artifacts/hang-nhac-game-shell-failure.png'});throw error;}
finally{await browser?.close();vite?.stop();backend.stop();}
