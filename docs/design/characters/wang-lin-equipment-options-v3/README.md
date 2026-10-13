# Vương Lâm · Phối áo và pháp bảo 03

Owner yêu cầu làm lại Thiên Nghịch Châu, thêm kiểu áo Vương Lâm phù hợp từng trang bị và phương án màu để xem, lựa chọn. Gói này tiếp nối bốn pháp bảo của v2: tiên kiếm có kiếm linh Hứa Lập Quốc, Thập Ức Tôn Hồn Phiên, Thiên Nghịch Châu và Xạ Thần Xa.

Mở [trang phối thử](index.html) qua HTTP từ Vite hiện hành. Trang mặc định mở Thiên Nghịch Châu mới, áo vân ngà và phương án vân thanh. Cổ thạch giữ lại để đối chiếu lõi đá. Chọn pháp bảo, áo và màu; mọi tổ hợp luôn đặt cạnh Vương Lâm live để đối chiếu.

## Những lựa chọn trong gói

| Pháp bảo | Hai kiểu áo mới | Ba phương án trang bị |
| --- | --- | --- |
| Tiên kiếm | Kiếm tu · Vân Ngọc / Kiếm tu · Huyền Mặc | Huyền kim / Bạch ngọc · thanh kiếm / Huyền mặc · u kiếm |
| Hồn phiên | Hồn phiên · Tàn Vân / Hồn phiên · U Tế | Huyền kim / U tím · hồn cổ / Mặc ngọc · thanh hồn |
| Thiên Nghịch Châu | Thiên nghịch · Vân Bạch / Thiên nghịch · Ẩn Tu | Cổ thạch · ngũ vân / Vân ngọc · thanh quang / Huyền thạch · nội giới |
| Xạ Thần Xa | Xạ thần · Cổ Kim / Xạ thần · Lôi Huyền | Cổ đồng / Huyền kim · thanh ngọc / Huyền thiết · lôi lam |

Tên hiển thị và các màu cụ thể lấy từ [manifest](manifest.json). Có tám kiểu áo mới, ba phương án mỗi pháp bảo; phối cùng bản live tạo chín tổ hợp mỗi món, tổng 36 tổ hợp. Ba pháp bảo kiếm, phiên, xa giữ một phương án v2 nguyên nguồn làm mốc. Ba Thiên Nghịch Châu đều là thiết kế mới; mẫu châu v2 bị owner nhận xét chưa phù hợp được giữ ở gói lịch sử.

## Cách xem và chọn

- Desktop mở ở 2×, mobile dưới 600px mở ở 1×. Chọn 1× để đọc cỡ chơi; 2×/4× phóng nearest, không fit lại thân theo pháp bảo. Thay viewport trong phiên không tự đổi cỡ đã chọn.
- Chọn nền xám, sáng, tối hoặc crop Vân Ngọc nguyên pixel. Crop nền là ảnh đọc màu và silhouette, chưa kiểm occlusion trong game.
- Tắt FX để đọc vật liệu của trang bị. Tắt pháp bảo để so riêng y phục; FX vẫn có công tắc riêng.
- Chín tổ hợp của mỗi món nhận cùng cỡ xem/nền/công tắc. Gallery y phục hiển thị riêng cả tám áo mới và mốc live ở 2×.
- Bấm ☆ để ghim những tổ hợp muốn đối chiếu. Danh sách chỉ ở bộ nhớ của trang, không dùng localStorage, DB, save hoặc quyền trang bị; tải lại trang sẽ xóa. Ghim không xác nhận duyệt ART.
- URL hash giữ lựa chọn món/áo/màu để mở lại đúng hình. Nguồn AI, prompt, input và hash được giữ trong hồ sơ; phần cuối trang liên kết nguồn của tổ hợp đang xem.

## Nguồn và đăng ký

Vương Lâm Pixel02 đang dùng trong game là chuẩn gốc: thân cao 80 pixel trong canvas 64 × 96, chân (32,88). `body/original.png` giữ byte và RGBA của frame live Đông Nam. Áo mới lấy trực tiếp ảnh live làm đầu vào cho ImageGen; đây là các candidate riêng, không thay nguồn live. Sau đăng ký, vùng đầu/tóc, da tay và giày được khôi phục bằng pixel live theo mask được ghi trong measurement; y phục mới vẫn là phần thay đổi. Đọc phép đo và assessment thực tế từng body, không suy toàn bộ thân mới là nguyên byte.

Pháp bảo/FX dùng canvas 256 × 224, neo (96,200), thân đặt offset (64,112). Thứ tự review: FX sau → pháp bảo sau → thân → pháp bảo trước → FX trước nếu có. Các layer được trích nguồn và đăng ký; màu mới là hình ImageGen, không phải hue filter CSS. Khi một FX nguồn chưa phù hợp, layer review có thể được giữ trống và `fxSelected:false` trong manifest; công tắc FX vẫn hoạt động cho các mẫu còn lại.

Gói có 17 lượt nguồn ImageGen built-in mới: tám áo và chín nguồn trang bị/FX. [Prompt và nguồn](sources/) được giữ cùng gói, liên kết từng hình qua [manifest](manifest.json) và phần nguồn của trang review. Ba màu gốc của kiếm/phiên/xa được chép nguyên byte từ v2. Không gọi router POST hoặc recolor sáng tạo bằng code.

Đọc [manifest](manifest.json) để kiểm file, prompt, input và hash; [registration](registration.json) ghi phép đo source, scale, neo và tách lớp. [Nguồn truyện/reference của v2](../wang-lin-equipment-story-v2/canon-study.md) vẫn là căn cứ về món và ý tưởng thị trường. Tên áo, bảng màu, form hiển thị và cách phối là thiết kế mới cho game, không khẳng định là y phục hoặc form canon.

## Phạm vi

Đây là concept tĩnh một neutral Đông Nam. `ownerApproved`, `artApproved` và `runtimeReady` giữ false; chưa animation, tám hướng, cơ chế trang bị hoặc quyền server. Xạ Thần Xa là form triển khai cạnh người; neo review chưa là world footprint/collider. Không sửa map, navigation, blocker, station/receipt, save/DB, gameplay hoặc actor live.

Trang độc lập chỉ đọc manifest cùng ảnh, vẽ canvas và giữ trạng thái xem trong bộ nhớ. Không import runtime, gửi command, gọi router hoặc tải reference bên ngoài.

## Kiểm review đã qua

[Browser verification](review/browser-verification.json) xác nhận 36 tổ hợp thật được so với composite đã pack, không sai pixel ngoài sai số tối đa hai mức màu do phép alpha compositing của PNG/Canvas; 12 kiểm cỡ 1×/2×/4× × bốn nền; canvas nearest, body-only đúng pixel, FX bật/tắt, ghim hai mẫu/bỏ ghim, URL phục hồi lựa chọn và reload xóa ghim đều qua. 20 nguồn decode được: 17 mới và ba nguồn v2; hash thân/trang bị/source/prompt hiển thị đúng. Không có lỗi JS hoặc request thất bại.

Đã xem [desktop](review/screenshots/desktop.png), [mobile](review/screenshots/mobile.png) và [ma trận lựa chọn](review/screenshots/selection-grid.png). Mobile 390px không tràn ngang; mặc định 1× cho thấy cả mốc live và tổ hợp Vân Bạch/vân ngọc trong vùng đầu của canvas, không cần cuộn ngang trước. Desktop giữ mặc định 2× và đầy đủ lựa chọn. Đây là kiểm kỹ thuật/trình bày, không xác nhận duyệt ART.

Chạy lại bằng `node docs/design/characters/wang-lin-equipment-options-v3/review/browser-verify.mjs` với Vite đọc root workspace hiện hành. Verifier chỉ dùng browser headless và asset read-only; không backend, DB hoặc store. Nếu dùng port khác, đặt `EQUIPMENT_OPTIONS_REVIEW_URL` vào URL trang review.
