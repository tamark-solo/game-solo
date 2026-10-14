# P5 · chuẩn bị Xạ Thần Xa → Thiên Nghịch Châu

Gói hỗ trợ choreography, prompt và input cho Huyễn Tâm A/Tịch Bạch B. Chưa tạo nguồn mới: 96 công việc trong kế hoạch là dự toán cho hai họ, không phải 96 nguồn đã sản xuất. Hoàn tất Kiếm linh rồi Hồn phiên trước; root sẽ giao từng lượt khi tới Xa và Châu.

Mỗi họ có 2 identity × 8 hướng thật × 8 action: idle, run, cast-single-target, cast-aoe, hit, death, meditate, gather. Mỗi identity giữ trang phục P1 riêng. Wang cùng hướng chỉ hỗ trợ tỷ lệ người, anatomy, nét pixel và camera.

- [Xa: choreography và điều kiện đọc hình](chariot/BRIEF.md).
- [Châu: choreography và điều kiện đọc hình](bead/BRIEF.md).
- [Input và provenance](INPUT-PROVENANCE.md).
- [Socket, root và bàn giao cho packer](SOCKET-ROOT-HANDOFF.md).
- [Kế hoạch tổng](plan.json), [basis hash](basis.json) và [mẫu dispatch](dispatch-template.json).

## Phân chia nguồn

Một source Core dự kiến 1536 × 1536, 6 cột × 5 hàng: sáu neutral đứng, rồi idle/run/ST/AOE, mỗi action sáu key thật. Source foundation dự kiến portrait 1024 × 1536, 3 cột × 6 hàng: sáu neutral đứng, rồi hit/death hoặc meditate/gather. Layout dành chiều rộng cho động tác tay và corpse, với gutter tối thiểu dự kiến 24 source px.

Hai họ tổng cộng dự kiến 32 source Core và 64 source foundation: 256 clip / 1.536 key motion nếu mỗi clip có sáu key. Số clip/key cuối cùng đọc từ nguồn thực. Nếu ảnh ra 5, 7 hay kích thước khác, ghi actual dimensions/cell segmentation/key coverage; sửa nguồn hoặc đăng ký số key có bằng chứng. Không nhân bản, mirror, xoay hay biến đổi một pose để lấp số lượng.

Một hệ số scale cho toàn source, tính từ neutral đứng cùng source về body P1 nominal 80 px. Source có trung bình six calibration là dự kiến; packer phải ghi những calibration thật được chọn và một factor duy nhất. Corpse, ngồi, cúi, nhấc chân giữ chiều cao tự nhiên. Canvas 112 × 112/(56,104), corpse rộng hơn nếu cần, là padding; không dùng canvas để ép pose bằng chiều cao đứng.

## Dùng khi được giao

32 triplet Core đã snapshot vào support, có SHA. 64 foundation có Image1 và Image3 để null vì còn chờ neutral/core raw đúng họ, đúng identity, đúng hướng. A/B có thể dùng các prompt đã chuẩn bị làm cơ sở; lượt gọi thật phải lưu nguyên văn prompt thực tế và exact input bytes sau mọi chỉnh sửa.

Gói này không gọi ImageGen, không viết actors/a hoặc actors/b, không pack nguồn mới, không đổi Core/live/map/DB. ART/motion/runtime approval vẫn là false. Kiểm chuẩn bị bằng:

    python docs/design/characters/wang-lin-equipment-production-v2/support/p5-next-family-briefs/verify-preparation.py

Các mốc cast trong choreography lấy từ P2 Core experimental fixture; chúng giúp gắn pose vào clock review, chưa khóa timing/balance production.
