import * as THREE from 'three';
import { WARNING_RADIUS, type LessonView } from '../../shared/lesson-contracts';

// Personal, safe teaching indicator from confirmed server facts; no damage or completion authority.
export class LessonPresentation {
  private area=new THREE.Mesh(new THREE.CircleGeometry(WARNING_RADIUS,64),
    new THREE.MeshBasicMaterial({color:0xe7a63b,transparent:true,opacity:.22,depthTest:false,depthWrite:false}));
  private rim=new THREE.Mesh(new THREE.RingGeometry(WARNING_RADIUS-1,WARNING_RADIUS+1,64),
    new THREE.MeshBasicMaterial({color:0xf4c265,transparent:true,opacity:.9,depthTest:false,depthWrite:false}));
  constructor(private scene:THREE.Scene){
    this.area.renderOrder=-500;this.rim.renderOrder=-499;
    this.area.visible=this.rim.visible=false;scene.add(this.area,this.rim);
  }
  update(view:LessonView|undefined,now:number):void {
    const visible=view?.kind==='avoid'&&view.status==='warning'&&!!view.center&&now<view.resolveAt!;
    this.area.visible=this.rim.visible=visible;
    if(visible){this.area.position.set(view!.center!.x,-view!.center!.y,0);this.rim.position.copy(this.area.position);}
  }
  dispose():void {
    this.scene.remove(this.area,this.rim);this.area.geometry.dispose();this.rim.geometry.dispose();
    this.area.material.dispose();this.rim.material.dispose();
  }
}
