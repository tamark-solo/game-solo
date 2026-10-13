import {profile,fixtureFacts,effectSample,presentationEnd,reviewAge} from './presentation.mjs';
import {productionSample,directionVector} from '../../../../client/src/core/actor-animation-production.ts';
export {profile,fixtureFacts,effectSample,presentationEnd,reviewAge};
export function cueGraph(body,age,kind,kit,fx){
 const p=profile(kit.id,kit.rank),facts=fixtureFacts(body,age,kind,p),v=directionVector(body.direction),angle=Math.atan2(v[1],v[0]);
 const pose=productionSample(body,age).frame,launch=body.frames[3],socket=launch.sockets.emit,chargeSocket=pose.sockets.emit;
 const project=(s,lift)=>[s[0]-body.pivot[0],s[1]-body.pivot[1]-lift];
 const source=p.groundRelease?[v[0]*20,v[1]*20]:project(socket,launch.liftPx??0);
 const target=[v[0]*p.range,v[1]*p.range-20],travel=p.travel&&facts.releaseAge!==null?Math.min(1,facts.releaseAge/p.hitDelay):0;
 const releasePoint=source.map((x,i)=>x+(target[i]-x)*travel);
 const chargePoint=p.groundCharge?[0,0]:project(chargeSocket,pose.liftPx??0);
 const nodes=[];
 function add(phase,age,point,layer,squash=1){const c=fx.clips[kit[phase]],s=effectSample(c,age,facts.releaseAt-facts.chargeAt);if(s)nodes.push({phase,clip:c,sample:s,point,layer,squash,angle:c.kind==='directional'?angle:0});}
 add('charge',facts.chargeAge,chargePoint,p.groundCharge?'ground':'above',p.groundCharge?.6:1);
 add('release',facts.releaseAge,releasePoint,p.groundRelease?'ground':'above',p.groundRelease?.75:1);
 add('impact',facts.impactAge,target,'above');
 return {profile:p,facts,nodes,target,source};
}
// Bounds include all poses in each effect, not only the current frame. Review
// framing stays stable through action and never changes body/world scale.
export function reviewBounds(body,kit,fx){
 const p=profile(kit.id,kit.rank),v=directionVector(body.direction),bounds=[Infinity,Infinity,-Infinity,-Infinity];
 const add=(x,y)=>{bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y);};
 for(const f of body.frames){const b=f.bounds,l=f.liftPx??0;add(b[0]-body.pivot[0],b[1]-body.pivot[1]-l);add(b[2]-body.pivot[0],b[3]-body.pivot[1]-l);}
 for(const phase of ['charge','release','impact']){
  const c=fx.clips[kit[phase]],ground=phase==='charge'?p.groundCharge:phase==='release'&&p.groundRelease,angle=c.kind==='directional'?Math.atan2(v[1],v[0]):0,squash=ground?(phase==='charge'?.6:.75):1;
  const points=phase==='impact'?[[v[0]*p.range,v[1]*p.range-20]]:phase==='charge'?body.frames.map(f=>ground?[0,0]:[f.sockets.emit[0]-body.pivot[0],f.sockets.emit[1]-body.pivot[1]-(f.liftPx??0)]):p.travel?[[body.frames[3].sockets.emit[0]-body.pivot[0],body.frames[3].sockets.emit[1]-body.pivot[1]],[v[0]*p.range,v[1]*p.range-20]]:[ground?[v[0]*20,v[1]*20]:[body.frames[3].sockets.emit[0]-body.pivot[0],body.frames[3].sockets.emit[1]-body.pivot[1]]];
  for(const f of c.frames)for(const point of points)for(const x of [f.bounds[0]-c.anchor[0],f.bounds[2]-c.anchor[0]])for(const y of [f.bounds[1]-c.anchor[1],f.bounds[3]-c.anchor[1]])add(point[0]+x*Math.cos(angle)-y*squash*Math.sin(angle),point[1]+x*Math.sin(angle)+y*squash*Math.cos(angle));
 }
 return bounds;
}
