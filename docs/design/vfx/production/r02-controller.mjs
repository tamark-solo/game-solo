import {FrameEventCursor,SequencePlayer,VfxPool,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
/** Presentation only. Projectile/actor coordinates and hit/arrival confirmations come from host. */
export class R02VfxController{
 constructor(skill,clips,{capacity=32,onEvent=()=>{}}={}){this.skill=skill;this.clips=clips;this.pool=new VfxPool(capacity);this.onEvent=onEvent;this.cast=null;}
 beginCast({castId,startedAt,foot,targetFoot=foot}){if(this.cast)throw Error('One active cast per actor');this.cast={castId,startedAt,foot:[...foot],departure:[...foot],targetFoot:[...targetFoot],cursor:new FrameEventCursor(24,this.skill.events),projectile:null,released:false,resolved:false,arrived:false};}
 setActorFoot(foot){if(this.cast)this.cast.foot=[...foot];}
 setProjectilePose({tip,direction=[1,0]}){if(this.cast)this.cast.projectile={tip:[...tip],angle:Math.atan2(direction[1],direction[0])};}
 spawn(clip,at,point,angle=0){return this.pool.acquire({clip,at,point:[...point],angle});}
 confirmHit({castId,hitId,worldPosition,confirmedAt,incomingDirection=[1,0]}){const c=this.cast;if(!c||c.castId!==castId||c.resolved||!hitId||this.skill.family==='wind')return false;c.resolved=true;
  const angle=Math.atan2(incomingDirection[1],incomingDirection[0]);if(this.skill.family==='sword')this.spawn('qi-impact',confirmedAt,worldPosition,angle);else{this.spawn('thunder-bolt',confirmedAt,worldPosition);this.spawn('thunder-impact',confirmedAt+this.skill.presentation.strikeLeadFrames/24,worldPosition);}this.onEvent({type:'visual.hitConfirmed',castId,hitId});return true;
 }
 expireProjectile({castId,expiredAt,tip,direction=[1,0]}){const c=this.cast;if(!c||c.castId!==castId||c.resolved||this.skill.family!=='sword')return false;c.resolved=true;const source=this.clips['qi-impact'];this.tailClip={...source,frames:source.frames.slice(-4),durations:[1,1,1,1]};this.spawn('air-dissolve',expiredAt,tip,Math.atan2(direction[1],direction[0]));return true;}
 confirmArrival({castId,worldFoot,arrivedAt}){const c=this.cast;if(!c||c.castId!==castId||c.arrived||this.skill.family!=='wind')return false;c.arrived=true;c.foot=[...worldFoot];this.spawn('wind-return-curl',arrivedAt,worldFoot);this.onEvent({type:'visual.arrived',castId});return true;}
 update(now){const c=this.cast,draw=[];
  if(c&&now>=c.startedAt){const age=now-c.startedAt;for(const event of c.cursor.advance(age)){if(event.type==='release'&&!c.resolved)c.released=true;this.onEvent({...event,type:'visual.'+event.type,castId:c.castId});}
   const pose=new SequencePlayer(this.clips[this.skill.character.clip]).sample(age);if(pose)draw.push({clip:this.skill.character.clip,sample:pose,point:[...c.foot],angle:0,layer:1});
   const offset=this.skill.sockets[pose?.index??11],hand=c.foot.map((v,i)=>v+offset[i]);
   for(const track of this.skill.tracks){
    if(track.trigger==='release'){if(c.released&&!c.resolved&&c.projectile){const release=this.skill.events.find(e=>e.type==='release'),sample=new SequencePlayer(this.clips[track.clip]).sample(age-frameSeconds(release.frame,24));if(sample)draw.push({clip:track.clip,sample,point:c.projectile.tip,angle:c.projectile.angle,layer:track.layer});}continue;}
    if(track.startFrame===undefined)continue;const start=frameSeconds(track.startFrame,24),stop=track.stopOnArrival?Infinity:track.stopBeforeFrame?frameSeconds(track.stopBeforeFrame,24):Infinity;if(age<start||age>=stop||track.stopOnArrival&&c.arrived)continue;
    const clip=this.clips[track.clip];let sample=new SequencePlayer(clip).sample(age-start);if(!sample&&track.holdLastUntilResolve&&!c.resolved)sample={index:clip.frames.length-1,frame:clip.frames.at(-1),clip};if(!sample)continue;
    const point=track.anchor==='hand'?hand:track.anchor==='formation'?c.foot.map((v,i)=>v+this.skill.formationOffset[i]):track.anchor==='target.ground'?c.targetFoot:track.anchor==='departure'?c.departure:c.foot;draw.push({clip:track.clip,sample,point:[...point],angle:0,layer:track.layer});
   }
  }
  for(const slot of this.pool.slots){if(!slot.active)continue;const v=slot.value;if(now<v.at)continue;const clip=v.clip==='air-dissolve'?this.tailClip:this.clips[v.clip],sample=new SequencePlayer(clip).sample(now-v.at);if(!sample){this.pool.release(slot);continue;}draw.push({clip:v.clip==='air-dissolve'?'qi-impact':v.clip,sample,point:v.point,angle:v.angle,layer:3,kind:v.clip==='air-dissolve'?'airDissolve':'impact'});}
  return draw;
 }
 endCast(){this.cast=null;}dispose(){this.cast=null;this.pool.clear();}
}
