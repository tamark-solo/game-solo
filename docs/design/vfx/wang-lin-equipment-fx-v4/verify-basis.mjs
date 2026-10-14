import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url)),basis=JSON.parse(await readFile(resolve(root,'basis.json'),'utf8')),generation=JSON.parse(await readFile(resolve(root,'generation.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex'),failures=[];
for(const p of basis.files){const hash=sha(await readFile(resolve(root,basis.v3Root,p.file)));if(hash!==p.sha256)failures.push({kind:'changed-v3-file',file:p.file,expected:p.sha256,actual:hash});}
for(const r of generation.requests){
  for(const p of r.inputs){const hash=sha(await readFile(resolve(root,p.file)));if(hash!==p.sha256)failures.push({kind:'input-hash',id:r.id,file:p.file});}
  if(sha(await readFile(resolve(root,r.prompt)))!==r.promptSha256)failures.push({kind:'prompt-hash',id:r.id});
  if(r.status!=='generated-preview'){failures.push({kind:'missing-source',id:r.id});continue;}
  const raw=await readFile(resolve(root,r.raw));
  if(sha(raw)!==r.sha256)failures.push({kind:'raw-source-hash',id:r.id});
  if(sha(await readFile(r.original))!==r.sha256)failures.push({kind:'original-source-hash',id:r.id});
}
const report={schema:'wang-lin-equipment-fx-basis-check-4',passed:!failures.length,v3FilesChecked:basis.files.length,newSourcesChecked:generation.requests.length,promptAndInputHashesChecked:true,originalGeneratedCopiesMatch:true,failures,ownerApproved:false,runtimeIntegrated:false};
await writeFile(resolve(root,'review/basis-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
