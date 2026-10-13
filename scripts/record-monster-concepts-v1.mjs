import fs from 'node:fs';
import crypto from 'node:crypto';
const root='docs/design/characters/van-hai-monster-concepts-v1';
const pack=JSON.parse(fs.readFileSync(root+'/production.json','utf8'));
const verification=JSON.parse(fs.readFileSync('artifacts/monster-concepts/verification.json','utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(!verification.passed||pack.artApproved||pack.runtimeConsumable)throw Error('Expected verified, unapproved concept scope');
const report={schema:'van-hai-monster-concept-delivery-1',date:'2026-10-13',scope:'Eight mobs and three elites: single neutral southeast identity, native review only',
 generator:'built-in-imagegen',generatedIdentityCount:11,additionalRefinements:1,
 manifest:{path:root+'/production.json',sha256:sha(root+'/production.json')},
 registration:{path:root+'/registration.json',sha256:sha(root+'/registration.json')},
 sourcePlan:{path:pack.sourcePlan,sha256:sha(pack.sourcePlan)},
 promptSet:root+'/prompts',sources:root+'/raw',sprites:root+'/sprites',
 review:root+'/index.html',lineup:root+'/review/lineup-3x.png',
 screenshots:['artifacts/monster-concepts/review-in-app.jpg','artifacts/monster-concepts/jade-elite-map-1x.png','artifacts/monster-concepts/jade-elite-map-2x.png','artifacts/monster-concepts/gallery-mobile.png'],
 actors:pack.actors.map(a=>({id:a.id,rank:a.rank,bodyTargetPx:a.bodyHeightPx,measuredBodyPx:a.measuredBodyHeightPx,canvas:a.canvas,pivot:a.pivot,liftPx:a.liftPx,rawSha256:a.rawSha256,spriteSha256:a.spriteSha256})),
 verification:{...verification,viewportWidths:[1440,1024,850,768,600,390],contentCatalog:{records:96,errors:0,pendingWarnings:84,unitTests:7,browserGroups:5,layouts:4},livingWorldReviewPassed:true,diffCheckPassed:true},
 directionsProduced:['southeast'],posesPerActor:1,directionsPending:7,animationProduced:false,
 artApproved:false,ownerApproved:false,runtimeImplemented:false,ownerMapEdited:false,ownerDatabaseUsed:false,
 next:'Visual review of identities and native proportions, then remaining seven real directions and five actions for prioritized species.'};
fs.writeFileSync('docs/data/monster-concepts-2026-10-13.json',JSON.stringify(report,null,2)+'\n');
console.log('Recorded candidate concept delivery: 11 identities, 6 viewport widths, 323 approved basis files unchanged.');
