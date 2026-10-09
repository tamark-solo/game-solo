import * as THREE from 'three';
import type { CourtyardState } from '../../../server/src/state';
import type { SkillEvent } from '../../../shared/skills/contracts';
import { SkillTimeline, type SpriteSample, type PresentationActor } from '../../../shared/skills/presentation';
import type { RenderActor } from '../renderer';
import { SkillAssets } from './assets';
import { TrainingTargetView } from './training-target-view';
import {atlasSprite,setSpriteFrame} from '../sprite-frame';

interface EffectSprite {sprite:THREE.Sprite;clip:string}
export class SkillPresentation {
  private assets=new SkillAssets();
  private timeline!:SkillTimeline;
  private sprites=new Map<string,EffectSprite>();
  private pool:EffectSprite[]=[];
  private prepared=new Set<string>();
  private targets:TrainingTargetView;
  constructor(private scene:THREE.Scene){this.targets=new TrainingTargetView(scene);}
  async load(avatar='CHR-WANG-LIN-CHIBI'):Promise<void> {await this.assets.load();this.timeline=new SkillTimeline(this.assets.catalog);await this.prepareAvatar(avatar);}
  async prepareAvatar(avatar:string):Promise<void> {await this.assets.prepareAvatar(avatar);this.prepared.add(avatar);}
  event(event:SkillEvent):void {this.timeline.event(event);}
  private acquire(clip:string):EffectSprite|undefined {
    const texture=this.assets.textures.get(clip);if(!texture)return;
    const i=this.pool.findIndex(s=>s.clip===clip);if(i>=0){const [item]=this.pool.splice(i,1);item.sprite.visible=true;return item;}
    const c=this.assets.catalog.clips[clip],sprite=atlasSprite(new THREE.SpriteMaterial({map:texture.clone(),transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
    sprite.scale.set(...c.frameSize,1);sprite.center.set(c.anchor[0]/c.frameSize[0],1-c.anchor[1]/c.frameSize[1]);this.scene.add(sprite);
    return {sprite,clip};
  }
  private release(item:EffectSprite):void {item.sprite.visible=false;if(this.pool.length<16)this.pool.push(item);else this.destroy(item);}
  private destroy(item:EffectSprite):void {this.scene.remove(item.sprite);item.sprite.geometry.dispose();item.sprite.material.map?.dispose();item.sprite.material.dispose();}
  private draw(sample:SpriteSample):void {
    let item=this.sprites.get(sample.id);
    if(item&&item.clip!==sample.clip){this.release(item);this.sprites.delete(sample.id);item=undefined;}
    if(!item){item=this.acquire(sample.clip);if(!item)return;this.sprites.set(sample.id,item);}
    const c=this.assets.catalog.clips[sample.clip],r=c.frames[sample.index];
    setSpriteFrame(item.sprite,r,c.atlasSize,c.frameSize,c.anchor,c.frameCrops?.[sample.index],c.frameCutouts?.[sample.index]);
    item.sprite.position.set(sample.x,-sample.y,0);item.sprite.material.rotation=sample.rotation;item.sprite.material.opacity=sample.opacity;
    item.sprite.renderOrder=sample.layer==='ground'?-500:sample.layer==='impact'?11000:9000;
    item.sprite.userData.skillEffect={id:sample.id,clip:sample.clip,index:sample.index,rect:r,anchor:c.anchor,crop:c.frameCrops?.[sample.index],cutouts:c.frameCutouts?.[sample.index]};
  }
  update(state:CourtyardState|undefined,now:number,renderActors:RenderActor[]=[]):void {
    for(const actor of renderActors)actor.pose=undefined;
    // Colyseus exposes the room before its first schema snapshot has arrived.
    if(!state?.players||!state.projectiles||!state.targets){this.timeline.reset();this.targets.update([]);for(const item of this.sprites.values())this.release(item);this.sprites.clear();return;}
    const visible=new Map(renderActors.map(a=>[a.id,a]));
    const actors:PresentationActor[]=[...state.players.values()].map(a=>({id:a.id,avatarId:a.avatarId,direction:a.direction,connected:a.connected,
      x:visible.get(a.id)?.x??a.x,y:visible.get(a.id)?.y??a.y,castId:a.castId,castSkill:a.castSkill,castStartedAt:a.castStartedAt,castAimX:a.castAimX,castAimY:a.castAimY}));
    for(const actor of actors)if(!this.prepared.has(actor.avatarId)){
      // Keep failed remote loads out of the frame loop; explicit prepareAvatar retries them.
      this.prepared.add(actor.avatarId);void this.assets.prepareAvatar(actor.avatarId).catch(()=>undefined);
    }
    const frame=this.timeline.sample(now,actors,[...state.projectiles.values()]);
    for(const [id,sample] of frame.poses){const actor=visible.get(id);if(actor)actor.pose=this.assets.pose(sample.clip,sample.index);}
    const wanted=new Set(frame.effects.map(s=>s.id));
    for(const [id,item] of this.sprites)if(!wanted.has(id)){this.release(item);this.sprites.delete(id);}
    for(const sample of frame.effects)this.draw(sample);
    this.targets.update([...state.targets.values()]);
  }
  diagnostics(){const timeline=this.timeline.diagnostics();return {...timeline,scheduledEffects:timeline.effects,effects:this.sprites.size,projectiles:[...this.sprites.keys()].filter(id=>id.startsWith('projectile:')).length,targets:this.targets.count,
    atlases:this.assets.fxClips().length,loadedAtlases:this.assets.textures.size,poseAtlases:Object.keys(this.assets.catalog.clips).length-this.assets.fxClips().length,
    renderedEffects:[...this.sprites.values()].map(({sprite})=>({...sprite.userData.skillEffect,
      point:[sprite.position.x,-sprite.position.y],rotation:sprite.material.rotation,opacity:sprite.material.opacity,
      scale:[sprite.scale.x,sprite.scale.y],uv:[sprite.material.map?.offset.toArray(),sprite.material.map?.repeat.toArray()]})),
    pool:this.pool.length,assetFailures:Object.fromEntries(this.assets.failures)};}
  dispose():void {this.timeline.reset();for(const item of [...this.sprites.values(),...this.pool])this.destroy(item);this.sprites.clear();this.pool=[];this.targets.dispose();this.assets.dispose();}
}
