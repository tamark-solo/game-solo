# NPC Pixel02 v2 — pilot Trần Duy

Một neutral Đông Nam, chưa animation/runtime/ART approval. Dùng actual Pixel02 image reference + identity v1.

Raw 1024×1536, chân nguồn420,1512; source bounds275,204,780,1512; scale80/1308 nearest một lần; native64×96/pivot32,88.

Đầu/tóc44,8% so v133,6% và Pixel02 khoảng51,3%. Cải thiện rõ nhưng thân/áo vẫn thanh và dài hơn basis; chờ owner xem morphology trước ba NPC còn lại. Không biến dạng từng phần.

Mở index.html qua HTTP. review/lineup-2x.png so native cùng mặt đất. Browser QA đạt 6 trường hợp (map/sáng/tối × 1×/2×), mobile390px, không pageerror. Kết quả tại review/verification.json; ART/runtime vẫn false.

Pack: python docs/design/characters/van-hai-npc-concepts-v2/pack.py
Verify: node docs/design/characters/van-hai-npc-concepts-v2/review/verify.mjs

Tool chỉ ghi rootv2; v1, Pixel02, owner map và DB giữ nguyên.

Ba bộ specs/plans/prompts Diệp Tĩnh, Tạ Kiếm Sơn, Tô Nhược chỉ là kế hoạch đã soạn, chưa gọi generation và chưa có raw/native v2. Giữ để tiếp nối, không tính là đã sản xuất.

Bề ngang native pilot khoảng31px so thân basis khoảng44px; chưa đạt match Pixel02 dù cùng chiều cao80px.
