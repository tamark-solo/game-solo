# Bộ Trúc Cơ · 1.0.0

P3 đã sản xuất đủ **Ngự Kiếm, Liên Lôi Ấn, Hồi Phong Bộ**. Chủ đề là linh khí được tổ chức: thêm đội hình, đường điều khiển và trình tự hội tụ từ mỹ thuật Ngưng Khí đã được chấp nhận. Chủ dự án đã chấp nhận bộ Trúc Cơ và yêu cầu đóng gói/nâng tiếp. Ba ZIP skill 1.0.1 ghi duyệt; snapshot ZIP 1.0.0 được giữ nguyên. Chưa tích hợp game.

| Skill | PNG / atlas | Frame FX vẽ mới | Cấu trúc nâng cấp |
| --- | --- | --- | --- |
| Ngự Kiếm · R02-SWORD | 50 / 6 | 20 | formation 8, flight 6, cung dẫn 6; một kiếm chính và hai kiếm phụ cùng trục |
| Liên Lôi Ấn · R02-THUNDER | 44 / 5 | 8 | ba dấu phụ lần lượt hội tụ về tâm chính; tiếp nối sét và impact R01 |
| Hồi Phong Bộ · R02-WIND | 38 / 4 | 20 | departure coil 8, return curl 12; đuôi khí hồi sau khi đáp |
| Tổng P3 | **132 / 15** | **48** | 84 PNG dùng lại nguyên byte từ R01 |

Return curl dùng 12 frame thay vì ngân sách dự kiến 10 để tách rõ cuộn, thu và tan. Pose và hit phù hợp được dùng lại; clip pose giữ nhịp mới bằng metadata hold, không vẽ/phóng lại nhân vật. Tổng 246 PNG / 28 atlas khi tính cả bộ nền R01 được kèm trong ZIP chung; số này đếm từng file bàn giao, có nội dung dùng lại.

## Xem và tải

[Thư viện sáu skill](skill-library.html) · [Preview Trúc Cơ](truc-co-kit.html?family=sword) · [ZIP chung, kèm Ngưng Khí để so sánh](releases/truc-co-kit-1.0.0.zip).

Mỗi skill có ZIP độc lập dưới `releases/skill-packs/`, kèm source, prompt, PNG, atlas, timeline, helper trình bày và manifest SHA-256. ZIP từng skill không kèm trang preview. ZIP chung có đủ sáu skill, các trang preview, ảnh so sánh, hồ sơ và server xem cục bộ. Không đóng ZIP vào chính ZIP chung; các liên kết tải trong bản giải nén cần file release ở workspace gốc. Chạy `python serve-preview.py` tại thư mục giải nén, rồi mở `http://127.0.0.1:4185/skill-library.html`. Nếu server preview đã chạy ở cổng này, dừng phiên cũ trước khi chạy bản giải nén.

## Frame và điểm neo

24 FPS, frame event bắt đầu từ 1. Thân Vương Lâm hướng đông giữ tối đa khoảng 80 world px; cast canvas có padding, không phải kích thước hitbox. World 960×640; zoom 1× giữ một world px bằng một CSS px, viewport nhỏ cắt vùng nhìn. Pose dùng nearest; FX dùng linear, alpha thông thường, atlas padding 2 px mỗi cạnh, không mipmap.

| Skill | Timeline tác giả | Vị trí được host cung cấp |
| --- | --- | --- |
| Ngự Kiếm | F1 tụ, F3 formation, F5 cung dẫn, F11 release, F14 hồi, F21 pose kết | socket/formation cạnh người; mũi và hướng projectile; vị trí hit thực |
| Liên Lôi Ấn | F4 hiện dấu, F7/F9/F11 hội tụ, F10 release, F16 hồi, F19 pose kết | điểm chân mục tiêu để đặt trận; điểm chạm cho bolt/impact |
| Hồi Phong Bộ | F1 cuộn, F4 tổ chức, F8 yêu cầu lướt, F14 hồi, F18 pose kết | vị trí actor từng tick và điểm đáp thật |

Hit không khóa vào F cố định: preview mô phỏng contact và xác nhận, runtime nhận `combat.hitConfirmed`. Lôi dẫn hình hai tick trước impact, không trì hoãn damage. Kiếm biến mất khi contact/expire; hit trễ bắt đầu impact sau xác nhận. Hụt chỉ tan trên đường bay. Phong chỉ phát return curl khi `movement.arrived`; hình khí hồi không kéo actor về điểm cũ.

| Clip mới | Canvas PNG | Anchor | Vùng ảnh cực đại đã xuất, xấp xỉ |
| --- | --- | --- | --- |
| sword-formation | 192×144 | 96,72 | 140×97 world px |
| sword-flight | 208×144 | 174,72 · mũi dẫn | 152×104 |
| sword-guide | 96×64 | 12,32 | 62×29 |
| thunder-convergence | 176×128 | 88,72 · tâm trận | 124×92 |
| wind-departure-coil | 128×96 | 64,52 | 88×59 |
| wind-return-curl | 208×144 | 156,80 · điểm đáp | 136×86 |

Đây là vùng ảnh trang trí, không phải range/hitbox/balance. Impact dùng cho nhân vật/PvP/quái/boss, không gắn với bia đá hoặc vật liệu đá. Preview quái/boss hiện vùng chạm thử; chưa có sprite quái/boss mới. Bộ hướng đông chưa đủ bộ hướng MMO; adapter có hướng projectile nhưng pose và cấu trúc formation cần sản xuất các hướng tương ứng khi tích hợp.

## Pipeline và bàn giao cho programmer

`frames/<clip>/001.png` là nguồn frame chuẩn. `source/` giữ sheet imagegen, `prompts/` giữ prompt mới và prompt R01 được sao lưu; `clips.json` chứa hold, scale chung, anchor, rect atlas và provenance `reusedFrom`. `skill.json` chứa timeline/authority; trạng thái duyệt bản đóng gói được ghi trong `library.json` và `PACK-MANIFEST.json`, không sửa snapshot nguồn R01 đã khóa.

Initial extraction vào phiên bản mới: chạy `export-sequences.mjs` cho cả ba R02 → `build-r02.mjs` dùng lại nguồn R01 → `pack-atlases.mjs` từng bộ. Extraction/merge sẽ thay PNG/metadata đích; không chạy lên bản đã chỉnh frame. Build thường xuyên chỉ pack từ PNG hiện có. Node cần Sharp; trình xem browser dùng module thuần, không cần Sharp.

```powershell
# Từ root repository; pack không thay PNG nguồn.
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r02-sword-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r02-thunder-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r02-wind-v1
node --test docs/design/vfx/production/r02.test.mjs docs/design/vfx/production/p2.test.mjs docs/design/vfx/frame-by-frame-r01/sequence-system.test.mjs
```

`production/r02-controller.mjs` là adapter trình bày, chưa nối client. Caller gọi `beginCast`, cập nhật `setActorFoot` / `setProjectilePose`, chuyển hit vào `confirmHit` hoặc hụt vào `expireProjectile`, chuyển đáp vào `confirmArrival`, lấy draw records bằng `update`, và kết thúc bằng `endCast` / `dispose`. Mỗi actor một cast; pool giới hạn mặc định 32. Host quyết định damage, range, cooldown, movement, hit-stop và camera. Clip không cấp damage, miễn nhiễm hay teleport. Chưa có file SFX, icon, LOD đông người hoặc benchmark runtime.

## Kiểm và mốc tiếp theo

31 kiểm tra tự động qua. 24 ảnh R02 được render cục bộ từ atlas tại zoom 1×/2×, cùng ba bảng R01/R02; đây không phải xác minh tương tác trình duyệt. 84 PNG dùng lại và snapshot Kiếm R01 đã được kiểm byte/hash. Bộ mới cần xem motion thực trong preview, rồi các hướng và integration/hiệu năng trong game.

P4 Kết Đan tiếp tục bằng **Kiếm Luân / Lôi Hạch / Phong Luân**: thêm lõi, cấu trúc khép và nhịp xả lực. P4 đã sản xuất ba skill, xem [hồ sơ Kết Đan](KET-DAN-KIT.md); chưa duyệt motion mới. Nguyên Anh/Hóa Thần giữ mốc linh ảnh/ý cảnh đã phân bổ.
