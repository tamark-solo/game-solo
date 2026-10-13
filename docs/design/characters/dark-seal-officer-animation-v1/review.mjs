import {productionSample,productionDuration,productionDirection} from '../../../../client/src/core/actor-animation-production.ts';
import {trial,vector,ms} from './fixture.mjs';
import {effectGraph,decoys} from './presentation.mjs';
import {bitmap,fixedBitmap,cacheStats,dispose} from '../van-hai-monster-animation-v1/assets.mjs';
const $=id=>document.getElementById(id),read=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p);return r.json();};
const [catalog,kit,fx,player]=await Promise.all(['catalog.json','kit.json','vfx/catalog.json','../wang-lin-pixel-production-v2/catalog.json'].map(read));
const names={south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc',north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam'};
for(const d of catalog.directions)$('direction').add(new Option(names[d],d));$('direction').value='southeast';
const [map,neutral]=await Promise.all([
 fixedBitmap(new URL('../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp',import.meta.url)),
 fixedBitmap(new URL('../van-hai-dark-seal-officer-v3/sprites/officer.png',import.meta.url))
]);
const canvas=$('stage'),ctx=canvas.getContext('2d'),center=[560,400];
let age=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=performance.now(),revision=0,busy=false,dirty=false,raf=0;
const selected=()=>catalog.clips[$('action').value+'-'+$('direction').value];
const maxAge=()=>productionDuration(selected())+2000;
function focus(){const k=kit.skills[$('action').value],v=vector($('direction').value);return k?.shape==='capsule'?center.map((p,i)=>p+v[i]*k.range/2):center;}
function point(p){const z=+$('zoom').value,f=focus();return [560+(p[0]-f[0])*z,400+(p[1]-f[1])*z];}
function sprite(image,pivot,pos,size,opacity=1,rotation=0,scaleY=1){const z=+$('zoom').value,p=point(pos);ctx.save();ctx.translate(...p);ctx.rotate(rotation);ctx.scale(1,scaleY);ctx.globalAlpha=opacity;ctx.drawImage(image,-pivot[0]*z,-pivot[1]*z,size[0]*z,size[1]*z);ctx.restore();}
function shadow(pos,rx){if(!$('shadows').checked)return;const z=+$('zoom').value,p=point(pos);ctx.fillStyle='#15271f50';ctx.beginPath();ctx.ellipse(p[0],p[1]+1,rx*z,4*z,0,0,Math.PI*2);ctx.fill();}
function root(pos,color){if(!$('roots').checked)return;const p=point(pos);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0]-5,p[1]);ctx.lineTo(p[0]+5,p[1]);ctx.moveTo(p[0],p[1]-5);ctx.lineTo(p[0],p[1]+5);ctx.stroke();}
function warning(action,direction){const k=kit.skills[action],v=vector(direction),z=+$('zoom').value,p=point(center),a=Math.atan2(v[1],v[0]);ctx.save();ctx.translate(...p);ctx.rotate(a);ctx.scale(z,z);ctx.fillStyle='#a65a3840';ctx.strokeStyle='#f1cc84';ctx.lineWidth=1.5;ctx.beginPath();
 if(k.shape==='capsule')ctx.roundRect(-k.halfWidth,-k.halfWidth,k.range+2*k.halfWidth,2*k.halfWidth,k.halfWidth);
 else if(k.shape==='cone'){ctx.moveTo(0,0);ctx.arc(0,0,k.range,-k.halfAngle,k.halfAngle);ctx.closePath();}
 else{const gap=k.safeGapDegrees*Math.PI/360;ctx.arc(0,0,k.outerRadius,-Math.PI+gap,Math.PI-gap);ctx.arc(0,0,k.innerRadius,Math.PI-gap,-Math.PI+gap,true);ctx.closePath();}
 ctx.fill();ctx.stroke();ctx.restore();
}
function background(){const z=+$('zoom').value,scene=$('scene').value;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1120,720);
 if(scene==='map'){const f=focus();ctx.drawImage(map,1616+f[0]-center[0]-560/z,992+f[1]-center[1]-400/z,1120/z,720/z,0,0,1120,720);}
 else{ctx.fillStyle=scene==='light'?'#e3dfc9':'#24372d';ctx.fillRect(0,0,1120,720);ctx.strokeStyle=scene==='light'?'#c8c5b2':'#3b5141';for(let x=0;x<1120;x+=32*z){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,720);ctx.stroke();}for(let y=0;y<720;y+=32*z){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1120,y);ctx.stroke();}}
}
async function draw(){if(busy){dirty=true;return;}busy=true;dirty=false;
 const rev=revision,t=age,c=selected(),action=c.action,direction=c.direction,fixture=kit.skills[action]?trial(kit,action,direction,$('mode').value):null,facts=fixture?.factsAt(t);
 const sample=productionSample(c,facts?.cancelled?Math.min(t,fixture.cancelAt):t),po=fixture?fixture.playerAt(t):[135,75],pp=center.map((p,i)=>p+po[i]);
 const moving=fixture?.mode==='miss'&&t>fixture.lock+kit.readReactionMs+kit.latencyFixtureMs&&t<fixture.resolve,v=vector(direction),escape=action==='an_hoi'?v:[-v[1],v[0]],pd=moving?productionDirection(...escape):'southeast',pc=player.clips[(moving?'run':'idle')+'-'+pd],ps=productionSample(pc,t);
 const graph=$('fx').checked?effectGraph(fx,kit,c,t,fixture,facts):[],ghosts=fixture&&$('decoys').checked?decoys(kit,fixture,t):[],ghostSamples=ghosts.map(g=>productionSample(c,g.poseAge));
 try{
  const images=await Promise.all([
   bitmap(new URL(sample.frame.file,import.meta.url)),bitmap(new URL('../wang-lin-pixel-production-v2/'+ps.frame.file,import.meta.url)),
   ...graph.map(g=>bitmap(new URL('vfx/'+g.sample.frame.file,import.meta.url))),...ghostSamples.map(s=>bitmap(new URL(s.frame.file,import.meta.url)))
  ]);if(rev!==revision)return;background();
  if($('warning').checked&&facts?.warning)warning(action,direction);
  graph.forEach((g,i)=>{if(g.ground)sprite(images[2+i],g.clip.anchor,center.map((p,j)=>p+g.offset[j]),g.clip.frameSize,g.opacity,g.rotation,g.scaleY);});
  ghosts.forEach((g,i)=>{const pos=center.map((p,j)=>p+g.offset[j]);sprite(images[2+graph.length+i],c.pivot,pos,c.frameSize,g.opacity);const p=point(pos);ctx.font='11px Segoe UI';ctx.fillStyle='#cfb99d';ctx.textAlign='center';ctx.fillText('Dư ảnh',p[0],p[1]+19);});ctx.textAlign='left';
  shadow(center,action==='death'?23:15);shadow(pp,15);
  const bodies=[{im:images[0],clip:c,pos:center},{im:images[1],clip:pc,pos:pp}].sort((a,b)=>a.pos[1]-b.pos[1]);for(const b of bodies)sprite(b.im,b.clip.pivot,b.pos,b.clip.frameSize);
  graph.forEach((g,i)=>{if(!g.ground)sprite(images[2+i],g.clip.anchor,center.map((p,j)=>p+g.offset[j]),g.clip.frameSize,g.opacity,g.rotation);});
  if(action==='phan_phu'&&!facts?.cancelled&&t<fixture.resolve+300){const p=point(center);ctx.font='12px Segoe UI';ctx.textAlign='center';ctx.fillStyle='#ffdfa4';ctx.fillText('THÂN THẬT',p[0],p[1]+19);ctx.textAlign='left';}
  if($('neutral').checked){sprite(neutral,[32,88],[170,655],[64,96]);const p=point([170,655]);ctx.fillStyle='#ecd9b7';ctx.font='12px Segoe UI';ctx.fillText('Neutral03 đã duyệt',p[0]-55,p[1]+20);}
  root(center,'#f1c383');root(pp,'#68c4b5');
  if($('frames').checked){const z=+$('zoom').value,p=point(center);ctx.strokeStyle='#a3896d90';ctx.strokeRect(p[0]-c.pivot[0]*z,p[1]-c.pivot[1]*z,c.frameSize[0]*z,c.frameSize[1]*z);}
  if($('sockets').checked){const socket=c.sockets?.[3]||[c.pivot[0]+v[0]*18,c.pivot[1]-36+v[1]*10];root(center.map((p,i)=>p+socket[i]-c.pivot[i]),'#fa9670');}
  ctx.fillStyle='#10261fe8';ctx.fillRect(18,18,620,67);ctx.fillStyle='#e5d4ae';ctx.font='16px Segoe UI';ctx.fillText(`${kit.skills[action]?.name||action} · ${names[direction]} · ${$('zoom').value}× · thân80 / Vương Lâm80`,30,43);ctx.font='13px Segoe UI';ctx.fillText(facts?.cancelled?'Đã hủy · không phát / không tác động':fixture?`${sample.phase} · ${fixture.mode==='miss'?'Né thường80':fixture.mode==='hit'?'Đứng trong đòn':'Hủy'} · hướng đã khóa`:'Body only · Core absolute clock',30,67);
  const contact=graph.some(g=>g.phase==='impact'),release=graph.some(g=>['release','return'].includes(g.phase));
  Object.assign(canvas.dataset,{clip:c.id,action,direction,mode:$('mode').value,age:String(t),frame:String(sample.index),warning:String(!!facts?.warning),locked:String(!!facts?.locked),release:String(release),contact:String(contact),bossOffset:'[0,0]',playerOffset:JSON.stringify(po),decoys:String(ghosts.length),decoyDamage:'false'});
  document.body.dataset.cache=JSON.stringify(cacheStats());document.body.dataset.ready='true';$('time').value=`${Math.round(t)} ms`;$('seek').value=String(t);
  $('facts').textContent=fixture?`Fixture: ${facts.cancelled?'Hủy trước phát':t<fixture.resolve?'Chờ xác nhận':fixture.hit?'Trúng đã xác nhận':'Hụt · không impact'} · khóa${Math.round(fixture.lock)} / phát${Math.round(fixture.release)} / xét${Math.round(fixture.resolve)} / hồi xong${Math.round(fixture.end)}ms.`:`6pose · ${Math.round(productionDuration(c))}ms · ${c.loop?'lặp':c.holdLast?'giữ corpse':'một lượt'}`;
  $('measure').textContent=`Canvas${c.frameSize.join('×')} / chân${c.pivot.join(',')} · source${c.registrationSource} · bitmap${(cacheStats().decodedBytes/1048576).toFixed(2)} /16MiB`;
 }catch(e){document.body.dataset.error=String(e);$('facts').textContent=String(e);throw e;}finally{busy=false;if(dirty)queueMicrotask(()=>void draw());}
}
function poses(){const c=selected();$('poses').replaceChildren(...c.frames.map((f,i)=>{const fig=document.createElement('figure'),im=document.createElement('img'),cap=document.createElement('figcaption');im.src=f.file;im.alt=`${c.action} ${names[c.direction]} pose${i+1}`;cap.textContent=`${i+1} · ${c.durations[i]}tick`;fig.append(im,cap);return fig;}));$('source').textContent=`${c.registrationSource} · một scale theo neutral · không fit từng pose · ${c.uniqueFrames}/6 bitmap khác nhau`;}
function changed(){revision++;age=0;last=performance.now();$('seek').max=String(maxAge());poses();void draw();}
function playButton(){$('play').textContent=playing?'Tạm dừng':'Phát';$('play').setAttribute('aria-pressed',String(playing));}
for(const id of ['action','direction','mode'])$(id).onchange=changed;
for(const id of ['scene','zoom','fx','warning','roots','shadows','frames','neutral','decoys','sockets'])$(id).onchange=()=>{revision++;void draw();};
function tick(now){raf=0;const elapsed=Math.max(0,now-last);last=now;if(playing&&!document.hidden&&navigator.onLine){age=Math.min(maxAge(),age+elapsed*+$('rate').value);if(age===maxAge()){playing=false;playButton();}void draw();}if(!document.hidden&&navigator.onLine)raf=requestAnimationFrame(tick);}
function ensureTick(){if(!raf&&!document.hidden&&navigator.onLine){last=performance.now();raf=requestAnimationFrame(tick);}}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){playing=false;playButton();}});
$('play').onclick=()=>{playing=!playing;playButton();last=performance.now();ensureTick();};$('restart').onclick=()=>{changed();playing=true;playButton();ensureTick();};$('seek').oninput=()=>{playing=false;playButton();revision++;age=+$('seek').value;void draw();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else ensureTick();});addEventListener('offline',()=>{cancelAnimationFrame(raf);raf=0;});addEventListener('online',ensureTick);addEventListener('pagehide',()=>{cancelAnimationFrame(raf);dispose();});
playButton();poses();$('seek').max=String(maxAge());await draw();ensureTick();
