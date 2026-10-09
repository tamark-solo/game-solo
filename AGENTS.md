# Hướng dẫn làm việc trong game-solo

**Bản chốt ngày 08/10/2026:** owner đã hoàn tất vùng chặn và xác nhận lưu bản mới nhất. [Hằng Nhạc](docs/design/world/hang-nhac-map-v1/README.md) giữ nền access-v5-clean-v1: 3072 × 2048, scale 1, 9 blocker, Spawn (1616,992). Các bản thử đã dọn; giữ nguồn sáu khu C/bản sao ngoài workspace. Không sửa blocker hoặc bậc thang. [Nền runtime](docs/HANG-NHAC-RUNTIME.md) dùng TypeScript + Three.js / Node.js + Colyseus, cùng release Editor/client/server, camera 1×. [Bước 2 hồ sơ/lưu/R01](docs/HANG-NHAC-R01-RUNTIME.md) đã có SQLite khách, ba hồ sơ riêng, reload/reconnect/restart và Kiếm/Lôi/Phong do server xác nhận trên mục tiêu luyện không thưởng. Số liệu baseline chưa khóa; locomotion 64 × 96 giữ nguyên. Ngày 09/10 đã bổ sung [skill core](docs/SKILL-CORE.md): tách gameplay/behavior/timeline/asset/UI, 36 clip cast bộ ba/bốn hướng; ART mới chờ đánh giá hình, không suy duyệt từ test. [Mở đầu NPC/HN01–HN02/thổ nạp](docs/HANG-NHAC-SECT-RUNTIME.md) đã có bản thử: nhật ký/chỉ đường, M01, tích lũy online và vật tư riêng, schema 2 tương thích save cũ. Tiếp nối HN03–HN04 theo [kế hoạch GDD](docs/HANG-NHAC-IMPLEMENTATION-PLAN.md), rồi farm/khảo nghiệm riêng; chưa có portal/part che. Không khôi phục ART cũ, không ghi test vào owner map/DB thật/draft trình duyệt.

## Công việc liên quan đến map

**Kết nối/NPC 09/10:** lưu token sau khi SDK hoàn tất handshake reconnect; Hằng Nhạc phục hồi cùng hồ sơ có giới hạn khi backend restart. Rời sân hủy phục hồi, không replay lệnh nhiệm vụ/thưởng. Khi sửa lifecycle chạy `npm.cmd run test:hang-nhac-reload` với DB/publicDir fixture, thêm hồi quy NPC/R01 phù hợp; không reset save thật để làm E hoạt động. Xem `docs/data/hang-nhac-reload-interaction-verification.json`.

**Hướng thuật 09/10:** WASD/mũi tên/mobile đổi hướng Kiếm/Phong, dừng giữ hướng; chạm map ngắm riêng đến khi đổi input đi. Lôi quay về mục tiêu trên server lúc nhận cast. `SkillAim` tách ý định input khỏi `castAimX/Y` đã xác nhận; `inputSeq` nối cast vào tick di chuyển để không tự hủy khi nhấn cùng frame. Room giới hạn/hết hạn lệnh chờ, xóa khi drop/leave; giữ khóa receipt cũ. Xem `docs/SKILL-CORE.md`; khi sửa hướng/input chạy `test:skill-aim`, hồi quy R01 và NPC/reload phù hợp, chỉ dùng fixture riêng.

**Crop sprite 09/10:** 108 frame cast mới chứa mảnh hàng/cột bên cạnh do chia đều sheet. `frameCrops/frameCutouts` cục bộ mỗi frame + `client/src/sprite-frame.ts` giới hạn geometry/UV cho thân và bóng Phong, giữ canvas/anchor/bitmap gốc. Sprite phải có geometry riêng; không sửa quad mặc định dùng chung. Khi đổi PNG/trích source, tạo lại metadata bằng `build-core-cast-crops.mjs` và xem crop; khi sửa renderer/presentation chạy `test:skill-body`, `test:skill-vfx`, hồi quy 36 cast và NPC/reload phù hợp. Không tái vẽ hoặc sửa gameplay để che lỗi crop.

Trước khi sửa ART môi trường, layer, thứ tự vẽ, camera, va chạm, đường đi hoặc quy trình xuất asset, đọc:

1. [Quy tắc xây map](docs/MAP-BUILDING-GUIDE.md).
2. [Quy trình concept tổng → khu chi tiết → ghép](docs/MAP-CONCEPT-SECTOR-WORKFLOW.md), dùng lại cho map tiếp theo; điều chỉnh màu/diện tích/số khu theo GDD. Skill lưu riêng: `game-map-concept-sectors`.
3. [Phân công sản xuất asset](docs/MAP-ASSET-PRODUCTION-NOTES.md).
4. [Level Design](docs/MAP-LEVEL-DESIGN.md), [Map Editor](docs/MAP-EDITOR.md) và [thư viện mới](docs/design/world/map-asset-library/README.md).

Giữ các quyết định sau:

- Chủ dự án đã yêu cầu trợ lý dựng map tổng theo GDD để họ vẽ vùng đi/chặn trước, rồi mới làm asset rời. Người phát triển chỉnh navigation/layer và chốt footprint trong editor. Không tự sửa bố cục/vùng trong `docs/data/authored-maps/` khi sửa editor.
- Bộ ngoại viện/MP01–MP07/MAP03 legacy, ART Hằng Nhạc v1/v2/v3 và hai walk study đã xóa. Bố cục HN-Z01–Z08 cũ chỉ giữ làm tham chiếu. Map tổng mới đã được chủ dự án chọn làm nền triển khai và có navigation họ vẽ; không tự sửa collider hoặc tách ART ngoài nhu cầu triển khai.
- Runtime/editor giữ frame nhân vật 64 × 96, chân (32,88), cỡ chơi mặc định 1×. VFX R01 dùng canvas 96 × 96, body 80, chân (48,88); không thay hợp đồng runtime. Sản xuất ART mới cần nêu rõ bộ nhân vật/tỷ lệ dùng đối chiếu.
- Tách nền sạch, cụm tĩnh, vật thể xếp theo chân, phần che cần điều khiển và dữ liệu gameplay. Chỉ ghép chung ảnh các vật có cùng quan hệ trước/sau với người chơi; nhóm chỉnh sửa có thể chứa nhiều đối tượng.
- Dùng alpha đúng mép vật thể cho phần che. Polygon đơn giản dùng cho va chạm/vùng gameplay, không thay mép tán/mái trong ART.
- Asset nhiều part dùng chung canvas/pivot. Đo điểm chân sau xuất; không coi tâm ảnh là chân đế. Nền phía sau phần che phải đầy đủ, không phóng ảnh tổng rồi dùng mask đa giác làm ART sản xuất.
- Lưu nguồn có layer/nguồn rời, prompt/input nếu dùng imagegen, metadata và trạng thái chất lượng của asset mới. Khi tạo/chỉnh raster dùng skill imagegen và lưu trong workspace.
- Kiểm kỹ thuật và duyệt hình ảnh riêng biệt; không suy ownerApproved/artApproved từ build/test.
- Không xóa/sửa dữ liệu map người phát triển hoặc bản nháp trình duyệt khi dọn asset. Reset thư viện mở dự án mới; giữ bản cũ để người phát triển xử lý dữ liệu cần thiết.
- Không tự mở nhiệm vụ/combat/loot/đột phá hoặc chân dung UI khi vẫn ở giai đoạn map, trừ khi người dùng chuyển ưu tiên.

Hướng dẫn giữ ngữ cảnh, không tạo thêm bước xin phép. Tiếp tục việc đã được yêu cầu; chỉ dẫn mới nhất của người dùng được ưu tiên.

**Level Design 0.12.0:** đã có chọn nhiều/nhóm/căn chỉnh, brush/tileset, prefab kèm vùng, thư viện JSON, multipart editor, minimap, audit và runtime export. Schema mở rộng tương thích dự án cũ. Kiểm bằng `npm.cmd run test:level-design` và `npm.cmd run test:map-editor`; không ghi fixture vào authored-maps. Không tạo ART mới hoặc tự bố trí level để minh họa công cụ nếu chưa được yêu cầu.
