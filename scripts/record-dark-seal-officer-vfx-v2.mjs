import fs from 'node:fs/promises';import {createHash}from'node:crypto';
const root='docs/design/vfx/dark-seal-officer-vfx-v2',sha=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
if(await fs.access(root+'/approval.json').then(()=>true,()=>false))throw Error('Approved FX root is frozen; create another version.');
const plan=JSON.parse(await fs.readFile(root+'/production-plan.json','utf8'));
for(const row of JSON.parse(await fs.readFile(process.argv[2],'utf8'))){
 const j=plan.jobs.find(j=>j.id===row.id);if(!j)throw Error('Unknown source '+row.id);
 const dest=root+'/'+j.source,record=root+'/generation/'+j.id+'.json';
 if(await fs.access(dest).then(()=>true,()=>false)){
  const hash=await sha(dest),retired='sources/superseded/'+j.id+'-'+hash.slice(0,12)+'.png';await fs.copyFile(dest,root+'/'+retired);
  const old=JSON.parse(await fs.readFile(record,'utf8'));old.source=retired;old.status='superseded';await fs.writeFile(root+'/generation/'+j.id+'-'+hash.slice(0,12)+'.json',JSON.stringify(old,null,2)+'\n');
 }
 await fs.copyFile(row.source,dest);if(row.prompt)j.prompt=row.prompt;
 const inputs=[];for(const file of j.references)inputs.push({file,sha256:await sha(file)});
 await fs.writeFile(record,JSON.stringify({id:j.id,date:'2026-10-13',tool:'built-in-imagegen',source:j.source,sourceSha256:await sha(dest),prompt:j.prompt,promptSha256:await sha(root+'/'+j.prompt),inputs,generatedPath:row.source,reason:row.reason??'VFX experience redesign02',artApproved:false},null,2)+'\n');
}
await fs.writeFile(root+'/production-plan.json',JSON.stringify(plan,null,2)+'\n');
