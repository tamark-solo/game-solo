# Khí tức Hóa Thần · nghiên cứu hình và độ nổi bật 04

**12/10/2026 · owner đã chốt cả ba concept ART.** [Biên bản theo hash](design/vfx/hoa-than-aura-concepts-v4/approval.json) và [thư viện giữ cho tùy biến nhân vật](design/characters/character-customization-library-v1/README.md). Duyệt hình concept tĩnh; chưa layer/animation production. Owner làm rõ bản 03 vẫn chìm và yêu cầu tìm thêm ý tưởng thiết kế. Ưu tiên đợt này là hình/màu/độ nổi ở camera 1×. [Bảng so sánh](http://127.0.0.1:5174/van-hai-character-review.html#qi-concept-review) có ba hướng mới, dùng đúng PNG chibi hiện hành; nút card chọn mẫu và đưa về map 1×. Đây là nghiên cứu hình tĩnh, chưa thay atlas skill/gameplay hoặc motion production.

## Reference đã kiểm

| Nguồn chính thức | Nội dung có căn cứ | Cách áp dụng riêng cho Vân Hải |
| --- | --- | --- |
| [Kiếm Võng 3 Duyên Khởi · 星渊, 15/06/2026](https://jx3yq.xoyo.com/show-5728-2079-1.html) | Mô tả quầng kim quanh thân, tinh quang và mảnh tinh thể; hiệu ứng appearance riêng | Dùng một hình lực lớn và ít điểm sáng rõ, thay vì chỉ sương mỏng |
| [Kiếm Võng 3 Duyên Khởi · 天星长坠, 27/10/2025](https://jx3yq.xoyo.com/show-5728-1933-1.html) | Thiết kế nhật–nguyệt, trắng/kim; mô tả tinh quang, vật thể thiên văn và trận dưới đất | Tách nhận diện quầng thân/vòng đất; Luân Sinh Tử có hai dòng sáng/tối |
| [Riot · Clarity in League, 12/03/2021](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/) | Giữ silhouette/nhận diện và phân cấp độ gây chú ý của VFX | Khóa người hiện hành; chọn vài điểm nhấn thay vì phủ sáng toàn thân |
| [Riot · Modernizing the Monk, 08/04/2024](https://www.leagueoflegends.com/en-us/news/dev/dev-modernizing-the-monk/) | Đơn giản hóa decal/hình, giữ ngôn ngữ hiệu ứng; giảm khói/rối trong Storm Dragon | Giảm sương, tăng shape rõ. Độ nổi phải cân với việc đọc người/đòn khi sản xuất |

Đã đọc trang/mô tả chính thức; CDN ảnh JX3 timeout khi mở, không coi là đã xem đầy đủ chuyển động/ảnh gameplay của họ. Trang PoE Celestial Aura đã tìm nhưng không đủ chi tiết visual để dùng làm căn cứ chính. PDF/guide Riot cũ chuyển hướng, dùng hai bài dev đang truy cập được. Không nhập/copy asset của các game tham khảo.

**Nhận định thiết kế của đợt này:** nền Vân Ngọc sáng/ngọc/tan nhiều chi tiết; sương bạc ngọc alpha thấp và thiếu mảng đỡ sẽ khó phân biệt. Mảng chàm/đen giữ silhouette của khí, màu trung gian bão hòa nối vào lõi sáng nhỏ. Đây là cách áp dụng của chúng ta, không lời trích nguyên văn từ nguồn. Quầng appearance không được hiểu là hitbox/tầm đánh.

## Ba ý tưởng riêng

| Hướng | Hình lực / màu | Vai trò đề xuất |
| --- | --- | --- |
| **Luân Sinh Tử** | Luân ấn kim–ngà đối với mực chàm, vài ấn lớn; vòng đất cùng ngôn ngữ | Tu Đạo ưu tiên, gợi đối lập sinh/tử |
| **Kiếm Vực Huyền Ngọc** | Ba kiếm ảnh lam trắng, viền navy, điểm vàng; hình fan rõ | Lựa chọn thiên về đấu pháp; chưa pháp bảo/kỹ năng/công pháp được thêm |
| **Huyết Nguyệt Ma Vực** | Huyết nguyệt lệch vai, mảnh khí đen sắc và lõi đỏ trắng, ít khói tím | Đọa Ma ưu tiên, khí chất đối lập Tu Đạo |

Tên/hình đều là nhãn concept của Vân Hải, không khẳng định là biểu tượng/trang phục nguyên tác hoặc quyền đã mở. Mỗi hướng có source/prompt ImageGen riêng. [Gói ART](design/vfx/hoa-than-aura-concepts-v4/README.md) giữ metadata/hash/source/prompt và body reference.

## So native / giới hạn

Body dùng nguyên Sinh Tử/Huyền Tử 02: 64 × 96, chân (32,88), dáng 45 × 80. Plate concept 128 × 176, neo ellipse đất (64,152), ghép local (-32,-64). Gallery cùng 2×; map 1×/2× áp cùng phép chiếu, không fit/scale body theo plate. Tâm vòng chân được đăng ký theo nguồn và xem cùng overlay người, không lấy tâm bounds toàn ảnh.

Mẫu mới cố ý có hình rộng/cao để so độ nổi. Khi chọn sản xuất phải cân lại chiếm màn hình khi nhiều người, footprint ellipse, cạnh gợi trang sức vs khí, chuyển động/timing và mức đầy đủ/rút gọn. Plate hiện là **một lớp ART phía sau để nghiên cứu**, chưa tách ground/rear/front/clip; không suy từ PNG lớn rằng đủ tám hướng hoặc atlas FX đã xong. Tách layer theo [contract khí tức](CHARACTER-AURA-LAYERS.md) sau khi chọn ý tưởng, giữ người gốc.

Default vẫn có nhịp review 03; chọn menu **Ý tưởng khí tức** hoặc card để xem một mẫu 04 tĩnh. Khi đang so concept, nhịp 03 trên actor được ẩn và nút tụ khí dừng; trả về “Nhịp khí 03” phục hồi. Chọn áo nhập môn/mẫu khác thoát concept, không ghép nhầm đạo hoặc hai FX lên nhau. Gallery/selector/card cùng catalog Core, không ghi storage/API/DB/map/GDD.

[Kiểm chứng](data/hoa-than-aura-concepts-v4-verification.json): năm viewport/35 layout/158 kiểm nguồn–PNG–pixel người–gallery–map–neo–selector–thoát/toggle. Typecheck/boundary/Vite build qua. Đã xem bản desktop và ba mẫu trên map 1×. Kiểm kỹ thuật không tự xác nhận approval. Owner sau đó đã duyệt trực tiếp cả ba concept; biên bản riêng lưu đúng hash nguồn/prompt/plate/body.
