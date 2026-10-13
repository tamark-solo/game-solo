// Two-stage camera lock. Pure preparation; no paid call or owner approval.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),ids=process.argv.slice(2);
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');assert.ok(ids.length&&new Set(ids).size===ids.length);
const hash=b=>createHash('sha256').update(b).digest('hex');
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),draft=JSON.parse(await readFile(resolve(root,'brief-draft.json'),'utf8'));
const hands={
 'bach-chi':'Basket in anatomical RIGHT hand; small jade pestle in anatomical LEFT hand. From FRONT basket projects screen-left; from BACK basket projects screen-right. Do not swap tools when rotating.',
 'tong-thiet':'Tongs in anatomical RIGHT hand; compact wooden sword blank in anatomical LEFT hand. From FRONT tongs project screen-left, wooden blank screen-right. From BACK tongs project screen-right, wooden blank screen-left. Never exchange these hands.',
 'hua-hanh':'Folded route paper in anatomical RIGHT hand; compact map tube/cord at anatomical LEFT hip; cloak patch on anatomical RIGHT shoulder. FRONT projects paper/patch screen-left and tube screen-right; BACK projects paper/patch screen-right and tube screen-left. Keep front paper naturally occluded from behind, not pasted on back. No duplicate sheet or tube.',
 'dinh-soc':'Spear gripped in anatomical RIGHT hand, free anatomical LEFT hand rests near route tag at anatomical LEFT hip. From FRONT spear grip projects screen-left; from BACK spear grip projects screen-right. Shaft remains low, tip down, never overhead. World floor is both boots, not spear tip.',
 'ky-an':'Both hands support the SAME compact bamboo slips before abdomen; blue gourd remains attached at anatomical RIGHT hip (screen-left FRONT, screen-right BACK). Short tied hair/ribbon remains low; never tall bun.',
 'phung-da':'Wooden sword in anatomical RIGHT hand (screen-left FRONT, screen-right BACK), left hand at rest. Keep wrist cloth and upright short hair. Do not exchange sword hand or add metal blade.'
};
await mkdir(resolve(root,'direction-neutral/raw'),{recursive:true});
p.neutralRequests??=[];
for(const id of ids){
 const q=p.requests.find(q=>q.id===id),b=draft.requests.find(q=>q.id===id),a=p.actors.find(a=>a.slug===q?.slug);assert.ok(q&&b&&a);
 assert.ok(!p.neutralRequests.some(n=>n.id===id),'Neutral brief exists: '+id);
 const images=['inputs/wang-lin-live-'+q.direction+'-nearest8x.png','inputs/'+q.slug+'-approved-southeast-nearest8x.png'];
 const prompt=[
  'Generate ONE isolated standing neutral FULL BODY pixel game sprite for '+a.name+'. One figure only, transparent RGBA, request1024x1536. No animation sheet, duplicate figure, text, arrows, grid, scene, floor, cast shadow, aura or FX. Leave clear alpha margins around crown, boots and all props.',
  'IMAGE1 is the live Wang Lin Pixel02 in '+q.direction.toUpperCase()+': PRIMARY target camera, human chibi anatomy, head/body proportions, broad pixel clusters and few-tone material shading. IMAGE2 is this SAME NPC accepted Southeast calibration identity, enlarged nearest8x; ONLY face/hair/clothes/colors/physical prop hand identity. Its Southeast orientation is NOT this target. Reconstruct the same NPC in image1 camera, not Wang identity. DO NOT keep image2 Southeast camera and DO NOT mirror/flip an image.',
  'Same NPC identity: '+draft.actorSummaries.find(n=>n.slug===q.slug).identity,
  'MANDATORY target camera: '+b.prompt.split('\n\n').find(s=>s.startsWith('ALL18poses remain')).replaceAll('ALL18poses','This ONE neutral pose')+' '+b.occlusionRule,
  q.direction==='west'?'TRUE LEFT PROFILE: nose points LEFT, only leftward face contour and one eye, torso side/profile. No symmetric two eyes/front chest or face looking page-right.':q.direction==='east'?'TRUE RIGHT PROFILE: nose points RIGHT, only rightward face contour and one eye, torso side/profile. No symmetric two eyes/front chest.':q.direction==='southwest'?'TRUE FRONT-LEFT three-quarter: gaze/nose toward page LEFT/down-left, near cheek on screen-right, far eye foreshortened on screen-left. Do not recreate Southeast right-facing nose.':'',
  'Anatomical handedness and attachments: '+hands[q.slug]+' '+b.propContinuity,
  b.actorOcclusion?'Occlusion: '+b.actorOcclusion:'',
  'Calm original resting grip, boots planted and full body visible. Front-waist props naturally disappear behind torso in back views; never show hands through cloth. Do not move props to a different hand just to display them. Minimal logical back of same clothes; no new emblem/pouch/ornament/weapon.',
  'Keep own accepted head/skull/short torso/legs proportions while matching primary Wang pixel treatment; head/main hair around half standing body. Human native base64x96 foot32,88 standing80px; padded motion96x96 foot48,88. Source dimensions are NOT game scale; one crown-to-boots scale is measured later, no per-body deformation. This is a new same-NPC view candidate to inspect before drawing its actions, not owner-approved motion or runtime.'
 ].filter(Boolean).join('\n\n')+'\n';
 const promptFile='prompts/'+id+'-direction-neutral.txt',spec='specs/'+id+'-direction-neutral.json',assetPlan='plans/'+id+'-direction-neutral.json';
 await writeFile(resolve(root,promptFile),prompt,{flag:'wx'});
 await writeFile(resolve(root,spec),JSON.stringify({assetType:'character-concept',name:'vn-wave-a-neutral-'+id+'-v2',prompt,size:'1024x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
 p.neutralRequests.push({id,slug:q.slug,actorId:q.actorId,direction:q.direction,source:'direction-neutral/raw/'+id+'.png',prompt:promptFile,promptSha256:hash(Buffer.from(prompt)),spec,assetPlan,images,
  inputHashes:await Promise.all(images.map(async file=>({file,sha256:hash(await readFile(resolve(root,file)))}))),
  physicalHandedness:hands[q.slug],cameraKind:b.cameraKind,origin:'Explicit view lock after original multirow Southeast support biased camera/physical handedness',ownerApproved:false,artApproved:false,motionApproved:false,runtimeImported:false});
}
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({preparedNeutralIds:ids,totalNeutralRequests:p.neutralRequests.length,paidRequests:0}));
