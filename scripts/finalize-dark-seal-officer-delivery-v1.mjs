// Hash the isolated review pack only; no generation, sync, gameplay or map writes.
import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const root='docs/design/characters/dark-seal-officer-animation-v1',read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
if(await fs.access(root+'/approval.json').then(()=>true,()=>false))throw Error('Approved pack is frozen. Produce a new version.');
const [body,fx,history]=await Promise.all(['catalog.json','vfx/catalog.json','generation/history.json'].map(p=>read(root+'/'+p)));
assert.equal(body.coverage.clips,72);assert.equal(body.coverage.poses,432);assert.deepEqual(body.coverage.missing,[]);assert.equal(fx.coverage.poses,36);assert.deepEqual(fx.coverage.missing,[]);
const targets=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const path=dir+'/'+e.name;if(e.isDirectory())await walk(path);else if(path!==root+'/delivery.json'){const bytes=await fs.readFile(path);targets.push({file:path.slice(root.length+1),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}}
await walk(root);targets.sort((a,b)=>a.file.localeCompare(b.file));
const delivery={schema:1,id:'dark-seal-officer-animation-v1',date:'2026-10-13',status:'candidate-art-motion-review',bodyClips:72,bodyActionPoses:432,calibrationPoses:144,selectedBodySources:24,bodyGenerationsRetained:history.bodyGenerations,supersededSourcesRetained:history.superseded,vfxSources:6,vfxSequences:6,vfxPoses:36,socketCandidates:192,artApproved:false,ownerApproved:false,runtimeImplemented:false,runtimeConsumable:false,gameplayTimingApproved:false,scope:'Officer03-based new views/motion/FX, isolated Core ART review and hit/miss/cancel fixture. No AI/server/HP/loot/map/DB/catalog release.',targets};
await fs.writeFile(root+'/delivery.json',JSON.stringify(delivery,null,2)+'\n');console.log({files:targets.length,bytes:targets.reduce((n,t)=>n+t.bytes,0),bodyClips:72,bodyActionPoses:432,vfxSequences:6,vfxPoses:36,artApproved:false});
