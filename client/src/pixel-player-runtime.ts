import type {CourtyardState} from '@shared/protocol/courtyard-state';
import type {QuestMotionEvent} from '@shared/quest-motion';
import type {SectView} from '@shared/sect';
import type {ChapterView} from '@shared/chapter';
import {readActorAction,actorDirection} from '@shared/actor-actions';
import {BasicAttackTimeline,type BasicVfxCatalog} from '@shared/animation-arena/basic-presentation';
import {productionSample,type ProductionClip} from './core/actor-animation-production';
import {PixelPlayerModel} from './core/pixel-player-model';
import {pixelLocomotionSample} from './core/pixel-locomotion';
import {AnimationArenaArt} from './render/animation-arena-art';
import type {PreviewRenderer,RenderActor,MapDepthItem} from './render/renderer';
export class PixelPlayerPresentation{
 private art:AnimationArenaArt;private clips:Record<string,ProductionClip>={};private model=new PixelPlayerModel();private fx!:BasicAttackTimeline;private sockets!:Record<string,Record<string,[number,number]>>;private fxCatalog!:BasicVfxCatalog;
 private samples:Array<{id:string;clip:string;index:number;direction:string;frameSize:[number,number];pivot:[number,number]}>=[];private facts:unknown[]=[];private drawn:unknown[]=[];
 constructor(renderer:PreviewRenderer){this.art=new AnimationArenaArt(renderer,32*1024*1024);}
 async load(){
  const fetchJson=async(url:string)=>{const r=await fetch(url);if(!r.ok)throw Error('Chưa nạp được '+url);return r.json();};
  const [body,life,fx,sockets]=await Promise.all([fetchJson('/assets/hang-nhac-pixel-player/catalog.json'),fetchJson('/assets/wang-lin-pixel-life-v1/catalog.json'),fetchJson('/assets/basic-attack-jade-v1/catalog.json'),fetchJson('/assets/basic-attack-jade-v1/hand-sockets.json')]);
  if(Object.keys(body.clips).length!==80||Object.keys(life.clips).length!==16)throw Error('Thiếu bộ pixel Vương Lâm.');this.clips={...body.clips,...life.clips};this.fxCatalog=fx;this.fx=new BasicAttackTimeline(fx);this.sockets=sockets.sockets;
  await Promise.all([...Object.values(this.clips).map(c=>this.art.load(c.atlas)),...Object.values(this.fxCatalog.clips).map(c=>this.art.load(c.atlasUrl,c.sampling))]);this.art.trim();
 }
 event(e:QuestMotionEvent){this.model.quest(e);}
 action(raw:unknown){const e=readActorAction(raw);if(!e||e.avatarId!==undefined&&e.avatarId!=='CHR-WANG-LIN-CHIBI')return;this.model.event(e);this.facts.push(e);if(this.facts.length>64)this.facts.shift();if(e.action==='gather'||e.type==='start')return;
  if(e.type==='cancel'){this.fx.event({type:'cancel',strikeId:e.strikeId,at:e.at});return;}
  if(e.type==='release'){const s=this.sockets[e.action][actorDirection(e.dx,e.dy)];this.fx.event({...e,type:'release',action:e.action,x:e.x+s[0]-56,y:e.y+s[1]-88,groundY:e.y});}
  else if(e.type==='hit')this.fx.event({...e,type:'hit',action:e.action,targetId:e.targetId!,x:e.targetX!,y:e.targetY!-e.targetHeight!,groundY:e.targetY!});
 }
 update(actors:RenderActor[],state:CourtyardState|undefined,now:number,sect?:SectView,chapter?:ChapterView,online=true){
  this.art.begin();this.samples=[];this.drawn=[];this.model.prune(new Set(actors.map(a=>a.id)));if(!online)this.fx.reset();
  for(const actor of actors){if(actor.assetId!=='CHR-WANG-LIN-CHIBI')continue;const body=state?.players?.get(actor.id);
   const s=this.model.sample({...actor,...(body?{hp:body.hp,castId:body.castId,castSkill:body.castSkill,castStartedAt:body.castStartedAt,castAimX:body.castAimX,castAimY:body.castAimY,facingX:body.facingX,facingY:body.facingY}:{})},now,actor.own&&online?sect:undefined,actor.own?chapter?.basic:undefined),clip=this.clips[s.action+'-'+s.direction];
   if(!clip)throw Error('Thiếu action pixel '+s.action+'/'+s.direction);const sample=s.action==='run'?pixelLocomotionSample(clip,s.distance):productionSample(clip,s.age);
   actor.pose=this.art.pose(clip,sample.index);if(actor.pose)actor.pose.source=s.action==='idle'||s.action==='run'?'locomotion':s.action==='meditate'||s.action==='gather'?'quest':'skill';actor.labelHeight=s.action==='meditate'?60:88;this.samples.push({id:actor.id,clip:clip.id,index:sample.index,direction:s.direction,frameSize:clip.frameSize,pivot:clip.pivot});
  }
  const items:MapDepthItem[]=[],visible=new Set(actors.filter(a=>a.connected!==false).map(a=>a.id));for(const s of this.fx.sample(now)){if(!online||!s.actorId||!visible.has(s.actorId))continue;this.art.effect(s,this.fxCatalog.clips[s.clip],s.groundY!,items);this.drawn.push({clip:s.clip,index:s.index,x:s.x,y:s.y,groundY:s.groundY});}this.art.finish(items);
 }
 reset(){this.model.reset();this.fx?.reset();this.facts=[];}
 diagnostics(){return {binding:'CHR-WANG-LIN-CHIBI',clips:Object.keys(this.clips).length,coreClips:80,lifeClips:16,samples:this.samples,facts:this.facts,drawnEffects:this.drawn,fx:this.fx?.diagnostics(),cache:this.art.diagnostics(),candidateCombat:true,candidateLife:true};}
 dispose(){this.art.dispose();this.reset();}
}
