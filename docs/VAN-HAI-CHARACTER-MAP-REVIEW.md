# Trang phục Vương Lâm trên map · cùng người, cùng camera

**Chốt tiếp nối 12/10:** owner duyệt cả [ba concept khí tức 04](design/vfx/hoa-than-aura-concepts-v4/README.md), yêu cầu giữ nguồn nhân vật để tùy biến lúc tạo hồ sơ. [Thư viện thiết kế](design/characters/character-customization-library-v1/README.md) giữ năm áo, ba khí, các bộ nguồn và archive cũ; không thay anatomy/native.

**12/10/2026 · Hóa Thần 02 — snapshot trước concept 04.** [Sinh Tử sáng hơn và khí tức chuyển động theo lớp](design/characters/wang-lin-hoa-than-review-v2/README.md) thay bản đầu trên gallery/map. Huyền Tử giữ áo, thêm ma khí phía sau/trước; [Vân Ngọc, Huyền Vân, Xích Tiêu nhập môn](design/characters/wang-lin-costume-review-v2/README.md) vẫn giữ bên dưới. Năm áo chỉ đổi vải trên đúng chibi. Mặc định Sinh Tử, camera 1×, khí/motion bật; tắt riêng để soi áo/lớp ART. Giữ người đã được xác nhận; áo/khí mới chờ đánh giá hình.

[Mở gallery](http://127.0.0.1:5174/van-hai-character-review.html) hoặc [map](http://127.0.0.1:5174/van-hai-character-review.html?view=map). Chọn **Xem … trên map** trên card để chọn bộ áo và cuộn tới map. Chọn từ menu **Mẫu mới** cũng cập nhật card; cả hai dùng chung bảng `CHARACTER_MAP_VARIANTS`. Các mẫu vẽ lại người trước không còn trong menu hoặc asset web.

## Phép so tỷ lệ

| Thành phần | Quy ước |
| --- | --- |
| World | 3072 × 2048; điểm đầu (1616,992) lấy từ release |
| Camera | 1× = 1 world px trên 1 CSS px; viewport chỉ đổi vùng nhìn |
| Frame/neo | 64 × 96, chân (32,88), cả mẫu áo mới và gốc cùng chuẩn |
| Hình người | Bounds (9,9,45,80), alpha toàn ảnh giống sprite gốc; không crop/rescale/recenter người |
| Phần được sửa | Mask 471 pixel vải; đầu/mặt/da/giày và mọi pixel ngoài mask có 0 thay đổi |
| Mốc phải | PNG đứng Nam native-v2, sao chép nguyên byte |
| Gallery | Cùng số lần phóng nguyên cho cả sáu hình ở mỗi breakpoint, pixelated |
| Khí tức Hóa Thần | Ground 96 × 32/(48,16), rear 96 × 128/(48,112), front 96 × 64/(48,48), hạt 8 × 8; pivot cùng chân, không tăng frame người |
| Nền Vân Ngọc | Concept 1536 × 1024 đặt ×2 trong world, chưa ART native |
| Nền Hằng Nhạc | Ảnh overview 3072 × 2048, không là kiểm live các part che người |

Chiếu chân theo công thức của `PreviewRenderer`: `screen = round((world - cameraCenter) × zoom + viewport / 2)`. Góc frame là `screen - (32,88) × zoom`. Hai mẫu cùng Y, cách nhau 128 world px. Tắt mốc phải thì mẫu áo mới về đúng điểm đối chiếu. Chọn áo giữ điểm, camera và zoom.

Năm điểm xem, kéo/mũi tên pan, chạm đặt điểm, bật frame/neo, recenter và **Mở lớn/Esc** chỉ thay state review trong bộ nhớ. Zoom 0,75×/1×/1,25×/1,5×/2× áp dụng đồng thời lên nền và các frame. Không ghi spawn/đường đi, owner map hoặc hồ sơ game.

## Source và Core

Mỗi bộ áo có source ImageGen/prompt riêng; chỉ dùng paint trong vùng vải để ghép lên native gốc. PNG cuối dùng RGBA lossless và màu áo riêng, giữ nguyên màu/pixel phần người. Raw source ngoài áo bị bỏ; gallery/map không dùng source có thể vẽ lại khuôn mặt.

- `core/character-map-review-state.ts`: danh mục mẫu/baseline, state, điểm xem và chiếu/ngược chiếu; đọc release, không ghi map.
- `ui/character-costume-gallery.ts`: hai card Hóa Thần + mốc gốc, ba card nhập môn, ảnh/tên theo danh mục chung.
- `ui/character-map-review.ts/.css`: vùng xem và điều khiển.
- `features/character-map-review.ts`: pointer/keyboard/ResizeObserver, không API/transport/storage/gameplay.
- Entry review nối chọn card ↔ menu map và hai toggle khí tức, giữ trạng thái đồng bộ.
- `core/character-qi-review.ts`/`ui/character-qi-layers.ts`/`features/character-qi-review.ts`: catalog/contract layer, ghép trước/sau và motion lifecycle. Xem [hướng ghép khi làm tám hướng](CHARACTER-AURA-LAYERS.md).
- `prepare-wang-lin-costume-review.mjs` và `build-wang-lin-costume-variants.mjs`: input/mask/native gói nhập môn 02. `build-wang-lin-hoa-than.mjs` và `build-wang-lin-hoa-than-qi.mjs`: áo/khí Hóa Thần 01. Sync kiểm hash cả hai gói, không khôi phục pack đã dọn.

[Bằng chứng 02](data/wang-lin-costume-review-v2-verification.json): sáu viewport/36 bố cục/1026 kiểm, gallery/map/zoom/frame/neo/controls và source-public-dist hash. Không lỗi, request asset đã dọn, API/WebSocket game hoặc storage writes trong profile test. Typecheck/boundary và Vite build qua; kiểm kỹ thuật không tự duyệt thiết kế áo.

[Bằng chứng Hóa Thần 01](data/wang-lin-hoa-than-review-v1-verification.json): sáu viewport/48 bố cục/1368 kiểm, năm áo và mẫu gốc, toggle khí hai chiều, trùng pivot người/khí ở các cỡ hiển thị. Source/prompt/input/native/public/dist hash và 0 pixel người bị đổi; typecheck/build qua. Đã xem gallery desktop/mobile và map 1×/khí 1×/2×.

[Bằng chứng Hóa Thần 02](data/wang-lin-hoa-than-review-v2-verification.json): sáu viewport/48 bố cục/1428 kiểm, motion thực sự đổi theo thời gian, thứ tự lớp, pause/resume/offscreen/offline/reduced motion và giữ chân/camera/người. Pixel/hash/brightness Sinh Tử trước–sau và typecheck/build qua; [ART/prompt/source](design/characters/wang-lin-hoa-than-review-v2/README.md) lưu riêng.

## Dọn và phạm vi

[Biên bản 12/10](data/character-study-cleanup-2026-10-12.json) ghi sáu gói thử cũ và bảy builder đã dọn, ZIP 72 file kiểm hash để khôi phục nguồn. Các README cũ chỉ là điểm truy lịch sử, không chứa ART đang dùng. Giữ nguyên native-v2 Vương Lâm, bảng nhận diện áo xám/đỏ đã duyệt, map/blocker/DB/bản nháp của owner.

Năm bộ hiện chỉ pose đứng Nam, chưa đứng nhiều hướng/đi/cast hoặc trang phục gameplay. Khí 02 là texture theo layer với chuyển động presentation, chưa atlas FX vẽ từng frame hoặc hợp đồng VFX R01/trạng thái chuyển đạo. Mask từng pose khác cần làm riêng trên đúng bộ gốc. Tích hợp động tác/layer phải kiểm theo [Skill Core](SKILL-CORE.md), không thay atlas 20 frame bằng một ảnh hoặc đổi ID/roster/save chỉ từ review áo.
