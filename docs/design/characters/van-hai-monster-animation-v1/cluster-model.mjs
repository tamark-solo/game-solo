import {productionSample as sample,productionFrameAge as frameAge,productionDuration as duration,productionDirection,directionVector} from '../../../../client/src/core/actor-animation-production.ts';
import {cueGraph,presentationEnd} from '../../vfx/van-hai-monster-vfx-v2/cues.mjs';
const FAMILY={'wolf-caller':['cloud-wolf'],'jade-guard':['jade-scute'],'black-silk-adept':['dark-talisman-rogue']};
const LEADER={'cloud-wolf':'wolf-caller','jade-scute':'jade-guard','dark-talisman-rogue':'black-silk-adept'};
export function makeGroup(options,body,fx){
 const count=Math.min(18,Math.max(3,Math.round(options.count))),kits=Object.fromEntries(fx.actors.map(a=>[a.id,a]));
 let lead=options.actor;if(options.preset==='escort'&&!FAMILY[lead])lead=LEADER[lead]??'jade-guard';
 const mobs=body.actors.filter(a=>a.rank==='mob').map(a=>a.slug),slugs=Array.from({length:count},(_,i)=>options.preset==='same'?options.actor:options.preset==='escort'?i===0?lead:FAMILY[lead][(i-1)%FAMILY[lead].length]:i%6===0?['wolf-caller','jade-guard','black-silk-adept'][Math.floor(i/6)%3]:mobs[(i-1)%mobs.length]);
 // Separate presentation positions; not owner spawn/nav or an exported level.
 const radius=Number(options.spacing),actors=slugs.map((slug,i)=>{
  const angle=-Math.PI*.8+i*Math.PI*1.6/(count-1),foot=[Math.cos(angle)*radius,Math.sin(angle)*radius*.72];
  const direction=options.aim==='converge'?productionDirection(-foot[0],-foot[1]):options.direction;
  const clip=body.clips[slug+'-attack-'+direction],kit=kits[slug],actor=body.actors.find(a=>a.slug===slug);
  return {id:'review-mob-'+i,index:i,slug,foot,direction,clip,kit,actor,releaseAt:frameAge(clip,3),end:presentationEnd(clip,kit,fx)};
 });
 const latestRelease=Math.max(...actors.map(a=>a.releaseAt));
 for(const a of actors)a.start=latestRelease-a.releaseAt+(options.timing==='stagger'?(a.index*173)%850:0);
 const period=Math.max(...actors.map(a=>a.start+a.end))+500;
 return {actors,period,target:[0,-20],playerFoot:[0,0],options:{...options,count,leader:lead}};
}
export function groupAt(group,elapsed,loop,kind,body,fx){
 const time=loop?Math.max(0,elapsed)%group.period:Math.min(group.period,Math.max(0,elapsed));
 const actors=group.actors.map(a=>{
  const age=time-a.start,before=age<0,after=age>=duration(a.clip),idle=body.clips[a.slug+'-idle-'+a.direction],bodyClip=before||after?idle:a.clip;
  const graph=age>=0&&age<a.end?cueGraph(a.clip,age,kind,a.kit,fx):null;
  const cancelled=graph?.facts.cancel,clip=cancelled?idle:bodyClip,pose=sample(clip,clip===idle?Math.max(0,age):age);
  if(graph&&group.options.aim==='converge'){
   const target=group.target.map((p,i)=>p-a.foot[i]),angle=Math.atan2(-a.foot[1],-a.foot[0]);
   for(const node of graph.nodes){
    if(node.phase==='impact')node.point=target;
    if(node.phase==='release'&&graph.profile.travel){const f=Math.min(1,graph.facts.releaseAge/graph.profile.hitDelay);node.point=graph.source.map((p,i)=>p+(target[i]-p)*f);}
    if(node.clip.kind==='directional')node.angle=angle;
   }
   graph.target=target;
  }
  return {...a,age,clip,pose,graph};
 });
 return {time,actors,period:group.period};
}
export function nodeBounds(node,foot){
 const b=node.sample.frame.bounds,a=node.clip.anchor,ca=Math.cos(node.angle),sa=Math.sin(node.angle),points=[];
 for(const x of [b[0]-a[0],b[2]-a[0]])for(const y of [b[1]-a[1],b[3]-a[1]])points.push([foot[0]+node.point[0]+x*ca-y*node.squash*sa,foot[1]+node.point[1]+x*sa+y*node.squash*ca]);
 return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
}
const PLAYER=[-20,-80,20,0];
export function intersects(a,b=PLAYER){return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];}
export function cueOpacity(node,actor,mode){
 if(mode==='full')return node.sample.opacity;
 const secondary=actor.actor.rank==='mob',overPlayer=intersects(nodeBounds(node,actor.foot));
 let multiplier=secondary?(node.phase==='charge'?.75:node.phase==='impact'?.5:.7):1;
 if(node.layer==='above'&&overPlayer)multiplier=Math.min(multiplier,secondary?.3:.55);
 return node.sample.opacity*multiplier;
}
export function drawCommands(state,mode,fxEnabled,warnings){
 const ground=[],depth=[{kind:'player',depth:0,id:'player'}];
 for(const a of state.actors){
  ground.push({kind:'shadow',actor:a,id:a.id+'-shadow'});
  if(warnings&&fxEnabled&&a.graph?.facts.warning)ground.push({kind:'warning',actor:a,id:a.id+'-warning'});
  depth.push({kind:'body',actor:a,depth:a.foot[1],id:a.id+'-body'});
  if(fxEnabled)for(const node of a.graph?.nodes??[]){const command={kind:'fx',actor:a,node,opacity:cueOpacity(node,a,mode),depth:node.phase==='charge'?a.foot[1]+.2:a.foot[1]+node.point[1]+20.2,id:a.id+'-'+node.phase};(node.layer==='ground'?ground:depth).push(command);}
 }
 depth.sort((a,b)=>a.depth-b.depth||a.id.localeCompare(b.id));
 if(mode==='managed'){
  // Aggregate budget: many 30% impacts composited at the same point would
  // still become opaque. Prioritize one elite cue and share a residual budget.
  const crowded=depth.filter(c=>c.kind==='fx'&&c.node.layer==='above'&&intersects(nodeBounds(c.node,c.actor.foot)));
  crowded.sort((a,b)=>(b.actor.actor.rank==='elite'?3:1)*(b.node.phase==='impact'?2:1)*b.opacity-(a.actor.actor.rank==='elite'?3:1)*(a.node.phase==='impact'?2:1)*a.opacity);
  if(crowded.length){const primary=crowded[0],others=crowded.slice(1),weights=others.map(c=>(c.actor.actor.rank==='elite'?2:1)*c.opacity),sum=weights.reduce((a,b)=>a+b,0);primary.opacity=Math.min(primary.opacity,.55);others.forEach((c,i)=>{c.opacity=Math.min(c.opacity,sum>0?.28*weights[i]/sum:0);});}
 }
 return {ground,depth};
}
export function groupBounds(group,body,fx){
 const b=[-32,-100,32,16],add=r=>{b[0]=Math.min(b[0],r[0]);b[1]=Math.min(b[1],r[1]);b[2]=Math.max(b[2],r[2]);b[3]=Math.max(b[3],r[3]);};
 for(const a of group.actors){
  for(const f of a.clip.frames)add([a.foot[0]+f.bounds[0]-a.clip.pivot[0],a.foot[1]+f.bounds[1]-a.clip.pivot[1]-(f.liftPx??0),a.foot[0]+f.bounds[2]-a.clip.pivot[0],a.foot[1]+f.bounds[3]-a.clip.pivot[1]]);
 }
 // Sample the whole deterministic cycle for framing; no fit/body rescale.
 for(let t=0;t<=group.period;t+=24)for(const a of groupAt(group,t,false,'hit',body,fx).actors)for(const n of a.graph?.nodes??[])add(nodeBounds(n,a.foot));
 return b;
}
