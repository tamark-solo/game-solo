import './chapter-ui.css';
import type {Room} from '@colyseus/sdk';
import type {CourtyardState} from '@shared/protocol/courtyard-state';
import {CHAPTER_ITEMS,CHAPTER_QUESTS,CHAPTER_RECIPES,CHAPTER_REWARDS,CHAPTER_TITLES,CHAPTER_BRIEFS,CHAPTER_REPORT_RESPONSES,CHAPTER_WORLD,chapterGate,chapterRecipeBlocker,initialChapter,type ChapterCommand,type ChapterQuestId,type ChapterResult,type ChapterView,type MaterialId} from '@shared/chapter';
import {SECT_STATIONS,nearStation,type SectView,type StationId} from '@shared/sect';
import type {Position} from '@shared/world/types';
import {attachFrameSurface} from './frame-surface';
import {hudGlyph} from './ui/dao-hud-glyph';
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
const station=(q:ChapterQuestId):StationId=>q==='HN07'?'cultivation':['HN05','HN09','HN10'].includes(q)?'training':['HN11','HN12'].includes(q)?'guide':'preparation';
const reasons:Record<string,string>={distance:'Tới gần đúng NPC hoặc điểm tương tác rồi thử lại.',prerequisite:'Còn thiếu nhiệm vụ hoặc mốc trước đó.',accepted:'Nhận nhiệm vụ tại NPC trước.',proof:'Cần hoàn tất bài và quay về xác nhận.',level9:'Bài đã lưu. Hãy tích lũy và xác nhận tầng 9 tại người hướng dẫn vận khí.',m02:'Hoàn thành HN05 và xác nhận tầng 3 trước.',materials:'Chưa đủ nguyên liệu. Các nguồn EX01/EX02 chỉ nhận một lần.',recipe_locked:'Công thức chưa mở hoặc chuyến chưa sẵn sàng.',jade:'Luyện hóa và trang bị ngọc trước.',cooldown:'Đang hồi, hãy đợi rồi thử lại.',resource:'Chưa đủ linh lực.',guard_unavailable:'Cần ngọc đã luyện hóa/trang bị và lượt đang chạy.',combat:'Kết thúc bài đang chạy trước.',sample_action:'Đứng đúng điểm và thực hiện bước được hướng dẫn.',stable:'Đứng yên tại dấu này 2 giây; tuyến thủ công đi A trước B.',route:'Đi qua dấu trên tuyến rồi tới điểm giao mẫu.',seal:'Niêm hộp tại NPC chuẩn bị trước khi chọn tuyến ngắn.',case:'Cần chế Hộp giữ khí trước.',samples:'Lấy sợi và ngọc trước khi sơ chế.',observations:'Quan sát A+B hoặc đọc Định Lưu Bàn tại A trước.',compass:'Chưa có Định Lưu Bàn.',save:'Chưa lưu được thao tác. Kiểm tra trạng thái rồi thử lại.',proof_saved:'Kết quả bài đã lưu. Bạn có thể quay về xác nhận.',already_complete:'Đã ghi nhận trước đó.',request_reused:'Mã thao tác đã dùng cho nội dung khác.',trip:'Chuẩn bị chuyến tại NPC, rồi chọn tuyến khi tới ngoại vi.'};
interface Options {room:()=>Room<CourtyardState>|undefined;position:()=>Position;sect:()=>SectView|undefined;online:()=>boolean;focus:()=>void;clear:()=>void;feedback:(s:string)=>void;select:(id:string)=>void;changed:()=>void;inputSequence?:()=>number}
export type ChapterTab='journey'|'crafting'|'preparation';
const tabs:Record<ChapterTab,string>={journey:'Đạo trình',crafting:'Luyện chế',preparation:'Chuẩn bị'};
const recipeNames:Record<string,string>={'hn-refine-training-jade':'Luyện ngọc hộ thân','vh-recipe-ink':'Pha mực dẫn khí','vh-recipe-recovery':'Chế vật tư hồi phục','vh-recipe-case':'Chế Hộp giữ khí','vh-recipe-compass':'Chế Định Lưu Bàn','vh-recipe-seal':'Niêm hộp cho chuyến'};
const requirements:Record<string,string>={'HN08-accepted':'Nhận nhiệm vụ Vật trong tay (HN08)','hn-guard-method':'Học phương pháp hộ thân ở người coi chuẩn bị','EX01-completed':'Hoàn tất Nhận biết nguồn (EX01)','EX02-completed':'Hoàn tất Vật liệu thành công cụ (EX02)','EX03-completed':'Hoàn tất Chọn cách mang mẫu (EX03)','EX03-accepted':'Nhận Chọn cách mang mẫu (EX03)','trip-not-started':'Chuẩn bị chuyến và chưa niêm hộp'};
export class ChapterUI {
 view?:ChapterView;
 private attached=new WeakSet<object>();
 private dock=node('aside');private launch=node('button','H · Nhập môn / Luyện chế');private dialog=node('dialog');private body=node('div');private message=node('p');private signature='';private dockSignature='';private pending='';private sentAt=0;
 private compass=true;
 private tab:ChapterTab='journey';private selectedQuest?:ChapterQuestId;private selectedRecipe=CHAPTER_RECIPES[0].id;
 private nav=node('nav');private summary=node('p');private collapsed=false;
 private pendingCommand?:ChapterCommand;
 private commandFocus?:string;
 constructor(private o:Options){
  this.dock.className='chapter-dock';this.dock.hidden=true;this.launch.className='chapter-launch';this.launch.type='button';
  this.launch.innerHTML=`${hudGlyph('crafting')}<span>Đạo trình</span><kbd>H</kbd>`;this.launch.setAttribute('aria-label','Mở đạo trình và luyện chế · H');
  this.dialog.className='chapter-dialog van-panel';this.dialog.setAttribute('aria-labelledby','chapter-title');
  const header=node('header'),close=node('button','×'),heading=node('div');header.className='chapter-heading';close.className='game-button';close.type='button';close.setAttribute('aria-label','Đóng đạo trình');close.addEventListener('click',()=>this.dialog.close());
  const title=node('h2','Hằng Nhạc · Đạo trình');title.id='chapter-title';heading.append(node('span','VÂN HẢI ĐẠO ĐỒ'),title);header.append(heading,close);
  this.nav.className='chapter-tabs';this.nav.setAttribute('role','tablist');this.nav.setAttribute('aria-label','Đạo trình Hằng Nhạc');
  for(const [id,label] of Object.entries(tabs)){const b=node('button',label);b.type='button';b.dataset.chapterTab=id;b.id=`chapter-tab-${id}`;b.setAttribute('role','tab');b.setAttribute('aria-controls','chapter-content');b.addEventListener('click',()=>this.chooseTab(id as ChapterTab));b.addEventListener('keydown',e=>{const ids=Object.keys(tabs) as ChapterTab[],index=ids.indexOf(id as ChapterTab);const next=e.key==='ArrowRight'?(index+1)%3:e.key==='ArrowLeft'?(index+2)%3:e.key==='Home'?0:e.key==='End'?2:-1;if(next>=0){e.preventDefault();this.chooseTab(ids[next]);this.nav.querySelector<HTMLButtonElement>(`[data-chapter-tab="${ids[next]}"]`)!.focus();}});this.nav.append(b);}
  this.summary.className='chapter-summary';this.body.className='chapter-body';this.body.id='chapter-content';this.body.setAttribute('role','tabpanel');
  this.message.className='chapter-message';this.message.setAttribute('role','status');this.message.textContent='Chọn một bước để xem điều kiện và nơi thực hiện.';
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
   if(matched){if(r.ok&&['enter','leave'].includes(submitted?.action??'')&&this.dialog.open)this.dialog.close();this.pending='';this.pendingCommand=undefined;}
   const text=r.ok?r.reason?reasons[r.reason]??'Đã lưu.':submitted?.action==='craft'?`${recipeNames[submitted.recipe??'']??'Luyện chế'} đã hoàn tất. Hành trang đã cập nhật.`:'Đã lưu thao tác.':reasons[r.reason??'']??'Chưa thể thực hiện lúc này.';
   this.message.textContent=text;this.o.feedback(text);this.update();
   if(matched&&this.modal){const target=this.commandFocus?this.body.querySelector<HTMLButtonElement>(`[data-ui-focus="${this.commandFocus}"]`):undefined;const fallback=this.body.querySelector<HTMLButtonElement>('.chapter-select[aria-pressed="true"]')??this.nav.querySelector<HTMLButtonElement>('[aria-selected="true"]');(target&&!target.disabled?target:fallback)?.focus({preventScroll:true});}
  });
  room.send('chapter:sync');
 }
 reset(){this.view=undefined;this.pending='';this.pendingCommand=undefined;this.signature=this.dockSignature='';this.dialog.close();this.update();}
 command(action:ChapterCommand['action'],extra:Partial<ChapterCommand>={}){
  if(this.pending||!this.o.online())return;this.commandFocus=document.activeElement instanceof HTMLElement?document.activeElement.dataset.uiFocus:undefined;const c={...extra,action,id:crypto.randomUUID()};this.pendingCommand=c;this.pending=c.id;this.sentAt=Date.now();this.message.textContent=action==='craft'?`Đang xác nhận ${recipeNames[extra.recipe??'']??'luyện chế'}…`:'Đang chờ xác nhận thao tác…';this.o.clear();this.o.room()?.send('chapter:command',c);this.update();
 }
 basic(){this.o.room()?.send('chapter:basic',{id:crypto.randomUUID(),...(this.o.inputSequence?{inputSeq:this.o.inputSequence()}:{})});}
 open(tab?:ChapterTab){this.o.clear();if(tab)this.tab=tab;this.signature='';this.update();if(!this.dialog.open)this.dialog.showModal();this.nav.querySelector<HTMLButtonElement>(`[data-chapter-tab="${this.tab}"]`)?.focus();}
 openAtStation(id:StationId){const c=this.view?.progress;this.selectedQuest=c?.accepted.find(q=>station(q)===id&&!c.completed.includes(q))??this.view?.available.find(q=>station(q)===id)??CHAPTER_QUESTS.find(q=>station(q)===id);this.open(id==='preparation'?'crafting':id==='cultivation'?'preparation':'journey');}
 private chooseTab(tab:ChapterTab){this.tab=tab;this.refreshSelection();}
 private refreshSelection(){this.signature='';this.update();this.body.scrollTop=0;this.body.querySelector<HTMLElement>('[data-scroll="detail"]')?.scrollTo(0,0);}
 interact(){
  if(!this.inActivity)return;
  const p=this.o.position(),n=CHAPTER_WORLD.nodes.filter(n=>Math.hypot(n.x-p.x,n.y-p.y)<=72).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!n){this.o.feedback('Tới gần dấu có tên rồi nhấn E. H mở hướng dẫn; có nút quay về bên phải.');return;}
  this.command('interact',{node:n.id,...(this.view?.progress.activity==='HN06'?{choice:'case'}:this.view?.progress.activity==='EX04'&&this.compass&&this.view.progress.compassOwned?{choice:'compass'}:{})});
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
  this.summary.textContent=`${sect?.milestone??'Nhập môn'} · Tầng ${sect?.level??0} · Tích lũy ${Math.floor(sect?.cultivation??0)}/${chapterGate(c)} · ${c.completed.length}/12 bước đã hoàn tất`;
  this.dialog.dataset.pending=String(!!this.pending);
  const signature=JSON.stringify([this.tab,this.selectedQuest,this.selectedRecipe,c.accepted,c.completed,c.facts,c.stock,c.jade,c.jadeEquipped,c.caseOwned,c.compassOwned,c.trip,c.sealed,c.checkpoint,c.report,c.scene,c.activity,v?.available,sect?.level,sect?.milestone,this.pending,SECT_STATIONS.map(s=>nearStation(position,s.id)),this.o.online()]);
  if(signature!==this.signature){this.signature=signature;this.render();}
  const dockKey=JSON.stringify([c.activity,c.scene,v?.status,v?.stableReady,v?.prepared,Math.ceil(v?.enemy?.hp??0),Math.ceil(v?.enemy?.maxHp??0),c.checkpoint,c.trip,c.sealed,this.pending,this.o.online(),Math.ceil(Math.max(0,c.guardReadyAt-(v?.now??0))/1000)]);
  if(dockKey!==this.dockSignature){const focus=document.activeElement instanceof HTMLElement&&this.dock.contains(document.activeElement)?document.activeElement.dataset.uiFocus:undefined;const top=this.dock.scrollTop;this.dockSignature=dockKey;this.dock.replaceChildren();if(v){
   const heading=node('header'),toggle=node('button',this.collapsed?'+':'−');heading.append(node('h3',`${c.activity} · ${c.activity==='none'?'Ngoại vi':CHAPTER_TITLES[c.activity]}`),toggle);toggle.type='button';toggle.dataset.uiFocus='dock-toggle';toggle.setAttribute('aria-label',this.collapsed?'Mở hướng dẫn bài':'Thu gọn hướng dẫn bài');toggle.setAttribute('aria-expanded',String(!this.collapsed));toggle.addEventListener('click',()=>{this.collapsed=!this.collapsed;this.dockSignature='';this.update();});this.dock.dataset.collapsed=String(this.collapsed);this.dock.append(heading,node('p',v.hint));
   this.dock.append(node('p',v.status==='won'?'✓ Kết quả đạt đã được ghi':v.status==='failed'?'Chưa đạt · chuẩn bị để thử lại':v.status==='running'?`Đang chạy${v.enemy?` · Đối thủ ${Math.ceil(v.enemy.hp)}/${v.enemy.maxHp} HP`:''}`:'Điểm chuẩn bị · chưa bắt đầu'));
   if(c.activity==='HN10')this.dock.append(node('p',`Pha đã đạt ${c.checkpoint}/3 · mỗi pha chuẩn bị miễn phí.`));
   if(['HN05','HN07','HN08','HN09','HN10'].includes(c.activity)){
    if(v.status!=='running'&&!c.completed.includes('HN10')){this.button(this.dock,'Chuẩn bị / hồi đầy','prepare');this.button(this.dock,c.activity==='HN10'?`Bắt đầu pha ${c.checkpoint+1}`:'Bắt đầu bài','start');}
    if(v.status==='running')this.button(this.dock,`G · Hộ thân${c.guardReadyAt>v.now?` · ${Math.ceil((c.guardReadyAt-v.now)/1000)}s`:''}`,'guard',{},c.jadeEquipped&&c.guardReadyAt<=v.now);
   }
   if(c.activity==='EX03'&&c.trip==='ready'){this.button(this.dock,'Tuyến ổn định · thủ công','trip_start',{choice:'stable'});this.button(this.dock,'Tuyến nhiễu · hộp đã niêm','trip_start',{choice:'sealed'},c.sealed);}
   if(['HN06','HN07','EX03'].includes(c.activity))this.dock.append(node('p',v.stableReady?'✓ Nhịp đã ổn định · có thể thử/đánh':'Dấu ổn định: đứng yên 2 giây'));
   if(c.activity==='EX04'&&c.compassOwned){const b=node('button',this.compass?'E tại A dùng Định Lưu Bàn':'E quan sát thủ công');b.className='game-button';b.type='button';b.dataset.uiFocus='compass-mode';b.addEventListener('click',()=>{this.compass=!this.compass;this.dockSignature='';this.update();});this.dock.append(b);}
   this.button(this.dock,'Quay về Hằng Nhạc','leave');
  }this.dock.scrollTop=top;if(focus)this.dock.querySelector<HTMLElement>(`[data-ui-focus="${focus}"]`)?.focus({preventScroll:true});}
 }
 private render(){
  const v=this.view,c=v?.progress??initialChapter(),p=this.o.position(),s=this.o.sect();
  const active=document.activeElement instanceof HTMLElement?document.activeElement.dataset.uiFocus:undefined;
  const bodyTop=this.body.scrollTop,scrolls=[...this.body.querySelectorAll<HTMLElement>('[data-scroll]')].map(n=>[n.dataset.scroll!,n.scrollTop,n.scrollLeft] as const);
  this.body.replaceChildren();this.body.setAttribute('aria-labelledby',`chapter-tab-${this.tab}`);this.dialog.dataset.tab=this.tab;
  this.nav.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{const selected=b.dataset.chapterTab===this.tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
  const layout=node('div');layout.className='chapter-workspace';this.body.append(layout);
  const list=node('nav');list.className='chapter-list';list.dataset.scroll='list';list.setAttribute('aria-label',this.tab==='crafting'?'Danh sách công thức':'Danh sách đạo trình');
  const detail=node('section');detail.className='chapter-detail';detail.dataset.scroll='detail';
  const prep=c.scene==='hub'&&nearStation(p,'preparation'),cult=c.scene==='hub'&&nearStation(p,'cultivation');
  const status=(q:ChapterQuestId)=>c.completed.includes(q)?'Đã hoàn tất':c.accepted.includes(q)?'Đang thực hiện':v?.available.includes(q)?'Có thể nhận':'Chưa mở';
  const selectButton=(label:string,description:string,key:string,selected:boolean,choose:()=>void)=>{const b=node('button');b.type='button';b.className='chapter-select';b.dataset.uiFocus=key;b.setAttribute('aria-pressed',String(selected));b.append(node('b',label),node('small',description));b.addEventListener('click',choose);return b;};
  const jump=(label:string,tab:ChapterTab)=>{const b=node('button',label);b.type='button';b.className='chapter-link';b.addEventListener('click',()=>{this.chooseTab(tab);this.nav.querySelector<HTMLButtonElement>(`[data-chapter-tab="${tab}"]`)?.focus();});detail.append(b);};
  if(this.tab==='journey'){
   if(v)this.selectedQuest??=c.accepted.find(q=>!c.completed.includes(q))??v.available[0]??'HN05';
   for(const q of CHAPTER_QUESTS){if(q==='HN05'||q==='EX01')list.append(node('h3',q==='HN05'?'Nhập môn Hằng Nhạc':'Nguyên liệu & khảo sát'));const b=selectButton(CHAPTER_TITLES[q],`${q} · ${status(q)}`,`quest-${q}`,q===(this.selectedQuest??'HN05'),()=>{this.selectedQuest=q;this.refreshSelection();});b.dataset.selectQuest=q;list.append(b);}
   const q=this.selectedQuest??'HN05',st=SECT_STATIONS.find(n=>n.id===station(q))!,near=c.scene==='hub'&&nearStation(p,st.id),complete=c.completed.includes(q),taken=c.accepted.includes(q),available=v?.available.includes(q);
   detail.append(node('span',`${q} · ${status(q)}`),node('h3',CHAPTER_TITLES[q]),node('p',CHAPTER_BRIEFS[q]));
   const place=node('div');place.className='chapter-location';place.append(node('b',st.name),node('small',`${st.area} · ${near?'Bạn đang ở trong tầm tương tác':'Đến gặp NPC này để thực hiện'}`));detail.append(place);
   const hint=complete?'Kết quả đã được lưu. Chọn bước tiếp theo trong đạo trình.':!taken?available?'Có thể nhận nhiệm vụ tại NPC.':'Hoàn thành bước và mốc tu luyện trước để mở nhiệm vụ.':c.facts.includes(`${q}-proof`)?'Bài đã đạt. Quay về NPC xác nhận kết quả.':q==='HN08'?'Học phương pháp → luyện hóa ngọc → trang bị → thử hộ thân.':q==='HN10'?'Vào khảo nghiệm và vượt ba pha. Pha đã đạt được giữ khi thử lại.':['HN11','HN12'].includes(q)?'Đọc lời dẫn rồi xác nhận tại người dẫn đường.':'Vào ngoại vi, làm theo chỉ dẫn của bài rồi quay về xác nhận.';
   const step=node('aside');step.className='chapter-next';step.append(node('b','Bước tiếp theo'),node('p',hint));detail.append(step);
   if(!s?.lessons.hn04)detail.append(node('p','Hoàn thành HN01–HN04 trước. Nhật ký J chỉ đường tới các NPC trong map.'));
   const actions=node('div');actions.className='chapter-actions';detail.append(actions);
   if(!complete){if(!taken)this.button(actions,'Nhận nhiệm vụ','accept',{quest:q},near&&!!available);else{if(!['HN11','HN12'].includes(q))this.button(actions,q==='HN10'?'Vào khảo nghiệm':'Tới ngoại vi','enter',{quest:q},near);if(q!=='HN10')this.button(actions,'Xác nhận kết quả','confirm',{quest:q},near&&(['HN11','HN12'].includes(q)||c.facts.includes(`${q}-proof`)));}}
   if(CHAPTER_REWARDS[q])detail.append(node('small',`Thành quả: +${CHAPTER_REWARDS[q]} tích lũy · nhận một lần sau xác nhận`));
   if(q==='HN08')jump('Mở bàn luyện ngọc →','crafting');if(q==='EX03'||q==='HN05')jump('Xem mốc và chuẩn bị →','preparation');
  }else if(this.tab==='crafting'){
   list.append(node('h3','Sổ công thức'));
   for(const r of CHAPTER_RECIPES){const blocked=chapterRecipeBlocker(c,r),b=selectButton(recipeNames[r.id],blocked==='already_complete'?'Đã luyện / chế':blocked==='recipe_locked'?'Chưa mở':blocked==='materials'?'Thiếu nguyên liệu':blocked==='case'?'Thiếu công cụ':prep?'Sẵn sàng':'Tới người coi chuẩn bị',`recipe-${r.id}`,r.id===this.selectedRecipe,()=>{this.selectedRecipe=r.id;this.refreshSelection();});b.dataset.selectRecipe=r.id;const output=r.transform?.item??Object.keys(r.produce)[0]??'vh-sealed-case';b.prepend(this.icon(output,32,r.transform?'refined':undefined));list.append(b);}
   const r=CHAPTER_RECIPES.find(r=>r.id===this.selectedRecipe)!,blocked=chapterRecipeBlocker(c,r);
   detail.append(node('span','LUYỆN CHẾ · MỘT LƯỢT'),node('h3',recipeNames[r.id]));
   const output=r.transform?.item??Object.keys(r.produce)[0]??'vh-sealed-case',result=node('div');result.className='chapter-result';result.append(this.icon(output,64,r.transform?'refined':undefined),node('div',r.transform?'Ngọc đã luyện hóa · giữ cùng một món':r.effect?'Hộp niêm cho một chuyến · giữ lại công cụ':`${this.itemName(output)} × ${r.produce[output]}`));detail.append(result);
   detail.append(node('h4','Nguyên liệu · đang có / cần'));
   for(const [id,n] of Object.entries(r.consume)){const row=node('div');row.className='chapter-material';row.dataset.sufficient=String((c.stock[id as MaterialId]??0)>=n!);row.append(this.icon(id,32),node('span',this.itemName(id)),node('b',`${c.stock[id as MaterialId]??0} / ${n}`));detail.append(row);}
   for(const [id,n] of Object.entries(r.keep)){const row=node('div');row.className='chapter-material';row.dataset.sufficient=String(id==='hn-training-jade'?c.jade!=='none':c.caseOwned);row.append(this.icon(id,32,id==='hn-training-jade'?(c.jade==='refined'?'refined':'raw'):undefined),node('span',`${this.itemName(id)} · ${id==='hn-training-jade'&&c.jade==='refined'?'đã luyện hóa':'giữ lại'}`),node('b',`${id==='hn-training-jade'?(c.jade!=='none'?1:0):(c.caseOwned?1:0)} / ${n}`));detail.append(row);}
   detail.append(node('h4','Điều kiện mở'));
   const req=node('ul');req.className='chapter-requirements';for(const key of r.requires)req.append(node('li',requirements[key]??key));detail.append(req);
   const reason=node('p');reason.className='chapter-readiness';reason.textContent=!this.o.online()?'Đang mất kết nối. Chờ khôi phục để luyện chế.':blocked==='already_complete'?'Món này đã được luyện hóa hoặc chế tạo.':blocked?reasons[blocked]:!prep?'Đến gặp người coi chuẩn bị tại Tư Vật Các để luyện chế.':'Đủ điều kiện · có thể luyện chế tại đây.';detail.append(reason);
   const actions=node('div');actions.className='chapter-actions';detail.append(actions);this.button(actions,this.pending?'Đang xác nhận…':'Luyện chế một lượt','craft',{recipe:r.id},prep&&!blocked);
   if(r.transform){if(c.accepted.includes('HN08')&&!c.facts.includes('hn-guard-method'))this.button(actions,'Học phương pháp hộ thân','interact',{node:'guard-method'},prep);if(c.jade==='refined')this.button(actions,c.jadeEquipped?'Ngọc đã trang bị':'Trang bị ngọc','equip_jade',{},c.scene==='hub'&&!c.jadeEquipped);}
   if(r.effect)detail.append(node('small','Hủy trước khởi hành hoàn mực một lần. Đã khởi hành không hoàn; kết thúc chuyến gỡ niêm và giữ hộp.'));
   if(r.id==='vh-recipe-seal')jump('Chuẩn bị chuyến mang mẫu →','preparation');
  }else{
   layout.classList.add('chapter-prep-layout');detail.append(node('span','MỐC TU LUYỆN & XUẤT HÀNH'),node('h3','Chuẩn bị trước khi đi'));
   const service=(title:string,copy:string)=>{const card=node('section');card.className='chapter-service';card.append(node('h4',title),node('p',copy));detail.append(card);return card;};
   if(s?.milestone==='M01'){const card=service('Xác nhận M02','Hoàn thành HN05 và đạt tầng 3, sau đó gặp người hướng dẫn vận khí.');this.button(card,'Xác nhận mốc M02','confirm_m02',{},cult&&c.completed.includes('HN05')&&s.level===3);}
   const jade=service('Ngọc hộ thân',c.jade==='none'?'Nhận phôi khi nhận HN08.':c.jade==='raw'?'Phôi chưa luyện hóa. Học phương pháp tại người coi chuẩn bị rồi mở bàn luyện ngọc.':c.jadeEquipped?'Đã trang bị · G dùng hộ thân trong bài đang chạy.':'Ngọc đã luyện hóa, có thể trang bị.');
   if(c.jade==='refined')this.button(jade,c.jadeEquipped?'Đã trang bị':'Trang bị ngọc','equip_jade',{},c.scene==='hub'&&!c.jadeEquipped);
   if(c.accepted.includes('EX03')&&!c.completed.includes('EX03')){const card=service('Chuyến mang mẫu',c.trip==='none'?'Chuẩn bị tại người coi chuẩn bị. Có thể chọn tuyến thủ công hoặc dùng hộp niêm.':`${c.trip==='ready'?'Chuyến đã chuẩn bị':'Chuyến đang thực hiện'} · ${c.sealed?'Hộp đã niêm':'Chưa niêm hộp'}`);this.button(card,'Chuẩn bị chuyến EX03','prepare',{quest:'EX03'},prep&&c.trip==='none');if(c.trip!=='none')this.button(card,'Hủy chuyến / gỡ niêm','trip_cancel');}
   if(c.completed.includes('HN09')){const card=service('Báo cáo người giữ tuyến','Tùy chọn: kiểm chứng rồi giúp khắc phục, hoặc gửi bảng dữ kiện. Không chặn khảo nghiệm và không đổi thành quả.');this.button(card,'Giúp khắc phục rồi kiểm','report',{choice:'test'},prep);this.button(card,'Gửi bảng đối chứng','report',{choice:'record'},prep);if(c.report!=='none'){const response=node('p',CHAPTER_REPORT_RESPONSES[c.report]);response.dataset.chapterReport=c.report;card.append(response);}}
  }
  if(this.tab!=='preparation')layout.append(list);layout.append(detail);
  const bag=node('aside');bag.className='chapter-bag';bag.dataset.scroll='bag';bag.append(node('h3','Vật liệu trong túi'),node('small','Nguồn hữu hạn · nhận từ đạo trình'));
  const held=Object.entries(c.stock).filter(([,n])=>n);for(const [id,n] of held){const row=node('div');row.className='chapter-material';row.append(this.icon(id,32),node('span',this.itemName(id)),node('b',String(n)));bag.append(row);}if(!held.length)bag.append(node('p','Chưa có nguyên liệu. Hoàn thành HN05/HN06 hoặc thu nhận ở EX01–EX02.'));layout.append(bag);
  for(const [key,top,left] of scrolls)this.body.querySelector<HTMLElement>(`[data-scroll="${key}"]`)?.scrollTo(left,top);this.body.scrollTop=bodyTop;
  if(active){const target=this.body.querySelector<HTMLElement>(`[data-ui-focus="${active}"]`);const fallback=this.body.querySelector<HTMLButtonElement>('.chapter-select[aria-pressed="true"]')??this.nav.querySelector<HTMLButtonElement>('[aria-selected="true"]');(target&&!(target instanceof HTMLButtonElement&&target.disabled)?target:fallback)?.focus({preventScroll:true});}
 }
 private itemName(id:string){return id==='recovery'?'Vật tư hồi phục':CHAPTER_ITEMS[id as keyof typeof CHAPTER_ITEMS]?.name??id;}
 private icon(id:string,size:32|64,state?:string){const img=node('img');img.width=img.height=size;img.alt='';img.src=id==='recovery'?'/assets/character-ui-v2/lotus-pill.webp':`/assets/van-ngoc-gameplay-v1/${id==='hn-training-jade'?`hn-training-jade-${state??(this.view?.progress.jade==='raw'?'raw':'refined')}`:id}-${size}.png`;return img;}
 diagnostics(){return {view:this.view,pending:this.pending,modal:this.modal,inActivity:this.inActivity,tab:this.tab,selectedQuest:this.selectedQuest,selectedRecipe:this.selectedRecipe};}
 dispose(){this.dialog.remove();this.dock.remove();this.launch.remove();}
}
