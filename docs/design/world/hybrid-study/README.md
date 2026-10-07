# Thử ghép Vương Lâm pixel trên nền stylized 2D

**Ngày:** 07/10/2026.  
**Trạng thái:** thử hình trong GDD; chưa duyệt cỡ native, palette hoặc animation.  
**Công cụ:** imagegen tích hợp cho chỉnh nền và ảnh ghép; HTML/CSS cho trang xem các lớp ảnh.

Mở [trang thử](index.html) để chọn khung sprite **80/96/112 px**, cảnh **1×/2×** và khung **960 × 640/360 px**. Các nút chỉ thay cách xem; đây chưa là game có di chuyển/server.

| Nguồn | File/prompt | Vai trò |
| --- | --- | --- |
| Nền sân riêng | [PNG](sect-courtyard-empty-v1.png) · [Prompt](sect-courtyard-empty-v1.prompt.txt) | Imagegen xóa ba người/bóng chân khỏi [sân v2](../sect-courtyard-topdown-v2.png), giữ nền stylized |
| Vương Lâm gốc | [PNG pixel](../../characters/wang-lin-sprite-study/wang-lin-gray-pixel-v1.png) · [Prompt](../../characters/wang-lin-sprite-study/wang-lin-gray-pixel-v1.prompt.txt) | Trang xem giữ file gốc và hiển thị bằng lớp riêng, cạnh pixel rõ |
| Ảnh ghép tham chiếu | [PNG](wang-lin-courtyard-composite-v1.png) · [Prompt](wang-lin-courtyard-composite-v1.prompt.txt) | Imagegen ghép Vương Lâm vào sân, loại ba người cũ; giữ làm tham chiếu tổng thể |

Hai ảnh cảnh mới 1.536 × 1.024. Ảnh sprite 1.254 × 1.254 là nguồn thử phong cách; cỡ 80/96/112 là chiều cao khung hiển thị ảnh, không khẳng định lưới native. Bóng chân/nhãn trong trang xem là lớp UI; nền/sprite gốc được giữ riêng.

Vương Lâm có nhãn nhân vật truyện, không đổi thành đệ tử của tài khoản. Bố cục sân tiếp tục là thiết kế minh họa, chưa xác minh địa lý nguyên tác. Nghiên cứu này không thay roster, nhiệm vụ hoặc phạm vi A/B.

Cần đánh giá: đọc tóc/áo ở cỡ nhỏ, áo xám trên nền đá sáng, tỷ lệ chân–đất và sự nhất quán giữa sprite/palette/camera. Sau đó mới chuẩn hóa lưới pixel và làm bộ đứng/đi.

Đã xem ảnh chụp [1×](hybrid-desktop-v1.png), [2×](hybrid-zoom-v1.png) và [khung 360 px](hybrid-360-v1.png). Ở khung sprite 96 px, tóc/áo/đường viền đọc được; mặt và nếp áo vẫn dày chi tiết. Cần kiểm tra lưới native/cụm màu trước animation. [study.json](study.json) theo dõi nguồn và thông số của nghiên cứu này.
