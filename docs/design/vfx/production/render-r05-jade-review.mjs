// Local asset renderer, not browser automation. Never modifies source PNGs.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {SequencePlayer,frameSeconds,sortLayers} from '../frame-by-frame-r01/sequence-system.mjs';
import * as r02 from './r02-model.mjs';
import * as r04 from './r04-sigil-model.mjs';
import * as r05old from './r05-force-model.mjs';
import * as r05 from './r05-jade-model.mjs';
import {drawIntentLighting} from './r05-lighting.mjs';
import * as p2 from './p2-model.mjs';
import {makePreviewPlan,projectileTip} from '../frame-by-frame-r01/preview-model.mjs';
const require=createRequire(import.meta.url),{createCanvas,loadImage}=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'));
const root=resolve('docs/design/vfx'),scene=await loadImage(join(root,'sect-courtyard-game-reference-v1.png')),target=await loadImage(join(root,'pvp-target-stand-west-native-v1.png'));
const configs=[];
for(const realm of['R05-V2','R05-V3'])for(const family of['sword','thunder','wind']){
 const folder=`r05-${family}-${realm==='R05-V2'?'v2':'v3'}`,base=join(root,folder),skill=JSON.parse(await readFile(join(base,'skill.json'),'utf8')),clips=JSON.parse(await readFile(join(base,'clips.json'),'utf8')).clips,textures=Object.fromEntries(await Promise.all(Object.entries(clips).map(async([id,c])=>[id,await loadImage(join(base,c.atlas))])));
 skill.family??=family;skill.name??='Kiếm Khí';
 const model=realm==='R05-V3'?r05:r05old,plan=model.makePlan(skill,clips),sample=age=>model.samplePresentation(skill,clips,plan,age);
 const frames=realm==='R05-V3'?family==='sword'?[9,11,13,plan.confirmFrame+2,plan.confirmFrame+7]:family==='thunder'?[7,11,16,18,24]:[7,10,13,16,22]:[];
 configs.push({realm,family,base,skill,clips,textures,plan,sample,frames});
}
function render(config,frame,zoom=2,w=960,h=640){
 const canvas=createCanvas(w,h),ctx=canvas.getContext('2d'),age=frameSeconds(frame,24),state=config.sample(age);
 ctx.fillStyle='#162b31';ctx.fillRect(0,0,w,h);ctx.setTransform(zoom,0,0,zoom,w/2-480*zoom,h/2-320*zoom);ctx.drawImage(scene,0,0,960,640);ctx.fillStyle='#07131b66';ctx.fillRect(0,0,960,640);
 function sprite(id,sample,point,angle=0,scale=1){const c=sample.clip,r=sample.frame.rect;ctx.save();ctx.globalAlpha*=c.opacities?.[sample.index]??1;ctx.translate(...point);ctx.rotate(angle);ctx.scale(scale,scale);ctx.imageSmoothingEnabled=c.sampling!=='nearest';ctx.drawImage(config.textures[id],r.x,r.y,r.w,r.h,-c.anchor[0],-c.anchor[1],r.w,r.h);ctx.restore();}
 const items=[];if(config.family!=='wind')items.push({layer:1,sortY:386,order:0,draw:()=>{ctx.imageSmoothingEnabled=false;ctx.drawImage(target,config.plan.targetFoot[0]-32,298,64,96);}});
 items.push({layer:1,sortY:386,order:1,draw:()=>sprite(config.skill.character.clip,state.character,state.foot)});state.items.forEach((fx,i)=>items.push({layer:fx.layer,sortY:fx.point[1],order:i+2,draw:()=>{ctx.save();ctx.globalAlpha*=fx.opacity??1;if(fx.kind==='localContrast')drawIntentLighting(ctx,fx);else sprite(fx.id,fx.sample,fx.point,fx.angle||0,fx.scale??1);ctx.restore();}}));for(const item of sortLayers(items))item.draw();
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#13292be0';ctx.fillRect(18,18,Math.min(w-36,430),68);ctx.fillStyle='#efdfb8';ctx.font='23px serif';ctx.fillText(`${config.realm} · ${config.skill.name} · F${frame} · ${zoom}×`,32,47);ctx.font='12px sans-serif';ctx.fillText('Ảnh kiểm asset cục bộ · cùng camera / cỡ người',32,69);return{canvas,state};
}
const report=[];
for(const config of configs.filter(c=>c.realm==='R05-V3'))for(const zoom of[1,2])for(const frame of config.frames){const{canvas,state}=render(config,frame,zoom),file=join(config.base,'review',`F${frame}-${zoom}x.png`);await writeFile(file,canvas.toBuffer('image/png'));report.push({realm:config.realm,family:config.family,frame,zoom,file,active:state.items.map(f=>({clip:f.id,frame:f.sample?.index===undefined?null:f.sample.index+1,point:f.point}))});}
for(const family of['sword','thunder','wind']){const pair=configs.filter(c=>c.family===family),canvas=createCanvas(960,1280),ctx=canvas.getContext('2d');for(let i=0;i<2;i++){const c=pair[i],frame=({'R05-V2':{sword:13,thunder:18,wind:11},'R05-V3':{sword:13,thunder:18,wind:13}})[c.realm][family],image=render(c,frame,2).canvas;ctx.drawImage(image,0,i*640);}await writeFile(join(root,'review-r05-jade-'+family+'.png'),canvas.toBuffer('image/png'));}
await writeFile(join(root,'production/r05-jade-review-report.json'),JSON.stringify({method:'local_atlas_sprite_render',browserInteractionVerified:false,captures:report},null,2));console.log('Rendered',report.length,'V3 captures and 3 V2/V3 visual comparisons.');
