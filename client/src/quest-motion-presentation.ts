import * as THREE from 'three';
import type { SectView } from '../../shared/sect';
import { QuestMotionTimeline, readQuestMotion, type QuestMotionCatalog, type QuestMotionEvent } from '../../shared/quest-motion';
import { imageAlpha, cropAlpha, type AlphaMask } from './render/occlusion';
import type { ActorSpriteFrame, RenderActor } from './render/renderer';
import { QuestQiPresentation } from './quest-qi-presentation';

export class QuestMotionPresentation {
  private catalog!:QuestMotionCatalog;
  private textures=new Map<string,THREE.Texture>();
  private masks=new Map<string,AlphaMask>();
  private frameMasks=new Map<string,AlphaMask>();
  private timeline=new QuestMotionTimeline();
  private rendered:Array<{actorId:string;clip:string;index:number;kind:string;direction?:string}>=[];
  private events:QuestMotionEvent[]=[];
  private qi:QuestQiPresentation;
  constructor(scene:THREE.Scene){this.qi=new QuestQiPresentation(scene);}
  async load():Promise<void> {
    const response=await fetch('/assets/quest-motion/clips.json');if(!response.ok)throw new Error('Thiếu sprite animation nhiệm vụ.');
    this.catalog=await response.json();if(this.catalog.version!==1)throw new Error('Catalog animation nhiệm vụ không hợp lệ.');
    await this.qi.load();
    const loader=new THREE.TextureLoader();
    await Promise.all(Object.entries(this.catalog.clips).map(async([id,clip])=>{
      const texture=await loader.loadAsync(clip.atlasUrl);
      if(texture.image.width!==clip.atlasSize[0]||texture.image.height!==clip.atlasSize[1]||clip.frames.length!==4||
        clip.frameSize[0]!==96||clip.frameSize[1]!==96||clip.anchor[0]!==48||clip.anchor[1]!==88){texture.dispose();throw new Error(`Sai canvas/neo clip nhiệm vụ ${id}.`);}
      texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;
      this.textures.set(id,texture);this.masks.set(id,imageAlpha(texture.image));
    }));
  }
  event(raw:unknown):void {const event=readQuestMotion(raw);if(event){this.timeline.event(event);this.events.push(event);if(this.events.length>64)this.events.shift();}}
  pose(clip:string,index:number):ActorSpriteFrame|undefined {
    const texture=this.textures.get(clip),c=this.catalog.clips[clip];if(!texture||!c?.frames[index])return;
    const key=`${clip}:${index}`;let mask=this.frameMasks.get(key);
    if(!mask){mask=cropAlpha(this.masks.get(clip)!,c.frames[index]);this.frameMasks.set(key,mask);}
    return {clip,index,texture,rect:c.frames[index],atlasSize:c.atlasSize,frameSize:c.frameSize,anchor:c.anchor,mask,source:'quest'};
  }
  update(actors:RenderActor[],now:number,online:boolean,view?:SectView):void {
    this.rendered=[];if(!online){this.timeline.reset();this.qi.reset();return;}
    if(!actors.length)return;
    this.timeline.prune(new Set(actors.map(a=>a.id)));
    for(const actor of actors){
      const sample=this.timeline.sample(this.catalog,{id:actor.id,avatarId:actor.assetId,moving:actor.moving,connected:actor.connected},now,actor.own?view:undefined);
      // R01 always owns its body pose; cosmetic quest gestures cannot replace it.
      if(actor.pose||!sample)continue;
      actor.pose=this.pose(sample.clip,sample.index);
      if(actor.pose)this.rendered.push({actorId:actor.id,...sample});
    }
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.getElementById('game-shell')?.dataset.motion==='reduce';
    this.qi.update(this.rendered,actors,now,!document.hidden,reduced);
  }
  diagnostics(){return {loadedAtlases:this.textures.size,rendered:this.rendered,events:this.events,qi:this.qi.diagnostics()};}
  reset():void {this.timeline.reset();this.rendered=[];this.events=[];this.qi.reset();}
  dispose():void {this.reset();this.qi.dispose();for(const texture of this.textures.values())texture.dispose();this.textures.clear();this.masks.clear();this.frameMasks.clear();}
}
