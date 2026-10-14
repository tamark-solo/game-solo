import {readFile,writeFile,copyFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const ROOT=path.dirname(fileURLToPath(import.meta.url)),V2=path.dirname(ROOT);
const [id,original]=process.argv.slice(2),plan=JSON.parse(await readFile(path.join(ROOT,'plan.json'),'utf8')),spec=plan.records.find(r=>r.id===id);
if(!spec)throw Error('Unknown gear source');
const file='gear/'+spec.familyId+'/sources/'+id+'.png',out=path.join(V2,file);
try{await stat(out);throw Error('Source already recorded');}catch(e){if(e.code!=='ENOENT')throw e}
await copyFile(original,out);
let gen={schema:'wang-lin-equipment-physical-gear-generation-2',date:'2026-10-14',tool:'built-in ImageGen',records:[],ownerApproved:false,runtimeIntegrated:false};
try{gen=JSON.parse(await readFile(path.join(ROOT,'generation.json'),'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
const raw=await readFile(out),prompt=await readFile(path.join(V2,spec.prompt));
gen.records.push({...spec,file,sourceSha256:createHash('sha256').update(raw).digest('hex'),original,originalSha256:createHash('sha256').update(raw).digest('hex'),promptSha256:createHash('sha256').update(prompt).digest('hex'),selected:true,transparentRequested:true});
await writeFile(path.join(ROOT,'generation.json'),JSON.stringify(gen,null,2)+'\n');
console.log(JSON.stringify({id,file,bytes:raw.length}));
