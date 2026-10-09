# Quy trình map: concept tổng → vẽ từng khu → ghép

**Đã được chủ dự án chọn ngày 08/10/2026** sau khi xem Hằng Nhạc `detail-c-v4`: “ổn đó, tỷ lệ màu sắc khá okela”. Dùng quy trình này cho các map tiếp theo của game-solo, cùng [quy tắc xây map](MAP-BUILDING-GUIDE.md) và [phân công](MAP-ASSET-PRODUCTION-NOTES.md). Màu cụ thể, diện tích và số khu vẫn phụ thuộc GDD của từng map.

Luồng thực hiện: **GDD → concept tổng → kiểm cùng nhân vật → chọn mẫu nét/màu → chia khu có phần chồng → ImageGen vẽ chi tiết → căn và ghép → nền web/Editor → chủ dự án vẽ navigation → asset cần thiết sau**.

**Mốc Hằng Nhạc tiếp theo, 08/10/2026:** chủ dự án hoàn tất 9 vùng chặn và xác nhận lưu bản mới nhất. Đã chốt nền theo hash dự án owner, dọn các bản thử lỗi, giữ nguồn sáu khu và xuất navigation/runtime; xem [bàn giao hiện hành](design/world/hang-nhac-map-v1/README.md) và [kế hoạch GDD](HANG-NHAC-IMPLEMENTATION-PLAN.md). Các thông số v4 dưới đây ghi quá trình sản xuất; trạng thái navigation hiện hành nằm ở bàn giao.

## 1. Chốt chức năng và tỷ lệ trước khi vẽ chi tiết

Đọc GDD, đặc tả vùng, camera và dữ liệu Editor hiện có. Ghi vai trò map, các khu chức năng, tuyến nối, điểm vào/ra và scene riêng. Không tự đưa khu farm hoặc khảo nghiệm vào một hub nếu GDD tách scene.

Đặt nhân vật gốc vào concept tại cửa, cầu, bậc thang, sân và lối hẹp. game-solo dùng frame **64 × 96**, chân **(32,88)**, body bộ ba khoảng **80/80/82 px**, camera chơi mặc định **1×**. Thiết kế độ rộng đường/cửa và kích thước công trình theo người; mở rộng map bằng thêm diện tích và bố cục phù hợp. Không thu nhỏ sprite hoặc phóng cả ảnh 4× để giả lập map rộng.

Concept tổng quyết định bố cục và không khí; nguồn concept nhỏ chưa bảo đảm chi tiết ở cỡ chơi. Chốt world size và hệ tọa độ trước khi chia khu. Hằng Nhạc dùng 3072 × 2048, nền (0,0), scale 1; đây là ví dụ, không bắt mọi map cùng kích thước.

## 2. Chọn mẫu phong cách tại cỡ chơi

Chọn một khu có đủ kiến trúc, nền, cây/đá/nước và đặt cùng sprite gốc. Thử cách xử lý hoặc vẽ lại ở camera 1×; giữ camera, crop và người như nhau khi so sánh. Lưu phương án được chọn làm tham chiếu nét/màu chung cho các khu.

Hằng Nhạc chọn **C · Vẽ lại chi tiết bằng ImageGen**: màu tươi, cụm lá/đá rõ, nét minh họa hợp nhân vật. Sharpen toàn ảnh làm mép quá gắt; blur toàn ảnh làm mất chi tiết. Bản hiện hành giải quyết bằng vẽ lại từng khu gần kích thước sử dụng, không thêm hai xử lý này. Không mặc định lặp lại sharpen/blur khi map sau bị mờ; kiểm chất lượng nguồn, tỷ lệ và nén trước.

## 3. Chia khu, giữ hai loại tham chiếu

Chia concept thành các crop **có phần chồng**, ghi rectangle toàn cục `[left, top, right, bottom]` theo biên phải/dưới không bao gồm pixel cuối. Chọn kích thước khu theo chi tiết cần nhìn và kích thước đầu ra thực tế của công cụ. Đặt phần chồng đủ chứa mốc chung và đường nối có thể tránh cạnh công trình.

Mỗi lần vẽ dùng:

- **Ảnh bố cục:** crop đúng khu từ concept/world đã chọn; quyết định vị trí, camera, tuyến đi và silhouette lớn.
- **Ảnh phong cách:** mẫu đã chọn; quyết định nét, màu, cách diễn tả vật liệu. Không sao chép bố cục của mẫu sang khu khác.

Lưu input, prompt, output gốc, thứ tự tham chiếu và kích thước thực trả. Dùng skill imagegen và công cụ ImageGen tích hợp để tạo/chỉnh raster. Nếu một khu lệch bố cục lớn, sửa/vẽ lại khu đó trước khi ghép; không kéo méo mạnh để ép khớp.

Mẫu prompt để điều chỉnh theo map:

> Vẽ lại chi tiết khu trong ảnh bố cục, theo nét và màu của ảnh phong cách. Giữ camera, vị trí công trình, cửa/cầu/đường, silhouette lớn và bối cảnh sát bốn mép. Làm rõ cụm lá, cạnh đá và kiến trúc ở cỡ chơi, tránh texture nhiễu, halo sharpening hoặc blur toàn ảnh. Không thêm nhân vật, chữ, giao diện hay đường lưới. Ảnh phong cách chỉ hướng nét/màu; không chuyển bố cục của nó vào khu này.

## 4. Căn tọa độ trước khi ghép

Đo đầu ra; không mặc định resize toàn ảnh sẽ giữ vị trí nội dung. Dùng mốc cạnh đáng tin cậy và landmark thủ công để kiểm dịch, tỷ lệ, xoay và biến dạng. Với sai khác nhỏ, đăng ký affine gần tỷ lệ 1 rồi đưa về rectangle đích; kiểm lại cửa, cầu, bậc và mép phần chồng sau lấy mẫu.

Sai lệch lớn hoặc cục bộ phải sửa nguồn. Tương quan patch cạnh và sai số affine là chẩn đoán kỹ thuật, không chứng minh mọi footprint từng pixel giữ nguyên. Lưu phép biến đổi và kết quả kiểm; không tự suy collision từ ảnh.

Ghép qua phần chồng: cân chênh màu nhỏ, tìm đường nối ít khác biệt và tránh cạnh kiến trúc, pha trong một dải hẹp. Kiểm toàn map và crop native quanh đường nối để phát hiện viền kép, vật bị cắt, lệch đường hoặc hai tông màu. Khi nối lỗi, sửa khu/đường nối; không làm mờ toàn map để giấu lỗi.

## 5. Xuất nhẹ cho web, kiểm đúng ảnh bàn giao

Giữ master lossless và nguồn từng khu. Thử vài mức nén WebP, so ở camera 1× cạnh sprite; chọn dung lượng theo ngân sách map và mức mất chi tiết thực thấy. Crop trang đối chiếu phải lấy từ **ảnh web đã giải mã**, không lấy PNG master thay cho ảnh bàn giao.

Ghi kích thước, byte, hash, mức nén và bộ nhớ ảnh giải mã. Nén giảm tải mạng, không giảm số pixel RGBA trong bộ nhớ. Chỉ tải ảnh đang dùng; không tải master/ảnh kiểm cùng trang chơi. Với map lớn hơn, đánh giá chia tải theo khu riêng; sector sản xuất không tự động là chunk runtime.

Kiểm nền ở scale 1, sprite native, camera/di chuyển, tải đầu, frame khi đứng yên, mobile và lỗi console. Bàn giao dự án/thư viện Editor **riêng**, kiểm nhập/xuất bằng profile kiểm thử; không ghi vào `docs/data/authored-maps/` hoặc nháp trình duyệt của chủ dự án. Thông số FPS phải đi kèm máy/viewport đo, không suy thành bảo đảm mọi thiết bị.

## 6. Navigation trước, asset rời sau

Chủ dự án dùng nền đầy đủ để vẽ luồng đi/chặn, spawn, portal và chốt footprint. Sau đó mới tách/vẽ các asset cần thao tác: nền dưới vật bị che, prop theo chân và phần che có alpha đúng mép. Giữ tọa độ/pivot chung, kiểm ghép lại và đi trước/sau vật.

**Các sector vừa ghép là mảng của một nền bake**, chưa phải asset rời hoặc layer che người. Chia sector để nâng chất lượng không cung cấp collision, y-sort hay nền phía sau mái/tán.

## Hồ sơ cần lưu cho mỗi map

- GDD/tham chiếu, vai trò map, world size, camera và hợp đồng nhân vật.
- Concept, mẫu phong cách được chọn, input/prompt/output từng khu và rectangle toàn cục.
- Phép căn, chẩn đoán landmark, đường nối/dải pha, master và ảnh web/hash/dung lượng.
- Crop từ ảnh bàn giao cạnh nhân vật, kiểm kỹ thuật, dự án Editor riêng và trạng thái navigation.
- Phản hồi người dùng cùng phạm vi duyệt: màu/tỷ lệ, layout, navigation, asset tách lớp và tích hợp là các mục riêng. Test không tự duyệt hình ảnh.

## Thông số Hằng Nhạc đã dùng thành công

Nguồn chi tiết và biên bản: [detail-c-v4](design/world/hang-nhac-map-v1/detail-c-v4/README.md), [regions](design/world/hang-nhac-map-v1/detail-c-v4/regions.json), [composition](design/world/hang-nhac-map-v1/detail-c-v4/composition.json), [map bàn giao](design/world/hang-nhac-map-v1/README.md).

| Mục | Giá trị của Hằng Nhạc |
| --- | --- |
| World/nền | 3072 × 2048, scale 1, (0,0) |
| Khu đích/nguồn ImageGen thực trả | 1232 × 1232 / 1254 × 1254 |
| Rectangle hàng trên | [0,0,1232,1232]; [920,0,2152,1232]; [1840,0,3072,1232] |
| Rectangle hàng dưới | [0,816,1232,2048]; [920,816,2152,2048]; [1840,816,3072,2048] |
| Phần chồng ngang/dọc | 312 / 416 px |
| Căn | Affine gần 1×, 9 patch cạnh/khu; bicubic, guard border 8 px |
| Ghép | Hàng trái→phải rồi trên→dưới; đường nối chi phí thấp, pha 12 px, bù RGB tối đa ±8 |
| Xử lý toàn ảnh | Không upscale 2×, Real-ESRGAN, sharpen hoặc Gaussian blur ở bản hiện hành |
| Bàn giao | WebP quality 94, 3.007.250 byte; RGBA giải mã 24 MiB |
| Duyệt 08/10/2026 | Tỷ lệ/màu và cách sản xuất được chấp nhận; navigation, layout cuối và asset tách lớp chưa chốt |

Các script `artifacts/prepare-hang-nhac-c-regions.py`, `artifacts/stitch-hang-nhac-c-regions.py` và builder/check Hằng Nhạc là ví dụ triển khai **gắn riêng map này**. Khi dùng cho map khác phải đổi input/output, rectangle, world size và điểm kiểm; không chạy nguyên bản để ghi đè Hằng Nhạc hoặc map người dùng.
