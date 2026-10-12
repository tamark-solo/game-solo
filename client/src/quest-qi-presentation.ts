import * as THREE from 'three';
import type { SkillClip } from '../../shared/skills/presentation';
import type { RenderActor,ActorSpriteFrame } from './render/renderer';
import { atlasSprite,setSpriteFrame } from './render/sprite-frame';
import { facingAim } from '../../shared/skills/aim';

type Pose={actorId:string;clip:string;index:number;kind:string;direction?:string};
type Fx={sprite:THREE.Sprite;clip:string};
export class QuestQiPresentation {
  private clips:Record<string,SkillClip>={};private textures=new Map<string,THREE.Texture>();
  private sprites=new Map<string,Fx>();
  constructor(private scene:THREE.Scene){}
  async load():Promise<void>{
    const response=await fetch('/assets/quest-qi/clips.json');if(!response.ok)throw new Error('Thiếu khí quang nhiệm vụ.');
    const catalog=await response.json();if(catalog.version!==1)throw new Error('Sai catalog khí quang nhiệm vụ.');this.clips=catalog.clips;
    await Promise.all(Object.entries(this.clips).map(async([id,c])=>{const texture=await new THREE.TextureLoader().loadAsync(c.atlasUrl);
      if(texture.image.width!==c.atlasSize[0]||texture.image.height!==c.atlasSize[1]){texture.dispose();throw new Error(`Sai atlas khí ${id}.`);}
      texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;this.textures.set(id,texture);
    }));
  }
  frame(clip:string,index:number):ActorSpriteFrame|undefined{const c=this.clips[clip],texture=this.textures.get(clip);if(!c||!texture)return;
    return {clip,index,texture,rect:c.frames[index],frameSize:c.frameSize,atlasSize:c.atlasSize,anchor:c.anchor};}
  update(poses:Pose[],actors:RenderActor[],now:number,enabled:boolean,reduced=false):void{
    const wanted=new Set<string>(),byId=new Map(actors.map(a=>[a.id,a]));
    if(enabled)for(const pose of poses){const actor=byId.get(pose.actorId);if(!actor||actor.connected===false)continue;
      const clips=pose.kind==='cultivation'?reduced?['formation']:['formation','rising-qi']:pose.kind==='recovery'?['recovery-bloom']:pose.kind==='basic'?['palm-accent']:[];
      for(const clip of clips){const id=`${actor.id}:${clip}`;wanted.add(id);let fx=this.sprites.get(id);
        if(!fx){const texture=this.textures.get(clip);if(!texture)continue;
          const sprite=atlasSprite(new THREE.SpriteMaterial({map:texture.clone(),transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));this.scene.add(sprite);fx={sprite,clip};this.sprites.set(id,fx);
        }
        const sprite=fx.sprite,c=this.clips[clip],index=reduced?clip==='formation'?0:2:pose.index%4;
        setSpriteFrame(sprite,c.frames[index],c.atlasSize,c.frameSize,c.anchor);
        const aim=facingAim(pose.direction??actor.direction);const palm=clip==='palm-accent';
        sprite.position.set(actor.x+(palm?aim.x*28:0),-actor.y+(palm?30-aim.y*28:clip==='recovery-bloom'?26:0),0);
        sprite.material.rotation=palm?-Math.atan2(aim.y,aim.x):0;
        const pulse=reduced?.5:.5+.5*Math.sin(now/1000*Math.PI*2);
        sprite.material.opacity=clip==='formation'?.85+.1*pulse:clip==='rising-qi'?.7+.2*pulse:clip==='recovery-bloom'?.88:pose.index===3?.5:.9;
        sprite.userData.orderWithActor=actor.id;sprite.userData.actorOrderOffset=clip==='formation'?-1000:clip==='rising-qi'?.15:.25;
        sprite.userData.questQi={actorId:actor.id,clip,index};
      }
    }
    for(const [id,fx]of this.sprites)if(!wanted.has(id)){this.destroy(fx);this.sprites.delete(id);}
  }
  private destroy(fx:Fx):void{this.scene.remove(fx.sprite);fx.sprite.geometry.dispose();fx.sprite.material.map?.dispose();fx.sprite.material.dispose();}
  diagnostics(){return [...this.sprites.values()].map(({sprite})=>({...sprite.userData.questQi,position:sprite.position.toArray(),opacity:sprite.material.opacity,order:sprite.renderOrder,scale:sprite.scale.toArray()}));}
  reset():void{for(const fx of this.sprites.values())this.destroy(fx);this.sprites.clear();}
  dispose():void{this.reset();for(const texture of this.textures.values())texture.dispose();this.textures.clear();}
}
