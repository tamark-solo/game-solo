# Vương Lâm · Concept direction V5

Owner đã duyệt concept ngày **14/10/2026** và yêu cầu sản xuất cả **Huyễn Tâm** cùng **Tịch Bạch**, với bốn họ Kiếm linh, Hồn phiên, Xạ Thần Xa và Thiên Nghịch Châu. [approval.json](approval.json) khóa 86 file nguồn / preview / prompt / input / evidence. Tên nguồn lịch sử `Huyền Tâm` được hiển thị thành **Huyễn Tâm** theo tên owner chọn; manifest và nguồn lịch sử giữ nguyên byte.

Vương Lâm Pixel02 đang chơi chỉ cung cấp tỷ lệ người và style pixel; mặt, tóc, phục trang và thế mang pháp bảo trong gói này là concept mới. [Kế hoạch triển khai](../wang-lin-implementation-plan-v1/index.html) chia đầu ra neutral, motion, FX đơn / AOE và gameplay theo từng gói.

Mở `index.html` bằng Vite hiện hành:

[Xem concept V5](http://127.0.0.1:5173/@fs/C:/Users/AnhLT/Documents/GM/game-solo/docs/design/characters/wang-lin-concept-direction-v5/index.html).

- Xem cả hai master **Huyễn Tâm / Tịch Bạch**. Hai nhân vật đều được sản xuất, mỗi nhận diện đi tiếp qua bốn họ trang bị.
- Xem hai concept áo và pháp bảo của mỗi họ; bảng màu chọn đúng ảnh concept tương ứng, không dùng hue filter.
- So preview thân khoảng 80 px với live ở cỡ 1×. Preview hạ cỡ chỉ giúp xét tỷ lệ; neutral sản xuất vẫn là bước tiếp theo.
- Xem bảng ba mốc phát triển và luồng nhận → hiểu điều kiện → luyện hóa → trang bị → vận dụng → nâng cách triển khai.
- Xem board đơn mục tiêu / AOE và bốn bước báo vùng → khóa → bộc phát → tan. Bấm board để mở ảnh nguồn lớn. Sơ đồ phạm vi bên dưới là hình học tương tác, không giả làm animation FX.
- Ghim tổ hợp ưa thích. Trang V5 lưu riêng trong `localStorage`, giữ qua reload; xuất JSON để trao đổi lựa chọn. V3/V4 và trạng thái ghim của các trang cũ không bị ghi lại.

Ảnh concept, hướng phát triển và hướng đơn mục tiêu / AOE đã được duyệt ở phạm vi concept tĩnh. Bốn board chiến đấu và bốn board tiến hóa diễn họa Huyễn Tâm; Tịch Bạch theo cùng cấu trúc đã chốt và có artwork production / motion riêng ở bước triển khai. Neutral sản xuất, tám hướng, motion, FX production, số liệu balance và runtime chưa được duyệt. Ghim vẫn là ưu tiên xem riêng; không ghi lại lựa chọn cũ của owner. Mốc cảnh giới là định hướng hình ảnh, không tự cấp trọng bảo hoặc mở gameplay. Thiên Nghịch Châu hướng hỗ trợ/control là đề xuất chuyển thể, không khẳng định có đòn gây sát thương ngoài thực tại trong nguyên tác.

Nguồn và nội dung thiết kế nằm ở [plan.json](plan.json), [brief.json](brief.json), [manifest.json](manifest.json), [generation.json](generation.json). Các nguồn nguyên tác và game tham khảo được ghi trong brief.

Evidence browser V5 bên dưới là mốc trước khi duyệt, được pin nguyên byte. Không chạy lại lệnh này vào root đã khóa; lớp trạng thái duyệt mới được kiểm bằng [harness kế hoạch](../wang-lin-implementation-plan-v1/review/browser-verify.mjs), trong context browser riêng và không ghi vào storage owner. Lượt kiểm V5 lịch sử có desktop, tablet 768 px, mobile 390 px; ảnh nạp thật, master xuyên họ, palette tương ứng ảnh, ba mốc, hai loại phạm vi, bốn nhịp, ghim/reload/xuất/bỏ ghim và storage riêng:

```powershell
node docs/design/characters/wang-lin-concept-direction-v5/review/browser-verify.mjs
```

Kết quả ở [review/browser-verification.json](review/browser-verification.json); screenshot ở `review/screenshots`. Kiểm kỹ thuật không mở duyệt hình hoặc tự ghép runtime.

Lượt kiểm cuối dùng manifest đủ hai master, tám concept trang bị và tám board: **281 check qua**, **96 tình huống sơ đồ**, **27 ảnh nguồn/native nạp và decode thật**. Nav đã kiểm click thật trước khi ép nạp ảnh: Nhân vật / Đạo đồ / Đơn mục tiêu & AOE đều cuộn đúng section và giữ hash lựa chọn; board giữ chỗ theo kích thước nguồn trước khi lazy image nạp. Desktop, tablet 768 px và mobile 390 px không tràn ngang; preview native giữ đúng 1× trên mobile. Không có lỗi JavaScript hoặc request thất bại. Đã xem ảnh chụp thực để kiểm bố cục nhân vật, board chiến đấu và board phát triển.
