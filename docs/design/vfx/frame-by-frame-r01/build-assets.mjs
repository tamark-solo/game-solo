// Mechanical export/atlas packing only. All poses and VFX silhouettes are drawn by imagegen.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
let sharp;
try{sharp=require('sharp');}catch{
 const modules=process.env.VFX_NODE_MODULES||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
 sharp=require(join(modules,'sharp'));
}
const specs=[
 {id:'wanglin-cast-east',file:'wanglin-cast-v1.png',grid:[4,3],rowRanges:[[0,373],[374,347],[721,365]],count:12,canvas:[96,96],anchor:[48,88],kind:'character',extent:80,durations:[1,1,1,1,2,1,2,2,2,1,1,1]},
 {id:'sword-charge',file:'charge-v1.png',grid:[3,2],count:6,canvas:[48,48],anchor:[24,24],kind:'effect',extent:34},
 {id:'sword-projectile',file:'projectile-v1.png',grid:[3,2],count:6,canvas:[128,64],anchor:[116,32],kind:'projectile',extent:108,loop:true},
 {id:'qi-impact',file:'impact-v1.png',grid:[4,3],count:12,canvas:[128,128],anchor:[64,64],kind:'effect',extent:72,
  origins:[[181,211],[33,213],[141,207],[19,201],[178,179],[180,181],[180,176],[171,166],[170,140],[175,161],[176,173],[174,160]]}
];
function bounds(raw,threshold=12){
 let x0=raw.info.width,y0=raw.info.height,x1=-1,y1=-1;
 for(let y=0;y<raw.info.height;y++)for(let x=0;x<raw.info.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>threshold){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 if(x1<0)throw new Error('Empty source cell');
 return {left:x0,top:y0,width:x1-x0+1,height:y1-y0+1};
}
function feet(raw,b){
 let left=Infinity,right=-1;
 const start=b.top+b.height-Math.max(3,Math.round(b.height*.035));
 for(let y=start;y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);}
 return [(left+right)/2,b.top+b.height-1];
}
function tip(raw,b){
 const solid=bounds(raw,128);let sum=0,total=0;
 for(let y=solid.top;y<solid.top+solid.height;y++)for(let x=solid.left+solid.width-4;x<solid.left+solid.width;x++){
  const i=(y*raw.info.width+x)*4,a=raw.data[i+3];if(a>128){sum+=y*a;total+=a;}
 }
 return [solid.left+solid.width-1,total?sum/total:b.top+b.height/2];
}
const result={version:'1.0',tool:'built_in_imagegen',processing:'mechanical_crop_fixed_scale_anchor_export_and_pack',clips:{},qa:[]};
const only=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7);
for(const spec of specs.filter(spec=>!only||spec.id===only)){
 const source=resolve(root,'source',spec.file),meta=await sharp(source).metadata();
 if(!meta.hasAlpha)throw new Error(spec.id+' source has no alpha');
 const cells=[];
 for(let i=0;i<spec.count;i++){
  const col=i%spec.grid[0],row=Math.floor(i/spec.grid[0]);
  const left=Math.round(col*meta.width/spec.grid[0]),top=spec.rowRanges?.[row][0]??Math.round(row*meta.height/spec.grid[1]);
  const width=Math.round((col+1)*meta.width/spec.grid[0])-left,height=spec.rowRanges?.[row][1]??Math.round((row+1)*meta.height/spec.grid[1])-top;
  const raw=await sharp(source).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const b=bounds(raw),origin=spec.kind==='character'?feet(raw,b):spec.kind==='projectile'?tip(raw,b):(spec.origins?.[i]||[width/2,height/2]);
  cells.push({raw,b,origin,sourceRect:{x:left,y:top,w:width,h:height}});
 }
 const maxHeight=Math.max(...cells.map(c=>c.b.height)),maxExtent=Math.max(...cells.map(c=>Math.max(c.b.width,c.b.height)));
 let scale=spec.kind==='character'?spec.extent/maxHeight:spec.kind==='projectile'?spec.extent/Math.max(...cells.map(c=>c.b.width)):spec.extent/maxExtent;
 // One common scale for every frame, including near-empty tails. Never normalize frames individually.
 for(const c of cells){
  const limits=[
   [c.origin[0]-c.b.left,spec.anchor[0]-2],
   [c.b.left+c.b.width-c.origin[0],spec.canvas[0]-spec.anchor[0]-2],
   [c.origin[1]-c.b.top,spec.anchor[1]-2],
   [c.b.top+c.b.height-c.origin[1],spec.canvas[1]-spec.anchor[1]-2]
  ];
  for(const [distance,available] of limits)if(distance>0)scale=Math.min(scale,available/distance);
 }
 const frames=[],hashes=new Set();const dir=resolve(root,'frames',spec.id);await mkdir(dir,{recursive:true});
 for(let i=0;i<cells.length;i++){
  const c=cells[i],b=c.b;
  const width=Math.max(1,Math.round(b.width*scale)),height=Math.max(1,Math.round(b.height*scale));
  const left=Math.round(spec.anchor[0]-(c.origin[0]-b.left)*scale),top=Math.round(spec.anchor[1]-(c.origin[1]-b.top)*scale);
  if(left<0||top<0||left+width>spec.canvas[0]||top+height>spec.canvas[1])throw new Error(`${spec.id} frame ${i+1} clips after registration`);
  const cut=await sharp(c.raw.data,{raw:c.raw.info}).extract(b).resize(width,height,{kernel:spec.kind==='character'?'nearest':'lanczos3',fit:'fill'}).png().toBuffer();
  const png=await sharp({create:{width:spec.canvas[0],height:spec.canvas[1],channels:4,background:'#00000000'}}).composite([{input:cut,left,top}]).png().toBuffer();
  const frameFile=`frames/${spec.id}/${String(i+1).padStart(3,'0')}.png`;await writeFile(resolve(root,frameFile),png);
  hashes.add(createHash('sha256').update(png).digest('hex'));
  frames.push({file:frameFile,sourceRect:c.sourceRect,sourceOrigin:c.origin,registeredBounds:{x:left,y:top,w:width,h:height}});
 }
 const columns=4,padding=2,cellW=spec.canvas[0]+padding*2,cellH=spec.canvas[1]+padding*2;
 const rows=Math.ceil(frames.length/columns),atlasFile=`atlases/${spec.id}.png`;await mkdir(resolve(root,'atlases'),{recursive:true});
 const atlas=await sharp({create:{width:columns*cellW,height:rows*cellH,channels:4,background:'#00000000'}}).composite(frames.map((f,i)=>({input:resolve(root,f.file),left:(i%columns)*cellW+padding,top:Math.floor(i/columns)*cellH+padding}))).png().toBuffer();
 await writeFile(resolve(root,atlasFile),atlas);
 result.clips[spec.id]={fps:24,frameSize:spec.canvas,anchor:spec.anchor,sampling:spec.kind==='character'?'nearest':'linear',loop:!!spec.loop,durations:spec.durations||frames.map(()=>1),atlas:atlasFile,atlasSize:[columns*cellW,rows*cellH],padding,source:`source/${spec.file}`,sourceGrid:spec.grid,sourceSize:[meta.width,meta.height],commonScale:scale,frames:frames.map((f,i)=>({...f,rect:{x:(i%columns)*cellW+padding,y:Math.floor(i/columns)*cellH+padding,w:spec.canvas[0],h:spec.canvas[1]}}))};
 result.qa.push({clip:spec.id,frames:frames.length,distinctFrames:hashes.size,maxVisibleSize:[Math.max(...frames.map(f=>f.registeredBounds.w)),Math.max(...frames.map(f=>f.registeredBounds.h))],commonScale:scale});
 if(hashes.size!==frames.length)throw new Error(spec.id+' contains duplicate exported images');
 console.log(`${spec.id}: ${frames.length} distinct frames, common scale ${scale.toFixed(4)}, atlas ${columns*cellW}x${rows*cellH}`);
}
await writeFile(resolve(root,'clips.json'),JSON.stringify(result,null,2)+'\n');
await writeFile(resolve(root,'build-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),...result.qa.reduce((a,q)=>(a[q.clip]=q,a),{})},null,2)+'\n');
