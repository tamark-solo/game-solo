# Bộ Hóa Thần · Ý cảnh theo công pháp · 1.0.0

**Snapshot lịch sử tại mốc xuất nguồn:** số file, trạng thái chờ duyệt và thông số dưới đây được giữ để truy phiên bản. Bản hiện hành là [Hóa Thần V3/pack 3.0.1](HOA-THAN-KIT.md), đã chấp nhận và [đóng đợt ART 15 skill](STARTER-VFX-HANDOFF.md); không là backlog đang chờ motion. Preview chung hiện trỏ bản mới nhất.

Ba kỹ năng phát triển từ Nguyên Anh đã được chủ dự án chấp nhận: **Ý Cảnh Kiếm / Ý Cảnh Lôi / Ý Cảnh Phong**. Tăng uy lực bằng khoảng tĩnh, đường nét cô đọng và phản hồi mực/sương, giữ nguyên cỡ Vương Lâm chibi. Ba chủ đề ART Tĩnh Kiếm, Định Lôi, Phong Du là thiết kế cho game; chưa phải hệ thống công pháp gameplay hoặc thuật pháp được xác nhận trong nguyên tác.

[Preview Kiếm](hoa-than-kit.html?family=sword) · [Lôi](hoa-than-kit.html?family=thunder) · [Phong](hoa-than-kit.html?family=wind) · [Thư viện 15 skill](skill-library.html) · [ZIP chung R01 → R05](releases/hoa-than-kit-1.0.0.zip).

## Thành phần và nguồn dùng lại

| Skill | Folder | PNG / atlas | Frame mới | PNG dùng lại nguyên byte từ R04 V2 |
| --- | --- | --- | --- | --- |
| Ý Cảnh Kiếm | r05-sword-v1 | 42 / 5 | 6 tụ ý + 6 kiếm bay | 30 pose/tụ tay/impact |
| Ý Cảnh Lôi | r05-thunder-v1 | 40 / 5 | 8 ấn nền + 6 tia lôi | 26 pose/phù tay/impact |
| Ý Cảnh Phong | r05-wind-v1 | 36 / 4 | 8 đuôi lướt + 8 dư âm | 20 pose/vòng khởi phong |
| Tổng | | **118 / 14** | **42** | **76** |

Mỗi skill có source sheet, prompt, provenance, PNG RGBA rời, atlas, clips.json, skill.json, export-spec.json và ảnh review. PNG rời là nguồn chỉnh sửa chính; atlas là output. Bộ R05 mới chờ xem motion, chưa tích hợp game. Nguyên Anh được khóa bằng pack **2.0.1**, nguồn **2.0.0** không đổi; các gói lịch sử giữ nguyên.

Thư viện tại mốc snapshot 15 skill có **650 PNG / 76 atlas**, tính cả frame dùng lại giữa cảnh giới. ZIP chung giữ thêm ba folder R04 V1 để kiểm hồi quy và so sánh, nên nội dung archive là **806 PNG / 95 atlas**. Không coi đây là số hình độc nhất. ZIP chung không lồng ZIP riêng; tải từng skill từ thư viện workspace gốc. Mỗi archive có manifest và SHA-256.

Giải nén, chạy `python serve-preview.py`, mở `http://127.0.0.1:4185/skill-library.html`. Server dùng cổng 4185; nếu cổng đang được dùng, chạy bằng server hiện có hoặc đổi cổng trong bản giải nén. ZIP riêng chỉ có skill và các helper cần thiết, không có preview web.

## Cỡ và nhịp theo frame

World 960×640 orthographic, zoom 1× = 1 world px / CSS px, DPR tối đa 2. Khung nhỏ cắt vùng nhìn. Body tối đa 80 world px; idle 64×96, cast Kiếm/Lôi 96×96, Phong 112×96. Character nearest, FX linear, alpha blend thường. Padding canvas không tăng thân hay vùng gameplay.

| Chuỗi mới | Frame | Canvas | Anchor | Kích thước ảnh tối đa sau đăng ký |
| --- | --- | --- | --- | --- |
| sword-stillness | 6 | 160×128 | 80,72 · tâm ý kiếm | 104×62 |
| sword-flight | 6, loop | 208×144 | 174,72 · mũi kiếm | 152×83 |
| thunder-core | 8 | 192×144 | 96,80 · tâm nền | 144×97 |
| thunder-bolt | 6 | 144×240 | 72,200 · điểm chạm | 103×176 |
| wind-trail | 8, loop | 240×144 | 192,80 · đầu dòng phong | 164×93 |
| wind-return-curl | 8, không loop | 240×144 | 192,80 · gốc dư âm | 164×111 |

Tên kỹ thuật `wind-return-curl` được giữ để dùng adapter; ART R05 là dư âm hướng tới trước, tan tại điểm đáp, không kéo người trở lại. Không dùng linh ảnh hoặc tàn ảnh thân người trong R05.

Tác giả dùng frame từ 1 ở **24 FPS**; runtime host dùng giây và đổi qua FPS. Hold nhân vật Kiếm [1,1,2,3,9,1,2,2,2,1,1,2], Lôi [1,1,2,3,6,2,2,2,1,1,1,2], Phong [1,1,2,8,1,1,1,1,1,2,2,2]. Giữ pose tạo nhịp tĩnh; không tự khóa điều khiển hay tăng cooldown gameplay.

| Skill | Báo trước / tĩnh | Xuất chiêu | Kết thúc pose | Chạm / đáp |
| --- | --- | --- | --- | --- |
| Kiếm | F5 tụ ý, F13 cô đọng | F17 một kiếm bay | F28 | Host xác nhận hit mới phát qi-impact |
| Lôi | F4 biên ấn, F10 định lôi | F16 | F25 | Host hit phát bolt; impact sau 1 tick hình |
| Phong | F5 giữ bước | F13 yêu cầu chuyển động | F24 | Host arrival mới phát dư âm; preview minh họa F19 |

Lôi có lớp tương phản nền tùy chọn quanh chân mục tiêu: ellipse bán kính **72×48 world px**, alpha tối tối đa **0.12**, lóe cục bộ [0.18,0.10,0.03] trong ba tick sau hit. Đây là lớp Canvas bổ trợ; ấn và sét chính vẫn là PNG sequence. Không đổi exposure/camera toàn màn hình. Vòng ấn là trang trí; vùng nguy hiểm gameplay phải vẽ từ dữ liệu combat riêng.

Impact dùng cho PvP, nhân vật, quái và boss, không chứa bia đá/rubble. Boss đổi điểm neo, không phóng ảnh. Preview quái/boss dùng vùng chạm thử; chưa sản xuất sprite quái/boss.

## Nguồn và pipeline

Dùng **imagegen tích hợp**, nhóm prompt stylized-concept: sheet RGBA 6/8 frame, nét ngọc/ngà/vàng hoặc bạc/tím, mực và sương, alpha thật, khoảng trống rõ, không nhân vật hoặc cảnh nền. Tham chiếu nguồn R04 để giữ vật liệu.

- Kiếm: [prompt tụ ý](r05-sword-v1/prompts/sword-stillness.txt), [source](r05-sword-v1/source/sword-stillness.png); [prompt kiếm bay](r05-sword-v1/prompts/sword-ink-flight.txt), [source](r05-sword-v1/source/sword-ink-flight.png).
- Lôi: [prompt ấn](r05-thunder-v1/prompts/thunder-ink-domain.txt), [prompt sửa khoảng trống giữa cell](r05-thunder-v1/prompts/thunder-ink-domain-v2.txt), [source chọn](r05-thunder-v1/source/thunder-ink-domain-v2.png); [prompt tia](r05-thunder-v1/prompts/thunder-command-bolt.txt), [source](r05-thunder-v1/source/thunder-command-bolt.png).
- Phong: [prompt lướt](r05-wind-v1/prompts/wind-ink-trail.txt), [source](r05-wind-v1/source/wind-ink-trail.png); [prompt dư âm](r05-wind-v1/prompts/wind-path-echo.txt), [source](r05-wind-v1/source/wind-path-echo.png).

[r05-art-selection.json](production/r05-art-selection.json) ghi đường dẫn ảnh sinh gốc, prompt, nguồn chọn và SHA-256. Ấn Lôi có một lần sửa bằng imagegen để bỏ cột sương vượt cell; bản đầu vẫn được lưu. Node/Sharp chỉ crop, đăng ký pivot, resize với một scale chung cho cả sequence và pack; không vẽ hiệu ứng bằng script. Pivot lấy từ mũi kiếm, điểm chạm hoặc tâm ấn thật, không tự phóng từng frame.

Initial extraction: `export-r04-sequences.mjs <folder R05>` → `build-r05.mjs` ghép 76 PNG giữ nguyên → `pack-atlases.mjs <folder>`. Chỉ chạy extraction/merge khi tạo bộ ban đầu; build sau khi artist sửa PNG chỉ chạy pack.

```powershell
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r05-sword-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r05-thunder-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r05-wind-v1
node --test docs/design/vfx/production/r05.test.mjs
```

## Handoff programmer

`production/r05-controller.mjs` export R05VfxController, dùng R02 adapter đã khóa. API: beginCast({castId,startedAt,foot,targetFoot}), setActorFoot(foot), setTargetFoot(foot), setProjectilePose({tip,direction}), confirmHit({castId,hitId,worldPosition,confirmedAt,incomingDirection}), expireProjectile(...), confirmArrival({castId,worldFoot,arrivedAt}), update(now), endCast(), dispose(). Dùng cùng clock host.

Host cung cấp damage/hitbox, projectile pose, vị trí actor và arrival. VFX không gây damage, di chuyển, triệu hồi AI hoặc cấp miễn nhiễm. onEvent chỉ báo trình bày. Preview model mô phỏng đường bay/lướt để xem ART; không đưa vận tốc/khoảng cách đó vào combat tự động.

Record sprite gồm clip/sample/point/angle/layer/scale; opacity từ sample.clip.opacities[sample.index] nếu có. Lớp nền 0, body 1, attack 2, impact 3. Record `kind: localContrast` không có sample: renderer xử lý bằng drawIntentLighting hoặc shader tương đương, layer 0.25. Hit trùng bị bỏ qua; render trễ không hồi sinh projectile. Effect pool có giới hạn; khi hết slot bỏ lớp phụ.

## Kiểm và phần còn lại

**60 kiểm tra đạt**: 38 R01–R03, 12 R04 V2, 10 R05. Kiểm RGBA/rect/hold/opacity, 42 frame mới và 76 PNG nguyên byte, payload gói cũ, nhịp release, hit/miss/trễ, anchor boss, arrival thật, lighting cục bộ và giới hạn pool. Đã render 30 capture R05 tại 1×/2× và ba bảng R04/R05 từ atlas; đã xem ảnh tụ, xuất, chạm và dư âm. Tương tác browser chưa được xác minh.

P5 đã có ART cho cả Nguyên Anh và Hóa Thần; Nguyên Anh được chấp nhận, Hóa Thần chờ xem motion. Chưa có hướng đầy đủ, SFX/icon, crowd LOD, benchmark hoặc tích hợp runtime. Không báo hoàn tất sản xuất game chỉ từ gói ART này.
