# Trần Duy v3 · sửa tỷ lệ theo Vương Lâm Pixel02

**Chỉ dẫn mới nhất 13/10:** owner yêu cầu lấy [Vương Lâm đang dùng trong game](../van-hai-npc-visual-standard-v1/README.md) làm chuẩn gốc. Trần Duy v3 chỉ là NPC so sánh. Các mô tả dùng v3 làm basis ở mốc trước là lịch sử trước chỉ dẫn này; raw/prompt/input/hash cũ giữ nguyên.

**Mốc owner 13/10:** owner xác nhận v3 giống tỷ lệ và concept của Vương Lâm trong game. [Phạm vi và hash đã lưu](style-approval.json) chốt tỷ lệ/phong cách neutral làm basis NPC tiếp theo; nhận xét này chưa duyệt motion hoặc tích hợp runtime. [Ba NPC tiếp nối](../van-hai-npc-concepts-v4/index.html) dùng actual v3/Pixel02 image references.

Ngày 13/10/2026. Một neutral tĩnh để xử lý phản hồi NPC lệch chất lượng ART; chưa animation hoặc tích hợp game. [Trang đối chiếu](index.html) đặt Vương Lâm đang dùng trong game, Trần Duy v1 và v3 cạnh nhau ở 1×/2× trên nền map/sáng/tối.

V1 đã dùng mô tả bằng chữ và tạo người quá thanh, đầu nhỏ. V2 có ảnh tham chiếu nhưng vẫn giữ nhiều anatomy của bản cũ. V3 dùng Pixel02 làm **edit target đầu tiên**, v1 chỉ làm mẫu phục trang/nhận diện, theo [skill đã lưu](../../../skills/game-actor-animation-production/SKILL.md). Nguồn router và thứ tự input nằm trong `raw/tran-duy.json`; raw/prompt/input gốc giữ nguyên, không tự retry generation.

Ảnh Pixel02 tham chiếu trùng byte master và trùng RGBA frame đầu idle Đông Nam trong atlas đang được runtime dùng. Hash master: `f89dcf4171aa70e1411553498e8b1f12b3a2b46287272f196604e537e032af54`. Đây là đối chiếu asset hiện hành, không tuyên bố đã kiểm phiên game đang mở.

Raw v3 1024×1536; alpha210 có bounds (215,159)–(812,1436). Chân trước kết thúc hàng1435, sole x359–464; root đo (412,1436). Scale chung 80/1277, nearest một lần; canvas64×96, pivot(32,88), cutout37×80. Không co từng bộ phận hoặc vẽ sửa RGB. Alpha thấp của haze được loại ở native, raw nguyên bản vẫn giữ.

Box tóc đến cằm khoảng50,4% chiều cao, gần Pixel02 khoảng51,3%. Hai số chỉ hỗ trợ xem hình: v3 có tóc ngắn/búi gọn, tổng alpha rộng37px so Vương Lâm49px; áo sáng và mặt chính diện hơn. Bản mới cải thiện rõ so v1 nhưng chưa coi là đồng bộ ART hoàn toàn. Râu có box riêng trong phép đo, không dùng để tăng tỷ lệ đầu.

Bảy hướng và idle/talk/gesture còn thiếu; ba NPC v1 khác chưa tạo lại. Giữ một mẫu để đánh giá phong cách trước khi nhân rộng. `ownerApproved`, `artApproved`, `runtimeConsumable` vẫn false. Map/blocker/save/DB và ART Vương Lâm không thay đổi.

Đóng native: `python docs/design/characters/van-hai-npc-concepts-v3/pack.py`

Kiểm trang: `node docs/design/characters/van-hai-npc-concepts-v3/review/verify.mjs`

Kết quả kiểm kỹ thuật nằm trong `review/verification.json`, tách khỏi duyệt hình.
