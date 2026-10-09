import './skill-bar-desktop.css';
import { SkillHotbar, type HotbarView } from './skills/hotbar';
import { SKILL_DEFINITIONS } from '../../shared/skills/definitions';
import { R01_IDS, type SkillId } from '../../shared/profiles';
import { HANG_NHAC } from '../../shared/hang-nhac';

const stage = document.querySelector<HTMLElement>('#preview-stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#scene-canvas')!;
const ctx = canvas.getContext('2d')!;
const avatar = document.querySelector<HTMLSelectElement>('#avatar')!;
const preset = document.querySelector<HTMLSelectElement>('#preview-state')!;
const scene = document.querySelector<HTMLSelectElement>('#scene')!;
const label = document.querySelector<HTMLElement>('#character-label')!;
const points: Record<string, { x: number; y: number }> = {
  courtyard: HANG_NHAC.world.spawn,
  garden: { x: 760, y: 940 },
  training: { x: 2360, y: 930 },
};
const images = new Map<string, HTMLImageElement>();
const frames = new Map<string, { x: number; y: number; w: number; h: number }>();
let background: HTMLImageElement;
let ready = false;
let castingUntil = 0;
let messageUntil = 0;
let view: HotbarView = { now: performance.now(), hp: 100, maxHp: 100, mp: 100, maxMp: 100, online: true, hasTarget: true, cooldownEnds: {}, aimLabel: '↓ Hướng thi triển' };

// This adapter is an isolated UI demonstration. It never opens a room or a save.
const mount = document.querySelector<HTMLElement>('#hotbar-mount')!;
const bar = new SkillHotbar(mount, { cast: castPreview, blocked: announce });
document.querySelector<HTMLInputElement>('#hud-effects')!.addEventListener('change', event => bar.setEffectsEnabled((event.target as HTMLInputElement).checked));

function announce(text: string): void { bar.announce(text); messageUntil = performance.now() + 2600; }

function castPreview(id: SkillId): void {
  const skill = SKILL_DEFINITIONS[id];
  const now = performance.now();
  view.now = now;
  view.mp -= skill.cost;
  view.cooldownEnds[id] = now + skill.cooldown;
  view.castingSkill = id;
  castingUntil = now + skill.end;
  preset.value = 'ready';
  bar.update(view);
  announce(`${skill.name} · −${skill.cost} linh lực`);
}

function applyPreset(): void {
  const now = performance.now();
  view = { now, hp: 100, maxHp: 100, mp: 100, maxMp: 100, online: true, hasTarget: true, cooldownEnds: {}, aimLabel: '↓ Hướng thi triển' };
  castingUntil = 0;
  if (preset.value === 'cooldown') {
    view.mp = 65;
    for (const id of R01_IDS) view.cooldownEnds[id] = now + SKILL_DEFINITIONS[id].cooldown;
  }
  if (preset.value === 'resource') view.mp = 8;
  if (preset.value === 'health') view.hp = 32;
  if (preset.value === 'target') view.hasTarget = false;
  if (preset.value === 'casting') { view.castingSkill = 'thunder'; castingUntil = Infinity; }
  if (preset.value === 'offline') view.online = false;
  bar.announce(''); bar.hideTooltip(); bar.update(view);
}

function paint(): void {
  if (!ready) return;
  const width = stage.clientWidth, height = stage.clientHeight;
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const point = points[scene.value];
  const footX = Math.round(width / 2), footY = Math.round(height * .50);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(background, footX - point.x, footY - point.y);
  ctx.fillStyle = '#18372a30';
  ctx.beginPath(); ctx.ellipse(footX, footY, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  const frame = frames.get(avatar.value)!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(images.get(avatar.value)!, frame.x, frame.y, frame.w, frame.h, footX - 32, footY - 88, frame.w, frame.h);
  label.textContent = avatar.selectedOptions[0].text;
  label.style.left = `${footX}px`;
  label.style.top = `${footY - 100}px`;
  document.querySelector('#scene-name')!.textContent = scene.selectedOptions[0].text;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image(); image.src = url; await image.decode(); return image;
}

async function boot(): Promise<void> {
  const catalog = await fetch('/assets/catalog.json').then(response => { if (!response.ok) throw new Error('Chưa nạp thư viện nhân vật.'); return response.json(); });
  background = await loadImage(HANG_NHAC.background.url);
  const iconAtlas = '/assets/skill-hud/skill-icons-v2.webp';
  await loadImage(iconAtlas).then(() => bar.setIconAtlas(iconAtlas));
  const frame = '/assets/skill-hud/cultivation-frame-v3.webp';
  await loadImage(frame).then(() => bar.setFrame(frame));
  const orbTexture = '/assets/skill-hud/orb-textures-v2.webp';
  await loadImage(orbTexture).then(() => bar.setOrbTexture(orbTexture));
  await Promise.all(Array.from(avatar.options).map(async option => {
    const actor = catalog.actors.find((a: { id: string }) => a.id === option.value);
    const metadata = await fetch(actor.metadataUrl).then(response => response.json());
    const standing = Object.entries(metadata.frames).find(([key]) => key.endsWith('stand_south'))?.[1] as { frame: { x: number; y: number; w: number; h: number } } | undefined;
    if (!standing || standing.frame.w !== 64 || standing.frame.h !== 96) throw new Error('Sai frame nhân vật đối chiếu.');
    frames.set(option.value, standing.frame);
    images.set(option.value, await loadImage(actor.atlasUrl));
  }));
  ready = true;
  document.querySelector<HTMLElement>('#preview-loading')!.hidden = true;
  paint();
}

preset.addEventListener('change', applyPreset);
document.querySelector('#reset-preview')!.addEventListener('click', () => { preset.value = 'ready'; applyPreset(); });
scene.addEventListener('change', paint);
avatar.addEventListener('change', paint);
new ResizeObserver(paint).observe(stage);
window.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || (event.target as HTMLElement).closest('input,select,textarea,[contenteditable=true]')) return;
  if (event.key === 'Escape') bar.hideTooltip();
  const id = R01_IDS.find(id => event.code === `Digit${SKILL_DEFINITIONS[id].shortcut}` || event.key === SKILL_DEFINITIONS[id].shortcut);
  if (id) { event.preventDefault(); bar.activate(id); }
});

function tick(now: number): void {
  view.now = now;
  if (view.castingSkill && now >= castingUntil) view.castingSkill = undefined;
  if (messageUntil && now >= messageUntil) { bar.announce(''); messageUntil = 0; }
  bar.update(view);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
void boot().catch(error => { document.querySelector('#preview-loading')!.textContent = error instanceof Error ? error.message : 'Chưa nạp được khung cảnh.'; });
