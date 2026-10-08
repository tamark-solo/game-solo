// Local asset renderer, not browser automation. Never modifies source PNGs.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {SequencePlayer,frameSeconds,sortLayers} from '../frame-by-frame-r01/sequence-system.mjs';
import * as r02 from './r02-model.mjs';
import * as r04 from './r04-sigil-model.mjs';
import * as p2 from './p2-model.mjs';
import {makePreviewPlan,projectileTip} from '../frame-by-frame-r01/preview-model.mjs';
const require=createRequire(import.meta.url),{createCanvas,loadImage}=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'));
const root=resolve('docs/design/vfx'),scene=await loadImage(join(root,'sect-courtyard-game-reference-v1.png')),target=await loadImage(join(root,'pvp-target-stand-west-native-v1.png'));
const configs=[];
for(const realm of['R03','R04'])for(const family of['sword','thunder','wind']){
 const folder=realm==='R01'&&family==='sword'?'frame-by-frame-r01':`${realm.toLowerCase()}-${family}-${realm==='R04'?'v2':'v1'}`,base=join(root,folder),skill=JSON.parse(await readFile(join(base,'skill.json'),'utf8')),clips=JSON.parse(await readFile(join(base,'clips.json'),'utf8')).clips,textures=Object.fromEntries(await Promise.all(Object.entries(clips).map(async([id,c])=>[id,await loadImage(join(base,c.atlas))])));
 skill.family??=family;skill.name??='Kiếm Khí';
 let plan,sample;
 if(realm==='R03'||realm==='R04'){const model=realm==='R04'?r04:r02;plan=model.makePlan(skill,clips);sample=age=>model.samplePresentation(skill,clips,plan,age);}
 else if(family!=='sword'){plan=p2.makePlan(skill);sample=age=>p2.samplePresentation(skill,clips,plan,age);}
 else{plan=makePreviewPlan(skill,clips,{target:'pvp',hit:true,distance:260,delay:0});const players=Object.fromEntries(Object.entries(clips).map(([id,c])=>[id,new SequencePlayer(c)]));sample=age=>{const clip=clips[skill.character.clip],character=players[skill.character.clip].sample(age)||{index:11,frame:clip.frames[11],clip},hand=plan.foot.map((v,i)=>v+skill.sockets[character.index][i]),items=[];
  const add=(id,t,point,angle=0)=>{const s=players[id].sample(t);if(s)items.push({id,sample:s,point,angle,layer:2});};if(age<plan.launch)add('sword-charge',age,hand);if(age>=plan.launch&&age<plan.contactTime)add('sword-projectile',age-plan.launch,projectileTip(plan,age),plan.angle);if(age>=plan.impactTime)add('qi-impact',age-plan.impactTime,plan.hitPoint,plan.angle);return{foot:plan.foot,hand,character,items};};}
 const frames=realm==='R04'?family==='sword'?[7,12,15,plan.confirmFrame+2,plan.confirmFrame+8]:family==='thunder'?[7,12,20,25,30]:[5,9,13,17,25]:family==='sword'?[7,12,15,19,25]:family==='thunder'?[7,12,22,25,30]:[5,9,13,19,25];
 configs.push({realm,family,base,skill,clips,textures,plan,sample,frames});
}
function render(config,frame,zoom=2,w=960,h=640){
 const canvas=createCanvas(w,h),ctx=canvas.getContext('2d'),age=frameSeconds(frame,24),state=config.sample(age);
 ctx.fillStyle='#162b31';ctx.fillRect(0,0,w,h);ctx.setTransform(zoom,0,0,zoom,w/2-480*zoom,h/2-320*zoom);ctx.drawImage(scene,0,0,960,640);ctx.fillStyle='#07131b66';ctx.fillRect(0,0,960,640);
 function sprite(id,sample,point,angle=0,scale=1){const c=sample.clip,r=sample.frame.rect;ctx.save();ctx.globalAlpha*=c.opacities?.[sample.index]??1;ctx.translate(...point);ctx.rotate(angle);ctx.scale(scale,scale);ctx.imageSmoothingEnabled=c.sampling!=='nearest';ctx.drawImage(config.textures[id],r.x,r.y,r.w,r.h,-c.anchor[0],-c.anchor[1],r.w,r.h);ctx.restore();}
 const items=[];if(config.family!=='wind')items.push({layer:1,sortY:386,order:0,draw:()=>{ctx.imageSmoothingEnabled=false;ctx.drawImage(target,config.plan.targetFoot[0]-32,298,64,96);}});
 if(config.family==='wind'&&frame>=config.skill.preview.moveStartFrame&&frame<config.skill.preview.arrivalFrame+4)for(const[ticks,opacity]of config.skill.presentation.ghosts.sampleLagFrames.map((f,i)=>[f,config.skill.presentation.ghosts.opacity[i]])){const ghostAge=age-ticks/24;if(ghostAge<frameSeconds(config.skill.preview.moveStartFrame,24))continue;const g=config.sample(ghostAge);items.push({layer:1,sortY:386,order:-ticks,draw:()=>{ctx.save();ctx.globalAlpha=opacity; sprite(config.skill.character.clip,g.character,g.foot);ctx.restore();}});}
 items.push({layer:1,sortY:386,order:1,draw:()=>sprite(config.skill.character.clip,state.character,state.foot)});state.items.forEach((fx,i)=>items.push({layer:fx.layer,sortY:fx.point[1],order:i+2,draw:()=>sprite(fx.id,fx.sample,fx.point,fx.angle||0,fx.scale??1)}));for(const item of sortLayers(items))item.draw();
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#13292be0';ctx.fillRect(18,18,Math.min(w-36,430),68);ctx.fillStyle='#efdfb8';ctx.font='23px serif';ctx.fillText(`${config.realm} · ${config.skill.name} · F${frame} · ${zoom}×`,32,47);ctx.font='12px sans-serif';ctx.fillText('Ảnh kiểm asset cục bộ · cùng camera / cỡ người',32,69);return{canvas,state};
}
const report=[];
for(const config of configs.filter(c=>c.realm==='R04'))for(const zoom of[1,2])for(const frame of config.frames){const{canvas,state}=render(config,frame,zoom),file=join(config.base,'review',`F${frame}-${zoom}x.png`);await writeFile(file,canvas.toBuffer('image/png'));report.push({realm:config.realm,family:config.family,frame,zoom,file,active:state.items.map(f=>({clip:f.id,frame:f.sample.index+1,point:f.point}))});}
for(const family of['sword','thunder','wind']){const pair=configs.filter(c=>c.family===family),canvas=createCanvas(960,1280),ctx=canvas.getContext('2d');for(let i=0;i<2;i++){const c=pair[i],frame=({R03:{sword:7,thunder:12,wind:13},R04:{sword:7,thunder:12,wind:13}})[c.realm][family],image=render(c,frame,2).canvas;ctx.drawImage(image,0,i*640);}await writeFile(join(root,'review-r03-r04-'+family+'.png'),canvas.toBuffer('image/png'));}
await writeFile(join(root,'production/r04-review-report.json'),JSON.stringify({method:'local_atlas_sprite_render',browserInteractionVerified:false,captures:report},null,2));console.log('Rendered',report.length,'R04 captures and 3 R03/R04 comparisons.');

for(const family of ['sword','thunder','wind']){
 const frame={sword:7,thunder:12,wind:13}[family],canvas=createCanvas(960,1280),ctx=canvas.getContext('2d');
 for(const [i,version]of ['v1','v2'].entries()){const picture=await loadImage(join(root,`r04-${family}-${version}/review/F${frame}-2x.png`));ctx.drawImage(picture,0,i*640);ctx.fillStyle='#13292bf2';ctx.fillRect(18,i*640+18,520,68);ctx.fillStyle='#efdfb8';ctx.font='23px serif';ctx.fillText(i?'Sau · Linh ảnh khí ấn':'Trước · Linh ảnh hình nhân vật',32,i*640+47);ctx.font='12px sans-serif';ctx.fillText('Cùng camera, frame và cỡ Vương Lâm · render cục bộ',32,i*640+69);}
 await writeFile(join(root,`review-r04-spirit-redesign-${family}.png`),canvas.toBuffer('image/png'));
}
