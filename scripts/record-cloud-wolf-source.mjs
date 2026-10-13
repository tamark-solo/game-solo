import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
const root='docs/design/characters/cloud-wolf-king-animation-v1',sha=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
if(await fs.access(root+'/approval.json').then(()=>true,()=>false))throw Error('Approved Lang Vuong pack is frozen. Produce a new version.');
const plan=JSON.parse(await fs.readFile(root+'/production-plan.json'));
for(const row of JSON.parse(await fs.readFile(process.argv[2]))){
 let job=plan.jobs.find(j=>j.id===row.id);if(!job){job=row.job;plan.jobs.push(job);}
 const target=root+'/'+job.source;
 if(await fs.access(target).then(()=>true,()=>false)){
  const hash=await sha(target),old='sources/superseded/'+row.id+'-'+hash.slice(0,12)+'.png';await fs.copyFile(target,root+'/'+old);
  const g=root+'/generation/'+row.id+'.json';if(await fs.access(g).then(()=>true,()=>false))await fs.copyFile(g,root+'/generation/'+row.id+'-'+hash.slice(0,12)+'.json');
 }
 await fs.copyFile(row.source,target);job.prompt=row.prompt;job.references=row.references;
 const inputs=[];for(const file of job.references)inputs.push({file,sha256:await sha(file)});
 await fs.writeFile(root+'/generation/'+row.id+'.json',JSON.stringify({id:row.id,date:'2026-10-13',tool:'built-in-imagegen',source:job.source,sourceSha256:await sha(target),generatedPath:row.source,prompt:job.prompt,promptSha256:await sha(root+'/'+job.prompt),inputs,reason:row.reason,artApproved:false},null,2)+'\n');
}
await fs.writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
