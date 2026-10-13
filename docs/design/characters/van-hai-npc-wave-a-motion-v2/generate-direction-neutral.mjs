import {readFile,writeFile,access,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const ids=process.argv.slice(2);assert.ok(ids.length,'Pass explicit planned request IDs');
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
await mkdir(resolve(root,'review'),{recursive:true});const results=[];
for(const id of ids){
 const q=p.neutralRequests.find(r=>r.id===id);assert.ok(q,'Unknown planned request '+id);
 const plan=JSON.parse(await readFile(resolve(root,q.assetPlan),'utf8'));assert.ok(!plan.isError,'MCP asset plan failed');
 for(const input of q.inputHashes)assert.equal(hash(await readFile(resolve(root,input.file))),input.sha256,'Generation input changed');
 let exists=false;try{await access(resolve(root,q.source));exists=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 if(!exists){
  console.log(JSON.stringify({id,status:'starting-one-paid-request',automaticRetry:false}));
  const args=[resolve(workspace,'scripts/imagegen-router.mjs'),'edit','--prompt-file',resolve(root,q.prompt),...q.images.flatMap(file=>['--image',resolve(root,file)]),'--quality','high',...(q.background?['--background',q.background]:[]),'--size','1024x1536','--out',resolve(root,q.source)];
  const result=await new Promise((done,reject)=>{const child=spawn(process.execPath,args,{cwd:workspace,windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('close',code=>done({code,stdout,stderr}));});
  if(result.code!==0){const failure={id,status:'failed-no-retry',error:result.stderr.slice(-1200)};results.push(failure);console.error(JSON.stringify(failure));continue;}
 }
 const bytes=await readFile(resolve(root,q.source)),metadata=JSON.parse(await readFile(resolve(root,q.source.replace(/\.png$/,'.json')),'utf8'));
 assert.equal(metadata.model,'gpt-image-2');if(q.background)assert.equal(metadata.requestParameters.background,q.background);assert.equal(metadata.operation,'edit');assert.equal(metadata.image.sha256,hash(bytes));
 const row={id,status:exists?'existing-source-preserved':'generated-owner-review-pending',sha256:hash(bytes),dimensions:metadata.image.dimensions??metadata.image.size,automaticRetry:false};results.push(row);console.log(JSON.stringify(row));
}
await writeFile(resolve(root,'review/neutral-generation-'+ids.join('_')+'.json'),JSON.stringify({date:'2026-10-13',scope:'Six Wave A seven new true directions; no inherited retry policy',results},null,2)+'\n');
if(results.some(r=>r.status==='failed-no-retry'))process.exitCode=1;
