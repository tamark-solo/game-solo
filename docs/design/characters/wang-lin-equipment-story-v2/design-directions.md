# Hướng thiết kế Vương Lâm · pháp bảo và thời trang02

**13/10/2026 — candidate và đề xuất.** Owner muốn món có dấu ấn trong Tiên Nghịch sau phản hồi hình v1 còn nhạt. Mục tiêu là nhiều trải nghiệm thị giác/cách dùng trên **một Vương Lâm live**, tránh bốn món nhỏ chỉ đổi màu. [Nguồn truyện](canon-study.md) xác minh bốn hướng và ghi những hình chưa được văn bản chốt; gói này tự thiết kế hình chuyển thể, chưa có approval/animation/runtime.

## Bốn cách hiện diện

| Hướng | Điều đã đọc và giữ làm điểm tựa | Hình mới đề xuất cho game | Trải nghiệm / motion cần sản xuất | Những phần chưa có |
| --- | --- | --- | --- | --- |
| Tiên kiếm · Hứa Lập Quốc | Kiếm phát khí đen; Hứa Lập Quốc nói/hiện từ khí kiếm ởch365/399 | Lưỡi có silhouette mạnh, chuôi gọn/dấu niêm; màu/vật liệu/guard riêng, kiếm linh ở layer tách | Vũ khí sát tay có linh tính; grip/tip theo pose, combo lấy thế–phát–hồi, linh thể xuất/thu | Bảy view, action/grip, kiếm linh/khí/FX motion; sheet pháp bảo + FX tĩnh chưa chứa toàn trải nghiệm |
| Thập Ức Tôn Hồn Phiên | Hồn hóa khí đen thành cờ lớn; cầm/vẫy đại kỳ, hồn gào ởch397/538 | Form cờ cao lệch bên, mảng đen dễ đọc và dấu niêm lớn; vải/viền/đầu cán là thiết kế mới | Mang → triển khai → dẫn hồn → thu; cán/grip, unfold vải và dòng hồn có timeline riêng | Dạng bung lớn, vải/khí/hồn motion, kỹ thuật nắm/phất; kích thước preview không là cờ30foot canon |
| Thiên Nghịch Châu | Ch8 là đá xám cũ/năm mây khắc; về sau mây/ký tự/nội giới thay đổi | Chọn form giai đoạn đầu. Phóng chi tiết đủ đọc; vị trí bay/vòng hoạt hóa là display adaptation | Người kết ấn/đỡ châu; châu làm tâm điểm nội giới, root/orbit và activeFX riêng | Bảy view, motion, nội giới, trạng thái mây; không lấy cầu ngọc đỏ làm form đã xác minh |
| Xạ Thần Xa | Xích giữ thú linh,ch365; lôi thú,ch648; chiếc thứ ba cổ/gai/ánh đen,ch807/808 | Form triển khai cạnh người, khối bệ ngang và dấu niêm rõ. Nếu ghép các mốc là tổng hợp ý tưởng mới | Triệu/triển khai → điều khiển → thu; device/chain/beast tách actor và có root/footprint riêng | Kích thước scene, collider, beast/chain motion; không là món cầm tay hay phục dựng một chiếc canon cố định |

Tên gốc xa là `射神车` → **Xạ Thần Xa**, không gọi Sát Thần Xa như tên gốc. Chiếc thứ ba có kích thước riêng trong nguồn; không gán kích thước/khả năng của một chiếc cho tất cả dạng. Các palette, viền vàng, hình mặt quỷ, bánh/sừng và cấu trúc cơ khí chưa được đoạn truyện đã đọc xác minh.

## Độ đọc tại native1×

Body64×96/chân(32,88) giữ nguyên byte. Layer256×224/neo(96,200), body offset(64,112);1pixel body vẫn là1worldpixel khi camera1×. Không scale thân theo món. Món có thể rộng/cao hơn người nhưng mặt, tay chính, đai, chân và khoảng âm quanh người phải còn đọc được khi composite. Concept FX nằm trong file riêng, bật/tắt được, vẫn là hình tĩnh.

- **Kiếm:** nhìn được cán/guard/lưỡi và hướng mũi trước khi thêm trail. Một silhouette có cá tính hữu ích hơn nhiều rãnh sáng nhỏ.
- **Phiên:** nhận ra cán và mảng vải lớn; hồn/khí không biến thành một khối che mặt. Dạng triển khai lớn phải có layer trước/sau và giới hạn che scene riêng.
- **Châu:** cho close-up nguồn và native cùng lúc. Đá xám/năm mây là mốc early-stage; FX có thể lớn hơn hạt nhưng không thay vật thể hoặc scale người.
- **Xa:** khối ngang/device tách rõ khỏi chân người. Form cô đọng trong preview chỉ giúp đọc bố cục; production scene cần worldroot/pivot, nền dưới, depth/footprint riêng.

Tất cả vẫn một neutral Đông Nam. Grip tĩnh/front–rear mask không đại diện cho động tác; ảnh nguồn lớn không chứng minh body/action đã đúng.

## Sáu họ thời trang theo vai trò/giai đoạn

**Toàn bộ áo dưới đây mới là ý tưởng, chưa tạo ART.** Đây là trục wardrobe riêng, không khẳng định y phục canon của Vương Lâm. Vai trò/giai đoạn là nhãn brief mỹ thuật; không cấp cảnh giới, skill/stat hoặc quyền diện mạo. Giữ đầu/mặt/tóc, chiều cao, vai–hông–gối–chân theo Pixel02 live; vải có thể rộng/dài nhưng anatomy không thay.

| Họ / vai trò | Palette và silhouette đề xuất | Hướng phối ưu tiên | Part/motion phải làm | Chốt native |
| --- | --- | --- | --- | --- |
| Vải thô nhập môn · giai đoạn đầu | Xám/ngà, viền ngọc ít, cổ/đai hiện hành, túi phẳng | Thiết kiếm đơn giản; châu cầm tay | Vải/đai/túi theo pose/hướng; dùng làm bằng chứng giữ người khi đổi chi tiết | Hộp sọ/tóc/mặt không repaint; hoa văn chỉ vài nét lớn |
| Du hành · luyện tập/đi đường | Nâu tro/lam, khoác lệch vai, tà chia ngắn, khăn cuộn/túi mỏng | Kiếm linh; châu kín đáo | Tà/khăn khi run, đồ bên hông đổi depth, không xuyên cổ tay | Không làm chân ngắn hoặc vai rộng; mặt/grip rõ |
| Kiếm linh · điều khiển vũ khí | Ngà–ngọc–thép, tay áo gọn, hộ thủ nhỏ, vạt lệch | Tiên kiếm Hứa Lập Quốc | Vai/cổ tay và vạt trong combo; grip/socket riêng từng pose | Khoảng âm kiếm–tay–thân; hộ thủ không tăng anatomy |
| Dẫn hồn · nghi lễ hồn đạo | Than đen/tím tro, một niêm đỏ, tay áo vừa/tà có nhịp | Thập Ức Tôn Hồn Phiên | Tay kết ấn/phất cờ, vải áo và vải cờ tách; hồn ngoài body | Tắt FX còn Vương Lâm; không gán wardrobe này thành áo canon/Đọa Ma đã mở |
| Nội giới · kết ấn/thời gian | Đá xám/ngà/lam trầm, cổ rõ, tà đối xứng, vài nét mây lớn | Thiên Nghịch Châu | Tay áo mở/khép, kết ấn; châu/root/orbit riêng | Năm mây trên châu có mốc early-stage; nét mây áo chỉ ý tưởng mới |
| Chiến trận · triển khai pháp khí | Sắt đen/đồng cũ/lôi nhạt, giáp vai nhỏ, cổ tay chắc, tà tránh xích | Xạ Thần Xa | Điều khiển/triệu/thu, part vai/cổ tay, khoảng thoát xích và root device | Giáp nhẹ không làm người phình; khác trải nghiệm bằng scene device/motion |

## Ma trận tổ hợp để sản xuất

| Wardrobe | Kiếm linh | Hồn phiên | Châu | Chiến xa |
| --- | --- | --- | --- | --- |
| Nhập môn | Prototype trước | Thử sau | Prototype trước | Thử sau |
| Du hành | Ưu tiên | Phối trầm | Ưu tiên | Thử sau |
| Kiếm linh | Ưu tiên | Thử sau | Phối nhẹ | Thử sau |
| Dẫn hồn | Phối trầm | Ưu tiên | Phối nhẹ | Thử sau |
| Nội giới | Phối nhẹ | Thử sau | Ưu tiên | Thử sau |
| Chiến trận | Phối gọn | Phối trầm | Phối nhẹ | Ưu tiên |

“Ưu tiên/phối” là hướng prototype, không compatibility đã triển khai. Với mỗi tổ hợp, production phải ghi view/action có hoặc thiếu. Outfit cần theo pose thật; không lấy neutral áo phủ tĩnh lên mọi animation. Body–outfit–weapon có clock/layer/socket đồng bộ, aura/khí/ghost/bodyLift tách rõ.

## Học từ thị trường và thư mục reference

[Tale of Immortal — mô tả chính thức](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/) nêu các pháp bảo có khả năng khác và artifact spirits đồng hành. Bài học suy ra: bốn món nên tạo trạng thái/cách dùng có cá tính—kiếm linh, dẫn hồn, nội giới, triệu pháp khí—không chỉ biến thể palette. Không dùng mô tả để suy cách game đó chia sprite/atlas.

[觅长生 — mô tả chính thức](https://store.steampowered.com/app/1189490/?l=tchinese) nêu ngũ hành/thần thông/công pháp, pháp bảo/đan dược và ghép vật liệu luyện pháp bảo. Bài học suy ra: nhận diện hình, cách dùng và FX có thể là các trục độc lập hỗ trợ nhiều build. Gói này chưa quyết định build, craft, loot hoặc balance.

[Nhất Niệm Tiêu Dao — bài chính thức 小师妹, 墨隐千机](https://www.taptap.cn/moment/531819768764695021) mô tả bộ mực đen/xanh, kim loại–lụa, hộp cơ quan ở chân, ô cơ quan sau lưng, nỏ nam/cung nữ và diều cơ khí. Bài học suy ra: có thể thiết kế một **bộ chủ đề** gồm áo, đồ lưng, vũ khí và vật đi cùng thay vì làm mỗi món riêng palette. Đề xuất mới cho Vân Hải là họ du hành cơ quan: áo vẫn đúng anatomy live, một part lưng và một dụng cụ hông; chưa tạo áo/companion/mount.

[Phàm Nhân — bài chính thức 大衍神君 về kim/vòng/xích](https://www.taptap.cn/moment/400732370212225287?group_id=499919) nêu mười ba kim đỏ, vòng lửa, xích ngọc xanh và thú sen. [Bài ngọc/bát](https://www.taptap.cn/moment/404961107912952544?group_id=499919) nêu như ý ngọc đầu sói, bát hồn đen và ngọc bội xanh. [Bài chuông/quạt/châu](https://www.taptap.cn/moment/414748850817859849?group_id=499919) nêu chuông hồn đồng, vệt máu, quạt lửa bảy lông và châu đỏ–đen. Đây là mô tả văn bản của nguồn thị trường, không audit pixel/animation. Bài học suy ra: hình kim, vòng, xích, bát, chuông và quạt có thể nói lên cách dùng trước khi thêm FX; không gán các món ấy thành canon Vương Lâm.

| Motif học từ thị trường | Hướng mới đề xuất cho Vân Hải | Phần cần sản xuất thay vì copy hình |
| --- | --- | --- |
| Bộ áo–cơ quan–vũ khí cùng chủ đề | Du hành cơ quan: kim loại cũ/lụa trầm, part lưng nhỏ, dụng cụ hông; giữ mặt/tóc/live body | Outfit theo pose, back part đổi depth, grip họ vũ khí; không copy ô/nỏ/diều nguồn |
| Kim/vòng/xích tạo silhouette khác | Nhóm vật điều khiển: một cụm kim, một vòng, một thẻ/ấn; mỗi món có nhịp triển khai riêng | Root/orbit/release/return và số vật rõ; không fake bằng quay PNG tĩnh |
| Đồng/ngọc/giấy–niêm gắn vai trò | Họ vật liệu đồng cổ/đá xám/giấy niêm, đổi activeFX theo cách dùng | Native1×/palette/surface mới, alpha riêng, motion khác; không tráo hình body hoặc cấp mechanic |

Ảnh remote trong review thuộc chủ sở hữu gốc, dùng như reference và link bài nguồn; không tải/copy vào runtime. Mô tả trên dựa trên văn bản nguồn; không tuyên bố đã kiểm mọi frame hoặc image pixel.

Kiếm Tu Luyện Khí trong `docs/art_reference` có47biến thể kiếm, Thương Tu có22biến thể thương. Điều học được là cùng họ motion có grip/tip theo direction/frame và layer dùng chung clock. Không dùng source đó thay Vương Lâm làm anatomy hoặc bằng chứng Tiên Nghịch. [Nguồn và giới hạn xem](canon-study.md).

## Ưu tiên tiếp theo

1. Review bốn neutral theo hash tại1×/nền sáng/tối/xám; chọn silhouette và form hiển thị của từng món. Tách form cầm/triển khai/active, không gọi neutral là full experience.
2. Làm một họ đủ view/action để chứng minh đổi trang bị vẫn giữ người: kiếm/grip hoặc châu/kết ấn. Song song khóa nguyên tắc vải/layer của hồn phiên và worldroot của chiến xa, chưa mở hàng loạt màu.
3. Tạo bảy view thật, motion cần dùng và FX theo brief mỗi họ; không mirror/fit từng pose hoặc fake animation bằng xoay ảnh tĩnh.
4. Thử một áo nhập môn trên pose live trước, rồi một wardrobe vai trò. Kiểm body-only, đổi hướng/action/món và mái/tán, không suy đầy đủ từ neutral.
5. Sau production review mới nối appearance/equipment theo quyền server và Core trên fixture. Map owner/navigation/blocker/station/receipt/DB/save giữ nguyên trong nghiên cứu art.
