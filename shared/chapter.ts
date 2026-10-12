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
 'hn-refining-material':{name:'Nguyên liệu luyện hóa nhập môn',kind:'material',description:'Nguồn HN05/HN06. Luyện ngọc tiêu 4; phần còn lại được giữ.',effect:'Nguyên liệu nhiệm vụ · không bán hoặc đổi thành vật liệu EX.',art:'hn-refining-material'},
 'hn-training-jade':{name:'Ngọc hộ thân luyện tập',kind:'gear',slot:'charm',description:'Phôi và ngọc đã luyện hóa là cùng một món.',effect:'Hộ thân: 15 MP · 12 giây hồi · giảm 50% một hit trong 1 giây.',art:'hn-training-jade-refined'},
 'vh-clean-herb':{name:'Dược thảo sơ chế',kind:'material',description:'Sơ chế tại điểm dược liệu EX01.',effect:'2 dược thảo + 1 linh tuyền → 1 vật tư hồi phục.',art:'vh-clean-herb'},
 'vh-clear-water':{name:'Linh tuyền đã lọc',kind:'material',description:'Lấy mẫu và lọc tại điểm được phép EX01.',effect:'Dùng pha mực hoặc chế vật tư hồi phục.',art:'vh-clear-water'},
 'vh-soft-fiber':{name:'Sợi vân bố',kind:'material',description:'Vật liệu EX02 để làm giá thể bảo quản.',effect:'Dùng chế hộp giữ khí hoặc Định Lưu Bàn.',art:'vh-soft-fiber'},
 'vh-conductive-sand':{name:'Cát dẫn khí',kind:'material',description:'Mẫu đạt chuẩn EX01/EX02.',effect:'Dùng pha mực dẫn khí hoặc chế Định Lưu Bàn.',art:'vh-conductive-sand'},
 'vh-stable-jade':{name:'Ngọc thô ổn khí',kind:'material',description:'Ngọc sơ chế tại điểm chuẩn bị EX02.',effect:'Dùng chế hộp giữ khí hoặc Định Lưu Bàn.',art:'vh-stable-jade'},
 'vh-guiding-ink':{name:'Mực dẫn khí',kind:'material',description:'Pha từ một cát dẫn khí và một linh tuyền.',effect:'Niêm hộp cho một chuyến. Hủy trước khởi hành hoàn mực một lần.',art:'vh-guiding-ink'},
 'vh-sealed-case':{name:'Hộp giữ khí',kind:'tool',description:'Công cụ mang mẫu qua tuyến nhiễu khí; không tăng ô túi.',effect:'Giữ lại sau chuyến; đường ổn định luôn là phương án thay thế.',art:'vh-sealed-case'},
 'vh-flow-compass':{name:'Định Lưu Bàn',kind:'tool',description:'Đọc hướng dấu khảo sát rồi tự tới điểm đối chứng.',effect:'Không tiêu hao; có phương án quan sát thủ công.',art:'vh-flow-compass'},
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
export const CHAPTER_TITLES:Record<ChapterQuestId,string>={HN05:'Ra khỏi sân luyện',HN06:'Dấu riêng',HN07:'Vì sao chưa tiến?',HN08:'Vật trong tay',HN09:'Vận dụng ổn định',HN10:'Khảo nghiệm nhập môn',HN11:'Nhìn lại con đường',HN12:'Xuất hành',EX01:'Nhận biết nguồn',EX02:'Vật liệu thành công cụ',EX03:'Chọn cách mang mẫu',EX04:'Đọc dấu rồi kiểm chứng'};
export const CHAPTER_BRIEFS:Record<ChapterQuestId,string>={
 HN05:'Tự vượt đối luyện ngoài sân. Dấu niêm trên một lô vật liệu có chỗ không khớp; cần kiểm chứng trước khi kết luận.',
 HN06:'So mẫu trong các điều kiện khác nhau. Vật mẫu của bài không tiêu nguyên liệu trong túi.',
 HN07:'Tích lũy và cách vận hành là hai việc khác nhau. Bài an toàn kiểm nhịp ra tay; không gây mất HP.',
 HN08:'Nhận phôi một lần, biết phương pháp, luyện hóa rồi trang bị. Trong bài thử, G phải thật sự giảm một đòn mới được tính.',
 HN09:'Thắng bài tích hợp bằng công cụ đã có. Kết quả được giữ khi chưa đủ tầng 9; không cần đánh lại để nhận thưởng.',
 HN10:'Ba pha E01 → E02 → E03. Chuẩn bị hồi đầy miễn phí giữa pha; thua giữ pha đã thắng. Kết quả cuối ghi M04, không thưởng kill.',
 HN11:'Nhìn lại nền đã mở, ba thuật và ngọc đã dùng được. Mẫu sai cách bảo quản không chứng minh bị tráo; người giữ tuyến chịu trách nhiệm báo chậm.',
 HN12:'Ghi quyền xuất hành và tiếp tục nhánh nguyên liệu EX01–EX04. Chưa tự mở Trúc Cơ hoặc thuật mới.',
 EX01:'E tại dược liệu, linh tuyền và cát; quay về nhận một bộ nguyên liệu hữu hạn. Nguồn không cho farm lặp.',
 EX02:'E tại sợi và ngọc, sau đó tới điểm kiểm chứng để sơ chế. Nhận một bộ nguyên liệu sau khi xác nhận.',
 EX03:'Tuyến thủ công: đứng ổn định 2 giây tại A rồi B, tới điểm giao mẫu. Tuyến hộp niêm: qua điểm cát rồi giao. Cùng kết quả.',
 EX04:'Quan sát A+B rồi tự đi kiểm chứng, hoặc dùng Định Lưu Bàn tại A để thay bước đọc dấu. Công cụ không bắt buộc.',
};
export const CHAPTER_REPORT_RESPONSES={
 test:'Người giữ tuyến: “Lượt bảo quản đúng cách đã giữ được khí. Ta sẽ sửa cách giao nhận và ghi việc báo chậm.” Kết quả cho thấy lỗi điều kiện bảo quản, chưa có bằng chứng tráo vật liệu.',
 record:'Người giữ tuyến: “Ta gửi bản giải trình kèm ghi nhận việc báo chậm.” Người coi chuẩn bị đối chiếu sổ: vật liệu không bị tráo; điều kiện dẫn khí và bảo quản làm mẫu hao tổn.',
} as const;
export const CHAPTER_REWARDS:Record<ChapterQuestId,number>={HN05:100,HN06:120,HN07:240,HN08:300,HN09:360,HN10:0,HN11:0,HN12:0,EX01:0,EX02:0,EX03:0,EX04:0};
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
