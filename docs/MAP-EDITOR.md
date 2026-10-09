# Map Editor — thiết kế level trong dự án

**Phiên bản tài liệu:** 2.7, ngày 08/10/2026. **Bản chạy:** 0.12.0. Người phát triển tự bố trí map và vẽ vùng hoạt động; trợ lý tạo asset và phát triển công cụ. Bộ ART map legacy, ART Hằng Nhạc và hai bản thử vùng đi đã xóa theo yêu cầu; xem [trạng thái reset](MAP-ASSETS-RESET.md).

Các công cụ Level Design mở rộng và quy trình từng bước ở [hướng dẫn riêng](MAP-LEVEL-DESIGN.md): chọn nhiều/nhóm/căn chỉnh, brush/tileset, prefab, part, thư viện, minimap và kiểm/xuất runtime.

**Map Studio (08/10/2026):** editor tổ chức theo cây **Scene** bên trái, canvas chính giữa, một **Inspector** bên phải và dock **Assets / Cụm mẫu / Kiểm tra / Kết nối level** dưới canvas. Thiết kế tham khảo Unity, Godot, Tiled và LDtk; xem [nghiên cứu và quyết định](MAP-EDITOR-ENGINE-RESEARCH.md). `map-design.html` tiếp tục mở editor này.

- **Bố trí / Vùng đi:** Bố trí chọn hình/instance; Vùng đi chọn vùng. Các vùng lớn không bắt nhầm hình nền. Khi nhiều vùng chồng nhau, click ưu tiên vùng nhỏ. Nhóm chọn từ cây Scene vẫn có thể chứa cả hình và vùng.
- **Inspector:** chọn layer để sửa layer; nút bánh răng cạnh level để sửa level; chọn asset trong Assets để sửa thư viện; chọn vật/vùng để sửa instance. Liên kết asset nguồn nằm trong Inspector của vật. Thuộc tính chia foldout và giữ trạng thái mở/thu.
- **Navigation:** chọn Đi / Chặn / Cửa, chọn Spline / Đa giác / Chữ nhật rồi Vẽ vùng. Spawn là công cụ riêng. Đa giác đóng bằng bấm đỉnh đầu hoặc Enter; Backspace bỏ đỉnh cuối; Esc hủy. Sau khi đóng trở về Chọn. Vùng lỗi/khóa giữ bản vẽ để xử lý. V chọn vùng để kéo đỉnh, Shift+bấm cạnh thêm đỉnh, Alt+bấm đỉnh xóa.
- **Canvas:** kéo đường phân cách trên dock để đổi chiều cao; nút mũi tên thu dock; Tab khi canvas có focus ẩn/mở các bảng. Vừa khung có zoom xuống 0,05× cho map lớn; chơi thử vẫn 1×. Minimap, lưới, vùng và solo layer trong **Hiển thị**.
- **Chỉnh sửa:** undo/redo, nhân/xóa/nhóm/căn chỉnh nằm trong menu Chỉnh sửa; quản lý level ở dấu ··· trong Scene; nhập/xuất ở Dự án hoặc menu Assets. Ctrl+K tìm thao tác tiếng Việt không dấu.
- **Hít căn chỉnh:** mép/tâm vật với vật trong Bố trí, vùng với vùng trong Navigation; biên level là mốc chung. Ngưỡng 6 px màn hình, đường hướng dẫn trực tiếp; Alt bỏ hít. Cụm dịch nguyên khối.
- **Dùng làm nền & khớp level:** chọn asset trong Assets, bấm trong Inspector. Đặt instance (0,0) trên Nền, pivot riêng (0,0), scale 1, khớp cỡ level (tối thiểu 64 px). Giữ pivot thư viện và vị trí các vật/vùng khác, chỉ đưa Spawn vào biên nếu cần. Nền/layer khóa ngăn thao tác; Ctrl+Z hoàn tác cả bước.
- **Lưu:** nháp trình duyệt, file đã lưu, thay đổi mới và lỗi lưu được phân biệt cạnh tên dự án. Ctrl+S ghi vào workspace. Undo về phiên bản đã lưu khôi phục trạng thái đã lưu.

Kiểm bổ sung bằng `npm.cmd run test:map-studio`; ảnh/kết quả trong `artifacts/map-studio-*`. Fixture chỉnh sửa và storage kiểm riêng không ghi vào `docs/data/authored-maps/`; bản Hằng Nhạc có sẵn chỉ được mở để kiểm trực quan. Schema, nhân vật, thư viện và bản đồ của chủ dự án được giữ.

Mở **http://127.0.0.1:5173/map-editor.html** sau `npm.cmd run dev`. Map mới trống, thư viện có **0 asset** và vẫn cho nhập PNG/WebP riêng. Đây là công cụ biên tập/test cục bộ trong dự án; chưa nối level được tạo vào server MMO.

ART Hằng Nhạc v1/v2/v3 và hai bản thử vùng đi đã [xóa](MAP-ASSETS-RESET.md); map đầy đủ mới được bàn giao riêng để chủ dự án vẽ luồng đi/chặn trước. Manifest editor vẫn trống. Runtime/editor giữ frame 64 × 96, chân (32,88); việc dọn ART không thay collision hoặc bản lưu của người phát triển.

## 1. Quy trình làm một khu/level

1. Đặt tên dự án; chọn hoặc thêm level qua menu Scene. Bấm bánh răng cạnh level để sửa tên/kích thước/màu nền/luật đi trong Inspector.
2. Kéo asset từ thư viện vào khung, hoặc chọn asset rồi bấm để đặt. Dùng V/Chọn để kéo vật; chỉnh X/Y, tỷ lệ, lật ngang, opacity và pivot trong Thuộc tính. PNG/WebP riêng nhập tối đa 4 MiB; ảnh được giữ trong dữ liệu dự án.
3. Chọn layer, tạo/đổi tên/đổi kiểu, sắp thứ tự, hiện/ẩn, khóa và bật/tắt hoạt động. Chuyển vật sang layer khác bằng Thuộc tính. Nhân bản/xóa và undo/redo hỗ trợ thao tác biên tập.
4. Mở Vùng đi (Navigation), chọn Đi hoặc Chặn và hình vẽ: kéo chữ nhật, hoặc bấm đỉnh đa giác rồi bấm đỉnh đầu/Enter. Chọn vùng rồi kéo các đỉnh hoặc sửa danh sách tọa độ. ART không tự sinh vùng chặn.
5. Đặt Spawn bằng công cụ Điểm xuất hiện hoặc nhập X/Y. Chọn luật **Toàn level trừ vùng chặn** hoặc **Chỉ trong vùng đi**. Vùng đi liền nhau có thể nối tại mép chung.
6. Vẽ Cửa nối level, chọn level đích và điểm đến; để trống điểm đến để dùng Spawn của đích. Tab Kết nối level thể hiện các cửa và đích.
7. Bấm **Test map**: cỡ mặc định1×, người64 × 96, chân(32,88), collider chân8px. WASD/mũi tên để đi, E khi đứng trong cửa để qua level. Esc/Dừng Test trở lại biên tập. Spawn/điểm đến bị chặn sẽ được báo để bạn chỉnh.
8. **Lưu dự án** hoặc Ctrl+S để ghi vào workspace. Xuất JSON dự án để sao lưu/chuyển máy; xuất/nhập riêng level để tái sử dụng từng khu.

Space hoặc chuột giữa: pan. Cuộn: zoom. Snap1/8/16/32px. Vừa khung/1× để xem bố cục hoặc cỡ thật. Ctrl+Z/Ctrl+Shift+Z: undo/redo; Ctrl+D: nhân bản; Delete: xóa chọn. Map lớn được nhìn qua camera/viewport, không co lại tỷ lệ người trong Test.

## Vẽ vùng bằng spline

1. Mở **Vùng đi**, chọn **Đi** hoặc **Chặn**, chọn **Spline · cong** rồi **Vẽ vùng**. Spline là hình mặc định cho vùng mới; vùng có sẵn giữ nguyên hình học.
2. Bấm ít nhất ba điểm theo đường viền. Editor xem trước đường cong đi qua các điểm; bấm lại điểm đầu hoặc Enter để khép vùng. Backspace bỏ điểm cuối, Esc hủy. Độ cong khi vẽ nằm ở thanh hướng dẫn trên canvas.
3. Sau khi khép, dùng V: kéo điểm điều khiển để uốn đường; Shift+bấm đường cong để thêm điểm; Alt+bấm điểm để xóa (giữ tối thiểu ba điểm). Kéo bên trong để dịch cả vùng. Một lần kéo là một bước undo.
4. Inspector → **Hình học** → **Độ cong**: 1 là mềm, 0 là cạnh thẳng. **Đường viền** chuyển vùng chữ nhật/đa giác có sẵn sang spline; chuyển lại Đa giác nối thẳng các điểm điều khiển. Danh sách tọa độ của spline chỉnh điểm điều khiển, không bắt sửa từng điểm lấy mẫu.
5. Kiểm tra và chơi thử ở 1×. Đường cong có thể lượn ra ngoài khung các điểm; kiểm mép level và lối hẹp, thêm điểm hoặc giảm độ cong để bám mép mong muốn.

Nguồn spline là Catmull–Rom centripetal, tham khảo [Yuksel/Schaefer/Keyser](https://www.cemyuksel.com/research/catmullrom_param/). Đường viền lấy mẫu thích ứng với dung sai 0,5 px thế giới, dùng chung cho hiển thị, chọn vùng và va chạm; không phụ thuộc zoom. Các giao cắt toàn vùng tiếp tục được audit báo lỗi.

Authoring giữ `region.spline = { anchors, smoothness }` cùng `region.points` đã lấy mẫu. Khi nhập, points của spline được dựng lại từ anchors để tránh cache sai; vùng cũ không có spline giữ nguyên. Tối đa 64 điểm điều khiển và 4096 điểm lấy mẫu cho một spline; đa giác thường vẫn tối đa 256 đỉnh. Runtime chỉ xuất polygon points, giữ hợp đồng collision hiện có. Dịch/nhóm/nhân bản/prefab và lưu riêng level giữ cả hai phần hình học.

Kiểm spline: `npm.cmd run test:map-spline`, `tests/region-spline.test.ts`; fixture/storage trong `artifacts/map-spline-*`, không sửa map của chủ dự án.

## Nhân bản asset để dự phòng

Chọn asset trong **Assets → Inspector → Nhân bản asset**, hoặc Ctrl+D khi Inspector đang ở ngữ cảnh asset. Tạo ID mới với tên `· bản sao`, `· bản sao 2`…; giữ kích thước, toàn bộ part/cờ phần che, pivot, phân loại/layer mặc định và nguồn cắt. Chỉnh tên, pivot, thay ảnh hoặc cờ part trên bản sao độc lập với bản gốc. Instance/prefab đang dùng asset gốc giữ tham chiếu cũ; thao tác này thêm vào thư viện, không đặt thêm vật trên map. Khi chọn vật/vùng trong Scene, Ctrl+D tiếp tục nhân bản instance/lựa chọn như trước.

Trong cửa sổ cắt, **Backup ảnh nguồn** nhân bản nguồn đang chọn vào Assets và thêm vào danh sách nguồn. Giữ đường cắt, điểm chân, tên đang nhập, preview và ảnh nguồn đang chọn để tiếp tục thao tác. Đóng cửa sổ hủy đường cắt chưa thêm nhưng giữ bản backup đã tạo. Sau khi đóng, Ctrl+Z hoàn tác việc thêm backup; Ctrl+S lưu vào workspace hoặc Xuất dự án JSON để giữ lâu dài. Dự án có ảnh lớn có thể vượt quota nháp trình duyệt; file workspace vẫn lưu và mở lại qua **Dự án → Mở bản lưu**.

Tối đa 200 asset, không nhân bản trong Test. Kiểm bằng `npm.cmd run test:map-asset-backup`: độc lập metadata/part/ảnh, Ctrl+D theo ngữ cảnh, undo/redo, backup giữa lúc cắt và lưu/khôi phục map tổng 3072 × 2048. Storage riêng `artifacts/map-asset-backup-*`.

## Cắt asset từ map tổng

1. Nhập PNG/WebP map tổng vào **Assets**. Bấm **✂ Cắt asset** trên thanh canvas, hoặc chọn asset → Inspector → **Cắt từ ảnh này**. Ảnh nền khóa vẫn có thể đọc để cắt. Nếu chọn một instance trước khi mở, tọa độ đặt lại dựa theo instance đó; có thể đổi ảnh nguồn trong cửa sổ cắt.
2. Chọn **Spline**, **Đa giác** hoặc **Chữ nhật**. Spline/đa giác bấm từng điểm, Enter hoặc bấm điểm đầu để khép; Backspace bỏ điểm cuối. Chữ nhật kéo hai góc. Vùng này là đường cắt ART riêng, không dùng hay sửa vùng đi/chặn.
3. **Sửa điểm:** kéo điểm hoặc trong vùng để dịch đường cắt. Shift+bấm cạnh thêm điểm; Alt+bấm điểm xóa (tối thiểu ba). Chữ nhật đổi sang đa giác khi thêm/xóa điểm. Độ cong 0–1 cho spline. Ctrl+Z / Ctrl+Shift+Z hoàn tác/làm lại đường cắt trong cửa sổ; Vẽ lại bắt đầu đường viền mới. Đường tự cắt, trùng điểm, quá nhỏ hoặc ảnh trống không được thêm.
4. Cuộn zoom tại con trỏ; Space/chuột giữa+kéo pan; **Vừa ảnh / 1×** để xem tổng thể hoặc mép pixel gốc. Xem trước trên nền ô trong suốt, sáng hoặc tối.
5. Đặt tên, phân loại/layer và **điểm chân**. Bấm Đặt điểm chân rồi chọn chân đế trên ảnh nguồn, hoặc nhập X/Y tương đối trong ảnh cắt. Dấu cộng vàng thể hiện pivot; vị trí mặc định chỉ là gợi ý ở giữa mép dưới, cần đo lại cho vật thực tế.
6. **Thêm vào Assets** giữ PNG trong dự án để kéo/đặt như asset khác. Có thể bật **Đặt bản cắt đúng vị trí trên map**; giữ scale, flip và opacity của instance nguồn, tính lại tọa độ theo pivot mới. Layer đích khóa ngăn đặt; bỏ checkbox để chỉ lưu thư viện. Thêm asset và đặt instance là một bước undo. **Tải PNG** tải từng part ở kích thước gốc, không vẽ dấu pivot vào ảnh.

Cắt giữ một pixel nguồn thành một pixel đầu ra, không scale, sharpen hoặc tự đoán mép vật thể. Ngoài đường viền trong suốt, bên trong giữ alpha/màu nguồn. Bounds làm tròn xuống/trên ra pixel nguyên và chặn ở biên ảnh; spline lấy mẫu với dung sai 0,5 px nguồn. Tối đa 64 điểm spline / 256 điểm đa giác và 16 triệu pixel đầu ra, PNG nhúng theo giới hạn asset hiện có. Asset multipart cắt tất cả part với **cùng bounds, mask, canvas và pivot**, giữ cờ phần che; không crop từng part lệch nhau.

Asset mới lưu metadata tùy chọn `extraction`: id/tên/cỡ nguồn, bounds, loại đường viền, điểm điều khiển và độ cong. PNG độc lập vẫn mở được khi asset nguồn không còn trong thư viện. Metadata, part và pivot giữ qua lưu/nháp, JSON dự án/level/thư viện. Đóng cửa sổ khi chưa Thêm hoặc Backup không đổi dữ liệu. Ảnh bake nguồn, instance gốc và navigation giữ nguyên; cắt không tự xóa vật trong nền, tạo nền sạch sau vật, tạo collider hay chia thân/mái. Đường viền thủ công cần kiểm mép và alpha trước khi dùng làm ART sản xuất.

Kiểm bằng `npm.cmd run test:map-cut`; fixture/storage trong `artifacts/map-cut-*`, không ghi map hay nháp của chủ dự án. Kiểm pixel/alpha, native PNG, spline, pivot/vị trí khi flip/scale, multipart, khóa layer, undo và lưu/khôi phục.

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

[Thư viện editor](design/world/map-asset-library/README.md) trống. Chuyển các nguồn review thành asset/preset cần giữ đúng source/part/pivot theo [quy tắc xây map](MAP-BUILDING-GUIDE.md); kiểm công cụ không đồng nghĩa với duyệt ART.

### Vùng đã vẽ nhưng Test vẫn đi qua

Vùng chỉ có hiệu lực nếu **Hoạt động của vùng** và **Hoạt động trong game của layer chứa vùng** đều bật. Hiện/ẩn (mắt) và Khóa không đổi va chạm. Một vùng ghi Hoạt động Có nhưng layer tắt vẫn bị bỏ qua trong Test và runtime.

Editor hiển thị vùng không hoạt động bằng đường nét đứt màu xám, nhãn **Tắt Test** trong Scene và trạng thái hiệu lực trong Inspector. Với vùng đã bật nhưng layer tắt, có cảnh báo trên canvas và trong Kiểm tra. Khi bấm Test, cửa sổ liệt kê những vùng/layer đang tắt để chọn:

- **Bật layer vùng & Test:** bật những layer chứa vùng đã bật, kiểm lại Spawn rồi Test. Các vùng tắt riêng vẫn tắt; hình học, hiện/ẩn/khóa và layer ART khác giữ nguyên. Thay đổi là một bước undo và chỉ được lưu vào file khi bạn bấm Lưu.
- **Test với trạng thái hiện tại:** cố ý bỏ qua những vùng trên layer tắt, không thay dữ liệu.
- Đóng cửa sổ để quay lại chỉnh. Nút **Bật layer vùng** trên canvas hoặc **Bật layer để vùng có hiệu lực** trong Inspector hỗ trợ sửa ngay; Inspector chỉ bật layer của vùng đang chọn.

Collider Test là vòng tròn bán kính 8 px ở chân nhân vật (anchor 32,88 trên frame 64 × 96); đầu/thân sprite có thể nằm trên ảnh vật thể khi điểm chân vẫn ngoài vùng chặn. Tô quanh phạm vi cần chặn chân và kiểm ở 1×. Không tự chuyển vùng tắt hoặc layer tắt thành hoạt động khi mở dự án.

Kiểm hồi quy: `npm.cmd run test:map-navigation`. Fixture/storage riêng trong `artifacts/map-navigation-*`; kiểm cảnh báo, chọn tiếp tục/bật layer, va chạm khi ẩn layer, undo, Spawn và bản lưu của chủ dự án được đọc để tái hiện mà không sửa file/nháp.

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

**Xuất level** dùng `game-solo-editor-level-1`, giữ cả vùng tắt và layer để sửa tiếp. Nhập level thêm vào dự án hiện tại, không thay các level khác; id trùng hoặc asset cùng id nhưng nội dung khác được đổi id để giữ cả hai. Nhập dự án mở toàn bộ project. Asset thư viện tham chiếu PNG trong `/assets/map-kit/`; PNG/WebP tự nhập nằm trong JSON. Sau reset, editor mở dự án trống và giữ bản nháp trước. Bản dùng preset đã xóa được báo asset thiếu, không sửa/xóa bản lưu. Khi chuyển máy, cần mang ảnh ngoài theo cùng dữ liệu.

Kiểm nhập giới hạn 20 MiB/project,64level,64layer/level,200asset,10000instance/level,3000vùng/level. Chỉ PNG/WebP nhúng và đường dẫn asset local được nhận; URL từ xa/SVG/nội dung thực thi bị từ chối. Lỗi định dạng, ref layer/asset sai hoặc cỡ ảnh không khớp không thay bản đang mở.

## 4. Thành phần và kiểm tra

- UI/Canvas2D authoring và Test: [map-editor.ts](../client/src/map-editor.ts), [trang](../client/map-editor.html).
- Schema/kiểm nhập/union vùng đi/portal/export: [shared/map-editor.ts](../shared/map-editor.ts); movement dùng chung `moveUsingCollision` của preview/game.
- Lưu workspace: [map-editor-api.ts](../scripts/map-editor-api.ts), gắn vào Vite dev và preview.
- Library: [manifest mới](design/world/map-asset-library/manifest.json), hiện có 0 asset. `npm.cmd run assets` đồng bộ nội dung hiện tại; builder kit cũ đã gỡ.
- Kiểm: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run test:map-editor`, `npm.cmd run test:level-design`, `npm.cmd run build`.

Browser test dùng thư mục `artifacts/map-editor-test-store`, không ghi layout thử vào thư mục map của người phát triển. Kiểm reset thư viện trống/giữ nháp cũ, kéo thả PNG thử được tạo trong test, chỉnh/pivot/khóa/undo, polygon/vertex, hoạt động layer, va chạm, luồng portal hai level, import PNG, lưu/ghi đè/mở/JSON và file riêng từng level. [Kết quả](data/map-editor-verification.json) là kỹ thuật; map/ART do người phát triển chọn vẫn cần đánh giá riêng.

Đã kiểm gói [nền Hằng Nhạc WebP](design/world/hang-nhac-map-v1/README.md): nhập trực tiếp, nhập thư viện và xuất/nhập dự án giữ dữ liệu ảnh. Không sửa map hoặc nháp của người phát triển.

Editor đã có nhập tileset theo lưới đều, cọ asset/tô ô/gôm, prefab và multipart. Chưa có autotile, công cụ vẽ raster, cộng tác nhiều người, quest/combat hoặc tự triển khai server MMO. Runtime export là hợp đồng bàn giao; việc nối JSON authoring vào vùng online làm theo yêu cầu sau khi có map để thử.
