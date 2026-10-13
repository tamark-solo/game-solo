const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
const images = new Map();
const state = { zoom: 2, background: 'dark', body: true, gear: true, fx: true, roots: true, boxes: false, selected: '' };
let manifest, body, equipment;
for (const image of document.querySelectorAll('.remote-reference')) {
  image.addEventListener('error',() => { image.hidden = true; });
  if (image.complete && image.naturalWidth === 0) image.hidden = true;
}

const directions = [
  {
    key: 'sword', name: 'Tiên kiếm · Hứa Lập Quốc', tagline: 'Một kiếm có linh tính, hiện diện sát thân.',
    canon: 'Tiên kiếm của Vương Lâm phát khí đen; Hứa Lập Quốc cất tiếng và hiện ra từ khí của kiếm. Nguồn đã đọc chưa chốt kim loại, màu lưỡi hoặc hình guard.',
    references: [['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-365','Truyện · chương 365'], ['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-399','chương 399']],
    adaptation: 'Đề xuất một lưỡi có silhouette mạnh và chuôi riêng, đủ đọc ở 1×. Màu/vật liệu/hoa văn là thiết kế mới; biểu hiện kiếm linh sẽ nằm ở layer riêng khi làm FX.',
    experience: 'Vũ khí sát tay, nhịp chém rõ; kiếm linh có phản ứng riêng thay vì chỉ đổi màu kiếm.',
    motion: 'Grip/tip theo frame, combo lấy thế–phát–hồi; kiếm linh và khí có clock/FX riêng.',
    scope: 'Neutral tĩnh; chưa chứng minh grip và occlusion của combo.'
  },
  {
    key: 'banner', name: 'Thập Ức Tôn Hồn Phiên', tagline: 'Cán, vải và hồn tạo một khối triển khai riêng.',
    canon: 'Hồn hóa khí đen để tạo cờ lớn; Vương Lâm cầm và phất đại kỳ, có tiếng hồn gào. Tên gốc 十亿尊魂幡 là Thập Ức Tôn Hồn Phiên.',
    references: [['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-397','Truyện · chương 397'], ['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-538','chương 538'], ['https://www.qidian.com/book/1264634/catalog/','Mục lục gốc']],
    adaptation: 'Đề xuất form cờ triển khai cạnh người, đọc được cán và mặt vải. Màu viền, dấu niêm, rách vải hoặc hình hồn cụ thể đều là thiết kế mới; kích thước preview là diễn giải cho game.',
    experience: 'Từ mang cờ đến triển khai và dẫn hồn: nhịp hiện diện khác món cầm tay nhỏ.',
    motion: 'Cán/grip, vải unfold, người kết ấn; hồn/khí/release/return tách timeline.',
    scope: 'Truyện mô tả cờ lớn; preview không dùng kích thước canon làm world scale.'
  },
  {
    key: 'bead', name: 'Thiên Nghịch châu', tagline: 'Đá xám khắc mây; sức hút đến từ vai trò, không từ màu đỏ.',
    canon: 'Ở đầu truyện, sau khi rửa sạch là châu đá xám cũ có năm vân mây. Màu đỏ ban đầu do máu chim. Về sau mười mây đổi thành ký tự lạ và mở nội giới.',
    references: [['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-8','Truyện · chương 8'], ['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-23','chương 23']],
    adaptation: 'Chọn trạng thái đá xám/năm mây làm mốc nhận diện. Độ phóng đại để đọc vân, cách đặt lơ lửng, vòng ngọc hoặc ánh sáng là đề xuất hiển thị riêng; không gọi đó là form canon.',
    experience: 'Người kết ấn, món đồ là tâm điểm của nội giới; đủ khác một cầu aura trang trí thường trực.',
    motion: 'Giữ/giơ/kết ấn; bead root/orbit, chuyển trạng thái và FX tách người.',
    scope: 'Bản native là form hiển thị chuyển thể; chưa có nội giới, orbit hoặc animation.'
  },
  {
    key: 'chariot', name: 'Xạ Thần Xa', tagline: 'Một chiến xa triển khai trong scene, không nằm trong bàn tay.',
    canon: 'Các dạng/mốc trong truyện khác nhau: chương 365 có xích kiềm thú linh; chương 648 có cầu lôi hóa lôi thú; chiến xa thứ ba ở chương 807/808 cổ dữ, có gai và ánh đen. Tên gốc là 射神车.',
    references: [['https://www.webnovel.com/book/22357181000109902','Mục lục tác giả · 射神车'], ['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-365','Truyện · chương 365'], ['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-808','chương 808'], ['https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-648','chương 648']],
    adaptation: 'Đề xuất form thu nhỏ/chuyển thể để so với người và kiểm bố cục. Nếu ghép gai, xích và lôi từ các mốc khác nhau, đây là tổng hợp ý tưởng mỹ thuật mới. Khung xe, bánh, vật liệu, sừng, màu và footprint chưa được nguồn chốt.',
    experience: 'Triệu hồi/triển khai và điều khiển thú linh tạo quy mô scene, khác ba món thuộc nhóm actor.',
    motion: 'Người điều khiển; xe triển khai/thu, xích/thú linh/FX riêng, root và footprint riêng.',
    scope: 'Không coi form 256×224 là kích thước chiến xa trong truyện hoặc collider đã chốt.'
  }
];
function direction(item) {
  const identity = `${item.id} ${item.name}`.toLowerCase();
  if (/banner|soul|phiên|phan/.test(identity)) return directions[1];
  if (/bead|châu|chau|heaven/.test(identity)) return directions[2];
  if (/chariot|war|xa|vehicle/.test(identity)) return directions[3];
  if (/sword|kiếm|kiem|xu/.test(identity)) return directions[0];
  return directions[equipment.indexOf(item)] ?? directions[0];
}
const canonicalLinks = item => direction(item).references.map(([url, label]) => `<a href="${escapeHTML(url)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>`).join(' · ');
function sourceLinks(item) {
  const entries = [[item.raw ?? item.source?.raw, 'Nguồn lớn'], [item.file, 'Layer native'], [item.rearFile, 'Phần sau'], [item.frontFile, 'Phần trước'], [item.fxRearFile ?? item.fxFile, 'FX tĩnh riêng'], [item.prompt ?? item.source?.prompt, 'Prompt']];
  return entries.filter(([path]) => path).map(([path, label]) => `<a href="${escapeHTML(path)}" target="_blank" rel="noopener">${label}</a>`).join('');
}
function paths(item) { return [...new Set([item.fxRearFile ?? item.fxFile, item.rearFile, item.frontFile, (!item.rearFile && !item.frontFile) ? item.file : null].filter(Boolean))]; }
async function loadImage(path) {
  if (images.has(path)) return images.get(path);
  const image = new Image(); image.src = path; await image.decode(); images.set(path, image); return image;
}
function frame(item) { return { canvas: item?.canvas ?? body.canvas, pivot: item?.pivot ?? body.pivot }; }
function bounds(item) {
  const current = frame(item);
  return { left: Math.max(body.pivot[0], current.pivot[0]), right: Math.max(body.canvas[0] - body.pivot[0], current.canvas[0] - current.pivot[0]), top: Math.max(body.pivot[1], current.pivot[1]), bottom: Math.max(body.canvas[1] - body.pivot[1], current.canvas[1] - current.pivot[1]) };
}
function background(ctx, width, height, scale) {
  const palette = { dark: ['#182d25','#234333'], light: ['#eee9d8','#d6d0bb'], gray: ['#828983','#737b74'] };
  const [base, line] = palette[state.background]; ctx.fillStyle = base; ctx.fillRect(0, 0, width, height); ctx.strokeStyle = line; ctx.lineWidth = 1;
  for (let x = .5; x < width; x += 16 * scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = .5; y < height; y += 16 * scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
}
function layer(ctx, path, pivot, x, y, scale) {
  if (!path) return;
  const image = images.get(path);
  ctx.drawImage(image, Math.round(x - pivot[0] * scale), Math.round(y - pivot[1] * scale), image.width * scale, image.height * scale);
}
function actor(ctx, item, x, y, scale) {
  const current = frame(item);
  if (state.fx && item) layer(ctx, item.fxRearFile ?? item.fxFile, current.pivot, x, y, scale);
  if (state.gear && item) layer(ctx, item.rearFile, current.pivot, x, y, scale);
  if (state.body) layer(ctx, body.file, body.pivot, x, y, scale);
  if (state.gear && item) { if (item.frontFile) layer(ctx, item.frontFile, current.pivot, x, y, scale); else if (!item.rearFile) layer(ctx, item.file, current.pivot, x, y, scale); }
  if (state.boxes) {
    ctx.strokeStyle = '#c7ad59'; ctx.setLineDash([4,3]);
    ctx.strokeRect(x - body.pivot[0] * scale + .5, y - body.pivot[1] * scale + .5, body.canvas[0] * scale, body.canvas[1] * scale);
    if (item) { ctx.strokeStyle = '#6cc1d1'; ctx.strokeRect(x - current.pivot[0] * scale + .5, y - current.pivot[1] * scale + .5, current.canvas[0] * scale, current.canvas[1] * scale); }
    ctx.setLineDash([]);
  }
  if (state.roots) {
    ctx.strokeStyle = state.background === 'light' ? '#a94e30' : '#edc870'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 5,y + .5); ctx.lineTo(x + 5,y + .5); ctx.moveTo(x + .5,y - 5); ctx.lineTo(x + .5,y + 5); ctx.stroke();
  }
}
function label(ctx, text, x, y) {
  ctx.font = '13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const width = ctx.measureText(text).width;
  ctx.fillStyle = '#10271fef'; ctx.fillRect(x - width / 2 - 10, y - 14, width + 20, 28); ctx.fillStyle = '#eee3c6'; ctx.fillText(text, x, y);
}
function nativePreviews() {
  equipment.forEach((item, index) => {
    const canvas = $(`native-${index}`); canvas.width = item.canvas[0]; canvas.height = item.canvas[1]; canvas.style.width = `${item.canvas[0]}px`; canvas.style.height = `${item.canvas[1]}px`;
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    background(ctx, canvas.width, canvas.height, 1); actor(ctx, item, item.pivot[0], item.pivot[1], 1);
  });
}
function pairPreview() {
  const canvas = $('pair'), item = equipment.find(entry => entry.id === state.selected), items = [null,item], metrics = items.map(bounds), scale = state.zoom;
  const top = Math.max(...metrics.map(entry => entry.top)), bottom = Math.max(...metrics.map(entry => entry.bottom)), pad = 24, gap = 52;
  const widths = metrics.map(entry => Math.max(110,entry.left + entry.right));
  const nativeWidth = widths.reduce((sum,width) => sum + width, 0) + gap + pad * 2;
  canvas.width = nativeWidth * scale; canvas.height = (top + bottom + pad * 2) * scale + 48;
  canvas.style.width = `${canvas.width}px`; canvas.style.height = `${canvas.height}px`;
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; background(ctx, canvas.width, canvas.height, scale);
  const y = (top + pad) * scale;
  ctx.strokeStyle = state.background === 'light' ? '#a5a081' : '#9fae87'; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(0,y + .5); ctx.lineTo(canvas.width,y + .5); ctx.stroke(); ctx.setLineDash([]);
  let cursor = pad;
  items.forEach((entry,index) => {
    const x = (cursor + (widths[index] - metrics[index].left - metrics[index].right) / 2 + metrics[index].left) * scale;
    actor(ctx,entry,x,y,scale);
    label(ctx,entry ? direction(entry).name : 'Vương Lâm live',x,y + bottom * scale + 23);
    cursor += widths[index] + gap;
  });
  $('scale-note').textContent = `${scale}× nearest · 1 pixel ảnh = ${scale} pixel CSS. ${scale === 1 ? 'Cỡ native để đánh giá đồ và người.' : 'Chọn 1× để đánh giá cỡ chơi.'} Cuộn ngang để giữ tỷ lệ, không fit thân theo canvas pháp bảo.`;
}
function detail() {
  const item = equipment.find(entry => entry.id === state.selected), design = direction(item), current = frame(item), offset = [current.pivot[0] - body.pivot[0],current.pivot[1] - body.pivot[1]], hash = item.sha256 ?? item.nativeSha256 ?? item.hash;
  $('detail').innerHTML = `<div class="detail-grid"><div><h3>${escapeHTML(design.name)}</h3><p>${escapeHTML(item.description ?? design.experience)}</p><p><b>Trải nghiệm đề xuất:</b> ${escapeHTML(design.experience)}</p><p><b>Motion cần:</b> ${escapeHTML(design.motion)}</p><p class="hint">${escapeHTML(design.scope)} Pháp bảo và FX là concept tĩnh chưa được owner duyệt.</p></div><div><dl><dt>Thân live</dt><dd>${body.canvas.join(' × ')} · chân (${body.pivot.join(', ')})</dd><dt>Canvas pháp bảo</dt><dd>${current.canvas.join(' × ')} · neo (${current.pivot.join(', ')})</dd><dt>Đặt thân</dt><dd>(${offset.join(', ')}) · cùng world foot</dd><dt>Layer</dt><dd>FX tĩnh → phần sau → body → phần trước</dd><dt>Trạng thái</dt><dd>Neutral Đông Nam · candidate</dd></dl>${hash ? `<p class="hash">SHA-256: ${escapeHTML(hash)}</p>` : ''}<p class="hint">Giữ scale/body; scene artifact sẽ cần world root/footprint riêng.</p><div class="links">${sourceLinks(item)}</div></div></div>`;
}
function renderCards() {
  $('artifact-grid').innerHTML = equipment.map((item,index) => {
    const design = direction(item), raw = item.raw ?? item.source?.raw;
    return `<article class="artifact-card"><div class="artifact-heading"><div><h3>${escapeHTML(design.name)}</h3><p>${escapeHTML(design.tagline)}</p></div><span class="number">0${index + 1}</span></div><div class="source-image">${raw ? `<a href="${escapeHTML(raw)}" target="_blank" rel="noopener"><img src="${escapeHTML(raw)}" alt="Nguồn thiết kế mới ${escapeHTML(design.name)}" loading="lazy"></a>` : '<span class="source-empty">Nguồn đang được đóng hồ sơ</span>'}</div><div class="native-row"><div class="native-cell"><canvas id="native-${index}" width="${item.canvas[0]}" height="${item.canvas[1]}" role="img" aria-label="Composite native 1× ${escapeHTML(design.name)} trên thân Vương Lâm live"></canvas><span class="native-caption">COMPOSITE 1× · BODY / PHÁP BẢO / FX TĨNH</span></div><div class="native-note"><strong>Đọc riêng silhouette</strong><p>${escapeHTML(design.scope)}</p><button type="button" class="select-artifact" data-id="${escapeHTML(item.id)}">So riêng ở 2× →</button></div></div><div class="artifact-copy"><div class="copy-block"><span class="copy-label">Đã đọc trong truyện</span><p>${escapeHTML(design.canon)}</p>${canonicalLinks(item)}</div><div class="copy-block adaptation"><span class="copy-label">Thiết kế mới cho game</span><p>${escapeHTML(design.adaptation)}</p></div><div class="links">${sourceLinks(item)}</div><p class="scope">Candidate · một pose Đông Nam. Không suy animation/runtime hoặc ART approval.</p></div></article>`;
  }).join('');
  for (const button of document.querySelectorAll('.select-artifact')) button.addEventListener('click', () => { state.selected = button.dataset.id; state.zoom = 2; $('equipment').value = state.selected; updateZoomButtons(); update(); $('native-review').scrollIntoView({block:'start'}); });
}
function updateZoomButtons() { for (const button of document.querySelectorAll('[data-zoom]')) button.setAttribute('aria-pressed',String(Number(button.dataset.zoom) === state.zoom)); }
function update() { nativePreviews(); pairPreview(); detail(); history.replaceState(null,'',`#equipment=${encodeURIComponent(state.selected)}`); }
async function start() {
  const response = await fetch('./manifest.json'); if (!response.ok) throw Error(`Không đọc được manifest (${response.status}).`);
  manifest = await response.json(); body = manifest.body; equipment = manifest.equipment;
  if (!body?.file || !Array.isArray(body.canvas) || !Array.isArray(body.pivot) || !equipment?.length) throw Error('Manifest thiếu body/equipment.');
  if (body.canvas.join(',') !== '64,96' || body.pivot.join(',') !== '32,88') throw Error('Thân phải đúng frame live 64×96/(32,88).');
  for (const item of equipment) if (!item.id || !item.name || !Array.isArray(item.canvas) || !Array.isArray(item.pivot) || !paths(item).length) throw Error('Pháp bảo thiếu canvas/pivot/layer.');
  await Promise.all([body.file,...equipment.flatMap(paths)].map(loadImage));
  for (const item of [body,...equipment]) for (const path of item === body ? [body.file] : paths(item)) { const image = images.get(path); if (image.width !== item.canvas[0] || image.height !== item.canvas[1]) throw Error(`Kích thước ảnh không khớp: ${path}.`); }
  const requested = new URLSearchParams(location.hash.slice(1)).get('equipment'); state.selected = equipment.some(item => item.id === requested) ? requested : equipment[0].id;
  $('equipment').innerHTML = equipment.map(item => `<option value="${escapeHTML(item.id)}">${escapeHTML(direction(item).name)}</option>`).join(''); $('equipment').value = state.selected;
  $('equipment').addEventListener('change',() => { state.selected = $('equipment').value; update(); });
  for (const button of document.querySelectorAll('[data-zoom]')) button.addEventListener('click',() => { state.zoom = Number(button.dataset.zoom); updateZoomButtons(); update(); });
  $('background').addEventListener('change',() => { state.background = $('background').value; update(); });
  for (const [id,key] of [['show-body','body'],['show-gear','gear'],['show-fx','fx'],['show-roots','roots'],['show-boxes','boxes']]) $(id).addEventListener('change',() => { state[key] = $(id).checked; update(); });
  renderCards(); update(); $('pack-status').textContent = `${equipment.length} hình tĩnh + FX riêng · chờ owner review`; document.body.dataset.ready = 'true';
  window.equipmentStoryReview = Object.freeze({ manifest, directions, getState:() => ({...state}) });
}
start().catch(error => { $('load-error').hidden = false; $('load-error').textContent = `${error.message} Mở trang qua HTTP để đọc manifest cùng ảnh.`; $('pack-status').textContent = 'Chưa nạp đủ hồ sơ'; document.body.dataset.ready = 'error'; console.error(error); });
