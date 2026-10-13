import { clearSectPath, nearStation, SECT_STATIONS, type SectView, type StationId } from '../../shared/sect';
import type { Position } from '../../shared/world/types';

export interface HangNhacNpc extends Position {
 id:string;name:string;role:string;wave:'A'|'B';zone:string;quote:string;live:boolean;stationId:StationId|null;
 assetId:'AVATAR-NOVICE-MALE'|'AVATAR-NOVICE-FEMALE';
}
// Explicit runtime placement, separate from the design registry and owner map geometry.
// Appearance uses the existing two demo atlases until individual ART is reviewed.
export const HANG_NHAC_NPC_SOURCE='docs/design/world/van-hai-living-world-v1/plan.json';
export const HANG_NHAC_NPCS:readonly HangNhacNpc[]=[
  {
    "id": "NPC-HN-GUIDE",
    "name": "Trần Duy",
    "role": "Chấp sự tiếp dẫn",
    "wave": "A",
    "zone": "Sân môn phái",
    "quote": "Nhập môn chỉ cần một bước. Đi hết đường này, ngươi phải tự biết bước tiếp.",
    "live": true,
    "stationId": "guide",
    "x": 1536,
    "y": 1168,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-CULTIVATION",
    "name": "Diệp Tĩnh",
    "role": "Giảng sư vận khí",
    "wave": "A",
    "zone": "Vườn thổ nạp",
    "quote": "Khí tụ đủ, chưa chắc đường khí đã thông. Hãy nói điều ngươi vừa làm được.",
    "live": true,
    "stationId": "cultivation",
    "x": 736,
    "y": 944,
    "assetId": "AVATAR-NOVICE-FEMALE"
  },
  {
    "id": "NPC-HN-TRAINING",
    "name": "Tạ Kiếm Sơn",
    "role": "Giáo tập luyện thuật",
    "wave": "A",
    "zone": "Sân luyện thuật",
    "quote": "Né được một đòn chưa phải giỏi. Biết khi nào nên tiến, khi nào phải lui mới giữ được mạng.",
    "live": true,
    "stationId": "training",
    "x": 2464,
    "y": 880,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-PREPARATION",
    "name": "Tô Nhược",
    "role": "Chấp sự Tư Vật Các",
    "wave": "A",
    "zone": "Khu chuẩn bị",
    "quote": "Tên trên sổ giống nhau, khí trong vật chưa chắc giống nhau. Đừng bỏ qua vết niêm.",
    "live": true,
    "stationId": "preparation",
    "x": 2392,
    "y": 1488,
    "assetId": "AVATAR-NOVICE-FEMALE"
  },
  {
    "id": "NPC-HN-HERBALIST",
    "name": "Bạch Chỉ",
    "role": "Dược sư ngoại viện",
    "wave": "A",
    "zone": "Dược đình phía tây",
    "quote": "Lá còn tươi chưa chắc khí còn nguyên. Hái dược cũng phải biết chờ.",
    "live": true,
    "stationId": null,
    "x": 640,
    "y": 912,
    "assetId": "AVATAR-NOVICE-FEMALE"
  },
  {
    "id": "NPC-HN-FORGE",
    "name": "Tống Thiết",
    "role": "Luyện khí sư",
    "wave": "A",
    "zone": "Xưởng đông nam",
    "quote": "Kiếm có thể đổi. Tay cầm kiếm phải biết thứ gì đang giữ nó.",
    "live": true,
    "stationId": null,
    "x": 2544,
    "y": 1472,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-ROUTE-KEEPER",
    "name": "Hứa Hành",
    "role": "Người giữ tuyến",
    "wave": "A",
    "zone": "Đường tuần sơn/lối ngoại vi",
    "quote": "Đường vẫn ở đó. Thứ thay đổi là người đi qua và vật họ mang về.",
    "live": true,
    "stationId": null,
    "x": 1600,
    "y": 1776,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-GATE-WARDEN",
    "name": "Đinh Sóc",
    "role": "Hộ sơn đệ tử",
    "wave": "A",
    "zone": "Cổng ngoại viện",
    "quote": "Ra ngoài luyện thân, không phải ra ngoài đánh cược mạng. Hãy nhớ đường trở lại.",
    "live": true,
    "stationId": null,
    "x": 1504,
    "y": 1776,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-ARCHIVIST",
    "name": "Lục Văn",
    "role": "Thủ thư Tàng Kinh",
    "wave": "B",
    "zone": "Hiên tây bắc",
    "quote": "Đọc được tên của vật, chưa phải biết nó từ đâu đến.",
    "live": false,
    "stationId": null,
    "x": 614,
    "y": 348,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-BEAST-KEEPER",
    "name": "A Ly",
    "role": "Người coi linh thú",
    "wave": "B",
    "zone": "Rìa vườn phía tây",
    "quote": "Nó nhìn tay ngươi trước khi nhìn áo ngươi. Muốn đến gần, đừng vội giơ kiếm.",
    "live": false,
    "stationId": null,
    "x": 399,
    "y": 1393,
    "assetId": "AVATAR-NOVICE-FEMALE"
  },
  {
    "id": "NPC-HN-TEA",
    "name": "Mạc Bà",
    "role": "Người coi trà đình",
    "wave": "B",
    "zone": "Trà đình bên hồ",
    "quote": "Người qua cổng kể về yêu thú. Người trở về thường chỉ hỏi một chén nước ấm.",
    "live": false,
    "stationId": null,
    "x": 814,
    "y": 1311,
    "assetId": "AVATAR-NOVICE-FEMALE"
  },
  {
    "id": "NPC-HN-DISCIPLE-WATER",
    "name": "Kỷ An",
    "role": "Đệ tử vận khí",
    "wave": "A",
    "zone": "Rìa vườn thổ nạp",
    "quote": "Ta cứ tưởng giữ hơi lâu là tốt. Hóa ra bước khó nhất là biết mình đang sai ở đâu.",
    "live": true,
    "stationId": null,
    "x": 824,
    "y": 1056,
    "assetId": "AVATAR-NOVICE-FEMALE"
  },
  {
    "id": "NPC-HN-DISCIPLE-SWORD",
    "name": "Phùng Dã",
    "role": "Đệ tử luyện kiếm",
    "wave": "A",
    "zone": "Rìa sân luyện đông",
    "quote": "Nhanh chưa chắc trúng. Nhưng cứ đứng yên thì chắc chắn không thắng.",
    "live": true,
    "stationId": null,
    "x": 2368,
    "y": 704,
    "assetId": "AVATAR-NOVICE-MALE"
  },
  {
    "id": "NPC-HN-MESSENGER",
    "name": "Tiểu Nghiên",
    "role": "Người đưa tin",
    "wave": "B",
    "zone": "Hiên chính điện",
    "quote": "Thư đi nhanh được. Điều viết trong thư thì phải nghĩ chậm một chút.",
    "live": false,
    "stationId": null,
    "x": 1428,
    "y": 645,
    "assetId": "AVATAR-NOVICE-FEMALE"
  }
];

export const LIVE_HANG_NHAC_NPCS=HANG_NHAC_NPCS.filter(n=>n.live);
export function npcStationName(id:StationId):string {
 const station=SECT_STATIONS.find(s=>s.id===id)!;
 const npc=LIVE_HANG_NHAC_NPCS.find(n=>n.stationId===id);
 return npc?`${npc.name} · ${station.name}`:station.name;
}
export const NPC_LORE_RANGE=72;
export interface NpcLifeContext {
 position:Position;profileId?:string;view?:SectView;online:boolean;scene?:string;visible:boolean;focused:boolean;blocked:boolean;alive:boolean;
}
export function npcLifeAvailable(c:NpcLifeContext):boolean {
 return c.online&&c.alive&&c.scene==='hub'&&c.visible&&c.focused&&!c.blocked&&!!c.profileId&&c.view?.profileId===c.profileId&&
  c.view.lessons.active==='none'&&!c.view.practising&&
  (!c.view.chapter||c.view.chapter.scene==='hub');
}
export function nearLifeNpc(point:Position,npc:HangNhacNpc):boolean {
 return npc.live&&!npc.stationId&&Math.hypot(point.x-npc.x,point.y-npc.y)<=NPC_LORE_RANGE&&clearSectPath(point,npc);
}
export function nearbyLifeNpc(c:NpcLifeContext):HangNhacNpc|undefined {
 if(!npcLifeAvailable(c)||SECT_STATIONS.some(s=>nearStation(c.position,s.id)))return;
 return LIVE_HANG_NHAC_NPCS.filter(n=>nearLifeNpc(c.position,n)).sort((a,b)=>Math.hypot(c.position.x-a.x,c.position.y-a.y)-Math.hypot(c.position.x-b.x,c.position.y-b.y)||a.id.localeCompare(b.id))[0];
}
export function npcLore(npc:HangNhacNpc,view:SectView):string[] {
 const lines=[npc.quote],chapter=view.chapter,done=(id:string)=>chapter?.completed.some(q=>q===id);
 if(npc.id==='NPC-HN-HERBALIST'&&done('EX01'))lines.push('Dược thảo, linh tuyền và cát đã được kiểm qua. Mỗi thứ đều cần được nhận biết trước khi đem dùng.');
 if(npc.id==='NPC-HN-FORGE'&&chapter?.jade==='refined')lines.push('Ngọc đã luyện hóa rồi. Hãy xem nó giữ nhịp thế nào khi ngươi thực sự vận dụng.');
 if(npc.id==='NPC-HN-ROUTE-KEEPER'){
  if(chapter?.report==='test')lines.push('Lượt bảo quản đúng cách đã giữ được khí. Ta sẽ sửa cách giao nhận và ghi việc báo chậm.');
  else if(chapter?.report==='record')lines.push('Ta đã gửi bản giải trình kèm ghi nhận việc báo chậm. Điều kiện bảo quản phải được đối chứng cho rõ.');
  else if(done('HN05'))lines.push('Ngươi đã trở về từ ngoại vi. Dấu niêm khác nhau cần được kiểm chứng trước khi kết luận.');
 }
 if(npc.id==='NPC-HN-DISCIPLE-WATER'&&view.hn02)lines.push('Ngươi đã ổn định được vòng vận khí. Ta cũng đang học cách tự nhận ra nhịp sai của mình.');
 if(npc.id==='NPC-HN-DISCIPLE-SWORD'&&done('HN05'))lines.push('Ngươi đã vượt bài ngoài sân. Lần tới kể ta nghe cách ngươi đọc nhịp ra đòn nhé.');
 if(npc.id==='NPC-HN-HERBALIST')lines.push('Dược vụ riêng: Chưa mở. Vật tư hồi phục hiện dùng qua Hành trang hoặc Tô Nhược ở khu chuẩn bị.');
 if(npc.id==='NPC-HN-FORGE')lines.push('Rèn trang bị riêng: Chưa mở. Các công thức đang có được xem tại bàn luyện chế của Tô Nhược.');
 if(npc.id==='NPC-HN-ROUTE-KEEPER')lines.push('Việc trên tuyến được ghi trong Nhập môn / Luyện chế. Cuộc chuyện trò này chỉ để nghe lại lời người giữ tuyến.');
 if(npc.id==='NPC-HN-GATE-WARDEN')lines.push(done('HN12')?'Việc chuẩn bị xuất hành đã được ghi. Cửa tới vùng mới: Chưa mở.':'Hãy theo đạo trình để vào ngoại vi thử luyện. Xuất hành tới vùng mới: Chưa mở.');
 if(npc.id==='NPC-HN-DISCIPLE-SWORD')lines.push('Tỷ thí với bạn tập: Chưa mở. Muốn luyện thuật hãy gặp Tạ Kiếm Sơn.');
 return lines;
}
