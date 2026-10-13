// Explicit alpha/camera/gear repairs. Preserve every earlier request/source; never retry a POST.
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url));assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const hash=b=>createHash('sha256').update(b).digest('hex'),digest=async f=>hash(await readFile(resolve(root,f)));
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8'));
const neutralRecipes={
 'hua-hanh-southwest':'Fix BOTH opaque drawn checkerboard and wrong Southeast camera. True SOUTHWEST FRONT-LEFT nose/gaze LEFT/down-left like Image1, near cheek screen-right and far eye screen-left foreshortened. Image2 currently points page-right: that view is WRONG and must be reconstructed, never mirrored. Anatomical RIGHT folded paper and patched shoulder are FAR/screen-left/up, mostly occluded; LEFT-hip tube is NEAR/screen-right/down. No duplicate map, new face or extra decoration.',
 'hua-hanh-north':'Alpha-only repair. Keep exact direct-BACK/no-face camera, own hair/cloak/boots. RIGHT shoulder patch is screen-RIGHT, LEFT-hip tube/cord screen-LEFT; RIGHT-hand front paper stays mostly hidden, no front paper pasted on the back.',
 'dinh-soc-west':'Alpha-only repair. Preserve true LEFT PROFILE/nose-left and physical RIGHT far hand spear with LEFT near-hip route tag. Keep low shaft/tip and original head/costume/boots; actual boot ground, not spear tip, will be measured later.',
 'hua-hanh-west':'Move ONLY the cloth patch to anatomical RIGHT FAR shoulder, hidden/foreshortened at far silhouette. Remove the incorrectly drawn patch on LEFT NEAR visible shoulder. Keep correct LEFT PROFILE camera, RIGHT far paper hand, LEFT near-hip tube/cord and all own identity/scale.',
 'hua-hanh-northwest':'Fix anatomical attachments while keeping correct BACK-LEFT camera: paper and cloak patch belong to anatomical RIGHT FAR side on screen-RIGHT/up; paper front-hand naturally hidden. Tube/cord belongs to anatomical LEFT NEAR hip on screen-LEFT/down. Never leave paper/patch in LEFT near hand/shoulder or tube on RIGHT far hip. Same face/hair/costume/materials.',
 'dinh-soc-northwest':'Move ONLY route tag to anatomical LEFT NEAR hip on screen-LEFT/down. Keep spear held by anatomical RIGHT FAR hand on screen-RIGHT/up, correctly occluded, and keep BACK-LEFT/no-front-face camera. Do not switch hands/weapon/shoulder mark or move tag next to right weapon hand.'
};
for(const [id,repair]of Object.entries(neutralRecipes)){
 const q=p.neutralRequests.find(q=>q.id===id);assert.ok(q);assert.ok(!q.explicitRepairPrepared);
 const original=structuredClone(q);
 q.lineageParents??=[];q.lineageParents.push({request:original,sourceSha256:await digest(q.source),routerMetadataSha256:await digest(q.source.replace(/\.png$/,'.json')),reason:repair});
 const prompt=[
  'EXPLICIT SAME-NPC NEUTRAL REPAIR. ONE isolated full-body figure, true RGBA PNG alpha. No painted checkerboard, white/grey/black matte, paper texture, grid, shadow, aura, labels or scene. Empty/background pixels must be alpha0. Keep full crown, boots and props inside generous transparent margins.',
  'IMAGE1 live Wang '+q.direction.toUpperCase()+' remains PRIMARY human anatomy/pixel/camera. IMAGE2 is this SAME NPC earlier target-view source, the correction target; it contains the errors below. Keep own accepted compact head/body identity, face/hair/wardrobe/props/material colors. Apply ONLY the stated repair; do not create a different NPC or copy Wang identity.',
  repair,
  'Physical attachments: '+q.physicalHandedness+' Projection: '+q.projectionRule,
  'Retain accepted large chibi skull/head around half standing height, short torso/legs and original short robe hem. No long adult torso or taller coat. One consistent neutral, no software deformation. Body native80px/base64x96/foot32,88; padded96x96/foot48,88 is padding only; source scale measured from crown/boots later. New view remains owner-review candidate.'
 ].join('\n\n')+'\n';
 const promptFile='prompts/'+id+'-neutral-repair-r2.txt',spec='specs/'+id+'-neutral-repair-r2.json',assetPlan='plans/'+id+'-neutral-repair-r2.json';
 q.source='direction-neutral/raw/'+id+'-repair-r2.png';q.prompt=promptFile;q.spec=spec;q.assetPlan=assetPlan;q.promptSha256=hash(Buffer.from(prompt));
 q.images=[original.images[0],original.source];q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:await digest(file)})));
 q.referencePolicy={primaryStyleImageIndex:1,sameActorSameDirectionCorrection:true};q.background='transparent';q.explicitRepairPrepared=true;
 await writeFile(resolve(root,promptFile),prompt,{flag:'wx'});await writeFile(resolve(root,spec),JSON.stringify({assetType:'character-concept',name:'vn-wave-a-neutral-'+id+'-repair-r2',prompt,size:'1024x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
}
const motionRecipes={
 'phung-da-south':'ALPHA-only repair: Image2 has a painted checkerboard backdrop. Remove every drawn background/checker pixel to actual alpha0. Preserve all18 existing own NPC pose identities, hair/skull/body/cloth/boots/held wooden sword, exact front SOUTH camera and six-by-three layout. Do not replace source with one repeated neutral or change the already drawn pose progression.',
 'tong-thiet-northeast':'GEAR repair: profession row3frame2/index13 and row3frame3/index14 currently incorrectly replace near anatomical RIGHT-hand black metal tongs with a second brown wooden blank. Restore the SAME black tongs in that RIGHT near hand on screen-RIGHT; the original wooden blank stays in LEFT far hand on screen-LEFT, partly occluded. Only a tiny right wrist/tongs adjustment at flank, not tongs touching/merging into blank. Never duplicate blank or remove tongs. Preserve other16 poses, rear-right camera, own identity and body scale.'
};
for(const [id,repair]of Object.entries(motionRecipes)){
 const q=p.requests.find(q=>q.id===id);assert.ok(q&&q.directionNeutralReference);assert.ok(!q.sourceCorrectionParent);
 const original=structuredClone(q),n=JSON.parse(await readFile(resolve(root,q.directionNeutralReference.registration),'utf8'));
 q.sourceCorrectionParent={request:original,sourceSha256:await digest(q.source),routerMetadataSha256:await digest(q.source.replace(/\.png$/,'.json')),reason:repair};
 const prompt=[
  'EXPLICIT SAME-ACTOR SAME-VIEW MOTION REPAIR. Produce the corrected transparent RGBA PNG sheet18poses exactly6columns3rows, not a new neutral. Request1536x1536. Empty background must be real alpha0; no painted checkerboard/matte/grid/text/shadow/FX. Keep full pose/props and generous clear gutters.',
  'IMAGE1 actual live Wang '+q.direction.toUpperCase()+' remains PRIMARY anatomy/pixel/camera standard. IMAGE2 is this SAME NPC SAME-view earlier motion sheet and the specific correction target. IMAGE3 is the SAME manually inspected directional neutral nearest8x: own identity/prop/body lock. Never use another NPC, mirror a view, swivel toward Southeast/front or change face/wardrobe. Keep current head/skull/torso/legs scale across all rows.',
  repair,
  'Rows idle6/talk6/profession6 remain genuine individual motion poses. Neutral/source body scale measured once from row1frame1; planted boots determine root, not props/robe hems. Preserve the existing motion progression and end settling; no whole-body bob or per-pose resizing.'
 ].join('\n\n')+'\n';
 const promptFile='prompts/'+id+'-motion-repair-r2.txt',spec='specs/'+id+'-motion-repair-r2.json',assetPlan='plans/'+id+'-motion-repair-r2.json';
 q.source='raw/'+id+'-repair-r2.png';q.prompt=promptFile;q.spec=spec;q.assetPlan=assetPlan;q.promptSha256=hash(Buffer.from(prompt));
 q.images=[original.images[0],original.source,n.nearest8x];q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:await digest(file)})));
 q.referencePolicy={stage:'explicit-same-view-action-repair',primaryStyleImageIndex:1,correctionTargetImageIndex:2,editTargetFirst:false,sameDirectionNeutralInput:true,ownApprovedPilotIdentityLocked:true};
 q.background='transparent';
 await writeFile(resolve(root,promptFile),prompt,{flag:'wx'});await writeFile(resolve(root,spec),JSON.stringify({assetType:'character-concept',name:'vn-wave-a-motion-'+id+'-repair-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
}
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({neutralRepairs:Object.keys(neutralRecipes),motionRepairs:Object.keys(motionRecipes),requestOverride:{background:'transparent',output_format:'png'},paidRequests:0}));
