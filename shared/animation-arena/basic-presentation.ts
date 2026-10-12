import {clipFrame,type SkillClip,type SpriteSample} from '../skills/presentation';
export type BasicAction='attack'|'attack_2'|'attack_3';
export interface BasicVfxCatalog {version:1;clips:Record<string,SkillClip>;attacks:Record<BasicAction,{trail:string;impact:string}>}
interface BasicFact {strikeId:string;actorId:string;action:BasicAction;at:number}
export type BasicPresentationEvent=(BasicFact&{type:'release';x:number;y:number;groundY:number;dx:number;dy:number})|
 (BasicFact&{type:'hit';targetId:string;x:number;y:number;groundY:number})|
 {type:'cancel';strikeId:string;at:number};
interface Effect {id:string;strikeId:string;actorId:string;clip:string;at:number;x:number;y:number;groundY:number;rotation:number;layer:'air'|'impact'}
/** Confirmed facts + absolute server age -> separate VFX. No input, damage, movement or persistence. */
export class BasicAttackTimeline {
 private effects=new Map<string,Effect>();private seen=new Map<string,number>();private terminal=new Map<string,number>();private dropped=0;
 constructor(readonly catalog:BasicVfxCatalog,private capacity=64){
  if(catalog.version!==1||!Number.isInteger(capacity)||capacity<1)throw Error('Invalid basic VFX catalog/capacity');
  for(const a of ['attack','attack_2','attack_3'] as const)if(!catalog.clips[catalog.attacks[a]?.trail]||!catalog.clips[catalog.attacks[a]?.impact])throw Error('Missing basic VFX binding: '+a);
  for(const c of Object.values(catalog.clips))if(c.loop||!c.frames.length||c.frames.length!==c.durations.length||c.durations.some(n=>!Number.isInteger(n)||n<=0)||!Number.isFinite(c.fps)||c.fps<=0)throw Error('Invalid basic VFX clip');
 }
 event(e:BasicPresentationEvent):void {
  if(!e.strikeId||!Number.isFinite(e.at))throw Error('Invalid basic fact');
  if(e.type==='cancel'){this.terminal.set(e.strikeId,e.at);for(const[id,f]of this.effects)if(f.strikeId===e.strikeId&&f.layer==='air')this.effects.delete(id);this.bound();return;}
  if(![e.x,e.y,e.groundY].every(Number.isFinite)||!this.catalog.attacks[e.action]||e.type==='release'&&(![e.dx,e.dy].every(Number.isFinite)||Math.hypot(e.dx,e.dy)<.001))throw Error('Invalid basic effect point/aim');
  const end=this.terminal.get(e.strikeId);if(end!==undefined&&(e.type==='release'||e.at>end))return;
  const key=e.strikeId+':'+e.type+(e.type==='hit'?':'+e.targetId:'');if(this.seen.has(key))return;this.seen.set(key,e.at);this.bound();
  if(this.effects.size>=this.capacity){this.dropped++;return;}
  const binding=this.catalog.attacks[e.action];this.effects.set(key,{id:'basic:'+key,strikeId:e.strikeId,actorId:e.actorId,clip:e.type==='release'?binding.trail:binding.impact,at:e.at,x:e.x,y:e.y,groundY:e.groundY,rotation:e.type==='release'?-Math.atan2(e.dy,e.dx):0,layer:e.type==='release'?'air':'impact'});
 }
 private bound(){while(this.seen.size>256)this.seen.delete(this.seen.keys().next().value!);while(this.terminal.size>128)this.terminal.delete(this.terminal.keys().next().value!);}
 sample(now:number):SpriteSample[]{if(!Number.isFinite(now))throw Error('Invalid basic clock');const out:SpriteSample[]=[];
  for(const[key,e]of this.effects){const c=this.catalog.clips[e.clip],index=clipFrame(c,now-e.at);if(index===undefined){if(now>=e.at)this.effects.delete(key);continue;}out.push({id:e.id,actorId:e.actorId,clip:e.clip,index,x:e.x,y:e.y,groundY:e.groundY,rotation:e.rotation,layer:e.layer,opacity:1});}return out;
 }
 diagnostics(){return{effects:this.effects.size,seen:this.seen.size,terminal:this.terminal.size,capacity:this.capacity,dropped:this.dropped};}
 reset(){this.effects.clear();this.seen.clear();this.terminal.clear();this.dropped=0;}
}
