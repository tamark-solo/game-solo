import{readFile,writeFile,copyFile,stat}from'node:fs/promises';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';import path from'node:path';
const ROOT=path.dirname(fileURLToPath(import.meta.url)),[family,id,original]=process.argv.slice(2),base=path.join(ROOT,family),plan=JSON.parse(await readFile(path.join(base,'plan.json'),'utf8')),spec=plan.sequences.find(s=>s.id===id);
if(!spec)throw Error('Unknown FX sequence');const file='sources/'+id+'.png',out=path.join(base,file);
try{await stat(out);throw Error('Raw already recorded');}catch(e){if(e.code!=='ENOENT')throw e}
await copyFile(original,out);const bytes=await readFile(out),prompt='sources/'+id+'.prompt.txt',pb=await readFile(path.join(base,prompt));
let gen={schema:'wang-lin-equipment-family-vfx-generation-2',date:'2026-10-14',familyId:family,tool:'built-in ImageGen',sources:[],ownerApproved:false,runtimeIntegrated:false};
try{gen=JSON.parse(await readFile(path.join(base,'generation.json'),'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
gen.sources.push({id,file,originalPath:original,selected:true,sha256:createHash('sha256').update(bytes).digest('hex'),prompt,promptSha256:createHash('sha256').update(pb).digest('hex'),inputs:plan.inputs,transparentRequested:true});
await writeFile(path.join(base,'generation.json'),JSON.stringify(gen,null,2)+'\n');console.log(JSON.stringify({family,id,file,bytes:bytes.length}));
