# Backlog thiết kế — Hằng Nhạc và hệ thống tu tiên

**Phiên bản:** 0.16 · **Cập nhật:** 11/10/2026 · **Tham chiếu:** [GDD 0.32](GDD.md), [nghiên cứu tu tiên](XIANXIA-GAME-RESEARCH.md), [kế hoạch nội dung](RPG-CONTENT-PLAN.md), [lộ trình RM0–RM6](DEVELOPMENT-ROADMAP.md), [nhân vật](CHARACTER-SYSTEM.md), [nhiệm vụ](QUEST-SYSTEM.md), [tu tiên](CULTIVATION-SYSTEM.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md).

**Trọng tâm 11/10:** owner chốt vòng mạnh lên–farm/build–PvE/PvP–sưu tập/hiện diện xuyên chặng. [Kế hoạch](MMORPG-PROGRESSION-PLAN.md) và [hợp đồng Core](MMORPG-SYSTEM-CONTRACTS.md) có bản thiết kế; luật cụ thể và cân bằng chưa khóa. GD20/GD21 nối mục tiêu dài hạn vào pilot nhỏ, không mở toàn MMO trước HN05.

Backlog hiện hành thay tuyến đệ tử P và kết thúc A tại Ngưng Khí tầng 1. [Backlog trước](archive/design-before-three-playable-characters/MVP-BACKLOG.md) giữ ID/tiến độ kỹ thuật và kế hoạch cũ; không dùng Bxx cũ làm luật mới. Các công việc dưới đây chưa được triển khai chỉ bởi biên tập GDD.

## 1. Đã chốt / đã bàn giao

- Chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu.
- Hằng Nhạc chung qua Ngưng Khí; phân hóa sâu sau map nhập môn từ hành trình Trúc Cơ.
- Sáu phần phát triển tu tiên và hướng theo truyện rồi chuyển thể/mở rộng.
- Bộ R01 Kiếm Khí/Lôi Ấn/Ngự Phong Bộ có sẵn cho cả ba khi bắt đầu điều khiển; nhiệm vụ dạy vận dụng, không khóa quyền skill.
- Đợt ART/VFX R01–R05 đã đóng; không mở thêm sản xuất cảnh giới trong bước tài liệu này.
- Hằng Nhạc đã có map/layer, R01, HN01–HN04, tích lũy online và lưu/khôi phục. Catalog locomotion không đại diện toàn bộ cast/động tác mới.
- [Entry E0–E2 local](GAME-ENTRY-BACKEND.md) đã có tài khoản/server/tạo/chọn nhân vật; [hành trang nhập môn](HANG-NHAC-CHARACTER-RUNTIME.md) có hai gear và vật tư thật, giữ HP/MP. Chưa container/loot/kinh tế tổng quát hay MMO sản xuất.

**Ưu tiên hiện tại đã thống nhất:** RM0 chốt hệ thống nhân vật/nhiệm vụ và dữ liệu UI trước mở rộng HN05. RM1 bổ sung nền tối thiểu, RM2 hoàn thành HN05/ngoại vi/M02 rồi RM3–RM4 bình cảnh/pháp khí/khảo nghiệm. Không làm lại HN03–HN04 hoặc entry đã có. Chủ dự án bố trí level/navigation; không sửa blocker đã chốt hoặc mở lại ART cũ. GDxx là hồ sơ thiết kế; chưa xác nhận toàn lát A/B/C.

[Biên bản xóa ART cũ](data/hang-nhac-art-removal-2026-10-08.json) giữ danh sách 203 file. [Map hiện hành](design/world/hang-nhac-map-v1/README.md) đã được owner chốt và tích hợp.

## 2. Đặc tả trước triển khai

[Trải nghiệm v0.4](HANG-NHAC-NGUNG-KHI-SPEC.md), [gameplay v0.3](NGUNG-KHI-GAMEPLAY-SPEC.md) và [tiến trình/phần thưởng v0.2](HANG-NHAC-PROGRESSION-REWARDS.md) có tuyến, bộ chung, nền/15 ngưỡng, vật tư và idle thử. [Đối thủ/HN10 v0.1](HANG-NHAC-ENCOUNTERS-TRIAL.md) bổ sung GD06/GD09/GD10: collider/telegraph/AI, ba pha, checkpoint/reset và pause riêng khi mất mạng. Trạng thái của các phần mở rộng là **đã có đề xuất để đánh giá**, chưa duyệt toàn bộ số liệu/chơi thử/triển khai. GD07 đã có identity/lease/đổi nhân vật local; còn kho chung/chuyển realm/recovery/production. GD12 đã có cast bộ ba/động tác nhiệm vụ, còn enemy/pháp khí theo nhu cầu. GD11 thiết kế tuyến sau map. Không dùng nhãn chung này phủ nhận runtime HN01–HN04 đã có.

| ID | Công việc | Phụ thuộc | Kết quả cần đánh giá |
| --- | --- | --- | --- |
| GD01 | Mở đầu chuyển thể ba nhân vật | GDD | Cả ba chọn từ đầu; không kể họ cùng nhập môn trong canon |
| GD02 | Trạng thái ban đầu và mốc gameplay | GD01 | Tư Đồ Nam giữ kiến thức/cảnh giới truyện, có giới hạn năng lực và tuyến hồi phục rõ |
| GD03 | Tuyến Hằng Nhạc qua Ngưng Khí | GD01, GD02 | Nhiệm vụ chung/đoạn riêng, mốc đầu/cuối, khảo nghiệm cuối và mục tiêu chuẩn bị Trúc Cơ |
| GD04 | Hồ sơ công pháp/thuật/pháp bảo nhập môn | GD02, GD03 | Nguồn/nhãn sáng tạo, điều kiện, tác dụng, giới hạn; cả ba tự chơi được |
| GD05 | Luật sáu phần và một bình cảnh mẫu/người | GD02, GD04 | Quan hệ tu vi/linh lực/công pháp/lĩnh ngộ, cổng mốc, chuẩn bị và xác nhận |
| GD06 | Combat và cân bằng nhập môn | GD04, GD05 | Stat, chi phí/nhịp, đối thủ/hitbox, quyền học; không lấy rìa ART làm vùng damage |
| GD07 | Tài khoản/hồ sơ và quyền chuyển | GD02 | Slot/đổi người/kho chung/tiến trình riêng, lệnh/lưu/khôi phục |
| GD08 | Idle và kinh tế nền | GD05, GD07 | Hoạt động được phép, cap/chi phí/kho; không auto truyện/combat/đại đột phá |
| GD09 | UX mở dần | GD03–GD08 | Chọn ba người, mục tiêu hiện tại, điều kiện thiếu, trạng thái hồi phục dễ hiểu |
| GD10 | Map/NPC và nội dung lặp | GD03, GD06 | Vùng đi lại, phiên khảo nghiệm, quyền thưởng; node truyện cũ không là địa lý đã khóa |
| GD11 | Phân hóa Trúc Cơ đầu | GD04, GD05 | Một lựa chọn/tổ hợp/tuyến riêng có tác dụng thật, thử/chỉnh được |
| GD12 | Ngân sách ART cho cả ba | GD04, GD06, GD09 | Tách asset có sẵn khỏi animation/hướng mới; không tự mở lại gói đã duyệt |
| GD13 | Mô hình nhân vật RPG | GD02, GD04, GD05, nền GD07 | [Bản 0.1](CHARACTER-SYSTEM.md): ownership/state/nguồn stat/mốc/đồ/UI; chốt D01–D03 trước RM1/RM2 |
| GD14 | Khung nhiệm vụ dùng lại | GD03, GD07, GD13 | [Bản 0.1](QUEST-SYSTEM.md): định nghĩa/tiến trình/attempt, credit/thưởng/lifecycle/versioning; không đổi luật HN01–HN04 |
| GD15 | Đặc tả vòng HN05 xuyên hệ thống | GD06, GD09, GD10, GD12–GD14 | Chốt D02–D06: item/M02, failure/reconnect, ngoại vi/transfer, E01 và UI; gate RM2 |
| GD16 | Nghiên cứu và trục truyện/bản sắc | GDD, GD01–GD03 | [Nguồn](XIANXIA-GAME-RESEARCH.md) và [ứng viên sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md) đã viết; chốt D09–D10/ND1, không suy thành canon mới |
| GD17 | Nội dung phát triển xuyên hệ thống | GD04–GD06, GD13–GD16 | [Ma trận/các gói ND2–ND4/ND6](RPG-CONTENT-PLAN.md): mỗi chặng có hành động, thành quả, đồ/năng lực, nguồn–chi và ngân sách; chốt D11 |
| GD18 | Hệ quả và nội dung MMO | GD07, GD10, GD14, GD16 | ND5/D12: choice riêng, một callback nếu chọn; party/farm chung có luật trước RM5, không simulation thế giới vô hạn |
| GD19 | Nguyên liệu/luyện chế và vòng đời pháp bảo | GD04, GD08, GD13, GD15–GD18 | [Nguồn đợt 2](TIEN-NGHICH-CRAFTING-REFERENCES.md), [thiết kế](ITEM-CRAFTING-DESIGN.md), [gói VP/IT](ITEM-PRODUCTION-PLAN.md): nguồn–recipe–nội dung dùng và ngân sách asset, không toàn nghề trước HN05 |
| GD20 | Tiến triển MMORPG xuyên cảnh giới | GD04, GD06, GD08, GD11, GD19 | [Ma trận](MMORPG-PROGRESSION-PLAN.md): mỗi chặng có nguồn sức mạnh, PvE/farm, PvP/nhóm và diện mạo; chọn một pilot RM5-A/B/C theo gate, VP4-A farm không đợi EX hữu hạn |
| GD21 | Core loot/PvP/appearance và vận hành | GD07, GD13–GD15 + scope pilot GD20 | [Contract](MMORPG-SYSTEM-CONTRACTS.md): target damage peer, source/business receipt, schema/codec, public projection và một writer; lỗi/lifecycle/telemetry theo gói, không rewrite auth/framework |

## 3. Lát kiểm chứng đề xuất

| Lát | Mục tiêu | Nghiệm thu |
| --- | --- | --- |
| A | Chọn ba người, nhập môn online hẹp | Hai tài khoản vào Hằng Nhạc, thấy nhau; nhiệm vụ/tu luyện đầu/combat đơn giản; lưu riêng |
| B | Hoàn thiện map Hằng Nhạc | Cả ba hoàn thành Ngưng Khí/hồi phục tương ứng, khảo nghiệm cuối, thưởng/rời map một lần |
| C | Phân hóa sau nhập môn | Công pháp/tổ hợp/tuyến Trúc Cơ khác nhau trong hành động/chuẩn bị |

Đối chiếu roadmap: **RM0–RM1** chuẩn bị nền; **RM2** nghiệm thu lát A từ HN01 tới HN05; **RM3/B1** HN06–HN09; **RM4/B2** HN10–HN12; **RM6/C** phân hóa. RM5 dành cho mở rộng MMO chọn lọc, không ép mọi hoạt động nhóm/kinh tế vào tutorial. Prototype một phần A không được báo xong A/toàn nhập môn. GDxx là công việc thiết kế, không phải ticket runtime đã chạy.

### Hàng đợi gần nhất

1. Đánh giá [bản chương phương án A](HANG-NHAC-CHAPTER-PLAN.md) đã cụ thể hóa GD16/ND1–ND2: graph/thẻ HN05–HN12, nhánh bộ ba, một lựa chọn 2 nhánh. Đạo đồ và dấu niêm là phương án làm việc, chưa mặc định duyệt toàn bộ nội dung.
2. Rà/chốt GD13–GD14/D01–D03 từ [catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) đã chi tiết hóa ND3/phần ND4: nguồn vật phẩm, recipe một instance, nền vận hành/hộ thân, validator/migration. Giữ HN01–HN04/save, chưa khóa balance mới.
3. Chốt D04–D06/GD15 và phần D11–D12 liên quan trước code chuyển cảnh/encounter; ND5–ND6 quy định phạm vi riêng/chung/storyboard và ngân sách. UI/map có thể song song khi hợp đồng đã rõ.
4. Tách ticket RM1: adapter/luật tối thiểu, item, migration/receipt và snapshot; không refactor toàn game hay làm quest editor trước nội dung.
5. Tách ticket RM2: map đích, transfer, E01, thắng/thua, thưởng/M02, lifecycle và chơi thử toàn tuyến. Manh mối HN05 chỉ thêm nếu được chọn, không kéo nhánh điều tra lớn vào trận đầu.

**Nhánh GD19:** nguồn/recipe hậu nhập môn đã có phương án cụ thể và manifest kiểm kế hoạch. IT01–IT04/VP0 nối RM1–RM2; IT05/06 nối HN08; IT07–IT12 là hậu HN12. Chốt thông số/nguồn lặp/asset khi tới gói tương ứng, không đưa tất cả thành blocker cho trận đầu.

**Nhánh GD20/GD21:** sau nền RM2 đủ an toàn chọn một vòng farm tăng năng lực, tỷ thí hoặc hiện diện để kiểm sớm; có thể cùng RM3–RM4. VP4-A tách phần nguồn lặp có nơi tiêu thật, không reset HN/EX. Main quest vẫn hoàn tất solo; farm/đấu người/ngoại hình và nhiều người chung vùng có gate riêng trước thêm ranking/trade/tông môn/tọa kỵ lớn.

**Công cụ biên tập cho GD13–GD15/GD19–GD21:** [taxonomy](GAME-CONTENT-TAXONOMY.md), [control plan](GAME-CONTENT-CONTROL-PLAN.md), [sổ catalog khởi đầu](design/systems/content-registry-v1/README.md) đã kiểm kê nội dung có trạng thái và quan hệ. Bước hiện thực gần nhất là contract/validator/release subset và migration cho HN05, không bật mọi item/quest/mount trong sổ. Source–use/legacy IDs được giữ, sổ không là quest engine hoặc DB mới.

Chưa gán ngày/ước lượng khi các quyết định còn chặn phạm vi. Không tạo thêm bảng cân bằng độc lập; số liệu thử vẫn ở hồ sơ gameplay/tiến trình/encounter và phải đối chiếu hợp đồng runtime trước dùng.

## 4. Trường hợp cần kiểm khi có prototype

Ba lựa chọn đều vào được từ đầu; người chọn giống nhau có save riêng; nguồn truyện không bị đổi do khu chung; không auto mở cảnh giới cao từ ART; tu vi và linh lực khác nghĩa; Tư Đồ Nam không bị viết thành phàm nhân; Lý Mộ Uyển tự combat được; cổng bình cảnh nói rõ phần thiếu; mất mạng/gửi lại không lặp chi phí/thưởng; idle không tự truyện/đột phá; khảo nghiệm cuối không chỉ là check tổng EXP; rời Hằng Nhạc không tự cấp Trúc Cơ.
