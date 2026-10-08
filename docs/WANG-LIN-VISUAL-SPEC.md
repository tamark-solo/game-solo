# Hồ sơ tạo hình Vương Lâm — giai đoạn nhập môn

**Phiên bản:** 0.4, ngày 07/10/2026.  
**Nhân vật:** `CHR-WANG-LIN`, NPC trung tâm chính truyện; nguồn chân dung `AS-CHR-001`.  
**Đã chốt:** dùng mô tả tiểu thuyết, thiết kế diện mạo riêng cho game. Nhân vật trên map dùng pixel art; nền stylized 2D; camera top-down ba phần tư; portrait/truyện giữ tranh mực và giấy cổ.  
**Trạng thái:** nhận diện v2 đã được người phát triển duyệt; bộ áo xám đầu tiên đã có 28 frame native 64 × 96, palette 24 mục và trang xem chuyển động. Các hình trước đó giữ làm nguồn.  
**Tham chiếu:** [dàn nhân vật](CHARACTERS.md), [ART](ART-DIRECTION.md), [asset](ASSET-PLAN.md), [hình trên map](WORLD-VISUAL-SPEC.md), [roster](data/character-roster.json).

## 1. Cách dùng mô tả nguyên tác

Mục tiêu là nhìn thấy cùng một người qua tuổi, thân phận, trải nghiệm và biểu cảm. Mỗi chi tiết có hai loại căn cứ: **chi tiết truyện đã kiểm tra** và **lựa chọn ART của game**. Phần truyện giữ đúng mốc; phần ART được phép thiết kế riêng rồi dùng nhất quán giữa chân dung và sprite.

Nguồn đối chiếu hiện tại là bản dịch tiểu thuyết trên Wuxiaworld. Tên Việt và các ID E dùng theo GDD hiện có. E01–E08 là nhóm sự kiện chuyển thể, không phải số chương và không phải nhiệm vụ của đệ tử người chơi. Các nguồn dưới đây chỉ xác minh giai đoạn nhập môn; diện mạo của arc sau cần hồ sơ mới.

| Nguồn | Chi tiết truyện đã kiểm tra | Hệ quả cho brief |
| --- | --- | --- |
| [Chương 1](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-1) | Khởi đầu 15 tuổi, ham đọc, được cha mẹ yêu thương. Cha là thợ mộc giỏi; gia đình không thiếu ăn mặc | Diện mạo thiếu niên; đồ thường giản dị, được chăm sóc; bỏ mô tả xuất thân nghèo vật chất |
| [Chương 8](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-8) | Trong hang: sắc mặt nhợt, tay phải bị thương, vải áo rách; thương tích thuyên giảm nhờ sương từ châu | Biến thể cảnh `cave_damage`, chỉ dùng trước khi hồi phục |
| [Chương 10](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-10) | Đệ tử ký danh mặc xám; Vương Lâm phải lấy nước, chịu lời khinh miệt và giữ kín hạt châu | Đồng phục xám là bộ thường; thần thái dè dặt; châu không đeo lộ như trang sức |
| [Chương 17](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17) | Tôn Đại Trụ nhận làm đệ tử; túi có bộ đồ đỏ và công pháp. Vương Lâm vui mừng, sau đó thận trọng và kiên trì luyện dù mệt | Bộ đỏ chuyển thân phận; biểu cảm thay theo cảnh, không luôn lạnh lùng |
| [Chương 25](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-25) | Đạt tầng đầu: mắt sáng hơn, tâm trí rõ và bình tĩnh; còn tình cảm với cha mẹ. Tạp chất làm bẩn áo rồi được tắm rửa | Thay thần thái/hiệu ứng ở cảnh đột phá; giữ nhận diện và bộ đỏ sau cảnh |

Các chương đã kiểm tra chưa đủ căn cứ để chốt hình mắt, mũi, độ dài tóc, kiểu buộc tóc, màu đồ đời thường hoặc từng đường cắt áo. Những chi tiết này ở phần 2–3 là đề xuất ART, không ghi thành mô tả nguyên tác.

## 2. Một diện mạo xuyên suốt A — đề xuất ART

| Thành phần | Chỉ đạo hình ảnh |
| --- | --- |
| Tuổi thể hiện | Thiếu niên ở đầu hành trình; mặt và vai còn trẻ. Thời gian bế quan không tự đổi mẫu thành người trưởng thành trung niên |
| Khuôn mặt | Oval hơi dài, cằm mềm, má còn độ đầy; lông mày tự nhiên. Giảm hốc mắt sâu, hàm vuông và góc nhìn quá dữ của mẫu thử |
| Mắt và miệng | Ánh nhìn chú ý, có thể bộc lộ hy vọng hoặc lo lắng; nét miệng vừa đủ thay biểu cảm. Không dùng một nét cau mày cho mọi cảnh |
| Tóc | Đen, buộc nửa đầu bằng dây vải giản dị, phần tóc sau gọn. Hình tóc phải nhận ra ở hướng trước, bên và sau |
| Dáng người | Mảnh, vai hẹp, trang phục nhẹ; tư thế đứng tự nhiên, không mặc định tư thế chiến đấu |
| Dấu nhận diện | Đường tóc, hình đầu và cổ áo nhất quán qua ba bộ đồ; khác mẫu đệ tử nam của người chơi |
| Đạo cụ | Sách/bầu/túi chỉ xuất hiện theo cảnh đã biên tập. Châu được vẽ riêng trong cảnh phát hiện hoặc kiểm tra vật phẩm |

Các cỡ hiển thị 80/96/112 px trong nghiên cứu ghép (bộ cũ đã xóa) giữ là lịch sử thử tỷ lệ. Nhận diện đã duyệt; [spec sprite](WANG-LIN-SPRITE-SPEC.md) chọn frame 64 × 96 cho bộ áo xám đầu tiên, hình trong frame cao khoảng 80–82 px. PNG nghiên cứu lớn tiếp tục làm nguồn tạo hình.

## 3. Ba bộ đồ và biến thể theo cảnh

| Key | Mốc chính truyện tham chiếu | Brief ART | Cách thể hiện thần thái |
| --- | --- | --- | --- |
| `civilian` | E01–E03 | Áo vải màu kem/đất nhạt, đai nâu, cổ và gấu gọn; không thêu cầu kỳ. Màu/cấu trúc này do game đề xuất | Tò mò, có hy vọng; khi thất vọng dùng chân dung riêng theo cảnh |
| `gray` | Sau E04, trước E05 | Áo xám, lớp trong sáng, đai tối; gấu áo thường nguyên vẹn. Có thể thêm bụi nhẹ khi làm việc | Kín đáo, chịu áp lực; dáng vai hơi thu và mắt vẫn chú ý |
| `red` | Sau E05 đến hết A | Đỏ trầm, cùng khuôn mặt/tóc, đường cổ áo đơn giản; thử sắc đỏ `#873B35` đã có trong bảng ART | Lúc nhận công pháp có niềm vui; lúc luyện tập tập trung, có biến thể mệt; sau E08 bình tĩnh hơn |

`cave_damage` dùng nền `civilian` ở đoạn trước hồi phục trong `E03-CAVE`. Đây là biến thể minh họa tạm thời của cảnh, không là bộ trang phục thứ tư hoặc trạng thái mặc định sau E03. Không thêm luật thương tích gameplay từ brief này.

E08 không cấp bộ đồ mới trong hồ sơ tạo hình. Vết bẩn lúc đột phá và hiệu ứng hơi thở chỉ thuộc diễn tiến cảnh; hình mặc định sau cảnh trở về bộ đỏ. Hình ảnh của cảnh giới cao, phụ kiện mới hoặc thay màu tóc cần nguồn đúng arc trước khi bổ sung.

Khi đọc lại, chọn hình theo thời điểm của cảnh đang xem. Trong map chung, trang phục NPC theo mốc nội dung của khu vực đã biên tập; không đổi toàn thế giới khi một người chơi đạt cảnh giới mới. Cách bố trí Vương Lâm trong khu chung còn thuộc đặc tả map/nhiệm vụ online.

## 4. Thể hiện tính cách bằng chân dung và sprite

Các biểu cảm sau là bộ nghiên cứu ART; chưa yêu cầu bốn ảnh xuất game cho mỗi bộ đồ.

| Biểu cảm | Chân dung đọc truyện | Sprite trên map |
| --- | --- | --- |
| Hy vọng | Mắt mở và miệng thả lỏng, hướng nhìn tới người đối thoại | Đứng thẳng tự nhiên, đầu hơi ngẩng |
| Lo lắng/thận trọng | Chân mày và môi thay nhẹ, tránh phóng đại thành tức giận | Vai thu hơn, tay giữ gần thân; không cần mắt chi tiết |
| Kiên trì/tập trung | Mắt hướng vào sách/đối tượng, nét mặt trẻ vẫn giữ | Tư thế ngồi luyện hoặc động tác tương tác rõ hình khối |
| Mệt nhưng chưa bỏ cuộc | Mí mắt hạ nhẹ, nét miệng giữ quyết tâm | Giảm chuyển động, thay tư thế theo cảnh; không đổi dáng mặc định lâu dài |

Portrait dùng nét mực để đọc được cảm xúc ở 160 px, còn thumbnail kiểm tra ở 64 px. Sprite ưu tiên hình tóc, cổ áo, khối áo/đai và tư thế ở cỡ hiển thị đã duyệt. Hai loại hình dùng cùng một hồ sơ nhận diện; không buộc sprite nhỏ mang hết nếp áo và đường nét khuôn mặt của portrait.

## 5. Những gì cần sửa ở hình v1

| Nguồn hiện có | Giữ để tham chiếu | Việc cần sửa trước sản xuất |
| --- | --- | --- |
| [Bảng nhập môn v1](design/characters/wang-lin-initiation-v1.png) | Nghiên cứu một gương mặt qua ba bộ đồ, phong cách chân dung mực | Đối chiếu tuổi thể hiện và mức sờn áo theo hồ sơ này; không mặc định mọi chi tiết ảnh sinh ra là đã duyệt |
| [Pixel áo xám v1](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v1.png) | Hướng pixel, khối tóc/đai và nhận diện toàn thân | Làm mềm nét mặt thiếu niên; thay gấu xám nhiều mảng rách bằng gấu thường; giản lược nếp áo khi chọn lưới native |
| Ghép sân v1 (bộ cũ đã xóa) | Nền stylized, camera và so sánh cỡ hiển thị | Đặt mẫu đã chỉnh lên cùng cảnh để duyệt; cỡ 96 px mặc định trong trang xem chưa là quyết định sản xuất |

Giữ nguyên ảnh và prompt v1 để truy được nguồn. Hình mới đặt tên phiên bản kế tiếp; cập nhật liên kết tham chiếu khi đã xem và duyệt. Hồ sơ này không đổi trạng thái của ảnh cũ thành asset hoàn thiện.

### 5.1. Bộ nghiên cứu v2 đã thực hiện

| Hình | Nội dung quan sát | Prompt chính xác |
| --- | --- | --- |
| [Tạo hình v2](design/characters/wang-lin-initiation-v2.png) | Ba bộ đồ thường có gấu gọn; góc trước/ba phần tư/bên và tóc phía sau; một biến thể cảnh hang ở góc dưới phải | [Prompt](design/characters/wang-lin-initiation-v2.prompt.txt) |
| [Biểu cảm v2](design/characters/wang-lin-expressions-v2.png) | Bốn chân dung áo xám theo thứ tự trên trái: hy vọng; trên phải: thận trọng; dưới trái: tập trung; dưới phải: mệt | [Prompt](design/characters/wang-lin-expressions-v2.prompt.txt) |
| [Pixel đứng v2](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.png) | Một tư thế áo xám, gấu áo được chỉnh; PNG có alpha trong suốt, giữ camera của mẫu v1 | [Prompt](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.prompt.txt) |

Tạo bằng **imagegen tích hợp**. [Manifest](design/characters/wang-lin-v2-study.json) ghi input, vai trò tham chiếu, kích thước nguồn và trạng thái duyệt. Hai bảng dùng nguồn giấy/mực, mẫu trên map dùng pixel; đây là hai cách trình bày cùng một nhân vật. Xem tại [thư viện nhân vật](design/characters/index.html).

Đã xem bố cục, số hình, trang phục và kiểm tra alpha của PNG pixel; nhận diện đã được người phát triển duyệt. PNG pixel nguồn 1.254 × 1.254 giữ làm nguồn. Bộ đứng/đi được xuất riêng tại [gói animation](design/characters/wang-lin-gray-walk-v1/index.html); chuẩn native ở [spec](WANG-LIN-SPRITE-SPEC.md). [Chân dung UI áo xám cơ bản](design/characters/core-ui-v1/index.html#wang-lin) đã có PNG/WebP 512/160/64, hình mới chờ đánh giá; các biểu cảm/trang phục khác cần gói riêng; nghiên cứu sân v1 giữ nguyên nguồn trước đó.

## 6. Điểm cần duyệt và bước kế tiếp

1. **Nhận diện v2:** đã được người phát triển duyệt ngày 07/10/2026; dùng làm nguồn cho bộ native.
2. **Bộ đứng/đi:** đã xuất 4 hướng, 28 frame áo xám; xem nhịp bước, đổi chân, tóc/áo và vòng lặp trên trang animation.
3. **Portrait:** đánh giá chân dung áo xám cơ bản đã xuất ở 64/160 px; biểu cảm và đồ thường/đỏ thêm theo cảnh thật sự cần.
4. **Bộ tiếp theo:** sau đánh giá motion, áp dụng chuẩn cho đệ tử và biến thể trang phục; động tác tương tác/tu luyện có spec riêng.

Một bảng tạo hình đạt yêu cầu khi thể hiện rõ tuổi, giữ cùng gương mặt qua ba bộ đồ, dùng đúng trạng thái cảnh và phân biệt được Vương Lâm với đệ tử người chơi. Chân dung phải đọc được cảm xúc; sprite phải đọc được dáng trên nền sáng/tối mà không cần zoom. Mỗi chi tiết viện dẫn nguyên tác có chương hỗ trợ, mỗi chi tiết thiết kế riêng được ghi là đề xuất.

## 7. Mở rộng hồ sơ sang các nhân vật khác

Số lượng vẫn theo [CHARACTERS.md](CHARACTERS.md): A đề xuất 7 NPC; sau B tổng 10; danh mục arc sau hiện có 11. Hai mẫu đệ tử là hình người chơi. Hướng tạo hình này không thêm nhân vật truyện mới.

Ưu tiên tiếp theo sau Vương Lâm: đối chiếu hai mẫu đệ tử để giữ khác nhận diện; làm hồ sơ cha mẹ → Trương Hổ → Tôn Đại Trụ. Tư Đồ Nam và Lý Mộ Uyển có hồ sơ riêng ở đúng giai đoạn xuất hiện trước khi vẽ.

Mẫu hồ sơ dùng lại gồm: ID/vai trò, tuổi ở đoạn truyện, chương nguồn, chi tiết ngoại hình đã xác minh, phần ART đề xuất, trang phục/đạo cụ, thần thái theo cảnh, điều kiện tiết lộ, hình tham chiếu và trạng thái duyệt. Nhân vật có ít mô tả ngoại hình vẫn có thể được thiết kế riêng, với nhãn rõ về căn cứ.
