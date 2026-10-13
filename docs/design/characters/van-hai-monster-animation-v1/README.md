# Quái và tinh anh · animation Pixel01

**Thử cụm13/10:** [sân nhóm](cluster.html#preset=escort&actor=jade-guard&count=6) có cùng loài/hỗn hợp/tinh anh dẫn đàn,3–18con, salvo/lệch nhịp và full/managed FX. [Cách kiểm/kết quả](CLUSTER-REVIEW.md) ghi body/VFX nguyên byte, canonical-frame cache và giao pixel người chơi. Review riêng, không xuất spawn/AI/map hoặc áp alpha budget vào live.

**Tiếp nối VFX02 ·13/10:** owner đánh giá tốt bộ body; [basis pin3.171file](../../vfx/van-hai-monster-vfx-v2/body-basis.json) giữ catalog/native/atlas/source/registration nguyên byte. [Khí thuật02](../../vfx/van-hai-monster-vfx-v2/README.md) có33sequence/198frame charge/release/contact riêng11loài, ba tinh anh không dùng chung vệt thường. Review dùng02 mặc định, chọn01 để so cùng body/tuổi; canvas thêm cao khi cần giữ vệt, không phóng actor. VFX02/socket/live gameplay chưa suy duyệt từ feedback body. Các đoạn nói motion/VFX chờ duyệt dưới đây giữ mốc bàn giao trước phản hồi này.

13/10/2026 · Owner chọn bộ neutral trước và yêu cầu animation/VFX cho cả dàn. [Trang playback](index.html), [catalog](catalog.json), [basis 22 hash](basis.json), [registration nguồn](source-registration.json), [socket candidates](socket-registration.json), [VFX riêng](../../vfx/van-hai-monster-vfx-v1/README.md).

**11 actor: 8 quái, 3 tinh anh; 440 clip / 2.640 pose action.** Mỗi actor có idle, move, attack, hit, death ở tám view thực, sáu pose/clip. 88 sheet nguồn còn có sáu neutral/view để kiểm tỷ lệ. Không mirror hoặc dùng một view làm tám hướng. Motion/VFX là bản để duyệt hình: `artApproved=false`, `runtimeConsumable=false`. Gameplay hiện hành Lang02/Khôi Lỗi02 giữ riêng; bộ này chưa nối AI, damage, loot hoặc respawn.

| Actor | Body mục tiêu | Lift | Thuật / tín hiệu |
| --- | --- | --- | --- |
| Vân Nha Lang | 50px | 0 | Cắn, crescent khí ngọc ngắn |
| Phù Mộc Tinh | 58px | 0 | Niệm phù, tia lá ngọc |
| Ngọc Giáp Trùng | 46px | 0 | Kẹp trước, vệt càng |
| Mặc Dực Bức | 42px | 16px | Sà tới, vệt mực |
| Khôi Lỗi Rạn Ngọc | 72px | 0 | Đấm, mảnh đồng/ngọc |
| Thực Linh Khuẩn | 48px | 0 | Phồng mũ, vòng bào tử |
| Tán Tu Hắc Phù | 80px | 0 | Thi triển hắc phù; dao rời |
| U Niệm | 58px | 8px | Lõi tụ khí, tia ngọc/mực |
| Lang Tuần Sơn | 65px | 0 | Cắn rộng, windup dài hơn |
| Thiết Giáp Linh Trùng | 62px | 0 | Kẹp nặng, hồi thế chậm |
| Phù Sư Hắc Lụa | 80px | 0 | Niệm hắc phù, ba thẻ phù rời |

## Nguồn và registration

Mode **built-in ImageGen**; [88 prompt](prompts/) ghi identity input và hướng. `sources/` giữ RGBA gốc; `generation/` ghi tool/output/input hash. Sheet sai hướng hoặc thiếu hàng được giữ trong `rejected/` và thay có chọn lọc. Không chạy prepare/generation để verify hoặc đóng gói lại.

Analyzer đo các connected body/part, giữ phụ kiện thân và toàn bộ ribbon U Niệm, mask component của ô khác; không chia đều ảnh rồi crop mù. Body alpha phân loại ≥210, RGB nguồn không tô lại. VFX không dùng ngưỡng body. `cutouts/` ghi sourceRect, component IDs và foreign pixels. Một scale/view từ median sáu neutral dùng cho tất cả action; **không fit riêng mỗi pose**. Nearest sampling ghi `pixelsResampled=true`; U Niệm Đông Nam đo median56,5px sau quantization so mục tiêu58, không kéo giãn để che sai số.

Canvas tất cả action/view của một actor = canvas concept + (96,32), chân = pivot concept + (48,16). Đây là padding cho đòn/cánh/xác nằm, không thay tỷ lệ thế giới, collider hoặc hợp đồng player64×96. Mốc chân dựa soles của neutral theo cột và support plane action; corpse dùng mặt tiếp đất rõ ràng. Lift dơi/U Niệm là metadata, giảm khi chết; bóng đất riêng.

24fps với durations/phase bằng milliseconds trong catalog; idle/move loop, hit/attack one-shot, death giữ pose cuối. Mỗi atlas có gutter2px và canonical frame tương ứng. Attack ready→warning→release→recovery dùng hold timings riêng cho thường/tinh anh. Các timing này phục vụ ART, **chưa khóa luật combat**.

Socket dùng điểm skin/core đo được hoặc anatomical projection trên opaque body; có witness/method/status mỗi frame. Tay bị che và grip prop là candidate, cần xem lại khi bind actor. Không coi centroid/bbox là skeleton đã duyệt. Body/held prop/emitter/release/contact/shadow độc lập.

## Playback và bàn giao

Trang dùng clock Core hiện hành, camera1×/2×/3×, tám view đồng thời, scrub/play/terminal death, nền map/sáng/tối và layer toggles. `Trúng/Hụt/Hủy` là **facts fixture**, release tách contact và hủy trước release không phát FX. Warning cone/line/radial theo họ, không phải vùng damage đã xuất. FX release khóa origin ở pose release, không kéo theo bàn tay trong recovery. Prop chọn thứ tự trước/sau body và rơi tách khi chết.

Hidden/offline/reduced motion dừng clock. Cache decoded actor/FX giới hạn16MiB; ledger không bao gồm map/browser cache/GPU. Đây không phải benchmark MMO đông người. Màn nhỏ giữ canvas native, cuộn trong vùng review. Trang không gọi API game hoặc ghi storage/map/DB.

Đóng gói scoped, không chạy owner map builder:

```powershell
node scripts/analyze-monster-sheets-v1.mjs
python scripts/pack-monster-animation-v1.py
python scripts/measure-monster-sockets-v1.py
python scripts/pack-monster-vfx-v1.py
python scripts/verify-monster-animation-v1.py
npm.cmd run test:monster-animation-review
```

Python cần Pillow/NumPy. Nguồn PNG/crop đã lưu; không cần ImageGen/API key khi pack/verify. Cần duyệt native motion, socket/prop và nhịp đòn trước scoped runtime integration; damage/hit/loot về sau phải theo server facts, không phát từ callback animation.
