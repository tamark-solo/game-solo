import './style.css';
import { AnimationPlayer, type ActorDefinition } from './atlas';
import { NetworkSession } from './network';
import { PreviewRenderer, type RenderActor } from './renderer';
import { WORLD, DIRECTIONS, move, type Direction, type Input, type MotionState } from '../../shared/world';

type Mode = 'inspector' | 'map' | 'online';
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Thiếu thành phần ${id}.`);
  return element as T;
}
const stage = el('stage');
const actorSelect = el<HTMLSelectElement>('actor');
const motionSelect = el<HTMLSelectElement>('motion-state');
const playButton = el<HTMLButtonElement>('play-pause');
const fpsInput = el<HTMLInputElement>('animation-fps');
const speedInput = el<HTMLInputElement>('move-speed');
const strideInput = el<HTMLInputElement>('stride-distance');
const frameBack = el<HTMLButtonElement>('previous-frame');
const frameNext = el<HTMLButtonElement>('next-frame');
const follow = el<HTMLInputElement>('follow-camera');
const nameInput = el<HTMLInputElement>('player-name');
const avatarSelect = el<HTMLSelectElement>('avatar');
const serverInput = el<HTMLInputElement>('server-url');
const joinButton = el<HTMLButtonElement>('join-room');
const leaveButton = el<HTMLButtonElement>('leave-room');
const keys = new Set<string>();
const touch = new Set<Direction>();
let mode: Mode = 'inspector';
let paused = false;
let desiredState: MotionState = 'walk';
let selectedDirection: Direction = 'south';
let localActor: RenderActor | undefined;
let localActors: RenderActor[] = [];
const onlineActors = new Map<string, RenderActor>();
let selectedId = 'CHR-WANG-LIN-CHIBI-EAST-PILOT';
let elapsed = 0;
let lastTime = performance.now();
let hudTime = 0;
let fpsTime = lastTime, renderedFrames = 0, renderFPS = 0;
let renderer: PreviewRenderer | undefined;
const network = new NetworkSession(readInput, updateNetworkUI);
serverInput.value = import.meta.env.VITE_SERVER_URL || `http://${location.hostname}:2567`;
const secondPlayer = new URLSearchParams(location.search).get('player') === '2';
if (secondPlayer) { nameInput.value = 'Đệ tử thứ hai'; avatarSelect.value = 'AVATAR-NOVICE-FEMALE'; }

function clearInput(): void {
  keys.clear(); touch.clear();
  document.querySelectorAll('.touch-pad button').forEach(b => b.classList.remove('active'));
}
function readInput(): Input {
  if (!document.hasFocus() || document.hidden || (mode !== 'online' && paused)) return { x: 0, y: 0 };
  const focused = document.activeElement;
  if (focused?.matches('input,select,textarea,button:not([data-input])')) return { x: 0, y: 0 };
  return {
    x: Number(keys.has('d') || keys.has('arrowright') || touch.has('east')) - Number(keys.has('a') || keys.has('arrowleft') || touch.has('west')),
    y: Number(keys.has('s') || keys.has('arrowdown') || touch.has('south')) - Number(keys.has('w') || keys.has('arrowup') || touch.has('north')),
  };
}
window.addEventListener('keydown', event => {
  if (mode === 'inspector' || event.ctrlKey || event.metaKey || event.altKey ||
      (event.target as HTMLElement).closest('input,select,textarea,button')) return;
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) { keys.add(key); event.preventDefault(); }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', clearInput);
document.addEventListener('visibilitychange', clearInput);
stage.addEventListener('pointerdown', () => stage.focus({ preventScroll: true }));
document.querySelectorAll<HTMLButtonElement>('[data-input]').forEach(button => {
  const direction = button.dataset.input as Direction;
  button.addEventListener('pointerdown', event => {
    event.preventDefault(); button.setPointerCapture(event.pointerId); touch.add(direction); button.classList.add('active'); stage.focus({ preventScroll: true });
  });
  const release = () => { touch.delete(direction); button.classList.remove('active'); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
});

function directionsForActor(assetId = selectedId): readonly Direction[] {
  const direction = renderer?.assets.get(assetId)?.definition.previewOnlyDirection;
  return direction ? [direction] : DIRECTIONS;
}
function inputForActor(input: Input, assetId: string): Input {
  const directions = directionsForActor(assetId);
  return {
    x: input.x > 0 ? (directions.includes('east') ? input.x : 0) : (directions.includes('west') ? input.x : 0),
    y: input.y > 0 ? (directions.includes('south') ? input.y : 0) : (directions.includes('north') ? input.y : 0),
  };
}
function applyActorDefaults(): void {
  const definition = renderer?.assets.get(selectedId)?.definition;
  fpsInput.value = String(definition?.defaultAnimationFPS ?? 8);
  strideInput.value = String(definition?.defaultGaitCycleDistancePx ?? 48);
  speedInput.value = String(definition?.defaultMovementSpeedPxPerSecond ?? 80);
  el('fps-value').textContent = `${fpsInput.value} FPS`;
  el('stride-value').textContent = `${strideInput.value} px/vòng`;
  el('speed-value').textContent = `${speedInput.value} px/s`;
}
function createActor(id: string, assetId: string, name: string, x: number, y: number, own: boolean): RenderActor {
  const asset = renderer!.assets.get(assetId);
  if (!asset) throw new Error(`Chưa nạp được bộ ${assetId}.`);
  const animation = new AnimationPlayer(asset.atlas); animation.fps = Number(fpsInput.value);
  return { id, assetId, name, own, x, y, direction: selectedDirection, moving: false, animation };
}
function rebuildLocalActors(): void {
  if (!renderer?.assets.has(selectedId)) return;
  const directions = directionsForActor();
  if (!directions.includes(selectedDirection)) selectedDirection = directions[0];
  const definition = renderer.assets.get(selectedId)!.definition;
  const count = mode === 'inspector' ? 1 : Number(el<HTMLSelectElement>('actor-count').value);
  localActor = createActor('local', selectedId, definition.name.split(' · ')[0], WORLD.spawn.x, WORLD.spawn.y, true);
  localActor.animation.set(desiredState, selectedDirection);
  localActors = [localActor];
  for (let i = 1; i < count; i++) {
    const a = createActor(`simulated-${String(i).padStart(2, '0')}`, selectedId, `Mẫu ${i + 1}`,
      300 + ((i - 1) % 7) * 46, 305 + Math.floor((i - 1) / 7) * 47, false);
    a.animation.updateFromTravel(i * 8, selectedDirection, true, Number(strideInput.value)); localActors.push(a);
  }
  updateActorUI();
}
function updateActorUI(): void {
  const asset = renderer?.assets.get(selectedId); if (!asset) return;
  actorSelect.value = selectedId;
  motionSelect.querySelector<HTMLOptionElement>('option[value=walk]')!.disabled = !asset.atlas.canWalk;
  if (!asset.atlas.canWalk) desiredState = 'stand';
  motionSelect.value = desiredState;
  localActor?.animation.set(desiredState, selectedDirection);
  el('actor-note').textContent = asset.definition.previewOnlyDirection
    ? 'Mẫu chibi mới · 1 đứng + 4 pose đi · hiện có hướng Đông'
    : asset.atlas.canWalk ? `${Object.keys(asset.atlas.frames).length} frame · đứng / đi bốn hướng` : '4 frame tĩnh · di chuyển với hình tĩnh';
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
    button.disabled = !directionsForActor().includes(button.dataset.direction as Direction);
    button.setAttribute('aria-pressed', String(button.dataset.direction === selectedDirection));
  });
  el('asset-source').textContent = `Nguồn: ${asset.definition.sourcePath}`;
  updateModeUI();
}

async function setMode(nextMode: Mode): Promise<void> {
  if (mode === nextMode) return;
  clearInput();
  if (mode === 'online') await network.leave();
  if (nextMode === 'online') { strideInput.value = '48'; el('stride-value').textContent = '48 px/vòng'; }
  else if (mode === 'online') applyActorDefaults();
  mode = nextMode; paused = false; onlineActors.clear();
  if (renderer) { renderer.mode = mode; renderer.zoom = mode === 'inspector' ? 2 : 1; renderer.cameraCenter = { x: 480, y: 320 }; }
  follow.checked = mode !== 'inspector';
  rebuildLocalActors(); updateModeUI();
}
function updateModeUI(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  const online = mode === 'online', map = mode !== 'inspector';
  el('actor-controls').hidden = online; el('online-controls').hidden = !online;
  el('animation-controls').hidden = online; el('movement-controls').hidden = mode !== 'map';
  el('online-roster').hidden = !online; el('movement-help').hidden = !map; el('touch-pad').hidden = !map;
  el('follow-control').hidden = !map;
  motionSelect.disabled = mode !== 'inspector';
  fpsInput.disabled = map;
  el('gait-control').hidden = !map;
  el('gait-note').hidden = !map;
  playButton.disabled = online || !localActor;
  playButton.textContent = paused ? 'Tiếp tục' : map ? 'Dừng cảnh' : 'Tạm dừng';
  frameBack.disabled = frameNext.disabled = map || !paused || !localActor || localActor.animation.ids.length < 2;
  el<HTMLButtonElement>('reset-position').disabled = online;
  el<HTMLSelectElement>('backdrop').disabled = map;
  const definition = renderer?.assets.get(selectedId)?.definition;
  el('scene-kicker').textContent = online ? 'MÔN PHÁI · KHU CHUNG' : map ? 'SÂN THỬ · CHUYỂN ĐỘNG CỤC BỘ' : 'NGHIÊN CỨU NHÂN VẬT';
  el('scene-title').textContent = online ? 'Sân môn phái' : map ? 'Sân môn phái · map thử' : definition?.name ?? 'Đang nạp nhân vật';
  el('scene-tag').textContent = online ? 'PHIÊN THỬ ONLINE' : definition?.previewOnlyDirection ? 'MẪU CHIBI MỚI' : '64 × 96 PX';
  el('movement-note').textContent = online ? 'Dùng WASD / nút hướng. Hai cửa sổ cùng server sẽ gặp nhau trong sân.'
    : definition?.previewOnlyDirection ? 'Mẫu chibi hiện có hướng Đông. Giữ D / mũi tên phải hoặc nút → để đi.' : 'Bấm vào sân để điều khiển. Trụ giữa sân dùng thử va chạm và che khuất.';
  document.querySelectorAll<HTMLButtonElement>('[data-input]').forEach(button => {
    button.disabled = !online && !directionsForActor().includes(button.dataset.input as Direction);
  });
  el('third-stat-label').textContent = online ? 'Độ trễ mạng' : 'Frame trong bộ';
  document.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.zoom) === renderer?.zoom)));
  updateNetworkUI();
}

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => { void setMode(button.dataset.mode as Mode); }));
actorSelect.addEventListener('change', () => { clearInput(); selectedId = actorSelect.value; applyActorDefaults(); rebuildLocalActors(); });
motionSelect.addEventListener('change', () => { desiredState = motionSelect.value as MotionState; localActor?.animation.set(desiredState, selectedDirection); updateModeUI(); });
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => button.addEventListener('click', () => {
  if (!directionsForActor().includes(button.dataset.direction as Direction)) return;
  selectedDirection = button.dataset.direction as Direction;
  if (localActor) { localActor.direction = selectedDirection; localActor.animation.set(mode === 'inspector' ? desiredState : 'stand', selectedDirection); }
}));
document.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  if (renderer) renderer.zoom = Number(button.dataset.zoom);
  updateModeUI();
}));
playButton.addEventListener('click', () => { paused = !paused; clearInput(); updateModeUI(); });
frameBack.addEventListener('click', () => localActor?.animation.step(-1));
frameNext.addEventListener('click', () => localActor?.animation.step(1));
el('reset-position').addEventListener('click', () => { clearInput(); rebuildLocalActors(); });
fpsInput.addEventListener('input', () => {
  el('fps-value').textContent = `${fpsInput.value} FPS`;
  for (const actor of localActors) actor.animation.fps = Number(fpsInput.value);
});
speedInput.addEventListener('input', () => { el('speed-value').textContent = `${speedInput.value} px/s`; });
strideInput.addEventListener('input', () => { el('stride-value').textContent = `${strideInput.value} px/vòng`; });
el('actor-count').addEventListener('change', rebuildLocalActors);
el('backdrop').addEventListener('change', event => { if (renderer) renderer.backdrop = (event.target as HTMLSelectElement).value; });
el('show-debug').addEventListener('change', event => { if (renderer) renderer.debug = (event.target as HTMLInputElement).checked; });
joinButton.addEventListener('click', () => { clearInput(); void network.connect(serverInput.value, nameInput.value, avatarSelect.value); });
leaveButton.addEventListener('click', () => { clearInput(); void network.leave(); });
el('second-window').addEventListener('click', () => {
  const url = new URL(location.href); url.searchParams.set('player', '2');
  window.open(url.toString(), '_blank', 'noopener');
});

function updateNetworkUI(): void {
  const busy = network.status === 'connecting' || network.status === 'reconnecting';
  joinButton.disabled = busy || Boolean(network.room) || !renderer?.assets.has('AVATAR-NOVICE-MALE') || !renderer?.assets.has('AVATAR-NOVICE-FEMALE');
  leaveButton.disabled = !network.room;
  nameInput.disabled = avatarSelect.disabled = serverInput.disabled = busy || Boolean(network.room);
  el('network-status').textContent = network.detail;
  const chip = el('connection-chip'); chip.dataset.status = mode === 'online' ? network.status : 'idle';
  chip.replaceChildren(document.createElement('i'), document.createTextNode(mode === 'online' ? {
    idle: 'Hãy vào sân', connecting: 'Đang kết nối', connected: `${network.players.size} đệ tử online`, reconnecting: 'Đang kết nối lại', error: 'Chưa kết nối',
  }[network.status] : 'Cục bộ'));
  el('room-id').textContent = network.room ? `Phòng ${network.room.roomId}` : 'Chưa có phiên';
  const list = el('player-list');
  const signature = [...network.players.values()].map(p => `${p.id}:${p.name}:${p.connected}`).join('|');
  if (list.dataset.signature !== signature) {
    list.dataset.signature = signature; list.replaceChildren();
    for (const p of network.players.values()) {
      const card = document.createElement('div'); card.className = `player-card${p.id === network.room?.sessionId ? ' own' : ''}`; card.dataset.playerId = p.id;
      const title = document.createElement('strong'); title.textContent = `${p.name}${p.id === network.room?.sessionId ? ' · bạn' : ''}`;
      const description = document.createElement('span'); description.textContent = p.connected ? (p.avatarId.endsWith('FEMALE') ? 'Đệ tử nữ · trong sân' : 'Đệ tử nam · trong sân') : 'Đang mất kết nối';
      card.append(title, description); list.append(card);
    }
  }
  if (mode === 'online') {
    el('stage-message').hidden = Boolean(network.room);
    el('stage-message').classList.toggle('error', network.status === 'error');
    el('stage-message').textContent = network.status === 'idle' ? 'Chọn tên và tạo hình, rồi bấm “Vào sân”.' : network.detail;
  }
}

function actorsForFrame(dt: number, now: number): RenderActor[] {
  if (mode === 'online') {
    network.update(now);
    for (const [id, p] of network.players) {
      if (!renderer?.assets.has(p.avatarId)) continue;
      let actor = onlineActors.get(id);
      if (!actor) { actor = createActor(id, p.avatarId, p.name, p.x, p.y, id === network.room?.sessionId); onlineActors.set(id, actor); }
      const rendered = network.renderMotion(id) ?? p;
      const distance = Math.hypot(rendered.x - actor.x, rendered.y - actor.y);
      actor.x = rendered.x; actor.y = rendered.y;
      actor.direction = rendered.direction;
      actor.moving = p.connected && distance > .02 && distance < 128;
      actor.connected = p.connected;
      actor.animation.updateFromTravel(distance, actor.direction, actor.moving, Number(strideInput.value));
    }
    for (const id of onlineActors.keys()) if (!network.players.has(id)) onlineActors.delete(id);
    return [...onlineActors.values()];
  }
  if (!paused) {
    for (const [index, actor] of localActors.entries()) {
      if (mode === 'map') {
        const patrols: Input[] = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
        const input = index === 0 ? readInput() : patrols[Math.floor(elapsed / 1.5 + index) % patrols.length];
        const next = move(actor, inputForActor(input, actor.assetId), dt, Number(speedInput.value));
        const distance = Math.hypot(next.x - actor.x, next.y - actor.y);
        Object.assign(actor, next);
        actor.animation.updateFromTravel(distance, next.direction, next.moving, Number(strideInput.value));
      } else { actor.animation.set(desiredState, selectedDirection); actor.animation.update(dt); }
    }
  }
  return localActors;
}

function updateHUD(actors: RenderActor[]): void {
  const own = actors.find(a => a.own) ?? actors[0];
  el('position-readout').textContent = own ? `${own.x.toFixed(1)} · ${own.y.toFixed(1)}` : '—';
  el('render-readout').textContent = `${Math.round(renderFPS)} FPS · ${actors.length} hình`;
  el('third-stat').textContent = mode === 'online' ? `${Math.round(network.latency)} ms` : String(renderer?.assets.get(selectedId) ? Object.keys(renderer.assets.get(selectedId)!.atlas.frames).length : 0);
  if (own) {
    const gaitFrames = own.animation.atlas.animations[`walk_${own.direction}`]?.length ?? 0;
    el('fps-value').textContent = mode === 'inspector' ? `${fpsInput.value} FPS` : `${((mode === 'online' ? WORLD.speed : Number(speedInput.value)) * gaitFrames / Number(strideInput.value)).toFixed(1)} FPS · tự khớp`;
    el('frame-counter').textContent = `${own.animation.state === 'walk' ? 'Đi' : 'Đứng'} · ${own.animation.frameIndex + 1} / ${own.animation.ids.length}`;
    el('frame-name').textContent = own.animation.frameId;
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.direction === own.direction)));
  } else { el('frame-counter').textContent = 'Chưa có nhân vật'; el('frame-name').textContent = 'Vào sân để bắt đầu'; }
  el('stage-corner').textContent = `PIXEL NATIVE · ${renderer?.zoom ?? 1}×`;
  el('stage-badge').textContent = mode === 'online' ? 'VỊ TRÍ DO SERVER XỬ LÝ' : renderer?.debug ? 'ĐIỂM NEO · 32, 88' : 'NHÂN VẬT PIXEL · NỀN STYLIZED';
}
function frame(now: number): void {
  const dt = Math.max(0, Math.min((now - lastTime) / 1000, .1)); lastTime = now;
  if (!paused) elapsed += dt;
  const actors = actorsForFrame(dt, now);
  if (renderer) {
    const own = actors.find(a => a.own);
    renderer.cameraCenter = mode !== 'inspector' && follow.checked && own ? { x: own.x, y: own.y - 25 } : { x: 480, y: 320 };
    renderer.render(actors);
  }
  renderedFrames++;
  if (now - fpsTime >= 1000) { renderFPS = renderedFrames * 1000 / (now - fpsTime); renderedFrames = 0; fpsTime = now; }
  if (now - hudTime >= 90) { updateHUD(actors); hudTime = now; }
  requestAnimationFrame(frame);
}

async function initialize(): Promise<void> {
  try {
    renderer = new PreviewRenderer(stage, el('world-labels'));
    const response = await fetch('/assets/catalog.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Thiếu catalog. Hãy chạy npm run assets.');
    const catalog = await response.json() as { actors: ActorDefinition[]; backgroundUrl: string; defaultActorId?: string; defaultDirection?: Direction };
    selectedId = catalog.defaultActorId ?? selectedId;
    selectedDirection = catalog.defaultDirection ?? 'east';
    let loadError: unknown;
    try { await renderer.loadActors(catalog.actors, catalog.backgroundUrl); } catch (error) { loadError = error; }
    for (const definition of catalog.actors) {
      if (!renderer.assets.has(definition.id)) continue;
      const option = document.createElement('option'); option.value = definition.id; option.textContent = definition.name; actorSelect.append(option);
    }
    if (!renderer.assets.size) throw loadError ?? new Error('Không có atlas có thể sử dụng.');
    if (!renderer.assets.has(selectedId)) throw loadError ?? new Error(`Không nạp được mẫu mặc định ${selectedId}.`);
    applyActorDefaults();
    actorSelect.disabled = false; rebuildLocalActors(); el('stage-message').hidden = true;
    if (loadError) { el('actor-note').textContent = `Một số asset bị lỗi: ${String(loadError)}`; }
    requestAnimationFrame(frame);
    if (secondPlayer) await setMode('online');
    if (import.meta.env.DEV) {
      // 4010 is Colyseus MAY_TRY_RECONNECT, also used by the SDK on browser offline.
      Object.assign(window, { __previewDropConnection: () => network.room?.connection.close(4010), __previewDiagnostics: () => ({
        mode, loadedAssets: renderer!.assets.size, selectedActorId: selectedId, availableDirections: directionsForActor(),
        sessionId: network.room?.sessionId, connectionStatus: network.status,
        nativeFrames: [...renderer!.assets.values()].reduce((n, a) => n + Object.keys(a.atlas.frames).length, 0),
        camera: { x: renderer!.camera.position.x, y: -renderer!.camera.position.y, zoom: renderer!.zoom },
        serverActors: [...network.players.values()],
        actors: [...(mode === 'online' ? onlineActors.values() : localActors)].map(a => ({ id: a.id, x: a.x, y: a.y, moving: a.moving, direction: a.direction, frame: a.animation.frameId })),
        sprites: renderer!.scene.children.filter(o => o.type === 'Sprite' && o.userData.entityId).map(o => ({ id: o.userData.entityId, center: (o as import('three').Sprite).center.toArray(), order: o.renderOrder,
          offset: (o as import('three').Sprite).material.map?.offset.toArray(), position: o.position.toArray() })),
      }) });
    }
  } catch (error) {
    el('stage-message').hidden = false; el('stage-message').classList.add('error');
    el('stage-message').textContent = `Không mở được preview: ${error instanceof Error ? error.message : String(error)}`;
  }
}
void initialize();
window.addEventListener('pagehide', () => { clearInput(); void network.leave(); });
