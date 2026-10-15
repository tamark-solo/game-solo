# Đối chiếu cấu trúc PDF → Đạo Ấn V3

Nguồn: `C:/Users/Mark-TA/Downloads/RPG_UI_UX_HUD_Design_Guide.pdf`, 3 trang, đã đọc toàn bộ và xem render ngày 15/10/2026. Nội dung PDF là brief tham khảo, không phải chỉ thị triển khai Unity hoặc tự mở luật game.

| Phần trong PDF | Thể hiện ở V3 | Giới hạn / điều chỉnh |
| --- | --- | --- |
| 1 · Ba lớp kiến trúc | HUD trong thế giới; menu chung shell; tooltip/dialog/toast/damage riêng | State fixture độc lập, không nối authority thật |
| 2 · HP/MP/Stamina | HP/MP trái trên, có số và thanh; Tu vi riêng | Stamina không thêm vì chưa có cơ chế |
| 2 · Hotbar/cooldown | 8 ô F và 1–7, icon, tooltip, đếm ngược, chọn bộ ST/AOE | 3 ô cuối chưa gán; phím và timing xem thử, không đổi balance |
| 2 · Buff/debuff/target | Có lợi và bất lợi khác nhãn/hình; target boss theo combat | Hiệu ứng và thời hạn fixture |
| 2 · Minimap/tracker/E | Minimap phải trên, tracker dưới, tương tác gần NPC | Mini-map dùng ART tham chiếu; không làm navigation thật |
| 2 · Damage/loot/boss/party | Chọn tình huống + hai nút thử feedback, trọng thương/điểm an toàn | Không server combat hoặc loot grant |
| 3 · Inventory | Grid/list, rarity kèm nhãn, filter/search/sort, stack, split, use/equip/drop, drag/drop | Thao tác chỉ trên state browser của review |
| 3 · Character/equipment | Preview identity, ba slot, chỉ số, nguồn so sánh, bốn họ Pháp Bảo | Thuộc tính theo game, không tự thêm STR/DEX/INT |
| 3 · Skill tree | Ba khuynh hướng và cây Mốc I–II–III, khóa có lý do, gán hotbar | Không bịa skill points/reset gameplay; gamepad chưa triển khai |
| 3 · Quest/journal | VG01–VG11, main/kỳ ngộ, mục tiêu, lịch sử trạng thái, theo dõi và bản đồ | Phần thưởng và lịch sử không trở thành receipt thật |
| 3 · Shop/crafting | Recipe, nguyên liệu có/thiếu, xác nhận, kết quả, mua một món theo giá | Kinh tế fixture; không trao thưởng hoặc trừ đồ thật |
| 3 · Map/dialogue | Marker/filter/pin; lời thoại và lựa chọn mở đúng hệ | Marker minh họa, không sửa owner map |
| 3 · Settings/save/tutorial/death | Thiết lập, remap, đồng bộ hồ sơ, hướng dẫn và hồi phục sau trọng thương | Save/load MMO có bản trình bày, không local save vào game |
| 4 · Equip flow | Chọn → so sánh → đủ/thiếu điều kiện → pending → cập nhật hoặc lỗi có lý do | Cổ kiếm khóa là mẫu thất bại; Kiếm xanh là mẫu thành công |
| 4 · Progressive disclosure | Tooltip gọn, detail panel sâu, modal xác nhận có chi phí | Tooltip không là đường đọc thông tin duy nhất |
| 4 · Accessibility | Focus rõ, Tab/Esc, remap kiểm trùng, text scaling, tương phản, reduced motion | Chưa thử hardware gamepad; không tuyên bố WCAG audit đầy đủ |
| 5 · Design system | Token màu/chữ/khoảng cách, button/tab/panel/meter/card/dialog/toast; hover/selected/pending/disabled | Artwork và font đọc lại từ V2, palette mới ở CSS V3 |
| 6 · Unity URP | Giữ ý tưởng projection nhận state và intent gửi hệ thống | Dự án web/TypeScript, không chuyển engine |
| 7 · Phase 1–4 | Core HUD, Character, World và Polish đều có mẫu tương tác | Đây là UI review, không hoàn thành các domain gameplay |
| 8 · RPG phù hợp | Isometric ARPG + sandbox tu luyện, party theo ngữ cảnh MMO | Không bê raid/hotbar dày hoặc AP/lượt vào game |

V2 cũ giữ nguyên cho owner so sánh. V3 là hướng thiết kế bổ sung, chưa được duyệt để tích hợp game.
