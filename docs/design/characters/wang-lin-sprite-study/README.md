# Vương Lâm — thử sprite nét mịn và pixel art

**Ngày:** 07/10/2026.  
**Yêu cầu:** tạo thử hai cách thể hiện Vương Lâm trước khi quyết định phần hình tiếp theo.  
**Trạng thái:** sau so sánh, người phát triển ưu tiên pixel art cho nhân vật và chọn nền stylized 2D. Hai mẫu tĩnh được giữ làm tham chiếu, chưa là sprite native/animation sản xuất.  
**Công cụ:** imagegen tích hợp, không dùng CLI/API fallback.

Mở [trang so sánh](index.html), chọn khung 96/192/384 px và nền sáng/đậm. Hai ảnh cùng canvas 1.254 × 1.254, có alpha trong suốt thật.

| Mẫu | File | Prompt | Tham chiếu đầu vào |
| --- | --- | --- | --- |
| Stylized 2D nét mịn | [PNG](wang-lin-gray-smooth-v1.png) | [Prompt](wang-lin-gray-smooth-v1.prompt.txt) | [Concept nhập môn](../wang-lin-initiation-v1.png), dùng bộ áo xám ở giữa |
| 2D pixel art | [PNG](wang-lin-gray-pixel-v1.png) | [Prompt](wang-lin-gray-pixel-v1.prompt.txt) | Bản nét mịn bên trên; giữ mặt/tóc/áo/tư thế |

Giữ chung: giai đoạn nhập môn áo xám, tóc đen buộc nửa đầu, cổ áo ngà, đai tối và một tư thế đứng ở góc nhìn từ trên chéo xuống. Không thêm vũ khí/hạt châu/trang bị cảnh giới cao.

Bản nét mịn giữ nhiều nét tóc/nếp áo; bản pixel gom chi tiết thành cụm màu và đường viền bậc thang. Kích thước nguồn lớn phục vụ xem phong cách; chưa xác nhận lưới pixel native, tỷ lệ 4–5 đầu hoặc kích thước frame sản xuất. Cần duyệt các phần này khi làm sprite thực tế. Đây chưa là bộ nhiều hướng hoặc animation.

Đã xem hai ảnh và kiểm tra alpha, kích thước nguồn, đường dẫn hình/prompt. GDD v0.10 ghi nhận lựa chọn sau thử nghiệm: nhân vật pixel trên nền stylized 2D, giữ top-down ba phần tư và portrait tranh mực.

[Hồ sơ tạo hình Vương Lâm](../../../WANG-LIN-VISUAL-SPEC.md) trong GDD v0.12 đã bổ sung nguồn tiểu thuyết và brief diện mạo riêng. Giữ các PNG/prompt v1 làm nguồn nghiên cứu phong cách.

## Mẫu pixel v2

Đã tạo [pixel đứng áo xám v2](wang-lin-gray-pixel-v2.png) bằng imagegen tích hợp theo [prompt chính xác](wang-lin-gray-pixel-v2.prompt.txt), dùng pixel v1 làm target giữ camera/tư thế và [bảng tạo hình v2](../wang-lin-initiation-v2.png) làm nguồn mặt/tóc/trang phục. Gấu áo được chỉnh gọn; PNG 1.254 × 1.254 có alpha trong suốt, đã kiểm tra bốn góc nền.

Xem cùng bảng trang phục và biểu cảm tại [thư viện nhân vật](../index.html#wang-lin-pixel); [manifest](../wang-lin-v2-study.json) ghi input và nhận diện đã được người phát triển duyệt. [Bộ đứng/đi đầu tiên](../wang-lin-gray-walk-v1/index.html) có 28 frame native 64 × 96 và palette riêng. Mẫu sân v1 giữ ảnh pixel v1 để truy nguồn nghiên cứu.
