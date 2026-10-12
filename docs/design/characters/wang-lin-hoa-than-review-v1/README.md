# Vương Lâm · trang phục Hóa Thần 01

**Bản đầu để đối chiếu.** Sau phản hồi Sinh Tử chìm và khí tĩnh chưa sống động, gallery/map hiện dùng [Hóa Thần 02](../wang-lin-hoa-than-review-v2/README.md). Source 01 giữ để truy nguyên áo Huyền Tử/vòng chân; thông số/toggle bên dưới mô tả review 01 lúc kiểm.

**12/10/2026 · ART để so sánh, chờ đánh giá hình.** Owner yêu cầu vẽ hướng Hóa Thần sau ba bộ nhập môn. Giữ nguyên chibi hiện hành; chỉ đổi trang phục. Không suy duyệt áo hoặc khí tức từ kiểm kỹ thuật: `ownerApproved: false`, `artApproved: false`.

[Mở trang so sánh](http://127.0.0.1:5174/van-hai-character-review.html): hai bộ mới cạnh áo xám gốc, cùng mức phóng. Ba bộ [nhập môn 02](../wang-lin-costume-review-v2/README.md) nằm bên dưới. **Xem … trên map** chọn đúng bộ ở camera 1×; chọn từ map cập nhật card. **Xem khí tức Hóa Thần** bật/tắt đồng bộ gallery và map, mặc định **tắt**.

## Hai bộ áo và khí tức

| Bộ | Định hướng ART | PNG native / xem lớn | Source / prompt chính xác |
| --- | --- | --- | --- |
| **Sinh Tử · Tu Đạo** | Ngà bạc đối với tro mực; nẹp ngọc lạnh, nét mây ở cổ tay và tà áo | [áo](sinh-tu.png), [8×](sinh-tu-preview.png) | [source](sinh-tu-source.png), [prompt](sinh-tu.prompt.txt) |
| **Huyền Tử · Đọa Ma** | Xanh đen, tro lạnh, nẹp huyết đồng gọn; giữ dáng đạo bào | [áo](huyen-tu.png), [8×](huyen-tu-preview.png) | [source](huyen-tu-source.png), [prompt](huyen-tu.prompt.txt) |
| **Khí Sinh Tử** | Vòng khí ngọc bạc, dòng tối đan vào dòng sáng, tâm alpha rỗng | [vòng khí](sinh-tu-qi.png), [8×](sinh-tu-qi-preview.png) | [source](sinh-tu-qi-source.png), [prompt](sinh-tu-qi.prompt.txt) |
| **Khí Huyền Tử** | Vòng khí xanh tím, nét huyết sắc, thấp quanh chân | [vòng khí](huyen-tu-qi.png), [8×](huyen-tu-qi-preview.png) | [source](huyen-tu-qi-source.png), [prompt](huyen-tu-qi.prompt.txt) |

Cả bốn có lượt vẽ riêng bằng skill **imagegen**, công cụ **built-in image_gen**. Không lấy một áo rồi đổi màu bằng code để giả hai thiết kế. Tên áo/màu/họa tiết là đề xuất ART của game; không khẳng định là trang phục nguyên tác. Ý sinh tử dựa trên nghiên cứu trước về lĩnh ngộ của nhân vật; không thay đầu/mặt/tóc để thể hiện cảnh giới. Hóa Thần mở hướng lựa chọn Đọa Ma theo thiết kế hiện tại, không tự động biến thành Ma.

## Khóa người gốc

Nguồn: [native-v2 đứng Nam](../wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_south.png), SHA256 `ae9cfddb7505b91bc0225942841f1e65df13d7e8913da62380c09997ad53a325`. [Bảng nhận diện đã duyệt](../wang-lin-initiation-v2.png) vẫn là tham chiếu gốc; không dùng bản vẽ lại người bị loại.

- Frame **64 × 96**, neo chân **(32,88)**, bounds **(9,9,45,80)**, camera mặc định **1×**.
- Mask **471** pixel vải lấy từ gói áo 02. Cả hai áo thay 471 pixel vải; **0** pixel ngoài mask/đầu/mặt/da/giày/alpha bị đổi.
- PNG **RGBA lossless**, alpha người giữ nguyên **0/255**, 32/35 màu dùng. Không resize/recenter/crop người theo bounds của source mới.
- Source áo là input nguyên canvas **1024 × 1536**; lấy mẫu về toàn frame 64 × 96, chỉ ghép phần vải theo mask. Mọi pixel source ngoài mask bị bỏ. Gallery/map chỉ dùng PNG native cuối.
- [Edit target 16×](edit-target-16x.png), [mask native](garment-mask.png), [mask 16×](garment-mask-16x.png), [guide](garment-region-guide.png), [edit regions](edit-regions.json) và [palette](variants.json) lưu cùng source/prompt/hash trong [manifest](assets.json).

`scripts/build-wang-lin-hoa-than.mjs` ghép vải và kiểm pixel gốc; source/generated face không được dùng làm khuôn mặt mới. Mask chỉ dành cho pose đứng Nam này.

## Vòng khí tách rời

`scripts/build-wang-lin-hoa-than-qi.mjs` crop alpha source ImageGen, resample giữ soft alpha và đặt giữa canvas **96 × 32**, pivot mặt đất **(48,16)**. Vùng nhìn đo sau xuất: Sinh Tử **(3,4,90,23)**, Huyền Tử **(3,3,90,26)**; tâm alpha **0**. Không vẽ vòng khí bằng code hoặc ghép vào sprite người.

Trong review, frame người luôn 64 × 96; vòng khí đặt **(-16,72)** so với góc frame để hai pivot trùng chân (32,88). Gallery phóng cùng số nguyên, map áp cùng zoom lên hai lớp. Đây là trang trí ART **tĩnh**, không thay hợp đồng VFX R01 96 × 96/body80/neo (48,88), không phát lệnh cast hoặc chuyển đạo.

## Core / kiểm / giới hạn

Core `character-map-review-state.ts` chứa chung năm biến thể và baseline; Sinh Tử là mẫu mặc định. Presenter dựng gallery/map; feature chỉ cập nhật state review và khí tức, không transport/storage/gameplay. `sync-van-hai-player-study.mjs` kiểm hash và sync gói nhập môn 02 + Hóa Thần 01; các pack cũ đã dọn không được khôi phục.

[Bằng chứng](../../../data/wang-lin-hoa-than-review-v1-verification.json): source/input/prompt/native/public/dist hash; pixel phần người; **6 viewport, 48 bố cục, 1368 kiểm browser**. Gallery ↔ map, năm áo, toggle khí hai chiều, pivot khí/người, zoom/pan/neo, expanded/Esc và giữ mẫu gốc đều qua. Không lỗi trang/request asset đã dọn/API/WebSocket game/ghi storage trong profile kiểm. Typecheck/boundary và Vite build qua. Đã xem áo gốc/two variants ở gallery desktop/mobile và map 1×, khí tĩnh 1×/2×.

Chỉ một pose đứng Nam và hai vòng khí tĩnh; chưa animation/cast/đa hướng, chân dung hoặc kiểm live Three.js/mái-tán che người. Không đổi avatar game, unlock cảnh giới, GDD/catalog/roster/profile/save/backend hay dữ liệu owner map/blocker. Khi owner chọn hướng áo, bộ pose/animation tiếp theo phải bám đúng người gốc và kiểm theo [Skill Core](../../../SKILL-CORE.md).
