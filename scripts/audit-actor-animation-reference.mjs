// Read-only study of user-supplied references. Never copies them to runtime assets.
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {sharp} from './actor-sprite-tools.mjs';
const referenceRoot='docs/art_reference',out='artifacts/animation-reference-audit';
await mkdir(out,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const reports=[];
for(const entry of await readdir(referenceRoot,{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const dir=join(referenceRoot,entry.name),manifest=await readFile(join(dir,'character.json'));
 const c=JSON.parse(manifest),sheets=[],errors=[];
 for(const m of c.motions)for(const layer of m.layers){
  const file=join(dir,layer.file);
  try{const bytes=await readFile(file),meta=await sharp(bytes).metadata();sheets.push({motion:m.key,slot:layer.slot,file:layer.file,size:[meta.width,meta.height],expected:[c.cell.width*m.frames,c.cell.height*m.directions.length],sha256:sha(bytes)});}
  catch(e){errors.push({motion:m.key,file:layer.file,error:String(e)});}
 }
 let provenance;try{provenance=JSON.parse(await readFile(join(dir,'PROVENANCE.json'),'utf8'));}catch{}
 reports.push({dir:entry.name,manifestSha256:sha(manifest),id:c.id,cell:c.cell,pivot:c.pivot,scale:c.scale,sockets:c.sockets,
  motions:c.motions.map(m=>({key:m.key,frames:m.frames,fps:m.fps,loop:m.loop,directions:m.directions,layers:m.layers.map(l=>({slot:l.slot,order:l.order,file:l.file})),events:m.events})),
  presentation:c.presentation,weaponVariants:c.weaponVariants?.length??0,sheets,errors,provenance});
}
const root='docs/design/characters/wang-lin-pixel-production-v2',windRoot='docs/design/characters/wang-lin-pixel-wind-v1',catalog=JSON.parse(await readFile(root+'/catalog.json','utf8')),wind=JSON.parse(await readFile(windRoot+'/catalog.json','utf8'));
const rows=[],items=[],width=1024,cell=160,rowHeight=124;
function label(text,x,y){return {input:Buffer.from(`<svg width="${width}" height="28"><text x="${x}" y="${y}" fill="#e9dcb7" font-size="13" font-family="Segoe UI">${text}</text></svg>`),left:0,top:0};}
async function row(title,frames,scale=1){
 const y=rows.length*rowHeight+40;rows.push(title);
 items.push({input:Buffer.from(`<svg width="${width}" height="28"><text x="12" y="19" fill="#e9dcb7" font-size="13" font-family="Segoe UI">${title.replaceAll('&','&amp;')}</text></svg>`),left:0,top:y-25});
 for(let i=0;i<frames.length;i++){
  const f=frames[i],b=await sharp(f.bytes).resize(Math.round(f.size[0]*scale),Math.round(f.size[1]*scale),{kernel:'nearest'}).png().toBuffer(),x=120+i*cell,ground=y+86;
  items.push({input:b,left:Math.round(x-f.pivot[0]*scale),top:Math.round(ground-f.pivot[1]*scale)});
  items.push({input:Buffer.from(`<svg width="${cell}" height="18"><text x="80" y="13" text-anchor="middle" fill="#adc4c0" font-size="11" font-family="Segoe UI">${f.label}</text></svg>`),left:x-80,top:ground+8});
 }
}
for(const d of ['south','east','southeast','northwest']){
 const clips=['idle','cast_forward','cast_point','dash'].map(a=>a==='dash'?wind.clips[`dash-${d}`]:catalog.clips[`${a}-${d}`]);
 const frames=[];
 for(const [i,c] of clips.entries())for(const index of (i===0?[0]:i===3?[0]:[0,c.frames.length-1])){frames.push({bytes:await readFile((c.action==='dash'?windRoot:root)+'/'+c.frames[index].file),size:c.frameSize,pivot:c.pivot,label:`${c.action} ${index+1}`});}
 await row('Wang Lin / '+d+' / native 1x',frames);
}
for(const d of ['character-runtime','character-runtime-kiem-tu-pixellab-luyen-khi','character-runtime-quyen-tu-pixellab']){
 const dir=join(referenceRoot,d),c=JSON.parse(await readFile(join(dir,'character.json'),'utf8')),frames=[];
 for(const key of ['idle','skill_melee','skill_ranged','dash']){
  const m=c.motions.find(m=>m.key===key),layer=m.layers.find(l=>l.slot==='skin');
  for(const index of(key==='idle'?[0]:key==='dash'?[0]:[0,m.frames-1])){
   const bytes=await sharp(join(dir,layer.file)).extract({left:index*c.cell.width,top:0,width:c.cell.width,height:c.cell.height}).png().toBuffer();
   frames.push({bytes,size:[c.cell.width,c.cell.height],pivot:[c.pivot.x*c.cell.width,c.pivot.y*c.cell.height],label:`${key} ${index+1}`});
  }
 }
 await row('Reference / '+d+' / declared actor scale',frames,c.scale);
}
const height=rows.length*rowHeight+50;
const guides=Buffer.from(`<svg width="${width}" height="${height}">${rows.map((_,i)=>`<path d="M0 ${i*rowHeight+126}.5 H${width}" stroke="#5d7770" stroke-width="1"/>`).join('')}</svg>`);
await sharp({create:{width,height,channels:4,background:'#192925'}}).composite([{input:guides,left:0,top:0},...items]).png().toFile(out+'/scale-comparison.png');
await sharp(out+'/scale-comparison.png').resize(width*2,height*2,{kernel:'nearest'}).png().toFile(out+'/scale-comparison-2x.png');
await writeFile(out+'/reference-audit.json',JSON.stringify({date:'2026-10-12',referenceRoot:resolve(referenceRoot),policy:'Reference-only, manifests and raster read without modification; no external runtime code is available here.',reports},null,2)+'\n');
console.log(JSON.stringify({out,references:reports.map(r=>({dir:r.dir,cell:r.cell,pivot:r.pivot,scale:r.scale,motions:r.motions.length,layerSheets:r.sheets.length,errors:r.errors,dimensionMismatch:r.sheets.filter(s=>s.size.join()!==s.expected.join()).map(s=>s.file),weaponVariants:r.weaponVariants}))},null,2));
