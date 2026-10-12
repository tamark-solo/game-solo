import '../van-ngoc-art.css';
import '../ui-reading.css';
import './preview.css';
import './atmosphere.css';
import { attachFrameSurface } from '../frame-surface';
import { SkillHotbar } from '../skills/hotbar';
import { CHARACTER_INFO, R01_IDS, type AvatarId } from '../../../shared/profiles';
import { SKILL_DEFINITIONS } from '../../../shared/skills/definitions';
import { HANG_NHAC } from '../../../shared/hang-nhac';
import { createPreviewProfile, displayedItems, KIND_LABELS, maxResources, progressCopy, SLOT_LABELS, type PreviewItem, type Scenario } from './fixtures';
import { itemIcon } from './icons';
import { ShrineMotion } from './shrine-motion';

type Tab = 'overview' | 'inventory' | 'equipment';
const $ = <T extends HTMLElement>(selector: string): T => document.querySelector<T>(selector)!;
const frame = $('#character-window'), content = $('#character-content');
const profilePane = $('#profile-pane'), primaryPane = $('#primary-pane'), detailPane = $('#detail-pane');
const avatarSelect = $<HTMLSelectElement>('#preview-avatar'), scenarioSelect = $<HTMLSelectElement>('#scenario');
const avatars = Object.keys(CHARACTER_INFO) as AvatarId[];
const profiles = new Map(avatars.map(avatar => [avatar, createPreviewProfile(avatar)]));
let avatar: AvatarId = 'CHR-WANG-LIN-CHIBI', tab: Tab = 'overview', scenario: Scenario = 'ready';
let query = '', category = 'all', order = 'type', selectedId = 'jade-sword', detailOpen = false, pending = false;
let operation = 0, inventoryScroll = 0;
let poseActive = false, pathOpen = false;
const escaped = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
const profile = () => profiles.get(avatar)!;
const currentItems = () => displayedItems(profile(), scenario);
const selected = () => currentItems().find(item => item.id === selectedId);
const isEquipped = (item: PreviewItem): boolean => !!item.slot && profile().equipped[item.slot] === item.id;
const unavailable = (): boolean => pending || scenario === 'offline' || scenario === 'loading';
const status = (message: string): void => { $('#preview-status').textContent = message; };
const groups = ['gear', 'artifact', 'consumable', 'material', 'manual', 'quest'];
attachFrameSurface(frame);
$('.review-map').style.backgroundImage = `url("${HANG_NHAC.background.url}")`;

const barMount = $('#hotbar-mount');
const bar = new SkillHotbar(barMount, { cast: () => bar.announce('HUD đối chiếu · bản mẫu không thi triển thuật.'), blocked: message => bar.announce(message) });
barMount.inert = true;
function updateBar(): void {
  const p = profile(), max = maxResources(p);
  bar.update({ now: performance.now(), hp: p.hp, maxHp: max.hp, mp: p.mp, maxMp: max.mp,
    online: scenario !== 'offline' && scenario !== 'loading', hasTarget: true, cooldownEnds: {}, aimLabel: 'Bản mẫu · đối chiếu Vân Ngọc' });
}

const shrine=new ShrineMotion(frame,()=>avatar,()=>profilePane.querySelector<HTMLCanvasElement>('.profile-sprite'));
const sprites=shrine.standing;
function paintSprite(): void {
  shrine.paint();
}

function renderProfile(): void {
  const p = profile(), info = CHARACTER_INFO[avatar], progress = progressCopy(avatar), max = maxResources(p);
  frame.dataset.avatar=avatar;
  profilePane.innerHTML = `<div class="profile-name"><div><span class="pane-eyebrow">${info.progressionKind==='recovery'?'LINH THỂ · HỒI PHỤC':'HẰNG NHẠC · NHẬP MÔN'}</span><h2>${info.name}</h2></div><span class="identity-seal">${info.progressionKind==='recovery'?'Linh<br>thể':'Tu<br>sĩ'}</span></div><p class="profile-stage">${progress.stage}</p>
    <div class="sprite-shrine"><img class="shrine-art" src="/assets/character-ui-v2/shrine-v2.webp" alt="" aria-hidden="true"><div class="shrine-halo" aria-hidden="true"></div><div class="qi-mist" aria-hidden="true"></div><canvas class="profile-sprite" width="192" height="192" aria-label="${info.name} · sprite hiện hành ở tỷ lệ 2×"></canvas><span class="shrine-sparks" aria-hidden="true"></span><button class="pose-toggle" type="button" data-action="pose" aria-pressed="${poseActive}">${poseActive?'Dừng xem':'Xem vận khí'}</button></div>
    <dl class="profile-resources"><div><dt>Sinh lực</dt><dd>${p.hp}<small> / ${max.hp}</small></dd><span class="resource-line hp" style="--fill:${p.hp / max.hp * 100}%" aria-hidden="true"></span></div><div><dt>Linh lực</dt><dd>${p.mp}<small> / ${max.mp}</small></dd><span class="resource-line mp" style="--fill:${p.mp / max.mp * 100}%" aria-hidden="true"></span></div></dl>
    <section class="profile-progress"><div><h3>${progress.label}</h3><p><b>140</b> / 240</p></div><div class="cultivation-line" role="progressbar" aria-label="${progress.label} mẫu" aria-valuenow="140" aria-valuemin="0" aria-valuemax="240"><span></span></div></section>`;
  shrine.setState(poseActive,scenario!=='offline'&&scenario!=='loading');
}

function renderOverview(): void {
  const recovery=CHARACTER_INFO[avatar].progressionKind==='recovery';
  primaryPane.innerHTML = `<header class="pane-heading"><div><span class="pane-eyebrow">ĐẠO LỘ NHẬP MÔN</span><h2>${recovery?'Khôi phục hiện diện':'Dưỡng khí · luyện thuật'}</h2></div><span class="small-seal">Mốc 1</span></header>
    <section class="cultivation-card"><div class="realm-medallion" aria-hidden="true"><span>${recovery?'Hiện<br>diện':'Ngưng<br>Khí'}</span><small>${recovery?'HỒI PHỤC':'TẦNG 1'}</small></div><div><span class="pane-eyebrow">${progressCopy(avatar).label.toLocaleUpperCase('vi')}</span><p class="cultivation-value"><b>140</b><span> / 240</span></p><p>${recovery?'Củng cố linh thể và khả năng thi triển.':'Ổn định nền tảng để vận dụng thuật pháp.'}</p></div></section>
    <section class="overview-section"><div class="section-label"><h3>Hành trình tại Hằng Nhạc</h3><button class="text-action" type="button" data-action="path">Các hướng phát triển ↗</button></div><ol class="dao-milestones"><li data-state="complete"><i aria-hidden="true">✓</i><b>Nhập môn</b><span>Làm quen</span></li><li data-state="complete"><i aria-hidden="true">✓</i><b>${recovery?'Hồi phục':'Vận khí'}</b><span>Ổn định</span></li><li data-state="current"><i aria-hidden="true">✦</i><b>Luyện thuật</b><span>Đang theo · mẫu</span></li></ol></section>
    <section class="overview-section"><div class="section-label"><h3>Thuật pháp</h3><span class="quiet-copy">Bộ nhập môn chung</span></div><div class="overview-skills">${R01_IDS.map((id, n) => `<div><i class="skill-study-icon" style="background-position:${n * 50}% 50%" aria-hidden="true"></i><span><b>${SKILL_DEFINITIONS[id].name}</b><small>Có từ đầu · R01</small></span></div>`).join('')}</div></section>
    <section class="overview-section"><div class="section-label"><h3>Trang bị đang dùng</h3><button class="text-action" type="button" data-action="equipment">Xem trang bị ↗</button></div><div class="equipment-list compact-equipment">${Object.entries(SLOT_LABELS).map(([slot, label]) => {
      const item = profile().items.find(item => item.id === profile().equipped[slot as keyof typeof SLOT_LABELS]);
      return `<button class="equipment-entry" type="button" ${item ? `data-item="${item.id}"` : 'data-action="equipment"'}><i>${item ? itemIcon(item.icon, item.id) : '<span>◇</span>'}</i><span><small>${label}</small><b>${item ? item.name : 'Chưa trang bị'}</b></span><span aria-hidden="true">›</span></button>`;
    }).join('')}</div></section>`;
  detailPane.hidden = false; detailPane.classList.add('overview-note');
  if(pathOpen){
    detailPane.innerHTML=`<button type="button" class="text-action dao-back" data-action="path-back">← Pháp bảo & hành trang</button><span class="pane-eyebrow">SÁU PHẦN PHÁT TRIỂN</span><h2>Con đường tu tiên</h2><dl class="dao-guide">${[
      ['Cảnh giới',recovery?'Năng lực hiện dùng và trạng thái hồi phục; tách khỏi cảnh giới nguyên tác.':'Mốc tu luyện và điều kiện chuẩn bị cho bước tiếp.'],
      ['Công pháp','Cách hấp thu và vận hành linh lực. Nội dung chi tiết còn theo GDD.'],
      ['Thuật pháp','Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 có từ đầu.'],
      ['Pháp bảo','Tác dụng, điều kiện và trạng thái luyện hóa của từng món.'],
      ['Lĩnh ngộ','Hiểu và vận dụng qua bài học, khảo nghiệm; chưa là chỉ số đã khóa.'],
      ['Hành trình','Nhiệm vụ chung và cơ duyên riêng của từng nhân vật.'],
    ].map(([name,copy])=>`<div><dt>${name}</dt><dd>${copy}</dd></div>`).join('')}</dl>`;
  }else{
    const artifact=profile().items.find(item=>item.id==='cloud-pearl')!;
    detailPane.innerHTML = `<span class="pane-eyebrow">PHÁP BẢO · CƠ DUYÊN</span><h2>${artifact.name}</h2><div class="artifact-feature" aria-hidden="true">${itemIcon(artifact.icon,artifact.id)}<span class="artifact-halo"></span></div><p class="artifact-state">Chưa luyện hóa</p><p>Đọc tác dụng và điều kiện trước khi đưa pháp bảo vào hành trang chuẩn bị.</p><button class="game-button" type="button" data-item="cloud-pearl">Xem pháp bảo</button><button class="text-action artifact-bag" type="button" data-action="inventory">Mở hành trang →</button>`;
  }
}

function renderInventory(): void {
  detailPane.classList.remove('overview-note');
  primaryPane.innerHTML = `<header class="pane-heading"><div><span class="pane-eyebrow">${tab === 'equipment' ? 'CHUẨN BỊ ĐẤU PHÁP' : 'VẬT PHẨM MANG THEO'}</span><h2>${tab === 'equipment' ? 'Trang bị & pháp bảo' : 'Hành trang'}</h2></div><span id="item-count" class="small-seal"></span></header>
    ${tab === 'equipment' ? `<div class="equipment-slots" aria-label="Ba vị trí trang bị minh họa">${Object.entries(SLOT_LABELS).map(([slot, label]) => {
      const item = profile().items.find(item => item.id === profile().equipped[slot as keyof typeof SLOT_LABELS]);
      return `<button type="button" class="equip-slot" ${item ? `data-item="${item.id}"` : 'data-category="gear"'} aria-label="${label}: ${item ? item.name : 'chưa trang bị'}"><i>${item ? itemIcon(item.icon, item.id) : '<span>◇</span>'}</i><span>${label}</span></button>`;
    }).join('')}</div><p class="quiet-copy">Chọn món trong túi để xem tác dụng và so sánh.</p>` : ''}
    <div class="inventory-tools"><label class="search-field"><span class="sr-only">Tìm vật phẩm</span><span aria-hidden="true">⌕</span><input id="item-search" type="search" placeholder="Tìm vật phẩm…" autocomplete="off" value="${escaped(query)}"></label><label><span class="sr-only">Sắp xếp</span><select id="item-order"><option value="type">Theo loại</option><option value="name">Theo tên</option></select></label></div>
    <div class="inventory-filters" role="group" aria-label="Lọc vật phẩm"><button data-category="all" type="button">Tất cả</button>${(tab === 'equipment' ? ['gear', 'artifact'] : ['gear', 'consumable', 'material', 'quest']).map(kind => `<button data-category="${kind}" type="button">${KIND_LABELS[kind as keyof typeof KIND_LABELS]}</button>`).join('')}</div>
    <div id="item-grid" class="item-grid" role="list" aria-label="Vật phẩm"></div><div id="empty-inventory" class="empty-inventory" hidden></div>
    <p class="inventory-hint">Chọn một món để xem chi tiết <span aria-hidden="true">✦</span> đồ mẫu</p>`;
  $<HTMLSelectElement>('#item-order').value = order;
  $<HTMLInputElement>('#item-search').addEventListener('input', event => { query = (event.target as HTMLInputElement).value; renderGrid(); });
  $('#item-order').addEventListener('change', event => { order = (event.target as HTMLSelectElement).value; renderGrid(); });
  renderGrid(); renderDetail();
}

function renderGrid(): void {
  const items = currentItems().filter(item => (tab !== 'equipment' || item.kind === 'gear' || item.kind === 'artifact') && (category === 'all' || item.kind === category) && item.name.normalize('NFC').toLocaleLowerCase('vi').includes(query.trim().normalize('NFC').toLocaleLowerCase('vi')));
  items.sort((a, b) => order === 'name' ? a.name.localeCompare(b.name, 'vi') : groups.indexOf(a.kind) - groups.indexOf(b.kind));
  const grid = $('#item-grid'), empty = $('#empty-inventory');
  $('#item-count').textContent = `${items.length} món`;
  primaryPane.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(category === button.dataset.category)));
  grid.setAttribute('aria-busy', String(scenario === 'loading'));
  grid.innerHTML = scenario === 'loading' ? '<div role="listitem" class="loading-note">Đang nạp hành trang…</div>' : items.map(item => `<div role="listitem"><button class="item-cell" data-item="${item.id}" data-kind="${item.kind}" type="button" aria-pressed="${item.id === selectedId}" aria-label="${escaped(item.name)}, ${KIND_LABELS[item.kind]}, số lượng ${item.quantity}${isEquipped(item) ? ', đang dùng' : ''}${item.protected ? ', bảo vệ' : ''}" title="${escaped(item.name)}"><i>${itemIcon(item.icon, item.id)}</i>${item.quantity > 1 ? `<span class="item-quantity">${item.quantity}</span>` : ''}${isEquipped(item) ? '<span class="item-equipped" aria-hidden="true">✓</span>' : ''}${item.protected ? '<span class="item-protected" aria-hidden="true">◆</span>' : ''}</button></div>`).join('');
  empty.hidden = items.length > 0 || scenario === 'loading';
  if (!empty.hidden) empty.innerHTML = currentItems().length ? '<span aria-hidden="true">⌕</span><h3>Không tìm thấy vật phẩm</h3><p>Thử tên khác hoặc bỏ bộ lọc.</p><button class="game-button" data-action="clear-filter" type="button">Bỏ bộ lọc</button>' : '<span aria-hidden="true">◇</span><h3>Hành trang đang trống</h3><p>Vật phẩm nhận được sẽ xuất hiện ở đây.</p>';
}

function renderDetail(): void {
  const item = selected();
  detailPane.hidden = false;
  if (!item || scenario === 'loading') {
    content.classList.remove('detail-open'); detailOpen = false;
    detailPane.innerHTML = '<div class="detail-placeholder"><span aria-hidden="true">◇</span><h2>Chọn một vật phẩm</h2><p>Mô tả và tác dụng sẽ xuất hiện tại đây.</p></div>'; return;
  }
  const equipped = isEquipped(item);
  const current = item.slot ? profile().items.find(other => other.id === profile().equipped[item.slot!]) : undefined;
  const comparison = item.slot && !equipped ? `<section class="ui-copy-section comparison"><h3 class="ui-section-title">So với món đang dùng</h3><div><span>Đang dùng</span><b>${current ? current.name : 'Chưa trang bị'}</b><small>${current ? current.effect : 'Không có hiệu ứng'}</small></div><div><span>Món được chọn</span><b>${escaped(item.name)}</b><small>${item.effect}</small></div><p>${item.hp !== undefined ? `Sinh lực tối đa: ${(item.hp ?? 0) - (current?.hp ?? 0) >= 0 ? '+' : ''}${(item.hp ?? 0) - (current?.hp ?? 0)}` : `Linh lực tối đa: ${(item.mp ?? 0) - (current?.mp ?? 0) >= 0 ? '+' : ''}${(item.mp ?? 0) - (current?.mp ?? 0)}`} <span>· số liệu mẫu</span></p></section>` : '';
  const full = item.kind === 'consumable' && (item.hp ? profile().hp >= maxResources(profile()).hp : profile().mp >= maxResources(profile()).mp);
  const disabled = unavailable() || !!item.requirement || full;
  const action = item.slot ? 'equip' : item.kind === 'consumable' ? 'use' : '';
  detailPane.innerHTML = `<button class="detail-back text-action" data-action="back" type="button">← Quay lại hành trang</button><div class="detail-title"><i>${itemIcon(item.icon, item.id)}</i><div><span class="pane-eyebrow">${KIND_LABELS[item.kind]}${equipped ? ' · Đang dùng' : ''}</span><h2 id="detail-title" tabindex="-1">${escaped(item.name)}</h2></div></div>
    <div class="detail-copy"><section class="ui-copy-section"><h3 class="ui-section-title">Tác dụng</h3><p class="item-effect">${item.effect}</p>${item.quantity > 1 ? `<p class="quantity-copy">Số lượng: <b>${item.quantity}</b></p>` : ''}</section>
    ${comparison}<section class="ui-copy-section"><h3 class="ui-section-title">Mô tả</h3><p>${escaped(item.description)}</p></section><section class="ui-copy-section"><h3 class="ui-section-title">Nguồn</h3><p>${item.source}</p></section>
    ${item.requirement ? `<section class="ui-copy-section requirement-note"><h3 class="ui-section-title">Điều kiện còn thiếu</h3><p>${item.requirement}</p><p>Luyện hóa chưa có trong bản mẫu.</p></section>` : ''}
    ${item.kind === 'quest' ? '<p class="requirement-note">Vật phẩm nhiệm vụ · giữ lại cho hành trình.</p>' : ''}</div>
    <div class="detail-actions">${action || item.requirement ? `<button class="game-button primary" type="button" data-action="${action}" ${disabled ? 'disabled' : ''}>${pending ? 'Đang xử lý…' : equipped ? 'Tháo trang bị' : item.slot ? 'Trang bị' : item.requirement ? 'Chưa thể sử dụng' : 'Dùng 1'}</button>` : ''}${item.kind !== 'quest' ? `<button class="protect-button" type="button" data-action="protect" aria-pressed="${!!item.protected}" ${unavailable() ? 'disabled' : ''}>${item.protected ? '◆ Đã bảo vệ' : '◇ Bảo vệ'}</button>` : ''}
    ${full ? '<p>Đã đầy tài nguyên · giữ lại vật tư.</p>' : scenario === 'offline' ? '<p>Mất kết nối · chờ đồng bộ trước khi thao tác.</p>' : '<small>Thao tác chỉ áp dụng cho dữ liệu mẫu.</small>'}</div>`;
}

function render(): void {
  frame.dataset.tab = tab; content.setAttribute('aria-labelledby', `tab-${tab}`);
  content.classList.toggle('detail-open', detailOpen && tab !== 'overview');
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => { button.setAttribute('aria-selected', String(button.dataset.tab === tab)); button.tabIndex = button.dataset.tab === tab ? 0 : -1; });
  renderProfile(); if (tab === 'overview') renderOverview(); else renderInventory();
  const notice = $('#connection-notice'); notice.hidden = scenario !== 'offline' && scenario !== 'save-error';
  notice.textContent = scenario === 'offline' ? 'Mất kết nối · bạn vẫn xem được đồ, thao tác tạm dừng.' : 'Đang thử lỗi lưu · thao tác sẽ báo thất bại và giữ nguyên dữ liệu.';
  updateBar();
}
function changeTab(next: Tab): void {
  tab = next; detailOpen = false; pathOpen=false; category = 'all'; content.scrollTop = 0; render();
}
function chooseItem(id: string): void {
  if (scenario === 'loading') return;
  inventoryScroll = content.scrollTop;
  selectedId = id; detailOpen = true;
  if (tab === 'overview') { tab = 'equipment'; render(); } else { renderGrid(); renderDetail(); content.classList.add('detail-open'); }
  if (matchMedia('(max-width: 759px)').matches) { content.scrollTop = 0; $('#detail-title').focus({ preventScroll: true }); }
}
function backToItems(): void {
  detailOpen = false; content.classList.remove('detail-open');
  content.scrollTop = inventoryScroll;
  const button = primaryPane.querySelector<HTMLButtonElement>(`[data-item="${selectedId}"]`);
  (button ?? $<HTMLInputElement>('#item-search')).focus({ preventScroll: false });
}
async function transact(action: 'equip' | 'use' | 'protect'): Promise<void> {
  const item = selected(); if (!item || unavailable() || (item.requirement && action !== 'protect')) return;
  if (action === 'use' && (item.kind !== 'consumable' || !item.quantity)) return;
  const request = ++operation, owner = avatar;
  pending = true; avatarSelect.disabled = true; scenarioSelect.disabled = true;
  renderDetail(); status('Đang xử lý thao tác mẫu…');
  await new Promise(resolve => setTimeout(resolve, 420));
  if (request !== operation || owner !== avatar) return;
  pending = false; avatarSelect.disabled = false; scenarioSelect.disabled = false;
  if (scenario === 'save-error') { renderDetail(); status('Không lưu được thay đổi mẫu. Vật phẩm và trang bị được giữ nguyên.'); return; }
  const actual = profile().items.find(other => other.id === item.id);
  if (!actual) { renderDetail(); return; }
  if (action === 'equip' && actual.slot) {
    const removing = isEquipped(actual);
    if (removing) delete profile().equipped[actual.slot]; else profile().equipped[actual.slot] = actual.id;
    const max = maxResources(profile()); profile().hp = Math.min(profile().hp, max.hp); profile().mp = Math.min(profile().mp, max.mp);
    status(`${removing ? 'Đã tháo' : 'Đã trang bị'} ${actual.name} · dữ liệu mẫu.`);
  } else if (action === 'use') {
    const max = maxResources(profile()); profile().hp = Math.min(max.hp, profile().hp + (actual.hp ?? 0)); profile().mp = Math.min(max.mp, profile().mp + (actual.mp ?? 0));
    actual.quantity--; if (!actual.quantity) profile().items = profile().items.filter(other => other.id !== actual.id);
    status(`Đã dùng 1 ${actual.name} · dữ liệu mẫu.`);
  } else if (action === 'protect') {
    actual.protected = !actual.protected; status(`${actual.protected ? 'Đã bảo vệ' : 'Đã bỏ bảo vệ'} ${actual.name} · dữ liệu mẫu.`);
  }
  renderProfile(); renderGrid(); renderDetail(); updateBar();
  if (selected()) detailPane.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)?.focus({ preventScroll: true });
  else $('#item-search').focus();
}

content.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button'); if (!button || button.disabled) return;
  if (button.dataset.item) { chooseItem(button.dataset.item); return; }
  if (button.dataset.category) { category = button.dataset.category; renderGrid(); return; }
  switch (button.dataset.action) {
    case 'pose': poseActive=!poseActive; renderProfile(); status(`${poseActive?'Đang xem vận khí':'Đã dừng xem vận khí'} · chỉ đổi hình trình bày, không tích lũy tu vi.`); break;
    case 'path': pathOpen=true;renderOverview();detailPane.scrollTop=0; break;
    case 'path-back': pathOpen=false;renderOverview();break;
    case 'inventory': case 'equipment': changeTab(button.dataset.action); break;
    case 'back': backToItems(); break;
    case 'clear-filter': query = ''; category = 'all'; $<HTMLInputElement>('#item-search').value = ''; renderGrid(); $('#item-search').focus(); break;
    case 'equip': case 'use': case 'protect': void transact(button.dataset.action); break;
  }
});
document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => {
  button.addEventListener('click', () => changeTab(button.dataset.tab as Tab));
  button.addEventListener('keydown', event => {
    const tabs: Tab[] = ['overview', 'inventory', 'equipment'], index = tabs.indexOf(tab);
    const next = event.key === 'ArrowRight' ? tabs[(index + 1) % 3] : event.key === 'ArrowLeft' ? tabs[(index + 2) % 3] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : undefined;
    if (next) { event.preventDefault(); changeTab(next); $(`#tab-${next}`).focus(); }
  });
});
function reset(): void {
  operation++; pending = false; avatarSelect.disabled = false; scenarioSelect.disabled = false;
  for (const id of avatars) profiles.set(id, createPreviewProfile(id));
  scenario = 'ready'; scenarioSelect.value = scenario; query = ''; category = 'all'; selectedId = 'jade-sword'; detailOpen = false; poseActive=false; pathOpen=false; render(); status('Đã đặt lại dữ liệu mẫu.');
}
$('#reset-preview').addEventListener('click', reset);
avatarSelect.addEventListener('change', () => { avatar = avatarSelect.value as AvatarId; selectedId = 'jade-sword'; detailOpen = false; query = ''; category = 'all'; render(); status(`${CHARACTER_INFO[avatar].name} · hồ sơ mẫu riêng.`); });
scenarioSelect.addEventListener('change', () => { scenario = scenarioSelect.value as Scenario; detailOpen = false; query = ''; category = 'all'; selectedId = 'jade-sword'; render(); closeControls(); status(`Đang xem: ${scenarioSelect.selectedOptions[0].text} · dữ liệu mẫu.`); });
$('#reading-size').addEventListener('change', event => { const scale = Number((event.target as HTMLSelectElement).value); document.body.style.setProperty('--ui-text-body', `${15 * scale}px`); document.body.style.setProperty('--ui-text-small', `${12 * scale}px`); closeControls(); });
function closeControls(): void { $<HTMLDetailsElement>('#review-controls').open = false; $('#review-controls summary').focus(); }
function setOpen(open: boolean): void {
  frame.hidden = !open; $('#open-character').hidden = open; barMount.inert = open;
  shrine.refresh();
  if (!open) $('#open-character').focus(); else $(`#tab-${tab}`).focus();
}
$('#close-character').addEventListener('click', () => setOpen(false));
$('#open-character').addEventListener('click', () => setOpen(true));
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if ($<HTMLDetailsElement>('#review-controls').open) closeControls();
    else if (detailOpen) backToItems(); else if (!frame.hidden) setOpen(false);
    event.preventDefault();
  }
  if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || (event.target as HTMLElement).closest('input,select,textarea,[contenteditable=true]')) return;
  if (event.code === 'KeyC' || event.code === 'KeyI') { event.preventDefault(); if (event.code === 'KeyI') changeTab('inventory'); setOpen(event.code === 'KeyI' || !!frame.hidden); }
});
content.addEventListener('keydown', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.item-cell');
  if (!button || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
  const buttons = [...primaryPane.querySelectorAll<HTMLButtonElement>('.item-cell')], index = buttons.indexOf(button);
  const columns = getComputedStyle($('#item-grid')).gridTemplateColumns.split(' ').length;
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' ? columns : -columns;
  event.preventDefault(); buttons[Math.max(0, Math.min(buttons.length - 1, index + step))]?.focus();
});

async function image(url: string): Promise<HTMLImageElement> { const result = new Image(); result.src = url; await result.decode(); return result; }
async function boot(): Promise<void> {
  const catalog = await fetch('/assets/catalog.json').then(response => { if (!response.ok) throw new Error('Chưa nạp được thư viện nhân vật.'); return response.json(); });
  await Promise.all(avatars.map(async id => {
    const actor = catalog.actors.find((entry: { id: string }) => entry.id === id);
    if (!actor) throw new Error(`Thiếu sprite ${id}.`);
    const metadata = await fetch(actor.metadataUrl).then(response => response.json());
    const source = metadata.frames[metadata.animations.stand_south[0]].frame;
    if (source.w !== 64 || source.h !== 96) throw new Error('Sprite phải giữ frame 64 × 96.');
    sprites.set(id, { image: await image(actor.atlasUrl), frame: source });
  }));
  const motions=await fetch('/assets/quest-motion/clips.json').then(response=>{if(!response.ok)throw new Error('Chưa nạp được sprite vận khí.');return response.json();});
  await Promise.all(avatars.map(async id=>{
    const clip=motions.clips[motions.bindings[id].cultivation];
    if(clip.frameSize[0]!==96||clip.frameSize[1]!==96||clip.anchor[0]!==48||clip.anchor[1]!==88)throw new Error('Sai hợp đồng sprite vận khí.');
    shrine.cultivation.set(id,{image:await image(clip.atlasUrl),frames:clip.frames,fps:clip.fps});
  }));
  await Promise.all([
    image('/assets/skill-hud/cultivation-frame-v3.webp').then(() => bar.setFrame('/assets/skill-hud/cultivation-frame-v3.webp')),
    image('/assets/skill-hud/skill-icons-v2.webp').then(() => bar.setIconAtlas('/assets/skill-hud/skill-icons-v2.webp')),
    image('/assets/skill-hud/orb-textures-v2.webp').then(() => bar.setOrbTexture('/assets/skill-hud/orb-textures-v2.webp')),
  ]);
  paintSprite(); document.body.dataset.ready = 'true'; updateBar();shrine.refresh();
}
render();
void boot().catch(error => { status(error instanceof Error ? error.message : 'Chưa nạp được tài nguyên đối chiếu.'); document.body.dataset.ready = 'error'; });
window.addEventListener('pagehide',()=>shrine.pause());
window.addEventListener('pageshow',()=>shrine.refresh());

// Inspection of this isolated page only; no room, token, storage, or real save.
Object.assign(window, { __characterPreview: () => ({ avatar, tab, scenario, selectedId, detailOpen, pending,
  resources: { hp: profile().hp, mp: profile().mp, ...Object.fromEntries(Object.entries(maxResources(profile())).map(([key, value]) => [`max${key.toUpperCase()}`, value])) },
  equipped: { ...profile().equipped }, items: profile().items.map(item => ({ id: item.id, quantity: item.quantity, protected: !!item.protected })), spritesReady: sprites.size,shrine:shrine.snapshot,
}) });
