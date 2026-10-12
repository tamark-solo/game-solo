import { HUD_CATEGORIES, HUD_FEATURES, HUD_MAIN_DOCK, HUD_RELATED, HUD_SOCIAL_DOCK, HUD_WORLD_DOCK, hudFeature, type HudCategory, type HudFeatureId } from '../core/dao-hud-system';
import { hudGlyph } from './dao-hud-glyph';
import { SECT_STATIONS } from '../../../shared/sect';
import './dao-runtime-hud.css';

export type DaoRuntimeCharacterTab = 'overview' | 'inventory' | 'equipment' | 'cultivation' | 'spells';
export interface DaoRuntimeHudOptions {
  openCharacter: (tab: DaoRuntimeCharacterTab) => void;
  openJournal: () => void;
  openSettings: () => void;
  openCrafting: () => void;
  feedback: (message: string) => void;
  focus: () => void;
  attachSurface: (frame: HTMLElement) => void;
  modalChanged?: (open: boolean) => void;
}
export interface DaoRuntimeHudSnapshot {
  connected: boolean;
  name?: string;
  cultivation?: number;
  realm?: string;
  x?: number;
  y?: number;
  map?: { name: string; width: number; height: number; backgroundUrl: string;pins?:Array<{id:string;name:string;area:string;x:number;y:number}> };
  target?: { name: string; x: number; y: number; hp?: number; maxHp?: number } | null;
}

const esc = (text: string) => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const folded = (text: string) => text.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd');
const PIN_KEY = 'game-solo.dao-hud.pins.v1';
const available = new Set<HudFeatureId>(['character', 'inventory', 'equipment', 'cultivation', 'spells', 'quest', 'map', 'settings', 'crafting']);
const shortcuts: Partial<Record<HudFeatureId, string>> = { character: 'C', inventory: 'I', quest: 'J', map: 'M' };
const iconButton = (id: HudFeatureId) => `<button type="button" class="dao-hud-icon" data-dao-feature="${id}" aria-label="${hudFeature(id)!.label}" title="${hudFeature(id)!.label}${shortcuts[id] ? ` · ${shortcuts[id]}` : ''}">${hudGlyph(id)}<span>${hudFeature(id)!.label}</span>${shortcuts[id] ? `<kbd>${shortcuts[id]}</kbd>` : ''}</button>`;
const systemsButton = () => '<button type="button" class="dao-hud-icon dao-hud-systems" data-dao-systems aria-label="Mở toàn bộ chức năng"><span class="dao-hud-menu-mark" aria-hidden="true">☷</span><span>Chức năng</span></button>';

/** Presentation adapter for the live world. It never sends a gameplay command. */
export class DaoRuntimeHud {
  private root: HTMLDivElement;
  private dialog: HTMLDialogElement;
  private snapshot: DaoRuntimeHudSnapshot = { connected: false };
  private pins = this.readPins();
  private category: HudCategory | 'all' = 'all';
  private search = '';
  private screen: 'systems' | 'map' | 'unavailable' = 'systems';
  private mapSignature = '';
  private logEntries: string[] = [];
  private observedText = new Map<HTMLElement, string>();
  private observer: MutationObserver;
  private transferFocus = false;

  constructor(private stage: HTMLElement, private options: DaoRuntimeHudOptions) {
    stage.dataset.daoHud = '05';
    this.root = document.createElement('div');
    this.root.className = 'dao-runtime-hud';
    this.root.dataset.gameUi = '';
    this.root.dataset.playingUi = '';
    this.root.innerHTML = `<nav class="dao-world-dock" aria-label="Hoạt động và tổ đội">${HUD_WORLD_DOCK.map(iconButton).join('')}</nav>
      <section class="dao-hud-map" aria-label="Bản đồ khu vực"><b class="dao-hud-map-name">HẰNG NHẠC</b><button type="button" class="dao-minimap" data-dao-feature="map" aria-label="Mở bản đồ Hằng Nhạc"><span class="dao-map-north" aria-hidden="true">B</span><span class="dao-minimap-plane" data-dao-map-plane><img alt="Bản đồ khu vực hiện tại" draggable="false" hidden><i class="dao-player-dot" data-dao-player-dot hidden></i><i class="dao-target-dot" data-dao-target-dot hidden></i></span></button><span class="dao-hud-coordinates">Chờ vị trí</span><nav class="dao-map-tools" aria-label="Thư, thông báo và thiết lập">${(['mail', 'notifications'] as const).map(id => `<button type="button" data-dao-feature="${id}" aria-label="${hudFeature(id)!.label}" title="${hudFeature(id)!.label}">${hudGlyph(id)}</button>`).join('')}</nav></section>
      <section class="dao-hud-journal" aria-label="Nhật ký phiên"><header><b>Nhật ký</b><button type="button" data-dao-log-toggle aria-expanded="false" aria-controls="dao-hud-log" aria-label="Mở nhật ký">+</button></header><ol id="dao-hud-log" hidden><li>Chưa có thông báo.</li></ol><nav class="dao-social-dock" aria-label="Cộng đồng">${HUD_SOCIAL_DOCK.map(iconButton).join('')}</nav></section>
      <nav class="dao-main-dock" aria-label="Chức năng đã ghim"></nav><nav class="dao-mobile-dock" aria-label="Chức năng nhanh">${(['character', 'inventory', 'quest', 'map'] as const).map(iconButton).join('')}${systemsButton()}</nav>`;
    stage.append(this.root);
    this.renderPins();
    this.enhanceExistingNodes();
    const journey = stage.closest('#game-shell')!.querySelector<HTMLElement>('.chapter-launch');
    if (journey) { journey.classList.add('dao-hud-icon'); this.root.querySelector('.dao-world-dock')!.append(journey); }
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'dao-hud-dialog';
    this.dialog.className = 'dao-runtime-dialog van-panel';
    this.dialog.dataset.gameUi = '';
    this.dialog.setAttribute('aria-labelledby', 'dao-hud-dialog-title');
    stage.closest('#game-shell')!.append(this.dialog);
    this.root.addEventListener('click', this.click);
    this.dialog.addEventListener('click', this.click);
    this.dialog.addEventListener('input', event => {
      if (event.target instanceof HTMLInputElement && event.target.id === 'dao-hud-search') {
        this.search = event.target.value;
        this.renderDirectory();
      }
    });
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(); });
    this.dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); this.close(); } });
    this.dialog.addEventListener('close', () => {
      this.options.modalChanged?.(false);
      if (!this.transferFocus) this.options.focus();
      this.transferFocus = false;
    });
    const watched = ['sect-feedback', 'skill-feedback', 'save-status'].map(id => document.getElementById(id)).filter((node): node is HTMLElement => !!node);
    this.observer = new MutationObserver(() => {
      for (const node of watched) {
        const message = node.textContent?.trim() ?? '';
        if (message && message !== this.observedText.get(node)) this.log(message);
        this.observedText.set(node, message);
      }
    });
    for (const node of watched) {
      this.observedText.set(node, node.textContent?.trim() ?? '');
      this.observer.observe(node, { childList: true, subtree: true, characterData: true });
    }
  }

  get modal(): boolean { return this.dialog.open; }

  private enhanceExistingNodes(): void {
    const identity = this.stage.querySelector<HTMLElement>('.player-hud');
    const characterButton = document.getElementById('character-open');
    const emblem = identity?.querySelector('.player-emblem');
    identity?.classList.add('dao-live-identity');
    if (identity && characterButton && emblem) {
      characterButton.classList.add('dao-identity-open');
      characterButton.replaceChildren(emblem);
      identity.append(characterButton);
    }
    const identityText = identity?.querySelector('.player-identity');
    if (identityText) {
      const label = document.createElement('small'); label.className = 'dao-identity-label'; label.textContent = 'ĐẠO HỮU'; identityText.prepend(label);
      const cultivation = document.createElement('button');
      cultivation.type = 'button'; cultivation.className = 'dao-identity-cultivation';
      cultivation.innerHTML = '<span>Tu vi <b data-dao-cultivation>—</b></span><span>Tu đạo ↗</span>';
      cultivation.addEventListener('click', () => this.options.openCharacter('cultivation'));
      identityText.append(cultivation);
    }
    document.getElementById('sect-objective')?.classList.add('dao-live-quest');
    const skillPanel = this.stage.querySelector<HTMLElement>('.skill-panel');
    skillPanel?.classList.add('dao-live-target');
    if (skillPanel) {
      const target = document.createElement('b'); target.className = 'dao-live-target-name'; target.textContent = 'Chưa chọn mục tiêu';
      skillPanel.prepend(target);
      skillPanel.dataset.hasTarget = 'false';
    }
    const mapTools = this.root.querySelector('.dao-map-tools')!;
    const settings = document.getElementById('menu-button');
    if (settings) { settings.innerHTML = hudGlyph('settings'); mapTools.append(settings); }
    const connection = document.getElementById('connection-indicator');
    if (connection) this.root.querySelector('.dao-hud-map')!.append(connection);
    this.stage.querySelector('.shell-actions')?.setAttribute('hidden', '');
  }

  update(snapshot: DaoRuntimeHudSnapshot): void {
    this.snapshot = { ...this.snapshot, ...snapshot };
    this.root.dataset.connected = String(snapshot.connected);
    if (snapshot.cultivation !== undefined) this.setText(this.stage.querySelector('[data-dao-cultivation]'), String(snapshot.cultivation));
    if (snapshot.name !== undefined) this.setText(document.getElementById('character-name'), snapshot.name);
    const realm = this.stage.querySelector('.dao-identity-label');
    if (snapshot.realm !== undefined) this.setText(realm, snapshot.realm || 'ĐẠO HỮU');
    if (snapshot.target !== undefined) {
      const target = snapshot.target;
      this.stage.querySelector<HTMLElement>('.dao-live-target')!.dataset.hasTarget = String(!!target);
      this.setText(this.stage.querySelector('.dao-live-target-name'), target ? `${target.name}${target.hp !== undefined && target.maxHp !== undefined ? ` · ${Math.ceil(target.hp)}/${target.maxHp}` : ''}` : 'Chưa chọn mục tiêu');
    }
    this.renderMapState();
  }

  openSystems(): void {
    this.screen = 'systems';
    this.setDialog('Chức năng', 'Bảy nhóm · ghim tối đa năm lối thường dùng', `<label class="dao-hud-search" for="dao-hud-search">Tìm chức năng<input id="dao-hud-search" type="search" maxlength="80" value="${esc(this.search)}" placeholder="Nhân vật, thuật pháp, nhiệm vụ…" autocomplete="off"></label><nav class="dao-directory-tabs" aria-label="Nhóm chức năng"><button type="button" data-dao-category="all" aria-pressed="${this.category === 'all'}">Tất cả · ${HUD_FEATURES.length}</button>${Object.entries(HUD_CATEGORIES).map(([id, label]) => `<button type="button" data-dao-category="${id}" aria-pressed="${this.category === id}">${label}</button>`).join('')}</nav><p class="dao-directory-status" role="status">Chọn biểu tượng để mở; ghim lối thường dùng lên HUD.</p><div class="dao-directory-groups"></div>`);
    this.renderDirectory();
  }

  openMap(): void {
    this.screen = 'map';
    const pins=this.snapshot.map?.pins??SECT_STATIONS;
    this.setDialog(`Bản đồ · ${this.snapshot.map?.name??'Hằng Nhạc'}`, 'Vị trí và điểm tương tác trong khu vực', `<div class="dao-world-map" data-dao-map-plane><img alt="Bản đồ khu vực đang chơi" draggable="false" hidden>${pins.map(station => `<span class="dao-map-station" data-dao-station="${station.id}" title="${station.name} · ${station.area}"><i aria-hidden="true">◇</i><span>${station.name}</span></span>`).join('')}<i class="dao-player-dot" data-dao-player-dot hidden title="Vị trí của bạn"></i><i class="dao-target-dot" data-dao-target-dot hidden title="Mục tiêu đang chọn"></i></div><p class="dao-map-legend"><span><i class="dao-player-dot"></i> Bạn</span><span><i class="dao-target-dot"></i> Mục tiêu</span><span>◇ Điểm tương tác</span></p><p class="dao-map-message"></p>`);
    this.mapSignature = '';
    this.renderMapState();
  }

  close(): void { if (this.modal) this.dialog.close(); }

  private openFeature(id: HudFeatureId): void {
    const characterTabs: Partial<Record<HudFeatureId, DaoRuntimeCharacterTab>> = { character: 'overview', inventory: 'inventory', equipment: 'equipment', cultivation: 'cultivation', spells: 'spells' };
    const tab = characterTabs[id];
    if (tab || id === 'quest' || id === 'settings' || id === 'crafting') {
      this.transferFocus = this.modal;
      this.close();
      if (tab) this.options.openCharacter(tab);
      else if (id === 'quest') this.options.openJournal();
      else if (id === 'crafting') this.options.openCrafting();
      else this.options.openSettings();
      return;
    }
    if (id === 'map') { this.openMap(); return; }
    const feature = hudFeature(id)!;
    this.screen = 'unavailable';
    const related = (HUD_RELATED[id] ?? []).filter(next => available.has(next));
    this.setDialog(feature.title, HUD_CATEGORIES[feature.category], `<article class="dao-feature-unavailable">${hudGlyph(id)}<h3>Chưa mở</h3><p>${esc(feature.label)} chưa khả dụng trong phiên bản hiện tại.</p><p>Bạn có thể tiếp tục hành trình Hằng Nhạc và các chức năng đã mở.</p>${related.length ? `<nav aria-label="Chức năng liên quan">${related.map(iconButton).join('')}</nav>` : ''}<button type="button" class="game-button" data-dao-systems>Danh mục chức năng</button></article>`);
  }

  private setDialog(title: string, subtitle: string, body: string): void {
    this.dialog.innerHTML = `<header class="dao-runtime-dialog-heading"><div><span>VÂN HẢI ĐẠO ĐỒ</span><h2 id="dao-hud-dialog-title">${esc(title)}</h2><p>${esc(subtitle)}</p></div><button type="button" class="game-button" data-dao-close aria-label="Đóng cửa sổ">×</button></header><div class="dao-runtime-dialog-body">${body}</div>`;
    this.dialog.dataset.screen = this.screen;
    this.options.attachSurface(this.dialog);
    if (!this.modal) { this.dialog.showModal(); this.options.modalChanged?.(true); }
  }

  private renderDirectory(): void {
    const container = this.dialog.querySelector('.dao-directory-groups');
    if (!container) return;
    const query = folded(this.search);
    container.innerHTML = Object.entries(HUD_CATEGORIES).filter(([id]) => this.category === 'all' || this.category === id).map(([id, label]) => {
      const features = HUD_FEATURES.filter(feature => feature.category === id && folded(`${feature.label} ${feature.title}`).includes(query));
      if (!features.length) return '';
      return `<section class="dao-directory-group"><h3>${label}<small>${features.length}</small></h3><div class="dao-directory-grid">${features.map(feature => `<article class="dao-directory-entry"><button type="button" data-dao-feature="${feature.id}" class="dao-directory-item">${hudGlyph(feature.id)}<span><b>${feature.label}</b><small>${available.has(feature.id) ? 'Đã mở' : 'Chưa mở'}</small></span></button><button type="button" class="dao-directory-pin" data-dao-pin="${feature.id}" aria-pressed="${this.pins.includes(feature.id)}" aria-label="${this.pins.includes(feature.id) ? 'Bỏ ghim' : 'Ghim'} ${feature.label}">${this.pins.includes(feature.id) ? '◆ Đã ghim' : '+ Ghim HUD'}</button></article>`).join('')}</div></section>`;
    }).join('') || '<p class="dao-search-empty">Không có chức năng phù hợp. Thử tên khác hoặc chọn Tất cả.</p>';
    this.dialog.querySelectorAll<HTMLElement>('[data-dao-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.daoCategory === this.category)));
  }

  private renderPins(): void { this.root.querySelector('.dao-main-dock')!.innerHTML = this.pins.map(iconButton).join('') + systemsButton(); }

  private readPins(): HudFeatureId[] {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(PIN_KEY) ?? 'null');
      if (Array.isArray(saved)) return [...new Set(saved.filter((id): id is HudFeatureId => typeof id === 'string' && !!hudFeature(id)))].slice(0, 5);
    } catch { /* Presentation preferences may be unavailable in private browsing. */ }
    return [...HUD_MAIN_DOCK];
  }

  private pin(id: HudFeatureId): void {
    const status = this.dialog.querySelector('.dao-directory-status');
    if (this.pins.includes(id)) this.pins = this.pins.filter(pin => pin !== id);
    else if (this.pins.length < 5) this.pins.push(id);
    else { this.setText(status, 'Đã ghim năm chức năng. Bỏ một ghim để thêm lối mới.'); return; }
    try { localStorage.setItem(PIN_KEY, JSON.stringify(this.pins)); } catch { /* A session-only selection is still usable. */ }
    this.renderPins(); this.renderDirectory();
    this.setText(status, `${this.pins.length}/5 lối đã ghim trên HUD.`);
    this.dialog.querySelector<HTMLButtonElement>(`[data-dao-pin="${id}"]`)?.focus();
  }

  private click = (event: MouseEvent): void => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;
    const feature = button.dataset.daoFeature;
    const pin = button.dataset.daoPin;
    const category = button.dataset.daoCategory;
    if (feature && hudFeature(feature)) this.openFeature(feature as HudFeatureId);
    else if (pin && hudFeature(pin)) this.pin(pin as HudFeatureId);
    else if (category && (category === 'all' || category in HUD_CATEGORIES)) { this.category = category as HudCategory | 'all'; this.renderDirectory(); }
    else if (button.hasAttribute('data-dao-systems')) this.openSystems();
    else if (button.hasAttribute('data-dao-close')) this.close();
    else if (button.hasAttribute('data-dao-log-toggle')) {
      const log = this.root.querySelector<HTMLElement>('#dao-hud-log')!;
      log.hidden = !log.hidden;
      button.setAttribute('aria-expanded', String(!log.hidden));
      button.setAttribute('aria-label', log.hidden ? 'Mở nhật ký' : 'Gọn nhật ký');
      button.textContent = log.hidden ? '+' : '−';
    }
  };

  private renderMapState(): void {
    const { map, x, y, target, connected } = this.snapshot;
    if (!map || map.width <= 0 || map.height <= 0) return;
    const shell = this.stage.closest('#game-shell')!;
    const planes = shell.querySelectorAll<HTMLElement>('[data-dao-map-plane]');
    const signature = `${map.width}|${map.height}|${map.backgroundUrl}`;
    if (signature !== this.mapSignature) {
      this.mapSignature = signature;
      for (const plane of planes) {
        plane.style.aspectRatio = `${map.width} / ${map.height}`;
        const image = plane.querySelector('img')!;
        image.src = map.backgroundUrl; image.hidden = false;
      }
      this.setText(this.root.querySelector('.dao-hud-map-name'), map.name);
    }
    const place = (node: HTMLElement, px: number, py: number) => {
      node.style.left = `${Math.max(0, Math.min(100, px / map.width * 100))}%`;
      node.style.top = `${Math.max(0, Math.min(100, py / map.height * 100))}%`;
    };
    for (const plane of planes) {
      const player = plane.querySelector<HTMLElement>('[data-dao-player-dot]')!;
      player.hidden = !connected || x === undefined || y === undefined;
      if (!player.hidden) place(player, x!, y!);
      const targetDot = plane.querySelector<HTMLElement>('[data-dao-target-dot]')!;
      targetDot.hidden = !connected || !target;
      if (target) place(targetDot, target.x, target.y);
      plane.querySelectorAll<HTMLElement>('[data-dao-station]').forEach(node => {
        const station = (map.pins??SECT_STATIONS).find(station => station.id === node.dataset.daoStation);
        node.hidden=!station;if(station)place(node, station.x, station.y);
      });
    }
    this.setText(this.root.querySelector('.dao-hud-coordinates'), connected && x !== undefined && y !== undefined ? `${Math.round(x)}, ${Math.round(y)}` : 'Chưa vào sân');
    this.setText(this.dialog.querySelector('.dao-map-message'), connected ? 'Dùng WASD / phím mũi tên để di chuyển. Mở sổ nhiệm vụ để xem bước tiếp theo.' : 'Vào Hằng Nhạc để xem vị trí nhân vật.');
  }

  private log(message: string): void {
    if (this.logEntries[0] === message) return;
    this.logEntries.unshift(message); this.logEntries.length = Math.min(this.logEntries.length, 5);
    this.root.querySelector('#dao-hud-log')!.innerHTML = this.logEntries.map(text => `<li>${esc(text)}</li>`).join('');
  }

  private setText(node: Element | null, value: string): void { if (node && node.textContent !== value) node.textContent = value; }

  dispose(): void { this.observer.disconnect(); this.close(); this.root.remove(); this.dialog.remove(); }
}
