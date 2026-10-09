import { SKILL_DEFINITIONS as R01 } from './definitions';
import { SKILL_BEHAVIORS, validateSkillDefinitions, type BehaviorContext } from './behaviors';
import type { SkillDefinition } from './definitions';
import { commandKey, cooldownField } from './commands';
import { clearPath } from './movement';
import type { CombatActor, CastCommand, CastResult, ActiveCast, Receipt, TrainingTarget, Projectile, SkillEvent } from './contracts';
import type { Input, Position } from '../world/types';
import { hangNhacWalkable } from '../hang-nhac';
import { normalizedAim, resolveSkillAim } from './aim';

export class SkillEngine {
  readonly actors = new Map<string, CombatActor>();
  readonly targets = new Map<string, TrainingTarget>();
  readonly projectiles = new Map<string, Projectile>();
  private active = new Map<string, ActiveCast>();
  private receipts = new Map<string, Map<string, Receipt>>();
  private arrivals: string[] = [];
  now: number;
  constructor(now: number, private event: (event: SkillEvent) => void,
    private commit?: (actor: CombatActor, command: CastCommand, result: CastResult) => void,
    private world={walkable:hangNhacWalkable,clearPath}) { this.now = now;validateSkillDefinitions(); }
  add(actor: CombatActor): void { this.actors.set(actor.id, actor); }
  practice(actorId: string, aim: Input): TrainingTarget | undefined {
    const actor = this.actors.get(actorId); if (!actor?.connected || actor.castId || actor.hp <= 0) return;
    const magnitude = Math.hypot(aim.x, aim.y); if (!Number.isFinite(magnitude) || magnitude < .001) return;
    const dx = aim.x / magnitude, dy = aim.y / magnitude;
    for (let distance = 160; distance >= 48; distance -= 8) {
      const point = { x: actor.x + dx * distance, y: actor.y + dy * distance };
      if (!this.world.clearPath(actor, point, 16)) continue;
      const target = { id: `practice-${actorId}`, ownerId: actorId, ...point, hp: 100, maxHp: 100, radius: 16 };
      this.targets.set(target.id, target); return target;
    }
  }
  cast(actorId: string, command: CastCommand, held: Input = { x: 0, y: 0 }): CastResult {
    const actor = this.actors.get(actorId);
    const key = commandKey(command), history = this.receipts.get(actorId) ?? new Map<string, Receipt>();
    this.receipts.set(actorId, history);
    const old = history.get(command.id);
    if (old) return old.command === key ? { ...old.result, duplicate: true } : { requestId: command.id, accepted: false, reason: 'request_reused' };
    const reject = (reason: string): CastResult => {
      const result = { requestId: command.id, accepted: false, reason };
      history.set(command.id, { command: key, result }); if (history.size > 128) history.delete(history.keys().next().value!); return result;
    };
    if (!actor?.connected || actor.hp <= 0) return reject('inactive');
    if (this.active.has(actorId)) return reject('casting');
    const skill = R01[command.skillId], cooldown = cooldownField(command.skillId);
    if (actor[cooldown] > this.now) return reject('cooldown');
    if (actor.mp < skill.cost) return reject('resource');
    const requested=normalizedAim({x:command.aimX,y:command.aimY});if(!requested)return reject('aim');
    const target = this.targets.get(command.targetId);
    const {x:dx,y:dy}=resolveSkillAim(skill.aim,requested,actor,target);
    const rejected = SKILL_BEHAVIORS[skill.behavior].validate?.({actor,dx,dy,target,definition:skill,clearPath:this.world.clearPath,walkable:this.world.walkable});
    if(rejected)return reject(rejected);
    const result: CastResult = { requestId: command.id, accepted: true, castId: `${actorId}-${command.id}`, skillId: command.skillId };
    const previous = { mp: actor.mp, deadline: actor[cooldown], lastSpentAt: actor.lastSpentAt, casts: actor.casts };
    actor.mp -= skill.cost; actor[cooldown] = this.now + skill.cooldown; actor.lastSpentAt = this.now; actor.casts++;
    try { this.commit?.(actor, command, result); }
    catch { actor.mp = previous.mp; actor[cooldown] = previous.deadline; actor.lastSpentAt = previous.lastSpentAt; actor.casts = previous.casts; return reject('save'); }
    const cast: ActiveCast = { id: result.castId!, skill: command.skillId, startedAt: this.now, dx, dy, origin: { x: actor.x, y: actor.y },
      targetId: command.targetId, released: false, resolved: false, arrived: false, held: { ...held }, movementReleased: false };
    this.active.set(actorId, cast); actor.castId = cast.id; actor.castSkill = cast.skill; actor.castStartedAt = this.now;
    actor.motionLocked = true; actor.moving = false; actor.castAimX=dx;actor.castAimY=dy;
    actor.direction = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'east' : 'west' : dy > 0 ? 'south' : 'north';
    history.set(command.id, { command: key, result }); if (history.size > 128) history.delete(history.keys().next().value!);
    this.emit(actorId, cast, 'cast', cast.origin, target);
    return result;
  }
  movement(actorId: string, input: Input): void {
    const cast = this.active.get(actorId); if (!cast || !R01[cast.skill].interruptible || cast.released) return;
    if (input.x === 0 && input.y === 0) { cast.movementReleased = true; return; }
    if (cast.movementReleased || Math.abs(input.x - cast.held.x) > .01 || Math.abs(input.y - cast.held.y) > .01) this.cancel(actorId);
  }
  cancel(actorId: string): void {
    const actor = this.actors.get(actorId), cast = this.active.get(actorId); if (!actor || !cast) return;
    this.emit(actorId, cast, 'cancel', actor); this.end(actorId);
  }
  remove(actorId: string): void {
    this.cancel(actorId); this.actors.delete(actorId); this.receipts.delete(actorId);
    for (const [id, target] of this.targets) if (target.ownerId === actorId) this.targets.delete(id);
    for (const [id, p] of this.projectiles) if (p.ownerId === actorId) this.projectiles.delete(id);
  }
  prepare(dt: number): void {
    const previous = this.now; this.now += dt * 1000; this.arrivals = [];
    for (const [id, cast] of this.active) {
      const actor = this.actors.get(id)!; if (!actor.connected) { this.cancel(id); continue; }
      const skill = R01[cast.skill], age = this.now - cast.startedAt;
      actor.motionLocked = age < skill.recovery; actor.dashVX = actor.dashVY = 0;
      if (!cast.released && age + .001 >= skill.release) {
        cast.released = true;
        SKILL_BEHAVIORS[skill.behavior].release?.(this.context(actor,cast,previous,dt));
        this.emit(id, cast, 'release', actor, cast.target);
      }
      SKILL_BEHAVIORS[skill.behavior].advance?.(this.context(actor,cast,previous,dt));
      if (age + .001 >= skill.end) this.end(id);
    }
  }
  finish(dt: number): void {
    for (const id of this.arrivals) {
      const cast = this.active.get(id), actor = this.actors.get(id);
      if (cast && actor) { cast.arrived = true; actor.dashVX = actor.dashVY = 0; actor.motionLocked = false; this.emit(id, cast, 'arrival', actor); }
    }
    for (const [id, p] of this.projectiles) {
      const definition:SkillDefinition=R01[p.skillId??'sword'];
      let distance = Math.min(definition.speed! * dt, definition.range - p.traveled), ended = false, hit = false;
      while (distance > .00001) {
        const step = Math.min(4, distance), next = { x: p.x + p.dx * step, y: p.y + p.dy * step };
        if (!this.world.walkable(next, 12)) { ended = true; break; }
        p.x = next.x; p.y = next.y; p.traveled += step; distance -= step;
        const target = [...this.targets.values()].find(t => t.ownerId === p.ownerId && t.hp > 0 && Math.hypot(t.x - p.x, t.y - p.y) <= t.radius + 12);
        if (target) {
          const cast = { id: p.castId, skill: p.skillId??'sword', dx: p.dx, dy: p.dy };
          this.hit(p.ownerId, cast, target, definition.damage!, p); ended = hit = true; break;
        }
      }
      if (ended || p.traveled >= definition.range - .001) {
        if (!hit) this.emit(p.ownerId, { id: p.castId, skill: p.skillId??'sword', dx: p.dx, dy: p.dy }, 'miss', p);
        this.projectiles.delete(id);
      }
    }
    for (const actor of this.actors.values()) if (actor.connected && actor.hp > 0 && this.now - actor.lastSpentAt >= 2000) actor.mp = Math.min(100, actor.mp + 12 * dt);
  }
  private context(actor:CombatActor,cast:ActiveCast,previous:number,dt:number):BehaviorContext {
    return {actor,cast,now:this.now,previous,dt,definition:R01[cast.skill],targets:this.targets,projectiles:this.projectiles,clearPath:this.world.clearPath,
      emit:(type,p,target)=>this.emit(actor.id,cast,type,p,target),hit:(target,damage,p)=>this.hit(actor.id,cast,target,damage,p),
      arrive:()=>this.arrivals.push(actor.id)};
  }
  private hit(actorId: string, cast: Pick<ActiveCast, 'id' | 'skill' | 'dx' | 'dy'>, target: TrainingTarget, damage: number, point: Position): void {
    target.hp = Math.max(0, target.hp - damage); const actor = this.actors.get(actorId); if (actor) actor.practiceHits++;
    this.emit(actorId, cast, 'hit', point, undefined, target.id, damage);
  }
  private emit(actorId: string, cast: Pick<ActiveCast, 'id' | 'skill' | 'dx' | 'dy'>, type: SkillEvent['type'], p: Position, target?: Position, targetId?: string, damage?: number): void {
    this.event({ type, castId: cast.id, actorId, skillId: cast.skill, at: this.now, x: p.x, y: p.y, dx: cast.dx, dy: cast.dy,
      ...(target ? { targetX: target.x, targetY: target.y } : {}), ...(targetId ? { targetId } : {}), ...(damage !== undefined ? { damage } : {}) });
  }
  private end(id: string): void {
    const actor = this.actors.get(id)!; this.active.delete(id); actor.castId = actor.castSkill = ''; actor.castStartedAt = 0;
    actor.motionLocked = false; actor.dashVX = actor.dashVY = 0; actor.castAimX=actor.castAimY=0;
  }
}
