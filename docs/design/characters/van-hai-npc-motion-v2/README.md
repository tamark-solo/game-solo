# NPC Motion 02 · mở rộng tám hướng

Tiếp nối owner đồng ý ngày 13/10/2026 sau khi duyệt pilot Đông Nam của bốn NPC: Trần Duy, Diệp Tĩnh, Tạ Kiếm Sơn và Tô Nhược. Đã đóng đủ idle/talk/cử chỉ nghề × 8 hướng × 6 pose: **96 clip/576 pose**, gồm 12 clip/72 pose Đông Nam đọc nguyên byte từ V1 và 28 nguồn hướng mới tạo 84 clip/504 pose. catalog.json.coverage ghi đủ 32 view, không thiếu hướng. Bảy hướng mới đang ở trạng thái ứng viên để owner xem ART/chuyển động.

Mở index.html qua Vite để chọn NPC, hướng và động tác, phát/dừng/tua, xem từng pose, nền Vân Ngọc/sáng/tối và native1×/2×/4×. Trang đọc coverage thật từ catalog; chưa có nguồn sẽ hiện thiếu và khóa playback tương ứng. Vương Lâm bên cạnh và trong ma trận luôn là frame live cùng hướng.

## Phạm vi duyệt

Bộ Đông Nam đã duyệt theo107hash trong V1/approval.json. V2 chỉ tham chiếu các frame/atlas đó, không ghi lại hoặc đổi bitmap. Approval không mở rộng tự động sang bảy hướng mới hoặc runtime. Các nguồn mới là candidate chờ owner xem hình/chuyển động; kiểm kỹ thuật không thay ART review.

Khi tạo neutral hoặc view mới, **Image1 là Vương Lâm Pixel02 live cùng hướng**, giữ chuẩn gốc anatomy người, nét pixel, đổ màu và camera. Nhận diện/phục trang/đạo cụ của chính NPC nằm ở input hỗ trợ; không dùng NPC khác làm chuẩn hoặc nối chuỗi NPC→NPC. Các hướng là view vẽ thật, không mirror bitmap.

Riêng request có referencePolicy.stage = "action-correction" được phép lấy **nguồn cũ của cùng NPC, cùng hướng làm Image1 để chỉnh động tác**, và Vương Lâm live cùng hướng ở Image2 vẫn là **chuẩn PRIMARY anatomy/style**. Policy phải pin file/hash edit target, primaryStyleImageIndex: 2 và ý định giữ neutral/camera. Nguồn cũ phải có provenance tạo ban đầu Wang-first, nằm trong sourceRevisions, và toàn bộ input còn đúng hash. Đây là sửa action của actor đã xác định, không chuyển chuẩn style sang NPC hay tuyên bố neutral mới nguyên pixel. pack.mjs kiểm thứ tự input theo từng stage, ghi policy/index vào source record; nguồn sửa vẫn phải qua xem hình, đăng ký chân và review native.

## Nguồn và phép đo

production-plan.json pin GDD/basis, các actor/request/input/prompt/hướng. plans/ giữ plan mỗi request; raw/ giữ PNG, request metadata, hash/kích thước thật. Router gpt-image-2/edits thường trả1254×1254 thay1536×1536; giữ đúng bitmap và cảnh báo. Source sửa có revision riêng, giữ nguồn bị thay và lý do; không ghi đè V1.

inspect.mjs tạo componentguide và đề xuất root; review/root-review.mjs tạo strip2× theo dải tiếp đất của đôi giày. Người thực hiện xem nguồn/strip và xác nhận từng ID bằng confirm-registration.mjs. Gợi ý không tự trở thành phép đo hoặc duyệt ART.

Mỗi source một scale từ neutral80px. Clip96×96/pivot48,88 chỉ padding so humanbase64×96/(32,88). Component mask giữ toàn thân/chi tiết rời đã đo, không lấy pose lân cận dù khung chữ nhật giao nhau; alpha128→binary, nearest một lần, không fit bbox hoặc scale riêng từng pose. Idle/talk1200ms lặp, profession1500ms một lần; cử chỉ giữ chân, không command/gameplay.

## Cử chỉ của Tạ Kiếm Sơn

Bốn hướng Bắc, Tây Bắc, Đông Bắc và Tây Nam có revision cử chỉ riêng để giữ kiếm gỗ và tay rõ ràng theo camera. Talk dùng gật đầu nhẹ, nhịp thở vai và khẩu hình khi nhìn thấy mặt; hai tay giữ vị trí nghỉ, kiếm hướng xuống cùng tay/cùng bên thân. Profession là trình diễn kiểm soát cổ tay: nghiêng kiếm ra ngoài khoảng 10° rồi 20°, giữ và thu về ở bên sườn nhìn thấy. Đây vẫn là ý định hướng dẫn kiếm thuật của GDD; talk không bắt buộc giơ lòng bàn tay, và việc biểu diễn cổ tay không cần quét kiếm qua eo.

Các revision yêu cầu pose vẽ thật trong nguồn mới, giữ chân và một tỷ lệ neutral. Ở góc nhìn sau, thân áo phải che các bàn tay/đạo cụ nằm trước bụng đúng giải phẫu; không vẽ bàn tay, kiếm, hộp hoặc bút xuyên giữa lưng để làm cử chỉ dễ thấy. Kiếm phải giữ cùng tay, nhân vật giữ hướng trong lúc nói chuyện; kết quả còn cần kiểm từng pose và playback. Lý do và phạm vi adaptation được lưu trong request gestureAdaptation cùng lịch sử nguồn.

Mô tả tổng cử chỉ Trần Duy dùng hướng nhìn của chính nhân vật, thay vì cố định xuống phải cho mọi camera. Prompt tạo ảnh lịch sử giữ nguyên để tra provenance; góc nhìn của nguồn chọn được kiểm trực tiếp với Vương Lâm cùng hướng.

## Kiểm scoped

    node docs/design/characters/van-hai-npc-motion-v2/inspect.mjs
    node docs/design/characters/van-hai-npc-motion-v2/review/root-review.mjs --ids <IDs cụ thể>
    node docs/design/characters/van-hai-npc-motion-v2/confirm-registration.mjs --ids <IDs đã xem> --confirm
    node docs/design/characters/van-hai-npc-motion-v2/pack.mjs
    node docs/design/characters/van-hai-npc-motion-v2/review/verify.mjs --require-full
    node docs/design/characters/van-hai-npc-motion-v2/review/verify-gpu.mjs --require-full

pack --partial chỉ phục vụ review trung gian với thiếu hướng được ghi rõ. GPU kiểm Three UV/pivot/alpha/nearest/texture swap từng frame; browser kiểm canonical/atlas/gutter, pose/playback/seek/loop/đổi hướng, đối chiếu Wang cùng hướng, lifecycle/reduced motion/mobile390. Evidence ở review/verification.json và gpu-verification.json, kết quả ghi đúng số frame hiện có.

## QA nguồn và lịch sử router

Kiểm đầy đủ đã qua: 576 canonical/atlas/gutter/contact pose; 96 clip có thay đổi hình thực; 32 cặp neutral/Vương Lâm cùng hướng; 864 tình huống scene/zoom; mobile390, phát/dừng/tua/đổi hướng, hidden/offline/reduced motion. Three.js kiểm 576 frame và 96 lần đổi atlas, alpha khớp từng pixel, sai lệch màu tối đa0. Cả107 file đã pin của V1 và tám frame Wang live giữ đúng hash. Hồ sơ bàn giao theo hash tại review/delivery.json.

Giới hạn hình còn cần owner xem: Tô Nhược Tây Nam hơi thiên về chính diện hơn Wang; động tác nghề quay lưng phần lớn bị thân áo che đúng góc nhìn; bút, sẹo mày và nét cầm kiếm nhỏ ở native. Chi tiết theo từng nguồn nằm trong source-assessment và snapshot đã pin trong registration-input.json. Sau bốn NPC trục truyện, Wave A còn Bạch Chỉ, Tống Thiết, Hứa Hành, Đinh Sóc, Kỷ An và Phùng Dã; Wave B có Lục Văn, A Ly, Mạc Bà và Tiểu Nghiên.

review/source-assessment.json ghi hash và từng hướng thực sự đã xem, góc front/back/profile trong cả18pose, continuity và các sai khác nhỏ. review/diep-tinh-east-face-audit.png/json minh họa far-eye ở nguồn bị loại. File này không duyệt hình.

Nguồn profile hoặc vị trí tay/đạo cụ sai được sửa riêng theo plan mới. Một POST sửa Bắc của Diệp Tĩnh lỗi JSON HTTP 200 không lưu ảnh; owner cho phép “Gửi lại một lần”, hạn mức riêng ghi review/diep-tinh-north-retry-authorization.json. Lượt được phép đã trả PNG mới; hash/metadata giữ riêng.

Sau đó owner cho phép **“Tối đa 1 lần mỗi lượt lỗi JSON”**, chỉ áp cho các request V2 còn lại trong review/json-retry-policy.json. generate-sequence.mjs chỉ gửi lại tối đa một lần khi lỗi đúng chuỗi Router returned invalid JSON (HTTP 200), giữ nguyên prompt, model gpt-image-2 và transport. Hạn mức được ghi theo ID + source revision + prompt hash trước lần gửi lại. Các lỗi khác dừng sequence; không mở retry vô hạn hoặc áp quyền này sang gói khác. Tool router chung không được sửa để tự retry.

Chưa tích hợp runtime, dịch vụ NPC/receipt/quest/combat, map/camera/navigation/blocker/DB. Body pilot đang kèm đạo cụ cầm tay; socket/part/VFX/animation adapter vẫn là bước tiếp theo.
