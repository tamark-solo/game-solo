# Hướng dẫn làm việc trong game-solo

**Ưu tiên ngày 08/10/2026:** người phát triển yêu cầu xóa toàn bộ asset map cũ để bắt đầu lại. Đã dọn nguồn ART, PNG xuất, chunk/mask, ZIP và bản sao public. Thư viện mới trống; không dựng lại bộ cũ từ kế hoạch lịch sử. Xem [trạng thái reset](docs/MAP-ASSETS-RESET.md).

## Công việc liên quan đến map

Trước khi sửa ART môi trường, layer, thứ tự vẽ, camera, va chạm, đường đi hoặc quy trình xuất asset, đọc:

1. [Quy tắc xây map](docs/MAP-BUILDING-GUIDE.md).
2. [Phân công sản xuất asset](docs/MAP-ASSET-PRODUCTION-NOTES.md).
3. [Level Design](docs/MAP-LEVEL-DESIGN.md), [Map Editor](docs/MAP-EDITOR.md) và [thư viện mới](docs/design/world/map-asset-library/README.md).

Giữ các quyết định sau:

- Người phát triển tự bố trí map, layer và vùng đi/chặn trong editor. Trợ lý tạo asset rời và phát triển công cụ. Không tự sửa bố cục/vùng trong `docs/data/authored-maps/` khi sửa editor.
- Bộ Hằng Nhạc/ngoại viện cũ và tham chiếu ART cũ đã xóa theo yêu cầu. Chưa chốt tham chiếu hoặc bố cục mới. Không tự khôi phục MP01–MP07/MAP03 hoặc bộ native trước.
- Nhân vật giữ frame 64 × 96, chân (32,88), cỡ chơi mặc định 1×. Sản xuất ART native theo tỷ lệ đó.
- Tách nền sạch, cụm tĩnh, vật thể xếp theo chân, phần che cần điều khiển và dữ liệu gameplay. Chỉ ghép chung ảnh các vật có cùng quan hệ trước/sau với người chơi; nhóm chỉnh sửa có thể chứa nhiều đối tượng.
- Dùng alpha đúng mép vật thể cho phần che. Polygon đơn giản dùng cho va chạm/vùng gameplay, không thay mép tán/mái trong ART.
- Asset nhiều part dùng chung canvas/pivot. Đo điểm chân sau xuất; không coi tâm ảnh là chân đế. Nền phía sau phần che phải đầy đủ, không phóng ảnh tổng rồi dùng mask đa giác làm ART sản xuất.
- Lưu nguồn có layer/nguồn rời, prompt/input nếu dùng imagegen, metadata và trạng thái chất lượng của asset mới. Khi tạo/chỉnh raster dùng skill imagegen và lưu trong workspace.
- Kiểm kỹ thuật và duyệt hình ảnh riêng biệt; không suy ownerApproved/artApproved từ build/test.
- Không xóa/sửa dữ liệu map người phát triển hoặc bản nháp trình duyệt khi dọn asset. Reset thư viện mở dự án mới; giữ bản cũ để người phát triển xử lý dữ liệu cần thiết.
- Không tự mở nhiệm vụ/combat/loot/đột phá hoặc chân dung UI khi vẫn ở giai đoạn map, trừ khi người dùng chuyển ưu tiên.

Hướng dẫn giữ ngữ cảnh, không tạo thêm bước xin phép. Tiếp tục việc đã được yêu cầu; chỉ dẫn mới nhất của người dùng được ưu tiên.

**Level Design 0.12.0:** đã có chọn nhiều/nhóm/căn chỉnh, brush/tileset, prefab kèm vùng, thư viện JSON, multipart editor, minimap, audit và runtime export. Schema mở rộng tương thích dự án cũ. Kiểm bằng `npm.cmd run test:level-design` và `npm.cmd run test:map-editor`; không ghi fixture vào authored-maps. Không tạo ART mới hoặc tự bố trí level để minh họa công cụ nếu chưa được yêu cầu.
