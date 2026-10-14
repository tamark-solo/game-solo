import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=async file=>JSON.parse((await fs.readFile(path.resolve(root,file),'utf8')).replace(/^\uFEFF/,''));
const optional=async file=>{try{return await read(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(await optional('approval.json'))throw Error('Approved V2 is immutable');
const basis=await read('basis.json');
for(const p of [...basis.files,...basis.protectedRuntimeAndMap])if(hash(await fs.readFile(path.resolve(root,p.file)))!==p.sha256)throw Error('Protected file changed: '+p.file);
const pilot=await read('../wang-lin-equipment-production-v1/manifest.json');
const pilotApproval=await read('../wang-lin-equipment-production-v1/approval.json');
const pathKeys=new Set(['file','image','sprite','nativeFile','nativeImage','source','raw','prompt','atlas','fullFile','frontFile','rearFile','sourcePropNative','propNative','propSource','concept','master','identityMaster','canonical','native','sourcePropMaster']);
function rebase(value){if(Array.isArray(value))return value.map(rebase);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,typeof v==='string'&&pathKeys.has(k)&&/\.(png|webp|jpg|json|mjs|txt)$/.test(v)?'../wang-lin-equipment-production-v1/'+v:rebase(v)]));return value;}
const directions=['north','northeast','east','southeast','south','southwest','west','northwest'];
const actions=['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe'];
const familyIds=['sword','banner','chariot','bead'];
for(const family of familyIds){const checkpoint=await optional(`checkpoints/${family}.json`);for(const pin of checkpoint?.files??[])if(hash(await fs.readFile(path.resolve(root,pin.file)))!==pin.sha256)throw Error('Completed family changed: '+pin.file);}
const clips=new Map((pilot.motions.clips??[]).map(c=>{
 const copy=rebase(c);
 if(c.direction==='north'){
  const holds=c.action==='cast-single-target'?[160,160,160,160,160,300]:c.action==='cast-aoe'?[260,270,270,320,520,540]:null;
  copy.frames=copy.frames.map(({gearLayers,gearMode,gearPresentation,...f},i)=>({...f,...(holds?{durationMs:holds[i]}:{})}));
  if(holds){if(copy.frames.length!==holds.length)throw Error('Pilot N cast key count changed');copy.durationMs=holds.reduce((n,v)=>n+v,0);copy.presentationTimingScope='V2 Core fixture holds; approved pilot body pixels unchanged, timing not approved balance';}
 }
 return [c.id,{...copy,reusedFrom:'../wang-lin-equipment-production-v1/approval.json',bodyOwnerApproved:true,ownerApproved:c.direction==='southeast',approvalScope:c.direction==='southeast'?'approved pilot body and gear':'approved pilot body; new directional gear track remains candidate'}];
}));
const registrations=[],calibrations=[];
for(const identity of ['a','b'])for(const family of familyIds){
 const file=`actors/${identity}/${family}/registration.json`,reg=await optional(file);if(!reg)continue;
 registrations.push({identityId:identity,familyId:family,file,sha256:hash(await fs.readFile(path.resolve(root,file))),sourceCount:reg.sources?.length??0,coverage:reg.coverage,manualSourceReviewComplete:reg.socketReviewComplete===true||reg.manualReviewPending===false});
 for(const clip of reg.clips??[])if(!clips.has(clip.id)){
  const source=(reg.sources??[]).find(s=>s.id===clip.sourceId);
  clips.set(clip.id,{...clip,...(!clip.source&&source?.file?{source:source.file}:{})});
 }
 for(const cal of reg.calibrations??[])calibrations.push({...cal,identityId:cal.identityId??identity,familyId:cal.familyId??family,direction:cal.direction??reg.sources?.find(s=>s.id===cal.sourceId)?.direction});
}
const pilotMotion=await read('../wang-lin-equipment-production-v1/motion-registration.json');
for(const cal of pilotMotion.calibrations)calibrations.push({...rebase(cal),familyId:'sword',reusedFrom:'../wang-lin-equipment-production-v1/approval.json'});
const gearViews=[],gearSourcePins=new Map();
for(const family of familyIds){const file=`gear/${family}/registration.json`,reg=await optional(file);if(reg){gearViews.push(...reg.records);gearSourcePins.set(family,{file,sha256:hash(await fs.readFile(path.resolve(root,file)))});}}
const gearTracks=await optional('tracks/registration.json');
const bannerGroundFile='support/banner-base-measurement/measurements.json';
const bannerGround=await optional(bannerGroundFile),bannerGroundSha=bannerGround?hash(await fs.readFile(path.resolve(root,bannerGroundFile))):null;
const gearFrameKeys=['gearLayers','body','gearMode','gearPresentation'];
for(const track of gearTracks?.clips??[]){
 const clip=clips.get(track.id);if(!clip)throw Error('Track without body '+track.id);
 if(clip.reusedFrom&&clip.direction==='southeast')continue;
 if(track.sourceGearRegistration?.sha256!==gearSourcePins.get(clip.familyId)?.sha256)continue;
 if(clip.familyId==='banner'&&track.sourceGearGroundRegistration?.sha256!==bannerGroundSha)continue;
 // A registration correction must stay authoritative. Ignore older tracks
 // until they are packed again against the corrected body and socket data.
 if(track.frames.length!==clip.frames.length)continue;
 const current=clip.frames.every((f,i)=>{
  const t=track.frames[i];
  return ['file','sha256','canvas','pivot','grip','durationMs','lift'].every(k=>JSON.stringify(f[k])===JSON.stringify(t[k]));
 });
 if(!current)continue;
 clips.set(clip.id,{...clip,gearTrackId:track.id,gearTrackApproved:false,sourceGearRegistration:track.sourceGearRegistration,...(track.sourceGearGroundRegistration?{sourceGearGroundRegistration:track.sourceGearGroundRegistration}:{}),frames:clip.frames.map((f,i)=>({...f,...Object.fromEntries(gearFrameKeys.filter(k=>k in track.frames[i]).map(k=>[k,track.frames[i][k]]))}))});
}
const views=[];
for(const family of familyIds)for(const identity of ['a','b'])for(const direction of directions){
 const cal=calibrations.find(c=>c.identityId===identity&&c.familyId===family&&c.direction===direction);
 const frame=cal?.frames?.[0];
 if(frame)views.push({id:`${family}-${identity}-${direction}`,identityId:identity,familyId:family,direction,body:frame,calibrationSourceId:cal.sourceId??cal.id,gear:gearViews.find(g=>g.identityId===identity&&g.familyId===family&&g.direction===direction),ownerApproved:false});
}
const fxManifests=[{familyId:'sword',file:'../../vfx/wang-lin-sword-pilot-v1/manifest.json',reusedFrom:'../wang-lin-equipment-production-v1/approval.json',ownerApproved:true}];
for(const family of familyIds.slice(1)){
 const candidates=[`../../vfx/wang-lin-equipment-vfx-v2/${family}/manifest.json`,`../../vfx/wang-lin-equipment-vfx-v2/${family}-manifest.json`];
 for(const file of candidates)if(await optional(file)){fxManifests.push({familyId:family,file,ownerApproved:false});break;}
}
let fxSequences=0,fxKeys=0;for(const f of fxManifests){const data=await read(f.file);fxSequences+=data.sequences.length;fxKeys+=data.sequences.reduce((n,s)=>n+s.frames.length,0);}
const orderedClips=[...clips.values()].sort((a,b)=>familyIds.indexOf(a.familyId)-familyIds.indexOf(b.familyId)||a.identityId.localeCompare(b.identityId)||directions.indexOf(a.direction)-directions.indexOf(b.direction)||actions.indexOf(a.action)-actions.indexOf(b.action));
const completeness=familyIds.map(family=>({familyId:family,clips:orderedClips.filter(c=>c.familyId===family).length,targetClips:128,
 missing:['a','b'].flatMap(identity=>directions.flatMap(direction=>actions.filter(action=>!clips.has(`${family}-${identity}-${direction}-${action}`)).map(action=>({identity,direction,action})))),
 gearViews:gearViews.filter(g=>g.familyId===family).length,targetGearViews:16,fxSequences:fxManifests.some(f=>f.familyId===family)?10:0,
 gearTrackClips:orderedClips.filter(c=>c.familyId===family&&c.frames.every(f=>f.gearLayers?.length)).length,
 manualSourceReviewComplete:registrations.filter(r=>r.familyId===family).length===2&&registrations.filter(r=>r.familyId===family).every(r=>r.manualSourceReviewComplete)}));
const manifest={schema:'wang-lin-equipment-production-2',date:'2026-10-14',title:'Huyễn Tâm · Tịch Bạch / Tám hướng và bốn đạo đồ',
 ownerStatement:pilotApproval.ownerStatement,pilotApproval:{file:'../wang-lin-equipment-production-v1/approval.json',pinnedFiles:pilotApproval.files.length},
 identities:pilot.identities,families:pilot.families,appearances:rebase(pilot.appearances).map(a=>({...a,ownerApproved:true,approvalScope:'pilot southeast neutral and resting equipment only'})),reference:rebase(pilot.reference),mapReference:pilot.mapReference,prototype:pilot.prototype,
 directions,actions,views,gearViews,registrations,fxManifests,motions:{clips:orderedClips},
 bindings:orderedClips.map(c=>({identityId:c.identityId,familyId:c.familyId,direction:c.direction,action:c.action,clipId:c.id})),
 coverage:{bodyClips:orderedClips.length,bodyKeys:orderedClips.reduce((n,c)=>n+c.frames.length,0),neutralViews:views.length,gearViews:gearViews.length,gearTrackClips:orderedClips.filter(c=>c.frames.every(f=>f.gearLayers?.length)).length,fxSequences,fxKeys,completeFamilies:completeness.filter(c=>!c.missing.length&&c.gearTrackClips===128&&c.gearViews===16&&c.fxSequences===10&&c.manualSourceReviewComplete).map(c=>c.familyId),targetBodyClips:512},
 completeness,status:'production-candidate-review',ownerApproved:false,artApproved:false,motionApproved:false,vfxApproved:false,runtimeIntegrated:false,
 policy:{bodyHeight:80,canvasOnlyPadding:true,mirrorBody:false,perPoseFit:false,oldWangIdentityPatch:false,pilotImmutable:true,coreNumbersExperimental:true}};
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(root,'progress.json'),JSON.stringify({schema:'wang-lin-equipment-production-progress-2',date:'2026-10-14',ownerStatement:pilotApproval.ownerStatement,order:familyIds,targetBodyClips:512,
 phases:completeness.map((c,i)=>({id:i?'P5'+i:'P4',...c,status:!c.missing.length&&c.gearTrackClips===128&&c.gearViews===16&&c.fxSequences===10&&c.manualSourceReviewComplete?'review-ready':c.clips?'in-production':'queued'})),coverage:manifest.coverage,pilotApproved:true,newProductionApproved:false,runtimeIntegrated:false},null,2)+'\n');
console.log(JSON.stringify({coverage:manifest.coverage,completeness:completeness.map(({missing,...c})=>({...c,missing:missing.length}))}));
