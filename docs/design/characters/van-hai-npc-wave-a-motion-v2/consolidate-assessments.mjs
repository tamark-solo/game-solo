// Select exact current source assessments; preserve historical failed/earlier leaves.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url));
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const statusOnly=process.argv.includes('--status');
assert.ok(process.argv.slice(2).every(a=>a==='--status'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async f=>JSON.parse(await readFile(resolve(root,f),'utf8'));
const plan=await json('production-plan.json');
const leaves=(await readdir(resolve(root,'review'))).filter(f=>/^assessment.*\.json$/.test(f)&&!f.startsWith('assessment-neutral'));
const records=[],leafPins=[];
for(const leaf of leaves){const file='review/'+leaf,bytes=await readFile(resolve(root,file));const report=JSON.parse(bytes);leafPins.push({file,sha256:sha(bytes)});for(const s of report.sources??[])records.push({...s,assessmentEvidence:{file,sha256:sha(bytes)}});}
const sources=[],missing=[];
for(const q of plan.requests){
 let hash;try{hash=sha(await readFile(resolve(root,q.source)));}catch(e){if(e.code!=='ENOENT')throw e;missing.push({id:q.id,reason:'selected source not generated'});continue;}
 const candidates=records.filter(s=>s.slug===q.slug&&s.direction===q.direction&&s.source===q.source&&s.sourceSha256===hash);
 const s=candidates.find(s=>s.status==='review-candidate'&&['orientation','identity','anatomy'].every(k=>s[k]?.pass===true)&&(s.props??s.propContinuity)?.pass===true&&(s.motionReadability??s.motion)?.pass===true&&(s.nativeReview?.pass===true||s.reviewedNativePoseCount===18||(s.nativeViewed===true&&s.nativePosesViewed===18)));
 if(!s){missing.push({id:q.id,reason:'no passing exact-source raw/native assessment'});continue;}
 const proposalFile=s.rootProposal??'review/'+q.id+'-root-review.json',proposal=await json(proposalFile);
 assert.equal(proposal.sourceSha256,hash,q.id+' source/proposal mismatch');
 assert.equal(proposal.needsManualAdjustment,false,q.id+' measured render not final');
 const stripFile=s.nativeReview?.file??s.evidence?.nativeStrip??proposal.largeReviewStrip,stripHash=sha(await readFile(resolve(root,stripFile)));
 if(s.nativeReview?.sha256??s.evidence?.nativeStripSha256)assert.equal(stripHash,s.nativeReview?.sha256??s.evidence?.nativeStripSha256,q.id+' native evidence changed');
 else assert.equal(stripHash,stripFile===proposal.reviewStrip?proposal.reviewStripSha256:proposal.largeReviewStripSha256,q.id+' render evidence mismatch');
 assert.equal(s.nativeReview?.reviewedFrames??s.reviewedNativePoseCount??s.nativePosesViewed,18,q.id+' all18 native poses required');
 sources.push({...s,props:s.props??s.propContinuity,motionReadability:s.motionReadability??s.motion,nativeReview:{...s.nativeReview,pass:true,reviewedFrames:18,file:stripFile,sha256:stripHash,finding:s.nativeReview?.finding??s.sourceReview}});
}
if(!statusOnly){
 assert.equal(missing.length,0,JSON.stringify(missing));assert.equal(sources.length,42);
 const report={schema:'npc-wave-a-motion-source-visual-assessment-2',date:'2026-10-13',scope:'42 exact selected actual-direction motion sources,756 raw/native poses; owner ART/motion approval separate',basis:'Wang live same-direction primary, own accepted identity and manually reviewed directional calibration; real views without mirroring',assessmentLeafPins:leafPins,sources,artApproved:false,motionApproved:false,ownerApproved:false,runtimeImported:false};
 await writeFile(resolve(root,'review/source-assessment.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({selectedPassingSources:sources.length,requiredSources:42,missing,consolidated:!statusOnly}));
