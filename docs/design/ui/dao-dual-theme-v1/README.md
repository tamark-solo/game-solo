# Tu Đạo / Đọa Ma — bộ UI–HUD mới 01

**Phản hồi tiếp nối 11/10:** owner đã xem và **tạm chấp nhận** hai bộ, đồng thời muốn thêm ý tưởng cho hành trang/hệ thống nhân vật. [Thiết kế UI 02/reference](../../../CHARACTER-INVENTORY-UI-DESIGN.md) mở rộng ngay route này thành Linh Đài/Trữ Vật Nang/Diện Mạo. Các số 24 layout và trạng thái manifest bên dưới là hồ sơ đợt ART 01; đợt UX 02 có [60 cấu hình/55 kiểm riêng](../../../data/dao-character-ui-verification.json). Chấp nhận tạm thời không nâng cờ ART hoặc khóa mọi luật từ ảnh.

**11/10/2026 · Theo yêu cầu làm lại hoàn toàn của owner.** [Hướng hệ thống và mốc Hóa Thần](../../../DAO-UI-SYSTEM.md). Nguồn phong cách là [concept map Hằng Nhạc đã duyệt](../../world/hang-nhac-van-ngoc-concept-v1/README.md), không dùng khung HUD/UI cũ làm mẫu ART. Hai bộ được tạo mới bằng skill imagegen và **built-in image_gen**; bộ mới chưa suy owner/art approval từ test.

**[Xem hai bộ trên cùng map](http://127.0.0.1:5174/ui-material-review.html)**: chọn Tu Đạo hoặc Đọa Ma; đổi Sổ nhiệm vụ/Hành trang/Chỉ HUD; thử các trạng thái, Linh quang và Giảm chuyển động. HUD hiện hành chỉ là lựa chọn tham chiếu. Chuyển theme giữ nguyên tài nguyên và state đối chiếu.

## Nguồn đã lưu

| Thành phần | Tu Đạo · Thanh Ngọc | Đọa Ma · Huyền Nham |
| --- | --- | --- |
| HUD | [Nguồn](tu-dao/hud-source.png) · [WebP](tu-dao/hud.webp) · [Prompt](tu-dao/hud.prompt.txt) | [Nguồn](doa-ma/hud-source.png) · [WebP](doa-ma/hud.webp) · [Prompt](doa-ma/hud.prompt.txt) |
| Cửa sổ | [Nguồn](tu-dao/window-source.png) · [WebP](tu-dao/window.webp) · [Prompt](tu-dao/window.prompt.txt) | [Nguồn](doa-ma/window-source.png) · [WebP](doa-ma/window.webp) · [Prompt](doa-ma/window.prompt.txt) |
| Nút | [Nguồn](tu-dao/button-source.png) · [WebP](tu-dao/button.webp) · [Prompt](tu-dao/button.prompt.txt) | [Nguồn](doa-ma/button-source.png) · [WebP](doa-ma/button.webp) · [Prompt](doa-ma/button.prompt.txt) |
| Kiếm/Lôi/Phong | [Atlas nguồn](tu-dao/icons-source.png) · [Atlas WebP](tu-dao/icons.webp) · [Prompt](tu-dao/icons.prompt.txt) | [Atlas nguồn](doa-ma/icons-source.png) · [Atlas WebP](doa-ma/icons.webp) · [Prompt](doa-ma/icons.prompt.txt) |

[assets.json](assets.json) ghi cả **8 asset**: source/input/prompt/hash, kích thước/crop/slice, thứ tự cell atlas và vị trí lỗ HUD đã đo. Tổng WebP hai bộ **655.396 byte**; 18 SVG aperture riêng theo hai frame. Nền concept chỉ tải một bản, 860.598 byte. Dung lượng không đồng nghĩa ngân sách GPU đã đo cho mọi máy.

Các [guide SVG/PNG](guides/) chỉ là bố cục kỹ thuật cho ImageGen, không được dùng làm ART cuối. Bộ Tu Đạo dùng guide và map làm input; Đọa Ma lấy ART Tu Đạo mới làm edit target, thay vật liệu/đường khắc/vết ma khí trong cùng họ hình khối. Không lấy gold-jewelry frame cũ rồi chỉnh màu bằng mã.

PNG gốc giữ nguyên. `scripts/build-dao-dual-ui.mjs` crop bàn giao, thu mẫu đồng đều Lanczos3 và đổi WebP; không repaint/tint/mask/blur/sharpen ảnh nguồn. HUD xuất 1520 × 280 cho display 760 × 140; lỗ được đo từ alpha liên thông và adapter đọc `layout.json`. Frame trace lỗ trung tâm thành chín SVG cùng slice 22%; nút dùng slice 15%; atlas xuất 384 × 128, ba cell vuông theo thứ tự Kiếm/Lôi/Phong.

`scripts/sync-dao-dual-ui.mjs` kiểm hash sản phẩm/nền concept rồi copy vào public/assets/dao-dual-theme-v1; đã thêm vào pipeline assets. Build không đọc đầu ra ImageGen bên ngoài workspace và không nạp PNG master vào trang đối chiếu/game.

## Tách trình bày khỏi gameplay

State/DOM IDs ở `client/src/core/ui-material-review-state.ts`. Adapter `ui-material-review.ts` reuse `SkillHotbar` và `attachFrameSurface`, đọc quest/item thuần; `dao-dual-theme-review.css` chỉ scope trang đối chiếu. Không nối room/API/profile/localStorage, không cấp Hóa Thần/Đọa Ma, không đổi HP/MP tối đa/skill quyền/loadout. Dữ liệu vẫn là fixture HN01–HN03 và ba món nhập môn để so cách đọc trên cùng nội dung.

HUD mới dùng gauge khoảng 63 px theo lỗ thực của ảnh; vị trí desktop khác nhẹ HUD cũ nhưng hai theme mới khớp nhau. Dãy 10 ô/ba skill và phím vẫn cố định, không có hành động ở bảy ô chưa gán. Màn nhỏ giữ fallback ba nút 48 px. HP đỏ/MP ngọc–xanh lạnh; ma khí đỏ là điểm nhấn vật liệu, không biến mọi tài nguyên thành đỏ.

Giảm chuyển động giữ vật liệu tĩnh, ẩn flare/halo chuyển động; hidden/offline tiếp tục theo presenter hiện có. Frame backing không dùng hình chữ nhật tràn ra viền. Văn bản cuộn trong vùng đọc có min-width:0/word wrap, footer riêng. Nhân vật/portrait để sau khi owner hoàn thiện bản mới.

## Kiểm kỹ thuật và duyệt hình

Đã kiểm **24 bố cục** (2 theme × 3 màn × 4 viewport), 0 tràn ngang/0 lỗi vùng chữ/0 page error, bảy trạng thái HUD, chuyển theme không đổi HP/MP, chọn/lọc đồ, giảm chuyển động manual/OS và không request game. Typecheck/ranh giới + Vite build đạt; hồi quy HUD/layer hiện hành đạt 14 kiểm bằng fixture. [Biên bản](../../../data/dao-dual-ui-verification.json), ảnh trong artifacts/dao-dual-theme/.

ART mới ở trạng thái **prototype-pending-review**. Chưa tích hợp skin mới vào runtime hoặc thêm gameplay Hóa Thần/Đọa Ma. [Hợp đồng nối sau](../../../DAO-UI-SYSTEM.md) ghi ownership/schema/receipt/theme version; hai việc mỹ thuật và gameplay có nghiệm thu riêng.
