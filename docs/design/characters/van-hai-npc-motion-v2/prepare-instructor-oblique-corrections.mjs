import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2',hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
for(const direction of ['northwest','northeast']){
 const q=plan.requests.find(r=>r.id==='ta-kiem-son-'+direction);assert.equal(q.revision,undefined);
 const previous=q.source;
 const prompt=[
  'Targeted weapon continuity correction of an eighteen-pose pixel NPC sheet, six columns by three rows. Image1 is PRIMARY Wang Lin live '+direction.toUpperCase()+' back-three-quarter camera, anatomy and pixel treatment ONLY. Do not copy Wang long hair or clothing. Image2 is this same Tạ Kiếm Sơn '+direction+' sheet to edit. Image3 is owner-approved same NPC neutral identity/costume, not a camera reference.',
  'Keep Tạ identity: mature male instructor with compact dark bun, navy robe, wrapped wrists and short worn wooden sword. Preserve the EXISTING '+direction.toUpperCase()+' back-three-quarter facing in all eighteen poses; no eyes, front face, nose or mouth. Keep exactly the same skull/body/clothes/boots and physical scale across rows. No head turning to front during gestures.',
  'Correct ROW2 TALK: the sword is held in the SAME ANATOMICAL RIGHT hand as the neutral pose, down by the side. It must remain in that same hand and outside the same projected torso side where visible for ALL SIX talk poses. The FREE LEFT hand gives the explanatory palm gesture. Never raise the sword-holding hand to explain, never swap the sword, never remove or respawn it. Keep the visible blade/tip continuity from talk1 through talk2-5 and talk6, with only subtle breath movement. Torso may hide part of the grip, not the entire previously exposed blade without any sword-hand movement.',
  'ROW3 profession: only the sword wrist demonstrates a measured waist-level guard in FRONT of the torso, no attack/lunge. Rear robe occludes front palms or hilt when they overlap its silhouette. Never paint hands or sword grip in the middle of the BACK. Side elbows/sleeves and exposed blade portions are rendered only where physically visible from '+direction+'. Neutral first/last match row1 neutral. Feet remain planted.',
  'Row1 keeps its six idle/breath poses. All rows: same physical scale, standing about240sourcepixels, large chibi head, short body/legs, broad crisp pixel clusters likeImage1. Full hands/boots/props with generous transparent spacing. Native80px calibration; base64x96 foot32,88; clip96x96 foot48,88 is padding only. Transparent RGBA, no floor/shadow/text/grid/FX. Preserve all other details, new revision candidate.'
 ].join('\n\n')+'\n';
 q.sourceRevisions=[{source:previous,sha256:hash(await readFile(root+'/'+previous)),status:'superseded-needs-source-correction',reason:'Wooden sword disappears in talk2-5; free hand should explain while holding hand retains exposed sword.'}];
 q.revision=2;q.source='raw/'+q.id+'-r2.png';q.prompt='prompts/'+q.id+'-r2.txt';q.spec='specs/'+q.id+'-r2.json';q.assetPlan='plans/'+q.id+'-r2.json';q.status='instructor-oblique-prop-correction-planned';
 q.images=['inputs/wang-lin-live-'+direction+'-nearest8x.png',previous,'inputs/ta-kiem-son-approved-southeast-nearest8x.png'];
 q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
 await writeFile(root+'/'+q.prompt,prompt);await writeFile(root+'/'+q.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+q.id+'-v2-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
}
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');console.log('Prepared two instructor oblique weapon-continuity corrections; no API call.');
