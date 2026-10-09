# Đối thủ và khảo nghiệm nhập môn Hằng Nhạc

**Phiên bản:** 0.1 · **Ngày:** 08/10/2026 · **Trạng thái:** đề xuất thiết kế để đánh giá; chưa có AI/combat/checkpoint được triển khai.

**Tham chiếu:** [GDD 0.28](GDD.md), [trải nghiệm Hằng Nhạc](HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay R01](NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), [backlog](MVP-BACKLOG.md), [bàn giao VFX](design/vfx/STARTER-VFX-HANDOFF.md).

## 1. Phạm vi và mục tiêu

Đặc tả ba mẫu **HN-E01 áp sát, HN-E02 thi triển, HN-E03 chủ khảo** và phiên cá nhân **HN10 gồm ba pha**. Người chơi thấy dấu hiệu, chọn vị trí/thời điểm rồi dùng năng lực nền để vượt bài. Độ khó đến từ phối hợp và nhịp đối thủ, không chỉ tăng HP hoặc che màn hình bằng hiệu ứng.

Đã chốt từ GDD: ba nhân vật chọn từ đầu, có cùng bộ R01, tự hoàn thành nhập môn được; phân hóa sâu sau map. Mẫu AI, hình học đòn, số liệu, điều kiện thắng, checkpoint và timeout trong tài liệu này đều là **đề xuất mới**, chưa là luật đã duyệt hoặc danh tính nguyên tác.

Tên áp sát/thi triển/chủ khảo là vai trò thiết kế. Có thể dùng đối thủ người/đối luyện có tạo hình chibi phù hợp môn phái; tên, diện mạo và nguồn NPC phải biên tập trước ART. Không gán một cao thủ canon làm boss bị người chơi nhập môn đánh bại theo stat này. Đối thủ có di chuyển/phản ứng hit; impact không mặc định phá bia đá.

## 2. Nền người chơi dùng để cân bằng

HN05 dùng baseline trước M02: HP 100, linh lực 100, sức mạnh 10. HN10 dùng **M03 đã xác nhận**: HP 120, linh lực 110, sức mạnh 12. M04 là phần thưởng sau khảo nghiệm, không cấp trước để thắng HN10.

| Công cụ | Giá trị thử liên quan | Giới hạn cần giữ |
| --- | --- | --- |
| Đòn thường | 1.0 × sức mạnh; 0 linh lực; cự ly 90; hồi giữa đòn 0.8 giây | Cạn linh lực vẫn có đường thắng |
| Kiếm Khí | 3.0 × sức mạnh; 10 linh lực; cooldown 1.5 giây; tầm 360 | Một projectile/mục tiêu, không xuyên/homing |
| Lôi Ấn | 4.5 × sức mạnh; 25 linh lực; cooldown 5 giây; tầm 280 | Mục tiêu đã chọn tại điểm khóa; không AoE/stun |
| Ngự Phong Bộ | 10 linh lực; cooldown 3 giây; lướt tối đa 160 | Không invulnerability/xuyên tường, vị trí theo host |
| Đi bộ | 160 world px/giây | Mọi đòn bắt buộc có phương án né bằng đi bộ |
| Ngọc hộ thân thử | 15 linh lực; cooldown 12 giây; cửa sổ 1 giây | Giảm 50% một hit, không chặn cả combo |

Hồi linh lực và luật cast/cancel theo hồ sơ gameplay. Không hồi HP thụ động trong pha đang đánh; vật tư hồi 30 HP chỉ dùng ngoài combat. Cả ba dùng cùng collider/thông số; linh thể Tư Đồ Nam không tự miễn damage, Lý Mộ Uyển không cần một người chơi khác hỗ trợ.

## 3. Sân khảo nghiệm và hình học va chạm

World tham chiếu **960×640**, thân nhân vật giữ tối đa **80 world px** theo bàn giao. Khung là vùng nhìn tham chiếu, không là toàn kích thước map MMORPG. Arena HN10 đề xuất mặt đất đi được trong hình chữ nhật **x=120…840, y=140…540**, đủ chỗ thử khoảng cách mà giữ actor trong vùng nhìn.

| Thành phần | Giá trị thử / quy tắc |
| --- | --- |
| Collider người chơi | Vòng chân bán kính 18 world px, chung bộ ba; tâm actor cách biên arena tối thiểu 18 |
| Collider E01 / E02 / E03 | Bán kính chân 20 / 18 / 24; thân/đầu/glow không là collider |
| Spawn người chơi | Điểm chân (280, 400), ngoài vùng báo đòn |
| Spawn đối thủ mỗi pha | Điểm chân (620, 320), đợi người chơi xác nhận bắt đầu |
| Vật cản | Arena bản đầu không có vật cản bên trong; đạo cụ trang trí ngoài vùng đi |
| Cổng / biên | Không vượt bằng Phong; xử lý dừng trước biên hợp lệ |
| Khóa di chuyển actor | Không chồng vòng chân; AI không đẩy người vào góc hoặc dịch chuyển qua họ |

Mọi đòn đất dùng mask world cố định sau lúc khóa; damage chỉ khi mask giao collider hợp lệ tại thời điểm resolve. Khoảng cách/va chạm nằm trên mặt đất theo chân actor; socket tay/đầu và độ cao của artwork là offset trình bày. Không đưa offset tay trên ảnh vào đường hit mặt đất khiến projectile bay lệch collider chân. Projectile Kiếm kiểm đường chuyển động/va chạm, tránh xuyên qua mục tiêu giữa các tick. Lôi của người chơi chỉ kiểm mục tiêu đã chọn; đòn vùng của AI có định nghĩa riêng, không đổi Lôi R01 thành AoE.

Trước chọn một đòn AI, kiểm có đường đi bộ tránh được từ vị trí người chơi trong thời gian còn lại sau khóa, xét biên/collider. Nếu không có, đổi đòn hoặc lùi/chọn lại vị trí **trước telegraph**; không bí mật sửa vùng sau khi đã khóa. Điều kiện này cần kiểm hình học/prototype, không suy rằng sân rộng tự bảo đảm mọi góc đều công bằng.

## 4. Vòng hành vi AI chung

**Chờ bắt đầu → định vị → báo đòn → khóa hình học → resolve → hồi phục → chọn hành động tiếp.**

| Trạng thái | AI làm gì | Người chơi thấy/làm được gì |
| --- | --- | --- |
| Chờ | Không tấn công/đuổi, giữ spawn | Xem mục tiêu và xác nhận bắt đầu |
| Định vị | Đi tới cự ly hợp lệ, không teleport | Chủ động giữ khoảng cách/đánh theo trạng thái hợp lệ |
| Báo đòn | Dừng chân, báo loại/vùng; chỉ theo hướng/vị trí người chơi trong phần đầu đã định | Nhìn dấu, tránh vùng hoặc chọn công cụ |
| Đã khóa | Không xoay theo/chuyển điểm đánh nữa | Đường né dự đoán được |
| Resolve | Xét một hit hoặc từng pulse đã công bố | Damage/impact theo xác nhận host |
| Hồi phục | Không phát đòn mới; dễ tiếp cận/thi triển Lôi | Cửa sổ phản công, không cần stun |
| Bị hạ / kết thúc | Hủy đòn chưa resolve và mục tiêu AI | Chốt pha, dọn vùng nguy hiểm |

Không RNG chọn chiêu trong baseline; dùng chu kỳ dễ đọc. AI bị trúng vẫn nhận damage nhưng không flinch/stun tự động cắt telegraph; phản ứng ART không đổi trạng thái combat. Bị hạ mới hủy các hit chưa resolve. Không có AI nhắm vào tàn ảnh Phong hoặc quay 180° lúc resolve để bắt người đã né.

Mỗi actor AI chỉ có một hành động tấn công đang chạy. Đòn mới không chồng vùng cũ; pulse kép ở boss là hai lần resolve của cùng hành động đã báo. Bản đầu không có add, triệu hồi hoặc đạn bay riêng của AI; đòn enemy trong hồ sơ là resolve theo mask.

## 5. HN-E01 — đối luyện áp sát

**Bài học:** đọc hướng chém, giữ khoảng cách, phản công sau đòn hụt. Dùng tại HN04/05 và pha 1 HN10; bài an toàn HN04 có chế độ không gây thất bại thật, không thưởng kill.

| Thuộc tính | Giá trị thử |
| --- | --- |
| HP / damage | 60 / 10 mỗi đòn hợp lệ |
| Tốc độ tiếp cận | 110 world px/giây |
| Cự ly bắt đầu đòn | Tâm chân cách người chơi ≤85; không bắt đầu nếu đường tiếp cận/vùng không hợp lệ |
| Hình học E01-A1 | Quạt chém bán kính 90, góc mở tổng 70° từ chân/hướng AI |
| Tổng báo đòn | 0.8 giây; theo hướng trong 0.2 giây đầu, khóa từ t=0.2 |
| Resolve / hồi phục | Một lần tại t=0.8; hồi phục 1.2 giây từ resolve |
| Chu kỳ | Tiếp cận → A1 → hồi phục → đánh giá khoảng cách; không combo thêm |

AI không đi trong windup/recovery. Người chơi có thể lùi khỏi cự ly hoặc đi ngang khỏi quạt rồi đánh; Phong là lựa chọn nhanh hơn, không bắt buộc. Kiếm có thể đánh khi AI tiếp cận; Lôi nên dùng trong lúc AI đứng thi triển/hồi phục để tránh miss do mục tiêu di chuyển.

Ở baseline đầu map, hai Kiếm trúng = 60 damage, hoặc sáu đòn thường trúng = 60; đây là đối chiếu số học, không phải thời gian hạ đã đo. Trong HN10 tại sức mạnh 12, hai Kiếm =72, năm đòn thường =60; không tăng HP E01 riêng để phủ nhận tiến bộ của người chơi.

HN05 bản đầu đề xuất lần đối luyện cá nhân được kích hoạt trên tuyến ngoại vi, trở về khu chung sau kết quả. Chủ dự án chốt ngày 08/10/2026 rằng ngoại vi/farm là scene riêng nối khu môn phái; cấu trúc scene này không tự chốt mọi encounter là phiên cá nhân. Quyền tài nguyên nhiệm vụ theo hồ sơ, người ngoài không kết thúc trận thay mình. Đây là lựa chọn phiên nhỏ để kiểm lát A; nội dung combat chung/farm sau đó cần threat/credit/leash/loot riêng, không suy rằng mọi encounter MMORPG đều cá nhân.

## 6. HN-E02 — đối luyện thi triển

**Bài học:** đọc điểm/đường đã khóa, đi khỏi vùng, dùng cửa sổ hồi phục để phản công. Dùng tại HN06/07/09 theo biến thể bài học và pha 2 HN10; không gắn cùng lời dẫn cho ba nhánh nhân vật.

| Thuộc tính | Giá trị thử |
| --- | --- |
| HP / damage | 80 / 15 mỗi đòn hợp lệ |
| Tốc độ định vị | 90 world px/giây |
| Cự ly ưu tiên / nhận đòn | Giữ 180–240; chỉ bắt đầu đòn đất khi người chơi trong 360 |
| Chu kỳ | E02-A1 dấu tròn → hồi phục/định vị → E02-A2 đường phù → hồi phục/định vị; lặp |
| Báo đòn mỗi chiêu | 1.0 giây, theo mục tiêu 0.2 giây đầu, sau đó khóa |
| Hồi phục | 1.4 giây sau resolve; kế đó định vị tối đa 0.6 giây trước lần đánh giá tiếp |

| Đòn | Mask đã khóa | Resolve | Cách đối phó |
| --- | --- | --- | --- |
| E02-A1 — Dấu tròn | Vòng tròn bán kính 64 tại chân người chơi được chụp lúc t=0.2 | Một hit tại t=1.0, damage 15 nếu còn giao mask | Đi ra ngoài vòng, Phong hoặc hộ thân một hit |
| E02-A2 — Đường phù | Hành lang dài 320, rộng 56 từ chân AI theo hướng chụp lúc t=0.2 | Một hit tại t=1.0, damage 15 nếu còn giao mask | Đi ngang đường đánh; không chạy dọc đường nếu vẫn trong mask |

AI đứng yên trong báo đòn/hồi phục, không né theo input Lôi hoặc bắn thêm khi người chơi đã rời vùng. Nếu không vào được cự ly, định vị rồi đánh giá lại; không resolve đòn từ xa vượt thông số. Tín hiệu đất kết thúc sau resolve; không có DOT/hit bổ sung từ vòng sáng còn tan.

Khoảng thời gian từ khóa tới hit là 0.8 giây, đi bộ đi được 128 world px. Từ tâm dấu tròn cần hơn 64+18=82 để tránh giao collider; cộng lề thử 8 là 90. Với hành lang, khoảng ngang cần hơn 28+18=46, cộng lề thử 8 là 54. Các phép tính cho vị trí có đường thoát; vẫn phải kiểm trường hợp sát biên như mục 3.

## 7. HN-E03 — chủ khảo tổng hợp

**Bài học:** nhận ra chu kỳ, chủ động đổi vị trí và chọn lúc tấn công; dùng nguồn lực vừa đủ. Đây là vai boss của khảo nghiệm chuyển thể, chưa có NPC/tạo hình canon được khóa.

| Thuộc tính | Giá trị thử |
| --- | --- |
| HP / damage nền | 240 / 15 mỗi hit |
| Tốc độ định vị | 130 world px/giây |
| Nhịp A | Khi HP>120: đường phù → dấu tròn → áp sát → lặp |
| Nhịp B | Khi HP≤120 và còn sống: đường phù kép → dấu tròn → áp sát → lặp |
| Áp sát | Mask/báo đòn như E01-A1; damage đổi thành 15, hồi phục 1.0 giây |
| Dấu tròn | Mask/báo đòn như E02-A1; damage 15, hồi phục 1.2 giây |
| Đường phù đơn | Mask/báo đòn như E02-A2; damage 15, hồi phục 1.2 giây |
| Đường phù kép | Một mask hành lang như trên; hai pulse t=1.0 và t=1.6, damage 15 mỗi pulse; hồi phục 1.2 giây sau pulse cuối |

Đường phù kép báo **hai lượt** ngay từ đầu; mask khóa tại t=0.2 và giữ nguyên cho cả hai pulse. Người đã đi ngang ra khỏi hành lang không bị pulse sau tự bám theo. Hộ thân chỉ giảm hit đầu hợp lệ trong cửa sổ còn hiệu lực; nếu nhận cả hai thì không giảm hit thứ hai bởi cùng lượt hộ thân. Pulse có định danh riêng, không nhân hit theo số frame.

Tới lượt áp sát, AI định vị tối đa 0.8 giây; nếu chưa vào ≤85, thay bằng đường phù đơn có báo mới đầy đủ. Việc thay xảy ra trước telegraph, không đổi chém thành đòn xa ở frame hit. Tới lượt đòn đất cũng kiểm cự ly/vùng thoát, nếu chưa hợp lệ tiếp tục định vị; không có enrage/timer cưỡng bức thua trong baseline.

HP xuống ≤120 trong lúc đang đánh: hoàn tất hành động đã bắt đầu, sau recovery có tín hiệu đổi nhịp 0.6 giây rồi bắt đầu B. Tín hiệu không phát damage, không hồi HP hoặc tạo invulnerability cho boss; người chơi vẫn đánh được. Damage qua ngưỡng được giữ đầy đủ, không clamp về 120. Nếu boss bị hạ trước/đang đổi nhịp, chốt thắng theo luật pha; không bắt xem đủ B mới công nhận.

Đây là **hai nhịp của boss trong pha 3**, không thêm pha thứ tư của HN10. Độ phức tạp tăng bằng chu kỳ/pulse rõ; không tăng cỡ actor, nhân bản linh ảnh hoặc dùng ART Hóa Thần cho nhập môn.

## 8. HN10 — chuẩn bị và ba pha

Đề xuất điều kiện vào: HN01–HN09 và nhánh HN06 đúng nhân vật đã xong, M03 đã xác nhận, ngưỡng tương ứng tầng 15/hồi phục cuối, bộ R01 và pháp khí nhiệm vụ dùng được. Màn chuẩn bị nêu đủ điều kiện thiếu; không cần party, loot ngẫu nhiên, tiền hoặc có vật tư hồi phục trong túi.

HN10 luôn là phiên riêng ở bản đầu. Actor đối thủ/đòn không nhận damage từ người ngoài phiên; người chơi khác hoàn tất không mở checkpoint của mình. Pha trước đã qua được lưu để thử lại phần sau.

| Pha | Actor / bài | Mục tiêu hiển thị trước khi bắt đầu | Điều kiện qua |
| --- | --- | --- | --- |
| P1 — Vận dụng | Một E01 HP60 | “Đánh bại đối thủ. Đọc hướng chém và phản công.” | E01 HP≤0, người chơi HP>0, có hit tấn công hợp lệ được host ghi trong lần thử pha |
| P2 — Chuẩn bị và ứng phó | Một E02 HP80 | “Rời điểm/đường đã khóa. Dùng công cụ khi cần rồi đánh bại đối thủ.” | E02 HP≤0, người chơi HP>0; không bắt dùng Phong/hộ thân hoặc né hoàn hảo |
| P3 — Tổng hợp | Một E03 HP240, hai nhịp A/B | “Đọc chu kỳ chủ khảo và đánh bại bằng bộ nhập môn.” | E03 HP≤0, người chơi HP>0; không kiểm combo/điểm ẩn, không bắt boss biểu diễn hết chiêu |

Hit P1 có thể từ đòn thường/Kiếm/Lôi; không giới hạn kỹ năng hoặc bắt một cast thêm sau khi đã thắng hợp lệ. Điều này thay ví dụ P1 chỉ kiểm một thuật trong bản trải nghiệm trước: HN03 đã có bài thuật, khảo nghiệm đánh giá vận dụng thực tế. Số lần trúng/né/dùng công cụ được ghi để gợi ý, không là điểm chặn xuất hành.

Mỗi pha bắt đầu tại spawn, HP/linh lực đầy theo M03 và cooldown của bộ R01/pháp khí được reset trong phiên. Không reset stat/cảnh giới hoặc cấp quyền mới. Chuyển pha dọn cast/vùng cũ rồi đưa về chuẩn bị; người chơi bấm bắt đầu pha tiếp, không bị tấn công trong màn tổng kết. Actor đối thủ chỉ nhận damage khi pha đang chạy; lệnh combat nhắm actor của pha chờ bị từ chối trước tiêu hao. Không giữ projectile/cast từ ngoài phiên hoặc trước xác nhận để gây damage ngay lúc bắt đầu.

Vật tư thường trong túi không dùng trong combat. Ở điểm chuẩn bị đã hồi miễn phí, không cần tiêu đồ để thử lại. Baseline HN10 không phát thêm potion phiên vì chưa có bài bắt buộc dùng potion; nếu thêm bài về sau phải có luật cấp/thu hồi riêng. Chỉ kiểm pháp khí đã học/luyện hóa, không bắt tiêu thêm 4 nguyên liệu mỗi lượt vào HN10.

## 9. Checkpoint, thất bại và thoát phiên

| Trạng thái / sự kiện | Kết quả được lưu | Lượt tiếp theo |
| --- | --- | --- |
| Chưa qua P1 | Không có checkpoint pha thắng | Bắt đầu P1 |
| P1 thắng được xác nhận | Checkpoint P1, nhật ký kết quả | Bắt đầu P2 khi sẵn sàng |
| P2 thắng được xác nhận | Checkpoint P2, nhật ký kết quả | Bắt đầu P3 khi sẵn sàng |
| P3 thắng được xác nhận | HN10 hoàn tất, M04/điều kiện HN11 | Tổng kết; không chạy pha thưởng lần nữa |
| Bị hạ trong pha | Lần thử pha chưa đạt; checkpoint thắng trước đó giữ | Thử lại pha chưa qua, đối thủ HP đầy |
| Chủ động rời trong pha | Kết thúc lần thử đang chạy, không công nhận phần đánh dở | Quay lại checkpoint gần nhất đã thắng |
| Rời tại chuẩn bị giữa pha | Checkpoint giữ | Quay lại pha kế, không lặp pha đã qua |

Checkpoint gắn hồ sơ và phiên bản nội dung; không timeout/xóa vì đăng xuất thông thường. Phiên bản nội dung đổi phải có chính sách migration; không tự xóa HN10 đã hoàn tất. Khi thử lại một pha, spawn/HP/cast của đối thủ và người chơi đều theo khởi đầu pha, không giữ boss còn ít HP để farm kết quả.

Thất bại không mất tu vi, tầng, pháp khí hoặc skill. Không thu phí thử lại. Phản hồi nêu đòn/vị trí đã khiến bị hạ, gợi ý một hành động có thể thử; không trách nhân vật yếu hoặc bắt đổi sang người khác. Thời gian chơi dài chỉ gợi ý luyện/chuẩn bị, không tự fail ở một timer bí mật.

Nếu actor và đối thủ cùng HP≤0 sau một tick resolve, pha chưa đạt theo điều kiện phải còn HP>0; log nêu cả hai bị hạ. Damage trong tick giải theo thứ tự server xác định, không theo animation client; rule ưu tiên đồng thời cần hiện trong hồ sơ kỹ thuật và kiểm khi prototype.

## 10. Mất kết nối và clock riêng của phiên

Đề xuất khi server **phát hiện** mất kết nối trong HN10: lưu snapshot và tạm dừng mô phỏng phiên riêng tối đa **30 giây thời gian thực**. Không pause thế giới chung, không gọi hit-stop VFX để dừng clock MMO. Damage đã resolve trước lúc phát hiện vẫn giữ, không hoàn lại theo thời điểm client báo mất mạng.

Kết nối lại trong 30 giây tiếp tục đúng snapshot: HP/linh lực, vị trí, cast, AI, pulse còn lại, cooldown và thời gian resolve tương đối. Trong lúc pause không AI/damage/regen/tu luyện/offline reward. Không bù hàng loạt damage của khoảng vắng vào một frame khi trở lại.

Hết 30 giây: kết thúc lần thử pha đang chạy như thoát, giữ checkpoint pha thắng trước. Khi vào lại bắt đầu pha chưa qua đầy đủ. Đăng xuất để hồi phục không giữ HP thấp của boss; không tiếp tục đánh offline. Lần thử có định danh riêng, snapshot/cast cũ hết hiệu lực khi lần mới bắt đầu.

Mất mạng đúng lúc thắng: kết quả đã lưu quyết định checkpoint/hoàn tất. Nếu P3 đã ghi HN10, kết nối lại hiển thị tổng kết/M04; không phát thưởng/tiêu hao thêm. Policy pause/checkpoint là đề xuất cho HN10 riêng, chưa áp mặc định cho HN05 khu chung hoặc PvP.

## 11. Damage, projectile và hủy ở ranh giới pha

Hit lấy collider/vị trí tại resolve server; VFX/render không tạo damage. Mỗi hit cần định danh phiên, lần thử, pha, actor nguồn và cast/hit/pulse. Một swing/mask đơn chỉ damage một lần cho mục tiêu; hai pulse boss có hai hit hợp lệ, gửi lại pulse không hit thêm.

Kiếm đã release có thể tiếp tục tới hit/hết tầm nếu actor nguồn còn hợp lệ trong pha đó. Server xử lý nhóm hit của tick theo thứ tự ổn định rồi chốt kết quả pha sau nhóm đó; nếu người chơi bị hạ, kết thúc theo rule failure và dọn projectile/event của tick sau. Không để projectile muộn giết boss rồi đảo kết quả fail. Đối thủ bị hạ cũng hủy đòn enemy chưa resolve ở tick sau. Lôi đã release vẫn có lịch resolve trong pha còn chạy nếu người chơi còn hợp lệ; dọn khi pha kết thúc.

Ngọc hộ thân áp một hit chưa giảm, không hồi damage cũ. Cùng một timestamp có nhiều hit thì dùng thứ tự resolve server để chọn hit đầu được giảm; không tùy số frame client. Không double count overlap của actor/FX hoặc duplicate event.

Tại kết thúc/chuyển pha: chốt kết quả một lần → dừng nhận cast của pha → hủy AI/vùng/projectile/pulse/tàn ảnh/camera feedback còn lại → lưu checkpoint → tạo trạng thái chuẩn bị mới. Tin nhắn/event muộn từ pha cũ không tác động pha mới; reset cooldown chỉ nằm trong phiên chuẩn bị, không dùng event replay để reset ở thế giới ngoài.

## 12. Thưởng và liên kết tiến trình

E01/02/03 trong HN10 không rơi vật tư hoặc tu vi theo kill. P1/P2 chỉ cấp checkpoint; P3 cấp kết quả HN10/M04 một lần. Giữ bảng tiến trình: **HN10 = 0 tu vi**, M04 nâng stat thử lên HP130/linh lực115/sức mạnh13 sau trận, mở HN11; không tự cấp Trúc Cơ/R02 hoặc quyền xuất hành nếu HN11/12 chưa xong.

HN05 có phần thưởng nhiệm vụ 100 tu vi/vật tư theo hồ sơ tiến trình, không cộng thêm một gói kill reward của E01. Các bài HN06/07/09 và O01/O04 nhận thưởng theo nhiệm vụ/mục tiêu một lần, không từ mọi lần spawn actor. Chế độ luyện lại HN10, nếu mở sau hoàn tất, không lặp M04/thưởng, không giảm checkpoint tuyến chính.

## 13. ART/VFX và khả năng đọc trận

Giữ frame-by-frame và quy mô đã bàn giao; timeline Kiếm/Lôi/Phong của người chơi không sửa chỉ để khớp AI. Timing enemy trong tài liệu là thời gian mô phỏng thử; khi có clip enemy 24 FPS, phải map windup/lock/resolve/recovery sang frame event và chỉnh đồng bộ có hồ sơ. Không suy rằng enemy đã có đủ sprite/timeline.

Telegraph thể hiện rõ rìa mask, hướng, điểm khóa và số pulse; có nét/hình nhịp bổ sung để không chỉ dựa màu. Rìa glow trang trí không nới mask. Dấu đang theo/chưa khóa khác dấu đã khóa, nhưng vùng không biến mất trước resolve. Đường phù kép báo lượt 1/2, pulse cuối kết thúc hazard rồi FX mới tan.

Tín hiệu nguy hiểm ở mặt đất đọc được dưới skill; body/nhãn người chơi không bị phủ bởi bóng linh ảnh hoặc lớp glow đặc. Impact chung theo hit nhân vật/quái/boss, không cố định vật liệu bia đá. Chuyển nhịp boss dùng tư thế/dấu rõ ở cùng cỡ actor, không nhân bản một người lớn đè nhân vật.

Ảnh/tàn ảnh là trình bày. Camera shake/hit-stop theo bàn giao, mặc định/tùy chọn không đổi clock combat. Giảm VFX/camera vẫn giữ telegraph có nghĩa gameplay. Viewport nhỏ cần giữ cả actor và vùng nguy hiểm gần họ; không thu nhỏ hitbox vì camera crop. Chưa có benchmark hoặc ART enemy/telegraph/icon/SFX mới trong bước tài liệu này.

## 14. Đối chiếu độ khó trước chơi thử

| Đối chiếu số học | Kết quả / giới hạn |
| --- | --- |
| M03 vs E01 HP60 | 2 Kiếm =72 damage, giá 20 linh lực; hoặc 5 đòn thường =60 |
| M03 vs E02 HP80 | 1 Lôi + 1 Kiếm =90 damage, giá 35; cần cả hai trúng, không tính là combo bắt buộc |
| M03 vs E03 HP240 | 4 Lôi + 1 Kiếm =252 damage, giá 110; không cần regen để đủ damage nếu trúng, nhưng vẫn phải né/chờ cooldown |
| Đường thắng khi cạn linh lực | 20 đòn thường M03 =240; có cửa sổ tiếp cận/đánh, không yêu cầu nguồn lực trả phí |
| Một hit thường boss / hộ thân | 15 hoặc 7.5 HP; hộ thân chỉ giảm một hit |
| Hai pulse đường phù kép | 30 nếu cả hai trúng; 22.5 nếu cùng một lượt hộ thân giảm đúng một hit trong cửa sổ |

Những phép tính chỉ kiểm ngân sách/không có vòng điều kiện vô lý, không chứng minh TTK, đường né hay độ vui. Bốn Lôi cần nhiều cửa sổ cooldown và boss đổi nhịp/di chuyển; có thể miss. Prototype phải kiểm cách phối hợp lẫn đòn thường, cả ba actor và góc camera nhỏ.

## 15. Nghiệm thu khi có prototype

| Tình huống | Kết quả cần thấy |
| --- | --- |
| Chạy HN05/HN10 bằng từng nhân vật | Chung quyền/collider/stat; tự hoàn thành, lời dẫn đúng người |
| Né E01 sau khóa | AI không quay theo; swing hụt không damage vì artwork còn chạm thân trên |
| E02 dấu tròn/đường phù ở sát biên | Có đường đi bộ tới vị trí an toàn trong warning; không trap bằng vùng đặt mới |
| Đánh Lôi lúc enemy đi và lúc recovery | Hit/miss theo điểm đã khóa; không tự đổi target hoặc gây AoE |
| Phong xuyên vùng nguy hiểm | Hit theo vị trí thật tại resolve; không miễn nhiễm vì đang có tàn ảnh |
| Hộ thân vào pulse kép | Chỉ một hit giảm; pulse thứ hai/gửi lại không áp buff hai lần |
| Boss HP từ >120 xuống <120 do một hit | Giữ damage, đổi nhịp sau hành động; không hồi/clamp HP hoặc bật immunity |
| Boss bị hạ trước nhịp B | Vẫn thắng hợp lệ nếu player còn sống; không chặn để ép trình diễn |
| Cạn linh lực | Đòn thường/đi bộ có đường thắng, không chặn vì chưa dùng đủ ba skill |
| Thắng P1/P2, fail hoặc rời pha sau | Giữ checkpoint, reset cả hai actor khi thử lại pha chưa qua |
| Mất mạng giữa windup/hai pulse | Pause riêng theo policy; reconnect giữ thời gian còn lại, không hit dồn/regen |
| Mất mạng sau P3 đã ghi | HN10/M04 giữ, không nhận lại hoặc quay về fail |
| Projectile/event cũ sau chuyển pha | Không hit actor mới, tạo thưởng hay reset cooldown ngoài phiên |
| Hai hồ sơ cùng chọn một nhân vật | Phiên/checkpoint/thưởng riêng; không giúp nhau bằng damage ngoài phiên |
| Render chậm / giảm VFX | Số hit/time resolve không đổi; telegraph cần thiết vẫn đọc được |

Thu thập điểm bị hạ theo đòn, thời gian pha, số miss, linh lực, đường né và lý do thử lại. Ngưỡng chấp nhận/thời gian khảo nghiệm chưa khóa; không coi tính toán hoặc kiểm tài liệu là nghiệm thu combat thực.

## 16. Việc cần chốt trước triển khai

Đánh giá tạo hình/danh tính đối thủ chuyển thể, bố cục arena/collider, warning và đường né tại góc, nhịp boss A/B, phạm vi checkpoint/reset/pause 30 giây, input/cast của người chơi và khả năng đọc trên viewport nhỏ. Kỹ thuật cần hợp đồng trạng thái phiên/tick/resolve/lưu/migration; ART cần kiểm kê sprite/telegraph/impact/SFX/pose cả ba và enemy.

GD06/GD10/GD09 có bản encounter cơ sở tại đây; chưa hoàn tất cân bằng/triển khai. Khi chuyển sang gameplay, đề xuất kiểm lát A bằng E01 + HN01–HN05 rồi lát B bổ sung E02/E03/HN10; phạm vi cụ thể cần duyệt và chơi thử. Ưu tiên vẫn là map trước vận hành gameplay theo GDD; ART cũ đã xóa, đang chờ kế hoạch map mới. Không tự mở combat hoặc toàn bộ encounter vì hồ sơ này đã có.
