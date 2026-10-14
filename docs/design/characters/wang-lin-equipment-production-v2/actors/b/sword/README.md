# Tịch Bạch · Kiếm linh tám hướng V2

Body-only cho identity `b`: **64 clip / 364 key** thuộc idle, run, hit, death, meditate, gather, ST và AOE × N/NE/E/SE/S/SW/W/NW. Tám clip pilot N/SE (48 key) đọc trực tiếp từ V1 theo hash; **56 clip / 316 key mới** nằm trong gói này. [Registration](registration.json) dùng đường dẫn tương đối với root `wang-lin-equipment-production-v2`, để review tổng đọc đúng asset và pivot.

Có **15 nguồn mới được chọn**, 90 neutral calibration mới; cộng 24 calibration V1 là **114**. Hai raw sai yêu cầu (SW camera r1, S foundation thiếu hàng) giữ trong lịch sử. [Generation](generation.json) lưu built-in ImageGen, prompt gốc, input/hash và đường dẫn kết quả gốc. Own Tịch Bạch đã duyệt là PRIMARY; Wang cùng hướng chỉ hỗ trợ pixel/anatomy/camera, không chép mặt/tóc/áo hoặc vá pixel từ Wang.

Nguồn lớn dùng 6 cột ×5 hàng. S hit/death dùng 3×6, 18 pose. S meditate/gather thực có 3×5, 15 pose: 6 neutral, 4 key ngồi, 5 key gather được map theo ready→bend→reach→retrieve→recover. Metadata ghi rõ delta so với request 18; không clone để làm đầy. Run E/S/W giữ 5 key chạy thật và bỏ key standing cuối vào history; các view khác giữ 6 key. Thiền giữ 4 key ngồi, không loop qua standing/kneeling entry.

Một factor/source từ median crown→actual dark-boot soles của sáu neutral đưa cơ thể về nominal 80 px. Standing/run dùng **112×112 / pivot (56,104)**; death dùng **192×128 / (96,112)** để giữ đủ thân/tóc khi ngã. Padding không đổi scale/world origin. Prone chọn phía giày thật từng nguồn và đo opaque dark boot sole trong ROI, không dùng vạt ngà/tóc bạc làm chân. Body được trích bằng mask sở hữu connected silhouette cộng mảnh opaque rời của chính pose; các cột có x-projection chồng được tách theo body thật, không cắt theo cell chia đều.

[Manual choices](manual-choice.json) và [socket measurements](manual-sockets.json) lưu các lựa chọn/override sau khi xem crop bàn tay nguồn thật cùng native contact. Các proposal nhầm mặt/tai, bàn tay đối diện hoặc pose tới đất đã được thay bằng palm thật; cuff-side đo từ pixel charcoal opaque. `angleDeg` là wrist delta trong mặt phẳng so với neutral cùng nguồn/cùng hướng; không dùng facing/North135 làm góc cổ tay. Bàn tay mở/kết ấn/bị che hoặc nghỉ thiền ghi detach-hover; endpoint bị che là estimate và không nhận agreement cầm kiếm nhìn thấy. [Assessment](assessment.json) ghi source, first/recovery head/torso và manual review complete, tách với owner ART approval.

Các clip mới ST giữ `[160,160,160,160,160,300]` ms; AOE `[260,270,270,320,520,540]`, key4 bắt đầu tại release480/800 của fixture. Timing V1 giữ nguyên. Các mốc này là ART preview, không cân bằng/gameplay live.

Nguồn/canonical/atlas/gutter/hash/source reconstruction có [QA scoped](review/verification.json): **5.808 kiểm tra qua trên 478 frame motion/calibration**, gồm hash pilot V1 nguyên byte và release gate 480/800 ms. Xem từng grid `review/*-marked-1x.png` / `*-marked-2x.png`, crop tay `*-hands-actual.png` và [death đủ tám view 2×](review/death-eight-views-2x.png). Lệnh kiểm: `python actors/b/sword/verify.py` từ đúng Python runtime với đường dẫn workspace đầy đủ. Packer chỉ ghi actor B này; không sửa V1, actor A, root review, map, DB, storage hoặc runtime.

Source/motion V2 mới vẫn **candidate, chưa owner motion/ART/runtime approval**. Đây là bộ Kiếm linh để qua gate kỹ thuật hai identity trước Phiên→Xa→Châu.
