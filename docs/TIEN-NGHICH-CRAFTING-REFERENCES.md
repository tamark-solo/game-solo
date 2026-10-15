# Tiên Nghịch và reference bổ sung — thiết kế vật phẩm, luyện chế, năng lực

> **Phân loại tài liệu ·15/10/2026.** Nghiên cứu này giữ nguồn khảo sát ngày 11/10. Áp dụng ý tưởng vào nội dung mới qua [kế hoạch asset GDD 0.35](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md) và [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md); các link VP/IT bên dưới chỉ truy nguồn bản lịch sử.

**Nghiên cứu đợt 2 · bản 0.1 · 10/10/2026.** Theo yêu cầu owner đào thêm reference/đọc cốt truyện để lên kế hoạch rõ. Đọc cùng [nghiên cứu đợt 1](XIANXIA-GAME-RESEARCH.md). Đợt này bổ sung **3 game**, khảo sát 12 trang chương Tiên Nghịch; không tuyên bố đã đọc hết truyện hoặc chơi trực tiếp các game. Không đổi canon, roster, runtime, ART hay save.

Đầu ra thiết kế lịch sử từ nghiên cứu được giữ ở [vật phẩm/luyện chế](archive/asset-plans-before-gdd-035-2026-10-15/ITEM-CRAFTING-DESIGN.md) và [lộ trình sản xuất](archive/asset-plans-before-gdd-035-2026-10-15/ITEM-PRODUCTION-PLAN.md). Những món đặt tên mới đều là sáng tạo đề xuất, không gắn tên truyện vào món tự chế để tạo cảm giác có nguồn.

## 1. Cách dùng bằng chứng

- Trang developer/publisher xác nhận **họ mô tả cơ chế gì**, không chứng minh cơ chế vui, cân bằng, đủ tính năng hoặc phù hợp MMO của mình.
- Chương được fetch qua Wuxiaworld, sau đó đọc các đoạn liên quan. Có trang trả văn bản dài và có trang chỉ một đoạn đầu. Số ký tự ghi để phân biệt độ bao phủ, không là thước đo chất lượng.
- Không suy nội dung từ tiêu đề. Chương 79/100 có tên về luyện kiếm nhưng trích đoạn không chứa phương pháp, nên **không dùng làm bằng chứng cho công thức luyện khí**.
- Bản dịch dùng thuật ngữ riêng; không chốt thuật ngữ/cấp bậc pháp bảo Việt từ một cụm tiếng Anh. Số lần dùng, giá trao đổi, thời gian của một tình tiết không thành bảng kinh tế game.
- Mọi phép suy áp dụng được đánh dấu là đề xuất. Không sao chép thoại dài, icon, recipe, skill hoặc tình tiết độc hữu sang catalog sản xuất.

## 2. Sổ đọc truyện có giới hạn

Các ID TN dưới đây riêng cho đợt này, không thay N01–N05 của nghiên cứu trước.

| ID / chương / phạm vi trả về | Điều đoạn đã đọc cho thấy | Hướng thiết kế suy ra | Không được suy |
| --- | --- | --- | --- |
| TN17 — [17: Cultivation](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17), ~6.901 ký tự | Sách phương pháp đầu gồm ba tầng, nêu 15 tầng; đạt tầng 3 mới tiếp cận phần sau; tu luyện ở vườn dược bị phản đối vì tranh linh khí với cây | Tri thức là quyền tiếp cận; điểm tu luyện/thu thập phải có quyền sử dụng và ngữ cảnh | Không được farm cây ở mọi dược viên; không tự cấp bản sách canon chung cho cả ba |
| TN23 — [23: Tenth Cloud](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-23), ~6.427 ký tự | Vương Lâm thử, quan sát rồi đo thời gian bằng đèn để tìm tính chất của châu | Nhận biết pháp bảo nên có kiểm chứng, không chỉ popup “+stat” | Không cho mọi tài khoản x10 tu luyện; đây là cơ duyên riêng, không nền idle chung |
| TN24 — [24: Cultivation](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-24), ~8.030 ký tự | Ông thử mang đồ khác nhau vào không gian, nhận thấy đồ chứa linh khí và vật chứa mới cho kết quả khác nhau | Vật liệu/vật chứa có thể quyết định cách vận dụng; trình bày quy tắc rõ sau thử | Không copy việc lách điều kiện châu thành exploit túi/duplication hoặc mô phỏng vật lý mọi đồ |
| TN27 — [27: Visit](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-27), ~7.368 ký tự | Phù có vẻ giống loại thường nhưng vật liệu/mực/linh khí khác; chưa biết công dụng nên thận trọng | Sở hữu, nhận biết và dùng an toàn là ba trạng thái; ngoại hình chưa đủ nói tác dụng | Không bắt người chơi dùng mù rồi chết/mất đồ vì thông tin UI che giấu |
| TN31 — [31: Snow Water](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-31), ~6.919 ký tự | Tác dụng nguồn nước cũ giảm tương đối khi tiến triển; thử nước tuyết cho kết quả khác, tìm nguồn thay thế | Nguồn nguyên liệu mở theo vùng/nhu cầu; tài nguyên đầu có thể chuyển vai trò về sau | Không tự mở hệ mùa/thời tiết/rot item ngoài đời hoặc copy chất lỏng châu thành thuốc chung |
| TN32 — [32: Exchange](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-32), ~7.077 ký tự | Có trao đổi đồ, ngọc mang phép có số lượt, phương pháp che tu vi bị người khác đánh giá thấp nhưng hữu ích cho Vương Lâm | Giá trị theo tình huống/build; đồ hữu hạn khác pháp khí lâu dài; tri thức có nguồn | Không lấy giá/phù/đan trong đoạn làm tiền tệ hoặc auction ngay ở HN05; không tuyên bố mọi pháp bảo đều có charges |
| TN49 — [49: Exchange (3)](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-49), ~6.695 ký tự | Dụng cụ tưởng có lợi phản tác dụng trong tỷ thí do người đối diện biết cách thao túng | Năng lực cần counterplay, nguồn và cách dùng phải hiểu được | Không thêm bom tương tự, thua ẩn hoặc cơ chế người bán điều khiển đồ của người mua |
| TN79 — [79: Refining The Flying Sword](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-79), chỉ ~691 ký tự | Đầu đoạn nói về thành thị/phí, chưa có phương pháp luyện kiếm | Chỉ giữ làm địa chỉ đọc tiếp | **Không dùng tiêu đề làm bằng chứng cho luyện khí** |
| TN80 — [80: Blood Refining Technique](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-80), chỉ ~734 ký tự | Kiếm bị vây bằng linh lực/ký hiệu và vẫn chống cự | Có ví dụ đồ chưa dễ khống chế; riêng đoạn chưa đủ mô hình luyện hóa | Không rút ra recipe, tỷ lệ thất bại, hiến máu hoặc quyền sở hữu của mọi món |
| TN100 — [100: Refining the Sword Sheath](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-100), chỉ ~1.017 ký tự | Đoạn đầu là hang/quan tài/âm khí, không có quy trình vỏ kiếm | Chỉ giữ làm địa chỉ đọc tiếp | **Không xác nhận cơ chế kiếm–vỏ kiếm từ tiêu đề** |
| TN221 — [221: Soaring Cultivation](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-221), chỉ ~1.046 ký tự | Lý Mộ Uyển dùng phương thuốc trong ngọc và bối cảnh tìm được để nhận định nguồn lò | Công thức/nguồn gốc có thể mở điều tra và cách xử lý đồ | Không khẳng định đọc được toàn lịch sử lò hoặc recipe đầy đủ |
| TN223 — [223: Opening the Pill Seal](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-223), chỉ ~2.043 ký tự | Lò mô phỏng có giới hạn không rời địa vực; mở niêm cần linh lực/thời điểm theo lời nhân vật | Dụng cụ tại cơ sở và đồ mang theo khác vai; hoạt động cần điều kiện có ngữ cảnh | Không bắt người chơi online đúng giờ thật, copy 9 lò, hoặc coi mọi pháp bảo đều bị khóa địa vực |

Liên kết lại nguồn cũ: chương 33 về trao đổi phương pháp, 47 về Tư Đồ Nam, 143/224 về Lý Mộ Uyển và 271 về suy ngẫm/khắc tượng trong [đợt 1](XIANXIA-GAME-RESEARCH.md). Không đọc lại toàn chương đó trong đợt 2 và không nâng phạm vi bằng chứng cũ.

### Các đoạn định vị ngắn

- TN24: “any normal item ... could be brought in” — chỉ tình huống vật chứa được thử trong chương, không luật inventory của dự án.
- TN27: “the material and the ink ... vastly superior” — căn cứ cho phân biệt vật liệu, không giá trị stat.
- TN32: “useless for others, but it was very useful to him” — giá trị theo mục đích.
- TN221: “The recipes inside of this jade ...” — công thức giúp nhận nguồn gốc.
- TN223: “they couldn’t leave ... mountain range” — điều kiện của đúng bộ lò đó.

Không trích số giá/tốc độ từ truyện thành recipe. Các số thiết kế ở tài liệu sau là số thử tự đặt, không số canon.

## 3. Ba game mới bổ sung cho năm game đã nghiên cứu

| ID / game / nguồn chính thức | Điều nguồn trực tiếp mô tả | Học có chọn lọc | Không nhập vào dự án |
| --- | --- | --- | --- |
| G08 — [Immortal Life / 一方灵田](https://store.steampowered.com/app/1201230/Immortal_Life/?l=english) | Khôi phục môn phái; trồng trọt/nấu/chế tác/đan, học và thử thách để tiến triển; đi các vùng tìm đồ chế tác; giúp người khác mở item/quest/skill | Mỗi nguyên liệu có bối cảnh và đích dùng; hoạt động đời sống có vai trò trong tiến trình | Không đổi thành farming sim, lịch mùa bắt buộc, xây nhà/ruộng trước trận đầu |
| G09 — [Yi Xian / 弈仙牌](https://store.steampowered.com/app/1948800/Yi_Xian_The_Cultivation_Card_Game/?l=english) | Nhân vật + nghề phụ tạo bộ bài khác; lựa chọn khi đột phá; đồ/cơ duyên hiếm có thể ngang sức mạnh nhưng mở cách phối mới | Lựa chọn ngang có đánh đổi; cùng nhân vật có nhiều cách vận dụng, rarity không đồng nghĩa mạnh tuyệt đối | Đây là deck-building theo trận, không RPG thế giới bền; không chuyển R01 thành thẻ hoặc reset build mọi lần đăng nhập |
| G10 — [The Lost Village / 山门与幻境](https://store.steampowered.com/app/1963040/?l=english) | Thu thập, cơ sở, đan, linh điền, pháp bảo và nhiệm vụ ngoài môn phái trong game quản lý + roguelike | Chuỗi cung ứng nối công việc với người làm/cơ sở; cơ sở có mục đích khác đồ mang theo | Không điều khiển nhiều đệ tử/AI sản xuất thay nhân vật đang chơi, không xây tông môn tự động trước inventory/nguồn–chi |

Đoạn định vị: G08 “find the crafting items that you need from each territory”; G09 “their strength may be similar ... new building ideas”; G10 “collecting resources ... refining pills ... refining magical treasures”. Mô tả là nguồn ý tưởng, chưa trực tiếp kiểm UX/độ vui/giá thành của từng game.

**Reference chuyên sâu chưa đủ nguồn:** tìm thông báo luyện đan Mịch Trường Sinh để xem cách chọn dược liệu theo vị trí. Hai URL Steam news trả lỗi `Could not extract readable content from HTML structure` khi fetch. Kết quả tìm kiếm có nhắc main/secondary/catalyst nhưng chưa dùng chúng như luật đã xác minh trong báo cáo này. Không đổi cấu hình mạng/đăng nhập hoặc dựa forum để lấp chỗ thiếu. Nguồn đợt 1 vẫn đủ xác nhận game mô tả luyện đan/chế tác có phối hợp, không đủ để sao chép công thức cụ thể.

## 4. Những ý tưởng rút ra, mức ưu tiên

| Nguyên tắc thiết kế | Căn cứ | Cách thử nhỏ trong Vân Hải | Chặng |
| --- | --- | --- | --- |
| Biết đồ trước khi dùng | TN27/TN221 | HN08 raw→nhận biết→refined cùng instance, UI giải thích hiệu lực/điều kiện | RM3 |
| Vật liệu có vai trò chứ không chỉ màu | TN24/TN31, S03 đợt 1 | 5 vật liệu, tag chức năng cố định; recipe đọc được, không chemistry toàn world | Sau HN12, gói VP2 |
| Dùng tri thức để thay cách làm | TN23/TN32, G09 | Định Lưu Bàn giúp đọc điểm khảo sát; vẫn có đường quan sát thủ công | VP3 |
| Chuẩn bị để đi được đường khác | TN24, G08 | Hộp giữ khí/niêm mực mở phương án mang mẫu; không phải túi +slot trả phí | VP2 |
| Công cụ tại chỗ khác đồ mang theo | TN223, G10 | Bàn chuẩn bị dùng recipe và quyền cơ sở, không item lò lớn nhét vào túi | VP1–VP2 |
| Có nhiều lời giải cùng sức mạnh | TN32, G09 | Đường an toàn thủ công và đường mang mẫu đã chuẩn bị, reward tương đương | VP2–VP3 |
| Vật liệu cũ không tự mất giá/xóa | TN31, G08 | Nêu vòng đời từng món và cách ngừng nguồn khi chưa có nơi dùng tiếp | Mỗi gói |

Cần tránh: trói tuổi thọ/cơ duyên vào giờ online; lấy thần khí nguyên tác làm quà mở đầu; gắn mọi icon thành item; RNG hỏng vật bắt buộc; catalog hàng trăm món trước một recipe dùng được; dùng “nghịch thiên” để bỏ counterplay/cảnh giới.

## 5. Phạm vi truyện dài hạn cần đọc trước thiết kế cao hơn

| Câu hỏi | Nguồn đã có / thiếu | Việc biên tập tiếp |
| --- | --- | --- |
| Linh thạch, thị trường và giá | TN32/TN79 chỉ các tình huống cụ thể | Cần nhiều nguồn/arc và ledger kinh tế riêng, không quy đổi tỷ giá từ một phiên chợ |
| Luyện khí/luyện hóa và dấu sở hữu | TN80 chỉ đoạn đầu; TN79/100 chưa đủ | Đọc hợp pháp phần đầy đủ trước dùng tên/pháp quyết canon; hiện thiết kế phương pháp game độc lập |
| Đan/phương thuốc và nghề Lý Mộ Uyển | TN221/TN223 + N03/N04 là các đoạn hẹp | Chọn arc/đơn vị nội dung cần làm rồi đối chiếu, không dựng cây đan toàn truyện từ vài chương |
| Cực Cảnh/Cổ Thần/ý cảnh | Chưa bổ sung nguồn đủ trong đợt này | Không đưa vào cây chung/đồ rơi; chỉ lập brief khi tới RM6/arc phù hợp |
| Bản mệnh/khí linh | Game reference có mô tả, truyện chưa rà hệ đầy đủ | Giữ backlog, không gọi cơ chế từ game khác là luật Tiên Nghịch |

Đích nghiên cứu không phải chép hết truyện thành catalog. Mỗi hệ làm tới đâu phải có nguồn đủ cho phần được gọi là canon; sáng tạo thì ghi rõ và giữ bản sắc bộ ba. Quyền dùng tác phẩm/nhân vật cần rà trước phát hành, không suy đã có giấy phép từ link đọc truyện.

## 6. Truy vết nghiên cứu

Tra ngày 10/10/2026. Search: `mv2km6idqlyba7`, `mv2knkvxgzq6nc`, `mv2kuav9g4pkcs`. Fetch trực tiếp: `mv2kmmwhczz8mz` (17/23/79/80/100/221/223), `mv2kr763k9mw4k` (24/27/31/32/49), `mv2knxfdij7pog` (G08/G09 và lỗi Steam news), `mv2kumn6m2rszr` (G10 và lỗi news). ID tạm chỉ hỗ trợ tra lại; URL và kết luận giới hạn trong bảng là hồ sơ bền.

Chưa xem video theo timestamp, chưa chơi game reference, chưa benchmark hoặc xác nhận ownerApproved cho nội dung/ART mới. Đợt này không thêm nguồn không kiểm chỉ để đủ số lượng reference.
