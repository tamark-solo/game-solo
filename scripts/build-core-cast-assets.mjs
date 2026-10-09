// Mechanical image export/registration only. ImageGen draws every pose.
// --references prepares native direction references; --export is initial extraction;
// --pack only repacks canonical PNG frames and preserves artist edits.
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=require(join(process.env.VFX_NODE_MODULES||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'sharp'));}
const root=resolve('docs/design/characters/core-cast-v1');await mkdir(root,{recursive:true});
const actors={wang:'CHR-WANG-LIN-CHIBI',situ:'CHR-SITU-NAN',li:'CHR-LI-MUWAN'};
const catalog=JSON.parse(await readFile('client/public/assets/catalog.json','utf8'));
if(process.argv.includes('--references')){
  await mkdir(resolve(root,'references'),{recursive:true});
  for(const [short,id] of Object.entries(actors)){
    const def=catalog.actors.find(a=>a.id===id),meta=JSON.parse(await readFile(def.sourcePath,'utf8'));
    for(const direction of ['south','west','east','north']){
      const rect=meta.frames[meta.animations[`stand_${direction}`][0]].frame;
      await sharp(resolve(dirname(def.sourcePath),'atlas.png')).extract({left:rect.x,top:rect.y,width:rect.w,height:rect.h})
        .resize(rect.w*6,rect.h*6,{kernel:'nearest'}).png().toFile(resolve(root,'references',`${short}-${direction}.png`));
    }
  }
  console.log('Prepared 12 native direction references.');process.exit(0);
}
function bounds(raw,threshold=12){
  let x0=raw.info.width,y0=raw.info.height,x1=-1,y1=-1;
  for(let y=0;y<raw.info.height;y++)for(let x=0;x<raw.info.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>threshold){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(x1<0)throw new Error('Empty sprite cell');return {left:x0,top:y0,width:x1-x0+1,height:y1-y0+1};
}
function feet(raw,b){
  let x0=Infinity,x1=-1;const top=b.top+b.height-Math.max(3,Math.round(b.height*.035));
  for(let y=top;y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>128){x0=Math.min(x0,x);x1=Math.max(x1,x);}
  if(x1<0)throw new Error('Missing foot pixels');return [(x0+x1)/2,b.top+b.height-1];
}
const durations={sword:[1,1,2,2,2,2,3,3],thunder:[1,2,2,3,2,2,3,2],wind:[1,1,1,1,3,3,2,2]};
let data;
if(process.argv.includes('--export')){
  const sources=JSON.parse(await readFile(resolve(root,'sources.json'),'utf8'));
  data={version:'1.0.0',tool:'built_in_imagegen',processing:'mechanical_crop_common_scale_foot_registration',artApproved:false,clips:{},bindings:{sword:{},thunder:{},wind:{}},qa:[]};
  for(const source of sources){
    const input=resolve(root,source.file),meta=await sharp(input).metadata();if(!meta.hasAlpha)throw new Error(`${source.file}: alpha required`);
    const cw=Math.floor(meta.width/8),ch=Math.floor(meta.height/3),cells=[];
    for(let row=0;row<3;row++)for(let column=0;column<8;column++){
      const rect={left:column*cw,top:row*ch,width:cw,height:ch};
      const raw=await sharp(input).extract(rect).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      const b=bounds(raw),origin=feet(raw,b);cells.push({row,column,rect,b,origin});
    }
    // One scale for the whole source sheet. Never scale each pose by its bounding box.
    const scale=80/Math.max(...cells.map(c=>c.b.height));
    for(const [row,skill] of ['sword','thunder','wind'].entries()){
      const rowCells=cells.filter(c=>c.row===row);
      const extent=Math.max(...rowCells.map(c=>Math.max(c.origin[0]-c.b.left,c.b.left+c.b.width-c.origin[0])*scale));
      const id=`${source.actor}-${skill}-${source.direction}`,canvas=[Math.max(skill==='wind'?112:96,Math.ceil((extent*2+4)/8)*8),96],anchor=[canvas[0]/2,88];
      const hoverHeight=source.actor==='situ'?4:0;
      const clip={fps:24,frameSize:canvas,anchor,hoverHeight,sampling:'nearest',loop:false,durations:durations[skill],atlas:`atlases/${id}.webp`,atlasSize:[(canvas[0]+4)*4,200],frames:[],sockets:[],source:source.file,commonScale:scale};
      await mkdir(resolve(root,'frames',id),{recursive:true});
      for(const cell of cells.filter(c=>c.row===row)){
        const w=Math.max(1,Math.round(cell.b.width*scale)),h=Math.max(1,Math.round(cell.b.height*scale));
        const sprite=await sharp(input).extract({left:cell.rect.left+cell.b.left,top:cell.rect.top+cell.b.top,width:cell.b.width,height:cell.b.height}).resize(w,h).png().toBuffer();
        const left=Math.round(anchor[0]-(cell.origin[0]-cell.b.left)*scale),top=Math.round(anchor[1]-hoverHeight-(cell.origin[1]-cell.b.top)*scale);
        if(left<0||top<0||left+w>canvas[0]||top+h>canvas[1])throw new Error(`${id} F${cell.column+1}: registration clips body ${JSON.stringify({left,top,w,h})}`);
        const file=`frames/${id}/${String(cell.column+1).padStart(3,'0')}.png`;
        const png=await sharp({create:{width:canvas[0],height:canvas[1],channels:4,background:'#00000000'}}).composite([{input:sprite,left,top}]).png().toBuffer();
        await writeFile(resolve(root,file),png);
        clip.frames.push({file,rect:{x:(cell.column%4)*(canvas[0]+4)+2,y:Math.floor(cell.column/4)*100+2,w:canvas[0],h:canvas[1]},sourceRect:cell.rect,sourceOrigin:cell.origin,registeredBounds:{left,top,width:w,height:h}});
        const reach=[12,14,18,24,40,40,22,12][cell.column],height=[25,34,40,46,36,36,30,25][cell.column];
        const socket=source.direction==='east'?[reach,-height]:source.direction==='west'?[-reach,-height]:source.direction==='north'?[6,-height-12]:[6,-height+8];clip.sockets.push(socket);
        data.qa.push({id,frame:cell.column+1,bodyHeight:h,bodyWidth:w,anchor,transparentCanvas:true});
      }
      data.clips[id]=clip;data.bindings[skill][actors[source.actor]]??={};data.bindings[skill][actors[source.actor]][source.direction]=id;
    }
  }
  await writeFile(resolve(root,'clips.json'),JSON.stringify(data,null,2)+'\n');
}else if(process.argv.includes('--pack'))data=JSON.parse(await readFile(resolve(root,'clips.json'),'utf8'));
else throw new Error('Use --references, --export or --pack.');
await mkdir(resolve(root,'atlases'),{recursive:true});
for(const [id,clip] of Object.entries(data.clips)){
  for(const f of clip.frames){const meta=await sharp(resolve(root,f.file)).metadata();if(meta.width!==clip.frameSize[0]||meta.height!==clip.frameSize[1]||!meta.hasAlpha)throw new Error(`${f.file}: invalid canonical frame`);}
  const bytes=await sharp({create:{width:clip.atlasSize[0],height:clip.atlasSize[1],channels:4,background:'#00000000'}})
    .composite(clip.frames.map(f=>({input:resolve(root,f.file),left:f.rect.x,top:f.rect.y}))).webp({lossless:true,effort:6}).toBuffer();
  await writeFile(resolve(root,clip.atlas),bytes);clip.sha256=createHash('sha256').update(bytes).digest('hex');clip.bytes=bytes.length;
}
await writeFile(resolve(root,'clips.json'),JSON.stringify(data,null,2)+'\n');
console.log(`Packed ${Object.keys(data.clips).length} clips, ${Object.values(data.clips).reduce((s,c)=>s+c.frames.length,0)} native frames.`);
