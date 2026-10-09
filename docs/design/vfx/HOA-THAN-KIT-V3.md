# Hóa Thần V3 · Ngọc sáng, lụa khí và phù vàng · 3.0.0

**Snapshot lịch sử tại mốc xuất nguồn:** số file, trạng thái chờ duyệt và thông số dưới đây được giữ để truy phiên bản. Bản hiện hành là [Hóa Thần V3/pack 3.0.1](HOA-THAN-KIT.md), đã chấp nhận và [đóng đợt ART 15 skill](STARTER-VFX-HANDOFF.md); không là backlog đang chờ motion. Preview chung hiện trỏ bản mới nhất.

V3 thiết kế lại phần hình theo ảnh chủ dự án gửi. V2 nhấn lực bằng cạnh khí sắc và mảnh bật, làm lệch nền mỹ thuật đã chọn. V3 dùng kiếm ngọc trong, khí cong có khoảng trống, sét tím phân nhánh và dấu phù vàng. Uy lực đến từ tụ–xuất–chạm–tan có cấu trúc; không chỉ đổi màu, tăng bloom hoặc phóng người.

[Kiếm](hoa-than-kit.html?family=sword) · [Lôi](hoa-than-kit.html?family=thunder) · [Phong](hoa-than-kit.html?family=wind) · [ZIP V3](releases/hoa-than-kit-3.0.0.zip) · [Thư viện](skill-library.html).

## Hình và chuyển động

| Nhánh | V3 |
| --- | --- |
| Ý Cảnh Kiếm | Kiếm chủ đạo với hai bóng kiếm dẫn khí, đường ngọc/ngà cong và phù vàng. Tụ ý rồi phóng nhanh; va chạm thành lóe trắng, đường khí mở và tan. Tụ kiếm/flight nằm sau thân để giữ mặt và tay rõ. |
| Ý Cảnh Lôi | Trận nhiều vòng và phù vàng dưới chân mục tiêu; nhịp sét trắng/tím tự nhiên, impact riêng với vòng phù và dư sét. Vòng/phù là trang trí, không tạo thêm hit. |
| Ý Cảnh Phong | Lụa khí, lá và dấu vàng đi theo hướng lướt; tối đa hai tàn ảnh rất mờ phía sau thân. Khí thu ở vị trí đáp thực tế, không kéo người quay lại. |

Ảnh tham chiếu là concept minh họa trên bia đá. Asset sản xuất không chứa bia, đá vỡ, bụi vật liệu hoặc máu; hit đặt theo điểm host xác nhận nên dùng cho PvP, nhân vật, quái và boss. Preview quái/boss dùng hurt-volume minh họa, không phải sprite quái đã sản xuất. Ba chủ đề Ý Cảnh là hướng ART cho game, chưa xác nhận là công pháp độc quyền/canon của Vương Lâm.

## Bộ asset

| Skill | Nguồn | PNG / atlas | Frame mới | PNG giữ nguyên từ V2 |
| --- | --- | --- | --- | --- |
| Kiếm | r05-sword-v3 | 38 / 5 | 6 tụ ý + 6 flight + 8 impact | 18 pose/tụ tay |
| Lôi | r05-thunder-v3 | 40 / 5 | 8 trận + 6 bolt + 8 impact | 18 pose/phù tay |
| Phong | r05-wind-v3 | 36 / 4 | 8 trail + 8 đáp | 20 pose/vòng khởi |
| Tổng | | **114 / 14** | **58** | **56 nguyên byte** |

PNG RGBA rời trong frames/ là nguồn chính. Atlas chỉ là output build. Có source, prompt, provenance, export-spec, clips.json, skill.json và review ở từng folder. Source/pack V3 là 3.0.0, **chờ chủ dự án xem motion**; không ghi duyệt thay người dùng. R04 đã được chấp nhận. Các folder/helper và ZIP V1/V2 giữ nguyên.

Thư viện tại mốc snapshot 15 skill: **646 PNG / 76 atlas**. ZIP chung giữ thêm R04 V1, R05 V1/V2 để chạy hồi quy: **1032 PNG / 123 atlas**. Đây là số file, có frame dùng lại giữa cảnh giới/phiên bản. ZIP chung không lồng ZIP riêng từng skill. Giải nén, chạy `python serve-preview.py`, mở `http://127.0.0.1:4185/skill-library.html`.

## Tỷ lệ và frame events

24 FPS; frame tác giả từ 1. World 960×640 orthographic, 1× = world px/CSS px, DPR tối đa 2; viewport nhỏ cắt vùng nhìn. Body Vương Lâm tối đa 80 world px, idle 64×96, cast Kiếm/Lôi 96×96 và Phong 112×96; padding không làm body lớn. Character nearest, FX linear, normal alpha.

| Clip mới | Frames | Canvas / anchor | Visible tối đa (world px) |
| --- | --- | --- | --- |
| sword-stillness | 6 | 208×144 / 176,80 | 144×97 |
| sword-flight | 6 loop | 288×176 / 248,96 mũi chính | 216×129 |
| qi-impact | 8 | 192×176 / 96,88 điểm chạm | 116×104 |
| thunder-core | 8 | 272×224 / 136,164 tâm chân | 155×128 |
| thunder-bolt | 6 | 176×256 / 88,208 điểm chạm | 162×167 |
| thunder-impact | 8 | 192×176 / 96,88 điểm chạm | 132×136 |
| wind-trail | 8 loop | 288×176 / 248,96 đầu phong | 188×123 |
| wind-return-curl | 8 | 224×176 / 112,120 chân đáp | 121×58 |

Scale cố định cả chuỗi; không phóng riêng frame tan. Kiếm release F11, Lôi F12, character end F20. Phong preview yêu cầu move F10, đáp F15, recovery F16, pose end F22; 160 px trong năm tick ease-out chỉ là đường minh họa. Projectile preview 1056 world px/s và initial tipAhead 48. Host quyết định tốc độ, đường đi, hit/damage và phạm vi thực tế.

Impact có hold [1,1,1,1,2,2,2,2]. Lôi bolt [1,1,1,1,1,2], impact trễ một tick hình so với sét; damage không đợi artwork. Một kiếm chính nhận hit; hai bóng kiếm không gây damage. Dấu phù/vòng trận không tự tạo damage event.

Camera feedback **mặc định tắt**, reduced-motion cũng tắt. Khi bật: rung tối đa 2 world px và visual hit-stop Kiếm/Lôi/Phong 60/50/35 ms; chỉ tại hit/arrival đã xác nhận. Không dừng combat clock, không flash toàn màn hình. Lôi có tương phản cục bộ 72×48 px, alpha tối tối đa .12; lớp này tắt được riêng.

## API và quyền host

`R05JadeVfxController` trong [r05-jade-controller.mjs](production/r05-jade-controller.mjs) mở rộng helper R05 V2. API `beginCast`, `setActorFoot`, `setTargetFoot`, `setProjectilePose`, `confirmHit`, `expireProjectile`, `confirmArrival`, `update`, `endCast`, `dispose` giữ hợp đồng trước. `update(now)` trả sprite records; `feedback(now)` và `onFeedback` là tùy chọn hình ảnh.

Phong nhận lịch sử vị trí thật qua `setActorFoot([x,y], {sampledAt: hostTimestampSeconds})`, cùng hệ thời gian với `startedAt`/`update`. Legacy call không timestamp vẫn cập nhật body, không tự tạo lịch sử tàn ảnh. History tối đa 8 snapshot được copy; snapshot cũ không ghi vào history. Echo lấy mẫu trễ 2/4 tick, alpha tối đa .12/.06, layer .75 sau body; chỉ khi đã di chuyển ít nhất 4 px và tan hết sau hai tick kể từ arrival thực tế. Echo là sprite presentation, không có actor/AI/collision/damage/miễn nhiễm. Bộ VFX không tự di chuyển actor hoặc gây damage.

## Nguồn và pipeline

Dùng **imagegen tích hợp**. [Ảnh tham chiếu](reference-hoa-than-user-v3.png) và [hồ sơ chọn nguồn, SHA và prompt](production/r05-jade-art-selection.json) được lưu trong workspace. [Prompt ban đầu của tám sheet](production/r05-jade-generation-jobs.json); mỗi folder có prompts/ và source/. Sheet contact Lôi được chọn lại vì bản đầu các frame quá sát nhau; prompt chính xác của bản chọn: [golden-thunder-contact-gutter.txt](r05-thunder-v3/prompts/golden-thunder-contact-gutter.txt).

Node/Sharp chỉ crop theo cell, đăng ký pivot, resize đồng nhất và pack; không vẽ lại hoặc tô xóa ART bằng script. Initial extraction: `export-r04-sequences.mjs <folder>` → `build-r05-jade.mjs` ghép 56 PNG → `pack-atlases.mjs <folder>`. Sau khi artist sửa frame rời, chỉ chạy pack, không chạy lại extraction/merge đè nguồn đã sửa.

## Kiểm chứng và phần còn lại

**87 kiểm tra tự động đạt**: PNG RGBA/rect/holds, nguồn dùng lại và gói cũ nguyên byte, skipped frame, hit/miss/trễ, boss anchor, movement/arrival từ host, local lighting, echo timestamp/lifetime và pool. Render cục bộ từ atlas có 30 capture V3 ở 1×/2× và ba so sánh V2/V3. Đã xem ảnh cục bộ, chỉnh sorting để kiếm không phủ thân.

Tương tác browser chưa xác minh vì quyền localhost bị từ chối ở phiên trước. Test xác nhận cấu trúc và hợp đồng, không thay thế đánh giá mỹ thuật/motion của chủ dự án. Chưa tích hợp client/server, sản xuất SFX/icon, toàn bộ hướng, crowd LOD hoặc benchmark. Pose body giữ artwork cũ, điều chỉnh holds; chưa vẽ lại animation toàn thân.

[Hồ sơ V1 lịch sử](HOA-THAN-KIT-V1.md) · [Hồ sơ V2 lịch sử](HOA-THAN-KIT-V2.md).
