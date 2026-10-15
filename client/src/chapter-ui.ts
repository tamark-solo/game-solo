import './chapter-ui.css';
import type {Room} from '@colyseus/sdk';
import type {CourtyardState} from '@shared/protocol/courtyard-state';
import {CHAPTER_ITEMS,CHAPTER_TITLES,CHAPTER_VG_IDS,CHAPTER_WORLD,G2_ACT_IDS,G2_ACTS,G2_ALCHEMY_RECIPES,G2_ARTIFACTS,G2_FOUNDATIONS,G2_STANCES,chapterGate,g2ItemIcon,initialChapter,levelThreshold,readG2State,type ChapterCommand,type ChapterQuestId,type ChapterResult,type ChapterView,type G2ActId,type G2AlchemyRecipe,type MaterialId} from '@shared/chapter';
import {SECT_STATIONS,nearStation,type SectView,type StationId} from '@shared/sect';
import type {Position} from '@shared/world/types';
import {attachFrameSurface} from './frame-surface';
import {hudGlyph} from './ui/dao-hud-glyph';
import {objectiveKindMeta,questCategoryMeta,questSealStampSvg,daoUiSvg} from './ui/dao-quest-icons';
import {attachSafeIconFallback,renderRewardSlots,showG2LootToast} from './quest-ui';

const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
const actStation=(id:G2ActId,s?:SectView):StationId=>{
 if(id==='VG01'){
  if(!s?.hn01)return 'guide';
  if(!s?.hn02)return 'cultivation';
  return 'training';
 }
 return id==='VG03'||id==='VG07'||id==='VG11'?'cultivation':id==='VG05'||id==='VG09'?'preparation':'training';
};
const reasons:Record<string,string>={
 distance:'Tiến lại gần điểm linh vật hoặc bấm Tự tìm đường tới NPC.',
 prerequisite:'Hoàn thành Hồi trước trong Mệnh Kiếp Chí (VG01–VG11) để mở khóa.',
 accepted:'Khởi phát Hồi hiện tại trước khi thực hiện.',
 proof:'Hoàn tất khảo nghiệm trong Bí Cảnh 2D trước khi ghi nhận đạo quả.',
 materials:'Chưa đủ linh vật luyện đan. Vào Bí Cảnh 2D hoặc hoàn thành các Hồi Mệnh Kiếp Chí để thu thập đủ dược liệu.',
 recipe_locked:'Đan phương chưa mở khóa.',
 jade:'Luyện hóa Phá Cấm Phù & Thiên Nghịch Hộ Tâm Ngọc trước.',
 cooldown:'Kỹ năng đang hồi, hãy đợi giây lát.',
 resource:'Chưa đủ linh lực.',
 guard_unavailable:'Cần trang bị Thiên Nghịch Hộ Tâm Ngọc và đang trong trận chiến.',
 combat:'Kết thúc giao chiến hiện tại trước.',
 save:'Chưa lưu được thao tác. Kiểm tra trạng thái rồi thử lại.',
 proof_saved:'✓ Đã vượt khảo nghiệm Bí Cảnh! Bấm “Nhận Đạo Quả & Quay Về Tông Môn” ngay bên phải để lĩnh thưởng!',
 already_complete:'Đạo quả đã được ghi nhận trước đó.',
 request_reused:'Mã thao tác đã dùng cho nội dung khác.',
};
interface Options {room:()=>Room<CourtyardState>|undefined;position:()=>Position;sect:()=>SectView|undefined;online:()=>boolean;focus:()=>void;clear:()=>void;feedback:(s:string)=>void;select:(id:string)=>void;changed:()=>void;inputSequence?:()=>number;navigate?:(station:StationId)=>void}
export type ChapterTab='journey'|'crafting'|'preparation';
const tabs:Record<ChapterTab,string>={journey:'Mệnh Kiếp Chí (VG01–VG11)',crafting:'Lò Đan Lý Mộ Uyển',preparation:'Nội Giới · 4 Pháp Bảo & 3 Công Pháp'};

export class ChapterUI {
 view?:ChapterView;
 private attached=new WeakSet<object>();
 private dock=node('aside');private launch=node('button','H · Mệnh Kiếp Chí / Nội Giới');private dialog=node('dialog');private body=node('div');private message=node('p');private signature='';private dockSignature='';private pending='';private sentAt=0;
 private tab:ChapterTab='journey';
 private selectedAct?:G2ActId;
 private selectedRecipe:G2AlchemyRecipe['id']=G2_ALCHEMY_RECIPES[0]!.id;
 private nav=node('nav');private summary=node('p');private collapsed=false;
 private pendingCommand?:ChapterCommand;
 private commandFocus?:string;
 constructor(private o:Options){
  this.dock.className='chapter-dock';this.dock.hidden=true;this.launch.className='chapter-launch';this.launch.type='button';
  this.launch.innerHTML=`${hudGlyph('crafting')}<span>Đạo trình</span><kbd>H</kbd>`;this.launch.setAttribute('aria-label','Mở Mệnh Kiếp Chí, Đan–Khí và Nội Giới · H');
  this.dialog.className='chapter-dialog van-panel';this.dialog.setAttribute('aria-labelledby','chapter-title');
  const header=node('header'),close=node('button','×'),heading=node('div');header.className='chapter-heading';close.className='game-button';close.type='button';close.setAttribute('aria-label','Đóng đạo trình');close.addEventListener('click',()=>this.dialog.close());
  const title=node('h2','Mệnh Kiếp Chí & Nội Giới');title.id='chapter-title';heading.append(node('span','ĐẠO TRÌNH / CƠ DUYÊN / LUYỆN HÓA'),title);header.append(heading,close);
  this.nav.className='chapter-tabs';this.nav.setAttribute('role','tablist');this.nav.setAttribute('aria-label','Mệnh Kiếp Chí & Nội Giới');
  for(const [id,label] of Object.entries(tabs)){const b=node('button',label);b.type='button';b.dataset.chapterTab=id;b.id=`chapter-tab-${id}`;b.setAttribute('role','tab');b.setAttribute('aria-controls','chapter-content');b.addEventListener('click',()=>this.chooseTab(id as ChapterTab));b.addEventListener('keydown',e=>{const ids=Object.keys(tabs) as ChapterTab[],index=ids.indexOf(id as ChapterTab);const next=e.key==='ArrowRight'?(index+1)%3:e.key==='ArrowLeft'?(index+2)%3:e.key==='Home'?0:e.key==='End'?2:-1;if(next>=0){e.preventDefault();this.chooseTab(ids[next]);this.nav.querySelector<HTMLButtonElement>(`[data-chapter-tab="${ids[next]}"]`)!.focus();}});this.nav.append(b);}
  this.summary.className='chapter-summary';this.body.className='chapter-body';this.body.id='chapter-content';this.body.setAttribute('role','tabpanel');
  this.message.className='chapter-message';this.message.setAttribute('role','status');this.message.textContent='Chọn 1 trong 11 Hồi Mệnh Kiếp Chí (VG01–VG11), Lò Đan Lý Mộ Uyển hoặc Nội Giới Thiên Nghịch Châu.';
  this.dialog.append(header,this.summary,this.nav,this.body,this.message);document.querySelector('#game-shell')!.append(this.launch,this.dock,this.dialog);attachFrameSurface(this.dialog);
  this.launch.addEventListener('click',()=>this.open());this.dialog.addEventListener('close',()=>{this.o.clear();this.o.focus();});
 }
 get modal(){return this.dialog.open;}
 get inActivity(){return !!this.view&&this.view.progress.scene!=='hub';}
 attach(room:Room<CourtyardState>){
  if(this.attached.has(room)){room.send('chapter:sync');return;}this.attached.add(room);
  room.onMessage('chapter:state',(view:ChapterView)=>{this.view=view;if(view.enemy?.hp)this.o.select(view.enemy.id);this.update();this.o.changed();});
  room.onMessage('chapter:result',(r:ChapterResult)=>{
   const matched=r.requestId===this.pending,submitted=matched?this.pendingCommand:undefined;
   if(matched){
    if(r.ok&&(submitted?.action==='enter'||submitted?.action==='leave'||submitted?.node==='g2-quest'&&submitted?.choice==='enter'||submitted?.node==='g2-act'&&(submitted?.choice?.startsWith('enter_')||submitted?.choice?.startsWith('complete_')))&&this.dialog.open)this.dialog.close();
    this.pending='';this.pendingCommand=undefined;
   }
   const rec=G2_ALCHEMY_RECIPES.find(x=>x.id===(submitted?.recipe??submitted?.choice));
   if(r.ok&&submitted?.node==='g2-alchemy'&&rec){
    showG2LootToast(
     `Khai Lò Thành Công · ${rec.name}`,
     rec.effect,
     [{id:rec.id,name:rec.name,icon:rec.icon,count:'×1',rarity:'pill'}],
     '/assets/g2-items/npc-bach-chi.png',
    );
   }
   const text=r.ok?r.reason?reasons[r.reason]??'Đã lưu.':submitted?.node==='g2-alchemy'?`Khai lò thành công: ${rec?.name??'Đan dược Lý Mộ Uyển'}!`:submitted?.node==='g2-stance'?'Đã vận chuyển Khuynh hướng Công pháp Tư Đồ Nam!':submitted?.node==='g2-act'||submitted?.node==='g2-breakthrough'?'Đạo quả Mệnh Kiếp Chí đã ghi nhận & tự động nối mạch Auto-Chain!':'Đã lưu thao tác.':reasons[r.reason??'']??'Chưa thể thực hiện lúc này.';
   this.message.textContent=text;this.o.feedback(text);this.update();
   if(matched&&this.modal){const target=this.commandFocus?this.body.querySelector<HTMLButtonElement>(`[data-ui-focus="${this.commandFocus}"]`):undefined;const fallback=this.body.querySelector<HTMLButtonElement>('.chapter-select[aria-pressed="true"]')??this.nav.querySelector<HTMLButtonElement>('[aria-selected="true"]');(target&&!target.disabled?target:fallback)?.focus({preventScroll:true});}
  });
  room.send('chapter:sync');
 }
 reset(){this.view=undefined;this.pending='';this.pendingCommand=undefined;this.selectedAct=undefined;this.tab='journey';this.selectedRecipe=G2_ALCHEMY_RECIPES[0]!.id;this.signature=this.dockSignature='';this.dialog.close();this.update();}
 sendNode(nodeName:string,choice?:string){
  this.command('interact',{node:nodeName,choice});
 }
 command(action:ChapterCommand['action'],extra:Partial<ChapterCommand>={}){
  if(this.pending||!this.o.online())return;this.commandFocus=document.activeElement instanceof HTMLElement?document.activeElement.dataset.uiFocus:undefined;const c={...extra,action,id:crypto.randomUUID()};this.pendingCommand=c;this.pending=c.id;this.sentAt=Date.now();this.message.textContent=extra.node==='g2-alchemy'?'Lý Mộ Uyển đang khai lò luyện đan…':'Đang ghi nhận đạo quả Mệnh Kiếp Chí…';this.o.clear();this.o.room()?.send('chapter:command',c);this.update();
 }
 basic(){this.o.room()?.send('chapter:basic',{id:crypto.randomUUID(),...(this.o.inputSequence?{inputSeq:this.o.inputSequence()}:{})});}
 open(tab?:ChapterTab){this.o.clear();if(tab)this.tab=tab;this.signature='';this.update();if(!this.dialog.open)this.dialog.showModal();this.nav.querySelector<HTMLButtonElement>(`[data-chapter-tab="${this.tab}"]`)?.focus();}
 openQuest(id:ChapterQuestId){this.selectedAct=CHAPTER_VG_IDS[id]??'VG01';this.open('journey');}
 openAtStation(id:StationId){
  const c=this.view?.progress??initialChapter(),s=this.o.sect(),g2=readG2State(s?{...s,chapter:c}:{chapter:c});
  this.selectedAct=g2.currentActId;
  this.open(id==='preparation'?'crafting':id==='cultivation'?'preparation':'journey');
 }
 private chooseTab(tab:ChapterTab){this.tab=tab;this.refreshSelection();}
 private refreshSelection(){this.signature='';this.update();this.body.scrollTop=0;this.body.querySelector<HTMLElement>('[data-scroll="detail"]')?.scrollTo(0,0);}
 interact(){
  if(!this.inActivity)return;
  const p=this.o.position(),n=CHAPTER_WORLD.nodes.filter(n=>Math.hypot(n.x-p.x,n.y-p.y)<=72).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!n){this.o.feedback('Tiến lại gần điểm sáng linh vật (trong tầm 72px) rồi nhấn E, hoặc dùng bảng điều khiển Bí Cảnh bên phải.');return;}
  this.command('interact',{node:n.id});
 }
 private button(parent:HTMLElement,text:string,action:ChapterCommand['action'],extra:Partial<ChapterCommand>={},enabled=true){
  const b=node('button',text);b.className='game-button';b.type='button';b.disabled=!enabled||!!this.pending||!this.o.online();b.dataset.chapterAction=action;if(extra.quest)b.dataset.quest=extra.quest;if(extra.recipe)b.dataset.recipe=extra.recipe;b.dataset.uiFocus=`${action}-${extra.quest??extra.recipe??extra.node??extra.choice??''}`;
  b.addEventListener('click',()=>this.command(action,extra));parent.append(b);return b;
 }
 update(){
  if(this.pending&&Date.now()-this.sentAt>6000&&!this.message.querySelector('[data-chapter-retry]')){
   this.message.textContent='Chưa nhận xác nhận. Gửi lại cùng mã để tránh trừ nguyên liệu hai lần.';
   const retry=node('button','Gửi lại thao tác');retry.className='game-button';retry.type='button';retry.dataset.chapterRetry='';retry.addEventListener('click',()=>{if(this.o.online()&&this.pendingCommand){this.o.room()?.send('chapter:command',this.pendingCommand);this.sentAt=Date.now();this.message.textContent='Đang kiểm tra thao tác đã gửi…';}});this.message.append(retry);
  }
  this.launch.hidden=!this.o.online();this.dock.hidden=!this.inActivity;
  const v=this.view,c=v?.progress??initialChapter(),position=this.o.position(),sect=this.o.sect();
  const g2=readG2State(sect?{...sect,chapter:c}:{chapter:c});
  if(!this.selectedAct||!G2_ACT_IDS.includes(this.selectedAct))this.selectedAct=g2.currentActId;
  this.summary.textContent=`${g2.realmLabel} · Công pháp Tư Đồ Nam: ${g2.stance.name} · 4 Pháp Bảo Mốc [${g2.artifacts.sword.tier}/${g2.artifacts.banner.tier}/${g2.artifacts.chariot.tier}/${g2.artifacts.bead.tier}] · Tu vi ${Math.floor(sect?.cultivation??0)}/${chapterGate(c)} · Mệnh Kiếp Chí ${g2.completedActs.length}/11 Hồi`;
  this.dialog.dataset.pending=String(!!this.pending);
  const signature=JSON.stringify([this.tab,this.selectedAct,this.selectedRecipe,c.accepted,c.completed,c.facts,c.stock,c.jade,c.jadeEquipped,c.caseOwned,c.compassOwned,c.scene,c.activity,sect?.hn01,sect?.hn02,sect?.lessons,sect?.level,sect?.cultivation,sect?.milestone,this.pending,SECT_STATIONS.map(s=>nearStation(position,s.id)),this.o.online()]);
  if(signature!==this.signature){this.signature=signature;this.render();}
  const dockKey=JSON.stringify([c.activity,c.scene,c.facts,v?.status,v?.stableReady,v?.prepared,Math.ceil(v?.enemy?.hp??0),Math.ceil(v?.enemy?.maxHp??0),c.checkpoint,this.pending,this.o.online(),Math.ceil(Math.max(0,c.guardReadyAt-(v?.now??0))/1000)]);
  if(dockKey!==this.dockSignature){
   const focus=document.activeElement instanceof HTMLElement&&this.dock.contains(document.activeElement)?document.activeElement.dataset.uiFocus:undefined;
   const top=this.dock.scrollTop;this.dockSignature=dockKey;this.dock.replaceChildren();
   if(v){
    const activeCode:G2ActId=c.activity==='none'?'VG01':(CHAPTER_VG_IDS[c.activity]??g2.currentActId);
    const activeAct=G2_ACTS.find(a=>a.id===activeCode)??G2_ACTS[0]!;
    const hasProof=c.activity!=='none'&&c.facts.includes(`${c.activity}-proof`);
    const heading=node('header'),toggle=node('button',this.collapsed?'+':'−');
    const titleWrap=node('div');titleWrap.style.cssText='display:flex;align-items:center;gap:8px;';
    const port=node('img');port.src=activeAct.portrait;port.alt='';port.width=port.height=36;
    attachSafeIconFallback(port);
    port.style.cssText='image-rendering:pixelated;object-fit:contain;border-radius:6px;border:1px solid #e7c068;background:rgba(15,23,34,0.9);padding:2px;';
    titleWrap.append(port,node('h3',`${activeCode} · ${c.activity==='none'?'Chiến trường Ngoại Vi':CHAPTER_TITLES[c.activity]}`));
    heading.append(titleWrap,toggle);
    toggle.type='button';toggle.dataset.uiFocus='dock-toggle';toggle.setAttribute('aria-label',this.collapsed?'Mở hướng dẫn trận chiến':'Thu gọn hướng dẫn trận chiến');toggle.setAttribute('aria-expanded',String(!this.collapsed));
    toggle.addEventListener('click',()=>{this.collapsed=!this.collapsed;this.dockSignature='';this.update();});
    this.dock.dataset.collapsed=String(this.collapsed);this.dock.append(heading,node('p',v.hint));
    const statusText=v.status==='won'||hasProof
     ?`✓ Đã vượt khảo nghiệm ${activeCode}! Bấm “Nhận Đạo Quả & Quay Về Tông Môn” bên dưới!`
     :v.status==='failed'
       ?'Chưa vượt qua · Bấm “Hồi Đầy HP & MP” rồi Khai Chiến lại'
       :v.status==='running'
         ?`Đang giao chiến${v.enemy?` · Boss ${Math.ceil(v.enemy.hp)}/${v.enemy.maxHp} HP`:''} (Nhấn E tại điểm sáng để thu thập Linh Vật)`
         :'Điểm chuẩn bị Bí Cảnh · Bấm “Khai Chiến Bí Cảnh” hoặc thu thập điểm sáng (E)';
    this.dock.append(node('p',statusText));
    if(c.activity==='HN10')this.dock.append(node('p',`Hắc Ấn Chấp Sự: Pha ${c.checkpoint}/3 · Lách vào khe sáng 90° hướng khóa trước đại chiêu Ấn Hồi.`));
    if(activeAct.rewardItems.length){
     this.dock.append(renderRewardSlots(activeAct.rewardItems,true));
    }
    if(c.activity!=='none'){
     if(v.status==='won'||hasProof){
      const claimBtn=this.button(this.dock,`Nhận Đạo Quả ${activeCode} & Quay Về Tông Môn`,'interact',{node:'g2-act',choice:`complete_${activeCode}`});
      claimBtn.style.cssText='border-color:#e7c068;background:linear-gradient(180deg,#5b4318,#36260b);color:#fff3d1;font-weight:700;';
     }else if(v.status!=='running'){
      this.button(this.dock,'Hồi Đầy HP & MP (Lộ Thủy Nội Giới)','prepare');
      this.button(this.dock,c.activity==='HN10'?`Khai Chiến Pha ${c.checkpoint+1}/3`:`Khai Chiến Bí Cảnh ${activeCode}`,'start');
     }
     if(v.status==='running'){
      this.button(this.dock,`G · Thiên Nghịch Hộ Tâm${c.guardReadyAt>v.now?` · ${Math.ceil((c.guardReadyAt-v.now)/1000)}s`:''}`,'guard',{},c.jadeEquipped&&c.guardReadyAt<=v.now);
     }
    }
    this.button(this.dock,'↩ Quay Về Hằng Nhạc Tông','leave');
   }
   this.dock.scrollTop=top;if(focus)this.dock.querySelector<HTMLElement>(`[data-ui-focus="${focus}"]`)?.focus({preventScroll:true});
  }
 }
 private render(){
  const v=this.view,c=v?.progress??initialChapter(),s=this.o.sect(),hub=c.scene==='hub';
  const g2=readG2State(s?{...s,chapter:c}:{chapter:c});
  const active=document.activeElement instanceof HTMLElement?document.activeElement.dataset.uiFocus:undefined;
  const bodyTop=this.body.scrollTop,scrolls=[...this.body.querySelectorAll<HTMLElement>('[data-scroll]')].map(n=>[n.dataset.scroll!,n.scrollTop,n.scrollLeft] as const);
  this.body.replaceChildren();this.body.setAttribute('aria-labelledby',`chapter-tab-${this.tab}`);this.dialog.dataset.tab=this.tab;
  this.nav.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{const selected=b.dataset.chapterTab===this.tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
  const layout=node('div');layout.className='chapter-workspace';this.body.append(layout);
  const list=node('nav');list.className='chapter-list';list.dataset.scroll='list';list.setAttribute('aria-label',this.tab==='crafting'?'Danh sách 4 Đan Phương Lý Mộ Uyển':'Danh sách 11 Hồi Mệnh Kiếp Chí');
  const detail=node('section');detail.className='chapter-detail';detail.dataset.scroll='detail';
  const selectButton=(label:string,description:string,key:string,selected:boolean,choose:()=>void)=>{const b=node('button');b.type='button';b.className='chapter-select';b.dataset.uiFocus=key;b.setAttribute('aria-pressed',String(selected));b.append(node('b',label),node('small',description));b.addEventListener('click',choose);return b;};
  const jump=(label:string,tab:ChapterTab)=>{const b=node('button',label);b.type='button';b.className='chapter-link';b.addEventListener('click',()=>{this.chooseTab(tab);this.nav.querySelector<HTMLButtonElement>(`[data-chapter-tab="${tab}"]`)?.focus();});detail.append(b);};

  if(this.tab==='journey'){
   const doneSet=new Set<G2ActId>(g2.completedActs);
   const actStatus=(id:G2ActId)=>doneSet.has(id)?'✓ Đã viên mãn':id===g2.currentActId?'▸ Đang thực hiện':'○ Chưa mở';
   for(const act of G2_ACTS){
    if(act.id==='VG01')list.append(node('h3','Quyển Thượng · Ngưng Khí → Trúc Cơ (VG01–VG06)'));
    if(act.id==='VG07')list.append(node('h3','Quyển Hạ · Quyết Minh Cốc → Kết Đan (VG07–VG11)'));
    const catMeta=questCategoryMeta(act.id);
    const b=selectButton(act.title,`${act.id} · ${catMeta.badgeText} · ${act.realmRange} · ${actStatus(act.id)}`,`act-${act.id}`,act.id===(this.selectedAct??g2.currentActId),()=>{this.selectedAct=act.id;this.refreshSelection();});
    b.dataset.selectQuest=act.id;
    const pImg=node('img');pImg.src=act.portrait;pImg.alt='';pImg.width=pImg.height=40;
    attachSafeIconFallback(pImg);
    pImg.style.cssText=`image-rendering:pixelated;object-fit:contain;border-radius:7px;border:1.5px solid ${catMeta.borderColor};background:rgba(12,20,30,0.9);padding:2px;`;
    b.prepend(pImg);
    list.append(b);
   }
   const act=G2_ACTS.find(a=>a.id===(this.selectedAct??g2.currentActId))??G2_ACTS[0]!;
   const catMeta=questCategoryMeta(act.id);
   const isDone=doneSet.has(act.id);
   const isUnlocked=isDone||act.id===g2.currentActId||G2_ACT_IDS.indexOf(act.id)<=G2_ACT_IDS.indexOf(g2.currentActId);
   const hasProof=act.chapterQuest?c.facts.includes(`${act.chapterQuest}-proof`):false;
   const statusKind=isDone?'completed':hasProof?'ready':isUnlocked?'active':'locked';

   detail.style.position='relative';
   const sealBox=node('div');
   sealBox.style.cssText='position:absolute;top:14px;right:16px;pointer-events:none;opacity:0.9;';
   sealBox.innerHTML=questSealStampSvg(statusKind);
   detail.append(sealBox);

   const catPill=node('span');
   catPill.style.cssText=`display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:${catMeta.bgColor};border:1px solid ${catMeta.borderColor};color:${catMeta.accentColor};font-size:11px;font-weight:700;letter-spacing:0.05em;width:fit-content;`;
   catPill.innerHTML=`${catMeta.svg}<span>${act.id} · ${catMeta.badgeText} · ${act.realmRange} · ${actStatus(act.id)}</span>`;
   detail.append(catPill,node('h3',act.title),node('p',`Địa điểm: ${catMeta.locationLabel} · ${act.description}`));

   const voiceCard=node('aside');voiceCard.className='chapter-next';
   voiceCard.style.cssText='display:flex;align-items:flex-start;gap:12px;';
   const portImg=node('img');portImg.src=act.portrait;portImg.alt=act.speaker;portImg.width=portImg.height=58;
   attachSafeIconFallback(portImg);
   portImg.style.cssText=`image-rendering:pixelated;object-fit:contain;border-radius:9px;border:1.5px solid ${catMeta.borderColor};background:rgba(15,23,34,0.92);padding:3px;flex-shrink:0;`;
   const voiceCopy=node('div');
   voiceCopy.append(node('b',`Lời dẫn Thiên Cơ · ${act.speaker}`),node('p',`“${act.voiceover}”`));
   voiceCard.append(portImg,voiceCopy);
   detail.append(voiceCard);

   const objHeading=node('h4');
   objHeading.innerHTML=`${daoUiSvg('sword',15)} <span>Mục Tiêu Hồi Mệnh Kiếp Chí</span>`;
   objHeading.style.cssText='display:flex;align-items:center;gap:6px;';
   detail.append(objHeading);
   const objList=node('ul');objList.className='chapter-requirements';
   for(const [idx,obj] of act.objectives.entries()){
    const objDone=isDone||(act.id==='VG01'?(idx===0?!!s?.hn01:idx===1?!!s?.hn02:false):(hasProof&&idx===0));
    const objMeta=objectiveKindMeta(obj.id,obj.text);
    const li=node('li');
    li.style.cssText='display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;background:rgba(14,22,32,0.78);border:1px solid rgba(235,196,108,0.26);margin-bottom:6px;';
    const iconSpan=node('span');
    iconSpan.style.cssText=`display:inline-flex;align-items:center;justify-content:center;color:${objDone?'#79e2b7':objMeta.accentColor};flex-shrink:0;`;
    iconSpan.innerHTML=objDone?daoUiSvg('check',15):objMeta.svg;
    const textSpan=node('span',`[${objMeta.shortLabel}] ${obj.text}${objDone?' · Đã đạt':''}`);
    textSpan.style.color=objDone?'#9fe3c8':'#f4ead5';
    li.append(iconSpan,textSpan);
    objList.append(li);
   }
   detail.append(objList);

   const rewHeading=node('h4');
   rewHeading.innerHTML=`${daoUiSvg('reward',15)} <span>Đạo Quả & Vật Phẩm Thưởng</span>`;
   rewHeading.style.cssText='display:flex;align-items:center;gap:6px;';
   detail.append(rewHeading);
   detail.append(node('p',act.reward));
   if(act.rewardItems.length){
    detail.append(renderRewardSlots(act.rewardItems,false));
   }

   const actions=node('div');actions.className='chapter-actions';detail.append(actions);
   if(!isDone){
    if(act.id==='VG01'){
     if(!s?.hn01){
      this.button(actions,'Bước 1/3: Nhặt Châu Đá Ngũ Vân (Thiên Nghịch Châu Mốc I)','interact',{node:'g2-act',choice:'step1_VG01'},hub&&isUnlocked);
     }else if(!s?.hn02){
      this.button(actions,'Bước 2/3: Khai Mở Khí Hải & Lĩnh Thanh Phong Linh Kiếm (Kiếm Linh Mốc I)','interact',{node:'g2-act',choice:'step2_VG01'},hub&&isUnlocked);
     }else{
      this.button(actions,'Bước 3/3: Đột Phá Ngưng Khí Tầng 3 & Hoàn Tất Hồi I (VG01)','interact',{node:'g2-act',choice:'complete_VG01'},hub&&isUnlocked);
     }
    }else{
     this.button(actions,`Tiến Vào Bí Cảnh 2D · ${act.id} (${act.title.split(' — ')[1]??act.title})`,'interact',{node:'g2-act',choice:`enter_${act.id}`},hub&&isUnlocked);
     this.button(actions,hasProof?`Nhận Đạo Quả ${act.id} & Nối Mạch Auto-Chain`:`Ghi Nhận Đạo Quả ${act.id} (${act.rewardItems[1]?.name??act.rewardItems[0]?.name??'Đột phá'})`,'interact',{node:'g2-act',choice:`complete_${act.id}`},hub&&isUnlocked);
    }
   }else{
    const nextIdx=G2_ACT_IDS.indexOf(act.id)+1;
    if(nextIdx<G2_ACT_IDS.length){
     const nextAct=G2_ACT_IDS[nextIdx]!;
     const nextBtn=node('button',`Chuyển sang ${nextAct} →`);nextBtn.className='game-button';nextBtn.type='button';
     nextBtn.addEventListener('click',()=>{this.selectedAct=nextAct;this.refreshSelection();});
     actions.append(nextBtn);
    }
   }
   this.navigation(actions,actStation(act.id,s));
   jump('Mở Lò Đan Lý Mộ Uyển (4 Đan Phương) →','crafting');
   jump('Mở Nội Giới · 4 Pháp Bảo & 3 Công Pháp Tư Đồ Nam →','preparation');
  }else if(this.tab==='crafting'){
   list.append(node('h3','4 Đan Phương Lý Mộ Uyển (GDD 0.34)'));
   for(const r of G2_ALCHEMY_RECIPES){
    const enough=Object.entries(r.consume).every(([id,n])=>(c.stock[id as MaterialId]??0)>=n!);
    const b=selectButton(r.name,enough?'✓ Đủ linh vật · Sẵn sàng khai lò':'○ Chưa đủ linh vật',`recipe-${r.id}`,r.id===this.selectedRecipe,()=>{this.selectedRecipe=r.id;this.refreshSelection();});
    b.dataset.selectRecipe=r.id;
    b.prepend(this.icon(r.id,32,'refined'));
    list.append(b);
   }
   const r=G2_ALCHEMY_RECIPES.find(x=>x.id===this.selectedRecipe)??G2_ALCHEMY_RECIPES[0]!;
   const enough=Object.entries(r.consume).every(([id,n])=>(c.stock[id as MaterialId]??0)>=n!);
   detail.append(node('span',`QUYẾT MINH CỐC · ĐAN TRẬN LÝ MỘ UYỂN · MỞ TỪ ${r.actReq}`),node('h3',r.name),node('p',r.description));
   const result=node('div');result.className='chapter-result';result.append(this.icon(r.id,64,'refined'),node('div',r.effect));detail.append(result);
   detail.append(node('h4','Dược liệu cần dùng · Đang có / Yêu cầu'));
   for(const [id,n] of Object.entries(r.consume)){
    const have=c.stock[id as MaterialId]??0;
    const row=node('div');row.className='chapter-material';row.dataset.sufficient=String(have>=n!);
    row.append(this.icon(id,32),node('span',this.itemName(id)),node('b',`${have} / ${n}`));
    detail.append(row);
   }
   const reason=node('p');reason.className='chapter-readiness';
   reason.textContent=!this.o.online()?'Đang mất kết nối.':enough?'✓ Đủ dược liệu · Có thể khai lò luyện chế ngay trong Nội Giới G2!':'Chưa đủ dược liệu. Hãy vào Bí Cảnh 2D (nhấn E tại điểm sáng) hoặc hoàn thành các Hồi Mệnh Kiếp Chí để thu thập đủ dược liệu.';
   detail.append(reason);
   const actions=node('div');actions.className='chapter-actions';detail.append(actions);
   this.button(actions,this.pending?'Đang khai lò…':`Khai Lò Luyện ${r.name.split(' (')[0]}`,'interact',{node:'g2-alchemy',recipe:r.id,choice:r.id},hub&&enough);
   jump('← Quay lại Mệnh Kiếp Chí (VG01–VG11)','journey');
  }else{
   layout.classList.add('chapter-prep-layout');
   detail.append(node('span',`NỘI GIỚI THIÊN NGHỊCH CHÂU · ${g2.realmLabel.toLocaleUpperCase('vi-VN')}`),node('h3',`${g2.subStageLabel} · Lộ Thủy Ngũ Vân: ${g2.noiGioi.dewDrops} · Tàn Hồn: ${g2.noiGioi.soulFragments}`));
   const service=(title:string,copy:string,iconSrc?:string)=>{
    const card=node('section');card.className='chapter-service';
    if(iconSrc){
     const head=node('div');head.style.cssText='display:flex;align-items:flex-start;gap:12px;';
     const img=node('img');img.src=iconSrc;img.alt='';img.width=img.height=56;
     attachSafeIconFallback(img);
     img.style.cssText='image-rendering:pixelated;object-fit:contain;border-radius:8px;border:1.5px solid #e7c068;background:rgba(15,23,34,0.9);padding:3px;flex-shrink:0;';
     const txt=node('div');txt.append(node('h4',title),node('p',copy));
     head.append(img,txt);card.append(head);
    }else{
     card.append(node('h4',title),node('p',copy));
    }
    detail.append(card);return card;
   };
   const situCard=service(`Tàn Hồn Tư Đồ Nam · Khuynh Hướng Công Pháp: ${g2.stance.name}`,`${g2.noiGioi.situMessage} (${g2.stance.bonus})`,'/assets/g2-items/npc-situ-nan.png');
   const stanceRow=node('div');stanceRow.className='chapter-actions';situCard.append(stanceRow);
   for(const st of Object.values(G2_STANCES)){
    const activeStance=g2.stance.id===st.id;
    const btn=this.button(stanceRow,activeStance?`✓ ${st.name} (Đang vận hành)`:`Vận chuyển: ${st.name}`,'interact',{node:'g2-stance',choice:st.id},hub&&!activeStance);
    const stImg=node('img');stImg.src=st.icon;stImg.alt='';stImg.width=stImg.height=22;
    attachSafeIconFallback(stImg);
    stImg.style.cssText='vertical-align:middle;margin-right:6px;border-radius:4px;';
    btn.prepend(stImg);
   }
   for(const id of ['bead','sword','banner','chariot'] as const){
    const artDef=G2_ARTIFACTS[id],artState=g2.artifacts[id];
    const currentText=artState.current?`${artState.current.name} — ${artState.current.power}`:'Hoàn thành Hồi tương ứng trong Mệnh Kiếp Chí để thức tỉnh.';
    const nextText=artState.next?`Mốc tiếp theo: ${artState.next.name} (${artState.next.realmReq} · ${artState.next.questReq})`:'Đã đạt đỉnh phong Mốc III!';
    const card=service(`${artDef.name} (${artDef.slotLabel}) · Mốc ${artState.tier}/3`,`${currentText} · ${nextText}`,artDef.icon);
    const row=node('div');row.className='chapter-actions';card.append(row);
    this.button(row,`Tế luyện & Cộng hưởng ${artDef.name}`,'interact',{node:'g2-artifact',choice:id},hub&&artState.tier>0);
   }
   const realmIcon=g2.majorRealm==='ket_dan'?'/assets/g2-items/kim-dan.png':g2.majorRealm==='truc_co'?'/assets/g2-items/truc-co-dai.png':'/assets/g2-items/tu-vi-orb.png';
   const realmCard=service('Đột Phá Cảnh Giới · Bù Đắp Đạo Cơ Trúc Cơ & Độ Kiếp Kết Đan',`Cảnh giới hiện tại: ${g2.realmLabel} (${g2.subStageLabel}). Tu vi tích lũy: ${s?.cultivation??0} / ${chapterGate(c)}. Các tầng nhỏ tự động tăng khi đủ Tu vi.`,realmIcon);
   const realmActions=node('div');realmActions.className='chapter-actions';realmCard.append(realmActions);
   const maxLvl=c.completed.includes('HN09')?15:c.completed.includes('HN07')?12:c.completed.includes('HN06')?9:c.completed.includes('HN05')?6:3;
   if(s?.hn02&&s.level<maxLvl){
    const need=levelThreshold(s.level+1);
    this.button(realmActions,`Đột phá Ngưng Khí Tầng ${s.level+1} (Cần ${need} Tu vi)`,'interact',{node:'g2-breakthrough',choice:'level'},hub&&s.cultivation>=need);
   }
   if(c.completed.includes('HN10')){
    for(const f of Object.values(G2_FOUNDATIONS)){
     const chosen=g2.foundationQuality?.id===f.id;
     this.button(realmActions,chosen?`✓ ${f.name}`:`Chuyển Đạo Đài: ${f.name}`,'interact',{node:'g2-breakthrough',choice:`foundation_${f.id}`},hub&&!chosen);
    }
   }
   if(c.completed.includes('HN10')||g2.majorRealm==='truc_co'){
    this.button(realmActions,g2.majorRealm==='ket_dan'?'✓ Đã Kết Thành Bổn Mệnh Kim Đan':'Độ Kiếp Cửu Trọng → Kết Đan Sơ Kỳ & Mở 4 Pháp Bảo Mốc III','interact',{node:'g2-breakthrough',choice:'ket_dan'},hub&&g2.majorRealm!=='ket_dan');
   }
  }
  if(this.tab!=='preparation')layout.append(list);layout.append(detail);
  const bag=node('aside');bag.className='chapter-bag';bag.dataset.scroll='bag';bag.append(node('h3','Túi Càn Khôn · Nội Giới'));
  const resSub=node('h4','Nguyên Khí Nội Giới');resSub.style.cssText='margin:6px 0 4px;font-size:12px;color:#7be3f2;';bag.append(resSub);
  const tuViRow=node('div');tuViRow.className='chapter-material';tuViRow.append(this.icon('tu-vi',32),node('span','Tu Vi Linh Khí'),node('b',`${Math.floor(s?.cultivation??0)}/${chapterGate(c)}`));bag.append(tuViRow);
  const dewRow=node('div');dewRow.className='chapter-material';dewRow.append(this.icon('vh-clear-water',32),node('span','Lộ Thủy Ngũ Vân'),node('b',String(g2.noiGioi.dewDrops)));bag.append(dewRow);
  const soulRow=node('div');soulRow.className='chapter-material';soulRow.append(this.icon('soul-orb',32),node('span','Tàn Hồn Thu Nạp'),node('b',String(g2.noiGioi.soulFragments)));bag.append(soulRow);
  const artifactSub=node('h4','4 Pháp Bảo Bản Mệnh');artifactSub.style.cssText='margin:8px 0 4px;font-size:12px;color:#e7c068;';bag.append(artifactSub);
  for(const id of ['bead','sword','banner','chariot'] as const){
   const artDef=G2_ARTIFACTS[id],artState=g2.artifacts[id];
   const row=node('div');row.className='chapter-material';
   row.append(this.icon(`g2-${id}`,32),node('span',artState.current?.name??artDef.name),node('b',artState.tier>0?`Mốc ${artState.tier}`:'Chưa mở'));
   bag.append(row);
  }
  const matSub=node('h4','Linh Vật & Dược Liệu');matSub.style.cssText='margin:10px 0 4px;font-size:12px;color:#9ec5be;';bag.append(matSub);
  const held=Object.entries(c.stock).filter(([,n])=>n);
  for(const [id,n] of held){const row=node('div');row.className='chapter-material';row.append(this.icon(id,32),node('span',this.itemName(id)),node('b',String(n)));bag.append(row);}
  if(!held.length)bag.append(node('p','Vào Bí Cảnh 2D hoặc hoàn thành các Hồi Mệnh Kiếp Chí (VG01–VG11) để thu thập Dược thảo Quyết Minh, Lộ Thủy Ngũ Vân, Thanh Mộc Linh Tâm và Mảnh Hắc Phù.'));
  layout.append(bag);
  for(const [key,top,left] of scrolls)this.body.querySelector<HTMLElement>(`[data-scroll="${key}"]`)?.scrollTo(left,top);this.body.scrollTop=bodyTop;
  if(active){const target=this.body.querySelector<HTMLElement>(`[data-ui-focus="${active}"]`);const fallback=this.body.querySelector<HTMLButtonElement>('.chapter-select[aria-pressed="true"]')??this.nav.querySelector<HTMLButtonElement>('[aria-selected="true"]');(target&&!(target instanceof HTMLButtonElement&&target.disabled)?target:fallback)?.focus({preventScroll:true});}
 }
 private navigation(parent:HTMLElement,id:StationId){
  if(!this.o.navigate||this.view?.progress.scene!=='hub'||nearStation(this.o.position(),id))return;
  const b=node('button','Tự tìm đường tới NPC');b.type='button';b.className='game-button';b.dataset.chapterNavigate=id;b.dataset.uiFocus=`navigate-${id}`;b.disabled=!this.o.online()||!!this.pending;
  b.addEventListener('click',()=>{this.dialog.addEventListener('close',()=>this.o.navigate?.(id),{once:true});this.dialog.close();});parent.append(b);
 }
 private itemName(id:string){return id==='recovery'?'Hồi Xuân Đan':CHAPTER_ITEMS[id as keyof typeof CHAPTER_ITEMS]?.name??id;}
 private icon(id:string,size:32|64,_state?:string){
  const img=node('img');img.width=img.height=size;img.alt='';
  img.style.cssText='image-rendering:pixelated;object-fit:contain;';
  attachSafeIconFallback(img);
  img.src=g2ItemIcon(id);
  return img;
 }
 diagnostics(){return {view:this.view,pending:this.pending,modal:this.modal,inActivity:this.inActivity,tab:this.tab,selectedQuest:this.selectedAct,selectedRecipe:this.selectedRecipe};}
 dispose(){this.dialog.remove();this.dock.remove();this.launch.remove();}
}
