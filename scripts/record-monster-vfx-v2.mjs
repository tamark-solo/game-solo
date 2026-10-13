import fs from 'node:fs';
import crypto from 'node:crypto';
const root='docs/design/vfx/van-hai-monster-vfx-v2';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),entry=p=>({path:p,sha256:sha(p)});
const c=read(root+'/catalog.json'),assets=read('artifacts/monster-vfx-v2/asset-verification.json'),browser=read('artifacts/monster-vfx-v2/browser-verification.json');
if(!assets.passed||!browser.passed||c.coverage.missing.length||c.artApproved)throw Error('Expected complete verified VFX candidate');
const plan=read(root+'/production-plan.json');plan.status='candidate-art-review';plan.productionComplete=true;fs.writeFileSync(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
const report={schema:'van-hai-monster-vfx-redesign-2',date:'2026-10-13',scope:'Redesign FX for existing11monster/elite bodies: charge/release/contact per actor; no live mechanics',generator:'built-in-imagegen',
 reason:'Owner accepted body animation but found VFX01 small, generic and uninteresting. Preserve all body data; distinguish species and elites.',
 catalog:entry(root+'/catalog.json'),registration:entry(root+'/registration.json'),bodyBasis:entry(root+'/body-basis.json'),presentation:entry(root+'/presentation.mjs'),cues:entry(root+'/cues.mjs'),
 sources:22,sequences:33,poses:198,actorCount:11,eliteCount:3,promptSet:root+'/prompts',rawSources:root+'/sources',
 review:'docs/design/characters/van-hai-monster-animation-v1/index.html',default:'VFX02',comparison:'VFX01/02 uses same body bytes, age and preview framing',
 screenshots:['artifacts/monster-vfx-v2/review-new-viewport.png','artifacts/monster-vfx-v2/review-new-desktop.png','artifacts/monster-vfx-v2/review-old-desktop.png','artifacts/monster-vfx-v2/review-mobile.png','artifacts/monster-vfx-v2/jade-guard-map-2x.png','artifacts/monster-vfx-v2/black-silk-adept-map-2x.png'],
 verification:{assets,browser,unitTests:2,bodyReviewClips:440,typecheckPassed:true,boundariesPassed:true,diffCheckPassed:true},
 bodyAnimationAcceptedAsBasis:true,artApproved:false,ownerApproved:false,runtimeImplemented:false,gameplayTimingApproved:false,ownerMapEdited:false,ownerDatabaseUsed:false,
 limitations:['New art/motion FX awaiting owner visual review','Art sizes and spell labels are not gameplay geometry or skill definitions','Logical emitter origins and hand projections are candidates for later runtime binding','Decoded cache16MiB does not represent total GPU memory or MMO performance','In-app browser access was denied by URL security policy; screenshots/tests used an isolated local development fixture, no owner browser state accessed'],
 next:'Visual review of species/elite effects and readability at1x, then scoped Core binding to server release/contact facts.'};
fs.writeFileSync('docs/data/monster-vfx-v2-2026-10-13.json',JSON.stringify(report,null,2)+'\n');console.log({recorded:33,poses:198,bodyFilesUnchanged:assets.bodyFilesUnchanged,artApproved:false});
