# Lịch sử nhận diện Vân Hải 01 · đã dừng và dọn asset

**12/10/2026 — tài liệu lịch sử:** source/PNG/prompt của bộ này đã dọn theo yêu cầu owner; [biên bản/ZIP](data/character-study-cleanup-2026-10-12.json). Những đề xuất và số liệu bên dưới ghi nghiên cứu trước, không là mẫu hiện hành. Hiện chỉ [thiết kế áo trên Vương Lâm gốc](design/characters/wang-lin-costume-review-v2/README.md).

**Phản hồi owner và trạng thái mới:** hướng hình 01 bị owner phản hồi chưa đẹp bằng bảng áo xám/áo đỏ cũ. [Concept 02](design/characters/van-hai-player-v2/README.md) trở về nét mực/màu nước và trang phục nhẹ. Các đầu ra/kiểm của 01 bên dưới là lịch sử, không còn hình mặc định Linh Đài hoặc hướng đang sản xuất.

**11/10/2026 · concept chờ owner đánh giá.** Owner yêu cầu thiết kế lại nhân vật chính theo map/UI hiện tại và chọn **“Tạo nhận diện nhân vật mới cho Vân Hải”**. Đợt này làm mẫu nam nhập môn đầu tiên có nhận diện riêng; không lấy diện mạo Vương Lâm làm input, không ghi nhân vật mới thành một nhân vật nguyên tác.

[Trang đối chiếu](http://127.0.0.1:5174/van-hai-character-review.html) · [xem trong Linh Đài](http://127.0.0.1:5174/ui-material-review.html?screen=character) · [nguồn/metadata](design/characters/van-hai-player-v1/README.md).

## 1. Hướng nhận diện

Người mới bước vào một môn phái trên biển mây. Tuổi biểu kiến khoảng 20–24 là lựa chọn ART; dáng thanh, thận trọng và tập trung, không mang vẻ cao thủ với giáp/khí tức lớn ngay nhập môn. Tên nhân vật trong hồ sơ do người chơi đặt; “Vân Khách” trên review vẫn là tên mẫu, không tên canon mới đã chốt.

| Thành phần | Đề xuất hình |
| --- | --- |
| Mặt và thần thái | Mắt tối tự nhiên, chân mày thẳng, cằm gọn, ánh nhìn chú ý; giữ vẻ người trưởng thành trẻ |
| Tóc | Tóc đen xanh, mái chéo, búi cao gọn, dây vải ngà; khối tóc phải giữ dấu nhận diện khi làm bốn hướng |
| Áo nền nhập môn | Xám ngọc ấm, cổ trong ngà, mảng cổ/chest chéo xanh mực; tay áo thu tại cổ tay, vạt xẻ để bước rõ |
| Đai và điểm nhấn | Đai xanh mực, hai đuôi đai ngắn; khóa đồng hình thoi với nét mây đơn giản |
| Chân | Quần tối, giày vải quấn; không giấu hết bước chân dưới tà áo dài |
| Đồ và hiệu ứng | Tay trống ở mẫu nền; vũ khí, pháp bảo, túi/đạo cụ, shadow và FX làm riêng khi cần |

Chất liệu/nét lấy từ [map Vân Ngọc](design/world/hang-nhac-van-ngoc-concept-v1/README.md) và [hai bộ UI](DAO-UI-SYSTEM.md): xám/celadon, xanh petrol, ngà và đồng cổ; khối có chiều sâu, ánh bình minh vừa phải, vải mờ. Map/UI được xem để viết mô tả phong cách; lượt tạo concept đầu không nhận ảnh nhân vật cũ làm input.

## 2. Ba loại hình và kết quả thực tế

| Sản phẩm | Vai trò | Giới hạn |
| --- | --- | --- |
| [Bảng nhận diện](design/characters/van-hai-player-v1/README.md) | Ba góc thân, mặt, cổ áo và đai để chốt hình | Tỷ lệ minh họa người trưởng thành; không phải ba đầu hoặc sprite runtime dù prompt đầu có mục tiêu game-body |
| [Linh ảnh alpha](design/characters/van-hai-player-v1/README.md) | Hình toàn thân trong Tổng quan/Trang bị của review | Hình tĩnh, không đổi màu áo theo theme và không phải portrait hội thoại production |
| [Nguồn đứng góc cao](design/characters/van-hai-player-v1/README.md) | Chuyển cùng nhận diện sang camera/khối gọn để nghiên cứu | Một góc ba phần tư; cần chỉnh riêng hướng Nam và thống nhất bốn hướng trước sản xuất |
| [Mẫu 64 × 96](design/characters/van-hai-player-v1/README.md) | Xem silhouette/độ tương phản trên map, frame/chân giữ chuẩn | Thu mẫu cơ học một pose; alpha mềm/nhiều màu, chưa palette 24/alpha 0–255 của atlas pixel hiện hành |

Prompt yêu cầu khoảng ba đầu cho nguồn game-body; hình thực tế vẫn cần đánh giá tỷ lệ. Không coi câu chữ trong prompt là chứng minh đầu ra đạt tỷ lệ hoặc camera. Trên cỡ 1×, ưu tiên đường tóc, mảng cổ/đai và giày; hoa văn nhỏ không là thông tin cần đọc ở 80 px.

Nguồn alpha có vùng trong suốt thực. Export chỉ cắt padding và thu mẫu đồng đều, không xóa nền/repaint/tint bằng code. Không dùng portrait cao rồi gọi thẳng là sprite sản xuất. Mẫu đứng giữ canvas **64 × 96**, body thu mẫu **80 px**, chân **(32,88)**; trang map đặt nó ở **1×**, nền concept 1536 × 1024 được hiển thị ×2 tới hệ tọa độ 3072 × 2048 và ghi rõ hạn chế đó.

## 3. Cùng nhận diện qua hành trình

| Chặng hình ảnh | Hướng tiếp nối, chưa sản xuất |
| --- | --- |
| Nhập môn | Bộ vải hiện tại; thể hiện người đang xây nền |
| Tu Đạo về sau | Giữ mặt/tóc/đường cổ; chất vải tốt hơn, ngọc/đồng dùng theo nội dung trang bị/thời trang đã chốt |
| Đọa Ma sau điều kiện gameplay | Giữ cùng người, có thể phát triển chất vải sẫm, huyết đồng và khí tức tiết chế; không mặc định thêm sừng/giáp lớn hoặc đổi thành khuôn mặt khác |
| Hiện diện MMO | Thời trang, tọa kỵ, pháp bảo và pháp tướng có nguồn/ownership và layer riêng; không bake tất cả vào body nhập môn |

Đổi Tu Đạo/Đọa Ma trên trang UI chỉ đổi bộ khung/material. Mẫu người vẫn cùng một hình; chưa có quyền Đọa Ma hoặc trang phục mới được cấp từ thao tác theme. Không đặt tên môn phái, xuất thân, chiêu thức hoặc power mới chỉ từ ART.

## 4. Phạm vi và Core

- Source/prompt/derivative/hash nằm trong `docs/design/characters/van-hai-player-v1/`. Dùng skill **imagegen**, **built-in image_gen**; hai ảnh alpha lấy bảng nhận diện mới làm identity input.
- `scripts/build-van-hai-player-study.mjs` đóng gói sản phẩm và mẫu cỡ; `sync-van-hai-player-study.mjs` kiểm hash/copy từ workspace vào public. Assets/build không đọc thư mục ImageGen bên ngoài để nạp hình.
- `/van-hai-character-review.html` chỉ điều khiển tỷ lệ xem/vị trí minh họa/frameguide. Tổng quan/Trang bị review dùng linh ảnh mới; nghiên cứu phối chất liệu Diện mạo giữ riêng để không giả đổi màu áo bằng nền.
- Không thay IDs của ba avatar runtime, account/realm/profile, atlas đứng/đi/cast, lời dẫn theo nhân vật, server, save hoặc catalog gameplay. Không sửa owner map/9 blocker/bậc thang/draft trình duyệt.

Điều này mở một hướng nhận diện mới theo quyết định owner, không tự giải quyết roster/nội dung nguyên tác còn lại hoặc migration của hồ sơ đang chơi. Những việc đó cần kế hoạch nội dung/contract riêng trước tích hợp.

## 5. Bước sản xuất sau đối chiếu

1. Chốt mặt, tóc, độ dài áo, tỷ lệ game-body và độ tương phản trên map.
2. Một pose chuẩn native đủ bốn hướng, cùng canvas/pivot, bàn giao palette/alpha đã chọn và điểm chân đo thật. Không lật một hình để giả hai hướng.
3. Vòng đứng/thở và đi bốn hướng; tóc/áo/tay chân ổn định, pha đi theo quãng đường và chân trụ rõ.
4. Pose Kiếm/Lôi/Phong/đòn thường/tương tác/vận khí/hồi phục theo [Skill Core](SKILL-CORE.md), giữ gameplay/behavior/timeline/asset/UI tách nhau. Không kéo giãn frame để che lỗi.
5. Portrait/UI và thiết kế trang bị/appearance cùng version nhận diện. Lập adapter/catalog/migration khi chốt cách thay nhân vật đang dùng; chạy hồi quy thích hợp bằng fixture riêng.

[Kiểm kỹ thuật](data/van-hai-player-v1-verification.json) ghi độ trong suốt/hash, nạp asset, bố cục desktop/mobile, cỡ map/guide và hồi quy UI/skill/HUD. Build/test không nâng `ownerApproved` hoặc `artApproved`. Hướng nhận diện và từng bộ animation phải được đánh giá riêng.
