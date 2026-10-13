// Standalone true-direction neutral measurements. Suggestions never grant confirmation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha,maskedPose,suggestBootPairBandRoot} from '../../van-hai-npc-motion-v2/review/measurement-helper.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const hash=b=>createHash('sha256').update(b).digest('hex');
function safe(base,file){const path=resolve(base,file),rel=relative(base,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside allowed root: '+file);return path;}
const local=file=>safe(root,file),inWorkspace=file=>safe(workspace,file);
const json=async file=>JSON.parse(await readFile(local(file),'utf8'));
const digest=async file=>hash(await readFile(file));
const optionalJson=async file=>{try{return await json(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const write=async(file,value)=>{await mkdir(dirname(local(file)),{recursive:true});await writeFile(local(file),JSON.stringify(value,null,2)+'\n');};
async function validateStandaloneNeutralLineage(request,id,live,own,seen=new Set()){
 assert.equal(request.id??request.slug+'-'+request.direction,id,'Neutral lineage request ID changed');assert.equal(request.slug,own.slug);assert.equal(request.actorId,own.id);assert.equal(request.direction,live.direction);
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

const args=process.argv.slice(2);
assert.ok(args.every(a=>!a.startsWith('--')||['--ids','--refresh','--render','--confirm'].includes(a)),'Unknown option');
assert.ok(!(args.includes('--refresh')&&(args.includes('--render')||args.includes('--confirm'))),'Refresh cannot overwrite manual edits during render/confirm');
assert.ok(!(args.includes('--render')&&args.includes('--confirm')),'Render and inspect the candidate before a separate explicit confirm');
const ids=[...new Set(args.filter(a=>!a.startsWith('--')).flatMap(a=>a.split(',')).filter(Boolean))];
assert.ok(ids.length&&ids.every(id=>/^[a-z0-9-]+$/.test(id)),'Explicit slug-direction IDs required; no automatic all/confirmation');
assert.equal(await optionalJson('approval.json'),null,'Approved pack is immutable');
const plan=await json('production-plan.json');assert.ok(Array.isArray(plan.neutralRequests)&&plan.neutralRequests.length,'Standalone neutralRequests needed');
assert.equal(new Set(plan.neutralRequests.map(q=>q.slug+'/'+q.direction)).size,plan.neutralRequests.length,'Duplicate neutral request');
const directionsFile=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1/directions.json');
assert.equal(await digest(directionsFile),'0fef83b1121c0be2cf9b47909a00f5c3c01a665229cb1d16358fe65650b8abd9');
const directions=JSON.parse(await readFile(directionsFile,'utf8'));
const pilotRoot=inWorkspace('docs/design/characters/van-hai-npc-wave-a-motion-v1');
const pilotApprovalBytes=await readFile(resolve(pilotRoot,'approval.json'));
assert.equal(hash(pilotApprovalBytes),'0a3e8e5600961652f43189e4e48f5297890288d606f8857bac904bc4b4ccf300');
const pilotApproval=JSON.parse(pilotApprovalBytes),pilotCatalog=JSON.parse(await readFile(resolve(pilotRoot,'catalog.json'),'utf8'));
assert.equal(pilotApproval.motionApproved,true);assert.equal(pilotApproval.pinnedFiles.length,219);
for(const pin of pilotApproval.pinnedFiles)assert.equal(await digest(safe(pilotRoot,pin.file)),pin.sha256,'Approved Southeast pilot changed: '+pin.file);
const summaries=[];
for(const id of ids){
 const q=plan.neutralRequests.find(q=>(q.id??q.slug+'-'+q.direction)===id);assert.ok(q,'Unknown standalone neutral ID: '+id);
 assert.equal(id,q.slug+'-'+q.direction,'Neutral IDs must be slug-direction');
 assert.ok(plan.actors.some(a=>a.slug===q.slug)&&['south','southwest','west','northwest','north','northeast','east'].includes(q.direction),'Unknown neutral actor/view');
 const live=directions.directions.find(d=>d.direction===q.direction),own=pilotCatalog.actors.find(a=>a.slug===q.slug);assert.ok(live&&own);
 const source=await readFile(local(q.source)),sourceSha256=hash(source),metaFile=q.source.replace(/\.png$/i,'.json'),meta=await json(metaFile);
 assert.equal(meta.model,'gpt-image-2');assert.equal(meta.operation,'edit');assert.equal(meta.image.sha256,sourceSha256);
 if(q.background!==undefined)assert.equal(meta.requestParameters?.background,q.background,'Explicit neutral background differs from actual request metadata');
 assert.equal(meta.prompt.trim(),(await readFile(local(q.prompt),'utf8')).trim());
 const expectedNeutralInputs=q.referencePolicy?.supportApprovedPilotCalibration===true?3:2;
 assert.equal(meta.inputImages.length,expectedNeutralInputs,'Standalone neutral input count follows explicit support policy');assert.equal(q.inputHashes.length,expectedNeutralInputs);assert.equal(meta.inputImages[0].sha256,live.nearest8xSha256,'Wang actual view must be Image1');
 for(const [i,input] of q.inputHashes.entries()){assert.equal(await digest(local(input.file)),input.sha256);assert.equal(meta.inputImages[i].sha256,input.sha256);assert.equal(await digest(inWorkspace(meta.inputImages[i].path)),input.sha256);}
 const neutralLineage=await validateStandaloneNeutralLineage(q,id,live,own);
 const proposalFile='review/'+id+'-neutral-review-proposal.json',registrationFile='direction-neutral/review/'+id+'.json';
 const existing=await optionalJson(registrationFile);
 if(existing){assert.equal(existing.sourceSha256,sourceSha256,'Confirmed neutral source changed; use a new explicit version');assert.equal(existing.visuallyReviewed,true);assert.equal(await digest(local(existing.native)),existing.nativeSha256);assert.equal(await digest(local(existing.nearest8x)),existing.nearest8xSha256);summaries.push({id,skipped:'Confirmed neutral preserved',registration:registrationFile});continue;}
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),threshold=128;
 const sourceCornerAlpha=[[0,0],[info.width-1,0],[0,info.height-1],[info.width-1,info.height-1]].map(([x,y])=>({x,y,alpha:data[(y*info.width+x)*4+3]}));
 for(const corner of sourceCornerAlpha)assert.ok(corner.alpha<threshold,'Neutral exterior corner alpha must be below selected body threshold; opaque matte is not a neutral actor');
 const {labels,components}=labelAlpha(data,info.width,info.height,threshold),ranked=[...components].sort((a,b)=>b.area-a.area);
 assert.ok(ranked.length,'Neutral requires an occupied complete human body');
 const body=ranked[0],fullActorMinimumArea=body.area*.1,fullActorCandidates=ranked.filter(c=>c.area>=fullActorMinimumArea);
 const inside=(c,r)=>c.left>=r.left&&c.top>=r.top&&c.left+c.width<=r.left+r.width&&c.top+c.height<=r.top+r.height;
 function selectNeutral(rect,explicitLabels){
  const selected=explicitLabels?components.filter(c=>explicitLabels.includes(c.label)):components.filter(c=>inside(c,rect));
  if(explicitLabels){assert.ok(Array.isArray(explicitLabels)&&explicitLabels.length);assert.equal(selected.length,new Set(explicitLabels).size,'Unknown or duplicate neutral component label');}
  assert.ok(selected.some(c=>c.label===body.label),'The largest full human body must be retained');assert.ok(selected.every(c=>inside(c,rect)),'Neutral rect must contain every selected accessory/hair part');
  return {labels:new Set(selected.map(c=>c.label)),parts:selected.filter(c=>c.label!==body.label),method:'largest-full-human-plus-all-selected-contained-accessory-parts'};
 }
 const initialSelection=selectNeutral(body);
 const prior=await optionalJson(proposalFile);let p;
 if(prior&&args.includes('--refresh')&&prior.sourceSha256!==sourceSha256){
  const prefix='review/rejected/'+id+'-neutral-'+prior.sourceSha256;await mkdir(local('review/rejected'),{recursive:true});const archived=[];
  for(const [kind,original] of [['proposal',proposalFile],['guide','review/'+id+'-neutral-source-guide.png'],['native',prior.native],['nearest8x',prior.nearest8x],['comparison',prior.comparison]]){
   if(!original)continue;const bytes=await readFile(local(original)),sha256=hash(bytes),target=prefix+'-'+kind+(kind==='proposal'?'.json':'.png');
   try{assert.equal(hash(await readFile(local(target))),sha256,'Existing neutral revision archive differs; never replace it');}
   catch(error){if(error.code!=='ENOENT')throw error;await writeFile(local(target),bytes);}
   archived.push({kind,original,file:target,sha256});
  }
  const manifestFile=prefix+'-archive.json',manifest={schema:'npc-neutral-revision-archive-1',slug:q.slug,direction:q.direction,source:prior.source,sourceSha256:prior.sourceSha256,replacedBySource:q.source,replacedBySourceSha256:sourceSha256,files:archived,rule:'Prior neutral proposal, guide and native comparison remain byte-for-byte evidence for that exact failed source; no approval granted.'};
  try{const existing=await json(manifestFile);assert.equal(existing.sourceSha256,prior.sourceSha256);assert.deepEqual(existing.files,archived);}
  catch(error){if(error.code!=='ENOENT')throw error;await writeFile(local(manifestFile),JSON.stringify(manifest,null,2)+'\n');}
 }
 if(prior&&!args.includes('--refresh')){assert.equal(prior.sourceSha256,sourceSha256,'Source revision requires explicit refresh');p=prior;}
 else{assert.ok(!args.includes('--render')&&!args.includes('--confirm'),'Render/confirm requires an existing reviewed proposal');const candidate=suggestBootPairBandRoot(labels,info.width,body);
  p={schema:'npc-direction-neutral-review-proposal-1',date:'2026-10-13',slug:q.slug,direction:q.direction,actor:own.id,source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],prompt:q.prompt,alphaThreshold:threshold,
   sourceRect:{left:body.left,top:body.top,width:body.width,height:body.height},componentLabels:[...initialSelection.labels],neutralTopY:body.top,rootX:candidate.rootX,rootY:candidate.rootY,
   rootCandidate:candidate,neutralBodyTopConfirmed:false,neutralBodyTopBasis:'',bootPairSupportWitness:null,manualRootBasis:'',manualSourceReviewConfirmed:false,manualSourceReviewBasis:'',manualComponentReviewConfirmed:false,manualComponentReviewBasis:'',manualAccessoryComponentLabels:[],
   canvas:[96,96],pivot:[48,88],standingHeight:80,proposalOnly:true,visuallyReviewed:false,
   rule:'Set actual crown top excluding raised props, actual between-boots support root excluding weapon/robe tips, both-boot support witness and manual review descriptions. Render explicitly, inspect raw/native/Wang pair, then confirm explicitly.',
   artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
 }
 p.neutralLineage=neutralLineage;p.sourceCornerAlpha=sourceCornerAlpha;p.cornerAlphaPolicy={bodyAlphaThreshold:threshold,exteriorCornersBelowThreshold:true,sourceUnmodified:true,rule:'Subthreshold soft fringe including alpha1 is outside the binary body mask; no matte removal or source image edit.'};
 assert.equal(p.sourceSha256,sourceSha256);assert.equal(p.slug,q.slug);assert.equal(p.direction,q.direction);assert.equal(p.proposalOnly,true);
 const rect=p.sourceRect;assert.ok(p.neutralTopY>=rect.top&&p.neutralTopY<p.rootY&&p.rootY<=rect.top+rect.height);
 assert.ok(Number.isFinite(p.rootX)&&p.rootX>=rect.left&&p.rootX<=rect.left+rect.width);
 const neutralHeight=p.rootY-p.neutralTopY,scale=80/neutralHeight;assert.ok(Number.isFinite(scale)&&scale>0);
 const selection=selectNeutral(rect,p.componentLabels);
 p.componentClassification={fullActorMinimumArea,largestHumanComponent:body,fullActorCandidates,retainedAccessoryParts:selection.parts,rule:'Standalone large-portrait human classification uses10%largestarea, not the18-pose helper250px cutoff. Every selected accessory/hair pixel remains retained; ambiguous other full actors require explicit manual accessory classification.'};
 const unassigned=components.filter(c=>!selection.labels.has(c.label)),excluded=p.excludedComponentLabels??[];
 if(args.includes('--confirm'))for(const c of unassigned)assert.ok(c.area<250&&excluded.includes(c.label),'Unassigned tiny alpha islands need explicit source review');
 if(excluded.length)assert.ok(typeof p.excludedComponentBasis==='string'&&p.excludedComponentBasis.length>20);
 p.unassignedComponents=unassigned;
 const witness=Array.isArray(p.bootPairSupportWitness)?p.bootPairSupportWitness:null;
 const guideFile='review/'+id+'-neutral-source-guide.png';
 const overlay='<svg width="'+info.width+'" height="'+info.height+'"><rect x="'+rect.left+'" y="'+rect.top+'" width="'+rect.width+'" height="'+rect.height+'" fill="none" stroke="#3c9c60" stroke-width="3"/><path d="M'+rect.left+' '+p.neutralTopY+'h'+rect.width+'" stroke="#3575b8" stroke-width="3"/><circle cx="'+p.rootX+'" cy="'+p.rootY+'" r="9" fill="none" stroke="#d94768" stroke-width="3"/>'+(witness?'<rect x="'+witness[0]+'" y="'+witness[1]+'" width="'+(witness[2]-witness[0])+'" height="'+(witness[3]-witness[1])+'" fill="none" stroke="#ed963b" stroke-width="3"/>':'')+'</svg>';
 await mkdir(local('review'),{recursive:true});
 await sharp({create:{width:info.width,height:info.height,channels:4,background:'#ece5d7'}}).composite([{input:source,left:0,top:0},{input:Buffer.from(overlay),left:0,top:0}]).png().toFile(local(guideFile));
 const measurementHash=hash(Buffer.from(JSON.stringify({sourceRect:rect,componentLabels:p.componentLabels,manualAccessoryComponentLabels:p.manualAccessoryComponentLabels??[],neutralTopY:p.neutralTopY,rootX:p.rootX,rootY:p.rootY,bootPairSupportWitness:p.bootPairSupportWitness})));
 if(args.includes('--confirm')){
  assert.equal(p.neutralBodyTopConfirmed,true,'Actual crown confirmation required');assert.ok(typeof p.neutralBodyTopBasis==='string'&&p.neutralBodyTopBasis.length>20);
  assert.equal(p.manualSourceReviewConfirmed,true,'Raw view/identity/anatomy/props and native comparison must be manually reviewed');
  const accessoryLabels=p.manualAccessoryComponentLabels??[];assert.ok(Array.isArray(accessoryLabels)&&!accessoryLabels.includes(body.label));
  assert.ok(accessoryLabels.every(label=>selection.parts.some(part=>part.label===label)),'Unknown manual accessory component');
  assert.equal(fullActorCandidates.filter(candidate=>!accessoryLabels.includes(candidate.label)).length,1,'More than one possible full actor requires explicit manual accessory-part classification');
  if(selection.parts.length||fullActorCandidates.length>1){assert.equal(p.manualComponentReviewConfirmed,true,'Retained hair/accessory parts must be explicitly reviewed');assert.ok(typeof p.manualComponentReviewBasis==='string'&&p.manualComponentReviewBasis.length>20,'Describe retained parts and confirm there is only one full human actor');}
assert.ok(typeof p.manualSourceReviewBasis==='string'&&p.manualSourceReviewBasis.length>20);
  assert.ok(typeof p.manualRootBasis==='string'&&p.manualRootBasis.length>20&&!p.manualRootBasis.includes('UNCONFIRMED'));
  assert.ok(witness&&witness.length===4&&witness.every(Number.isFinite),'Both-boot support witness required');
  assert.ok(witness[0]>=rect.left&&witness[1]>=rect.top&&witness[2]<=rect.left+rect.width&&witness[3]<=rect.top+rect.height);
  assert.ok(witness[0]<=p.rootX&&p.rootX<=witness[2]&&witness[1]<=p.rootY&&p.rootY<=witness[3],'Root must lie in measured boot-pair support');
  assert.equal(p.renderedMeasurementSha256,measurementHash,'Measurements changed after rendering; run --render');
  assert.equal(p.clippedOpaquePixels,0,'Do not clip pixels or shrink anatomy to fit');
  assert.equal(await digest(local(p.native)),p.nativeSha256);assert.equal(await digest(local(p.nearest8x)),p.nearest8xSha256);assert.equal(await digest(local(p.comparison)),p.comparisonSha256);
  const registration={...p,schema:'npc-direction-neutral-registration-1',proposalOnly:false,visuallyReviewed:true,scale,neutralHeight,rootBasis:p.manualRootBasis,
   proposal:proposalFile,proposalSha256:await digest(local(proposalFile)),sourceGuide:guideFile,sourceGuideSha256:await digest(local(guideFile)),sourceAssessmentScope:'Same actor/view neutral identity, anatomy, camera, rear occlusion and root; owner ART/motion approval remains separate',
   primaryStyleImageIndex:1,identityImageIndex:2,routerMetadata:metaFile,routerMetadataSha256:await digest(local(metaFile)),inputs:meta.inputImages.map(input=>({...input,path:relative(workspace,inWorkspace(input.path)).replaceAll('\\','/')})),
   confirmation:{explicitId:id,date:'2026-10-13',ownerApproved:false,artApproved:false,motionApproved:false,runtimeImported:false}};
  await write(registrationFile,registration);summaries.push({id,confirmed:true,registration:registrationFile,native:p.native,nativeSha256:p.nativeSha256,scale});continue;
 }
 if(args.includes('--render')||!prior||args.includes('--refresh')){
  const {pixels:crop,opaque}=maskedPose(data,info.width,info.height,labels,selection.labels,rect),size=[Math.max(1,Math.round(rect.width*scale)),Math.max(1,Math.round(rect.height*scale))];
  assert.equal(opaque,[...selection.labels].reduce((sum,label)=>sum+components.find(c=>c.label===label).area,0));
  const pixels=await sharp(crop,{raw:{width:rect.width,height:rect.height,channels:4}}).resize(size[0],size[1],{kernel:'nearest'}).raw().toBuffer(),native=Buffer.alloc(96*96*4),offset=[Math.round(48-(p.rootX-rect.left)*scale),Math.round(88-(p.rootY-rect.top)*scale)];
  let clippedOpaquePixels=0,nativeOpaquePixels=0;
  for(let y=0;y<size[1];y++)for(let x=0;x<size[0];x++){const src=(y*size[0]+x)*4;if(!pixels[src+3])continue;const dx=x+offset[0],dy=y+offset[1];if(dx<0||dy<0||dx>=96||dy>=96){clippedOpaquePixels++;continue;}pixels.copy(native,(dy*96+dx)*4,src,src+4);nativeOpaquePixels++;}
  const nativeFile='direction-neutral/native/'+id+'.png',nearestFile='direction-neutral/nearest8x/'+id+'.png',comparisonFile='review/'+id+'-neutral-wang-pair-2x.png';
  await mkdir(dirname(local(nativeFile)),{recursive:true});await mkdir(dirname(local(nearestFile)),{recursive:true});
  const nativeBytes=await sharp(native,{raw:{width:96,height:96,channels:4}}).png().toBuffer();await writeFile(local(nativeFile),nativeBytes);await sharp(nativeBytes).resize(768,768,{kernel:'nearest'}).png().toFile(local(nearestFile));
  const liveFile=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1/'+live.native);assert.equal(await digest(liveFile),live.nativeSha256);
  const comparison=await sharp({create:{width:320,height:104,channels:4,background:'#e9e6db'}}).composite([{input:await readFile(liveFile),left:48,top:0},{input:nativeBytes,left:176,top:0},{input:Buffer.from('<svg width="320" height="104"><path d="M0 88H320" stroke="#718e7d" stroke-width="1"/><text x="48" y="102" font-family="monospace" font-size="9">Wang live</text><text x="176" y="102" font-family="monospace" font-size="9">'+id+'</text></svg>'),left:0,top:0}]).png().toBuffer();
  await sharp(comparison).resize(640,208,{kernel:'nearest'}).png().toFile(local(comparisonFile));
  Object.assign(p,{scale,neutralHeight,renderedMeasurementSha256:measurementHash,native:nativeFile,nativeSha256:hash(nativeBytes),nearest8x:nearestFile,nearest8xSha256:await digest(local(nearestFile)),comparison:comparisonFile,comparisonSha256:await digest(local(comparisonFile)),nativeOpaquePixels,clippedOpaquePixels,sourceOpaquePixels:opaque,opaquePixelsDropped:clippedOpaquePixels,rgbPainted:false,resampling:'nearest-once',offset});
 }
 await write(proposalFile,p);summaries.push({id,proposal:proposalFile,guide:guideFile,native:p.native??null,scale,clippedOpaquePixels:p.clippedOpaquePixels??null,manualConfirmationRequired:true});
}
console.log(JSON.stringify({neutrals:summaries,artApprovalGranted:false,apiCalled:false}));
