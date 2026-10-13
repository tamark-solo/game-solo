import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2';
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
const corrections={
 'diep-tinh-north':'In row3profession frame2and5 the previous sheet wrongly draws visible skin hands clasped on the MIDDLE OF HER BACK. Her palms are at her FRONT ABDOMEN, therefore the torso OCCLUDES them from this fullback camera. Remove skin hands over the back robe. Show only sleeves/elbows at the silhouette sides as appropriate, arms wrapping toward front, continuous robe/back surface at center. No exposed palm, scroll or chest detail in the middle of back. Preserve all18back views, no face.',
 'diep-tinh-south':'Row2talk frame4 wrongly makes the CLOSED BAMBOO SCROLL disappear. Preserve the same small bamboo scroll in her left/anatomical holding hand for ALL6talk poses, including frame4. Explanatory palm is the other hand. Keep scroll shape, size, hand and occlusion continuous. In row3profession only, scroll may rest/tuck naturally so hands near abdomen can demonstrate breath as approved; never spawn/disappear a prop arbitrarily.',
 'diep-tinh-west':'The previous sheet incorrectly shows TWO EYES, a southwest FRONT3/4face. Correct ALL18poses to TRUE LEFT PROFILE matching liveWangImage1. Nose points screenLEFT. Exactly ONE visible NEAR eye and ONE eyebrow (blink closes only that eye), NO far eye/far eyebrow. Narrow side-plane cheek/nose silhouette, head clearly sideways not a broad frontal mask. Remove far-eye painted at left edge, it must not merely become a tiny eye. Chest/robe/bun rotate to correct camera. Palms gesture toward screenLEFT without rotating face.',
 'diep-tinh-east':'The previous sheet incorrectly shows TWO EYES, a southeast FRONT3/4face. Correct ALL18poses to TRUE RIGHT PROFILE matching liveWangImage1. Nose points screenRIGHT. Exactly ONE visible NEAR eye and ONE eyebrow (blink closes only that eye), NO far eye/far eyebrow. Narrow side-plane cheek/nose silhouette, head clearly sideways not a broad frontal mask. Remove far-eye painted at right edge, it must not merely become a tiny eye. Chest/robe/bun rotate to correct camera. Palms gesture toward screenRIGHT without rotating face.'
};
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const [id,fix]of Object.entries(corrections)){
 const request=plan.requests.find(r=>r.id===id);assert.ok(request&&request.revision===undefined,'Correction already prepared or missing');
 const oldSource=request.source;await access(root+'/'+oldSource);
 const prompt=[
  'Use case: targeted sprite sheet correction. IMAGE1 remains PRIMARY liveWangLin camera/anatomy/pixel reference in '+request.direction.toUpperCase()+'. IMAGE2 is the existing18pose Diệp Tĩnh sheet to CORRECT. IMAGE3 is accepted SAME NPC identity/costume only. Edit this SAME NPC sheet; preserve18realposes, sixcolumns3rows, fullbody, transparent background, pixel clusters, compactlargehead, SAME scale/skull/clothes/boots in everyrow. Do not reinstate a southeast view from identityimage3.',
  'Specific correction: '+fix,
  'Preserve all other pose timing/progression and exact clothing/age/hair/props identity. Keep fixedcamera in EVERY row/frame. Human native80px calibration, no perrow/pose resizing,96x96paddingfoot48,88. Generous transparent gaps, no floor/shadow/glow/text/FX. The original image dimensions may differ fromrequest; keep same six-by-three sheet organization and body scale, complete anatomy. New revision remains candidate.'
 ].join('\n\n')+'\n';
 const promptFile='prompts/'+id+'-r2.txt',assetPlan='plans/'+id+'-r2.json',source='raw/'+id+'-r2.png';
 await writeFile(root+'/'+promptFile,prompt);
 await writeFile(root+'/specs/'+id+'-r2.json',JSON.stringify({assetType:'character-concept',name:'vn-npc-motion-'+id+'-v2-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
 request.sourceRevisions=[{source:oldSource,sha256:hash(await readFile(root+'/'+oldSource)),status:'superseded-needs-source-correction',reason:fix}];
 request.revision=2;request.source=source;request.prompt=promptFile;request.assetPlan=assetPlan;
 request.images=['inputs/wang-lin-live-'+request.direction+'-nearest8x.png',oldSource,'inputs/diep-tinh-approved-southeast-nearest8x.png'];
 request.inputHashes=await Promise.all(request.images.map(async file=>({file,sha256:hash(await readFile(root+'/'+file))})));
 request.status='targeted-correction-planned';
}
await writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log('Prepared4targetedcorrections; existing sources preserved; no API call.');
