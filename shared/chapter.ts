import type { Position } from './world/types';
import type { ActiveCast, Projectile, TrainingTarget } from './skills/contracts';
import { HANG_NHAC } from './hang-nhac';
import { moveUsingCollision } from './world/movement';
import type { R01MotionState } from './skills/contracts';
import type { Direction } from './world/types';
import {validBasicStrike,type BasicStrike,type EnemyPresentation} from './actor-actions';

export const CHAPTER_QUESTS=['HN05','HN06','HN07','HN08','HN09','HN10','HN11','HN12','EX01','EX02','EX03','EX04'] as const;
export type ChapterQuestId=typeof CHAPTER_QUESTS[number];
export const MATERIAL_IDS=['hn-refining-material','vh-clean-herb','vh-clear-water','vh-soft-fiber','vh-conductive-sand','vh-stable-jade','vh-guiding-ink'] as const;
export type MaterialId=typeof MATERIAL_IDS[number];
export const CHAPTER_ITEMS={
 'hn-refining-material':{name:'Mảnh Hắc Phù & Yêu Hồn',kind:'material',description:'Chiến lợi phẩm từ Ngoại Vi & Vân Nha Lang Vương (VG02).',effect:'Dùng luyện Phá Cấm Phù và khai mở Hộ Tâm Khiên.',art:'hn-refining-material'},
 'hn-training-jade':{name:'Thiên Nghịch Hộ Tâm Ngọc',kind:'gear',slot:'charm',description:'Ngọc giản hộ mệnh dung hợp Linh Lộ Thiên Nghịch Châu.',effect:'Nội Giới Hộ Đạo (phím G): 15 MP · 12 giây hồi · giảm 50% sát thương đòn hiểm.',art:'hn-training-jade-refined'},
 'vh-clean-herb':{name:'Linh Thảo Quyết Minh',kind:'material',description:'Thảo dược tinh thuần thu thập tại Rừng Cổ Mộc & Quyết Minh Cốc.',effect:'Chủ dược luyện Thanh Tâm Đan, Trúc Cơ Đan và Thiên Ly Đan.',art:'vh-clean-herb'},
 'vh-clear-water':{name:'Lộ Thủy Ngũ Vân',kind:'material',description:'Linh dịch ngưng tụ từ Thiên Nghịch Châu và mạch ngầm Quyết Minh Cốc.',effect:'Dung môi luyện chế đan dược của Lý Mộ Uyển.',art:'vh-clear-water'},
 'vh-soft-fiber':{name:'Linh Dịch Cổ Mộc',kind:'material',description:'Tinh hoa mộc tâm thu được khi phá giải Cổ Mộc Trấn Khí (VG05).',effect:'Phụ dược luyện Trúc Cơ Đan và Thiên Ly Đan.',art:'vh-soft-fiber'},
 'vh-conductive-sand':{name:'Tinh Hạch Tinh Anh',kind:'material',description:'Lõi linh lực kết tinh từ Khôi Lỗi và Yêu Thú Tinh Anh.',effect:'Cường hóa đan hỏa và giải ấn Pháp Bảo Mốc II–III.',art:'vh-conductive-sand'},
 'vh-stable-jade':{name:'Thanh Mộc Linh Tâm',kind:'material',description:'Lõi mộc linh ngàn năm từ Cổ Mộc Trấn Khí (VG05).',effect:'Chủ dược tối quan trọng để Lý Mộ Uyển khai lò luyện Trúc Cơ Đan.',art:'vh-stable-jade'},
 'vh-guiding-ink':{name:'Phá Cấm Linh Dịch',kind:'material',description:'Linh dịch khắc chế cổ ấn trong Trường Khảo Nghiệm.',effect:'Hỗ trợ phá giải Tam Ấn Khôi Lỗi và trận pháp Hắc Ấn.',art:'vh-guiding-ink'},
 'vh-sealed-case':{name:'Trúc Cơ Đan (Lý Mộ Uyển)',kind:'tool',description:'Linh đan thượng phẩm do Lý Mộ Uyển đích thân khai lò luyện chế.',effect:'Trợ lực ngưng tụ Đạo Đài và đột phá Đại Cảnh Giới Trúc Cơ (VG06).',art:'vh-sealed-case'},
 'vh-flow-compass':{name:'Thiên Ly Đan (Kết Đan Chủ Dược)',kind:'tool',description:'Bảo đan hộ mệnh của Lý Mộ Uyển dành cho kỳ Độ Kiếp Kết Đan.',effect:'Hộ tâm trước Tam Trọng Kiếp Lôi khi đột phá Kết Đan Sơ Kỳ (VG11).',art:'vh-flow-compass'},
} as const;
export type ChapterItemId=keyof typeof CHAPTER_ITEMS;
export interface ChapterRecipe {id:string;stage:string;requires:string[];consume:Partial<Record<MaterialId,number>>;keep:Record<string,number>;produce:Record<string,number>;transform?:{item:string;from:string;to:string;sameInstance:boolean};effect?:{id:string;scope:string;onTripEnd:string;preStartCancel:string;postStartRefund:boolean}}
export const CHAPTER_RECIPES:ChapterRecipe[]=[
 {id:'hn-refine-training-jade',stage:'VP1',requires:['HN08-accepted','hn-guard-method'],consume:{'hn-refining-material':4},keep:{'hn-training-jade':1},produce:{},transform:{item:'hn-training-jade',from:'raw',to:'refined',sameInstance:true}},
 {id:'vh-recipe-ink',stage:'VP2',requires:['EX01-completed'],consume:{'vh-conductive-sand':1,'vh-clear-water':1},keep:{},produce:{'vh-guiding-ink':1}},
 {id:'vh-recipe-recovery',stage:'VP2',requires:['EX01-completed'],consume:{'vh-clean-herb':2,'vh-clear-water':1},keep:{},produce:{recovery:1}},
 {id:'vh-recipe-case',stage:'VP2',requires:['EX02-completed'],consume:{'vh-soft-fiber':2,'vh-stable-jade':1},keep:{},produce:{'vh-sealed-case':1}},
 {id:'vh-recipe-compass',stage:'VP3',requires:['EX03-completed'],consume:{'vh-soft-fiber':1,'vh-stable-jade':2,'vh-conductive-sand':1},keep:{},produce:{'vh-flow-compass':1}},
 {id:'vh-recipe-seal',stage:'VP2',requires:['EX03-accepted','trip-not-started'],consume:{'vh-guiding-ink':1},keep:{'vh-sealed-case':1},produce:{},effect:{id:'trip-seal',scope:'one-character-one-trip',onTripEnd:'clear-effect-keep-tool',preStartCancel:'refund-once-and-clear-effect',postStartRefund:false}},
];
export interface G2RewardItem {
 id:string;
 name:string;
 icon:string;
 rarity:'artifact'|'pill'|'material'|'realm';
 count?:string;
}
export function g2ItemIcon(id:string):string{
 switch(id){
  case 'bead':case 'g2-bead':return '/assets/g2-items/bead.png';
  case 'sword':case 'g2-sword':case 'wood-sword':return '/assets/g2-items/sword.png';
  case 'banner':case 'g2-banner':return '/assets/g2-items/banner.png';
  case 'chariot':case 'g2-chariot':return '/assets/g2-items/chariot.png';
  case 'tu-vi':case 'cultivation':return '/assets/g2-items/tu-vi-orb.png';
  case 'soul-orb':case 'soul-fragment':return '/assets/g2-items/soul-orb.png';
  case 'truc-co-dai':case 'seal':return '/assets/g2-items/truc-co-dai.png';
  case 'kim-dan':return '/assets/g2-items/kim-dan.png';
  case 'ngung-khi-quyet':case 'manual':return '/assets/g2-items/ngung-khi-quyet.png';
  case 'hai-do':return '/assets/g2-items/hai-do-tu-ma.png';
  case 'sword_kill':return '/assets/g2-items/stance-kiem-sat.png';
  case 'soul_command':return '/assets/g2-items/stance-ngu-hon.png';
  case 'chariot_bulwark':return '/assets/g2-items/stance-tran-nhac.png';
  case 'recovery':case 'recipe_clear_heart_pill':return '/assets/character-ui-v2/lotus-pill.webp';
  case 'hn-training-jade':case 'recipe_seal_breaker_talisman':return '/assets/character-ui-v2/jade-charm.webp';
  case 'vh-sealed-case':case 'recipe_foundation_pill':return '/assets/character-ui-v2/spirit-pill.webp';
  case 'vh-flow-compass':case 'recipe_heaven_parting_pill':return '/assets/character-ui-v2/cloud-pearl.webp';
  case 'plain-robe':return '/assets/character-ui-v2/cloud-robe.webp';
  default:return `/assets/van-ngoc-gameplay-v1/${id}-64.png`;
 }
}
export interface G2AlchemyRecipe {
 id:'recipe_clear_heart_pill'|'recipe_seal_breaker_talisman'|'recipe_foundation_pill'|'recipe_heaven_parting_pill';
 name:string;
 actReq:G2ActId;
 description:string;
 effect:string;
 iconItem:string;
 icon:string;
 consume:Partial<Record<MaterialId,number>>;
}
export const G2_ALCHEMY_RECIPES:readonly G2AlchemyRecipe[]=[
 {id:'recipe_clear_heart_pill',name:'Thanh Tâm Đan (Hồi Phục Linh Lực & Khí Huyết)',actReq:'VG01',
  description:'Đan phương nhập môn từ Lộ Thủy Ngũ Vân và Linh Thảo Ngoại Vi, giúp tịnh tâm, hồi phục Khí Huyết & nhận 2 Hồi Xuân Đan.',
  effect:'+2 Hồi Xuân Đan · Hồi đầy 100% HP & MP tức thì',iconItem:'recovery',icon:'/assets/character-ui-v2/lotus-pill.webp',
  consume:{'vh-clean-herb':1,'vh-clear-water':1}},
 {id:'recipe_seal_breaker_talisman',name:'Phá Cấm Phù & Thiên Nghịch Hộ Tâm Ngọc',actReq:'VG03',
  description:'Dùng Mảnh Hắc Phù và thần thức Tư Đồ Nam luyện hóa Phá Cấm Phù khắc chế Tam Ấn Khôi Lỗi, đồng thời khai mở Hộ Tâm Khiên (phím G).',
  effect:'Khắc chế Tam Ấn Khôi Lỗi (VG04) · Mở Nội Giới Hộ Đạo (phím G giảm 50% sát thương)',iconItem:'hn-training-jade',icon:'/assets/character-ui-v2/jade-charm.webp',
  consume:{'hn-refining-material':2}},
 {id:'recipe_foundation_pill',name:'Trúc Cơ Đan (Chủ Dược Lý Mộ Uyển)',actReq:'VG05',
  description:'Chủ dược do Lý Mộ Uyển đích thân khai lò từ Thanh Mộc Linh Tâm của Cổ Mộc Trấn Khí, trợ lực ngưng tụ Đạo Đài và đột phá Đại Cảnh Giới Trúc Cơ.',
  effect:'Chủ dược Đột Phá Trúc Cơ (VG06) · Tăng tỷ lệ thành tựu Thiên Đạo Trúc Cơ',iconItem:'vh-sealed-case',icon:'/assets/character-ui-v2/spirit-pill.webp',
  consume:{'vh-clean-herb':2,'vh-stable-jade':1}},
 {id:'recipe_heaven_parting_pill',name:'Thiên Ly Đan (Chủ Dược Độ Kiếp Kết Đan)',actReq:'VG09',
  description:'Bảo đan hộ mệnh của Lý Mộ Uyển tại Quyết Minh Cốc, dùng Linh Thảo, Lộ Thủy Ngũ Vân và Tinh Hạch Tinh Anh để nghênh đón Tam Trọng Kiếp Lôi.',
  effect:'Chủ dược Độ Kiếp Kết Đan (VG11) · Hộ tâm kết tụ Bổn Mệnh Kim Đan',iconItem:'vh-flow-compass',icon:'/assets/character-ui-v2/cloud-pearl.webp',
  consume:{'vh-clean-herb':2,'vh-clear-water':2,'vh-conductive-sand':1}},
];
export type G2ActId='VG01'|'VG02'|'VG03'|'VG04'|'VG05'|'VG06'|'VG07'|'VG08'|'VG09'|'VG10'|'VG11';
export const G2_ACT_IDS:readonly G2ActId[]=['VG01','VG02','VG03','VG04','VG05','VG06','VG07','VG08','VG09','VG10','VG11'] as const;
export const CHAPTER_VG_IDS:Record<ChapterQuestId,G2ActId>={HN05:'VG02',HN06:'VG03',HN07:'VG04',HN08:'VG05',HN09:'VG05',HN10:'VG06',HN11:'VG07',HN12:'VG08',EX01:'VG09',EX02:'VG10',EX03:'VG11',EX04:'VG11'};
export const CHAPTER_TITLES:Record<ChapterQuestId,string>={
 HN05:'Hồi II: Máu Nhuộm Ngoại Vi & Săn Lùng Lang Vương',
 HN06:'Hồi III: Bí Mật Thức Hải & Ba Khuynh Hướng Công Pháp',
 HN07:'Hồi IV: Sát Cơ Trường Khảo Nghiệm — Tam Ấn Khôi Lỗi',
 HN08:'Hồi V: Giải Vây Đoàn Dược Sư & Kết Nhân Duyên Lý Mộ Uyển',
 HN09:'Hồi V: Rừng Cổ Mộc, Gặp Lý Mộ Uyển & Cổ Mộc Trấn Khí',
 HN10:'Hồi VI: Đại Kiếp Nạn Hằng Nhạc — Hắc Ấn Chấp Sự & Trúc Cơ',
 HN11:'Hồi VII: Phong Vân Quyết Minh Cốc & Mở Không Gian Nội Giới',
 HN12:'Hồi VIII: Hung Linh Nhập Kiếm — Thu Phục Hứa Lập Quốc',
 EX01:'Hồi IX: Hộ Đạo Đan Tâm — Bảo Vệ Lò Đan Lý Mộ Uyển',
 EX02:'Hồi X: Đoạt Mệnh Chân Thân — Huyết Đàn Ngoại Vực',
 EX03:'Hồi XI: Tiến Vào Tu Ma Hải — Độ Kiếp Kết Đan',
 EX04:'Hồi XI: Khai Mở Đại Mạc Tu Ma Hải & Viên Mãn Pháp Bảo Mốc III',
};
export const CHAPTER_BRIEFS:Record<ChapterQuestId,string>={
 HN05:'VG02 (Ngưng Khí 4 → 6) · Thu thập Yêu Hồn luyện Tiểu Hồn Phiên (Mốc I), truy kích và hạ gục Vân Nha Lang Vương (né 2 nhịp vồ quét) để thu Mảnh Lệnh Bài Hắc Ấn.',
 HN06:'VG03 (Ngưng Khí 7 → 9) · Vào Mộng Cảnh Châu Đá đánh thức Tàn Hồn Tư Đồ Nam, mở 3 Khuynh hướng Công pháp (Kiếm Sát / Ngự Hồn / Trấn Nhạc) và giải mã Hắc Ấn mở đường Khe Đá Rạn.',
 HN07:'VG04 (Ngưng Khí 10 → 12) · Vượt Khe Đá Rạn tiến vào Trường Khảo Nghiệm, phá vỡ 3 đạo cổ ấn của Tam Ấn Khôi Lỗi sau nhịp dậm đất và khai mở Xạ Thần Xa (Mốc I).',
 HN08:'VG05 (Ngưng Khí 13 → 15) · Giải vây đoàn dược sư ở Rừng Cổ Mộc, kết nhân duyên cùng Lý Mộ Uyển và mở Lò Đan Nội Giới.',
 HN09:'VG05 (Ngưng Khí 13 → 15) · Kết nhân duyên Lý Mộ Uyển, chặt rễ Hắc Ấn hạ gục Cổ Mộc Trấn Khí, đoạt Thanh Mộc Linh Tâm luyện Trúc Cơ Đan và mở kỹ năng Nội Giới Hộ Đạo (phím G).',
 HN10:'VG06 (Ngưng Khí 15 → Trúc Cơ) · Quyết chiến Hắc Ấn Chấp Sự qua 3 pha (Đạo Ấn → Phân Phù → Ấn Hồi, lách vào khe sáng 90° hướng khóa), dựng Đạo Đài và đột phá Đại Cảnh Giới Trúc Cơ.',
 HN11:'VG07 (Trúc Cơ Sơ Kỳ) · Tiến vào Quyết Minh Cốc, mở Không Gian Nội Giới Thiên Nghịch Châu (Mốc II) và luyện thành Tam Môn Tôn Hồn Phiên (Mốc II).',
 HN12:'VG08 (Trúc Cơ Trung Kỳ) · Tiến vào Hàn Thiết Kiếm Mộ, trấn áp và thu phục hung linh Hứa Lập Quốc để tiến hóa Kiếm Linh lên Mốc II.',
 EX01:'VG09 (Trúc Cơ Hậu Kỳ) · Chặn 3 đợt tập kích của Âm Thi Tông bảo vệ Đan Thất Lý Mộ Uyển, giải ấn Xạ Thần Xa Mốc II (Lôi Thú) và nhận Thiên Ly Đan.',
 EX02:'VG10 (Trúc Cơ Viên Mãn) · Phá Huyết Đàn Ngoại Vực, tiêu diệt Chân Thân Hắc Ấn Chấp Sự (Giả Đan) và thu nạp Chủ Hồn thứ ba vào Hồn Phiên.',
 EX03:'VG11 (Trúc Cơ Viên Mãn → Kết Đan Sơ Kỳ) · Nghênh đón Tam Trọng Kiếp Lôi bằng Thiên Nghịch Châu & Thiên Ly Đan, kết tụ Bổn Mệnh Kim Đan và tiến hóa 4 Pháp Bảo lên Mốc III.',
 EX04:'VG11 · Hoàn tất Độ Kiếp Kết Đan, khai mở toàn diện bản đồ Tu Ma Hải.',
};
export const CHAPTER_REPORT_RESPONSES={
 test:'Lý Mộ Uyển (Quyết Minh Cốc): “Đa tạ đạo hữu hộ pháp! Trúc Cơ Đan và Thiên Ly Đan đã thành, đạo đài của huynh nhất định vững chắc.”',
 record:'Tư Đồ Nam (Thiên Nghịch Châu): “Hắc Ấn chỉ là con tốt thí của Âm Thi Tông. Cứ luyện đủ 4 Pháp Bảo rồi tiến thẳng vào Tu Ma Hải!”',
} as const;
export const CHAPTER_REWARDS:Record<ChapterQuestId,number>={HN05:100,HN06:120,HN07:240,HN08:300,HN09:360,HN10:0,HN11:0,HN12:0,EX01:0,EX02:0,EX03:0,EX04:0};

export interface G2ActSpec {
 id:G2ActId;
 stage:1|2;
 title:string;
 realmRange:string;
 chapterQuest?:ChapterQuestId;
 encounterQuest?:ChapterQuestId;
 description:string;
 reward:string;
 speaker:string;
 portrait:string;
 voiceover:string;
 rewardItems:G2RewardItem[];
 objectives:{id:string;text:string}[];
}
export const G2_ACTS:readonly G2ActSpec[]=[
 {id:'VG01',stage:1,title:'Hồi I: Phế Sài Nhập Môn & Cơ Duyên Dưới Vực',realmRange:'Ngưng Khí 1 → 3',
  description:'Gặp Trần Duy nhặt Châu Đá Ngũ Vân (Thiên Nghịch Châu Mốc I), tới Diệp Tĩnh lĩnh Thanh Phong Linh Kiếm (Kiếm Linh Mốc I), ra bãi tập Tạ Kiếm Sơn phá Khôi Lỗi Rạn Ngọc và đột phá Ngưng Khí Tầng 3.',
  reward:'+390 Tu vi · Thiên Nghịch Châu Mốc I · Kiếm Linh Mốc I · Ngưng Khí Quyết',
  speaker:'Trần Duy · Tiếp Dẫn',portrait:'/assets/g2-items/npc-tran-duy.png',
  voiceover:'“Năm đám mây khắc trên châu đá khẽ xoay chuyển, một giọt lộ thủy lành lạnh thấm vào kinh mạch.”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+390'},
   {id:'bead',name:'Thiên Nghịch Châu (Mốc I)',icon:'/assets/g2-items/bead.png',rarity:'artifact'},
   {id:'sword',name:'Thanh Phong Linh Kiếm (Mốc I)',icon:'/assets/g2-items/sword.png',rarity:'artifact'},
   {id:'ngung-khi-quyet',name:'Ngưng Khí Quyết (Tầng 3)',icon:'/assets/g2-items/ngung-khi-quyet.png',rarity:'realm'},
   {id:'vh-clear-water',name:'Lộ Thủy Ngũ Vân',icon:'/assets/van-ngoc-gameplay-v1/vh-clear-water-64.png',rarity:'material',count:'×2'},
   {id:'recovery',name:'Hồi Xuân Linh Đan',icon:'/assets/character-ui-v2/lotus-pill.webp',rarity:'pill',count:'×2'},
  ],
  objectives:[
   {id:'bead',text:'Gặp Trần Duy (Cổng Vân Liệt) nhặt Châu Đá Ngũ Vân (Thiên Nghịch Châu Mốc I)'},
   {id:'sword',text:'Gặp Diệp Tĩnh (Thềm Tụ Khí) khai mạch & Lĩnh Thanh Phong Linh Kiếm (Kiếm Linh Mốc I)'},
   {id:'conduit',text:'Tới Bãi Tập Tạ Kiếm Sơn vung kiếm phá Khôi Lỗi Rạn Ngọc & Đột Phá Ngưng Khí Tầng 3'},
  ]},
 {id:'VG02',stage:1,title:'Hồi II: Máu Nhuộm Ngoại Vi & Săn Lùng Lang Vương',realmRange:'Ngưng Khí 4 → 6',chapterQuest:'HN05',encounterQuest:'HN05',
  description:'Tiến vào Bí Cảnh Ngoại Vi Hằng Nhạc, hạ gục Vân Nha Lang Vương bằng Kiếm Linh để thu thập Yêu Hồn luyện Tiểu Hồn Phiên (Mốc I) và đoạt Mảnh Lệnh Bài Hắc Ấn.',
  reward:'+580 Tu vi · Tiểu Hồn Phiên Mốc I · Mảnh Lệnh Bài Hắc Ấn · Mở Ngưng Khí 4–6',
  speaker:'Vân Nha Lang Vương',portrait:'/assets/g2-items/boss-wolf.png',
  voiceover:'“Trong cổ họng Lang Vương lại găm mảnh lệnh bài Hắc Ấn... Kẻ đứng sau không phải yêu thú thường.”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+580'},
   {id:'banner',name:'Tiểu Hồn Phiên (Mốc I)',icon:'/assets/g2-items/banner.png',rarity:'artifact'},
   {id:'hn-refining-material',name:'Mảnh Lệnh Bài Hắc Ấn & Yêu Hồn',icon:'/assets/van-ngoc-gameplay-v1/hn-refining-material-64.png',rarity:'material',count:'×3'},
   {id:'recovery',name:'Hồi Xuân Linh Đan',icon:'/assets/character-ui-v2/lotus-pill.webp',rarity:'pill',count:'×2'},
  ],
  objectives:[
   {id:'banner',text:'Vào Bí Cảnh Ngoại Vi & Hạ gục Vân Nha Lang Vương'},
   {id:'wolf',text:'Thu thập Yêu Hồn luyện Tiểu Hồn Phiên (Mốc I) & Nhận Đạo Quả'},
  ]},
 {id:'VG03',stage:1,title:'Hồi III: Bí Mật Thức Hải & Ba Khuynh Hướng Công Pháp',realmRange:'Ngưng Khí 7 → 9',chapterQuest:'HN06',encounterQuest:'HN06',
  description:'Tiến vào Khe Đá Rạn & Mộng Cảnh Châu Đá, thu thập 2 mẫu Linh Ấn Cổ Tịch (phím E), đánh thức Tàn Hồn Tư Đồ Nam và mở 3 Khuynh hướng Công pháp.',
  reward:'+760 Tu vi · Mở Thức Hải Tư Đồ Nam (3 Khuynh hướng Công pháp) · 2 Mảnh Hắc Phù',
  speaker:'Tư Đồ Nam · Thức Hải',portrait:'/assets/g2-items/npc-situ-nan.png',
  voiceover:'“Tiểu tử, ngủ suốt bao năm trong viên châu này cuối cùng cũng gặp được người có chút huyết tính!”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+760'},
   {id:'sword_kill',name:'Kiếm Sát Quyết (Tư Đồ Nam)',icon:'/assets/g2-items/stance-kiem-sat.png',rarity:'realm'},
   {id:'soul_command',name:'Ngự Hồn Quyết (Tư Đồ Nam)',icon:'/assets/g2-items/stance-ngu-hon.png',rarity:'realm'},
   {id:'chariot_bulwark',name:'Trấn Nhạc Quyết (Tư Đồ Nam)',icon:'/assets/g2-items/stance-tran-nhac.png',rarity:'realm'},
   {id:'hn-refining-material',name:'Mảnh Hắc Phù Cổ Tịch',icon:'/assets/van-ngoc-gameplay-v1/hn-refining-material-64.png',rarity:'material',count:'×2'},
  ],
  objectives:[
   {id:'situ',text:'Tiến vào Khe Đá Rạn, thu thập 2 Mẫu Linh Ấn (Phím E) giải mã Hắc Ấn'},
   {id:'decode',text:'Đánh thức Tàn Hồn Tư Đồ Nam & Chọn Khuynh hướng Công pháp'},
  ]},
 {id:'VG04',stage:1,title:'Hồi IV: Sát Cơ Trường Khảo Nghiệm — Tam Ấn Khôi Lỗi',realmRange:'Ngưng Khí 10 → 12',chapterQuest:'HN07',encounterQuest:'HN07',
  description:'Tiến vào Trường Khảo Nghiệm 2D, né nhịp dậm đất và đánh vỡ cổ ấn của Tam Ấn Khôi Lỗi khi nó lộ sơ hở để khai mở Xạ Thần Xa (Mốc I).',
  reward:'+1050 Tu vi · Xạ Thần Xa Mốc I · Lõi Khôi Lỗi Tam Ấn · Mở Ngưng Khí 10–12',
  speaker:'Tam Ấn Khôi Lỗi',portrait:'/assets/g2-items/boss-puppet.png',
  voiceover:'“Lõi chiến xa cổ tu này sát khí cực nặng! Ta giúp ngươi mở tầng ấn thứ nhất trước.”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+1050'},
   {id:'chariot',name:'Xạ Thần Xa · Giải Ấn Nhất Tầng (Mốc I)',icon:'/assets/g2-items/chariot.png',rarity:'artifact'},
   {id:'vh-conductive-sand',name:'Lõi Khôi Lỗi Tinh Hạch',icon:'/assets/van-ngoc-gameplay-v1/vh-conductive-sand-64.png',rarity:'material',count:'×2'},
  ],
  objectives:[
   {id:'elites',text:'Tiến vào Trường Khảo Nghiệm & Phá cổ ấn Tam Ấn Khôi Lỗi'},
   {id:'construct',text:'Thu phục Lõi Chiến Xa & Khai mở Xạ Thần Xa (Mốc I)'},
  ]},
 {id:'VG05',stage:1,title:'Hồi V: Rừng Cổ Mộc, Gặp Lý Mộ Uyển & Cổ Mộc Trấn Khí',realmRange:'Ngưng Khí 13 → 15',chapterQuest:'HN09',encounterQuest:'HN09',
  description:'Tiến vào Rừng Cổ Mộc 2D giải vây đoàn dược sư, kết nhân duyên Lý Mộ Uyển, chặt rễ hạ gục Cổ Mộc Trấn Khí đoạt Thanh Mộc Linh Tâm và mở kỹ năng Nội Giới Hộ Đạo (phím G).',
  reward:'+1500 Tu vi · Mở Lò Đan Lý Mộ Uyển · Thanh Mộc Linh Tâm · Nội Giới Hộ Đạo (G)',
  speaker:'Lý Mộ Uyển · Dược Sư',portrait:'/assets/g2-items/npc-li-muwan.png',
  voiceover:'“Đa tạ đạo hữu ra tay tương trợ. Nếu có Thanh Mộc Linh Tâm, Mộ Uyển nguyện giúp đạo hữu luyện Trúc Cơ Đan.”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+1500'},
   {id:'hn-training-jade',name:'Thiên Nghịch Hộ Tâm Ngọc (Phím G)',icon:'/assets/character-ui-v2/jade-charm.webp',rarity:'artifact'},
   {id:'vh-stable-jade',name:'Thanh Mộc Linh Tâm',icon:'/assets/van-ngoc-gameplay-v1/vh-stable-jade-64.png',rarity:'material',count:'×2'},
   {id:'vh-clean-herb',name:'Linh Thảo Quyết Minh',icon:'/assets/van-ngoc-gameplay-v1/vh-clean-herb-64.png',rarity:'material',count:'×4'},
  ],
  objectives:[
   {id:'limuwan',text:'Vào Rừng Cổ Mộc, hạ gục Cổ Mộc Trấn Khí giải vây Lý Mộ Uyển'},
   {id:'tree',text:'Đoạt Thanh Mộc Linh Tâm, Mở Lò Đan & Kỹ năng Nội Giới Hộ Đạo (G)'},
  ]},
 {id:'VG06',stage:1,title:'Hồi VI: Đại Kiếp Nạn Hằng Nhạc — Hắc Ấn Chấp Sự & Trúc Cơ',realmRange:'Ngưng Khí 15 → Trúc Cơ Sơ Kỳ',chapterQuest:'HN10',encounterQuest:'HN10',
  description:'Quyết chiến Hắc Ấn Chấp Sự qua 3 pha trên chiến trường 2D (Đạo Ấn → Phân Phù → Ấn Hồi, lách vào khe sáng 90° hướng khóa), sau đó dùng Trúc Cơ Đan dựng Đạo Đài và đột phá Đại Cảnh Giới Trúc Cơ.',
  reward:'+1500 Tu vi · Đột Phá Đại Cảnh Giới Trúc Cơ (Phàm/Địa/Thiên Đạo) · Bản Đồ Quyết Minh Cốc',
  speaker:'Hắc Ấn Chấp Sự',portrait:'/assets/g2-items/boss-officer.png',
  voiceover:'“Khe hở một phần tư vòng ấn đã bị ngươi nhìn thấu! Mau dùng Trúc Cơ Đan dựng Đạo Đài!”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+1500'},
   {id:'truc-co-dai',name:'Đạo Đài Thiên Đạo Trúc Cơ',icon:'/assets/g2-items/truc-co-dai.png',rarity:'realm'},
   {id:'vh-sealed-case',name:'Trúc Cơ Đan (Lý Mộ Uyển)',icon:'/assets/character-ui-v2/spirit-pill.webp',rarity:'pill'},
   {id:'hai-do',name:'Bản Đồ Quyết Minh Cốc',icon:'/assets/g2-items/hai-do-tu-ma.png',rarity:'material'},
  ],
  objectives:[
   {id:'dark_seal',text:'Vào Chiến Trường 3 Pha: Lách khe sáng 90° Ấn Hồi & Hạ Hắc Ấn Chấp Sự'},
   {id:'foundation',text:'Ngưng tụ Đạo Đài & Đột Phá Đại Cảnh Giới Trúc Cơ'},
  ]},
 {id:'VG07',stage:2,title:'Hồi VII: Phong Vân Quyết Minh Cốc & Mở Không Gian Nội Giới',realmRange:'Trúc Cơ Sơ Kỳ',chapterQuest:'HN11',encounterQuest:'HN11',
  description:'Tiến vào Bí Cảnh Quyết Minh Cốc 2D, trảm Yêu Hồn Thống Lĩnh, mở Không Gian Nội Giới Thiên Nghịch Châu (Mốc II) và luyện thành Tam Môn Tôn Hồn Phiên (Mốc II).',
  reward:'+1800 Tu vi · Thiên Nghịch Châu Mốc II · Tam Môn Tôn Hồn Phiên Mốc II · 3 Lộ Thủy Ngũ Vân',
  speaker:'Tư Đồ Nam · Thức Hải',portrait:'/assets/g2-items/npc-situ-nan.png',
  voiceover:'“Nội giới trong châu đã mở! Đem đám yêu hồn mới săn được luyện thẳng thành Tam Môn Tôn Hồn Phiên!”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+1800'},
   {id:'bead',name:'Thiên Nghịch Châu · Mở Nội Giới (Mốc II)',icon:'/assets/g2-items/bead.png',rarity:'artifact'},
   {id:'banner',name:'Tam Môn Tôn Hồn Phiên (Mốc II)',icon:'/assets/g2-items/banner.png',rarity:'artifact'},
   {id:'vh-clear-water',name:'Lộ Thủy Ngũ Vân',icon:'/assets/van-ngoc-gameplay-v1/vh-clear-water-64.png',rarity:'material',count:'×3'},
  ],
  objectives:[
   {id:'inner_realm',text:'Vào Quyết Minh Cốc trảm Yêu Hồn Thống Lĩnh & Mở Pháp Bảo Mốc II'},
  ]},
 {id:'VG08',stage:2,title:'Hồi VIII: Hung Linh Nhập Kiếm — Thu Phục Hứa Lập Quốc',realmRange:'Trúc Cơ Trung Kỳ',chapterQuest:'HN12',encounterQuest:'HN12',
  description:'Tiến vào Hàn Thiết Kiếm Mộ 2D, trực tiếp giao chiến trấn áp hung linh Hứa Lập Quốc và dung luyện vào thân kiếm để tiến hóa Kiếm Linh lên Mốc II.',
  reward:'+2400 Tu vi · Hung Linh Kiếm Hứa Lập Quốc (Kiếm Linh Mốc II) · Đột Phá Trúc Cơ Trung Kỳ',
  speaker:'Hung Linh Hứa Lập Quốc',portrait:'/assets/g2-items/boss-xu-liguo.png',
  voiceover:'“Gia gia tha mạng! Tiểu nhân nguyện làm kiếm linh chém sạch kẻ thù của ngài!”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+2400'},
   {id:'sword',name:'Hung Linh Kiếm Hứa Lập Quốc (Mốc II)',icon:'/assets/g2-items/sword.png',rarity:'artifact'},
   {id:'vh-conductive-sand',name:'Hàn Thiết Tinh Hạch',icon:'/assets/van-ngoc-gameplay-v1/vh-conductive-sand-64.png',rarity:'material',count:'×2'},
  ],
  objectives:[
   {id:'xuliguo',text:'Vào Hàn Thiết Kiếm Mộ đánh bại & Thu phục Hung Linh Hứa Lập Quốc'},
  ]},
 {id:'VG09',stage:2,title:'Hồi IX: Hộ Đạo Đan Tâm — Bảo Vệ Lò Đan Lý Mộ Uyển',realmRange:'Trúc Cơ Hậu Kỳ',chapterQuest:'EX01',encounterQuest:'EX01',
  description:'Tiến vào Đan Thất Quyết Minh Cốc 2D, thu thập 3 vị Linh Dược (phím E) hoặc đánh lui Hộ Pháp Âm Thi Tông bảo vệ Lý Mộ Uyển, mở Xạ Thần Xa Mốc II và nhận Thiên Ly Đan.',
  reward:'+2800 Tu vi · Xạ Thần Xa Mốc II (Lôi Thú) · Thiên Ly Đan · Ngọc Giản Hộ Mệnh Lý Mộ Uyển',
  speaker:'Lý Mộ Uyển · Quyết Minh Cốc',portrait:'/assets/g2-items/npc-li-muwan.png',
  voiceover:'“Thiên Ly Đan đã thành! Mảnh ngọc giản hộ mệnh này xin đạo hữu mang theo bên mình.”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+2800'},
   {id:'chariot',name:'Xạ Thần Xa · Giải Ấn Lôi Thú (Mốc II)',icon:'/assets/g2-items/chariot.png',rarity:'artifact'},
   {id:'vh-flow-compass',name:'Thiên Ly Đan (Lý Mộ Uyển)',icon:'/assets/character-ui-v2/cloud-pearl.webp',rarity:'pill'},
   {id:'vh-clean-herb',name:'Linh Thảo Quyết Minh',icon:'/assets/van-ngoc-gameplay-v1/vh-clean-herb-64.png',rarity:'material',count:'×3'},
  ],
  objectives:[
   {id:'furnace',text:'Vào Đan Thất 2D: Thu thập 3 Linh Dược (E) hoặc Hạ Hộ Pháp Âm Thi Tông'},
  ]},
 {id:'VG10',stage:2,title:'Hồi X: Đoạt Mệnh Chân Thân — Huyết Đàn Ngoại Vực',realmRange:'Trúc Cơ Viên Mãn',chapterQuest:'EX02',encounterQuest:'EX02',
  description:'Tiến vào Huyết Đàn Ngoại Vực 2D, phá mắt trận hoặc tiêu diệt Chân Thân Hắc Ấn Chấp Sự (Giả Đan) và thu nạp Chủ Hồn thứ ba vào Tam Môn Tôn Hồn Phiên.',
  reward:'+3200 Tu vi · Chủ Hồn Giả Đan Thứ Ba · Ngũ Hành Tinh Nguyên · Trúc Cơ Viên Mãn',
  speaker:'Chân Thân Hắc Ấn (Giả Đan)',portrait:'/assets/g2-items/boss-officer.png',
  voiceover:'“Một tên Giả Đan vừa khéo làm chủ hồn thứ ba trong cờ của ngươi. Chuẩn bị nghênh đón Kiếp Lôi Kết Đan!”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+3200'},
   {id:'soul-orb',name:'Chủ Hồn Giả Đan Thứ Ba',icon:'/assets/g2-items/soul-orb.png',rarity:'artifact'},
   {id:'vh-stable-jade',name:'Ngũ Hành Tinh Nguyên',icon:'/assets/van-ngoc-gameplay-v1/vh-stable-jade-64.png',rarity:'material',count:'×3'},
  ],
  objectives:[
   {id:'true_body',text:'Vào Huyết Đàn Ngoại Vực 2D: Phá Mắt Trận hoặc Hạ Chân Thân Hắc Ấn'},
  ]},
 {id:'VG11',stage:2,title:'Hồi XI: Tiến Vào Tu Ma Hải — Độ Kiếp Kết Đan',realmRange:'Trúc Cơ Viên Mãn → Kết Đan Sơ Kỳ',chapterQuest:'EX03',encounterQuest:'EX03',
  description:'Tiến vào Lôi Đài Tu Ma Hải 2D, vượt Tam Trọng Kiếp Lôi bằng Thiên Nghịch Châu & Thiên Ly Đan, kết tụ Bổn Mệnh Kim Đan và tiến hóa toàn bộ 4 Pháp Bảo lên Mốc III.',
  reward:'+3800 Tu vi · Đại Cảnh Giới Kết Đan Sơ Kỳ · 4 Pháp Bảo Mốc III · Hải Đồ Tu Ma Hải',
  speaker:'Tư Đồ Nam · Thức Hải',portrait:'/assets/g2-items/npc-situ-nan.png',
  voiceover:'“Ba đạo kiếp lôi đều bị Thiên Nghịch Châu nuốt trọn! Kim Đan đã thành, tiến vào Tu Ma Hải!”',
  rewardItems:[
   {id:'tu-vi',name:'Tu Vi Linh Khí',icon:'/assets/g2-items/tu-vi-orb.png',rarity:'realm',count:'+3800'},
   {id:'kim-dan',name:'Bổn Mệnh Kim Đan (Kết Đan)',icon:'/assets/g2-items/kim-dan.png',rarity:'realm'},
   {id:'bead',name:'Thiên Nghịch Châu · Ngũ Hành Viên Mãn (Mốc III)',icon:'/assets/g2-items/bead.png',rarity:'artifact'},
   {id:'sword',name:'Tử Kim Ma Kiếm Hóa Hình (Mốc III)',icon:'/assets/g2-items/sword.png',rarity:'artifact'},
   {id:'banner',name:'Thập Ức Tôn Hồn Phiên (Mốc III)',icon:'/assets/g2-items/banner.png',rarity:'artifact'},
   {id:'chariot',name:'Xạ Thần Xa · Tam Ấn Viễn Cổ (Mốc III)',icon:'/assets/g2-items/chariot.png',rarity:'artifact'},
   {id:'hai-do',name:'Hải Đồ Tu Ma Hải',icon:'/assets/g2-items/hai-do-tu-ma.png',rarity:'material'},
  ],
  objectives:[
   {id:'tribulation',text:'Vào Lôi Đài Tu Ma Hải 2D: Vượt Tam Trọng Kiếp Lôi & Kết Tụ Kim Đan'},
  ]},
];

export type G2StanceId='sword_kill'|'soul_command'|'chariot_bulwark';
export type G2ArtifactId='bead'|'sword'|'banner'|'chariot';
export type G2FoundationId='mortal'|'earth'|'heaven';
export const G2_STANCES:Record<G2StanceId,{id:G2StanceId;name:string;fact:string;mentor:string;icon:string;bonus:string;description:string}>={
 sword_kill:{id:'sword_kill',name:'Kiếm Sát Quyết',fact:'stance-sword_kill',mentor:'Tư Đồ Nam · Sát Phạt Chi Đạo',icon:'/assets/g2-items/stance-kiem-sat.png',bonus:'+15% sát thương Kiếm Linh · -1s hồi chiêu Kiếm Ý · +20% xuyên giáp',description:'Dồn toàn bộ linh lực vào mũi kiếm, lấy công làm thủ, chuyên trảm sát mục tiêu đơn lẻ và xuyên thủng hộ thể.'},
 soul_command:{id:'soul_command',name:'Ngự Hồn Quyết',fact:'stance-soul_command',mentor:'Tư Đồ Nam · Vạn Hồn Phệ Linh',icon:'/assets/g2-items/stance-ngu-hon.png',bonus:'+20% sát thương Hồn Phiên · Hút 3% sinh lực mỗi nhịp hồn phệ',description:'Lấy thức hải dẫn dắt Hồn Phiên, triệu gọi chủ hồn khống chế chiến trường và rút sinh cơ quần địch.'},
 chariot_bulwark:{id:'chariot_bulwark',name:'Trấn Nhạc Quyết',fact:'stance-chariot_bulwark',mentor:'Tư Đồ Nam · Bất Diệt Kim Thân',icon:'/assets/g2-items/stance-tran-nhac.png',bonus:'+18% Sinh lực tối đa · +30% Khiên Thiên Nghịch Châu · ×2.5 phá ấn Xạ Thần Xa',description:'Vận chuyển trận văn Xạ Thần Xa và Thiên Nghịch Châu hộ thể, phá vỡ giáp cứng và đứng vững trước đại chiêu boss.'},
};
export const G2_ARTIFACTS:Record<G2ArtifactId,{id:G2ArtifactId;name:string;icon:string;slotLabel:string;milestones:{tier:1|2|3;fact:string;name:string;realmReq:string;questReq:string;power:string}[]}>={
 bead:{id:'bead',name:'Thiên Nghịch Châu',icon:'/assets/g2-items/bead.png',slotLabel:'Dị Bảo Bản Mệnh · Hộ Đạo',milestones:[
  {tier:1,fact:'g2-bead-m1',name:'Châu Đá Ngũ Vân (Mốc I)',realmReq:'Ngưng Khí Tầng 1',questReq:'VG01 (Hồi I)',power:'Ngưng tụ Lộ Thủy Ngũ Vân, tự động thổ nạp 120 Tu vi/phút và mở kỹ năng Dẫn Giới Hộ Thân.'},
  {tier:2,fact:'g2-bead-m2',name:'Thiên Nghịch Châu · Mở Nội Giới (Mốc II)',realmReq:'Trúc Cơ Sơ Kỳ',questReq:'VG07 (Hồi VII)',power:'Khai mở Không Gian Nội Giới gặp Tư Đồ Nam, kích hoạt Nội Giới Hộ Đạo (phím G giảm 50% sát thương).'},
  {tier:3,fact:'g2-bead-m3',name:'Thiên Nghịch Châu · Ngũ Hành Viên Mãn (Mốc III)',realmReq:'Kết Đan Sơ Kỳ',questReq:'VG11 (Hồi XI)',power:'Dung hợp Ngũ Hành Tinh Nguyên, nuốt trọn Tam Trọng Kiếp Lôi và mở lĩnh vực nghịch thiên.'},
 ]},
 sword:{id:'sword',name:'Kiếm Linh',icon:'/assets/g2-items/sword.png',slotLabel:'Chủ Công · Sát Phạt Xuyên Thấu',milestones:[
  {tier:1,fact:'g2-sword-m1',name:'Thanh Phong Linh Kiếm (Mốc I)',realmReq:'Ngưng Khí Tầng 1',questReq:'VG01 (Hồi I)',power:'Kiếm Ý Nhất Tuyến (phím 1): Phóng kiếm khí xuyên tuyến 320px theo hướng ngắm.'},
  {tier:2,fact:'g2-sword-m2',name:'Hung Linh Kiếm Hứa Lập Quốc (Mốc II)',realmReq:'Trúc Cơ Trung Kỳ',questReq:'VG08 (Hồi VIII)',power:'Thu phục hung linh Hứa Lập Quốc (+35% sát thương, +25% sát thương kết liễu mục tiêu dưới 50% HP).'},
  {tier:3,fact:'g2-sword-m3',name:'Tử Kim Ma Kiếm Hóa Hình (Mốc III)',realmReq:'Kết Đan Sơ Kỳ',questReq:'VG11 (Hồi XI)',power:'Kiếm Trận Phá Giới cực đại (+85% sát thương), vạn kiếm quy tông trảm phá hư không.'},
 ]},
 banner:{id:'banner',name:'Hồn Phiên',icon:'/assets/g2-items/banner.png',slotLabel:'Khống Trường · Triệu Hồi & Rút Máu',milestones:[
  {tier:1,fact:'g2-banner-m1',name:'Tiểu Hồn Phiên (Mốc I)',realmReq:'Ngưng Khí Tầng 4',questReq:'VG02 (Hồi II)',power:'Chủ Hồn Dẫn Lộ (phím 2): Phóng chủ hồn sơ cấp đeo bám và rút sinh lực mục tiêu.'},
  {tier:2,fact:'g2-banner-m2',name:'Tam Môn Tôn Hồn Phiên (Mốc II)',realmReq:'Trúc Cơ Sơ Kỳ',questReq:'VG07 (Hồi VII)',power:'Tam Môn Tụ Hồn: Mở 3 cổng hồn triệu gọi 3 Chủ Hồn Tinh Anh/Giả Đan (+35% sát thương).'},
  {tier:3,fact:'g2-banner-m3',name:'Thập Ức Tôn Hồn Phiên (Mốc III)',realmReq:'Kết Đan Sơ Kỳ',questReq:'VG11 (Hồi XI)',power:'Triệu hồi quân đoàn 9 Chủ Hồn Vương Giả (+90% sát thương), bao phủ chiến trường Tu Ma Hải.'},
 ]},
 chariot:{id:'chariot',name:'Xạ Thần Xa',icon:'/assets/g2-items/chariot.png',slotLabel:'Phá Giáp Hạng Nặng & Cơ Động',milestones:[
  {tier:1,fact:'g2-chariot-m1',name:'Xạ Thần Xa · Giải Ấn Nhất Tầng (Mốc I)',realmReq:'Ngưng Khí Tầng 10',questReq:'VG04 (Hồi IV)',power:'Giải Niêm Dẫn Thú (phím 3): Phóng chiến thú húc phá giáp (×2.0 phá ấn) và lướt thoát hiểm.'},
  {tier:2,fact:'g2-chariot-m2',name:'Xạ Thần Xa · Giải Ấn Lôi Thú (Mốc II)',realmReq:'Trúc Cơ Hậu Kỳ',questReq:'VG09 (Hồi IX)',power:'Lôi Thú Liệt Địa (+40% sát thương, ×2.6 phá ấn): Chiến xa lôi thú giẫm nát trận địa.'},
  {tier:3,fact:'g2-chariot-m3',name:'Xạ Thần Xa · Tam Ấn Viễn Cổ (Mốc III)',realmReq:'Kết Đan Sơ Kỳ',questReq:'VG11 (Hồi XI)',power:'Giải phóng toàn bộ Tam Ấn Viễn Cổ (+95% sát thương, ×3.5 phá ấn), nghiền nát mọi hộ thuẫn.'},
 ]},
};
export const G2_FOUNDATIONS:Record<G2FoundationId,{id:G2FoundationId;name:string;fact:string;desc:string;bonus:string}>={
 mortal:{id:'mortal',name:'Phàm Đạo Trúc Cơ',fact:'g2-foundation-mortal',desc:'Đạo đài cơ bản khi chưa thu thập đủ ấn chứng Boss; tăng ×1.4 thuộc tính nền và mở 1 khe Ngọc Giản.',bonus:'×1.4 Thuộc tính nền · 1 khe Ngọc Giản'},
 earth:{id:'earth',name:'Địa Đạo Trúc Cơ',fact:'g2-foundation-earth',desc:'Đạo đài vững chắc từ tối thiểu 2 ấn chứng Boss ngoại vi; tăng ×1.55 thuộc tính nền và mở 2 khe Ngọc Giản.',bonus:'×1.55 Thuộc tính nền · 2 khe Ngọc Giản · Địa Đạo Trầm Ổn'},
 heaven:{id:'heaven',name:'Thiên Đạo Trúc Cơ (Đạo Cơ Nghịch Thiên)',fact:'g2-foundation-heaven',desc:'Đạo đài hoàn mỹ kết tinh từ 3 ấn chứng Boss và phá giải Hắc Ấn Chấp Sự; tăng ×1.7 thuộc tính nền, -10% hồi chiêu và mở 3 khe Ngọc Giản!',bonus:'×1.7 Thuộc tính nền · -10% Hồi chiêu · 3 khe Ngọc Giản'},
};
export interface G2LiveState {
 majorRealm:'mortal'|'ngung_khi'|'truc_co'|'ket_dan';
 realmLabel:string;
 subStageLabel:string;
 currentActId:G2ActId;
 completedActs:G2ActId[];
 stance:typeof G2_STANCES[G2StanceId];
 foundationQuality:typeof G2_FOUNDATIONS[G2FoundationId]|undefined;
 artifacts:Record<G2ArtifactId,{tier:0|1|2|3;current?:typeof G2_ARTIFACTS[G2ArtifactId]['milestones'][number];next?:typeof G2_ARTIFACTS[G2ArtifactId]['milestones'][number]}>;
 noiGioi:{unlocked:boolean;dewDrops:number;soulFragments:number;liMuwanUnlocked:boolean;situMessage:string;liMuwanMessage:string};
}
export function readG2State(input?:{hn01?:boolean;hn02?:boolean;level?:number;cultivation?:number;milestone?:string;lessons?:{hn03?:boolean;hn04?:boolean};chapter?:ChapterProgress}):G2LiveState{
 const c=input?.chapter??initialChapter(),facts=c.facts,done=(q:ChapterQuestId)=>c.completed.includes(q),lvl=Math.max(input?.level??0,input?.hn02?1:0);
 const vg01Done=!!input?.lessons?.hn04||facts.includes('g2-act-VG01')||done('HN05');
 const actDoneMap:Record<G2ActId,boolean>={
  VG01:vg01Done,
  VG02:done('HN05'),
  VG03:done('HN06'),
  VG04:done('HN07'),
  VG05:done('HN09'),
  VG06:done('HN10'),
  VG07:done('HN11'),
  VG08:done('HN12'),
  VG09:done('EX01'),
  VG10:done('EX02'),
  VG11:done('EX03'),
 };
 const completedActs=G2_ACT_IDS.filter(id=>actDoneMap[id]);
 const currentActId=G2_ACT_IDS.find(id=>!actDoneMap[id])??'VG11';
 const stanceId:G2StanceId=facts.includes('stance-soul_command')?'soul_command':facts.includes('stance-chariot_bulwark')?'chariot_bulwark':'sword_kill';
 const foundationId:G2FoundationId|undefined=facts.includes('g2-foundation-heaven')?'heaven':facts.includes('g2-foundation-earth')?'earth':facts.includes('g2-foundation-mortal')||done('HN10')?'heaven':undefined;
 const ketDan=facts.includes('g2-realm-ket_dan')||done('EX03');
 const trucCo=ketDan||facts.includes('g2-realm-truc_co')||done('HN10')||done('HN11');
 const majorRealm:G2LiveState['majorRealm']=ketDan?'ket_dan':trucCo?'truc_co':'ngung_khi';
 const tcSub=done('EX02')?'Trúc Cơ Viên Mãn':done('EX01')?'Trúc Cơ Hậu Kỳ':done('HN12')?'Trúc Cơ Trung Kỳ':'Trúc Cơ Sơ Kỳ';
 const fLabel=foundationId?G2_FOUNDATIONS[foundationId].name:'Thiên Đạo Trúc Cơ';
 const realmLabel=ketDan?'Kết Đan Sơ Kỳ · Bổn Mệnh Kim Đan':trucCo?`${tcSub} · ${fLabel}`:`Ngưng Khí Tầng ${Math.max(1,lvl)}`;
 const subStageLabel=ketDan?'Kim Đan Sơ Thành · 4 Pháp Bảo Mốc III':trucCo?`${tcSub} · Đạo Đài Đã Vững`:lvl>=15?'Ngưng Khí Đại Viên Mãn (Tầng 15/15)':lvl>=10?`Ngưng Khí Hậu Kỳ (Tầng ${lvl}/15)`:lvl>=4?`Ngưng Khí Trung Kỳ (Tầng ${lvl}/15)`:`Ngưng Khí Sơ Kỳ (Tầng ${Math.max(1,lvl)}/15)`;
 const tierOf=(id:G2ArtifactId):0|1|2|3=>{
  if(id==='bead')return ketDan||facts.includes('g2-bead-m3')?3:(done('HN11')||facts.includes('g2-bead-m2'))?2:(vg01Done||!!input?.hn01||facts.includes('g2-bead-m1'))?1:1;
  if(id==='sword')return ketDan||facts.includes('g2-sword-m3')?3:(done('HN12')||facts.includes('g2-sword-m2'))?2:(vg01Done||!!input?.hn01||facts.includes('g2-sword-m1'))?1:1;
  if(id==='banner')return ketDan||facts.includes('g2-banner-m3')?3:(done('HN11')||facts.includes('g2-banner-m2'))?2:(done('HN05')||!!input?.hn02||facts.includes('g2-banner-m1'))?1:0;
  return ketDan||facts.includes('g2-chariot-m3')?3:(done('EX01')||facts.includes('g2-chariot-m2'))?2:(done('HN07')||facts.includes('g2-chariot-m1'))?1:0;
 };
 const artifacts={} as G2LiveState['artifacts'];
 for(const id of ['bead','sword','banner','chariot'] as const){
  const t=tierOf(id),ms=G2_ARTIFACTS[id].milestones;
  artifacts[id]={tier:t,current:t>0?ms[t-1]:undefined,next:t<3?ms[t]:undefined};
 }
 const dewDrops=Math.max(2,Math.floor((input?.cultivation??0)/20)+completedActs.length*3);
 const soulFragments=completedActs.length*10+(lvl*3);
 const liMuwanUnlocked=done('HN09')||done('HN10')||facts.includes('g2-limuwan-unlocked');
 const actObj=G2_ACTS.find(a=>a.id===currentActId)!;
 const situMessage=actObj.speaker==='Tư Đồ Nam'?actObj.voiceover:`“Hiện đang ở ${actObj.id} (${actObj.title}). ${actObj.description}”`;
 const liMuwanMessage=liMuwanUnlocked?'“Lò đan ở Quyết Minh Cốc đã nhóm lửa. Mộ Uyển có thể giúp đạo hữu luyện Thanh Tâm Đan, Phá Cấm Phù, Trúc Cơ Đan và Thiên Ly Đan.”':'“Giải vây đoàn dược sư tại Rừng Cổ Mộc (Hồi V · VG05) để kết nhân duyên và mở Lò Đan Lý Mộ Uyển.”';
 return {majorRealm,realmLabel,subStageLabel,currentActId,completedActs,stance:G2_STANCES[stanceId],foundationQuality:foundationId?G2_FOUNDATIONS[foundationId]:undefined,artifacts,noiGioi:{unlocked:true,dewDrops,soulFragments,liMuwanUnlocked,situMessage,liMuwanMessage}};
}
export interface ChapterProgress {
 version:1;accepted:ChapterQuestId[];completed:ChapterQuestId[];facts:string[];
 stock:Partial<Record<MaterialId,number>>;jade:'none'|'raw'|'refined';jadeEquipped:boolean;
 caseOwned:boolean;compassOwned:boolean;protectedItems:ChapterItemId[];
 guardReadyAt:number;scene:'hub'|'outer'|'trial';activity:ChapterQuestId|'none';
 checkpoint:number;trip:'none'|'ready'|'active';tripSerial:number;sealed:boolean;report:'none'|'test'|'record';
 activitySave?:ChapterActivitySave;
}
export interface ChapterActivitySave {
 now:number;pausedAt:number;status:'ready'|'running'|'won'|'failed';serial:number;
 x:number;y:number;direction:Direction;guardUntil:number;guardSpent:boolean;nextBasicAt:number;stableSince:number;prepared:boolean;
 enemy?:TrainingTarget;ai:{stage:'approach'|'warning'|'recovery';at:number;turn:number;shape:'fan'|'circle'|'line';x:number;y:number;dx:number;dy:number;locked:boolean;pulses:number;double:boolean};
 engine:{active?:ActiveCast;projectiles:Projectile[]};
 basic?:({at:number;dx:number;dy:number}&Partial<BasicStrike>);
 combo?:{index:number;until:number};
 enemyPose?:EnemyPresentation;
 stabilized?:boolean;
}
export interface ChapterView {progress:ChapterProgress;available:ChapterQuestId[];status:ChapterActivitySave['status'];enemy?:TrainingTarget;
 warning?:{shape:'fan'|'circle'|'line';x:number;y:number;dx:number;dy:number;radius:number;length:number;width:number;resolveAt:number;pulses:number};
 stableReady:boolean;prepared:boolean;guardUntil:number;now:number;hint:string;basic?:BasicStrike;enemyPose?:EnemyPresentation;}
export const initialChapter=():ChapterProgress=>({version:1,accepted:[],completed:[],facts:[],stock:{},jade:'none',jadeEquipped:false,caseOwned:false,compassOwned:false,protectedItems:[],guardReadyAt:0,scene:'hub',activity:'none',checkpoint:0,trip:'none',tripSerial:0,sealed:false,report:'none'});
/** Read-only readiness shared by the server command and recipe presentation. */
export function chapterRecipeBlocker(c:ChapterProgress,recipe:ChapterRecipe):'recipe_locked'|'already_complete'|'case'|'materials'|undefined{
 const done=(id:ChapterQuestId)=>c.completed.includes(id);
 if(recipe.requires.some(r=>r==='HN08-accepted'?!c.accepted.includes('HN08'):r==='hn-guard-method'?!c.facts.includes(r):r==='trip-not-started'?c.trip!=='ready'||c.sealed:r.endsWith('-completed')?!done(r.slice(0,-10) as ChapterQuestId):r.endsWith('-accepted')?!c.accepted.includes(r.slice(0,-9) as ChapterQuestId):true))return 'recipe_locked';
 if(recipe.transform&&c.jade!=='raw'||recipe.id==='vh-recipe-case'&&c.caseOwned||recipe.id==='vh-recipe-compass'&&c.compassOwned)return 'already_complete';
 if(recipe.id==='vh-recipe-seal'&&!c.caseOwned)return 'case';
 if(Object.entries(recipe.consume).some(([id,n])=>(c.stock[id as MaterialId]??0)<n!))return 'materials';
}
export function validChapter(raw:unknown):raw is ChapterProgress{
 if(!raw||typeof raw!=='object')return false;const c=raw as ChapterProgress;
 const list=(v:unknown,known:readonly string[],max:number)=>Array.isArray(v)&&v.length<=max&&new Set(v).size===v.length&&v.every(s=>typeof s==='string'&&known.includes(s));
 return c.version===1&&list(c.accepted,CHAPTER_QUESTS,12)&&list(c.completed,CHAPTER_QUESTS,12)&&c.completed.every(id=>c.accepted.includes(id))&&
  Array.isArray(c.facts)&&c.facts.length<=80&&new Set(c.facts).size===c.facts.length&&c.facts.every(f=>typeof f==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(f))&&
  !!c.stock&&typeof c.stock==='object'&&!Array.isArray(c.stock)&&Object.entries(c.stock).every(([id,n])=>MATERIAL_IDS.includes(id as MaterialId)&&Number.isSafeInteger(n)&&n>=0)&&
  ['none','raw','refined'].includes(c.jade)&&typeof c.jadeEquipped==='boolean'&&(!c.jadeEquipped||c.jade==='refined')&&
  typeof c.caseOwned==='boolean'&&typeof c.compassOwned==='boolean'&&list(c.protectedItems,Object.keys(CHAPTER_ITEMS),10)&&
  Number.isFinite(c.guardReadyAt)&&c.guardReadyAt>=0&&['hub','outer','trial'].includes(c.scene)&&['none',...CHAPTER_QUESTS].includes(c.activity)&&
  Number.isInteger(c.checkpoint)&&c.checkpoint>=0&&c.checkpoint<=3&&['none','ready','active'].includes(c.trip)&&
  Number.isSafeInteger(c.tripSerial)&&c.tripSerial>=0&&typeof c.sealed==='boolean'&&(!c.sealed||c.caseOwned&&c.trip!=='none')&&['none','test','record'].includes(c.report)&&
  (c.activitySave===undefined||validActivitySave(c.activitySave));
}
export function validActivitySave(s:ChapterActivitySave):boolean {
 if(!s||typeof s!=='object'||!s.ai||!s.engine)return false;
 const finite=(values:unknown[])=>values.every(v=>typeof v==='number'&&Number.isFinite(v));
 if(!finite([s.now,s.pausedAt,s.serial,s.x,s.y,s.guardUntil,s.nextBasicAt,s.stableSince,s.ai.at,s.ai.turn,s.ai.x,s.ai.y,s.ai.dx,s.ai.dy,s.ai.pulses])||
  !['ready','running','won','failed'].includes(s.status)||!['north','south','east','west'].includes(s.direction)||!chapterWalkable(s)||
  !Number.isSafeInteger(s.serial)||s.serial<0||typeof s.guardSpent!=='boolean'||typeof s.prepared!=='boolean'||typeof s.ai.locked!=='boolean'||typeof s.ai.double!=='boolean'||s.stabilized!==undefined&&typeof s.stabilized!=='boolean'||
  !['approach','warning','recovery'].includes(s.ai.stage)||!['fan','circle','line'].includes(s.ai.shape)||!Array.isArray(s.engine.projectiles)||s.engine.projectiles.length>8)return false;
 if(s.enemy&&(!finite([s.enemy.x,s.enemy.y,s.enemy.hp,s.enemy.maxHp,s.enemy.radius])||s.enemy.hp<0||s.enemy.hp>s.enemy.maxHp||typeof s.enemy.id!=='string'||typeof s.enemy.ownerId!=='string'))return false;
 if(s.basic&&!finite([s.basic.at,s.basic.dx,s.basic.dy]))return false;
 if(s.basic?.id!==undefined&&!validBasicStrike(s.basic as BasicStrike))return false;
 if(s.combo&&(!Number.isInteger(s.combo.index)||s.combo.index<0||s.combo.index>2||!Number.isFinite(s.combo.until)))return false;
 if(s.enemyPose&&(!['wolf','boss'].includes(s.enemyPose.actor)||!['idle','walk','attack','cast_field','cast_line','hit','death','appear'].includes(s.enemyPose.action)||!finite([s.enemyPose.at,s.enemyPose.dx,s.enemyPose.dy])||typeof s.enemyPose.lifeId!=='string'))return false;
 if(s.enemyPose?.releaseAt!==undefined&&(!Number.isFinite(s.enemyPose.releaseAt)||s.enemyPose.releaseAt<s.enemyPose.at))return false;
 const a=s.engine.active;
 if(a&&(!['sword','thunder','wind'].includes(a.skill)||typeof a.id!=='string'||typeof a.targetId!=='string'||!a.origin||!a.held||
  !finite([a.startedAt,a.dx,a.dy,a.origin.x,a.origin.y,a.held.x,a.held.y])||!['released','resolved','arrived','movementReleased'].every(k=>typeof a[k as keyof ActiveCast]==='boolean')||a.target&&!finite([a.target.x,a.target.y])))return false;
 return s.engine.projectiles.every(p=>p&&typeof p.id==='string'&&typeof p.ownerId==='string'&&typeof p.castId==='string'&&['sword','thunder','wind'].includes(p.skillId??'sword')&&finite([p.x,p.y,p.dx,p.dy,p.traveled,p.startedAt])&&p.traveled>=0);
}
export type ChapterAction='accept'|'enter'|'interact'|'confirm'|'craft'|'equip_jade'|'guard'|'prepare'|'start'|'leave'|'trip_start'|'trip_cancel'|'report'|'confirm_m02';
export interface ChapterCommand {id:string;action:ChapterAction;quest?:ChapterQuestId;recipe?:string;node?:string;choice?:string}
export interface ChapterResult {requestId?:string;ok:boolean;reason?:string;duplicate?:boolean}
export function readChapterCommand(raw:unknown):ChapterCommand|undefined{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return;const c=raw as ChapterCommand;
 if(typeof c.id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(c.id)||!['accept','enter','interact','confirm','craft','equip_jade','guard','prepare','start','leave','trip_start','trip_cancel','report','confirm_m02'].includes(c.action))return;
 if(Object.keys(c).some(k=>!['id','action','quest','recipe','node','choice'].includes(k)))return;
 if(c.quest!==undefined&&!CHAPTER_QUESTS.includes(c.quest))return;
 for(const key of ['recipe','node','choice'] as const)if(c[key]!==undefined&&(typeof c[key]!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(c[key]!)))return;
 return {id:c.id,action:c.action,...(c.quest?{quest:c.quest}:{}),...(c.recipe?{recipe:c.recipe}:{}),...(c.node?{node:c.node}:{}),...(c.choice?{choice:c.choice}:{})};
}
export const chapterCommandKey=(c:ChapterCommand)=>JSON.stringify(['chapter-v1',c.action,c.quest??null,c.recipe??null,c.node??null,c.choice??null]);
export const chapterGate=(c:ChapterProgress)=>c.completed.includes('HN09')?3600:c.completed.includes('HN07')?1620:360;
export const levelThreshold=(level:number)=>10*level*(level+9);
// Separate provisional activity level for the playable slice; owner navigation is untouched.
export const CHAPTER_WORLD={width:1280,height:896,spawn:{x:640,y:704},enemy:{x:640,y:420},returnPoint:{x:160,y:744},
 nodes:[{id:'sample-a',name:'Mẫu dẫn khí A',x:336,y:352},{id:'sample-b',name:'Mẫu đối chứng B',x:944,y:352},{id:'stable',name:'Điểm ổn định',x:368,y:616},{id:'herb',name:'Dược liệu được phép',x:304,y:256},{id:'water',name:'Linh tuyền',x:992,y:256},{id:'sand',name:'Mẫu cát dẫn khí',x:1008,y:640},{id:'fiber',name:'Sợi vân bố',x:464,y:448},{id:'jade',name:'Ngọc thô',x:816,y:448},{id:'deliver',name:'Điểm giao mẫu',x:640,y:152},{id:'observe-a',name:'Dấu khảo sát A',x:320,y:208},{id:'observe-b',name:'Dấu khảo sát B',x:960,y:208},{id:'verify',name:'Điểm kiểm chứng',x:640,y:264}]};
export const chapterWalkable=(point:Position,radius=8)=>Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=48+radius&&point.y>=64+radius&&point.x<=CHAPTER_WORLD.width-48-radius&&point.y<=CHAPTER_WORLD.height-48-radius;
export function chapterClearPath(a:Position,b:Position,radius=8){return chapterWalkable(a,radius)&&chapterWalkable(b,radius);}
export function applyChapterMovement(state:R01MotionState,command:{moveX:number;moveY:number;fast?:boolean},dt:number):void{
 if(state.hp!==undefined&&state.hp<=0){state.moving=false;return;}
 const speed=Math.hypot(state.dashVX??0,state.dashVY??0),input=speed?{x:state.dashVX!/speed,y:state.dashVY!/speed}:state.motionLocked?{x:0,y:0}:{x:command.moveX,y:command.moveY};
 Object.assign(state,moveUsingCollision({x:state.x,y:state.y,moving:state.moving,direction:state.direction as Direction},input,dt,speed||HANG_NHAC.movementSpeed*(command.fast===true?1.5:1),chapterWalkable));
}
