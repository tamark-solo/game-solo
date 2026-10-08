import './style.css';
import { AnimationPlayer, type ActorDefinition } from './atlas';
import { PreviewRenderer, type RenderActor } from './renderer';
import { move } from '../../shared/world';

function el<T extends HTMLElement = HTMLElement>(id: string): T { return document.getElementById(id) as T; }
const stage = el('stage'), renderer = new PreviewRenderer(stage, el('world-labels'));
const pilotId = 'CHR-WANG-LIN-CHIBI-EAST-PILOT';
let actors: RenderActor[] = [], paused = false, mode: 'inspector' | 'map' = 'inspector';
let hold = false, heldKey = false, last = performance.now(), phase = 0;
const definitions: ActorDefinition[] = [
  { id: 'CHR-WANG-LIN', name: 'Bộ trước', role: 'story_npc', frameCount: 36, atlasUrl: '/assets/CHR-WANG-LIN/atlas.png', metadataUrl: '/assets/CHR-WANG-LIN/atlas.json', sourcePath: 'gait-correction-v1/wang-lin/native-v1' },
  { id: pilotId, name: 'Chibi · bước nhỏ', role: 'story_npc', frameCount: 5, atlasUrl: '/assets/chibi-pilot/atlas.png', metadataUrl: '/assets/chibi-pilot/atlas.json', sourcePath: 'wang-lin-chibi-pilot-v1/native-v1', previewOnlyDirection: 'east' },
];
function reset(): void {
  phase = 0; hold = heldKey = false;
  actors.forEach((a, i) => { a.x = 390 + i * 120; a.y = 410; a.moving = false; a.animation = new AnimationPlayer(a.animation.atlas); a.animation.set(mode === 'inspector' ? el<HTMLSelectElement>('motion-state').value as 'stand' | 'walk' : 'stand', 'east'); });
  renderer.cameraCenter = { x: el<HTMLInputElement>('show-previous').checked ? 450 : (actors[1]?.x ?? 510), y: 365 };
  refresh();
}
function refresh(): void {
  const pilot = actors[1]; if (!pilot) return;
  el('frame-counter').textContent = `${pilot.animation.state === 'stand' ? 'Đứng' : 'Đi'} · ${pilot.animation.frameIndex + 1}/${pilot.animation.ids.length}`;
  el('frame-name').textContent = pilot.animation.frameId;
  el('phase-readout').textContent = `${renderer.zoom}× · ${pilot.animation.ids.length} POSE`;
  el('play-pause').textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
  document.querySelectorAll<HTMLElement>('[data-zoom]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.zoom) === renderer.zoom)));
  renderer.render(el<HTMLInputElement>('show-previous').checked ? actors : [pilot]);
}
function setMode(next: typeof mode): void {
  mode = next; renderer.mode = next; renderer.zoom = next === 'map' || stage.clientWidth < 500 ? 1 : 2; paused = false;
  el('movement-help').hidden = el('map-controls').hidden = next !== 'map';
  el('inspector-controls').hidden = next !== 'inspector';
  el<HTMLButtonElement>('previous-frame').disabled = el<HTMLButtonElement>('next-frame').disabled = next !== 'inspector';
  document.querySelectorAll<HTMLElement>('[data-pilot-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pilotMode === next)));
  reset();
}
document.querySelectorAll<HTMLElement>('[data-pilot-mode]').forEach(b => b.onclick = () => setMode(b.dataset.pilotMode as typeof mode));
document.querySelectorAll<HTMLElement>('[data-zoom]').forEach(b => b.onclick = () => { renderer.zoom = Number(b.dataset.zoom); refresh(); });
el('play-pause').onclick = () => { paused = !paused; hold = heldKey = false; refresh(); };
el('reset-position').onclick = reset;
for (const [id, step] of [['previous-frame', -1], ['next-frame', 1]] as const) el(id).onclick = () => {
  paused = true; phase = (Math.floor(phase * 4) + step + 4) % 4 / 4;
  for (const a of actors) { a.animation.set('walk', 'east'); a.animation.frameIndex = Math.floor(phase * a.animation.ids.length); }
  el<HTMLSelectElement>('motion-state').value = 'walk'; refresh();
};
el('motion-state').onchange = reset;
el('cycle-ms').oninput = () => { el('cycle-label').textContent = `${(Number(el<HTMLInputElement>('cycle-ms').value) / 1000).toFixed(1)} s`; };
el('move-speed').oninput = () => { el('speed-label').textContent = `${el<HTMLInputElement>('move-speed').value} px/s`; };
el('cycle-distance').oninput = () => { el('stride-label').textContent = `${el<HTMLInputElement>('cycle-distance').value} px/vòng`; };
el('backdrop').onchange = () => { renderer.backdrop = el<HTMLSelectElement>('backdrop').value; refresh(); };
el('show-debug').onchange = () => { renderer.debug = el<HTMLInputElement>('show-debug').checked; refresh(); };
el('show-previous').onchange = () => { if (!actors[1]) return; renderer.cameraCenter.x = el<HTMLInputElement>('show-previous').checked ? 450 : actors[1].x; refresh(); };
stage.onpointerdown = () => stage.focus({ preventScroll: true });
const button = el<HTMLButtonElement>('move-east');
button.onpointerdown = e => { e.preventDefault(); button.setPointerCapture(e.pointerId); hold = true; stage.focus({ preventScroll: true }); };
button.onpointerup = button.onpointercancel = button.onlostpointercapture = () => { hold = false; };
window.addEventListener('keydown', e => {
  if (mode !== 'map' || (e.target as HTMLElement).closest('input,select,button') || e.ctrlKey || e.altKey || e.metaKey) return;
  if (['d', 'arrowright'].includes(e.key.toLowerCase())) { heldKey = true; e.preventDefault(); }
});
window.addEventListener('keyup', e => { if (['d', 'arrowright'].includes(e.key.toLowerCase())) heldKey = false; });
window.addEventListener('blur', () => { hold = heldKey = false; });
document.addEventListener('visibilitychange', () => { hold = heldKey = false; });

async function start(): Promise<void> {
  await renderer.loadActors(definitions);
  actors = definitions.map((d, i) => {
    const animation = new AnimationPlayer(renderer.assets.get(d.id)!.atlas); animation.set('walk', 'east');
    return { id: `pilot-${i}`, assetId: d.id, name: d.name, own: false, x: 390 + i * 120, y: 410, direction: 'east', moving: false, animation };
  });
  const image = new Image(); image.src = '/assets/chibi-pilot/atlas.png'; await image.decode();
  const asset = renderer.assets.get(pilotId)!.atlas;
  const labels = ['Đứng', 'Tiếp đất A', 'Chân B đi qua', 'Tiếp đất B', 'Chân A đi qua'];
  Object.entries(asset.frames).forEach(([id, r], i) => {
    const item = document.createElement('div'), c = document.createElement('canvas'), label = document.createElement('span');
    c.width = 128; c.height = 192; const context = c.getContext('2d')!; context.imageSmoothingEnabled = false;
    context.drawImage(image, r.x, r.y, 64, 96, 0, 0, 128, 192);
    label.textContent = labels[i]; item.dataset.frame = id; item.append(c, label); el('pose-strip').append(item);
  });
  renderer.zoom = stage.clientWidth < 500 ? 1 : 2;
  el('stage-message').hidden = true; reset();
  Object.assign(window, { __chibiPilotDiagnostics: () => ({ loaded: true, availableDirections: ['east'], nativeFrames: 5, mode, paused,
    actors: actors.map(a => ({ x: a.x, y: a.y, frame: a.animation.frameId, state: a.animation.state, frameIndex: a.animation.frameIndex, frames: a.animation.ids.length })),
    anchors: [...renderer.assets.values()].map(a => a.atlas.anchor), spriteCenter: [.5, 1 / 12] }) });
  requestAnimationFrame(tick);
}
function tick(now: number): void {
  const dt = Math.min((now - last) / 1000, .05); last = now;
  if (!paused) {
    if (mode === 'inspector') {
      const state = el<HTMLSelectElement>('motion-state').value as 'stand' | 'walk';
      if (state === 'walk') phase = (phase + dt * 1000 / Number(el<HTMLInputElement>('cycle-ms').value)) % 1;
      for (const a of actors) { a.animation.set(state, 'east'); a.animation.frameIndex = state === 'walk' ? Math.floor(phase * a.animation.ids.length) : 0; }
    } else {
      for (const [i, a] of actors.entries()) {
        const previousX = a.x; Object.assign(a, move(a, { x: Number(hold || heldKey), y: 0 }, dt, Number(el<HTMLInputElement>('move-speed').value)));
        a.animation.updateFromTravel(Math.abs(a.x - previousX), 'east', a.moving, i === 0 ? 48 : Number(el<HTMLInputElement>('cycle-distance').value));
      }
      renderer.cameraCenter.x = el<HTMLInputElement>('show-previous').checked ? (actors[0].x + actors[1].x) / 2 : actors[1].x;
    }
  }
  refresh(); requestAnimationFrame(tick);
}
start().catch(error => { el('stage-message').textContent = String(error); el('stage-message').classList.add('error'); });
window.addEventListener('pagehide', () => renderer.dispose());
