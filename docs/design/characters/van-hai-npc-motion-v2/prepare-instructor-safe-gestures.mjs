import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2';
const hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
for(const direction of ['north','northwest','northeast','southwest']){
 const q=plan.requests.find(r=>r.id==='ta-kiem-son-'+direction);
 const old=q.source;
 assert.ok(!q.safeGestureRevision,'Already prepared; do not overwrite provenance');
 q.sourceRevisions??=[];
 q.sourceRevisions.push({source:old,sha256:hash(await readFile(root+'/'+old)),status:'superseded-needs-source-correction',reason:'Sword vanishes during raised-hand talk; rear waist sweep causes occlusion or hand-side error. Replace talk with real head nod and profession with small flank wrist tilt.'});
 const target=direction==='north'?'raw/ta-kiem-son-north-r2.png':direction==='southwest'?old:'raw/ta-kiem-son-'+direction+'.png';
 const targetHash=hash(await readFile(root+'/'+target));
 assert.ok(q.sourceRevisions.some(r=>r.source===target&&r.sha256===targetHash));
 const revision=(q.revision??1)+1;
 const prompt=[
  'EDIT Image1, the existing SAME Tạ Kiếm Sơn / SAME '+direction.toUpperCase()+' sheet. Image2 is live Wang Lin same direction: PRIMARY anatomy/pixel/style comparator. Preserve NPC compact dark bun, navy robe, wrapped wrists, short wooden sword, mature face and same camera. Never copy Wang hair or clothes. Six columns x three rows, 18 independently drawn animation poses with full limbs, sword and transparent gutters.',
  'REPLACE the TALK gesture completely. No palm explanation, no raising either forearm. BOTH HANDS stay at the exact neutral resting position in every talk frame. The wooden sword stays clearly visible pointing down at the SAME flank in the SAME holding hand, as neutral. TALK motion is a real brief head nod, small shoulder breath and visible mouth movement if this camera sees the mouth. Talk1 neutral; talk2 slight head dip; talk3 nod deeper by only 1-2 native pixels; talk4 returns halfway; talk5 returns with breath; talk6 exact neutral. Torso, feet and sword hand do not turn, swap, vanish or raise. Back views have no visible eye/nose/mouth.',
  'REPLACE PROFESSION with a small controlled wrist-angle demonstration at the SAME EXPOSED SIDE as neutral, rather than a waist sweep. Wooden sword always stays down outside torso silhouette. Profession1 neutral; 2 wrist tilts blade outward10degrees; 3 outward20degrees; 4 holds20degrees; 5 returns10degrees; 6 exact neutral. Holding hand stays at waist/flank height; other hand stays down. Never bring blade/hilt across torso or center back. Back robe correctly hides front hands; no hands or sword painted through robe. No opposite-hand transfer, no high guard, no attack, no lunge. Slow wrist control still reads as training instruction.',
  'ROW1 IDLE6: neutral, subtle inhale, tiny shoulder/sleeve shift, exhale, blink if face visible, exact neutral. HANDS AND SWORD remain down, visible and unchanged during all6 idle poses. Every frame has a wooden sword. No missing sword in idle3. Keep standing skull/head/body sizes identical across rows and source-wide scale; only small realistic nod/wrist/breath motions.',
  'Retain true '+direction.toUpperCase()+' camera in every pose. '+(direction==='southwest'?'Front-left/down-LEFT with nose/chin to LEFT; never southeast/front-right.':direction==='north'?'Full back with no front face, same sword flank as neutral.':'Back three-quarter, hair/bun dominates and no visible eye.'),
  'Transparent RGBA, broad crisp low-resolution pixel clusters, no floor/shadow/text/grid/FX/glow. Nominal human standing80px, base64x96 foot32,88; clip96x96 foot48,88 padding only. Do not resize individual rows or anatomy. Source is an action candidate, not an approval.'
 ].join('\n\n')+'\n';
 const tag='r'+revision+'-safe';
 q.revision=revision;q.safeGestureRevision=true;q.source='raw/'+q.id+'-r'+revision+'.png';
 q.prompt='prompts/'+q.id+'-'+tag+'.txt';q.spec='specs/'+q.id+'-'+tag+'.json';q.assetPlan='plans/'+q.id+'-'+tag+'.json';
 q.images=[target,'inputs/wang-lin-live-'+direction+'-nearest8x.png'];
 q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
 q.referencePolicy={stage:'action-correction',editTargetFirst:true,primaryStyleImageIndex:2,editTargetFile:target,editTargetSha256:targetHash,neutralIntentPreserved:true};
 q.gestureAdaptation={talk:'Head nod and shoulder breath, hands down; GDD talk has no mandatory open palm.',profession:'Small outward wrist-angle demonstration at visible flank; no waist sweep through rear robe.'};
 q.status='source-correction-planned';
 await writeFile(root+'/'+q.prompt,prompt);
 await writeFile(root+'/'+q.spec,JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+q.id+'-v2-'+tag,prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
}
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log('Prepared four real nod/wrist action corrections; no paid request.');
