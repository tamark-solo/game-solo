import {makePlan as basePlan,projectilePoint,samplePresentation as baseSample} from './r02-model.mjs';
import {frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
import {intentLighting} from './r05-lighting.mjs';
export {projectilePoint};
export function makePlan(...args){return basePlan(...args);}
export function movementPoint(skill,plan,age){
 if(skill.family!=='wind')return [...plan.foot];
 const start=frameSeconds(skill.preview.moveStartFrame,24),end=frameSeconds(skill.preview.arrivalFrame,24),t=Math.max(0,Math.min(1,(age-start)/(end-start)));
 const eased=1-(1-t)**3;return [plan.foot[0]+skill.preview.travelWorld*eased,plan.foot[1]];
}
// Screen feedback is optional presentation; these values never write actor/combat state.
export function frameFeedback(skill,{age,resolvedAge=null,arrivalAge=null}){
 const spec=skill.presentation.feedback,contact=skill.family==='wind'?arrivalAge:resolvedAge;
 if(!spec||contact===null||age<contact)return null;
 const tick=Math.floor((age-contact)*24+1e-9),factor=spec.cameraTicks[tick]??0;
 if(!factor)return null;
 return {kind:'cameraImpulse',offset:[factor*spec.cameraAmplitudeWorld,-factor*.4*spec.cameraAmplitudeWorld],hitStopMs:spec.hitStopMs,visualOnly:true};
}
export function samplePresentation(skill,clips,plan,age){
 const state=baseSample(skill,clips,plan,age);
 if(skill.family==='wind'){
  const foot=movementPoint(skill,plan,age),dx=foot[0]-state.foot[0];state.foot=foot;state.hand=[state.hand[0]+dx,state.hand[1]];
  for(const row of state.items)if(row.id==='wind-trail')row.point=[...foot];
 }
 const field=intentLighting(skill,{age,targetFoot:plan.targetFoot,confirmedAge:plan.hit?frameSeconds(plan.confirmFrame,24):null});
 if(field)state.items.push(field);
 state.feedback=frameFeedback(skill,{age,resolvedAge:plan.hit?frameSeconds(plan.contactFrame,24):null,arrivalAge:frameSeconds(skill.preview.arrivalFrame??1,24)});
 return state;
}
