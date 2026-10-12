# Nghiên cứu pipeline pixel nhân vật · 12/10/2026

**Ngự Phong · 12/10:** sau owner nhận xét rất tốt với Pixel02, [wind01](design/characters/wang-lin-pixel-wind-v1/README.md) bổ sung48pose/tám hướng theo master hiện hành, body/FX tách riêng, scale chung/nguồn và14hold R01. ImageGen built-in, không PixelLab tích hợp; pin242file Pixel02, không tái xuất reference. Review dùng Core timeline/history ghosts, chưa thay runtime actor.

**Tiếp nối sau phản hồi “bộ mới khá tốt”:** [pixel02 đủ tám hướng cho idle/run/Kiếm/Lôi](design/characters/wang-lin-pixel-production-v2/README.md) có32clip/192pose, giữ nguyên48 PNG đã xem. Cùng nguồn qua action từng hướng, hiệu chỉnh origin theo clip thay vì fit/scale mỗi pose; checkasset/GPU/browser192frame qua. Sáu hướng mới chưa suy duyệt từ phản hồi về mốc trước; chưa full player hoặc thay game.

Owner phản hồi Vương Lâm trong sân animation phình tỷ lệ khi thi triển và cung cấp `docs/art_reference`. Sau khi xem sáu bộ, owner chọn **Kiếm Tu PixelLab Luyện Khí: pixel rõ, thân gọn, tách vũ khí và VFX** làm hướng học cho Vân Hải. Đây là chọn hướng, chưa duyệt ART mới hoặc thay pack runtime.

## Tỷ lệ bộ đang dùng

[Bảng đối chiếu native](../artifacts/animation-reference-audit/scale-comparison-2x.png) đặt idle, mở đầu cast và hồi thế cùng điểm đất. Ở Đông, bbox alpha pose đầu production idle **48×76 px**, cast_forward **50×80 px**: chiều cao tăng khoảng **5,3%** ngay khi chuyển sang pose cast trung tính. Ở Nam, idle cao80 nhưng cast đầu77. Hình còn khác khối đầu/tóc, mặt, áo và góc nhìn giữa các nguồn; chiều cao tổng80 không khóa được anatomy.

`AnimationArenaArt.pose` chuyển nguyên frameSize/pivot tới `setSpriteFrame`; renderer đặt quad theo metadata. Canvas cast96/112/128px rộng có padding khác idle64px, nhưng một pixel atlas vẫn là một đơn vị thế giới tại camera1×. Đường code này không phóng thân riêng khi cast. Cần sửa sự nhất quán ART/registration giữa nguồn, không ép nhỏ từng pose hoặc đổi camera/collider.

Exporter production01 lấy scale từ bbox tham chiếu mỗi sheet. Scale nội bộ chung nhưng nguồn cast cũ, idle mới và các sheet khác nhau vẫn có anatomy/góc vẽ khác. **Đạt chiều cao80 và pass atlas/UV không chứng minh giữ tỷ lệ khi đổi action.** Bộ cũ giữ để đối chiếu, chưa được mô tả là đã sửa hoặc đã duyệt.

## Dữ liệu thực sự đã xem

Audit chỉ đọc manifest/raster do owner cung cấp. Sáu manifest mô tả78 nhóm motion và140 sheet layer mặc định; tất cả sheet được đọc có kích thước đúng `frames × cell.width` và `directions × cell.height`. Chưa kiểm tất cả biến thể trang bị hoặc mã runtime nguồn. Tool/builder là thông tin **PROVENANCE khai báo**, không phải một lần chạy được quan sát.

| Bộ | Cell | Pivot pixel | Scale khai báo | Motion / hướng |
| --- | --- | --- | --- | --- |
| character-runtime | 96×96 | (48,90) | 0,8856 | 13 / 4 |
| Kiếm Tu PixelLab Luyện Khí · đã chọn | 192×192 | (96,154) | 0,4744 | 13 / 8 |
| Kiếm Tu Trúc Cơ | 128×128 | (64,112) | 0,597 | 13 / 8 |
| Quyền Tu default | 128×128 | (64,112) | 0,6178 | 13 / 8 |
| Quyền Tu PixelLab | 192×192 | (96,154) | 0,432 | 13 / 8 |
| Thương Tu PixelLab | 256×256 | (128,200) | 0,458 | 13 / 8 |

Kiếm Tu Luyện Khí có704 frame thân: idle4, walk8, run8, hurt6, attack6, dash6, jump9, combat8, skill_melee8, skill_ranged8, consumable6, block4, death7; mỗi motion tám hướng theo thứ tự Nam→Tây Nam→Tây→Tây Bắc→Bắc→Đông Bắc→Đông→Đông Nam. Có FPS/loop/event bước chân, release/contact/trail/end. Skin, weapon, vfx-behind, vfx-over dùng lưới/frame/hướng chung. Manifest mô tả47 biến thể kiếm theo equipment/element/aura.

PROVENANCE ghi `PixelLab MCP (Pro Flash character, animate_character, animate_with_skeleton_v3)`, builder Python, `pixelsResampled:false`,104 offset cho13 motion×8 hướng và tám frame override run Tây. Phương pháp đáng học là **identity trước → animation giữ nhân vật/skeleton → đăng ký điểm đất → layer cùng timeline**, thay vì vẽ nhóm skill như concept độc lập. Thư mục này chỉ có PNG/metadata, không có builder hoặc implementation skeleton. `displayHeight` không bằng đơn giản `standingHeight × scale`; không sao chép các số như công thức đã xác nhận.

Một số bộ default ghi mirror hoặc giữ pose để vá thiếu. Không lấy chúng làm chuẩn đủ tám hướng cho Vân Hải; hướng thiếu/vá phải báo riêng. Tag invulnerability/contact của animation không tự cấp quyền né/damage trên server.

## Quy trình áp dụng

1. **Master tám hướng:** cùng appearance có neutral pose thật, giữ nhận diện Vương Lâm áo xám/cổ ngà/tóc buộc/đai tối. Đo sọ/mặt, cổ, vai, hông, gối và điểm đất theo góc. Mở đầu/hồi thế đối chiếu master đúng hướng. Tay giơ rộng hoặc thân lunge thấp là thay pose; đầu/thân đổi cỡ là lỗi.
2. **Animation từ master:** brief có keypose, chân trụ, nhịp lấy thế/phát/hồi. Hướng production ưu tiên pixel native và animation giữ skeleton/identity như reference. PixelLab chưa được kết nối phiên này. ImageGen dùng cho study hiện tại; source lớn trích xuống native ghi `pixelsResampled:true`, không gọi pipeline PixelLab đã triển khai.
3. **Registration:** scale physical chung theo nguồn và đối chiếu landmark master giữa nguồn. Không fit từng pose. Đo chân trụ/root thật, tách translation/padding khỏi anatomy. Không coi median đáy hàng là chân đúng của mọi frame/loài.
4. **Layer đồng bộ:** body/appearance, weapon, trail, ground/rear/front aura có binding rõ. Vũ khí có thể trước/sau tay/thân tùy pose; dùng socket direction×frame hoặc layer cùng skeleton, không tọa độ tĩnh cho mọi frame. Costume mới theo pose master, không scale áo/đầu riêng.
5. **Nối Core:** server facts→timeline/presentation→catalog→renderer. ART tag giúp biên tập timing; server quyết định cast/release/damage, cancel, entitlement/trang bị. Motion/appearance không sở hữu save/cân bằng. Attachment dùng depth group actor, không nổi trên mọi mái/tán. Shared clock/frame giữ body–weapon–trail cùng pha.
6. **Kiểm chuyển action trước mở rộng:** master→idle→run→cast→idle; loop cuối→đầu và direction swap tại1×,2×/4×, Three trên map. Kiểm hash/UV/alpha riêng với review anatomy/motion; không tự bật artApproved.
7. **Bàn giao:** nguồn nguyên, prompt/input/hash, registration, canonical/atlas/frame/pivot/duration/socket, ma trận có/thiếu và quality theo hash. Không ghi đè pilot đã chốt hoặc nhân hàng trăm pose từ source còn sai tỷ lệ.

## Study đã làm và giới hạn

[Gói pixel study01](design/characters/wang-lin-pixel-production-study-v1/README.md) có **48 pose / 8 clip / hai hướng**, idle/run/cast_forward/cast_point. Các action cùng một sheet mỗi hướng, một scale theo sheet. Base64×96/(32,88), cast96×96/(48,88) chỉ thêm padding. Sau nearest/palette, contour sole đã xem được đăng ký để mép dưới giày ởpixel87, ground boundary88; không scale từng pose.

Trang đặt chibi gốc tĩnh, production01 và mẫu mới cạnh nhau. Native2× để đọc pixel, scene Three32part tạicamera1× để so cỡ chơi; seek/đổi hướng/chạy/đứng→cast→đứng. Scene/nav/DB/runtime catalog cũ/reference không bị ghi. Chưa có vũ khí/VFX mới, sáu hướng còn lại hoặc toàn bộ action player. Layer là cấu trúc sản xuất tiếp theo, không phải deliverable đã có của sample.

[Kiểm asset](data/wang-pixel-study-verification.json):48 frame/canvas/pivot/alpha/atlas, scale theo nguồn, hash baseline/reference. [Kiểm browser](data/wang-pixel-study-browser-verification.json):48 seek, quad theo canvas, ba actor cùng y992,32part, playback, layout1366/390px, không lỗi JS. Các kiểm này không tự đánh giá đầu/thân hoặc thay owner review.

Tiếp sau đối chiếu: khóa style/master tám hướng→locomotion→combo/cast/hit/death cùng master→vũ khí/socket/trail→quái/boss theo loài→fixture encounter. Audit: `node scripts/audit-actor-animation-reference.mjs`. Study: `node scripts/build-wang-pixel-study.mjs`; kiểm `node scripts/verify-wang-pixel-study.mjs` và `node tests/smoke/wang-pixel-study-browser.mjs` khi Vite5174 chạy. Không gọi map builder/backend live.
