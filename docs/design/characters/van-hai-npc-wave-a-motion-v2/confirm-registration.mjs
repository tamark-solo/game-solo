// Explicit, exact-source measurement confirmation. Does not approve NPC motion ART.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createSourceProvenanceValidator} from './review/provenance-helper.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const hash=b=>createHash('sha256').update(b).digest('hex');
function local(file){const path=resolve(root,file),rel=relative(root,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside new motion pack');return path;}
const json=async file=>JSON.parse(await readFile(local(file),'utf8'));
const optionalJson=async file=>{try{return await json(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const args=process.argv.slice(2);
assert.ok(args.every(a=>!a.startsWith('--')||['--ids','--confirm'].includes(a)),'Unknown option');
assert.ok(args.includes('--confirm'),'Explicit --confirm after source, boot and native-strip review is required');
const ids=[...new Set(args.filter(a=>!a.startsWith('--')).flatMap(a=>a.split(',')).filter(Boolean))];
assert.ok(ids.length&&ids.every(id=>/^[a-z0-9-]+$/.test(id)),'Explicit slug-direction IDs required; no default/all auto-confirm');
assert.equal(await optionalJson('approval.json'),null,'Approved motion pack cannot be modified');
const plan=await json('production-plan.json'),assessments=await json('review/source-assessment.json');
const directions=JSON.parse(await readFile(resolve(workspace,'docs/design/characters/van-hai-npc-visual-standard-v1/directions.json'),'utf8'));
const pilotRoot=resolve(workspace,'docs/design/characters/van-hai-npc-wave-a-motion-v1');
const pilotCatalog=JSON.parse(await readFile(resolve(pilotRoot,'catalog.json'),'utf8'));
const {validateMotionLineage}=createSourceProvenanceValidator({root,workspace,plan,directions,pilotRoot,pilotCatalog});
const expected=[['bach-chi','NPC-HN-HERBALIST'],['tong-thiet','NPC-HN-FORGE'],['hua-hanh','NPC-HN-ROUTE-KEEPER'],['dinh-soc','NPC-HN-GATE-WARDEN'],['ky-an','NPC-HN-DISCIPLE-WATER'],['phung-da','NPC-HN-DISCIPLE-SWORD']];
const newDirections=['south','southwest','west','northwest','north','northeast','east'];
assert.equal(plan.actors.length,6,'Six Wave A actors required');
assert.deepEqual(new Set(plan.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])),'Unexpected Wave A IDs');
assert.equal(plan.requests.length,42,'Six actors × seven real directional sources required');
assert.equal(new Set(plan.requests.map(q=>q.slug+'/'+q.direction)).size,42,'Duplicate actor/direction request');
for(const [slug,id] of expected){assert.equal(plan.actors.find(a=>a.slug===slug)?.id,id);for(const direction of newDirections)assert.ok(plan.requests.some(q=>q.slug===slug&&q.direction===direction),'Missing authored actor/direction');}
assert.ok(plan.requests.every(q=>newDirections.includes(q.direction)&&expected.some(a=>a[0]===q.slug)),'Seven new actual views only; southeast remains immutable pilot');
const registration=await optionalJson('registration-input.json')??{schema:'npc-wave-a-motion-registration-input-2',date:'2026-10-13',sources:[]};
assert.ok(Array.isArray(registration.sources));
const confirmed=[],skipped=[],additions=[];
for(const id of ids){
 const q=plan.requests.find(q=>q.slug+'-'+q.direction===id);assert.ok(q,'Unknown explicit ID: '+id);
 const sourceSha256=hash(await readFile(local(q.source)));
 const sourceLineage=await validateMotionLineage(q);
 const existing=registration.sources.find(s=>s.slug===q.slug&&s.direction===q.direction);
 if(existing){assert.equal(existing.sourceSha256,sourceSha256,'Confirmed source changed; explicit new version needed');skipped.push(id);continue;}
 const proposalFile='review/'+id+'-root-review.json',p=await json(proposalFile);
 assert.equal(p.slug,q.slug);assert.equal(p.direction,q.direction);assert.equal(p.source,q.source);assert.equal(p.sourceSha256,sourceSha256);
 assert.equal(p.proposalOnly,true);assert.equal(p.needsManualAdjustment,false,'Correct all clipped opaque pixels and render the reviewed measurements');
 assert.equal(p.neutralBodyTopConfirmed,true,'Explicitly locate the neutral crown/body top; exclude raised prop pixels');
 assert.ok(typeof p.neutralBodyTopBasis==='string'&&p.neutralBodyTopBasis.length>20,'Describe the actual crown/body-top measurement');
 assert.equal(p.frames.length,18);assert.deepEqual(new Set(p.frames.map(f=>f.index)),new Set(Array.from({length:18},(_,i)=>i)));
 const neutral=p.frames.find(f=>f.index===p.neutralIndex);
 assert.equal(p.neutralIndex,0);assert.equal(neutral.action,'idle');
 assert.ok(p.neutralTopY>=neutral.top&&p.neutralTopY<neutral.rootY);
 assert.ok(Math.abs(p.neutralHeight-(neutral.rootY-p.neutralTopY))<1e-9);
 assert.ok(Math.abs(p.scale-80/p.neutralHeight)<1e-9,'Exactly one neutral-derived source scale required');
 assert.equal(p.renderedMeasurementSha256,hash(Buffer.from(JSON.stringify({neutralTopY:p.neutralTopY,frames:p.frames}))),'Measurements changed after strip rendering: run root-review --render');
 assert.equal(p.reviewStripSha256,hash(await readFile(local(p.reviewStrip))),'Native strip changed since measurement rendering');
 assert.equal(p.largeReviewStripSha256,hash(await readFile(local(p.largeReviewStrip))),'Large native strip changed since measurement rendering');
 const assessment=assessments.sources.find(s=>s.slug===q.slug&&s.direction===q.direction&&s.sourceSha256===sourceSha256);
 assert.ok(assessment&&assessment.source===q.source,'Exact selected source needs a visual assessment');
 assert.equal(assessment.status,'review-candidate');assert.equal(assessment.orientation.pass,true);assert.equal(assessment.identity.pass,true);assert.equal(assessment.anatomy.pass,true);assert.equal(assessment.props?.pass,true,'Actual physical prop handedness and continuity must pass, including two-stage sources');
 for(const f of p.frames){
  assert.equal(f.action,['idle','talk','profession'][Math.floor(f.index/6)]);assert.equal(f.frame,f.index%6);
  assert.ok(Number.isFinite(f.rootX)&&Number.isFinite(f.rootY)&&f.rootX>=f.left&&f.rootX<=f.left+f.width&&f.rootY>=f.top&&f.rootY<=f.top+f.height);
  const witness=f.bootPairSupportWitness;
  assert.ok(Array.isArray(witness)&&witness.length===4&&witness.every(Number.isFinite),'Explicit both-boot support witness needed for frame '+f.index);
  assert.ok(witness[0]<=f.rootX&&f.rootX<=witness[2]&&witness[1]<=f.rootY&&f.rootY<=witness[3],'World root must lie in manually measured boot-pair support');
  assert.ok(witness[0]>=f.left&&witness[1]>=f.top&&witness[2]<=f.left+f.width&&witness[3]<=f.top+f.height,'Boot witness outside selected pose');
  const basis=f.manualRootBasis||p.manualRootReviewBasis;
  assert.ok(typeof basis==='string'&&basis.length>20&&!basis.includes('UNCONFIRMED'),'Manual sole/root review description required for frame '+f.index);
 }
 const entry={...p,schema:undefined,proposalOnly:false,visuallyReviewed:true,
  frames:p.frames.map(f=>({...f,rootBasis:f.manualRootBasis||p.manualRootReviewBasis})),
  rootBasis:p.manualRootReviewBasis||'Each frame has an explicit reviewed boot-pair root; props and robe hems excluded; one neutral source scale.',
  rootReviewProposal:proposalFile,rootReviewProposalSha256:hash(await readFile(local(proposalFile))),
  sourceAssessment:'review/source-assessment.json',sourceAssessmentSha256:hash(await readFile(local('review/source-assessment.json'))),
  sourceLineage,
  measurementConfirmation:{date:'2026-10-13',explicitId:id,scope:'Manual world roots, body-top calibration and source components only; no motion ART or runtime approval'},
  artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
 additions.push(entry);confirmed.push(id);
}
registration.sources.push(...additions);
await writeFile(local('registration-input.json'),JSON.stringify(registration,null,2)+'\n');
console.log(JSON.stringify({confirmed,skippedExistingPreserved:skipped,totalSources:registration.sources.length,artApprovalGranted:false,runtimeImported:false}));
