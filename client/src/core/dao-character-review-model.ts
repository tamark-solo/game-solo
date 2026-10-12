import {CHARACTER_ITEMS,ownedItemId,type CharacterItemId,type CharacterItemView,type CharacterCommand,type GearSlot} from '../../../shared/character-inventory';
import type {MaterialReviewState} from './ui-material-review-state';

// Isolated UX fixture transitions; never import into the live character session.
export function reviewOwnedItems(s:MaterialReviewState):CharacterItemView[]{
 if(s.inventoryScenario==='empty')return [];
 const items:CharacterItemView[]=s.inventory.gear.map(g=>({id:g.id,definitionId:g.definitionId,quantity:1,protected:g.protected,equipped:Object.values(s.inventory.equipment).includes(g.id)}));
 if(s.sect.supplies>0)items.push({id:ownedItemId(s.sect.profileId,'recovery'),definitionId:'recovery',quantity:s.sect.supplies,protected:s.inventory.recoveryProtected,equipped:false});
 return items;
}
export const reviewItem=(s:MaterialReviewState,id:CharacterItemId)=>reviewOwnedItems(s).find(i=>i.definitionId===id);
export const reviewEquipped=(s:MaterialReviewState,slot:GearSlot)=>reviewOwnedItems(s).find(i=>i.id===s.inventory.equipment[slot]);
export function reviewActionReason(s:MaterialReviewState,id:CharacterItemId,action:CharacterCommand['action'],now:number):string{
 if(!s.online||s.inventoryScenario==='offline')return 'Mất kết nối. Kết nối lại để thao tác với vật phẩm.';
 if(s.inventoryPending||s.inventoryScenario==='pending')return 'Đang chờ xác nhận. Vui lòng đợi kết quả trước khi thao tác tiếp.';
 if(s.hp<=0)return 'Nhân vật chưa thể sử dụng vật phẩm trong trạng thái này.';
 const item=reviewItem(s,id);if(!item)return 'Vật phẩm không còn trong hồ sơ đang xem.';
 if(action==='protect')return '';
 if(s.inventoryScenario==='combat'||s.castingSkill||s.sect.practising||s.sect.lessons.active!=='none')return 'Đang luyện thuật. Kết thúc bài luyện trước khi thay đồ hoặc dùng vật tư.';
 const d=CHARACTER_ITEMS[id];
 if(action==='use'){
  if(d.kind!=='consumable')return 'Món này không phải vật tư sử dụng.';
  if(s.hp>=100)return 'Sinh lực đang đầy. Vật tư được giữ lại.';
  if(now<s.sect.nextRecoveryAt)return 'Vật tư đang hồi dùng. Đợi hết thời gian để dùng tiếp.';
 }else if(d.kind!=='gear')return 'Món này không phải trang bị.';
 else if(action==='unequip'&&!item.equipped)return 'Món này đang ở trong túi.';
 else if(action==='equip'&&item.equipped)return 'Đây là món đang mang.';
 return '';
}
export function beginReviewItemAction(s:MaterialReviewState,id:CharacterItemId,action:CharacterCommand['action'],now:number):number|undefined{
 const reason=reviewActionReason(s,id,action,now);
 if(reason){s.inventoryFeedback=reason;s.inventoryFeedbackKind='error';return;}
 const seq=++s.inventorySeq;s.inventoryPending={seq,action,itemId:id,protected:action==='protect'?!reviewItem(s,id)!.protected:undefined,reject:s.inventoryScenario==='rejected'};
 s.inventoryFeedback='Đang xác nhận '+CHARACTER_ITEMS[id].name+'…';s.inventoryFeedbackKind='pending';return seq;
}
export function finishReviewItemAction(s:MaterialReviewState,seq:number,now:number):boolean{
 const pending=s.inventoryPending;if(!pending||pending.seq!==seq)return false;
 s.inventoryPending=undefined;
 const reason=pending.reject?'Yêu cầu chưa được chấp nhận. Vật phẩm và thuộc tính được giữ nguyên.':reviewActionReason(s,pending.itemId,pending.action,now);
 if(reason){s.inventoryFeedback=reason;s.inventoryFeedbackKind='error';return false;}
 const item=reviewItem(s,pending.itemId)!,change={action:pending.action,itemId:pending.itemId,hpBefore:s.hp,hpAfter:s.hp,suppliesBefore:s.sect.supplies,suppliesAfter:s.sect.supplies,equippedBefore:item.equipped,equippedAfter:item.equipped};
 const gear=s.inventory.gear.find(g=>g.definitionId===pending.itemId);
 if(pending.action==='protect'){if(gear)gear.protected=pending.protected!;else s.inventory.recoveryProtected=pending.protected!;}
 else if(pending.action==='use'){s.hp=Math.min(100,s.hp+30);s.sect.hp=s.hp;s.sect.supplies--;s.sect.nextRecoveryAt=now+10000;change.hpAfter=s.hp;change.suppliesAfter=s.sect.supplies;}
 else{const slot=CHARACTER_ITEMS[pending.itemId].slot!;if(pending.action==='equip')s.inventory.equipment[slot]=gear!.id;else delete s.inventory.equipment[slot];change.equippedAfter=pending.action==='equip';}
 s.inventoryLastChange=change;s.inventoryFeedbackKind='success';
 s.inventoryFeedback=pending.action==='use'?`Đã hồi ${change.hpAfter-change.hpBefore} sinh lực · còn ${s.sect.supplies} vật tư.`:pending.action==='protect'?(pending.protected?'Đã bảo vệ ':'Đã bỏ bảo vệ ')+CHARACTER_ITEMS[pending.itemId].name:(pending.action==='equip'?'Đã mang ':'Đã tháo ')+CHARACTER_ITEMS[pending.itemId].name+' · nền sinh lực/linh lực giữ 100/100.';
 return true;
}
