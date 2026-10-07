# Công nghệ client — TypeScript + Three.js

**Phiên bản:** 0.2, ngày 07/10/2026.  
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

## 3. Thành phần dự kiến dùng chung

| Thành phần | Dữ liệu vào/ra | Lý do tách |
| --- | --- | --- |
| Asset catalog/loader | Atlas PNG + JSON → dữ liệu asset đã kiểm tra | Dùng lại nguồn đang có, quản lý lỗi nạp/tham chiếu |
| Animation controller | Tên động tác, hướng, thời gian → frame ID | Đổi renderer không làm mất luật animation |
| Movement controller | Input và thời gian → vị trí/hướng/trạng thái | Kiểm tra tốc độ độc lập FPS diễn hoạt |
| Collision/map fixtures | Vị trí và collider → vị trí hợp lệ | Preview có map thử; map game được biên tập riêng |
| Three.js renderer | Frame, vị trí, điểm chiếu → hình trên canvas | Quản lý UV, texture, camera và thứ tự vẽ |
| Preview UI | Thao tác chọn/chỉnh → cấu hình phiên xem | Duyệt ART với cùng thành phần dựng cảnh của client |

Dữ liệu asset nguồn và logic animation/di chuyển độc lập Three.js. Công cụ preview và client game sau này dùng lại các thành phần này thay vì tạo hai bộ luật chuyển động.

## 4. Trình tự áp dụng

1. Đặc tả preview chung và adapters cho dữ liệu hiện có.
2. Khởi tạo ứng dụng TypeScript + Three.js, dựng preview bằng bộ Vương Lâm đã có.
3. Kiểm tra pixel/điểm neo, hai chế độ, va chạm/lớp và di chuyển nhiều hình thử.
4. Nối backend tối thiểu để hai client dùng avatar đệ tử đi trong cùng sân; kiểm tra input, va chạm và phục hồi phiên. Đã có bản chạy được.
5. Duyệt chuyển động rồi sản xuất animation Tư Đồ Nam/Lý Mộ Uyển từng gói, đưa vào cùng preview.
6. Đặc tả tài khoản/lưu tiến trình và tuyến nhiệm vụ trước gameplay online đầy đủ.

Chọn thư viện dựng cảnh không chuyển A thành map 3D hoặc thêm tính năng MMORPG. Đường đi, bố cục khu chung, tốc độ game và giao thức online được chốt ở các đặc tả tương ứng.
