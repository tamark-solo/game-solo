import {SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
export const PROFILES={pvp:{name:'PvP',width:64,height:96,hit:[-6,-42],sprite:true},monster:{name:'Quái · vùng chạm',width:56,height:64,hit:[-8,-30]},boss:{name:'Boss · vùng chạm',width:112,height:144,hit:[-18,-82]}};
export function makePlan(skill,{distance=260,delay=0,hit=true,target='pvp'}={}){
 const foot=[360,386],targetFoot=[360+distance,386],profile=PROFILES[target]||PROFILES.pvp;
 const confirmFrame=skill.preview.confirmFrame+delay,contactFrame=confirmFrame+(skill.presentation.strikeLeadFrames||0);
 return {foot,targetFoot,profile,hitPoint:targetFoot.map((v,i)=>v+profile.hit[i]),confirmFrame,contactFrame,hit,target,endFrame:Math.max(skill.preview.endFrame,contactFrame+12),fps:skill.fps};
}
export function movementPoint(skill,plan,age){
 if(skill.family!=='wind')return plan.foot;
 const from=frameSeconds(skill.preview.moveStartFrame,skill.fps),to=frameSeconds(skill.preview.arrivalFrame,skill.fps),t=Math.max(0,Math.min(1,(age-from)/(to-from)));
 return [plan.foot[0]+skill.preview.travelWorld*t,plan.foot[1]];
}
// Pure sprite presentation: this function never determines damage, collision, or valid movement.
export function samplePresentation(skill,clips,plan,age){
 const players=Object.fromEntries(Object.entries(clips).map(([id,clip])=>[id,new SequencePlayer(clip)]));
 const character=players[skill.character.clip].sample(age)||{index:11,clip:clips[skill.character.clip],frame:clips[skill.character.clip].frames[11]};
 const foot=movementPoint(skill,plan,age),socket=skill.sockets[character.index],hand=foot.map((v,i)=>v+socket[i]),items=[];
 for(const track of skill.tracks){
  let start=track.startFrame,stop=track.stopBeforeFrame;
  if(track.trigger==='combat.hitConfirmed'){if(!plan.hit)continue;start=plan.confirmFrame;}
  if(track.trigger==='visual.contact'){if(!plan.hit)continue;start=plan.contactFrame;}
  if(track.trigger==='movement.arrived')start=skill.preview.arrivalFrame;
  if(start===undefined)continue;
  const t=age-frameSeconds(start,skill.fps);if(t<0||stop&&age>=frameSeconds(stop,skill.fps))continue;
  let sample=players[track.clip].sample(t);
  if(!sample&&track.holdLastUntilResolve&&age<frameSeconds(plan.confirmFrame,skill.fps)){const c=clips[track.clip];sample={index:c.frames.length-1,frame:c.frames.at(-1),clip:c};}
  if(!sample)continue;
  const point=track.anchor==='hand'?hand:track.anchor==='target.ground'?plan.targetFoot:track.anchor==='hit'?plan.hitPoint:track.anchor==='departure'?plan.foot:track.anchor==='arrival'?[plan.foot[0]+skill.preview.travelWorld,plan.foot[1]]:foot;
  items.push({id:track.clip,sample,point,layer:track.layer});
 }
 return {foot,hand,character,items};
}
