# Thư viện asset map mới

**Ngày 08/10/2026:** đã xóa bộ map và asset cũ theo yêu cầu của người phát triển. Thư viện hiện có **0 asset**, không chứa PNG, ZIP, nguồn hoặc bố cục cũ.

ART Hằng Nhạc v1/v2/v3 và hai bản thử vùng đi đã [xóa](../../../MAP-ASSETS-RESET.md). Đợt concept/nền sạch/ba asset thử sau đó cũng đã xóa. Chủ dự án chọn map đầy đủ trước để vẽ navigation, asset rời sau. Manifest sản xuất mặc định vẫn trống; gói map mới được bàn giao riêng.

Manifest giữ hợp đồng dữ liệu cho Map Editor; `npm.cmd run assets` đồng bộ thư viện ra `/assets/map-kit/`. Editor nhận PNG/WebP tự nhập và có công cụ layer, vùng đi/chặn, portal, lưu/xuất/nhập và Test.

Đã bàn giao riêng [map đầy đủ mới](../hang-nhac-map-v1/README.md): một nền WebP 3072 × 2048/3,01 MB và dự án Editor 4,01 MB. Bộ concept/nền/ba asset thử trước đã xóa. Không tự nhập vào nháp hoặc đổi manifest mặc định này.

Asset/preset mới được sản xuất hoặc bổ sung theo yêu cầu. Runtime/editor giữ frame người 64 × 96, chân (32,88), cỡ chơi 1×; VFX R01 canvas 96 × 96/body 80/chân (48,88) dùng hợp đồng ART riêng. PNG nhiều part dùng chung canvas/pivot; nền sạch, vật thể và phần che có alpha riêng. Thư viện không tự cung cấp vị trí hoặc vùng chặn.

Nguồn ART mới phải có prompt/input nếu dùng imagegen, metadata kích thước/pivot/part và trạng thái đánh giá hình ảnh riêng. Xem [quy tắc xây map](../../../MAP-BUILDING-GUIDE.md), [phân công](../../../MAP-ASSET-PRODUCTION-NOTES.md) và [Map Editor](../../../MAP-EDITOR.md).
