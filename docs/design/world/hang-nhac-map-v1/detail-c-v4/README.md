# Hằng Nhạc — chi tiết C theo từng khu

Đã được chủ dự án chấp nhận tỷ lệ/màu và chọn tái sử dụng phương pháp ngày 08/10/2026. Xem [quy trình cho map tiếp theo](../../../../MAP-CONCEPT-SECTOR-WORKFLOW.md); các thông số dưới đây là ví dụ Hằng Nhạc, không cố định cho mọi map.

Chủ dự án chọn **C · Vẽ lại chi tiết bằng ImageGen** vì nét vẽ và màu hợp ba nhân vật gốc, rồi yêu cầu dùng hướng này cho toàn map. Bản C ảnh tổng 1536 × 1024 xuất 2× chưa giữ được mức chi tiết đó.

Đợt này dùng **ImageGen tích hợp**, sáu lần chỉnh từng khu với cùng [tham chiếu phong cách C](style-reference-c.png). [Thông số và prompt từng khu](regions.json) ghi hình đầu vào, tọa độ world và đường dẫn nguồn. Khu đích 1232 × 1232 chồng nhau 312 px theo ngang và 416 px theo dọc; không thay world 3072 × 2048 hoặc sprite 64 × 96/chân (32,88).

Ảnh trả về được kiểm kích thước và đăng ký tọa độ theo các patch cạnh. Chỉ cho phép hiệu chỉnh affine nhỏ, gần tỷ lệ 1; sau hiệu chỉnh kiểm lại độ dịch. Ghép các khu bằng đường nối có chi phí thấp trong phần chồng, pha hẹp 12 px tại đường nối và bù chênh RGB tối đa 8 mức. Không blur toàn ảnh, không sharpen, không phục hồi ảnh tổng bằng AI/upscale 2×. Các bước ghép là xử lý ảnh cục bộ đã được chủ dự án cho phép; chi tiết vẽ mới do ImageGen tạo.

[Biên bản ghép](composition.json) ghi kích thước nguồn thực tế, hash, biến đổi, các mốc kiểm và đường nối. [Vị trí đường nối](seam-locations.webp) và [đối chiếu native](seam-native-contact.png) phục vụ kiểm, không tải trong trang map chính. Chẩn đoán cạnh không bảo đảm mọi hình dáng giữ từng pixel; bố cục chức năng và chi tiết đường nối cần xem cùng người ở 1×. ART cuối chưa tự đánh dấu duyệt.

Kết quả là **một ảnh nền đầy đủ**, không phải bộ asset rời. Giữ quy trình map tổng → chủ dự án vẽ luồng đi/chặn → asset cần thiết sau. Không ghi vào authored-maps hoặc nháp Editor của chủ dự án. [Xem map](../index.html).

**Sau khi lưu owner map:** trang so các bản lỗi đã dọn. Các đường dẫn layout/style cũ trong `regions.json` là snapshot lịch sử; ảnh pilot C được giữ ở [style-reference-c.png](style-reference-c.png), sáu crop nguồn đầy đủ vẫn có. Navigation hiện hành xem [owner-navigation](../owner-navigation/README.md).
