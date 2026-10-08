# Bộ ba trọng tâm — kế hoạch động tác

> **Đối chiếu GDD 0.25 — 08/10/2026:** chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu, Hằng Nhạc qua Ngưng Khí, phân hóa sau map đầu. Vai NPC và thứ tự xuất hiện gameplay trước đây không còn quyết định quyền chọn nhân vật. Kế hoạch motion cần xét lại cho ba người chơi được; trạng thái asset đã có vẫn giữ. Xem [GDD](GDD.md) và [hệ thống tu tiên](CULTIVATION-SYSTEM.md). Quyết định mới được ưu tiên khi nội dung bên dưới mâu thuẫn.

**Phiên bản:** 0.3, ngày 07/10/2026.  
**Trạng thái:** Vương Lâm đã có bản sửa bộ đi tám pose/hướng, chờ đánh giá. Animation Tư Đồ Nam/Lý Mộ Uyển trong bảng vẫn là kế hoạch.  

**Cập nhật sau reference:** bộ đi trước cần chỉnh tiếp. Người phát triển chọn tỷ lệ chibi đầu lớn/thân gọn; [mẫu Vương Lâm một hướng](GAIT-REFERENCE-REVIEW.md) có 1 đứng + 4 đi riêng. Ngân sách dưới đây là phương án trước tỷ lệ mới, cần xét lại sau khi mẫu chibi đạt yêu cầu; chưa sản xuất thêm Tư Đồ Nam/Lý Mộ Uyển.
**Tham chiếu:** [nhận diện bộ ba](CORE-CHARACTER-VISUAL-SPEC.md), [Vương Lâm](WANG-LIN-SPRITE-SPEC.md), [trang pixel bộ ba](design/characters/core-trio-v1/index.html), [chân dung UI](design/characters/core-ui-v1/index.html), [roster](data/character-roster.json).

## 1. Phạm vi và hiện trạng

Giữ ba nhân vật trọng tâm Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển. Mỗi bộ động tác gắn với trang phục/hình thái và mốc xuất hiện; không đổi NPC thành nhân vật người chơi điều khiển.

| Nhân vật/hình thái | Đã có | Tình trạng dùng |
| --- | --- | --- |
| Vương Lâm áo xám | 4 đứng + 32 đi = **36 frame** | [Bản sửa tay/chân](GAIT-CORRECTION.md); hình đứng giữ nguyên, bộ đi chờ đánh giá |
| Tư Đồ Nam linh thể đứng | **4 frame tĩnh**, bốn hướng | Tạm chấp nhận làm chuẩn thiết kế; chưa có lướt/lơ lửng diễn hoạt |
| Lý Mộ Uyển áo tím | **4 frame đứng tĩnh**, bốn hướng | Nhận diện đã chấp nhận; chưa có đi/luyện đan |

Tổng hiện có cho ba hình thái này là **44 frame riêng**. Bộ cũ có 36 frame được giữ làm lịch sử; không cộng bộ đệ tử, ảnh nguồn lớn, chân dung UI hoặc dạng ngồi Tư Đồ Nam vào tổng core đang dùng.

## 2. Lưới dùng chung và điểm đặt

- Frame **64 × 96 px**, bốn hướng south/west/east/north; giữ cùng camera top-down ba phần tư.
- Palette 24 mục gồm trong suốt cho từng bộ; portrait tranh mực dùng quy chuẩn riêng.
- Điểm đặt **(32, 88)** tính từ góc trên trái frame. Vương Lâm/Lý Mộ Uyển dùng điểm chân; Tư Đồ Nam dùng điểm chiếu xuống mặt đất.
- Nhân vật người đi giữ đường tiếp đất ổn định; tóc/áo có chuyển động nhưng không làm thân đổi kích thước.
- Linh thể đứng Tư Đồ Nam có đáy hình ở y = 84 trong mẫu tĩnh, cao 4 px so với điểm chiếu. Khi làm lơ lửng, chỉ đổi vị trí hình theo pixel nguyên trong frame; điểm chiếu giữ cố định.
- Hướng trái/phải được vẽ riêng; giữ đường tóc, dây buộc và cổ áo. Không mặc định lật ảnh tạo hướng còn lại.

Các thông số là quy chuẩn ART. Tốc độ dịch chuyển trong thế giới, va chạm và đồng bộ online được đặc tả khi biên tập map/hệ thống.

## 3. Bộ động tác đề xuất

| Nhân vật | Động tác | Hướng × frame/hướng | Nhịp đề xuất | Hành vi hình ảnh | Ưu tiên |
| --- | --- | --- | --- | --- | --- |
| Vương Lâm áo xám | đứng | 4 × 1 = 4 | Tĩnh | Giữ tư thế/nhận diện hiện tại | Đã có |
| Vương Lâm áo xám | đi | 4 × 8 = 32 | Inspector 8 FPS, vòng 1 giây; map theo quãng đường | Hai tiếp đất đối nhau, tay cùng bên ngược chân | Đã vẽ bản sửa, chờ duyệt |
| Tư Đồ Nam linh thể | lơ lửng tại chỗ | 4 × 4 = 16 | 4 FPS, vòng 1 giây | Biên độ khoảng 1 px quanh độ cao 4 px; thân giữ dáng đứng | Khi sản xuất linh thể động |
| Tư Đồ Nam linh thể | lướt | 4 × 6 = 24 | 6 FPS, vòng 1 giây | Hai chân giữ duỗi; tay/áo và mép linh thể theo hướng lướt | Cùng gói lơ lửng |
| Lý Mộ Uyển áo tím | đứng | 4 × 1 = 4 | Tĩnh | Giữ mẫu hiện tại | Đã có |
| Lý Mộ Uyển áo tím | đi | 4 × 6 = 24 | 8 FPS, vòng 0,75 giây | Bước nhẹ, áo không đổi chiều dài; đuôi tóc theo chuyển động | Khi sản xuất arc tương ứng |
| Lý Mộ Uyển áo tím | thao tác luyện đan | 1 × 4 = 4, hướng trước | 4 FPS, vòng 1 giây | Tay chuẩn bị dược liệu/điều chỉnh thao tác, đầu tập trung | Sau bố cục bàn/lò đan |

Frame đầu của bốn vòng lơ lửng Tư Đồ Nam **tái dùng bốn mẫu tĩnh hiện có**. Đây là kế hoạch sử dụng lại hình; các frame tiếp theo phải vẽ và xem vòng lặp trước khi thay bộ tĩnh.

Lò đan/dược liệu là đạo cụ của cảnh được làm riêng. Gói luyện đan một hướng phục vụ bố cục bàn đã biên tập; khi cần bàn nhìn ở hướng khác, cập nhật ngân sách trước khi sản xuất.

### Ngân sách frame riêng

| Bộ | Hiện có tái dùng | Vẽ thêm | Tổng bộ sau sản xuất |
| --- | --- | --- | --- |
| Vương Lâm đứng/đi áo xám | 36 | 0 | 36 |
| Tư Đồ Nam lơ lửng/lướt | 4 | 12 lơ lửng + 24 lướt = 36 | 40 |
| Lý Mộ Uyển đứng/đi/luyện đan | 4 | 24 đi + 4 luyện đan = 28 | 32 |
| Tổng | **44** | **64** | **108** |

Không cộng thêm bốn mẫu đứng Tư Đồ Nam lần thứ hai vào 40 frame: chúng là các frame đầu của vòng lơ lửng. Tổng 108 là mục tiêu khi ba bộ được sản xuất đầy đủ theo giai đoạn, không phải số frame core đang có. Kế hoạch sáu pose/hướng cho Lý Mộ Uyển cần được đánh giá lại trước sản xuất dựa trên kết quả sửa bộ đi hiện tại.

**Động tác tùy chọn:** Vương Lâm tương tác tay 4 frame một hướng và tu luyện 4 frame một hướng trước. Nếu cần cả hai, thêm 8 frame vào bộ áo xám, đưa tổng core dài hạn của bảng lên 116. Con số này độc lập với 116 frame của cả năm bộ preview hiện tại. Bộ áo đỏ/đời thường, chiến đấu, pháp thuật và thân thể phục hồi Tư Đồ Nam có ngân sách riêng sau biên tập nội dung.

## 4. Chuyển trạng thái

| Nhân vật | Chuyển trạng thái | Quy tắc ART |
| --- | --- | --- |
| Vương Lâm | đứng → đi → đứng | Khi dừng giữ hướng vừa đi và điểm chân; khi đổi hướng dùng vòng đi đúng hướng |
| Tư Đồ Nam | lơ lửng → lướt → lơ lửng | Giữ điểm chiếu, không thêm bước tiếp đất; khi dừng áo/viền trở lại dáng nghỉ |
| Lý Mộ Uyển | đứng → đi → đứng | Giữ hướng và điểm chân; đi không tự kích hoạt thao tác luyện đan |
| Lý Mộ Uyển tại bàn/lò | đứng → luyện đan → đứng | Bố cục định hướng trước; bắt đầu/kết thúc giữ tỷ lệ thân và vị trí tương tác |

Hội thoại dùng chân dung UI để đọc biểu cảm. Sprite có thể giữ đứng/lơ lửng; không bắt buộc tạo frame miệng nói ở cỡ 64 × 96. Chân dung và sprite chọn cùng hình thái/trang phục theo cảnh.

Dạng ngồi/mắt nhắm Tư Đồ Nam tham chiếu chương 112 được giữ riêng trong [gói ngồi v2](design/characters/core-trio-v1/situ-nan/native-v2/atlas.png). Tư thế đứng/mắt mở và cách lướt là ART chuyển thể đã chọn. Giai đoạn B mở tuyến theo biên tập; không tự đặt linh thể vào khu môn phái A.

## 5. Tiêu chí xem thử và thứ tự sản xuất

| Bộ | Điều cần thấy khi kiểm tra |
| --- | --- |
| Vương Lâm | Hai chân luân phiên, đầu/thân ổn định, cuối → đầu ít giật; dừng không nhảy điểm chân |
| Tư Đồ Nam | Dáng đứng rõ, khoảng khuyết vẫn trong suốt; lướt không thành bước đi; dao động thấp, không nhảy điểm chiếu |
| Lý Mộ Uyển | Tóc buộc đuôi giữ một kiểu; gấu áo không co giãn; thao tác đan không làm đạo cụ dính vào mọi frame |
| Mọi bộ | Đọc được ở 1× trên nền sáng/tối; không cắt tóc/tay/gấu; màu/camera/nhận diện ổn định qua bốn hướng |

1. Preview chung đã chạy. Đánh giá [bản sửa tay/chân](GAIT-CORRECTION.md) cho Vương Lâm/hai đệ tử trong inspector, map và sân online trước bộ động tác tiếp theo.
2. Sau preview, sản xuất bản thử lơ lửng/lướt Tư Đồ Nam một hướng theo mẫu đứng tạm chấp nhận, xem chuyển trạng thái rồi mở bốn hướng.
3. Sản xuất đi Lý Mộ Uyển khi cần thử camera; thao tác đan sau khi có bố cục bàn/lò.
4. Động tác/trang phục mới của Vương Lâm và bộ combat theo mốc nội dung đã biên tập.

Gói hiện tại tạo chân dung và tài liệu này; **64 frame mới trong bảng chưa được vẽ**. Animation phải xem thực tế trước khi ghi trạng thái hoàn thành.
