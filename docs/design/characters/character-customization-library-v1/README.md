# Thư viện thiết kế nhân vật và tùy biến

**Chốt 12/10/2026:** owner: “đẹp chốt 3 concept mới gửi. giữ lại các nhân vật concept đã lên để làm custom nhân vật khi khách hàng vào server tạo nhân vật”. Giữ nguồn nhân vật/trang phục, không dọn tiếp các bộ đã lên. [Catalog nguồn](catalog.json) pin hash source/prompt/PNG; [biên bản duyệt ba khí](../../vfx/hoa-than-aura-concepts-v4/approval.json) tách khỏi kiểm kỹ thuật.

| Nhóm giữ lại | Mẫu | Nơi dùng dự kiến |
| --- | --- | --- |
| Nhân vật/nhận diện | Chibi Vương Lâm gốc, bảng áo xám/đỏ, player avatars nam/nữ, roster hiện có | Nguồn tạo nhân vật; giữ tỷ lệ/nhận diện, quyền chọn theo catalog server |
| Áo nhập môn | Vân Ngọc, Huyền Vân, Xích Tiêu | Các lựa chọn diện mạo ban đầu sau khi đủ bộ sprite |
| Áo Hóa Thần | Sinh Tử, Huyền Tử | Trang phục theo hành trình; dùng trong preview khi thiết kế màn tùy biến |
| Khí tức đã chốt concept | Luân Sinh Tử, Kiếm Vực Huyền Ngọc, Huyết Nguyệt Ma Vực | Khí Hóa Thần/Tu Đạo/Đọa Ma; độc lập áo và kỹ năng |
| Sáu gói thử đã dọn trước đó | Vân Hải v1/v2/chibi, hai pixel study Vương Lâm, costume v1 | Giữ ZIP nguồn để tra cứu/phát triển tiếp; không tự đưa bộ bị từ chối về runtime |

Các pack hiện hành, source/prompt/metadata và [ZIP cũ](../../../../artifacts/archive/character-studies-2026-10-12.zip) được giữ. Catalog không sao chép ART, chỉ trỏ về nguồn/version/hash. Sửa hoặc dọn một nguồn cần xét lại thư viện và chỉ dẫn giữ mới nhất của owner. Giữ archive không đồng nghĩa chấp nhận hình hoặc chọn nó làm nhân vật chuẩn.

## Chuẩn bị màn tạo nhân vật

Luồng vẫn là **đăng nhập → chọn server → tạo/chọn nhân vật → vào game**. `avatarId` xác định mẫu thân; hồ sơ có ID riêng. Tùy biến dự kiến tách `outfitId` và `auraId`, không bake khí vào người và không dùng chọn áo để đổi skill/stat/cảnh giới. Backend kiểm allowlist mẫu, tương thích avatar, quyền tài khoản/hồ sơ/server trước khi lưu ID appearance; client chỉ dựng preview và gửi lựa chọn. Không lưu URL texture/CSS/frame trong hồ sơ.

Vân Ngọc/Huyền Vân/Xích Tiêu là nguồn cho bảng lựa chọn áo lúc tạo. Sinh Tử/Huyền Tử và ba khí được giữ trong cùng thư viện để phát triển diện mạo về sau; không mặc định cấp Hóa Thần hoặc Đọa Ma cho người mới. Quyền/giá/nguồn mở diện mạo chưa chốt. Hiện tất cả record mới `creationEnabled: false`, `productionReady: false`, và chưa được API tạo nhân vật tiêu thụ.

Năm áo mới chỉ có pose đứng Nam. Trước khi phát hành lựa chọn phải đủ hướng/động tác cần dùng, đúng người chuẩn, kiểm animation/layer/occlusion và reload/reconnect bằng fixture riêng. Giữ **frame người 64 × 96, chân (32,88)**; không scale thân theo FX. Ba khí 04 đã duyệt **concept hình tĩnh**, cần tách ground/rear/front, motion và mức rút gọn khi đông người theo [Aura Layers](../../../CHARACTER-AURA-LAYERS.md).

## Tra cứu và kiểm

[Catalog quản trị](http://127.0.0.1:5174/admin.html?view=catalog) có thêm 8 record `cosmetic`/`outfit` hoặc `aura`, đều `unreleased`; selector nguồn trỏ đúng record tại đây. [Trang đối chiếu](http://127.0.0.1:5174/van-hai-character-review.html#qi-concept-review) ghi “concept đã chốt”. Các report cũ là snapshot trước duyệt, giữ nguyên lịch sử.

`node scripts/check-character-design-library.mjs` kiểm hash nguồn/người/archive và ba duyệt chính xác. `npm.cmd run check:content-catalog` kiểm typed registry và source pointer. [Biên bản đợt chốt](../../../data/character-design-approval-2026-10-12.json) ghi kết quả; chưa thêm schema save/DB, gameplay, đổi map/blocker hoặc sản xuất raster mới.
