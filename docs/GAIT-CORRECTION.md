# Sửa bộ đi bộ — tay và chân (hồ sơ trước chibi)

**Phiên bản:** 0.1, ngày 07/10/2026.  
**Phạm vi lịch sử:** Vương Lâm áo xám và hai mẫu đệ tử ở giai đoạn preview tám pose. Bộ hiện hành theo [CHIBI-ROSTER-SPEC](CHIBI-ROSTER-SPEC.md).\
**Trạng thái:** bản vẽ sửa để xem thử; chất lượng chuyển động và nhận diện trong các frame mới chờ người phát triển đánh giá.

**Phản hồi mới:** bộ này cần chỉnh tiếp. Người phát triển chọn tỷ lệ chibi theo reference; xem [phân tích và mẫu một hướng](GAIT-REFERENCE-REVIEW.md). Các atlas trong tài liệu này được giữ để đối chiếu.

## 1. Vấn đề và thay đổi

Bộ cũ có sáu frame đi mỗi hướng. Một số pha dùng tư thế tay tương tự nhau và thiếu sự đổi chân đỡ rõ ràng ở nửa sau vòng bước. Phần runtime đã khớp pha theo quãng đường; chất lượng pose cần sửa ở nguồn hình.

Bản sửa vẽ tám pha mỗi hướng: tiếp đất A → hạ thân A → chân B đi qua → chân B tiến lên → tiếp đất B → hạ thân B → chân A đi qua → chân A tiến lên. Tay cùng bên chân tiến về hướng ngược lại; bàn tay đi qua hông và đổi hướng ở nửa sau vòng bước. Tay buông tự nhiên, không giữ tư thế chỉ hoặc đánh.

| Bộ dùng trong preview tại mốc lịch sử | Đứng tái dùng | Đi vẽ lại | Tổng frame |
| --- | --- | --- | --- |
| Vương Lâm áo xám | 4 | 4 hướng × 8 = 32 | 36 |
| Đệ tử nam | 4 | 4 hướng × 8 = 32 | 36 |
| Đệ tử nữ | 4 | 4 hướng × 8 = 32 | 36 |
| Tư Đồ Nam linh thể | 4 hình tĩnh | Chưa có | 4 |
| Lý Mộ Uyển áo tím | 4 hình tĩnh | Chưa có | 4 |
| Tổng preview tại mốc lịch sử | 20 | 96 | **116** |

116 là số frame tại mốc tám pose trước chibi, không là catalog hiện hành. Nay catalog có **6 bộ/136 frame**, gồm năm chibi 100 và Vương Lâm trước 36 để đối chiếu. Bộ ba đều có đứng/đi hoặc lướt bốn hướng và là lựa chọn người chơi từ đầu theo GDD 0.28; sân online vẫn dùng hai mẫu đệ tử kỹ thuật.

## 2. Nguồn và xuất native

Nguồn nằm trong [gait-correction-v1](design/characters/gait-correction-v1/). Mỗi hướng có bảng tám pose, hai hàng × bốn cột, cùng prompt chính xác. Sơ đồ hướng dẫn pose là SVG/PNG riêng. Hình nhân vật được tạo và sửa bằng **imagegen tích hợp**, không dùng CLI.

Manifest của mỗi bộ chọn đúng phiên bản nguồn được dùng. [Exporter](design/characters/gait-correction-v1/export-gait.ps1) chỉ tìm hình, cắt, lấy mẫu nearest, đưa về palette cũ và đóng atlas. Script không vẽ thêm tay/chân, nhân bản pose để đủ số frame, hoặc làm mượt pixel bằng nội suy.

Frame giữ **64 × 96**, palette 24 mục, alpha 0/255 và điểm chân **(32,88)**. Atlas đi mới có 9 cột × 4 hàng, **576 × 384**: một frame đứng rồi tám frame đi trong mỗi hàng. Bốn PNG đứng của từng bộ được sao chép nguyên byte từ bộ cũ. Đầu được đăng ký theo trục hình đứng để cánh tay vươn ra không kéo cả thân sang bên.

Nhận diện Vương Lâm trước đây đã duyệt là tham chiếu. Việc duyệt này không tự áp dụng cho 32 frame mới; metadata ghi riêng trạng thái tham chiếu và trạng thái bản sửa. Các nguồn/atlas cũ được giữ nguyên.

## 3. Cách xem

Chạy `npm.cmd run dev`, mở **http://127.0.0.1:5173/** rồi chọn **So sánh tay/chân cũ và mới**. Có thể mở riêng [trang so sánh](design/characters/gait-correction-v1/index.html).

1. Chọn từng nhân vật và bốn hướng. Dừng ở pose **0 và 4** để xem hai lần tiếp đất và tay đối nhịp.
2. Xem pose **2 và 6**: một chân đỡ, một chân đi qua; tay qua vị trí nghỉ dưới vai.
3. Chạy chậm rồi xem nối **7 → 0**, phóng 1×/2×/4× trên nền sáng/tối.
4. Xem bộ đối chiếu trên map; sân online hiện dùng đệ tử chibi. Chỉnh sải bước để đánh giá chân đỡ so với mặt đất.

Inspector giữ FPS thủ công 1–12, mặc định 8; tám frame tương đương vòng một giây tại chỗ. Map/online dùng quãng đường, mặc định 48 px/vòng. Ở 80 px/giây, vòng bước dài 0,6 giây và tương đương khoảng 13,33 frame/giây. Đây là thông số hiệu chỉnh trong preview; chưa là sải bước đã duyệt cho game.

## 4. Kiểm tra và điểm cần duyệt

[Kiểm tra nguồn](design/characters/gait-correction-v1/verify-gait.py) kiểm CRC/hash PNG, palette, alpha, kích thước, padding, atlas/frame, điểm chân, tám hình khác nhau mỗi hướng và hình đứng giữ nguyên. Kiểm tra browser xem đủ frame qua Three.js, bước frame, map, hai client online và màn 360 px. Trang so sánh có kiểm tra render riêng. Kết quả ở [verification nguồn](design/characters/gait-correction-v1/verification.json) và [verification preview](data/preview-verification.json).

Các phép kiểm kỹ thuật không tự duyệt giải phẫu hoặc cảm giác chuyển động. Cần người phát triển xem tay/chân đối nhịp, chân đỡ bám nền, mức nhấc gối, độ ổn định đầu/thân/áo và nhận diện giữa đứng–đi. Nếu một hướng còn sai, sửa nguồn hướng đó và xuất một phiên bản mới trước khi tiếp tục động tác khác.
