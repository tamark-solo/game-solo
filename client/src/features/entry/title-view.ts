import type {GameEntryState} from '../../core/game-entry-state';
import {GAME_ENTRY_IDS as IDS} from '../../core/game-entry-elements';
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

export function titleContent(state:GameEntryState):string {
  const realm=state.realms.find(r=>r.id===state.realmId);
  return `<div class="title-atmosphere" aria-hidden="true"><i class="title-mist"></i><i class="title-mist title-mist-far"></i><i class="title-qi"></i><i class="title-mote"></i><i class="title-mote title-mote-second"></i></div>
  <div class="title-layout"><section class="title-copy" aria-labelledby="${IDS.titleLogo}"><p class="title-kicker">TIÊN LỘ · DUYÊN KHỞI</p>
    <div class="title-wordmark"><h1 id="${IDS.titleLogo}" class="title-logo" aria-label="Vân Hải Đạo Đồ"><span>VÂN HẢI</span><span>ĐẠO ĐỒ</span></h1><div class="title-seal" aria-hidden="true">ĐẠO</div></div>
    <p class="title-verse">Đạo chưa có đường.<br>Ta tự mở.</p><p class="title-origin">Hành trình khởi đầu tại Hằng Nhạc</p>
    <nav class="title-actions" aria-label="Màn mở đầu"><button id="${IDS.titleStart}" type="button" class="game-button primary title-start" data-entry-action="begin">${state.session?'Tiếp tục hành trình':'Bắt đầu hành trình'}</button><button type="button" class="title-setting" data-entry-action="settings">Thiết lập</button></nav>
    ${state.session?`<p class="title-welcome">Đạo hữu ${escape(state.session.account.login)}${realm?' · '+escape(realm.name):''}</p>`:'<p class="title-welcome">Đăng nhập · Chọn server · Tạo nhân vật</p>'}
    <p id="${IDS.message}" role="status" class="entry-message title-message"></p><details id="${IDS.trace}" class="entry-trace" hidden><summary>Mã hỗ trợ</summary><code></code></details>
  </section><aside class="title-lore"><p class="title-location">HẰNG NHẠC <span>NGƯNG KHÍ</span></p><details><summary>Tiên lộ khởi hành</summary><div class="title-lore-copy"><h2>Từ một bước nhập môn</h2><p>Gặp người tiếp dẫn, học vận khí và rèn luyện thuật pháp tại Hằng Nhạc.</p><p>Chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển, rồi đặt tên cho hành trình của bạn.</p><p>Kiếm Khí · Lôi Ấn · Ngự Phong Bộ</p></div></details></aside>
  <footer class="title-footer"><span>Nhập môn <i>·</i> Vận khí <i>·</i> Luyện thuật</span><span>VÂN HẢI ĐẠO ĐỒ <i>·</i> MMO-RPG</span></footer></div>`;
}
