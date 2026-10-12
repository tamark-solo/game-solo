import { CHARACTER_INFO, type AvatarId } from '../../../shared/profiles';

// Deliberately local to the design page: these are not gameplay definitions,
// save schemas, approved item art, slot rules, or balance values.
export type ItemKind = 'gear' | 'consumable' | 'material' | 'manual' | 'quest' | 'artifact';
export type IconKind = 'sword' | 'robe' | 'jade' | 'pill' | 'herb' | 'ore' | 'book' | 'seal' | 'pearl';
export type PreviewSlot = 'weapon' | 'robe' | 'charm';
export type Scenario = 'ready' | 'empty' | 'many' | 'long' | 'loading' | 'offline' | 'save-error';
export interface PreviewItem {
  id: string; name: string; kind: ItemKind; icon: IconKind; quantity: number;
  description: string; effect: string; source: string; slot?: PreviewSlot;
  hp?: number; mp?: number; requirement?: string; protected?: boolean;
}
export interface PreviewProfile {
  avatar: AvatarId; hp: number; mp: number; items: PreviewItem[];
  equipped: Partial<Record<PreviewSlot, string>>;
}
export const SLOT_LABELS: Record<PreviewSlot, string> = { weapon: 'Vũ khí', robe: 'Pháp y', charm: 'Ngọc sức' };
export const KIND_LABELS: Record<ItemKind, string> = { gear: 'Trang bị', consumable: 'Vật tư', material: 'Nguyên liệu', manual: 'Tư liệu', quest: 'Nhiệm vụ', artifact: 'Pháp bảo' };
const BASE: PreviewItem[] = [
  { id: 'wood-sword', name: 'Mộc kiếm nhập môn', kind: 'gear', icon: 'sword', quantity: 1, slot: 'weapon', mp: 0,
    effect: 'Linh lực tối đa +0', description: 'Kiếm gỗ dùng trong những buổi luyện thuật đầu tiên. Nhẹ, giản dị, vừa tay người nhập môn.', source: 'Trang bị khởi đầu · mẫu' },
  { id: 'jade-sword', name: 'Thanh Ngọc Kiếm', kind: 'gear', icon: 'sword', quantity: 1, slot: 'weapon', mp: 8,
    effect: 'Linh lực tối đa +8', description: 'Một đường ngọc xanh chạy dọc thân kiếm. Khi vận khí, đường ngọc hắt lên ánh sáng dịu.', source: 'Phần thưởng luyện thuật · mẫu' },
  { id: 'plain-robe', name: 'Áo vải môn phái', kind: 'gear', icon: 'robe', quantity: 1, slot: 'robe', hp: 0,
    effect: 'Sinh lực tối đa +0', description: 'Áo vải sạch, thêu một vân mây ở cổ tay. Món đang dùng trong bố cục minh họa.', source: 'Trang bị khởi đầu · mẫu' },
  { id: 'cloud-robe', name: 'Vân Văn Pháp Y', kind: 'gear', icon: 'robe', quantity: 1, slot: 'robe', hp: 12,
    effect: 'Sinh lực tối đa +12', description: 'Vân mây được dệt vào lớp áo ngoài. Pháp y có hiệu ứng bảo vệ để thử cách so sánh trang bị.', source: 'Khảo nghiệm môn phái · mẫu' },
  { id: 'jade-charm', name: 'Ngọc bội tĩnh tâm', kind: 'gear', icon: 'jade', quantity: 1, slot: 'charm', mp: 6,
    effect: 'Linh lực tối đa +6', description: 'Miếng ngọc bội nhỏ, buộc bằng dây xanh sẫm. Vân ngọc trong lòng như một vòng khí đang tĩnh lại.', source: 'Cơ duyên trên đường · mẫu' },
  { id: 'lotus-pill', name: 'Vật tư hồi phục', kind: 'consumable', icon: 'pill', quantity: 8, hp: 30,
    effect: 'Hồi 30 sinh lực', description: 'Vật tư chuẩn bị cho buổi luyện tập. Bản mẫu chỉ thử thao tác dùng một đơn vị; không gửi lệnh vào game.', source: 'Chuẩn bị tại môn phái · mẫu' },
  { id: 'spirit-pill', name: 'Linh dịch', kind: 'consumable', icon: 'pearl', quantity: 3, mp: 20,
    effect: 'Hồi 20 linh lực', description: 'Linh dịch trong bình ngọc. Số liệu và công dụng là dữ liệu mẫu để kiểm bố cục vật tư.', source: 'Dữ liệu thiết kế · mẫu' },
  { id: 'herb', name: 'Thanh Linh Thảo', kind: 'material', icon: 'herb', quantity: 24,
    effect: 'Nguyên liệu', description: 'Cành thảo dược có sắc xanh nhạt. Nguyên liệu được gộp số lượng trong bản mẫu hành trang.', source: 'Ngoại vi môn phái · mẫu' },
  { id: 'ore', name: 'Huyền thiết', kind: 'material', icon: 'ore', quantity: 6,
    effect: 'Nguyên liệu', description: 'Khoáng thạch sẫm màu với những đường ánh kim. Chưa có thao tác chế tạo trong bản mẫu.', source: 'Ngoại vi môn phái · mẫu' },
  { id: 'manual', name: 'Ghi chép vận khí', kind: 'manual', icon: 'book', quantity: 1,
    effect: 'Tư liệu học thuật', description: 'Một tập ghi chép dùng làm ví dụ cách trình bày tư liệu. Ba thuật R01 hiện có từ đầu; tập này không mở khóa kỹ năng.', source: 'Dữ liệu thiết kế · mẫu' },
  { id: 'sect-seal', name: 'Tín vật môn phái', kind: 'quest', icon: 'seal', quantity: 1, protected: true,
    effect: 'Vật phẩm nhiệm vụ', description: 'Tín vật minh họa cho nhóm vật phẩm liên quan hành trình. Giữ riêng nhãn nhiệm vụ để không nhầm với đồ có thể trang bị.', source: 'Hành trình nhập môn · mẫu' },
  { id: 'cloud-pearl', name: 'Vân Khí Châu', kind: 'artifact', icon: 'pearl', quantity: 1, requirement: 'Cần hoàn tất luyện hóa trước khi sử dụng.',
    effect: 'Pháp bảo chưa luyện hóa', description: 'Một viên châu mẫu để thử trạng thái chưa đủ điều kiện. Đây không phải Thiên Nghịch Châu hoặc pháp bảo đã được cấp trong game.', source: 'Dữ liệu thiết kế · mẫu' },
];
export function createPreviewProfile(avatar: AvatarId): PreviewProfile {
  return { avatar, hp: 72, mp: 84, items: BASE.map(item => ({ ...item })), equipped: { weapon: 'wood-sword', robe: 'plain-robe' } };
}
export function displayedItems(profile: PreviewProfile, scenario: Scenario): PreviewItem[] {
  if (scenario === 'empty') return [];
  if (scenario === 'many') return Array.from({ length: 120 }, (_, n) => ({ ...profile.items[n % profile.items.length], id: `many-${n}`, slot: undefined, kind: 'material', effect: 'Món mẫu để kiểm cuộn', name: `${profile.items[n % profile.items.length].name} · ${n + 1}` }));
  if (scenario === 'long') return profile.items.map(item => item.id === 'jade-sword' ? { ...item,
    name: 'Thanh Ngọc Kiếm khắc vân mây dành cho buổi khảo nghiệm thuật pháp tại Hằng Nhạc',
    description: `${item.description} Đây là đoạn mô tả dài để thử khả năng xuống dòng, khoảng cách giữa các nhóm nội dung và thao tác khi cuộn. `.repeat(5) + 'ChuỗiKhôngCóKhoảngTrắngDùngĐểKiểmTraBốCụcHànhTrangKhôngTrànKhỏiKhung.' } : item);
  return profile.items;
}
export function maxResources(profile: PreviewProfile): { hp: number; mp: number } {
  const equipped = Object.values(profile.equipped).map(id => profile.items.find(item => item.id === id));
  return { hp: 100 + equipped.reduce((sum, item) => sum + (item?.hp ?? 0), 0), mp: 100 + equipped.reduce((sum, item) => sum + (item?.mp ?? 0), 0) };
}
export function progressCopy(avatar: AvatarId): { label: string; stage: string; next: string } {
  return CHARACTER_INFO[avatar].progressionKind === 'recovery'
    ? { label: 'Tích lũy hồi phục', stage: 'Linh thể · đang phục hồi hiện diện', next: 'Củng cố khả năng hiện diện và vận dụng thuật.' }
    : { label: 'Tu vi tích lũy', stage: 'Ngưng Khí · tầng 1 · mẫu', next: 'Ổn định vận khí, chuẩn bị cho bài luyện thuật.' };
}
