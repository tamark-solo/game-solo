import {readFile,writeFile,copyFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const [id,source]=process.argv.slice(2);
const plan=JSON.parse(await readFile(path.join(root,'plan.json'),'utf8'));
if(!plan.sequences.some(s=>s.id===id)) throw Error('Unknown sequence');
const selected=path.join(root,'sources',id+'.png');
try {await stat(selected);throw Error('Source already recorded: '+id);} catch(e) {if(e.code!=='ENOENT')throw e;}
await copyFile(source,selected);
const bytes=await readFile(selected), promptBytes=await readFile(path.join(root,'sources',id+'.prompt.txt'));
let generation={schema:'wang-lin-sword-pilot-vfx-generation-1',date:'2026-10-14',tool:'built-in image_gen',artApproved:false,runtimeIntegrated:false,sources:[]};
try {generation=JSON.parse(await readFile(path.join(root,'generation.json'),'utf8'));} catch(e){if(e.code!=='ENOENT')throw e;}
generation.sources.push({id,file:'sources/'+id+'.png',originalPath:source,selected:true,sha256:createHash('sha256').update(bytes).digest('hex'),prompt:'sources/'+id+'.prompt.txt',promptSha256:createHash('sha256').update(promptBytes).digest('hex'),inputs:plan.inputs,transparentRequested:true});
await writeFile(path.join(root,'generation.json'),JSON.stringify(generation,null,2)+'\n');
console.log(JSON.stringify({id,file:'sources/'+id+'.png',bytes:bytes.length}));
