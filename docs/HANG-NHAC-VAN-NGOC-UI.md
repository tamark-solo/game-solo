# Bộ UI Vân Ngọc trong view H5

**Tiếp nối sau chốt UI:** owner yêu cầu bổ sung [sprite animation cho luồng nhiệm vụ](HANG-NHAC-QUEST-MOTION.md): chào, vận khí, đòn thường và hồi phục. Đây là gói ART/presentation riêng của ngày 10/10; trạng thái chốt UI phía dưới giữ nguyên phạm vi chữ/khung/bố cục đã xử lý.

## Trạng thái chốt ngày 10/10/2026

**Đã xử lý các vấn đề UI được chủ dự án phản hồi trong đợt hiện tại.** Sau sửa khung/resize, owner xác nhận “nhìn ổn rồi”; sau sửa chữ/bố cục nhiệm vụ, owner xác nhận “tốt rồi” và yêu cầu cập nhật docs. Đây là xác nhận bản UI đang chạy trong `/hang-nhac.html`, theo phạm vi bên dưới.

| Vấn đề đã báo | Cách xử lý hiện hành | Trạng thái / bằng chứng |
| --- | --- | --- |
| View còn giống trang thử, chưa là màn game H5 | Game shell toàn viewport; chọn/tiếp tục hồ sơ bằng overlay; danh tính, nhiệm vụ, menu trong màn chơi | Đã xử lý — [game shell](HANG-NHAC-GAME-SHELL.md), hồi quy sáu viewport |
| UI thô sơ, chưa đồng nhất với HUD và thiếu chất tu tiên | Khung sen/mây/đồng/ngọc, nút ngọc, giấy lụa thủy mặc; mặt tối cho bảng phủ map, giấy sáng cho nội dung đọc | Đã ghép và owner phản hồi ổn — [artwork 02](design/ui/van-ngoc-kit-v2/README.md) |
| Nền giấy lệch/lộ khỏi khung khi đổi kích thước hoặc tỷ lệ màn hình | Nền và viền dùng chung box/góc co giãn; chín mask theo mép trong của asset; khung đứng yên khi cuộn nội dung | Đã xử lý — [bàn giao resize](HANG-NHAC-UI-FRAME-RESIZE.md), 28 cấu hình pixel, 0 pixel nền lộ ngoài khung |
| Chữ trong tab nhiệm vụ tràn, dồn và khó đọc | Tiêu đề có cột co được và tự xuống dòng; chi tiết chia Lời dẫn / Mục tiêu / Bước tiếp theo / Phần thưởng; checklist căn riêng marker và nội dung | Đã xử lý — [quy tắc vùng đọc](GAME-UI-READING.md), 5 bài × 18 cấu hình = 90 lượt kiểm chữ |
| Bảng hẹp ép chữ hoặc nội dung dài khó thao tác | Giữ chữ nội dung 15 px/giãn dòng 1,7; sổ một cột ở ≤980 px; cuộn trong cửa sổ, tiêu đề/nút đóng sticky, hành động tracker ngoài vùng cuộn | Đã xử lý và owner xác nhận tốt — [kiểm chứng chữ/bố cục](data/hang-nhac-ui-reading-verification.json) |
| Nút tracker bị co nhỏ trên màn 320 px | Chỉnh khoảng cách hàng nút và chiều cao vùng đọc; giữ vùng chạm tối thiểu 44 px và khoảng nhìn nhân vật | Đã xử lý — hồi quy game shell/HUD và sáu viewport trong bản ghi vùng đọc |
| Căn chỉnh riêng từng màn khó dùng xuyên suốt game | `ui-reading.css` sở hữu token chữ, xuống dòng, nhóm nội dung và lề an toàn; đã áp dụng sổ nhiệm vụ, NPC, thiết lập và tracker | Đã có hợp đồng tái sử dụng — màn tiếp theo dùng [cùng quy tắc](GAME-UI-READING.md) |

Kiểm chứng đợt sửa chữ: UI, resize, quests, game shell, HUD/layer, typecheck và build đều qua. Chữ đọc được thử ở 100%, 150%, 200% bằng token trên sáu chiều rộng 320–1366 px, gồm tiếng Việt dài và chuỗi không có khoảng trắng. [Bản ghi ngày 10/10](data/hang-nhac-ui-reading-verification.json) lưu phạm vi và nguồn bằng chứng; đây không phải kiểm mọi browser zoom hoặc mọi bản dịch tương lai.

Đợt này giữ HUD native đã duyệt, gameplay/server/save, camera/tỷ lệ nhân vật và dữ liệu map owner. Test dùng fixture riêng. Các verification/manifest sản xuất 01/02 giữ nguyên trạng thái tại thời điểm tạo; phản hồi owner ngày 10/10 được ghi riêng tại đây, không sửa ngược lịch sử hoặc suy duyệt từ test.

Phạm vi hoàn tất là UI cho các luồng đang có runtime. Hành trang, trang bị, chat, shop, bình cảnh, portal và HN05/ngoại vi còn theo kế hoạch gameplay; chúng không phải lỗi UI chưa sửa trong đợt này.

## Lịch sử triển khai và nguồn tham chiếu

**Chữ và vùng đọc 10/10:** [hợp đồng dùng chung](GAME-UI-READING.md) tách nhóm trong bài, xuống dòng tiêu đề, dành lề an toàn, giữ nút đóng khi cuộn. Đã áp dụng sổ nhiệm vụ, NPC, thiết lập và tracker; dùng token riêng cho vùng đọc, giữ geometry HUD gốc.

**Sửa resize:** [nền và viền dùng cùng vùng/mốc co giãn](HANG-NHAC-UI-FRAME-RESIZE.md), lấy mép trong của asset bằng chín mask SVG. Đã kiểm 28 cấu hình bằng pixel và kiểm lại vị trí khi cuộn dialog; giữ artwork nguồn.

**Bản 02 sau phản hồi mỹ thuật:** owner thấy bản 01 thô sơ và thiếu chất tu tiên. [Bộ artwork 02](design/ui/van-ngoc-kit-v2/README.md) thay viền phẳng bằng khung chạm bốn góc, nút ngọc và giấy lụa thủy mặc. Màn chọn dùng nền giấy sáng, các bảng trên map giữ mặt tối; vùng đọc được tăng cỡ chữ. Tại thời điểm ghép 09/10 chưa ghi nhận owner duyệt hình; phản hồi bản sau sửa ở mục trạng thái ngày 10/10 phía trên.

[Kiểm chứng bản 02](data/hang-nhac-van-ngoc-ui-v2-verification.json): UI/game-shell/HUD-layers/quests/reload, typecheck và build đã qua; ảnh QA đợi material decode trước khi chụp. Bản ghi 01 phía dưới giữ các hồi quy từ lần triển khai trước.

**09/10/2026.** Chủ dự án yêu cầu kiểm tra view game H5 mới và triển khai toàn bộ UI đồng bộ với HUD đang dùng. Bộ này ghép vào `/hang-nhac.html`, giữ game shell phủ cửa sổ. Phạm vi là các màn và thao tác có runtime: chọn/tiếp tục hồ sơ, danh tính, nhiệm vụ, chỉ đường, NPC, thổ nạp/hồi phục, luyện thuật, thiết lập, nạp/kết nối và phản hồi.

Bản ghi triển khai 09/10 bên dưới mô tả bản UI đưa ra để chủ dự án đánh giá hình. HUD gốc giữ trạng thái đã duyệt; crest/cửa sổ mới khi đó chưa ghi nhận duyệt mỹ thuật. Trạng thái phản hồi hiện tại xem mục ngày 10/10; test không nâng trạng thái ART.

## Màn đã ghép

| Màn/thành phần | Thay đổi |
| --- | --- |
| Chọn/tiếp tục nhân vật | Ba thẻ có nút thật, trạng thái đã chọn, sprite native lấy từ atlas hiện có; tên và hồ sơ riêng; sprite lớn chỉ dùng trong overlay chọn |
| Danh tính | Hình native nhỏ, tên, hành trình và trạng thái lưu; đổi nhân vật qua leave/save hiện có |
| Tracker | Khung đồng/ngọc, nhãn trạng thái, điều kiện còn thiếu và tổng đã đạt; điều kiện đã xong chuyển sang chi tiết sổ để giảm chữ |
| Dẫn tới NPC | Nhãn phân biệt xem đường khi xa và nói chuyện/xác nhận khi gần; giữ proximity, không tự di chuyển |
| Sổ nhiệm vụ | Một bài mở chi tiết tại một thời điểm, trạng thái thật HN01–HN04/HN05 chưa triển khai; bản đồ bên cạnh trên desktop; điểm đích có dấu chọn và giữ focus khi dựng lại |
| NPC/thổ nạp/luyện thuật/chuẩn bị | Khung tối + giấy sáng phẳng cho lời dẫn; nhóm hành động riêng, khóa khi chờ; giữ các lệnh/điều kiện hiện hành |
| Thiết lập | Nhóm hiển thị và hướng dẫn phím; Linh quang giữ callback cũ, giảm chuyển động UI, fullscreen tùy chọn và đổi nhân vật |
| Nạp/kết nối/feedback | Cùng màu/chữ/viền với bộ UI; nạp/lỗi asset vẫn có khung đầy cửa sổ trước JavaScript |
| Màn nhỏ | Các bảng nhỏ giữ phân vùng trái/phải, nội dung dialog cuộn, nút thao tác 44 px, hotbar fallback hiện có |

Không thêm hành trang, trang bị, chat, shop, đột phá, portal hoặc phần thưởng giả để lấp UI. Các hệ thống đó cần gameplay/đặc tả riêng trước khi nối vào màn chơi.

## Bộ quy tắc

Nguồn layout/token cơ sở: `client/src/van-ngoc-ui.css`; lớp artwork hiện hành: `client/src/van-ngoc-art.css`; chữ/vùng đọc dùng chung: `client/src/ui-reading.css`, nạp sau lớp artwork. Biến `--vn-*` sở hữu hình thức khung; `--ui-*` sở hữu chữ và khoảng cách đọc. `game-shell.css` tiếp tục sở hữu viewport và phase; `hotbar.*` tiếp tục sở hữu HUD native.

| Vai trò | Giá trị / hình thức |
| --- | --- |
| Đồng | `#BCA46A`, sáng `#E6CF95` |
| Ngọc | `#9CDAC8` |
| Nền | `#10272B`, chuyển sắc xanh tối và viền hai lớp tiết chế |
| Chữ | `#F3EAD4`, phụ `#B6C9BC` |
| Giấy đọc | `#F0E8D4`, chữ mực xanh đậm |
| Tiêu đề / nội dung | Cambria serif / Segoe UI sans; không đưa chữ vào raster |
| Nhấn chính | Nút đồng ấm; nút phụ xanh ngọc tối; outline focus ngọc sáng |
| Họa tiết | Crest sen/ngọc/mây ở màn chọn và đầu dialog; không dùng glow chạy liên tục ở mọi bảng |

HUD gốc vẫn 760 × 140, mười ô 36 px, HP trái/MP phải, ba skill cùng bảy chỗ chưa gán. Không kéo/cắt frame gốc để tạo cửa sổ. Các kiểu nút/`kbd` mới được giới hạn ở companion UI, không thay geometry/slot/cooldown của hotbar.

`VanNgocUI` chỉ trình bày sprite và gọi change handler của select hiện có. Nó không tạo phiên, chọn quyền skill, animation gameplay hoặc tài nguyên. Sprite preview dùng `stand_south` và metadata atlas đã nạp; không lấy ảnh portrait mới/chưa duyệt.

Giảm chuyển động chỉ là thiết lập trình bày, lưu tại `hang-nhac.ui.motion.v1`. Không ghi vào profile/save/map/draft. Thiết lập hệ điều hành luôn được tôn trọng. Tab ẩn/offline và FX lifecycle tiếp tục theo hotbar hiện có.

## Artwork và nguồn

[Gói artwork hiện hành 02](design/ui/van-ngoc-kit-v2/README.md) có ba nguồn ImageGen riêng cho khung, nút và giấy; tổng WebP **457.550 byte**, prompt/crop/hash đầy đủ. Khung/nút dùng nine-slice có hợp đồng trong metadata. [Nguồn crest 01](design/ui/van-ngoc-kit-v1/README.md) giữ làm lịch sử; không sửa tranh HUD đã duyệt.

Xuất 02 bằng `node scripts/build-van-ngoc-ui-v2.mjs`; script `build-van-ngoc-ui.mjs` giữ cho crest 01. Các lệnh xuất cần Sharp trong project hoặc runtime bundled. `npm run assets` chỉ copy WebP sản phẩm đã có qua `sync-skill-hud.mjs`, không gọi ImageGen hay cần Sharp để build game thường ngày.

## Kiểm chứng

`npm.cmd run test:hang-nhac-ui` dùng backend 2620, Vite 5220, cache Vite và SQLite fixture trong `artifacts/`. Không plugin ghi map editor; không dùng DB owner.

Kiểm các thẻ chọn thật, sprite pixel, accordion, focus điểm chỉ đường, không cast/đổi aim khi click UI, giảm chuyển động thủ công/hệ điều hành và qua reload, hội thoại riêng theo người, cùng sáu viewport: 1920 × 1080, 1366 × 768, 1024 × 768, 390 × 844, 320 × 568, 844 × 390. Đây là kiểm kỹ thuật, không thay đánh giá trải nghiệm người chơi.

Ảnh và báo cáo: [kết quả](../artifacts/van-ngoc-ui/verification.json), [chọn desktop](../artifacts/van-ngoc-ui/entry-desktop.png), [màn chơi](../artifacts/van-ngoc-ui/playing-1366.png), [hội thoại](../artifacts/van-ngoc-ui/npc-intro.png), [sổ nhiệm vụ](../artifacts/van-ngoc-ui/journal-active.png), [thổ nạp linh thể](../artifacts/van-ngoc-ui/cultivation-spirit.png), [thiết lập](../artifacts/van-ngoc-ui/settings-desktop.png), [chọn mobile](../artifacts/van-ngoc-ui/entry-mobile.png).

Hồi quy đi cùng thay đổi: game shell, quests, HUD/layer, R01, sect, lessons, reload và aim; thêm typecheck/unit/build. Tất cả dùng fixture riêng, không ghi vào authored map hoặc DB thật. Số liệu gameplay/baseline tiếp tục thuộc runtime hiện hành.

[Bản ghi nghiệm thu kỹ thuật 01](data/hang-nhac-van-ngoc-ui-verification.json): các bộ trên đã qua; 121 unit test không lỗi, build sản xuất thành công. Trạng thái ART trong bản ghi là tại thời điểm kiểm 01; phản hồi UI hiện tại được ghi riêng ở mục ngày 10/10.

## Ranh giới bàn giao

| Nguồn | Trách nhiệm |
| --- | --- |
| `client/hang-nhac.html` | Markup view H5 và các điều khiển thật, link CSS trước JavaScript |
| `client/src/van-ngoc-ui.css` | Bộ màu, khung, nút, chữ, trạng thái và responsive companion |
| `client/src/van-ngoc-art.css` | Viền vẽ nine-slice, nút ngọc, giấy lụa và phân cấp chữ của bản 02 |
| `client/src/ui-reading.css` | Token chữ, vùng đọc, nhóm nội dung, xuống dòng, lề an toàn và responsive sau sửa 10/10 |
| `client/src/frame-surface.ts` | Nền theo mask khung và vùng cuộn riêng trong dialog |
| `client/src/van-ngoc-ui.ts` | Thẻ nhân vật, sprite atlas và thiết lập motion UI |
| `client/src/quest-ui.ts` | Checklist/sổ đọc snapshot, accordion và trạng thái |
| `client/src/sect-ui.ts` | Ghép dialog/actions và bản đồ theo giao thức NPC hiện có |
| `scripts/build-van-ngoc-ui.mjs` | Xuất uniform WebP alpha từ nguồn đã sinh |
| `scripts/build-van-ngoc-ui-v2.mjs` | Xuất/crop có metadata cho ba asset bản 02 |
| `tests/smoke/hang-nhac-van-ngoc-ui-smoke.mjs` | Kiểm tương tác và ảnh theo fixture |

Owner có thể xem và chỉnh yêu cầu mỹ thuật trực tiếp trên bản đang chạy; không cần đổi backend, reset hồ sơ hoặc làm lại map để thử bộ UI này.
