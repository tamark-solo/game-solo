# Vân Hải · NPC và sinh cảnh đối thủ 01

**NPC motion hiện hành 13/10:** [Bốn NPC trục truyện](../../characters/van-hai-npc-motion-v2/index.html) có 96 clip / 576 pose; [sáu NPC Wave A](../../characters/van-hai-npc-wave-a-motion-v2/index.html) có 144 clip / 864 pose. Mỗi gói có tám hướng idle/talk/cử chỉ nghề; pilot Đông Nam đã duyệt theo hash, bảy hướng mới vẫn candidate. Các gói ART không tự đổi station, receipt, map hoặc DB. [Bố trí 14 NPC](placement.html) và [runtime NPC](../../../HANG-NHAC-NPC-RUNTIME.md) giữ phạm vi riêng.

**Mốc Hắc Ấn03/style người13/10:** [một neutral mới](../../characters/van-hai-dark-seal-officer-v3/index.html) so Player/02/03, dùng masterPixel02 làm input chính và giữ64×96/body80/chân32,88. World review đọc override riêng đúng ID Hắc, giữ manifestBoss02 và pinned plan/catalog nguyên. Neutral03 hiện đã duyệt theo [hash riêng](../../characters/van-hai-dark-seal-officer-v3/approval.json); [Motion01](../../characters/dark-seal-officer-animation-v1/index.html) và [Triện Thuật02](../../vfx/dark-seal-officer-vfx-v2/README.md) có trạng thái riêng, không đổi boss live hoặc quyền/gameplay.

**Boss02/feedback13/10:** [ba bản tăng uy lực](../../characters/van-hai-boss-concepts-v2/index.html) so trực tiếp với01; Lang Vương01 được duyệt neutral và giữ nguyên. World review đọc manifest02, pinned plan/catalog không đổi. Tam128/Cổ160 chỉ là cỡ ART đề xuất; Hắc80, không đổi boss live/motion/AI/thưởng. Trạng thái candidate01 bên dưới là trước feedback mới.

**Mốc boss concept13/10:** theo bước tiếp mới của owner, [bốn boss Pixel01](../../characters/van-hai-boss-concepts-v1/index.html) có một neutral Đông Nam/native/đo chân và brief motion/layer riêng; body96/104/140/80worldpx. Trang sinh cảnh đọc thêm manifest boss để hiển thị; pinned `plan.json` và catalog giữ nguyên. Tại mốc này chưa animation/VFX boss/live hoặc duyệt ART; [Lang Vương Motion01](../../characters/cloud-wolf-king-animation-v1/index.html) và Hắc Ấn là các bước tiếp nối riêng. Mốc “NPC/boss giữ brief” dưới đây là trước đợt tạo hình này.

**Mốc tiếp nối animation quái13/10:** owner chọn11concept quái/tinh anh làm basis. [Playback](../../characters/van-hai-monster-animation-v1/index.html) có440clip/2640pose,5action/tám view thật cùng [VFX9sequence](../../vfx/van-hai-monster-vfx-v1/README.md). Motion/VFX/socket là candidate mới để duyệt; chưa mở AI/drop và catalog vẫn pending; NPC/boss có gói tiếp nối riêng. Mốc ART một pose dưới đây là trước animation.
**Chuẩn NPC mới nhất 13/10:** [Vương Lâm đang dùng trong game](../../characters/van-hai-npc-visual-standard-v1/README.md) là chuẩn gốc duy nhất cho tỷ lệ/nét pixel/đổ màu; có tám hướng frame thật và hash atlas. Trần Duy v3 chỉ là NPC so sánh. Bộ v4 giữ trạng thái tạm chấp nhận.

**Mốc pilot NPC v3:** [Trần Duy sửa tỷ lệ trực tiếp từ mẫu Pixel02](../../characters/van-hai-npc-concepts-v3/index.html). Giữ v1/v2 làm đối chiếu lỗi tỷ lệ; v3 là một neutral tĩnh chờ đánh giá hình, chưa thay NPC trong game.

**Mốc bổ sung NPC13/10:** Theo yêu cầu owner, có [bố trí14NPC trên nền map](placement.html) với tên/tọa độ/lọc WaveA–B/tỷ lệ1×, và [bốn concept NPC](../../characters/van-hai-npc-concepts-v1/index.html). Điểm mới được kiểm đường đi riêng trong `placement.json`; không sửa `plan.json` nguồn hoặc authored map. Concept còn lệch tỷ lệ đầu/thân so với Pixel02, chưa ghép runtime. Trạng thái tích hợp xem [runtime NPC](../../../HANG-NHAC-NPC-RUNTIME.md).

**Mốc đợt ART13/10:** owner chuyển ưu tiên sang quái/tinh anh trước. [11 tạo hình Pixel01](../../characters/van-hai-monster-concepts-v1/index.html) có một neutral Đông Nam/actor, sprite native và đối chiếu player/map1×/2×. `plan.json` nối nguồn/prompt/hình theo11ID; art candidate chưa duyệt, bảy hướng/năm action chưa sản xuất. NPC/boss tiếp tục giữ brief, runtime/catalog chưa mở mới. Thứ tự P0–P3 dưới đây là kế hoạch tổng trước ưu tiên này.

13/10/2026 · Owner chọn **chốt dàn NPC và kịch bản/brief concept trước**. [Trang duyệt](index.html) / [dữ liệu tác giả](plan.json) / [hồ sơ kịch bản](../../../VAN-HAI-LIVING-WORLD-PLAN.md).

14 NPC (4 vai hiện có, 10 vai bổ sung), 8 quái thường, 3 tinh anh, 4 boss, 8 vật liệu ứng viên và 3 map/scene design. Tên và tạo hình sáng tạo đề xuất; không tự thành canon hoặc ART đã duyệt. Marker trên bản đồ là **khu concept**, không là spawn/nav đã xuất. Gói này không phát command, không sửa DB/map/draft, không nạp vào gameplay.

Mở [index.html](index.html) bằng Vite local trong workspace hiện tại. Chọn NPC để xem vai trò/thoại/phản ứng/brief/vùng; chọn quái hoặc boss để xem intent, đường đối phó, kịch bản và nguồn–chi. Trang có tìm tên không dấu và các reference chính thức.

`plan.json` là nguồn chi tiết; 40 record tương ứng được nối vào [sổ catalog](../../systems/content-registry-v1/catalog.json), tất cả là `unreleased/pending`. Bốn `existingStationId` giữ guide/cultivation/training/preparation hiện hành; chỉ vai trò đã chạy, danh tính mới là đề xuất. HN-E01/E02/E03, HN/EX proof và receipt hiện hành không đổi.

Art brief dùng Pixel02, người logical64×96/chân(32,88), wide canvas112×96/chân(56,88), body tối đa80worldpx/camera1×. Quái/boss có canvas/pivot riêng đo sau xuất; boss người vẫn giữ tỷ lệ người. Tách body/vũ khí/khí/telegraph/impact/shadow. Không sản xuất full sheet trước duyệt neutral native và prototype đọc đòn.

Thứ tự: P0 bốn NPC trục truyện + chủ khảo → P1 bốn vai hỗ trợ/hai đệ tử + wolf/caster/lang vương → P2 các họ quái/cơ chế mới → P3 cổ lâm, NPC waveB, hai boss truyện và luật nhóm.

**Mốc pilot NPC v2:** [Trần Duy đối chiếu Pixel02](../../characters/van-hai-npc-concepts-v2/index.html) dùng actual image reference theo skill actor. Một neutral Đông Nam, đầu lớn hơn v1 nhưng thân31px còn hẹp so basis khoảng44px. Browser6case/mobile390 đạt; ART/runtime false. [Bộ v1](../../characters/van-hai-npc-concepts-v1/index.html) giữ làm nhận diện tham chiếu; ba NPC còn lại ở v2 mới có brief/spec/prompt.

**Mốc NPC v4 · 13/10:** [Ba neutral tiếp nối Diệp Tĩnh, Tạ Kiếm Sơn, Tô Nhược](../../characters/van-hai-npc-concepts-v4/index.html) dùng Trần Duy v3 và Pixel02 làm input thật. Có raw/prompt/provenance/hash, scale và chân đã đo, native80px/canvas64×96; browser18 tổ hợp + mobile390 đạt. Tỷ lệ đầu vẫn nhỏ hơn mốc v3; Diệp còn trẻ mặt, Tô còn cần rõ bút/hộp niêm. Các giới hạn ghi riêng theo actor; owner đã tạm chấp nhận neutral v4. Motion tiếp nối ở gói V2 riêng, chưa ghép ART NPC vào runtime.
