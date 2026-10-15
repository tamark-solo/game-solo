# Đạo Ấn — RPG UI System V3

15/10/2026. Owner nhận xét V2 “nhìn ổn”, yêu cầu giữ nguyên và thiết kế một bản khác theo `RPG_UI_UX_HUD_Design_Guide.pdf`. V3 là gói review độc lập mới, không ghi vào V2.

**[Mở V3](http://127.0.0.1:5188/ui/rpg-system-web-v3/)** · **[Mở V2](http://127.0.0.1:5188/ui/ink-paper-web-v1/?rev=artifact-icons-v2#explore)**

## Hướng thiết kế

Đạo Ấn dùng nền mực than, các mặt bảng tối, đường chia đồng mảnh và sắc ngà cho thông tin. Giấy chỉ làm nền xem nhân vật và đọc đạo thư. Menu có điều hướng cùng vị trí giữa các hệ. Đây là hướng bố cục và luồng khác V2, không đơn thuần đổi màu.

Đọc đủ ba trang PDF và xem bản render. PDF là tài liệu cấu trúc tham khảo; phần Unity URP không đổi engine hiện tại của dự án. Điều chỉnh theo GDD 0.35: Tu vi tách khỏi MP, không thêm Stamina khi chưa có cơ chế; ba khuynh hướng công pháp và ba Mốc Pháp Bảo thay cho cây cộng điểm chưa được chốt; tiến trình dùng VG01–VG11. Hợp đồng chi tiết xem [GDD-035-UNIFIED-CONTRACT](../../../GDD-035-UNIFIED-CONTRACT.md).

## Ba lớp

1. **Gameplay HUD:** HP/MP trái trên, Tu vi gọn, buff/debuff có chữ và thời hạn, target/boss, hotbar và tooltip/cooldown, minimap, tracker, E tương tác, damage/loot, party theo tình huống.
2. **Menu UI:** nhân vật/trang bị/pháp bảo, hành trang, công pháp/chiêu, nhiệm vụ, bản đồ, Đan–Khí/trao đổi, thiết lập. Hội thoại, trọng thương/điểm an toàn và hướng dẫn mở theo ngữ cảnh.
3. **UX & Feedback:** chọn vật phẩm → so sánh → kiểm điều kiện → chờ xác nhận → kết quả hoặc lý do thất bại. Thao tác bỏ đồ, mua đồ và luyện hóa có bước xác nhận. Tooltip mở qua hover/focus; chi tiết có thể đọc bằng click. Có lọc/tìm/sort/list, tách chồng, drag/drop trang bị, focus vòng, đổi phím kèm kiểm trùng, cỡ chữ 100–150%, tương phản và giảm chuyển động.

## Xem thử

- Thanh trên và sidebar chuyển tám màn. C/I/K/J/M/L mở nhanh; Esc đóng menu hoặc mở thiết lập từ HUD.
- Chọn ngữ cảnh Khám phá / Chiến đấu / Tổ đội ở footer.
- Hotbar có 8 ô bằng nhau, phím F và 1–7: 5 ô hiện có cùng 3 ô “Chưa gán”. Desktop xếp một hàng, màn nhỏ chia 2 hàng × 4 ô.
- “Thử nhận đòn” tạo số sát thương và giảm HP; về 0 mở trọng thương. “Thử nhận đồ” thêm Linh thảo.
- Cổ kiếm phong ấn là trường hợp trang bị thất bại; Thanh phong kiếm là trường hợp thành công. Chỉ số nhân vật cập nhật theo ô đồ đang dùng.
- Chọn một chồng đan dược để tách; chọn loại khác để xem trạng thái rỗng và lọc.
- Công pháp chỉ đổi ngoài combat. Gán bộ ST/AOE rồi về HUD để xem hotbar thay đổi.
- Trúc Cơ Đan thiếu nguyên liệu; Tụ khí đan đủ nguyên liệu. Mua linh thảo cần xác nhận trước khi trừ tiền.
- Bản đồ chọn điểm và lọc marker, ghim đích có phản hồi. Không mô phỏng tìm đường/navigation.
- Nút “Cấu trúc PDF” là hướng dẫn review nằm ngoài giao diện game, kèm liên kết V2.

## Phạm vi và nguồn

`data.js` giữ dữ liệu fixture; `app.js` giữ state review, projection và intent; DOM/stylesheet trình bày ba lớp. Đây không phải thay đổi client/Core/server đang chơi. Không đăng ký save/reward/AI/runtime, không ghi DB/map hoặc authored navigation. Marker và điều kiện/chỉ số chỉ dùng để đánh giá UX, không xác nhận luật/cân bằng.

Đọc lại artwork và fonts từ V2 bằng đường dẫn tương đối; không tạo/chỉnh bitmap trong gói này. Gear menu dùng tỷ lệ chuẩn và icon Châu V2, world actor vẫn lấy body/gear/hand theo registration production. Ảnh nền bản đồ đọc nguyên byte. Gói V2 được pin trước khi bắt đầu tại `review/v2-baseline.json` và kiểm lại bằng SHA-256 sau QA.

Save/load được trình bày như hồ sơ đồng bộ MMO; không có tải/lưu thủ công giả vào profile. Remap/cỡ chữ/âm phản hồi là tương tác browser-local. Gamepad chưa nối; nội dung cơ chế/điểm kỹ năng/timing không tự phát sinh từ PDF.

## Chạy và kiểm

Giữ static server hiện có, hoặc từ root:

```powershell
python -m http.server 5188 --bind 127.0.0.1 --directory docs/design
node docs/design/ui/rpg-system-web-v3/verify.mjs
```

Không cần build game hoặc `npm run assets`. Kết quả mới nhất và ảnh tại `review/verification.json` / `review/`. Bản này chờ owner duyệt hình, không suy approval từ kiểm kỹ thuật.

Đã qua **129 kiểm browser / 21 ảnh evidence**, không lỗi JS/HTTP. Kiểm các màn ở 1440×960 và 390×844, các màn nhiều thông tin ở 1366×768 và cỡ chữ 150%; kiểm trang bị khóa/thành công, stack split, lọc/tìm, công pháp/hotbar, nhiệm vụ/bản đồ, xác nhận chế tạo/mua đồ, remap trùng/hợp lệ, trọng thương/hồi phục và đổi identity. Toàn bộ **46 file V2 đã pin vẫn nguyên SHA-256**. Cỡ chữ lớn có thể yêu cầu cuộn nội dung theo thiết kế.

Xem đối chiếu từng phần của PDF tại [GUIDE-MAPPING.md](GUIDE-MAPPING.md).

Cập nhật hotbar 8 ô: **54 kiểm tra tập trung đã qua**, gồm 9 kích thước màn hình từ 320 đến 1920 px, bố cục 8 ô/2×4 ô, khoảng cách HUD, nhãn ở cỡ chữ 150%, tooltip ô trống, phím bấm và cooldown cũ. Evidence tại `review/hotbar-eight-layout.json`, `review/hotbar-eight-1440.png` và `review/hotbar-eight-390.png`. Kiểm lại 46 hash V2 vẫn nguyên trạng.
