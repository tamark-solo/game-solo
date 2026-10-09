import type { AppState } from '../../core/state';
import { createActor } from '../../core/actors';
import { dom } from '../../core/elements';
import { WORLD } from '@shared/world/map';
import { directionsForActor } from './model';

// Copies the selected asset's default FPS, stride and speed into the controls.
export function applyActorDefaults(app: AppState): void {
  const definition = app.renderer?.assets.get(app.selectedId)?.definition;
  dom.fpsInput.value = String(definition?.defaultAnimationFPS ?? 8);
  dom.strideInput.value = String(definition?.defaultGaitCycleDistancePx ?? 48);
  dom.speedInput.value = String(definition?.defaultMovementSpeedPxPerSecond ?? 80);
  dom.fpsValue.textContent = `${dom.fpsInput.value} FPS`;
  dom.strideValue.textContent = `${dom.strideInput.value} px/vòng`;
  dom.speedValue.textContent = `${dom.speedInput.value} px/s`;
}

// Builds the local actors for the current mode. Returns false while the selected asset is not loaded.
export function buildLocalActors(app: AppState): boolean {
  const renderer = app.renderer;
  if (!renderer?.assets.has(app.selectedId)) return false;
  const directions = directionsForActor(app);
  if (!directions.includes(app.selectedDirection)) app.selectedDirection = directions[0];
  const definition = renderer.assets.get(app.selectedId)!.definition;
  const count = app.mode === 'inspector' ? 1 : Number(dom.actorCount.value);
  const local = createActor(app, 'local', app.selectedId, definition.name.split(' · ')[0], WORLD.spawn.x, WORLD.spawn.y, true);
  local.animation.set(app.desiredState, app.selectedDirection);
  app.localActor = local;
  app.localActors = [local];
  for (let i = 1; i < count; i++) {
    const a = createActor(app, `simulated-${String(i).padStart(2, '0')}`, app.selectedId, `Mẫu ${i + 1}`,
      300 + ((i - 1) % 7) * 46, 305 + Math.floor((i - 1) / 7) * 47, false);
    a.animation.updateFromTravel(i * 8, app.selectedDirection, true, Number(dom.strideInput.value));
    app.localActors.push(a);
  }
  return true;
}
