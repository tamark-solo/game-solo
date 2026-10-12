import { ServerError, type Client } from 'colyseus';
import { CourtyardRoom } from './rooms/courtyard/room';
import { HANG_NHAC, HANG_NHAC_AVATARS, hangNhacSpawn, hangNhacWalkable } from '../../shared/hang-nhac';
import type { MovementState } from '@shared/world/movement';
import type { MoveInput } from '@shared/protocol/input';
import { CHARACTER_INFO, cleanPlayerName, isAvatarId, type CharacterProfile } from '../../shared/profiles';
import { R01Engine, applyR01Movement, commandKey, readCastCommand, type CombatActor, type CastCommand, type CastResult } from '../../shared/r01';
import { DIRECTIONS, type Direction, type Input } from '@shared/world/types';
import { ProjectileState, TrainingTargetState, type Disciple } from '@shared/protocol/courtyard-state';
import type { ProfileStore, ProfileLeases } from './profile-store';
import type {ProfilePersistence,PlayGateway,PlayGrant} from './core/ports';
import {GameError} from './core/errors';
import { CYCLE_PHASE_MS, nearStation, readSectCommand, sectCommandKey, type SectResult } from '../../shared/sect';
import { cultivationMotion, type QuestMotionEvent } from '../../shared/quest-motion';
import { advanceCultivation, isPractising, performSectCommand, sectView } from './sect-progress';
import { characterItems,characterCommandKey,readCharacterCommand,type CharacterView,type CharacterResult } from '../../shared/character-inventory';
import { performCharacterCommand } from './character-inventory';
import { clearSectPath } from '../../shared/sect';
import type { SkillEvent } from '../../shared/skills/contracts';
import { observeAvoidMotion, observeAvoidSkill, resolveAvoidAttempt } from '../../shared/lesson-contracts';
import { basicDamage, copyLessonProfile, creditLessonHit, lessonView, performLessonCommand,
  type LessonRuntime, type LessonOutcome } from './training-lessons';
import {ChapterActivity} from './chapter-activity';
import type {ActorActionFact} from '../../shared/actor-actions';
import {chapterAvailable,performChapterCommand} from './chapter-progress';
import {CHAPTER_WORLD,applyChapterMovement,chapterCommandKey,initialChapter,readChapterCommand,type ChapterView,type ChapterResult} from '../../shared/chapter';
import {ownedItemId} from '../../shared/character-inventory';

interface ProfileAuth { accountId: string; profile: CharacterProfile; grant?:PlayGrant }

export class HangNhacRoom extends CourtyardRoom {
  private characterWatchers=new Set<string>();
  private characterSent=new Map<string,string>();
  private static store: ProfileStore;
  private static leases: ProfileLeases;
  private static gateway?:PlayGateway;
  private static allowGuest=true;
  private realmId?:string;
  private grants=new Map<string,PlayGrant>();
  private persistence=new Map<string,ProfilePersistence>();
  private nextAuthAt=0;
  static configure(store: ProfileStore, leases: ProfileLeases,gateway?:PlayGateway,allowGuest=true): void { this.store = store; this.leases = leases;this.gateway=gateway;this.allowGuest=allowGuest; }
  private storeFor(id:string):ProfilePersistence{return this.persistence.get(id)??HangNhacRoom.store;}
  private profiles = new Map<string, CharacterProfile>();
  private held = new Map<string, Input>();
  private pendingCasts=new Map<string,Array<{client:Client;command:CastCommand;expires:number}>>();
  private engine!: R01Engine;
  private activities=new Map<string,ChapterActivity>();
  private chapterSent=new Map<string,string>();
  private chapterWatchers=new Set<string>();
  private pendingBasics=new Map<string,Array<{client:Client;id:string;inputSeq:number;expires:number}>>();
  private engineFor(id:string):R01Engine{return this.activities.get(id)?.engine??this.engine;}
  private nextSaveAt = 0;
  private cycles = new Map<string,number>();
  private lessons = new Map<string,LessonRuntime>();
  private sectSent = new Map<string,string>();
  private sectWatchers = new Set<string>();
  private questLoops = new Map<string,QuestMotionEvent>();
  private nextSectAt = 0;
  onAuth(client: Client, options: Record<string, unknown>): boolean | ProfileAuth {
    if (!options || options.mapVersion !== HANG_NHAC.version) return false;
    if(options.entryTicket){
      try{
        if(!HangNhacRoom.gateway||options.realmId!==this.realmId)throw new ServerError(401,'Server vào game chưa hợp lệ.');
        const grant=HangNhacRoom.gateway.claim(options.entryTicket,options.realmId,client.sessionId);
        return {accountId:grant.accountId,profile:grant.profile,grant};
      }catch(error){if(error instanceof GameError)throw new ServerError(error.status,error.publicMessage);throw error;}
    }
    if(!HangNhacRoom.allowGuest||this.realmId)throw new ServerError(401,'Vui lòng đăng nhập và chọn nhân vật trước khi vào game.');
    // Token-free sessions retain the isolated movement fixture used by the foundation checks.
    if (!options.accountToken) return true;
    const accountId = HangNhacRoom.store.authenticate(options.accountToken);
    if (!accountId || !isAvatarId(options.avatarId)) throw new ServerError(401, 'Hồ sơ không hợp lệ.');
    if (!HangNhacRoom.leases.acquire(accountId, client.sessionId)) throw new ServerError(409, 'Hồ sơ đang được điều khiển ở tab khác. Rời sân tại tab đó trước.');
    try { return { accountId, profile: HangNhacRoom.store.get(accountId, options.avatarId) }; }
    catch (error) { HangNhacRoom.leases.release(accountId, client.sessionId); throw error; }
  }
  onCreate(options:Record<string,unknown>={}): void {
    this.realmId=typeof options.realmId==='string'?options.realmId:undefined;
    if(this.realmId)this.setMetadata({realmId:this.realmId});
    this.engine = new R01Engine(Date.now(), event => this.skillEvent(event), (actor, command, result) => this.commitCast(actor, command, result));
    super.onCreate();
    this.state.mapId = HANG_NHAC.id;
    this.state.mapVersion = HANG_NHAC.version;
    this.state.serverTime = this.engine.now;
    this.onMessage('chapter:sync',client=>{this.chapterWatchers.add(client.sessionId);this.sendChapter(client,true);});
    this.onMessage('chapter:command',(client,raw:unknown)=>this.chapterCommand(client,raw));
    this.onMessage('chapter:basic',(client,raw:unknown)=>this.chapterBasic(client,raw));
    this.onMessage('skill:cast', (client, raw: unknown) => {
      const command = readCastCommand(raw), actor = this.state.players.get(client.sessionId);
      if (!command || !actor) { client.send('skill:result', { accepted: false, reason: 'invalid' }); return; }
      const profile=this.profiles.get(client.sessionId);
      // Durable retries can outlive the input channel (reconnect/restart resets its sequence).
      if(profile&&this.storeFor(client.sessionId).receipt(profile.id,command.id)){this.cast(client,command);return;}
      const consumed=this.inputs.get(client.sessionId).consumedCount;
      if(command.inputSeq!==undefined&&command.inputSeq>consumed){
        const pending=this.pendingCasts.get(client.sessionId)??[];
        // The input buffer holds 64 entries; permit its next tick and enough time to drain at 30 Hz.
        if(command.inputSeq>consumed+65||pending.length>=8){client.send('skill:result',{requestId:command.id,accepted:false,reason:'input'});return;}
        pending.push({client,command,expires:this.engine.now+3000});this.pendingCasts.set(client.sessionId,pending);return;
      }
      this.cast(client,command);
    });
    this.onMessage('training:start', (client, raw: unknown) => {
      if(this.activities.has(client.sessionId)){client.send('training:result',{ok:false,reason:'lesson_active'});return;}
      if(this.lessons.has(client.sessionId)){client.send('training:result',{ok:false,reason:'lesson_active'});return;}
      const p = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      const valid = typeof p.x === 'number' && typeof p.y === 'number' && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1;
      const target = valid ? this.engine.practice(client.sessionId, { x: p.x as number, y: p.y as number }) : undefined;
      client.send('training:result', { ok: !!target, targetId: target?.id });
    });
    this.onMessage('profile:save', client => this.save(client.sessionId));
    this.onMessage('character:sync',client=>{this.characterWatchers.add(client.sessionId);this.sendCharacter(client,true);});
    this.onMessage('character:command',(client,raw:unknown)=>{
      const command=readCharacterCommand(raw),actor=this.state.players.get(client.sessionId),profile=this.profiles.get(client.sessionId);
      if(!command||!actor?.connected||!profile){client.send('character:result',{ok:false,reason:profile?'invalid':'profile'});return;}
      this.characterWatchers.add(client.sessionId);
      const key=characterCommandKey(command),old=this.storeFor(client.sessionId).characterReceipt(profile.id,command.id) as {command:string;result:CharacterResult}|undefined;
      if(old){client.send('character:result',old.command===key?{...old.result,duplicate:true}:{requestId:command.id,ok:false,reason:'request_reused'});this.sendCharacter(client,true);return;}
      const outcome=performCharacterCommand(this.snapshot(profile,actor),actor,command,this.engine.now,this.hasProjectile(actor.id));
      try{
        if(outcome.candidate){
          this.storeFor(client.sessionId).commitCharacter(outcome.candidate,command.id,{command:key,result:outcome.result});
          this.profiles.set(actor.id,outcome.candidate);actor.hp=outcome.candidate.hp;actor.savedAt=outcome.candidate.updatedAt;
        }
        client.send('character:result',outcome.result);
        if(outcome.result.ok&&command.action==='use')this.broadcast('sect:animation',{id:`character:${actor.id}:${command.id}`,actorId:actor.id,kind:'recovery',direction:actor.direction as Direction,at:this.engine.now} satisfies QuestMotionEvent);
      }catch{client.send('character:result',{requestId:command.id,ok:false,reason:'save'});}
      this.sendCharacter(client,true);this.sendSect(client,true);
    });
    this.onMessage('sect:sync',client=>{this.sectWatchers.add(client.sessionId);this.sendSect(client,true);for(const event of this.questLoops.values())client.send('sect:animation',event);});
    this.onMessage('sect:command',(client,raw:unknown)=>{
      const command=readSectCommand(raw),actor=this.state.players.get(client.sessionId),profile=this.profiles.get(client.sessionId);
      if(!command||!actor||!profile){client.send('sect:result',{ok:false,reason:profile?'invalid':'profile'});return;}
      this.sectWatchers.add(client.sessionId);
      const key=sectCommandKey(command);
      const old=this.storeFor(client.sessionId).sectReceipt(profile.id,command.id) as {command:string;result:SectResult}|undefined;
      if(old){client.send('sect:result',old.command===key?{...old.result,duplicate:true}:{requestId:command.id,ok:false,reason:'request_reused'});this.sendSect(client,true);return;}
      if(this.activities.has(actor.id)){client.send('sect:result',{requestId:command.id,ok:false,reason:'combat'});return;}
      const lessonCommand=command.action.startsWith('lesson_')||command.action==='basic_attack';
      const outcome:LessonOutcome&{startCycle?:boolean;finishCycle?:boolean}=lessonCommand?
        performLessonCommand(this.snapshot(profile,actor),actor,command,this.engine.now,this.engine.targets,this.lessons.get(actor.id),this.hasProjectile(actor.id)):
        performSectCommand(this.snapshot(profile,actor),actor,command,this.engine.now,this.cycles.get(actor.id)??0,this.hasProjectile(actor.id));
      try {
        if(outcome.candidate){
          this.storeFor(client.sessionId).commitSect(outcome.candidate,command.id,{command:key,result:outcome.result});
          this.profiles.set(actor.id,outcome.candidate);actor.hp=outcome.candidate.hp;actor.savedAt=outcome.candidate.updatedAt;
          if(outcome.startCycle)this.cycles.set(actor.id,this.engine.now+CYCLE_PHASE_MS);
          if(outcome.finishCycle)this.cycles.delete(actor.id);
          if(outcome.stop||outcome.start)this.clearLesson(actor.id);
          if(outcome.start)this.lessons.set(actor.id,outcome.start);
          if(outcome.target){this.engine.targets.set(outcome.target.id,outcome.target);client.send('training:result',{ok:true,targetId:outcome.target.id});}
          if(outcome.basicTarget){outcome.basicTarget.hp=Math.max(0,outcome.basicTarget.hp-basicDamage);actor.practiceHits=outcome.candidate.practiceHits;}
        }
        client.send('sect:result',outcome.result);
        if(outcome.result.ok&&outcome.result.reason!=='already_complete'){
          const kind=command.action==='basic_attack'?'basic':command.action==='use_recovery'?'recovery':
            command.action==='accept_intro'||command.action==='talk'?'greeting':undefined;
          if(kind){
            const target=outcome.basicTarget,dx=target?target.x-actor.x:0,dy=target?target.y-actor.y:1;
            const direction:Direction=Math.abs(dx)>Math.abs(dy)?dx>0?'east':'west':dy<0?'north':'south';
            this.broadcast('sect:animation',{id:`${actor.id}:${command.id}`,actorId:actor.id,kind,direction,at:this.engine.now} satisfies QuestMotionEvent);
            if(kind==='basic'&&target){const length=Math.hypot(dx,dy)||1,base={strikeId:actor.id+':'+command.id,actorId:actor.id,action:'attack' as const,at:this.engine.now,x:actor.x,y:actor.y,dx:dx/length||0,dy:dy/length||(dx?0:1)};
              this.actorAction({...base,type:'start'});this.actorAction({...base,type:'release'});this.actorAction({...base,type:'hit',targetId:target.id,targetX:target.x,targetY:target.y,targetHeight:26});}

          }
        }
      }catch{client.send('sect:result',{requestId:command.id,ok:false,reason:'save'});}
      this.sendSect(client,true);
    });
  }
  onJoin(client: Client, options: unknown): void {
    const auth = client.auth as ProfileAuth | boolean;
    const profile = auth && typeof auth === 'object' ? auth.profile : undefined;
    const grant=auth&&typeof auth==='object'?auth.grant:undefined;
    super.onJoin(client, grant?{avatarId:profile!.avatarId,name:profile!.name}:options);
    const actor = this.state.players.get(client.sessionId)!;
    if(grant){this.grants.set(client.sessionId,grant);this.persistence.set(client.sessionId,grant.persistence);}
    actor.id = client.sessionId; actor.profileId = profile?.id ?? `temporary-${client.sessionId}`;
    actor.progressionKind = CHARACTER_INFO[actor.avatarId as keyof typeof CHARACTER_INFO].progressionKind;
    actor.hp = actor.mp = 100; actor.casts = actor.practiceHits = actor.savedAt = 0;
    actor.nextSwordAt = actor.nextThunderAt = actor.nextWindAt = actor.lastSpentAt = 0;
    actor.castId = actor.castSkill = ''; actor.castStartedAt = actor.castAimX=actor.castAimY=0; actor.motionLocked = false; actor.dashVX = actor.dashVY = 0;
    if (profile) {
      if (profile.revision>0 && profile.mapId === HANG_NHAC.id && hangNhacWalkable(profile)) { actor.x = profile.x; actor.y = profile.y; }
      actor.direction = DIRECTIONS.includes(profile.direction as Direction) ? profile.direction : 'south';
      const fallback={south:[0,1],north:[0,-1],west:[-1,0],east:[1,0]}[actor.direction]??[0,1];
      actor.facingX=profile.facing?.x??fallback[0];actor.facingY=profile.facing?.y??fallback[1];
      const data = options as Record<string, unknown>;
      actor.name = grant?profile.name:cleanPlayerName(data.name, profile.name);
      for (const key of ['hp','mp','casts','practiceHits','nextSwordAt','nextThunderAt','nextWindAt','lastSpentAt'] as const) actor[key] = profile[key];
      this.profiles.set(client.sessionId, profile);if(!grant)HangNhacRoom.leases.activate(profile.accountId, client.sessionId);
    }
    actor.scene='hub';
    if(profile?.chapter&&profile.chapter.scene!=='hub'){
      this.activities.set(actor.id,new ChapterActivity(actor,profile,this.engine.now,e=>this.privateSkill(e),(a,c,r)=>this.commitCast(a,c,r),e=>this.actorAction(e)));actor.scene=actor.id;
    }else this.engine.add(actor as CombatActor);
    this.save(client.sessionId);
  }
  protected get avatars(): readonly string[] { return HANG_NHAC_AVATARS; }
  protected reconnectWindow(id:string):number{return this.profiles.get(id)?.chapter?.activity==='HN10'?30:super.reconnectWindow(id);}
  protected get simulateWithoutInput(): boolean { return true; }
  protected spawn(slot: number): { x: number; y: number } {
    for (let offset=0;offset<this.maxClients;offset++) {
      const point=hangNhacSpawn((slot+offset)%this.maxClients);
      if ([...this.state.players.values()].every(p=>Math.hypot(p.x-point.x,p.y-point.y)>=30)) return point;
    }
    return hangNhacSpawn(slot);
  }
  protected stepMovement(player: MovementState, input: MoveInput, dt: number): void {
    const actor = player as Disciple, command = { x: input.moveX, y: input.moveY };
    this.engineFor(actor.id).movement(actor.id, command); this.held.set(actor.id, command);
    this.activities.get(actor.id)?.movement(command);
    if(actor.hp>0&&Math.hypot(command.x,command.y)>.001&&!actor.motionLocked){const length=Math.hypot(command.x,command.y);actor.facingX=command.x/length;actor.facingY=command.y/length;}
    (this.activities.has(actor.id)?applyChapterMovement:applyR01Movement)(actor,input,dt);
  }
  protected stepWithoutInput(player: MovementState, dt: number): void {
    // A missing packet stops walking but is not a newly released keyboard command.
    (this.activities.has((player as Disciple).id)?applyChapterMovement:applyR01Movement)(player as Disciple, { moveX:0,moveY:0 }, dt);
  }
  protected beforeSimulation(dt: number): void {
    this.engine.prepare(dt);
    for(const activity of this.activities.values())activity.before(dt);
    if(Date.now()<this.nextAuthAt)return;this.nextAuthAt=Date.now()+1000;
    for(const [id,grant] of this.grants){
      const actor=this.state.players.get(id),client=this.clients.find(value=>value.sessionId===id);
      if(actor?.connected&&!HangNhacRoom.gateway?.renew(grant,id)){
        actor.connected=false;this.stop(id);this.engine.cancel(id);this.pendingCasts.delete(id);this.pendingBasics.delete(id);this.save(id);
        client?.send('entry:revoked',{message:'Phiên điều khiển đã kết thúc. Vui lòng kiểm tra tài khoản và server.'});client?.leave(4000);
      }
    }
  }
  protected afterSimulation(dt: number): void {
    // Match a skill to the consumed movement stream, so movement + cast in one frame does not self-cancel.
    for(const [id,requests] of this.pendingCasts){
      const consumed=this.inputs.get(id).consumedCount,waiting:typeof requests=[];
      for(const request of requests){
        if(request.command.inputSeq!<=consumed)this.cast(request.client,request.command);
        else if(this.engine.now>=request.expires)request.client.send('skill:result',{requestId:request.command.id,accepted:false,reason:'input'});
        else waiting.push(request);
      }
      if(waiting.length)this.pendingCasts.set(id,waiting);else this.pendingCasts.delete(id);
    }
    this.engine.finish(dt); this.state.serverTime = this.engine.now;
    for(const [id,pending]of this.pendingBasics){const consumed=this.inputs.get(id).consumedCount,waiting:typeof pending=[];
      for(const request of pending){if(request.inputSeq<=consumed)this.chapterBasic(request.client,{id:request.id});else if(this.engine.now>=request.expires)request.client.send('chapter:result',{requestId:request.id,ok:false,reason:'input'});else waiting.push(request);}
      if(waiting.length)this.pendingBasics.set(id,waiting);else this.pendingBasics.delete(id);
    }
    for(const [id,activity] of this.activities){const p=this.profiles.get(id);if(!p)continue;activity.after(dt,p);this.finishChapterActivity(id,activity);}
    this.advanceLessons(dt);
    const targets=new Map(this.engine.targets),projectiles=new Map(this.engine.projectiles);
    for(const a of this.activities.values()){for(const [id,t] of a.engine.targets)targets.set(id,t);for(const [id,p] of a.engine.projectiles)projectiles.set(id,p);}
    for (const [id, target] of targets) {
      let value = this.state.targets.get(id); if (!value) { value = new TrainingTargetState(); this.state.targets.set(id, value); } Object.assign(value, target);
    }
    for (const id of this.state.targets.keys()) if (!targets.has(id)) this.state.targets.delete(id);
    for (const [id, projectile] of projectiles) {
      let value = this.state.projectiles.get(id); if (!value) { value = new ProjectileState(); this.state.projectiles.set(id, value); } Object.assign(value, projectile);
    }
    for (const id of this.state.projectiles.keys()) if (!projectiles.has(id)) this.state.projectiles.delete(id);
    for(const [id,profile] of this.profiles){
      const actor=this.state.players.get(id);if(!actor)continue;
      const projectile=this.hasProjectile(id);
      if(this.cycles.has(id)&&(!actor.connected||actor.moving||!nearStation(actor,'cultivation')||isPractising(actor,this.engine.now,projectile,profile.sect.lessons.nextBasicAt)))
        this.cycles.set(id,this.engine.now+CYCLE_PHASE_MS);
      advanceCultivation(profile,actor,dt,this.engine.now,projectile);
    }
    if (this.engine.now >= this.nextSaveAt) { this.nextSaveAt = this.engine.now + 1000; for (const id of this.profiles.keys()) this.save(id); }
    if(this.engine.now>=this.nextSectAt){this.nextSectAt=this.engine.now+250;for(const client of this.clients){this.sendSect(client);this.sendCharacter(client);this.sendChapter(client);}}
  }
  private clearLesson(id:string):void {
    const runtime=this.lessons.get(id);if(runtime?.kind==='arts')this.engine.targets.delete(runtime.targetId);
    this.lessons.delete(id);
  }
  private persistLesson(id:string,candidate:CharacterProfile):boolean {
    try {
      this.storeFor(id).save(candidate);this.profiles.set(id,candidate);
      const actor=this.state.players.get(id);if(actor)actor.savedAt=candidate.updatedAt;
      return true;
    }catch{this.clients.find(client=>client.sessionId===id)?.send('sect:result',{ok:false,reason:'save'});return false;}
  }
  private skillEvent(event:SkillEvent):void {
    const runtime=this.lessons.get(event.actorId);
    if(runtime?.kind==='avoid'&&runtime.status==='warning')observeAvoidSkill(runtime.attempt,event);
    const profile=this.profiles.get(event.actorId),actor=this.state.players.get(event.actorId);
    if(profile&&actor){const candidate=creditLessonHit(this.snapshot(profile,actor),runtime,event);if(candidate)this.persistLesson(actor.id,candidate);}
    this.broadcast('skill:event',event);
  }
  private advanceLessons(dt:number):void {
    for(const [id,runtime] of this.lessons){
      if(runtime.kind!=='avoid'||runtime.status!=='warning')continue;
      const actor=this.state.players.get(id),profile=this.profiles.get(id);if(!actor||!profile)continue;
      const attempt=runtime.attempt;
      observeAvoidMotion(attempt,actor,actor.moving,!!actor.dashVX||!!actor.dashVY,dt);
      const result=resolveAvoidAttempt(attempt,actor,this.engine.now,actor.connected,
        clearSectPath(attempt.center,actor)&&Math.hypot(actor.x-attempt.center.x,actor.y-attempt.center.y)<=240);
      if(result==='pending')continue;
      runtime.status=result;
      if(result==='passed'){
        const candidate=copyLessonProfile(this.snapshot(profile,actor));candidate.sect.lessons[attempt.method]=true;
        if(!this.persistLesson(id,candidate))runtime.status='save_failed';
      }
    }
  }
  private hasProjectile(id:string):boolean {return [...this.engineFor(id).projectiles.values()].some(p=>p.ownerId===id);}
  private cast(client:Client,command:CastCommand):void {
    const actor=this.state.players.get(client.sessionId);if(!actor?.connected){client.send('skill:result',{requestId:command.id,accepted:false,reason:'inactive'});return;}
    const profile=this.profiles.get(client.sessionId);
    if(profile&&!profile.skills.includes(command.skillId)){client.send('skill:result',{requestId:command.id,accepted:false,reason:'rights'});return;}
    const old=profile?this.storeFor(client.sessionId).receipt(profile.id,command.id) as {command:string;result:CastResult}|undefined:undefined;
    if(!old&&this.activities.get(actor.id)?.basicLocked){client.send('skill:result',{requestId:command.id,accepted:false,reason:'active'});return;}
    if(!old&&this.activities.has(actor.id)&&this.activities.get(actor.id)!.view(profile!).status!=='running'){client.send('skill:result',{requestId:command.id,accepted:false,reason:'inactive'});return;}
    const result=old?old.command===commandKey(command)?{...old.result,duplicate:true}:{requestId:command.id,accepted:false,reason:'request_reused'}:
      this.engineFor(client.sessionId).cast(client.sessionId,command,this.held.get(client.sessionId));
    client.send('skill:result',result);
  }
  private sendSect(client:Client,force=false):void {
    if(!force&&!this.sectWatchers.has(client.sessionId))return;
    const profile=this.profiles.get(client.sessionId),actor=this.state.players.get(client.sessionId);if(!profile||!actor?.connected)return;
    const view={...sectView(profile,actor,this.engine.now,this.cycles.get(actor.id)??0,this.hasProjectile(actor.id)),
      lessonView:lessonView(this.lessons.get(actor.id))},key=JSON.stringify(view);
    if(force||this.sectSent.get(actor.id)!==key){client.send('sect:state',view);this.sectSent.set(actor.id,key);}
    const active=cultivationMotion(view,actor.moving),previous=this.questLoops.get(actor.id);
    if(active&&!previous){const event:QuestMotionEvent={id:`loop:${actor.id}:${this.engine.now}`,actorId:actor.id,kind:'cultivation',direction:'south',at:this.engine.now};
      this.questLoops.set(actor.id,event);this.broadcast('sect:animation',event);
    }else if(!active&&previous)this.stopQuestLoop(actor.id);
  }
  private sendCharacter(client:Client,force=false):void{
    if(!force&&!this.characterWatchers.has(client.sessionId))return;
    const profile=this.profiles.get(client.sessionId),actor=this.state.players.get(client.sessionId);if(!profile||!actor?.connected)return;
    const view:CharacterView={profileId:profile.id,avatarId:profile.avatarId,name:actor.name,hp:actor.hp,mp:actor.mp,maxHp:100,maxMp:100,skills:[...profile.skills],
      items:characterItems(profile),equipment:{...profile.inventory.equipment,...(profile.chapter?.jadeEquipped?{charm:ownedItemId(profile.id,'hn-training-jade')}:{})},sect:{...sectView(profile,actor,this.engine.now,this.cycles.get(actor.id)??0,this.hasProjectile(actor.id)),lessonView:lessonView(this.lessons.get(actor.id))},
      serverNow:this.engine.now,savedAt:profile.updatedAt,revision:profile.revision};
    const key=JSON.stringify({...view,serverNow:0});
    if(force||this.characterSent.get(actor.id)!==key){client.send('character:state',view);this.characterSent.set(actor.id,key);}
  }
  private stopQuestLoop(id:string):void {
    if(this.questLoops.delete(id))this.broadcast('sect:animation',{id:`idle:${id}:${this.engine.now}`,actorId:id,kind:'idle',direction:'south',at:this.engine.now} satisfies QuestMotionEvent);
  }
  private privateSkill(event:SkillEvent):void{this.clients.find(c=>c.sessionId===event.actorId)?.send('skill:event',event);}
  private chapterView(profile:CharacterProfile,id:string):ChapterView{
    return this.activities.get(id)?.view(profile)??{progress:structuredClone(profile.chapter??initialChapter()),available:chapterAvailable(profile),status:'ready',stableReady:false,prepared:false,guardUntil:0,now:this.engine.now,hint:'Nhận và xác nhận tại NPC tương ứng. Nguyên liệu và công thức nằm ở người coi chuẩn bị.'};
  }
  private sendChapter(client:Client,force=false):void{
    if(!force&&!this.chapterWatchers.has(client.sessionId))return;
    const p=this.profiles.get(client.sessionId),a=this.state.players.get(client.sessionId);if(!p||!a?.connected)return;
    const view=this.chapterView(p,a.id),key=JSON.stringify({...view,now:view.status==='running'?Math.floor(view.now/100):0});
    if(force||this.chapterSent.get(a.id)!==key){client.send('chapter:state',view);this.chapterSent.set(a.id,key);}
  }
  private chapterCommand(client:Client,raw:unknown):void{
    const cmd=readChapterCommand(raw),actor=this.state.players.get(client.sessionId),profile=this.profiles.get(client.sessionId);
    if(!cmd||!actor?.connected||!profile){client.send('chapter:result',{ok:false,reason:'invalid'});return;}
    this.chapterWatchers.add(actor.id);
    const key=chapterCommandKey(cmd),old=this.storeFor(actor.id).sectReceipt(profile.id,cmd.id) as {command:string;result:ChapterResult}|undefined;
    if(old){client.send('chapter:result',old.command===key?{...old.result,duplicate:true}:{requestId:cmd.id,ok:false,reason:'request_reused'});this.sendChapter(client,true);return;}
    const before=this.snapshot(profile,actor),actorBefore=actor.toJSON(),outcome=performChapterCommand(before,actor,cmd,this.engineFor(actor.id).now,this.chapterView(profile,actor.id));
    if(!outcome.candidate){client.send('chapter:result',outcome.result);this.sendChapter(client,true);return;}
    let candidate=outcome.candidate;
    try{
      const effect=outcome.effect;
      if(effect==='enter'){
        this.clearLesson(actor.id);this.engine.remove(actor.id);this.stopQuestLoop(actor.id);
        this.activities.set(actor.id,new ChapterActivity(actor,candidate,this.engine.now,e=>this.privateSkill(e),(a,c,r)=>this.commitCast(a,c,r),e=>this.actorAction(e)));actor.scene=actor.id;
      }else if(effect==='leave'){
        this.activities.get(actor.id)?.engine.remove(actor.id);this.activities.delete(actor.id);this.engine.add(actor);
        Object.assign(actor,{x:candidate.x,y:candidate.y,scene:'hub',hp:Math.max(1,actor.hp)});candidate.hp=actor.hp;
      }else if(effect==='prepare'||effect==='start'||effect==='trip_start'){
        this.activities.get(actor.id)!.prepare(candidate,effect!=='prepare');
      }else if(effect==='trip_cancel')this.activities.get(actor.id)?.stop('ready');
      if(effect==='guard'){actor.mp=candidate.mp;actor.lastSpentAt=candidate.lastSpentAt;}
      this.activities.get(actor.id)?.apply(candidate.chapter!);
      if(effect&&effect!=='guard'){this.stop(actor.id);this.pendingCasts.delete(actor.id);this.pendingBasics.delete(actor.id);this.held.set(actor.id,{x:0,y:0});}
      // Non-movement interactions can change activity state (e.g. preparation), but not the server clock.
      candidate=this.snapshot(candidate,actor);
      this.storeFor(actor.id).commitSect(candidate,cmd.id,{command:key,result:outcome.result});this.profiles.set(actor.id,candidate);actor.savedAt=candidate.updatedAt;
      client.send('chapter:result',outcome.result);
      if(cmd.action==='interact'&&['EX01','EX02'].includes(candidate.chapter?.activity??'')&&cmd.node){
        const n=CHAPTER_WORLD.nodes.find(n=>n.id===cmd.node);if(n){const dx=n.x-actor.x,dy=n.y-actor.y,length=Math.hypot(dx,dy)||1;
          this.actorAction({type:'gather',strikeId:'gather:'+actor.id+':'+cmd.id,actorId:actor.id,action:'gather',at:this.engine.now,x:actor.x,y:actor.y,dx:dx/length||0,dy:dy/length||(dx?0:1)});}
      }
      const enemy=this.activities.get(actor.id)?.view(candidate).enemy;
      if(enemy&&outcome.effect==='start')client.send('training:result',{ok:true,targetId:enemy.id});
    }catch{
      this.activities.get(actor.id)?.engine.remove(actor.id);this.activities.delete(actor.id);this.engine.remove(actor.id);Object.assign(actor,actorBefore);
      if(before.chapter?.scene!=='hub'&&before.chapter){this.activities.set(actor.id,new ChapterActivity(actor,before,this.engine.now,e=>this.privateSkill(e),(a,c,r)=>this.commitCast(a,c,r),e=>this.actorAction(e)));}
      else this.engine.add(actor);
      client.send('chapter:result',{requestId:cmd.id,ok:false,reason:'save'});
    }
    this.sendChapter(client,true);this.sendCharacter(client,true);this.sendSect(client,true);
  }
  private actorAction(event:ActorActionFact):void {
    const actor=this.state.players.get(event.actorId);if(!actor)return;
    event={...event,avatarId:actor.avatarId};
    if(actor.scene&&actor.scene!=='hub')this.clients.find(c=>c.sessionId===event.actorId)?.send('actor:action',event);
    else this.broadcast('actor:action',event);
  }
  private chapterBasic(client:Client,raw:unknown):void{
    const p=this.profiles.get(client.sessionId),a=this.state.players.get(client.sessionId),activity=this.activities.get(client.sessionId);
    const id=raw&&typeof raw==='object'?(raw as {id?:unknown}).id:undefined;
    if(!p||!a?.connected||!activity||typeof id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(id))return;
    const key=JSON.stringify(['chapter-v1','basic']),old=this.storeFor(a.id).sectReceipt(p.id,id) as {command:string;result:ChapterResult}|undefined;
    if(old){client.send('chapter:result',old.command===key?{...old.result,duplicate:true}:{requestId:id,ok:false,reason:'request_reused'});return;}
    const seq=(raw as {inputSeq?:unknown}).inputSeq;
    if(seq!==undefined){if(!Number.isSafeInteger(seq)||Number(seq)<0){client.send('chapter:result',{requestId:id,ok:false,reason:'input'});return;}
      const consumed=this.inputs.get(a.id).consumedCount;if(Number(seq)>consumed){const queue=this.pendingBasics.get(a.id)??[];
        if(Number(seq)>consumed+65||queue.length>=8){client.send('chapter:result',{requestId:id,ok:false,reason:'input'});return;}
        if(!queue.some(r=>r.id===id))queue.push({client,id,inputSeq:Number(seq),expires:this.engine.now+3000});this.pendingBasics.set(a.id,queue);return;}
    }
    const enemy=activity.view(p).enemy;if(!enemy)return;
    const before=this.snapshot(p,a),actorBefore=a.toJSON(),dx=enemy.x-a.x,dy=enemy.y-a.y;
    if(!activity.basic(p,{x:dx,y:dy},`chapter:${a.id}:${id}`,this.held.get(a.id))){client.send('chapter:result',{requestId:id,ok:false,reason:'cooldown'});return;}
    try{
      const length=Math.hypot(dx,dy)||1;a.facingX=dx/length;a.facingY=dy/length;
      const candidate=this.snapshot(p,a),result={requestId:id,ok:true};this.storeFor(a.id).commitSect(candidate,id,{command:key,result});this.profiles.set(a.id,candidate);
      client.send('chapter:result',result);activity.flushActions();
    }catch{
      Object.assign(a,actorBefore);this.activities.set(a.id,new ChapterActivity(a,before,this.engine.now,e=>this.privateSkill(e),(actor,c,r)=>this.commitCast(actor,c,r),e=>this.actorAction(e)));client.send('chapter:result',{requestId:id,ok:false,reason:'save'});
    }
  }
  private finishChapterActivity(id:string,activity:ChapterActivity):void{
    const p=this.profiles.get(id),actor=this.state.players.get(id);if(!p?.chapter||!actor)return;
    const view=activity.view(p);if(view.status!=='won')return;
    const q=p.chapter.activity;if(q==='none')return;
    const phase=view.enemy?.maxHp===60?1:view.enemy?.maxHp===80?2:3;
    if(q==='HN10'?p.chapter.checkpoint>=phase:p.chapter.facts.includes(`${q}-proof`))return;
    const candidate=this.snapshot(p,actor),c=candidate.chapter!;
    if(q==='HN10'){
      c.checkpoint=phase;c.facts.push(`HN10-phase-${phase}`);
      if(phase===3){c.completed.push('HN10');candidate.milestone='M04';}
    }else c.facts.push(`${q}-proof`);
    try{this.storeFor(id).save(candidate);this.profiles.set(id,candidate);actor.savedAt=candidate.updatedAt;this.clients.find(c=>c.sessionId===id)?.send('chapter:result',{ok:true,reason:'proof_saved'});}
    catch{this.clients.find(c=>c.sessionId===id)?.send('chapter:result',{ok:false,reason:'save'});}
  }
  private snapshot(profile: CharacterProfile, actor: Disciple): CharacterProfile {
    const activity=this.activities.get(actor.id);
    return { ...profile,...(profile.chapter?{chapter:{...profile.chapter,...(activity?{activitySave:activity.snapshot()}:{})}}:{}), name: actor.name, x: activity?profile.x:actor.x, y: activity?profile.y:actor.y, direction: actor.direction as Direction, mapId: HANG_NHAC.id, mapVersion: HANG_NHAC.version,
      facing:{x:actor.facingX,y:actor.facingY},hp: actor.hp, mp: actor.mp, casts: actor.casts, practiceHits: actor.practiceHits, nextSwordAt: actor.nextSwordAt,
      nextThunderAt: actor.nextThunderAt, nextWindAt: actor.nextWindAt, lastSpentAt: actor.lastSpentAt };
  }
  private commitCast(actor: CombatActor, command: CastCommand, result: CastResult): void {
    const profile = this.profiles.get(actor.id); if (!profile) return;
    const length=Math.hypot(actor.castAimX??0,actor.castAimY??0);
    const candidate = this.snapshot(profile, actor as Disciple);if(length>.001)candidate.facing={x:actor.castAimX!/length,y:actor.castAimY!/length};
    this.storeFor(actor.id).commitCast(candidate, command.id, { command: commandKey(command), result });
    if(candidate.facing){(actor as Disciple).facingX=candidate.facing.x;(actor as Disciple).facingY=candidate.facing.y;}
    this.profiles.set(actor.id, candidate); (actor as Disciple).savedAt = candidate.updatedAt;
  }
  private save(id: string): void {
    const profile = this.profiles.get(id), actor = this.state.players.get(id); if (!profile || !actor) return;
    const client = this.clients.find(c => c.sessionId === id);
    try {
      const candidate = this.snapshot(profile, actor); this.storeFor(id).save(candidate); this.profiles.set(id, candidate); actor.savedAt = candidate.updatedAt;
      client?.send('profile:saved', { ok: true, savedAt: candidate.updatedAt });
    } catch { client?.send('profile:saved', { ok: false }); }
  }
  async onDrop(client: Client): Promise<void> {
    this.activities.get(client.sessionId)?.pause();
    this.characterWatchers.delete(client.sessionId);this.characterSent.delete(client.sessionId);
    this.stopQuestLoop(client.sessionId);
    this.clearLesson(client.sessionId);
    this.pendingCasts.delete(client.sessionId);
    this.pendingBasics.delete(client.sessionId);
    this.cycles.delete(client.sessionId);this.sectSent.delete(client.sessionId);this.sectWatchers.delete(client.sessionId);
    this.engine.cancel(client.sessionId); this.held.delete(client.sessionId); this.save(client.sessionId);
    const p = this.profiles.get(client.sessionId),grant=this.grants.get(client.sessionId),reserveMs=this.reconnectWindow(client.sessionId)*1000;
    if(grant)HangNhacRoom.gateway?.drop(grant,client.sessionId,reserveMs+5000);else if(p)HangNhacRoom.leases.dropped(p.accountId, client.sessionId,reserveMs);
    await super.onDrop(client);
  }
  onReconnect(client: Client): void {
    this.held.set(client.sessionId,{x:0,y:0});
    const p = this.profiles.get(client.sessionId);
    const grant=this.grants.get(client.sessionId);
    if(grant){if(!HangNhacRoom.gateway?.renew(grant,client.sessionId))throw new ServerError(401,'Phiên đăng nhập hoặc server không còn cho phép chơi.');}
    else if (p) {
      if (!HangNhacRoom.leases.acquire(p.accountId, client.sessionId)) throw new ServerError(409, 'Hồ sơ đang ở phiên khác.');
      HangNhacRoom.leases.activate(p.accountId, client.sessionId);
    }
    super.onReconnect(client);
    if(p)this.activities.get(client.sessionId)?.resume(p,this.engine.now);
    if(this.chapterWatchers.has(client.sessionId))this.sendChapter(client,true);
  }
  onLeave(client: Client): void {
    const activity=this.activities.get(client.sessionId),profile=this.profiles.get(client.sessionId);
    if(activity&&profile){activity.prepare(profile,false);activity.pause();}
    this.characterWatchers.delete(client.sessionId);this.characterSent.delete(client.sessionId);
    this.stopQuestLoop(client.sessionId);
    this.clearLesson(client.sessionId);
    this.pendingCasts.delete(client.sessionId);
    this.pendingBasics.delete(client.sessionId);
    this.cycles.delete(client.sessionId);this.sectSent.delete(client.sessionId);this.sectWatchers.delete(client.sessionId);
    this.engine.cancel(client.sessionId); this.save(client.sessionId); this.engine.remove(client.sessionId); this.held.delete(client.sessionId);
    this.activities.delete(client.sessionId);this.chapterSent.delete(client.sessionId);this.chapterWatchers.delete(client.sessionId);
    const p = this.profiles.get(client.sessionId),grant=this.grants.get(client.sessionId);if(grant)HangNhacRoom.gateway?.release(grant,client.sessionId);else if(p)HangNhacRoom.leases.release(p.accountId, client.sessionId);
    this.grants.delete(client.sessionId);this.persistence.delete(client.sessionId);
    this.profiles.delete(client.sessionId); super.onLeave(client);
  }
  onDispose(): void {
    for(const activity of this.activities.values())activity.pause();
    this.characterWatchers.clear();this.characterSent.clear();
    this.questLoops.clear();
    for(const id of this.lessons.keys())this.clearLesson(id);
    this.pendingCasts.clear();
    this.pendingBasics.clear();
    for (const [id, p] of this.profiles) { this.save(id);const grant=this.grants.get(id);if(grant)HangNhacRoom.gateway?.release(grant,id);else HangNhacRoom.leases.release(p.accountId,id); }
    this.grants.clear();this.persistence.clear();
    this.activities.clear();this.chapterSent.clear();this.chapterWatchers.clear();
  }
}
