import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { ProfileStore } from '../../server/src/profile-store';
import { HANG_NHAC, HANG_NHAC_AVATARS } from '../../shared/hang-nhac';
import { R01_IDS, type AvatarId } from '../../shared/profiles';
import type { Direction } from '@shared/world/types';
// @ts-expect-error Shared process helper is JavaScript.
import { startService, waitFor } from '../support/services.mjs';

const origin='http://127.0.0.1:5195',endpoint='http://127.0.0.1:2595';
await mkdir('artifacts',{recursive:true});
const folder=await mkdtemp(resolve('artifacts/hn-animation-')),dbPath=resolve(folder,'profiles.sqlite');
const backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2595',GAME_DB_PATH:dbPath});
let vite:Awaited<ReturnType<typeof startService>>|undefined,browser:Browser|undefined,page:Page|undefined;
const errors:string[]=[],checks:unknown[]=[],screenshots:string[]=[];
const state=(p:Page)=>p.evaluate('window.__hangNhacR01()') as Promise<any>;
const diagnostics=(p:Page)=>p.evaluate('window.__hangNhacDiagnostics()') as Promise<any>;
const vectors:Record<Direction,[number,number]>={south:[0,1],west:[-1,0],east:[1,0],north:[0,-1]};
const short:Record<AvatarId,string>={'CHR-WANG-LIN-CHIBI':'wang','CHR-SITU-NAN':'situ','CHR-LI-MUWAN':'li'};
try {
  vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5195'],origin,{VITE_SERVER_URL:endpoint});
  const guest=await (await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json() as {token:string};
  const seed=(avatarId:AvatarId)=>{
    const store=new ProfileStore(dbPath);
    try {
      const profile=store.get(store.authenticate(guest.token)!,avatarId);
      Object.assign(profile,{...HANG_NHAC.world.spawn,mp:100,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0});
      store.save(profile);
    } finally {store.close();}
  };
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:980},deviceScaleFactor:1});
  await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),guest.token);
  // tsx preserves names for nested callbacks; those functions run in the fixture browser.
  await context.addInitScript('window.__name = (fn) => fn;');
  page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(`${origin}/hang-nhac.html`);
  await page.waitForFunction('window.__hangNhacDiagnostics?.().ready');
  assert.equal((await state(page)).vfx.loadedAtlases,22,'initial load includes FX and only the selected avatar');
  for(const avatar of HANG_NHAC_AVATARS) for(const direction of ['south','west','east','north'] as Direction[]) {
    seed(avatar);
    await page.locator('#avatar').selectOption(avatar);
    await page.locator('#join').click();
    await page.waitForFunction('window.__hangNhacDiagnostics().status === "connected"');
    await waitFor(async()=>!!(await state(page!)).own?.profileId,'profile ready');
    await page.waitForTimeout(300);
    const d=await diagnostics(page),actor=d.actors.find((a:any)=>a.own),box=(await page.locator('#stage').boundingBox())!;
    const [dx,dy]=vectors[direction];
    await page.mouse.click(box.x+box.width/2+actor.x-d.cameraCenter.x+dx*120,
      box.y+box.height/2+actor.y-d.cameraCenter.y+dy*120);
    await page.locator('#training').click();
    await waitFor(async()=>!!(await state(page!)).selectedTarget,'selected target');
    const before=await state(page);
    for(const [index,skill] of R01_IDS.entries()) {
      if(skill==='wind')await page.evaluate(()=>{
        const monitor={samples:[] as any[],pictures:[] as any[],done:false,seen:new Set<string>()};(window as any).__windCropFixture=monitor;
        const deadline=performance.now()+1600,canvas=document.createElement('canvas');canvas.width=160;canvas.height=108;const ctx=canvas.getContext('2d')!;
        const sample=()=>{
          const d=(window as any).__hangNhacDiagnostics(),v=(window as any).__hangNhacSkills(),own=d.actors.find((a:any)=>a.own),s=d.sprites.find((s:any)=>s.id===own?.id);
          const ghosts=v.renderedEffects.filter((e:any)=>e.id.includes(':ghost:'));
          if(s?.animationSource==='skill'){
            monitor.samples.push({body:{clip:s.clip,index:s.frameIndex,crop:s.crop,cutouts:s.cutouts},ghosts});
            const key=s.clip+':'+s.frameIndex;
            if(!monitor.seen.has(key)){
              monitor.seen.add(key);const stage=document.querySelector('#stage') as HTMLElement,source=stage.querySelector('canvas')!;
              const footX=Math.round(stage.clientWidth/2+own.x-d.cameraCenter.x),footY=Math.round(stage.clientHeight/2+own.y-d.cameraCenter.y);
              ctx.clearRect(0,0,160,108);ctx.drawImage(source,footX-80,footY-94,160,108,0,0,160,108);
              monitor.pictures.push({index:s.frameIndex,dataUrl:canvas.toDataURL()});
            }
          }
          if(performance.now()<deadline)requestAnimationFrame(sample);else monitor.done=true;
        };requestAnimationFrame(sample);
      });
      await page.locator('#stage').focus();
      await page.keyboard.press(String(index+1));
      const expected=avatar==='CHR-WANG-LIN-CHIBI'&&direction==='east'?
        {sword:'wanglin-cast-east',thunder:'wanglin-thunder-east',wind:'wanglin-wind-east'}[skill]:
        `${short[avatar]}-${skill}-${direction}`;
      await page.waitForFunction(expected=>{
        const d=(window as any).__hangNhacDiagnostics(),own=d.actors.find((a:any)=>a.own);
        return d.sprites.some((s:any)=>s.id===own?.id&&s.animationSource==='skill'&&s.clip===expected);
      },expected,{timeout:4000});
      const active=await diagnostics(page),sprite=active.sprites.find((s:any)=>s.id===active.actors.find((a:any)=>a.own)?.id);
      assert.equal(sprite.anchor[1],88);assert.equal(sprite.scale[1],96);
      const first=sprite.frameIndex;
      await page.waitForFunction(first=>{
        const d=(window as any).__hangNhacDiagnostics(),own=d.actors.find((a:any)=>a.own),s=d.sprites.find((s:any)=>s.id===own?.id);
        return s?.animationSource==='skill'&&s.frameIndex>first;
      },first,{timeout:1500});
      // Read GPU pixels and diagnostic pose inside one render callback. A browser screenshot can
      // finish after a short cast has ended, especially when another WebGL test is running.
      const capture:{placement:any;dataUrl:string}=await page.evaluate(()=>new Promise<{placement:any;dataUrl:string}>(resolve=>requestAnimationFrame(()=>{
        const placement=(window as any).__hangNhacDiagnostics(),canvas=document.querySelector('#stage canvas') as HTMLCanvasElement;
        resolve({placement,dataUrl:canvas.toDataURL('image/png')});
      })));
      const placement:any=capture.placement;
      assert.ok(placement.sprites.some((s:any)=>s.clip===expected&&s.animationSource==='skill'),'capture still belongs to the active cast');
      const shot:Buffer|undefined=skill==='sword'||direction==='east'?Buffer.from(capture.dataUrl.split(',')[1],'base64'):undefined;
      if(direction==='east') {
        const name=`hang-nhac-cast-${short[avatar]}-${skill}.png`;
        await writeFile(`artifacts/${name}`,shot!);screenshots.push(name);
      }
      let visualMatch:number|undefined;
      if(skill==='sword'){
        // Read rendered pixels as well as metadata: changing atlas dimensions once broke GPU UV sampling.
        visualMatch=await page.evaluate(async({dataUrl,placement,expected})=>{
          const catalog=await fetch('/assets/r01/clips.json').then(r=>r.json()),clip=catalog.clips[expected];
          const screen=new Image(),atlas=new Image();screen.src=dataUrl;atlas.src=clip.atlasUrl;
          await Promise.all([screen.decode(),atlas.decode()]);
          const canvas=document.createElement('canvas');canvas.width=screen.width;canvas.height=screen.height;
          const ctx=canvas.getContext('2d')!;ctx.drawImage(screen,0,0);
          const stage=document.querySelector('#stage') as HTMLElement,box=stage.getBoundingClientRect();
          const own=placement.actors.find((a:any)=>a.own);
          const footX=Math.round(stage.clientWidth/2+own.x-placement.cameraCenter.x);
          const footY=Math.round(stage.clientHeight/2+own.y-placement.cameraCenter.y);
          const capture=ctx.getImageData(footX-clip.anchor[0]-2,footY-clip.anchor[1]-2,clip.frameSize[0]+4,clip.frameSize[1]+4);
          canvas.width=clip.frameSize[0];canvas.height=clip.frameSize[1];ctx.imageSmoothingEnabled=false;
          let best=0;
          for(const r of clip.frames){
            ctx.clearRect(0,0,clip.frameSize[0],clip.frameSize[1]);ctx.drawImage(atlas,r.x,r.y,r.w,r.h,0,0,r.w,r.h);
            const pixels=ctx.getImageData(0,0,clip.frameSize[0],clip.frameSize[1]).data;
          // Permit subpixel rasterization at the body edges, while checking the canonical interior.
            for(let oy=0;oy<=4;oy++)for(let ox=0;ox<=4;ox++){
              let matched=0,total=0;
              for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>=250){
                const pixel=i/4,actual=((Math.floor(pixel/clip.frameSize[0])+oy)*capture.width+pixel%clip.frameSize[0]+ox)*4;
                total++;if([0,1,2].every(c=>Math.abs(pixels[i+c]-capture.data[actual+c])<=4))matched++;
              }
              best=Math.max(best,matched/total);
            }
          }
          return best;
        },{dataUrl:'data:image/png;base64,'+shot!.toString('base64'),placement,expected});
        assert.ok(visualMatch>.6,`GPU shows a single canonical body: ${expected}, match ${visualMatch}`);
      }
      await page.waitForFunction('!window.__hangNhacR01().own.castId');
      let windCropSamples:number|undefined,windGhostSamples:number|undefined;
      if(skill==='wind'){
        await page.waitForFunction('(window.__windCropFixture?.done)');
        const monitored:{samples:any[];pictures:Array<{index:number;dataUrl:string}>}=await page.evaluate(()=>{
          const m=(window as any).__windCropFixture;return {samples:m.samples,pictures:m.pictures};
        });
        assert.ok(monitored.samples.length>0,'observed active Phong poses');
        const c:any=await page.evaluate(()=>fetch('/assets/r01/clips.json').then(r=>r.json()));
        const cropFor=(clip:string,index:number):{x:number;y:number;w:number;h:number}=>c.clips[clip].frameCrops?.[index]??{x:0,y:0,w:c.clips[clip].frameSize[0],h:c.clips[clip].frameSize[1]};
        for(const sample of monitored.samples){
          assert.equal(sample.body.clip,expected);assert.deepEqual(sample.body.crop,cropFor(expected,sample.body.index));assert.deepEqual(sample.body.cutouts,c.clips[expected].frameCutouts?.[sample.body.index]??[]);
          for(const ghost of sample.ghosts){assert.equal(ghost.clip,expected);assert.deepEqual(ghost.crop,c.clips[expected].frameCrops?.[ghost.index]);assert.deepEqual(ghost.cutouts,c.clips[expected].frameCutouts?.[ghost.index]);}
        }
        windCropSamples=monitored.samples.length;windGhostSamples=monitored.samples.filter((s:any)=>s.ghosts.length>0).length;
        assert.ok(windGhostSamples!>0,'observed historical Phong body frames during the actual dash');
        const strip=await page.evaluate(async(pictures)=>{
          const canvas=document.createElement('canvas');canvas.width=pictures.length*160;canvas.height=128;const ctx=canvas.getContext('2d')!;
          ctx.fillStyle='#efe6d3';ctx.fillRect(0,0,canvas.width,128);
          for(const [i,p] of pictures.entries()){const image=new Image();image.src=p.dataUrl;await image.decode();ctx.drawImage(image,i*160,20);ctx.fillStyle='#243d32';ctx.fillText('Frame '+(p.index+1),i*160+8,14);}
          return canvas.toDataURL();
        },monitored.pictures);
        const name=`hang-nhac-wind-crop-${short[avatar]}-${direction}.png`;await writeFile(`artifacts/${name}`,Buffer.from(strip.split(',')[1],'base64'));screenshots.push(name);
      }
      await page.waitForFunction(()=>{
        const d=(window as any).__hangNhacDiagnostics(),own=d.actors.find((a:any)=>a.own);
        return d.sprites.some((s:any)=>s.id===own?.id&&s.animationSource==='locomotion');
      });
      const completed=await diagnostics(page),body=completed.sprites.find((s:any)=>s.id===completed.actors.find((a:any)=>a.own)?.id);
      assert.deepEqual(body.scale.slice(0,2),[64,96]);assert.deepEqual(body.anchor,[32,88]);
      const current=await state(page);
      assert.equal(current.own.casts,before.own.casts+index+1);
      assert.ok(Math.abs(current.own.mp-[90,65,55][index])<.1);
      if(skill!=='wind')assert.equal(current.own.practiceHits,before.own.practiceHits+index+1);
      assert.deepEqual(current.vfx.assetFailures,{});assert.deepEqual(current.vfx.missingBindings,[]);
      checks.push({avatar,direction,skill,clip:expected,frameAdvanced:true,restoredNativeBody:true,visualMatch,windCropSamples,windGhostSamples});
    }
    const after=await state(page);
    const travelX=after.own.x-before.own.x,travelY=after.own.y-before.own.y;
    assert.ok(Math.abs(Math.hypot(travelX,travelY)-160)<.5);
    assert.ok(travelX*dx+travelY*dy>159,'dash follows the selected cardinal aim');
    await page.locator('#leave').click();
    await page.waitForFunction('window.__hangNhacDiagnostics().status === "idle"');
    await page.locator('#join:enabled').waitFor({state:'visible'});
  }
  assert.equal(checks.length,36);assert.deepEqual(errors,[]);
  const report={passed:true,date:new Date().toISOString(),checks,errors,screenshots,realOwnerStorageWritten:false,
    bindings:36,fixtureDatabase:dbPath,nativeFrame:[64,96],nativeAnchor:[32,88],castingAnchorY:88};
  await writeFile('artifacts/hang-nhac-skill-animation-verification.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:true,clips:checks.length,screenshots,errors},null,2));
} catch(error) {
  console.error(JSON.stringify({errors,diagnostics:page?await diagnostics(page):undefined,state:page?await state(page):undefined},null,2));
  await page?.screenshot({path:'artifacts/hang-nhac-skill-animation-failure.png'});throw error;
} finally {await browser?.close();vite?.stop();backend.stop();}
