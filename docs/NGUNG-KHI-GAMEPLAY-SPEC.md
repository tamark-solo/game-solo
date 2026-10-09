# Hồ sơ gameplay Ngưng Khí — bộ kỹ năng khởi đầu

**Mốc runtime 08/10/2026:** [Hằng Nhạc hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md) đã dùng baseline Kiếm/Lôi/Phong trên mục tiêu luyện cá nhân và lưu SQLite. Đi bộ vẫn 80 px/s theo map hiện hành. Đây chưa là duyệt cân bằng, farm/HN01–HN12 hoặc combat production; các phần dưới giữ trạng thái đặc tả đề xuất.

**Phiên bản:** 0.3 · **Ngày:** 08/10/2026 · **Trạng thái:** thiết kế tài liệu; chưa triển khai client/server.

**Tham chiếu:** [GDD 0.28](GDD.md), [trải nghiệm Hằng Nhạc 0.4](HANG-NHAC-NGUNG-KHI-SPEC.md), [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md), [tu tiên](CULTIVATION-SYSTEM.md), [nhân vật](CHARACTERS.md), [bàn giao ART/VFX](design/vfx/STARTER-VFX-HANDOFF.md).

## 1. Quyết định mới và phạm vi

**Chủ dự án đã đồng ý:** Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển cùng học bộ đã thiết kế làm kỹ năng khởi đầu. Trong map nhập môn, bộ này là **R01 Kiếm Khí, R01 Lôi Ấn và R01 Ngự Phong Bộ**. Ba người có cùng quyền sử dụng từ lúc bắt đầu điều khiển; nhiệm vụ dạy vận dụng, không giữ kỹ năng sau cổng nhiệm vụ hoặc lượt mở khóa nhân vật.

| Nội dung | Trạng thái |
| --- | --- |
| Cả ba có bộ R01 chung làm skill khởi đầu | Đã chốt trong phiên làm việc |
| Có sẵn ba thuật khi bắt đầu điều khiển, hướng dẫn từng thuật sau đó | Quyền khởi đầu đã chốt; nhiệm vụ không là cổng skill |
| R02–R05 không được cấp tự động tại nhập môn | ART đã có/đóng; quyền học, điều kiện và gameplay giai đoạn sau còn cần đặc tả |
| Chức năng/hit, tài nguyên và vận hành combat bên dưới | Thiết kế đề xuất để đánh giá |
| HP, sát thương, chi phí, cooldown, cự ly và các ngưỡng thử | Giá trị thử nghiệm v0.1; chưa phải cân bằng đã duyệt |

Đây là bộ thuật nền của bản chuyển thể, không khẳng định nguyên tác có ba nhân vật cùng học ba thuật này tại Hằng Nhạc. Công pháp, cơ duyên và quyền học truyền thừa về sau vẫn khác nhau. Bộ chung không chia ba người thành class Kiếm/Lôi/Phong.

Tài liệu không sửa PNG/atlas/JSON/timeline đã khóa. Quyền gameplay chung không đồng nghĩa animation nhân vật cả ba đã đủ; cần kiểm kê phần động tác/icon/SFX/hướng còn thiếu trước tích hợp. Ưu tiên sản xuất vẫn là map trước vận hành gameplay theo GDD; baseline bên dưới phục vụ đánh giá sau khi chuyển sang gameplay, chưa là nhiệm vụ tích hợp đang mở.

## 2. Ba hồ sơ nhân vật ở đầu map

| Nhân vật | Trạng thái nhập môn | Bộ hiện dùng được | Phần khác nhẹ |
| --- | --- | --- | --- |
| Vương Lâm | Tu luyện giai đoạn đầu của tuyến đã biên tập | Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 | Lời dẫn quan sát/đấu pháp, đoạn HN06-WL, cơ duyên riêng |
| Tư Đồ Nam | Biểu hiện linh thể bị giới hạn, khôi phục khả năng hiện dùng được | Cùng bộ R01; “học” trong tutorial là khôi phục/thử vận dụng mức này | Lời dẫn hồi phục, HN06-TDN; không xóa kiến thức/cảnh giới truyện |
| Lý Mộ Uyển | Mở đầu gameplay chuyển thể, giữ nhận diện đan–trận | Cùng bộ R01, tự combat được | Chuẩn bị tài nguyên và HN06-LMW; không chỉ hỗ trợ người khác |

Baseline prototype đề xuất dùng cùng thông số chiến đấu và hitbox gameplay cho ba người, không thêm hệ số mạnh/yếu ngầm theo tên nhân vật. Linh thể Tư Đồ Nam vẫn chịu luật va chạm/damage của chế độ này; hình trong suốt không tạo bất tử hoặc xuyên tường. Cách biểu hiện/nguồn neo linh thể còn cần biên tập; không đổi yêu cầu được chọn từ đầu.

Tu vi hoặc tiến triển hồi phục là dữ liệu dài hạn. HP và linh lực dùng trong trận là dữ liệu combat. Cạn linh lực không tụt cảnh giới, bị hạ trong bài luyện không xóa công pháp/thuật đã có. Bộ ba cùng dùng thuật nền không đồng nghĩa cùng công pháp canon hay cùng quyền sở hữu Thiên Nghịch Châu.

## 3. Bộ điều khiển và nhiệm vụ hướng dẫn

Ba thuật xuất hiện trên thanh kỹ năng từ lần đầu vào Hằng Nhạc. Người chơi có thể dùng khi trạng thái/mục tiêu hợp lệ, kể cả chưa tới bài hướng dẫn tương ứng. Hướng dẫn làm nổi thuật đang học nhưng không khóa hai thuật còn lại. Tấn công thường và đi bộ là thao tác nền có sẵn; pháp khí luyện tập vẫn là nội dung HN08 riêng.

| Nội dung | Quyền sử dụng | Nơi hướng dẫn/kiểm chứng |
| --- | --- | --- |
| Đi bộ và tấn công thường | Từ lúc điều khiển | HN01 và bài an toàn HN03 |
| Kiếm Khí R01 | Từ lúc điều khiển | HN03: định hướng, projectile, hit/miss |
| Lôi Ấn R01 | Từ lúc điều khiển | HN03: chọn mục tiêu, vị trí khóa, cửa sổ tránh |
| Ngự Phong Bộ R01 | Từ lúc điều khiển | HN04: thoát vùng/đổi vị trí, đường đi hợp lệ |
| Pháp khí luyện tập | Sau nội dung HN08 | HN08, không thuộc ba skill khởi đầu đã chốt |
| Luyện tích hợp | Không cấp lại ba thuật | HN09: phối hợp thuật, linh lực và pháp khí |

Không cần tấn công NPC hoặc người chơi ở cổng để thử skill: vị trí không có mục tiêu hợp lệ chỉ trình bày theo chính sách cast/miss, không phát damage. Khu an toàn không bật PvP bởi người chơi có sẵn Lôi/Kiếm. Nút “có kỹ năng” tách khỏi lý do tạm không dùng được: thiếu linh lực, cooldown, đang thi triển, bị hạ hoặc vị trí/mục tiêu không hợp lệ.

Trong bài hướng dẫn an toàn có hồi nguồn lực thử lại theo luật phiên luyện. Dùng thuật trước nhiệm vụ không tự hoàn thành mọi bài sau; mỗi nhiệm vụ kiểm thao tác trong đúng bài đã nhận. Không xóa kỹ năng khi rời sân luyện, mất mạng hoặc xem lại nhiệm vụ. Quyền dùng gắn với thuật gameplay và hồ sơ, không gắn với tên clip Vương Lâm/hướng đông; thiếu animation một hướng là việc ART, không là điều kiện unlock sản phẩm.

## 4. Baseline thử nghiệm chung

Các số dưới đây là điểm xuất phát để đo nhịp combat, không lấy từ canon hoặc tự suy từ màu/cỡ VFX. Đơn vị cự ly là world px ở world tham chiếu 960×640; zoom màn hình không đổi cự ly gameplay.

| Thông số | Giá trị thử v0.1 | Phạm vi / lưu ý |
| --- | --- | --- |
| HP tối đa | 100 | Chung ba người trong lát kiểm chứng đầu |
| Linh lực tối đa | 100 | Nguồn dùng thuật; khác tu vi |
| Sức mạnh tấn công nền | 10 | Cơ sở tính coefficient; chưa thêm crit/xuyên giáp/resist trong bài thử |
| Tốc độ đi bộ | 160 world px/giây | Không phải tốc độ đã tích hợp; cần đối chiếu map/renderer |
| Tấn công thường | 1.0 × sức mạnh; 0 linh lực | Cự ly thử 90 world px, hồi giữa đòn 0.8 giây; animation còn cần đặc tả |
| Hồi linh lực trong combat | 4/giây | Từ 2 giây sau cast tiêu linh lực gần nhất; không hồi thêm theo FPS/tab |
| Hồi linh lực ngoài combat | 12/giây | Sau 3 giây không nhận/gây damage; không cộng cả hai tốc độ |
| Hồi HP trong thử luyện | Tại điểm chuẩn bị/luật phiên | Không thêm regen HP thụ động trong trận ở baseline này |

Định nghĩa ngoài combat còn kiểm đối thủ đang giao chiến; chạy khỏi vùng sát thương vài giây không tự chuyển sang hồi ngoài combat khi encounter vẫn hoạt động. Hồi linh lực trong combat dừng/đổi theo trạng thái hợp lệ, không áp cho người đã bị hạ. Hồi HP sau trận và vật tư ngoài tutorial cần hồ sơ kinh tế riêng.

Damage mẫu = sức mạnh nền × coefficient của đòn hợp lệ, mỗi hit được xác nhận một lần. Đây là công thức thử đơn giản, không là mô hình mọi cảnh giới hoặc PvP. [Hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất bước stat tại M02/M03/M04; bảng ở đây là đầu map, không bảo toàn Ngưng Khí đều HP 100. Ngưỡng/mức tăng stat chưa khóa.

## 5. Kiếm Khí R01 — đòn định hướng

**Vai trò:** đánh theo hướng, dễ hiểu, dùng để giữ khoảng cách và vận dụng đều. Cả ba có cùng chức năng nền.

| Thuộc tính | Đề xuất gameplay v0.1 |
| --- | --- |
| Đầu vào | Hướng thi triển hợp lệ; khóa hướng khi cast được chấp nhận |
| Đường đánh | Projectile thẳng, kiểm va chạm từ gốc thi triển của actor |
| Hiệu lực | 3.0 × sức mạnh; tối đa một mục tiêu/một cast; không xuyên ở R01 |
| Linh lực / cooldown | 10 / 1.5 giây, tính từ lúc cast được máy chủ chấp nhận |
| Cự ly / tốc độ thử | Tổng cự ly 360 world px từ gốc; tốc độ 480 world px/giây |
| Va chạm thử | Bán kính projectile 12 world px; dùng collider đối thủ, không dùng rìa glow |
| Hướng đối phó | Rời đường đánh/giữ vật cản; không tự bám mục tiêu |
| Kết thúc | Hit mục tiêu hợp lệ, chạm vật cản hoặc hết cự ly; miss không có impact hit |

Các số tốc độ/cự ly giống thông số preview nhưng ở đây chỉ là ứng viên gameplay. Preview có `initialTipAhead: 100`; không cộng thêm 100 vào tầm đánh hoặc cho projectile nhảy qua mục tiêu gần. Khi tích hợp phải bind tip/anchor artwork theo projectile host và kiểm va chạm từ gốc; không sao chép vị trí mô phỏng preview thành luật combat.

Mục tiêu phụ/kiếm trang trí không tạo hit phụ. Không có phản ứng phá bia đá mặc định. R01 giữ một lần giải quyết projectile; biến thể xuyên/đa kiếm là việc thiết kế sau nhập môn.

## 6. Lôi Ấn R01 — áp lực tại điểm đã khóa

**Vai trò:** đòn đơn mục tiêu mạnh hơn, tiêu linh lực nhiều và cần chọn thời điểm. Vòng ấn là tín hiệu trình bày/vị trí, không tự tạo AoE.

| Thuộc tính | Đề xuất gameplay v0.1 |
| --- | --- |
| Đầu vào | Một mục tiêu đối địch hợp lệ trong cự ly; không chọn NPC/người chơi ở khu an toàn |
| Khóa | Tới release, chụp vị trí mục tiêu đã chọn; sau đó không tự bám vị trí mới |
| Hiệu lực | 4.5 × sức mạnh, tối đa một mục tiêu/một cast; không stun/chain mặc định |
| Linh lực / cooldown | 25 / 5 giây, tính từ lúc cast được chấp nhận |
| Cự ly thử | Mục tiêu trong 280 world px từ actor khi nhận cast; kiểm lại lúc release |
| Cửa sổ hit thử | Resolve ở thời điểm máy chủ đã định; hit nếu collider mục tiêu đã chọn còn trong vùng kiểm tra bán kính 24 world px quanh điểm khóa và đủ điều kiện |
| Hướng đối phó | Rời điểm khóa trước resolve, dùng khoảng cách/vật cản theo hồ sơ |
| Miss | Không damage; không dựng `hitConfirmed` giả để chạy bolt/impact trúng |

Vùng kiểm tra 24 world px dùng để xét **mục tiêu đã chọn**, không quét damage mọi người đứng trong vòng sáng. Mục tiêu khác đi vào vòng không nhận đòn thay; nếu mục tiêu đã bị hạ/ra khỏi phạm vi hợp lệ thì cast giải quyết miss. Không tự chuyển target sau release.

Nguồn ART hiện hành là pilot đơn mục tiêu, bolt khởi chạy khi hit host được xác nhận, impact theo contact trình bày. Cảnh miss/resolve không trúng cần hồ sơ presentation adapter trước tích hợp; chưa có một bộ bolt miss mới được duyệt. Không đổi source đã khóa để gọi bản này là AoE. Đa mục tiêu/Liên Lôi là năng lực giai đoạn sau và cần hồ sơ riêng.

## 7. Ngự Phong Bộ R01 — đổi vị trí

**Vai trò:** thoát vùng báo đòn, tìm góc đánh hoặc tiếp cận. Hiệu lực nằm ở movement, không ở tàn ảnh.

| Thuộc tính | Đề xuất gameplay v0.1 |
| --- | --- |
| Đầu vào | Hướng di chuyển, mục tiêu cuối do host kiểm đường đi |
| Hiệu lực | Lướt tối đa 160 world px; không gây damage |
| Linh lực / cooldown | 10 / 3 giây, tính từ lúc cast được chấp nhận |
| Thời gian lướt thử | 0.25 giây kể từ host bắt đầu movement, chưa phải quyền teleport |
| Va chạm | Dừng tại điểm hợp lệ trước vật cản; không xuyên tường/cổng/chuyển map |
| Miễn nhiễm | Không có invulnerability mặc định; đối thủ vẫn hit theo vị trí host |
| Tàn ảnh | Snapshot trình bày, không collider/actor phụ hoặc decoy AI |
| Arrival | Theo điểm cuối và timestamp host; không theo frame client tự hết |

Nếu đường không có đoạn đi hợp lệ, lệnh bị từ chối trước nhận cast và không trừ linh lực/cooldown. Nếu cast đã được nhận nhưng dừng ngắn do thay đổi va chạm, giữ chi phí đã nhận và báo arrival ở điểm thực tế. Quy tắc này cần prototype bảo đảm đọc được, không lấy số travel minh họa trong preview làm movement authority.

## 8. Timeline frame-by-frame và quyền gameplay

Metadata ART dùng 24 FPS, frame tác giả từ 1. Thời gian tương ứng của một frame là **(frame − 1) / 24**, theo clock của cast được chấp nhận. Đây là quy đổi cho thiết kế/adaptor, không yêu cầu server chạy 24 tick hoặc client render 24 FPS.

| Skill | Event đã có trong source | Việc host/adaptor phải làm |
| --- | --- | --- |
| Kiếm Khí | F01 cast.start; F07 release; F10 recovery.start; F17 character.end | Spawn/di chuyển projectile theo định nghĩa combat; hit xảy ra khi va chạm, không mặc định ở một frame cố định |
| Lôi Ấn | F01 cast.start; F07 telegraph.start; F09 release; F15 recovery.start; F18 character.end | Chốt mục tiêu/điểm, lên lịch resolve; gửi hit/miss có định danh; vòng sáng không quyết định damage |
| Ngự Phong Bộ | F01 cast.start; F05 movement.request; F11 recovery.start; F15 character.end | Nhận/kiểm movement, phát snapshot/arrival; F11 không tự xác nhận đã tới đích |

Lôi preview giả lập confirm tại F13. Đề xuất thử resolve ở t = 0.5 giây từ cast start để đánh giá nhịp đầu, tương ứng F13 khi clock chuẩn; đây là **giá trị gameplay thử riêng**, không sao chép `preview.confirmFrame` làm authority. Khi đổi resolve, adapter phải giữ báo đòn và lớp strike/contact khớp kết quả host.

Lôi có strike lead 2 frame/contact lag khoảng 83 ms trong source. Damage ghi ở thời điểm resolve máy chủ; contact/impact trình bày không cộng thêm damage hoặc kéo lùi resolve. Kiếm/Phong cũng không lấy `preview.hitDelayFrames`, `arrivalFrame` hay render completion làm kết quả thực.

Nguồn metadata đối chiếu: [Kiếm](design/vfx/frame-by-frame-r01/skill.json), [Lôi](design/vfx/r01-thunder-v1/skill.json), [Phong](design/vfx/r01-wind-v1/skill.json). Các nhãn pending trong metadata source được giữ theo thời điểm sản xuất; trạng thái duyệt gói theo [bàn giao](design/vfx/STARTER-VFX-HANDOFF.md). Cả ba vẫn ghi `runtimeReady: false` trong source, không phải combat đã tích hợp.

## 9. Luật cast, tiêu hao và hủy

Baseline đề xuất không chồng hai cast của cùng actor. Lệnh chỉ được nhận khi có quyền dùng, còn hoạt động, đủ linh lực/cooldown và đầu vào hợp lệ. Trừ chi phí/bắt đầu cooldown một lần ở cast được chấp nhận; lệnh bị từ chối không gây tiêu hao. Client hiển thị lý do, không tự tạo damage/arrival vì đã bấm nút.

Kiếm/Lôi: giữ vị trí trong windup; một lệnh di chuyển mới trước release hủy đòn, chi phí/cooldown đã nhận vẫn giữ. Input đi bộ đang giữ trước lúc cast không tự tạo hủy ngoài ý muốn. Cast bị hủy phát trạng thái kết thúc, dọn charge/telegraph và không chạy release/hit đã hủy. Từ recovery.start cho đi bộ; chỉ nhận cast kế khi character.end hoặc cast trước đã kết thúc do hủy. Đây là quy tắc thử, phải đánh giá cảm giác điều khiển trong HN03/04 trước khóa.

Phong: host sở hữu đường lướt; không sửa hướng giữa một lần đã nhận ở baseline. Từ recovery có thể đi thường tại vị trí thực; cast kế chờ kết thúc trạng thái cast. Bị hạ trước release ngăn phần gameplay chưa xảy ra; projectile đã release phải có luật tồn tại/expiry trong hồ sơ combat, không biến thành hit vì animation vẫn chạy.

Không có crit ngẫu nhiên, stun/interrupt hay giảm cooldown riêng từng nhân vật ở baseline. Khi bổ sung status, cần xác định tác động lên windup/projectile/movement và cơ chế hủy; không chỉ thêm lớp VFX.

## 10. Công pháp, tu luyện và mức tăng trưởng

Quyền dùng ba thuật khởi đầu không yêu cầu sở hữu công pháp/đan/pháp bảo hiếm. HN02 hướng dẫn nền vận hành/hồi phục hợp với từng người; tên công pháp là nội dung cần biên tập, không gán một công pháp canon mới chỉ để giải thích preset.

| Mốc trải nghiệm | Tiến triển cần thiết kế | Không tự cấp |
| --- | --- | --- |
| M01 | Hiểu tích lũy và nguồn lực hiện dùng | Ba thuật vốn đã có; không coi HN02 là mở quyền cả bộ |
| M02 | Tự vận dụng nền trong trận nhỏ | Skill mới hoặc đổi class |
| M03 | Giải bình cảnh, hiểu luyện hóa/chuẩn bị, hoàn tất HN09 tại ngưỡng 9 đề xuất | R02 hoặc ý cảnh/linh ảnh cảnh giới cao |
| M04 | Năng lực ổn định, qua khảo nghiệm và đủ điều kiện xuất hành | Trúc Cơ khi qua cổng |

[Hồ sơ tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) đối chiếu 15 tầng và đề xuất ngưỡng, nền 1–3/4–9/10–15, bước stat, pháp khí và vật tư; chi tiết chưa duyệt. HN07 mở cổng nền 4–9 bằng vận dụng/hiểu biết, HN09 mở 10–15 sau bài tích hợp tại ngưỡng 9; không khóa ba skill có sẵn. Tư Đồ Nam dùng mốc hồi phục tương ứng, không học lại lịch sử cảnh giới.

Sau Hằng Nhạc có thể giữ bộ nền như lựa chọn rồi mở biến thể/tuyến riêng. Không tự thay toàn bộ skill bằng R02 chỉ vì có asset; điều kiện nâng cấp, chuyển/giữ skill, slot và tương thích công pháp sẽ do hồ sơ Trúc Cơ xác định.

## 11. Encounter dùng để cân bằng đầu

| Mẫu thử | Thông số thử / hành vi | Mục đích |
| --- | --- | --- |
| E01 áp sát | HP 60; damage 10; báo đòn 0.8 giây, có khoảng nghỉ sau đánh | Thấy hai Kiếm hợp lệ đủ hạ mục tiêu; biết né và có thể thắng bằng đòn thường |
| E02 thi triển | HP 80; damage 15; báo đòn vùng 1 giây, vị trí cố định trong pha thi triển | Thử Lôi tại điểm đã khóa, Phong/đi bộ thoát vùng; không cần stun mới thắng |
| E03 chủ khảo | HP 240; damage thường 15; luân phiên áp sát/thi triển có báo rõ | Đo nhịp tổng hợp, linh lực và độ đọc trận; không chỉ kéo dài HP |

Đây là điểm xuất phát cho HN-E01/02/03, chưa phải danh tính/quái canon hoặc encounter đã tạo. [Hồ sơ đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đã đề xuất collider, mask/warning, chu kỳ AI, chủ khảo đổi nhịp, ba pha/checkpoint và nhịp phản công. Các giá trị còn cần đánh giá/prototype; không coi bảng stat hoặc tài liệu là combat đã hoàn thành.

Đòn thường không tiêu linh lực giữ đường thắng khi dùng thuật chưa tốt. Vật tư thử luyện có cách nhận lại/hồi phục tại chuẩn bị; không thêm yêu cầu trả phí hoặc farm bắt buộc để luyện ba skill đã có. Khi đánh giá, kiểm cả cách phối hợp và cách chơi an toàn bằng nền, tránh ép một combo duy nhất.

## 12. Online, lưu quyền và ART cho bộ ba

Mỗi hồ sơ được khởi tạo quyền R01 một lần. Đăng nhập lại, đổi phòng hoặc nhìn người khác học không nhân quyền/thưởng. Mất mạng không thu hồi bộ khởi đầu; trạng thái cooldown/tài nguyên theo kết quả máy chủ. Lưu quyền skill không là nhập save client để mở R02–R05.

Damage, movement và phần thưởng theo server. Hit/miss có castId và định danh giải quyết; projectile Kiếm không hit lặp, Lôi không resolve lặp, Phong không arrival hai lần gây mở thêm tác dụng. Nhiều tab không tăng hồi linh lực hoặc làm cooldown chạy nhanh hơn.

VFX dùng bộ R01 hiện có, giữ cỡ world/anchor/layer và impact tại điểm hit thật. Khác biệt đầu map nằm ở actor, lời dẫn và đoạn cá nhân; không cần đổi màu để giả thành ba bộ skill mới. Clip actor Vương Lâm không dán lên Tư Đồ Nam/Lý Mộ Uyển: tách FX dùng lại khỏi animation/socket actor cần làm phù hợp. Không mirror tùy tiện cả người để tạo mọi hướng; phải kiểm nhận diện, tay thi triển và anchor.

Những phần cần kiểm kê trước production: động tác cast/đi/attack của cả ba và các hướng, clip phù hợp Tư Đồ Nam, icon/SFX, telegraph/miss, attachment pháp khí, tùy chọn camera và VFX người khác. Gói ART đã duyệt giữ nguyên; tài liệu này không mở đợt vẽ hoặc sửa source.

## 13. Kiểm chứng và hồ sơ cần bổ sung

Các tình huống cần chơi thử/kiểm khi triển khai: cả ba dùng được ba skill trước HN03; tutorial không cấp quyền lần nữa; Kiếm hit gần không bị bỏ qua bởi offset artwork; miss không damage; Lôi chỉ một mục tiêu và không đổi target; Phong không xuyên cổng/vật cản hoặc miễn nhiễm; cooldown/linh lực đúng khi hủy/mất mạng; projectile/impact không hit thêm theo FPS; cạn linh lực vẫn chơi được; HN07 không khóa bộ đã có; rời map không cấp skill cao.

Đo thời gian hạ mục tiêu, tỉ lệ trúng/miss, mức dùng linh lực, khoảng chờ, khả năng đọc telegraph và cảm giác điều khiển trên viewport nhỏ. So sánh ba actor cùng baseline để tìm chênh lệch do animation/anchor, trước khi thêm chỉ số riêng. Không coi dữ liệu giả lập là bằng chứng game đã cân bằng.

[Tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) và [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đã có bản đề xuất nền/stat, pháp khí, idle, collider/AI/ba pha. Tiếp theo cần đánh giá giá trị/input/timing/đường né, hoàn thiện hợp đồng phiên/tick/lưu và kiểm ngân sách animation bộ ba/enemy. Backlog GD04/GD06 có bản cơ sở, còn cần hồ sơ kỹ thuật/chơi thử; chưa hoàn thành runtime.
