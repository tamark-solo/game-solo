# Backlog thiết kế — Hằng Nhạc và hệ thống tu tiên

**Phiên bản:** 0.12 · **Ngày:** 08/10/2026 · **Tham chiếu:** [GDD 0.28](GDD.md), [tu tiên](CULTIVATION-SYSTEM.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md).

Backlog hiện hành thay tuyến đệ tử P và kết thúc A tại Ngưng Khí tầng 1. [Backlog trước](archive/design-before-three-playable-characters/MVP-BACKLOG.md) giữ ID/tiến độ kỹ thuật và kế hoạch cũ; không dùng Bxx cũ làm luật mới. Các công việc dưới đây chưa được triển khai chỉ bởi biên tập GDD.

## 1. Đã chốt / đã bàn giao

- Chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu.
- Hằng Nhạc chung qua Ngưng Khí; phân hóa sâu sau map nhập môn từ hành trình Trúc Cơ.
- Sáu phần phát triển tu tiên và hướng theo truyện rồi chuyển thể/mở rộng.
- Bộ R01 Kiếm Khí/Lôi Ấn/Ngự Phong Bộ có sẵn cho cả ba khi bắt đầu điều khiển; nhiệm vụ dạy vận dụng, không khóa quyền skill.
- Đợt ART/VFX R01–R05 đã đóng; không mở thêm sản xuất cảnh giới trong bước tài liệu này.
- Preview local dùng 6 bộ/136 frame. Hằng Nhạc đã có ba hồ sơ khách SQLite/lưu và R01 luyện thử; fixture online cũ giữ hai avatar đệ tử. Level Design/Map Editor 0.12.0 biên tập map; save người chơi nằm ở server. Đăng nhập sản xuất, nhiệm vụ/combat farm/tu tiên còn tiếp tục.

**Ưu tiên hiện tại:** nền owner, [hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md) và [mở đầu HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử; tiếp nối HN03–HN04 theo [kế hoạch](HANG-NHAC-IMPLEMENTATION-PLAN.md), rồi farm/khảo nghiệm riêng. Chủ dự án bố trí level/vùng; không sửa blocker đã chốt hoặc mở lại ART cũ. GDxx vẫn là hồ sơ thiết kế; các mốc thử không xác nhận toàn lát A/B/C.

[Biên bản xóa ART cũ](data/hang-nhac-art-removal-2026-10-08.json) giữ danh sách 203 file. [Map hiện hành](design/world/hang-nhac-map-v1/README.md) đã được owner chốt và tích hợp.

## 2. Đặc tả trước triển khai

[Trải nghiệm v0.4](HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay v0.3](NGUNG-KHI-GAMEPLAY-SPEC.md) và [tiến trình/phần thưởng v0.2](HANG-NHAC-PROGRESSION-REWARDS.md) có tuyến, bộ chung, nền/15 ngưỡng, vật tư và idle thử. [Đối thủ/HN10 v0.1](HANG-NHAC-ENCOUNTERS-TRIAL.md) bổ sung GD06/GD09/GD10: collider/telegraph/AI, ba pha, checkpoint/reset và pause riêng khi mất mạng. Trạng thái là **đã có đề xuất để đánh giá**, chưa duyệt số liệu/chơi thử/triển khai. GD07/GD12 cần hợp đồng phiên/tài khoản/kỹ thuật và ngân sách animation; GD11 thiết kế tuyến sau map.

| ID | Công việc | Phụ thuộc | Kết quả cần đánh giá |
| --- | --- | --- | --- |
| GD01 | Mở đầu chuyển thể ba nhân vật | GDD | Cả ba chọn từ đầu; không kể họ cùng nhập môn trong canon |
| GD02 | Trạng thái ban đầu và mốc gameplay | GD01 | Tư Đồ Nam giữ kiến thức/cảnh giới truyện, có giới hạn năng lực và tuyến hồi phục rõ |
| GD03 | Tuyến Hằng Nhạc qua Ngưng Khí | GD01, GD02 | Nhiệm vụ chung/đoạn riêng, mốc đầu/cuối, khảo nghiệm cuối và mục tiêu chuẩn bị Trúc Cơ |
| GD04 | Hồ sơ công pháp/thuật/pháp bảo nhập môn | GD02, GD03 | Nguồn/nhãn sáng tạo, điều kiện, tác dụng, giới hạn; cả ba tự chơi được |
| GD05 | Luật sáu phần và một bình cảnh mẫu/người | GD02, GD04 | Quan hệ tu vi/linh lực/công pháp/lĩnh ngộ, cổng mốc, chuẩn bị và xác nhận |
| GD06 | Combat và cân bằng nhập môn | GD04, GD05 | Stat, chi phí/nhịp, đối thủ/hitbox, quyền học; không lấy rìa ART làm vùng damage |
| GD07 | Tài khoản/hồ sơ và quyền chuyển | GD02 | Slot/đổi người/kho chung/tiến trình riêng, lệnh/lưu/khôi phục |
| GD08 | Idle và kinh tế nền | GD05, GD07 | Hoạt động được phép, cap/chi phí/kho; không auto truyện/combat/đại đột phá |
| GD09 | UX mở dần | GD03–GD08 | Chọn ba người, mục tiêu hiện tại, điều kiện thiếu, trạng thái hồi phục dễ hiểu |
| GD10 | Map/NPC và nội dung lặp | GD03, GD06 | Vùng đi lại, phiên khảo nghiệm, quyền thưởng; node truyện cũ không là địa lý đã khóa |
| GD11 | Phân hóa Trúc Cơ đầu | GD04, GD05 | Một lựa chọn/tổ hợp/tuyến riêng có tác dụng thật, thử/chỉnh được |
| GD12 | Ngân sách ART cho cả ba | GD04, GD06, GD09 | Tách asset có sẵn khỏi animation/hướng mới; không tự mở lại gói đã duyệt |

## 3. Lát kiểm chứng đề xuất

| Lát | Mục tiêu | Nghiệm thu |
| --- | --- | --- |
| A | Chọn ba người, nhập môn online hẹp | Hai tài khoản vào Hằng Nhạc, thấy nhau; nhiệm vụ/tu luyện đầu/combat đơn giản; lưu riêng |
| B | Hoàn thiện map Hằng Nhạc | Cả ba hoàn thành Ngưng Khí/hồi phục tương ứng, khảo nghiệm cuối, thưởng/rời map một lần |
| C | Phân hóa sau nhập môn | Công pháp/tổ hợp/tuyến Trúc Cơ khác nhau trong hành động/chuẩn bị |

Phạm vi cụ thể, lịch triển khai và số map chưa chốt. A có thể dừng tại một mốc nhỏ để kiểm kỹ thuật, không được báo hoàn thành toàn nhập môn. GDxx là công việc thiết kế, chưa là ticket runtime hoặc nghiệm thu đã chạy.

## 4. Trường hợp cần kiểm khi có prototype

Ba lựa chọn đều vào được từ đầu; người chọn giống nhau có save riêng; nguồn truyện không bị đổi do khu chung; không auto mở cảnh giới cao từ ART; tu vi và linh lực khác nghĩa; Tư Đồ Nam không bị viết thành phàm nhân; Lý Mộ Uyển tự combat được; cổng bình cảnh nói rõ phần thiếu; mất mạng/gửi lại không lặp chi phí/thưởng; idle không tự truyện/đột phá; khảo nghiệm cuối không chỉ là check tổng EXP; rời Hằng Nhạc không tự cấp Trúc Cơ.
