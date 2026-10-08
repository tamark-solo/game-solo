import {R05VfxController} from './r05-controller.mjs';
import {frameFeedback} from './r05-force-model.mjs';
export class R05ForceVfxController extends R05VfxController{
 constructor(skill,clips,options={}){super(skill,clips,options);this.onFeedback=options.onFeedback??(()=>{});}
 confirmHit(event){const accepted=super.confirmHit(event);if(accepted){this.cast.feedbackAge=event.confirmedAt-this.cast.startedAt;this.onFeedback({type:'visual.contactImpulse',castId:event.castId,at:event.confirmedAt,hitStopMs:this.skill.presentation.feedback.hitStopMs,visualOnly:true});}return accepted;}
 confirmArrival(event){const accepted=super.confirmArrival(event);if(accepted){this.cast.arrivalAge=event.arrivedAt-this.cast.startedAt;this.onFeedback({type:'visual.arrivalImpulse',castId:event.castId,at:event.arrivedAt,hitStopMs:this.skill.presentation.feedback.hitStopMs,visualOnly:true});}return accepted;}
 feedback(now){const c=this.cast;return c?frameFeedback(this.skill,{age:now-c.startedAt,resolvedAge:c.feedbackAge??null,arrivalAge:c.arrivalAge??null}):null;}
}
