# Vân Hải Đạo Đồ · game-solo

**ART quái/tinh anh13/10:** [11bộ motion Pixel01](docs/design/characters/van-hai-monster-animation-v1/README.md) có440clip/2640pose,5action ×8hướng, [VFX tách layer](docs/design/vfx/van-hai-monster-vfx-v1/README.md)9sequence/54pose +2prop. [Trang playback](docs/design/characters/van-hai-monster-animation-v1/index.html) dùng clock Core và fixture trúng/hụt/hủy; motion/VFX mới chờ duyệt hình, chưa thay actor hoặc AI đang chơi.

**Tên game chốt ngày 10/10/2026:** Vân Hải Đạo Đồ. Logo màn đầu dùng hai dòng **VÂN HẢI / ĐẠO ĐỒ**, câu dẫn **“Đạo chưa có đường. Ta tự mở.”** Xem [màn mở đầu](docs/GAME-TITLE-SCREEN.md). Đây là đổi nhận diện; các ý tưởng ân oán/nghịch thiên đang ở bước thiết kế.

Game web theo hướng **MMORPG tu tiên có combat chủ động và idle hỗ trợ**, dành cho một người phát triển. Thiết kế hiện hành cho chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu**, cùng trải qua **Hằng Nhạc — Ngưng Khí**, rồi phân hóa từ **Trúc Cơ**. Mở đầu chung là chuyển thể gameplay, không phải lịch sử ba người cùng nhập môn trong nguyên tác.

**Cập nhật tài liệu: 11/10/2026 · runtime 0.12.0.** Đọc [trạng thái dự án](docs/PROJECT-STATUS.md), [mục lục tài liệu](docs/README.md) và [GDD 0.32](docs/GDD.md) trước khi tiếp tục công việc.

**Vòng MMORPG xuyên chặng:** [kế hoạch tu tiên–sức mạnh–farm–PvE/PvP–hiện diện](docs/MMORPG-PROGRESSION-PLAN.md) nối Ngưng Khí tới Hóa Thần với nguồn đồ/build, hoạt động và thời trang/tọa kỵ/pháp bảo. [Contract Core/backend](docs/MMORPG-SYSTEM-CONTRACTS.md) có gate loot/duel/appearance/migration/scale. Đây là kế hoạch, chưa thêm gameplay hoặc ART.

**Kiểm soát nội dung:** [phân loại](docs/GAME-CONTENT-TAXONOMY.md), [catalog/Core](docs/GAME-CONTENT-CONTROL-PLAN.md) và [sổ 48 record](docs/design/systems/content-registry-v1/README.md) tách định nghĩa/sở hữu/gameplay đang chạy, trỏ về code/thiết kế có trạng thái. [Registry quản trị v1](docs/GAME-CONTENT-CATALOG-RUNTIME.md) đã có schema/validator/API/filter/inspect; sổ JSON không cấp luật gameplay hoặc balance mới.

**Entry đã triển khai:** [đăng ký/đăng nhập → server → tạo/chọn nhân vật → vào game](docs/GAME-ENTRY-BACKEND.md), tên tài khoản + mật khẩu và ba mẫu nhân vật. Tài khoản mới bắt đầu rỗng; tạo hồ sơ chủ động. Có [quản trị](http://127.0.0.1:5173/admin.html), audit và trạng thái backend; hành trang nhập môn dùng sau khi vào game. Hạ tầng nhiều máy và ba lô tổng quát còn tiếp tục.

**Phiên duyệt mới đang mở:** [Game 5174](http://127.0.0.1:5174/hang-nhac.html), [Quản trị 5174](http://127.0.0.1:5174/admin.html), backend 2568. Cặp 5173/2567 đang giữ tiến trình cũ; hướng dẫn khởi động mặc định bên dưới áp dụng sau khi người vận hành mở lại dev server. [Chi tiết DB backup và phiên duyệt](docs/GAME-ENTRY-BACKEND.md).

## Trạng thái hiện tại

[Màn đầu Tiên môn](docs/GAME-TITLE-SCREEN.md) đã có cảnh mở đầu riêng, Bắt đầu/Tiếp tục, Thiết lập, giới thiệu tiên lộ và trở về màn đầu từ game. Luồng thường bắt đầu ở title rồi mới tới đăng nhập/server/nhân vật. ART mới chờ owner xem; Hằng Nhạc/HUD giữ hợp đồng hiện có.

| Phần | Hiện trạng |
| --- | --- |
| Client | TypeScript + Three.js; Hằng Nhạc có game shell toàn viewport, chọn/tiếp tục hồ sơ và HUD trong map; preview/editor giữ riêng |
| UI Hằng Nhạc | [Bộ Vân Ngọc](docs/HANG-NHAC-VAN-NGOC-UI.md#trạng-thái-chốt-ngày-10102026) đã xử lý các phản hồi UI hiện tại: mỹ thuật đồng bộ HUD, nền/khung khi resize và chữ trong nhiệm vụ; owner xác nhận tốt ngày 10/10. [Quy tắc vùng đọc](docs/GAME-UI-READING.md) dùng lại cho màn tiếp theo |
| Nhân vật / hành trang | [Linh Đài nhập môn](docs/HANG-NHAC-CHARACTER-RUNTIME.md): C/I sau entry thật; đồ nhập môn/vật tư hiện có, trang bị/tháo/bảo vệ/dùng và ledger SQLite. Ba lô tổng quát/kho/loot còn tiếp tục |
| Animation nhiệm vụ | [Gói bổ sung](docs/HANG-NHAC-QUEST-MOTION.md): chào, vận khí đứng/linh thể, F đủ bốn hướng và hồi phục cho bộ ba; 21 clip / 84 frame, thêm 4 clip / 16 frame khí quang/trận pháp/hồi phục/vệt chưởng; đã ghép, ART mới chờ owner xem |
| Nhân vật trong preview | 5 bộ chibi / 100 frame, thêm Vương Lâm bộ trước 36 frame để đối chiếu: 6 bộ / 136 frame |
| Backend | Node.js + Colyseus; application/port/persistence/HTTP/security/observability theo Core, account/realm/character SQLite, scrypt, vé chơi/lease, admin/audit/status. Gameplay do server xử lý; reload/reconnect/restart |
| Level Design / Map Editor | Nhiều level/layer, vùng đi/chặn/portal, tileset/brush, nhóm, prefab, multipart, minimap, audit và xuất runtime JSON |
| Map Hằng Nhạc | [Layer/HUD đã tích hợp](docs/HANG-NHAC-HUD-LAYERS.md): 22 object / 32 part / 10 mái-tán, y-sort và alpha fade; giữ 9 blocker, Spawn và camera 1× |
| Thư viện editor | Manifest mặc định vẫn trống; [package layer Hằng Nhạc](docs/design/world/hang-nhac-layered-v1/README.md) dành cho runtime, không ghi đè authored map hoặc nháp Editor |
| VFX / animation skill | 15 skill đã bàn giao; R01 có 10 FX gốc và 36 clip thi triển bộ ba/bốn hướng; [core tách gameplay/presentation/asset/UI](docs/SKILL-CORE.md), ART mới chờ đánh giá hình |
| Gameplay MMO | Ba hồ sơ riêng/lưu, R01 luyện thử, NPC/HN01–HN04, nhật ký/chỉ đường, thổ nạp online và bài luyện an toàn đã chạy; HN05–HN12/farm/khảo nghiệm/đăng nhập sản xuất còn tiếp tục |

Room `hang_nhac` nhận đúng hồ sơ do tài khoản tạo/chọn trên server; lưu vị trí/linh lực/cooldown và luyện thử Kiếm Khí/Lôi Ấn/Ngự Phong Bộ bằng phím 1/2/3. [Hợp đồng bước 2](docs/HANG-NHAC-R01-RUNTIME.md) giữ baseline gameplay. Client/server giữ cùng release/vùng chặn owner. Hồ sơ khách và `sect_courtyard` giữ cho hồi quy DEV; production tắt khách, không tự chuyển save khách sang tài khoản mới.

[Tương tác môn phái](docs/HANG-NHAC-SECT-RUNTIME.md): nhấn **E** gần NPC, theo Nhật ký để làm HN01–HN02, xác nhận M01 rồi chọn thổ nạp/hồi phục nền. [HN03–HN04](docs/HANG-NHAC-LESSONS-RUNTIME.md) tại người coi luyện thuật: F/đòn thường 0 MP, 1 Kiếm/2 Lôi trúng mục tiêu của bài; sau đó né báo trước bằng đi bộ và 3 Phong, mỗi bài +80 một lần khi xác nhận. Tu vi tách khỏi MP, thưởng nhập môn một lần/hồ sơ; chưa tính offline hoặc mở ngưỡng sau nền 1–3.

[Game shell H5](docs/HANG-NHAC-GAME-SHELL.md): `/hang-nhac.html` là màn game toàn viewport, không còn trang giấy/header/footer. Chọn nhân vật là overlay; **Escape** mở menu/Linh quang/fullscreen, đổi nhân vật quay về màn chọn và giữ bản lưu. Map/camera native và HUD Vân Ngọc giữ nguyên.

[Nhiệm vụ trong HUD](docs/HANG-NHAC-QUEST-UI.md): tracker chính tuyến hiện ngay trong màn chơi, checklist/trạng thái/thưởng theo snapshot và tu vi riêng; **J** mở sổ nhiệm vụ kèm đường tới NPC. HN01–HN04 phải nhận và xác nhận qua NPC, HN05 ghi rõ chưa triển khai. Nút chỉ dẫn không tự di chuyển hoặc cấp thưởng.

## Chạy bản thử

Cần Node.js >= 22.13.0. Trong checkout của nhánh đang làm:

```powershell
npm.cmd ci
npm.cmd run dev
```

Chạy từ worktree `_MMO`; nếu đang chạy bản trước, khởi động lại client/backend rồi tải lại trang, không xóa DB hoặc save. HUD Vân Ngọc đã dùng HP/MP/cooldown thật và phím 1/2/3; `npm.cmd run test:hang-nhac-hud-layers` kiểm phần mới bằng fixture riêng.

Mở [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html), [preview chính](http://127.0.0.1:5173/), [Map Editor](http://127.0.0.1:5173/map-editor.html) hoặc [gallery chibi](http://127.0.0.1:5173/assets/chibi-roster/index.html). Backend mặc định localhost:2567. Các URL `/map-design.html`, `/layered-map.html`, `/map-pilot.html` chuyển sang editor.

[Hướng dẫn chạy và kiểm tra](docs/PREVIEW-RUNBOOK.md) ghi toàn bộ lệnh hiện có; [hợp đồng backend](docs/BACKEND-PREVIEW.md) tách rõ chức năng đã triển khai và mục tiêu online. [Bản thử vùng nhập môn cũ](http://127.0.0.1:5173/starter-region.html) giữ để kiểm tra kỹ thuật, không là map Hằng Nhạc mới hoặc vòng nhiệm vụ chơi được.

Kiến trúc mã nguồn và luật phụ thuộc giữa các module: [ARCHITECTURE](docs/ARCHITECTURE.md).

## Tài liệu đang dùng

- **Thiết kế:** [GDD](docs/GDD.md), [hệ thống tu tiên](docs/CULTIVATION-SYSTEM.md), [ba nhân vật](docs/CHARACTERS.md), [backlog](docs/MVP-BACKLOG.md), [online](docs/ONLINE-DIRECTION.md).
- **Hằng Nhạc:** [trải nghiệm HN01–HN12](docs/HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay Ngưng Khí](docs/NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](docs/HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/khảo nghiệm](docs/HANG-NHAC-ENCOUNTERS-TRIAL.md), [bố cục đề xuất](docs/HANG-NHAC-MAP-LAYOUT.md). Nội dung và số liệu chi tiết còn là thiết kế, chưa là gameplay đã triển khai.
- **Map:** [map Hằng Nhạc đã chốt](docs/design/world/hang-nhac-map-v1/README.md), [quy trình concept/khu/ghép](docs/MAP-CONCEPT-SECTOR-WORKFLOW.md), [quy tắc xây](docs/MAP-BUILDING-GUIDE.md), [Level Design](docs/MAP-LEVEL-DESIGN.md), [trạng thái reset](docs/MAP-ASSETS-RESET.md).
- **ART:** [định hướng](docs/ART-DIRECTION.md), [roster chibi](docs/CHIBI-ROSTER-SPEC.md), [động tác bộ ba](docs/CORE-CHARACTER-MOTION-PLAN.md), [bàn giao VFX](docs/design/vfx/STARTER-VFX-HANDOFF.md), [thư viện ART và UX](docs/design/README.md).

**Ưu tiên hiện tại là triển khai theo GDD từng mốc.** Nền runtime, hồ sơ/R01 và HN01–HN04 đã có; tiếp theo HN05 và map ngoại vi/encounter riêng, rồi tuyến farm/khảo nghiệm và asset cần thiết. Giữ nguyên vùng chặn owner, không tự khôi phục ART cũ hoặc mở lại sản xuất portrait. Xem [kế hoạch](docs/HANG-NHAC-IMPLEMENTATION-PLAN.md) và [AGENTS.md](AGENTS.md).

Tài liệu idle cũ, mốc kết thúc tầng 1/tầng 3 và hướng đệ tử tự tạo được giữ để truy nguồn, có nhãn lịch sử. Chúng không thay GDD hiện hành. Hồ sơ duyệt ART, prompt, hash và kết quả kiểm tra cũ ghi nhận thời điểm sản xuất; chỉnh tài liệu không biến chúng thành bằng chứng kiểm thử mới.
