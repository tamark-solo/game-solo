import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {sharp,components,median} from './actor-sprite-tools.mjs';
const root='docs/design/characters/wang-lin-pixel-life-v1',base='docs/design/characters/wang-lin-pixel-production-v2',p=JSON.parse(await readFile(root+'/production-plan.json'));
const sha=b=>createHash('sha256').update(b).digest('hex'),basis=JSON.parse(await readFile(root+'/basis.json'));
for(const f of basis.targets)assert.equal(sha(await readFile(f.file)),f.sha256,'Accepted player changed');
const palette=JSON.parse(await readFile(base+'/catalog.json')).palette.map(c=>[0,2,4].map(i=>parseInt(c.slice(i,i+2),16))),cache=new Map();
function quantize(raw){for(let i=0;i<raw.length;i+=4){if(raw[i+3]<128){raw.fill(0,i,i+4);continue;}const key=raw.readUIntBE(i,3);let best=cache.get(key);if(!best){best=palette.reduce((a,b)=>b.reduce((n,v,j)=>n+(v-raw[i+j])**2,0)<a.reduce((n,v,j)=>n+(v-raw[i+j])**2,0)?b:a);cache.set(key,best);}raw.set(best,i);raw[i+3]=255;}}
const clips={},sources=[],registration=[];
await mkdir(root+'/atlases',{recursive:true});await mkdir(root+'/calibration',{recursive:true});
for(const r of p.requests){const bytes=await readFile(root+'/'+r.source),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const parts=components(data,info.width,info.height).sort((a,b)=>a.top+a.height/2-b.top-b.height/2);assert.equal(parts.length,18,r.direction+' body isolation');
 const rows=[0,1,2].map(i=>parts.slice(i*6,i*6+6).sort((a,b)=>a.left-b.left)),scale=80/median(rows[0].map(b=>b.height));
 const roots=rows[0].map(b=>{let l=Infinity,h=-1;for(let y=b.top+b.height-20;y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(data[(y*info.width+x)*4+3]>=128){l=Math.min(l,x);h=Math.max(h,x);}return(l+h)/2;});
 const mappings=[];
 async function extract(row,col){const b=rows[row][col],size=[Math.round(b.width*scale),Math.round(b.height*scale)],pixels=await sharp(bytes).extract({left:b.left,top:b.top,width:b.width,height:b.height}).resize(...size,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();quantize(pixels);
  const offset=[Math.round(56+(b.left-roots[col])*scale),88-size[1]];assert.ok(offset[0]>=0&&offset[1]>=0&&offset[0]+size[0]<=112,r.direction+' life overflow '+offset+'/'+size);
  const out=await sharp({create:{width:112,height:96,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:pixels,raw:{width:size[0],height:size[1],channels:4},left:offset[0],top:offset[1]}]).png().toBuffer();
  mappings.push({row,col,sourceRect:b,sourcePivot:[roots[col],b.top+b.height],scale,offset,groundMethod:row===1?'Seated pelvis/folded-leg contact; same world foot, no body resize':'Planted soles, ground88'});return out;
 }
 await writeFile(root+'/calibration/'+r.direction+'.png',await extract(0,0));
 for(const [row,action]of [[1,'meditate'],[2,'gather']]){const id=action+'-'+r.direction,frames=[],layers=[];await mkdir(root+'/frames/'+id,{recursive:true});
  for(let col=0;col<6;col++){const buffer=await extract(row,col),file=`frames/${id}/${String(col+1).padStart(3,'0')}.png`,rect={x:2+col*116,y:2,w:112,h:96};await writeFile(root+'/'+file,buffer);frames.push({file,sha256:sha(buffer),rect});layers.push({input:buffer,left:rect.x,top:2});}
  const atlas=await sharp({create:{width:696,height:100,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png().toBuffer();await writeFile(root+'/atlases/'+id+'.png',atlas);
  clips[id]={id:'wang-pixel-life-'+id,actor:'wang',action,direction:r.direction,frameSize:[112,96],pivot:[56,88],atlas:'atlases/'+id+'.png',atlasSize:[696,100],atlasSha256:sha(atlas),frames,fps:24,durations:action==='meditate'?[8,8,8,8,8,8]:[4,4,4,4,4,4],loop:action==='meditate',holdLast:false,phases:[{at:0,label:action==='meditate'?'Thổ nạp':'Thu thập'}],artApproved:false};
 }
 sources.push({file:r.source,sha256:sha(bytes),prompt:`sources/${r.direction}.prompt.txt`,promptSha256:sha(await readFile(root+`/sources/${r.direction}.prompt.txt`)),input:r.input,inputSha256:r.inputSha256,size:[info.width,info.height]});registration.push({direction:r.direction,scale,roots,neutralHeights:rows[0].map(b=>b.height),frames:mappings});
}
await writeFile(root+'/catalog.json',JSON.stringify({version:1,id:'wang-lin-pixel-life-v1',tool:'built-in ImageGen',pixelsResampled:true,artApproved:false,ownerApproved:false,directions:p.directions,actions:p.actions,clips,sources,registration,coverage:{required:p.directions.flatMap(d=>p.actions.map(a=>a+'-'+d)),missing:[],fullPlayerActions:false}},null,2)+'\n');
const images=[];for(const [i,d]of p.directions.entries())for(const [j,a]of ['master','neutral','meditate','gather'].entries()){const file=a==='master'?base+'/masters/'+d+'.png':a==='neutral'?root+'/calibration/'+d+'.png':root+'/'+clips[a+'-'+d].frames[a==='gather'?3:0].file,pivot=a==='master'?[32,88]:[56,88];images.push({input:await readFile(file),left:148+i*116-pivot[0],top:120+j*112-pivot[1]});}
await sharp({create:{width:1076,height:464,channels:4,background:'#182b25'}}).composite([{input:Buffer.from(`<svg width="1076" height="464"><g fill="#ead8ad" font-family="Segoe UI" font-size="12">${p.directions.map((d,i)=>`<text x="${110+i*116}" y="16">${d}</text>`).join('')}${['master','neutral','meditate','gather'].map((a,i)=>`<text x="8" y="${70+i*112}">${a}</text><path d="M0 ${120+i*112}.5 H1076" stroke="#658277"/>`).join('')}</g></svg>`),left:0,top:0},...images]).png().toFile(root+'/native-life-matrix.png');
console.log({clips:Object.keys(clips).length,poses:96,commonSourceScales:registration.map(r=>r.scale)});
