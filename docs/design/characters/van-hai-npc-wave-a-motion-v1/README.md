# Sáu NPC Wave A — motion Đông Nam V1

Owner nhận xét **“nhìn tốt đó, bắt đầu sản xuất các animation nào”** với [sáu neutral đã duyệt](../van-hai-npc-wave-a-concepts-v1/approval.json) ngày13/10/2026. Gói mới này đã sản xuất **Bạch Chỉ, Tống Thiết, Hứa Hành, Đinh Sóc, Kỷ An và Phùng Dã**, trước hết ở hướng Đông Nam: **idle/talk/cử chỉ nghề,6frame mỗi clip,18clip/108pose**. Sáu nguồn18pose đã tạo thật, được xem từng pose và đóng canonical/atlas. Motion mới đang chờ owner đánh giá trên trang playback.

[Trang playback](index.html) đối chiếu action với Vương Lâm live và own neutral đã duyệt, có native1×/integer2×, nền map/sáng/tối, timeline/frame/loop. Catalog chỉ ghi số clip/pose thực đã đóng, không dùng một ảnh tĩnh giả thành motion hoặc thay nguồn thiếu bằng NPC khác. Bảy view còn lại là bước sau khi xem pilot motion này; gói này chưa tuyên bố đủ tám hướng.

| NPC | Cử chỉ nghề trong pilot |
| --- | --- |
| Bạch Chỉ | Nhìn lá trong giỏ, nghiêng giỏ/chày ngọc nhỏ; giỏ và chày giữ đúng tay |
| Tống Thiết | Quan sát phôi mộc kiếm, chỉnh góc kìm/phôi và kiểm nhẹ; hai đạo cụ giữ đúng tay |
| Hứa Hành | Mở một phần giấy tuyến ở eo và kiểm niêm; giấy/ống/dây vẫn được giữ |
| Đinh Sóc | Nhìn thẻ tuyến, tay rảnh kiểm thẻ, cổ tay cầm thương chỉnh nhỏ; thương thấp luôn cùng tay |
| Kỷ An | Nghiêng/đọc trúc giản và sửa một nhịp thở khi đứng; bầu nước giữ ở hông |
| Phùng Dã | Chỉnh tay cầm/thế mộc kiếm, nhìn mũi kiếm, nghỉ cổ tay; kiếm cùng tay, không tấn công |

Kỷ An và Phùng Dã dựa trên loop authored trong [GDD](../../world/van-hai-living-world-v1/plan.json); các gesture nghề của bốn NPC đầu được biên soạn từ vai trò/đạo cụ và ghi origin trong [production plan](production-plan.json). Pilot Kỷ An giữ đứng/đọc/thở, chưa đặt bầu nước hoặc ngồi xuống. Tất cả talk dùng mouth/nod/shoulder nhỏ với tay giữ ở thế nghỉ, để tránh mất đạo cụ khi vẫy tay.

## Chuẩn hình và hợp đồng

Mỗi sheet dùng **Image1 Vương Lâm Pixel02 live Đông Nam PRIMARY anatomy/camera/pixel/style**, **Image2 chính NPC neutral đã duyệt enlarged nearest8x**, **Image3 chính raw đã duyệt hỗ trợ nhận diện/phục trang/đạo cụ**. Mặt/tóc/skull/anatomy/áo/đạo cụ của NPC được khóa qua cả ba hàng; không có chuỗi NPC→NPC làm chuẩn phong cách. [Basis live](../van-hai-npc-visual-standard-v1/basis.json) và [hướng thật](../van-hai-npc-visual-standard-v1/directions.json) pin frame thực từ atlas game.

Body người giữ base64×96/chân(32,88)/đứng80px. Motion96×96/chân(48,88) chỉ thêm padding ngang. Một scale cho cả source đo từ neutral hàng1frame1; không resize/deform từng pose để che sai anatomy. Gật đầu/nhìn xuống có thể làm bounds chiều cao thấp tự nhiên; height80 không tự chứng minh tỷ lệ đầu/thân. Boots xác định world root; đáy thương hoặc vạt áo không thay chân.

Đinh Sóc cần [boot witnesses](review/dinh-soc-boot-witnesses.json) riêng vì mũi thương thấp hơn đế giày. Strip cuối đã đăng ký theo bootsole, cùng một scale80/(421−77); mũi thương còn2–4px dưới ground trong padding. Lỗi proposal đầu lấy đáy thương đã sửa bằng phép đo, không vẽ lại source hoặc fit pose.

Sheet6cột×3hàng: idle6/talk6/profession6. Idle và talk1200ms/loop; profession1500ms/one-shot rồi trở lại neutral. Nhịp trình bày không phát lệnh hoặc xác nhận gameplay. Body không chứa qi, lửa lò, kiếm quang, shadow hay damageFX.

## Nguồn, kiểm và phạm vi duyệt

[Approval neutral](../van-hai-npc-wave-a-concepts-v1/approval.json) pin45file, áp sáu tạo hình tĩnh Đông Nam; đã đối chiếu nguyên trạng khi chuẩn bị motion. Approval đó cho phép bắt đầu sản xuất animation, không tự duyệt motion mới. [Visual audit](review/source-assessment-audit.json) xem108rawpose và108nativepose, exactsource/hash cho từng NPC, ghi candidate cùng giới hạn. Root confirmation/alpha/canonical/atlas/GPU là kiểm kỹ thuật riêng.

Hiện chưa có quyết định owner ART/motion cho18clip mới hoặc runtime integration. Bảy view mới và số lượng144clip/864pose của bộ đủ ba action×tám hướng chỉ là phạm vi tiếp nối về sau. Gói không sửa station/service, receipt, gate permission, map/blocker/navigation, nhiệm vụ, save hoặc DB.

| Kiểm | Trạng thái |
| --- | --- |
| Sources | 6sheet thật,18pose/source; raw/request/prompt/input/metadata giữ nguyên |
| Visual | 108pose raw và native2× đã xem,6source candidate; giới hạn ở assessment |
| Canonical/atlas | 108frame và108pose contact đã đối chiếu; không mất pixel opaque hoặc paint RGB |
| Browser | 162cảnh nền/zoom,18clip phát thật,6identity reference,12loop wrap và6one-shot qua; mobile390, pause/seek/action reset và hidden/offline/reduced motion qua |
| Three | 108frame/18clip qua WebGL nearest/alpha/UV/pivot, maxColorDelta0 |
| Baseline | 45pin neutral mới,107pin pilot bốn NPC V1 và9pin delivery V2 giữ nguyên |
| Owner motion/runtime | Chưa duyệt motion mới/chưa import runtime |

[Browser evidence](review/verification.json), [GPU evidence](review/gpu-verification.json) và [bàn giao theo hash](review/delivery.json) lưu số lượng thực cùng phạm vi duyệt. Vương Lâm trên review giữ nguyên RGBA từ frame live. Trang preview dừng và giữ thời gian khi ẩn/offline/giảm chuyển động; đổi preference ngay khi đang phát đã được kiểm, không cần reload. Kiểm kỹ thuật không xác nhận ART/motion.

Tooling chỉ ghi gói mới: prepare.mjs chuẩn bị plan/input và chặn ghi đè; generate.mjs gọi router theo request rõ; inspect.mjs dựng guide; root-review/confirm-registration ghi phép đo chân; pack.mjs giữ một scale/source và đóng PNG/atlas; verify/verify-gpu kiểm preview. Các MCP plan đã lưu trước POST. Router gpt-image-2 request1536×1536/high; cả sáu nguồn thực1254×1254, đo theo kích thước thực và lưu metadata. Sáu POST thành công, không gửi lại; quyền JSON retry trước chỉ áp motion V2 cũ.

Các giới hạn đã biết: chi tiết giỏ/chày/kìm/giấy/trúc giản rất nhỏ ở native; shape/angle đạo cụ đổi nhẹ giữa pose; tuổi nhìn còn trẻ ở một vài identity đã chấp nhận; Phùng Dã profession4 đặt lowguard qua eo hơi nhiều hơn brief wrist-only. Pose cuối nhìn gần neutral, không tuyên bố pixel-equality chỉ từ quan sát. Các giới hạn không được che bằng resize pose hoặc gameplay.
