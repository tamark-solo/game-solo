const SKILL_ICONS = '/assets/skill-hud/skill-icons-v2.webp';

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

// Crisp symmetrical geometry for the Sculpted Vector/CSS Dual-Orb + 10-Slot Pháp Đài (760 × 136).
const UNIFIED_PHAP_DAI_LAYOUT: DaoHotbarLayout = {
  hp: { left: 66, top: 34, size: 70 },
  mp: { left: 624, top: 34, size: 70 },
  tray: { left: 152, top: 52, width: 456, height: 54 },
  slotTop: 58,
};

export function initializeDaoRuntimeTheme(shell: HTMLElement): void {
  shell.dataset.uiDesign = 'dao-an-v3';
  shell.dataset.daoTheme = 'dao-an';
  shell.dataset.skin = 'dao-an';
  shell.dataset.daoUx = 'v3';
  shell.dataset.hudStyle = 'dao-an';
  shell.style.setProperty('--dao-skill-icon-atlas', `url("${SKILL_ICONS}")`);
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
  const shell = root.closest<HTMLElement>('#game-shell') ?? document.getElementById('game-shell');

  const syncHudStyle = () => {
    if (shell?.dataset.uiDesign === 'dao-an-v3') {
      root.dataset.hudStyle = 'dao-an';
      hotbar.setIconAtlas(SKILL_ICONS);
      root.dataset.daoArt = 'ready';
      root.dataset.daoLayout = 'ready';
      return;
    }
    const style = shell?.dataset.hudStyle || 'empire-lotus';
    root.dataset.hudStyle = style;
    applyLayout(root, UNIFIED_PHAP_DAI_LAYOUT);
    hotbar.setIconAtlas(SKILL_ICONS);
    hotbar.setFrame('');
    hotbar.setOrbTexture('/assets/skill-hud/orb-textures-v2.webp');
    root.dataset.daoArt = 'ready';
    root.dataset.daoLayout = 'ready';
  };

  syncHudStyle();

  const onStyleToggle = () => syncHudStyle();
  window.addEventListener('dao:hud-style-change', onStyleToggle, { signal: controller.signal });

  return () => {
    controller.abort();
  };
}
