import {readFile,access,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-concepts-v1');
const ids=process.argv.slice(2);assert.ok(ids.length,'Explicit request IDs required');
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
await mkdir(resolve(root,'review'),{recursive:true});
const results=[];
for(const id of ids){
 const q=p.requests.find(r=>r.id===id);assert.ok(q,'Unknown planned request: '+id);
 const assetPlan=JSON.parse(await readFile(resolve(root,q.assetPlan??'plans/'+id+'.json'),'utf8'));assert.ok(!assetPlan.isError);
 for(const input of q.inputHashes)assert.equal(hash(await readFile(resolve(root,input.file))),input.sha256);
 let exists=false;try{await access(resolve(root,q.source));exists=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 if(!exists){
  console.log(JSON.stringify({id,status:'one-paid-request-starting',retry:false}));
  const args=[resolve(workspace,'scripts/imagegen-router.mjs'),'edit','--prompt-file',resolve(root,q.prompt),...q.images.flatMap(file=>['--image',resolve(root,file)]),'--quality','high','--size','1024x1536','--out',resolve(root,q.source)];
  const result=await new Promise((done,reject)=>{const child=spawn(process.execPath,args,{cwd:workspace,windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('close',code=>done({code,stdout,stderr}));});
  if(result.code!==0){
   const error=result.stderr.slice(-1200);results.push({id,status:'failed-no-retry',error});console.error(JSON.stringify(results.at(-1)));continue;
  }
 }
 const bytes=await readFile(resolve(root,q.source)),meta=JSON.parse(await readFile(resolve(root,q.source.replace(/\.png$/,'.json')),'utf8'));
 assert.equal(hash(bytes),meta.image.sha256);assert.equal(meta.model,'gpt-image-2');assert.equal(meta.operation,'edit');
 const row={id,status:exists?'existing-source-preserved':'generated-review-pending',sha256:hash(bytes),dimensions:meta.image.dimensions??meta.image.size,retry:false};results.push(row);console.log(JSON.stringify(row));
}
await writeFile(resolve(root,'review/generation-'+ids.join('_')+'.json'),JSON.stringify({date:'2026-10-13',scope:'Six new Wave A neutral concepts; no inherited V2 retry policy',results},null,2)+'\n');
if(results.some(r=>r.status==='failed-no-retry'))process.exitCode=1;
