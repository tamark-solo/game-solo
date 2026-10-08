# P3 · Trúc Cơ · hồ sơ sản xuất 1.0.0

**Trạng thái:** đã sản xuất 132 PNG / 15 atlas (48 frame FX mới, 84 PNG dùng lại nguyên byte), 31 kiểm tra qua. Chủ dự án đã chấp nhận bộ Trúc Cơ và yêu cầu nâng tiếp; trạng thái duyệt lưu trong manifest pack 1.0.1. Chưa tích hợp runtime. [Hồ sơ bàn giao](../TRUC-CO-KIT.md).

Chủ đề: **linh khí được tổ chức**. Giữ Vương Lâm chibi, palette ngọc/ngà/vàng và cỡ thân ~80 px. Nét mỹ thuật R01 là nền; R02 thêm đội hình, điểm hội tụ và quan hệ giữa các phần. Không phóng cả nhân vật hay lớp hit theo cảnh giới.

| Chiêu | Khác R01 | Bộ clip cần sản xuất | Mốc kiểm |
| --- | --- | --- | --- |
| Ngự Kiếm | Ba kiếm vào đội hình rõ rồi cùng xuất theo trục | pose kết ấn, formation 8 frame, sword flight loop 6 frame, hit 12 frame | đọc được một kiếm chính và hai phụ ở zoom1×; không che mục tiêu; số hit do combat quyết định |
| Liên Lôi Ấn | Ba dấu phụ hội tụ về tâm chính theo thứ tự | pose, seal 6, three-node convergence 8, main bolt 6, hit 12 | nhận diện điểm đánh chính; ba dấu không mặc định ba damage event |
| Hồi Phong Bộ | Cuộn khí xuất phát và đuôi hồi khi tan | pose, departure coil 8, dash trail 6, return curl 12 | giữ đường di chuyển thật; khí hồi không kéo/teleport actor |

Ngự Kiếm: thời gian formation giữ tĩnh nhân vật trong lúc ba kiếm được tổ chức; sword flight đã dùng một clip composite có ba kiếm nhưng vẫn một release intent. Cung dẫn từ socket tay sang formation là clip riêng, không ghép chết vào người. Lớp hit tiếp tục material independent. Formation đặt anchor theo host, không tự chọn hướng/target.

Ngân sách ART đã xuất: vùng formation khoảng 140×100 world px, blade chính ~96 px như R01, blade phụ ~72 px; hit giữ bán kính thị giác gọn. Đây là ngân sách hình, không phải hitbox, range hay thông số cân bằng.

Quy trình: concept đội hình → sheet tách lớp → PNG source đăng ký anchor → atlas → timeline → preview cỡ game/PvP/boss → duyệt motion → mở rộng hướng và nối runtime. Chỉ tăng mức complexity sau khi silhouette và frame chạm đọc rõ ở zoom thật. Không đánh dấu hoàn thành dựa trên một ảnh concept.
