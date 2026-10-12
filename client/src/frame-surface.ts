// Companion-frame backing only. No timers, observers, input, gameplay or storage.
export function attachFrameSurface(frame: HTMLElement): void {
  if ([...frame.children].some(child => child.classList.contains('vn-frame-surface'))) return;
  if (frame instanceof HTMLDialogElement) {
    const scroll = document.createElement('div'); scroll.className = 'vn-frame-scroll';
    while (frame.firstChild) scroll.append(frame.firstChild);
    frame.append(scroll);
  }
  const surface = document.createElement('span');
  surface.className = 'vn-frame-surface'; surface.setAttribute('aria-hidden', 'true');
  frame.prepend(surface);
}
