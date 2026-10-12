// Art review only: no gameplay, transport, navigation, persistence or authored-map access.
const canvas=document.getElementById('map'),ctx=canvas.getContext('2d');
const world=[3072,2048],zones=[
 {id:'gate',label:'01 · Tiếp dẫn',point:[1550,1795]},
 {id:'square',label:'02 · Sân trung tâm',point:[1550,1100]},
 {id:'meditation',label:'03 · Thổ nạp',point:[715,1010]},
 {id:'training',label:'04 · Luyện thuật',point:[2560,900]},
 {id:'preparation',label:'05 · Chuẩn bị',point:[2460,1540]},
 {id:'hall',label:'06 · Chính điện',point:[1535,610]}
];
let overview=true,foot=[1550,1190],center=[...foot],scale=1,width=1,height=1,ready=false,drag;
const picture=new Image(),actors=[];
const load=async(path)=>{const img=new Image();img.src=path;await img.decode();return img;};
const screen=([x,y])=>[(x-center[0])*scale+width/2,(y-center[1])*scale+height/2];
function paint(){
 if(!ready)return;
 const dpr=Math.min(devicePixelRatio||1,2);width=canvas.clientWidth;height=canvas.clientHeight;
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 scale=overview?Math.min(width/world[0],height/world[1]):1;
 if(overview)center=[world[0]/2,world[1]/2];
 ctx.fillStyle='#0a1e25';ctx.fillRect(0,0,width,height);
 const [x,y]=screen([0,0]);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(picture,x,y,world[0]*scale,world[1]*scale);
 if(document.getElementById('sprites').checked)actors.forEach((img,i)=>{
  const p=screen([foot[0]+(i-1)*84,foot[1]]);ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#08262c44';ctx.beginPath();ctx.ellipse(p[0],p[1],12*scale,4*scale,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(img,0,0,64,96,Math.round(p[0]-32*scale),Math.round(p[1]-88*scale),64*scale,96*scale);
 });
 if(document.getElementById('zones').checked)zones.forEach(zone=>{
  const p=screen(zone.point);if(p[0]<0||p[0]>width||p[1]<0||p[1]>height)return;
  ctx.font='600 12px Segoe UI,sans-serif';const w=ctx.measureText(zone.label).width+20;
  const lx=Math.max(5,Math.min(width-w-5,p[0]-w/2)),ly=Math.max(5,Math.min(height-30,p[1]-26));
  ctx.fillStyle='#0e302aee';ctx.strokeStyle='#c6b176';ctx.fillRect(lx,ly,w,28);ctx.strokeRect(lx,ly,w,28);ctx.fillStyle='#f5dfb3';ctx.fillText(zone.label,lx+10,ly+18);
 });
 document.getElementById('camera').textContent=overview?`Toàn cảnh · ${scale.toFixed(2)}× world dự kiến`:'Tỷ lệ dự kiến 1× · sprite 64 × 96 · nguồn concept phóng 2×';
 document.getElementById('overview').setAttribute('aria-pressed',String(overview));document.getElementById('native').setAttribute('aria-pressed',String(!overview));
}
document.getElementById('overview').onclick=()=>{overview=true;paint();};
document.getElementById('native').onclick=()=>{overview=false;center=[...foot];paint();};
for(const id of ['zones','sprites'])document.getElementById(id).onchange=paint;
document.querySelectorAll('[data-zone]').forEach(button=>button.onclick=()=>{
 const zone=zones.find(z=>z.id===button.dataset.zone);foot=[...zone.point];if(!overview)center=[...foot];paint();canvas.scrollIntoView({block:'center'});
});
canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,center:[...center],moved:false};canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;if(!overview&&drag.moved){center=[Math.max(0,Math.min(world[0],drag.center[0]-dx)),Math.max(0,Math.min(world[1],drag.center[1]-dy))];paint();}});
canvas.addEventListener('pointerup',event=>{if(!drag)return;if(!drag.moved){const rect=canvas.getBoundingClientRect();foot=[Math.max(32,Math.min(world[0]-32,(event.clientX-rect.left-width/2)/scale+center[0])),Math.max(88,Math.min(world[1]-8,(event.clientY-rect.top-height/2)/scale+center[1]))];paint();}drag=undefined;});
canvas.addEventListener('pointercancel',()=>drag=undefined);
new ResizeObserver(paint).observe(canvas);
try{
 picture.src='concept.webp';await picture.decode();
 for(const id of ['CHR-WANG-LIN-CHIBI','CHR-LI-MUWAN','CHR-SITU-NAN'])actors.push(await load('../../../../client/public/assets/'+id+'/atlas.png'));
 ready=true;paint();
}catch(error){document.getElementById('camera').textContent='Không tải được ảnh đối chiếu. Mở trực tiếp ảnh nguồn để xem concept.';document.getElementById('camera').classList.add('error');console.error(error);}
