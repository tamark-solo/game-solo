# Dàn nhân vật và tạo hình — bản online

> **Snapshot lịch sử — không phải luật hiện hành.** Giữ nội dung quyết định theo thời điểm nguồn; chỉ nhãn trạng thái và đường dẫn đọc được cập nhật khi rà soát ngày 08/10/2026. Hướng hiện hành: [GDD 0.28](../../GDD.md), [trạng thái dự án](../../PROJECT-STATUS.md) và [mục lục lịch sử](README.md).

**Phiên bản:** 1.3, ngày 07/10/2026.  
**Hướng hiện tại:** MMORPG có idle, đệ tử riêng; nhân vật pixel art trên nền stylized 2D/top-down ba phần tư. Portrait/truyện giữ tranh mực/giấy cổ.  
**Đã chốt:** ba nhân vật trọng tâm Vương Lâm, Tư Đồ Nam, Lý Mộ Uyển; ưu tiên tạo hình bộ ba trước NPC phụ. **Đã duyệt:** nhận diện Vương Lâm v2 và Lý Mộ Uyển v1. **Tạm chấp nhận:** Tư Đồ Nam đứng v3 làm chuẩn thiết kế. **Còn đánh giá:** hai đệ tử và phạm vi NPC/tùy biến.  
**Tham chiếu:** [GDD](GDD.md), [định hướng online](ONLINE-DIRECTION.md), [ART](../../ART-DIRECTION.md), [hồ sơ Vương Lâm](../../WANG-LIN-VISUAL-SPEC.md), [roster dữ liệu](../../data/character-roster.json), [thư viện tạo hình](../../design/characters/index.html).

**Nguồn tạo hình đã chọn:** mô tả tiểu thuyết và diện mạo riêng của game. Nhận diện Vương Lâm v2 đã được người phát triển duyệt. [Bộ native đầu tiên](../../WANG-LIN-SPRITE-SPEC.md) có 28 frame 64 × 96, gồm đứng và đi bốn hướng; xem tại [trang animation](../../design/characters/wang-lin-gray-walk-v1/index.html).

## 1. Có bao nhiêu nhân vật chính?

Mỗi người chơi có **1 đệ tử do mình điều khiển**. Tên do người chơi đặt; đây là nhân vật mới do game bổ sung. MVP đề xuất 2 mẫu diện mạo nam/nữ dùng chung cho mọi tài khoản. Hai mẫu là lựa chọn hình ảnh, không phải hai nhân vật có tuyến truyện cố định.

Trục truyện dài hạn đã chốt tập trung vào **3 nhân vật: Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển**. Vương Lâm là nhân vật trung tâm nguyên tác; hai người còn lại được chọn cho kế hoạch chuyển thể. Người phát triển xác nhận ưu tiên làm nhận diện bộ ba trước nhóm NPC phụ. [Hồ sơ bộ ba](../../CORE-CHARACTER-VISUAL-SPEC.md) và [trang xem](../../design/characters/core-trio-v1/index.html) ghi tạo hình/căn cứ. Đây là phạm vi thiết kế của game, không phải khẳng định nguyên tác chỉ có ba nhân vật chính.

| Giai đoạn | Nhân vật truyện mới | Tổng nhân vật truyện đã lên kế hoạch | Nhân vật trọng tâm trong số đó |
| --- | --- | --- | --- |
| A — Nhập môn | Vương Lâm, cha, mẹ, tứ thúc, Vương Trác, Trương Hổ, Tôn Đại Trụ | **7** | Vương Lâm |
| B — Luyện thuật và giao đấu | Vương Hạo, Tư Đồ Nam, Chu Bằng / Zhou Peng | **10** | Vương Lâm, Tư Đồ Nam |
| Arc sau A → B | Lý Mộ Uyển | **11 trong danh mục hiện tại** | Đủ 3 nhân vật trọng tâm đã chốt |

Không cộng đệ tử của các tài khoản vào số NPC. Khi bổ sung arc, thêm nhân vật thật sự cần cho sự kiện/luật mới rồi cập nhật roster. Con số 11 không phải giới hạn toàn bộ game dài hạn.

A có 7 người nhưng **6 nguồn chân dung NPC** vì cha mẹ dùng chung một hình. Thêm 2 nguồn chân dung đệ tử người chơi thành **8 nguồn nhân vật tối đa cho A**. Ưu tiên 6 nguồn: hai mẫu người chơi, Vương Lâm, cha mẹ, Trương Hổ, Tôn Đại Trụ; tứ thúc và Vương Trác có thể dùng thẻ tên trong bản thử.

Con số 8 ở đây là **nguồn chân dung**, chưa gồm sprite/animation của đệ tử hoặc NPC trên map. [MMORPG-DIRECTION.md](MMORPG-DIRECTION.md) bổ sung phạm vi hình cho thế giới đi lại; NPC nào cần hiện trên map sẽ chọn theo nhiệm vụ, không mặc định cả roster phải có sprite.

## 2. Đệ tử người chơi

| Nội dung | Đề xuất cho A |
| --- | --- |
| Vai trò | Một đệ tử mới có tiến trình tu luyện riêng; tìm hiểu chính truyện qua chương cá nhân |
| Lựa chọn lúc tạo | Tên và một trong hai mẫu diện mạo; lựa chọn hình không đổi chỉ số |
| Tuổi thể hiện | Người trưởng thành trẻ, khoảng 18–22; lựa chọn minh họa của game |
| Trang phục | Đời thường màu đất → đồng phục nhập môn xám, đai xanh trầm; tiến trình trang phục của người chơi có luật riêng |
| Dấu nhận diện | Mặt và kiểu tóc khác Vương Lâm; có tên người chơi trên thẻ/UI |
| Sở hữu | Tài nguyên, công pháp và đồ nhập môn cá nhân; vật phẩm độc hữu của nguyên tác được phân biệt rõ trong hồ sơ truyện |
| Hiển thị online | Nhân vật pixel/top-down ba phần tư; bộ thử đệ tử dùng frame 64 × 96, 4 hướng đứng/đi, cùng điểm chân với Vương Lâm |

Mẫu nam v2 có mặt rộng/hàm hơi vuông, vai rộng và búi tóc cao gọn. Mẫu nữ v2 có mặt oval rộng, dáng gọn và một búi tóc thấp sau gáy. Cả hai mặc áo xám, cổ ngà, đai xanh trầm, quần tối và giày vải. Tên mẫu trong dữ liệu là `AVATAR-NOVICE-MALE` và `AVATAR-NOVICE-FEMALE`; tên riêng trong game thuộc người chơi. [Hồ sơ đệ tử](../../PLAYER-AVATAR-VISUAL-SPEC.md) và [trang thử](../../design/characters/player-avatars-v2/index.html) ghi dấu nhận diện và bộ đứng/đi 28 frame/mẫu. Hai tạo hình này còn chờ đánh giá.

Trong A, tùy biến giới hạn ở hai mẫu và tên. Bộ trộn mặt/tóc, nhuộm trang phục, trang phục bán hàng và nhiều lớp nhân vật cần một kế hoạch khác; số lượng mẫu không quyết định số lượng người được chơi.

Mẫu màn thế giới v1 (nguồn `design/world/index.html` đã xóa; [hồ sơ reset](../../MAP-ASSETS-RESET.md)) thể hiện đệ tử ở cỡ khoảng 85 px trong khung cảnh rộng 960 px. Tỷ lệ 4–5 đầu và cỡ này là đề xuất, không thay việc duyệt mặt/trang phục của concept v1. [WORLD-VISUAL-SPEC.md](../../WORLD-VISUAL-SPEC.md) ghi phần kiểm tra trước bộ sprite.

Sau [thử Vương Lâm nét mịn/pixel](../../design/characters/wang-lin-sprite-study/index.html), người phát triển ưu tiên pixel art cho nhân vật trên map. Bản pixel dùng nghiên cứu nhận diện, chưa xác nhận tỷ lệ 4–5 đầu hoặc frame native. Mẫu sân cũ giữ tham chiếu nền/bố cục và chưa đổi hình người trong ảnh. Roster/số NPC không đổi do lựa chọn mỹ thuật.

Đã có thử ghép Vương Lâm pixel v1 (nguồn `design/world/hybrid-study/index.html` đã xóa; [hồ sơ reset](../../MAP-ASSETS-RESET.md)), giữ PNG nhân vật gốc trên nền sân riêng với cỡ 80/96/112 px. Nhãn vẫn là nhân vật truyện. Bản thử giúp duyệt tỷ lệ/lưới trước khi tạo sprite cho đệ tử người chơi và các NPC khác.

## 3. Ba nhân vật trọng tâm dài hạn

### Vương Lâm — NPC trung tâm từ A

- Khởi đầu là thiếu niên khoảng **15 tuổi**, có kỳ vọng của gia đình. Nguồn tuổi và quan hệ gia đình: [chương 1](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-1).
- Một gương mặt xuyên suốt giai đoạn A, tóc đen, dáng mảnh, ánh mắt kiên trì; hình khuôn mặt/kiểu buộc tóc là lựa chọn ART.
- Ba bộ đồ: đời thường E01–E03; xám E04; đỏ từ E05. Màu trang phục theo [chương 10](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-10) và [chương 17](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17).
- [Hồ sơ tạo hình nhập môn](../../WANG-LIN-VISUAL-SPEC.md) ghi thần thái theo cảnh và biến thể tạm thời trong hang. Nhận diện v2 đã duyệt; bộ áo xám đầu tiên có palette/lưới native và chuyển động cần xem thử.
- Concept không thêm vũ khí, áo giáp hoặc hình ảnh cảnh giới cao vào giai đoạn nhập môn. Hạt châu được trình bày trong cảnh/vật phẩm đúng mốc, không phải phụ kiện trang trí lộ thiên của chân dung.
- Trong UI, nhãn luôn ghi **Vương Lâm · Nhân vật truyện**; chân dung người chơi có tên tài khoản/đệ tử riêng. Trang phục NPC suy từ mốc truyện, không suy từ cảnh giới của người chơi.

### Tư Đồ Nam — NPC trọng tâm từ B

- Vai trò: mở thêm kiến thức tu luyện và góc nhìn về thế giới, gắn với không gian trong châu. Đối chiếu [chương 47](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47).
- Chỉ xuất hiện khi chương cá nhân đã tới mốc B phù hợp. A không dùng ông làm người hướng dẫn tạo nhân vật.
- Linh thể đứng v3 giữ nhận diện v2: hàm rộng, mũi thẳng, nét cười tự tin; tóc đen buộc thấp có chút bạc ở thái dương. Thân thẳng, chân duỗi, tay thả tự nhiên; lơ lửng nhẹ, khoảng rỗng ở ngực và mép dưới đứt nhẹ biểu thị linh thể. Tư thế đứng/mắt mở là ART chuyển thể.
- Lần giới thiệu chương 46–47 chủ yếu là tiếng nói; hình đứng phục vụ cảnh tương tác được biên tập. Bộ ngồi 128 × 128 tham chiếu chương 112 được lưu cho cảnh tu luyện; không tự chuyển mốc truyện hoặc đặt linh thể vào môn phái A.
- Người phát triển tạm chấp nhận mẫu đứng v3 và bốn hướng tĩnh 64 × 96 làm chuẩn để tiếp tục thiết kế; ART vẫn có thể chỉnh ở bước hoàn thiện. Điểm chiếu (32, 88), hình lơ lửng cao 4 px; animation lướt và thân thể phục hồi cần gói riêng.

### Lý Mộ Uyển — NPC trọng tâm của arc sau

- Vai trò đề xuất trong game: quan hệ quan trọng của chính truyện và điểm mở cho nội dung đan dược khi arc tương ứng được biên tập.
- Không xuất hiện trong A/B hiện tại. Chưa dùng làm NPC bán đan hoặc người hướng dẫn nhập môn.
- Đã có tạo hình v1 thời Hỏa Phần/Tu Ma Hải: mặt oval hơi dài, tóc dài buộc đuôi, áo tím tham chiếu cảnh luyện đan chương 144; biến thể áo đỏ theo mốc gặp đầu chương 130–131.
- Đường mặt/cắt áo là ART riêng của game, không lấy gương mặt hoạt hình hoặc bộ cung trang xanh của người phụ nữ khác ở chương 130.
- Nhận diện v1 đã được chấp nhận; mẫu đứng áo tím 64 × 96 có bốn hướng tĩnh làm chuẩn đầu tiên. Diễn hoạt và thời điểm mở arc tiếp tục biên tập riêng.

## 4. Nhân vật phụ và độ ưu tiên

Mọi chi tiết mặt, vóc dáng và đạo cụ dưới đây là chỉ đạo hình ảnh đề xuất; các vai trò đã có nguồn trong GDD/ASSET-PLAN. Đạo cụ chỉ đưa vào hình thật khi đã kiểm tra đúng mốc.

| Nhân vật | Giai đoạn | Vai trò | Dấu nhận diện để phát triển hình | Ưu tiên |
| --- | --- | --- | --- | --- |
| Cha Vương Lâm | A / E01 | Kỳ vọng gia đình | Người lao động trung niên, bàn tay làm việc; áo màu đất, hình khối khác tứ thúc | P1, hình nhóm |
| Mẹ Vương Lâm | A / E01 | Quan hệ gia đình | Trang phục đời thường, tóc gọn, nét mặt ấm; cùng cha trong một khung | P1, hình nhóm |
| Tứ thúc | A / E01 | Đem tới cơ hội dự tuyển | Dáng chắc, phong thái từng trải, trang phục chỉnh tề hơn cha | P2 |
| Vương Trác | A / E02 | Đối chiếu tư chất và thân thế | Cùng thế hệ Vương Lâm, dáng tự tin; tóc/trang phục gọn, hình mặt khác | P2 |
| Trương Hổ | A / E04 | Quan hệ thời ký danh | Áo xám, dáng vất vả và đời thường; hình khối khuôn mặt khác Vương Lâm | P1 |
| Tôn Đại Trụ | A / E05 | Sư phụ ở giai đoạn này | Người lớn tuổi hơn nhóm đệ tử, nét mặt khó đoán; hồ sơ trang phục trước khi vẽ | P1 |
| Vương Hạo | B | Trao đổi và sinh hoạt đồng môn | Thanh niên lanh lợi, nét mặt/đạo cụ khác Vương Trác | B |
| Chu Bằng / Zhou Peng | B | Đối thủ ở mốc giao lưu | Tư thế tự tin, silhouette và diện mạo khác NPC đồng môn | B |

Vương Hạo đối chiếu [chương 33](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-33); vai trò Chu Bằng đối chiếu [chương 52](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-52). Tên Việt của Zhou Peng tiếp tục cần chuẩn hóa theo bản dịch được chọn.

## 5. Thư viện tạo hình đã thực hiện

| Concept | Nội dung | Hình | Prompt chính xác |
| --- | --- | --- | --- |
| Vương Lâm nhập môn v2 | Ba bộ đồ thường, 4 góc mặt/tóc, một biến thể cảnh hang | [PNG](../../design/characters/wang-lin-initiation-v2.png) | [Prompt](../../design/characters/wang-lin-initiation-v2.prompt.txt) |
| Biểu cảm Vương Lâm v2 | Hy vọng, thận trọng, tập trung và mệt | [PNG](../../design/characters/wang-lin-expressions-v2.png) | [Prompt](../../design/characters/wang-lin-expressions-v2.prompt.txt) |
| Pixel đứng áo xám v2 | Một tư thế cùng camera v1, gấu áo đã chỉnh, alpha trong suốt | [PNG](../../design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.png) | [Prompt](../../design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.prompt.txt) |
| Vương Lâm nhập môn v1 — lưu tham chiếu | Nghiên cứu trước hồ sơ nguồn v0.12 | [PNG](../../design/characters/wang-lin-initiation-v1.png) | [Prompt](../../design/characters/wang-lin-initiation-v1.prompt.txt) |
| Tư Đồ Nam linh thể đứng v3 | Mặt/tóc v2, ba góc đứng lơ lửng và hai đầu biểu cảm | [PNG](../../design/characters/core-trio-v1/situ-nan-spirit-standing-v3.png) | [Prompt](../../design/characters/core-trio-v1/situ-nan-spirit-standing-v3.prompt.txt) |
| Lý Mộ Uyển thời đầu v1 | Ba góc áo tím, áo đỏ cùng nhận diện, tóc buộc đuôi và lò đan tham chiếu | [PNG](../../design/characters/core-trio-v1/li-muwan-early-identity-v1.png) | [Prompt chỉnh tóc](../../design/characters/core-trio-v1/li-muwan-early-identity-v1.prompt.txt), [prompt đầu](../../design/characters/core-trio-v1/li-muwan-early-identity-v1-study.prompt.txt) |
| Đệ tử nam v2 | Mặt/hàm/vai rõ hơn, tóc búi cao, đồng phục gọn; ba góc thân và hai chân dung | [PNG](../../design/characters/player-male-novice-v2.png) | [Prompt](../../design/characters/player-male-novice-v2.prompt.txt) |
| Đệ tử nữ v2 | Búi thấp nhất quán ở các góc, đồng phục gọn; ba góc thân và hai chân dung | [PNG](../../design/characters/player-female-novice-v2.png) | [Prompt chỉnh tóc](../../design/characters/player-female-novice-v2.prompt.txt), [prompt đầu](../../design/characters/player-female-novice-v2-study.prompt.txt) |
| Đệ tử nam v1 | Chính diện, góc nghiêng, lưng, chân dung và đồ đời thường | [PNG](../../design/characters/player-male-novice-v1.png) | [Prompt](../../design/characters/player-male-novice-v1.prompt.txt) |
| Đệ tử nữ v1 | Chính diện, góc nghiêng, lưng, chân dung và đồ đời thường | [PNG](../../design/characters/player-female-novice-v1.png) | [Prompt](../../design/characters/player-female-novice-v1.prompt.txt) |

Tạo bằng **imagegen tích hợp**, lưu trong dự án để xem tại [thư viện nhân vật](../../design/characters/index.html). [Manifest v2](../../design/characters/wang-lin-v2-study.json) ghi input và trạng thái; các bảng trên giấy và mẫu pixel trong suốt còn là nghiên cứu. Các file có thể lớn hơn ngân sách tải của asset thật vì chỉ dùng trong tài liệu thiết kế.

Nhận diện Vương Lâm v2 đã duyệt; bộ áo xám đã xuất native 64 × 96, 4 đứng/24 đi, palette 24 mục và điểm chân (32, 88), được lấy làm chuẩn thử sau phản hồi. Hai mẫu đệ tử v2 có 56 frame tổng và trang so sánh cùng Vương Lâm; nhận diện/chuyển động đệ tử cần đánh giá riêng. [Ba chân dung UI cơ bản](../../design/characters/core-ui-v1/index.html) đã có PNG/WebP 512/160/64; hình mới chờ đánh giá. Đệ tử và biểu cảm riêng chưa có gói thumbnail mới. Nguồn/prompt và các lần xuất trước được giữ trong các gói.

## 6. Thứ tự sản xuất sau bước này

1. Đánh giá [ba chân dung UI](../../design/characters/core-ui-v1/index.html) ở 64/160 px theo nhận diện hiện tại; Tư Đồ Nam đứng v3 là chuẩn thiết kế tạm chấp nhận.
2. Sau phản hồi chân dung, sản xuất từng bộ theo [kế hoạch động tác](../../CORE-CHARACTER-MOTION-PLAN.md): đứng/đi Vương Lâm đã có, lơ lửng/lướt Tư Đồ Nam và đi/luyện đan Lý Mộ Uyển còn thiết kế.
3. Tiếp tục hoàn thiện hai đệ tử và NPC của A: cha mẹ → Trương Hổ → Tôn Đại Trụ, sau đó tứ thúc/Vương Trác nếu cần.
4. Biên tập tuyến riêng người chơi, map/nhiệm vụ/online trước khi viết prototype; giữ các mốc truyện làm tham chiếu.
5. B và arc sau tích hợp các nhân vật theo chương cá nhân. Tạo hình sớm không chuyển thời điểm xuất hiện hoặc mở nội dung trước A.

Chưa tạo toàn bộ 11 NPC trong một đợt. Mỗi concept cần có vai trò, giai đoạn xuất hiện và bản gương mặt được duyệt trước khi làm nhiều biến thể.
