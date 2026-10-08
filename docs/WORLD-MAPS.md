# Hệ thống map — MMORPG nhập môn và các arc sau

**Phiên bản:** 0.3, ngày07/10/2026. Phạm vi hiện tại là [RPG-A](MVP-RPG-A.md): map rộng hơn, cỡ nhân vật như hiện tại và nhiệm vụ/farm/boss trong A.

**Chuẩn xây map:** [quy tắc dùng lâu dài](MAP-BUILDING-GUIDE.md), [kế hoạch đoạn ngoại viện native mẫu](MAP-COURTYARD-PILOT-PLAN.md). Giữ bố cục ART tổng; gom cụm/tách lớp theo cách người chơi đi quanh, hoàn thiện đoạn mẫu trước toàn vùng. [MAP03](MAP-LAYERED-DESIGN.md) đang là prototype có lỗi hình ảnh, không phải ART native đã duyệt.

## Map A hiện tại

Vùng Hằng Nhạc3840 × 2560 có ngoại viện, suối Đông Sơn, lối ngoài dược viên, rừng tùng và khe đá nối nhau. Hang yêu lang960 × 640 là scene riêng. Đồ thị/toạ độ/POI/va chạm trong [STARTER-REGION-MAP](STARTER-REGION-MAP.md) và [JSON](data/mvp-rpg-content.json).

**[Đi thử map](http://127.0.0.1:5173/starter-region.html)** · Sơ đồ (bộ cũ đã xóa).

Nhân vật64 × 96, chân(32,88), cao khoảng80px ở1×. Camera cuộn, mobile cắt vùng nhìn, không kéo giãn sân cũ hoặc thu nhỏ người. Đường nối128px và ô bố trí64px; collider độc lập.

Map mới là bố cục chuyển thể gắn bối cảnh Hằng Nhạc, không tuyên bố là địa lý nguyên tác. Dược viên bên trong hạn chế; hang boss khác hang Vương Lâm nhặt châu. Vị trí NPC/loot và scene truyện cá nhân do dữ liệu biên tập theo người chơi.

## Lộ trình

| Bước | Map/nội dung |
| --- | --- |
| A0 | Bản bố trí đi thử5 khu+hang, NPC/quest/đối thủ là điểm thiết kế |
| A1 | Vùng chung mới trên server, portal/lưu tiến trình, hai tài khoản |
| A2–A4 | Farm/nhiệm vụ/combat và boss theo tuyến chính |
| B | Thêm một vùng theo arc; party2–4/boss nhóm |
| Sau B | Vùng Triệu Quốc/Tu Ma Hải và arc khác khi nội dung/chỉ số/kinh tế được biên tập |

Các địa danh arc sau là kế hoạch, không thêm map/nhân vật sau vào A chỉ vì có tạo hình. Tải theo vùng/chunk và giới hạn room cần thử tải thật.

## Chính truyện tham chiếu

[9/13 node trước](WORLD-MAPS-IDLE-REFERENCE.md) giữ để đọc lại hành trình Vương Lâm. Những node, luật di chuyển bằng mốc và kết thúc tầng 1 không là map gameplay của đệ tử. Các căn cứ nguyên tác được giữ trong bản tham chiếu; kịch bản đệ tử ở [STARTER-STORY](STARTER-STORY.md).

Bản online hiện chạy sân960 × 640; bản map rộng là preview cục bộ. [Backlog](MVP-BACKLOG.md) ghi mốc nối server và kiểm chứng gameplay.
