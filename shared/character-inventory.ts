import type { AvatarId, CharacterProfile, SkillId } from './profiles';
import type { SectView } from './sect';
import {CHAPTER_ITEMS,type ChapterItemId} from './chapter';

// Owner chose starter gear/existing supplies first, with unchanged HP/MP.
export type GearSlot = 'weapon' | 'robe' | 'charm';
export type CharacterItemId = 'wood-sword' | 'plain-robe' | 'recovery' | ChapterItemId;
export interface CharacterItemDefinition { name:string;kind:'gear'|'consumable'|'material'|'tool';slot?:GearSlot;description:string;effect:string;art:string }
export const CHARACTER_ITEMS:Record<CharacterItemId,CharacterItemDefinition>={
  'wood-sword':{name:'Mộc kiếm nhập môn',kind:'gear',slot:'weapon',description:'Kiếm gỗ dùng trong buổi luyện thuật của người nhập môn.',effect:'Trang bị nhập môn · sinh lực và linh lực giữ nguyên.',art:'wood-sword'},
  'plain-robe':{name:'Áo vải môn phái',kind:'gear',slot:'robe',description:'Áo vải giản dị dành cho hành trình tại Hằng Nhạc.',effect:'Trang bị nhập môn · sinh lực và linh lực giữ nguyên.',art:'plain-robe'},
  recovery:{name:'Vật tư hồi phục',kind:'consumable',description:'Dùng khi không luyện thuật để hồi sinh lực. Sinh lực đầy sẽ giữ lại vật tư.',effect:'Hồi 30 sinh lực · hồi dùng 10 giây.',art:'lotus-pill'},
  ...CHAPTER_ITEMS,
};
export const GEAR_SLOT_NAMES:Record<GearSlot,string>={weapon:'Vũ khí',robe:'Pháp y',charm:'Ngọc sức / pháp bảo'};
export interface OwnedGear { id:string;definitionId:'wood-sword'|'plain-robe';protected:boolean }
export interface CharacterInventory { version:1;gear:OwnedGear[];equipment:Partial<Record<GearSlot,string>>;recoveryProtected:boolean }
export const ownedItemId=(profileId:string,definitionId:CharacterItemId):string=>`${profileId}_${definitionId}`;
export function initialCharacterInventory(profileId:string):CharacterInventory{
  const gear=(['wood-sword','plain-robe'] as const).map(definitionId=>({id:ownedItemId(profileId,definitionId),definitionId,protected:false}));
  return {version:1,gear,equipment:{weapon:gear[0].id,robe:gear[1].id},recoveryProtected:false};
}
export function validCharacterInventory(raw:unknown,profileId:string):raw is CharacterInventory{
  if(!raw||typeof raw!=='object')return false;
  const v=raw as CharacterInventory;
  if(v.version!==1||!Array.isArray(v.gear)||v.gear.length!==2||typeof v.recoveryProtected!=='boolean'||!v.equipment||typeof v.equipment!=='object'||Array.isArray(v.equipment))return false;
  const definitions=new Set<string>();
  for(const item of v.gear){
    if(!item||!['wood-sword','plain-robe'].includes(item.definitionId)||definitions.has(item.definitionId)||item.id!==ownedItemId(profileId,item.definitionId)||typeof item.protected!=='boolean')return false;
    definitions.add(item.definitionId);
  }
  return Object.entries(v.equipment).every(([slot,id])=>['weapon','robe','charm'].includes(slot)&&typeof id==='string'&&v.gear.some(item=>item.id===id&&CHARACTER_ITEMS[item.definitionId].slot===slot));
}
export interface CharacterItemView { id:string;definitionId:CharacterItemId;quantity:number;protected:boolean;equipped:boolean;state?:'raw'|'refined' }
export interface CharacterView {
  profileId:string;avatarId:AvatarId;name:string;hp:number;mp:number;maxHp:number;maxMp:number;
  skills:SkillId[];items:CharacterItemView[];equipment:Partial<Record<GearSlot,string>>;
  sect:SectView;serverNow:number;savedAt:number;revision:number;
}
export type CharacterCommand = {id:string;action:'equip'|'unequip'|'use';itemId:string} | {id:string;action:'protect';itemId:string;protected:boolean};
export interface CharacterResult {requestId?:string;ok:boolean;reason?:string;duplicate?:boolean}
export function readCharacterCommand(raw:unknown):CharacterCommand|undefined{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return;
  const r=raw as Record<string,unknown>;
  if(typeof r.id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(r.id)||!['equip','unequip','use','protect'].includes(String(r.action))||typeof r.itemId!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(r.itemId))return;
  if(Object.keys(r).some(key=>!['id','action','itemId',...(r.action==='protect'?['protected']:[])].includes(key)))return;
  if(r.action==='protect'){if(typeof r.protected!=='boolean')return;return {id:r.id,action:'protect',itemId:r.itemId,protected:r.protected};}
  return {id:r.id,action:r.action as 'equip'|'unequip'|'use',itemId:r.itemId};
}
export const characterCommandKey=(command:CharacterCommand):string=>JSON.stringify([command.action,command.itemId,command.action==='protect'?command.protected:null]);
export function characterItems(profile:CharacterProfile):CharacterItemView[]{
  const result:CharacterItemView[]=profile.inventory.gear.map(item=>({...item,quantity:1,equipped:Object.values(profile.inventory.equipment).includes(item.id)}));
  if(profile.sect.supplies>0)result.push({id:ownedItemId(profile.id,'recovery'),definitionId:'recovery',quantity:profile.sect.supplies,protected:profile.inventory.recoveryProtected,equipped:false});
  const c=profile.chapter;
  if(c){
    for(const [definitionId,quantity] of Object.entries(c.stock))if(quantity!>0)result.push({id:ownedItemId(profile.id,definitionId as ChapterItemId),definitionId:definitionId as ChapterItemId,quantity:quantity!,protected:c.protectedItems.includes(definitionId as ChapterItemId),equipped:false});
    for(const [definitionId,owned] of [['hn-training-jade',c.jade!=='none'],['vh-sealed-case',c.caseOwned],['vh-flow-compass',c.compassOwned]] as const)if(owned)result.push({id:ownedItemId(profile.id,definitionId),definitionId,quantity:1,protected:c.protectedItems.includes(definitionId),equipped:definitionId==='hn-training-jade'&&c.jadeEquipped,...(definitionId==='hn-training-jade'?{state:c.jade as 'raw'|'refined'}:{})});
  }
  return result;
}
