import { ServerError, type Client } from 'colyseus';
import { CourtyardRoom } from './CourtyardRoom';
import { HANG_NHAC, HANG_NHAC_AVATARS, hangNhacSpawn, hangNhacWalkable } from '../../shared/hang-nhac';
import type { MovementState, MoveInput } from '../../shared/netcode';
import { CHARACTER_INFO, cleanPlayerName, isAvatarId, type CharacterProfile } from '../../shared/profiles';
import { R01Engine, applyR01Movement, commandKey, readCastCommand, type CombatActor, type CastCommand, type CastResult } from '../../shared/r01';
import { DIRECTIONS, type Direction, type Input } from '../../shared/world';
import { ProjectileState, TrainingTargetState, type Disciple } from './state';
import type { ProfileStore, ProfileLeases } from './profile-store';
import { CYCLE_PHASE_MS, nearStation, readSectCommand, sectCommandKey, type SectResult } from '../../shared/sect';
import { advanceCultivation, isPractising, performSectCommand, sectView } from './sect-progress';

interface ProfileAuth { accountId: string; profile: CharacterProfile }

export class HangNhacRoom extends CourtyardRoom {
  private static store: ProfileStore;
  private static leases: ProfileLeases;
  static configure(store: ProfileStore, leases: ProfileLeases): void { this.store = store; this.leases = leases; }
  private profiles = new Map<string, CharacterProfile>();
  private held = new Map<string, Input>();
  private pendingCasts=new Map<string,Array<{client:Client;command:CastCommand;expires:number}>>();
  private engine!: R01Engine;
  private nextSaveAt = 0;
  private cycles = new Map<string,number>();
  private sectSent = new Map<string,string>();
  private sectWatchers = new Set<string>();
  private nextSectAt = 0;
  onAuth(client: Client, options: Record<string, unknown>): boolean | ProfileAuth {
    if (!options || options.mapVersion !== HANG_NHAC.version) return false;
    // Token-free sessions retain the isolated movement fixture used by the foundation checks.
    if (!options.accountToken) return true;
    const accountId = HangNhacRoom.store.authenticate(options.accountToken);
    if (!accountId || !isAvatarId(options.avatarId)) throw new ServerError(401, 'Hồ sơ không hợp lệ.');
    if (!HangNhacRoom.leases.acquire(accountId, client.sessionId)) throw new ServerError(409, 'Hồ sơ đang được điều khiển ở tab khác. Rời sân tại tab đó trước.');
    try { return { accountId, profile: HangNhacRoom.store.get(accountId, options.avatarId) }; }
    catch (error) { HangNhacRoom.leases.release(accountId, client.sessionId); throw error; }
  }
  onCreate(): void {
    this.engine = new R01Engine(Date.now(), event => this.broadcast('skill:event', event), (actor, command, result) => this.commitCast(actor, command, result));
    super.onCreate();
    this.state.mapId = HANG_NHAC.id;
    this.state.mapVersion = HANG_NHAC.version;
    this.state.serverTime = this.engine.now;
    this.onMessage('skill:cast', (client, raw: unknown) => {
      const command = readCastCommand(raw), actor = this.state.players.get(client.sessionId);
      if (!command || !actor) { client.send('skill:result', { accepted: false, reason: 'invalid' }); return; }
      const profile=this.profiles.get(client.sessionId);
      // Durable retries can outlive the input channel (reconnect/restart resets its sequence).
      if(profile&&HangNhacRoom.store.receipt(profile.id,command.id)){this.cast(client,command);return;}
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
      const p = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      const valid = typeof p.x === 'number' && typeof p.y === 'number' && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1;
      const target = valid ? this.engine.practice(client.sessionId, { x: p.x as number, y: p.y as number }) : undefined;
      client.send('training:result', { ok: !!target, targetId: target?.id });
    });
    this.onMessage('profile:save', client => this.save(client.sessionId));
    this.onMessage('sect:sync',client=>{this.sectWatchers.add(client.sessionId);this.sendSect(client,true);});
    this.onMessage('sect:command',(client,raw:unknown)=>{
      const command=readSectCommand(raw),actor=this.state.players.get(client.sessionId),profile=this.profiles.get(client.sessionId);
      if(!command||!actor||!profile){client.send('sect:result',{ok:false,reason:profile?'invalid':'profile'});return;}
      this.sectWatchers.add(client.sessionId);
      const key=sectCommandKey(command);
      const old=HangNhacRoom.store.sectReceipt(profile.id,command.id) as {command:string;result:SectResult}|undefined;
      if(old){client.send('sect:result',old.command===key?{...old.result,duplicate:true}:{requestId:command.id,ok:false,reason:'request_reused'});this.sendSect(client,true);return;}
      const outcome=performSectCommand(this.snapshot(profile,actor),actor,command,this.engine.now,this.cycles.get(actor.id)??0,this.hasProjectile(actor.id));
      try {
        if(outcome.candidate){
          HangNhacRoom.store.commitSect(outcome.candidate,command.id,{command:key,result:outcome.result});
          this.profiles.set(actor.id,outcome.candidate);actor.hp=outcome.candidate.hp;actor.savedAt=outcome.candidate.updatedAt;
          if(outcome.startCycle)this.cycles.set(actor.id,this.engine.now+CYCLE_PHASE_MS);
          if(outcome.finishCycle)this.cycles.delete(actor.id);
        }
        client.send('sect:result',outcome.result);
      }catch{client.send('sect:result',{requestId:command.id,ok:false,reason:'save'});}
      this.sendSect(client,true);
    });
  }
  onJoin(client: Client, options: unknown): void {
    super.onJoin(client, options);
    const actor = this.state.players.get(client.sessionId)!;
    const auth = client.auth as ProfileAuth | boolean;
    const profile = auth && typeof auth === 'object' ? auth.profile : undefined;
    actor.id = client.sessionId; actor.profileId = profile?.id ?? `temporary-${client.sessionId}`;
    actor.progressionKind = CHARACTER_INFO[actor.avatarId as keyof typeof CHARACTER_INFO].progressionKind;
    actor.hp = actor.mp = 100; actor.casts = actor.practiceHits = actor.savedAt = 0;
    actor.nextSwordAt = actor.nextThunderAt = actor.nextWindAt = actor.lastSpentAt = 0;
    actor.castId = actor.castSkill = ''; actor.castStartedAt = actor.castAimX=actor.castAimY=0; actor.motionLocked = false; actor.dashVX = actor.dashVY = 0;
    if (profile) {
      if (profile.revision>0 && profile.mapId === HANG_NHAC.id && hangNhacWalkable(profile)) { actor.x = profile.x; actor.y = profile.y; }
      actor.direction = DIRECTIONS.includes(profile.direction as Direction) ? profile.direction : 'south';
      const data = options as Record<string, unknown>;
      actor.name = cleanPlayerName(data.name, profile.name);
      for (const key of ['hp','mp','casts','practiceHits','nextSwordAt','nextThunderAt','nextWindAt','lastSpentAt'] as const) actor[key] = profile[key];
      this.profiles.set(client.sessionId, profile); HangNhacRoom.leases.activate(profile.accountId, client.sessionId);
    }
    this.engine.add(actor as CombatActor); this.save(client.sessionId);
  }
  protected get avatars(): readonly string[] { return HANG_NHAC_AVATARS; }
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
    this.engine.movement(actor.id, command); this.held.set(actor.id, command); applyR01Movement(actor, input, dt);
  }
  protected stepWithoutInput(player: MovementState, dt: number): void {
    // A missing packet stops walking but is not a newly released keyboard command.
    applyR01Movement(player as Disciple, { moveX:0,moveY:0 }, dt);
  }
  protected beforeSimulation(dt: number): void { this.engine.prepare(dt); }
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
    for (const [id, target] of this.engine.targets) {
      let value = this.state.targets.get(id); if (!value) { value = new TrainingTargetState(); this.state.targets.set(id, value); } Object.assign(value, target);
    }
    for (const id of this.state.targets.keys()) if (!this.engine.targets.has(id)) this.state.targets.delete(id);
    for (const [id, projectile] of this.engine.projectiles) {
      let value = this.state.projectiles.get(id); if (!value) { value = new ProjectileState(); this.state.projectiles.set(id, value); } Object.assign(value, projectile);
    }
    for (const id of this.state.projectiles.keys()) if (!this.engine.projectiles.has(id)) this.state.projectiles.delete(id);
    for(const [id,profile] of this.profiles){
      const actor=this.state.players.get(id);if(!actor)continue;
      const projectile=this.hasProjectile(id);
      if(this.cycles.has(id)&&(!actor.connected||actor.moving||!nearStation(actor,'cultivation')||isPractising(actor,this.engine.now,projectile)))
        this.cycles.set(id,this.engine.now+CYCLE_PHASE_MS);
      advanceCultivation(profile,actor,dt,this.engine.now,projectile);
    }
    if (this.engine.now >= this.nextSaveAt) { this.nextSaveAt = this.engine.now + 1000; for (const id of this.profiles.keys()) this.save(id); }
    if(this.engine.now>=this.nextSectAt){this.nextSectAt=this.engine.now+250;for(const client of this.clients)this.sendSect(client);}
  }
  private hasProjectile(id:string):boolean {return [...this.engine.projectiles.values()].some(p=>p.ownerId===id);}
  private cast(client:Client,command:CastCommand):void {
    const actor=this.state.players.get(client.sessionId);if(!actor?.connected){client.send('skill:result',{requestId:command.id,accepted:false,reason:'inactive'});return;}
    const profile=this.profiles.get(client.sessionId);
    if(profile&&!profile.skills.includes(command.skillId)){client.send('skill:result',{requestId:command.id,accepted:false,reason:'rights'});return;}
    const old=profile?HangNhacRoom.store.receipt(profile.id,command.id) as {command:string;result:CastResult}|undefined:undefined;
    const result=old?old.command===commandKey(command)?{...old.result,duplicate:true}:{requestId:command.id,accepted:false,reason:'request_reused'}:
      this.engine.cast(client.sessionId,command,this.held.get(client.sessionId));
    client.send('skill:result',result);
  }
  private sendSect(client:Client,force=false):void {
    if(!force&&!this.sectWatchers.has(client.sessionId))return;
    const profile=this.profiles.get(client.sessionId),actor=this.state.players.get(client.sessionId);if(!profile||!actor?.connected)return;
    const view=sectView(profile,actor,this.engine.now,this.cycles.get(actor.id)??0,this.hasProjectile(actor.id)),key=JSON.stringify(view);
    if(force||this.sectSent.get(actor.id)!==key){client.send('sect:state',view);this.sectSent.set(actor.id,key);}
  }
  private snapshot(profile: CharacterProfile, actor: Disciple): CharacterProfile {
    return { ...profile, name: actor.name, x: actor.x, y: actor.y, direction: actor.direction as Direction, mapId: HANG_NHAC.id, mapVersion: HANG_NHAC.version,
      hp: actor.hp, mp: actor.mp, casts: actor.casts, practiceHits: actor.practiceHits, nextSwordAt: actor.nextSwordAt,
      nextThunderAt: actor.nextThunderAt, nextWindAt: actor.nextWindAt, lastSpentAt: actor.lastSpentAt };
  }
  private commitCast(actor: CombatActor, command: CastCommand, result: CastResult): void {
    const profile = this.profiles.get(actor.id); if (!profile) return;
    const candidate = this.snapshot(profile, actor as Disciple);
    HangNhacRoom.store.commitCast(candidate, command.id, { command: commandKey(command), result });
    this.profiles.set(actor.id, candidate); (actor as Disciple).savedAt = candidate.updatedAt;
  }
  private save(id: string): void {
    const profile = this.profiles.get(id), actor = this.state.players.get(id); if (!profile || !actor) return;
    const client = this.clients.find(c => c.sessionId === id);
    try {
      const candidate = this.snapshot(profile, actor); HangNhacRoom.store.save(candidate); this.profiles.set(id, candidate); actor.savedAt = candidate.updatedAt;
      client?.send('profile:saved', { ok: true, savedAt: candidate.updatedAt });
    } catch { client?.send('profile:saved', { ok: false }); }
  }
  async onDrop(client: Client): Promise<void> {
    this.pendingCasts.delete(client.sessionId);
    this.cycles.delete(client.sessionId);this.sectSent.delete(client.sessionId);this.sectWatchers.delete(client.sessionId);
    this.engine.cancel(client.sessionId); this.held.delete(client.sessionId); this.save(client.sessionId);
    const p = this.profiles.get(client.sessionId); if (p) HangNhacRoom.leases.dropped(p.accountId, client.sessionId);
    await super.onDrop(client);
  }
  onReconnect(client: Client): void {
    this.held.set(client.sessionId,{x:0,y:0});
    const p = this.profiles.get(client.sessionId);
    if (p) {
      if (!HangNhacRoom.leases.acquire(p.accountId, client.sessionId)) throw new ServerError(409, 'Hồ sơ đang ở phiên khác.');
      HangNhacRoom.leases.activate(p.accountId, client.sessionId);
    }
    super.onReconnect(client);
  }
  onLeave(client: Client): void {
    this.pendingCasts.delete(client.sessionId);
    this.cycles.delete(client.sessionId);this.sectSent.delete(client.sessionId);this.sectWatchers.delete(client.sessionId);
    this.engine.cancel(client.sessionId); this.save(client.sessionId); this.engine.remove(client.sessionId); this.held.delete(client.sessionId);
    const p = this.profiles.get(client.sessionId); if (p) HangNhacRoom.leases.release(p.accountId, client.sessionId);
    this.profiles.delete(client.sessionId); super.onLeave(client);
  }
  onDispose(): void {
    this.pendingCasts.clear();
    for (const [id, p] of this.profiles) { this.save(id); HangNhacRoom.leases.release(p.accountId, id); }
  }
}
