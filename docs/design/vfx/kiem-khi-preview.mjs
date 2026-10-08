const $ = id => document.getElementById(id);
const canvas = $('scene'), ctx = canvas.getContext('2d', {alpha: false});
const W=960,H=640,DURATION=.68;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const loadImage=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Không tải được '+src));i.src=src;});
let assets,manifest,time=0,last=0,idle=0,paused=false,loaded=false;
let reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const descriptions=['Linh khí tụ về kiếm chỉ','Kiếm quang tiến theo đường đánh','Ánh chạm tập trung ở mũi kiếm','Nét khí rã dần, bụi lắng xuống'];
const phaseLabels=['01 · Tụ khí','02 · Xuất kiếm','03 · Chạm','04 · Tan khí'];
const phaseAt=t=>t<.18?0:t<.32?1:t<.4?2:3;

// Source rectangles and anchors are measured from generated PNG alpha,
// without modifying the source bitmaps. Painted pose atlas is an ART proxy.
function blit(image,r,x,y,w,h,alpha=1,angle=0,pivotX=.5,pivotY=.5){
 if(alpha<=0||w<=0||h<=0)return;
 ctx.save();ctx.globalAlpha=clamp(alpha);ctx.translate(x,y);ctx.rotate(angle);
 ctx.drawImage(image,r.x,r.y,r.w,r.h,-w*pivotX,-h*pivotY,w,h);ctx.restore();
}
function fx(name,x,y,width,alpha=1,angle=0,height){
 const r=manifest.fx.regions[name];
 blit(assets.fx,r,x,y,width,height??width*r.h/r.w,alpha,angle,r.pivot?.[0]??.5,r.pivot?.[1]??.5);
}
function glow(x,y,r,power,color='174,230,198'){
 if(power<=0)return;
 ctx.save();ctx.globalCompositeOperation='screen';
 const g=ctx.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,`rgba(${color},${.32*power})`);g.addColorStop(.35,`rgba(${color},${.12*power})`);g.addColorStop(1,`rgba(${color},0)`);
 ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
}
function background(){
 const mode=$('mood').value;
 if(mode==='alpha'){
  for(let y=0;y<H;y+=32)for(let x=0;x<W;x+=32){ctx.fillStyle=((x+y)/32)%2?'#34484e':'#22343c';ctx.fillRect(x,y,32,32);}
 }else{
  ctx.save();if(mode==='light')ctx.filter='brightness(1.65) saturate(0.75)';
  ctx.drawImage(assets.scene,0,0,W,H);ctx.restore();
 }
}
function pose(index,alpha=1){
 const r=manifest.pose.regions[index];const s=190/manifest.pose.referenceHeight;
 const anchor=r.anchor??[r.w*.5,r.h];
 blit(assets.pose,r,240,512,r.w*s,r.h*s,alpha,0,anchor[0]/r.w,anchor[1]/r.h);
}
function draw(t){
 if(!loaded)return;
 ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,W,H);background();
 const phase=phaseAt(t),decor=!$('reduced').checked;
 const caster=phase===0?manifest.layout.gather:manifest.layout.cast,hit=manifest.layout.impact;
 const angle=Math.atan2(hit[1]-caster[1],hit[0]-caster[0]);
 const direction=[Math.cos(angle),Math.sin(angle)];
 const gather=smooth(t/.18),release=clamp((t-.18)/.14),fade=1-smooth((t-.4)/.28);
 const energy=t<.18?.18+gather*.65:t<.4?1:fade;
 // A ground glow supports the generated art; the visible skill silhouettes
 // always come from the painted alpha atlas.
 glow(240,503,120,energy*.36);
 if(t>=.32)glow(hit[0],hit[1]+70,130,Math.exp(-(t-.32)*11), '245,211,151');
 ctx.save();ctx.fillStyle='#07101c66';ctx.beginPath();ctx.ellipse(240,514,49,13,0,0,Math.PI*2);ctx.fill();ctx.restore();
 let p=phase===0?1:phase<3?2:3;
 if(t>=DURATION)p=0;
 pose(p);
 if(t<.18){
  fx('gather',caster[0]+35,caster[1]+16,58+gather*24,.3+gather*.3,t*1.3);
  fx('sword',caster[0]+25+gather*16,caster[1]-4,30+gather*45,gather*.72,angle);
  glow(caster[0],caster[1],65,gather*.8);
 }else if(t<.32){
  const bladeWidth=235,tipOffset=bladeWidth*.48;
  const start=[caster[0]+tipOffset+10, caster[1]];
  const end=[hit[0]-direction[0]*tipOffset,hit[1]-direction[1]*tipOffset];
  const x=mix(start[0],end[0],release),y=mix(start[1],end[1],release);
  const tailX=caster[0]-50,tailY=caster[1]+10;
  const length=Math.max(80,x-tailX);
  fx('trail',(tailX+x)/2,(tailY+y)/2,length,decor?.85:.45,angle,125);
  if(decor){fx('sword',x-direction[0]*48,y-direction[1]*48-14,bladeWidth,.17*(1-release*.4),angle);fx('sword',x-direction[0]*86,y-direction[1]*86+15,bladeWidth,.09,angle);}
  fx('sword',x,y,bladeWidth,1,angle);glow(x,y,95,.6);
 }else if(t<.4){
  const impact=clamp((t-.32)/.08);
  fx('trail',(caster[0]+hit[0])/2,(caster[1]+hit[1])/2,hit[0]-caster[0],decor?.7*(1-impact):.35*(1-impact),angle,125);
  fx('sword',hit[0]-110,hit[1]+10,235,1-impact*.85,angle);
  fx('impact',hit[0],hit[1],95+impact*80,1-impact*.35,-.15+impact*.25);
  if(decor)fx('dust',hit[0]+15+impact*14,hit[1]+90+impact*10,95+impact*40,.75,0,65+impact*25);
  glow(hit[0],hit[1],145,1-impact*.65,'255,222,165');
 }else if(t<DURATION){
  const end=clamp((t-.4)/.28);
  fx('dissolve',(caster[0]+hit[0])/2+end*25,(caster[1]+hit[1])/2-12-end*12,420+end*65,fade*(decor?.72:.35),angle,140);
  fx('impact',hit[0],hit[1],140+end*50,fade*.3);
  if(decor)fx('dust',hit[0]+35,hit[1]+114+end*20,135+end*25,fade*.6,0,85);
  fx('gather',caster[0]+16,caster[1]+12,70,fade*.15,-end*.4);
 }
 $('phase').textContent=t>=DURATION?'Khí đã tan':phaseLabels[phase];
 $('description').textContent=t>=DURATION?'Trở về thế đứng':descriptions[phase];
 $('time').textContent=`${Math.min(t,DURATION).toFixed(2).replace('.',',')} / 0,68 s`;
 $('seek').value=Math.round(Math.min(t,DURATION)*1000);
 document.querySelectorAll('[data-time]').forEach((b,i)=>b.classList.toggle('active',t<DURATION&&i===phase));
 canvas.dataset.phase=String(phase);canvas.dataset.time=t.toFixed(3);canvas.dataset.ready='true';
}
function setPaused(value){paused=value;$('pause').textContent=paused?'Tiếp tục':'Tạm dừng';}
function cast(){time=0;idle=0;setPaused(false);draw(time);}
function frame(now){
 const dt=Math.min(.05,(now-last)/1000||0);last=now;
 if(loaded&&!paused&&!document.hidden){
  if(time<DURATION){time=Math.min(DURATION,time+dt*Number($('speed').value));}
  else if($('loop').checked){idle+=dt;if(idle>=.85){time=0;idle=0;}}
 }
 draw(time);requestAnimationFrame(frame);
}
$('cast').addEventListener('click',cast);
$('pause').addEventListener('click',()=>setPaused(!paused));
$('export').addEventListener('click',()=>{
 draw(time);
 canvas.toBlob(blob=>{
  if(!blob)return;
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`kiem-khi-r01-${phaseAt(time)}-${$('mood').value}.png`;
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 },'image/png');
});
$('seek').addEventListener('input',()=>{time=Number($('seek').value)/1000;idle=0;setPaused(true);draw(time);});
document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{time=Number(b.dataset.time)/1000;idle=0;setPaused(true);draw(time);}));
document.addEventListener('visibilitychange',()=>{last=performance.now();});
try{
 const response=await fetch('./kiem-khi-r01-source-manifest.json');if(!response.ok)throw new Error('Không tải được metadata nguồn');
 manifest=await response.json();
 const loadedImages=await Promise.all(['fx','pose','scene'].map(key=>loadImage(manifest[key].file)));
 assets=Object.fromEntries(['fx','pose','scene'].map((key,i)=>[key,loadedImages[i]]));loaded=true;
 $('cast').disabled=false;$('pause').disabled=false;$('export').disabled=false;$('loading').hidden=true;
 if(reducedMotion){setPaused(true);$('loop').checked=false;time=.26;}
 draw(time);requestAnimationFrame(frame);
}catch(error){$('loading').textContent='Không nạp được nguồn ART. Mở bản thử qua máy chủ localhost và kiểm tra các PNG/metadata cạnh trang này.';$('loading').classList.add('error');console.error(error);}
