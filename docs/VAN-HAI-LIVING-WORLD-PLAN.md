# Vân Hải · dàn NPC, quái và boss

**Cập nhật ART13/10:** owner yêu cầu tạo quái và tinh anh trước NPC/boss. [Pixel01](design/characters/van-hai-monster-concepts-v1/index.html) đã có11identity (8quái/3tinh anh), mỗi mẫu một neutral Đông Nam, nguồn/prompt/input/hash/native và sân so Vương Lâm/map1×/2×. `concept` trên11record trong plan nối gói art. Candidate chờ duyệt hình; chưa sản xuất bảy view/năm action hoặc đưa vào gameplay. Nội dung/production waves dưới đây giữ kế hoạch tổng; ưu tiên art mới được áp trước các wave ấy.

**13/10/2026 · GDD 0.32 · brief concept trước.** Owner chọn chốt dàn nhân vật và kịch bản trước khi thêm vào map. [Trang duyệt](design/world/van-hai-living-world-v1/index.html) / [plan.json đầy đủ](design/world/van-hai-living-world-v1/plan.json). Tên, tạo hình, vùng xuất hiện và cơ chế mới là ứng viên thiết kế; runtime/ART không được đổi trong đợt này.

## Nền và mục tiêu

Runtime có bốn station `guide/cultivation/training/preparation`, dùng tên chức trách và hai hình đệ tử. HN01–HN12/EX01–EX04 đã chạy; Lang02/Khôi Lỗi02 là basis ba vai đối luyện. Hằng Nhạc là hub sinh hoạt; farm ở ngoại vi, khảo nghiệm ở phiên riêng. Hồ sơ `ENCOUNTERS.md` và `ENCOUNTERS-STORY-REFERENCE.md` là lịch sử, không kéo combat tự chạy/ENC cũ trở lại.

Bổ sung **người có việc → việc được nhìn thấy → việc đổi nghĩa theo hành trình**. Thú/tu sĩ/construct/linh thể có lý do xuất hiện và bài học khác nhau. Mạch tối được gợi qua dấu ấn/dư niệm; quyền Đọa Ma vẫn từ Hóa Thần và phải có luật riêng. Baseline hiện hành HP/MP100, đi80/Shift120, Phong160; các số HP120/110, đi160 trong tài liệu thử cũ không là luật đang chạy.

## Reference và phần học được

| Nguồn chính thức | Điều áp dụng |
| --- | --- |
| [Tru Tiên PC · luyện khí/NPC nghề, 18/09/2009](https://zhuxian.wanmei.com/infostation/xtjs/zbxt/20090918/25301.shtml) | NPC nghề nối vật liệu với trang bị và kết quả nhìn thấy; Tống Thiết giữ nhánh vật→pháp khí với nguồn–chi thật khi triển khai. |
| [Vấn Đạo Mobile · nhiệm vụ sư môn](https://wd.leiting.com/home/game/game_data.php?level=2&level_id=50&show_type=1) | Thầy giao việc→ra ngoài trải nghiệm→trở về; giữ đầu mối chính, bổ sung người chứng kiến ở tuyến phụ. Daily, nếu có, cần nguồn riêng. |
| [Tru Tiên PC · Thiên Đế Bảo Khố, 25/10/2024](https://zhuxian.wanmei.com/net/241018show/index.html) | NPC dẫn tuyến và các boss tạo diễn biến nối nhau; mỗi trận thay đổi tình thế, không chỉ tăng HP. |
| [Vấn Đạo Mobile · Thượng cổ yêu vương](https://wd.leiting.com/home/game/game_data.php?level=2&level_id=84&show_type=1) | Boss từ khám phá cần quyền tham gia/nhận thưởng; prototype solo trước rồi chốt ruleset farm chung/nhóm. |
| [Tru Tiên Mobile · nhiệm vụ khám phá, 01/08/2017](https://zx.wanmei.com/data/mobile/xd/ycrw/20170801/205207.shtml) | Việc nhỏ quanh NPC tạo chuyện bên chính tuyến: kiểm dược, so dấu, đọc vật, nghe lời có nguồn. |

Nguồn là tài liệu lịch sử của nhà phát hành, không khẳng định luật/client hiện nay. Tên, artwork, kịch bản và kinh tế Vân Hải được biên tập riêng. Các câu thoại trong plan là sáng tác mới.

## Dàn NPC và sinh hoạt

| NPC đề xuất | Vai / nhận diện | Wave |
| --- | --- | --- |
| Trần Duy | Tiếp dẫn; áo xám ngà, bảng ngọc/thẻ môn phái. Giữ `guide`, HN01/11/12. | A |
| Diệp Tĩnh | Giảng sư vận khí lớn tuổi; tóc muối tiêu, áo xanh khói, trúc giản. Giữ `cultivation`. | A |
| Tạ Kiếm Sơn | Giáo tập; tay quấn vải, mộc kiếm cũ, sẹo mày. Giữ `training`, HN03–05/09/10. | A |
| Tô Nhược | Tư Vật Các; sổ dây đỏ đất, hộp niêm, tạp dề ngà. Giữ `preparation`, HN06/08 và EX. | A |
| Bạch Chỉ | Dược sư; kiểm lá/dược, giỏ và chày ngọc; nối nguồn dược, vật tư/luyện chế. | A |
| Tống Thiết | Luyện khí sư; áo tro/kìm/phôi; xem độ ổn định vật, nguồn–chi nâng cấp tương lai. | A |
| Hứa Hành | Người giữ tuyến từ văn bản HN/EX; áo vá, bùn giày, ống bản đồ/dây niêm; nhân chứng. | A |
| Đinh Sóc | Hộ sơn; thương thấp, giáp nhẹ/thẻ tuyến; lối ngoại vi và đường quay về. | A |
| Kỷ An | Đệ tử vận khí; đặt bầu nước→đọc giản→tự sửa nhịp thổ nạp. | A, sinh hoạt |
| Phùng Dã | Đệ tử luyện kiếm; hiếu thắng, biết phục kỹ năng thật; chỉnh thế và nghỉ tay. | A, sinh hoạt |
| Lục Văn | Thủ thư; áo mực/ngà/trúc giản; Đạo đồ và một trang tư liệu ấn bị thiếu. | B |
| A Ly | Người coi linh thú; túi thức ăn/găng/chuông; sinh cảnh, nhánh thuần dưỡng về sau. | B |
| Mạc Bà | Trà đình; ấm/khăn/áo màu ấm; lời đồn có nguồn, chuyện người trở về. | B |
| Tiểu Nghiên | Người đưa tin; túi thư/thẻ tuyến; gấp thư và đọc sổ, patrol sau duyệt route. | B |

Wave A có8 đầu mối hướng dẫn/chức năng +2 đệ tử sinh hoạt. Wave B có4 vai khi nội dung tương ứng cần. Tên bốn NPC cũ là lớp nhận diện đề xuất; stationId/receipt không đổi. Thoại Tư Đồ Nam vẫn thừa nhận tri thức và nói về ổn định hiện diện; Lý Mộ Uyển tự chuẩn bị được.

Plan có từng câu chào, tính cách, phản ứng theo facts, chuyện nhỏ và art brief. Ví dụ giáo tập: “Né được một đòn chưa phải giỏi. Biết khi nào nên tiến, khi nào phải lui mới giữ được mạng.” Hứa Hành đọc nhánh report-first/repair-first đã lưu; gặp ông không cấp lại thưởng.

Gesture tại chỗ trước patrol. Giới hạn lời thoại quanh tuyến: ưu tiên người gần, có khoảng nghỉ, không đồng thời phủ map bằng bong bóng. Tin đồn chưa chứng minh được ghi là lời nghe kể. Minimap ưu tiên đầu mối đang cần, người sinh hoạt hiện tên khi tới gần. Marker nét đứt trên review là **khu gợi ý**, chưa là spawn hoặc đường đi; không sửa blocker, bậc thang, map/draft owner.

## Quái thường và tinh anh

| Họ | Sinh cảnh / nhịp | Điều người chơi học |
| --- | --- | --- |
| Vân Nha Lang | Rìa đường; hạ vai→khóa hướng→chồm→ghìm chân | Né ngang và phản công; Lang02 làm basis. |
| Phù Mộc Tinh | Dược cốc; lá/phù dựng vòng→tia→thu rễ | Đọc điểm/hướng, chủ động tiếp cận. |
| Ngọc Giáp Trùng | Bãi ngọc; khép giáp→lao→xoay chậm | Góc đánh và cửa mở giáp. |
| Mặc Dực Bức | Lạch mực; lượn→khóa điểm→bổ hụt | Ground shadow/quỹ đạo; lift tách hit. |
| Khôi Lỗi Rạn Ngọc | Di tích; giơ tay→quét→nạp ấn | Đợi hồi thế, không tự flinch ngắt warning. |
| Thực Linh Khuẩn | Dược cốc ẩm; mũ rung→vòng bào tử→lộ thân | Giữ lối đi, không tham damage trong vùng. |
| Tán Tu Hắc Phù | Tuyến xa; phù→tia→lùi, gần thì dao ngắn | Đọc intent tu sĩ; khác quyền player/PvP. |
| U Niệm | Cổ Lâm; lõi dừng→tia→mở dải mực | Nhận nguồn đòn giữa nhiễu; không cấp Đọa Ma. |
| Lang Tuần Sơn · tinh anh | Gọi bầy có báo, rồi chồm | Chọn thứ tự mục tiêu; adds cần caps/credit riêng. |
| Thiết Giáp Linh Trùng · tinh anh | Khép–lao–mở giáp | Nhịp và posture thay vì chỉ tăng HP. |
| Phù Sư Hắc Lụa · tinh anh | Hai điểm ấn→tia theo đoạn nối | Đọc vùng đã khóa và tìm hành lang thoát. |

8 vật liệu ứng viên có nơi dùng trong plan: Vân nha→chi tiết kiếm K1; mộc linh dịch→mực/nhựa phù; mảnh ngọc giáp→phòng vệ mới; mặc dực→công cụ lọc nhiễu; lõi rạn→cấu kiện pháp khí; bào tử→vật tư khu vực; mảnh hắc phù→giải mã/linh phù; tĩnh niệm tro→tịnh hóa/diện mạo sau. **Đây là nguồn–chi dự kiến, chưa drop hoặc recipe chạy.** Tách vật liệu farm mới khỏi6 nguyên liệu nhiệm vụ HN và nguồn hữu hạn EX.

## Kịch bản bốn boss

**Vân Nha Lang Vương — solo ngoại vi.** Hứa Hành kể bầy đổi tuyến; Bạch Chỉ tìm khí mực trên lông. Hai dấu quan sát dẫn tới đài đá, lang vương giữ mảnh phù mắc ở sườn. Tự bắt đầu trận → pha đường chồm/cửa thở gấp → pha vòng quét → chứng cứ giải thích bầy đổi đường → nguồn farm riêng. Gọi bầy là gói mở rộng sau; bản solo đầu chưa bắt xử lý adds. Silhouette vai/đuôi/dấu niêm mới, không phóng PNG wolf nhỏ thành boss.

**Tam Ấn Khôi Lỗi — chủ khảo HN10.** Giáo tập dùng ba ấn đo thân–khí–thuật; không đặt cao thủ canon làm boss bị học trò hạ. Chuẩn bị → chủ động mở pha → áp sát → thử nhịp thuật → line/circle/fan và double-line theo baseline → checkpoint/proof → xác nhận. Khôi Lỗi02/64clip làm basis; body104worldpx. Giữ cơ chế và thưởng hữu hạn HN10, không thêm puzzle nộp đồ/kill loot.

**Cổ Mộc Trấn Khí — địa hình/nhóm Trúc Cơ.** Trang Tàng Kinh dẫn tới cội giữ đường khí, ba rễ bị ấn làm lệch nhịp. Pha1 rễ mọc tuần tự; pha2 lõi phát tia qua hành lang; pha3 kết hợp hai dấu nhưng luôn còn lối thoát; cửa mở lõi cho tập trung đánh. Prototype solo geometry trước, ruleset nhóm sau. Rễ/VFX không sửa blocker map. Sau trận cây ngừng tấn công trong phiên, đọc ra dấu trùng báo cáo. Story proof và repeat party loot tách nguồn.

**Hắc Ấn Chấp Sự — tu sĩ/âm mưu Trúc Cơ.** Báo cáo, giấy niêm và trang thiếu dẫn tới người muốn độc giữ đường khí. Đối thoại → pha một thân/tia rõ → hai dư ảnh phù có ký hiệu tay khác nhau → vòng thu về có khe đi thường → lộ nguồn ấn → chương sau theo hồ sơ. Thân giữ tỷ lệ người Pixel02; khí/dư ảnh tách. Dư ảnh không tự thành actor gây damage/loot. Kết quả không chuyển người chơi nhập môn sang Đọa Ma.

Mỗi boss trong plan có7 beat, chiêu/dấu hiệu/đường đối phó, stage, body-height mục tiêu, reward policy và gói sản xuất. HP, damage, timing, quota/drop rate chưa khóa bằng brief concept.

## Core, công bằng và bàn giao ART

- Đòn: intent→báo→khóa hình/hướng→resolve→hồi thế. Không xoay mask theo người đã né; hit ART không tự ngắt intent. Tín hiệu có hình/pose, không chỉ màu.
- Đường né bắt buộc dùng đi thường80 px/s, xét chân8px, khoảng thoát, độ trễ và thời gian đọc. Shift/Phong là lợi thế; không tự tăng tốc/sửa map cho khớp đòn.
- Definition có ID/version/source; profile có quest/dialogue facts; room có entity/life/intent; Core/application quyết định quyền, writer giữ transaction, UI/ART chiếu facts.
- Farm mới cần activityId/sourceId/spawnLifeId, eligibility/cycle, quantity/binding/sức chứa, chết/rời/drop/restart và source–sink. Receipt HN/EX cũ giữ nguyên. Một hồ sơ không đổi NPC toàn server.
- Dịch vụ mới nối sổ/luyện chế/hành trang thật khi triển khai. Mount, cường hóa, PvP, chợ/hộp thư và relationship mở cùng gói tương ứng; không phát quyền từ animation/đọc thoại.
- Người dùng Pixel02; logic64×96/chân(32,88), source pose rộng112×96/chân(56,88), body tối đa80worldpx/camera1×. Giữ tỷ lệ đầu/thân; nghề/tuổi phân qua tóc, áo, dáng, vật cầm. Quái/boss có frame/pivot riêng đo sau xuất. Height trong plan là mục tiêu concept.
- NPC đầu idle/talk; quái5action; boss5nền+appear+2–3skill; tám hướng thật cùng scale/world-foot. Weapon/aura/warning/impact/shadow tách layer. Trung tính/native duyệt trước full sheets; không làm14 NPC full bộ một lượt.

## Thứ tự sản xuất và catalog

P0: bốn NPC trục truyện +Tam Ấn. P1: bốn vai hỗ trợ/hai đệ tử +wolf/caster/lang vương. P2: giáp/dơi/nấm/construct/tán tu và prototype các mechanic mới. P3: NPC waveB, Cổ Lâm/U Niệm/hai boss truyện, luật nhóm và nguồn–chi.

Gói concept đầu đề xuất **Trần Duy, Tạ Kiếm Sơn, Bạch Chỉ, Hứa Hành +Vân Nha Lang/Lang Vương/Tam Ấn**, để chốt người/tuổi/nghề, sinh vật và construct. Khi sản xuất đọc skill `game-actor-animation-production` và ImageGen, giữ neutral/input/prompt/metadata/phép đo; owner duyệt hình riêng.

Catalog quản trị có96 record:56 cũ +14 NPC +15 encounter +8 material +3 scene/map design. 40 hàng mới `unreleased/pending`, selector trỏ vào plan và `runtimeConsumable=false`. Quan hệ grants là nguồn dự kiến để tra cứu, không grant runtime. Party/loot/relationship còn cần đặc tả. Bốn `existingStationId` giữ vai code; danh tính mới không bị ghi là đã triển khai.

Kiểm hồ sơ: catalog/source pointers96record/60quan hệ không lỗi;7 unit và5 nhóm admin/4 viewport qua. Trang review qua tìm không dấu, chọn marker/NPC,11 quái-tinh anh,4 boss/bảy beat, reference/wave, mobile và không API/storage write. Typecheck/boundary qua; [biên bản](data/living-world-design-2026-10-13.json) ghi counts/hash/ảnh. Cảnh báo pending trong catalog phản ánh các quyết định chưa khóa, không phải duyệt ART hoặc balance.
