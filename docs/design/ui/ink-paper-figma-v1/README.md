# Mực–Giấy–Chu Sa — Figma review 01

15/10/2026. Thiết kế để owner duyệt trước khi gắn vào game.

[File Figma](https://www.figma.com/design/UPHYPGFwDD04IAyPt7TOJL) · [HUD khám phá](https://www.figma.com/design/UPHYPGFwDD04IAyPt7TOJL?node-id=2-38) · [Prototype](https://www.figma.com/proto/UPHYPGFwDD04IAyPt7TOJL?node-id=2-38)

## Đã ghi lên Figma

Bảng mỹ thuật/components 2:37; HUD khám phá 2:38; HUD boss 2:39; Linh Đài–Pháp bảo 2:40; Hành trang 2:41; Chuẩn bị Trúc Cơ 2:42. Mỗi frame 1440×900, có editable text, auto-layout và component instances. Hai font Be Vietnam Pro/Noto Serif là đề xuất mới. Có semantic color tokens và 14 liên kết chuyển màn; chưa mô phỏng mọi chức năng.

Raster chỉ là nội dung tham chiếu: sân R01-native từ hang-nhac-van-ngoc-detail-v2, Huyễn Tâm sword-a body/native production V1, Hắc Ấn sprites/officer neutral03. Không dùng screenshot toàn UI làm lớp nền. Không thay nguồn ART hay suy approval mới.

Đã kiểm cấu trúc sáu frame và đúng font, sửa lỗi co chiều cao của horizontal auto-layout. review-0.png đến review-4.png là ảnh bảng mỹ thuật và bốn màn đầu sau sửa.

## Còn lại do giới hạn công cụ

Figma MCP báo hết hạn mức gọi trên Starter plan. Lượt polish bị từ chối, không được ghi. Cần tiếp tục đúng file/node trong state.json:

- Chỉnh padding/width button instances còn hug sát chữ và label Pending trên showcase.
- Thay mã số hành trang bằng glyph/artwork; hiện là placeholder có chú thích.
- Sửa nhãn Tạ Kiếm Sơn đang trên người chơi trong HUD khám phá, hoặc thêm đúng NPC vào cảnh.
- Nối nút xem trạng thái trang bị; hiện nút này chưa có interaction.
- Xuất ảnh và kiểm màn Chuẩn bị Trúc Cơ; chưa kiểm được bằng ảnh. Kiểm lại màn đã sửa sau polish.

Đây là bản nháp desktop để duyệt hướng, chưa hoàn thiện/mobile. Minimap, số liệu, phím/skill, điều kiện đột phá và khe né đều là minh họa UX, không xác nhận gameplay/balance. Không sửa runtime, map, navigation hoặc DB.
