import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {startService} from './support/services.mjs';

const origin='http://127.0.0.1:5200';
const vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5200'],origin);
let browser;
try {
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,
    args:process.env.SKILL_GPU_NATIVE==='1'?[]:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const page=await browser.newPage({viewport:{width:640,height:480},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // No game bootstrap, backend, owner profile or browser storage.
  await page.goto(origin+'/assets/r01/clips.json');
  const result=await page.evaluate(async()=>{
    const {PreviewRenderer}=await import('/src/renderer.ts');
    const {AnimationPlayer}=await import('/src/atlas.ts');
    const {SkillPresentation}=await import('/src/skills/three-presentation.ts');
    const catalog=await fetch('/assets/catalog.json').then(r=>r.json());
    const avatars=['CHR-WANG-LIN-CHIBI','CHR-SITU-NAN','CHR-LI-MUWAN'];
    document.body.replaceChildren();document.body.style.margin='0';
    const stage=document.createElement('div'),labels=document.createElement('div');stage.style.cssText='width:576px;height:256px';document.body.append(stage,labels);
    const renderer=new PreviewRenderer(stage,labels);renderer.zoom=1;renderer.debug=false;renderer.cameraCenter={x:500,y:500};
    await renderer.loadActors(catalog.actors.filter(a=>avatars.includes(a.id)));
    const view=new SkillPresentation(renderer.scene);await view.load();for(const avatar of avatars)await view.prepareAvatar(avatar);
    const clips=view.assets.catalog.clips,gl=renderer.webgl.getContext(),width=576,height=256;
    const pixels=new Uint8Array(width*height*4),gpu=document.createElement('canvas');gpu.width=width;gpu.height=height;
    const context=gpu.getContext('2d'),reference=document.createElement('canvas');reference.width=width;reference.height=height;
    const ctx=reference.getContext('2d'),proof=document.createElement('canvas');proof.width=1152;proof.height=256*3;
    const p=proof.getContext('2d'),checks=[],failures=[],proofRows=new Set();
    const review=document.createElement('canvas');review.width=864;review.height=324*3;const reviewCtx=review.getContext('2d');
    const reviewCases=['wang-wind-south:4','situ-sword-east:6','li-thunder-south:3'];
    const capture=()=>{
      gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      const flipped=new Uint8ClampedArray(pixels.length);
      for(let y=0;y<height;y++)flipped.set(pixels.subarray((height-y-1)*width*4,(height-y)*width*4),y*width*4);
      context.putImageData(new ImageData(flipped,width,height),0,0);return flipped;
    };
    renderer.render([]);const background=capture().slice();
    const compare=(clip,index,mode,footX=288,footY=128,override,sourceImage)=>{
      const c=override??clips[clip],r=c.frames[index],crop=c.frameCrops?.[index]??{x:0,y:0,w:r.w,h:r.h},image=sourceImage??view.assets.textures.get(clip).image;
      ctx.clearRect(0,0,width,height);ctx.imageSmoothingEnabled=false;
      ctx.drawImage(image,r.x+crop.x,r.y+crop.y,crop.w,crop.h,footX-c.anchor[0]+crop.x,footY-c.anchor[1]+crop.y,crop.w,crop.h);
      for(const cut of c.frameCutouts?.[index]??[])ctx.clearRect(footX-c.anchor[0]+cut.x,footY-c.anchor[1]+cut.y,cut.w,cut.h);
      const expected=ctx.getImageData(0,0,width,height).data,actual=capture();
      let opaque=0,matched=0,extra=0;
      for(let y=footY-c.anchor[1]-4;y<footY-c.anchor[1]+c.frameSize[1]+4;y++)
        for(let x=footX-c.anchor[0]-4;x<footX-c.anchor[0]+c.frameSize[0]+4;x++){
          const i=(y*width+x)*4;
          if(expected[i+3]>=250){opaque++;if([0,1,2].every(n=>Math.abs(expected[i+n]-actual[i+n])<=5))matched++;}
          if(expected[i+3]===0&&[0,1,2].some(n=>Math.abs(background[i+n]-actual[i+n])>5))extra++;
        }
      const check={clip,index,mode,opaque,colorMatch:matched/opaque,extraPixels:extra};checks.push(check);
      if(mode==='uncropped-control'){if(extra===0)throw Error('Regression probe failed to detect neighbouring-frame pixels');}
      else if(check.colorMatch<.98||extra>0){failures.push(check);if(proofRows.size<3){
        const row=proofRows.size;p.drawImage(gpu,0,row*256);ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#efe6d3';ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='source-over';
        p.drawImage(reference,576,row*256);proofRows.add(clip+':'+index+':'+mode);
      }}
      const row=reviewCases.indexOf(clip+':'+index);
      if(mode==='body'&&row>=0){
        reviewCtx.fillStyle='#efe6d3';reviewCtx.fillRect(0,row*324,864,324);reviewCtx.fillStyle='#243d32';reviewCtx.font='14px sans-serif';
        reviewCtx.fillText(`${clip} F${index+1} · source includes neighbouring parts / game crop`,12,row*324+20);
        reviewCtx.imageSmoothingEnabled=false;
        reviewCtx.drawImage(image,r.x,r.y,r.w,r.h,(432-r.w*3)/2,row*324+30,r.w*3,r.h*3);
        reviewCtx.drawImage(gpu,footX-c.anchor[0],footY-c.anchor[1],r.w,r.h,432+(432-r.w*3)/2,row*324+30,r.w*3,r.h*3);
      }
    };
    for(const avatar of avatars)for(const binding of Object.values(view.assets.catalog.skills))for(const clip of Object.values(binding.bindings[avatar])){
      const actor={id:'a',name:'fixture',assetId:avatar,own:true,connected:true,x:500,y:500,direction:'south',state:'stand',animation:new AnimationPlayer(renderer.assets.get(avatar).atlas)};
      for(let index=0;index<clips[clip].frames.length;index++){
        if(index===0){actor.pose=undefined;renderer.render([actor]);}
        if(reviewCases.includes(clip+':'+index)){
          actor.pose={...view.assets.pose(clip,index),crop:undefined,cutouts:undefined};renderer.render([actor]);compare(clip,index,'uncropped-control');
        }
        actor.pose=view.assets.pose(clip,index);renderer.render([actor]);compare(clip,index,'body');
        // Same atlas source, independent UVs for current body and historical Phong poses.
        if(clip.includes('wind')){
          const ghostIndex=(index+clips[clip].frames.length-2)%clips[clip].frames.length;
          view.draw({id:'ghost',clip,index:ghostIndex,x:680,y:500,rotation:0,opacity:1,layer:'ground'});
          renderer.render([actor]);compare(clip,index,'body-with-ghost');compare(clip,ghostIndex,'ghost',468,128);
          const ghost=view.sprites.get('ghost');view.release(ghost);view.sprites.delete('ghost');
        }
      }
      renderer.render([]);
    }
    // Reuse an effect ID with a new clip/atlas, then reuse pooled trimmed sprites.
    for(const clip of ['wang-wind-south','li-wind-east','wanglin-wind-east','situ-wind-south','wang-wind-south']){
      view.draw({id:'pooled-ghost',clip,index:4,x:500,y:500,rotation:0,opacity:1,layer:'ground'});
      renderer.render([]);compare(clip,4,'clip-transition');
    }
    view.update(undefined,0,[]);
    for(const avatar of avatars){
      const asset=renderer.assets.get(avatar),animation=new AnimationPlayer(asset.atlas);
      const actor={id:'a',name:'fixture',assetId:avatar,own:true,x:500,y:500,direction:'south',state:'stand',animation};
      actor.pose=view.assets.pose('wang-wind-south',4);renderer.render([actor]);actor.pose=undefined;
      for(const [id,r] of Object.entries(asset.atlas.frames)){
        const entry=Object.entries(asset.atlas.animations).find(([,ids])=>ids.includes(id));
        const [state,facing]=entry[0].split('_');animation.set(state,facing);animation.frameIndex=entry[1].indexOf(id);
        renderer.render([actor]);compare(avatar,0,'locomotion',288,128,{...asset.atlas,frames:[r]},asset.texture.image);
      }
      renderer.render([]);
    }
    const proofUrl=proof.toDataURL(),reviewUrl=review.toDataURL(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpuName=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null;view.dispose();renderer.dispose();
    return {checks,failures,proofUrl,reviewUrl,gpuName};
  });
  await mkdir('artifacts',{recursive:true});
  const reportName=process.env.SKILL_GPU_NATIVE==='1'?'skill-body-gpu-parity-native.json':'skill-body-gpu-parity.json';
  await writeFile('artifacts/'+reportName,JSON.stringify({passed:!result.failures.length,date:new Date().toISOString(),gpu:result.gpuName,checks:result.checks,failures:result.failures,errors,realOwnerStorageWritten:false},null,2)+'\n');
  if(result.failures.length)await writeFile('artifacts/skill-body-gpu-failures.png',Buffer.from(result.proofUrl.split(',')[1],'base64'));
  await writeFile('artifacts/skill-body-crop-review.png',Buffer.from(result.reviewUrl.split(',')[1],'base64'));
  console.log(JSON.stringify({gpu:result.gpuName,frames:result.checks.filter(c=>c.mode==='body').length,checks:result.checks.length,failures:result.failures.slice(0,12),errors},null,2));
  assert.deepEqual(errors,[]);assert.equal(result.checks.filter(c=>c.mode==='body').length,300);
  assert.deepEqual(result.failures,[],'body/ghost GPU pixels must match the exact frame, including its transparent area');
} finally {await browser?.close();vite.stop();}
