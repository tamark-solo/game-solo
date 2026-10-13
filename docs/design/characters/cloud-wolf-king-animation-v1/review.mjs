import {productionSample,productionDuration,productionDirection} from '../../../../client/src/core/actor-animation-production.ts';
import {trial,vector,ms} from './fixture.mjs';
import {bitmap,fixedBitmap,cacheStats,dispose} from '../van-hai-monster-animation-v1/assets.mjs';
const $=id=>document.getElementById(id),read=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p);return r.json();};
const [catalog,kit,fx,player]=await Promise.all(['catalog.json','kit.json','vfx/catalog.json','../wang-lin-pixel-production-v2/catalog.json'].map(read));
const names={south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc',north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam'};
for(const d of catalog.directions)$('direction').add(new Option(names[d],d));$('direction').value='southeast';
const map=await fixedBitmap(new URL('../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp',import.meta.url));
const canvas=$('stage'),ctx=canvas.getContext('2d'),center=[560,400];let age=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=performance.now(),revision=0,busy=false,dirty=false,raf=0;
function selected(){return catalog.clips[$('action').value+'-'+$('direction').value];}
function maxAge(){return productionDuration(selected())+2000;}
function focus(){const k=kit.skills[$('action').value],v=vector($('direction').value);return $('action').value==='van_nha'?center.map((p,i)=>p+v[i]*k.range/2):center;}
function point(p){const z=+$('zoom').value,f=focus();return [560+(p[0]-f[0])*z,400+(p[1]-f[1])*z];}
function sprite(image,pivot,pos,size,opacity=1,rotation=0){const z=+$('zoom').value,p=point(pos);ctx.save();ctx.translate(...p);ctx.rotate(rotation);ctx.globalAlpha=opacity;ctx.drawImage(image,-pivot[0]*z,-pivot[1]*z,size[0]*z,size[1]*z);ctx.restore();}
function shadow(pos,rx){if(!$('shadows').checked)return;const z=+$('zoom').value,p=point(pos);ctx.fillStyle='#14271e50';ctx.beginPath();ctx.ellipse(p[0],p[1]+1,rx*z,7*z,0,0,Math.PI*2);ctx.fill();}
function root(pos,color){if(!$('roots').checked)return;const p=point(pos);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0]-5,p[1]);ctx.lineTo(p[0]+5,p[1]);ctx.moveTo(p[0],p[1]-5);ctx.lineTo(p[0],p[1]+5);ctx.stroke();}
function warning(action,direction){const k=kit.skills[action],v=vector(direction),z=+$('zoom').value,p=point(center),a=Math.atan2(v[1],v[0]);ctx.save();ctx.translate(...p);ctx.rotate(a);ctx.scale(z,z);ctx.fillStyle='#b8763040';ctx.strokeStyle='#f2ca7f';ctx.lineWidth=1.5;
 ctx.beginPath();if(action==='van_nha'){ctx.roundRect(-k.halfWidth,-k.halfWidth,k.range+2*k.halfWidth,2*k.halfWidth,k.halfWidth);}else if(action==='attack'){ctx.moveTo(0,0);ctx.arc(0,0,k.range,-k.halfAngle,k.halfAngle);ctx.closePath();}else{const gap=k.safeGapDegrees*Math.PI/360;ctx.arc(0,0,k.outerRadius,-Math.PI+gap,Math.PI-gap);ctx.arc(0,0,k.innerRadius,Math.PI-gap,-Math.PI+gap,true);ctx.closePath();}ctx.fill();ctx.stroke();ctx.restore();}
function fxPose(id,time,chargeSpan){const c=fx.clips[id];if(!c||time===null||time<0)return null;let t=time;if(c.phase==='charge')t=time/chargeSpan*productionDuration(c);if(t>=productionDuration(c))return null;const s=productionSample(c,t),progress=t/productionDuration(c);return {c,s,opacity:c.phase==='charge'?.6+.3*progress:Math.min(1,(1-progress)/.45)};}
function effectGraph(action,direction,t,facts){const v=vector(direction),a=Math.atan2(v[1],v[0]),boss=center.map((p,i)=>p+(facts?.bossOffset[i]||0)),graph=[];const add=(id,time,pos,rotation=0,span=1)=>{const x=fxPose(id,time,span);if(x)graph.push({...x,pos,rotation,id});};
 if(facts){const k=kit.skills[action];if(facts.warning)add('wolf-fx-charge',t,boss.map((p,i)=>p+v[i]*18-(i===1?40:0)),0,ms(k.releaseTick));
  if(action==='hoi_phong')add('wolf-ground-hoi_phong',facts.releaseAge,center,a);else add('wolf-fx-release',facts.releaseAge,boss.map((p,i)=>p+v[i]*25-(i===1?28:0)),a);
  add('wolf-fx-impact',facts.contactAge,center.map((p,i)=>p+trial(kit,action,direction,$('mode').value).playerAt(ms(k.resolveTick))[i]-(i===1?24:0)));
  if(action==='van_nha'&&facts.releaseAge!==null)add('wolf-ground-arrival',t-ms(k.resolveTick),boss);
 }else if(action==='appear')add('wolf-ground-arrival',t-ms(24),boss);
 return graph;
}
async function draw(){if(busy){dirty=true;return;}busy=true;dirty=false;const rev=revision,t=age,c=selected(),action=c.action,direction=c.direction,fixture=kit.skills[action]?trial(kit,action,direction,$('mode').value):null,facts=fixture?.factsAt(t),sample=productionSample(c,facts?.cancelled?Math.min(t,fixture.cancelAt):t),boss=center.map((p,i)=>p+(facts?.bossOffset[i]||0)),po=fixture?fixture.playerAt(t):[140,75],pp=center.map((p,i)=>p+po[i]);
 const moving=fixture?.mode==='miss'&&t>fixture.lock+kit.readReactionMs+kit.latencyFixtureMs&&t<fixture.resolve,v=vector(direction),escape=action==='hoi_phong'?v:[-v[1],v[0]],pd=moving?productionDirection(...escape):'southeast',pc=player.clips[(moving?'run':'idle')+'-'+pd],ps=productionSample(pc,t),graph=$('fx').checked?effectGraph(action,direction,t,facts):[];
 try{const images=await Promise.all([bitmap(new URL(sample.frame.file,import.meta.url)),bitmap(new URL('../wang-lin-pixel-production-v2/'+ps.frame.file,import.meta.url)),...graph.map(g=>bitmap(new URL('vfx/'+g.s.frame.file,import.meta.url))),$('neutral').checked?bitmap(new URL(catalog.masters['base-'+direction].file,import.meta.url)):null]);if(rev!==revision)return;
 ctx.imageSmoothingEnabled=false;const z=+$('zoom').value,scene=$('scene').value;ctx.clearRect(0,0,1120,720);if(scene==='map'){const f=focus();ctx.drawImage(map,1616+f[0]-center[0]-560/z,992+f[1]-center[1]-400/z,1120/z,720/z,0,0,1120,720);}else{ctx.fillStyle=scene==='light'?'#e3dfc9':'#24372d';ctx.fillRect(0,0,1120,720);ctx.strokeStyle=scene==='light'?'#c8c5b2':'#3b5141';for(let x=0;x<1120;x+=32*z){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,720);ctx.stroke();}for(let y=0;y<720;y+=32*z){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1120,y);ctx.stroke();}}
 if($('warning').checked&&facts?.warning)warning(action,direction);
 graph.forEach((g,i)=>{if(g.c.kind==='ground'||g.id.includes('arrival'))sprite(images[2+i],g.c.anchor,g.pos,g.c.frameSize,g.opacity,g.rotation);});
 shadow(boss,44);shadow(pp,15);const bodies=[{im:images[0],clip:c,pos:boss},{im:images[1],clip:pc,pos:pp}].sort((a,b)=>a.pos[1]-b.pos[1]);for(const b of bodies)sprite(b.im,b.clip.pivot,b.pos,b.clip.frameSize);
 graph.forEach((g,i)=>{if(g.c.kind!=='ground'&&!g.id.includes('arrival'))sprite(images[2+i],g.c.anchor,g.pos,g.c.frameSize,g.opacity,g.rotation);});
 if(images.at(-1)&&$('neutral').checked)sprite(images.at(-1),catalog.pivot,[300,470],catalog.frameSize,.55);
 root(center,'#c39947');root(boss,'#f2ce87');root(pp,'#71cabb');if($('frames').checked){ctx.strokeStyle='#8b8e6490';const p=point(boss);ctx.strokeRect(p[0]-c.pivot[0]*z,p[1]-c.pivot[1]*z,c.frameSize[0]*z,c.frameSize[1]*z);}
 ctx.fillStyle='#10261fe8';ctx.fillRect(18,18,585,67);ctx.fillStyle='#e5d4ae';ctx.font='16px Segoe UI';ctx.fillText(`${c.action} · ${names[direction]} · ${z}× · thân96 / Vương Lâm80`,30,43);ctx.font='13px Segoe UI';ctx.fillText(facts?.cancelled?'Đã hủy · không phát / không tác động':fixture?`${sample.phase} · ${fixture.mode==='miss'?'Né thường80':fixture.mode==='hit'?'Đứng trong đòn':'Hủy'} · khóa hướng cố định`:'Body only · Core absolute clock',30,67);
 const contact=graph.some(g=>g.c.phase==='impact'),release=graph.some(g=>['release','hoi_phong'].includes(g.c.phase));Object.assign(canvas.dataset,{clip:c.id,action,direction,mode:$('mode').value,age:String(t),frame:String(sample.index),warning:String(!!facts?.warning),locked:String(!!facts?.locked),release:String(release),contact:String(contact),bossOffset:JSON.stringify(facts?.bossOffset||[0,0]),playerOffset:JSON.stringify(po)});document.body.dataset.cache=JSON.stringify(cacheStats());document.body.dataset.ready='true';
 $('time').value=`${Math.round(t)} ms`;$('seek').value=String(t);$('facts').textContent=fixture?`Fixture: ${facts.cancelled?'Hủy trước phát':t<fixture.resolve?'Chờ xác nhận':fixture.hit?'Trúng đã xác nhận':'Hụt · không impact'} · khóa${Math.round(fixture.lock)} / phát${Math.round(fixture.release)} / xét${Math.round(fixture.resolve)} / hồi xong${Math.round(fixture.end)}ms.`:`${c.frames.length}pose · ${Math.round(productionDuration(c))}ms · ${c.loop?'lặp':c.holdLast?'giữ corpse':'một lượt'}`;
 $('measure').textContent=`Canvas${c.frameSize.join('×')} / chân${c.pivot.join(',')} · source${c.registrationSource} · bitmap${(cacheStats().decodedBytes/1048576).toFixed(2)} /16MiB`;
 }catch(e){document.body.dataset.error=String(e);$('facts').textContent=String(e);throw e;}finally{busy=false;if(dirty)queueMicrotask(()=>void draw());}
}
function poses(){const c=selected();$('poses').replaceChildren(...c.frames.map((f,i)=>{const fig=document.createElement('figure'),im=document.createElement('img'),cap=document.createElement('figcaption');im.src=f.file;im.alt=`${c.action} ${names[c.direction]} pose${i+1}`;cap.textContent=`${i+1} · ${c.durations[i]}tick`;fig.append(im,cap);return fig;}));$('source').textContent=`${c.registrationSource} · một scale theo neutral · không fit từng pose · ${c.uniqueFrames}/6 bitmap khác nhau`;}
function changed(){revision++;age=0;last=performance.now();$('seek').max=String(maxAge());poses();void draw();}
function playButton(){$('play').textContent=playing?'Tạm dừng':'Phát';$('play').setAttribute('aria-pressed',String(playing));}
for(const id of ['action','direction','mode'])$(id).onchange=changed;
for(const id of ['scene','zoom','fx','warning','roots','shadows','frames','neutral'])$(id).onchange=()=>{revision++;void draw();};
// Freeze at the end of this trial: a replay is explicit, never a hidden root reset.
function tick(now){raf=0;const elapsed=Math.max(0,now-last);last=now;if(playing&&!document.hidden&&navigator.onLine){age=Math.min(maxAge(),age+elapsed*+$('rate').value);if(age===maxAge()){playing=false;playButton();}void draw();}if(!document.hidden&&navigator.onLine)raf=requestAnimationFrame(tick);}
function ensureTick(){if(!raf&&!document.hidden&&navigator.onLine){last=performance.now();raf=requestAnimationFrame(tick);}}
$('play').onclick=()=>{playing=!playing;playButton();last=performance.now();ensureTick();};$('restart').onclick=()=>{changed();playing=true;playButton();ensureTick();};$('seek').oninput=()=>{playing=false;playButton();revision++;age=+$('seek').value;void draw();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else ensureTick();});addEventListener('offline',()=>{cancelAnimationFrame(raf);raf=0;});addEventListener('online',ensureTick);addEventListener('pagehide',()=>{cancelAnimationFrame(raf);dispose();});
playButton();poses();$('seek').max=String(maxAge());await draw();ensureTick();
