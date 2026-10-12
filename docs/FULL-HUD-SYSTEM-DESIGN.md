# Toàn bộ vùng HUD và hệ icon — thiết kế 03.2

**Đã được tiếp nối bằng thiết kế 04:** owner yêu cầu làm lại icon và nghiên cứu kỹ chức năng; [thiết kế lại HUD/chức năng tu tiên](XIANXIA-FUNCTION-UX-REDESIGN.md) nay là hướng hiện hành trên trang review: 38 lối trong bảy nhóm, glyph rõ ở cỡ nhỏ, tìm/ghim/liên kết hệ. Owner yêu cầu phát triển thông tin và luồng trước rồi bổ sung GDD. Tài liệu 03.2 dưới đây giữ quyết định và kiểm chứng của phiên bản cũ; 48 bitmap cùng nguồn/builder riêng đã dọn ngày 12/10/2026 theo yêu cầu làm nhẹ dự án. [Ghi chú dọn pack](design/ui/dao-system-hud-v1/README.md) chỉ cách truy vết; mô tả ART và kiểm chứng bên dưới là lịch sử.

**11/10/2026 · Ưu tiên trực tiếp của owner.** Sau bản tư vấn màn chơi, owner làm rõ phải **thiết kế toàn bộ vùng HUD của cả hệ thống trước**, hiện mới thấy thanh kỹ năng, chưa có icon ba lô/bản đồ và nhiều lối chức năng MMORPG. Đợt này làm bản tổng thể có ART icon và tương tác trên trang đối chiếu; tích hợp gameplay/shell vào game thực đi sau.

**[Xem trực tiếp](http://127.0.0.1:5174/ui-material-review.html)** — mặc định **HUD tổng thể**; icon **Ba lô / Nhân vật / Bản đồ / Nhiệm vụ** có lối mở trực tiếp. Bấm **Hệ thống / Tất cả** để xem đủ **24 icon** theo bốn nhóm. Đổi Tu Đạo/Đọa Ma để so cùng bố cục. Dropdown giữ Linh Đài, Trữ Vật Nang, Diện Mạo và sổ nhiệm vụ đã làm.

Đọc cùng [GDD](GDD.md), [hai đạo lộ](DAO-UI-SYSTEM.md), [UI nhân vật/hành trang](CHARACTER-INVENTORY-UI-DESIGN.md), [reference và tư vấn nền](MAIN-GAME-HUD-UX-DIRECTION.md), [Core](ARCHITECTURE.md) và [MMORPG xuyên chặng](MMORPG-PROGRESSION-PLAN.md).

## Điều chỉnh theo phản hồi owner — 03.2

Owner yêu cầu bỏ nền xanh và cách đóng khung mọi vùng; sau bản bố trí thoáng, owner làm rõ **thông tin nhân vật và nhiệm vụ vẫn cần nền**, còn icon đang chìm vào map. Bản hiện hành giữ nền mực xám cùng viền mỹ thuật ở hai vùng đọc này. Nhật ký dùng lớp tối chuyển dần trong suốt; cụm hoạt động, giao tiếp và chức năng nhân vật giữ bố cục mở.

Icon được phóng lớn, có nền huy hiệu tròn tối, viền vật liệu và bóng nhẹ; nhãn có nền tối nhỏ để đọc trên mái/tán cây. Không khôi phục các hộp xanh bao cả cụm chức năng. Bản đồ giữ hình tròn, dock nhân vật hai hàng; hai đạo lộ dùng cùng nguyên tắc tương phản. 24 lối mở và trạng thái HUD giữ nguyên.

Đã xem ảnh đối chiếu desktop/mobile và chạy lại **175 cấu hình / 96 route / 421 assertion**, không tràn chữ hoặc chồng các vùng HUD: [bản ghi 03.2](data/dao-system-hud-reading-verification.json). Đây vẫn là board thiết kế, chưa ghép vào viewport game thật.

## Phạm vi thiết kế

Đã thiết kế vị trí/vùng, phân nhóm, icon, nhãn, kích thước, tương tác mở/đóng/thu gọn và cách đọc ở desktop/mobile. Mọi chức năng trong danh mục có hình và có nơi đọc thiết kế; backend chưa triển khai không phải lý do bỏ chức năng khỏi **bản thiết kế tổng thể**.

Đây là **24 lối chức năng UI**, không 24 definition gameplay mới hoặc quyền đã mở cho hồ sơ nhập môn. Không cộng chúng vào 48 record của catalog nội dung. Các hệ tương lai vẫn cần scope/luật/snapshot khi tích hợp; bản mẫu không cấp quyền, loot, cảnh giới, tiền tệ, social hoặc vật phẩm.

## Các vùng trên màn

| Vùng | Bản tổng thể hiện có |
| --- | --- |
| **Trái trên · Nhân vật/tu đạo** | Icon ngọc bài danh tính, tên mẫu Vân Khách, nhập môn/M01, tu vi 180, lối Thổ nạp và nhãn đạo lộ; nhấn mở Linh Đài |
| **Giữa trên · Hoạt động** | Hoạt động, PvE, PvP, Thành tựu, Giao dịch, Thư; icon có nhãn và mở màn thiết kế tương ứng |
| **Phải trên · Bản đồ** | Khung khu vực, concept thu nhỏ, icon bản đồ, thiết lập và trạng thái mẫu; nhấn mở bản đồ lớn để đối chiếu ART |
| **Phải giữa · Nhiệm vụ** | HN03 từ định nghĩa thật, điều kiện còn thiếu, nút mở bản đồ/sổ; thu gọn/mở lại được |
| **Giữa · Mục tiêu/phản hồi** | Vùng target luyện mẫu, thiếu mục tiêu, đang thi triển/thiếu linh lực/offline; không dựng máu target giả |
| **Trái dưới · Nhật ký/MMO** | Nhật ký mẫu và cụm Tổ đội, Đạo hữu, Tông môn, Trò chuyện; thu gọn được |
| **Giữa dưới · Kỹ năng/tài nguyên** | Giữ HUD đã vẽ: 760×140 desktop, hai cầu, ba thuật/10 vị trí; bảy ô chưa gán không có hành động; mobile giữ ba nút 48 px |
| **Phải dưới · Nhân vật/vật phẩm** | Nhân vật, Ba lô, Trang bị, Tu luyện, Công pháp, Pháp bảo, Diện mạo, Tọa kỵ và lối Hệ thống |
| **Bảng Toàn bộ hệ thống** | 24 icon chia bốn nhóm, lọc nhóm; có nhãn phân biệt bản nhập môn và hệ tiếp nối đang thiết kế |

Đủ các vùng để đánh giá toàn hệ, không chỉ một thanh skill hoặc sơ đồ chữ. Nhân vật đang được owner làm lại nên không dựng/sửa avatar trong map. Icon danh tính là ngọc bài có biểu tượng người trừu tượng, không portrait nhân vật mới.

## 24 icon và lối mở

| Nhóm | Sáu chức năng |
| --- | --- |
| **Nhân vật · Tu đạo** | Nhân vật, Ba lô, Trang bị, Tu luyện, Công pháp, Thuật pháp |
| **Vật phẩm · Diện mạo** | Pháp bảo, Luyện chế, Diện mạo, Tọa kỵ/ngự khí, Linh thú, Bản đồ |
| **MMO · Giao tiếp** | Nhiệm vụ, Tổ đội, Đạo hữu, Tông môn, Thư, Trò chuyện |
| **Hoạt động · Hệ thống** | Hoạt động, PvE, PvP, Thành tựu/danh vị, Giao dịch, Thiết lập |

Ngự khí đi trong lối Tọa kỵ/ngự khí; danh vị trong Thành tựu/Diện Mạo. Không tự khóa cấu trúc gameplay hoặc đồng nhất tọa kỵ với cosmetic từ cách nhóm UI.

- Nhân vật/Trang bị → Tổng quan Linh Đài; Ba lô → Trữ Vật Nang.
- Tu luyện → Tu luyện; Pháp bảo → đối chiếu phôi/sau luyện hóa; Diện mạo/Tọa kỵ → nhóm tương ứng trong Diện Mạo.
- Nhiệm vụ → sổ thật về định nghĩa HN; Bản đồ → concept lớn, **chưa là bản đồ navigation**.
- Những lối khác → bảng thiết kế của từng hệ: mục đích, thông tin cần có, luồng thao tác dự kiến. Thuật pháp còn có số liệu ba R01 từ nguồn hiện hành.

Các icon không phải nút chỉ trang trí. Bản mẫu mở nơi xem đúng nội dung, nhưng không giả việc gửi thư/đánh PvP/nhận loot/gọi tọa kỵ đã vận hành. Chưa làm lệnh gameplay mới trong đợt thiết kế.

## ART Tu Đạo / Đọa Ma

**[Nguồn/prompt/manifest](design/ui/dao-system-hud-v1/README.md).** Tạo bằng skill imagegen và built-in `image_gen`: hai sheet Tu Đạo mới (12 icon/sheet) cùng hai sheet Đọa Ma chỉnh vật liệu từ target Tu Đạo. Tổng **4 source PNG / 48 WebP**, WebP **344.352 byte**, mỗi icon 96×96; icon chức năng trên HUD hiện trình bày 33–46 px và lớn hơn khi đọc thiết kế. PNG master không đưa vào trang. Điều chỉnh 03.2 chỉ sửa presentation CSS, không sửa bitmap nguồn.

Ngọc, vải, đồng cổ/mây theo frame/map mới; Đọa Ma đổi thành huyền nham, vải tro, huyết đồng/vết ma khí, giữ nhận diện của từng biểu tượng. Không dùng CSS filter đỏ trên bộ Tu Đạo. Icon ba lô là túi trữ vật, bản đồ là cuộn sơn thủy, tu luyện là sen tụ khí, công pháp là cổ thư, pháp bảo là ngọc khí, luyện chế là đỉnh đồng, tọa kỵ là hạc, linh thú là hồ ly.

Frame/backing reuse pack Dao 01 và matching chín mask aperture; khung nhỏ dùng cùng slice/hole với kích thước viền phù hợp. Không thay nguồn frame/window/button/HUD đã tạm chấp nhận. HP/MP vẫn giữ nghĩa màu; chuyển theme không reset tài nguyên, cooldown, item hoặc các vùng thu gọn.

ART mới **chờ owner đánh giá**. Test/crop/build không tự nâng `ownerApproved/artApproved`. Phản hồi tạm chấp nhận hai bộ trước ghi riêng, không tự là duyệt 48 icon mới.

## Resize và thao tác

- Desktop rộng: hoạt động trên giữa, map/tracker bên phải, hai cụm bên cạnh HUD phía dưới.
- Chiều rộng trung gian: hoạt động thành cụm trái và dock nhân vật nâng lên; đã tăng khoảng dọc của board review để tracker và dock không đè nhau. Preview board có chiều cao riêng; không tuyên bố đã tích hợp viewport full-screen H5 của game thật.
- Mobile: giữ Nhân vật/Ba lô/Nhiệm vụ/Bản đồ/Tất cả thành hàng mở nhanh; giữ hoạt động và giao tiếp để đánh giá toàn hệ. 24 chức năng vẫn đủ trong bảng Hệ thống. Các nút chính tối thiểu 44 px; skill 48 px.
- C/I/J/M mở các màn mẫu, Esc đóng/quay lại. Không nhận phím khi nhập liệu hoặc dùng Ctrl/Alt/Meta. Đóng bằng nút trả focus về lối đang hiện đúng desktop/mobile, không trả vào dock bị ẩn.
- Khi cửa sổ mở, HUD phía sau `inert` và skill không cast từ click/phím. Cooldown mẫu tiếp tục tính thời gian; mở cửa sổ không reset state hoặc coi là pause thế giới MMO.
- Tracker/nhật ký giữ trạng thái gọn khi đổi theme. Reduced motion manual/OS vẫn theo presenter hiện hành.

## Core và pipeline

- `client/src/core/dao-hud-system.ts`: index UI hữu hạn, 24 ID, category/icon cell/status, thông tin và action brief; không item definition, unlock hoặc policy combat.
- `core/ui-material-review-state.ts`: state/DOM ID, màn hiện tại, feature/nhóm và gọn tracker/log; một nguồn state fixture.
- `ui/dao-system-hud-review.ts/.css`: renderer HUD/index/map/brief, chỉ đọc Core và shared quest/skill. CSS scope `.material-review`; không import vào game shell.
- `ui/dao-system-hud-air-layout.css`: bố cục thoáng, minimap tròn và dock hai hàng; `ui/dao-system-hud-reading-layout.css` nạp sau để đặt nền đọc nhân vật/nhiệm vụ, nền huy hiệu và các khoảng tránh chồng vùng trên màn hẹp.
- `ui-material-review.ts`: ghép sự kiện, route và focus/theme; reuse `SkillHotbar`, `attachFrameSurface`. Skill snapshot/callback và ART lớp trang trí giữ vai trò cũ.
- `scripts/build-dao-system-icons.mjs`: kiểm grid/alpha, crop từng cell và uniform contain downsample 96px/WebP. Không repaint/mask/tint/blur/sharpen nguồn.
- `scripts/sync-dao-system-icons.mjs`: kiểm hash 48 sản phẩm rồi copy public; đã nối assets pipeline. Đợt này chỉ sync icon pack/direct Vite build, không regenerate asset map/nhân vật đang WIP.

Không fetch gameplay API, room/SQLite hoặc browser storage. Không sửa character sprite/portrait, runtime skin, owner map/9 blocker/bậc thang/navigation/camera. Layout/status/route tương lai khi ghép game phải lấy entitlement/activity/snapshot thật, không tin ID icon hoặc dropdown preview để mở gameplay.

## Kiểm chứng đợt 03

**175 cấu hình trình bày / 96 lượt mở chức năng / 421 assertion browser**:

- 2 theme × 9 viewport × HUD/Hệ thống/Bản đồ; thêm mở 24 chức năng ở rộng/hẹp, gọn tracker/log và bảy trạng thái HUD.
- Viewport: 320×740, 390×844, 760×760, 844×390, 980×780, 1100×800, 1280×900, 1366×1000, 1600×1000.
- Không tràn ngang/vùng chữ, không chồng các vùng HUD hoặc ra khỏi board; đủ 24 entry/6 entry mỗi nhóm; icon ba lô/bản đồ mở đúng màn.
- Trạng thái mẫu không được cấp tài nguyên khi mở chức năng, focus trở lại đúng dock, overlay không cast, cast trên HUD vẫn hoạt động, bảy ô trống vẫn không có hành động.
- Không lỗi browser/asset, không gameplay API/WebSocket; Vite HMR loại riêng. Storage context sạch không bị ghi.

[Bản ghi ban đầu 03](data/dao-system-hud-verification.json); [bản hiện hành 03.2](data/dao-system-hud-reading-verification.json) chạy lại cùng phạm vi, không lỗi browser/asset hoặc yêu cầu gameplay. Hồi quy UI nhân vật/hành trang 60 cấu hình/55 kiểm và HUD/layer runtime fixture đã qua ở đợt 03; typecheck/boundary và Vite build bản hiện hành qua. Đây là kiểm thiết kế/presentation, không nghiệm thu backend MMO, ART approval hoặc chứng minh usability với người chơi.

**Bước sau:** owner đánh giá hình và cách nhóm/vị trí của bộ tổng thể; tiếp tục thiết kế hình cửa sổ/hệ còn thiếu theo cùng index rồi nối từng hệ vào gameplay hiện có. Kế hoạch shell/gameplay trong tài liệu tư vấn trước được đặt sau việc thiết kế toàn bộ HUD này.
