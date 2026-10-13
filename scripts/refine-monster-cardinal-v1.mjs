import fs from 'node:fs';
import path from 'node:path';
const root='docs/design/characters/van-hai-monster-animation-v1';
const p=JSON.parse(fs.readFileSync(root+'/production-plan.json','utf8'));
for(const j of p.jobs){
 let t=fs.readFileSync(root+'/'+j.prompt,'utf8');
 const extra=j.direction==='north'?'STRICT REAR CAMERA LOCK: ALL 36 cells show only rear skull/ears/back. No eyes, no face, no muzzle and no frontal chest sign may appear in ANY frame. Attack moves screen-UP away from viewer; do not twist sideways to expose the mouth. ':j.direction==='east'?'STRICT RIGHT-PROFILE CAMERA LOCK: ALL 36 cells are a real screen-right side view, ONE near eye only, far eye completely hidden, front and rear limbs overlap the far side naturally. Do not reuse the front three-quarter reference orientation. ':'';
 if(extra&&!t.startsWith(extra))fs.writeFileSync(root+'/'+j.prompt,extra+t);
}
for(const direction of ['north','east']){
 const j=p.jobs.find(j=>j.id==='cloud-wolf-'+direction);
 fs.mkdirSync(root+'/sources/rejected',{recursive:true});fs.mkdirSync(root+'/generation/rejected',{recursive:true});
 for(const [from,to]of [[root+'/'+j.source,root+'/sources/rejected/'+j.id+'-v1.png'],[root+'/generation/'+j.id+'.json',root+'/generation/rejected/'+j.id+'-v1.json']]){
  if(fs.existsSync(from)&&!fs.existsSync(to))fs.renameSync(from,to);
 }
 if(direction==='east')j.references.push(root+'/sources/cloud-wolf-west.png');
 const reason=direction==='east'?'Original body leans toward southeast rather than a true right profile.':'Several attack poses turn sideward and expose muzzle; require rear camera through action.';
 fs.writeFileSync(root+'/generation/rejected/'+j.id+'-reason.json',JSON.stringify({id:j.id,reason,artApproved:false},null,2)+'\n');
}
fs.writeFileSync(root+'/production-plan.json',JSON.stringify(p,null,2)+'\n');
console.log('Cardinal view constraints tightened; two rejected sources preserved and pending replacement.');
