import {productionDuration,productionSample,type ProductionClip} from './actor-animation-production';
/** Presentation only: both speed modes consume the same traveled distance and run clip. */
export function pixelLocomotionSample(clip:ProductionClip,distance:number,stride=64){
 if(!Number.isFinite(distance)||distance<0||!Number.isFinite(stride)||stride<=0)throw Error('Invalid locomotion distance/stride');
 return productionSample(clip,(distance%stride)/stride*productionDuration(clip));
}
