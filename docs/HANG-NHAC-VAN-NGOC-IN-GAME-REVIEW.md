# Hằng Nhạc Vân Ngọc trong màn chơi

**Bản chuẩn đã chốt 12/10/2026:** owner đã yêu cầu lưu V2 20 vùng làm chuẩn và dọn map cũ. Menu nay ghi **Vân Ngọc · chuẩn ART**, metadata có phạm vi duyệt nền bake theo hash. [Hồ sơ baseline và dọn](HANG-NHAC-VAN-NGOC-BASELINE.md) ghi nguồn tự chứa, hash, 119 file đã chuyển ra kho ngoài workspace và các phụ thuộc còn dùng. Release/navigation/Editor giữ nguyên.

**12/10/2026:** owner yêu cầu ghép concept vào game để kiểm tra. Mở [màn chơi Vân Ngọc](http://127.0.0.1:5173/hang-nhac.html?mapArt=van-ngoc), đăng nhập/chọn nhân vật như thường. Đây là màn `/hang-nhac.html` thật, cùng HUD, NPC và kết nối server đang có.

Trong **Thiết lập → Nền Hằng Nhạc**, chọn **Vân Ngọc · xem thử**, **Vân Ngọc · chuẩn ART** hoặc **Nền runtime hiện hành**. Chuyển ART ngay trong phiên đang chơi, không rời room hoặc đổi hồ sơ. URL ghi lựa chọn bằng `mapArt=van-ngoc` hoặc `mapArt=van-ngoc-detail`; reload giữ lựa chọn, các query khác được giữ. Link không có query vẫn dùng scene layered hiện hành. Không lưu lựa chọn vào draft Editor hoặc thay release server.

**Bản nét rõ 20 vùng, 12/10/2026:** sau phản hồi nền còn mờ cạnh nhân vật, owner chọn “Nét rõ như mẫu bên phải” của R01. Mở [Vân Ngọc chuẩn ART](http://127.0.0.1:5173/hang-nhac.html?mapArt=van-ngoc-detail), hoặc chọn **Vân Ngọc · chuẩn ART** trong cùng menu. Nền 3072 × 2048 được vẽ lại thành 20 vùng 704 × 704, căn rồi ghép, hiển thị ở camera 1×. WebP không mất dữ liệu 11202972 byte, SHA-256 `4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8`; pixel giải mã khớp master. Texture chi tiết dùng nearest sampling để giữ viền rõ. Xem [nguồn, đường nối và đối chiếu native](design/world/hang-nhac-van-ngoc-detail-v2/README.md). Bản sáu khu V1 đã chuyển vào kho phục hồi ngoài dự án sau khi owner chốt V2; đầu vào cần thiết được giữ trong gói V2.

## Nguồn và tỷ lệ

Ảnh là [concept.webp](design/world/hang-nhac-van-ngoc-concept-v1/concept.webp) từ folder owner chỉ định, không tạo lại hoặc chỉnh raster. `sync-dao-dual-ui.mjs` kiểm hash rồi sao chép nguyên byte đến `/assets/dao-dual-theme-v1/concept.webp`, dùng lại nguồn chung với review UI.

| Hạng mục | Giá trị |
| --- | --- |
| Nguồn concept | 1536 × 1024, 860598 byte |
| SHA-256 | `f5bd95bc1cbe5e67b5ed064b6238c94eaa21ca3bca9a9d00ad2ffbff5e0bad22` |
| Mặt phẳng xem thử | 3072 × 2048, (0,0), tỷ lệ hiển thị nguồn 2× |
| Camera gameplay | 1× |
| Sprite locomotion / chân | 64 × 96 / (32,88) |
| Spawn / blocker | (1616,992) / 9, giữ nguyên |
| Scene hiện hành khi chuyển về | 22 object / 32 part / 10 cover |

Renderer chỉ cho phép kích thước nguồn khác world khi caller truyền kích thước native rõ ràng và tỷ lệ khung hình khớp. Đường nạp nền cũ vẫn kiểm ảnh bằng kích thước world. Chuyển qua concept thay nhóm ART, không ghép các mái/tán của scene cũ lên concept; chuyển về scene hiện hành khôi phục đủ parts. Minimap HUD, bản đồ lớn và ảnh chỉ đường trong sổ nhiệm vụ cùng đọc lựa chọn ART.

## Phạm vi xem thử

Concept và bản chi tiết đều có nhà/cây đã bake. Bản chi tiết có nguồn khu đã căn ở cỡ dùng, nhưng chưa có alpha mái/tán để người đi phía sau hoặc nền sạch. Tỷ lệ hiển thị 2× của lựa chọn concept vẫn không biến nguồn concept thành ART native 3072 × 2048. Navigation/footprint theo map owner đã chốt, chưa xác nhận khớp từng mép hình; đây là điều cần đánh giá khi đi qua cửa, cầu, bậc và lối hẹp.

Tích hợp phục vụ kiểm màu, vật liệu, độ rõ, tỷ lệ công trình cạnh người và sự đồng bộ với HUD/entry. Owner đã chốt V2 làm chuẩn ART nền bake trong [approval.json](design/world/hang-nhac-van-ngoc-detail-v2/approval.json). Phạm vi gốc của [metadata concept](design/world/hang-nhac-van-ngoc-concept-v1/concept.json) vẫn giữ riêng; layer che và navigation theo ART mới chưa được xác nhận. Nguồn concept, owner-authored map, bậc thang, blocker, Spawn, atlas, save và DB không thay.

Sau phản hồi hình, tiếp tục [kế hoạch asset](HANG-NHAC-VAN-NGOC-ASSET-PLAN.md): khu chi tiết/căn footprint, rồi đạo cụ cần source riêng và part che người. Đạo cụ trước, icon hành trang sau theo phạm vi owner đã yêu cầu.

## Kiểm kỹ thuật

Chạy `npm.cmd run test:hang-nhac-map-art` trên backend/DB/browser fixture riêng. Đã qua 11 nhóm, không có lỗi trang/HTTP: cả ba lựa chọn ART, nguồn chi tiết native 3072 × 2048, phục hồi 32 parts/10 covers, native sprite/camera/world, chuyển nền giữ session/room/profile, minimap/bản đồ/nhật ký, URL/reload và mobile. Screenshot/kết quả nằm trong `output/hang-nhac-map-art/`: `van-ngoc-desktop.png`, `van-ngoc-detail-desktop.png`, `van-ngoc-detail-mobile.png`, `verification.json`. Đã xem trực tiếp ảnh desktop/mobile chi tiết.

Lượt V2 20 vùng đạt trên Chrome/GPU của máy với `$env:TEST_NATIVE_GPU='1'`, giữ toàn bộ assertion. Các lượt SwiftShader bị timeout tại thao tác hộp/chụp hình; không suy kết quả đạt từ những lượt đó. HUD/layer chạy riêng cùng chế độ đã qua 14 nhóm; build và TypeScript/boundary đã qua. Nguồn WebP đang phục vụ tại port 5173 đã kiểm hash/bytes khớp metadata V2.

Hồi quy liên quan: TypeScript/boundary, HUD-layer, Dao UI, sprite-body/VFX, R01/NPC/sect và reload tùy phần sửa. Không ghi fixture vào authored-map hoặc DB thật. Các test xác nhận hành vi kỹ thuật; owner đánh giá hình trực tiếp trong game.
