import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { ProfileStore } from '../../server/src/profile-store.ts';
import { HANG_NHAC } from '../../shared/hang-nhac.ts';
import { startService, waitFor } from '../support/services.mjs';

const origin='http://127.0.0.1:5199',endpoint='http://127.0.0.1:2599';
await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-aim-')),dbPath=resolve(folder,'profiles.sqlite');
const backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2599',GAME_DB_PATH:dbPath});
let vite,browser,page;const errors=[],checks=[];
const state=p=>p.evaluate(()=>window.__hangNhacR01());
try {
  vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5199'],origin,{VITE_SERVER_URL:endpoint});
  const guest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json();
  const avatars=['CHR-WANG-LIN-CHIBI','CHR-SITU-NAN','CHR-LI-MUWAN'];
  const store=new ProfileStore(dbPath);try{for(const avatar of avatars){const profile=store.get(store.authenticate(guest.token),avatar);Object.assign(profile,HANG_NHAC.world.spawn,{direction:'north'});store.save(profile);}}finally{store.close();}
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const context=await browser.newContext({viewport:{width:960,height:720}});
  await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),guest.token);
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const load=async()=>{
    await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);
    await page.waitForFunction(()=>window.__hangNhacR01().own?.connected);
    await page.evaluate(()=>{
      window.__aimCasts={};
      const sample=()=>{
        const r=window.__hangNhacR01(),d=window.__hangNhacDiagnostics(),a=r.own;
        if(a?.castId){const item=window.__aimCasts[a.castId]??={x:a.castAimX,y:a.castAimY,direction:a.direction,casts:a.casts,clips:[]};
          const sprite=d.sprites.find(s=>s.id===a.id&&s.animationSource==='skill');if(sprite&&!item.clips.includes(sprite.clip))item.clips.push(sprite.clip);}
        requestAnimationFrame(sample);
      };requestAnimationFrame(sample);
    });
  };
  const aim=async(x,y)=>{
    const s=await state(page),d=await page.evaluate(()=>window.__hangNhacDiagnostics()),box=await page.locator('#stage').boundingBox();
    await page.mouse.click(box.x+box.width/2+s.own.x-d.cameraCenter.x+x*90,box.y+box.height/2+s.own.y-d.cameraCenter.y+y*90);
    return (await state(page)).input.aim;
  };
  const expectAim=async(x,y,source)=>{await waitFor(async()=>{const s=(await state(page)).input;return Math.abs(s.aim.x-x)<.001&&Math.abs(s.aim.y-y)<.001&&(!source||s.source===source);},`aim ${x},${y} ${source??''}`);};
  const cast=async(skill,x,y,direction,trigger)=>{
    await page.locator(`[data-skill=${skill}][aria-disabled="false"]`).waitFor();
    const before=(await state(page)).own.casts;
    if(trigger)await trigger();else await page.keyboard.press({sword:'1',thunder:'2',wind:'3'}[skill]);
    await waitFor(async()=>(await state(page)).own.casts===before+1,'accepted cast');
    await waitFor(async()=>!(await state(page)).own.castId,'cast completed');
    const s=await state(page),captured=await page.evaluate(()=>window.__aimCasts);
    const release=s.vfx.trace.filter(t=>t.type==='release').at(-1);
    assert.ok(release,'cast reaches release, rather than merely charging on cancellation');
    const item=captured[release.castId];assert.ok(item,'observed accepted cast snapshot');
    assert.equal(item.casts,before+1,'release belongs to this command, not an older cast');
    assert.ok(Math.abs(item.x-x)<.001&&Math.abs(item.y-y)<.001,JSON.stringify(item));assert.equal(item.direction,direction);
    const catalog=await page.evaluate(()=>fetch('/assets/r01/clips.json').then(r=>r.json()));
    assert.ok(item.clips.includes(catalog.skills[skill].bindings[s.own.avatarId][direction]),'actual rendered pose uses the accepted direction');
    checks.push({avatar:s.own.avatarId,skill,direction,aim:[x,y],renderedClip:item.clips[0],released:true});return s;
  };
  await page.goto(origin+'/hang-nhac.html');await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);await page.locator('#join').click();await load();
  await expectAim(0,-1,'facing');await cast('sword',0,-1,'north');
  // Two handlers in one frame: a newly held movement key and a skill key must not self-cancel.
  await cast('sword',1,0,'east',()=>page.evaluate(()=>{
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'d',code:'KeyD',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'1',code:'Digit1',bubbles:true}));
  }));await page.keyboard.up('d');checks.push({movementAndCastSameFrame:true});
  for(const avatar of avatars){
    if((await state(page)).own.avatarId!==avatar){await page.locator('#leave').click();await page.waitForFunction(()=>window.__hangNhacDiagnostics().status==='idle');
      await page.locator('#avatar').selectOption(avatar);await page.locator('#join').click();await load();await expectAim(0,-1,'facing');}
    for(const [key,x,y,direction] of [['d',1,0,'east'],['ArrowDown',0,1,'south'],['a',-1,0,'west'],['ArrowUp',0,-1,'north']]){
      await page.locator('#stage').focus();await page.keyboard.down(key);await expectAim(x,y,'movement');
      // Let the ordinary movement stream reach the server, then stop. Aim must survive stopping.
      await page.waitForTimeout(100);await page.keyboard.up(key);await expectAim(x,y,'movement');await cast('sword',x,y,direction);
    }
  }
  await page.keyboard.down('d');await expectAim(1,0,'movement');const pointed=await aim(0,-1);await page.waitForTimeout(120);await expectAim(pointed.x,pointed.y,'pointer');
  await page.keyboard.up('d');await expectAim(pointed.x,pointed.y,'pointer');await page.keyboard.down('d');await expectAim(1,0,'movement');await page.keyboard.up('d');
  checks.push({pointerOverridesHeldMovement:true,releaseRetainsAim:true,repressRestoresMovement:true});
  await aim(-1,0);await page.locator('#training').click();await waitFor(async()=>!!(await state(page)).selectedTarget,'target selected');
  await aim(1,0);const beforeThunder=await state(page),target=beforeThunder.targets[beforeThunder.selectedTarget],tx=target.x-beforeThunder.own.x,ty=target.y-beforeThunder.own.y,tm=Math.hypot(tx,ty);await cast('thunder',tx/tm,ty/tm,'west');
  await waitFor(async()=>(await state(page)).own.practiceHits===beforeThunder.own.practiceHits+1,'targeted thunder hit');
  const beforeWind=await state(page),windAim=await aim(0,-1);const wind=await cast('wind',windAim.x,windAim.y,'north');assert.ok(beforeWind.own.y-wind.own.y>150);assert.ok(Math.abs(wind.own.x-beforeWind.own.x)<1);
  // Changing pointer aim during an active dash affects the next skill, not this accepted dash.
  await page.locator('[data-skill=wind][aria-disabled="false"]').waitFor();await aim(0,1);await page.keyboard.press('3');
  await waitFor(async()=>!!(await state(page)).own.castId,'active dash');const changed=await aim(-1,0);
  await page.waitForFunction(()=>!window.__hangNhacR01().own.castId);const afterDash=await state(page);assert.ok(afterDash.own.y-wind.own.y>150);await expectAim(changed.x,changed.y,'pointer');assert.ok(changed.y<.95,'pointer changed the next aim away from the accepted south dash');
  checks.push({acceptedDashStaysFixed:true});
  await page.setViewportSize({width:390,height:844});
  const touch=await page.locator('[data-input=west]').boundingBox();await page.mouse.move(touch.x+touch.width/2,touch.y+touch.height/2);await page.mouse.down();await expectAim(-1,0,'movement');await page.mouse.up();await expectAim(-1,0,'movement');
  await cast('sword',-1,0,'west');
  const panel=await page.locator('.skill-panel').boundingBox(),stage=await page.locator('#stage').boundingBox();assert.ok(panel.y+panel.height<stage.y+stage.height/2-36);
  await page.screenshot({path:'artifacts/hang-nhac-skill-aim-mobile.png'});checks.push({mobileMovementAndHud:true});
  await page.setViewportSize({width:960,height:720});await page.locator('#stage').focus();
  await page.keyboard.down('w');await page.keyboard.down('d');await expectAim(Math.SQRT1_2,-Math.SQRT1_2,'movement');await page.keyboard.up('d');await page.keyboard.up('w');
  await expectAim(0,-1,'movement');
  await page.reload();await load();const loaded=await state(page);await expectAim(...Object.values(({north:{x:0,y:-1},south:{x:0,y:1},east:{x:1,y:0},west:{x:-1,y:0}})[loaded.own.direction]),'facing');
  checks.push({reloadUsesSavedFacing:true,diagonalNormalized:true});
  assert.deepEqual(errors,[]);const report={passed:true,date:new Date().toISOString(),checks,errors,fixtureDatabase:true,realOwnerStorageWritten:false};
  await writeFile('artifacts/hang-nhac-skill-aim-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){const s=page?await state(page):undefined;console.error(JSON.stringify({checks,errors,own:s?.own,input:s?.input,feedback:page?await page.locator('#skill-feedback').textContent():undefined,trace:s?.vfx.trace.slice(-10),backend:backend.output(),vite:vite?.output()},null,2));await page?.screenshot({path:'artifacts/hang-nhac-skill-aim-failure.png'});throw error;}
finally{await browser?.close();vite?.stop();backend.stop();}
