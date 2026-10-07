# Tham chiếu mới — tỷ lệ chibi và bước đi nhỏ

**Ngày:** 07/10/2026.  
**Đã chốt:** người phát triển chọn học cả tỷ lệ đầu lớn/thân gọn của reference.  
**Mẫu hiện có:** [Vương Lâm chibi một hướng](design/characters/wang-lin-chibi-pilot-v1/README.md), 1 đứng + 4 pose đi hướng Đông. Xem **http://127.0.0.1:5173/chibi-pilot.html**.

## 1. Quan sát reference

[Pin người phát triển gửi](https://www.pinterest.com/pin/480196379041020113/) dẫn tới [ảnh nguồn 1024 × 1024](https://i.pinimg.com/originals/ef/f1/74/eff174195de8072959a4808140f594a7.png). Bản tham chiếu lưu tại [reference-pinterest-480196379041020113.png](design/characters/gait-correction-v1/reference-pinterest-480196379041020113.png).

Ảnh là bảng tĩnh bốn hàng × bốn cột: trước, sau, trái và phải. Nhân vật có đầu lớn, thân/chi ngắn, áo dài che phần lớn chân, bàn tay gần thân và mức thay đổi pose nhỏ. Đây là căn cứ để học tỷ lệ, dáng và biên độ; ảnh tĩnh chưa xác nhận thứ tự frame, FPS hoặc chất lượng vòng đi. Mẫu game cần được phát thực tế để đánh giá.

Tóc/trang phục màu xanh, tai nhọn, trang sức và vũ khí trong pin thuộc nhân vật tham chiếu. Mẫu Vương Lâm dùng tóc đen buộc nửa với dây sáng, áo xám/cổ kem/đai tối và biểu cảm trầm theo hồ sơ riêng.

## 2. Vấn đề ở bộ trước

| Thành phần | Điều thấy ở bộ trước | Hướng sửa |
| --- | --- | --- |
| Tỷ lệ | Thân/chi dài, đầu nhỏ hơn reference | Đầu lớn, thân gọn kiểu chibi |
| Chân | Gối nhấc cao, biên độ bước lớn | Bước ngắn, nhấc giày thấp; giữ chân trụ rõ |
| Tay | Vung rộng; một số pose giữ hướng hoặc chuyển đột ngột | Tay gần hông, cùng bên đi ngược chân, vung nhỏ |
| Thân/tóc/áo | Hình vẽ độc lập giữa các frame làm cỡ thân và gấu áo thay đổi | Giữ một khung tỷ lệ; chỉ đổi phần đang chuyển động |
| Phạm vi sản xuất | Mở đủ ba bộ và bốn hướng trước khi vòng đi đạt yêu cầu | Kiểm tra một hướng Vương Lâm với bốn pose gốc trước |

Ví dụ kỹ thuật: các frame nữ hướng Đông trong bản sửa trước cao 74–76 px, các hướng khác khoảng 79–82 px. Cùng frame 64 × 96 và điểm chân không đảm bảo nhân vật giữ cùng cỡ. Kết quả hash/CRC hoặc tám hình khác nhau cũng không chứng minh chuyển động đúng.

Bộ tám pose trước được ghi **cần chỉnh tiếp sau phản hồi**. Các atlas cũ giữ để đối chiếu; không ghi trạng thái chuyển động đã duyệt.

## 3. Mẫu chibi một hướng

- Một hình đứng mới cùng tỷ lệ với bốn hình đi; tránh chuyển từ người thân dài sang chibi khi bắt đầu đi.
- Bốn pose gốc: tiếp đất A → chân B đi qua → tiếp đất B → chân A đi qua.
- Mục tiêu tỷ lệ khoảng 2,5–3 đầu; đây là brief thử. Hình native đã xuất cao 80–82 px, frame 64 × 96, điểm chân (32,88), palette cũ 24 mục và alpha 0/255.
- Chân nhấc thấp, tay gần thân, tóc/gấu áo dao động ít. Contact B sửa riêng tay ở nguồn v2.
- Chỉ có hướng Đông. Loader một hướng cần khai báo rõ trong trang thử; loader actor đầy đủ vẫn yêu cầu đủ bốn hướng.

Trang thử dùng chung **Three.js renderer**, nearest sampling, điểm neo và luật di chuyển với preview chính. Có xem tại chỗ, đứng/đi, bước pose, zoom 1×/2×/4×, nền sáng/tối/lưới và đi trên sân. Hai hình cạnh nhau giúp đối chiếu tỷ lệ; có thể ẩn bộ trước.

Trong inspector, hai bộ dùng cùng thời lượng chu kỳ, mặc định 0,8 giây. Trên sân, pha chân theo quãng đường: bộ trước 48 px/vòng; chibi thử 24 px/vòng với tốc độ mặc định 40 px/giây. Thanh chỉnh dùng đánh giá độ bám nền, chưa là số cân bằng gameplay đã duyệt.

## 4. Đánh giá tiếp theo

Kiểm tra [nguồn](design/characters/wang-lin-chibi-pilot-v1/verification.json) và [preview](data/preview-verification.json) chỉ xác nhận kỹ thuật. Cần xem đầu/thân ổn định, chân trụ, sự đổi chân, tay đối nhịp, đoạn nối cuối → đầu và chuyển đứng–đi. Nếu cần sửa, ưu tiên đúng pose trong mẫu một hướng.

Sau khi mẫu này đạt cảm giác mong muốn, sản xuất ba hướng còn lại rồi áp dụng tỷ lệ cho hai đệ tử và NPC theo mốc. Ngân sách frame dài hạn cần xét lại sau quyết định vòng đi cuối cùng. Mẫu này vẫn là Vương Lâm; số nhân vật trọng tâm và các mốc A/B/arc sau giữ theo roster.
