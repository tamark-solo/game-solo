# Thanh HUD desktop — Vân Ngọc, bản 03

**09/10/2026 · _MMO.** Chủ dự án cung cấp mẫu HUD MMO có khung mỹ thuật liền, cầu tài nguyên và dãy kỹ năng. Bản 03 chuyển theo cấu trúc **Type 2** trong mẫu, phối đồng cổ / ngọc / mây cuộn để hợp chất tu tiên và map Hằng Nhạc. Chủ dự án đã xác nhận duyệt HUD và yêu cầu ghép vào game. HUD đã nối vào `/hang-nhac.html` qua snapshot server và SkillSession; trang demo giữ riêng để đối chiếu. Desktop giữ artwork 760 × 140; màn hình hẹp có fallback chức năng với ba nút 48 px. Xem [bàn giao HUD/layer](HANG-NHAC-HUD-LAYERS.md).

[Mở bản thử](http://127.0.0.1:5173/skill-bar-desktop.html) · [Ảnh / artwork / prompt](design/ui/desktop-skill-hud-v3/README.md) · [Skill core](SKILL-CORE.md).

**Khí quang 02:** owner thấy FX đầu tiên quá nhẹ. [Mẫu tham khảo và bản ghép mới](design/ui/desktop-skill-hud-v3/qi-v2/README.md) bổ sung khí xoáy ImageGen 50 KB, kính/thể tích cầu, vòng trận pháp và ánh hắt lên khung. Bật/tắt **Linh quang** để đối chiếu. FX đọc snapshot trình bày, không sở hữu skill; tab ẩn/mất kết nối dừng vòng lặp, reduced motion giữ vẻ tĩnh. Đã ghép vào runtime theo yêu cầu trực tiếp của chủ dự án; duyệt hình không được suy từ kiểm kỹ thuật.

## Bố cục

- Một khung liền rộng **760 px**, cao **140 px**, giữa cạnh dưới vùng chơi, cách mép 14 px; kích thước giữ nguyên trên desktop, không phóng theo màn hình.
- Cầu **sinh lực đỏ** bên trái, **linh lực ngọc xanh** bên phải. Lỗ cầu 67 px; số hiện có / tối đa và nhãn ngắn đọc được khi chơi. Mức tài nguyên hạ từ trên xuống trong cầu; khung có alpha để giữ viền mỹ thuật.
- Dãy giữa có **10 ô 36 × 36 px**, phím nằm dưới ô như mẫu. Ba ô đầu là Kiếm Khí / Lôi Ấn / Ngự Phong Bộ, phím 1 / 2 / 3.
- Bảy ô 4–0 là chỗ chưa gán, hiển thị mờ, không phải button, không focus hoặc gửi yêu cầu kỹ năng. Chưa thêm skill, vật phẩm, hotkey hoặc gameplay mới.
- Khung dùng tranh vẽ mây / sen / đồng / ngọc, không sao chép các họa tiết gothic trong mẫu. Icon dùng lại atlas ImageGen 02; hai cầu, nút, số, cooldown và tooltip do HTML/CSS trình bày.

## Artwork

Khung tạo bằng **built-in ImageGen** với ảnh mẫu của chủ dự án làm tham chiếu bố cục. PNG nguồn 2172 × 724 được giữ nguyên; ba lỗ (hai cầu và tray) có alpha. Xuất WebP 1520 × 280 cho mật độ 2× ở kích thước hiển thị 760 × 140: cắt riêng lề trong suốt phía trên/dưới, thu mẫu đồng đều Lanczos3, quality 94 / alpha quality 100. Khung **169.946 byte**, cộng icon 15.062 byte; không blur/sharpen hoặc tái vẽ nguồn bằng mã.

Nguồn, mẫu tham chiếu, prompt và hash nằm trong [thư mục artwork 03](design/ui/desktop-skill-hud-v3/README.md). Chạy **node scripts/build-skill-hud-frame.mjs** để xuất lại sau khi kiểm hợp đồng nguồn; **npm run assets** đồng bộ WebP/icon vào public. Thay nguồn cần xem lại crop và vị trí lỗ, không scale độc lập từng phần để che sai lệch.

## Trạng thái và thao tác

| Trạng thái | Hiển thị / hành vi |
| --- | --- |
| Sẵn sàng | Icon sáng; click hoặc 1/2/3 gọi callback |
| Hồi thuật | Vòng che giảm dần và số giây trong icon |
| Đang thi triển | Dấu chờ, khóa yêu cầu mới; tooltip giải thích thuật đang dùng |
| Thiếu linh lực | Icon mờ / dấu !, cầu linh lực còn đúng mức; tooltip ghi chi phí và số hiện có |
| Sinh lực thấp | Cầu đỏ hạ đúng mức, số đọc được; không tự khóa kỹ năng |
| Thiếu mục tiêu | Chỉ Lôi Ấn bị khóa; Kiếm/Phong theo hướng ngắm |
| Mất kết nối | Các ô đã gán mờ / dấu !; không gửi yêu cầu cast |

Tên, chi phí và mô tả mở khi rê chuột hoặc Tab tới ô; tooltip nằm phía trên khung, giới hạn trong viewport. Escape đóng. Ô chưa sẵn sàng dùng aria-disabled và vẫn focus được để đọc lý do; thao tác bị chặn phát thông báo ngắn qua live region. Cooldown không đọc liên tục qua live region. Reduced motion tắt transition.

## Phạm vi và cách nối

Trang **Đối chiếu** chọn ba nhân vật, ba khung cảnh và bảy trạng thái. Nền Hằng Nhạc và sprite native giữ tỷ lệ 1×, frame 64 × 96, chân (32,88). Nhân vật đứng để đối chiếu; không mô phỏng animation/VFX khi thử nút.

Adapter bản phác mô phỏng HP/MP, thời gian thi triển và cooldown; không mở Colyseus/profile/save hoặc ghi map/DB/draft owner. Thông số là baseline 100 HP / 100 MP, không khóa cân bằng mới.

| Nguồn | Trách nhiệm |
| --- | --- |
| client/src/skills/hotbar.ts + .css | Trình bày snapshot, tài nguyên, khả dụng, tooltip và callback; không sở hữu gameplay / animation / transport |
| client/src/skills/hotbar-effects.ts + .css | Vật liệu cầu, vòng/ánh trang trí và nhịp sáng từ trạng thái đã nhận; tách khỏi gameplay |
| client/src/skill-bar-desktop.ts | Adapter mô phỏng, lựa chọn khung cảnh / nhân vật / trạng thái |
| scripts/build-skill-hud-frame.mjs | Xuất frame đã có; không sinh hoặc chỉnh nội dung tranh |
| scripts/build-skill-hud-qi.mjs | Xuất atlas khí hai cell từ nguồn ImageGen, thu mẫu đồng đều |
| scripts/sync-skill-hud.mjs | Đồng bộ các WebP sản phẩm khi assets/build |
| shared/skills/definitions.ts | Bộ thuật, chi phí, phím, cooldown hiện hành |
| client/src/skills/session.ts | Nối gameplay thật sau khi phương án được chọn |

Trong game, SkillSession lấy HP/MP/cooldown/cast/target từ snapshot server, cấp HotbarView và gửi lệnh qua giao thức skill hiện có. HUD không trừ MP hoặc mở pose dự đoán. Giữ E/NPC, hướng/input, reload/reconnect và animation core; handshake chưa có snapshot giữ HUD offline. Lệnh `test:hang-nhac-hud-layers` kiểm bố cục, thao tác, snapshot và phần che bằng fixture riêng. Các ô mới cần cấu hình skill/loadout có thật, không suy quyền sử dụng từ ô trống của bản phác.

## Đối chiếu kỹ thuật và lịch sử

[Bản ghi 03](data/desktop-skill-hud-v3-verification.json) · [ảnh 03](design/ui/desktop-skill-hud-v3/README.md). Kiểm kỹ thuật không thay duyệt hình.

[Bản 01](design/ui/desktop-skill-hud-v1/README.md) giữ ảnh thanh lớn ban đầu; [bản 02](design/ui/desktop-skill-hud-v2/README.md) giữ ba lựa chọn icon nhỏ trước khi chủ dự án làm rõ cấu trúc mong muốn bằng mẫu. Trang tương tác hiện dùng bản 03.
