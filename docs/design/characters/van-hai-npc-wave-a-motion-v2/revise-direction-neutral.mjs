// Explicit view/gear correction or unposted projection refinement. Never retry a POST.
import {readFile,writeFile,access,copyFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),ids=process.argv.slice(2);
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');assert.ok(ids.length);
const hash=b=>createHash('sha256').update(b).digest('hex');
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8'));
const projection={
 south:'Direct FRONT: anatomical RIGHT is screen-LEFT, anatomical LEFT screen-RIGHT.',
 southwest:'FRONT-LEFT: anatomical RIGHT arm/hip is the FAR side, screen-LEFT/up, mostly occluded by torso. Anatomical LEFT arm/hip is NEAR, screen-RIGHT/down. Never move a RIGHT-hand/RIGHT-hip item to the visible LEFT near side.',
 west:'LEFT PROFILE: anatomical RIGHT arm/hip is the FAR side behind the torso; anatomically LEFT is NEAR. Far worn gear is mostly occluded, not a fully exposed object on the near hip. Do not turn frontal to show the hidden item.',
 northwest:'BACK-LEFT: anatomical RIGHT arm/hip is FAR on screen-RIGHT/up; anatomical LEFT near arm/hip projects screen-LEFT/down. RIGHT-hand weapon/basket must not be gripped by the visible LEFT near hand.',
 north:'Direct BACK: anatomical RIGHT is screen-RIGHT, anatomical LEFT screen-LEFT. Front-waist papers/slips/hands are hidden by torso; no front face.',
 northeast:'BACK-RIGHT: anatomical RIGHT arm/hip is the NEAR side on screen-RIGHT/down; anatomical LEFT is FAR on screen-LEFT/up. RIGHT-hip gourd/RIGHT-hand weapon belongs to visible RIGHT near side.',
 east:'RIGHT PROFILE: anatomical RIGHT arm/hip is NEAR and may be visible at the correct flank; anatomical LEFT is FAR and occluded. Keep true side face, no two-eye frontal turn.'
};
for(const id of ids){
 const q=p.neutralRequests.find(q=>q.id===id);assert.ok(q);assert.ok(!q.projectionRefined,'Already refined; use a new explicit brief for a later issue');
 const original=structuredClone(q);
 let generated=false,bytes=null;try{bytes=await readFile(resolve(root,q.source));generated=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 const oldPrompt=await readFile(resolve(root,q.prompt),'utf8');
 const header=[
  'EXPLICIT ANATOMICAL PROJECTION RULE: '+projection[q.direction],
  q.physicalHandedness,
  generated?'PROP CORRECTION ONLY. IMAGE1 remains PRIMARY live Wang target-view anatomy/style/camera. IMAGE2 now shows this SAME NPC already in the target view, but its prop side/occlusion is WRONG. Keep its own face, hair, clothes, scale and correct target camera; redraw only the incorrectly placed held/worn item to the correct anatomical side. Never mirror the figure, swap arms, change identity or rotate camera.':'This is a new true-view neutral. IMAGE1 is PRIMARY live Wang target camera; IMAGE2 is own Southeast identity only. Override its projected gear placement using the anatomical projection above.',
  q.slug==='ky-an'&&['southwest','west'].includes(q.direction)?'The blue gourd at anatomical RIGHT hip is on the FAR side and MUST be mostly hidden behind robe/torso; only a small far strap/blue rim may peek at silhouette. Do not show a big exposed blue gourd at the near LEFT hip. Bamboo slips remain held by both hands in front.': '',
  q.slug==='ky-an'&&['north','northeast'].includes(q.direction)?'The blue gourd must attach at anatomical RIGHT hip, screen-RIGHT in this back view; absolutely no blue gourd hanging on screen-LEFT. Keep front bamboo slips naturally occluded.':'',
  q.slug==='phung-da'&&q.direction==='northwest'?'Wooden sword is in anatomical RIGHT far hand on screen-RIGHT/up, with natural partial occlusion. The near LEFT arm/hand on screen-LEFT/down stays empty. No sword grip attached to the near left hand.':'',
  'Single transparent neutral only. Full crown/boots/props inside margins. Preserve true camera and own morphology; no full-body flip, new gear, shadow or FX.'
 ].filter(Boolean).join('\n\n');
 const prompt=header+'\n\n'+oldPrompt;
 const suffix=generated?'prop-r2':'projection',promptFile='prompts/'+id+'-neutral-'+suffix+'.txt',spec='specs/'+id+'-neutral-'+suffix+'.json',assetPlan='plans/'+id+'-neutral-'+suffix+'.json';
 const images=generated?[q.images[0],q.source]:q.images;
 await writeFile(resolve(root,promptFile),prompt,{flag:'wx'});
 await writeFile(resolve(root,spec),JSON.stringify({assetType:'character-concept',name:'vn-wave-a-neutral-'+id+'-'+suffix,prompt,size:'1024x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
 q.lineageParents??=[];if(generated)q.lineageParents.push({request:original,sourceSha256:hash(bytes),routerMetadataSha256:hash(await readFile(resolve(root,q.source.replace(/\.png$/,'.json')))),reason:'Wrong anatomical gear side/occlusion; prior true camera and own identity retained'});
 q.preparedRevisions??=[];q.preparedRevisions.push({request:original,status:generated?'rejected-prop-placement-source-preserved':'pure-plan-only-superseded-before-paid-call'});
 q.source='direction-neutral/raw/'+id+'-'+suffix+'.png';q.prompt=promptFile;q.promptSha256=hash(Buffer.from(prompt));q.spec=spec;q.assetPlan=assetPlan;q.images=images;
 q.inputHashes=await Promise.all(images.map(async file=>({file,sha256:hash(await readFile(resolve(root,file)))})));
 q.referencePolicy={primaryStyleImageIndex:1,sameActorSameDirectionCorrection:generated};q.projectionRefined=true;q.projectionRule=projection[q.direction];
}
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({refinedNeutralIds:ids,paidRequests:0,priorSourcesAndPlansPreserved:true}));
