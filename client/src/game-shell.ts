export type GameShellPhase = 'loading' | 'entry' | 'connecting' | 'playing';
export interface GameShellState {
  ready: boolean;
  opening: boolean;
  status: 'idle' | 'connecting' | 'reconnecting' | 'connected' | 'error';
  ownConnected: boolean;
}
export function gameShellPhase(state: GameShellState): GameShellPhase {
  if (!state.ready) return 'loading';
  if (state.opening || state.status === 'connecting' || state.status === 'reconnecting' ||
      state.status === 'connected' && !state.ownConnected) return 'connecting';
  return state.status === 'connected' && state.ownConnected ? 'playing' : 'entry';
}

// Browser shell only: no transport, gameplay state, storage, rewards or camera changes.
export class GameShell {
  private root = document.getElementById('game-shell')!;
  private entry = document.getElementById('entry-screen')!;
  private banner = document.getElementById('connection-banner')!;
  private menu = document.getElementById('game-menu') as HTMLDialogElement;
  private fullscreen = document.getElementById('fullscreen-toggle') as HTMLButtonElement;
  private message = document.getElementById('fullscreen-message')!;
  private controller = new AbortController();
  private phase: GameShellPhase = 'loading';
  constructor(private actions: { clearInput: () => void; focus: () => void;entryFocus?:()=>boolean }) {
    const signal = this.controller.signal;
    for (const id of ['menu-button', 'entry-settings']) {
      document.getElementById(id)!.addEventListener('click', () => this.openMenu(), { signal });
    }
    document.getElementById('menu-close')!.addEventListener('click', () => this.menu.close(), { signal });
    this.menu.addEventListener('close', () => { this.actions.clearInput(); this.focus(); }, { signal });
    document.getElementById('menu-character')!.addEventListener('click', () => {
      this.menu.close(); document.getElementById('leave')!.click();
    }, { signal });
    this.fullscreen.addEventListener('click', () => { void this.toggleFullscreen(); }, { signal });
    document.addEventListener('fullscreenchange', () => this.fullscreenState(), { signal });
    this.fullscreenState();
  }
  get blocking(): boolean { return this.phase !== 'playing' || this.menu.open; }
  get menuOpen(): boolean { return this.menu.open; }
  sync(state: GameShellState): void {
    const next = gameShellPhase(state), changed = this.phase !== next;
    this.phase = next; this.root.dataset.phase = next;
    this.entry.hidden = next !== 'entry'; this.banner.hidden = next !== 'connecting';
    const status = document.getElementById('status')!.textContent ?? '';
    this.banner.textContent = status || 'Đang đồng bộ hồ sơ…';
    document.getElementById('entry-status')!.textContent = state.status === 'error' ? status : '';
    (document.getElementById('menu-character') as HTMLButtonElement).disabled = next === 'entry' || next === 'loading';
    if (changed) {
      this.actions.clearInput();
      if (!this.menu.open) this.focus();
    }
  }
  focus(): void {
    if (this.menu.open) return;
    if (this.phase === 'entry') {
      if(this.actions.entryFocus?.())return;
      const join = document.getElementById('join') as HTMLButtonElement;
      if (!join.hidden && !join.disabled) join.focus();
    } else if (this.phase === 'playing') this.actions.focus();
  }
  openMenu(): void {
    if (this.menu.open) return;
    this.actions.clearInput(); this.menu.showModal();
  }
  private fullscreenState(): void {
    const active = !!document.fullscreenElement;
    this.fullscreen.textContent = active ? 'Thoát toàn màn hình' : 'Toàn màn hình';
    this.fullscreen.setAttribute('aria-pressed', String(active));
    this.fullscreen.disabled = !active && !document.fullscreenEnabled;
    if (!document.fullscreenEnabled) this.message.textContent = 'Màn game đã lấp cửa sổ. Trình duyệt này không hỗ trợ chế độ toàn màn hình riêng.';
  }
  private async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled) await this.root.requestFullscreen();
      this.message.textContent = ''; this.fullscreenState();
    } catch {
      this.message.textContent = 'Chưa mở được toàn màn hình. Game vẫn chơi trong toàn bộ cửa sổ trình duyệt.';
    }
  }
  diagnostics(): unknown { return { phase: this.phase, menu: this.menu.open, blocking: this.blocking, fullscreen: !!document.fullscreenElement }; }
  dispose(): void { this.controller.abort(); }
}
