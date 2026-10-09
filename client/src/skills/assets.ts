import * as THREE from 'three';
import { SkillTimeline, type SkillPresentationCatalog } from '../../../shared/skills/presentation';
import { imageAlpha, cropAlpha, type AlphaMask } from '../render/occlusion';
import type { ActorSpriteFrame } from '../render/renderer';

export class SkillAssets {
  catalog!:SkillPresentationCatalog;
  textures=new Map<string,THREE.Texture>();
  private loads=new Map<string,Promise<THREE.Texture>>();
  private masks=new Map<string,AlphaMask>();
  private frameMasks=new Map<string,AlphaMask>();
  readonly failures=new Map<string,string>();
  async load():Promise<void> {
    const response=await fetch('/assets/r01/clips.json');if(!response.ok)throw new Error('Thiếu catalog animation/FX skill.');
    this.catalog=await response.json();new SkillTimeline(this.catalog);
    await Promise.all(this.fxClips().map(id=>this.texture(id)));
  }
  fxClips():string[]{return [...new Set(Object.values(this.catalog.skills).flatMap(s=>[...s.tracks.map(t=>t.clip),...(s.projectileClip?[s.projectileClip]:[])]))];}
  async prepareAvatar(id:string):Promise<void> {
    const clips=[...new Set(Object.values(this.catalog.skills).flatMap(s=>Object.values(s.bindings[id]??{})))];
    await Promise.all(clips.map(c=>this.texture(c!)));
  }
  texture(id:string):Promise<THREE.Texture> {
    let promise=this.loads.get(id);if(promise)return promise;
    promise=(async()=>{
      const c=this.catalog.clips[id];if(!c)throw new Error(`Thiếu clip ${id}.`);
      const t=await new THREE.TextureLoader().loadAsync(c.atlasUrl);
      if(t.image.width!==c.atlasSize[0]||t.image.height!==c.atlasSize[1]){t.dispose();throw new Error(`Atlas ${id} khác metadata.`);}
      t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=c.sampling==='nearest'?THREE.NearestFilter:THREE.LinearFilter;t.generateMipmaps=false;
      this.textures.set(id,t);this.failures.delete(id);return t;
    })().catch(error=>{this.loads.delete(id);this.failures.set(id,String(error));throw error;});
    this.loads.set(id,promise);return promise;
  }
  pose(clip:string,index:number):ActorSpriteFrame|undefined {
    const texture=this.textures.get(clip);if(!texture)return;
    const c=this.catalog.clips[clip],rect=c.frames[index],crop=c.frameCrops?.[index],cutouts=c.frameCutouts?.[index],key=`${clip}:${index}`;
    let mask=this.frameMasks.get(key);
    if(!mask){let alpha=this.masks.get(clip);if(!alpha){alpha=imageAlpha(texture.image as CanvasImageSource&{width:number;height:number});this.masks.set(clip,alpha);}mask=cropAlpha(alpha,rect);
      if(crop)for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++)if(x<crop.x||x>=crop.x+crop.w||y<crop.y||y>=crop.y+crop.h)mask.alpha[y*mask.width+x]=0;
      for(const cut of cutouts??[])for(let y=cut.y;y<cut.y+cut.h;y++)mask.alpha.fill(0,y*mask.width+cut.x,y*mask.width+cut.x+cut.w);
      this.frameMasks.set(key,mask);}
    return {clip,index,texture,rect,atlasSize:c.atlasSize,frameSize:c.frameSize,anchor:c.anchor,mask,crop,cutouts};
  }
  dispose():void {for(const t of this.textures.values())t.dispose();this.textures.clear();this.loads.clear();this.masks.clear();this.frameMasks.clear();}
}
