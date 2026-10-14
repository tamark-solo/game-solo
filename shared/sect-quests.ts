import type { SectView, StationId } from './sect';
import {G2_ACTS,initialChapter,readG2State,type ChapterQuestId,type G2ActId,type G2RewardItem} from './chapter';

// Read-only presentation of server-confirmed G2 Mệnh Kiếp Chí (VG01–VG11).
export type SectQuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'completed' | 'unreleased';
export type SectQuestId = G2ActId | ChapterQuestId;
export interface SectQuest {
  id: SectQuestId;
  chapterId?: ChapterQuestId;
  title: string;
  stationId: StationId;
  description: string;
  reward: string;
  speaker: string;
  portrait: string;
  voiceover: string;
  rewardItems: G2RewardItem[];
  status: SectQuestStatus;
  objectives: { id: string; text: string; done: boolean }[];
  nextStep: string;
}
export const QUEST_STATUS_LABELS: Record<SectQuestStatus, string> = {
  locked: 'Chưa mở', available: 'Có thể nhận', active: 'Đang thực hiện',
  ready: 'Chờ ghi nhận đạo quả', completed: 'Đã viên mãn', unreleased: 'Chưa triển khai',
};

const actStation = (id: G2ActId, view?: SectView): StationId => {
  if (id === 'VG01') {
    if (!view?.hn01) return 'guide';
    if (!view?.hn02) return 'cultivation';
    return 'training';
  }
  if (id === 'VG03' || id === 'VG07' || id === 'VG11') return 'cultivation';
  if (id === 'VG05' || id === 'VG09') return 'preparation';
  return 'training';
};

export function sectQuests(view?: SectView): SectQuest[] {
  const c = view?.chapter ?? initialChapter();
  const g2 = readG2State(view ? { ...view, chapter: c } : { chapter: c });
  const doneSet = new Set<G2ActId>(g2.completedActs);
  return G2_ACTS.map((act): SectQuest => {
    const isDone = doneSet.has(act.id);
    const isCurrent = !isDone && act.id === g2.currentActId;
    const q = act.chapterQuest;
    const vg01Ready = act.id === 'VG01' && !!view?.hn01 && !!view?.hn02 && !!(view?.lessons?.basic || view?.lessons?.sword || view?.lessons?.thunder);
    const hasProof = isDone || vg01Ready || (q ? c.facts.includes(`${q}-proof`) : false);
    const questStatus: SectQuestStatus =
      isDone ? 'completed' :
      hasProof ? 'ready' :
      isCurrent ? 'active' : 'locked';
    const objectives = act.objectives.map((obj, idx) => {
      let objDone = isDone;
      if (!isDone && act.id === 'VG01') {
        if (idx === 0) objDone = !!view?.hn01;
        else if (idx === 1) objDone = !!view?.hn02;
        else objDone = !!view?.lessons?.hn04 || vg01Ready;
      } else if (!isDone && hasProof && idx === 0) {
        objDone = true;
      }
      return { id: obj.id, text: obj.text, done: objDone };
    });
    const stationId = actStation(act.id, view);
    const npcLabel =
      stationId === 'guide' ? 'Trần Duy (Cổng Vân Liệt)' :
      stationId === 'cultivation' ? 'Diệp Tĩnh (Thềm Tụ Khí)' :
      stationId === 'preparation' ? 'Lý Mộ Uyển / Bạch Chỉ (Dược Viên)' : 'Tạ Kiếm Sơn (Bãi Tập Kiếm)';
    const nextStep = isDone
      ? `${act.id} đã viên mãn · Đạo quả đã lưu và tự động nối mạch hồi tiếp theo.`
      : hasProof
      ? `Khảo nghiệm ${act.id} đã hoàn tất! Bấm trực tiếp vào khung Nhiệm vụ (hoặc phím E tại ${npcLabel}) để nhận Đạo Quả!`
      : isCurrent && act.id === 'VG01'
      ? (!view?.hn01
          ? `Bấm vào khung Nhiệm vụ để tự động chạy tới ${npcLabel}, nhấn E nhặt Châu Đá Ngũ Vân (Thiên Nghịch Châu Mốc I).`
          : !view?.hn02
          ? `Bấm vào khung Nhiệm vụ để chạy tới ${npcLabel}, nhấn E khai mạch Ngưng Khí & lĩnh Thanh Phong Linh Kiếm.`
          : `Bấm vào khung Nhiệm vụ để chạy tới ${npcLabel}, nhấn E triệu hồi Khôi Lỗi Rạn Ngọc và dùng phím 1/2/F đánh trúng!`)
      : isCurrent
      ? `Bấm vào khung Nhiệm vụ để tự động chạy tới ${npcLabel} (hoặc nhấn E) tiến vào Bí Cảnh ${act.id} (${act.realmRange}).`
      : `Hoàn tất hồi trước trong Mệnh Kiếp Chí để mở khóa ${act.id} (${act.realmRange}).`;
    return {
      id: act.id,
      ...(q ? { chapterId: q } : {}),
      title: act.title,
      stationId,
      description: `${act.description} (${act.realmRange})`,
      reward: act.reward,
      speaker: act.speaker,
      portrait: act.portrait,
      voiceover: act.voiceover,
      rewardItems: act.rewardItems,
      status: questStatus,
      objectives,
      nextStep,
    };
  });
}

export function currentSectQuest(quests: SectQuest[]): SectQuest {
  return quests.find(quest => quest.status !== 'completed' && quest.status !== 'locked') ??
    quests.find(quest => quest.status !== 'completed') ?? quests[quests.length - 1]!;
}
