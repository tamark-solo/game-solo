# Nghiên cứu workflow Level Design — 08/10/2026

Mục tiêu là làm editor của dự án phục vụ quy trình hiện tại: mở map đầy đủ ở kích thước native, tự vẽ navigation, kiểm đường đi, rồi bổ sung asset rời. Các quyết định dưới đây được rút ra từ tài liệu chính thức; phần áp dụng là thiết kế của dự án.

| Engine / editor | Cách tổ chức được tham khảo | Áp dụng trong Map Studio |
| --- | --- | --- |
| [Unity — Editor windows](https://docs.unity.com/en-us/engine/6000.6/manual/unity-editor/editor-windows-views-reference) | Hierarchy quản lý đối tượng, Scene biên tập, Inspector sửa lựa chọn, Project chứa asset, Game chơi thử | Cây Scene bên trái; canvas chính giữa; một Inspector bên phải; Assets trong dock dưới; Chơi thử riêng |
| [Godot — Inspector](https://docs.godotengine.org/en/stable/tutorials/editor/inspector_dock.html), [TileMapLayer](https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html) | Inspector theo lựa chọn, thuộc tính chia nhóm; công cụ tile xuất hiện khi chọn đúng loại node; chia nhiều layer | Inspector phân biệt level/layer/instance/asset; foldout giữ trạng thái; toolbar theo Bố trí hoặc Navigation |
| [Tiled — Layers](https://doc.mapeditor.org/en/stable/manual/layers/), [Objects](https://doc.mapeditor.org/en/stable/manual/objects/) | Image layer cho nền, object layer cho hình học; khóa/ẩn layer; sửa polygon trực tiếp | Giữ nền và polygon độc lập; Scene/Navigation bắt chọn riêng; mắt/khóa trong cây layer; sửa đỉnh trên canvas |
| [LDtk — Interface](https://ldtk.io/docs/general/editor-components/), [IntGrid](https://ldtk.io/docs/general/intgrid-layers/) | Palette theo layer đang chọn; giá trị gameplay có màu riêng; Tab thu gọn interface | Chọn ý nghĩa Đi/Chặn/Cửa trước, chọn hình sau; màu nhất quán; Tab tập trung canvas; thư viện có tab và đổi chiều cao |

## Quyết định triển khai

Giữ Canvas2D, schema và runtime đang có; áp dụng kiến trúc thao tác của các editor trên vào Map Studio. Map nền hiện tại là ảnh bake và navigation là polygon tự do, nên mô hình image + object geometry của Tiled phù hợp hơn việc ép ảnh thành tile hoặc IntGrid. Tile brush, prefab và multipart tiếp tục phục vụ giai đoạn tách asset.

Một màn hình chỉ có một mục tiêu chỉnh sửa: Bố trí bắt instance; Navigation bắt vùng. Nhóm có cả instance và vùng vẫn dịch nguyên khối khi được chọn từ cây Scene. Vùng nhỏ được ưu tiên hơn vùng lớn bao quanh khi click Navigation. Hít căn chỉnh dùng đối tượng cùng miền chỉnh sửa, với biên level là mốc chung.

Thao tác phụ chuyển vào menu Chỉnh sửa, Hiển thị, quản lý level và thư viện. Kiểm tra/kết nối là các tab dock; minimap nằm trong Hiển thị. Canvas không bị kẹp giữa nhiều danh sách độc lập. Inspector chỉ hiện thuộc tính mục đang chọn, có liên kết từ instance về asset nguồn.

Polygon đóng bằng đỉnh đầu hoặc Enter, Backspace bỏ đỉnh vừa vẽ; hoàn tất chuyển về Chọn để sửa trực tiếp. Nếu tạo vùng thất bại do khóa hoặc dữ liệu không hợp lệ, giữ bản vẽ để xử lý. Vừa khung hỗ trợ zoom xuống 0,05× để chứa map native lớn; Chơi thử giữ 1×.

## Kiểm chứng

`npm run test:map-studio` kiểm lựa chọn qua hai miền, ưu tiên vùng nhỏ, polygon/undo, Inspector theo ngữ cảnh, dock kéo đổi cỡ, Tab và fit map 3072 × 2048. Bộ `test:map-editor` và `test:level-design` kiểm lại collision, portal, nhóm/prefab, multipart, lưu/xuất và bản nháp.

Fixture chỉnh sửa dùng ảnh tổng hợp và storage trong `artifacts`. Bản Hằng Nhạc bàn giao được mở trong profile kiểm riêng để chụp giao diện, giữ nguyên ảnh/nền khóa và 0 vùng. Ảnh `artifacts/map-studio-level-workspace.png` là bằng chứng bố cục editor, không xác nhận map đã có navigation hoặc được duyệt ART. File trong `docs/data/authored-maps/` không được sửa bởi các kiểm này.
