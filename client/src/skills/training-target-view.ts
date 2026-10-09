import * as THREE from 'three';
import type { TrainingTarget } from '../../../shared/skills/contracts';

export class TrainingTargetView {
  private sprites=new Map<string,THREE.Sprite>();
  constructor(private scene:THREE.Scene){}
  update(targets:readonly TrainingTarget[]):void {
    const wanted=new Set(targets.map(t=>t.id));
    for(const target of targets){
      let sprite=this.sprites.get(target.id);
      if(!sprite){sprite=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
        sprite.scale.set(92,80,1);sprite.center.set(.5,.08);sprite.renderOrder=8000;this.scene.add(sprite);this.sprites.set(target.id,sprite);}
      if(sprite.userData.hp!==target.hp){
        const canvas=document.createElement('canvas');canvas.width=184;canvas.height=160;const ctx=canvas.getContext('2d')!;
        ctx.scale(2,2);ctx.strokeStyle='#7e9aaf';ctx.fillStyle='#a7d3e077';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(46,43,15,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(46,43,5,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#263e32dd';ctx.fillRect(7,2,78,15);ctx.fillStyle='#fff4d0';ctx.font='10px Segoe UI';ctx.textAlign='center';ctx.fillText('Mục tiêu luyện',46,13);
        ctx.fillStyle='#263e32';ctx.fillRect(16,65,60,5);ctx.fillStyle=target.hp>0?'#d8ad57':'#92948a';ctx.fillRect(16,65,60*target.hp/target.maxHp,5);
        sprite.material.map?.dispose();const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;
        sprite.material.map=t;sprite.material.needsUpdate=true;sprite.userData.hp=target.hp;
      }
      sprite.position.set(target.x,-target.y,0);
    }
    for(const [id,s] of this.sprites)if(!wanted.has(id)){this.remove(s);this.sprites.delete(id);}
  }
  get count():number{return this.sprites.size;}
  private remove(s:THREE.Sprite):void {this.scene.remove(s);s.material.map?.dispose();s.material.dispose();}
  dispose():void {for(const s of this.sprites.values())this.remove(s);this.sprites.clear();}
}
