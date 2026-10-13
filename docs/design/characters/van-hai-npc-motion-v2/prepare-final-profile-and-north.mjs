import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2',hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
for(const slug of ['ta-kiem-son','to-nhuoc']){
 const q=plan.requests.find(r=>r.id===slug+'-east');assert.equal(q.spec,undefined,'Profile already selected');
 q.prompt='prompts/'+q.id+'-profile.txt';q.spec='specs/'+q.id+'-profile.json';q.assetPlan='plans/'+q.id+'-profile.json';
 q.images=['inputs/wang-lin-live-east-nearest8x.png','raw/'+slug+'-west.png'];
 q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
 q.status='final-east-profile-planned';
}
const q=plan.requests.find(r=>r.id==='ta-kiem-son-north');assert.equal(q.revision,undefined,'Instructor north correction already selected');
const previous=q.source;
const prompt=[
 'Targeted correction of a 6-column by 3-row, eighteen-pose NPC animation sheet. Image1 is live Wang Lin NORTH: PRIMARY pixel anatomy and full-back camera only; never copy his long hair or ivory clothes. Image2 is the existing Tạ Kiếm Sơn NORTH sheet to correct. Image3 is this same NPC NORTHWEST sheet supporting identity and rear robe/arm occlusion only.',
 'Preserve Tạ Kiếm Sơn identity: mature male instructor, compact dark bun, navy robe, cloth-wrapped wrists, short worn wooden sword. Keep all eighteen full-back views with NO eyes, eyebrows, face, nose or mouth. Keep the same head, skull, body, boots, clothing and physical scale in every row. Preserve the original six-by-three layout and transparent margins.',
 'Correct weapon and arm occlusion in ALL TALK and PROFESSION poses. His sword-holding hand stays the SAME ANATOMICAL RIGHT hand, in FRONT of his torso. From this rear camera it appears on the screen-RIGHT silhouette when visible. The FREE LEFT hand makes the calm explanatory gesture. Never swap the sword to the other hand, never paint skin palms or sword grip across the middle of his BACK. Forearms/hilt in front of the abdomen are hidden by the continuous navy back robe; sleeves/elbows may show at the side silhouette. A visible sword edge/tip may peek outside the correct side, with physically consistent orientation. No X-ray hands or hilt painted over the back robe. Naturally occluded sword parts may be hidden, but the weapon must not jump sides or pop in/out without occlusion.',
 'Row1 idle: neutral, small inhale, sleeve/shoulder breath, exhale, quiet pause, exact neutral. Row2 talk: neutral, free left forearm raises, calm explanatory palm, holds, retracts, exact neutral; sword held consistently in the other hand. Row3 profession: neutral, measured wrist raises the wooden sword in FRONT of the torso, controlled waist-level guard, holds, lowers, exact neutral. Seen only from behind, so body occludes front hands/hilt as required. Feet stay planted; no attack, slash, lunge or VFX.',
 'All rows keep one source-neutral body scale, standing around240 source pixels, broad crisp pixel clusters, head about half standing height. Full boot/hand/prop silhouettes and large clear gaps; never resize a gesture row. Native human80px, base64x96 foot32,88; clip96x96 foot48,88 adds padding. Transparent RGBA; no floor, shadow, labels, grid, scenery or FX. New revision remains a candidate.'
].join('\n\n')+'\n';
q.sourceRevisions=[{source:previous,sha256:hash(await readFile(root+'/'+previous)),status:'superseded-needs-source-correction',reason:'Sword switches side in talk and front hands/hilt wrongly appear over the center of the back; preserve holding hand and rear occlusion.'}];
q.revision=2;q.source='raw/'+q.id+'-r2.png';q.prompt='prompts/'+q.id+'-r2.txt';q.spec='specs/'+q.id+'-r2.json';q.assetPlan='plans/'+q.id+'-r2.json';q.status='instructor-north-occlusion-planned';
q.images=['inputs/wang-lin-live-north-nearest8x.png',previous,'raw/ta-kiem-son-northwest.png'];
q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
await writeFile(root+'/'+q.prompt,prompt);await writeFile(root+'/'+q.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-ta-kiem-son-north-v2-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');console.log('Selected two final EAST profiles and one instructor NORTH correction; no API call.');
