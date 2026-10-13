import {productionDuration,productionSample} from '../../../../client/src/core/actor-animation-production.ts';
import {vector,ms,decoys} from './fixture.mjs';
export function effectSample(clip,age,chargeSpan){if(age===null||age<0||!Number.isFinite(age))return null;const duration=productionDuration(clip),time=clip.phase==='charge'?age/chargeSpan*duration:age;if(time>=duration)return null;const progress=time/duration;return {...productionSample(clip,time),opacity:clip.phase==='charge'?.65+.3*progress:Math.min(1,(1-progress)/.4)};}
// All cues are evaluated from absolute fixture fact ages; no per-frame spawn loop.
export function effectGraph(fx,kit,clip,age,t,facts){const graph=[],v=vector(clip.direction),angle=Math.atan2(v[1],v[0]),k=kit.skills[clip.action];
 const socket=clip.sockets?.[3]||[clip.pivot[0]+v[0]*18,clip.pivot[1]-36+v[1]*10],emit=[socket[0]-clip.pivot[0],socket[1]-clip.pivot[1]];
 const add=(phase,time,offset,rotation=0,span=1)=>{const c=fx.clips['officer-'+phase+'-'+phase],s=c&&effectSample(c,time,span);if(s)graph.push({id:c.id,clip:c,sample:s,offset,rotation,scaleY:c.projectionY||1,opacity:s.opacity,phase,ground:c.kind==='ground'});};
 if(t){
  if(facts.warning){const index=productionSample(clip,age).index,current=clip.sockets?.[index]||socket;add('charge',age,current.map((p,i)=>p-clip.pivot[i]),0,t.release);}
  if(clip.action==='an_hoi')add('return',facts.releaseAge,[0,0],angle);
  else if(facts.releaseAge!==null){const distance=k.travelTicks?Math.min(k.range,facts.releaseAge/ms(k.travelTicks)*130):22;add('release',facts.releaseAge,emit.map((p,i)=>p+v[i]*distance),angle);}
  add('impact',facts.contactAge,t.playerAt(t.resolve).map((p,i)=>p-(i===1?28:0)));
  if(clip.action==='phan_phu'&&!facts.cancelled){const normal=[-v[1],v[0]];for(const side of [-1,1])add('phantom',age-(t.resolve+80),normal.map((n,i)=>n*side*k.decoys.lateral-(i===1?35:0)));}
 }else if(clip.action==='appear')add('arrival',age-ms(24),[0,0]);
 return graph;
}
export {decoys};
