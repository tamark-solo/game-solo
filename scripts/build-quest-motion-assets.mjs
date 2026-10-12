// Mechanical extraction and native foot registration. ImageGen authors the poses.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const root=resolve('docs/design/characters/quest-motion-v1');
const ids={wang:'CHR-WANG-LIN-CHIBI',situ:'CHR-SITU-NAN',li:'CHR-LI-MUWAN'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sources=[{actor:'wang',file:'wang-source-v1.png',rows:7},{actor:'situ',file:'situ-source-v2.png',rows:5,sourceHeight:1179},
  {actor:'li',file:'li-source-v1.png',rows:7},{actor:'situ',file:'situ-west-source-v3.png',rows:1,actions:['basic-west']},
  {actor:'situ',file:'situ-loops-source-v3.png',rows:2,actions:['cultivation','recovery']}];
const actions=['basic-south','basic-west','basic-east','basic-north','greeting','cultivation','recovery'];
function components({data,info}){
  const {width,height}=info,visited=new Uint8Array(width*height),queue=new Int32Array(width*height),found=[];
  for(let start=0;start<visited.length;start++){
    if(visited[start]||data[start*4+3]<64)continue;
    let head=0,tail=1,left=width,top=height,right=0,bottom=0;queue[0]=start;visited[start]=1;
    while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      for(const n of [x?p-1:-1,x<width-1?p+1:-1,y?p-width:-1,y<height-1?p+width:-1])if(n>=0&&!visited[n]&&data[n*4+3]>=64){visited[n]=1;queue[tail++]=n;}
    }
    if(tail>500)found.push({left,top,width:right-left+1,height:bottom-top+1,area:tail});
  }return found;
}
const output={version:1,tool:'built_in_imagegen',artApproved:false,ownerApproved:false,clips:{},bindings:{},sources:[],qa:[]};
for(const source of sources){
  const bytes=await readFile(join(root,source.file));let pipeline=sharp(bytes);
  if(source.sourceHeight){const meta=await pipeline.metadata();pipeline=pipeline.extract({left:0,top:0,width:meta.width,height:source.sourceHeight});}
  const raw=await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const sprites=components(raw);
  if(process.argv.includes('--inspect')){console.log(JSON.stringify({file:source.file,size:[raw.info.width,raw.info.height],sprites}));continue;}
  if(sprites.length!==source.rows*4)throw new Error(`${source.file}: ${sprites.length} silhouettes, expected ${source.rows*4}`);
  // Detect each authored silhouette, rather than divide a sheet evenly and capture
  // neighbouring-row fragments. No painting, warping or per-pose size matching.
  sprites.sort((a,b)=>(a.top+a.height/2)-(b.top+b.height/2));
  const rows=Array.from({length:source.rows},(_,i)=>sprites.slice(i*4,i*4+4).sort((a,b)=>a.left-b.left));
  output.sources.push({...source,width:raw.info.width,height:raw.info.height,sha256:hash(bytes)});
  output.bindings[ids[source.actor]]??={};
  for(let row=0;row<rows.length;row++){
    const scale=79/Math.max(...rows[row].map(s=>s.height));
    const action=(source.actions??actions)[row],clipId=`quest-${source.actor}-${action}`;
    const clip={fps:action.startsWith('basic')?10:action==='cultivation'?4:5,durations:[1,1,1,1],loop:action==='cultivation',
      frameSize:[96,96],anchor:[48,88],atlasSize:[400,100],atlasUrl:'',sampling:'nearest',frames:[],source:source.file,commonScale:scale,canonical:[]};
    await mkdir(join(root,'frames',clipId),{recursive:true});
    for(const [index,b]of rows[row].entries()){
      const foot=[];for(let y=b.top+b.height-4;y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>=128)foot.push(x);
      if(!foot.length)throw new Error(`${clipId}: foot missing`);foot.sort((a,b)=>a-b);
      const origin=[(foot[0]+foot.at(-1))/2,b.top+b.height-1],pad=1;
      const rect={left:Math.max(0,b.left-pad),top:Math.max(0,b.top-pad),width:b.width+pad*2,height:b.height+pad*2};
      rect.width=Math.min(rect.width,raw.info.width-rect.left);rect.height=Math.min(rect.height,raw.info.height-rect.top);
      const w=Math.round(rect.width*scale),h=Math.round(rect.height*scale),left=Math.round(48-(origin[0]-rect.left)*scale),top=Math.round(88-(source.actor==='situ'?4:0)-(origin[1]-rect.top)*scale);
      if(left<0||top<0||left+w>96||top+h>96)throw new Error(`${clipId}: clipped registered frame ${JSON.stringify({left,top,w,h})}`);
      const sprite=await sharp(bytes).extract(rect).resize(w,h,{kernel:'nearest'}).png().toBuffer();
      const png=await sharp({create:{width:96,height:96,channels:4,background:'#00000000'}}).composite([{input:sprite,left,top}]).png().toBuffer();
      const file=`frames/${clipId}/${String(index+1).padStart(3,'0')}.png`;await writeFile(join(root,file),png);
      clip.frames.push({x:index*100+2,y:2,w:96,h:96});clip.canonical.push(file);
      output.qa.push({clip:clipId,index,sourceRect:rect,sourceFoot:origin,registeredBounds:{left,top,width:w,height:h},sha256:hash(png)});
    }
    const atlas=await sharp({create:{width:400,height:100,channels:4,background:'#00000000'}}).composite(clip.canonical.map((file,i)=>({input:join(root,file),left:i*100+2,top:2}))).webp({lossless:true,effort:6}).toBuffer();
    await mkdir(join(root,'atlases'),{recursive:true});const file=`${clipId}.webp`;await writeFile(join(root,'atlases',file),atlas);
    clip.atlasUrl=`/assets/quest-motion/${file}?v=${hash(atlas).slice(0,16)}`;clip.sha256=hash(atlas);clip.bytes=atlas.length;
    output.clips[clipId]=clip;output.bindings[ids[source.actor]][action]=clipId;
  }
}
// Canonical QA keeps only selected frames; the rejected Situ west source is preserved.
if(process.argv.includes('--inspect'))process.exit(0);
const selected=new Map();for(const q of output.qa)selected.set(`${q.clip}:${q.index}`,q);output.qa=[...selected.values()];
await writeFile(join(root,'clips.json'),JSON.stringify(output,null,2)+'\n');
const target=resolve('client/public/assets/quest-motion');await mkdir(target,{recursive:true});
for(const clip of Object.values(output.clips))await copyFile(join(root,'atlases',clip.atlasUrl.split('/').at(-1).split('?')[0]),join(target,clip.atlasUrl.split('/').at(-1).split('?')[0]));
await copyFile(join(root,'clips.json'),join(target,'clips.json'));
console.log(`Quest motion: ${Object.keys(output.clips).length} clips / ${Object.keys(output.clips).length*4} frames, native 96×96 / foot (48,88).`);
