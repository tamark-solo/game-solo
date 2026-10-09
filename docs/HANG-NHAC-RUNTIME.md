# Hằng Nhạc — nền runtime đã triển khai

**08/10/2026 · nhánh _MMO · GDD 0.28.** Ngôn ngữ giữ đúng lựa chọn: **TypeScript** cho client, server và logic chung; client dựng hình bằng **Three.js**, server chạy **Node.js + Colyseus**, UI dùng HTML/CSS. Bước 1 nạp map và [bước 2 hồ sơ/lưu/R01](HANG-NHAC-R01-RUNTIME.md) của [kế hoạch triển khai](HANG-NHAC-IMPLEMENTATION-PLAN.md) đã có bản thử.

## Chạy và đối chiếu

Tiếp nối nền runtime: [hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md) và [NPC/HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử. Nhấn E gần NPC, dùng Nhật ký để xem đường. Camera/blocker giữ nguyên; [đợt tích hợp HUD và layer 09/10](HANG-NHAC-HUD-LAYERS.md) thay nền bake trong game bằng scene 22 object / 32 part từ trang review chủ dự án chỉ định.

Chạy `npm.cmd run dev`, mở [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html). Khi trang nạp xong có thể khám phá cục bộ; chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển, bấm **Vào sân chung** để kết nối hồ sơ riêng. Dùng browser profile/context riêng cho người chơi thứ hai; cùng tài khoản chỉ điều khiển một nhân vật mỗi lần. WASD/mũi tên và nút hướng điều khiển nhân vật. Tạo mục tiêu luyện rồi dùng phím 1/2/3 để kiểm R01. Backend mặc định localhost:2567; `VITE_SERVER_URL` cấu hình endpoint client khi cần.

Nguồn là [project owner](data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json) và [navigation đã chốt](design/world/hang-nhac-map-v1/owner-navigation/navigation.json). Không sửa project, anchors, polygon hoặc nháp trình duyệt trong đợt tích hợp. Nền access-v5-clean-v1 và project navigation giữ nguyên để đối chiếu. Scene nhiều layer nằm riêng trong [gói runtime](design/world/hang-nhac-layered-v1/README.md), không ghi đè project owner hoặc nguồn ART ở nhánh `_art`; không vẽ lại bậc thang.

| Hợp đồng | Giá trị |
| --- | --- |
| World / scene | 3072 × 2048, scale 1; 6 mảng nền và 26 part vật thể, gồm 10 mái/tán; ảnh tổng quan 2.690.422 byte dành cho minimap/demo; game không dùng ảnh tổng quan thay layer |
| Spawn đầu | (1616,992); hồ sơ mới rải quanh điểm này trên đất hợp lệ, vào lại giữ vị trí đã lưu; không sửa Spawn/polygon owner |
| Navigation | `walkPolicy=full` trừ đúng 9 blocker owner; bán kính chân 8 px |
| Nhân vật / camera | Frame 64 × 96, neo (32,88), sprite và camera 1×; camera bám người và giới hạn trong map |
| Di chuyển thử | 80 px/s, đường chéo chuẩn hóa, chia bước tối đa 4 px |
| Online | Room `hang_nhac`; input/server 30 Hz, patch 50 ms; prediction/reconciliation và nội suy người khác |
| Phiên / lưu | Drop dừng người, giữ chỗ 15 giây; reload/reconnect cùng session; leave xóa entity và lưu hồ sơ SQLite, restart đọc lại bản lưu |

## Một nguồn dữ liệu cho Editor, client và server

[Builder TypeScript](../scripts/build-hang-nhac-runtime.ts) chạy trong `npm.cmd run assets`, `dev` và `build`. Nó parse/audit project đã lưu, đối chiếu export navigation, vị trí nền và hash bytes ảnh owner trước khi tạo [release JSON nhẹ](../shared/data/hang-nhac.json). Bản này được client và server import cùng nhau. Builder không lấy các tọa độ HN-Z đề xuất hoặc fixture sân cũ làm collider thay thế.

32 ảnh part được copy vào `client/public/assets/hang-nhac/layers/` với tên chứa hash; builder kiểm package/project/ảnh và geometry trước khi công bố manifest. Ảnh tổng quan riêng dành cho minimap/demo. Gói đã đóng trong `_MMO`, nên assets/build không cần thư mục `file:///` hay Python; bước import ban đầu bằng `scripts/package-hang-nhac-layers.py` dùng Pillow và kiểm pixel RGBA lossless. JSON release lưu hash nguồn, nền, world, polygon và version toàn gói; không chứa ảnh base64. Server từ chối client gửi version khác, tránh dự đoán theo blocker cũ. Sau khi chủ dự án chỉnh map, phải cập nhật/kiểm bàn giao navigation rồi chạy assets/build để phát hành bản mới; builder dừng nếu owner project khác export đã chốt.

[navigation.ts](../shared/navigation.ts) chứa phép kiểm đa giác/bán kính dùng chung. Editor lọc vùng/layer có hiệu lực rồi gọi phép kiểm này; [hang-nhac.ts](../shared/hang-nhac.ts) dùng các vùng đã xuất cho di chuyển local, prediction và server. [HangNhacRoom](../server/src/HangNhacRoom.ts) dùng cùng bước di chuyển và tái sử dụng quản lý input/phiên của room thử. Room `sect_courtyard` giữ để kiểm hồi quy kỹ thuật riêng.

## Kiểm chứng và giới hạn

`npm.cmd test`, `npm.cmd run build`, `npm.cmd run test:hang-nhac`, `npm.cmd run test:online` và `npm.cmd run test:browser` kiểm dữ liệu nguồn, va chạm thật, native scale, đồng bộ nhiều client, prediction sát blocker, reconnect và hồi quy phòng preview. [Biên bản runtime](data/hang-nhac-runtime-verification.json) lưu kết quả của đợt này; screenshot/test log mới nằm trong `artifacts/`.

Đã có hồ sơ khách SQLite, R01, NPC/HN01–HN02/thổ nạp online và HUD Vân Ngọc đọc snapshot thật. Nhà/thân/tán đã render theo canvas/pivot và điểm chân; mái/tán mờ 35% khi alpha thực che nhân vật điều khiển phía sau, không dùng polygon gameplay làm mask. `test:hang-nhac-hud-layers` kiểm GPU/input/bố cục bằng fixture. HN03–HN12, đăng nhập sản xuất, portal/map farm/phiên khảo nghiệm, loot và offline còn tiếp tục. Người chơi chưa va chạm với nhau. Giới hạn 20 client/phòng là cấu hình thử, chưa đo tải MMO.
