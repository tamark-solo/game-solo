# Review GDD 0.35 và các báo cáo ngày 14–15/10/2026

> **Cập nhật sau review ·15/10:** Theo yêu cầu owner, R01–R08 đã được xử lý ở mức hợp đồng thiết kế trong [bản thống nhất](GDD-035-UNIFIED-CONTRACT.md) và các tài liệu liên quan. Giữ phần dưới làm lịch sử phát hiện tại thời điểm review; số dòng/đề xuất cũ không phải quy tắc hiện hành. Owner cũng cho phép làm lại logic bản chạy chưa đưa vào test, tận dụng ART nhân vật/quái/boss hiện có và chỉ bổ sung phần thiếu. Chưa xác nhận runtime hoặc balance 0.35 đã được triển khai.

| Review | Cách xử lý hiện hành |
| --- | --- |
| R01 | Phiên II mở ở VG07 với hai chủ hồn; Chấp Sự bổ sung VG10. |
| R02 | Hai nhánh tầng 12/tầng 15 có nguồn đan chung VG05, nhập lại VG07 sau VG06; bù đắp không hạ cảnh giới. |
| R03 | Tách duyệt Neutral03/VFX02 khỏi Motion01 candidate của Hắc Ấn. |
| R04 | Bảng từng hồi dùng Chu Thiên/Xung Mạch, không tự grant tầng; G2 v1 giữ làm lịch sử. |
| R05 | Quyển Trung có nguồn solo từ VG04, Quyển Hạ từ VG07. |
| R06 | Tổng bậc tế luyện 0–30, trần 10/20/30; mở mốc mới +0 nhưng giữ tổng bậc và bonus. |
| R07 | Recipe theo danh sách; đầu ra kế thừa khóa; thưởng Huyết Lệnh Khóa; có nhóm trang bị/phôi rèn. |
| R08 | Pity không giảm, ngưỡng hữu hạn theo bậc, chỉ reset khi thành công. |

Kiểm đồng bộ tài liệu: `node scripts/verify-gdd-035-docs.mjs`. Pacing, kinh tế và khả năng hoàn thành bằng gameplay cần fixture/playtest tiếp theo, không đóng bằng kiểm chữ.

Ngày review: 15/10/2026. Phạm vi: thiết kế, tính nhất quán, điều kiện mở khóa và khả năng triển khai. Đây là nhận xét và đề xuất; chưa thay đổi quyết định thiết kế hoặc cấp thêm approval.

Đã đọc toàn bộ GDD 0.35, báo cáo chiều sâu/nhịp độ MMO, thiết kế tiến trình, đặc tả Artwork–Logic, nghiên cứu thị trường/nguyên tác, brief UI/UX và biên bản ghép Đạo Ấn V3. Đối chiếu thêm core/README/test G2, tiến độ production V2 và phạm vi duyệt Hắc Ấn.

**Đánh giá:** bản mới tạo được mục tiêu phát triển dài hạn rõ hơn 0.34, nhưng chưa đủ nhất quán để dùng trực tiếp làm đặc tả ghép gameplay 0.35. Cần chốt các cổng tiến trình và mô hình tài nguyên trước khi mở rộng tích hợp G3. Các mốc 40–65 giờ và 80–120 giờ hiện là mục tiêu thiết kế, chưa phải thời lượng đã kiểm chứng bằng chơi thử.

Điểm nên giữ: một tuyến chính/hai identity; bốn pháp bảo có vai trò khác nhau; tách Tu vi khỏi MP; trang bị sáu ô không bắt vẽ lại sprite; bảo toàn đầu tư; điều hướng từ điều kiện còn thiếu tới nguồn hoạt động; câu chuyện mở vùng và tạo biến cố.

Mức ưu tiên: **P1** cần giải quyết trước khi chuyển phần liên quan sang integration; **P2** cần chốt trong fixture/cân bằng. Các nguy cơ kẹt được nêu theo cách triển khai có điều kiện, không phải kết luận rằng runtime hiện tại đã mắc lỗi đó.

## Các phát hiện cần xử lý

### R01 · P1 · Điều kiện Hồn phiên Mốc II có ba hợp đồng khác nhau

- Báo cáo chiều sâu, dòng 152: `300 Du Hồn + 3 Chủ Hồn Tinh Anh`.
- Cùng báo cáo, dòng 257 (`VG07`): `1.000 Tinh Hồn + 2 Chủ Hồn Tinh Anh Trúc Cơ`.
- Thiết kế tiến trình, dòng 83 và 192: `1.000 Tinh Hồn + 3 Chủ Hồn`; danh sách ở dòng 192 gồm Hồn Chấp Sự, trong khi chân thân Chấp Sự đến `VG10` mới bị tiêu diệt.

`VG10` lại yêu cầu/dùng Hồn phiên Mốc II. Nếu lấy đủ ba chủ hồn trong danh sách ấy làm điều kiện mở Mốc II tại `VG07`, cổng mở khóa phụ thuộc vào phần thưởng của hồi sau. Đổi Du Hồn thành Tinh Hồn cũng làm thay đổi khối lượng farm; báo cáo còn có phép hợp thành 5:1 giữa hai loại này.

**Đề xuất:** chốt một recipe theo ID vật phẩm. Có thể mở Mốc II với hai chủ hồn ở `VG07`, rồi bổ sung chủ hồn Chấp Sự làm nâng cấp riêng tại `VG10`. Ghi rõ hai trạng thái, không dùng chung một điều kiện “hoàn thiện Mốc II”. Kiểm walkthrough từ nhân vật mới, không cấp trước hồn từ hồi sau.

### R02 · P1 · Nhánh Trúc Cơ từ tầng 12 chưa có đường đi qua tuyến chính

Báo cáo chiều sâu, dòng 31, cho phép lựa chọn Phàm Đạo Trúc Cơ từ tầng 12; tầng 13–15 được mô tả là nhánh Cổ Cảnh tùy chọn. Tuy nhiên bảng `VG05–VG06` ở dòng 255–256 bắt đi qua Cổ Cảnh 13–15 rồi dựng Thiên Đạo Đạo Đài. GDD dòng 121–122 giữ cùng trình tự. Prototype hiện tại cũng từ chối đột phá dưới tầng 15 (`core.mjs`, dòng 1468–1470).

Nếu thực thi lựa chọn tầng 12 theo báo cáo mới, chưa có quy tắc để hoàn thành `VG05`, gặp Lý Mộ Uyển/lấy đan và chuyển sang `VG07`. Nếu tiếp tục bắt mọi người lên tầng 15, lựa chọn được mô tả ở dòng 31 không tồn tại trong gameplay.

**Đề xuất:** hoặc xác định Cổ Cảnh là bắt buộc với tuyến nhân vật này, hoặc thiết kế hai nhánh nhập lại tuyến chính bằng fact rõ ràng. Nhánh đột phá sớm cần có nguồn Trúc Cơ Đan và đường Bù Đắp Đạo Cơ về sau. Không đổi nghĩa các fact đã lưu mà thiếu phiên bản chuyển đổi.

### R03 · P1 · Một tài liệu vẫn ghi rộng phạm vi duyệt Hắc Ấn

Thiết kế tiến trình, dòng 159, dùng nhãn “72 clip Motion01 + Triện Thuật VFX02 đã duyệt”. README Motion01 của Hắc Ấn, dòng 5, vẫn ghi các view/action/socket mới đang chờ owner duyệt. AGENTS phân biệt rõ duyệt Neutral03 và VFX02 với duyệt body/motion.

Nhãn hiện tại có thể khiến người ghép G3 hiểu cả 72 clip đã có ART/motion approval. **Cần sửa câu theo từng gói và hash:** Neutral03 đã duyệt; VFX02 đã duyệt; Motion01 candidate/chờ duyệt. QA qua hoặc đủ clip không thay cho approval. Production V2 của hai nhân vật hiện cũng là `review-ready`, `newProductionApproved: false`, `runtimeIntegrated: false`.

### R04 · P2 · Bảng logic từng hồi còn giữ hành vi tăng tầng của 0.34

Đặc tả Artwork–Logic, dòng 78–83, đã phân biệt prototype nhanh và chế độ MMO đầy đủ. Nhưng dòng 101–102 vẫn cho nhặt châu cộng `150 Tu vi` và tự lên tầng 2, meditate 3 giây, chạy Trận Dẫn Khí một lượt là tới tầng 3; dòng 111 vẫn chế Hồn phiên bằng `3 Yêu Hồn + 2 Mảnh Hắc Phù`. Backlog dòng 205 tiếp tục yêu cầu tự tăng tầng nhỏ. Các bảng này chưa mang nhãn chỉ dành cho prototype nhanh.

Các điều kiện ấy khác với 9 Chu Thiên, Xung Mạch chủ động, Kiếm +2 và 100 Du Hồn/5 tinh anh trong báo cáo mới. Người lập trình theo bảng từng hồi có thể bỏ qua chính ma sát tu luyện vừa được bổ sung.

**Đề xuất:** giữ G2 v1 làm baseline; tạo bảng hợp đồng 0.35 riêng có ngưỡng Chu Thiên, khẩu quyết, độ thuần, đan độc, thời gian Xung Mạch và điều kiện thất bại. Đưa các bảng từng hồi về cùng nguồn cấu hình. Brief UI/UX dòng 85 cũng cần cập nhật quy tắc nút đột phá theo quyết định mới.

### R05 · P2 · Nguồn Tàn Quyển trước cổng Công pháp chưa được định nghĩa đủ

Báo cáo chiều sâu, dòng 165–166, yêu cầu Quyển Trung để lên Đại Thành và Quyển Hạ để lên Viên Mãn. `VG06` bắt Đại Thành trước Trúc Cơ; `VG08` bắt Viên Mãn khi còn Trúc Cơ. Nhưng bảng vật phẩm dòng 335 xếp Quyển Trung ở Tier 2/Trúc Cơ, Quyển Hạ ở Tier 3/Kết Đan.

Đây là thiếu hợp đồng nguồn trước cổng: nếu bảng Tier cũng điều khiển nơi rơi/mở shop, người chơi cần vật tư của giai đoạn sau để hoàn tất giai đoạn hiện tại. Các nguồn chung “Tinh Anh/Bí cảnh/shop” và luật hợp thành tổng quát chưa chỉ rõ item nào được lấy trước cổng.

**Đề xuất:** tách bậc cảnh giới khỏi cấp lĩnh ngộ hoặc bổ sung nguồn/công thức cụ thể có thể tiếp cận đúng hồi. Kiểm với server mới, không dựa vào người chơi cảnh giới cao bán sách xuống.

### R06 · P2 · Kế thừa nguyên cấp +10 chưa khớp mục tiêu tế luyện lại mỗi mốc

GDD dòng 146 ghi cấp tế luyện được kế thừa 100%; thiết kế tiến trình dòng 83 lại ghi `Mốc I +10 → Mốc II +1…+10`. Báo cáo chiều sâu dòng 151–153 yêu cầu +10 để nâng mốc, còn dòng 286 ghi mọi cấp tế luyện cộng dồn trực tiếp.

Với một trường `refinementRank 1..10`, chưa phân biệt được hai cách: giữ nguyên +10 thì Mốc II đã hoàn thành trục tế luyện ngay lúc mở; quay về +1 thì không giữ nguyên cấp như lời hứa hiện tại.

**Đề xuất:** chọn mô hình rõ ràng: cấp tế luyện toàn đời với trần tăng theo mốc, hoặc lưu bậc riêng từng mốc và giữ bonus/vật tư đã đầu tư. Định nghĩa trạng thái trước/sau nâng mốc và công thức sức mạnh; phân biệt “không mất giá trị” với “giữ nguyên con số”.

### R07 · P2 · Luật hợp thành và trạng thái khóa chưa đủ để triển khai kinh tế

Báo cáo dòng 324 nói mọi vật phẩm có công thức lên bậc; dòng 341 cho hợp thành `5 Tier N + lộ thủy → 1 Tier N+1`. GDD dòng 163 cũng dùng phạm vi “mọi nguyên liệu”. Chưa có danh sách ngoại lệ cho tín vật Boss, chủ hồn đặc biệt, giải niêm và vật liệu mở mốc; chưa chốt đầu ra khi trộn nguyên liệu khóa/không khóa. Ngoài ra, Huyết Lệnh rơi “Không Khóa” ở dòng 304, khác quy tắc thưởng ngày/tuần cơ bản “Khóa” trong GDD dòng 169.

Nếu dùng phép đổi bậc chung cho các nhóm này, có thể làm mất ý nghĩa nguồn rơi độc quyền; nếu đầu ra không kế thừa khóa, có thể chuyển thưởng cá nhân thành hàng giao dịch. Đây là nguy cơ của đặc tả còn thiếu, chưa phải exploit đã được chứng minh trong code.

**Đề xuất:** recipe theo danh sách cho phép; điều kiện cảnh giới/nghề/Nội Giới; quy tắc khóa đầu ra; định nghĩa riêng chứng đạo và chủ hồn độc bản. Giá trị nguyên liệu cũ có thể giữ qua chế tác/nuôi dưỡng, không cần mọi món đều đổi lên vật liệu hiếm của bậc sau.

### R08 · P2 · Hard pity chưa có tính đơn điệu và số lần thất bại tối đa

Bảng doanh thu dòng 375 vừa bán bùa “giữ không rớt điểm chúc phúc”, vừa khẳng định mọi thất bại tích điểm và đầy thanh chắc chắn thành công. Chưa nêu khi nào điểm giảm/reset hoặc có hết hạn không. Nếu điểm có thể giảm không giới hạn khi không mua bùa, chưa chứng minh được số lần thất bại tối đa cho người chơi miễn phí.

**Đề xuất:** quy định `pityAfterFailure >= pityBeforeFailure`, ngưỡng hữu hạn theo bậc và chỉ reset khi thành công. Bùa có thể giảm chi phí/tăng số điểm trong giới hạn được công bố. Kiểm toàn bộ chuỗi thất bại, reconnect và thay vật phẩm; không chỉ kiểm lần thành công.

## Các quyết định cân bằng cần thử trước khi chốt thời lượng

| Nội dung | Quan sát từ bản mới | Việc cần đo/chốt |
| --- | --- | --- |
| Thời lượng | Tổng `VG07–VG11` hiện là **80–125 giờ**, khác tiêu đề 80–120 giờ. “Active + chu kỳ” chưa tách thời gian chơi và thời gian lịch. | Bảng EXP/cost/drop theo tầng; hoạt động/phút; nguồn thưởng chồng nhau; thời gian chủ động, online thụ động và chờ lịch. |
| Nén Khí Hải | Dòng 55 cho tích xung lực đột phá; dòng 61 cho 100% EXP dư vào pool rồi nâng công pháp/pháp bảo, chưa có trần hay tỷ lệ đổi. | Dung lượng pool, chi phí từng đích, phần tiêu và phần giữ khi mở epoch, giới hạn chống tích đủ để nhảy ngay nhiều tiểu cảnh giới. |
| Độ thuần/Đan độc | Dòng 85 cho mọi trận thắng +0.5–2% độ thuần: từ 75 lên 95 chỉ cần 10–40 trận theo đúng số hiện tại, chưa xét cấp mục tiêu. Thượng phẩm vẫn +4 đan độc ở dòng 86 nhưng dòng 364 mô tả “không bị Đan Độc”. | Số chỉ mang tính fixture hay mục tiêu balance; quái hợp lệ, chênh cấp, giới hạn lợi ích; ảnh hưởng đồng thời của toxicity và purity. |
| Chênh lệch cày–nạp | Trần cảnh giới không tự giới hạn đồ, cổ ấn, khí linh, công pháp và độ thuần. Thẻ tháng còn tăng thổ nạp/nguồn lộ thủy/linh điền. | Đo chênh DPS, EHP và thời gian hoàn thành cùng encounter theo cùng epoch. Chốt ngưỡng chấp nhận; tách PvP chuẩn hóa và PvP thực lực. |
| Thù Đồ Đồng Quy | Đã có bốn nhánh hoạt động nhưng chưa có bảng điểm, giá đổi và thành phần thưởng tuần chung. | Mỗi nhánh có thể đạt trần thưởng cốt lõi trong ngân sách thời gian tương đương; tránh phải làm cả bốn nhánh; tách thưởng đặc trưng và phần bắt buộc cho tiến trình. |
| Solo/Hộ pháp | Dòng 302 cho solo/co-op tùy chọn, dòng 315 cho NPC trợ chiến; bảng `VG11` dòng 261 lại ghi mời đạo hữu như điều kiện. | Ghi NPC/khí linh thay được người thật ở bước nào, cách mở và scaling; thử hoàn thành trên server ít người. |

Nhận xét thiết kế: sáu trục có giá trị khi chúng tạo lựa chọn build và cách chuẩn bị khác nhau. Nếu tất cả chỉ là các thanh phải đầy theo cùng một thứ tự, số giờ tăng nhưng quyền lựa chọn của người chơi vẫn ít. Nên giữ một phần yêu cầu tối thiểu để mở cốt truyện, còn bộ sáu món hoàn chỉnh, max cả bốn pháp bảo và các cổ ấn hiếm là mục tiêu tối ưu hóa có chủ đích theo từng chặng.

## Rà soát nguồn nghiên cứu và trạng thái tài liệu

- Kiểm 69 lượt liên kết nội bộ trong bảy tài liệu: **5 liên kết hỏng**, đều trỏ tới `CULTIVATION-QUEST-REFERENCES-2026-10-13.md` không còn tồn tại, tại báo cáo thị trường dòng 3, 25, 26, 53, 54. Cần đưa URL/chứng cứ cần dùng vào tài liệu còn được duy trì, không khôi phục tài liệu đã chủ động dọn chỉ để chữa link.
- Đã đối chiếu nguồn chính thức của [Sword of Justice](https://store.steampowered.com/app/2782500/), [The Matchless Kungfu](https://store.steampowered.com/app/1696440/) và [Immortal Life](https://store.steampowered.com/app/1201230/). Các ý Paths Converge, kinh mạch/nội công và trồng trọt/luyện đan có cơ sở trong mô tả nhà phát hành. Các nguồn này không chứng minh ngân sách 40–65 giờ hoặc các hệ số của Vân Hải; những con số đó cần ghi là giả thuyết thiết kế và kiểm riêng.
- [Chương 33 Tiên Nghịch](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-33) xác nhận nhu cầu trao đổi khẩu quyết tầng cao, đồng thời nói đã có khẩu quyết 10–15 trong tông môn. Chương này không chứng minh tầng 13–15 là Cổ Cảnh ẩn sau trần thông thường 12. Cơ chế ấy có thể giữ làm chuyển thể/sáng tạo mới, nhưng cần gắn đúng nhãn nguồn.
- [Chương 104](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-104) truy cập được ở mức teaser, có Quyết Minh Cốc/Âm Thi Tông; phần xem được không xác nhận Lý Mộ Uyển hoặc sự kiện Hộ Đạo Đan Thất. Đặc tả Artwork–Logic dòng 173 cần tránh ghi sự kiện này như tình tiết nguyên tác đã đọc được.
- Trang Steam `3384260` báo không khả dụng theo vùng tại lượt kiểm này; chưa xác minh lại được các cơ chế kinh tế của tựa đó. Không dùng mô tả chưa đọc được làm bằng chứng mới.
- Số ô cổ ấn còn lệch: 3 trong GDD, 2–4 ở class diagram, 3–4 ở ma trận; độ thuần có nơi tối đa 100%, nơi 120%. GDD liệt kê sáu ô trang bị nhưng nhóm 7 trong bảng vật phẩm lại chỉ có phù/trận, chưa có dòng taxonomy riêng cho sáu món/phôi rèn như danh mục tám nhóm ở GDD. Cần chốt trước schema.

## Đề xuất thứ tự công việc tiếp theo

1. Đồng bộ hợp đồng mở khóa cho `VG01–VG11`: điều kiện vào/ra, item ID, nguồn có thể tiếp cận, mở mốc và các nhánh tùy chọn. Ưu tiên R01–R05.
2. Tạo fixture 0.35 kế tiếp, giữ nguyên baseline G2 v1 và các pin ART/runtime/map. Hoàn thiện trạng thái Chu Thiên, purity/toxicity, khẩu quyết, refinement và pool nén trước khi migrate.
3. Làm một đoạn chơi hoàn chỉnh `VG01–VG02`: hái/rèn/đan/thực chiến, tối thiểu hai lựa chọn chuẩn bị và một trận Boss. Dùng dữ liệu để kiểm tốc độ trưởng thành và sự khác biệt giữa lựa chọn build.
4. Mô phỏng người chơi 30 phút/ngày, 2 giờ/ngày, cày nhiều và vào muộn; tách thời gian chơi khỏi ngày máy chủ. Đo ngưỡng thiếu EXP, thiếu vật tư và thời gian lặp lại cùng encounter.
5. Chốt phép hợp thành, trạng thái khóa, pity và quỹ thưởng tuần trước Phường Thị. Sau đó mới cân bằng mô hình cày–nạp trên các trục sức mạnh có thể mua được.

## Kiểm chứng đã thực hiện

- `node --test tests/unit/wang-lin-progression-loop-prototype.test.mjs`: **9/9 PASS** trong lượt review này.
- Đọc báo cáo G2 đã lưu: **955 checks**, ngày 14/10, `fixtureOnly: true`, `runtimeIntegrated: false`, `gameplayBalanceApproved: false`. Không chạy lại verifier ghi đè evidence.
- Đối chiếu state thực tế: G2 v1 chưa có `meridianCycle`, `qiPurity`, `pillToxicity`, `compressedQiPool`, `stanceMasteryTier` và `refinementRank` trong các record tương ứng. Vì vậy test hiện có xác nhận baseline nhanh, chưa xác nhận chiều sâu hoặc pacing 0.35.
- Kiểm đường dẫn tài liệu, cộng lại ngân sách từng hồi và kiểm mẫu nguồn chính thức như trên. Chưa chơi thử đủ 40–65 giờ, chưa kiểm mọi tựa game hoặc mọi chương truyện được liệt kê.
- Lượt review chỉ thêm biên bản này; không sửa GDD, code gameplay, các nguồn/pin ART, owner map, DB hoặc dữ liệu lưu.
