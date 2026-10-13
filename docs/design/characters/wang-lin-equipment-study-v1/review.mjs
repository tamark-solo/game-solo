const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const images = new Map();
const state = { zoom: 1, background: 'dark', body: true, gear: true, roots: true, boxes: false, selected: '' };
let manifest, body, equipment;

async function loadImage(path) {
  if (!path) return null;
  if (images.has(path)) return images.get(path);
  const image = new Image();
  image.src = path;
  await image.decode();
  images.set(path, image);
  return image;
}
function entryPaths(item) {
  return [item.rearFile, item.frontFile, (!item.rearFile && !item.frontFile) ? item.file : null].filter(Boolean);
}
function frame(item) {
  return { canvas: item?.canvas ?? body.canvas, pivot: item?.pivot ?? body.pivot };
}
function bounds(item) {
  const current = frame(item);
  return {
    left: Math.max(body.pivot[0], current.pivot[0]),
    right: Math.max(body.canvas[0] - body.pivot[0], current.canvas[0] - current.pivot[0]),
    top: Math.max(body.pivot[1], current.pivot[1]),
    bottom: Math.max(body.canvas[1] - body.pivot[1], current.canvas[1] - current.pivot[1])
  };
}
function paintBackground(ctx, width, height) {
  const palette = { dark: ['#182a25', '#234035'], light: ['#eee9d9', '#d7d1bd'], gray: ['#828983', '#737b75'] };
  const [base, line] = palette[state.background];
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let x = 0.5; x < width; x += 16 * state.zoom) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0.5; y < height; y += 16 * state.zoom) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
}
function drawLayer(ctx, path, pivot, x, y) {
  if (!path) return;
  const image = images.get(path);
  ctx.drawImage(image, Math.round(x - pivot[0] * state.zoom), Math.round(y - pivot[1] * state.zoom), image.width * state.zoom, image.height * state.zoom);
}
function drawActor(ctx, item, x, y, label) {
  const current = frame(item);
  if (state.gear && item) drawLayer(ctx, item.rearFile, current.pivot, x, y);
  if (state.body) drawLayer(ctx, body.file, body.pivot, x, y);
  if (state.gear && item) {
    if (item.frontFile) drawLayer(ctx, item.frontFile, current.pivot, x, y);
    else if (!item.rearFile) drawLayer(ctx, item.file, current.pivot, x, y);
  }
  if (state.boxes) {
    ctx.strokeStyle = '#ccaf55';
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x - body.pivot[0] * state.zoom + .5, y - body.pivot[1] * state.zoom + .5, body.canvas[0] * state.zoom, body.canvas[1] * state.zoom);
    if (item) { ctx.strokeStyle = '#65c8df'; ctx.strokeRect(x - current.pivot[0] * state.zoom + .5, y - current.pivot[1] * state.zoom + .5, current.canvas[0] * state.zoom, current.canvas[1] * state.zoom); }
    ctx.setLineDash([]);
  }
  if (state.roots) {
    ctx.strokeStyle = state.background === 'light' ? '#a8462c' : '#ffd177';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 5, y + .5); ctx.lineTo(x + 5, y + .5); ctx.moveTo(x + .5, y - 5); ctx.lineTo(x + .5, y + 5); ctx.stroke();
  }
  ctx.font = '13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const textWidth = ctx.measureText(label).width;
  const labelY = y + Math.max(body.canvas[1] - body.pivot[1], current.canvas[1] - current.pivot[1]) * state.zoom + 21;
  ctx.fillStyle = '#112920ec'; ctx.fillRect(x - textWidth / 2 - 9, labelY - 13, textWidth + 18, 26);
  ctx.fillStyle = '#f0e5cb'; ctx.fillText(label, x, labelY);
}
function drawStage(canvas, items) {
  const metrics = items.map(bounds);
  const top = Math.max(...metrics.map(b => b.top));
  const bottom = Math.max(...metrics.map(b => b.bottom));
  const pad = 24;
  const gap = 34;
  const widths = metrics.map(b => Math.max(b.left + b.right, 116));
  const nativeWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (items.length - 1) + pad * 2;
  const width = Math.max(items.length > 2 ? 900 : 440, nativeWidth * state.zoom);
  const height = (top + bottom + pad * 2) * state.zoom + 48;
  canvas.width = Math.ceil(width); canvas.height = Math.ceil(height);
  canvas.style.width = `${canvas.width}px`; canvas.style.height = `${canvas.height}px`;
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
  paintBackground(ctx, canvas.width, canvas.height);
  const extra = Math.max(0, width / state.zoom - nativeWidth) / items.length;
  let cursor = pad;
  const y = (top + pad) * state.zoom;
  ctx.strokeStyle = state.background === 'light' ? '#9c987a' : '#acb499';
  ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(width, y + .5); ctx.stroke(); ctx.setLineDash([]);
  items.forEach((item, index) => {
    const sectionWidth = widths[index] + extra;
    const x = (cursor + (sectionWidth - metrics[index].left - metrics[index].right) / 2 + metrics[index].left) * state.zoom;
    drawActor(ctx, item, x, y, item ? item.name : 'Vương Lâm live');
    cursor += sectionWidth + gap;
  });
}
function sourceLinks(item) {
  const links = [[item.raw ?? item.source?.raw, 'Nguồn gốc'], [item.file, 'Trang bị native'], [item.rearFile, 'Layer sau'], [item.frontFile, 'Layer trước'], [item.prompt ?? item.source?.prompt, 'Prompt']];
  return links.filter(([path]) => path).map(([path, label]) => `<a href="${escapeHTML(path)}" target="_blank" rel="noopener">${label}</a>`).join('');
}
function showDetail() {
  const item = equipment.find(value => value.id === state.selected);
  const current = frame(item);
  const offset = [current.pivot[0] - body.pivot[0], current.pivot[1] - body.pivot[1]];
  const itemHash = item.sha256 ?? item.hash ?? item.nativeSha256;
  $('detail').innerHTML = `<h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.description ?? '')}</p><p class="hint">${escapeHTML(item.status ?? 'Neutral trang bị chờ duyệt hình.')} · một view Đông Nam.</p><dl><dt>Thân gốc</dt><dd>${body.canvas.join(' × ')} · chân (${body.pivot.join(', ')})</dd><dt>Canvas trang bị</dt><dd>${current.canvas.join(' × ')} · neo (${current.pivot.join(', ')})</dd><dt>Đặt thân trong canvas</dt><dd>(${offset.join(', ')}) · cùng world foot</dd><dt>Thứ tự layer</dt><dd>${item.rearFile ? 'Sau → thân → trước' : 'Thân → trang bị trước'}</dd></dl>${itemHash ? `<p class="hash">SHA-256: ${escapeHTML(itemHash)}</p>` : ''}<div class="links">${sourceLinks(item)}</div><p class="hint">Không đổi scale thân hoặc dựng chuyển động từ pose đứng. Grip và occlusion phải được đánh giá lại khi tạo motion.</p>`;
}
function draw() {
  drawStage($('lineup'), [null, ...equipment]);
  drawStage($('pair'), [null, equipment.find(item => item.id === state.selected)]);
  $('scale-note').textContent = `${state.zoom}× nearest: 1 pixel ảnh = ${state.zoom} pixel CSS. Cuộn ngang khi cần; không co canvas theo màn hình. Thân gốc luôn đăng ký tại world foot chung.`;
  showDetail();
}
function showSources() {
  $('source-cards').innerHTML = equipment.map(item => {
    const raw = item.raw ?? item.source?.raw;
    return `<article class="source-card"><div class="source-image">${raw ? `<a href="${escapeHTML(raw)}" target="_blank" rel="noopener"><img src="${escapeHTML(raw)}" alt="Nguồn lớn ${escapeHTML(item.name)}" loading="lazy"></a>` : '<span class="source-empty">Nguồn được ghi trong manifest</span>'}</div><div class="content"><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.description ?? '')}</p><div class="links">${sourceLinks(item)}</div></div></article>`;
  }).join('');
}
async function start() {
  const response = await fetch('./manifest.json');
  if (!response.ok) throw Error(`Không đọc được manifest (${response.status}).`);
  manifest = await response.json(); body = manifest.body; equipment = manifest.equipment;
  if (!body?.file || !Array.isArray(body.canvas) || !Array.isArray(body.pivot) || !equipment?.length) throw Error('Manifest thiếu body hoặc equipment.');
  if (body.canvas.join(',') !== '64,96' || body.pivot.join(',') !== '32,88') throw Error('Thân đối chiếu phải đúng contract live 64×96/(32,88).');
  for (const item of equipment) {
    if (!item.id || !item.name || !Array.isArray(item.canvas) || !Array.isArray(item.pivot) || !entryPaths(item).length) throw Error('Trang bị thiếu canvas/pivot/layer.');
  }
  await Promise.all([body.file, ...equipment.flatMap(entryPaths)].map(loadImage));
  for (const item of [body, ...equipment]) for (const path of item === body ? [body.file] : entryPaths(item)) {
    const image = images.get(path);
    if (image.width !== item.canvas[0] || image.height !== item.canvas[1]) throw Error(`Kích thước ảnh không khớp manifest: ${path}.`);
  }
  const requested = new URLSearchParams(location.hash.slice(1)).get('equipment');
  state.selected = equipment.some(item => item.id === requested) ? requested : equipment[0].id;
  $('equipment').innerHTML = equipment.map(item => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`).join('');
  $('equipment').value = state.selected;
  $('equipment').addEventListener('change', () => { state.selected = $('equipment').value; history.replaceState(null, '', `#equipment=${encodeURIComponent(state.selected)}`); draw(); });
  for (const button of document.querySelectorAll('[data-zoom]')) button.addEventListener('click', () => { state.zoom = Number(button.dataset.zoom); for (const candidate of document.querySelectorAll('[data-zoom]')) candidate.setAttribute('aria-pressed', String(candidate === button)); draw(); });
  $('background').addEventListener('change', () => { state.background = $('background').value; draw(); });
  for (const [id, key] of [['show-body','body'], ['show-gear','gear'], ['show-roots','roots'], ['show-boxes','boxes']]) $(id).addEventListener('change', () => { state[key] = $(id).checked; draw(); });
  showSources(); draw();
  $('pack-status').textContent = `${equipment.length} mẫu thử · hình v1 không được chọn`;
  document.body.dataset.ready = 'true';
  window.equipmentStudyReview = Object.freeze({ manifest, getState: () => ({ ...state }) });
}
start().catch(error => { $('load-error').hidden = false; $('load-error').textContent = `${error.message} Mở trang qua HTTP để đọc manifest và ảnh cùng thư mục.`; $('pack-status').textContent = 'Hồ sơ chưa nạp đủ'; document.body.dataset.ready = 'error'; console.error(error); });
