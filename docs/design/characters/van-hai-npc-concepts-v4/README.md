# Ba NPC v4 · theo Vương Lâm Pixel02 và Trần Duy v3

**Chỉ dẫn mới nhất 13/10:** owner yêu cầu lấy [Vương Lâm đang dùng trong game](../van-hai-npc-visual-standard-v1/README.md) làm chuẩn gốc. Trần Duy v3 chỉ là NPC so sánh. Các mô tả dùng v3 làm basis ở mốc trước là lịch sử trước chỉ dẫn này; raw/prompt/input/hash cũ giữ nguyên.

**Phản hồi owner 13/10:** “vẫn chưa ổn lắm nhưng thôi tạm chấp nhận được.” [Hồ sơ theo hash](owner-feedback.json) ghi tạm chấp nhận ba concept tĩnh v4, còn thiếu chất lượng hình; chưa full ART/motion/runtime approval. Trần Duy v3 vẫn là basis tỷ lệ/phong cách.

Gói tiếp nối ngày 13/10/2026 cho Diệp Tĩnh (`NPC-HN-CULTIVATION`), Tạ Kiếm Sơn (`NPC-HN-TRAINING`) và Tô Nhược (`NPC-HN-PREPARATION`). Mỗi người một neutral Đông Nam. [Trang đối chiếu](index.html) đặt từng NPC cạnh Vương Lâm Pixel02 hiện hành và Trần Duy v3 trên nền Vân Ngọc V2, sáng hoặc tối, ở đúng 1×/2×.

Chủ dự án đã xác nhận Trần Duy v3 giống tỷ lệ và concept của Vương Lâm trong game. Phạm vi xác nhận đó được pin theo hash trong `production.json` và `registration.json`; đây là basis tỷ lệ/phong cách để làm các NPC khác. Ba concept mới vẫn chờ xem hình riêng, với `ownerApproved`/`artApproved`/`runtimeConsumable` false. Một neutral tĩnh chưa tính là clip idle.

Theo [skill đã lưu](../../../skills/game-actor-animation-production/SKILL.md), ảnh mẫu thật được gửi cho router theo thứ tự ghi trong metadata mỗi nguồn. `inputs/references.json` pin ảnh Pixel02, Trần Duy v3 và các nguồn nhận diện/phục trang. `pack.py` kiểm hash input, router output và mốc đo trước khi ghi frame native. Gói giữ raw, prompt, input, router metadata và guide đo nguồn để đọc lại quyết định.

Canvas người mặc định 64×96, chân (32,88), body nominal 80px. Khi một đạo cụ thật sự cần thêm khoảng trống, canvas112×96/chân(56,88) chỉ tăng padding. Scale được đo từ neutral một lần cho toàn bộ nguồn, nearest một lần; tool giữ RGB và không fit đầu, vai hoặc từng bộ phận. Mốc chân phải có witness và căn cứ bằng sole/ground đã nhìn trong ảnh, cùng hash nguồn còn đúng. Alpha native phân loại ở 210 theo policy ghi trong registration; nguồn gốc giữ nguyên, palette native cần xem trên nền sáng/tối.

Chiều cao80px và tỷ lệ box đầu hỗ trợ đối chiếu kỹ thuật. Đánh giá phong cách vẫn xem tóc, mặt, vai, thân, phục trang và nét pixel cạnh hai basis ở cỡ chơi. Bảng `review/lineup-2x.png` gồm năm cột: Vương Lâm, Trần Duy v3, Diệp Tĩnh, Tạ Kiếm Sơn, Tô Nhược. Bóng xem thử được vẽ riêng với sprite. Trang này chỉ xem ART, không phát command hoặc lưu gameplay.

Quy trình cục bộ:

1. Có `production.json` và raw, chạy `python docs/design/characters/van-hai-npc-concepts-v4/pack.py --inspect` để xuất guide / bounds; nguồn chưa về được báo thiếu.
2. Đo `review/source-measurements.json` trên đúng hash: source pivot, witness, body top, head bounds và nhận xét hình.
3. Chạy `python docs/design/characters/van-hai-npc-concepts-v4/pack.py` sau khi cả ba nguồn / mốc đo đủ. Tool chỉ ghi root v4.
4. Chạy `node docs/design/characters/van-hai-npc-concepts-v4/review/verify.mjs` để kiểm hash, 18 tổ hợp ba NPC × ba nền × hai mức zoom, toggle và màn390px. Verifier dựng server tĩnh riêng, không backend/DB/map write.

Kết quả kỹ thuật và ảnh chụp nằm trong `review/verification.json`, `review/*-map-1x.png`, `review/*-map-2x.png`, `review/desktop.png` và `review/mobile.png` khi verifier đã chạy. Syntax check của Python / JavaScript chỉ chứng minh script đọc được; kết quả trình duyệt được ghi sau khi gói đủ dữ liệu.

Bảy hướng thật, idle/talk/gesture, gait/tương tác và prop/socket rời là phần tiếp nối sau đánh giá neutral. Phạm vi gói này chưa có animation hoặc runtime integration. Tooling chỉ đọc basis và nền đối chiếu; giữ nguyên ART Vương Lâm, Trần Duy v3, owner map/navigation/blocker/save/DB và các bản nháp.
