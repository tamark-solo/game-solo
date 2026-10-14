import { type SectView } from '../../shared/sect';
import { currentSectQuest, QUEST_STATUS_LABELS, sectQuests, type SectQuest } from '../../shared/sect-quests';
import type { AvatarId } from '../../shared/profiles';
import { chapterGate, initialChapter, readG2State, type G2RewardItem } from '@shared/chapter';
import { objectiveKindMeta, questCategoryMeta, questSealStampSvg } from './ui/dao-quest-icons';
import { npcStationName } from './npc-life';

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] => {
  const result = document.createElement(tag);
  if (text) result.textContent = text;
  return result;
};

const RARITY_LABELS: Record<G2RewardItem['rarity'], string> = {
  artifact: 'Pháp Bảo Bản Mệnh',
  pill: 'Linh Đan Diệu Dược',
  material: 'Thiên Tài Địa Bảo',
  realm: 'Đạo Cơ · Công Pháp',
};

const RARITY_THEMES: Record<G2RewardItem['rarity'], { border: string; bg: string; glow: string; title: string; badge: string }> = {
  artifact: {
    border: 'rgba(245, 202, 100, 0.72)',
    bg: 'linear-gradient(145deg, rgba(46, 33, 14, 0.94), rgba(20, 15, 9, 0.96))',
    glow: 'rgba(245, 202, 100, 0.22)',
    title: '#ffe596',
    badge: '#f3c35a',
  },
  realm: {
    border: 'rgba(196, 152, 255, 0.65)',
    bg: 'linear-gradient(145deg, rgba(34, 22, 54, 0.94), rgba(15, 12, 28, 0.96))',
    glow: 'rgba(186, 138, 255, 0.2)',
    title: '#ebd4ff',
    badge: '#caa2ff',
  },
  pill: {
    border: 'rgba(104, 226, 178, 0.62)',
    bg: 'linear-gradient(145deg, rgba(16, 44, 36, 0.94), rgba(10, 22, 20, 0.96))',
    glow: 'rgba(104, 226, 178, 0.18)',
    title: '#c8ffea',
    badge: '#74e4b8',
  },
  material: {
    border: 'rgba(122, 198, 238, 0.56)',
    bg: 'linear-gradient(145deg, rgba(16, 34, 48, 0.94), rgba(10, 18, 28, 0.96))',
    glow: 'rgba(122, 198, 238, 0.15)',
    title: '#d4f0ff',
    badge: '#8ac9eb',
  },
};

export function renderRewardSlots(items: G2RewardItem[], compact = false): HTMLElement {
  const wrap = node('div');
  wrap.className = compact ? 'g2-reward-slots g2-reward-slots-compact' : 'g2-reward-slots';
  wrap.style.cssText = compact
    ? 'display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:center;'
    : 'display:grid;grid-template-columns:repeat(auto-fill,minmax(172px,1fr));gap:8px;margin-top:8px;';
  for (const item of items) {
    const theme = RARITY_THEMES[item.rarity] ?? RARITY_THEMES.material;
    const slot = node('div');
    slot.className = `g2-reward-slot g2-reward-${item.rarity}`;
    slot.title = `${item.name}${item.count ? ` (${item.count})` : ''} · ${RARITY_LABELS[item.rarity]}`;
    slot.style.cssText = compact
      ? `display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:7px;background:${theme.bg};border:1px solid ${theme.border};box-shadow:inset 0 0 8px ${theme.glow};font-size:11.5px;color:#f5ebd6;`
      : `display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:9px;background:${theme.bg};border:1px solid ${theme.border};box-shadow:0 4px 12px rgba(0,0,0,0.35),inset 0 0 12px ${theme.glow};`;
    const iconFrame = node('span');
    iconFrame.style.cssText = compact
      ? `display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:5px;background:rgba(0,0,0,0.38);border:1px solid ${theme.border};flex-shrink:0;`
      : `display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:7px;background:rgba(0,0,0,0.42);border:1px solid ${theme.border};box-shadow:0 0 10px ${theme.glow};flex-shrink:0;position:relative;`;
    const img = node('img');
    img.src = item.icon;
    img.alt = item.name;
    img.width = img.height = compact ? 20 : 36;
    img.style.cssText = 'image-rendering:pixelated;object-fit:contain;display:block;';
    iconFrame.append(img);
    const textWrap = node('div');
    textWrap.style.cssText = 'display:flex;flex-direction:column;min-width:0;line-height:1.25;';
    const title = node('strong', item.count ? `${item.name} (${item.count})` : item.name);
    title.style.cssText = compact
      ? `font-size:11px;color:${theme.title};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:142px;`
      : `font-size:12.5px;color:${theme.title};font-weight:700;`;
    textWrap.append(title);
    if (!compact) {
      const badge = node('small', RARITY_LABELS[item.rarity]);
      badge.style.cssText = `font-size:10.5px;color:${theme.badge};letter-spacing:0.02em;margin-top:2px;`;
      textWrap.append(badge);
    }
    slot.append(iconFrame, textWrap);
    wrap.append(slot);
  }
  return wrap;
}

export function showG2LootToast(title: string, subtitle: string, items: G2RewardItem[], portrait?: string): void {
  const shell = document.getElementById('game-shell') ?? document.body;
  const existing = document.getElementById('g2-loot-toast');
  existing?.remove();
  const toast = node('aside');
  toast.id = 'g2-loot-toast';
  toast.setAttribute('role', 'status');
  toast.style.cssText = 'position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:9999;min-width:340px;max-width:560px;padding:14px 18px;border-radius:14px;background:linear-gradient(180deg,rgba(18,28,40,0.98),rgba(9,15,24,0.98));border:1.5px solid #e7c068;box-shadow:0 16px 40px rgba(0,0,0,0.82),0 0 28px rgba(231,192,104,0.32);color:#f7efe0;cursor:pointer;animation:fadeIn 0.2s ease-out;';
  const head = node('div');
  head.style.cssText = 'display:flex;align-items:center;gap:12px;';
  if (portrait) {
    const avatar = node('img');
    avatar.src = portrait;
    avatar.alt = '';
    avatar.width = avatar.height = 52;
    avatar.style.cssText = 'image-rendering:pixelated;object-fit:contain;border-radius:9px;border:1.5px solid rgba(231,192,104,0.75);background:rgba(255,255,255,0.06);padding:2px;flex-shrink:0;';
    head.append(avatar);
  }
  const headText = node('div');
  const kicker = node('div', '✨ THIÊN MỆNH CHI QUYỂN · ĐẠO QUẢ VIÊN MÃN');
  kicker.style.cssText = 'font-size:10.5px;letter-spacing:0.1em;color:#e7c068;font-weight:800;';
  const mainTitle = node('div', title);
  mainTitle.style.cssText = 'font-size:15.5px;font-weight:700;color:#fff4d2;margin-top:2px;';
  const sub = node('div', subtitle);
  sub.style.cssText = 'font-size:12px;color:#b8d4ce;margin-top:2px;';
  headText.append(kicker, mainTitle, sub);
  head.append(headText);
  toast.append(head);
  if (items.length) {
    toast.append(renderRewardSlots(items, false));
  }
  toast.addEventListener('click', () => toast.remove());
  shell.append(toast);
  window.setTimeout(() => {
    if (toast.isConnected) toast.remove();
  }, 4800);
}

export function checklist(quest: SectQuest, onAction?: () => void, detailed = false): HTMLOListElement {
  const list = node('ol');
  list.className = detailed ? 'quest-checklist quest-checklist-detailed' : 'quest-checklist';
  const current = quest.objectives.find(objective => !objective.done) ?? quest.objectives.at(-1);
  for (const [idx, objective] of quest.objectives.entries()) {
    const meta = objectiveKindMeta(objective.id, objective.text);
    const isCurrent = objective === current && !objective.done && quest.status !== 'locked';
    const item = node('li');
    item.className = 'dao-objective-row';
    item.dataset.complete = String(objective.done);
    item.dataset.objective = objective.id;
    item.dataset.current = String(objective === current);
    item.dataset.kind = meta.kind;

    const iconBadge = node('span');
    iconBadge.className = 'quest-check dao-obj-icon';
    iconBadge.setAttribute('aria-hidden', 'true');
    iconBadge.style.color = objective.done ? '#79e2b7' : isCurrent ? meta.accentColor : '#8da3b0';
    iconBadge.innerHTML = objective.done
      ? `<svg viewBox="0 0 20 20" width="15" height="15" fill="none"><circle cx="10" cy="10" r="8" fill="rgba(104,226,178,0.22)" stroke="#79e2b7" stroke-width="1.6"/><path d="M6.3 10.2l2.4 2.5 5-5.2" stroke="#79e2b7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : meta.svg;

    const copyWrap = node('div');
    copyWrap.className = 'dao-obj-copy';
    const topMeta = node('div');
    topMeta.className = 'dao-obj-meta';
    const kindPill = node('span', `Bước ${idx + 1} · ${meta.shortLabel}`);
    kindPill.className = 'dao-obj-kind-pill';
    kindPill.style.color = objective.done ? '#79e2b7' : meta.accentColor;
    topMeta.append(kindPill);

    if (objective.done) {
      const doneTag = node('span', '✓ Đã đạt');
      doneTag.className = 'dao-obj-done-tag';
      topMeta.append(doneTag);
    } else if (isCurrent && onAction) {
      const ctaPill = node('span', meta.ctaLabel);
      ctaPill.className = 'dao-obj-cta-pill';
      topMeta.append(ctaPill);
    }

    const mainText = node('span', objective.text);
    mainText.className = 'dao-obj-text';
    copyWrap.append(topMeta, mainText);

    if (isCurrent && onAction) {
      item.style.cursor = 'pointer';
      item.title = `${meta.ctaLabel}: Bấm để tự động tìm đường hoặc thực hiện ngay`;
      item.addEventListener('click', event => {
        event.stopPropagation();
        onAction();
      });
    }
    item.append(iconBadge, copyWrap);
    list.append(item);
  }
  return list;
}

export interface QuestUIActions {
  journal: () => void;
  guide: () => void;
  onSelectQuest?: (quest: SectQuest) => void;
  onPrimaryQuestAction?: (quest: SectQuest) => void;
  onOpenChapter?: (quest: SectQuest) => void;
}

export class QuestUI {
  private signature = '';
  private journalList?: HTMLElement;
  private selectedQuest = '';
  private stageFilter: 'all' | 'stage1' | 'stage2' = 'all';
  private previousCurrent = '';
  private profileId?: string;
  private tracker = document.getElementById('sect-objective')!;
  private portraitImg?: HTMLImageElement;
  private categoryRibbon?: HTMLElement;

  constructor(private actions: QuestUIActions) {
    document.getElementById('journal')!.addEventListener('click', actions.journal);
    document.getElementById('quest-guide')!.addEventListener('click', actions.guide);
    const toggle = document.getElementById('quest-toggle') as HTMLButtonElement;
    this.tracker.dataset.details = 'compact';
    const details = node('button', '⋯');
    details.type = 'button';
    details.id = 'quest-details-toggle';
    details.setAttribute('aria-label', 'Hiện chi tiết Mệnh Kiếp Chí');
    details.setAttribute('aria-expanded', 'false');
    details.setAttribute('aria-controls', 'quest-tracker-body');
    details.title = 'Mở rộng / Thu gọn chi tiết Ngọc Giản Mệnh Kiếp';
    toggle.before(details);
    details.addEventListener('click', () => {
      if (window.matchMedia('(max-height: 520px)').matches) {
        actions.journal();
        return;
      }
      const expanded = this.tracker.dataset.details !== 'full';
      this.tracker.dataset.details = expanded ? 'full' : 'compact';
      details.setAttribute('aria-expanded', String(expanded));
      details.setAttribute('aria-label', expanded ? 'Rút gọn chi tiết Mệnh Kiếp Chí' : 'Hiện chi tiết Mệnh Kiếp Chí');
    });
    const title = document.getElementById('quest-title')!;
    title.tabIndex = 0;
    title.setAttribute('role', 'button');
    title.title = 'Bấm để tự tìm đường hoặc thực hiện Mệnh Kiếp Chí (VG01–VG11)';
    title.addEventListener('click', actions.guide);
    title.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        actions.guide();
      }
    });
    const nextEl = document.getElementById('quest-next')!;
    nextEl.style.cursor = 'pointer';
    nextEl.title = 'Bấm để tự tìm đường tới NPC hoặc vào Bí Cảnh';
    nextEl.addEventListener('click', actions.guide);
    toggle.addEventListener('click', () => {
      const body = document.getElementById('quest-tracker-body')!;
      body.hidden = !body.hidden;
      toggle.setAttribute('aria-expanded', String(!body.hidden));
      toggle.textContent = body.hidden ? 'Mở' : 'Gọn';
    });
  }

  update(view: SectView | undefined, online: boolean, avatar: AvatarId): SectQuest {
    const quests = sectQuests(view);
    const current = currentSectQuest(quests);
    const g2 = readG2State(view);
    const catMeta = questCategoryMeta(current.id);
    if (this.profileId !== view?.profileId || (this.selectedQuest === this.previousCurrent && current.id !== this.previousCurrent)) {
      this.selectedQuest = current.id;
    }
    this.profileId = view?.profileId;
    this.previousCurrent = current.id;
    const syncing = online && !view;
    const label = document.getElementById('quest-state')!;
    label.textContent = syncing ? 'Đang đồng bộ' : !online ? 'Chưa kết nối' : QUEST_STATUS_LABELS[current.status];
    label.dataset.state = online ? current.status : 'offline';
    this.tracker.dataset.quest = current.id;
    this.tracker.dataset.category = catMeta.kind;

    const headingStrong = this.tracker.querySelector<HTMLElement>('.quest-tracker-heading strong')!;
    headingStrong.dataset.shortLabel = current.id;
    if (!this.portraitImg) {
      this.portraitImg = node('img');
      this.portraitImg.width = this.portraitImg.height = 38;
      this.portraitImg.alt = '';
      this.portraitImg.style.cssText = 'image-rendering:pixelated;object-fit:contain;border-radius:7px;border:1.5px solid rgba(235,196,108,0.68);background:rgba(12,20,30,0.92);padding:2px;margin-right:7px;vertical-align:middle;box-shadow:0 2px 8px rgba(0,0,0,0.45);';
      headingStrong.prepend(this.portraitImg);
    }
    this.portraitImg.src = current.portrait;

    const bodyEl = document.getElementById('quest-tracker-body')!;
    if (!this.categoryRibbon) {
      this.categoryRibbon = node('div');
      this.categoryRibbon.id = 'quest-category-ribbon';
      this.categoryRibbon.className = 'dao-quest-ribbon';
      bodyEl.prepend(this.categoryRibbon);
    }
    this.categoryRibbon.style.cssText = `display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 8px;border-radius:7px;background:${catMeta.bgColor};border:1px solid ${catMeta.borderColor};color:${catMeta.accentColor};font-size:10.5px;font-weight:700;letter-spacing:0.04em;`;
    this.categoryRibbon.innerHTML = `<span style="display:inline-flex;align-items:center;gap:5px;">${catMeta.svg}<span>${catMeta.badgeText}</span></span><span style="color:#f5ebd6;font-weight:600;">${catMeta.realmText}</span>`;

    this.tracker.dataset.online = String(online);
    const guide = document.getElementById('quest-guide') as HTMLButtonElement;
    guide.disabled = syncing || current.status === 'unreleased';
    document.getElementById('quest-next')!.textContent = syncing
      ? 'Đang đọc Thiên Mệnh Chi Quyển đã lưu…'
      : !online
      ? 'Vào sân chung để tiếp tục Mệnh Kiếp Chí (VG01–VG11).'
      : `▸ ${current.nextStep}`;
    const completed = quests.filter(quest => quest.status === 'completed').length;
    document.getElementById('quest-chapter-progress')!.textContent = `${completed}/${quests.length} Hồi · ${current.speaker}`;
    const gate = chapterGate(view?.chapter ?? initialChapter());
    document.getElementById('cultivation-summary')!.textContent = view
      ? `${g2.realmLabel} · ${g2.stance.name} · Tu vi ${view.cultivation} / ${gate}`
      : 'Mệnh Kiếp Chí G2 · đang chờ bản lưu';
    const meter = document.getElementById('cultivation-meter') as HTMLProgressElement;
    meter.max = gate;
    meter.value = Math.min(view?.cultivation ?? 0, gate);
    meter.setAttribute('aria-label', 'Tu vi Nội Giới Thiên Nghịch Châu');
    meter.title = 'Tầng nhỏ trong Ngưng Khí tự động tăng khi đủ Tu vi; bấm đột phá chủ động ở các mốc lớn.';
    const signature = JSON.stringify([view?.profileId, online, avatar, quests, g2.realmLabel, g2.stance.id, this.stageFilter]);
    if (signature !== this.signature) {
      this.signature = signature;
      const rewardEl = document.getElementById('quest-reward')!;
      rewardEl.textContent = `${current.status === 'completed' ? 'Đạo quả đã lĩnh' : 'Đạo quả Hồi này'} · `;
      if (current.rewardItems.length) {
        rewardEl.append(renderRewardSlots(current.rewardItems, true));
      } else {
        rewardEl.append(node('span', current.reward));
      }
      const doneCount = current.objectives.filter(objective => objective.done).length;
      const progress = node('p', `Tiến độ Hồi ${current.id}: ${doneCount} / ${current.objectives.length} mục tiêu hoàn thành`);
      progress.className = 'quest-objective-progress';
      document.getElementById('quest-objectives')!.replaceChildren(checklist(current, this.actions.guide, false), progress);
      progress.hidden = !current.objectives.length;
      if (this.journalList?.isConnected) this.renderCards(quests);
    }
    return current;
  }

  journal(container: HTMLElement, view?: SectView, questId?: SectQuest['id']): void {
    const list = node('section');
    list.className = 'quest-journal dao-destiny-codex';
    list.setAttribute('aria-label', 'Thiên Mệnh Chi Quyển · Danh sách 11 Hồi Mệnh Kiếp Chí');
    const allQuests = sectQuests(view);
    this.selectedQuest = questId ?? (this.selectedQuest || currentSectQuest(allQuests).id);
    this.journalList = list;
    container.append(list);
    this.renderCards(allQuests);
  }

  private renderCards(quests: SectQuest[]): void {
    if (!this.journalList) return;
    const focused = this.journalList.contains(document.activeElement)
      ? (document.activeElement as HTMLElement).closest<HTMLElement>('[data-quest]')?.dataset.quest
      : undefined;
    this.journalList.replaceChildren();

    const completedCount = quests.filter(q => q.status === 'completed').length;
    const filterBar = node('header');
    filterBar.className = 'dao-codex-filter-bar';
    const filterTabs = node('div');
    filterTabs.className = 'dao-codex-filter-tabs';
    const filters: { id: 'all' | 'stage1' | 'stage2'; label: string }[] = [
      { id: 'all', label: `📜 Toàn Quyển (${completedCount}/${quests.length} Hồi)` },
      { id: 'stage1', label: '⚔️ Quyển Thượng · Ngưng Khí → Trúc Cơ (VG01–VG06)' },
      { id: 'stage2', label: '⚡ Quyển Hạ · Quyết Minh Cốc → Kết Đan (VG07–VG11)' },
    ];
    for (const f of filters) {
      const btn = node('button', f.label);
      btn.type = 'button';
      btn.className = 'dao-codex-filter-btn';
      btn.dataset.active = String(this.stageFilter === f.id);
      btn.addEventListener('click', () => {
        this.stageFilter = f.id;
        this.renderCards(quests);
      });
      filterTabs.append(btn);
    }
    filterBar.append(filterTabs);
    this.journalList.append(filterBar);

    const filteredQuests = quests.filter(q => {
      if (this.stageFilter === 'stage1') return ['VG01', 'VG02', 'VG03', 'VG04', 'VG05', 'VG06'].includes(q.id);
      if (this.stageFilter === 'stage2') return ['VG07', 'VG08', 'VG09', 'VG10', 'VG11'].includes(q.id);
      return true;
    });

    if (!filteredQuests.some(q => q.id === this.selectedQuest)) {
      this.selectedQuest = (filteredQuests.find(q => q.status === 'active' || q.status === 'ready') ?? filteredQuests[0] ?? quests[0])!.id;
    }

    const codexSplit = node('div');
    codexSplit.className = 'dao-codex-split';
    const leftColumn = node('div');
    leftColumn.className = 'dao-codex-master-list';
    const rightScrollPane = node('div');
    rightScrollPane.className = 'dao-codex-scroll-pane';

    for (const quest of filteredQuests) {
      const isSelected = this.selectedQuest === quest.id;
      const catMeta = questCategoryMeta(quest.id);
      const card = node('article');
      card.className = 'quest-card dao-codex-card';
      card.dataset.quest = quest.id;
      card.dataset.state = quest.status;
      card.dataset.selected = String(isSelected);

      const heading = node('button');
      heading.type = 'button';
      heading.className = 'quest-card-select';
      heading.setAttribute('aria-expanded', String(isSelected));
      heading.setAttribute('aria-controls', `quest-detail-${quest.id}`);

      const portrait = node('img');
      portrait.src = quest.portrait;
      portrait.alt = quest.speaker;
      portrait.width = portrait.height = 44;
      portrait.style.cssText = `image-rendering:pixelated;object-fit:contain;border-radius:8px;border:1.5px solid ${catMeta.borderColor};background:rgba(12,20,30,0.92);padding:2px;flex-shrink:0;`;

      const label = node('span');
      label.className = 'quest-card-label ui-text-stack';

      const topBadgeRow = node('span');
      topBadgeRow.className = 'dao-card-badge-row';
      const idBadge = node('span', quest.id);
      idBadge.className = 'quest-card-id';
      const catTag = node('span');
      catTag.className = 'dao-card-cat-tag';
      catTag.style.cssText = `color:${catMeta.accentColor};border-color:${catMeta.borderColor};background:${catMeta.bgColor};`;
      catTag.innerHTML = `${catMeta.svg}<span>${catMeta.badgeText}</span>`;
      topBadgeRow.append(idBadge, catTag);

      const title = node('span', quest.title);
      title.className = 'quest-card-title';

      const statusLine = node('small');
      statusLine.className = `dao-card-status dao-status-${quest.status}`;
      const statusIcon =
        quest.status === 'completed' ? '✓ ' :
        quest.status === 'ready' ? '🎁 ' :
        quest.status === 'active' ? '▸ ' : '🔒 ';
      statusLine.textContent = `${statusIcon}${QUEST_STATUS_LABELS[quest.status]} · ${catMeta.realmText} · ${quest.speaker}`;

      label.append(topBadgeRow, title, statusLine);
      heading.append(portrait, label);

      heading.addEventListener('click', () => {
        this.selectedQuest = quest.id;
        this.actions.onSelectQuest?.(quest);
        this.renderCards(quests);
      });

      card.append(heading);
      leftColumn.append(card);

      const detail = this.buildScrollSheet(quest, isSelected);
      rightScrollPane.append(detail);

      if (focused === quest.id) heading.focus({ preventScroll: true });
    }

    codexSplit.append(leftColumn, rightScrollPane);
    this.journalList.append(codexSplit);
  }

  private buildScrollSheet(quest: SectQuest, isSelected: boolean): HTMLElement {
    const catMeta = questCategoryMeta(quest.id);
    const detail = node('div');
    detail.id = `quest-detail-${quest.id}`;
    detail.className = 'quest-card-detail dao-scroll-sheet ui-reading';
    detail.hidden = !isSelected;

    const sealWrap = node('div');
    sealWrap.className = 'dao-scroll-seal-wrap';
    sealWrap.innerHTML = questSealStampSvg(quest.status);
    detail.append(sealWrap);

    const scrollHeader = node('header');
    scrollHeader.className = 'dao-scroll-header';
    const catPill = node('div');
    catPill.className = 'dao-scroll-cat-pill';
    catPill.style.cssText = `display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:${catMeta.bgColor};border:1px solid ${catMeta.borderColor};color:${catMeta.accentColor};font-size:11px;font-weight:700;letter-spacing:0.06em;`;
    catPill.innerHTML = `${catMeta.svg}<span>${catMeta.badgeText} · ${catMeta.stageLabel}</span>`;

    const scrollTitle = node('h3', `${quest.id} · ${quest.title}`);
    scrollTitle.className = 'dao-scroll-title';

    const metaRow = node('div');
    metaRow.className = 'dao-scroll-meta-row';
    const realmChip = node('span', `⚡ Cảnh giới: ${catMeta.realmText}`);
    const locChip = node('span', `📍 Địa điểm: ${catMeta.locationLabel}`);
    const npcChip = node('span', `👤 Nhân vật: ${npcStationName(quest.stationId)}`);
    metaRow.append(realmChip, locChip, npcChip);

    scrollHeader.append(catPill, scrollTitle, metaRow);
    detail.append(scrollHeader);

    const loreBox = node('section');
    loreBox.className = 'dao-scroll-lore-box';
    const lorePortrait = node('img');
    lorePortrait.src = quest.portrait;
    lorePortrait.alt = quest.speaker;
    lorePortrait.width = lorePortrait.height = 60;
    lorePortrait.style.cssText = `image-rendering:pixelated;object-fit:contain;border-radius:10px;border:1.5px solid ${catMeta.borderColor};background:rgba(12,20,30,0.92);padding:3px;flex-shrink:0;`;
    const loreCopy = node('div');
    loreCopy.className = 'dao-scroll-lore-copy';
    const speakerTag = node('strong', `Lời dẫn Thiên Cơ · ${quest.speaker}`);
    speakerTag.style.cssText = 'color:#ffe39a;font-size:12px;letter-spacing:0.04em;display:block;margin-bottom:3px;';
    const voiceQuote = node('p', `“${quest.voiceover}”`);
    voiceQuote.style.cssText = 'font-style:italic;color:#fff4d6;font-size:13.5px;margin:0 0 6px 0;line-height:1.45;';
    const descP = node('p', quest.description);
    descP.style.cssText = 'margin:0;color:#c9dfd9;font-size:12.5px;line-height:1.5;';
    loreCopy.append(speakerTag, voiceQuote, descP);
    loreBox.append(lorePortrait, loreCopy);
    detail.append(loreBox);

    const section = (name: string, icon: string, content: HTMLElement): HTMLElement => {
      const group = node('section');
      group.className = 'ui-copy-section dao-scroll-section';
      const heading = node('h4');
      heading.className = 'ui-section-title dao-scroll-section-title';
      heading.innerHTML = `<span>${icon}</span><span>${name}</span>`;
      group.append(heading, content);
      return group;
    };

    const doneObjectives = quest.objectives.filter(o => o.done).length;
    detail.append(
      section(
        `Mục Tiêu Tu Hành (${doneObjectives}/${quest.objectives.length} hoàn thành · Bấm vào mục tiêu để tự tìm đường)`,
        '⚔️',
        checklist(quest, () => {
          if (this.actions.onPrimaryQuestAction) this.actions.onPrimaryQuestAction(quest);
          else this.actions.guide();
        }, true),
      ),
    );

    const nextStepCard = node('div');
    nextStepCard.className = 'dao-scroll-next-step';
    nextStepCard.append(node('strong', '🧭 Chỉ dẫn bước tiếp theo: '), node('span', quest.nextStep));
    detail.append(section('Thiên Cơ Chỉ Lộ', '🧭', nextStepCard));

    const rewardWrap = node('div');
    const reward = node('p', quest.reward);
    reward.className = 'quest-card-reward';
    reward.style.cssText = 'margin:0 0 6px 0;color:#ffe298;font-size:12.5px;font-weight:600;';
    rewardWrap.append(reward);
    if (quest.rewardItems.length) {
      rewardWrap.append(renderRewardSlots(quest.rewardItems, false));
    }
    detail.append(section(quest.status === 'completed' ? 'Đạo Quả Đã Viên Mãn' : 'Đạo Quả & Vật Phẩm Thưởng', '🎁', rewardWrap));

    const ctaBar = node('footer');
    ctaBar.className = 'dao-scroll-cta-bar';
    const primaryBtn = node('button');
    primaryBtn.type = 'button';
    primaryBtn.className = 'sect-chapter-route dao-scroll-primary-btn';
    const targetShort = npcStationName(quest.stationId).split(' · ')[0]!;
    if (quest.status === 'completed') {
      primaryBtn.textContent = `✓ ${quest.id} Đã Viên Mãn · Tầm Lộ Tới ${targetShort}`;
    } else if (quest.status === 'ready') {
      primaryBtn.textContent = `🎁 Lĩnh Nhận Đạo Quả ${quest.id} Ngay`;
    } else if (quest.id === 'VG01') {
      primaryBtn.textContent = `🧭 Tự Tìm Đường Thực Hiện ${quest.id} Tại ${targetShort}`;
    } else {
      primaryBtn.textContent = `⚔️ Tiến Vào Bí Cảnh 2D · ${quest.id} (Hoặc Tìm Đường Tới ${targetShort})`;
    }
    primaryBtn.addEventListener('click', () => {
      if (this.actions.onPrimaryQuestAction) this.actions.onPrimaryQuestAction(quest);
      else this.actions.guide();
    });
    ctaBar.append(primaryBtn);

    if (this.actions.onOpenChapter) {
      const secondaryBtn = node('button', `🔮 Mở Nội Giới & Lò Đan Lý Mộ Uyển (${quest.id} · Phím H)`);
      secondaryBtn.type = 'button';
      secondaryBtn.className = 'dao-scroll-secondary-btn';
      secondaryBtn.addEventListener('click', () => this.actions.onOpenChapter?.(quest));
      ctaBar.append(secondaryBtn);
    }
    detail.append(ctaBar);

    return detail;
  }
}
