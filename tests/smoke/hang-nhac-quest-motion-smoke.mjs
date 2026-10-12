import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { ProfileStore } from '../../server/src/profile-store.ts';
import { SECT_STATIONS, nearStation } from '../../shared/sect.ts';
import { HANG_NHAC_AVATARS } from '../../shared/hang-nhac.ts';
import { startService } from '../support/services.mjs';
const sharp=createRequire(import.meta.url)('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const origin='http://127.0.0.1:5224',endpoint='http://127.0.0.1:2624';
const folder=await mkdtemp(resolve('artifacts/hn-quest-motion-')),dbPath=resolve(folder,'profiles.sqlite');
const captures=resolve('artifacts/quest-motion');await mkdir(captures,{recursive:true});
const backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2624',GAME_DB_PATH:dbPath});
let vite,browser,page;const checks=[],errors=[];
try{
  const config=resolve(folder,'vite.mjs');await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(folder,'vite-cache'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5224'],origin,{VITE_SERVER_URL:endpoint});
  const fixtures=[];
  for(const avatar of HANG_NHAC_AVATARS)for(const stage of ['intro','cycle','training','recovery']){
    const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());const store=new ProfileStore(dbPath);
    try{const p=store.get(store.authenticate(guest.token),avatar),station=SECT_STATIONS[stage==='intro'?0:stage==='cycle'?1:stage==='training'?2:3];
      const point=[{x:station.x+56,y:station.y},{x:station.x-56,y:station.y},{x:station.x,y:station.y+56},{x:station.x,y:station.y-56}].find(point=>nearStation(point,station.id));
      assert.ok(point,'fixture stands beside the NPC, not on the NPC sprite');
      Object.assign(p,{...point,hp:50});p.sect.supplies=2;
      if(stage!=='intro')p.sect.hn01=true;
      if(stage==='training'){Object.assign(p,{milestone:'M01',cultivation:100});Object.assign(p.sect,{hn02:true,foundation:avatar==='CHR-SITU-NAN'?'spirit':'breathing',cycleStep:4,level:1});}
      store.save(p);fixtures.push({avatar,stage,token:guest.token});
    }finally{store.close();}
  }
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  for(const fixture of fixtures){
    const context=await browser.newContext({viewport:{width:1366,height:768}});await context.addInitScript(({token,avatar})=>{localStorage.setItem('hang-nhac.guest.v1',token);window.__motionAvatar=avatar;},fixture);
    page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()}: ${r.url()}`);});
    await page.goto(origin+'/hang-nhac.html?devGuest=1');await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);
    await page.evaluate(()=>{window.__observedQuestMotions=[];const sample=()=>{for(const pose of window.__hangNhacQuestMotion().rendered){window.__observedQuestMotions.push(pose);if(window.__observedQuestMotions.length>1000)window.__observedQuestMotions.shift();}requestAnimationFrame(sample);};requestAnimationFrame(sample);});
    await page.locator(`[data-avatar-choice="${fixture.avatar}"]`).click();await page.locator('#join').click();
    await page.waitForFunction(()=>window.__hangNhacR01().own?.connected&&!!window.__hangNhacSect().view);
    assert.equal((await page.evaluate(()=>window.__hangNhacQuestMotion())).loadedAtlases,21);
    await page.locator('#interact').click();await page.waitForFunction(()=>window.__hangNhacQuestMotion().events.some(e=>e.kind==='greeting'));
    if(fixture.stage==='intro'){
      await page.locator('[data-action=accept_intro]').click();await page.waitForFunction(()=>window.__hangNhacSect().view.hn01);
      await page.locator('#sect-close').click();
      await page.waitForFunction(()=>window.__observedQuestMotions.some(e=>e.kind==='greeting'));
      await page.screenshot({path:resolve(captures,`${fixture.avatar}-greeting.png`)});
    }else if(fixture.stage==='cycle'){
      await page.locator('[data-action=cycle_start]').click();await page.waitForFunction(()=>window.__hangNhacSect().view.cycleReadyAt>0);
      await page.locator('#sect-close').click();
      await page.waitForFunction(()=>window.__hangNhacQuestMotion().rendered.some(e=>e.kind==='cultivation'));
      const frames=new Set();for(let n=0;n<8;n++){const rendered=await page.evaluate(()=>window.__hangNhacQuestMotion().rendered);for(const s of rendered)if(s.kind==='cultivation')frames.add(s.index);await page.waitForTimeout(140);}
      assert.ok(frames.size>=3,`breathing advances for ${fixture.avatar}: ${[...frames]}`);
      assert.deepEqual((await page.evaluate(()=>window.__hangNhacQuestMotion().qi)).map(e=>e.clip).sort(),['formation','rising-qi']);
      const order=await page.evaluate(()=>{const d=window.__hangNhacDiagnostics(),own=d.actors.find(a=>a.own);return {body:d.sprites.find(s=>s.id===own.id).order,fx:window.__hangNhacQuestMotion().qi};});
      assert.ok(order.fx.find(e=>e.clip==='formation').order<order.body);
      assert.ok(Math.abs(order.fx.find(e=>e.clip==='rising-qi').order-order.body-.15)<.001,'qi flow follows its actor depth');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>window.__hangNhacQuestMotion().qi.length===1&&window.__hangNhacQuestMotion().qi[0].clip==='formation');
      assert.equal((await page.evaluate(()=>window.__hangNhacQuestMotion().qi))[0].index,0);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>window.__hangNhacQuestMotion().qi.length===2);
      await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}));
      await page.waitForFunction(()=>window.__hangNhacQuestMotion().qi.length===0);
      await page.evaluate(()=>delete document.hidden);
      await page.waitForFunction(()=>window.__hangNhacQuestMotion().qi.length===2);
      await page.screenshot({path:resolve(captures,`${fixture.avatar}-cultivation.png`)});
      await page.keyboard.down('ArrowRight');
      try{
        await page.waitForFunction(()=>window.__hangNhacR01().own.moving&&!window.__hangNhacQuestMotion().rendered.some(e=>e.kind==='cultivation'));
        assert.deepEqual(await page.evaluate(()=>window.__hangNhacQuestMotion().qi),[]);
      }finally{await page.keyboard.up('ArrowRight');}
    }else if(fixture.stage==='training'){
      await page.locator('[data-action=lesson_start]').click();await page.waitForFunction(()=>!!window.__hangNhacR01().selectedTarget);
      await page.locator('#stage').focus();await page.keyboard.press('f');
      await page.waitForFunction(()=>window.__observedQuestMotions.some(e=>e.kind==='basic'));
      await page.screenshot({path:resolve(captures,`${fixture.avatar}-basic.png`)});
      assert.equal((await page.evaluate(()=>window.__hangNhacR01().own)).mp,100);
      await page.waitForTimeout(450);assert.equal((await page.evaluate(()=>window.__hangNhacQuestMotion().rendered)).some(e=>e.kind==='basic'),false);
      await page.reload();await page.waitForFunction(()=>window.__hangNhacR01?.().own?.connected&&!!window.__hangNhacSect().view);
      assert.equal((await page.evaluate(()=>window.__hangNhacQuestMotion().events)).some(e=>e.kind==='basic'),false);
    }else{
      await page.locator('[data-action=use_recovery]').click();await page.waitForFunction(()=>window.__hangNhacR01().own.hp===80);
      await page.locator('#sect-close').click();await page.waitForFunction(()=>window.__observedQuestMotions.some(e=>e.kind==='recovery'));
      await page.screenshot({path:resolve(captures,`${fixture.avatar}-recovery.png`)});
    }
    await context.close();
  }
  checks.push('three_avatars_real_HN01_greeting_HN02_loop_HN03_F_zero_MP_recovery_and_no_basic_replay_after_reload');
  // Pure GPU fixture uses the actual quest adapter and native renderer, with no owner state.
  const gpu=await browser.newContext({viewport:{width:192,height:192}});page=await gpu.newPage();
  await page.goto(origin+'/hang-nhac.html?devGuest=1');await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);
  const gpuModule=resolve(folder,'gpu-fixture.ts');await writeFile(gpuModule,"import * as THREE from 'three';export {THREE};");
  await page.evaluate(async url=>{
    const {THREE}=await import(url);
    const {QuestMotionPresentation}=await import('/src/quest-motion-presentation.ts');
    const {atlasSprite,setSpriteFrame}=await import('/src/render/sprite-frame.ts');
    const {QuestQiPresentation}=await import('/src/quest-qi-presentation.ts');
    const scene=new THREE.Scene(),motion=new QuestMotionPresentation(scene),qi=new QuestQiPresentation(scene);await motion.load();await qi.load();
    const camera=new THREE.OrthographicCamera(0,96,96,0,.1,100);camera.position.z=10;
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});renderer.setSize(96,96);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    const sprite=atlasSprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));scene.add(sprite);
    window.__questGpu=(clip,index,fx=false)=>{const pose=fx?qi.frame(clip,index):motion.pose(clip,index);sprite.material.map=pose.texture.clone();sprite.material.needsUpdate=true;
      const size=pose.frameSize[0];renderer.setSize(size,size);camera.right=camera.top=size;camera.updateProjectionMatrix();
      setSpriteFrame(sprite,pose.rect,pose.atlasSize,pose.frameSize,pose.anchor);sprite.position.set(pose.anchor[0],size-pose.anchor[1],0);renderer.render(scene,camera);
      const result=renderer.domElement.toDataURL();sprite.material.map.dispose();return result;};
    window.__questGpuDispose=()=>{motion.dispose();qi.dispose();sprite.geometry.dispose();sprite.material.dispose();renderer.dispose();};
  },'/@fs/'+gpuModule.replaceAll('\\','/'));
  const catalog=JSON.parse(await readFile('docs/design/characters/quest-motion-v1/clips.json','utf8'));let compared=0;
  for(const [id,clip]of Object.entries(catalog.clips))for(let index=0;index<4;index++){
    const dataUrl=await page.evaluate(({id,index})=>window.__questGpu(id,index),{id,index});
    const actual=await sharp(Buffer.from(dataUrl.split(',')[1],'base64')).ensureAlpha().raw().toBuffer();
    const expected=await sharp(resolve('docs/design/characters/quest-motion-v1',clip.canonical[index])).ensureAlpha().raw().toBuffer();
    let bad=0;for(let p=0;p<96*96;p++){const a=actual[p*4+3],b=expected[p*4+3];if(Math.abs(a-b)>2)bad++;else if(b>128&&[0,1,2].some(c=>Math.abs(actual[p*4+c]-expected[p*4+c])>4))bad++;}
    assert.ok(bad<=4,`${id}/${index}: ${bad} mismatched GPU pixels`);compared++;
  }
  const fxCatalog=JSON.parse(await readFile('docs/design/vfx/quest-qi-v1/clips.json','utf8'));let fxCompared=0;
  for(const [id,clip]of Object.entries(fxCatalog.clips))for(let index=0;index<4;index++){
    const dataUrl=await page.evaluate(({id,index})=>window.__questGpu(id,index,true),{id,index});
    const actual=await sharp(Buffer.from(dataUrl.split(',')[1],'base64')).ensureAlpha().raw().toBuffer();
    const expected=await sharp(resolve('docs/design/vfx/quest-qi-v1',clip.canonical[index])).ensureAlpha().raw().toBuffer();
    let bad=0;for(let p=0;p<128*128;p++){const a=actual[p*4+3],b=expected[p*4+3];if(Math.abs(a-b)>2)bad++;else if(b>128&&[0,1,2].some(c=>Math.abs(actual[p*4+c]-expected[p*4+c])>4))bad++;}
    assert.ok(bad<=4,`FX ${id}/${index}: ${bad} mismatched GPU pixels`);fxCompared++;
  }
  await page.evaluate(()=>window.__questGpuDispose());await gpu.close();checks.push('84_native_frames_GPU_match_canonical_alpha_RGB_pivot_and_no_neighbour_fragments');
  checks.push('16_qi_FX_frames_GPU_match_and_live_cultivation_has_formation_flow_reduced_static_and_movement_cleanup');
  assert.deepEqual(errors,[]);const report={passed:true,checks,framesCompared:compared,fxFramesCompared:fxCompared,errors,fixtureDatabase:dbPath,ownerDatabaseUsed:false,ownerMapEdited:false,artApproved:false};
  await writeFile(resolve(captures,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){await page?.screenshot({path:resolve(captures,'failure.png')});console.error(JSON.stringify({checks,errors,motion:page?await page.evaluate(()=>({facts:window.__hangNhacQuestMotion?.(),own:window.__hangNhacR01?.().own,observed:window.__observedQuestMotions?.slice(-12),now:Date.now()})):undefined,backend:backend.output(),vite:vite?.output()},null,2));throw error;}
finally{await browser?.close();vite?.stop();backend.stop();}
