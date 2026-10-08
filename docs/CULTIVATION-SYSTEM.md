# Hệ thống tu tiên — ba nhân vật chơi được

**Phiên bản:** 0.3 · **Ngày:** 08/10/2026 · **Tham chiếu:** [GDD 0.28](GDD.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md).

**Đã chốt:** sáu phần phát triển; chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu; Hằng Nhạc qua Ngưng Khí, phân hóa sâu từ hành trình Trúc Cơ. **Thiết kế cơ sở:** trạng thái, điều kiện và ví dụ dưới đây; chưa chốt số liệu, tên thuật mới hoặc schema runtime. Không có triển khai code trong tài liệu này.

## 1. Mô hình phát triển

Một nhân vật mạnh hơn nhờ nền tảng tu luyện, hiểu biết và lựa chọn vận dụng. Không gom sáu phần thành một số chiến lực thay thế mọi điều kiện.

| Phần | Câu hỏi người chơi cần hiểu | Trạng thái cần trình bày |
| --- | --- | --- |
| Cảnh giới | Tôi có thể tiếp cận mức năng lực nào? | Mốc hiện tại, tiến triển, bình cảnh và khả năng được mở |
| Công pháp | Tôi đang tu bằng cách nào? | Nguồn học, mức hiểu, nền đang vận dụng, tác dụng và giới hạn |
| Thuật pháp | Tôi dùng sức mạnh thành hành động gì? | Đã biết/đã học, khả năng vận dụng, điều kiện và bộ đang dùng |
| Pháp bảo | Tôi dùng công cụ nào và dùng được tới đâu? | Sở hữu, nhận biết, luyện hóa, trạng thái trang bị/vận dụng |
| Lĩnh ngộ | Tôi đã hiểu điều gì và nó giải quyết vấn đề nào? | Trải nghiệm, điều đã hiểu, khả năng hoặc bình cảnh liên quan |
| Hành trình cá nhân | Vì sao nhân vật có cơ duyên và động lực này? | Chương, quan hệ, biến cố, truyền thừa và quyền tiếp cận |

Không thiết kế mặc định sáu EXP/sáu tiền tệ. Độ thành thạo có thể là một chỉ báo, lĩnh ngộ có thể là một kết luận đã đạt; không bắt mọi phần đều có thanh tăng cấp giống tu vi.

## 2. Cảnh giới và trạng thái nhân vật

### 2.1. Hai lớp phải tách

**Cảnh giới/trạng thái nguyên tác:** mô tả nhân vật tại mốc truyện, được giữ theo nguồn. **Mốc gameplay:** nội dung và năng lực hiện được phép sử dụng trong hành trình chơi. Hai lớp có thể khớp ở Vương Lâm, nhưng không tự khớp ở Tư Đồ Nam hay mở đầu chuyển thể của Lý Mộ Uyển.

| Nhân vật | Diễn giải tại Hằng Nhạc | Điều không được kể |
| --- | --- | --- |
| Vương Lâm | Tích lũy và tiến triển tu luyện giai đoạn đầu, cơ duyên riêng theo mốc | Đã có sức mạnh cao chỉ vì nguồn VFX cao có sẵn |
| Tư Đồ Nam | Linh thể bị hạn chế; phục hồi phần năng lực hiện dùng được, đi qua mốc gameplay nhập môn | Vốn là phàm nhân vừa học Ngưng Khí hoặc bị xóa hết kiến thức |
| Lý Mộ Uyển | Tuyến nhập môn gameplay được chuyển thể; nền đan–trận giữ bản sắc | Vốn cùng Vương Lâm nhập môn Hằng Nhạc trong nguyên tác |

Trong UI, Vương Lâm có cảnh giới/tu vi phù hợp giai đoạn; Tư Đồ Nam có **trạng thái linh thể / mốc hồi phục / năng lực hiện dùng được**. Mốc nhập môn chung có thể dùng để mở nội dung và ghép nhóm; không ghi đó là cảnh giới nguyên tác của mọi người. Cách biểu thị sức mạnh và đối chiếu mốc cần cân bằng riêng, chưa có bảng quy đổi cố định.

### 2.2. Khung và bình cảnh

Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần là khung đầu. Anh Biến/Vấn Đỉnh và giai đoạn sau cần hồ sơ theo arc, không phải phần đã sản xuất gameplay. Ngưng Khí có 15 tầng theo [chương 17](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17); [hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất phân bổ hết 15 tầng vào Hằng Nhạc chuyển thể, mốc 1/3/9/15 và ngân sách thử. Phạm vi map, ngưỡng tu vi và số liệu chưa duyệt chi tiết; không sao chép số tầng từ truyện khác.

Tu vi phản ánh tích lũy dài hạn; linh lực là nguồn vận dụng trong trận. Cạn linh lực không tự giảm tu vi/cảnh giới. Thuật pháp thành thạo và lĩnh ngộ không tự bằng tu vi cao. Bình cảnh có lý do cụ thể: thiếu tích lũy, nền công pháp, năng lực, cơ duyên hoặc điều kiện riêng; UI nói rõ phần còn thiếu mà không tiết lộ nội dung truyện chưa mở.

Mốc “ổn định” sau đại đột phá là mục tiêu làm quen năng lực mới, không mặc định một timer phạt. Các trạng thái chiến đấu/bị thương và ảnh hưởng tới tu luyện cần đặc tả riêng.

## 3. Công pháp — nền vận hành

Phân biệt **công pháp** với **thuật pháp**. Công pháp định hướng hấp thu/vận hành sức mạnh; thuật pháp là hành động cụ thể. Có thể dùng cùng thuật với hiệu quả/cách vận dụng khác nhau khi có căn cứ và đã cân bằng.

Luồng đề xuất: **biết tới → đủ điều kiện tiếp cận → học nền → luyện vận hành → hiểu sâu → chọn sử dụng hoặc chuyển nền**.

Mỗi hồ sơ công pháp cần: nhân vật/phạm vi phù hợp, nguồn truyện hoặc nhãn sáng tạo, mốc tiếp cận, yêu cầu học, cách luyện, tác dụng, đánh đổi và quan hệ với thuật. Không buộc mọi công pháp đều mang đủ một bộ bonus cố định.

Ở Hằng Nhạc, dùng nền đơn giản để học tu luyện. Sau map đầu, cho chọn cách vận dụng đầu tiên phù hợp từng người, có bước thử và cách điều chỉnh. Số công pháp chính/phụ, tương thích, khả năng học chéo, chi phí đổi và bế quan khi đổi chưa chốt. Không tự cho mỗi người học hết truyền thừa của hai người kia.

## 4. Thuật pháp — hành động và độ hiểu

Nhóm chức năng gồm tấn công, phòng thủ, di chuyển và hỗ trợ. Chức năng là cách phân loại gameplay, không phải class cố định. Một thuật có thể phục vụ nhiều tình huống nhưng cần tác dụng và giới hạn rõ.

Luồng đề xuất: **biết tới → học được → dùng ở mức nền → luyện thành thạo → mở cách vận dụng phù hợp → chọn vào bộ chiến đấu**.

Hồ sơ thuật phải nêu nguồn/nhân vật, mốc/công pháp/cơ duyên yêu cầu, hành động, mục tiêu/phạm vi, chi phí linh lực, nhịp thi triển/hồi phục, cooldown nếu có, tác dụng/hit và cách đối phó. Số liệu thuộc đặc tả combat riêng. Học thuật không đồng nghĩa đang trang bị; nâng cảnh giới không tự cấp mọi thuật ở mốc đó.

Hằng Nhạc dùng ít thuật nền, mỗi nhiệm vụ dạy một khái niệm. Sau nhập môn mở lựa chọn có tác dụng: chẳng hạn cách vận dụng thiên về xuyên phá hay giữ khoảng cách. Ví dụ này là ý tưởng thiết kế, chưa là kỹ năng canon hoặc biến thể đã sản xuất.

**Quyết định hiện hành:** cả ba có Kiếm Khí, Lôi Ấn và Ngự Phong Bộ R01 làm skill khởi đầu từ lúc điều khiển. Tutorial hướng dẫn dần, không giữ quyền skill sau nhiệm vụ/công pháp hiếm. Đây là bộ nền của game chuyển thể; Tư Đồ Nam khôi phục/thử vận dụng mức nhập môn, không bị xóa kiến thức. Các sheet/atlas vẫn không xác định số hit hoặc sát thương; [hồ sơ gameplay](NGUNG-KHI-GAMEPLAY-SPEC.md) đề xuất phần đó. Quyền học và biến thể sau nhập môn còn cần hồ sơ riêng; đổi màu/cỡ ảnh không đủ là nâng cấp gameplay.

## 5. Pháp bảo — công cụ và giới hạn vận dụng

Phân biệt ba loại: **vật phẩm truyện** phục vụ mốc/nguồn, **pháp bảo vận dụng được** có hồ sơ hiệu lực, **trang bị thường** hỗ trợ thuộc tính/cách chơi. Không coi mọi đồ trong túi đều là pháp bảo.

Luồng đề xuất: **tìm/nhận → nhận biết → đủ điều kiện luyện hóa → luyện hóa → trang bị → vận dụng/nuôi dưỡng khi có thiết kế**.

Nhặt được không đồng nghĩa sử dụng trọn sức mạnh. Hiệu lực hạn chế, linh lực tiêu hao, tương thích công pháp hoặc yêu cầu điều khiển cần hồ sơ từng món; không tự áp một quy tắc chung cho tất cả vật phẩm nguyên tác.

Một món đồ mới nên có lý do để chọn bên cạnh thuộc tính cao hơn: vị trí chiến đấu, điều kiện kích hoạt hoặc phối hợp với thuật. Chưa chốt rarity ngẫu nhiên, cường hóa, số slot, hỏng đồ hay giao dịch. Thiên Nghịch Châu gắn với hành trình Vương Lâm; Tư Đồ Nam có quan hệ với châu trong truyện, không thành người sở hữu một bản châu khởi đầu độc lập. Lý Mộ Uyển không mặc định được cấp châu.

## 6. Lĩnh ngộ — hiểu điều cụ thể

Lĩnh ngộ là nội dung có nghĩa, không phải “EXP trí tuệ” kiếm từ mọi lần giết quái. Phân biệt lĩnh ngộ cách vận hành một thuật với hiểu biết về đạo ở mốc cao; một thành tích nhập môn không tự cấp ý cảnh Hóa Thần.

Luồng đề xuất: **gặp vấn đề/trải nghiệm → quan sát/thực hành → nhận ra điều liên quan → kiểm chứng hoặc hoàn thành trải nghiệm → ghi nhận điều đã hiểu → mở tác dụng có ngữ cảnh**.

Hồ sơ phải nêu vấn đề, trải nghiệm dẫn tới, kết luận, cách xác nhận và tác dụng. Không ép chơi một minigame duy nhất cho mọi nhân vật hoặc chọn “thiện/ác” để mua điểm đạo. Hoạt động có thể là khảo nghiệm vận dụng, quan sát một hiện tượng, lời giải của bình cảnh hoặc trải nghiệm truyện; phần nhận thức không bị rút thành bài trắc nghiệm trivia.

Ở nhập môn, dạy hiểu linh lực và giới hạn vận dụng. Tới Hóa Thần, phát triển trải nghiệm và ý cảnh phù hợp từng người. Không tự gán “ý cảnh Đan Đạo” cho Lý Mộ Uyển hoặc một ý cảnh mới cho Tư Đồ Nam rồi trình bày thành nguyên tác. [Quãng khắc tượng của Vương Lâm, chương 271](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-271) là căn cứ tham khảo, không là thử thách bắt buộc giống nhau cho cả ba.

## 7. Hành trình cá nhân — quyền tiếp cận và động lực

Tuyến chung dạy game; tuyến riêng giải thích nhân vật, quan hệ, cơ duyên và bình cảnh. Cùng hoàn thành Hằng Nhạc không tự có cùng vật phẩm hoặc biến cố gia đình.

Hồ sơ mốc gồm: nhân vật, điều kiện đầu, nội dung có nguồn/chuyển thể, trạng thái trước/sau, khả năng/tri thức/phần thưởng được mở và quy tắc xem lại. Quan hệ là ngữ cảnh truyện trước khi là cơ chế; chưa mặc định điểm thiện cảm hay farm quà tặng.

Mở lại cảnh không phát thưởng hoặc đột phá lần nữa. Mốc nhóm không sửa chương cá nhân của người chưa đủ điều kiện; chính sách tham gia/phần thưởng cần đặc tả. Hoạt động thế giới lặp không lặp các biến cố độc hữu của truyện cho toàn server.

Biến cố sinh mệnh và số phận nhân vật phải biên tập riêng trước khi quyết định tiếp tục điều khiển ở một arc. Trạng thái gameplay kéo dài hoặc tuyến ngoài nguyên tác được ghi nhãn chuyển thể; chưa chốt cách giải quyết và không tự tuyên bố nhân vật bất tử/hồi sinh.

## 8. Liên kết sáu phần — ví dụ

Các ví dụ sau là tình huống thiết kế, không phải luật/số liệu đã duyệt:

| Tình huống | Cách hệ thống giải thích |
| --- | --- |
| Tu vi đủ nhưng chưa qua bình cảnh | Cảnh giới tích lũy đủ, còn thiếu hiểu công pháp/khảo nghiệm hoặc cơ duyên đúng mốc; UI nêu thiếu gì |
| Nhặt pháp bảo cao hơn | Ghi nhận sở hữu; sử dụng theo hồ sơ luyện hóa/giới hạn, không tự nhảy cảnh giới |
| Học cùng một thuật | Có thể khác cách vận dụng theo công pháp/lĩnh ngộ/nhân vật; không tự cùng toàn bộ hiệu lực |
| Tư Đồ Nam biết thuật mạnh | Tri thức đã có nhưng trạng thái hiện tại chưa cho thi triển; mục tiêu là phục hồi điều kiện sử dụng |
| Lý Mộ Uyển chuẩn bị cho khảo nghiệm | Dược liệu/hiểu biết → đan hoặc trận → lợi thế chuẩn bị; vẫn cần tự vận dụng trong thử thách |
| Vương Lâm tới cơ duyên riêng | Hành trình mở tiếp cận; vẫn kiểm điều kiện học/vận dụng, không trao một nút thắng PvP |

Một quyền mở năng lực cần thỏa **điều kiện mốc + nền vận hành + nguồn học + trạng thái sử dụng** nếu hồ sơ năng lực yêu cầu. Không bắt năng lực đơn giản chịu mọi cổng của đại chiêu, cũng không cho một thông số tu vi bỏ qua tất cả cổng.

## 9. Luồng đột phá và hồi phục

**Đang tiến triển → gặp bình cảnh → biết điều kiện → chuẩn bị → đủ điều kiện → chủ động vượt mốc → ổn định → tiếp tục hành trình.**

| Bước | Người chơi cần thấy | Máy chủ cần xác nhận khi triển khai |
| --- | --- | --- |
| Bình cảnh | Mục tiêu, phần thiếu và cách tìm hiểu | Điều kiện thực tế, tránh UI chỉ dựa dữ liệu cũ |
| Chuẩn bị | Tài nguyên/khảo nghiệm/mốc cần hoàn thành | Sở hữu, trạng thái và chi phí hợp lệ |
| Vượt mốc | Tác dụng/rủi ro, thao tác chủ động | Kết quả, tiêu hao/thưởng/mở khóa một lần |
| Ổn định | Điều gì đã đổi và dùng ra sao | Lưu tiến trình, mốc kế tiếp, khôi phục khi mất kết nối |

Không mặc định phép tung xác suất ở mọi lần lên tầng. Không mặc định thiên kiếp cho mọi người/mọi mốc. Nếu có thất bại, phải mô tả nguyên nhân, giảm rủi ro và hệ quả trước khi triển khai. Mất mạng không tự trở thành một lần thất bại mới; cần hợp đồng phục hồi trạng thái.

Mốc nhập môn hoàn tất Ngưng Khí không tự cho Trúc Cơ khi qua cổng. Với Tư Đồ Nam, chuỗi trên là hồi phục khả năng hiện dùng được; cảnh giới nguyên tác được giữ theo trạng thái truyện, không đổi tên lịch sử cho khớp UI chung.

## 10. Idle, multiplayer và PvP

Idle chỉ hỗ trợ hoạt động đã chọn và được phép: tích lũy hoặc chuẩn bị có luật. Không auto truyện, combat, lĩnh ngộ then chốt hay đại đột phá; không có offline battle mặc định. [Hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất nền 120/phút, tạm dừng combat/bài tương tác, cổng tích lũy và cap offline thử 30 phút. Các số/luật này cần đánh giá, không kế thừa 8 giờ hoặc 10 giây như quyết định đã duyệt.

Tiến trình gắn hồ sơ nhân vật, tài nguyên không tự chuyển giữa ba người. Số slot, đổi người, kho chung và phần khám phá dùng chung còn mở. Cảnh giới hiển thị không đủ để xác định sức mạnh ghép nhóm Tư Đồ Nam: cần mốc gameplay/năng lực hiện dùng được trong luật sau.

Đề xuất PvP theo nhóm mốc hoặc tỷ thí cân bằng; không ép chuẩn hóa PvE. Giới hạn, khả năng đối phó và luật phiên chơi cần làm rõ trước khi chuyển sức mạnh độc hữu từ truyện sang combat. Lợi thế chuẩn bị không được đồng nghĩa một nhân vật bắt buộc để người khác tiến triển. Đan/pháp bảo có giao dịch và quyền thưởng nhóm hay không còn mở.

## 11. Nguồn và việc cần đặc tả

[Trải nghiệm Hằng Nhạc v0.4](HANG-NHAC-NGUNG-KHI-SPEC.md), [tiến trình/phần thưởng v0.2](HANG-NHAC-PROGRESSION-REWARDS.md) và [đối thủ/HN10 v0.1](HANG-NHAC-ENCOUNTERS-TRIAL.md) áp dụng khung này vào tuyến nhập môn, ngưỡng/nền/vật tư và khảo nghiệm tổng hợp. Đây là bản để đánh giá, không phải số liệu đã khóa.

Nguồn nền đã đối chiếu: [Ngưng Khí, chương 20](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-20); [mộng cảnh châu, 23](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-23); [Tư Đồ Nam, 47](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47); [đan–trận Lý Mộ Uyển, 143](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-143), [224](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-224); [Anh Biến, 410](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-410); [khác cách vận dụng thuật, 543](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-543). Một nguồn cho chi tiết nền không xác nhận toàn bộ luật game ở cùng mục.

Trước triển khai cần: lời dẫn và trạng thái ba người tại Hằng Nhạc; mốc Ngưng Khí/hồi phục; hồ sơ công pháp/thuật/pháp bảo đầu; một bình cảnh và cách giải cho từng người; nhiệm vụ/khảo nghiệm cuối; tác dụng và chi phí cụ thể; luật idle/tài khoản; cân bằng và UX mở dần. Chưa có bảng skill canon đầy đủ hoặc bảng số liệu combat trong bản này.
