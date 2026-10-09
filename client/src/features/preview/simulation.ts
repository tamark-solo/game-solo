import type { AppState } from '../../core/state';
import { readInput } from '../../core/input';
import { dom } from '../../core/elements';
import type { RenderActor } from '../../render/renderer';
import { move } from '@shared/world/movement';
import type { Input } from '@shared/world/types';
import { inputForActor } from './model';

// Per-frame update of local actors: follows input (map) or plays the animation in place (inspector).
export function localActorsForFrame(app: AppState, dt: number): RenderActor[] {
  if (!app.paused) {
    for (const [index, actor] of app.localActors.entries()) {
      if (app.mode === 'map') {
        const patrols: Input[] = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
        const input = index === 0 ? readInput(app) : patrols[Math.floor(app.elapsed / 1.5 + index) % patrols.length];
        const next = move(actor, inputForActor(app, input, actor.assetId), dt, Number(dom.speedInput.value));
        const distance = Math.hypot(next.x - actor.x, next.y - actor.y);
        Object.assign(actor, next);
        actor.animation.updateFromTravel(distance, next.direction, next.moving, Number(dom.strideInput.value));
      } else { actor.animation.set(app.desiredState, app.selectedDirection); actor.animation.update(dt); }
    }
  }
  return app.localActors;
}
