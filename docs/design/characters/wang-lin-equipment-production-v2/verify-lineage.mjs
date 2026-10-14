import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),workspace=path.resolve(root,'../../../..');
const requested=process.argv.find(v=>v.startsWith('--family='))?.split('=')[1];
const families=requested?[requested]:['sword','banner','chariot','bead'];
const checks=[],records=[],planned=[];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const exists=async p=>{try{return (await fs.stat(p)).isFile();}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const check=(name,pass)=>{if(!pass)throw Error(name);checks.push({name,passed:true});};
async function pinned(file,pin,base,label){
 check(label+' descriptor',typeof file==='string'&&/^[a-f0-9]{64}$/.test(pin??''));
 const candidates=[...new Set(path.isAbsolute(file)?[path.resolve(file)]:[path.resolve(base,file),path.resolve(root,file)])];
 const found=[];for(const p of candidates)if(await exists(p))found.push(p);
 check(label+' unambiguous local reference',found.length===1);
 const p=found[0],rel=path.relative(workspace,p);
 check(label+' stays in workspace',!rel.startsWith('..')&&!path.isAbsolute(rel));
 check(label+' SHA',sha(await fs.readFile(p))===pin);
 return {file:path.relative(root,p).replaceAll('\\','/'),sha256:pin};
}
async function generation(file,kind){
 const full=path.resolve(root,file);if(!await exists(full))return;
 const data=await read(full),base=path.dirname(full),items=data.records??data.sources??[];
 for(const r of items){
  if(r.familyId&&!families.includes(r.familyId))continue;
  const hash=r.sha256??r.sourceSha256;
  if(!hash){planned.push({descriptor:file,id:r.id,status:r.status??'planned'});continue;}
  const label=file+':'+r.id;
  check(label+' built-in generation',/built[ -]in.?imagegen/i.test(r.tool??data.tool??''));
  check(label+' transparent request',r.transparentRequested===true);
  const raw=await pinned(r.raw??r.file,hash,base,label+' raw');
  const prompt=await pinned(r.prompt,r.promptSha256,base,label+' prompt');
  check(label+' immutable input snapshots',Array.isArray(r.inputs)&&r.inputs.length>0);
  const inputs=[];for(const [i,input]of r.inputs.entries())inputs.push({...await pinned(input.file,input.sha256,base,label+' input'+(i+1)),role:input.role});
  if(kind==='body')check(label+' own identity or own edit target FIRST',/own|approved.*identity|same.identity/i.test(inputs[0].role??'')&&!/Wang/i.test(inputs[0].role??''));
  const original=r.original??r.originalPath;check(label+' original tool output recorded',typeof original==='string');
  let originalPresent=await exists(original);
  if(originalPresent)check(label+' workspace raw equals original tool output',sha(await fs.readFile(original))===hash);
  if(r.originalSha256)check(label+' original recorded hash',r.originalSha256===hash);
  records.push({descriptor:file,id:r.id,kind,selected:r.selected!==false,raw,prompt,inputs,original,originalPresent});
 }
}
for(const identity of ['a','b'])for(const family of families)await generation(`actors/${identity}/${family}/generation.json`,'body');
await generation('gear/generation.json','physical-gear');
for(const family of families.filter(f=>f!=='sword'))await generation(`../../vfx/wang-lin-equipment-vfx-v2/${family}/generation.json`,'vfx');
const report={schema:'wang-lin-equipment-lineage-verification-2',date:'2026-10-14',status:'passed',scope:requested??'all-four-families',checkCount:checks.length,checks,records,planned,generationApprovalInferred:false,runtimeIntegrated:false};
if(process.argv.includes('--final')){await fs.mkdir(path.join(root,'review'),{recursive:true});await fs.writeFile(path.join(root,'review',requested?requested+'-lineage-verification.json':'lineage-verification.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({status:report.status,scope:report.scope,checks:checks.length,generatedRecords:records.length,planned:planned.length}));
