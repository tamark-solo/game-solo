import './chapter-ui.css';
import type {Room} from '@colyseus/sdk';
import type {CourtyardState} from '@shared/protocol/courtyard-state';
import {CHAPTER_ITEMS,CHAPTER_QUESTS,CHAPTER_RECIPES,CHAPTER_REWARDS,CHAPTER_TITLES,CHAPTER_BRIEFS,CHAPTER_REPORT_RESPONSES,CHAPTER_WORLD,chapterGate,chapterRecipeBlocker,initialChapter,type ChapterCommand,type ChapterQuestId,type ChapterResult,type ChapterView,type MaterialId} from '@shared/chapter';
import {SECT_STATIONS,nearStation,type SectView,type StationId} from '@shared/sect';
import type {Position} from '@shared/world/types';
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
const station=(q:ChapterQuestId):StationId=>q==='HN07'?'cultivation':['HN05','HN09','HN10'].includes(q)?'training':['HN11','HN12'].includes(q)?'guide':'preparation';
const reasons:Record<string,string>={distance:'Tới gần đúng NPC hoặc điểm tương tác rồi thử lại.',prerequisite:'Còn thiếu nhiệm vụ hoặc mốc trước đó.',accepted:'Nhận nhiệm vụ tại NPC trước.',proof:'Cần hoàn tất bài và quay về xác nhận.',level9:'Bài đã lưu. Hãy tích lũy và xác nhận tầng 9 tại người hướng dẫn vận khí.',m02:'Hoàn thành HN05 và xác nhận tầng 3 trước.',materials:'Chưa đủ nguyên liệu. Các nguồn EX01/EX02 chỉ nhận một lần.',recipe_locked:'Công thức chưa mở hoặc chuyến chưa sẵn sàng.',jade:'Luyện hóa và trang bị ngọc trước.',cooldown:'Đang hồi, hãy đợi rồi thử lại.',resource:'Chưa đủ linh lực.',guard_unavailable:'Cần ngọc đã luyện hóa/trang bị và lượt đang chạy.',combat:'Kết thúc bài đang chạy trước.',sample_action:'Đứng đúng điểm và thực hiện bước được hướng dẫn.',stable:'Đứng yên tại dấu này 2 giây; tuyến thủ công đi A trước B.',route:'Đi qua dấu trên tuyến rồi tới điểm giao mẫu.',seal:'Niêm hộp tại NPC chuẩn bị trước khi chọn tuyến ngắn.',case:'Cần chế Hộp giữ khí trước.',samples:'Lấy sợi và ngọc trước khi sơ chế.',observations:'Quan sát A+B hoặc đọc Định Lưu Bàn tại A trước.',compass:'Chưa có Định Lưu Bàn.',save:'Chưa lưu được thao tác. Kiểm tra trạng thái rồi thử lại.',proof_saved:'Kết quả bài đã lưu. Bạn có thể quay về xác nhận.',already_complete:'Đã ghi nhận trước đó.',request_reused:'Mã thao tác đã dùng cho nội dung khác.',trip:'Chuẩn bị chuyến tại NPC, rồi chọn tuyến khi tới ngoại vi.'};
interface Options {room:()=>Room<CourtyardState>|undefined;position:()=>Position;sect:()=>SectView|undefined;online:()=>boolean;focus:()=>void;clear:()=>void;feedback:(s:string)=>void;select:(id:string)=>void;changed:()=>void}
export class ChapterUI {
 view?:ChapterView;
 private attached=new WeakSet<object>();
 private dock=node('aside');private launch=node('button','H · Nhập môn / Luyện chế');private dialog=node('dialog');private body=node('div');private message=node('p');private signature='';private dockSignature='';private pending='';private sentAt=0;
 private compass=true;
 private pendingCommand?:ChapterCommand;
 constructor(private o:Options){
  this.dock.className='chapter-dock';this.dock.hidden=true;this.launch.className='chapter-launch';this.launch.type='button';
  this.dialog.className='chapter-dialog';this.dialog.setAttribute('aria-label','Nhập môn và luyện chế');
  const header=node('header'),close=node('button','Đóng');close.type='button';close.addEventListener('click',()=>this.dialog.close());header.append(node('h2','Nhập môn · Nguyên liệu · Luyện chế'),close);
  this.message.setAttribute('role','status');this.dialog.append(header,this.message,this.body);document.body.append(this.launch,this.dock,this.dialog);
  this.launch.addEventListener('click',()=>this.open());this.dialog.addEventListener('close',()=>{this.o.clear();this.o.focus();});
 }
 get modal(){return this.dialog.open;}
 get inActivity(){return !!this.view&&this.view.progress.scene!=='hub';}
 attach(room:Room<CourtyardState>){
  if(this.attached.has(room)){room.send('chapter:sync');return;}this.attached.add(room);
  room.onMessage('chapter:state',(view:ChapterView)=>{this.view=view;if(view.enemy?.hp)this.o.select(view.enemy.id);this.update();this.o.changed();});
  room.onMessage('chapter:result',(r:ChapterResult)=>{if(r.requestId===this.pending){if(r.ok&&['enter','leave'].includes(this.pendingCommand?.action??'')&&this.dialog.open)this.dialog.close();this.pending='';this.pendingCommand=undefined;}const text=r.ok?r.reason?reasons[r.reason]??'Đã lưu.':'Đã lưu thao tác.':reasons[r.reason??'']??'Chưa thể thực hiện lúc này.';this.message.textContent=text;this.o.feedback(text);this.update();});
  room.send('chapter:sync');
 }
 reset(){this.view=undefined;this.pending='';this.pendingCommand=undefined;this.signature=this.dockSignature='';this.dialog.close();this.update();}
 command(action:ChapterCommand['action'],extra:Partial<ChapterCommand>={}){
  if(this.pending||!this.o.online())return;const c={...extra,action,id:crypto.randomUUID()};this.pendingCommand=c;this.pending=c.id;this.sentAt=Date.now();this.o.clear();this.o.room()?.send('chapter:command',c);this.update();
 }
 basic(){this.o.room()?.send('chapter:basic',{id:crypto.randomUUID()});}
 open(){this.o.clear();this.signature='';this.update();if(!this.dialog.open)this.dialog.showModal();}
 interact(){
  if(!this.inActivity)return;
  const p=this.o.position(),n=CHAPTER_WORLD.nodes.filter(n=>Math.hypot(n.x-p.x,n.y-p.y)<=72).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!n){this.o.feedback('Tới gần dấu có tên rồi nhấn E. H mở hướng dẫn; có nút quay về bên phải.');return;}
  this.command('interact',{node:n.id,...(this.view?.progress.activity==='HN06'?{choice:'case'}:this.view?.progress.activity==='EX04'&&this.compass&&this.view.progress.compassOwned?{choice:'compass'}:{})});
 }
 private button(parent:HTMLElement,text:string,action:ChapterCommand['action'],extra:Partial<ChapterCommand>={},enabled=true){
  const b=node('button',text);b.type='button';b.disabled=!enabled||!!this.pending||!this.o.online();b.dataset.chapterAction=action;if(extra.quest)b.dataset.quest=extra.quest;if(extra.recipe)b.dataset.recipe=extra.recipe;
  b.addEventListener('click',()=>this.command(action,extra));parent.append(b);return b;
 }
 update(){
  if(this.pending&&Date.now()-this.sentAt>6000&&!this.message.querySelector('[data-chapter-retry]')){
   this.message.textContent='Chưa nhận xác nhận. Gửi lại cùng mã để tránh trừ nguyên liệu hai lần.';
   const retry=node('button','Gửi lại thao tác');retry.type='button';retry.dataset.chapterRetry='';retry.addEventListener('click',()=>{if(this.o.online()&&this.pendingCommand){this.o.room()?.send('chapter:command',this.pendingCommand);this.sentAt=Date.now();this.message.textContent='Đang kiểm tra thao tác đã gửi…';}});this.message.append(retry);
  }
  this.launch.hidden=!this.o.online();this.dock.hidden=!this.inActivity;
  const v=this.view,c=v?.progress??initialChapter(),position=this.o.position(),sect=this.o.sect();
  const signature=JSON.stringify([c.accepted,c.completed,c.facts,c.stock,c.jade,c.jadeEquipped,c.caseOwned,c.compassOwned,c.trip,c.sealed,c.checkpoint,c.report,c.scene,c.activity,v?.available,sect?.level,sect?.milestone,sect?.cultivation,this.pending,SECT_STATIONS.map(s=>nearStation(position,s.id)),this.o.online()]);
  if(signature!==this.signature){this.signature=signature;this.render();}
  const dockKey=JSON.stringify([c.activity,c.scene,v?.status,v?.stableReady,v?.prepared,Math.ceil(v?.enemy?.hp??0),Math.ceil(v?.enemy?.maxHp??0),c.checkpoint,c.trip,c.sealed,this.pending,this.o.online(),Math.ceil(Math.max(0,c.guardReadyAt-(v?.now??0))/1000)]);
  if(dockKey!==this.dockSignature){this.dockSignature=dockKey;this.dock.replaceChildren();if(v){
   this.dock.append(node('h3',`${c.activity} · ${c.activity==='none'?'Ngoại vi':CHAPTER_TITLES[c.activity]}`),node('p',v.hint));
   this.dock.append(node('p',v.status==='won'?'✓ Kết quả đạt đã được ghi':v.status==='failed'?'Chưa đạt · chuẩn bị để thử lại':v.status==='running'?`Đang chạy${v.enemy?` · Đối thủ ${Math.ceil(v.enemy.hp)}/${v.enemy.maxHp} HP`:''}`:'Điểm chuẩn bị · chưa bắt đầu'));
   if(c.activity==='HN10')this.dock.append(node('p',`Checkpoint ${c.checkpoint}/3 · mỗi pha chuẩn bị miễn phí.`));
   if(['HN05','HN07','HN08','HN09','HN10'].includes(c.activity)){
    if(v.status!=='running'&&!c.completed.includes('HN10')){this.button(this.dock,'Chuẩn bị / hồi đầy','prepare');this.button(this.dock,c.activity==='HN10'?`Bắt đầu pha ${c.checkpoint+1}`:'Bắt đầu bài','start');}
    if(v.status==='running')this.button(this.dock,`G · Hộ thân${c.guardReadyAt>v.now?` · ${Math.ceil((c.guardReadyAt-v.now)/1000)}s`:''}`,'guard',{},c.jadeEquipped&&c.guardReadyAt<=v.now);
   }
   if(c.activity==='EX03'&&c.trip==='ready'){this.button(this.dock,'Tuyến ổn định · thủ công','trip_start',{choice:'stable'});this.button(this.dock,'Tuyến nhiễu · hộp đã niêm','trip_start',{choice:'sealed'},c.sealed);}
   if(['HN06','HN07','EX03'].includes(c.activity))this.dock.append(node('p',v.stableReady?'✓ Nhịp đã ổn định · có thể thử/đánh':'Dấu ổn định: đứng yên 2 giây'));
   if(c.activity==='EX04'&&c.compassOwned){const b=node('button',this.compass?'E tại A dùng Định Lưu Bàn':'E quan sát thủ công');b.type='button';b.addEventListener('click',()=>{this.compass=!this.compass;this.dockSignature='';this.update();});this.dock.append(b);}
   this.button(this.dock,'Quay về Hằng Nhạc','leave');
  }}
 }
 private render(){
  const v=this.view,c=v?.progress??initialChapter(),p=this.o.position(),s=this.o.sect();this.body.replaceChildren();
  this.body.append(node('p',`Hằng Nhạc: HN01–HN12 · nguyên liệu/luyện chế: EX01–EX04. ${c.completed.length}/12 bước tiếp theo đã lưu. ${s?.milestone??'Chưa có mốc'} · ngưỡng ${s?.level??0}/15 · tích lũy ${s?.cultivation??0}/${chapterGate(c)}.`));
  if(!s?.lessons.hn04)this.body.append(node('p','Hoàn thành HN01–HN04 với NPC trước. Nhật ký J chỉ đường tới bốn khu trong map.'));
  const questGrid=node('div');questGrid.className='chapter-quests';this.body.append(questGrid);
  for(const q of CHAPTER_QUESTS){
   const card=node('section'),st=SECT_STATIONS.find(n=>n.id===station(q))!,near=c.scene==='hub'&&nearStation(p,st.id),complete=c.completed.includes(q),taken=c.accepted.includes(q),available=v?.available.includes(q);
   card.append(node('h3',`${complete?'✓ ':''}${q} · ${CHAPTER_TITLES[q]}`),node('p',`${st.name} (${st.x}, ${st.y}) · ${complete?'Đã lưu':taken?'Đang thực hiện':available?'Có thể nhận':'Chưa đủ điều kiện'}`));
   if(taken||available)card.append(node('p',CHAPTER_BRIEFS[q]));
   if(!complete){
    if(!taken)this.button(card,'Nhận nhiệm vụ','accept',{quest:q},near&&!!available);
    else{
     if(!['HN11','HN12'].includes(q))this.button(card,q==='HN10'?'Vào khảo nghiệm':'Tới ngoại vi','enter',{quest:q},near);
     if(q!=='HN10')this.button(card,`Xác nhận${CHAPTER_REWARDS[q]?` · +${CHAPTER_REWARDS[q]} tích lũy`:''}`,'confirm',{quest:q},near&&(['HN11','HN12'].includes(q)||c.facts.includes(`${q}-proof`)));
    }
   }
   questGrid.append(card);
  }
  const prep=c.scene==='hub'&&nearStation(p,'preparation'),cult=c.scene==='hub'&&nearStation(p,'cultivation');
  const milestones=node('section');milestones.append(node('h3','Mốc và chuẩn bị'));
  this.button(milestones,'Xác nhận M02 sau HN05 / ngưỡng 3','confirm_m02',{},cult&&c.completed.includes('HN05')&&s?.level===3&&s.milestone==='M01');
  this.button(milestones,'Nhận biết phương pháp hộ thân','interact',{node:'guard-method'},prep&&c.accepted.includes('HN08'));
  this.button(milestones,'Trang bị ngọc đã luyện hóa','equip_jade',{},c.scene==='hub'&&c.jade==='refined'&&!c.jadeEquipped);
  this.button(milestones,'Chuẩn bị chuyến mang mẫu EX03','prepare',{quest:'EX03'},prep&&c.accepted.includes('EX03')&&!c.completed.includes('EX03'));
  this.button(milestones,'Hủy chuyến / niêm hộp','trip_cancel',{},c.trip!=='none');
  if(c.completed.includes('HN09')){
   milestones.append(node('p','Báo cáo tùy chọn: đối chứng trước, hoặc giúp khắc phục rồi kiểm chứng. Có thể để sau; không thay thưởng hoặc chặn khảo nghiệm.'));
   this.button(milestones,'Giúp khắc phục trước, vừa làm vừa kiểm','report',{choice:'test'},prep);this.button(milestones,'Đối chứng trước, gửi bảng dữ kiện','report',{choice:'record'},prep);
   if(c.report!=='none'){const response=node('p',CHAPTER_REPORT_RESPONSES[c.report]);response.dataset.chapterReport=c.report;milestones.append(response);}
  }
  this.body.append(milestones);
  const recipes=node('section');recipes.append(node('h3','Luyện chế tại người coi chuẩn bị'),node('p','Mỗi lượt trừ đúng nguyên liệu hiện có. Hộp và bàn chế một lần; niêm hộp chỉ dùng cho một chuyến. Vật tư hồi phục vẫn dùng chung hành trang.'));
  const bag=node('p');bag.textContent=Object.entries(c.stock).filter(([,n])=>n).map(([id,n])=>`${CHAPTER_ITEMS[id as MaterialId].name}: ${n}`).join(' · ')||'Chưa có nguyên liệu.';recipes.append(bag);
  for(const r of CHAPTER_RECIPES){const row=node('div');row.className='chapter-recipe';row.append(node('p',Object.entries(r.consume).map(([id,n])=>`${n} ${CHAPTER_ITEMS[id as MaterialId].name}`).join(' + ')));
   const title={'hn-refine-training-jade':'Luyện ngọc hộ thân','vh-recipe-ink':'Pha mực dẫn khí','vh-recipe-recovery':'Chế vật tư hồi phục','vh-recipe-case':'Chế Hộp giữ khí','vh-recipe-compass':'Chế Định Lưu Bàn','vh-recipe-seal':'Niêm hộp cho chuyến'}[r.id]??r.id;
   const blocked=chapterRecipeBlocker(c,r),b=this.button(row,title,'craft',{recipe:r.id},prep&&!blocked);b.title=!prep?'Tới gần người coi chuẩn bị.':blocked?reasons[blocked]:'';
   row.append(node('small',blocked==='recipe_locked'?'Chưa mở theo tiến trình/chuyến':blocked==='already_complete'?'Đã chế/luyện hóa':blocked==='case'?'Cần Hộp giữ khí':blocked==='materials'?'Chưa đủ nguyên liệu':prep?'Có thể luyện chế':'Tới NPC chuẩn bị'));recipes.append(row);
  }
  this.body.append(recipes);
 }
 diagnostics(){return {view:this.view,pending:this.pending,modal:this.modal,inActivity:this.inActivity};}
 dispose(){this.dialog.remove();this.dock.remove();this.launch.remove();}
}
