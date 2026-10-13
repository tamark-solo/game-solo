# Cụm quái · review body/VFX02

13/10/2026 · Owner đánh giá VFX02 tốt và muốn thử nhóm quái trước khi triển khai game. [Sân cụm](cluster.html#preset=escort&actor=jade-guard&count=6), [sân từng con](index.html). Chỉ presentation fixture; không thêm spawn/AI/damage/loot hoặc đổi owner map/DB.

Ba kiểu cùng loài, hỗn hợp và tinh anh dẫn đàn; số3/6/9/12/18, độ tụ cụm rộng/vừa/chật. Escort có một leader Lang Tuần/Thiết Giáp/Phù Sư và họ thường tương ứng. Mixed có các loài và tinh anh để thử vật liệu/hình thuật khác nhau. Body/VFX/prop hiện hành nguyên byte, native1×/2×; không gen hoặc resize body mới.

**Đồng loạt** căn các mốc release, giữ body hold/FPS riêng. **Lệch nhịp** thêm start offsets rõ, không reset clip của con khác. Cảnh dùng tuổi tuyệt đối Core và period hữu hạn; idle giữa vòng, FX tail expire, hụt không contact, cancel trước release không phát thuật. Hội tụ nhắm vào cùng một điểm hit mẫu trên Vương Lâm để xem độ rối; không chứng minh range/collision/AI đang chạy. Cùng hướng dùng eight real views của body.

Ground shadow/warning/groundFX vẽ trước; body/player/airFX sort theo world-foot depth. Hand/core/lift giữ metadata riêng. Canonical **frame đang cần** dùng chung qua các instance, không tải cả atlas/mọi view cho mỗi quái. Cache decoded body/FX16MiB và evict/close; map/player cố định ngoài budget. Không suy thành tổng GPU/RAM hoặc khả năng MMO từ browser review.

## Đầy đủ và ưu tiên đọc trận

Đầy đủ giữ VFX02/opacity gốc theo tuổi. Ưu tiên đọc trận là **candidate presentation**: giảm FX quái thường; khi nhiều lớp giao thân, một cue tinh anh được ưu tiên với opacity tối đa0,55, các cue còn lại chia tổng budget0,28. Budget tổng tránh18lớp mỗi lớp30% vẫn cộng thành gần kín. Không cắt PNG, đổi body/socket/skill, giấu quái hoặc bỏ cảnh báo đòn. Cả hai chế độ dùng cùng body, nguồn và facts.

Số đo coverage lấy pixel alpha thân Vương Lâm≥128; chỉ command trước world foot, ground không tính. FX alpha tổng≥96, quái alpha≥128 tính là giao thân; tách body và FX. Đây là kiểm pixel tại frame/bố cục cụ thể, không tỷ lệ damage, nhận diện tự động, toàn bộ thời gian trận hoặc hiệu năng live. Labels metric ở sân cho xem trực tiếp.

## Kết quả và giới hạn

- Cụm6, spacing110, lệch nhịp: vẫn xem được body/họ thuật; phù hợp làm mẫu duyệt tiếp.
- Worst fixture18hỗn hợp, spacing64, salvo, t800ms: **FX giao92,5%** pixel thân; managed **63,8%**. Thân quái phía trước giao34,5% ở cả hai chế độ. Giảm FX không giải quyết người bị thân quái che hoặc tất cả cùng đứng/đánh tại một điểm.
- Đây là cảnh gây áp lực, không là formation/cơ chế đã chốt. Trước live cần luật khoảng đứng/tiếp cận, dàn nhịp đòn, telegraph và budgetFX theo tầm quan trọng; alpha budget ở đây chưa thay renderer game.

## Lưu ý khi ghép gameplay · thống nhất 13/10/2026

Owner yêu cầu phối hợp **giãn vị trí, dàn nhịp đòn và giới hạn FX chồng** khi ghép nhóm quái vào gameplay. Ba phần phải được kiểm cùng nhau: giảm opacity không xử lý được thân quái dồn đè lên người chơi, còn giãn vị trí vẫn có thể gây rối nếu cả đàn cùng phát đòn.

- **Giãn vị trí theo vai trò:** AI cần phân bổ điểm tiếp cận/đứng đánh phù hợp footprint và tầm đánh của từng loài. Quái áp sát chia vị trí quanh mục tiêu; quái đánh xa giữ tuyến sau; tinh anh có khoảng thể hiện riêng. Tránh cả đàn cùng chiếm một điểm hoặc cùng đuổi xuyên qua nhau. Khi mục tiêu di chuyển, đổi vị trí có kiểm đường đi/va chạm và giữ lối thoát để người chơi né. Giữ kích thước ART và navigation/blocker đã chốt; không thu nhỏ sprite hoặc sửa map để che việc dồn cụm.
- **Dàn nhịp đòn trên server:** điều phối số đòn đang báo trước/phát đòn trong một encounter, cho quái thường lệch nhịp và chừa khoảng phản ứng/hồi thế quanh chiêu tinh anh. Mỗi actor vẫn dùng timing/action Core riêng; client trình bày theo `serverTime`, không tự tạo lịch tấn công bằng timer ngẫu nhiên hoặc đổi FPS. Quy tắc khóa/theo dõi mục tiêu phải rõ và khớp báo đòn; không đổi hướng trúng bất ngờ sau khi đã khóa. Đòn đồng loạt cần là cơ chế chủ ý, có báo trước và khoảng né kiểm được.
- **Giới hạn FX theo vùng chồng và mức quan trọng:** ưu tiên cảnh báo nguy hiểm, phản hồi trúng đã xác nhận và chiêu chính của tinh anh; giảm hạt phụ, vệt trang trí và tàn khí trước. Kiểm alpha cộng dồn của nhiều lớp tại vùng người chơi, cùng số FX hoạt động/tuổi hết hạn, thay vì chỉ giới hạn opacity từng con. Giữ rõ body, điểm chân và dấu báo đòn; không bỏ cảnh báo, tạo hit giả hoặc trì hoãn hit server để giảm tải. Release/contact/cancel tiếp tục là facts riêng, dedup theo action/life và xếp lớp theo world foot.

**Trước tích hợp live:** kiểm cụm cùng loài/hỗn hợp/tinh anh ở camera native1×, chỗ rộng và hành lang hẹp; so đồng loạt/lệch nhịp, trúng/hụt/hủy và trường hợp trễ/reconnect. Đánh giá cùng lúc khả năng thấy người, đọc đòn và đường né; dùng coverage pixel như chỉ báo bổ sung. Debug cần lần lại encounter, actor/life/action, tuổi/phase, điểm đứng, mục tiêu và mốc release/hit cùng FX đang hoạt động/ưu tiên/giới hạn. Đo tải runtime trên thiết bị mục tiêu khi có integration; cache review không thay benchmark live. Dùng fixture, giữ map/DB/draft owner.

Số lượng3–18, spacing64/110/170, lệch nhịp173ms và opacity0,55/tổng0,28 là thông số **thử trong sân review**, chưa khóa thành luật AI, combat hoặc ngưỡng đạt của gameplay. Việc chốt giá trị phải dựa trên encounter thực; lưu ý này chưa triển khai các luật vào runtime.

Kiểm15tổ hợp group/count,11loài/3leader, salvo/stagger/converge/parallel, trúng/hụt/cancel, toggles,1×/2× map/sáng/tối, chạy18con, cache/lifecycle/mobile; không API/storage writes. Source hashes verify riêng cùng bộ body/VFX02. [Biên bản](../../../data/monster-cluster-2026-10-13.json).

```powershell
npm.cmd run test:monster-cluster-review
python scripts/verify-monster-vfx-v2.py
npm.cmd run typecheck
```

Scripts chỉ dùng fixture5228 và output `artifacts/monster-cluster/`, không backend/DB/map builder. Không tạo hoặc import ART mới. Người dùng xem hình và chọn cách đọc trận; test không suy crowd/live ART approval.
