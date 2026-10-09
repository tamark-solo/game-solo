import type { AppState } from '../../core/state';
import { clearInput } from '../../core/input';
import { dom } from '../../core/elements';

// Join and leave the courtyard, open a second player window, and leave when the page closes.
export function bindCourtyardControls(app: AppState): void {
  dom.joinButton.addEventListener('click', () => { clearInput(); void app.network.connect(dom.serverInput.value, dom.nameInput.value, dom.avatarSelect.value); });
  dom.leaveButton.addEventListener('click', () => { clearInput(); void app.network.leave(); });
  dom.secondWindow.addEventListener('click', () => {
    const url = new URL(location.href); url.searchParams.set('player', '2');
    window.open(url.toString(), '_blank', 'noopener');
  });
  window.addEventListener('pagehide', () => { clearInput(); void app.network.leave(); });
}
