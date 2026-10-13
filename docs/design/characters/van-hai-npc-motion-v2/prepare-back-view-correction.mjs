import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2',id='diep-tinh-northwest';
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8')),request=plan.requests.find(r=>r.id===id);
assert.equal(request.revision,undefined,'Back-view correction already prepared');
const hash=b=>createHash('sha256').update(b).digest('hex'),oldSource=request.source;
const prompt=[
 'Targeted18pose pixel NPC sheet correction,6columns3rows, transparent RGBA. Image1 is PRIMARY liveWangLin NORTHWEST back-left camera/pixel anatomy. Image2 is existing sameNPC NW sheet to correct. Image3 is sameNPC NORTH rear identity source, supporting back-of-head and robe identity ONLY, never a style/anatomy substitute.',
 'Correct ALL18heads: strict BACK-LEFT three-quarter facing UP-LEFT, back ofskull/bun/hair dominates, NO visible eye, eyebrow, frontcheekmask, nose or mouth. Existinghead wrongly turns to WEST profile revealing eye/largecheek. Rotatehead back toward NW to match Image1 and cover front-face plane with side/back hair. Ear edge may show as image1, noface detail. Keep body facing NW; no returningface towardleft/front duringtalk orprofession.',
 'Keep EXACT same elderlywoman identity, saltpepperbun/jade beads/ivorysmokyjade robe, same18pose layout and allphysicalbody/skull/legdimensions across3rows. One source-neutral scale,240sourcepixel standingheight nominal, fullhands/boots/props, generousgaps. Idle6 subtlebreath/blink not visible on back; talk6 calmforearmexplanation, bamboo remains inholdinghand/occluded naturally; profession6 handsfrontabdomen and torsooccludesfrontpalms, nohandpaintedonbackrobe. Neutralfirst/last eachrow same physicalsize.',
 'No text/grid/floor/shadow/FX/glow. Pixelclusters likeImage1, no smoothillustration. Humanbase64x96/foot32,88; clip96x96/foot48,88paddingonly. Preserve allother features; newNWrevisioncandidate, notARTapproval.'
].join('\n\n')+'\n';
request.sourceRevisions=[{source:oldSource,sha256:hash(await readFile(root+'/'+oldSource)),status:'superseded-needs-source-correction',reason:'Visible eye/front cheek in NW sheet unlike live Wang NW back-left; correct all heads to back-left.'}];
request.revision=2;request.source='raw/'+id+'-r2.png';request.prompt='prompts/'+id+'-r2.txt';request.assetPlan='plans/'+id+'-r2.json';request.spec='specs/'+id+'-r2.json';
request.images=['inputs/wang-lin-live-northwest-nearest8x.png',oldSource,'raw/diep-tinh-north-r2.png'];
request.inputHashes=await Promise.all(request.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
request.status='back-view-correction-planned';
await writeFile(root+'/'+request.prompt,prompt);
await writeFile(root+'/'+request.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+id+'-v2-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log('Prepared NW face-occlusion correction; no paid request.');
