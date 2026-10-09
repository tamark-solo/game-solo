# Quái, nguy hiểm và chiến đấu — hồ sơ lịch sử

> **Toàn bộ hồ sơ bên dưới là tham chiếu lịch sử ngày 06/10:** ENC-001/002/003, combat tự chạy theo lượt CP-001/002/003, thông số, lộ trình A → B và đề xuất offline farm giữ để đối chiếu. Chúng không là luật nhập môn hiện hành hoặc encounter đã triển khai. Mô hình đệ tử riêng từng được xét cũng đã bị thay.

> **Chuẩn hiện hành [GDD 0.28](GDD.md):** ba nhân vật chọn từ đầu, có sẵn Kiếm Khí/Lôi Ấn/Ngự Phong Bộ R01; Hằng Nhạc qua Ngưng Khí, phân hóa từ Trúc Cơ. Dùng [đối thủ và khảo nghiệm Hằng Nhạc](HANG-NHAC-ENCOUNTERS-TRIAL.md), [trải nghiệm](HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay](NGUNG-KHI-GAMEPLAY-SPEC.md) và [tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) để đánh giá HN-E01/02/03, ba pha HN10 và checkpoint/kết nối lại. Các hồ sơ mới còn là đề xuất; idle hiện hành không tự combat khi đóng game.

**Phiên bản:** 0.2, ngày 06/10/2026.  
**Trạng thái nguồn:** lộ trình A → B của bản trước; hồ sơ gặp gỡ/luật combat chưa được triển khai, chơi thử.\
**Tham chiếu lịch sử:** [node truyện](WORLD-MAPS.md), [asset](ASSET-PLAN.md), [GDD idle](GDD-IDLE-REFERENCE-v0.26.md).

## 1. Phạm vi gặp gỡ theo lộ trình lịch sử

Với MVP phàm nhân → Ngưng Khí tầng 1, dùng quái như một phần của biến cố nhập môn. Vòng chính vẫn là tu luyện và tài nguyên. Phương án A có **1 sinh vật gây nguy hiểm** và **2 thử thách môi trường**, tổng cộng 3 hồ sơ gặp gỡ.

Sau khi A đạt tiêu chí hoàn thành, B mở tuyến luyện thuật và giao lưu sau nhập môn, đến một trận giao đấu trực tiếp của Vương Lâm. B bổ sung 2 mục tiêu luyện thuật dùng đạo cụ và 1 đối thủ giao đấu theo truyện. Điều kiện chuyển giai đoạn nằm trong [MVP-BACKLOG.md](MVP-BACKLOG.md).

Sinh vật, tu sĩ đối đầu, thử luyện và boss đều dùng chung hồ sơ gặp gỡ, nhưng có cách giải quyết, phần thưởng và luật lặp riêng.

## 2. Ba hồ sơ gặp gỡ của A

| ID | Tên | Loại | Map/mốc | Cách giải quyết | Tác dụng | Lặp/phần thưởng |
| --- | --- | --- | --- | --- | --- | --- |
| ENC-001 | Hổ trắng trên đường núi | Sinh vật, sự kiện thoát hiểm | MAP-003 / E03 | Người chơi tiếp tục diễn biến thoát hiểm; kết quả cố định | Chuyển sang cảnh hang MAP-004 trong cùng E03 | Một lần; không sinh loot hay tu vi |
| ENC-002 | Lực hút trong hang | Nguy hiểm môi trường | MAP-004 / E03 | Trình bày sự quan sát và ứng phó qua các đoạn ngắn | Tiếp tục cảnh có được hạt châu; vật phẩm thuộc tác dụng E03 | Một lần; không có loot riêng |
| ENC-003 | Áp lực ở khảo nghiệm kiếm linh | Thử luyện theo truyện | MAP-002 / E02 | Xem diễn biến không vượt qua khảo nghiệm; tiếp tục hành trình | Hoàn thành phần khảo nghiệm E02 | Một lần; không có loot riêng |

Nguồn: hổ và thoát hiểm ở [chương 7](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-7), lực hút và hang ở [chương 8](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-8), khảo nghiệm kiếm linh ở [chương 4](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-4).

MVP không gán HP/ATK hay cấp yêu thú cho ba hồ sơ này. Sinh vật trong nguồn chưa được phân loại bằng hệ thống quái của game. Hạt châu chỉ nhận qua E03 một lần; node và gặp gỡ cùng tham chiếu sự kiện, tránh nhận vật phẩm thêm lần nữa.

## 3. Luật gặp gỡ theo truyện

- Hiện gặp gỡ khi đến đúng cảnh; bắt đầu hoặc tiếp tục bằng thao tác của người chơi.
- Kết quả của ba gặp gỡ A cố định theo nguyên tác, không kiểm tra phản xạ hay xác suất.
- Sự kiện thoát hiểm mở cảnh tiếp theo trong E03, chưa tự hoàn thành toàn bộ E03.
- Các hồ sơ dùng lại cùng UI: ảnh/tên, mô tả, nút tiếp tục và kết quả.
- Xem lại sau khi đã hoàn thành chỉ đọc lịch sử.
- Offline không bắt đầu gặp gỡ, không giải quyết thử luyện và không cộng phần thưởng cốt truyện.

Save giữ cảnh đang đọc, các gặp gỡ đã hoàn thành và mốc E tương ứng. Việc nhận tác dụng chính vẫn do bộ xử lý sự kiện E01–E08 chịu trách nhiệm.

## 4. Sinh vật và đối thủ đã có căn cứ để nghiên cứu dài hạn

| Hồ sơ | Căn cứ đã kiểm tra | Vai trò theo đoạn nguồn | Cách dùng trong game đề xuất | Trạng thái duyệt |
| --- | --- | --- | --- | --- |
| Hổ trắng | [Chương 7](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-7) | Đe dọa dẫn đến thoát hiểm | Sự kiện A ENC-001 | Đã đối chiếu vai trò trong đoạn |
| Chu Bằng / Zhou Peng | [Chương 52](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-52) | Đối thủ khi Vương Lâm vào giao đấu | Đối thủ lớn của B | Đã thấy mở đầu trận; cần đối chiếu phần còn lại để biên tập kết quả |
| Rết lớn của Huyền Đạo | [Chương 39](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-39), [40](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-40) | Linh thú đưa người của môn phái đến | Cảnh xuất hiện/đạo cụ sinh vật của arc giao lưu | Đã xác nhận vai trò; chưa cần combat |
| Thi khôi | [Chương 94](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-94) | Nguy hiểm gắn nhân vật và Thi Âm Tông | Gặp gỡ theo truyện; cơ chế liên kết với chủ nếu đúng mốc | Xác nhận từ đoạn nguồn; cần hồ sơ encounter đầy đủ |
| Hỏa thú | [Chương 164](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-164) | Sinh vật gắn biến cố Hỏa Phần | Nguy hiểm vùng/encounter theo arc | Đã xác nhận bối cảnh; cần nghiên cứu hành vi và mục tiêu từng mốc |
| Cóc lớn của nhân vật trong arc Cổ Thần | [Chương 168](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-168) | Sinh vật đi cùng một nhân vật khác | Cảnh giới thiệu/thể hiện sức mạnh | Đã xác nhận xuất hiện; chưa duyệt làm đối thủ farm |

Trạng thái “có căn cứ” không tự cho phép gán mọi sinh vật thành quái chiến đấu. Mỗi encounter cần thêm nguồn cho hành động của Vương Lâm, kết quả và khả năng lặp.

## 5. Thiết kế chiến đấu nhỏ cho B

### 5.1. Cổng mở và vòng chơi

**Tu luyện → học/luyện Dẫn Lực → chuẩn bị tài nguyên và vật phẩm theo mốc → chủ động bắt đầu giao đấu → trận tự chạy → xem kết quả → tiếp tục truyện.**

Việc luyện thuật cạnh tranh thời gian với tu luyện trong một slot hoạt động chính. Học thuật theo mốc, tăng thành thạo qua luyện tập. Nền tảng này dựa trên việc Vương Lâm dành thời gian luyện thuật trong [chương 27](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-27) và quãng bế quan ở [chương 36](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-36).

B cần hoàn thành các mốc về công pháp, hậu sơn và vật phẩm trước cuộc giao lưu; không nối trực tiếp E08 tới một trận ngẫu nhiên. Khối lượng mốc và map ở [WORLD-MAPS.md](WORLD-MAPS.md).

### 5.2. Hai mục tiêu luyện thuật và một đối thủ

Các giá trị là dữ liệu kiểm chứng cơ chế, không phải chỉ số trong nguyên tác.

| Profile | Vai trò | Thông số thử | Cách hoàn thành | Phần thưởng |
| --- | --- | --- | --- | --- |
| CP-001 | Mục tiêu nhẹ: luyện điều khiển bầu | Mục tiêu 60 điểm điều khiển; trở lực 0 | Áp dụng lực đủ mục tiêu trong bài diễn luyện | Tăng bộ đếm luyện thuật trong giới hạn nội dung |
| CP-002 | Mục tiêu trở lực: bài diễn luyện nâng cao | Mục tiêu 90 điểm điều khiển; trở lực 3 | Dùng thành thạo đã đạt để hoàn thành bài | Mở chỉ dẫn chiến thuật hoặc hoàn thành điều kiện luyện |
| CP-003 | Đối thủ giao đấu chính truyện | HP 180, công kích 14, phòng ngự 3 | Chuẩn bị rồi thắng trận tự động | Hoàn thành mốc B một lần; chưa có loot ngẫu nhiên |

Hai mục tiêu đầu là bài tập gameplay được xây từ ý tưởng luyện điều khiển đồ vật. Chúng không được đưa vào niên biểu như hai trận Vương Lâm từng đánh với sinh vật khác.

CP-003 là mẫu số học ban đầu; tên và kết quả đoạn truyện phải được duyệt đầy đủ trước khi sản xuất trận. Nguồn mở đầu trận có ở [chương 52](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-52).

### 5.3. Thông số và xử lý trận

Thông số thử của người chơi tại trận kiểm chứng: **HP 120, công kích 12, phòng ngự 4, linh lực chiến đấu 60**. Linh lực chiến đấu là tài nguyên của phiên trận, tách khỏi lượng tu vi tích lũy.

- Một lượt mô phỏng mỗi 2 giây; B bắt đầu bằng 1 đấu 1.
- Người chơi hành động trước, sau đó đối thủ còn sống mới hành động.
- Đòn thường: `damage = max(1, ATK - DEF)`.
- Dẫn Lực ở mức thành thạo thử: hệ số công kích 2; tốn 10 linh lực; dùng lại sau 3 lượt; giảm công kích đối thủ 50% trong lượt sử dụng.
- Nếu chưa dùng được thuật hoặc không đủ linh lực, dùng đòn thường.
- Mức thành thạo làm tăng hiệu quả điều khiển; hệ số trên là mức để thử trận, không tự mở ngay khi mới học.
- Không thêm chí mạng, né tránh hoặc biến động sát thương vào lượt thử đầu để dễ đánh giá kết quả.
- Khi HP người chơi về 0: kết thúc lần thử, trở lại bước chuẩn bị; chưa đánh dấu đã hoàn thành biến cố thắng trận.

Với số liệu trên và linh lực đầy, mẫu có Dẫn Lực thắng ở lượt 14 và còn 25 HP. Chỉ dùng đòn thường sẽ thua ở lượt 12. Đây là ví dụ kiểm chứng vai trò của luyện thuật, chưa phải cân bằng được chơi thử.

Những hành động/vật phẩm khác của trận gốc được kể hoặc đưa vào bước chuẩn bị sau khi biên tập đầy đủ. Mẫu số học trên chỉ kiểm tra vòng thuật–công kích–khống chế; không thay phần kết quả cốt truyện đã duyệt.

### 5.4. Lặp, hồi phục và offline

- Mục tiêu luyện thuật có thể lặp theo giới hạn thành thạo của gói nội dung.
- Trận cốt truyện bắt đầu khi người chơi chọn; phần thưởng chỉ áp dụng một lần.
- Thử lại khi chưa thắng là một lần thử gameplay của mốc đang chờ, không phải diễn biến niên biểu mới.
- Xem lại trận đã hoàn thành không sinh tài nguyên.
- B có chế độ hồi phục 10 giây để đầy HP/linh lực giữa các lần thử; đây là giả thuyết nhịp prototype.
- Offline của B tiếp tục luyện thuật đã chọn; các trận chính truyện giữ chờ tương tác.

## 6. Sáu mẫu hành vi cho hệ thống dài hạn

Các mẫu là bộ khung gameplay. Chỉ gắn tên sinh vật/NPC và map sau khi có hồ sơ nguồn của arc.

| Template | Hành vi | Quyết định người chơi | Tài nguyên/phản hồi | Gói đầu có thể dùng |
| --- | --- | --- | --- | --- |
| CT-01 Áp lực liên tục | Đòn thường, đòn mạnh mỗi vài lượt | Chuẩn bị HP/khống chế thay vì chỉ tăng công kích | Nhật ký chu kỳ đòn mạnh | L2 |
| CT-02 Dồn lực | Chuẩn bị một đòn trong 2 lượt rồi gây sát thương lớn | Khống chế lúc chuẩn bị hoặc tăng chịu đòn | Dấu hiệu đang dồn lực | L2 |
| CT-03 Hộ thân | Khiên có giới hạn, rồi chuyển sang tấn công | Tiêu khiên hoặc tiết kiệm linh lực chờ pha phù hợp | Thanh khiên và thời điểm đổi pha | L2 |
| CT-04 Liên kết chủ–thể | Đối thủ có liên kết với thực thể khác khi đúng lore | Chọn mục tiêu và phá liên kết | Trạng thái liên kết; loot cho toàn encounter | L3, sau khi có hệ thống nhiều mục tiêu |
| CT-05 Trạng thái kéo dài | Độc/thiêu đốt hoặc hiệu ứng vùng, giới hạn số tầng | Chuẩn bị chống trạng thái hoặc hồi phục | Thời gian còn lại, số tầng và giới hạn | L3 |
| CT-06 Cấm chế/thử luyện | Điều kiện vượt qua, áp lực và biến đổi theo giai đoạn | Chuẩn bị hiểu biết, tài nguyên hoặc chọn đường | Thanh điều kiện thay cho HP sinh vật | L3 |

Sinh vật có vai trò vận chuyển hoặc nhân vật quan trọng có thể chỉ xuất hiện trong cảnh. Kích thước hình ảnh không quyết định vai trò boss.

## 7. Chỉ số, cảnh giới và độ khó dài hạn

1. Tu sĩ giữ cảnh giới và thuật theo hồ sơ truyện ở từng mốc. Cấp/cảnh giới quái chưa có nguồn không tự gán thành canon.
2. Chỉ số game nằm trong bảng cân bằng riêng; nội dung truyện giữ tên và vai trò.
3. Đối thủ của một map giữ thông số của ngữ cảnh đó; không tăng theo người chơi mỗi lần quay lại.
4. Tinh anh dùng một mẫu hành vi có thêm thay đổi rõ như khiên hoặc trạng thái kéo dài.
5. Gặp gỡ lớn có điều kiện chuẩn bị và pha riêng. Khi hoàn thành, thay đổi mốc truyện hoặc mở khả năng cụ thể.
6. Có thể thắng chênh lệch tầng khi hồ sơ truyện và khả năng đã luyện cho phép; điều kiện cứng ưu tiên quyền vào map và mốc truyện hơn một con số “lực chiến” duy nhất.

Mỗi arc chỉ thêm tối đa một hoặc hai hành vi mới. Tăng nội dung bằng thông số và ngữ cảnh trên các mẫu đã có trước khi viết thêm AI.

## 8. Phần thưởng và farm dài hạn

| Nhóm encounter | Luật lặp | Phần thưởng |
| --- | --- | --- |
| Sự kiện nguyên tác | Một lần mỗi ngữ cảnh truyện | Mở mốc/vật phẩm hoặc khả năng được duyệt |
| Đối thủ thường của khu đã mở | Có thể lặp nếu bối cảnh cho phép | Một hoặc hai loại nguyên liệu gắn hệ chế tạo/đan dược đã mở |
| Tinh anh | Chu kỳ hoặc lượt có giới hạn | Nguồn nguyên liệu đặc trưng; chưa dùng bảng drop dài |
| Boss có danh tính trong truyện | Theo số lần và ngữ cảnh được biên tập | Phần thưởng lần đầu; xem lại/diễn luyện dùng luật riêng |
| Thử luyện/cấm chế | Theo thiết kế thử luyện cụ thể | Điều kiện đi tiếp, hiểu biết hoặc phần thưởng của arc |

Không dùng kill EXP làm nguồn tu vi mặc định. Tu luyện giữ vai trò tiến triển chính; giao đấu tạo nguồn lực để luyện thuật, chuẩn bị hoặc chế tạo khi những hệ đó đã mở.

Ở gói farm đầu, ưu tiên phần thưởng cố định để đo kinh tế. Chỉ thêm xác suất khi có lý do về trải nghiệm và đã kiểm tra tần suất thu tài nguyên.

Offline farm chỉ mở cho encounter lặp đã được xử lý lần đầu và do người chơi chủ động chọn. Dừng khi thất bại đầu tiên, kho đầy hoặc hết nguyên liệu hồi phục; tổng kết ghi từng loại kết quả. Trận cốt truyện và phần thưởng lần đầu vẫn chờ người chơi.

## 9. Mẫu hồ sơ dữ liệu

Mỗi hồ sơ có:

- ID; loại `scripted_escape`, `environment_hazard`, `story_trial`, `practice_target`, `combat`.
- Map, cảnh/mốc mở, điều kiện bắt đầu và nguồn chương.
- Trạng thái đối chiếu lore; phần trừu tượng hóa gameplay được ghi riêng.
- Asset hình, hiệu ứng và văn bản dự phòng.
- Mẫu hành vi/chỉ số nếu là combat; mục tiêu điều khiển nếu là luyện thuật.
- Cách giải quyết, luật thử lại/lặp, điều kiện rút lui.
- Chủ thể cấp phần thưởng: sự kiện truyện hoặc phiên gặp gỡ, tránh hai nơi cùng cấp.
- Luật offline và ID ghi nhận lần hoàn thành.

Hồ sơ A nằm trong [mvp-content-catalog.json](data/mvp-content-catalog.json). B chưa được đưa vào catalog chạy của A để giữ rõ phạm vi.

## 10. Kiểm tra cần có khi triển khai

| Kiểm tra | Kết quả yêu cầu |
| --- | --- |
| Bấm hổ nhiều lần hoặc mở lại MAP-003 | Chỉ một gặp gỡ trong E03; không nhận tu vi/loot |
| Hoàn thành lực hút rồi tiếp tục E03 | Hạt châu nhận một lần qua sự kiện E03 |
| Khảo nghiệm kiếm linh | Giữ diễn biến cố định của E02 |
| Offline trong lúc chờ gặp gỡ | Không tự hoàn thành hoặc thay kết quả truyện |
| Save giữa hai cảnh E03 | Mở lại đúng cảnh đang đọc; không lặp tác dụng đã nhận |
| B chạy combat cùng thông số và cùng chuỗi hành động | Kết quả giống nhau giữa các cách cập nhật thời gian |
| Dẫn Lực trong mẫu B | Có kiểm tra chi phí, dùng lại và hiệu lực đúng lượt |
| Trận đã hoàn thành được xem lại | Không sinh phần thưởng lần đầu |
| Lặp farm ở gói sau | Tuân thủ kho và giới hạn phiên; không cấp loot cả ở map lẫn sự kiện |

Các kiểm tra là điều kiện nghiệm thu tương lai, chưa phải test của một prototype đã được triển khai.
