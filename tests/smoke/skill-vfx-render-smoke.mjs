import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';

const origin='http://127.0.0.1:5197';
const vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5197'],origin);
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // A JSON document supplies the Vite origin, without loading a game or touching any profile.
 await page.goto(origin+'/assets/r01/clips.json');
 const checks=await page.evaluate(async(threeUrl)=>{
  const THREE=await import(threeUrl);
  const {SkillPresentation}=await import('/src/skills/three-presentation.ts');
  const catalog=await fetch('/assets/r01/clips.json').then(r=>r.json());
  const images=new Map();for(const [id,c] of Object.entries(catalog.clips)){
   if(!Object.values(catalog.skills).some(s=>s.tracks.some(t=>t.clip===id)||s.projectileClip===id))continue;
   const image=new Image();image.src=c.atlasUrl;await image.decode();images.set(id,image);
  }
  document.body.replaceChildren();document.body.style.cssText='margin:0;background:#16282e;color:#eadfc4;font:14px sans-serif';
  const title=document.createElement('h2');title.textContent='VFX gốc → renderer game · cùng frame, pivot, alpha';document.body.append(title);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-320,320,240,-240,.1,10);camera.position.set(500,-500,1);
  const renderer=new THREE.WebGLRenderer({alpha:true,preserveDrawingBuffer:true});renderer.setSize(640,480);renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const reference=document.createElement('canvas');reference.width=640;reference.height=480;const ctx=reference.getContext('2d');
  const gpu=document.createElement('canvas');gpu.width=640;gpu.height=480;const g=gpu.getContext('2d');
  const report=[],proof=document.createElement('div');proof.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px';document.body.append(proof);
  const cases=[
   ['sword','sword-charge',83],['sword','sword-projectile',340],['sword','qi-impact',840,'hit',800],
   ['thunder','thunder-seal',83],['thunder','thunder-ring',1000],['thunder','thunder-bolt',840,'hit',800],
   ['thunder','thunder-impact',970,'hit',800],['wind','wind-depart',83],['wind','wind-trail',340],['wind','wind-arrival',700,'arrival',600]
  ];
  for(const [skill,clip,age,type,confirmed] of cases){
   const view=new SkillPresentation(scene);await view.load();
   const actor={id:'a',avatarId:'CHR-WANG-LIN-CHIBI',direction:'east',connected:true,x:500,y:500};
   const state={players:new Map([['a',actor]]),targets:new Map(),projectiles:new Map()};
   const fact=(type,age,x=500)=>({type,at:1000+age,skillId:skill,castId:skill,actorId:'a',x,y:500,dx:1,dy:0,targetX:660,targetY:500});
   view.event(fact('cast',0));view.update(state,1000,[]);
   if(type)view.event(fact(type,confirmed,type==='arrival'?660:680));
   if(clip==='sword-projectile')state.projectiles.set('p',{id:'p',ownerId:'a',castId:'sword',x:590,y:500,dx:1,dy:0,startedAt:1250});
   if(skill==='wind'&&age>166)actor.x=600;
   view.update(state,1000+age,[]);
   const data=view.diagnostics();
   // Isolate one runtime sprite so overlapping glows cannot disguise UV/frame errors.
   scene.children.forEach(s=>{if(s.userData.skillEffect)s.visible=s.userData.skillEffect.clip===clip;});
   const descriptor=data.frames.find(s=>s.clip===clip);if(!descriptor)throw Error('Missing runtime FX '+clip);
   renderer.render(scene,camera);
   const rendered=new Image();rendered.src=renderer.domElement.toDataURL();await rendered.decode();g.clearRect(0,0,640,480);g.drawImage(rendered,0,0);
   ctx.clearRect(0,0,640,480);ctx.imageSmoothingEnabled=true;
   const c=catalog.clips[clip],r=c.frames[descriptor.index],x=descriptor.x-180,y=descriptor.y-260;
   ctx.save();ctx.translate(x,y);ctx.rotate(-descriptor.rotation);ctx.drawImage(images.get(clip),r.x,r.y,r.w,r.h,-c.anchor[0],-c.anchor[1],r.w,r.h);ctx.restore();
   const expected=ctx.getImageData(0,0,640,480).data,actual=g.getImageData(0,0,640,480).data;
   let total=0,matched=0,opaque=0,colors=0;
   for(let i=0;i<expected.length;i+=4){
    if(expected[i+3]>=32){total++;if(Math.abs(expected[i+3]-actual[i+3])<=4)matched++;}
    if(expected[i+3]>=250){opaque++;if([0,1,2].every(n=>Math.abs(expected[i+n]-actual[i+n])<=5))colors++;}
   }
   report.push({clip,frame:descriptor.index+1,alphaMatch:matched/total,opaquePixels:opaque,colorMatch:opaque?colors/opaque:null,rect:r,point:[descriptor.x,descriptor.y]});
   if(['sword-projectile','thunder-impact','wind-trail'].includes(clip)){
    const tile=document.createElement('div'),label=document.createElement('div');label.textContent=`${clip} · frame ${descriptor.index+1} · game / nguồn`;
    const pair=document.createElement('canvas');pair.width=384;pair.height=200;const p=pair.getContext('2d');p.imageSmoothingEnabled=false;
    const w=c.frameSize[0]+16,h=c.frameSize[1]+16,left=x-c.anchor[0]-8,top=y-c.anchor[1]-8;
    p.drawImage(gpu,left,top,w,h,(192-w)/2,20,w,h);p.drawImage(reference,left,top,w,h,192+(192-w)/2,20,w,h);
    tile.append(label,pair);proof.append(tile);
   }
   view.dispose();
  }
  renderer.dispose();return report;
 },'/@fs/'+process.cwd().replaceAll('\\','/')+'/node_modules/three/build/three.module.js');
 assert.equal(checks.length,10);assert.deepEqual(errors,[]);
 for(const c of checks){assert.ok(c.alphaMatch>.95,`${c.clip} alpha/frame ${c.alphaMatch}`);if(c.opaquePixels>10)assert.ok(c.colorMatch>.9,`${c.clip} RGB ${c.colorMatch}`);}
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/skill-vfx-gpu-parity.png',clip:{x:0,y:0,width:1280,height:300}});
 await writeFile('artifacts/skill-vfx-gpu-parity.json',JSON.stringify({passed:true,date:new Date().toISOString(),checks,errors,realOwnerStorageWritten:false},null,2)+'\n');
 console.log(JSON.stringify({passed:true,checks},null,2));
}finally{await browser?.close();vite.stop();}
