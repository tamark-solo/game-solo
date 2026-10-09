import type { AppState } from '../../core/state';
import { dom } from '../../core/elements';
import type { Direction } from '@shared/world/types';
import { directionsForActor } from './model';

// Panel state for the selected actor: list entry, motion options, note and asset source.
export function updatePreviewActorView(app: AppState): void {
  const asset = app.renderer?.assets.get(app.selectedId); if (!asset) return;
  dom.actorSelect.value = app.selectedId;
  dom.motionSelect.querySelector<HTMLOptionElement>('option[value=walk]')!.disabled = !asset.atlas.canWalk;
  const glide = asset.definition.movementKind === 'glide';
  dom.motionSelect.querySelector<HTMLOptionElement>('option[value=walk]')!.textContent = glide ? 'Lướt' : 'Đi bộ';
  dom.motionSelect.querySelector<HTMLOptionElement>('option[value=stand]')!.textContent = glide ? 'Đứng lơ lửng' : 'Đứng';
  if (!asset.atlas.canWalk) app.desiredState = 'stand';
  dom.motionSelect.value = app.desiredState;
  app.localActor?.animation.set(app.desiredState, app.selectedDirection);
  dom.actorNote.textContent = asset.definition.previewOnlyDirection
    ? 'Mẫu chibi mới · 1 đứng + 4 pose đi · hiện có hướng Đông'
    : asset.definition.id === 'CHR-WANG-LIN-CHIBI' ? 'Chibi · 4 đứng + 16 pose đi · bốn hướng'
    : glide ? 'Chibi linh thể · 4 đứng + 16 pose lướt · cách điểm chiếu 4 px'
    : asset.atlas.canWalk ? `${Object.keys(asset.atlas.frames).length} frame · đứng / đi bốn hướng` : '4 frame tĩnh · di chuyển với hình tĩnh';
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
    button.disabled = !directionsForActor(app).includes(button.dataset.direction as Direction);
    button.setAttribute('aria-pressed', String(button.dataset.direction === app.selectedDirection));
  });
  dom.assetSource.textContent = `Nguồn: ${asset.definition.sourcePath}`;
}

// Play, frame stepping and motion controls for the current mode.
export function updatePreviewControls(app: AppState): void {
  const online = app.mode === 'online', map = app.mode !== 'inspector';
  dom.motionSelect.disabled = app.mode !== 'inspector';
  dom.fpsInput.disabled = map;
  dom.playButton.disabled = online || !app.localActor;
  dom.playButton.textContent = app.paused ? 'Tiếp tục' : map ? 'Dừng cảnh' : 'Tạm dừng';
  dom.frameBack.disabled = dom.frameNext.disabled = map || !app.paused || !app.localActor || app.localActor.animation.ids.length < 2;
  dom.resetPosition.disabled = online;
}
