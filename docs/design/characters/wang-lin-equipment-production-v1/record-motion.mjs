import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const [id, source] = process.argv.slice(2);
if (!/^sword-[ab]-(southeast|north)(-(st|aoe)-r2)?$/.test(id ?? '') || !source) throw new Error('Expected sword identity/direction ID and generated raw file');
try { await fs.access(path.join(root,'approval.json')); throw new Error('Approved root is immutable'); }
catch(e) { if(e.code !== 'ENOENT') throw e; }
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const raw = `sources/motion/${id}.png`;
try { await fs.access(path.join(root,raw)); throw new Error('Source exists; record sibling revision'); }
catch(e) { if(e.code !== 'ENOENT') throw e; }
await fs.copyFile(source,path.join(root,raw));
const identityId=id.split('-')[1], direction=id.split('-')[2];
const inputs=[`sources/body/sword-${identityId}.png`,direction==='north'?'../van-hai-npc-visual-standard-v1/inputs/wang-lin-live-north-nearest8x.png':'../wang-lin-concept-direction-v5/inputs/wang-lin-live-southeast-nearest8x.png'];
if(id.endsWith('-r2'))inputs.splice(1,0,`sources/motion/sword-${identityId}-southeast.png`);
let data={schema:'wang-lin-sword-pilot-body-generation-1',date:'2026-10-14',ownerApproved:false,motionApproved:false,runtimeIntegrated:false,records:[]};
try { data=JSON.parse(await fs.readFile(path.join(root,'motion-generation.json'),'utf8')); }
catch(e) { if(e.code!=='ENOENT') throw e; }
const prompt=`sources/motion/${id}.prompt.txt`, lineage=[];
for(const file of inputs) lineage.push({file,sha256:hash(await fs.readFile(path.resolve(root,file)))});
data.records.push({id,identityId,direction,raw,sha256:hash(await fs.readFile(path.join(root,raw))),prompt,promptSha256:hash(await fs.readFile(path.join(root,prompt))),inputs:lineage,original:source,tool:'built-in-imagegen',transparentRequested:true,layout:id.endsWith('-r2')?'3columns/4rows: neutral6,action6':'6columns/5rows: neutral,idle,run,ST,AOE',selected:true,...(id.endsWith('-r2')?{actionReplacement:id.includes('-st-')?'cast-single-target':'cast-aoe',correction:'Keep neutral anatomy and recover standing size; legacy action rows retained as history'}:{})});
await fs.writeFile(path.join(root,'motion-generation.json'),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({id,raw}));
