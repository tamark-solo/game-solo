const ART = '/assets/dao-dual-theme-v1';
const SKILL_ICONS = '/assets/skill-hud/skill-icons-v2.webp';
const MASK_PARTS = ['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'] as const;

interface OrbLayout { left: number; top: number; size: number }
// Narrow presentation port; SkillHotbar supplies it without a UI-to-client import.
interface HotbarThemeSurface {
  readonly root: HTMLElement;
  setIconAtlas(url: string): void;
  setFrame(url: string): void;
  setOrbTexture(url: string): void;
}
interface DaoHotbarLayout {
  hp: OrbLayout;
  mp: OrbLayout;
  tray: { left: number; top: number; width: number; height: number };
  slotTop: number;
}

// Measured from the current Tu Đạo hud.webp, in the native 760 × 140 frame.
// Defaults keep the controls aligned while metadata loads, or if it is unavailable.
const TU_DAO_LAYOUT: DaoHotbarLayout = {
  hp: { left: 58.3097605893186, top: 35.04088397790055, size: 63.58305709023941 },
  mp: { left: 637.7572744014733, top: 35.04088397790055, size: 63.58305709023941 },
  tray: { left: 153.60957642725597, top: 57.03499079189687, width: 452.43093922651934, height: 35.690607734806626 },
  slotTop: 56.880294659300176,
};

/** Presentation default only: the current server has no activated Đọa Ma state. */
export function initializeDaoRuntimeTheme(shell: HTMLElement): void {
  shell.dataset.daoTheme = 'tu-dao';
  shell.dataset.skin = 'tu-dao';
  shell.style.setProperty('--dao-skill-icon-atlas', `url("${SKILL_ICONS}")`);
  for (const part of MASK_PARTS) {
    shell.style.setProperty(`--mask-${part}`, `url("${ART}/tu-dao/frame-aperture-${part}.svg")`);
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function within(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function validOrb(value: unknown): value is OrbLayout {
  if (!record(value) || !within(value.left, 0, 760) || !within(value.top, 0, 140) || !within(value.size, 36, 100)) return false;
  return value.left + value.size <= 760 && value.top + value.size <= 140;
}

function readLayout(value: unknown): DaoHotbarLayout | undefined {
  if (!record(value) || !record(value['tu-dao'])) return;
  const layout = value['tu-dao'], tray = layout.tray;
  if (!validOrb(layout.hp) || !validOrb(layout.mp) || !record(tray) ||
      !within(tray.left, 0, 760) || !within(tray.top, 0, 140) ||
      !within(tray.width, 414, 600) || !within(tray.height, 30, 60) ||
      !within(layout.slotTop, 0, 104) || tray.left + tray.width > 760 || tray.top + tray.height > 140) return;
  return {
    hp: { left: layout.hp.left, top: layout.hp.top, size: layout.hp.size },
    mp: { left: layout.mp.left, top: layout.mp.top, size: layout.mp.size },
    tray: { left: tray.left, top: tray.top, width: tray.width, height: tray.height },
    slotTop: layout.slotTop,
  };
}

function applyLayout(root: HTMLElement, layout: DaoHotbarLayout): void {
  for (const role of ['hp', 'mp'] as const) {
    const orb = layout[role];
    for (const key of ['left', 'top', 'size'] as const) root.style.setProperty(`--dao-${role}-${key}`, `${orb[key]}px`);
    root.style.setProperty(`--dao-${role}-x`, `${orb.left + orb.size / 2}px`);
    root.style.setProperty(`--dao-${role}-y`, `${orb.top + orb.size / 2}px`);
  }
  for (const [key, value] of Object.entries(layout.tray)) root.style.setProperty(`--dao-tray-${key}`, `${value}px`);
  root.style.setProperty('--dao-slot-top', `${layout.slotTop}px`);
  root.style.setProperty('--dao-slot-left', `${layout.tray.left + (layout.tray.width - 414) / 2}px`);
}

/** Skin and measured layout only; snapshots, commands and FX lifecycle stay with SkillHotbar. */
export function attachDaoHotbarTheme(hotbar: HotbarThemeSurface): () => void {
  const controller = new AbortController();
  const root = hotbar.root;
  root.dataset.daoLayout = 'defaults';
  applyLayout(root, TU_DAO_LAYOUT);
  hotbar.setIconAtlas(SKILL_ICONS);
  hotbar.setFrame(`${ART}/tu-dao/hud.webp`);
  hotbar.setOrbTexture('/assets/skill-hud/orb-textures-v2.webp');
  const frame = new Image();
  root.dataset.daoArt = 'loading';
  frame.onload = () => { if (!controller.signal.aborted) root.dataset.daoArt = 'ready'; };
  frame.onerror = () => {
    if (controller.signal.aborted) return;
    root.dataset.daoArt = 'fallback';
    hotbar.setFrame('');
  };
  frame.src = `${ART}/tu-dao/hud.webp`;
  void fetch(`${ART}/layout.json`, { signal: controller.signal }).then(async response => {
    if (!response.ok) throw new Error('Missing Dao HUD layout');
    const layout = readLayout(await response.json());
    if (!layout) throw new Error('Invalid Dao HUD layout');
    if (controller.signal.aborted) return;
    applyLayout(root, layout);
    root.dataset.daoLayout = 'ready';
  }).catch(() => {
    if (!controller.signal.aborted) root.dataset.daoLayout = 'fallback';
  });
  return () => { controller.abort(); frame.onload = null; frame.onerror = null; };
}
