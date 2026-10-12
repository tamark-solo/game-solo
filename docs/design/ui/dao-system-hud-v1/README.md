# Icon và HUD toàn hệ thống — Dao 03

**Pack lịch sử/đối chiếu:** theo phản hồi owner, [thiết kế 04](../../../XIANXIA-FUNCTION-UX-REDESIGN.md) đổi navigation sang 38 glyph SVG gốc và menu theo mục đích. 48 bitmap dưới đây vẫn giữ nguyên nguồn/prompt/hash, chỉ dùng để so cũ/mới trên trang review; chưa tích hợp runtime.

**11/10/2026 · 24 chức năng × 2 bộ vật liệu.** Theo yêu cầu trực tiếp phải thiết kế toàn bộ vùng HUD và icon chức năng trước khi tiếp tục luồng shell/gameplay. [Thiết kế và cách mở](../../../FULL-HUD-SYSTEM-DESIGN.md), [bản có thể xem](http://127.0.0.1:5174/ui-material-review.html).

## Nguồn và prompt

| Sheet | Tu Đạo | Đọa Ma |
| --- | --- | --- |
| 12 icon nhân vật/vật phẩm | [PNG nguyên gốc](tu-dao/dao-source.png) · [Prompt](tu-dao/dao.prompt.txt) | [PNG nguyên gốc](doa-ma/dao-source.png) · [Prompt](doa-ma/dao.prompt.txt) |
| 12 icon MMO/hoạt động | [PNG nguyên gốc](tu-dao/mmo-source.png) · [Prompt](tu-dao/mmo.prompt.txt) | [PNG nguyên gốc](doa-ma/mmo-source.png) · [Prompt](doa-ma/mmo.prompt.txt) |

Built-in `image_gen` theo skill imagegen; không CLI/API fallback. Tu Đạo tạo mới theo [guide bố cục](guides/icon-grid.png), frame Tu Đạo và concept map; Đọa Ma sửa vật liệu từ đúng sheet Tu Đạo, frame Đọa Ma và map làm style reference. Guide SVG/PNG chỉ chỉ định grid, không phải ART cuối.

PNG được copy từ kết quả `.codex/generated_images/01a1210e-d50e-74f0-86ba-c0f93b0ab70b/`, giữ nguyên:

- Tu Đạo dao: `exec-40139fc4-e521-4b89-980e-7c9518800241.png`.
- Tu Đạo MMO: `exec-f2eeee5f-0ad7-49f7-9ca9-7b16e044ae49.png`.
- Đọa Ma dao: `exec-d01dbf2c-9f87-4de7-91ac-7a4b7364c12e.png`.
- Đọa Ma MMO: `exec-cb9583aa-0a0d-4d0c-b1c3-7bb14985d3db.png`.

## Bàn giao

[assets.json](assets.json) ghi 4 source, kích thước/grid thứ tự cell, prompt/hash/input role/hash và 48 sản phẩm: cell rectangle, crop, alpha/export/bytes/hash. Từng sheet 4 cột × 3 hàng. Mỗi WebP 96×96, tổng **344.352 byte**.

- Sheet dao: nhân vật / ba lô / trang bị / tu luyện / công pháp / thuật pháp / pháp bảo / luyện chế / diện mạo / tọa kỵ / linh thú / bản đồ.
- Sheet MMO: nhiệm vụ / tổ đội / đạo hữu / tông môn / thư / trò chuyện / hoạt động / PvE / PvP / thành tựu / giao dịch / thiết lập.

`node scripts/build-dao-system-icons.mjs` đọc bốn master trong repo, kiểm alpha/grid, crop theo từng cell và alpha bounds với lề bàn giao, contain downsample đều rồi WebP. Không repaint, CSS tint hay dùng mặt nạ để xóa/đổi nguồn. Builder dùng Sharp trong bundled workspace runtime.

`node scripts/sync-dao-system-icons.mjs` kiểm hash rồi copy sản phẩm vào `client/public/assets/dao-system-hud-v1/`; assets pipeline đã có bước này. PNG master chỉ giữ trong docs, không tải vào game/review. Icon WebP theo theme có tên ID ổn định, resolver nhận ID hữu hạn từ Core index UI.

## Trạng thái

`ownerApproved=false`, `artApproved=false`, `runtimeIntegrated=false`: owner tạm chấp nhận kit Dao trước, 48 icon mới chờ đánh giá riêng. Map/frame/window/button dùng lại nguồn đã có; chưa character art hoặc ART môi trường mới. Hình danh tính là biểu tượng ngọc bài trừu tượng, không chân dung nhân vật đang WIP.

[175 cấu hình/421 assertion bản 03.2](../../../data/dao-system-hud-reading-verification.json) kiểm layout/tương tác; không suy duyệt hình từ test. Theo phản hồi owner, presentation hiện dùng nền mực xám ở thông tin nhân vật/nhiệm vụ và huy hiệu tròn nhỏ dưới icon; các cụm chức năng giữ bố cục mở. CSS `dao-system-hud-air-layout.css` và `dao-system-hud-reading-layout.css` không sửa ART hoặc manifest. [Bản ghi 03 ban đầu](../../../data/dao-system-hud-verification.json) giữ riêng. 24 entry là lối UI; catalog/gameplay/save không được thêm definition/skill/loot/quyền từ icon.
