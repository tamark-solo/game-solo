# Bắt đầu lại thư viện map

**Ngày reset:** 08/10/2026. **Bản tại thời điểm reset:** 0.11.1; công cụ hiện tại 0.12.0. Người phát triển yêu cầu xóa bộ asset map legacy để bắt đầu lại thư viện.

Đã xóa ART môi trường cũ, nguồn/prompt, các bản xuất/chunk/mask, PNG thư viện, ZIP và bản sao public của bộ sân môn phái, hybrid study, map-art, layered map và native pilot. Các builder và kiểm tra gắn riêng với bộ ART cũ được gỡ để build không tạo chúng lại. Bản build được dựng lại sau khi dọn. [Biên bản xóa](data/map-assets-reset.json) ghi danh sách file.

Giữ công cụ editor, API lưu local, schema level, dữ liệu gameplay nháp và toàn bộ asset nhân vật. Không xóa/sửa dự án của người phát triển trong `docs/data/authored-maps/` hoặc bản nháp trình duyệt. Lần tải đầu sau reset mở một dự án mới với thư viện trống; những bản nháp trước vẫn có trong Mở bản lưu. Nếu bản cũ dùng preset đã bị xóa, editor báo asset thiếu thay vì thay đổi bản lưu.

**Thư viện editor hiện tại:** [manifest mới](design/world/map-asset-library/manifest.json) vẫn có 0 asset nhập sẵn. Các kế hoạch MP01–MP07/MAP03 và nguồn ART legacy đã dừng; không tiếp tục dựng lại bộ cũ từ ghi chú lịch sử.

**Đợt xóa Hằng Nhạc tiếp theo — 08/10/2026:** theo yêu cầu mới nhất, đã xóa toàn bộ ART v1/v2/v3 và hai bản thử vùng đi v1/v2: **203 file, gồm 121 PNG** (203.254.855 byte). Phạm vi gồm nền, part/lớp, ảnh review, prompt/input, metadata, script/trang duyệt và dữ liệu vùng đi trong năm thư mục đó. Không có PNG trùng khớp bên ngoài các thư mục đã dọn. [Biên bản riêng](data/hang-nhac-art-removal-2026-10-08.json) ghi đường dẫn, dung lượng và SHA-256 của từng file; không lưu bản sao ART.

Mốc chấp nhận mỹ thuật v3 trước đó thuộc lịch sử của bộ đã xóa, không còn là tham chiếu sản xuất hiện hành. [Bố cục HN-Z01–Z08](HANG-NHAC-MAP-LAYOUT.md) và JSON đề xuất được giữ làm tham chiếu, chưa khóa kế hoạch map mới. Editor, bản lưu trong authored-maps, bản nháp trình duyệt, nhân vật và VFX được giữ.

**Đợt dọn bộ thử mới — 08/10/2026:** đã xóa concept tổng mới v1, nền sạch, ba asset thử cùng bản xuất/trang xem và builder gắn riêng: 105 file, 166.784.897 byte. [Biên bản](data/hang-nhac-review-reset-2026-10-08.json) giữ danh sách/hash, không giữ bản sao ART. Các URL cũ chỉ còn thông báo chuyển sang bản mới.

**Bước hiện tại:** [map đầy đủ mới](design/world/hang-nhac-map-v1/README.md) dùng một ảnh đủ công trình, đúng tỷ lệ sprite gốc, làm căn cứ để chủ dự án vẽ luồng đi/chặn trước. Sau khi chốt footprint mới sản xuất asset rời. Chưa có collision/portal/che người hoặc map MMO hoàn chỉnh. Không khôi phục bộ đã xóa.

Trợ lý dựng map tổng theo yêu cầu; người phát triển chỉnh map/layer và tự vẽ vùng đi/chặn trong `/map-editor.html`; trợ lý tiếp tục asset/công cụ theo yêu cầu. Runtime/editor giữ nhân vật 64 × 96, chân (32,88), mặc định 1×. VFX R01 dùng canvas 96 × 96/body 80/chân (48,88), không thay hợp đồng runtime. Xem [quy tắc xây map](MAP-BUILDING-GUIDE.md). Chưa chuyển sang triển khai nhiệm vụ/combat/loot/đột phá hoặc chân dung UI.
