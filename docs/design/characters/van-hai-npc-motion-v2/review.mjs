const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = async path => { const response = await fetch(path); if (!response.ok) throw Error(`Chưa có ${path}`); return response.json(); };
const sha256 = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
const actionNames = {idle:'Idle · đứng chờ', talk:'Talk · nói chuyện', profession:'Profession · theo nghề'};
const directionNames = {north:'Bắc', northeast:'Đông Bắc', east:'Đông', southeast:'Đông Nam', south:'Nam', southwest:'Tây Nam', west:'Tây', northwest:'Tây Bắc'};
const directions = Object.keys(directionNames);
const gestures = {
 'NPC-HN-GUIDE':'Trần Duy mở lòng bàn tay và chỉ lối trong khi giữ vị trí đứng.',
 'NPC-HN-CULTIVATION':'Diệp Tĩnh thở chậm, giữ tay gần bụng và chuỗi ngọc; khí tức tiếp nối ở lớp FX riêng.',
 'NPC-HN-TRAINING':'Tạ Kiếm Sơn minh họa cổ tay và thế đứng bằng kiếm gỗ với nhịp vừa phải.',
 'NPC-HN-PREPARATION':'Tô Nhược xem hộp niêm và kiểm dấu bằng bút.'
};
const standardPath = '../van-hai-npc-visual-standard-v1/';
const mapPath = '../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';

try {
 const [catalog, plan, standard] = await Promise.all([json('./catalog.json'), json('../../world/van-hai-living-world-v1/plan.json'), json(standardPath + 'directions.json')]);
 const actors = catalog.actors.map(item => ({...item, brief:plan.npcs.find(npc => npc.id === item.id)}));
 if (actors.length !== 4 || actors.some(item => !item.brief || !item.views)) throw Error('Cần catalog bốn NPC với brief và bảng hướng.');
 const live = Object.fromEntries(standard.directions.map(item => [item.direction, {...item, path:standardPath + item.native}]));
 for (const direction of directions) if (!live[direction]) throw Error(`Thiếu chuẩn Vương Lâm live hướng ${directionNames[direction]}.`);
 for (const item of actors) for (const [direction, view] of Object.entries(item.views)) {
  if (!directions.includes(direction)) throw Error(`Hướng chưa xác định: ${direction}.`);
  for (const action of Object.keys(actionNames)) {
   const clip = view.clips[action];
   if (!clip || clip.frames.length !== 6 || clip.canvas.join(',') !== '96,96' || clip.pivot.join(',') !== '48,88' || clip.direction !== direction) throw Error(`Clip ${item.name}/${direction}/${action} chưa đủ hợp đồng.`);
   if (!clip.frames.every(frame => frame.durationMs > 0 && frame.w === 96 && frame.h === 96)) throw Error(`Frame ${clip.id} chưa đủ hold/rect.`);
   if (Math.abs(clip.frames.reduce((sum, frame) => sum + frame.durationMs, 0) - clip.durationMs) > .01) throw Error(`Thời lượng ${clip.id} chưa khớp.`);
  }
 }
 const images = new Map(), masks = new Map();
 async function load(path, expectedHash) {
  if (images.has(path)) return images.get(path);
  if (expectedHash) {
   const response = await fetch(path);
   if (!response.ok || await sha256(await response.arrayBuffer()) !== expectedHash) throw Error(`Ảnh đối chiếu live không khớp hash: ${path}`);
  }
  const image = new Image(); image.src = path; await image.decode(); images.set(path, image); return image;
 }
 await Promise.all([
  ...directions.map(direction => load(live[direction].path, live[direction].nativeSha256)), load(mapPath),
  ...[...new Set(actors.flatMap(item => Object.values(item.views).flatMap(view => [view.neutralSprite, ...Object.values(view.clips).map(clip => clip.atlas)].filter(Boolean))))].map(path => load(path))
 ]);
 const query = new URLSearchParams(location.hash.slice(1));
 const state = {
  selected:actors.some(item => item.id === query.get('actor')) ? query.get('actor') : actors[0].id,
  direction:directions.includes(query.get('direction')) ? query.get('direction') : 'southeast',
  action:Object.hasOwn(actionNames, query.get('action')) ? query.get('action') : 'idle',
  zoom:1, ageMs:0, startedAt:performance.now(), speed:1, playing:false
 };
 const actor = () => actors.find(item => item.id === state.selected);
 const view = () => actor().views[state.direction];
 const clip = () => view()?.clips[state.action];
 function age(now = performance.now()) {
  const item = clip();
  if (!item || !state.playing) return state.ageMs;
  const elapsed = state.ageMs + Math.max(0, now - state.startedAt) * state.speed;
  return item.loop ? elapsed % item.durationMs : Math.min(elapsed, item.durationMs);
 }
 function frameAt(ms, item = clip()) {
  if (!item) return null;
  let cursor = 0;
  for (let index = 0; index < item.frames.length; index++) { cursor += item.frames[index].durationMs; if (ms < cursor || index === item.frames.length - 1) return index; }
  return item.frames.length - 1;
 }
 const frameStart = (index, item = clip()) => item?.frames.slice(0, index).reduce((sum, frame) => sum + frame.durationMs, 0) ?? 0;
 function freeze() { state.ageMs = age(); state.startedAt = performance.now(); state.playing = false; $('play').textContent = 'Phát'; $('play').setAttribute('aria-pressed', 'false'); }
 function setPlaying(value) {
  if (!clip()) return;
  state.ageMs = age(); state.startedAt = performance.now(); state.playing = value;
  if (value && state.ageMs >= clip().durationMs) state.ageMs = 0;
  $('play').textContent = value ? 'Dừng' : 'Phát'; $('play').setAttribute('aria-pressed', String(value)); draw();
 }
 function seek(ms) { freeze(); state.ageMs = Math.max(0, Math.min(clip()?.durationMs ?? 0, ms)); draw(); }
 function crop(ctx, item, frame, x, y, zoom, shadow = false) {
  const px = Math.round(x - item.pivot[0] * zoom), py = Math.round(y - item.pivot[1] * zoom), image = images.get(item.atlas);
  if (shadow) { ctx.fillStyle = '#112b2255'; ctx.beginPath(); ctx.ellipse(x, y, 15 * zoom, 4 * zoom, 0, 0, Math.PI * 2); ctx.fill(); }
  if ($('silhouette').checked) {
   const key = [item.atlas, frame.x, frame.y, frame.w, frame.h].join('|');
   if (!masks.has(key)) { const canvas = document.createElement('canvas'); canvas.width = frame.w; canvas.height = frame.h; const mask = canvas.getContext('2d'); mask.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h); mask.globalCompositeOperation = 'source-in'; mask.fillStyle = '#172b29'; mask.fillRect(0, 0, frame.w, frame.h); masks.set(key, canvas); }
   ctx.drawImage(masks.get(key), px, py, frame.w * zoom, frame.h * zoom);
  } else ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, px, py, frame.w * zoom, frame.h * zoom);
 }
 function marker(ctx, x, y, label) {
  if ($('roots').checked) { ctx.strokeStyle = '#c03939'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke(); }
  ctx.font = '15px Segoe UI'; ctx.textAlign = 'center'; const width = ctx.measureText(label).width;
  ctx.fillStyle = '#132922ee'; ctx.fillRect(x - width / 2 - 10, y + 16, width + 20, 29); ctx.fillStyle = '#f2e7cd'; ctx.fillText(label, x, y + 36);
 }
 function draw(now = performance.now()) {
  const item = clip(), ms = age(now), index = frameAt(ms, item), frame = item?.frames[index], ctx = $('stage').getContext('2d'), zoom = state.zoom, scene = $('scene').value;
  ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 960, 600);
  if (scene === 'map') ctx.drawImage(images.get(mapPath), 1136 + (1 - 1 / zoom) * 480, 644 + (1 - 1 / zoom) * 300, 960 / zoom, 600 / zoom, 0, 0, 960, 600);
  else {
   ctx.fillStyle = scene === 'light' ? '#eee7d3' : '#203d34'; ctx.fillRect(0, 0, 960, 600); ctx.strokeStyle = scene === 'light' ? '#d0cbb7' : '#38594a';
   for (let x = 0; x < 960; x += 32 * zoom) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); }
   for (let y = 0; y < 600; y += 32 * zoom) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }
  }
  ctx.fillStyle = '#142c25eb'; ctx.fillRect(18, 17, 750, 62); ctx.fillStyle = '#ebdbb6'; ctx.font = '15px Segoe UI'; ctx.textAlign = 'left';
  ctx.fillText(`${zoom}× · ${directionNames[state.direction]} · ${actionNames[state.action]} · ${item ? `pose ${index + 1}/6` : 'chưa có nguồn'}`, 31, 42);
  ctx.font = '12px Segoe UI'; ctx.fillText(`Vương Lâm live cùng hướng · ${view()?.artApproved ? 'hướng này đã duyệt' : 'hướng này đang xem thử'}`, 31, 63);
  const reference = live[state.direction], player = images.get(reference.path);
  crop(ctx, {atlas:reference.path, pivot:reference.pivot}, {x:0,y:0,w:player.width,h:player.height}, 270, 470, zoom, $('shadows').checked);
  marker(ctx, 270, 470, `Vương Lâm live · ${directionNames[state.direction]}`);
  if (item) { crop(ctx, item, frame, 690, 470, zoom, $('shadows').checked); marker(ctx, 690, 470, `${actor().name} · ${actionNames[state.action].split(' · ')[0]}`); }
  else { ctx.textAlign = 'center'; ctx.fillStyle = '#f3dcc1'; ctx.font = '20px Segoe UI'; ctx.fillText(`Chưa có chuyển động ${directionNames[state.direction]}`, 690, 310); }
  $('seek').max = item?.durationMs ?? 1; $('seek').value = Math.round(ms); $('clock').value = item ? `${Math.round(ms)} / ${Math.round(item.durationMs)} ms` : 'Chưa có clip';
  $('frame-info').textContent = item ? `Pose ${index + 1} / 6 · hold ${Math.round(frame.durationMs)}ms · ${item.loop ? 'clip lặp' : 'giữ pose cuối'} · tốc độ ${state.speed}×` : 'Hướng chưa có nguồn được để trống.';
  for (const button of $('frames').querySelectorAll('[data-action]')) button.setAttribute('aria-pressed', String(button.dataset.action === state.action && Number(button.dataset.index) === index));
  document.body.dataset.frame = index === null ? '' : String(index); document.body.dataset.action = state.action; document.body.dataset.actor = state.selected; document.body.dataset.direction = state.direction; document.body.dataset.available = String(Boolean(item));
  if (state.playing && !item.loop && ms >= item.durationMs) { freeze(); }
 }
 function renderCards() {
  $('cards').innerHTML = actors.map(item => `<button class="actor-card" data-id="${esc(item.id)}" aria-pressed="${item.id === state.selected}"><canvas width="96" height="96" aria-label="Pose đầu của ${esc(item.name)}"></canvas><div class="caption"><strong>${esc(item.name)}</strong><small>${esc(item.brief.role)}</small><small>${Object.keys(item.views).length}/8 hướng · ${Object.keys(item.views).length * 18} pose</small></div></button>`).join('');
  for (const button of $('cards').querySelectorAll('button')) {
   const item = actors.find(item => item.id === button.dataset.id), preview = item.views.southeast ?? Object.values(item.views)[0], first = preview?.clips.idle.frames[0], ctx = button.querySelector('canvas').getContext('2d');
   ctx.imageSmoothingEnabled = false; if (first) ctx.drawImage(images.get(preview.clips.idle.atlas), first.x, first.y, first.w, first.h, 0, 0, 96, 96);
   button.onclick = () => { choose(item.id); $('playback').scrollIntoView({block:'start'}); };
  }
 }
 function directionMatrix() {
  const item = actor();
  $('direction-matrix').innerHTML = directions.map(direction => `<button class="direction-card" data-direction="${direction}" data-available="${Boolean(item.views[direction])}" aria-pressed="${direction === state.direction}"><canvas width="352" height="192" aria-label="${esc(item.name)} đối chiếu Vương Lâm hướng ${directionNames[direction]} ở cỡ 2×"></canvas><span><b>${directionNames[direction]}</b> · ${item.views[direction] ? (item.views[direction].artApproved ? 'Đã duyệt' : '18 pose xem thử') : 'Chưa có nguồn'}</span></button>`).join('');
  for (const button of $('direction-matrix').querySelectorAll('button')) {
   const direction = button.dataset.direction, reference = live[direction], ctx = button.querySelector('canvas').getContext('2d'), neutral = item.views[direction]?.neutralSprite;
   ctx.imageSmoothingEnabled = false; ctx.drawImage(images.get(reference.path), 16, 0, 128, 192);
   if (neutral) ctx.drawImage(images.get(neutral), 160, 0, 192, 192);
   else { ctx.font = '12px Segoe UI'; ctx.fillStyle = '#655943'; ctx.textAlign = 'center'; ctx.fillText('Chưa có nguồn', 256, 100); }
   button.onclick = () => { changeDirection(direction); $('playback').scrollIntoView({block:'start'}); };
  }
 }
 function contactSheet() {
  const item = actor(), current = view();
  if (!current) { $('frames').innerHTML = `<div class="empty-poses"><p>${esc(item.name)} chưa có pose hướng ${directionNames[state.direction]}.</p></div>`; return; }
  $('frames').innerHTML = Object.keys(actionNames).flatMap(action => current.clips[action].frames.map((frame, index) => `<button class="pose" data-action="${action}" data-index="${index}" aria-pressed="false"><canvas width="192" height="192" aria-label="${esc(item.name)} ${state.direction} ${action} pose ${index + 1}"></canvas><span>${action} ${index + 1} · ${Math.round(frame.durationMs)}ms</span></button>`)).join('');
  for (const button of $('frames').querySelectorAll('button')) {
   const action = button.dataset.action, index = Number(button.dataset.index), motion = current.clips[action], frame = motion.frames[index], ctx = button.querySelector('canvas').getContext('2d');
   ctx.imageSmoothingEnabled = false; ctx.drawImage(images.get(motion.atlas), frame.x, frame.y, frame.w, frame.h, 0, 0, 192, 192);
   button.onclick = () => { changeAction(action); seek(frameStart(index)); };
  }
 }
 function detail() {
  const item = actor(), brief = item.brief, current = view();
  $('detail').innerHTML = `<h3>${esc(item.name)}</h3><div class="meta">${esc(brief.role)} · ${esc(brief.zone)} · ${directionNames[state.direction]}</div><div class="grid"><div><p><b>Nhận diện:</b> ${esc(brief.look)}</p><p><b>Tính cách:</b> ${esc(brief.personality)}</p><blockquote>${esc(brief.quote)}</blockquote></div><div><p><b>Cử chỉ theo nghề:</b> ${esc(gestures[item.id])}</p><p><b>Vai trò trong chương:</b> ${esc(brief.task)}</p><p><b>Brief nguồn:</b> ${esc(brief.brief)}</p></div></div><p class="meta">${current ? 'Ba clip thật × sáu pose ở hướng đang xem.' : 'Hướng này đang chờ nguồn.'} Canvas 96×96 thêm khoảng trống cho cử chỉ; điểm chân (48,88), cỡ người lấy từ neutral của cùng nguồn. So đầu, vai, thân và màu trực tiếp với Vương Lâm live ở đúng hướng.</p><div class="detail-links">${current?.neutralSprite ? `<a href="${esc(current.neutralSprite)}">Neutral ${directionNames[state.direction]}</a>` : ''}<a href="${esc(live[state.direction].path)}">Vương Lâm live ${directionNames[state.direction]}</a><a href="catalog.json">Atlas / timeline</a><a href="registration.json">Mốc đo nguồn</a></div>`;
  const available = Boolean(clip()); $('availability').dataset.available = String(available);
  $('availability').textContent = available ? `${item.name} · ${directionNames[state.direction]} · ${current.artApproved ? '12 clip Đông Nam của bốn NPC đã được owner duyệt theo hash.' : 'View mới đang xem ART và chuyển động.'}` : `${item.name} · ${directionNames[state.direction]} đang chờ nguồn.`;
  for (const id of ['play','reset','previous','next','seek']) $(id).disabled = !available;
 }
 function saveHash() { history.replaceState(null, '', `#actor=${encodeURIComponent(state.selected)}&direction=${state.direction}&action=${state.action}`); }
 function choose(id) { freeze(); state.selected = id; state.ageMs = 0; $('actor').value = id; saveHash(); renderCards(); directionMatrix(); contactSheet(); detail(); draw(); }
 function changeDirection(direction) { freeze(); state.direction = direction; state.ageMs = 0; $('direction').value = direction; saveHash(); directionMatrix(); contactSheet(); detail(); draw(); }
 function changeAction(action) { freeze(); state.action = action; state.ageMs = 0; $('action').value = action; saveHash(); draw(); }
 $('actor').innerHTML = actors.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
 $('direction').innerHTML = directions.map(direction => `<option value="${direction}">${directionNames[direction]}</option>`).join('');
 $('direction').value = state.direction; $('action').value = state.action;
 $('actor').onchange = () => choose($('actor').value); $('direction').onchange = () => changeDirection($('direction').value); $('action').onchange = () => changeAction($('action').value);
 $('play').onclick = () => setPlaying(!state.playing); $('reset').onclick = () => seek(0); $('seek').oninput = () => seek(Number($('seek').value));
 $('previous').onclick = () => seek(frameStart(Math.max(0, frameAt(age()) - 1))); $('next').onclick = () => seek(frameStart(Math.min(5, frameAt(age()) + 1)));
 $('speed').onchange = () => { state.ageMs = age(); state.startedAt = performance.now(); state.speed = Number($('speed').value); draw(); };
 for (const button of document.querySelectorAll('[data-zoom]')) button.onclick = () => { state.zoom = Number(button.dataset.zoom); for (const other of document.querySelectorAll('[data-zoom]')) other.setAttribute('aria-pressed', String(other === button)); draw(); };
 for (const id of ['scene','roots','shadows','silhouette']) $(id).onchange = () => draw();
 document.addEventListener('visibilitychange', () => { if (document.hidden) { freeze(); draw(); } });
 window.addEventListener('offline', () => { freeze(); draw(); });
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { freeze(); draw(); } });
 const producedClips = actors.reduce((sum, item) => sum + Object.keys(item.views).length * 3, 0);
 const poses = producedClips * 6, missing = actors.flatMap(item => directions.filter(direction => !item.views[direction]).map(direction => ({actor:item.id, direction})));
 $('coverage-badge').textContent = `${producedClips}/96 clip · ${poses}/576 pose`;
 $('coverage-summary').textContent = `${actors.length} NPC · ${producedClips} clip · ${poses} pose hiện có. ${missing.length ? `Còn ${missing.length} view đang chờ nguồn.` : 'Đủ tám view thật cho mỗi NPC.'}`;
 $('coverage-table').innerHTML = `<table><thead><tr><th scope="col">NPC</th>${directions.map(direction => `<th scope="col">${directionNames[direction]}</th>`).join('')}</tr></thead><tbody>${actors.map(item => `<tr><th scope="row">${esc(item.name)}</th>${directions.map(direction => `<td data-available="${Boolean(item.views[direction])}">${item.views[direction] ? (item.views[direction].artApproved ? 'Đã duyệt' : '3 clip xem thử') : 'Chờ nguồn'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 window.__npcMotionReview = () => {
  const ms = age(), item = clip(), index = frameAt(ms, item);
  return {actor:state.selected, direction:state.direction, action:state.action, zoom:state.zoom, playing:state.playing, timeMs:ms, durationMs:item?.durationMs ?? 0, loop:item?.loop ?? false, speed:state.speed, frameIndex:index, frameRect:item?.frames[index] ?? null, atlas:item?.atlas ?? null, primaryPath:live[state.direction].path, primaryHash:live[state.direction].nativeSha256, available:Boolean(item), viewArtApproved:Boolean(view()?.artApproved), reducedMotion:reducedMotion.matches, producedClips, poses, missing};
 };
 function tick(now) { if (state.playing) draw(now); requestAnimationFrame(tick); }
 choose(state.selected); $('status').hidden = true; document.body.dataset.ready = 'true'; requestAnimationFrame(tick);
} catch (error) { $('status').textContent = `Bản xem chưa sẵn sàng: ${error.message}`; document.body.dataset.ready = 'error'; console.error(error); }
