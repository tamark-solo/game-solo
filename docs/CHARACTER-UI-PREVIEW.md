# Prototype nhân vật / hành trang — Vân Ngọc · Linh Đài 02

**Hướng thiết kế mới 11/10:** prototype Linh Đài 02 cũ giữ để đối chiếu lịch sử. [Nhân vật/hành trang UI 02 theo map mới](CHARACTER-INVENTORY-UI-DESIGN.md) dùng hai bộ Tu Đạo/Đọa Ma ở `/ui-material-review.html`, reference mới và fixture nhập môn riêng. Không lấy bonus/12 món của prototype cũ làm luật game. Nhân vật đang được owner làm lại, bản mới giữ vùng chờ hình.

**Ngày:** 10/10/2026. Owner đồng ý [hướng thiết kế](CHARACTER-INVENTORY-UI-DESIGN.md); đã dựng prototype tương tác để xem bố cục và UX. Chấp nhận hướng thiết kế không tự thành duyệt mỹ thuật của bản mẫu này hoặc chốt luật vật phẩm.

**Tiếp nối 02:** owner thấy 01 “nhìn ổn” nhưng thiếu cảm giác tu tiên, yêu cầu thêm/nghiên cứu. [Hướng Linh Đài](CHARACTER-UI-CULTIVATION-DIRECTION.md) bổ sung shrine/khí quang/pose vận khí, đạo lộ và [12 icon painterly ImageGen](design/ui/character-van-ngoc-v2/README.md).

**Chấp nhận phần nhìn 10/10/2026:** sau khi xem `/character-ui.html` bản 02, owner xác nhận “nhìn ổn rồi đó”. Ghi nhận Linh Đài 02 làm chuẩn diện mạo cho prototype nhân vật/hành trang/trang bị tiếp theo. Đây là phản hồi trực tiếp về bản trình bày hiện tại; luật vật phẩm, số slot, cân bằng và inventory/equip backend vẫn chưa chốt. [Bản ghi phản hồi](design/ui/character-van-ngoc-v2/visual-review.json) tách khỏi manifest/verification kỹ thuật tại thời điểm tạo.

Mở [bản mẫu](http://127.0.0.1:5173/character-ui.html) khi client Vite đang chạy. Trang có trong production build. Không cần backend, đăng nhập hoặc hồ sơ game thật.

## Màn và thao tác

| Màn | Đã thử được trong prototype |
| --- | --- |
| Tổng quan | Ba nhân vật/sprite hiện hành 2×, HP/MP và tiến trình mẫu; Tư Đồ Nam hiển thị hồi phục hiện diện, hai nhân vật còn lại hiển thị Ngưng Khí mẫu; tóm tắt trang bị và ba R01 |
| Hành trang | 12 món minh họa, icon painterly 02, số lượng/đang dùng/bảo vệ; tìm theo tên, lọc loại và sắp xếp; mô tả, tác dụng, nguồn và điều kiện |
| Linh đài / đạo lộ | Shrine quanh sprite, khí/quang điểm, Xem vận khí; ngọc ấn/tích lũy/chặng học; sáu phần phát triển GDD, lối sang pháp bảo cần luyện hóa |
| Trang bị | Ba vị trí minh họa; so sánh món đang dùng với món chọn; trang bị/tháo; thay đổi tài nguyên tối đa theo fixture |
| Vật tư | Dùng 1 đơn vị, trừ số lượng và hồi tài nguyên mẫu; tài nguyên đầy giữ vật tư |
| Trạng thái | Sẵn sàng, rỗng, 120 món, tên/mô tả dài, đang nạp, mất kết nối và lỗi lưu; lỗi giữ nguyên dữ liệu, trở lại không replay thao tác |
| Mobile/bàn phím | Chọn món mở chi tiết; Quay lại/Escape giữ vị trí cuộn và focus; Tab/mũi tên chọn tab, mũi tên đi qua ô đồ; C mở/đóng, I mở hành trang; input tìm kiếm không kích hoạt phím tắt |

Các thao tác có trạng thái xử lý ngắn để đánh giá phản hồi. Dữ liệu thay đổi trong bộ nhớ của trang, riêng từng nhân vật; reload hoặc Đặt lại dữ liệu mẫu trả về fixture ban đầu. Không gọi API gameplay, mở room, đọc/ghi token, localStorage, sessionStorage hay save thật. HP/MP của HUD trong trang cũng đọc fixture; HUD trong game vẫn đọc snapshot server.

“Bảo vệ” là trạng thái trình bày để đánh giá icon/nhãn; không có luồng vứt/bán đồ. Pháp bảo cần luyện hóa hiển thị điều kiện và không cho dùng. Ghi chép không mở khóa R01. Vân Khí Châu là món mẫu, không phải Thiên Nghịch Châu. Ba slot và các bonus +8/+12/+6 không là luật game đã chốt.

## Mỹ thuật và co giãn

- Dùng nguyên khung/nút/giấy lụa từ bộ Vân Ngọc 02; [nguồn pack](design/ui/van-ngoc-kit-v2/README.md). `attachFrameSurface` và chín mask aperture giữ nền/viền cùng box. HUD 760 × 140 trên desktop, fallback hiện hành trên mobile.
- Sprite đứng lấy catalog runtime 64 × 96, vẽ 128 × 192 giữa canvas 192 × 192. Pose vận khí đọc clip 96 × 96, vẽ 192 × 192; cả hai integer 2× và chân tại (96,176), giữ anchor source (32,88)/(48,88). Không đổi atlas/map hoặc phục hồi portrait cũ.
- Icon SVG 01 giữ phần study trong `icons.ts`; hiện dùng [pack painterly 02](design/ui/character-van-ngoc-v2/README.md) với source/prompt/crop/hash. Icon/số liệu chưa được duyệt làm tài sản phát hành.
- Desktop rộng: ba vùng hồ sơ / đồ / chi tiết. 760–1099 px: hai cột, chi tiết xuống dưới. Mobile: danh sách và chi tiết từng bước. Các vùng đọc dùng token `ui-reading.css`; mô tả xuống dòng, không ép nhỏ chữ.
- Desktop cao và mobile dọc giữ thao tác trang bị/dùng ngoài vùng cuộn mô tả; màn ngang thấp dùng vùng cuộn chung để mọi nội dung còn truy cập được. Lề dưới dành chỗ riêng cho chữ trạng thái tránh viền mỹ thuật.
- Header “Dữ liệu mẫu” luôn phân biệt trang xem thiết kế với game. “Thử trạng thái” có cỡ chữ 100/150/200%, 120 món và các trạng thái; không cần đổi kích thước HUD.

## Kiểm chứng

`npm.cmd run test:character-ui` khởi chạy Vite fixture trên 5232, cache riêng, Chrome headless/context mới, không backend hoặc Map Editor API. Kết quả bản 02: **12 nhóm kiểm, 42 cấu hình bố cục qua** (21 chi tiết dài + 21 Tổng quan). Bản 01 trước đó là 8 nhóm/21 cấu hình.

Các cấu hình: 320 × 740, 390 × 844, 760 × 760, 980 × 780, 1100 × 800, 1366 × 900, 844 × 390; mỗi cấu hình cỡ chữ nội dung 100/150/200%. Kiểm tên và đoạn tiếng Việt dài/chuỗi liền, không tràn ngang, khung/nền cùng box, cửa sổ trong viewport. Chữ đọc tăng bằng token; không coi đây là kiểm mọi browser zoom. Tương tác gồm equip/resources/use/protection, ba hồ sơ riêng, tìm/lọc, điều kiện, lỗi không mutate/replay, mobile 120 món/quay lại/focus, reduced motion. Không request gameplay API hoặc ghi browser storage.

Ảnh và kết quả: `artifacts/character-ui/desktop-overview.png`, `desktop-inventory.png`, `desktop-equipment.png`, `mobile-inventory.png`, `mobile-detail.png`, `verification.json`. Đã xem ảnh desktop/mobile và điều chỉnh lề/khả năng tìm nút thao tác. Typecheck/boundary và production build qua. Test không chứng minh ART đã duyệt hoặc inventory/equip backend đã tồn tại.

Bản 02 thêm ảnh `v2-CHR-*-cultivation.png` và `v2-mobile-overview.png`; kiểm cả ba có ít nhất ba frame body/hình khác nhau, không mutate đồ/tài nguyên. Vận khí dừng/resume khi offline/hidden/đóng, reduced motion dùng frame tĩnh; sáu phần GDD và lối vào pháp bảo giữ điều kiện luyện hóa. Linh đài là trang trí; “Xem vận khí” không gửi lệnh hay tích lũy tu vi.

[Bản ghi kỹ thuật 02](data/character-ui-v2-verification.json) giữ kết quả kiểm, hash nguồn ART và scope fixture. Các ảnh trong artifacts là bằng chứng xem tại thời điểm test, không là trạng thái duyệt mỹ thuật.

## Tích hợp tiếp

Nguồn prototype: `client/character-ui.html`, `client/src/character-preview/{main.ts,preview.css,atmosphere.css,fixtures.ts,icons.ts,shrine-motion.ts}`. Fixture giữ riêng khỏi shared gameplay.

**Đã triển khai đợt đầu 10/10:** owner chọn đồ nhập môn và vật tư thật, giữ HP/MP hiện tại. [Runtime nhân vật/hành trang](HANG-NHAC-CHARACTER-RUNTIME.md) trong `/hang-nhac.html` dùng private snapshot/callback, luật server và SQLite riêng ba hồ sơ. C/I/nút Nhân vật mở cửa sổ. Mộc kiếm, áo vải và vật tư hiện có thay fixture; các bonus và 12 món mẫu trên trang này giữ riêng để review thiết kế.
