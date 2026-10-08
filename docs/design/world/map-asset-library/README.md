# Thư viện asset map mới

**Ngày 08/10/2026:** đã xóa bộ map và asset cũ theo yêu cầu của người phát triển. Thư viện hiện có **0 asset**, không chứa PNG, ZIP, nguồn hoặc bố cục cũ.

Manifest giữ hợp đồng dữ liệu cho Map Editor; `npm.cmd run assets` đồng bộ thư viện ra `/assets/map-kit/`. Editor vẫn nhận PNG tự nhập và có công cụ layer, vùng đi/chặn, portal, lưu/xuất/nhập và Test.

Các asset mới chỉ được tạo theo yêu cầu tiếp theo. Giữ frame người 64 × 96, chân (32,88), cỡ chơi 1×. PNG nhiều part dùng chung canvas/pivot; nền sạch, vật thể và phần che có alpha riêng. Thư viện không tự cung cấp vị trí hoặc vùng chặn.

Nguồn ART mới phải có prompt/input nếu dùng imagegen, metadata kích thước/pivot/part và trạng thái đánh giá hình ảnh riêng. Xem [quy tắc xây map](../../../MAP-BUILDING-GUIDE.md), [phân công](../../../MAP-ASSET-PRODUCTION-NOTES.md) và [Map Editor](../../../MAP-EDITOR.md).
