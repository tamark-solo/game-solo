const read=async p=>{const r=await fetch(p);if(!r.ok)throw Error('Không đọc được: '+p);return r.json();};
const production=await read('./production.json'),$=id=>document.getElementById(id);
const rows=[{name:'Vương Lâm · Pixel02',path:'../wang-lin-pixel-production-v2/masters/southeast.png',pivot:[32,88],canvas:[64,96]}, {name:'Hắc Ấn02 · trước',path:production.previousConcept.sprite,pivot:production.previousConcept.pivot,canvas:production.previousConcept.canvas},{name:'Hắc Ấn03 · mới',path:production.sprite,pivot:production.pivot,canvas:production.canvas}];
const images=new Map(),masks=new Map();let zoom=1;
const load=async path=>{const im=new Image();im.src=path;await im.decode();images.set(path,im);};
const mapPath='../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';await Promise.all([...rows.map(r=>r.path),mapPath].map(load));
$('measure').textContent=`Thân ${production.measuredBodyHeightPx}px · canvas ${production.canvas.join('×')} · chân (${production.pivot.join(', ')}) · hướng Đông Nam / neutral.`;
const mask=path=>{if(masks.has(path))return masks.get(path);const im=images.get(path),cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const c=cv.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#23372f';c.fillRect(0,0,cv.width,cv.height);masks.set(path,cv);return cv;};
function draw(){const c=$('stage').getContext('2d'),scene=$('scene').value;c.imageSmoothingEnabled=false;c.clearRect(0,0,1000,520);
 if(scene==='map')c.drawImage(images.get(mapPath),1116+(1-1/zoom)*500,602+(1-1/zoom)*260,1000/zoom,520/zoom,0,0,1000,520);else{c.fillStyle=scene==='light'?'#e6e0ca':'#263c32';c.fillRect(0,0,1000,520);c.strokeStyle=scene==='light'?'#c9c5ad':'#40584a';for(let x=0;x<1000;x+=32*zoom){c.beginPath();c.moveTo(x,0);c.lineTo(x,520);c.stroke();}for(let y=0;y<520;y+=32*zoom){c.beginPath();c.moveTo(0,y);c.lineTo(1000,y);c.stroke();}}
 c.fillStyle='#152a22e8';c.fillRect(16,16,535,57);c.font='15px system-ui';c.textAlign='left';c.fillStyle='#ead9ad';c.fillText(`Camera ${zoom}× · cả ba thân80 · không fit đầu/thân riêng`,29,40);c.font='12px system-ui';c.fillText('Thân03 đã duyệt; bộ chiêu, motion/VFX là bước tiếp.',29,61);
 rows.forEach((r,i)=>{const x=160+i*335,y=430,im=$('silhouette').checked?mask(r.path):images.get(r.path),left=Math.round(x-r.pivot[0]*zoom),top=Math.round(y-r.pivot[1]*zoom);
  if($('shadows').checked){c.fillStyle='#162b2355';c.beginPath();c.ellipse(x,y+1,16*zoom,4*zoom,0,0,Math.PI*2);c.fill();}
  c.drawImage(im,left,top,im.width*zoom,im.height*zoom);
  if($('frames').checked){c.strokeStyle='#a1723b99';c.strokeRect(left,top,r.canvas[0]*zoom,r.canvas[1]*zoom);}
  if($('roots').checked){c.strokeStyle='#b34531';c.beginPath();c.moveTo(x-5,y);c.lineTo(x+5,y);c.moveTo(x,y-5);c.lineTo(x,y+5);c.stroke();}
  c.font='13px system-ui';c.textAlign='center';const w=c.measureText(r.name).width;c.fillStyle='#142a23ec';c.fillRect(x-w/2-10,y+17,w+20,26);c.fillStyle='#efdfba';c.fillText(r.name,x,y+35);
 });document.body.dataset.zoom=String(zoom);document.body.dataset.scene=scene;
}
for(const b of document.querySelectorAll('button[data-zoom]'))b.onclick=()=>{zoom=Number(b.dataset.zoom);for(const x of document.querySelectorAll('button[data-zoom]'))x.setAttribute('aria-pressed',x===b);draw();};
for(const id of ['scene','roots','shadows','frames','silhouette'])$(id).onchange=draw;
draw();document.body.dataset.ready='true';
