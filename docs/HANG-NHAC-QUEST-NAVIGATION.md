# Nhiệm vụ và tìm đường Hằng Nhạc · 13/10/2026

Owner chọn **tự chuyển nhiệm vụ, bấm để tự tìm đường**. Bảng đạo trình chọn bước tiếp theo khi nhận snapshot hoàn thành từ server. Vẫn có thể mở lại nhiệm vụ cũ để đọc; cập nhật nền không giành lại lựa chọn đang xem. Đổi hồ sơ xóa lựa chọn của hồ sơ trước.

Trong hub, **Tìm đường tới mục tiêu** trên bảng nhiệm vụ chạy tới NPC của bước hiện tại. Nhật ký J cho chọn một trong bốn NPC rồi bấm Tìm đường; đạo trình H và bàn luyện chế cũng có nút tới NPC khi đứng xa. Tới nơi dừng trong tầm tương tác, hiện lời nhắc E. Với nhiệm vụ chương đã ở đúng NPC, nút tiếp tục trên bảng mở thẳng chi tiết đạo trình.

WASD/mũi tên, điều khiển cảm ứng, Esc, nút Dừng, ngắm trên map hoặc dùng kỹ năng hủy tìm đường. Mở cửa sổ, mất focus/kết nối, đổi hồ sơ, rời hub hoặc reload cũng dừng; không tự khởi động lại sau reconnect. Nhận/trả nhiệm vụ, chiến đấu, chế tạo và lựa chọn lời dẫn vẫn do người chơi thực hiện.

`client/src/core/quest-navigation.ts` dùng tuyến `sectRoute` sẵn có, lấy vị trí dự đoán và phát input thường qua cùng transport/collision client/server. Tốc độ chạy vẫn 120; không teleport, sửa blocker, spawn, authored map hoặc dữ liệu save. Khi không tìm được đường hoặc bị kẹt sau số lần thử giới hạn, dừng và báo người chơi.

Đã sửa lựa chọn sai EX04 khi tất cả bước còn lại đang khóa: bảng giữ bước đầu chưa hoàn tất. HN06 chờ M02, HN09 đã có minh chứng nhưng thiếu tầng 9, HN10 thiếu tầng 15 chỉ tới người hướng dẫn vận khí; khi đạt điều kiện, đích chuyển về NPC nhiệm vụ.

Kiểm bằng unit `quest-navigation`, `quest-selection`, `sect-quests`, cùng smoke nhiệm vụ/chapter và các hồi quy input/lifecycle trên DB, trình duyệt fixture. `tests/smoke/hang-nhac-quests-smoke.mjs` kiểm chạy tới NPC thật, các cách hủy, reload không tự chạy, không tự nhận/trả và hash owner map. Kiểm kỹ thuật không xác nhận thay đổi ART.

Nhịp tích lũy 120/phút và các cổng tầng giữ hiện hành. Cải thiện này giảm thao tác và việc tự dò đường; các khoảng chờ tu luyện, độ đa dạng hoạt động và nội dung ngoại vi cần được đánh giá riêng trong lượt chơi tiếp theo.
