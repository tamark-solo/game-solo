# Pipeline Frame-by-Frame — Kiếm Khí R01

**Gói sản xuất v1 · 07/10/2026.** Phạm vi: một kỹ năng mẫu hướng đông cho Vương Lâm chibi, nguồn PNG/atlas, metadata, thư viện trình bày và preview kiểm frame tách khỏi game. Chưa tích hợp combat/client/server. Chuẩn màu/nét kế thừa [ART đã duyệt](../ngung-khi-approved-art-v1.png); bộ frame mới cần người phát triển xem chuyển động.

## 1. Kết luận kiến trúc

Asset cốt lõi là các frame đã vẽ: pose, charge, projectile và impact. Renderer chọn frame theo tuổi của clip; vị trí/rotation chỉ gắn clip vào socket hoặc đường bay. Không dùng scale/opacity của một tranh tĩnh để thay cho biến đổi silhouette. Gói này không cần particle để tạo hiệu ứng chính.

Tách ba trục:

1. **Authoring:** frame 1-based, FPS, frame hold, event và socket. Animator nhìn F07 biết lúc xuất chiêu.
2. **Combat:** server sở hữu cast/projectile/hit/damage. Va chạm có thể xảy ra ở frame khác tùy khoảng cách; VFX không tự quyết định damage.
3. **Presentation:** chuỗi sprite, sorting, pool, ánh sáng bổ trợ, camera, hit-stop cục bộ và SFX hook. Hit-stop không dừng đồng hồ server, event cursor hoặc physics projectile.

Runtime vẫn đổi thời gian sang tick `floor(age × fps)`; authoring không khóa vào số giây hoặc FPS màn hình. Khi render trễ, event cursor phát đủ các event đã đi qua, mỗi event một lần. Seek trong editor dựng lại trạng thái để xem, không gửi lệnh combat hoặc phát âm thanh.

## 2. Nguồn đã sản xuất

| Track | PNG khác nhau | FPS | Canvas / anchor | Cỡ hình có alpha ở 1× |
| --- | --- | --- | --- | --- |
| Vương Lâm cast east | 12 | 24, có hold | 96 × 96 / 48,88 | Tối đa 77 × 80 px |
| Tụ khí | 6 | 24 | 48 × 48 / 24,24 | Tối đa 34 × 27 px |
| Kiếm bay và trail | 6, loop | 24 | 128 × 64 / **tip 116,32** | Tối đa 108 × 53 px, gồm glow/trail |
| Chạm → dư khí → tan | 12 | 24 | 128 × 128 / 64,64 | Tối đa 69 × 64 px |

Tổng **36 PNG riêng**, **4 atlas**, không tính sheet gốc. Kiếm chính khoảng 96 px; cỡ 108 × 53 là toàn silhouette gồm trang trí và glow. Các số trên đo từ vùng alpha > 12 khi đóng gói, không phải vùng gây sát thương. Frame 11–12 của impact rất nhỏ; không phóng chúng trở lại cỡ đỉnh chiêu.

Thân Vương Lâm giữ khoảng 80 px như sprite idle 64 × 96 của game. Pose vươn tay có silhouette ngang 77 px nên dùng canvas **96 × 96** với phần padding thêm và anchor **48,88**. Đây là mở canvas để tránh cắt tay/tóc, không tăng cỡ người hoặc đổi collision. Nếu renderer chỉ nhận quad 64 × 96, programmer cần hỗ trợ kích thước/pivot theo clip; không ép cast về 64 px ngang bằng cách làm toàn thân nhỏ đi.

Ảnh được tạo bằng **imagegen tích hợp**, với Vương Lâm và atlas ngọc/ngà đã có làm tham chiếu. [Prompt pose](prompts/wanglin-cast-v1.txt), [charge](prompts/charge-v1.txt), [projectile](prompts/projectile-v1.txt), [impact](prompts/impact-v1.txt) lưu nguyên văn. Sheet chọn nằm trong [source](source/); bản gốc trong generated_images được giữ.

Bước Node/Sharp chỉ xuất/cắt/đăng ký điểm neo và pack atlas. Không vẽ thêm frame bằng mã, không sửa màu hay xóa nền. PNG gốc giữ alpha. Một **commonScale** áp dụng cho toàn chuỗi; không chuẩn hóa từng frame theo bbox riêng. Các hàng pose được đo lại khoảng trống vì lưới AI có sai lệch vài pixel ở chân; [clips.json](clips.json) ghi source rect và origin thực tế.

## 3. Quy tắc file và atlas

```text
frame-by-frame-r01/
  source/                   # Sheet gốc đã chọn
  prompts/                  # Prompt chính xác
  frames/
    wanglin-cast-east/001.png ... 012.png
    sword-charge/001.png ... 006.png
    sword-projectile/001.png ... 006.png
    qi-impact/001.png ... 012.png
  atlases/                  # 4 texture export
  clips.json                # Rect, anchor, sampling, hold, FPS, nguồn
  skill.json                # Track, frame event, socket, hợp đồng hit
  sequence-system.mjs       # Player / cursor / cache / pool / sorting
  skill-vfx-controller.mjs  # Adapter nhận snapshot/hit từ host
  preview-model.mjs         # Chỉ mô phỏng projectile/hit cho editor
  build-assets.mjs
  pack-atlases.mjs           # Build thường: chỉ đọc PNG rời, không ghi đè frame
  sequence-system.test.mjs
```

Source PNG rời là sản phẩm tiện chỉnh từng frame; atlas là export cho renderer. Bản này pack 4 cột, padding trong suốt 2 px quanh từng cell. Atlas lần lượt **400 × 300**, **208 × 104**, **528 × 136**, **528 × 396**. Rect trong metadata loại padding; không suy ra frame bằng chia texture khi có trim/pack khác.

Tên clip không gắn số cảnh giới vào đường dẫn PNG để dễ dùng lại; skill id `R01-SWORD-FBF-EAST` gắn nhánh/cảnh giới/hướng. Biến thể R02 và các hướng mới dùng sibling version, không ghi đè nguồn đã chọn.

Build atlas thường xuyên bằng Node có Sharp, sau khi artist chỉnh PNG rời:

```powershell
node docs/design/vfx/frame-by-frame-r01/pack-atlases.mjs
node --test docs/design/vfx/frame-by-frame-r01/sequence-system.test.mjs
```

Script tìm Sharp trong môi trường Node hoặc dependency runtime có sẵn. Trên máy khác có thể đặt `VFX_NODE_MODULES` tới thư mục node_modules chứa Sharp. Không cần API key để đóng gói lại; không gọi imagegen trong build. Không chạy script sync asset của client trong phiên ART này.

**PNG trong frames/ là nguồn chính sau lần xuất đầu.** `pack-atlases.mjs` chỉ đọc chúng, kiểm cỡ/alpha và tạo atlas; không ghi đè chỉnh sửa của artist. `build-assets.mjs` dùng riêng cho lần xuất/đăng ký neo lại từ sheet đã chọn: lệnh này tạo lại PNG/metadata nên chạy vào một bản version mới nếu đã sửa frame bằng tay. Không gắn exporter sheet vào prebuild thường xuyên của web.

## 4. Timeline hiện hành

Frame source và frame timeline là hai khái niệm: một pose có thể giữ vài tick. Pose source 5, 7, 8 và 9 mỗi pose giữ 2 tick; các pose khác giữ 1 tick. 12 pose tạo track nhân vật dài **16 tick / 0,667 s**. F07 dùng pose source 6 đang xuất chiêu; tại hit mẫu F13, source 9 đang thu thủ quyết, rồi mới về nghỉ.

| Event/track | Frame timeline | Ý nghĩa |
| --- | --- | --- |
| Cast start / charge | F01 | Bắt đầu pose và 6 frame charge bám socket tay |
| Release | **F07** | Phát kiếm/trail; hook `sword.cast` |
| Recovery start | F10 | Nhân vật vào hồi động tác |
| Character end | F17 | Host trả nhân vật về animation nghỉ |
| Hit confirmed | **Event combat, không có frame cố định** | Spawn 12 frame impact ở worldPosition thực; hook `sword.hit` |

Trong demo, khoảng cách 260 world px và không thêm trễ xác nhận cho **hit F13**. Tăng khoảng cách làm hit muộn hơn. Thêm trễ 12 frame đưa confirmation tới F25; F15 chưa được phép phát impact. Đây là mô phỏng riêng trong [preview-model.mjs](preview-model.mjs), không phải luật game đã chốt.

Projectile 6 frame loop cho tới contact/expiry. Flight position thuộc physics; sequence chỉ mô tả bề mặt năng lượng. Impact độc lập với animation tay: nhân vật hồi động tác vẫn có thể đang chờ projectile/hit. Khi hụt, không phát impact tại mục tiêu; demo dùng bốn frame tan cuối ở cuối đường bay.

JSON [skill.json](skill.json) chứa FPS, socket từng pose, track/event, hit contract và cỡ preview. JSON [clips.json](clips.json) chứa sprite sequence. Không đặt Damage Event trong clip PNG; việc mở hitbox cho đòn chém sau này phải có track combat riêng được server xác nhận.

## 5. Hợp đồng để programmer gọi

Thư viện [SkillVfxController](skill-vfx-controller.mjs) nhận đồng hồ trình bày, cast pose, snapshot projectile và hit đã được combat xác nhận. Nó trả descriptor sprite gồm clip/rect/anchor/world point/direction; host vẽ quad từ atlas. Nó không tính damage, không gửi cast lên mạng và không tạo projectile gameplay.

```javascript
import { SkillVfxController } from './skill-vfx-controller.mjs';

const vfx = new SkillVfxController(skill, clips, {
  onEvent(event) {
    // visual.release: gắn nguồn FX vào projectile của host.
    // visual.hit: chuyển sfx/camera/hit-stop sang lớp trình bày.
  }
});

vfx.beginCast({
  castId: 'cast-001', startedAt: 10.0,
  foot: [360, 386], direction: [1, 0]
});

// Host đưa vị trí tip đã nội suy từ projectile/snapshot vào:
vfx.setProjectilePose('cast-001', {
  tip: [570, 344], direction: [1, 0]
});

vfx.confirmHit({
  castId: 'cast-001', hitId: 'hit-001', targetId: 'player-02',
  worldPosition: [614, 344], incomingDirection: [1, 0],
  confirmedAt: 10.5
});

const descriptors = vfx.update(10.6);
// Renderer đọc descriptor.sample.frame.rect,
// descriptor.sample.clip.anchor và descriptor.point để vẽ.
// Khi projectile/cast kết thúc, host gọi:
vfx.endCast('cast-001'); // impact đang phát vẫn sống tới cuối clip
```

`startedAt`, `confirmedAt`, `update(now)` dùng cùng đồng hồ giây của host; quy đổi sang frame nằm trong thư viện. Snapshot và hook phải được nối vào game thật; hiện code combat của dự án chưa được đổi để sử dụng adapter này. Hướng đông là bộ pose duy nhất của gói; rotation projectile không thay thế pose nhân vật cho bắc/tây/nam.

Adapter chặn hit trùng theo castId + hitId. Projectile được gỡ khi hit; hit tới trước một lượt render trễ không được làm projectile sống lại. Pool có giới hạn; thiếu slot chỉ ảnh hưởng phần trình bày. Host gọi endCast/despawn khi projectile hết; TTL 8 s trong adapter là dọn visual bị bỏ quên, không phải lifetime gameplay.

## 6. Camera, sorting và MMO

Map tham chiếu 960 × 640, camera game 480,320, zoom 1/2/4, DPR tối đa 2. Khung hẹp đổi frustum; cùng zoom giữ nguyên cỡ world, không kéo toàn scene vừa cửa sổ. Camera inspector ở 4× mặc định tập trung Vương Lâm để xem pixel; chọn Khung game để giữ tâm gốc. PNG source/atlas không chứa camera.

Sprite nhân vật dùng nearest, FX dùng linear. Layer: ground/shadow → body theo chân Y → air/trail → impact → screen. Trong hướng xuất đông của mẫu, kiếm đi trước người; các hướng khác cần quy tắc che khuất/pose riêng. Đừng dùng rìa glow làm hitbox hoặc che dấu nguy hiểm.

Nhấn lực mẫu: camera 1 world px trong 3 tick, hit-stop hình nhân vật 25 ms, không screen flash toàn màn. Preview mặc định tắt để dễ đánh giá frame. Settings giảm chuyển động tắt tự chạy và nhấn lực. SFX có hai hook; **chưa có file âm thanh**.

Đông người có thể giảm trail/hạt và bỏ nhấn lực của chiêu không theo dõi, nhưng phải giữ kiếm chính, điểm hit và báo trước liên quan gameplay. Chưa đo draw call/GPU hoặc benchmark đông người. Bốn atlas không đồng nghĩa bốn draw call cho mọi cảnh; batching do renderer thực quyết định.

## 7. Kiểm nghiệm và giới hạn

- Build xác nhận 36 frame có hash khác nhau, có alpha và không clip sau khi đăng ký neo; metadata ghi cùng scale cho từng sequence.
- 11 test tự động: frame hold/lifetime/loop, event khi render trễ/seek/reset, khoảng cách và hit delay, miss, socket boss, pool 1000 lượt dùng lại, cache retry, sorting, file/rect atlas, adapter snapshot/hit trùng và hit đến trước render trễ.
- Kiểm browser: bước F04 → F05, pose kiếm chỉ, charge trên tay, projectile frame 03/6, impact frame 03/12, trễ xác nhận 12 frame chưa phát sớm, miss chỉ tan ngoài mục tiêu.
- Đã kiểm cỡ 1/2/4×, khung 360 × 400, nền sáng/alpha, bảng 12 PNG impact và vùng chạm quái/boss. Khung hẹp giữ thân ~80 px/canvas 96 × 96 ở 1×; zoom 2×/4× nhân đúng tỷ lệ. Camera 4× tập trung người để kiểm pixel/socket. Chưa có kiểm mobile vật lý.

Khung xuất trực tiếp từ canvas: [xuất kiếm 1×](review/release-1x.png), [xem nét 2×](review/release-2x.png), [chạm 1×](review/impact-1x.png), [dư khí 1×](review/residue-1x.png). Bốn hình đều 946 × 640 backing px trong môi trường kiểm DPR 1; zoom đổi frustum/cỡ world, không đổi cỡ canvas.

Đây là gói nguồn và adapter có thể bàn giao, chưa là kỹ năng runtime đã nghiệm thu. Còn các hướng pose khác, ART quái/boss/phản ứng trúng đòn, âm thanh và tích hợp/benchmark trong game. Tiếp theo dùng Kiếm Khí chốt quy tắc atlas/socket, rồi sản xuất Lôi Ấn và Ngự Phong Bộ theo cùng hợp đồng.
