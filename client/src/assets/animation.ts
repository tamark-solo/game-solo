import type { Direction, MotionState } from '@shared/world/types';
import type { Atlas } from './atlas';

export class AnimationPlayer {
  direction: Direction = 'south';
  state: MotionState = 'stand';
  frameIndex = 0;
  elapsed = 0;
  fps = 8;
  private walkPhase = 0;
  constructor(readonly atlas: Atlas) {}
  get ids(): string[] { return this.atlas.animations[`${this.state}_${this.direction}`]; }
  get frameId(): string { return this.ids[this.frameIndex % this.ids.length]; }
  set(state: MotionState, direction: Direction): void {
    const supported = state === 'walk' && !this.atlas.canWalk ? 'stand' : state;
    if (this.state !== supported || this.direction !== direction) {
      this.state = supported; this.direction = direction; this.frameIndex = 0; this.elapsed = 0;
    }
  }
  update(dt: number): void {
    if (this.ids.length <= 1) return;
    this.elapsed += dt;
    const steps = Math.floor(this.elapsed * this.fps);
    if (steps > 0) { this.frameIndex = (this.frameIndex + steps) % this.ids.length; this.elapsed -= steps / this.fps; }
  }
  updateFromTravel(distance: number, direction: Direction, moving: boolean, cycleDistance = 48): void {
    this.set(moving ? 'walk' : 'stand', direction);
    if (!this.atlas.canWalk || !moving || !Number.isFinite(distance) || distance < 0 || cycleDistance <= 0) return;
    // Keep gait phase on turns/resumes; only distance covered advances the feet.
    this.walkPhase = (this.walkPhase + distance / cycleDistance) % 1;
    this.frameIndex = Math.floor(this.walkPhase * this.ids.length + 1e-9) % this.ids.length;
  }
  step(delta: number): void {
    this.frameIndex = ((this.frameIndex + delta) % this.ids.length + this.ids.length) % this.ids.length;
    this.elapsed = 0;
  }
}
