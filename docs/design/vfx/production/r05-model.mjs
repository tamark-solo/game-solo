import {samplePresentation as baseSample} from './r02-model.mjs';
import {frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
import {intentLighting} from './r05-lighting.mjs';
export {makePlan,movementPoint,projectilePoint} from './r02-model.mjs';
export function samplePresentation(skill,clips,plan,age){
 const state=baseSample(skill,clips,plan,age),field=intentLighting(skill,{age,targetFoot:plan.targetFoot,confirmedAge:plan.hit?frameSeconds(plan.confirmFrame,24):null});
 if(field)state.items.push(field);return state;
}
