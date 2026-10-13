import { clearSectPath } from '@shared/sect';
import { sectRoute } from '@shared/sect-route';
import type { Input, Position } from '@shared/world/types';

export type QuestNavigationStatus = 'idle' | 'moving' | 'arrived' | 'blocked' | 'cancelled';
export interface QuestNavigationOptions {
  route?: (from: Position, to: Position) => Position[] | undefined;
  clearPath?: (from: Position, to: Position) => boolean;
  arrivalRadius?: number;
  stuckMs?: number;
  maxReplans?: number;
}

const distance = (a: Position, b: Position): number => Math.hypot(b.x - a.x, b.y - a.y);
const finite = (point: Position): boolean => Number.isFinite(point.x) && Number.isFinite(point.y);
const WAYPOINT_RADIUS = 5;
const REPLAN_INTERVAL_MS = 500;

/** Client intent only. The ordinary movement transport and server collision remain authoritative. */
export class QuestNavigation {
  private readonly route: NonNullable<QuestNavigationOptions['route']>;
  private readonly clearPath: NonNullable<QuestNavigationOptions['clearPath']>;
  private readonly arrivalRadius: number;
  private readonly stuckMs: number;
  private readonly maxReplans: number;
  private path: Position[] = [];
  private index = 1;
  private position: Position = { x: 0, y: 0 };
  private destination: Position = { x: 0, y: 0 };
  private movement: Input = { x: 0, y: 0 };
  private currentStatus: QuestNavigationStatus = 'idle';
  private currentReason = '';
  private destinationLabel = '';
  private bestDistance = Infinity;
  private lastProgressAt: number | undefined;
  private lastReplanAt: number | undefined;
  private replans = 0;

  constructor(options: QuestNavigationOptions = {}) {
    this.route = options.route ?? sectRoute;
    this.clearPath = options.clearPath ?? clearSectPath;
    this.arrivalRadius = Math.max(1, options.arrivalRadius ?? 20);
    this.stuckMs = Math.max(REPLAN_INTERVAL_MS, options.stuckMs ?? 1800);
    this.maxReplans = Math.max(0, Math.floor(options.maxReplans ?? 2));
  }

  get status(): QuestNavigationStatus { return this.currentStatus; }
  get reason(): string { return this.currentReason; }
  get label(): string { return this.destinationLabel; }
  get input(): Input { return { ...this.movement }; }
  get remainingRoute(): Position[] {
    return this.currentStatus === 'moving'
      ? [{ ...this.position }, ...this.path.slice(this.index).map(point => ({ ...point }))] : [];
  }
  get diagnostics() {
    const route = this.remainingRoute;
    return { status: this.status, reason: this.reason, label: this.label, replans: this.replans,
      remainingDistance: route.slice(1).reduce((sum, point, index) => sum + distance(route[index], point), 0) };
  }

  start(from: Position, destination: Position, label = '', now?: number): boolean {
    this.position = { ...from };
    this.destination = { ...destination };
    this.destinationLabel = label;
    this.currentStatus = 'moving';
    this.currentReason = '';
    this.movement = { x: 0, y: 0 };
    this.path = [];
    this.replans = 0;
    this.lastReplanAt = undefined;
    this.lastProgressAt = now;
    this.bestDistance = Infinity;
    if (!finite(from) || !finite(destination)) return this.block('invalid-position');
    if (this.arrived()) { this.finish('arrived', 'arrival'); return true; }
    if (!this.plan()) return this.block('no-route');
    this.steer();
    return true;
  }

  cancel(reason = 'cancelled'): void {
    this.finish('cancelled', reason);
  }

  /** Call once per movement update, then freely read input/diagnostics without advancing state. */
  update(position: Position, now: number): void {
    if (this.currentStatus !== 'moving') return;
    if (!finite(position) || !Number.isFinite(now)) { this.block('invalid-position'); return; }
    this.position = { ...position };
    if (this.arrived()) { this.finish('arrived', 'arrival'); return; }
    this.lastProgressAt ??= now;

    // Do not cut a corner merely because the vertex is close or a prediction step passed it.
    while (this.index < this.path.length - 1 && this.passedWaypoint() &&
      this.clearPath(this.position, this.path[this.index + 1])) {
      this.index++;
      this.bestDistance = Infinity;
      this.lastProgressAt = now;
    }

    const target = this.path[this.index];
    if (!this.clearPath(this.position, target)) {
      this.replan(now, 'path-blocked');
      return;
    }
    const remaining = distance(this.position, target);
    if (remaining < this.bestDistance - 1) {
      this.bestDistance = remaining;
      this.lastProgressAt = now;
    } else if (now - this.lastProgressAt >= this.stuckMs) {
      this.replan(now, 'stuck');
      return;
    }
    this.steer();
  }

  private arrived(): boolean {
    return distance(this.position, this.destination) <= this.arrivalRadius &&
      this.clearPath(this.position, this.destination);
  }

  private plan(): boolean {
    const path = this.route({ ...this.position }, { ...this.destination });
    if (!path || path.length < 2 || path.some(point => !finite(point)) ||
      distance(path[path.length - 1], this.destination) > .01) return false;
    this.path = path.map(point => ({ ...point }));
    this.index = 1;
    this.bestDistance = distance(this.position, this.path[this.index]);
    return true;
  }

  private passedWaypoint(): boolean {
    const target = this.path[this.index], previous = this.path[this.index - 1];
    if (distance(this.position, target) <= WAYPOINT_RADIUS) return true;
    const dx = target.x - previous.x, dy = target.y - previous.y;
    const length = Math.hypot(dx, dy);
    if (length < .001) return true;
    const along = (this.position.x - target.x) * dx + (this.position.y - target.y) * dy;
    const across = Math.abs((this.position.x - target.x) * dy - (this.position.y - target.y) * dx) / length;
    return along >= 0 && across <= WAYPOINT_RADIUS * 2;
  }

  private steer(): void {
    const target = this.path[this.index];
    const dx = target.x - this.position.x, dy = target.y - this.position.y;
    // A short approach avoids oscillation around narrow route corners at the ordinary 30 Hz tick.
    const divisor = Math.max(8, Math.hypot(dx, dy));
    this.movement = { x: dx / divisor, y: dy / divisor, fast: true };
  }

  private replan(now: number, reason: string): void {
    this.movement = { x: 0, y: 0 };
    if (this.lastReplanAt !== undefined && now - this.lastReplanAt < REPLAN_INTERVAL_MS) return;
    if (this.replans >= this.maxReplans) { this.block(reason); return; }
    this.replans++;
    this.lastReplanAt = now;
    this.lastProgressAt = now;
    if (!this.plan()) { this.block('no-route'); return; }
    if (this.clearPath(this.position, this.path[this.index])) this.steer();
  }

  private block(reason: string): false { this.finish('blocked', reason); return false; }
  private finish(status: QuestNavigationStatus, reason: string): void {
    this.currentStatus = status;
    this.currentReason = reason;
    this.movement = { x: 0, y: 0 };
    this.path = [];
  }
}
