import { CULTIVATION_GATE, progressionLabel, type SectView } from '../../shared/sect';
import { currentSectQuest, QUEST_STATUS_LABELS, sectQuests, type SectQuest } from '../../shared/sect-quests';
import type { AvatarId } from '../../shared/profiles';

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] => {
  const result = document.createElement(tag); if (text) result.textContent = text; return result;
};
function checklist(quest: SectQuest): HTMLOListElement {
  const list = node('ol'); list.className = 'quest-checklist';
  for (const objective of quest.objectives) {
    const item = node('li'), mark = node('span', objective.done ? '✓' : '○');
    mark.className = 'quest-check'; mark.setAttribute('aria-hidden', 'true');
    item.dataset.complete = String(objective.done); item.dataset.objective = objective.id;
    item.append(mark, node('span', `${objective.text}${objective.done ? ' · đã xong' : ''}`)); list.append(item);
  }
  return list;
}
export class QuestUI {
  private signature = '';
  private journalList?: HTMLElement;
  private selectedQuest = '';
  private tracker = document.getElementById('sect-objective')!;
  constructor(actions: { journal: () => void; guide: () => void }) {
    document.getElementById('journal')!.addEventListener('click', actions.journal);
    document.getElementById('quest-guide')!.addEventListener('click', actions.guide);
    const toggle = document.getElementById('quest-toggle') as HTMLButtonElement;
    toggle.addEventListener('click', () => {
      const body = document.getElementById('quest-tracker-body')!;
      body.hidden = !body.hidden; toggle.setAttribute('aria-expanded', String(!body.hidden));
      toggle.textContent = body.hidden ? 'Mở' : 'Gọn';
    });
  }
  update(view: SectView | undefined, online: boolean, avatar: AvatarId): SectQuest {
    const quests = sectQuests(view), current = currentSectQuest(quests);
    const syncing = online && !view;
    const label = document.getElementById('quest-state')!;
    label.textContent = syncing ? 'Đang đồng bộ' : !online ? 'Chưa kết nối' : QUEST_STATUS_LABELS[current.status];
    label.dataset.state = online ? current.status : 'offline';
    this.tracker.dataset.quest = current.id;
    this.tracker.dataset.online = String(online);
    const guide = document.getElementById('quest-guide') as HTMLButtonElement;
    guide.disabled = syncing || current.status === 'unreleased';
    guide.textContent = !online ? 'Vào sân để tiếp tục' : current.status === 'ready' ? 'Về NPC xác nhận' : 'Gặp người hướng dẫn';
    guide.title = current.status === 'unreleased' ? 'Ngoại vi và HN05 chưa được triển khai' : 'Chỉ đường hoặc mở đối thoại khi đã ở gần NPC; không tự di chuyển';
    document.getElementById('quest-next')!.textContent = syncing ? 'Đang đọc hành trình đã lưu…' : !online ?
      'Vào sân chung để nhận / tiếp tục nhiệm vụ. Tiến độ của mỗi nhân vật lưu riêng.' : current.nextStep;
    const completed = quests.filter(quest => quest.status === 'completed').length;
    document.getElementById('quest-chapter-progress')!.textContent = `${completed}/4 nhiệm vụ`;
    document.getElementById('quest-reward')!.textContent = current.status === 'unreleased' ? 'Ngoại vi chưa mở trong bản này' :
      `${current.status === 'completed' ? 'Đã ghi nhận' : 'Thưởng lần đầu'} · ${current.reward}`;
    document.getElementById('cultivation-summary')!.textContent = view ?
      `${progressionLabel(avatar, view.level).replace(' · mốc gameplay', '')} · ${avatar === 'CHR-SITU-NAN' ? 'Tích lũy hồi phục' : 'Tu vi'} ${view.cultivation} / ${CULTIVATION_GATE}` :
      'Hành trình riêng · đang chờ bản lưu';
    const meter = document.getElementById('cultivation-meter') as HTMLProgressElement;
    meter.max = CULTIVATION_GATE; meter.value = Math.min(view?.cultivation ?? 0, CULTIVATION_GATE);
    meter.setAttribute('aria-label', avatar === 'CHR-SITU-NAN' ? 'Tích lũy hồi phục nền' : 'Tu vi nền');
    meter.title = 'Tích lũy và xác nhận tầng là hai việc riêng. Phần thưởng vượt cổng vẫn được giữ trong bản lưu.';
    const signature = JSON.stringify([view?.profileId, online, avatar, quests]);
    if (signature !== this.signature) {
      this.signature = signature;
      const progress = node('p', `${current.objectives.filter(objective => objective.done).length} / ${current.objectives.length} điều kiện đã đạt`);
      progress.className = 'quest-objective-progress';
      document.getElementById('quest-objectives')!.replaceChildren(checklist(current), progress);
      progress.hidden = !current.objectives.length;
      if (this.journalList?.isConnected) this.renderCards(quests);
    }
    return current;
  }
  journal(container: HTMLElement, view?: SectView, questId?: SectQuest['id']): void {
    const list = node('section'); list.className = 'quest-journal'; list.setAttribute('aria-label', 'Danh sách nhiệm vụ Hằng Nhạc');
    this.selectedQuest = questId??currentSectQuest(sectQuests(view)).id;
    this.journalList = list; container.append(list); this.renderCards(sectQuests(view));
  }
  private renderCards(quests: SectQuest[]): void {
    const focused = this.journalList!.contains(document.activeElement) ? (document.activeElement as HTMLElement).closest<HTMLElement>('[data-quest]')?.dataset.quest : undefined;
    this.journalList!.replaceChildren();
    for (const quest of quests) {
      const card = node('article'); card.className = 'quest-card'; card.dataset.quest = quest.id; card.dataset.state = quest.status;
      const heading = node('button'); heading.type = 'button'; heading.className = 'quest-card-select';
      heading.setAttribute('aria-expanded', String(this.selectedQuest === quest.id));
      heading.setAttribute('aria-controls', `quest-detail-${quest.id}`);
      const id = node('span', quest.id); id.className = 'quest-card-id';
      const label = node('span'); label.className = 'quest-card-label ui-text-stack';
      const title = node('span', quest.title); title.className = 'quest-card-title';
      label.append(title, node('small', QUEST_STATUS_LABELS[quest.status]));
      heading.append(id, label);
      const detail = node('div'); detail.id = `quest-detail-${quest.id}`; detail.className = 'quest-card-detail ui-reading'; detail.hidden = this.selectedQuest !== quest.id;
      heading.addEventListener('click', () => {
        this.selectedQuest = this.selectedQuest === quest.id ? '' : quest.id;
        this.journalList!.querySelectorAll<HTMLElement>('.quest-card').forEach(item => {
          const expanded = item.dataset.quest === this.selectedQuest;
          item.querySelector('button')!.setAttribute('aria-expanded', String(expanded));
          item.querySelector<HTMLElement>('.quest-card-detail')!.hidden = !expanded;
        });
      });
      const section = (name: string, content: HTMLElement): HTMLElement => {
        const group = node('section'); group.className = 'ui-copy-section';
        const heading = node('h4', name); heading.className = 'ui-section-title';
        group.append(heading, content); return group;
      };
      const reward = node('p', quest.reward); reward.className = 'quest-card-reward';
      detail.append(section('Lời dẫn', node('p', quest.description)),
        section('Mục tiêu', checklist(quest)), section('Bước tiếp theo', node('p', quest.nextStep)),
        section(quest.status === 'completed' ? 'Phần thưởng đã nhận' : 'Phần thưởng lần đầu', reward));
      card.append(heading, detail);
      this.journalList!.append(card);
      if (focused === quest.id) heading.focus({ preventScroll: true });
    }
  }
}
