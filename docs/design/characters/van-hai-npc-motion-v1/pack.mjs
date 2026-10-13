// Scoped export for the new NPC pilot. Locked player ART/runtime/map are read-only.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';

const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-motion-v1');
const hash=b=>createHash('sha256').update(b).digest('hex');
function safe(base,file){const path=resolve(base,file),rel=relative(base,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside allowed root: '+file);return path;}
const local=file=>safe(root,file),inWorkspace=file=>safe(workspace,file);
try{await readFile(local('approval.json'));throw Error('Owner-approved baseline: pack a new version instead.');}catch(e){if(e.code!=='ENOENT')throw e;}
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const optionalJson=async file=>{try{return await json(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const write=async(file,value)=>{await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),JSON.stringify(value,null,2)+'\n');};
const contract={canvas:[96,96],pivot:[48,88],standingHeight:80,baseHumanCanvas:[64,96],paddingOnly:true,sampling:'nearest',atlasPadding:2};
const actions=['idle','talk','profession'],allDirections=['south','southwest','west','northwest','north','northeast','east','southeast'];
const expected=[['tran-duy','NPC-HN-GUIDE','Trần Duy'],['diep-tinh','NPC-HN-CULTIVATION','Diệp Tĩnh'],['ta-kiem-son','NPC-HN-TRAINING','Tạ Kiếm Sơn'],['to-nhuoc','NPC-HN-PREPARATION','Tô Nhược']];
const registrationFile='registration-input.json',input=await json(local(registrationFile));
assert.equal(input.actors.length,4,'Pilot requires four measured actors');
assert.deepEqual(new Set(input.actors.map(a=>a.slug)),new Set(expected.map(a=>a[0])),'Unexpected NPC pilot roster');
const plan=await optionalJson(local('production-plan.json'));
const standardRoot=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1'),basis=await json(resolve(standardRoot,'basis.json')),directions=await json(resolve(standardRoot,'directions.json'));
const basisTargets=[{file:'docs/design/characters/van-hai-npc-visual-standard-v1/basis.json',sha256:hash(await readFile(resolve(standardRoot,'basis.json')))},{file:'docs/design/characters/van-hai-npc-visual-standard-v1/directions.json',sha256:hash(await readFile(resolve(standardRoot,'directions.json')))}];
assert.equal(hash(await readFile(inWorkspace(basis.sourceCatalog))),basis.sourceCatalogSha256,'Live player catalog changed');
assert.equal(hash(await readFile(inWorkspace(basis.atlas))),basis.atlasSha256,'Live player primary atlas changed');
for(const d of directions.directions){assert.equal(hash(await readFile(inWorkspace(d.atlas))),d.atlasSha256,'Live player direction atlas changed');assert.equal(hash(await readFile(resolve(standardRoot,d.native))),d.nativeSha256,'Live direction reference changed');}
const morphologyBasis={primaryActor:basis.primaryActor,primaryReference:basis.primaryReference,basisFile:basisTargets[0].file,basisSha256:basisTargets[0].sha256,directionsFile:basisTargets[1].file,directionsSha256:basisTargets[1].sha256,liveNativeFile:'docs/design/characters/van-hai-npc-visual-standard-v1/'+basis.native.file,liveNativeSha256:basis.native.sha256,liveNativeCanvas:basis.native.canvas,liveNativePivot:basis.native.pivot,targets:basisTargets,rule:'NPC identity is locked separately; directly compare every action to live Wang Lin at native1x. Padding does not enlarge anatomy.'};
const gddFile='docs/design/world/van-hai-living-world-v1/plan.json',gdd={file:gddFile,sha256:hash(await readFile(inWorkspace(gddFile)))};
const actors=[],catalogClips={},registrations=[],sources=[];
for(const measurement of input.actors){
 const {slug}=measurement,[,defaultId,defaultName]=expected.find(a=>a[0]===slug);
 assert.equal(measurement.direction,'southeast');assert.ok(/^[a-z0-9-]+$/.test(slug));
 const source=measurement.source,bytes=await readFile(local(source)),sourceSha256=hash(bytes);
 assert.equal(measurement.sourceSha256,sourceSha256,'Pin the measured source hash for '+slug);
 assert.ok(measurement.visuallyReviewed===true,'Manual source/root review required for '+slug);
 const threshold=measurement.alphaThreshold??128;assert.ok(Number.isInteger(threshold)&&threshold>0&&threshold<=255);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(measurement.frames.length,18,'Exactly18 measured source poses required');
 assert.deepEqual(new Set(measurement.frames.map(f=>f.index)),new Set(Array.from({length:18},(_,i)=>i)),'Unique source index0..17 required');
 assert.equal(measurement.neutralIndex,0,'Pilot calibration must be idle frame0');
 const neutral=measurement.frames.find(f=>f.index===measurement.neutralIndex);assert.ok(neutral&&neutral.action==='idle','Neutral must be measured idle frame');
 const neutralHeight=measurement.neutralHeight,scale=measurement.scale;
 assert.ok(Number.isFinite(neutralHeight)&&neutralHeight>0&&Number.isFinite(scale)&&scale>0);
 assert.ok(Math.abs(scale-80/neutralHeight)<1e-9,'Scale must be80/measured-neutralHeight');
 const neutralTop=measurement.neutralTopY??neutral.top;
 assert.ok(Math.abs(neutralHeight-(neutral.rootY-neutralTop))<1,'Neutral height must use measured body top and world root');
 const labels=new Uint32Array(info.width*info.height),queue=new Int32Array(labels.length),labeledBodies=[];
 let label=0;
 for(let p=0;p<labels.length;p++)if(!labels[p]&&data[p*4+3]>=threshold){
  let head=0,tail=0,left=info.width,top=info.height,right=-1,bottom=-1;
  label++;labels[p]=label;queue[tail++]=p;
  while(head<tail){
   const i=queue[head++],x=i%info.width,y=Math.floor(i/info.width);
   left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
   for(const j of [i-1,i+1,i-info.width,i+info.width])if(j>=0&&j<labels.length&&Math.abs(j%info.width-x)<=1&&!labels[j]&&data[j*4+3]>=threshold){labels[j]=label;queue[tail++]=j;}
  }
  labeledBodies.push({label,left,top,width:right-left+1,height:bottom-top+1,area:tail});
 }
 const actorPlan=plan?.actors?.find(a=>a.slug===slug)??{};
 const actor={...actorPlan,id:actorPlan.id??defaultId,slug,name:actorPlan.name??defaultName,direction:'southeast',canvas:contract.canvas,pivot:contract.pivot,neutralSprite:'calibration/'+slug+'-southeast.png',clips:{},artApproved:false,ownerApproved:false,runtimeImported:false};
 const mapped=[];
 async function extract(frame){
  const {left,top,width,height,rootX,rootY}=frame;
  for(const [label,value]of Object.entries({left,top,width,height}))assert.ok(Number.isInteger(value)&&value>=0,'Invalid '+label+' for '+slug+'/'+frame.index);
  assert.ok(width>0&&height>0&&left+width<=info.width&&top+height<=info.height,'Source rect overflow');
  assert.ok(Number.isFinite(rootX)&&Number.isFinite(rootY)&&rootX>=left&&rootX<=left+width&&rootY>=top&&rootY<=top+height,'Root must be manually registered inside source rect');
  // Rectangles can overlap at empty corners: retain the measured full alpha
  // body and contained tiny edge islands, mask every other full pose.
  const bodies=labeledBodies.filter(b=>b.area>=250&&b.left===left&&b.top===top&&b.width===width&&b.height===height);
  assert.equal(bodies.length,1,'Measured rect must identify one complete connected body: '+slug+'/'+frame.index);
  const body=bodies[0],acceptedLabels=new Set([body.label,...labeledBodies.filter(b=>b.area<250&&b.left>=left&&b.top>=top&&b.left+b.width<=left+width&&b.top+b.height<=top+height).map(b=>b.label)]);
  const crop=Buffer.alloc(width*height*4);let opaque=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(top+y)*info.width+left+x,src=p*4,dst=(y*width+x)*4;if(acceptedLabels.has(labels[p])){data.copy(crop,dst,src,src+3);crop[dst+3]=255;opaque++;}}
  assert.ok(opaque>=250,'Source pose missing body pixels');
  assert.ok(opaque>=body.area,'Connected body pixels were lost');
  const size=[Math.round(width*scale),Math.round(height*scale)],offset=[Math.round(contract.pivot[0]-(rootX-left)*scale),Math.round(contract.pivot[1]-(rootY-top)*scale)];
  assert.ok(size.every(v=>v>0),'Native cutout is empty');
  const pixels=await sharp(crop,{raw:{width,height,channels:4}}).resize(size[0],size[1],{kernel:'nearest'}).raw().toBuffer();
  const canvas=Buffer.alloc(96*96*4),nativeBounds=[96,96,-1,-1];let nativeOpaque=0;
  // Transparent measured margins may extend beyond the canvas. Every actual
  // body pixel must fit; discard no opaque pixels and never rescale a pose.
  for(let y=0;y<size[1];y++)for(let x=0;x<size[0];x++){const src=(y*size[0]+x)*4;if(!pixels[src+3])continue;const dx=x+offset[0],dy=y+offset[1];assert.ok(dx>=0&&dy>=0&&dx<96&&dy<96,'Native art would be cropped; revise measured rect or source, never shrink a pose: '+slug+'/'+frame.index+' '+JSON.stringify({size,offset}));pixels.copy(canvas,(dy*96+dx)*4,src,src+4);nativeOpaque++;nativeBounds[0]=Math.min(nativeBounds[0],dx);nativeBounds[1]=Math.min(nativeBounds[1],dy);nativeBounds[2]=Math.max(nativeBounds[2],dx);nativeBounds[3]=Math.max(nativeBounds[3],dy);}
  assert.ok(nativeOpaque>0,'Resampling erased the pose');
  const buffer=await sharp(canvas,{raw:{width:96,height:96,channels:4}}).png().toBuffer();
  mapped.push({...frame,sourceRect:{left,top,width,height},sourcePivot:[rootX,rootY],scale,offset,nativeCutoutSize:size,nativeBounds:[nativeBounds[0],nativeBounds[1],nativeBounds[2]-nativeBounds[0]+1,nativeBounds[3]-nativeBounds[1]+1],nativeOpaque,opaquePixelsDropped:0,extraction:'measured-connected-alpha-body-and-contained-small-islands',bodySourcePixels:body.area,extractedSourcePixels:opaque,bodyPixelsDropped:0,rootMethod:frame.rootBasis??measurement.rootBasis??'Manually pinned world-root coordinates; no alpha/bbox recentering',pixelsResampled:true,resampling:'nearest-once',rgbPainted:false,alphaThreshold:threshold});
  return buffer;
 }
 await mkdir(local('calibration'),{recursive:true});const neutralBuffer=await extract(neutral);await writeFile(local(actor.neutralSprite),neutralBuffer);actor.neutralSha256=hash(neutralBuffer);
 for(const action of actions){
  const selected=measurement.frames.filter(f=>f.action===action).sort((a,b)=>a.frame-b.frame);assert.equal(selected.length,6,'Six real poses required per action');assert.deepEqual(selected.map(f=>f.frame),[0,1,2,3,4,5]);
  const durationMs=action==='profession'?1500:1200,frameDuration=durationMs/6,frames=[],layers=[],nativeHashes=[];
  for(const [index,frame]of selected.entries()){
   const buffer=frame.index===neutral.index?neutralBuffer:await extract(frame),file=`frames/${slug}-${action}-southeast/${String(index+1).padStart(3,'0')}.png`,rect={x:2+index*100,y:2,w:96,h:96};
   await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),buffer);const digest=hash(buffer);nativeHashes.push(digest);frames.push({...rect,file,sha256:digest,rect,durationMs:frameDuration});layers.push({input:buffer,left:rect.x,top:rect.y});
  }
  assert.ok(new Set(nativeHashes).size>1,'All six '+action+' poses collapse to one identical image: '+slug);
  const atlas=await sharp({create:{width:600,height:100,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png().toBuffer(),atlasFile=`atlases/${slug}-${action}-southeast.png`;
  await mkdir(local('atlases'),{recursive:true});await writeFile(local(atlasFile),atlas);
  const clip={id:`${slug}-${action}-southeast`,actor:actor.id,action,direction:'southeast',atlas:atlasFile,atlasSize:[600,100],atlasSha256:hash(atlas),atlasPadding:2,canvas:contract.canvas,frameSize:contract.canvas,pivot:contract.pivot,frames,fps:action==='profession'?4:5,durations:Array(6).fill(1),durationMs,loop:action!=='profession',holdLast:false,phases:[{at:0,label:action}],uniqueFrames:new Set(nativeHashes).size,artApproved:false};
  actor.clips[action]=clip;catalogClips[clip.id]=clip;
 }
 const rawMetadataFile=source.replace(/\.png$/i,'.json'),metadata=await optionalJson(local(rawMetadataFile));assert.ok(metadata,'Raw router metadata is required: '+rawMetadataFile);assert.equal(metadata.image.sha256,sourceSha256,'Router source hash differs');assert.equal(metadata.model,'gpt-image-2');
 const inputImages=[];for(const image of metadata.inputImages??[]){const file=inWorkspace(image.path);assert.equal(hash(await readFile(file)),image.sha256,'Generation input changed');inputImages.push({...image,path:relative(workspace,file).replaceAll('\\','/')});}
 assert.ok(inputImages.length>=2,'Live Wang and own NPC identity inputs required');
 assert.ok(inputImages.some(image=>image.sha256===basis.nearest8x.sha256),'Actual live Wang reference must be a generation input');
 const promptFile=measurement.prompt??actorPlan.prompt??'prompts/'+slug+'-southeast.txt',promptBytes=await readFile(local(promptFile));
 assert.equal(metadata.prompt.trim(),promptBytes.toString('utf8').trim(),'Recorded prompt differs from actual router request');
 const sourceRecord={actor:actor.id,slug,file:source,sha256:sourceSha256,size:[info.width,info.height],prompt:promptFile,promptSha256:hash(promptBytes),routerMetadata:rawMetadataFile,routerMetadataSha256:hash(await readFile(local(rawMetadataFile))),inputs:inputImages,scale,neutralHeight,alphaThreshold:threshold};
 actor.source=source;actor.sourceSha256=sourceSha256;actor.sourceDimensions=[info.width,info.height];actor.sourceScale=scale;actor.neutralHeight=neutralHeight;
 sources.push(sourceRecord);registrations.push({slug,direction:'southeast',source,sourceSha256,neutralIndex:measurement.neutralIndex,neutralHeight,neutralTopY:neutralTop,scale,sourceDimensions:[info.width,info.height],alphaThreshold:threshold,worldRootPolicy:'Pinned manual roots; no bbox center or per-pose fitting',frames:mapped.sort((a,b)=>a.index-b.index)});actors.push(actor);
}
const registration={schema:'npc-motion-registration-1',date:'2026-10-13',registrationInput:registrationFile,registrationInputSha256:hash(await readFile(local(registrationFile))),contract,morphologyBasis,gdd,actors:registrations,artApproved:false,ownerApproved:false,runtimeImported:false};
await write('registration.json',registration);
const coverage={actors:4,producedDirections:['southeast'],pendingDirections:allDirections.filter(d=>d!=='southeast'),actions,clips:12,poses:72,calibrationPoses:4,fullDirectionalSet:false};
await write('catalog.json',{schema:'npc-motion-catalog-1',id:'van-hai-npc-motion-v1',version:1,date:'2026-10-13',status:'four-npc-southeast-motion-pilot',generator:'project-router-gpt-image-2-edit',pixelsResampled:true,contract,morphologyBasis,gdd,actors,clips:catalogClips,sources,registration:'registration.json',coverage,artApproved:false,ownerApproved:false,runtimeImported:false});
await write('production.json',{...(plan??{}),schema:'npc-motion-production-1',id:'van-hai-npc-motion-v1',date:'2026-10-13',status:'motion-pilot-owner-review-pending',contract,morphologyBasis,gdd,actors:actors.map(({clips,...actor})=>({...actor,clips:Object.fromEntries(Object.entries(clips).map(([action,c])=>[action,c.id]))})),sources,registration:'registration.json',registrationSha256:hash(await readFile(local('registration.json'))),coverage,artApproved:false,ownerApproved:false,runtimeImported:false});
console.log(JSON.stringify({actors:actors.length,clips:Object.keys(catalogClips).length,poses:72,canvas:contract.canvas,pivot:contract.pivot,sharedScales:registrations.map(r=>({slug:r.slug,scale:r.scale})),runtimeImported:false}));
