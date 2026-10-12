import './character-runtime.css';
import { attachFrameSurface } from './frame-surface';
import { ShrineMotion } from './character-preview/shrine-motion';
import { CHARACTER_INFO,type SkillId } from '../../shared/profiles';
import { CHARACTER_ITEMS,GEAR_SLOT_NAMES,type CharacterItemView,type CharacterView,type CharacterCommand,type GearSlot } from '../../shared/character-inventory';
import { cultivationMotion } from '../../shared/quest-motion';
import type {SectQuest} from '../../shared/sect-quests';
import * as sheet from './dao-character-runtime';

export type CharacterPanelTab='overview'|'inventory'|'equipment'|'cultivation'|'spells'|'attributes';
type Tab=CharacterPanelTab;
type Action=CharacterCommand['action'];
interface Actions {command:(action:Action,item:CharacterItemView)=>void;opened:()=>void;closed:()=>void;journal:(questId?:SectQuest['id'])=>void;clock:()=>number}
const {escape,itemArt:art}=sheet;

// Live presentation: no prototype fixtures, item mutation or transport here.
export class CharacterPanel {
  readonly root:HTMLDialogElement;
  private frame:HTMLElement;
  private body:HTMLElement;
  private profile:HTMLElement;
  private primary:HTMLElement;
  private detail:HTMLElement;
  private shrine:ShrineMotion;
  private view?:CharacterView;
  private online=false;
  private pending=false;
  private signature='';
  private tab:Tab='overview';
  private selectedId='';
  private query='';
  private category='all';
  private order='type';
  private location='all';
  private slot:GearSlot='weapon';
  private selectedSkill:SkillId='sword';
  private detailOpen=false;
  private inventoryScroll=0;
  private pose=false;
  private focusMemory?:string;
  private sourceOpen=new Set<string>();
  private prepared?:Promise<void>;
  private abort=new AbortController();
  constructor(private actions:Actions){
    this.root=document.createElement('dialog');this.root.id='character-dialog';this.root.className='character-runtime';this.root.setAttribute('aria-labelledby','live-character-title');
    this.root.innerHTML=`<section class="character-window van-panel" data-game-ui>
      <header class="character-heading"><div><span class="review-eyebrow">HẰNG NHẠC · LINH ĐÀI</span><h1 id="live-character-title">Nhân vật</h1></div><button type="button" class="close-character" data-close aria-label="Đóng cửa sổ nhân vật">✕</button></header>
      <nav class="character-tabs" role="tablist" aria-label="Nhân vật và hành trang">${(['overview','inventory','equipment'] as const).map((tab,n)=>`<button id="live-tab-${tab}" type="button" role="tab" data-tab="${tab}" aria-controls="live-character-content" aria-selected="${n===0}" tabindex="${n===0?0:-1}">${['Nhân vật','Hành trang','Trang bị'][n]}</button>`).join('')}</nav><nav class="dao-character-subnav" aria-label="Hồ sơ nhân vật">${(['overview','attributes','cultivation','spells'] as const).map((tab,n)=>`<button type="button" data-sheet="${tab}" aria-pressed="${n===0}">${['Tổng quan','Thuộc tính','Tu luyện','Thuật'][n]}</button>`).join('')}</nav>
      <p class="connection-notice" role="status" hidden></p><div id="live-character-content" class="character-content" role="tabpanel" aria-labelledby="live-tab-overview" tabindex="0"><aside class="profile-pane ui-reading"></aside><section class="primary-pane ui-reading"></section><aside class="detail-pane ui-reading" aria-label="Chi tiết vật phẩm"></aside></div>
      <footer class="character-footer"><p class="character-feedback" role="status" aria-live="polite">Hành trang riêng của nhân vật.</p><span>Linh Đài <i aria-hidden="true">✦</i> Hằng Nhạc</span></footer></section>`;
    document.getElementById('game-shell')!.append(this.root);
    this.frame=this.find('.character-window');this.body=this.find('.character-content');this.profile=this.find('.profile-pane');this.primary=this.find('.primary-pane');this.detail=this.find('.detail-pane');
    attachFrameSurface(this.frame);
    this.shrine=new ShrineMotion(this.frame,()=>this.view?.avatarId??'CHR-WANG-LIN-CHIBI',()=>this.profile.querySelector<HTMLCanvasElement>('.profile-sprite'));
    const signal=this.abort.signal;
    this.root.addEventListener('click',event=>this.click(event),{signal});
    this.root.addEventListener('keydown',event=>this.key(event),{signal});
    this.root.addEventListener('cancel',event=>{if(this.detailOpen){event.preventDefault();this.back();}},{signal});
    this.root.addEventListener('close',()=>{if(this.root.open)return;this.frame.hidden=true;this.shrine.refresh();this.actions.closed();},{signal});
    this.root.addEventListener('input',event=>{const target=event.target as HTMLInputElement;if(target.id==='character-item-search'){this.query=target.value;this.renderGrid();}},{signal});
    this.root.addEventListener('change',event=>{const target=event.target as HTMLSelectElement;if(target.id==='character-item-order'){this.order=target.value;this.renderGrid();}},{signal});
    this.root.addEventListener('toggle',event=>{const source=event.target;if(source instanceof HTMLDetailsElement&&source.dataset.sourceItem){if(source.open)this.sourceOpen.add(source.dataset.sourceItem);else this.sourceOpen.delete(source.dataset.sourceItem);}},{signal,capture:true});
    this.frame.hidden=true;
  }
  private find<T extends HTMLElement=HTMLElement>(selector:string):T{return this.root.querySelector<T>(selector)!;}
  get modal(){return this.root.open;}
  private get gearTab(){return this.tab==='inventory'||this.tab==='equipment';}
  private get workspace(){return this.gearTab?this.tab:'overview';}
  state(view:CharacterView|undefined,online:boolean,pending:boolean){
    this.view=view;this.online=online;this.pending=pending;
    if(this.root.open)this.update();
  }
  feedback(message:string){if(!this.abort.signal.aborted)this.find('.character-feedback').textContent=message;}
  open(tab:Tab='overview'){
    this.actions.opened();this.tab=tab;this.normalizeSelection();this.detailOpen=false;this.category='all';this.signature='';this.frame.hidden=false;
    if(!this.root.open)this.root.showModal();this.update();this.find(`[role="tab"][data-tab="${this.workspace}"]`).focus();
    void this.prepare().catch(error=>this.feedback(error instanceof Error?error.message:'Chưa nạp được hình nhân vật.'));
  }
  close(){if(this.root.open)this.root.close();}
  resumeFromJournal(){
    this.actions.opened();this.signature='';this.frame.hidden=false;
    const returnFocus=this.focusMemory;
    if(!this.root.open)this.root.showModal();this.update();
    const target=[...this.root.querySelectorAll<HTMLElement>('button,input,select,summary,[tabindex]')].find(node=>this.focusKey(node)===returnFocus&&node.getClientRects().length);
    (target??this.find(`[role="tab"][data-tab="${this.workspace}"]`)).focus({preventScroll:true});
    void this.prepare().catch(error=>this.feedback(error instanceof Error?error.message:'Chưa nạp được hình nhân vật.'));
  }
  reset(){this.close();this.view=undefined;this.signature='';this.selectedId='';this.query='';this.category='all';this.location='all';this.selectedSkill='sword';this.slot='weapon';this.detailOpen=false;this.pose=false;this.sourceOpen.clear();this.focusMemory=undefined;this.feedback('Hành trang riêng của nhân vật.');}
  update(){
    if(!this.root.open)return;
    const v=this.view,reduced=document.getElementById('game-shell')!.dataset.motion==='reduce';
    this.root.dataset.motion=reduced?'reduce':'full';this.shrine.setReduced(reduced);
    const signature=JSON.stringify(v?[v.profileId,v.avatarId,v.name,Math.floor(v.hp),Math.floor(v.mp),v.maxHp,v.maxMp,v.skills,v.items,v.equipment,v.sect,this.online,this.pending,this.tab,this.selectedSkill,this.slot]:['loading',this.online,this.tab]);
    if(signature!==this.signature){this.signature=signature;this.render();}
    this.updateUseState();
  }
  private render(){
    const focus=document.activeElement instanceof HTMLElement&&this.root.contains(document.activeElement)?document.activeElement:undefined;
    const focusKey=this.focusKey(focus)||this.focusMemory;
    if(focusKey)this.focusMemory=focusKey;
    const selection=focus instanceof HTMLInputElement?[focus.selectionStart,focus.selectionEnd]:undefined;
    const scrolls=[this.body.scrollTop,this.profile.scrollTop,this.primary.scrollTop,this.detail.scrollTop,this.detail.querySelector('.detail-copy')?.scrollTop??0];
    this.frame.dataset.tab=this.tab;this.body.setAttribute('aria-labelledby',`live-tab-${this.workspace}`);this.body.classList.toggle('detail-open',this.detailOpen);
    this.root.querySelectorAll<HTMLButtonElement>('[role="tab"][data-tab]').forEach(button=>{const selected=button.dataset.tab===this.workspace;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    this.find('.dao-character-subnav').hidden=this.gearTab;
    this.detail.setAttribute('aria-label',this.gearTab?'Chi tiết vật phẩm':this.tab==='spells'?'Chi tiết thuật':this.tab==='cultivation'?'Hành trình nhập môn':'Bộ đang vận dụng');
    this.root.querySelectorAll<HTMLButtonElement>('.dao-character-subnav [data-sheet]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sheet===this.tab)));
    const notice=this.find('.connection-notice');notice.hidden=this.online;notice.textContent=this.view?'Đang kết nối lại · thao tác tạm dừng, chờ đồng bộ hành trang.':'Đang đọc hồ sơ nhân vật…';
    if(!this.view){this.profile.innerHTML='';this.primary.innerHTML='<p>Đang đồng bộ hồ sơ và hành trang…</p>';this.detail.innerHTML='';this.shrine.setState(false,false);return;}
    const v=this.view;
    this.find('.character-heading .review-eyebrow').textContent=`HẰNG NHẠC · ${v.name}`;
    this.frame.dataset.avatar=v.avatarId;
    this.profile.innerHTML=sheet.identity(v,this.pose);
    if(this.gearTab)this.inventory();else this.overview();
    this.shrine.setState(this.pose||cultivationMotion(v.sect,false),this.online&&this.profile.getClientRects().length>0);
    [this.body,this.profile,this.primary,this.detail].forEach((node,n)=>node.scrollTop=scrolls[n]);const copy=this.detail.querySelector('.detail-copy');if(copy)copy.scrollTop=scrolls[4];
    if(focusKey){const replacement=[...this.root.querySelectorAll<HTMLElement>('button,input,select,summary,[tabindex]')].find(node=>this.focusKey(node)===focusKey&&node.getClientRects().length);replacement?.focus({preventScroll:true});if(replacement instanceof HTMLInputElement&&selection&&selection[0]!==null&&selection[1]!==null)replacement.setSelectionRange(selection[0],selection[1]);if(!replacement&&this.gearTab){this.focusMemory='id:character-item-search';this.find('#character-item-search').focus({preventScroll:true});}}
  }
  private focusKey(node:HTMLElement|undefined){if(!node)return;if(node.id)return `id:${node.id}`;for(const name of ['item','action','sheet','readSkill','slot','quest','category','location','sourceSummary'] as const){if(node.dataset[name])return `${name}:${node.dataset[name]}`;}return;}
  private normalizeSelection(){if(this.tab!=='equipment'||!this.view)return;const selected=this.view.items.find(item=>item.id===this.selectedId),slot=selected&&CHARACTER_ITEMS[selected.definitionId].slot;if(slot)this.slot=slot;else this.selectedId=(sheet.equipped(this.view,this.slot)??this.view.items.find(item=>CHARACTER_ITEMS[item.definitionId].slot===this.slot))?.id??'';}
  private overview(){
    const v=this.view!;
    this.primary.classList.toggle('dao-paper',this.tab!=='spells');
    this.detail.classList.add('overview-note');
    this.detail.classList.toggle('dao-paper',this.tab==='spells'||this.tab==='attributes');
    if(this.tab==='cultivation'){this.primary.innerHTML=sheet.cultivation(v);this.detail.innerHTML=sheet.journey(v);}
    else if(this.tab==='spells'){if(!v.skills.includes(this.selectedSkill)&&v.skills[0])this.selectedSkill=v.skills[0];this.primary.innerHTML=sheet.artsList(v,this.selectedSkill);this.detail.innerHTML=sheet.artsReader(v,this.selectedSkill);}
    else if(this.tab==='attributes'){this.primary.innerHTML=sheet.attributes(v);this.detail.innerHTML=sheet.sources(v);}
    else{this.primary.innerHTML=`${sheet.realm(v)}${sheet.accumulation(v)}${sheet.resources(v)}<button class="text-action" type="button" data-sheet="attributes">Xem thuộc tính và nguồn sức mạnh →</button>${sheet.nextLesson(v)}`;this.detail.innerHTML=sheet.activeBuild(v);}
  }
  private inventory(){
    const v=this.view!;this.detail.classList.remove('overview-note');this.primary.classList.remove('dao-paper');this.detail.classList.add('dao-paper');
    if(!v.items.some(item=>item.id===this.selectedId))this.selectedId='';
    this.primary.innerHTML=`<header class="pane-heading"><div><span class="pane-eyebrow">${this.tab==='equipment'?'CHUẨN BỊ ĐẤU PHÁP':'VẬT PHẨM MANG THEO'}</span><h2>${this.tab==='equipment'?'Trang bị':'Hành trang'}</h2></div><span class="small-seal" data-count></span></header>
      ${this.tab==='equipment'?`<div class="equipment-slots" aria-label="Vị trí trang bị">${Object.entries(GEAR_SLOT_NAMES).map(([slot,name])=>{const item=sheet.equipped(v,slot as GearSlot);return `<button class="equip-slot" type="button" data-slot="${slot}" aria-pressed="${this.slot===slot}"><i>${item?art(item):'<span>◇</span>'}</i><span><small>${name}</small><b>${item?CHARACTER_ITEMS[item.definitionId].name:'Chưa mang'}</b></span></button>`;}).join('')}</div><p class="inventory-hint">${GEAR_SLOT_NAMES[this.slot]} · các món phù hợp trong hành trang</p>`:''}
      <div class="inventory-tools"><label class="search-field"><span class="sr-only">Tìm vật phẩm</span><span aria-hidden="true">⌕</span><input id="character-item-search" type="search" placeholder="Tìm vật phẩm…" autocomplete="off" value="${escape(this.query)}"></label><label><span class="sr-only">Sắp xếp</span><select id="character-item-order"><option value="type">Theo loại</option><option value="name">Theo tên</option></select></label></div>
      <div class="inventory-filters" role="group" aria-label="Lọc vật phẩm"><button type="button" data-category="all">Tất cả</button><button type="button" data-category="gear">Trang bị</button>${this.tab==='inventory'?'<button type="button" data-category="consumable">Vật tư</button>':''}</div><div class="dao-bag-locations" role="group" aria-label="Vị trí vật phẩm"><button type="button" data-location="all">Tất cả</button><button type="button" data-location="bag">Trong túi</button><button type="button" data-location="equipped">Đang mang</button></div><div class="item-grid" role="list" aria-label="Vật phẩm"></div><div class="empty-inventory" hidden></div><p class="inventory-hint">Mỗi món có một bản sở hữu · chọn để đọc công dụng và nguồn nhận.</p>`;
    this.find<HTMLSelectElement>('#character-item-order').value=this.order;this.renderGrid();this.renderDetail();
  }
  private renderGrid(){
    if(!this.gearTab||!this.view)return;
    const items=this.view.items.filter(item=>{const d=CHARACTER_ITEMS[item.definitionId];return (this.tab!=='equipment'||d.slot===this.slot)&&(this.category==='all'||d.kind===this.category)&&(this.location==='all'||(this.location==='equipped'?item.equipped:!item.equipped))&&sheet.folded(d.name).includes(sheet.folded(this.query));});
    items.sort((a,b)=>this.order==='name'?CHARACTER_ITEMS[a.definitionId].name.localeCompare(CHARACTER_ITEMS[b.definitionId].name,'vi'):a.definitionId.localeCompare(b.definitionId));
    this.find('[data-count]').textContent=`${items.length} món`;
    this.primary.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String((button as HTMLElement).dataset.category===this.category)));
    this.primary.querySelectorAll('[data-location]').forEach(button=>button.setAttribute('aria-pressed',String((button as HTMLElement).dataset.location===this.location)));
    this.find('.item-grid').innerHTML=items.map(item=>`<div role="listitem"><button type="button" class="item-cell" data-item="${item.id}" data-kind="${CHARACTER_ITEMS[item.definitionId].kind}" aria-pressed="${item.id===this.selectedId}" aria-label="${CHARACTER_ITEMS[item.definitionId].name}, số lượng ${item.quantity}${item.equipped?', đang dùng':''}${item.protected?', bảo vệ':''}" title="${CHARACTER_ITEMS[item.definitionId].name}"><i>${art(item)}</i><b>${CHARACTER_ITEMS[item.definitionId].name}</b><small>${item.equipped?'Đang mang':'Trong túi'}${item.quantity>1?` · ${item.quantity} phần`:''}</small>${item.equipped?'<span class="item-equipped" aria-hidden="true">✓</span>':''}${item.protected?'<span class="item-protected" aria-hidden="true">◆</span>':''}</button></div>`).join('');
    const empty=this.find('.empty-inventory');empty.hidden=items.length>0;empty.innerHTML=this.tab==='equipment'&&this.slot==='charm'?'<span aria-hidden="true">◇</span><h3>Chưa có ngọc sức / pháp bảo</h3><p>Hành trang hiện tại chưa có món cho vị trí này.</p>':'<span aria-hidden="true">⌕</span><h3>Không tìm thấy vật phẩm</h3><p>Thử tên khác hoặc bỏ bộ lọc.</p><button class="game-button" data-action="clear-filter" type="button">Bỏ bộ lọc</button>';
  }
  private renderDetail(){
    const item=this.view!.items.find(item=>item.id===this.selectedId);
    if(!item){this.detailOpen=false;this.body.classList.remove('detail-open');this.detail.innerHTML='<div class="detail-placeholder"><span aria-hidden="true">◇</span><h2>Chọn một vật phẩm</h2><p>Mô tả và tác dụng sẽ xuất hiện tại đây.</p></div>';return;}
    const d=CHARACTER_ITEMS[item.definitionId],v=this.view!,current=d.slot?v.items.find(other=>other.id===v.equipment[d.slot!]):undefined;
    this.detail.innerHTML=`<button class="detail-back text-action" type="button" data-action="back">← Quay lại hành trang</button><div class="detail-title"><i>${art(item)}</i><div><span class="pane-eyebrow">${d.kind==='gear'?'Trang bị':'Vật tư'}${item.equipped?' · Đang dùng':''}</span><h2 id="live-item-title" tabindex="-1">${d.name}</h2></div></div><div class="detail-copy"><section class="ui-copy-section"><h3 class="ui-section-title">Tác dụng</h3><p class="item-effect">${d.effect}</p>${d.kind==='consumable'?`<p class="quantity-copy">Số lượng: <b>${item.quantity}</b></p>`:''}</section>
      ${d.slot?`<section class="ui-copy-section comparison"><h3 class="ui-section-title">${item.equipped?'Khi tháo về túi':'So với món đang dùng'}</h3><div><span>${item.equipped?'Đang mang':'Đang dùng'}</span><b>${current?CHARACTER_ITEMS[current.definitionId].name:'Chưa trang bị'}</b></div><div><span>${item.equipped?'Sau khi tháo':'Món được chọn'}</span><b>${item.equipped?'Vị trí để trống':d.name}</b></div><p>Sinh lực tối đa: ${v.maxHp} → ${v.maxHp}<br>Linh lực tối đa: ${v.maxMp} → ${v.maxMp}</p></section>`:''}<section class="ui-copy-section"><h3 class="ui-section-title">Mô tả</h3><p>${d.description}</p></section><details class="dao-item-source" data-source-item="${item.id}" ${this.sourceOpen.has(item.id)?'open':''}><summary data-source-summary="${item.id}">Nguồn nhận · ${d.kind==='gear'?'Đồ nhập môn':'HN01'}</summary><p>${d.kind==='gear'?'Đồ nhập môn của nhân vật.':'Nhận từ người tiếp dẫn trong bài HN01.'}</p>${d.kind==='consumable'?'<button class="text-action" data-quest="HN01" type="button">Xem bài HN01 →</button>':''}</details></div>
      <div class="detail-actions"><button type="button" class="game-button primary" data-action="${d.kind==='consumable'?'use':item.equipped?'unequip':'equip'}" ${!this.online||this.pending?'disabled':''}>${this.pending?'Đang xử lý…':d.kind==='consumable'?'Dùng 1':item.equipped?'Tháo trang bị':'Trang bị'}</button><button class="protect-button" type="button" data-action="protect" aria-pressed="${item.protected}" ${!this.online||this.pending?'disabled':''}>${item.protected?'◆ Đã bảo vệ':'◇ Bảo vệ'}</button><small class="item-condition"></small></div>`;
    this.updateUseState();
  }
  private updateUseState(){
    if(!this.gearTab||!this.view)return;
    const item=this.view.items.find(item=>item.id===this.selectedId);if(!item)return;
    const condition=!this.online?'Chờ kết nối và đồng bộ hành trang.':this.pending?'Đang chờ máy chủ xác nhận.':this.view.hp<=0?'Nhân vật chưa sẵn sàng.':this.view.sect.practising||this.view.sect.lessons.active!=='none'?'Chờ kết thúc luyện thuật trước khi dùng hoặc thay đồ.':item.definitionId==='recovery'&&this.view.hp>=this.view.maxHp?'Sinh lực đã đầy · giữ lại vật tư.':item.definitionId==='recovery'&&this.view.sect.nextRecoveryAt>this.actions.clock()?`Vật tư đang hồi · ${Math.ceil((this.view.sect.nextRecoveryAt-this.actions.clock())/1000)} giây`:'';
    this.find('.item-condition').textContent=condition;this.find<HTMLButtonElement>('.detail-actions .primary').disabled=!!condition;
    this.find<HTMLButtonElement>('[data-action="protect"]').disabled=!this.online||this.pending;
  }
  private click(event:Event){
    const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
    if(button.hasAttribute('data-close')){this.close();return;}
    if(button.dataset.tab){this.changeTab(button.dataset.tab as Tab);return;}
    if(button.dataset.sheet){this.changeTab(button.dataset.sheet as Tab);return;}
    if(button.dataset.readSkill){this.selectedSkill=button.dataset.readSkill as SkillId;this.changeTab('spells');this.root.querySelector<HTMLButtonElement>(`[data-read-skill="${this.selectedSkill}"]`)?.focus({preventScroll:true});return;}
    if(button.dataset.quest){this.focusMemory=this.focusKey(button);this.close();this.actions.journal(button.dataset.quest as SectQuest['id']);return;}
    if(button.dataset.slot){this.slot=button.dataset.slot as GearSlot;const current=this.view&&sheet.equipped(this.view,this.slot),candidate=this.view?.items.find(item=>CHARACTER_ITEMS[item.definitionId].slot===this.slot);this.selectedId=(current??candidate)?.id??'';this.location='all';this.changeTab('equipment');return;}
    if(button.dataset.category){this.category=button.dataset.category;this.renderGrid();return;}
    if(button.dataset.location){this.location=button.dataset.location;this.renderGrid();return;}
    if(button.dataset.item){this.inventoryScroll=this.body.scrollTop;this.selectedId=button.dataset.item;this.detailOpen=matchMedia('(max-width:759px)').matches;if(!this.gearTab)this.tab='equipment';this.signature='';this.update();if(this.detailOpen){this.body.scrollTop=0;this.find('#live-item-title').focus({preventScroll:true});}return;}
    switch(button.dataset.action){
      case 'inventory':case 'equipment':this.changeTab(button.dataset.action);break;
      case 'back':this.back();break;
      case 'clear-filter':this.query='';this.category='all';this.location='all';this.find<HTMLInputElement>('#character-item-search').value='';this.renderGrid();this.find('#character-item-search').focus();break;
      case 'pose':this.pose=!this.pose;this.shrine.setState(this.pose||!!this.view&&cultivationMotion(this.view.sect,false),this.online);button.textContent=this.pose?'Xem tĩnh':'Xem vận khí';button.setAttribute('aria-pressed',String(this.pose));this.feedback('Tư thế xem hồ sơ; thổ nạp thực hiện tại người hướng dẫn vận khí.');break;
      case 'journal':this.focusMemory=this.focusKey(button);this.close();this.actions.journal();break;
      case 'equip':case 'unequip':case 'use':case 'protect':{const item=this.view?.items.find(item=>item.id===this.selectedId);if(item)this.actions.command(button.dataset.action,item);break;}
    }
  }
  private changeTab(tab:Tab){this.tab=tab;this.normalizeSelection();this.detailOpen=false;this.category='all';this.signature='';this.body.scrollTop=0;this.update();}
  private back(){this.detailOpen=false;this.body.classList.remove('detail-open');this.body.scrollTop=this.inventoryScroll;(this.primary.querySelector<HTMLButtonElement>(`[data-item="${this.selectedId}"]`)??this.find('#character-item-search')).focus();}
  private key(event:KeyboardEvent){
    if((event.target as HTMLElement).closest('[role="tab"]')){const tabs:Tab[]=['overview','inventory','equipment'],n=tabs.indexOf(this.workspace),next=event.key==='ArrowRight'?tabs[(n+1)%3]:event.key==='ArrowLeft'?tabs[(n+2)%3]:event.key==='Home'?tabs[0]:event.key==='End'?tabs[2]:undefined;if(next){event.preventDefault();this.changeTab(next);this.find(`[role="tab"][data-tab="${next}"]`).focus();}}
    const cell=(event.target as HTMLElement).closest<HTMLButtonElement>('.item-cell');
    if(cell&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){const cells=[...this.primary.querySelectorAll<HTMLButtonElement>('.item-cell')],n=cells.indexOf(cell),columns=getComputedStyle(this.find('.item-grid')).gridTemplateColumns.split(' ').length,step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:event.key==='ArrowDown'?columns:-columns;event.preventDefault();cells[Math.max(0,Math.min(cells.length-1,n+step))].focus();}
    if(event.code==='KeyC'&&!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!(event.target as HTMLElement).closest('input,select,textarea')){event.preventDefault();this.close();}
    // Prevent hotkeys/movement from bubbling into the live world; native modal
    // remains responsible for Escape, Tab focus and backdrop interaction.
    event.stopPropagation();
  }
  private async prepare(){
    if(this.prepared)return this.prepared;
    this.prepared=(async()=>{
      const load=async(url:string)=>{const image=new Image();image.src=url;await image.decode();return image;};
      const catalog=await fetch('/assets/catalog.json',{signal:this.abort.signal}).then(r=>r.json());
      const motions=await fetch('/assets/quest-motion/clips.json',{signal:this.abort.signal}).then(r=>r.json());
      await Promise.all(Object.keys(CHARACTER_INFO).map(async id=>{
        const actor=catalog.actors.find((actor:{id:string})=>actor.id===id),metadata=await fetch(actor.metadataUrl,{signal:this.abort.signal}).then(r=>r.json());
        const frame=metadata.frames[metadata.animations.stand_south[0]].frame,clip=motions.clips[motions.bindings[id].cultivation];
        if(frame.w!==64||frame.h!==96||clip.frameSize[0]!==96||clip.frameSize[1]!==96)throw new Error('Sai cỡ sprite hồ sơ.');
        this.shrine.standing.set(id as CharacterView['avatarId'],{image:await load(actor.atlasUrl),frame});
        this.shrine.cultivation.set(id as CharacterView['avatarId'],{image:await load(clip.atlasUrl),frames:clip.frames,fps:clip.fps});
      }));
      this.shrine.refresh();
    })();
    try{await this.prepared;}catch(error){this.prepared=undefined;throw error;}
  }
  diagnostics(){return {view:this.view,modal:this.modal,tab:this.tab,selectedId:this.selectedId,online:this.online,pending:this.pending,shrine:this.shrine.snapshot};}
  dispose(){this.shrine.dispose();this.abort.abort();this.root.remove();}
}
