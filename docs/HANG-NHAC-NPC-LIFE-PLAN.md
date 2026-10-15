# Hằng Nhạc — NPC và sinh hoạt môn phái

**Snapshot 13/10/2026 · trước GDD 0.35 · Đã đồng bộ roster owner, chưa ghép runtime.**

**Nguồn thay thế:** [Kế hoạch Vân Hải của owner](VAN-HAI-LIVING-WORLD-PLAN.md) và [plan.json](design/world/van-hai-living-world-v1/plan.json) là nguồn chính của **14 NPC**, wave, danh tính và brief concept. Kế hoạch này **thay đề xuất sáu vai/sáu nhân vật nền** trước đó; không cộng hai danh sách để thành 26 NPC. Tài liệu này chỉ bổ sung quan hệ với bốn station hiện có, đế đối chứng và luồng nhiệm vụ mới. Danh tính/ART/tọa độ trong plan vẫn là ứng viên, không suy đã duyệt hoặc triển khai.

Theo phản hồi map trống, chương nhập môn cần những người có việc đang làm, mục đích riêng và phản ứng với hành trình của người chơi. Tham chiếu [GDD 0.35](GDD.md), [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md), [lộ trình VG01–VG11](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) và [bộ asset nhập môn](design/gameplay/hang-nhac-onboarding-assets-v1/README.md). Hồ sơ “nhập môn v2” cũ đã dọn.

## 1. Hiện trạng và mục tiêu

Runtime có **bốn điểm NPC đứng yên**, dùng lại hai atlas đệ tử nam/nữ; chưa có dàn NPC riêng hoặc sinh hoạt nền. Nguồn hồi quy là `shared/sect.ts`, mô tả trong [luồng NPC Hằng Nhạc](HANG-NHAC-NPC-RUNTIME.md). Roster 14 NPC trong bản owner mới được pull về là thiết kế kế tiếp, chưa phải dân cư đang chạy trong game.

Roster owner chia **Wave A: tám đầu mối + hai đệ tử sinh hoạt** và **Wave B: bốn vai mở theo nội dung cần dùng**. Mỗi cụm trả lời được: họ đang làm gì, vì sao ở đây, và người chơi có lý do gì để chú ý. Hai đệ tử sinh hoạt không biến thành hai người phát nhiệm vụ bắt buộc.

Tên và câu chuyện trong plan là **sáng tác cho nội dung chuyển thể game**, không tự gọi là nhân vật hoặc sự kiện canon của *Tiên Nghịch*. Chi tiết nguồn và brief giữ tại hồ sơ owner.

## 2. Roster owner và bốn điểm tương tác hiện có

Giữ bốn `stationId` hiện hành để nối tiếp save/quest; không đổi ID hoặc receipt chỉ để thay diện mạo và lời thoại.

| Danh tính đề xuất / ID hiện hành | Wave | Vai trò | Khu và điểm tham chiếu hiện có |
| --- | --- | --- | --- |
| Trần Duy / `guide` | A | Chấp sự tiếp dẫn, HN01/11/12 | Sân môn phái; NPC hiện tại (1536,1168) |
| Diệp Tĩnh / `cultivation` | A | Giảng sư vận khí, ổn định nền | Vườn thổ nạp; NPC hiện tại (736,944) |
| Tạ Kiếm Sơn / `training` | A | Giáo tập, HN03–05/09/10 | Sân luyện phía đông; NPC hiện tại (2464,880) |
| Tô Nhược / `preparation` | A | Tư Vật Các, HN06/08 và EX | Khu chuẩn bị đông nam; NPC hiện tại (2392,1488) |
| Bạch Chỉ | A | Dược sư, kiểm dược/nguồn vật tư | Dược đình phía tây; vùng đề xuất |
| Tống Thiết | A | Luyện khí sư, vật liệu/pháp khí | Xưởng đông nam; vùng đề xuất |
| Hứa Hành | A | Người giữ tuyến, nhân chứng dấu niêm | Đường tuần sơn/lối ngoại vi; vùng đề xuất |
| Đinh Sóc | A | Hộ sơn, lối ngoại vi và đường về | Cổng ngoại viện; vùng đề xuất |
| Kỷ An | A, sinh hoạt | Đệ tử vận khí, đọc giản và tự sửa nhịp | Rìa vườn thổ nạp; vùng đề xuất |
| Phùng Dã | A, sinh hoạt | Đệ tử luyện kiếm, chỉnh thế và nghỉ tay | Rìa sân luyện đông; vùng đề xuất |
| Lục Văn | B | Thủ thư, Đạo đồ/trang tư liệu | Hiên tây bắc; vùng đề xuất |
| A Ly | B | Người coi linh thú | Rìa vườn phía tây; vùng đề xuất |
| Mạc Bà | B | Người coi trà đình, lời đồn có nguồn | Trà đình bên hồ; vùng đề xuất |
| Tiểu Nghiên | B | Người đưa tin | Hiên chính điện; vùng đề xuất |

Các vai mới không chen thêm vòng nhận/trả vào tuyến chính. Khi thông tin đã được chứng minh trong bài, lời đáp xuất hiện ở bước có ngữ cảnh; gặp trực tiếp để hỏi thêm là tùy chọn. NPC chỉ cung cấp hoạt động đã được tích hợp, chưa mở chợ, thư, thú cưỡi hoặc một nền kinh tế mới. Vùng gợi ý trong plan không phải spawn/route đã duyệt.

## 3. Đế đối chứng hai mẫu ở đâu?

**Hiện tại chưa đặt trên bản đồ.** Gói asset mới là hình và native/pivot để xem thử; ảnh map trong trang review chỉ dùng đối chiếu tỷ lệ.

Đề xuất vị trí chính: **khu chuẩn bị đông nam, gần chấp sự vật tư**. Điểm (2392,1488) là chân NPC đang có, **không phải tọa độ đặt đế**. Chọn khoảng trống cạnh khu chuẩn bị sau khi kiểm nền Vân Ngọc, điểm đứng tương tác và đường tới; tránh đặt trùng bàn/hũ đã bake trong nền hoặc chặn lối đi.

| Tình huống | Cách dùng đế | Luồng người chơi |
| --- | --- | --- |
| Hub / HN06 | Trạm đối chứng có ý nghĩa lâu dài, liên hệ người phụ trách vật tư | Mở bài đối chứng từ station; bài có thể dùng một bản đế trong activity |
| HN04 | Bản dùng trong bài ở cuối đoạn C, nhận mẫu sau khi vượt trận | Tự ghi kết quả tại đích; không buộc quay hub hoặc bấm nhận thưởng |
| HN09 | Bản dùng trong bài ở điểm giữ/kiểm mẫu ngoài thực địa | Kết quả nối bước tiếp tại activity; không biến thành chuyến giao đồ lặp lại |

Các bản trong activity là đạo cụ phục vụ cùng thiết kế, không sinh bản sao item trong túi. Trước placement cần đo riêng offset, ổ nhận mẫu, điểm tương tác và trước/sau nhân vật; pivot ảnh chưa đủ xác nhận collider hoặc vị trí trên map. Không sửa authored map, navigation, chín blocker hoặc bậc thang để đặt đế cho vừa.

## 4. Sinh hoạt gắn với roster owner

| Cụm / khu | Vai và hoạt động quan sát được | Ý nghĩa và giới hạn |
| --- | --- | --- |
| Tu tập / rìa vườn thổ nạp | Kỷ An đặt bầu nước, đọc giản, tự sửa nhịp | Nhịp tĩnh/động phù hợp khu; không giả lập farm hoặc tu luyện offline của NPC |
| Luyện tập / rìa sân luyện đông | Phùng Dã chỉnh thế, luyện và nghỉ tay | Cử chỉ nền không phát damage, projectile hoặc credit |
| Nghề nghiệp / dược đình, Tư Vật Các, xưởng | Bạch Chỉ kiểm lá, Tô Nhược kiểm sổ, Tống Thiết kiểm phôi | Người có chức năng cũng có việc đang làm; giữ điểm tương tác ổn định |
| Các khu Wave B | Lục Văn đọc giản, A Ly chăm linh thú, Mạc Bà làm trà, Tiểu Nghiên gấp thư | Chỉ mở cùng nội dung tương ứng; không bật dịch vụ chưa có từ animation |

Cử chỉ tại chân cố định trước, patrol sau khi route được duyệt theo plan owner. Chuyển động theo những đoạn đi ngắn được kiểm trên vùng đi hiện có; có thời gian đứng làm việc và nghỉ, tránh cả cụm cùng chuyển động liên tục. Không tự sinh tuyến xuyên blocker, thêm collider hoặc đổi tốc độ người chơi. Chưa có clip phù hợp thì giữ tư thế tĩnh đọc được; không dùng animation chiến đấu để giả làm hành động nghề.

NPC chức năng giữ điểm tiếp cận ổn định. Có thể quay người, làm việc hoặc bước nhỏ trong vùng đã kiểm, nhưng luôn tìm thấy từ tracker; trong hội thoại phải giữ tương tác hợp lệ. Nhân vật sinh hoạt không có dấu chấm than bắt buộc và không chiếm ưu tiên phím E của đầu mối đang cần. Lời thoại quanh tuyến ưu tiên người gần, có khoảng nghỉ; không đồng thời phủ map bằng bong bóng.

## 5. Bốn nhịp phản hồi của môn phái

| Mốc đã lưu theo hồ sơ | Điều người chơi thấy/nghe | Cần có trước khi bật |
| --- | --- | --- |
| HN01 | Tiếp dẫn nêu việc đang trục trặc; đồng môn đang tự xử lý khó khăn của mình | Lời dẫn ngắn theo playable, không đặt một bản sao playable làm NPC |
| HN05 | Người giữ tuyến kể một chi tiết có thể kiểm; vật tư quan tâm mẫu mang về, không biết thay kết luận của người chơi | Proof/lời thoại đúng trạng thái chương, không lộ kết quả HN06 trước |
| HN09 | Người liên quan phản hồi đúng bằng chứng thu được; đồng môn nhắc lựa chọn hỗ trợ/chia sẻ nếu lựa chọn ấy thực sự được ghi | Một callback có nội dung tương ứng; thiếu dữ liệu thì dùng lời đáp trung tính |
| HN11 | Tiếp dẫn công nhận thành quả cụ thể, đồng môn thay cách xưng hô hoặc nhắc lại việc đã trải qua | Kết quả HN11 bền; không chỉ đổi mọi câu thành lời khen chung |

Đây là các nhịp thiết kế, chưa phải hội thoại đã có trong game. Dùng Trần Duy/Tô Nhược/Hứa Hành và Kỷ An hoặc Phùng Dã theo facts/brief của plan owner, không tạo thêm một NPC “đồng môn” ngoài roster. Chỉ thêm lựa chọn nếu có kết quả và callback làm được; không hứa NPC nhớ một quyết định chưa lưu.

Trong hub MMO, vị trí/chức năng và sinh hoạt nền dùng trạng thái chung ổn định. Lời thoại, badge hoặc cử chỉ phản hồi truyện theo hồ sơ là trình bày cục bộ cho người đang tương tác, do tiến trình server xác nhận; không biến lựa chọn một người thành thay đổi lịch sử hay nhiệm vụ của cả server. Không cho callback riêng dời NPC khỏi điểm cần thiết của người khác.

## 6. Asset cần làm và thứ tự sản xuất

**Ưu tiên ART mới nhất của owner:** quái/tinh anh trước NPC/boss; 11 identity Pixel01 đã có neutral Đông Nam, chờ duyệt trước hướng/action tiếp. Các wave tổng dưới đây giữ đúng kế hoạch owner, không tự khởi động 14 bộ animation.

1. **P0:** bốn NPC trục truyện và Tam Ấn Khôi Lỗi theo basis hiện hành; NPC chốt silhouette/áo/vật cầm ở native trước idle/talk. Giữ bốn station ID và receipt.
2. **P1:** Bạch Chỉ, Tống Thiết, Hứa Hành, Đinh Sóc, Kỷ An và Phùng Dã; song hành Vân Nha Lang/Phù Mộc Tinh/Lang Tuần Sơn/Lang Vương theo plan. Một dịch vụ, một nhân vật sinh hoạt và wolf/king được kiểm concept trước full sheets.
3. **P2/P3:** P2 đa dạng mechanic quái; P3 mở bốn NPC Wave B, Cổ Lâm/U Niệm/hai boss truyện cùng hợp đồng liên quan. Không kéo dịch vụ tương lai vào nhập môn chỉ để lấp map.
4. **Placement và tích hợp:** đo đế, lối tiếp cận và route trên fixture; ghép hoạt động có thật rồi mới mở liên kết tương tác. Tính năng chưa nối hiển thị “Chưa mở”, không đặt nút giả có vẻ dùng được.

Nguồn ART theo [Vân Ngọc V2](HANG-NHAC-VAN-NGOC-BASELINE.md), quy trình người theo [chuẩn actor](design/characters/actor-animation-standard-v2/README.md) và [pipeline nghiên cứu](ACTOR-ART-REFERENCE-STUDY.md). Giữ morphology của từng actor; frame/anchor tham chiếu người 64×96/(32,88), padding hoặc vật cầm phải đo lại. Không sao chép Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển thành dân cư nền. Concept, animation, native export và runtime là các mốc riêng; tài liệu này không tự duyệt ART.

## 7. Tiêu chí để map bớt trống

- Từ tuyến nhập môn gặp ít nhất một cụm sinh hoạt có việc rõ; khoảng trống phục vụ di chuyển, không rải NPC đều khắp map.
- Nhận ra các vai trong wave đã mở theo silhouette/vật cầm ở camera 1×; tìm đúng NPC chức năng từ tracker và điểm tương tác ổn định.
- HN04 vẫn một lượt liền mạch; đế phục vụ hoàn tất tại chỗ. Bổ sung NPC không tăng số lần mở/đóng hội thoại bắt buộc.
- Có ít nhất một quan hệ quay lại và một lời đáp dựa trên việc người chơi đã làm; không dùng hội thoại ngẫu nhiên thay cho hệ quả.
- Kiểm overlap, đường đi, ưu tiên E, reconnect và tiến trình bằng fixture khi tích hợp; không test trên save/map/draft của owner.

**Phạm vi tài liệu:** bổ sung thiết kế NPC/sinh hoạt và vị trí theo khu. Chưa thêm NPC, clip, placement hoặc gameplay vào bản chơi; chưa gọi API ART, mở market/offline/economy hoặc thay dữ liệu owner.
