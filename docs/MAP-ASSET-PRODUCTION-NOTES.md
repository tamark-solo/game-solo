# Phân công xây map — 08/10/2026

**Reset 08/10/2026:** bộ map/asset cũ đã xóa theo yêu cầu. [Thư viện mới](design/world/map-asset-library/README.md) trống; chưa chốt ART tham chiếu mới. Giữ editor và dữ liệu người phát triển. Xem [biên bản](MAP-ASSETS-RESET.md).

Người phát triển chọn **tự ghép map, sắp layer và vẽ vùng hoạt động trong editor của dự án**. Trợ lý sản xuất asset rời theo tham chiếu và xây/sửa công cụ. Không tiếp tục tự thiết kế bố cục/vùng chặn như các bản thử trước.

[Map Editor](MAP-EDITOR.md) là nơi làm việc hiện tại. Gói asset (bộ cũ đã xóa) có PNG native/part, nguồn/prompt, metadata và ZIP. Cây/cổng có frame chung để bớt mask tay; bụi/hoa/đá thấp có thể thành cụm, giữ nguồn chỉnh lại.

Quy trình: người phát triển chọn nhóm/khu và mẫu → trợ lý tạo/chỉnh asset bám chính crop tham chiếu → bàn giao PNG/source/part → người phát triển đặt trong editor, chọn pivot/layer và tự vẽ vùng → Test/lưu/xuất → kiểm map cụ thể. Chất lượng ART và kỹ thuật lưu riêng; đồng ý cách làm không tự duyệt mọi PNG.

Dữ liệu trong `docs/data/authored-maps/` thuộc bố cục do người phát triển biên tập. Khi sửa engine/editor, dùng fixture/test storage riêng; không sửa hoặc thay các map đó để né lỗi công cụ. Nếu người phát triển yêu cầu chỉnh chính map, làm trong đúng phạm vi yêu cầu.

MP01–MP07 và MAP03 cũ giữ lịch sử về tham chiếu/tỷ lệ/lỗi. Ưu tiên hiện tại là công cụ và thư viện; gameplay/online và chân dung tiếp tục sau map. Không tự quay về sinh một map ghép mới thay phần việc người phát triển đã chọn làm.
