import assert from 'node:assert/strict';import {test} from 'node:test';import {readFileSync} from 'node:fs';
import {CHAPTER_RECIPES,CHAPTER_WORLD,initialChapter,validChapter,readChapterCommand,chapterCommandKey,chapterGate,levelThreshold,applyChapterMovement,type ChapterCommand,type ChapterQuestId,type ChapterView} from '../../shared/chapter';
import {initialProfile,type CharacterProfile} from '../../shared/profiles';
import {SECT_STATIONS,validSectProgress} from '../../shared/sect';
import {Disciple} from '../../shared/protocol/courtyard-state';
import {performChapterCommand,chapterAvailable,chapterStation} from '../../server/src/chapter-progress';
import {ChapterActivity} from '../../server/src/chapter-activity';
import {advanceCultivation,performSectCommand} from '../../server/src/sect-progress';
import {performCharacterCommand} from '../../server/src/character-inventory';
import {characterItems,ownedItemId} from '../../shared/character-inventory';
import type {CombatActor} from '../../shared/r01';
function profile(){const p=initialProfile('p','a','CHR-WANG-LIN-CHIBI',1);Object.assign(p,{milestone:'M01',cultivation:360,chapter:initialChapter()});Object.assign(p.sect,{hn01:true,hn02:true,cycleStep:4,foundation:'breathing',level:3,supplies:2});Object.assign(p.sect.lessons,{hn03:true,hn04:true,basic:true,sword:true,thunder:true,walk:true,wind:true});return p;}
function actor(p:CharacterProfile):CombatActor{return {id:'s',x:SECT_STATIONS[2].x,y:SECT_STATIONS[2].y,direction:'north',moving:false,connected:true,hp:p.hp,mp:p.mp,casts:0,practiceHits:0,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0};}
const view=(p:CharacterProfile,status:ChapterView['status']='ready'):ChapterView=>({progress:p.chapter!,available:chapterAvailable(p),status,stableReady:true,prepared:false,guardUntil:0,now:10000,hint:''});
function command(p:CharacterProfile,action:ChapterCommand['action'],extra:Partial<ChapterCommand>={},a=actor(p)){
 const q=extra.quest;if(q)Object.assign(a,SECT_STATIONS.find(s=>s.id===chapterStation(q))!);
 if(action==='craft'||action==='interact'&&extra.node==='guard-method')Object.assign(a,SECT_STATIONS[3]);
 return performChapterCommand(p,a,{id:'cmd',action,...extra},10000,view(p));
}
function complete(p:CharacterProfile,q:ChapterQuestId){p.chapter!.accepted.push(q);p.chapter!.facts.push(`${q}-proof`);return command(p,'confirm',{quest:q}).candidate!;}
test('chapter recipes match the GDD source and commands reject reward/owner injection',()=>{
 const plan=JSON.parse(readFileSync('docs/design/systems/items-v1/plan.json','utf8'));assert.deepEqual(CHAPTER_RECIPES,plan.recipes);
 assert.equal(readChapterCommand({id:'x',action:'craft',recipe:'vh-recipe-ink',quantity:999}),undefined);
 assert.equal(readChapterCommand({id:'x',action:'confirm',quest:'HN04'}),undefined);
 assert.notEqual(chapterCommandKey({id:'x',action:'trip_start',choice:'stable'}),chapterCommandKey({id:'x',action:'trip_start',choice:'sealed'}));
 assert.equal(validChapter(initialChapter()),true);assert.equal(validChapter({...initialChapter(),stock:{recovery:4}}),false);
});
test('chapter movement reads Colyseus schema positions and preserves lock/dash/boundaries',()=>{
 const a=new Disciple();Object.assign(a,{x:640,y:704,direction:'north',moving:false,dashVX:0,dashVY:0,motionLocked:false});
 applyChapterMovement(a,{moveX:1,moveY:0},.1);assert.equal(a.x,648);assert.equal(a.y,704);assert.equal(a.direction,'east');
 a.motionLocked=true;applyChapterMovement(a,{moveX:1,moveY:0},.1);assert.equal(a.x,648);assert.equal(a.moving,false);
 a.dashVX=240;applyChapterMovement(a,{moveX:0,moveY:0},.1);assert.equal(a.x,672);
 a.x=1220;applyChapterMovement(a,{moveX:1,moveY:0},.1);assert.ok(a.x<=1224);assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));
});
test('invalid chapter data fails profile validation without throwing or repairing resources',()=>{
 const p=profile();assert.equal(validSectProgress(p.sect,p),true);
 assert.equal(validSectProgress(p.sect,{...p,chapter:{...p.chapter!,completed:undefined} as never}),false);
 assert.equal(validSectProgress(p.sect,{...p,chapter:{...p.chapter!,stock:{recovery:10}} as never}),false);
});
test('HN05/06 sources grant once, M02 needs level3, overflow and remaining two materials survive',()=>{
 let p=profile();assert.deepEqual(chapterAvailable(p),['HN05']);p=complete(p,'HN05');assert.equal(p.cultivation,460);assert.equal(p.chapter!.stock['hn-refining-material'],3);assert.equal(p.sect.supplies,4);
 assert.equal(command(p,'confirm',{quest:'HN05'}).candidate,undefined);assert.equal(command(p,'accept',{quest:'HN06'}).result.reason,'prerequisite');
 const a=actor(p);Object.assign(a,SECT_STATIONS[1]);p=performChapterCommand(p,a,{id:'m02',action:'confirm_m02'},10000).candidate!;assert.equal(p.milestone,'M02');
 p=complete(p,'HN06');p=complete(p,'HN07');assert.equal(chapterGate(p.chapter!),1620);
 p=command(p,'accept',{quest:'HN08'}).candidate!;const id=characterItems(p).find(i=>i.definitionId==='hn-training-jade')!.id;
 p=command(p,'interact',{node:'guard-method'}).candidate!;p=command(p,'craft',{recipe:'hn-refine-training-jade'}).candidate!;
 assert.equal(p.chapter!.stock['hn-refining-material'],2);assert.equal(p.chapter!.jade,'refined');assert.equal(characterItems(p).find(i=>i.definitionId==='hn-training-jade')!.id,id);
 assert.equal(command(p,'craft',{recipe:'hn-refine-training-jade'}).candidate,undefined);assert.equal(p.chapter!.stock['hn-refining-material'],2);
});
test('six recipes use finite sources and recovery remains sect.supplies; tools are single instances',()=>{
 let p=profile();p.chapter!.accepted=['HN12'];p.chapter!.completed=['HN12'];p=complete(p,'EX01');p=complete(p,'EX02');
 for(const r of ['vh-recipe-ink','vh-recipe-recovery','vh-recipe-case'])p=command(p,'craft',{recipe:r}).candidate!;
 assert.equal(p.sect.supplies,3);assert.equal(p.chapter!.stock['vh-clean-herb'],0);assert.equal(command(p,'craft',{recipe:'vh-recipe-case'}).candidate,undefined);
 p=command(p,'accept',{quest:'EX03'}).candidate!;p=command(p,'craft',{recipe:'vh-recipe-seal'}).candidate!;assert.equal(p.chapter!.sealed,true);assert.equal(p.chapter!.stock['vh-guiding-ink'],0);
 p=command(p,'trip_cancel').candidate!;assert.equal(p.chapter!.stock['vh-guiding-ink'],1);assert.equal(command(p,'trip_cancel').candidate,undefined);
 p.chapter!.facts.push('EX03-proof');p=command(p,'confirm',{quest:'EX03'}).candidate!;p=command(p,'craft',{recipe:'vh-recipe-compass'}).candidate!;
 assert.equal(p.chapter!.caseOwned,true);assert.equal(p.chapter!.compassOwned,true);assert.equal(characterItems(p).filter(i=>['vh-sealed-case','vh-flow-compass'].includes(i.definitionId)).length,2);
 assert.equal(validChapter(p.chapter),true);
});
test('starting a sealed trip ends pre-start refund; manual route does not require tools or consume stock',()=>{
 const p=profile();Object.assign(p.chapter!,{accepted:['EX03'],completed:[],scene:'outer',activity:'EX03',trip:'ready',caseOwned:true,sealed:true});
 const a=actor(p);Object.assign(a,CHAPTER_WORLD.spawn);
 const start=performChapterCommand(p,a,{id:'go',action:'trip_start',choice:'sealed'},10000,view(p)).candidate!;
 const cancel=performChapterCommand(start,a,{id:'cancel',action:'trip_cancel'},10000,view(start,'running')).candidate!;assert.equal(cancel.chapter!.stock['vh-guiding-ink'],undefined);assert.equal(cancel.chapter!.caseOwned,true);
 const manual=structuredClone(p);Object.assign(manual.chapter!,{caseOwned:false,sealed:false});assert.equal(performChapterCommand(manual,a,{id:'manual',action:'trip_start',choice:'stable'},10000,view(manual)).result.ok,true);
});
test('avatar sample proofs use their own branch; a client cannot confirm merely by claiming a node',()=>{
 for(const avatar of ['CHR-WANG-LIN-CHIBI','CHR-SITU-NAN','CHR-LI-MUWAN'] as const){
  let p=profile();p.avatarId=avatar;Object.assign(p.chapter!,{accepted:['HN06'],activity:'HN06',scene:'outer'});const a=actor(p);
  const interact=(id:string,choice?:string)=>{Object.assign(a,CHAPTER_WORLD.nodes.find(n=>n.id===id)!);const out=performChapterCommand(p,a,{id:'sample',action:'interact',node:id,choice},10000,view(p));assert.equal(out.result.ok,true);p=out.candidate!;};
  if(avatar==='CHR-SITU-NAN')interact('stable');else{interact('sample-a',avatar==='CHR-LI-MUWAN'?'case':undefined);assert.equal(p.chapter!.facts.includes('HN06-proof'),false);interact('sample-b');}
  assert.equal(p.chapter!.facts.includes('HN06-proof'),true);
 }
});
test('progression gates use confirmed quests, not reward overflow; background pauses during activities',()=>{
 const p=profile(),a=actor(p);p.sect.activity=true;p.cultivation=359;advanceCultivation(p,a,.1,10000);assert.equal(p.cultivation,359);advanceCultivation(p,a,.1,10000);advanceCultivation(p,a,.1,10000);advanceCultivation(p,a,.1,10000);advanceCultivation(p,a,.1,10000);assert.equal(p.cultivation,360);
 p.chapter!.accepted=['HN07'];p.chapter!.completed=['HN07'];p.cultivation=720;assert.equal(performSectCommand(p,{...a,...SECT_STATIONS[1]},{id:'lvl',action:'confirm_level',level:3},10000,0).candidate!.sect.level,4);
 p.chapter!.scene='outer';p.chapter!.activity='HN07';advanceCultivation(p,a,.1,10000);assert.equal(p.cultivation,720);assert.equal(levelThreshold(15),3600);
});
test('guard costs once, cannot reset through equip, and recovery NPC/inventory parity holds during chapter combat',()=>{
 const p=profile();Object.assign(p.chapter!,{scene:'outer',activity:'HN08',jade:'refined',jadeEquipped:true,accepted:['HN08']});const a=actor(p);a.hp=70;
 const out=performChapterCommand(p,a,{id:'guard',action:'guard'},10000,view(p,'running'));assert.equal(out.candidate!.mp,85);assert.equal(out.candidate!.chapter!.guardReadyAt,22000);
 assert.equal(performChapterCommand(out.candidate!,a,{id:'again',action:'guard'},10001,view(p,'running')).result.reason,'cooldown');
 const npc=performSectCommand(p,a,{id:'supply',action:'use_recovery'},10000,0),bag=performCharacterCommand(p,a,{id:'supply',action:'use',itemId:ownedItemId(p.id,'recovery')},10000);assert.deepEqual(bag,npc);assert.equal(npc.result.reason,'combat');
});
test('private AI locks masks, phase preparation clears effects, snapshot freezes through restart',()=>{
 const p=profile();Object.assign(p.chapter!,{scene:'trial',activity:'HN10',accepted:['HN10'],jade:'refined',jadeEquipped:true});const a=actor(p),events:unknown[]=[];
 let activity=new ChapterActivity(a,p,10000,e=>events.push(e),()=>{});activity.prepare(p,true);assert.equal(activity.view(p).enemy!.hp,60);
 const enemy=activity.view(p).enemy!;Object.assign(a,{x:enemy.x,y:enemy.y+70});
 for(let i=0;i<8;i++){activity.before(1/30);activity.after(1/30,p);}const warning=activity.view(p).warning!;a.x+=50;
 for(let i=0;i<8;i++){activity.before(1/30);activity.after(1/30,p);}assert.equal(activity.view(p).warning!.dx,warning.dx);
 const before=activity.snapshot();assert.equal(validChapter({...p.chapter!,activitySave:before}),true);p.chapter!.activitySave={...before,pausedAt:Date.now()};
 const hp=a.hp,mp=a.mp;activity=new ChapterActivity(a,p,20000,e=>events.push(e),()=>{});assert.equal(a.hp,hp);assert.equal(a.mp,mp);assert.ok(Math.abs(activity.snapshot().ai.at-before.ai.at-(20000-before.now))<.001);
 activity.prepare(p,false);assert.equal(activity.engine.projectiles.size,0);assert.equal(a.castId,'');assert.equal(a.hp,100);
});
test('boss double pulse stays locked and guard reduces only the first positive hit',()=>{
 const p=profile();Object.assign(p.chapter!,{scene:'trial',activity:'HN10',accepted:['HN10'],checkpoint:2,jade:'refined',jadeEquipped:true});const a=actor(p);
 const activity=new ChapterActivity(a,p,10000,()=>{},()=>{});activity.prepare(p,true);activity.view(p).enemy!.hp=110;
 for(let i=0;i<120;i++){activity.before(1/30);activity.after(1/30,p);const warning=activity.view(p).warning;if(warning&&warning.resolveAt-activity.engine.now<=300)break;}
 const snapshot=activity.snapshot();p.chapter!.activitySave={...snapshot,guardUntil:activity.engine.now+1000,guardSpent:false};activity.apply(p.chapter!);
 // The line was locked toward spawn; both pulses touch the same collider, once each.
 for(let i=0;i<40;i++){activity.before(1/30);activity.after(1/30,p);}
 assert.equal(a.hp,77.5);assert.equal(activity.snapshot().guardSpent,true);
});
