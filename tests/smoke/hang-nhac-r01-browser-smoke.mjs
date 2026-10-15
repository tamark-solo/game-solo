import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { chromium } from 'playwright';
import { startService, waitFor } from '../support/services.mjs';

const origin='http://127.0.0.1:5191',endpoint='http://127.0.0.1:2592';
await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-browser-profile-'));
const backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2592',GAME_DB_PATH:resolve(folder,'profiles.sqlite')});
// Capture the server's committed MP at each cast in this disposable fixture only.
// Screenshots and two software WebGL clients may take longer than the 2s regen delay.
const audit=new DatabaseSync(resolve(folder,'profiles.sqlite'));
audit.exec(`CREATE TABLE fixture_cast_snapshots (profile_id TEXT NOT NULL, casts INTEGER NOT NULL, data TEXT NOT NULL);
  CREATE TRIGGER fixture_capture_cast AFTER UPDATE ON profiles
  WHEN json_extract(NEW.data,'$.casts')>json_extract(OLD.data,'$.casts')
  BEGIN INSERT INTO fixture_cast_snapshots VALUES(NEW.id,json_extract(NEW.data,'$.casts'),NEW.data); END;`);
function verifyCastCosts(profileId,count){
  const snapshots=audit.prepare('SELECT data FROM fixture_cast_snapshots WHERE profile_id=? ORDER BY casts').all(profileId).map(row=>JSON.parse(row.data));
  const receipts=audit.prepare('SELECT result FROM cast_receipts WHERE profile_id=?').all(profileId).map(row=>JSON.parse(row.result).result);
  assert.equal(snapshots.length,count);assert.equal(receipts.length,count);
  const skills=['sword','thunder','wind'],costs=[10,25,10];
  assert.deepEqual(receipts.map(receipt=>receipt.skillId).sort(),skills.slice(0,count).sort());
  assert.ok(receipts.every(receipt=>receipt.accepted&&!receipt.duplicate));
  for(const [index,snapshot]of snapshots.entries()){
    assert.equal(snapshot.casts,index+1);
    if(index===0){assert.equal(snapshot.mp,100-costs[index]);continue;}
    const previous=snapshots[index-1],ticks=Math.round((snapshot.lastSpentAt-previous.lastSpentAt)/(1000/30));
    // Browser casts resolve before regen in their input tick. At 30Hz, floating
    // timestamps can put the first eligible regen on tick 60 or 61 after spending.
    const minimum=Math.min(100,previous.mp+Math.max(0,ticks-61)*.4)-costs[index];
    const maximum=Math.min(100,previous.mp+Math.max(0,ticks-60)*.4)-costs[index];
    assert.ok(snapshot.mp>=minimum-.001&&snapshot.mp<=maximum+.001,
      `${skills[index]} must spend ${costs[index]} MP after server-timed regen: ${snapshot.mp} outside ${minimum}..${maximum}`);
  }
  return snapshots;
}
let vite,browser,debugPage;const errors=[],checks=[],httpFailures=[];
const state=page=>page.evaluate(()=>window.__hangNhacR01());
try{
  vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5191'],origin,{VITE_SERVER_URL:endpoint});
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-proxy-server']});
  // Two software WebGL clients must keep heartbeats/rendering active while the other tab is focused.
  const context=await browser.newContext({viewport:{width:720,height:720},deviceScaleFactor:1}),page=await context.newPage();
  const traceHttp=p=>p.on('response',response=>{if(response.status()<400)return;const url=new URL(response.url());httpFailures.push({origin:url.origin,path:url.pathname,status:response.status(),server:response.headers().server});if(httpFailures.length>20)httpFailures.shift();});
  context.on('page',traceHttp);traceHttp(page);
  debugPage=page;
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`${origin}/hang-nhac.html?devGuest=1`);await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);await page.locator('#join').click();
  await page.waitForFunction(()=>window.__hangNhacDiagnostics().status==='connected');
  await page.waitForFunction(()=>window.__hangNhacR01().own?.profileId);const original=await state(page);
  assert.equal(original.profiles.length,3);assert.ok(original.profiles.every(p=>p.skills.join(',')==='sword,thunder,wind'));
  const peerContext=await browser.newContext({viewport:{width:720,height:720}}),peer=await peerContext.newPage();
  traceHttp(peer);
  peer.on('pageerror',e=>errors.push(e.message));await peer.goto(`${origin}/hang-nhac.html?devGuest=1`);await peer.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);
  await peer.locator('#avatar').selectOption('CHR-LI-MUWAN');await peer.locator('#join').click();await peer.waitForFunction(()=>window.__hangNhacDiagnostics().status==='connected');
  await peer.waitForFunction(()=>window.__hangNhacR01().own?.profileId);
  const peerInitial=await state(peer);assert.ok(Math.hypot(peerInitial.own.x-original.own.x,peerInitial.own.y-original.own.y)>30,'fresh profiles have distinct spawn positions');
  await page.bringToFront();assert.equal(original.vfx.atlases,10);
  // This fixture verifies an eastward 160px dash; explicitly aim east through the real map control.
  const camera=await page.evaluate(()=>window.__hangNhacDiagnostics().cameraCenter),box=await page.locator('#stage').boundingBox();
  // Stay close to the actor so the skill panel cannot intercept the map click.
  await page.mouse.click(box.x+box.width/2+original.own.x-camera.x+40,box.y+box.height/2+original.own.y-camera.y);
  await page.waitForFunction(()=>window.__hangNhacR01().input.aim.x>.99&&Math.abs(window.__hangNhacR01().input.aim.y)<.01);
  await page.locator('#training').click();await page.waitForFunction(()=>Object.keys(window.__hangNhacR01().targets??{}).length===1);
  await peer.evaluate(()=>{
    window.__r01PeerRenderedFx=false;
    const sample=()=>{if(window.__hangNhacR01().vfx.renderedEffects.length)window.__r01PeerRenderedFx=true;requestAnimationFrame(sample);};
    requestAnimationFrame(sample);
  });
  await page.locator('#stage').focus();await page.keyboard.press('1');await page.waitForFunction(()=>window.__hangNhacR01().own?.casts===1);
  await peer.waitForFunction(()=>window.__r01PeerRenderedFx);
  await page.waitForTimeout(150);await page.screenshot({path:'artifacts/hang-nhac-r01-sword.png'});
  assert.ok(await peer.evaluate(()=>window.__r01PeerRenderedFx),'remote client rendered confirmed cast FX before they expired');
  await page.waitForFunction(()=>window.__hangNhacR01().own?.practiceHits===1);verifyCastCosts(original.own.profileId,1);
  await page.locator('button[data-skill=thunder][aria-disabled="false"]').click();await page.waitForFunction(()=>window.__hangNhacR01().own?.practiceHits===2);
  await page.screenshot({path:'artifacts/hang-nhac-r01-thunder.png'});
  await page.locator('button[data-skill=wind][aria-disabled="false"]').click();await page.waitForFunction(()=>window.__hangNhacR01().own?.casts===3&&!window.__hangNhacR01().own.castId);
  const completed=await state(page),costSnapshots=verifyCastCosts(completed.own.profileId,3);assert.ok(Math.abs(completed.own.x-original.own.x-160)<.1);
  assert.equal(Object.values(completed.targets)[0].hp,25);assert.equal((await state(peer)).own.hp,100);checks.push('three_r01_from_start_keyboard_buttons_costs_hits_and_dash','remote_client_shows_fx_without_player_damage');
  await page.reload();await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().status==='connected');
  await page.waitForFunction(()=>window.__hangNhacR01().own?.profileId);
  const reloaded=await state(page);assert.equal(reloaded.own.profileId,completed.own.profileId);assert.equal(reloaded.own.id,completed.own.id);
  assert.equal(reloaded.own.casts,3);assert.ok(Math.abs(reloaded.own.x-completed.own.x)<.1);checks.push('reload_resumes_same_session_profile_and_position');
  const duplicate=await context.newPage();await duplicate.goto(`${origin}/hang-nhac.html?devGuest=1`);await duplicate.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);
  await duplicate.locator('#avatar').selectOption('CHR-SITU-NAN');await duplicate.locator('#join').click();await duplicate.waitForFunction(()=>window.__hangNhacDiagnostics().status==='error');
  // A denied join stays on entry; check the error where that player can read it.
  await duplicate.locator('#entry-status').waitFor({state:'visible'});
  assert.match(await duplicate.locator('#entry-status').innerText(),/tab khác/);assert.equal((await state(page)).own.casts,3);await duplicate.close();checks.push('second_tab_cannot_control_same_account');
  await page.bringToFront();await page.locator('#menu-button').click();await page.locator('#menu-character').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().status==='idle');
  for(const id of ['CHR-SITU-NAN','CHR-LI-MUWAN']){
    await page.locator('#avatar').selectOption(id);await page.locator('#join').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().status==='connected');
    await page.waitForFunction(()=>window.__hangNhacR01().own?.profileId);
    const p=await state(page);assert.equal(p.own.casts,0);assert.equal(p.own.mp,100);assert.equal(p.own.avatarId,id);
    assert.equal(p.own.progressionKind,id==='CHR-SITU-NAN'?'recovery':'cultivation');
    await page.locator('#menu-button').click();await page.locator('#menu-character').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().status==='idle');
  }
  await page.locator('#avatar').selectOption('CHR-WANG-LIN-CHIBI');await page.locator('#join').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().status==='connected');
  await page.waitForFunction(()=>window.__hangNhacR01().own?.profileId);
  assert.equal((await state(page)).own.profileId,completed.own.profileId);assert.equal((await state(page)).own.casts,3);checks.push('character_switch_keeps_separate_saves');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  for(const selector of ['.skill-panel','.touch-pad']){const box=await page.locator(selector).boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390);}
  const panel=await page.locator('.skill-panel').boundingBox(),stage=await page.locator('#stage').boundingBox();assert.ok(panel.y+panel.height<stage.y+stage.height/2-36,'mobile HUD leaves native character visible');
  await page.screenshot({path:'artifacts/hang-nhac-r01-mobile.png'});checks.push('mobile_skill_and_movement_controls_fit');
  const diagnostic=await page.evaluate(()=>window.__hangNhacDiagnostics());assert.deepEqual(diagnostic.actors.find(a=>a.own).frameSize,[64,96]);assert.equal(diagnostic.zoom,1);
  assert.deepEqual(errors,[]);const report={passed:true,checks,errors,vfxAtlases:10,characterScale:[64,96],casts:3,practiceHits:2,
    committedCastResources:costSnapshots.map(({casts,mp,lastSpentAt})=>({casts,mp,lastSpentAt}))};
  await writeFile('artifacts/hang-nhac-r01-browser-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){
  console.error(error);
  console.error(JSON.stringify({checks,errors,state:await debugPage?.evaluate(()=>({own:window.__hangNhacR01?.().own,targets:window.__hangNhacR01?.().targets,
    selectedTarget:window.__hangNhacR01?.().selectedTarget,game:window.__hangNhacDiagnostics?.().status,
    feedback:document.querySelector('#skill-feedback')?.textContent,requests:performance.getEntriesByType('resource').filter(r=>r.name.includes('/api/')).map(r=>r.name)})),
    httpFailures,backend:backend.output(),vite:vite?.output()},null,2));
  await debugPage?.screenshot({path:'artifacts/hang-nhac-r01-browser-failure.png'});throw error;
}finally{await browser?.close();vite?.stop();backend.stop();audit.close();}
