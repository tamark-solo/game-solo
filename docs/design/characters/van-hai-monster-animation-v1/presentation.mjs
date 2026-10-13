import {productionSample,productionDuration,productionFrameAge,directionVector,DIRECTION_NAMES} from '../../../../client/src/core/actor-animation-production.ts';
export {productionSample as sample,productionDuration as duration,productionFrameAge as frameAge,directionVector as vector,DIRECTION_NAMES as names};
export const FX_BY_ACTOR={'cloud-wolf':'cloud-bite','wolf-caller':'cloud-bite','talisman-sprout':'wood-ray','jade-scute':'jade-claw','jade-guard':'jade-claw','ink-bat':'ink-dive','cracked-puppet':'puppet-strike','spirit-fungus':'spore-ring','dark-talisman-rogue':'dark-seal','black-silk-adept':'dark-seal','quiet-wisp':'wisp-ray'};
export function attackProfile(slug){
 if(slug==='spirit-fungus')return {warning:'radial',range:48,travel:false};
 if(['talisman-sprout','dark-talisman-rogue','black-silk-adept','quiet-wisp'].includes(slug))return {warning:'line',range:90,travel:true};
 if(slug==='ink-bat')return {warning:'line',range:65,travel:true};
 return {warning:'cone',range:48,travel:false};
}
export function fixtureFacts(clip,age,kind){
 const releaseAt=productionFrameAge(clip,3),hitAt=releaseAt+80,cancelAt=releaseAt-1;
 const cancel=kind==='cancel'&&age>=cancelAt;
 return {origin:'review-fixture',releaseAt,hitAt,cancelAt,cancel,
  warning:!cancel&&age<releaseAt,
  releaseAge:!cancel&&age>=releaseAt?age-releaseAt:null,
  impactAge:!cancel&&kind==='hit'&&age>=hitAt?age-hitAt:null};
}
export function poseAt(clip,elapsed,repeat){
 const total=productionDuration(clip),cycle=repeat&&!clip.loop&&!clip.holdLast?total+250:null;
 return productionSample(clip,cycle?elapsed%cycle:elapsed);
}
export function rootSocket(clip,frame){return frame.sockets?.emit??[clip.pivot[0],clip.pivot[1]-35];}
