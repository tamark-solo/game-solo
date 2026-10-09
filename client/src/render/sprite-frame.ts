import * as THREE from 'three';
import type { FrameRect } from '../assets/atlas';

// Sprite's default geometry is shared globally. Each atlas sprite owns a quad so
// trimming one pose cannot crop another actor, a pooled ghost or a ground effect.
export function atlasSprite(material:THREE.SpriteMaterial):THREE.Sprite {
  const sprite=new THREE.Sprite(material);sprite.geometry=sprite.geometry.clone();return sprite;
}

export function setSpriteFrame(sprite:THREE.Sprite,rect:FrameRect,atlasSize:readonly [number,number],
  frameSize:readonly [number,number],anchor:readonly [number,number],crop?:FrameRect,cutouts:readonly FrameRect[]=[]):void {
  const texture=sprite.material.map!;
  texture.repeat.set(rect.w/atlasSize[0],rect.h/atlasSize[1]);
  texture.offset.set(rect.x/atlasSize[0],1-(rect.y+rect.h)/atlasSize[1]);
  sprite.scale.set(frameSize[0],frameSize[1],1);
  sprite.center.set(anchor[0]/frameSize[0],1-anchor[1]/frameSize[1]);
  const c=crop??{x:0,y:0,w:frameSize[0],h:frameSize[1]},key=JSON.stringify([c,frameSize,cutouts]);
  if(sprite.userData.frameCropKey===key)return;
  const edges=(axis:'x'|'y',extent:'w'|'h')=>[...new Set([c[axis],c[axis]+c[extent],...cutouts.flatMap(r=>[r[axis],r[axis]+r[extent]])]
    .map(n=>Math.max(c[axis],Math.min(c[axis]+c[extent],n))))].sort((a,b)=>a-b);
  const xs=edges('x','w'),ys=edges('y','h'),positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  for(let y=0;y<ys.length-1;y++)for(let x=0;x<xs.length-1;x++){
    const mx=(xs[x]+xs[x+1])/2,my=(ys[y]+ys[y+1])/2;
    if(cutouts.some(r=>mx>=r.x&&mx<r.x+r.w&&my>=r.y&&my<r.y+r.h))continue;
    const i=positions.length/3;
    for(const [px,py] of [[xs[x],ys[y+1]],[xs[x+1],ys[y+1]],[xs[x+1],ys[y]],[xs[x],ys[y]]]){
      const u=px/frameSize[0],v=1-py/frameSize[1];positions.push(u-.5,v-.5,0);uvs.push(u,v);
    }
    indices.push(i,i+1,i+2,i,i+2,i+3);
  }
  const position=sprite.geometry.getAttribute('position'),uv=sprite.geometry.getAttribute('uv');
  if(position instanceof THREE.BufferAttribute&&position.count===positions.length/3){
    position.array.set(positions);uv.array.set(uvs);position.needsUpdate=true;uv.needsUpdate=true;
  }else{
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
    sprite.geometry.dispose();sprite.geometry=geometry;
  }
  sprite.geometry.computeBoundingSphere();
  sprite.userData.frameCropKey=key;sprite.userData.frameCrop={...c};sprite.userData.frameCutouts=cutouts;
}
