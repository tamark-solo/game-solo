# Nhân vật Vân Ngọc — phát triển cảm giác tu tiên

**Ngày:** 10/10/2026 · **Bản mẫu:** Linh Đài 02 tại `/character-ui.html`. Owner phản hồi bản 01 “nhìn ổn nhưng không đem lại cảm giác tu tiên”, yêu cầu thêm và nghiên cứu phát triển. Sau khi xem bản 02, owner xác nhận “nhìn ổn rồi đó”; phần nhìn prototype được chấp nhận làm chuẩn tiếp nối. Luật/gameplay vẫn theo giới hạn [bàn giao](CHARACTER-UI-PREVIEW.md).

## Nhận định và hướng phát triển

Giả thuyết thiết kế: bảng 01 tổ chức thông tin dùng được nhưng hình thức còn phẳng. Nhân vật đứng trên giấy, vật phẩm là SVG sơ đồ, tu luyện chủ yếu là số. Người xem cần thấy liên hệ giữa tu sĩ, khí đang vận hành, chặng đang theo và món pháp bảo đang chuẩn bị.

Hướng tiếp theo có ba lớp: **không gian tu luyện** quanh nhân vật, **đạo lộ có nghĩa** ở trung tâm, **vật phẩm có bản sắc và trạng thái** ở hành trang/chi tiết. Giữ nhãn dễ hiểu như Nhân vật, Hành trang, Trang bị; chất tu tiên thể hiện qua hình và nội dung.

## Nguồn nghiên cứu bổ sung

| Nguồn chính thức | Điều nguồn xác nhận | Suy luận áp dụng cho game-solo |
| --- | --- | --- |
| [Mịch Trường Sinh / 觅长生 — nhà phát triển trên Steam](https://store.steampowered.com/app/1189490/) | Mô tả tích lũy/đột phá, lĩnh ngộ; khí ngũ hành hiện trong chiến đấu và tương tác với công pháp/thần thông; pháp bảo/đan là phần tổ hợp phát triển | UI cần cho nhận ra khí, chặng tu luyện và tác dụng đồ. Linh đài/khí quang là cách thể hiện đề xuất của dự án, không phải kết luận đã kiểm UX game tham khảo |
| [Tale of Immortal — nhà phát triển trên Steam](https://store.steampowered.com/app/1468810/Tale_of_Immortal/) | Hành trình tu luyện gắn với địa điểm, công pháp/thuật, pháp bảo/luyện hóa và hành trình NPC | Dành điểm nhìn cho pháp bảo và điều kiện luyện hóa, có liên kết sang đồ mang theo; không tự cấp pháp bảo đặc hữu cho cả ba |
| [GDD](GDD.md), [hệ tu tiên](CULTIVATION-SYSTEM.md), [nhân vật](CHARACTERS.md) | Sáu phần phát triển; cả ba có R01; Tư Đồ Nam hồi phục hiện diện, danh tính/nguồn truyện riêng | Giữ đạo lộ nhập môn; giải thích Cảnh giới / Công pháp / Thuật pháp / Pháp bảo / Lĩnh ngộ / Hành trình và nhãn hồi phục cho Tư Đồ Nam |

Đợt này đọc nội dung nhà phát triển và hình nguồn trong workspace; không kiểm toàn bộ walkthrough/interaction các game tham khảo. Kết luận cảm xúc/bố cục là đề xuất để thử trong prototype. Không lấy lifespan, kinh mạch puzzle, gacha, phẩm chất hoặc số slot từ reference thành luật game.

## Linh Đài 02 đã làm

1. **Nhân vật:** mặt ngọc tối, dấu Tu sĩ/Linh thể, artwork sen/ngọc/đồng/mây sau sprite native 2×; khí/quang điểm nhịp chậm, màu khí phụ theo nhân vật. Không thay atlas hoặc render portrait khác danh tính.
2. **Xem vận khí:** ba clip cultivation hiện hành, bốn frame/clip ở 4 FPS, canvas 192 × 192, scale 2× và điểm chân giữ đúng. Nút chỉ đổi pose trình bày; không tích lũy tu vi, gửi lệnh NPC/skill hoặc đổi đồ/tài nguyên.
3. **Đạo lộ:** ngọc ấn Ngưng Khí hoặc Hiện diện, nhãn tích lũy và chặng Nhập môn → Vận khí/Hồi phục → Luyện thuật trong dữ liệu mẫu. Ba R01 vẫn có từ đầu. Các hướng phát triển mở lời giải thích sáu phần GDD.
4. **Pháp bảo:** hình Vân Khí Châu mẫu, nhãn Chưa luyện hóa và lối sang chi tiết. Điều kiện rõ, hành động dùng bị khóa; đây không phải Thiên Nghịch Châu.
5. **Hành trang:** 12 icon painterly có chất liệu khác nhau. Kiếm gỗ/kiếm ngọc, áo vải/pháp y, bình thuốc/linh dịch/pháp châu dùng artwork riêng.
6. **Khả năng đọc:** giữ khung/mask/chữ/thao tác. Khí quanh sprite/pháp bảo, mô tả trên giấy sáng. Offline/hidden/đóng dừng motion, reduced motion giữ cảnh và pose tĩnh.

Nguồn/prompt/crop/hash artwork mới ở [pack 02](design/ui/character-van-ngoc-v2/README.md). Pose dùng [gói nhiệm vụ hiện hành](HANG-NHAC-QUEST-MOTION.md), không tạo clip mới. Chỉ áp dụng ở prototype; HUD/map/room/save game giữ hợp đồng.

## Kiểm và hướng tiếp nối

[Bàn giao](CHARACTER-UI-PREVIEW.md): 12 nhóm kiểm, 42 cấu hình bố cục/chữ gồm 21 chi tiết dài + 21 Tổng quan mới. Đã xem ảnh desktop/mobile/bộ ba vận khí và contact sheet icon. Alpha/crop kỹ thuật không là duyệt hình.

Mục tiêu khi phát triển tiếp: người chơi nhận ra **ai đang tu luyện, đang ở bước nào, nên chuẩn bị món gì và điều kiện còn thiếu**. Tiếp nối công pháp thực, điều kiện pháp bảo/luyện hóa và cơ duyên riêng theo nhân vật, nối snapshot thật sau đặc tả. Tránh bày cây hệ thống chưa có nội dung vào màn đầu.
