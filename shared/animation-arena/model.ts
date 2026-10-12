import {hangNhacSpawn,hangNhacWalkable} from '../hang-nhac';
import {moveUsingCollision} from '../world/movement';
import type {Direction,Input,Position} from '../world/types';
import {SkillEngine} from '../skills/engine';
import type {CombatActor,SkillEvent,TrainingTarget} from '../skills/contracts';
import type {SkillId} from '../profiles';
import type {ArenaActor,ArenaCommand,ArenaInput,ArenaKind,ArenaResult,ArenaSnapshot,ArenaWarning} from './contracts';

// Ephemeral feasibility fixture only: no profile, persistence, quest or rewards.
interface Actor extends Omit<CombatActor,'id'>,ArenaActor {ownerId:string;nextAttackAt:number}
interface Strike {id:string;action:string;at:number;release:number;end:number;dx:number;dy:number;locked:boolean;resolved:boolean}
const comboTimings=[{action:'attack',release:200,end:400},{action:'attack_2',release:1000/3,end:2000/3},{action:'attack_3',release:1250/3,end:750}];
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const aim=(x:number,y:number)=>{const m=Math.hypot(x,y);return m>.001?{x:x/m,y:y/m}:undefined;};
const dist=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.y-b.y);
export const arenaClearPath=(a:Position,b:Position,step=8)=>{const n=Math.max(1,Math.ceil(dist(a,b)/step));for(let i=0;i<=n;i++)if(!hangNhacWalkable({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}))return false;return true;};
export class AnimationArena {
 round=0;ai=false;ack=-1;engine!:SkillEngine;actors=new Map<ArenaKind,Actor>();
 private input:Input={x:0,y:0};private running=false;private inputAt=0;
 private strikes=new Map<ArenaKind,Strike>();private receipts=new Map<string,{key:string;result:ArenaResult}>();
 private combo=0;private lastCombo=-Infinity;private serial=0;private bossPattern=0;
 constructor(now:number,private emit:(round:number,event:SkillEvent)=>void=()=>{}){this.reset(now);}
 reset(now=this.engine.now){this.round++;this.ack=-1;this.ai=false;this.strikes.clear();this.receipts.clear();this.input={x:0,y:0};this.running=false;this.combo=0;this.lastCombo=-Infinity;this.serial=0;this.bossPattern=0;this.actors.clear();
  this.engine=new SkillEngine(now,event=>{if(event.type==='hit'&&event.targetId){const target=this.actors.get(event.targetId as ArenaKind);if(target)target.hitAt=event.at;}this.emit(this.round,event);},undefined,{walkable:hangNhacWalkable,clearPath:arenaClearPath});
  const spawn=hangNhacSpawn(0),specs=[{id:'wang' as const,name:'Vương Lâm',hp:100,radius:8,pos:spawn},{id:'wolf' as const,name:'Thanh Nham Lang',hp:60,radius:18,pos:this.findSpawn({x:spawn.x+120,y:spawn.y+30},18)},{id:'boss' as const,name:'Trấn Sơn Khôi Lỗi',hp:180,radius:28,pos:this.findSpawn({x:spawn.x,y:spawn.y-155},28)}];
  for(const s of specs){const a:Actor={...s.pos,id:s.id,kind:s.id,name:s.name,hp:s.hp,maxHp:s.hp,mp:100,radius:s.radius,ownerId:'wang',connected:true,direction:'south',moving:false,aimX:0,aimY:1,travel:0,action:s.id==='boss'?'appear':'idle',actionAt:now,actionId:'spawn-'+this.round,hitAt:0,deadAt:0,casts:0,practiceHits:0,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0,nextAttackAt:s.id==='wang'?0:now+1000};this.actors.set(s.id,a);if(s.id==='wang')this.engine.add(a);else this.engine.targets.set(s.id,a as TrainingTarget);}
 }
 private findSpawn(p:Position,r:number){for(let ring=0;ring<15;ring++)for(let x=-ring;x<=ring;x++)for(let y=-ring;y<=ring;y++){if(Math.abs(x)!==ring&&Math.abs(y)!==ring)continue;const pos={x:p.x+x*12,y:p.y+y*12};if(hangNhacWalkable(pos,r))return pos;}throw Error('No fixture spawn on owner navigation.');}
 inputCommand(raw:unknown):boolean{if(!raw||typeof raw!=='object')return false;const d=raw as ArenaInput;if(d.round!==this.round||!Number.isSafeInteger(d.seq)||d.seq<=this.ack||d.seq-this.ack>1000||!finite(d.x)||!finite(d.y)||Math.abs(d.x)>1||Math.abs(d.y)>1||typeof d.run!=='boolean')return false;
  this.ack=d.seq;this.input={x:d.x,y:d.y};this.running=d.run;this.inputAt=this.engine.now;this.engine.movement('wang',this.input);return true;
 }
 stop(){this.input={x:0,y:0};this.running=false;this.engine.movement('wang',this.input);}
 command(raw:unknown):ArenaResult{if(!raw||typeof raw!=='object')return {id:'',accepted:false,reason:'malformed'};const c=raw as ArenaCommand;
  if(typeof c.id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(c.id)||c.round!==this.round||!finite(c.aimX)||!finite(c.aimY)||!Number.isSafeInteger(c.inputSeq)||!['basic','sword','thunder','wind'].includes(c.skill)||typeof c.targetId!=='string')return {id:typeof c.id==='string'?c.id.slice(0,64):'',accepted:false,reason:'malformed_or_round'};
  const key=JSON.stringify([c.round,c.skill,c.aimX,c.aimY,c.targetId,c.inputSeq]),old=this.receipts.get(c.id);if(old)return old.key===key?{...old.result,duplicate:true}:{id:c.id,accepted:false,reason:'request_reused'};
  let result:ArenaResult;const a=this.actors.get('wang')!,v=aim(c.aimX,c.aimY);
  if(c.inputSeq!==this.ack)result={id:c.id,accepted:false,reason:'input_sequence'};
  else if(a.hp<=0)result={id:c.id,accepted:false,reason:'inactive'};
  else if(!v)result={id:c.id,accepted:false,reason:'aim'};
  else if(this.strikes.has('wang'))result={id:c.id,accepted:false,reason:'attacking'};
  else if(c.skill==='basic'){
   if(a.castId||this.engine.now<a.nextAttackAt)result={id:c.id,accepted:false,reason:'cooldown_or_casting'};
   else {if(this.engine.now-this.lastCombo>1600)this.combo=0;const t=comboTimings[this.combo];this.combo=(this.combo+1)%3;this.lastCombo=this.engine.now;this.begin(a,{id:'basic-'+this.round+'-'+c.id,...t,at:this.engine.now,dx:v.x,dy:v.y,locked:true,resolved:false});a.nextAttackAt=this.engine.now+t.end+80;result={id:c.id,accepted:true};}
  }else {const r=this.engine.cast('wang',{id:c.id,skillId:c.skill as SkillId,aimX:v.x,aimY:v.y,targetId:c.targetId},this.input);result={id:c.id,accepted:r.accepted,reason:r.reason,duplicate:r.duplicate};if(r.accepted){a.aimX=a.castAimX!;a.aimY=a.castAimY!;a.moving=false;}}
  this.receipts.set(c.id,{key,result});if(this.receipts.size>128)this.receipts.delete(this.receipts.keys().next().value!);return result;
 }
 private begin(a:Actor,s:Strike){this.strikes.set(a.kind,s);a.action=s.action;a.actionAt=s.at;a.actionId=s.id;a.aimX=s.dx;a.aimY=s.dy;a.moving=false;}
 private move(a:Actor,input:Input,dt:number,speed:number){const prev={x:a.x,y:a.y},m=moveUsingCollision({...prev,direction:a.direction as Direction,moving:a.moving},input,dt,speed,p=>hangNhacWalkable(p,a.radius));Object.assign(a,m);const travel=dist(prev,a);a.travel+=travel;const v=aim(input.x,input.y);if(v){a.aimX=v.x;a.aimY=v.y;}return travel;}
 private damage(a:Actor,n:number,source:string){if(a.hp<=0)return;a.hp=Math.max(0,a.hp-n);a.hitAt=this.engine.now;if(a.hp===0)this.die(a);this.emit(this.round,{type:'hit',castId:source,actorId:source.startsWith('basic')?'wang':'enemy',skillId:'sword',at:this.engine.now,x:a.x,y:a.y,dx:0,dy:1,targetId:a.id,targetX:a.x,targetY:a.y,damage:n});}
 private die(a:Actor){if(a.deadAt)return;a.deadAt=this.engine.now;a.action='death';a.actionAt=a.deadAt;a.actionId='death-'+this.round+'-'+a.id;a.moving=false;this.strikes.delete(a.kind);if(a.id==='wang'){this.engine.cancel('wang');this.stop();}}
 private strikeTick(a:Actor,s:Strike){const age=this.engine.now-s.at,p=this.actors.get('wang')!;
  if(!s.locked&&age>=200){const v=aim(p.x-a.x,p.y-a.y)??{x:s.dx,y:s.dy};s.dx=v.x;s.dy=v.y;s.locked=true;a.aimX=v.x;a.aimY=v.y;}
  if(!s.resolved&&age+.001>=s.release){s.resolved=true;
   if(a.kind==='wang'){for(const target of this.actors.values())if(target.kind!=='wang'&&target.hp>0){const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);if(d<=60+target.radius&&(d<.01||(dx*s.dx+dy*s.dy)/d>.45)&&arenaClearPath(a,target))this.damage(target,s.action==='attack_3'?20:12,s.id);}}
   else if(p.hp>0){const dx=p.x-a.x,dy=p.y-a.y,along=dx*s.dx+dy*s.dy,side=Math.abs(dx*s.dy-dy*s.dx),d=Math.hypot(dx,dy);const hit=s.action==='cast_field'?d<=100+p.radius:s.action==='cast_line'?along>=-p.radius&&along<=230+p.radius&&side<=22+p.radius:d<=a.radius+48+p.radius&&(d<.01||along/d>.5);if(hit&&arenaClearPath(a,p))this.damage(p,a.kind==='wolf'?8:14,s.id);}
  }
  if(age>=s.end&&this.strikes.get(a.kind)===s){this.strikes.delete(a.kind);a.action='idle';a.actionAt=this.engine.now;if(a.kind!=='wang')a.nextAttackAt=this.engine.now+500;}
 }
 tick(dt:number){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);if(this.engine.now-this.inputAt>500)this.stop();const p=this.actors.get('wang')!;this.engine.prepare(dt);
  if(p.hp>0){if(p.dashVX||p.dashVY){const m=Math.hypot(p.dashVX!,p.dashVY!);this.move(p,{x:p.dashVX!/m,y:p.dashVY!/m},dt,m);}else if(!p.motionLocked&&!this.strikes.has('wang'))this.move(p,this.input,dt,this.running?120:80);else p.moving=false;
   if(!p.castId&&!this.strikes.has('wang')){const action=p.moving?'run':'idle';if(p.action!==action){p.action=action;p.actionAt=this.engine.now;}}
  }
  for(const a of this.actors.values())if(a.kind!=='wang'&&a.hp>0){a.moving=false;if(a.action==='appear'&&this.engine.now-a.actionAt<960)continue;const strike=this.strikes.get(a.kind);if(strike){this.strikeTick(a,strike);continue;}if(this.ai&&p.hp>0){const d=dist(a,p),v=aim(p.x-a.x,p.y-a.y)??{x:0,y:1};if(d>(a.kind==='wolf'?62:82)){this.move(a,v,dt,a.kind==='wolf'?85:45);a.action=a.moving?'walk':'idle';}else if(this.engine.now>=a.nextAttackAt){const serial=++this.serial,action=a.kind==='wolf'?'attack':['attack','cast_line','cast_field'][(this.bossPattern++)%3],release=a.kind==='wolf'?800:action==='attack'?1000:action==='cast_line'?1100:1200,end=a.kind==='wolf'?1400:action==='attack'?1800:action==='cast_line'?1900:2000;this.begin(a,{id:'enemy-'+this.round+'-'+serial,action,at:this.engine.now,release,end,dx:v.x,dy:v.y,locked:false,resolved:false});}else a.action='idle';}else a.action='idle';}
  const basic=this.strikes.get('wang');if(basic)this.strikeTick(p,basic);this.engine.finish(dt);for(const a of this.actors.values())if(a.hp<=0)this.die(a);
 }
 setAI(value:boolean){this.ai=value;if(!value){for(const a of this.actors.values())if(a.kind!=='wang'){this.strikes.delete(a.kind);if(a.hp>0){a.action='idle';a.actionAt=this.engine.now;}a.moving=false;}}}
 snapshot():ArenaSnapshot{const now=this.engine.now,warnings:ArenaWarning[]=[];for(const [kind,s] of this.strikes)if(kind!=='wang'&&!s.resolved){const a=this.actors.get(kind)!;warnings.push({id:s.id,actorId:kind,action:s.action,x:a.x,y:a.y,dx:s.dx,dy:s.dy,range:s.action==='cast_line'?230:a.radius+48,radius:s.action==='cast_field'?100:22,releaseAt:s.at+s.release,locked:s.locked});}
  return {round:this.round,now,ai:this.ai,ack:this.ack,actors:[...this.actors.values()].map(a=>({...a,action:a.hp<=0?'death':a.castId?({sword:'cast_forward',thunder:'cast_point',wind:'dash'}[a.castSkill]??a.action):!this.strikes.has(a.kind)&&a.hitAt&&now-a.hitAt<200?'hit':a.action,actionAt:a.hp<=0?a.deadAt:a.castId?a.castStartedAt:!this.strikes.has(a.kind)&&a.hitAt&&now-a.hitAt<200?a.hitAt:a.actionAt})),projectiles:[...this.engine.projectiles.values()].map(p=>({...p})),warnings};
 }
}
