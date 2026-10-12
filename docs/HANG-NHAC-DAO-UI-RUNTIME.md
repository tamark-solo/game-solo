# HUD 04 và Nhân vật 04 trong Hằng Nhạc

**12/10/2026:** theo yêu cầu ghép UI/HUD mới sau merge, `/hang-nhac.html` dùng chất liệu **Tu Đạo / Thanh Ngọc**, bố cục [HUD 04](XIANXIA-FUNCTION-UX-REDESIGN.md), [Nhân vật 04](CHARACTER-SHEET-UX-V4.md) và luồng đồ [Linh Đài 03](CHARACTER-INVENTORY-UX-V3.md). Trước đợt này, các bản mới chỉ ở `/ui-material-review.html`; game vẫn dùng Vân Ngọc 03.

## Phần đang hoạt động

**13/10 · bản 05:** sau phản hồi owner, [UI người chơi Vân Ngọc 05](XIANXIA-PLAYER-UX-V5.md) dùng hồ sơ huy hiệu, icon ngọc phù, nhiệm vụ gọn có disclosure và cửa sổ giấy ấm. Adapter live và khung kỹ năng native giữ nguồn hiện hành; trang review 04 vẫn là nguồn tham khảo trước đợt này.

**13/10:** [Đạo trình và Tư Vật Các](PLAYER-WORKSPACE-UI.md) đã dùng cùng khung/nút; ba tab Đạo trình/Luyện chế/Chuẩn bị, lối vào HUD/NPC/Hành trang và bố cục responsive đã nối dữ liệu thật.

- Luồng đăng nhập → chọn server → tạo/chọn nhân vật → Hằng Nhạc giữ nguyên. Khung, nút, bảng NPC, nhật ký và thiết lập dùng vật liệu Thanh Ngọc hiện hành.
- HUD có danh tính, tu vi, mục tiêu luyện, nhiệm vụ, minimap theo bản đồ đang chạy và nhật ký thông báo trong phiên. Vị trí/tài nguyên/tiến trình đọc snapshot máy chủ; không lấy tên, mốc tu luyện hoặc map fixture của trang review.
- Menu có 38 lối trong bảy nhóm, tìm tên không dấu và ghim tối đa năm lối desktop. Nhân vật, Hành trang, Trang bị, Tu luyện, Thuật, Nhiệm vụ, Bản đồ, Thiết lập và Luyện chế nối vào màn thật. Các hệ chưa triển khai hiện “Chưa mở”; không cấp vật phẩm, quyền hoặc tiến trình mẫu.
- Nhân vật có Tổng quan, Thuộc tính, Tu luyện và reader từng thuật. Hành trang đọc đồ đang có, tìm/lọc vị trí, so sánh, mang/tháo, bảo vệ và dùng vật tư qua callback `CharacterSession`. Liên kết nguồn nhiệm vụ mở đúng bài và điểm NPC.
- Thanh kỹ năng giữ 760 × 140, ba thuật hoạt động và bảy ô chưa gán; HP/MP đặt theo số đo `dao-dual-theme-v1/layout.json`. Icon dùng chung atlas R01 v2 với reader Thuật. Mobile giữ ba nút kỹ năng 48 px.
- Cửa sổ modal chặn di chuyển, chọn hướng trên map và phím thi triển. Các thao tác đồ vẫn đợi snapshot sau xác nhận; mất kết nối không tự gửi lại lệnh.

## Ranh giới

`ui/dao-runtime-theme.ts/.css` sở hữu vật liệu và số đo; `ui/dao-runtime-hud.ts/.css` nhận snapshot/callback; `dao-character-runtime.ts` chiếu hồ sơ thành nội dung. Các adapter không nhập renderer/state fixture từ `ui-material-review.ts`. `SkillSession` giữ transport, `SkillHotbar` giữ snapshot/callback, FX giữ trang trí.

Hằng Nhạc nhập môn dùng Tu Đạo. Đọa Ma còn chờ gameplay và trạng thái server; URL/localStorage không mở chuyển đạo. Lựa chọn ghim chỉ là sở thích trình bày. Dùng sprite native của hồ sơ, không khôi phục portrait bị từ chối. Tích hợp theo yêu cầu owner không thay các bản ghi duyệt ART.

Giữ 9 blocker, Spawn (1616,992), world 3072 × 2048, camera 1×, 22 object / 32 part / 10 cover và nhân vật 64 × 96/neo (32,88). Không migration schema, sửa balance, reset save hoặc ghi fixture vào map/DB thật.

## Kiểm chứng

Smoke riêng `test:hang-nhac-dao-ui` dùng tài khoản thật của **server fixture**, SQLite riêng và browser context riêng. Nó kiểm luồng entry, nguồn dữ liệu live, 38 lối, tìm/ghim, điều hướng, modal input, desktop/mobile và reload. Hồi quy đi kèm: character, HUD/layer, R01, hướng/input, NPC, reload và entry/title. Kết quả cuối và đường dẫn ảnh lưu ở [biên bản tích hợp](data/hang-nhac-dao-ui-runtime-verification.json).

Server local để owner tiếp tục: `http://127.0.0.1:5173/hang-nhac.html?screen=title`, backend `http://127.0.0.1:2567`. Khi server đã chạy, tải lại trang để nhận source mới; không xóa DB hoặc token để đổi UI.
