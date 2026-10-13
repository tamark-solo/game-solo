// Explicit new correction brief, not a POST retry. Every old raw/metadata remains pinned.
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),[id,revision,briefFile]=process.argv.slice(2);
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');assert.ok(/^[a-z0-9-]+$/.test(id)&&/^r[2-9][0-9]*$/.test(revision));
const hash=b=>createHash('sha256').update(b).digest('hex'),digest=async file=>hash(await readFile(resolve(root,file)));
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),q=p.requests.find(q=>q.id===id);assert.ok(q&&q.directionNeutralReference);
const original=structuredClone(q),brief=await readFile(resolve(root,briefFile),'utf8'),n=JSON.parse(await readFile(resolve(root,q.directionNeutralReference.registration),'utf8'));
assert.equal(n.visuallyReviewed,true);assert.equal(n.slug,q.slug);assert.equal(n.direction,q.direction);
const prompt='EXPLICIT SAME-NPC SAME-VIEW MOTION REPAIR. Correct the existing18-pose sheet,6columns3rows. IMAGE1 live Wang '+q.direction.toUpperCase()+' remains PRIMARY human anatomy/pixel/camera. IMAGE2 is this SAME NPC SAME-view prior motion sheet and correction target. IMAGE3 is its verified same-direction own neutral nearest8x. Preserve own identity/head/body/robe/boots and real view in all18 poses.\n\n'+brief+'\n\nKeep row1idle6,row2talk6,row3profession6, real pose progression and return-to-neutral. Do not reuse one static neutral or mirror camera. One source scale from neutral crown to boots later. True transparent RGBA PNG, no painted checkerboard/grid/matte/shadow/FX. Full props and boots in generous gutters.\n';
q.sourceCorrectionParent={request:original,sourceSha256:await digest(original.source),routerMetadataSha256:await digest(original.source.replace(/\.png$/,'.json')),reason:brief.trim()};
q.source='raw/'+id+'-repair-'+revision+'.png';q.prompt='prompts/'+id+'-motion-repair-'+revision+'.txt';q.spec='specs/'+id+'-motion-repair-'+revision+'.json';q.assetPlan='plans/'+id+'-motion-repair-'+revision+'.json';q.promptSha256=hash(Buffer.from(prompt));q.images=[original.images[0],original.source,n.nearest8x];
q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:await digest(file)})));q.background='transparent';q.referencePolicy={stage:'explicit-same-view-action-repair',primaryStyleImageIndex:1,correctionTargetImageIndex:2,editTargetFirst:false,sameDirectionNeutralInput:true,ownApprovedPilotIdentityLocked:true};
await writeFile(resolve(root,q.prompt),prompt,{flag:'wx'});await writeFile(resolve(root,q.spec),JSON.stringify({assetType:'character-concept',name:'vn-wave-a-motion-'+id+'-repair-'+revision,prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');console.log(JSON.stringify({prepared:id,revision,paidRequests:0}));
