# Vương Lâm · ba trang phục trên cùng chibi gốc

**12/10/2026 · chờ đánh giá trang phục.** Owner xác nhận cách giữ người gốc đã đúng, nhưng áo thử trước chưa đẹp; yêu cầu thêm một vài bộ và dọn asset cũ. **Chấp nhận giữ người không đồng nghĩa duyệt áo.** Ba bộ mới đều có `ownerApproved: false`, `artApproved: false`.

**Tiếp nối cùng ngày:** [Hai bộ Hóa Thần 01](../wang-lin-hoa-than-review-v1/README.md) đã thêm vào cùng gallery/map, dùng đúng người và mask gói này. Ba áo nhập môn giữ phần so sánh riêng; sync hiện hành phục vụ cả hai gói.

[Mở gallery](http://127.0.0.1:5174/van-hai-character-review.html): Vân Ngọc, Huyền Vân, Xích Tiêu đứng cạnh áo xám hiện hành ở cùng mức phóng. Mỗi nút **Xem … trên map** chọn đúng bộ ở map camera 1×; chọn từ map cũng cập nhật card. Mẫu gốc luôn là phía phải trên map.

## Ba thiết kế

| Bộ | Hướng thiết kế | PNG cuối | Source ImageGen | Prompt chính xác |
| --- | --- | --- | --- | --- |
| Vân Ngọc | Áo ngà sáng, cổ/cổ tay nẹp ngọc sâu, viền vải đồng mảnh | [van-ngoc.png](van-ngoc.png) | [source](van-ngoc-source.png) | [prompt](van-ngoc.prompt.txt) |
| Huyền Vân | Áo xanh mực, cổ tay bạc ngà, nét mây ở tà áo; phân mảng tối/sáng rõ | [huyen-van.png](huyen-van.png) | [source](huyen-van-source.png) | [prompt](huyen-van.prompt.txt) |
| Xích Tiêu | Áo đỏ trầm, cổ/lớp trong ngà và nẹp đồng ấm | [xich-tieu.png](xich-tieu.png) | [source](xich-tieu-source.png) | [prompt](xich-tieu.prompt.txt) |

Mỗi bộ có một lượt vẽ riêng bằng skill **imagegen**, công cụ **built-in image_gen**. Đây là ba thiết kế vùng vải/panel/viền khác nhau, không dùng code đổi màu của một ảnh để giả ba source. Tên bộ là nhãn ART để chọn mẫu, chưa vật phẩm/cảnh giới/quyền mặc hoặc chỉ số gameplay.

## Khóa phần người

Nguồn người là [Vương Lâm native-v2 đứng Nam](../wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_south.png), SHA256 `ae9cfddb7505b91bc0225942841f1e65df13d7e8913da62380c09997ad53a325`. Bộ đứng/đi/cast game không thay đổi.

- Frame **64 × 96**, neo **(32,88)**, bounds **(9,9,45,80)**, camera mặc định **1×**.
- Cả ba giữ nguyên alpha từng pixel, đầu/mặt, da, giày và mọi pixel ngoài mask vải. Mỗi bộ có **0** thay đổi trong các vùng được khóa.
- Mask có **471** pixel vải, cả ba thay **471** pixel trong vùng đó; không resize body, crop theo bounds source hoặc recenter người.
- PNG **RGBA lossless**, alpha **0/255**. Giữ nguyên màu của phần người; palette màu áo riêng, tổng màu dùng: **32 / 34 / 34**.
- Một pose đứng Nam. Mask chỉ đúng cho pose này, không áp nguyên mask vào các pose đi/cast khác.

`scripts/prepare-wang-lin-costume-review.mjs` chuẩn bị [edit target 16×](edit-target-16x.png), [mask native](garment-mask.png), [mask 16×](garment-mask-16x.png), [guide](garment-region-guide.png) và [vùng sửa](edit-regions.json). Các input chỉ phóng nearest; guide màu xanh là chẩn đoán vùng vải, không là áo mới.

`scripts/build-wang-lin-costume-variants.mjs` đọc [variants.json](variants.json), lấy mẫu từng source theo **toàn frame** và ghép vùng paint của ImageGen vào bản sao native gốc theo mask. Pixel source ngoài vải bị bỏ; không dùng raw source để trình bày một khuôn mặt mới. PNG cuối được phóng nearest 8× thành các file `*-preview.png` khi cần xem nét. [Manifest](assets.json) lưu input/source/prompt/hash, palette và kiểm pixel riêng mỗi bộ.

`scripts/sync-van-hai-player-study.mjs` kiểm hash trước copy; hiện sync gói này và Hóa Thần 01. Gallery và map dùng chung `CHARACTER_MAP_VARIANTS`/`CHARACTER_MAP_BASELINE` trong Core, không tự ghép tên/ảnh theo từng màn. Feature chỉ điều khiển review, không sở hữu inventory/gameplay/transport.

## Đã dọn

Sáu gói thử cũ đã bỏ source/PNG/prompt/metadata khỏi thư mục đang hoạt động, gỡ khỏi `client/public/assets` và bản build. Chỉ giữ README báo đã dọn để các liên kết lịch sử có nơi đối chiếu. Đã bỏ bảy builder cũ; script chuẩn bị/sync hiện hành trỏ duy nhất gói 02. Gallery không còn selector/bảng nhận diện riêng hoặc hình thử bị loại.

[Biên bản dọn](../../../data/character-study-cleanup-2026-10-12.json) ghi từng file/hash và mục đã xóa. [ZIP nguồn cũ](../../../../artifacts/archive/character-studies-2026-10-12.zip) có 72 file, mỗi entry đã kiểm hash trước khi xóa bản hoạt động. Giữ nguyên bộ chibi/gameplay Vương Lâm, [bảng nhận diện đã duyệt](../wang-lin-initiation-v2.png), map/blocker và dữ liệu owner.

## Kiểm và giới hạn

[Bằng chứng](../../../data/wang-lin-costume-review-v2-verification.json): kiểm pixel/source/public/dist và mẫu gốc, sáu viewport/36 bố cục/1026 kiểm, chọn gallery ↔ map, zoom/pan/neo, card phóng đồng tỷ lệ và bảng nhận diện gốc. Không lỗi trang, request asset đã dọn, API/WebSocket game hoặc ghi storage trong profile kiểm. Typecheck/boundary và Vite build qua. Đã xem gallery desktop/mobile và áo trên map 1×.

Đây là ART trang phục đang đánh giá. Review dùng DOM/camera cùng phép chiếu, nền concept hoặc ảnh overview; chưa bộ animation hay kiểm live Three.js/mái-tán che người. Không thay avatar runtime, GDD/roster/catalog/save/backend/map/navigation. Sau khi chọn áo, nhiều hướng/động tác sẽ làm trên đúng người gốc và kiểm theo [Skill Core](../../../SKILL-CORE.md).
