# VFX đòn thường · Thanh Ngọc01

Ngày12/10/2026 owner đồng ý thêm VFX gọn cho ba đòn thường, tách phát lực và trúng mục tiêu. [Mở review trên Vương Lâm](../../characters/wang-lin-pixel-combat-v1/index.html): chọn **Combo ba đòn nối**, bật/tắt **Hiệu ứng kỹ năng**, chọn **Đánh trúng/Đánh hụt**, kéo **Nhịp động tác** để soi ở mili giây. **Âm thanh** mặc định tắt, bật bằng thao tác người dùng.

| Sequence | Công dụng | Thời gian |
|---|---|---|
| palm-stroke | Vệt lực ngắn, thẳng của đòn1 | 150ms |
| rising-arc | Vệt khí cong của đòn2 | 150ms |
| finger-seal | Ấn nhỏ và chỉ khí cho đòn kết3 | 150ms |
| impact-small | Va chạm thường, dùng chung đòn1/2 | 150ms |
| impact-finish | Dấu ngọc hình thoi/vòng vỡ, đòn kết | 200ms |

Năm sequence/sáu frame = **30frame**. Ba vệt có anchor(24,48)/canvas96×96; impact nhỏ64×64/(32,32), impact kết96×96/(48,48). Cùng source xoay theo vector cho tám hướng, không cần vẽ lại40clip VFX. Trắng ngọc–thanh lam, điểm sáng ấm nhỏ; không có nền/mặt đất/thân nhân vật trong bitmap. Đọa Ma là biến thể palette/ART về sau, chưa sản xuất ở đợt này.

## Nguồn và cách đóng

Tạo bằng **ImageGen built-in**; không CLI/API PixelLab. [Năm raw RGBA và prompt](sources/) lưu cùng workspace; [production-plan.json](production-plan.json) ghi output gốc và hash, [catalog.json](catalog.json) ghi canonical/atlas. [Registration](registration.json) đo từng vùng nguồn và điểm phát sáng cố định. Các cell nguồn không đều tuyệt đối, nên đã chọn vùng theo hình thực; không chia đều để lấy lẫn lõi của frame bên cạnh.

Giữ alpha mềm, màu gốc và mọi hạt rời trong vùng đo. Resize bằng một scale chung/sequence:0,12 cho vệt/đòn kết và0,10 cho impact nhỏ; không fit bbox từng frame, không largest-component mask hoặc binary alpha của body. Atlas PNG có gutter2px, sampling linear. Tổng năm atlas81178byte, RGBA khi nạp1070976byte; đây là dung lượng asset, không tổng RAM/GPU game.

[24 điểm tay](hand-sockets.json) được đo trên pose phát lực của ba đòn ×8 hướng, đối chiếu grid và skin component. Pivot thân112×96/(56,88) giữ nguyên. [Body basis](body-basis.json) pin603file gồm source/canonical đã chốt40 và canonical combat40 candidate; VFX không sửa bitmap, anatomy, scale, timing hoặc collider người.

## Core và review

`shared/animation-arena/basic-presentation.ts` là model trình bày thuần: **release/hit/cancel facts + absolute clock → FX descriptors**, không sở hữu damage, input, movement, save hoặc transport. Vệt chỉ cần release; impact chỉ có hit riêng. Hit dedup theo strike+target, aim khóa tại release, groundY riêng với điểm tay/contact. Event tới muộn dùng tuổi hiện tại, clip hết không khởi động lại; cancel dừng vệt và giữ impact đã xác nhận. Giới hạn64effect/256seen/128terminal, reset riêng.

Review tạo facts minh họa theo release200/333⅓/416⅔ms của body. Đánh hụt bỏ hit fact, không đổi pose. Mục tiêu luyện có HP tĩnh để xem ART, không có damage/loot. Socket phát giữ theo pose release; một mục tiêu contact cố định được dùng cho cả combo và vệt hướng tới điểm đó. Vị trí này chỉ phục vụ review, không là tầm đánh server.

`review-basic-audio.mjs` tổng hợp cue gió/ngọc ngắn bằng WebAudio (noise lọc + tone), không dùng âm thanh bên thứ ba. Chỉ mở AudioContext từ checkbox người dùng, dedup cue, không phát lại khi seek; pause/hidden/offline/pagehide dừng voice. Đây là sound prototype, chưa master âm thanh game.

**Trạng thái:** VFX ART/motion candidate đã ghép review, chưa tự suy owner approval hoặc nối vào room/live player. Khi tích hợp, adapter nhận release/hit riêng của đòn thường; không gán đòn thường thành sword R01 chỉ để kích VFX. Snapshot/body/catalog/renderer đi qua cùng pipeline Core; body80clip và R01/HUD/map/DB giữ nguyên.

## Kiểm

Chạy `npm.cmd run test:basic-attack-vfx`.

- [Asset](../../../data/basic-attack-jade-v1-verification.json):5source/30frame, alpha mềm, hash, atlas/gutter và24socket;603body file không đổi.
- [GPU](../../../data/basic-attack-jade-v1-gpu-verification.json):30frame ×8góc trong AnimationArenaArt/Three, so alpha/pivot với canonical canvas. SwiftShader kiểm correctness.
- [Browser](../../../data/basic-attack-jade-v1-browser-verification.json):24binding, hit/hụt, FX toggle giữ body, hết sequence, combo kết, native4×/map1×, audio từ click/không replay seek, responsive và lifecycle.
- Bốn unit kiểm facts/clock/dedup/cancel/giới hạn. Hồi quy review80clip/480pose và typecheck giữ qua.

Tooling ghi riêng root này; `prepare-basic-attack-vfx.mjs` khóa khi plan đã có, record giữ source đã lưu và builder kiểm basis trước ghi. Không chạy owner map builder hoặc replay ImageGen để validate. Template review đầu được khóa sau khi có module VFX được chỉnh tay.
