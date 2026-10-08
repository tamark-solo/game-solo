/** Renderer-independent, authored-frame sequence/event helpers. No gameplay damage authority. */
export class SequencePlayer {
 constructor(clip){
  if(!Number.isFinite(clip.fps)||clip.fps<=0||!clip.frames.length)throw new Error('Invalid sequence');
  this.clip=clip;this.durations=clip.durations||clip.frames.map(()=>1);
  if(this.durations.length!==clip.frames.length||this.durations.some(n=>!Number.isInteger(n)||n<1))throw new Error('Invalid frame holds');
  this.length=this.durations.reduce((a,b)=>a+b,0);
 }
 sample(age){
  if(age<0)return null;
  let tick=Math.floor((age+1e-9)*this.clip.fps);
  if(this.clip.loop)tick%=this.length;else if(tick>=this.length)return null;
  let index=0;while(tick>=this.durations[index])tick-=this.durations[index++];
  return {index,frame:this.clip.frames[index],clip:this.clip};
 }
}
export class FrameEventCursor {
 constructor(fps,events){
  if(!(fps>0)||events.some(e=>!Number.isInteger(e.frame)||e.frame<1))throw new Error('Invalid frame events');
  this.fps=fps;this.events=[...events].sort((a,b)=>a.frame-b.frame);this.reset();
 }
 reset(){this.frame=-1;}
 advance(elapsed){
  const next=Math.floor((Math.max(0,elapsed)+1e-9)*this.fps);
  if(next<this.frame)throw new Error('Use seek/reset to rewind a timeline');
  const crossed=this.events.filter(e=>e.frame-1>this.frame&&e.frame-1<=next);this.frame=next;return crossed;
 }
 seek(humanFrame){this.frame=Math.max(0,Math.floor(humanFrame)-1);}
}
export class VfxPool {
 constructor(capacity=64){this.capacity=capacity;this.slots=[];}
 acquire(value){
  let slot=this.slots.find(s=>!s.active);
  if(!slot){if(this.slots.length>=this.capacity)return null;slot={id:this.slots.length,active:false,value:null};this.slots.push(slot);}
  slot.active=true;slot.value=value;return slot;
 }
 release(slot){if(this.slots[slot.id]!==slot)throw new Error('Foreign pool slot');slot.active=false;slot.value=null;}
 clear(){for(const s of this.slots)this.release(s);}
 get activeCount(){return this.slots.filter(s=>s.active).length;}
}
export class AtlasManager {
 constructor(loadImage){this.loadImage=loadImage;this.textures=new Map();}
 load(url){if(!this.textures.has(url))this.textures.set(url,Promise.resolve().then(()=>this.loadImage(url)).catch(error=>{this.textures.delete(url);throw error;}));return this.textures.get(url);}
}
export function frameSeconds(humanFrame,fps){return (humanFrame-1)/fps;}
export function sortLayers(items){return [...items].sort((a,b)=>(a.layer-b.layer)||(a.sortY-b.sortY)||(a.order-b.order));}
