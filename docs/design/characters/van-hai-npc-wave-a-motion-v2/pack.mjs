// Strict six-NPC eight-direction export. Approved southeast pilot and game remain read-only.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha,containedPoseLabels,maskedPose} from '../van-hai-npc-motion-v2/review/measurement-helper.mjs';
import {createSourceProvenanceValidator} from './review/provenance-helper.mjs';

const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
assert.equal(process.argv.slice(2).length,0,'Strict42-source pack only; inspect may run progressively');
const hash=b=>createHash('sha256').update(b).digest('hex');
function safe(base,file){const path=resolve(base,file),rel=relative(base,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside allowed root: '+file);return path;}
const local=file=>safe(root,file),inWorkspace=file=>safe(workspace,file);
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const digest=async file=>hash(await readFile(file));
const optionalJson=async file=>{try{return await json(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const write=async(file,value)=>{await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),JSON.stringify(value,null,2)+'\n');};
async function validateStandaloneNeutralLineage(request,id,live,own,seen=new Set()){
 assert.equal(request.id??request.slug+'-'+request.direction,id,'Neutral lineage request ID changed');assert.equal(request.slug,own.slug);assert.equal(request.direction,live.direction);
 const sourceSha256=await digest(local(request.source));assert.ok(!seen.has(sourceSha256),'Cyclic neutral lineage');const nextSeen=new Set(seen);nextSeen.add(sourceSha256);
 const metadataFile=request.source.replace(/\.png$/i,'.json'),metadataBytes=await readFile(local(metadataFile)),metadata=JSON.parse(metadataBytes);
 assert.equal(metadata.model,'gpt-image-2');assert.equal(metadata.operation,'edit');assert.equal(metadata.image.sha256,sourceSha256);
 if(request.background!==undefined)assert.equal(metadata.requestParameters?.background,request.background,'Explicit neutral background differs from actual request metadata');
 assert.equal(metadata.prompt.trim(),(await readFile(local(request.prompt),'utf8')).trim());const supportApprovedPilotCalibration=request.referencePolicy?.supportApprovedPilotCalibration===true,expectedInputCount=supportApprovedPilotCalibration?3:2;
 assert.equal(metadata.inputImages.length,expectedInputCount,'Standalone neutral input count must follow explicit calibration support policy');assert.equal(request.inputHashes.length,expectedInputCount);
 if(supportApprovedPilotCalibration)assert.equal(request.referencePolicy?.sameActorSameDirectionCorrection,true,'Extra acceptedSEcalibration support is allowed only for explicit same-view correction');assert.equal(metadata.inputImages[0].sha256,live.nearest8xSha256,'Every standalone neutral ancestor must have same-view Wang as Image1');
 for(const [index,input] of request.inputHashes.entries()){assert.equal(await digest(local(input.file)),input.sha256);assert.equal(metadata.inputImages[index].sha256,input.sha256);assert.equal(await digest(inWorkspace(metadata.inputImages[index].path)),input.sha256);}
 const parents=request.lineageParents??[],correction=request.referencePolicy?.sameActorSameDirectionCorrection===true,chain=[];
 if(correction){
  assert.ok(Array.isArray(parents)&&parents.length,'Same-view neutral correction needs pinned prior request lineage');const target=parents.at(-1);assert.ok(target.request);
  assert.equal(metadata.inputImages[1].sha256,target.sourceSha256,'Correction Image2 must be the last pinned same-actor/same-direction neutral raw');
  for(const parent of parents){assert.ok(parent.request&&parent.sourceSha256&&parent.routerMetadataSha256);assert.equal(parent.request.id??parent.request.slug+'-'+parent.request.direction,id);assert.equal(parent.request.slug,own.slug);assert.equal(parent.request.direction,live.direction);
   assert.equal(await digest(local(parent.request.source)),parent.sourceSha256,'Neutral correction parent raw changed');assert.equal(await digest(local(parent.request.source.replace(/\.png$/i,'.json'))),parent.routerMetadataSha256,'Neutral correction parent router metadata changed');
   chain.push(...await validateStandaloneNeutralLineage(parent.request,id,live,own,nextSeen));
  }
 }else{
  assert.equal(parents.length,0,'Original neutral cannot declare unvalidated correction parents');
  const calibration=await readFile(safe(pilotRoot,own.neutralSprite));assert.equal(hash(calibration),own.neutralSha256);
  const calibrationInfo=await sharp(calibration).metadata(),identityInput=inWorkspace(metadata.inputImages[1].path),identityInfo=await sharp(identityInput).metadata();
  assert.equal(identityInfo.width,calibrationInfo.width*8);assert.equal(identityInfo.height,calibrationInfo.height*8);
  assert.deepEqual(await sharp(calibration).resize(identityInfo.width,identityInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(identityInput).ensureAlpha().raw().toBuffer(),'Original neutral Image2 must be exact ownapprovedSE calibration8x; no other NPC orSEmotion sheet');
 }
 if(supportApprovedPilotCalibration){
  const original=chain.find(record=>record.sameActorSameDirectionCorrection===false);assert.ok(original,'Calibration support must trace to a pinned original neutral ancestor');
  const originalMetadata=JSON.parse(await readFile(local(original.routerMetadata),'utf8'));
  assert.equal(metadata.inputImages[2].sha256,originalMetadata.inputImages[1].sha256,'Neutral correction Image3 must be exact ownacceptedSE calibration8x from original lineage, not a sheet/otherNPC');
  const calibration=await readFile(safe(pilotRoot,own.neutralSprite));assert.equal(hash(calibration),own.neutralSha256);
  const calibrationInfo=await sharp(calibration).metadata(),supportInput=inWorkspace(metadata.inputImages[2].path),supportInfo=await sharp(supportInput).metadata();
  assert.equal(supportInfo.width,calibrationInfo.width*8);assert.equal(supportInfo.height,calibrationInfo.height*8);
  assert.deepEqual(await sharp(calibration).resize(supportInfo.width,supportInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(supportInput).ensureAlpha().raw().toBuffer(),'Extra support must retain exact acceptedSEcalibration pixels; it cannot replace true-view camera Image1');
 }
 chain.push({requestId:id,slug:request.slug,direction:request.direction,source:request.source,sourceSha256,routerMetadata:metadataFile,routerMetadataSha256:hash(metadataBytes),primaryStyleImageIndex:1,identityOrCorrectionImageIndex:2,sameActorSameDirectionCorrection:correction,supportApprovedPilotCalibration,supportImageIndex:supportApprovedPilotCalibration?3:null});
 return [...new Map(chain.map(record=>[record.sourceSha256,record])).values()];
}

assert.equal(await optionalJson(local('approval.json')),null,'Owner-approved motion pack is immutable; export a new version');
const expected=[['bach-chi','NPC-HN-HERBALIST','Bạch Chỉ'],['tong-thiet','NPC-HN-FORGE','Tống Thiết'],['hua-hanh','NPC-HN-ROUTE-KEEPER','Hứa Hành'],['dinh-soc','NPC-HN-GATE-WARDEN','Đinh Sóc'],['ky-an','NPC-HN-DISCIPLE-WATER','Kỷ An'],['phung-da','NPC-HN-DISCIPLE-SWORD','Phùng Dã']];
const plan=await json(local('production-plan.json'));
assert.equal(plan.actors.length,6);assert.deepEqual(new Set(plan.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])));
assert.equal(plan.requests.length,42,'Six actors × seven new actual views required');
const newDirections=['south','southwest','west','northwest','north','northeast','east'];
assert.equal(new Set(plan.requests.map(q=>q.slug+'/'+q.direction)).size,42);
for(const [slug,id] of expected){assert.equal(plan.actors.find(a=>a.slug===slug)?.id,id);for(const direction of newDirections)assert.ok(plan.requests.some(q=>q.slug===slug&&q.direction===direction),'Missing requested view '+slug+'/'+direction);}
assert.ok(plan.requests.every(q=>newDirections.includes(q.direction)&&expected.some(a=>a[0]===q.slug)));
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
const pilotRoot=inWorkspace('docs/design/characters/van-hai-npc-wave-a-motion-v1');
const pilotApprovalFile='docs/design/characters/van-hai-npc-wave-a-motion-v1/approval.json';
const pilotApprovalSha256='0a3e8e5600961652f43189e4e48f5297890288d606f8857bac904bc4b4ccf300';
assert.equal(await digest(inWorkspace(pilotApprovalFile)),pilotApprovalSha256,'Approved southeast motion approval changed');
assert.equal(plan.pilotApproval?.sha256??plan.basisSha256,pilotApprovalSha256,'Plan must pin approved motion pilot');
const pilotApproval=await json(inWorkspace(pilotApprovalFile));
assert.equal(pilotApproval.ownerApproved,true);assert.equal(pilotApproval.artApproved,true);assert.equal(pilotApproval.motionApproved,true);
assert.equal(pilotApproval.runtimeApproved,false);assert.equal(pilotApproval.pinnedFiles.length,219);
assert.equal(pilotApproval.scope.clips,18);assert.equal(pilotApproval.scope.poses,108);assert.deepEqual(pilotApproval.scope.directions,['southeast']);
assert.deepEqual(new Set(pilotApproval.scope.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])));
const pilotCatalog=await json(resolve(pilotRoot,'catalog.json'));
async function verifyPins(){
 for(const pin of pilotApproval.pinnedFiles)assert.equal(await digest(safe(pilotRoot,pin.file)),pin.sha256,'Approved southeast motion changed: '+pin.file);
 for(const pin of approval.pinnedFiles)assert.equal(await digest(safe(neutralRoot,pin.file)),pin.sha256,'Approved static neutral changed: '+pin.file);
 for(const entry of [['docs/design/characters/van-hai-npc-motion-v1/approval.json',107],['docs/design/characters/van-hai-npc-motion-v2/review/delivery.json',9]]){
  const record=await json(inWorkspace(entry[0])),recordRoot=resolve(inWorkspace(entry[0]),entry[0].endsWith('delivery.json')?'../..':'..');
  const pins=record.pinnedFiles??record.pins;assert.equal(pins.length,entry[1],'Unexpected earlier baseline count');
  for(const pin of pins)assert.equal(await digest(safe(recordRoot,pin.file)),pin.sha256,'Earlier four-NPC baseline changed: '+pin.file);
 }
 assert.equal(await digest(inWorkspace(pilotApprovalFile)),pilotApprovalSha256);
 assert.equal(await digest(inWorkspace(neutralApprovalFile)),neutralApprovalSha256);
}
await verifyPins();
const pilotBasis={file:'../van-hai-npc-wave-a-motion-v1/approval.json',sha256:pilotApprovalSha256,pinnedFilesVerified:219,approvedDirections:['southeast'],scope:pilotApproval.scope};
const standardRoot=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1');
const basisFile='docs/design/characters/van-hai-npc-visual-standard-v1/basis.json',directionsFile='docs/design/characters/van-hai-npc-visual-standard-v1/directions.json';
assert.equal(await digest(inWorkspace(basisFile)),'cdb284337e2e6e22c6ae77f65743a634e782ee7bb37ac025bc5729ffebcc22ec');
assert.equal(await digest(inWorkspace(directionsFile)),'0fef83b1121c0be2cf9b47909a00f5c3c01a665229cb1d16358fe65650b8abd9');
const basis=await json(inWorkspace(basisFile)),directions=await json(inWorkspace(directionsFile)),se=directions.directions.find(d=>d.direction==='southeast');
assert.equal(await digest(inWorkspace(basis.sourceCatalog)),basis.sourceCatalogSha256,'Live Wang catalog changed');
for(const d of directions.directions){assert.equal(await digest(inWorkspace(d.atlas)),d.atlasSha256);assert.equal(await digest(resolve(standardRoot,d.native)),d.nativeSha256);assert.equal(await digest(resolve(standardRoot,d.nearest8x)),d.nearest8xSha256);}
assert.equal(plan.primaryStandardSha256??'cdb284337e2e6e22c6ae77f65743a634e782ee7bb37ac025bc5729ffebcc22ec',await digest(inWorkspace(basisFile)));
assert.equal(directions.directions.length,8);assert.deepEqual(new Set(directions.directions.map(d=>d.direction)),new Set(['south','southwest','west','northwest','north','northeast','east','southeast']));
const liveRgba=await sharp(inWorkspace(se.atlas)).extract({left:se.rect.x,top:se.rect.y,width:se.rect.w,height:se.rect.h}).ensureAlpha().raw().toBuffer();
assert.deepEqual(liveRgba,await sharp(resolve(standardRoot,se.native)).ensureAlpha().raw().toBuffer(),'Same-direction reference must be exact live pixels');
const gddFile='docs/design/world/van-hai-living-world-v1/plan.json',gddSha256='9890bf1589b6efdc2858fcca2f1e1d56d6a5ec4b2e58238ab5c297d4bbefa576';
assert.equal(await digest(inWorkspace(gddFile)),gddSha256,'Authored NPC GDD changed');
const gddPlan=await json(inWorkspace(gddFile)),gdd={file:gddFile,sha256:gddSha256};
const registrationFile='registration-input.json',input=await json(local(registrationFile)),assessments=await json(local('review/source-assessment.json'));
assert.equal(input.sources.length,42,'Strict final export needs42 manually confirmed new sources');
assert.equal(new Set(input.sources.map(m=>m.slug+'/'+m.direction)).size,42,'Duplicate measurement source');
const contract={canvas:[96,96],pivot:[48,88],standingHeight:80,baseHumanCanvas:[64,96],paddingOnly:true,sampling:'nearest',atlasPadding:2};
const actions=['idle','talk','profession'],allDirections=['south','southwest','west','northwest','north','northeast','east','southeast'];
const morphologyBasis={primaryActor:basis.primaryActor,primaryReference:basis.primaryReference,basisFile,basisSha256:await digest(inWorkspace(basisFile)),directionsFile,directionsSha256:await digest(inWorkspace(directionsFile)),
 directionReferences:directions.directions.map(d=>({direction:d.direction,native:'../van-hai-npc-visual-standard-v1/'+d.native,nativeSha256:d.nativeSha256,nearest8xSha256:d.nearest8xSha256,canvas:d.canvas,pivot:d.pivot})),
 targets:[{file:basisFile,sha256:await digest(inWorkspace(basisFile))},{file:directionsFile,sha256:await digest(inWorkspace(directionsFile))}],
 rule:'Wang same-direction Image1 is primary human anatomy/pixel/style; own true-direction standalone neutral supplies motion identity, with ownapprovedSE calibration in its lineage. One crown-to-boots neutral scale per new source; 96x96 is padding only.'};
const neutralBasis={approval:neutralApprovalFile,approvalSha256:neutralApprovalSha256,pinnedFilesVerified:45,ownerApproved:true,artApproved:true,scope:'Six southeast static neutral identities only',motionApproved:false,runtimeApproved:false};
const actors=plan.actors.map(a=>({...a,canvas:contract.canvas,pivot:contract.pivot,views:{},artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false})),clips={},sources=[],registrations=[];
const {validateMotionLineage}=createSourceProvenanceValidator({root,workspace,plan,directions,pilotRoot,pilotCatalog});
const pilotPath=file=>'../van-hai-npc-wave-a-motion-v1/'+file;
for(const actor of actors){
 const approvedActor=pilotCatalog.actors.find(a=>a.id===actor.id&&a.slug===actor.slug);assert.ok(approvedActor,'Own approved motion pilot actor required');
 const view={direction:'southeast',neutralSprite:pilotPath(approvedActor.neutralSprite),neutralSha256:approvedActor.neutralSha256,clips:{},source:pilotPath(approvedActor.source),sourceSha256:approvedActor.sourceSha256,sourceDimensions:approvedActor.sourceDimensions,sourceScale:approvedActor.sourceScale,neutralHeight:approvedActor.neutralHeight,importedPilot:true,ownerApproved:true,artApproved:true,motionApproved:true,approval:pilotBasis.file};
 for(const action of actions){const original=approvedActor.clips[action];assert.ok(original&&original.frames.length===6);const clip={...original,atlas:pilotPath(original.atlas),frames:original.frames.map(f=>({...f,file:pilotPath(f.file)})),importedPilot:true,ownerApproved:true,artApproved:true,motionApproved:true,approval:pilotBasis.file};view.clips[action]=clip;clips[clip.id]=clip;}
 actor.views.southeast=view;
}
for(const q of plan.requests){
 const {slug,direction}=q,actor=actors.find(a=>a.slug===slug);assert.ok(actor);const {id,name}=actor,m=input.sources.find(m=>m.slug===slug&&m.direction===direction);assert.ok(m,'Missing manual registration');
 const bytes=await readFile(local(q.source)),sourceSha256=hash(bytes);
 const motionLineage=await validateMotionLineage(q);
 assert.equal(m.source,q.source);assert.equal(m.sourceSha256,sourceSha256);assert.equal(m.direction,direction);assert.equal(m.visuallyReviewed,true);assert.equal(m.proposalOnly,false);
 const assessment=assessments.sources.find(s=>s.slug===slug&&s.direction===direction&&s.sourceSha256===sourceSha256);
 assert.ok(assessment&&assessment.source===q.source);assert.equal(assessment.status,'review-candidate');
 assert.equal(assessment.orientation.pass,true);assert.equal(assessment.identity.pass,true);assert.equal(assessment.anatomy.pass,true);
 assert.equal(assessment.props?.pass,true,'Every selected source requires actual view-specific prop and handedness review');
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),threshold=m.alphaThreshold??128;
 assert.ok(Number.isInteger(threshold)&&threshold>0&&threshold<=255);
 const {labels,components}=labelAlpha(data,info.width,info.height,threshold);
 assert.equal(components.filter(c=>c.area>=250).length,18,'Exactly18 full components: '+slug);
 assert.equal(m.frames.length,18);assert.deepEqual(new Set(m.frames.map(f=>f.index)),new Set(Array.from({length:18},(_,i)=>i)));
 const neutral=m.frames.find(f=>f.index===m.neutralIndex);assert.equal(m.neutralIndex,0);assert.equal(neutral.action,'idle');assert.equal(m.neutralBodyTopConfirmed,true);assert.ok(typeof m.neutralBodyTopBasis==='string'&&m.neutralBodyTopBasis.length>20,'Actual source crown must be described separately from prop top');
 assert.ok(m.neutralTopY>=neutral.top&&m.neutralTopY<neutral.rootY);
 const scale=m.scale,neutralHeight=m.neutralHeight;assert.ok(Math.abs(neutralHeight-(neutral.rootY-m.neutralTopY))<1e-9);assert.ok(Math.abs(scale-80/neutralHeight)<1e-9);
 const metaFile=q.source.replace(/\.png$/i,'.json'),meta=await json(local(metaFile));assert.equal(meta.model,'gpt-image-2');assert.equal(meta.operation,'edit');assert.equal(meta.image.sha256,sourceSha256);
 if(q.background!==undefined)assert.equal(meta.requestParameters?.background,q.background,'Explicit motion background differs from actual request metadata');
 assert.equal(meta.prompt.trim(),(await readFile(local(q.prompt),'utf8')).trim());
 assert.ok(q.inputHashes.length>=2&&meta.inputImages.length===q.inputHashes.length,'Wang and same-NPC neutral inputs required');
 for(let i=0;i<q.inputHashes.length;i++){assert.equal(await digest(local(q.inputHashes[i].file)),q.inputHashes[i].sha256);assert.equal(meta.inputImages[i].sha256,q.inputHashes[i].sha256);assert.equal(await digest(inWorkspace(meta.inputImages[i].path)),q.inputHashes[i].sha256);}
 const liveDirection=directions.directions.find(d=>d.direction===direction);assert.ok(liveDirection);
 assert.equal(meta.inputImages[0].sha256,liveDirection.nearest8xSha256,'Wang same actual direction must be Image1');
 const approvedNeutral=neutralCatalog.actors.find(n=>n.id===id&&n.slug===slug);assert.ok(approvedNeutral,'Exact own NPC neutral is required');
 const approvedMotion=pilotCatalog.actors.find(n=>n.id===id&&n.slug===slug);assert.ok(approvedMotion);
 const sameDirectionNeutral=q.referencePolicy?.sameDirectionNeutralInput===true;let nr=null,neutralLineage=[],motionIdentityReference;
 if(sameDirectionNeutral){
 nr=q.directionNeutralReference;assert.ok(nr&&typeof nr.source==='string'&&typeof nr.native==='string'&&typeof nr.registration==='string','Exact same-direction neutral source/native/manual registration required');
 assert.equal(await digest(local(nr.source)),nr.sourceSha256,'Direction neutral raw changed');assert.equal(await digest(local(nr.native)),nr.nativeSha256,'Direction neutral native changed');
 assert.equal(await digest(local(nr.registration)),nr.registrationSha256,'Direction neutral registration changed');
 const neutralRegistration=await json(local(nr.registration));
 assert.equal(neutralRegistration.schema,'npc-direction-neutral-registration-1');assert.equal(neutralRegistration.slug,slug);assert.equal(neutralRegistration.direction,direction);assert.equal(neutralRegistration.actor,id);
 assert.equal(neutralRegistration.source,nr.source);assert.equal(neutralRegistration.sourceSha256,nr.sourceSha256);assert.equal(neutralRegistration.native,nr.native);assert.equal(neutralRegistration.nativeSha256,nr.nativeSha256);
 assert.equal(neutralRegistration.visuallyReviewed,true);assert.equal(neutralRegistration.proposalOnly,false);assert.equal(neutralRegistration.neutralBodyTopConfirmed,true);assert.equal(neutralRegistration.manualSourceReviewConfirmed,true);
 assert.ok(typeof neutralRegistration.neutralBodyTopBasis==='string'&&neutralRegistration.neutralBodyTopBasis.length>20);assert.ok(typeof neutralRegistration.manualSourceReviewBasis==='string'&&neutralRegistration.manualSourceReviewBasis.length>20);
 if(neutralRegistration.componentClassification?.retainedAccessoryParts?.length){assert.equal(neutralRegistration.manualComponentReviewConfirmed,true,'Standalone neutral accessory/hair parts need explicit retention review');assert.ok(typeof neutralRegistration.manualComponentReviewBasis==='string'&&neutralRegistration.manualComponentReviewBasis.length>20);}
 assert.equal(neutralRegistration.rgbPainted,false);assert.equal(neutralRegistration.resampling,'nearest-once');
 assert.equal(neutralRegistration.clippedOpaquePixels,0);assert.deepEqual(neutralRegistration.canvas,contract.canvas);assert.deepEqual(neutralRegistration.pivot,contract.pivot);
 const nrWitness=neutralRegistration.bootPairSupportWitness;assert.ok(Array.isArray(nrWitness)&&nrWitness.length===4&&nrWitness.every(Number.isFinite));
 assert.ok(nrWitness[0]<=neutralRegistration.rootX&&neutralRegistration.rootX<=nrWitness[2]&&nrWitness[1]<=neutralRegistration.rootY&&neutralRegistration.rootY<=nrWitness[3]);
 assert.ok(Math.abs(neutralRegistration.scale-80/(neutralRegistration.rootY-neutralRegistration.neutralTopY))<1e-9);
 assert.equal(meta.inputImages.length,3,'Exact three-input same-view motion lineage required');
 const correction=Boolean(q.sourceCorrectionParent),identityIndex=correction?2:1;
 if(correction)assert.equal(meta.inputImages[1].sha256,q.sourceCorrectionParent.sourceSha256,'Correction Image2 must be pinned own same-view motion raw');
 else assert.equal(meta.inputImages[2].sha256,nr.sourceSha256,'Image3 must be this same actor and direction standalone neutral raw');
 const approvedBytes=await readFile(local(nr.native)),ownInfo=await sharp(approvedBytes).metadata(),identityInput=local(q.inputHashes[identityIndex].file),identityInfo=await sharp(identityInput).metadata();
 assert.deepEqual([ownInfo.width,ownInfo.height],contract.canvas);assert.equal(identityInfo.width,ownInfo.width*8);assert.equal(identityInfo.height,ownInfo.height*8);
 assert.deepEqual(await sharp(approvedBytes).resize(identityInfo.width,identityInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(identityInput).ensureAlpha().raw().toBuffer(),'Identity input must be nearest8x of this exact own NPC and true-direction neutral');
 assert.equal(await digest(local(neutralRegistration.nearest8x)),neutralRegistration.nearest8xSha256);assert.equal(meta.inputImages[identityIndex].sha256,neutralRegistration.nearest8xSha256);
 const standaloneRequest=plan.neutralRequests?.find(request=>request.slug===slug&&request.direction===direction&&request.source===nr.source);assert.ok(standaloneRequest,'Selected same-view neutral must have its exact production request');
 neutralLineage=await validateStandaloneNeutralLineage(standaloneRequest,slug+'-'+direction,liveDirection,approvedMotion);
 assert.ok(neutralLineage.some(record=>record.source===nr.source&&record.sourceSha256===nr.sourceSha256));
 motionIdentityReference={file:nr.native,sha256:nr.nativeSha256,pivot:contract.pivot,canvas:contract.canvas,scope:'Same NPC real-direction manually reviewed neutral for motion identity; primary anatomy/style/camera is same-direction Wang'};
 }else{
  assert.equal(q.referencePolicy?.ownApprovedPilotIdentityLocked,true,'Original pilot-supported views require explicit ownidentity policy');
  assert.equal(assessment.props?.pass,true,'Original views can be retained only after exact requested-view prop/handedness visual assessment');
  assert.equal(meta.inputImages.length,3,'Original motion must preserve Wang same-view, ownSE calibration andownSE raw inputs');
  assert.equal(meta.inputImages[2].sha256,approvedMotion.sourceSha256,'Original Image3 must be exact same NPC approvedSE rawmotion');
  const ownCalibration=await readFile(safe(pilotRoot,approvedMotion.neutralSprite));assert.equal(hash(ownCalibration),approvedMotion.neutralSha256);
  const ownCalibrationInfo=await sharp(ownCalibration).metadata(),legacyIdentityInput=local(q.inputHashes[1].file),legacyIdentityInfo=await sharp(legacyIdentityInput).metadata();
  assert.equal(legacyIdentityInfo.width,ownCalibrationInfo.width*8);assert.equal(legacyIdentityInfo.height,ownCalibrationInfo.height*8);
  assert.deepEqual(await sharp(ownCalibration).resize(legacyIdentityInfo.width,legacyIdentityInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(legacyIdentityInput).ensureAlpha().raw().toBuffer(),'Original Image2 must remain exact own approvedSE calibration8x');
  motionIdentityReference={file:pilotPath(approvedMotion.neutralSprite),sha256:approvedMotion.neutralSha256,pivot:contract.pivot,canvas:contract.canvas,scope:'Exact ownapprovedSE motion calibration identity support; requested actualview camera/props passed separate manual assessment'};
 }
 assert.equal(await digest(safe(neutralRoot,approvedNeutral.sprite)),approvedNeutral.spriteSha256,'Own static neutral provenance changed');
 const brief=gddPlan.npcs.find(n=>n.id===id);assert.ok(brief&&brief.name===name);
 const view={direction,canvas:contract.canvas,pivot:contract.pivot,neutralSprite:'calibration/'+slug+'-'+direction+'.png',clips:{},source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],sourceScale:scale,neutralHeight,
  approvedNeutral:{file:'docs/design/characters/van-hai-npc-wave-a-concepts-v1/'+approvedNeutral.sprite,sha256:approvedNeutral.spriteSha256},
  identityReference:motionIdentityReference,...(nr?{directionNeutralReference:nr,neutralLineage}:{}),
  visualLimitations:assessment.visualLimitations??assessment.limitations??[],artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
 const mapped=[],seenLabels=new Set();
 async function extract(f){
  assert.equal(f.action,actions[Math.floor(f.index/6)]);assert.equal(f.frame,f.index%6);
  assert.ok(Number.isFinite(f.rootX)&&Number.isFinite(f.rootY)&&f.rootX>=f.left&&f.rootX<=f.left+f.width&&f.rootY>=f.top&&f.rootY<=f.top+f.height);
  assert.ok(Array.isArray(f.bootPairSupportWitness)&&f.bootPairSupportWitness.length===4,'Manual boot-pair witness required');
  const witness=f.bootPairSupportWitness;assert.ok(witness.every(Number.isFinite));assert.ok(witness[0]<=f.rootX&&f.rootX<=witness[2]&&witness[1]<=f.rootY&&f.rootY<=witness[3]);assert.ok(witness[0]>=f.left&&witness[1]>=f.top&&witness[2]<=f.left+f.width&&witness[3]<=f.top+f.height,'Both-boot witness must stay inside this source pose');
  assert.ok(typeof f.rootBasis==='string'&&f.rootBasis.length>20&&!f.rootBasis.includes('UNCONFIRMED'),'Root needs explicit manual basis');
  const selection=containedPoseLabels(components,f,f.componentLabels);assert.equal(selection.bodies.length,1);for(const label of selection.labels){assert.ok(!seenLabels.has(label),'Source component assigned to multiple poses');seenLabels.add(label);}
  const {pixels:crop,opaque}=maskedPose(data,info.width,info.height,labels,selection.labels,f);
  assert.equal(opaque,[...selection.labels].reduce((sum,label)=>sum+components.find(c=>c.label===label).area,0),'Lost selected source component pixels');
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
 await mkdir(local('calibration'),{recursive:true});const neutralBuffer=await extract(neutral);await writeFile(local(view.neutralSprite),neutralBuffer);view.neutralSha256=hash(neutralBuffer);
 for(const action of actions){
  const selected=m.frames.filter(f=>f.action===action).sort((a,b)=>a.frame-b.frame);assert.equal(selected.length,6);assert.deepEqual(selected.map(f=>f.frame),[0,1,2,3,4,5]);
  const durationMs=action==='profession'?1500:1200,frames=[],layers=[],nativeHashes=[];
  for(const [index,f] of selected.entries()){
   const png=f.index===0?neutralBuffer:await extract(f),file='frames/'+slug+'-'+action+'-'+direction+'/'+String(index+1).padStart(3,'0')+'.png',rect={x:2+index*100,y:2,w:96,h:96};
   await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),png);const sha256=hash(png);nativeHashes.push(sha256);
   frames.push({...rect,file,sha256,rect,durationMs:durationMs/6});layers.push({input:png,left:rect.x,top:rect.y});
  }
  assert.ok(new Set(nativeHashes).size>1,'Source action collapsed to one reused pose: '+slug+'/'+action);
  const atlas=await sharp({create:{width:600,height:100,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png().toBuffer(),atlasFile='atlases/'+slug+'-'+action+'-'+direction+'.png';
  await mkdir(local('atlases'),{recursive:true});await writeFile(local(atlasFile),atlas);
  const clip={id:slug+'-'+action+'-'+direction,actor:id,action,direction,atlas:atlasFile,atlasSize:[600,100],atlasSha256:hash(atlas),atlasPadding:2,
   canvas:contract.canvas,frameSize:contract.canvas,pivot:contract.pivot,frames,fps:action==='profession'?4:5,durations:Array(6).fill(1),durationMs,
   loop:action!=='profession',holdLast:false,phases:[{at:0,label:action}],uniqueFrames:new Set(nativeHashes).size,artApproved:false,motionApproved:false};
  view.clips[action]=clip;clips[clip.id]=clip;
 }
 const unassigned=components.filter(c=>!seenLabels.has(c.label));const exclusions=m.excludedComponentLabels??[];
 for(const c of unassigned){assert.ok(c.area<250&&exclusions.includes(c.label),'Unassigned alpha component requires explicit tiny-island review: '+slug+'/'+c.label);}
 if(exclusions.length)assert.ok(typeof m.excludedComponentBasis==='string'&&m.excludedComponentBasis.length>20,'Describe any excluded tiny alpha islands');
 const sourceRecord={actor:id,slug,direction,file:q.source,sha256:sourceSha256,size:[info.width,info.height],prompt:q.prompt,promptSha256:await digest(local(q.prompt)),
  routerMetadata:metaFile,routerMetadataSha256:await digest(local(metaFile)),inputs:meta.inputImages.map(image=>({...image,path:relative(workspace,inWorkspace(image.path)).replaceAll('\\','/')})),
  primaryStyleImageIndex:1,identityImageIndex:q.sourceCorrectionParent?3:2,correctionTargetImageIndex:q.sourceCorrectionParent?2:null,referencePolicy:{...q.referencePolicy,stage:q.sourceCorrectionParent?'explicit-same-view-action-repair':sameDirectionNeutral?'motion-from-real-direction-neutral':'original-pilot-supported-real-view',primaryStyleImageIndex:1,editTargetFirst:false,sameDirectionNeutralInput:sameDirectionNeutral,rule:q.sourceCorrectionParent?'Wang same-direction Image1, pinned own same-view motion correction target Image2, exact verified same-view neutral nearest8x Image3':sameDirectionNeutral?'Wang same-direction Image1, own true-direction neutral nearest8x Image2, own same-view neutral raw Image3':'Wang same-direction Image1, ownapprovedSE calibration8x Image2, ownapprovedSE rawmotion Image3; exact requestedview/props passed manual review'},
  scale,neutralHeight,alphaThreshold:threshold,approvedNeutral:view.approvedNeutral,identityReference:view.identityReference,motionLineage,...(q.background!==undefined?{background:q.background}:{}),...(q.sourceCorrectionParent?{sourceCorrectionParent:q.sourceCorrectionParent}:{}),...(nr?{directionNeutralReference:nr,neutralLineage}:{})};
 sources.push(sourceRecord);registrations.push({slug,direction,source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],neutralIndex:0,
  neutralHeight,neutralTopY:m.neutralTopY,neutralBodyTopBasis:m.neutralBodyTopBasis,scale,alphaThreshold:threshold,worldRootPolicy:'Explicit manually reviewed boot-pair roots. Prop tips and robe hems never define world foot. One source scale, no per-pose fitting.',
  excludedComponentLabels:exclusions,excludedComponentBasis:m.excludedComponentBasis??null,frames:mapped.sort((a,b)=>a.index-b.index)});actor.views[direction]=view;
}
assert.equal(Object.keys(clips).length,144);assert.equal(Object.values(clips).flatMap(c=>c.frames).length,864);
assert.equal(sources.length,42);assert.equal(registrations.length,42);
for(const actor of actors)assert.deepEqual(new Set(Object.keys(actor.views)),new Set(allDirections),'Every real direction required');
const coverage={actors:6,requiredClips:144,requiredPoses:864,producedClips:144,clips:144,poses:864,newSources:42,newClips:126,newPoses:756,importedPilotClips:18,importedPilotPoses:108,actions,requiredDirections:allDirections,producedDirectionsByActor:Object.fromEntries(actors.map(a=>[a.id,allDirections])),missing:[],fullDirectionalSet:true};
const common={date:'2026-10-13',contract,morphologyBasis,neutralBasis,neutralApproval:plan.neutralApproval,pilotBasis,gdd,coverage,artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
await write('registration.json',{schema:'npc-motion-registration-2',...common,registrationInput:registrationFile,registrationInputSha256:await digest(local(registrationFile)),sourceAssessment:'review/source-assessment.json',sourceAssessmentSha256:await digest(local('review/source-assessment.json')),sources:registrations});
await write('catalog.json',{schema:'npc-motion-catalog-2',id:'van-hai-npc-wave-a-motion-v2',version:2,status:'six-npc-eight-real-direction-owner-review-pending',generator:'project-router-gpt-image-2-edit',...common,pixelsResampled:true,actors,clips,sources,registration:'registration.json'});
await write('production.json',{...plan,schema:'npc-motion-production-2',id:'van-hai-npc-wave-a-motion-v2',status:'six-npc-eight-direction-motion-owner-review-pending',...common,productionPlanSha256:await digest(local('production-plan.json')),sources,registration:'registration.json',registrationSha256:await digest(local('registration.json'))});
await verifyPins();
console.log(JSON.stringify({actors:6,clips:144,poses:864,newSources:42,newClips:126,newPoses:756,directions:allDirections,approvedMotionPilotPinsVerified:219,approvedNeutralPinsVerified:45,motionApproved:false,runtimeImported:false}));
