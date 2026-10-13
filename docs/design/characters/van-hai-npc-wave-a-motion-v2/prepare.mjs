// Preparation only. Approved pilot/static neutral/live player are read-only.
import {readFile,writeFile,copyFile,mkdir,access} from 'node:fs/promises';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const pilot=resolve(root,'../van-hai-npc-wave-a-motion-v1'),standard=resolve(root,'../van-hai-npc-visual-standard-v1');
const hash=b=>createHash('sha256').update(b).digest('hex'),digest=async f=>hash(await readFile(f));
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const save=async(f,j)=>writeFile(resolve(root,f),JSON.stringify(j,null,2)+'\n',{flag:'wx'});
try{await access(resolve(root,'production-plan.json'));throw Error('Prepared pack must be preserved; use a new version.');}catch(e){if(e.code!=='ENOENT')throw e;}
const approvalFile=resolve(pilot,'approval.json'),approval=await json(approvalFile);
assert.equal(approval.ownerApproved,true);assert.equal(approval.motionApproved,true);assert.equal(approval.runtimeApproved,false);
assert.equal(approval.pinnedFiles.length,219);
for(const pin of approval.pinnedFiles)assert.equal(await digest(resolve(pilot,pin.file)),pin.sha256,'Accepted pilot changed: '+pin.file);
const prior=await json(resolve(pilot,'production-plan.json')),catalog=await json(resolve(pilot,'catalog.json'));
const draft=await json(resolve(root,'brief-draft.json'));assert.equal(draft.requests.length,42);
const dirs=['south','southwest','west','northwest','north','northeast','east','southeast'];
const directionsFile=resolve(standard,'directions.json'),directions=await json(directionsFile),basisFile=resolve(standard,'basis.json'),basis=await json(basisFile);
assert.equal(await digest(resolve(workspace,basis.sourceCatalog)),basis.sourceCatalogSha256);
for(const folder of ['inputs','prompts','specs','plans','raw','review'])await mkdir(resolve(root,folder),{recursive:true});
for(const d of directions.directions){
 assert.equal(await digest(resolve(workspace,d.atlas)),d.atlasSha256);
 for(const [f,h]of [[d.native,d.nativeSha256],[d.nearest8x,d.nearest8xSha256]]){
  assert.equal(await digest(resolve(standard,f)),h);
  await copyFile(resolve(standard,f),resolve(root,'inputs',f.split('/').at(-1)));
 }
}
const actors=[],requests=[],identityInputs=[];
for(const a of prior.actors){
 const accepted=catalog.actors.find(n=>n.id===a.id),calibration='inputs/'+a.slug+'-approved-southeast-nearest8x.png';
 const motion='inputs/'+a.slug+'-approved-southeast-actions.png',native='inputs/'+a.slug+'-approved-neutral-native.png';
 const png=await readFile(resolve(pilot,accepted.neutralSprite));
 assert.equal(hash(png),accepted.neutralSha256);
 await sharp(png).resize(768,768,{kernel:'nearest'}).png().toFile(resolve(root,calibration));
 await copyFile(resolve(pilot,accepted.source),resolve(root,motion));
 assert.equal(await digest(resolve(root,motion)),accepted.sourceSha256);
 await copyFile(resolve(pilot,accepted.identityReference.file),resolve(root,native));
 const identityReference={...accepted.identityReference,file:native};
 assert.equal(await digest(resolve(root,native)),identityReference.sha256);
 actors.push({...a,identityReference,acceptedPilotNeutral:{file:'../van-hai-npc-wave-a-motion-v1/'+accepted.neutralSprite,sha256:accepted.neutralSha256}});
 identityInputs.push({id:a.id,slug:a.slug,identityReference,motionCalibration:{file:calibration,sha256:await digest(resolve(root,calibration)),source:'../van-hai-npc-wave-a-motion-v1/'+accepted.neutralSprite,sourceSha256:accepted.neutralSha256},motionSupport:{file:motion,sha256:accepted.sourceSha256}});
 for(const direction of dirs.filter(d=>d!=='southeast')){
  const id=a.slug+'-'+direction,b=draft.requests.find(q=>q.id===id);assert.ok(b);
  const images=['inputs/wang-lin-live-'+direction+'-nearest8x.png',calibration,motion];
  const inputHashes=await Promise.all(images.map(async file=>({file,sha256:await digest(resolve(root,file))})));
  const prompt=b.prompt.replace('IMAGE2 is the SAME NPC accepted Southeast native neutral enlarged nearest8x','IMAGE2 is the SAME NPC OWNER-APPROVED Southeast motion calibration frame enlarged nearest8x (96x96 native including transparent padding, body unchanged)');
  assert.ok(prompt.includes('ALL18poses remain'));
  const promptFile='prompts/'+id+'.txt',specFile='specs/'+id+'.json',assetPlan='plans/'+id+'.json',source='raw/'+id+'.png';
  await writeFile(resolve(root,promptFile),prompt+'\n',{flag:'wx'});
  await save(specFile,{assetType:'character-concept',name:'vn-npc-wave-a-motion-'+id+'-v2',prompt,size:'1536x1536',quality:'high',n:1});
  requests.push({id,slug:a.slug,actorId:a.id,direction,source,prompt:promptFile,promptSha256:hash(Buffer.from(prompt+'\n')),spec:specFile,assetPlan,images,inputHashes,identityReference,
   cameraKind:b.cameraKind,actionSteps:b.actionSteps,occlusionRule:b.occlusionRule,actorOcclusion:b.actorOcclusion,propContinuity:b.propContinuity,gestureOrigin:b.origin,
   referencePolicy:{stage:'new-real-direction-with-neutral-calibration',editTargetFirst:false,primaryStyleImageIndex:1,ownApprovedPilotIdentityLocked:true},
   status:'planned-awaiting-pure-asset-plan',artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false});
 }
}
assert.equal(requests.length,42);assert.equal(actors.length,6);
const rel=f=>relative(workspace,f).replaceAll('\\','/');
const pilotApproval={file:rel(approvalFile),sha256:await digest(approvalFile),pinnedCount:219};
const neutralApproval=prior.neutralApproval;
await save('inputs/references.json',{schema:'npc-wave-a-eight-direction-input-provenance-1',date:'2026-10-13',pilotApproval,neutralApproval,
 inputOrder:['Image1 actual live Wang same direction PRIMARY anatomy/style/camera','Image2 own approved Southeast motion calibration nearest8x identity','Image3 own approved Southeast motion source identity/gesture support'],noNpcToNpcStyleChain:true,actors:identityInputs});
await save('production-plan.json',{
 schema:'npc-motion-eight-direction-plan-2',id:'VH-NPC-WAVE-A-MOTION-02',date:'2026-10-13',ownerContinuation:approval.ownerFeedback,
 status:'seven-new-views-production',scope:'Six approved Wave A Southeast pilots; seven real new views, three actions each; preserve accepted Southeast',
 basis:'../van-hai-npc-wave-a-motion-v1/approval.json',basisSha256:pilotApproval.sha256,pilotApproval,neutralApproval,
 sourcePlan:prior.sourcePlan,sourcePlanSha256:prior.sourcePlanSha256,primaryStandard:rel(basisFile),primaryStandardSha256:await digest(basisFile),
 directionalStandard:rel(directionsFile),directionalStandardSha256:await digest(directionsFile),
 briefDraft:'brief-draft.json',briefDraftSha256:await digest(resolve(root,'brief-draft.json')),skill:'docs/skills/game-actor-animation-production/SKILL.md',
 generator:'project-router-gpt-image-2-edit',requestedSize:'1536x1536',quality:'high',
 directions:dirs,actions:['idle','talk','profession'],framesPerClip:6,actors,requests,
 sheetLayout:{columns:6,rows:3,rowOrder:['idle','talk','profession'],neutralCalibration:'row1frame1'},
 timings:{idle:{durationMs:1200,loop:true},talk:{durationMs:1200,loop:true},profession:{durationMs:1500,loop:false}},
 canvas:[96,96],pivot:[48,88],neutralHeight:80,neutralBodyHeightPx:80,oneScalePerSourceFromNeutral:true,perPoseFitAllowed:false,
 requiredClips:144,requiredPoses:864,newRequests:42,requiredSources:42,newClips:126,newPoses:756,preservedPilotClips:18,preservedPilotPoses:108,
 artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false,
 retryPolicy:'No automatic paid POST retry; previous four-NPC V2 JSON retry authorization does not extend to this new six-NPC pack.'
});
console.log(JSON.stringify({preparedSources:42,newClips:126,newPoses:756,totalClips:144,totalPoses:864,acceptedPilotPinsPreserved:219,paidRequests:0}));
