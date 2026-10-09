import type { AppState } from '../core/state';
import { dom } from '../core/elements';
import type { Direction } from '@shared/world/types';
import { directionsForActor } from '../features/preview/model';
import { updatePreviewControls } from '../features/preview/view';
import { updateNetworkUI } from '../features/courtyard/view';

// Syncs the shared chrome (tabs, panels, stage title, zoom) with the current mode.
export function updateModeUI(app: AppState): void {
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === app.mode)));
  const online = app.mode === 'online', map = app.mode !== 'inspector';
  dom.actorControls.hidden = online; dom.onlineControls.hidden = !online;
  dom.animationControls.hidden = online; dom.movementControls.hidden = app.mode !== 'map';
  dom.onlineRoster.hidden = !online; dom.movementHelp.hidden = !map; dom.touchPad.hidden = !map;
  dom.followControl.hidden = !map;
  dom.gaitControl.hidden = !map;
  dom.gaitNote.hidden = !map;
  dom.backdrop.disabled = map;
  const definition = app.renderer?.assets.get(app.selectedId)?.definition;
  dom.sceneKicker.textContent = online ? 'MÔN PHÁI · KHU CHUNG' : map ? 'SÂN THỬ · CHUYỂN ĐỘNG CỤC BỘ' : 'NGHIÊN CỨU NHÂN VẬT';
  dom.sceneTitle.textContent = online ? 'Sân môn phái' : map ? 'Sân môn phái · map thử' : definition?.name ?? 'Đang nạp nhân vật';
  dom.sceneTag.textContent = online ? 'PHIÊN THỬ ONLINE' : definition?.id === 'CHR-WANG-LIN-CHIBI' ? 'CHIBI · 4 HƯỚNG' : definition?.previewOnlyDirection ? 'MẪU CHIBI MỚI' : '64 × 96 PX';
  dom.movementNote.textContent = online ? 'Dùng WASD / nút hướng. Hai cửa sổ cùng server sẽ gặp nhau trong sân.'
    : definition?.previewOnlyDirection ? 'Mẫu chibi hiện có hướng Đông. Giữ D / mũi tên phải hoặc nút → để đi.' : 'Bấm vào sân để điều khiển. Trụ giữa sân dùng thử va chạm và che khuất.';
  document.querySelectorAll<HTMLButtonElement>('[data-input]').forEach(button => {
    button.disabled = !online && !directionsForActor(app).includes(button.dataset.input as Direction);
  });
  dom.thirdStatLabel.textContent = online ? 'Độ trễ mạng' : 'Frame trong bộ';
  document.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.zoom) === app.renderer?.zoom)));
  updatePreviewControls(app);
  updateNetworkUI(app);
}
