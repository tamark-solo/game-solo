# Sửa nền UI lệch khỏi khung khi resize

Owner gửi ảnh bảng nhiệm vụ có nền chữ nhật lộ dưới mép viền. Lỗi nằm ở cách ghép các lớp của bộ Vân Ngọc 02, không phải world/camera hoặc ảnh HUD gốc.

## Nguyên nhân

- Nền phủ toàn hộp chữ nhật hoặc padding-box; artwork có mép trong cong và nine-slice riêng. Hai vùng này không trùng nhau ở cạnh/góc.
- Khung nhỏ dùng pseudo-element với inset âm. Tracker có `overflow:hidden`, nên có phần viền bị cắt trong khi nền vẫn giữ hộp cũ.
- Nội dung dialog cần cuộn, còn khung và nền cần đứng yên. Nếu đặt nền absolute ngay trong dialog tự cuộn, nền sẽ dịch theo nội dung.

## Cách sửa

`scripts/build-van-ngoc-frame-mask.mjs` đọc alpha của WebP khung đang dùng và lấy vùng rỗng khép kín từ tâm. Vùng này được xuất thành chín SVG viewBox theo đúng slice **36%** của artwork. [Metadata nguồn/hash](design/ui/van-ngoc-kit-v2/frame-aperture.json) kiểm nguồn trước khi xuất; khung/giấy/PNG master giữ nguyên.

`client/src/frame-surface.ts` gắn một lớp nền `aria-hidden`, `pointer-events:none`. Nền dùng chín mask SVG và cùng biến `--vn-frame-size` với `border-image`. Cả hai cùng một hộp bao; phần border của cửa sổ được tính bằng `--vn-frame-border`. Không dùng offset để canh nền bằng mắt hoặc ResizeObserver để bù sau resize.

Các nền hình chữ nhật và box-shadow ở root được thay bằng nền có mask và shadow theo silhouette. Viền nhỏ đặt `inset:0`. Trạng thái chọn nhân vật tiếp tục đổi màu nền bên trong mask, không đổi nguồn khung.

Dialog có `.vn-frame-scroll` riêng cho nội dung. Nền và viền ở root đứng yên khi cuộn. Bảng chỉ đường trên mobile dùng `position:relative` để nền/viền absolute bám đúng bảng. Lớp kỹ thuật được tách khỏi style margin của các span văn bản.

Áp dụng cho tracker, danh tính, utility, màn chọn, thẻ nhân vật, NPC/menu và bảng chỉ đường. Không sửa hotbar 760 × 140, slot 36 px, skill/transport, save/receipt, authored map, camera 1× hoặc sprite native.

## Kiểm chứng

- `npm.cmd run test:hang-nhac-ui-resize`: **28 trường hợp** kích thước/viewport/DPR, gồm gọn/dài, ngang/dọc, ultrawide, mốc 760/761 px và DPR 1/1,25/1,5/2. Không chạy backend hoặc dùng DB.
- Test chụp viền trên nền magenta, tìm vùng ngoài nối với mép ảnh, rồi bật nền màu thử để đo pixel lộ ra ngoài. Ngưỡng sai khác RGB 12 tránh nhiễu anti-alias. Các trường hợp mới có **0 pixel lộ** theo phép đo; mô phỏng nền chữ nhật cũ bị phát hiện **16.139 pixel**.
- `test:hang-nhac-ui` kiểm hộp nền bằng đúng hộp khung trước/sau resize và sau cuộn dialog, ngoài các thao tác nhân vật/NPC/motion hiện có.
- Hồi quy game-shell, HUD/layers, quests, reload, typecheck và build đi cùng thay đổi. Tất cả dùng fixture; không reset dữ liệu người chơi.

[Pixel report](../artifacts/hang-nhac-ui-resize-verification.json) · [UI report](../artifacts/van-ngoc-ui/verification.json) · [Ảnh màn chơi](../artifacts/van-ngoc-ui/playing-1366.png) · [Ảnh dialog mobile đã cuộn](../artifacts/van-ngoc-ui/journal-mobile.png).

Build asset thường ngày chỉ copy SVG/WebP đã có. Khi thay nguồn khung hoặc slice, chạy lại `build-van-ngoc-ui-v2.mjs` (gọi xuất aperture sau WebP), rồi xem/test lại. Đây là clipping kỹ thuật cho UI, không là duyệt mỹ thuật hoặc chỉnh ART nguồn.
