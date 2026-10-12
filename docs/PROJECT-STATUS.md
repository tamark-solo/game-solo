# Trạng thái hiện hành của _MMO

**Ghép UI/HUD mới · 12/10:** `/hang-nhac.html` đã dùng [Thanh Ngọc, HUD 04 và Nhân vật 04](HANG-NHAC-DAO-UI-RUNTIME.md), đọc snapshot server và giữ luồng đăng nhập. Có menu 38 lối/tìm/ghim, minimap hiện hành và Hành trang/Trang bị live; hệ chưa làm hiện “Chưa mở”. Đọa Ma chưa kích hoạt gameplay, không thay dữ liệu duyệt ART, map, balance hoặc save. Các đoạn dưới ghi trạng thái lịch sử lúc bản mới còn ở review.

**Dọn asset và thống nhất hồi phục · 12/10:** đã dọn payload cũ/từ chối thuộc nhân vật, UI và VFX, tổng 211.156.226 byte (~201,4 MiB), có [biên bản đường dẫn/hash](ASSET-CLEANUP-2026-10-12.md). Giữ asset đã duyệt, nguồn hiện hành cần cho runtime và thư viện nhân vật owner đã yêu cầu giữ; không suy duyệt ART còn chờ. [Hồi phục](HANG-NHAC-CHARACTER-RUNTIME.md) qua NPC/Hành trang dùng chung luật server: 1 vật tư/+30 HP/tối đa 100/cooldown 10 giây, chặn suốt bài HN03/HN04 và khoảng thi triển/nghỉ thuật. Không đổi map, DB thật hoặc save/receipt.

**Chốt ART khí tức và giữ thư viện nhân vật · 12/10:** owner chốt cả Luân Sinh Tử, Kiếm Vực Huyền Ngọc và Huyết Nguyệt Ma Vực. [Quyết định duyệt đúng hash](design/vfx/hoa-than-aura-concepts-v4/approval.json) đánh dấu concept mỹ thuật đã duyệt, chưa animation production. [Thư viện tùy biến](design/characters/character-customization-library-v1/README.md) giữ năm áo, ba khí, bộ nhân vật/nguồn/prompt và ZIP sáu gói thử cũ. Catalog quản trị có 56 record (thêm 8 diện mạo chưa phát hành). Tạo nhân vật tùy biến/lưu appearance chưa triển khai; áo nhập môn là nguồn màn tạo, Hóa Thần/Đọa Ma theo tiến trình và quyền server.

**Ý tưởng khí tức 04 · 12/10 — snapshot trước khi owner chốt:** owner làm rõ 03 vẫn chìm và cần tìm thêm ý tưởng. [Nghiên cứu chính thức JX3/Riot](HUA-THAN-AURA-RESEARCH-V4.md) đưa ra Luân Sinh Tử/kim–chàm, Kiếm Vực/lam trắng và Huyết Nguyệt/đỏ đen. [Ba source ImageGen](design/vfx/hoa-than-aura-concepts-v4/README.md) là plate concept tĩnh 128 × 176/neo (64,152), ghép riêng với nguyên chibi; card/menu xem 1×/2×, thoát về nhịp03, không chồng hai hiệu ứng. [5 viewport/35 layout/158 kiểm](data/hoa-than-aura-concepts-v4-verification.json), typecheck/build/pixel/hash qua. Chờ lựa chọn hình; chưa layer/atlas/motion production hoặc game/DB/map/GDD.

**Khí tức trải nghiệm 03 · 12/10:** owner thấy 02 tạm ổn nhưng trải nghiệm chưa tốt. [Bản thử giữ/thả](CHARACTER-AURA-EXPERIENCE-V3.md) dùng timeline Core cho tụ/bộc phát/lắng, giảm rear thường trực, hạt ellipse trơn và phân front/back. Chuột/cảm ứng/Space/Enter local review, capture/blur/đổi mẫu/tắt motion hủy tụ; PNG người/FX 02 nguyên. Ba unit test và [6 viewport/48 bố cục/1470 kiểm](data/wang-lin-hoa-than-experience-v3-verification.json) qua. Chờ owner phản hồi ưu tiên/trải nghiệm; chưa gameplay/âm thanh/đi/cast/8 hướng hoặc game/map/DB.

**Hóa Thần 02 · 12/10:** theo phản hồi owner, [Sinh Tử sáng hơn và khí tức theo layer](design/characters/wang-lin-hoa-than-review-v2/README.md) đã sửa vùng vải, giữ 0 thay đổi phần người; Huyền Tử giữ áo. Bốn texture alpha rear/front mới, ground giữ nguồn 01, hạt crop từ source; motion pulse/flow/drift/orbit độc lập người, toggle hai chiều và pause hidden/offline/offscreen/reduced motion. [Quy ước ghép VFX cho tám hướng](CHARACTER-AURA-LAYERS.md) tách khỏi atlas người/skill Core. [6 viewport/48 bố cục/1428 kiểm](data/wang-lin-hoa-than-review-v2-verification.json), pixel/source/prompt/public/dist, typecheck/build qua. Chờ đánh giá ART/motion; chỉ pose Nam, chưa người tám hướng hoặc game/DB/map/GDD/catalog.

**ART Hóa Thần 01 · 12/10:** owner yêu cầu triển khai hình để so sánh. [Sinh Tử/Tu Đạo và Huyền Tử/Đọa Ma](design/characters/wang-lin-hoa-than-review-v1/README.md) giữ nguyên chibi gốc, mỗi áo đổi 471 pixel vải và 0 pixel phần khóa. Hai vòng khí ART tĩnh 96 × 32/pivot (48,16) tách rời, bật/tắt cùng gallery/map; giữ ba áo nhập môn/mẫu xám. [6 viewport/48 bố cục/1368 kiểm](data/wang-lin-hoa-than-review-v1-verification.json), source/prompt/native/public/dist, typecheck/build qua. Chưa owner ART approval; một pose Nam, chưa animation/đổi avatar/chuyển đạo hoặc GDD/catalog/save/map/DB.

**Ba áo Vương Lâm và dọn asset · 12/10:** owner xác nhận giữ người gốc đúng, yêu cầu thêm trang phục và dọn bộ thử cũ. [Gói 02](design/characters/wang-lin-costume-review-v2/README.md) có Vân Ngọc/ngà-ngọc, Huyền Vân/xanh mực, Xích Tiêu/đỏ trầm, ba lượt ImageGen riêng, cùng native gốc 45 × 80/frame 64 × 96/neo (32,88). Gallery có ba áo + mẫu gốc, chọn ↔ map 1×; 0 pixel phần khóa đổi cho cả ba. [Biên bản dọn](data/character-study-cleanup-2026-10-12.json): sáu gói cũ khỏi source/public/dist, bảy builder bỏ; ZIP 72 file đã kiểm entry hash, chỉ giữ README lịch sử. [Sáu viewport/36 bố cục/1026 kiểm](data/wang-lin-costume-review-v2-verification.json), typecheck/build/source-public-dist qua. Giữ người đã được xác nhận; từng áo mới chưa owner ART approval, chỉ pose Nam, chưa animation/đổi avatar hay map/DB/GDD/catalog.

**Icon thuật đồng bộ · 11/10:** taskbar trên review dùng cùng atlas Kiếm/Lôi/Phong với Tổng quan và reader Thuật của Nhân vật, giữ khung hai theme. [68 kiểm nguồn/crop/theme/hành vi](data/dao-skill-icon-sync-verification.json), typecheck và HUD/layer fixture qua. Phạm vi presentation review, chưa thay HUD game thật.

**Nhân vật 04 · 11/10:** làm lại theo phản hồi owner: [thân phận, nền tu luyện/mục tiêu và bộ đang vận dụng](CHARACTER-SHEET-UX-V4.md). Có ấn tầng, ngưỡng tích lũy từ shared, bài học tiếp theo, reader từng thuật và quay lại đúng tab/focus từ nhiệm vụ. Tu Đạo/Đọa Ma đồng cấu trúc; ART nhân vật vẫn chờ owner. [Kiểm 189 cấu hình, 226 assertion điều hướng, 13 kiểm projection](data/dao-character-v4-verification.json) và hồi quy đồ 03/HUD qua. Prototype chưa nối skin game hoặc sửa GDD/save/map.

**Linh Đài 03 · 11/10:** owner đồng ý hoàn thiện cụm Nhân vật–Hành trang–Trang bị sau HUD 04. [UX mới](CHARACTER-INVENTORY-UX-V3.md) nối chọn vị trí/món → nguồn/công dụng → so sánh → mang/tháo → thay đổi; hành trang có vị trí/sắp xếp và trạng thái chờ/từ chối/offline/rỗng. Mẫu dùng inventory nhập môn và một nguồn vật tư, giữ nền 100/100; đã kiểm 108 assertion workflow. UI mới nằm trên review, chưa ghi hồ sơ/gameplay thật; hình nhân vật chờ bản owner, GDD giữ riêng.

**Kiểm Linh Đài 03:** [171 cấu hình/chữ + 48 tình huống + 108 kiểm luồng](data/dao-character-v3-verification.json) qua; hồi quy HUD 249 cấu hình/152 route/587 assertion, HUD/layer fixture và typecheck/build qua. Không suy ART approval hoặc nghiệm thu native viewport từ board review.

**HUD/chức năng thiết kế lại 04 · 11/10:** owner yêu cầu nghiên cứu MMORPG tu tiên và làm lại vì icon khó đọc, ghép chức năng khó dùng; đồng thời bổ sung thiết kế trước khi phát triển GDD. [Bản mới](XIANXIA-FUNCTION-UX-REDESIGN.md) có bốn nguồn chính thức, 38 lối trong bảy nhóm, glyph SVG gốc, tìm không dấu, ghim năm lối desktop, liên kết bước tiếp và quay lại menu. Có trang so icon mới/cũ ở 24/32/40px. Thông tin 14 lối bổ sung là đề xuất, không gameplay/catalog/save mới; GDD và runtime/map/DB/nhân vật giữ nguyên. [Kiểm chứng bản 04](data/dao-system-hud-v4-verification.json).

**Kiểm thiết kế 04:** 249 cấu hình/152 route/587 assertion browser, 96 kiểm tìm–ghim–liên kết–focus/phím và 8 cấu hình ghim tên dài qua; hồi quy nhân vật/hành trang, HUD/layer fixture, typecheck/build qua. Kiểm kỹ thuật không xác nhận ART approval hoặc usability với người chơi.

**HUD toàn hệ thống 03.2 · 11/10:** [Bản tổng thể](FULL-HUD-SYSTEM-DESIGN.md) trên `/ui-material-review.html` có 24 lối vào, 48 icon trên hai theme, map/identity/tracker/target/journal và các dock. Theo phản hồi mới nhất, giữ nền mực xám cho thông tin nhân vật/nhiệm vụ, bỏ hộp xanh bao cụm chức năng và tăng icon với nền huy hiệu tròn/nhãn dễ đọc. [175 cấu hình/96 route/421 assertion](data/dao-system-hud-reading-verification.json) bản hiện hành qua; chưa tích hợp game, ART icon chờ xem. Không thay Core gameplay, catalog content, DB, nhân vật hoặc owner map.

**UI nhân vật/hành trang 02 · 11/10:** sau phản hồi tạm chấp nhận Tu Đạo/Đọa Ma, đã nghiên cứu bốn nguồn chính thức FFXIV/GW2 và phát triển [Linh Đài/Trữ Vật Nang/Diện Mạo](CHARACTER-INVENTORY-UI-DESIGN.md). Trang đối chiếu có tìm/lọc, so sánh/bảo vệ mẫu, mobile danh sách→chi tiết, Tu luyện/Pháp bảo và thử chất liệu; 60 layout/55 kiểm qua, typecheck/build qua. Fixture riêng, không gameplay API/storage/DB/map; hình nhân vật chờ bản owner, skin game chưa thay.

**Tên game 10/10:** owner chốt **Vân Hải Đạo Đồ**; đã cập nhật tên hiển thị, logo hai dòng và câu dẫn “Đạo chưa có đường. Ta tự mở.” [Chi tiết nhận diện](GAME-TITLE-SCREEN.md). Ý tưởng ân oán/nghịch thiên đang ở bước thiết kế.

**Rà soát:** 09/10/2026, bổ sung trạng thái UI 10/10/2026 và kế hoạch MMORPG 11/10/2026 · **Mốc code nền:** `83be946` + thay đổi local chưa commit · **Runtime:** 0.12.0 · **GDD:** 0.32. Tài liệu này mô tả trạng thái quan sát trong checkout; phiên bản GDD, phiên bản runtime và phiên bản pack ART là ba thông tin riêng.

**Kế hoạch xuyên chặng 11/10:** owner làm rõ sức mạnh/farm đồ/build, PvE/PvP và khoe nhân vật qua tọa kỵ/thời trang/pháp bảo là mục tiêu MMORPG. Đã có [ma trận hành trình](MMORPG-PROGRESSION-PLAN.md) và [contract Core](MMORPG-SYSTEM-CONTRACTS.md); roadmap 0.5/backlog GD20–GD21 nối RM5-A/B/C và VP4-A để kiểm sớm sau nền RM2 đủ. Đồng bộ hướng online/MMORPG còn ghi entry cũ. Đây là đợt tài liệu: chưa thêm loot/damage peer/farm/PvP/appearance/mount, chưa đổi balance/ART, không chạy test gameplay hoặc ghi map/DB thật.

**Phân loại/catalog 11/10:** theo câu hỏi về kiểm soát nội dung/backend/gameplay, đã có [taxonomy](GAME-CONTENT-TAXONOMY.md), [quy trình/Core](GAME-CONTENT-CONTROL-PLAN.md) và [sổ tham chiếu](design/systems/content-registry-v1/README.md): 48 record/45 quan hệ có kiểu, giữ ID và nguồn số liệu cũ. Kiểm schema tham chiếu/đường dẫn/ID/ref và đối chiếu subset nguồn; [bằng chứng](data/game-content-catalog-verification.json). Chưa loader/compiler/definition schema runtime mới, content admin editor hoặc gameplay/ART mới; không đọc/ghi DB thật hay authored map để kiểm.

**Registry đã triển khai sau xác nhận 11/10:** [catalog quản trị v1](GAME-CONTENT-CATALOG-RUNTIME.md) có schema/validator, reader qua Core port, API role admin chỉ đọc và tab Catalog. 48 records/45 refs được kiểm, 12 tham chiếu có code local, 36 chưa triển khai; lọc tên/ID/chặng/domain/subtype/status, inspect source/use và báo lỗi/repair. Unit/API/browser fixture và hồi quy entry đã đạt. Gameplay definitions/compiler/publish/CRUD còn tiếp, không thêm đồ/cast/PvP/map hoặc đổi balance từ index.

**Entry 10/10 đã triển khai:** đăng ký/đăng nhập → chọn server → tạo/chọn nhân vật → vào game, theo lựa chọn tên tài khoản + mật khẩu và một trong ba mẫu. Tài khoản mới rỗng; tạo hồ sơ chủ động, scope realm/character, vé chơi/lease SQLite, quản trị và audit. [Backend/Core/debug](GAME-ENTRY-BACKEND.md), [reference/roadmap](GAME-ENTRY-SYSTEM-DESIGN.md) và [verification](data/game-entry-verification.json). Ba lô tổng quát, tài khoản recovery và hạ tầng MMO nhiều máy còn tiếp tục; save khách giữ riêng.

**Concept map 11/10 theo yêu cầu owner:** [Hằng Nhạc · Ngoại viện trên biển mây](design/world/hang-nhac-van-ngoc-concept-v1/README.md) đề xuất thay phong cách bằng cùng đá ngọc/đồng cổ/tùng/linh vụ của nền Tiên môn. Đã tạo concept tổng qua built-in ImageGen, lưu source/prompt/hash và trang đối chiếu bộ ba. Nguồn 1536 × 1024 chưa là ART native world 3072 × 2048; cần đánh giá, vẽ khu/căn ghép và kiểm footprint trước thay nền. Chưa sửa runtime, map owner, blocker/bậc thang hoặc DB.

**Phản hồi owner sau xem concept:** “tôi đồng ý, nhìn khá tốt”. Đã ghi nhận duyệt hướng mỹ thuật concept tổng và lấy làm mẫu cho các khu chi tiết. Xác nhận này không tự duyệt ART sản xuất/native, đăng ký footprint hoặc navigation/tích hợp mới.

**UI/HUD đối chiếu 11/10:** owner đồng ý tinh chỉnh vật liệu/khung/linh quang theo concept và yêu cầu bắt đầu. Đã có [Vân Ngọc · Cổ đồng](design/ui/van-ngoc-co-dong-v1/README.md) ở `/ui-material-review.html`: 3 ART ImageGen có nguồn/hash/prompt, khung/aperture cùng chín slice, HUD native, sổ nhiệm vụ và hành trang dùng dữ liệu fixture/định nghĩa hiện có; so cũ/mới và trạng thái. 12 bố cục/typecheck/build/hồi quy HUD-layer đạt. ART mới chờ owner đánh giá; skin game, nhân vật, map/DB không đổi. Đối chiếu nhân vật để sau theo yêu cầu owner đang làm lại.

**Tiếp nối mới nhất:** owner nhận xét Cổ đồng chưa đồng nhất map/style, yêu cầu vẽ lại hai bộ và UI đổi khi có Đọa Ma từ Hóa Thần. Đã làm [Tu Đạo/Đọa Ma](design/ui/dao-dual-theme-v1/README.md): 8 ART ImageGen từ guide mới/map, 18 aperture SVG, vị trí lỗ HUD được đo, icon atlas riêng, token vùng đọc sáng/tối và preview chuyển bộ không đổi state. 24 bố cục/typecheck/build/hồi quy HUD-layer đạt. [Contract](DAO-UI-SYSTEM.md) giữ quyền kích hoạt ở backend; chưa gameplay/cảnh giới/migration Đọa Ma hoặc tích hợp skin runtime. Nguồn/prompt/hash/approval mới độc lập, nhân vật tiếp tục chờ bản của owner.

## Nguồn quyết định và cách đọc tài liệu

**Ưu tiên thiết kế 10/10:** owner đồng ý chốt hệ thống nhân vật/nhiệm vụ trước HN05. Đã có bản cơ sở [nhân vật 0.1](CHARACTER-SYSTEM.md), [nhiệm vụ 0.1](QUEST-SYSTEM.md) và [lộ trình RM0–RM6](DEVELOPMENT-ROADMAP.md). Đây là đầu ra tài liệu RM0, chưa chốt mọi quyết định D01–D06 và chưa triển khai quest engine/HN05. Không chạy kiểm runtime mới trong đợt biên tập này.

**Nghiên cứu nội dung 10/10:** đã đọc GDD/roadmap và các hồ sơ hệ thống/truyện, đối chiếu nguồn chính thức của năm game tu tiên và một số đoạn Tiên Nghịch. [Báo cáo nguồn/giới hạn](XIANXIA-GAME-RESEARCH.md), [bản sắc/trục truyện ứng viên](VAN-HAI-CREATIVE-DIRECTION.md), [ma trận nội dung và ND1–ND6](RPG-CONTENT-PLAN.md) đã có bản 0.1. Roadmap 0.2 bổ sung D09–D12; ý tưởng/cốt truyện mới chưa được duyệt hoặc triển khai. Chưa chơi thử game tham khảo, chưa chạy lại gameplay; đợt này chỉ sửa tài liệu.

**Chi tiết chương/catalog 10/10:** theo yêu cầu bắt đầu bước kế tiếp, đã có [chương Hằng Nhạc phương án A](HANG-NHAC-CHAPTER-PLAN.md) và [catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md). ND1–ND3 có bản chi tiết; ND4–ND6 mới có bài/contract mẫu, một lựa chọn và storyboard giấy. Roadmap 0.3 cập nhật đầu ra; chưa chốt D01–D06, thoại/cân bằng/ART hoặc code HN05. Đợt này chỉ kiểm logic tài liệu, không chạy gameplay hay thay dữ liệu.

**Nghiên cứu/lộ trình vật phẩm đợt 2:** bổ sung [3 game và sổ khảo sát 12 trang chương Tiên Nghịch](TIEN-NGHICH-CRAFTING-REFERENCES.md), phân biệt đoạn đọc được với nội dung thiếu. [Thiết kế luyện chế](ITEM-CRAFTING-DESIGN.md) có 8 định nghĩa/5 recipe hậu HN12 và EX01–EX04; [kế hoạch sản xuất VP0–VP4](ITEM-PRODUCTION-PLAN.md) chia IT01–IT12/asset/gate. [Manifest](design/systems/items-v1/plan.json) chỉ để kiểm kế hoạch, không được runtime đọc. Roadmap 0.4/backlog GD19 nối các gói vào RM; chưa tạo ART, đổi balance HN, code crafting/map/UI hoặc ghi save thật.

**Màn đầu 10/10:** [Tiên môn trên biển mây](GAME-TITLE-SCREEN.md) đã nối trước entry, có Bắt đầu/Tiếp tục, Thiết lập/tiên lộ và về màn đầu từ game. Nền UI riêng dùng cho title/login/server/nhân vật; Hằng Nhạc chỉ hiện sau khi vào. ART mới giữ trạng thái chờ owner xem, không suy duyệt từ test.

1. Chỉ dẫn mới nhất của người phát triển và [AGENTS](../AGENTS.md) xác định phạm vi công việc.
2. [GDD](GDD.md) xác định hướng sản phẩm đã chốt. Các hồ sơ Hằng Nhạc/Ngưng Khí bổ sung đề xuất chi tiết; bảng số liệu chưa được duyệt không trở thành luật chỉ vì đã có file.
3. Code/manifest hiện tại xác định chức năng đã triển khai và asset được nạp. Bản thử kỹ thuật không thay quyết định sản phẩm.
4. Hồ sơ duyệt ART xác định mức chấp nhận hình ảnh của đúng phiên bản; test kỹ thuật không tự cấp duyệt mỹ thuật.
5. Tài liệu có nhãn lịch sử, prompt, source metadata và verification giữ thông tin tại thời điểm tạo. Không tự lấy số liệu hoặc hướng cũ làm luật hiện hành.

Nếu có mâu thuẫn, sửa mô tả hoặc ghi rõ snapshot; không tự quyết định cân bằng, khôi phục asset cũ hay xác nhận một feature đã hoàn thành. [Mục lục](README.md) phân nhóm tài liệu đang dùng và hồ sơ lịch sử.

## Hướng sản phẩm đã chốt

- MMORPG web với combat chủ động, khám phá/nhiệm vụ và idle hỗ trợ.
- Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển đều chọn được từ đầu; nhập môn Hằng Nhạc qua Ngưng Khí, phân hóa từ Trúc Cơ.
- Cả ba có Kiếm Khí, Lôi Ấn và Ngự Phong Bộ R01 ngay khi bắt đầu điều khiển; tutorial hướng dẫn vận dụng, không khóa quyền skill sau nhiệm vụ.
- Chủ dự án chốt chia cảnh 08/10: concept Hằng Nhạc là khu môn phái; ngoại vi farm dùng map riêng có đường quay về, khảo nghiệm dùng phiên riêng. Đã chọn tỷ lệ vật thể/nhân vật ở nền 2×, người/camera 1×; kích thước world và loot/spawn/chia sẻ farm chưa khóa.
- Tư Đồ Nam là linh thể đang hồi phục khả năng hiện diện/thi triển, không phải phàm nhân mất kiến thức để tu lại. Mở đầu chung là chuyển thể game, tách lịch sử nguyên tác.
- Khung tu tiên gồm cảnh giới, công pháp, thuật pháp, pháp bảo, lĩnh ngộ và hành trình cá nhân. Server đã sở hữu tiến trình/tài nguyên/kết quả của các luồng triển khai; giữ authority này khi mở rộng.

HN01–HN04 đã có runtime; HN05–HN12, phân bổ toàn bộ 15 tầng/mốc 1–3–9–15 và cân bằng mới còn cần đánh giá. Slot/đổi nhân vật local đã có chính sách entry; kho chung/chuyển realm/scale chưa có. Lát A/B/C có thứ tự ở roadmap, chưa là nghiệm thu đã hoàn tất. Kết thúc tầng 1/tầng 3, chu kỳ 10 giây và offline 8 giờ từ thiết kế cũ không là luật mới.

## Những gì đã triển khai

| Phần | Đã có | Giới hạn thực tế |
| --- | --- | --- |
| Preview TypeScript + Three.js | Loader, atlas/animation, renderer, camera, input và di chuyển/va chạm fixture | Chưa là vòng gameplay MMO |
| [Nhân vật/hành trang nhập môn](HANG-NHAC-CHARACTER-RUNTIME.md) | C/I sau entry thật, snapshot riêng; hai món nhập môn, vật tư thật, equip/tháo/bảo vệ/dùng và ledger SQLite | Chưa ba lô tổng quát/loot/kho chung/bonus/cường hóa/đổi sprite. HP/MP tối đa giữ 100 |
| [Prototype nhân vật Linh Đài 02](CHARACTER-UI-PREVIEW.md) | Tổng quan/Hành trang/Trang bị có fixture, shrine/vận khí riêng từng nhân vật, đạo lộ/pháp bảo và 12 icon painterly; 42 cấu hình bố cục/chữ đã kiểm. Owner xác nhận phần nhìn “nhìn ổn rồi đó” 10/10 | Trang riêng `/character-ui.html` giữ để review; số liệu, 12 món và bonus mẫu không áp dụng trong runtime |
| [UI Hằng Nhạc H5 / Vân Ngọc](HANG-NHAC-VAN-NGOC-UI.md#trạng-thái-chốt-ngày-10102026) | Game shell, chọn/tiếp tục hồ sơ, tracker/sổ/chỉ đường, NPC, thiết lập; mỹ thuật đồng bộ HUD, sửa nền/khung resize và chữ/tab nhiệm vụ. Owner xác nhận tốt 10/10 | Phạm vi các luồng runtime hiện có; màn tiếp theo tái sử dụng [quy tắc vùng đọc](GAME-UI-READING.md). Shop/chat/bình cảnh chưa triển khai |
| [Animation/khí quang nhiệm vụ](HANG-NHAC-QUEST-MOTION.md) | 21 clip / 84 frame chào, vận khí, chưởng thường bốn hướng và hồi phục; 4 clip / 16 frame trận pháp/khí lưu/hồi phục/vệt chưởng đã ghép từ facts server | Owner xác nhận animation hoạt động và yêu cầu FX; ART mới tiếp tục xem chuyển động, không đổi damage/timer/credit/save/map |
| Catalog nhân vật | 5 bộ chibi/100 frame, thêm Vương Lâm trước 36 frame: 6 bộ/136 frame; bộ ba chibi có 60 frame | Chọn nhân vật ART không là tạo hồ sơ playable online; combat/động tác riêng chưa đủ |
| [Backend entry/Colyseus](GAME-ENTRY-BACKEND.md) | Account/session/realm/character, scrypt, vé một lần, lease bền, admin/audit/status; room dùng grant + persistence port, giữ R01/NPC/HN01–HN04/tu luyện/ledger | Lease kiểm hai tiến trình cùng host/SQLite; chưa distributed presence/driver/DB nhiều máy hoặc tải MMO đo được. Giới hạn 20 client/phòng chưa là công suất đo |
| Level Design / Map Editor | Nhiều level/layer, vùng đi/chặn/portal, chọn nhiều/nhóm/căn chỉnh, tileset/brush, prefab, multipart, minimap, audit, save và export | Save là dữ liệu biên tập; API workspace có trong Vite dev/preview, không có khi chỉ phục vụ dist tĩnh. Release Hằng Nhạc đã nối client/server từ export đã chốt |
| Starter region cũ | Prototype di chuyển/portal/điểm nội dung từ trước GDD mới | Chưa có nhiệm vụ/combat; không thay bố cục Hằng Nhạc hiện hành |

Các tag `story_npc`/`player_template` của catalog preview là nhãn kỹ thuật lịch sử; quyền chọn bộ ba của game theo GDD. Không thay enum code chỉ để đổi thuật ngữ tài liệu.

## Map và ART

Reset `1a3e80b` xóa bộ map legacy; thư viện editor vẫn có `assets: []`. ART Hằng Nhạc từng được thêm tại `4546217` và merge tại `83be946`. Theo yêu cầu mới nhất ngày 08/10/2026, đã xóa ART v1/v2/v3 và hai bản thử vùng đi: **203 file, gồm 121 PNG**. [Biên bản riêng](data/hang-nhac-art-removal-2026-10-08.json) ghi danh sách/hash, [trạng thái reset](MAP-ASSETS-RESET.md) ghi phạm vi và bước tiếp theo. Không khôi phục bộ đã xóa từ lịch sử commit hoặc kế hoạch cũ.

| Bộ | Trạng thái |
| --- | --- |
| ART Hằng Nhạc v1/v2/v3 | Đã xóa nền, nguồn/prompt, metadata và trang duyệt theo yêu cầu; chưa có bộ thay thế |
| Bản thử vùng đi v1/v2 | Đã xóa toàn bộ nguồn/lớp/trang thử và dữ liệu vùng đi local |
| [Hằng Nhạc đã lưu](design/world/hang-nhac-map-v1/README.md) | Nền C access-v5-clean-v1 3072 × 2048/scale 1, 9 blocker owner, Spawn (1616,992); runtime và hồ sơ/R01 đã tích hợp, camera 1×. Đã ghép scene 22 object/32 part/10 cover theo [HUD/layer](HANG-NHAC-HUD-LAYERS.md); chưa portal. |
| Concept, ba asset thử và nền sạch trước map mới | Đã xóa 105 file/166.784.897 byte theo [biên bản](data/hang-nhac-review-reset-2026-10-08.json); không tái sử dụng nguồn hoặc builder |
| [Roster chibi](CHIBI-ROSTER-SPEC.md) | Vương Lâm làm chuẩn; Lý Mộ Uyển native-v5 chấp nhận cho bản thử. Tư Đồ Nam chibi/hai avatar còn chờ đánh giá; duyệt identity tĩnh trước đó là mốc khác |
| [VFX bàn giao](design/vfx/STARTER-VFX-HANDOFF.md) | 15 skill/646 PNG RGBA rời/76 atlas đã bàn giao. R01 giữ 10 FX gốc, thêm 36 clip thi triển bộ ba/bốn hướng; R02–R05 runtime, SFX/icon và crowd benchmark chưa có |
| [Core cast mới](design/characters/core-cast-v1/README.md) | 33 clip/264 frame mới, giữ ba chuỗi Vương Lâm Đông/36 frame gốc: 36 binding/300 frame cast. ART mới chờ đánh giá hình; PNG/source/prompt/metadata và provenance giữ trong workspace |
| Portrait/UI trước | Giữ nguồn/phiên bản lịch sử; cần đánh giá và đồng bộ nhận diện chibi trước sử dụng |

Actor locomotion giữ frame **64 × 96**, neo **(32,88)** và collider chân 8 px. [Skill core](SKILL-CORE.md) gắn pose thi triển riêng lên cùng actor/điểm chân trong cast, cao 96 px, rộng đủ tay/áo, body tối đa 80 px. Ba chuỗi Vương Lâm Đông gốc đã nối đúng nhân vật; Tư Đồ Nam/Lý Mộ Uyển dùng ART riêng. Presentation lấy server timestamp/hold, không quyết định damage hoặc chi phí. Tải atlas theo avatar, có trace và lỗi binding/asset để debug.

Đã sửa vùng hiển thị của 108 frame mới lấy lẫn mảnh pose bên cạnh từ sheet. Crop/cutout theo từng frame dùng chung cho thân/bóng Phong và preview, giữ bitmap và hợp đồng tỷ lệ/nhịp. Hồi quy GPU kiểm đúng 300 frame, vùng trong suốt, pool/đổi clip và trở về locomotion; xem [biên bản](data/hang-nhac-skill-crop-verification.json).

## Ưu tiên và phần còn thiếu

**HUD 09/10:** làm [HUD desktop](DESKTOP-SKILL-HUD.md) trước, mobile sau. Owner đã cung cấp mẫu khung liền/cầu tài nguyên/dãy thuật và duyệt bản 03 Vân Ngọc theo Type 2: khung đồng/ngọc/mây 760 × 140 px, 10 ô 36 px (ba R01 + bảy chưa gán), sinh lực/linh lực trên nền/nhân vật 1×. HUD đã ghép game qua SkillSession/snapshot server theo yêu cầu owner; nguồn/prompt giữ riêng. Demo `/skill-bar-desktop.html` và ảnh 01/02 giữ làm tham chiếu/lịch sử.

[Khí quang 02](design/ui/desktop-skill-hud-v3/qi-v2/README.md) làm rõ khác biệt sau phản hồi FX đầu quá nhẹ: texture khí xoáy đỏ/ngọc ImageGen 50 KB, kính/thể tích, vòng trận pháp và ánh hắt khung. Có đối chiếu bật/tắt; FX tách khỏi skill core, đã ghép game và điều khiển trong thiết lập.

**UI 10/10:** đã xử lý các vấn đề được báo đến đợt này: view còn giống trang thử, UI thô/thiếu chất tu tiên, nền giấy lộ khỏi khung khi resize, chữ tab nhiệm vụ tràn/dồn và nút tracker bị co trên màn hẹp. Owner xác nhận “nhìn ổn rồi” rồi “tốt rồi”. [Bảng trạng thái chi tiết](HANG-NHAC-VAN-NGOC-UI.md#trạng-thái-chốt-ngày-10102026) và [kiểm chứng vùng đọc](data/hang-nhac-ui-reading-verification.json) ghi 90 lượt kiểm chữ, 28 cấu hình khung, hồi quy UI/quests/game shell/HUD, typecheck và build. Quy tắc chữ/bố cục đã dùng chung cho nhiệm vụ, NPC và thiết lập; bản ghi approval/verification lịch sử không bị sửa ngược.

Ưu tiên hiện tại: bước 1 map, [bước 2 hồ sơ/lưu/R01](HANG-NHAC-R01-RUNTIME.md) và [phần đầu bước 3 NPC/HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử. [HN03–HN04](HANG-NHAC-LESSONS-RUNTIME.md) đã có bài thuật/né an toàn và đòn thường, credit/thưởng một lần theo server. [HUD/layer](HANG-NHAC-HUD-LAYERS.md) đã tích hợp. Trước tiếp nối HN05, ưu tiên **RM0 chốt nhân vật/nhiệm vụ và hợp đồng UI**, rồi RM1 bổ sung nền tối thiểu tương thích. RM2 mới nối HN05/ngoại vi/encounter/M02; không mở portal khi chưa có đích/lifecycle. Không sửa vùng chặn đã chốt hoặc làm lại entry/hành trang hiện có.

Đã có hồ sơ khách riêng, save/reload/restart, R01/mục tiêu luyện không thưởng và mở đầu HN01–HN02. Nhật ký chỉ đường tới bốn NPC dùng mẫu đệ tử sẵn có; vận khí và phần thưởng do server xác nhận. Tích lũy nền tách MP, 120/phút online, dừng tại cổng 360; chưa tính offline, chưa mở M02/nền 4–9. HN03/HN04 đã nối journal/NPC, đòn thường F/0 MP, Kiếm/Lôi và né bằng đi bộ/Phong; mỗi bài +80 baseline chỉ sau xác nhận, giữ tiến trình schema 2. Đăng nhập sản xuất, HN05–HN12, combat farm, pháp khí và khảo nghiệm chưa hoàn tất. Số liệu vẫn baseline thử.

Phục hồi kết nối 09/10 đã sửa lỗi lưu reconnection token cũ và thêm phục hồi cùng hồ sơ khi backend restart. [Hồi quy riêng](data/hang-nhac-reload-interaction-verification.json) kiểm E/nút nói chuyện sau reload/reconnect/restart, quyền R01 có sẵn và Rời sân hủy phục hồi. Map owner và tiến trình thật không được seed/reset trong kiểm chứng.

Hướng thi triển 09/10 đã nối WASD/mũi tên/mobile với hướng Kiếm/Phong, giữ hướng khi dừng, cho phép chạm map ngắm riêng. Lôi quay về mục tiêu đã chọn trên server; pose/VFX dùng hướng cast được xác nhận. Cast chờ input tick liên quan để tránh tự hủy khi nhấn di chuyển và skill cùng frame, có giới hạn/hết hạn và xóa khi drop/leave. Quy tắc/trace và [kiểm chứng](data/hang-nhac-skill-aim-verification.json) nằm trong [skill core](SKILL-CORE.md); giữ ART/native/map và luật chi phí/hit hiện hành.

## Kiểm chứng

**Nhân vật/hành trang 10/10:** owner chuyển ưu tiên sang triển khai UI Linh Đài đã chấp nhận, chọn đồ nhập môn/vật tư thật và giữ HP/MP. [Phạm vi runtime](HANG-NHAC-CHARACTER-RUNTIME.md) và [biên bản riêng](data/hang-nhac-character-verification.json) ghi server/save, kiểm riêng hồ sơ, rollback lỗi lưu và lifecycle; không dùng đồ/bonus fixture của prototype để mở kinh tế game.

[Hướng thi triển 09/10](data/hang-nhac-skill-aim-verification.json) đã qua 92 unit test, build/typecheck, input barrier/receipt/cancel, điều khiển bộ ba/bốn hướng trên browser, 36 tổ hợp pose, R01 online/browser và E/NPC sau reload/reconnect/restart. Fixture R01 hai người dùng viewport 720 × 720 và bật timer tab nền để tránh software WebGL làm mất heartbeat; camera/native vẫn 1×.

[Runbook](PREVIEW-RUNBOOK.md) chứa lệnh hiện có. [Biên bản skill core](data/hang-nhac-skill-core-verification.json) ghi đợt 09/10: 84 unit test, đối chiếu với player/controller VFX gốc, 10 clip kiểm pixel WebGL, 36 tổ hợp animation/browser, build/typecheck và hồi quy. Một kiểm hash release lịch sử không qua do text checkout CRLF và PIPELINE đã cập nhật; atlas/hold/socket gốc được kiểm nguyên vẹn riêng. [Biên bản môn phái](data/hang-nhac-sect-verification.json) giữ 69 unit test tại thời điểm, [bước 2](data/hang-nhac-r01-verification.json) giữ 59 unit test; [bước 1](data/hang-nhac-runtime-verification.json) giữ kiểm trước đó gồm Editor/Level Design. Kết quả kỹ thuật không chứng minh duyệt ART mới hoặc công suất MMO.
