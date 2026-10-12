// Candidate study only; accepted sprites, runtime catalog and user references are read-only.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
try{await readFile('docs/design/characters/actor-animation-standard-v2/approval.json');throw Error('This pack is the accepted production basis. Create a new versioned pack instead of rewriting it.');}catch(e){if(e.code!=='ENOENT')throw e;}

import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp,components,median} from './actor-sprite-tools.mjs';
const root=process.argv[2]??'docs/design/characters/wang-lin-pixel-production-study-v1';
assert.ok(['docs/design/characters/wang-lin-pixel-production-study-v1','docs/design/characters/wang-lin-pixel-production-v2'].includes(root),'Unsupported pack write root');
const plan=root.endsWith('production-v2')?JSON.parse(await readFile(root+'/production-plan.json')):undefined;
const sha=b=>createHash('sha256').update(b).digest('hex');
if(!plan){let pinned;try{pinned=JSON.parse(await readFile('docs/design/characters/wang-lin-pixel-production-v2/style-basis.json'));}catch(error){if(error.code!=='ENOENT')throw error;}if(pinned?.acceptedStyleBasis)throw Error('Study01 is the pinned style basis. Export the new pack with explicit root docs/design/characters/wang-lin-pixel-production-v2; study files were not written.');}
if(plan){const basis=JSON.parse(await readFile(root+'/'+plan.basis));for(const f of basis.targets)assert.equal(sha(await readFile(f.file)),f.sha256,'Style basis changed');}
const palette=JSON.parse(await readFile('docs/design/characters/wang-lin-chibi-walk-v1/native-v2/atlas.json')).palette.filter(c=>!c.endsWith('00')).map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
const cache=new Map();function quantize(raw){for(let i=0;i<raw.length;i+=4){if(raw[i+3]<128){raw[i+3]=0;continue;}raw[i+3]=255;const k=raw.readUIntBE(i,3);let color=cache.get(k);if(!color){color=palette.reduce((best,c)=>{const dist=x=>x.reduce((n,v,j)=>n+(v-raw[i+j])**2,0);return dist(c)<dist(best)?c:best;},palette[0]);cache.set(k,color);}raw.set(color,i);}}
const actions=plan?.actions??['idle','run','cast_forward','cast_point'],directions=plan?.directions??['south','southeast'],clips={},canonical=[],sources=[],registrations=[];
const selectedRepairs=(plan?.repairs??[]).filter(r=>r.selected!==false);
const requests=[...directions.map(direction=>({id:direction,direction,sourceFile:'sources/'+direction+'-v1.png',promptFile:'sources/'+direction+'.prompt.txt',rowCount:4,bindings:actions.map((action,row)=>({action,row,translationNativeX:plan?.clipTranslations?.[direction]?.[action]??0})).filter(b=>b.action!=='run'||!selectedRepairs.some(r=>r.direction===direction))})),...selectedRepairs.map(r=>({...r,id:'run-'+r.direction,rowCount:2,bindings:[{action:'run',row:1,translationNativeX:r.translationNativeX??0}]}))];
for(const request of requests){const {direction}=request;
const source=await readFile(root+'/'+request.sourceFile),{data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const bodies=components(data,info.width,info.height).sort((a,b)=>a.top+a.height/2-b.top-b.height/2);assert.equal(bodies.length,request.rowCount*6,request.id+' body count');
const rows=Array.from({length:request.rowCount},(_,r)=>bodies.slice(r*6,r*6+6).sort((a,b)=>a.left-b.left));
const scale=80/median(rows[0].map(b=>b.height)),floors=rows.map(r=>median(r.map(b=>b.top+b.height-1)));
const roots=rows[0].map(b=>{let l=Infinity,r=-1;for(let y=b.top+b.height-20;y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(data[(y*info.width+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);}return(l+r)/2;});
const mapped=[];
for(const {row:r,action,translationNativeX=0}of request.bindings){
 const id=action+'-'+direction,size=action.startsWith('cast')?[96,96]:[64,96],pivot=[size[0]/2,88];await mkdir(root+'/frames/'+id,{recursive:true});await mkdir(root+'/atlases',{recursive:true});const frames=[];
 for(const[c,b]of rows[r].entries()){
  const shiftX=translationNativeX,s=[Math.round(b.width*scale),Math.round(b.height*scale)],offset=[Math.round(pivot[0]+(b.left-roots[c])*scale)+shiftX,Math.round(pivot[1]+(b.top-floors[r])*scale)];
  const raw=await sharp(source).extract({left:b.left,top:b.top,width:b.width,height:b.height}).ensureAlpha().resize(...s,{kernel:'nearest'}).raw().toBuffer();quantize(raw);
  // These grounded study poses have boots as their lowest opaque contour (reviewed
  // on the two source sheets). Register that contour after nearest quantization;
  // row medians lose 1-2 native pixels. Translation only: never scale a pose.
  let lastBootRow=-1;for(let y=0;y<s[1];y++)for(let x=0;x<s[0];x++)if(raw[(y*s[0]+x)*4+3])lastBootRow=y;
  const rowOffsetY=offset[1];offset[1]=pivot[1]-(lastBootRow+1);
  assert.ok(offset[0]>=0&&offset[1]>=0&&offset[0]+s[0]<=size[0]&&offset[1]+s[1]<=size[1],`${direction}/${action}/${c} offset${offset}/size${s}/canvas${size} overflows`);
  const frame=await sharp({create:{width:size[0],height:size[1],channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:raw,raw:{width:s[0],height:s[1],channels:4},left:offset[0],top:offset[1]}]).png().toBuffer();
  const padding=plan?2:0,file=`frames/${id}/${String(c+1).padStart(3,'0')}.png`;await writeFile(root+'/'+file,frame);frames.push({file,sha256:sha(frame),rect:{x:padding+c*(size[0]+padding*2),y:padding,w:size[0],h:size[1]}});
  canonical.push({action,direction,index:c,bytes:frame,size,pivot});mapped.push({action,index:c,sourceRow:r,sourceRect:b,sourcePivot:[roots[c]-shiftX/scale,b.top+(lastBootRow+1)/scale],sharedRowFloor:floors[r],scale,offset,translationNativeX:shiftX,groundMethod:'lowest planted boot contour after nearest quantization; soles end at pixel87, ground boundary88',nativeFootCorrectionY:offset[1]-rowOffsetY});
 }
 const padding=plan?2:0,aw=(size[0]+padding*2)*6,ah=size[1]+padding*2,atlasRaw=Buffer.alloc(aw*ah*4);for(const f of frames){const pixels=await sharp(root+'/'+f.file).ensureAlpha().raw().toBuffer();for(let y=0;y<size[1];y++)pixels.copy(atlasRaw,((y+padding)*aw+f.rect.x)*4,y*size[0]*4,(y+1)*size[0]*4);}
 const file='atlases/'+id+'.png',atlas=await sharp(atlasRaw,{raw:{width:aw,height:ah,channels:4}}).png().toBuffer();await writeFile(root+'/'+file,atlas);
 clips[id]={id:'wang-pixel-'+id,actor:'wang',action,direction,registrationSource:request.id,frameSize:size,pivot,atlas:file,atlasSize:[aw,ah],atlasSha256:sha(atlas),atlasPadding:padding,frames,fps:action==='idle'?6:action==='run'?12:24,durations:action==='idle'||action==='run'?Array(6).fill(1):action==='cast_forward'?[2,2,2,3,3,4]:[2,3,3,6,2,1],phases:action.startsWith('cast')?[{at:0,label:'Kết ấn'},{at:action==='cast_forward'?250:333.333,label:'Phát thuật'},{at:action==='cast_forward'?375:583.333,label:'Hồi thế'}]:[{at:0,label:'Chuyển động'}],loop:['idle','run'].includes(action),holdLast:action.startsWith('cast'),artApproved:false};
}
sources.push({id:request.id,file:request.sourceFile,sha256:sha(source),prompt:request.promptFile,promptSha256:sha(await readFile(root+'/'+request.promptFile)),size:[info.width,info.height],selectedRows:request.bindings.map(b=>b.row),excludedRows:Array.from({length:request.rowCount},(_,i)=>i).filter(i=>!request.bindings.some(b=>b.row===i)),note:request.rowCount===2?'neutral row calibrates physical scale; compact run row exported':'unselected run row rejected for locomotion canvas overflow when replacement exists'});
registrations.push({id:request.id,direction,scale,translationNativeX:request.translationNativeX??0,scaleReference:'median of six neutral idle heights; one scale per source, not per pose or action',roots,floors,frames:mapped});
}
const inputs=['approved-wang-identity-4x.png','reference-pixel-style-2x.png',...(plan?['reference-eight-facings-2x.png']:[])];
const referenceDir='docs/art_reference/character-runtime-kiem-tu-pixellab-luyen-khi';
const referenceFiles=['character.json','PROVENANCE.json','idle.png','run.png','skill_melee.png','skill_ranged.png'];
const catalog={id:plan?.id??'wang-lin-pixel-production-study-v1',version:plan?.version??1,date:'2026-10-12',status:'candidate-native-motion-study',tool:'built-in ImageGen',pixelsResampled:true,palette:palette.map(c=>c.map(v=>v.toString(16).padStart(2,'0')).join('')),ownerApproved:false,artApproved:false,directions,actions,clips,sources,
 inputs:await Promise.all(inputs.map(async file=>({file:'inputs/'+file,sha256:sha(await readFile(root+'/inputs/'+file))}))),registration:registrations,
 reference:{role:'pixel treatment and production metadata only; not copied as our player',files:await Promise.all(referenceFiles.map(async f=>({file:referenceDir+'/'+f,sha256:sha(await readFile(referenceDir+'/'+f))})))},
 identity:{role:'approved Wang Lin identity and original anatomy',file:'docs/design/characters/wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_south.png',sha256:sha(await readFile('docs/design/characters/wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_south.png'))},
 sourceInputs:{south:inputs.slice(0,2).map(f=>'inputs/'+f),southeast:['sources/south-v1.png',...inputs.slice(0,2).map(f=>'inputs/'+f)],...Object.fromEntries((plan?.requests??[]).map(r=>[r.direction,r.inputFiles])),...Object.fromEntries((plan?.repairs??[]).map(r=>['run-'+r.direction,r.inputFiles]))},
 contract:{baseFrame:[64,96],basePivot:[32,88],standingHeight:80,castFrame:[96,96],castPivot:[48,88],sampling:'nearest',layers:['body'],weaponAndVfx:'Separate production tracks. This study produces body only.'},
 scope:plan?'Eight-direction idle/run/forward/point body pack. Other player actions and live integration remain separate. New directions are not implicitly approved.':'Two-direction 48-pose style/registration sample. Not eight-direction production, live replacement or visual approval.'};
catalog.coverage={required:directions.flatMap(d=>actions.map(a=>a+'-'+d)),missing:directions.flatMap(d=>actions.filter(a=>!clips[a+'-'+d]).map(a=>a+'-'+d)),fullPlayerActions:false};
await writeFile(root+'/catalog.json',JSON.stringify(catalog,null,2)+'\n');
for(const direction of directions){
const images=[];for(const[r,action]of actions.entries())for(let c=0;c<6;c++){const f=canonical.find(f=>f.action===action&&f.direction===direction&&f.index===c);images.push({input:f.bytes,left:80+c*128-f.pivot[0],top:36+r*128+88-f.pivot[1]});}
const labels=Buffer.from(`<svg width="832" height="550">${actions.map((a,r)=>`<text x="16" y="${22+r*128}" fill="#eddeb9" font-family="Segoe UI" font-size="13">${a}</text><path d="M0 ${124+r*128}.5 H832" stroke="#64877b"/>`).join('')}</svg>`);
await sharp({create:{width:832,height:550,channels:4,background:'#152923'}}).composite([{input:labels,left:0,top:0},...images]).png().toFile(root+'/native-strip-'+direction+'.png');
await sharp(root+'/native-strip-'+direction+'.png').resize(1664,1100,{kernel:'nearest'}).png().toFile(root+'/native-strip-'+direction+'-2x.png');
}
console.log(JSON.stringify({root,frames:canonical.length,registrations:registrations.map(r=>({direction:r.direction,scale:r.scale,heights:actions.map(a=>r.frames.filter(f=>f.action===a).map(f=>Math.round(f.sourceRect.height*r.scale)))}))}));
