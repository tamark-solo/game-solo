# Định hướng online — ba nhân vật chơi được

**Phiên bản:** 0.8 · **Ngày:** 08/10/2026 · **Chuẩn hiện hành:** [GDD 0.28](GDD.md), [tu tiên](CULTIVATION-SYSTEM.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md).

Quyết định mới thay mô hình đệ tử riêng: người chơi chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu; cùng vào Hằng Nhạc qua Ngưng Khí, phân hóa sau map nhập môn từ hành trình Trúc Cơ. Bản trước giữ trong [lịch sử](archive/design-before-three-playable-characters/ONLINE-DIRECTION.md). Tài liệu này là định hướng, không báo đã triển khai tài khoản/gameplay.

## 1. Tài khoản, nhân vật và tiến trình

| Phần | Thiết kế hiện hành |
| --- | --- |
| Lựa chọn ban đầu | Cả ba nhân vật có sẵn tại màn chọn; không chờ arc sau mới mở |
| Đang điều khiển | Đề xuất một nhân vật mỗi lần; số slot và cách đổi còn mở |
| Danh tính online | ID hồ sơ + tên tài khoản/biệt danh + nhãn nhân vật; cùng chọn Vương Lâm không cùng một save |
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

Mỗi lệnh cần quyền hồ sơ và cách xử lý một lần; gửi lại hoặc nhiều tab không nhân thưởng, đột phá hay thời gian. Kết nối lại khôi phục hoạt động/cảnh đang đọc và kết quả đã xác nhận. Một phiên điều khiển mỗi hồ sơ là đề xuất; hợp đồng thiết bị/phiên cần đặc tả.

Riêng [HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đề xuất checkpoint sau pha 1/2, reset hai actor khi thử lại pha chưa qua và pause tối đa 30 giây sau khi server phát hiện mất kết nối. Pause chỉ mô phỏng phiên cá nhân, không thế giới chung; không regen/offline thưởng khi pause. Kết quả đã lưu quyết định checkpoint/M04, event pha cũ không tác động pha mới. Luật này cần đánh giá/hợp đồng kỹ thuật, không áp ngầm cho PvP hoặc mọi encounter.

Tu luyện vắng mặt chỉ tiếp tục hoạt động đã chọn theo điều kiện/kho/bình cảnh. Không tự combat, truyện, lĩnh ngộ then chốt hoặc đại đột phá. [Hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất cap offline thử 30 phút, nền dừng ở cổng, thưởng nhiệm vụ vượt cổng được giữ và không tự xác nhận tầng; rời game trong combat/bài tương tác không tự chuyển hoạt động. Đây là luật thử cần đánh giá, không kế thừa 8 giờ cũ thành quyết định đã khóa.

## 5. Phạm vi kiểm chứng

Lát A đề xuất: ba lựa chọn từ đầu, hai tài khoản vào Hằng Nhạc, di chuyển/tương tác, nhiệm vụ/tu luyện đầu và combat đơn giản, lưu riêng. Lát B hoàn thiện Ngưng Khí và khảo nghiệm cuối. Lát C mở phân hóa Trúc Cơ. Đây là phân kỳ thiết kế, chưa là lịch phát hành.

Tài khoản, DB, loot/tổ đội/PvP/giao dịch, quy mô phòng/server và khóa/chuyển nhân vật còn mở. Backend phiên tạm hiện có chỉ chứng minh phần trong [hợp đồng preview](BACKEND-PREVIEW.md), không chứng minh sáu hệ tu tiên đã hoạt động.
