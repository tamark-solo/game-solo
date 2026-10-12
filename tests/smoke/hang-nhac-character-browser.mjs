import assert from 'node:assert/strict';import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';import {chromium} from 'playwright';import {ProfileStore} from '../../server/src/profile-store.ts';import {HANG_NHAC_AVATARS} from '../../shared/hang-nhac.ts';
import {startService,waitFor} from '../support/services.mjs';
const endpoint='http://127.0.0.1:2630',origin='http://127.0.0.1:5238',captures=resolve('artifacts/character-runtime');await mkdir(captures,{recursive:true});
const folder=await mkdtemp(resolve(captures,'fixture-')),dbPath=resolve(folder,'profiles.sqlite');
let backend,vite,browser;const checks=[],layouts=[],errors=[];
try{
  backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2630',GAME_DB_PATH:dbPath});
  const config=resolve(folder,'vite.mjs');await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(folder,'cache'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5238'],origin,{VITE_SERVER_URL:endpoint});
  const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());const store=new ProfileStore(dbPath),account=store.authenticate(guest.token);
  try{const p=store.get(account,HANG_NHAC_AVATARS[0]);p.hp=50;p.sect.hn01=true;p.sect.supplies=2;store.save(p);}finally{store.close();}
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1366,height:900}});await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),guest.token);
  const page=await context.newPage();page.on('pageerror',error=>{errors.push(error.message);console.error(error.stack);});page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))errors.push(`${r.status()} ${r.url()}`);});
  const state=()=>page.evaluate(()=>window.__hangNhacCharacter()),own=()=>page.evaluate(()=>window.__hangNhacR01().own);
  const shell=async phase=>{try{await page.waitForFunction(phase=>window.__hangNhacDiagnostics?.().shell.phase===phase,phase,{timeout:35000});}catch(error){console.log({phase,errors,loading:await page.locator('#loading').textContent()});throw error;}};
  const settled=()=>page.waitForFunction(()=>window.__hangNhacCharacter().synced&&!window.__hangNhacCharacter().pending&&window.__hangNhacCharacter().online,undefined,{timeout:15000});
  const shot=async name=>{await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('#character-dialog img')].map(image=>image.decode()));});await page.screenshot({path:resolve(captures,name+'.png')});};
  await page.goto(origin+'/hang-nhac.html?devGuest=1');await shell('entry');await page.locator('#join').click();await shell('playing');
  await page.locator('#stage').focus();await page.keyboard.press('c');await page.waitForSelector('#character-dialog[open]');await settled();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'live-tab-overview');
  assert.equal(await page.locator('#character-dialog .character-window').getAttribute('tabindex'),null);
  await page.keyboard.press('ArrowRight');assert.equal((await state()).tab,'inventory');assert.equal(await page.evaluate(()=>document.activeElement.id),'live-tab-inventory');
  await page.keyboard.press('ArrowLeft');assert.equal((await state()).tab,'overview');assert.equal(await page.evaluate(()=>document.activeElement.id),'live-tab-overview');
  const initial=await state();assert.equal(initial.view.items.length,3);assert.equal(initial.view.hp,50);assert.equal(initial.view.sect.supplies,2);assert.equal(initial.view.maxHp,100);assert.equal(initial.view.maxMp,100);
  await page.waitForFunction(()=>window.__hangNhacCharacter().shrine.cultivationReady===3);await shot('desktop-overview');
  assert.doesNotMatch(await page.locator('#character-dialog').innerText(),/dữ liệu mẫu|Vân Khí Châu|140 \/ 240/i);
  await page.locator('#character-dialog [data-action="pose"]').click();await page.waitForFunction(()=>window.__hangNhacCharacter().shrine.moving);
  await page.evaluate(()=>document.querySelector('#game-shell').dataset.motion='reduce');await page.waitForFunction(()=>!window.__hangNhacCharacter().shrine.moving);
  assert.equal((await state()).shrine.index,2);assert.equal((await state()).view.sect.cultivation,0);assert.equal((await state()).view.sect.supplies,2);
  await page.evaluate(()=>document.querySelector('#game-shell').dataset.motion='full');await page.waitForFunction(()=>window.__hangNhacCharacter().shrine.moving);await page.locator('#character-dialog [data-action="pose"]').click();
  checks.push('Live pose honors reduced motion and does not start cultivation or spend resources');
  const casts=(await own()).casts,position={x:(await own()).x,y:(await own()).y};await page.keyboard.press('1');await page.keyboard.press('f');await page.keyboard.press('w');
  await page.waitForTimeout(300);assert.equal((await own()).casts,casts);assert.equal((await own()).x,position.x);assert.equal((await own()).y,position.y);
  checks.push('Live C dialog, real profile/resources/progress/items, no fixture items, world movement/cast blocked');
  await page.locator('#character-dialog .dao-character-subnav [data-sheet="cultivation"]').click();
  assert.equal((await state()).tab,'cultivation');
  await page.locator('#character-dialog .primary-pane [data-quest="HN02"]').click();
  await page.waitForSelector('#sect-dialog[open]');assert.equal(await page.locator('#quest-detail-HN02').isVisible(),true);
  await page.locator('#sect-close').click();await page.waitForSelector('#character-dialog[open]');await settled();
  assert.equal((await state()).tab,'cultivation');assert.equal(await page.evaluate(()=>document.activeElement.dataset.quest),'HN02');
  await page.locator('#character-dialog .dao-character-subnav [data-sheet="spells"]').click();
  await page.locator('#character-dialog [data-read-skill="wind"]').click();assert.match(await page.locator('#character-dialog .detail-pane').innerText(),/Ngự Phong Bộ/);
  await page.locator('#character-dialog [data-quest="HN04"]').click();await page.waitForSelector('#sect-dialog[open]');
  assert.equal(await page.locator('#quest-detail-HN04').isVisible(),true);await page.keyboard.press('Escape');
  await page.waitForSelector('#character-dialog[open]');await settled();assert.equal((await state()).tab,'spells');
  assert.equal(await page.locator('#character-dialog [data-read-skill="wind"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.quest),'HN04');assert.equal((await own()).casts,casts);
  checks.push('Live cultivation and spell readers use shared progress; journal returns to same tab, selected spell and focus without casting');
  await page.locator('#live-tab-inventory').click();const weapon=initial.view.items.find(i=>i.definitionId==='wood-sword'),recovery=initial.view.items.find(i=>i.definitionId==='recovery');
  await page.locator(`#character-dialog .item-cell[data-item="${weapon.id}"]`).click();await page.locator('#character-dialog [data-action="unequip"]').click();await settled();assert.equal((await state()).view.equipment.weapon,undefined);
  assert.equal((await state()).view.hp,50);assert.equal((await own()).mp,100);assert.match(await page.locator('#character-dialog .comparison').innerText(),/100 → 100/);
  await page.locator('#character-dialog [data-action="equip"]').click();await settled();assert.equal((await state()).view.equipment.weapon,weapon.id);
  await page.locator('#character-dialog [data-action="protect"]').click();await settled();assert.equal((await state()).view.items.find(i=>i.id===weapon.id).protected,true);
  await page.locator(`#character-dialog .item-cell[data-item="${recovery.id}"]`).click();await page.locator('#character-dialog [data-action="use"]').click();await settled();assert.equal((await state()).view.sect.supplies,1);assert.equal((await state()).view.hp,80);
  assert.equal(await page.locator('#character-dialog [data-action="use"]').isDisabled(),true);await shot('desktop-inventory');
  checks.push('Confirmed unequip/equip/protect/use updates only after server snapshot, unchanged max HP/MP, shared supplies/cooldown');
  const raw=new DatabaseSync(dbPath);try{
    raw.exec("CREATE TRIGGER fixture_character_fail BEFORE INSERT ON character_receipts BEGIN SELECT RAISE(ABORT,'fixture save failure'); END;");
    await page.locator(`#character-dialog .item-cell[data-item="${weapon.id}"]`).click();const before=(await state()).view.equipment;
    await page.locator('#character-dialog [data-action="unequip"]').click();await settled();assert.deepEqual((await state()).view.equipment,before);assert.match(await page.locator('#character-dialog .character-feedback').innerText(),/giữ nguyên/);
  }finally{raw.exec('DROP TRIGGER fixture_character_fail');raw.close();}
  checks.push('Real SQLite failure rolls back receipt/candidate; live UI retains confirmed equipment');
  await page.locator('#character-item-search').fill('ao vai');assert.equal(await page.locator('#character-dialog .item-cell').count(),1);
  const robe=initial.view.items.find(i=>i.definitionId==='plain-robe');await page.locator(`#character-dialog .item-cell[data-item="${robe.id}"]`).click();
  await page.locator('#live-tab-equipment').click();assert.equal(await page.locator('#character-dialog [data-slot="robe"]').getAttribute('aria-pressed'),'true');
  assert.equal((await state()).selectedId,robe.id);assert.match(await page.locator('#live-item-title').innerText(),/Áo vải/);
  await page.locator('#live-tab-inventory').click();await page.locator('#character-item-search').fill('');
  await page.locator('#character-dialog [data-location="bag"]').click();assert.equal(await page.locator('#character-dialog .item-cell').count(),1);
  await page.locator('#character-dialog [data-location="equipped"]').click();assert.equal(await page.locator('#character-dialog .item-cell').count(),2);
  await page.locator('#character-dialog [data-location="all"]').click();
  await page.locator(`#character-dialog .item-cell[data-item="${recovery.id}"]`).click();await page.locator('#character-dialog .dao-item-source summary').click();
  await page.evaluate(()=>{document.querySelector('#character-dialog [data-action="protect"]').click();document.querySelector('#character-dialog .dao-item-source summary').focus();});await settled();
  assert.equal(await page.locator('#character-dialog .dao-item-source').getAttribute('open'),'');
  assert.equal(await page.evaluate(()=>document.activeElement.matches('#character-dialog .dao-item-source summary')),true);
  await page.locator('#character-dialog .dao-item-source [data-quest="HN01"]').click();await page.waitForSelector('#sect-dialog[open]');
  assert.equal(await page.locator('#quest-detail-HN01').isVisible(),true);await page.locator('#sect-close').click();await page.waitForSelector('#character-dialog[open]');await settled();
  assert.equal((await state()).tab,'inventory');assert.equal((await state()).selectedId,recovery.id);assert.equal(await page.locator('#character-dialog .dao-item-source').getAttribute('open'),'');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.quest),'HN01');assert.equal((await state()).view.sect.supplies,1);
  checks.push('Diacritic-free search, bag/equipped filters, consistent equipment slot, disclosure and source focus survive confirmed snapshot and journal roundtrip');
  await page.locator('#character-item-search').fill('Không tìm thấy');assert.equal(await page.locator('#character-dialog .item-cell').count(),0);await page.locator('#character-dialog [data-action="clear-filter"]').click();
  assert.equal(await page.locator('#character-dialog .item-cell').count(),3);
  await page.keyboard.press('Escape');await page.waitForSelector('#character-dialog:not([open])',{state:'attached'});await page.waitForFunction(()=>document.activeElement.id==='stage');
  await page.keyboard.press('i');await settled();assert.equal((await state()).tab,'inventory');
  checks.push('Search/filter and Escape/I focus and direct inventory navigation');
  for(const [width,height] of [[320,740],[390,844],[760,760],[980,780],[1100,800],[1366,900],[844,390]]){
    await page.setViewportSize({width,height});
    for(const scale of [1,1.5,2]){
      await page.evaluate(scale=>{document.querySelector('#character-dialog').style.setProperty('--ui-text-body',`${15*scale}px`);document.querySelector('#character-dialog').style.setProperty('--ui-text-small',`${12*scale}px`);},scale);
      try{await page.locator(`#character-dialog .item-cell[data-item="${weapon.id}"]`).click({timeout:5000});}catch(error){await page.screenshot({path:resolve(captures,'layout-failure.png')});console.log({width,height,scale,body:await page.locator('#live-character-content').getAttribute('class'),metrics:await page.locator('#character-dialog .item-cell').first().evaluate(node=>{const result=[];while(node){const r=node.getBoundingClientRect(),s=getComputedStyle(node);result.push({class:node.className,hidden:node.hidden,rect:[r.x,r.y,r.width,r.height],display:s.display,visibility:s.visibility});node=node.parentElement;}return result;})});throw error;}
      const metrics=await page.evaluate(()=>{
        const root=document.querySelector('#character-dialog'),frame=root.querySelector('.character-window'),surface=frame.querySelector('.vn-frame-surface'),r=frame.getBoundingClientRect(),s=surface.getBoundingClientRect();
        return {aligned:['x','y','width','height'].every(k=>Math.abs(r[k]-s[k])<.75),inside:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1,
          overflow:[...root.querySelectorAll('.ui-reading,.ui-copy-section,.detail-title,.character-tabs,.inventory-tools')].filter(n=>n.getBoundingClientRect().width&&n.scrollWidth>n.clientWidth+1).map(n=>n.className)};
      });assert.equal(metrics.aligned,true);assert.equal(metrics.inside,true,JSON.stringify({width,height,scale,metrics}));assert.deepEqual(metrics.overflow,[],`${width}×${height}/${scale}`);layouts.push({width,height,scale,...metrics});
      if(width<760)await page.locator('#character-dialog [data-action="back"]').click();
    }
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const root=document.querySelector('#character-dialog');root.style.removeProperty('--ui-text-body');root.style.removeProperty('--ui-text-small');});
  await shot('mobile-inventory');await page.locator(`#character-dialog .item-cell[data-item="${weapon.id}"]`).click();await shot('mobile-detail');await page.keyboard.press('Escape');assert.equal((await state()).modal,true);
  assert.equal(await page.locator(`#character-dialog .item-cell[data-item="${weapon.id}"]`).evaluate(n=>n===document.activeElement),true);
  checks.push('21 live responsive/text configurations, frame backing, native modal, mobile detail back focus');
  await page.setViewportSize({width:1366,height:900});
  await context.setOffline(true);await page.waitForFunction(()=>!window.__hangNhacCharacter().online,{timeout:15000});assert.equal((await state()).view.items.find(i=>i.id===weapon.id).protected,true);
  await context.setOffline(false);await shell('playing');await settled();assert.equal((await state()).view.sect.supplies,1);
  await page.reload();await shell('playing');await page.locator('#stage').focus();await page.keyboard.press('i');await settled();assert.equal((await state()).view.sect.supplies,1);assert.equal((await state()).view.items.find(i=>i.id===weapon.id).protected,true);
  checks.push('Offline/reconnect and reload preserve inventory/protection/quantity without replay');
  backend.stop();await waitFor(()=>backend.child.exitCode!==null||backend.child.signalCode!==null,'backend stopped');await page.waitForFunction(()=>!window.__hangNhacCharacter().online,{timeout:15000});
  backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2630',GAME_DB_PATH:dbPath});await shell('playing');await settled();
  assert.equal((await state()).view.profileId,initial.view.profileId);assert.equal((await state()).view.hp,80);assert.equal((await state()).view.sect.supplies,1);assert.equal((await state()).view.equipment.weapon,weapon.id);
  checks.push('Backend restart restores same profile and committed gear/supplies; no automatic inventory commands');
  await page.keyboard.press('Escape');await page.waitForSelector('#character-dialog:not([open])',{state:'attached'});await page.locator('#leave').click();await shell('entry');
  for(const avatar of HANG_NHAC_AVATARS.slice(1)){
    await page.locator(`[data-avatar-choice="${avatar}"]`).click();await page.locator('#join').click();await shell('playing');await page.locator('#character-open').click();await settled();
    const next=await state();assert.equal(next.view.avatarId,avatar);assert.equal(next.view.items.length,2);assert.equal(next.view.sect.supplies,0);assert.ok(next.view.items.every(i=>!i.protected));
    if(avatar==='CHR-SITU-NAN')assert.doesNotMatch(await page.locator('#character-dialog').innerText(),/Ngưng Khí/);
    await page.keyboard.press('Escape');await page.waitForSelector('#character-dialog:not([open])',{state:'attached'});await page.locator('#leave').click();await shell('entry');
  }
  checks.push('Switching avatars reads separate live inventory; spirit progression remains recovery');
  assert.deepEqual(errors,[]);await writeFile(resolve(captures,'verification.json'),JSON.stringify({date:'2026-10-10',passed:true,checks,layouts,errors,ownerDataUntouched:true},null,2)+'\n');console.log(`Character browser: ${checks.length} groups and ${layouts.length} live layouts passed.`);
}finally{await browser?.close();vite?.stop();backend?.stop();}
