import {readFile,writeFile,copyFile,open,unlink,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {existsSync} from 'node:fs';
if(existsSync(new URL('./approval.json',import.meta.url)))throw new Error('Concept approval locks this V5 source package; create a new production package.');
const root=fileURLToPath(new URL('./',import.meta.url)),[id,original]=process.argv.slice(2),p=resolve(root,'generation.json'),sha=b=>createHash('sha256').update(b).digest('hex'),lock=resolve(root,'sources/record.lock');
let handle;for(let attempt=0;attempt<120;attempt++){try{handle=await open(lock,'wx');break;}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,250));}}
if(!handle)throw Error('Source recorder busy');
try{
 const m=JSON.parse(await readFile(p,'utf8')),r=m.requests.find(v=>v.id===id);if(!r||!original)throw Error('Unknown source');
 await copyFile(original,resolve(root,r.raw));const b=await readFile(resolve(root,r.raw)),info=await sharp(b).metadata();
 for(const i of r.inputs)i.sha256=sha(await readFile(resolve(root,i.file)));
 Object.assign(r,{status:'generated-preview',original,actualDimensions:[info.width,info.height],sha256:sha(b),ownerApproved:false,artApproved:false});
 await writeFile(p+'.next',JSON.stringify(m,null,2)+'\n');await rename(p+'.next',p);console.log(JSON.stringify({id,kind:r.kind,dimensions:r.actualDimensions}));
}finally{await handle.close();await unlink(lock);}
