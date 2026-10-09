import type { AppState } from '../core/state';
import { dom } from '../core/elements';
import type { RenderActor } from '../render/renderer';
import { WORLD } from '@shared/world/map';

// Readouts above the stage. Runs about every 90 ms, not on every frame.
export function updateHUD(app: AppState, actors: RenderActor[]): void {
  const own = actors.find(a => a.own) ?? actors[0];
  const asset = app.renderer?.assets.get(app.selectedId);
  dom.positionReadout.textContent = own ? `${own.x.toFixed(1)} · ${own.y.toFixed(1)}` : '—';
  dom.renderReadout.textContent = `${Math.round(app.renderFPS)} FPS · ${actors.length} hình`;
  dom.thirdStat.textContent = app.mode === 'online' ? `${Math.round(app.network.latency)} ms` : String(asset ? Object.keys(asset.atlas.frames).length : 0);
  if (own) {
    const gaitFrames = own.animation.atlas.animations[`walk_${own.direction}`]?.length ?? 0;
    dom.fpsValue.textContent = app.mode === 'inspector' ? `${dom.fpsInput.value} FPS` : `${((app.mode === 'online' ? WORLD.speed : Number(dom.speedInput.value)) * gaitFrames / Number(dom.strideInput.value)).toFixed(1)} FPS · tự khớp`;
    const glide = app.renderer?.assets.get(own.assetId)?.definition.movementKind === 'glide';
    dom.frameCounter.textContent = `${own.animation.state === 'walk' ? (glide ? 'Lướt' : 'Đi') : (glide ? 'Lơ lửng' : 'Đứng')} · ${own.animation.frameIndex + 1} / ${own.animation.ids.length}`;
    dom.frameName.textContent = own.animation.frameId;
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.direction === own.direction)));
  } else { dom.frameCounter.textContent = 'Chưa có nhân vật'; dom.frameName.textContent = 'Vào sân để bắt đầu'; }
  dom.stageCorner.textContent = `PIXEL NATIVE · ${app.renderer?.zoom ?? 1}×`;
  dom.stageBadge.textContent = app.mode === 'online' ? 'VỊ TRÍ DO SERVER XỬ LÝ' : app.renderer?.debug ? 'ĐIỂM NEO · 32, 88' : 'NHÂN VẬT PIXEL · NỀN STYLIZED';
}
