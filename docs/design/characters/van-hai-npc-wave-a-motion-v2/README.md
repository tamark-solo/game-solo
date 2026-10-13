# Sáu NPC Wave A — chuyển động tám hướng V2

V2 có **144 clip / 864 pose**, gồm idle, nói chuyện và cử chỉ nghề cho Bạch Chỉ, Tống Thiết, Hứa Hành, Đinh Sóc, Kỷ An và Phùng Dã ở tám hướng thật. Bảy hướng mới có 42 nguồn / 126 clip / 756 pose; 18 clip / 108 pose Đông Nam đọc nguyên byte từ [pilot đã duyệt](../van-hai-npc-wave-a-motion-v1/approval.json), giữ nguyên V1.

Mở [trang xem chuyển động](index.html), chọn NPC, hướng và cử chỉ. Có phát/dừng, tua từng pose, xem 1×/2×/4× trên nền Vân Ngọc/sáng/tối, đối chiếu Vương Lâm cùng hướng và nhận diện Đông Nam đã chốt. Hướng mới vẫn là ứng viên để owner xem hình; chưa đưa vào game.

| NPC | Cử chỉ nghề |
| --- | --- |
| Bạch Chỉ | Kiểm giỏ thảo dược và chày ngọc |
| Tống Thiết | Kiểm kìm và phôi gỗ nhỏ |
| Hứa Hành | Kiểm bản đồ lộ tuyến và ống đựng |
| Đinh Sóc | Kiểm thẻ lộ tuyến khi giữ thương |
| Kỷ An | Đọc thẻ tre |
| Phùng Dã | Kiểm và chỉnh thế cầm kiếm gỗ thấp |

**Vương Lâm Pixel02 live cùng hướng là Image1 PRIMARY** cho anatomy, camera, nét pixel và màu. Bảy nguồn ban đầu đã qua kiểm view thật được giữ; 35 nguồn còn lại dùng neutral cùng NPC/cùng hướng đã đo và xem trước khi tạo motion. Khi sửa motion, Image2 là nguồn lỗi của chính NPC/cùng hướng, Image3 là neutral cùng hướng; Wang vẫn ở Image1. [Production](production.json) lưu input/prompt/router metadata/hash và lineage từng lượt, kể cả các nguồn bị loại. Không mirror hoặc lấy NPC khác làm chuẩn.

Người base 64 × 96 / chân (32,88), body đứng 80px; canvas motion 96 × 96 / chân (48,88) chỉ thêm padding. Mỗi nguồn dùng **một scale từ crown tới đôi giày của neutral** cho cả 18 pose. Root từng pose nằm trong vùng đỡ của hai giày, không suy từ tâm bbox, gấu áo hay mũi thương. Trích alpha128 theo component/mask được kiểm, nearest một lần; không fit từng pose, paint RGB hoặc giả chuyển động bằng bobbing. Idle/talk 1200ms loop; nghề 1500ms một lần rồi hồi neutral. Khí/VFX/bóng giữ riêng.

Đạo cụ khóa theo tay cơ thể khi đổi view. Hướng sau lưng che đúng mặt/tay trước bụng. Nguồn rộng 1536 × 1024 dùng cho sáu lượt cần thêm khoảng trống, giữ đủ tóc/mũi đạo cụ; các nguồn khác thực tế 1254 × 1254 dù request 1536 × 1536. [Kiểm mép nguồn](review/source-edge-verification.json) đối chiếu 42 hash và không có alpha128 chạm bốn biên. Native không clipping không được dùng để suy rằng ảnh nguồn chưa bị cắt.

Hai điều chỉnh nghề được ghi rõ trong [assessment](review/source-assessment.json): Bạch Tây Nam kiểm một lá lấy từ nội dung giỏ; Đinh Đông Bắc nhìn xuống thẻ bằng đầu/cổ/vai, giữ cả hai tay thấp và tay phải giữ thương. Chi tiết nhỏ ở 1×, fold tóc/áo và góc nhìn trong lúc cúi còn có biến thiên; một scale 80px không tự chứng minh anatomy giống nhau. Pose cuối hồi gần neutral về thị giác, không tuyên bố đầu/cuối trùng từng pixel.

[Catalog](catalog.json), [registration](registration.json), [phép đo đã xác nhận](registration-input.json) và [bàn giao theo hash](review/delivery.json) ghi coverage và nguồn hiện hành. [Browser](review/verification.json) kiểm 864 canonical/atlas/contact pose, 1296 tổ hợp nền/cỡ xem, 48 cặp Wang cùng hướng, 144 clip phát thật, 96 vòng lặp và 48 cử chỉ một lần, lifecycle/reduced motion/mobile390. [Three GPU](review/gpu-verification.json) kiểm 864 frame / 144 texture với nearest, alpha/UV/pivot và màu nguyên pixel. Đây là kiểm kỹ thuật, không mở approval ART/motion/runtime cho bảy hướng mới.

Giữ nguyên 380 pin của pilot sáu NPC 219, neutral 45, pilot bốn NPC 107 và delivery bốn NPC V2 chín pin. Wang live/GDD giữ hash chuẩn. Không sửa station/service/receipt/quest/reward/owner map/navigation/9 blocker/save/DB/draft.

Kiểm lại bằng:

~~~powershell
node docs/design/characters/van-hai-npc-wave-a-motion-v2/audit-source-edges.mjs --status
node docs/design/characters/van-hai-npc-wave-a-motion-v2/review/verify.mjs
node docs/design/characters/van-hai-npc-wave-a-motion-v2/review/verify-gpu.mjs
~~~

API dùng router gpt-image-2 hiện hành, plan trước mỗi lượt mới, không tự retry POST. Quyền JSON retry bộ bốn NPC V2 trước không mở sang bộ này. Các nguồn sửa có brief/plan/tên mới và giữ nguồn cũ; tùy chọn nền transparent được gửi rõ cho các lượt sau, kiểm alpha thực tế vẫn bắt buộc. Gói đã được owner duyệt theo hash phải giữ nguyên, dùng root mới khi mở rộng.
