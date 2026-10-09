// Import metadata only: keep the authored PNG/WebP bytes, canvas, scale and foot registration.
// Equal source-sheet rows can include detached feet from the preceding row. Bound the
// visible rectangle of each pose; cut detached neighbouring pieces only after
// proving the cutout contains no opaque pixel of the main character component.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=require(join(process.env.VFX_NODE_MODULES||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'sharp'));}
const root=resolve('docs/design/characters/core-cast-v1'),data=JSON.parse(await readFile(join(root,'clips.json'),'utf8'));
const checks=[];
function bodyBounds(rgba,w,h){
  const seen=new Uint8Array(w*h),parts=[];let main;
  for(let start=0;start<w*h;start++){
    if(seen[start]||rgba[start*4+3]<=12)continue;
    seen[start]=1;const queue=[start];let top=h,bottom=-1,left=w,right=-1;
    for(let n=0;n<queue.length;n++){
      const i=queue[n],x=i%w,y=Math.floor(i/w);top=Math.min(top,y);bottom=Math.max(bottom,y);left=Math.min(left,x);right=Math.max(right,x);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const a=x+dx,b=y+dy,j=b*w+a;if(a<0||b<0||a>=w||b>=h||seen[j]||rgba[j*4+3]<=12)continue;
        seen[j]=1;queue.push(j);
      }
    }
    const part={left,right,top,bottom,pixels:queue.length,indices:queue};parts.push(part);
    if(!main||queue.length>main.pixels)main=part;
  }
  if(!main||main.pixels<100)throw Error('Missing single character body');
  return {main,parts:parts.filter(p=>p!==main&&p.pixels>=4)};
}
for(const [id,c] of Object.entries(data.clips)){
  c.frameCrops=[];c.frameCutouts=[];
  for(const [index,f] of c.frames.entries()){
    const raw=await sharp(join(root,f.file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const {main:body,parts}=bodyBounds(raw.data,raw.info.width,raw.info.height);
    if(Math.abs(body.bottom-(88-c.hoverHeight))>1)throw Error(`${id} F${index+1}: actual body foot lost registration`);
    // Preserve the anti-aliased fringe. No resampling, scale or registration changes.
    const top=Math.max(0,body.top-1),bottom=Math.min(96,body.bottom+2);
    const left=Math.max(0,body.left-1),right=Math.min(c.frameSize[0],body.right+2);
    const crop={x:left,y:top,w:right-left,h:bottom-top};c.frameCrops.push(crop);
    const cutouts=[];
    for(const part of parts){
      if(part.right<left||part.left>=right||part.bottom<top||part.top>=bottom)continue;
      // A thin neighbouring foot can share the same row as the tip of the hair.
      // Cut its local rectangle without removing any pixel of the main body.
      let cut={x:Math.max(0,part.left-1),y:Math.max(0,part.top-1),w:part.right-part.left+3,h:part.bottom-part.top+3};
      cut.w=Math.min(cut.w,raw.info.width-cut.x);cut.h=Math.min(cut.h,96-cut.y);
      const overlapsBody=r=>body.indices.some(i=>{const x=i%raw.info.width,y=Math.floor(i/raw.info.width);return x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;});
      if(overlapsBody(cut))cut={x:part.left,y:part.top,w:part.right-part.left+1,h:part.bottom-part.top+1};
      if(overlapsBody(cut))throw Error(`${id} F${index+1}: cutout intersects body; author crop required`);
      cutouts.push(cut);
    }
    c.frameCutouts.push(cutouts);
    let excludedPixels=0;
    for(let y=0;y<96;y++)for(let x=0;x<raw.info.width;x++)if((x<left||x>=right||y<top||y>=bottom||cutouts.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h))&&raw.data[(y*raw.info.width+x)*4+3]>12)excludedPixels++;
    const {indices,...bounds}=body;checks.push({clip:id,index,body:bounds,crop,cutouts,excludedPixels});
  }
  if(!c.frameCutouts.some(r=>r.length))delete c.frameCutouts;
}
data.cropPolicy='single_body_rectangle_with_1px_alpha_fringe_and_non_body_cutouts';
await writeFile(join(root,'clips.json'),JSON.stringify(data,null,2)+'\n');
await writeFile(join(root,'frame-crop-verification.json'),JSON.stringify({date:new Date().toISOString(),artBytesChanged:false,
  policy:data.cropPolicy,frames:checks.length,affectedFrames:checks.filter(c=>c.excludedPixels).length,
  excludedPixels:checks.reduce((n,c)=>n+c.excludedPixels,0),checks},null,2)+'\n');
console.log(JSON.stringify({frames:checks.length,affectedFrames:checks.filter(c=>c.excludedPixels).length,artBytesChanged:false}));
