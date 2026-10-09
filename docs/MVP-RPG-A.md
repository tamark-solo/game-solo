# MVP RPG — nhập môn Hằng Nhạc theo GDD 0.28

**Phiên bản:** RPG-A 2.0 · **Ngày:** 08/10/2026 · **Trạng thái:** tổng hợp phạm vi hiện hành; các lát gameplay là đề xuất, chưa triển khai hoặc nghiệm thu.

**Chuẩn:** [GDD 0.28](GDD.md), [trải nghiệm Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md), [backlog thiết kế](MVP-BACKLOG.md). Bản này thay RPG-A 1.0 ngày 07/10 với đệ tử riêng, Q01–Q10 và điểm kết thúc tầng 3. [Nguyên bản 1.0](archive/design-before-three-playable-characters/MVP-RPG-A.md) giữ để đối chiếu; số liệu/ID cũ không tự thành luật của tuyến ba nhân vật.

## 1. Hướng đã chốt

| Phần | Quyết định hiện hành |
| --- | --- |
| Trải nghiệm | MMORPG web có khám phá, nhiệm vụ, chiến đấu chủ động và tu luyện idle hỗ trợ |
| Chọn nhân vật | Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển có sẵn từ đầu |
| Nhập môn | Cùng học nền gameplay tại Hằng Nhạc, tiến triển qua Ngưng Khí; không kết thúc toàn map ở tầng 1 hoặc tầng 3 |
| Bộ khởi đầu | Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 dùng được từ lúc bắt đầu điều khiển; tutorial dạy vận dụng |
| Phát triển | Cảnh giới, công pháp, thuật pháp, pháp bảo, lĩnh ngộ và hành trình cá nhân |
| Phân hóa | Dấu nhận diện nhẹ tại nhập môn; công pháp/tổ hợp/tuyến riêng sâu hơn từ hành trình Trúc Cơ |
| Online | Máy chủ xác nhận tiến trình, tài nguyên, vị trí và kết quả hợp lệ; hợp đồng tài khoản/lưu gameplay còn cần đặc tả |
| ART | Nhân vật pixel chibi, nền stylized 2D/top-down ba phần tư; UI/truyện tranh mực–giấy cổ |

Mở đầu chung là chuyển thể game. Không kể ba người cùng nhập môn trong nguyên tác; Tư Đồ Nam biểu thị hồi phục khả năng hiện dùng được, giữ kiến thức/cảnh giới truyện. Lý Mộ Uyển tự hoàn thành tuyến bắt buộc được. Thiên Nghịch Châu thuộc hành trình riêng Vương Lâm, không là phần thưởng chung hoặc điều kiện dùng bộ R01.

## 2. Ưu tiên hiện tại: map trước vận hành gameplay

Hoàn thiện map trước đặc tả vận hành theo [GDD](GDD.md). Chủ dự án tự bố trí map, layer và vùng đi/chặn trong editor; trợ lý tạo asset rời/phát triển công cụ theo [quy tắc xây map](MAP-BUILDING-GUIDE.md).

ART Hằng Nhạc v1/v2/v3 và hai bản thử vùng đi đã [xóa theo yêu cầu mới](MAP-ASSETS-RESET.md). Chờ chủ dự án đưa kế hoạch map mới trước khi sản xuất tiếp. Bố cục 2400 × 1800 và kích thước trong [layout](HANG-NHAC-MAP-LAYOUT.md) chỉ giữ làm tham chiếu, không khóa map mới hoặc thay bản lưu của chủ dự án. [Thư viện Map Editor](design/world/map-asset-library/README.md) vẫn trống; editor, nhân vật và VFX được giữ.

Các lát dưới đây dùng để lập kế hoạch khi chuyển sang gameplay, không đổi ưu tiên map hoặc tự mở sản xuất nhiệm vụ/combat/loot/đột phá.

## 3. Vòng chơi và tuyến nhập môn đề xuất

**Mục tiêu → khám phá/nhiệm vụ/chiến đấu → tài nguyên hoặc tri thức → tu luyện/luyện thuật/luyện hóa → bình cảnh → chuẩn bị/khảo nghiệm → vượt mốc hoặc hồi phục → hành trình tiếp.**

| Tuyến HN đề xuất | Điều cần học | Kết quả cần đánh giá |
| --- | --- | --- |
| HN01–HN02 | Danh tính/trạng thái, điều khiển, nguồn lực và nền vận hành | Hiểu mục tiêu đầu; bộ R01 vốn có không được cấp lại |
| HN03–HN05 | Định hướng Kiếm, mục tiêu/điểm khóa Lôi, đổi vị trí bằng Phong/đi bộ, trận nhỏ | Tự vận dụng nền combat; có đường chơi solo cho cả ba |
| HN06–HN09 | Đoạn riêng nhẹ, bình cảnh, chuẩn bị/luyện hóa và bài phối hợp | Biết phần còn thiếu và cách giải; giữ khác biệt nhân vật |
| HN10–HN12 | Khảo nghiệm cuối, tổng kết và chủ động xuất hành | Lưu kết quả/thưởng một lần; biết mục tiêu riêng sau map |

HN01–HN12 là ID thiết kế, chưa là tuyến runtime. Phân bổ hết 15 tầng và các mốc 1/3/9/15 được đề xuất tại [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), chưa duyệt chi tiết phạm vi/ngưỡng/thời lượng. Rời Hằng Nhạc không tự cấp Trúc Cơ hoặc R02–R05.

## 4. Các lát kiểm chứng đề xuất

| Lát | Phạm vi | Điều cần kiểm |
| --- | --- | --- |
| A — Nhập môn online hẹp | Ba lựa chọn, một phần Hằng Nhạc, nhiệm vụ/tu luyện đầu và combat đơn giản | Hai tài khoản thấy nhau, tiến trình riêng; cả ba vận dụng được nền |
| B — Hoàn thiện Hằng Nhạc | Tuyến Ngưng Khí/hồi phục, bình cảnh, pháp khí nền và khảo nghiệm cuối | Cả ba hoàn thành; thưởng/xuất hành nhất quán |
| C — Phân hóa sau nhập môn | Chuẩn bị Trúc Cơ, công pháp/tổ hợp và hành trình riêng | Khác biệt đổi hành động/lựa chọn, thử/chỉnh được hướng đầu |

Số map, nhiệm vụ, lịch triển khai, quy mô phòng và lát A cụ thể còn mở. Mục tiêu thử tải 8 client, 5 khu/1 hang, 4 loại quái/1 tinh anh/1 boss, túi 24 ô và 2 loại tiền của RPG-A 1.0 là phạm vi lịch sử; không dùng làm nghiệm thu hiện hành. Một lát nhỏ kết thúc ở tầng đầu không được báo hoàn tất Hằng Nhạc.

## 5. Hồ sơ cần dùng khi đặc tả gameplay

| Hồ sơ | Phần đã xác định | Phần còn đề xuất/cần kiểm chứng |
| --- | --- | --- |
| [Gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md) | Quyền R01 chung từ đầu | Input, hit/miss, cự ly, cast/cancel, linh lực, cooldown và cân bằng |
| [Tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) | Áp dụng khung tu tiên và tuyến HN | 15 ngưỡng, stat, nền, vật tư, pháp khí, cap offline thử 30 phút |
| [Đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) | Cần khảo nghiệm vận dụng, có đường solo | HN-E01/02/03, AI/telegraph, ba pha, checkpoint, timeout/pause |
| [Kịch bản nhập môn](STARTER-STORY.md) | Ba nhân vật từ đầu và ranh giới chuyển thể | Lời dẫn, danh tính NPC, nguồn neo linh thể, thoại/chương cụ thể |
| [Online](ONLINE-DIRECTION.md) | Máy chủ sở hữu trạng thái hợp lệ | Tài khoản/slot/đổi người/kho chung, lệnh/lưu/khôi phục, phiên/credit |

Idle tiếp tục hoạt động đã chọn theo điều kiện hợp lệ; không tự truyện, combat, lĩnh ngộ then chốt hoặc đại đột phá. Stat/công thức và luật thử trong các hồ sơ trên chưa là cân bằng production. Tổ đội/PvP/giao dịch/kinh tế cần hồ sơ riêng, không là điều kiện hoàn tất nhập môn.

## 6. ART, bản thử và dữ liệu lịch sử

Đợt ART R01–R05 đã đóng: 15 skill, 646 PNG, 76 atlas theo [bàn giao](design/vfx/STARTER-VFX-HANDOFF.md). Có ART cảnh giới cao không cấp quyền gameplay tương ứng. Animation chủ yếu dùng Vương Lâm; cần kiểm ngân sách/hướng/socket/động tác cả ba trước tích hợp combat, giữ trạng thái duyệt từng gói.

Client/backend hiện có vẫn là preview ART/chuyển động và phòng online tối thiểu theo [runbook](PREVIEW-RUNBOOK.md) và [hợp đồng preview](BACKEND-PREVIEW.md). Không suy rằng chọn ba người, nhiệm vụ, chiến đấu, tu luyện, tài khoản và lưu lâu dài đã được triển khai.

[mvp-rpg-content.json](data/mvp-rpg-content.json) giữ ID/map/đối thủ/đồ/Q01–Q10/số liệu của RPG-A 1.0. Một phần dữ liệu map được bản starter preview dùng qua `shared/starter-region.ts`; giữ tương thích và số liệu nguyên bản, không coi đó là catalog gameplay HN01–HN12. [Catalog idle](data/mvp-content-catalog.json) và [save minh họa](data/mvp-save-example.json) cũng là tham chiếu lịch sử, không là hợp đồng máy chủ hiện hành. Việc viết lại tài liệu không nâng trạng thái runtime của các dữ liệu này.
