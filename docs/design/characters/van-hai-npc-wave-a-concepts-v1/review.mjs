const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = async path => {const response = await fetch(path); if (!response.ok) throw Error(`Chưa có ${path}`); return response.json();};
const expectedIds = ['NPC-HN-HERBALIST','NPC-HN-FORGE','NPC-HN-ROUTE-KEEPER','NPC-HN-GATE-WARDEN','NPC-HN-DISCIPLE-WATER','NPC-HN-DISCIPLE-SWORD'];
const mapPath = '../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';
const stagePositions = [270,690], stageFoot = 320, lineupFoot = 224;

try {
  const catalog = await json('./catalog.json');
  let neutralApproved = false;
  const approvalResponse = await fetch('./approval.json');
  if (approvalResponse.ok) {
    const approval = await approvalResponse.json(), bytes = await (await fetch('./catalog.json')).arrayBuffer();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');
    const ids = approval.scope?.actors?.map(actor=>actor.id) ?? [];
    neutralApproved = approval.ownerApproved === true && approval.artApproved === true && approval.motionApproved === false && approval.scope?.pose === 'neutral' && approval.scope?.clips === 0 && approval.scope?.poses === 6 && JSON.stringify(approval.scope?.directions) === '["southeast"]' && ids.length === 6 && expectedIds.every(id=>ids.includes(id)) && approval.pinnedFiles?.some(file=>file.file === 'catalog.json' && file.sha256 === hash);
    if (neutralApproved) {
      document.querySelector('.badges span:first-child').textContent = 'Owner đã duyệt sáu neutral Đông Nam';
      document.querySelector('.art-note').innerHTML = '<strong>Owner đã duyệt tạo hình neutral của sáu NPC.</strong> <a href="approval.json">Mốc duyệt theo hash</a>. Bộ chuyển động được sản xuất trong gói riêng, theo cùng nhận diện và chuẩn Vương Lâm live.';
    }
  }
  const actors = catalog.actors;
  if (!Array.isArray(actors) || actors.length !== 6 || new Set(actors.map(actor => actor.id)).size !== 6 || expectedIds.some(id => !actors.some(actor => actor.id === id))) throw Error('Cần đủ sáu hồ sơ NPC Wave A trong catalog.');
  if (catalog.coverage?.animationClips !== 0 || catalog.coverage?.neutralViews !== 6 || catalog.coverage?.actors !== 6) throw Error('Coverage phải ghi đúng sáu neutral và 0 clip chuyển động.');
  for (const actor of actors) {
    if (!actor.sprite || !actor.spriteSha256 || !actor.raw || !actor.prompt || !actor.brief || actor.direction !== 'southeast' || actor.bodyHeightPx !== 80 || JSON.stringify(actor.canvas) !== '[64,96]' || JSON.stringify(actor.pivot) !== '[32,88]') throw Error(`Hồ sơ ${actor.name ?? actor.id} chưa đủ neutral đã đăng ký.`);
  }
  const reference = catalog.primaryReference;
  if (!reference?.file || !reference.sha256) throw Error('Thiếu chuẩn Vương Lâm live đã pin hash.');
  const images = new Map();
  const load = async path => {
    if (images.has(path)) return images.get(path);
    const image = new Image(); image.src = path;
    await image.decode(); images.set(path,image); return image;
  };
  await Promise.all([reference.file,mapPath,...actors.map(actor => actor.sprite)].map(load));
  for (const path of [reference.file,...actors.map(actor => actor.sprite)]) {
    const image = images.get(path);
    if (image.naturalWidth !== 64 || image.naturalHeight !== 96) throw Error(`${path} cần frame native 64 × 96.`);
  }
  let selected = actors[0].id, zoom = 1;
  const hashActor = new URLSearchParams(location.hash.slice(1)).get('actor');
  if (actors.some(actor => actor.id === hashActor)) selected = hashActor;
  $('actor').innerHTML = actors.map(actor => `<option value="${esc(actor.id)}">${esc(actor.name)}</option>`).join('');
  $('actor').disabled = false;

  function sprite(ctx,path,pivot,x,y,label='') {
    const image = images.get(path), left = Math.round(x-pivot[0]*zoom), top = Math.round(y-pivot[1]*zoom);
    if ($('silhouette').checked) {
      const mask = document.createElement('canvas'); mask.width = image.naturalWidth; mask.height = image.naturalHeight;
      const ink = mask.getContext('2d'); ink.drawImage(image,0,0); ink.globalCompositeOperation = 'source-in'; ink.fillStyle = '#19352d'; ink.fillRect(0,0,mask.width,mask.height);
      ctx.drawImage(mask,left,top,image.naturalWidth*zoom,image.naturalHeight*zoom);
    } else ctx.drawImage(image,left,top,image.naturalWidth*zoom,image.naturalHeight*zoom);
    if ($('roots').checked) {
      ctx.strokeStyle = '#bd3838'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();
    }
    if (label) {
      ctx.font = '13px Segoe UI'; ctx.textAlign = 'center'; const width = ctx.measureText(label).width;
      ctx.fillStyle = '#142d25ee'; ctx.fillRect(x-width/2-8,y+18,width+16,25); ctx.fillStyle = '#efe4c9';ctx.fillText(label,x,y+35);
    }
  }
  function background(ctx,width,height) {
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0,0,width,height);
    const scene = $('scene').value;
    if (scene === 'map') {
      const center = [1616,990];
      ctx.drawImage(images.get(mapPath),center[0]-width/(2*zoom),center[1]-height/(2*zoom),width/zoom,height/zoom,0,0,width,height);
    } else {
      ctx.fillStyle = scene === 'light' ? '#eee7d3' : '#203b33'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle = scene === 'light' ? '#d1cbb7' : '#385647';
      for (let x=0;x<width;x+=32*zoom) {ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
      for (let y=0;y<height;y+=32*zoom) {ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    }
  }
  function cards() {
    $('cards').innerHTML = actors.map(actor => `<button class="actor-card" data-id="${esc(actor.id)}" aria-pressed="${actor.id===selected}"><div class="sprite-stage"><canvas class="pair" width="288" height="192" aria-label="Vương Lâm và ${esc(actor.name)}, Đông Nam 2×"></canvas><div class="pair-labels"><span>Vương Lâm live</span><span>${esc(actor.name)}</span></div></div><div class="caption"><strong>${esc(actor.name)}</strong><small>${esc(actor.role ?? actor.brief.role)}</small><small>${esc(actor.zone ?? actor.brief.zone)}</small><small>Neutral Đông Nam · 80px · 2×</small></div></button>`).join('');
    for (const button of $('cards').querySelectorAll('.actor-card')) {
      const actor = actors.find(actor => actor.id === button.dataset.id), ctx = button.querySelector('canvas').getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(images.get(reference.file),12,0,128,192); ctx.drawImage(images.get(actor.sprite),148,0,128,192);
      button.onclick = () => {choose(actor.id);$('scale-review').scrollIntoView({block:'start'});};
    }
  }
  function detail() {
    const actor = actors.find(actor => actor.id === selected), brief = actor.brief;
    const limits = Array.isArray(actor.visualLimitations) ? actor.visualLimitations : actor.visualLimitations ? [actor.visualLimitations] : [];
    const metadata = actor.routerMetadata ?? actor.metadata ?? actor.raw.replace(/\.png$/i,'.json');
    const inputLinks = (actor.inputs ?? []).map((input,index) => typeof input === 'string' ? {file:input,label:`Input ${index+1}`} : {file:input.file ?? input.path,label:input.role ?? `Input ${index+1}`}).filter(input => input.file);
    const links = [{file:actor.raw,label:'Nguồn nguyên bản'},{file:actor.sprite,label:'Frame native'},{file:actor.prompt,label:'Prompt'},{file:metadata,label:'Metadata router'},{file:reference.file,label:'Chuẩn native · Vương Lâm live'},...inputLinks];
    $('detail').innerHTML = `<h3>${esc(actor.name)}</h3><div class="meta">${esc(actor.role ?? brief.role)} · ${esc(actor.zone ?? brief.zone)} · Wave ${esc(brief.wave ?? 'A')}</div><div class="grid"><div><p><b>Tuổi, phục trang và nhận diện trong GDD:</b> ${esc(brief.look)}</p><p><b>Tính cách:</b> ${esc(brief.personality)}</p><blockquote>${esc(brief.quote)}</blockquote><p><b>Câu chuyện:</b> ${esc(brief.sideStory ?? brief.origin)}</p></div><div><p><b>Vai trò:</b> ${esc(brief.task)}</p><p><b>Phản ứng khi gặp người chơi:</b> ${esc(brief.react)}</p>${brief.ambientLoop ? `<p><b>Sinh hoạt dự kiến:</b> ${esc(brief.ambientLoop.join(' → '))}. ${esc(brief.loopScope)}</p>` : ''}<p><b>Brief dáng và cử chỉ:</b> ${esc(brief.brief)}</p><p><b>Chuyển động tiếp nối theo GDD:</b> ${esc((brief.animation?.minimum ?? ['idle','talk']).join(' / '))} × ${esc(brief.animation?.directions ?? 8)} hướng. ${esc(brief.animation?.secondary)}</p></div></div>${limits.length ? `<div class="limitations"><b>Điểm cần xem kỹ ở native:</b><ul>${limits.map(note=>`<li>${esc(note)}</li>`).join('')}</ul></div>` : ''}<p class="meta">Canvas ${actor.canvas.join(' × ')} · chân (${actor.pivot.join(', ')}) · người ${actor.bodyHeightPx}px · neutral Đông Nam. Vương Lâm live là chuẩn tỷ lệ, anatomy, nét pixel và đổ màu.</p><p class="meta">Frame native SHA-256: <span class="hash">${esc(actor.spriteSha256)}</span></p><div class="detail-links">${links.map(link=>`<a href="${esc(link.file)}" target="_blank" rel="noopener">${esc(link.label)}</a>`).join('')}</div>`;
  }
  function draw() {
    const actor = actors.find(actor => actor.id === selected), ctx = $('stage').getContext('2d');
    background(ctx,960,420);
    ctx.fillStyle = '#173024ec';ctx.fillRect(18,17,620,59);ctx.textAlign = 'left';ctx.fillStyle = '#ebdab3';ctx.font = '15px Segoe UI';ctx.fillText(`Camera ${zoom}× · neutral Đông Nam · cùng điểm chân`,31,41);ctx.font = '12px Segoe UI';ctx.fillText('So trực tiếp đầu, vai, thân, palette và độ rõ đạo cụ.',31,62);
    sprite(ctx,reference.file,[32,88],stagePositions[0],stageFoot,'Vương Lâm live · Pixel02');sprite(ctx,actor.sprite,actor.pivot,stagePositions[1],stageFoot,`${actor.name} · 80px`);
    const group = $('lineup').getContext('2d');background(group,1008,280);
    [{name:'Vương Lâm',sprite:reference.file,pivot:[32,88]},...actors].forEach((item,index) => sprite(group,item.sprite,item.pivot,84+140*index,lineupFoot,item.name));
  }
  function choose(id) {
    if (!actors.some(actor => actor.id === id)) return;
    selected = id;$('actor').value = id;history.replaceState(null,'',`#actor=${encodeURIComponent(id)}`);cards();detail();draw();
  }
  for (const button of document.querySelectorAll('[data-zoom]')) button.onclick = () => {zoom = Number(button.dataset.zoom);for (const other of document.querySelectorAll('[data-zoom]')) other.setAttribute('aria-pressed',String(other===button));draw();};
  $('actor').onchange = () => choose($('actor').value);
  for (const id of ['scene','roots','silhouette']) $(id).onchange = draw;
  $('coverage-counts').innerHTML = `<span>${actors.length} NPC</span><span>${catalog.coverage.neutralViews} neutral Đông Nam</span><span>${catalog.coverage.animationClips} clip chuyển động</span><span>${neutralApproved ? 'Đã duyệt neutral Đông Nam' : 'Tạo hình chờ đánh giá'}</span><span>${catalog.runtimeImported ? 'Đã tích hợp' : 'Chưa tích hợp game'}</span>`;
  window.__npcNeutralReview = () => ({actor:selected,zoom,scene:$('scene').value,roots:$('roots').checked,silhouette:$('silhouette').checked,direction:'southeast',referencePath:reference.file,referenceHash:reference.sha256,positions:stagePositions.map(x=>[x,stageFoot]),canvas:[64,96],pivot:[32,88],lineupPositions:Array.from({length:7},(_,index)=>[84+140*index,lineupFoot]),neutralViews:catalog.coverage.neutralViews,animationClips:catalog.coverage.animationClips,artApproved:catalog.artApproved,runtimeImported:catalog.runtimeImported});
  choose(selected);$('status').hidden = true;document.body.dataset.neutralApproved = String(neutralApproved);document.body.dataset.ready = 'true';
} catch (error) {
  $('status').textContent = `Bản xem chưa sẵn sàng: ${error.message}`;document.body.dataset.ready = 'error';console.error(error);
}
