# Vương Lâm trên Hằng Nhạc — tỷ lệ và camera v0.1

**Ngày:** 08/10/2026 · **Trạng thái:** bản thử hình/đặt vị trí/camera; chưa áp dụng vào client game.

Mở [bản thử](camera-study.html). Dùng frame gốc `R01/frames/wanglin-cast-east/001.png`, ô 96 × 96, neo chân (48,88). Alpha có bbox (19,8,69,88), cao đúng 80 px. Nền vẫn là [PNG mỹ thuật v1](hang-nhac-map-v1.png), không chỉnh hoặc ghi nhân vật vào ảnh.

## Phương án camera để xem

| Nội dung | Giá trị thử | Ý nghĩa |
| --- | --- | --- |
| Tỷ lệ mặc định | 1 world px = 1 CSS px | Body 80 px giữ nguyên trên desktop và màn hẹp |
| Desktop | Tối đa 960 × 640 | Màn hẹp hơn 960 giảm chiều rộng nhìn, không thu cả khung |
| Khung hẹp | Tối đa 360 × 520 | Cắt cảnh quanh người; còn dùng được ở màn dưới 360 |
| Vị trí chân khi bám | 50% ngang, 62% dọc | Chừa nhiều vùng nhìn phía trên thân |
| Mép camera | Clamp trong world 2400 × 1800 | Không lộ khoảng trống ngoài ảnh; nhân vật lệch tâm gần biên |
| Thử vị trí | Chọn khu, phím/nút dịch vị trí hoặc bấm nền | Kiểm tra camera bám/cố định và neo chân, không mô phỏng đi bộ |

Đây là orthographic 2D. Góc ba phần tư đã nằm trong nền và sprite; không thêm nghiêng phối cảnh lên ảnh. Tỷ lệ và cách bám là phương án thử, chưa khóa camera game hoặc UX mobile.

Khác bản [xem toàn map](index.html), bản này **không scale khung 960 xuống chiều rộng màn nhỏ**. Nhân vật ở 1× vẫn cao 80 CSS px; chỉ vùng thế giới nhìn thấy nhỏ lại. Trên desktop đủ rộng, viewport là 960 × 640 thật. Nút thước đo vẽ neo chân/độ cao, không tạo hitbox gameplay.

## Phạm vi thực tế

Frame R01 hiện dùng là pose đứng hướng đông. Dịch vị trí không chạy animation đi bộ hoặc sửa hướng bằng lật ảnh; chưa được coi là controller nhân vật. Không có combat, damage, terrain collision, trigger nhiệm vụ, occlusion hoặc networking. Đặt người lên mái/vực trong bản thử chỉ là vị trí duyệt, không cấp quyền đi ở đó.

Nền gốc 1448 × 1086 ánh xạ vào world 2400 × 1800; crop ở 1× có thể thấy độ mềm vì nền được phóng khoảng 1,657 lần. Đây là hạn chế ảnh nguồn, không nên giảm sprite/camera để che vấn đề. Trước sản xuất cần nguồn nền đủ độ phân giải cùng các lớp ground/mái/cây/đạo cụ.

Khi duyệt, ưu tiên: người đọc rõ ở 1×; chân tiếp đất và tỷ lệ bậc đá hợp lý; sân/đường vẫn có chỗ nhìn báo đòn; vùng phía trước đủ để căn hướng; camera gần biên không cắt đầu hoặc tên nhân vật. Màn hẹp cần đánh giá riêng cách chọn mục tiêu xa và báo nguy hiểm ngoài khung; chưa áp dụng luật combat mới trong bản thử này.

## Kết quả kiểm tra lần đầu

[Kiểm tra trình duyệt](camera-verification.json) đạt ở màn 1280, 736, 360 và 320 px: đủ bảy địa điểm, camera nằm trong biên world, bám/cố định đúng, nút/phím/bấm nền dịch vị trí, sprite giữ ô 96 × 96 tại 1× và không tràn ngang. Body nguồn alpha cao 80 px; clamp gần mép không cắt đầu/tên tại các điểm preset.

Ảnh từ bản thử: [sân trung tâm 960 × 640](camera-hn-z02-960.png), [sân luyện](camera-hn-z04-960.png), [sơn môn](camera-hn-z01-960.png), [khung hẹp](camera-hn-z02-mobile.png) và [thước đo body](camera-hn-z02-guide.png). Khung hẹp được chụp trên màn rộng 360 px, nội dung còn 332 × 520 sau lề trang; thân vẫn 80 px, không thu thành 28 px như khi fit cả camera 960 vào màn.

Quan sát: body 80 tách được khỏi nền đá ở sân chính/sân luyện và còn rõ trên khung hẹp. Ảnh nền mềm khi nhìn ở 1× do phóng source; cần nâng chất lượng source nền trong giai đoạn tách lớp. Đây là nhận xét duyệt hình, chưa xác nhận hiệu năng crowd hoặc combat mobile. Giữ tỷ lệ/camera này làm mốc thử, không ghi là chủ dự án đã chốt.
