# Map Editor — thiết kế level trong dự án

**Phiên bản:** 2.0, ngày08/10/2026. **Bản chạy:** 0.12.0. Người phát triển tự bố trí map và vẽ vùng hoạt động; trợ lý tạo asset và phát triển công cụ. Bộ ART map cũ đã xóa theo yêu cầu; xem [trạng thái reset](MAP-ASSETS-RESET.md).

Các công cụ Level Design mở rộng và quy trình từng bước ở [hướng dẫn riêng](MAP-LEVEL-DESIGN.md): chọn nhiều/nhóm/căn chỉnh, brush/tileset, prefab, part, thư viện, minimap và kiểm/xuất runtime.

Mở **http://127.0.0.1:5173/map-editor.html** sau `npm.cmd run dev`. Map mới trống, thư viện có **0 asset** và vẫn cho nhập PNG riêng. Đây là công cụ biên tập/test cục bộ trong dự án; chưa nối level được tạo vào server MMO.

## 1. Quy trình làm một khu/level

1. Đặt tên dự án; chọn hoặc thêm level. Sửa tên/kích thước/màu nền/luật đi ở Thuộc tính khi không chọn vật.
2. Kéo asset từ thư viện vào khung, hoặc chọn asset rồi bấm để đặt. Dùng V/Chọn để kéo vật; chỉnh X/Y, tỷ lệ, lật ngang, opacity và pivot trong Thuộc tính. PNG riêng nhập tối đa4MB; ảnh được giữ trong dữ liệu dự án.
3. Chọn layer, tạo/đổi tên/đổi kiểu, sắp thứ tự, hiện/ẩn, khóa và bật/tắt hoạt động. Chuyển vật sang layer khác bằng Thuộc tính. Nhân bản/xóa và undo/redo hỗ trợ thao tác biên tập.
4. Chọn Vùng đi hoặc Chặn: kéo hình chữ nhật, hoặc bấm các đỉnh đa giác rồi Enter/Hoàn tất. Chọn vùng rồi kéo các đỉnh hoặc sửa danh sách tọa độ. ART không tự sinh vùng chặn.
5. Đặt Spawn bằng công cụ Điểm xuất hiện hoặc nhập X/Y. Chọn luật **Toàn level trừ vùng chặn** hoặc **Chỉ trong vùng đi**. Vùng đi liền nhau có thể nối tại mép chung.
6. Vẽ Cửa nối level, chọn level đích và điểm đến; để trống điểm đến để dùng Spawn của đích. Danh sách Luồng level thể hiện kết nối và cửa chưa có đích.
7. Bấm **Test map**: cỡ mặc định1×, người64 × 96, chân(32,88), collider chân8px. WASD/mũi tên để đi, E khi đứng trong cửa để qua level. Esc/Dừng Test trở lại biên tập. Spawn/điểm đến bị chặn sẽ được báo để bạn chỉnh.
8. **Lưu dự án** hoặc Ctrl+S để ghi vào workspace. Xuất JSON dự án để sao lưu/chuyển máy; xuất/nhập riêng level để tái sử dụng từng khu.

Space hoặc chuột giữa: pan. Cuộn: zoom. Snap1/8/16/32px. Vừa khung/1× để xem bố cục hoặc cỡ thật. Ctrl+Z/Ctrl+Shift+Z: undo/redo; Ctrl+D: nhân bản; Delete: xóa chọn. Map lớn được nhìn qua camera/viewport, không co lại tỷ lệ người trong Test.

## 2. Layer, ART và hoạt động

| Kiểu | Vai trò |
| --- | --- |
| Nền | Mặt sân/đất/đường, dưới các vật và người |
| Trang trí thấp | Cỏ/bồn/chi tiết thấp, dưới vật thể |
| Theo chân | Nhà/cây/đạo cụ cùng xếp trước/sau với người theo Y điểm chân |
| Tán/mái | Cùng xếp theo chân; chỉ phần che giao với pixel người ở phía sau mới mờ35% |
| Dữ liệu vùng | Polygon đi/chặn/cửa nối; không vẽ vào PNG |

Thứ tự layer dùng trong cùng nhóm; Nền/Trang trí thấp luôn dưới nhóm theo chân. Vật thể và tán/mái chia layer để quản lý nhưng cùng thứ tự trước/sau theo chân trong Test. Với tree/gate multipart, một instance giữ chung canvas/pivot/tọa độ để thân–tán và cột–mái không lệch. Layer đã khóa không cho kéo/xóa/chỉnh các instance gắn với nó.

**Hiện/ẩn** và chế độ xem riêng layer chỉ điều khiển khung biên tập; Test hiển thị ART đang hoạt động của toàn level. Ẩn layer dữ liệu không tắt va chạm. **Hoạt động** mới điều khiển vật/vùng/cửa trong Test và dữ liệu hoạt động; từng vùng cũng có cờ riêng. Tắt tán/mái không sửa alpha của ảnh gốc. Không dùng polygon vùng hoạt động làm mask ART.

[Thư viện mới](design/world/map-asset-library/README.md) trống. Chọn bộ asset mới theo [quy tắc xây map](MAP-BUILDING-GUIDE.md); kiểm công cụ không đồng nghĩa với duyệt ART.

## 3. Dữ liệu và lưu

`game-solo-map-editor-1` chứa thư viện asset, danh sách level và level đang chọn. Mỗi level có id/tên/cỡ/nền/Spawn/luật đi, layer, instance và vùng riêng. Pivot có thể ghi đè ở từng instance. Portal tham chiếu id level và điểm đến; cửa thiếu đích vẫn giữ trong bản nháp nhưng không đi qua được.

Lưu ghi vào:

```text
docs/data/authored-maps/<project-id>.json
docs/data/authored-maps/<project-id>.levels/index.json
docs/data/authored-maps/<project-id>.levels/<level-id>.json
```

File dự án là dữ liệu tổng để mở lại. Mỗi level có file authoring riêng kèm asset nó dùng; index liệt kê level còn trong dự án. Khi bỏ level trong editor, những file mirror cũ có thể còn để phục hồi; không lấy toàn bộ JSON trong thư mục làm danh sách level đang dùng, hãy đọc index/dự án. Ghi file qua API local của Vite dev/preview; lưu liên tiếp từ editor được xếp hàng theo thao tác.

Bản nháp tự lưu trong trình duyệt theo từng project; **Mở bản lưu** có bản workspace và bản nháp. Tạo dự án trống vẫn giữ nháp trước. Local draft không thay nút Lưu vào dự án. Khi bộ nhớ trình duyệt hoặc API không lưu được, editor báo và bạn có thể xuất JSON.

**Xuất level** dùng `game-solo-editor-level-1`, giữ cả vùng tắt và layer để sửa tiếp. Nhập level thêm vào dự án hiện tại, không thay các level khác; id trùng hoặc asset cùng id nhưng nội dung khác được đổi id để giữ cả hai. Nhập dự án mở toàn bộ project. Asset thư viện tham chiếu PNG trong `/assets/map-kit/`; PNG tự nhập nằm trong JSON. Sau reset, editor mở dự án trống và giữ bản nháp trước. Bản dùng preset đã xóa được báo asset thiếu, không sửa/xóa bản lưu. Khi chuyển máy, cần mang PNG ngoài theo cùng dữ liệu.

Kiểm nhập giới hạn20MB/project,64level,64layer/level,200asset,10000instance/level,3000vùng/level. Chỉ PNG và đường dẫn asset local được nhận. Lỗi định dạng, ref layer/asset sai hoặc cỡ PNG không khớp không thay bản đang mở.

## 4. Thành phần và kiểm tra

- UI/Canvas2D authoring và Test: [map-editor.ts](../client/src/map-editor.ts), [trang](../client/map-editor.html).
- Schema/kiểm nhập/union vùng đi/portal/export: [shared/map-editor.ts](../shared/map-editor.ts); movement dùng chung `moveUsingCollision` của preview/game.
- Lưu workspace: [map-editor-api.ts](../scripts/map-editor-api.ts), gắn vào Vite dev và preview.
- Library: [manifest mới](design/world/map-asset-library/manifest.json), hiện có 0 asset. `npm.cmd run assets` đồng bộ nội dung hiện tại; builder kit cũ đã gỡ.
- Kiểm: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run test:map-editor`, `npm.cmd run test:level-design`, `npm.cmd run build`.

Browser test dùng thư mục `artifacts/map-editor-test-store`, không ghi layout thử vào thư mục map của người phát triển. Kiểm reset thư viện trống/giữ nháp cũ, kéo thả PNG thử được tạo trong test, chỉnh/pivot/khóa/undo, polygon/vertex, hoạt động layer, va chạm, luồng portal hai level, import PNG, lưu/ghi đè/mở/JSON và file riêng từng level. [Kết quả](data/map-editor-verification.json) là kỹ thuật; map/ART do người phát triển chọn vẫn cần đánh giá riêng.

Đây là editor ghép asset và vẽ navigation; chưa có tile-brush terrain, cộng tác nhiều người, quest/combat hoặc triển khai server MMO. Việc nối JSON authoring vào vùng online làm theo yêu cầu tiếp sau khi người phát triển có map để thử.
