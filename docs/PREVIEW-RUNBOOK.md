# Chạy preview animation và sân chung online

**Phiên bản:** 0.11.0, ngày08/10/2026.
**Trạng thái:** đã triển khai bản thử TypeScript + Three.js và backend TypeScript + Node.js + Colyseus.  
**Phạm vi:** duyệt ART, thử chuyển động và đồng bộ map bằng phiên tạm. Tài khoản, lưu tiến trình, tu luyện và chiến đấu thuộc mốc tiếp theo.

**Công cụ map hiện tại:** http://127.0.0.1:5173/map-editor.html, hoặc đường cũ `/map-design.html`. Người phát triển tự kéo asset/layer/vùng; trợ lý không tiếp tục tự ghép. Có nhiều level/portal/Spawn riêng, Test1× WASD/E, lưu workspace và file riêng từng level, xuất/nhập JSON. [Hướng dẫn editor](MAP-EDITOR.md) và [phân công](MAP-ASSET-PRODUCTION-NOTES.md). Bản toàn vùng trước giữ tại `/layered-map.html`.

**Ưu tiên map sau review0.9.0:** đọc [quy tắc xây map](MAP-BUILDING-GUIDE.md) và [kế hoạch đoạn ngoại viện native mẫu](MAP-COURTYARD-PILOT-PLAN.md). Trang **http://127.0.0.1:5173/map-design.html** mở `/layered-map.html`: năm khu3840 × 2560 theo ảnh tổng phóng, 12 chunk/8 phần che, sprite64 × 96, WASD/nút cảm ứng. Bản này còn mờ/mask thô/nền dưới sai, ảnh lỗi đã lưu (bộ cũ đã xóa); kết quả test chỉ là kỹ thuật. Dùng để đối chiếu bố cục; làm một đoạn native trước khi mở rộng. [MAP03](MAP-LAYERED-DESIGN.md), nguồn/prompt (bộ cũ đã xóa). Vùng này hiện cục bộ, chưa nối server.

[Gallery concept](http://127.0.0.1:5173/assets/map-art/index.html) và gallery local (bộ cũ đã xóa) vẫn cho đặt PNG người lên tranh để so tỷ lệ; không có di chuyển/va chạm. ART và map đi thử cần duyệt trước nhiệm vụ/combat/loot/đột phá.

**Map mới:** mở **http://127.0.0.1:5173/starter-region.html** để đi thử vùng 3840 × 2560 với 5 khu nối nhau và hang boss 960 × 640. Giữ sprite 64 × 96, cỡ 1× như map trước; camera cuộn theo người. Chọn khu rồi bấm Đến khu để duyệt; WASD/phím mũi tên hoặc nút cảm ứng để đi, E ở cửa hang để vào/trở lại. Nhiệm vụ/quái là điểm thiết kế; phòng online hiện vẫn sân cũ. [Kịch bản/MVP mới](MVP-RPG-A.md) và [map](STARTER-REGION-MAP.md) ghi phần tiếp theo.

## 1. Khởi động

Cần Node.js >= 22.12.0 và npm. Mở terminal trong thư mục dự án:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173/**. Một lệnh chạy client và backend; giữ terminal mở khi xem. Dừng bằng Ctrl+C. Dependency đã khóa trong [package-lock.json](../package-lock.json).

Nếu dependency đã có, chỉ cần `npm.cmd run dev`. PowerShell có thể chặn file npm.ps1; các ví dụ dùng npm.cmd để chạy đúng công cụ trên Windows.

Client mặc định ở cổng 5173, backend ở cổng 2567, chỉ lắng nghe localhost. Đây là môi trường phát triển nhiều client; chưa phải bản được đưa lên internet.

## 2. Xem animation

Trang chính **http://127.0.0.1:5173/** mặc định chọn **Vương Lâm · chibi bốn hướng**: 4 đứng + 16 pose đi, vòng mặc định 0,8 giây (5 FPS). Chọn Thử trên map, bấm vào sân và giữ WASD/phím mũi tên hoặc nút hướng cảm ứng. Sải mặc định 24 px/vòng, tốc độ 40 px/s. Đủ bốn hướng xuống, trái, phải và lên; đổi hướng giữ pha bước, thả phím về hình đứng cùng hướng. [Nguồn và prompt](design/characters/wang-lin-chibi-walk-v1/README.md).

Trang **http://127.0.0.1:5173/chibi-pilot.html** giữ mẫu hướng Đông ban đầu để đối chiếu; bật Hiện bộ trước để xem hai tỷ lệ cạnh nhau. Asset và metadata trong trang chính có URL theo hash nội dung, catalog được nạp mới mỗi lần mở. Khi đang mở phiên cũ, tải lại trang để chọn bộ mặc định mới. Xem [phân tích reference](GAIT-REFERENCE-REVIEW.md).

- Chọn một trong sáu bộ preview: Vương Lâm chibi, Vương Lâm bộ trước, đệ tử nam/nữ, Tư Đồ Nam và Lý Mộ Uyển. Đây là các bộ hình của dàn nhân vật, không thêm nhân vật chính.
- Năm bộ chibi có một đứng và bốn pose chuyển động mỗi hướng. Mở **http://127.0.0.1:5173/assets/chibi-roster/index.html** để xem cạnh nhau. Vương Lâm bộ trước có tám pose/hướng, giữ đối chiếu; trang gait-review là lịch sử trước tỷ lệ chibi.
- Chọn đứng/đi và bốn hướng; nhịp animation 1–12 FPS.
- Tạm dừng để xem frame trước/sau; zoom nguyên lần 1×/2×/4× và nền giấy/tối/lưới.
- Điểm neo (32,88) được đánh dấu khi bật debug; khung native là 64 × 96.
- Tư Đồ Nam có **Đứng lơ lửng/Lướt**, chân giữ duỗi và điểm chiếu cách đáy hình 4 px. Lý Mộ Uyển có **Đứng/Đi bộ** và diện mạo mới: mặt mềm, tóc xanh đen buộc thấp, áo lavender. Mỗi bộ 20 frame; đang chờ đánh giá hình.

## 3. Di chuyển cục bộ

Chuyển sang **Thử trên map**, bấm vào sân và dùng WASD/phím mũi tên. Trên mobile dùng nút hướng phía dưới sân. Chỉnh tốc độ 40–160 px/s; nhịp chân tự khớp quãng đường. **Sải bước** 24–72 px/vòng cho so sánh, mặc định 24 cho bộ chibi, 48 cho bộ trước/online; FPS thủ công chỉ dùng cho xem tại chỗ. Nhập/chọn trong bảng điều khiển không làm nhân vật đi; rời cửa sổ sẽ xóa input đang giữ.

Tùy chọn camera bám giúp nhìn nhân vật khi zoom hoặc dùng màn nhỏ; tắt để xem camera cố định. Pause scene dừng cả chuyển động và animation. Đặt lại đưa hình về điểm xuất phát.

Nền sân đã có ART được dùng cùng collider thử biên sân, bệ trái, bảng thông báo và một trụ nhỏ giữa sân. Trụ mới là hình fixture dựng bằng code để xem va chạm/che khuất, chưa là asset ART sản xuất. Những vật cản khác trong ảnh chưa được biên tập thành map gameplay.

1/5/20 hình mô phỏng phục vụ xem chuyển động và đọc nhịp renderer trên thiết bị. Chúng không phải tài khoản hoặc kết quả thử tải MMORPG.

## 4. Hai người cùng vào sân

1. Chọn **Sân chung online**, nhập tên và chọn đệ tử nam/nữ.
2. Giữ địa chỉ `http://127.0.0.1:2567`, bấm **Vào sân**.
3. Bấm **Mở cửa sổ người chơi thứ hai**, vào sân bằng tên/mẫu hình khác.
4. Điều khiển từng cửa sổ để thấy chuyển động trên cửa sổ còn lại. Danh sách Đồng môn cho biết ai là người đang điều khiển.
5. Bấm Rời sân để kết thúc phiên; người đó biến mất khỏi map còn lại.

Vị trí, tốc độ 80 px/s và va chạm do server tính ở fixed tick 30 Hz. Client gửi MoveInput qua SDK, dự đoán người đang điều khiển bằng cùng luật, rồi reconcile/replay theo xác nhận server. Người khác nội suy snapshot với buffer 100 ms. Nhịp chân theo quãng đường và giữ pha khi đổi hướng; camera giữ số thực, sprite căn pixel trong màn hình. Hai đệ tử chibi có bốn pose đi/hướng; chất lượng ART còn chờ đánh giá.

SDK tự thử kết nối lại trong cùng trang. Server giữ chỗ 15 giây khi kết nối bị rơi; thành công giữ ID/tạo hình/vị trí. Vào lại bằng nút sau khi phiên kết thúc tạo một phiên mới. Reload hoặc khởi động lại server chưa đảm bảo giữ nhân vật vì chưa có tài khoản/cơ sở dữ liệu.

## 5. Build và kiểm tra

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:online
npm.cmd run test:browser
npm.cmd run test:movement
npm.cmd run test:gait-review
npm.cmd run test:chibi-pilot
npm.cmd run test:starter-region
npm.cmd run test:map-art
```

`build` chuẩn bị asset, kiểm tra TypeScript và build client vào dist/client. Xem client build bằng `npm.cmd run preview` ở cổng 4173; backend chạy riêng bằng `npm.cmd run start:server`. Chạy hai lệnh trong hai terminal nếu muốn thử online bằng bản build.

Kiểm tra browser dùng Chrome headless đã có trên Windows, không tải browser tự động. Mặc định: `C:/Program Files/Google/Chrome/Application/chrome.exe`. Có thể đặt biến CHROME_PATH trỏ đến Chrome/Chromium khác. Kiểm tra online/browser tự tạo server ở cổng 2577 hoặc 2579; Vite kiểm tra dùng 5179 và được dừng khi kết thúc.

Kiểm tra movement dùng cổng 2581/5182, thêm độ trễ WebSocket thực 100 ms mỗi chiều và jitter để đo nhấn/thả phím, tư thế khi dừng và va chạm. Kết quả JSON và screenshot nằm trong artifacts/ và không đưa vào Git. Bản kết quả bàn giao được tóm tắt ở [preview-verification.json](data/preview-verification.json).

## 6. Cấu trúc nguồn

| Nơi | Vai trò |
| --- | --- |
| [client/src](../client/src/) | Giao diện, atlas, animation, Three.js renderer và kết nối online |
| [server/src](../server/src/) | Phòng môn phái, state đồng bộ, xử lý input và phiên tạm |
| [shared/world.ts](../shared/world.ts) | Mặt bằng fixture, collider và luật di chuyển dùng chung |
| [scripts/sync-preview-assets.mjs](../scripts/sync-preview-assets.mjs) | Copy 6 atlas/JSON, gallery chibi và nền vào public để chạy/build |
| [tests](../tests/) | Kiểm tra atlas/di chuyển, hai client thật và browser desktop/mobile |

Nguồn ART cũ dưới docs/design giữ nguyên. [Bộ sửa tay/chân](GAIT-CORRECTION.md) có nguồn/prompt/manifest và atlas ở thư mục mới; client/public/assets được tạo lại khi chạy dev/build. Quyết định backend và hợp đồng bản thử: [BACKEND-PREVIEW.md](BACKEND-PREVIEW.md).

Map mới dùng [dữ liệu RPG-A](data/mvp-rpg-content.json) cùng [shared/starter-region.ts](../shared/starter-region.ts) cho bố trí/va chạm và [client/src/starter-region.ts](../client/src/starter-region.ts) cho preview. `npm.cmd run map:overview` xuất lại sơ đồ SVG (bộ cũ đã xóa). Test mới kiểm kết nối tới mọi POI, va chạm, tuyến chính đủ tu vi/vật liệu; browser kiểm cỡ nhân vật, portal, điều khiển, desktop/360 px. Không dùng kết quả này làm nghiệm thu combat chưa triển khai.
