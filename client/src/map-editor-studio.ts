import type { EditorProject } from '../../shared/map-editor';
import type { EntitySelection } from '../../shared/level-design';

const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const toolDescriptions: Record<string, [string, string]> = {
  select: ['Chọn & di chuyển', 'Kéo vật để di chuyển · Shift chọn nhiều · Alt khi kéo để bỏ hít.'],
  pan: ['Di chuyển khung nhìn', 'Kéo để pan · cuộn để zoom tại con trỏ · V trở lại chọn.'],
  place: ['Đặt hình', 'Bấm để đặt hình đang chọn · Esc trở lại chọn và kéo.'],
  brush: ['Cọ asset', 'Chọn hình, rê để tô theo ô · cả nét cọ là một bước hoàn tác.'],
  'paint-rect': ['Tô ô chữ nhật', 'Chọn hình, kéo một vùng để ghép tile trên layer đang chọn.'],
  erase: ['Gôm asset', 'Rê để gôm trên layer chọn · giữ nguyên các vật và cụm đang khóa.'],
  'walk-rect': ['Vùng đi · chữ nhật', 'Kéo để vẽ vùng đi · chọn “Chỉ trong vùng đi” trong luật đi nếu cần.'],
  'walk-spline': ['Vùng đi · spline', 'Bấm đặt điểm · đỉnh đầu / Enter đóng vùng · V kéo điểm · Shift+bấm đường cong thêm điểm.'],
  'walk-poly': ['Vùng đi · đa giác', 'Bấm đỉnh đầu / Enter để đóng · Backspace bỏ đỉnh cuối · Esc hủy.'],
  'block-rect': ['Vùng chặn · chữ nhật', 'Kéo để chặn chân nhân vật · vẽ quanh chân đế, không quanh cả mái / tán.'],
  'block-spline': ['Vùng chặn · spline', 'Bấm theo mép cần chặn · đỉnh đầu / Enter đóng vùng · V kéo điểm · Alt+bấm điểm xóa.'],
  'block-poly': ['Vùng chặn · đa giác', 'Bấm đỉnh đầu / Enter để đóng · Backspace bỏ đỉnh cuối · Esc hủy.'],
  'portal-rect': ['Cửa nối level', 'Kéo để tạo cửa · chọn level đích trong Thuộc tính · E qua cửa khi Test.'],
  'portal-spline': ['Cửa nối · spline', 'Bấm đặt điểm · đỉnh đầu / Enter đóng vùng · chọn level đích trong Inspector.'],
  'portal-poly': ['Cửa nối · đa giác', 'Bấm đỉnh đầu / Enter để đóng · chọn level đích trong Inspector.'],
  spawn: ['Điểm xuất hiện', 'Bấm trên đường đi để đặt Spawn · Kiểm tra để phát hiện Spawn bị chặn.'],
  prefab: ['Đặt cụm', 'Bấm để đặt cụm vật và vùng · giữ nguyên khoảng cách và layer trong mẫu.'],
};
export interface StudioState { project: EditorProject; tool: string; playing: boolean; selections: EntitySelection[]; chosenAsset: string; draftVertices: number; editDomain: 'scene'|'navigation'; inspectorContext: 'level'|'layer'|'asset'|'selection'; activeLayer: string }
export function setupStudio(options: { setTool: (tool: string) => void; setDomain: (domain:'scene'|'navigation') => void; validate: () => void; settings: () => void }) {
  let commandIndex = 0, regionKind = 'walk';
  const dialog = element<HTMLDialogElement>('command-dialog');
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  const commands: Array<{ label: string; shortcut?: string; run: () => void; enabled: () => boolean }> = [];
  for (const [tool, [label]] of Object.entries(toolDescriptions).filter(([key]) => key !== 'place' && key !== 'prefab')) {
    commands.push({ label, shortcut: ({ select: 'V', pan: 'H', brush: 'B' } as Record<string, string>)[tool], run: () => options.setTool(tool), enabled: () => !document.body.classList.contains('testing') });
  }
  for (const [id, label, shortcut] of [
    ['duplicate-asset', 'Nhân bản asset trong thư viện', ''], ['cut-map', 'Cắt asset từ map tổng', ''], ['save', 'Lưu dự án', 'Ctrl S'], ['play', 'Bật / dừng Test map', ''], ['validate', 'Kiểm tra map', ''],
    ['fit', 'Vừa khung level', ''], ['native', 'Xem kích thước native 1×', ''], ['frame-selection', 'Xem vùng chọn', 'F'],
    ['undo', 'Hoàn tác', 'Ctrl Z'], ['redo', 'Làm lại', 'Ctrl Shift Z'], ['duplicate', 'Nhân bản lựa chọn', 'Ctrl D'],
    ['group', 'Nhóm lựa chọn', 'Ctrl G'], ['ungroup', 'Tách nhóm', 'Ctrl Shift G'], ['add-level', 'Thêm level', ''],
    ['export', 'Xuất dự án JSON', ''], ['export-level', 'Xuất level JSON', ''], ['export-runtime', 'Xuất runtime cho game', ''],
    ['asset-background', 'Dùng hình làm nền & khớp level', ''], ['empty-import', 'Nhập hình PNG / WebP', ''],
  ]) commands.push({ label, shortcut, run: () => element(id).click(), enabled: () => !(element(id) as HTMLButtonElement).disabled });
  let filtered = commands;
  function renderCommands() {
    const query = normalize(element<HTMLInputElement>('command-search').value);
    filtered = commands.filter(c => normalize(c.label).includes(query));
    commandIndex = Math.max(0, Math.min(commandIndex, filtered.length - 1));
    const list = element('command-results'); list.replaceChildren();
    if (!filtered.length) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Không tìm thấy thao tác phù hợp.'; list.append(p); }
    filtered.forEach((command, index) => {
      const button = document.createElement('button'); button.classList.toggle('active', index === commandIndex); button.disabled = !command.enabled();
      const label = document.createElement('span'); label.textContent = command.label;
      const shortcut = document.createElement('small'); shortcut.textContent = command.shortcut ?? '';
      button.append(label, shortcut); button.addEventListener('click', () => { dialog.close(); command.run(); }); list.append(button);
    });
  }
  function openCommands() { element<HTMLInputElement>('command-search').value = ''; commandIndex = 0; renderCommands(); dialog.showModal(); element('command-search').focus(); }
  element('commands').addEventListener('click', openCommands);
  element('command-search').addEventListener('input', () => { commandIndex = 0; renderCommands(); });
  element('command-search').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); commandIndex = (commandIndex + (e.key === 'ArrowDown' ? 1 : -1) + filtered.length) % (filtered.length || 1); renderCommands(); element('command-results').children[commandIndex]?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); const command = filtered[commandIndex]; if (command?.enabled()) { dialog.close(); command.run(); } }
  });
  window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (dialog.open) dialog.close(); else if (!document.querySelector('dialog[open]')) openCommands(); } });
  element('help-toggle').addEventListener('click', () => element<HTMLDialogElement>('help-dialog').showModal());
  document.querySelectorAll<HTMLElement>('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog')!.close()));
  document.querySelectorAll<HTMLDetailsElement>('.menu').forEach(menu => {
    menu.addEventListener('toggle',()=>{if(!menu.open)return;const anchor=menu.querySelector('summary')!.getBoundingClientRect(),nav=menu.querySelector('nav')!,box=nav.getBoundingClientRect();nav.style.setProperty('--menu-left',`${Math.max(8,Math.min(innerWidth-box.width-8,anchor.left))}px`);nav.style.setProperty('--menu-top',`${Math.max(8,anchor.bottom+box.height+5>innerHeight?anchor.top-box.height-4:anchor.bottom+4)}px`);});
    menu.addEventListener('click', e => { if ((e.target as HTMLElement).closest('nav button,nav label.button')) menu.open = false; });
    document.addEventListener('pointerdown', e => { if (!menu.contains(e.target as Node)) menu.open = false; });
    menu.querySelector('summary')?.addEventListener('click', () => document.querySelectorAll<HTMLDetailsElement>('.menu').forEach(other => { if (other !== menu) other.open = false; }));
  });
  element('empty-import').addEventListener('click', () => element<HTMLInputElement>('import-asset').click());
  document.querySelectorAll<HTMLLabelElement>('label.button').forEach(label => {
    label.tabIndex = 0; label.setAttribute('role', 'button');
    label.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const input = label.querySelector<HTMLInputElement>('input[type="file"]'); if (input && !input.disabled) input.click(); } });
  });
  element('empty-settings').addEventListener('click', () => { options.settings(); element('inspector-section').scrollIntoView({ block: 'nearest' }); element('inspector').querySelector<HTMLInputElement>('[data-field="width"]')?.focus(); });
  function openDock(name: string) {
    document.body.classList.remove('dock-collapsed');
    document.querySelectorAll<HTMLElement>('[data-dock]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.dock === name)));
    document.querySelectorAll<HTMLElement>('[data-dock-panel]').forEach(panel => panel.hidden = panel.dataset.dockPanel !== name);
  }
  document.querySelectorAll<HTMLButtonElement>('[data-dock]').forEach(b => b.addEventListener('click', () => openDock(b.dataset.dock!)));
  element('dock-toggle').addEventListener('click', () => document.body.classList.toggle('dock-collapsed'));
  element('empty-import').addEventListener('click', () => openDock('assets'));
  function focusCanvas() { document.body.classList.toggle('focus-canvas'); element('viewport').focus(); }
  element('focus-mode').addEventListener('click', focusCanvas);
  window.addEventListener('keydown', e => { if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey && ['viewport','map-canvas',''].includes((e.target as HTMLElement).id) && !document.querySelector('dialog[open]') && !/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)) { e.preventDefault(); focusCanvas(); } });
  const splitter = element('dock-resize');
  splitter.addEventListener('pointerdown', e => {
    e.preventDefault(); splitter.setPointerCapture(e.pointerId);
    const initial = element('project-dock').getBoundingClientRect().height, y = e.clientY;
    const move = (event: PointerEvent) => { document.body.classList.remove('dock-collapsed'); document.documentElement.style.setProperty('--dock-height', `${Math.max(110,Math.min(element('project-dock').closest('.workspace')!.clientHeight * .5, initial + y-event.clientY))}px`); };
    const stop = () => { splitter.removeEventListener('pointermove', move); splitter.removeEventListener('pointerup', stop); splitter.removeEventListener('pointercancel', stop); };
    splitter.addEventListener('pointermove', move); splitter.addEventListener('pointerup', stop); splitter.addEventListener('pointercancel', stop);
  });
  splitter.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const height = element('project-dock').clientHeight + (e.key === 'ArrowUp'?20:-20); document.documentElement.style.setProperty('--dock-height',`${Math.max(110,Math.min(400,height))}px`); } });
  document.querySelectorAll<HTMLButtonElement>('[data-domain]').forEach(b => b.addEventListener('click', () => options.setDomain(b.dataset.domain as 'scene'|'navigation')));
  function regionTool() { return `${regionKind}-${element<HTMLSelectElement>('region-shape').value}`; }
  document.querySelectorAll<HTMLButtonElement>('[data-region-kind]').forEach(b => b.addEventListener('click', () => { regionKind = b.dataset.regionKind!; options.setTool(regionTool()); }));
  element('region-shape').addEventListener('change', () => options.setTool(regionTool()));
  return {
    openDock,
    refresh(state: StudioState) {
      const level = state.project.levels.find(l => l.id === state.project.activeLevelId)!;
      const [title, description] = toolDescriptions[state.tool] ?? toolDescriptions.select;
      element('tool-name').textContent = state.playing ? 'Chơi thử map · 1×' : title;
      element('tool-description').textContent = state.playing ? 'WASD / mũi tên di chuyển · E qua cửa · Esc trở lại biên tập.' : description;
      element('viewport').dataset.editorTool = state.playing ? 'test' : state.tool;
      element('brush-control').hidden = state.playing || !['brush', 'paint-rect', 'erase'].includes(state.tool);
      element('finish-polygon').hidden = state.playing || !(state.tool.endsWith('poly')||state.tool.endsWith('spline'));
      element('spline-control').hidden=state.playing||!state.tool.endsWith('spline');
      element<HTMLInputElement>('spline-smoothness').disabled=state.playing;
      element<HTMLButtonElement>('finish-polygon').disabled = state.draftVertices < 3;
      element('test-controls').hidden = !state.playing;
      element('empty-canvas').hidden = state.playing || Boolean(state.project.assets.length || level.objects.length || level.regions.length) || state.tool !== 'select';
      element('asset-count').textContent = String(state.project.assets.length);
      element('entity-count').textContent = String(level.objects.length + level.regions.length);
      element('selection-count').textContent = String(state.selections.length); element('selection-count').hidden = !state.selections.length;
      const item = state.selections.at(-1), object = item?.kind==='object'?level.objects.find(o=>o.id===item.id):undefined, region = item?.kind==='region'?level.regions.find(r=>r.id===item.id):undefined;
      if(state.editDomain==='navigation'&&state.tool==='select'&&state.selections.length===1&&region){regionKind=region.kind;element<HTMLSelectElement>('region-shape').value=region.spline?'spline':'poly';if(region.spline){element('tool-name').textContent=`Spline · ${region.name}`;element('tool-description').textContent='Kéo điểm để uốn cong · Shift+bấm đường cong thêm điểm · Alt+bấm điểm xóa.';}}
      const asset = state.project.assets.find(a=>a.id===state.chosenAsset), layer = level.layers.find(l=>l.id===state.activeLayer);
      const assetContext = state.inspectorContext==='asset' && Boolean(asset) && !state.selections.length;
      element('inspector-section').hidden=assetContext; element('asset-section').hidden=!assetContext;
      element('inspector-title').textContent=state.selections.length>1?`${state.selections.length} mục được chọn`:object?.name??region?.name??(assetContext?asset!.name:state.inspectorContext==='layer'?layer?.name??'Layer':level.name);
      element('inspector-subtitle').textContent=object?'INSTANCE · ĐỐI TƯỢNG':region?'GAMEPLAY · VÙNG':assetContext?'ASSET · THƯ VIỆN':state.inspectorContext==='layer'?'LAYER':'LEVEL · THIẾT LẬP';
      element('scene-tools').hidden=state.editDomain!=='scene'; element('navigation-tools').hidden=state.editDomain!=='navigation';
      document.querySelectorAll<HTMLButtonElement>('[data-domain]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.domain===state.editDomain));b.disabled=state.playing;});
      if (state.tool.startsWith('walk-')||state.tool.startsWith('block-')||state.tool.startsWith('portal-')) { const [kind,shape]=state.tool.split('-');regionKind=kind;element<HTMLSelectElement>('region-shape').value=shape; }
      document.querySelectorAll<HTMLButtonElement>('[data-region-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.regionKind===regionKind);b.setAttribute('aria-pressed',String(b.dataset.regionKind===regionKind));b.disabled=state.playing;});
      element<HTMLSelectElement>('region-shape').disabled=state.playing;
      element('draw-region').dataset.tool=regionTool();
      if ((state.tool.endsWith('poly')||state.tool.endsWith('spline')) && state.draftVertices) element('tool-name').textContent=`${title} · ${state.draftVertices} đỉnh`;
      const locked = state.selections.some(s => { const item = s.kind === 'object' ? level.objects.find(o => o.id === s.id) : level.regions.find(r => r.id === s.id); return !item || ('locked' in item && item.locked) || level.layers.some(l => l.locked && (l.id === item.layerId || ('coverLayerId' in item && l.id === item.coverLayerId && state.project.assets.find(a => a.id === item.assetId)?.parts.some(p => p.cover)))); });
      for (const id of ['remove', 'duplicate', 'group', 'ungroup', 'save-prefab']) element<HTMLButtonElement>(id).disabled = state.playing || !state.selections.length || locked;
      element('remove').title = locked ? 'Mở khóa vật / layer trước khi xóa' : 'Xóa lựa chọn (Delete)';
      element<HTMLButtonElement>('duplicate').disabled=state.playing||(assetContext?state.project.assets.length>=200:!state.selections.length||locked);
      element('duplicate').title = assetContext?'Nhân bản asset trong thư viện (Ctrl+D)':locked ? 'Mở khóa vật / layer trước khi nhân bản' : 'Nhân bản lựa chọn (Ctrl+D)';
      element<HTMLButtonElement>('align').disabled = state.playing || state.selections.length < 2 || locked;
      element<HTMLButtonElement>('asset-background').disabled = state.playing || !state.chosenAsset;
      element<HTMLButtonElement>('empty-import').disabled = state.playing;
      document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(b => { b.disabled=state.playing;b.classList.toggle('active',b.dataset.tool===state.tool);b.setAttribute('aria-pressed',String(b.dataset.tool===state.tool)); });
    },
    saveState(label: string, state: 'draft' | 'dirty' | 'saved' | 'saving' | 'error') { const field = element('save-state'); field.textContent = label; field.dataset.state = state; },
  };
}
