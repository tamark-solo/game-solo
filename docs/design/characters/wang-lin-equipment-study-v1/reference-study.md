# Nghiên cứu trang bị và thời trang Vương Lâm · 13/10/2026

Mục tiêu là một Vương Lâm Pixel02 hiện hành có nhiều cách cầm vũ khí, dùng pháp bảo và mặc áo. Mặt, tóc, đầu–thân, chiều cao và chân vẫn lấy trực tiếp từ actor live. Reference cung cấp cách tổ chức và ý tưởng; không thay chuẩn anatomy hoặc chép nhân vật/vũ khí ngoài vào game. Bốn hướng xem thử đầu tiên của gói này là kiếm, thương, quạt và hồ lô. Tài liệu này chỉ nghiên cứu; không mở ART approval, trang bị, kỹ năng, chỉ số, save hoặc runtime.

## Reference cục bộ đã đọc và xem

Đọc [audit trước](../../../ACTOR-ART-REFERENCE-STUDY.md), sáu `character.json` trong `docs/art_reference`, và xem trực tiếp 18 PNG được liệt kê dưới đây. Chưa xem mọi frame của 69 biến thể vũ khí; chưa có mã runtime/builder của dự án nguồn. `PROVENANCE.json` là khai báo nguồn, không phải bằng chứng phiên này đã chạy PixelLab.

| Bộ tham khảo | Dữ liệu đọc được | Quan sát ảnh và điều nên học |
| --- | --- | --- |
| `character-runtime-kiem-tu-pixellab-luyen-khi` | 13 motion × 8 hướng; 47 `weaponVariants`; cell192×192; skin/weapon/VFX riêng; `bladeFrames` có grip/tip theo hướng và frame | Áo đen đỏ, tóc dài, kiếm một tay. Idle kiếm thấp bên tay; attack nâng kiếm, vung ra trước, hồi thế. Kiếm thép Thanh Khê có lưỡi thẳng đơn giản; Thanh Phong thêm guard/ngọc, tua xanh và độ cong trang trí. Nhiều thiết kế kiếm dùng chung một họ motion. |
| `character-runtime-thuong-tu-pixellab` | 13 motion × 8 hướng; 22 `weaponVariants`; cell256×256; grip/tip và layer riêng | Thương tre/thép có cán dài và mũi nhỏ; Song Đầu Phệ Hồn có hai đầu cùng đường nét tím rõ. Idle đặt cán chéo/dựng; attack thân và tay ra phía trước, đường cán trải dài ngang. Thiết kế dài làm thay silhouette và vùng vung của actor; cần motion/hai điểm nắm riêng khi Vương Lâm thực sự dùng thương hai tay. |
| `character-runtime-quyen-tu-pixellab` | 13 motion × 8 hướng; không `weaponVariants` hoặc `bladeFrames`; skin + VFX | Áo ngắn, tay gọn, quần rộng, thế quyền mở hai tay. `skill_ranged` cho nhịp tụ lực → đưa tay ra → hồi, hữu ích khi thiết kế động tác điều khiển pháp bảo. Không phải nguồn anatomy để thay Pixel02. |
| `character-runtime-kiem-tu-truc-co` | 13 motion × 8 hướng; bộ khác cell128×128 | Idle có áo choàng dài, tua tóc/đuôi áo rộng và kiếm đỏ. Đây là tham khảo hình dáng phục trang khác, không chứng minh một overlay có thể gắn nguyên vào body Luyện Khí. |
| `character-runtime` | 13 motion × 4 hướng; manifest idle chọn `skin-idle.png` | `idle.png` và `skin-idle.png` là hai appearance toàn thân khác nhau. Bộ `skin` là ảnh toàn thân theo motion, không chỉ một lớp áo phủ lên anatomy bất biến. Không học cách đổi áo bằng cách tráo nhân vật toàn thân khác tỷ lệ. |

Không thấy một pack quạt, hồ lô, chuông, pháp ấn hoặc pháp châu độc lập trong sáu thư mục. Quạt/hồ lô của gói đầu là thiết kế mới; không gán chúng là mẫu đã có trong `art_reference`.

Một giới hạn đáng chú ý: `skill_ranged.png` của Kiếm Tu Luyện Khí vẫn có mảng khí xanh trong body ở một số hướng Đông/Đông Nam, dù manifest còn layer `vfx-over`. Tách layer được khai báo không đồng nghĩa mọi PNG thân đã sạch. Bộ Vương Lâm mới phải xem body khi tắt hết FX.

## Học cấu trúc trang bị, giữ nhận diện

Reference Kiếm Tu/Thương Tu mô tả `skin`, `weapon`, `vfx-behind`, `vfx-over` dùng chung motion/frame/hướng. Attack kiếm có6frame/12fps, contact ởframe3; thương có6frame/14fps, contact ởframe3. Combat kiếm có8frame/12fps với2contact; thương có8frame/18fps với3contact. Những con số này là timing của reference, không đề xuất chép damage/tốc độ sang Vân Hải.

Ví dụ `attack/southeast` Kiếm Tu có grip đi từ `(100.5,126.5)` ởframe0 lên `(88.4,69.4)` ởframe2 rồi ra `(130.0,119.0)` ởframe3. Vì vậy không gắn vũ khí bằng một tọa độ tay cố định. Vũ khí phải đi theo socket đúng hướng/pose, cùng clock với body; phần sau tay/thân cần thứ tự che phù hợp. Weapon/FX thuộc depth group của actor để mái/tán vẫn che đúng.

Các biến thể cùng họ cầm có thể đổi lưỡi, cán, ngọc, tua, hoa văn và khí. Khác họ cầm phải có pose riêng: không thay PNG kiếm thành thương/quạt rồi giữ nguyên mọi động tác. Với pháp bảo bay, body làm động tác điều khiển còn vật thể có quỹ đạo/timeline riêng; neutral item-only đặt cạnh body live là bước đối chiếu silhouette, chưa xác nhận nắm tay hoặc animation.

## Đề xuất mở rộng vũ khí và pháp bảo

Các tên/hành vi dưới đây là đề xuất riêng cho Vân Hải, chưa được tạo hoặc triển khai ngoài bốn neutral đầu.

| Họ | Biến thể hình dáng nên làm | Cảm giác và động tác cần phân biệt |
| --- | --- | --- |
| Kiếm một tay | Thiết kiếm nhập môn, Thanh Ngọc mảnh, cổ kiếm bản rộng, kiếm băng trong, kiếm lôi có rãnh sáng | Một họ nắm; idle hạ mũi, run giữ chắc, ba nhịp chém khác nhau. Màu/FX không thay cỡ đầu–thân. Kiếm bản quá nặng cần động tác riêng. |
| Thương | Trúc thương, ngân thương tua đỏ, long thương xanh, thương hai đầu tím | Hai điểm nắm; đâm dọc/thu cán/quét ngang; khoảng trống quanh thân đủ cho cán. Thương hai đầu cần xét hai mũi khi quay. |
| Quạt | Quạt giấy mực, Thanh Ngọc gân kim loại, quạt lông trắng, quạt lửa | Có neutral đóng/mở; cổ tay mở nan, quạt ra hình quạt, khép hồi. Diện lớn dễ che mặt; phải đọc được người tại1×. |
| Hồ lô | Hồ lô gỗ dây thừng, ngọc xanh, đồng khắc trận, hồ lô đỏ niêm phù | Trạng thái đeo hông và cầm tay; nhấc miệng bình/đẩy tay hoặc điều khiển bay. Khói/luồng khí là layer riêng. |
| Phi kiếm/pháp châu | Một phi kiếm, bộ ba kiếm, một châu lơ lửng, vòng châu | Người kết ấn; vật quay/ngắm/phóng rồi trở về. Đây là họ bay, không dùng grip của kiếm một tay. |
| Pháp ấn/linh kính/chuông | Ấn vuông ngọc, gương bát quái, chuông đồng nhỏ | Neutral treo/đỡ bằng tay; tụ lực trước ngực rồi phóng hoặc rung; glyph/vòng trận tách body. |
| Phù/kinh quyển/trận kỳ | Phù giấy, cuộn sách, cờ cán ngắn | Tay rút/giữ/niệm; giấy/vải có form đóng/mở và motion riêng. Không cần đổi toàn bộ silhouette body để tạo trải nghiệm khác. |

Ưu tiên sau bốn mẫu: thêm hai biến thể kiếm trong cùng họ để chứng minh đổi trang bị giữ anatomy, rồi một pháp bảo bay để chứng minh vật thể có timeline riêng. Đừng nhân thêm hàng chục màu trước khi motion/grip và độ đọc tại1× ổn định.

## Thời trang: tạo thêm áo cho cùng một người

| Gia đình phục trang đề xuất | Biến thể có thể dùng chung khung pose | Phần cần sản xuất thêm |
| --- | --- | --- |
| Áo nhập môn hiện hành | Xám nguyên bản, xanh ngọc, nâu tro; đổi viền/cổ/đai/túi nhỏ | Cùng mặt, tóc và anatomy live; hoa văn ít pixel, không repaint đầu. Đây là họ dễ bắt đầu nhất. |
| Kiếm tu thanh nhã | Áo trắng ngà–ngọc, xanh lam–bạc, đen–đỏ | Tay áo gọn để đọc grip; độ dài vạt hợp run và combo. |
| Du hành/đan tu | Áo nâu vải, áo lam túi thảo dược, áo trắng đai xanh; hồ lô/túi bên hông | Túi/dây đeo có trước/sau theo hướng; giữ chân và silhouette chính. |
| Pháp tu | Áo dài tay rộng, đạo bào ngọc, áo tím trận văn | Tay áo và vạt phải theo pose, không lấy neutral overlay dùng cho mọi action. Motion cầm thương/quạt có nguy cơ vải chồng cán/nan. |
| Giáp nhẹ/ma tu | Giáp vai nhỏ, hộ thủ, áo đen đỏ, vạt rách có chủ ý | Part vai/tay/thân và che grip; ma khí là layer riêng, trạng thái sử dụng do server quyết định. |
| Lễ phục/cảnh giới cao | Đạo bào viền vàng, áo choàng sao, y phục nghi lễ | Tua dài/áo choàng cần motion riêng; kiểm native trước khi tăng chi tiết. Concept không cấp quyền Hóa Thần/Đọa Ma. |

Một outfit phải được đo trực tiếp với Vương Lâm live theo đúng hướng và pose: sọ/mặt, cổ, vai, hông, gối, chân. Giữ hình học người; vải có thể rộng hoặc dài hơn. Tách họ áo/motion và họ vũ khí để có nhiều tổ hợp; không tạo một Vương Lâm khác mặt/anatomy cho mỗi món. Những tổ hợp chưa có pose/grip phải ghi thiếu, không suy đầy đủ từ neutral.

## Tham khảo thị trường: ý tưởng trải nghiệm, không nguồn pixel

[Tale of Immortal — mô tả chính thức trên Steam](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/) mô tả nhiều linh căn/manual và pháp bảo: Bagua Jade, Eye of Providence, Mythical Gourd mang các khả năng khác nhau; artifact spirits còn đồng hành chiến đấu. Bài học rút ra cho thiết kế của ta: pháp bảo có thể tạo một kiểu trải nghiệm và biểu hiện riêng, vượt việc đổi màu kiếm. Đây là suy luận thiết kế, không bằng chứng về cấu trúc layer/sprite của game đó.

[觅长生 — mô tả chính thức trên Steam](https://store.steampowered.com/app/1189490/?l=tchinese) mô tả tương tác ngũ hành với thần thông/công pháp, pháp bảo/đan dược, và ghép vật liệu luyện pháp bảo. Bài học rút ra: chia nhận diện món đồ và hiệu ứng/cách dùng; cùng loại hình có thể hỗ trợ nhiều build, không buộc mỗi màu áo phải có bộ body khác. Tài liệu chỉ học mô tả chính thức, chưa kiểm gameplay hoặc thời trang từng game.

## Nguồn đã xem và SHA-256

Tiền tố `K` = `docs/art_reference/character-runtime-kiem-tu-pixellab-luyen-khi/`; `T` = `docs/art_reference/character-runtime-thuong-tu-pixellab/`; `Q` = `docs/art_reference/character-runtime-quyen-tu-pixellab/`; `D` = `docs/art_reference/character-runtime/`; `C` = `docs/art_reference/character-runtime-kiem-tu-truc-co/`. `.pk.png` là ảnh atlas đã đóng gói được xem trực tiếp; không đọc như raw lưới hàng-hướng khi chưa có descriptor tương ứng.

| Nguồn | SHA-256 |
| --- | --- |
| K`character.json` | `c650f906a37277096ddab42fdc58c71387885ef37f1c9d25d55eae9277405654` |
| K`idle.png` | `8fd993f15c62452163e06cb8956a594d9a088827f585e9f6cc130dd345ca1931` |
| K`attack.png` | `256aea22b830a9227f5505229f35f5b78d55f52e9f06a4a930e3fcd60253092a` |
| K`attack-weapon.png` | `98e42e27f977ec0f133db7f86fbc45720483e9829bbd88908bbd1054c0c0d7fe` |
| K`idle-weapon.png` | `5f94b68e6fd4d0de1c243c340f147509bc03d9173f109a251fdbe4632861a684` |
| K`idle-weapon@thanh-khe-thiet.pk.png` | `abcef84ee2f538849a25d9cc29f74b1d8e40fd71d5d55b0cd0db5010742432c6` |
| K`idle-weapon@thanh-phong.pk.png` | `23ec8faf24ee2135f877e477195bea12f13bb0ba203f74a060745c6467d92a22` |
| K`skill_ranged.png` | `09d1b2753640f44507a24a7cf10a33da7ea277adbbaa2c9a9a3c7c465d1d7a50` |
| T`character.json` | `b6883fa69e285f8ec3e15f1347ee27d5dbf11ebd34ae8ecfc27ac0defd45747c` |
| T`idle.png` | `1fbada344f253569142fab2b5b86fa8be08bcae11152672891e6362b417d5464` |
| T`idle-weapon.png` | `75d09e54e0b8010ef605323ee96c4e00148da34fc53af2414ed5b61d9469f39d` |
| T`attack.png` | `16b85a1d3a0ef226e00a11a888060ac70d5c621e6fb5ba45225ffe505ae3673f` |
| T`attack-weapon.png` | `59bd0f6b550cf6bf28f03c517c0b0c872f6a09b2b7531137b70d56659596f1df` |
| T`idle-weapon@thanh-khe-truc-thuong.pk.png` | `4b627a2177a5ca931bef40c2c038c34e2049ee147e37163684cae7c502f4295f` |
| T`idle-weapon@song-dau-phe-hon-thuong.pk.png` | `ff024189bac7b5c805913788fac5499ba9422eb0c9296faeb4a7fbc1ae95ee3d` |
| Q`character.json` | `0cc7bab06130b1fcd11af33398113688ba8961a2706d0433cbb8fd2184f24a68` |
| Q`skill_ranged.png` | `01150974438b2364e1b78763004ac4d933078c2e83a6a3ae270155d92ffc365e` |
| Q`idle.png` | `8b14fbe8e8143ee1049ba75888fc4a86e61b9633ded28d66af7e5f4f9a7fd385` |
| D`idle.png` | `e99570aca5b766b7703e3685d405b345da54e9ef6ae55641807e63fd59a621c4` |
| D`skin-idle.png` | `0a67607c0a4b06ebdc5c247421716f0e7f2a73318546f5e299a3cc07501ab6d6` |
| C`idle.png` | `98333b5d805fce90a694024311d015f8fd850ff6db90c8e9df4133235c435083` |

Giữ source nguyên byte. Nghiên cứu này không thay `ACTOR-ART-REFERENCE-STUDY.md`, các atlas live, dữ liệu map/DB hoặc receipt.
