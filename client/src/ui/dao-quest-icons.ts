import type { SectQuestStatus } from '@shared/sect-quests';

export type QuestCategoryKind = 'destiny' | 'boss_hunt' | 'inner_world' | 'alchemy_fate' | 'tribulation';
export type ObjectiveActionKind = 'talk' | 'combat' | 'gather' | 'alchemy' | 'breakthrough';

export interface QuestCategoryMeta {
  kind: QuestCategoryKind;
  badgeText: string;
  stageLabel: string;
  realmText: string;
  locationLabel: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  svg: string;
}

export interface ObjectiveActionMeta {
  kind: ObjectiveActionKind;
  shortLabel: string;
  ctaLabel: string;
  accentColor: string;
  svg: string;
}

const CATEGORY_SVGS: Record<QuestCategoryKind, string> = {
  destiny: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
    <rect x="4" y="3" width="16" height="18" rx="2.5" fill="rgba(235,196,108,0.16)" stroke="currentColor" stroke-width="1.6"/>
    <path d="M2.5 5.5h19M2.5 18.5h19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="3.4" stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 8.6v6.8M8.6 12h6.8" stroke="currentColor" stroke-width="1.2" opacity="0.8"/>
  </svg>`,
  boss_hunt: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
    <path d="M4 20L19.5 4.5M15 4h5v5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 20L4.5 4.5M9 4H4v5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="12,8.5 14.8,12 12,15.5 9.2,12" fill="rgba(242,110,98,0.28)" stroke="currentColor" stroke-width="1.4"/>
  </svg>`,
  inner_world: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
    <circle cx="12" cy="12" r="8.5" fill="rgba(104,218,236,0.14)" stroke="currentColor" stroke-width="1.6"/>
    <path d="M12 3.5a4.25 4.25 0 0 1 0 8.5 4.25 4.25 0 0 0 0 8.5" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="12" cy="7.8" r="1.4" fill="currentColor"/>
    <circle cx="12" cy="16.2" r="1.4" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,
  alchemy_fate: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
    <path d="M7 9h10l1.5 6.5a4.5 4.5 0 0 1-4.4 5.5H9.9a4.5 4.5 0 0 1-4.4-5.5L7 9Z" fill="rgba(102,222,174,0.16)" stroke="currentColor" stroke-width="1.6"/>
    <path d="M9 5.5h6M12 3v2.5M6 21l2-1.5M18 21l-2-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="12" cy="14.5" r="2.2" fill="currentColor" opacity="0.85"/>
  </svg>`,
  tribulation: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
    <polygon points="13.5,2.5 6,13 11.5,13 9.5,21.5 18.5,10.5 12.8,10.5" fill="rgba(210,164,255,0.24)" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/>
  </svg>`,
};

const OBJECTIVE_SVGS: Record<ObjectiveActionKind, string> = {
  talk: `<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none">
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h8a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 14 13H9l-3.5 3v-3H6a2.5 2.5 0 0 1-2.5-2.5v-5Z" fill="rgba(235,196,108,0.16)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M7 7.5h6M7 10h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,
  combat: `<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none">
    <path d="M3.5 16.5L16 4M12 3.5h4.5V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.5 16.5L4 4M8 3.5H3.5V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="10" cy="10" r="2.1" fill="currentColor"/>
  </svg>`,
  gather: `<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none">
    <path d="M10 17V9M10 12c-3.5 0-5.5-2.5-5.5-6 3.5 0 5.5 2.2 5.5 6ZM10 10.5c3.2 0 5.2-2.2 5.2-5.5-3.2 0-5.2 2-5.2 5.5Z" fill="rgba(116,228,184,0.2)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  alchemy: `<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none">
    <circle cx="10" cy="10" r="6.5" fill="rgba(235,196,108,0.16)" stroke="currentColor" stroke-width="1.5"/>
    <polygon points="10,5.5 13.8,10 10,14.5 6.2,10" fill="currentColor" opacity="0.85"/>
  </svg>`,
  breakthrough: `<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none">
    <polygon points="11,2 5,10.8 9.6,10.8 8.2,18 15.2,9 10.6,9" fill="rgba(255,216,118,0.26)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
};

const QUEST_META_TABLE: Record<string, Omit<QuestCategoryMeta, 'svg'>> = {
  VG01: {
    kind: 'destiny',
    badgeText: 'CHÍNH TUYẾN · NHẬP MÔN',
    stageLabel: 'Chặng 1 · Hằng Nhạc Tông',
    realmText: 'Ngưng Khí 1 → 3',
    locationLabel: 'Cổng Vân Liệt → Tụ Khí Đài → Bãi Tập',
    accentColor: '#f5d27a',
    bgColor: 'rgba(92, 68, 22, 0.42)',
    borderColor: 'rgba(245, 210, 122, 0.55)',
  },
  VG02: {
    kind: 'boss_hunt',
    badgeText: 'BÍ CẢNH · TRẢM YÊU',
    stageLabel: 'Chặng 1 · Ngoại Vi Hằng Nhạc',
    realmText: 'Ngưng Khí 4 → 6',
    locationLabel: 'Bí Cảnh Ngoại Vi · Vân Nha Lang Vương',
    accentColor: '#ff9b8a',
    bgColor: 'rgba(96, 32, 34, 0.44)',
    borderColor: 'rgba(255, 142, 124, 0.55)',
  },
  VG03: {
    kind: 'inner_world',
    badgeText: 'THỨC HẢI · CÔNG PHÁP',
    stageLabel: 'Chặng 1 · Mộng Cảnh Châu Đá',
    realmText: 'Ngưng Khí 7 → 9',
    locationLabel: 'Khe Đá Rạn & Nội Giới Thiên Nghịch Châu',
    accentColor: '#7be3f2',
    bgColor: 'rgba(20, 68, 86, 0.46)',
    borderColor: 'rgba(123, 227, 242, 0.55)',
  },
  VG04: {
    kind: 'boss_hunt',
    badgeText: 'BÍ CẢNH · KHẢO NGHIỆM',
    stageLabel: 'Chặng 1 · Trường Khảo Nghiệm',
    realmText: 'Ngưng Khí 10 → 12',
    locationLabel: 'Trường Khảo Nghiệm Cổ Tu · Tam Ấn Khôi Lỗi',
    accentColor: '#ff9b8a',
    bgColor: 'rgba(96, 32, 34, 0.44)',
    borderColor: 'rgba(255, 142, 124, 0.55)',
  },
  VG05: {
    kind: 'alchemy_fate',
    badgeText: 'ĐAN ĐẠO · NHÂN DUYÊN',
    stageLabel: 'Chặng 1 · Rừng Cổ Mộc',
    realmText: 'Ngưng Khí 13 → 15',
    locationLabel: 'Rừng Cổ Mộc · Lý Mộ Uyển & Cổ Mộc Trấn Khí',
    accentColor: '#78e6b8',
    bgColor: 'rgba(20, 74, 58, 0.45)',
    borderColor: 'rgba(120, 230, 184, 0.55)',
  },
  VG06: {
    kind: 'tribulation',
    badgeText: 'ĐẠI KIẾP · ĐỘT PHÁ TRÚC CƠ',
    stageLabel: 'Đỉnh Chặng 1 · Huyết Chiến Hằng Nhạc',
    realmText: 'Ngưng Khí 15 → Trúc Cơ Sơ Kỳ',
    locationLabel: 'Đỉnh Hằng Nhạc · Hắc Ấn Chấp Sự (3 Pha)',
    accentColor: '#deb2ff',
    bgColor: 'rgba(66, 34, 98, 0.48)',
    borderColor: 'rgba(216, 166, 255, 0.6)',
  },
  VG07: {
    kind: 'inner_world',
    badgeText: 'NỘI GIỚI · PHÁP BẢO MỐC II',
    stageLabel: 'Chặng 2 · Quyết Minh Cốc',
    realmText: 'Trúc Cơ Sơ Kỳ',
    locationLabel: 'Thung Lũng Quyết Minh Cốc & Không Gian Nội Giới',
    accentColor: '#7be3f2',
    bgColor: 'rgba(20, 68, 86, 0.46)',
    borderColor: 'rgba(123, 227, 242, 0.55)',
  },
  VG08: {
    kind: 'boss_hunt',
    badgeText: 'BÍ CẢNH · THU PHỤC HUNG LINH',
    stageLabel: 'Chặng 2 · Hàn Thiết Kiếm Mộ',
    realmText: 'Trúc Cơ Trung Kỳ',
    locationLabel: 'Hàn Thiết Kiếm Mộ · Hung Linh Hứa Lập Quốc',
    accentColor: '#ff9b8a',
    bgColor: 'rgba(96, 32, 34, 0.44)',
    borderColor: 'rgba(255, 142, 124, 0.55)',
  },
  VG09: {
    kind: 'alchemy_fate',
    badgeText: 'HỘ ĐẠO · ĐAN THẤT LÝ MỘ UYỂN',
    stageLabel: 'Chặng 2 · Đan Thất Quyết Minh Cốc',
    realmText: 'Trúc Cơ Hậu Kỳ',
    locationLabel: 'Đan Thất Lý Mộ Uyển · Trận Hộ Đan Thiên Ly',
    accentColor: '#78e6b8',
    bgColor: 'rgba(20, 74, 58, 0.45)',
    borderColor: 'rgba(120, 230, 184, 0.55)',
  },
  VG10: {
    kind: 'boss_hunt',
    badgeText: 'HUYẾT ĐÀN · TRẢM GIẢ ĐAN',
    stageLabel: 'Chặng 2 · Huyết Đàn Ngoại Vực',
    realmText: 'Trúc Cơ Viên Mãn',
    locationLabel: 'Huyết Đàn Ngoại Vực · Chân Thân Hắc Ấn (Giả Đan)',
    accentColor: '#ff9b8a',
    bgColor: 'rgba(96, 32, 34, 0.44)',
    borderColor: 'rgba(255, 142, 124, 0.55)',
  },
  VG11: {
    kind: 'tribulation',
    badgeText: 'ĐỘ KIẾP · BỔN MỆNH KIM ĐAN',
    stageLabel: 'Đỉnh Chặng 2 · Tiến Vào Tu Ma Hải',
    realmText: 'Trúc Cơ Viên Mãn → Kết Đan Sơ Kỳ',
    locationLabel: 'Lôi Đài Tu Ma Hải · Tam Trọng Kiếp Lôi',
    accentColor: '#deb2ff',
    bgColor: 'rgba(66, 34, 98, 0.48)',
    borderColor: 'rgba(216, 166, 255, 0.6)',
  },
};

export function questCategoryMeta(questId: string): QuestCategoryMeta {
  const base = QUEST_META_TABLE[questId] ?? QUEST_META_TABLE.VG01!;
  return {
    ...base,
    svg: CATEGORY_SVGS[base.kind],
  };
}

export function objectiveKindMeta(objId: string, text: string): ObjectiveActionMeta {
  const lower = `${objId} ${text}`.toLowerCase();
  if (lower.includes('đột phá') || lower.includes('đạo đài') || lower.includes('kiếp lôi') || lower.includes('kim đan') || objId === 'foundation' || objId === 'tribulation') {
    return {
      kind: 'breakthrough',
      shortLabel: 'Độ Kiếp / Đột Phá',
      ctaLabel: '⚡ Đột Phá',
      accentColor: '#e4b8ff',
      svg: OBJECTIVE_SVGS.breakthrough,
    };
  }
  if (lower.includes('thu thập') || lower.includes('mẫu linh ấn') || lower.includes('linh dược') || objId === 'situ') {
    return {
      kind: 'gather',
      shortLabel: 'Thu Thập / Giải Ấn',
      ctaLabel: '🌿 Tới Điểm Thu Thập',
      accentColor: '#7ce8be',
      svg: OBJECTIVE_SVGS.gather,
    };
  }
  if (lower.includes('luyện') || lower.includes('khai mở') || lower.includes('pháp bảo mốc') || lower.includes('lò đan') || objId === 'wolf' || objId === 'construct' || objId === 'tree' || objId === 'decode') {
    return {
      kind: 'alchemy',
      shortLabel: 'Tế Luyện / Pháp Bảo',
      ctaLabel: '🔮 Tế Luyện Đạo Quả',
      accentColor: '#f5d27a',
      svg: OBJECTIVE_SVGS.alchemy,
    };
  }
  if (lower.includes('gặp ') || lower.includes('nhặt châu') || lower.includes('khai mạch') || objId === 'bead' || objId === 'sword') {
    return {
      kind: 'talk',
      shortLabel: 'Đàm Đạo / Cơ Duyên',
      ctaLabel: '🧭 Tầm Lộ Gặp NPC',
      accentColor: '#ffe08c',
      svg: OBJECTIVE_SVGS.talk,
    };
  }
  return {
    kind: 'combat',
    shortLabel: 'Thực Chiến Bí Cảnh',
    ctaLabel: '⚔️ Khai Chiến 2D',
    accentColor: '#ff9d8c',
    svg: OBJECTIVE_SVGS.combat,
  };
}

export function questSealStampSvg(status: SectQuestStatus): string {
  if (status === 'completed') {
    return `<svg class="dao-cinnabar-seal" viewBox="0 0 88 88" width="68" height="68" aria-hidden="true">
      <g transform="rotate(-11 44 44)">
        <rect x="6" y="6" width="76" height="76" rx="6" fill="rgba(182, 36, 28, 0.14)" stroke="#d94638" stroke-width="3"/>
        <rect x="11" y="11" width="66" height="66" rx="3" fill="none" stroke="#d94638" stroke-width="1.3" stroke-dasharray="6 2"/>
        <text x="44" y="38" text-anchor="middle" fill="#e85848" font-size="13.5" font-weight="800" letter-spacing="1.5">ĐẠO QUẢ</text>
        <line x1="18" y1="45" x2="70" y2="45" stroke="#d94638" stroke-width="1.2" opacity="0.75"/>
        <text x="44" y="62" text-anchor="middle" fill="#e85848" font-size="13.5" font-weight="800" letter-spacing="1.5">VIÊN MÃN</text>
      </g>
    </svg>`;
  }
  if (status === 'ready') {
    return `<svg class="dao-cinnabar-seal dao-seal-ready" viewBox="0 0 88 88" width="68" height="68" aria-hidden="true">
      <g transform="rotate(-8 44 44)">
        <rect x="6" y="6" width="76" height="76" rx="6" fill="rgba(235, 196, 108, 0.16)" stroke="#f3c868" stroke-width="3"/>
        <rect x="11" y="11" width="66" height="66" rx="3" fill="none" stroke="#f3c868" stroke-width="1.3"/>
        <text x="44" y="38" text-anchor="middle" fill="#ffe294" font-size="13" font-weight="800" letter-spacing="1">CHỜ LĨNH</text>
        <line x1="18" y1="45" x2="70" y2="45" stroke="#f3c868" stroke-width="1.2" opacity="0.8"/>
        <text x="44" y="62" text-anchor="middle" fill="#ffe294" font-size="13" font-weight="800" letter-spacing="1">ĐẠO QUẢ</text>
      </g>
    </svg>`;
  }
  if (status === 'active' || status === 'available') {
    return `<svg class="dao-cinnabar-seal dao-seal-active" viewBox="0 0 88 88" width="68" height="68" aria-hidden="true">
      <g transform="rotate(-8 44 44)">
        <rect x="6" y="6" width="76" height="76" rx="6" fill="rgba(78, 212, 182, 0.12)" stroke="#62d9bc" stroke-width="2.6"/>
        <rect x="11" y="11" width="66" height="66" rx="3" fill="none" stroke="#62d9bc" stroke-width="1.2" stroke-dasharray="5 3"/>
        <text x="44" y="38" text-anchor="middle" fill="#8ef2d8" font-size="12.5" font-weight="800" letter-spacing="1">MỆNH KIẾP</text>
        <line x1="18" y1="45" x2="70" y2="45" stroke="#62d9bc" stroke-width="1.1" opacity="0.75"/>
        <text x="44" y="62" text-anchor="middle" fill="#8ef2d8" font-size="12.5" font-weight="800" letter-spacing="1">ĐƯƠNG THỜI</text>
      </g>
    </svg>`;
  }
  return `<svg class="dao-cinnabar-seal dao-seal-locked" viewBox="0 0 88 88" width="68" height="68" aria-hidden="true">
    <g transform="rotate(-8 44 44)">
      <rect x="6" y="6" width="76" height="76" rx="6" fill="rgba(90, 108, 122, 0.12)" stroke="#7c909e" stroke-width="2.4"/>
      <rect x="11" y="11" width="66" height="66" rx="3" fill="none" stroke="#7c909e" stroke-width="1.1" stroke-dasharray="4 4"/>
      <text x="44" y="38" text-anchor="middle" fill="#9cb0be" font-size="13" font-weight="700" letter-spacing="1.2">THIÊN CƠ</text>
      <line x1="18" y1="45" x2="70" y2="45" stroke="#7c909e" stroke-width="1.1" opacity="0.6"/>
      <text x="44" y="62" text-anchor="middle" fill="#9cb0be" font-size="13" font-weight="700" letter-spacing="1.2">CHƯA MỞ</text>
    </g>
  </svg>`;
}
