/**
 * Deterministic, I/O-free Stage Progression & Core Gameplay Loop Prototype (GDD 0.34 · 14/10/2026 · Branch G2).
 * Connects PlayerCultivationState, ArtifactLoadoutState (4 families × 3 milestones), StageProgressionLedger (VG01–VG11),
 * MenhKiepChi (Auto-Chain Fact Rule), NoiGioiState (Thiên Nghịch Châu & Tư Đồ Nam), LiMuwanAlchemyState,
 * 3 Stance Modifiers, and Boss/Tribulation Encounters to ../wang-lin-equipment-prototype-v1/core.mjs.
 *
 * Fixture-only: does not import live server/client runtime, mutate SQLite DB, or touch authored maps.
 */
import {
  CONTRACTS as EQUIPMENT_CONTRACTS,
  createPrototype as createEquipmentEngine,
  restorePrototype as restoreEquipmentEngine,
  geometryFor,
  viewAt,
  pointInShape,
  targetIntersectsShape,
  normalizeAim,
} from '../wang-lin-equipment-prototype-v1/core.mjs';

export const SCHEMA = 'wang-lin-progression-loop-prototype-1';
export const CONTRACT_VERSION = 1;
export const MIN_CLUSTER_ATTACK_STAGGER_MS = 450;
export const PLAYER_WALK_SPEED_PX_PER_S = 80;

const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const copy = value => JSON.parse(JSON.stringify(value));
const finite = n => typeof n === 'number' && Number.isFinite(n);
const requireFinite = (n, label) => {
  if (!finite(n)) throw new TypeError(`${label} must be a finite number`);
  return n;
};
const isId = s => typeof s === 'string' && s.length > 0 && s.length <= 120;
const requireId = (s, label) => {
  if (!isId(s)) throw new TypeError(`${label} must be a non-empty string <= 120 chars`);
  return s;
};

export const IDENTITIES = deepFreeze({
  a: {
    id: 'a',
    codeName: 'huyen_tam',
    displayName: 'Huyễn Tâm',
    protagonistLine: 'wang_lin',
    neutralCanvas: [64, 96],
    neutralPivot: [32, 88],
    motionCanvas: [112, 112],
    motionPivot: [56, 104],
    bodyHeightPx: 80,
  },
  b: {
    id: 'b',
    codeName: 'tich_bach',
    displayName: 'Tịch Bạch',
    protagonistLine: 'wang_lin',
    neutralCanvas: [64, 96],
    neutralPivot: [32, 88],
    motionCanvas: [112, 112],
    motionPivot: [56, 104],
    bodyHeightPx: 80,
  },
});

export const NGUNG_KHI_SUBSTAGES = deepFreeze([
  { subStage: 1, expThreshold: 0, baseHp: 100, baseMp: 60, baseAttack: 12, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 1' },
  { subStage: 2, expThreshold: 150, baseHp: 115, baseMp: 80, baseAttack: 14, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 2' },
  { subStage: 3, expThreshold: 360, baseHp: 135, baseMp: 100, baseAttack: 17, isGate: true, requiredBreakthroughFact: 'fact_vg01_qi_conduit_trial', title: 'Ngưng Khí Tầng 3 (Cột Mốc Hồi I)' },
  { subStage: 4, expThreshold: 620, baseHp: 155, baseMp: 115, baseAttack: 20, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 4' },
  { subStage: 5, expThreshold: 940, baseHp: 175, baseMp: 130, baseAttack: 23, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 5' },
  { subStage: 6, expThreshold: 1320, baseHp: 205, baseMp: 155, baseAttack: 27, isGate: true, requiredBreakthroughFact: 'kill_cloud_wolf_king', title: 'Ngưng Khí Tầng 6 (Cột Mốc Hồi II)' },
  { subStage: 7, expThreshold: 1760, baseHp: 230, baseMp: 170, baseAttack: 31, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 7' },
  { subStage: 8, expThreshold: 2260, baseHp: 255, baseMp: 185, baseAttack: 35, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 8' },
  { subStage: 9, expThreshold: 2820, baseHp: 290, baseMp: 210, baseAttack: 40, isGate: true, requiredBreakthroughFact: 'fact_vg03_black_seal_decoded', title: 'Ngưng Khí Tầng 9 (Cột Mốc Hồi III)' },
  { subStage: 10, expThreshold: 3450, baseHp: 320, baseMp: 230, baseAttack: 45, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 10' },
  { subStage: 11, expThreshold: 4150, baseHp: 355, baseMp: 250, baseAttack: 50, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 11' },
  { subStage: 12, expThreshold: 4920, baseHp: 400, baseMp: 280, baseAttack: 57, isGate: true, requiredBreakthroughFact: 'kill_three_seal_construct', title: 'Ngưng Khí Tầng 12 (Cột Mốc Hồi IV)' },
  { subStage: 13, expThreshold: 5780, baseHp: 440, baseMp: 305, baseAttack: 63, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 13' },
  { subStage: 14, expThreshold: 6720, baseHp: 485, baseMp: 330, baseAttack: 70, isGate: false, requiredBreakthroughFact: null, title: 'Ngưng Khí Tầng 14' },
  { subStage: 15, expThreshold: 7750, baseHp: 540, baseMp: 365, baseAttack: 78, isGate: true, requiredBreakthroughFact: 'kill_spirit_ward_elder_tree', title: 'Ngưng Khí Tầng 15 Đỉnh Phong (Cột Mốc Hồi V)' },
]);

export const FOUNDATION_QUALITIES = deepFreeze({
  mortal: {
    id: 'mortal',
    name: 'Phàm Đạo Trúc Cơ',
    statMultiplier: 1.4,
    jadeTalismanSlots: 1,
    cooldownReduction: 0,
    minBossProofs: 0,
    requiresFlawlessDarkSeal: false,
    passiveId: null,
  },
  earth: {
    id: 'earth',
    name: 'Địa Đạo Trúc Cơ',
    statMultiplier: 1.55,
    jadeTalismanSlots: 2,
    cooldownReduction: 0,
    minBossProofs: 2,
    requiresFlawlessDarkSeal: false,
    passiveId: 'earth_foundation_poise',
  },
  heaven: {
    id: 'heaven',
    name: 'Thiên Đạo Trúc Cơ',
    statMultiplier: 1.7,
    jadeTalismanSlots: 3,
    cooldownReduction: 0.1,
    minBossProofs: 3,
    requiresFlawlessDarkSeal: true,
    passiveId: 'heaven_defying_dao_base',
  },
});

export const REALMS = deepFreeze({
  ngung_khi: {
    id: 'ngung_khi',
    order: 1,
    name: 'Ngưng Khí',
    maxSubStage: 15,
    subStages: NGUNG_KHI_SUBSTAGES,
  },
  truc_co: {
    id: 'truc_co',
    order: 2,
    name: 'Trúc Cơ',
    maxSubStage: 4,
    subStages: [
      { subStage: 1, expThreshold: 9000, baseHp: 650, baseMp: 420, baseAttack: 92, isGate: false, requiredBreakthroughFact: null, title: 'Trúc Cơ Sơ Kỳ' },
      { subStage: 2, expThreshold: 11200, baseHp: 760, baseMp: 490, baseAttack: 108, isGate: true, requiredBreakthroughFact: 'fact_vg08_xu_liguo_subdued', title: 'Trúc Cơ Trung Kỳ' },
      { subStage: 3, expThreshold: 13800, baseHp: 890, baseMp: 570, baseAttack: 126, isGate: true, requiredBreakthroughFact: 'fact_vg09_furnace_defended', title: 'Trúc Cơ Hậu Kỳ' },
      { subStage: 4, expThreshold: 16800, baseHp: 1040, baseMp: 660, baseAttack: 148, isGate: true, requiredBreakthroughFact: 'kill_dark_seal_true_body', title: 'Trúc Cơ Viên Mãn' },
    ],
  },
  ket_dan: {
    id: 'ket_dan',
    order: 3,
    name: 'Kết Đan',
    maxSubStage: 4,
    subStages: [
      { subStage: 1, expThreshold: 20500, baseHp: 1450, baseMp: 900, baseAttack: 210, isGate: false, requiredBreakthroughFact: null, title: 'Kết Đan Sơ Kỳ' },
      { subStage: 2, expThreshold: 25000, baseHp: 1680, baseMp: 1040, baseAttack: 245, isGate: false, requiredBreakthroughFact: null, title: 'Kết Đan Trung Kỳ' },
      { subStage: 3, expThreshold: 30500, baseHp: 1950, baseMp: 1200, baseAttack: 285, isGate: false, requiredBreakthroughFact: null, title: 'Kết Đan Hậu Kỳ' },
      { subStage: 4, expThreshold: 37000, baseHp: 2260, baseMp: 1380, baseAttack: 330, isGate: true, requiredBreakthroughFact: 'fact_stage3_ancient_god_shard', title: 'Kết Đan Viên Mãn' },
    ],
  },
  nguyen_anh: {
    id: 'nguyen_anh',
    order: 4,
    name: 'Nguyên Anh',
    maxSubStage: 4,
    subStages: [
      { subStage: 1, expThreshold: 45000, baseHp: 3100, baseMp: 1850, baseAttack: 450, isGate: false, requiredBreakthroughFact: null, title: 'Nguyên Anh Sơ Kỳ' },
      { subStage: 2, expThreshold: 55000, baseHp: 3550, baseMp: 2120, baseAttack: 520, isGate: false, requiredBreakthroughFact: null, title: 'Nguyên Anh Trung Kỳ' },
      { subStage: 3, expThreshold: 67000, baseHp: 4080, baseMp: 2440, baseAttack: 600, isGate: false, requiredBreakthroughFact: null, title: 'Nguyên Anh Hậu Kỳ' },
      { subStage: 4, expThreshold: 81000, baseHp: 4700, baseMp: 2800, baseAttack: 690, isGate: true, requiredBreakthroughFact: 'fact_stage4_lifespan_defied', title: 'Nguyên Anh Viên Mãn' },
    ],
  },
  hoa_than: {
    id: 'hoa_than',
    order: 5,
    name: 'Hóa Thần',
    maxSubStage: 4,
    subStages: [
      { subStage: 1, expThreshold: 98000, baseHp: 6400, baseMp: 3800, baseAttack: 940, isGate: false, requiredBreakthroughFact: null, title: 'Hóa Thần Sơ Kỳ' },
      { subStage: 2, expThreshold: 118000, baseHp: 7300, baseMp: 4350, baseAttack: 1080, isGate: false, requiredBreakthroughFact: null, title: 'Hóa Thần Trung Kỳ' },
      { subStage: 3, expThreshold: 142000, baseHp: 8350, baseMp: 4980, baseAttack: 1240, isGate: false, requiredBreakthroughFact: null, title: 'Hóa Thần Hậu Kỳ' },
      { subStage: 4, expThreshold: 170000, baseHp: 9600, baseMp: 5700, baseAttack: 1440, isGate: false, requiredBreakthroughFact: null, title: 'Hóa Thần Đỉnh Phong' },
    ],
  },
});

export const STANCES = deepFreeze({
  sword_kill: {
    id: 'sword_kill',
    name: 'Kiếm Sát Quyết',
    primaryFamily: 'sword',
    swordDamageMultiplier: 1.15,
    swordStCooldownReductionMs: 1000,
    armorPenetration: 0.2,
    bannerDamageMultiplier: 1.0,
    bannerHitLifestealRatio: 0,
    maxHpMultiplier: 1.0,
    beadShieldMultiplier: 1.0,
    chariotSealBreakMultiplier: 2.0,
  },
  soul_command: {
    id: 'soul_command',
    name: 'Ngự Hồn Quyết',
    primaryFamily: 'banner',
    swordDamageMultiplier: 1.0,
    swordStCooldownReductionMs: 0,
    armorPenetration: 0,
    bannerDamageMultiplier: 1.2,
    bannerHitLifestealRatio: 0.03,
    maxHpMultiplier: 1.0,
    beadShieldMultiplier: 1.0,
    chariotSealBreakMultiplier: 2.0,
  },
  chariot_bulwark: {
    id: 'chariot_bulwark',
    name: 'Trấn Nhạc Quyết',
    primaryFamily: 'chariot',
    swordDamageMultiplier: 1.0,
    swordStCooldownReductionMs: 0,
    armorPenetration: 0,
    bannerDamageMultiplier: 1.0,
    bannerHitLifestealRatio: 0,
    maxHpMultiplier: 1.18,
    beadShieldMultiplier: 1.3,
    chariotSealBreakMultiplier: 2.5,
  },
});

export const ARTIFACT_FAMILIES = deepFreeze({
  sword: {
    familyId: 'sword',
    name: 'Kiếm Linh',
    slotRole: 'primary',
    baseCooldownMs: { st: 6000, aoe: 11000 },
    milestones: {
      1: { tier: 1, title: 'Thanh Phong Linh Kiếm (Mốc I)', damageMultiplier: 1.0, passiveId: 'sword_pierce_line' },
      2: { tier: 2, title: 'Hung Linh Kiếm Hứa Lập Quốc (Mốc II)', damageMultiplier: 1.35, passiveId: 'xu_liguo_devour_below_50pct', executeBonusMultiplier: 1.25 },
      3: { tier: 3, title: 'Tử Kim Ma Kiếm Hóa Hình (Mốc III)', damageMultiplier: 1.85, passiveId: 'sovereign_sword_manifest' },
    },
  },
  banner: {
    familyId: 'banner',
    name: 'Hồn Phiên',
    slotRole: 'primary',
    baseCooldownMs: { st: 6500, aoe: 12000 },
    milestones: {
      1: { tier: 1, title: 'Tiểu Hồn Phiên (Mốc I)', damageMultiplier: 1.0, maxPrimarySouls: 1, passiveId: 'lesser_soul_tether' },
      2: { tier: 2, title: 'Tam Môn Tôn Hồn Phiên (Mốc II)', damageMultiplier: 1.35, maxPrimarySouls: 3, passiveId: 'tri_gate_commander_souls' },
      3: { tier: 3, title: 'Thập Ức Tôn Hồn Phiên (Mốc III)', damageMultiplier: 1.9, maxPrimarySouls: 9, passiveId: 'sovereign_soul_legion' },
    },
  },
  chariot: {
    familyId: 'chariot',
    name: 'Xạ Thần Xa',
    slotRole: 'primary',
    baseCooldownMs: { st: 7500, aoe: 13500 },
    milestones: {
      1: { tier: 1, title: 'Xạ Thần Xa · Giải Ấn Nhất Tầng (Mốc I)', damageMultiplier: 1.0, sealBreakMultiplier: 2.0, passiveId: 'first_seal_beast_charge' },
      2: { tier: 2, title: 'Xạ Thần Xa · Giải Ấn Lôi Thú (Mốc II)', damageMultiplier: 1.4, sealBreakMultiplier: 2.6, passiveId: 'thunder_beast_formation_crush' },
      3: { tier: 3, title: 'Xạ Thần Xa · Tam Ấn Viễn Cổ (Mốc III)', damageMultiplier: 1.95, sealBreakMultiplier: 3.5, passiveId: 'ancient_three_seal_cataclysm' },
    },
  },
  bead: {
    familyId: 'bead',
    name: 'Thiên Nghịch Châu',
    slotRole: 'support',
    baseCooldownMs: { st: 8000, aoe: 15000 },
    milestones: {
      1: { tier: 1, title: 'Châu Đá Ngũ Vân (Mốc I)', supportMultiplier: 1.0, maxDewCharges: 3, innerRealmUnlocked: false, passiveId: 'spirit_dew_condensation' },
      2: { tier: 2, title: 'Thiên Nghịch Châu · Mở Nội Giới (Mốc II)', supportMultiplier: 1.4, maxDewCharges: 5, innerRealmUnlocked: true, passiveId: 'inner_realm_sanctuary' },
      3: { tier: 3, title: 'Thiên Nghịch Châu · Ngũ Hành Viên Mãn (Mốc III)', supportMultiplier: 1.9, maxDewCharges: 9, innerRealmUnlocked: true, passiveId: 'five_elements_domain_harmony' },
    },
  },
});

export const ACTS = deepFreeze([
  {
    id: 'VG01',
    stage: 1,
    title: 'Hồi I: Phế Sài Nhập Môn & Cơ Duyên Dưới Vực',
    realmRange: 'Ngưng Khí 1 → 3',
    steps: [
      {
        id: 'VG01_S1_PICKUP_BEAD',
        title: 'Nhặt Châu Đá Ngũ Vân dưới Hẻm Vân Liệt',
        requiredFact: 'fact_vg01_stone_bead_picked',
        grantedExp: 160,
        grantedItems: { item_stone_bead_dew: 2 },
        unlockedFeatures: ['bead_m1_discovered', 'skill_bead_st'],
        voiceoverSpeaker: 'Thiên Nghịch Châu',
        voiceoverLine: 'Năm đám mây khắc trên châu đá khẽ xoay chuyển, một giọt lộ thủy lành lạnh thấm vào kinh mạch.',
      },
      {
        id: 'VG01_S2_SWORD_AND_PUPPETS',
        title: 'Lĩnh Kiếm Linh Mốc I & Phá 3 Khôi Lỗi Rạn Ngọc',
        requiredFact: 'fact_vg01_training_puppets_cleared',
        grantedExp: 110,
        grantedItems: { mat_puppet_jade_shard: 3 },
        unlockedFeatures: ['sword_m1_refined', 'skill_sword_st'],
        voiceoverSpeaker: 'Tạ Kiếm Sơn',
        voiceoverLine: 'Nhát kiếm có đường đi rõ ràng. Giữ vững nhịp bước rồi tiến vào Trận Dẫn Khí.',
      },
      {
        id: 'VG01_S3_QI_CONDUIT_TRIAL',
        title: 'Vượt Trận Dẫn Khí & Đột Phá Ngưng Khí Tầng 3',
        requiredFact: 'fact_vg01_qi_conduit_trial',
        grantedExp: 120,
        grantedItems: { item_outer_perimeter_pass: 1 },
        unlockedFeatures: ['zone_outer_perimeter'],
        voiceoverSpeaker: 'Diệp Tĩnh',
        voiceoverLine: 'Kinh mạch đã thông suốt tới Ngưng Khí tầng ba. Tuyến Ngoại Vi đã mở.',
      },
    ],
  },
  {
    id: 'VG02',
    stage: 1,
    title: 'Hồi II: Máu Nhuộm Ngoại Vi & Săn Lùng Lang Vương',
    realmRange: 'Ngưng Khí 4 → 6',
    steps: [
      {
        id: 'VG02_S1_CRAFT_BANNER_M1',
        title: 'Thu thập Yêu Hồn & Luyện Tiểu Hồn Phiên (Mốc I)',
        requiredFact: 'fact_vg02_banner_m1_crafted',
        grantedExp: 580,
        grantedItems: { mat_lesser_beast_soul: 1 },
        unlockedFeatures: ['banner_m1_refined', 'skill_banner_st'],
        voiceoverSpeaker: 'Tống Thiết',
        voiceoverLine: 'Lá phiên này đã nạp chủ hồn đầu tiên. Ra lệnh bằng thần thức, đừng để âm khí phản phệ.',
      },
      {
        id: 'VG02_S2_SLAY_CLOUD_WOLF_KING',
        title: 'Truy kích & Hạ gục Vân Nha Lang Vương',
        requiredFact: 'kill_cloud_wolf_king',
        grantedExp: 450,
        grantedItems: { item_broken_black_seal_1: 1, proof_wolf_king_fang: 1 },
        unlockedFeatures: ['skill_sword_aoe', 'skill_banner_aoe'],
        voiceoverSpeaker: 'Hứa Hành',
        voiceoverLine: 'Trong cổ họng Lang Vương lại găm mảnh lệnh bài Hắc Ấn... Kẻ đứng sau không phải yêu thú thường.',
      },
    ],
  },
  {
    id: 'VG03',
    stage: 1,
    title: 'Hồi III: Bí Mật Thức Hải & Ba Khuynh Hướng Công Pháp',
    realmRange: 'Ngưng Khí 7 → 9',
    steps: [
      {
        id: 'VG03_S1_AWAKEN_SITU_NAN',
        title: 'Vào Mộng Cảnh Châu Đá & Gặp Tàn Hồn Tư Đồ Nam',
        requiredFact: 'fact_vg03_situ_nan_met',
        grantedExp: 760,
        grantedItems: { item_stone_bead_dew: 2 },
        unlockedFeatures: ['unlock_stance_system', 'situ_nan_guidance'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Tiểu tử, ngủ suốt bao năm trong viên châu này cuối cùng cũng gặp được người có chút huyết tính!',
      },
      {
        id: 'VG03_S2_DECODE_BLACK_SEAL',
        title: 'Cùng Lục Văn đối chiếu cổ tịch & Mở đường Khe Đá Rạn',
        requiredFact: 'fact_vg03_black_seal_decoded',
        grantedExp: 780,
        grantedItems: { talisman_seal_breaker: 1 },
        unlockedFeatures: ['zone_trial_gorge'],
        voiceoverSpeaker: 'Lục Văn',
        voiceoverLine: 'Trang cổ tịch bị xé trùng khớp với vết khắc trên mảnh lệnh bài. Cẩn thận dưới Trường Khảo Nghiệm.',
      },
    ],
  },
  {
    id: 'VG04',
    stage: 1,
    title: 'Hồi IV: Sát Cơ Trường Khảo Nghiệm — Tam Ấn Khôi Lỗi',
    realmRange: 'Ngưng Khí 10 → 12',
    steps: [
      {
        id: 'VG04_S1_CLEAR_GORGE_ELITES',
        title: 'Vượt Khe Đá Rạn & Phá mắt xích Thiết Giáp / Phù Sư',
        requiredFact: 'fact_vg04_gorge_elites_cleared',
        grantedExp: 1150,
        grantedItems: { talisman_seal_breaker: 2 },
        unlockedFeatures: ['arena_three_seal_construct'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Khôi lỗi trấn trường khảo nghiệm có ba đạo cổ ấn. Đánh vỡ từng ấn lúc nó lộ sơ hở!',
      },
      {
        id: 'VG04_S2_DEFEAT_THREE_SEAL_CONSTRUCT',
        title: 'Phá Tam Ấn Khôi Lỗi & Khai mở Xạ Thần Xa (Mốc I)',
        requiredFact: 'kill_three_seal_construct',
        grantedExp: 1050,
        grantedItems: { item_chariot_sealed_core: 1, proof_three_seal_core: 1 },
        unlockedFeatures: ['chariot_m1_sealed', 'skill_chariot_st', 'skill_chariot_aoe', 'unlock_artifact_quickswap'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Lõi chiến xa cổ tu này sát khí cực nặng! Ta giúp ngươi mở tầng ấn thứ nhất trước.',
      },
    ],
  },
  {
    id: 'VG05',
    stage: 1,
    title: 'Hồi V: Rừng Cổ Mộc, Gặp Lý Mộ Uyển & Cổ Mộc Trấn Khí',
    realmRange: 'Ngưng Khí 13 → 15',
    steps: [
      {
        id: 'VG05_S1_RESCUE_LI_MUWAN_CONVOY',
        title: 'Giải vây đoàn dược sư & Kết nhân duyên Lý Mộ Uyển',
        requiredFact: 'fact_vg05_meet_li_muwan',
        grantedExp: 1450,
        grantedItems: { pill_antidote: 2, mat_spirit_herb: 3 },
        unlockedFeatures: ['unlock_li_muwan_alchemy'],
        voiceoverSpeaker: 'Lý Mộ Uyển',
        voiceoverLine: 'Đa tạ đạo hữu ra tay tương trợ. Nếu có Thanh Mộc Linh Tâm, Mộ Uyển nguyện giúp đạo hữu luyện Trúc Cơ Đan.',
      },
      {
        id: 'VG05_S2_DEFEAT_ELDER_TREE',
        title: 'Chặt rễ Hắc Ấn, Hạ Cổ Mộc Trấn Khí & Mở Nội Giới Hộ Đạo',
        requiredFact: 'kill_spirit_ward_elder_tree',
        grantedExp: 1500,
        grantedItems: { item_azure_wood_heart: 1, proof_elder_tree_heart: 1 },
        unlockedFeatures: ['skill_bead_aoe'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Mộc tâm đã về tay, Thiên Nghịch Châu cũng vừa mở ra trường Nội Giới Hộ Đạo!',
      },
    ],
  },
  {
    id: 'VG06',
    stage: 1,
    title: 'Hồi VI: Đại Kiếp Nạn Hằng Nhạc — Quyết Chiến Hắc Ấn Chấp Sự & Trúc Cơ',
    realmRange: 'Ngưng Khí 15 → Trúc Cơ Sơ Kỳ',
    steps: [
      {
        id: 'VG06_S1_DEFEAT_DARK_SEAL_OFFICER',
        title: 'Phá vòng Ấn Hồi 90° & Đánh bại Hắc Ấn Chấp Sự',
        requiredFact: 'kill_dark_seal_officer',
        grantedExp: 850,
        grantedItems: { item_dark_seal_token: 1 },
        unlockedFeatures: ['ready_foundation_breakthrough'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Khe hở một phần tư vòng ấn đã bị ngươi nhìn thấu! Mau dùng Trúc Cơ Đan dựng Đạo Đài!',
      },
      {
        id: 'VG06_S2_FOUNDATION_BREAKTHROUGH',
        title: 'Ngưng tụ Đạo Đài & Đột Phá Đại Cảnh Giới Trúc Cơ',
        requiredFact: 'fact_vg06_foundation_established',
        grantedExp: 650,
        grantedItems: { item_quyet_minh_valley_map: 1 },
        unlockedFeatures: ['realm_truc_co', 'zone_quyet_minh_valley'],
        voiceoverSpeaker: 'Lý Mộ Uyển',
        voiceoverLine: 'Đạo đài đã thành! Từ nay chân trời ngoài Hằng Nhạc mới thực sự mở ra.',
      },
    ],
  },
  {
    id: 'VG07',
    stage: 2,
    title: 'Hồi VII: Phong Vân Quyết Minh Cốc & Mở Không Gian Nội Giới',
    realmRange: 'Trúc Cơ Sơ Kỳ',
    steps: [
      {
        id: 'VG07_S1_INNER_REALM_AND_BANNER_M2',
        title: 'Mở Không Gian Nội Giới Thiên Nghịch Châu & Luyện Hồn Phiên Mốc II',
        requiredFact: 'fact_vg07_banner_m2_refined',
        grantedExp: 1800,
        grantedItems: { item_stone_bead_dew: 3 },
        unlockedFeatures: ['bead_m2_refined', 'banner_m2_refined', 'unlock_bead_inner_realm'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Nội giới trong châu đã mở! Đem đám yêu hồn mới săn được luyện thẳng thành Tam Môn Tôn Hồn Phiên!',
      },
    ],
  },
  {
    id: 'VG08',
    stage: 2,
    title: 'Hồi VIII: Hung Linh Nhập Kiếm — Thu Phục Hứa Lập Quốc',
    realmRange: 'Trúc Cơ Trung Kỳ',
    steps: [
      {
        id: 'VG08_S1_SUBDUE_XU_LIGUO',
        title: 'Tiến vào Hàn Thiết Kiếm Mộ & Trấn áp Hung Linh Hứa Lập Quốc (Kiếm Linh Mốc II)',
        requiredFact: 'fact_vg08_xu_liguo_subdued',
        grantedExp: 2400,
        grantedItems: { item_xu_liguo_soul_imprint: 1 },
        unlockedFeatures: ['sword_m2_refined'],
        voiceoverSpeaker: 'Hứa Lập Quốc',
        voiceoverLine: 'Gia gia tha mạng! Tiểu nhân nguyện làm kiếm linh chém sạch kẻ thù của ngài!',
      },
    ],
  },
  {
    id: 'VG09',
    stage: 2,
    title: 'Hồi IX: Hộ Đạo Đan Tâm — Bảo Vệ Lò Đan Lý Mộ Uyển',
    realmRange: 'Trúc Cơ Hậu Kỳ',
    steps: [
      {
        id: 'VG09_S1_DEFEND_ALCHEMY_FURNACE',
        title: 'Chặn 3 đợt Âm Thi Tông, Mở Xạ Thần Xa Mốc II & Nhận Thiên Ly Đan',
        requiredFact: 'fact_vg09_furnace_defended',
        grantedExp: 2800,
        grantedItems: { pill_heaven_parting: 1, item_li_muwan_lifesaving_jade: 1 },
        unlockedFeatures: ['chariot_m2_refined', 'bond_li_muwan_lifesaving_jade'],
        voiceoverSpeaker: 'Lý Mộ Uyển',
        voiceoverLine: 'Thiên Ly Đan đã thành! Mảnh ngọc giản hộ mệnh này xin đạo hữu mang theo bên mình.',
      },
    ],
  },
  {
    id: 'VG10',
    stage: 2,
    title: 'Hồi X: Đoạt Mệnh Chân Thân — Huyết Đàn Ngoại Vực',
    realmRange: 'Trúc Cơ Viên Mãn',
    steps: [
      {
        id: 'VG10_S1_SLAY_DARK_SEAL_TRUE_BODY',
        title: 'Phá Huyết Đàn, Hạ Chân Thân Hắc Ấn (Giả Đan) & Thu Nạp Chủ Hồn Thứ Ba',
        requiredFact: 'kill_dark_seal_true_body',
        grantedExp: 3200,
        grantedItems: { item_false_core_commander_soul: 1, item_five_element_essence_set: 1 },
        unlockedFeatures: ['banner_m2_third_commander_soul', 'bead_m2_five_elements_complete'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Một tên Giả Đan vừa khéo làm chủ hồn thứ ba trong cờ của ngươi. Chuẩn bị nghênh đón Kiếp Lôi Kết Đan!',
      },
    ],
  },
  {
    id: 'VG11',
    stage: 2,
    title: 'Hồi XI: Tiến Vào Tu Ma Hải — Độ Kiếp Kết Đan',
    realmRange: 'Trúc Cơ Viên Mãn → Kết Đan Sơ Kỳ',
    steps: [
      {
        id: 'VG11_S1_CORE_FORMATION_TRIBULATION',
        title: 'Vượt Tam Trọng Kiếp Lôi & Kết Tụ Bổn Mệnh Kim Đan',
        requiredFact: 'fact_vg11_core_formation_complete',
        grantedExp: 3800,
        grantedItems: { item_sea_of_devils_chart: 1 },
        unlockedFeatures: ['realm_ket_dan', 'zone_sea_of_devils'],
        voiceoverSpeaker: 'Tư Đồ Nam',
        voiceoverLine: 'Ba đạo kiếp lôi đều bị Thiên Nghịch Châu nuốt trọn! Kim Đan đã thành, tiến vào Tu Ma Hải!',
      },
    ],
  },
]);

export const SANDBOX_ACTIVITIES = deepFreeze({
  cluster_wolf_pack: {
    id: 'cluster_wolf_pack',
    kind: 'monster_cluster',
    name: 'Cụm Sói Ngoại Vi (2 Vân Nha Lang + 1 Lang Tuần Sơn)',
    minActId: 'VG02',
    members: [
      { id: 'wolf-1', role: 'normal', attackOffsetMs: 0 },
      { id: 'wolf-2', role: 'normal', attackOffsetMs: 500 },
      { id: 'wolf-elite', role: 'elite', attackOffsetMs: 1050 },
    ],
    expReward: 260,
    drops: { mat_cloud_fang: 2, mat_lesser_beast_soul: 1, mat_black_talisman_shard: 1 },
  },
  cluster_beetle_gorge: {
    id: 'cluster_beetle_gorge',
    kind: 'monster_cluster',
    name: 'Cụm Khe Đá Rạn (2 Ngọc Giáp Trùng + 1 Thiết Giáp Linh Trùng)',
    minActId: 'VG04',
    members: [
      { id: 'beetle-1', role: 'normal', attackOffsetMs: 0 },
      { id: 'beetle-2', role: 'normal', attackOffsetMs: 480 },
      { id: 'beetle-elite', role: 'elite', attackOffsetMs: 980 },
    ],
    expReward: 420,
    drops: { mat_jade_carapace: 2, mat_elite_core: 1, mat_black_talisman_shard: 1 },
  },
  cluster_mushroom_woods: {
    id: 'cluster_mushroom_woods',
    kind: 'monster_cluster',
    name: 'Cụm Rừng Cổ Mộc (2 Thực Linh Khuẩn + 1 U Niệm)',
    minActId: 'VG05',
    members: [
      { id: 'spore-1', role: 'normal', attackOffsetMs: 0 },
      { id: 'spore-2', role: 'normal', attackOffsetMs: 520 },
      { id: 'shade-1', role: 'elite', attackOffsetMs: 1040 },
    ],
    expReward: 560,
    drops: { mat_spirit_herb: 2, mat_wood_sap: 2, mat_elite_core: 1 },
  },
  cluster_corpse_sect_raiders: {
    id: 'cluster_corpse_sect_raiders',
    kind: 'monster_cluster',
    name: 'Toán Tu Sĩ Âm Thi Tông Ngoại Vực',
    minActId: 'VG07',
    members: [
      { id: 'raider-1', role: 'normal', attackOffsetMs: 0 },
      { id: 'raider-2', role: 'normal', attackOffsetMs: 460 },
      { id: 'corpse-adept', role: 'elite', attackOffsetMs: 960 },
    ],
    expReward: 820,
    drops: { mat_lesser_beast_soul: 2, mat_elite_core: 2, mat_spirit_herb: 2 },
  },
  adv_rescue_herbalist: {
    id: 'adv_rescue_herbalist',
    kind: 'world_adventure',
    name: 'Kỳ Ngộ: Dùng Lộ Thủy Cứu Dược Đồng Ngoại Vi',
    minActId: 'VG02',
    costItems: { item_stone_bead_dew: 1 },
    expReward: 180,
    grantedFacts: ['fact_adv_herbalist_saved', 'unlock_recipe_clear_heart_pill'],
    affinityGain: { npcId: 'bach_chi', delta: 20 },
    drops: { pill_clear_heart: 2 },
  },
  adv_destroy_black_talisman_stakes: {
    id: 'adv_destroy_black_talisman_stakes',
    kind: 'world_adventure',
    name: 'Kỳ Ngộ: Phá Hủy 3 Cọc Hắc Phù Quanh Đài Sói Tru',
    minActId: 'VG02',
    costItems: {},
    expReward: 200,
    grantedFacts: ['fact_black_stakes_destroyed'],
    affinityGain: { npcId: 'hua_hanh', delta: 15 },
    drops: { mat_black_talisman_shard: 2 },
  },
});

export const ALCHEMY_RECIPES = deepFreeze({
  recipe_clear_heart_pill: {
    id: 'recipe_clear_heart_pill',
    name: 'Thanh Tâm Đan (Hồi MP & Tịnh Tâm)',
    requiresFact: 'unlock_recipe_clear_heart_pill',
    ingredients: { mat_wood_sap: 1, mat_spirit_herb: 1 },
    outputItem: 'pill_clear_heart',
    outputCount: 2,
    affinityGain: { npcId: 'bach_chi', delta: 10 },
  },
  recipe_seal_breaker_talisman: {
    id: 'recipe_seal_breaker_talisman',
    name: 'Phá Cấm Phù (Khắc Chế Tam Ấn Khôi Lỗi)',
    requiresFact: 'fact_vg03_black_seal_decoded',
    ingredients: { mat_black_talisman_shard: 2 },
    outputItem: 'talisman_seal_breaker',
    outputCount: 1,
    affinityGain: { npcId: 'tong_thiet', delta: 15 },
  },
  recipe_foundation_pill: {
    id: 'recipe_foundation_pill',
    name: 'Trúc Cơ Đan (Chủ Dược Lý Mộ Uyển)',
    requiresFact: 'fact_vg05_meet_li_muwan',
    ingredients: { item_azure_wood_heart: 1, mat_spirit_herb: 2, mat_elite_core: 1 },
    outputItem: 'item_foundation_pill',
    outputCount: 1,
    affinityGain: { npcId: 'li_muwan', delta: 35 },
  },
  recipe_heaven_parting_pill: {
    id: 'recipe_heaven_parting_pill',
    name: 'Thiên Ly Đan (Chủ Dược Độ Kiếp Kết Đan)',
    requiresFact: 'fact_vg09_furnace_defended',
    ingredients: { mat_spirit_herb: 3, mat_elite_core: 2, item_stone_bead_dew: 2 },
    outputItem: 'pill_heaven_parting',
    outputCount: 1,
    affinityGain: { npcId: 'li_muwan', delta: 50 },
  },
});

export const BOSS_ENCOUNTERS = deepFreeze({
  boss_cloud_wolf_king: {
    id: 'boss_cloud_wolf_king',
    actId: 'VG02',
    name: 'Vân Nha Lang Vương',
    heightPx: 96,
    canvas: [320, 176],
    pivot: [160, 144],
    maxHp: 1200,
    pounceTelegraphMs: 750,
    pounceCorridorWidthPx: 56,
    pounceCorridorLengthPx: 240,
    pounceRecoveryWindowMs: 1400,
    sweepTelegraphMs: 800,
    sweepRadiusPx: 104,
    blackStakeWeakenAttackSpeedReduction: 0.15,
    victoryFact: 'kill_cloud_wolf_king',
    proofItem: 'proof_wolf_king_fang',
  },
  boss_three_seal_construct: {
    id: 'boss_three_seal_construct',
    actId: 'VG04',
    name: 'Tam Ấn Khôi Lỗi',
    heightPx: 128,
    maxHp: 2400,
    sealThresholdsPct: [100, 66, 33],
    sealDurabilityEach: 180,
    staggerDurationMs: 3000,
    staggerDamageTakenMultiplier: 1.5,
    victoryFact: 'kill_three_seal_construct',
    proofItem: 'proof_three_seal_core',
  },
  boss_spirit_ward_elder_tree: {
    id: 'boss_spirit_ward_elder_tree',
    actId: 'VG05',
    name: 'Cổ Mộc Trấn Khí',
    heightPx: 160,
    stationaryRooted: true,
    maxHp: 3200,
    corruptedRootsCount: 3,
    rootEruptionDelayMs: 650,
    coreExposedDurationMs: 6000,
    coreExposedDamageMultiplier: 2.0,
    victoryFact: 'kill_spirit_ward_elder_tree',
    proofItem: 'proof_elder_tree_heart',
  },
  boss_dark_seal_officer: {
    id: 'boss_dark_seal_officer',
    actId: 'VG06',
    name: 'Hắc Ấn Chấp Sự',
    heightPx: 80,
    canvas: [160, 112],
    pivot: [80, 104],
    maxHp: 3800,
    mirageCount: 2,
    mirageDecayOffsetMs: 80,
    mirageIsEntityWithHpOrLoot: false,
    annularRingRadiusPx: 112,
    annularSafeSectorDeg: 90,
    annularTelegraphMs: 1100,
    victoryFact: 'kill_dark_seal_officer',
  },
});

export const PROGRESSION_CONTRACTS = deepFreeze({
  schema: SCHEMA,
  version: CONTRACT_VERSION,
  runtimeIntegrated: false,
  status: 'experimental-fixture-only',
  minClusterAttackStaggerMs: MIN_CLUSTER_ATTACK_STAGGER_MS,
  playerWalkSpeedPxPerS: PLAYER_WALK_SPEED_PX_PER_S,
  identities: IDENTITIES,
  realms: REALMS,
  foundationQualities: FOUNDATION_QUALITIES,
  stances: STANCES,
  artifactFamilies: ARTIFACT_FAMILIES,
  acts: ACTS,
  sandboxActivities: SANDBOX_ACTIVITIES,
  alchemyRecipes: ALCHEMY_RECIPES,
  bossEncounters: BOSS_ENCOUNTERS,
});

/**
 * Pure geometric check for Hắc Ấn Chấp Sự's "Ấn Hồi" (annular_seal_convergence):
 * Ring radius = 112px around bossOrigin, with a 90-degree safe escape wedge centered on `lockedAim`.
 * Returns { inRing, inSafeSector, takesDamage, angleDiffDeg, distancePx }.
 */
export function evaluateAnnularSealSector(playerPos, bossOrigin, lockedAim, ringRadiusPx = 112, safeSectorDeg = 90) {
  const px = requireFinite(playerPos?.x, 'playerPos.x');
  const py = requireFinite(playerPos?.y, 'playerPos.y');
  const bx = requireFinite(bossOrigin?.x, 'bossOrigin.x');
  const by = requireFinite(bossOrigin?.y, 'bossOrigin.y');
  const aim = normalizeAim(lockedAim);
  const dx = px - bx;
  const dy = py - by;
  const distancePx = Math.hypot(dx, dy);

  if (distancePx > ringRadiusPx) {
    return { inRing: false, inSafeSector: true, takesDamage: false, angleDiffDeg: 0, distancePx };
  }
  if (distancePx < 1e-6) {
    return { inRing: true, inSafeSector: false, takesDamage: true, angleDiffDeg: 180, distancePx: 0 };
  }
  const dirX = dx / distancePx;
  const dirY = dy / distancePx;
  const dot = Math.max(-1, Math.min(1, dirX * aim.x + dirY * aim.y));
  const angleDiffDeg = (Math.acos(dot) * 180) / Math.PI;
  const inSafeSector = angleDiffDeg <= safeSectorDeg / 2 + 1e-6;
  return {
    inRing: true,
    inSafeSector,
    takesDamage: !inSafeSector,
    angleDiffDeg: Number(angleDiffDeg.toFixed(4)),
    distancePx: Number(distancePx.toFixed(4)),
  };
}

function computeDerivedStats(cultivation, loadout) {
  const realmDef = REALMS[cultivation.realmId];
  const stageDef = realmDef.subStages.find(s => s.subStage === cultivation.subStage) ?? realmDef.subStages[0];
  const stance = cultivation.activeStanceId ? STANCES[cultivation.activeStanceId] : null;
  const quality = cultivation.foundationQuality ? FOUNDATION_QUALITIES[cultivation.foundationQuality] : null;
  const qualityMult = quality ? quality.statMultiplier : 1.0;
  const stanceHpMult = stance ? stance.maxHpMultiplier : 1.0;

  const maxHp = Math.round(stageDef.baseHp * qualityMult * stanceHpMult);
  const maxMp = Math.round(stageDef.baseMp * qualityMult);
  const attackPower = Math.round(stageDef.baseAttack * qualityMult);
  const cooldownReduction = quality ? quality.cooldownReduction : 0;

  return {
    maxHp,
    maxMp,
    attackPower,
    cooldownReduction,
    jadeTalismanSlots: quality ? quality.jadeTalismanSlots : 0,
    primaryMilestoneTier: loadout.families[loadout.primaryFamily]?.milestoneTier ?? 1,
  };
}

export function createProgressionPrototype(options = {}) {
  const initial = options.initialState ? copy(options.initialState) : null;
  const avatarId = initial?.cultivation?.avatarId ?? options.avatarId ?? 'a';
  if (!IDENTITIES[avatarId]) throw new TypeError(`avatarId must be 'a' (Huyễn Tâm) or 'b' (Tịch Bạch)`);

  let now = initial?.now ?? options.now ?? 0;
  requireFinite(now, 'now');

  const equipmentEngine = options.equipmentEngine ?? createEquipmentEngine(options.world);

  const cultivation = initial?.cultivation ?? {
    avatarId,
    realmId: 'ngung_khi',
    subStage: 1,
    totalCultivationExp: 0,
    activeStanceId: null,
    foundationQuality: null,
    coreAttribute: null,
    nascentSoulDualCast: false,
    domainFieldId: null,
  };

  const loadout = initial?.loadout ?? {
    primaryFamily: 'sword',
    secondaryPrimaryFamily: 'banner',
    supportFamily: 'bead',
    quickSwapUnlocked: false,
    cooldownReadyAt: {
      'sword-st': 0,
      'sword-aoe': 0,
      'banner-st': 0,
      'banner-aoe': 0,
      'chariot-st': 0,
      'chariot-aoe': 0,
      'bead-st': 0,
      'bead-aoe': 0,
    },
    families: {
      sword: { familyId: 'sword', ownership: 'unowned', milestoneTier: 1, soulOrSealStacks: 0, unlockedSkills: [] },
      banner: { familyId: 'banner', ownership: 'unowned', milestoneTier: 1, soulOrSealStacks: 0, unlockedSkills: [] },
      chariot: { familyId: 'chariot', ownership: 'unowned', milestoneTier: 1, soulOrSealStacks: 0, unlockedSkills: [] },
      bead: { familyId: 'bead', ownership: 'unowned', milestoneTier: 1, soulOrSealStacks: 0, unlockedSkills: [] },
    },
  };

  const ledger = initial?.ledger ?? {
    currentActId: 'VG01',
    currentStepId: 'VG01_S1_PICKUP_BEAD',
    completedActs: [],
    completedStepIds: [],
    completedFacts: [],
    unlockedFeatures: [],
    inventory: {
      item_stone_bead_dew: 0,
      mat_cloud_fang: 0,
      mat_wood_sap: 0,
      mat_lesser_beast_soul: 0,
      mat_black_talisman_shard: 0,
      mat_spirit_herb: 0,
      mat_elite_core: 0,
      talisman_seal_breaker: 0,
      pill_clear_heart: 0,
      pill_antidote: 0,
      item_foundation_pill: 0,
      pill_heaven_parting: 0,
    },
    npcAffinity: {
      tran_duy: 10,
      diep_tinh: 10,
      ta_kiem_son: 10,
      bach_chi: 0,
      tong_thiet: 0,
      hua_hanh: 0,
      luc_van: 0,
      situ_nan: 0,
      li_muwan: 0,
    },
    bossKillProofs: {},
    lifesavingJadeActive: false,
  };

  const noiGioi = initial?.noiGioi ?? {
    unlocked: false,
    situNanAwakened: false,
    dewCharges: 0,
    maxDewCharges: 3,
    fiveElements: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
    refinedCommanderSouls: [],
  };

  const events = initial?.events ?? [];

  function emit(type, payload = {}) {
    const event = {
      seq: events.length + 1,
      at: now,
      type,
      fixtureOnly: true,
      ...payload,
    };
    events.push(event);
    return event;
  }

  function hasFact(factId) {
    return ledger.completedFacts.includes(factId);
  }

  function addItem(itemId, count = 1) {
    if (!finite(count) || count <= 0) return;
    ledger.inventory[itemId] = (ledger.inventory[itemId] ?? 0) + count;
    if (itemId === 'item_stone_bead_dew') {
      noiGioi.dewCharges = Math.min(noiGioi.maxDewCharges, ledger.inventory[itemId]);
    }
  }

  function consumeItems(costMap) {
    for (const [itemId, needed] of Object.entries(costMap)) {
      if ((ledger.inventory[itemId] ?? 0) < needed) {
        return { ok: false, missingItem: itemId, needed, have: ledger.inventory[itemId] ?? 0 };
      }
    }
    for (const [itemId, needed] of Object.entries(costMap)) {
      ledger.inventory[itemId] -= needed;
      if (itemId === 'item_stone_bead_dew') {
        noiGioi.dewCharges = Math.min(noiGioi.maxDewCharges, ledger.inventory[itemId]);
      }
    }
    return { ok: true };
  }

  function applyFeatureUnlock(featureId) {
    if (!ledger.unlockedFeatures.includes(featureId)) {
      ledger.unlockedFeatures.push(featureId);
    }
    switch (featureId) {
      case 'bead_m1_discovered':
        loadout.families.bead.ownership = 'discovered';
        loadout.families.bead.milestoneTier = 1;
        break;
      case 'skill_bead_st':
        if (!loadout.families.bead.unlockedSkills.includes('st')) loadout.families.bead.unlockedSkills.push('st');
        break;
      case 'skill_bead_aoe':
        if (!loadout.families.bead.unlockedSkills.includes('aoe')) loadout.families.bead.unlockedSkills.push('aoe');
        break;
      case 'sword_m1_refined':
        loadout.families.sword.ownership = 'refined';
        loadout.families.sword.milestoneTier = 1;
        break;
      case 'skill_sword_st':
        if (!loadout.families.sword.unlockedSkills.includes('st')) loadout.families.sword.unlockedSkills.push('st');
        break;
      case 'skill_sword_aoe':
        if (!loadout.families.sword.unlockedSkills.includes('aoe')) loadout.families.sword.unlockedSkills.push('aoe');
        break;
      case 'banner_m1_refined':
        loadout.families.banner.ownership = 'refined';
        loadout.families.banner.milestoneTier = 1;
        loadout.families.banner.soulOrSealStacks = Math.max(1, loadout.families.banner.soulOrSealStacks);
        break;
      case 'skill_banner_st':
        if (!loadout.families.banner.unlockedSkills.includes('st')) loadout.families.banner.unlockedSkills.push('st');
        break;
      case 'skill_banner_aoe':
        if (!loadout.families.banner.unlockedSkills.includes('aoe')) loadout.families.banner.unlockedSkills.push('aoe');
        break;
      case 'unlock_stance_system':
        if (!cultivation.activeStanceId) cultivation.activeStanceId = 'sword_kill';
        noiGioi.situNanAwakened = true;
        break;
      case 'chariot_m1_sealed':
        loadout.families.chariot.ownership = 'sealed';
        loadout.families.chariot.milestoneTier = 1;
        loadout.families.chariot.soulOrSealStacks = 1;
        break;
      case 'skill_chariot_st':
        if (!loadout.families.chariot.unlockedSkills.includes('st')) loadout.families.chariot.unlockedSkills.push('st');
        break;
      case 'skill_chariot_aoe':
        if (!loadout.families.chariot.unlockedSkills.includes('aoe')) loadout.families.chariot.unlockedSkills.push('aoe');
        break;
      case 'unlock_artifact_quickswap':
        loadout.quickSwapUnlocked = true;
        break;
      case 'bead_m2_refined':
      case 'unlock_bead_inner_realm':
        loadout.families.bead.ownership = 'refined';
        loadout.families.bead.milestoneTier = 2;
        noiGioi.unlocked = true;
        noiGioi.maxDewCharges = 5;
        break;
      case 'banner_m2_refined':
        loadout.families.banner.ownership = 'refined';
        loadout.families.banner.milestoneTier = 2;
        loadout.families.banner.soulOrSealStacks = Math.max(2, loadout.families.banner.soulOrSealStacks);
        break;
      case 'sword_m2_refined':
        loadout.families.sword.ownership = 'refined';
        loadout.families.sword.milestoneTier = 2;
        break;
      case 'chariot_m2_refined':
        loadout.families.chariot.ownership = 'refined';
        loadout.families.chariot.milestoneTier = 2;
        loadout.families.chariot.soulOrSealStacks = 2;
        break;
      case 'bond_li_muwan_lifesaving_jade':
        ledger.lifesavingJadeActive = true;
        break;
      case 'banner_m2_third_commander_soul':
        loadout.families.banner.soulOrSealStacks = 3;
        if (!noiGioi.refinedCommanderSouls.includes('false_core_dark_seal_soul')) {
          noiGioi.refinedCommanderSouls.push('false_core_dark_seal_soul');
        }
        break;
      case 'bead_m2_five_elements_complete':
        noiGioi.fiveElements = { wood: 100, fire: 100, earth: 100, metal: 100, water: 100 };
        break;
      default:
        break;
    }
  }

  /**
   * Evaluates sub-stage progression within the current realm:
   * - Normal sub-stages auto-advance immediately when totalCultivationExp >= expThreshold.
   * - Milestone Gate sub-stages (e.g., Ngưng Khí 3, 6, 9, 12, 15) require BOTH totalCultivationExp >= expThreshold
   *   AND their requiredBreakthroughFact in ledger.completedFacts.
   */
  function evaluateSubStageProgression() {
    const realmDef = REALMS[cultivation.realmId];
    const advancements = [];

    while (cultivation.subStage < realmDef.maxSubStage) {
      const nextSubStage = cultivation.subStage + 1;
      const nextDef = realmDef.subStages.find(s => s.subStage === nextSubStage);
      if (!nextDef) break;
      if (cultivation.totalCultivationExp < nextDef.expThreshold) break;
      if (nextDef.isGate && nextDef.requiredBreakthroughFact && !hasFact(nextDef.requiredBreakthroughFact)) {
        emit('substage_gate_held', {
          realmId: cultivation.realmId,
          waitingForSubStage: nextSubStage,
          requiredBreakthroughFact: nextDef.requiredBreakthroughFact,
          currentExp: cultivation.totalCultivationExp,
          requiredExp: nextDef.expThreshold,
        });
        break;
      }
      cultivation.subStage = nextSubStage;
      const stats = computeDerivedStats(cultivation, loadout);
      const evt = emit('substage_advanced', {
        realmId: cultivation.realmId,
        subStage: cultivation.subStage,
        isGate: nextDef.isGate,
        title: nextDef.title,
        stats,
      });
      advancements.push(evt);
    }
    return advancements;
  }

  function advanceActCursorIfReady() {
    while (ledger.currentActId) {
      const actIndex = ACTS.findIndex(a => a.id === ledger.currentActId);
      if (actIndex === -1) break;
      const act = ACTS[actIndex];
      const nextPendingStep = act.steps.find(s => !ledger.completedStepIds.includes(s.id));
      if (nextPendingStep) {
        ledger.currentStepId = nextPendingStep.id;
        break;
      }
      if (!ledger.completedActs.includes(act.id)) {
        ledger.completedActs.push(act.id);
        emit('act_completed', { actId: act.id, title: act.title });
      }
      const nextAct = ACTS[actIndex + 1];
      if (!nextAct) {
        ledger.currentStepId = null;
        break;
      }
      ledger.currentActId = nextAct.id;
      ledger.currentStepId = nextAct.steps[0]?.id ?? null;
    }
  }

  function gainCultivationExp(amount, source = 'sandbox') {
    requireFinite(amount, 'exp amount');
    if (amount < 0) throw new RangeError('exp amount must be non-negative');
    cultivation.totalCultivationExp += amount;
    emit('exp_gained', { amount, totalCultivationExp: cultivation.totalCultivationExp, source });
    return evaluateSubStageProgression();
  }

  /**
   * Auto-Chain Fact Rule:
   * Recording a fact in the field immediately checks active/pending MenhKiepChi steps,
   * grants rewards, unlocks features, and chains to the next step + sub-stage without NPC walk-backs.
   */
  function recordFact(factId, meta = {}) {
    requireId(factId, 'factId');
    const newlyAdded = !hasFact(factId);
    if (newlyAdded) {
      ledger.completedFacts.push(factId);
      emit('fact_recorded', { factId, ...meta });
    }

    const chainedSteps = [];
    for (const act of ACTS) {
      for (const step of act.steps) {
        if (step.requiredFact === factId && !ledger.completedStepIds.includes(step.id)) {
          ledger.completedStepIds.push(step.id);
          for (const [itemId, count] of Object.entries(step.grantedItems ?? {})) {
            addItem(itemId, count);
          }
          for (const featureId of step.unlockedFeatures ?? []) {
            applyFeatureUnlock(featureId);
          }
          if (step.grantedExp > 0) {
            cultivation.totalCultivationExp += step.grantedExp;
          }
          const stepEvt = emit('act_step_auto_chained', {
            actId: act.id,
            stepId: step.id,
            title: step.title,
            grantedExp: step.grantedExp,
            grantedItems: copy(step.grantedItems ?? {}),
            unlockedFeatures: copy(step.unlockedFeatures ?? []),
            voiceoverSpeaker: step.voiceoverSpeaker,
            voiceoverLine: step.voiceoverLine,
          });
          chainedSteps.push(stepEvt);
        }
      }
    }

    advanceActCursorIfReady();
    const subStageAdvancements = evaluateSubStageProgression();
    return {
      factId,
      newlyAdded,
      chainedSteps,
      subStageAdvancements,
      currentActId: ledger.currentActId,
      currentStepId: ledger.currentStepId,
    };
  }

  function switchStance(stanceId, options = {}) {
    requireId(stanceId, 'stanceId');
    if (!STANCES[stanceId]) throw new TypeError(`Unknown stanceId: ${stanceId}`);
    if (!ledger.unlockedFeatures.includes('unlock_stance_system')) {
      return { accepted: false, reason: 'stance-system-locked-until-vg03' };
    }
    if (options.inCombat === true) {
      return { accepted: false, reason: 'cannot-switch-stance-in-combat' };
    }
    cultivation.activeStanceId = stanceId;
    const stats = computeDerivedStats(cultivation, loadout);
    emit('stance_switched', { stanceId, name: STANCES[stanceId].name, stats });
    return { accepted: true, stanceId, stats };
  }

  function swapPrimaryArtifact(targetFamilyId) {
    if (!loadout.quickSwapUnlocked) {
      return { accepted: false, reason: 'quickswap-locked-until-vg04-tang-12' };
    }
    const target = targetFamilyId ?? loadout.secondaryPrimaryFamily;
    if (!['sword', 'banner', 'chariot'].includes(target)) {
      return { accepted: false, reason: 'invalid-primary-artifact-family' };
    }
    if (loadout.families[target].ownership === 'unowned') {
      return { accepted: false, reason: 'artifact-unowned' };
    }
    const previous = loadout.primaryFamily;
    loadout.primaryFamily = target;
    loadout.secondaryPrimaryFamily = previous;
    emit('primary_artifact_swapped', { primaryFamily: loadout.primaryFamily, secondaryPrimaryFamily: loadout.secondaryPrimaryFamily });
    return { accepted: true, primaryFamily: loadout.primaryFamily, secondaryPrimaryFamily: loadout.secondaryPrimaryFamily };
  }

  function runSandboxActivity(activityId) {
    const activity = SANDBOX_ACTIVITIES[activityId];
    if (!activity) throw new TypeError(`Unknown sandbox activity: ${activityId}`);

    if (activity.kind === 'monster_cluster') {
      const offsets = activity.members.map(m => m.attackOffsetMs).sort((a, b) => a - b);
      for (let i = 1; i < offsets.length; i++) {
        if (offsets[i] - offsets[i - 1] < MIN_CLUSTER_ATTACK_STAGGER_MS) {
          throw new Error(`Cluster ${activityId} violates ${MIN_CLUSTER_ATTACK_STAGGER_MS}ms minimum attack stagger`);
        }
      }
    }

    if (activity.costItems && Object.keys(activity.costItems).length > 0) {
      const consumeResult = consumeItems(activity.costItems);
      if (!consumeResult.ok) {
        return { accepted: false, reason: 'insufficient-items', ...consumeResult };
      }
    }

    for (const [itemId, count] of Object.entries(activity.drops ?? {})) {
      addItem(itemId, count);
    }
    if (activity.affinityGain) {
      const { npcId, delta } = activity.affinityGain;
      ledger.npcAffinity[npcId] = (ledger.npcAffinity[npcId] ?? 0) + delta;
    }
    if (activity.expReward > 0) {
      gainCultivationExp(activity.expReward, `sandbox:${activityId}`);
    }
    for (const factId of activity.grantedFacts ?? []) {
      recordFact(factId, { source: activityId });
    }

    if (
      activityId === 'cluster_wolf_pack' &&
      (ledger.inventory.mat_lesser_beast_soul ?? 0) >= 3 &&
      (ledger.inventory.mat_black_talisman_shard ?? 0) >= 2 &&
      !hasFact('fact_vg02_banner_m1_crafted')
    ) {
      consumeItems({ mat_lesser_beast_soul: 3, mat_black_talisman_shard: 2 });
      recordFact('fact_vg02_banner_m1_crafted', { craftedBy: 'tong_thiet' });
    }

    emit('sandbox_activity_completed', {
      activityId,
      drops: copy(activity.drops ?? {}),
      expReward: activity.expReward,
    });
    return { accepted: true, activityId, inventory: copy(ledger.inventory), totalCultivationExp: cultivation.totalCultivationExp };
  }

  function craftAlchemyRecipe(recipeId) {
    const recipe = ALCHEMY_RECIPES[recipeId];
    if (!recipe) throw new TypeError(`Unknown alchemy recipe: ${recipeId}`);
    if (recipe.requiresFact && !hasFact(recipe.requiresFact)) {
      return { accepted: false, reason: 'recipe-locked', requiredFact: recipe.requiresFact };
    }
    const consume = consumeItems(recipe.ingredients);
    if (!consume.ok) {
      return { accepted: false, reason: 'insufficient-ingredients', ...consume };
    }
    addItem(recipe.outputItem, recipe.outputCount);
    if (recipe.affinityGain) {
      const { npcId, delta } = recipe.affinityGain;
      ledger.npcAffinity[npcId] = (ledger.npcAffinity[npcId] ?? 0) + delta;
    }
    emit('alchemy_crafted', {
      recipeId,
      outputItem: recipe.outputItem,
      outputCount: recipe.outputCount,
    });
    return {
      accepted: true,
      recipeId,
      outputItem: recipe.outputItem,
      outputCount: recipe.outputCount,
      inventory: copy(ledger.inventory),
    };
  }

  function castArtifact(request) {
    const family = request?.family ?? loadout.primaryFamily;
    const mode = request?.mode ?? 'st';
    const contractId = `${family}-${mode}`;
    const familyRecord = loadout.families[family];
    if (!familyRecord || familyRecord.ownership === 'unowned') {
      return { accepted: false, reason: 'artifact-unowned', family, mode };
    }
    if (!familyRecord.unlockedSkills.includes(mode)) {
      return { accepted: false, reason: 'skill-mode-locked', family, mode };
    }
    const startedAt = request?.startedAt ?? now;
    requireFinite(startedAt, 'startedAt');
    if (startedAt > now) now = startedAt;

    const readyAt = loadout.cooldownReadyAt[contractId] ?? 0;
    if (startedAt < readyAt) {
      return { accepted: false, reason: 'artifact-on-cooldown', contractId, readyAt, startedAt };
    }

    const eqResult = equipmentEngine.cast({
      castId: request.castId ?? `cast-${events.length + 1}`,
      actorId: request.actorId ?? `player-${cultivation.avatarId}`,
      family,
      mode,
      startedAt,
      origin: request.origin ?? { x: 0, y: 0 },
      aim: request.aim ?? { x: 1, y: 0 },
      targetId: request.targetId,
      targetLifeId: request.targetLifeId,
    });

    if (!eqResult.accepted) {
      return eqResult;
    }

    const baseCooldown = ARTIFACT_FAMILIES[family].baseCooldownMs[mode];
    const stance = cultivation.activeStanceId ? STANCES[cultivation.activeStanceId] : null;
    const stanceReduction = family === 'sword' && mode === 'st' && stance ? stance.swordStCooldownReductionMs : 0;
    const stats = computeDerivedStats(cultivation, loadout);
    const effectiveCooldownMs = Math.round(Math.max(1000, (baseCooldown - stanceReduction) * (1 - stats.cooldownReduction)));
    loadout.cooldownReadyAt[contractId] = startedAt + effectiveCooldownMs;

    const milestoneDef = ARTIFACT_FAMILIES[family].milestones[familyRecord.milestoneTier];
    let magnitudeMultiplier = milestoneDef.damageMultiplier ?? milestoneDef.supportMultiplier ?? 1.0;
    if (family === 'sword' && stance) magnitudeMultiplier *= stance.swordDamageMultiplier;
    if (family === 'banner' && stance) magnitudeMultiplier *= stance.bannerDamageMultiplier;
    if (family === 'bead' && mode === 'st' && stance) magnitudeMultiplier *= stance.beadShieldMultiplier;
    if (family === 'sword' && familyRecord.milestoneTier >= 2 && request.targetHpRatio !== undefined && request.targetHpRatio < 0.5) {
      magnitudeMultiplier *= milestoneDef.executeBonusMultiplier ?? 1.25;
    }

    const modifierSummary = {
      contractId,
      milestoneTier: familyRecord.milestoneTier,
      activeStanceId: cultivation.activeStanceId,
      magnitudeMultiplier: Number(magnitudeMultiplier.toFixed(4)),
      effectiveCooldownMs,
      readyAt: loadout.cooldownReadyAt[contractId],
      lifestealPerHitHp: family === 'banner' && stance ? Math.round(stats.maxHp * stance.bannerHitLifestealRatio) : 0,
      sealBreakMultiplier: family === 'chariot' ? (stance ? stance.chariotSealBreakMultiplier : milestoneDef.sealBreakMultiplier) : 1.0,
    };

    emit('artifact_cast_accepted', modifierSummary);
    return {
      accepted: true,
      cast: eqResult.cast,
      facts: eqResult.facts,
      modifierSummary,
    };
  }

  function advance(targetNow, worldUpdate) {
    requireFinite(targetNow, 'targetNow');
    if (targetNow < now) throw new RangeError('advance cannot move clock backward');
    now = targetNow;
    const newEquipmentFacts = equipmentEngine.advance(targetNow, worldUpdate);
    return {
      now,
      equipmentFacts: newEquipmentFacts,
    };
  }

  function simulateBossEncounter(bossId, tactics = {}) {
    const boss = BOSS_ENCOUNTERS[bossId];
    if (!boss) throw new TypeError(`Unknown bossId: ${bossId}`);

    if (bossId === 'boss_cloud_wolf_king') {
      const stakesDestroyed = hasFact('fact_black_stakes_destroyed');
      const attackSpeedMultiplier = stakesDestroyed ? 1 - boss.blackStakeWeakenAttackSpeedReduction : 1.0;
      const pounceDodged = tactics.dodgePounceCorridor !== false;
      const punishedRecoveryWindow = tactics.punishRecoveryWindow !== false;
      ledger.bossKillProofs[bossId] = (ledger.bossKillProofs[bossId] ?? 0) + 1;
      if (boss.proofItem && (ledger.inventory[boss.proofItem] ?? 0) === 0) addItem(boss.proofItem, 1);
      const chain = recordFact(boss.victoryFact, {
        bossId,
        stakesDestroyed,
        attackSpeedMultiplier,
        pounceDodged,
        punishedRecoveryWindow,
      });
      return {
        victory: true,
        bossId,
        stakesDestroyed,
        attackSpeedMultiplier,
        pounceRecoveryWindowMs: boss.pounceRecoveryWindowMs,
        chain,
      };
    }

    if (bossId === 'boss_three_seal_construct') {
      const usedSealBreakerTalisman = (ledger.inventory.talisman_seal_breaker ?? 0) > 0 && tactics.useSealBreaker !== false;
      if (usedSealBreakerTalisman) {
        consumeItems({ talisman_seal_breaker: 1 });
      }
      ledger.bossKillProofs[bossId] = (ledger.bossKillProofs[bossId] ?? 0) + 1;
      if (boss.proofItem && (ledger.inventory[boss.proofItem] ?? 0) === 0) addItem(boss.proofItem, 1);
      const chain = recordFact(boss.victoryFact, {
        bossId,
        sealsBroken: 3,
        usedSealBreakerTalisman,
        staggerWindowsTriggered: 3,
      });
      return {
        victory: true,
        bossId,
        sealsBroken: 3,
        usedSealBreakerTalisman,
        staggerDurationMs: boss.staggerDurationMs,
        chain,
      };
    }

    if (bossId === 'boss_spirit_ward_elder_tree') {
      const severedCorruptedRoots = tactics.severedCorruptedRoots ?? 3;
      if (severedCorruptedRoots < boss.corruptedRootsCount) {
        return { victory: false, bossId, reason: 'corrupted-roots-remain-core-closed' };
      }
      ledger.bossKillProofs[bossId] = (ledger.bossKillProofs[bossId] ?? 0) + 1;
      if (boss.proofItem && (ledger.inventory[boss.proofItem] ?? 0) === 0) addItem(boss.proofItem, 1);
      const chain = recordFact(boss.victoryFact, {
        bossId,
        stationaryRooted: true,
        severedCorruptedRoots,
        coreExposedDurationMs: boss.coreExposedDurationMs,
      });
      return {
        victory: true,
        bossId,
        stationaryRooted: true,
        coreExposedDurationMs: boss.coreExposedDurationMs,
        chain,
      };
    }

    if (bossId === 'boss_dark_seal_officer') {
      const bossOrigin = tactics.bossOrigin ?? { x: 0, y: 0 };
      const lockedAim = tactics.lockedAim ?? { x: 1, y: 0 };
      const playerPos = tactics.playerPosAtCollapse ?? { x: 76, y: 12 };
      const sectorCheck = evaluateAnnularSealSector(
        playerPos,
        bossOrigin,
        lockedAim,
        boss.annularRingRadiusPx,
        boss.annularSafeSectorDeg,
      );
      let fatalDamagePreventedByJade = false;
      if (sectorCheck.takesDamage && tactics.lethalHitIfOutsideSafeSector && ledger.lifesavingJadeActive) {
        ledger.lifesavingJadeActive = false;
        fatalDamagePreventedByJade = true;
      }
      const flawless = !sectorCheck.takesDamage && tactics.flawless !== false;
      if (flawless) {
        recordFact('flawless_dark_seal_officer', { bossId });
      }
      ledger.bossKillProofs[bossId] = (ledger.bossKillProofs[bossId] ?? 0) + 1;
      const chain = recordFact(boss.victoryFact, {
        bossId,
        sectorCheck,
        mirageIsEntityWithHpOrLoot: false,
        flawless,
        fatalDamagePreventedByJade,
      });
      return {
        victory: true,
        bossId,
        sectorCheck,
        mirageIsEntityWithHpOrLoot: false,
        flawless,
        fatalDamagePreventedByJade,
        chain,
      };
    }

    throw new TypeError(`Unsupported boss simulation: ${bossId}`);
  }

  function countBossProofs() {
    const proofItems = ['proof_wolf_king_fang', 'proof_three_seal_core', 'proof_elder_tree_heart'];
    return proofItems.filter(id => (ledger.inventory[id] ?? 0) > 0).length;
  }

  function determineEligibleFoundationQuality() {
    const proofs = countBossProofs();
    const flawless = hasFact('flawless_dark_seal_officer');
    if (proofs >= 3 && flawless) return 'heaven';
    if (proofs >= 2) return 'earth';
    return 'mortal';
  }

  function executeFoundationBreakthrough() {
    if (cultivation.realmId !== 'ngung_khi' || cultivation.subStage < 15) {
      return { accepted: false, reason: 'requires-ngung-khi-15' };
    }
    if (!hasFact('kill_dark_seal_officer')) {
      return { accepted: false, reason: 'requires-dark-seal-officer-defeated' };
    }
    const consume = consumeItems({ item_foundation_pill: 1 });
    if (!consume.ok) {
      return { accepted: false, reason: 'requires-foundation-pill', ...consume };
    }

    const qualityId = determineEligibleFoundationQuality();
    recordFact('fact_vg06_foundation_established', { foundationQuality: qualityId });
    cultivation.realmId = 'truc_co';
    cultivation.subStage = 1;
    cultivation.foundationQuality = qualityId;
    cultivation.totalCultivationExp = Math.max(cultivation.totalCultivationExp, REALMS.truc_co.subStages[0].expThreshold);

    const stats = computeDerivedStats(cultivation, loadout);
    emit('foundation_breakthrough_completed', {
      foundationQuality: qualityId,
      qualityName: FOUNDATION_QUALITIES[qualityId].name,
      stats,
    });
    return {
      accepted: true,
      foundationQuality: qualityId,
      qualityName: FOUNDATION_QUALITIES[qualityId].name,
      stats,
    };
  }

  /**
   * Retroactive Foundation Upgrade (Bù Đắp Đạo Cơ):
   * Players who broke through at Mortal or Earth Foundation can collect the missing Boss Proofs
   * and flawless victory later to upgrade their Dao Foundation to Earth or Heaven without bricking.
   */
  function upgradeFoundationQuality() {
    if (!cultivation.foundationQuality) {
      return { accepted: false, reason: 'not-yet-in-foundation-realm' };
    }
    const eligible = determineEligibleFoundationQuality();
    const order = { mortal: 1, earth: 2, heaven: 3 };
    if (order[eligible] <= order[cultivation.foundationQuality]) {
      return { accepted: false, reason: 'no-higher-foundation-quality-eligible', current: cultivation.foundationQuality, eligible };
    }
    const previous = cultivation.foundationQuality;
    cultivation.foundationQuality = eligible;
    const stats = computeDerivedStats(cultivation, loadout);
    emit('foundation_quality_retroactively_upgraded', {
      from: previous,
      to: eligible,
      stats,
    });
    return { accepted: true, from: previous, to: eligible, stats };
  }

  function enterBeadInnerRealm(action = 'meditate', payload = {}) {
    if (!noiGioi.unlocked && !noiGioi.situNanAwakened) {
      return { accepted: false, reason: 'inner-realm-locked' };
    }
    if (action === 'condense_dew') {
      addItem('item_stone_bead_dew', 1);
      emit('inner_realm_dew_condensed', { dewCharges: noiGioi.dewCharges });
      return { accepted: true, action, dewCharges: noiGioi.dewCharges };
    }
    if (action === 'absorb_element') {
      const element = payload.element ?? 'wood';
      if (!(element in noiGioi.fiveElements)) throw new TypeError(`Invalid element: ${element}`);
      noiGioi.fiveElements[element] = Math.min(100, noiGioi.fiveElements[element] + (payload.amount ?? 25));
      emit('inner_realm_element_absorbed', { element, value: noiGioi.fiveElements[element] });
      return { accepted: true, action, fiveElements: copy(noiGioi.fiveElements) };
    }
    if (action === 'refine_banner_m2') {
      if ((ledger.inventory.mat_lesser_beast_soul ?? 0) < 2) {
        return { accepted: false, reason: 'requires-2-beast-souls' };
      }
      consumeItems({ mat_lesser_beast_soul: 2 });
      const chain = recordFact('fact_vg07_banner_m2_refined', { source: 'inner_realm' });
      return { accepted: true, action, chain };
    }
    return { accepted: true, action, situNanAwakened: noiGioi.situNanAwakened };
  }

  function executeCoreFormationTribulation(options = {}) {
    if (cultivation.realmId !== 'truc_co' || cultivation.subStage < 4) {
      return { accepted: false, reason: 'requires-truc-co-vien-man' };
    }
    const consume = consumeItems({ pill_heaven_parting: 1 });
    if (!consume.ok) {
      return { accepted: false, reason: 'requires-heaven-parting-pill', ...consume };
    }
    const wave1Cleared = options.wave1Cleared !== false;
    const wave2HeartDemonCleared = options.wave2HeartDemonCleared !== false;
    const wave3AbsorbedByBead = options.wave3AbsorbedByBead !== false;
    if (!wave1Cleared || !wave2HeartDemonCleared || !wave3AbsorbedByBead) {
      return { accepted: false, reason: 'tribulation-wave-failed' };
    }

    const coreAttribute = options.coreAttribute ?? (
      cultivation.activeStanceId === 'soul_command'
        ? 'soul_core'
        : cultivation.activeStanceId === 'chariot_bulwark'
          ? 'chariot_core'
          : 'sword_core'
    );
    const chain = recordFact('fact_vg11_core_formation_complete', { coreAttribute });
    cultivation.realmId = 'ket_dan';
    cultivation.subStage = 1;
    cultivation.coreAttribute = coreAttribute;
    cultivation.totalCultivationExp = Math.max(cultivation.totalCultivationExp, REALMS.ket_dan.subStages[0].expThreshold);
    const stats = computeDerivedStats(cultivation, loadout);
    emit('core_formation_tribulation_succeeded', { coreAttribute, stats });
    return { accepted: true, realmId: cultivation.realmId, coreAttribute, stats, chain };
  }

  function snapshot() {
    return {
      schema: SCHEMA,
      version: CONTRACT_VERSION,
      now,
      cultivation: copy(cultivation),
      loadout: copy(loadout),
      ledger: copy(ledger),
      noiGioi: copy(noiGioi),
      events: copy(events),
      equipmentSnapshot: equipmentEngine.snapshot(),
    };
  }

  return {
    get now() { return now; },
    get cultivation() { return copy(cultivation); },
    get loadout() { return copy(loadout); },
    get ledger() { return copy(ledger); },
    get noiGioi() { return copy(noiGioi); },
    get stats() { return computeDerivedStats(cultivation, loadout); },
    get events() { return copy(events); },
    get equipmentEngine() { return equipmentEngine; },
    gainCultivationExp,
    recordFact,
    switchStance,
    swapPrimaryArtifact,
    runSandboxActivity,
    craftAlchemyRecipe,
    castArtifact,
    advance,
    simulateBossEncounter,
    executeFoundationBreakthrough,
    upgradeFoundationQuality,
    enterBeadInnerRealm,
    executeCoreFormationTribulation,
    snapshot,
  };
}

export function restoreProgressionPrototype(rawSnapshot) {
  const data = typeof rawSnapshot === 'string' ? JSON.parse(rawSnapshot) : copy(rawSnapshot);
  if (data?.schema !== SCHEMA) throw new TypeError(`Invalid progression snapshot schema: ${data?.schema}`);
  const restoredEq = restoreEquipmentEngine(data.equipmentSnapshot);
  return createProgressionPrototype({
    initialState: data,
    equipmentEngine: restoredEq,
  });
}

/**
 * Deterministic end-to-end walkthrough of Stage 1 (VG01..VG06: Ngưng Khí 1 -> 15 -> Trúc Cơ)
 * and Stage 2 (VG07..VG11: Trúc Cơ Sơ Kỳ -> Viên Mãn -> Kết Đan).
 */
export function runFullStage1To2Walkthrough(avatarId = 'a') {
  const p = createProgressionPrototype({ avatarId });

  // VG01: Ngưng Khí 1 -> 3
  p.recordFact('fact_vg01_stone_bead_picked');
  p.recordFact('fact_vg01_training_puppets_cleared');
  p.recordFact('fact_vg01_qi_conduit_trial');

  // VG02: Sandbox Ngoại Vi + Tiểu Hồn Phiên + Vân Nha Lang Vương (Ngưng Khí 4 -> 6)
  p.runSandboxActivity('adv_rescue_herbalist');
  p.runSandboxActivity('adv_destroy_black_talisman_stakes');
  p.runSandboxActivity('cluster_wolf_pack');
  p.runSandboxActivity('cluster_wolf_pack');
  p.runSandboxActivity('cluster_wolf_pack');
  p.simulateBossEncounter('boss_cloud_wolf_king');

  // VG03: Tư Đồ Nam thức tỉnh + 3 Khuynh hướng Công pháp + giải mã Hắc Ấn (Ngưng Khí 7 -> 9)
  p.recordFact('fact_vg03_situ_nan_met');
  p.switchStance('sword_kill');
  p.recordFact('fact_vg03_black_seal_decoded');
  p.craftAlchemyRecipe('recipe_seal_breaker_talisman');

  // VG04: Khe Đá Rạn + Tam Ấn Khôi Lỗi + Xạ Thần Xa Mốc I (Ngưng Khí 10 -> 12)
  p.runSandboxActivity('cluster_beetle_gorge');
  p.recordFact('fact_vg04_gorge_elites_cleared');
  p.simulateBossEncounter('boss_three_seal_construct');
  p.swapPrimaryArtifact('chariot');

  // VG05: Rừng Cổ Mộc + Lý Mộ Uyển + Cổ Mộc Trấn Khí + Nội Giới Hộ Đạo (Ngưng Khí 13 -> 15)
  p.runSandboxActivity('cluster_mushroom_woods');
  p.recordFact('fact_vg05_meet_li_muwan');
  p.simulateBossEncounter('boss_spirit_ward_elder_tree', { severedCorruptedRoots: 3 });
  p.craftAlchemyRecipe('recipe_foundation_pill');

  // VG06: Hắc Ấn Chấp Sự (vượt khe 90° Ấn Hồi) + Thiên Đạo Trúc Cơ
  p.simulateBossEncounter('boss_dark_seal_officer', {
    bossOrigin: { x: 0, y: 0 },
    lockedAim: { x: 1, y: 0 },
    playerPosAtCollapse: { x: 80, y: 15 },
    flawless: true,
  });
  p.executeFoundationBreakthrough();

  // VG07: Quyết Minh Cốc + Không Gian Nội Giới + Hồn Phiên Mốc II
  p.runSandboxActivity('cluster_corpse_sect_raiders');
  p.enterBeadInnerRealm('refine_banner_m2');

  // VG08: Hàn Thiết Kiếm Mộ + Thu phục Hứa Lập Quốc (Kiếm Linh Mốc II)
  p.gainCultivationExp(800, 'sword_tomb_exploration');
  p.recordFact('fact_vg08_xu_liguo_subdued');

  // VG09: Hộ Đạo Đan Thất Lý Mộ Uyển + Xạ Thần Xa Mốc II + Thiên Ly Đan
  p.recordFact('fact_vg09_furnace_defended');

  // VG10: Huyết Đàn Ngoại Vực + Chân Thân Hắc Ấn Giả Đan + Chủ Hồn Thứ Ba
  p.recordFact('kill_dark_seal_true_body');

  // VG11: Độ Kiếp Kết Đan (Tam Trọng Kiếp Lôi)
  p.executeCoreFormationTribulation({
    wave1Cleared: true,
    wave2HeartDemonCleared: true,
    wave3AbsorbedByBead: true,
    coreAttribute: 'sword_core',
  });

  return p;
}

export {
  EQUIPMENT_CONTRACTS,
  geometryFor,
  viewAt,
  pointInShape,
  targetIntersectsShape,
};

