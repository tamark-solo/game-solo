# Vương Lâm · Pháp bảo thức tỉnh v4

Bản VFX tiếp nối bảy phối trang bị owner đã ghim ở [bộ lựa chọn v3](../../characters/wang-lin-equipment-options-v3/README.md). Giữ nguyên thân, áo, pháp bảo và màu đã chọn; thêm khí linh và chu kỳ thức tỉnh riêng cho Tiên kiếm, Tôn Hồn Phiên và Xạ Thần Xa.

Mở [trang xem thử](./index.html). Trang mặc định so FX tĩnh v3 với v4 ở cỡ native **1×**, cùng áo/pháp bảo, nền và vị trí chân. Có 2× nearest, nền Hằng Nhạc/sáng/tối/xám, FX riêng, mức cường độ đầy đủ/dịu, thanh thời gian, phát/dừng/lặp và **Khai mở pháp bảo**. **Khí tức thường** chỉ giữ khí linh hộ chủ.

## Bảy phối đã ghim

- Hồn phiên · U Tế + Huyền kim.
- Xạ Thần Xa · Cổ Kim + Cổ đồng.
- Xạ Thần Xa · Lôi Huyền + Cổ đồng.
- Tiên kiếm · Huyền Mặc + Huyền kim.
- Tiên kiếm · Huyền Mặc + Huyền mặc.
- Tiên kiếm · Huyền Mặc + Bạch ngọc.
- Hồn phiên · U Tế + U tím.

[Owner shortlist](./owner-shortlist.json) ghi bằng chứng lựa chọn và hash của từng thân/lớp trang bị/FX cũ. Ghim thể hiện lựa chọn tạo hình tĩnh; không suy thành duyệt VFX mới hay animation thân.

## Khí thế riêng

| Pháp bảo | Hình tượng chính | Nhịp thức tỉnh |
| --- | --- | --- |
| Tiên kiếm | Kiếm linh trong hắc khí, đường kiếm trắng ngà có hướng | Linh hình hộ chủ → tụ kiếm ý → bộc phát kiếm khí → dư kiếm tan |
| Tôn Hồn Phiên | Hồn ảnh nhỏ, dải ma khí cao và lệch về phía phiên | Hồn ảnh hộ chủ → quy hồn → luồng hồn mở → mảnh khí tan |
| Xạ Thần Xa | Dị thú khí tượng, xiềng căng và lôi quang | Thú hồn hộ chủ → kéo xích tụ lực → phá xích lôi đình → dư điện tan |

Đây là hướng mỹ thuật chuyển thể để chọn cảm giác pháp bảo. Màu ngà/mực/cổ kim/đỏ tím là artwork riêng, cùng kit được phối với các màu trang bị đã ghim. Trang không đổi màu VFX bằng CSS hue filter để giả các phương án mới.

[Hồ sơ hướng FX và reference](./reference-direction.md) nối các chương Tiên Nghịch, nguồn game chính thức và ảnh local đã xem; ghi rõ phần nguyên tác, phần phối hợp cảm hứng và phần chuyển thể cho game.

## Nguồn và phép đo

[Manifest](./manifest.json), [generation](./generation.json), [registration](./registration.json), [plan](./plan.json) và [basis](./basis.json) ghi nguồn, prompt, input, hash, kích thước thực, phép đăng ký và pin tham chiếu. Nguồn mới nằm trong `sources/`; frame alpha ở `fx/frames/`, atlas ở `fx/atlases/`.

- 3 kit × 4 chuỗi × 6 frame = **12 chuỗi / 72 frame** có hình chuyển động riêng.
- Canvas VFX 384×320, điểm chân chung (176,288). Người 64×96 được đặt (144,200); trang bị v3 256×224 được đặt (80,88).
- Một scale chung cho từng nguồn và emitter world chung. Riêng Kiếm phát dùng phép đo emitter từng ô để bù grid nguồn bị trôi; điểm của các frame tan muộn là ước lượng có ghi trong registration. Không fit bbox hoặc zoom riêng từng frame.
- Khí linh lặp 1.800 ms; tụ lực 0–900 ms; khai mở 900–1.380 ms; dư khí 1.380–2.220 ms. Chu kỳ review 3.600 ms, sau 2.220 ms chỉ còn khí linh.
- Khí mới ở phía sau thân/pháp bảo; mặt, tóc và bàn tay giữ rõ. Không sửa pixel thân hoặc trang bị.
- Clip chạy theo tuổi tuyệt đối và `frameHoldsMs`; seek/dừng và các khung A/B dùng cùng tuổi. Không phóng/thu ảnh tĩnh để thay cho sáu frame.

## Kiểm tra

Chạy sau khi tất cả nguồn đã đăng ký:

```powershell
node docs/design/vfx/wang-lin-equipment-fx-v4/verify-assets.mjs
node docs/design/vfx/wang-lin-equipment-fx-v4/review/browser-verify.mjs
```

[Browser verification](./review/browser-verification.json) **passed**: 72 frame canonical/atlas khớp RGBA chính xác; 210 phép so compositing ở 1×/2× qua bảy lựa chọn và năm tuổi FX. Sai số blend alpha mềm Canvas2D tối đa 2/255 kênh; pixel thân opaque còn nhìn thấy khớp nguồn chính xác. 11 kiểm điều khiển/lifecycle qua, gồm thao tác slider thật bằng phím và chuột, với 0 lỗi JS/request. Peak decoded cache 16.772.096 byte, dưới 16 MiB.

[Three verification](./review/three-verification.json) **passed**: 72 frame × 2 vị trí world = 144 render GPU native 1×, soft alpha/pivot/UV và 11 lần đổi atlas qua; nguồn dùng Chrome SwiftShader/software GPU, không là benchmark MMO hoặc duyệt hình. Bitmap/texture và geometry/material được giải phóng sau kiểm.

[Screenshots](./review/screenshots/) lưu A/B nền map/tối cho mỗi kit, bảy mẫu ghim và mobile. [Ba pháp bảo ở nhịp khai mở 2×](./review/screenshots/three-kits-2x.png) giữ hình người và khí cùng tỷ lệ; age 1.060 ms, cường độ đầy đủ.

Decoded bitmap cache giới hạn **16 MiB**; giữ bốn atlas và các lớp tham chiếu của kit đang xem, bỏ bitmap cũ bằng `close()`. Ẩn trang/mất mạng dừng rAF và giữ hình tĩnh; reduced motion mở ở nhịp khai mở tĩnh và vẫn seek được. `pagehide` hủy rAF và giải phóng bitmap. Đây là kiểm tra bản xem thử, không phải benchmark MMO.

VFX mới là candidate để owner xem. Chưa có animation thân mới, gameplay, balance, âm thanh production hay tích hợp runtime. Trang review không gọi backend, command/save, viết map hay đụng DB/draft.
