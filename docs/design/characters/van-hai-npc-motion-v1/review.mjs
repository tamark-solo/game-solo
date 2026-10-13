const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = async path => { const response = await fetch(path); if (!response.ok) throw Error(`Chưa có ${path}`); return response.json(); };
const actionNames = { idle: 'Idle · đứng chờ', talk: 'Talk · nói chuyện', profession: 'Profession · theo nghề' };
const gestures = {
 'NPC-HN-GUIDE': 'Trần Duy mở lòng bàn tay và chỉ lối trong khi giữ vị trí đứng.',
 'NPC-HN-CULTIVATION': 'Diệp Tĩnh thở chậm, giữ tay gần bụng và chuỗi ngọc; khí tức là lớp FX tiếp nối riêng.',
 'NPC-HN-TRAINING': 'Tạ Kiếm Sơn minh họa cổ tay và thế đứng bằng kiếm gỗ với nhịp vừa phải.',
 'NPC-HN-PREPARATION': 'Tô Nhược xem hộp niêm và kiểm dấu bằng bút.'
};
const playerPath = '../van-hai-npc-visual-standard-v1/inputs/wang-lin-live-southeast-native.png';
const mapPath = '../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';
try {
 const [catalog, plan] = await Promise.all([json('./catalog.json'), json('../../world/van-hai-living-world-v1/plan.json')]);
 const approvalResponse = await fetch('./approval.json');
 if (approvalResponse.ok) {
  const approval = await approvalResponse.json(), bytes = await (await fetch('./catalog.json')).arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), value => value.toString(16).padStart(2, '0')).join('');
  const pinned = approval.pinnedFiles.find(file => file.file === 'catalog.json');
  if (approval.ownerApproved && approval.motionApproved && pinned?.sha256 === digest) {
   document.querySelector('.badges span:last-child').textContent = 'Đã duyệt pilot Đông Nam';
   const link = document.createElement('a'); link.href = './approval.json'; link.textContent = 'Mốc duyệt owner · 13/10/2026';
   document.querySelector('#coverage .links').append(link);
  }
 }
 const actors = catalog.actors.map(actor => ({...actor, brief: plan.npcs.find(npc => npc.id === actor.id)}));
 if (actors.length !== 4 || actors.some(actor => !actor.brief)) throw Error('Cần catalog đủ bốn NPC và brief.');
 for (const actor of actors) for (const action of Object.keys(actionNames)) {
  const clip = actor.clips[action];
  if (!clip || clip.frames.length !== 6 || clip.canvas.join(',') !== '96,96' || clip.pivot.join(',') !== '48,88') throw Error(`Clip ${actor.name}/${action} chưa đủ hợp đồng.`);
  if (!clip.frames.every(frame => frame.durationMs > 0 && frame.w === 96 && frame.h === 96)) throw Error(`Frame ${actor.name}/${action} chưa đủ hold/rect.`);
  if (Math.abs(clip.frames.reduce((sum, frame) => sum + frame.durationMs, 0) - clip.durationMs) > 0.01) throw Error(`Thời lượng ${actor.name}/${action} chưa khớp.`);
 }
 const images = new Map(), silhouettes = new Map();
 async function load(path) { if (images.has(path)) return images.get(path); const image = new Image(); image.src = path; await image.decode(); images.set(path, image); return image; }
 await Promise.all([...new Set([playerPath, mapPath, ...actors.flatMap(actor => [actor.neutralSprite, ...Object.values(actor.clips).map(clip => clip.atlas)].filter(Boolean))])].map(load));
 let selected = actors[0].id;
 const hash = new URLSearchParams(location.hash.slice(1)).get('actor'); if (actors.some(actor => actor.id === hash)) selected = hash;
 const state = { selected, action: 'idle', zoom: 1, ageMs: 0, startedAt: performance.now(), speed: 1, playing: false };
 const actor = () => actors.find(item => item.id === state.selected);
 const clip = () => actor().clips[state.action];
 function age(now = performance.now()) { if (!state.playing) return state.ageMs; const elapsed = state.ageMs + Math.max(0, now - state.startedAt) * state.speed; return clip().loop ? elapsed % clip().durationMs : Math.min(elapsed, clip().durationMs); }
 function frameAt(ms, item = clip()) { let cursor = 0; for (let i = 0; i < item.frames.length; i++) { cursor += item.frames[i].durationMs; if (ms < cursor || i === item.frames.length - 1) return i; } return item.frames.length - 1; }
 function frameStart(index, item = clip()) { return item.frames.slice(0, index).reduce((sum, frame) => sum + frame.durationMs, 0); }
 function setPlaying(value) { const ms = age(); state.ageMs = ms; state.startedAt = performance.now(); state.playing = value; if (value && ms >= clip().durationMs) state.ageMs = 0; $('play').textContent = value ? 'Dừng' : 'Phát'; $('play').setAttribute('aria-pressed', String(value)); draw(); }
 function seek(ms) { setPlaying(false); state.ageMs = Math.max(0, Math.min(clip().durationMs, ms)); draw(); }
 function crop(ctx, item, frame, x, y, zoom, shadow = false) {
  const px = Math.round(x - item.pivot[0] * zoom), py = Math.round(y - item.pivot[1] * zoom);
  if (shadow) { ctx.fillStyle = '#112b2255'; ctx.beginPath(); ctx.ellipse(x, y, 15 * zoom, 4 * zoom, 0, 0, Math.PI * 2); ctx.fill(); }
  const image = images.get(item.atlas);
  if ($('silhouette').checked) { const key = [item.atlas, frame.x, frame.y, frame.w, frame.h].join('|'); if (!silhouettes.has(key)) { const mask = document.createElement('canvas'); mask.width = frame.w; mask.height = frame.h; const m = mask.getContext('2d'); m.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h); m.globalCompositeOperation = 'source-in'; m.fillStyle = '#172b29'; m.fillRect(0, 0, frame.w, frame.h); silhouettes.set(key, mask); } ctx.drawImage(silhouettes.get(key), px, py, frame.w * zoom, frame.h * zoom); }
  else ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, px, py, frame.w * zoom, frame.h * zoom);
 }
 function marker(ctx, x, y, label) { if ($('roots').checked) { ctx.strokeStyle = '#c03939'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke(); } ctx.font = '15px Segoe UI'; ctx.textAlign = 'center'; const width = ctx.measureText(label).width; ctx.fillStyle = '#132922ee'; ctx.fillRect(x - width / 2 - 10, y + 16, width + 20, 29); ctx.fillStyle = '#f2e7cd'; ctx.fillText(label, x, y + 36); }
 function draw(now = performance.now()) {
  const item = clip(), ms = age(now), index = frameAt(ms, item), frame = item.frames[index], ctx = $('stage').getContext('2d'), zoom = state.zoom, scene = $('scene').value;
  ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 960, 600);
  if (scene === 'map') ctx.drawImage(images.get(mapPath), 1136 + (1 - 1 / zoom) * 480, 644 + (1 - 1 / zoom) * 300, 960 / zoom, 600 / zoom, 0, 0, 960, 600);
  else { ctx.fillStyle = scene === 'light' ? '#eee7d3' : '#203d34'; ctx.fillRect(0, 0, 960, 600); ctx.strokeStyle = scene === 'light' ? '#d0cbb7' : '#38594a'; for (let x = 0; x < 960; x += 32 * zoom) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); } for (let y = 0; y < 600; y += 32 * zoom) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); } }
  ctx.fillStyle = '#142c25eb'; ctx.fillRect(18, 17, 650, 62); ctx.fillStyle = '#ebdbb6'; ctx.font = '15px Segoe UI'; ctx.textAlign = 'left'; ctx.fillText(`${zoom}× · Đông Nam · ${actionNames[state.action]} · pose ${index + 1}/6`, 31, 42); ctx.font = '12px Segoe UI'; ctx.fillText('Vương Lâm live là chuẩn gốc. NPC phát đúng frame / hold trong catalog.', 31, 63);
  const player = images.get(playerPath), playerItem = { atlas: playerPath, pivot: [32, 88] };
  crop(ctx, playerItem, {x:0,y:0,w:player.width,h:player.height}, 270, 470, zoom, $('shadows').checked);
  crop(ctx, item, frame, 690, 470, zoom, $('shadows').checked);
  marker(ctx, 270, 470, 'Vương Lâm live · Pixel02'); marker(ctx, 690, 470, `${actor().name} · ${actionNames[state.action].split(' · ')[0]}`);
  $('seek').max = item.durationMs; $('seek').value = Math.round(ms); $('clock').value = `${Math.round(ms)} / ${Math.round(item.durationMs)} ms`; $('frame-info').textContent = `Pose ${index + 1} / 6 · hold ${Math.round(frame.durationMs)}ms · ${item.loop ? 'clip lặp' : 'clip giữ pose cuối'} · tốc độ ${state.speed}×`;
  for (const button of $('frames').querySelectorAll('[data-action]')) button.setAttribute('aria-pressed', String(button.dataset.action === state.action && Number(button.dataset.index) === index));
  document.body.dataset.frame = String(index); document.body.dataset.action = state.action; document.body.dataset.actor = state.selected;
  if (state.playing && !item.loop && ms >= item.durationMs) setPlaying(false);
 }
 function renderCards() {
  $('cards').innerHTML = actors.map(item => `<button class="actor-card" data-id="${esc(item.id)}" aria-pressed="${item.id === state.selected}"><canvas width="96" height="96" aria-label="Pose idle đầu của ${esc(item.name)}"></canvas><div class="caption"><strong>${esc(item.name)}</strong><small>${esc(item.brief.role)}</small><small>18 pose · Đông Nam</small></div></button>`).join('');
  for (const button of $('cards').querySelectorAll('button')) { const item = actors.find(item => item.id === button.dataset.id), c = button.querySelector('canvas'), ctx = c.getContext('2d'), first = item.clips.idle.frames[0]; ctx.imageSmoothingEnabled = false; ctx.drawImage(images.get(item.clips.idle.atlas), first.x, first.y, first.w, first.h, 0, 0, c.width, c.height); button.onclick = () => { choose(item.id); $('playback').scrollIntoView({block:'start'}); }; }
 }
 function contactSheet() {
  const item = actor(); $('frames').innerHTML = Object.keys(actionNames).flatMap(action => item.clips[action].frames.map((frame, index) => `<button class="pose" data-action="${action}" data-index="${index}" aria-pressed="false"><canvas width="192" height="192" aria-label="${esc(item.name)} ${action} pose ${index + 1}"></canvas><span>${action} ${index + 1} · ${Math.round(frame.durationMs)}ms</span></button>`)).join('');
  for (const button of $('frames').querySelectorAll('button')) { const action = button.dataset.action, index = Number(button.dataset.index), motion = item.clips[action], frame = motion.frames[index], ctx = button.querySelector('canvas').getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(images.get(motion.atlas), frame.x, frame.y, frame.w, frame.h, 0, 0, 192, 192); button.onclick = () => { changeAction(action); seek(frameStart(index)); }; }
 }
 function detail() { const item = actor(), n = item.brief; $('detail').innerHTML = `<h3>${esc(item.name)}</h3><div class="meta">${esc(n.role)} · ${esc(n.zone)}</div><div class="grid"><div><p><b>Nhận diện:</b> ${esc(n.look)}</p><p><b>Tính cách:</b> ${esc(n.personality)}</p><blockquote>${esc(n.quote)}</blockquote></div><div><p><b>Cử chỉ theo nghề:</b> ${esc(gestures[item.id])}</p><p><b>Vai trò trong chương:</b> ${esc(n.task)}</p><p><b>Brief nguồn:</b> ${esc(n.brief)}</p></div></div><p class="meta">Ba clip thật × sáu pose · Đông Nam. Canvas 96×96 chỉ padding; world foot (48,88), cỡ người lấy từ neutral của nguồn. Đối chiếu đầu, vai, thân và palette trực tiếp với Vương Lâm live qua cả đầu và cuối action.</p><div class="detail-links">${item.neutralSprite ? `<a href="${esc(item.neutralSprite)}">Neutral calibration</a>` : ''}<a href="catalog.json">Atlas / timeline</a><a href="registration.json">Mốc đo nguồn</a></div>`; }
 function qualityNote() {
  const notes = {'tran-duy':'Cần xem độ ổn định của mặt, tóc và vòng lặp ở cỡ thật.', 'diep-tinh':'Hàng cử chỉ nghề nghiệp thấp hơn idle khoảng 3 pixel ở cỡ thật; khuôn mặt lớn tuổi còn mềm. Đây là điểm cần chỉnh ở bước sản xuất.', 'ta-kiem-son':'Hàng cử chỉ nghề nghiệp thấp hơn idle khoảng 1–2 pixel. Kiếm gỗ cần kiểm thêm tính liên tục khi bị tay hoặc áo che trong clip nói chuyện.', 'to-nhuoc':'Hàng kiểm hộp thấp hơn idle khoảng 1–2 pixel. Bút khá nhỏ ở cỡ thật, hình hộp thay đổi nhẹ qua các pose.'};
  const paragraph = document.createElement('p'); paragraph.className = 'art-note'; paragraph.textContent = 'Điểm còn cần chỉnh: ' + notes[actor().slug]; $('detail').append(paragraph);
 }
 function choose(id) { setPlaying(false); state.selected = id; state.ageMs = 0; $('actor').value = id; history.replaceState(null, '', `#actor=${encodeURIComponent(id)}`); renderCards(); contactSheet(); detail(); qualityNote(); draw(); }
 function changeAction(action) { setPlaying(false); state.action = action; state.ageMs = 0; $('action').value = action; draw(); }
 $('actor').innerHTML = actors.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
 $('actor').onchange = () => choose($('actor').value); $('action').onchange = () => changeAction($('action').value);
 $('play').onclick = () => setPlaying(!state.playing); $('reset').onclick = () => seek(0); $('seek').oninput = () => seek(Number($('seek').value));
 $('previous').onclick = () => seek(frameStart(Math.max(0, frameAt(age()) - 1))); $('next').onclick = () => seek(frameStart(Math.min(5, frameAt(age()) + 1)));
 $('speed').onchange = () => { state.ageMs = age(); state.startedAt = performance.now(); state.speed = Number($('speed').value); draw(); };
 for (const button of document.querySelectorAll('[data-zoom]')) button.onclick = () => { state.zoom = Number(button.dataset.zoom); for (const other of document.querySelectorAll('[data-zoom]')) other.setAttribute('aria-pressed', String(other === button)); draw(); };
 for (const id of ['scene', 'roots', 'shadows', 'silhouette']) $(id).onchange = () => draw();
 document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); }); window.addEventListener('offline', () => setPlaying(false));
 window.__npcMotionReview = () => { const ms = age(), item = clip(), index = frameAt(ms, item); return {actor:state.selected, action:state.action, zoom:state.zoom, playing:state.playing, timeMs:ms, durationMs:item.durationMs, loop:item.loop, speed:state.speed, frameIndex:index, frameRect:item.frames[index], atlas:item.atlas}; };
 function tick(now) { if (state.playing) draw(now); requestAnimationFrame(tick); }
 choose(state.selected); $('status').hidden = true; document.body.dataset.ready = 'true'; requestAnimationFrame(tick);
} catch (error) { $('status').textContent = `Bản xem chưa sẵn sàng: ${error.message}`; document.body.dataset.ready = 'error'; console.error(error); }
