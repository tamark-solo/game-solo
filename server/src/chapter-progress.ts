import { CHAPTER_QUESTS,CHAPTER_RECIPES,CHAPTER_REWARDS,CHAPTER_WORLD,G2_ALCHEMY_RECIPES,initialChapter,chapterRecipeBlocker,type ChapterCommand,type ChapterProgress,type ChapterQuestId,type ChapterResult,type ChapterView,type MaterialId } from '../../shared/chapter';
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
export function applyG2MilestoneFacts(p:CharacterProfile):void{
 const c=p.chapter??=initialChapter(),has=(f:string)=>c.facts.includes(f),fact=(f:string)=>{if(!has(f)&&c.facts.length<75)c.facts.push(f);};
 if(p.sect.hn01){fact('g2-bead-m1');fact('g2-sword-m1');if(!c.facts.some(f=>f.startsWith('stance-')))fact('stance-sword_kill');}
 if(p.sect.lessons.hn04)fact('g2-act-VG01');
 if(c.completed.includes('HN05'))fact('g2-banner-m1');
 if(c.completed.includes('HN07'))fact('g2-chariot-m1');
 if(c.completed.includes('HN09')||c.jade==='refined')fact('g2-limuwan-unlocked');
 if(c.completed.includes('HN10')){fact('g2-realm-truc_co');if(!c.facts.some(f=>f.startsWith('g2-foundation-')))fact('g2-foundation-heaven');}
 if(c.completed.includes('HN11')){fact('g2-bead-m2');fact('g2-banner-m2');}
 if(c.completed.includes('HN12'))fact('g2-sword-m2');
 if(c.completed.includes('EX01'))fact('g2-chariot-m2');
 if(c.completed.includes('EX03')){fact('g2-realm-ket_dan');fact('g2-bead-m3');fact('g2-sword-m3');fact('g2-banner-m3');fact('g2-chariot-m3');}
}
export function autoChainNextChapterQuest(p:CharacterProfile):void{
 const c=p.chapter??=initialChapter();
 applyG2MilestoneFacts(p);
 const max=c.completed.includes('HN09')?15:c.completed.includes('HN07')?12:c.completed.includes('HN06')?9:c.completed.includes('HN05')?6:3;
 while(p.sect.hn02&&p.sect.level<max&&p.cultivation>=(10*(p.sect.level+1)*(p.sect.level+10)))p.sect.level++;
 if(c.completed.includes('HN05')&&p.sect.level>=3&&p.milestone==='M01')p.milestone='M02';
 if(c.completed.includes('HN09')&&p.sect.level>=9&&['M01','M02'].includes(p.milestone))p.milestone='M03';
 for(const next of chapterAvailable(p)){
  if(!c.accepted.includes(next)){
   c.accepted.push(next);
   if(next==='HN08'&&c.jade==='none')c.jade='raw';
   if(next==='EX03'&&c.trip==='none')c.trip='ready';
  }
 }
}
export interface ChapterOutcome {result:ChapterResult;candidate?:CharacterProfile;effect?:'enter'|'leave'|'prepare'|'start'|'guard'|'trip_start'|'trip_cancel'}
export function performChapterCommand(profile:CharacterProfile,actor:CombatActor,cmd:ChapterCommand,now:number,view?:ChapterView):ChapterOutcome {
 const reject=(reason:string):ChapterOutcome=>({result:{requestId:cmd.id,ok:false,reason}});
 if(!actor.connected)return reject('inactive');
 const p=structuredClone(profile),c=p.chapter??=initialChapter(),q=cmd.quest,hub=c.scene==='hub';
 const accepted=(effect?:ChapterOutcome['effect']):ChapterOutcome=>({result:{requestId:cmd.id,ok:true},candidate:p,...(effect?{effect}:{})});
 const done=(id:ChapterQuestId)=>c.completed.includes(id),has=(fact:string)=>c.facts.includes(fact);
 const fact=(f:string)=>{if(!has(f)&&c.facts.length<78)c.facts.push(f);};
 const nearNode=(id:string)=>{const n=CHAPTER_WORLD.nodes.find(n=>n.id===id);return !!n&&Math.hypot(actor.x-n.x,actor.y-n.y)<=72;};
 const station=(id:StationId)=>hub&&nearStation(actor,id);
 const already=():ChapterOutcome=>({result:{requestId:cmd.id,ok:true,reason:'already_complete'}});
 const ensureQuestDone=(id:ChapterQuestId)=>{if(!c.accepted.includes(id))c.accepted.push(id);fact(`${id}-proof`);if(!c.completed.includes(id))c.completed.push(id);};
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
  if(hub&&cmd.action==='prepare'&&cmd.quest==='EX03'&&(station('preparation')||c.accepted.includes('EX03'))&&c.accepted.includes('EX03')&&!done('EX03')){
   if(c.trip==='active'||c.sealed)return reject('trip');c.trip='ready';return accepted();
  }
  if(hub||!['HN05','HN06','HN07','HN08','HN09','HN10','HN11','HN12','EX01','EX02'].includes(c.activity))return reject('activity');
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
  if(cmd.node==='g2-stance'){
   if(!cmd.choice||!['sword_kill','soul_command','chariot_bulwark'].includes(cmd.choice))return reject('choice');
   c.facts=c.facts.filter(f=>!f.startsWith('stance-'));fact(`stance-${cmd.choice}`);
   return accepted();
  }
  if(cmd.node==='g2-artifact'){
   if(!cmd.choice||!['bead','sword','banner','chariot'].includes(cmd.choice))return reject('choice');
   c.facts=c.facts.filter(f=>!f.startsWith('g2-focus-'));fact(`g2-focus-${cmd.choice}`);
   applyG2MilestoneFacts(p);
   return accepted();
  }
  if(cmd.node==='g2-act'){
   if(actor.hp<=0)return reject('combat');
   const t=p.sect;
   const leaveIfInRealm=():ChapterOutcome['effect']=>{
    if(!hub){c.scene='hub';c.activity='none';delete c.activitySave;return 'leave';}
    return undefined;
   };
   if(cmd.choice==='step1_VG01'){
    if(t.hn01)return already();
    t.hn01=true;t.supplies+=2;
    c.stock['vh-clear-water']=(c.stock['vh-clear-water']??0)+2;
    applyG2MilestoneFacts(p);return accepted();
   }
   if(cmd.choice==='step2_VG01'){
    if(t.hn02)return already();
    t.hn01=true;t.hn02=true;t.foundation=p.avatarId==='CHR-SITU-NAN'?'spirit':'breathing';t.cycleStep=4;t.activity=true;
    t.level=Math.max(1,t.level);p.milestone=p.milestone==='introduction'?'M01':p.milestone;
    p.cultivation=Math.max(120,p.cultivation+120);
    c.stock['vh-clean-herb']=(c.stock['vh-clean-herb']??0)+2;
    applyG2MilestoneFacts(p);autoChainNextChapterQuest(p);return accepted();
   }
   if(cmd.choice==='VG01'||cmd.choice==='complete_VG01'){
    if(t.lessons.hn04&&has('g2-act-VG01'))return already();
    t.hn01=true;t.hn02=true;t.foundation=p.avatarId==='CHR-SITU-NAN'?'spirit':'breathing';t.cycleStep=4;t.activity=true;
    Object.assign(t.lessons,{basic:true,sword:true,thunder:true,walk:true,wind:true,hn03:true,hn04:true,active:'none'});
    t.level=Math.max(3,t.level);p.milestone=p.milestone==='introduction'?'M01':p.milestone;
    p.cultivation=Math.max(390,p.cultivation+270);t.supplies+=2;
    c.stock['vh-clean-herb']=(c.stock['vh-clean-herb']??0)+2;
    c.stock['vh-clear-water']=(c.stock['vh-clear-water']??0)+2;
    fact('g2-act-VG01');autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG02'){
    if(done('HN05'))return already();
    if(!t.lessons.hn04){
     t.hn01=true;t.hn02=true;t.foundation='breathing';t.cycleStep=4;t.activity=true;
     Object.assign(t.lessons,{basic:true,sword:true,thunder:true,walk:true,wind:true,hn03:true,hn04:true,active:'none'});
     t.level=Math.max(3,t.level);
    }
    if(!c.accepted.includes('HN05'))c.accepted.push('HN05');
    c.scene='outer';c.activity='HN05';return accepted('enter');
   }
   if(cmd.choice==='complete_VG02'){
    if(done('HN05'))return already();
    ensureQuestDone('HN05');
    p.cultivation=Math.max(970,p.cultivation+580);t.level=Math.max(6,t.level);p.milestone='M02';
    c.stock['hn-refining-material']=(c.stock['hn-refining-material']??0)+3;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG03'){
    if(done('HN06'))return already();
    if(!done('HN05'))return reject('prerequisite');
    if(!c.accepted.includes('HN06'))c.accepted.push('HN06');
    c.scene='outer';c.activity='HN06';return accepted('enter');
   }
   if(cmd.choice==='complete_VG03'||cmd.choice==='VG03'){
    if(done('HN06'))return already();
    if(!done('HN05'))return reject('prerequisite');
    ensureQuestDone('HN06');
    p.cultivation=Math.max(1730,p.cultivation+760);t.level=Math.max(9,t.level);p.milestone='M02';
    c.stock['hn-refining-material']=(c.stock['hn-refining-material']??0)+2;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG04'){
    if(done('HN07'))return already();
    if(!done('HN06'))return reject('prerequisite');
    if(!c.accepted.includes('HN07'))c.accepted.push('HN07');
    c.scene='outer';c.activity='HN07';return accepted('enter');
   }
   if(cmd.choice==='complete_VG04'){
    if(done('HN07'))return already();
    if(!done('HN06'))return reject('prerequisite');
    ensureQuestDone('HN07');
    p.cultivation=Math.max(2780,p.cultivation+1050);t.level=Math.max(12,t.level);
    c.stock['vh-conductive-sand']=(c.stock['vh-conductive-sand']??0)+2;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG05'){
    if(done('HN09'))return already();
    if(!done('HN07'))return reject('prerequisite');
    ensureQuestDone('HN08');c.jade='refined';c.jadeEquipped=true;fact('hn-guard-method');fact('g2-limuwan-unlocked');
    if(!c.accepted.includes('HN09'))c.accepted.push('HN09');
    c.scene='outer';c.activity='HN09';return accepted('enter');
   }
   if(cmd.choice==='complete_VG05'){
    if(done('HN09'))return already();
    if(!done('HN07'))return reject('prerequisite');
    ensureQuestDone('HN08');ensureQuestDone('HN09');
    c.jade='refined';c.jadeEquipped=true;fact('hn-guard-method');fact('g2-limuwan-unlocked');
    p.cultivation=Math.max(3600,p.cultivation+1500);t.level=15;p.milestone='M03';
    c.stock['vh-stable-jade']=(c.stock['vh-stable-jade']??0)+2;
    c.stock['vh-clean-herb']=(c.stock['vh-clean-herb']??0)+4;
    c.stock['vh-clear-water']=(c.stock['vh-clear-water']??0)+3;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG06'){
    if(done('HN10'))return already();
    if(!done('HN09'))return reject('prerequisite');
    t.level=15;c.jade='refined';c.jadeEquipped=true;
    if(!c.accepted.includes('HN10'))c.accepted.push('HN10');
    c.scene='trial';c.activity='HN10';return accepted('enter');
   }
   if(cmd.choice==='complete_VG06'){
    if(done('HN10'))return already();
    if(!done('HN09'))return reject('prerequisite');
    t.level=15;c.jade='refined';c.jadeEquipped=true;c.checkpoint=3;
    ensureQuestDone('HN10');p.milestone='M04';
    p.cultivation+=1500;fact('g2-realm-truc_co');
    if(!c.facts.some(f=>f.startsWith('g2-foundation-')))fact('g2-foundation-heaven');
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG07'){
    if(done('HN11'))return already();
    if(!done('HN10'))return reject('prerequisite');
    if(!c.accepted.includes('HN11'))c.accepted.push('HN11');
    c.scene='outer';c.activity='HN11';return accepted('enter');
   }
   if(cmd.choice==='complete_VG07'||cmd.choice==='VG07'){
    if(done('HN11'))return already();
    if(!done('HN10'))return reject('prerequisite');
    ensureQuestDone('HN11');p.cultivation+=1800;
    c.stock['vh-clear-water']=(c.stock['vh-clear-water']??0)+3;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG08'){
    if(done('HN12'))return already();
    if(!done('HN11'))return reject('prerequisite');
    if(!c.accepted.includes('HN12'))c.accepted.push('HN12');
    c.scene='trial';c.activity='HN12';return accepted('enter');
   }
   if(cmd.choice==='complete_VG08'||cmd.choice==='VG08'){
    if(done('HN12'))return already();
    if(!done('HN11'))return reject('prerequisite');
    ensureQuestDone('HN12');p.cultivation+=2400;
    c.stock['vh-conductive-sand']=(c.stock['vh-conductive-sand']??0)+2;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG09'){
    if(done('EX01'))return already();
    if(!done('HN12'))return reject('prerequisite');
    if(!c.accepted.includes('EX01'))c.accepted.push('EX01');
    c.scene='outer';c.activity='EX01';return accepted('enter');
   }
   if(cmd.choice==='complete_VG09'||cmd.choice==='VG09'){
    if(done('EX01'))return already();
    if(!done('HN12'))return reject('prerequisite');
    ensureQuestDone('EX01');p.cultivation+=2800;
    c.stock['vh-clean-herb']=(c.stock['vh-clean-herb']??0)+3;
    c.stock['vh-clear-water']=(c.stock['vh-clear-water']??0)+2;
    c.stock['vh-conductive-sand']=(c.stock['vh-conductive-sand']??0)+2;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG10'){
    if(done('EX02'))return already();
    if(!done('EX01'))return reject('prerequisite');
    if(!c.accepted.includes('EX02'))c.accepted.push('EX02');
    c.scene='trial';c.activity='EX02';return accepted('enter');
   }
   if(cmd.choice==='complete_VG10'||cmd.choice==='VG10'){
    if(done('EX02'))return already();
    if(!done('EX01'))return reject('prerequisite');
    ensureQuestDone('EX02');p.cultivation+=3200;
    c.stock['vh-soft-fiber']=(c.stock['vh-soft-fiber']??0)+3;
    c.stock['vh-stable-jade']=(c.stock['vh-stable-jade']??0)+3;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   if(cmd.choice==='enter_VG11'){
    if(done('EX03'))return already();
    if(!done('EX02'))return reject('prerequisite');
    if(!c.accepted.includes('EX03'))c.accepted.push('EX03');
    c.trip='ready';c.scene='trial';c.activity='EX03';return accepted('enter');
   }
   if(cmd.choice==='complete_VG11'||cmd.choice==='VG11'){
    if(done('EX03'))return already();
    if(!done('EX02'))return reject('prerequisite');
    ensureQuestDone('EX03');ensureQuestDone('EX04');
    p.cultivation+=3800;c.compassOwned=true;c.caseOwned=true;
    autoChainNextChapterQuest(p);return accepted(leaveIfInRealm());
   }
   return reject('choice');
  }
  if(cmd.node==='g2-breakthrough'){
   if(!hub||actor.hp<=0)return reject('combat');
   const t=p.sect;
   if(cmd.choice==='vg01'||cmd.choice==='vg02'||cmd.choice==='vg03'||cmd.choice==='vg04'){
    t.hn01=true;t.hn02=true;t.foundation='breathing';t.cycleStep=4;t.activity=true;
    Object.assign(t.lessons,{basic:true,sword:true,thunder:true,walk:true,wind:true,hn03:true,hn04:true,active:'none'});
    t.level=Math.max(3,t.level);p.cultivation=Math.max(390,p.cultivation+390);t.supplies+=2;
    fact('g2-act-VG01');autoChainNextChapterQuest(p);return accepted();
   }
   if(cmd.choice==='level'){
    if(!t.hn02)return reject('hn02');
    const max=done('HN09')?15:done('HN07')?12:done('HN06')?9:done('HN05')?6:3;
    if(t.level>=max)return reject('gate');
    const need=10*(t.level+1)*(t.level+10);
    if(p.cultivation<need)return reject('cultivation');
    t.level++;autoChainNextChapterQuest(p);return accepted();
   }
   if(cmd.choice==='m02'){
    if(['M02','M03','M04'].includes(p.milestone))return already();
    if(!done('HN05')||t.level<3)return reject('m02');
    p.milestone='M02';autoChainNextChapterQuest(p);return accepted();
   }
   if(cmd.choice==='foundation_mortal'||cmd.choice==='foundation_earth'||cmd.choice==='foundation_heaven'){
    if(!done('HN10'))return reject('prerequisite');
    const tier=cmd.choice.replace('foundation_','');
    c.facts=c.facts.filter(f=>!f.startsWith('g2-foundation-'));
    fact(`g2-foundation-${tier}`);fact('g2-realm-truc_co');
    autoChainNextChapterQuest(p);return accepted();
   }
   if(cmd.choice==='ket_dan'){
    if(!done('HN10'))return reject('prerequisite');
    ensureQuestDone('EX03');ensureQuestDone('EX04');
    fact('g2-realm-ket_dan');fact('g2-bead-m3');fact('g2-sword-m3');fact('g2-banner-m3');fact('g2-chariot-m3');
    autoChainNextChapterQuest(p);return accepted();
   }
   return reject('choice');
  }
  if(cmd.node==='g2-quest'&&q){
   if(!hub||actor.hp<=0)return reject('combat');
   if(cmd.choice==='accept'){
    if(c.accepted.includes(q))return already();
    if(!chapterAvailable(p).includes(q))return reject('prerequisite');
    c.accepted.push(q);if(q==='HN08'&&c.jade==='none')c.jade='raw';if(q==='EX03')c.trip='ready';
    return accepted();
   }
   if(cmd.choice==='enter'){
    if(done(q))return already();
    if(q==='HN09'&&!done('HN08')){ensureQuestDone('HN08');c.jade='refined';c.jadeEquipped=true;fact('hn-guard-method');}
    if(q==='HN10'){p.sect.level=15;c.jade='refined';c.jadeEquipped=true;}
    if(!c.accepted.includes(q))c.accepted.push(q);
    if(['HN11','HN12'].includes(q)){
     c.completed.push(q);autoChainNextChapterQuest(p);return accepted();
    }
    c.scene=q==='HN10'?'trial':'outer';c.activity=q;if(q==='EX03'&&c.trip==='none')c.trip='ready';
    return accepted('enter');
   }
   if(cmd.choice==='confirm'){
    if(done(q))return already();
    if(q==='HN09'&&!done('HN08'))ensureQuestDone('HN08');
    if(!c.accepted.includes(q))c.accepted.push(q);
    if(!['HN11','HN12'].includes(q)&&!has(`${q}-proof`))return reject('proof');
    c.completed.push(q);p.cultivation+=CHAPTER_REWARDS[q];
    if(q==='HN05'||q==='HN06')c.stock['hn-refining-material']=(c.stock['hn-refining-material']??0)+3;
    if(['HN05','HN08','HN09'].includes(q))p.sect.supplies+=2;
    if(q==='HN05'){p.sect.level=Math.max(6,p.sect.level);p.milestone='M02';}
    if(q==='HN07')p.sect.level=Math.max(12,p.sect.level);
    if(q==='HN09'){p.sect.level=15;p.milestone='M03';}
    if(q==='EX01'){c.stock['vh-clean-herb']=2;c.stock['vh-clear-water']=2;c.stock['vh-conductive-sand']=1;}
    if(q==='EX02'){c.stock['vh-soft-fiber']=3;c.stock['vh-stable-jade']=3;c.stock['vh-conductive-sand']=(c.stock['vh-conductive-sand']??0)+1;}
    autoChainNextChapterQuest(p);
    return accepted();
   }
   return reject('choice');
  }
  if(cmd.node==='g2-alchemy'){
   if(!hub||actor.hp<=0)return reject('combat');
   const rId=cmd.recipe??cmd.choice;
   const g2Rec=G2_ALCHEMY_RECIPES.find(r=>r.id===rId);
   if(g2Rec){
    for(const [id,n] of Object.entries(g2Rec.consume)){
     if((c.stock[id as MaterialId]??0)<n!)return reject('materials');
    }
    for(const [id,n] of Object.entries(g2Rec.consume))c.stock[id as MaterialId]=(c.stock[id as MaterialId]??0)-n!;
    if(g2Rec.id==='recipe_clear_heart_pill'){p.sect.supplies+=2;p.hp=100;p.mp=100;}
    else if(g2Rec.id==='recipe_seal_breaker_talisman'){c.jade='refined';c.jadeEquipped=true;fact('hn-guard-method');fact('g2-bead-m2');}
    else if(g2Rec.id==='recipe_foundation_pill'){c.caseOwned=true;fact('g2-foundation-pill');}
    else if(g2Rec.id==='recipe_heaven_parting_pill'){c.compassOwned=true;fact('g2-heaven-parting-pill');}
    return accepted();
   }
   if(cmd.choice==='guard-method'){
    fact('hn-guard-method');return accepted();
   }
   const recipe=CHAPTER_RECIPES.find(r=>r.id===rId);if(!recipe)return reject('recipe');
   const blocked=chapterRecipeBlocker(c,recipe);if(blocked)return blocked==='already_complete'?already():reject(blocked);
   for(const [id,n] of Object.entries(recipe.consume))c.stock[id as MaterialId]=(c.stock[id as MaterialId]??0)-n!;
   if(recipe.transform){c.jade='refined';c.jadeEquipped=true;fact('g2-bead-m2');}
   for(const [id,n] of Object.entries(recipe.produce)){
    if(id==='recovery')p.sect.supplies+=n;else if(id==='vh-sealed-case')c.caseOwned=true;else if(id==='vh-flow-compass')c.compassOwned=true;else c.stock[id as MaterialId]=(c.stock[id as MaterialId]??0)+n;
   }
   if(recipe.effect)c.sealed=true;
   return accepted();
  }
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
  }else if(c.activity==='HN09'){
   if(['herb','water'].includes(cmd.node)){
    fact(`HN09-${cmd.node}`);
    const mat:MaterialId=cmd.node==='herb'?'vh-clean-herb':'vh-clear-water';
    c.stock[mat]=(c.stock[mat]??0)+1;
   }else return reject('node');
  }else if(c.activity==='HN11'){
   if(['herb','water','sand'].includes(cmd.node)){
    fact(`HN11-${cmd.node}`);
    const mat:MaterialId=cmd.node==='herb'?'vh-clean-herb':cmd.node==='water'?'vh-clear-water':'vh-conductive-sand';
    c.stock[mat]=(c.stock[mat]??0)+1;
    if(['herb','water','sand'].every(n=>has(`HN11-${n}`)))fact('HN11-proof');
   }else return reject('node');
  }else if(c.activity==='HN12'){
   if(['fiber','jade'].includes(cmd.node)){
    fact(`HN12-${cmd.node}`);
    const mat:MaterialId=cmd.node==='fiber'?'vh-soft-fiber':'vh-stable-jade';
    c.stock[mat]=(c.stock[mat]??0)+1;
    if(has('HN12-fiber')&&has('HN12-jade'))fact('HN12-proof');
   }else return reject('node');
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
  applyG2MilestoneFacts(p);
  return accepted();
 }
 return reject('invalid');
}

export function chapterHint(c:ChapterProgress,avatar:string):string {
 const q=c.activity;
 if(q==='HN05')return 'VG02 · Rìa Khe Mù: Hạ Vân Nha Lang Vương! Né quạt cào 2 nhịp liên hoàn, phản kích bằng F · 1 Kiếm Linh · 2 Hồn Phiên · 3 Xạ Thần Xa.';
 if(q==='HN06')return avatar==='CHR-WANG-LIN-CHIBI'?'VG03 · Tư Đồ Truyền Thừa: Tới điểm mẫu linh mạch A và B nhấn E đối chiếu, hoặc đánh bại Vân Nha Lang Vương để mở Ngưng Khí Trung Kỳ (Tầng 6).':avatar==='CHR-SITU-NAN'?'Giữ chân tại điểm ổn định 2 giây rồi E để thử lại mẫu.':'E tại mẫu A để đặt vỏ bảo quản, sau đó E tại B để so với mẫu trần.';
 if(q==='HN07')return avatar==='CHR-WANG-LIN-CHIBI'?'VG04 · Điện Cổ Trấn Phong: Hạ Tam Ấn Khôi Lỗi để thu phục Hứa Lập Quốc (Kiếm Linh Mốc II) & đột phá Ngưng Khí Hậu Kỳ (Tầng 9).':avatar==='CHR-SITU-NAN'?'Giữ điểm ổn định 2 giây trong lượt rồi đánh trúng.':'Chuẩn bị tại điểm ổn định trước hoặc trong lượt; đánh trong khoảng hồi phục.';
 if(q==='HN08')return 'VG05 · Hậu Sơn Đoạt Quả: Hạ Cổ Mộc Trấn Khí (nhấn G Thiên Nghịch Hộ Tâm khi báo đỏ để giảm 50% sát thương & kích hoạt Thiên Nghịch Châu Mốc II).';
 if(q==='HN09')return 'VG06 · Cửa Vực Ngoại Môn: Trảm Cổ Mộc Trấn Khí & thu thập Dược thảo / Linh tuyền (E) để mở Ngưng Khí Viên Mãn (Tầng 15) & Tôn Hồn Phiên Mốc I.';
 if(q==='HN10')return 'VG07 · Khai Mở Đạo Cơ: Chiến Hắc Ấn Chấp Sự (3 Pha: Đạo Ấn → Phân Phù → Ấn Hồi). Đứng vào khe an toàn 90° hướng khóa trước đại chiêu vòng ấn!';
 if(q==='HN11')return 'VG08 · Vực Ngoại Đằng Gia: Hạ Hắc Ấn Chấp Sự hoặc thu thập 3 điểm Linh thảo / Linh tuyền / Cát dẫn khí (E) để giải ấn Xạ Thần Xa Mốc I & Tôn Hồn Phiên Mốc II.';
 if(q==='HN12')return 'VG09 · Quyết Minh Cốc: Hộ pháp Lý Mộ Uyển hạ Tam Ấn Khôi Lỗi hoặc thu thập Sợi vân bố & Ngọc ổn định (E) để nhận Trúc Cơ Đan.';
 if(q==='EX01')return 'VG10 · Lò Đan Lý Mộ Uyển: Tới 3 điểm Dược thảo Quyết Minh, Linh tuyền và Cát dẫn khí nhấn E thu thập, hoặc đánh bại Cổ Mộc Trấn Khí.';
 if(q==='EX02')return 'VG10-II · Tới Sợi vân bố, Ngọc ổn định rồi Điểm kiểm chứng nhấn E để luyện phôi Thiên Ly Đan.';
 if(q==='EX03')return 'VG11 · Độ Kiếp Cửu Trọng: Đánh bại Hắc Ấn Chấp Sự (Kiếp Lôi Cửu Trọng) hoặc vượt tuyến Độ Kiếp (A → B → Điểm giao) để kết Kim Đan!';
 if(q==='EX04')return 'VG11-II · Đại Mạc Tu Ma Hải: Quan sát A+B hoặc dùng Định Lưu Bàn tại A, rồi tới Điểm kiểm chứng để mở khóa Pháp Bảo Mốc III.';
 return 'Chủ động bắt đầu khiêu chiến. F đánh gần · 1 Kiếm Linh · 2 Hồn Phiên · 3 Xạ Thần Xa · G Thiên Nghịch Hộ Tâm.';
}
