const $=id=>document.getElementById(id);
const canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:false});
const DURATION=.68,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t,smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Không tải được '+src));i.src=src;});
const profiles={
 character:{label:'Nhân vật',kind:'sprite',height:96,width:64,hitOffset:[-6,-42]},
 pvp:{label:'PvP',kind:'sprite',height:96,width:64,hitOffset:[-6,-42]},
 monster:{label:'Quái · vùng chạm thử',kind:'volume',height:64,width:56,hitOffset:[-8,-30]},
 boss:{label:'Boss · vùng chạm thử',kind:'volume',height:144,width:112,hitOffset:[-18,-82]}
};
const phaseAt=t=>t<.18?0:t<.32?1:t<.4?2:3;
const labels=['01 · Tụ khí','02 · Xuất kiếm','03 · Chạm','04 · Dư khí'];
let loaded=false,assets,manifest,time=0,last=0,idle=0,paused=false;
let view={width:960,height:640,dpr:1,zoom:1};
function resize(){
 const r=canvas.getBoundingClientRect();
 view={width:Math.max(1,Math.round(r.width)),height:Math.max(1,Math.round(r.height)),dpr:Math.min(devicePixelRatio||1,2),zoom:Number($('zoom').value)};
 canvas.width=Math.round(view.width*view.dpr);canvas.height=Math.round(view.height*view.dpr);
}
new ResizeObserver(resize).observe(canvas);
function snap(point){
 const center=manifest.camera.center,z=view.zoom;
 return point.map((v,i)=>center[i]+(Math.round((v-center[i])*z+[view.width,view.height][i]/2)-[view.width,view.height][i]/2)/z);
}
function crop(img,r,x,y,w,h,alpha=1,rotation=0,pivot=[.5,.5],nearest=false){
 if(alpha<=0||w<=0||h<=0)return;
 ctx.save();ctx.globalAlpha=clamp(alpha);ctx.imageSmoothingEnabled=!nearest;ctx.translate(x,y);ctx.rotate(rotation);
 if(!nearest&&$('mood').value==='light')ctx.filter='drop-shadow(0px 0px 0.8px rgba(19,65,50,0.85))';
 ctx.drawImage(img,r.x,r.y,r.w,r.h,-w*pivot[0],-h*pivot[1],w,h);ctx.restore();
}
function fx(name,x,y,width,alpha=1,rotation=0,height){
 const r=manifest.fx.regions[name];crop(assets.fx,r,x,y,width,height??width*r.h/r.w,alpha,rotation,r.pivot??[.5,.5]);
}
function hitFx(name,x,y,width,alpha=1,rotation=0){
 const r=manifest.hit.regions[name];crop(assets.hit,r,x,y,width,width*r.h/r.w,alpha,rotation,r.pivot??[.5,.5]);
}
function glow(x,y,r,power,color='174,230,198'){
 if(power<=0)return;
 ctx.save();ctx.globalCompositeOperation='screen';
 const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${.30*power})`);g.addColorStop(.4,`rgba(${color},${.10*power})`);g.addColorStop(1,`rgba(${color},0)`);
 ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
}
function shadow(foot){ctx.save();ctx.fillStyle='#19392e55';ctx.beginPath();ctx.ellipse(foot[0],foot[1],14,5,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function actor(img,definition,foot){
 foot=snap(foot);const [w,h]=definition.frameSize,[ax,ay]=definition.anchor;
 crop(img,{x:0,y:0,w,h},foot[0],foot[1],w,h,1,0,[ax/w,ay/h],true);
 return [foot[0]-ax,foot[1]-ay,w,h];
}
function caption(text,x,y){
 ctx.save();ctx.font=`${11/view.zoom}px Segoe UI,Arial,sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3/view.zoom;ctx.strokeStyle='#122126d9';ctx.strokeText(text,x,y);ctx.fillStyle='#f4f0de';ctx.fillText(text,x,y);ctx.restore();
}
function background(){
 if($('mood').value==='alpha'){
  const c=manifest.camera.center;const left=c[0]-view.width/(2*view.zoom),top=c[1]-view.height/(2*view.zoom);
  for(let y=Math.floor(top/16)*16;y<top+view.height/view.zoom;y+=16)for(let x=Math.floor(left/16)*16;x<left+view.width/view.zoom;x+=16){ctx.fillStyle=((x+y)/16)%2?'#34484e':'#22343c';ctx.fillRect(x,y,16,16);}
 }else{
  ctx.save();if($('mood').value==='night')ctx.filter='brightness(0.55) saturate(0.8)';
  ctx.imageSmoothingEnabled=true;ctx.drawImage(assets.scene,0,0,...manifest.scene.worldSize);ctx.restore();
 }
}
function target(profile,foot){
 shadow(foot);
 if(profile.kind==='sprite')actor(assets.target,manifest.target,foot);
 else{
  // These are explicit test hurt volumes, not generated monster/Boss artwork.
  ctx.save();ctx.strokeStyle='#d9ba80aa';ctx.fillStyle='#16262c28';ctx.lineWidth=1/view.zoom;ctx.setLineDash([4/view.zoom,4/view.zoom]);
  ctx.beginPath();ctx.ellipse(foot[0],foot[1]-profile.height/2,profile.width/2,profile.height/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
 }
 caption(profile.label,foot[0],foot[1]-profile.height-5);
}
function debug(mainRect,profile,hit){
 if(!$('bounds').checked)return;
 ctx.save();ctx.strokeStyle='#aad1e2';ctx.lineWidth=1/view.zoom;ctx.setLineDash([3/view.zoom,3/view.zoom]);ctx.strokeRect(...mainRect);
 const f=manifest.layout.targetFoot;ctx.strokeRect(f[0]-profile.width/2,f[1]-profile.height,profile.width,profile.height);
 ctx.setLineDash([]);ctx.strokeStyle='#ffdf9c';ctx.beginPath();ctx.moveTo(hit[0]-4,hit[1]);ctx.lineTo(hit[0]+4,hit[1]);ctx.moveTo(hit[0],hit[1]-4);ctx.lineTo(hit[0],hit[1]+4);ctx.stroke();ctx.restore();
}
function draw(t){
 if(!loaded)return;
 const z=view.zoom,d=view.dpr,c=manifest.camera.center;
 ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#17272d';ctx.fillRect(0,0,view.width,view.height);
 ctx.setTransform(d*z,0,0,d*z,d*(view.width/2-c[0]*z),d*(view.height/2-c[1]*z));background();
 const profile=profiles[$('target-kind').value],foot=manifest.layout.foot,tf=manifest.layout.targetFoot;
 const caster=[foot[0]+manifest.main.castSocketOffset[0],foot[1]+manifest.main.castSocketOffset[1]];
 const impact=[tf[0]+profile.hitOffset[0],tf[1]+profile.hitOffset[1]];
 const landed=$('contact').checked,decor=!$('reduced').checked;
 const angle=Math.atan2(impact[1]-caster[1],impact[0]-caster[0]);const dir=[Math.cos(angle),Math.sin(angle)];
 const gather=smooth(t/.18),release=clamp((t-.18)/.14),fade=1-smooth((t-.4)/.28),phase=phaseAt(t);
 const cfg=manifest.skillSizes;
 shadow(foot);target(profile,tf);const mainRect=actor(assets.main,manifest.main,foot);caption('Vương Lâm',foot[0],foot[1]-manifest.main.anchor[1]-4);
 const energy=t<.18?gather:t<.4?1:fade;
 glow(caster[0],caster[1],22,energy*.55);
 if(t<.18){
  fx('gather',caster[0]+8,caster[1]-2,18+gather*8,.35+gather*.3,t*1.3);
  fx('sword',caster[0]+12+gather*8,caster[1]-2,12+gather*16,gather*.9,angle);
 }else if(t<.32){
  const w=cfg.sword,tip=w*.46;
  const start=[caster[0]+dir[0]*(tip+4),caster[1]+dir[1]*(tip+4)];
  const end=[impact[0]-dir[0]*tip,impact[1]-dir[1]*tip];
  const p=[lerp(start[0],end[0],release),lerp(start[1],end[1],release)];
  const length=Math.max(25,Math.hypot(p[0]-caster[0],p[1]-caster[1]));
  fx('trail',(caster[0]+p[0])/2,(caster[1]+p[1])/2,length,decor?.8:.42,angle,cfg.trailThickness);
  if(decor){fx('sword',p[0]-dir[0]*19,p[1]-dir[1]*19-5,w,.14,angle);fx('sword',p[0]-dir[0]*34,p[1]-dir[1]*34+5,w,.08,angle);}
  fx('sword',...p,w,1,angle);glow(...p,30,.5);
 }else if(t<.4){
  const p=clamp((t-.32)/.08),w=cfg.sword;
  fx('trail',(caster[0]+impact[0])/2,(caster[1]+impact[1])/2,Math.hypot(impact[0]-caster[0],impact[1]-caster[1]),(decor?.5:.25)*(1-p),angle,cfg.trailThickness);
  fx('sword',impact[0]-dir[0]*w*.46,impact[1]-dir[1]*w*.46,w,1-p*.9,angle);
  if(landed){
   hitFx('contact',...impact,cfg.contact+p*10,1-p*.4,angle);
   hitFx('recoil',...impact,cfg.recoil*(.6+p*.4),p*.6,-p*.1);
   if(decor)hitFx('scatter',impact[0]+dir[0]*p*8,impact[1]-p*6,cfg.scatter,p*.6,angle);
   glow(...impact,48,1-p*.5,'250,226,164');
  }
 }else if(t<DURATION){
  const p=clamp((t-.4)/.28);
  if(landed){
   hitFx('residue',impact[0]+p*5,impact[1]-p*12,cfg.residue*(1+p*.2),fade*.8,-p*.1);
   hitFx('recoil',...impact,cfg.recoil*(1+p*.3),fade*.22);
   if(decor)hitFx('scatter',impact[0]+p*12,impact[1]-p*15,cfg.scatter,fade*.38,angle);
  }else{
   fx('dissolve',impact[0],impact[1]-p*7,cfg.residue,fade*.65,angle);
  }
  fx('dissolve',(caster[0]+impact[0])/2,(caster[1]+impact[1])/2,120,fade*(decor?.24:.12),angle,28);
 }
 debug(mainRect,profile,impact);
 $('phase').textContent=t>=DURATION?'Khí đã tan':labels[phase];
 $('description').textContent=t>=DURATION?'Vương Lâm · trở về trạng thái nghỉ':phase===0?'Linh khí tụ gần tay':phase===1?'Một kiếm quang xuất chiêu':phase===2?(landed?'Linh quang chạm mục tiêu':'Chiêu không trúng mục tiêu'):(landed?'Mảnh sáng và dư khí tan quanh điểm chạm':'Kiếm khí tan trên đường bay');
 $('time').textContent=`${Math.min(t,DURATION).toFixed(2).replace('.',',')} / 0,68 s`;$('seek').value=Math.round(Math.min(t,DURATION)*1000);
 document.querySelectorAll('[data-time]').forEach((b,i)=>b.classList.toggle('active',t<DURATION&&i===phase));
 $('size-info').textContent=`Frame 64 × 96 · zoom ${z}× · ${view.width} × ${view.height} CSS px`;
 Object.assign(canvas.dataset,{ready:'true',phase:String(phase),time:t.toFixed(3),frameWidth:String(mainRect[2]*z),frameHeight:String(mainRect[3]*z),zoom:String(z),cssWidth:String(view.width),cssHeight:String(view.height),target:$('target-kind').value,hit:landed?'true':'false',swordWidth:String(cfg.sword*z)});
}
function setPaused(value){paused=value;$('pause').textContent=paused?'Tiếp tục':'Tạm dừng';}
function cast(){time=0;idle=0;setPaused(false);draw(time);}
function frame(now){
 const dt=Math.min(.05,(now-last)/1000||0);last=now;
 if(loaded&&!paused&&!document.hidden){if(time<DURATION)time=Math.min(DURATION,time+dt*Number($('speed').value));else if($('loop').checked){idle+=dt;if(idle>=.85){time=0;idle=0;}}}
 draw(time);requestAnimationFrame(frame);
}
$('cast').addEventListener('click',cast);$('pause').addEventListener('click',()=>setPaused(!paused));
$('seek').addEventListener('input',()=>{time=Number($('seek').value)/1000;idle=0;setPaused(true);draw(time);});
document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{time=Number(b.dataset.time)/1000;idle=0;setPaused(true);draw(time);}));
$('zoom').addEventListener('change',()=>{resize();draw(time);});
$('view-size').addEventListener('change',()=>{
 const compact=$('view-size').value==='compact',stage=canvas.parentElement;
 stage.style.width=compact?'362px':'';stage.style.height=compact?'402px':'';
 resize();draw(time);
});
$('export').addEventListener('click',()=>{draw(time);const phase=phaseAt(time),kind=$('target-kind').value;canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`kiem-khi-r01-v2-${kind}-${phase}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);},'image/png');});
document.addEventListener('visibilitychange',()=>{last=performance.now();});
try{
 const response=await fetch('./kiem-khi-r01-source-manifest.json',{cache:'no-store'});if(!response.ok)throw new Error('Không tải được metadata nguồn');manifest=await response.json();
 const keys=['fx','hit','main','target','scene'],images=await Promise.all(keys.map(k=>image(manifest[k].file)));assets=Object.fromEntries(keys.map((k,i)=>[k,images[i]]));
 if(assets.main.width!==64||assets.main.height!==96)throw new Error('Frame Vương Lâm khác 64 × 96');
 loaded=true;resize();['cast','pause','export'].forEach(k=>$(k).disabled=false);$('loading').hidden=true;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){setPaused(true);$('loop').checked=false;time=.26;}
 draw(time);requestAnimationFrame(frame);
}catch(error){$('loading').textContent='Không nạp được nguồn ART. Kiểm tra PNG/metadata và mở bản thử qua máy chủ localhost.';$('loading').classList.add('error');console.error(error);}
