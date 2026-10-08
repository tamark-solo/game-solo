# Hằng Nhạc — kiểm chứng nền native v2

**Ngày:** 08/10/2026 · **Phạm vi:** sân chính; chưa hoàn thiện chất lượng toàn map.

Phản hồi chủ dự án: nền v1 mờ rõ so với nhân vật. Nguồn toàn map 1448 × 1086 bị phóng lên world 2400 × 1800 khoảng 1,657 lần, trong khi sprite R01 ở 1×. Vì vậy v1 chỉ còn phù hợp duyệt bố cục; chưa đạt chất lượng nền gameplay.

Đã dùng **imagegen tích hợp** để vẽ lại [sân chính v2](courtyard-native-v2.png), theo [prompt](courtyard-native-v2.prompt.txt), với [crop nền camera cũ](../hang-nhac-art-v1/courtyard-floor-edit-reference.png) làm edit target. Không dùng sharpen filter, không chỉnh source bằng script, không giảm body hoặc zoom để che lỗi nền.

[Bản so sánh](index.html) đổi v1/v2 trong cùng camera, cùng vị trí nhân vật và cùng frame R01 body 80 px. V2 là source **1536 × 1024** cho vùng **960 × 640 world px**, tương đương 1,6 source px/world px; nền được hiển thị nhỏ hơn source, không bị kéo lớn hơn ảnh. Khung hẹp cắt vùng nhìn và giữ sprite 1×.

## Cách dùng bản này

Đánh giá ở 1×: đường nối đá và hoa văn đủ rõ, cây/lan can có khối rõ, nền không giành độ chú ý với nhân vật. V2 có nét vẽ/chi tiết mới nên không phải bản upscale bảo toàn từng pixel của v1. Vị trí một số đạo cụ/đường đá có thay đổi nhỏ; cần duyệt phong cách và bố cục lại trước sản xuất.

Vùng camera tham chiếu trong world v1: x=738,232; y=498,228; rộng 960, cao 640. Không ghép chunk này vào map v1 rồi coi như cả map đã sửa; các mép/chunk liền kề chưa sản xuất hoặc kiểm tra seam.

## Tiêu chí cho nền map sản xuất

- Nền đủ source pixel cho world và mức zoom lớn nhất được chọn; với camera 1× không lấy ảnh nhỏ rồi kéo lên world lớn.
- Nếu dùng một ảnh cho world 2400 × 1800 thì source thực tế phải ít nhất tương ứng; nếu chia khu/chunk phải có đủ chi tiết ở từng chunk, vùng chồng và kiểm tra đường nối.
- Nền/đạo cụ được duyệt cùng sprite R01 80 px trong camera thật, không chỉ xem ảnh tổng thể thu nhỏ.
- Tách ground, mái/cây/đạo cụ và va chạm; giữ tỷ lệ/đường đi và chỗ đọc skill trước khi coi map hoàn thiện.

Các khu khác vẫn dùng v1 để nghiên cứu bố cục; chưa đạt cùng mức chi tiết với sân chính v2. Không cập nhật runtime/GDD vận hành hoặc báo hoàn thiện map trong lần kiểm chứng này.

## Kiểm tra bản so sánh

[Kết quả trình duyệt](verification.json) đạt: source thực tế 1536 × 1024, hiển thị vào 960 × 640 không upscale; v1/v2 giữ cùng vị trí/cỡ sprite; màn hẹp giữ canvas 96 × 96 và body 80; nút đổi nền/ẩn người hoạt động, không lỗi script hoặc tràn ngang. Ảnh kiểm tra: [v2 cùng nhân vật](compare-new-960.png), [v1 cùng nhân vật](compare-old-960.png), [v2 trên khung hẹp](compare-new-mobile.png).

[Metadata](art-native.json) ghi phạm vi sân chính, hash nguồn và mức 1,6 source px/world px. Chưa duyệt owner, chưa nối seam hoặc làm source các khu khác; không suy ra chất lượng/collision toàn map từ kiểm tra này.
