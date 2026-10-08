# Quái, tinh anh và boss — MVP RPG-A

**Phiên bản:** 0.3, ngày07/10/2026. **Combat đã chọn:** tự đánh thường vào mục tiêu, kỹ năng/né chủ động. Nhiệm vụ, quái, chỉ số và boss dưới đây là chuyển thể cho đệ tử; chưa là combat đã triển khai.

## Bộ đối thủ A

| ID | Đối thủ/khu | HP | Thưởng tu vi | Vật liệu |
| --- | --- | --- | --- | --- |
| MOB-RAT | Sơn thử/suối | 48 | 4 | Da thú65% |
| MOB-BEETLE | Giáp trùng/ngoài dược viên | 100 | 6 | Sơn thảo chắc chắn |
| MOB-BOAR | Sơn trư/rừng | 160 | 8 | Da thú chắc chắn |
| MOB-WOLF | Hôi lang/rừng | 210 | 10 | Nanh lang chắc chắn |
| ELITE-WOLF | Lang đầu đàn/khe đá | 600 | 50 | 2 mảnh linh thạch |
| BOSS-WOLF | Hắc Nha Yêu Lang/hang riêng | 1900 | 120 | Tinh hạch, kiếm hiếm15%/pity5 |

[JSON nội dung](data/mvp-rpg-content.json) là nguồn cho spawn/tầm đuổi/chỉ số/loot. [MVP](MVP-RPG-A.md) ghi công thức/combat và sở hữu thưởng, [kịch bản](STARTER-STORY.md) gắn từng đối thủ với Q02–Q10.

## Hành vi

Quái thường có điểm sinh/leash, không kéo vào hub. Mini-boss báo lao trước0,9 giây. Boss có quét vuốt1,1 giây, lao thẳng1,4 giây và hống vòng tròn1,6 giây; không thêm lính nhỏ hoặc chồng hai đòn không thể né ở A.

Vị trí, HP, cooldown, vùng sát thương, chết và roll loot là kết quả server. Người cùng đánh được xét credit/thưởng cá nhân, không phụ thuộc last hit. Boss A phiên một người; B mở nhóm. Lần boss đầu cho chọn đồ chắc chắn, farm lặp có pity; túi đầy giữ thưởng chờ nhận.

## Nguyên tác và lịch sử

[Hổ/hang/kiếm linh/trận Vương Lâm](ENCOUNTERS-STORY-REFERENCE.md) giữ như gặp gỡ chính truyện. Không chuyển hổ thoát hiểm thành quái farm hoặc nhân châu độc hữu cho mỗi tài khoản. Dữ liệu quái A ở trên là thiết kế game có thể đổi sau chơi thử.

Bước tiếp theo: một avatar/một quái và Q01–Q03 trước, rồi mở bốn quái/tinh anh/boss. [Backlog](MVP-BACKLOG.md) quy định nghiệm thu, [map](STARTER-REGION-MAP.md) có điểm bố trí để đi thử.
