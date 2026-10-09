# Chạy preview, backend thử và Map Editor

**Cập nhật:** 08/10/2026 · **Runtime:** 0.12.0. TypeScript + Three.js / Node.js + Colyseus. Hằng Nhạc có hồ sơ khách SQLite/lưu, R01 luyện thử và [NPC/HN01–HN02/thổ nạp online](HANG-NHAC-SECT-RUNTIME.md); HN03–HN12/farm/khảo nghiệm/đăng nhập sản xuất còn tiếp tục. Nhấn E gần NPC, mở Nhật ký để xem đường. Xem [trạng thái](PROJECT-STATUS.md).

## 1. Khởi động

Cần Node.js >= 22.13.0 và npm; dependency khóa trong [package-lock.json](../package-lock.json). Chạy trong checkout của nhánh muốn xem:

```powershell
npm.cmd ci
npm.cmd run dev
```

Nếu đã có dependency, chỉ chạy lệnh `dev`. Một lệnh mở client localhost:5173 và backend localhost:2567; giữ terminal mở, dừng bằng Ctrl+C. Dùng `npm.cmd` trên Windows để tránh vướng chính sách thực thi `npm.ps1`.

| URL | Nội dung thật sự |
| --- | --- |
| [Trang chính](http://127.0.0.1:5173/) | Animation, di chuyển cục bộ và sân online |
| [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html) | Map owner/9 blocker/camera 1×; hồ sơ riêng bộ ba, lưu và luyện R01 bằng phím 1/2/3 |
| [Gallery chibi](http://127.0.0.1:5173/assets/chibi-roster/index.html) | Năm bộ chibi hiện có |
| [Chibi pilot](http://127.0.0.1:5173/chibi-pilot.html) | Mẫu hướng Đông cũ để đối chiếu |
| [Map Editor](http://127.0.0.1:5173/map-editor.html) | Level Design với thư viện mặc định trống sau reset |
| [Starter region](http://127.0.0.1:5173/starter-region.html) | Prototype di chuyển/điểm thiết kế trước GDD 0.28; chưa có combat hoặc nhiệm vụ |

`/map-design.html`, `/layered-map.html` và `/map-pilot.html` hiện chuyển sang `/map-editor.html`. Gallery map-art, MAP03/native pilot, lệnh `test:map-art` và `map:overview` của bộ cũ đã bỏ; không dùng hướng dẫn lịch sử để khôi phục.

## 2. Xem animation và di chuyển cục bộ

Trang chính mặc định dùng **Vương Lâm chibi bốn hướng**: 4 đứng + 16 pose đi. Catalog có **6 bộ/136 frame**: năm bộ chibi 100 frame và Vương Lâm bộ trước 36 frame. Tư Đồ Nam có đứng lơ lửng/lướt; Lý Mộ Uyển có đứng/đi. Lý Mộ Uyển chibi native-v5 đã được chấp nhận cho bản thử; Tư Đồ Nam chibi và hai avatar đệ tử còn chờ đánh giá. [Hồ sơ roster](CHIBI-ROSTER-SPEC.md) ghi nguồn và mức duyệt riêng.

Chọn nhân vật, đứng/đi, hướng và FPS; pause để xem từng frame, zoom 1×/2×/4×, đổi nền và bật điểm neo. Frame runtime 64 × 96, neo (32,88). Bộ chibi mặc định 5 FPS khi xem tại chỗ; chuyển động cục bộ 40 px/s và sải 24 px/vòng là tham số duyệt, không phải cân bằng gameplay.

Chọn **Thử trên map**, bấm vào sân rồi giữ WASD/mũi tên hoặc nút hướng mobile. Chỉnh tốc độ/sải bước để duyệt nhịp; khi di chuyển, animation theo quãng đường. Camera bám/cố định và pause scene là công cụ xem. Fixture sân/collider/trụ dựng bằng code kiểm tra kỹ thuật; chưa phải map Hằng Nhạc mới. Mô phỏng 1/5/20 hình không là đo tải MMO.

## 3. Hai client online

1. Chọn **Sân chung online**, nhập tên và chọn đệ tử nam/nữ.
2. Giữ endpoint `http://127.0.0.1:2567`, bấm **Vào sân**.
3. Mở cửa sổ người chơi thứ hai và vào bằng tên/avatar khác.
4. Điều khiển hai cửa sổ để đối chiếu vị trí; bấm **Rời sân** khi xong.

Server tính vị trí 30 Hz, tốc độ 80 px/s, va chạm và ack input; client prediction/reconciliation và nội suy người khác. Phòng giữ phiên bị rơi tối đa 15 giây để reconnect trong cùng trang. Reload hoặc restart server chưa đảm bảo phục hồi vì chưa có tài khoản/DB. Bộ ba playable theo GDD chưa được nối vào luồng chọn online này. [Hợp đồng backend](BACKEND-PREVIEW.md) mô tả chính xác các giới hạn.

Đoạn trên mô tả fixture trang chính. Tại **Hằng Nhạc**, chọn bộ ba rồi vào sân; dùng browser context riêng để kiểm người thứ hai. Cùng tài khoản chỉ điều khiển một người, rời sân trước khi đổi. Hồ sơ Hằng Nhạc tự lưu trong `server/data/profiles.sqlite` (hoặc `GAME_DB_PATH`), giữ vị trí/MP/cooldown/counter qua reload/restart; không xóa file DB hoặc dữ liệu trình duyệt khi muốn tiếp tục save. Di chuyển đổi hướng Kiếm/Phong, dừng giữ hướng; chạm map ngắm riêng cho đến khi đổi input đi. Lôi quay về mục tiêu đã chọn. Bấm **Mục tiêu luyện**, dùng 1/2/3 hoặc nút thuật; mũi tên HUD cho biết hướng Kiếm/Phong. [Hướng dẫn/giới hạn](HANG-NHAC-R01-RUNTIME.md).

Hằng Nhạc tự nối lại khi backend restart trong lúc phát triển. Chờ trạng thái sân chung và lời nhắc E gần NPC hiện trở lại; nếu hết lượt thử hoặc hồ sơ bị từ chối, trang hiện lỗi và cho vào lại thủ công. Rời sân hủy phục hồi. `npm.cmd run test:hang-nhac-reload` kiểm luồng này bằng DB và assets fixture riêng, gồm cả reload ngay sau reconnect; đây là hồi quy bắt buộc khi sửa lifecycle kết nối/NPC.

## 4. Làm việc với map

Đọc [Level Design](MAP-LEVEL-DESIGN.md), [Map Editor](MAP-EDITOR.md), [quy tắc xây](MAP-BUILDING-GUIDE.md) và [phân công](MAP-ASSET-PRODUCTION-NOTES.md). Người phát triển tự bố trí level/layer/navigation. Editor có chọn nhiều/nhóm/căn chỉnh, PNG/tileset/brush, prefab, multipart, minimap, audit, Test va chạm/portal và xuất runtime JSON. API Vite lưu workspace hoạt động khi chạy `npm.cmd run dev` hoặc `npm.cmd run preview`; bản `dist/client` chỉ phục vụ bằng máy chủ tĩnh khác không có API này.

Bộ legacy, ART Hằng Nhạc v1/v2/v3 và hai bản thử vùng đi đã [xóa](MAP-ASSETS-RESET.md); manifest thư viện vẫn trống. Các URL/trang duyệt của bộ đã xóa không còn dùng được. Map mới đã lưu và [tích hợp runtime Hằng Nhạc](HANG-NHAC-RUNTIME.md). Actor giữ frame 64 × 96, neo (32,88); VFX R01 canvas 96 × 96/body 80/neo (48,88) vẫn là hợp đồng ART riêng.

[Bản ghép nhân vật/camera trên concept mới](design/world/hang-nhac-map-v1/README.md) là trang review riêng, dùng atlas gốc và khung desktop/mobile. Chạy server tài liệu theo [hướng dẫn](design/world/hang-nhac-map-v1/README.md); URL local hiện tại là http://127.0.0.1:8765/design/world/hang-nhac-map-v1/README.md Trang này chưa có va chạm/che khuất và không thay camera game.

Hằng Nhạc dùng release owner cho client/server; room fixture cũ dùng `shared/world/map.ts`. Room state đang chạy giữ RAM, hồ sơ Hằng Nhạc lưu SQLite. Không ghi dữ liệu test vào authored-maps, DB thật hoặc nháp trình duyệt của người phát triển.

## 5. Build và kiểm tra

Các lệnh dưới đây có trong [package.json](../package.json):

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run test:online
npm.cmd run test:hang-nhac
npm.cmd run test:hang-nhac-r01
npm.cmd run test:skill-animation
npm.cmd run test:skill-vfx
npm.cmd run test:skill-body
npm.cmd run test:hang-nhac-sect
npm.cmd run test:browser
npm.cmd run test:movement
npm.cmd run test:gait-review
npm.cmd run test:chibi-pilot
npm.cmd run test:starter-region
npm.cmd run test:map-editor
npm.cmd run test:level-design
```

Chọn checks phù hợp phần vừa sửa. `build` chuẩn bị asset, kiểm TypeScript và xuất `dist/client`. Chạy `npm.cmd run preview` để xem client build ở localhost:4173; backend cần terminal riêng với `npm.cmd run start:server`. Đây là môi trường phát triển, chưa có triển khai internet hoặc năng lực MMO được đo.

Browser smoke dùng Chrome headless đã cài, mặc định `C:/Program Files/Google/Chrome/Application/chrome.exe`; có thể đặt `CHROME_PATH`. Test tự dùng cổng riêng và dừng dịch vụ khi xong. Test editor dùng kho cô lập trong `artifacts/`, không dùng authored-maps. Kết quả mới được ghi trong `artifacts/`; [preview-verification.json](data/preview-verification.json), [map-editor-verification.json](data/map-editor-verification.json) và [level-design-verification.json](data/level-design-verification.json) là hồ sơ kiểm tra đã lưu, không tự cập nhật khi sửa tài liệu.

## 6. Nguồn dùng chung

| Nơi | Vai trò |
| --- | --- |
| [client/src](../client/src/) | UI, atlas/animation, renderer, network và editor |
| [server/src](../server/src/) | Phòng thử, state và phiên trong RAM |
| [shared/protocol](../shared/protocol/) / [shared/world](../shared/world/) | Hợp đồng input/state online, fixture và luật di chuyển/va chạm dùng chung |
| [shared/hang-nhac.ts](../shared/hang-nhac.ts) / [navigation.ts](../shared/navigation.ts) | Release Hằng Nhạc và va chạm polygon dùng chung Editor/client/server |
| [shared/map-editor.ts](../shared/map-editor.ts) / [level-design.ts](../shared/level-design.ts) | Model editor, vùng/portal, audit và export |
| [scripts/map-editor-api.ts](../scripts/map-editor-api.ts) | API lưu dự án/level trong Vite dev/preview; không phải lưu tiến trình người chơi |
| [scripts/sync-preview-assets.mjs](../scripts/sync-preview-assets.mjs) | Sinh catalog 6 bộ/136 frame, gallery chibi và map-kit theo manifest |
| [shared/skills](../shared/skills/) / [client/src/skills](../client/src/skills/) | Core gameplay, timeline pose/VFX, loader và UI; [hướng dẫn thêm/debug skill](SKILL-CORE.md) |
| [tests](../tests/) | Kiểm tra atlas, di chuyển, online, browser và editor |

`client/public/assets/` được sinh lại khi chạy assets/dev/build. Script sync catalog/gallery/map-kit và [release Hằng Nhạc](../scripts/build-hang-nhac-runtime.ts) từ map đã chốt; không tạo lại ART cũ hoặc sinh ảnh mới. [sync-skill-assets](../scripts/sync-skill-assets.mjs) đóng catalog v2 từ 10 FX R01 và 36 clip thi triển đã có, giữ nguồn/hashes và nạp theo avatar. `node scripts/verify-core-cast-assets.mjs` kiểm alpha/điểm chân/pose mới và cập nhật provenance kỹ thuật, không cấp duyệt ART.
