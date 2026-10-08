# Tiến trình tu luyện và phần thưởng Hằng Nhạc

**Phiên bản:** 0.2 · **Ngày:** 08/10/2026 · **Trạng thái:** đề xuất thiết kế/số liệu để đánh giá; chưa triển khai hoặc khóa cân bằng.

**Tham chiếu:** [GDD 0.28](GDD.md), [trải nghiệm Hằng Nhạc](HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md), [hệ thống tu tiên](CULTIVATION-SYSTEM.md), [nhân vật](CHARACTERS.md), [backlog](MVP-BACKLOG.md).

## 1. Quyết định nền và phần đề xuất mới

Đã chốt: chọn một trong ba nhân vật từ đầu; trải nghiệm Hằng Nhạc qua Ngưng Khí; có sẵn Kiếm Khí/Lôi Ấn/Ngự Phong Bộ R01; phân hóa sâu sau nhập môn. Tài liệu này đề xuất cách tích lũy, tiến tầng, phần thưởng, chuẩn bị và điều kiện rời map để vòng chơi có nhịp rõ.

| Nội dung | Căn cứ / trạng thái |
| --- | --- |
| Ngưng Khí có 15 tầng | Có nguồn nguyên tác: [chương 17](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17) |
| Phương pháp đầu của Vương Lâm gồm tầng 1–3; tiếp cận phương pháp cao hơn là vấn đề riêng | Nền từ [chương 17](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17); [chương 33](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-33) có việc trao đổi phương pháp tầng 4–9 |
| Map Hằng Nhạc của game bao phủ tới mốc tương ứng tầng 15 | Đề xuất phạm vi chuyển thể để nối tới chuẩn bị Trúc Cơ, chưa được duyệt chi tiết |
| Bốn mốc M01/M02/M03/M04 tương ứng 1/3/9/15 | Phân bổ gameplay đề xuất, không phải bốn tầng hoặc phân kỳ canon |
| Tu vi, stat, sản lượng, vật tư và chi phí dưới đây | Giá trị thử v0.1; không phải số liệu nguyên tác hoặc runtime hiện có |

Không kể Vương Lâm đi hết 15 tầng trong một chuỗi nhiệm vụ môn phái giống HN01–HN12 ở nguyên tác. Không thay lịch sử cảnh giới Tư Đồ Nam bằng 15 tầng Ngưng Khí. Lý Mộ Uyển dùng mốc nhập môn chuyển thể; nguồn từng đoạn truyện phải biên tập riêng. Chỉ hai dòng có dẫn nguồn đầu bảng là dữ kiện nguồn, các luật game còn lại là đề xuất.

## 2. Nhân vật tiến bộ bằng gì?

**Làm nhiệm vụ/chuẩn bị → tích lũy hoặc luyện vận hành → đọc điều kiện còn thiếu → chủ động qua mốc → vận dụng ổn định → chuẩn bị mục tiêu tiếp.**

Tăng trưởng có ba kết quả: năng lực nền ổn định hơn, hiểu và vận hành được phương pháp tiếp theo, có thêm công cụ chuẩn bị. Không cấp một skill mới ở mỗi tầng hoặc mỗi nhiệm vụ. Bộ R01 giữ quyền từ đầu; gặp bình cảnh không thu hồi bộ này.

Tu vi là giá trị tích lũy dài hạn; linh lực là nguồn dùng trong trận. Lĩnh ngộ và hiểu công pháp là kết quả nội dung/kiểm chứng, không hai thanh EXP phụ. Pháp khí nhận được cần luyện hóa; đồ truyện và quyền xuất hành không quy đổi thành tu vi.

## 3. Bốn chặng và mốc từng nhân vật

| Chặng / mốc | Vương Lâm / mốc gameplay Lý Mộ Uyển | Tư Đồ Nam — nhãn hồi phục đề xuất | Tuyến liên quan |
| --- | --- | --- | --- |
| Chuẩn bị, chưa đạt M01 | Chưa xác nhận tầng đầu trong tuyến chơi | Biểu hiện linh thể còn giới hạn; vẫn dùng được preset nhập môn | HN01–HN02 |
| Cảm nhận — M01 | Tầng 1; hiểu tích lũy khác nguồn lực combat | Hồi phục I: vận hành nền hiện dùng được | Hoàn thành HN02 |
| Vận dụng — M02 | Tầng 3 và tự vượt trận nhỏ | Hồi phục II: hiện diện/thi triển nền ổn định hơn | Hoàn thành HN05 và đạt ngưỡng tương ứng |
| Thông suốt — M03 | Tầng 9, đã giải bình cảnh đầu và hiểu pháp khí | Hồi phục III: vận dụng ổn định, tiếp cận bước hồi phục tiếp | Hoàn thành HN09; HN07/HN08 đã xong |
| Hoàn tất — M04 | Tầng 15 và vượt khảo nghiệm nhập môn | Hồi phục IV: hoàn tất mức năng lực nhập môn của chế độ | Hoàn thành HN10 tại ngưỡng cuối |

Với Tư Đồ Nam, 15 ngưỡng thử bên dưới là mức **tiến triển hồi phục** dùng để phân bổ độ dài/nội dung; UI chỉ ưu tiên bốn nhãn hồi phục và điều kiện tiếp. Không ghi “Ngưng Khí tầng 15” là cảnh giới truyện của ông hoặc tạo tỉ lệ quy đổi sức mạnh canon. Kiến thức vốn có được giữ, khả năng hiện dùng được theo giới hạn gameplay.

Tầng đạt được và mốc trải nghiệm là hai trạng thái: có thể tích lũy tới tầng 3 nhưng chưa qua HN05, khi đó chưa nhận M02. Khi ngưỡng và nhiệm vụ cùng đủ, chỉ ghi nhận một lần. Đặc tả Hằng Nhạc cần đặt M03 ở HN09 thay vì HN08 theo phân bổ mới này.

## 4. Bảng tu vi thử nghiệm

Giá trị dưới đây là **tu vi tích lũy cộng dồn từ đầu hồ sơ nhập môn**, không phải số cần trả mỗi lần lên tầng. Không tiêu/xóa tu vi khi xác nhận tiến tầng. Tư Đồ Nam dùng cùng ngân sách số để thử nội dung, nhưng gọi là tiến triển hồi phục.

| Tầng / ngưỡng nội bộ | Tích lũy cần đạt | Chênh lệch từ ngưỡng trước | Điều kiện thêm |
| --- | --- | --- | --- |
| 1 | 100 | 100 | Hoàn thành lần vận hành HN02 |
| 2 | 220 | 120 | Đã hiểu nền 1–3, chủ động xác nhận tiến tầng |
| 3 | 360 | 140 | Nền 1–3; M02 còn cần HN05 |
| 4 | 520 | 160 | HN06/HN07 đã xong, mở vận hành 4–9 |
| 5 | 700 | 180 | Nền 4–9 và xác nhận tiến tầng |
| 6 | 900 | 200 | Nền 4–9 và xác nhận tiến tầng |
| 7 | 1.120 | 220 | Nền 4–9 và xác nhận tiến tầng |
| 8 | 1.360 | 240 | Nền 4–9 và xác nhận tiến tầng |
| 9 | 1.620 | 260 | Nền 4–9; M03 còn cần HN08/HN09 |
| 10 | 1.900 | 280 | HN09 đã xong, mở vận hành 10–15 |
| 11 | 2.200 | 300 | Nền 10–15 và xác nhận tiến tầng |
| 12 | 2.520 | 320 | Nền 10–15 và xác nhận tiến tầng |
| 13 | 2.860 | 340 | Nền 10–15 và xác nhận tiến tầng |
| 14 | 3.220 | 360 | Nền 10–15 và xác nhận tiến tầng |
| 15 | 3.600 | 380 | Nền 10–15; M04 còn cần HN10 |

Công thức dùng để kiểm bảng: ngưỡng tầng L = **10 × L × (L + 9)**, chênh lệch = **100 + 20 × (L − 1)**. Công thức chỉ tạo đường thử dễ điều chỉnh, không là quy tắc tu tiên của mọi cảnh giới.

Ở tầng nhỏ, xác nhận tiến triển không là một trận/thiên kiếp mới mỗi lần; có thể xác nhận nhiều ngưỡng đã đủ trong một luồng rõ ràng. Tới cổng 3→4 và 9→10 vẫn phải làm nội dung tương ứng. Không tự lên tầng khi offline, không biến một thanh đầy thành đột phá Trúc Cơ. Ở đây chưa có RNG thất bại, mất tu vi hay tiêu vật phẩm ở bước xác nhận tầng nhỏ.

## 5. Ba bước hiểu công pháp nền

Tên làm việc **“pháp môn vận khí nhập môn”** chỉ là nội dung game, chưa là tên công pháp canon chung của bộ ba. Tư Đồ Nam dùng diễn giải ổn định/khôi phục khả năng vận hành đã biết; không đọc lại sách như chưa biết tu luyện.

| Bước | Quyền tiếp cận / bài học | Tác dụng trong map | Không làm |
| --- | --- | --- | --- |
| Nền 1–3 | HN02, vận hành đầu | Mở thổ nạp/hoạt động hồi phục nền; tiếp cận ngưỡng 1–3 | Không cấp lại bộ skill có từ đầu |
| Nền 4–9 | HN07, sau HN06 và ngưỡng 3 | Biết giải giới hạn vận hành, mở tiến triển qua cổng đầu | Không tặng lĩnh ngộ Đạo/ý cảnh hoặc bonus nhân vật độc quyền |
| Nền 10–15 | HN09, sau nền 4–9, pháp khí và ngưỡng 9 | Kiểm chứng phối hợp, tiếp cận đoạn cuối nhập môn | Không tự tặng công pháp Trúc Cơ hoặc R02 |

Các “nền” là mức hiểu/phạm vi vận hành trong một hồ sơ nhập môn, không ba công pháp trang bị cộng dồn bonus. Phân bổ HN07/HN09 là chuyển thể gameplay; việc trao đổi phương pháp của Vương Lâm trong chương 33 chỉ là căn cứ cho ý nghĩa quyền tiếp cận, không biến NPC/cơ duyên đó thành lịch sử chung cả ba.

## 6. Nguồn tu vi và nguyên tắc chọn hoạt động

| Nguồn | Giá trị thử | Luật ghi nhận |
| --- | --- | --- |
| HN01–HN12 | Tổng 1.380 tu vi theo mục 7 | Một lần/hồ sơ; HN02 gồm thành quả bài vận hành đầu, không tính thêm chu kỳ nền của bài đó |
| Bốn mục tiêu luyện/khám phá tùy chọn | 300/mục tiêu, tối đa 1.200 từ bốn nội dung | Mỗi mục tiêu thưởng một lần; không phải daily hoặc điều kiện xuất hành |
| Thổ nạp / hoạt động hồi phục đã chọn | 120/phút, ghi theo thời gian server hợp lệ | Cùng tốc độ khi online/offline; dừng tích lũy nền tại cổng hiện tại |
| Replay nhiệm vụ/truyện | 0 tu vi | Xem lại, không nhận thưởng tiến trình lần nữa |
| Giết lại mục tiêu hoặc farm combat thông thường | 0 tu vi trực tiếp trong baseline này | Vật tư lặp có hồ sơ riêng; không farm số kill để lĩnh ngộ |

Chọn active qua nội dung tùy chọn giảm phần phải chờ tích lũy. Người không chọn vẫn hoàn thành tuyến bằng nhiệm vụ bắt buộc + thổ nạp; không cần tìm nhóm, làm daily hoặc mua boost. Không coi thao tác bấm liên tục là nhân tốc độ tu luyện.

Đề xuất một hoạt động nền đang chọn cho mỗi hồ sơ. Nền vận hành có thể tiếp tục khi đi lại/tương tác ở khu an toàn đã mở, được mô tả là luyện vận hành trong sinh hoạt; không vẽ nhân vật đang ngồi thiền ở hai nơi. Nền **tạm dừng** trong combat/khảo nghiệm/bài vận hành tương tác, khi bị hạ hoặc thiếu quyền nền tiếp. Ra khỏi trạng thái đó tự tiếp tục hoạt động đã chọn nếu vẫn hợp lệ; UI ghi rõ đang chạy/tạm dừng/chạm cổng. Đây là lựa chọn thiết kế mới cho GD08, cần đánh giá trước runtime.

Không tốn vật tư bắt buộc cho thổ nạp cơ bản. Nguyên liệu quý/đan tăng tốc chưa đưa vào baseline; không tạo deadlock vì hết nguyên liệu tu luyện. Thay tab, bật nhiều cửa sổ hoặc đồng thời chọn hai hoạt động không tăng tốc hay nhận cả hai sản lượng.

## 7. Phần thưởng nhiệm vụ HN01–HN12

Tu vi và vật tư là số thử. Mốc, quyền tiếp cận và kết luận hiểu biết là trạng thái riêng, không quy đổi thành tiền tệ. Phần thưởng áp theo hồ sơ, ba người dùng cùng ngân sách đầu nhưng có lời dẫn/nhãn phù hợp.

| ID | Tu vi một lần | Vật tư / vật phẩm đề xuất | Thành quả có ý nghĩa |
| --- | --- | --- | --- |
| HN01 | 0 | 2 vật tư hồi phục thường | Nhật ký và mục tiêu đầu; ba skill vốn có không cấp lại |
| HN02 | 100 | Không cần nguyên liệu để tiếp tục nền | Hiểu vận hành 1–3; đạt M01 sau xác nhận ngưỡng |
| HN03 | 80 | Không thêm skill | Hiểu định hướng Kiếm, chọn mục tiêu Lôi, hit/miss |
| HN04 | 80 | Không thêm skill | Dùng Phong và đi bộ theo báo đòn/va chạm |
| HN05 | 100 | 3 nguyên liệu luyện hóa nhiệm vụ + 2 vật tư hồi phục | Trận đầu; M02 khi ngưỡng 3 đủ |
| HN06 | 120 | 3 nguyên liệu luyện hóa nhiệm vụ | Kết luận/đoạn cá nhân tương ứng WL/TDN/LMW |
| HN07 | 240 | Hồ sơ hiểu/vận hành 4–9 | Giải bình cảnh đầu; mở cổng, không nâng skill hoặc xóa lịch sử nhân vật |
| HN08 | 300 | 1 pháp khí luyện tập đã luyện hóa + 2 vật tư hồi phục | Hiểu sở hữu khác vận dụng; dùng pháp khí trong bài thử |
| HN09 | 360 | 2 vật tư hồi phục | Hiểu/vận hành 10–15; M03 sau đủ ngưỡng 9 và bài tích hợp |
| HN10 | 0 | Ghi kết quả khảo nghiệm và quyền hoàn tất | M04 tại ngưỡng 15; không cần tu vi từ boss này mới đủ vào trận |
| HN11 | 0 | Nhật ký/mục tiêu cá nhân tiếp theo | Ghi hoàn tất nhập môn và điều cần chuẩn bị sau map |
| HN12 | 0 | Quyền xuất hành | Lưu đi tiếp một lần; không cấp Trúc Cơ/R02 |

Kiểm ngân sách: HN02–HN05 = **360**; toàn tuyến = **1.380 tu vi, 8 vật tư hồi phục, 6 nguyên liệu luyện hóa, 1 pháp khí**. HN08 dùng 4 nguyên liệu trong số 6 đã nhận, nên còn 2; nguyên liệu còn lại không tự là tiền giao dịch hoặc buff chiến đấu.

HN08 giới thiệu phôi/vật cần nhận biết trước bước luyện hóa, nhưng bảng chỉ tính pháp khí sử dụng được **sau khi nhiệm vụ xong**. Một hồ sơ không nhận cả phôi có thể bán lẫn một pháp khí thưởng mới để nhân vật phẩm. Các bước nhận–tiêu hao–hoàn thành phải có ledger/trạng thái nhất quán khi thiết kế kỹ thuật.

Mốc truyện riêng, kết luận hiểu biết, pháp khí và quyền xuất hành không tái cấp khi replay. Tài nguyên nhiệm vụ cần cho HN08 bị ràng buộc nhiệm vụ, không bán/tiêu ở công thức khác trước khi hoàn thành; thử lại không xóa nguồn nguyên liệu bắt buộc.

## 8. Nội dung tùy chọn để chủ động tiến triển

Các mã HN-O01…O04 là nội dung phụ đề xuất, chưa nằm trong tuyến bắt buộc hoặc ngân sách ART được duyệt. Dùng lại mẫu AI/sân/vùng đã mở; không thêm bốn boss hay bốn map chỉ để nhận thưởng.

| ID | Mở sau | Mục tiêu vận dụng/khám phá | Thưởng tu vi một lần |
| --- | --- | --- | --- |
| HN-O01 | HN05 | Bài định hướng với mục tiêu di chuyển, thắng theo cách hợp lệ | 300 |
| HN-O02 | HN06 | Bài đường né có báo đòn, đi bộ/Phong đều có cách vượt | 300 |
| HN-O03 | HN08 | Tìm tài nguyên được phép tại tuyến đã mở, biết lý do và chuẩn bị phù hợp | 300 |
| HN-O04 | HN09 | Thử encounter phối hợp áp sát/thi triển để chuẩn bị khảo nghiệm cuối | 300 |

Các mục tiêu phụ không cần đạt điểm hoàn hảo, không yêu cầu actor/class riêng hoặc loot ngẫu nhiên để hoàn thành. Thưởng có cùng giá trị cho ba người; tên/lời dẫn có thể phù hợp nhân vật. Chơi lại cho luyện tập, không cộng thêm 300 mỗi lần.

Lát A có thể chỉ gồm O01 hoặc không có nội dung phụ; nghiệm thu không gọi đó là đã hoàn tất cả map. Nếu nội dung phụ chưa được triển khai, tuyến bắt buộc + nguồn nền vẫn đủ đạt ngưỡng, UI không dẫn tới hoạt động chưa có.

## 9. Cổng bình cảnh và tu vi thưởng dư

| Cổng | Dữ liệu tích lũy | Nội dung/điều kiện chủ động | Kết quả |
| --- | --- | --- | --- |
| Chuẩn bị → tầng 1 | 100 | HN02, xem nguồn lực và xác nhận | Mở trạng thái tiến triển đầu; bộ R01 giữ nguyên |
| 3 → 4 | Tới ngưỡng 3 và đủ ngưỡng tiếp khi xác nhận tầng 4 | HN05/HN06/HN07; bài hiểu/vận dụng phù hợp nhân vật | Mở nền 4–9; không bắt farm lĩnh ngộ |
| 9 → 10 | Tới ngưỡng 9 và đủ ngưỡng tiếp khi xác nhận tầng 10 | HN08, bài tích hợp HN09 | Mở nền 10–15; không cấp R02 |
| Ngưỡng 15 → hoàn tất map | 3.600 | HN10 hợp lệ, HN11, chủ động xuất hành HN12 | Hoàn tất nhập môn; mục tiêu chuẩn bị bước sau |

**Cổng tích lũy nền** hiện hành: 360 trước HN07; 1.620 sau HN07/trước HN09; 3.600 sau HN09. Tới cổng, thổ nạp dừng ở đúng phần còn thiếu, không tiêu nguyên liệu/thời gian để rồi bỏ sản lượng. Chưa xác nhận tầng nhỏ không tự chặn tích lũy tới cổng đã mở, nhưng quyền/stat chỉ theo tầng/mốc đã xác nhận.

Thưởng nhiệm vụ/nội dung phụ vẫn được ghi đủ dù vượt cổng hiện tại. Phần vượt là **tu vi đã tích lũy chưa được vận dụng qua cổng**, giữ trong cùng giá trị tu vi, không tạo thêm tiền tệ/thanh EXP. Ví dụ: tuyến chính tới HN05 có 360; HN06 thêm 120 → hiển thị 480 so với cổng 360 và điều kiện HN07. Không tự lên tầng 4; HN07 xong mới mở nền tiếp. Sau đó nhận thêm 240, tổng 720 có thể xác nhận ngưỡng 4/5, chưa đủ tầng 6.

Không ghi thưởng thành mất trắng vì người chơi hoàn thành bài phụ sớm hoặc muộn. Idle vẫn dừng khi giá trị hiện có đã bằng/vượt cổng. Tổng thưởng nội dung một lần là 2.580; nếu đã thổ nạp tới 3.600 rồi mới hoàn thành O04, vẫn nhận đủ 300, tổng tu vi 3.900 nhưng quyền vận dụng/stat trong map dừng ở ngưỡng 15. UI nêu phần dư chưa mở vận dụng; không tự cấp Trúc Cơ, tự đổi tiền hoặc dùng phần dư bỏ qua điều kiện chương sau. Cách vận dụng phần dư sau map phải được hồ sơ Trúc Cơ xác định trước triển khai tuyến đó.

## 10. Pháp khí luyện tập và vật tư hồi phục

Tên làm việc **“Ngọc hộ thân luyện tập”** là sáng tạo gameplay, chưa là pháp bảo canon của ba người. Nhận biết → đủ 4 nguyên liệu nhiệm vụ → luyện hóa có tương tác → thử tác dụng → ghi HN08. Chi phí 4 nguyên liệu chỉ trừ một lần ở bước luyện hóa được máy chủ chấp nhận; không RNG hỏng đồ. Nếu mất mạng, phục hồi bước đã ghi, không trừ lại.

| Thành phần | Giá trị/luật thử v0.1 | Tác dụng học chơi |
| --- | --- | --- |
| Pháp khí hộ thân | 15 linh lực, cooldown 12 giây; chủ động mở cửa sổ 1 giây | Chuẩn bị/chọn thời điểm thay vì thêm skill damage |
| Tác dụng | Giảm 50% damage của **một hit** hợp lệ trong cửa sổ, sau đó hết; không chặn toàn bộ chuỗi | Có ích khi đòn né chưa sẵn sàng; không thay đi bộ/Phong |
| Không bị đánh trong cửa sổ | Không nhận hoàn linh lực; tác dụng hết khi hết cửa sổ | Có đánh đổi, không bật miễn phí để giữ mãi |
| Vật tư hồi phục thường | Hồi 30 HP ngoài combat, không vượt HP tối đa; cooldown dùng 10 giây | Chuẩn bị trước encounter, không cần class hồi máu |
| Điểm chuẩn bị thử luyện | Hồi đầy HP/linh lực và cấp vật tư phiên cần cho bài nếu có | Thiếu vật tư túi không khóa đường thử lại |

Giảm damage chỉ ảnh hưởng hit incoming sau khi host nhận kích hoạt; không chữa lại damage đã ghi. Hiệu ứng hộ thân không tạo bất tử, reflect, shield pool thứ hai hoặc immunity. Buff kết thúc khi người chơi bị hạ/rời phiên. Slot toàn game và hoạt ảnh pháp khí còn cần hồ sơ; đây là một công cụ học chơi, không mở cả hệ cường hóa.

Đồ cấp theo phiên thử không mang ra ngoài, không bán/gộp vào kho để farm. Vật tư hồi phục thường từ nhiệm vụ thuộc hồ sơ và dùng được ngoài combat; Lý Mộ Uyển không có hệ số hồi cao hơn ở baseline chung. Bị hạ trong bài nhập môn trở về chuẩn bị, không mất tu vi/cảnh giới/pháp khí; hồi tại đó không tiêu vật tư nhiệm vụ.

## 11. Tăng trưởng năng lực vừa đủ

Baseline gameplay ban đầu HP 100/linh lực 100/sức mạnh 10 giữ cho lát A trước mốc tăng trưởng. Đề xuất chỉ có bước stat nhỏ tại mốc đã xác nhận, không tăng mọi nhiệm vụ/tầng; cả ba dùng cùng bảng trong map đầu.

| Mốc xác nhận | HP tối đa | Linh lực tối đa | Sức mạnh tấn công | Điều khác |
| --- | --- | --- | --- | --- |
| Ban đầu / M01 | 100 | 100 | 10 | Ba skill R01 vốn có |
| M02 | 110 | 105 | 11 | Vận dụng ổn định trong trận đầu |
| M03 | 120 | 110 | 12 | Đã hiểu nền 10–15 và biết pháp khí |
| M04 | 130 | 115 | 13 | Sau khảo nghiệm; để tiếp tục hành trình, không làm điều kiện thắng HN10 |

Stat M03 áp vào HN10; stat M04 chỉ nhận sau kết quả thắng. Không yêu cầu cần buff M04 mới đánh thắng chính trận mở M04. HP/linh lực tối đa tăng không tự hồi đầy trong combat; giá trị hiện tại giữ nguyên tới khi hồi hợp lệ. Tốc độ, cự ly, cooldown, số hit và coefficient R01 giữ theo hồ sơ gameplay thử, không phóng VFX hoặc cho thêm hit theo tầng.

Stat là đề xuất để đo cảm giác tiến bộ, không lời hứa cân bằng PvP. Ngọc hộ thân/hiểu vận hành và lựa chọn chuẩn bị tạo thành quả bên cạnh stat. Nếu stat che mất bài học né/định hướng, phải điều chỉnh bảng hoặc encounter sau chơi thử.

## 12. Idle, offline và nhịp chờ

Đề xuất cap offline thử nhập môn là **30 phút thời gian hoạt động hợp lệ mỗi lần vắng mặt**. Cap này không chốt cho game đầy đủ và không kế thừa 8 giờ thiết kế cũ. Thời gian hợp lệ còn bị giới hạn bởi cổng tu vi, hoạt động đã chọn và trạng thái trước khi rời game.

Offline chỉ tích lũy nền đã chọn trước đó. Rời game trong bài tương tác/combat không tự chuyển sang thổ nạp để lấy thưởng: phần offline của lần vắng đó không chạy nền cho tới khi phục hồi trạng thái và chủ động tiếp tục ở trạng thái hợp lệ. Không tự hoàn thành HN07/HN09/khảo nghiệm, xác nhận tầng hay nhận thưởng replay.

Tổng kết cần nói rõ: thời gian được tính, lượng nhận được, nguyên nhân dừng và mục tiêu tiếp. Đạt cổng sau 3 phút dù vắng 30 phút chỉ ghi thời gian cần để chạm cổng, không báo chạy đủ 30 phút rồi bỏ phần dư. Lần vắng mặt có mốc server duy nhất, nhiều tab/đăng nhập lại không xử lý lại khoảng thời gian đã ghi.

Ước lượng ngân sách, **không phải thời lượng chơi đã đo**:

| Cách chơi | Thưởng nội dung một lần | Phần tích lũy nền còn cần tới 3.600 | Thời gian nền tối thiểu lý thuyết ở 120/phút |
| --- | --- | --- | --- |
| Chỉ tuyến chính | 1.380 | 2.220 | 18 phút 30 giây |
| Tuyến chính + đủ bốn nội dung phụ | 2.580 | 1.020 | 8 phút 30 giây |

Thời gian này không cộng combat/đi lại/đọc truyện/thử lại; nền có thể chạy song song hành động an toàn nhưng dừng trong các trạng thái đã nêu. Cổng làm việc offline phải chia thành các lần tương tác, không phải đóng game một lần rồi hoàn thành map. Không được quảng cáo “map 8 phút” từ bảng này. Nếu đoạn HN09→HN10 chỉ còn chờ mà không có lựa chọn thú vị, điều chỉnh thưởng/cổng hoặc nội dung luyện trước khi mở rộng map.

## 13. Điều kiện xuất hành và phần thưởng kết thúc

Đề xuất để HN10 mở: ngưỡng 15 đã xác nhận, M03/HN01–HN09 đã xong, đủ bộ nền và pháp khí nhiệm vụ; vào phiên chủ động. Có đường hồi phục/thử lại, không đòi vật tư trả phí hoặc đủ số người. HN10 cho kết quả khảo nghiệm và M04, không cho tu vi cần để mở chính HN10.

[Hồ sơ đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đề xuất ba pha E01/E02/E03, checkpoint giữa pha và hồi đầy/reset cooldown trong chuẩn bị; không cộng kill reward. Stat M03 dùng suốt trận, M04 sau thắng; fail/thoát giữ checkpoint pha đã qua, không nhận thưởng thêm. Baseline không cần cấp potion phiên vì hồi tại chuẩn bị đã đủ, vật tư túi vẫn dùng ngoài combat.

HN11 tổng kết sáu phần, quyền đã mở và mục tiêu riêng. HN12 cần HN01–HN11 đầy đủ, nhánh HN06 đúng người, mốc tương ứng tầng 15/hồi phục cuối, HN10 server xác nhận; ghi xuất hành một lần. Rời map giữ skill R01/công pháp nền/đồ đã nhận nhưng không tự cấp Trúc Cơ, châu chung hoặc bộ R02.

Chương tiếp theo phải có nhiệm vụ chuẩn bị/đột phá hoặc hồi phục riêng, được biên tập theo nhân vật. Phần thưởng kết thúc là quyền tiếp cận hành trình và động lực tiếp, không một gói stat/cảnh giới cao dùng ngay ở sân nhập môn. Nếu map sau chưa có, kết thúc bằng tổng kết rõ và cho trở lại hoạt động đã mở theo trạng thái bản thử.

## 14. Lưu tiến trình, quyền thưởng và kinh tế

Khi triển khai cần lưu riêng: tổng tu vi/tiến triển hồi phục, ngưỡng đã xác nhận, nền vận hành đang được tiếp cận, mốc M, nhiệm vụ/nhánh, kết luận HN07, bước luyện hóa, vật tư, phần thưởng đã nhận, hoạt động đang chọn và thời gian đã tính. Đây là yêu cầu nghiệp vụ, chưa là schema runtime mới.

Nhận thưởng/vượt cổng/luyện hóa/ghi kết quả phải có thao tác xác nhận nhất quán và chống lặp. Nhiệm vụ thưởng không trừ nguyên liệu hai lần; gửi lại hoặc nhiều tab không nhận lại tu vi/đồ. Khi túi đầy, phần thưởng giữ trạng thái chờ nhận rõ, không mất thưởng hoặc nhân bản bởi một lần nhận dở. Sức chứa/kho và quyền chuyển tài nguyên giữa hồ sơ chưa khóa, không giả định 120/30 của bản cũ.

Baseline này không thêm linh thạch làm tiền giao dịch, market, rarity/gacha, bán vật phẩm nhiệm vụ hoặc boost trả phí. Vật tư lặp và kinh tế sau map cần hồ sơ riêng. Khu chung không bắt tranh last-hit hoặc mua nguyên liệu từ người khác để HN08/10 hoàn thành. Tính ràng buộc đồ nhiệm vụ không tự áp lên mọi vật phẩm game đầy đủ.

## 15. Tình huống nghiệm thu khi có bản thử

| Tình huống | Kết quả cần thấy |
| --- | --- |
| Hoàn thành HN02–HN05 theo tuyến chính, không thổ nạp thêm | Tổng 360, đủ xác nhận ngưỡng 3; M02 còn kiểm nhiệm vụ |
| HN06 tại cổng 3 | Tu vi tăng 360→480, nền dừng; không mất 120 hoặc tự lên tầng 4 |
| Hoàn thành HN07 trong ví dụ trên | Tổng 720, mở nền 4–9, chủ động xác nhận ngưỡng 4/5; không đủ 6 |
| Làm nội dung phụ sớm hoặc sau khi đã đủ 3.600 | Thưởng một lần, phần dư qua cổng được giữ; không vượt quyền/stat ngưỡng 15; replay không thêm 300 |
| Tới HN09 chưa đủ ngưỡng 9 | Bài luyện/điều kiện đọc được; chỉ xác nhận thành quả khi đủ, không cần đồ ngẫu nhiên |
| HN08 mất mạng sau luyện hóa được nhận | Chỉ trừ 4 nguyên liệu/nhận 1 pháp khí; còn 2, không tạo phôi bán được |
| Điểm chuẩn bị khi hết vật tư thường | Vẫn hồi/tiếp tục thử luyện; không bị khóa thanh toán/farm bắt buộc |
| Offline tới cổng | Nền dừng đúng phần còn thiếu, nói rõ mục tiêu chủ động; không mở HN07/09/10 |
| M04 tăng HP/linh lực tối đa | Chỉ sau HN10 hợp lệ, không tự hồi đầy hoặc ghi buff trước trận |
| Tư Đồ Nam qua toàn tuyến | Hiển thị hồi phục, giữ trạng thái truyện; không biến thành Ngưng Khí tầng 15 canon |
| Lý Mộ Uyển chơi solo | Cùng quyền skill/ngân sách, có chuẩn bị riêng; không cần Vương Lâm/người khác |
| Xem lại/đổi phòng/gửi lại nhận thưởng | Không nhân tu vi, nguyên liệu, pháp khí hoặc quyền xuất hành |

Kiểm ngân sách bảng/ngưỡng và dẫn nguồn có thể làm ở tài liệu; độ vui, tốc độ tiến triển và mức stat phải chơi thử. Chưa có nghiệm thu runtime trong bản này.

## 16. Phần cần đánh giá tiếp

Ưu tiên: phạm vi hết 15 tầng trong map chuyển thể; bốn mốc 1/3/9/15; ngân sách thưởng/nền và nhịp chờ; quy tắc hoạt động nền khi khám phá/offline; tác dụng pháp khí; bố trí nội dung phụ; lời dẫn ba người và tên vật phẩm/công pháp. Các giá trị chưa được duyệt không đưa vào production như luật đã khóa.

Hồ sơ [HN-E01/02/03 và ba pha HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đã có bản đề xuất theo stat/công cụ ở đây; cần đánh giá timing/đường né/checkpoint, kiểm animation/anchor/tín hiệu bộ ba/enemy rồi chọn lát A để thử nhịp. GD03–GD06/GD08/GD09 có bản cơ sở, không được báo hoàn thành triển khai chỉ bởi viết tài liệu.
