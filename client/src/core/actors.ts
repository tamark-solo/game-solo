import { AnimationPlayer } from '../assets/animation';
import type { RenderActor } from '../render/renderer';
import type { AppState } from './state';
import { dom } from './elements';

// Builds a render actor from a loaded asset. Shared by the preview and the online courtyard.
export function createActor(app: AppState, id: string, assetId: string, name: string, x: number, y: number, own: boolean): RenderActor {
  const asset = app.renderer!.assets.get(assetId);
  if (!asset) throw new Error(`Chưa nạp được bộ ${assetId}.`);
  const animation = new AnimationPlayer(asset.atlas); animation.fps = Number(dom.fpsInput.value);
  return { id, assetId, name, own, x, y, direction: app.selectedDirection, moving: false, animation };
}
