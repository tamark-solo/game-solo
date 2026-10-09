# Công nghệ client — TypeScript + Three.js

**Phiên bản tài liệu:** 0.3, ngày 08/10/2026 · **Runtime:** 0.12.0.\
**Đã chốt:** người phát triển chọn **TypeScript + Three.js** cho client web và công cụ preview animation/map.  
**Backend đã chọn cho bản thử:** TypeScript + Node.js + Colyseus, theo đề xuất preview trước và nối backend tối thiểu sớm đã được người phát triển đồng ý.  
**Trạng thái:** đã triển khai ứng dụng, cài/khóa dependency và kiểm tra preview cùng sân online. [Hướng dẫn chạy](PREVIEW-RUNBOOK.md), [hợp đồng backend](BACKEND-PREVIEW.md).  
**Tham chiếu:** [GDD](GDD.md), [đặc tả preview](ANIMATION-PREVIEW-SPEC.md), [dữ liệu quyết định](data/client-tech-preview-design.json), [ART trên map](WORLD-VISUAL-SPEC.md), [hướng online](ONLINE-DIRECTION.md).

## 1. Phân công công nghệ

| Phần | Lựa chọn | Vai trò |
| --- | --- | --- |
| Ngôn ngữ client | TypeScript | Dữ liệu asset/nhân vật, trạng thái animation, điều khiển và logic client |
| Dựng cảnh | Three.js | Camera, texture, sprite và lớp hiển thị map |
| UI preview/HUD | HTML/CSS kết hợp TypeScript | Chọn nhân vật, hướng, FPS/tốc độ; chữ, portrait và bảng thông tin |
| Backend phòng thử | TypeScript + Node.js + Colyseus | Phiên tạm, vị trí/hướng, xác nhận input, va chạm và kết nối lại |
| Dữ liệu lâu dài/đăng nhập | Cần đặc tả riêng | Tài khoản, tiến trình, tu luyện, lệnh và phục hồi bền vững |

TypeScript bổ sung kiểm tra kiểu cho JavaScript; dữ liệu JSON nhập từ file/mạng vẫn cần kiểm tra khi nạp. [Tài liệu TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).

Three.js cung cấp dựng cảnh; điều khiển, va chạm, tìm đường và luật game cần thành phần của dự án hoặc thư viện bổ sung. [Hướng dẫn làm game](https://threejs.org/manual/pages/game.html). Backend Colyseus đã chọn cho bản thử; cơ sở dữ liệu và đăng nhập chưa được chọn.

Công cụ build/dev-server dùng Vite. Phiên bản thực tế của dependency được khóa trong [package.json](../package.json) và [package-lock.json](../package-lock.json); cần Node.js >= 22.12.0.

## 2. Dựng ART hiện tại bằng Three.js

Giữ nhân vật pixel, nền stylized 2D, camera top-down ba phần tư và portrait mực/giấy. Three.js được dùng để hiển thị lớp ảnh trong cảnh với **camera orthographic cố định**; nét nhìn ba phần tư đã nằm trong ART. Thiết kế đầu dùng mặt phẳng màn hình, không thêm nghiêng phối cảnh lần nữa lên nền đã vẽ.

Camera orthographic giữ cỡ vật thể theo khoảng cách, phù hợp cách đặt pixel theo cỡ hiển thị đã chọn. [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html). [Sprite](https://threejs.org/docs/pages/Sprite.html) hiển thị texture trong suốt và có điểm neo; đây là phương án dựng nhân vật đầu tiên.

Thiết kế hiển thị cho preview:

- Vị trí game/preview dùng mặt phẳng 2D x/y; hướng bắc ở trên, y tăng về phía dưới. Adapter đổi sang trục y hướng lên khi dựng trong Three.js.
- 1× tương ứng một pixel native trên một CSS pixel; kiểm tra thêm mật độ điểm ảnh thiết bị khi triển khai.
- Texture nhân vật dùng nearest sampling, zoom 1×/2×/4× và căn vị trí hiển thị theo pixel. Nền/portrait giữ cách lấy mẫu mượt.
- Animation chọn rectangle của frame trong atlas; dữ liệu FPS/hướng/trạng thái được quản lý bằng TypeScript.
- Đồ cao và nhân vật có điểm chiếu để xét lớp trước/sau; phần che khuất không suy từ mép gấu đang bay.
- UI chữ và portrait nằm trong HTML/CSS; dữ liệu game không lưu trong scene graph của Three.js.

Các filter và biến đổi UV là khả năng texture của thư viện; cấu hình nearest cho pixel là lựa chọn dự án. [Texture](https://threejs.org/docs/pages/Texture.html).

## 3. Thành phần dùng chung đã có

| Thành phần | Dữ liệu vào/ra | Lý do tách |
| --- | --- | --- |
| Asset catalog/loader | Atlas PNG + JSON → dữ liệu asset đã kiểm tra | Dùng lại nguồn đang có, quản lý lỗi nạp/tham chiếu |
| Animation controller | Tên động tác, hướng, thời gian → frame ID | Đổi renderer không làm mất luật animation |
| Movement controller | Input và thời gian → vị trí/hướng/trạng thái | Kiểm tra tốc độ độc lập FPS diễn hoạt |
| Collision/map fixtures | Vị trí và collider → vị trí hợp lệ | Preview có map thử; map game được biên tập riêng |
| Three.js renderer | Frame, vị trí, điểm chiếu → hình trên canvas | Quản lý UV, texture, camera và thứ tự vẽ |
| Preview UI | Thao tác chọn/chỉnh → cấu hình phiên xem | Duyệt ART với cùng thành phần dựng cảnh của client |

Dữ liệu asset nguồn và logic animation/di chuyển độc lập Three.js. Preview cục bộ và sân online đã dùng chung atlas/animation/renderer và luật di chuyển. Catalog hiện có 6 bộ/136 frame; bộ ba chibi có đứng/đi hoặc lướt bốn hướng. Đây là preview ART, chưa phải luồng chọn ba nhân vật playable theo [GDD 0.28](GDD.md).

Editor 0.12.0 có model dự án/level/layer/vùng, nhóm, tileset/brush, prefab, multipart, minimap, audit và runtime export trong `shared/map-editor.ts`/`shared/level-design.ts`. API Vite lưu project/level trong workspace khi chạy dev hoặc Vite preview; máy chủ chỉ phục vụ dist tĩnh không cung cấp API này. Đây là dữ liệu biên tập map, không là DB hoặc save người chơi. [Runtime Hằng Nhạc](HANG-NHAC-RUNTIME.md) đã nạp release từ owner vào client/server; Editor và runtime dùng chung phép kiểm polygon. Fixture `shared/world.ts` giữ cho room kiểm hồi quy.

ART Hằng Nhạc cũ đã xóa; map C access-v5-clean-v1/9 blocker đã chốt và tích hợp. [Bước 2](HANG-NHAC-R01-RUNTIME.md) thêm SQLite khách, hồ sơ riêng và R01 do server xử lý. [Skill core](SKILL-CORE.md) tách definitions/behavior/engine, timeline thuần, loader, Three adapter và UI. Catalog có 10 FX gốc (539.528 byte) và 36 clip cast/300 frame cho bộ ba/bốn hướng, tải pose theo avatar. Locomotion 64 × 96/neo (32,88) giữ nguyên; cast dùng canvas riêng cao 96/neo y88, không đổi cỡ thân hoặc collider. ART mới còn chờ đánh giá hình.

## 4. Trình tự áp dụng

1. **Đã có:** ứng dụng TypeScript + Three.js, loader/animation/movement/renderer và catalog chibi bốn hướng.
2. **Đã có:** room Hằng Nhạc với ba hồ sơ khách SQLite, authoritative movement/R01, reload/reconnect/restart; room fixture đệ tử giữ hồi quy. Đăng nhập sản xuất còn mở.
3. **Đã có:** Level Design/Map Editor, lưu/export và release Hằng Nhạc dùng chung client/server.
4. **Ưu tiên hiện tại:** nền/hồ sơ/R01 và [NPC/HN01–HN02/thổ nạp online](HANG-NHAC-SECT-RUNTIME.md) đã tích hợp; tiếp nối HN03–HN04 theo [kế hoạch GDD](HANG-NHAC-IMPLEMENTATION-PLAN.md). Chủ dự án giữ quyền bố trí level/navigation.
5. **Còn cần đánh giá:** motion/nhận diện từng bộ; cast ba thuật R01/bốn hướng đã có, ART mới cần đánh giá. Trúng đòn, đòn thường, R02–R05 và tương tác riêng tiếp tục theo nội dung.
6. **Tiếp tục:** NPC/nhiệm vụ/tu luyện, farm và khảo nghiệm riêng; đặc tả đăng nhập/vận hành MMO theo GDD.

Chọn thư viện dựng cảnh không chuyển A thành map 3D hoặc thêm tính năng MMORPG. Đường đi, bố cục khu chung, tốc độ game và giao thức online được chốt ở các đặc tả tương ứng.
