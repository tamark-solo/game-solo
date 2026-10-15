# Hợp đồng thống nhất GDD 0.35

15/10/2026 · Bản thống nhất 1 · Phụ lục quy phạm của [GDD](GDD.md).

Owner yêu cầu thống nhất các mâu thuẫn trong review và làm rõ: bản chạy hiện tại chưa đưa vào test, có thể refactor/thay logic; tận dụng nhân vật, quái và boss đang có, chỉ bổ sung phần thiếu. Những quyết định dưới đây thay thế cách ghi khác nhau trong các tài liệu ngày 14–15/10. Đây là hợp đồng thiết kế để triển khai, chưa phải xác nhận các hệ thống đã chạy hoặc đã cân bằng.

GDD sở hữu định hướng; phụ lục này sở hữu điều kiện mở khóa, quy tắc kế thừa và thứ tự sự kiện. [Báo cáo chiều sâu](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md) giải thích hệ thống; [tiến trình](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) sở hữu nội dung; [Artwork–Logic](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md) sở hữu công việc sản xuất. Khi sửa một quyết định, cập nhật phụ lục và các bản tóm tắt liên quan trong cùng lượt.

## 1. Phạm vi và trạng thái

- Một tuyến chính, hai identity Huyễn Tâm `a` / Tịch Bạch `b`, bốn họ Kiếm/Phiên/Xa/Châu, năm đại cảnh giới, giữ mã `VG01–VG11`.
- Có thể thay logic runtime chưa phát hành; không phải duy trì hành vi tăng tầng tự động hoặc wire nhiệm vụ cũ chỉ vì G2 v1 đã kiểm qua. Thiết kế mới cần schema có phiên bản và kiểm chứng mới trước khi ghép.
- G2 v1/P2 là baseline lịch sử trên fixture. Giữ gói và evidence nguyên trạng để đối chiếu, không gắn kết quả 955 kiểm tra của v1 cho hệ thống 0.35. Các bản pin ART/approval lịch sử không được sửa lại để hợp thức hóa code/asset mới.
- Dùng lại body, gear, FX, NPC, quái và boss phù hợp trong thư viện hiện hành. ART còn candidate tiếp tục mang nhãn candidate; quyền refactor logic không tự cấp ART/motion/runtime approval. Không tự sửa owner map/navigation hoặc xóa/reset DB/save.

## 2. Điều kiện chung và thứ tự sự kiện

`Fact` ghi nhận sự kiện đã xảy ra; hoàn tất một hồi còn cần đủ điều kiện tu luyện và vật tư của hồi đó. Fact hạ Boss không tự cấp tầng hoặc tự bỏ qua Xung Mạch. Có thể ghi fact trước rồi hoàn tất khi đạt điều kiện, nhưng tiêu vật tư/trao thưởng chỉ một lần bằng transaction và khóa hoàn tất phía server.

Các Chu Thiên bên trong một tầng tự tiến khi đủ Tu vi. Đổi tầng/tiểu cảnh giới luôn cần Xung Mạch chủ động: đủ Chu Thiên, khẩu quyết, `qiPurity >= 0.75`, `pillToxicity <= 60`, và không vượt epoch. Các mốc 3/6/9/12/15 có thêm fact khảo nghiệm tương ứng. Cổ Cảnh 13–15 cần khẩu quyết Tư Đồ Nam và độ thuần ít nhất 95%. Mở bảng chuẩn bị không tự bắt đầu nghi thức.

### Bảng tuyến chính

Thời lượng là mục tiêu chơi chủ động của tuyến Cổ Cảnh/Thiên Đạo, chưa đo bằng playtest; nhánh đột phá sớm có ngân sách riêng cần đo. Các con số vật tư là mục tiêu fixture, chưa khóa balance.

| Hồi | Vùng cảnh giới | Điều kiện và thứ tự thống nhất | Kết quả chính | Giờ tối thiểu | Giờ tối đa |
| --- | --- | --- | --- | --- | --- |
| VG01 | Ngưng Khí 1–3 | Nhặt Châu, hoàn tất ba Chu Thiên tầng 1 → học Xung Mạch lên 2 → nhận Kiếm/tế luyện I +2 → luyện tầng 2, vượt sân tập/Trận Dẫn Khí, Xung Mạch lên 3 → hoàn tất ba Chu Thiên tầng 3 (tổng 9). | Kiếm ST, Châu ST, mở Ngoại Vi. | 2.5 | 4 |
| VG02 | Ngưng Khí 4–6 | Có khẩu quyết 4–6; chế Phiên I bằng 100 Du Hồn + 5 Yêu Hồn Lang Tuần Sơn; tế luyện Phiên I +4; hạ Lang Vương; đủ 18 Chu Thiên và Xung Mạch tầng 6. | Phiên ST, Kiếm/Phiên AOE, lệnh bài đen. | 6 | 10 |
| VG03 | Ngưng Khí 7–9 | Thức Hải Tư Đồ Nam, khẩu quyết 7–9, đủ 18 Chu Thiên; Công pháp Tiểu Thành, độ thuần >=85%; giải lệnh bài, Xung Mạch tầng 9. | Ba khuynh hướng, Nội Giới sơ khai. | 6 | 10 |
| VG04 | Ngưng Khí 10–12 | Khẩu quyết 10–12, đủ 27 Chu Thiên; Kiếm/Phiên I +7; chuẩn bị Phá Cấm Phù, hạ Tam Ấn rồi nhận/giải lõi Xa I; Xung Mạch tầng 12. Lần hạ đầu không đòi Xa chưa sở hữu. | Xa I, mở Rừng Cổ Mộc. | 10 | 15 |
| VG05 | Ngưng Khí 12–15 | Chung: cứu đoàn dược sư, gặp Lý Mộ Uyển, hạ Cổ Mộc và lấy Thanh Mộc Linh Tâm, luyện Trúc Cơ Đan. Tùy chọn Cổ Cảnh: khẩu quyết 13–15, độ thuần >=95%, thêm 27 Chu Thiên và Xung Mạch từng tầng đến 15. | Lò đan, Châu AOE; nhánh sớm được hoàn tất hồi tại tầng 12. | 10 | 16 |
| VG06 | Ngưng Khí 12 hoặc 15 → Trúc Cơ | Chung: ít nhất hai pháp bảo I +10, Công pháp Đại Thành, thắng Hắc Ấn, có Trúc Cơ Đan và epoch cho phép. Chọn phẩm chất theo mục 3; ba ấn ký Tinh Anh không phải điều kiện chung. | Trúc Cơ Sơ Kỳ, Quyết Minh Cốc; cả hai nhánh nhập lại VG07. | 6 | 10 |
| VG07 | Trúc Cơ Sơ Kỳ | Mở Nội Giới đầy đủ chức năng quản lý; đủ 9 Trọng; Phiên I +10 + 1.000 Tinh Hồn Trúc Cơ + hai chủ hồn quy định ở mục 4 → Phiên II. | Phiên II với hai chủ hồn; chưa cần hồn Chấp Sự. | 15 | 25 |
| VG08 | Trúc Cơ Trung Kỳ | Đủ 9 Trọng, Công pháp Viên Mãn, Kiếm I +10; vào Kiếm Mộ bằng pháp bảo đang có, thắng/trấn áp Hứa Lập Quốc rồi mới mở Kiếm II. | Kiếm II/Hứa Lập Quốc. | 20 | 30 |
| VG09 | Trúc Cơ Hậu Kỳ | Đủ 9 Trọng; Xa I +10 và khóa 1–3 đã mở; giải khóa 4–6 trước trận, mở Xa II rồi Hộ Đạo Đan Thất. | Thiên Ly Đan và Ngọc Giản Hộ Mệnh sau khi giữ lò thành công. | 20 | 30 |
| VG10 | Trúc Cơ Viên Mãn | Đủ 9 Trọng; gom Ngũ Hành từ các nguồn VG04–VG09, Nội Giới cấp 5 và Châu I +10 để mở Châu II trước trận; tế luyện bốn họ II +10, đánh chân thân Hắc Ấn. | Chủ hồn Chấp Sự Giả Đan bổ sung vị trí thứ ba cho Phiên II. | 15 | 20 |
| VG11 | Trúc Cơ → Kết Đan | Độ thuần 100%, Thiên Ly Đan, Tị Lôi Hộ Đạo Trận; hoàn thành ba pha Kiếp Lôi. Có phương án NPC/khí linh hộ pháp mặc định khi solo. | Kết Đan, mở Tu Ma Hải. | 10 | 15 |

Mỗi dải tầng bắt đầu từ trạng thái kết thúc hồi trước: không phát miễn phí tầng 4/7/10 hoặc tiểu cảnh giới mới. Mốc “đủ Chu Thiên của hồi” gồm luyện tầng cuối trước Boss; chuyển tầng vẫn chờ fact và lệnh Xung Mạch.

`meridianCycle` đếm số Chu Thiên đã hoàn tất bên trong tầng hiện tại (0–3/6/9). Đủ Chu Thiên tầng N mới được Xung Mạch N→N+1; tới tầng mới đặt cycle về 0. Các hồi kết ở tầng 3/6/9/12/15 viên mãn, nên 9/18/18/27/27 là tổng Chu Thiên đã luyện trong các dải, không phải số lần tăng tầng. Riêng gate vào tầng 3/6/9/12/15 phải có fact khảo nghiệm; sau đó luyện nốt Chu Thiên của tầng đích để hoàn tất hồi. Tuyến tầng 12 hoàn tất 72 Chu Thiên, tuyến tầng 15 là 99; ba Chu Thiên đầu từ giọt lộ thủy chỉ được tính một lần. Kết Đan có đúng bốn tiểu cảnh giới Sơ/Trung/Hậu/Viên Mãn; Giả Đan là trạng thái tiền đột phá của đối thủ hoặc Trúc Cơ, không là tiểu cảnh giới thứ năm của Kết Đan.

## 3. Hai đường Trúc Cơ và Bù Đắp Đạo Cơ

`VG05` có nhánh cốt truyện chung tại tầng 12 và nhánh Cổ Cảnh tùy chọn. Không cần tạo thêm mã hồi: ledger lưu `cultivationRoute = early_foundation | ancient_completion` và fact nhánh riêng; cả hai hoàn tất `VG06` khi đạt Trúc Cơ. Gặp Lý Mộ Uyển, Cổ Mộc và Trúc Cơ Đan cơ bản phải tiếp cận được ngay tầng 12, không đặt trong vùng yêu cầu tầng 13.

| Phẩm chất | Điều kiện bổ sung ngoài điều kiện chung VG06 | Bù đắp về sau |
| --- | --- | --- |
| Phàm Đạo | Từ tầng 12; Trúc Cơ Đan cơ bản; độ thuần >=75%, đan độc <=60. | Có thể nâng Địa/Thiên Đạo sau khi làm bù đắp. |
| Địa Đạo | Từ tầng 12; ít nhất hai Ấn Ký Tinh Anh khác loại trong bộ Lang/Tam/Cổ. | Bổ sung phần còn thiếu để lên Thiên Đạo. |
| Thiên Đạo | Tầng 15; độ thuần >=95%; đan thượng phẩm; đủ ba Ấn Ký Tinh Anh Lang/Tam/Cổ và thắng Hắc Ấn không chết. | Đạt trực tiếp, không phải đường duy nhất để sang VG07. |

Fact thắng Boss cốt truyện và Ấn Ký Tinh Anh của lần khảo nghiệm nâng cao là hai loại dữ liệu khác nhau. Tái dùng ART Boss cho khảo nghiệm nâng cao; không yêu cầu vẽ lại Boss. Khi đã lên Trúc Cơ, Bù Đắp Đạo Cơ dùng phần khảo nghiệm Cổ Cảnh còn thiếu trong Nội Giới + đan thượng phẩm + ba ấn ký + Hắc Ấn hoàn mỹ; không hạ nhân vật về Ngưng Khí và không sửa lịch sử lựa chọn nhánh. Cổ Cảnh ở đây là cơ chế chuyển thể của game, không gắn nhãn như sự kiện được Chương 33 chứng minh.

Sau biến cố Hằng Nhạc, khảo nghiệm Nội Giới tái hiện các Boss/nguồn chứng đạo cần cho bù đắp; Tống Thiết/Bạch Chỉ ở Quyết Minh Cốc giữ recipe và nguồn vật tư sơ cấp có thể kiếm lặp tại vùng mới. Không buộc người chơi quay vào map đã đóng để luyện nốt pháp bảo I. Tiến độ khảo nghiệm bù đắp lưu riêng, không cộng lại 27 Chu Thiên như EXP/cấp Ngưng Khí cho nhân vật đã Trúc Cơ.

## 4. Pháp bảo: sở hữu, nâng mốc và tế luyện

- **Phiên I:** 100 Du Hồn Sơ Cấp + 5 Yêu Hồn Lang Tuần Sơn; nguồn đều ở Ngoại Vi VG02. Recipe không cần Boss tương lai. +4 là mức chuẩn bị trong hợp đồng fixture, không phải lời khẳng định sức mạnh đã cân bằng.
- **Phiên II:** Phiên I +10 + 1.000 Tinh Hồn Trúc Cơ + một Chủ Hồn Lang Tuần Sơn + một Chủ Hồn Phù Sư Hắc Lụa ở biến thể khảo nghiệm Trúc Cơ tại Quyết Minh Cốc VG07. Hai nguồn mở khi bắt đầu VG07, dùng lại ART tinh anh. Hồn Chấp Sự ở VG10 là bổ sung thứ ba, không phải nguyên liệu mở mốc. Bỏ recipe 300 Du Hồn/3 Chủ Hồn cũ.

Ba cổng của Tam Môn Tụ Hồn là hình học/FX chiêu AOE, không đồng nghĩa phải có ba chủ hồn mới được cast. Phiên II ở VG07 đã dùng đầy đủ chiêu với hai chủ hồn và Du Hồn; thêm chủ hồn thứ ba ở VG10 bổ sung đặc tính, không mở lại chiêu từ đầu.
- **Kiếm II:** Kiếm I +10 rồi thắng/trấn áp Hứa Lập Quốc ở VG08; không dùng Kiếm II làm điều kiện đánh lần đầu.
- **Xa II:** Xa I +10, mở khóa 4–6 trước Hộ Đạo Đan Thất VG09. Chiến thắng giữ lò trao đan/tín vật; không trao lần đầu món bắt buộc dùng trong chính trận ấy.
- **Châu II:** Châu I +10, Nội Giới cấp 5 và đủ Ngũ Hành trước trận VG10. Mộc từ Cổ Mộc VG05, Thổ từ Tam Ấn VG04, Hỏa/Thủy từ Đan–Dược Quyết Minh VG07–VG09, Kim từ Kiếm Mộ VG08. VG07 mở chức năng Nội Giới, chưa tự cấp Mốc II cho Châu.
- **Nội Giới:** cấp 1–10 là trục riêng, không đồng nhất cấp Nội Giới với bậc tế luyện Châu. Sơ khai ở VG03, cấp 3 khả dụng VG05, cấp 4–6 từ VG07, cấp 5 trước VG10. Linh điền tối đa 6 ô: tối đa 5 ô mở bằng tiến trình, 1 ô bổ sung từ thẻ tháng; hết hạn vẫn thu hoạch cây đã trồng, không trồng lượt mới ở ô thêm.

### Kế thừa tế luyện

Lưu `refinementTotalRank` từ 0 đến 30, trần lần lượt 10/20/30 theo Mốc I/II/III. `refinementLocalRank = refinementTotalRank - 10 * (milestoneTier - 1)`, trong phạm vi 0–10 của mốc đang mở. Điều kiện nâng mốc là hoàn tất 10 bậc của mốc trước và thử thách riêng. Khi nâng mốc, giữ nguyên tổng bậc, bonus đã kiếm, khí linh và cổ ấn:

| Trước | Sau mở mốc | Sau hoàn tất tế luyện mốc mới |
| --- | --- | --- |
| Mốc I +10, tổng 10 | Mốc II +0, tổng 10 | Mốc II +10, tổng 20 |
| Mốc II +10, tổng 20 | Mốc III +0, tổng 20 | Mốc III +10, tổng 30 |

`+0` là chưa luyện bậc mới, không mất mười/hai mươi bậc đã tích lũy. UI phải hiển thị cả mốc và tổng bậc kế thừa. Bonus tế luyện tính từ tổng bậc, không áp lại bonus mốc cũ lần hai. Có đúng **3 ô cổ ấn** mỗi họ; điều kiện mở ô do tiến trình quy định, không có ô thứ tư trong 0.35.

Vật tư tế luyện đúng bậc và có nguồn trước cổng: Kiếm I dùng Huyền Thiết/Đá Mài Kiếm sơ cấp; Phiên I dùng Mảnh Hắc Phù/Mộc Linh Dịch; Xa I dùng Mảnh Khôi Lỗi/Giáp Ngọc Trùng; Châu I dùng Mộc Linh Dịch/Lộ Thủy. Hàn Thiết Tinh Kim, Huyết Văn Lụa, Âm Mộc và Thiên Lôi Thiết là vật tư Mốc II trở lên. Định lượng mỗi bậc chờ fixture balance; không dùng tên nguyên liệu Tier 2 để chặn Mốc I.

## 5. Công pháp và khẩu quyết

Khẩu quyết mở trần cảnh giới, còn Tàn Quyển nâng lĩnh ngộ Công pháp. Hai loại không thay thế nhau; bậc sách lĩnh ngộ không đồng nhất Tier cảnh giới. Mastery lưu riêng từng khuynh hướng; đổi Công pháp không sao chép cấp lĩnh ngộ cao nhất sang bộ chưa luyện.

| Mức lĩnh ngộ | Độ thuần thục mục tiêu fixture | Sách cần | Nguồn sớm nhất bắt buộc có |
| --- | --- | --- | --- |
| Sơ Khởi | 0 | Mở Công pháp | VG03, Tư Đồ Nam. |
| Tiểu Thành | 500 | 3 Quyển Thượng | VG03, Vấn Đạo 1–10/Tàng Kinh Các. |
| Đại Thành | 2.000 | 5 Quyển Trung | VG04, Vấn Đạo 11–20/ủy thác Nội Môn; trước đột phá VG06. |
| Viên Mãn | 5.000 | 8 Quyển Hạ | VG07, ủy thác Quyết Minh/Vấn Đạo Trúc Cơ; trước Boss VG08. |
| Hóa Cảnh | Theo thử thách | Chứng ngộ Độ Kiếp/Vấn Đạo | Kết Đan trở lên, không bán sách để bỏ qua chứng ngộ. |

Nguồn đảm bảo cho tuyến chính có thể hoàn thành solo trên server mới. Boss rơi thêm sách hoặc giao dịch là đường tăng tốc, không phải nguồn duy nhất trước cổng.

## 6. Độ thuần, đan độc và thất bại

`qiPurity` nằm trong 0.50–1.00; UI là 50–100%. Mức 120% chỉ còn dùng cho hiệu số Công pháp Hóa Cảnh, không dùng cho độ thuần. Đan thượng phẩm/Đan Văn theo fixture hiện tại vẫn +4 đan độc, không giảm độ thuần; không phải miễn đan độc. `pillToxicity > 60` khóa bắt đầu Xung Mạch, không tiêu vật tư rồi mới báo thiếu điều kiện.

Các mức +0.5–2% độ thuần/trận, +5%/giọt và -5 đan độc/giờ là số fixture cần đo. Chỉ nhận độ thuần từ encounter đúng bậc/độ khó do server xác nhận, một lần mỗi `encounterLifeId`; quái thấp hơn dải hợp lệ, đánh bù nhìn lại replay hoặc trận giả không cho điểm. Cấu hình bắt buộc có giới hạn gain theo kỳ. Giải độc theo mốc thời gian server, không nhân đôi bởi reconnect hoặc thời gian client.

Đột phá thành công khi đủ điều kiện và hoàn thành nghi thức/thử thách, không tung thêm xúc xắc thất bại sau khi đã vượt thử thách. Bỏ bonus “+20% tỷ lệ đột phá” cũ. Thất bại do bị ngắt nghi thức hoặc thua thử thách có hồi phục; số phạt 5 phút/10% Tu vi tầng hiện tại là fixture, không tụt cảnh giới, không mất cấp tế luyện/đồ. Thất bại kiểm điều kiện trước khi bắt đầu không gây phạt.

## 7. Epoch và Chân Khí Nén

Lịch ngày 1/3/6/8, tuần 2–5 và các tháng là lịch mục tiêu để mô phỏng, chưa phải lịch vận hành đã chốt. Trần gồm realm/tầng/Chu Thiên và cấu hình có phiên bản; trần Trúc Cơ áp dụng cho cả nhánh tầng 12 và tầng 15. Catch-up chỉ hoạt động dưới trần và không mở khẩu quyết, fact Boss hay mastery chưa đạt.

Pool nén là tài nguyên cá nhân có dung lượng và ngân sách chi mỗi epoch, không phải kho EXP để tự tăng nhiều tầng khi mở trần. Dùng cho tinh luyện độ thuần hoặc hỗ trợ luyện mastery/khí linh trong giới hạn; không thay thế sách, hồn độc bản, vật tư mở mốc hoặc thử thách. Mở trần không chuyển pool thành Tu vi cảnh giới. Tỷ lệ đổi, dung lượng và ngân sách chi phải cấu hình hữu hạn trước fixture đầy đủ; thiếu cấu hình thì không mở tính năng.

Khi pool đầy, server dừng cộng Tu vi nén và HUD báo rõ; người chơi vẫn nhận vật tư theo bảng rơi hợp lệ. Không hứa tích EXP vô hạn hoặc “không bao giờ mất Tu vi dư”. Không cộng một lượng Tu vi đồng thời vào tiến trình cảnh giới và pool.

## 8. Hợp thành, phân nhóm và khóa vật phẩm

Tám nhóm thống nhất: (1) Linh thảo/hạt giống, (2) Đan/Lộ thủy, (3) Khoáng/đá tế luyện, (4) Hồn phách/tinh huyết, (5) Phù/Trận/Cổ ấn/giải niêm, (6) Khẩu quyết/Tàn Quyển, (7) Trang bị sáu ô/phôi rèn, (8) Chứng đạo/nhân duyên. Vật phẩm không bắt buộc có công thức lên Tier.

Phép 5:1 chỉ áp dụng recipe cho phép cùng họ, không áp dụng toàn bộ inventory. Các recipe mẫu được dùng để kiểm: Huyền Thiết → Hàn Thiết; Du Hồn → Tinh Hồn. Cả hai cần Trúc Cơ, Nội Giới cấp 4 và recipe đã học; riêng khoáng cần nghề Khí tương ứng. Vật liệu cao cũng có nguồn trực tiếp ở Quyết Minh Cốc, không chỉ nhờ hợp thành. Chứng đạo Boss, chủ hồn có danh tính, tín vật nhân duyên, khẩu quyết và vật liệu giải niêm không tự hợp thành 5:1.

Đầu ra chế tác/hợp thành là **Khóa nếu có bất kỳ đầu vào Khóa**; chỉ Không Khóa khi mọi đầu vào đều Không Khóa và recipe cho phép giao dịch. Dùng Lộ Thủy cá nhân Khóa thì đầu ra Khóa. Tách lô trong túi, không gộp xóa dấu khóa. Nhiệm vụ ngày/tuần, quỹ thưởng và vật tư bảo đảm tuyến chính trao Khóa; loot thực địa/gather/dungeon có bảng nguồn riêng để rơi Không Khóa. Thưởng Huyết Lệnh không tự là hàng giao dịch chỉ vì mục tiêu ở ngoài bản đồ.

## 9. Chúc phúc và kinh tế cày–nạp

Tế luyện ngẫu nhiên phải có ngưỡng số lần thất bại hữu hạn `N` theo bậc, công bố trước khi tiêu vật tư. Sau mỗi thất bại, chúc phúc tăng và không giảm; đạt ngưỡng thì lần tiếp theo chắc chắn thành công. Bộ đếm gắn nhân vật/họ pháp bảo/bậc đích, không mất khi tháo/đổi món, đổi mốc giờ, reconnect hoặc hết hạn thẻ; chỉ reset khi bậc đích thành công. Không tụt cấp/vỡ đồ.

Bùa trả phí có thể tăng điểm chúc phúc hoặc giảm chi phí trong giới hạn công bố; không bán “giữ không rớt chúc phúc” vì điểm vốn không được rớt. Bùa cùng loại có nguồn Khóa miễn phí và giới hạn dùng chung. Khóa dòng tẩy luyện là tiện ích riêng, không thay hard pity. Chưa cấu hình `N` thì chưa mở tính năng tế luyện ngẫu nhiên, không coi câu “đầy thanh 100%” là đã có bảo đảm hữu hạn.

Trần cảnh giới không tự giới hạn chênh lệch đồ, Công pháp, cổ ấn, khí linh và nguồn tài nguyên. Giữ mô hình cày–nạp nhưng chỉ ghi là mục tiêu cân bằng; trước Phường Thị cần đo DPS/EHP/thời gian encounter của F2P và người mua trong cùng epoch. PvP chuẩn hóa có cấu hình riêng. Không khẳng định đã chống P2W hoặc đã đạt khoảng chênh an toàn khi chưa có số đo.

## 10. Quỹ thưởng tuần và solo

Quỹ chung được chuẩn hóa thành 100 đơn vị điểm thiết kế mỗi nhân vật/tuần; đây là đơn vị kế toán, không phải tiền giao dịch. Bốn nhánh PvE, thực địa, Tứ Nghệ và PvP đều có đường tự đạt đủ quỹ. Điểm cộng chung và chặn ở 100; không làm cả bốn để nhận bốn quỹ. Thưởng cốt lõi là rương chọn vật tư/sách hợp lệ và tiền Khóa cùng giá trị; thưởng bản sắc/danh hiệu có thể khác theo hoạt động.

Điểm theo từng hoạt động và thời gian đạt quỹ còn chờ fixture. Chỉ ghi điểm từ kết quả server xác nhận; đăng bán/chuyển đồ/mua lại sản phẩm không tự sinh điểm chế tác. Các nguồn bắt buộc để đạt quỹ có phương án solo; PvP là lựa chọn. Mốc cốt truyện/chứng đạo vẫn phải hoàn thành, không dùng quỹ để bỏ qua Boss.

`VG11` cung cấp hộ pháp NPC/khí linh mặc định khi người chơi chọn solo, không khóa sau hảo cảm hoặc yêu cầu thuê người thật. Có thể thay bằng 1–2 đạo hữu; tổng tối đa ba người tính cả người đột phá. Khác biệt đội hình được scale bằng logic encounter, không đòi bộ ART nhân vật khác để hoàn tất cốt truyện.

## 11. Thời lượng và điều kiện nghiệm thu tiếp theo

Tổng bảng mục 2: **Chặng 1 tuyến Cổ Cảnh 40.5–65 giờ** (cách gọi rút gọn khoảng 40–65 giờ), **Chặng 2 80–120 giờ**. Cụm VG04–VG06 là 26–41 giờ. Không cộng thời gian chờ epoch/offline vào giờ chơi chủ động, không tính trùng hoạt động đồng thời với chu kỳ Nội Giới. Ghi riêng giờ chủ động, online thụ động, offline và ngày lịch. Kết Đan 150–250 giờ/Nguyên Anh–Hóa Thần 300+ giờ là dự toán dài hạn chưa phân rã.

Trước khi khóa pacing: có bảng EXP/chi phí/drop; đo đường tầng 12 và tầng 15; mô phỏng người chơi 30 phút/ngày, 2 giờ/ngày, cày nhiều và vào muộn; đo lặp encounter/nguồn thiếu và điểm quỹ tuần. Các mức sát thương, thưởng, tốc độ, mastery, chi phí và ưu thế nạp trong các báo cáo đều là fixture hoặc dự toán cho tới khi có biên bản balance riêng.

## 12. Tái sử dụng ART và backlog bổ sung

| Nhóm | Tận dụng hiện có | Chỉ bổ sung khi thiếu |
| --- | --- | --- |
| Huyễn Tâm/Tịch Bạch | V5 identity, pilot V1 đã duyệt, V2 512 body clip/512 gear track và 40 FX sequence review-ready. | Mốc I/III còn thiếu, combo khi đến chặng; có thể dùng lại body nếu identity/outfit phù hợp, gear/FX phải trình bày đúng mốc. Không gen lại đủ 512 clip chỉ để đổi thông số. |
| NPC Vân Hải | Bốn station, sáu NPC Wave A và các gói motion tám hướng hiện hành; phân lại vai trò/công thức bằng dữ liệu. | Bốn NPC Wave B và chức năng/pose còn thiếu; Tư Đồ Nam tàn hồn/Lý Mộ Uyển dùng thư viện hiện hành làm cơ sở nếu phù hợp, không phục hồi bộ ART đã loại. |
| Quái/tinh anh | 11 identity Pixel01, 440 clip và VFX02; dùng lại theo encounter/độ khó/nguồn rơi. | Hành vi, cảnh báo hoặc FX thật sự thiếu; không sinh lại cả loài cho biến thể Trúc Cơ. |
| Lang Vương | Neutral/Motion01/VFX đã duyệt đúng hash. | AI, phối hợp cụm, encounter và thông số; không sửa bộ đã duyệt vì đổi cấp. |
| Hắc Ấn | Neutral03 và VFX02 đã duyệt; Motion01 72 clip vẫn candidate/chờ duyệt. | Ghép/tổ hợp nhịp cho phân thân và chân thân bằng kit phù hợp; chỉ thêm pha chưa có ART, không gọi Motion01 đã duyệt. |
| Tam Ấn/Cổ Mộc | Concept Boss02 và các nguồn hiện hành; ưu tiên reuse phần đã đạt. | Duyệt neutral, motion/FX còn thiếu và prototype cơ chế. Không xem concept là đã có bộ tám hướng. |
| Chặng 2 | Quái/tinh anh/Hắc Ấn hiện có, map/prop từ thư viện được phép dùng. | Hứa Lập Quốc Boss, props/không gian mới và pose đặc thù chưa có; không nhân bản bộ ART chỉ vì thay tên encounter. |

Tái dùng source/atlas nguyên byte; nếu cần sửa hình đã pin thì tạo revision mới. Phân biệt trạng thái `available`, `candidate`, `approved`, `integrated`; chỉ ghép phát hành khi đúng gate. Quyền làm lại logic hiện tại không thay quyền ART hoặc quyền ghi owner map/DB.

## 13. Kiểm tra đồng bộ tài liệu

Chạy `node scripts/verify-gdd-035-docs.mjs` từ workspace. Bộ kiểm chỉ đọc: so bảng 11 hồi với các bản tóm tắt, cộng ngân sách, kiểm liên kết/anchor và phát hiện các điều kiện/schema cũ đã bị thay. Lệnh không chạy builder, không ghi evidence, map hoặc DB; kết quả không chứng minh reachability trong engine, hoàn thành encounter, đủ ART hoặc balance.

Kiểm thử gameplay tiếp theo phải thực thi cả nhánh tầng 12/tầng 15, nguồn vật tư trước cổng, chuỗi mở pháp bảo và các trường hợp reconnect/tiêu–trao một lần trên fixture 0.35 mới. Không thay tên kết quả G2 v1 thành kiểm chứng cho những cơ chế đó.
