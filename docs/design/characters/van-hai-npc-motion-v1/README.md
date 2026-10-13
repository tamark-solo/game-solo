# NPC Motion 01 · bốn NPC chính

Ngày 13/10/2026, đợt chuyển động đầu theo yêu cầu owner: **Trần Duy, Diệp Tĩnh, Tạ Kiếm Sơn và Tô Nhược**. Mỗi người có idle, talk và một cử chỉ nghề nghiệp, sáu pose/clip: **12 clip, 72 pose thật, hướng Đông Nam**.

Mở index.html qua Vite để phát/dừng, tua từng pose, đổi nền map/sáng/tối, xem 1×/2×/4× và so trực tiếp với Vương Lâm live ở cùng world foot. Bảy hướng còn lại và mười NPC khác chưa có chuyển động riêng trong gói này.

**Owner duyệt 13/10/2026:** “bộ này ổn đó”. approval.json pin bộ bốn NPC, ba action, 12 clip/72 pose Đông Nam. Đây là mốc nhận diện và chuyển động cho các view tiếp theo; Vương Lâm live vẫn là chuẩn người gốc. Duyệt không mở rộng sang bảy hướng chưa có, revision bị thay, NPC khác hoặc runtime. Cờ trong metadata tạo/kiểm giữ lịch sử ban đầu; trạng thái duyệt hiện hành đọc từ approval.json. Giữ nguồn/atlas đã pin; sản xuất tiếp dùng phiên bản mới.

## GDD và chuẩn hình

production-plan.json pin GDD van-hai-living-world-v1/plan.json. Idle/talk tám hướng là yêu cầu đã viết. Cử chỉ Tô Nhược kiểm hộp xuất phát trực tiếp từ brief; mở tay chỉ lối của Trần Duy, vận tay của Diệp Tĩnh và minh họa mộc kiếm của Tạ Kiếm Sơn là cách biên tập cho vai trò của họ. Nhịp 1,2 giây idle/talk, 1,5 giây cử chỉ là lựa chọn của pilot.

Image1 trong mọi request là **Vương Lâm Pixel02 lấy từ atlas đang dùng trong game**, cùng hướng Đông Nam. Identity NPC là input hỗ trợ. Neutral Trần Duy v3 và ba identity v4 cung cấp tóc, tuổi, áo và đạo cụ; Trần Duy không làm chuẩn anatomy cho NPC khác.

Nguồn mới tạo bằng router gpt-image-2, transport edits. Mỗi POST có plan riêng trong plans/; raw, metadata request, prompt, input và hash giữ trong gói. Diệp Tĩnh r1/r2 giữ làm nguồn đối chiếu; r3 được chọn. Router trả r3 **1254×1254** thay vì kích thước xin **1536×1536**, đã kiểm và giữ nguyên nguồn.

## Đóng sprite và kiểm

Human base 64×96/(32,88), neutral đứng 80px. Canvas clip **96×96/(48,88)** chỉ thêm khoảng trống cho tay/đạo cụ. registration-input.json pin 72 chân đo từ đôi đế giày và source hash. Một scale neutral duy nhất cho mỗi nguồn; không fit từng pose.

inspect.mjs kiểm thành phần alpha; register.mjs ghi tọa độ đã đo; pack.mjs tách đúng thành phần thân đã đăng ký, giữ đảo alpha nhỏ trong vùng đó và loại thân hàng xóm khi khung chữ nhật giao nhau. Pose talk giang tay của Diệp Tĩnh không lấy tóc của pose bên cạnh. Alpha128→binary, nearest một lần; registration.json ghi mapping, mask, native bounds và số pixel thân bị bỏ (0). Atlas gutter2px, kích thước600×100/clip.

Chạy:

    node docs/design/characters/van-hai-npc-motion-v1/inspect.mjs
    node docs/design/characters/van-hai-npc-motion-v1/register.mjs
    node docs/design/characters/van-hai-npc-motion-v1/pack.mjs
    node docs/design/characters/van-hai-npc-motion-v1/review/verify.mjs
    node docs/design/characters/van-hai-npc-motion-v1/review/verify-gpu.mjs

Kiểm scoped đối chiếu canonical/atlas 72 frame, input/basis/source/hash, RGBA Vương Lâm live, 108 tổ hợp NPC/action/nền/cỡ xem, 72 ô pose, 12 clip thực đổi frame, dừng/tua/đổi action và mobile390. Evidence ở review/verification.json. Kiểm Three.js/WebGL thêm72 frame với UV/pivot/alpha/nearest và12 lần đổi texture; RGBA khớp chính xác, maxColorDelta0. Evidence ở review/gpu-verification.json.

## Điểm cần chỉnh

Các điểm dưới đây đã được nêu khi owner xem và chấp nhận pilot. Giữ trong hồ sơ để cải thiện lúc mở rộng hướng; không sửa asset đã pin để che sai khác.

- Diệp Tĩnh: hàng cử chỉ vẫn thấp hơn idle khoảng3px, mặt lớn tuổi còn mềm.
- Tạ Kiếm Sơn: hàng cử chỉ thấp hơn khoảng1–2px, continuity mộc kiếm khi bị che cần xem thêm.
- Tô Nhược: hàng kiểm hộp thấp hơn khoảng1–2px, bút nhỏ và silhouette hộp đổi nhẹ.
- Trần Duy: kiểm mặt/tóc và cuối→đầu vòng lặp.

Giữ các sai khác nguồn trong review, không phóng riêng hàng hoặc từng pose để che. Body đang kèm đạo cụ cầm tay cho pilot; sản xuất tiếp cần part/socket riêng. Khí/VFX và bóng không bake vào body. Chưa nhập clip vào runtime, chưa thay station/service/gameplay/map/navigation/DB.
