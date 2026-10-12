# Vân Ngọc · Cổ đồng — đối chiếu UI/HUD 01

**Đã thay hướng sau phản hồi 11/10:** owner nhận xét bộ này chưa đồng nhất map/style và yêu cầu vẽ lại hai bộ Tu Đạo/Đọa Ma. [Bộ mới và nguồn](../dao-dual-theme-v1/README.md), [hợp đồng Hóa Thần/Đọa Ma](../../../DAO-UI-SYSTEM.md). Route `/ui-material-review.html` hiện dùng bộ mới; hồ sơ Cổ đồng bên dưới là lịch sử chưa được duyệt.

**11/10/2026:** owner đồng ý hướng tinh chỉnh UI–HUD để cùng [concept Hằng Nhạc đã duyệt](../../world/hang-nhac-van-ngoc-concept-v1/README.md). Đã dựng bản đối chiếu chạy được: **HUD + sổ nhiệm vụ + hành trang**. Các asset mới đang chờ đánh giá hình; đồng ý hướng thiết kế không tự duyệt từng asset.

[Mở bản đối chiếu](http://127.0.0.1:5174/ui-material-review.html). Đổi Chất liệu để so **Cổ đồng / Vân Ngọc hiện tại** trên cùng nền và dữ liệu. Chọn Sổ nhiệm vụ, Hành trang hoặc Chỉ HUD; thử bảy trạng thái HUD, Linh quang, Giảm chuyển động, phím 1/2/3, chọn nhiệm vụ và lọc/xem vật phẩm.

## Mỹ thuật và tương tác

- HUD giữ khung desktop **760 × 140**, hai cầu **67 px**, **10 ô 36 px**, ba thuật R01 và bảy ô không có hành động. Bỏ các cụm sen lớn ở frame mới, dùng mây/ngọc gọn hơn; lòng ô tối, màu HP đỏ/MP ngọc giữ nghĩa cũ.
- Khung cửa sổ có rail mảnh và góc nhỏ; vùng đọc dùng nền mực xanh và giấy ngà, Cambria cho tiêu đề/Segoe UI cho nội dung. Tabs nhiệm vụ giữ grid có phần chữ co được, mô tả/điều kiện cuộn trong vùng riêng, footer và nút đóng tách nội dung.
- Linh quang giữ vật liệu kính/khí trong cầu. Skin mới giảm ánh hắt nền, bỏ sweep/glint ở khung; nhịp thi triển/hồi thuật vẫn dùng presenter có sẵn. Giảm chuyển động giữ vật liệu tĩnh và ẩn flare/halo chuyển động; hệ điều hành reduced motion được tôn trọng.
- Khung và lớp nền dùng **cùng chín slice**. SVG aperture chỉ mô tả vùng trong suốt liên thông ở giữa; resize không dùng một hình chữ nhật làm lớp nền phủ ra ngoài góc khung.
- Màn nhỏ dùng fallback HUD hiện hành: ba nút **48 px**, không thu nhỏ artwork desktop để nhét mười ô. Companion controls giữ tối thiểu 44 px.

## Phạm vi dữ liệu

Trang đối chiếu không gọi API, không kết nối room, không dùng account/session và không ghi profile/DB/localStorage/map/draft. State fixture riêng ở Core; dữ liệu nhiệm vụ đọc `sectQuests` với HN01–02 hoàn tất, HN03 đang làm, HN04 chưa mở, HN05 chưa triển khai. Đồ đọc `CHARACTER_ITEMS`: mộc kiếm, áo vải và 2 vật tư hồi phục. Không thêm recipe, ngọc/pháp bảo/loot, bonus HP/MP hoặc sức chứa ba lô từ tranh UI.

Phần hình nhân vật không được dùng trong trang này theo yêu cầu owner đang làm lại nhân vật. Các avatar/frame/atlas không sửa; đối chiếu chân dung/tỷ lệ/độ tương phản sẽ thực hiện với bản mới của owner. Nền concept chỉ làm bối cảnh UI, không chứng minh camera/map native hoặc navigation đã tích hợp.

## Nguồn và xuất

Tất cả ART mới tạo bằng skill imagegen và **built-in image_gen**, không dùng CLI/API fallback:

| Asset | PNG nguyên bản | Prompt | Sản phẩm |
| --- | --- | --- | --- |
| HUD | [hud-source.png](hud-source.png), 2171 × 724 | [hud.prompt.txt](hud.prompt.txt) | [hud.webp](hud.webp), 1520 × 280 / 149.416 byte |
| Khung cửa sổ | [window-source.png](window-source.png), 1254 × 1254 | [window.prompt.txt](window.prompt.txt) | [window.webp](window.webp), 1024 × 978 / 168.948 byte |
| Nút ngọc | [button-source.png](button-source.png), 2170 × 725 | [button.prompt.txt](button.prompt.txt) | [button.webp](button.webp), 900 × 166 / 60.602 byte |

[assets.json](assets.json) giữ input/role/hash, crop thực, kích thước, slice và trạng thái duyệt. Tổng ba WebP **378.966 byte**; dùng lại icon/texture cầu/giấy/item có sẵn. Nền concept riêng 860.598 byte. [frame-aperture.json](frame-aperture.json) giữ nguồn/hash/threshold và chín SVG slice của lớp nền.

`node scripts/build-van-ngoc-co-dong.mjs` kiểm PNG/kích thước/alpha, crop phần bàn giao, thu mẫu đồng đều Lanczos3 và đổi WebP; không repaint/recolor/mask/blur/sharpen hoặc scale từng part. Crop HUD giữ y159/height400 để dùng cùng vị trí cầu/tray; builder kiểm vùng lõi ba lỗ. Frame/nút crop bounds alpha>1 + 4 px an toàn, bỏ speck alpha≤1 ngoài phần bàn giao. PNG gốc giữ nguyên. Builder tiếp tục xuất aperture vector qua `build-co-dong-aperture.mjs`.

`node scripts/sync-van-ngoc-co-dong.mjs` kiểm hash asset/aperture/nền concept rồi copy sản phẩm vào **public/assets/van-ngoc-co-dong-v1**; đã thêm vào pipeline assets. Build chỉ dùng nguồn trong workspace, không đọc nơi mặc định ImageGen bên ngoài. Đầu vào preview nằm trong Vite build.

## Core và debug

- `client/src/core/ui-material-review-state.ts`: state fixture và DOM IDs.
- `client/src/ui-material-review.ts`: adapter đối chiếu; reuse `SkillHotbar`/`attachFrameSurface`, đọc định nghĩa thuần; không import transport hoặc quyền gameplay.
- `client/src/ui-material-review.css`: skin và layout chỉ scope `.material-review`; không nạp vào game.
- `client/ui-material-review.html`: route riêng. Hook DEV `__materialReview()` chỉ báo trạng thái đối chiếu, không cấp quyền hoặc lưu.

## Kiểm và trạng thái

Đã xem screenshot desktop/mobile; kiểm **12 bố cục** (ba màn × bốn viewport), không tràn ngang/vùng chữ; native HUD, ba skill/bảy ô trống, dữ liệu item, bảy trạng thái, giảm chuyển động và không có request game. Typecheck/ranh giới và Vite build đạt; hồi quy `test:hang-nhac-hud-layers` đạt 14 kiểm với DB/map/public fixture. [Biên bản](../../../data/ui-material-review-verification.json).

Đây là **bản đối chiếu hoàn chỉnh, chưa thay skin runtime**. HUD/companion UI đã duyệt trước đây tiếp tục phục vụ game. Sau đánh giá hình sẽ áp dụng token/asset cho các presenter thực, giữ hợp đồng Core, vùng đọc và frame backing, rồi chạy hồi quy UI/HUD/character/quest/lifecycle phù hợp. Không suy duyệt ART mới từ kiểm kỹ thuật.
