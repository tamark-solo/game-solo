import type { AppState } from '../../core/state';
import { clearInput } from '../../core/input';
import { dom } from '../../core/elements';
import { rebuildLocalActors } from '../../ui/shell';
import { updateModeUI } from '../../ui/mode-view';
import type { Direction, MotionState } from '@shared/world/types';
import { applyActorDefaults } from './actors';
import { directionsForActor } from './model';

// Events of the animation inspector and the map motion lab.
export function bindPreviewControls(app: AppState): void {
  dom.actorSelect.addEventListener('change', () => {
    clearInput(); app.selectedId = dom.actorSelect.value; applyActorDefaults(app); rebuildLocalActors(app);
  });
  dom.motionSelect.addEventListener('change', () => {
    app.desiredState = dom.motionSelect.value as MotionState;
    app.localActor?.animation.set(app.desiredState, app.selectedDirection);
    updateModeUI(app);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => button.addEventListener('click', () => {
    if (!directionsForActor(app).includes(button.dataset.direction as Direction)) return;
    app.selectedDirection = button.dataset.direction as Direction;
    if (app.localActor) { app.localActor.direction = app.selectedDirection; app.localActor.animation.set(app.mode === 'inspector' ? app.desiredState : 'stand', app.selectedDirection); }
  }));
  dom.playButton.addEventListener('click', () => { app.paused = !app.paused; clearInput(); updateModeUI(app); });
  dom.frameBack.addEventListener('click', () => app.localActor?.animation.step(-1));
  dom.frameNext.addEventListener('click', () => app.localActor?.animation.step(1));
  dom.resetPosition.addEventListener('click', () => { clearInput(); rebuildLocalActors(app); });
  dom.fpsInput.addEventListener('input', () => {
    dom.fpsValue.textContent = `${dom.fpsInput.value} FPS`;
    for (const actor of app.localActors) actor.animation.fps = Number(dom.fpsInput.value);
  });
  dom.speedInput.addEventListener('input', () => { dom.speedValue.textContent = `${dom.speedInput.value} px/s`; });
  dom.strideInput.addEventListener('input', () => { dom.strideValue.textContent = `${dom.strideInput.value} px/vòng`; });
  dom.actorCount.addEventListener('change', () => rebuildLocalActors(app));
}
