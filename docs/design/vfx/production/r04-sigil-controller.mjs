import {R02VfxController} from './r02-controller.mjs';
import {spiritPresentation} from './spirit-sigil-model.mjs';
/** Presentation extension only: spirit poses and woven lightning never create gameplay hits or actors. */
export class R04VfxController extends R02VfxController{
 confirmHit(event){const accepted=super.confirmHit(event);if(accepted&&this.skill.family==='thunder')this.spawn('thunder-weave',event.confirmedAt,event.worldPosition);return accepted;}
 confirmArrival(event){const accepted=super.confirmArrival(event);if(accepted)this.cast.arrivalAge=event.arrivedAt-this.cast.startedAt;return accepted;}
 update(now){
  const draw=super.update(now),c=this.cast;
  for(const row of draw)if(row.clip==='thunder-bolt'||row.clip==='thunder-weave')row.layer=2;
  if(c&&now>=c.startedAt){const spirit=spiritPresentation(this.skill,this.clips,{age:now-c.startedAt,foot:c.foot,arrivedAt:c.arrivalAge??null});if(spirit)draw.push({...spirit,clip:spirit.id});}
  return draw;
 }
}
