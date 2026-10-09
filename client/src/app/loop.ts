import type { AppState } from '../core/state';
import { dom } from '../core/elements';
import type { RenderActor } from '../render/renderer';
import { localActorsForFrame } from '../features/preview/simulation';
import { onlineActorsForFrame } from '../features/courtyard/actors';
import { updateHUD } from '../hud/hud';

export function startLoop(app: AppState): void {
  requestAnimationFrame(now => tick(app, now));
}

function tick(app: AppState, now: number): void {
  const dt = Math.max(0, Math.min((now - app.lastTime) / 1000, .1)); app.lastTime = now;
  if (!app.paused) app.elapsed += dt;
  const actors = actorsForFrame(app, dt, now);
  if (app.renderer) {
    const own = actors.find(a => a.own);
    app.renderer.cameraCenter = app.mode !== 'inspector' && dom.follow.checked && own ? { x: own.x, y: own.y - 25 } : { x: 480, y: 320 };
    app.renderer.render(actors);
  }
  app.renderedFrames++;
  if (now - app.fpsTime >= 1000) { app.renderFPS = app.renderedFrames * 1000 / (now - app.fpsTime); app.renderedFrames = 0; app.fpsTime = now; }
  if (now - app.hudTime >= 90) { updateHUD(app, actors); app.hudTime = now; }
  requestAnimationFrame(next => tick(app, next));
}

function actorsForFrame(app: AppState, dt: number, now: number): RenderActor[] {
  return app.mode === 'online' ? onlineActorsForFrame(app, now) : localActorsForFrame(app, dt);
}
