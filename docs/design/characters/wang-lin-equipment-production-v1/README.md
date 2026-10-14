# Huyễn Tâm và Tịch Bạch · Sản xuất trang bị V1

Đợt đầu P1/P2/P3 tiếp nối [concept đã duyệt](../wang-lin-concept-direction-v5/approval.json) và [kế hoạch triển khai](../../../WANG-LIN-IMPLEMENTATION-PLAN.md), ưu tiên Mốc II. Mở [review](index.html) để xem tài nguyên thật trong [manifest](manifest.json), so người ở native 1×/2×/4× và thử tám cơ chế ST/AOE.

## Tài nguyên đã sản xuất

| Phần | Coverage thực |
| --- | --- |
| Neutral | 8 body Đông Nam: hai identity × Kiếm linh/Hồn phiên/Xạ Thần Xa/Thiên Nghịch Châu |
| Trang bị | 8 bộ prop riêng, lớp trước/sau và own-body hand occlusion |
| Motion Kiếm linh | 16 clip: hai identity × Đông Nam/Bắc × idle/run/ST/AOE; 97 pose, 48 neutral calibration, 8 nguồn motion được chọn |
| Gear motion | 16 track, 97 key: 8 track cast/49 key và 8 track idle–run/48 key |
| FX Kiếm linh | 10 sequence/60 frame thật, dùng chung cho hai identity trong sân fixture |
| Gameplay prototype | 8 hợp đồng: ST/AOE của bốn họ trang bị |

Clip Huyễn Tâm Đông Nam AOE có key thứ bảy hồi đứng, lấy neutral thật trong cùng nguồn và cùng scale. Metadata giữ `sourceRect` và `reuseReason`; số sáu pose trong kế hoạch là dự toán ban đầu. Sáu hướng Kiếm linh còn lại và motion Phiên→Xa→Châu chưa được sản xuất trong gói này.

## Nguồn và đăng ký

Nguồn bitmap mới dùng **ImageGen built-in**. Hồ sơ generation lưu prompt, input reference, đường dẫn kết quả và hash; các lượt r2 được chọn vẫn giữ nguồn trước đó để đối chiếu.

- [Body generation/prompt](body-generation.json) · [Body registration](body-registration.json) · nguồn tại `sources/body/`.
- [Gear generation/prompt](gear-generation.json) · [Gear registration](gear-registration.json) · nguồn tại `sources/gear/`.
- [Motion generation/prompt](motion-generation.json) · [Motion registration](motion-registration.json) · nguồn tại `sources/motion/`.
- [FX generation/prompt](../../vfx/wang-lin-sword-pilot-v1/generation.json) · [FX manifest](../../vfx/wang-lin-sword-pilot-v1/manifest.json) · nguồn tại gói `wang-lin-sword-pilot-v1/sources/`.
- [Gear tracks](gear-tracks.json) · [Gear packer](gear-track-pack.py) · [Gear QA](gear/motion/verification.json).

Body neutral dùng canvas 64×96, chân (32,88); motion dùng 112×112, chân (56,104). Canvas chỉ padding. Mỗi nguồn có một scale từ neutral calibration; không mirror body hoặc fit từng pose. Trang bị nghỉ 192×192 dùng pivot (80,160); gear motion 192×192 dùng (96,160). FX giữ canvas/pivot riêng trong manifest và alpha mềm.

Huyễn Tâm (`a`, alias nguồn cũ Huyền Tâm) và Tịch Bạch (`b`) có mặt, tóc và phục trang riêng. Wang live là căn cứ tỷ lệ người và nét pixel. Body mới thon hơn, đầu nhỏ hơn Wang theo own concept đã chọn; chiều cao 80 px không tự chứng minh anatomy đã duyệt. Review đặt hai mẫu cạnh nhau để owner đánh giá delta này.

Gear held bám socket tay thật ở từng pose. Seal/open palm chuyển sang ngự kiếm hover; release giữ origin đã khóa. Kiếm Bắc dùng cùng flat-blade template như candidate, chưa có artwork perspective riêng. Hai pose run Bắc bị che tay dùng rear-held và không nhận là grip nhìn thấy. Own-body hand occlusion chỉ lấy pixel từ đúng pose đang vẽ.

## Sân kiểm cơ chế và hình

[Core prototype](../../gameplay/wang-lin-equipment-prototype-v1/README.md) khóa điểm ngắm ở đầu cast và dùng tuổi tuyệt đối. Seek dựng lại fixture; mỗi tác động có cast/pulse/target/life/effect ID. Hủy trước release chặn contact; hủy sau release giữ facts đã xác nhận và chặn pulse tương lai. Facts trễ/lặp giữ timestamp gốc và dedup. Châu phát facts hộ đạo/control riêng, không tạo hit hoặc credit luyện công.

Vùng hình học, mục tiêu tròn và số liệu trong sân được ghi **PROTOTYPE**. Kiếm linh phát body/gear và FX bitmap từ frame thật; contact theo fact có vị trí xác nhận. Linh thể AOE là artwork cố định phía trước, chưa chứng minh tám view. Tốc độ, timing, damage và balance ở fixture chưa áp vào game.

## Kiểm tra và ảnh bàn giao

- [Browser/Three report](review/browser-verification.json): **1.543 kiểm tra qua**, **532 lượt GPU thật** gồm 375 native texture và 157 atlas UV (97 body + 60 FX), không lỗi JavaScript/request. Kiểm native 1×/2×/4×, body–gear layers, tám Core contract, seek/cancel/life/LOS/late/dedup/restore, lifecycle và responsive. Cache decoded giữ trong 16 MiB; map/reference ở ngoài LRU.
- [Verifier độc lập](review/production-verification.json): **6.656 kiểm tra qua** về PNG/hash/source/layer/registration/track/geometry và basis bất biến.
- [FX source/frame/atlas report](../../vfx/wang-lin-sword-pilot-v1/review/verification.json): **882 kiểm tra qua**. [Đánh giá hình độc lập](review/independent-art-assessment.json) ghi giới hạn candidate riêng với kết quả kỹ thuật.

Ảnh AOE hai identity cùng tuổi 1.480 ms đã xem ở native: [Huyễn Tâm 1×](review/screenshots/aoe-a-native-1x.png) · [Huyễn Tâm 2×](review/screenshots/aoe-a-native-2x.png) · [Tịch Bạch 1×](review/screenshots/aoe-b-native-1x.png) · [Tịch Bạch 2×](review/screenshots/aoe-b-native-2x.png). Ảnh đầy đủ sân: [Huyễn Tâm](review/screenshots/aoe-a-section-1x.png) · [Tịch Bạch](review/screenshots/aoe-b-section-1x.png). Thêm [grid tám neutral](review/screenshots/neutral-grid.png), [overview](review/screenshots/desktop-overview.png), [mobile](review/screenshots/mobile-overview.png) và [AOE release 1.200 ms](review/screenshots/sword-aoe-fx-native.png).

Lệnh kiểm scoped: `node docs/design/characters/wang-lin-equipment-production-v1/review/browser-verify.mjs`. Harness dùng private Chromium context và HTTP server đọc file tạm. Hồ sơ V5, owner tabs/storage/map/navigation/DB/draft/receipt và runtime giữ nguyên; không chạy map builder hoặc assets build tổng.

**Body/gear/motion/FX mới đều là candidate, chưa ART/motion/FX production approval hoặc runtime integration.** Approval concept V5 khóa 86 file vẫn nguyên byte. Gói pilot này là cơ sở review trước khi mở rộng tám hướng và các họ pháp bảo tiếp theo.
