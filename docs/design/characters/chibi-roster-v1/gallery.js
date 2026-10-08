(() => {
  const data = window.ChibiRosterGallery;
  if (!data?.actors?.length) throw new Error('Thiếu dữ liệu thư viện chibi.');
  const el = id => document.getElementById(id);
  const cards = el('cards');
  let direction = 'south', state = 'walk', paused = false, frame = 0, clock = 0, last = performance.now();
  const views = data.actors.map(actor => {
    const card = document.createElement('article'); card.className = 'card'; card.dataset.actorId = actor.id;
    const title = document.createElement('h2'); title.textContent = actor.name;
    const caption = document.createElement('p'); caption.className = 'caption';
    const viewport = document.createElement('div'); viewport.className = 'viewport';
    const sprite = document.createElement('div'); sprite.className = 'sprite'; sprite.setAttribute('role', 'img');
    sprite.style.backgroundImage = `url("${actor.atlasUrl}")`;
    sprite.style.backgroundSize = `${actor.width}px ${actor.height}px`;
    const ground = document.createElement('div'); ground.className = 'ground'; viewport.append(sprite, ground);
    const readout = document.createElement('p'); readout.className = 'frame';
    card.append(title, caption, viewport, readout); cards.append(card);
    return { actor, sprite, caption, readout, frameId: '' };
  });
  function render() {
    for (const view of views) {
      const ids = view.actor.animations[`${state}_${direction}`];
      const id = ids[frame % ids.length], rect = view.actor.frames[id];
      view.frameId = id;
      view.sprite.style.backgroundPosition = `${-rect.x}px ${-rect.y}px`;
      view.sprite.setAttribute('aria-label', `${view.actor.name} · ${direction} · ${frame % ids.length + 1}/${ids.length}`);
      view.caption.textContent = state === 'stand' ? (view.actor.movementKind === 'glide' ? 'Đứng lơ lửng' : 'Đứng') : (view.actor.movementKind === 'glide' ? 'Lướt' : 'Đi bộ');
      view.readout.textContent = `Frame ${frame % ids.length + 1}/${ids.length} · 64 × 96`;
    }
    el('previous').disabled = el('next').disabled = !paused || state === 'stand';
  }
  document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => {
    direction = button.dataset.direction;
    document.querySelectorAll('[data-direction]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }));
  el('pause').onclick = () => { paused = !paused; el('pause').textContent = paused ? 'Phát' : 'Tạm dừng'; render(); };
  el('previous').onclick = () => { frame = (frame + 3) % 4; clock = 0; render(); };
  el('next').onclick = () => { frame = (frame + 1) % 4; clock = 0; render(); };
  el('motion').onchange = event => { state = event.target.value; frame = 0; clock = 0; render(); };
  el('fps').oninput = event => { clock = 0; el('fps-label').textContent = `${event.target.value} FPS`; };
  el('backdrop').onchange = event => cards.classList.toggle('dark', event.target.value === 'dark');
  el('zoom').onchange = event => {
    cards.style.setProperty('--zoom', event.target.value); cards.classList.toggle('zoom4', event.target.value === '4');
  };
  if (location.protocol === 'file:') el('preview-link').href = 'http://127.0.0.1:5173/';
  window.__chibiRosterDiagnostics = () => ({ direction, state, frame, paused, actors: views.map(view => ({ id: view.actor.id, frame: view.frameId, movementKind: view.actor.movementKind, anchorPx: view.actor.anchorPx, hoverHeightPx: view.actor.hoverHeightPx })) });
  function tick(now) {
    const dt = Math.min((now - last) / 1000, .1); last = now;
    if (!paused && state === 'walk') {
      clock += dt;
      const steps = Math.floor(clock * Number(el('fps').value));
      if (steps > 0) { frame = (frame + steps) % 4; clock -= steps / Number(el('fps').value); render(); }
    }
    requestAnimationFrame(tick);
  }
  render(); requestAnimationFrame(tick);
})();
