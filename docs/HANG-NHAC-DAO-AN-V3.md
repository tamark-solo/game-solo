# Đạo Ấn V3 trong game Hằng Nhạc

> **Đối chiếu GDD 0.35 ·15/10:** Biên bản dưới đây ghi trạng thái UI đã ghép và kiểm trước khi thống nhất logic mới. [Hợp đồng 0.35](GDD-035-UNIFIED-CONTRACT.md) cho phép refactor bản chạy chưa phát hành, dùng lại nhân vật/quái/boss và bổ sung phần thiếu. Các lượt kiểm UI/R01 lịch sử không xác nhận Chu Thiên, hai nhánh Trúc Cơ, tế luyện hoặc kinh tế mới đã chạy. Slot 5–7 chỉ được mở thao tác khi domain/loadout tương ứng được tích hợp và kiểm chứng.

15/10/2026. Owner chấp nhận bản web V3 và hotbar 8 ô, yêu cầu ghép vào game sau khi đọc lại GDD ngày 14/10/2026. Đã đọc toàn bộ `GDD.md` 0.34, phần định hướng và hợp đồng tiến trình trong hai tài liệu Chặng 1–2 ngày 14/10.

## Bản ghép

Mặc định `/hang-nhac.html` dùng Đạo Ấn: nền mực than, đường đồng mảnh, chữ ngà, giấy cho hồ sơ và phần đọc Mệnh Kiếp Chí. Cửa sổ nhân vật, hành trang, công pháp, nhiệm vụ, bản đồ, Đan–Khí và thiết lập có cùng thanh điều hướng. Màn nhập game tiếp tục dùng luồng tài khoản/hồ sơ đang có.

HUD giữ HP/MP ở trái trên, minimap và mục tiêu nhiệm vụ bên phải, hotbar giữa dưới. Các số sinh lực/linh lực trước đây được dựng tĩnh trong khung danh tính đã được thay bằng sự kiện presentation từ `SkillHotbar.update`, tức cùng snapshot đã xác nhận dùng cho cooldown. Tu vi đọc từ projection hiện có, tách khỏi linh lực.

| Ô | Thao tác thật |
| --- | --- |
| F | Nút đánh thường hiện có |
| 1–3 | Ba binding kỹ năng hiện có; tên, MP, hồi chiêu và quyền dùng từ shared/server |
| 4 | Mở hành trang thật để chọn vật tư; dùng vật tư vẫn gửi command qua CharacterSession |
| 5–7 | Chưa gán; bấm/phím có giải thích, không tạo lệnh cast |

Hotbar desktop có một hàng tám ô, màn hẹp có hai hàng bốn ô. Landscape thấp dùng một hàng gọn. Khung mục tiêu/nhiệm vụ tự thu gọn để chừa hotbar và vùng điều khiển. Minimap/bản đồ dùng nền và vị trí runtime hiện hành.

## Ranh giới GDD

Nội dung tiến trình giữ Mệnh Kiếp Chí VG01–VG11, Nội Giới Tư Đồ Nam, Lò Đan Lý Mộ Uyển và bốn họ Pháp Bảo theo projection G2 đang có. Việc ghép UI không thay cơ chế kỹ năng bằng các số mẫu ST/AOE của trang review, không cấp quyền Pháp Bảo/cảnh giới, không đổi avatar ID hoặc bộ ART/motion runtime. Quyền G1/G2/G3/G4 vẫn theo GDD và các approval riêng.

Không nhập `data.js`/state giả của review vào client. Không optimistic equip/use/HP, không thêm receipt hoặc save schema. Runtime actor, server, Core chiến đấu, authored map, navigation và DB owner không được sửa trong lần ghép này. V2/V3 review tiếp tục mở riêng để đối chiếu.

## Mã và vật liệu

- `client/src/ui/dao-an-v3.css`: token, khung, HUD, tám ô và các breakpoint.
- `client/src/ui/dao-an-readability.css`: màu chữ theo nền, chiều cao vùng đọc, danh sách nhiệm vụ và tracker; được nạp sau skin V3 qua `dao-player-ux.css`.
- `client/src/ui/dao-an-navigation.ts`: chuyển cửa sổ qua callback hiện có; không gửi lệnh gameplay.
- `dao-runtime-theme.ts` chọn thiết kế mới; các stylesheet cũ vẫn có scope riêng.
- `skills/hotbar.ts` dùng tám ô trong game; các trang demo cũ tiếp tục dùng biến thể riêng.
- `scripts/sync-dao-an-ui.mjs` chỉ sao chép bảy nguồn font/giấy đã dùng trong review sang public. Không gọi map/actor builder.

```powershell
npm.cmd run assets:dao-an-ui
npm.cmd run typecheck
node --import tsx tests/smoke/hang-nhac-dao-an-ui-smoke.mjs
node node_modules/vite/bin/vite.js build --config vite.config.ts
```

Smoke riêng dùng DB, token và server/Vite fixture ở cổng 2668/5268. Ảnh và biên bản tại `artifacts/dao-an-integration/`. Kiểm trang bị/tháo, vật tư dùng chung, số HP thật, cooldown và cast được xác nhận, khóa input khi mở menu, thanh điều hướng và kích thước desktop/mobile/landscape. So hash trước/sau cho 11 đường dẫn runtime/map bảo vệ; `shared/character-inventory.ts` đã khác hash basis từ trước lần ghép này và được giữ nguyên hiện trạng, không ghi đè.

Kết quả bản ghép đầu: 49 kiểm tra UI tích hợp, 11 unit chapter, typecheck/ranh giới và Vite production build đều qua. Hồi quy R01 online/browser kiểm chi phí MP, hit/dash, client từ xa, reload và đổi hồ sơ; reload-interaction kiểm ba vòng reload, ba vòng reconnect, restart backend và chủ động rời sân khi đang khôi phục. Nút đổi nhân vật nay nằm trong Thiết lập, nên hai test hồi quy đã chuyển sang thao tác qua menu.

## Rà soát khả năng đọc và thao tác · 15/10

Ảnh owner gửi cho thấy màu chữ cũ ghi đè lên giấy và `.dao-scroll-sheet` vẫn bị giới hạn 310 px. Khung đạo thư nay giới hạn theo viewport, phần đọc chiếm chiều cao còn lại và chỉ có một vùng cuộn cho bài đọc. Lời dẫn, tên NPC, mô tả và mục tiêu dùng chữ tối trên giấy; nút chính có màu đồng đỏ cùng nền và chữ tương phản. Bỏ màu inline khỏi các đoạn đọc để stylesheet của bề mặt kiểm soát màu chữ.

Tracker chỉ trình bày tên hồi và mục tiêu hiện tại, một nút thu/mở cùng các thao tác tìm đường, tương tác và đạo thư. Nhãn nút ngắn nằm trong DOM thật; tên NPC/thao tác đầy đủ vẫn ở tooltip và accessible name. Các callback tìm đường, tương tác, nhận thưởng không đổi.

Nhân vật có một hàng điều hướng phụ, không lặp Tổng quan/Thuật trong hai hàng nút. Tiêu đề cửa sổ theo tab đang mở. Nền thông tin tối, hồ sơ sáng, tìm kiếm và nút xem tư thế có màu chữ riêng theo bề mặt. Trên điện thoại, danh sách hồi cuộn ngang và tự đưa hồi đang đọc vào vùng nhìn thấy sau khi modal mở hoặc đổi bộ lọc.

Smoke đã mở rộng lên **123 kiểm tra**, gồm sáu tab Tổng quan/Thuộc tính/Tu luyện/Công pháp/Trang bị/Hành trang và đạo thư ở 1113×1143 (đúng ảnh owner), 1366×768, 390×844, 320×720, 844×390. Kiểm tương phản chữ nội dung tối thiểu 4.5:1 theo màu nền bề mặt, chiều cao bài đọc, lọc/chọn hồi, thu/mở tracker và các thao tác live đã có. Ảnh `audit-*` trong thư mục artifact đã được xem trực tiếp. Không lỗi JS/HTTP; 20 unit về nhiệm vụ/lựa chọn/tìm đường, typecheck/ranh giới và production build đều qua. Các hash runtime/map, V2 và V3 review giữ nguyên.

Sau đó owner gặp lỗi PostCSS `ENOENT` trên server 5173 đang chạy: import tương đối của CSS mới bị tìm từ workspace root, dù server fixture mới và production build đã qua. Đã neo import vào `/src/ui/dao-an-readability.css` theo client root của Vite. Kiểm tra lại bằng HTTP trực tiếp trên 5173 và reload đúng tab bị lỗi. Có thể đặt `DAO_AN_LIVE_ORIGIN=http://127.0.0.1:5173` khi chạy smoke để thêm bốn kiểm tra GET trên frontend đang chạy; phần thao tác gameplay vẫn dùng DB/server fixture riêng.

Lượt kiểm lại với cổng 5173 qua 127 kiểm tra; production build qua. Tab đang dùng đã được reload và hiện màn mở đầu, hết overlay lỗi; ảnh xác nhận `artifacts/dao-an-integration/live-5173-css-fixed.jpg`.
