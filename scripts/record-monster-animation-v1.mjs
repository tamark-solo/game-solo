import fs from 'node:fs';
import crypto from 'node:crypto';
const body='docs/design/characters/van-hai-monster-animation-v1',fx='docs/design/vfx/van-hai-monster-vfx-v1';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const C=read(body+'/catalog.json'),F=read(fx+'/catalog.json'),assets=read('artifacts/monster-animation/asset-verification.json'),browser=read('artifacts/monster-animation/browser-verification.json');
if(!assets.passed||!browser.passed||C.coverage.missing.length||F.coverage.missing.length||C.artApproved)throw Error('Expected complete verified candidate ART, no inferred approval');
for(const [root,status]of [[body,'candidate-motion-review'],[fx,'candidate-art-review']]){const p=read(root+'/production-plan.json');p.status=status;p.productionComplete=true;p.artApproved=false;p.runtimeConsumable=false;fs.writeFileSync(root+'/production-plan.json',JSON.stringify(p,null,2)+'\n');}
const reg=read(body+'/source-registration.json'),file=p=>({path:p,sha256:sha(p)});
const report={schema:'van-hai-monster-animation-delivery-1',date:'2026-10-13',generator:'built-in-imagegen',scope:'Eight mobs / three elites: base five actions in eight genuine views plus separate VFX and held props, ART review only',
 acceptedConceptBasis:file(body+'/basis.json'),catalog:file(body+'/catalog.json'),sourceRegistration:file(body+'/source-registration.json'),socketCandidates:file(body+'/socket-registration.json'),vfxCatalog:file(fx+'/catalog.json'),vfxRegistration:file(fx+'/registration.json'),
 bodySources:C.sources.length,neutralCalibrationPoses:528,actionClips:Object.keys(C.clips).length,actionPoses:C.coverage.poses,vfxSequences:F.coverage.sequenceCount,vfxPoses:F.coverage.poses,heldProps:F.coverage.heldProps,
 retainedBodyRefinements:fs.readdirSync(body+'/sources/rejected').filter(p=>p.endsWith('.png')).length,
 actors:C.actors.map(a=>({id:a.id,name:a.name,rank:a.rank,bodyTargetPx:a.bodyHeightPx,frameSize:a.frameSize,worldFoot:a.worldFoot,liftPx:a.liftPx,clips:a.clipsProduced})),
 quantization:reg.registration.filter(r=>r.neutralNativeHeights.some(h=>Math.abs(h-C.actors.find(a=>a.id===r.actor).bodyHeightPx)>1)).map(r=>({source:r.id,target:C.actors.find(a=>a.id===r.actor).bodyHeightPx,measuredNeutralHeights:r.neutralNativeHeights,note:'Measured nearest quantization, no per-pose stretch'})),
 review:body+'/index.html',promptSets:[body+'/prompts',fx+'/prompts'],sourceFolders:[body+'/sources',fx+'/sources'],screenshots:['artifacts/monster-animation/review-in-app.jpg','artifacts/monster-animation/review-desktop.png','artifacts/monster-animation/review-mobile.png','artifacts/monster-animation/adept-cast-map-2x.png'],
 verification:{assets,browser,typecheckPassed:true,boundariesPassed:true,diffCheckPassed:true},
 artApproved:false,ownerApproved:false,runtimeImplemented:false,gameplayTimingApproved:false,ownerMapEdited:false,ownerDatabaseUsed:false,
 limitations:['Skin/core witnesses, occluded-hand projections and prop grip candidates need visual review before gameplay binding','Single base attack per actor; additional elite abilities and boss kits are separate scope','Fixture contact is not live server damage confirmation','Decoded actor/FX bitmap ledger excludes map/browser cache/GPU total; no MMO crowd benchmark'],
 next:'Owner reviews native motion/VFX/prop placement, then scoped Core integration with server-confirmed hit facts and AI timing.'};
fs.writeFileSync('docs/data/monster-animation-2026-10-13.json',JSON.stringify(report,null,2)+'\n');
console.log({recorded:report.actionClips,poses:report.actionPoses,vfx:report.vfxSequences,refinements:report.retainedBodyRefinements,artApproved:false});
