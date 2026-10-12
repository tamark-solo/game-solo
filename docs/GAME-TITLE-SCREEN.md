# Màn mở đầu Vân Hải Đạo Đồ — Tiên môn trên biển mây

**Đổi tên 10/10/2026 theo xác nhận owner:** tên game là **Vân Hải Đạo Đồ**. Logo HTML hai dòng **VÂN HẢI / ĐẠO ĐỒ**, câu dẫn **“Đạo chưa có đường. Ta tự mở.”** Tên hiển thị ở title, entry tài khoản/server/nhân vật, thiết lập, quản trị và các trang công cụ đã cập nhật. Cỡ chữ responsive và vị trí ấn Đạo được căn lại cho tên dài hơn.

Đợt này chỉ đổi nhận diện; không đổi tên nhân vật/tông môn hoặc triển khai cơ chế ân oán, đột phá, nghịch thiên đã thảo luận. Giữ khóa `tien-nghich.active-character.v1` để tab đang chơi tiếp tục phục hồi hồ sơ; package đổi thành `van-hai-dao-do`. Prompt/metadata nguồn ART, hồ sơ lịch sử và tên tác phẩm được trích làm tham khảo giữ nguyên để truy vết nguồn.

**Triển khai 10/10/2026 theo yêu cầu owner.** Luồng mới: **Màn mở đầu → đăng nhập → server → tạo/chọn nhân vật → Hằng Nhạc**. Người chơi thấy một không gian tiên môn riêng trước game. Đăng nhập/chọn server/nhân vật dùng tiếp nền này; map tân thủ chỉ xuất hiện khi đã vào thế giới.

Phiên duyệt hiện hành: [Màn đầu 5174](http://127.0.0.1:5174/hang-nhac.html?screen=title), backend 2568. `screen=title` mở title rõ ràng kể cả tab có con trỏ active character, vẫn kiểm quyền sở hữu và chỉ phục hồi sau thao tác người chơi. URL thường giữ tự phục hồi khi reload đang chơi. Không tạo tài khoản thử trong DB thật. Preview/editor và `?devGuest=1` phục vụ hồi quy giữ luồng riêng.

## 1. Reference và ý tưởng đã áp dụng

| Nguồn chính thức / nhà phát triển | Điều tham khảo | Cách áp dụng trong dự án |
| --- | --- | --- |
| [FFXIV — Getting Started](https://na.finalfantasyxiv.com/game_manual/start/) | Tài liệu phân biệt title screen, data center/World và chọn/tạo nhân vật | Tách bước mở đầu khỏi world/map; một hành động chính đưa vào entry đã xác thực |
| [Mịch Trường Sinh / 觅长生 — developer Steam page](https://store.steampowered.com/app/1189490/) | RPG có chủ đề tu tiên, cảnh giới và gallery mỹ thuật | Lấy ý niệm sơn thủy, khoảng cách, hành trình cầu đạo; không lấy cấu trúc MMO từ game này |
| [Tale of Immortal — developer Steam page](https://store.steampowered.com/app/1468810/) | Thế giới dựa trên thần thoại Trung Hoa và tu luyện | Cổng tiên môn, biển mây và ánh linh lực nhẹ gợi thế giới rộng hơn điểm nhập môn |

Đây là diễn giải thiết kế của game-solo; không sao chép logo, ART hoặc UI từ các game tham khảo. MMO-RPG là hướng sản phẩm của dự án, không chứng minh đã hoàn thiện mọi hệ thống MMO.

**Bố cục:** cảnh rộng, điểm nhìn cổng núi ở bên phải; logo chữ live HTML và một nút chính ở bên trái. Trên mobile, crop nền về cổng và phủ tối vừa đủ để đọc chữ; thứ bậc chữ và nút giữ nguyên. Không dùng một cửa sổ giấy lớn làm title screen. Cửa sổ entry sau đó dùng đúng khung Vân Ngọc.

**Chất tu tiên:** cổng cổ, núi nhiều lớp, biển mây, bình minh, ấn Đạo nhỏ, câu dẫn “Đạo chưa có đường. Ta tự mở.” và màn giới thiệu tiên lộ. Nội dung nhắc đúng mở đầu Hằng Nhạc/Ngưng Khí, bộ ba và Kiếm/Lôi/Phong hiện có; không bày shop/chat/pháp bảo/portal chưa hoạt động.

## 2. Thao tác và phiên

- **Bắt đầu hành trình:** kiểm lại cookie phiên trên backend; chưa đăng nhập thì đến form, đã có phiên thì đến server hoặc danh sách nhân vật đã chọn trong phiên UI hiện hành. Không tạo guest/profile hoặc tự cấp quyền.
- **Tiếp tục hành trình:** chỉ đổi nhãn sau khi đọc được tài khoản hợp lệ. Khi nhấn vẫn xác nhận phiên và danh sách thật, không tin con trỏ local để vào room.
- **Thiết lập:** menu H5 hiện có, gồm fullscreen, Linh quang và Giảm chuyển động. Đóng menu trả focus về nút chính.
- **Tiên lộ khởi hành:** disclosure đọc giới thiệu mở đầu và ba mẫu nhân vật; không phát lệnh nhiệm vụ/thưởng.
- **Màn mở đầu:** có trong các bước entry và menu trong game. Từ game, rời room/lưu qua luồng hiện có, xóa con trỏ reconnect của tab, giữ tài khoản/hồ sơ. Tiếp tục quay về hồ sơ đã chọn.
- **Reload đang chơi:** vẫn xác nhận và phục hồi đúng active character theo hợp đồng entry/reload; không bắt người chơi qua title sau mỗi reconnect. Reload sau khi đã về title không tự vào lại game.
- Trước game không mở C/I/J/E, đi, cast hoặc dùng đồ. Gameplay/HUD dựa trên snapshot như trước.

## 3. Core và hiệu ứng

`EntryPhase` bổ sung `title`, state ở `core/game-entry-state.ts`, ID nút chính ở Core. `features/entry/coordinator.ts` sở hữu chuyển bước/xác nhận phiên/return-home, `title-view.ts` chỉ xuất markup và `title-effects.ts` chỉ theo dõi visibility cho CSS. Không đặt transport/gameplay trong ART hoặc hiệu ứng.

Mây/linh quang/hạt sáng là CSS nhẹ trên nền tĩnh. Hidden tab tạm dừng animation; hệ điều hành reduced motion hoặc lựa chọn Giảm chuyển động giữ cảnh tĩnh. Không có timer/cast/sửa tu vi. Canvas thế giới không render liên tục khi chỉ có entry, nhưng loop kết nối/logic và hợp đồng camera/sprite giữ nguyên.

Nền UI không phải asset map; không có polygon/collider/portal/gameplay metadata. Giữ 9 blocker, frame 64 × 96, camera 1× và HUD 760 × 140. Không sửa authored map hoặc nháp Editor.

## 4. ART và đường xuất

Nguồn: [title-tien-mon-v1](design/ui/title-tien-mon-v1/README.md). Dùng skill imagegen và **built-in image_gen**. [Prompt đầy đủ](design/ui/title-tien-mon-v1/prompt.txt) và manifest/hash được lưu cùng source PNG.

Nguồn 1672 × 941; WebP runtime **274.698 byte** (đổi định dạng, không crop hoặc sửa hình). `scripts/sync-title-art.mjs` kiểm hash rồi chép vào `client/public/assets/title-tien-mon-v1/`; chạy trong `npm run assets/build`. Không phụ thuộc ảnh nằm ngoài workspace khi build.

Đã kiểm kỹ thuật và xem screenshot desktop/mobile. `ownerApproved` và `artApproved` vẫn **false** cho ART mới; test không thay phản hồi hình ảnh của owner.

## 5. Kiểm tra và hướng tiếp nối

`npm.cmd run test:game-title` kiểm title, bắt đầu/tiếp tục, menu/focus/lore, reduced motion, 12 viewport (gồm CSS viewport tương đương zoom 150%), tạo hồ sơ và return-home thật trên DB/cache/context fixture. `test:game-entry` tiếp tục kiểm account/realm/character, R01/NPC/inventory và reload/offline/restart. Kết quả: [verification](data/game-title-verification.json).

Hồi quy 36 cast có sửa fixture: tham chiếu GPU dùng `frameCrops/frameCutouts`, chụp ngay trong callback render khi thuật còn hoạt động, chờ vị trí projectile thực không che thân và chỉ chụp Phong sau khi đã quan sát ghost. Viewport 1000 × 800 giữ pixel/camera 1× và tránh chạm nhầm HUD khi đặt hướng. Integration dùng GPU mặc định của Chrome; `SKILL_GPU_SOFTWARE=1` hoặc `SKILL_GPU_NATIVE=0` cho chế độ SwiftShader ép buộc. Kiểm thân/VFX độc lập vẫn dùng SwiftShader để đối chiếu từng frame. Không sửa PNG, renderer sprite, thời lượng cast hoặc ngưỡng đối chiếu để làm test qua.

Ý tưởng tiếp nối cần đúng dữ liệu/asset của từng mốc: màn chọn nhân vật với điểm nhìn Linh Đài; màn nạp map mang lời dẫn theo vùng; phản hồi cảnh giới từ snapshot; nhạc nền nguyên bản có nút bật sau tương tác; sự kiện và social UI khi backend có hệ thống thật. Đợt này chưa thêm nhạc/cinematic video hoặc mở map mới.
