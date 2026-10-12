import {R01Engine,type CombatActor,type CastCommand,type CastResult,type SkillEvent,type TrainingTarget} from '../../shared/r01';
import {CHAPTER_WORLD,chapterClearPath,chapterWalkable,initialChapter,type ChapterActivitySave,type ChapterProgress,type ChapterView} from '../../shared/chapter';
import type {CharacterProfile} from '../../shared/profiles';
import type {Input} from '../../shared/world/types';
import {chapterAvailable,chapterHint} from './chapter-progress';
import {BASIC_ACTIONS,BASIC_RULES,type BasicStrike,type ActorActionFact} from '../../shared/actor-actions';

/** One private simulation per owner; the room remains the sole profile writer. */
export class ChapterActivity {
 readonly engine:R01Engine;
 private s:ChapterActivitySave;
 private credit=false;
 private pausedAt=0;
 private actions:ActorActionFact[]=[];
 constructor(readonly actor:CombatActor,profile:CharacterProfile,now:number,event:(e:SkillEvent)=>void,commit:(a:CombatActor,c:CastCommand,r:CastResult)=>void,private actionEvent:(e:ActorActionFact)=>void=()=>{}){
  this.engine=new R01Engine(now,e=>{this.onHit(e,profile);event(e);},commit,{walkable:chapterWalkable,clearPath:chapterClearPath});
  this.engine.add(actor);
  this.s=this.fresh(profile,now);
  if(profile.chapter?.activitySave){
   const saved=structuredClone(profile.chapter.activitySave),within=Date.now()-(saved.pausedAt||profile.updatedAt)<=30000;
   if(within){
    const shift=now-saved.now;this.s=saved;this.s.now=now;this.s.pausedAt=0;this.shift(shift);
    Object.assign(actor,{x:saved.x,y:saved.y,direction:saved.direction});
    for(const k of ['nextSwordAt','nextThunderAt','nextWindAt','lastSpentAt'] as const)if(actor[k])actor[k]+=shift;
    if(profile.chapter.guardReadyAt)profile.chapter.guardReadyAt+=shift;
    if(saved.enemy){saved.enemy.ownerId=actor.id;this.engine.targets.set(saved.enemy.id,saved.enemy);}
    this.engine.restore(actor.id,saved.engine,shift);
   }else this.prepare(profile,false);
  }else this.prepare(profile,false);
  if(this.s.basic&&this.s.basic.id===undefined){const old=this.s.basic;this.s.basic={...old,id:`legacy-${actor.id}-${this.s.serial}`,action:'attack',startedAt:old.at-200,endAt:old.at+200,released:false};}
  if(this.s.basic)this.actor.motionLocked=true;
 }
 private fresh(p:CharacterProfile,now=this.engine.now):ChapterActivitySave{
  return {now,pausedAt:0,status:'ready',serial:(p.chapter?.activitySave?.serial??0),...CHAPTER_WORLD.spawn,direction:'north',guardUntil:0,guardSpent:false,nextBasicAt:0,stableSince:0,prepared:false,
   ai:{stage:'approach',at:now,turn:0,shape:'fan',...CHAPTER_WORLD.enemy,dx:0,dy:1,locked:false,pulses:0,double:false},engine:{projectiles:[]}};
 }
 private shift(ms:number){for(const k of ['guardUntil','nextBasicAt','stableSince'] as const)if(this.s[k])this.s[k]+=ms;this.s.ai.at+=ms;if(this.s.basic){this.s.basic.at+=ms;if(this.s.basic.startedAt!==undefined)this.s.basic.startedAt+=ms;if(this.s.basic.endAt!==undefined)this.s.basic.endAt+=ms;}if(this.s.combo)this.s.combo.until+=ms;if(this.s.enemyPose){this.s.enemyPose.at+=ms;if(this.s.enemyPose.releaseAt!==undefined)this.s.enemyPose.releaseAt+=ms;}}
 snapshot():ChapterActivitySave{return {...structuredClone(this.s),now:this.engine.now,pausedAt:this.pausedAt,x:this.actor.x,y:this.actor.y,direction:this.actor.direction as ChapterActivitySave['direction'],
  enemy:[...this.engine.targets.values()][0]?{...[...this.engine.targets.values()][0]}:undefined,engine:this.engine.checkpoint(this.actor.id)};}
 apply(progress:ChapterProgress):void{const saved=progress.activitySave;if(saved){this.s.guardUntil=saved.guardUntil;this.s.guardSpent=saved.guardSpent;this.s.prepared=saved.prepared;}}
 prepare(p:CharacterProfile,start:boolean):void{
  const prepared=this.s.prepared,serial=this.s.serial+1;this.engine.remove(this.actor.id);this.engine.add(this.actor);this.s=this.fresh(p);this.s.serial=serial;this.s.prepared=prepared;this.credit=false;this.actions=[];
  Object.assign(this.actor,{...CHAPTER_WORLD.spawn,direction:'north',hp:100,mp:100,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,motionLocked:false,dashVX:0,dashVY:0,castId:'',castSkill:'',castStartedAt:0});
  if(!start)return;
  this.s.status='running';
  const c=p.chapter??initialChapter(),q=c.activity;
  if(q==='EX03')return;
  const phase=q==='HN10'?c.checkpoint+1:q==='HN05'?1:2,hp=phase===1?60:phase===2?80:240;
  const target:TrainingTarget={id:`chapter-${p.id}-${q}-${c.checkpoint}-${serial}`,ownerId:this.actor.id,...CHAPTER_WORLD.enemy,hp,maxHp:hp,radius:phase===3?24:18};
  this.engine.targets.set(target.id,target);
  this.s.enemyPose={actor:phase===3?'boss':'wolf',action:phase===3?'appear':'idle',at:this.engine.now,dx:0,dy:1,lifeId:target.id};
 }
 pause():void{this.pausedAt=Date.now();this.actor.moving=false;delete this.s.combo;this.actions=[];}
 resume(p:CharacterProfile,now:number):void{
  if(this.pausedAt&&Date.now()-this.pausedAt>30000)this.prepare(p,false);
  else if(this.pausedAt){const shift=now-this.engine.now,snap=this.engine.checkpoint(this.actor.id);this.engine.now=now;this.shift(shift);this.engine.restore(this.actor.id,snap,shift);
   for(const k of ['nextSwordAt','nextThunderAt','nextWindAt','lastSpentAt'] as const)if(this.actor[k])this.actor[k]+=shift;
   if(p.chapter?.guardReadyAt)p.chapter.guardReadyAt+=shift;
  }
  this.pausedAt=0;
 }
 private onHit(e:SkillEvent,p:CharacterProfile):void{if(e.type!=='hit'||this.s.status!=='running')return;this.hitCredit(p);this.keepLessonTarget(p);this.enemyHit();}
 private keepLessonTarget(p:CharacterProfile):void{if(p.chapter?.activity==='HN08'||p.chapter?.activity==='HN07'&&!this.credit)for(const t of this.engine.targets.values())t.hp=t.maxHp;}
 private hitCredit(p:CharacterProfile):void{
  if(p.chapter?.activity!=='HN07'){this.credit=true;return;}
  if(p.avatarId==='CHR-SITU-NAN'?this.stableReady(p):this.s.ai.stage==='recovery'&&(p.avatarId!=='CHR-LI-MUWAN'||this.s.prepared))this.credit=true;
 }
 basic(p:CharacterProfile,aim:Input,id=`basic-${this.s.serial}-${this.engine.now}`,held:Input={x:0,y:0}):boolean{
  if(this.s.status!=='running'||this.actor.castId||this.actor.hp<=0||this.s.nextBasicAt>this.engine.now||!this.engine.targets.size)return false;
  const len=Math.hypot(aim.x,aim.y);if(!len)return false;
  const now=this.engine.now,index=p.avatarId==='CHR-WANG-LIN-CHIBI'&&this.s.combo&&now<=this.s.combo.until?(this.s.combo.index+1)%3:0,action=BASIC_ACTIONS[index],timing=BASIC_RULES.timing[action];
  this.s.nextBasicAt=now+BASIC_RULES.cooldownMs;this.s.combo={index,until:now+BASIC_RULES.comboWindowMs};
  this.s.basic={id,action,startedAt:now,at:now+timing.release,endAt:now+timing.end,dx:aim.x/len,dy:aim.y/len,released:false,held:{x:held.x,y:held.y}};
  this.actor.motionLocked=true;this.actor.moving=false;this.actions.push(this.fact('start',this.s.basic as BasicStrike,now));return true;
 }
 private fact(type:ActorActionFact['type'],b:BasicStrike,at:number):ActorActionFact{return {type,strikeId:b.id,actorId:this.actor.id,action:b.action,at,x:this.actor.x,y:this.actor.y,dx:b.dx,dy:b.dy};}
 flushActions(){for(const e of this.actions)this.actionEvent(e);this.actions=[];}
 movement(input:Input){const b=this.s.basic as BasicStrike|undefined;if(b&&!b.released&&(input.x||input.y)&&(input.x!==(b.held?.x??0)||input.y!==(b.held?.y??0)))this.cancelBasic();}
 cancelBasic(){const b=this.s.basic as BasicStrike|undefined;if(b?.id)this.actions.push(this.fact('cancel',b,this.engine.now));delete this.s.basic;delete this.s.combo;if(!this.actor.castId)this.actor.motionLocked=false;}
 get basicLocked(){return !!this.s.basic;}
 private enemyHit(){const enemy=[...this.engine.targets.values()][0];if(!enemy)return;const boss=enemy.maxHp===240;
  if(enemy.hp<=0)this.s.enemyPose={actor:boss?'boss':'wolf',action:'death',at:this.engine.now,dx:this.s.ai.dx,dy:this.s.ai.dy,lifeId:enemy.id};
  else if(this.s.ai.stage!=='warning')this.s.enemyPose={actor:boss?'boss':'wolf',action:'hit',at:this.engine.now,dx:this.s.ai.dx,dy:this.s.ai.dy,lifeId:enemy.id};
 }
 before(dt:number):void{if(!this.actor.connected||this.pausedAt)return;this.engine.prepare(dt);}
 after(dt:number,p:CharacterProfile):'proof'|'failed'|undefined{
  if(!this.actor.connected||this.pausedAt)return;
  const now=this.engine.now,c=p.chapter!;
  const stableNodes=c.activity==='EX03'?['observe-a','observe-b']:['stable'];
  const near=CHAPTER_WORLD.nodes.some(n=>stableNodes.includes(n.id)&&Math.hypot(n.x-this.actor.x,n.y-this.actor.y)<=56);
  if(near&&!this.actor.moving){if(!this.s.stableSince)this.s.stableSince=now;}else this.s.stableSince=0;
  if(c.activity==='HN07'&&this.s.stableSince&&now-this.s.stableSince>=2000)this.s.stabilized=true;
  if(this.s.status!=='running'){this.engine.finish(dt);return;}
  const enemy=[...this.engine.targets.values()][0];
  if(enemy){
   // Enemy resolve precedes player hits within this tick; a lethal player hit cannot revive a defeated actor.
   this.advanceEnemy(enemy,p,dt);
   if(this.s.basic&&now>=this.s.basic.at&&!this.s.basic.released){const b=this.s.basic as BasicStrike;this.s.basic.released=true;const dx=enemy.x-this.actor.x,dy=enemy.y-this.actor.y,d=Math.hypot(dx,dy);
    if(this.actor.hp>0){this.actions.push(this.fact('release',b,b.at));
     if(d<=BASIC_RULES.range+enemy.radius&&(d<.01||(dx*b.dx+dy*b.dy)/d>=BASIC_RULES.coneCos)){enemy.hp=Math.max(0,enemy.hp-BASIC_RULES.damage);this.actor.practiceHits++;this.hitCredit(p);this.keepLessonTarget(p);this.enemyHit();
      this.actions.push({...this.fact('hit',b,now),targetId:enemy.id,targetX:enemy.x,targetY:enemy.y,targetHeight:enemy.maxHp===240?52:26});}
    }
   }
   if(this.s.basic?.endAt!==undefined&&now>=this.s.basic.endAt){delete this.s.basic;if(!this.actor.castId)this.actor.motionLocked=false;}
  }
  this.engine.finish(dt);
  if(this.actor.hp<=0){this.stop('failed');this.flushActions();return 'failed';}
  if(c.activity==='HN07'&&this.credit||c.activity==='HN08'&&this.s.guardSpent||['HN05','HN09','HN10'].includes(c.activity)&&enemy&&enemy.hp<=0&&this.credit){this.stop('won');this.flushActions();return 'proof';}
  this.flushActions();
 }
 stop(status:ChapterActivitySave['status']):void{this.s.status=status;this.engine.cancel(this.actor.id);this.engine.projectiles.clear();if(this.s.basic&&!this.s.basic.released)this.cancelBasic();else delete this.s.basic;delete this.s.combo;this.actor.motionLocked=false;this.actor.dashVX=this.actor.dashVY=0;}
 stableReady(p:CharacterProfile):boolean{return p.chapter?.activity==='HN07'&&!!this.s.stabilized||this.s.stableSince>0&&this.engine.now-this.s.stableSince>=2000;}
 view(p:CharacterProfile):ChapterView{
  const c=p.chapter??initialChapter(),a=this.s.ai,enemy=[...this.engine.targets.values()][0];
  return {progress:structuredClone(c),available:chapterAvailable(p),status:this.s.status,enemy,stableReady:this.stableReady(p),prepared:this.s.prepared,guardUntil:this.s.guardUntil,now:this.engine.now,hint:chapterHint(c,p.avatarId),basic:this.s.basic?.id?{...this.s.basic} as BasicStrike:undefined,enemyPose:this.s.enemyPose?{...this.s.enemyPose}:undefined,
   ...(this.s.status==='running'&&a.stage==='warning'?{warning:{shape:a.shape,x:a.x,y:a.y,dx:a.dx,dy:a.dy,radius:a.shape==='circle'?44:90,length:320,width:56,resolveAt:a.at+(a.shape==='fan'?1000:1200),pulses:a.double?2:1}}:{})};
 }
 private advanceEnemy(enemy:TrainingTarget,p:CharacterProfile,dt:number):void{
  const now=this.engine.now,a=this.s.ai,dx=this.actor.x-enemy.x,dy=this.actor.y-enemy.y,d=Math.hypot(dx,dy)||1,boss=enemy.maxHp===240;
  if(enemy.hp<=0)return;
  if(boss&&this.s.enemyPose?.action==='appear'&&now-this.s.enemyPose.at<900)return;
  const pose=(action:NonNullable<ChapterActivitySave['enemyPose']>['action'],at=now)=>{const previous=this.s.enemyPose;if(previous?.action==='hit'&&now-previous.at<200)return;
   if(previous?.action!==action)this.s.enemyPose={actor:boss?'boss':'wolf',action,at,dx:dx/d,dy:dy/d,lifeId:enemy.id};else if(action==='walk'||action==='idle'){previous.dx=dx/d;previous.dy=dy/d;}};
  // Private encounter leash: return safely when the player leaves detection range; no kill/reward.
  if(a.stage==='approach'&&d>520){const rx=CHAPTER_WORLD.enemy.x-enemy.x,ry=CHAPTER_WORLD.enemy.y-enemy.y,r=Math.hypot(rx,ry);
   pose(r>2?'walk':'idle');if(r>2){const step=Math.min(70*dt,r);enemy.x+=rx/r*step;enemy.y+=ry/r*step;if(this.s.enemyPose){this.s.enemyPose.dx=rx/r;this.s.enemyPose.dy=ry/r;}}return;}
  if(a.stage==='approach'){
   const fan=enemy.maxHp===60||boss&&a.turn%3===2;
   if(d>(fan?85:320)){
    const speed=fan?85:70,step=Math.min(speed*dt,Math.max(0,d-40)),point={x:enemy.x+dx/d*step,y:enemy.y+dy/d*step};
    if(chapterWalkable(point,enemy.radius))Object.assign(enemy,point);pose('walk');return;
   }
   a.stage='warning';a.at=now;a.locked=false;a.pulses=0;a.shape=fan?'fan':boss?a.turn%3===0?'line':'circle':a.turn%2===0?'circle':'line';
   a.double=boss&&enemy.hp<=120&&a.shape==='line';
  }
  if(a.stage==='warning'){
   const age=now-a.at;
   if(!a.locked){a.dx=dx/d;a.dy=dy/d;a.x=a.shape==='circle'?this.actor.x:enemy.x;a.y=a.shape==='circle'?this.actor.y:enemy.y;if(age>=200)a.locked=true;}
   pose(a.shape==='fan'?'attack':a.shape==='line'?'cast_line':'cast_field',a.at);
   if(this.s.enemyPose){this.s.enemyPose.dx=a.dx;this.s.enemyPose.dy=a.dy;this.s.enemyPose.releaseAt=a.at+(a.shape==='fan'?1000:1200);}
   const first=a.shape==='fan'?1000:1200,count=a.double?2:1;
   while(a.pulses<count&&age>=first+a.pulses*600){a.pulses++;
    const x=this.actor.x-a.x,y=this.actor.y-a.y,distance=Math.hypot(x,y),along=x*a.dx+y*a.dy,side=Math.abs(x*a.dy-y*a.dx);
    const hit=a.shape==='circle'?distance<=44+8:a.shape==='line'?along>=-8&&along<=328&&side<=28+8:distance<=98&&(distance<8||along/distance>=Math.cos(35*Math.PI/180));
    if(hit&&p.chapter!.activity!=='HN07'){
     let damage=enemy.maxHp===60?10:15;
     if(this.s.guardUntil>=now&&!this.s.guardSpent){damage*=.5;this.s.guardSpent=true;}
     this.actor.hp=Math.max(0,this.actor.hp-damage);
    }
   }
   if(a.pulses===count){a.stage='recovery';a.at=now;}
  }else if(a.stage==='recovery'){if(now-a.at>=600)pose('idle');if(now-a.at>=1400){a.stage='approach';a.at=now;a.turn++;}}
 }
}
