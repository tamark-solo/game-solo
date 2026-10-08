// Offline rendering of exported sprites. Does not access/control a browser or alter source art.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {makePlan,samplePresentation} from './p2-model.mjs';
import {sortLayers,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
const require=createRequire(import.meta.url),{createCanvas,loadImage}=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'));
const root=resolve('docs/design/vfx'),scene=await loadImage(join(root,'sect-courtyard-game-reference-v1.png')),target=await loadImage(join(root,'pvp-target-stand-west-native-v1.png'));
const captures=[];
for(const family of['thunder','wind']){
 const base=join(root,`r01-${family}-v1`),skill=JSON.parse(await readFile(join(base,'skill.json'),'utf8')),clips=JSON.parse(await readFile(join(base,'clips.json'),'utf8')).clips,textures=Object.fromEntries(await Promise.all(Object.entries(clips).map(async([id,c])=>[id,await loadImage(join(base,c.atlas))]))),plan=makePlan(skill);
 const frames=family==='wind'?[4,8,13,20]:[4,10,16,23];
 for(const zoom of[1,2])for(const frame of frames){
  const canvas=createCanvas(960,640),ctx=canvas.getContext('2d'),age=frameSeconds(frame,24),state=samplePresentation(skill,clips,plan,age);
  ctx.fillStyle='#152930';ctx.fillRect(0,0,960,640);ctx.setTransform(zoom,0,0,zoom,480-480*zoom,320-320*zoom);ctx.save();ctx.filter='brightness(.55) saturate(.8)';ctx.drawImage(scene,0,0,960,640);ctx.restore();
  function draw(id,sample,point){const c=sample.clip,r=sample.frame.rect;ctx.save();ctx.translate(...point);ctx.imageSmoothingEnabled=c.sampling!=='nearest';ctx.drawImage(textures[id],r.x,r.y,r.w,r.h,-c.anchor[0],-c.anchor[1],r.w,r.h);ctx.restore();}
  const items=[];
  if(family==='thunder')items.push({layer:1,sortY:386,order:0,draw:()=>{ctx.imageSmoothingEnabled=false;ctx.drawImage(target,plan.targetFoot[0]-32,298,64,96);}});
  if(family==='wind'&&frame>=5&&frame<15)for(const [ticks,alpha]of[[4,.18],[2,.3]]){const t=age-ticks/24;if(t<4/24)continue;const ghost=samplePresentation(skill,clips,plan,t);items.push({layer:1,sortY:386,order:-ticks,draw:()=>{ctx.save();ctx.globalAlpha=alpha*Math.min(1,Math.max(0,(14/24-age)*6));draw(skill.character.clip,ghost.character,ghost.foot);ctx.restore();}});}
  items.push({layer:1,sortY:386,order:1,draw:()=>draw(skill.character.clip,state.character,state.foot)});
  state.items.forEach((fx,i)=>items.push({layer:fx.layer,sortY:fx.point[1],order:i+2,draw:()=>draw(fx.id,fx.sample,fx.point)}));for(const item of sortLayers(items))item.draw();
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#13292be0';ctx.fillRect(18,18,360,68);ctx.fillStyle='#ecdfbb';ctx.font='23px serif';ctx.fillText(`${skill.name} · F${String(frame).padStart(2,'0')} · ${zoom}×`,32,47);ctx.font='12px sans-serif';ctx.fillText('Ảnh kiểm asset cục bộ · không phải ảnh chụp trình duyệt',32,69);
  const file=join(base,'review',`F${frame}-${zoom}x.png`);await writeFile(file,canvas.toBuffer('image/png'));captures.push({family,frame,zoom,file,state:state.items.map(f=>({clip:f.id,frame:f.sample.index+1,point:f.point}))});
 }
}
await writeFile(join(root,'production/review-report.json'),JSON.stringify({method:'offline_canvas_render_of_exported_atlas',browserInteractionVerified:false,captures},null,2));console.log('Rendered',captures.length,'offline review frames.');
