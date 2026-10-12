import './ui-material-review.css';
import './dao-dual-theme-review.css';
import './ui/dao-character-review.css';
import './ui/dao-system-hud-review.css';
import './ui/dao-system-hud-air-layout.css';
import './ui/dao-system-hud-reading-layout.css';
import './ui/dao-system-hud-v4.css';
import './ui/dao-character-review-v3.css';
import './ui/dao-character-review-v4.css';
import './ui/van-hai-player-review.css';
import {SkillHotbar} from './skills/hotbar';
import {attachFrameSurface} from './frame-surface';
import {APPEARANCE_STUDIES,MATERIAL_REVIEW_IDS as IDS,createMaterialReviewState,type MaterialPreset,type MaterialScreen} from './core/ui-material-review-state';
import {renderReviewCharacter,renderReviewInventory,renderReviewAppearance,renderReviewItemResults,renderReviewItemDetail,reviewVisibleItems} from './ui/dao-character-review';
import {renderReviewSystemHud,renderReviewHudSystems,renderReviewHudDirectory,renderReviewHudFeature,renderReviewHudMap,renderReviewHudIcons,renderReviewHudRelated} from './ui/dao-system-hud-review';
import {HUD_FEATURES,hudFeature,type HudFeatureId} from './core/dao-hud-system';
import {sectQuests,QUEST_STATUS_LABELS} from '../../shared/sect-quests';
import type {CharacterItemId,CharacterCommand,GearSlot} from '../../shared/character-inventory';
import {reviewOwnedItems,reviewEquipped,beginReviewItemAction,finishReviewItemAction} from './core/dao-character-review-model';
import {SKILL_DEFINITIONS} from '../../shared/skills/definitions';
import {R01_IDS,type SkillId} from '../../shared/profiles';

// Isolated art/presentation adapter: no network, gameplay engine, storage or profile writes.
const state=createMaterialReviewState(),root=document.getElementById(IDS.root)!,panel=document.getElementById(IDS.panel)!,content=document.getElementById(IDS.content)!,systemMount=document.getElementById(IDS.systemHud)!;
const select=(id:string)=>document.getElementById(id) as HTMLSelectElement;
const checkbox=(id:string)=>document.getElementById(id) as HTMLInputElement;
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const art='/assets/dao-dual-theme-v1',old='/assets/van-ngoc-ui';
interface DaoLayout {hp:{left:number;top:number;size:number};mp:{left:number;top:number;size:number};tray:{left:number;top:number;width:number;height:number};slotTop:number}
let layouts:Record<'tu-dao'|'doa-ma',DaoLayout>|undefined;
let frameRequest=0,lastUpdate=0,disposed=false;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const bar=new SkillHotbar(document.getElementById(IDS.mount)!,{cast:castPreview,blocked:announce});
// One skill illustration source for the taskbar and character reader, across all skins.
const skillIconAtlas='/assets/skill-hud/skill-icons-v2.webp';
bar.setIconAtlas(skillIconAtlas);root.style.setProperty('--dao-skill-icon-atlas',`url("${skillIconAtlas}")`);bar.setOrbTexture('/assets/skill-hud/orb-textures-v2.webp');attachFrameSurface(panel);
function announce(message:string){state.message=message;document.getElementById(IDS.message)!.textContent=message;}
function updateHud(){content.querySelectorAll('[data-review-recovery-time]').forEach(el=>el.textContent='Còn '+Math.max(0,Math.ceil((state.sect.nextRecoveryAt-state.now)/1000))+' giây');bar.update({now:state.now,hp:state.hp,maxHp:100,mp:state.mp,maxMp:100,online:state.online,hasTarget:state.hasTarget,castingSkill:state.castingSkill,cooldownEnds:state.cooldownEnds,aimLabel:'↓ Hướng thi triển'});for(const [name,value] of [['hp',state.hp],['mp',state.mp]])content.querySelectorAll(`[data-review-${name}]`).forEach(el=>el.textContent=String(value));const feedback=systemMount.querySelector('[data-hud-action-state]');if(feedback)feedback.textContent=!state.online?'Chờ kết nối':state.castingSkill?'Đang thi triển · '+SKILL_DEFINITIONS[state.castingSkill].name:state.mp<Math.min(...R01_IDS.map(id=>SKILL_DEFINITIONS[id].cost))?'Linh lực thấp · xem chi phí từng thuật':'Hướng thi triển · đọc trạng thái thuật';}
function updateSystemThemeLabel(){const label=systemMount.querySelector('.system-dao-label');if(label)label.textContent=state.skin==='doa-ma'?'Đọa Ma · Huyền Nham':state.skin==='old'?'HUD hiện hành · tham chiếu':'Tu Đạo · Thanh Ngọc';}
function renderSystemHud(){systemMount.innerHTML=renderReviewSystemHud(state);systemMount.querySelectorAll<HTMLElement>('.system-surface').forEach(attachFrameSurface);updateSystemThemeLabel();updateHud();}
function skin(){root.dataset.skin=state.skin;bar.setFrame(state.skin==='old'?'/assets/skill-hud/cultivation-frame-v3.webp':`${art}/${state.skin}/hud.webp`);
 document.getElementById(IDS.themeLabel)!.textContent=state.skin==='tu-dao'?'Tu Đạo · Thanh Ngọc':state.skin==='doa-ma'?'Đọa Ma · Huyền Nham':'HUD hiện hành · tham chiếu';
 const folder=state.skin==='old'?old:`${art}/${state.skin}`;
 for(const part of ['tl','t','tr','l','c','r','bl','b','br'])root.style.setProperty('--mask-'+part,`url("${folder}/frame-aperture-${part}.svg")`);
 if(state.skin!=='old'&&layouts){const layout=layouts[state.skin];for(const role of ['hp','mp'] as const){const orb=layout[role];for(const key of ['left','top','size'] as const)root.style.setProperty(`--dao-${role}-${key}`,orb[key]+'px');root.style.setProperty(`--dao-${role}-x`,orb.left+orb.size/2+'px');}root.style.setProperty('--dao-orb-y',layout.hp.top+layout.hp.size/2+'px');root.style.setProperty('--dao-slot-top',layout.slotTop+'px');for(const [key,value] of Object.entries(layout.tray))root.style.setProperty('--dao-tray-'+key,value+'px');}
 updateSystemThemeLabel();
}
function effects(){const reduced=state.reducedMotion||motion.matches;root.dataset.motion=reduced?'reduce':'normal';bar.setEffectsEnabled(state.effects);}
function preset(){state.now=performance.now();state.hp=100;state.mp=100;state.online=true;state.hasTarget=true;state.castingSkill=undefined;state.castingUntil=0;state.cooldownEnds={};
 if(state.preset==='health')state.hp=28;if(state.preset==='resource')state.mp=8;if(state.preset==='offline')state.online=false;if(state.preset==='target')state.hasTarget=false;
 if(state.preset==='cooldown'){state.mp=65;for(const id of R01_IDS)state.cooldownEnds[id]=state.now+SKILL_DEFINITIONS[id].cooldown;}
 if(state.preset==='casting'){state.castingSkill='thunder';state.castingUntil=Infinity;}
 state.sect.hp=state.hp;bar.hideTooltip();announce('');renderSystemHud();render();updateHud();schedule();
}
function castPreview(id:SkillId){if(state.screen!=='hud')return;const now=performance.now(),skill=SKILL_DEFINITIONS[id];state.now=now;state.mp=Math.max(0,state.mp-skill.cost);state.cooldownEnds[id]=now+skill.cooldown;state.castingSkill=id;state.castingUntil=now+skill.end;state.preset='ready';select(IDS.preset).value='ready';announce(`Thử ${skill.name} · −${skill.cost} linh lực`);updateHud();schedule();}
function schedule(){if(!frameRequest&&!document.hidden&&!disposed)frameRequest=requestAnimationFrame(tick);}
function tick(now:number){frameRequest=0;state.now=now;if(state.castingSkill&&now>=state.castingUntil)state.castingSkill=undefined;
 if(now-lastUpdate>90){lastUpdate=now;updateHud();}
 if(state.sect.nextRecoveryAt>0&&now>=state.sect.nextRecoveryAt){state.sect.nextRecoveryAt=0;if(state.screen==='inventory')updateInventoryResults();}
 if((state.castingUntil!==Infinity&&(!!state.castingSkill||Object.values(state.cooldownEnds).some(end=>end!>now)))||state.sect.nextRecoveryAt>now)schedule();
}
function heading(title:string,subtitle:string){return `<header class="review-heading"><div><span class="review-eyebrow">HẰNG NHẠC · NHẬP MÔN</span><h2>${title}</h2><p>${subtitle}</p></div><button type="button" class="review-button review-close" data-review-close aria-label="Đóng cửa sổ">×</button></header>`;}
function quests(){const list=sectQuests(state.sect),chosen=list.find(q=>q.id===state.questId)??list[2];
 return heading('Sổ nhiệm vụ','Một bước nhập môn, một đời tu hành')+`<div class="quest-review-grid"><nav class="quest-review-list" aria-label="Danh sách nhiệm vụ">${list.map(q=>`<button class="quest-review-tab" type="button" data-review-quest="${q.id}" aria-pressed="${q.id===chosen.id}"><span>${q.id}</span><b>${escape(q.title)}</b><small>${QUEST_STATUS_LABELS[q.status]}</small></button>`).join('')}</nav><article class="review-paper"><div class="review-detail-head"><span class="review-eyebrow">${chosen.id}</span><span class="review-state" data-state="${chosen.status}">${QUEST_STATUS_LABELS[chosen.status]}</span></div><h3>${escape(chosen.title)}</h3><p>${escape(chosen.description)}</p><h4>Điều kiện hoàn thành</h4><ul class="review-objectives">${chosen.objectives.map(o=>`<li data-complete="${o.done}"><span aria-hidden="true">${o.done?'✓':'○'}</span><span>${escape(o.text)}</span></li>`).join('')}</ul><div class="review-reward"><h4>Thành quả</h4><p>${escape(chosen.reward)}</p></div><p class="review-quest-note">${chosen.status==='unreleased'?'Hành trình này đang được chuẩn bị.':'Tới người hướng dẫn của bài để tiếp tục hoặc xác nhận.'}</p></article></div><footer class="review-footer"><span>${list.filter(q=>q.status==='completed').length}/4 nhiệm vụ đã hoàn thành</span><button class="review-button" type="button" data-review-guide>Điểm hướng dẫn</button></footer>`;
}
function render(){root.dataset.screen=state.screen;root.dataset.characterTab=state.characterTab;root.dataset.inventoryScenario=state.inventoryScenario;panel.dataset.workspace=String(['character','inventory','appearance','systems','feature','map','icons'].includes(state.screen));panel.hidden=state.screen==='hud';systemMount.inert=!panel.hidden;systemMount.setAttribute('aria-hidden',String(!panel.hidden));bar.root.inert=!panel.hidden;if(!panel.hidden)content.innerHTML=state.screen==='quest'?quests():state.screen==='character'?renderReviewCharacter(state):state.screen==='appearance'?renderReviewAppearance(state):state.screen==='systems'?renderReviewHudSystems(state):state.screen==='feature'?renderReviewHudFeature(state):state.screen==='map'?renderReviewHudMap():state.screen==='icons'?renderReviewHudIcons():renderReviewInventory(state);if(state.screen==='inventory')updateInventoryResults();if(state.screen==='character')content.querySelector('.dao-workspace-scroll')?.insertAdjacentHTML('beforeend',renderReviewHudRelated(state.hudFeatureId));updateSystemThemeLabel();if(state.screen==='quest'&&state.characterQuestReturn)content.querySelector('.review-footer')?.insertAdjacentHTML('afterbegin','<button type="button" class="dao-text-button" data-review-character-back>← Về nhân vật</button>');if(state.screen==='quest'&&state.itemSourceReturn)content.querySelector('.review-footer')?.insertAdjacentHTML('afterbegin','<button type="button" class="dao-text-button" data-review-source-back>← Về vật phẩm</button>');bar.hideTooltip();}
function openScreen(screen:MaterialScreen){state.screen=screen;select(IDS.screen).value=screen;announce('');render();}
function focusContent(selector:string){content.querySelector<HTMLElement>(selector)?.focus({preventScroll:true});}
function selectGearSlot(slot:GearSlot){state.gearSlot=slot;const item=reviewEquipped(state,slot)??reviewOwnedItems(state).find(i=>i.definitionId!=='recovery'&&(slot==='weapon'?i.definitionId==='wood-sword':slot==='robe'?i.definitionId==='plain-robe':false));if(item)state.itemId=item.definitionId;}
function workspace(name:string){state.characterQuestReturn=undefined;state.itemSourceReturn=undefined;state.itemReturnTab=undefined;if(name==='equipment'){state.characterTab='equipment';selectGearSlot(state.gearSlot);state.hudFeatureId='equipment';openScreen('character');}else if(name==='character'){state.characterTab='overview';state.hudFeatureId='character';openScreen('character');}else if(name==='inventory'||name==='appearance'){state.hudFeatureId=name;state.itemDetailOpen=false;openScreen(name);}focusContent(`[data-review-workspace="${name}"]`);}
function startItemAction(action:CharacterCommand['action']){const itemId=state.itemId,seq=beginReviewItemAction(state,itemId,action,performance.now());render();announce(state.inventoryFeedback);if(seq===undefined)return;setTimeout(()=>{if(disposed||state.inventoryPending?.seq!==seq)return;state.now=performance.now();finishReviewItemAction(state,seq,state.now);renderSystemHud();render();announce(state.inventoryFeedback);if(state.itemId===itemId)focusContent(action==='protect'?'[data-review-protect]':'.dao-item-primary');schedule();},450);}
function returnFromItemSource(){const source=state.itemSourceReturn;state.itemSourceReturn=undefined;if(source==='equipment'){state.characterTab='equipment';openScreen('character');}else{state.itemDetailOpen=true;openScreen('inventory');}focusContent('[data-review-source-quest]');}
function focusHudFeature(){const choices=[...systemMount.querySelectorAll<HTMLElement>(`[data-hud-feature="${state.hudFeatureId}"],[data-hud-systems]`)];choices.find(el=>el.getClientRects().length>0)?.focus({preventScroll:true});}
function returnFromCharacterQuest(){const origin=state.characterQuestReturn;if(!origin)return;state.characterQuestReturn=undefined;state.characterTab=origin.tab;state.hudFeatureId=origin.tab==='cultivation'?'cultivation':origin.tab==='arts'?'spells':'character';openScreen('character');focusContent('[data-review-open-quest="'+origin.questId+'"]');}
function closeReview(){if(state.characterQuestReturn&&state.screen==='quest'){returnFromCharacterQuest();return;}if(state.itemSourceReturn&&state.screen==='quest'){returnFromItemSource();return;}if(state.hudReturnScreen==='systems'&&state.screen!=='systems'&&state.screen!=='hud'){openScreen('systems');const target=content.querySelector<HTMLElement>(`.system-directory-item[data-hud-feature="${state.hudFeatureId}"]`)??document.getElementById(IDS.systemSearch);target?.focus({preventScroll:true});}else{state.hudReturnScreen='hud';openScreen('hud');focusHudFeature();}}
function updateHudDirectory(){const directory=content.querySelector('.system-directory-scroll');if(directory){directory.innerHTML=renderReviewHudDirectory(state);updateSystemThemeLabel();}}
function updateInventoryResults(){const visible=reviewVisibleItems(state);if(visible.length&&!visible.includes(state.itemId))state.itemId=visible[0];if(!visible.length){state.itemDetailOpen=false;const layout=content.querySelector<HTMLElement>('.dao-inventory-layout');if(layout)layout.dataset.detailOpen='false';}const results=document.getElementById(IDS.itemResults),detail=document.getElementById(IDS.itemDetail);if(results)results.innerHTML=renderReviewItemResults(state);if(detail){detail.hidden=!visible.length;detail.innerHTML=renderReviewItemDetail(state);}}
function openHudFeature(id:HudFeatureId){state.characterQuestReturn=undefined;state.itemSourceReturn=undefined;state.itemReturnTab=undefined;if(state.screen==='hud'||state.screen==='systems')state.hudReturnScreen=state.screen;state.hudFeatureId=id;switch(id){case 'character':state.characterTab='overview';openScreen('character');break;case 'equipment':selectGearSlot(state.gearSlot);state.characterTab='equipment';openScreen('character');break;case 'inventory':state.itemDetailOpen=false;openScreen('inventory');break;case 'cultivation':state.characterTab='cultivation';openScreen('character');break;case 'artifact':state.characterTab='artifact';openScreen('character');break;case 'appearance':state.appearanceCategory='robe';state.appearanceId=APPEARANCE_STUDIES.robe[0].id;openScreen('appearance');break;case 'map':openScreen('map');break;case 'quest':openScreen('quest');break;default:openScreen('feature');}
 focusContent('[data-review-close]');}
select(IDS.skin).addEventListener('change',()=>{const value=select(IDS.skin).value;state.skin=value==='old'?'old':value==='doa-ma'?'doa-ma':'tu-dao';skin();});
select(IDS.screen).addEventListener('change',()=>{state.characterQuestReturn=undefined;state.itemSourceReturn=undefined;state.itemReturnTab=undefined;openScreen(select(IDS.screen).value as MaterialScreen);});
select(IDS.preset).addEventListener('change',()=>{state.preset=select(IDS.preset).value as MaterialPreset;preset();});
checkbox(IDS.effects).addEventListener('change',()=>{state.effects=checkbox(IDS.effects).checked;effects();});
checkbox(IDS.motion).addEventListener('change',()=>{state.reducedMotion=checkbox(IDS.motion).checked;effects();});
select(IDS.inventoryScenario).addEventListener('change',()=>{state.inventoryScenario=select(IDS.inventoryScenario).value as typeof state.inventoryScenario;state.inventoryPending=undefined;state.inventorySeq++;state.inventoryFeedback='';state.inventoryFeedbackKind='info';renderSystemHud();render();});
content.addEventListener('change',event=>{if(event.target instanceof HTMLSelectElement&&event.target.id===IDS.itemOrder){state.itemOrder=event.target.value==='name'?'name':'type';updateInventoryResults();}});
content.addEventListener('toggle',event=>{if(event.target instanceof HTMLDetailsElement&&event.target.classList.contains('dao-item-source'))state.itemSourceExpanded=event.target.open;},true);
document.getElementById(IDS.reset)!.addEventListener('click',()=>{state.preset='ready';select(IDS.preset).value='ready';preset();});
content.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
 const data=button.dataset;
 if(data.reviewWorkspace)workspace(data.reviewWorkspace);
 else if(data.reviewOpenSlot||data.reviewGearSlot){const slot=data.reviewOpenSlot??data.reviewGearSlot;if(slot!=='weapon'&&slot!=='robe'&&slot!=='charm')return;selectGearSlot(slot);state.characterTab='equipment';state.hudFeatureId='equipment';openScreen('character');focusContent(`[data-review-gear-slot="${slot}"]`);}
 else if(data.reviewGearAction==='equip'||data.reviewGearAction==='unequip')startItemAction(data.reviewGearAction);
 else if(button.hasAttribute('data-review-use'))startItemAction('use');
 else if(data.reviewLocation){state.itemLocation=data.reviewLocation as typeof state.itemLocation;state.itemDetailOpen=false;render();focusContent(`[data-review-location="${state.itemLocation}"]`);}
 else if(button.hasAttribute('data-review-return-character')){const tab=state.itemReturnTab??'overview';state.itemReturnTab=undefined;state.characterTab=tab;openScreen('character');focusContent('[data-review-workspace=character]');}
 else if(data.reviewSourceQuest){state.itemSourceExpanded=true;state.itemSourceReturn=state.screen==='character'?'equipment':'inventory';state.questId=data.reviewSourceQuest;openScreen('quest');focusContent('[data-review-source-back]');}
 else if(button.hasAttribute('data-review-source-back'))returnFromItemSource();
 else if(button.hasAttribute('data-review-character-back'))returnFromCharacterQuest();
 else if(data.reviewQuest){state.questId=data.reviewQuest;render();focusContent(`[data-review-quest="${state.questId}"]`);}
 else if(data.reviewScreen){openScreen(data.reviewScreen as MaterialScreen);if(state.screen==='hud')focusHudFeature();else focusContent(`[data-review-screen="${state.screen}"]`);}
 else if(data.reviewOpenItem){state.itemReturnTab=state.screen==='character'?state.characterTab:undefined;state.itemLocation='all';state.itemId=data.reviewOpenItem as CharacterItemId;state.itemFilter='all';state.itemSearch='';state.itemDetailOpen=true;openScreen('inventory');focusContent(matchMedia('(max-width:760px)').matches?'[data-review-item-back]':`[data-review-item="${state.itemId}"]`);}
 else if(data.reviewItem){state.itemId=data.reviewItem as CharacterItemId;state.itemDetailOpen=true;render();focusContent(matchMedia('(max-width:760px)').matches?'[data-review-item-back]':`[data-review-item="${state.itemId}"]`);}
 else if(button.hasAttribute('data-review-item-back')){state.itemDetailOpen=false;render();focusContent(`[data-review-item="${state.itemId}"]`);}
 else if(data.reviewFilter){state.itemFilter=data.reviewFilter as typeof state.itemFilter;state.itemDetailOpen=false;render();focusContent(`[data-review-filter="${state.itemFilter}"]`);}
 else if(button.hasAttribute('data-review-clear-search')){state.itemSearch='';state.itemFilter='all';state.itemLocation='all';state.itemDetailOpen=false;render();document.getElementById(IDS.search)?.focus();}
 else if(button.hasAttribute('data-review-compare')){state.itemComparison=!state.itemComparison;render();focusContent('[data-review-compare]');}
 else if(button.hasAttribute('data-review-protect'))startItemAction('protect');
 else if(data.reviewReadSkill){if(data.reviewReadSkill!=='sword'&&data.reviewReadSkill!=='thunder'&&data.reviewReadSkill!=='wind')return;state.characterSkill=data.reviewReadSkill;state.characterTab='arts';state.hudFeatureId='spells';render();focusContent('.dao-arts-list [data-review-read-skill="'+state.characterSkill+'"]');}
 else if(data.reviewCharacterTab){state.characterTab=data.reviewCharacterTab as typeof state.characterTab;state.hudFeatureId=state.characterTab==='overview'||state.characterTab==='attributes'?'character':state.characterTab==='equipment'?'equipment':state.characterTab==='cultivation'?'cultivation':state.characterTab==='arts'?'spells':'artifact';render();focusContent(`[data-review-character-tab="${state.characterTab}"]`);}
 else if(data.reviewOpenQuest){if(state.screen==='character')state.characterQuestReturn={tab:state.characterTab,questId:data.reviewOpenQuest};state.questId=data.reviewOpenQuest;openScreen('quest');focusContent(`[data-review-quest="${state.questId}"]`);}
 else if(data.reviewArtifact){state.artifactRefined=data.reviewArtifact==='refined';render();focusContent(`[data-review-artifact="${data.reviewArtifact}"]`);}
 else if(data.reviewAppearanceCategory){state.appearanceCategory=data.reviewAppearanceCategory as typeof state.appearanceCategory;state.appearanceId=APPEARANCE_STUDIES[state.appearanceCategory][0]?.id??'';render();focusContent(`[data-review-appearance-category="${state.appearanceCategory}"]`);}
 else if(data.reviewAppearance){state.appearanceId=data.reviewAppearance;render();focusContent(`[data-review-appearance="${state.appearanceId}"]`);}
 else if(data.reviewAppearancePreview){state.appearancePreviewId=data.reviewAppearancePreview;render();focusContent('[data-review-appearance-preview]');announce('Đang thử phối chất liệu. Hình nhân vật sẽ đối chiếu sau.');}
 else if(button.hasAttribute('data-review-appearance-reset')){state.appearancePreviewId='';render();focusContent('[data-review-appearance-preview]');announce('Đã bỏ bản thử chất liệu.');}
 else if(button.hasAttribute('data-review-close'))closeReview();
 else if(button.hasAttribute('data-review-guide'))announce('Điểm hướng dẫn của bài nằm trong môn phái. Đây là bản đối chiếu giao diện.');
});
root.addEventListener('click',event=>{
 const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
 if(button.dataset.hudFeature){const feature=hudFeature(button.dataset.hudFeature);if(feature)openHudFeature(feature.id);}
 else if(button.hasAttribute('data-hud-systems')){state.hudReturnScreen='hud';openScreen('systems');focusContent('[data-hud-category=all]');}
 else if(button.dataset.hudPin){const feature=hudFeature(button.dataset.hudPin);if(!feature)return;const index=state.hudPins.indexOf(feature.id);if(index>=0)state.hudPins.splice(index,1);else if(state.hudPins.length<5)state.hudPins.push(feature.id);else{announce('Đã ghim 5 chức năng. Bỏ một ghim trước khi thêm lối khác.');return;}renderSystemHud();render();focusContent(`[data-hud-pin="${feature.id}"]`);announce(index>=0?'Đã bỏ ghim '+feature.label:'Đã ghim '+feature.label+' vào HUD desktop.');}
 else if(button.dataset.hudCategory){state.hudCategory=button.dataset.hudCategory as typeof state.hudCategory;render();focusContent(`[data-hud-category="${state.hudCategory}"]`);}
 else if(button.dataset.hudCollapse){const kind=button.dataset.hudCollapse;if(kind==='quest')state.hudQuestCollapsed=!state.hudQuestCollapsed;else state.hudLogCollapsed=!state.hudLogCollapsed;renderSystemHud();systemMount.querySelector<HTMLElement>(`[data-hud-collapse="${kind}"]`)?.focus({preventScroll:true});}
});
content.addEventListener('input',event=>{if(!(event.target instanceof HTMLInputElement))return;if(event.target.id===IDS.search){state.itemSearch=event.target.value;state.itemDetailOpen=false;updateInventoryResults();}else if(event.target.id===IDS.systemSearch){state.hudSearch=event.target.value;updateHudDirectory();}});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){event.preventDefault();if(state.screen==='inventory'&&state.itemDetailOpen&&matchMedia('(max-width:760px)').matches){state.itemDetailOpen=false;render();focusContent(`[data-review-item="${state.itemId}"]`);}else closeReview();return;}
 if(event.ctrlKey||event.metaKey||event.altKey)return;
 if(event.target instanceof HTMLElement&&event.target.closest('input,select,textarea,[contenteditable=true]'))return;
 const key=event.key.toLowerCase(),shortcut:Record<string,HudFeatureId>={c:'character',i:'inventory',b:'inventory',j:'quest',m:'map',k:'spells',v:'cultivation'};const feature=shortcut[key];
 if(feature){event.preventDefault();if(event.repeat)return;if(state.hudFeatureId===feature&&!['hud','systems','icons'].includes(state.screen))closeReview();else openHudFeature(feature);return;}
 const id=R01_IDS.find(id=>SKILL_DEFINITIONS[id].shortcut===event.key);if(id&&state.screen==='hud'){event.preventDefault();bar.activate(id);}
});

document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameRequest);frameRequest=0;}else{state.now=performance.now();updateHud();schedule();}});motion.addEventListener('change',effects);
addEventListener('pagehide',event=>{cancelAnimationFrame(frameRequest);frameRequest=0;if(event.persisted)return;disposed=true;motion.removeEventListener('change',effects);bar.dispose();});
addEventListener('pageshow',()=>{if(!disposed){state.now=performance.now();updateHud();schedule();}});
if(new URLSearchParams(location.search).get('screen')==='character'){state.screen='character';state.characterTab='overview';state.hudFeatureId='character';}
select(IDS.screen).value=state.screen;skin();effects();renderSystemHud();render();preset();
void fetch(art+'/layout.json').then(async response=>{if(!response.ok)throw new Error('Chưa tải được thông số khung mới.');layouts=await response.json();if(!disposed){skin();root.dataset.assetsReady='true';}}).catch(error=>{announce(error instanceof Error?error.message:'Chưa nạp được khung mới.');root.dataset.assetsReady='false';});
if(import.meta.env.DEV)(window as Window&{__materialReview?:()=>unknown}).__materialReview=()=>({skin:state.skin,screen:state.screen,preset:state.preset,hp:state.hp,mp:state.mp,quest:state.questId,item:state.itemId,itemFilter:state.itemFilter,itemSearch:state.itemSearch,itemDetailOpen:state.itemDetailOpen,itemProtected:Object.fromEntries(reviewOwnedItems(state).map(i=>[i.definitionId,i.protected])),equipment:{...state.inventory.equipment},inventoryScenario:state.inventoryScenario,inventoryPending:!!state.inventoryPending,itemLocation:state.itemLocation,itemOrder:state.itemOrder,supplies:state.sect.supplies,inventorySeq:state.inventorySeq,inventoryLastChange:state.inventoryLastChange,characterTab:state.characterTab,characterSkill:state.characterSkill,artifactRefined:state.artifactRefined,appearanceCategory:state.appearanceCategory,appearancePreviewId:state.appearancePreviewId,hudFeature:state.hudFeatureId,hudCategory:state.hudCategory,hudFeatureCount:HUD_FEATURES.length,hudSearch:state.hudSearch,hudPins:[...state.hudPins],hudReturnScreen:state.hudReturnScreen,hudQuestCollapsed:state.hudQuestCollapsed,hudLogCollapsed:state.hudLogCollapsed,reducedMotion:state.reducedMotion||motion.matches,reservedSlots:bar.root.querySelectorAll('.hotbar-reserved').length});
