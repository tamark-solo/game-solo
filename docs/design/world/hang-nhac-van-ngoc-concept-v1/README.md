# Hằng Nhạc · Ngoại viện trên biển mây

**11/10/2026 · Concept thay phong cách theo yêu cầu owner.** Dùng cùng ngôn ngữ hình ảnh với [Tiên môn của màn đầu/đăng nhập server](../../ui/title-tien-mon-v1/README.md): đá ngọc xám, mái xanh trầm, đồng cổ, tùng, biển mây ngà và bình minh ấm. Đây là bản đề xuất mỹ thuật để bắt đầu xây dựng; chưa thay nền/layer/navigation/runtime hiện hành.

**Owner duyệt hướng concept 11/10:** “tôi đồng ý, nhìn khá tốt”. Lấy bản này làm mẫu nét, màu, chất liệu và không khí cho các khu chi tiết. Phạm vi xác nhận là concept tổng; chưa duyệt chất lượng native của ART sản xuất, đăng ký footprint hoặc navigation/tích hợp mới.

## Hướng mỹ thuật

- Không gian: ngoại viện của một môn phái cổ trên núi cao; người mới cảm nhận con đường tu đạo ngay khi vào sân.
- Chất liệu: đá phong hóa và rêu nhẹ, mái ngói xanh xám, chi tiết đồng cũ dùng có điểm nhấn. Kiến trúc lớn dành cho chính điện; nhà chuẩn bị nhỏ và có công năng.
- Màu: petrol-teal ở bóng đổ, celadon/xám ngọc ở đá, ngà ở mây, vàng bình minh và đèn lồng tiết chế. Dành độ tương phản cho người và telegraph.
- Khí: linh vụ ở rìa vực, đường khí mảnh ở nơi thổ nạp, hoa văn trận pháp chìm trên sân. Tránh mây/ánh sáng che đường hoặc hiệu ứng nguy hiểm.
- Camera: góc nhìn cao cố định phù hợp game 2D, không lấy góc máy thấp/horizon của màn đầu làm camera gameplay.

## Bố cục và nội dung

Bố cục lấy [nền access-v5-clean-v1](../hang-nhac-map-v1/README.md) làm đầu vào. Prompt yêu cầu giữ vị trí nhà/cổng, kết nối đường, cầu và bậc thang. Đầu ra ImageGen vẫn cần đo đối chiếu trước sản xuất; yêu cầu trong prompt không chứng minh footprint đã giữ từng pixel.

| Điểm nhìn | Vai trò | Phạm vi hiện có/đề xuất |
| --- | --- | --- |
| Cổng dưới → sân tiếp dẫn | Vào môn phái, thấy mục tiêu gần và người khác | HN01/NPC tiếp dẫn đã có; tên địa điểm mới chỉ là mỹ thuật |
| Sân trung tâm | Định hướng, giao tiếp, biểu hiện nhân vật/pháp bảo sau này | Giữ mặt sân thoáng; không cấp tính năng MMO mới từ concept |
| Đài thổ nạp bên trái | Không gian tĩnh, cảm nhận vận khí và chuẩn bị | HN02/M01/thổ nạp hiện có |
| Sân luyện bên phải | Đọc đòn, mục tiêu luyện, khoảng trống né | HN03–HN04/R01 hiện có |
| Ngoại viện chuẩn bị dưới phải | Vật tư, hành trang, nền chức năng luyện chế sau này | Vật tư/đồ nhập môn đã có; luyện chế là đề xuất |
| Chính điện và đường núi phía trên | Trục thị giác và lời hứa hành trình dài | Không tự gán NPC/cổng/xuất hành chưa triển khai |

Luồng chức năng: tiếp dẫn → thổ nạp/chuẩn bị → luyện thuật → quay về chuẩn bị → ngoại vi riêng. Ngoại vi farm và khảo nghiệm vẫn là scene riêng theo [GDD](../../../GDD.md); lối farm không đồng nhất với xuất hành HN12. Không đưa quái, loot hoặc arena vào sân môn phái này.

## Hồ sơ và kiểm tra

- [Prompt đầy đủ](prompt.txt), [metadata/nguồn/hash](concept.json), [trang xem và chú thích](index.html).
- Công cụ: skill imagegen, **built-in image_gen**. Nền hiện hành là edit target/layout; nền Tiên môn chỉ tham chiếu nét, chất liệu và ánh sáng.
- Đầu ra nguyên bản và bản web được lưu cùng thư mục; kích thước thực ghi trong metadata. Bản concept không được gọi là nguồn native 3072 × 2048 chỉ vì trình xem đặt kích thước đó.
- Hợp đồng để xây: world dự kiến 3072 × 2048, camera 1×; sprite locomotion 64 × 96, chân (32,88), body khoảng 80/80/82 px. Không thu nhỏ người để làm công trình trông lớn hơn.
- Duyệt mỹ thuật/layout/tỷ lệ tách khỏi kiểm kỹ thuật. `ownerApproved`/`artApproved` đã true với scope **hướng mỹ thuật concept tổng** theo phản hồi trực tiếp của owner; ART khu chi tiết, footprint và bản runtime có trạng thái riêng.
- Không sửa authored map, draft Editor, 9 blocker, Spawn, bậc thang, DB, atlas hoặc runtime. Chú thích trên trang xem là điểm nhìn biên tập, không phải tọa độ NPC/collider/portal.

## Từ concept đến map xây được

1. Hướng mỹ thuật concept tổng đã được owner chấp nhận. Dùng làm tham chiếu thống nhất; tiếp tục kiểm mẫu sân chi tiết ở tỷ lệ người thật, ghi riêng phản hồi nét/màu, tỷ lệ, bố cục.
2. Dùng hệ tọa độ 3072 × 2048 để khóa footprint theo map owner. Chia khu có phần chồng, giữ bố cục và mẫu phong cách làm hai tham chiếu riêng theo [quy trình](../../../MAP-CONCEPT-SECTOR-WORKFLOW.md).
3. Vẽ chi tiết gần kích thước dùng, kiểm cửa/đường/bậc với sprite 64 × 96; căn và ghép, kiểm đường nối. Không dùng upscale concept để thay bước này.
4. Bàn giao nền đầy đủ và dự án Editor riêng; chủ dự án kiểm/chốt navigation. Không ghi đè dự án hoặc nháp hiện hành.
5. Sau footprint: nền sạch có phần phía sau mái/tán đầy đủ; nhà/cây xếp theo chân; mái/tán alpha riêng, cùng canvas/pivot. Giữ nguồn/input/prompt/metadata cho từng asset.
6. Tích hợp client/server cùng release khi ART/navigation đã khớp; kiểm hồi quy map/layer/NPC/R01/sect/lessons/reload. Concept này chưa thực hiện bước tích hợp.
