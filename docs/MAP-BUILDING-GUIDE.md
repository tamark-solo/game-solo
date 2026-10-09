# Quy tắc xây map cho game-solo

**Phiên bản:** 1.8, ngày 08/10/2026. Chủ dự án chọn map đầy đủ trước, navigation tiếp, asset rời sau. Concept, nền sạch và ba asset thử đã xóa; [map mới](design/world/hang-nhac-map-v1/README.md) là nền thiết kế level 3072 × 2048/scale 1. Thư viện mặc định vẫn 0 asset, gói map bàn giao riêng. Không khôi phục nguồn cũ.


**Bản chốt ngày 08/10/2026:** chủ dự án đã hoàn tất vùng chặn và xác nhận lưu bản mới nhất. [Hằng Nhạc hiện hành](design/world/hang-nhac-map-v1/README.md) dùng đúng nền access-v5-clean-v1: 3072 × 2048, scale 1, 9 blocker owner, Spawn (1616,992), kiểm 0 lỗi/0 lưu ý. Các bản thử đã dọn; giữ nguồn sáu khu C và bản sao ngoài workspace. Không tự sửa vùng chặn hoặc bậc thang. [Runtime đã nạp client/server](HANG-NHAC-RUNTIME.md) với cùng dữ liệu va chạm, camera 1×; [hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md) và [NPC/HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử, chưa có portal hoặc part che. Tiếp tục theo [kế hoạch GDD](HANG-NHAC-IMPLEMENTATION-PLAN.md), không khôi phục ART cũ.
Quy trình đã được chọn để dùng lại: [concept tổng → vẽ từng khu có phần chồng → căn và ghép](MAP-CONCEPT-SECTOR-WORKFLOW.md). Hướng dẫn lưu cả thông số Hằng Nhạc, mẫu prompt, kiểm native và bàn giao; kích thước/màu từng map vẫn theo GDD.

## 1. Phân công và đầu vào

Trợ lý dựng map tổng theo yêu cầu; người phát triển chỉnh bố cục, layer, vùng đi/chặn và cửa nối trong [Map Editor](MAP-EDITOR.md). Trợ lý sản xuất asset theo yêu cầu và phát triển công cụ theo [phân công](MAP-ASSET-PRODUCTION-NOTES.md). Không thay layout của người phát triển khi sửa editor.

Mỗi bộ mới cần có tham chiếu được chọn, danh sách vật thể và cỡ/pivot dự kiến trước khi sản xuất. Map tổng mới dùng làm căn cứ thiết kế luồng đi/chặn; chưa là nguồn tách lớp hoặc tọa độ gameplay đã chốt. Sau khi footprint được chọn, ground/props/foreground phải bám cùng tọa độ; nền bị che cần vẽ bù và các nguồn phải kiểm bằng ghép lại. Người phát triển bố trí và chỉnh vùng trong editor.

## 2. Tỷ lệ và chất lượng native

Runtime/editor dùng frame nhân vật 64 × 96, chân (32,88), cỡ chơi 1×. Một pixel ART native tương ứng một đơn vị thế giới. Camera thay đổi vùng nhìn; không thu nhỏ người để giả lập map rộng. Cửa, cầu, bậc thang và đường cần đủ chỗ cho người tại tỷ lệ này.

VFX R01 dùng canvas 96 × 96, body 80, chân (48,88) để đối chiếu ART ở 1×; không thay frame/anchor runtime, collider hoặc tốc độ đang chạy. Khi bàn giao ART map mới, ghi rõ nguồn nhân vật/adapter và kiểm lại tỷ lệ với runtime; không đồng nhất canvas với chiều cao body.

ART phải rõ ở cỡ chơi 1×. Bản nền hiện hành vẽ lại sáu khu ImageGen ở 1254 × 1254, đăng ký tọa độ gần tỷ lệ 1 và ghép thành world 3072 × 2048; ghi rõ nguồn từng khu và đường nối, không gọi là một lần sinh native 3072. Các bản ảnh tổng 1536 × 1024 phục hồi 2× giữ làm lịch sử so sánh. Không lấy upscale làm bảo đảm chi tiết cho asset sản xuất. Kích thước nguồn đủ để xuất mà không kéo mờ. Kiểm 1× và phóng nguyên lần; tránh bilinear lọc sprite. Đo vị trí chân đế trong ảnh sau xuất, không coi tâm ảnh hoặc tâm bounds là pivot.

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

[Thư viện editor](design/world/map-asset-library/README.md) là đầu vào nhập sẵn hiện tại, còn trống. Gói map tổng mới bàn giao riêng gồm một nền/prefab và dự án đã đặt nền; không đăng ký vào manifest hoặc tự sửa nháp. Manifest ghi id, ảnh/part, kích thước và pivot; không tự gán vùng chặn. Khi thêm ảnh vào manifest, đồng bộ bằng `npm.cmd run assets`. PNG/WebP tự nhập được giữ trong JSON dự án.

Lưu nguồn có layer hoặc nguồn rời, prompt/input nếu dùng imagegen, metadata, ảnh đối chiếu và trạng thái đánh giá. Tên/phiên bản phải cho biết nguồn đang dùng. Các bản cũ chỉ được giữ khi người phát triển chưa yêu cầu xóa; đợt reset này đã xóa bộ trước theo yêu cầu.

Chunk là cách tải/chia không gian, layer là quan hệ hiển thị trong một khu. Chỉ chia chunk khi cần; giữ tọa độ toàn cục và kiểm mép 1×/2×, không cắt vật thể ở đường nối. Nếu cần nền lặp, kiểm seam trước khi gọi là tile seamless.

## 6. Kiểm tra và tiếp tục

Kiểm kỹ thuật: PNG/metadata khớp, alpha/part/pivot đúng, đường đi và portal dùng cùng tọa độ, lưu/xuất/nhập không mất dữ liệu. Duyệt hình ảnh: hình dáng, tỷ lệ, nét/màu, bố cục và trải nghiệm do người phát triển đánh giá riêng. Build/test không đồng nghĩa ART được chấp nhận.

Theo lựa chọn mới, chốt map tổng và navigation trước, rồi mới sản xuất nhóm asset cần thiết. Người phát triển ghép và Test level, phản hồi asset/công cụ còn thiếu. Không tự quay lại nhiệm vụ/combat/loot/đột phá hoặc chân dung UI khi chưa chuyển ưu tiên.
