import * as THREE from 'three';
import {CHAPTER_WORLD,type ChapterView} from '@shared/chapter';
import type {PreviewRenderer,RenderActor} from './render/renderer';
const icon:Record<string,string>={herb:'vh-clean-herb',water:'vh-clear-water',sand:'vh-conductive-sand',fiber:'vh-soft-fiber',jade:'vh-stable-jade'};
/** Provisional activity floor, markers and server masks; no owner map or art approval changes. */
export class ChapterPresentation {
 private group=new THREE.Group();private warnings=new THREE.Group();private labels=new Map<string,HTMLDivElement>();private markers=new Map<string,THREE.Sprite>();
 private textures:THREE.Texture[]=[];private key='';private visible=false;
 constructor(private renderer:PreviewRenderer,private labelRoot:HTMLElement){renderer.scene.add(this.group,this.warnings);}
 async load(){
  const loader=new THREE.TextureLoader();
  for(const n of CHAPTER_WORLD.nodes){
   const material=new THREE.SpriteMaterial({color:0xbfdba4,depthTest:false,depthWrite:false,transparent:true});
   if(icon[n.id]){const texture=await loader.loadAsync(`/assets/van-ngoc-gameplay-v1/${icon[n.id]}-64.png`);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;this.textures.push(texture);material.map=texture;material.color.set(0xffffff);}
   const marker=new THREE.Sprite(material);marker.position.set(n.x,-n.y+24,0);marker.scale.set(icon[n.id]?64:18,icon[n.id]?64:18,1);marker.renderOrder=n.y;this.group.add(marker);this.markers.set(n.id,marker);
   const label=document.createElement('div');label.className='chapter-world-label';label.style.cssText='position:absolute;pointer-events:none;padding:3px 6px;background:#183a35d9;color:#f5e6b8;border-radius:4px;white-space:nowrap;font:12px system-ui;transform:translate(-50%,-100%)';label.textContent=n.name;this.labels.set(n.id,label);this.labelRoot.append(label);
  }
  this.setVisible(false);
 }
 enter(){
  this.renderer.setMapLayout({width:CHAPTER_WORLD.width,height:CHAPTER_WORLD.height,color:'#203d3b',obstacles:[],ground:[
   {x:48,y:64,w:1184,h:784,color:'#647c66'},{x:112,y:128,w:1056,h:656,color:'#91a183'},
   {x:560,y:120,w:160,h:664,color:'#b6b79b'},{x:280,y:336,w:720,h:88,color:'#b6b79b'},
   {x:240,y:568,w:800,h:96,color:'#b6b79b'}]});this.setVisible(true);
 }
 private setVisible(v:boolean){this.visible=v;this.group.visible=v;this.warnings.visible=v;for(const l of this.labels.values())l.hidden=!v;if(!v){this.clearWarnings();this.key='';}}
 leave(){this.setVisible(false);}
 private clearWarnings(){while(this.warnings.children.length){const o=this.warnings.children[0];this.warnings.remove(o);if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}}}
 update(view:ChapterView|undefined,own:RenderActor){
  if(!this.visible||!view)return;
  const q=view.progress.activity,active=(id:string)=>q==='HN06'?['stable','sample-a','sample-b'].includes(id):q==='HN07'?id==='stable':q==='EX01'?['herb','water','sand'].includes(id):q==='EX02'?['fiber','jade','verify'].includes(id):q==='EX03'?['observe-a','observe-b','sand','deliver'].includes(id):q==='EX04'?['observe-a','observe-b','verify'].includes(id):false;
  const canvas=this.renderer.webgl.domElement,rect=canvas.getBoundingClientRect();
  for(const n of CHAPTER_WORLD.nodes){const on=active(n.id);this.markers.get(n.id)!.visible=on;const label=this.labels.get(n.id)!;label.hidden=!on;
   if(on){const p=new THREE.Vector3(n.x,-n.y+62,0).project(this.renderer.camera);label.style.left=`${(p.x+1)*rect.width/2}px`;label.style.top=`${(1-p.y)*rect.height/2}px`;label.textContent=`${n.name}${Math.hypot(n.x-own.x,n.y-own.y)<=72?' · E':''}`;}
  }
  const w=view.warning,key=JSON.stringify([w,view.guardUntil>view.now?{x:own.x,y:own.y}:null]);if(key===this.key)return;this.key=key;this.clearWarnings();
  const polygon=(points:Array<{x:number;y:number}>,color:number)=>{
   const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.y)));const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.42,depthTest:false,depthWrite:false}));mesh.renderOrder=-9000;this.warnings.add(mesh);
  };
  const circle=(x:number,y:number,r:number,color:number)=>polygon(Array.from({length:48},(_,i)=>({x:x+Math.cos(i*Math.PI/24)*r,y:y+Math.sin(i*Math.PI/24)*r})),color);
  if(w){if(w.shape==='circle')circle(w.x,w.y,w.radius,0xd86542);
   else if(w.shape==='line'){const sx=-w.dy*w.width/2,sy=w.dx*w.width/2;polygon([{x:w.x+sx,y:w.y+sy},{x:w.x-sx,y:w.y-sy},{x:w.x+w.dx*w.length-sx,y:w.y+w.dy*w.length-sy},{x:w.x+w.dx*w.length+sx,y:w.y+w.dy*w.length+sy}],0xd86542);}
   else{const angle=Math.atan2(w.dy,w.dx);polygon([{x:w.x,y:w.y},...Array.from({length:25},(_,i)=>({x:w.x+Math.cos(angle+(i/24-.5)*70*Math.PI/180)*w.radius,y:w.y+Math.sin(angle+(i/24-.5)*70*Math.PI/180)*w.radius}))],0xd86542);}
  }
  if(view.guardUntil>view.now)circle(own.x,own.y,30,0x8be9da);
 }
 dispose(){this.clearWarnings();this.renderer.scene.remove(this.group,this.warnings);for(const s of this.markers.values())(s.material as THREE.Material).dispose();for(const t of this.textures)t.dispose();for(const l of this.labels.values())l.remove();}
}
