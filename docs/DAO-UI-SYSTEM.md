# Hai bộ UI–HUD theo đạo lộ

**Bộ HUD toàn hệ 03:** [24 lối chức năng và đủ vùng HUD](FULL-HUD-SYSTEM-DESIGN.md) theo yêu cầu ưu tiên mới của owner đã ghép vào trang đối chiếu. [48 icon/prompt](design/ui/dao-system-hud-v1/README.md) có hai bộ Tu Đạo/Đọa Ma; chưa gameplay/skin runtime.

**Bố cục màn chơi chính:** [tư vấn HUD/UX tổng thể](MAIN-GAME-HUD-UX-DIRECTION.md) bổ sung danh tính/định hướng/tiến trình/target/tracker/giao tiếp/lối chức năng sau phản hồi ảnh chế độ chỉ HUD. Dùng chung bố cục cho hai theme; mới là đề xuất, chưa đổi game.

**Tiếp nối 11/10:** owner **tạm chấp nhận** hai bộ và yêu cầu thêm thiết kế nhân vật/hành trang. [UI 02 và reference](CHARACTER-INVENTORY-UI-DESIGN.md) phát triển ba màn Linh Đài/Trữ Vật Nang/Diện Mạo trên cùng hai theme, giữ contract gameplay ở dưới; chưa có diện mạo/tọa kỵ/Đọa Ma runtime. Phản hồi là chấp nhận tạm thời để tiếp tục thiết kế, không khóa artwork hoặc balance.

**11/10/2026 · Yêu cầu trực tiếp của owner:** làm mới bộ UI–HUD để cùng map/style hiện tại; làm hai bộ vì người chơi tới **Hóa Thần** sẽ có chức năng **Đọa Ma**, khi đó HUD–UI thay đổi. [GDD](GDD.md), [Core](ARCHITECTURE.md), [hành trình MMORPG](MMORPG-PROGRESSION-PLAN.md) là hồ sơ đối chiếu. Hướng và mốc do owner yêu cầu; artwork mới vẫn cần đánh giá riêng.

## Nhận diện và tính liên tục

| Bộ | Hình ảnh | Vùng đọc | Dấu nhận diện |
| --- | --- | --- | --- |
| `tu-dao` · Tu Đạo / Thanh Ngọc | Đá ngọc xám sáng, đường khắc mây thanh, ngàm đồng nhỏ; nét vẽ theo map Hằng Nhạc | Nền mực xanh xám, giấy ngọc sáng, chữ xanh mực | Cảm giác môn phái cổ và vận khí ổn định |
| `doa-ma` · Đọa Ma / Huyền Nham | Huyền nham, kim loại sẫm, đường khắc/vết nứt mang ma khí đỏ tiết chế; cùng họ hình khối | Ma giản tối, chữ ngà/ánh tro, điểm nhấn huyết đồng | Cảm giác chuyển đạo lộ; tránh gothic, xương/sừng hoặc toàn màn đỏ |

Hai bộ có asset riêng cho HUD, cửa sổ, nút và atlas ba kỹ năng; bộ Đọa Ma được vẽ thành biến thể vật liệu/hoa văn, không dùng filter đỏ cho cả bộ Tu Đạo. Cùng vị trí thao tác, shortcut, logic tooltip và vùng đọc. HP vẫn đỏ, MP vẫn ngọc/xanh lạnh; màu ma khí không thay nghĩa tài nguyên, độ hiếm hoặc trạng thái hoàn thành.

Desktop giữ khung 760 × 140, 10 ô 36 px/ba skill R01; bảy ô chưa gán không có hành động. Vị trí/đường kính cầu trong từng ảnh mới được đo và dùng để đặt HTML, không ép vào vị trí khung cũ rồi che sai lệch. Màn nhỏ giữ ba nút 48 px. Frame/backing dùng cùng slice và aperture để giữ resize đúng.

## Mốc và trạng thái gameplay cần nối sau

- Hóa Thần là mốc có chức năng Đọa Ma theo yêu cầu owner. **Có chức năng** và **đã kích hoạt trạng thái Đọa Ma** là hai dữ kiện khác nhau; chỉ dữ kiện sau quyết định bộ UI đang dùng.
- Đạt mốc không tự biến mọi người chơi thành Đọa Ma. Khi gameplay xác nhận trạng thái Đọa Ma, các presenter đổi cùng bộ; trạng thái kỹ năng, loadout, HP/MP và cửa sổ đang đọc vẫn giữ.
- Chi phí/điều kiện bổ sung, ảnh hưởng chiến đấu/truyện/PvP, cách quay về và tính vĩnh viễn của chuyển đạo lộ chưa được owner chốt. Không suy các policy này từ tranh UI hoặc dropdown đối chiếu.
- Hằng Nhạc hiện chỉ có nhập môn/M01; chưa có runtime Hóa Thần/Đọa Ma. Bộ tối trên trang đối chiếu là preview để kiểm hình, không mở quyền/cảnh giới cho hồ sơ nhập môn.

## Hợp đồng Core/backend dự kiến

1. Domain progression/dao-state sở hữu cảnh giới, điều kiện mở và trạng thái đã kích hoạt. UI không suy quyền từ avatar, màu frame, URL, localStorage hay màn đang mở.
2. Khi triển khai: application xác nhận command có request ID/receipt, điều kiện và ownership; adapter persistence commit trạng thái với revision. Cần schema/migration tương thích save hiện tại và kiểm retry/reconnect, không thêm một boolean tùy tiện vào snapshot client rồi tự coi gameplay đã có.
3. Snapshot gửi **theme ID hữu hạn** (`tu-dao`/`doa-ma`) + version trình bày hoặc dao-state đã xác nhận để resolver thuần ánh xạ. Không gửi script/CSS hoặc đường dẫn asset tùy ý từ hồ sơ.
4. Renderer/presenter nhận theme và số liệu đã xác nhận. `SkillHotbar` giữ callback/snapshot; lớp FX sở hữu trang trí; đổi theme không cast, trừ MP, reset cooldown, đổi mục tiêu hay ghi thưởng.
5. Khi skin tải lỗi: giữ số liệu và khả năng thao tác, báo thiếu hình, dùng fallback rõ ràng. Theme sai/không nhận diện không mở Đọa Ma. Client/server cùng version DTO khi tích hợp.
6. Audit cần truy vết ai đổi đạo lộ, command/revision, nguồn mở quyền và trạng thái trước/sau; không ghi mật khẩu/token, không nhân reward/chi phí khi replay. Đo tải/asset/memory khi nhiều profile/chặng; không tải cả master PNG vào trang chơi.

Đây là hợp đồng thiết kế cho bước gameplay sau, chưa thêm field/schema/command vào DB/room hiện tại. [MMORPG contracts](MMORPG-SYSTEM-CONTRACTS.md) tiếp tục sở hữu nguyên tắc server authority/save/receipt.

## Bản có thể xem

[Trang đối chiếu](http://127.0.0.1:5174/ui-material-review.html) có Tu Đạo, Đọa Ma và HUD hiện hành để tham chiếu; dùng cùng dữ liệu fixture, sổ nhiệm vụ và hành trang. [ART/prompt/metadata và kiểm](design/ui/dao-dual-theme-v1/README.md). Bản Cổ đồng trước giữ làm lịch sử, đã được thay trong route đối chiếu theo phản hồi owner.

Nhân vật đang được owner làm lại; không sản xuất/sửa portrait/atlas hoặc suy tỷ lệ cuối. Map owner, navigation, backend/save và skin game hiện hành không thay trong đợt tạo hai bộ ART này.
