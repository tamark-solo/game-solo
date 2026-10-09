import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { ProfileStore } from '../server/src/profile-store';
import { HANG_NHAC_AVATARS } from '../shared/hang-nhac';
import type { AvatarId } from '../shared/profiles';
import { SECT_STATIONS, type SectView } from '../shared/sect';
// @ts-expect-error Shared process helper is JavaScript.
import { startService, waitFor } from './support/services.mjs';

const origin='http://127.0.0.1:5193',endpoint='http://127.0.0.1:2594';
await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-sect-browser-')),dbPath=resolve(folder,'profiles.sqlite');
const backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2594',GAME_DB_PATH:dbPath});
let vite:Awaited<ReturnType<typeof startService>>|undefined,browser:Browser|undefined;
let debugPage:Page|undefined;
const checks:string[]=[],errors:string[]=[];
const state=(page:Page):Promise<{view:SectView;modal:boolean}>=>page.evaluate('window.__hangNhacSect()');
const player=(page:Page):Promise<{profileId:string;id:string;hp:number;mp:number;x:number;y:number}>=>page.evaluate('window.__hangNhacR01().own');
try {
  vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5193'],origin,{VITE_SERVER_URL:endpoint});
  const guest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json() as {token:string};
  const seed=(avatarId:AvatarId,stationIndex:number,hp?:number)=>{const store=new ProfileStore(dbPath);try{const p=store.get(store.authenticate(guest.token)!,avatarId);p.x=SECT_STATIONS[stationIndex]!.x+24;p.y=SECT_STATIONS[stationIndex]!.y;if(hp!==undefined)p.hp=hp;store.save(p);}finally{store.close();}};
  seed(HANG_NHAC_AVATARS[0],0);
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:980},deviceScaleFactor:1});
  await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),guest.token);
  const page=await context.newPage();debugPage=page;page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`${origin}/hang-nhac.html`);await page.waitForFunction('window.__hangNhacDiagnostics?.().ready');
  await page.locator('#player-name').focus();
  await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'Process',code:'KeyE',isComposing:true,bubbles:true,cancelable:true})));
  assert.equal(await page.locator('#sect-feedback').isVisible(),false);assert.equal((await state(page)).modal,false);
  const enter=async()=>{await page.locator('#join').click();await waitFor(async()=>!!(await state(page)).view&&!!(await player(page))?.profileId,'sect ready');};
  const leave=async()=>{if((await state(page)).modal)await page.locator('#sect-close').click();await page.locator('#leave').click();await page.waitForFunction('window.__hangNhacDiagnostics().status === "idle"');await waitFor(async()=>!(await state(page)).view,'sect cleared');};
  const talk=async()=>{await page.locator('#stage').focus();await page.keyboard.press('e');await page.locator('#sect-dialog').waitFor({state:'visible'});};
  await enter();assert.equal((await state(page)).view.hn01,false);
  await page.locator('#stage').focus();
  await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'e',code:'KeyE',ctrlKey:true,bubbles:true,cancelable:true})));
  assert.equal(await page.locator('#sect-feedback').isVisible(),false);assert.equal((await state(page)).modal,false);
  await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'Process',code:'KeyE',isComposing:true,bubbles:true,cancelable:true})));
  await page.locator('#sect-dialog').waitFor({state:'visible',timeout:3000});
  assert.match(await page.locator('#sect-title').innerText(),/tiếp dẫn/);
  await leave();
  await page.locator('#stage').focus();await page.keyboard.press('e');
  await page.locator('#sect-feedback').waitFor({state:'visible',timeout:3000});
  assert.match(await page.locator('#sect-feedback').innerText(),/Vào sân chung/);
  assert.equal((await state(page)).modal,false);
  await enter();await talk();
  checks.push('physical_e_with_ime_and_visible_offline_feedback');
  assert.match(await page.locator('#sect-title').innerText(),/tiếp dẫn/);assert.match(await page.locator('#sect-body').innerText(),/Ba thuật|Kiếm Khí/);
  await page.locator('[data-action=accept_intro]').click();await waitFor(async()=>(await state(page)).view.hn01,'intro');assert.equal((await state(page)).view.supplies,2);
  assert.equal(await page.locator('[data-action=accept_intro]').count(),0);await page.screenshot({path:'artifacts/hang-nhac-sect-guide.png'});
  await page.locator('#sect-close').click();await page.locator('#journal').click();
  assert.equal(await page.locator('.sect-pin').count(),4);assert.equal(await page.locator('.sect-minimap polyline').count(),1);await page.locator('#sect-close').click();
  checks.push('npc_keyboard_interaction_intro_once_journal_and_owner_route');
  await leave();seed(HANG_NHAC_AVATARS[0],1);await enter();await talk();
  await page.locator('[data-action=cycle_start]').click();await waitFor(async()=>!!(await state(page)).view.cycleReadyAt,'cycle started');
  assert.equal(await page.locator('[data-action=cycle_step]').isDisabled(),true);
  for(let step=0;step<3;step++){
    await page.locator('[data-action=cycle_step]:enabled').waitFor({state:'visible',timeout:7000});
    await page.locator('[data-action=cycle_step]').click();await waitFor(async()=>(await state(page)).view.cycleStep===step+1,'cycle phase');
    if(step===0){await page.reload();await waitFor(async()=>(await state(page)).view?.cycleStep===1,'reload restores phase');await talk();await page.locator('[data-action=cycle_start]').click();}
  }
  await page.getByRole('button',{name:'Linh lực dùng để thi triển thuật',exact:true}).click();
  await page.waitForFunction('document.querySelector("#sect-message").textContent.includes("chọn lại")');assert.equal((await state(page)).view.cycleStep,3);
  await page.getByRole('button',{name:'Tu vi tích lũy',exact:true}).click();await waitFor(async()=>(await state(page)).view.cycleStep===4,'answer');
  await page.locator('[data-action=confirm_m01]').click();await waitFor(async()=>(await state(page)).view.hn02,'M01');assert.equal((await state(page)).view.cultivation,100);
  assert.equal((await state(page)).view.level,1);assert.equal((await player(page)).mp,100);await page.screenshot({path:'artifacts/hang-nhac-sect-m01.png'});
  checks.push('timed_cycle_disabled_until_ready_reload_resume_understanding_and_m01');
  await page.locator('[data-action=activity_start]').click();await waitFor(async()=>(await state(page)).view.activityStatus==='running','cultivation running');
  await page.locator('#sect-close').click();await waitFor(async()=>(await state(page)).view.cultivation>=102,'online accumulation');
  await page.locator('#stage').focus();await page.keyboard.press('1');await waitFor(async()=>(await state(page)).view.activityStatus==='paused','cast pauses accumulation');
  const beforeReload=await player(page);await page.reload();await waitFor(async()=>(await state(page)).view?.hn02,'M01 after reload');
  assert.equal((await player(page)).id,beforeReload.id);assert.equal((await player(page)).profileId,beforeReload.profileId);
  assert.equal(await page.locator('[data-skill]').count(),3);checks.push('online_cultivation_pauses_for_cast_and_same_profile_resumes');
  for(const avatarId of HANG_NHAC_AVATARS.slice(1)){
    await leave();seed(avatarId,0);await page.locator('#avatar').selectOption(avatarId);await enter();await talk();
    assert.equal((await state(page)).view.hn01,false);assert.equal((await state(page)).view.cultivation,0);
    if(avatarId===HANG_NHAC_AVATARS[1])assert.match(await page.locator('#sect-body').innerText(),/Kiến thức tu luyện.*vẫn còn/);
    else assert.match(await page.locator('#sect-body').innerText(),/tự luyện tập/);
    await page.locator('[data-action=accept_intro]').click();await waitFor(async()=>(await state(page)).view.hn01,'individual intro');
  }
  checks.push('independent_trio_and_character_specific_dialogue');
  await leave();seed(HANG_NHAC_AVATARS[0],3,50);await page.locator('#avatar').selectOption(HANG_NHAC_AVATARS[0]);await enter();
  await page.setViewportSize({width:390,height:844});await talk();await page.locator('[data-action=use_recovery]:enabled').waitFor({state:'visible'});await page.locator('[data-action=use_recovery]').click();await waitFor(async()=>(await player(page)).hp===80,'supply heal');assert.equal((await state(page)).view.supplies,1);
  await page.screenshot({path:'artifacts/hang-nhac-sect-mobile.png'});
  const fit=await page.evaluate<{width:number;scroll:number;dialog:{x:number;right:number;top:number;bottom:number};zoom:number;actors:Array<{frameSize:number[];anchor:number[]}>}>('({width:innerWidth,scroll:document.documentElement.scrollWidth,dialog:document.querySelector("#sect-dialog").getBoundingClientRect().toJSON(),zoom:window.__hangNhacDiagnostics().zoom,actors:window.__hangNhacDiagnostics().actors})');
  assert.ok(fit.scroll<=fit.width);assert.ok(fit.dialog.x>=0&&fit.dialog.right<=390&&fit.dialog.top>=0&&fit.dialog.bottom<=844);
  assert.equal(fit.zoom,1);assert.ok(fit.actors.every((a:{frameSize:number[];anchor:number[]})=>JSON.stringify(a.frameSize)==='[64,96]'&&JSON.stringify(a.anchor)==='[32,88]'));
  assert.deepEqual(errors,[]);checks.push('mobile_dialog_native_scale_recovery_and_no_browser_errors');
  await writeFile('artifacts/hang-nhac-sect-browser-verification.json',JSON.stringify({passed:true,date:new Date().toISOString(),checks,errors,fixturePositions:true,realOwnerStorageWritten:false,screenshots:['hang-nhac-sect-guide.png','hang-nhac-sect-m01.png','hang-nhac-sect-mobile.png']},null,2));
  console.log(JSON.stringify({ok:true,checks},null,2));
}catch(error){console.error(JSON.stringify({errors,diagnostic:await debugPage?.evaluate('({status:document.querySelector("#status").textContent,quest:document.querySelector("#quest-title").textContent,sect:window.__hangNhacSect?.()})')},null,2));await debugPage?.screenshot({path:'artifacts/hang-nhac-sect-failure.png'});throw error;
}finally{await browser?.close();vite?.stop();backend.stop();}
