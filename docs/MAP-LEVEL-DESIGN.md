# Level Design trong Map Editor

**Phiên bản:** 1.0 · **Bản chạy:** 0.12.0 · **Ngày:** 08/10/2026. Đây là bộ công cụ xây level 2D trong dự án: asset → bố trí → layer/vùng → kiểm tra → Test → lưu/xuất. Người phát triển sở hữu bố cục và navigation; trợ lý phát triển công cụ và sản xuất asset khi được yêu cầu.

Mở **http://127.0.0.1:5173/map-editor.html**. Bộ ART map cũ đã xóa; thư viện mặc định trống theo [biên bản reset](MAP-ASSETS-RESET.md). Nhân vật vẫn 64 × 96, chân (32,88), Test mặc định 1×. Không tự tạo cảnh mẫu thay người phát triển.

## 1. Các khu vực làm việc

| Khu vực | Công cụ hiện có |
| --- | --- |
| Thư viện | Nhập nhiều PNG, tìm/phân loại, nhập tileset theo ô; nhập/xuất thư viện JSON |
| Thuộc tính asset | Tên, loại, pivot, layer mặc định; thêm part cùng canvas, đổi cờ phần che, thay PNG và xóa part |
| Scene | Kéo thả/đặt, khung chọn, chọn nhiều, kéo cả cụm, nhân bản/xóa, undo/redo, sao chép/dán |
| Sắp xếp | Nhóm/tách nhóm, căn bốn mép/hai trục giữa, phân bố ngang/dọc, dịch bằng phím, xem vùng chọn |
| Brush | Nét cọ theo ô, tô hình chữ nhật và gôm asset trên layer hiện tại; một nét cọ là một bước undo |
| Prefab | Lưu chọn thành cụm gồm vật và vùng thủ công; đặt lại giữa các level, giữ canvas/pivot và khoảng cách |
| Layer | Đổi tên/kiểu/thứ tự, hiện/ẩn, khóa, bật/tắt hoạt động; xem riêng layer hiện tại |
| Navigation | Vùng đi/chặn/cửa chữ nhật hoặc đa giác, sửa/thêm/xóa đỉnh, Spawn, luồng level |
| Camera | Pan/zoom, vừa khung/1×/vùng chọn, minimap bấm để chuyển khung; cull hình ngoài camera |
| Kiểm level | Spawn, mép hình/vùng, đa giác tự cắt, level đích/điểm đến và luồng từ level đầu |
| Test | Người thật từ atlas, WASD/mũi tên, E qua cửa; va chạm chân, xếp theo chân và mờ phần che đúng alpha |
| Lưu/xuất | Nháp trình duyệt, file workspace, JSON dự án/level/thư viện và runtime riêng |

## 2. Quy trình dựng một level

1. **Tạo dự án/level.** Chỉnh tên, cỡ, nền và luật đi trong Thuộc tính. Đặt Spawn. Mỗi level có bộ layer/vật/vùng riêng; thêm hoặc nhân level theo nhu cầu.
2. **Nhập asset.** PNG giữ kích thước native. Chọn asset, mở Thuộc tính asset để đặt tên/phân loại/pivot/layer mặc định. Cờ phần che dành cho tán/mái; part cùng vật phải dùng chung canvas. Thay PNG giữ cùng kích thước để vị trí và pivot của instance không đổi.
3. **Dựng nền.** Nhập PNG tileset với ô rộng/cao chia hết kích thước ảnh. Đây là sheet đều, chưa hỗ trợ margin/spacing/autotile. Tile trống được bỏ qua; tile có pivot (0,0), loại Nền và layer Nền. Chọn tile → Cọ hoặc Tô ô; đặt Ô cọ theo bước ghép cần dùng. Không tự gọi tile là seamless khi chưa kiểm mép.
4. **Bố trí vật/cụm.** Kéo PNG vào scene, hoặc chọn rồi bấm đặt. Shift/Ctrl+bấm thêm/bỏ chọn; kéo vào khoảng trống tạo khung chọn. Nhóm cả vật và vùng cần đi cùng nhau. Căn chỉnh theo mép hình; cụm được nhóm dịch nguyên khối, giữ các vùng bên trong. Alt+bấm để chọn riêng thành phần.
5. **Lưu prefab.** Chọn vật và các vùng của chúng, đặt tên rồi Lưu chọn. Prefab giữ vị trí tương đối theo góc trái/trên của phạm vi chọn, không bake nền hoặc mask đa giác vào PNG. Đặt prefab ở level khác sẽ dùng layer tương ứng hoặc tạo layer thiếu; layer đang khóa ngăn đặt. Chỉnh instance không tự ghi đè mẫu prefab.
6. **Vẽ vùng.** Chọn Vùng đi/Chặn/Cửa nối, kéo chữ nhật hoặc bấm các đỉnh rồi Enter. Chọn vùng: kéo đỉnh; Shift+bấm cạnh thêm đỉnh, Alt+bấm đỉnh xóa, tối thiểu ba đỉnh. Có thể sửa tọa độ bằng danh sách trong Thuộc tính. Vùng không tự sinh từ ART.
7. **Kiểm và Test.** Bấm Kiểm tra, chọn thông báo để tới level/vật/vùng lỗi. Sửa Spawn, đa giác hoặc điểm đến sai; xem luồng cửa. Test ở 1× rồi đi thử cổng, cầu, đường hẹp, trước/sau và hai cạnh phần che. Kiểm hình ảnh/bố cục riêng với kiểm kỹ thuật.
8. **Lưu và bàn giao.** Ctrl+S lưu vào workspace; Xuất dự án để sao lưu toàn bộ, Xuất level để tái sử dụng từng khu, Xuất thư viện để chuyển PNG/prefab. Xuất runtime chỉ thực hiện khi không còn lỗi cấp error; lưu ý về mép hình hoặc level độc lập không chặn xuất.

Cọ bỏ qua vị trí trùng của cùng asset, không bỏ sót ô khi rê nhanh. Với tile loại Nền, cọ thay tile cũ tại ô cùng layer. Gôm chỉ sửa layer đang chọn, giữ vật/nhóm đang khóa và nhóm prefab; chọn cụm rồi Xóa hoặc tách nhóm nếu cần bỏ cụm. Mỗi lần tô chữ nhật tối đa 2000 ô; tổng một level tối đa 10000 instance.

Ẩn và Chỉ layer chọn điều khiển khung biên tập; Test hiển thị ART đang hoạt động của toàn level. Bật/tắt hoạt động điều khiển Test/runtime. Ẩn layer dữ liệu vẫn giữ va chạm. Khóa một layer liên quan tới prefab/multipart ngăn sửa cả cụm; không tự di chuyển phần còn lại làm lệch hình và vùng.

## 3. Phím tắt

| Phím | Tác dụng khi biên tập |
| --- | --- |
| V / H / B | Chọn / pan / cọ |
| Space + kéo hoặc chuột giữa | Pan camera |
| Cuộn / F | Zoom tại con trỏ / xem vùng chọn |
| Shift/Ctrl+bấm | Chọn nhiều; Alt+bấm chọn riêng trong nhóm |
| Ctrl+A | Chọn các vật/vùng có thể sửa đang hiện |
| Ctrl+G / Ctrl+Shift+G | Nhóm / tách nhóm |
| Ctrl+C / Ctrl+V | Sao chép / dán cụm trong editor tại tâm khung |
| Mũi tên / Shift+mũi tên | Dịch lựa chọn một bước snap / mười bước |
| Ctrl+D / Delete | Nhân bản / xóa lựa chọn |
| Ctrl+Z / Ctrl+Shift+Z | Undo / redo |
| Ctrl+S | Lưu file dự án |
| Enter / Esc | Hoàn tất polygon / hủy công cụ hoặc dừng Test |

Phím của ô nhập vẫn hoạt động bình thường. Khi Test, WASD/mũi tên điều khiển người, E qua cửa, Esc trở lại chỉnh. Có thể chuyển level để thử riêng Spawn của từng khu.

## 4. Dữ liệu và tính tương thích

Schema authoring `game-solo-map-editor-1` được mở rộng bằng trường tùy chọn: asset có `category/defaultLayer`, vật/vùng có `groupId`, project có `prefabs`. Dự án phiên bản trước vẫn đọc được nếu PNG tham chiếu còn tồn tại. Reset không xóa dữ liệu tự lưu; bản dùng preset đã xóa được báo thiếu asset, không tự thay ART.

Prefab gồm layer mẫu, instance và polygon tương đối. Asset được lưu một lần trong thư viện của project. Xuất thư viện dùng `game-solo-asset-library-1`, mang theo PNG DataURI và prefab. Nhập thư viện giữ level hiện tại, không ghi đè định nghĩa khác cùng id; asset/prefab tương đương được tái sử dụng.

`game-solo-editor-level-1` giữ đầy đủ dữ liệu sửa tiếp, kể cả phần tắt. `game-solo-runtime-map-1` chứa level đầu, cấu hình người, danh sách level và dữ liệu vùng hoạt động/portal; loại vật trên layer tắt hoạt động. Runtime export là hợp đồng để nối vào game sau, chưa tự triển khai vào server MMO.

Vị trí lưu giữ như [Map Editor](MAP-EDITOR.md): `docs/data/authored-maps/<project-id>.json` và file riêng mỗi level trong `<project-id>.levels/`. Nháp trình duyệt bổ sung khả năng khôi phục; Ctrl+S hoặc Xuất JSON mới bàn giao file. API local dev/preview ghi an toàn và không sửa map khác.

Giới hạn hiện tại: PNG 4 MB, thư viện 200 asset, 8 part/asset, 64 prefab/project, 64 level, 64 layer/level, 3000 vùng/level, JSON 20 MB. Tileset theo lưới đều; chưa có autotile, công cụ vẽ raster, undo sau khi đóng trình duyệt, cộng tác nhiều người hoặc tự triển khai online. Những phần đó là khả năng nâng cấp riêng, không cần để ghép/Test level hiện tại.

## 5. Kiến trúc và kiểm tra

- [map-editor.ts](../client/src/map-editor.ts): scene, selection/brush, UI, cache alpha, Test và camera.
- [map-editor-import.ts](../client/src/map-editor-import.ts): đọc PNG và tách tileset đúng ô, không sinh ART.
- [shared/map-editor.ts](../shared/map-editor.ts): schema, kiểm nhập, va chạm chân và portal.
- [shared/level-design.ts](../shared/level-design.ts): phép biến đổi/căn chỉnh nhóm, prefab, thư viện và audit/runtime export.
- [map-editor-api.ts](../scripts/map-editor-api.ts): file workspace và mirror level.
- [Quy tắc xây map](MAP-BUILDING-GUIDE.md): chất lượng native/alpha/pivot và phân công lâu dài.

Kiểm bằng `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run test:map-editor`, `npm.cmd run test:level-design`, `npm.cmd run build`. Fixture PNG là các hình alpha đơn giản tạo riêng trong browser test; không thêm ART vào thư viện sản xuất. Browser test chỉ ghi thư mục test trong `artifacts/`, không ghi vào authored-maps.
