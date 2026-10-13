import {bitmap,fixedBitmap,cacheStats,dispose} from './assets.mjs';
import {sample,duration,frameAge,vector,names,FX_BY_ACTOR,fixtureFacts,poseAt,rootSocket,attackProfile} from './presentation.mjs';
import {cueGraph,reviewBounds,presentationEnd,reviewAge} from '../../vfx/van-hai-monster-vfx-v2/cues.mjs';
const $=id=>document.getElementById(id),FX='../../vfx/van-hai-monster-vfx-v1/',FX2='../../vfx/van-hai-monster-vfx-v2/';
const catalog=await fetch('./catalog.json').then(r=>r.json()),fxCatalog=await fetch(FX+'catalog.json').then(r=>r.json());
const fx2=await fetch(FX2+'catalog.json').then(r=>r.json());
const kits=Object.fromEntries(fx2.actors.map(a=>[a.id,a]));
const map=await fixedBitmap('../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp');
const player=await fixedBitmap('../wang-lin-pixel-production-v2/masters/southeast.png');
const actors=catalog.actors,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const laneByActor=Object.fromEntries(actors.map(a=>{const radius=Math.max(...Object.values(catalog.clips).filter(c=>c.actor===a.id).flatMap(c=>c.frames.map(f=>Math.max(Math.abs(f.bounds[0]-c.pivot[0]),Math.abs(f.bounds[2]-c.pivot[0])))));return [a.slug,Math.max(140,2*(radius+32))];}));
$('actor').innerHTML=actors.map(a=>`<option value="${a.slug}">${esc(a.name)} · ${a.clipsProduced}/40</option>`).join('');
$('direction').innerHTML=catalog.directions.map(d=>`<option value="${d}">${names[d]}</option>`).join('');$('direction').value='southeast';
$('action').value='attack';$('roots').checked=false;
$('coverage').textContent=`Body: 11 mẫu / 440 clip giữ nguyên · VFX02: ${fx2.coverage.sequences}/33 sequence · Tụ lực – phát thuật – va chạm riêng từng loài`;
let playing=true,baseTime=performance.now(),pausedAge=0,revision=0,raf=0,lastDraw=0;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const currentActor=()=>actors.find(a=>a.slug===$('actor').value);
const currentClip=()=>catalog.clips[$('actor').value+'-'+$('action').value+'-'+$('direction').value];
const ageNow=()=>playing?pausedAge+performance.now()-baseTime:pausedAge;
function pause(){pausedAge=ageNow();playing=false;$('play').textContent='Phát';}
function restart(){pausedAge=0;baseTime=performance.now();revision++;}
function lineRoot(ctx,x,y){ctx.strokeStyle='#be4937';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();}
async function drawBody(ctx,c,s,x,y,z,shadow=true){
 const image=await bitmap(c.atlas),f=s.frame,r=f.rect,lift=f.liftPx??0;
 if(shadow&&$('shadows').checked){ctx.fillStyle='#1d352b66';ctx.beginPath();ctx.ellipse(x,y+1,18*z,5*z,0,0,Math.PI*2);ctx.fill();}
 ctx.drawImage(image,r.x,r.y,r.w,r.h,Math.round(x-c.pivot[0]*z),Math.round(y-(c.pivot[1]+lift)*z),r.w*z,r.h*z);
 if($('roots').checked)lineRoot(ctx,x,y);
}
async function drawEffect(ctx,id,age,x,y,angle,z){
 const c=fxCatalog.clips[id];if(!c||age===null||age<0||age>=c.frames.length*1000/c.fps)return false;
 const image=await bitmap(FX+c.atlas),index=Math.min(5,Math.floor(age*c.fps/1000)),r=c.frames[index].rect;
 ctx.save();ctx.translate(x,y);if(c.kind==='directional')ctx.rotate(angle);
 ctx.drawImage(image,r.x,r.y,r.w,r.h,-c.anchor[0]*z,-c.anchor[1]*z,r.w*z,r.h*z);ctx.restore();return true;
}
async function drawCue(ctx,node,x,y,z){
 const c=node.clip,image=await bitmap(FX2+c.atlas),r=node.sample.frame.rect;
 ctx.save();ctx.translate(x+node.point[0]*z,y+node.point[1]*z);ctx.rotate(node.angle);ctx.scale(1,node.squash);ctx.globalAlpha=node.sample.opacity;
 ctx.drawImage(image,r.x,r.y,r.w,r.h,-c.anchor[0]*z,-c.anchor[1]*z,r.w*z,r.h*z);ctx.restore();
}
function warning(ctx,x,y,v,z,profile){
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(v[1],v[0]));ctx.strokeStyle='#dd8b40';ctx.fillStyle='#cc80343c';ctx.lineWidth=2;
 const end=profile.range*z;ctx.beginPath();
 if(profile.warning==='radial')ctx.arc(0,0,end,0,Math.PI*2);
 else if(profile.warning==='cone'){ctx.moveTo(0,0);ctx.arc(0,0,end,-.5,.5);ctx.closePath();}
 else{ctx.moveTo(7*z,-10*z);ctx.lineTo(end,-10*z);ctx.lineTo(end+8*z,0);ctx.lineTo(end,10*z);ctx.lineTo(7*z,10*z);ctx.closePath();}
 ctx.fill();ctx.stroke();ctx.restore();
}
async function heldProp(ctx,a,c,s,x,y,z){
 if(!$('props').checked)return false;const id=a.slug==='dark-talisman-rogue'?'rogue-dagger':a.slug==='black-silk-adept'?'adept-fan':null,p=fxCatalog.props[id];if(!p)return false;
 const socket=s.frame.sockets?.[id==='rogue-dagger'?'handRight':'handLeft'];if(!socket)return false;
 const image=await bitmap(FX+p.file),v=vector(c.direction),drop=c.action==='death'&&s.index>=2;
 ctx.save();ctx.translate(drop?x+12*z:x+(socket[0]-c.pivot[0])*z,drop?y+2*z:y+(socket[1]-c.pivot[1])*z);ctx.rotate(drop ? .25 : Math.atan2(v[1],v[0])+.25);ctx.drawImage(image,-p.anchor[0]*z,-p.anchor[1]*z,p.frameSize[0]*z,p.frameSize[1]*z);ctx.restore();return true;
}
async function draw(){
 const c=currentClip(),a=currentActor(),token=revision,cv=$('stage'),ctx=cv.getContext('2d'),z=Number($('zoom').value),elapsed=ageNow();
 if(!c){ctx.clearRect(0,0,960,480);ctx.fillStyle='#d8c695';ctx.fillText('Action / view đang sản xuất, không có fallback giả.',30,40);return;}
 const kit=kits[a.slug],modern=$('vfxset').value==='new'&&kit,newAttack=modern&&c.action==='attack';
 const age=newAttack?reviewAge(c,elapsed,$('repeat').checked,kit,fx2):poseAt(c,elapsed,$('repeat').checked).age;
 let s=sample(c,age);const graph=newAttack?cueGraph(c,age,$('fact').value,kit,fx2):null;
 const facts=graph?.facts??fixtureFacts(c,s.age,$('fact').value),v=vector(c.direction),angle=Math.atan2(v[1],v[0]);
 const idle=catalog.clips[a.slug+'-idle-'+c.direction],bs=c.action==='attack'&&facts.cancel&&idle?sample(idle,0):s;
 const body=c.action==='attack'&&facts.cancel&&idle?idle:c;
 await Promise.all([body.atlas,...catalog.directions.map(d=>catalog.clips[a.slug+'-'+c.action+'-'+d]?.atlas).filter(Boolean)].map(bitmap));
 if(token!==revision)return;
 const extent=kit&&c.action==='attack'?reviewBounds(c,kit,fx2):null,height=extent?Math.max(480,Math.ceil((extent[3]-extent[1])*z+120)):480,width=extent?Math.max(960,Math.ceil((extent[2]-extent[0])*z+200)):960;
 if(cv.height!==height||cv.width!==width){cv.height=height;cv.width=width;cv.style.height=height+'px';cv.style.width=width+'px';}
 ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
 if($('scene').value==='map')ctx.drawImage(map,1136+(1-1/z)*480,732+(1-1/z)*240,width/z,height/z,0,0,width,height);
 else{ctx.fillStyle=$('scene').value==='light'?'#e8e0c9':'#1b372c';ctx.fillRect(0,0,width,height);}
 const x=extent?width/2-(extent[0]+extent[2])*z/2:560,y=extent?height/2-(extent[1]+extent[3])*z/2:330;
 const profile=graph?.profile??attackProfile(a.slug),tx=x+v[0]*profile.range*z,ty=y+v[1]*profile.range*z;
 ctx.drawImage(player,0,0,64,96,Math.round(170-32*z),Math.round(y-88*z),64*z,96*z);
 if($('roots').checked)lineRoot(ctx,170,y);
 ctx.fillStyle='#14372d99';ctx.beginPath();ctx.arc(tx,ty,11*z,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d1bb7c';ctx.stroke();
 if(c.action==='attack'&&$('fx').checked&&facts.warning)warning(ctx,x,y,v,z,profile);
 if(graph&&$('fx').checked)for(const n of graph.nodes.filter(n=>n.layer==='ground'))await drawCue(ctx,n,x,y,z);
 const behind=['north','northeast','northwest'].includes(c.direction);let prop=false;if(behind)prop=await heldProp(ctx,a,body,bs,x,y,z);
 await drawBody(ctx,body,bs,x,y,z);if(!behind)prop=await heldProp(ctx,a,body,bs,x,y,z);
 const releaseFrame=c.frames[3],socket=rootSocket(c,releaseFrame),travel=profile.travel&&facts.releaseAge!==null?Math.min(profile.range,facts.releaseAge*.35):0;
 const sx=x+(socket[0]-c.pivot[0]+v[0]*travel)*z,sy=y+(socket[1]-c.pivot[1]-(releaseFrame.liftPx??0)+v[1]*travel)*z;
 let release=false,impact=false,charge=false;
 if(graph&&$('fx').checked){for(const n of graph.nodes.filter(n=>n.layer==='above'))await drawCue(ctx,n,x,y,z);charge=graph.nodes.some(n=>n.phase==='charge');release=graph.nodes.some(n=>n.phase==='release');impact=graph.nodes.some(n=>n.phase==='impact');}
 else if(c.action==='attack'&&$('fx').checked){release=await drawEffect(ctx,FX_BY_ACTOR[a.slug],facts.releaseAge,sx,sy,angle,z);impact=await drawEffect(ctx,'jade-contact',facts.impactAge,tx,ty-20*z,angle,z);}
 const phase=c.action==='attack'&&facts.cancel?'cancelled':newAttack&&age>=duration(c)?'Tàn khí':s.phase;
 ctx.fillStyle='#17332be8';ctx.fillRect(17,16,510,60);ctx.fillStyle='#e8d5a3';ctx.font='15px system-ui';ctx.fillText(a.name+' · '+names[c.direction]+' · '+c.action+' · '+z+'×',30,39);ctx.font='12px system-ui';ctx.fillText('Core clock / facts fixture · '+phase+' · frame '+(bs.index+1),30,61);
 cv.dataset.clip=c.id;cv.dataset.vfx=$('vfxset').value;cv.dataset.contentBounds=extent?JSON.stringify([x+extent[0]*z,y+extent[1]*z,x+extent[2]*z,y+extent[3]*z]):'';cv.dataset.charge=String(charge);cv.dataset.prop=String(prop);cv.dataset.frame=String(bs.index);cv.dataset.phase=phase;cv.dataset.release=String(release);cv.dataset.impact=String(impact);cv.dataset.age=String(Math.round(age));
 const strip=$('directions'),lane=laneByActor[a.slug];if(strip.width!==lane*8){strip.width=lane*8;strip.style.width=strip.width+'px';}
 const sc=strip.getContext('2d');sc.imageSmoothingEnabled=false;sc.clearRect(0,0,strip.width,190);sc.fillStyle='#17382b';sc.fillRect(0,0,strip.width,190);
 for(let i=0;i<catalog.directions.length;i++){const d=catalog.directions[i],dc=catalog.clips[a.slug+'-'+(facts.cancel&&c.action==='attack'?'idle':c.action)+'-'+d];if(!dc)continue;const ds=sample(dc,facts.cancel&&c.action==='attack'?0:s.age),back=['north','northeast','northwest'].includes(d),dx=(i+.5)*lane;if(back)await heldProp(sc,a,dc,ds,dx,138,1);await drawBody(sc,dc,ds,dx,138,1,false);if(!back)await heldProp(sc,a,dc,ds,dx,138,1);sc.fillStyle='#e4ce9c';sc.font='12px system-ui';sc.fillText(names[d],dx-40,176);}
 $('age').max=String(Math.ceil((newAttack?presentationEnd(c,kit,fx2):duration(c))+200));$('age').value=String(Math.round(age));$('clock').textContent=Math.round(age)+'ms';
 document.body.dataset.cache=JSON.stringify(cacheStats());document.body.dataset.ready='true';
}
function info(){const a=currentActor(),c=currentClip(),kit=kits[a.slug],modern=$('vfxset').value==='new';$('info').innerHTML=`<h3>${esc(a.name)}</h3><p>${esc(a.role)} · body ${a.bodyHeightPx}px · ${a.clipsProduced}/40 clip giữ nguyên.</p>${modern&&kit?`<h3>${esc(kit.name)}</h3><p>Tụ lực ở nhịp báo đòn → phát thuật đúng pose release → va chạm theo tín hiệu Trúng → tàn khí. ${a.rank==='elite'?'Tinh anh có hình trận và đường thuật riêng.':'Hiệu ứng gắn với vật liệu và thế đánh của loài.'}</p><p><a href="${FX2}review/${a.slug}-native-phases.png">Xem 18 frame VFX native</a> · <a href="${FX2}README.md">Hồ sơ VFX02 / prompt</a></p>`:'<p>VFX01: vệt cũ để so trực tiếp trên cùng body, các tinh anh dùng chung vệt với quái thường.</p>'}<p>Năm action, tám view. Body, VFX, bóng và đạo cụ tách layer; bộ mới không phóng thân. Timing/socket là ứng viên presentation, chưa là luật damage/server.</p><p><a href="review/${a.slug}-native-matrix.png">Matrix body</a> · <a href="../van-hai-monster-concepts-v1/index.html#actor=${a.id}">Concept basis</a></p>`;}
let drawing=false,redrawNeeded=false;
async function paint(){
 if(drawing){redrawNeeded=true;return;}drawing=true;
 try{await draw();}catch(e){document.body.dataset.error=String(e);console.error(e);}finally{drawing=false;}
 if(redrawNeeded){redrawNeeded=false;await paint();}
}
async function tick(now){
 if(now-lastDraw>=1000/24){lastDraw=now;await paint();}
 if(playing&&!document.hidden&&navigator.onLine&&!reduced.matches)raf=requestAnimationFrame(tick);
}
function kick(){cancelAnimationFrame(raf);if(playing&&!document.hidden&&navigator.onLine&&!reduced.matches)raf=requestAnimationFrame(tick);else paint();}
for(const id of ['actor','action','direction'])$(id).onchange=()=>{restart();info();kick();};
for(const id of ['scene','zoom','fx','props','roots','shadows','fact','repeat'])$(id).onchange=()=>{revision++;kick();};
$('vfxset').onchange=()=>{revision++;info();kick();};
$('play').onclick=()=>{if(document.hidden||!navigator.onLine||reduced.matches){pause();paint();return;}if(playing)pause();else{playing=true;baseTime=performance.now();$('play').textContent='Dừng';}kick();};
$('restart').onclick=()=>{restart();kick();};$('age').oninput=()=>{pause();pausedAge=Number($('age').value);revision++;kick();};
let lifecycleIntent=false;
function lifecycle(){if(document.hidden||!navigator.onLine||reduced.matches){lifecycleIntent=lifecycleIntent||playing;pause();cancelAnimationFrame(raf);}else if(lifecycleIntent){playing=true;baseTime=performance.now();$('play').textContent='Dừng';lifecycleIntent=false;kick();}else kick();}
addEventListener('offline',lifecycle);addEventListener('online',lifecycle);document.addEventListener('visibilitychange',lifecycle);reduced.addEventListener('change',lifecycle);
addEventListener('pagehide',()=>{cancelAnimationFrame(raf);dispose();});
const hash=decodeURIComponent(location.hash.replace(/^#actor=/,''));const initial=actors.find(a=>a.id===hash||a.slug===hash);if(initial)$('actor').value=initial.slug;
info();await paint();if(reduced.matches){pause();}kick();
