# Phân công xây map — 08/10/2026

**Quy trình hiện hành được chủ dự án yêu cầu:** map đầy đủ trước, thiết kế navigation tiếp, asset rời sau. [Map Hằng Nhạc mới](design/world/hang-nhac-map-v1/README.md) dùng một ảnh đủ công trình để chủ dự án có căn cứ vẽ luồng đi/chặn. Concept, nền sạch và ba asset thử vừa tạo đã [xóa](data/hang-nhac-review-reset-2026-10-08.json); không dùng lại nguồn hoặc builder của bộ đó.

Trợ lý được yêu cầu dựng map tổng theo GDD, lấy nhân vật native làm chuẩn tỷ lệ và chuẩn bị ảnh/gói Editor nhẹ. Chủ dự án vẽ/chỉnh vùng đi/chặn, Spawn và cửa nối, kiểm luồng và quyết định footprint. Việc này thay lựa chọn trước là bắt đầu bằng các asset rời rồi tự ghép; không thay quyền sở hữu map đã biên tập.

Quy trình: trợ lý tạo map tổng → ghép sprite 64 × 96/chân (32,88) ở camera 1× để kiểm tỷ lệ → bàn giao nền đầy đủ và dự án Editor riêng → chủ dự án tạo vùng đi/chặn và kiểm Test → chốt footprint → trợ lý sản xuất asset cần thiết với cùng tọa độ/pivot và dựng đủ nền phía sau → thay dần phần bake, kiểm thứ tự che người.

Nhà/cây/cổng cần phần che sẽ dùng alpha đúng mép và các part có canvas/pivot chung. Không lấy polygon gameplay làm mask ART. Cụm thấp có thể gộp khi cùng quan hệ trước/sau. Giữ prompt/nguồn/metadata và đánh giá mỹ thuật riêng với kiểm kỹ thuật.

Dữ liệu trong `docs/data/authored-maps/` và nháp trình duyệt thuộc chủ dự án. Khi phát triển công cụ hoặc kiểm nhập map mới, dùng profile/storage test riêng; không ghi đè map của chủ dự án. Gói map mới là file bàn giao, không tự nhập vào browser Editor đang mở.

Hằng Nhạc là hub sinh hoạt/tu luyện/luyện thuật/chuẩn bị. Farm ngoại vi và khảo nghiệm thuộc scene riêng; lối farm không đồng nhất với xuất hành HN12. Chưa mở nhiệm vụ/combat/loot/server hoặc chân dung UI trong đợt này.

Xem [GDD](GDD.md), [quy tắc xây map](MAP-BUILDING-GUIDE.md), [Map Editor](MAP-EDITOR.md), [Level Design](MAP-LEVEL-DESIGN.md) và [reset](MAP-ASSETS-RESET.md). MP01–MP07/MAP03, ART Hằng Nhạc v1/v2/v3 và các walk study trước đều đã dừng; không khôi phục từ lịch sử duyệt.
