# Sáu NPC Wave A — neutral Đông Nam V1

Tiếp nối yêu cầu “tôi đồng ý làm tiếp nhóm tiếp theo” ngày13/10/2026, gói này đã có sáu tạo hình neutral Đông Nam theo GDD: **Bạch Chỉ, Tống Thiết, Hứa Hành, Đinh Sóc, Kỷ An và Phùng Dã**. Sáu nguồn được xem ở raw/native, đăng ký chân và xuất64×96 để đối chiếu trực tiếp với Vương Lâm. **Chưa có clip animation trong gói này.** Tạo hình mới là ứng viên chờ owner xem trước khi mở bộ idle/talk.

| NPC | Vai trò | Nhận diện GDD |
| --- | --- | --- |
| Bạch Chỉ | Dược sư ngoại viện | Nữ khoảng30, áo lá trà/ngà, tay áo gọn, giỏ dược/chày ngọc |
| Tống Thiết | Luyện khí sư | Nam lớn tuổi, tóc bạc ngắn, tạp dề nâu tro/vai áo đồng, kìm/phôi mộc kiếm |
| Hứa Hành | Người giữ tuyến | Nam trưởng thành, choàng xám ngắn vá lệch, ống bản đồ/dây niêm, giày bùn |
| Đinh Sóc | Hộ sơn đệ tử | Nam trẻ, áo xanh sẫm/giáp vai đồng nhẹ, thương nhỏ chéo thấp, thẻ tuyến |
| Kỷ An | Đệ tử vận khí | Nữ trưởng thành, áo lam nhạt/tóc buộc ngắn, bầu nước/trúc giản học dở |
| Phùng Dã | Đệ tử luyện kiếm | Nam trưởng thành, tóc dựng gọn/áo xanh tro, mộc kiếm xước/vải tay đỏ nâu |

[Production plan](production-plan.json) chép đúng sáu record từ [GDD living-world](../../world/van-hai-living-world-v1/plan.json), pin SHA2569890bf1589b6efdc2858fcca2f1e1d56d6a5ec4b2e58238ab5c297d4bbefa576. Brief tiếng Anh giữ tuổi, giới, tính cách, phục trang và đạo cụ; tóc để đơn giản ở ba NPC mà GDD chưa mô tả tóc. Không lấy NPC khác làm chuẩn phong cách.

## Chuẩn hình và nguồn

**Image1 là Vương Lâm Pixel02 Đông Nam đang dùng trong game**, enlarged nearest8x nguyên pixel. Sáu request đầu chỉ dùng ảnh này. Kỷ An r2 bổ sung nguồn của chính Kỷ An ở Image2 để giữ nhận diện khi sửa tóc, Wang vẫn ở Image1 và giữ chuẩn anatomy/style. [Basis](../van-hai-npc-visual-standard-v1/basis.json) và [directions](../van-hai-npc-visual-standard-v1/directions.json) nối frame thật của atlas live, có hash đối chiếu. Nhận diện riêng của từng NPC được mô tả bằng brief GDD. Ảnh native64×96 có trong inputs để so trực tiếp ở1×/2×.

Người dùng canvas64×96, chân(32,88), body đứng80px. Đầu/tóc khoảng nửa chiều cao, thân/chân ngắn gọn và cụm pixel rộng theo live Wang. Height80 đơn lẻ không chứng minh anatomy đúng. Một scale đo từ neutral cho mỗi nguồn; không fit/deform từng pose. Đạo cụ giữ nhỏ và chân đo từ đế giày: mũi thương Đinh Sóc thấp hơn giày khoảng3px native, được giữ trong padding dưới chân; không dùng đáy thương làm world foot. Hứa Hành đo cả hai giày vì band tự động chỉ bắt giày gần. Phôi Tống Thiết là **mộc kiếm** theo GDD. Qi, lửa lò, bóng và FX không bake vào body.

Mỗi request1024×1536/high dùng router gpt-image-2, có spec/prompt/MCP plan lưu trước khi POST. Router có thể trả kích thước khác; giữ nguyên raw/metadata và đo ảnh thực. Nguồn mới vẫn candidate. Quyền retry JSON của motion V2 chỉ áp V2; gói này không tự retry POST.

## Duyệt và kiểm kỹ thuật

[Trang review](index.html) đọc đủ sáu nguồn thực đã kiểm và đăng ký chân, có chọn NPC, map/sáng/tối, native1×/2×, chân/silhouette, hàng đối chiếu sáu người và brief GDD. Kỷ An r1 giữ làm nguồn bị thay; r2 đã sửa tóc buộc ngắn và bỏ búi cao/dải buộc dài. Catalog, source assessment và registration pin đúng nguồn chọn; build/test không mở duyệt ART.

Kiểm đã qua36 cặp stage pixel trên6NPC×3nền×2zoom,6 card alpha/RGB,14 sprite trong hai hàng lineup và mobile390; không lỗi JS,404,API hoặc ghi storage. Six-sprite Three.js có alpha/pivot khớp từng pixel và sai lệch màu tối đa0.107pin pilot Đông Nam và9pin bàn giao motion V2 giữ nguyên. Hồ sơ bàn giao theo hash: review/delivery.json; ảnh so chung: review/lineup-2x.png.

Các giới hạn còn lại được trình bày theo NPC: khuôn mặt Bạch Chỉ/Phùng Dã còn trẻ, nét tính cách ở cỡ nhỏ và chi tiết ống bản đồ/dây niêm/vết xước khá nhỏ. Head/chin metrics chỉ là phép đo hỗ trợ; kiểu tóc khác nhau không chứng minh skull giống tuyệt đối. Sáu tạo hình đều là review-candidate, chưa ownerApproved/artApproved/runtimeImported.

Các file gói:

- prepare.mjs chỉ chuẩn bị gói mới, chặn ghi đè plan/raw hiện có; không gọi API.
- prompts, specs, plans, inputs và production-plan.json lưu brief/reference/hash.
- raw lưu PNG/JSON router nguyên bản; inspect.mjs dựng guide để kiểm ảnh.
- pack.mjs xuất native theo một scale/source và root đã xác nhận; không vẽ hoặc tạo pose mới.
- catalog/review/registration chỉ mô tả sản phẩm thực đã đóng; flags owner/art/runtime giữ false tới khi có quyết định đúng phạm vi.

Gói không sửa NPC station, receipt, quyền cửa, save, nhiệm vụ, owner map, blocker hoặc DB. Bộ motion bốn NPC V1/V2 và các hash đã pin tiếp tục là bộ riêng.

## Motion tiếp theo theo GDD

[Motion brief](motion-plan.json) ghi ma trận **idle/talk×8 view thật cho sáu NPC**:96clip là mục tiêu tối thiểu của giai đoạn motion về sau, chưa sản xuất ở đây. Một cử chỉ nghề mỗi NPC là phần secondary; nếu triển khai đủ tám hướng sẽ thêm48clip. Không mirror để giả đủ view.

Kỷ An có loop GDD “đọc giản → đặt bầu nước → vận khí”; Phùng Dã có “chỉnh thế → nhìn mũi kiếm → nghỉ tay”. Cử chỉ kiểm lá/chày của Bạch Chỉ, kiểm kìm/phôi của Tống Thiết, mở bản đồ/kiểm niêm của Hứa Hành và kiểm thẻ/đứng gác của Đinh Sóc là **pose biên soạn từ vai trò/đạo cụ**, được đánh dấu riêng; GDD chưa quy định nguyên chuỗi pose đó.

Sau neutral review, view mới tiếp tục dùng Wang cùng hướng Image1 và nhận diện riêng NPC ở input hỗ trợ. Action khóa mặt/tóc/anatomy/phục trang của chính NPC; action-correction cùng NPC/cùng hướng chỉ dùng target Image1 khi ghi rõ policy, WangImage2 PRIMARY và chứng minh nguồn gốc Wang-first. Tất cả tiếp tục so Wang native1×. Bản brief này không tạo lịch sinh hoạt chung hay điều khiển NPC trên server; gesture chỉ tại chỗ và không phát lệnh/thưởng/damage. Runtime là phạm vi riêng khi được yêu cầu.
