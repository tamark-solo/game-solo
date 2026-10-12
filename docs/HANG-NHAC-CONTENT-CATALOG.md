# Catalog nội dung nhập môn — đồ, nền vận hành, thuật và pháp khí

**Bản thiết kế làm việc 0.1 · 10/10/2026 · ND3, phần đầu ND4.** Đi cùng [chương Hằng Nhạc phương án A](HANG-NHAC-CHAPTER-PLAN.md). Catalog này là tài liệu, không được loader/runtime đọc và không tự cấp item/quyền mới. Owner cho bắt đầu bước thiết kế, chưa phê duyệt mọi chi phí/slot/tên/hiệu lực hoặc ART dưới đây.

[GDD](GDD.md) · [mô hình nhân vật](CHARACTER-SYSTEM.md) · [nhiệm vụ](QUEST-SYSTEM.md) · [nguồn số thử](HANG-NHAC-PROGRESSION-REWARDS.md) · [runtime hành trang](HANG-NHAC-CHARACTER-RUNTIME.md).

**Mở rộng có kế hoạch sau nhập môn:** [nguồn đợt 2](TIEN-NGHICH-CRAFTING-REFERENCES.md), [thiết kế luyện chế](ITEM-CRAFTING-DESIGN.md) và [VP0–VP4](ITEM-PRODUCTION-PLAN.md) cụ thể hóa 8 định nghĩa/5 recipe hậu HN12. Không thêm chúng vào ngân sách HN05 hoặc tự đổi 2 nguyên liệu dư. Khuyến nghị giảm nguồn HN06 chưa phát hành là phương án cần duyệt, số 3+3−4=2 trong bản hiện hành vẫn giữ.

## 1. Quy tắc đọc và quyền quyết định

- **Có thật:** item ID/quyền trong code được đối chiếu trực tiếp. Không gọi tên mới để cấp lại đồ cũ.
- **Thiết kế A:** nội dung mới đủ mô tả để thảo luận/tách hợp đồng, chưa có runtime. ID bắt đầu `hn-` là **khóa thiết kế dự kiến**, chưa đưa vào protocol/schema.
- **Để sau:** ý tưởng nghiên cứu không có nguồn cấp/action thật, không mở nút trong game.
- Nguồn cân bằng số ở hồ sơ tiến trình/skill hiện hành. Giá trị thử chép lại có nhãn; nếu đổi sau cần cập nhật cùng nguồn, không để hai bảng điều hành khác nhau.
- Dữ liệu riêng theo `characterId`/hồ sơ đã xác thực, không theo avatar/tên. Receipt theo nguồn nhận ổn định, không tái cấp khi request ID hoặc phiên bản text đổi.

## 2. Catalog đồ tối thiểu

| Khóa | Tên hiển thị | Loại / nơi chứa | Nguồn duy nhất trong lát đầu | Tác dụng / đích dùng | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| `wood-sword` | Mộc kiếm nhập môn | Gear instance, slot `weapon` | Khởi tạo/migration pilot đã có | Mang/tháo, chưa bonus; không yêu cầu cầm mới dùng R01 | Có thật |
| `plain-robe` | Áo vải môn phái | Gear instance, slot `robe` | Khởi tạo/migration pilot đã có | Mang/tháo, chưa bonus; không đổi sprite map | Có thật |
| `recovery` | Vật tư hồi phục | Stack view từ `sect.supplies`, không hai kho | HN01 đã có; HN05/08/09 thêm cùng nguồn khi triển khai | Hồi HP ngoài trạng thái bị cấm, cooldown chung | Có thật cho nguồn cũ; nguồn mới chờ |
| `hn-refining-material` | Nguyên liệu luyện hóa nhập môn | Một stack nhiệm vụ riêng hồ sơ | HN05 +3, HN06 +3 theo ngân sách thử | Công thức HN08 tiêu 4, không dùng vào mẫu thử HN06/07 | Thiết kế A |
| `hn-training-jade` | Phôi ngọc hộ thân → Ngọc hộ thân luyện tập | **Một instance** có trạng thái `raw/refined`, slot `charm` chỉ khi refined | Nhận phôi một lần khi bắt đầu HN08 | Nhận biết/luyện hóa/thử phòng thủ; chuyển trạng thái, không thưởng bản sao | Thiết kế A |

Đây là **5 định nghĩa đồ trong phạm vi nhập môn**, trong đó 3 ID đã tồn tại và chỉ 2 định nghĩa mở rộng dự kiến. Một pháp khí có hai tên theo trạng thái, không hai món độc lập. Không thêm tiền tệ, đồ rác bán shop, 12 món fixture hoặc random rarity để lấp giao diện.

### 2.1. Gear có sẵn — không sửa quyền ngầm

Giữ ID instance pilot `${profileId}_${definitionId}`, trạng thái bảo vệ và equipment đã lưu. Vẫn nhận đúng một kiếm/một áo qua migration hiện hành. Một món ở một vị trí sử dụng; UI có thể liệt kê cả ở túi lẫn vùng trang bị nhưng không tạo hai instance. Giữ HP/MP tối đa 100/100 ở nền hiện tại; bỏ gear không tước quyền R01.

Chưa bán/vứt/trao đổi gear. Cờ bảo vệ có nghĩa hiện có, không tự thành binding hoặc bất tử. Đổi áo/kiếm chưa thay hình map và chưa cộng stat vì lời mô tả mỹ thuật.

### 2.2. Vật tư hồi phục — một nguồn số lượng

Hiện `recovery` phản chiếu `profile.sect.supplies`: dùng 1 hồi 30 HP tới max, cooldown 10 giây chung với NPC, đầy HP thì giữ vật tư. Khi thêm encounter phải mở rộng điều kiện cấm combat/đang transfer theo luật thật, không tin cờ client.

Đề xuất RM1 giữ nguồn supplies, thêm adapter cho gói thưởng HN05, không chuyển toàn stack sang container mới nếu chưa cần. Nếu sau này chuyển, cần version/migration chứng minh bảo toàn số lượng, protection và cooldown, chỉ một nguồn ghi có hiệu lực.

Vật tư trong bài thử, nếu có, là của phiên: không gộp vào stack thường, không mang ra/bán/đổi. HN05 phải có đường chuẩn bị miễn phí nên người tiêu hết 2 vật tư HN01 không bị chặn. Cách phục hồi HP/MP/cooldown tại đó còn phải chốt D04; catalog không tự mở API hồi đầy.

### 2.3. Nguyên liệu nhập môn — bảo đảm đủ, không nguồn farm

- Một định nghĩa, một stack per profile, cấp tại **xác nhận** HN05/HN06; không drop từ từng lần giết E01 hoặc mỗi lần thử mẫu.
- Số thử: 3 + 3 = 6; công thức tiêu 4 một lần. Receipt từng nguồn ngăn nhận lại bằng request mới hoặc đổi avatar.
- Binding theo hồ sơ, không bán/vứt/chuyển kho/giao dịch, không recipe khác; nguồn không bị mất vì bị hạ. Không có hành động “Dùng” chung trên stack.
- Mẫu nghi sai trong truyện là fact/activity riêng, không stack này. Item được cấp là nguyên liệu đã kiểm, không random chất lượng.
- **Sức chứa đề xuất A:** tài nguyên nhiệm vụ chỉ phục vụ chương nằm ở vùng có bảo đảm nhận, chưa áp sức chứa trả phí/ô túi chung. Đây là phạm vi hẹp, không có nghĩa ba lô thường vô hạn.
- **Hai đơn vị dư:** giữ ở trạng thái “Chưa có công thức tiếp”, không đánh lừa bằng nút craft sáng. Chưa tạo sink giả/cấp thêm buff. Trước phát hành toàn chương phải chọn giữ như nguồn cho nội dung thật kế tiếp hoặc sửa ngân sách chưa phát hành; không âm thầm xóa vật liệu người chơi đã nhận.
- Nếu thiếu vật liệu mặc dù nguồn bắt buộc đã được ghi nhận và chưa có chi hợp lệ: báo dữ liệu bất nhất để xử lý có audit, không tự cấp bù mỗi lần mở UI. Nếu nguồn chưa nhận: chỉ đường nhận nguồn đó, không làm lại quest đã xong.

### 2.4. Phôi/pháp khí — cùng một món từ đầu đến cuối

- Nhận phôi ở HN08 sau HN07, theo khóa nguồn `HN08:first-blank` dự kiến. Chỉ cấp khi không có grant trước; đọc lại không sinh thêm.
- `raw`: có thể xem, chưa equip/kích hoạt; mô tả rõ điều kiện nhận biết, 4 nguyên liệu và bước xác nhận. `refined`: equip vào `charm`, dùng sau điều kiện hoạt động hợp lệ.
- Chuyển trạng thái giữ instance ID, owner, nguồn gốc, protection. Bảng thưởng “1 pháp khí” là thành quả chuyển phôi, không một grant mới lúc nhận +300.
- Trong chương: không bán/vứt/chuyển/đập vỡ, không random failure, không độ bền/cường hóa. Người chơi tháo ra có thể mang lại, không mất quyền đã hiểu hoặc tiến độ bài.
- HN08 chưa đạt phần thử hộ thân vẫn giữ món refined. Disconnect/restart đọc lại bước chưa xong, không trừ thêm 4 nguyên liệu.

## 3. Những thứ không phải item

| Khóa biên tập | Nội dung | Nguồn / trạng thái | Cách dùng |
| --- | --- | --- | --- |
| `hn05-encounter-proof` | Kết quả E01 hợp lệ | Fact server sau thắng, không loot | Cho xác nhận HN05 một lần |
| `hn-route-seal-note` | Dấu niêm có điểm không khớp | Nhật ký sau proof HN05 | Gợi mở HN06; không click để nhận lại thưởng |
| `hn-sample-finding` | Kết luận kiểm mẫu theo avatar | HN06 xác nhận | Dẫn HN07 và báo cáo, không cộng stats |
| `hn-operation-insight` | “Nguồn đủ chưa có nghĩa vận dụng ổn định” | HN07 xác nhận | Entry Đạo đồ và nền 4–9; không EXP lĩnh ngộ |
| `hn-guard-method` | Phương pháp luyện hóa hộ thân | Quyền recipe sau bước nhận biết HN08 | Không cuốn sách có thể bán; không cấp tri thức toàn tài khoản |
| `hn-route-response` | Hồi đáp về việc báo cáo | Nhánh truyện sau HN09, riêng từng hồ sơ | J/NPC, không túi thư có loot hoặc currency |

Không đưa bản ghi kỹ thuật hoặc mỗi bước thoại thành vật phẩm. C/I có thể hiện nguồn gốc món từ facts; J hiển thị lịch sử. Không duplicate quyền vào item đếm số và boolean quest mà cả hai đều có thể ghi độc lập.

## 4. Catalog nền vận hành và lĩnh ngộ

Các khóa trong bảng là khóa biên tập, không yêu cầu thêm ba slot công pháp. “Pháp môn vận khí nhập môn” là tên làm việc chuyển thể; Tư Đồ Nam thấy diễn giải hồi phục khả năng vốn biết.

| Khóa | Mốc tiếp cận | Quyền/tác dụng trong phương án A | Nhãn theo người | Không cấp |
| --- | --- | --- | --- | --- |
| `hn-foundation-1-3` | HN02/M01 hiện có | Hoạt động nền, xác nhận ngưỡng 1–3, gate thử 360 | WL/LMW: vận khí nhập môn; TDN: ổn định hiện diện I | R01 lần nữa, bonus gear |
| `hn-foundation-4-9` | HN07 kiểm chứng và xác nhận | Mở nền/gate thử 1.620, cho xác nhận các ngưỡng đủ | WL: giữ nhịp vận dụng; TDN: mở phạm vi hiện diện; LMW: chuẩn bị và dẫn phù hợp | Tầng 4 tự động, ý cảnh/công pháp canon mới |
| `hn-foundation-10-15` | HN09 + ngưỡng 9/M03 | Nền/gate thử 3.600, chuẩn bị HN10 | Năng lực phối hợp/hiện diện ổn định | Trúc Cơ hoặc R02 |

Nền mở, tích lũy đủ, tầng đã xác nhận và milestone đã ghi là trạng thái khác. Công thức/grant không tiêu tu vi để “mua tầng”. Thổ nạp online hiện có không tự chứng minh offline đã được triển khai. Bài HN07 chỉ mở quyền khi kết quả đã commit; đọc Đạo đồ không phát quyền.

### Entry Đạo đồ đầu tiên

- **Vấn đề:** đã đủ tích lũy nhưng vận dụng chưa ổn định.
- **Bằng chứng:** kết quả thử mẫu HN06 + bài vận dụng HN07 đúng nhánh.
- **Điều đã làm:** thao tác thực có trong proof, không đo tâm trí/đạo đức.
- **Kết luận:** mô tả riêng theo avatar, không xóa tri thức Tư Đồ Nam.
- **Quyền tiếp:** nền 4–9 và bước luyện hóa, không bonus ẩn.
- **Giới hạn:** chưa phải ý cảnh hoặc bằng chứng một người hiểu tất cả nguyên lý; có thể đọc lại miễn phí.

## 5. Catalog hành động và thuật

### 5.1. Nền đã có — giữ hợp đồng

| ID / thao tác | Vai trò | Đầu vào / hiệu lực giữ nguyên | Quyền |
| --- | --- | --- | --- |
| Đi bộ | Chọn vị trí/né cơ bản | Movement server, tốc độ nền 80 px/s, collider chân 8 px | Từ đầu; không thu hồi để bắt dùng Phong |
| F / đòn thường | Đường chơi khi cạn MP | Đòn gần, 0 MP; giữ cooldown/cự ly/hit server hiện hành | Từ đầu, tutorial HN03 |
| `sword` / Kiếm Khí R01 | Hướng và khoảng cách | Projectile thẳng, tối đa một mục tiêu, không xuyên/homing | Từ đầu cho cả ba |
| `thunder` / Lôi Ấn R01 | Chọn mục tiêu và thời điểm | Đơn mục tiêu tại điểm khóa, không AoE/stun mặc định | Từ đầu cho cả ba |
| `wind` / Ngự Phong Bộ R01 | Chủ động đổi vị trí | Đường lướt hợp lệ, không invulnerability/xuyên tường/cổng | Từ đầu cho cả ba |

Thông số thực đọc ở `shared/skills/definitions.ts`, luật core/bàn giao R01; catalog không copy toàn timeline thành nguồn gameplay mới. HN05–HN12 dùng bộ này, không cấp một skill damage mỗi nhiệm vụ. E01/E02 phải tính vùng/timing cho tốc độ 80/radius 8, không sử dụng bảng đề xuất cũ 160/18.

### 5.2. Hành động mới duy nhất trong chương: hộ thân bằng pháp khí

| Phần | Đề xuất hợp đồng trước HN08 |
| --- | --- |
| Khóa hành động | `hn-guard-activate`, ID thiết kế; không thêm vào `SkillId` R01 hoặc receipt cast cũ chỉ vì có nút |
| Chủ thể/mục tiêu | Tự thân, có instance refined thuộc hồ sơ và đang trang bị `charm` |
| Điều kiện nhận | Server kiểm connected/alive, không transfer hoặc hoạt động cấm; đề xuất không kích hoạt chồng cast khác trong bản đầu. Modal chặn input ở client, không phải cờ quyền do client khai để server tin |
| Chi phí/cửa sổ | Dùng điểm xuất phát ở hồ sơ tiến trình: 15 MP, CD 12 giây, cửa sổ 1 giây — **số thử chưa khóa** |
| Hiệu lực | Giảm 50% một hit incoming hợp lệ có damage dương sau khi server nhận, rồi kết thúc; không shield pool, reflect, invulnerability hoặc chữa damage quá khứ |
| Hết cửa sổ không trúng | Không hoàn MP; cooldown vẫn chạy, không giữ buff vô thời hạn |
| Chọn hit | Hit đủ điều kiện đầu tiên theo thứ tự resolve ổn định của server; pulse tiếp không được giảm bởi cùng lượt. Trường hợp tie phải có test |
| Deadline/cooldown | Theo hồ sơ/quyền hành động, không theo instance có thể tháo lắp; đổi món/room/reload không reset. Bị hạ/rời phiên hủy buff, không hoàn phí |
| Idempotency | Cùng request trả kết quả cũ; request mới trong cooldown không tiêu lần hai; buff một lần không áp lại theo animation/event lặp |
| Stats/stacking | Không thêm max HP/MP, không công pháp/gear giảm phí trong lát đầu. Luật ghép nhiều giảm damage chưa mở |
| PvP | Chưa có PvP; không suy hiệu lực này đã được duyệt để tỷ thí |

Tháo/lắp chỉ khi ngoài hoạt động chiến đấu và không đang có hiệu lực ở phương án A; không dùng tháo/lắp để né cooldown. Bài thử có đường thử lại từ chuẩn bị không dùng stack recovery. HN08 cần một hit được giảm để dạy công cụ; HN10 chỉ cần thắng hợp lệ, không bắt cố tình ăn đòn để chứng minh dùng pháp khí.

**Điểm còn chặn trước code:** input/phím và slot hiển thị, windup/animation mới có hay không, lỗi lưu/đồng bộ activation với hit và deadline, lifecycle HN05/HN08/HN10. Không nối tạm vào một ô HUD trống hoặc cho client tự dự đoán HP đã giảm. Dùng chung bộ UI nhưng adapter pháp khí/quest không đẩy quyền quyết định vào hotbar.

## 6. Công thức duy nhất: nhận biết và luyện hóa hộ thân

**Khóa thiết kế:** `hn-refine-training-jade`. Số lượng lấy từ bảng thử hiện có, không số liệu mới.

| Giai đoạn | Điều kiện | Thay đổi bền |
| --- | --- | --- |
| HN08 bắt đầu | HN07, quyền nhận phôi chưa ghi | Cấp đúng một instance raw, ghi grant |
| Nhận biết | Raw thuộc chủ; đã có kết luận HN06/07 | Ghi hiểu điều kiện; UI hiện ingredient count và kết quả |
| Xác nhận luyện hóa | HN08 active, raw đúng chủ, recipe được phép, 4 nguyên liệu, gần NPC chuẩn bị, ngoài combat | Atomic: trừ 4, cùng instance thành refined, receipt lưu fingerprint; không đổi HP/MP |
| Trang bị/thử | Refined, slot hợp lệ, bài thử được bắt đầu | Trang bị snapshot; credit thử từ một hit giảm đúng luật |
| Xác nhận HN08 | Các bước đã có proof | +300 tích lũy/+2 recovery, HN08 hoàn tất; không grant jade nữa |

Luyện hóa không mở timer bế quan hoặc minigame RNG ở bản đầu. Animation là phản hồi sau server nhận/ghi, không quyền thành công. Nếu owner muốn thao tác luyện hóa sâu hơn, tách thành thiết kế mới và kiểm lại fail/refund/progress trước thực hiện.

**Lỗi ở ranh giới:** commit thất bại giữ nguyên raw+6 nguyên liệu; commit thành công nhưng mất phản hồi thì reload thấy refined+2; request mới cho raw đã chuyển không trừ tiếp. Không rollback món đã refine chỉ vì bước thử chưa đạt. Content version của text không thay khóa nguồn lần đầu.

## 7. Cách nhận và tính đầy túi trong lát đầu

Đề xuất A không mở ba lô tổng quát ở RM1 chỉ để chứa ba nguyên liệu. Giữ gear pilot; mở catalog/storage **có giới hạn loại** cho stack nhiệm vụ và instance jade, với đường nâng lên container về sau.

- Vùng nhiệm vụ có bảo đảm nhận đúng nguồn và giới hạn số grant; không drop xuống đất, không báo thành công rồi mất phần thưởng vì túi đầy.
- Một gói HN05/HN06/HN08/HN09 ghi quest, tích lũy, supplies và item đồng thời. Lỗi storage giữ `ready`/bước chờ, không cấp riêng tu vi trước rồi cho nhận item vô hạn.
- Giới hạn số lượng vẫn do catalog/server validation, không “vô hạn mọi số client gửi”. Recipe/nguồn cụ thể kiểm overflow số nguyên.
- Trước RM5 mới quyết slot/trọng lượng/stack max tổng quát và nhận khi đầy cho đồ farm; policy đó phải tương thích các grant bắt buộc đã có.

Đây là khuyến nghị D02 để giảm phạm vi, chưa tự đổi layout hành trang hoặc schema. Nếu chọn capacity toàn túi ngay, cần thêm thiết kế reward escrow/nhận lại trước code, không giải bằng bán slot trả phí hoặc auto-delete.

## 8. UI tối thiểu theo dữ liệu thật

| Nơi | Trạng thái cần trình bày | Action thật khi triển khai |
| --- | --- | --- |
| C / Tổng quan | Tu vi, tầng, M, nền đã hiểu và điều kiện còn thiếu; Đạo đồ đọc | Đi tới NPC/nhật ký; không tự vượt mốc bằng mở tab |
| I / Hành trang | Nguyên liệu đúng số, raw/refined, nguồn và hạn chế, recovery cùng snapshot | Equip/unequip jade refined, xem recipe, use recovery hợp lệ |
| Chi tiết raw | Có 0…6/4 nguyên liệu, bước nhận biết, đang ở xa/đang chờ | Chỉ dẫn NPC hoặc xác nhận luyện hóa khi hợp lệ |
| Chi tiết refined | Hiệu lực/cost/CD, đang mang/không, ngữ cảnh dùng | Mang/tháo theo policy; không bản sao ở hai slot |
| J / Nhiệm vụ | Proof bài so với reward; HN09 đạt bài nhưng thiếu ngưỡng; clue/Đạo đồ/hồi đáp | Tiếp tục/định tuyến/xác nhận đúng NPC; chưa triển khai phải có nhãn |
| HUD công cụ | Đã có quyền, MP/CD/hiệu lực chờ hit và lý do không dùng | Callback kích hoạt server; layout/phím duyệt riêng, không tự chiếm bảy ô |

UI được tiếp tục hoàn thiện khung/token/resize/focus, dùng snapshot mẫu có nhãn ở trang preview riêng. Chỉ khi adapter/runtime có thật mới bật thao tác trong game; không cần tạo lại mỹ thuật nguồn hiện tại.

## 9. Catalog hậu nhập môn — ghi hướng, chưa sản xuất

| Ứng viên | Vai trò khác với hiện tại | Phụ thuộc trước khi mở | Trạng thái |
| --- | --- | --- | --- |
| Một lựa chọn công pháp đang vận dụng | Đổi nhịp/đánh đổi thay vì cộng mọi bonus | Hồ sơ từng avatar, thử/đổi ngoài combat không reset tài nguyên/CD | Ý tưởng RM6, chưa tên/slot chính thức |
| Một biến thể vận dụng thuật | Khác thời điểm/vị trí/counterplay | Contract mới cho targeting/timing/hit, tương thích quyền R01 | Không cấp tự động R02 vì có ART |
| Định Lưu Bàn | Đọc một dấu/vùng thiết kế để mở phương án khám phá | Nội dung thật có hai cách tiếp cận, slot/input/asset | Để sau, không item HN08 hoặc điều kiện HN05 |
| Đan/phù chuẩn bị | Quyết định mang gì trước hoạt động | Nguồn–chi/recipe, đường chơi không trả phí, balance | Chưa thêm potion MP/buff trong nhập môn |
| Bản mệnh/khí linh | Một món có hành trình/lựa chọn lâu dài | Nguồn truyện, ART, giới hạn PvE/PvP và sửa hướng | Nghiên cứu; không gacha/cây nâng vô hạn mặc định |

Không làm các dòng này trước khi ngọc hộ thân đầu tiên có vai trò thật. Bộ ba chỉ phân hóa sâu sau map theo GDD, không phải 3 nghề/cây skill cần xong trước RM2.

## 10. Tương thích mã hiện có và kiểm khi triển khai

Đối chiếu đọc `shared/character-inventory.ts`: validator pilot yêu cầu **đúng hai gear**, định nghĩa ID chỉ `wood-sword/plain-robe/recovery`, equipment được kiểm với catalog cũ. Vì vậy **không thể chỉ thêm hằng số jade/material vào UI rồi coi là hỗ trợ item mới**. Cần thiết kế codec/version/validator, persistence và view adapter cùng nhau; số schema/version đích phải chọn ở D01/D02, không chốt bằng catalog này.

Giữ instance ID/gear/equipment/protection cũ, supplies, cooldown, identity, quest/lesson credit và ledger khách/đăng ký. Không auto-grant vật liệu/jade từ ngưỡng hoặc profile chưa làm quest; HN05/HN06/HN08 có grant riêng. Snapshot vật phẩm chỉ gửi chủ sở hữu; peer không nhận toàn J/I hoặc nhánh truyện.

Các trường hợp acceptance tối thiểu:

1. Save cũ đọc giữ đủ hai gear/supplies, không tự nhận đồ thiết kế mới.
2. HN05 xác nhận một lần: +3 nguyên liệu/+2 supplies/+100; retry cũ/mới đều không cộng thêm.
3. HN06 chỉ nhánh đúng avatar; +3 một lần, tài nguyên activity không ra inventory.
4. Raw không equip/dùng; chủ khác không nhận quyền bằng ID gửi từ client.
5. Refine: 6→2, raw→refined cùng instance, lỗi ghi không thay đổi; mất phản hồi không trừ tiếp.
6. Fail bài hộ thân/restart giữa các bước vẫn refined, không mất credit cũ/cấp thêm item.
7. Hoàn tất HN08 chỉ +300/+2 recovery, không item thứ hai.
8. Buff giảm đúng một hit sau activation server; event trùng/pulse sau không giảm lại, expiry/mất mạng/đổi đồ không reset CD.
9. HN09 bài trước ngưỡng giữ proof nhưng chưa +360; không dùng reward chưa nhận để qua gate.
10. Tổng nguồn–chi khớp bảng chương; hai nguyên liệu dư không có action/bonus ngầm; view C/I/J cùng profile/revision.

Đây là checklist tương lai, **chưa phải test runtime đã chạy**. Bộ đồ thị/ngân sách có thể kiểm đọc ở tài liệu; prototype mới trả lời pháp khí có vui/dễ hiểu và timing có công bằng hay không.
