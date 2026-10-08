import {samplePresentation as baseSample} from './r02-model.mjs';
import {frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
import {spiritPresentation} from './spirit-sigil-model.mjs';
export {makePlan,movementPoint,projectilePoint} from './r02-model.mjs';
export function samplePresentation(skill,clips,plan,age){
 const state=baseSample(skill,clips,plan,age),arrival=frameSeconds(skill.preview.arrivalFrame??1,24);
 const spirit=spiritPresentation(skill,clips,{age,foot:state.foot,arrivedAt:skill.family==='wind'&&age>=arrival?arrival:null});
 if(spirit)state.items.push(spirit);
 return state;
}
