import { HANG_NHAC } from '../../shared/hang-nhac';
import type { AvatarId } from '../../shared/profiles';
import { SECT_STATIONS, nearStation,
  type SectAction, type SectCommand, type SectResult, type SectView, type StationId } from '../../shared/sect';
import { sectRoute } from '../../shared/sect-route';
import { currentSectQuest, QUEST_STATUS_LABELS, sectQuests, type SectQuest } from '../../shared/sect-quests';
import { attachSafeIconFallback, checklist, QuestUI, renderRewardSlots, showG2LootToast } from './quest-ui';
import { attachFrameSurface } from './frame-surface';
import type { Position } from '@shared/world/types';
import { chapterGate, initialChapter, readG2State, type ChapterQuestId } from '@shared/chapter';
import { daoUiSvg, questCategoryMeta, questSealStampSvg } from './ui/dao-quest-icons';
import { nearbyLifeNpc, nearLifeNpc, npcLifeAvailable, npcLore, npcStationName, type HangNhacNpc, type NpcLifeContext } from './npc-life';

const element=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string):HTMLElementTagNameMap[K]=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
const STATION_PORTRAITS: Record<StationId, string> = {
  guide: '/assets/g2-items/npc-tran-duy.png',
  cultivation: '/assets/g2-items/npc-diep-tinh.png',
  training: '/assets/g2-items/npc-ta-kiem-son.png',
  preparation: '/assets/g2-items/npc-bach-chi.png',
};
const STATION_ROLES: Record<StationId, { title: string; realm: string }> = {
  guide: { title: 'Chấp Sự Tiếp Dẫn Ngoại Môn', realm: 'Trúc Cơ Sơ Kỳ' },
  cultivation: { title: 'Chấp Sự Linh Điền & Tụ Khí Đài', realm: 'Trúc Cơ Trung Kỳ' },
  training: { title: 'Chấp Sự Thực Chiến & Kiếm Trận', realm: 'Trúc Cơ Hậu Kỳ' },
  preparation: { title: 'Đan Dược Đường · Chấp Sự Hộ Đạo', realm: 'Trúc Cơ Sơ Kỳ' },
};
const reasons:Record<string,string>={ distance:'Tiến lại gần người hướng dẫn, trên cùng lối đi, rồi nhấn E.',profile:'Vào sân chung để lưu hành trình.',inactive:'Nhân vật chưa sẵn sàng.',
  combat:'Đợi thi triển và luyện thuật kết thúc rồi tiếp tục.',hn01:'Gặp người tiếp dẫn trước.',hn02:'Hoàn thành vòng vận khí và xác nhận mốc đầu trước.',
  cycle_start:'Chọn tiếp tục vòng vận khí trước.',phase:'Nhịp đã thay đổi. Hãy làm bước đang hiện.',settling:'Đứng yên đủ một nhịp rồi xác nhận.',
  understanding:'Linh lực được tiêu khi dùng thuật. Tu vi là tiến trình tích lũy dài hạn; hãy chọn lại.',cultivation:'Chưa đủ tích lũy cho ngưỡng tiếp.',
  gate:'Đã tới cổng nền 1–3. Cần bài bình cảnh để mở nền tiếp.',supplies:'Đã hết vật tư hồi phục.',full_hp:'HP đã đầy, vật tư được giữ lại.',cooldown:'Vật tư đang hồi.',
  hn03:'Hoàn thành bài đòn thường, Kiếm và Lôi trước.',target:'Chọn mục tiêu luyện còn sức bền thuộc về bạn.',
  basic_range:'Tiến lại gần mục tiêu; cần đứng trong tầm đánh và không có vật cản.',basic_cooldown:'Đòn thường đang hồi trong 0,8 giây.',
  basic_hit:'Đánh thường trúng mục tiêu · 10 sát thương · không tốn linh lực.',lesson_incomplete:'Bài còn thiếu thao tác hợp lệ; xem hướng dẫn đang hiện.',
  lesson_running:'Đang có vùng báo trước; đợi kết quả bài luyện rồi thử lại.',lesson_reward:'Đã đánh trúng Khôi Lỗi Rạn Ngọc · nhận 80 Tu vi & sẵn sàng đột phá Ngưng Khí Tầng 3!',
  resource:'Chưa đủ linh lực cho Phong; đợi hồi tự nhiên rồi thử lại.',skill_cooldown:'Phong đang hồi; đợi hết cooldown rồi thử lại.',blocked:'Chưa có khoảng trống hợp lệ cho bài luyện.',
  save:'Chưa lưu được kết quả. Hãy thử lại; phần thưởng chưa cấp.',request_reused:'Mã thao tác đã được dùng cho nội dung khác.',invalid:'Thao tác không hợp lệ.' };
interface UIOptions { send:(command:SectCommand)=>void; sendChapter?:(node:string,choice?:string)=>void; avatar:()=>AvatarId; position:()=>Position; online:()=>boolean; connectionMessage?:()=>string|undefined; mapBackground?:()=>string; clock:()=>number; focus:()=>void; training:()=>void; enter:()=>void;chapter?:(station:StationId)=>void; chapterQuest?:(quest:ChapterQuestId)=>void; navigate?:(station:StationId)=>void; npcContext?:()=>NpcLifeContext; }
export class SectUI {
  view?:SectView;
  private dialog=document.getElementById('sect-dialog') as HTMLDialogElement;
  private body=document.getElementById('sect-body')!;
  private title=document.getElementById('sect-title')!;
  private message=document.getElementById('sect-message')!;
  private notice=document.getElementById('sect-feedback')!;
  private panel=document.getElementById('sect-objective')!;
  private interaction=document.getElementById('interact') as HTMLButtonElement;
  private station?:StationId;
  private loreNpc?:HangNhacNpc;
  private loreProfile?:string;
  private destination?:StationId;
  private signature='';
  private pending='';
  private pendingAt=0;
  private pendingAction?:SectAction;
  private playerDot?:HTMLElement;
  private quests:QuestUI;
  private actions?:HTMLElement;
  constructor(private options:UIOptions){
    this.quests=new QuestUI({
      journal:()=>this.journal(),
      guide:()=>this.guide(),
      onSelectQuest:(quest)=>{
        this.destination=quest.stationId;
        this.refreshJournalMap();
      },
      onPrimaryQuestAction:(quest)=>{
        if(!this.options.online()){this.dialog.close();this.options.enter();return;}
        if(quest.status==='ready'&&quest.id!=='VG01'){
          this.dialog.close();
          this.options.sendChapter?.('g2-act',`complete_${quest.id}`);
          return;
        }
        if(quest.status==='active'&&quest.id!=='VG01'){
          this.dialog.close();
          this.options.sendChapter?.('g2-act',`enter_${quest.id}`);
          return;
        }
        this.dialog.close();
        if(!nearStation(this.options.position(),quest.stationId)&&this.options.navigate){
          this.options.navigate(quest.stationId);
          return;
        }
        this.command('talk',{stationId:quest.stationId});
      },
      onOpenChapter:(quest)=>{
        this.dialog.close();
        if(this.options.chapterQuest&&quest.chapterId)this.options.chapterQuest(quest.chapterId);
        else this.options.chapter?.(quest.stationId);
      },
    });
    this.interaction.addEventListener('click',()=>this.interact());
    document.getElementById('sect-close')!.addEventListener('click',()=>this.dialog.close());
    document.getElementById('lesson-retry')!.addEventListener('click',()=>this.command('lesson_start',{lesson:this.view?.lessons.active==='arts'?'arts':'avoid'}));
    document.getElementById('lesson-stop')!.addEventListener('click',()=>this.command('lesson_stop'));
    this.dialog.addEventListener('close',()=>{this.station=undefined;this.loreNpc=undefined;this.loreProfile=undefined;this.signature='';this.feedback('');this.options.focus();});
  }
  get modal():boolean{return this.dialog.open;}
  private offlineMessage():string{return this.options.connectionMessage?.()??'Chọn “Vào sân chung” để nói chuyện với NPC và lưu hành trình.';}
  private feedback(text:string):void {
    this.message.textContent=text;
    this.notice.textContent=this.modal?'':text;
    this.notice.hidden=this.modal||!text;
  }
  private command(action:SectAction,extra:Partial<SectCommand>={}):void {
    if(this.pending)return;
    if(!this.options.online()){this.feedback(this.offlineMessage());return;}
    const command={...extra,id:crypto.randomUUID(),action};this.pending=command.id;this.pendingAt=Date.now();this.pendingAction=action;
    this.feedback(action==='talk'?'Đang mở đối thoại…':'Đang ghi nhận…');
    try {this.options.send(command);} catch {this.pending='';this.feedback('Chưa gửi được thao tác. Kiểm tra kết nối rồi nhấn E để thử lại.');}
    this.update();
  }
  reset():void {this.view=undefined;this.pending='';this.destination=undefined;this.signature='';if(this.dialog.open)this.dialog.close();this.feedback('');this.update();}
  state(view:SectView):void {
    const prevView=this.view;
    if(prevView?.profileId!==view.profileId)this.destination=undefined;
    const previous=prevView&&this.objective();
    const next=currentSectQuest(sectQuests(view));
    if(prevView&&prevView.profileId===view.profileId){
      if(!prevView.hn01&&view.hn01){
        showG2LootToast(
          'VG01 (Bước 1/3) · Đã Nhặt Châu Đá Ngũ Vân!',
          'Thức tỉnh Thiên Nghịch Châu Mốc I · Tiếp theo: Tìm Diệp Tĩnh tại Tụ Khí Đài.',
          [{ id: 'g2-bead', name: 'Châu Đá Ngũ Vân (Mốc I)', icon: '/assets/g2-items/bead.png', count: 'Mốc I', rarity: 'artifact' }],
          '/assets/g2-items/npc-tran-duy.png',
        );
      } else if(!prevView.hn02&&view.hn02){
        showG2LootToast(
          'VG01 (Bước 2/3) · Khai Mở Khí Hải & Lĩnh Kiếm Linh!',
          'Nhận Thanh Phong Linh Kiếm (Mốc I) · Tiếp theo: Tìm Tạ Kiếm Sơn thử kiếm trên Khôi Lỗi!',
          [
            { id: 'wood-sword', name: 'Thanh Phong Linh Kiếm (Mốc I)', icon: '/assets/g2-items/sword.png', count: 'Mốc I', rarity: 'artifact' },
            { id: 'vh-clear-water', name: 'Lộ Thủy Ngũ Vân', icon: '/assets/van-ngoc-gameplay-v1/vh-clear-water-64.png', count: '×2', rarity: 'material' },
          ],
          '/assets/g2-items/npc-diep-tinh.png',
        );
      } else if(!(prevView.lessons.hn03||prevView.lessons.basic)&&(view.lessons.hn03||view.lessons.basic)&&view.level<3){
        showG2LootToast(
          'VG01 (Bước 3/3) · Đã Kích Phá Khôi Lỗi Rạn Ngọc!',
          'Nhấn E tại Tạ Kiếm Sơn (hoặc nút Nhiệm vụ) để đột phá Ngưng Khí Tầng 3 & mở Hồi II (VG02)!',
          [{ id: 'ngung-khi-quyet', name: 'Ngưng Khí Quyết (Tầng 3)', icon: '/assets/g2-items/ngung-khi-quyet.png', count: 'Tầng 3', rarity: 'realm' }],
          '/assets/g2-items/npc-ta-kiem-son.png',
        );
      } else if(previous&&previous.id!==next.id){
        showG2LootToast(
          `Viên Mãn ${previous.id} · ${previous.title}`,
          `Đã nhận Đạo Quả & tự động nối mạch sang ${next.id}: ${next.title}`,
          previous.rewardItems,
          previous.portrait,
        );
      }
    }
    if(previous&&(previous.id!==next.id||previous.stationId!==next.stationId)){this.destination=undefined;if(view.profileId===prevView?.profileId)this.feedback(`Tiếp theo: ${next.id} · ${next.title}`);}
    this.view=view;this.update();
  }
  result(result:SectResult):void {
    const start=result.requestId===this.pending&&this.pendingAction==='lesson_start';
    if(result.requestId===this.pending||!result.requestId)this.pending='';
    if(start&&result.ok&&this.dialog.open)this.dialog.close();
    if(result.stationId&&result.ok){this.station=result.stationId;this.signature='';if(!this.dialog.open)this.dialog.showModal();}
    this.feedback(result.ok?result.duplicate?'Kết quả đã lưu trước đó.':result.reason==='already_complete'?'Thành quả đã được ghi nhận.':reasons[result.reason??'']??'Đã ghi nhận.':reasons[result.reason??'']??'Chưa thể thực hiện lúc này.');
    this.update();
  }
  private objective():SectQuest {return currentSectQuest(sectQuests(this.view));}
  private guide():void {
    if(this.modal)return;
    if(!this.options.online()){this.options.enter();return;}
    const goal=this.objective(),pos=this.options.position();
    if(!nearStation(pos,goal.stationId)&&this.options.navigate){
      this.options.navigate(goal.stationId);
      return;
    }
    if(nearStation(pos,goal.stationId)){
      this.command('talk',{stationId:goal.stationId});
      return;
    }
    if(this.options.chapterQuest)this.options.chapterQuest(goal.chapterId??'HN05');
    else if(this.options.chapter)this.options.chapter(goal.stationId);
    else this.journal();
  }
  basicAttack(targetId:string):void {this.command('basic_attack',{targetId});}
  updateNpcLife():void {
    if(!this.loreNpc)return;
    const context=this.options.npcContext?.();
    if(!context||!npcLifeAvailable(context)||context.profileId!==this.loreProfile||!nearLifeNpc(context.position,this.loreNpc)){
      this.loreNpc=undefined;this.loreProfile=undefined;if(this.dialog.open)this.dialog.close();
    }
  }
  update():void {
    this.updateNpcLife();
    const online=this.options.online(),position=this.options.position(),now=this.options.clock(),goal=this.quests.update(this.view,online,this.options.avatar());
    this.dialog.dataset.pending=String(!!this.pending);
    this.body.setAttribute('aria-busy',String(!!this.pending));
    if(this.pending&&(!online||Date.now()-this.pendingAt>5000)){this.pending='';this.feedback('Chưa nhận xác nhận. Kiểm tra kết nối và trạng thái đã lưu trước khi tiếp tục.');}
    const nearby=SECT_STATIONS.filter(s=>nearStation(position,s.id)).sort((a,b)=>Math.hypot(a.x-position.x,a.y-position.y)-Math.hypot(b.x-position.x,b.y-position.y))[0];
    const context=this.options.npcContext?.(),lore=context?nearbyLifeNpc(context):undefined;
    const targetNpcShort=npcStationName(goal.stationId).split(' · ')[0]!;
    const isNearGoal=nearStation(position,goal.stationId);
    const daoAn=document.getElementById('game-shell')?.dataset.uiDesign==='dao-an-v3';
    document.getElementById('quest-title')!.textContent=daoAn?goal.title.replace(/^Hồi\s+[IVXLCDM]+:\s*/iu,''):`${goal.id} · ${goal.title}`;
    document.getElementById('quest-hint')!.textContent=online
      ?nearby
        ?`Đang đứng cạnh ${npcStationName(nearby.id)} · Nhấn E (hoặc nút bên dưới) để đàm đạo & thực hiện nhiệm vụ`
        :lore
          ?`E · nói chuyện với ${lore.name} · ${lore.role}`
          :`Bấm nút bên dưới để tự tìm đường tới ${npcStationName(goal.stationId)} · Hoặc nhấn H mở Mệnh Kiếp Chí`
      :this.options.connectionMessage?.()??'Vào sân chung để bắt đầu hoặc tiếp tục bản lưu.';
    if(online){
      const guideBtn=document.getElementById('quest-guide')!;
      if(!isNearGoal){
        guideBtn.textContent=`Tầm lộ tới ${targetNpcShort} (${goal.id})`;
      }else if(goal.id==='VG01'){
        guideBtn.textContent=!this.view?.hn01
          ?'Đàm đạo Trần Duy · Nhặt Châu Đá (E)'
          :!this.view?.hn02
            ?'Đàm đạo Diệp Tĩnh · Lĩnh Kiếm Linh (E)'
            :(this.view?.lessons.hn03||this.view?.lessons.basic)
              ?'Đột Phá Ngưng Khí Tầng 3 · Hoàn Tất VG01 (E)'
              :'Đàm đạo Tạ Kiếm Sơn · Thử Kiếm 2D (E)';
      }else if(goal.status==='ready'){
        guideBtn.textContent=`Lĩnh Đạo Quả ${goal.id} tại ${targetNpcShort} (E)`;
      }else{
        guideBtn.textContent=`Gặp ${targetNpcShort} · Vào Bí Cảnh ${goal.id} (E)`;
      }
    }
    this.interaction.disabled=!online||(!nearby&&!lore)||!!this.pending;
    this.interaction.textContent=nearby?`E · Đàm đạo ${npcStationName(nearby.id).split(' · ')[0]}`:lore?`E · Trò chuyện ${lore.name}`:'E · Tới gần NPC';
    if(daoAn){
      const guide=document.getElementById('quest-guide')!;
      guide.title=guide.textContent??'';guide.setAttribute('aria-label',guide.title);
      guide.textContent=!isNearGoal?'Tự tìm đường':goal.status==='ready'?'Nhận đạo quả':'Thực hiện';
      this.interaction.title=this.interaction.textContent;this.interaction.setAttribute('aria-label',this.interaction.title);
      this.interaction.textContent=nearby?'E · Đàm đạo':lore?'E · Trò chuyện':'E · Tương tác';
      document.getElementById('journal')!.textContent='Đạo thư';
    }
    this.panel.dataset.quest=goal.id;
    const panel=document.getElementById('lesson-panel')!;
    panel.hidden=true;
    if(this.modal&&this.station){
      const v=this.view,signature=JSON.stringify([this.station,v?.hn01,v?.hn02,v?.activity,v?.level,v?.milestone,v?.chapter?.completed,v?.chapter?.facts,v?.supplies,v?.lessons]);
      if(this.signature!==signature){this.signature=signature;this.renderStation();}
      this.body.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>{
        const action=button.dataset.action as SectAction;
        button.disabled=!!this.pending||!online||action!=='activity_stop'&&!!v?.practising||
          action==='use_recovery'&&(!v?.supplies||v.nextRecoveryAt>now||v.hp>=100);
        button.title=v?.practising?'Đợi thi triển kết thúc':action==='use_recovery'&&v?.hp===100?'HP đã đầy · giữ vật tư':'';
      });
      const activity=this.body.querySelector<HTMLElement>('[data-activity]');if(activity&&v)activity.textContent=online?'Đang tự động tụ Linh Lộ Nội Giới · 120 Tu vi/phút (Tầng nhỏ tự động thăng cấp)':'Đang mất kết nối · tạm dừng tích lũy';
      const recovery=this.body.querySelector<HTMLElement>('[data-recovery-timer]');if(recovery&&v)recovery.textContent=v.hp>=100?'HP đã đầy · giữ Hồi Xuân Đan':v.nextRecoveryAt>now?`Hồi Xuân Đan đang hồi · ${((v.nextRecoveryAt-now)/1000).toFixed(1)} giây`:v.supplies?'Sẵn sàng dùng':'Đã hết Hồi Xuân Đan';
      this.body.querySelectorAll<HTMLElement>('[data-cultivation]').forEach(node=>{node.textContent=String(v?.cultivation??0);});
    }
    if(this.playerDot){this.playerDot.style.left=`${position.x/HANG_NHAC.world.width*100}%`;this.playerDot.style.top=`${position.y/HANG_NHAC.world.height*100}%`;}
  }
  interact():void {
    if(this.modal||this.pending)return;
    if(!this.options.online()){this.feedback(this.offlineMessage());return;}
    const station=SECT_STATIONS.filter(s=>nearStation(this.options.position(),s.id)).sort((a,b)=>Math.hypot(a.x-this.options.position().x,a.y-this.options.position().y)-Math.hypot(b.x-this.options.position().x,b.y-this.options.position().y))[0];
    if(station){this.command('talk',{stationId:station.id});return;}
    const context=this.options.npcContext?.(),npc=context?nearbyLifeNpc(context):undefined;
    if(npc&&context?.view){this.showLore(npc,context);return;}
    this.guide();
  }
  private renderModalSystemTabs(activeMode:'npc'|'journal'):HTMLElement {
    const goal=this.objective();
    const activeStationId=this.station??goal.stationId;
    const npcShort=npcStationName(activeStationId).split(' · ')[0]!;
    const nav=element('nav');
    nav.className='dao-sect-tabbar';
    nav.setAttribute('aria-label','Hệ thống Tab Nhiệm Vụ & Đạo Đồ');

    const npcTab=element('button');
    npcTab.type='button';
    npcTab.className='dao-sect-tab';
    npcTab.dataset.active=String(activeMode==='npc');
    npcTab.innerHTML=`<span class="dao-tab-svg">${daoUiSvg('dialogue')}</span><span>Đàm Đạo · ${npcShort} (${goal.id})</span>`;
    npcTab.addEventListener('click',()=>{
      if(activeMode==='npc')return;
      if(nearStation(this.options.position(),activeStationId)){
        this.station=activeStationId;
        this.signature='';
        this.renderStation();
      }else if(this.options.navigate&&this.options.online()){
        this.dialog.close();
        this.options.navigate(activeStationId);
      }else{
        this.station=activeStationId;
        this.signature='';
        this.renderStation();
      }
    });

    const codexTab=element('button');
    codexTab.type='button';
    codexTab.className='dao-sect-tab';
    codexTab.dataset.active=String(activeMode==='journal');
    codexTab.innerHTML=`<span class="dao-tab-svg">${daoUiSvg('scroll')}</span><span>Thiên Mệnh Chi Quyển · 11 Hồi (J)</span>`;
    codexTab.addEventListener('click',()=>{
      if(activeMode==='journal')return;
      this.journal(goal.id);
    });

    nav.append(npcTab,codexTab);

    if(this.options.chapter){
      const innerTab=element('button');
      innerTab.type='button';
      innerTab.className='dao-sect-tab dao-sect-tab-inner';
      innerTab.dataset.chapterRoute=activeStationId;
      innerTab.innerHTML=`<span class="dao-tab-svg">${daoUiSvg('orb')}</span><span>Nội Giới & Đan Lô (H)</span>`;
      innerTab.addEventListener('click',()=>{
        this.dialog.close();
        this.options.chapter?.(activeStationId);
      });
      nav.append(innerTab);
    }
    return nav;
  }
  private showLore(npc:HangNhacNpc,context:NpcLifeContext):void {
    this.station=undefined;this.loreNpc=npc;this.loreProfile=context.profileId;this.signature='';this.playerDot=undefined;this.actions=undefined;
    this.title.textContent=`${npc.name} · ${npc.role}`;this.body.replaceChildren();this.feedback('');
    this.dialog.dataset.mode='lore';document.getElementById('sect-category')!.textContent=`HẰNG NHẠC · ${npc.zone.toLocaleUpperCase('vi-VN')}`;
    const card=element('section');
    card.className='dao-npc-dialogue-card';
    for(const line of npcLore(npc,context.view!)){
      const p=element('p',line);
      card.append(p);
    }
    this.body.append(card);
    this.dialog.showModal();
  }
  private button(text:string,action:SectAction,extra:Partial<SectCommand>={}):HTMLButtonElement {
    const button=element('button',text);button.type='button';button.dataset.action=action;button.addEventListener('click',()=>this.command(action,extra));(this.actions??this.body).append(button);return button;
  }
  private paragraph(text:string):void{this.body.append(element('p',text));}
  private renderStation():void {
    const s=SECT_STATIONS.find(s=>s.id===this.station)!,v=this.view,g2=readG2State(v),goal=this.objective();
    const catMeta=questCategoryMeta(goal.id);
    const roleMeta=STATION_ROLES[s.id];
    this.title.textContent=npcStationName(s.id);this.body.replaceChildren();this.playerDot=undefined;
    this.dialog.dataset.mode='npc';document.getElementById('sect-category')!.textContent=`HẰNG NHẠC · ${s.area.toLocaleUpperCase('vi-VN')}`;

    this.body.append(this.renderModalSystemTabs('npc'));

    const stageGrid=element('div');
    stageGrid.className='dao-npc-quest-stage';

    // Left / Top Card: NPC Speaker & Station Lore
    const npcCard=element('section');
    npcCard.className='dao-npc-dialogue-card';
    const npcHeader=element('div');
    npcHeader.className='dao-npc-header';
    const portrait=element('img');
    portrait.src=STATION_PORTRAITS[s.id]??goal.portrait;
    portrait.alt=npcStationName(s.id);
    portrait.width=portrait.height=52;
    portrait.className='dao-npc-portrait';
    attachSafeIconFallback(portrait);

    const npcMeta=element('div');
    npcMeta.className='dao-npc-meta';
    const roleRow=element('div');
    roleRow.className='dao-npc-role-row';
    const roleChip=element('span',roleMeta.title);
    roleChip.className='dao-npc-role-chip';
    const realmChip=element('span',roleMeta.realm);
    realmChip.className='dao-npc-realm-chip';
    roleRow.append(roleChip,realmChip);

    const playerRealmLine=element('small',`Đạo hữu: ${g2.realmLabel} · ${g2.stance.name} · Pháp Bảo [${g2.artifacts.sword.tier}/${g2.artifacts.banner.tier}/${g2.artifacts.chariot.tier}/${g2.artifacts.bead.tier}]`);
    playerRealmLine.className='dao-npc-player-summary';
    npcMeta.append(roleRow,playerRealmLine);
    npcHeader.append(portrait,npcMeta);
    npcCard.append(npcHeader);

    const voiceQuote=element('blockquote',`“${goal.voiceover}”`);
    voiceQuote.className='dao-npc-voice-quote';
    npcCard.append(voiceQuote);

    const speechBody=element('div');
    speechBody.className='dao-npc-speech-body';
    if(s.id==='guide'){
      const intro=element('p','Trần Duy: “Đạo đồ nghịch thiên bắt đầu từ Hẻm Vân Liệt. Châu Đá Ngũ Vân và Thanh Phong Linh Kiếm là căn cơ hộ mệnh của ngươi!”');
      intro.classList.add('station-intro');
      speechBody.append(intro);
    }else if(s.id==='cultivation'){
      const intro=element('p','Diệp Tĩnh: “Lộ thủy trong Thiên Nghịch Châu tự động tụ khí 120 Tu vi/phút. Khi chạm bình cảnh, hãy mở Nội Giới (H) để đột phá!”');
      intro.classList.add('station-intro');
      const gate=chapterGate(v?.chapter??initialChapter());
      const progress=element('p','Tu vi Nội Giới: '),value=element('b',String(v?.cultivation??0));
      value.dataset.cultivation='';
      progress.className='dao-telemetry-pill';
      progress.append(value,` / ${gate}`);
      const activity=element('p');
      activity.dataset.activity='';
      activity.className='dao-telemetry-pill';
      speechBody.append(intro,progress,activity);
    }else if(s.id==='training'){
      const intro=element('p','Tạ Kiếm Sơn: “Phím F đánh gần, phím 1 xuất Kiếm Linh, phím 2 triệu Hồn Phiên, phím 3 thúc Xạ Thần Xa, phím G mở Hộ Đạo!”');
      intro.classList.add('station-intro');
      speechBody.append(intro);
    }else{
      const intro=element('p',g2.noiGioi.liMuwanMessage);
      intro.classList.add('station-intro');
      const hpStatus=element('p',`HP: ${v?.hp??100}/100 · Hồi Xuân Đan: ${v?.supplies??0} viên (+30 HP).`);
      hpStatus.className='dao-telemetry-pill';
      const timer=element('p');
      timer.dataset.recoveryTimer='';
      timer.className='dao-telemetry-pill';
      speechBody.append(intro,hpStatus,timer);
    }
    npcCard.append(speechBody);

    // Right / Bottom Card: Active Quest Step & Reward Showcase
    const questBox=element('section');
    questBox.className='dao-active-quest-card';
    const sealWrap=element('div');
    sealWrap.className='dao-scroll-seal-wrap';
    sealWrap.innerHTML=questSealStampSvg(goal.status);
    questBox.append(sealWrap);

    const qRibbon=element('div');
    qRibbon.className='dao-active-quest-ribbon';
    qRibbon.style.cssText=`color:${catMeta.accentColor};border-color:${catMeta.borderColor};background:${catMeta.bgColor};`;
    qRibbon.innerHTML=`${catMeta.svg}<span>${goal.id} · ${catMeta.badgeText} · ${catMeta.realmText}</span>`;

    const qTitle=element('h4',`${goal.id} — ${goal.title}`);
    qTitle.className='dao-active-quest-title';

    const qStep=element('p');
    qStep.className='dao-active-quest-next';
    qStep.innerHTML=`${daoUiSvg('compass',13)}<span><strong>Chỉ lộ:</strong> ${goal.nextStep}</span>`;

    questBox.append(qRibbon,qTitle,qStep);

    const stepListWrap=element('div');
    stepListWrap.className='dao-active-quest-steps';
    const doneCount=goal.objectives.filter(o=>o.done).length;
    const stepHeader=element('div');
    stepHeader.className='dao-active-quest-subhead';
    stepHeader.innerHTML=`${daoUiSvg('sword',13)}<span>Đạo Tiêu (${doneCount}/${goal.objectives.length} bước)</span>`;
    stepListWrap.append(stepHeader,checklist(goal,undefined,true));
    questBox.append(stepListWrap);

    if(goal.rewardItems.length){
      const rHead=element('div');
      rHead.className='dao-active-quest-subhead';
      rHead.innerHTML=`${daoUiSvg('reward',13)}<span>Đạo Quả Thưởng (${goal.id})</span>`;
      questBox.append(rHead,renderRewardSlots(goal.rewardItems,true));
    }

    stageGrid.append(npcCard,questBox);
    this.body.append(stageGrid);

    this.actions=element('div');this.actions.className='dialog-actions dao-command-bar';
    const addChapterBtn=(label:string,iconSvg:string,nodeName:string,choice:string,primary=true,autoNav?:StationId)=>{
      const btn=element('button');
      btn.type='button';
      if(primary)btn.className='sect-chapter-route dao-primary-cta';
      btn.innerHTML=`<span class="dao-btn-svg">${iconSvg}</span><span>${label}</span>`;
      btn.addEventListener('click',()=>{
        this.dialog.close();
        this.options.sendChapter?.(nodeName,choice);
        if(autoNav&&this.options.navigate){
          window.setTimeout(()=>this.options.navigate?.(autoNav),420);
        }
      });
      this.actions!.append(btn);
    };

    if(goal.id==='VG01'){
      if(!v?.hn01){
        addChapterBtn('Nhặt Châu Đá Ngũ Vân (Bước 1/3)',daoUiSvg('sparkle',13),'g2-act','step1_VG01',true,'cultivation');
      }else if(!v?.hn02){
        addChapterBtn('Dẫn Khí & Lĩnh Thanh Phong Kiếm (Bước 2/3)',daoUiSvg('sparkle',13),'g2-act','step2_VG01',true,'training');
      }else{
        const artsDone=!!(v?.lessons.hn03||v?.lessons.basic);
        if(!artsDone){
          const fightBtn=element('button');
          fightBtn.type='button';fightBtn.className='sect-chapter-route dao-primary-cta';
          fightBtn.innerHTML=`<span class="dao-btn-svg">${daoUiSvg('sword',13)}</span><span>Triệu Hồi Khôi Lỗi Trên Sân 2D (Phím F / 1)</span>`;
          fightBtn.addEventListener('click',()=>this.command('lesson_start',{lesson:'arts'}));
          this.actions.append(fightBtn);
        }
        addChapterBtn(
          artsDone
            ?'Đột Phá Ngưng Khí Tầng 3 · Hoàn Tất VG01'
            :'Lĩnh Ngộ Nhanh · Hoàn Tất VG01',
          daoUiSvg('bolt',13),
          'g2-act',
          'complete_VG01',
          artsDone,
        );
      }
    }else if(goal.status==='ready'){
      addChapterBtn(`Lĩnh Đạo Quả ${goal.id} & Nối Mạch Auto-Chain`,daoUiSvg('reward',13),'g2-act',`complete_${goal.id}`,true);
    }else{
      addChapterBtn(`Vào Bí Cảnh 2D · ${goal.id}`,daoUiSvg('sword',13),'g2-act',`enter_${goal.id}`,true);
    }

    if(s.id==='training'){
      const button=element('button');
      button.type='button';
      button.innerHTML=`<span class="dao-btn-svg">${daoUiSvg('sword',13)}</span><span>Triệu Hồi Khôi Lỗi Luyện Chiêu</span>`;
      button.addEventListener('click',()=>this.command('lesson_start',{lesson:'arts'}));
      this.actions.append(button);
    }else if(s.id==='preparation'){
      this.button('Dùng Hồi Xuân Đan (+30 HP)','use_recovery');
    }

    const journalBtn=element('button');
    journalBtn.type='button';
    journalBtn.innerHTML=`<span class="dao-btn-svg">${daoUiSvg('scroll',13)}</span><span>Sổ Nhiệm Vụ (J)</span>`;
    journalBtn.addEventListener('click',()=>this.journal(goal.id));
    this.actions.append(journalBtn);

    if(this.actions.childElementCount)this.body.append(this.actions);
  }
  toggleJournal():void {if(this.dialog.open)this.dialog.close();else this.journal();}
  private mapPanel?:HTMLElement;
  private refreshJournalMap():void {
    if(!this.mapPanel||!this.mapPanel.isConnected)return;
    const focusedPin=(document.activeElement as HTMLElement)?.dataset.station;
    const goal=this.objective();
    const station=SECT_STATIONS.find(s=>s.id===(this.destination??goal.stationId))!;
    this.mapPanel.replaceChildren();
    attachFrameSurface(this.mapPanel);
    const mapHeading=element('h3');
    mapHeading.innerHTML=`<span class="dao-tab-svg">${daoUiSvg('compass',13)}</span><span>Hải Đồ · Hằng Nhạc</span>`;
    this.mapPanel.append(
      mapHeading,
      element('p',`Điểm đến: ${npcStationName(station.id).split(' · ')[0]} (${station.area})`),
    );
    const map=element('div');map.className='sect-minimap';map.style.backgroundImage=`url(${this.options.mapBackground?.()??HANG_NHAC.background.url})`;
    const route=sectRoute(this.options.position(),station);
    if(route){
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${HANG_NHAC.world.width} ${HANG_NHAC.world.height}`);
      const line=document.createElementNS(svg.namespaceURI,'polyline');line.setAttribute('points',route.map(p=>`${p.x},${p.y}`).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#ffda6a');line.setAttribute('stroke-width','12');svg.append(line);map.append(svg);
    }
    for(const s of SECT_STATIONS){
      const pin=element('button',s.id==='guide'?'1':s.id==='cultivation'?'2':s.id==='training'?'3':'4');pin.title=npcStationName(s.id);pin.className='sect-pin';pin.style.left=`${s.x/HANG_NHAC.world.width*100}%`;pin.style.top=`${s.y/HANG_NHAC.world.height*100}%`;
      pin.type='button';pin.dataset.station=s.id;pin.setAttribute('aria-label',npcStationName(s.id));pin.setAttribute('aria-pressed',String(s.id===station.id));
      pin.addEventListener('click',()=>{this.destination=s.id;this.refreshJournalMap();});map.append(pin);
    }
    this.playerDot=element('span');this.playerDot.className='sect-player-dot';this.playerDot.title='Vị trí của bạn';
    const pos=this.options.position();
    this.playerDot.style.left=`${pos.x/HANG_NHAC.world.width*100}%`;
    this.playerDot.style.top=`${pos.y/HANG_NHAC.world.height*100}%`;
    map.append(this.playerDot);this.mapPanel.append(map);
    const legend=element('div');legend.className='map-legend';
    for(const [index,s] of SECT_STATIONS.entries()){const label=element('span');label.append(element('b',String(index+1)),npcStationName(s.id).split(' · ')[0]!);legend.append(label);}this.mapPanel.append(legend);
    if(this.options.navigate){
      const navigate=element('button');
      navigate.type='button';navigate.className='sect-chapter-route dao-primary-cta';navigate.dataset.navigateStation=station.id;navigate.disabled=!route||!this.options.online();
      navigate.innerHTML=`<span class="dao-btn-svg">${daoUiSvg('compass',13)}</span><span>Tầm Lộ Tới ${npcStationName(station.id).split(' · ')[0]}</span>`;
      navigate.addEventListener('click',()=>{this.dialog.addEventListener('close',()=>this.options.navigate?.(station.id),{once:true});this.dialog.close();});
      this.mapPanel.append(navigate);
    }
    if(!route)this.mapPanel.append(element('p','Di chuyển ra khoảng trống để mở đường dẫn.'));
    if(focusedPin)this.mapPanel.querySelector<HTMLButtonElement>(`[data-station="${focusedPin}"]`)?.focus({preventScroll:true});
  }
  journal(questId?:SectQuest['id']):void {
    this.station=undefined;this.loreNpc=undefined;this.loreProfile=undefined;this.signature='';
    this.title.textContent='Mệnh Kiếp Chí';this.body.replaceChildren();this.feedback('');
    this.dialog.dataset.mode='journal';document.getElementById('sect-category')!.textContent='ĐẠO THƯ / CỐT TRUYỆN / CƠ DUYÊN';this.actions=undefined;
    this.body.append(this.renderModalSystemTabs('journal'));
    const goal=sectQuests(this.view).find(quest=>quest.id===questId)??this.objective();
    if(questId||!this.destination)this.destination=goal.stationId;
    const layout=element('div');layout.className='journal-layout';
    const left=element('div');left.className='journal-codex-col';this.quests.journal(left,this.view,questId);
    const right=element('section');right.className='journal-map-panel';right.setAttribute('aria-label','Bản đồ chỉ đường');
    this.mapPanel=right;
    layout.append(left,right);this.body.append(layout);
    this.refreshJournalMap();
    if(this.view?.activity)this.button('Dừng hoạt động nền','activity_stop');
    if(!this.dialog.open)this.dialog.showModal();this.update();
  }
  diagnostics():unknown{return {view:this.view,quests:sectQuests(this.view),stations:SECT_STATIONS,destination:this.destination,modal:this.modal,station:this.station,loreNpc:this.loreNpc?.id,
    online:this.options.online(),pending:this.pending?{requestId:this.pending,ageMs:Date.now()-this.pendingAt}:undefined,
    interactionDisabled:this.interaction.disabled,feedback:this.notice.textContent};}
}
