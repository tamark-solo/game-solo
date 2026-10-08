# Định hướng online — vùng nhập môn RPG-A

**Ưu tiên thiết kế hiện tại:** [ART map để nhìn/duyệt](MAP-ART-DESIGN.md) trước, sau đó NPC/nhiệm vụ/combat/đồ/đột phá theo địa điểm. Vùng online và lưu tiến trình dưới đây triển khai sau bước duyệt map; bản nhiệm vụ/chỉ số hiện là nháp.

**Phiên bản:** 1.0, ngày07/10/2026. Người chơi là đệ tử riêng, cùng thế giới Hằng Nhạc; [MVP hiện tại](MVP-RPG-A.md) có nhiệm vụ, farm và boss ngay A. Client TypeScript + Three.js, backend Node.js + Colyseus.

## Không gian và chủ thể

| Không gian | Quy tắc A |
| --- | --- |
| Vùng nhập môn chung | 5 khu liên kết, người chơi/NPC/quái; vị trí/va chạm/HP do server |
| Hang boss | Phiên1 người với runId; gate Q08/Q09 và tầng 2 |
| Tu luyện | Tài nguyên/cổng riêng từng đệ tử; không chạy cùng combat/farm |
| Chính truyện Vương Lâm | Chương cá nhân; không áp dụng mốc/đồ của một người cho cả thế giới |

NPC chính trong vùng mở đầu là Vương Lâm áo xám/Trương Hổ; các vai quản sự/người giữ lối/tuần sơn là game bổ sung. Hạt châu của Vương Lâm không thành đồ của mọi tài khoản. Lý Mộ Uyển/Tư Đồ Nam không được mở trong A chỉ vì đã có sprite.

## Farm và quyền thưởng

Người có damage hợp lệ trong20 giây cuối, còn trong320px khi quái chết được xét quest credit/loot cá nhân. Không ép last hit hoặc thả đồ cho người khác nhặt. Party chia thưởng ở B. Quái có leash, không đi vào hub an toàn.

Mỗi lần chết tạo encounterRunId duy nhất; server đánh dấu cấp thưởng theo người/rewardType trong cùng giao dịch. Nhiệm vụ lặp dùng completionIndex; thùng thưởng đầu/boss pity là dữ liệu server. Không roll lại khi client gửi lại hoặc túi đầy; phần thưởng chờ nhận vẫn lưu.

## Tiến trình và kết nối

Tài khoản/nhân vật/version/giờ server quyết định progress; trình duyệt giữ cache/tùy chọn. Một phiên điều khiển/nhân vật; nhiều tab không nhân thời gian, đòn đánh hay thưởng. Hợp đồng auth/DB cần chốt trong A1, room state trong bộ nhớ không là lưu bền vững.

Di chuyển/skill/loot/đột phá gửi ý định và requestId. Server kiểm điều kiện, tài nguyên và idempotency, client hiển thị kết quả xác nhận. Mất mạng trong boss giữ hoặc reset theo quy tắc phiên được đặc tả trước combat; không cho mất kết nối để bỏ đòn rồi nhận thưởng.

Bế quan đã chọn tính4 tu vi/phút, tối đa8giờ vắng mặt, dừng tại gate nhiệm vụ/tầng. Không mô phỏng kill/loot khi đóng game. Farm và bế quan là hai hoạt động loại trừ nhau.

## Trạng thái hiện tại và lộ trình

Preview/runtime có sân chung tạm960 × 640, server-authoritative movement/reconnect; chưa có tài khoản/DB/combat/quest. [Bản map rộng](STARTER-REGION-MAP.md) là bố trí đi thử cục bộ. Mốc A1 nối vùng mới với server và tiến trình; A2 làm một quái/Q01–Q03 trước mở cả nội dung.

Mục tiêu kiểm thử8 client thật, chia room/shard theo số đo; hai phiên thử và20 hình local không chứng minh tải MMORPG. A cần hai tài khoản trọn hành trình/lưu qua restart, rồi thử nhóm/mobile theo [backlog](MVP-BACKLOG.md).

B thêm party2–4/boss nhóm và arc mới. Chat/giao dịch/PvP/bang hội/world boss cần thiết kế dữ liệu/kinh tế riêng, không tự coi đã có vì chọn thể loại MMO.

[Định hướng trước](ONLINE-DIRECTION-REFERENCE.md) và E01–E08/JSON save cũ giữ hồ sơ; [kịch bản đệ tử mới](STARTER-STORY.md) cùng [JSON](data/mvp-rpg-content.json) là đầu vào gameplay hiện tại.
