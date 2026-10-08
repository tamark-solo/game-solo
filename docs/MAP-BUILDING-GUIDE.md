# Quy tắc xây map cho game-solo

**Phiên bản:** 1.3, ngày 08/10/2026. Asset map cũ đã xóa theo [yêu cầu bắt đầu lại](MAP-ASSETS-RESET.md). Thư viện mới có 0 asset. Không dùng các kế hoạch/native kit cũ để tự khôi phục cảnh.

## 1. Phân công và đầu vào

Người phát triển tự thiết kế bố cục, layer, vùng đi/chặn và cửa nối trong [Map Editor](MAP-EDITOR.md). Trợ lý sản xuất asset theo yêu cầu và phát triển công cụ theo [phân công](MAP-ASSET-PRODUCTION-NOTES.md). Không thay layout của người phát triển khi sửa editor.

Mỗi bộ mới cần có tham chiếu được chọn, danh sách vật thể và cỡ/pivot dự kiến trước khi sản xuất. Tham chiếu dùng làm căn cứ hình dáng, kiến trúc, mật độ và bố cục khi được người phát triển chọn; không tự thay đổi bằng cụm generic. Hiện chưa có ART tham chiếu mới được chốt.

## 2. Tỷ lệ và chất lượng native

Nhân vật dùng frame 64 × 96, chân (32,88), cỡ chơi 1×. Một pixel ART native tương ứng một đơn vị thế giới. Camera thay đổi vùng nhìn; không thu nhỏ người để giả lập map rộng. Cửa, cầu, bậc thang và đường cần đủ chỗ cho người tại tỷ lệ này.

ART phải rõ ở cỡ native, không lấy ảnh tổng thu nhỏ rồi phóng làm cảnh chơi. Kích thước nguồn đủ để xuất mà không kéo mờ. Kiểm 1× và phóng nguyên lần; tránh bilinear lọc sprite. Đo vị trí chân đế trong ảnh sau xuất, không coi tâm ảnh hoặc tâm bounds là pivot.

## 3. Chia asset, cụm và layer

| Phần | Vai trò |
| --- | --- |
| Nền sạch | Đất, sân, đường, nước; vẽ đầy đủ sau vật thể |
| Cụm tĩnh | Bồn/cỏ/hoa/đá nhỏ chung quan hệ trước/sau; có thể ghép chung |
| Vật thể theo chân | Thân cây, nhà, cột, đá; xếp cùng người theo điểm chân |
| Phần che điều khiển | Tán, mái, vòm; alpha đúng mép, có thể mờ khi che người |
| Dữ liệu gameplay | Vùng đi/chặn/cửa; tọa độ riêng, không vẽ vào PNG |

Nhóm chỉnh sửa có thể chứa nhiều vật. Chỉ gộp thành một ảnh nếu mọi phần có cùng quan hệ trước/sau với người chơi trong vùng sử dụng. Không gộp cả cây và nền phía sau khi cần người đi giữa. Chọn tách từng vật hoặc cả cụm theo nhu cầu thực tế, không bắt người phát triển mask từng chi tiết không có tác dụng gameplay.

Các part của cùng vật dùng chung canvas/pivot/tọa độ, giữ nguyên hình dáng khi ghép. Không crop riêng từng part làm mất đăng ký. Nền phía sau tán/mái phải hoàn chỉnh, không có lỗ hoặc thân cây bị cắt cụt do mask.

## 4. Alpha, thứ tự và va chạm

Phần che dùng alpha đúng viền vật thể. Không dùng polygon thô để cắt tán/mái hoặc làm trong suốt một mảng nền. Kiểm mép trên nền sáng, tối và ô trong suốt; không halo, viền răng cưa bất thường hoặc bóng bị cắt.

Vật thể/người dùng điểm chân để xếp trước/sau. Phần che chỉ mờ khi thực sự giao với pixel nhân vật phía sau, không dựa vào cả khung ảnh. Kiểm trước, sau, hai cạnh và dưới mái/tán.

Vùng chặn là dữ liệu độc lập do người phát triển vẽ. Chặn chân đế/cột/thân/nước theo nhu cầu chơi; không chặn cả mái hoặc tán vì ảnh lớn. Lối mở nhìn thấy phải đi được nếu được định nghĩa là đường. Ẩn layer dữ liệu không tắt va chạm; cờ hoạt động riêng mới tắt trong Test.

## 5. Xuất và quản lý thư viện

[Thư viện mới](design/world/map-asset-library/README.md) là đầu vào hiện tại. Manifest ghi id, PNG/part, kích thước và pivot; không tự gán tọa độ thế giới hoặc vùng chặn. Khi thêm PNG vào manifest, đồng bộ bằng `npm.cmd run assets`. PNG tự nhập được giữ trong JSON dự án.

Lưu nguồn có layer hoặc nguồn rời, prompt/input nếu dùng imagegen, metadata, ảnh đối chiếu và trạng thái đánh giá. Tên/phiên bản phải cho biết nguồn đang dùng. Các bản cũ chỉ được giữ khi người phát triển chưa yêu cầu xóa; đợt reset này đã xóa bộ trước theo yêu cầu.

Chunk là cách tải/chia không gian, layer là quan hệ hiển thị trong một khu. Chỉ chia chunk khi cần; giữ tọa độ toàn cục và kiểm mép 1×/2×, không cắt vật thể ở đường nối. Nếu cần nền lặp, kiểm seam trước khi gọi là tile seamless.

## 6. Kiểm tra và tiếp tục

Kiểm kỹ thuật: PNG/metadata khớp, alpha/part/pivot đúng, đường đi và portal dùng cùng tọa độ, lưu/xuất/nhập không mất dữ liệu. Duyệt hình ảnh: hình dáng, tỷ lệ, nét/màu, bố cục và trải nghiệm do người phát triển đánh giá riêng. Build/test không đồng nghĩa ART được chấp nhận.

Thử một nhóm asset nhỏ trước khi mở rộng thư viện. Người phát triển ghép và Test level, phản hồi asset/công cụ còn thiếu. Không tự quay lại nhiệm vụ/combat/loot/đột phá hoặc chân dung UI khi chưa chuyển ưu tiên.
