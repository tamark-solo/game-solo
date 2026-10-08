// Initial extraction only. Later edits belong in individual PNGs; pack-atlases never re-extracts art.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {resolve,join} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const root=resolve(process.argv[2]),specs=JSON.parse(await readFile(join(root,'export-spec.json'),'utf8'));
function bounds(raw,t=12){let left=raw.info.width,top=raw.info.height,right=-1,bottom=-1;for(let y=0;y<raw.info.height;y++)for(let x=0;x<raw.info.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>t){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}if(right<0)throw Error('Empty cell');return {left,top,width:right-left+1,height:bottom-top+1};}
function feet(raw,b){let l=Infinity,r=-1;for(let y=b.top+b.height-Math.max(3,Math.round(b.height*.035));y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>128){l=Math.min(l,x);r=Math.max(r,x);}return [(l+r)/2,b.top+b.height-1];}
const result={version:'1.0',tool:'built_in_imagegen',processing:'mechanical_crop_fixed_scale_anchor_export_and_pack',clips:{},qa:[]};
for(const spec of specs){
 const source=join(root,'source',spec.file),meta=await sharp(source).metadata();if(!meta.hasAlpha)throw Error('Missing alpha');
 const cells=[];
 for(let i=0;i<spec.count;i++){
  const col=i%spec.grid[0],row=Math.floor(i/spec.grid[0]),left=Math.round(col*meta.width/spec.grid[0]),top=spec.rowRanges?.[row][0]??Math.round(row*meta.height/spec.grid[1]),width=Math.round((col+1)*meta.width/spec.grid[0])-left,height=spec.rowRanges?.[row][1]??Math.round((row+1)*meta.height/spec.grid[1])-top;
  const rect=spec.cellRects?.[i]??{left,top,width,height};
  const raw=await sharp(source).extract(rect).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=bounds(raw);
  const origin=spec.origins?.[i]??(spec.kind==='character'?feet(raw,b):[width*(spec.origin?.[0]??.5),height*(spec.origin?.[1]??.5)]);
  cells.push({raw,b,origin,sourceRect:{x:rect.left,y:rect.top,w:rect.width,h:rect.height}});
 }
 let scale=spec.extent/Math.max(...cells.map(c=>spec.kind==='character'?c.b.height:spec.axis==='height'?c.b.height:Math.max(c.b.width,c.b.height)));
 for(const c of cells)for(const [dist,avail]of[[c.origin[0]-c.b.left,spec.anchor[0]-2],[c.b.left+c.b.width-c.origin[0],spec.canvas[0]-spec.anchor[0]-2],[c.origin[1]-c.b.top,spec.anchor[1]-2],[c.b.top+c.b.height-c.origin[1],spec.canvas[1]-spec.anchor[1]-2]])if(dist>0)scale=Math.min(scale,avail/dist);
 const frames=[],hashes=new Set();await mkdir(join(root,'frames',spec.id),{recursive:true});
 for(let i=0;i<cells.length;i++){
  const c=cells[i],width=Math.max(1,Math.round(c.b.width*scale)),height=Math.max(1,Math.round(c.b.height*scale)),left=Math.round(spec.anchor[0]-(c.origin[0]-c.b.left)*scale),top=Math.round(spec.anchor[1]-(c.origin[1]-c.b.top)*scale);
  if(left<0||top<0||left+width>spec.canvas[0]||top+height>spec.canvas[1])throw Error(`${spec.id}/${i+1} clips`);
  const cut=await sharp(c.raw.data,{raw:c.raw.info}).extract(c.b).resize(width,height,{kernel:spec.kind==='character'?'nearest':'lanczos3'}).png().toBuffer();
  const png=await sharp({create:{width:spec.canvas[0],height:spec.canvas[1],channels:4,background:'#00000000'}}).composite([{input:cut,left,top}]).png().toBuffer(),file=`frames/${spec.id}/${String(i+1).padStart(3,'0')}.png`;
  await writeFile(join(root,file),png);hashes.add(createHash('sha256').update(png).digest('hex'));frames.push({file,sourceRect:c.sourceRect,sourceOrigin:c.origin,registeredBounds:{x:left,y:top,w:width,h:height}});
 }
 if(hashes.size!==frames.length)throw Error('Repeated identical PNG');
 result.clips[spec.id]={fps:24,frameSize:spec.canvas,anchor:spec.anchor,sampling:spec.kind==='character'?'nearest':'linear',loop:!!spec.loop,durations:spec.durations??frames.map(()=>1),source:`source/${spec.file}`,sourceGrid:spec.grid,sourceSize:[meta.width,meta.height],commonScale:scale,frames};
 result.qa.push({clip:spec.id,frames:frames.length,distinctFrames:hashes.size,maxVisibleSize:[Math.max(...frames.map(f=>f.registeredBounds.w)),Math.max(...frames.map(f=>f.registeredBounds.h))],commonScale:scale});
}
await writeFile(join(root,'clips.json'),JSON.stringify(result,null,2)+'\n');await writeFile(join(root,'build-report.json'),JSON.stringify(result.qa,null,2)+'\n');
console.log(result.qa);
