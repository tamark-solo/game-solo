// Explicit failed-attachment correction; keep prior sources and lineage immutable.
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),q=p.neutralRequests.find(q=>q.id==='hua-hanh-west');
assert.equal(q.source,'direction-neutral/raw/hua-hanh-west-repair-r2.png');
const original=structuredClone(q),prior=await readFile(resolve(root,q.source));
q.lineageParents.push({request:original,sourceSha256:hash(prior),routerMetadataSha256:hash(await readFile(resolve(root,q.source.replace(/\.png$/,'.json')))),reason:'Brown patch remains on wrong near LEFT shoulder; remove this exposed near-side patch in true West profile'});
const prompt='Repair ONE isolated Hứa Hành true LEFT PROFILE neutral. IMAGE1 live Wang West is PRIMARY compact human anatomy, pixel style and camera. IMAGE2 is this SAME NPC prior West neutral; preserve his face, hair, cloak, paper, left hip tube, boots and dimensions.\n\nREQUIRED VISIBLE EDIT: remove the large tan/brown rectangular patch currently on the exposed screen-RIGHT upper sleeve below the hood. Replace that rectangle with continuous plain GREY cloak fabric. The entire visible near upper sleeve must be plain grey, with NO tan/brown patch or stitching rectangle. The actual patch belongs to his far anatomical RIGHT shoulder and is hidden behind his torso from this LEFT-facing view; DO NOT draw any visible replacement patch in this image. Do not rotate or mirror his head/body, swap hands or move any other item.\n\nOne full-body neutral, genuine transparent RGBA background, full crown/boots/props with generous margins. No shadow, glow, checkerboard, background or text. Large compact head/short torso and legs stay unchanged. No new figure or action sheet.\n';
q.source='direction-neutral/raw/hua-hanh-west-patch-r3.png';q.prompt='prompts/hua-hanh-west-neutral-patch-r3.txt';q.spec='specs/hua-hanh-west-neutral-patch-r3.json';q.assetPlan='plans/hua-hanh-west-neutral-patch-r3.json';q.promptSha256=hash(Buffer.from(prompt));q.images=[original.images[0],original.source];
q.inputHashes=await Promise.all(q.images.map(async file=>({file,sha256:hash(await readFile(resolve(root,file)))})));q.referencePolicy={primaryStyleImageIndex:1,sameActorSameDirectionCorrection:true};q.background='transparent';
await writeFile(resolve(root,q.prompt),prompt,{flag:'wx'});await writeFile(resolve(root,q.spec),JSON.stringify({assetType:'character-concept',name:'vn-wave-a-neutral-hua-hanh-west-patch-r3',prompt,size:'1024x1536',quality:'high',n:1},null,2)+'\n',{flag:'wx'});
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({prepared:q.id,paidRequests:0,priorSourcesPreserved:true}));
