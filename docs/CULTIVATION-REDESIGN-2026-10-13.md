# Thiết kế lại hệ tu tiên và hành trình nhân vật

**13/10/2026 · Phụ lục thiết kế GDD 0.33 · Đề xuất để prototype.** Tài liệu này mô tả đích gameplay, không ghi nhận các hệ mới đã triển khai. [GDD](GDD.md) là cửa vào; [Hằng Nhạc v2](HANG-NHAC-ONBOARDING-V2.md) đặc tả chương đầu; [reference](CULTIVATION-QUEST-REFERENCES-2026-10-13.md) ghi bằng chứng.

## 1. Trải nghiệm tu tiên cần tạo ra

Có ba khoảnh khắc quan trọng: **“ta còn yếu ở đâu” → “ta tìm được cách” → “giờ ta làm được điều trước đó không làm được”**. Cảnh giới, công pháp, trang bị và cốt truyện cùng phục vụ chuỗi này.

Ví dụ đầu: một mẫu vật liên tục hao khí khi đem qua tuyến dẫn. Người chơi thấy nhịp nguy hiểm, học giữ khoảng cách và nhận ra cách bảo quản sai; tự luyện công cụ rồi quay lại đưa mẫu qua. Thắng lợi đến từ bản thân mạnh hơn và hiểu hơn. Về sau, cùng cấu trúc dùng cho thoát truy sát, giành lại truyền thừa, vượt bình cảnh hoặc bảo vệ người mình đã hứa giúp.

Cảm giác nghịch thiên gồm bất cân xứng, cơ hội tự tìm, rủi ro có thể hiểu và hệ quả. Không bắt người chơi chờ nhiều giờ để giả lập khổ tu, cũng không thưởng thần khí ngay để giả lập bá đạo.

## 2. Thuật ngữ, nguồn lực và màn tiến trình

Audit hiện hành không thấy một loại tiền riêng mang tên “điểm vận khí”. Số `cultivation` là tu vi/tích lũy bền; `foundation` và `cycleStep` là cờ bài vận khí. Tầng và M01–M04 hiện chủ yếu mở nội dung, chưa tăng HP/MP/damage. Người chơi thấy nhiều trạng thái nhưng ít tác dụng nên có cơ sở để cảm thấy khó hiểu.

| Thành phần | Nguồn | Dùng vào đâu | Mất/tiêu khi nào | Hiển thị |
| --- | --- | --- | --- | --- |
| Tu vi | Việc chính, hoạt động hợp lệ; thổ nạp tùy chọn | Đạt ngưỡng tầng | Không tiêu khi lên tầng/cast/chết trong nội dung nhập môn | Một thanh tới tầng tiếp; chi tiết cho xem tổng |
| Cảnh giới/tầng | Tu vi đủ + nền đã mở | Năng lực và nội dung phù hợp | Không tụt trong thiết kế đầu | “Ngưng Khí · tầng 3”; Tư Đồ Nam dùng “Hồi phục · ngưỡng 3” |
| MP / Linh lực | Hồi phục, kỹ năng hoặc vật tư đúng luật | Thi triển thuật | Tiêu theo thuật | Cầu MP và chi phí cạnh skill |
| Công pháp | Truyền dạy, nhiệm vụ, truyền thừa | Chọn nền vận hành | Chuyển cấu hình ở nơi an toàn, theo luật từng hệ | Một nền đang dùng, nguồn và hiệu lực |
| Lĩnh ngộ | Hành động kiểm chứng/biến cố có nghĩa | Mở cách vận dụng hoặc gỡ bình cảnh cụ thể | Không là điểm đem tiêu | Một câu kết luận + quyền đã mở trong nhật ký |
| Linh thạch | Nguồn farm/giao dịch được đặc tả sau | Chi phí luyện chế/kinh tế hữu ích | Khi người chơi xác nhận chi | Chưa thêm vào tutorial nếu chưa có nguồn–chi |
| Vật liệu | Chuyến đi, thu thập, boss, giao dịch nếu được phép | Recipe/công cụ đang nhắm | Công thức ghi rõ tiêu/giữ | “Có / cần”, nguồn thiếu và món sẽ tạo |
| Nhân duyên | Việc đã làm với đúng người | Lời mời, trợ giúp, phương án nội dung | Không farm quà thành điểm thiện ác | Ghi việc cụ thể; không bảng số quan hệ đại trà |

“Vận khí” là động từ. HN02 dạy một lần cách vận hành; thổ nạp là hoạt động chọn bật/tắt. Không dùng “Ngưng khí” làm tên thanh năng lượng; **Ngưng Khí** là đại cảnh giới. Chưa thêm khí vận/may mắn, căn cốt ngẫu nhiên, kinh mạch, ngộ tính và đạo tâm như năm thanh mới.

Mẫu UI đề xuất, không số runtime mới:
> **Ngưng Khí · tầng 3** — Tu vi tới tầng 4: 80 / 160.  
> Tầng 4: lực công kích nền 1,04 → 1,06.  
> Mục tiêu hiện tại: kiểm mẫu hao khí tại ngoại vi.  
> Nền kế: đã mở / còn thiếu tên việc cụ thể.

Phần chi tiết: 440 tu vi tổng; ngưỡng tầng 3 là 360, tầng 4 là 520. Không trình bày “440/1620” mà không cho biết đó là cổng nền hay tầng kế. Nếu chạm cổng, hiện “Đã đủ tu vi; hoàn tất [việc] để ổn định tiếp”, lưu phần vượt ngưỡng, không làm mất thưởng.

Với Tư Đồ Nam, cảnh giới/tri thức trong truyện nằm trong phần danh tính; thanh gameplay là tiến triển hồi phục và năng lực dùng được. Không tạo currency thứ hai chỉ để đổi nhãn.

## 3. Tầng nhỏ, bình cảnh và đại đột phá

### 3.1. Ngưng Khí

Giữ 15 tầng theo nguồn truyện, giữ công thức ngưỡng hiện hành làm phương án thử A: `T(L) = 10 × L × (L + 9)`. Tầng 1/3/9/15 ứng với 100/360/1620/3600. Không đổi công thức và toàn bộ nguồn thưởng cùng lúc trong thử nghiệm đầu.

Tầng nhỏ tăng tự động khi tu vi đủ và nền được mở; server ghi cùng giao dịch thưởng/tiến trình. Nếu đang combat, lưu quyền đạt nhưng áp năng lực mới khi hết encounter, báo rõ “ổn định sau trận”; tránh được hồi máu/tăng lực đột ngột giữa pha. Tu vi vượt cổng được giữ, có thể ổn định nhiều tầng trong một lần. Không chạy popup từng tầng hoặc yêu cầu tới NPC 14 lần.

M01–M04 giữ làm mốc kỹ thuật/chương, ẩn khỏi giao diện chính. Người chơi đọc tên việc và thành quả. M02 không còn nút tách khỏi HN05; M03 không đòi báo cáo thêm sau chuỗi đã đủ; M04 vẫn kết thúc khảo nghiệm. Mapping cụ thể trong Hằng Nhạc v2.

### 3.2. Bình cảnh trong một đại cảnh giới

Bình cảnh phải là giới hạn có thể hiểu: chưa có phần công pháp, chưa kiểm chứng phương pháp vận hành hoặc chưa đủ khả năng giữ ổn định. Dùng một tình huống có cách thử lại để giải. Không mỗi ba tầng lại đòi cùng một viên đan khác màu.

Ở HN07, người chơi dùng hiểu biết để mở nền kế; phần thiếu được gọi đúng tên. Không có bài hỏi đáp bắt buộc về thuật ngữ. “Lĩnh ngộ” ghi kết quả kiểm chứng, không tăng một thanh tưởng thưởng cho mọi kill.

### 3.3. Trúc Cơ và đại đột phá sau

Mẫu đề xuất: đủ nền/tu vi → có phương pháp và chuẩn bị đã công khai → tự chọn bắt đầu → vượt khảo nghiệm phù hợp → năng lực mới → tình huống dùng ngay. Trúc Cơ đầu không dùng RNG thất bại; thua khảo nghiệm giữ điều kiện đã đạt, thử lại từ checkpoint, không tụt cảnh giới hoặc phá đồ bắt buộc.

Phương án chuẩn bị tốt hơn giảm áp lực hoặc mở cách xử lý khác; người có thao tác tốt vẫn có đường nền. Thiên kiếp/tâm ma chỉ xuất hiện tại arc có thiết kế và nguồn, không tự coi mọi lần lên tầng đều có sét. Phương án tu luyện của Tư Đồ Nam dùng hồi phục hiện diện/khả năng, không giả ông tu lại từ đầu.

### 3.4. Idle có vai trò rõ

Trong phiên bản mới, chơi chính tuyến đủ tu vi; idle là cách tích lũy phần nền tùy chọn lúc nghỉ ở nơi an toàn. Prototype giữ nguồn online 120/phút đang có để đo độc lập, không tăng tốc chỉ để che thiếu nội dung. Mọi thưởng hoạt động bắt buộc đủ qua cổng dù người chơi chưa từng bật thổ nạp.

Không cộng XP theo từng lần bấm F/cast/E hoặc “số giây cử động”, tránh khuyến khích spam. Hoạt động lặp sau này ghi thưởng theo mục tiêu/đóng góp và phiên riêng. Offline chỉ bổ sung sau hợp đồng clock/cap/nguồn đầy đủ; không hứa đã có offline combat hoặc dùng Thiên Nghịch Châu để giải thích chức năng chung.

## 4. Mạnh lên phải thấy được

Giữ runtime HP/MP 100 cho tới khi có prototype cân bằng riêng. Đề xuất thử **một trục tăng lực nền nhỏ**, cùng nguồn build có tác dụng rõ, thay vì mở nhiều chỉ số cùng lúc.

| Thành quả | Tác dụng đề xuất | Thấy ở đâu |
| --- | --- | --- |
| Tầng nhỏ | Hệ số sát thương đầu ra nền `1 + 0,02 × (L − 1)`, tối đa 1,28 ở tầng 15 | So cùng mục tiêu bằng cùng đòn; UI ghi nguồn “tu luyện” |
| HN05 / tầng 3 | Quyền tự ra ngoại vi và chọn việc; không cấp lại R01 | Chuyến thứ hai ít phụ thuộc lời dẫn |
| HN07 | Thử một trong hai cách vận hành, đổi lại miễn phí ngoài hoạt động | Một trận/chuyến có hai cách chuẩn bị |
| HN08 | Ngọc hộ thân đã có: một công cụ phòng thủ dùng đúng thời cơ | Một đòn nguy hiểm có phản hồi trước/sau |
| HN09 | Biết dùng tổ hợp; mở chuỗi khảo nghiệm, không thêm stat bí mật | Bài kiểm sức mạnh ngắn so với đầu chương |
| HN10/HN12 | Danh vị/chứng nhận, đầu mối xuất hành theo nhân vật | NPC phản hồi, hồ sơ thành tựu, mục tiêu chương mới |

Hệ số 2% là **số thử**, không buff đang chạy; chưa thay chi phí/cooldown/hitbox R01. Chỉ bật khi ruleset PvE đã được kiểm lại, áp qua lớp nguồn sức mạnh chung cho basic/skill, có quy tắc làm tròn tại kết quả cuối. Max HP/MP không đổi nên lên tầng không hồi đầy. PvP có ruleset riêng trước mở.

### Hai cách vận hành đầu tiên — nhãn sáng tạo, không tên công pháp canon

- **Giữ nhịp:** prototype giảm 15% chi phí MP thuật nhưng giảm 8% sát thương thuật. Dễ duy trì, kết liễu chậm hơn; đòn thường giữ nguyên.
- **Dồn lực:** prototype tăng 12% sát thương thuật và tăng 15% chi phí MP. Mạnh trong cửa sổ ngắn, dễ cạn linh lực; đòn thường giữ nguyên.

Chỉ một nền có hiệu lực; xem số trước/sau, thử trên cùng tình huống rồi đổi được. Phải đo với hồi MP hiện hành: nếu người chơi không bao giờ thiếu MP thì đánh đổi này vô nghĩa, cần sửa thiết kế trước phát hành. Không thêm thanh nóng/khí thứ hai để cứu một lựa chọn chưa có giá trị. Gói P0/P1 chưa bật hai nền này.

Sau Trúc Cơ mới phân hóa sâu: công pháp chủ đạo + bộ thuật + một pháp bảo có hành động riêng + gear phù hợp. Thử ít tổ hợp có tác dụng, không sáu cây lớn. Đồ hiếm mở cách phối, có nhược điểm/điều kiện; phẩm màu không tự là đáp án tốt nhất mọi lúc.

## 5. Vòng đồ, nghề và cơ duyên

Một món cần trả lời: **kiếm ở đâu → vì sao muốn → dùng khi nào → đã tốt hơn hoặc khác gì**. Chương đầu dùng sáu công thức đang có, không tạo catalog mới chỉ vì có icon.

Chuỗi mẫu: thấy mẫu hao khí → biết hộp niêm có ích → kiếm sợi/ngọc/cát → chế hộp/mực → chọn niêm trước chuyến → đi tuyến ngắn → vật phẩm hoạt động đến nơi nguyên vẹn. Người không chế vẫn đi tuyến an toàn dài hơn; cùng tiến trình chính.

| Hệ | Đề xuất mở | Vòng chơi | Giới hạn sản xuất đầu |
| --- | --- | --- | --- |
| Đan/dược | Cuối Ngưng Khí | Kiếm nguyên liệu, chế recovery/chuẩn bị, dùng trước hoạt động | Vật tư vẫn một nguồn; không tạo kho hồi phục song song |
| Luyện khí/luyện hóa | HN08 rồi Trúc Cơ | Nhận biết món, chọn hiệu lực, luyện hóa, thử | Một instance có lịch sử; không mỗi bước sinh một bản sao |
| Trận/phù | Trúc Cơ | Chuẩn bị địa điểm/điều kiện trước chiến đấu hoặc khám phá | Một công cụ, vùng đặt/counterplay rõ; không sửa collider map |
| Pháp bảo bản mệnh | Kết Đan, sau khi vòng gear hữu ích | Gắn bó một món qua chinh phục/luyện hóa, chọn nhánh dùng | Không thêm chỉ vì game thị trường có; phải có hai cách dùng khác nhau |
| Động phủ | Sau vòng farm ổn | Đặt mục tiêu nghiên cứu/chế tác và trưng bày thành quả | Một không gian nhỏ, không quản lý cả môn phái |
| Linh thú/tọa kỵ/thời trang | Theo thành tựu/chặng | Tìm, thuần dưỡng hoặc hoàn tất câu chuyện nhận diện | Sở hữu hình tách khỏi power; chưa mặc định pet tự farm |

Nguồn bắt buộc có bảo đảm. Sau khi mở farm lặp, mỗi lượt có nguyên liệu/tiến độ tới món nhắm; RNG chỉ thêm bất ngờ. Trước mở kinh tế cần sink hữu ích, luật binding/đầy túi/giao dịch và chống phát trùng; không dùng phí vô nghĩa để tiêu lượng tiền đã lỡ bơm.

## 6. Cốt truyện dài hạn: bám nền Tiên Nghịch, để người chơi có quyền quyết định

Nguồn hiện được kiểm đủ cho nền đầu: 15 tầng/công pháp giới hạn, tài nguyên và địa vị, Vương Lâm kiểm chứng châu, trạng thái Tư Đồ Nam. Phần Lý Mộ Uyển và sinh–tử/nhân quả chỉ có trích đoạn; bảng dưới là **khung chuyển thể và sáng tạo**, chưa phải phân tích toàn bộ nguyên tác hoặc bản chép lịch sử theo chương.

### 6.1. Ba tầng nội dung

**Trục nguồn truyện:** giữ danh tính, cơ duyên đặc hữu và mốc quan trọng sau khi đối chiếu chương đầy đủ. Người chơi không bỏ phiếu thay canon toàn server.

**Chương chuyển thể cá nhân:** sắp xếp lại thời điểm để bộ ba chơi được từ đầu; cho người chơi chọn phương pháp, người giúp, lời hứa và ưu tiên trong khoảng trống của chương. Nếu có kết cục thay số phận, tách thành nhánh “dị truyện”, ghi rõ từ đầu và đặc tả riêng.

**Hoạt động thế giới mới:** kỳ ngộ, vật tư, tranh chấp, truyền thừa phụ và việc tông môn do game sáng tạo. Chúng tạo vòng MMO lặp mà không bắt người chơi lặp cái chết hoặc cơ duyên độc hữu trong nguyên tác.

### 6.2. Cung hành trình

| Chặng | Xung đột xoay quanh nhân vật | Hành động/đổi cách chơi | Thành quả và móc tiếp |
| --- | --- | --- | --- |
| Hằng Nhạc / Ngưng Khí | Năng lực bị đánh giá thấp hoặc chưa thể vận dụng; nguồn tu luyện gặp vấn đề | Tự kiểm chứng, vượt nguy hiểm, làm công cụ, chọn cách xử lý | Có quyền tự đi, một người nhớ việc mình làm, mục tiêu riêng |
| Trúc Cơ — “Đường của ta” | Con đường có sẵn không đáp ứng mục tiêu của nhân vật | Chọn công pháp, tìm phương pháp đột phá, vượt đối thủ bằng chuẩn bị | Build đầu có bản sắc; một đối thủ/quan hệ quay lại |
| Kết Đan — “Cái giá của lời hứa” | Nguồn lực quý và lợi ích môn phái mâu thuẫn với lời hứa riêng | Bí cảnh, cứu hoặc giữ vật cần thiết, chọn người tin, luyện pháp bảo | Một món có nguồn gốc và một hệ quả quan hệ bền |
| Nguyên Anh — “Ai quyết vận mệnh” | Sức mạnh mới không tự giải mất mát và ràng buộc | Mục tiêu thần thức/linh hồn đúng nhân vật, truy tìm truyền thừa có giới hạn | Cách tiếp cận thế giới mới; một lựa chọn trách nhiệm |
| Hóa Thần — “Đạo của chính mình” | Phải đối diện ý nghĩa những việc đã làm | Trải nghiệm đời sống/nhân quả có nguồn, thử thách vận dụng ý cảnh | Ý cảnh thay cách chơi; lựa chọn Đọa Ma được giới thiệu rõ |

Các tên chương trong ngoặc là tên làm việc sáng tạo. Chưa gọi chi tiết Nguyên Anh/Hóa Thần là canon nếu thiếu source đủ; trước sản xuất phải lập sổ mốc truyện, thời điểm, nhân vật liên quan và ranh giới quyền lựa chọn. Không cắm một chuỗi sưu tầm đồ vào mọi arc rồi đổi tên cảnh giới.

### 6.3. Tuyến bộ ba

| Nhân vật | Động cơ gần ở Hằng Nhạc | Quyết định đầu mang bản sắc | Hướng riêng từ Trúc Cơ |
| --- | --- | --- | --- |
| Vương Lâm | Chứng minh cách tu luyện có thể vượt bất lợi; giữ bí mật điều chưa hiểu | Giữ một dấu quan sát để thử thêm hoặc chia sẻ đủ phần giúp tuyến vật tư | Quan sát/cấm chế/truyền thừa theo mốc có nguồn; châu là câu chuyện riêng, không quà farm |
| Tư Đồ Nam | Phục hồi khả năng hiện diện và chủ động, không chỉ phụ thuộc người khác | Chọn thời cơ dùng phần lực hữu hạn để giữ mẫu hoặc tạo đường rút | Thu hồi phương pháp/năng lực đã biết, chọn nhịp bộc lộ và hồi phục; không mất trí nhớ |
| Lý Mộ Uyển | Bảo vệ giá trị kiến thức và người bị quy lỗi; tự giải bài toán vật liệu | Dùng mẫu để cứu việc trước hay dành đối chứng rồi quay lại xử lý | Đan–trận và sự chủ động trong hành trình; tự solo được, không buộc đi cùng Vương Lâm |

Ba nhánh chia sẻ thông tin và quyền tiến trình nền, không giấu toàn bộ truyện sau việc chơi ba hồ sơ. Cơ duyên riêng đổi cách làm và mục tiêu, không nhân ba ngân sách dungeon ngay.

### 6.4. Nhiệm vụ mẫu “Một lời đã hứa” — nội dung mới

Người giữ tuyến bị cắt quyền xuất hành vì mẫu hỏng. Người chơi cần cùng tuyến đó để lấy tài nguyên, đã hứa mang về bằng chứng. Sau HN09 có hai việc: **công bố đối chứng trước** hoặc **khắc phục chuyến hàng đang nguy cấp trước**.

- Công bố trước: người phụ trách xác nhận lỗi quy trình, lần quay lại có buổi kiểm công khai và nhiệm vụ lấy mẫu đối chứng.
- Khắc phục trước: người giữ tuyến hoàn tất chuyến hàng, lần quay lại trực tiếp giúp chuẩn bị và đưa đầu mối người nhận hàng.
- Cả hai giải vụ việc, cùng quyền HN10/tiến trình. Khác một cảnh và một biến thể hoạt động, không chỉ đổi câu cuối; giá trị thưởng tương đương.
- Không chốt “thiện/ác”. Lựa chọn cho biết ưu tiên và hệ quả gần; người chơi quyết định một lần khi đã có thông tin, có thể xem lại. Nội dung nối về cùng chương sau.
- Nếu chưa đủ nguồn lực làm cảnh/biến thể callback, bỏ nút lựa chọn giả và viết một kết quả rõ. Không hứa NPC ghi nhớ nếu chưa có phần trả lời về sau.

### 6.5. Mẫu “nghịch thiên” có thể chơi

Ở đầu chương sau, một đối thủ vượt khả năng giữ nguồn lực. Mục tiêu lần đầu là **lấy được bản phương pháp và thoát**, không hạ HP đối thủ. Người chơi quan sát chu kỳ, làm gián đoạn nguồn hỗ trợ trong sân được thiết kế hoặc đi đường chuẩn bị kỹ. Sau nâng build trở lại, có trận đối đầu thật và hồi đáp nhận ra nhân vật.

Tình huống phải báo mục tiêu, cách thất bại và dấu an toàn; không dùng AI kẹt tường hay đồ khắc chế tuyệt đối. Chênh lệch cảnh giới vẫn có nghĩa. Đây là cấu trúc encounter sáng tạo, không tuyên bố một sự kiện nguyên tác cụ thể.

## 7. Hệ thống nhiệm vụ xoay quanh người chơi

Mỗi thẻ nhiệm vụ bắt buộc có: **mong muốn cá nhân → trở ngại → thông tin đọc được → động từ chơi → lựa chọn nếu có → hệ quả → phần thưởng dùng ở đâu → thất bại/thử lại**. “Gặp NPC B” chỉ là phương tiện, không phải nội dung của cả nhiệm vụ.

| Loại | Tác dụng | Cách nhận/hoàn tất |
| --- | --- | --- |
| Chính tuyến | Mốc nhân vật và năng lực mới | Nhận chương một lần; các bước đủ proof nối tự động; lựa chọn/đột phá vẫn chủ động |
| Nhân vật | Động cơ, phương pháp và quan hệ riêng | Một cảnh/hoạt động đúng avatar, không buộc làm ba tuyến |
| Kỳ ngộ | Bất ngờ có logic khi khám phá | Điều kiện địa điểm/tiến trình và tín hiệu tại chỗ; không chỉ tỷ lệ thấp bất tận |
| Việc tông môn | Nguồn chuẩn bị và cảm giác thuộc về một cộng đồng | Chọn trong một danh sách nhỏ; không 10 việc giống nhau mỗi ngày |
| Sự kiện khu vực | Thế giới phản ứng, thuận tiện chơi cùng nhau | Bước vào nhận thông tin/tham gia, đóng góp có proof; phần thưởng riêng |
| Chinh phục/sưu tập | Mục tiêu dài hạn tự đặt | Thấy nguồn và tiến độ; danh hiệu/hình có lịch sử |

Không dùng auto-path để che một chuỗi nhiệm vụ chỉ có đi lại. Một chuỗi 10 phút cần ít nhất hai loại tình huống và một thay đổi có nghĩa. Combat có thể lặp để thành thạo/build, nhưng mục tiêu/chỗ đứng/đối thủ/đồ đang nhắm phải tạo quyết định.

Thất bại thường giữ thông tin và phần đã đạt; trả về checkpoint gần, giải thích một nguyên nhân có thể sửa. Không bắt đọc lại hội thoại, trả lại NPC chỉ để xin thử hoặc mất vật liệu độc hữu. Trong tuyến truyện cho phép một biến cố thất bại mở cảnh khắc phục có giới hạn; không tạo vô hạn nhánh cứu hộ.

## 8. MMO, PvE/PvP và xã hội

| Hệ | Giá trị với người chơi | Bản nhỏ đầu tiên | Điều kiện trước mở rộng |
| --- | --- | --- | --- |
| Farm có mục tiêu | Hoàn thiện món/build tự chọn | Một hoạt động lặp, hai đầu ra có đích dùng | Nguồn–chi, credit, thời gian/thu nhập và vật liệu dư được đo |
| Tổ đội | Người khác mở cách phối hợp | Bí cảnh 2–3 người, solo vẫn có đường vật liệu nền | Support credit, AFK, late join, loot riêng, reconnect |
| Tỷ thí | Thử sức và thể hiện tu luyện | Hai bên đồng ý, biết nhóm cảnh giới/cấu hình, không cướp đồ | Snapshot power, timeout/rời trận/hòa, không farm thưởng thắng |
| Tông môn | Thuộc về một nhóm có mục tiêu | Một công việc chung và vị trí giao lưu/thành tựu | Không thay NPC/truyện bắt buộc toàn realm theo một người |
| Chợ/trao đổi | Nghề/nguồn lực có giá trị giữa người | Chỉ sau một nền kinh tế đủ nguồn và nơi tiêu | Ownership/ledger/binding/tax/anti-dup và quan sát lạm phát |
| Tranh đoạt | Rủi ro đối kháng tự chọn | Chặng riêng sau tỷ thí và tổ đội | Luật vào/thoát/loot công khai, không chặn đường chính của người mới |

Không lịch hẹn bắt buộc trong chương đầu; không tiền thưởng riêng cho từng màn. Sưu tập/diện mạo và thành tựu có thể lâu dài mà không buộc tăng sức mạnh vô hạn. Đọa Ma từ Hóa Thần giữ hướng owner đã nêu, nhưng cần thiết kế hành vi/chi phí/counterplay/khả năng đổi lại trước mở; không đơn thuần đổi HUD hay thanh thiện ác.

## 9. Thứ tự thực hiện và các giả thuyết cần kiểm

| Gói | Bàn giao có thể chơi | Gate quyết định |
| --- | --- | --- |
| P0 — hiểu và ít thao tác | Nhãn tiến trình thống nhất, auto tầng nhỏ/mốc đủ, bỏ xác nhận rỗng; chuẩn bị migration nguồn thưởng | Người mới giải thích đúng tu vi/MP; save cũ giữ đủ; chưa áp bảng HN09 mới |
| P1 — chương có tình huống | HN02/HN03 liền mạch, HN04 mới, HN09 thực địa kèm ngân sách tu vi mới, EX mở sớm, một callback truyện | HN04 vui hơn qua quan sát; không thêm menu/hành trình NPC; tuyến chính với idle tắt/không EX vẫn đủ mọi gate |
| P2 — mạnh lên và tự chọn | Prototype nguồn power, hai cách vận hành, một vòng farm/đồ hữu ích | Chọn build có đánh đổi thực, không một lựa chọn thắng mọi tình huống |
| P3 — Trúc Cơ | Một tuyến riêng/người, một đột phá, bí cảnh nhỏ và tỷ thí | Nguồn/arc đủ, power/credit/lifecycle có luật, chơi solo vẫn tiếp được |
| P4 — mở rộng theo nhu cầu | Kết Đan, pháp bảo lâu dài, nghề/tông môn; sau đó Nguyên Anh/Hóa Thần | Vòng trước giữ người chơi nhờ mục tiêu hữu ích; đủ nội dung/ART/cân bằng và nguồn truyện |

Không đưa tất cả feature thị trường vào P0/P1. Đầu ra của mỗi gói phải là trải nghiệm hoàn chỉnh có thể đánh giá; mở menu mà chưa có việc chơi không tính xong.

Kiểm số thử trên fixture, tách thay power khỏi thay quest để biết cải tiến đến từ đâu. Không suy “test pass” thành “đã vui”; sau 5 lượt đầu ghi lại người bỏ cuộc, mục tiêu không hiểu, số lần mở NPC, thời gian điều khiển/chờ, cách giải HN04 và điều người chơi nhớ về nhân vật. Tài liệu này chưa có số retention hoặc kết quả khảo sát thực tế.
