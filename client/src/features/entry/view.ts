import type {GameEntryState} from '../../core/game-entry-state';
import {GAME_ENTRY_IDS as IDS} from '../../core/game-entry-elements';
import {CHARACTER_INFO,type AvatarId} from '../../../../shared/profiles';
import {progressionLabel} from '../../../../shared/sect';
import {titleContent} from './title-view';
import {attachTitleEffects} from './title-effects';

const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const PHASE_LABELS={title:'Màn mở đầu',loading:'Đang đọc phiên đăng nhập',login:'Đăng nhập',realms:'Chọn server',characters:'Chọn nhân vật',create:'Tạo nhân vật',entering:'Vào thế giới',playing:'Trong game'};
export class EntryView {
  readonly root:HTMLElement;
  private contentRoot:HTMLElement;
  private signature='';
  private disposeEffects:()=>void;
  constructor(private state:GameEntryState,mount:HTMLElement){
    this.root=document.createElement('section');this.root.id=IDS.mount;this.root.className='account-entry van-panel';this.root.setAttribute('aria-label','Đăng nhập và chọn nhân vật');mount.append(this.root);
    this.contentRoot=document.createElement('div');this.contentRoot.className='account-entry-content';this.root.append(this.contentRoot);
    this.disposeEffects=attachTitleEffects(this.root);
  }
  render(){
    if(!this.root.isConnected)return;
    const s=this.state,signature=JSON.stringify([s.phase,s.session?.account.id,s.loginMode,s.realms,s.realmId,s.characters,s.selectedId,s.creatingAvatar,s.sprites]);
    if(signature!==this.signature){
      this.signature=signature;const realm=s.realms.find(value=>value.id===s.realmId),step=s.phase==='login'?1:s.phase==='realms'?2:3;
      if(s.phase==='title')this.contentRoot.innerHTML=titleContent(s);
      else{
      this.contentRoot.innerHTML=`<div class="account-entry-intro"><p class="entry-brand">VÂN HẢI ĐẠO ĐỒ</p><h1>${PHASE_LABELS[s.phase]}</h1><p>Một bước nhập môn<br>Một đời tu hành</p><ol class="entry-steps"><li data-current="${step===1}">01 · Tài khoản</li><li data-current="${step===2}">02 · Server</li><li data-current="${step===3}">03 · Nhân vật</li></ol>${s.session?`<p class="entry-account-label">${escape(s.session.account.login)}${realm?`<br>${escape(realm.name)}`:''}</p><button class="entry-link" data-entry-action="logout" type="button">Đăng xuất</button>${s.session.account.role==='admin'?'<a class="entry-link" href="/admin.html">Quản trị hệ thống ↗</a>':''}`:''}<button class="entry-link" data-entry-action="settings" type="button">Thiết lập</button><button class="entry-link" data-entry-action="title" type="button">Màn mở đầu</button></div><section class="account-entry-main"><header><span class="ui-eyebrow">${s.phase==='login'?'BẮT ĐẦU HÀNH TRÌNH':s.phase==='realms'?'THẾ GIỚI CỦA BẠN':realm?escape(realm.name):'HẰNG NHẠC'}</span><h2>${s.phase==='create'?'Chọn người đồng hành':s.phase==='characters'?'Nhân vật của bạn':s.phase==='realms'?'Chọn nơi bắt đầu':'Bước vào tiên lộ'}</h2></header>${this.content()}<p id="${IDS.message}" role="status" class="entry-message"></p><details id="${IDS.trace}" class="entry-trace" hidden><summary>Mã hỗ trợ</summary><code></code></details></section>`;
      this.paintSprites();
      }
    }
    this.root.dataset.phase=s.phase;this.root.parentElement!.dataset.entryPhase=s.phase;this.root.setAttribute('aria-busy',String(s.busy));
    this.root.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.disabled=s.busy||button.dataset.disabled==='true');
    const message=this.root.querySelector<HTMLElement>('#'+IDS.message)!;message.textContent=s.busy?s.message||'Đang xử lý…':s.message;
    const trace=this.root.querySelector<HTMLElement>('#'+IDS.trace)!;trace.hidden=!s.requestId;trace.querySelector('code')!.textContent=s.requestId;
  }
  private content(){
    const s=this.state;
    if(s.phase==='loading'||s.phase==='entering')return `<div class="entry-loading" role="status"><span aria-hidden="true">✦</span><h3>${s.phase==='entering'?'Đang vào Hằng Nhạc':'Đang đọc tài khoản'}</h3><p>Chờ máy chủ xác nhận và nạp hành trình.</p></div>`;
    if(s.phase==='login')return `<nav class="entry-auth-tabs" aria-label="Đăng nhập hoặc đăng ký"><button type="button" data-entry-action="login-mode" aria-pressed="${s.loginMode==='login'}">Đăng nhập</button><button type="button" data-entry-action="register-mode" aria-pressed="${s.loginMode==='register'}">Đăng ký</button></nav><form id="${IDS.form}" data-entry-form="auth"><label>Tên tài khoản<input id="${IDS.login}" name="login" minlength="3" maxlength="32" pattern="[a-zA-Z0-9][a-zA-Z0-9_.&#92;-]{2,31}" autocomplete="username" autocapitalize="none" spellcheck="false" required placeholder="Tên tài khoản của bạn"></label><label>Mật khẩu<span class="entry-password"><input id="${IDS.password}" name="password" type="password" ${s.loginMode==='register'?'minlength="12"':''} maxlength="128" autocomplete="${s.loginMode==='register'?'new-password':'current-password'}" required placeholder="${s.loginMode==='register'?'Từ 12 ký tự':'Mật khẩu của bạn'}"><button type="button" data-entry-action="show-password" aria-label="Hiện mật khẩu">Hiện</button></span></label><p class="entry-help">${s.loginMode==='register'?'Tài khoản mới bắt đầu với danh sách nhân vật rỗng. Bạn sẽ chọn server và tạo nhân vật tiếp theo.':'Đăng nhập để đọc nhân vật và hành trình đã lưu trên server.'}</p><button class="game-button primary" type="submit">${s.loginMode==='register'?'Tạo tài khoản':'Đăng nhập'}</button></form>`;
    if(s.phase==='realms')return `<div class="realm-list">${s.realms.map(realm=>`<button type="button" class="realm-choice" data-entry-realm="${realm.id}" data-disabled="${realm.status!=='online'}"><span><b>${escape(realm.name)}</b><small>${realm.characters?'Đã có '+realm.characters+' nhân vật':'Chưa có nhân vật'}</small></span><span class="realm-status" data-status="${realm.status}">${realm.status==='online'?'Đang mở':'Bảo trì'}</span></button>`).join('')||'<div class="entry-empty"><h3>Chưa có server khả dụng</h3><p>Thử đọc lại danh sách sau ít giây.</p></div>'}</div><button class="entry-link" data-entry-action="refresh" type="button">Đọc lại danh sách</button>`;
    if(s.phase==='create')return `<form id="${IDS.form}" data-entry-form="create"><div class="entry-avatar-grid" role="group" aria-label="Mẫu nhân vật">${Object.entries(CHARACTER_INFO).map(([id,info])=>`<button class="entry-archetype" type="button" data-entry-avatar="${id}" aria-pressed="${s.creatingAvatar===id}"><i data-entry-sprite="${id}" aria-hidden="true"></i><b>${info.name}</b><small>${info.introduction}</small></button>`).join('')}</div><div class="entry-character-note"><b>${CHARACTER_INFO[s.creatingAvatar].name}</b><p>${s.creatingAvatar==='CHR-SITU-NAN'?'Linh thể đang khôi phục khả năng hiện diện và thi triển.':'Bắt đầu tại Hằng Nhạc, học vận dụng linh lực và thuật pháp.'} Cả ba có Kiếm Khí, Lôi Ấn và Ngự Phong Bộ từ đầu.</p></div><label>Tên nhân vật<input id="${IDS.characterName}" name="name" value="${escape(s.draftName)}" minlength="2" maxlength="48" required autocomplete="off" placeholder="Đặt tên cho hồ sơ của bạn"></label><p class="entry-help">Tên dùng 2–24 ký tự chữ/số và được kiểm trên server đã chọn.</p><div class="entry-form-actions"><button class="entry-link" type="button" data-entry-action="back-characters">Quay lại</button><button class="game-button primary" type="submit">Tạo nhân vật</button></div></form>`;
    if(s.phase==='characters'){
      const realm=s.realms.find(value=>value.id===s.realmId),selected=s.characters.find(value=>value.profile.id===s.selectedId),slots=realm?.characterSlots??0;
      return `<div class="entry-roster">${s.characters.map(({profile:p})=>`<button class="entry-character-choice" type="button" data-entry-character="${p.id}" aria-pressed="${p.id===s.selectedId}"><i data-entry-sprite="${p.avatarId}" aria-hidden="true"></i><span><b>${escape(p.name)}</b><small>${CHARACTER_INFO[p.avatarId].name}</small><small>${escape(progressionLabel(p.avatarId,p.sect.level))}</small></span></button>`).join('')||'<div class="entry-empty"><span aria-hidden="true">✦</span><h3>Chưa có nhân vật</h3><p>Tạo nhân vật đầu tiên để bắt đầu hành trình tại Hằng Nhạc.</p></div>'}</div><p class="entry-slot-count">${s.characters.length} / ${slots} nhân vật trên server này</p>${selected?`<div class="entry-character-note"><b>${escape(selected.profile.name)}</b><p>${selected.profile.mapId==='hang-nhac'?'Hằng Nhạc':'Hành trình đã lưu'} · ${selected.profile.sect.hn01?'Tiếp tục tiến trình đã lưu':'Bắt đầu nhập môn'}</p></div>`:''}<div class="entry-form-actions"><button type="button" class="entry-link" data-entry-action="back-realms">Đổi server</button><button type="button" class="game-button" data-entry-action="create" data-disabled="${s.characters.length>=slots||!realm?.creationEnabled}">Tạo mới</button><button type="button" class="game-button primary" data-entry-action="play" data-disabled="${!selected||realm?.status!=='online'}">Vào game</button></div>${realm&&!realm.creationEnabled?'<p class="entry-help">Server đang tạm đóng tạo nhân vật.</p>':''}`;
    }
    return '';
  }
  private paintSprites(){
    this.root.querySelectorAll<HTMLElement>('[data-entry-sprite]').forEach(node=>{const sprite=this.state.sprites[node.dataset.entrySprite as AvatarId];if(!sprite)return;
      const f=sprite.frame,scale=1;node.style.width=`${f.w*scale}px`;node.style.height=`${f.h*scale}px`;node.style.backgroundImage=`url(${JSON.stringify(sprite.url)})`;node.style.backgroundSize=`${sprite.atlasWidth*scale}px ${sprite.atlasHeight*scale}px`;node.style.backgroundPosition=`${-f.x*scale}px ${-f.y*scale}px`;
    });
  }
  focus(selector?:string){const fallback=this.state.phase==='title'?'#'+IDS.titleStart:this.state.phase==='login'?'#'+IDS.login:this.state.phase==='create'?'#'+IDS.characterName:this.state.phase==='characters'?'[data-entry-character][aria-pressed="true"]':'.account-entry-main button:not(:disabled)';(this.root.querySelector<HTMLElement>(selector??fallback)??this.root.querySelector<HTMLElement>('.account-entry-main button:not(:disabled)'))?.focus();}
  dispose(){this.disposeEffects();this.root.remove();}
}
