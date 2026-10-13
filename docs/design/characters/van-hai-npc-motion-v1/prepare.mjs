import {mkdir, readFile, writeFile, copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root='docs/design/characters/van-hai-npc-motion-v1';
const primary='docs/design/characters/van-hai-npc-visual-standard-v1';
const sha=b=>createHash('sha256').update(b).digest('hex');
const definitions=[
 {id:'NPC-HN-GUIDE',slug:'tran-duy',name:'Trần Duy',identity:'van-hai-npc-concepts-v3',description:'Middle-aged male sect guide. Compact dark bun with grey streak, short moustache and goatee, ivory-grey robe, thin bronze trim, celadon waist token and sect-tag pouch.',gesture:'A calm direction-giving open palm: neutral, lifts right forearm, opens hand towards down-right, holds, retracts, exact neutral. No pointing a weapon.'},
 {id:'NPC-HN-CULTIVATION',slug:'diep-tinh',name:'Diệp Tĩnh',identity:'van-hai-npc-concepts-v4',description:'Elderly woman cultivation teacher with softly aged face and grey-salt compact bun. Ivory and smoky jade robe, small jade string and closed bamboo scroll. No beard, no young heroine face.',gesture:'A calm breath-teaching gesture: neutral, draws palms near abdomen, gently separates palms, holds inward palms, closes hands, exact neutral. Jade string remains attached. No visible qi or FX in body sheet.'},
 {id:'NPC-HN-TRAINING',slug:'ta-kiem-son',name:'Tạ Kiếm Sơn',identity:'van-hai-npc-concepts-v4',description:'Mature male training instructor about forty, compact dark bun, small eyebrow scar, navy robe and wrapped wrists. Holds a short worn wooden sword pointing down; never heavy armor or huge sword.',gesture:'A measured wooden-sword wrist demonstration: neutral sword tip down, raises forearm slowly, angles the wooden sword across waist, holds controlled guard, lowers wrist, exact neutral. Feet remain planted; no attack, slash, FX or lunge.'},
 {id:'NPC-HN-PREPARATION',slug:'to-nhuoc',name:'Tô Nhược',identity:'van-hai-npc-concepts-v4',description:'Adult woman supplies clerk. Dark compact bun, muted jade robe, ivory cloth apron, earthy-red tied ledger, small sealed wooden case and a small brush. No beard, no child face.',gesture:'Inspecting a sealed case: neutral, brings small case to waist, tilts case to inspect seal, taps or traces seal once with small brush, lowers case, exact neutral. Keep case small and same shape in every frame.'}
];
for(const folder of ['inputs','prompts','specs','plans','raw','review'])await mkdir(root+'/'+folder,{recursive:true});
try{await readFile(root+'/production-plan.json');throw Error('Motion pack already prepared; create a new version instead.');}catch(e){if(e.code!=='ENOENT')throw e;}
await copyFile(primary+'/inputs/wang-lin-live-southeast-nearest8x.png',root+'/inputs/wang-lin-live-southeast-nearest8x.png');
const actors=[];
for(const npc of definitions){
 const sourceIdentity='docs/design/characters/'+npc.identity+'/sprites/'+npc.slug+'.png';
 const identity='inputs/'+npc.slug+'-identity-nearest8x.png';
 await sharp(await readFile(sourceIdentity)).resize(512,768,{kernel:'nearest'}).png().toFile(root+'/'+identity);
 const prompt=[
 'Use case: sprite animation production. Create a genuinely transparent RGBA sprite sheet, exactly 6 columns x 3 rows, 18 separated FULL BODY real poses. Output landscape1536x1024. No labels, text, grid, floor, shadow, background, aura, particles or scene.',
 'IMAGE1 is Wang Lin Pixel02 extracted from the CURRENT GAME, enlarged exactly8x by nearest sampling. It is the PRIMARY style and anatomy standard. Use the same squat large-head pixel anatomy, short torso/legs, broad readable pixel clusters, palette density and orthographic camera. Head/hair about half of standing height. Do NOT copy Wang Lin identity, long hair or clothes. IMAGE2 supplies ONLY this NPC identity/costume/props; never use its smaller head or fine shading as the anatomy/style template.',
 'NPC identity: '+npc.description,
 'All18 poses face SOUTHEAST, front-right/down-right three-quarter, with exactly the same head/skull/face/hair, physical scale, costume and props. No turning into another direction and no mirrored frames. Chunky crisp pixel clusters, no smooth painterly rendering or tiny texture. Each body about240 source pixels tall, generous transparent gutters. Column centers and ground baselines consistent. Hands, boots and props fully visible and separated from neighboring poses.',
 'Row1, IDLE6: frame1 is standing neutral calibration; frame2 small inhalation, frame3 gently lifts shoulders and sleeves, frame4 calm exhalation, frame5 relaxed blink, frame6 returns to exact neutral. Feet planted and skull dimensions unchanged. Breathing is drawn in cloth and shoulders, not whole-body translation or scaling.',
 'Row2, TALK6: neutral, slight mouth movement with right forearm raising, small open-palm explanatory gesture, holds palm and another mouth shape, returns forearm, exact neutral. Subtle natural head inclination without resizing skull; props stay in same hand or waist place. Clear six-step sequence suitable for a calm dialogue loop.',
 'Row3, PROFESSION6: '+npc.gesture,
 'These are real animation poses; do not repeat one static character18times. Preserve identity and anatomy across rows. Do not enlarge head/torso in gestures. Humans have nominal80world-pixel standing height at native game size, base64x96 foot32,88; motion canvas96x96 adds padding only. This sheet is a production candidate for owner review, not automatic ART or runtime approval.'
 ].join('\n\n')+'\n';
 const promptFile='prompts/'+npc.slug+'-southeast.txt';
 const spec={assetType:'character-concept',name:'vn-npc-motion-'+npc.slug+'-se-v1',prompt,size:'1536x1024',quality:'high',n:1};
 await writeFile(root+'/'+promptFile,prompt);
 await writeFile(root+'/specs/'+npc.slug+'-southeast.json',JSON.stringify(spec,null,2)+'\n');
 actors.push({...npc,direction:'southeast',source:'raw/'+npc.slug+'-southeast.png',prompt:promptFile,images:['inputs/wang-lin-live-southeast-nearest8x.png',identity],referenceHashes:{primary:sha(await readFile(root+'/inputs/wang-lin-live-southeast-nearest8x.png')),identity:sha(await readFile(root+'/'+identity)),identityNative:sha(await readFile(sourceIdentity))}});
}
await writeFile(root+'/production-plan.json',JSON.stringify({
 schema:'van-hai-npc-motion-plan-1',date:'2026-10-13',sourcePlan:'docs/design/world/van-hai-living-world-v1/plan.json',sourcePlanSha256:sha(await readFile('docs/design/world/van-hai-living-world-v1/plan.json')),
 primaryStandard:primary+'/basis.json',primaryStandardSha256:sha(await readFile(primary+'/basis.json')),
 generator:'project-router-gpt-image-2-edit',skill:'docs/skills/game-actor-animation-production/SKILL.md',
 status:'southeast-motion-pilot',actions:['idle','talk','profession'],framesPerClip:6,
 authoredMinimum:['idle','talk'],authoredDirections:8,producedDirections:['southeast'],pendingDirections:['south','southwest','west','northwest','north','northeast','east'],
 timings:{idle:{durationMs:1200,loop:true},talk:{durationMs:1200,loop:true},profession:{durationMs:1500,loop:false}},
 canvas:[96,96],pivot:[48,88],neutralBodyHeightPx:80,
 artApproved:false,ownerApproved:false,runtimeImplemented:false,actors
},null,2)+'\n');
console.log('Prepared four source briefs; live Wang Lin first, identity second. No API call or runtime change.');
