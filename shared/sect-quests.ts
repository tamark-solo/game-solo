import { LESSON_REWARD } from './lesson-contracts';
import type { SectView, StationId } from './sect';

// Read-only presentation of server-confirmed progress. No rewards or commands are applied here.
export type SectQuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'completed' | 'unreleased';
export interface SectQuest {
  id: 'HN01' | 'HN02' | 'HN03' | 'HN04' | 'HN05';
  title: string;
  stationId: StationId;
  description: string;
  reward: string;
  status: SectQuestStatus;
  objectives: { id: string; text: string; done: boolean }[];
  nextStep: string;
}
export const QUEST_STATUS_LABELS: Record<SectQuestStatus, string> = {
  locked: 'Chưa mở', available: 'Có thể nhận', active: 'Đang thực hiện',
  ready: 'Chờ xác nhận', completed: 'Đã hoàn thành', unreleased: 'Chưa triển khai',
};
const status = (unlocked: boolean, completed: boolean, started: boolean, ready: boolean): SectQuestStatus =>
  completed ? 'completed' : !unlocked ? 'locked' : ready ? 'ready' : started ? 'active' : 'available';

export function sectQuests(view?: SectView): SectQuest[] {
  const lessons = view?.lessons;
  const hn01 = !!view?.hn01, hn02 = !!view?.hn02, hn03 = !!lessons?.hn03, hn04 = !!lessons?.hn04;
  const artsReady = !!(lessons?.basic && lessons.sword && lessons.thunder);
  const avoidReady = !!(lessons?.walk && lessons.wind);
  const cycleStep = view?.cycleStep ?? 0;
  return [
    { id: 'HN01', title: 'Bước vào Hằng Nhạc', stationId: 'guide',
      description: 'Gặp người tiếp dẫn ở sân môn phái để bắt đầu hành trình của nhân vật này.',
      reward: '2 vật tư hồi phục · mở hành trình nhập môn',
      status: status(true, hn01, false, false),
      objectives: [{ id: 'intro', text: 'Nói chuyện và nhận hướng dẫn từ người tiếp dẫn', done: hn01 }],
      nextStep: hn01 ? 'Hướng dẫn nhập môn đã được lưu.' : 'Tới người tiếp dẫn, nhấn E và chọn “Nhận hướng dẫn nhập môn”.' },
    { id: 'HN02', title: 'Một vòng vận hành', stationId: 'cultivation',
      description: 'Ổn định nền vận khí, hiểu tu vi khác linh lực và tự xác nhận mốc đầu.',
      reward: '100 tích lũy · M01 · hoạt động thổ nạp / hồi phục nền',
      status: status(hn01, hn02, view?.foundation !== undefined && view.foundation !== 'none', cycleStep === 4),
      objectives: [
        { id: 'foundation', text: 'Chọn nền vận hành tại vườn thổ nạp', done: hn02 || !!view && view.foundation !== 'none' },
        ...['Hít — ổn định', 'Dẫn — vận hành', 'Thu — giữ nhịp'].map((text, index) =>
          ({ id: `cycle-${index}`, text: `Xác nhận nhịp ${index + 1}/3: ${text}`, done: hn02 || cycleStep > index })),
        { id: 'understanding', text: 'Phân biệt tích lũy dài hạn với linh lực thi triển', done: hn02 || cycleStep === 4 },
      ],
      nextStep: hn02 ? 'M01 đã lưu. Có thể chọn thổ nạp hoặc hồi phục nền.' : !hn01 ? 'Hoàn thành HN01 trước.' :
        cycleStep === 4 ? 'Đã đủ điều kiện. Nói chuyện với người hướng dẫn vận khí để xác nhận M01.' :
        cycleStep === 3 ? 'Trả lời câu hỏi về nguồn lực dài hạn tại người hướng dẫn vận khí.' :
        view?.cycleStatus === 'ready' ? 'Nhịp đã ổn định. Nhấn E và xác nhận nhịp hiện tại.' :
        view?.cycleReadyAt ? 'Đứng yên gần người hướng dẫn đủ một nhịp, rồi tự xác nhận.' :
        'Tới vườn thổ nạp, nhấn E và chọn bắt đầu / tiếp tục vòng vận khí.' },
    { id: 'HN03', title: 'Vận dụng thuật nền', stationId: 'training',
      description: 'Vận dụng đòn thường, Kiếm Khí và Lôi Ấn trên mục tiêu riêng của bài đã nhận.',
      reward: `${LESSON_REWARD} tích lũy · nhận một lần khi xác nhận`,
      status: status(hn02, hn03, lessons?.active === 'arts' || !!(lessons?.basic || lessons?.sword || lessons?.thunder), artsReady),
      objectives: [
        { id: 'basic', text: 'F · Đánh thường trúng mục tiêu của bài (0 MP)', done: !!lessons?.basic },
        { id: 'sword', text: '1 · Kiếm Khí trúng mục tiêu theo hướng ngắm', done: !!lessons?.sword },
        { id: 'thunder', text: '2 · Lôi Ấn trúng mục tiêu đã chọn', done: !!lessons?.thunder },
      ],
      nextStep: hn03 ? 'Bài vận dụng thuật nền đã được lưu.' : !hn02 ? 'Hoàn thành HN02 và xác nhận M01 trước.' :
        artsReady ? 'Đủ ba đòn hợp lệ. Quay lại người coi luyện thuật, nhấn E để xác nhận và nhận thưởng.' :
        lessons?.active === 'arts' ? 'Chọn mục tiêu của bài; dùng F ở cự ly gần, 1 Kiếm và 2 Lôi. Chỉ hit được server xác nhận mới tính.' :
        'Tới sân luyện phía đông, nhấn E và nhận / tiếp tục bài HN03. Mục tiêu luyện tự do không tính.' },
    { id: 'HN04', title: 'Nhìn đòn mà tiến', stationId: 'training',
      description: 'Đọc vòng báo trước, né bằng đi bộ rồi vận dụng Ngự Phong Bộ trong bài an toàn.',
      reward: `${LESSON_REWARD} tích lũy · nhận một lần khi xác nhận`,
      status: status(hn03, hn04, lessons?.active === 'avoid' || !!(lessons?.walk || lessons?.wind), avoidReady),
      objectives: [
        { id: 'walk', text: 'Đi bộ ra ngoài vòng trước lúc server xét đòn', done: !!lessons?.walk },
        { id: 'wind', text: '3 · Phong đưa chân ra ngoài vòng đúng lúc', done: !!lessons?.wind },
      ],
      nextStep: hn04 ? 'Bài đọc báo đòn và di chuyển đã được lưu.' : !hn03 ? 'Xác nhận hoàn thành HN03 trước.' :
        avoidReady ? 'Đủ hai cách né. Quay lại người coi luyện thuật, nhấn E để xác nhận và nhận thưởng.' :
        view?.lessonView?.status === 'warning' ? 'Rời cả vòng báo trước theo phương thức của bài. Bài an toàn không gây mất HP.' :
        'Tới người coi luyện thuật để bắt đầu / thử lại phần còn thiếu. Credit đã lưu được giữ nguyên.' },
    { id: 'HN05', title: 'Ra khỏi sân luyện', stationId: 'training',
      description: 'Chặng ngoại vi và encounter riêng là nội dung tiếp theo; chưa có trong bản đang chạy.',
      reward: 'Chưa mở phần thưởng hoặc M02', status: 'unreleased', objectives: [],
      nextStep: 'Bản hiện tại dừng ở HN04. Có thể luyện tự do và thổ nạp; chưa có cổng ngoại vi.' },
  ];
}
export function currentSectQuest(quests: SectQuest[]): SectQuest {
  return quests.find(quest => quest.status !== 'completed' && quest.status !== 'locked') ?? quests[quests.length - 1]!;
}
