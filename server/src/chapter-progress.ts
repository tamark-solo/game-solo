import { CHAPTER_QUESTS,CHAPTER_RECIPES,CHAPTER_REWARDS,CHAPTER_WORLD,initialChapter,chapterRecipeBlocker,type ChapterCommand,type ChapterProgress,type ChapterQuestId,type ChapterResult,type ChapterView,type MaterialId } from '../../shared/chapter';
import type {CharacterProfile} from '../../shared/profiles';
import type {CombatActor} from '../../shared/r01';
import {nearStation,type StationId} from '../../shared/sect';

export const chapterStation=(q:ChapterQuestId):StationId=>q==='HN07'?'cultivation':['HN05','HN09','HN10'].includes(q)?'training':['HN11','HN12'].includes(q)?'guide':'preparation';
export function chapterAvailable(p:CharacterProfile):ChapterQuestId[]{
 const c=p.chapter??initialChapter(),done=(q:ChapterQuestId)=>c.completed.includes(q);
 return CHAPTER_QUESTS.filter(q=>{
  if(done(q))return false;
  switch(q){
   case 'HN05':return p.sect.lessons.hn04;
   case 'HN06':return done('HN05')&&['M02','M03','M04'].includes(p.milestone);
   case 'HN07':return done('HN06')&&p.sect.level>=3;
   case 'HN08':return done('HN07');
   case 'HN09':return done('HN08');
   case 'HN10':return done('HN09')&&p.sect.level===15&&c.jade==='refined';
   case 'HN11':return done('HN10')&&p.milestone==='M04';
   case 'HN12':return done('HN11');
   case 'EX01':return done('HN12');
   case 'EX02':return done('EX01');
   case 'EX03':return done('EX02');
   case 'EX04':return done('EX03');
  }
 });
}
export interface ChapterOutcome {result:ChapterResult;candidate?:CharacterProfile;effect?:'enter'|'leave'|'prepare'|'start'|'guard'|'trip_start'|'trip_cancel'}
export function performChapterCommand(profile:CharacterProfile,actor:CombatActor,cmd:ChapterCommand,now:number,view?:ChapterView):ChapterOutcome {
 const reject=(reason:string):ChapterOutcome=>({result:{requestId:cmd.id,ok:false,reason}});
 if(!actor.connected)return reject('inactive');
 const p=structuredClone(profile),c=p.chapter??=initialChapter(),q=cmd.quest,hub=c.scene==='hub';
 const accepted=(effect?:ChapterOutcome['effect']):ChapterOutcome=>({result:{requestId:cmd.id,ok:true},candidate:p,...(effect?{effect}:{})});
 const done=(id:ChapterQuestId)=>c.completed.includes(id),has=(fact:string)=>c.facts.includes(fact);
 const fact=(f:string)=>{if(!has(f))c.facts.push(f);};
 const nearNode=(id:string)=>{const n=CHAPTER_WORLD.nodes.find(n=>n.id===id);return !!n&&Math.hypot(actor.x-n.x,actor.y-n.y)<=72;};
 const station=(id:StationId)=>hub&&nearStation(actor,id);
 const already=():ChapterOutcome=>({result:{requestId:cmd.id,ok:true,reason:'already_complete'}});
 if(cmd.action==='leave'){
  if(hub)return already();
  if(c.trip==='active'){c.sealed=false;c.trip='none';}
  c.scene='hub';c.activity='none';delete c.activitySave;return accepted('leave');
 }
 if(cmd.action==='guard'){
  if(hub||actor.hp<=0||view?.status!=='running'||!c.jadeEquipped||c.jade!=='refined')return reject('guard_unavailable');
  if(c.guardReadyAt>now)return reject('cooldown');if(actor.mp<15)return reject('resource');
  p.mp=actor.mp-15;p.lastSpentAt=now;c.guardReadyAt=now+12000;
  if(c.activitySave){c.activitySave.guardUntil=now+1000;c.activitySave.guardSpent=false;}
  return accepted('guard');
 }
 if(cmd.action==='prepare'||cmd.action==='start'){
  if(hub&&cmd.action==='prepare'&&cmd.quest==='EX03'&&station('preparation')&&c.accepted.includes('EX03')&&!done('EX03')){
   if(c.trip==='active'||c.sealed)return reject('trip');c.trip='ready';return accepted();
  }
  if(hub||!['HN05','HN07','HN08','HN09','HN10'].includes(c.activity))return reject('activity');
  if(view?.status==='running')return reject('combat');
  if(cmd.action==='start'&&c.activity==='HN08'&&!c.jadeEquipped)return reject('jade');
  if(c.activity==='HN10'&&done('HN10'))return already();
  // The free preparation service does not consume or grant inventory supplies.
  p.hp=p.mp=100;p.nextSwordAt=p.nextThunderAt=p.nextWindAt=0;p.lastSpentAt=0;c.guardReadyAt=0;
  return accepted(cmd.action);
 }
 if(cmd.action==='trip_cancel'){
  if(c.trip==='none')return already();
  if(c.trip==='ready'&&c.sealed)c.stock['vh-guiding-ink']=(c.stock['vh-guiding-ink']??0)+1;
  c.sealed=false;c.trip='none';return accepted('trip_cancel');
 }
 if(cmd.action==='trip_start'){
  if(hub||c.activity!=='EX03'||c.trip!=='ready'||view?.status==='running')return reject('trip');
  if(cmd.choice!=='stable'&&cmd.choice!=='sealed')return reject('choice');
  if(cmd.choice==='sealed'&&!c.sealed)return reject('seal');
  c.trip='active';c.tripSerial++;c.facts=c.facts.filter(f=>!f.startsWith('trip-'));fact(`trip-${c.tripSerial}-${cmd.choice}`);return accepted('trip_start');
 }
 if(cmd.action==='interact'){
  if(cmd.node==='guard-method'){
   if(!station('preparation')||!c.accepted.includes('HN08'))return reject('distance');fact('hn-guard-method');return accepted();
  }
  if(hub||!cmd.node||!nearNode(cmd.node))return reject('distance');
  if(c.activity==='HN06'){
   if(p.avatarId==='CHR-WANG-LIN-CHIBI'&&['sample-a','sample-b'].includes(cmd.node))fact(`HN06-${cmd.node}`);
   else if(p.avatarId==='CHR-SITU-NAN'&&cmd.node==='stable'&&view?.stableReady)fact('HN06-stable-retested');
   else if(p.avatarId==='CHR-LI-MUWAN'&&cmd.node==='sample-a'&&cmd.choice==='case')fact('HN06-case');
   else if(p.avatarId==='CHR-LI-MUWAN'&&cmd.node==='sample-b'&&has('HN06-case'))fact('HN06-compared');
   else return reject('sample_action');
   if(p.avatarId==='CHR-WANG-LIN-CHIBI'?has('HN06-sample-a')&&has('HN06-sample-b'):p.avatarId==='CHR-SITU-NAN'?has('HN06-stable-retested'):has('HN06-compared'))fact('HN06-proof');
  }else if(c.activity==='HN07'){
   if(cmd.node!=='stable'||p.avatarId!=='CHR-LI-MUWAN')return reject('preparation');
   if(c.activitySave)c.activitySave.prepared=true;
  }else if(c.activity==='EX01'){
   if(!['herb','water','sand'].includes(cmd.node))return reject('node');fact(`EX01-${cmd.node}`);
   if(['herb','water','sand'].every(n=>has(`EX01-${n}`)))fact('EX01-proof');
  }else if(c.activity==='EX02'){
   if(!['fiber','jade','verify'].includes(cmd.node))return reject('node');
   if(cmd.node==='verify'&&(!has('EX02-fiber')||!has('EX02-jade')))return reject('samples');
   fact(`EX02-${cmd.node}`);if(has('EX02-verify'))fact('EX02-proof');
  }else if(c.activity==='EX03'){
   if(c.trip!=='active')return reject('trip');const sealed=has(`trip-${c.tripSerial}-sealed`),prefix=`trip-${c.tripSerial}`;
   if(sealed){if(cmd.node==='sand')fact(`${prefix}-passed`);else if(cmd.node==='deliver'&&has(`${prefix}-passed`))fact('EX03-proof');else return reject('route');}
   else {
    if(cmd.node==='observe-a'||cmd.node==='observe-b'){
     if(!view?.stableReady||cmd.node==='observe-b'&&!has(`${prefix}-observe-a`))return reject('stable');fact(`${prefix}-${cmd.node}`);
    }else if(cmd.node==='deliver'&&has(`${prefix}-observe-a`)&&has(`${prefix}-observe-b`))fact('EX03-proof');else return reject('route');
   }
   if(has('EX03-proof')){c.sealed=false;c.trip='none';return accepted('trip_cancel');}
  }else if(c.activity==='EX04'){
   if(cmd.node==='verify'){
    if(!has('EX04-observe-a')||!has('EX04-observe-b'))return reject('observations');fact('EX04-proof');
   }else if(cmd.node==='observe-a'&&cmd.choice==='compass'){
    if(!c.compassOwned)return reject('compass');fact('EX04-observe-a');fact('EX04-observe-b');
   }else if(['observe-a','observe-b'].includes(cmd.node))fact(`EX04-${cmd.node}`);
   else return reject('node');
  }else return reject('activity');
  return accepted();
 }
 if(!hub||actor.hp<=0||actor.castId||p.sect.lessons.active!=='none'||now<actor.lastSpentAt+2000)return reject('combat');
 if(cmd.action==='confirm_m02'){
  if(!station('cultivation'))return reject('distance');if(['M02','M03','M04'].includes(p.milestone))return already();
  if(!done('HN05')||p.sect.level!==3)return reject('m02');p.milestone='M02';return accepted();
 }
 if(cmd.action==='report'){
  if(!station('preparation'))return reject('distance');if(!done('HN09'))return reject('hn09');
  if(cmd.choice!=='test'&&cmd.choice!=='record')return reject('choice');c.report=cmd.choice;return accepted();
 }
 if(cmd.action==='equip_jade'){
  if(c.jade!=='refined')return reject('jade');c.jadeEquipped=true;return accepted();
 }
 if(cmd.action==='craft'){
  if(!station('preparation'))return reject('distance');
  const recipe=CHAPTER_RECIPES.find(r=>r.id===cmd.recipe);if(!recipe)return reject('recipe');
  const blocked=chapterRecipeBlocker(c,recipe);if(blocked)return blocked==='already_complete'?already():reject(blocked);
  for(const [id,n] of Object.entries(recipe.consume))c.stock[id as MaterialId]=(c.stock[id as MaterialId]??0)-n!;
  if(recipe.transform)c.jade='refined';
  for(const [id,n] of Object.entries(recipe.produce)){
   if(id==='recovery')p.sect.supplies+=n;else if(id==='vh-sealed-case')c.caseOwned=true;else if(id==='vh-flow-compass')c.compassOwned=true;else c.stock[id as MaterialId]=(c.stock[id as MaterialId]??0)+n;
  }
  if(recipe.effect)c.sealed=true;return accepted();
 }
 if(!q||!station(chapterStation(q)))return reject('distance');
 if(cmd.action==='accept'){
  if(c.accepted.includes(q))return already();if(!chapterAvailable(p).includes(q))return reject('prerequisite');
  c.accepted.push(q);if(q==='HN08'&&c.jade==='none')c.jade='raw';if(q==='EX03')c.trip='ready';return accepted();
 }
 if(!c.accepted.includes(q)||done(q))return done(q)?already():reject('accepted');
 if(cmd.action==='enter'){
  if(['HN11','HN12'].includes(q))return reject('activity');
  c.scene=q==='HN10'?'trial':'outer';c.activity=q;if(q==='EX03'&&c.trip==='none')c.trip='ready';return accepted('enter');
 }
 if(cmd.action==='confirm'){
  if(!['HN11','HN12'].includes(q)&&!has(`${q}-proof`))return reject('proof');
  if(q==='HN09'&&p.sect.level<9)return reject('level9');
  if(q==='HN10')return reject('trial');
  c.completed.push(q);p.cultivation+=CHAPTER_REWARDS[q];
  if(q==='HN05'||q==='HN06')c.stock['hn-refining-material']=(c.stock['hn-refining-material']??0)+3;
  if(['HN05','HN08','HN09'].includes(q))p.sect.supplies+=2;
  if(q==='HN09')p.milestone='M03';
  if(q==='EX01'){c.stock['vh-clean-herb']=2;c.stock['vh-clear-water']=2;c.stock['vh-conductive-sand']=1;}
  if(q==='EX02'){c.stock['vh-soft-fiber']=3;c.stock['vh-stable-jade']=3;c.stock['vh-conductive-sand']=(c.stock['vh-conductive-sand']??0)+1;}
  return accepted();
 }
 return reject('invalid');
}

export function chapterHint(c:ChapterProgress,avatar:string):string {
 const q=c.activity;
 if(q==='HN06')return avatar==='CHR-WANG-LIN-CHIBI'?'Đến mẫu A và B, nhấn E để đối chiếu.':avatar==='CHR-SITU-NAN'?'Giữ chân tại điểm ổn định 2 giây rồi E để thử lại mẫu.':'E tại mẫu A để đặt vỏ bảo quản, sau đó E tại B để so với mẫu trần.';
 if(q==='HN07')return avatar==='CHR-WANG-LIN-CHIBI'?'Đánh trúng trong khoảng đối thủ đang hồi phục.':avatar==='CHR-SITU-NAN'?'Giữ điểm ổn định 2 giây trong lượt rồi đánh trúng.':'Chuẩn bị tại điểm ổn định trước hoặc trong lượt; đánh trong khoảng hồi phục.';
 if(q==='HN08')return 'Bắt đầu, nhấn G khi đòn báo đỏ sắp tới. Hộ thân giảm 50% sát thương của một đòn trong 1 giây.';
 if(q==='EX01')return 'E tại dược liệu, linh tuyền và cát; quay về người coi chuẩn bị xác nhận.';
 if(q==='EX02')return 'E tại sợi, ngọc rồi điểm kiểm chứng để sơ chế; quay về xác nhận.';
 if(q==='EX03')return 'Chọn tuyến: thủ công qua A → B → giao mẫu, hoặc hộp niêm qua điểm cát → giao mẫu.';
 if(q==='EX04')return 'Quan sát A+B hoặc dùng Định Lưu Bàn tại A, rồi tự tới điểm kiểm chứng.';
 return 'Chủ động bắt đầu. F đánh gần · 1 Kiếm · 2 Lôi · 3 Phong · G hộ thân. Thua được chuẩn bị/thử lại miễn phí.';
}
