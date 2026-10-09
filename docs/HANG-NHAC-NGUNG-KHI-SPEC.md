# Đặc tả trải nghiệm Hằng Nhạc — Ngưng Khí

**Phiên bản:** 0.4 · **Ngày:** 08/10/2026 · **Trạng thái:** bộ skill khởi đầu chung đã chốt; chi tiết tiến trình/encounter để đánh giá. [R01](HANG-NHAC-R01-RUNTIME.md) và [mở đầu HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử; HN03–HN12 và khảo nghiệm chưa triển khai đầy đủ.

**Tham chiếu:** [GDD 0.28](GDD.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md), [hệ thống tu tiên](CULTIVATION-SYSTEM.md), [nhân vật](CHARACTERS.md), [định hướng online](ONLINE-DIRECTION.md), [backlog](MVP-BACKLOG.md).

## 1. Mục tiêu và mức độ quyết định

Người chơi chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển, vào Hằng Nhạc, học vận dụng sức mạnh và trải qua tiến trình Ngưng Khí trước khi rời map. Khi kết thúc, họ hiểu mình đang điều khiển ai, vì sao phải chuẩn bị cho bình cảnh và con đường nào sẽ mở tiếp.

| Nội dung | Mức độ quyết định |
| --- | --- |
| Ba nhân vật chọn được từ đầu; Hằng Nhạc qua Ngưng Khí; phân hóa sâu sau map đầu | Đã được chủ dự án thống nhất |
| Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 có sẵn cho cả ba từ lúc bắt đầu điều khiển | Đã chốt; nhiệm vụ hướng dẫn không là cổng quyền dùng ba skill |
| Sáu phần tu tiên; nền chiến đấu chung và dấu nhận diện nhẹ | Khung GDD hiện hành |
| Bốn mốc trải nghiệm, tám chặng, tuyến HN01–HN12, bố trí khu và khảo nghiệm dưới đây | Đề xuất của đặc tả này, cần đánh giá trước triển khai |
| Tên nhiệm vụ mới, pháp khí luyện tập, tình huống và đối thủ mẫu | Nội dung chuyển thể đề xuất; không phải tên/sự kiện nguyên tác đã xác minh |
| Phân bổ 15 tầng, bốn mốc 1/3/9/15, stat, chi phí và phần thưởng định lượng | Có bảng thử trong hồ sơ tiến trình; chưa khóa, cần đánh giá/chơi thử |

Tài liệu đặc tả trải nghiệm sản phẩm, không tự sửa luật runtime, JSON, timeline hoặc asset đã bàn giao. Các con số đếm chặng/mốc/nhiệm vụ là cách tổ chức bản thiết kế, không thay số tầng của nguyên tác. Quy tắc chi tiết bên dưới đều là đề xuất nếu không ghi rõ đã chốt.

## 2. Lời hứa trải nghiệm

**Từ chưa làm chủ năng lực hiện dùng được → có thể tự vận dụng, chuẩn bị và vượt một khảo nghiệm nhập môn.**

Đầu map có mục tiêu gần, người hướng dẫn và hành động dễ hiểu. Giữa map có vấn đề buộc thay cách vận dụng, thay vì chỉ chờ thanh tu vi đầy. Cuối map cho dùng những gì đã học trong một trận có nhịp và kết thúc bằng mục tiêu cá nhân mới.

Chất tu tiên đến từ công pháp, vận hành linh lực, cơ duyên và bình cảnh; sức hấp dẫn MMO đến từ thấy người khác trong môn phái, có hoạt động lặp tùy chọn và chia sẻ trải nghiệm. Tuyến bắt buộc tự hoàn thành được bằng cả ba nhân vật.

## 3. Mở đầu và ranh giới chuyển thể

Màn chọn giới thiệu danh tính, trạng thái hiện tại, cách chơi nhập môn và hướng phát triển sau này. Không bắt chọn class/công pháp dài hạn ngay trước khi biết combat. Cách tạo thêm hồ sơ/đổi người theo chính sách tài khoản còn cần đặc tả; không chuyển người giữa trận trong tuyến này.

Hằng Nhạc là không gian gameplay chung của một bản chuyển thể. Màn giới thiệu hành trình nói ngắn gọn rằng mở đầu này được tổ chức lại cho game; hội thoại không kể ba người từng cùng nhập môn trong nguyên tác. Nhiệm vụ chung ghi nhận năng lực hoàn thành khảo nghiệm, không bắt cả ba có cùng thân phận đệ tử hoặc lịch sử gia nhập.

| Nhân vật | Mở đầu đề xuất | Cách trình bày tiến triển | Đoạn nhận diện riêng |
| --- | --- | --- | --- |
| Vương Lâm | Tiếp cận Hằng Nhạc, mong tìm đường tu luyện; các chi tiết thân thế/cơ duyên giữ trong tuyến riêng có nguồn | Tu vi và mốc Ngưng Khí phù hợp hồ sơ truyện đã biên tập | Quan sát một dấu hiệu, thử giả thuyết rồi vận dụng trong khảo nghiệm |
| Tư Đồ Nam | Điều khiển biểu hiện linh thể bị giới hạn trong không gian chuyển thể; bài học là hồi phục khả năng thi triển | Trạng thái linh thể, tiến triển hồi phục và năng lực hiện dùng được | Nhận ra cách vận hành, nhưng phải ổn định linh thể mới dùng được |
| Lý Mộ Uyển | Tiếp cận thử luyện của không gian chuyển thể với bản sắc đan–trận; không kể đây là lần gặp đầu nguyên tác | Mốc tu luyện gameplay nhập môn; cảnh giới/trạng thái truyện phải đối chiếu riêng | Nhận biết tài nguyên và chọn cách chuẩn bị để tự vượt thử thách |

Tư Đồ Nam không bị xóa kiến thức, không sở hữu một Thiên Nghịch Châu khởi đầu độc lập. Việc linh thể đi lại/tương tác ngoài châu là quy ước chuyển thể phải biên tập rõ trước triển khai; chưa chốt nguồn neo hay cơ chế duy trì, không coi là năng lực nguyên tác được xác nhận. Lời dẫn của ông có thể là tự đánh giá hoặc lời của người trông coi thử luyện, tránh để NPC dạy lại kiến thức sơ cấp như ông chưa từng biết.

Lý Mộ Uyển có tuyến tự chiến đấu và tự chuẩn bị. Nhiệm vụ không phụ thuộc một người chơi Vương Lâm khác. Số phận nhân vật ở arc sau nằm ngoài phạm vi map này.

Thiên Nghịch Châu chỉ được giới thiệu/sử dụng khi tuyến Vương Lâm đã biên tập đúng điều kiện. Tuyến HN chung không cần châu để tiến triển, không cấp tác dụng thời gian hoặc quyền học cho cả ba từ cơ duyên này. Cảnh nguồn, lời thoại và thứ tự cơ duyên cần hồ sơ truyện riêng trước sản xuất.

## 4. Không gian Hằng Nhạc

Các khu dưới đây là chức năng thiết kế, chưa là địa lý nguyên tác hoặc yêu cầu tám background mới. Có thể ghép nhiều chức năng trong sân chung và dùng lại nền cho phiên khảo nghiệm.

**Chủ dự án chốt chia cảnh 08/10/2026:** khu môn phái theo concept hiện tại phục vụ NPC/nhiệm vụ/tu luyện/luyện thuật/chuẩn bị; map ngoại vi riêng phục vụ khám phá, đánh quái và thu tài nguyên, nối lối ra–quay về trong giai đoạn Ngưng Khí; khảo nghiệm vào phiên riêng. Không đồng nhất lối ra ngoại vi với xuất hành HN12. Vị trí cổng, điều kiện mở nội dung, quyền credit/loot/spawn và cách chia sẻ map farm chưa khóa; chưa có map ngoại vi hoặc chuyển scene MMO được tích hợp.

[Bố cục map v0.1](HANG-NHAC-MAP-LAYOUT.md) giữ tám mã chức năng; vị trí/kích thước cũ chỉ là tham chiếu. Chủ dự án yêu cầu [map đầy đủ mới](design/world/hang-nhac-map-v1/README.md) đúng tỷ lệ người trước, sau đó tự vẽ luồng đi/chặn và mới làm asset rời. Bộ concept/nền/ba asset thử trước đã xóa; map mới chưa có collider hoặc chuyển scene. Quy trình theo [quy tắc xây map](MAP-BUILDING-GUIDE.md).

| Mã khu | Khu chức năng đề xuất | Người chơi làm gì | Cách chia sẻ |
| --- | --- | --- | --- |
| HN-Z01 | Cổng và điểm tiếp dẫn | Vào map, tương tác, biết mục tiêu | Khu chung; lời dẫn theo hồ sơ |
| HN-Z02 | Sân môn phái | Gặp người chơi, nhận nhiệm vụ, thử di chuyển | Khu chung; điểm tương tác không tranh lượt |
| HN-Z03 | Điểm thổ nạp | Học công pháp nền, tích lũy và xem bình cảnh | Không gian chung; tiến trình riêng |
| HN-Z04 | Sân luyện thuật | Học khoảng cách, báo đòn và thử kỹ năng | Vùng luyện riêng/phiên nhỏ để tránh VFX che bài học |
| HN-Z05 | Map ngoại vi riêng, nối lối ra khu môn phái | Khám phá, chiến đấu, farm và thu tài nguyên; có đường quay về | Đã chốt tách scene; khu chung/quyền mục tiêu cá nhân/phiên và loot cần prototype chọn phương án |
| HN-Z06 | Điểm chuẩn bị và luyện hóa | Xem vật phẩm, chuẩn bị, thử pháp khí | Khu chung; vật phẩm/tiêu hao riêng |
| HN-Z07 | Khu khảo nghiệm | Vượt bình cảnh và khảo nghiệm cuối | Phiên cá nhân bắt buộc; tổ đội là nội dung tùy chọn về sau |
| HN-Z08 | Điểm xuất hành | Tổng kết, biết điều kiện và mục tiêu kế tiếp | Khu chung; cổng mở theo hồ sơ |

Đường tiến triển chức năng: **Z01 → Z02 → Z03/Z04 → Z05/Z06 → Z07 → Z08**. Các khu đã mở cho quay lại luyện tập; không tạo đường một chiều khiến mất hoạt động chuẩn bị. Chuyển khu không tự hủy thành quả nhiệm vụ hoặc kích hoạt mốc mới.

NPC tối thiểu theo vai chức năng: tiếp dẫn, coi luyện thuật, quản tài nguyên/chuẩn bị, coi khảo nghiệm. Có thể gộp vai để giảm ngân sách; tên và danh tính phải biên tập theo truyện, không dùng Tôn Đại Trụ hay trưởng lão canon cho mọi vai mà chưa đối chiếu. Bộ ba là lựa chọn người chơi; không tự đặt bản sao NPC của nhân vật đang điều khiển vào tuyến chung.

## 5. Bốn mốc trải nghiệm

| Mốc | Năng lực cần đạt | Nội dung mở | Minh chứng vận dụng |
| --- | --- | --- | --- |
| HN-M01 — Cảm nhận | Biết nguồn lực hiện tại và cách tích lũy/hồi phục | Công pháp nền; thổ nạp hoặc diễn giải hồi phục | Hoàn thành lần chuẩn bị đầu và nhận ra tu vi khác linh lực |
| HN-M02 — Vận dụng | Tấn công, đọc báo đòn, giữ khoảng cách/di chuyển | Bài luyện bộ thuật đã có và tuyến ngoại vi | Tự hoàn thành một trận đơn giản bằng năng lực hiện có |
| HN-M03 — Thông suốt | Hiểu giới hạn vận hành, biết chuẩn bị/luyện hóa, đạt ngưỡng 9 | Tiếp cận nền vận hành 10–15 sau HN09 | Giải bình cảnh, dùng pháp khí và qua bài tích hợp |
| HN-M04 — Hoàn tất nhập môn | Vận dụng ổn định trong khảo nghiệm tổng hợp | Tổng kết và quyền xuất hành | Hoàn thành tuyến/đoạn riêng, mốc tu luyện và khảo nghiệm cuối |

M01–M04 không phải bốn tầng Ngưng Khí. [Hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) đối chiếu nguồn 15 tầng và đề xuất phân bổ mốc 1/3/9/15 trong map chuyển thể. M01 sau HN02, M02 sau HN05, M03 sau HN09, M04 sau HN10; mỗi mốc còn cần ngưỡng tương ứng. Ngưỡng/stat và phạm vi hết 15 tầng trong Hằng Nhạc chưa được duyệt chi tiết, không mặc định là cùng niên biểu nguyên tác.

Tư Đồ Nam đi qua quyền tiếp cận nội dung tương ứng bằng mốc hồi phục; UI không ghi ông có cảnh giới nguyên tác Ngưng Khí. Không dùng tên cảnh giới truyện của ông để ghép vào nội dung có chiến lực vượt giới hạn nhập môn.

## 6. Tám chặng của hành trình

| Chặng | Nhiệm vụ | Trải nghiệm chính | Hệ thống được giới thiệu |
| --- | --- | --- | --- |
| 1. Chọn và tới Hằng Nhạc | HN01 | Nhận diện nhân vật, di chuyển, tương tác và nhìn thấy người khác | Hành trình cá nhân |
| 2. Làm chủ nền đầu | HN02–HN03 | Chuẩn bị, vận hành linh lực, thử một đòn có tác dụng ngay | Công pháp, cảnh giới/trạng thái, thuật pháp |
| 3. Tự vượt thử luyện nhỏ | HN04–HN05 | Đọc báo đòn, dùng di chuyển, chiến đấu ngoài sân | Combat và tài nguyên |
| 4. Dấu nhận diện cá nhân | HN06 | Hoàn thành một tình huống khác theo nhân vật | Hành trình, cách chuẩn bị |
| 5. Gặp và giải bình cảnh | HN07 | Nhận ra tích lũy đủ vẫn thiếu cách vận dụng | Lĩnh ngộ nhập môn |
| 6. Công cụ và ổn định | HN08–HN09 | Nhận biết/luyện hóa pháp khí, luyện tập rồi tiến triển | Pháp bảo, tu luyện có giới hạn |
| 7. Khảo nghiệm tổng hợp | HN10 | Vận dụng toàn bộ bài học trong encounter có nhịp | Liên kết sáu phần |
| 8. Xuất hành | HN11–HN12 | Tổng kết thành quả, nhận mục tiêu riêng và rời map | Chuẩn bị tuyến Trúc Cơ |

Người chơi có thể thử bộ R01 từ lần đầu điều khiển. HN03 hướng dẫn đòn thường/Kiếm/Lôi và HN04 hướng dẫn Phong; ba skill không chờ hoàn thành bài mới dùng được. HN02 chỉ cần vòng chuẩn bị ngắn để hiểu cơ chế. Có thể đọc lại hướng dẫn, bỏ qua lời thoại đã xem và trở lại sân luyện.

## 7. Tuyến nhiệm vụ HN01–HN12

ID dùng trong tài liệu thiết kế, chưa là ID JSON/runtime. Phần thưởng có tác dụng ở bảng này và số lượng thử tại [hồ sơ tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md); chưa khóa số liệu/tên vật phẩm canon. Mỗi nhiệm vụ có lời dẫn phù hợp trạng thái nhân vật, dùng chung mục tiêu học chơi khi có thể.

| ID / tên làm việc | Điều kiện đầu | Hành động và điều kiện hoàn thành | Kết quả / phần thưởng lần đầu |
| --- | --- | --- | --- |
| HN01 — Bước vào Hằng Nhạc | Đã chọn hồ sơ; có sẵn ba skill R01 | Tới điểm tiếp dẫn, tương tác và nhận mục tiêu; Tư Đồ Nam dùng lời dẫn hồi phục | Mở khu nền và nhật ký; giữ quyền skill đã có, không cấp lần nữa |
| HN02 — Một vòng vận hành | HN01 | Nhận vật tư hướng dẫn, chọn nền tu luyện và hoàn thành vòng có tương tác; xem giải thích tu vi/linh lực | Đạt M01; mở hoạt động tích lũy phù hợp nhân vật |
| HN03 — Vận dụng thuật nền | HN02 | Hướng dẫn đòn thường, Kiếm Khí và Lôi Ấn; thử hướng/target và hit hợp lệ trong bài luyện | Hiểu các thuật vốn có, mở bài luyện lại; không cấp lại quyền skill hoặc yêu cầu tối ưu damage |
| HN04 — Nhìn đòn mà tiến | HN03 | Qua làn báo đòn bằng di chuyển thường, sau đó thử Ngự Phong Bộ trong bài an toàn | Hiểu di chuyển/cooldown/tài nguyên; không cấp lại quyền Phong |
| HN05 — Ra khỏi sân luyện | HN04 | Hoàn thành encounter đơn giản và lấy tài nguyên nhiệm vụ; không tranh last-hit với người khác | M02 khi đủ ngưỡng 3; mở tuyến ngoại vi và chuẩn bị hồi phục |
| HN06 — Dấu riêng | HN05 | Chạy một nhánh WL/TDN/LMW tại mục 8; ghi nhận bằng hành động và kết luận | Mốc cá nhân; không cấp pháp bảo/cảnh giới cao |
| HN07 — Vì sao chưa tiến? | HN06 và ngưỡng 3 đã xác nhận | Xem phần thiếu, luyện cách giải, kiểm chứng bài ngắn; chủ động xác nhận nền tiếp | Ghi nhận hiểu/vận hành 4–9 và giải bình cảnh; không tự vượt khi offline |
| HN08 — Vật trong tay | HN07 | Nhận pháp khí luyện tập, nhận biết, luyện hóa theo hướng dẫn và thử tác dụng | Mở pháp khí nền; biết sở hữu khác vận dụng; M03 chưa nhận ở HN08 |
| HN09 — Vận dụng ổn định | HN08; hoàn tất cần ngưỡng 9 đã xác nhận | Luyện phối hợp ba thuật vốn có, linh lực/pháp khí; có hoạt động lặp tùy chọn | M03, mở nền 10–15; xem điều kiện HN10; không cấp thêm Lôi Ấn |
| HN10 — Khảo nghiệm nhập môn | HN09, ngưỡng 15/hồi phục cuối đã xác nhận, đủ chuẩn bị | Chủ động vào phiên, hoàn thành các pha tại mục 11 | M04; kết quả và thưởng một lần; stat M04 chỉ sau trận |
| HN11 — Nhìn lại con đường | HN10 | Xem điều đã mở, thử kiểm tra bộ đang dùng, nhận mục tiêu cá nhân sau map | Ghi nhận hoàn tất nhập môn; hướng chuẩn bị Trúc Cơ/hồi phục tiếp |
| HN12 — Xuất hành | HN11 | Xác nhận đi tiếp tại cổng; nếu map sau chưa có thì hiển thị đích phát triển và dừng bản thử tại đây | Quyền rời Hằng Nhạc được lưu; không tự cấp Trúc Cơ |

Hoàn thành tuyến không cần điểm đánh giá cao, farm boss nhiều lần, giao dịch hoặc chờ tổ đội. Nhiệm vụ trước được xem lại nhưng không cấp lại tu vi/đồ độc hữu. Bài luyện lại không ghi đè kết quả vượt mốc đã có.

## 8. HN06 — ba đoạn nhận diện nhẹ

| Nhánh | Vấn đề / thao tác | Điều người chơi nhận ra | Giới hạn phạm vi |
| --- | --- | --- | --- |
| HN06-WL — Quan sát đường thuật | Một mục tiêu đổi vị trí sau dấu báo; quan sát rồi chọn khoảng cách/góc thi triển thuận lợi | Quan sát và tính toán giúp vận dụng năng lực nền | Dấu hiệu và bài luyện là sáng tạo; không tự mở thần thức/cấm chế cấp cao |
| HN06-TDN — Biết mà chưa dùng được | Bài luyện cho thấy giới hạn hiện diện; chọn bước ổn định rồi mới thử lại đòn đã biết | Tri thức khác khả năng thi triển hiện tại | Không xóa thuật đã biết trong truyện; bài hiện tại chỉ mở phần vận dụng nhập môn |
| HN06-LMW — Chuẩn bị đúng thứ | Xem vấn đề sắp gặp, nhận biết nguyên liệu và chọn một vật tư hỗ trợ phù hợp rồi tự thử trận nhỏ | Chuẩn bị đan–trận giúp chủ động, không thay thao tác chiến đấu | Công thức/vật tư mẫu là chuyển thể; không yêu cầu chữa cho người chơi khác |

Mỗi nhánh chỉ dạy một nét riêng, dùng lại nền combat và không mở ba hệ nghề/cây kỹ năng hoàn chỉnh. Độ khó và giá trị phần thưởng tương đương theo mục tiêu học, không nhất thiết cùng vật phẩm. Chuẩn bị hồi phục cơ bản vẫn có cho cả ba; bản sắc Lý Mộ Uyển không khóa quyền hồi phục của hai người còn lại.

## 9. HN07 — bình cảnh mẫu và lĩnh ngộ nhập môn

Vấn đề chung: **đã tích lũy đủ cho mốc này nhưng chưa vận dụng ổn định**. Bảng điều kiện nêu phần thiếu là bài hiểu/vận dụng, không yêu cầu tiếp tục giết quái để đầy một thanh lĩnh ngộ.

| Nhân vật | Diễn giải và cách giải đề xuất | Cách kiểm chứng |
| --- | --- | --- |
| Vương Lâm | Thi triển liên tục làm mất nhịp; quan sát thời điểm đối thủ kết thúc đòn rồi vận dụng ở cửa sổ an toàn | Hoàn thành bài đánh có báo đòn, dùng khoảng cách/nhịp hồi phục để có lần thi triển hợp lệ |
| Tư Đồ Nam | Năng lực đang biểu hiện chưa chịu được vận dụng dồn; ổn định linh thể trong pha an toàn | Giữ được trạng thái đủ để hoàn thành chuỗi hành động nhập môn; không gọi đây là ông mới hiểu nguyên lý sơ cấp |
| Lý Mộ Uyển | Chuẩn bị không phù hợp nhu cầu khiến hụt nguồn lực; nhận ra phải chọn vật tư và thời điểm dùng | Tự chọn chuẩn bị, dùng đúng tác dụng và hoàn thành bài với năng lực nền |

Vật tư của bài học được cấp đủ, có thử lại và chỉ dẫn sau lần chưa đạt. Không ép phản xạ hoàn hảo, một combo cứng hoặc chọn câu trả lời trivia. Cách giải được đánh giá từ hành động/điều kiện bài học; lời kết xác nhận điều đã hiểu, không cấp ý cảnh Hóa Thần.

Luồng của mốc: **đủ tích lũy → thấy bình cảnh → hoàn thành kiểm chứng → thấy đầy đủ điều kiện → chủ động vượt mốc/hồi phục → thử năng lực ổn định**. Chi phí chỉ bị trừ khi thao tác vượt mốc được máy chủ chấp nhận. Không tung xác suất thất bại trong bản đề xuất nhập môn này. Dùng lại bài không lặp chi phí/thưởng của lần đã xác nhận.

## 10. Chiến đấu và bộ thuật nền

Bộ khởi đầu đã chốt cho cả ba là **Kiếm Khí / Lôi Ấn / Ngự Phong Bộ R01**, có sẵn từ lúc điều khiển. Đòn thường/đi bộ là thao tác nền. Chức năng và baseline được đề xuất tại [hồ sơ gameplay](NGUNG-KHI-GAMEPLAY-SPEC.md); số slot toàn game và quyền học truyền thừa về sau chưa khóa.

| Chức năng | Vận dụng đề xuất | Bài học | ART tham chiếu |
| --- | --- | --- | --- |
| Tấn công thường | Phản hồi ổn định, giúp tiếp tục trận khi thiếu linh lực | Khoảng cách, hướng và nhịp hồi phục | Animation ba nhân vật còn cần kiểm kê |
| Tấn công có hướng | Đường đánh rõ, hiệu lực khi hit được xác nhận | Căn hướng, giữ khoảng cách | R01 Kiếm Khí |
| Lôi đơn mục tiêu | Chọn một mục tiêu, khóa điểm thi triển, có cửa sổ đối phó | Chọn thời điểm; vòng sáng không tạo AoE hoặc hit phụ | R01 Lôi Ấn |
| Di chuyển | Dịch chuyển theo luật host, có giới hạn sử dụng | Thoát vùng nguy hiểm và đổi vị trí | R01 Ngự Phong Bộ |
| Pháp khí luyện tập | Đề xuất pháp khí hộ thân: chủ động giảm tác động của một đòn trong cửa sổ ngắn, đổi lại tiêu linh lực và thời gian hồi | Biết dùng công cụ đúng lúc, có đánh đổi | Chưa có hiệu ứng/animation riêng được duyệt |

Quyền dùng bộ chung đã được chủ dự án chốt, thay trạng thái “cần xét ai được học” của v0.1. Bộ này là chuyển thể của game; lời dẫn phải hợp nhân vật, không ghi rằng nguyên tác có sự kiện cả ba học cùng thuật tại Hằng Nhạc. Không biến họ thành ba class tương ứng hoặc thay skill của một người vì suy từ nguồn ART.

Quyền dùng ba skill và đòn thường/đi bộ có từ đầu; thứ tự **hướng dẫn** là HN03 đòn thường/Kiếm/Lôi → HN04 Phong → HN08 pháp khí → HN09 phối hợp. Thanh skill không khóa nút trước bài học. Pháp khí vẫn là nội dung nhận/luyện hóa sau HN08, không thuộc bộ ba skill khởi đầu.

[Hồ sơ tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất pháp khí hộ thân, chi phí luyện hóa và vật tư hồi phục; tên/tác dụng/số liệu chưa duyệt. Trước HN10 có thể luyện lại với công cụ này; bài có phương án né bằng di chuyển thường khi công cụ chưa sẵn sàng. Vật phẩm truyện/Thiên Nghịch Châu không thay thế pháp khí học luyện hóa chung.

Các luật cần có khi làm prototype: báo đòn đọc được; tấn công không trúng không tiêu hao HP mục tiêu; không damage qua tường nếu hồ sơ đòn cấm; không miễn nhiễm mặc định khi dùng Phong; cạn linh lực vẫn có đòn nền/di chuyển thường và cách hồi phục hợp lệ. Không bắt mua vật phẩm để thử lại.

## 11. Đối thủ và khảo nghiệm cuối HN10

Đối thủ dùng archetype thiết kế, chưa khóa loài hoặc danh tính canon. Mục tiêu luyện có thể là hình nhân/đối thủ thử luyện; combat thật cần mục tiêu chuyển động và phản ứng hit. Impact không vẽ sẵn bia đá/vụn đá cho mọi va chạm.

| Mẫu | Hành vi và cửa sổ đối phó | Nơi dùng |
| --- | --- | --- |
| HN-E01 — Áp sát | Tiến vào cự ly, báo đòn ngắn, hồi phục sau đánh | HN04/05: học khoảng cách và né |
| HN-E02 — Thi triển | Báo vùng/đường đánh, giữ vị trí lúc thi triển rồi có cửa sổ tiếp cận | HN06/07/09: đọc vùng và thời điểm |
| HN-E03 — Chủ khảo | Kết hợp hai mẫu ở nhịp rõ hơn, đổi pha sau điều kiện trận | HN10: tổng hợp, không chỉ tăng HP |

HN10 là phiên cá nhân ba pha, có nhịp nghỉ đủ để hiểu điều vừa xảy ra. Không cần boss thế giới hoặc ba người chơi theo ba vai.

[Hồ sơ đối thủ và khảo nghiệm v0.1](HANG-NHAC-ENCOUNTERS-TRIAL.md) đề xuất stat/collider, mask/báo đòn, chu kỳ AI, chủ khảo hai nhịp tại nửa HP và luật checkpoint/reset/kết nối lại. Các chi tiết này chưa duyệt/chơi thử; bảng dưới là tóm tắt hiện hành.

| Pha | Nội dung | Điều kiện qua | Trọng tâm |
| --- | --- | --- | --- |
| 1. Vận dụng | Một E01 áp sát | E01 bị hạ, player còn HP>0, có hit hợp lệ trong pha; đòn thường/Kiếm/Lôi đều tính | Căn hướng/khoảng cách; không đòi né hoàn hảo hoặc cast riêng |
| 2. Chuẩn bị và ứng phó | Một E02 với dấu tròn/đường phù đã khóa | E02 bị hạ, player còn HP>0; đi bộ có đường né, không bắt dùng Phong/hộ thân | Biết chuẩn bị và chọn công cụ; không phụ thuộc potion |
| 3. Tổng hợp | Một E03, đổi nhịp A/B ở HP≤120/240 | E03 bị hạ, player còn HP>0; không bắt xem đủ nhịp B hoặc combo/điểm ẩn | Phối hợp nền, đọc chu kỳ; không thêm thuật mới giữa trận |

Mục tiêu pha 1 thay ví dụ cũ chỉ kiểm một thuật: hit tấn công hợp lệ có thể từ đòn thường/Kiếm/Lôi; HN03 đã có bài học thuật. Chỉ số trúng/né/công cụ dùng để gợi ý, không chặn người chơi thắng trận hợp lệ. Toàn HN10 dùng stat M03; M04 chỉ nhận sau kết quả pha 3.

Chuẩn bị trước trận hiển thị điều kiện vào, pháp khí/thuật hiện dùng và vật tư. Trận chưa đạt đưa người chơi về điểm chuẩn bị, nêu nguyên nhân quan sát được và cho thử lại; không mất cảnh giới hoặc pháp bảo. Đề xuất cấp đủ vật tư luyện bắt buộc cho lần thử, tránh phải farm để vượt tutorial; phần thưởng lần đầu không cấp lại.

Phiên đã hoàn thành có thể xem lại kết quả. Chế độ luyện lại, nếu mở, tách khỏi thưởng. Đề xuất lưu checkpoint pha 1/2 theo hồ sơ; thất bại/thoát thử lại pha chưa qua, reset cả hai actor/HP/linh lực/cooldown và dọn đòn cũ. Mất mạng có pause tối đa 30 giây riêng HN10, sau đó về checkpoint; không pause khu chung hoặc cấp offline reward. Chi tiết và lưu/migration theo hồ sơ encounter, còn cần đặc tả kỹ thuật.

## 12. Tài nguyên, idle và hoạt động lặp

| Loại | Vai trò trong map | Giới hạn thiết kế |
| --- | --- | --- |
| Tu vi / tiến triển hồi phục | Tích lũy tới mốc, tách khỏi linh lực trong trận | Đủ tích lũy chưa bỏ qua HN06/07/10; không tự vượt bình cảnh |
| HP và linh lực | Sống sót và vận dụng năng lực | Hồi phục có luật; cạn linh lực không giảm tu vi |
| Vật tư chuẩn bị | Học thu nhận, chọn dùng và chuẩn bị | Nguyên liệu nhiệm vụ cần nguồn thay thế/thử lại; không bắt tranh spawn |
| Vật phẩm/tri thức mốc | Quyền học, pháp khí, kết luận lĩnh ngộ và truyện | Thưởng một lần; không mặc định giao dịch hoặc bán đồ bắt buộc |

Vật tư nhiệm vụ bắt buộc không bị mất do bán nhầm; nếu có tiêu hao phải có cách nhận lại. Không cho thiếu vật tư tutorial trở thành lý do cần trả tiền. Thu hoạch trong khu môn phái phải là hoạt động được cho phép, không mặc định lấy cây ở dược viên canon.

Idle được mở sau HN02, tiếp tục hoạt động tích lũy đã chọn trong trạng thái hợp lệ. [Hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất một nền tại một thời điểm, tiếp tục khi đi/tương tác an toàn, tạm dừng combat/bài tương tác và cap offline thử 30 phút. Đây là bản đề xuất GD08, chưa chốt trước runtime; UI phải nói rõ đang chạy/tạm dừng/chạm cổng.

Tới cổng tích lũy: nền dừng đúng ngưỡng và báo phần thiếu. Thưởng nhiệm vụ vượt cổng được giữ trong tu vi đã tích lũy, không mất phần dư hoặc tự vượt cổng. Không tự chạy HN06/07/09/10/12 hay xác nhận tầng khi offline, không offline combat. Thời lượng/cap/sản lượng có số thử nhưng chưa khóa; không lấy lại 8 giờ/10 giây/480 tu vi của bản cũ làm quyết định mới.

Hoạt động lặp tùy chọn: luyện thuật trên sân, encounter đã mở, thu vật tư được phép, giúp đỡ người cùng khu. Có mục tiêu điều chỉnh cách vận dụng/chuẩn bị; không bắt làm daily để rời Hằng Nhạc. Quyền thưởng, sản lượng và chống farm vô hạn thuộc hồ sơ kinh tế. Nhiệm vụ truyện độc hữu không biến thành biến cố lặp toàn server.

## 13. Mở UI theo trải nghiệm

| Mốc | Thông tin ưu tiên | Phần mở dần |
| --- | --- | --- |
| HN01 | Nhân vật, mục tiêu, di chuyển/tương tác, ba skill có sẵn, trạng thái kết nối | Nhật ký hành trình ngắn; chú giải ngắn trên từng skill |
| HN02 | Tu vi/tiến triển hồi phục và linh lực giải thích riêng | Công pháp nền, hoạt động đang chạy |
| HN03–05 | HP/linh lực, thuật đang dùng, báo đòn và mục tiêu | Bài luyện bộ thuật vốn có, hành trang cần thiết |
| HN06–07 | Đoạn riêng, phần thiếu của bình cảnh, cách kiểm chứng | Điều đã hiểu được ghi nhận trong tu tiên |
| HN08–09 | Sở hữu/luyện hóa/vận dụng pháp khí, chuẩn bị | Chi tiết pháp khí và điều kiện khảo nghiệm |
| HN10–12 | Pha trận, kết quả, điều kiện rời map, mục tiêu mới | Tổng kết sáu phần và tuyến kế tiếp |

Không đưa sáu thanh EXP hoặc sáu cây nâng cấp ở màn đầu. Mục tiêu hiện tại có hành động/địa điểm rõ; khi thiếu điều kiện cho biết cách tiếp cận mà không spoil chương chưa mở. Tư Đồ Nam dùng từ “hồi phục/khả năng hiện diện” ở mốc riêng.

Các trạng thái bắt buộc thiết kế: chưa mở, đang làm, đủ điều kiện cần xác nhận, đã hoàn thành, thiếu tài nguyên, trận chưa đạt, mất kết nối/đang đồng bộ, kết quả đã được ghi. Nút không khả dụng có lý do; nhấn lại không tạo thêm thưởng.

## 14. Online và lưu tiến trình

Khu chung hiển thị biệt danh tài khoản cùng nhân vật đã chọn. Hai người chọn Vương Lâm vẫn có tiến trình riêng, không tạo một bản canon chung. NPC, lời dẫn và chương riêng được thể hiện theo hồ sơ; người khác hoàn thành HN10 không mở cổng cho người chưa đạt.

Thu nhận mục tiêu tutorial theo quyền cá nhân: không tranh last-hit, không chặn người khác ở điểm tương tác. Với HN-Z05 cần chọn cách dùng spawn riêng, quyền credit riêng hoặc phiên nhỏ; không coi lựa chọn kỹ thuật nào đã chốt. Nhiệm vụ bắt buộc có đường solo; tổ đội, PvP và giao dịch không là điều kiện xuất hành.

Khi triển khai, máy chủ xác nhận tiến trình HN, nguồn lực, quyền học/luyện hóa, vị trí, cast/hit/damage và kết quả. Một lần nhận thưởng/vượt mốc/xuất hành có định danh và kết quả lưu, gửi lại lệnh không lặp tiêu hao/thưởng. Thay nhân vật hoặc mở tab khác không chuyển tiến trình sang hồ sơ khác. HN-Z05 đã chốt ở scene ngoại vi riêng; lựa chọn chia sẻ/credit không còn là lựa chọn giữ toàn tuyến farm trong sân môn phái.

Mất kết nối trong trận: dừng nhận input từ client đó; chính sách timeout/checkpoint phải được công bố. Đề xuất không công nhận chiến thắng mới do client tự báo khi offline; kết quả đã được máy chủ ghi trước mất mạng được phục hồi đúng. Kết nối lại hiển thị trạng thái đã lưu, không mặc định một lần thất bại/trừ chi phí nữa. Chiến đấu và offline chỉ được tích lũy theo thời gian máy chủ, không nhân theo số tab.

## 15. ART/VFX và nhịp trình bày

Giữ [bộ bàn giao hiện hành](design/vfx/STARTER-VFX-HANDOFF.md): nhân vật chibi, body tối đa 80 world px, world tham chiếu 960×640, sequence PNG 24 FPS; camera/viewport theo hợp đồng đã chọn. Không tăng cỡ nhân vật hoặc dùng ART Hóa Thần để tạo cảm giác mạnh ở map nhập môn.

Trong tuyến này cả ba dùng **R01 Kiếm Khí / Lôi Ấn / Ngự Phong Bộ** từ đầu. Asset R02–R05 có sẵn dành cho giai đoạn sau, không tự mở gameplay. Những clip đang gắn Vương Lâm/hướng đông cần kiểm kê trước khi dùng cho Tư Đồ Nam/Lý Mộ Uyển và các hướng khác; không báo bộ ba đã có đầy đủ animation.

Hồ sơ từng thuật cần đồng bộ: animation nhân vật → windup/cast → attack/projectile/trail phù hợp → cửa sổ hit host → impact tại điểm hit → recovery. Ghi frame event theo clip và chuyển sang thời gian mô phỏng; không tự đặt frame damage từ ảnh nhìn đẹp. Frame sequence không sở hữu damage, miễn nhiễm, vị trí hay arrival; render chậm không tạo hit thêm.

Telegraph và thân nhân vật luôn đọc được; glow không phải hitbox. Mục tiêu quái/tu sĩ/boss dùng impact theo hit, tránh phá bia đá ở mọi mục tiêu. Pháp khí, tín hiệu bình cảnh, SFX, icon, animation ba người và telegraph còn cần brief/kiểm kê riêng; không mở lại gói đã khóa hoặc tự nhận đủ ngân sách.

Hit-stop/camera shake nếu dùng là phản hồi tùy chọn theo hợp đồng host, không dừng combat clock của MMO. Tại khu chung cần giới hạn VFX người khác và giữ thông tin nguy hiểm của bản thân; ngân sách crowd/LOD phải đo ở prototype, chưa có con số đã duyệt.

## 16. Hoàn tất nhập môn và chuyển tiếp

Quyền xuất hành cần đồng thời: **HN01–HN11 đã hoàn thành + đoạn HN06 đúng nhân vật + mốc Ngưng Khí/hồi phục cuối nhập môn + kết quả HN10 hợp lệ**. HN07/08 là phần tuyến bắt buộc để đã trải nghiệm bình cảnh/pháp khí, không thêm yêu cầu ẩn. HN12 ghi hành động đi tiếp; cổng không chạy lại khảo nghiệm hoặc thưởng HN10.

| Nhân vật | Lời hứa sau Hằng Nhạc — đề xuất để biên tập |
| --- | --- |
| Vương Lâm | Theo cơ duyên và mối quan hệ đã mở, tìm nền công pháp/tri thức giúp chuẩn bị bước tiếp; lựa chọn vận dụng đầu tiên có tác dụng thật |
| Tư Đồ Nam | Tìm điều kiện phục hồi khả năng hiện diện/thi triển sâu hơn; từng phần năng lực đã biết trở lại khi có điều kiện |
| Lý Mộ Uyển | Tiếp cận tri thức/tài nguyên đan–trận và lựa chọn chuẩn bị riêng; tiếp tục tự chiến đấu trong tuyến của mình |

Tên map tiếp, biến cố xuất hành, công pháp/thuật đặc trưng và cơ chế Trúc Cơ cần GD11 cùng hồ sơ truyện. Rời map không tự đột phá hoặc cho ông Tư Đồ Nam “Trúc Cơ lần đầu”. Nếu bản thử chỉ có Hằng Nhạc, HN12 kết thúc bằng tổng kết/mục tiêu tương lai và giữ khu đã mở để luyện, không đưa vào map rỗng hoặc giả báo nội dung sau đã triển khai.

## 17. Chia lát để kiểm chứng

| Lát | Phạm vi đề xuất | Câu hỏi cần trả lời |
| --- | --- | --- |
| A — Nền nhập môn online | Chọn ba người, Z01–Z04 và một encounter ngoại vi; HN01–HN05, M01–M02 | Người mới hiểu thao tác/tu luyện không? Cả ba tự thắng trận đầu không? Hai tài khoản lưu riêng và thấy nhau không? |
| B1 — Ý nghĩa tu tiên | HN06–HN09; đoạn riêng, bình cảnh, pháp khí, lặp/idle có luật | Người chơi hiểu vì sao bị chặn, biết chuẩn bị và thấy bản sắc nhân vật không? |
| B2 — Hoàn tất Hằng Nhạc | HN10–HN12; khảo nghiệm, lưu kết quả, xuất hành | Khảo nghiệm hấp dẫn và công bằng không? Điều kiện xuất hành nhất quán không? |
| C — Phân hóa sau map | Hồ sơ tuyến Trúc Cơ đầu, ngoài đặc tả này | Khác biệt làm thay đổi hành động/lựa chọn thay vì chỉ màu/stat không? |

B1/B2 là cách chia việc trong lát B của GDD, không phải các arc mới. Đạt A không được báo hoàn tất map Ngưng Khí. Chưa khóa lịch, thời lượng hoặc số background sản xuất.

## 18. Nghiệm thu khi có prototype

| Tình huống | Kết quả cần thấy |
| --- | --- |
| Chọn từng người từ tài khoản mới | Cả ba vào được; lời dẫn đúng trạng thái; không chờ unlock nhân vật |
| Hai hồ sơ chọn cùng người | Thấy nhau ở khu chung, nhiệm vụ/cơ duyên/đồ được lưu riêng |
| Học chơi lần đầu | Cả ba có ba skill ngay khi điều khiển; HN03/04 dạy sử dụng, không cấp lại quyền; đọc được đòn và phân biệt tu vi với linh lực |
| Đủ tích lũy nhưng chưa qua HN07 | Bình cảnh nói rõ điều thiếu; chờ offline/giết quái không bỏ qua bài hiểu |
| Tư Đồ Nam tới mốc chung | Năng lực được phép dùng khớp nhập môn; UI không xóa cảnh giới/kiến thức nguyên tác |
| Lý Mộ Uyển chơi solo | Tự hoàn thành mọi nhiệm vụ bắt buộc; chuẩn bị có tác dụng, không cần người khác mang đi |
| Cạn linh lực/thiếu vật tư luyện | Có phương án tiếp tục/thử lại; không bị khóa vì thiếu đồ tutorial |
| HN10 chưa đạt | Hiểu nguyên nhân, về chuẩn bị và thử lại; không mất cảnh giới/pháp bảo |
| Mất mạng/gửi lại ở HN07/08/10/12 | Kết quả đúng hồ sơ; không nhân thưởng, chi phí hoặc thời gian |
| Đứng cạnh người qua HN10 trước mình | Không tự mở cổng/ghi hoàn tất tuyến của mình |
| Tới HN12 | Biết mục tiêu riêng tiếp theo; không tự có Trúc Cơ hoặc thuật R02–R05 |
| Xem lại/luyện lại | Không lặp thưởng độc hữu; điều đã hiểu và mốc hoàn tất giữ nguyên |

Đánh giá chơi thử cần quan sát người mới tìm được mục tiêu, dùng được các công cụ và giải thích vì sao chưa tiến triển. Theo dõi điểm bỏ cuộc, số lần thử lại, thời gian thực sự chơi/chờ và khả năng đọc trận trên viewport nhỏ. Ngưỡng chấp nhận/thời lượng chỉ khóa sau vòng thử, không lấy số test kỹ thuật làm bằng chứng game đã vui.

## 19. Việc cần chốt trước sản xuất

1. Biên tập lời dẫn/chương mở của từng người: nguồn nguyên tác, phần chuyển thể, trạng thái đầu và cách biểu hiện linh thể Tư Đồ Nam; không đưa quy ước chưa chốt vào canon.
2. Điền bảng tầng/ngưỡng Ngưng Khí và mốc hồi phục tương ứng; xác định mốc cuối nhập môn, tác dụng/chi phí và điều kiện HN07/10.
3. Hoàn thiện hồ sơ công pháp nền, cơ chế/counterplay của bộ R01 đã chốt, pháp khí luyện tập, vật tư và ba encounter; quyền học nhập môn không phải câu hỏi mở nữa.
4. Chọn bố cục walkable, danh tính NPC, cách chia phiên/credit ngoại vi và checkpoint; kiểm ngân sách từ ART có sẵn.
5. Chốt hồ sơ/tài khoản, idle khi đang khám phá, cap/sản lượng, hồi phục/thử lại, điều kiện lưu và UI trạng thái.
6. Duyệt phạm vi lát A, làm prototype khi được yêu cầu, chơi thử rồi cập nhật bản đặc tả; nối GD11 sau khi nền này được kiểm chứng.

GD01–GD05/GD09–GD10 hiện có bản thiết kế cơ sở để đối chiếu tại đây; chưa được đánh dấu hoàn thành triển khai. Các câu hỏi mở có người phụ trách/hồ sơ liên quan qua [backlog](MVP-BACKLOG.md). Tài liệu map/node, encounter và UX đời trước vẫn là tham chiếu lịch sử cho đến khi được biên tập theo tuyến mới này.
