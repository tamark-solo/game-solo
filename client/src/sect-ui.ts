import { HANG_NHAC } from '../../shared/hang-nhac';
import type { AvatarId } from '../../shared/profiles';
import { CYCLE_PHASE_MS, CULTIVATION_GATE, LEVEL_THRESHOLDS, SECT_STATIONS, guideText, nearStation, progressionLabel,
  type SectAction, type SectCommand, type SectResult, type SectView, type StationId } from '../../shared/sect';
import { sectRoute } from '../../shared/sect-route';
import type { Position } from '@shared/world/types';

const element=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string):HTMLElementTagNameMap[K]=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
const reasons:Record<string,string>={ distance:'Tiến lại gần người hướng dẫn, trên cùng lối đi, rồi nhấn E.',profile:'Vào sân chung để lưu hành trình.',inactive:'Nhân vật chưa sẵn sàng.',
  combat:'Đợi thi triển và luyện thuật kết thúc rồi tiếp tục.',hn01:'Gặp người tiếp dẫn trước.',hn02:'Hoàn thành vòng vận khí và xác nhận mốc đầu trước.',
  cycle_start:'Chọn tiếp tục vòng vận khí trước.',phase:'Nhịp đã thay đổi. Hãy làm bước đang hiện.',settling:'Đứng yên đủ một nhịp rồi xác nhận.',
  understanding:'Linh lực được tiêu khi dùng thuật. Tu vi là tiến trình tích lũy dài hạn; hãy chọn lại.',cultivation:'Chưa đủ tích lũy cho ngưỡng tiếp.',
  gate:'Đã tới cổng nền 1–3. Cần bài bình cảnh để mở nền tiếp.',supplies:'Đã hết vật tư hồi phục.',full_hp:'HP đã đầy, vật tư được giữ lại.',cooldown:'Vật tư đang hồi.',
  hn03:'Hoàn thành bài đòn thường, Kiếm và Lôi trước.',target:'Chọn mục tiêu luyện còn sức bền thuộc về bạn.',
  basic_range:'Tiến lại gần mục tiêu trong 90 px; không đánh xuyên vùng chặn.',basic_cooldown:'Đòn thường đang hồi trong 0,8 giây.',
  basic_hit:'Đánh thường trúng mục tiêu · 10 sát thương · không tốn linh lực.',lesson_incomplete:'Bài còn thiếu thao tác hợp lệ; xem hướng dẫn đang hiện.',
  lesson_running:'Đang có vùng báo trước; đợi server xét kết quả rồi thử lại.',lesson_reward:'Bài đã xác nhận · nhận 80 tích lũy một lần.',
  resource:'Chưa đủ linh lực cho Phong; đợi hồi tự nhiên rồi thử lại.',skill_cooldown:'Phong đang hồi; đợi hết cooldown rồi thử lại.',blocked:'Chưa có khoảng trống hợp lệ cho bài luyện.',
  save:'Chưa lưu được kết quả. Hãy thử lại; phần thưởng chưa cấp.',request_reused:'Mã thao tác đã được dùng cho nội dung khác.',invalid:'Thao tác không hợp lệ.' };
interface UIOptions { send:(command:SectCommand)=>void; avatar:()=>AvatarId; position:()=>Position; online:()=>boolean; connectionMessage?:()=>string|undefined; clock:()=>number; focus:()=>void; training:()=>void; }
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
  private destination?:StationId;
  private signature='';
  private pending='';
  private pendingAt=0;
  private pendingAction?:SectAction;
  private playerDot?:HTMLElement;
  constructor(private options:UIOptions){
    this.interaction.addEventListener('click',()=>this.interact());
    document.getElementById('journal')!.addEventListener('click',()=>this.journal());
    document.getElementById('sect-close')!.addEventListener('click',()=>this.dialog.close());
    document.getElementById('lesson-retry')!.addEventListener('click',()=>this.command('lesson_start',{lesson:this.view?.lessons.active==='arts'?'arts':'avoid'}));
    document.getElementById('lesson-stop')!.addEventListener('click',()=>this.command('lesson_stop'));
    this.dialog.addEventListener('close',()=>{this.station=undefined;this.signature='';this.feedback('');this.options.focus();});
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
    if(this.view?.profileId!==view.profileId)this.destination=undefined;
    if(this.view&&!this.view.hn01&&view.hn01||this.view&&!this.view.hn02&&view.hn02)this.destination=undefined;
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
  private objective():{id:string;title:string;stationId:StationId;hint:string} {
    if(!this.view?.hn01)return {id:'HN01',title:'Bước vào Hằng Nhạc',stationId:'guide',hint:'Gặp người tiếp dẫn và nhận hướng dẫn.'};
    if(!this.view.hn02)return {id:'HN02',title:'Một vòng vận hành',stationId:'cultivation',hint:'Tới vườn thổ nạp, vận khí và xác nhận mốc đầu.'};
    if(!this.view.lessons.hn03)return {id:'HN03',title:'Vận dụng thuật nền',stationId:'training',hint:'Nhận bài tại sân luyện: đòn thường, Kiếm định hướng và Lôi theo mục tiêu.'};
    if(!this.view.lessons.hn04)return {id:'HN04',title:'Nhìn đòn mà tiến',stationId:'training',hint:'Ra khỏi vùng báo trước bằng đi bộ, rồi luyện Phong.'};
    return {id:'Tiếp theo',title:'HN05 · Ra khỏi sân luyện',stationId:'training',hint:'HN03–HN04 đã xong. Ngoại vi và HN05 chưa mở trong bản này.'};
  }
  basicAttack(targetId:string):void {this.command('basic_attack',{targetId});}
  update():void {
    const online=this.options.online(),position=this.options.position(),now=this.options.clock(),goal=this.objective();
    if(this.pending&&(!online||Date.now()-this.pendingAt>5000)){this.pending='';this.feedback('Chưa nhận xác nhận. Kiểm tra kết nối và trạng thái đã lưu trước khi tiếp tục.');}
    const destination=SECT_STATIONS.find(s=>s.id===(this.destination??goal.stationId))!;
    const nearby=SECT_STATIONS.filter(s=>nearStation(position,s.id)).sort((a,b)=>Math.hypot(a.x-position.x,a.y-position.y)-Math.hypot(b.x-position.x,b.y-position.y))[0];
    const horizontal=destination.x-position.x,vertical=destination.y-position.y;
    const compass=`${Math.abs(vertical)>50?vertical>0?'nam':'bắc':''}${Math.abs(horizontal)>50?horizontal>0?' đông':' tây':''}`.trim();
    document.getElementById('quest-title')!.textContent=`${goal.id} · ${goal.title}`;
    document.getElementById('quest-hint')!.textContent=online?nearby?`E · nói chuyện với ${nearby.name}`:`${destination.area}${compass?' · hướng '+compass:''} · xem đường trong Nhật ký`: this.options.connectionMessage?.()??'Vào sân chung để bắt đầu hoặc tiếp tục bản lưu.';
    document.getElementById('cultivation-summary')!.textContent=this.view?`${progressionLabel(this.options.avatar(),this.view.level)} · ${this.options.avatar()==='CHR-SITU-NAN'?'Tích lũy hồi phục':'Tu vi'} ${this.view.cultivation}`:'Hành trình riêng cho từng nhân vật';
    this.interaction.disabled=!online||!nearby||!!this.pending;
    this.interaction.textContent=nearby?'E · Nói chuyện':'E · Tới gần NPC';
    this.panel.dataset.quest=goal.id;
    const progress=this.view?.lessons,exercise=this.view?.lessonView,panel=document.getElementById('lesson-panel')!;
    panel.hidden=!progress||progress.active==='none';
    if(progress&&progress.active!=='none'){
      const warning=exercise?.kind==='avoid'&&exercise.status==='warning';
      document.getElementById('lesson-title')!.textContent=progress.active==='arts'?'HN03 · Vận dụng thuật nền':'HN04 · Nhìn đòn mà tiến';
      const arts=`Đòn thường ${progress.basic?'✓':'chưa'} · Kiếm ${progress.sword?'✓':'chưa'} · Lôi ${progress.thunder?'✓':'chưa'}. Chạm mục tiêu để ngắm; F / Đánh thường ở cự ly 90 px, 1 Kiếm, 2 Lôi.`;
      const avoidance=warning?`${exercise!.method==='walk'?'Đi bộ ra ngoài vòng, không dùng Phong':'Ngắm lối trống và dùng phím 3 / Phong ra ngoài vòng'} · còn ${Math.max(0,(exercise!.resolveAt!-now)/1000).toFixed(1)} giây · bài an toàn, không gây damage.`:
        progress.walk&&progress.wind?'Đã né bằng đi bộ và Phong. Quay lại người coi luyện thuật, nhấn E để xác nhận HN04.':
        exercise?.status==='failed'?'Chưa ra ngoài vòng đúng cách ở thời điểm đánh. Tới gần NPC luyện thuật rồi bấm thử lại; không mất HP hoặc thành quả đã lưu.':
        exercise?.status==='save_failed'?'Kết quả chưa lưu được. Tới gần NPC để thử lại; chưa nhận credit hoặc phần thưởng.':
        progress.walk?'Né đi bộ đã lưu. Tới gần NPC luyện thuật rồi bấm tiếp tục bài Phong.':'Tới gần NPC luyện thuật để tiếp tục hoặc thử lại bài né đi bộ.';
      document.getElementById('lesson-hint')!.textContent=!online?'Mất kết nối: attempt không tự hoàn tất. Credit đã lưu giữ nguyên; sau khi nối lại, tới NPC và bắt đầu lại phần còn thiếu.':
        progress.active==='arts'?progress.basic&&progress.sword&&progress.thunder?'Đã có đủ ba hit hợp lệ. Quay lại người coi luyện thuật, nhấn E để xác nhận HN03.':arts:avoidance;
      const retry=document.getElementById('lesson-retry') as HTMLButtonElement;
      retry.textContent=progress.active==='arts'?'Tiếp tục / tạo lại mục tiêu':'Tiếp tục / thử lại';
      retry.disabled=!online||!!this.pending||!!this.view?.practising||!!warning;
      (document.getElementById('lesson-stop') as HTMLButtonElement).disabled=!online||!!this.pending;
    }
    if(this.modal&&this.station){
      const v=this.view,signature=JSON.stringify([this.station,v?.hn01,v?.hn02,v?.foundation,v?.cycleStep,!!v?.cycleReadyAt,v?.activity,v?.level,v?.supplies,v?.lessons,v?.lessonView?.status]);
      if(this.signature!==signature){this.signature=signature;this.renderStation();}
      this.body.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>{
        const action=button.dataset.action as SectAction;
        button.disabled=!!this.pending||!online||action!=='activity_stop'&&!!v?.practising||action==='cycle_step'&&v?.cycleStatus!=='ready'||action==='confirm_level'&&(v?.level===3||(v?.cultivation??0)<LEVEL_THRESHOLDS[(v?.level??0)+1]!)||
          action==='use_recovery'&&(!v?.supplies||v.nextRecoveryAt>now||v.hp>=100)||action==='lesson_start'&&v?.lessonView?.status==='warning';
        button.title=v?.practising?'Đợi thi triển và luyện thuật kết thúc':action==='use_recovery'&&v?.hp===100?'HP đã đầy · giữ vật tư':'';
      });
      const timer=this.body.querySelector<HTMLElement>('[data-cycle-timer]');
      if(timer&&v){const left=Math.max(0,v.cycleReadyAt-now);timer.textContent=v.cycleStatus==='ready'?'Nhịp đã ổn định · hãy xác nhận':v.cycleStatus==='combat'?'Tạm dừng khi luyện thuật':v.cycleStatus==='away'?'Quay lại người hướng dẫn để tiếp tục':`Đứng yên · ${(left/1000).toFixed(1)} / ${CYCLE_PHASE_MS/1000} giây`;}
      const activity=this.body.querySelector<HTMLElement>('[data-activity]');if(activity&&v)activity.textContent=online?({locked:'Chưa mở',stopped:'Chưa chọn hoạt động nền',running:'Đang tích lũy · 120/phút',paused:'Tạm dừng khi luyện thuật',gate:'Chạm cổng 360 · cần nền vận hành tiếp',offline:'Đang mất kết nối · không tích lũy'} as const)[v.activityStatus]:'Đang mất kết nối · không tích lũy';
      const recovery=this.body.querySelector<HTMLElement>('[data-recovery-timer]');if(recovery&&v)recovery.textContent=v.practising?'Đợi luyện thuật kết thúc':v.hp>=100?'HP đã đầy · giữ vật tư':v.nextRecoveryAt>now?`Vật tư đang hồi · ${((v.nextRecoveryAt-now)/1000).toFixed(1)} giây`:v.supplies?'Sẵn sàng dùng':'Đã hết vật tư';
      this.body.querySelectorAll<HTMLElement>('[data-cultivation]').forEach(node=>{node.textContent=String(v?.cultivation??0);});
    }
    if(this.playerDot){this.playerDot.style.left=`${position.x/HANG_NHAC.world.width*100}%`;this.playerDot.style.top=`${position.y/HANG_NHAC.world.height*100}%`;}
  }
  interact():void {
    if(this.modal)return;
    if(!this.options.online()){this.feedback(this.offlineMessage());return;}
    const station=SECT_STATIONS.filter(s=>nearStation(this.options.position(),s.id)).sort((a,b)=>Math.hypot(a.x-this.options.position().x,a.y-this.options.position().y)-Math.hypot(b.x-this.options.position().x,b.y-this.options.position().y))[0];
    if(station)this.command('talk',{stationId:station.id});else this.journal();
  }
  private button(text:string,action:SectAction,extra:Partial<SectCommand>={}):HTMLButtonElement {
    const button=element('button',text);button.type='button';button.dataset.action=action;button.addEventListener('click',()=>this.command(action,extra));this.body.append(button);return button;
  }
  private paragraph(text:string):void{this.body.append(element('p',text));}
  private renderStation():void {
    const s=SECT_STATIONS.find(s=>s.id===this.station)!,v=this.view;
    this.title.textContent=s.name;this.body.replaceChildren();this.playerDot=undefined;
    if(s.id==='guide'){
      this.paragraph(guideText(this.options.avatar()));
      if(!v?.hn01){this.paragraph('HN01 · Nhận hướng dẫn và 2 vật tư hồi phục. Sau đó tới vườn thổ nạp ở phía tây.');this.button('Nhận hướng dẫn nhập môn','accept_intro');}
      else this.paragraph('HN01 đã ghi nhận. Có thể xem lại lời dẫn; phần thưởng chỉ nhận một lần cho hồ sơ này.');
    }else if(s.id==='cultivation'){
      this.paragraph(this.options.avatar()==='CHR-SITU-NAN'?'Ổn định khả năng vận hành đã biết của linh thể. Tích lũy hồi phục khác với linh lực thi triển.':'Tu vi là tích lũy dài hạn. Linh lực được tiêu và hồi khi dùng thuật.');
      if(!v?.hn01)this.paragraph('Gặp người tiếp dẫn ở sân trung tâm trước để nhận HN01.');
      else if(!v.hn02){
        if(v.cycleStep<3){
          this.paragraph(`HN02 · Nhịp ${v.cycleStep+1}/3: ${['Hít — ổn định','Dẫn — vận hành','Thu — giữ nhịp'][v.cycleStep]}`);
          this.paragraph('Đứng yên 3 giây mỗi nhịp rồi tự xác nhận. Đi lại hoặc thi triển sẽ tạm dừng nhịp; những nhịp đã xác nhận được lưu.');
          if(!v.cycleReadyAt)this.button(v.foundation==='none'?'Chọn nền và bắt đầu':'Tiếp tục vòng vận khí','cycle_start');
          else {const timer=element('p');timer.dataset.cycleTimer='';this.body.append(timer);this.button('Xác nhận nhịp hiện tại','cycle_step',{step:v.cycleStep});}
        }else if(v.cycleStep===3){
          this.paragraph('Sau một vòng vận hành, giá trị nào ghi tiến bộ dài hạn?');
          this.button(this.options.avatar()==='CHR-SITU-NAN'?'Tích lũy hồi phục':'Tu vi tích lũy','understanding',{answer:'cultivation'});
          this.button('Linh lực dùng để thi triển thuật','understanding',{answer:'mp'});
        }else {this.paragraph('Đã hoàn thành vận hành và hiểu nguồn lực. Xác nhận để ghi M01, nhận 100 tích lũy và mở thổ nạp. Ba thuật R01 giữ quyền hiện có.');this.button(this.options.avatar()==='CHR-SITU-NAN'?'Xác nhận Hồi phục I':'Xác nhận tầng 1 · M01','confirm_m01');}
      }else{
        this.paragraph(`${progressionLabel(this.options.avatar(),v.level)} · M01 đã ghi nhận.`);
        const progress=element('p','Tích lũy: '),value=element('b',String(v.cultivation));value.dataset.cultivation='';progress.append(value,` / ${CULTIVATION_GATE} · cổng nền 1–3`);this.body.append(progress);
        const activity=element('p');activity.dataset.activity='';this.body.append(activity);
        this.paragraph('Chọn một hoạt động nền. Có thể đi lại trong sân an toàn; hoạt động tạm dừng khi luyện thuật. Hiện chỉ ghi thời gian online, không tính thời gian vắng mặt.');
        this.button(v.activity?'Dừng hoạt động nền':this.options.avatar()==='CHR-SITU-NAN'?'Bắt đầu hồi phục nền':'Bắt đầu thổ nạp',v.activity?'activity_stop':'activity_start');
        if(v.level<3)this.button(`Xác nhận ngưỡng ${v.level+1} · cần ${LEVEL_THRESHOLDS[v.level+1]}`,'confirm_level',{level:v.level});
        else this.paragraph('Đã tới ngưỡng nền 1–3. M02 còn cần trận đầu HN05; nền 4–9 còn cần bài bình cảnh HN06–HN07. Tuyến tiếp theo chưa mở.');
      }
    }else if(s.id==='training'){
      this.paragraph('Kiếm Khí theo hướng ngắm; Lôi Ấn cần chọn mục tiêu; Ngự Phong Bộ lướt theo hướng và dừng tại vùng chặn.');
      this.paragraph(this.options.avatar()==='CHR-SITU-NAN'?'Vận dụng mức hiện diện hiện có; không học lại kiến thức đã biết. Các bài ghi minh chứng vận hành của linh thể.':this.options.avatar()==='CHR-LI-MUWAN'?'Luyện cách tự vận dụng thuật trước khi chuẩn bị đan–trận. Không cần một nhân vật khác hoàn thành thay.':'Quan sát hướng, khoảng cách và kết quả server xác nhận; hiểu hit và miss trước khi rời sân luyện.');
      this.paragraph('Phím F / Đánh thường: 10 damage, 0 MP, cự ly 90 px, hồi 0,8 giây. Chạm mục tiêu để ngắm; 1 Kiếm, 2 Lôi, 3 Phong. Mục tiêu tự do không cho tu vi/loot; chỉ bài đã nhận được xét credit. Đòn thường hiện dùng phản hồi chữ và HP mục tiêu, chưa có animation attack production.');
      const lessons=v?.lessons;
      if(!v?.hn02)this.paragraph('Hoàn thành HN02 và M01 trước khi nhận bài. Ba thuật vẫn dùng được từ đầu.');
      else if(!lessons?.hn03){
        this.paragraph(`HN03 · Đòn thường ${lessons?.basic?'✓':'—'} · Kiếm ${lessons?.sword?'✓':'—'} · Lôi ${lessons?.thunder?'✓':'—'}. Mỗi đòn phải trúng mục tiêu của bài; các hit trước khi nhận bài không tính.`);
        this.button('Nhận / tiếp tục bài HN03','lesson_start',{lesson:'arts'});
        if(lessons?.basic&&lessons.sword&&lessons.thunder)this.button('Xác nhận HN03 · +80 tích lũy','lesson_confirm',{lesson:'arts'});
      }else if(!lessons.hn04){
        this.paragraph(`HN03 đã lưu. HN04 · Đi bộ ${lessons.walk?'✓':'—'} · Phong ${lessons.wind?'✓':'—'}. Vòng màu vàng báo trước 1,5 giây; tới lúc xét đòn, chân phải ra ngoài cả vòng. Phong không miễn nhiễm và không xuyên blocker. Bài an toàn không gây damage.`);
        if(!lessons.walk||!lessons.wind)this.button(lessons.walk?'Luyện né bằng Phong':'Luyện né bằng đi bộ','lesson_start',{lesson:'avoid'});
        else this.button('Xác nhận HN04 · +80 tích lũy','lesson_confirm',{lesson:'avoid'});
      }else this.paragraph('HN03–HN04 đã hoàn thành. Xem lại hướng dẫn hoặc luyện tự do không nhận thưởng thêm. HN05, map ngoại vi và M02 chưa mở.');
      if(lessons?.active!=='none')this.button('Tạm dừng bài luyện','lesson_stop');
      const button=element('button','Tạo mục tiêu riêng để luyện');button.addEventListener('click',()=>{this.dialog.close();this.options.training();});this.body.append(button);
    }else{
      this.paragraph(`HP ${v?.hp??100} / 100 · Vật tư hồi phục thường: ${v?.supplies??0}. Dùng ngoài luyện thuật để hồi 30 HP, tối đa 100; hồi dùng 10 giây. HP đầy sẽ giữ vật tư.`);
      this.button('Dùng 1 vật tư hồi phục','use_recovery');
      const timer=element('p');timer.dataset.recoveryTimer='';this.body.append(timer);
      this.paragraph('Vật tư nhập môn nhận một lần từ HN01. Chuẩn bị pháp khí và nguyên liệu sẽ theo tuyến nhiệm vụ tiếp; cửa ngoại vi chưa mở.');
    }
  }
  journal():void {
    this.station=undefined;this.signature='';this.title.textContent='Nhật ký Hằng Nhạc';this.body.replaceChildren();this.feedback('');
    const goal=this.objective();this.paragraph(`${goal.id} · ${goal.title}. ${goal.hint}`);
    this.paragraph(`HN01: ${this.view?.hn01?'đã xong':'chưa xong'} · HN02: ${this.view?.hn02?'đã xong':'chưa xong'} · HN03: ${this.view?.lessons.hn03?'đã xong':'chưa xong'} · HN04: ${this.view?.lessons.hn04?'đã xong':'chưa xong'} · R01: Kiếm / Lôi / Phong có từ đầu.`);
    const map=element('div');map.className='sect-minimap';map.style.backgroundImage=`url(${HANG_NHAC.background.url})`;
    const route=sectRoute(this.options.position(),SECT_STATIONS.find(s=>s.id===(this.destination??goal.stationId))!);
    if(route){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${HANG_NHAC.world.width} ${HANG_NHAC.world.height}`);
      const line=document.createElementNS(svg.namespaceURI,'polyline');line.setAttribute('points',route.map(p=>`${p.x},${p.y}`).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#ffda6a');line.setAttribute('stroke-width','12');svg.append(line);map.append(svg);}
    for(const s of SECT_STATIONS){const pin=element('button',s.id==='guide'?'1':s.id==='cultivation'?'2':s.id==='training'?'3':'4');pin.title=s.name;pin.className='sect-pin';pin.style.left=`${s.x/HANG_NHAC.world.width*100}%`;pin.style.top=`${s.y/HANG_NHAC.world.height*100}%`;
      pin.addEventListener('click',()=>{this.destination=s.id;this.journal();});map.append(pin);}
    this.playerDot=element('span');this.playerDot.className='sect-player-dot';this.playerDot.title='Vị trí của bạn';map.append(this.playerDot);this.body.append(map);
    this.paragraph('1 · Tiếp dẫn   2 · Thổ nạp   3 · Luyện thuật   4 · Chuẩn bị. Chấm trắng là bạn; đường vàng bám vùng đi hiện có. Chọn điểm để xem đường, đóng nhật ký rồi di chuyển tới gần và nhấn E.');
    if(!route)this.paragraph('Chưa tìm được đường gợi ý từ vị trí này. Di chuyển ra khoảng trống rồi xem lại.');
    if(this.view?.activity)this.button('Dừng hoạt động nền','activity_stop');
    if(!this.dialog.open)this.dialog.showModal();this.update();
  }
  diagnostics():unknown{return {view:this.view,stations:SECT_STATIONS,destination:this.destination,modal:this.modal,station:this.station,
    online:this.options.online(),pending:this.pending?{requestId:this.pending,ageMs:Date.now()-this.pendingAt}:undefined,
    interactionDisabled:this.interaction.disabled,feedback:this.notice.textContent};}
}
