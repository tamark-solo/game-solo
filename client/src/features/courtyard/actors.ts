import type { AppState } from '../../core/state';
import { createActor } from '../../core/actors';
import { dom } from '../../core/elements';
import type { RenderActor } from '../../render/renderer';

// Syncs online actors from the server state, interpolates them and drives their gait by distance travelled.
export function onlineActorsForFrame(app: AppState, now: number): RenderActor[] {
  const { network } = app;
  network.update(now);
  for (const [id, p] of network.players) {
    if (!app.renderer?.assets.has(p.avatarId)) continue;
    let actor = app.onlineActors.get(id);
    if (!actor) { actor = createActor(app, id, p.avatarId, p.name, p.x, p.y, id === network.room?.sessionId); app.onlineActors.set(id, actor); }
    const rendered = network.renderMotion(id) ?? p;
    const distance = Math.hypot(rendered.x - actor.x, rendered.y - actor.y);
    actor.x = rendered.x; actor.y = rendered.y;
    actor.direction = rendered.direction;
    actor.moving = p.connected && distance > .02 && distance < 128;
    actor.connected = p.connected;
    actor.animation.updateFromTravel(distance, actor.direction, actor.moving, Number(dom.strideInput.value));
  }
  for (const id of app.onlineActors.keys()) if (!network.players.has(id)) app.onlineActors.delete(id);
  return [...app.onlineActors.values()];
}
