import { createAppState, type AppState } from '../core/state';
import { bindInputListeners, readInput } from '../core/input';
import { dom } from '../core/elements';
import { NetworkSession } from '../net/session';
import { PreviewRenderer } from '../render/renderer';
import type { ActorDefinition } from '../assets/atlas';
import type { Direction } from '@shared/world/types';
import { applyActorDefaults } from '../features/preview/actors';
import { bindPreviewControls } from '../features/preview/controls';
import { bindCourtyardControls } from '../features/courtyard/controls';
import { updateNetworkUI } from '../features/courtyard/view';
import { bindModeControls, rebuildLocalActors, setMode } from '../ui/shell';
import { startLoop } from './loop';
import { installDebugHooks } from './debug';

// Entry point of the main page: bind controls first, then load the catalog and assets.
export function startApp(): void {
  let app!: AppState;
  app = createAppState(new NetworkSession(() => readInput(app), () => updateNetworkUI(app)), new URLSearchParams(location.search).get('player') === '2');
  dom.serverInput.value = import.meta.env.VITE_SERVER_URL || `http://${location.hostname}:2567`;
  if (app.secondPlayer) { dom.nameInput.value = 'Đệ tử thứ hai'; dom.avatarSelect.value = 'AVATAR-NOVICE-FEMALE'; }
  bindInputListeners(app);
  bindModeControls(app);
  bindPreviewControls(app);
  bindCourtyardControls(app);
  void initialize(app);
}

async function initialize(app: AppState): Promise<void> {
  try {
    const renderer = new PreviewRenderer(dom.stage, dom.worldLabels);
    app.renderer = renderer;
    const response = await fetch('/assets/catalog.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Thiếu catalog. Hãy chạy npm run assets.');
    const catalog = await response.json() as { actors: ActorDefinition[]; backgroundUrl?: string; defaultActorId?: string; defaultDirection?: Direction };
    app.selectedId = catalog.defaultActorId ?? app.selectedId;
    app.selectedDirection = catalog.defaultDirection ?? 'east';
    let loadError: unknown;
    try { await renderer.loadActors(catalog.actors, catalog.backgroundUrl); } catch (error) { loadError = error; }
    for (const definition of catalog.actors) {
      if (!renderer.assets.has(definition.id)) continue;
      const option = document.createElement('option'); option.value = definition.id; option.textContent = definition.name; dom.actorSelect.append(option);
    }
    if (!renderer.assets.size) throw loadError ?? new Error('Không có atlas có thể sử dụng.');
    if (!renderer.assets.has(app.selectedId)) throw loadError ?? new Error(`Không nạp được mẫu mặc định ${app.selectedId}.`);
    applyActorDefaults(app);
    dom.actorSelect.disabled = false; rebuildLocalActors(app); dom.stageMessage.hidden = true;
    if (loadError) { dom.actorNote.textContent = `Một số asset bị lỗi: ${String(loadError)}`; }
    startLoop(app);
    if (app.secondPlayer) await setMode(app, 'online');
    if (import.meta.env.DEV) installDebugHooks(app);
  } catch (error) {
    dom.stageMessage.hidden = false; dom.stageMessage.classList.add('error');
    dom.stageMessage.textContent = `Không mở được preview: ${error instanceof Error ? error.message : String(error)}`;
  }
}
