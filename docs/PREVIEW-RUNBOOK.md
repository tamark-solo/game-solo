# Chạy preview animation và sân chung online

**Phiên bản:** 0.3, ngày 07/10/2026.  
**Trạng thái:** đã triển khai bản thử TypeScript + Three.js và backend TypeScript + Node.js + Colyseus.  
**Phạm vi:** duyệt ART, thử chuyển động và đồng bộ map bằng phiên tạm. Tài khoản, lưu tiến trình, tu luyện và chiến đấu thuộc mốc tiếp theo.

## 1. Khởi động

Cần Node.js >= 22.12.0 và npm. Mở terminal trong thư mục dự án:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173/**. Một lệnh chạy client và backend; giữ terminal mở khi xem. Dừng bằng Ctrl+C. Dependency đã khóa trong [package-lock.json](../package-lock.json).

Nếu dependency đã có, chỉ cần `npm.cmd run dev`. PowerShell có thể chặn file npm.ps1; các ví dụ dùng npm.cmd để chạy đúng công cụ trên Windows.

Client mặc định ở cổng 5173, backend ở cổng 2567, chỉ lắng nghe localhost. Đây là môi trường phát triển nhiều client; chưa phải bản được đưa lên internet.

## 2. Xem animation

Mẫu mới theo tỷ lệ chibi ở **http://127.0.0.1:5173/chibi-pilot.html**. Có một hướng Đông, 1 đứng + 4 pose đi; chọn xem pose hoặc đi trên sân bằng D/→ hay nút giữ. Trang dùng chung Three.js renderer. Bộ trước cần chỉnh tiếp sau phản hồi; mẫu chibi chờ đánh giá hình/chuyển động. Xem [phân tích reference](GAIT-REFERENCE-REVIEW.md).

- Chọn một trong năm bộ: Vương Lâm, đệ tử nam, đệ tử nữ, Tư Đồ Nam và Lý Mộ Uyển.
- Vương Lâm/hai đệ tử dùng tám pose đi mỗi hướng. Bấm **So sánh tay/chân cũ và mới** hoặc mở http://127.0.0.1:5173/assets/gait-review/index.html; dừng ở pose 0/4 để xem hai lần tiếp đất.
- Chọn đứng/đi và bốn hướng; nhịp animation 1–12 FPS.
- Tạm dừng để xem frame trước/sau; zoom nguyên lần 1×/2×/4× và nền giấy/tối/lưới.
- Điểm neo (32,88) được đánh dấu khi bật debug; khung native là 64 × 96.
- Tư Đồ Nam/Lý Mộ Uyển chỉ có bốn hình đứng. Động tác đi bị khóa và ghi rõ hình tĩnh.

## 3. Di chuyển cục bộ

Chuyển sang **Thử trên map**, bấm vào sân và dùng WASD/phím mũi tên. Trên mobile dùng nút hướng phía dưới sân. Chỉnh tốc độ 40–160 px/s; nhịp chân tự khớp quãng đường. **Sải bước** 24–72 px/vòng cho so sánh, mặc định 48; FPS thủ công chỉ dùng cho xem tại chỗ. Nhập/chọn trong bảng điều khiển không làm nhân vật đi; rời cửa sổ sẽ xóa input đang giữ.

Tùy chọn camera bám giúp nhìn nhân vật khi zoom hoặc dùng màn nhỏ; tắt để xem camera cố định. Pause scene dừng cả chuyển động và animation. Đặt lại đưa hình về điểm xuất phát.

Nền sân đã có ART được dùng cùng collider thử biên sân, bệ trái, bảng thông báo và một trụ nhỏ giữa sân. Trụ mới là hình fixture dựng bằng code để xem va chạm/che khuất, chưa là asset ART sản xuất. Những vật cản khác trong ảnh chưa được biên tập thành map gameplay.

1/5/20 hình mô phỏng phục vụ xem chuyển động và đọc nhịp renderer trên thiết bị. Chúng không phải tài khoản hoặc kết quả thử tải MMORPG.

## 4. Hai người cùng vào sân

1. Chọn **Sân chung online**, nhập tên và chọn đệ tử nam/nữ.
2. Giữ địa chỉ `http://127.0.0.1:2567`, bấm **Vào sân**.
3. Bấm **Mở cửa sổ người chơi thứ hai**, vào sân bằng tên/mẫu hình khác.
4. Điều khiển từng cửa sổ để thấy chuyển động trên cửa sổ còn lại. Danh sách Đồng môn cho biết ai là người đang điều khiển.
5. Bấm Rời sân để kết thúc phiên; người đó biến mất khỏi map còn lại.

Vị trí, tốc độ 80 px/s và va chạm do server tính ở fixed tick 30 Hz. Client gửi MoveInput qua SDK, dự đoán người đang điều khiển bằng cùng luật, rồi reconcile/replay theo xác nhận server. Người khác nội suy snapshot với buffer 100 ms. Nhịp chân theo quãng đường và giữ pha khi đổi hướng; camera giữ số thực, sprite căn pixel trong màn hình. Bộ đi mới có tám pose/hướng; chất lượng ART còn chờ đánh giá.

SDK tự thử kết nối lại trong cùng trang. Server giữ chỗ 15 giây khi kết nối bị rơi; thành công giữ ID/tạo hình/vị trí. Vào lại bằng nút sau khi phiên kết thúc tạo một phiên mới. Reload hoặc khởi động lại server chưa đảm bảo giữ nhân vật vì chưa có tài khoản/cơ sở dữ liệu.

## 5. Build và kiểm tra

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:online
npm.cmd run test:browser
npm.cmd run test:movement
npm.cmd run test:gait-review
npm.cmd run test:chibi-pilot
```

`build` chuẩn bị asset, kiểm tra TypeScript và build client vào dist/client. Xem client build bằng `npm.cmd run preview` ở cổng 4173; backend chạy riêng bằng `npm.cmd run start:server`. Chạy hai lệnh trong hai terminal nếu muốn thử online bằng bản build.

Kiểm tra browser dùng Chrome headless đã có trên Windows, không tải browser tự động. Mặc định: `C:/Program Files/Google/Chrome/Application/chrome.exe`. Có thể đặt biến CHROME_PATH trỏ đến Chrome/Chromium khác. Kiểm tra online/browser tự tạo server ở cổng 2577 hoặc 2579; Vite kiểm tra dùng 5179 và được dừng khi kết thúc.

Kiểm tra movement dùng cổng 2581/5182, thêm độ trễ WebSocket thực 100 ms mỗi chiều và jitter để đo nhấn/thả phím, tư thế khi dừng và va chạm. Kết quả JSON và screenshot nằm trong artifacts/ và không đưa vào Git. Bản kết quả bàn giao được tóm tắt ở [preview-verification.json](data/preview-verification.json).

## 6. Cấu trúc nguồn

| Nơi | Vai trò |
| --- | --- |
| [client/src](../client/src/) | Giao diện, atlas, animation, Three.js renderer và kết nối online |
| [server/src](../server/src/) | Phòng môn phái, state đồng bộ, xử lý input và phiên tạm |
| [shared/world.ts](../shared/world.ts) | Mặt bằng fixture, collider và luật di chuyển dùng chung |
| [scripts/sync-preview-assets.mjs](../scripts/sync-preview-assets.mjs) | Copy đúng 5 atlas/JSON và nền vào public để chạy/build |
| [tests](../tests/) | Kiểm tra atlas/di chuyển, hai client thật và browser desktop/mobile |

Nguồn ART cũ dưới docs/design giữ nguyên. [Bộ sửa tay/chân](GAIT-CORRECTION.md) có nguồn/prompt/manifest và atlas ở thư mục mới; client/public/assets được tạo lại khi chạy dev/build. Quyết định backend và hợp đồng bản thử: [BACKEND-PREVIEW.md](BACKEND-PREVIEW.md).
