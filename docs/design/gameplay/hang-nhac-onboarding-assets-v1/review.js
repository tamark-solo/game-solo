'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const state = { background: 'light', position: 'front', scale: 1, selected: 0, manifest: undefined, assets: [], actor: undefined, map: undefined };
  const positions = { front: 'trước', back: 'sau', left: 'bên trái', right: 'bên phải' };
  const descriptions = {
    'hn-quest-sample': 'Mẫu được niêm · HN04 / HN06 / HN09',
    'hn-qi-guide-stone': 'Phiến dẫn khí thấp · sân bài / ngoại vi',
    'hn-sample-comparator': 'Bệ nhận và đối chứng · hai điều kiện thử',
  };
  const reuse = [
    ['hn-refining-material', 'Nguyên liệu nhập môn'], ['hn-training-jade-raw', 'Phôi ngọc'],
    ['hn-training-jade-refined', 'Ngọc hộ thân'], ['vh-clean-herb', 'Dược thảo'],
    ['vh-clear-water', 'Linh tuyền'], ['vh-soft-fiber', 'Sợi vân bố'],
    ['vh-conductive-sand', 'Cát dẫn khí'], ['vh-stable-jade', 'Ngọc thô'],
    ['vh-guiding-ink', 'Mực dẫn khí'], ['vh-sealed-case', 'Hộp giữ khí'], ['vh-flow-compass', 'Định Lưu Bàn'],
  ];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function localPath(path) {
    if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\') || /^[a-z][a-z\d+.-]*:/i.test(path)) throw new Error('Manifest có đường dẫn ảnh không hợp lệ.');
    const url = new URL(path, new URL('./', location.href));
    const base = new URL('./', location.href);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Ảnh trong manifest phải nằm trong gói bàn giao.');
    return url.href;
  }
  async function loadImage(path) {
    const image = new Image();
    image.src = localPath(path);
    await image.decode();
    return image;
  }
  const dimension = value => Number.isInteger(value) && value > 0 && value <= 4096;
  const hasMeasuredPivot = native => native.pivotVerified === true && native.pivot;
  const pivotLabel = native => hasMeasuredPivot(native) ? `(${native.pivot.x}, ${native.pivot.y})` : 'Chưa đo';
  function validateNative(native, name, requirePivot = true) {
    if (!native || !dimension(native.width) || !dimension(native.height)) throw new Error(`Thiếu kích thước: ${name}.`);
    if (!native.pivot && !requirePivot) return;
    if (!native.pivot ||
      !Number.isFinite(native.pivot.x) || !Number.isFinite(native.pivot.y) ||
      native.pivot.x < 0 || native.pivot.x > native.width || native.pivot.y < 0 || native.pivot.y > native.height) throw new Error(`Thiếu kích thước hoặc chân đo: ${name}.`);
  }
  function nativeSample(asset, scale) {
    const figure = element('figure', 'native-sample');
    const image = element('img');
    image.src = localPath(asset.native.path);
    image.width = asset.native.width * scale;
    image.height = asset.native.height * scale;
    image.alt = `${asset.label}, ${scale}×`;
    figure.append(image, element('figcaption', '', `${scale}× · ${asset.native.width * scale} × ${asset.native.height * scale} px`));
    return figure;
  }
  function showAsset(index) {
    state.selected = index;
    $('#asset-select').value = String(index);
    const asset = state.assets[index];
    const facts = $('#asset-facts');
    facts.replaceChildren();
    for (const [label, value] of [['Canvas gốc', `${asset.native.width} × ${asset.native.height}`], ['Chân đo', pivotLabel(asset.native)], ['Nhân vật', '64 × 96 · 1×'], ['Trạng thái', asset.artApproved ? 'Hình đã chấp nhận · chưa đặt map' : 'Chờ duyệt hình']]) facts.append(element('dt', '', label), element('dd', '', value));
    render();
  }
  function buildCards() {
    state.assets.forEach((asset, index) => {
      const card = element('article', 'asset-card');
      card.dataset.asset = asset.id;
      const heading = element('header');
      heading.append(element('span', 'asset-number', `0${index + 1} / ĐẠO CỤ`), element('h3', '', asset.label), element('p', 'asset-use', descriptions[asset.id] ?? 'Đạo cụ nhập môn · bản xem native'));
      const scroll = element('div', 'native-scroll');
      scroll.dataset.background = state.background;
      scroll.tabIndex = 0;
      scroll.setAttribute('aria-label', `${asset.label}: so native 1× và 2×`);
      const pair = element('div', 'native-pair');
      pair.append(nativeSample(asset, 1), nativeSample(asset, 2));
      scroll.append(pair);
      const meta = element('div', 'asset-meta');
      meta.append(element('code', '', asset.id), element('span', '', `Chân ${pivotLabel(asset.native)}`));
      const bottom = element('div', 'asset-bottom');
      if (asset.icons?.length) {
        bottom.append(element('p', '', 'ICON GỐC · MỞ TỪNG PNG ĐỂ KIỂM'));
        const icons = element('div', 'icon-list');
        icons.dataset.background = state.background;
        for (const icon of asset.icons) {
          const link = element('a'); link.href = localPath(icon.path);
          const image = element('img'); image.src = link.href; image.width = icon.width; image.height = icon.height; image.alt = `${asset.label} ${icon.width} px`;
          link.append(image, element('span', '', `${icon.width} px`)); icons.append(link);
        }
        bottom.append(icons);
      } else bottom.append(element('p', '', 'NGUỒN VẬT THỂ · ALPHA RỜI'));
      const actions = element('div', 'asset-actions');
      const choose = element('button', '', 'Ghép cùng nhân vật'); choose.type = 'button';
      choose.addEventListener('click', () => { showAsset(index); $('#compose').scrollIntoView(); });
      const nativeLink = element('a', '', 'PNG native ↗'); nativeLink.href = localPath(asset.native.path);
      actions.append(choose, nativeLink);
      if (asset.reviewImage) { const reviewLink = element('a', '', 'Bảng kiểm ↗'); reviewLink.href = localPath(asset.reviewImage); actions.append(reviewLink); }
      bottom.append(actions); card.append(heading, scroll, meta, bottom); $('#asset-grid').append(card);
      const option = element('option', '', asset.label); option.value = String(index); $('#asset-select').append(option);
    });
  }
  function renderReuse() {
    for (const [id, label] of reuse) {
      const link = element('a', 'reuse-icon'); link.href = `../van-ngoc-gameplay-assets-v1/native/${id}-64.png`;
      const image = element('img'); image.src = `../van-ngoc-gameplay-assets-v1/native/${id}-48.png`; image.width = 48; image.height = 48; image.alt = '';
      link.append(image, element('span', '', label)); $('#reuse-icons').append(link);
    }
  }
  function drawBackground(ctx, width, height) {
    if ($('#map-background').checked && state.map) {
      const image = state.map;
      // Crop at 1:1; never stretch the environment to fit the review canvas.
      const x = Math.floor((width - image.width) / 2), y = Math.floor((height - image.height) / 2);
      ctx.fillStyle = '#ddd5bf'; ctx.fillRect(0, 0, width, height); ctx.drawImage(image, x, y);
      return;
    }
    ctx.fillStyle = state.background === 'dark' ? '#112e32' : '#eee7d3'; ctx.fillRect(0, 0, width, height);
    if (state.background === 'checker') {
      ctx.fillStyle = '#c4cbba';
      for (let y = 0; y < height; y += 16) for (let x = 0; x < width; x += 16) if ((x / 16 + y / 16) % 2 === 0) ctx.fillRect(x, y, 16, 16);
    }
  }
  function marker(ctx, x, y, color, label) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 5, y + .5); ctx.lineTo(x + 6, y + .5); ctx.moveTo(x + .5, y - 5); ctx.lineTo(x + .5, y + 6); ctx.stroke();
    ctx.font = '10px "Segoe UI",sans-serif'; ctx.textAlign = 'center';
    const width = ctx.measureText(label).width + 12;
    ctx.fillStyle = '#0b211be8'; ctx.fillRect(Math.round(x - width / 2), y + 10, Math.ceil(width), 17);
    ctx.fillStyle = color; ctx.fillText(label, x, y + 22); ctx.restore();
  }
  function render() {
    const asset = state.assets[state.selected]; if (!asset || !state.actor) return;
    const canvas = $('#scene'), width = 560, height = 320;
    canvas.width = width * state.scale; canvas.height = height * state.scale;
    canvas.style.width = `${canvas.width}px`; canvas.style.height = `${canvas.height}px`;
    const scroll = $('#scene-scroll');
    scroll.scrollLeft = Math.max(0, (canvas.width - scroll.clientWidth) / 2);
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.scale(state.scale, state.scale);
    drawBackground(ctx, width, height);
    if (!hasMeasuredPivot(asset.native)) {
      canvas.setAttribute('aria-label', `${asset.label}: chưa đo điểm chân`);
      $('#canvas-caption').textContent = `${asset.label} · Chưa đo điểm chân`;
      $('#scene-description').textContent = 'Chưa có điểm chân được đo trên PNG native. Ghép cùng nhân vật sẽ mở khi hồ sơ đo được bổ sung.';
      return;
    }
    const foot = { x: width / 2, y: 212 };
    const sideDistance = Math.max(asset.native.pivot.x, asset.native.width - asset.native.pivot.x) + 24;
    const offsets = { front: [0, 31], back: [0, -25], left: [-sideDistance, 4], right: [sideDistance, 4] };
    const [dx, dy] = offsets[state.position], actorFoot = { x: foot.x + dx, y: foot.y + dy };
    const actor = state.manifest.actor;
    const propDraw = () => ctx.drawImage(asset.image, Math.round(foot.x - asset.native.pivot.x), Math.round(foot.y - asset.native.pivot.y));
    const actorDraw = () => ctx.drawImage(state.actor, Math.round(actorFoot.x - actor.pivot.x), Math.round(actorFoot.y - actor.pivot.y));
    if (actorFoot.y < foot.y) { actorDraw(); propDraw(); } else { propDraw(); actorDraw(); }
    if ($('#show-pivots').checked) {
      ctx.save(); ctx.strokeStyle = '#287e9c99'; ctx.setLineDash([3, 3]);
      ctx.strokeRect(foot.x - asset.native.pivot.x + .5, foot.y - asset.native.pivot.y + .5, asset.native.width, asset.native.height);
      ctx.strokeStyle = '#365a3388'; ctx.strokeRect(actorFoot.x - actor.pivot.x + .5, actorFoot.y - actor.pivot.y + .5, actor.width, actor.height); ctx.restore();
      marker(ctx, foot.x, foot.y, '#7ad9e6', 'chân vật'); marker(ctx, actorFoot.x, actorFoot.y, '#f3dc96', 'chân người');
    }
    canvas.setAttribute('aria-label', `${asset.label}, nhân vật ở ${positions[state.position]}, tỷ lệ ${state.scale}×`);
    $('#canvas-caption').textContent = `${asset.label} · ${state.scale}×`;
    $('#scene-description').textContent = `Nhân vật ở ${positions[state.position]} vật · ${actorFoot.y < foot.y ? 'người được vẽ trước vật' : 'vật được vẽ trước người'}. Dấu cộng chỉ điểm chân; khung nét đứt chỉ canvas, không phải vùng chặn.`;
  }
  function bindControls() {
    const bindGroup = (selector, key, convert = value => value) => document.querySelectorAll(selector).forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      state[key] = convert(button.dataset[key]);
      if (key === 'background') document.querySelectorAll('.native-scroll,.icon-list').forEach(node => { node.dataset.background = state.background; });
      render();
    }));
    bindGroup('button[data-background]', 'background'); bindGroup('button[data-position]', 'position'); bindGroup('button[data-scale]', 'scale', Number);
    $('#asset-select').addEventListener('change', event => showAsset(Number(event.target.value)));
    for (const id of ['map-background', 'show-pivots']) $(`#${id}`).addEventListener('input', render);
    window.addEventListener('resize', render);
  }
  async function init() {
    renderReuse();
    const response = await fetch('./assets.json');
    if (!response.ok) throw new Error(`Chưa đọc được assets.json (${response.status}).`);
    const manifest = await response.json();
    if (!Array.isArray(manifest.assets) || manifest.assets.length !== 3) throw new Error('Bộ đối chiếu cần đúng ba đạo cụ.');
    validateNative(manifest.actor, 'nhân vật');
    if (manifest.actor.width !== 64 || manifest.actor.height !== 96 || manifest.actor.pivot.x !== 32 || manifest.actor.pivot.y !== 88) throw new Error('Nhân vật đối chiếu phải giữ 64 × 96 / chân (32,88).');
    state.manifest = manifest;
    state.assets = await Promise.all(manifest.assets.map(async asset => {
      validateNative(asset.native, asset.id, false);
      const image = await loadImage(asset.native.path);
      if (image.width !== asset.native.width || image.height !== asset.native.height) throw new Error(`PNG khác kích thước manifest: ${asset.id}.`);
      for (const icon of asset.icons ?? []) if (!dimension(icon.width) || !dimension(icon.height)) throw new Error(`Kích thước icon không hợp lệ: ${asset.id}.`);
      return { ...asset, image };
    }));
    state.actor = await loadImage(manifest.actor.path);
    if (state.actor.width !== 64 || state.actor.height !== 96) throw new Error('PNG nhân vật khác khung 64 × 96.');
    if (manifest.mapCrop) state.map = await loadImage(manifest.mapCrop);
    else { $('#map-background').checked = false; $('#map-background').disabled = true; }
    buildCards(); bindControls(); showAsset(0); $('#asset-select').disabled = false;
    $('#load-status').hidden = true; document.body.dataset.ready = 'true';
  }
  init().catch(error => {
    const message = $('#load-status'); message.hidden = false; message.classList.add('error');
    message.textContent = `Chưa mở được bản đối chiếu: ${error.message} Mở thư mục qua máy chủ tệp tĩnh để đọc manifest.`;
    document.body.dataset.ready = 'error';
  });
})();
