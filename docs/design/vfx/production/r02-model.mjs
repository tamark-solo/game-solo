import {SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
import {PROFILES} from './p2-model.mjs';
export function makePlan(skill,clips,{distance=260,delay=0,hit=true,target='pvp'}={}){
 const foot=[360,386],targetFoot=[360+distance,386],profile=PROFILES[target]||PROFILES.pvp,hitPoint=targetFoot.map((v,i)=>v+profile.hit[i]);
 const releaseFrame=skill.events.find(e=>e.type==='release'||e.type==='movement.request').frame;
 let confirmFrame=skill.preview.confirmFrame+delay,contactFrame=confirmFrame+(skill.presentation.strikeLeadFrames||0),projectile;
 if(skill.family==='sword'){
  const pose=new SequencePlayer(clips[skill.character.clip]).sample(frameSeconds(releaseFrame,24)),socket=foot.map((v,i)=>v+skill.sockets[pose.index][i]),length=Math.hypot(hitPoint[0]-socket[0],hitPoint[1]-socket[1]);
  const direction=hitPoint.map((v,i)=>(v-socket[i])/length),data=skill.projectile;
  contactFrame=releaseFrame+Math.ceil(Math.max(0,length-data.initialTipAhead)/(data.worldSpeed/24));confirmFrame=contactFrame+delay;
  projectile={socket,direction,angle:Math.atan2(direction[1],direction[0]),expireFrame:releaseFrame+Math.ceil(data.maxTravelWorld/(data.worldSpeed/24)),...data};
 }
 const endFrame=Math.max(skill.preview.endFrame,(projectile&&!hit?projectile.expireFrame+4:confirmFrame+14));
 const events=[...skill.events];if(skill.family==='sword'){events.push(hit?{frame:contactFrame,type:'preview.projectile.contact'}:{frame:projectile.expireFrame,type:'preview.projectile.expired'});}if(hit&&skill.family!=='wind')events.push({frame:confirmFrame,type:'preview.hostHitConfirmed'});if(skill.family==='wind')events.push({frame:skill.preview.arrivalFrame,type:'preview.hostMovementArrived'});
 return {foot,targetFoot,profile,hitPoint,releaseFrame,confirmFrame,contactFrame,projectile,endFrame,hit,target,events:events.sort((a,b)=>a.frame-b.frame)};
}
export function movementPoint(skill,plan,age){if(skill.family!=='wind')return plan.foot;const start=frameSeconds(skill.preview.moveStartFrame,24),end=frameSeconds(skill.preview.arrivalFrame,24),t=Math.max(0,Math.min(1,(age-start)/(end-start)));return[plan.foot[0]+skill.preview.travelWorld*t,plan.foot[1]];}
export function projectilePoint(plan,age){const p=plan.projectile,travel=p.initialTipAhead+Math.max(0,age-frameSeconds(plan.releaseFrame,24))*p.worldSpeed;return p.socket.map((v,i)=>v+p.direction[i]*travel);}
// Only this isolated preview synthesizes movement/contact. Host must provide those during integration.
export function samplePresentation(skill,clips,plan,age){
 const players=Object.fromEntries(Object.entries(clips).map(([id,c])=>[id,new SequencePlayer(c)])),pc=clips[skill.character.clip];
 const character=players[skill.character.clip].sample(age)||{index:pc.frames.length-1,frame:pc.frames.at(-1),clip:pc};
 const foot=movementPoint(skill,plan,age),hand=foot.map((v,i)=>v+skill.sockets[character.index][i]),items=[];
 for(const track of skill.tracks){
  let start=track.startFrame,stop=track.stopBeforeFrame;
  if(track.trigger==='release'){start=plan.releaseFrame;stop=plan.hit?plan.contactFrame:plan.projectile.expireFrame;}
  if(track.trigger==='combat.hitConfirmed'){if(!plan.hit)continue;start=plan.confirmFrame;}
  if(track.trigger==='visual.contact'){if(!plan.hit)continue;start=plan.contactFrame;}
  if(track.trigger==='movement.arrived')start=skill.preview.arrivalFrame;
  if(start===undefined||age<frameSeconds(start,24)||stop&&age>=frameSeconds(stop,24))continue;
  let sample=players[track.clip].sample(age-frameSeconds(start,24));
  if(!sample&&track.holdLastUntilResolve&&age<frameSeconds(plan.confirmFrame,24)){const c=clips[track.clip];sample={index:c.frames.length-1,frame:c.frames.at(-1),clip:c};}
  if(!sample)continue;
  const point=track.anchor==='hand'?hand:track.anchor==='formation'?foot.map((v,i)=>v+skill.formationOffset[i]):track.anchor==='target.ground'?plan.targetFoot:track.anchor==='hit'?plan.hitPoint:track.anchor==='projectile'?projectilePoint(plan,age):track.anchor==='departure'?plan.foot:track.anchor==='arrival'?[plan.foot[0]+skill.preview.travelWorld,plan.foot[1]]:foot;
  items.push({id:track.clip,sample,point,layer:track.layer,angle:track.anchor==='projectile'||track.anchor==='hit'&&skill.family==='sword'?plan.projectile.angle:0});
 }
 if(skill.family==='sword'&&!plan.hit){const expire=frameSeconds(plan.projectile.expireFrame,24),tail={...clips['qi-impact'],frames:clips['qi-impact'].frames.slice(-4),durations:[1,1,1,1]},sample=new SequencePlayer(tail).sample(age-expire);if(sample)items.push({id:'qi-impact',sample,point:projectilePoint(plan,expire),layer:2,angle:plan.projectile.angle});}
 return {foot,hand,character,items};
}
