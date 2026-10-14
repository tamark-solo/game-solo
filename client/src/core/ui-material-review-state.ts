import {initialProfile,type SkillId,type AvatarId} from '../../../shared/profiles';
import {initialSectProgress,type SectView} from '../../../shared/sect';
import type {CharacterItemId,CharacterInventory,GearSlot,CharacterCommand} from '../../../shared/character-inventory';
import {HUD_MAIN_DOCK,type HudFeatureId,type HudCategory} from './dao-hud-system';
export const MATERIAL_REVIEW_IDS={root:'material-review',stage:'stage',mount:'material-hud',panel:'material-panel',content:'material-content',skin:'material-skin',screen:'material-screen',preset:'material-preset',effects:'material-effects',motion:'material-motion',message:'material-message',reset:'material-reset',themeLabel:'material-theme-label',search:'material-item-search',itemDetail:'material-item-detail',itemResults:'material-item-results',systemHud:'material-system-hud',systemSearch:'material-system-search',inventoryScenario:'material-inventory-scenario',itemOrder:'material-item-order'} as const;
export type MaterialPreset='ready'|'cooldown'|'resource'|'health'|'target'|'casting'|'offline';
export type MaterialScreen='quest'|'inventory'|'character'|'appearance'|'hud'|'systems'|'feature'|'map'|'icons';
export type ReviewItemFilter='all'|'gear'|'consumable'|'material'|'quest';
export type ReviewCharacterTab='overview'|'equipment'|'attributes'|'cultivation'|'artifact'|'arts';
export type ReviewInventoryScenario='ready'|'combat'|'offline'|'pending'|'rejected'|'empty';
export interface ReviewInventoryChange {action:CharacterCommand['action'];itemId:CharacterItemId;hpBefore:number;hpAfter:number;suppliesBefore:number;suppliesAfter:number;equippedBefore:boolean;equippedAfter:boolean}
export type ReviewAppearanceCategory='robe'|'aura'|'flight'|'mount'|'title';
// UX studies only: palette/placement concepts, not item definitions or owned cosmetics.
export const APPEARANCE_STUDIES={
 robe:[{id:'cloud-cloth',name:'Vân bố · Thanh ngọc',motif:'Vải thô, tà áo nhẹ, ngàm ngọc nhỏ',colors:['#ccd6c9','#627b72','#b2a783']},{id:'ink-cloth',name:'Mặc y · Huyền nham',motif:'Vải sẫm, chỉ huyết đồng, nếp áo gọn',colors:['#303842','#7e4f4a','#b39b82']},{id:'mist-cloth',name:'Sương y · Vân hải',motif:'Lụa xám, đường mây chìm, điểm xanh lạnh',colors:['#b9cbd0','#647b8d','#d3d3ba']}],
 aura:[{id:'jade-qi',name:'Khí tức · Ngọc thanh',motif:'Vòng khí mảnh, ánh lạnh sát chân',colors:['#92b6a7','#557f81','#d6e4d3']},{id:'ember-qi',name:'Khí tức · Huyết đồng',motif:'Tàn khí đỏ tiết chế, khe sáng hẹp',colors:['#ad655a','#4d333c','#d1a881']}],
 flight:[],mount:[],title:[],
} as const;
export interface MaterialReviewState {
 avatarId:AvatarId;
 skin:'tu-dao'|'doa-ma'|'old';screen:MaterialScreen;preset:MaterialPreset;effects:boolean;reducedMotion:boolean;
 hp:number;mp:number;online:boolean;hasTarget:boolean;castingSkill?:SkillId;castingUntil:number;cooldownEnds:Partial<Record<SkillId,number>>;
 questId:string;itemId:CharacterItemId;itemFilter:ReviewItemFilter;itemSearch:string;itemDetailOpen:boolean;itemComparison:boolean;
 inventory:CharacterInventory;inventoryScenario:ReviewInventoryScenario;itemLocation:'all'|'bag'|'equipped';itemOrder:'type'|'name';gearSlot:GearSlot;
 inventoryPending?:{seq:number;action:CharacterCommand['action'];itemId:CharacterItemId;protected?:boolean;reject:boolean};inventorySeq:number;inventoryFeedback:string;inventoryFeedbackKind:'info'|'pending'|'success'|'error';inventoryLastChange?:ReviewInventoryChange;
 itemReturnTab?:ReviewCharacterTab;itemSourceReturn?:'inventory'|'equipment';itemSourceExpanded:boolean;
 characterQuestReturn?:{tab:ReviewCharacterTab;questId:string};
 characterTab:ReviewCharacterTab;characterSkill?:SkillId;artifactRefined:boolean;appearanceCategory:ReviewAppearanceCategory;appearanceId:string;appearancePreviewId:string;
 hudCategory:HudCategory|'all';hudFeatureId:HudFeatureId;hudQuestCollapsed:boolean;hudLogCollapsed:boolean;
 hudSearch:string;hudPins:HudFeatureId[];hudReturnScreen:'hud'|'systems';
 message:string;now:number;sect:SectView;
}
export function createMaterialReviewState():MaterialReviewState{
 const profile=initialProfile('ui-material-fixture','ui-review','CHR-WANG-LIN-CHIBI',0);
 const sect:SectView={...initialSectProgress(),hn01:true,hn02:true,foundation:'breathing',cycleStep:4,level:1,supplies:2,
  lessons:{...profile.sect.lessons,active:'none',basic:true,sword:true},profileId:profile.id,cultivation:180,milestone:'M01',savedAt:0,hp:100,practising:false,activityStatus:'stopped',cycleStatus:'complete',cycleReadyAt:0};
 return {avatarId:profile.avatarId,skin:'tu-dao',screen:'hud',preset:'ready',effects:true,reducedMotion:false,hp:100,mp:100,online:true,hasTarget:true,castingUntil:0,cooldownEnds:{},questId:'VG03',itemId:'wood-sword',itemFilter:'all',itemSearch:'',itemDetailOpen:false,itemComparison:false,inventory:profile.inventory,inventoryScenario:'ready',itemLocation:'all',itemOrder:'type',gearSlot:'weapon',inventorySeq:0,inventoryFeedback:'',inventoryFeedbackKind:'info',itemSourceExpanded:false,characterTab:'overview',artifactRefined:false,appearanceCategory:'robe',appearanceId:'cloud-cloth',appearancePreviewId:'',hudCategory:'all',hudFeatureId:'character',hudQuestCollapsed:false,hudLogCollapsed:false,hudSearch:'',hudPins:[...HUD_MAIN_DOCK],hudReturnScreen:'hud',message:'',now:0,sect};
}
