# Vương Lâm — lưới pixel và bộ đứng/đi đầu tiên

**Phiên bản:** 0.2, ngày 08/10/2026. Hợp đồng bộ đầu tiên được giữ lịch sử.\
**Nhận diện:** Vương Lâm v2 đã được người phát triển duyệt; giữ mặt/tóc và ba bộ đồ theo [hồ sơ tạo hình](WANG-LIN-VISUAL-SPEC.md).  
**Bộ đầu tiên:** `gray`, sáu pose đi/hướng, 28 frame; đây là hợp đồng nguồn lịch sử. Preview hiện mặc định [chibi bốn hướng 20 frame](design/characters/wang-lin-chibi-walk-v1/README.md), giữ [bản sửa 36 frame](GAIT-CORRECTION.md) để đối chiếu. Vương Lâm là một trong ba lựa chọn người chơi từ đầu theo [GDD 0.28](GDD.md).\
**Tham chiếu:** [trang animation](design/characters/wang-lin-gray-walk-v1/index.html), [atlas PNG](design/characters/wang-lin-gray-walk-v1/native-v2/atlas.png), [atlas JSON](design/characters/wang-lin-gray-walk-v1/native-v2/atlas.json), [lưới/palette](design/characters/wang-lin-gray-walk-v1/pixel-spec.json), [quy trình và prompt](design/characters/wang-lin-gray-walk-v1/README.md).

## 1. Chuẩn dùng cho bộ đầu tiên

| Thành phần | Giá trị | Mục đích |
| --- | --- | --- |
| Frame native | **64 × 96 px** | Đủ chỗ cho tóc, mặt, cổ áo và bước chân ở cỡ gốc |
| Hình nhân vật trong frame | Khoảng **80–82 px cao** ở bộ đã xuất | Giữ cỡ người tương ứng với nghiên cứu sân, chừa padding |
| Điểm gốc khi đặt nhân vật | **(32, 88)** tính từ góc trên trái frame | Đặt nhân vật theo chân thay vì góc ảnh |
| Alpha | 0 hoặc 255 | Cạnh pixel rõ, nền trong suốt |
| Palette | **24 mục, gồm 1 mục trong suốt** | Chung cho mọi hướng/frame của bộ áo xám |
| Phóng | 1× trên sân; 2×/4×/8× để xem | Phóng nguyên lần, tránh làm mờ cạnh pixel |
| Camera | Top-down ba phần tư | Cùng hướng dựng cảnh đã chọn |

Đây là lưới **frame nhân vật**, không quy định kích thước ô map hoặc lưới va chạm. Chuẩn 64 × 96 được chọn cho bộ thử này trong phạm vi công việc người phát triển đã giao. Nhận diện v2 đã duyệt; các bộ chibi hiện hành đã áp dụng cùng frame/anchor. Bộ 28 frame dưới đây không còn là bộ mặc định hoặc ngân sách motion hiện hành.

Palette khóa trong `pixel-spec.json`: tóc/mực, áo xám, lớp trong ngà, da, đai/quần và giày/quấn chân. Mỗi pixel xuất thuộc palette đó. Bộ đỏ/đời thường có gói riêng; hai đệ tử đã có chibi để thử online. Số frame của bộ này tách khỏi số nguồn portrait và số nhân vật.

## 2. Hướng và ngân sách frame

| Hàng trong atlas | Hướng | Đứng | Đi | Nhận diện cần giữ |
| --- | --- | --- | --- | --- |
| 0 | `south` — xuống | 1 | 6 | Mặt trước, cổ áo ngà, đai tối |
| 1 | `west` — trái | 1 | 6 | Mặt/giày hướng trái, tóc kéo về sau |
| 2 | `east` — phải | 1 | 6 | Mặt/giày hướng phải, cấu trúc áo nhất quán |
| 3 | `north` — lên | 1 | 6 | Tóc và dây buộc phía sau; mặt sau áo |
| Tổng | 4 hướng | **4** | **24** | **28 frame** |

Atlas có **7 cột × 4 hàng**, kích thước **448 × 384 px**. Cột 0 là đứng; cột 1–6 là đi 0–5. Đứng là một tư thế tĩnh, chưa có động tác thở riêng. Các hướng được vẽ trong nguồn, không lấy một hướng ngang lật ảnh để tạo hướng còn lại.

ID frame: `wanglin_gray_stand_south`, `wanglin_gray_walk_south_00`…`05`, tương tự cho `west/east/north`. JSON cung cấp rectangle, kích thước nguồn, điểm gốc, PNG rời và các danh sách animation; không khóa vào engine.

## 3. Nhịp và đặt chân

- Nhịp đi mặc định **8 FPS**; 6 frame/vòng tương đương **0,75 giây**. Trang xem có 6/8/10 FPS để so sánh.
- Mục tiêu diễn hoạt: tiếp đất chân trái → chuyển trọng lượng → chân phải đi qua → tiếp đất chân phải → chuyển trọng lượng → chân trái đi qua. Bảng nguồn đã được chỉnh để có các tư thế chân khác nhau; cần xem chuyển động thực tế để đánh giá các pha.
- Giữ mặt/tóc, độ rộng thân, màu áo và camera qua từng frame. Tóc/gấu áo chuyển nhẹ theo bước; biến thể hư hại cảnh hang không thuộc bộ này.
- Toàn bộ frame chạm cùng đường chân `y = 88`; scale nguồn dùng chung toàn bộ bộ hình. Sau lấy mẫu, các sai lệch đáy 1–2 px được dịch nguyên frame để đăng ký về đường chuẩn, không kéo giãn cơ thể.
- Khi dừng, dùng frame đứng của hướng vừa đi; khi đổi hướng, bắt đầu vòng đi mới. Đây là quy tắc bàn giao cho prototype, chưa là hợp đồng chuyển động online.

Ví dụ đặt sprite: muốn điểm chân ở `(worldX, worldY)`, vẽ frame từ `(worldX - 32, worldY - 88)`. Phóng 2× thì dùng điểm chân `(64, 176)` trong hình hiển thị; vị trí thế giới vẫn là vị trí chân đã chọn.

## 4. Nguồn hình và xuất native

Imagegen tích hợp vẽ nguồn 28 hình, dựa trên [pixel Vương Lâm v2 đã duyệt](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.png). [Nguồn v1](design/characters/wang-lin-gray-walk-v1/source-sheet-v1.png), [v2](design/characters/wang-lin-gray-walk-v1/source-sheet-v2.png) và [v3](design/characters/wang-lin-gray-walk-v1/source-sheet-v3.png) giữ để truy quá trình chỉnh chu kỳ/pha chân. V3 là nguồn xuất hiện tại. Prompt chính xác nằm cạnh từng PNG.

[Script xuất](design/characters/wang-lin-gray-walk-v1/export-native.ps1) tìm 28 hình tách biệt theo alpha, sắp theo hàng/hướng và cột, dùng chung một tỷ lệ lấy mẫu nearest-neighbor, khóa palette, đăng ký điểm chân và đóng gói PNG indexed. Script xuất 28 PNG rời, atlas và metadata; không vẽ thêm tay/chân hoặc tạo tư thế đi bằng code.

PNG nguồn lớn dùng cho tạo hình; **PNG native hiện tại trong `native-v2/`** có đúng lưới 64 × 96. `native-v1/` giữ lần xuất trước. `atlas-data.js` chứa cùng metadata với JSON để trang xem mở trực tiếp từ file mà không cần fetch JSON qua server.

## 5. Cách xem và điểm cần đánh giá

Mở [trang animation](design/characters/wang-lin-gray-walk-v1/index.html). Hàng đầu chạy bốn hướng cùng nhịp; khu frame cho đổi hướng/động tác, tạm dừng, bước từng frame, đổi nền và hiện điểm chân/lưới. Khu sân cho thử dịch chuyển ở cỡ gốc bằng WASD, phím mũi tên hoặc nút giữ hướng.

Khi xem bộ đầu tiên, đánh giá: hai chân luân phiên rõ; vòng cuối → đầu ít giật; thân/đầu và tóc/áo ổn định; đổi sang đứng giữ vị trí chân; hướng lên thật sự là mặt sau; hướng ngang đọc được ở cỡ gốc. Các PNG đã có đủ frame khác nhau không tự chứng minh chất lượng động tác đạt mức phát hành.

Trang sân là **công cụ xem ART** dùng nền tham chiếu, chưa có va chạm, nhiệm vụ, người chơi khác hoặc máy chủ. Trang lịch sử vẫn dùng Vương Lâm làm mẫu kiểm ART; vai trò người chơi trong thiết kế hiện hành theo GDD, chưa triển khai trong sân online.

## 6. Gói bàn giao và bước tiếp theo

- Native: atlas PNG, 28 PNG frame rời và JSON; palette/frame/anchor trong spec.
- Nguồn: hai PNG source, prompt chính xác, hình nhận diện v2 và script xuất.
- Xem thử: HTML/CSS/JS, bốn hướng đồng thời, frame tĩnh và sân tham chiếu.

Chuẩn đi lại hiện hành theo [CHIBI-ROSTER-SPEC](CHIBI-ROSTER-SPEC.md); cả bộ ba đã có bốn hướng đứng/đi hoặc lướt. Tương tác/tu luyện/combat, đồ đời thường/đỏ và trang bị cần ngân sách riêng khi chuyển ưu tiên khỏi map. Các mục này không cộng vào 28 frame lịch sử.
