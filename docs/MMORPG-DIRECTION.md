# Định hướng MMORPG tu luyện — MVP có nhiệm vụ/farm/boss

**Phiên bản:** 0.8, ngày07/10/2026. Người phát triển ưu tiên map rộng theo cốt truyện, giữ cỡ nhân vật, nhập môn nhanh và chiến đấu trong MVP. Combat đã chọn: target/tự đánh thường, kỹ năng/né chủ động.

## Trải nghiệm

Một đệ tử riêng đi lại trong vùng Hằng Nhạc, nhận việc, đánh/thu thập, chế đồ, tự đột phá và thử boss. Tu luyện idle bổ sung tích lũy sau khi học pháp quyết. Vương Lâm giữ chính truyện/cơ duyên riêng; Tư Đồ Nam/Lý Mộ Uyển mở theo arc.

[MVP RPG-A](MVP-RPG-A.md) là phạm vi hiện tại; A đến Ngưng Khí tầng 3 với10 nhiệm vụ chính/2 phụ/2 lặp,4 quái thường/1 tinh anh/1 boss,16vật phẩm. Mục tiêu quái đầu phút 2–3 và boss phút 25–35 là cân bằng dự kiến, cần chơi thử.

## Map, hình ảnh và camera

[5 khu liên kết3840 × 2560 + hang riêng960 × 640](STARTER-REGION-MAP.md) giữ sprite64 × 96, cao khoảng80px ở1×, chibi2,5–3đầu và anchor(32,88). Camera cuộn theo người; không thu nhỏ người hoặc kéo giãn một sân thành vùng lớn. Nền stylized2D; portrait/UI mực/giấy.

[Bản bố trí](http://127.0.0.1:5173/starter-region.html) dùng hình khối để duyệt đường/POI/tỷ lệ. Gameplay farm/quái/NPC quest chưa triển khai; phòng online hiện vẫn là sân thử960 × 640.

## Phân kỳ A → B

| Bước | Trải nghiệm |
| --- | --- |
| A0 | Kịch bản/data/map bố trí đi thử |
| A1 | Vùng chung mới, tài khoản/lưu đệ tử và portal server |
| A2 | Q01–Q03, một quái, target/đánh/skill/loot/tầng 1 |
| A3–A4 | Farm/chế đồ/tầng 2, boss/Q10/tầng 3 và farm lặp |
| A5 | Hai tài khoản trọn hành trình, thử8 client thật, mobile/nhịp |
| B | Nhóm2–4, boss nhóm, thêm một vùng theo arc |

Quái/tinh anh chung, credit và loot riêng theo đóng góp. Boss A đề xuất một người trong phiên riêng; tương tác nhiều người vẫn ở vùng farm chung. PvP, world boss, giao dịch/bang hội/đấu giá và cảnh giới cao có đặc tả riêng.

## Công nghệ và mốc gần nhất

Client TypeScript + Three.js; backend TypeScript + Node.js + Colyseus đã chọn và có phòng di chuyển tạm. DB/auth/lưu tiến trình, AI/combat và quyền loot cần triển khai; mục tiêu8 client thật chưa là năng lực đã chứng minh.

Ưu tiên hiện tại là [nhìn/duyệt ART map](MAP-ART-DESIGN.md), chốt lớp/đường/tỷ lệ, rồi thiết kế nhiệm vụ/đánh/đồ/đột phá theo địa điểm. Vùng online/lưu và Q01–Q03 ở bước sau; nội dung/chỉ số hiện là nháp. [Backlog](MVP-BACKLOG.md) ghi thứ tự mới.

[Định hướng trước](MMORPG-DIRECTION-REFERENCE.md) và map node chính truyện lưu lịch sử; cách chia A chỉ idle/B mới combat đã được thay bằng RPG-A.
