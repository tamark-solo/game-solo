import fs from 'node:fs/promises';
const r='docs/design/characters/cloud-wolf-king-animation-v1',p=JSON.parse(await fs.readFile(r+'/production-plan.json'));
if(await fs.access(r+'/approval.json').then(()=>true,()=>false))throw Error('Approved Lang Vuong pack is frozen. Produce a new version.');
for(const d of p.directions){
 const id='skills-'+d,refs=[r+'/inputs/neutral-'+d+'-6x.png','docs/design/characters/van-hai-boss-concepts-v1/raw/cloud-wolf-king.png'];
 const prompt=`Game pixel sprite motion sheet, preserve the EXACT identity/anatomy of Image1 which is our registered ${d} neutral wolf king. Image2 is supporting approved identity only, NEVER copy its facing over Image1. Direction: ${p.views[d]}. SAME direction in every pose, especially north and rear diagonals have NO eyes or frontal chest. Keep skull/mane/torso proportions, silver-ivory mane, smoky jade grey fur, amber eyes where visible, three curled ivory FUR tail tufts and attached ink talisman. Compact heavy quadruped, not a human. Slightly elevated MMORPG view, crisp stepped pixel clusters, no smooth3D.
Exactly SIX columns and FOUR rows,24 full isolated poses, transparent RGBA background and wide empty gutters. Fixed origin slots and planted floor near82% each cell; full bodies and tails not clipped. NO shadow, floor, aura, particles, trails, wind, clouds, magic rings, labels or grid. Only body animation; FX added separately.
ROW1: six EXACT matching planted neutral copies of Image1, same size throughout, for calibration.
ROW2 APPEAR: six ordered physical entry poses: low crouch emerging / shoulder rises / assertive upward muzzle posture but retain facing / two forepaws stamp / mane and three fur tufts settle / ready neutral. No airborne image teleport or scaling.
ROW3 VAN NHA POUNCE: six ordered poses: ready tense / crouch and shoulders compress / coil hind legs deeply / forceful airborne stretched pounce FORWARD in ${d}, forepaws reach and hindlegs trail / heavy forepaw landing / settle ready at destination. Same head and body scale as row1. For north pounce all back/spine, no eyes; for front foreshorten naturally, do not enlarge skull. The world travel will be applied outside sprite, so don't translate pose within the slot.
ROW4 HOI PHONG SWEEP: six poses: ready / plant rear legs and lift forepaw / brace and twist shoulders slightly while facing remains ${d} / wide forceful forepaw swipe and tail counter-swing / stamped paws and recoil / ready recovery. Clear strong gesture, same anatomy, no full facing turn, no magical FX baked into fur.
No duplicate static actions, six distinct poses per action. Identity/height/pixel density locked to row1. Do not mirror, fit per pose, inflate mane/head during skills, or replace death/skill with another action.`;
 await fs.writeFile(r+'/prompts/'+id+'.txt',prompt+'\n');
 if(!p.jobs.some(j=>j.id===id))p.jobs.push({id,group:'skills',direction:d,rows:4,cols:6,actions:['appear','van_nha','hoi_phong'],source:'sources/'+id+'.png',prompt:'prompts/'+id+'.txt',references:refs});
}
await fs.writeFile(r+'/production-plan.json',JSON.stringify(p,null,2)+'\n');
console.log('8 same-view neutral skill prompts prepared; no generation/runtime writes.');
