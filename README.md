# game-solo

Game web theo hướng **MMORPG tu tiên có combat chủ động và idle hỗ trợ**, dành cho một người phát triển. Thiết kế hiện hành cho chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu**, cùng trải qua **Hằng Nhạc — Ngưng Khí**, rồi phân hóa từ **Trúc Cơ**. Mở đầu chung là chuyển thể gameplay, không phải lịch sử ba người cùng nhập môn trong nguyên tác.

**Cập nhật tài liệu: 09/10/2026 · runtime 0.12.0.** Đọc [trạng thái dự án](docs/PROJECT-STATUS.md), [mục lục tài liệu](docs/README.md) và [GDD 0.28](docs/GDD.md) trước khi tiếp tục công việc.

## Trạng thái hiện tại

| Phần | Hiện trạng |
| --- | --- |
| Client | TypeScript + Three.js; xem animation, thử di chuyển/camera/va chạm và sân online |
| Nhân vật trong preview | 5 bộ chibi / 100 frame, thêm Vương Lâm bộ trước 36 frame để đối chiếu: 6 bộ / 136 frame |
| Backend thử | Node.js + Colyseus; Hằng Nhạc với hồ sơ khách SQLite, vị trí/chi phí thuật do server xử lý, reload/reconnect/restart; fixture cũ giữ RAM |
| Level Design / Map Editor | Nhiều level/layer, vùng đi/chặn/portal, tileset/brush, nhóm, prefab, multipart, minimap, audit và xuất runtime JSON |
| Map Hằng Nhạc | [Map owner đã chốt](docs/design/world/hang-nhac-map-v1/README.md), 9 blocker; [runtime TypeScript](docs/HANG-NHAC-RUNTIME.md) đã nạp nền/navigation vào client và server, camera 1× |
| Thư viện editor | Manifest hiện trống; bộ ART map cũ đã xóa, chưa có asset thay thế |
| VFX / animation skill | 15 skill đã bàn giao; R01 có 10 FX gốc và 36 clip thi triển bộ ba/bốn hướng; [core tách gameplay/presentation/asset/UI](docs/SKILL-CORE.md), ART mới chờ đánh giá hình |
| Gameplay MMO | Ba hồ sơ riêng/lưu, R01 luyện thử, NPC/HN01–HN02, nhật ký/chỉ đường và thổ nạp online đã chạy; HN03–HN12/farm/khảo nghiệm/đăng nhập sản xuất còn tiếp tục |

Room `hang_nhac` có ba hồ sơ riêng từ đầu, lưu vị trí/linh lực/cooldown và luyện thử Kiếm Khí/Lôi Ấn/Ngự Phong Bộ bằng phím 1/2/3. [Hợp đồng bước 2](docs/HANG-NHAC-R01-RUNTIME.md) ghi baseline và giới hạn local. Client/server giữ cùng release/vùng chặn owner. Room `sect_courtyard` với hai avatar đệ tử/fixture giữ để kiểm hồi quy.

[Tương tác môn phái](docs/HANG-NHAC-SECT-RUNTIME.md): nhấn **E** gần NPC, theo Nhật ký để làm HN01–HN02, xác nhận M01 rồi chọn thổ nạp/hồi phục nền. Tu vi tách khỏi MP, thưởng nhập môn một lần/hồ sơ; chưa tính offline hoặc mở ngưỡng sau nền 1–3.

## Chạy bản thử

Cần Node.js >= 22.13.0. Trong checkout của nhánh đang làm:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html), [preview chính](http://127.0.0.1:5173/), [Map Editor](http://127.0.0.1:5173/map-editor.html) hoặc [gallery chibi](http://127.0.0.1:5173/assets/chibi-roster/index.html). Backend mặc định localhost:2567. Các URL `/map-design.html`, `/layered-map.html`, `/map-pilot.html` chuyển sang editor.

[Hướng dẫn chạy và kiểm tra](docs/PREVIEW-RUNBOOK.md) ghi toàn bộ lệnh hiện có; [hợp đồng backend](docs/BACKEND-PREVIEW.md) tách rõ chức năng đã triển khai và mục tiêu online. [Bản thử vùng nhập môn cũ](http://127.0.0.1:5173/starter-region.html) giữ để kiểm tra kỹ thuật, không là map Hằng Nhạc mới hoặc vòng nhiệm vụ chơi được.

Kiến trúc mã nguồn và luật phụ thuộc giữa các module: [ARCHITECTURE](docs/ARCHITECTURE.md).

## Tài liệu đang dùng

- **Thiết kế:** [GDD](docs/GDD.md), [hệ thống tu tiên](docs/CULTIVATION-SYSTEM.md), [ba nhân vật](docs/CHARACTERS.md), [backlog](docs/MVP-BACKLOG.md), [online](docs/ONLINE-DIRECTION.md).
- **Hằng Nhạc:** [trải nghiệm HN01–HN12](docs/HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay Ngưng Khí](docs/NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](docs/HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/khảo nghiệm](docs/HANG-NHAC-ENCOUNTERS-TRIAL.md), [bố cục đề xuất](docs/HANG-NHAC-MAP-LAYOUT.md). Nội dung và số liệu chi tiết còn là thiết kế, chưa là gameplay đã triển khai.
- **Map:** [map Hằng Nhạc đã chốt](docs/design/world/hang-nhac-map-v1/README.md), [quy trình concept/khu/ghép](docs/MAP-CONCEPT-SECTOR-WORKFLOW.md), [quy tắc xây](docs/MAP-BUILDING-GUIDE.md), [Level Design](docs/MAP-LEVEL-DESIGN.md), [trạng thái reset](docs/MAP-ASSETS-RESET.md).
- **ART:** [định hướng](docs/ART-DIRECTION.md), [roster chibi](docs/CHIBI-ROSTER-SPEC.md), [động tác bộ ba](docs/CORE-CHARACTER-MOTION-PLAN.md), [bàn giao VFX](docs/design/vfx/STARTER-VFX-HANDOFF.md), [thư viện ART và UX](docs/design/README.md).

**Ưu tiên hiện tại là triển khai theo GDD từng mốc.** Nền runtime, hồ sơ/R01 và mở đầu HN01–HN02 đã có; tiếp theo HN03–HN04, rồi map farm/khảo nghiệm riêng và asset cần thiết. Giữ nguyên vùng chặn owner, không tự khôi phục ART cũ hoặc mở lại sản xuất portrait. Xem [kế hoạch](docs/HANG-NHAC-IMPLEMENTATION-PLAN.md) và [AGENTS.md](AGENTS.md).

Tài liệu idle cũ, mốc kết thúc tầng 1/tầng 3 và hướng đệ tử tự tạo được giữ để truy nguồn, có nhãn lịch sử. Chúng không thay GDD hiện hành. Hồ sơ duyệt ART, prompt, hash và kết quả kiểm tra cũ ghi nhận thời điểm sản xuất; chỉnh tài liệu không biến chúng thành bằng chứng kiểm thử mới.
