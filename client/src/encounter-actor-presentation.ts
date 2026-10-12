import {AnimationPlayer} from './assets/animation';
import type {ChapterView} from '@shared/chapter';
import {productionSample,type ProductionClip} from './core/actor-animation-production';
import {encounterPose} from './core/encounter-pose-model';
import {AnimationArenaArt} from './render/animation-arena-art';
import type {PreviewRenderer,RenderActor} from './render/renderer';
/** Owns only the body renderer/cache. AI and life IDs come from the private server view. */
export class EncounterActorPresentation{
 private art:AnimationArenaArt;private clips:Record<string,ProductionClip>={};private current?:RenderActor;private sample?:{id:string;clip:string;index:number;frameSize:[number,number];pivot:[number,number]};
 constructor(private renderer:PreviewRenderer){this.art=new AnimationArenaArt(renderer);}
 async load(){const r=await fetch('/assets/sect-encounter-actors-v2/catalog.json');if(!r.ok)throw Error('Thiếu bộ quái/boss.');const c=await r.json();if(Object.keys(c.clips).length!==104)throw Error('Bộ quái/boss thiếu hướng.');this.clips=c.clips;
  await Promise.all(Object.values(this.clips).filter(c=>c.action==='idle').map(c=>this.art.load(c.atlas)));this.art.trim();
 }
 update(view:ChapterView|undefined,now:number):RenderActor|undefined{
  this.art.begin();this.sample=undefined;if(!view?.enemy){this.current=undefined;this.art.trim();return;}
  const s=encounterPose(view,now)!;const c=this.clips[`${s.actor}-${s.action}-${s.direction}`];if(!c)throw Error('Thiếu pose quái '+JSON.stringify(s));
  const release=view.enemyPose?.releaseAt,sourceRelease=c.phases.find(p=>p.label==='Phát lực')?.at,serverRelease=release===undefined?undefined:release-view.enemyPose!.at;
  const age=serverRelease&&sourceRelease?s.age<=serverRelease?s.age*sourceRelease/serverRelease:sourceRelease+s.age-serverRelease:s.age;
  const frame=productionSample(c,age),pose=this.art.pose(c,frame.index),enemy=view.enemy;
  if(!this.current||this.current.id!==enemy.id){const asset=this.renderer.assets.values().next().value!;this.current={id:enemy.id,assetId:asset.definition.id,name:'',x:enemy.x,y:enemy.y,direction:'south',moving:false,own:false,animation:new AnimationPlayer(asset.atlas)};}
  const a=this.current;a.x=enemy.x;a.y=enemy.y;a.name=`${s.actor==='boss'?'Trấn Sơn Khôi Lỗi':'Thanh Nham Lang'} · ${Math.ceil(enemy.hp)}/${enemy.maxHp}`;a.labelHeight=s.actor==='boss'?116:62;a.drawRadius=enemy.radius;a.shadowSize=s.actor==='boss'?[82,22]:[44,14];
  if(pose)a.pose=pose;this.art.trim();this.sample={id:enemy.id,clip:c.id,index:frame.index,frameSize:c.frameSize,pivot:c.pivot};return a.pose?a:undefined;
 }
 diagnostics(){return {clips:104,sample:this.sample,cache:this.art.diagnostics(),artApproved:false};}
 reset(){this.current=undefined;this.sample=undefined;}
 dispose(){this.art.dispose();this.reset();}
}
