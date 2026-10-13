# Hắc Ấn · lưu ý ghép gameplay sau duyệt ART

Gói Motion01 là ART và sân fixture. Neutral03 đã duyệt riêng; motion/view/VFX/socket mới đang chờ duyệt. Không đổi body/collider hoặc chép clip vào boss live chỉ vì cùng cỡ người80px.

## Quyền và thời gian

- Server/Core sở hữu castId, lifeId, phase, khóa hướng, release/resolve, kết quả hit/cancel, vị trí và loot. Client lấy tuổi từ mốc đó; không tạo damage/impact từ chuyển frame hoặc animation complete.
- Bốn clip công kích có phase cùng kit. Nhịp, kích thước vùng, quota, HP/damage và luật ngắt trong kit là fixture, cần chốt encounter riêng trước live. Hủy trước release bỏ charge/release/contact; hủy sau release cần luật server riêng, chưa được prototype này giả định.
- Charge đi theo socket body hiện tại; release đóng origin/hướng lúc phát. Socket skin đang là candidate cần kiểm visual tay/cổ tay cả tám view. Contact lấy điểm trúng đã xác nhận; miss không impact. Reconnect không khởi động lại FX hoặc cấp thưởng trùng; dedup theo cast/life/target receipt thật.
- Body cuối/corpse không giữ FX sống vô hạn. Tail có start/expiry riêng, snapshot cũ không biến age thành0. Đổi action không đổi world foot; depth/bóng/lift riêng, canvas160×112 không là hitbox.

## Phân Phù và Ấn Hồi

Phân Phù hiện chỉ dựng **hai dư ảnh trình bày**, offset hai bên hướng khóa, opacity tối đa0,18 và pose trễ2/4tick. Thân thật opaque, có nhãn ở review; dư ảnh không có cảnh báo, damage, targetability, entity hoặc loot. Nếu thiết kế sau này cho ảo ảnh tham gia chiến đấu, cần contract và prototype server riêng, không biến bản trình bày hiện tại thành quái thật.

Ấn Hồi fixture có tâm rỗng và khe90° phía sau hướng khóa. Giữ vị trí khe trong cả lần cast, không quay theo người đang né. Ground FX chiếu một tỷ lệ cố định cho cả sequence; collider do server xác định, không suy theo glow. Kiểm khe, vùng ngoài vòng và nội tâm ở native1× trước chốt hình/nhịp.

## Khi đưa vào encounter thật

1. Duyệt hình tám view/chuyển idle–move–cast–hit–death cạnh neutral03/Player02 ở camera1×. Không chỉ dùng coverage hoặc height80 làm bằng chứng style/anatomy.
2. Chốt warning/lock/release/resolve/recovery và luật bị đánh/hủy/chuyển pha; kiểm né bằng normal80, cả footprint và trễ. Xem mốc đề xuất trong kit, không tự dùng như balance đã duyệt.
3. Nối presentation đọc facts Core, alpha mềm/atlas gutter2, receipt hit, held aim/origin, expiry, hidden/offline/reconnect. Kiểm miss/cancel không phát contact.
4. Với adds/nhóm quái đọc [checklist cụm](../van-hai-monster-animation-v1/CLUSTER-REVIEW.md): giãn điểm tiếp cận theo vai trò, chừa đường né, dàn nhịp báo/phát đòn, giới hạn FX vùng chồng. Giữ body/cảnh báo/contact server, giảm lớp phụ và dư ảnh trước.
5. Chỉ sau đó bind AI/phase/HP/loot/checkpoint trên DB fixture riêng; giữ writer/receipt hiện hành và authored map9blocker của owner. Không mở party/farm vô hạn/Đọa Ma từ ART review.

Kiểm fixture normal80 +250ms phản ứng +120ms trễ đã qua cả bốn đòn/tám hướng. Đó là khả năng của tình huống mẫu, chưa đo latency thực, collision/navigation, boss AI hoặc tải MMO. Cache16MiB không bao gồm map/browser/GPU tổng.
