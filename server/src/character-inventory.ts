import type {CharacterProfile} from '../../shared/profiles';
import type {CombatActor} from '../../shared/r01';
import {CHARACTER_ITEMS,ownedItemId,type CharacterCommand,type CharacterResult} from '../../shared/character-inventory';
import {isPractising,performSectCommand} from './sect-progress';

export function performCharacterCommand(profile:CharacterProfile,actor:CombatActor,command:CharacterCommand,now:number,projectile=false):{result:CharacterResult;candidate?:CharacterProfile}{
  const reject=(reason:string)=>({result:{requestId:command.id,ok:false,reason}});
  if(!actor.connected||actor.hp<=0)return reject('inactive');
  const recovery=command.itemId===ownedItemId(profile.id,'recovery');
  const gear=profile.inventory.gear.find(item=>item.id===command.itemId);
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
