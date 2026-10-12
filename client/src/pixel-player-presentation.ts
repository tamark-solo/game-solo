import type { CourtyardState } from '@shared/protocol/courtyard-state';
import type { QuestMotionEvent } from '@shared/quest-motion';
import type { ProductionClip, ProductionDirection } from './core/actor-animation-production';
import { productionDirection, productionSample } from './core/actor-animation-production';
import { pixelLocomotionSample } from './core/pixel-locomotion';
import { AnimationArenaArt } from './render/animation-arena-art';
import type { PreviewRenderer, RenderActor } from './render/renderer';

interface Track { x:number;y:number;distance:number;direction:ProductionDirection;idleAt:number;deathAt?:number;hp?:number;hitAt?:number }
export class PixelPlayerPresentation {
 private art:AnimationArenaArt;
 private clips:Record<string,ProductionClip>={};
 private tracks=new Map<string,Track>();
 private basics=new Map<string,QuestMotionEvent>();
 private samples:Array<{id:string;clip:string;index:number;direction:string}>=[];
 constructor(renderer:PreviewRenderer){this.art=new AnimationArenaArt(renderer);}
 async load(){
  const response=await fetch('/assets/hang-nhac-pixel-player/catalog.json');if(!response.ok)throw Error('Chưa nạp được bộ pixel Vương Lâm.');
  const catalog=await response.json();this.clips=catalog.clips;
  if(Object.keys(this.clips).length!==80)throw Error('Bộ pixel thiếu clip.');
  await Promise.all(Object.values(this.clips).map(clip=>this.art.load(clip.atlas)));
 }
 event(event:QuestMotionEvent){if(event.kind==='basic'&&(this.basics.get(event.actorId)?.at??-Infinity)<event.at)this.basics.set(event.actorId,event);}
 update(actors:RenderActor[],state:CourtyardState|undefined,now:number){
  this.art.begin();
  this.samples=[];const ids=new Set(actors.map(actor=>actor.id));
  for(const id of this.tracks.keys())if(!ids.has(id)){this.tracks.delete(id);this.basics.delete(id);}
  for(const actor of actors){
   if(actor.assetId!=='CHR-WANG-LIN-CHIBI')continue;
   let track=this.tracks.get(actor.id);if(!track){track={x:actor.x,y:actor.y,distance:0,direction:actor.direction,idleAt:now};this.tracks.set(actor.id,track);}
   const dx=actor.x-track.x,dy=actor.y-track.y,distance=Math.hypot(dx,dy);
   if(distance<64){track.distance+=distance;if(actor.moving&&distance>.01)track.direction=productionDirection(dx,dy,track.direction);}
   track.x=actor.x;track.y=actor.y;
   const body=state?.players?.get(actor.id),basic=this.basics.get(actor.id);
   if(body&&track.hp!==undefined&&body.hp<track.hp&&body.hp>0)track.hitAt=now;
   if(body)track.hp=body.hp;
   let action=actor.moving?'run':'idle',age=now-track.idleAt;
   if(body&&body.hp<=0){track.deathAt??=now;action='death';age=Math.max(0,now-track.deathAt);}
   else if(body?.castId){
    action=({sword:'cast_forward',thunder:'cast_point',wind:'dash'} as Record<string,string>)[body.castSkill]??'idle';
    age=Math.max(0,now-body.castStartedAt);track.direction=productionDirection(body.castAimX,body.castAimY,track.direction);
   }else if(basic&&now-basic.at<400&&now>=basic.at){action='attack';age=now-basic.at;track.direction=basic.direction;}
   else if(track.hitAt!==undefined&&now-track.hitAt<250){action='hit';age=now-track.hitAt;}
   if(body&&body.hp>0)track.deathAt=undefined;
   const clip=this.clips[action+'-'+track.direction];if(!clip)throw Error('Thiếu action pixel '+action+'/'+track.direction);
   const sample=action==='run'?pixelLocomotionSample(clip,track.distance):productionSample(clip,age);
   actor.pose=this.art.pose(clip,sample.index);actor.labelHeight=88;
   this.samples.push({id:actor.id,clip:clip.id,index:sample.index,direction:track.direction});
  }
  this.art.trim();
 }
 diagnostics(){return {binding:'CHR-WANG-LIN-CHIBI',clips:Object.keys(this.clips).length,samples:this.samples,cache:this.art.diagnostics(),candidateCombat:true};}
 dispose(){this.art.dispose();this.tracks.clear();this.basics.clear();}
}
