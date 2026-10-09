import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { ProfileStore } from '../../server/src/profile-store';
import { SECT_STATIONS } from '../../shared/sect';
// @ts-expect-error Process helper is an existing JavaScript module.
import { startService, waitFor } from '../support/services.mjs';

const origin='http://127.0.0.1:5198',endpoint='http://127.0.0.1:2596';
await mkdir('artifacts',{recursive:true});
const folder=await mkdtemp(resolve('artifacts/hn-reload-')),dbPath=resolve(folder,'profiles.sqlite');
const publicDir=resolve(folder,'public');await cp('client/public',publicDir,{recursive:true});
const config=resolve(folder,'vite.config.mjs');
await writeFile(config,`import config from '../../vite.config.ts';\nexport default {...config,publicDir:${JSON.stringify(publicDir)},cacheDir:${JSON.stringify(resolve(folder,'vite-cache'))},server:{...config.server,port:5198}};\n`);
let backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2596',GAME_DB_PATH:dbPath});
let vite:Awaited<ReturnType<typeof startService>>|undefined,browser:Browser|undefined,page:Page|undefined;
const errors:string[]=[],checks:unknown[]=[];
const state=(p:Page):Promise<any>=>p.evaluate('({game:window.__hangNhacDiagnostics(),sect:window.__hangNhacSect(),r01:window.__hangNhacR01(),focus:document.activeElement?.id})');
try {
  vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5198'],origin,{VITE_SERVER_URL:endpoint});
  const guest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json() as {token:string};
  const store=new ProfileStore(dbPath);try {
    const profile=store.get(store.authenticate(guest.token)!,'CHR-WANG-LIN-CHIBI');
    profile.x=SECT_STATIONS[0].x+24;profile.y=SECT_STATIONS[0].y;store.save(profile);
  }finally{store.close();}
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const context=await browser.newContext({viewport:{width:960,height:720}});
  await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),guest.token);
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/hang-nhac.html');await page.waitForFunction('window.__hangNhacDiagnostics?.().ready');
  await page.locator('#join').click();await waitFor(async()=>!!(await state(page!)).sect.view,'initial sect state');
  const initial=await state(page);
  const talk=async()=>{await page!.keyboard.press('e');await page!.locator('#sect-dialog').waitFor({state:'visible',timeout:15000});};
  await talk();
  const assets=['assets/catalog.json','assets/r01/clips.json','assets/CHR-WANG-LIN-CHIBI/atlas.json'];
  for(let i=0;i<3;i++){
    // Exercise the same public-asset writes performed by a build, in a separate Vite publicDir.
    for(const asset of assets){const path=resolve(publicDir,asset);await writeFile(path,await readFile(path));}
    await page.reload();
    await waitFor(async()=>{const s=await state(page!);return s.game.status==='connected'&&s.sect.view?.profileId===initial.sect.view.profileId;},'build reload resume');
    const resumed=await state(page);assert.equal(resumed.r01.own.profileId,initial.r01.own.profileId);
    assert.equal(resumed.sect.modal,false);assert.equal(resumed.focus,'stage');
    // Do not refocus the stage: that would conceal the bug reported after a build.
    await page.locator('#interact').click();await page.locator('#sect-dialog').waitFor({state:'visible',timeout:15000});
    await page.locator('#sect-close').click();await page.locator('#sect-dialog').waitFor({state:'hidden'});
    await talk();await page.locator('#sect-close').click();await page.locator('#sect-dialog').waitFor({state:'hidden'});
    if(i===0){
      await page.locator('[data-skill=sword]:enabled').waitFor({state:'visible'});
      const before=(await state(page)).r01.own.casts;await page.keyboard.press('1');
      await waitFor(async()=>(await state(page!)).r01.own.casts===before+1,'skill after reload, without NPC grant');
      await page.waitForFunction('!window.__hangNhacR01().own.castId');
    }
    await talk();checks.push({type:'asset-build-reload',cycle:i+1,sameProfile:true,physicalEWithoutRefocus:true,screenButton:true,skillWithoutNpcGrant:i===0?'cast verified':'same saved rights'});
  }
  await page.locator('#sect-close').click();
  for(let i=0;i<3;i++){
    const beforeDrop:string=(await state(page)).game.sessionId;
    await context.setOffline(true);
    await waitFor(async()=>(await state(page!)).game.status==='reconnecting','transport dropped');
    await context.setOffline(false);
    await waitFor(async()=>{const s=await state(page!);return s.game.status==='connected'&&s.r01.own?.connected;},'transport reconnected');
    await talk();await page.locator('#sect-close').click();
    await page.locator('#interact').click();await page.locator('#sect-dialog').waitFor({state:'visible',timeout:15000});
    checks.push({type:'transport-reconnect',cycle:i+1,physicalE:true,screenButton:true});
    await page.reload();
    await waitFor(async()=>{const s=await state(page!);return s.game.status==='connected'&&s.sect.view?.profileId===initial.sect.view.profileId;},'reload after transport reconnect');
    assert.equal((await state(page)).game.sessionId,beforeDrop,'latest reconnection token must preserve the same session after reload');
    await talk();await page.locator('#sect-close').click();
  }
  backend.stop();await waitFor(async()=>{try{await fetch(`${endpoint}/health`);return false;}catch{return true;}},'fixture backend stopped');
  backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2596',GAME_DB_PATH:dbPath});
  await waitFor(async()=>{const s=await state(page!);return s.game.status==='connected'&&s.sect.view?.profileId===initial.sect.view.profileId;},'server restart automatic recovery',20000);
  await talk();await page.locator('#sect-close').click();
  await page.locator('#interact').click();await page.locator('#sect-dialog').waitFor({state:'visible'});
  checks.push({type:'backend-restart-without-reload',sameProfile:true,physicalEWithoutRefocus:true,screenButton:true});
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'artifacts/hang-nhac-reload-interaction.png'});
  // Explicit leave cancels scheduled recovery; a backend restart must not pull the player back in.
  await page.locator('#sect-close').click();
  backend.stop();await waitFor(async()=>(await state(page!)).game.status==='reconnecting','second backend drop');
  await page.locator('#leave').click();await waitFor(async()=>(await state(page!)).game.status==='idle','leave cancels recovery');
  backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2596',GAME_DB_PATH:dbPath});
  await page.waitForTimeout(1600);assert.equal((await state(page)).game.status,'idle');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('hang-nhac.active.v1')),null);
  checks.push({type:'explicit-leave-during-recovery',staysOffline:true});
  await writeFile('artifacts/hang-nhac-reload-interaction.json',JSON.stringify({passed:true,date:new Date().toISOString(),checks,errors,fixturePublicDir:true,realOwnerStorageWritten:false},null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks,errors},null,2));
}catch(error){console.error(JSON.stringify({checks,errors,state:page?await state(page):undefined,vite:vite?.output(),backend:backend.output()},null,2));await page?.screenshot({path:'artifacts/hang-nhac-reload-interaction-failure.png'});throw error;}
finally{await browser?.close();vite?.stop();backend.stop();}
