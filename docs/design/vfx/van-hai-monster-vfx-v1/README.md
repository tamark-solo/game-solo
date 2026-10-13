# VFX quái và tinh anh · Pixel01

**Đã thay ở review13/10:** owner nhận xét01 thiếu đặc sắc/trải nghiệm nhạt. [Khí thuật02](../van-hai-monster-vfx-v2/README.md) có charge/release/contact riêng từng loài và tinh anh. Gói01 giữ cho lựa chọn đối chiếu, hai prop vẫn là basis đang review; không dọn nguồn hoặc tự đưa vào live.

13/10/2026 · [Playback cùng body](../../characters/van-hai-monster-animation-v1/index.html), [catalog](catalog.json), [registration](registration.json), [bảng sequence native](review/native-sequences.png).

**9 sequence × 6 frame = 54 pose**, thêm hai prop rời: dao Tán Tu và quạt ba thẻ Phù Sư. cloud-bite / wood-ray / jade-claw / ink-dive / puppet-strike / spore-ring / dark-seal / wisp-ray / jade-contact. Các họ cùng chất liệu dùng chung FX, tinh anh có body/timing riêng. 7 sequence directional xoay theo vector hợp lệ; spore-ring/contact radial. Đây là reuse VFX, không phải mirror body thành tám hướng.

Mode **built-in ImageGen**; [prompt set](prompts/) và RGBA gốc trong `sources/`, tool/output/input hash trong `generation/`/catalog. Native nearest giữ alpha mềm, lõi sáng, smoke và mảnh rời; không áp ngưỡng binary của body, không tô RGB hoặc tổng hợp pose. Trích sáu vùng bằng khoảng trống đo từ nguồn (alpha≥4 để tìm gutter), giữ toàn bộ alpha bên trong vùng. Origin đo luminous core cho directional, tâm logical cell cho radial; một scale cho toàn sequence. Emitter/prop grip hiện là candidate để review.

30fps, sáu frame/sequence, không loop; atlas gutter2px. Body, ground warning, held prop, release và contact là layer riêng. `jade-contact` chỉ hiện khi fixture cung cấp hit; hụt/hủy không sinh contact. Review không phát damage/server command. Clock Core và origin release dùng chung tuổi action, không tạo timer độc lập cho mỗi layer.

`scripts/pack-monster-vfx-v1.py` chỉ đóng root này; `scripts/verify-monster-animation-v1.py` kiểm source/prompt/input hash, alpha mềm, canonical/atlas parity và completeness. Motion/VFX mới chờ duyệt: `artApproved=false`, `runtimeConsumable=false`. Chưa là bộ boss/loot/progression hoặc benchmark GPU.
