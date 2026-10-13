# Chuẩn NPC · Vương Lâm đang dùng trong game

Owner chốt ngày 13/10/2026: **“phải lấy vương lâm trong game làm chuẩn”**. Chuẩn gốc là Vương Lâm Pixel02 hiện hành, lấy trực tiếp từ atlas mà client runtime nạp. Trần Duy v3 và mọi NPC khác là đối tượng so sánh; không thay thế chuẩn gốc.

[Hồ sơ chuẩn](basis.json) pin catalog, atlas idle Đông Nam/frame1, rect, native, nearest8× và đối chiếu RGBA với master đã duyệt. [Tám hướng thật](directions.json) pin frame1 của tám clip idle đang live; [bảng native](inputs/wang-lin-live-eight-directions-native.png) xếp theo thứ tự trong manifest. Tất cả input giữ pixel gốc; nearest8× chỉ phóng để API đọc rõ.

Khi tạo human NPC neutral mới, image1 là frame Vương Lâm cùng hướng. Ảnh NPC cũ chỉ cung cấp nhận diện/phục trang/đạo cụ. Giữ tỷ lệ đầu–vai–thân, chiều dài chân, cỡ cụm pixel, palette và cách đổ bóng từ Vương Lâm; thay tuổi, giới tính, tóc và nghề mà không làm đầu nhỏ hoặc thân dài. Không dùng một NPC trung gian làm edit target thay Vương Lâm để tránh lệch dần qua mỗi đời ảnh.

Đối chiếu NPC trực tiếp cạnh Vương Lâm ở 1× và zoom nguyên lần, cùng world foot. Canvas người64×96/pivot(32,88), body nominal80px; chiều cao80px riêng lẻ không chứng minh anatomy đã khớp. Đạo cụ rộng cần padding riêng, không thu cơ thể để vừa canvas. Tuổi/gender/nhận diện NPC được duyệt riêng; quái/boss dùng anatomy của chúng.

Bộ v4 được owner **tạm chấp nhận**, vẫn còn điểm chưa ổn. Giữ nguyên raw/prompt/provenance mô tả đúng các input đã gửi trước chỉ dẫn mới. Chuẩn mới áp cho sản xuất tiếp theo; không sửa lịch sử nguồn hoặc suy owner đã duyệt motion/runtime của NPC.

Gói chuẩn chỉ chứa bản sao tham chiếu và hash. Không thay ART Vương Lâm, catalog live, map/navigation/blocker/save hoặc DB. Khi atlas live thay đổi, đối chiếu lại hash và phạm vi owner trước khi cập nhật bộ tham chiếu.
