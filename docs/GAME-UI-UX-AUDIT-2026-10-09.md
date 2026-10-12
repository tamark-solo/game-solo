# Kiểm tra UI/UX và hướng đồng bộ với HUD Vân Ngọc

**Đã xử lý sau audit — 10/10/2026:** view H5, bộ mỹ thuật đồng bộ HUD, lỗi nền lệch khỏi khung khi resize và chữ/tab nhiệm vụ đã được sửa trong runtime. Owner xác nhận bản hiện tại ổn/tốt. Xem [bảng vấn đề đã xử lý và bằng chứng](HANG-NHAC-VAN-NGOC-UI.md#trạng-thái-chốt-ngày-10102026). Các nhận xét và đề xuất dưới đây là snapshot trước sửa, không phải danh sách lỗi còn mở.

**Tiếp nối cùng ngày:** owner đã cập nhật view H5 và yêu cầu triển khai bộ UI. Xem [bản Vân Ngọc runtime đã ghép](HANG-NHAC-VAN-NGOC-UI.md). Các nhận xét bên dưới giữ trạng thái tại lượt kiểm tra trước khi đổi view.

Ngày 09/10/2026. Phạm vi: kiểm tra mã, tài liệu hiện hành và ảnh chụp đã lưu trong workspace. Đây là đề xuất thiết kế, chưa là mockup mỹ thuật được chủ dự án duyệt hoặc kết quả chơi thử mới. Desktop trước, mobile sau theo quyết định hiện có.

## 1. Kết luận

HUD Vân Ngọc 03 + Khí quang 02 đủ rõ để làm chuẩn mỹ thuật cho bộ UI: đồng cổ, ngọc xanh, mây/sen, mặt nền xanh đen, chữ sáng ấm, sinh lực đỏ và linh lực xanh ngọc. Các phần còn lại hiện mới đồng bộ một phần về màu/font; chưa có bộ khung, nút, icon và bố cục thống nhất.

Nên giữ hướng tranh mực/giấy cổ của GDD cho vùng đọc truyện, nhật ký và tài liệu; nối chúng với HUD bằng cùng viền đồng, điểm ngọc, tiêu đề và điều khiển. Một bộ UI có thể có cả nền tối và giấy sáng khi vai trò của mỗi loại được quy định rõ.

Nguồn chuẩn: [HUD desktop](DESKTOP-SKILL-HUD.md), [HUD đã ghép game](HANG-NHAC-HUD-LAYERS.md), [Khí quang 02](design/ui/desktop-skill-hud-v3/qi-v2/README.md), [GDD](GDD.md), [nhiệm vụ runtime](HANG-NHAC-QUEST-UI.md).

## 2. Những điểm thấy trong bản hiện tại

| Phần | Bằng chứng hiện có | Hướng xử lý khi thiết kế |
| --- | --- | --- |
| HUD kỹ năng | Khung tranh liền, hai cầu, icon có chất liệu; 760 × 140, 10 ô 36 px, ba thuật hoạt động | Giữ làm mẫu chuẩn; giữ kích thước và hợp đồng skill |
| Khung ngoài game | Tiêu đề, form chọn nhân vật/tên/vào sân, footer và link Editor còn nằm ngoài vùng chơi | Thiết kế màn chọn/tiếp tục riêng; trong phiên chơi đưa danh tính và kết nối vào cụm gọn |
| Tracker | Xanh tối/viền vàng đã gần HUD, nhưng khung phẳng; trạng thái, checklist, hướng dẫn, thưởng, tu vi và nhiều nút cùng hiện | Mặc định chỉ hiện nhiệm vụ hiện tại, bước kế tiếp và hành động cần làm; chi tiết vào sổ |
| Luyện thuật | Bảng giấy sáng góc trên phải; lặp HP/MP đã có trong cầu; chứa hướng thuật và checkbox Linh quang | HP/MP chính ở HUD; hành động luyện thuật theo ngữ cảnh, Linh quang vào thiết lập khi có màn thiết lập |
| Hội thoại NPC | Dialog giấy sáng, viền trơn, lời hướng dẫn dài và nhiều nút ngang | Khung cùng họ với HUD; tách lời thoại, mục tiêu, thưởng và một hành động chính rõ ràng |
| Sổ nhiệm vụ | Thẻ hai cột, toàn bộ nhiệm vụ và nhiều lời hướng dẫn phía trên bản đồ | Danh sách + chi tiết nhiệm vụ đang chọn; chỉ đường dễ thấy trong cùng vùng xem |
| Chữ và phản hồi | HUD cố định dùng chữ nhỏ; nhiều vùng ngoài HUD cũng dùng 10–13 px | Giữ HUD chuẩn, tăng khả năng đọc ở bảng mới; dùng chữ/symbol giải thích trạng thái cùng màu |
| D-pad | Hiện cả trong ảnh desktop; CSS Hằng Nhạc không có quy tắc ẩn desktop như trang preview khác | Trong thiết kế desktop ưu tiên bàn phím; thiết kế vùng touch riêng theo chế độ input |
| Mobile | Fallback ba nút 48 px đã có; ảnh 390 × 844 có header cao, hai bảng phía trên và HUD phía dưới | Là đợt thiết kế riêng: thu gọn nhiệm vụ và utility, dành vùng chơi giữa; không thu nhỏ artwork desktop |

Ảnh đối chiếu: [desktop](../artifacts/hang-nhac-quests-desktop.png), [sổ nhiệm vụ](../artifacts/hang-nhac-quests-journal.png), [mobile](../artifacts/hang-nhac-quests-mobile.png), [chi tiết HUD](design/ui/desktop-skill-hud-v3/qi-v2/qi-on-detail.jpg).

Các ảnh là bằng chứng bố cục đã lưu, không chứng minh mọi trạng thái hiện tại đã được thử lại. Nhận xét về mật độ và tính đồng bộ là đánh giá thiết kế.

## 3. Bộ quy tắc mỹ thuật đề xuất

| Thành phần | Quy tắc |
| --- | --- |
| Khung | Đồng cổ, góc/đỉnh có mây hoặc ngọc; khung lớn trang trí rõ, tracker/tooltip dùng phiên bản tiết chế |
| Mặt nền | Xanh đen cho thông tin phủ map; giấy cổ phẳng cho đọc dài; cùng ngôn ngữ viền và điều khiển |
| Màu nền tối | Bắt đầu từ `#172827`, `#102327` đang có trong hotbar; chỉnh sau đối chiếu hình |
| Viền và chữ | Đồng `#BCA46A`, chữ sáng `#F3EAD4`, tiêu đề ấm `#F3DCAA` từ hotbar; giấy sáng dùng chữ mực đủ rõ |
| Màu ngữ nghĩa | Đỏ: HP/nguy hiểm; ngọc: MP/sẵn sàng; vàng ấm: bước cần làm/chờ xác nhận; tím chỉ giữ cho nhận diện Lôi khi phù hợp |
| Ngọc và ánh sáng | Nhấn ở tiêu đề, lựa chọn và phản hồi sự kiện; HUD giữ vai trò nổi bật, các bảng không cùng xoay/phát sáng liên tục |
| Chữ | Cambria/serif cho tiêu đề, Segoe UI/sans cho nội dung và số; thử 14–16 px nội dung bảng, 18–24 px tiêu đề, khoảng dòng 1,5–1,65 |
| Khoảng cách | Dùng nhịp 4/8/12/16/24; mặt chữ thoáng, họa tiết tránh vùng số và nội dung |
| Nút | Cùng bộ chính/phụ/đóng/tab; đủ trạng thái hover, focus, selected, disabled, pending; lý do khóa đọc được |
| Icon | Chung vật liệu, góc nhìn, nét và độ sáng với icon HUD; icon luôn có nhãn hoặc tooltip phù hợp |

Các màu/kích thước bảng mới là điểm xuất phát để dựng và xem mockup. Chưa đo tương phản hoặc duyệt font ở prototype mới. Kích thước 36 px của hotbar desktop đã chốt được giữ riêng; nút mới cần vùng thao tác đủ rộng, mobile tối thiểu 44 px theo hướng dự án.

Không kéo giãn hoặc cắt artwork hotbar để làm mọi cửa sổ. Khung mới cần asset theo chức năng và tỷ lệ của chúng. Khi sản xuất raster mới, lưu nguồn/prompt/metadata và dùng workflow ImageGen của dự án; chữ và số vẫn là UI thật.

## 4. Bộ thành phần và màn hình cần thiết kế

### Đợt đầu: các luồng đã có gameplay

1. **UI kit Vân Ngọc:** khung lớn/nhỏ, nền đọc, tiêu đề, nút chính/phụ/đóng, tab, ô chọn, tooltip, badge, progress và thông báo. Làm mẫu trạng thái trước khi nhân ra nhiều màn.
2. **Màn chơi desktop:** HUD hiện hành; danh tính/người chơi, mục tiêu luyện đã chọn, tracker gọn, tương tác NPC và kết nối. Cụm mục tiêu chỉ xuất hiện khi có mục tiêu thật.
3. **Hội thoại và nhận/xác nhận nhiệm vụ:** tên NPC, nội dung ngắn, điều kiện, thưởng lần đầu và hành động; hỗ trợ đang gửi, bị khóa, lỗi và đã ghi nhận.
4. **Sổ nhiệm vụ + chỉ đường:** danh sách HN01–HN04, nhiệm vụ đang chọn, checklist, bước kế tiếp và bản đồ. HN05 chỉ mang trạng thái chưa triển khai hiện có.
5. **Thổ nạp/hồi phục:** ba nhịp, xác nhận chủ động, tiến trình nền, vật tư và ngưỡng; tách linh lực thi triển khỏi tu vi/tích lũy hồi phục.
6. **Chọn/tiếp tục hồ sơ:** ba người chơi được từ đầu, tên, tiến độ riêng, thông tin bản lưu và hành động vào sân; giữ tên làm phương án khi portrait thiếu. Portrait mới chỉ dùng theo trạng thái ART đã được đánh giá.
7. **Thiết lập và phản hồi hệ thống:** Linh quang, giảm chuyển động, trợ giúp phím, trạng thái nạp/kết nối/lưu; chỉ điều khiển có chức năng thật trong đợt triển khai.

### Thiết kế sau khi đặc tả gameplay tương ứng rõ

Hành trang, trang bị/pháp khí, công pháp/cây thuật, bình cảnh/đột phá, bản đồ ngoại vi, encounter, tổ đội, chat, giao dịch và tổng kết offline. Có thể lập danh mục cho bộ UI tổng thể, nhưng không đặt nút mở tính năng hoặc phần thưởng giả trong màn chơi hiện tại.

## 5. Các luồng UX cần giữ và làm rõ

- Nhiệm vụ: chưa nhận → đang làm → đủ điều kiện → về NPC xác nhận → đã hoàn thành. Đủ checklist vẫn phải khác nhận thưởng; UI chờ kết quả server.
- Nút hướng dẫn: khi xa phải thể hiện ý nghĩa **xem đường tới NPC**; khi gần mới là **nói chuyện**. Hiện nút “Gặp người hướng dẫn” mở sổ khi xa, nên nhãn theo ngữ cảnh sẽ dễ hiểu hơn.
- Sổ nhiệm vụ: ưu tiên bài hiện tại; hoàn thành/khóa thu gọn; nội dung chưa triển khai có nhãn riêng. Tên và trạng thái bằng chữ, không chỉ màu.
- Trong hội thoại/sổ, input đi/cast phải bị chặn; đóng bằng Escape/Đóng trả focus về game. UI phủ map không đổi aim hoặc gửi cast.
- Kết nối: phân biệt đang vào sân, đang đồng bộ, đang nối lại, lỗi và đã phục hồi. Khôi phục cùng hồ sơ; không yêu cầu reset save để tiếp tục.
- Lỗi lưu: nói rõ kết quả chưa được ghi nhận và bước thử lại phù hợp; không hiển thị thành công trước xác nhận.
- Tư Đồ Nam: dùng tích lũy hồi phục/hiện diện theo profile, không áp nhãn Ngưng Khí cho tất cả.
- Bảng mới cần xem ở 1024 × 768, 1366 × 768, 1920 × 1080; tăng chữ và tên dài. Mobile thử riêng vùng nhìn, thao tác một tay, bàn phím và chiều cao hữu dụng.

## 6. Tài liệu cần đồng bộ khi triển khai bộ mới

- `docs/design/ui-tokens.json` đang là bộ tranh mực/giấy cổ của UX trước, chưa có token khung đồng/ngọc/FX và hai loại surface theo HUD.
- `docs/UI-COMPONENTS.md` ghi bản HUD còn chờ ghép, trong khi `docs/DESKTOP-SKILL-HUD.md` và `docs/HANG-NHAC-HUD-LAYERS.md` xác nhận đã duyệt/ghép.
- `docs/design/ui/desktop-skill-hud-v3/README.md` cũng còn câu chưa ghi nhận duyệt/tích hợp. Cần cập nhật trạng thái theo quyết định owner, giữ lịch sử bản cũ.
- `docs/UX-MVP-A.md` và `docs/UX-SCREENS-AND-STATES.md` đã ghi rõ là lịch sử idle. Dùng lại nguyên tắc đọc, focus và giải thích phần thiếu; danh mục màn mới phải theo Hằng Nhạc/runtime hiện hành.

## 7. Cách kiểm chứng đợt thiết kế tiếp

Đầu tiên dựng UI kit và ba mockup desktop dùng cùng một trạng thái dữ liệu: màn chơi, hội thoại NPC, sổ nhiệm vụ/chỉ đường. Xem chúng cạnh HUD và map native 1× để kiểm chất liệu, phân cấp, độ đọc và khoảng chiếm map. Sau đó làm prototype tương tác với đủ trạng thái; duyệt hình và kiểm kỹ thuật riêng.

Khi ghép runtime, kiểm HUD/layer, quests, R01, aim, sect, lessons và reload theo phạm vi thay đổi bằng fixture riêng. Không ghi test vào map, DB hoặc draft owner. Bộ UI chỉ trình bày dữ liệu/callback; transport, quyền sử dụng skill, tài nguyên và thưởng tiếp tục thuộc các lớp hiện hành.

Đợt kiểm tra này chỉ thêm bản báo cáo; không sửa HUD, gameplay, map hoặc dữ liệu lưu, và không chạy lại test runtime.
