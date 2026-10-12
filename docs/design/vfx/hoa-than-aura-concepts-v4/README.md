# Ba ý tưởng khí tức Hóa Thần · 04

**12/10/2026 · owner chốt cả ba concept mỹ thuật.** [Biên bản duyệt](approval.json) giữ nguyên lời xác nhận và hash của đúng ba bản đã xem. [Nghiên cứu/reference/cách áp dụng](../../../HUA-THAN-AURA-RESEARCH-V4.md) và [bảng so sánh](http://127.0.0.1:5174/van-hai-character-review.html#qi-concept-review). Ba ảnh đều được sinh riêng bằng **built-in image_gen**, alpha thật; không vẽ lại người hoặc dùng asset game tham khảo.

| Hướng | Native / người ghép để so | Source / prompt chính xác |
| --- | --- | --- |
| Luân Sinh Tử | [plate](sinh-tu-wheel.png), [preview 4×](sinh-tu-wheel-preview.png) | [source](sinh-tu-wheel-source.png), [prompt](sinh-tu-wheel.prompt.txt) |
| Kiếm Vực Huyền Ngọc | [plate](jade-sword-domain.png), [preview 4×](jade-sword-domain-preview.png) | [source](jade-sword-domain-source.png), [prompt](jade-sword-domain.prompt.txt) |
| Huyết Nguyệt Ma Vực | [plate](blood-moon-domain.png), [preview 4×](blood-moon-domain-preview.png) | [source](blood-moon-domain-source.png), [prompt](blood-moon-domain.prompt.txt) |

[Manifest](assets.json) có hash source/prompt/native, kích thước nguồn, đăng ký ellipse đất, resize/offset, bounds alpha và nguồn người. [Concepts](concepts.json) lưu brief/nhãn/màu/đạo. Source đều 1122 × 1402; không được gọi là ảnh vẽ trực tiếp ở native. Export uniform scale/soft alpha, cùng canvas **128 × 176**, pivot **(64,152)**. Người nguyên PNG 64 × 96, pivot (32,88), ghép (32,64) trong canvas plate. Mọi pixel opaque phần người trong ảnh ghép được so với PNG gốc; zero changes.

`scripts/build-hoa-than-aura-concepts.mjs` xuất plate/preview và lưu manifest; `scripts/sync-hoa-than-aura-concepts.mjs` chỉ kiểm hash/copy plate web, được gọi từ sync review hiện hành. Trước khi xuất lại nguồn khác, đăng ký/xem lại tâm ellipse và native crop; không dùng tâm ảnh làm chân. Preview ghép người chỉ để QA; web dùng người và FX là hai ảnh riêng.

Đã xem đăng ký chân ở cả ba preview native và map 1×. [Kiểm chứng](../../../data/hoa-than-aura-concepts-v4-verification.json) có source/prompt/public/dist hash, pixel người, năm viewport/35 layout/158 kiểm, gallery/select/body/motion cũ/toggle và frame/neo ở 1×/2×. Không lỗi trang, API/WebSocket game hoặc storage writes trong profile QA. Typecheck/boundary/build qua.

`ownerApproved/artApproved: true` cho ba concept tĩnh đúng hash; `productionApproved: false`. [Thư viện nhân vật](../../characters/character-customization-library-v1/README.md) giữ nguồn cho tùy biến/diện mạo. Builder đọc biên bản duyệt và không giữ duyệt nếu source/prompt/plate/body đổi hash. Chỉ concept static backplate, chưa split ground/rear/front atlas, motion sản xuất hoặc ghép Three runtime. Không thay hợp đồng R01, body/collider/camera game, unlock/cảnh giới/công pháp/trang bị/GDD/DB/map/blocker. Khi chọn ý tưởng, tách part có cùng canvas/pivot, thiết kế motion và kiểm native/occlusion/đông người theo [Aura Layers](../../../CHARACTER-AURA-LAYERS.md).
