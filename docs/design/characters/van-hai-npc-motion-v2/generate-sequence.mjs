import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v2';
const ids=process.argv.slice(2);assert.ok(ids.length,'Pass explicit request IDs; no implicit all or retry.');
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const policyFile=root+'/review/json-retry-policy.json';
let policy=null;try{policy=JSON.parse(await readFile(policyFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const savePolicy=async()=>{await writeFile(policyFile,JSON.stringify(policy,null,2)+'\n');};
for(const id of ids){
 const request=plan.requests.find(r=>r.id===id);assert.ok(request,'Unknown planned request: '+id);
 const compiled=JSON.parse(await readFile(root+'/'+(request.assetPlan??'plans/'+id+'.json'),'utf8'));assert.ok(!compiled.isError,'Asset plan failed: '+id);
 for(const input of request.inputHashes)assert.equal(hash(await readFile(root+'/'+input.file)),input.sha256,'Input changed before request: '+input.file);
 let present=false;try{await access(root+'/'+request.source);present=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 if(!present){
  const promptHash=hash(await readFile(root+'/'+request.prompt)),retryKey=id+'|'+request.source+'|'+promptHash;
  if(policy?.knownFailedRequestKeys?.includes(retryKey)){
   assert.ok(policy.allowedRequestIds.includes(id)&&policy.maxRetriesPerRequest===1);
   assert.equal(policy.usedRetries[retryKey]??0,0,'Known-failed request retry already consumed');
   policy.usedRetries[retryKey]=1;policy.knownFailedRequestKeys=policy.knownFailedRequestKeys.filter(key=>key!==retryKey);await savePolicy();
  }
  if(request.retryAuthorization){
   const file=root+'/'+request.retryAuthorization,authorization=JSON.parse(await readFile(file,'utf8'));
   assert.equal(authorization.requestId,id);assert.equal(authorization.source,request.source);
   assert.ok(authorization.usedPaidRequests<authorization.maxAdditionalPaidRequests,'Explicit retry authorization already consumed: '+id);
   authorization.usedPaidRequests++;authorization.status='authorized-one-retry-consumed';
   await writeFile(file,JSON.stringify(authorization,null,2)+'\n');
  }
  console.log(JSON.stringify({id,status:'starting-one-paid-request'}));
  const args=['scripts/imagegen-router.mjs','edit','--prompt-file',root+'/'+request.prompt,...request.images.flatMap(file=>['--image',root+'/'+file]),'--quality','high','--size','1536x1536','--out',root+'/'+request.source];
  const post=()=>new Promise((done,reject)=>{const child=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe'],windowsHide:true});let stdout='',stderr='';child.stdout.on('data',b=>{stdout+=b;});child.stderr.on('data',b=>{stderr+=b;});child.on('error',reject);child.on('close',code=>done({code,stdout,stderr}));});
  let result=await post();
  if(result.code!==0&&result.stderr.includes('Router returned invalid JSON (HTTP 200)')&&policy?.allowedRequestIds.includes(id)&&(policy.usedRetries[retryKey]??0)<policy.maxRetriesPerRequest&&!request.retryAuthorization){
   policy.usedRetries[retryKey]=(policy.usedRetries[retryKey]??0)+1;await savePolicy();
   console.log(JSON.stringify({id,status:'owner-authorized-one-JSON-retry',unchangedPromptHash:promptHash}));
   result=await post();
  }
  if(result.code!==0){console.error('Request failed; sequence stopped with no retry: '+id+'\n'+result.stderr.slice(-1200));process.exit(1);}
 }
 const bytes=await readFile(root+'/'+request.source),metadata=JSON.parse(await readFile(root+'/'+request.source.replace(/\.png$/,'.json'),'utf8'));
 assert.equal(metadata.image.sha256,hash(bytes),'Saved source/metadata differs: '+id);
 const dimensions=metadata.image.dimensions??metadata.image.size;
 const warnings=dimensions?.width===1536&&dimensions?.height===1536?[]:['Router dimensions differ from1536x1536; actual source preserved and measured.'];
 console.log(JSON.stringify({id,status:present?'existing-source-preserved':'generated-review-pending',sha256:hash(bytes),dimensions,warnings}));
}
