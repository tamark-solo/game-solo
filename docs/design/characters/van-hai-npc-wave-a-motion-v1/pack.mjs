// Six-NPC southeast pilot export. Approved neutral assets and live game are read-only.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha,containedPoseLabels,maskedPose} from '../van-hai-npc-motion-v2/review/measurement-helper.mjs';

const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v1');
assert.equal(process.argv.slice(2).length,0,'Strict six-source pack only; inspect may run progressively');
const hash=b=>createHash('sha256').update(b).digest('hex');
function safe(base,file){const path=resolve(base,file),rel=relative(base,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside allowed root: '+file);return path;}
const local=file=>safe(root,file),inWorkspace=file=>safe(workspace,file);
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const digest=async file=>hash(await readFile(file));
const optionalJson=async file=>{try{return await json(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const write=async(file,value)=>{await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),JSON.stringify(value,null,2)+'\n');};
assert.equal(await optionalJson(local('approval.json')),null,'Owner-approved motion pack is immutable; export a new version');
const expected=[['bach-chi','NPC-HN-HERBALIST','Bạch Chỉ'],['tong-thiet','NPC-HN-FORGE','Tống Thiết'],['hua-hanh','NPC-HN-ROUTE-KEEPER','Hứa Hành'],['dinh-soc','NPC-HN-GATE-WARDEN','Đinh Sóc'],['ky-an','NPC-HN-DISCIPLE-WATER','Kỷ An'],['phung-da','NPC-HN-DISCIPLE-SWORD','Phùng Dã']];
const plan=await json(local('production-plan.json'));
assert.equal(plan.actors.length,6);assert.deepEqual(new Set(plan.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])));
assert.equal(plan.requests.length,6);assert.deepEqual(new Set(plan.requests.map(q=>q.slug)),new Set(expected.map(a=>a[0])));
for(const [slug,id] of expected){assert.equal(plan.actors.find(a=>a.slug===slug)?.id,id);assert.equal(plan.requests.find(q=>q.slug===slug)?.direction,'southeast');}
const neutralRoot=inWorkspace('docs/design/characters/van-hai-npc-wave-a-concepts-v1');
const neutralApprovalFile='docs/design/characters/van-hai-npc-wave-a-concepts-v1/approval.json';
const neutralApprovalSha256='48f0cbbeb1e412c576b3e066e65ff6c1fa19000bb2957ca7f6a3fd6a0ef56663';
assert.equal(plan.neutralApproval?.sha256,neutralApprovalSha256);assert.equal(plan.neutralApproval?.pinnedCount,45);
assert.equal(await digest(inWorkspace(neutralApprovalFile)),neutralApprovalSha256,'Owner neutral approval changed');
const approval=await json(inWorkspace(neutralApprovalFile));
assert.equal(approval.ownerApproved,true);assert.equal(approval.artApproved,true);assert.equal(approval.motionApproved,false);assert.equal(approval.runtimeApproved,false);
assert.equal(approval.pinnedFiles.length,45,'All45 approved neutral pins required');
assert.deepEqual(new Set(approval.scope.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])));
assert.deepEqual(approval.scope.directions,['southeast']);assert.equal(approval.scope.pose,'neutral');
for(const pin of approval.pinnedFiles)assert.equal(await digest(safe(neutralRoot,pin.file)),pin.sha256,'Approved neutral changed: '+pin.file);
const neutralCatalog=await json(resolve(neutralRoot,'catalog.json'));
const standardRoot=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1');
const basisFile='docs/design/characters/van-hai-npc-visual-standard-v1/basis.json',directionsFile='docs/design/characters/van-hai-npc-visual-standard-v1/directions.json';
assert.equal(await digest(inWorkspace(basisFile)),'cdb284337e2e6e22c6ae77f65743a634e782ee7bb37ac025bc5729ffebcc22ec');
assert.equal(await digest(inWorkspace(directionsFile)),'0fef83b1121c0be2cf9b47909a00f5c3c01a665229cb1d16358fe65650b8abd9');
const basis=await json(inWorkspace(basisFile)),directions=await json(inWorkspace(directionsFile)),se=directions.directions.find(d=>d.direction==='southeast');
assert.equal(await digest(inWorkspace(basis.sourceCatalog)),basis.sourceCatalogSha256,'Live Wang catalog changed');
for(const d of directions.directions){assert.equal(await digest(inWorkspace(d.atlas)),d.atlasSha256);assert.equal(await digest(resolve(standardRoot,d.native)),d.nativeSha256);assert.equal(await digest(resolve(standardRoot,d.nearest8x)),d.nearest8xSha256);}
const liveRgba=await sharp(inWorkspace(se.atlas)).extract({left:se.rect.x,top:se.rect.y,width:se.rect.w,height:se.rect.h}).ensureAlpha().raw().toBuffer();
assert.deepEqual(liveRgba,await sharp(resolve(standardRoot,se.native)).ensureAlpha().raw().toBuffer(),'Same-direction reference must be exact live pixels');
const gddFile='docs/design/world/van-hai-living-world-v1/plan.json',gddSha256='9890bf1589b6efdc2858fcca2f1e1d56d6a5ec4b2e58238ab5c297d4bbefa576';
assert.equal(await digest(inWorkspace(gddFile)),gddSha256,'Authored NPC GDD changed');
const gddPlan=await json(inWorkspace(gddFile)),gdd={file:gddFile,sha256:gddSha256};
const registrationFile='registration-input.json',input=await json(local(registrationFile)),assessments=await json(local('review/source-assessment.json'));
assert.equal(input.sources.length,6,'Six exact-hash manual registrations required');
assert.deepEqual(new Set(input.sources.map(m=>m.slug)),new Set(expected.map(a=>a[0])));
const contract={canvas:[96,96],pivot:[48,88],standingHeight:80,baseHumanCanvas:[64,96],paddingOnly:true,sampling:'nearest',atlasPadding:2};
const actions=['idle','talk','profession'],allDirections=['south','southwest','west','northwest','north','northeast','east','southeast'];
const morphologyBasis={primaryActor:basis.primaryActor,primaryReference:basis.primaryReference,basisFile,basisSha256:await digest(inWorkspace(basisFile)),directionsFile,directionsSha256:await digest(inWorkspace(directionsFile)),
 liveNativeFile:'docs/design/characters/van-hai-npc-visual-standard-v1/'+se.native,liveNativeSha256:se.nativeSha256,liveNativeCanvas:se.canvas,liveNativePivot:se.pivot,
 targets:[{file:basisFile,sha256:await digest(inWorkspace(basisFile))},{file:directionsFile,sha256:await digest(inWorkspace(directionsFile))}],
 rule:'Wang Image1 is primary human anatomy/pixel/style; same NPC approved neutral supplies identity. One body-top-to-boots neutral scale per source; 96x96 is padding only.'};
const neutralBasis={approval:neutralApprovalFile,approvalSha256:neutralApprovalSha256,pinnedFilesVerified:45,ownerApproved:true,artApproved:true,scope:'Six southeast static neutral identities only',motionApproved:false,runtimeApproved:false};
const actors=[],clips={},sources=[],registrations=[];
for(const [slug,id,name] of expected){
 const q=plan.requests.find(q=>q.slug===slug),a=plan.actors.find(a=>a.slug===slug),m=input.sources.find(m=>m.slug===slug);
 const bytes=await readFile(local(q.source)),sourceSha256=hash(bytes);
 assert.equal(m.source,q.source);assert.equal(m.sourceSha256,sourceSha256);assert.equal(m.direction,'southeast');assert.equal(m.visuallyReviewed,true);assert.equal(m.proposalOnly,false);
 const assessment=assessments.sources.find(s=>s.slug===slug&&s.direction==='southeast'&&s.sourceSha256===sourceSha256);
 assert.ok(assessment&&assessment.source===q.source);assert.equal(assessment.status,'review-candidate');
 assert.equal(assessment.orientation.pass,true);assert.equal(assessment.identity.pass,true);assert.equal(assessment.anatomy.pass,true);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),threshold=m.alphaThreshold??128;
 assert.ok(Number.isInteger(threshold)&&threshold>0&&threshold<=255);
 const {labels,components}=labelAlpha(data,info.width,info.height,threshold);
 assert.equal(components.filter(c=>c.area>=250).length,18,'Exactly18 full components: '+slug);
 assert.equal(m.frames.length,18);assert.deepEqual(new Set(m.frames.map(f=>f.index)),new Set(Array.from({length:18},(_,i)=>i)));
 const neutral=m.frames.find(f=>f.index===m.neutralIndex);assert.equal(m.neutralIndex,0);assert.equal(neutral.action,'idle');assert.equal(m.neutralBodyTopConfirmed,true);
 assert.ok(m.neutralTopY>=neutral.top&&m.neutralTopY<neutral.rootY);
 const scale=m.scale,neutralHeight=m.neutralHeight;assert.ok(Math.abs(neutralHeight-(neutral.rootY-m.neutralTopY))<1e-9);assert.ok(Math.abs(scale-80/neutralHeight)<1e-9);
 const metaFile=q.source.replace(/\.png$/i,'.json'),meta=await json(local(metaFile));assert.equal(meta.model,'gpt-image-2');assert.equal(meta.operation,'edit');assert.equal(meta.image.sha256,sourceSha256);
 assert.equal(meta.prompt.trim(),(await readFile(local(q.prompt),'utf8')).trim());
 assert.ok(q.inputHashes.length>=2&&meta.inputImages.length===q.inputHashes.length,'Wang and same-NPC neutral inputs required');
 for(let i=0;i<q.inputHashes.length;i++){assert.equal(await digest(local(q.inputHashes[i].file)),q.inputHashes[i].sha256);assert.equal(meta.inputImages[i].sha256,q.inputHashes[i].sha256);assert.equal(await digest(inWorkspace(meta.inputImages[i].path)),q.inputHashes[i].sha256);}
 assert.equal(meta.inputImages[0].sha256,se.nearest8xSha256,'Wang southeast must be actual Image1');
 const approvedNeutral=neutralCatalog.actors.find(n=>n.id===id&&n.slug===slug);assert.ok(approvedNeutral,'Exact own NPC neutral is required');
 if(meta.inputImages.length>2){assert.equal(meta.inputImages.length,3,'Only own approved neutral raw may be an additional identity support');assert.equal(meta.inputImages[2].sha256,approvedNeutral.sourceSha256,'Image3 must be the same NPC approved raw neutral, never another NPC identity');}
 const approvedBytes=await readFile(safe(neutralRoot,approvedNeutral.sprite));assert.equal(hash(approvedBytes),approvedNeutral.spriteSha256);
 const ownInfo=await sharp(approvedBytes).metadata(),identityInput=local(q.inputHashes[1].file),identityInfo=await sharp(identityInput).metadata();
 assert.equal(identityInfo.width,ownInfo.width*8);assert.equal(identityInfo.height,ownInfo.height*8);
 assert.deepEqual(await sharp(approvedBytes).resize(identityInfo.width,identityInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(identityInput).ensureAlpha().raw().toBuffer(),'Image2 must be nearest8x of this same NPC approved native neutral');
 const brief=gddPlan.npcs.find(n=>n.id===id);assert.ok(brief&&brief.name===name);
 const actor={...a,id,slug,name,direction:'southeast',role:brief.role,zone:brief.zone,canvas:contract.canvas,pivot:contract.pivot,
  neutralSprite:'calibration/'+slug+'-southeast.png',clips:{},source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],sourceScale:scale,neutralHeight,
  approvedNeutral:{file:'docs/design/characters/van-hai-npc-wave-a-concepts-v1/'+approvedNeutral.sprite,sha256:approvedNeutral.spriteSha256},
  visualLimitations:assessment.visualLimitations??assessment.limitations??[],artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
 const mapped=[],seenLabels=new Set();
 async function extract(f){
  assert.equal(f.action,actions[Math.floor(f.index/6)]);assert.equal(f.frame,f.index%6);
  assert.ok(Number.isFinite(f.rootX)&&Number.isFinite(f.rootY)&&f.rootX>=f.left&&f.rootX<=f.left+f.width&&f.rootY>=f.top&&f.rootY<=f.top+f.height);
  assert.ok(Array.isArray(f.bootPairSupportWitness)&&f.bootPairSupportWitness.length===4,'Manual boot-pair witness required');
  const witness=f.bootPairSupportWitness;assert.ok(witness[0]<=f.rootX&&f.rootX<=witness[2]&&witness[1]<=f.rootY&&f.rootY<=witness[3]);
  assert.ok(typeof f.rootBasis==='string'&&f.rootBasis.length>20&&!f.rootBasis.includes('UNCONFIRMED'),'Root needs explicit manual basis');
  const selection=containedPoseLabels(components,f,f.componentLabels);assert.equal(selection.bodies.length,1);for(const label of selection.labels){assert.ok(!seenLabels.has(label),'Source component assigned to multiple poses');seenLabels.add(label);}
  const {pixels:crop,opaque}=maskedPose(data,info.width,info.height,labels,selection.labels,f);
  assert.ok(opaque>=selection.bodies[0].area,'Lost source body pixels');
  const size=[Math.round(f.width*scale),Math.round(f.height*scale)],offset=[Math.round(48-(f.rootX-f.left)*scale),Math.round(88-(f.rootY-f.top)*scale)];
  assert.ok(size.every(v=>v>0));const pixels=await sharp(crop,{raw:{width:f.width,height:f.height,channels:4}}).resize(size[0],size[1],{kernel:'nearest'}).raw().toBuffer();
  const tile=Buffer.alloc(96*96*4),bounds=[96,96,-1,-1];let nativeOpaque=0;
  for(let y=0;y<size[1];y++)for(let x=0;x<size[0];x++){const src=(y*size[0]+x)*4;if(!pixels[src+3])continue;const dx=x+offset[0],dy=y+offset[1];assert.ok(dx>=0&&dy>=0&&dx<96&&dy<96,'Native opaque art would clip; revise measured roots/padding, never shrink a pose: '+slug+'/'+f.index);pixels.copy(tile,(dy*96+dx)*4,src,src+4);nativeOpaque++;bounds[0]=Math.min(bounds[0],dx);bounds[1]=Math.min(bounds[1],dy);bounds[2]=Math.max(bounds[2],dx);bounds[3]=Math.max(bounds[3],dy);}
  assert.ok(nativeOpaque>0);
  mapped.push({...f,sourceRect:{left:f.left,top:f.top,width:f.width,height:f.height},sourcePivot:[f.rootX,f.rootY],scale,offset,nativeCutoutSize:size,
   nativeBounds:[bounds[0],bounds[1],bounds[2]-bounds[0]+1,bounds[3]-bounds[1]+1],nativeOpaque,bodySourcePixels:selection.bodies[0].area,extractedSourcePixels:opaque,
   bodyPixelsDropped:0,opaquePixelsDropped:0,sourceLabels:[...selection.labels],extraction:selection.method,pixelsResampled:true,resampling:'nearest-once',rgbPainted:false,alphaThreshold:threshold});
  return sharp(tile,{raw:{width:96,height:96,channels:4}}).png().toBuffer();
 }
 await mkdir(local('calibration'),{recursive:true});const neutralBuffer=await extract(neutral);await writeFile(local(actor.neutralSprite),neutralBuffer);actor.neutralSha256=hash(neutralBuffer);
 for(const action of actions){
  const selected=m.frames.filter(f=>f.action===action).sort((a,b)=>a.frame-b.frame);assert.equal(selected.length,6);assert.deepEqual(selected.map(f=>f.frame),[0,1,2,3,4,5]);
  const durationMs=action==='profession'?1500:1200,frames=[],layers=[],nativeHashes=[];
  for(const [index,f] of selected.entries()){
   const png=f.index===0?neutralBuffer:await extract(f),file='frames/'+slug+'-'+action+'-southeast/'+String(index+1).padStart(3,'0')+'.png',rect={x:2+index*100,y:2,w:96,h:96};
   await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),png);const sha256=hash(png);nativeHashes.push(sha256);
   frames.push({...rect,file,sha256,rect,durationMs:durationMs/6});layers.push({input:png,left:rect.x,top:rect.y});
  }
  assert.ok(new Set(nativeHashes).size>1,'Source action collapsed to one reused pose: '+slug+'/'+action);
  const atlas=await sharp({create:{width:600,height:100,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png().toBuffer(),atlasFile='atlases/'+slug+'-'+action+'-southeast.png';
  await mkdir(local('atlases'),{recursive:true});await writeFile(local(atlasFile),atlas);
  const clip={id:slug+'-'+action+'-southeast',actor:id,action,direction:'southeast',atlas:atlasFile,atlasSize:[600,100],atlasSha256:hash(atlas),atlasPadding:2,
   canvas:contract.canvas,frameSize:contract.canvas,pivot:contract.pivot,frames,fps:action==='profession'?4:5,durations:Array(6).fill(1),durationMs,
   loop:action!=='profession',holdLast:false,phases:[{at:0,label:action}],uniqueFrames:new Set(nativeHashes).size,artApproved:false,motionApproved:false};
  actor.clips[action]=clip;clips[clip.id]=clip;
 }
 const unassigned=components.filter(c=>!seenLabels.has(c.label));const exclusions=m.excludedComponentLabels??[];
 for(const c of unassigned){assert.ok(c.area<250&&exclusions.includes(c.label),'Unassigned alpha component requires explicit tiny-island review: '+slug+'/'+c.label);}
 if(exclusions.length)assert.ok(typeof m.excludedComponentBasis==='string'&&m.excludedComponentBasis.length>20,'Describe any excluded tiny alpha islands');
 const sourceRecord={actor:id,slug,direction:'southeast',file:q.source,sha256:sourceSha256,size:[info.width,info.height],prompt:q.prompt,promptSha256:await digest(local(q.prompt)),
  routerMetadata:metaFile,routerMetadataSha256:await digest(local(metaFile)),inputs:meta.inputImages.map(image=>({...image,path:relative(workspace,inWorkspace(image.path)).replaceAll('\\','/')})),
  primaryStyleImageIndex:0,identityImageIndex:1,referencePolicy:'Wang live southeast Image1; exact same-NPC approved native neutral nearest8x Image2',
  scale,neutralHeight,alphaThreshold:threshold,approvedNeutral:actor.approvedNeutral};
 sources.push(sourceRecord);registrations.push({slug,direction:'southeast',source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],neutralIndex:0,
  neutralHeight,neutralTopY:m.neutralTopY,neutralBodyTopBasis:m.neutralBodyTopBasis,scale,alphaThreshold:threshold,worldRootPolicy:'Explicit manually reviewed boot-pair roots. Prop tips and robe hems never define world foot. One source scale, no per-pose fitting.',
  excludedComponentLabels:exclusions,excludedComponentBasis:m.excludedComponentBasis??null,frames:mapped.sort((a,b)=>a.index-b.index)});actors.push(actor);
}
assert.equal(Object.keys(clips).length,18);assert.equal(Object.values(clips).flatMap(c=>c.frames).length,108);
const coverage={actors:6,producedDirections:['southeast'],pendingDirections:allDirections.filter(d=>d!=='southeast'),actions,clips:18,poses:108,calibrationPoses:6,fullDirectionalSet:false};
const common={date:'2026-10-13',contract,morphologyBasis,neutralBasis,neutralApproval:plan.neutralApproval,gdd,coverage,artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
await write('registration.json',{schema:'npc-motion-registration-1',...common,registrationInput:registrationFile,registrationInputSha256:await digest(local(registrationFile)),
 sourceAssessment:'review/source-assessment.json',sourceAssessmentSha256:await digest(local('review/source-assessment.json')),actors:registrations});
await write('catalog.json',{schema:'npc-motion-catalog-1',id:'van-hai-npc-wave-a-motion-v1',version:1,status:'six-npc-southeast-motion-pilot',generator:'project-router-gpt-image-2-edit',
 ...common,pixelsResampled:true,actors,clips,sources,registration:'registration.json'});
await write('production.json',{...plan,schema:'npc-motion-production-1',id:'van-hai-npc-wave-a-motion-v1',status:'six-npc-motion-owner-review-pending',...common,
 productionPlanSha256:await digest(local('production-plan.json')),actors:actors.map(({clips,...a})=>({...a,clips:Object.fromEntries(Object.entries(clips).map(([action,c])=>[action,c.id]))})),
 sources,registration:'registration.json',registrationSha256:await digest(local('registration.json'))});
console.log(JSON.stringify({actors:6,clips:18,poses:108,directions:['southeast'],pendingDirections:coverage.pendingDirections,approvedNeutralPinsVerified:45,sharedScales:registrations.map(r=>({slug:r.slug,scale:r.scale})),motionApproved:false,runtimeImported:false}));
