import {FrameEventCursor,SequencePlayer,VfxPool,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
/** Host feeds real positions/hits/arrival. Sprite effects cannot apply damage or relocate an actor. */
export class P2VfxController{
 constructor(skill,clips,{capacity=32,onEvent=()=>{}}={}){this.skill=skill;this.clips=clips;this.pool=new VfxPool(capacity);this.onEvent=onEvent;this.cast=null;}
 beginCast({castId,startedAt,foot,targetFoot=foot,direction=1}){if(this.cast)throw Error('One actor per controller');this.cast={castId,startedAt,foot:[...foot],departure:[...foot],targetFoot:[...targetFoot],direction,cursor:new FrameEventCursor(this.skill.fps,this.skill.events),resolved:false,arrived:false};}
 setActorFoot(foot){if(this.cast)this.cast.foot=[...foot];}
 spawn(clip,at,point){return this.pool.acquire({clip,at,point:[...point]});}
 confirmHit({castId,hitId,worldPosition,confirmedAt}){
  const c=this.cast;if(!c||c.castId!==castId||c.resolved||!hitId||this.skill.family!=='thunder')return false;c.resolved=true;
  this.spawn('thunder-bolt',confirmedAt,worldPosition);this.spawn('thunder-impact',confirmedAt+this.skill.presentation.strikeLeadFrames/this.skill.fps,worldPosition);this.onEvent({type:'visual.hitConfirmed',castId,hitId});return true;
 }
 confirmArrival({castId,worldFoot,arrivedAt}){const c=this.cast;if(!c||c.castId!==castId||c.arrived||this.skill.family!=='wind')return false;c.arrived=true;c.foot=[...worldFoot];this.spawn('wind-arrival',arrivedAt,worldFoot);this.onEvent({type:'visual.arrived',castId});return true;}
 update(now){
  const c=this.cast,draw=[];
  if(c&&now>=c.startedAt){const age=now-c.startedAt;for(const event of c.cursor.advance(age)){this.onEvent({...event,type:'visual.'+event.type,castId:c.castId});}
   const clip=this.clips[this.skill.character.clip],pose=new SequencePlayer(clip).sample(age);
   if(pose)draw.push({clip:this.skill.character.clip,sample:pose,point:[...c.foot],layer:1});
   for(const track of this.skill.tracks.filter(t=>t.startFrame!==undefined)){
    const start=frameSeconds(track.startFrame,this.skill.fps),stop=track.stopOnArrival?Infinity:track.stopBeforeFrame!==undefined?frameSeconds(track.stopBeforeFrame,this.skill.fps):Infinity;if(age<start||age>=stop||(track.stopOnArrival&&c.arrived))continue;
    const tc=this.clips[track.clip];let sample=new SequencePlayer(tc).sample(age-start);if(!sample&&track.holdLastUntilResolve&&!c.resolved)sample={index:tc.frames.length-1,frame:tc.frames.at(-1),clip:tc};if(!sample)continue;
    const socket=this.skill.sockets[pose?.index??11],point=track.anchor==='hand'?c.foot.map((v,i)=>v+socket[i]):track.anchor==='target.ground'?c.targetFoot:track.anchor==='departure'?c.departure:c.foot;
    draw.push({clip:track.clip,sample,point:[...point],layer:track.layer});
   }
  }
  for(const slot of this.pool.slots){if(!slot.active)continue;const v=slot.value;if(now<v.at)continue;const sample=new SequencePlayer(this.clips[v.clip]).sample(now-v.at);if(!sample){this.pool.release(slot);continue;}draw.push({clip:v.clip,sample,point:v.point,layer:3});}
  return draw;
 }
 endCast(){this.cast=null;}dispose(){this.cast=null;this.pool.clear();}
}
