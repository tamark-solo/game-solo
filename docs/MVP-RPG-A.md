# MVP A mới — nhập môn Hằng Nhạc, nhiệm vụ và chiến đấu

**Phiên bản:** RPG-A 1.0, ngày 07/10/2026. **Ưu tiên đã xác nhận:** map rộng hơn, giữ tỷ lệ nhân vật; cốt truyện đầu nhanh, có nhiệm vụ/farm/boss/vật phẩm. **Combat đã chọn:** chọn mục tiêu, tự đánh thường; kỹ năng và né vùng đòn chủ động.

**Thứ tự mới theo yêu cầu:** [map có ART để nhìn/duyệt](MAP-ART-DESIGN.md) trước; nhiệm vụ, chiến đấu, phần thưởng và đột phá trong tài liệu này là nháp để biên tập theo map. Ưu tiên hiện tại MAP01–MAP04, chưa chuyển sang A1/A2.

Đây là phạm vi gameplay thay cho A nhập môn idle đến tầng 1 trước đây. Lộ trình **A → B** giữ lại; A nay kiểm chứng vòng MMORPG từ nhập môn đến Ngưng Khí tầng 3, B mở tổ đội và arc tiếp theo. Client/backend hiện có vẫn là công cụ preview và phòng di chuyển tạm; nhiệm vụ/combat/lưu lâu dài cần triển khai theo [backlog mới](MVP-BACKLOG.md).

## 1. Trải nghiệm của bản đầu

**Nhận nhiệm vụ → đi ra vùng ngoài → đánh quái/thu thập → nhận tu vi/vật liệu → trở về chế tạo/trang bị → đột phá → thử boss → tiếp tục farm.** Tu luyện idle là cách tích lũy thêm sau khi học thổ nạp; không bắt người mới chờ nhiều giờ trước chiến đấu.

| Phần | Phạm vi A |
| --- | --- |
| Nhân vật | Một đệ tử/tài khoản; hai mẫu chibi hiện có |
| Thế giới | 5 khu nối nhau trong vùng 3840 × 2560; 1 hang boss riêng 960 × 640 |
| Tiến trình | Phàm nhân → Ngưng Khí tầng 1 → 2 → 3; đột phá chủ động |
| Nhiệm vụ | 10 chính, 2 phụ, 2 lặp |
| Chiến đấu | Đánh thường + 2 kỹ năng chủ động; dùng bình hồi phục; né bằng di chuyển |
| Đối thủ | 4 loại thường, 1 tinh anh dùng họ sói, 1 boss riêng |
| Vật phẩm | 16 định nghĩa; 4 ô trang bị, túi 24 ô; 2 loại tiền |
| Chế tạo | Bình hồi phục, hộ phù, cường hóa chắc chắn +1 |
| Online | Thấy nhau trên vùng chung, quái chung, quyền thưởng riêng; boss A phiên một người |
| Mục tiêu kiểm chứng | Hai tài khoản chơi trọn vòng; thử tải 8 client thật là mục tiêu kỹ thuật, chưa là năng lực đã đo |

Portrait mới được để sau theo yêu cầu. PvP, giao dịch, đấu giá, bang hội, world boss, tổ đội và cảnh giới cao chuyển B hoặc các gói sau. Không dùng số map/node và ngân sách portrait cũ làm ngân sách bản đồ này.

## 2. Gắn với Tiên Nghịch

Người chơi là đệ tử do game bổ sung. Hằng Nhạc, áo ký danh xám, tạp vụ và phòng ở làm nền nhập môn; suối Đông Sơn và việc kiếm củi gợi đời sống của đệ tử. Các căn cứ này ở [chương 10](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-10) và [11](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-11).

Dược viên liên hệ Tôn Đại Trụ và pháp quyết ba tầng đầu. Giữ giới hạn khu vườn: người chơi hái ở bãi ngoài, không tự thu hoạch linh dược hoặc hút linh khí giữa luống. [Chương 17](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17).

**Địa hình chi tiết, quản sự/đệ tử tuần sơn, nhiệm vụ, quái, boss, trang bị và tốc độ lên tầng là chuyển thể của game.** Hạt châu vẫn thuộc Vương Lâm; không phát cho từng người. Hổ thoát hiểm ở [chương 7](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-7) giữ trong chương truyện, không đổi thành boss farm. Tư Đồ Nam và Lý Mộ Uyển giữ mốc B/arc sau.

Ba thẻ chính truyện ngắn mở sau Q02/Q05/Q10, mỗi thẻ đọc khoảng 15–30 giây, có thể bỏ qua để chơi rồi xem lại. Thẻ giới thiệu hoàn cảnh Vương Lâm; không làm mọi tài khoản nhận quan hệ/vật phẩm của ông. Hành trình dài của Vương Lâm được nén trong lời dẫn, không tuyên bố ông tu luyện nhanh như đệ tử người chơi.

## 3. Nhịp nhập môn

| Mốc | Mục tiêu thử |
| --- | --- |
| Phút 0–1 | Tạo/chọn đệ tử, nhận kiếm/áo và mục tiêu đầu |
| Phút 2–3 | Đánh quái nhỏ đầu tiên, biết chọn mục tiêu/nhận thưởng |
| Phút 5–7 | Chủ động đạt tầng 1, mở Linh khí chỉ và tu luyện |
| Phút 15–20 | Đạt tầng 2, có hộ thân và lựa chọn trang bị |
| Phút 25–35 | Gặp thử thách boss đầu |
| Phút 35–45 | Hoàn thành Q10, đột phá tầng 3; tiếp tục farm/hoàn thiện đồ |

Đây là mục tiêu cân bằng, chưa phải thời gian đã chơi thử. Nhiệm vụ tránh bắt đi lặp nhiều lần qua cùng đoạn: công việc suối/dược viên gom theo cụm, có đường vòng nối rừng với dược viên. Các điểm nghỉ và trở về môn phái mở theo tiến trình; không thu nhỏ nhân vật để hiển thị cả vùng trong màn chơi.

## 4. Kịch bản và nhiệm vụ

Kịch bản đầy đủ, lời thoại ngắn và điều kiện ở [STARTER-STORY.md](STARTER-STORY.md). [Dữ liệu nội dung](data/mvp-rpg-content.json) là nguồn ID/map/đối thủ/đồ/nhiệm vụ/cân bằng dùng cho triển khai.

| ID | Mục tiêu | Tác dụng mở |
| --- | --- | --- |
| Q01 | Đăng ký ở quản sự | Kiếm, áo, bình máu và đánh thường |
| Q02 | Nghe Trương Hổ, lấy nước và đánh 2 sơn thử | Target/loot; thẻ đời sống ký danh |
| Q03 | Luyện đánh và thổ nạp mẫu 15 giây | Tầng 1, Linh khí chỉ, tu luyện idle |
| Q04 | Dẹp 4 sơn thử ở nguồn nước | Tu vi, tiền, cống hiến |
| Q05 | Dẹp 4 giáp trùng, hái 2 lần ở bãi ngoài | Chế tạo/+1; thẻ dược viên |
| Q06 | Hạ 3 sơn trư, kiếm 2 lần củi/nhựa | Tầng 2, Hộ thân thuật, giày |
| Q07 | Hạ 4 hôi lang, tới trạm khe đá | Đường thử thách và nhiệm vụ lặp |
| Q08 | Hạ lang đầu đàn | Vật liệu cường hóa, quyền mở hang |
| Q09 | Chế một bình máu, trang bị hộ phù | Đủ chuẩn bị cho boss; không cần đồ hiếm |
| Q10 | Hạ Hắc Nha Yêu Lang, chọn thưởng đầu | Tầng 3, lệnh ngoại viện, farm boss lặp |

S01 là xem chuyện đồng môn ở Vương Lâm; S02 hướng dẫn vật liệu hộ phù. R01/R02 là săn sói/thu thập sơn thảo có thưởng cố định. Nhiệm vụ phụ không bắt buộc để qua A: tuyến chính cung cấp đủ vật liệu và tiền cho Q09.

## 5. Combat và chỉ số thử

Chọn mục tiêu và tới cự ly 80 px để tự đánh thường, chu kỳ 0,8 giây; ngoài tầm/qua vật cản sẽ dừng đánh. WASD/cảm ứng điều khiển nhân vật; kỹ năng dùng nút 1/2 hoặc UI, bình hồi phục nút 3. Không tự tìm đường đuổi mục tiêu khi người chơi đang né. Hai kỹ năng đầu là thiết kế game, không khẳng định là thuật pháp nguyên tác tại mốc này.

| Động tác | Số liệu khởi đầu |
| --- | --- |
| Linh khí chỉ | Mở Q03; 24 sát thương cơ bản, tầm 192 px, hồi 6 giây, 8 linh lực |
| Hộ thân thuật | Mở Q06; chắn 20 HP trong 4 giây, hồi 12 giây, 10 linh lực |
| Bình máu | Hồi 50 HP, hồi dùng 10 giây; tiêu hao một bình |
| Bình linh lực | Hồi 30 linh lực, hồi dùng 10 giây; tiêu hao một bình |

HP/linh lực nền 100/60; mỗi tầng sau tầng 1 thêm 30/10. ATK nền 14, vũ khí nhập môn +6; mỗi tầng sau tầng 1 thêm 10. Sát thương `max(1, ATK − DEF)`, chưa có crit/né ngẫu nhiên. Boss có HP 1900, ba đòn báo vùng trong 1,1–1,6 giây; không thêm lính nhỏ vào boss đầu. Mục tiêu trận đầu khoảng 60–120 giây, cần đo khi có combat.

Server xác nhận mục tiêu, cự ly, đường nhìn, cooldown, linh lực, va chạm, HP, chết và quyền thưởng. Client chỉ gửi ý định; animation/VFX không tự cấp sát thương. Boss báo thời điểm chuẩn bị và vùng đòn theo giờ server, để client hiển thị cùng một diễn biến. Kỹ năng/potion gửi lại lệnh phải không trừ/cộng lần thứ hai.

## 6. Quái và vòng farm

| Đối thủ | Khu | HP / tu vi | Hồi sinh | Vật liệu chính |
| --- | --- | --- | --- | --- |
| Sơn thử | Suối | 48 / 4 | 15 giây, 6 vị trí | Da thú, 65% |
| Giáp trùng | Bãi ngoài dược viên | 100 / 6 | 20 giây, 6 vị trí | Sơn thảo, chắc chắn |
| Sơn trư | Rừng tùng | 160 / 8 | 25 giây, 5 vị trí | Da thú, chắc chắn |
| Hôi lang | Rừng tùng | 210 / 10 | 30 giây, 6 vị trí | Nanh lang, chắc chắn |
| Lang đầu đàn | Khe đá | 600 / 50 | 60 giây, 1 vị trí | 2 mảnh linh thạch |
| Hắc Nha Yêu Lang | Hang riêng | 1900 / 120 | Phiên mới sau 45 giây chờ vào lại | Tinh hạch; kiếm hiếm 15%, bảo đảm ở lần hạ thứ 5 |

Lần Q10 đầu cho **chọn kiếm hiếm hoặc áo hiếm chắc chắn**, độc lập lượt drop ngẫu nhiên; không khóa đột phá sau một lượt roll. Farm tiếp phục vụ bộ đồ, vật liệu và cống hiến. Quái thường dùng spawn riêng, có bán kính đuổi và leash về điểm sinh; không kéo vào khu an toàn. Khi không có người ở vùng lân cận, server có thể giảm tick AI, không cấp thưởng giả lập khi vắng mặt.

Quái chung không yêu cầu last hit: người đánh hợp lệ trong 20 giây cuối, còn ở trong 320 px khi chết được xét credit/thưởng cá nhân. Chưa có party A; cơ chế chia theo tổ đội được làm ở B. Boss A là phiên riêng một người, để hành trình không phụ thuộc giành lượt ngoài thế giới; tinh anh vẫn ở vùng chung. Khi thất bại trở về điểm an toàn, giữ vật phẩm nhiệm vụ/trang bị/tiền, boss phiên đó đặt lại.

## 7. Tu vi, vật phẩm và kinh tế

Ngưỡng tổng tu vi: **100 / 400 / 900** cho tầng 1/2/3, đồng thời cần Q03/Q06/Q10. Đột phá chủ động; không thất bại ngẫu nhiên trong A. 10 nhiệm vụ cho 860 tu vi, lượng kill tối thiểu cho 282, tổng 1142: tuyến chính đủ tầng 3 mà không bắt farm thêm; số dư giữ trong ngân hàng tu vi chờ giai đoạn sau. Tu vi từ săn quái là quy tắc RPG chuyển thể.

Tu luyện sau Q03 cho 4 tu vi/phút, tối đa 8 giờ vắng mặt; tạm dừng ở cổng tầng chưa đủ nhiệm vụ. Không có kill/loot/boss offline. Bế quan và farm là hai hoạt động loại trừ nhau ở một thời điểm.

Túi 24 ô, vật liệu/bình cộng dồn tối đa 99; trang bị dùng 4 ô riêng: vũ khí/áo/giày/hộ phù. Đồ A gắn nhân vật, không có giao dịch. Hai số dư là đồng tiền và cống hiến; mảnh linh thạch là vật liệu, không là một số dư thứ ba. Hộ phù/bình máu/cường hóa +1 đều có công thức chắc chắn. Không thêm rèn nhiều tầng, bộ đồ, thuộc tính ngẫu nhiên hoặc cửa hàng tiền thật vào A.

Server cấp thưởng bằng khóa `(encounterRunId, characterId, rewardType)`; nhiệm vụ dùng `(questId, characterId, completionIndex)`. Túi đầy phải giữ phần thưởng trong danh sách chờ nhận, không xóa hoặc roll lại. Nhiệm vụ lặp nhận một bản đang hoạt động, xóa bộ đếm khi trả và tăng completionIndex; cùng một kill không dùng trả hai vòng liên tiếp.

## 8. Gói ART cần cho combat

Giữ toàn bộ sprite đứng/đi hiện có và tỷ lệ. Hai avatar cần thêm 4 frame đánh/hướng và 2 frame dùng pháp/hướng: 24 frame mới mỗi mẫu, tổng 48. Quái thường dự kiến 29 frame/loại, bốn loại 116; tinh anh dùng họ sói và biến thể màu. Boss dự kiến 40 frame riêng, khung lớn hơn theo vai trò; kích thước chưa duyệt. Tổng combat bổ sung dự kiến **204 frame**, chưa vẽ; cân nhắc thử một avatar/một quái trước khi mở cả gói.

Map cần bộ mặt đất, đường, cây/vách, nhà/cổng, điểm tương tác và hiệu ứng báo vùng. [Map bố trí](STARTER-REGION-MAP.md) dùng hình khối để kiểm đường đi/tỷ lệ; ART hoàn chỉnh sản xuất theo khu. Không kéo giãn một ảnh sân cũ thành cả vùng.

## 9. Điều kiện hoàn thành A và chuyển B

Hai tài khoản mới độc lập phải làm Q01–Q10, đạt tầng 3, có một phần thưởng boss đầu, chế được hộ phù/bình máu, đột phá và đăng nhập lại giữ tiến trình. Quái dùng chung hoạt động và thưởng đúng người; reconnect không nhân vật liệu/tu vi. Kiểm thử đủ 8 client thật theo mục tiêu đề xuất trước khi mở chơi thử nhóm; điều chỉnh sức chứa theo số đo.

Kiểm tra hành trình khi không rơi đồ hiếm trước Q10, túi đầy, hai người cùng hạ quái, chết trong boss, mất mạng khi thưởng/đột phá, gửi lại lệnh và hai tab cùng tài khoản. Boss báo vùng đọc được ở desktop/360 px, giữ cỡ nhân vật như preview hiện tại.

B bổ sung tổ đội 2–4, boss nhóm, một vùng tiếp theo và chiều sâu trang bị/kỹ năng; world boss, PvP và giao dịch cần gói kinh tế riêng. Tiêu chí A nhập môn tầng 1 và 9 node trong đặc tả cũ được lưu tham chiếu, không dùng nghiệm thu A mới.
