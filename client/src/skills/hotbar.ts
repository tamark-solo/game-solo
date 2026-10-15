import { R01_IDS, type SkillId } from '../../../shared/profiles';
import { SKILL_DEFINITIONS } from '../../../shared/skills/definitions';
import './hotbar.css';
import { HotbarEffects } from './hotbar-effects';

// Presentation metadata is separate from gameplay definitions and transport.
const ART: Record<SkillId, { kind: string; description: string; icon: string }> = {
  sword: {
    kind: 'Đơn mục tiêu · Theo hướng ngắm',
    description: 'Phóng kiếm khí theo hướng đang ngắm. Di chuyển hoặc chạm bản đồ để đổi hướng thi triển.',
    icon: '<path class="icon-aura" d="M16 49C8 35 19 13 47 10M14 48C31 52 49 33 51 17"/><path class="icon-blade" d="m42 8-5 21-17 16-5-5 16-17Z"/><path class="icon-detail" d="m17 35 13 13M16 43l-6 7M32 24l6 4"/><path class="icon-spark" d="m48 25 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/>',
  },
  thunder: {
    kind: 'Hồn công · Mục tiêu đã chọn',
    description: 'Giáng lôi vào mục tiêu đã chọn trong tầm. Cần một mục tiêu còn sức bền trước khi thi triển.',
    icon: '<circle class="icon-aura" cx="32" cy="34" r="22"/><path class="icon-ring" d="M13 42h38M17 47h30M23 51h18"/><path class="icon-bolt" d="M36 7 20 32h13l-7 24 19-31H32Z"/><path class="icon-detail" d="m11 19 4 3-2 5M48 13l-1 7 6 2"/>',
  },
  wind: {
    kind: 'Cơ động · Theo hướng ngắm',
    description: 'Lướt theo hướng ngắm để đổi vị trí và tránh vùng báo đòn. Đường lướt vẫn chịu giới hạn địa hình.',
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
  private readonly daoAn: boolean;
  private controller = new AbortController();

  constructor(mount: HTMLElement, private actions: Actions) {
    this.daoAn = mount.closest<HTMLElement>('#game-shell')?.dataset.uiDesign === 'dao-an-v3';
    const tooltipId = `hotbar-tooltip-${++hotbarSequence}`;
    this.root = document.createElement('section');
    this.root.className = 'game-hotbar';
    this.root.dataset.activated = 'true';
    this.root.setAttribute('aria-label', this.daoAn ? 'Thanh kỹ năng, 8 ô, phím F và 1 đến 7' : 'Thanh kỹ năng nhập môn, 10 ô, 3 thuật đã gán');
    const auxSlots = this.daoAn ? [] : [
      { key: 'G', name: 'Nghịch Châu', title: 'Thiên Nghịch Châu · Nội Giới Hộ Đạo (Phím G)', img: '/assets/g2-items/bead.png', action: 'chapter', pixel: true },
      { key: '5', name: 'Hồn Phiên', title: 'Triệu Hồi Chủ Hồn · Hồn Phiên Mốc II (Phím 5)', img: '/assets/g2-items/banner.png', action: 'chapter', pixel: true },
      { key: '6', name: 'Xạ Thần Xa', title: 'Chiến Thú Khôi Lỗi · Xạ Thần Xa Mốc II (Phím 6)', img: '/assets/g2-items/chariot.png', action: 'chapter', pixel: true },
      { key: 'H', name: 'Đan Lô', title: 'Mệnh Kiếp Chí & Lò Đan Lý Mộ Uyển (Phím H)', img: '/assets/character-ui-v2/lotus-pill.webp', action: 'chapter', pixel: false },
      { key: 'I', name: 'Túi Đồ', title: 'Túi Càn Khôn · Hành Trang & Pháp Bảo (Phím I)', img: '/assets/character-ui-v2/jade-charm.webp', action: 'character', pixel: false },
      { key: 'J', name: 'Mệnh Quyển', title: 'Thiên Mệnh Quyển · Sổ Nhiệm Vụ (Phím J)', img: '/assets/character-ui-v2/sect-seal.webp', action: 'journal', pixel: false },
      { key: 'C', name: 'Đạo Thân', title: 'Đạo Thân & Kinh Mạch Tu Luyện (Phím C)', img: '/assets/character-ui-v2/cloud-pearl.webp', action: 'character', pixel: false },
    ];
    this.root.innerHTML = `
      <p class="hotbar-feedback" role="status" aria-live="polite"></p>
      <div class="hotbar-tray">
        <div class="hotbar-surge-aura" aria-hidden="true"></div>
        <div class="hotbar-rail" aria-hidden="true"></div>
        <div class="hotbar-exp-bar" title="Tu Vi Cảnh Giới · 10 Phân Đoạn Đạo Cơ (Ngưng Khí Tầng 1)">
          <div class="hotbar-exp-fill" style="--exp-progress: 64%"></div>
          <div class="hotbar-exp-segments" aria-hidden="true">${'<i></i>'.repeat(10)}</div>
          <span class="hotbar-exp-caption">TU VI · 64%</span>
        </div>
        <div class="hotbar-orb hotbar-health">
          <div class="hotbar-hp-track hotbar-orb-glass" role="progressbar" aria-label="Sinh lực" aria-valuemin="0"><div class="hotbar-orb-liquid"></div><b class="hotbar-hp-value">100</b></div>
          <span class="hotbar-orb-label">Sinh lực</span><small class="hotbar-hp-ratio">/ 100</small>
          <div class="hotbar-orb-micro hotbar-orb-micro-left">
            <button type="button" class="hotbar-micro-btn" data-hotbar-action="toggle-style" title="Đổi Pháp Đài HUD: Kim Ngọc Liên Hoa ↔ Huyết Ma Kích Phát (Empire of Fire)">☯</button>
            <button type="button" class="hotbar-micro-btn" data-hotbar-action="toggle-surge" aria-pressed="true" title="Bật/Tắt Linh Quang Kích Phát (Activated Skill Bar Aura)">✦</button>
          </div>
        </div>
        <div class="hotbar-orb hotbar-mana">
          <div class="hotbar-mp-track hotbar-orb-glass" role="progressbar" aria-label="Linh lực" aria-valuemin="0"><div class="hotbar-orb-liquid"></div><b class="hotbar-mp-value">100</b></div>
          <span class="hotbar-orb-label">Linh lực</span><small class="hotbar-mp-ratio">/ 100</small>
          <div class="hotbar-orb-micro hotbar-orb-micro-right">
            <button type="button" class="hotbar-micro-btn" data-hotbar-action="journal" title="Mở Thiên Mệnh Quyển · Sổ Nhiệm Vụ (Phím J)">卷</button>
            <button type="button" class="hotbar-micro-btn" data-hotbar-action="chapter" title="Mở Nội Giới Thiên Nghịch Châu & Mệnh Kiếp Chí (Phím H)">丹</button>
          </div>
        </div>
        <div class="hotbar-frame" aria-hidden="true"></div>
        ${this.daoAn ? '<div class="dao-an-hotbar-title">THUẬT ĐANG VẬN DỤNG</div>' : ''}
        <div class="hotbar-slots">${this.daoAn ? '<div class="hotbar-slot-group"><button type="button" class="hotbar-slot dao-an-basic" data-hotbar-action="basic" aria-label="F · Đánh thường"><kbd>F</kbd><img src="/assets/character-ui-v2/wood-sword.webp" alt=""><span class="dao-an-slot-label">Đánh thường</span></button></div>' : ''}${R01_IDS.map(id => `
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
          </div>`).join('')}${auxSlots.map(slot => `
          <div class="hotbar-slot-group hotbar-reserved" title="${slot.title}">
            <span class="hotbar-slot hotbar-empty hotbar-aux-slot" role="button" tabindex="0" data-hotbar-action="${slot.action}" aria-label="${slot.title}">
              <img src="${slot.img}" width="32" height="32" alt="" class="hotbar-aux-img${slot.pixel ? ' is-pixel' : ''}">
              <svg viewBox="0 0 24 24"><path d="M12 4c-4 4-4 8 0 13 4-5 4-9 0-13ZM4 10c1 6 4 9 8 9-2-6-4-8-8-9Zm16 0c-4 1-6 3-8 9 4 0 7-3 8-9Z"/></svg>
              <kbd>${slot.key}</kbd>
            </span>
            <b class="hotbar-skill-name">${slot.name}</b>
          </div>`).join('')}
        ${this.daoAn ? '<div class="hotbar-slot-group"><button type="button" class="hotbar-slot dao-an-inventory" data-hotbar-action="inventory" data-hotbar-key="4" title="Mở hành trang để chọn vật tư hồi phục" aria-label="4 · Mở vật tư trong hành trang"><kbd>4</kbd><img src="/assets/character-ui-v2/lotus-pill.webp" alt=""><span class="dao-an-slot-label">Vật tư</span></button></div>'+['5','6','7'].map(key=>`<div class="hotbar-slot-group"><button type="button" class="hotbar-slot dao-an-empty" data-hotbar-action="empty" data-hotbar-key="${key}" aria-label="Ô ${key} · Chưa gán" title="Ô ${key} chưa gán kỹ năng hoặc vật phẩm"><kbd>${key}</kbd><span class="dao-an-empty-mark" aria-hidden="true">+</span><span class="dao-an-slot-label">Chưa gán</span></button></div>`).join('') : ''}</div>
        <div class="hotbar-footer"><span>${this.daoAn ? 'W A S D · Di chuyển　 SHIFT · Chạy nhanh' : '4 PHÁP BẢO · F Đánh gần · G Hộ Đạo · H Nội Giới'}</span><span class="hotbar-aim">↓ Hướng thi triển</span></div>
      </div>
      <div id="${tooltipId}" class="hotbar-tooltip" role="tooltip" hidden></div>`;
    mount.append(this.root);
    this.tooltip = this.root.querySelector('.hotbar-tooltip')!;
    this.message = this.root.querySelector('.hotbar-feedback')!;
    if (this.daoAn) {
      this.root.querySelector('.hotbar-exp-bar')?.remove();
      this.root.querySelectorAll<HTMLElement>('.hotbar-orb').forEach(node=>node.hidden=true);
      window.addEventListener('keydown',event=>{
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || !['4','5','6','7'].includes(event.key)) return;
        if (mount.closest<HTMLElement>('#game-shell')?.dataset.phase !== 'playing' || document.querySelector('dialog[open]') || (event.target as Element)?.closest('input,select,textarea,[contenteditable=true]')) return;
        event.preventDefault();
        this.root.querySelector<HTMLButtonElement>(`[data-hotbar-key="${event.key}"]`)?.click();
      },{signal:this.controller.signal});
    }
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
    this.root.addEventListener('click', event => {
      const target = (event.target as Element).closest<HTMLElement>('[data-hotbar-action]');
      if (!target) return;
      const action = target.dataset.hotbarAction;
      if (action === 'basic') {
        document.getElementById('basic-attack')?.click();
      } else if (action === 'inventory') {
        document.querySelector<HTMLButtonElement>('.dao-runtime-hud [data-dao-feature="inventory"]')?.click();
      } else if (action === 'empty') {
        this.actions.blocked(`Ô ${target.dataset.hotbarKey} chưa gán kỹ năng hoặc vật phẩm.`);
      } else if (action === 'toggle-style') {
        const shell = this.root.closest<HTMLElement>('#game-shell') ?? document.getElementById('game-shell');
        if (shell) {
          const order = ['empire-lotus', 'empire-fire', 'ink-wuxia'] as const;
          const labels: Record<string, string> = {
            'empire-lotus': 'Đã chuyển Pháp Đài: Thanh Ngọc Tiên Phong (Tru Tiên Thế Giới)',
            'empire-fire': 'Đã chuyển Pháp Đài: Huyết Ma Kích Phát (Nghịch Thủy Hàn)',
            'ink-wuxia': 'Đã chuyển Pháp Đài: Mạc Kim Cổ Phong (Yến Vân Thập Lục Thanh)',
          };
          const current = shell.dataset.hudStyle || 'empire-lotus';
          const next = order[(order.indexOf(current as typeof order[number]) + 1) % order.length];
          shell.dataset.hudStyle = next;
          try { localStorage.setItem('game-solo.hud-style.v1', next); } catch { /* ignore */ }
          window.dispatchEvent(new CustomEvent('dao:hud-style-change', { detail: { style: next } }));
          this.announce(labels[next]);
        }
      } else if (action === 'toggle-surge') {
        const next = this.root.dataset.activated !== 'true';
        this.root.dataset.activated = String(next);
        target.setAttribute('aria-pressed', String(next));
        this.announce(next ? 'Đã kích phát Linh Quang Pháp Đài' : 'Đã thu liễm Linh Quang Pháp Đài');
      } else if (action === 'chapter') {
        document.querySelector<HTMLButtonElement>('.chapter-launch')?.click();
      } else if (action === 'journal') {
        document.getElementById('journal')?.click();
      } else if (action === 'character') {
        document.getElementById('character-open')?.click();
      }
    });
    this.effects = new HotbarEffects(this.root, this.slots);
    if (this.daoAn) this.effects.setEnabled(false);
  }

  // UI availability explains the snapshot; authority remains with the caller/server.
  private status(id: SkillId): SlotStatus {
    const v = this.view;
    const remaining = Math.max(0, (v?.cooldownEnds[id] ?? 0) - (v?.now ?? 0));
    if (!v?.online) return { state: 'offline', label: 'Mất kết nối', reason: 'Đang mất kết nối. Kỹ năng sẽ sẵn sàng khi kết nối trở lại.', remaining };
    if (v.castingSkill) return { state: 'casting', label: v.castingSkill === id ? 'Đang thi triển' : 'Chờ thi triển', reason: `Đang thi triển ${SKILL_DEFINITIONS[v.castingSkill].name}.`, remaining };
    if (remaining > 0) return { state: 'cooldown', label: 'Đang hồi thuật', reason: `Còn ${(remaining / 1000).toFixed(1)} giây hồi thuật.`, remaining };
    if (v.mp < SKILL_DEFINITIONS[id].cost) return { state: 'resource', label: 'Thiếu linh lực', reason: `Cần ${SKILL_DEFINITIONS[id].cost} linh lực; hiện có ${Math.floor(v.mp)}.`, remaining };
    if (SKILL_DEFINITIONS[id].aim === 'target' && !v.hasTarget) return { state: 'target', label: 'Chọn mục tiêu', reason: `Chọn một mục tiêu trong tầm để dùng ${SKILL_DEFINITIONS[id].name}.`, remaining };
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
    if (this.daoAn) {
      this.root.dispatchEvent(new CustomEvent('dao:resources',{bubbles:true,detail:{hp,maxHp:view.maxHp,mp,maxMp:view.maxMp}}));
      const basic=this.root.querySelector<HTMLButtonElement>('[data-hotbar-action="basic"]')!;
      basic.disabled=!view.online || !!view.castingSkill;
    }
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

  dispose(): void { this.controller.abort(); this.effects.dispose(); this.root.remove(); }

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
