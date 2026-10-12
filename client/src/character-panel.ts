import './character-preview/preview.css';
import './character-preview/atmosphere.css';
import './character-runtime.css';
import { attachFrameSurface } from './frame-surface';
import { ShrineMotion } from './character-preview/shrine-motion';
import { CHARACTER_INFO } from '../../shared/profiles';
import { CHARACTER_ITEMS,GEAR_SLOT_NAMES,type CharacterItemView,type CharacterView,type CharacterCommand,type GearSlot } from '../../shared/character-inventory';
import { progressionLabel,LEVEL_THRESHOLDS,CULTIVATION_GATE } from '../../shared/sect';
import { cultivationMotion } from '../../shared/quest-motion';
import { sectQuests,currentSectQuest,QUEST_STATUS_LABELS } from '../../shared/sect-quests';
import { SKILL_DEFINITIONS } from '../../shared/skills/definitions';

type Tab='overview'|'inventory'|'equipment';
type Action=CharacterCommand['action'];
interface Actions {command:(action:Action,item:CharacterItemView)=>void;opened:()=>void;closed:()=>void;journal:()=>void;clock:()=>number}
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const art=(item:CharacterItemView)=>`<img class="painted-item-icon" src="/assets/character-ui-v2/${CHARACTER_ITEMS[item.definitionId].art}.webp" width="128" height="128" alt="">`;

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
  private detailOpen=false;
  private inventoryScroll=0;
  private pose=false;
  private focusMemory?:string;
  private prepared?:Promise<void>;
  private abort=new AbortController();
  constructor(private actions:Actions){
    this.root=document.createElement('dialog');this.root.id='character-dialog';this.root.className='character-review character-runtime';this.root.setAttribute('aria-labelledby','live-character-title');
    this.root.innerHTML=`<section class="character-window van-panel" data-game-ui>
      <header class="character-heading"><div><span class="review-eyebrow">HẰNG NHẠC · LINH ĐÀI</span><h1 id="live-character-title">Nhân vật</h1></div><button type="button" class="close-character" data-close aria-label="Đóng cửa sổ nhân vật">✕</button></header>
      <nav class="character-tabs" role="tablist" aria-label="Nhân vật và hành trang">${(['overview','inventory','equipment'] as const).map((tab,n)=>`<button id="live-tab-${tab}" type="button" role="tab" data-tab="${tab}" aria-controls="live-character-content" aria-selected="${n===0}" tabindex="${n===0?0:-1}">${['Tổng quan','Hành trang','Trang bị'][n]}</button>`).join('')}</nav>
      <p class="connection-notice" role="status" hidden></p><div id="live-character-content" class="character-content" role="tabpanel" aria-labelledby="live-tab-overview" tabindex="0"><aside class="profile-pane ui-reading"></aside><section class="primary-pane ui-reading"></section><aside class="detail-pane ui-reading" aria-label="Chi tiết vật phẩm"></aside></div>
      <footer class="character-footer"><p class="character-feedback" role="status" aria-live="polite">Hành trang riêng của nhân vật.</p><span>Vân Ngọc <i aria-hidden="true">✦</i> Linh Đài</span></footer></section>`;
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
    this.frame.hidden=true;
  }
  private find<T extends HTMLElement=HTMLElement>(selector:string):T{return this.root.querySelector<T>(selector)!;}
  get modal(){return this.root.open;}
  state(view:CharacterView|undefined,online:boolean,pending:boolean){
    this.view=view;this.online=online;this.pending=pending;
    if(this.root.open)this.update();
  }
  feedback(message:string){if(!this.abort.signal.aborted)this.find('.character-feedback').textContent=message;}
  open(tab:Tab='overview'){
    this.actions.opened();this.tab=tab;this.detailOpen=false;this.category='all';this.signature='';this.frame.hidden=false;
    if(!this.root.open)this.root.showModal();this.update();this.find(`[role="tab"][data-tab="${tab}"]`).focus();
    void this.prepare().catch(error=>this.feedback(error instanceof Error?error.message:'Chưa nạp được hình nhân vật.'));
  }
  close(){if(this.root.open)this.root.close();}
  reset(){this.close();this.view=undefined;this.signature='';this.selectedId='';this.query='';this.category='all';this.detailOpen=false;this.pose=false;this.focusMemory=undefined;this.feedback('Hành trang riêng của nhân vật.');}
  update(){
    if(!this.root.open)return;
    const v=this.view,reduced=document.getElementById('game-shell')!.dataset.motion==='reduce';
    this.root.dataset.motion=reduced?'reduce':'full';this.shrine.setReduced(reduced);
    const signature=JSON.stringify(v?[v.profileId,v.avatarId,v.name,Math.floor(v.hp),Math.floor(v.mp),v.items,v.equipment,v.sect.hn01,v.sect.hn02,v.sect.level,v.sect.cultivation,v.sect.lessons,v.sect.activityStatus,v.sect.cycleStatus,this.online,this.pending,this.tab]:['loading',this.online]);
    if(signature!==this.signature){this.signature=signature;this.render();}
    this.updateUseState();
  }
  private render(){
    const focus=document.activeElement instanceof HTMLElement&&this.root.contains(document.activeElement)?document.activeElement:undefined;
    const focusKey=focus?.id||focus?.getAttribute('data-item')||focus?.getAttribute('data-action')||this.focusMemory;
    if(focusKey)this.focusMemory=focusKey;
    const selection=focus instanceof HTMLInputElement?[focus.selectionStart,focus.selectionEnd]:undefined;
    const scrolls=[this.body.scrollTop,this.profile.scrollTop,this.primary.scrollTop,this.detail.scrollTop,this.detail.querySelector('.detail-copy')?.scrollTop??0];
    this.frame.dataset.tab=this.tab;this.body.setAttribute('aria-labelledby',`live-tab-${this.tab}`);this.body.classList.toggle('detail-open',this.detailOpen);
    this.root.querySelectorAll<HTMLButtonElement>('[role="tab"][data-tab]').forEach(button=>{const selected=button.dataset.tab===this.tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    const notice=this.find('.connection-notice');notice.hidden=this.online;notice.textContent=this.view?'Đang kết nối lại · thao tác tạm dừng, chờ đồng bộ hành trang.':'Đang đọc hồ sơ nhân vật…';
    if(!this.view){this.profile.innerHTML='';this.primary.innerHTML='<p>Đang đồng bộ hồ sơ và hành trang…</p>';this.detail.innerHTML='';this.shrine.setState(false,false);return;}
    const v=this.view,info=CHARACTER_INFO[v.avatarId],next=LEVEL_THRESHOLDS[v.sect.level+1]??CULTIVATION_GATE;
    this.find('.character-heading .review-eyebrow').textContent=`HẰNG NHẠC · ${v.name}`;
    this.frame.dataset.avatar=v.avatarId;
    this.profile.innerHTML=`<div class="profile-name"><div><span class="pane-eyebrow">${info.progressionKind==='recovery'?'LINH THỂ · HỒI PHỤC':'HẰNG NHẠC · NHẬP MÔN'}</span><h2>${escape(info.name)}</h2></div><span class="identity-seal">${info.progressionKind==='recovery'?'Linh<br>thể':'Tu<br>sĩ'}</span></div><p class="profile-stage">${escape(progressionLabel(v.avatarId,v.sect.level))}</p>
      <div class="sprite-shrine"><img class="shrine-art" src="/assets/character-ui-v2/shrine-v2.webp" alt="" aria-hidden="true"><div class="shrine-halo" aria-hidden="true"></div><div class="qi-mist" aria-hidden="true"></div><canvas class="profile-sprite" width="192" height="192" aria-label="${escape(info.name)}"></canvas><span class="shrine-sparks" aria-hidden="true"></span><button class="pose-toggle" type="button" data-action="pose" aria-pressed="${this.pose}">${this.pose?'Xem tĩnh':'Xem vận khí'}</button></div>
      <dl class="profile-resources"><div><dt>Sinh lực</dt><dd>${Math.floor(v.hp)}<small> / ${v.maxHp}</small></dd><span class="resource-line hp" style="--fill:${v.hp}%" aria-hidden="true"></span></div><div><dt>Linh lực</dt><dd>${Math.floor(v.mp)}<small> / ${v.maxMp}</small></dd><span class="resource-line mp" style="--fill:${v.mp}%" aria-hidden="true"></span></div></dl>
      <section class="profile-progress"><div><h3>${info.progressionKind==='recovery'?'Tích lũy hồi phục':'Tu vi tích lũy'}</h3><p><b>${v.sect.cultivation}</b> / ${next}</p></div><div class="cultivation-line" role="progressbar" aria-label="Tiến trình tích lũy" aria-valuenow="${Math.min(v.sect.cultivation,next)}" aria-valuemin="0" aria-valuemax="${next}"><span style="width:${Math.min(100,v.sect.cultivation/next*100)}%"></span></div></section>`;
    if(this.tab==='overview')this.overview();else this.inventory();
    this.shrine.setState(this.pose||cultivationMotion(v.sect,false),this.online);
    [this.body,this.profile,this.primary,this.detail].forEach((node,n)=>node.scrollTop=scrolls[n]);const copy=this.detail.querySelector('.detail-copy');if(copy)copy.scrollTop=scrolls[4];
    if(focusKey){const replacement=[...this.root.querySelectorAll<HTMLElement>('[id],[data-item],[data-action]')].find(node=>node.id===focusKey||node.dataset.item===focusKey||node.dataset.action===focusKey);replacement?.focus({preventScroll:true});if(replacement instanceof HTMLInputElement&&selection&&selection[0]!==null&&selection[1]!==null)replacement.setSelectionRange(selection[0],selection[1]);if(!replacement&&this.tab!=='overview'){this.focusMemory='character-item-search';this.find('#character-item-search').focus({preventScroll:true});}}
  }
  private overview(){
    const v=this.view!,recovery=CHARACTER_INFO[v.avatarId].progressionKind==='recovery',quests=sectQuests(v.sect),current=currentSectQuest(quests),next=LEVEL_THRESHOLDS[v.sect.level+1]??CULTIVATION_GATE;
    this.primary.innerHTML=`<header class="pane-heading"><div><span class="pane-eyebrow">ĐẠO LỘ NHẬP MÔN</span><h2>${recovery?'Khôi phục hiện diện':'Dưỡng khí · luyện thuật'}</h2></div><span class="small-seal">${quests.filter(q=>q.status==='completed').length}/4 bài</span></header>
      <section class="cultivation-card"><div class="realm-medallion" aria-hidden="true"><span>${recovery?'Hiện<br>diện':v.sect.level?'Ngưng<br>Khí':'Nhập<br>môn'}</span><small>${v.sect.level?`MỐC ${v.sect.level}`:'HẰNG NHẠC'}</small></div><div><span class="pane-eyebrow">${recovery?'TÍCH LŨY HỒI PHỤC':'TU VI TÍCH LŨY'}</span><p class="cultivation-value"><b>${v.sect.cultivation}</b><span> / ${next}</span></p><p>${v.sect.activityStatus==='running'?'Đang tích lũy online.':v.sect.activityStatus==='gate'?'Đã tới cổng nền; xem điều kiện hành trình.':'Chuẩn bị nền tảng và vận dụng thuật pháp.'}</p></div></section>
      <section class="overview-section"><div class="section-label"><h3>Hành trình tại Hằng Nhạc</h3><button class="text-action" type="button" data-action="journal">Sổ nhiệm vụ ↗</button></div><ol class="dao-milestones">${quests.slice(0,3).map(q=>`<li data-state="${q.status==='completed'?'complete':q.id===current.id?'current':'locked'}"><i aria-hidden="true">${q.status==='completed'?'✓':q.id===current.id?'✦':'◇'}</i><b>${q.id==='HN01'?'Nhập môn':q.id==='HN02'?recovery?'Hồi phục':'Vận khí':'Luyện thuật'}</b><span>${QUEST_STATUS_LABELS[q.status]}</span></li>`).join('')}</ol><p class="current-quest">${current.id} · ${escape(current.title)}</p></section>
      <section class="overview-section"><div class="section-label"><h3>Thuật pháp</h3><span class="quiet-copy">Có từ đầu</span></div><div class="overview-skills">${v.skills.map((id,n)=>`<div><i class="skill-study-icon" style="background-position:${n*50}% 50%" aria-hidden="true"></i><span><b>${SKILL_DEFINITIONS[id].name}</b><small>R01 · ${SKILL_DEFINITIONS[id].cost} MP</small></span></div>`).join('')}</div></section>`;
    this.detail.classList.add('overview-note');this.detail.innerHTML=`<span class="pane-eyebrow">HÀNH TRANG · CHUẨN BỊ</span><h2>Mang theo điều cần thiết</h2><div class="equipment-list live-overview-gear">${v.items.filter(item=>item.equipped).map(item=>`<button class="equipment-entry" type="button" data-item="${item.id}"><i>${art(item)}</i><span><small>${GEAR_SLOT_NAMES[CHARACTER_ITEMS[item.definitionId].slot!]}</small><b>${CHARACTER_ITEMS[item.definitionId].name}</b></span><span aria-hidden="true">›</span></button>`).join('')||'<p>Chưa trang bị món nào.</p>'}</div><p class="live-supplies">Vật tư hồi phục: <b>${v.sect.supplies}</b></p><p class="quiet-copy">Pháp bảo chưa có trong hành trang.</p><button class="game-button" type="button" data-action="inventory">Mở hành trang</button><button class="text-action artifact-bag" type="button" data-action="equipment">Xem trang bị →</button>`;
  }
  private inventory(){
    const v=this.view!;this.detail.classList.remove('overview-note');
    if(!v.items.some(item=>item.id===this.selectedId))this.selectedId='';
    this.primary.innerHTML=`<header class="pane-heading"><div><span class="pane-eyebrow">${this.tab==='equipment'?'CHUẨN BỊ ĐẤU PHÁP':'VẬT PHẨM MANG THEO'}</span><h2>${this.tab==='equipment'?'Trang bị':'Hành trang'}</h2></div><span class="small-seal" data-count></span></header>
      ${this.tab==='equipment'?`<div class="equipment-slots" aria-label="Vị trí trang bị">${Object.entries(GEAR_SLOT_NAMES).map(([slot,name])=>{const item=v.items.find(item=>item.id===v.equipment[slot as GearSlot]);return `<button class="equip-slot" type="button" ${item?`data-item="${item.id}"`:'data-category="gear"'}><i>${item?art(item):'<span>◇</span>'}</i><span>${name}</span></button>`;}).join('')}</div>`:''}
      <div class="inventory-tools"><label class="search-field"><span class="sr-only">Tìm vật phẩm</span><span aria-hidden="true">⌕</span><input id="character-item-search" type="search" placeholder="Tìm vật phẩm…" autocomplete="off" value="${escape(this.query)}"></label><label><span class="sr-only">Sắp xếp</span><select id="character-item-order"><option value="type">Theo loại</option><option value="name">Theo tên</option></select></label></div>
      <div class="inventory-filters" role="group" aria-label="Lọc vật phẩm"><button type="button" data-category="all">Tất cả</button><button type="button" data-category="gear">Trang bị</button>${this.tab==='inventory'?'<button type="button" data-category="consumable">Vật tư</button>':''}</div><div class="item-grid" role="list" aria-label="Vật phẩm"></div><div class="empty-inventory" hidden></div><p class="inventory-hint">Chọn một món để xem tác dụng và điều kiện.</p>`;
    this.find<HTMLSelectElement>('#character-item-order').value=this.order;this.renderGrid();this.renderDetail();
  }
  private renderGrid(){
    if(this.tab==='overview'||!this.view)return;
    const items=this.view.items.filter(item=>{const d=CHARACTER_ITEMS[item.definitionId];return (this.tab!=='equipment'||d.kind==='gear')&&(this.category==='all'||d.kind===this.category)&&d.name.toLocaleLowerCase('vi').includes(this.query.trim().toLocaleLowerCase('vi'));});
    items.sort((a,b)=>this.order==='name'?CHARACTER_ITEMS[a.definitionId].name.localeCompare(CHARACTER_ITEMS[b.definitionId].name,'vi'):a.definitionId.localeCompare(b.definitionId));
    this.find('[data-count]').textContent=`${items.length} món`;
    this.primary.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String((button as HTMLElement).dataset.category===this.category)));
    this.find('.item-grid').innerHTML=items.map(item=>`<div role="listitem"><button type="button" class="item-cell" data-item="${item.id}" data-kind="${CHARACTER_ITEMS[item.definitionId].kind}" aria-pressed="${item.id===this.selectedId}" aria-label="${CHARACTER_ITEMS[item.definitionId].name}, số lượng ${item.quantity}${item.equipped?', đang dùng':''}${item.protected?', bảo vệ':''}" title="${CHARACTER_ITEMS[item.definitionId].name}"><i>${art(item)}</i>${item.quantity>1?`<span class="item-quantity">${item.quantity}</span>`:''}${item.equipped?'<span class="item-equipped" aria-hidden="true">✓</span>':''}${item.protected?'<span class="item-protected" aria-hidden="true">◆</span>':''}</button></div>`).join('');
    const empty=this.find('.empty-inventory');empty.hidden=items.length>0;empty.innerHTML='<span aria-hidden="true">⌕</span><h3>Không tìm thấy vật phẩm</h3><p>Thử tên khác hoặc bỏ bộ lọc.</p><button class="game-button" data-action="clear-filter" type="button">Bỏ bộ lọc</button>';
  }
  private renderDetail(){
    const item=this.view!.items.find(item=>item.id===this.selectedId);
    if(!item){this.detailOpen=false;this.body.classList.remove('detail-open');this.detail.innerHTML='<div class="detail-placeholder"><span aria-hidden="true">◇</span><h2>Chọn một vật phẩm</h2><p>Mô tả và tác dụng sẽ xuất hiện tại đây.</p></div>';return;}
    const d=CHARACTER_ITEMS[item.definitionId],v=this.view!,current=d.slot?v.items.find(other=>other.id===v.equipment[d.slot!]):undefined;
    this.detail.innerHTML=`<button class="detail-back text-action" type="button" data-action="back">← Quay lại hành trang</button><div class="detail-title"><i>${art(item)}</i><div><span class="pane-eyebrow">${d.kind==='gear'?'Trang bị':'Vật tư'}${item.equipped?' · Đang dùng':''}</span><h2 id="live-item-title" tabindex="-1">${d.name}</h2></div></div><div class="detail-copy"><section class="ui-copy-section"><h3 class="ui-section-title">Tác dụng</h3><p class="item-effect">${d.effect}</p>${d.kind==='consumable'?`<p class="quantity-copy">Số lượng: <b>${item.quantity}</b></p>`:''}</section>
      ${d.slot&&!item.equipped?`<section class="ui-copy-section comparison"><h3 class="ui-section-title">So với món đang dùng</h3><div><span>Đang dùng</span><b>${current?CHARACTER_ITEMS[current.definitionId].name:'Chưa trang bị'}</b></div><div><span>Món được chọn</span><b>${d.name}</b></div><p>Sinh lực tối đa: ${v.maxHp} → ${v.maxHp}<br>Linh lực tối đa: ${v.maxMp} → ${v.maxMp}</p></section>`:''}<section class="ui-copy-section"><h3 class="ui-section-title">Mô tả</h3><p>${d.description}</p></section><section class="ui-copy-section"><h3 class="ui-section-title">Nguồn</h3><p>${d.kind==='gear'?'Đồ nhập môn của nhân vật.':'Hướng dẫn nhập môn HN01; số lượng được lưu cùng hành trình.'}</p></section></div>
      <div class="detail-actions"><button type="button" class="game-button primary" data-action="${d.kind==='consumable'?'use':item.equipped?'unequip':'equip'}" ${!this.online||this.pending?'disabled':''}>${this.pending?'Đang xử lý…':d.kind==='consumable'?'Dùng 1':item.equipped?'Tháo trang bị':'Trang bị'}</button><button class="protect-button" type="button" data-action="protect" aria-pressed="${item.protected}" ${!this.online||this.pending?'disabled':''}>${item.protected?'◆ Đã bảo vệ':'◇ Bảo vệ'}</button><small class="item-condition"></small></div>`;
    this.updateUseState();
  }
  private updateUseState(){
    if(this.tab==='overview'||!this.view)return;
    const item=this.view.items.find(item=>item.id===this.selectedId);if(!item)return;
    const condition=!this.online?'Chờ kết nối và đồng bộ hành trang.':this.pending?'Đang chờ máy chủ xác nhận.':this.view.sect.practising||this.view.sect.lessons.active!=='none'?'Chờ kết thúc luyện thuật trước khi dùng hoặc thay đồ.':item.definitionId==='recovery'&&this.view.hp>=100?'Sinh lực đã đầy · giữ lại vật tư.':item.definitionId==='recovery'&&this.view.sect.nextRecoveryAt>this.actions.clock()?`Vật tư đang hồi · ${Math.ceil((this.view.sect.nextRecoveryAt-this.actions.clock())/1000)} giây`:'';
    this.find('.item-condition').textContent=condition;this.find<HTMLButtonElement>('.detail-actions .primary').disabled=!!condition;
    this.find<HTMLButtonElement>('[data-action="protect"]').disabled=!this.online||this.pending;
  }
  private click(event:Event){
    const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
    if(button.hasAttribute('data-close')){this.close();return;}
    if(button.dataset.tab){this.changeTab(button.dataset.tab as Tab);return;}
    if(button.dataset.category){this.category=button.dataset.category;this.renderGrid();return;}
    if(button.dataset.item){this.inventoryScroll=this.body.scrollTop;this.selectedId=button.dataset.item;this.detailOpen=matchMedia('(max-width:759px)').matches;if(this.tab==='overview')this.tab='equipment';this.signature='';this.update();if(this.detailOpen){this.body.scrollTop=0;this.find('#live-item-title').focus({preventScroll:true});}return;}
    switch(button.dataset.action){
      case 'inventory':case 'equipment':this.changeTab(button.dataset.action);break;
      case 'back':this.back();break;
      case 'clear-filter':this.query='';this.category='all';this.find<HTMLInputElement>('#character-item-search').value='';this.renderGrid();this.find('#character-item-search').focus();break;
      case 'pose':this.pose=!this.pose;this.shrine.setState(this.pose||!!this.view&&cultivationMotion(this.view.sect,false),this.online);button.textContent=this.pose?'Xem tĩnh':'Xem vận khí';button.setAttribute('aria-pressed',String(this.pose));this.feedback('Tư thế xem hồ sơ; thổ nạp thực hiện tại người hướng dẫn vận khí.');break;
      case 'journal':this.close();this.actions.journal();break;
      case 'equip':case 'unequip':case 'use':case 'protect':{const item=this.view?.items.find(item=>item.id===this.selectedId);if(item)this.actions.command(button.dataset.action,item);break;}
    }
  }
  private changeTab(tab:Tab){this.tab=tab;this.detailOpen=false;this.category='all';this.signature='';this.body.scrollTop=0;this.update();}
  private back(){this.detailOpen=false;this.body.classList.remove('detail-open');this.body.scrollTop=this.inventoryScroll;(this.primary.querySelector<HTMLButtonElement>(`[data-item="${this.selectedId}"]`)??this.find('#character-item-search')).focus();}
  private key(event:KeyboardEvent){
    if((event.target as HTMLElement).closest('[role="tab"]')){const tabs:Tab[]=['overview','inventory','equipment'],n=tabs.indexOf(this.tab),next=event.key==='ArrowRight'?tabs[(n+1)%3]:event.key==='ArrowLeft'?tabs[(n+2)%3]:event.key==='Home'?tabs[0]:event.key==='End'?tabs[2]:undefined;if(next){event.preventDefault();this.changeTab(next);this.find(`[role="tab"][data-tab="${next}"]`).focus();}}
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
