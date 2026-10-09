import type { SkillId } from '../../../shared/profiles';
import './hotbar-effects.css';

interface EffectSnapshot {
  online: boolean;
  castingSkill?: SkillId;
  states: ReadonlyMap<SkillId, string>;
}

// Decorative presentation only: consumes confirmed UI state, never requests a cast.
export class HotbarEffects {
  private enabled = true;
  private previousCast?: SkillId;
  private previousStates = new Map<SkillId, string>();
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private pulses = new Map<HTMLElement, Animation>();
  private slotEffects = new Map<SkillId, { halo: HTMLElement; sheen: HTMLElement }>();
  private layer: HTMLElement;
  private manaFlare: HTMLElement;

  constructor(private root: HTMLElement, slots: ReadonlyMap<SkillId, HTMLButtonElement>) {
    this.layer = document.createElement('div');
    this.layer.className = 'hud-fx-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    const gems = [[102, 26], [380, 50], [658, 26]];
    const glints = [[58, 94], [216, 59], [544, 111], [701, 93], [332, 59], [428, 59]];
    // The seals are abstract trigrams, drawn here rather than baked into the resource texture.
    const mandala = `<svg viewBox="0 0 112 112"><circle class="seal-rim" cx="56" cy="56" r="49"/><circle class="seal-ticks" cx="56" cy="56" r="46"/><path class="seal-arcs" d="M16 30A48 48 0 0 1 70 10M96 82A48 48 0 0 1 42 102"/>${Array.from({ length: 8 }, (_, i) => `<g transform="translate(56 56) rotate(${i * 45}) translate(0 -42)"><path d="M-3-2H3M-3 0H-1M1 0H3M-3 2H3"/></g>`).join('')}<path class="seal-star" d="m56 3 3 5-3 5-3-5Zm0 96 3 5-3 5-3-5ZM3 56l5-3 5 3-5 3Zm96 0 5-3 5 3-5 3Z"/></svg>`;
    this.layer.innerHTML = `
      <div class="hud-fx-frame-light"></div>
      <div class="hud-fx-frame-sheen"><i></i></div>
      <span class="hud-fx-orb-aura hud-fx-health-aura"></span>
      <span class="hud-fx-orb-aura hud-fx-mana-aura"></span>
      <span class="hud-fx-mandala hud-fx-health-seal">${mandala}</span>
      <span class="hud-fx-mandala hud-fx-mana-seal">${mandala}</span>
      <span class="hud-fx-mana-flare"></span>
      <svg class="hud-fx-qi" viewBox="0 0 760 140"><path class="qi-rail" d="M178 60H582M582 112H178"/><path class="qi-current" d="M178 60H582"/><path class="qi-current" d="M582 112H178"/></svg>
      <span class="hud-fx-center-seal"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="m24 2 3 8-3 4-3-4Zm0 32 3 4-3 8-3-8ZM2 24l8-3 4 3-4 3Zm32 0 4-3 8 3-8 3Z"/><circle cx="24" cy="24" r="22" stroke-dasharray="1 7"/></svg></span>
      ${gems.map(([x, y], index) => `<span class="hud-fx-gem" style="left:${x}px;top:${y}px;animation-delay:${-index * 1.7}s"></span>`).join('')}
      ${glints.map(([x, y], index) => `<span class="hud-fx-glint" style="left:${x}px;top:${y}px;animation-delay:${-index * 1.9}s"></span>`).join('')}`;
    this.root.querySelector('.hotbar-tray')!.append(this.layer);
    this.manaFlare = this.layer.querySelector('.hud-fx-mana-flare')!;
    for (const [id, button] of slots) {
      button.parentElement!.dataset.fxSkill = id;
      const halo = document.createElement('span');
      halo.className = 'hud-fx-skill-halo';
      halo.setAttribute('aria-hidden', 'true');
      button.parentElement!.append(halo);
      const clip = document.createElement('span');
      clip.className = 'hud-fx-slot-clip';
      clip.setAttribute('aria-hidden', 'true');
      const sheen = document.createElement('span');
      sheen.className = 'hud-fx-cast-sheen';
      clip.append(sheen); button.append(clip);
      this.slotEffects.set(id, { halo, sheen });
    }
    document.addEventListener('visibilitychange', this.refreshMotion);
    this.motion.addEventListener('change', this.refreshMotion);
    this.refreshMotion();
  }

  private refreshMotion = (): void => {
    this.root.dataset.effects = this.enabled ? 'on' : 'off';
    this.root.dataset.fxPaused = String(document.hidden);
    if (!this.enabled || this.motion.matches || document.hidden) this.cancelPulses();
  };

  setEnabled(enabled: boolean): void { this.enabled = enabled; this.refreshMotion(); }

  update(snapshot: EffectSnapshot): void {
    if (!snapshot.online) this.cancelPulses();
    const canAnimate = this.enabled && snapshot.online && !document.hidden && !this.motion.matches;
    if (canAnimate && snapshot.castingSkill && snapshot.castingSkill !== this.previousCast) {
      const effect = this.slotEffects.get(snapshot.castingSkill)!;
      this.pulse(this.manaFlare, [
        { opacity: 0, transform: 'scale(.8)' },
        { opacity: .9, transform: 'scale(1)', offset: .2 },
        { opacity: 0, transform: 'scale(1.22)' },
      ], 720);
      this.pulse(effect.halo, [
        { opacity: 0, transform: 'scale(.82)' },
        { opacity: .85, transform: 'scale(1)', offset: .22 },
        { opacity: 0, transform: 'scale(1.28)' },
      ], 680);
      this.pulse(effect.sheen, [
        { opacity: 0, transform: 'translateX(-40px)' },
        { opacity: .75, offset: .35 },
        { opacity: 0, transform: 'translateX(40px)' },
      ], 460);
    }
    for (const [id, state] of snapshot.states) {
      if (canAnimate && state === 'ready' && this.previousStates.get(id) === 'cooldown') {
        this.pulse(this.slotEffects.get(id)!.halo, [
          { opacity: 0, transform: 'scale(.9)' },
          { opacity: .55, transform: 'scale(1.05)', offset: .35 },
          { opacity: 0, transform: 'scale(1.2)' },
        ], 520);
      }
    }
    this.previousCast = snapshot.castingSkill;
    this.previousStates = new Map(snapshot.states);
  }

  private pulse(element: HTMLElement, frames: Keyframe[], duration: number): void {
    this.pulses.get(element)?.cancel();
    const animation = element.animate(frames, { duration, easing: 'ease-out' });
    this.pulses.set(element, animation);
    void animation.finished.then(() => {
      if (this.pulses.get(element) === animation) this.pulses.delete(element);
    }).catch(() => { /* Disabling effects or leaving the page cancels the pulse. */ });
  }

  private cancelPulses(): void { this.pulses.forEach(animation => animation.cancel()); this.pulses.clear(); }

  dispose(): void {
    this.cancelPulses();
    document.removeEventListener('visibilitychange', this.refreshMotion);
    this.motion.removeEventListener('change', this.refreshMotion);
    this.layer.remove();
  }
}
