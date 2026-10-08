import {R05ForceVfxController} from './r05-force-controller.mjs';
import {SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
export class R05JadeVfxController extends R05ForceVfxController{
 beginCast(event){super.beginCast(event);this.cast.poseHistory=[{at:event.startedAt,foot:[...event.foot]}];}
 // Timestamped real movement snapshots only. Untimed legacy calls update the actor without inventing echoes.
 setActorFoot(foot,{sampledAt}={}){
  super.setActorFoot(foot);const c=this.cast;if(!c||this.skill.family!=='wind'||!Number.isFinite(sampledAt)||sampledAt<c.poseHistory.at(-1).at)return;
  c.poseHistory.push({at:sampledAt,foot:[...foot]});while(c.poseHistory.length>this.skill.presentation.ghosts.historyCapacity)c.poseHistory.shift();
 }
 update(now){
  const draw=super.update(now),c=this.cast;if(!c||this.skill.family!=='wind')return draw;
  const spec=this.skill.presentation.ghosts,age=now-c.startedAt,tail=spec.endAfterArrivalTicks/24,arrived=c.arrivalAge;
  if(age<frameSeconds(this.skill.preview.moveStartFrame,24)||arrived!==undefined&&age+1e-9>=arrived+tail)return draw;
  const fade=arrived===undefined?1:Math.max(0,1-(age-arrived)/tail);
  for(const [i,lag]of spec.sampleLagFrames.entries()){
   const past=now-lag/24;if(past<c.startedAt+frameSeconds(this.skill.preview.moveStartFrame,24))continue;
   const history=[...c.poseHistory].reverse().find(h=>h.at<=past&&h.at>=c.startedAt+frameSeconds(this.skill.preview.moveStartFrame,24));if(!history||Math.hypot(history.foot[0]-c.foot[0],history.foot[1]-c.foot[1])<4)continue;
   const sample=new SequencePlayer(this.clips[this.skill.character.clip]).sample(past-c.startedAt);if(sample)draw.push({clip:this.skill.character.clip,kind:'bodyEcho',sample,point:[...history.foot],angle:0,layer:.75,opacity:spec.opacity[i]*fade});
  }
  return draw;
 }
}
