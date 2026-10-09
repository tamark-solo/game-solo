import type { CharacterProfile } from '../../shared/profiles';
import type { CombatActor } from '../../shared/r01';
import { CULTIVATION_GATE, LEVEL_THRESHOLDS, nearStation, type SectCommand, type SectResult, type SectView } from '../../shared/sect';

export const isPractising = (actor: CombatActor, now: number, projectile = false): boolean =>
  !!actor.castId || projectile || now < actor.lastSpentAt+2000;
export function sectView(profile: CharacterProfile, actor: CombatActor, now: number, readyAt: number, projectile = false): SectView {
  const t=profile.sect, busy=isPractising(actor,now,projectile);
  return { ...t, profileId:profile.id, cultivation:profile.cultivation, milestone:profile.milestone, savedAt:profile.updatedAt,hp:actor.hp,practising:busy,
    activityStatus: !t.hn02?'locked':!t.activity?'stopped':!actor.connected?'offline':profile.cultivation>=CULTIVATION_GATE?'gate':busy?'paused':'running',
    cycleStatus: t.hn02?'complete':t.cycleStep===4?'confirm':!readyAt?'idle':!nearStation(actor,'cultivation')?'away':busy?'combat':
      actor.moving||readyAt>now?'settling':'ready', cycleReadyAt:readyAt };
}
export function advanceCultivation(profile: CharacterProfile, actor: CombatActor, dt: number, now: number, projectile = false): void {
  const t=profile.sect;
  if (!t.hn02 || !t.activity || !actor.connected || actor.hp<=0 || isPractising(actor,now,projectile) || profile.cultivation>=CULTIVATION_GATE) return;
  // 120/minute: one point per 500 valid server milliseconds. No wall-clock/offline catch-up.
  t.remainderMs+=Math.max(0,Math.min(dt,.1))*1000;
  const points=Math.min(CULTIVATION_GATE-profile.cultivation,Math.floor((t.remainderMs+1e-7)/500));
  profile.cultivation+=points; t.remainderMs=Math.max(0,t.remainderMs-points*500);
  if (profile.cultivation>=CULTIVATION_GATE) t.remainderMs=0;
}
export function performSectCommand(profile: CharacterProfile, actor: CombatActor, command: SectCommand, now: number, readyAt: number, projectile = false):
  { result:SectResult; candidate?:CharacterProfile; startCycle?:boolean; finishCycle?:boolean } {
  const reject=(reason:string)=>({result:{requestId:command.id,ok:false,reason}});
  if (!actor.connected || actor.hp<=0) return reject('inactive');
  const station = command.action==='talk'?command.stationId:command.action==='accept_intro'?'guide':
    ['cycle_start','cycle_step','understanding','confirm_m01','activity_start','confirm_level'].includes(command.action)?'cultivation':undefined;
  if (station && !nearStation(actor,station)) return reject('distance');
  if (command.action==='talk') return {result:{requestId:command.id,ok:true,stationId:command.stationId}};
  if (command.action!=='activity_stop' && isPractising(actor,now,projectile)) return reject('combat');
  const p={...profile,sect:{...profile.sect}},t=p.sect;
  const accepted=(extra:{startCycle?:boolean;finishCycle?:boolean}={})=>({result:{requestId:command.id,ok:true},candidate:p,...extra});
  const already=()=>({result:{requestId:command.id,ok:true,reason:'already_complete'}});
  switch(command.action){
    case 'accept_intro':
      if(t.hn01) return already();
      t.hn01=true;t.supplies+=2;return accepted();
    case 'cycle_start':
      if(!t.hn01) return reject('hn01');
      if(t.hn02) return already();
      t.foundation=p.avatarId==='CHR-SITU-NAN'?'spirit':'breathing';return accepted({startCycle:true});
    case 'cycle_step':
      if(t.hn02) return already();
      if(t.foundation==='none'||!readyAt) return reject('cycle_start');
      if(command.step!==t.cycleStep) return reject('phase');
      if(actor.moving||readyAt>now) return reject('settling');
      t.cycleStep++;return accepted({startCycle:true});
    case 'understanding':
      if(t.hn02) return already();
      if(t.cycleStep!==3) return reject('phase');
      if(command.answer!=='cultivation') return reject('understanding');
      t.cycleStep=4;return accepted();
    case 'confirm_m01':
      if(t.hn02) return already();
      if(t.cycleStep!==4) return reject('understanding');
      t.hn02=true;t.level=1;p.milestone='M01';p.cultivation+=100;return accepted({finishCycle:true});
    case 'activity_start':
      if(!t.hn02) return reject('hn02');
      if(t.activity) return already();
      t.activity=true;return accepted();
    case 'activity_stop':
      if(!t.activity) return already();
      t.activity=false;return accepted();
    case 'confirm_level':{
      if(!t.hn02) return reject('hn02');
      if(t.level>=3) return reject('gate');
      if(command.level!==t.level) return reject('phase');
      if(p.cultivation<LEVEL_THRESHOLDS[t.level+1]!) return reject('cultivation');
      t.level++;return accepted();
    }
    case 'use_recovery':
      if(!t.supplies) return reject('supplies');
      if(t.nextRecoveryAt>now) return reject('cooldown');
      if(actor.hp>=100) return reject('full_hp');
      t.supplies--;t.nextRecoveryAt=now+10000;p.hp=Math.min(100,actor.hp+30);return accepted();
  }
}
