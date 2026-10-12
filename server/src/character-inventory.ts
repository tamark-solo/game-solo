import type {CharacterProfile} from '../../shared/profiles';
import type {CombatActor} from '../../shared/r01';
import {CHARACTER_ITEMS,characterItems,ownedItemId,type CharacterCommand,type CharacterResult} from '../../shared/character-inventory';
import type {ChapterItemId} from '../../shared/chapter';
import {isPractising,performSectCommand} from './sect-progress';

export function performCharacterCommand(profile:CharacterProfile,actor:CombatActor,command:CharacterCommand,now:number,projectile=false):{result:CharacterResult;candidate?:CharacterProfile}{
  const reject=(reason:string)=>({result:{requestId:command.id,ok:false,reason}});
  if(!actor.connected||actor.hp<=0)return reject('inactive');
  const chapterCombat=profile.chapter?.scene!=='hub'&&profile.chapter?.activity&&['HN05','HN07','HN08','HN09','HN10'].includes(profile.chapter.activity);
  const recovery=command.itemId===ownedItemId(profile.id,'recovery');
  if(command.action==='use'&&recovery&&chapterCombat)return reject('combat');
  const gear=profile.inventory.gear.find(item=>item.id===command.itemId);
  const extra=characterItems(profile).find(item=>item.id===command.itemId&&!['wood-sword','plain-robe','recovery'].includes(item.definitionId));
  if(extra&&profile.chapter){
    if(command.action!=='protect'&&(chapterCombat||actor.castId))return reject('combat');
    const p=structuredClone(profile),c=p.chapter!;
    if(command.action==='protect'){
      c.protectedItems=c.protectedItems.filter(id=>id!==extra.definitionId);
      if(command.protected)c.protectedItems.push(extra.definitionId as ChapterItemId);
    }else if(extra.definitionId==='hn-training-jade'&&extra.state==='refined'&&(command.action==='equip'||command.action==='unequip'))c.jadeEquipped=command.action==='equip';
    else return reject('kind');
    return {result:{requestId:command.id,ok:true},candidate:p};
  }
  if(command.action==='use'&&recovery){
    // One recovery policy for NPC and inventory: lessons, practice, supplies, HP and cooldown.
    return performSectCommand(profile,actor,{id:command.id,action:'use_recovery'},now,0,projectile);
  }
  if(!gear&&(!recovery||!profile.sect.supplies))return reject('item');
  if(command.action!=='protect'&&(profile.sect.lessons.active!=='none'||isPractising(actor,now,projectile,profile.sect.lessons.nextBasicAt)))return reject('combat');
  if(command.action==='use')return reject('kind');
  const p=structuredClone(profile),item=p.inventory.gear.find(item=>item.id===command.itemId);
  if(command.action==='protect'){
    if(item)item.protected=command.protected;else p.inventory.recoveryProtected=command.protected;
  }else{
    if(!item)return reject('kind');
    const slot=CHARACTER_ITEMS[item.definitionId].slot!;
    if(command.action==='equip')p.inventory.equipment[slot]=item.id;
    else{if(p.inventory.equipment[slot]!==item.id)return reject('not_equipped');delete p.inventory.equipment[slot];}
  }
  return {result:{requestId:command.id,ok:true},candidate:p};
}
