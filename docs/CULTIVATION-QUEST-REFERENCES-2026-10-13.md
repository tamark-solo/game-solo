# Reference cho thiết kế tu tiên và nhiệm vụ — đợt 13/10/2026

**Phục vụ GDD 0.33.** Đã đọc các nguồn web trong bảng dưới ngày **13/10/2026** và đối chiếu bản code đang chạy. Đây là nghiên cứu tài liệu, chưa trực tiếp chơi/benchmark các game tham khảo hoặc khảo sát người chơi của chúng. Mô tả nhà phát triển xác nhận tính năng được công bố; lợi ích UX và cách áp dụng là suy luận cần thử.

Bổ sung cho [nghiên cứu 10/10](XIANXIA-GAME-RESEARCH.md) và [reference luyện chế](TIEN-NGHICH-CRAFTING-REFERENCES.md). Không coi link cũ là đã đọc lại; chỉ bảng nguồn đợt này xác nhận lần truy cập mới.

## 1. Bốn reference chính và cơ chế cần học

| ID / nguồn đọc | Cơ chế nguồn thực sự mô tả | Giả thuyết trải nghiệm | Chuyển thành việc cụ thể của Vân Hải | Điều không phù hợp để bê nguyên |
| --- | --- | --- | --- | --- |
| R01 — [Tale of Immortal / 鬼谷八荒](https://store.steampowered.com/app/1468810/), 鬼谷工作室 / Lightning Games. Đọc [Steam API](https://store.steampowered.com/api/appdetails?appids=1468810&cc=us&l=english), trường detailed_description | NPC có bạn bè/gia đình/quá trình riêng; kỳ ngộ, nhiệm vụ phụ, can thiệp quan hệ và môn phái | Người chơi nhớ một người và một hệ quả; chuyến đi có chuyện ngoài checklist | HN09 chọn ưu tiên → HN11 thấy người giữ tuyến phản hồi bằng một việc/cảnh khác. Một nhân duyên theo hồ sơ trước khi mở rộng | Simulation mọi NPC tự trị, một người giết NPC bắt buộc toàn realm hoặc chiếm cả tông môn ngay |
| R02 — [Amazing Cultivation Simulator](https://store.steampowered.com/app/955900/), GSQ Games / Gamirror Games. Đọc [Steam API](https://store.steampowered.com/api/appdetails?appids=955900&l=english) | Quản lý phái, nghiên cứu, tài nguyên/chế tác/xuất hành; thành phẩm kế thừa tính chất vật liệu, ngũ hành/phong thủy | Nguyên liệu đáng tìm khi đặc tính giúp giải tình huống; chuẩn bị đáng làm khi thấy kết quả | EX đưa trở ngại trước công thức; hộp niêm mở cách đi khác; ngọc HN08 được dùng ngay. Dài hạn thử 2 lựa chọn nguyên liệu có công dụng khác | Quản lý nhiều đệ tử/nhu cầu, xây phòng phong thủy và tự động sản xuất thay nhân vật |
| R03 — [The Matchless Kungfu](https://store.steampowered.com/app/1696440/), HuanMos Game / bilibili. Đọc [Steam API](https://store.steampowered.com/api/appdetails?appids=1696440&l=english) | Skill deck/chiêu chiến đấu, giải quyết đối thủ bằng khẩu chiến, kinh mạch vận hành nội công khác nhau; khối đất có tài nguyên/môi trường | Người chơi chủ động khi phương pháp giải thực sự khác, build có vai trò ngoài số lớn hơn | HN04 đi vòng hoặc dùng Phong đúng lúc; EX03 chuẩn bị hoặc thao tác thủ công; về sau một nhiệm vụ có đường đối đầu và đường chuẩn bị | Đổi combat R01 thành thẻ, thêm hệ khẩu chiến/kinh mạch chỉ để có nhiều menu, cho người chơi dựng lại map owner |
| R04 — [Guild Wars 2: Dynamic Events](https://www.guildwars2.com/en/the-game/dynamic-events/), website chính thức ArenaNet, HTTP 200 | Tham gia giúp nhau không cần lập party; kinh nghiệm/loot riêng; sự kiện đáp lại số người và đổi tình trạng khu vực theo thắng/thua; có chuỗi nối tiếp | Người chơi theo việc đang diễn ra, bớt tới NPC xin bước kế; thế giới có hồi đáp và hợp tác dễ hơn | Trong việc đã nhận tự nối mục tiêu/ghi thưởng, một kết quả HN đổi cảnh sau. Gói MMO sau thử chuỗi bảo vệ tuyến → sửa hoặc mở chuyến mới, credit riêng | Hàng nghìn sự kiện, scale số đông, lịch meta cố định; tự động hoàn thành lựa chọn truyện cá nhân vì người khác thắng |

Đoạn định vị ngắn: R01 “random events and side tasks”; R02 “inherit the traits of the original materials”; R03 “without engaging in physical fights”; R04 “Experience and rewards are distributed individually”. Không chép số lượng nội dung, bảng chỉ số, thoại hay ART của các game này.

[GW2 Wiki — Dynamic event](https://wiki.guildwars2.com/wiki/Dynamic_event) cũng đọc được; đây là wiki cộng đồng trên tên miền chính thức, **không đồng nhất với bài của developer**. Dùng để đối chiếu chuỗi/participation; không lấy tỷ lệ thưởng, quy tắc scale từng bản hoặc kết luận mọi sự kiện không thất bại từ đó làm luật dự án. Bài ArenaNet đủ cho luận cứ chính ở R04.

Wildermyth và Wandering Sword được cân nhắc nhưng truy cập Steam lỗi kết nối/TLS trong đợt này; không dùng chúng làm bằng chứng mới và không suy cơ chế từ tên game.

## 2. Tiên Nghịch: nguồn, ý nghĩa và ranh giới chuyển thể

Nguồn truyện là bản dịch Renegade Immortal trên Wuxiaworld. Đã đọc phần văn bản công khai trả về, không vượt phần giới hạn. Chương 143/271 ghi rõ **Teaser**; không coi là đã đọc toàn chương/toàn arc.

| ID / nguồn | Mức đọc và bằng chứng | Điều chuyển hóa vào game | Giới hạn cần giữ |
| --- | --- | --- | --- |
| T17 — [Chương 17: Cultivation](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17) | Đọc nội dung chương trả về đầy đủ. Sách đầu chỉ ba tầng; có 15 tầng Ngưng Khí; địa điểm giàu linh khí và quyền tiếp cận ảnh hưởng tu luyện | Chỉ dạy nền 1–3 trước, công pháp/nơi tu luyện có ngữ cảnh; quyền tiếp cận tri thức có thể thành động lực | Không suy tất cả avatar cùng lịch sử Vương Lâm; không biến thiếu thiên phú thành tài khoản chịu thiệt vĩnh viễn |
| T20 — [Chương 20: Nine Clouds](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-20) | Đọc nội dung chương trả về đầy đủ. Các bậc đầu, vị thế theo cảnh giới, linh thạch/đan và yêu cầu tích lũy/nhận thức cho Trúc Cơ | Cảnh giới có quyền/năng lực; chuẩn bị và phương pháp khác với chỉ đủ một thanh | Không đổi tháng truyện thành lịch hẹn đời thực; “luck” trong lời truyện không buộc làm xác suất đột phá |
| T23 — [Chương 23: Tenth Cloud](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-23) | Đọc nội dung chương trả về đầy đủ. Vương Lâm tự đặt giả thuyết, thử điều kiện và dùng đèn đo khác biệt thời gian của không gian châu | Nhiệm vụ để người chơi quan sát → thử → thấy khác biệt → vận dụng; cơ duyên cần khám phá công dụng | Châu riêng Vương Lâm; không chép hệ số thời gian thành lợi thế MMO/idle chung, không trao cho bộ ba |
| T47 — [Chương 47: Exchange (1)](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47) | Đọc nội dung chương trả về đầy đủ. Tư Đồ Nam kể mất thân thể, giới hạn trong châu và nhu cầu được giải phóng | Hồi phục khả năng dùng được khác với học lại tri thức; nhân vật có mục tiêu cá nhân rõ | Việc linh thể playable ở Hằng Nhạc là chuyển thể; không gọi đó là sự kiện canon |
| T143 — [Chương 143: Three Cold Cores](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-143) | Chỉ teaser. Lý Mộ Uyển mở trận; đoạn đầu nói tới xương rồng dùng cho trận và giá trị vật liệu | Tri thức vật liệu/đan–trận có thể mở cách giải; phát triển Lý Mộ Uyển có năng lực riêng | Chưa đủ dựng toàn cây nghề hoặc kết luận về toàn hành trình; vật liệu/recipe nhập môn là sáng tạo |
| T271 — [Chương 271: 10 Years To Soul Formation](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-271) | Chỉ teaser. Khắc tượng gợi người đã gặp/đã giết, suy nghĩ nhân quả/sinh tử | Lĩnh ngộ ở chặng cao phải liên hệ điều nhân vật đã trải, không mua bằng điểm trivia | Chưa đủ đặc tả arc Hóa Thần; không cho mọi avatar khắc tượng y hệt hoặc suy luật ý cảnh chung |

Đoạn định vị: T17 “15 stages of Qi Condensation”; T47 “resulting in me losing my body”; T271 “Where there is life, there is also death.” Các nhận định gameplay trong cột áp dụng là thiết kế của dự án.

**Nguyên tác có nguồn:** danh tính/trạng thái và các dữ kiện đúng đoạn đọc. **Chuyển thể:** ba người chơi được từ đầu, Hằng Nhạc chung, bộ R01 chung, nhịp 15 tầng của game. **Sáng tạo mới:** Dấu sai trên vân lộ, người giữ tuyến, Qua trận dẫn khí, hai nền Giữ nhịp/Dồn lực, các chương đặt tên trong thiết kế mới. Không gán tên/món mới vào nguyên tác.

## 3. Dẫn chứng từ hệ hiện hành

| Phát hiện | Nguồn repo | Hệ quả thiết kế |
| --- | --- | --- |
| Không thấy currency literal “điểm vận khí”; có cultivation, cycleStep/foundation | [sect.ts](../shared/sect.ts), [sect UI](../client/src/sect-ui.ts), [nhân vật runtime](../client/src/dao-character-runtime.ts) | Làm rõ tên và công dụng, không phát minh tiền thứ hai để giải thích tên người chơi đang thấy |
| HN04 phải gọi lesson_start riêng cho hai credit và về xác nhận | [sect progress](../server/src/sect-progress.ts), [lessons runtime](HANG-NHAC-LESSONS-RUNTIME.md) | Thay cấu trúc bài thay vì chỉ thêm auto-path |
| Tu vi 120/phút online, gate 360/1620/3600, combat riêng dừng nền | [sect progress](../server/src/sect-progress.ts), [chapter definitions](../shared/chapter.ts), [runtime chương](HANG-NHAC-CHAPTER-RUNTIME.md) | Chơi chính phải đủ nguồn, không đặt nhiệm vụ đi đánh vào một đồng hồ dừng khi đánh |
| Mốc hiện chủ yếu mở nội dung, HP/MP vẫn 100, R01 từ đầu | [chapter progress](../server/src/chapter-progress.ts), [room](../server/src/HangNhacRoom.ts), [skill definitions](../shared/skills/definitions.ts) | GDD ghi rõ tác dụng mới là đề xuất; P2 kiểm nguồn power trước khi hứa bonus |
| EX hiện sau HN12, nguồn hữu hạn/sáu recipe | [runtime chương](HANG-NHAC-CHAPTER-RUNTIME.md) | Mở sớm để chuẩn bị có nơi dùng; giữ đường chính không phụ thuộc EX |
| Validation ràng buộc tầng/cổng và save/receipt bền | [sect.ts](../shared/sect.ts), [chapter.ts](../shared/chapter.ts), [profiles.ts](../shared/profiles.ts) | Không hạ cap hay đổi ý nghĩa receipt trực tiếp; mapping từng trạng thái và kiểm idempotence |

## 4. Reference được biến thành giả thuyết kiểm được

| Giả thuyết | Bản nhỏ để thử | Quan sát cần ghi | Khi không đạt |
| --- | --- | --- | --- |
| Nối sự kiện giảm chán hơn chỉ giảm nút | HN04 một lượt ba đoạn; tự ghi kết quả | Số thao tác quản lý, thời gian đứng chờ, người tự biết việc tiếp | Cắt đoạn lặp và dấu mơ hồ; không thêm autoplay |
| Chuẩn bị tạo quyền chủ động | EX03 hai tuyến, cùng kết quả tiến trình | Người nói được vì sao chọn hộp hoặc đi vòng; có ai bị kẹt nguyên liệu không | Giảm menu/recipe, tăng độ rõ khác biệt; giữ đường thủ công |
| Quan hệ có ký ức giúp người chơi quan tâm | Một lựa chọn HN09, một cảnh/việc phản hồi HN11 | Người nhớ ai bị ảnh hưởng và nhận ra thay đổi | Viết lại động cơ/callback; không thêm thanh thiện cảm |
| Lên tầng có nghĩa khi dùng lại sức mạnh | Một nguồn power và một đối thủ đối chiếu | Người thấy tác dụng, lựa chọn build có đánh đổi, MP có thực sự giới hạn không | Cân encounter/nguồn stat, bỏ lựa chọn giả; không tăng số menu |
| Chất Tiên Nghịch đến từ tự tìm cách vượt giới hạn | Một chuyến quan sát/thử/giữ mục tiêu khi yếu, quay lại sau mạnh hơn | Người mô tả được trở ngại/cách tự giải, không chỉ “đánh đủ quái” | Sửa tình huống và phần thưởng; không kéo dài chờ hoặc cấp thần khí |

Chưa có số đo chứng minh những giả thuyết này. Nguồn chỉ giúp chọn phương án có căn cứ; quyết định triển khai dựa bản nhỏ có thể chơi và phản hồi owner/người thử.
