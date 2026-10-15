# Màn chơi chính — tư vấn HUD/UX tu tiên

**Owner làm rõ ưu tiên sau tư vấn:** thiết kế **toàn bộ vùng HUD và hệ icon trước**, gồm ba lô/bản đồ/các hệ tu tiên MMORPG. [Bản thiết kế toàn hệ 03](FULL-HUD-SYSTEM-DESIGN.md) đã được phát triển trên trang đối chiếu. Trình tự tích hợp shell ở dưới giữ làm bước sau thiết kế, không là việc làm trước bộ HUD.

**11/10/2026 · Đề xuất sau nghiên cứu, chưa triển khai/duyệt bố cục.** Owner tạm chấp nhận study nhân vật/hành trang và gửi ảnh chế độ chỉ HUD của `/ui-material-review.html`, yêu cầu tư vấn cách làm màn hình đủ thông tin và đúng cảm giác game tu tiên. Đây là bước thiết kế **HUD tổng thể** nối các cửa sổ, thế giới và hành trình; không thay game/backend trong đợt tư vấn.

Đọc cùng [GDD 0.35](GDD.md), [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md), [Core](ARCHITECTURE.md), [hai theme](DAO-UI-SYSTEM.md), [nhân vật/hành trang 02](CHARACTER-INVENTORY-UI-DESIGN.md), [MMORPG xuyên chặng](MMORPG-PROGRESSION-PLAN.md) và [game shell hiện hành](HANG-NHAC-GAME-SHELL.md).

## Đánh giá ảnh và phần còn thiếu

Ảnh thể hiện concept Hằng Nhạc, tên khu và thanh kỹ năng có hai cầu tài nguyên. Không thể nhìn ngay danh tính/tiến trình, mục tiêu đang làm, hướng tới NPC, công pháp/nền đang vận dụng hoặc lối mở chức năng. Cảm giác hiện tại nghiêng về một cảnh nền có thanh thao tác.

Đây là **trang đối chiếu vật liệu**, không phải bằng chứng game thật đã mất toàn bộ HUD. Runtime `/hang-nhac.html` đã có danh tính, tracker, hướng dẫn NPC, menu và nhật ký; study mới chưa trình bày chúng thành một bố cục đồng nhất. Cần đối chiếu các nguồn dữ liệu hiện có rồi thiết kế một shell hoàn chỉnh trên kit mới.

Màn chơi nên trả lời nhanh bốn câu: **Tôi là ai/đang tới đâu trong tu đạo? → Tôi đang ở đâu? → Tôi đang làm gì tiếp? → Tôi có thể hành động gì lúc này?** Khi giao chiến, thêm **mục tiêu nào/đòn nào cần phản ứng?** Tăng lượng thông tin theo những câu hỏi này, không dùng số chiến lực, thanh EXP, tiền tệ hoặc menu chưa có luật để lấp góc màn.

## Reference chính thức đã tìm và đọc

Truy cập ngày 11/10/2026. Các nguồn dưới đây phục vụ tổ chức HUD, không xác nhận một đồ họa/luật hay cấu hình phù hợp hoàn toàn với Vân Hải. Hướng dẫn Tru Tiên là tài liệu **2016**, chỉ học cấu trúc và chức năng, không gọi là UI mới nhất.

| Reference | Bằng chứng từ nguồn | Điều áp dụng đề xuất |
| --- | --- | --- |
| [Tru Tiên mobile — 游戏界面, Perfect World](https://zx.wanmei.com/news/gamenews/20160722/184617.shtml) | Thông tin nhân vật/buff, vùng nhiệm vụ–đội có thể thu gọn, bản đồ, tiến trình, tin nhắn, hành trang, chiến đấu và ngự pháp bảo | Một màn có các vùng chức năng rõ; nhiệm vụ gọn/đọc sâu; biểu đạt đạo hữu và quá trình tu luyện. Không suy auto-path, EXP đầy tự tăng cảnh giới, VIP hay PK/treo máy là luật của mình |
| [Blade & Soul Revolution — Main Screen, Netmarble](https://guide.netmarble.com/bnsmasia/215) | Thông tin nhân vật, hiệu ứng/thời hạn, mục tiêu đã chọn, bản đồ, thông tin khu vực, inventory/quick menu và thao tác giao chiến/di chuyển | Target và trạng thái hành động cần nhìn ngay; mở phần sâu qua menu; mobile phân khu chạm. Không lấy scheduler/nhiều sự kiện, camera zoom hay channel làm chức năng đã có |
| [FFXIV — Navigating the Game Screen, Square Enix](https://na.finalfantasyxiv.com/game_manual/view/) | Tách hướng tuyến chính, Duty List, minimap, log, target, trạng thái và hotbar. Duty title mở journal, objective mở bản đồ; có lựa chọn ẩn party khi solo | Tách tracker khỏi sổ dài; phân biệt thông tin thường trực, theo tình huống và khi mở chi tiết. Ưu tiên vùng đọc trận và giảm thành phần không có tác dụng lúc đó |

Đã thử mở ảnh sơ đồ của Tru Tiên; endpoint ảnh bị timeout qua công cụ đọc web. Phần nhận xét của nguồn đó dựa trên nội dung hướng dẫn, không khẳng định đã kiểm pixel ảnh. Ảnh hướng dẫn BNS có đường mở riêng, nội dung chức năng vẫn đối chiếu từ bài chính. Không tải lại hoặc đưa bitmap/icon của reference vào asset dự án.

## Bố cục desktop đề xuất

| Vùng | Thông tin chính | Hành động / thứ bậc |
| --- | --- | --- |
| **Trái trên · Danh tính/đạo lộ** | Tên, môn phái/trạng thái nhập môn, mốc xác nhận; dòng tu vi + nền đang dùng | Mở Linh Đài. Khi cảnh giới có runtime, đọc nhãn từ domain progression. Không đổi M01 thành Ngưng Khí hoặc gọi tu vi là MP |
| **Phải trên · Định hướng** | Tên map/khu, bản đồ nhỏ khi có dữ liệu tương ứng, server/kết nối | Mở bản đồ lớn, chọn điểm mục tiêu. Không vẽ minimap giả từ concept rồi coi là navigation thật; không tự invent channel/world PK |
| **Phải giữa · Tracker** | Một mục tiêu đang theo dõi, tối đa hai–ba dòng còn thiếu, bước tới NPC/hoạt động | Chạm tên mở sổ; hành động dẫn điểm đích tách khỏi tự di chuyển. Thu gọn được; không đặt toàn bộ mô tả/phần thưởng trên map |
| **Giữa trên / gần hành động · Tình huống** | Mục tiêu đang chọn, thông tin hợp lệ của target, cast và hiệu ứng thật | Chỉ xuất hiện khi liên quan. Warning/đường đòn ở thế giới; chữ/khung không đè dấu hiệu cần né. Chưa có HP target thì không dựng thanh máu giả |
| **Trái dưới · Nhật ký/giao tiếp** | Một vài kết quả nhiệm vụ, thành quả hoặc lỗi gần nhất; sau này chat/party | Nhật ký mở sâu, chat/party khi hệ thống thực sự hoạt động. Dữ liệu social tương lai có thiết kế spam/mute/ownership riêng |
| **Giữa dưới · Thao tác trận** | Giữ khung kỹ năng/cầu hiện có, khả dụng, hồi thuật và hướng thi triển; lệnh tương tác theo ngữ cảnh | Desktop 760×140; ba skill hiện có, bảy ô chưa gán không có hành động. Đòn thường F/E/NPC phải có gợi ý đúng điều kiện, không mặc định mọi hành động là skill R01 |
| **Phải dưới · Lối chức năng** | Nhân vật, Hành trang, Nhiệm vụ, Menu; các hệ bổ sung khi đã mở | Lối vào cố định, icon có nhãn/tooltip và shortcut. Công pháp, pháp bảo, diện mạo, tọa kỵ có thể nằm trong menu/Linh Đài, không cần một icon lớn thường trực cho từng hệ |

**Điểm riêng tu tiên:** một dải tiến trình ngắn gắn với danh tính, thể hiện **tu vi/nền đang vận dụng/trạng thái bình cảnh hoặc thiếu điều kiện**. Nó bổ sung cho HP/MP, không cạnh tranh bằng một thanh lớn ở giữa. Trạng thái bình cảnh phải có dữ liệu; hiện chỉ có thể hiển thị tu vi/tầng/M01 và bài học, không bịa phần trăm đột phá hoặc auto-breakthrough.

Khi chuẩn bị đột phá sau này, hành động mở bảng điều kiện: tích lũy → nền cần hiểu → khảo nghiệm → nguồn chi → tác dụng/kết quả. HUD gọn chỉ báo bước thiếu hoặc đủ để xem. Khi tu luyện thật, biểu hiện thổ nạp/đang vận khí và nút dừng theo snapshot, không cho UI/FX tự tích lũy.

## Ưu tiên theo tình huống và màn hẹp

- **Khám phá/nhập môn:** danh tính, định hướng, tracker và tương tác nổi hơn. Người mới luôn thấy một bước có thể thực hiện; chức năng khác mở dần theo gameplay thật.
- **Giao chiến:** target, cảnh báo, cast/khả dụng và tài nguyên nổi hơn; tracker/nhật ký thu gọn. Bảng nguồn stat/build ở Linh Đài, không phủ bảng số lên đường né.
- **Tu luyện/đột phá:** đổi nội dung vùng tình huống theo hoạt động đã xác nhận; giữ lối dừng và lý do không thể tiến. Gameplay MMO vẫn chạy khi mở menu.
- **Mobile:** danh tính ngắn trên cùng; tracker một mục tiêu; bản đồ mở theo nhu cầu; nhật ký/menu dạng ngăn. Giữ vùng di chuyển và ba skill 48 px không chồng tooltip/feedback; không thu nhỏ nguyên HUD desktop hoặc cả bảy vùng thành chữ li ti.
- **Tu Đạo/Đọa Ma:** chung vị trí, dữ liệu và thao tác; khác đá/đường khắc/vật liệu theo trạng thái gameplay. HP/MP, cảnh báo và hoàn thành giữ nghĩa màu. Không dùng overlay đỏ phủ vùng đọc để biểu diễn Đọa Ma.

Đây là lựa chọn thiết kế; chuyển qua chế độ chiến đấu/cảnh giới cần state gameplay thật. Bản sơ đồ tư vấn có ba tình huống để so vị trí, không phải tính năng đang tự thay HUD trong game.

## Trình tự làm phù hợp checkout

1. **Shell nhập môn trên kit mới:** ghép danh tính, tracker gọn, NPC/feedback, tài nguyên–skill, lối mở C/I/J/menu và server/kết nối. Reuse snapshot/lệnh hiện có, giữ gameplay/save/map. Nhân vật/portrait chờ bộ mới của owner; không cần đợi mọi hệ tương lai để thử shell.
2. **Định hướng và tình huống:** thiết kế bản đồ nhỏ đúng world release, target/cast/buff chỉ ở scope có dữ liệu thật; chuẩn hóa đòn thường, tương tác và lý do từ chối. Kiểm desktop/mobile, layer và đường đi.
3. **Đường tiến triển:** thêm dải tu vi/nền/M01 hiện có, liên thông Linh Đài và bài đang làm. Sau đó mới nối bình cảnh, pháp khí/luyện hóa/công pháp/đột phá theo từng lát gameplay được triển khai.
4. **Lớp MMO:** chat/party, hồ sơ public/diện mạo, PvE/PvP/activity và tọa kỵ theo roadmap. Chỉ đưa notification/shortcut thường trực khi hữu ích và hoạt động có thật; không dựng nút sự kiện/kho/ngự khí giả để màn có vẻ hoàn thiện.

**Ưu tiên khuyến nghị:** bước 1, rồi phần định hướng/target có thể dùng ở bước 2. Chưa cần làm lại artwork thanh kỹ năng hoặc triển khai toàn bộ backend MMO trước shell này. Kế hoạch dài hạn giữ các vị trí/lối mở; code ngắn hạn chỉ trình bày hệ đang vận hành.

## Core, dữ liệu và nghiệm thu khi triển khai

State/DOM ID ở Core; presenter đọc selector/view model từ own snapshot hoặc public projection được phép. Transport/command qua session hiện có; UI không tự cấp cảnh giới, vật phẩm, đòn trúng, buff hoặc thưởng. Mỗi vùng cần mapping **nguồn snapshot → nghĩa/đơn vị → khi hiện/ẩn → thao tác → trạng thái pending/offline/error** để debug.

Minimap đọc cùng map release/navigation/actor position, không sửa collider/owner map để khớp concept. `SkillHotbar` vẫn chỉ snapshot/callback; FX không phát lệnh. Nameplate/party/public character không phát private inventory. Theme resolver hữu hạn; kết nối lỗi không bị che bởi toast tu luyện.

Nghiệm thu đề xuất: người chơi mới nói được mục tiêu tiếp theo; thấy mình/target/đường né mà không mở menu; mở đúng chức năng bằng chuột/phím/chạm; tên tiếng Việt dài không tràn; vùng tương tác 44/48 px; overlay không sai góc khi resize; giảm chuyển động/hidden/offline hoạt động; server authority và reload/receipt giữ đúng. Khi code runtime thay, chạy HUD/layer và R01/aim/sect/reload/character/game-shell phù hợp bằng fixture riêng.

**Đầu ra đợt tư vấn:** ba nguồn chính thức, ma trận thông tin, bố cục desktop/mobile/theo tình huống và thứ tự tích hợp. Đã phác sơ đồ UX trong cuộc trò chuyện bằng skill visualize; kiểm sơ đồ ở 1024/736/390/320 px. Không ART nhân vật/map/raster mới, không build/test runtime hoặc tích hợp shell trong đợt này. Kiểm sơ đồ không thay nghiệm thu game hay duyệt ART.
