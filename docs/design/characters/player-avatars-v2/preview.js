(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const directions = ['south','west','east','north'];
  const directionNames = { south: 'Xuống', west: 'Trái', east: 'Phải', north: 'Lên' };
  const configs = [
    { id: 'wanglin', label: 'Vương Lâm · NPC', data: window.WangLinAtlasData, atlasPath: '../wang-lin-gray-walk-v1/native-v2/atlas.png', x: 350, y: 365 },
    { id: 'male', label: 'Đệ tử nam', data: window.AvatarMaleAtlasData, atlasPath: 'male/native-v2/atlas.png', x: 475, y: 385 },
    { id: 'female', label: 'Đệ tử nữ', data: window.AvatarFemaleAtlasData, atlasPath: 'female/native-v2/atlas.png', x: 610, y: 365 }
  ];
  const query = new URLSearchParams(location.search);
  const state = {
    ready: false, direction: directions.includes(query.get('direction')) ? query.get('direction') : 'south',
    motion: query.get('motion') === 'stand' ? 'stand' : 'walk',
    frame: Math.max(0,Math.min(5,Number(query.get('frame')) || 0)),
    fps: [6,8,10].includes(Number(query.get('fps'))) ? Number(query.get('fps')) : 8,
    scale: [1,2,4,8].includes(Number(query.get('scale'))) ? Number(query.get('scale')) : 4,
    playing: query.get('paused') !== '1' && !matchMedia('(prefers-reduced-motion: reduce)').matches,
    elapsed: 0, active: 'male', drive: null
  };

  let lastTime = null;
  const heldKeys = new Set();
  const keyDirections = { w: 'north', arrowup: 'north', a: 'west', arrowleft: 'west', s: 'south', arrowdown: 'south', d: 'east', arrowright: 'east' };
  const mapCanvas = $('map-canvas');
  const mapContext = mapCanvas.getContext('2d');
  const actors = configs.map(c => ({ ...c, direction: 'south', moving: false, walkFrame: 0, elapsed: 0 }));

  function imageAt(path) {
    return new Promise((resolve,reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Không nạp được ' + path));
      image.src = path;
    });
  }
  function drawFrame(context, config, direction, motion, frame, x = 0, y = 0) {
    const names = config.data.animations[motion + '_' + direction];
    const definition = config.data.frames[names[motion === 'stand' ? 0 : frame % names.length]].frame;
    context.imageSmoothingEnabled = false;
    context.drawImage(config.image,definition.x,definition.y,definition.w,definition.h,x,y,64,96);
  }
  function syncControls() {
    document.querySelectorAll('[data-direction]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.direction === state.direction)));
    document.querySelectorAll('[data-motion]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.motion === state.motion)));
    $('play').textContent = state.playing ? 'Tạm dừng' : 'Chạy';
    $('fps').value = String(state.fps); $('scale').value = String(state.scale);
    $('frame').value = String(state.frame); $('frame').disabled = state.motion === 'stand';
    $('prev-frame').disabled = state.motion === 'stand'; $('next-frame').disabled = state.motion === 'stand';
    $('frame-value').textContent = state.motion === 'stand' ? 'Đứng · 1 frame' : state.frame + ' / 5';
    Object.assign(document.documentElement.dataset,{ direction: state.direction, motion: state.motion, frame: String(state.frame), playing: String(state.playing), activeAvatar: state.active });
  }
  function drawComparison() {
    if (!state.ready) return;
    for (const config of configs) {
      const canvas = $('sprite-' + config.id), context = canvas.getContext('2d');
      canvas.style.width = 64 * state.scale + 'px'; canvas.style.height = 96 * state.scale + 'px';
      context.clearRect(0,0,64,96);
      drawFrame(context,config,state.direction,state.motion,state.frame);
      if ($('grid').checked) {
        context.strokeStyle = 'rgba(107,104,88,.35)'; context.lineWidth = .25;
        context.beginPath();
        for(let x=0;x<=64;x+=8){context.moveTo(x,0);context.lineTo(x,96);}
        for(let y=0;y<=96;y+=8){context.moveTo(0,y);context.lineTo(64,y);}
        context.stroke();
      }
      if ($('anchor').checked) {
        context.fillStyle = '#ab4b38'; context.fillRect(29,88,7,1); context.fillRect(32,85,1,7);
      }
    }
    $('comparison').classList.toggle('dark',$('backdrop').value === 'dark');
    $('frame-status').textContent = directionNames[state.direction] + ' · ' + (state.motion === 'stand' ? 'Đứng' : 'Đi ' + state.frame + '/5') + ' · ' + state.scale + '× · Điểm chân (32, 88). Hai mẫu còn chờ đánh giá tạo hình và chuyển động.';
    syncControls();
  }
  function currentDrive() {
    if (state.drive) return state.drive;
    const keys = Array.from(heldKeys);
    return keys.length ? keyDirections[keys[keys.length - 1]] : null;
  }
  function stopDrive() {
    heldKeys.clear(); state.drive = null;
    actors.forEach(actor => { actor.moving = false; actor.elapsed = 0; });
  }
  function updateActors(seconds) {
    const direction = currentDrive();
    for (const actor of actors) {
      const wasMoving = actor.moving;
      actor.moving = actor.id === state.active && Boolean(direction);
      if (actor.moving) {
        if (!wasMoving || actor.direction !== direction) { actor.walkFrame = 0; actor.elapsed = 0; }
        actor.direction = direction;
        const distance = 64 * seconds;
        if(direction === 'north') actor.y -= distance;
        if(direction === 'south') actor.y += distance;
        if(direction === 'west') actor.x -= distance;
        if(direction === 'east') actor.x += distance;
        actor.x = Math.max(50,Math.min(910,actor.x)); actor.y = Math.max(130,Math.min(605,actor.y));
        actor.elapsed += seconds;
        while(actor.elapsed >= 1 / state.fps) { actor.walkFrame = (actor.walkFrame + 1) % 6; actor.elapsed -= 1 / state.fps; }
      } else { actor.walkFrame = 0; actor.elapsed = 0; }
    }
  }
  function drawMap() {
    if (!state.ready) return;
    mapContext.clearRect(0,0,960,640);
    mapContext.imageSmoothingEnabled = true;
    mapContext.fillStyle='#eee5d3';mapContext.fillRect(0,0,960,640);
    const labels = $('labels').checked;
    for (const actor of actors.slice().sort((a,b) => a.y - b.y)) {
      mapContext.fillStyle = 'rgba(25,25,20,.22)';
      mapContext.beginPath(); mapContext.ellipse(actor.x,actor.y+1,17,5,0,0,Math.PI*2); mapContext.fill();
      if(labels && actor.id === state.active) {
        mapContext.strokeStyle = '#245c53'; mapContext.lineWidth = 2;
        mapContext.beginPath(); mapContext.ellipse(actor.x,actor.y+1,22,7,0,0,Math.PI*2); mapContext.stroke();
      }
      drawFrame(mapContext,actor,actor.direction,actor.moving ? 'walk' : 'stand',actor.walkFrame,Math.round(actor.x)-32,Math.round(actor.y)-88);
      if(labels) {
        const text = actor.label + (actor.id === state.active ? ' · Bạn' : '');
        mapContext.font = "14px 'Segoe UI',Arial,sans-serif"; mapContext.textAlign = 'center'; mapContext.textBaseline = 'middle';
        const width = mapContext.measureText(text).width + 14, textY = actor.y - 101;
        mapContext.fillStyle = 'rgba(251,247,238,.94)'; mapContext.fillRect(actor.x-width/2,textY-12,width,24);
        mapContext.fillStyle = '#252722'; mapContext.fillText(text,actor.x,textY);
      }
    }
    const active = actors.find(actor => actor.id === state.active);
    $('map-status').textContent = active.label + ' · ' + (active.moving ? 'Đang đi' : 'Đứng') + ' · ' + directionNames[active.direction] + ' · Cỡ sprite 1×.';
    Object.assign($('map-status').dataset,{ x: active.x.toFixed(2), y: active.y.toFixed(2), direction: active.direction, moving: String(active.moving) });
  }
  function frameAt(time) {
    if(!state.ready) return;
    const seconds = lastTime === null ? 0 : Math.min(.1,Math.max(0,(time-lastTime)/1000)); lastTime = time;
    if(state.playing && state.motion === 'walk') {
      state.elapsed += seconds;
      while(state.elapsed >= 1/state.fps) { state.frame = (state.frame+1)%6; state.elapsed -= 1/state.fps; }
    }
    updateActors(seconds); drawComparison(); drawMap(); requestAnimationFrame(frameAt);
  }
  function moveFrame(change) { state.playing = false; state.frame = (state.frame + change + 6) % 6; state.elapsed = 0; drawComparison(); }
  document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click',() => { state.direction = button.dataset.direction; state.frame = 0; state.elapsed = 0; drawComparison(); }));
  document.querySelectorAll('[data-motion]').forEach(button => button.addEventListener('click',() => { state.motion = button.dataset.motion; state.frame = 0; state.elapsed = 0; drawComparison(); }));
  $('play').addEventListener('click',() => { state.playing = !state.playing; state.elapsed = 0; drawComparison(); });
  $('prev-frame').addEventListener('click',() => moveFrame(-1)); $('next-frame').addEventListener('click',() => moveFrame(1));
  $('frame').addEventListener('input',() => { state.playing = false; state.frame = Number($('frame').value); state.elapsed = 0; drawComparison(); });
  $('fps').addEventListener('change',() => { state.fps = Number($('fps').value); state.elapsed = 0; });
  $('scale').addEventListener('change',() => { state.scale = Number($('scale').value); drawComparison(); });
  ['backdrop','grid','anchor'].forEach(id => $(id).addEventListener('change',drawComparison));
  $('active-avatar').addEventListener('change',() => { stopDrive(); state.active = $('active-avatar').value; syncControls(); drawMap(); });
  $('labels').addEventListener('change',drawMap);
  $('reset-map').addEventListener('click',() => { stopDrive(); actors.forEach((actor,i) => { actor.x = configs[i].x; actor.y = configs[i].y; actor.direction = 'south'; actor.walkFrame = 0; }); drawMap(); });
  mapCanvas.addEventListener('keydown',event => { const key = event.key.toLowerCase(); if(keyDirections[key]) { event.preventDefault(); heldKeys.add(key); } });
  window.addEventListener('keyup',event => heldKeys.delete(event.key.toLowerCase()));
  mapCanvas.addEventListener('blur',stopDrive); window.addEventListener('blur',stopDrive);
  document.addEventListener('visibilitychange',() => { lastTime = null; if(document.hidden)stopDrive(); });
  document.querySelectorAll('[data-drive]').forEach(button => {
    button.addEventListener('pointerdown',event => { event.preventDefault(); button.setPointerCapture(event.pointerId); state.drive = button.dataset.drive; });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name => button.addEventListener(name,() => { state.drive = null; }));
  });
  async function start() {
    try {
      configs.forEach(config => {
        if(!config.data || Object.keys(config.data.frames).length !== 28 || config.data.frameSizePx.join(',') !== '64,96') throw new Error('Metadata chưa đủ 28 frame: ' + config.id);
        directions.forEach(direction => { if(config.data.animations['walk_'+direction].length !== 6 || config.data.animations['stand_'+direction].length !== 1) throw new Error('Thiếu hướng ' + direction); });
      });
      const images = await Promise.all(configs.map(config => imageAt(config.atlasPath)));
      configs.forEach((config,index) => { config.image = images[index]; actors[index].image = images[index]; });

      state.ready = true; document.documentElement.dataset.ready = 'true';
      $('asset-status').textContent = 'Đã nạp 56 frame đệ tử và 28 frame Vương Lâm để so sánh. Hai mẫu dùng chung palette 24 mục, thêm xanh trầm cho đai.';
      drawComparison(); drawMap(); requestAnimationFrame(frameAt);
    } catch(error) { $('asset-status').textContent = error.message; document.documentElement.dataset.ready = 'error'; }
  }
  syncControls(); start();
})();
