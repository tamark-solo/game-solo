import type { AppState, Mode } from '../core/state';
import { clearInput } from '../core/input';
import { dom } from '../core/elements';
import { applyActorDefaults, buildLocalActors } from '../features/preview/actors';
import { updatePreviewActorView } from '../features/preview/view';
import { updateModeUI } from './mode-view';

// Rebuilds the local actors for the current mode and refreshes their panel. Does nothing until the asset is loaded.
export function rebuildLocalActors(app: AppState): void {
  if (!buildLocalActors(app)) return;
  updatePreviewActorView(app);
  updateModeUI(app);
}

// Switches between inspector, map and online. Leaving online disconnects the room first.
export async function setMode(app: AppState, nextMode: Mode): Promise<void> {
  if (app.mode === nextMode) return;
  clearInput();
  if (app.mode === 'online') await app.network.leave();
  if (nextMode === 'online') { dom.strideInput.value = '48'; dom.strideValue.textContent = '48 px/vòng'; }
  else if (app.mode === 'online') applyActorDefaults(app);
  app.mode = nextMode; app.paused = false; app.onlineActors.clear();
  if (app.renderer) { app.renderer.mode = app.mode; app.renderer.zoom = app.mode === 'inspector' ? 2 : 1; app.renderer.cameraCenter = { x: 480, y: 320 }; }
  dom.follow.checked = app.mode !== 'inspector';
  rebuildLocalActors(app); updateModeUI(app);
}

// Mode tabs and view options: zoom, backdrop and debug markers.
export function bindModeControls(app: AppState): void {
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => { void setMode(app, button.dataset.mode as Mode); }));
  document.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    if (app.renderer) app.renderer.zoom = Number(button.dataset.zoom);
    updateModeUI(app);
  }));
  dom.backdrop.addEventListener('change', event => { if (app.renderer) app.renderer.backdrop = (event.target as HTMLSelectElement).value; });
  dom.showDebug.addEventListener('change', event => { if (app.renderer) app.renderer.debug = (event.target as HTMLInputElement).checked; });
}
