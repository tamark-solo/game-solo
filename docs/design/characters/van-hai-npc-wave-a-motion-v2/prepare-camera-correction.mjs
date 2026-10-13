// Explicit visual correction only. Original source/request remains preserved, never an API retry.
import {readFile,writeFile,mkdir,access,copyFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),id=process.argv[2];
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
assert.ok(id&&process.argv.length===3,'Pass one explicitly audited camera-failure request ID');
const hash=b=>createHash('sha256').update(b).digest('hex');
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),q=p.requests.find(r=>r.id===id);
assert.ok(q);assert.equal(q.direction,'southwest','This recipe is scoped to the observed opposite-front camera failure');
assert.ok(!q.revisions,'Use another explicit correction brief for a later revision');
const original={...q},source=await readFile(resolve(root,q.source)),metadata=await readFile(resolve(root,q.source.replace(/\.png$/,'.json')));
await mkdir(resolve(root,'review/rejected'),{recursive:true});
for(const suffix of ['root-review.json','root-review-2x.png','root-review-6x.png']){
 const file='review/'+id+'-'+suffix;
 try{await copyFile(resolve(root,file),resolve(root,'review/rejected/'+id+'-r1-'+suffix));}catch(e){if(e.code!=='ENOENT')throw e;}
}
try{await access(resolve(root,'production-plan-before-camera-corrections.json'));}catch(e){if(e.code!=='ENOENT')throw e;await copyFile(resolve(root,'production-plan.json'),resolve(root,'production-plan-before-camera-corrections.json'));}
const header=[
 'CAMERA CORRECTION: The earlier source for this request accidentally stayed Southeast/front-RIGHT. Reconstruct every one of the18poses as the REAL SOUTHWEST/front-LEFT view now. Do NOT repeat the right-facing pose visible in identity inputs2or3. Do NOT mirror or horizontally flip a sheet: newly draw the opposite view preserving physical handedness and costume asymmetry.',
 'IMAGE1 is the camera authority: head/nose gaze points toward the LEFT edge of this sheet, screen DOWN-LEFT. In a front-left three-quarter view the nose is left of the face center, the visible near cheek/ear is on screen RIGHT, and the far face/eye is foreshortened on screen LEFT. Same leftward skull/torso/boots axes for idle, talk and profession. Never face the page right, never return Southeast in a speaking or tool-inspection frame.',
 'Images2and3 are identity/color/physical-hand references ONLY; their Southeast orientation is explicitly WRONG for this target. Transform the SAME NPC into image1 camera. Held tools retain the same anatomical hands and correct depth, although their projected screen sides change under the true rotation.',
 'Keep the18fullposes,6columns3rows, alpha gutters, same per-source body scale and motion progression. No flip shortcut, text, arrow, background, shadow or FX.'
].join('\n\n');
const prompt=header+'\n\n'+await readFile(resolve(root,q.prompt),'utf8');
const promptFile='prompts/'+id+'-r2.txt',spec='specs/'+id+'-r2.json',assetPlan='plans/'+id+'-r2.json';
await writeFile(resolve(root,promptFile),prompt,{flag:'wx'});
await writeFile(resolve(root,spec),JSON.stringify({assetType:'character-concept',name:'vn-npc-wave-a-motion-'+id+'-camera-r2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
q.revisions=[{reason:'Raw all18poses failed target camera; retained front-right instead of required front-left',originalRequest:original,sourceSha256:hash(source),routerMetadataSha256:hash(metadata),status:'rejected-camera-original-preserved'}];
q.source='raw/'+id+'-r2.png';q.prompt=promptFile;q.promptSha256=hash(Buffer.from(prompt));q.spec=spec;q.assetPlan=assetPlan;
q.status='explicit-visual-camera-correction-awaiting-plan';
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({id,source:q.source,spec,assetPlan,originalSourcePreserved:original.source,paidRequests:0,automaticRetry:false}));
