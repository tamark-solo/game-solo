# Vương Lâm pixel02 · nền tám hướng

**Chốt/cleanup12/10:** owner đã duyệt bộ này làm production basis; [approval theo hash](../actor-animation-standard-v2/approval.json). Review thống nhất40clip/240pose không nạp bộ cũ; source không chọn/pilot/study đã [archive](../../../archive/actor-animation-pre-pixel02-2026-10-12/README.md). Catalog/canonical/source được chọn giữ nguyên; builder/record khóa ghi. Các trạng thái candidate trước đó dưới đây là lịch sử; scope runtime vẫn chưa đầy đủ.

**Ngự Phong · 12/10:** owner nhận xét **“rất tốt rồi”** về bộ này và yêu cầu làm Phong. [Wind01 /48pose tám hướng](../wang-lin-pixel-wind-v1/README.md) pin242file basis; [review gộp40clip/240pose](http://127.0.0.1:5174/@fs/C:/Users/Mark-TA/Documents/game-solo/docs/design/characters/wang-lin-pixel-wind-v1/index.html) thêm Phong với VFX/ghosts riêng. Catalog32clip/artwork ở đây giữ nguyên; danh sách chưa có dưới đây mô tả riêng pack02.

**12/10/2026:** tiếp tục sau phản hồi owner **“bộ mới khá tốt”** về [study48pose Nam/Đông Nam](../wang-lin-pixel-production-study-v1/README.md). Giữ nguyên48 PNG đó và bổ sung sáu hướng thật. [Style basis](style-basis.json) pin catalog/canonical của mốc đã xem; phản hồi tích cực dùng làm cơ sở style, không tự duyệt các hướng mới.

Mở [review tám hướng](http://127.0.0.1:5174/@fs/C:/Users/Mark-TA/Documents/game-solo/docs/design/characters/wang-lin-pixel-production-v2/index.html). Ba cột gốc tĩnh / bộ sân thử / pixel mới, native1×/2×/4×, overlay neutral cùng hướng, tự xoay tám hướng, seek từng frame, đứng→thuật→đứng và scene Three32part ởcamera1×. Nguồn gốc chỉ có bốn góc; góc chéo lấy cardinal gần để so tỷ lệ, được ghi rõ trên trang. Hai bộ animation dùng đúng góc chọn.

## Đã có / còn lại

| Động tác | Hướng | Clip / pose |
| --- | --- | --- |
| Idle / thở | Nam, Tây Nam, Tây, Tây Bắc, Bắc, Đông Bắc, Đông, Đông Nam | 8 / 48 |
| Run | Đủ tám hướng trên | 8 / 48 |
| Cast_forward · thân Kiếm Khí | Đủ tám hướng trên | 8 / 48 |
| Cast_point · thân Lôi Ấn | Đủ tám hướng trên | 8 / 48 |
| Tổng | 32 binding; không mirror | **32 clip / 192 pose** |

Chưa phải full player pack: **walk, attack1/2/3, dash/Phong, hit, death**, greeting/cultivation/recovery và nhóm cưỡi/ngự kiếm/thu thập chưa được sản xuất lại theo style02. Không lấp hướng hoặc action thiếu bằng sprite cũ trong catalog này. Sân server/live game vẫn dùng bộ trước; chỉ review mới nạp pack02. Body-only, chưa weapon/socket/VFX mới. `artApproved/ownerApproved=false` cho pack mới; không suy từ test.

## Nguồn và registration

- **ImageGen built-in**, eight selected RGBA sheets, mỗi hướng một nguồn6cột×4hàng: idle/run/forward/point. [Plan](production-plan.json), [generation](generation.json), [prompts/sources](sources/) lưu chính xác request/input/hash/file; giữ nguồn nguyên. Sáu request mới dùng master Nam + Đông Nam, guide gốc bốn hướng và [reference facings](inputs/reference-eight-facings-2x.png) chỉ cho góc/style.
- [Catalog](catalog.json) có source/registration/selectedRows, frames/rect/hash/FPS/hold/phase và coverage. [Masters](masters.json) là tám neutral PNG lấy từidle0 để đối chiếu, không thành bone/skeleton mới. Source thực1254×1254 của nhóm chính; không giả định tool trả1536 như prompt.
- Một scale theo source từ neutral calibration: standing nominal80px. Cùng scale qua cả bốn action, không fit bbox mỗi pose hoặc theo canvas. Body gốc/cỡ vật lý giữ; lunge, lean, knee lift có silhouette cao/thấp khác. **Height/bbox qua test không chứng minh anatomy/motion đẹp**; xem overlay/matrix và action switch.
- Idle/run64×96/(32,88), cast96×96/(48,88); padding cast không phóng người. Sole contour sau nearest/palette kết thúc ởpixel87, ground boundary88. Reference column root từneutral; Tây/Tây Bắc chạy dịch toànclip−2px, Đông Bắc−3px để đăng ký nguồn vào khung. Mỗi correction cố định cả sáu frame, lưu `translationNativeX/sourcePivot`; không thay scale hoặc kéo từng pose theo bbox. Không sửa collider/camera.
- Đã thử bốn sheet run gọn bổ sung, nhưng **không chọn** vì giữ motion cùng nguồn idle/cast ổn định anatomy/gait hơn; source/prompt/reason giữ trongplan, không vào frame/atlas. Root/canvas registration dùng cho pack này, không áp máy móc lên bay/death hoặc loài khác.
- Nearest, palette người gốc, body binary alpha; `pixelsResampled:true` vì nguồn lớn trích xuống native. Atlas gutter2px, copy scanline RGBA; cả các contour chạm cạnh canonical vẫn được giữ đủ, không cắt pixel. RGB/alpha atlas được so chính xác, Three được kiểm thực.

Reference khai báo PixelLab/skeleton/native pixels; công cụ đó chưa được kết nối. Pack02 là nguồn ImageGen và registration, không được mô tả là pipeline PixelLab đã triển khai. [Nghiên cứu và hướng áp dụng](../../../ACTOR-ART-REFERENCE-STUDY.md).

## Kết quả kiểm

| Kiểm | Kết quả / giới hạn |
| --- | --- |
| [Asset](../../../data/wang-pixel-production-v2-verification.json) | 192 frame, source/input/basis hashes,48 PNGmốc không đổi, atlas/gutter, sole/pivot, một body component, source scale và translation theo clip. |
| [Three GPU](../../../data/wang-pixel-production-v2-gpu-verification.json) | 192 native1× frame opaque/transparent pixel khớp CPU, không sai RGB/UV hoặc stray; SwiftShader, không đo hiệu năng máy người chơi. |
| [Browser](../../../data/wang-pixel-production-v2-browser-verification.json) | 192 seek; scene32part, quad64/96, foot worldy992, tự xoay đủ8, offline/reduced motion dừng;1366/844/390/320px không tràn trang,4× không crop pose. Không storage/DB/backend. |
| Cache review | Canvas source ≤8MiB (đỉnh~8,0MiB); atlas source RGBA ≤16MiB (đỉnh~13,4MiB trongbrowser). Không tính toàn bộ map/mask/texture clone hoặc RAM/GPU; không phải nghiệm thu H5 thiết bị thật/MMO load. |
| ART/motion | Owner đã nhận xét tốt mốc48pose;192pose và hướng mới đang review. Loop/gait/anatomy không được chấm tự động bởi các test trên. |

Nạp theo hướng đang xem, coalesce request và bỏ kết quả selection cũ; local timeline lấy elapsed theo monotonic clock, giữ phase khi tự xoay, dừng hidden/offline và reduced motion. Map renderer hiện có, giữ layer32part/nav owner; không phát lệnh cast hoặc damage từ frame.

## Tái xuất và bước tiếp

```powershell
node scripts/build-wang-pixel-study.mjs docs/design/characters/wang-lin-pixel-production-v2
node scripts/verify-wang-pixel-production.mjs
# Vite5174 chạy; không cần server fixture
node tests/smoke/wang-pixel-production-gpu.mjs
node tests/smoke/wang-pixel-production-browser.mjs
```

Builder chỉ chấp nhận hai root pack rõ ràng; export02 kiểm stylebasis trước ghi. Không gọi full assets/map builder. Generator/record chỉ cần khi tạo nguồn mới; không replay ImageGen ở build. Runtime review chỉ đọc nguồn trong workspace, path Codex tronggeneration chỉ là provenance.

Ngự Phong đã bổ sung riêng trong wind01; tiếp theo hoàn thiện walk/hit/death, rồi combo/cử chỉ từ cùng master; đo socket/trail cùng frame. Chỉ sau khi không cần trộn body cũ cho action còn thiếu mới ghép cả actor02 vào sân server, giữ gameplay facts→timeline→catalog→renderer và R01 timing. Quái/boss mới theo sau player chuẩn; không tự thêm cơ chế PvP/loot hoặc thay cân bằng từ đợt ART này.
