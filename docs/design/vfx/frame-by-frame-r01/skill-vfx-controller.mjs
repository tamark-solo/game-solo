import {SequencePlayer,FrameEventCursor,VfxPool,frameSeconds} from './sequence-system.mjs';
/** Presentation adapter: host owns combat, clock synchronization and projectile physics. */
export class SkillVfxController {
 constructor(skill,clips,{capacity=64,onEvent=()=>{}}={}){
  this.skill=skill;this.clips=clips;this.players=Object.fromEntries(Object.entries(clips).map(([id,c])=>[id,new SequencePlayer(c)]));
  this.pool=new VfxPool(capacity);this.casts=new Map();this.onEvent=onEvent;this.capacity=capacity;
 }
 beginCast({castId,startedAt,foot,direction}){
  if(this.casts.has(castId)||this.casts.size>=this.capacity)return false;
  const length=Math.hypot(...direction);if(!length||!Number.isFinite(startedAt))throw new Error('Invalid cast pose/time');
  this.casts.set(castId,{castId,startedAt,foot:[...foot],direction:direction.map(n=>n/length),cursor:new FrameEventCursor(this.skill.fps,this.skill.events),hitIds:new Set(),projectile:null});return true;
 }
 setProjectilePose(castId,{tip,direction}){
  const cast=this.casts.get(castId);if(!cast)return false;
  cast.projectile={tip:[...tip],direction:[...direction]};return true;
 }
 #spawn(value){return this.pool.acquire(value)!==null;}
 #removeProjectile(castId){for(const slot of this.pool.slots)if(slot.active&&slot.value.castId===castId&&slot.value.mode==='projectile')this.pool.release(slot);}
 confirmHit({castId,hitId,targetId,worldPosition,incomingDirection,confirmedAt}){
  const cast=this.casts.get(castId);if(!cast||cast.hitIds.has(hitId)||cast.hitIds.size>=32)return false;
  if(hitId===undefined||!Number.isFinite(confirmedAt))throw new Error('Hit requires hitId and confirmedAt');
  cast.hitIds.add(hitId);this.#removeProjectile(castId);
  const spawned=this.#spawn({castId,clip:'qi-impact',at:confirmedAt,mode:'world',point:[...worldPosition],angle:Math.atan2(incomingDirection[1],incomingDirection[0])});
  this.onEvent({type:'visual.hit',castId,hitId,targetId,at:confirmedAt,sfx:'sword.hit',hitStopMs:this.skill.presentation.hitStopMs,cameraShakeWorld:this.skill.presentation.cameraShakeWorld});return spawned;
 }
 endCast(castId){
  this.casts.delete(castId);
  for(const slot of this.pool.slots)if(slot.active&&slot.value.castId===castId&&slot.value.mode!=='world')this.pool.release(slot);
 }
 update(now){
  const sprites=[];
  for(const cast of this.casts.values()){
   const age=now-cast.startedAt;if(age<0)continue;
   if(age>8){this.endCast(cast.castId);continue;} // Presentation expiry, never a gameplay projectile lifetime.
   for(const event of cast.cursor.advance(age)){
    if(event.type==='release'&&cast.hitIds.size>0)continue;
    const at=cast.startedAt+frameSeconds(event.frame,this.skill.fps);
    if(event.type==='cast.start')this.#spawn({castId:cast.castId,clip:'sword-charge',at,mode:'hand',angle:0});
    if(event.type==='release'&&cast.hitIds.size===0){
     if(!cast.projectile){const pose=this.players['wanglin-cast-east'].sample(frameSeconds(event.frame,this.skill.fps)),s=this.skill.sockets[pose.index],ahead=this.skill.tracks.find(t=>t.id==='projectile').initialTipAhead;cast.projectile={tip:cast.foot.map((n,i)=>n+s[i]+cast.direction[i]*ahead),direction:[...cast.direction]};}
     this.#spawn({castId:cast.castId,clip:'sword-projectile',at,mode:'projectile',angle:0});
    }
    this.onEvent({...event,type:'visual.'+event.type,castId:cast.castId,at});
   }
   const sample=this.players['wanglin-cast-east'].sample(age);
   if(sample)sprites.push({type:'character',castId:cast.castId,clip:'wanglin-cast-east',sample,point:[...cast.foot],angle:0});
  }
  for(const slot of this.pool.slots){
   if(!slot.active)continue;const value=slot.value,sample=this.players[value.clip].sample(now-value.at),cast=this.casts.get(value.castId);
   if(!sample||(value.mode!=='world'&&!cast)){this.pool.release(slot);continue;}
   if(value.mode==='projectile'){const p=cast.projectile;sprites.push({...value,sample,point:[...p.tip],angle:Math.atan2(p.direction[1],p.direction[0])});}
   else if(value.mode==='hand'){
    const pose=this.players['wanglin-cast-east'].sample(now-cast.startedAt);if(!pose){this.pool.release(slot);continue;}
    const socket=this.skill.sockets[pose.index];sprites.push({...value,sample,point:cast.foot.map((n,i)=>n+socket[i])});
   }else sprites.push({...value,sample});
  }
  return sprites;
 }
 dispose(){this.pool.clear();this.casts.clear();}
}
