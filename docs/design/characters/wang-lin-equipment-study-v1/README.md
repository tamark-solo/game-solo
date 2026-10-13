# Vương Lâm · nghiên cứu trang bị neutral01

**13/10/2026:** owner yêu cầu bám sát Vương Lâm đang dùng trong game để có nhiều trải nghiệm khi mang vũ khí/pháp bảo; chọn làm cả kiếm, trường thương, linh phiến và hồ lô, đồng thời học thêm góc nhìn về thời trang và trang bị. Gói này là bốn neutral trang bị hướng Đông Nam ghép trên **đúng thân live nguyên byte**, cùng hồ sơ reference và22brief mở rộng.

**Phản hồi owner sau khi xem:** hình còn nhạt, chưa được chọn; muốn bám pháp bảo nổi bật trong truyện Tiên Nghịch và học thêm game tu tiên. Giữ v1 như thử nghiệm kỹ thuật/reference, không làm mốc ART để production. Hướng tiếp theo nằm trong gói mới riêng.

- [Review native](index.html): lineup live + bốn món, cặp chọn riêng,1×/2×/4× nearest, nền sáng/tối/xám, bật/tắt thân/trang bị và điểm chân/canvas; ảnh raw và prompt mở được từ mỗi món.
- [Manifest](manifest.json) / [registration](registration.json): nguồn, hash, kích thước thực, crop/alpha/resample, canvas/pivot và vị trí layer.
- [Reference đã đọc và xem](reference-study.md): các bộ kiếm/thương/quyền trong `docs/art_reference`,18PNG trực tiếp và nguồn thị trường chính thức; phân biệt quan sát với ý tưởng suy ra.
- [22brief](ideas.md): sáu họ áo, tám họ vũ khí, tám họ pháp bảo; mục tiêu trải nghiệm, nhu cầu motion/FX, ưu tiên và trạng thái đề xuất.

## Contract thân và layer

`inputs/wang-lin-live-southeast-native.png` là frame thật Vương Lâm Pixel02 live,64×96/chân(32,88). Review dùng lại ảnh đó cho cả năm vị trí, không tái vẽ, resize hoặc đổi scale người. Trang bị dùng canvas128×128/neo(48,112); đặt thân tại offset(16,24), nên điểm chân gốc vẫn trùng world foot(48,112). Canvas lớn hơn chỉ thêm padding.

Thứ tự ghép tĩnh: **rear equipment → body live → front equipment**. Phần bàn tay lấy từ thân gốc để tách quan hệ trước/sau trang bị; không sửa bitmap body. Grip/occlusion chỉ được đăng ký cho neutral này. Không dùng một socket tĩnh cho mọi action hoặc mọi hướng. Khi tắt trang bị, trang review chỉ còn đúng thân live; khi tắt thân, đọc riêng mép alpha của layer trang bị.

Nguồn ImageGen giữ nguyên trong `sources/`, gồm source PNG/prompt và metadata do root ghi. Nguồn quạt/hồ lô có haze alpha yếu; bước kỹ thuật alpha nhị phân/nearest resample ghi trong registration, không repaint thành body/pose mới. Cần đọc mép tại1×trên cả nền sáng/tối/xám. Nguồn lớn là tham khảo thiết kế món đồ; bản native và ghép live là mục tiêu đánh giá trang bị.

## Phạm vi hiện tại

Bốn mẫu có **một pose neutral/một view Đông Nam**. Bộ này chưa có bảy hướng còn lại, idle/run/combo/cast hoặc motion pháp bảo, VFX mới, wardrobe sprite hoặc trang bị/runtime. Thương neutral ghép vào tay sẵn có chỉ giúp so silhouette; một trường thương dùng hai tay cần pose/grip thật trước khi production. Hồ lô cầm tay chưa bao gồm form đeo hông hoặc bay. Review là HTML/Canvas đọc manifest; không backend, storage, gameplay command hoặc fake animation.

Giữ nguyên nguồn/atlas live, map owner/9blocker, navigation, station/receipt, save/DB và catalog runtime. Hash/alpha/canvas kiểm kỹ thuật tách với anatomy/grip/ART review; không suy `ownerApproved`/`artApproved` từ việc trang nạp được hay kiểm qua.

## Trình tự production tiếp theo

1. Chốt từng neutral tại native1× theo hash: kích thước/silhouette trang bị, nhận diện người, grip và quan hệ layer.
2. Tạo bảy view thật với Vương Lâm đúng hướng làm chuẩn người. Giữ scale source chung; đăng ký grip/tip/front/rear theo view, không mirror để tuyên bố đủ bộ.
3. Tạo pose/motion cần cho từng họ: kiếm một tay, thương hai tay, quạt đóng/mở, hồ lô đeo/cầm/điều khiển. Body/weapon/trail dùng chung clock, socket/frame và timeline; FX tách body.
4. Kiểm đổi hướng/đổi action/đổi món, body-only, alpha, native/map1×và mái/tán trên fixture. Chốt production ART/motion riêng, rồi nối entitlement/equipment/Core theo quyền server trong phạm vi triển khai mới.

Không nhân số lượng màu/áo trước khi chứng minh một người giữ anatomy qua motion và đổi trang bị. Ưu tiên sau neutral: hai kiếm cùng họ, một áo nhập môn giữ pose live, và một pháp bảo bay có timeline riêng.
