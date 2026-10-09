# Định hướng MMORPG tu luyện có cơ chế idle

> **Hồ sơ lịch sử — không phải luật hiện hành.** Giữ mô hình, số liệu và mốc phát triển tại thời điểm nguồn. Thiết kế mới: [GDD 0.28](GDD.md), [Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md) và [trạng thái dự án](PROJECT-STATUS.md).

**Phiên bản:** 0.7, ngày 07/10/2026.  
**Người phát triển đã xác nhận:** MMORPG có idle, đệ tử riêng, khu môn phái đi lại; nhân vật pixel art trên nền stylized 2D, góc top-down ba phần tư.  
**Đang đề xuất:** phạm vi thế giới/chiến đấu, phân bổ A → B, tỷ lệ nhân vật và bộ hướng/động tác.  
**Tham chiếu:** [GDD](GDD.md), [online](ONLINE-DIRECTION.md), [nhân vật](CHARACTERS.md), [map tham chiếu](WORLD-MAPS.md), [ART](ART-DIRECTION.md).

**Công nghệ client đã chốt:** TypeScript + Three.js; [phân công công nghệ](TECH-STACK.md). Bước tiếp theo trước animation mới là [preview chung](ANIMATION-PREVIEW-SPEC.md) để kiểm tra bộ có sẵn trong hai chế độ. Giữ ART 2D/camera cố định; framework máy chủ và giao thức online được thiết kế riêng.

## 1. Trải nghiệm mục tiêu

Người chơi tạo một đệ tử, đi lại trong thế giới tu tiên, gặp NPC và người chơi khác, nhận nhiệm vụ, phát triển công pháp/cảnh giới và tham gia chiến đấu. Tu luyện idle là một hệ thống tiến triển trong trải nghiệm RPG đó. Nhân vật và thành quả thuộc tài khoản, được lưu tại máy chủ.

Khu môn phái có nhân vật đi lại là **vùng khởi đầu**. Mục tiêu dài hạn có thêm khu vực nối với nó, nội dung khám phá và chiến đấu. Các chương Vương Lâm vẫn được trình bày theo tiến trình cá nhân, giữ quan hệ và vật phẩm độc hữu của nguyên tác.

| Thành phần | Vai trò trong hướng MMORPG | Trạng thái |
| --- | --- | --- |
| Nhân vật người chơi | Đệ tử riêng, có hình trên map và tiến trình lâu dài | Vai đệ tử đã chốt; mẫu hình chờ duyệt |
| Map có thể đi lại | Môn phái khởi đầu, sau đó mở vùng theo arc | Khu môn phái đã chọn; các vùng sau đang đề xuất |
| NPC và nhiệm vụ | Điểm tương tác trong thế giới và mục tiêu phát triển nhân vật | Cần tách tuyến đệ tử khỏi chính truyện |
| Tu luyện idle | Tích lũy/chuẩn bị tài nguyên và cảnh giới theo luật đã chọn | Cơ chế cốt lõi đã chọn; cân bằng cần cập nhật |
| Chiến đấu và trang bị | Kỹ năng, đối thủ, chiến lợi phẩm, lựa chọn đồ | Mục tiêu RPG đề xuất; luật/phạm vi chưa chốt |
| Xã hội | Gặp đồng môn, giao tiếp; sau đó tổ đội và hoạt động chung | Cùng thế giới đã chọn; từng tính năng cần thiết kế |

Số người đồng thời, số phiên bản khu vực, số máy chủ và quy mô thế giới chưa xác định. Định hướng MMORPG không phải một cam kết năng lực vận hành đã kiểm chứng.

## 2. Quan hệ với A → B

Giữ lộ trình phát triển từng bước A → B. **Phạm vi chi tiết trước đây cần xét lại theo mục tiêu MMORPG**: A chưa có combat, B chỉ có một trận truyện của Vương Lâm, và 9/13 node cũ chưa phải map di chuyển của đệ tử.

Đề xuất phân kỳ để thảo luận:

| Bước | Trải nghiệm cần kiểm chứng | Phần còn phải thiết kế |
| --- | --- | --- |
| A — Nhập môn online | Tạo đệ tử, đi lại trong một khu môn phái chung, tương tác NPC/người chơi, nhận nhiệm vụ, tu luyện tới tầng đầu | Map đi lại, sprite và chuyển động, nhiệm vụ đệ tử, tài khoản/đồng bộ; vị trí combat trong A cần quyết định riêng |
| B — Vòng RPG có chiến đấu | Đi từ môn phái tới một vùng thử chiến đấu, dùng thuật pháp, có đồ/phần thưởng và quay về chuẩn bị | Quái/đối thủ của đệ tử, quyền nhận thưởng, kỹ năng và trang bị; bố trí chung/riêng cho từng trận |
| Sau B | Mở vùng theo arc, tổ đội, hoạt động môn phái và các hình thức tương tác bổ sung | Từng gói có nhiệm vụ/map/đối thủ/ngân sách riêng |

Không tự chuyển con hổ thoát hiểm hoặc Chu Bằng trong chính truyện thành mục tiêu farm của mọi đệ tử. Quái/đối thủ cho tuyến người chơi cần hồ sơ nội dung riêng.

A là mốc kiểm chứng nhập môn và thế giới online ban đầu. Muốn đánh giá đầy đủ cảm giác RPG chiến đấu phải kiểm chứng thêm vòng B. Thứ tự này đang đề xuất; chưa coi danh sách tính năng hay số map của bản MMORPG đầu tiên là đã duyệt.

## 3. ART, góc nhìn và tỷ lệ

MMORPG là định hướng thể loại. Pixel art hoặc stylized là phong cách hình; top-down hoặc isometric là góc nhìn; 2D/2.5D là cách dựng cảnh. Các lựa chọn có thể kết hợp, không phải những thể loại loại trừ nhau. [Curse of Aros](https://www.curseofaros.com/) là ví dụ sản phẩm được nhà phát triển giới thiệu là MMORPG 2D; [IdleOn](https://www.legendsofidleon.com/) là tham chiếu cho việc kết hợp idle với trải nghiệm MMO.

Sau [thử sprite Vương Lâm](design/characters/wang-lin-sprite-study/index.html), ngày 07/10/2026 người phát triển ưu tiên **nhân vật pixel art** và chọn **giữ nền stylized 2D**, cùng góc **top-down ba phần tư**. Portrait/cảnh truyện/UI giữ tranh mực/giấy cổ. [WORLD-VISUAL-SPEC.md](WORLD-VISUAL-SPEC.md) ghi cách phối hợp; mẫu sân cũ giữ tham chiếu nền/bố cục. Lưới pixel, tỷ lệ, kích thước và animation cần duyệt riêng.

Tỷ lệ khoảng **4–5 đầu chiều cao** là hướng nghiên cứu để đọc silhouette ở cỡ nhỏ. Nhận diện Vương Lâm v2 đã duyệt; [bộ áo xám đầu tiên](WANG-LIN-SPRITE-SPEC.md) có frame 64 × 96 và bốn hướng đứng/đi. Hai [mẫu đệ tử thử](PLAYER-AVATAR-VISUAL-SPEC.md) đã áp dụng cùng frame/anchor, 28 frame/mẫu; nhận diện và motion còn chờ đánh giá. Lưới nhân vật này độc lập kích thước ô/va chạm của map.

## 4. Phần việc hình ảnh tăng thêm

- Hình đệ tử trên map và các động tác đứng, đi, tu luyện; động tác chiến đấu theo bước mở combat.
- Cảnh/đạo cụ hoặc bộ ô ghép cho map đi lại; hình chân dung nền truyện 1.600 × 900 không tự thay thế bộ map này.
- Hình NPC xuất hiện thật trên map; roster chân dung không yêu cầu mọi nhân vật truyện đều có sprite trong A.
- Phần UI cần cho màn thế giới: tên nhân vật, điểm tương tác, nhiệm vụ hiện tại, tài nguyên và hoạt động idle.

Ngân sách 20/22 nguồn A và 30 sau B trong tài liệu trước là **dự toán portrait/minh họa**, chưa gồm bộ map/animation/chiến đấu MMORPG. Lập lại ngân sách sau khi chốt ART/góc nhìn và phạm vi A/B.

## 5. Bước thiết kế gần nhất

Hướng kết hợp giữ thử ghép v1 (bộ cũ đã xóa) làm lịch sử nghiên cứu. [Trang animation Vương Lâm](design/characters/wang-lin-gray-walk-v1/index.html) có 28 frame native; [trang đệ tử v2](design/characters/player-avatars-v2/index.html) bổ sung 56 frame, nhận diện nam/nữ và thử chung trên sân. Tiếp theo triển khai preview chung TypeScript + Three.js bằng năm bộ/92 frame có sẵn; đánh giá đặt hình/chuyển động trước khi vẽ animation mới. Biên tập map/nhiệm vụ/online tiếp tục theo phạm vi riêng. Công việc vẫn ở GDD/ART, gameplay online chưa triển khai.
