import {SequencePlayer,FrameEventCursor,VfxPool,AtlasManager,frameSeconds,sortLayers} from './frame-by-frame-r01/sequence-system.mjs';
import {makePreviewPlan,projectileTip} from './frame-by-frame-r01/preview-model.mjs';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:false}),BASE='./frame-by-frame-r01/';
const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Cannot load '+src));img.src=src;});
const manager=new AtlasManager(loadImage),pool=new VfxPool(8);
let clips,skill,plan,players,textures,scene,target,ready=false,time=0,last=0,paused=false,cursor,history=[],selectedSource=0;
let view={w:960,h:640,dpr:1,zoom:1};
function resize(){const r=canvas.getBoundingClientRect();view={w:Math.round(r.width),h:Math.round(r.height),dpr:Math.min(devicePixelRatio||1,2),zoom:Number($('zoom').value)};canvas.width=view.w*view.dpr;canvas.height=view.h*view.dpr;}
new ResizeObserver(resize).observe(canvas);
function options(){return {target:$('target-kind').value,hit:$('contact').checked,distance:Number($('distance').value),delay:Number($('hit-delay').value)};}
function spawn(clip,start,anchor,rotation=0,limit=null){const slot=pool.acquire({clip,start,anchor,rotation,limit});if(!slot)throw new Error('Preview pool capacity exceeded');return slot;}
function process(events,silent=false){
 for(const event of events){
  const at=frameSeconds(event.frame,skill.fps);history.push({...event,silent});
  if(event.type==='cast.start')spawn('sword-charge',at,'hand',0,plan.launch);
  if(event.type==='release')spawn('sword-projectile',at,'projectile',plan.angle,plan.options.hit?plan.contactTime:plan.expireTime);
  if(event.type==='preview.hitConfirmed')spawn('qi-impact',at,'hit',plan.angle);
  if(event.type==='preview.projectile.expired')spawn('miss-dissolve',at,'miss',plan.angle);
 }
}
function rebuild(at=0,silent=true){
 plan=makePreviewPlan(skill,clips,options());$('seek').max=plan.endFrame;$('distance-value').textContent=options().distance+' world px';
 cursor=new FrameEventCursor(skill.fps,plan.events);pool.clear();history=[];time=Math.min(at,frameSeconds(plan.endFrame,skill.fps));process(cursor.advance(time),silent);draw();
}
function setPaused(value){paused=value;$('pause').textContent=value?'Tiếp tục':'Tạm dừng';}
function seek(frame){setPaused(true);rebuild(frameSeconds(frame,skill.fps));}
function cameraCenter(){const mode=$('focus').value;if(mode==='hero'||(mode==='auto'&&view.zoom===4))return [plan.foot[0],plan.foot[1]-40];if(mode==='target')return [plan.targetFoot[0],plan.targetFoot[1]-55];return [480,320];}
function snap(p){const center=cameraCenter();return p.map((n,i)=>center[i]+(Math.round((n-center[i])*view.zoom+[view.w,view.h][i]/2)-[view.w,view.h][i]/2)/view.zoom);}
function drawFrame(id,sample,point,rotation=0,context=ctx){
 if(!sample)return;const clip=sample.clip,r=sample.frame.rect,[ax,ay]=clip.anchor;
 context.save();context.translate(...point);context.rotate(rotation);context.imageSmoothingEnabled=clip.sampling!=='nearest';
 if(context===ctx&&clip.sampling!=='nearest'&&$('mood').value==='light')context.filter='drop-shadow(0px 0px 0.7px rgba(19,65,50,0.75))';
 context.drawImage(textures[id],r.x,r.y,r.w,r.h,-ax,-ay,r.w,r.h);context.restore();
}
function label(text,x,y){ctx.save();ctx.font=`${11/view.zoom}px Segoe UI,Arial`;ctx.textAlign='center';ctx.lineWidth=3/view.zoom;ctx.strokeStyle='#122126cc';ctx.strokeText(text,x,y);ctx.fillStyle='#f3eddb';ctx.fillText(text,x,y);ctx.restore();}
function shadow(p){ctx.save();ctx.fillStyle='#143b2e55';ctx.beginPath();ctx.ellipse(...p,14,5,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function targetBody(){
 const f=snap(plan.targetFoot),p=plan.profile;shadow(f);
 ctx.save();if(p.sprite){ctx.imageSmoothingEnabled=false;ctx.drawImage(target,f[0]-32,f[1]-88,64,96);}
 else{ctx.setLineDash([4/view.zoom,4/view.zoom]);ctx.lineWidth=1/view.zoom;ctx.strokeStyle='#ddc287aa';ctx.fillStyle='#182b3020';ctx.beginPath();ctx.ellipse(f[0],f[1]-p.height/2,p.width/2,p.height/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
 ctx.restore();label(p.label,f[0],f[1]-p.height-5);
}
function draw(){
 if(!ready)return;
 const {dpr:d,zoom:z,w,h}=view,hitAge=time-plan.impactTime;
 let sx=0,sy=0;
 if($('punch').checked&&plan.options.hit&&hitAge>=0&&hitAge<skill.presentation.cameraShakeFrames/skill.fps){
  const step=Math.floor(hitAge*skill.fps);sx=[1,-1,0][step]*skill.presentation.cameraShakeWorld;sy=[0,1,0][step]*skill.presentation.cameraShakeWorld;
 }
 const center=cameraCenter();ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#17282e';ctx.fillRect(0,0,w,h);ctx.setTransform(d*z,0,0,d*z,d*(w/2-center[0]*z+sx*z),d*(h/2-center[1]*z+sy*z));
 if($('mood').value==='alpha'){
  const x0=center[0]-w/(2*z),y0=center[1]-h/(2*z);for(let y=Math.floor(y0/16)*16;y<y0+h/z;y+=16)for(let x=Math.floor(x0/16)*16;x<x0+w/z;x+=16){ctx.fillStyle=((x+y)/16)%2?'#354950':'#23363c';ctx.fillRect(x,y,16,16);}
 }else{ctx.save();ctx.imageSmoothingEnabled=true;if($('mood').value==='night')ctx.filter='brightness(0.55) saturate(0.8)';ctx.drawImage(scene,0,0,960,640);ctx.restore();}
 const presentationHold=$('punch').checked&&plan.options.hit?Math.min(skill.presentation.hitStopMs/1000,Math.max(0,hitAge)):0;
 const pose=players['wanglin-cast-east'].sample(time-presentationHold)||{index:11,frame:clips['wanglin-cast-east'].frames[11],clip:clips['wanglin-cast-east']};
 const foot=snap(plan.foot),offset=skill.sockets[pose.index],hand=[foot[0]+offset[0],foot[1]+offset[1]];
 shadow(foot);const items=[{layer:1,sortY:plan.targetFoot[1],order:0,draw:targetBody},{layer:1,sortY:foot[1],order:1,draw:()=>drawFrame('wanglin-cast-east',pose,foot)}];
 const active=[];
 for(const slot of pool.slots){
  if(!slot.active)continue;const value=slot.value,age=time-value.start,sample=players[value.clip].sample(age);
  if((value.limit!==null&&time>=value.limit)||!sample){pool.release(slot);continue;}
  const point=value.anchor==='hand'?hand:value.anchor==='projectile'?projectileTip(plan,time):value.anchor==='hit'?plan.hitPoint:projectileTip(plan,plan.expireTime);
  const textureKey=value.clip==='miss-dissolve'?'qi-impact':value.clip;
  items.push({layer:value.anchor==='hit'?3:2,sortY:point[1],order:slot.id,draw:()=>drawFrame(textureKey,sample,point,value.rotation)});
  active.push(`${value.clip} ${String(sample.index+1).padStart(2,'0')}/${players[value.clip].clip.frames.length}`);
 }
 for(const item of sortLayers(items))item.draw();label('Vương Lâm',foot[0],foot[1]-92);
 if($('bounds').checked){ctx.save();ctx.lineWidth=1/z;ctx.setLineDash([3/z,3/z]);ctx.strokeStyle='#9accdf';ctx.strokeRect(foot[0]-32,foot[1]-88,64,96);ctx.strokeStyle='#d9b678';ctx.strokeRect(foot[0]-48,foot[1]-88,96,96);ctx.setLineDash([]);for(const [p,color]of[[hand,'#91e5c9'],[plan.hitPoint,'#ffdf98']]){ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(p[0]-3,p[1]);ctx.lineTo(p[0]+3,p[1]);ctx.moveTo(p[0],p[1]-3);ctx.lineTo(p[0],p[1]+3);ctx.stroke();}ctx.restore();}
 const master=Math.floor((time+1e-9)*skill.fps)+1,description=time<plan.launch?'Tụ khí':time<(plan.options.hit?plan.contactTime:plan.expireTime)?'Kiếm bay':plan.options.hit&&time<plan.impactTime?'Chờ xác nhận hit mô phỏng':plan.options.hit&&hitAge<12/24?'Chạm → dư khí':time<plan.expireTime+4/24&&!plan.options.hit?'Tan khi hụt':'Hồi động tác / nghỉ';
 $('phase').textContent=`F${String(master).padStart(2,'0')} · ${description}`;$('time').textContent=`F${master} / ${plan.endFrame} · 24 FPS`;$('seek').value=master;
 $('description').textContent=`Pose ${String(pose.index+1).padStart(2,'0')}/12 · ${active.join(' · ')||'FX đã tắt'}`;
 $('size-info').textContent=`Thân ~80 px · canvas cast 96 × 96 · zoom ${z}× · ${w} × ${h} CSS px`;
 $('event-log').textContent=history.slice(-6).map(e=>`F${String(e.frame).padStart(2,'0')}  ${e.type}`).join('\n')||'Chưa có event';
 $('pool-info').textContent=`Pool ${pool.activeCount}/${pool.capacity} · ${manager.textures.size} texture · hit ${plan.options.hit?'F'+plan.confirmFrame:'không phát'}`;
 Object.assign(canvas.dataset,{ready:'true',masterFrame:String(master),poseFrame:String(pose.index+1),zoom:String(z),bodyHeight:String(80*z),castCanvasWidth:String(96*z),cssWidth:String(w),cssHeight:String(h),target:plan.options.target,hit:String(plan.options.hit),impactFrame:String(plan.confirmFrame),impactActive:String(active.some(s=>s.startsWith('qi-impact'))),poolActive:String(pool.activeCount),frameSources:active.join(';')});
}
function frame(now){
 const dt=last?(now-last)/1000:0;last=now;
 if(ready&&!paused&&!document.hidden){
  time+=dt*Number($('speed').value);const end=plan.endFrame/skill.fps;
  if(time>=end){process(cursor.advance(end-1e-7));if($('loop').checked){time%=end;rebuild(time,false);}else{time=frameSeconds(plan.endFrame,skill.fps);setPaused(true);}}
  process(cursor.advance(time));
 }
 draw();requestAnimationFrame(frame);
}
function refreshStrip(){
 const id=$('clip-inspector').value,clip=clips[id];$('strip').replaceChildren();selectedSource=0;
 clip.frames.forEach((entry,index)=>{
  const b=document.createElement('button');b.className='frame-tile';b.setAttribute('aria-label',`${id} frame ${index+1}`);
  const c=document.createElement('canvas');c.width=156;c.height=140;c.setAttribute('aria-hidden','true');const cx=c.getContext('2d');
  for(let y=0;y<140;y+=12)for(let x=0;x<156;x+=12){cx.fillStyle=((x+y)/12)%2?'#2a3d43':'#203037';cx.fillRect(x,y,12,12);}
  const center=[78,clip.sampling==='nearest'?120:70];drawFrame(id,{frame:entry,clip,index},center,0,cx);
  const t=document.createElement('span');t.textContent=`${String(index+1).padStart(3,'0')} · ${clip.frameSize.join(' × ')}`;b.append(c,t);
  b.addEventListener('click',()=>{selectedSource=index;$('source-info').textContent=`${id}/${String(index+1).padStart(3,'0')}.png · anchor ${clip.anchor.join(',')} · giữ ${clip.durations[index]} tick`;for(const tile of $('strip').children)tile.classList.toggle('selected',tile===b);});$('strip').append(b);
 });$('source-info').textContent=`${id} · ${clip.frames.length} frame khác nhau · ${clip.fps} FPS · ${clip.sampling}`;
}
$('cast').addEventListener('click',()=>{setPaused(false);rebuild(0,false);last=performance.now();});$('pause').addEventListener('click',()=>setPaused(!paused));
$('seek').addEventListener('input',()=>seek(Number($('seek').value)));$('prev-frame').addEventListener('click',()=>seek(Math.max(1,Math.floor(time*skill.fps+1e-9))));$('next-frame').addEventListener('click',()=>seek(Math.min(plan.endFrame,Math.floor(time*skill.fps+1e-9)+2)));
for(const [id,which]of[['beat-gather','gather'],['beat-release','release'],['beat-impact','impact'],['beat-tail','tail']])$(id).addEventListener('click',()=>seek(which==='gather'?4:which==='release'?plan.releaseFrame+2:which==='impact'?plan.confirmFrame+2:plan.confirmFrame+8));
for(const id of ['target-kind','contact','hit-delay','distance'])$(id).addEventListener('change',()=>rebuild(time));
$('zoom').addEventListener('change',()=>{resize();draw();});$('view-size').addEventListener('change',()=>{const compact=$('view-size').value==='compact';canvas.parentElement.style.width=compact?'362px':'';canvas.parentElement.style.height=compact?'402px':'';resize();draw();});
$('clip-inspector').addEventListener('change',refreshStrip);
$('export').addEventListener('click',()=>{draw();canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`kiem-khi-fbf-${plan.options.target}-F${Math.floor(time*skill.fps+1e-9)+1}-${view.zoom}x.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);});});
document.addEventListener('visibilitychange',()=>{last=performance.now();});
try{
 const [clipResponse,skillResponse]=await Promise.all([fetch(BASE+'clips.json',{cache:'no-store'}),fetch(BASE+'skill.json',{cache:'no-store'})]);
 if(!clipResponse.ok||!skillResponse.ok)throw new Error('Metadata missing');clips=(await clipResponse.json()).clips;skill=await skillResponse.json();
 textures=Object.fromEntries(await Promise.all(Object.entries(clips).map(async([id,clip])=>[id,await manager.load(BASE+clip.atlas)])));
 [scene,target]=await Promise.all([manager.load('./sect-courtyard-game-reference-v1.png'),manager.load('./pvp-target-stand-west-native-v1.png')]);
 const tail={...clips['qi-impact'],frames:clips['qi-impact'].frames.slice(8),durations:[1,1,1,1]};players=Object.fromEntries(Object.entries({...clips,'miss-dissolve':tail}).map(([id,clip])=>[id,new SequencePlayer(clip)]));
 ready=true;resize();$('loading').hidden=true;document.querySelectorAll('button').forEach(b=>b.disabled=false);rebuild(0,false);refreshStrip();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){$('loop').checked=false;$('punch').checked=false;seek(plan.releaseFrame+2);}
 requestAnimationFrame(frame);
}catch(error){$('loading').textContent='Chưa tải được bộ frame/atlas. Mở qua localhost và kiểm clips.json.';console.error(error);}
