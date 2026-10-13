import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sharp} from './actor-sprite-tools.mjs';
const root='docs/design/characters/cloud-wolf-king-animation-v1',plan=JSON.parse(await fs.readFile(root+'/production-plan.json'));
if(await fs.access(root+'/approval.json').then(()=>true,()=>false))throw Error('Approved Lang Vuong pack is frozen. Produce a new version.');
const actor=process.argv.find(a=>a.startsWith('--actor='))?.slice(8);
const sha=b=>createHash('sha256').update(b).digest('hex');
// Label ALL opaque components so attached details and small disconnected body
// parts can be assigned to their measured pose. Never slice a uniform grid.
function labelParts(data,w,h){const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let id=0;for(let p=0;p<labels.length;p++)if(!labels[p]&&data[p*4+3]>=210){id++;let head=0,tail=0,l=w,t=h,r=-1,b=-1;labels[p]=id;queue[tail++]=p;while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);for(const j of[i-1,i+1,i-w,i+w])if(j>=0&&j<labels.length&&Math.abs(j%w-x)<=1&&!labels[j]&&data[j*4+3]>=210){labels[j]=id;queue[tail++]=j;}}parts.push({id,left:l,top:t,width:r-l+1,height:b-t+1,area:tail});}return{labels,parts};}
function rectDistance(a,b){const dx=Math.max(0,a.left-(b.left+b.width),b.left-(a.left+a.width)),dy=Math.max(0,a.top-(b.top+b.height),b.top-(a.top+a.height));return dx*dx+dy*dy;}
const problems=[];
for(const job of plan.jobs.filter(j=>!actor||j.id===actor)){
 const count=job.rows*6;
 if(!await fs.access(root+'/generation/'+job.id+'.json').then(()=>true,()=>false))continue;
 try{
 let bytes;try{bytes=await fs.readFile(root+'/'+job.source);}catch{continue;}
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{labels,parts}=labelParts(data,info.width,info.height);
 let major=parts.filter(p=>p.area>=250),grouping=count+' connected bodies',spatial=false;
 if(major.length!==count){
  // Spatial seeds select a core per requested pose; all extra components are
  // kept and assigned by distance. This permits a spirit's disconnected parts.
  const slots=new Map();for(const p of major){const col=Math.min(5,Math.max(0,Math.floor((p.left+p.width/2)/info.width*6))),row=Math.min(job.rows-1,Math.max(0,Math.floor((p.top+p.height/2)/info.height*job.rows))),key=row*6+col;if(!slots.has(key)||slots.get(key).area<p.area)slots.set(key,p);}
  if(slots.size!==count)throw Error(job.id+': expected '+count+' measurable poses; found '+major.length+' major components / '+slots.size+' spatial seeds');
  major=[...slots.entries()].sort((a,b)=>a[0]-b[0]).map(([,v])=>v);spatial=true;grouping=count+' spatial slots by opaque component centroid, every subsidiary part retained';
 }
 else{major.sort((a,b)=>a.top+a.height/2-b.top-b.height/2);major=Array.from({length:job.rows},(_,r)=>major.slice(r*6,r*6+6).sort((a,b)=>a.left-b.left)).flat();}
 const owners=new Map(major.map((p,i)=>[p.id,i]));for(const p of parts.filter(p=>!owners.has(p.id))){let best=0,d=Infinity;for(let i=0;i<major.length;i++){const n=rectDistance(p,major[i]);if(n<d){d=n;best=i;}}owners.set(p.id,best);}
 if(spatial)for(const p of parts){const col=Math.min(5,Math.max(0,Math.floor((p.left+p.width/2)/info.width*6))),row=Math.min(job.rows-1,Math.max(0,Math.floor((p.top+p.height/2)/info.height*job.rows)));owners.set(p.id,row*6+col);}
 const frames=[];await fs.mkdir(root+'/cutouts/'+job.id,{recursive:true});
 for(let index=0;index<count;index++){
  const members=parts.filter(p=>owners.get(p.id)===index),l=Math.min(...members.map(p=>p.left)),t=Math.min(...members.map(p=>p.top)),r=Math.max(...members.map(p=>p.left+p.width)),b=Math.max(...members.map(p=>p.top+p.height)),w=r-l,h=b-t,cut=Buffer.alloc(w*h*4);
  let foreign=0;for(let y=t;y<b;y++)for(let x=l;x<r;x++){const k=y*info.width+x,out=((y-t)*w+x-l)*4;if(owners.get(labels[k])===index){cut.set(data.subarray(k*4,k*4+3),out);cut[out+3]=255;}else if(data[k*4+3]>=210)foreign++;}
  const file=`cutouts/${job.id}/${String(index+1).padStart(2,'0')}.png`,png=await sharp(cut,{raw:{width:w,height:h,channels:4}}).png().toBuffer();await fs.writeFile(root+'/'+file,png);
  frames.push({row:Math.floor(index/6),col:index%6,file,sha256:sha(png),sourceRect:{left:l,top:t,width:w,height:h},componentIds:members.map(p=>p.id),foreignPixelsRemoved:foreign,sourceAlphaPolicy:'Opaque body components >=210, original source untouched; no RGB repaint'});
 }
 await fs.writeFile(root+'/generation/'+job.id+'.analysis.json',JSON.stringify({id:job.id,direction:job.direction,actor:job.actor,source:job.source,sourceSha256:sha(bytes),sourceSize:[info.width,info.height],grouping,opaqueComponentCount:parts.length,allOpaqueComponentsAssigned:true,frames},null,2)+'\n');
 console.log(job.id+': '+count+' measured cutouts, '+grouping);
 }catch(error){problems.push({id:job.id,error:String(error),status:'source-needs-repair'});console.error(job.id+': '+String(error));}
}
await fs.writeFile(root+'/source-problems.json',JSON.stringify({date:'2026-10-13',problems,artApproved:false},null,2)+'\n');
if(problems.length)process.exitCode=1;
