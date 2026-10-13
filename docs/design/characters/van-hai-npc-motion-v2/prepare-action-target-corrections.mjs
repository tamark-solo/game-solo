import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2',hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
for(const direction of ['north','northwest','northeast']){
 const q=plan.requests.find(r=>r.id==='ta-kiem-son-'+direction);
 let target;
 if(direction==='north'){
  assert.equal(q.revision,2);target=q.source;
  q.sourceRevisions.push({source:target,sha256:hash(await readFile(root+'/'+target)),status:'superseded-needs-source-correction',reason:'Rear occlusion fixed, but talk still raises the sword hand and hides sword; change only free-hand talk.'});
  q.revision=3;q.source='raw/'+q.id+'-r3.png';
 }else{
  assert.equal(q.revision,2);target=q.sourceRevisions[0].source;
 }
 const tag=direction==='north'?'r3-action':'r2-action';
 const prompt=[
  'EDIT IMAGE1, the existing SAME NPC / SAME DIRECTION eighteen-pose animation sheet. Keep Tạ Kiếm Sơn identity, navy robe, compact dark bun, wrapped wrists, wooden sword, head/skull/body size, neutral pose and camera exactly as this target. IMAGE2 is live Wang Lin '+direction.toUpperCase()+', the PRIMARY pixel anatomy/style and camera comparison ONLY. DO NOT copy Wang Lin long hair, face identity or ivory/charcoal clothes. No image of another NPC is a style template.',
  'This is ACTION correction, not a new identity or new neutral concept. The target was already produced from Wang Lin in this exact direction. Preserve its neutral/idle and existing '+direction.toUpperCase()+' view throughout. Back views have NO eyes/nose/mouth. Keep all six columns × three rows, source scale, transparent gutters and full boots/props. No per-row resizing.',
  'REPAIR ROW2 TALK ONLY: the hand holding the wooden sword in neutral remains DOWN and holding that sword for ALL SIX talk poses. Never lift, open, swap or retract the sword hand. Keep exposed sword blade at the SAME torso flank as frame1, in the same anatomical hand. ONLY THE OTHER, FREE HAND raises and opens to explain. In full NORTH rear view, sword stays SCREEN RIGHT, free hand gestures SCREEN LEFT. For diagonal '+direction+', retain sword on the same projected side as its neutral frame, free palm appears on the other arm. Talk1 and6 exact neutral; talk2 free forearm raises; talk3 free palm opens; talk4 holds; talk5 free arm retracts. Sword is never removed or respawned.',
  'ROW3 profession keeps a slow waist-level wooden-sword wrist demonstration in FRONT of torso. Back robe must occlude front palms/hilt inside its silhouette; exposed blade/elbow portions appear only at the sides. No x-ray hands or hilt over center back. No attack, slash, lunge or stepping. Preserve side/sword continuity and return to neutral.',
  'Broad crisp low-resolution pixel clusters matching PRIMARY style Image2, with same NPC identity and physical proportions Image1. Nominal native80px from neutral; base64x96 foot32,88; clip96x96 foot48,88 padding only. Transparent RGBA, no scenery/floor/shadow/text/grid/glow/FX. All eighteen real poses, no duplicate static motion substitute. Keep skull, hair and clothes stable; corrected actions are candidates.'
 ].join('\n\n')+'\n';
 q.prompt='prompts/'+q.id+'-'+tag+'.txt';q.spec='specs/'+q.id+'-'+tag+'.json';q.assetPlan='plans/'+q.id+'-'+tag+'.json';q.status='same-view-action-correction-planned';
 q.images=[target,'inputs/wang-lin-live-'+direction+'-nearest8x.png'];
 q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
 q.referencePolicy={stage:'action-correction',editTargetFirst:true,primaryStyleImageIndex:2,editTargetFile:target,editTargetSha256:hash(await readFile(root+'/'+target)),neutralIntentPreserved:true};
 await writeFile(root+'/'+q.prompt,prompt);await writeFile(root+'/'+q.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+q.id+'-v2-'+tag,prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
}
const q=plan.requests.find(r=>r.id==='ta-kiem-son-southwest');assert.equal(q.revision,undefined);
const old=q.source;
const prompt=[
 'Create eighteen real pixel NPC poses, six columns × three rows, genuinely transparent RGBA. Image1 is Wang Lin LIVE SOUTHWEST: PRIMARY camera, anatomy and pixel treatment. Change identity ONLY to Tạ Kiếm Sơn; never copy Wang long hair, ivory clothes or charcoal sash. Image2 is SAME NPC true WEST side sheet, supplying compact bun/navy robe/wooden sword identity only. Image3 is SAME NPC SOUTH front sheet, identity/gesture continuity only. Do not use a southeast view.',
 'ALL eighteen poses must face DOWN-LEFT / SOUTHWEST FRONT-LEFT THREE-QUARTER, precisely as Image1. Nose/chin point screenLEFT, nearer eye on screenRIGHT side of the facial plane, far eye toward LEFT if visible. Head and torso face LEFT, not RIGHT. Absolutely no southeast/down-right pose. Not full WEST profile: turn head/torso toward the viewer by45degrees from Image2 to match Image1. This is a real independently drawn view, never a bitmap mirror.',
 'Identity locked: mature male instructor, compact dark bun without long hair or ponytail, small brow scar, navy blue robe, cloth-wrapped wrists, short worn wooden sword. Same head, body, clothes and props at the same physical scale in every row; head about half standing height. Large clear transparent gaps, figures about240sourcepixels tall, complete hands/boots/props. No shrinking profession row.',
 'Row1 idle6: neutral, inhale, small shoulder/sleeve breath, exhale, blink, exact neutral. Row2 talk6: neutral, FREE LEFT forearm raises, free palm opens, holds, retracts, neutral. Sword stays down in the SAME RIGHT holding hand and on the same projected side as neutral for all6talkposes; no switching, disappearing or respawning it. Camera stays FRONT-LEFT/down-left. Row3 profession6: neutral, raises sword wrist slowly, angles wooden sword at waist, holds controlled guard, lowers, neutral. Feet planted, no attack/lunge or turning to front-right.',
 'PRIMARY pixel style remains Image1, NPC identity Image2/3. Broad crisp pixel clusters, human native80px calibration, base64x96 foot32,88, clip96x96 foot48,88paddingonly. No text/grid/floor/shadow/FX/glow. New Southwest revision candidate.'
].join('\n\n')+'\n';
q.sourceRevisions=[{source:old,sha256:hash(await readFile(root+'/'+old)),status:'superseded-needs-source-correction',reason:'All18poses copy southeast/front-right instead of southwest/front-left.'}];
q.revision=2;q.source='raw/'+q.id+'-r2.png';q.prompt='prompts/'+q.id+'-r2.txt';q.spec='specs/'+q.id+'-r2.json';q.assetPlan='plans/'+q.id+'-r2.json';q.status='southwest-real-view-correction-planned';
q.images=['inputs/wang-lin-live-southwest-nearest8x.png','raw/ta-kiem-son-west.png','raw/ta-kiem-son-south.png'];
q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
await writeFile(root+'/'+q.prompt,prompt);await writeFile(root+'/'+q.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-ta-kiem-son-southwest-v2-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');console.log('Prepared3same-viewaction corrections and1trueSouthwest view; no API call.');
