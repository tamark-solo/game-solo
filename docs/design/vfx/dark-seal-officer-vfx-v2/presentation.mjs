import {productionDuration,productionSample} from '../../../../client/src/core/actor-animation-production.ts';
import {vector,ms,decoys} from '../../characters/dark-seal-officer-animation-v1/fixture.mjs';
export {decoys};
export function effectSample(clip,age,chargeSpan){
 if(age===null||!Number.isFinite(age)||age<0)return null;
 const duration=productionDuration(clip),time=clip.phase==='charge'?age/chargeSpan*duration:age;
 if(time>=duration)return null;const progress=time/duration;
 return {...productionSample(clip,time),opacity:clip.phase==='charge'?.5+.5*progress:Math.min(1,(1-progress)/.32)};
}
// Pure absolute-age presentation. All hits/cancel/timing remain fixture facts.
export function effectGraph(fx,kit,clip,age,t,facts){
 const graph=[],k=kit.skills[clip.action],links=fx.experience.skills[clip.action];
 if(!t||!links)return graph;
 const v=vector(clip.direction),angle=Math.atan2(v[1],v[0]),releaseSocket=clip.sockets[3],emit=releaseSocket.map((p,i)=>p-clip.pivot[i]);
 const add=(id,time,offset,{rotation=0,span=1,opacity=1,role='effect'}={})=>{
  const c=fx.clips[id],s=c&&effectSample(c,time,span);if(s)graph.push({id:c.id,clip:c,sample:s,offset,rotation,scaleY:1,opacity:s.opacity*opacity,phase:c.phase,ground:c.kind==='ground',rear:c.phase==='charge',safeGapDegrees:c.kind==='ground'?k.safeGapDegrees:0,role});
 };
 if(facts.warning){
  const current=clip.sockets[productionSample(clip,age).index],offset=clip.action==='an_hoi'?[0,0]:current.map((p,i)=>p-clip.pivot[i]);
  add(links.charge,age,offset,{rotation:clip.action==='an_hoi'?angle:0,span:t.release,role:'anticipation'});
 }
 if(facts.releaseAge!==null){
  if(clip.action==='an_hoi')add(links.release,facts.releaseAge,[0,0],{rotation:angle,role:'ritual'});
  else{
   // End point belongs to the initially locked target, never future miss motion.
   const endpoint=t.playerAt(0).map((p,i)=>p-(i===1?28:0)),travel=ms(k.travelTicks),p=Math.min(1,Math.max(0,facts.releaseAge/travel));
   const offset=emit.map((x,i)=>x+(endpoint[i]-x)*p),rotation=Math.atan2(endpoint[1]-emit[1],endpoint[0]-emit[0]);
   add(links.release,facts.releaseAge,offset,{rotation,role:'projectile'});
  }
 }
 if(facts.contactAge!==null)add(fx.experience.impact,facts.contactAge,t.playerAt(t.resolve).map((p,i)=>p-(i===1?28:0)),{role:'confirmed-contact'});
 if(clip.action==='phan_phu'&&!facts.cancelled){
  const normal=[-v[1],v[0]];for(const [i,side]of[-1,1].entries()){
   if(age>=t.lock&&age<t.release){
    // Intact first paper-gate pose frames the faint decoy during anticipation.
    // It has a held age and bounded lifetime, never an extra cast or hit.
    const offset=normal.map((n,j)=>n*side*k.decoys.lateral-(j===1?35+2*Math.sin((age-t.lock)/180+i*Math.PI):0));
    add(fx.experience.phantom,0,offset,{opacity:.32*Math.min(1,(age-t.lock)/180),role:'illusion-gate'});
    graph[graph.length-1].rear=true;
   }
   add(fx.experience.phantom,age-(t.resolve+65+i*80),normal.map((n,j)=>n*side*k.decoys.lateral-(j===1?35:0)),{opacity:.72,role:'decoy-dissolve'});
  }
 }
 return graph;
}
