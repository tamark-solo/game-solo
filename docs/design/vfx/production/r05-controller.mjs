import {R02VfxController} from './r02-controller.mjs';
import {intentLighting} from './r05-lighting.mjs';
export class R05VfxController extends R02VfxController{
 confirmHit(event){const accepted=super.confirmHit(event);if(accepted)this.cast.confirmedAge=event.confirmedAt-this.cast.startedAt;return accepted;}
 setTargetFoot(foot){if(this.cast)this.cast.targetFoot=[...foot];}
 update(now){const draw=super.update(now),c=this.cast;
  for(const row of draw){if(row.clip==='thunder-bolt')row.layer=2;if(row.clip==='wind-return-curl')row.layer=0;}
  if(c&&now>=c.startedAt){const field=intentLighting(this.skill,{age:now-c.startedAt,targetFoot:c.targetFoot,confirmedAge:c.confirmedAge??null});if(field)draw.push(field);}
  return draw;
 }
}
