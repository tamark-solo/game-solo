import { R01_IDS, type SkillId } from '../../../shared/profiles';
import { SKILL_DEFINITIONS } from '../../../shared/skills/definitions';
import './hotbar.css';
import { HotbarEffects } from './hotbar-effects';

// Presentation metadata is separate from gameplay definitions and transport.
const ART: Record<SkillId, { kind: string; description: string; icon: string }> = {
  sword: {
    kind: 'Công kích · theo hướng ngắm',
    description: 'Phóng kiếm khí theo hướng đang ngắm. Đổi hướng di chuyển trước khi phát thuật sẽ ngắt thi triển.',
    icon: '<path class="icon-aura" d="M16 49C8 35 19 13 47 10M14 48C31 52 49 33 51 17"/><path class="icon-blade" d="m42 8-5 21-17 16-5-5 16-17Z"/><path class="icon-detail" d="m17 35 13 13M16 43l-6 7M32 24l6 4"/><path class="icon-spark" d="m48 25 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/>',
  },
  thunder: {
    kind: 'Công kích · mục tiêu đã chọn',
    description: 'Gọi lôi ấn xuống mục tiêu đã chọn trong tầm. Cần chọn mục tiêu trước khi thi triển.',
    icon: '<circle class="icon-aura" cx="32" cy="34" r="22"/><path class="icon-ring" d="M13 42h38M17 47h30M23 51h18"/><path class="icon-bolt" d="M36 7 20 32h13l-7 24 19-31H32Z"/><path class="icon-detail" d="m11 19 4 3-2 5M48 13l-1 7 6 2"/>',
  },
  wind: {
    kind: 'Thân pháp · theo hướng ngắm',
    description: 'Lướt theo hướng đang ngắm. Chọn khoảng trống phía trước; không thể lướt xuyên vùng chặn.',
    icon: '<path class="icon-aura" d="M10 42C4 22 28 8 48 15M16 51c18 10 42-8 40-27"/><path class="icon-wind" d="M10 29h27c15 0 13-16 5-16-5 0-7 4-5 7M7 36h39c12 0 12 17 3 17-5 0-7-4-5-7M17 22h10M16 44h16"/><path class="icon-feather" d="M19 51c2-12 10-26 27-31-4 17-15 27-27 31Z"/><path class="icon-detail" d="m19 51 23-27"/>',
  },
};

export interface HotbarView {
  now: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  online: boolean;
  hasTarget: boolean;
  castingSkill?: SkillId;
  cooldownEnds: Partial<Record<SkillId, number>>;
  aimLabel: string;
}

type Availability = 'ready' | 'cooldown' | 'casting' | 'resource' | 'target' | 'offline';
interface SlotStatus { state: Availability; label: string; reason: string; remaining: number }
interface Actions { cast: (id: SkillId) => void; blocked: (reason: string) => void }
let hotbarSequence = 0;

export class SkillHotbar {
  readonly root: HTMLElement;
  private view?: HotbarView;
  private tooltip: HTMLElement;
  private hovered?: SkillId;
  private message: HTMLElement;
  private slots = new Map<SkillId, HTMLButtonElement>();
  private renderSignature = '';
  private tooltipSignature = '';
  private effects: HotbarEffects;

  constructor(mount: HTMLElement, private actions: Actions) {
    const tooltipId = `hotbar-tooltip-${++hotbarSequence}`;
    this.root = document.createElement('section');
    this.root.className = 'game-hotbar';
    this.root.setAttribute('aria-label', 'Thanh kỹ năng nhập môn, 10 ô, 3 thuật đã gán');
    this.root.innerHTML = `
      <p class="hotbar-feedback" role="status" aria-live="polite"></p>
      <div class="hotbar-tray">
        <div class="hotbar-rail" aria-hidden="true"></div>
        <div class="hotbar-orb hotbar-health">
          <div class="hotbar-hp-track hotbar-orb-glass" role="progressbar" aria-label="Sinh lực" aria-valuemin="0"><div class="hotbar-orb-liquid"></div><b class="hotbar-hp-value">100</b></div>
          <span class="hotbar-orb-label">Sinh lực</span><small class="hotbar-hp-ratio">/ 100</small>
        </div>
        <div class="hotbar-orb hotbar-mana">
          <div class="hotbar-mp-track hotbar-orb-glass" role="progressbar" aria-label="Linh lực" aria-valuemin="0"><div class="hotbar-orb-liquid"></div><b class="hotbar-mp-value">100</b></div>
          <span class="hotbar-orb-label">Linh lực</span><small class="hotbar-mp-ratio">/ 100</small>
        </div>
        <div class="hotbar-frame" aria-hidden="true"></div>
        <div class="hotbar-slots">${R01_IDS.map(id => `
          <div class="hotbar-slot-group">
            <button class="hotbar-slot hotbar-${id}" data-hotbar-skill="${id}" data-skill="${id}" type="button" aria-describedby="${tooltipId}">
              <kbd>${SKILL_DEFINITIONS[id].shortcut}</kbd>
              <svg class="hotbar-icon" viewBox="0 0 64 64" aria-hidden="true">${ART[id].icon}</svg>
              <span class="hotbar-art hotbar-art-${id}" aria-hidden="true"></span>
              <span class="hotbar-cooldown" aria-hidden="true"></span>
              <strong class="hotbar-state-mark" aria-hidden="true"></strong>
              <span class="hotbar-cost" aria-hidden="true"><i></i>${SKILL_DEFINITIONS[id].cost}</span>
            </button>
            <b class="hotbar-skill-name">${SKILL_DEFINITIONS[id].name}</b>
            <span class="hotbar-slot-status">Sẵn sàng</span>
          </div>`).join('')}${Array.from({ length: 7 }, (_, index) => `
          <div class="hotbar-slot-group hotbar-reserved" aria-hidden="true"><span class="hotbar-slot hotbar-empty"><svg viewBox="0 0 24 24"><path d="M12 4c-4 4-4 8 0 13 4-5 4-9 0-13ZM4 10c1 6 4 9 8 9-2-6-4-8-8-9Zm16 0c-4 1-6 3-8 9 4 0 7-3 8-9Z"/></svg><kbd>${(index + 4) % 10}</kbd></span></div>`).join('')}
        </div>
        <div class="hotbar-footer"><span>THUẬT NHẬP MÔN</span><span class="hotbar-aim">↓ Hướng thi triển</span></div>
      </div>
      <div id="${tooltipId}" class="hotbar-tooltip" role="tooltip" hidden></div>`;
    mount.append(this.root);
    this.tooltip = this.root.querySelector('.hotbar-tooltip')!;
    this.message = this.root.querySelector('.hotbar-feedback')!;
    for (const id of R01_IDS) {
      const button = this.root.querySelector<HTMLButtonElement>(`[data-hotbar-skill="${id}"]`)!;
      this.slots.set(id, button);
      button.addEventListener('click', () => this.activate(id));
      button.addEventListener('pointerenter', () => this.showTooltip(id));
      button.addEventListener('pointerleave', () => { if (document.activeElement !== button) this.hideTooltip(); });
      button.addEventListener('focus', () => this.showTooltip(id));
      button.addEventListener('blur', () => this.hideTooltip());
      button.addEventListener('keydown', event => { if (event.key === 'Escape') this.hideTooltip(); });
    }
    this.effects = new HotbarEffects(this.root, this.slots);
  }

  // UI availability explains the snapshot; authority remains with the caller/server.
  private status(id: SkillId): SlotStatus {
    const v = this.view;
    const remaining = Math.max(0, (v?.cooldownEnds[id] ?? 0) - (v?.now ?? 0));
    if (!v?.online) return { state: 'offline', label: 'Mất kết nối', reason: 'Đang mất kết nối. Kỹ năng sẽ sẵn sàng khi kết nối trở lại.', remaining };
    if (v.castingSkill) return { state: 'casting', label: v.castingSkill === id ? 'Đang thi triển' : 'Chờ thi triển', reason: `Đang thi triển ${SKILL_DEFINITIONS[v.castingSkill].name}.`, remaining };
    if (remaining > 0) return { state: 'cooldown', label: 'Đang hồi thuật', reason: `Còn ${(remaining / 1000).toFixed(1)} giây hồi thuật.`, remaining };
    if (v.mp < SKILL_DEFINITIONS[id].cost) return { state: 'resource', label: 'Thiếu linh lực', reason: `Cần ${SKILL_DEFINITIONS[id].cost} linh lực; hiện có ${Math.floor(v.mp)}.`, remaining };
    if (SKILL_DEFINITIONS[id].aim === 'target' && !v.hasTarget) return { state: 'target', label: 'Chọn mục tiêu', reason: 'Chọn một mục tiêu trong tầm để dùng Lôi Ấn.', remaining };
    return { state: 'ready', label: 'Sẵn sàng', reason: '', remaining };
  }

  activate(id: SkillId): void {
    const status = this.status(id);
    if (status.state === 'ready') this.actions.cast(id);
    else this.actions.blocked(status.reason);
  }

  update(view: HotbarView): void {
    this.view = view;
    const mp = Math.max(0, Math.min(view.maxMp, view.mp));
    const hp = Math.max(0, Math.min(view.maxHp, view.hp));
    const signature = JSON.stringify([Math.floor(hp), view.maxHp, Math.floor(mp), view.maxMp, view.online, view.hasTarget, view.castingSkill, view.aimLabel,
      ...R01_IDS.map(id => Math.ceil(Math.max(0, (view.cooldownEnds[id] ?? 0) - view.now) / 100))]);
    if (signature === this.renderSignature) return;
    this.renderSignature = signature;
    this.root.dataset.online = String(view.online);
    for (const resource of [{ key: 'hp', label: 'Sinh lực', value: hp, max: view.maxHp }, { key: 'mp', label: 'Linh lực', value: mp, max: view.maxMp }]) {
      this.root.querySelector(`.hotbar-${resource.key}-value`)!.textContent = String(Math.floor(resource.value));
      this.root.querySelector(`.hotbar-${resource.key}-ratio`)!.textContent = `/ ${resource.max}`;
      const track = this.root.querySelector<HTMLElement>(`.hotbar-${resource.key}-track`)!;
      track.setAttribute('aria-valuemax', String(resource.max));
      track.setAttribute('aria-valuenow', String(Math.floor(resource.value)));
      track.setAttribute('title', `${resource.label} ${Math.floor(resource.value)} / ${resource.max}`);
      track.style.setProperty('--resource', `${resource.max > 0 ? resource.value / resource.max * 100 : 0}%`);
    }
    this.root.querySelector('.hotbar-aim')!.textContent = view.aimLabel;
    const states = new Map<SkillId, string>();
    for (const [id, button] of this.slots) {
      const status = this.status(id);
      states.set(id, status.state);
      const definition = SKILL_DEFINITIONS[id];
      button.dataset.state = status.state;
      button.setAttribute('aria-disabled', String(status.state !== 'ready'));
      button.setAttribute('aria-label', `${definition.name}, phím ${definition.shortcut}, ${definition.cost} linh lực. ${status.reason || status.label}`);
      button.style.setProperty('--cooldown', `${Math.min(1, status.remaining / definition.cooldown) * 360}deg`);
      button.querySelector('.hotbar-state-mark')!.textContent = status.state === 'cooldown' ? (status.remaining / 1000).toFixed(1) :
        status.state === 'casting' ? '···' : ['resource', 'target', 'offline'].includes(status.state) ? '!' : '';
      button.parentElement!.querySelector('.hotbar-slot-status')!.textContent = status.label;
    }
    this.effects.update({ online: view.online, castingSkill: view.castingSkill, states });
    if (this.hovered) this.showTooltip(this.hovered);
  }

  announce(message: string): void {
    this.message.textContent = message;
    this.message.classList.toggle('visible', Boolean(message));
  }

  setIconAtlas(url: string): void {
    this.root.style.setProperty('--icon-atlas', `url("${url}")`);
    this.root.dataset.art = 'painted';
  }

  setFrame(url: string): void { this.root.style.setProperty('--hud-frame', `url("${url}")`); }
  setOrbTexture(url: string): void { this.root.style.setProperty('--orb-texture', `url("${url}")`); }

  setEffectsEnabled(enabled: boolean): void { this.effects.setEnabled(enabled); }

  dispose(): void { this.effects.dispose(); this.root.remove(); }

  private showTooltip(id: SkillId): void {
    this.hovered = id;
    const skill = SKILL_DEFINITIONS[id];
    const status = this.status(id);
    const signature = JSON.stringify([id, status.state, status.reason]);
    if (signature === this.tooltipSignature && !this.tooltip.hidden) return;
    this.tooltipSignature = signature;
    this.tooltip.dataset.skill = id;
    this.tooltip.innerHTML = `<div class="hotbar-tooltip-title"><b>${skill.name}</b><kbd>${skill.shortcut}</kbd></div>
      <span class="hotbar-tooltip-kind">${ART[id].kind}</span>
      <p>${ART[id].description}</p>
      <div class="hotbar-tooltip-facts"><span><b>${skill.cost}</b> linh lực</span><span>Hồi thuật <b>${skill.cooldown / 1000} giây</b></span></div>
      ${status.reason ? `<p class="hotbar-tooltip-reason">${status.reason}</p>` : ''}`;
    this.tooltip.hidden = false;
    // Position above the hovered skill, clear of the ornamental resource sockets.
    const bar = this.root.getBoundingClientRect(), tip = this.tooltip.getBoundingClientRect();
    const slot = this.slots.get(id)!.getBoundingClientRect();
    const preferredLeft = slot.left + slot.width / 2 - tip.width / 2;
    const bounds = this.root.closest('#stage')?.getBoundingClientRect();
    const minLeft = (bounds?.left ?? 0) + 12, maxRight = (bounds?.right ?? window.innerWidth) - 12;
    const left = Math.max(minLeft, Math.min(maxRight - tip.width, preferredLeft));
    const top = Math.max((bounds?.top ?? 0) + 12, Math.min((bounds?.bottom ?? window.innerHeight) - tip.height - 12, bar.top - tip.height - 8));
    this.tooltip.style.left = `${left - bar.left}px`;
    this.tooltip.style.top = `${top - bar.top}px`;
  }

  hideTooltip(): void { this.hovered = undefined; this.tooltipSignature = ''; this.tooltip.hidden = true; }
}
