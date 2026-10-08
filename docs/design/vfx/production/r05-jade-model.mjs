import {makePlan,movementPoint,projectilePoint,frameFeedback,samplePresentation as baseSample} from './r05-force-model.mjs';
import {SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
export {makePlan,movementPoint,projectilePoint,frameFeedback};
export function samplePresentation(skill,clips,plan,age){
 const state=baseSample(skill,clips,plan,age);
 // Preview confirmations, including delayed sword hits, own optional visual feedback.
 const contact=skill.family==='sword'?plan.confirmFrame:plan.contactFrame;
 state.feedback=frameFeedback(skill,{age,resolvedAge:plan.hit?frameSeconds(contact,24):null,arrivalAge:frameSeconds(skill.preview.arrivalFrame??1,24)});
 if(skill.family!=='wind')return state;
 const spec=skill.presentation.ghosts,arrival=frameSeconds(skill.preview.arrivalFrame,24),tail=spec.endAfterArrivalTicks/24;
 if(age+1e-9>=arrival+tail)return state;
 const fade=age<arrival?1:Math.max(0,1-(age-arrival)/tail);
 for(const [i,lag]of spec.sampleLagFrames.entries()){
  const past=age-lag/24;if(past<frameSeconds(skill.preview.moveStartFrame,24))continue;
  const point=movementPoint(skill,plan,past);if(Math.hypot(point[0]-state.foot[0],point[1]-state.foot[1])<4)continue;
  const sample=new SequencePlayer(clips[skill.character.clip]).sample(past);if(!sample)continue;
  state.items.push({id:skill.character.clip,kind:'bodyEcho',sample,point,angle:0,layer:.75,opacity:spec.opacity[i]*fade});
 }
 return state;
}
