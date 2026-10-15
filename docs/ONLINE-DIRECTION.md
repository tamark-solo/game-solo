# Định hướng online — ba nhân vật chơi được

**Snapshot 0.9 · 11/10/2026 · trước GDD 0.35.** Chuẩn hiện hành để đối chiếu là [GDD 0.35](GDD.md), [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md), [pacing tu luyện](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md) và [lộ trình VG01–VG11](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md).

Owner làm rõ mục tiêu xuyên chặng: farm/build để mạnh, vận dụng trong PvE/PvP và thể hiện nhân vật bằng trang bị/thời trang/tọa kỵ/pháp bảo. [Ma trận MMORPG](MMORPG-PROGRESSION-PLAN.md) và [hợp đồng Core/backend](MMORPG-SYSTEM-CONTRACTS.md) nối mục tiêu đó vào lộ trình từng gói; cụ thể loot/credit/ruleset/ART còn là thiết kế. Pilot farm/tỷ thí/diện mạo có thể được chọn sau nền RM2 đủ ổn, trước khi hoàn tất toàn tiện ích MMO.

Quyết định mới thay mô hình đệ tử riêng: người chơi chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu; cùng vào Hằng Nhạc qua Ngưng Khí, phân hóa sau map nhập môn từ hành trình Trúc Cơ. Bản trước giữ trong [lịch sử](archive/design-before-three-playable-characters/ONLINE-DIRECTION.md). Đây là định hướng; phần đã có local được ghi riêng dưới đây, không xác nhận mọi mục tiêu đã triển khai.

## 1. Tài khoản, nhân vật và tiến trình

Code local đã có [entry tài khoản/server/tạo/chọn nhân vật](GAME-ENTRY-BACKEND.md), SQLite account/realm/character, play ticket/lease, admin/audit; save khách giữ riêng. R01, HN01–HN04/thổ nạp online và [hành trang nhập môn](HANG-NHAC-CHARACTER-RUNTIME.md) đã có pilot. Chưa farm/loot/duel/party/appearance/tọa kỵ hoặc khảo nghiệm cuối; distributed routing/khóa nhiều host và offline vẫn cần đặc tả/triển khai.

| Phần | Thiết kế hiện hành |
| --- | --- |
| Lựa chọn ban đầu | Cả ba nhân vật có sẵn tại màn chọn; không chờ arc sau mới mở |
| Quyền skill khởi đầu | Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 có sẵn cho cả ba từ lúc điều khiển; nhiệm vụ chỉ hướng dẫn |
| Đang điều khiển | Entry local đã có một nhân vật điều khiển/tài khoản, mặc định 3 slot/realm có admin cấu hình; đổi qua luồng chọn, chuyển realm/kho chung còn mở |
| Danh tính online | ID hồ sơ + tên hồ sơ/biệt danh + nhãn nhân vật; cùng chọn Vương Lâm không cùng một save; tên đăng nhập không cần công khai |
| Tiến trình riêng | Mốc/cảnh giới hoặc hồi phục, tu vi, công pháp, thuật, pháp bảo, lĩnh ngộ, chương và tài nguyên |
| Dùng chung tài khoản | Chưa chốt kho/tri thức/tiện ích chung; không tự chuyển tu vi, cơ duyên hoặc đồ độc hữu giữa nhân vật |
| Máy chủ | Xác nhận trạng thái, hoạt động, kết quả và quyền truy cập của hồ sơ |

Tên biệt danh không viết lại quan hệ/gia đình của nhân vật trong truyện. Không mặc định một tài khoản điều khiển tổ đội ba người, đổi giữa trận, gacha hoặc mua nhân vật.

## 2. Không gian chung và phiên cá nhân

| Không gian | Nội dung | Quy tắc |
| --- | --- | --- |
| Hằng Nhạc chung | Nhân vật đi lại, gặp người chơi/NPC, hoạt động chung | Nhiều phiên cùng nhân vật là cách biểu diễn gameplay, không thêm nhân vật mới vào canon |
| Tu luyện riêng | Hoạt động và tài nguyên của hồ sơ | Người khác không lấy hoặc sửa tiến trình nếu không có luật tương tác đã duyệt |
| Chương cá nhân | Trạng thái truyện, cơ duyên và lời dẫn riêng | Một tài khoản hoàn thành không đổi tiến trình toàn server |
| Khảo nghiệm cá nhân/tổ đội | Nhiệm vụ và kết quả chiến đấu | Điều kiện tham gia, quyền thưởng và cập nhật mốc phải đặc tả riêng |
| Hoạt động thế giới | Nội dung lặp có ngữ cảnh | Không lặp biến cố độc hữu của truyện như một sự kiện toàn server |

Chọn Lý Mộ Uyển/Tư Đồ Nam từ đầu là chuyển thể nhập môn, không thay thời điểm họ xuất hiện trong tuyến truyện nguyên tác của Vương Lâm. Khu chung tránh spoil; phiên truyện dùng trạng thái theo chương. Quy tắc cùng nhân vật trong party hoặc cùng chương nhóm còn mở, không tự cấm chơi chung chỉ vì chọn giống nhau.

## 3. Mốc chung và sức mạnh khác nhau

Vương Lâm có tiến triển tu luyện đầu. Tư Đồ Nam có trạng thái linh thể/hồi phục năng lực hiện dùng được; không gọi ông là tu sĩ Ngưng Khí mới. Lý Mộ Uyển có tuyến mở đầu gameplay riêng giữ nền đan–trận. Mốc nhập môn chung hỗ trợ nội dung/ghép nhóm nhưng không đồng nhất cảnh giới canon.

Không lấy một trường “cảnh giới” duy nhất để quy đổi sức mạnh cả ba trước khi có thiết kế cân bằng. Sức mạnh và giới hạn hiện dùng được cần hồ sơ theo nhân vật/mốc.

## 4. Thời gian, lệnh và lưu

Máy chủ sở hữu thời gian, chi phí, phần thưởng, vị trí hợp lệ, damage, học/luyện hóa và mốc truyện. Trình duyệt chỉ giữ tùy chọn/cache. Import JSON cũ không thay trạng thái hợp lệ.

Mỗi lệnh cần quyền hồ sơ và cách xử lý một lần; gửi lại hoặc nhiều tab không nhân thưởng, đột phá hay thời gian. Kết nối lại khôi phục trạng thái và kết quả theo contract của từng hoạt động. Lease điều khiển đã có trong entry local; chuyển room cần handoff một writer, lock nhiều host/thiết bị cần mở rộng theo [hợp đồng Core](MMORPG-SYSTEM-CONTRACTS.md).

Riêng snapshot HN10 đề xuất checkpoint sau pha 1/2, reset hai actor khi thử lại pha chưa qua và pause tối đa 30 giây sau khi server phát hiện mất kết nối. Pause chỉ mô phỏng phiên cá nhân, không thế giới chung; không regen/offline thưởng khi pause. Kết quả đã lưu quyết định checkpoint/M04, event pha cũ không tác động pha mới. Luật này cần đánh giá/hợp đồng kỹ thuật, không áp ngầm cho PvP hoặc mọi encounter.

Tu luyện vắng mặt chỉ tiếp tục hoạt động đã chọn theo điều kiện/kho/bình cảnh. Không tự combat, truyện, lĩnh ngộ then chốt hoặc đại đột phá. Cap offline thử 30 phút và nền dừng ở cổng là fixture lịch sử; hợp đồng hiện hành giữ nguyên yêu cầu khóa đầu ra khi đầu vào khóa. Rời game trong combat/bài tương tác không tự chuyển hoạt động. Đây là luật thử cần đánh giá, không kế thừa 8 giờ cũ thành quyết định đã khóa.

## 5. Phạm vi kiểm chứng

Lát A đề xuất: ba lựa chọn từ đầu, hai tài khoản vào Hằng Nhạc, di chuyển/tương tác, nhiệm vụ/tu luyện đầu và combat đơn giản, lưu riêng. Lát B hoàn thiện Ngưng Khí và khảo nghiệm cuối. Lát C mở phân hóa Trúc Cơ. Đây là phân kỳ thiết kế, chưa là lịch phát hành.

Entry local đã có đăng nhập và DB hồ sơ; vận hành production, loot/tổ đội/PvP/giao dịch và quy mô nhiều server còn mở. [Bản thử hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md) giữ hợp đồng guest riêng. Map owner, tương tác môn phái và HN01–HN04 đã tích hợp; nội dung hiện hành là VG01–VG11 theo [hợp đồng](GDD-035-UNIFIED-CONTRACT.md), rồi các pilot MMORPG khi gate đủ. Chưa chứng minh sáu hệ tu tiên hoặc kinh tế MMO hoạt động.
