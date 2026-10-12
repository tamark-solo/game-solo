# Nhân vật 04 · Linh Đài

**Hình mặc định đã điều chỉnh:** concept người chơi 01 chưa được owner chấp nhận. Linh Đài đã gỡ hình đó, dẫn tới [bảng concept 02 và mẫu cũ đối chiếu](design/characters/van-hai-player-v2/README.md) trong khi chốt nhận diện. Các layout/nguồn 01 giữ lịch sử.

**Linh ảnh mới 11/10:** [nhận diện người chơi Vân Hải 01](VAN-HAI-PLAYER-IDENTITY-V1.md) đã thay vùng chờ ảnh trong Tổng quan/Trang bị review. Hình độc lập mới theo yêu cầu owner, không migration avatar/profile; phối chất liệu Diện mạo giữ riêng. Chờ đánh giá hình và bộ chuyển động native.

**11/10/2026 · bản đối chiếu để owner đánh giá.** Làm lại tab Nhân vật theo phản hồi màn 03 chưa rõ và chưa đủ chất tu tiên. Mở `/ui-material-review.html?screen=character`. Bản này tiếp nối [luồng đồ 03](CHARACTER-INVENTORY-UX-V3.md) và [HUD 04](XIANXIA-FUNCTION-UX-REDESIGN.md); chưa thay skin trong game thật.

**Đồng bộ icon thuật 11/10:** theo phản hồi owner, taskbar nay dùng cùng atlas R01 đang hiển thị trong Nhân vật. Adapter đặt nguồn một lần cho hotbar và biến CSS của Tổng quan/reader Thuật; đổi Tu Đạo/Đọa Ma chỉ đổi khung/chất liệu, giữ nhận diện Kiếm/Lôi/Phong. Không sửa `SkillHotbar`, cast/cooldown hoặc HUD runtime đã duyệt. [68 kiểm nguồn/crop, theme và hành vi](data/dao-skill-icon-sync-verification.json) qua trên desktop/mobile; typecheck và HUD/layer fixture qua.

## 1. Reference và cách áp dụng

Đọc ngày 11/10/2026 từ hướng dẫn chính thức. Đây là tham khảo cấu trúc, không sao chép ART hoặc cân bằng. Kiếm Võng 3 là nguồn bổ sung về hồ sơ MMORPG võ hiệp, không gọi là game thuần tu tiên.

| Nguồn | Điều quan sát | Quyết định thiết kế riêng |
| --- | --- | --- |
| [Vấn Đạo mobile · thuộc tính](https://wd.leiting.com/home/game/game_data.php?level=2&level_id=6&show_type=1) | Đạo hạnh, HP/MP, kinh nghiệm, thuộc tính và dự trữ được phân biệt. Đã xem hình bảng nhân vật trong hướng dẫn, ảnh nguồn 2022 | Tách **tích lũy tu luyện** khỏi **linh lực thi triển**; ghi hiện tại/tối đa và ngưỡng xác nhận rõ |
| [Tru Tiên · nguyên thần tu luyện](https://zhuxian.wanmei.com/news/gamenews/20120709/65960.shtml) | Hướng dẫn lịch sử 2012 nối tích lũy, nhiệm vụ/khảo nghiệm và tiến cảnh | Thanh tích lũy không tự thăng tầng; có điều kiện và nơi xác nhận |
| [Kiếm Võng 3 · nhân vật](https://jx3.xoyo.com/show-3776-27-1.html?cid=3720&fid=3605&in=0) | Hướng dẫn 2018 đặt tên, cấp/môn phái, đồ mang, diện mạo và thuộc tính thành các vùng có mục đích riêng | Tên và thân phận cạnh linh ảnh; tách bộ đang vận dụng khỏi nơi quản lý đồ/diện mạo |

Các quyết định trong cột cuối là suy luận thiết kế cho Vân Hải. Không coi hướng dẫn lịch sử là ảnh client mới nhất. Không tải hoặc sử dụng ART của các game tham khảo.

## 2. Người chơi phải đọc được gì

**Tôi là ai → nền nào đã xác nhận → đang vận dụng gì → còn thiếu gì → xem và thực hiện ở đâu.** Màn trước dùng linh ảnh lớn, nhãn nhập môn chung và thông tin rải trong một cột. Màn mới có ba vùng:

1. **Thân phận:** Vân Khách, Hằng Nhạc/ngoại viện nhập môn, mốc hành trình và lối vào Diện mạo. Linh ảnh thu gọn, giữ vùng chờ ART nhân vật owner đang làm.
2. **Nền tu luyện:** ấn tầng, tên tiến trình đã xác nhận, tích lũy/ngưỡng tiếp, sinh lực/linh lực, nguồn thuộc tính và một bài học tiếp theo. Mẫu hiện tại: Ngưng Khí tầng 1; 180/220 tích lũy; còn 40 để đủ ngưỡng xác nhận tầng 2; HN03 có 2/3 điều kiện.
3. **Bộ đang vận dụng:** nền Thổ nạp, ba thuật với icon/phím/công dụng/chi phí, ba vị trí trang bị hiện có. Món trống ghi rõ “chưa mang”; chọn vị trí dẫn đến đúng màn Trang bị.

Mỹ thuật giữ khung đồng/ngọc đã có, nền mực, giấy sáng Tu Đạo, nền tro và đồng ấm Đọa Ma. Ấn tầng, vòng khí và linh đài là trang trí code-native. Hai bộ giữ tên/ý nghĩa icon và cấu trúc thao tác giống nhau.

Tên điều hướng dùng từ dễ hiểu: **Nhân vật**, **Tổng quan**, **Thuộc tính**, **Tu luyện**, **Thuật**, **Pháp bảo**. “Linh Đài” là tên mỹ thuật bổ sung. Trang bị/Hành trang/Diện mạo là các nơi quản lý riêng, không nhét toàn bộ hệ thống vào một bảng chỉ số.

## 3. Luồng sử dụng

| Thao tác | Kết quả |
| --- | --- |
| C / icon Nhân vật | Mở Tổng quan, đọc nền và mục tiêu |
| Chọn bài HN03 | Mở bài đúng ID và điều kiện thật trong fixture; “Về nhân vật” hoặc Esc trả lại Tổng quan và focus nguồn |
| Tu luyện | Xem nền đã xác nhận, đủ/chưa đủ tích lũy và người hướng dẫn; hành trình đánh dấu bài hiện tại |
| Xem bài từ Tu luyện | Quay về đúng tab Tu luyện; không mất ngữ cảnh |
| Chọn Kiếm/Lôi/Phong | Mở trang **Thuật** đọc riêng từng thuật; phím, chi phí và hồi thuật lấy từ shared definitions |
| Xem bài từ Thuật | Kiếm/Lôi → HN03; Phong → HN04. Quay lại giữ thuật đã chọn |
| Chọn vũ khí/pháp y/ngọc sức | Mở đúng vị trí Trang bị; đọc món đang mang hoặc trạng thái trống |
| Xem diện mạo / mở hành trang | Dùng luồng thử chất liệu hoặc quản lý đồ 03 hiện có |

Nút đọc thuật không cast. Trang Tu luyện không phát lệnh xác nhận tầng. Luồng mang/tháo/dùng/bảo vệ mẫu và điều kiện chờ/từ chối/offline/luyện thuật được giữ từ 03.

## 4. Đọc đúng tiến cảnh và nguồn sức mạnh

`core/dao-character-sheet-model.ts` tạo projection từ `SectView` + avatar. Dùng `progressionLabel`, `LEVEL_THRESHOLDS` và `sectQuests`; không viết lại luật tích lũy hoặc tự tạo nhiệm vụ. Tích lũy đạt ngưỡng chỉ hiện “chờ xác nhận”, không tự tăng tầng hay mở M02. Tầng 3 giữ ngưỡng nhập môn, không sinh tầng 4.

Tư Đồ Nam hiển thị **hồi phục nền/linh thể**, không biến cảnh giới canon thành Ngưng Khí. Hóa Thần/Đọa Ma nằm trong phần đạo lộ dài hạn; đổi bộ mỹ thuật ở review không cấp quyền gameplay hay chứng minh nhân vật đã Đọa Ma.

Nền HP/MP giữ 100/100. Mộc kiếm/áo vải không cộng HP/MP; không đặt chiến lực, công kích, phòng thủ, chí mạng, ngũ hành hoặc tư chất mẫu thành số liệu thật. Hệ cần dữ liệu/luật mới phải có contract riêng trước khi nối runtime.

| Nhóm thông tin | Hiện có | Phần thiết kế cần chốt tiếp |
| --- | --- | --- |
| Thân phận | Tên hồ sơ/avatar; trình bày nhập môn Hằng Nhạc | Public profile, danh hiệu, môn phái/tông môn membership |
| Tu đạo | Tu vi, tầng/hồi phục, nền, mốc và bài học | Cảnh giới dài hạn, điều kiện đột phá, đạo lộ và khảo nghiệm |
| Vận dụng | Ba thuật native, vũ khí/pháp y/ngọc sức | Công pháp đang vận hành, tổ hợp bộ, pháp bảo đã luyện hóa |
| Sức mạnh | Nguồn HP/MP và hiệu ứng vật tư đã có | Stat có nguồn, hiệu lực PvE/PvP, so sánh thay đổi sau áp dụng |
| Hiện diện | Bản thử phối chất liệu riêng | Quyền sở hữu/đang hiển thị thời trang, tọa kỵ, khí tức, pháp tướng |

Đây là danh sách thông tin để phát triển GDD sau đối chiếu, không schema mới hoặc chức năng đã mở. Đọc cùng [nhân vật](CHARACTER-SYSTEM.md), [sáu phần tu tiên](CULTIVATION-SYSTEM.md) và [contracts MMORPG](MMORPG-SYSTEM-CONTRACTS.md).

## 5. Responsive và Core

Desktop rộng có ba cột; mục tiêu và ba vị trí trang bị nhìn thấy khi mở ở board 1366. Bề ngang vừa có hai cột, bộ vận dụng chuyển xuống dưới. Mobile ưu tiên nền/mục tiêu rồi bộ vận dụng và thân phận/linh ảnh; cuộn bên trong nội dung, giữ điều hướng/đóng cửa sổ. Không ép ba cột bằng cách thu nhỏ chữ.

Core giữ avatar, tab/thuật đang đọc và nguồn quay lại nhiệm vụ; presenter đọc projection/shared; adapter trang nối click/phím/focus/clock. CSS chỉ scope review. Không import module này vào server/live session. Không thêm gameplay API, WebSocket, local/session storage hoặc SQLite mutation; không chạm map, blocker, bậc thang hay ART nhân vật owner.

## 6. Kiểm chứng và phần còn lại

[Báo cáo kỹ thuật](data/dao-character-v4-verification.json) lưu cấu hình/luồng/hash nguồn. Đã kiểm các ngưỡng và hồi phục linh thể, route từ bài học/thuật/trang bị, focus, hai theme và chữ ở nhiều kích thước. Hồi quy luồng đồ 03, diện mạo, HUD/layer fixture, typecheck và Vite build được ghi cùng báo cáo.

Board review có chiều cao riêng để đánh giá thông tin. Còn phải nghiệm thu viewport native khi tích hợp, đối chiếu ART nhân vật mới và thử với người chơi. Test không suy ra ownerApproved/artApproved hoặc tính cân bằng. Skin mới chưa nối vào game thật; GDD và migration/save chưa đổi theo thiết kế này.
