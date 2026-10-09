import type { Direction, Input } from '@shared/world/types';
import type { AppState } from './state';
import { dom } from './elements';

const keys = new Set<string>();
const touch = new Set<Direction>();

export function clearInput(): void {
  keys.clear(); touch.clear();
  document.querySelectorAll('.touch-pad button').forEach(b => b.classList.remove('active'));
}

// Direction from keyboard and touch pad. Ignored while typing or when the preview is paused.
export function readInput(app: AppState): Input {
  if (!document.hasFocus() || document.hidden || (app.mode !== 'online' && app.paused)) return { x: 0, y: 0 };
  const focused = document.activeElement;
  if (focused?.matches('input,select,textarea,button:not([data-input])')) return { x: 0, y: 0 };
  return {
    x: Number(keys.has('d') || keys.has('arrowright') || touch.has('east')) - Number(keys.has('a') || keys.has('arrowleft') || touch.has('west')),
    y: Number(keys.has('s') || keys.has('arrowdown') || touch.has('south')) - Number(keys.has('w') || keys.has('arrowup') || touch.has('north')),
  };
}

export function bindInputListeners(app: AppState): void {
  window.addEventListener('keydown', event => {
    if (app.mode === 'inspector' || event.ctrlKey || event.metaKey || event.altKey ||
        (event.target as HTMLElement).closest('input,select,textarea,button')) return;
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) { keys.add(key); event.preventDefault(); }
  });
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => clearInput());
  document.addEventListener('visibilitychange', () => clearInput());
  dom.stage.addEventListener('pointerdown', () => dom.stage.focus({ preventScroll: true }));
  document.querySelectorAll<HTMLButtonElement>('[data-input]').forEach(button => {
    const direction = button.dataset.input as Direction;
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); button.setPointerCapture(event.pointerId); touch.add(direction); button.classList.add('active'); dom.stage.focus({ preventScroll: true });
    });
    const release = () => { touch.delete(direction); button.classList.remove('active'); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });
}
