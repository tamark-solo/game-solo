# Bộ Nguyên Anh · Linh ảnh khí ấn · source 2.0.0 / pack 2.0.1

Thiết kế lại linh ảnh sau phản hồi về thẩm mỹ và trải nghiệm: **nửa thân gợi bằng nét linh khí, mặt và thân rỗng, không tóc/da/áo/giày như một nhân vật thứ hai**. Cùng nét ngọc/ngà/vàng của VFX đã chọn; Kiếm có ba tia kiếm tại thủ quyết, Lôi có phù kim cương bạc tím, Phong có dải khí lụa. Nhân vật chính và các hiệu ứng đánh giữ nguồn đã sản xuất.

[Preview Kiếm](nguyen-anh-kit.html?family=sword) · [Lôi](nguyen-anh-kit.html?family=thunder) · [Phong](nguyen-anh-kit.html?family=wind) · [Thư viện 15 skill](skill-library.html) · [ZIP 2.0.0](releases/nguyen-anh-kit-2.0.0.zip).

## Bộ hiện tại và phiên bản

| Skill | Folder | PNG / atlas | Vẽ lại lần này | Giữ nguyên từ R04 V1 |
| --- | --- | --- | --- | --- |
| Kiếm Linh Ảnh | r04-sword-v2 | 56 / 7 | 6 linh ảnh | 50 |
| Linh Ảnh Lôi Ấn | r04-thunder-v2 | 54 / 7 | 6 linh ảnh | 48 |
| Linh Ảnh Phong Bộ | r04-wind-v2 | 46 / 5 | 6 linh ảnh | 40 |
| Tổng | | **156 / 19** | **18** | **138 PNG nguyên byte** |

Tính so với nền R03, R04 vẫn có 40 frame bổ sung và 116 PNG dùng lại. Riêng lần redesign này thay cả 18 frame linh ảnh; 22 frame kiếm bay/lôi dệt/phong hai tầng của R04 và 116 PNG R03 giữ nguyên. Linh ảnh là ART trang trí, không tạo actor, AI, collider, damage hoặc miễn nhiễm. Tên chiêu/hình thái là thiết kế game, không xác nhận thuật pháp nguyên tác.

Các folder V1, helper V1 và archive 1.0.0/1.0.1 giữ nguyên. Preview hiện trỏ V2; ba pack skill **2.0.1** ghi duyệt, asset giữ nguyên từ 2.0.0. [Hồ sơ duyệt](releases/nguyen-anh-approval-2.0.1.json). ZIP chung 2.0.0 chứa thư viện hiện tại **532 PNG / 62 atlas** và bản R04 V1 để kiểm/so sánh: tổng nội dung archive **688 PNG / 81 atlas**. Các con số có phần dùng lại giữa cảnh giới/phiên bản, không phải số hình độc nhất. ZIP không lồng các ZIP release; nút tải gói trên bản giải nén cần workspace gốc.

Giải nén, chạy `python serve-preview.py`, mở `http://127.0.0.1:4185/skill-library.html`. Nếu cổng đang được dùng, dừng server cũ hoặc chọn cổng khác. ZIP riêng có một skill/helper, không có preview web. R04 V2 đã được chủ dự án chấp nhận trong yêu cầu đóng gói và nâng cấp; chưa tích hợp game.

## Silhouette, cỡ và nhịp

World 960×640, orthographic; 1× = world px trên CSS px, DPR tối đa 2. Viewport nhỏ cắt vùng nhìn. Thân Vương Lâm vẫn tối đa khoảng 80 world px; idle 64×96, cast kiếm/lôi 96×96, phong 112×96. Character nearest; FX/linh ảnh linear, alpha blend thường. Vùng gameplay và trang trí tách riêng.

Ba linh ảnh dùng canvas **80×80**, anchor **40,72 tại gốc khí**, scale 1, vùng ảnh cao tối đa 48 px; thực tế sau đăng ký: Kiếm 50×43, Lôi 51×38, Phong 54×34. Anchor không phải chân một nhân vật. Offset xuất hiện **[-42,-34]** từ điểm chân host, layer **0.5 luôn phía sau body layer 1**. Opacity theo sáu frame [0.3,0.65,0.85,0.65,0.32,0.06]; hình rỗng để giữ khả năng đọc. Scale cố định từng clip, không kéo từng frame đầy khung.

24 FPS, sự kiện tác giả từ frame 1. Kiếm: linh ảnh F3, hold [2,2,6,1,2,4]; release F13. Lôi: linh ảnh F4, hold [2,2,4,3,2,2]; release F13. Nét khí đi qua tụ → hiện thủ quyết → xuất → thu thành dải → tan. Linh ảnh không phải vòng buff đứng liên tục.

Phong: hiện F4, phát pose 1/2/3 với [2,2,2], giữ pose 3 chờ arrival thật tối đa 48 tick từ khi hiện. Host xác nhận đáp mới phát pose 4/5/6 với [1,2,2], nội suy offset về **[0,-34] tại vùng thân** trong năm tick rồi tắt. Preview F16 đáp là mô phỏng. Bản V2 **bỏ tàn ảnh thân người**; còn hai dòng phong và linh ảnh khí ấn. Không sửa PNG pose Vương Lâm hoặc di chuyển actor từ VFX.

Hit/expire/projectile pose do combat host; arrival/vị trí actor do movement host. Lôi chỉ phát bolt/weave khi nhận hit, impact sau hai tick hình; damage không đợi hình. Hit/arrival trùng bị bỏ qua, render trễ không hồi sinh projectile hoặc phase đã kết thúc. Boss đổi điểm chạm, không phóng effect. Impact không gắn với bia đá/vật liệu; preview quái/boss là vùng chạm thử.

## Nguồn/prompt và pipeline

Dùng **imagegen tích hợp**, ba prompt thuộc nhóm stylized-concept: sprite sheet RGBA sáu frame nửa thân khí ấn, nét ngọc hoặc bạc tím/ngà/vàng, không khuôn mặt và trang phục, khoảng trống rõ, gốc khí ổn định. Tham chiếu nguồn wheel/core/trail của R03 để khớp vật liệu.

- [Prompt Kiếm](r04-sword-v2/prompts/spirit-sword-sigil.txt) · [source](r04-sword-v2/source/spirit-sword-sigil.png).
- [Prompt Lôi](r04-thunder-v2/prompts/spirit-thunder-sigil.txt) · [source](r04-thunder-v2/source/spirit-thunder-sigil.png).
- [Prompt Phong](r04-wind-v2/prompts/spirit-wind-sigil.txt) · [source](r04-wind-v2/source/spirit-wind-sigil.png).

[r04-spirit-v2-art-selection.json](production/r04-spirit-v2-art-selection.json) ghi bản sinh gốc, source được chọn, prompt và SHA-256. Mỗi folder có provenance.json, export-spec.json, PNG rời, atlas, metadata và review. `frames/<clip>/001.png` là nguồn chỉnh sửa chính; atlas là output. Node/Sharp chỉ crop, resize đồng nhất, đăng ký gốc khí và pack. CellRects dùng khoảng trống giữa frame để giữ nét xuất chiêu; không vẽ/sửa ảnh bằng script.

Initial extraction V2: `export-r04-sequences.mjs` trên folder V2 → `build-r04-spirit-v2.mjs` ghép clip đã giữ → `pack-atlases.mjs`. Không chạy extraction/merge đè frame đã chỉnh. Build thường xuyên chỉ pack.

```powershell
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r04-sword-v2
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r04-thunder-v2
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r04-wind-v2
node --test docs/design/vfx/production/r04-spirit-v2.test.mjs
```

## Handoff programmer

V2 dùng `production/r04-sigil-controller.mjs` (export R04VfxController), `r04-sigil-model.mjs` cho preview và `spirit-sigil-model.mjs` cho linh ảnh. Helper V1 vẫn riêng. API: beginCast({castId,startedAt,foot,targetFoot}), setActorFoot(foot), setProjectilePose({tip,direction}), confirmHit({castId,hitId,worldPosition,confirmedAt,incomingDirection}), expireProjectile(...), confirmArrival({castId,worldFoot,arrivedAt}), update(now), endCast(), dispose(). Clock host dùng giây; frame được đổi qua FPS.

Draw record có clip/sample/point/angle/layer/scale. Renderer áp dụng scale quanh pivot, alpha `sample.clip.opacities?.[sample.index] ?? 1`, sort layer/điểm chân. Một linh ảnh lấy mẫu trực tiếp trên mỗi cast, không actor mới; pool bounded cho impact/bolt/weave, thiếu slot bỏ lớp phụ. onEvent chỉ là visual, không cấp damage/miễn nhiễm/di chuyển. Chưa nối client/server.

## Kiểm và giới hạn thực tế

**50 kiểm tra đạt**: 38 kiểm R01–R03 và 12 kiểm R04 V2. Xác minh 156 PNG/19 atlas, rect/hold/alpha/opacity, 18 PNG linh ảnh thực sự thay đổi, 138 PNG còn lại nguyên byte, payload R04 V1 đã khóa, silhouette/lớp, hit/arrival thật, merge vào vùng thân, render trễ và giới hạn pool. Đã xem ảnh ghép Kiếm ở 1×/2×, Lôi tụ, Phong lướt/nhập. Có 30 capture V2, ba bảng R03/R04 và ba bảng trước/sau linh ảnh, render cục bộ từ atlas. Tương tác browser chưa được xác minh.

R04 V2 đã được chủ dự án chấp nhận, khóa bằng ba pack 2.0.1; source và ZIP 2.0.0 giữ nguyên. Chưa có hướng đầy đủ, SFX/icon, crowd LOD, benchmark hoặc runtime. [Bộ Hóa Thần R05](HOA-THAN-KIT.md) đã sản xuất theo mốc kế tiếp, 114 PNG/14 atlas, bản V2 tăng lực, chờ xem motion. Thư viện hiện tại 15 skill, 646 PNG/76 atlas.

R05 V3 quay về ngọc sáng, khí lụa, sét tím và phù vàng theo ảnh chủ dự án gửi. 58 frame mới / 56 frame giữ nguyên; Phong có tối đa hai tàn ảnh từ vị trí host có timestamp, không tạo actor. Camera feedback mặc định tắt. [Hồ sơ V3](HOA-THAN-KIT.md).
