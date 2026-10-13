# Lang Vương · điều kiện ghép gameplay

Gói này thử hình và nhịp boss solo. [Kit](kit.json) là hợp đồng fixture cố định; số liệu dưới đây chưa khóa cân bằng game. Khi tích hợp, đọc [Skill Core](../../../SKILL-CORE.md), giữ writer/receipt của chương hiện hành và chuyển fixture sang facts do server xác nhận.

| Chiêu | Khóa hướng | Phát chiêu | Resolve | Kết thúc |
| --- | --- | --- | --- | --- |
| Nanh cắn | tick6 | tick29 | tick30 | tick41 |
| Vân Nha | tick7 | tick29 | tick37 | tick51 |
| Hồi Phong | tick8 | tick38 | tick39 | tick60 |

Mỗi tick là1/24giây. `kit.json` là nguồn chuẩn cho holds và các mốc; đổi nhịp phải đổi fixture, timeline body và kiểm đường né cùng nhau. Review dùng player80px/s, bán kính chân8px,250ms phản ứng và120ms trễ mẫu. Không suy từ một lượt né mẫu rằng mọi encounter/live latency đã an toàn.

## Facts → timeline → presentation

Server sở hữu intent, locked aim, release, kết quả hit/miss/cancel, điểm đến và trạng thái encounter/life. Presentation lấy tuổi tuyệt đối từ cùng clock Core; không tính hit bằng số frame đã chạy, callback texture hoặc VFX chạm sprite. Dữ kiện đến trễ phải chọn đúng tuổi hiện tại, không phát lại chuỗi từ đầu.

Release và contact là hai sự kiện riêng. Hụt vẫn có release nhưng không có impact trên player; hủy trước release bỏ cả release/contact. Dedup cần khóa encounter/life/cast/event ổn định, có giới hạn tuổi/cache và được xử lý đúng khi reconnect. Seek/reset của review không phải cơ chế replay lệnh gameplay hoặc cấp thưởng.

**Vân Nha:** hướng khóa rồi mới chồm theo capsule192px, half-width20px, travel8tick. Root di chuyển tới điểm đến và giữ tại đó qua hồi thế; body animation, camera hoặc snapshot cũ không kéo boss về origin. Va chạm/blocker và điểm đến thật cần server quyết định trước khi dùng chuyển động này trong map.

**Hồi Phong:** vòng mẫu inner36/outer104px, khe an toàn90° phía sau locked aim. Sau lock không homing, không xoay vùng đòn/khe theo player. Cảnh báo giữ đúng vùng gameplay; texture khí là lớp mỹ thuật, không làm collider. Khí quét cần chiếu trên mặt đất và quay theo hướng đã khóa, giữ khe đọc được cả khi thân/FX giao nhau.

## Neo, lớp vẽ và nghiệm thu

Dùng pivot(160,144), common canvas320×176 và scale neutral96px đã đăng ký. Không fit lại từng pose khi nạp runtime. Root ngang từ sole footprint16% của neutral phải có witness; giữ root đó qua các action, tách corpse plane/lift khỏi world foot và bóng. Đối chiếu đầu/mane/thân ở chuyển idle→cast→idle; chiều cao96 một mình không chứng minh anatomy ổn.

Giữ body, bóng, ground warning, charge, release, contact và arrival thành các lớp riêng. Contact gắn điểm hit được xác nhận; release khóa origin/aim tương ứng, không chạy theo camera hoặc body đã hồi thế. Tuổi FX tiếp tục đến hết tail; giảm FX phụ khi nhiều lớp chồng nhưng giữ thân, cảnh báo và kết quả hit.

Trước live, owner cần xem tám hướng thật, chuyển action, loop, collapse và VFX ở camera1×; pin approval riêng cho motion/FX đã chọn. Kiểm hash/source/atlas/gutter và browser fixture là bước kỹ thuật. Sau đó mới scoped integration AI solo, kiểm đường né/va chạm, trúng–hụt–hủy, snapshot trễ, reconnect và encounter/life reset trên DB/map fixture. Không dùng owner save để làm test.

Lang Khiếu/adds cần prototype riêng theo [checklist cụm quái](../van-hai-monster-animation-v1/CLUSTER-REVIEW.md): giãn điểm tiếp cận, dàn nhịp server/Core, giới hạn FX cộng dồn và giữ đường né. Chưa mở AI/drop/loot, thay Lang02/Khôi Lỗi02 đang chơi, sửa navigation/blocker/map/DB hoặc tăng HP/MP. Các gate này là phần triển khai kế tiếp; neutral được duyệt không tự duyệt gameplay mới.
