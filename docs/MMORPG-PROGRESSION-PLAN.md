# Kế hoạch tiến triển MMORPG — tu tiên, sức mạnh và hiện diện nhân vật

**Bản thiết kế 0.1 · 11/10/2026 · tích hợp định hướng GDD 0.32.** Chủ dự án xác nhận vòng chơi cần dẫn tới **farm đồ để mạnh hơn, PvE/PvP cùng người chơi và thể hiện nhân vật qua tọa kỵ, thời trang, pháp bảo cùng những thành tựu khác**. Đây là hướng sản phẩm xuyên suốt, không chỉ phần bổ sung sau tuyến truyện. Luật cụ thể bên dưới là đề xuất để đặc tả và kiểm chứng; chưa khóa số liệu, cân bằng, monetization, hình ART hoặc xác nhận có runtime mới.

Tài liệu nối [GDD](GDD.md), [hướng sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md), [kế hoạch nội dung](RPG-CONTENT-PLAN.md), [lộ trình RM0–RM6](DEVELOPMENT-ROADMAP.md) và [gói vật phẩm VP0–VP4](ITEM-PRODUCTION-PLAN.md). GDD sở hữu lời hứa sản phẩm; tài liệu này sở hữu quan hệ dài hạn giữa các vòng chơi; đặc tả từng lát sẽ sở hữu luật thực thi và số liệu đã chọn.

## 1. Đích trải nghiệm và vai trò của truyện

Người chơi đi từ đệ tử ít năng lực tới một tu sĩ có sức mạnh, cách vận dụng, quan hệ và diện mạo mà người khác nhận ra. Họ có mục tiêu gần để kiếm đồ, mục tiêu trung hạn để hoàn thiện build và mục tiêu dài hạn để đột phá, chinh phục hoạt động khó hoặc tạo dấu ấn trong cộng đồng.

Sức mạnh tích lũy phải có tác dụng thật: vượt được đối thủ từng khó, tiếp cận nguồn tài nguyên tốt hơn, đứng vững trong hoạt động cùng nhóm và cạnh tranh trong chế độ PvP phù hợp. Khả năng quan sát, chuẩn bị và thao tác tạo cửa sổ chiến thắng trong một khoảng chênh lệch có thể chơi được; không mặc định mọi cảnh giới ngang nhau.

Truyện tạo động lực, cơ duyên, đối thủ và hoàn cảnh để dùng sức mạnh. **Đạo đồ là ký ức về điều đã làm và con đường đã chọn**, đi cùng combat–farm–build. Nó không thay vòng thu tài nguyên, không biến mọi trận lặp thành điều tra hoặc thêm một loại EXP bắt buộc.

Khí chất “nghịch thiên” cần nhìn thấy qua việc bị hạn chế rồi tự tìm cách vượt qua: chuẩn bị để đánh một đối thủ khó, giành lại tài nguyên bị chiếm trong hoạt động có luật, tìm được đường luyện hóa khác hoặc trở lại giải một ân oán. Các tình huống mới là sáng tạo của game, cần nhãn nguồn và duyệt nội dung; không tự đổi bộ ba hoặc canon hiện hành.

## 2. Vòng chơi nối nhau

```text
Chọn mục tiêu: đồ/build, cơ duyên, đột phá, hoạt động khó, danh vị hoặc diện mạo
  → Chuẩn bị: công pháp–thuật–pháp bảo, vật tư, người đồng hành nếu muốn
  → Chiến đấu/khám phá/thu thập trong hoạt động đủ điều kiện
  → Kết quả server: chiến lợi phẩm, tài nguyên, bằng chứng hoặc thành tựu
  → Giữ/đổi/chế/luyện hóa theo nguồn–chi đã có
  → Điều chỉnh build và thử ở PvE/PvP
  → Đủ điều kiện thì chủ động đột phá, ổn định năng lực mới
  → Thể hiện thành quả: diện mạo, pháp bảo, tọa kỵ, danh hiệu, hồ sơ
  → Mục tiêu và phạm vi hoạt động tiếp theo
```

Không phải mỗi lượt farm đều làm đủ các bước. Một lượt có thể chỉ kiếm vật liệu cho món đang nhắm; một tối chơi có thể thử cấu hình hoặc tỷ thí; một chương mới kết thúc bằng đột phá. Đột phá không tự xóa mọi đồ cũ hoặc bắt sưu tập lại toàn bộ.

| Nhịp | Câu hỏi người chơi | Vòng có thể hoàn thành | Dấu tiến bộ |
| --- | --- | --- | --- |
| Ngắn | Hôm nay tôi làm gì để tiến gần mục tiêu? | Một lượt PvE, thu vật liệu, thử build hoặc tỷ thí | Có kết quả rõ và biết còn thiếu gì; không chỉ một thanh tăng chậm |
| Trung | Tôi muốn mạnh theo cách nào? | Hoàn thiện một tổ hợp, luyện hóa một món hoặc chinh phục một hoạt động | Cách chơi đổi, có nguồn tiếp và nơi kiểm build |
| Dài | Tôi đã trở thành tu sĩ như thế nào? | Vượt bình cảnh, mở chặng thế giới, thành tựu nhóm/cá nhân hoặc PvP | Cảnh giới, khả năng, diện mạo và lịch sử được ghi nhận |

Idle hỗ trợ tích lũy đã chọn. Không dùng idle để tự đánh quái, tự nhận chiến lợi phẩm đối kháng hoặc tự hoàn tất đột phá. Luật offline/cap/clock là đặc tả riêng khi triển khai.

## 3. Những lớp tiến triển có giá trị khác nhau

| Lớp | Tác dụng | Điều cần giữ |
| --- | --- | --- |
| Cảnh giới và mốc vận hành | Nền năng lực, quyền tiếp cận, điều kiện dùng nội dung | Tu vi khác MP; đủ tích lũy khác đã xác nhận mốc/đột phá |
| Công pháp và thuật | Chọn cách vận hành, hành động, thời điểm, ưu/nhược | Học được khác đang vận dụng; không cộng mọi cấu hình đã học cùng lúc |
| Trang bị/pháp bảo gameplay | Nguồn sức mạnh hoặc công cụ có tác dụng cụ thể | Stat/effect truy được tới nguồn; có chi phí/giới hạn/counterplay |
| Tri thức, lĩnh ngộ và cơ duyên | Quyền/cách vận dụng hoặc điều kiện tiến trình có ngữ cảnh | Server ghi hành động/bằng chứng; không đọc cảm xúc hoặc trao bonus từ câu thoại đẹp |
| Thành tựu và vị thế xã hội | Chinh phục, quan hệ, vai trò nhóm, kết quả PvP | Không mọi danh hiệu đều cộng stat; có provenance, phạm vi và lịch sử |
| Sưu tập và diện mạo | Thời trang, hình pháp bảo, tọa kỵ, dấu nhận diện | Sở hữu hình khác nguồn hiệu lực; người khác vẫn đọc được chiến đấu |

“Chiến lực” nếu thêm chỉ là số tóm tắt hỗ trợ so sánh, không thay bảng nguồn sức mạnh và không quyết định trận thắng. Một món phù hợp tình huống có thể tốt hơn món có số tóm tắt cao hơn. Chưa chốt công thức chiến lực hoặc bảng stat mới.

## 4. Ma trận hành trình từ Ngưng Khí trở đi

Các hàng dưới là **khung nội dung**, không ngày sản xuất hoặc danh sách tính năng đã mở. Tư Đồ Nam vẫn dùng diễn giải hồi phục năng lực/hiện diện phù hợp GDD; bảng không viết lại cảnh giới trong truyện của ông. Tier R01–R05 và gói ART sẵn có không tự cấp quyền gameplay.

| Chặng | Nội dung và mục tiêu | Nguồn sức mạnh đề xuất | PvE và farm | PvP/hiện diện cộng đồng | Ngoại hình và thành tựu |
| --- | --- | --- | --- | --- | --- |
| **Ngưng Khí** | Nhập môn, biết tự sinh tồn, hiểu linh lực và chuẩn bị; hoàn tất chương Hằng Nhạc | Nền hiện có/R01; mốc đã xác nhận; một pháp khí HN08 theo đặc tả; gear có lựa chọn chỉ khi pilot riêng được chọn | HN05 một E01 cá nhân; sau nền an toàn thử một hoạt động PvE lặp riêng với nguồn–chi hữu hạn; main quest giữ solo | Gặp nhau ở khu chung; tỷ thí đồng ý giữa người phù hợp sau gate; không đợi hết mọi tính năng RM5 | Nhận diện nhập môn, hồ sơ và kết quả chinh phục; thử một dấu thành tựu/diện mạo sau khi có hệ dữ liệu, không bắt làm tọa kỵ ngay |
| **Trúc Cơ** | Bắt đầu con đường riêng, chọn cấu hình có thể thử/chỉnh và chuẩn bị đại đột phá | Một nhánh công pháp–thuật–pháp bảo có đánh đổi; đồ thu được/luyện hóa; nguồn riêng theo nhân vật nếu được chọn | Một cụm vùng/hoạt động có mục tiêu farm rõ; đối thủ buộc vận dụng tổ hợp; thử tổ đội nhỏ khi credit/loot đủ | Tỷ thí theo nhóm phát triển; thử đấu có mục tiêu rõ ở phạm vi nhỏ; PvP dùng sức mạnh thật đi cùng khoảng ghép hợp lý | Thời trang, pháp bảo nhìn thấy và phương thức di chuyển/tọa kỵ đầu nếu đã có vai trò, nguồn nhận, animation và brief |
| **Kết Đan** | Tổ hợp chủ đạo rõ, luyện hóa sâu và chơi cùng người khác có giá trị | Build chuyên sâu, cặp lựa chọn gear/pháp bảo, truyền thừa có hành trình; bản mệnh chỉ nếu giải được mục đích gắn bó | Boss/tổ đội hoặc bí cảnh lặp chọn lọc; nhiều nguồn phục vụ mục tiêu khác nhau, tránh một chỗ tốt nhất cho mọi món | Hoạt động nhóm có đóng góp, tỷ thí/đấu mục tiêu; cạnh tranh nguồn tài nguyên chỉ ở khu có luật công khai | Bộ diện mạo theo thành tựu, dấu luyện hóa pháp bảo, tọa kỵ/linh thú có provenance; khu chung có nơi nhìn thấy nhau |
| **Nguyên Anh** | Bài toán mới về thần thức/linh hồn phù hợp nhân vật, quyền tiếp cận thế giới rộng hơn | Khả năng mới có giới hạn, tương tác công pháp–thuật–pháp bảo đã đặc tả; không tự cấp phân thân/bất tử | Encounter có nhiều mục tiêu/pha và nội dung nhóm nâng cao; vòng farm có tác dụng cả khi chưa rơi món hiếm | Nhóm phát triển cao; đấu tập thể có mục tiêu, hỗ trợ và đường hồi phục; công trình/bang hội là dự án riêng | Dấu nhận diện cảnh giới đọc được, pháp bảo có hình riêng, thành tựu tập thể; hiệu ứng giữ giới hạn đọc đòn |
| **Hóa Thần** | Lĩnh ngộ/ý cảnh làm thay cách vận dụng, chứng minh con đường đã chọn | Ý cảnh/công pháp/thuật có hành động và counterplay; sức mạnh gắn kết quả chinh phục, không chỉ nhân stat | Nội dung kiểm khả năng mới, boss/hoạt động nhóm có điều kiện thật; mục tiêu dài hạn vẫn có nguồn chủ động | Chế độ đỉnh cao theo eligibility; hồ sơ kết quả và danh vị; người dưới vẫn có hoạt động phù hợp và mục tiêu vươn tới | Biểu hiện ý cảnh được chọn, dấu chinh phục riêng, hình pháp bảo/diện mạo có câu chuyện; không coi phát sáng càng nhiều càng cao cấp |
| **Về sau** | Anh Biến/Vấn Đỉnh hoặc chặng mới chỉ khi arc/vòng chơi đủ | Thiết kế nguồn sức mạnh và luật riêng; không suy từ tên cảnh giới | Vòng mới giải được vấn đề mà vòng cũ không giải, kế hoạch nguồn–chi và nội dung riêng | Không mặc định reset tiến trình theo mùa; nếu có mùa chỉ đặt lại phần chế độ đã công bố | Giữ giá trị sưu tập/lịch sử; chuẩn bị ART và runtime riêng trước công bố phạm vi |

Mỗi chặng cần đủ bốn câu trả lời trước triển khai: **tôi kiếm gì, kiếm ở đâu, dùng để đổi cách chơi nào và dùng cách đó ở đâu?** Nếu chỉ có tên cảnh giới và bộ icon, chặng đó còn ở concept.

## 5. Mạnh/yếu và cách tổ chức PvP

### 5.1. Giữ giá trị phát triển và đường tham gia

Trong nội dung dùng sức mạnh thật, người có cảnh giới, build và chuẩn bị tốt hơn có lợi thế thực. Một người mới không phải được tăng ngầm tới ngang người đã tu luyện lâu; đồng thời khu tutorial, main quest và nguồn tiến triển nền không trở thành nơi bị chặn bởi người mạnh.

Chênh lệch gần có thể xử lý bằng thao tác, counterplay, lựa chọn cấu hình hoặc phối hợp. Chênh lệch rất lớn có thể chỉ cho phép thoát, giữ mục tiêu, trì hoãn hoặc chọn hoạt động khác; không hứa mọi trận đều thắng được. Tình huống mưu trí PvE không tự trở thành vật phẩm khắc chế tuyệt đối trong PvP.

| Chế độ đề xuất | Vai trò | Quan hệ với sức mạnh | Điều kiện trước mở |
| --- | --- | --- | --- |
| **Tỷ thí tự nguyện** | Pilot sớm: học đối phó người thật, thử build, thấy tiến bộ | Dùng luật và năng lực thật trong nhóm phù hợp; hai bên biết khác biệt trước nhận lời | Combat PvP có hit/target/cancel/resolve; consent/cancel; không cướp đồ/tiến trình; disconnect/timeout/result rõ |
| **Đấu theo nhóm phát triển** | Cạnh tranh có giá trị farm/đột phá | Ghép theo đại cảnh giới/mốc vận hành và tín hiệu sức mạnh phù hợp; không dựa duy nhất nhãn cảnh giới | Đặc tả eligibility và snapshot cấu hình; kiểm thời gian ghép/đối thủ lệch; chưa chốt khoảng số/rating |
| **Đấu luyện cấu hình cân bằng** | Tùy chọn học thao tác hoặc giải đấu thiên về kỹ năng | Bộ luật/cấu hình của chế độ được công khai; tiến trình gốc vẫn giữ ở hồ sơ | Xây sau khi có lý do sản phẩm; không áp cân bằng này ngầm lên mọi mode |
| **Đấu nhóm/mục tiêu** | Vai trò phối hợp, kiểm soát và vận dụng build | Chênh lệch sức mạnh vẫn có tác dụng; đóng góp nhiều loại và điều kiện đội rõ | Party/credit, đội lệch, hỗ trợ/AFK, late join và reconnect đã giải |
| **Khu tranh đoạt tự chọn** | Rủi ro và lợi ích của thế giới tu tiên | Có thể dùng sức mạnh tự do hơn, nhưng scope/rủi ro/quyền vào được báo trước | Bản đồ/entry/thoát, nguồn thay thế, luật kill/loot/chế tài và chống abuse riêng; chưa chốt open PK |

Pilot tỷ thí chưa có bảng xếp hạng hoặc tiền thưởng. Không phát thưởng vô hạn theo số trận thắng để khuyến khích hai tài khoản tự đổi thắng. Chọn nguồn thưởng PvP về sau phải đi cùng season/cycle, eligibility và anti-abuse; không cần chốt mọi hệ này trước pilot.

Đề xuất nội dung nền có nguồn solo/PvE; tham gia PvP có thể mở thành tựu, danh vị hoặc nguồn khác khi đặc tả đủ. Không đặt vật phẩm duy nhất bắt buộc đột phá vào một mode PvP mà người chơi chưa có khả năng tham gia.

### 5.2. Các tình huống phải đặc tả

Hai bên khác avatar hoặc mốc; đổi gear sau khi nhận lời; đổi cấu hình/cooldown trong phiên; hồi phục trước và sau đấu; đầu hàng; mất mạng một hoặc hai phía; server restart; hai phiên tranh quyền cùng một nhân vật; bất đồng kết quả; khán giả; thời gian hết; thắng/thua hòa; spam mời và block.

Kết quả thuộc server và mode rule version, khác lựa chọn truyện. Tỷ thí không giết NPC, phát lại thưởng HN hoặc tự tạo ân oán truyện giữa hai hồ sơ.

## 6. Farm và loot — phải có đích dùng và đường bảo đảm

### 6.1. Nhóm nguồn và chi

| Nhóm nguồn | Kết quả hợp lý | Đích dùng | Đường bảo đảm và ranh giới |
| --- | --- | --- | --- |
| Truyện/nhiệm vụ lần đầu | Quyền, nguyên liệu tuyến, món nhập môn và proof theo đặc tả | Bước tiếp, luyện hóa HN08, mở nội dung | Grant một lần theo business source; retry không nhân đồ; vật bắt buộc không random |
| PvE lặp cá nhân pilot | Một nguyên liệu thường/vật tư hoặc tiến độ đổi món đã chọn | Recovery/recipe/upgrade hữu hạn có tác dụng thật | Nguồn lặp riêng với cycle/attempt/receipt; kết quả tối thiểu kiểm được, không farm quest HN |
| PvE chung/tổ đội | Loot cá nhân đủ điều kiện hoặc cơ chế chia được thông báo | Gear/build và chuẩn bị hoạt động tiếp | Không mặc định last-hit; support/mục tiêu được xét; quest cá nhân không bị người khác lấy mất |
| Boss/bí cảnh mục tiêu | Món/nguồn lựa chọn, cơ hội vật hiếm nếu được chọn | Một build hoặc sưu tập có nguồn rõ | Có tiến độ tích lũy/đổi/chế cho phần thiết yếu; luật RNG/bảo đảm phải đặc tả trước công bố |
| Thu thập/luyện chế | Vật liệu đúng nội dung, recipe và sản phẩm có nhu cầu | Công cụ, recovery, gear hoặc luyện hóa | Recipe không đòi chính công cụ đang đi chế; có đường thủ công khi tuyến cho phép |
| PvP/sự kiện/thành tựu | Danh vị, diện mạo hoặc nguồn phụ đã chọn | Hiện diện/nhánh tiến triển phù hợp | Không áp thưởng kill vô hạn; main quest có đường khác; sự kiện không khóa tiến trình nền |
| Trao đổi người chơi | Di chuyển giá trị đã có, không tự sinh giá trị | Nhu cầu khác nhau giữa build/nghề | Chỉ mở khi binding/ledger/giao dịch và chống abuse đủ; pilot không cần chợ |

Trước mỗi nguồn lặp phải có bảng: item/quantity hoặc dải đề xuất, điều kiện tham gia/đóng góp, nguồn cấp, đích dùng, binding, capacity/overflow, chu kỳ, receipt, giới hạn và telemetry cần đo. Số liệu bảng đó được chốt theo từng slice; không phát linh thạch hoặc hàng chục nguyên liệu vì muốn giống MMO.

### 6.2. Chống mắc kẹt và farm vô nghĩa

1. **Năng lực bắt buộc có đường chắc chắn:** đồ tuyến, công thức và vật liệu mở mốc không phụ thuộc duy nhất vào món hiếm, người khác hoặc cửa hàng chưa mở.
2. **Thua vẫn có đường quay lại:** nguồn chuẩn bị/thử lại hoặc thao tác nền đủ; không cần vật tư chỉ lấy được bằng cách thắng chính trận đang chặn.
3. **Mỗi lượt có tiến độ hữu ích:** nếu món chính không rơi, kết quả tích lũy đã chọn vẫn đưa người chơi gần mục tiêu hoặc có công dụng khác. Chưa khóa hệ bảo đảm/rate.
4. **Đồ cũ còn quyết định:** kế thừa/luyện hóa/đổi vật liệu là ứng viên phải kiểm; không tự trừ đồ đã cấp hoặc reset sức mạnh khi nội dung tăng bậc.
5. **Capacity không phá thưởng:** xác định atomic reject, pending claim hoặc cơ chế overflow trước khi áp đầy túi; không thưởng nửa gói hoặc im lặng mất đồ.
6. **Nguồn bền và chi có giá trị:** không mở một faucet vô hạn rồi thêm phí vô nghĩa để tiêu; quan sát dư/thiếu, công dụng thực và lối chơi cưỡng bức trước mở rộng.
7. **Không farm receipt truyện:** attempt lặp là activity riêng; đổi request ID/content text/relog không cấp lại thưởng HN hoặc chứng nhận cơ duyên.

Crafting EX01–EX04 trong VP2/VP3 hiện là chuỗi khám phá hữu hạn. Nó có thể dạy thu–chế–dùng nhưng **không đủ thay một vòng farm lặp**. Pilot farm chọn nội dung/nguồn/chi riêng ở VP4-A, không tự mở mọi recipe/kinh tế VP4.

## 7. Build và kiểm chứng sức mạnh

Một lựa chọn build cần tình huống tốt, tình huống khó và cách đổi/chỉnh. Khởi đầu chỉ chọn một cặp thay đổi hành động: cơ động so với chuẩn bị vùng, bùng sức ngắn so với ổn định hoặc áp lực đều so với chờ cửa sổ. Các cặp trong [RPG-CONTENT-PLAN](RPG-CONTENT-PLAN.md) là ứng viên, không sáu class/skill đã duyệt.

Vòng thử đề xuất: xem hiệu lực/đánh đổi → dùng trong bài an toàn → thử PvE thật → tỷ thí phù hợp → quyết định đầu tư. Một cấu hình hữu ích ở PvE không phải tự mạnh nhất ở PvP; hồ sơ năng lực ghi rõ mode applicability và counterplay. Nếu hệ số theo mode được chọn, phải hiện và version hóa, không chỉnh ngầm.

Đổi trang bị/loadout không được hồi đầy, reset cooldown, né chi phí hoặc giữ mọi bonus cũ. Quyền học, đồ đang mang, trạng thái luyện hóa và hiệu lực hoạt động là những nguồn riêng phải truy được khi debug.

## 8. Cơ duyên, ân oán và chất nghịch thiên trong vòng MMO

| Ý tưởng sáng tạo | Nối với sức mạnh/farm | Kết quả truyện/Đạo đồ | Phạm vi nên thử |
| --- | --- | --- | --- |
| Trở lại một đối thủ từng khó | Kiếm vật tư/chỉnh build rồi chinh phục phiên có luật | Ghi lần gặp, chuẩn bị và kết quả; đối thoại khác nếu nội dung được chọn | Một NPC/encounter, không sửa cơ duyên hoặc AI toàn realm |
| Một truyền thừa có nhiều cách vận dụng | Vật liệu + quyền đã học → chọn một tổ hợp có đánh đổi | Nguồn gốc món/công pháp và quyết định của người chơi | Sau nền build, một cặp chọn/chỉnh; không mở cây vô hạn |
| Giành mục tiêu trước kẻ mạnh | Quan sát/cắt trợ lực/thoát với vật cần giữ | “Thắng” theo mục tiêu rõ, không bắt hạ toàn bộ HP cao thủ | PvE hữu hạn; không chuyển thành one-shot PvP |
| Pháp bảo được luyện hóa qua hành trình | Farm có nguồn và bước sử dụng thật | Provenance và dấu thành tựu trên món đang gắn bó | Một món trước; khí linh/bản mệnh là hồ sơ sau |
| Thiên kiếp/đạo ngân | Chuẩn bị và chủ động vượt mốc, sau đó hiểu cách vận dụng | Ý tưởng riêng về biến thử thách thành hiểu biết/năng lực | Chưa áp vào HN05; cần cơ chế, failure/retry và mode rules riêng |

Cơ duyên tuyến chính cấp quyền theo kết quả đã xác nhận; nội dung PvE lặp tạo tài nguyên dùng để chuẩn bị. Không lặp việc phát hiện bí mật độc hữu hoặc báo thù một lần để lấy cùng “lĩnh ngộ” mãi. Ân oán NPC khác tranh chấp player; chưa chốt săn thưởng/PK hoặc trừng phạt xã hội tự động.

## 9. Sưu tập, tọa kỵ, thời trang và pháp bảo nhìn thấy

Diện mạo là một mục tiêu chơi độc lập có nguồn nhận và chỗ thể hiện. Không bắt mọi món trang trí phải cộng stat để có giá trị. Một đối tượng có cả hiệu lực và hình thì hai phần vẫn cần ID/ownership/effect source riêng; đổi hình không thay chỉ số hoặc hitbox.

| Hệ | Người chơi muốn thể hiện | Quan hệ gameplay | Đầu ra trước sản xuất |
| --- | --- | --- | --- |
| **Thời trang** | Diện mạo, vật liệu/chủ đề, dấu chinh phục | Lớp trình bày tách đồ đang cấp stat; chưa chốt slot hoặc số bộ | Quyền sở hữu, equip appearance, preview, silhouette; idle/walk/cast/quest motion ở hướng đã cần |
| **Pháp bảo** | Món đang vận dụng, mức luyện hóa và hành trình | Pháp bảo gameplay có quyền/effect thật; hình trang trí không cấp thêm năng lực | Món nào hiện ở chân/tay/đi theo/quỹ đạo, anchor/layer/FX, trạng thái ẩn và giới hạn mode |
| **Tọa kỵ/ngự khí** | Phương thức di chuyển và thành tựu sở hữu | Nếu có tốc độ/đường tiếp cận thì là luật locomotion server; chưa cho lợi thế combat từ hình | Mount/dismount, spawn/transfer/collision, khu được dùng, ngắt khi cast, animation, occlusion và persistence |
| **Linh thú/đồng hành** | Quan hệ và dấu nhận diện riêng | Combat AI/stat khác pet trình bày; không tự gộp tọa kỵ và companion | Vai trò trước, authority/target/path/credit nếu combat; ngân sách asset riêng |
| **Danh hiệu/khí quang/dấu thành tựu** | Điều đã chinh phục hoặc kết quả cộng đồng | Nhãn/FX khác combat effect; không mọi title cộng stat | Nguồn/provenance, visibility, quyền ẩn, đọc ở màn nhỏ và chống giả mạo |

Nguồn ứng viên: chinh phục PvE, chuỗi cơ duyên, luyện chế đã chọn, thành tựu PvP hoặc hoạt động cộng đồng. Nguồn thương mại/chuyển nhượng chưa chốt; tài liệu này không mở cash shop, gacha hoặc quyết định lợi thế trả phí.

Thứ tự hữu hạn: **hồ sơ diện mạo và xem người khác → một dấu thành tựu hoặc thay đổi nhỏ → một bộ thời trang → một pháp bảo có hình → một tọa kỵ/ngự khí nếu vai trò đủ rõ**. Có thể đổi thứ tự theo sản phẩm/ART, nhưng không bắt sản xuất mọi hệ để có lần kiểm đầu. Chưa có ART tương ứng thì ghi rõ unavailable, không bật nút hứa chức năng giả.

Khu sinh hoạt, tổ đội và màn xem hồ sơ phải cho người chơi thấy thành quả nhau. Dữ liệu công khai đề xuất chỉ gồm tên hồ sơ/nhãn nhân vật, mốc đang thể hiện, diện mạo đã trang bị và thành tựu được chọn; không public inventory đầy đủ, tài khoản đăng nhập hoặc lựa chọn truyện riêng.

### Hợp đồng hình và chuyển động

Giữ locomotion nhân vật **64 × 96, chân (32,88), camera 1×** và 9 blocker Hằng Nhạc; không thay map/navigation để vừa hình tọa kỵ. Tọa kỵ là asset/runtime contract mới cần canvas/pivot/footprint/animation riêng, không ngầm phóng frame nhân vật hoặc lấy alpha art làm collision. Sprite nhiều lớp/đổi thời trang cần đề xuất pipeline và kiểm hướng/crop/occlusion trước mở rộng, không giả định renderer đã hỗ trợ.

VFX trang trí không phát cast, tạo hit, che telegraph hoặc giả thành hiệu ứng có quyền. Giữ giới hạn hiệu ứng, tùy chọn giảm motion và mức hiển thị peer; ưu tiên silhouette/kết cấu/chi tiết dễ nhận hơn thêm glow. Mọi raster mới theo skill ImageGen và lưu prompt/source/metadata khi thực sự được chọn sản xuất. Kiểm kỹ thuật không tự thành ownerApproved/artApproved.

## 10. UX xuyên suốt

C/I/J/HUD tiếp tục cùng nền Vân Ngọc/Linh Đài và [quy tắc vùng đọc](GAME-UI-READING.md). Không thêm tất cả menu ngay đầu; mỗi hệ xuất hiện khi có hành động và dữ liệu thật.

| Nơi | Dữ liệu/hành động cần cho tiến trình | Câu hỏi UI phải trả lời |
| --- | --- | --- |
| Nhân vật C | Mốc, nguồn stat, công pháp/build đang dùng, diện mạo/đồ hiệu lực tách rõ | Tôi mạnh từ đâu, còn thiếu gì để mở bước tiếp? |
| Hành trang I | Đồ đang nhắm, quantity/state, provenance, công dụng và binding | Kiếm ở đâu, dùng ở đâu, vì sao chưa dùng được? |
| Nhật ký J/Đạo đồ | Tuyến/cơ duyên riêng, chứng nhận và mục tiêu liên quan | Điều đã làm dẫn đến quyền/kết quả nào? |
| Hoạt động | PvE/PvP, eligibility, luật kết quả, đích dùng loot, rủi ro | Hoạt động này dành cho tôi chưa, kết quả giúp mục tiêu nào? |
| Xem người chơi | Tên hồ sơ, diện mạo, thành tựu public được chọn | Người này muốn thể hiện điều gì, có thể mời tỷ thí/nhóm không? |
| HUD/combat | Target, telegraph, tài nguyên, trạng thái hợp lệ và kết quả | Tôi có thể hành động gì và vì sao lệnh bị từ chối? |

Snapshot phục vụ trình bày; UI gửi ý định, không tự tính quyền thưởng/đột phá/đồ. Pending/mất phản hồi/reconnect có trạng thái rõ; không cho animation hoàn tất đồng nghĩa receipt đã lưu. Màn tương lai chỉ có fixture thì phải ghi preview và không làm giả là gameplay live.

## 11. Nối RM và VP — kiểm vòng MMO sớm với phạm vi nhỏ

Các nhãn **RM5-A/RM5-B/RM5-C/VP4-A** dưới đây là **lát đề xuất nằm trong chặng/gói hiện có**, không roadmap cạnh tranh hoặc milestone gameplay. Chúng có gate riêng để làm sớm khi đủ phụ thuộc; không đợi RM5 hoàn tất mọi tiện ích và không phình HN05 thành farm/PvP. RM là thứ tự/phụ thuộc sản xuất, không ánh xạ cố định mỗi RM vào một cảnh giới.

| Lát/gói | Bàn giao | Thời điểm theo phụ thuộc | Giữ ngoài phạm vi |
| --- | --- | --- | --- |
| **RM0 / thiết kế bổ sung** | Mục tiêu sức mạnh/diện mạo, ma trận chặng, mẫu nguồn–chi và luật mode; chọn pilot tối thiểu | Làm ngay cùng D01–D12 phần liên quan | Balance toàn game, mọi cảnh giới, luật monetization |
| **RM1–RM2 / VP0** | Quest/item/receipt/migration vừa đủ, HN05 ngoại vi đi–về/E01 cá nhân/M02 | Ưu tiên hiện tại; không thêm prerequisite từ pilot MMO | Random loot HN05, party bắt buộc, đấu player trong tutorial |
| **RM5-A / VP4-A — pilot PvE lặp** | Một activity riêng, một nguồn lặp và một chi có tác dụng; giao diện mục tiêu/nhận kết quả | Sau RM2 và nguồn–chi/lifecycle/ownership đủ; có thể chạy song song RM3/RM4. Gate tăng trưởng/hiệu lực phải chốt trước khi tuyên bố farm tạo sức mạnh; nếu chỉ thử nguồn/chuẩn bị thì ghi rõ chưa đạt nghiệm thu tăng trưởng | Chợ/kinh tế đầy đủ, EX lặp giả, toàn craft, nhiều map/loot tier |
| **RM5-B — pilot tỷ thí** | Hai người đồng ý, arena/phiên hợp lệ, kết quả và quay lại; cấu hình luật công khai | Sau combat PvP/target/counterplay/lifecycle đủ; có thể song song RM3/RM4, không cần chợ/bang hội hoặc RM5-A nếu độc lập | Rating mùa, thưởng kill, open PK, world war |
| **RM5-C — pilot hiện diện** | Quyền diện mạo tách power, xem hồ sơ public và một dấu thành tựu/hình đã chọn | Sau snapshot/ownership đủ; có thể kiểm sớm bằng dữ liệu đã có, còn ART mới chờ brief/duyệt riêng | Mọi thời trang/tọa kỵ/pet, lộ inventory hoặc suy đã có renderer nhiều lớp |
| **RM3–RM4 / VP1** | Chương HN06–HN12, pháp khí/đột phá nền/khảo nghiệm như roadmap | Giữ tuyến chính và item budget hiện hành | Không buộc thắng PvP hoặc farm hiếm để tốt nghiệp |
| **VP2–VP3** | EX01–EX04 hữu hạn và công cụ khảo sát/chuẩn bị | Sau gate nội dung đã ghi ở gói item | Không thay hoạt động lặp RM5-A bằng replay quest EX |
| **RM6 + phần RM5/VP4 cần dùng** | Một cặp build, vòng farm–luyện hóa–kiểm build, đầu Trúc Cơ; dữ liệu hiện diện và pilot hình hữu hạn | Sau chương/phụ thuộc thực sự cần; không đợi mọi tiện ích MMO | Tất cả class/gear/cảnh giới/skin/mount cùng lúc |
| **RM5 mở rộng / arc sau** | Party/nguồn chung/boss/PvP mục tiêu/kinh tế/diện mạo theo từng lát | Mở từ bằng chứng của pilot; vận hành có gate trước public | Tự cam kết scale nhiều máy hoặc launch sản xuất từ local test |

VP4-A chọn một hoạt động lặp riêng và gói nguồn–chi nhỏ, không yêu cầu hoàn thành cả nghiên cứu dụng cụ VP2/VP3. Đây là điều chỉnh trình tự đề xuất trước đây vốn ưu tiên EX hữu hạn; **chỉ phần cần cho farm pilot được tách sớm**, còn trade/gear rộng/công pháp sâu vẫn theo gate của VP4. Phải cập nhật đặc tả và hồ sơ nguồn đã chọn trước code, không suy mọi nguyên liệu/recipe cũ thành loot lặp.

Hai pilot kiểm những điều khác nhau: PvE lặp kiểm “farm có mục đích và tăng năng lực/chuẩn bị”; tỷ thí kiểm “tương tác đối kháng có rõ, hợp lệ và thú vị”. Một pilot đạt không xác nhận toàn bộ MMO hoặc balance đã đủ. HN05 vẫn là nội dung kế tiếp; tài liệu dài hạn không chặn nó bằng yêu cầu làm tất cả vòng chơi.

## 12. Authority, lưu và debug theo Core

| Lớp | Trách nhiệm dự kiến |
| --- | --- |
| Luật thuần / shared | Định nghĩa item/nguồn/recipe, eligibility mode, contribution và effect plan; không DOM/Three/SQLite/Colyseus |
| Server application | Kiểm account/realm/character/activity, lập plan kết quả/chi/grant/đổi cấu hình/diện mạo theo quyền |
| Persistence | Transaction/CAS, business receipt, item instance/provenance, nguồn–chi/migration và kết quả bền |
| Room/HTTP adapter | Vị trí/attempt/target/đồng ý/transfer; một writer nhân vật, không tự đưa policy kinh tế vào UI |
| Client Core và feature view | Một nguồn state, ID DOM tập trung; snapshot/action đúng hồ sơ; feature không import lẫn nhau |
| Render/FX | Animation/appearance/anchor/occlusion theo kết quả; không cấp stat/loot từ frame animation |
| Observability/content | Rule/release version, ID activity/attempt/receipt, hiệu lực theo nguồn, provenance; không credentials hoặc inventory riêng trong broadcast/log |

Persistent progression khác attempt chiến đấu, reward đã ghi khác kết quả đang hiển thị, appearance entitlement khác item stat. Cần truy được **ai → hoạt động/phiên nào → rule version → bằng chứng/đóng góp → grant/cost → receipt → snapshot version** khi debug.

Đổi room, reconnect hoặc server restart không được tạo actor/nguồn ghi thứ hai hay cấp lại loot. Hồ sơ/save/guest cũ có migration hữu hạn; không reset DB thật, owner map hoặc draft trình duyệt để nghiệm thu. Thiết kế scale theo module boundary và dữ liệu đã đo; chưa chọn thêm microservice cho một pilot.

## 13. Các điểm cần chốt theo lát

Mã MP dưới đây là danh mục thiết kế của tài liệu, không thay D01–D12. Chỉ phần liên quan lát sắp làm phải giải trước code.

| ID | Câu hỏi cần chốt | Đầu ra | Chặn phần nào |
| --- | --- | --- | --- |
| MP01 | Cảnh giới/mốc và nguồn stat có giá trị tới đâu? | Nguồn growth, cách tính/HP/MP/cooldown, mẫu so trước/sau; nối D03 | M02 và gear tăng sức mạnh; không chặn sửa lỗi nền |
| MP02 | Farm pilot cấp gì và dùng hết ở đâu? | Một activity/source/sink; quantity/cycle/binding/capacity, target item và đường bảo đảm | RM5-A/VP4-A |
| MP03 | Quái lặp thuộc ai, contribution và retry thế nào? | Solo/shared scope, loot/AFK/support/late join, reset/drop/result | RM5-A; phần chung mở sau nếu pilot cá nhân |
| MP04 | Tỷ thí dùng nhóm nào và thắng/thua được xác nhận ra sao? | Eligibility, consent, version/loadout, combat lifecycle, không thưởng vô hạn | RM5-B |
| MP05 | Chênh lệch nào có thể đối phó bằng chuẩn bị? | Encounter/tình huống mẫu; quan sát thao tác và giới hạn, rồi chọn ngưỡng sau | PvE/PvP balance phần liên quan |
| MP06 | Món nào là power, món nào là hình? | Catalog entitlement/effect/appearance, public fields, nguồn nhận và nơi thể hiện | Pilot hình/xem người chơi |
| MP07 | Tọa kỵ/ngự khí giải quyết việc gì? | Luật di chuyển/combat/transfer, native asset/pivot/layer và budget animation | Sản xuất/tích hợp tọa kỵ; không chặn farm/tỷ thí |
| MP08 | Người mới/cũ có đường đuổi mục tiêu và giữ giá trị thành quả thế nào? | Chính sách reuse/catch-up/source alternatives; không tự reset stat/đồ | Mở chặng mới/nguồn hiếm |
| MP09 | Diện mạo/danh vị nào thể hiện chất nghịch thiên? | Một tình huống/achievement/source có nhãn sáng tạo, brief đọc được | Content/ART phần chọn; không nâng approve tự động |
| MP10 | Phạm vi vận hành/abuse trước mở nhiều người? | Load/limit/recovery/log/moderation và quyền admin đúng scope | Public pilot, trade/rating/khu tranh đoạt tương ứng |

Owner chốt mục tiêu trải nghiệm/phạm vi; thiết kế và kỹ thuật đề xuất luật; chơi thử cung cấp bằng chứng cho balance; ART duyệt riêng. Đồng ý hướng mạnh/yếu và khoe nhân vật chưa khóa phí/cash shop, slot, rarity, tỷ lệ rơi, mức mất khi chết hoặc gank tự do.

## 14. Nghiệm thu theo ba loại bằng chứng

### Kỹ thuật và dữ liệu

| Trường hợp | Kết quả cần thấy |
| --- | --- |
| Hai hồ sơ cùng avatar, cùng nội dung | Tiến trình/đồ/diện mạo riêng, không đọc/ghi inventory peer |
| Kết quả mất phản hồi, request mới/reload/restart | Cùng nguồn cấp một lần; snapshot/receipt khôi phục được |
| Craft/upgrade/grant cạnh tranh hoặc đầy túi | Commit đủ gói hoặc không mất input; không half reward/lost update |
| Farm lặp | Quest HN và proof cơ duyên không phát lại; reset cycle/attempt do server, nguồn–chi đúng catalog |
| Thua/thiếu MP/vật tư | Có đường chuẩn bị/thử lại, không tiêu vật bắt buộc ở ngõ cụt |
| PvP thiếu đồng ý, đổi loadout, disconnect hoặc transfer | Không đánh peer trái mode; kết quả/lifecycle có rule, không nhận hai session điều khiển |
| Đổi appearance/mount | Không tự tăng stat/hitbox/quyền skill; locomotion/anchor/layer và visibility đúng hợp đồng |
| Save/migration cũ | Giữ identity, gear/supplies, HN01–HN04, R01/credit/receipt và baseline chưa đổi |

Test dùng fixture riêng. Khi runtime bị chạm chạy hồi quy entry/character/R01/sect/lessons/reload, input/HUD/render theo phạm vi; không chạy toàn bộ gameplay test hoặc gọi là nghiệm thu runtime trong đợt chỉ viết kế hoạch.

### Cảm giác chơi và cân bằng

Người chơi có thể nói được mục tiêu món đồ, nguồn kiếm và công dụng; sau vài lượt còn muốn tiếp vì có tiến độ/lựa chọn, không chỉ vì phải chờ. Sức mạnh mới tạo khác biệt quan sát được trong tình huống đã chọn. Tỷ thí có hành động để đối phó và hiểu lý do thắng/thua. Cả ba tự hoàn tất tuyến chính; một người chưa muốn PvP vẫn tiến triển được. Người chơi nhìn diện mạo/thành tựu người khác và nhận ra điều có giá trị.

Ghi số lần thử, phần thời gian chơi/chờ, nguồn thu/chi/tồn, tình huống build được dùng, lỗi đọc đòn, khoảng chênh lệch và phản hồi. **Ngưỡng/rate/thời lượng chỉ chốt sau dữ liệu**, không bịa KPI đã đo. Nếu farm không có mục đích thì sửa source/sink/loot; nếu mạnh/yếu không có tác dụng thì sửa growth/encounter; nếu mode trở thành chuỗi trận bất lực thì sửa eligibility/counterplay.

### Mỹ thuật và nhận diện

Review tại kích thước chơi thật, camera 1×, desktop/màn nhỏ, nhiều người cùng lúc và reduced motion. Kiểm silhouette, crop/anchor, đồng bộ idle/walk/cast/quest motion, che khuất và đọc telegraph. Owner duyệt hình/source riêng; unit/build/screenshot không tự duyệt ART.

**Đầu ra của bản 0.1:** khung tiến triển xuyên cảnh giới; quan hệ truyện–sức mạnh–farm–PvE/PvP–hiện diện; ba pilot farm/tỷ thí/hiện diện được tách để kiểm sớm sau nền an toàn; danh mục quyết định và tiêu chí nghiệm thu. **Chưa có:** gameplay/loot/PvP mới, luật cân bằng được khóa, map/ART mới hoặc xác nhận scale sản xuất.
