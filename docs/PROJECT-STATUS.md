# Trạng thái hiện hành của _MMO

**Rà soát:** 09/10/2026 · **Mốc code nền:** `83be946` + thay đổi local chưa commit · **Runtime:** 0.12.0 · **GDD:** 0.28. Tài liệu này mô tả trạng thái quan sát trong checkout; phiên bản GDD, phiên bản runtime và phiên bản pack ART là ba thông tin riêng.

## Nguồn quyết định và cách đọc tài liệu

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
- Khung tu tiên gồm cảnh giới, công pháp, thuật pháp, pháp bảo, lĩnh ngộ và hành trình cá nhân. Server dự kiến sở hữu tiến trình/tài nguyên/kết quả hợp lệ.

HN01–HN12, phân bổ 15 tầng/mốc 1–3–9–15, balance combat/phần thưởng/idle, slot/đổi nhân vật/kho chung và phạm vi lát A/B/C còn là thiết kế cần đánh giá. Kết thúc tầng 1/tầng 3, chu kỳ 10 giây và offline 8 giờ từ thiết kế cũ không là luật mới.

## Những gì đã triển khai

| Phần | Đã có | Giới hạn thực tế |
| --- | --- | --- |
| Preview TypeScript + Three.js | Loader, atlas/animation, renderer, camera, input và di chuyển/va chạm fixture | Chưa là vòng gameplay MMO |
| Catalog nhân vật | 5 bộ chibi/100 frame, thêm Vương Lâm trước 36 frame: 6 bộ/136 frame; bộ ba chibi có 60 frame | Chọn nhân vật ART không là tạo hồ sơ playable online; combat/động tác riêng chưa đủ |
| Backend Colyseus | Room `hang_nhac` nạp map owner và hồ sơ bộ ba, SQLite lưu riêng, R01 do server tính; NPC/HN01–HN04, M01, đòn thường, bài thuật/né cá nhân, thổ nạp online, vật tư và ledger thưởng một lần. Room `sect_courtyard` giữ hồi quy RAM | Tài khoản khách local, một nhân vật điều khiển/tài khoản; chưa có đăng nhập sản xuất/khóa phân tán. Giới hạn 20 client/phòng chưa là công suất được đo |
| Level Design / Map Editor | Nhiều level/layer, vùng đi/chặn/portal, chọn nhiều/nhóm/căn chỉnh, tileset/brush, prefab, multipart, minimap, audit, save và export | Save là dữ liệu biên tập; API workspace có trong Vite dev/preview, không có khi chỉ phục vụ dist tĩnh. Release Hằng Nhạc đã nối client/server từ export đã chốt |
| Starter region cũ | Prototype di chuyển/portal/điểm nội dung từ trước GDD mới | Chưa có nhiệm vụ/combat; không thay bố cục Hằng Nhạc hiện hành |

Các tag `story_npc`/`player_template` của catalog preview là nhãn kỹ thuật lịch sử; quyền chọn bộ ba của game theo GDD. Không thay enum code chỉ để đổi thuật ngữ tài liệu.

## Map và ART

Reset `1a3e80b` xóa bộ map legacy; thư viện editor vẫn có `assets: []`. ART Hằng Nhạc từng được thêm tại `4546217` và merge tại `83be946`. Theo yêu cầu mới nhất ngày 08/10/2026, đã xóa ART v1/v2/v3 và hai bản thử vùng đi: **203 file, gồm 121 PNG**. [Biên bản riêng](data/hang-nhac-art-removal-2026-10-08.json) ghi danh sách/hash, [trạng thái reset](MAP-ASSETS-RESET.md) ghi phạm vi và bước tiếp theo. Không khôi phục bộ đã xóa từ lịch sử commit hoặc kế hoạch cũ.

| Bộ | Trạng thái |
| --- | --- |
| ART Hằng Nhạc v1/v2/v3 | Đã xóa nền, nguồn/prompt, metadata và trang duyệt theo yêu cầu; chưa có bộ thay thế |
| Bản thử vùng đi v1/v2 | Đã xóa toàn bộ nguồn/lớp/trang thử và dữ liệu vùng đi local |
| [Hằng Nhạc đã lưu](design/world/hang-nhac-map-v1/README.md) | Nền C access-v5-clean-v1 3072 × 2048/scale 1, 9 blocker owner, Spawn (1616,992); runtime và hồ sơ/R01 đã tích hợp, camera 1×. Chưa có portal hoặc part che. |
| Concept, ba asset thử và nền sạch trước map mới | Đã xóa 105 file/166.784.897 byte theo [biên bản](data/hang-nhac-review-reset-2026-10-08.json); không tái sử dụng nguồn hoặc builder |
| [Roster chibi](CHIBI-ROSTER-SPEC.md) | Vương Lâm làm chuẩn; Lý Mộ Uyển native-v5 chấp nhận cho bản thử. Tư Đồ Nam chibi/hai avatar còn chờ đánh giá; duyệt identity tĩnh trước đó là mốc khác |
| [VFX bàn giao](design/vfx/STARTER-VFX-HANDOFF.md) | 15 skill/646 PNG RGBA rời/76 atlas đã bàn giao. R01 giữ 10 FX gốc, thêm 36 clip thi triển bộ ba/bốn hướng; R02–R05 runtime, SFX/icon và crowd benchmark chưa có |
| [Core cast mới](design/characters/core-cast-v1/README.md) | 33 clip/264 frame mới, giữ ba chuỗi Vương Lâm Đông/36 frame gốc: 36 binding/300 frame cast. ART mới chờ đánh giá hình; PNG/source/prompt/metadata và provenance giữ trong workspace |
| Portrait/UI trước | Giữ nguồn/phiên bản lịch sử; cần đánh giá và đồng bộ nhận diện chibi trước sử dụng |

Actor locomotion giữ frame **64 × 96**, neo **(32,88)** và collider chân 8 px. [Skill core](SKILL-CORE.md) gắn pose thi triển riêng lên cùng actor/điểm chân trong cast, cao 96 px, rộng đủ tay/áo, body tối đa 80 px. Ba chuỗi Vương Lâm Đông gốc đã nối đúng nhân vật; Tư Đồ Nam/Lý Mộ Uyển dùng ART riêng. Presentation lấy server timestamp/hold, không quyết định damage hoặc chi phí. Tải atlas theo avatar, có trace và lỗi binding/asset để debug.

Đã sửa vùng hiển thị của 108 frame mới lấy lẫn mảnh pose bên cạnh từ sheet. Crop/cutout theo từng frame dùng chung cho thân/bóng Phong và preview, giữ bitmap và hợp đồng tỷ lệ/nhịp. Hồi quy GPU kiểm đúng 300 frame, vùng trong suốt, pool/đổi clip và trở về locomotion; xem [biên bản](data/hang-nhac-skill-crop-verification.json).

## Ưu tiên và phần còn thiếu

**Ưu tiên mới 09/10:** làm [HUD desktop](DESKTOP-SKILL-HUD.md) trước, mobile sau. Owner đã cung cấp mẫu khung liền/cầu tài nguyên/dãy thuật. Bản 03 Vân Ngọc theo Type 2, khung đồng/ngọc/mây 760 × 140 px, 10 ô 36 px (ba R01 + bảy chưa gán), sinh lực/linh lực và bảy trạng thái trên nền/nhân vật 1×. Frame/icon ImageGen, nguồn/prompt đã lưu; bản phác riêng chờ duyệt hình, chưa ghép game hoặc kết nối profile/server. Ảnh các bản 01/02 giữ làm lịch sử.

[Khí quang 02](design/ui/desktop-skill-hud-v3/qi-v2/README.md) làm rõ khác biệt sau phản hồi FX đầu quá nhẹ: texture khí xoáy đỏ/ngọc ImageGen 50 KB, kính/thể tích, vòng trận pháp và ánh hắt khung. Có đối chiếu bật/tắt, FX tách khỏi skill core và chưa ghép game.

Ưu tiên hiện tại: bước 1 map, [bước 2 hồ sơ/lưu/R01](HANG-NHAC-R01-RUNTIME.md) và [phần đầu bước 3 NPC/HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử. [HN03–HN04](HANG-NHAC-LESSONS-RUNTIME.md) đã có bài thuật/né an toàn và đòn thường, credit/thưởng một lần theo server. [HUD/layer](HANG-NHAC-HUD-LAYERS.md) đã tích hợp. Tiếp nối HN05 với map ngoại vi/encounter riêng trước khi mở portal hoặc khảo nghiệm. Không sửa vùng chặn đã chốt.

Đã có hồ sơ khách riêng, save/reload/restart, R01/mục tiêu luyện không thưởng và mở đầu HN01–HN02. Nhật ký chỉ đường tới bốn NPC dùng mẫu đệ tử sẵn có; vận khí và phần thưởng do server xác nhận. Tích lũy nền tách MP, 120/phút online, dừng tại cổng 360; chưa tính offline, chưa mở M02/nền 4–9. HN03/HN04 đã nối journal/NPC, đòn thường F/0 MP, Kiếm/Lôi và né bằng đi bộ/Phong; mỗi bài +80 baseline chỉ sau xác nhận, giữ tiến trình schema 2. Đăng nhập sản xuất, HN05–HN12, combat farm, pháp khí và khảo nghiệm chưa hoàn tất. Số liệu vẫn baseline thử.

Phục hồi kết nối 09/10 đã sửa lỗi lưu reconnection token cũ và thêm phục hồi cùng hồ sơ khi backend restart. [Hồi quy riêng](data/hang-nhac-reload-interaction-verification.json) kiểm E/nút nói chuyện sau reload/reconnect/restart, quyền R01 có sẵn và Rời sân hủy phục hồi. Map owner và tiến trình thật không được seed/reset trong kiểm chứng.

Hướng thi triển 09/10 đã nối WASD/mũi tên/mobile với hướng Kiếm/Phong, giữ hướng khi dừng, cho phép chạm map ngắm riêng. Lôi quay về mục tiêu đã chọn trên server; pose/VFX dùng hướng cast được xác nhận. Cast chờ input tick liên quan để tránh tự hủy khi nhấn di chuyển và skill cùng frame, có giới hạn/hết hạn và xóa khi drop/leave. Quy tắc/trace và [kiểm chứng](data/hang-nhac-skill-aim-verification.json) nằm trong [skill core](SKILL-CORE.md); giữ ART/native/map và luật chi phí/hit hiện hành.

## Kiểm chứng

[Hướng thi triển 09/10](data/hang-nhac-skill-aim-verification.json) đã qua 92 unit test, build/typecheck, input barrier/receipt/cancel, điều khiển bộ ba/bốn hướng trên browser, 36 tổ hợp pose, R01 online/browser và E/NPC sau reload/reconnect/restart. Fixture R01 hai người dùng viewport 720 × 720 và bật timer tab nền để tránh software WebGL làm mất heartbeat; camera/native vẫn 1×.

[Runbook](PREVIEW-RUNBOOK.md) chứa lệnh hiện có. [Biên bản skill core](data/hang-nhac-skill-core-verification.json) ghi đợt 09/10: 84 unit test, đối chiếu với player/controller VFX gốc, 10 clip kiểm pixel WebGL, 36 tổ hợp animation/browser, build/typecheck và hồi quy. Một kiểm hash release lịch sử không qua do text checkout CRLF và PIPELINE đã cập nhật; atlas/hold/socket gốc được kiểm nguyên vẹn riêng. [Biên bản môn phái](data/hang-nhac-sect-verification.json) giữ 69 unit test tại thời điểm, [bước 2](data/hang-nhac-r01-verification.json) giữ 59 unit test; [bước 1](data/hang-nhac-runtime-verification.json) giữ kiểm trước đó gồm Editor/Level Design. Kết quả kỹ thuật không chứng minh duyệt ART mới hoặc công suất MMO.
