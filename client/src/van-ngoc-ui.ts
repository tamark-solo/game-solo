import { CHARACTER_INFO, isAvatarId, type AvatarId } from '../../shared/profiles';
import type { LoadedActor } from './render/renderer';
import { attachFrameSurface } from './frame-surface';

const MOTION_KEY = 'hang-nhac.ui.motion.v1';

// Presentation only. The existing select/change handler owns profile selection.
// Sprite previews reuse the loaded native atlas, never introduce portrait assets.
export class VanNgocUI {
  private select = document.getElementById('avatar') as HTMLSelectElement;
  private root = document.getElementById('game-shell')!;
  private buttons = new Map<AvatarId, HTMLButtonElement>();
  private actors?: ReadonlyMap<string, LoadedActor>;
  private signature = '';
  private motion = document.getElementById('ui-reduced-motion') as HTMLInputElement;
  private media = matchMedia('(prefers-reduced-motion: reduce)');
  private controller = new AbortController();
  private motionChoice: boolean | undefined;

  constructor() {
    const signal = this.controller.signal;
    const choices = document.getElementById('avatar-choices')!;
    for (const [id, info] of Object.entries(CHARACTER_INFO)) {
      if (!isAvatarId(id)) continue;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'avatar-choice'; button.dataset.avatarChoice = id;
      button.setAttribute('aria-pressed', String(this.select.value === id));
      const sprite = document.createElement('i'); sprite.className = 'avatar-choice-sprite'; sprite.setAttribute('aria-hidden', 'true');
      const name = document.createElement('b'); name.textContent = info.name;
      button.append(sprite, name); choices.append(button); this.buttons.set(id, button);
      button.addEventListener('click', () => {
        if (this.select.disabled || this.select.value === id) return;
        this.select.value = id; this.select.dispatchEvent(new Event('change', { bubbles: true }));
      }, { signal });
    }
    document.querySelectorAll<HTMLElement>('.van-panel, .avatar-choice').forEach(attachFrameSurface);
    try {
      const stored = localStorage.getItem(MOTION_KEY);
      if (stored === 'reduce' || stored === 'full') this.motionChoice = stored === 'reduce';
    } catch { /* UI remains usable when preference storage is unavailable. */ }
    this.motion.addEventListener('change', () => {
      this.motionChoice = this.motion.checked;
      try { localStorage.setItem(MOTION_KEY, this.motionChoice ? 'reduce' : 'full'); } catch { /* session preference still applies */ }
      this.syncMotion();
    }, { signal });
    this.media.addEventListener('change', () => this.syncMotion(), { signal });
    this.syncMotion();
  }

  prepare(actors: ReadonlyMap<string, LoadedActor>): void {
    this.actors = actors;
    for (const [id, button] of this.buttons) this.sprite(button.querySelector<HTMLElement>('i')!, id, .75);
    this.signature = '';
  }

  sync(avatar: AvatarId, connection: string, saveFailed: boolean): void {
    this.root.dataset.connection = connection;
    document.getElementById('save-status')!.dataset.state = saveFailed ? 'error' : 'saved';
    for (const [id, button] of this.buttons) {
      button.disabled = this.select.disabled;
      button.setAttribute('aria-pressed', String(id === avatar));
    }
    const signature = `${avatar}:${!!this.actors}`;
    if (signature === this.signature) return;
    this.signature = signature;
    document.getElementById('entry-character')!.textContent = CHARACTER_INFO[avatar].name;
    document.querySelectorAll<HTMLElement>('[data-avatar-sprite]').forEach(node => {
      this.sprite(node, avatar, node.closest('.avatar-pedestal') ? 2 : .5);
    });
  }

  private sprite(node: HTMLElement, avatar: AvatarId, scale: number): void {
    const actor = this.actors?.get(avatar);
    if (!actor) return;
    const frame = actor.atlas.frames[actor.atlas.animations.stand_south[0]];
    node.style.width = `${frame.w * scale}px`; node.style.height = `${frame.h * scale}px`;
    node.style.backgroundImage = `url(${JSON.stringify(actor.definition.atlasUrl)})`;
    node.style.backgroundSize = `${actor.atlas.width * scale}px ${actor.atlas.height * scale}px`;
    node.style.backgroundPosition = `${-frame.x * scale}px ${-frame.y * scale}px`;
  }

  private syncMotion(): void {
    // OS reduced-motion is always respected, including when a saved preference requests full motion.
    const reduced = this.media.matches || this.motionChoice === true;
    this.motion.checked = reduced;
    this.motion.disabled = this.media.matches;
    document.getElementById('motion-description')!.textContent = this.media.matches ? 'Đang bật theo thiết lập của thiết bị' : 'Giữ vật liệu và phản hồi tĩnh';
    this.root.dataset.motion = reduced ? 'reduce' : 'full';
  }
  dispose(): void { this.controller.abort(); }
}
