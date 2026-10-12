import {actorDirection,BASIC_RULES,type ActorActionFact,type ActorDirection,type BasicStrike} from '@shared/actor-actions';
import {cultivationMotion,type QuestMotionEvent} from '@shared/quest-motion';
import type {SectView} from '@shared/sect';
interface Track{x:number;y:number;distance:number;direction:ActorDirection;idleAt:number;deathAt?:number;hp?:number;hitAt?:number}
export interface PixelActorInput{id:string;x:number;y:number;moving:boolean;direction:ActorDirection;connected?:boolean;hp?:number;castId?:string;castSkill?:string;castStartedAt?:number;castAimX?:number;castAimY?:number;facingX?:number;facingY?:number}
export class PixelPlayerModel{
 private tracks=new Map<string,Track>();private shots=new Map<string,ActorActionFact>();private loops=new Map<string,QuestMotionEvent>();private legacy=new Map<string,QuestMotionEvent>();private loopAt=new Map<string,number>();
 event(e:ActorActionFact){if(e.type==='start'||e.type==='gather'){if((this.shots.get(e.actorId)?.at??-Infinity)<=e.at)this.shots.set(e.actorId,e);}else if(e.type==='cancel'&&this.shots.get(e.actorId)?.strikeId===e.strikeId)this.shots.delete(e.actorId);}
 quest(e:QuestMotionEvent){if(e.kind==='cultivation'||e.kind==='idle'){if((this.loopAt.get(e.actorId)??-Infinity)>e.at)return;this.loopAt.set(e.actorId,e.at);if(e.kind==='idle')this.loops.delete(e.actorId);else this.loops.set(e.actorId,e);}else if(e.kind==='basic')this.legacy.set(e.actorId,e);}
 sample(a:PixelActorInput,now:number,sect?:SectView,basic?:BasicStrike){let t=this.tracks.get(a.id);if(!t){t={x:a.x,y:a.y,distance:0,direction:a.direction,idleAt:now};this.tracks.set(a.id,t);}
  const dx=a.x-t.x,dy=a.y-t.y,d=Math.hypot(dx,dy);if(d<64){t.distance+=d;if(a.moving&&d>.01)t.direction=actorDirection(dx,dy,t.direction);}t.x=a.x;t.y=a.y;
  if(!a.moving&&a.facingX!==undefined&&a.facingY!==undefined)t.direction=actorDirection(a.facingX,a.facingY,t.direction);
  if(a.hp!==undefined&&t.hp!==undefined&&a.hp<t.hp&&a.hp>0)t.hitAt=now;if(a.hp!==undefined)t.hp=a.hp;
  let action=a.moving?'run':'idle',age=now-t.idleAt;const shot=this.shots.get(a.id),old=this.legacy.get(a.id),gatherMoved=shot?.action==='gather'&&a.moving&&Math.hypot(a.x-shot.x,a.y-shot.y)>8;
  if(a.hp!==undefined&&a.hp<=0){t.deathAt??=now;action='death';age=now-t.deathAt;}
  else if(a.castId){action=({sword:'cast_forward',thunder:'cast_point',wind:'dash'} as Record<string,string>)[a.castSkill??'']??'idle';age=now-(a.castStartedAt??now);t.direction=actorDirection(a.castAimX??0,a.castAimY??0,t.direction);}
  else if(basic&&now>=basic.startedAt&&now<basic.endAt){action=basic.action;age=now-basic.startedAt;t.direction=actorDirection(basic.dx,basic.dy,t.direction);}
  else if(shot&&now>=shot.at&&now-shot.at<(shot.action==='gather'?1000:BASIC_RULES.timing[shot.action].end)&&!gatherMoved){
   action=shot.action;age=now-shot.at;t.direction=actorDirection(shot.dx,shot.dy,t.direction);
  }else if(old&&now>=old.at&&now-old.at<400){action='attack';age=now-old.at;t.direction=old.direction;}
  else if(t.hitAt!==undefined&&now-t.hitAt<200){action='hit';age=now-t.hitAt;}
  else if(!a.moving&&a.connected!==false&&(sect?cultivationMotion(sect,a.moving):this.loops.has(a.id))){action='meditate';age=now-(this.loops.get(a.id)?.at??t.idleAt);t.direction=this.loops.get(a.id)?.direction??'south';}
  if(a.hp!==undefined&&a.hp>0)t.deathAt=undefined;if(shot&&(now-shot.at>1600||gatherMoved))this.shots.delete(a.id);if(old&&now-old.at>=400)this.legacy.delete(a.id);
  return {action,direction:t.direction,age:Math.max(0,age),distance:t.distance};
 }
 prune(ids:Set<string>){for(const map of [this.tracks,this.shots,this.loops,this.loopAt,this.legacy])for(const id of map.keys())if(!ids.has(id))map.delete(id);}
 reset(){this.tracks.clear();this.shots.clear();this.loops.clear();this.loopAt.clear();this.legacy.clear();}
}
