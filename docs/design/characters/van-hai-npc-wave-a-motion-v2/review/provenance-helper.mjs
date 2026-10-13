// Read-only source lineage checks shared by manual confirmation and strict packing.
import {readFile} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';

export function createSourceProvenanceValidator({root,workspace,plan,directions,pilotRoot,pilotCatalog}){
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 function safe(base,file){const path=resolve(base,file),rel=relative(base,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside lineage root: '+file);return path;}
 const local=file=>safe(root,file),inWorkspace=file=>safe(workspace,file);
 const json=async file=>JSON.parse(await readFile(file,'utf8'));
 const digest=async file=>hash(await readFile(file));
 const canvas=[96,96],pivot=[48,88];
 async function validateMetadata(request,id,own,live,seen){
  assert.equal(request.id??request.slug+'-'+request.direction,id,'Lineage request ID changed');assert.equal(request.slug,own.slug);assert.equal(request.actorId??own.id,own.id);assert.equal(request.direction,live.direction);
  const sourceSha256=await digest(local(request.source));assert.ok(!seen.has(sourceSha256),'Cyclic source correction lineage');
  const nextSeen=new Set(seen);nextSeen.add(sourceSha256);
  const metadataFile=request.source.replace(/\.png$/i,'.json'),metadataBytes=await readFile(local(metadataFile)),metadata=JSON.parse(metadataBytes);
  assert.equal(metadata.model,'gpt-image-2');assert.equal(metadata.operation,'edit');assert.equal(metadata.image.sha256,sourceSha256);
  assert.equal(metadata.prompt.trim(),(await readFile(local(request.prompt),'utf8')).trim());
  if(request.background!==undefined){assert.ok(['transparent','opaque','auto'].includes(request.background));assert.equal(metadata.requestParameters?.background,request.background,'Explicit background differs from actual request metadata');}
  assert.equal(metadata.inputImages.length,request.inputHashes.length);assert.equal(request.images.length,request.inputHashes.length);
  assert.equal(metadata.inputImages[0].sha256,live.nearest8xSha256,'Same-view live Wang must remain primary Image1 in every source ancestor');
  assert.equal(request.referencePolicy?.primaryStyleImageIndex??1,1);assert.equal(request.referencePolicy?.editTargetFirst??false,false);
  for(const [index,input] of request.inputHashes.entries()){
   assert.equal(request.images[index],input.file);assert.equal(await digest(local(input.file)),input.sha256);
   assert.equal(metadata.inputImages[index].sha256,input.sha256);assert.equal(await digest(inWorkspace(metadata.inputImages[index].path)),input.sha256);
  }
  return {metadata,metadataFile,sourceSha256,routerMetadataSha256:hash(metadataBytes),nextSeen};
 }
 async function exactPilotCalibration(input,own){
  const calibration=await readFile(safe(pilotRoot,own.neutralSprite));assert.equal(hash(calibration),own.neutralSha256);
  const calibrationInfo=await sharp(calibration).metadata(),image=local(input.file),imageInfo=await sharp(image).metadata();
  assert.equal(imageInfo.width,calibrationInfo.width*8);assert.equal(imageInfo.height,calibrationInfo.height*8);
  assert.deepEqual(await sharp(calibration).resize(imageInfo.width,imageInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(image).ensureAlpha().raw().toBuffer(),'Own approved southeast calibration pixels required; no other NPC or action sheet');
 }
 async function validateStandaloneNeutralLineage(request,id,live,own,seen=new Set()){
  const record=await validateMetadata(request,id,own,live,seen),{metadata,nextSeen}=record;
  const correction=request.referencePolicy?.sameActorSameDirectionCorrection===true,support=request.referencePolicy?.supportApprovedPilotCalibration===true,parents=request.lineageParents??[],chain=[];
  assert.equal(metadata.inputImages.length,support?3:2,'Neutral input count must follow explicit accepted calibration support policy');
  if(support)assert.equal(correction,true,'Extra accepted calibration requires an explicit same-view correction');
  if(correction){
   assert.ok(Array.isArray(parents)&&parents.length,'Same-view neutral correction needs pinned prior lineage');
   assert.equal(metadata.inputImages[1].sha256,parents.at(-1).sourceSha256,'Neutral Image2 must be pinned same-actor/same-view parent raw');
   for(const parent of parents){assert.ok(parent.request&&parent.sourceSha256&&parent.routerMetadataSha256);
    assert.equal(await digest(local(parent.request.source)),parent.sourceSha256);assert.equal(await digest(local(parent.request.source.replace(/\.png$/i,'.json'))),parent.routerMetadataSha256);
    chain.push(...await validateStandaloneNeutralLineage(parent.request,id,live,own,nextSeen));
   }
  }else{assert.equal(parents.length,0);await exactPilotCalibration(request.inputHashes[1],own);}
  if(support){const original=chain.find(row=>!row.sameActorSameDirectionCorrection);assert.ok(original);const originalMetadata=await json(local(original.routerMetadata));assert.equal(metadata.inputImages[2].sha256,originalMetadata.inputImages[1].sha256);await exactPilotCalibration(request.inputHashes[2],own);}
  chain.push({requestId:id,slug:request.slug,direction:request.direction,source:request.source,sourceSha256:record.sourceSha256,routerMetadata:record.metadataFile,routerMetadataSha256:record.routerMetadataSha256,primaryStyleImageIndex:1,identityOrCorrectionImageIndex:2,sameActorSameDirectionCorrection:correction,supportApprovedPilotCalibration:support,supportImageIndex:support?3:null});
  return [...new Map(chain.map(row=>[row.sourceSha256,row])).values()];
 }
 async function validateDirectionNeutral(request,id,live,own){
  const nr=request.directionNeutralReference;assert.ok(nr?.source&&nr?.native&&nr?.registration,'Same-view neutral provenance required');
  assert.equal(await digest(local(nr.source)),nr.sourceSha256);assert.equal(await digest(local(nr.native)),nr.nativeSha256);assert.equal(await digest(local(nr.registration)),nr.registrationSha256);
  const registration=await json(local(nr.registration));
  assert.equal(registration.schema,'npc-direction-neutral-registration-1');assert.equal(registration.actor,own.id);assert.equal(registration.slug,own.slug);assert.equal(registration.direction,live.direction);
  for(const field of ['source','sourceSha256','native','nativeSha256'])assert.equal(registration[field],nr[field]);
  for(const flag of ['visuallyReviewed','neutralBodyTopConfirmed','manualSourceReviewConfirmed'])assert.equal(registration[flag],true);
  assert.equal(registration.proposalOnly,false);assert.equal(registration.rgbPainted,false);assert.equal(registration.resampling,'nearest-once');assert.equal(registration.clippedOpaquePixels,0);
  assert.deepEqual(registration.canvas,canvas);assert.deepEqual(registration.pivot,pivot);
  for(const field of ['neutralBodyTopBasis','manualSourceReviewBasis'])assert.ok(typeof registration[field]==='string'&&registration[field].length>20);
  if(registration.componentClassification?.retainedAccessoryParts?.length){assert.equal(registration.manualComponentReviewConfirmed,true);assert.ok(registration.manualComponentReviewBasis?.length>20);}
  const witness=registration.bootPairSupportWitness;assert.ok(Array.isArray(witness)&&witness.length===4&&witness.every(Number.isFinite));assert.ok(witness[0]<=registration.rootX&&registration.rootX<=witness[2]&&witness[1]<=registration.rootY&&registration.rootY<=witness[3]);
  assert.ok(Math.abs(registration.scale-80/(registration.rootY-registration.neutralTopY))<1e-9);
  assert.equal(await digest(local(registration.nearest8x)),registration.nearest8xSha256);
  const native=await readFile(local(nr.native)),nativeInfo=await sharp(native).metadata(),largeInfo=await sharp(local(registration.nearest8x)).metadata();
  assert.deepEqual([nativeInfo.width,nativeInfo.height],canvas);assert.deepEqual([largeInfo.width,largeInfo.height],canvas.map(value=>value*8));
  assert.deepEqual(await sharp(native).resize(largeInfo.width,largeInfo.height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer(),await sharp(local(registration.nearest8x)).ensureAlpha().raw().toBuffer());
  const neutralRequest=plan.neutralRequests?.find(row=>row.slug===own.slug&&row.direction===live.direction&&row.source===nr.source);assert.ok(neutralRequest,'Exact selected same-view neutral request required');
  return {nr,registration,neutralLineage:await validateStandaloneNeutralLineage(neutralRequest,id,live,own)};
 }
 async function validateMotionLineage(request,seen=new Set()){
  const id=request.id??request.slug+'-'+request.direction,own=pilotCatalog.actors.find(row=>row.slug===request.slug&&row.id===request.actorId),live=directions.directions.find(row=>row.direction===request.direction);
  assert.ok(own&&live,'Exact own pilot actor and live view required');
  assert.equal(request.referencePolicy?.primaryStyleImageIndex,1);assert.equal(request.referencePolicy?.editTargetFirst,false);
  const record=await validateMetadata(request,id,own,live,seen),{metadata,nextSeen}=record;
  let sourceEdgeReview=null;
  if(seen.size===0){
   const {data,info}=await sharp(local(request.source)).ensureAlpha().raw().toBuffer({resolveWithObject:true}),counts={top:0,right:0,bottom:0,left:0},threshold=128;
   for(let x=0;x<info.width;x++){if(data[x*4+3]>=threshold)counts.top++;if(data[((info.height-1)*info.width+x)*4+3]>=threshold)counts.bottom++;}
   for(let y=0;y<info.height;y++){if(data[(y*info.width)*4+3]>=threshold)counts.left++;if(data[(y*info.width+info.width-1)*4+3]>=threshold)counts.right++;}
   assert.ok(Object.values(counts).every(count=>count===0),'Selected motion source has opaque body/prop pixels at PNG edge; repair the raw source rather than cropping, mirroring or pretending a cut weapon tip is complete: '+id);
   sourceEdgeReview={source:request.source,sourceSha256:record.sourceSha256,size:[info.width,info.height],alphaThreshold:threshold,opaqueEdgePixels:counts,sourceUnmodified:true};
  }
  assert.equal(metadata.inputImages.length,3);assert.equal(request.referencePolicy?.ownApprovedPilotIdentityLocked,true);
  const sameDirection=request.referencePolicy?.sameDirectionNeutralInput===true,parent=request.sourceCorrectionParent;let neutral=null,parents=[];
  if(sameDirection){
   neutral=await validateDirectionNeutral(request,id,live,own);
   if(parent){
    assert.equal(request.referencePolicy?.stage,'explicit-same-view-action-repair');assert.equal(request.referencePolicy?.correctionTargetImageIndex,2);
    assert.ok(parent.request&&parent.sourceSha256&&parent.routerMetadataSha256&&parent.reason?.length>20);
    assert.equal(parent.request.id??parent.request.slug+'-'+parent.request.direction,id);assert.equal(parent.request.slug,request.slug);assert.equal(parent.request.actorId,request.actorId);assert.equal(parent.request.direction,request.direction);
    assert.equal(parent.request.referencePolicy?.sameDirectionNeutralInput,true,'Action correction must trace to motion made from verified same-view neutral');
    assert.equal(await digest(local(parent.request.source)),parent.sourceSha256);assert.equal(await digest(local(parent.request.source.replace(/\.png$/i,'.json'))),parent.routerMetadataSha256);
    assert.equal(metadata.inputImages[1].sha256,parent.sourceSha256,'Correction Image2 must be pinned own same-view motion parent');
    assert.equal(metadata.inputImages[2].sha256,neutral.registration.nearest8xSha256,'Correction Image3 must be exact verified same-view neutral nearest8x');
    assert.deepEqual(parent.request.directionNeutralReference,request.directionNeutralReference,'Motion correction must preserve the same verified neutral reference');
    parents=await validateMotionLineage(parent.request,nextSeen);
   }else{
    assert.equal(metadata.inputImages[1].sha256,neutral.registration.nearest8xSha256,'Motion Image2 must be own true-view neutral nearest8x');
    assert.equal(metadata.inputImages[2].sha256,neutral.nr.sourceSha256,'Motion Image3 must be own true-view neutral raw');
   }
  }else{
   assert.equal(parent,undefined,'Pilot-supported original cannot declare unvalidated action correction');
   assert.equal(metadata.inputImages[2].sha256,own.sourceSha256,'Original Image3 must be own accepted southeast motion source');await exactPilotCalibration(request.inputHashes[1],own);
  }
  return [...parents,{requestId:id,slug:request.slug,actor:request.actorId,direction:request.direction,source:request.source,sourceSha256:record.sourceSha256,routerMetadata:record.metadataFile,routerMetadataSha256:record.routerMetadataSha256,primaryStyleImageIndex:1,identityImageIndex:parent?3:2,correctionTargetImageIndex:parent?2:null,sameDirectionNeutralInput:sameDirection,sourceCorrectionParent:parent?{source:parent.request.source,sourceSha256:parent.sourceSha256,routerMetadataSha256:parent.routerMetadataSha256,reason:parent.reason}:null,...(sourceEdgeReview?{sourceEdgeReview}:{}),...(request.background!==undefined?{background:request.background}:{})}];
 }
 return {validateStandaloneNeutralLineage,validateMotionLineage};
}
