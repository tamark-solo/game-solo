# Hằng Nhạc — game shell H5

**Màn đầu 10/10:** [Tiên môn](GAME-TITLE-SCREEN.md) đã đứng trước entry; menu thêm Màn mở đầu để rời room và giữ tài khoản/hồ sơ. `?screen=title` mở title rõ ràng, URL thường giữ tự phục hồi khi reload đang chơi. ART cảnh mở đầu tách khỏi map/HUD.

**Entry 10/10:** URL thường đã dùng đăng nhập → server → tạo/chọn nhân vật → game qua [backend thật](GAME-ENTRY-BACKEND.md). Tài khoản mới rỗng, chọn avatar là mẫu để tạo hồ sơ. Shell tiếp tục quản viewport/menu/modal; entry mới nằm ở `features/entry`, state/DOM ID ở Core. Màn chọn khách và kiểm pilot bên dưới giữ cho DEV `?devGuest=1`. Các nút gameplay bị chặn trước khi xác nhận own player; Đăng xuất được thêm vào menu game.

**Runtime 0.12.0.** Triển khai theo phản hồi owner: game phải là một màn chơi, không nằm trong trang giấy có form/header/footer. Đây là lớp vỏ và luồng UI thực; không phải một engine mới hoặc xác nhận game đã hoàn thiện toàn bộ MMO-RPG. Mỹ thuật các cửa sổ mới còn cần owner đánh giá riêng.

## Màn và luồng

- `/hang-nhac.html`: scene chiếm viewport `100dvh`, không padding, viền ngoài hoặc scrollbar của trang; giữ camera 1×, sprite 64 × 96, neo (32,88) và 9 blocker.
- Nạp asset → chọn nhân vật / tiếp tục hồ sơ → kết nối và đọc own player → màn chơi.
- Hồ sơ đang hoạt động tự phục hồi qua luồng reload/reconnect hiện có. Không reset token/SQLite để chuyển UI.
- Màn chọn là overlay trên map; input đi/cast bị chặn. Chọn một trong ba nhân vật, nhập tên nếu cần, bấm Vào Hằng Nhạc / Tiếp tục hành trình.
- Trong phiên: danh tính/lưu ở góc trái, quest tracker ở bên phải, hotbar Vân Ngọc phía dưới; trạng thái kết nối và phản hồi nằm trên map. Không có link Map Editor trong giao diện người chơi.
- J mở sổ nhiệm vụ; E tương tác NPC; Escape trên map mở menu. Đóng cửa sổ trả focus về game. Modal chặn input local, không pause server hay tạo tích lũy offline.
- Menu có Linh quang, hướng dẫn phím, fullscreen tùy chọn và rời sân/đổi nhân vật. Đổi người dùng thao tác leave/lưu hiện có, rồi quay về màn chọn.
- Màn game luôn lấp cửa sổ trình duyệt. Fullscreen API chỉ chạy khi người chơi bấm nút; không bắt buộc hoặc tự gọi lúc tải trang.
- Desktop giữ hotbar 760 × 140; mobile giữ fallback skill hiện có, nút mới và d-pad tối thiểu 44 px. D-pad ẩn trên desktop dùng chuột/bàn phím, hiện trên màn nhỏ hoặc thiết bị pointer coarse.

## Ranh giới mã

| File | Trách nhiệm |
| --- | --- |
| `client/hang-nhac.html` | Điểm vào, scene, overlay chọn người, menu và đối thoại; link CSS nền trực tiếp |
| `client/src/game-shell.ts` | Phép chọn phase thuần và adapter DOM/menu/fullscreen; không transport/storage/gameplay |
| `client/src/game-shell.css` | Viewport, màn nạp/chọn người, menu và danh tính người chơi |
| `client/src/hang-nhac.ts` | Nối phase với trạng thái NetworkSession, chặn input, giữ enter/leave/recovery hiện có |
| `client/src/hang-nhac.css` | Nhãn scene, utility luyện thuật, touch và đối thoại |
| `client/src/quest-ui.*` | Tracker/sổ đọc snapshot; không cấp nhiệm vụ hoặc thưởng |

`game-shell.css` được link trong HTML để khung/màn nạp hiển thị trước khi JavaScript chạy. Build Vite chuyển link thành asset CSS có hash. CSS scene/quest/skill vẫn dùng module của chúng. Lỗi asset hiển thị thông báo trong overlay nạp, không im lặng để lại màn trống.

Không sửa renderer, world/navigation, source ART, schema/receipt, quyền skill, tài nguyên, thưởng hoặc server. Không thêm portal, HN05, quái/loot, hành trang/chat chưa có gameplay. Giữ `/` làm trang preview kỹ thuật và `/map-editor.html` làm công cụ riêng.

## Lỗi màn trắng đã đối chiếu

Trên Vite đang chạy lâu ở **5173**, HTML/JavaScript trả HTTP 200 nhưng module `game-shell.css` trả stylesheet rỗng. Canvas đã nạp asset nhưng stage thành `position:static` và kích thước sai; hotbar hiện trên nền trắng. HTTP 200 hoặc test trên Vite mới không phát hiện được trạng thái cache này của server live.

Đã khởi động lại **chỉ Vite client** với `--force`, giữ nguyên backend và DB. Trình duyệt riêng mở lại đúng 5173 xác nhận map 32 part và overlay chọn người, không lỗi request/JavaScript. Sau đó đổi CSS shell sang link HTML để không phụ thuộc module CSS JavaScript cho bố cục nền. Không khẳng định đã sửa một lỗi nội bộ Vite; khi phát triển vẫn phải kiểm trang đang phục vụ thực tế sau HMR.

Bằng chứng đợt sửa đầu: `artifacts/live-white-screen/5173.png`, `css-state.json`, `5173-restored.png`, `5173-restored.json`. Các file này ghi thời điểm đối chiếu; không chứng minh những phiên chơi khác.

Nếu lỗi lặp lại: xem console, request stylesheet và bounding box stage trên đúng URL. Dừng/mở lại client bằng `npm.cmd run dev:client -- --force`, rồi tải lại trang; **không reset save, token, authored map hoặc backend** để chữa một lỗi CSS.

## Kiểm chứng

```powershell
npm.cmd run test:hang-nhac-game-shell
npm.cmd run test:hang-nhac-quests
npm.cmd run test:hang-nhac
npm.cmd run test:hang-nhac-r01
npm.cmd run test:skill-aim
npm.cmd run test:hang-nhac-lessons
npm.cmd run test:hang-nhac-sect
npm.cmd run test:hang-nhac-reload
npm.cmd run test:hang-nhac-hud-layers
npm.cmd test
npm.cmd run build
```

Shell smoke dùng backend 2601/Vite 5204, DB fixture trong `artifacts/` và cấu hình Vite không có API Editor. Kiểm CSS khi JavaScript tắt, lỗi catalog, chặn đi/cast ở màn chọn/menu, đóng trả focus, fullscreen vào/ra, reload cùng hồ sơ và leave quay về màn chọn. Sáu viewport: 1920 × 1080, 1366 × 768, 1024 × 768, 390 × 844, 320 × 568, 844 × 390; kiểm không scroll trang và scale native.

Bằng chứng: `artifacts/hang-nhac-game-shell-verification.json`; ảnh `hang-nhac-game-shell-entry.png`, `-desktop.png`, `-mobile.png`, `-menu.png`, `-landscape.png`; log hồi quy trong `artifacts/game-shell-regression/`. Live 5173 chỉ kiểm nạp/render bằng browser context mới, không tạo người chơi test trong SQLite thật. Kiểm phiên chơi/reward/reconnect dùng fixture riêng.

Phần còn lại là thiết kế đồng bộ UI kit/đối thoại/sổ nhiệm vụ và tiếp nối HN05/ngoại vi theo kế hoạch. Shell này làm nền để thiết kế UI/UX đúng vùng màn chơi; không suy duyệt mỹ thuật từ test kỹ thuật.
