# Vương Lâm · Hóa Thần 02 · Sinh Tử sáng hơn, khí tức theo layer

**Presentation tiếp nối 03:** [Nhịp tụ/phát/lắng và tương tác](../../../CHARACTER-AURA-EXPERIENCE-V3.md) hiện chạy trên review, dùng nguyên ART/source/prompt gói này. Các mô tả loop/nhịp CSS dưới đây là kết quả lúc kiểm 02, được thay bằng timeline Core và hạt ellipse trơn/sau-trước. Chưa owner đánh giá trải nghiệm mới.

**12/10/2026 · chờ đánh giá ART/motion.** Owner phản hồi Sinh Tử 01 chìm, vòng khí tĩnh thiếu cảm giác tu tiên/Đọa Ma; yêu cầu hướng tách VFX khi làm sprite tám hướng. Bản 02 sửa vùng vải Sinh Tử và thêm khí sau/trước, hạt chuyển động. Huyền Tử giữ áo 01. Không tự duyệt hình từ test; `ownerApproved/artApproved: false`.

[Mở review](http://127.0.0.1:5174/van-hai-character-review.html): Sinh Tử, Huyền Tử cạnh áo xám; giữ ba áo nhập môn. Khí tức và chuyển động mặc định bật; tắt **Khí tức Hóa Thần** để chỉ so áo, tắt **Chuyển động khí** để soi texture tĩnh. Hai điều khiển gallery ↔ map đồng bộ.

## Source, prompt và output

| Mẫu | PNG cuối | Source/prompt |
| --- | --- | --- |
| Sinh Tử 02 · ngà sáng/nẹp ngọc sâu | [native](sinh-tu.png), [8×](sinh-tu-preview.png) | [source](sinh-tu-source.png), [prompt](sinh-tu.prompt.txt) |
| Huyền Tử · giữ áo 01 | [native](huyen-tu.png), [8×](huyen-tu-preview.png) | [source](huyen-tu-source.png), [prompt 01 giữ nguyên](huyen-tu.prompt.txt) |
| Khí Sinh Tử phía sau | [native](sinh-tu-back.png), [6×](sinh-tu-back-preview.png) | [source](sinh-tu-back-source.png), [prompt](sinh-tu-back.prompt.txt) |
| Sương Sinh Tử phía trước | [native](sinh-tu-front.png), [6×](sinh-tu-front-preview.png) | [source](sinh-tu-front-source.png), [prompt](sinh-tu-front.prompt.txt) |
| Ma khí phía sau | [native](huyen-tu-back.png), [6×](huyen-tu-back-preview.png) | [source](huyen-tu-back-source.png), [prompt](huyen-tu-back.prompt.txt) |
| Tàn khí phía trước | [native](huyen-tu-front.png), [6×](huyen-tu-front-preview.png) | [source](huyen-tu-front-source.png), [prompt](huyen-tu-front.prompt.txt) |

Năm source mới có năm lượt built-in **image_gen** riêng: một edit áo và bốn texture FX alpha mới. Giữ nguyên alpha khí; không dùng code vẽ giả ART. Vòng chân [Sinh Tử](sinh-tu-qi.png)/[Huyền Tử](huyen-tu-qi.png) lấy nguyên hash từ [gói 01](../wang-lin-hoa-than-review-v1/README.md). Hạt [linh quang](sinh-tu-mote.png)/[tàn huyết](huyen-tu-mote.png) được crop cơ học từ hạt tách rời trong source phía trước; tọa độ nguồn/hash trong manifest, không là lượt vẽ mới.

## Giữ người / nâng tương phản áo

[Baseline](baseline.png) giữ nguyên byte native-v2, frame 64 × 96, chân (32,88), bounds (9,9,45,80). Mask 471 pixel vải giữ từ đợt trước; hai áo có 0 thay đổi đầu/mặt/tóc/da/giày/alpha hoặc pixel ngoài mask. Không scale/recrop/recenter người, không tăng body để nhường chỗ cho khí.

Sinh Tử mới tăng mảng ngà/pearl ở cả tay áo và tà, giữ nẹp ngọc sâu; giảm diện tích tro xám. [Edit target 16×](sinh-tu-edit-target-16x.png) dùng chính Sinh Tử 01 đã ghép đúng người; [mask 16×](garment-mask-16x.png) khóa vùng sửa. Source ngoài mask bị bỏ. Huyền Tử dùng cùng source/palette/hash áo trước. PNG cuối lossless RGBA, alpha người 0/255. [Manifest](assets.json) ghi từng input/source/prompt/palette/check và layer.

## Layer / chuyển động

[Quy ước tách VFX cho tám hướng](../../../CHARACTER-AURA-LAYERS.md) mô tả ground → rear → body → front → motes; mỗi lớp có frame/pivot/attachment riêng và cùng chân world. Ground 96 × 32/(48,16); rear 96 × 128/(48,112); front 96 × 64/(48,48); hạt 8 × 8/(4,4). Canvas lớn không tăng cỡ người.

Tu Đạo: luồng ngọc bạc, vòng sáng thở, đốm linh quang. Đọa Ma: luồng xanh tím/viền huyết sắc và tàn huyết; nhịp nhanh hơn. Hai bản rear lệch nửa chu kỳ, front drift riêng, ba hạt chạy ellipse quanh chân. Vòng ellipse giữ góc camera, không xoay méo theo mặt nhân vật. Texture/chuyển động tách khỏi PNG người; **chưa atlas VFX vẽ từng frame**.

Motion pause khi hidden/offline/offscreen; reduced motion giữ ART tĩnh. Tắt chuyển động cũng giữ các lớp tĩnh. Chỉ state review trong bộ nhớ, không API/DB/storage hoặc activation gameplay.

## Xuất / kiểm / phạm vi

Chạy `node scripts/build-wang-lin-hoa-than-v2.mjs` để ghép vải, `node scripts/build-wang-lin-hoa-than-layers.mjs` để xuất rear/front và tự gọi builder mote, rồi `node scripts/sync-van-hai-player-study.mjs` để kiểm hash/copy asset review. Mỗi builder đọc source trong workspace; không chạy owner map builder hoặc thay asset skill R01.

[Bằng chứng](../../../data/wang-lin-hoa-than-review-v2-verification.json): pixel phần khóa, brightness áo trước/sau, source/input/prompt/native/public/dist hash; sáu viewport/48 bố cục/1428 kiểm gallery/map/neo/motion/lifecycle/reduced motion. Đã xem gallery desktop/mobile và map 1×/2×. Typecheck/boundary và Vite build qua. Preview motion/GIF là ghi lại review, không native atlas.

Chỉ pose đứng Nam hiện hành và motion layer trong review. Chưa animation người/áo tám hướng, Three runtime/occlusion, trang bị/quyền mặc/cảnh giới/chuyển đạo hoặc cân bằng gameplay. Không đổi GDD/catalog/roster/save/map/blocker/backend. Artwork và chuyển động cần owner đánh giá hình; kỹ thuật qua không đồng nghĩa duyệt ART.
