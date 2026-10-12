# Vân Ngọc · nét rõ, 20 vùng

Ngày 12/10/2026, owner nhận xét nền sáu khu còn mờ cạnh nhân vật và chọn **“Nét rõ như mẫu bên phải”** trong [đối chiếu R01](R01-native-comparison.png). Bản này áp dụng hướng viền rõ và mảng sáng/tối của mẫu đó cho toàn map. Sau khi xem trong game, owner yêu cầu **lưu map này làm chuẩn và dọn map cũ**. [Duyệt theo hash](approval.json) xác nhận nền bake làm chuẩn ART; mái/tán, nền sạch và footprint có phạm vi riêng. Xem [hồ sơ lưu/dọn](../../../HANG-NHAC-VAN-NGOC-BASELINE.md).

Mở [map chuẩn](http://127.0.0.1:5173/hang-nhac.html?mapArt=van-ngoc-detail), hoặc Thiết lập → Nền Hằng Nhạc → Vân Ngọc · chuẩn ART. Lựa chọn concept dùng chung với web và scene layered hiện hành vẫn có trong cùng menu. Không thay release, navigation, save, camera 1× hoặc sprite 64 × 96 / chân (32,88).

## Nguồn và chia vùng

[study.json](study.json) ghi phạm vi lựa chọn của owner và hash mẫu R01. [regions/inputs.json](regions/inputs.json) giữ baseline đầu vào; [regions/production.json](regions/production.json) ghi nguồn được chọn, prompt, hash và các bản bị loại. Bố cục lấy từ master V1 3072 × 2048 đã chuyển nguyên byte vào [layout-master.png](regions/inputs/layout-master.png); nét/vật liệu lấy từ R01. Gói hiện tại tự chứa nguồn, không đọc folder V1 đã dọn. Bản manifest trước chuyển nguồn nằm trong `regions/provenance/`. Mỗi guide được gửi làm mục tiêu edit, R01 là ảnh style riêng.

| Hạng mục | Giá trị |
| --- | --- |
| World / nền bàn giao | 3072 × 2048 |
| Lưới | 5 cột × 4 hàng, D01–D20 |
| Mỗi vùng tại tỷ lệ dùng | 704 × 704 |
| X bắt đầu | 0, 592, 1184, 1776, 2368 |
| Y bắt đầu | 0, 448, 896, 1344 |
| Phần chồng | ngang 112 px, dọc 256 px |
| Guide ảnh vào | 1254 × 1254, chỉ để khóa bố cục |
| Raw trả về thực tế | 1254 × 1254; request 1232 × 1232 |
| Model / transport | `gpt-image-2`, `https://img.aishenji.top/v1/images/edits` |

Guide resize không được dùng làm ART bàn giao. Nguồn raw, prompt và metadata provider nằm trong `regions/generated/`, `regions/prompts/`, `regions/inputs/`. API key vẫn được mã hóa DPAPI ngoài Git; metadata không chứa khóa. D13 bản đầu và bản v2 bị co bố cục, D16 bản đầu bị lệch tỷ lệ; chỉ D13-v3 và D16-v2 đạt gate và được chọn. Raw bị loại đã chuyển ra kho ngoài dự án; metadata/prompt và biên bản hash giữ để truy vết.

## Căn và ghép

[registration.json](regions/registration.json) ghi 20 vùng đạt gate gần đơn vị, RMS các mốc từ 0,200 đến 0,880 px. Phép đo dùng ảnh chuẩn hóa; ảnh bàn giao được lấy **một lần từ raw đến tọa độ world**, gộp phép giảm kích thước và affine. Không dùng ảnh chuẩn hóa qua hai lượt lấy mẫu để xuất nền.

[composition.json](regions/composition.json) ghi 19 đường nối, blend 8 px và bù RGB giới hạn 6 đơn vị. Không upscale, sharpen hoặc blur toàn nền. [Master PNG](regions/map-master.png) là 13464732 byte, SHA-256 `79b1935aeea27344967d573f52f13935ff832d08342b675e22493f6f1ad6d793`. [WebP không mất dữ liệu](regions/map-web.webp) là 11202972 byte, SHA-256 `4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8`.

Đã kiểm pixel RGB giải mã của WebP khớp hoàn toàn master. Dung lượng truyền khoảng 10,68 MiB; texture RGBA giải mã vẫn là 24 MiB. Bản xem thử ưu tiên giữ nét để owner đánh giá, chưa tối ưu dung lượng tải cho phát hành.

## Kiểm hình tại 1×

[Hồ sơ kiểm delivery](regions/review/delivery/review.json) có 57 crop pixel native trên 19 đường nối, năm bảng seam và ba đối chiếu từ chính WebP đã giải mã:

- [Bậc đá](regions/review/delivery/door-stairs-comparison.png).
- [Sân giữa](regions/review/delivery/courtyard-comparison.png).
- [Cầu phía tây](regions/review/delivery/west-bridge-comparison.png).

Ảnh trái là V1, phải là V2; mỗi ảnh dùng cùng sprite gốc, không resize nhân vật. Codex đã xem toàn cảnh, các crop seam và đối chiếu: viền, bậc, ngói, lan can rõ ở 1×, các cấu trúc lớn liên tục tại những đường nối được kiểm. Bước đánh giá kỹ thuật này không cấp quyền duyệt. Owner sau đó trực tiếp chốt ảnh trong game làm chuẩn; `approval.json` ghi `ownerApproved/artApproved: true` cho **nền bake theo đúng hash**, không xác nhận collider/footprint hoặc layer che. Helper review hiện dùng layout master cục bộ cho ảnh đối chiếu đầu vào.

Texture của lựa chọn chi tiết dùng nearest sampling để không làm mềm viền khi camera nằm giữa pixel; concept giữ linear sampling. Native geometry, camera và atlas nhân vật không đổi. Nền vẫn bake nhà/cây, chưa có nền sạch hoặc alpha mái/tán để che người.

## Tái kiểm và xuất

```powershell
# Python có Pillow + NumPy. Không gọi API trong những bước này.
python scripts/register-van-ngoc-clarity-regions.py self-test
python scripts/register-van-ngoc-clarity-regions.py stitch
node scripts/review-van-ngoc-clarity-delivery.mjs
# Xem các crop mới rồi ghi phạm vi đánh giá vào review/delivery/review.json.
node scripts/sync-hang-nhac-van-ngoc-clarity.mjs
node --test tests/unit/van-ngoc-baseline-approval.test.mjs
npm.cmd run test:hang-nhac-map-art
npm.cmd run test:hang-nhac-hud-layers
npm.cmd run build
```

Đã qua self-test đăng ký/ghép, build + TypeScript/boundary, map-art 11 nhóm và HUD/layer 14 nhóm. Hai browser smoke chạy riêng với `$env:TEST_NATIVE_GPU='1'` trên Chrome của máy; các lượt SwiftShader trước đó bị timeout khi mở/đóng hộp hoặc chụp hình. Các assertion về ảnh decode, pixel native, room/profile, input, cover và reload được giữ. Mỗi fixture có Vite cache/DB riêng. Đã xem ảnh desktop 1440 × 980 và mobile 390 × 844 của nền V2, không có lỗi trang/HTTP trong lượt đạt.

Stitch luôn đo lại toàn bộ 20 vùng, không hạ gate để nhận nguồn lệch. Review tạo crop mới với trạng thái chờ xem; sync yêu cầu hash registration/composition/nguồn, hồ sơ kiểm delivery và duyệt owner khớp đúng ảnh. Build chỉ sao chép WebP đã kiểm, không tạo ảnh hoặc chỉnh owner map. V1 và các tool riêng đã chuyển ra kho ngoài workspace; helper đo chung còn ở `scripts/map-sector-registration.py`. Đã dựng lại từ gói tự chứa sau chuyển nguồn, hash ảnh chuẩn không đổi.

Kết quả kiểm game nằm trong `output/hang-nhac-map-art/verification.json` và ảnh desktop/mobile cạnh đó. Test dùng room/DB/cache fixture riêng. Kỹ thuật và duyệt ART luôn tách biệt.
