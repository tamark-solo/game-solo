# Bắt đầu lại thư viện map

**Ngày:** 08/10/2026. **Bản chạy:** 0.11.1. Người phát triển yêu cầu xóa các asset map cũ để bắt đầu từ đầu.

Đã xóa ART môi trường cũ, nguồn/prompt, các bản xuất/chunk/mask, PNG thư viện, ZIP và bản sao public của bộ sân môn phái, hybrid study, map-art, layered map và native pilot. Các builder và kiểm tra gắn riêng với bộ ART cũ được gỡ để build không tạo chúng lại. Bản build được dựng lại sau khi dọn. [Biên bản xóa](data/map-assets-reset.json) ghi danh sách file.

Giữ công cụ editor, API lưu local, schema level, dữ liệu gameplay nháp và toàn bộ asset nhân vật. Không xóa/sửa dự án của người phát triển trong `docs/data/authored-maps/` hoặc bản nháp trình duyệt. Lần tải đầu sau reset mở một dự án mới với thư viện trống; những bản nháp trước vẫn có trong Mở bản lưu. Nếu bản cũ dùng preset đã bị xóa, editor báo asset thiếu thay vì thay đổi bản lưu.

**Trạng thái hiện tại:** [thư viện mới](design/world/map-asset-library/README.md) có 0 asset; chưa có ART tham chiếu hoặc bố cục map mới được chốt. Các kế hoạch MP01–MP07 và MAP03 trước đã dừng. Không tiếp tục dựng lại bộ cũ từ ghi chú lịch sử.

Người phát triển tự bố trí map, layer và vùng đi/chặn trong `/map-editor.html`. Bước sau là chọn danh sách asset mới cần sản xuất. Giữ tỷ lệ nhân vật 64 × 96, chân (32,88), mặc định 1× và [quy tắc xây map](MAP-BUILDING-GUIDE.md). Chưa chuyển sang nhiệm vụ/combat/loot/đột phá hoặc chân dung UI.
