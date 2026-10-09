# GDD — Tiên Nghịch: MMORPG Tu Tiên

**Phiên bản:** 0.28 · **Ngày:** 08/10/2026 · **Tên dự án:** tên làm việc nội bộ.

Người chơi chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển ngay từ đầu**, cùng trải qua map nhập môn **Hằng Nhạc và giai đoạn Ngưng Khí**, sau đó phát triển con đường riêng từ hành trình **Trúc Cơ** trở đi. Game là MMORPG web có chiến đấu chủ động, khám phá, nhiệm vụ và tu luyện idle. Cốt truyện Tiên Nghịch làm nền; cách tổ chức ba nhân vật cùng nhập môn là chuyển thể của game.

GDD này thay hướng “tạo đệ tử riêng, Vương Lâm là NPC trung tâm” và phạm vi “kết thúc tại Ngưng Khí tầng 1” của bản trước. [Bản cũ](archive/design-before-three-playable-characters/GDD.md) được giữ làm lịch sử. Lần biên tập này không triển khai gameplay hay thay các gói ART đã khóa.

**Trạng thái code 08/10/2026:** nền map owner, ba hồ sơ/R01 và [NPC/HN01–HN02/thổ nạp online](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử. Số liệu vẫn baseline; HN03–HN12, map farm/khảo nghiệm riêng, offline và đăng nhập sản xuất còn tiếp tục. Trạng thái code không biến toàn bộ đề xuất GDD thành tính năng đã hoàn tất.

## 1. Quyết định đã chốt và phần còn thiết kế

| Nội dung | Hướng hiện hành | Trạng thái |
| --- | --- | --- |
| Thể loại/nền tảng | MMORPG tu tiên có idle, trình duyệt web | Đã chốt |
| Nhân vật | Vương Lâm / Tư Đồ Nam / Lý Mộ Uyển đều chọn được từ đầu | Đã chốt; không chờ arc sau mới mở lựa chọn |
| Map đầu | Hằng Nhạc, học game và tiến triển qua Ngưng Khí | Đã chốt |
| Chia cảnh Hằng Nhạc | Khu môn phái sinh hoạt/chuẩn bị → map ngoại vi farm riêng; khảo nghiệm vào phiên riêng | Chủ dự án chốt 08/10/2026; chưa triển khai chuyển cảnh hoặc khóa loot/spawn |
| Phân hóa | Nền nhập môn chung, dấu nhận diện nhẹ; phân hóa sâu sau map đầu, từ Trúc Cơ | Đã chốt về hướng; kỹ năng cụ thể chưa khóa |
| Skill khởi đầu | Cả ba có Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 khi bắt đầu điều khiển | Đã chốt bộ chung; tutorial dạy vận dụng, không giữ quyền skill sau nhiệm vụ |
| Tu tiên | Cảnh giới, công pháp, thuật pháp, pháp bảo, lĩnh ngộ, hành trình cá nhân | Đã chốt khung; luật chi tiết là thiết kế cơ sở để đánh giá |
| Truyện | Theo nền nguyên tác rồi mở rộng; ghi rõ sáng tạo/chuyển thể | Đã chốt |
| ART | Pixel art chibi, nền stylized 2D, top-down ba phần tư; portrait/truyện/UI tranh mực và giấy cổ | Giữ quyết định hiện có |
| VFX | PNG frame-by-frame 24 FPS; bộ Kiếm/Lôi/Phong có tới Hóa Thần | Đợt ART đã duyệt/đóng; không phải gameplay đã tích hợp |
| Online | Máy chủ sở hữu tiến trình, tài nguyên, vị trí và kết quả hợp lệ | Giữ hướng online; đặc tả nghiệp vụ còn cần hoàn thiện |
| Công nghệ | TypeScript + Three.js; backend thử TypeScript + Node.js + Colyseus | Đã chọn cho preview/bản thử |
| Hồ sơ nhân vật | Một nhân vật điều khiển tại một thời điểm; tiến trình gắn với hồ sơ | Thiết kế cơ sở; số slot/đổi nhân vật/phần dùng chung chưa chốt |
| Cân bằng và nội dung chi tiết | Phân bổ tầng vào map, chi phí, stat, thời lượng, đối thủ, nhiệm vụ và phần thưởng | Có bảng thử ở hồ sơ tiến trình; chưa chốt, không kế thừa tự động số liệu cũ |
| Tổ đội/PvP/kinh tế | Hoạt động online và phối hợp theo nhân vật/cảnh giới | Mục tiêu; phạm vi bản đầu còn cần đặc tả |

“Đã chốt hướng” không đồng nghĩa tính năng đã triển khai. Bảng số liệu và quy tắc mới chỉ được khóa sau đặc tả, prototype và đánh giá.

## 2. Trải nghiệm cốt lõi

Người chơi nhận ra mình đang điều khiển ai, hiểu bình cảnh và chủ động chuẩn bị để vượt qua. Công pháp, pháp bảo hoặc lĩnh ngộ mới làm thay đổi cách chơi, không chỉ tăng một con số chiến lực.

Nguyên tắc:

1. **Nhập môn dễ hiểu:** dạy từng hệ thống qua nhiệm vụ; không đưa nhiều cây kỹ năng và sáu thanh tích lũy ngay đầu game.
2. **Cảnh giới đổi khả năng:** đại cảnh giới mở cách vận dụng mới, không chỉ nhân HP/sát thương.
3. **Bản sắc nhân vật:** chung khung tu luyện nhưng khác cơ duyên, trạng thái và cách giải bình cảnh.
4. **Lựa chọn có tác dụng:** tổ hợp công pháp–thuật–pháp bảo có đánh đổi; lựa chọn đầu tiên thử/chỉnh được trước đầu tư sâu.
5. **Idle hỗ trợ chơi trực tiếp:** tích lũy và chuẩn bị; truyện, khảo nghiệm, lĩnh ngộ then chốt và đột phá cần tương tác.
6. **Nội dung đi trước mở khóa:** có ART không tự cấp hiệu lực kỹ năng/cảnh giới.

## 3. Ba nhân vật và ranh giới chuyển thể

### 3.1. Lựa chọn từ đầu

Màn chọn có cả ba, giới thiệu danh tính, trạng thái nhập môn và hướng phát triển về sau. Không bắt hoàn thành Vương Lâm để mở hai người còn lại. Không mặc định gacha, nhân vật trả phí hoặc đổi nhân vật tự do giữa trận.

| Nhân vật | Hằng Nhạc: chung nền, khác nhẹ | Sau nhập môn: hướng thiết kế, chưa phải danh sách thuật đã duyệt |
| --- | --- | --- |
| Vương Lâm | Học dùng linh lực, thuật cơ bản, quan sát và khảo nghiệm; cơ duyên châu ở mốc riêng | Đấu pháp, thần thức, cấm chế, lĩnh ngộ và truyền thừa theo truyện |
| Tư Đồ Nam | Linh thể bị hạn chế hiện diện/thi triển; dùng phần năng lực hiện có để học thao tác chung | Khôi phục trạng thái, năng lực và quyền tiếp cận thuật pháp |
| Lý Mộ Uyển | Tự chiến đấu được; dấu nhận diện nhẹ qua dược liệu, đan hoặc phù/trận đơn giản | Đan–trận, chuẩn bị chiến đấu, bảo vệ/kiểm soát khu vực và phối hợp |

Không khóa ba người thành kiếm sĩ / pháp sư lôi / người chỉ hồi máu. Tên công pháp, tác dụng và build phải được biên tập theo nhân vật và nguồn truyện.

### 3.2. Hằng Nhạc chung không phải lịch sử nguyên tác

Không kể ba người vốn cùng nhập môn Hằng Nhạc trong truyện. Dùng mở đầu gameplay chung và các cảnh cá nhân có nguồn. Lý Mộ Uyển chơi được từ đầu không chuyển mốc gặp đầu trong nguyên tác sang Hằng Nhạc.

Tư Đồ Nam không mất kiến thức để trở thành tu sĩ Ngưng Khí mới. Tiến trình nhập môn chung của ông biểu thị **khả năng hiện diện/thi triển đang phục hồi**. UI phân biệt trạng thái/cảnh giới trong truyện với mốc gameplay, không ghi cảnh giới nguyên tác của ông là Ngưng Khí. Chi tiết tại [hệ thống tu tiên](CULTIVATION-SYSTEM.md).

Nguồn truyện, tiến trình gameplay và trạng thái dùng trong chế độ chơi là ba thông tin khác nhau. Tuyến thay số phận hoặc phát triển ngoài mốc nguyên tác phải ghi là mở rộng game; không tự áp kết thúc mới vào chính truyện.

### 3.3. Nhiều người cùng chọn một nhân vật

Mỗi hồ sơ là một phiên trải nghiệm của tài khoản, không phải một nhân vật mới được thêm vào canon. Khu chung dùng tên tài khoản/biệt danh và nhãn nhân vật. Chương cá nhân/tổ đội theo tiến trình của người tham gia; hoàn thành chương của một người không thay tiến trình toàn server hoặc số phận NPC ở mọi phiên.

## 4. Vòng chơi

**Mục tiêu → khám phá/nhiệm vụ/chiến đấu → tài nguyên hoặc tri thức → tu luyện/luyện thuật/luyện hóa → bình cảnh → chuẩn bị/khảo nghiệm → đột phá hoặc hồi phục → ổn định sức mạnh → hành trình mới.**

Idle đã chọn hỗ trợ tích lũy; không thay vòng khám phá và khảo nghiệm.

Vòng ngắn: một nhiệm vụ, lần luyện thuật hoặc điều chỉnh chuẩn bị. Vòng trung: nhóm mục tiêu và thử tổ hợp. Vòng dài: vượt bình cảnh, rời Hằng Nhạc và xây dựng con đường riêng. Chưa gán thời lượng; mục tiêu 30–45 phút/tầng 1 và chu kỳ 10 giây của thiết kế trước chỉ là lịch sử.

## 5. Hằng Nhạc — nhập môn qua Ngưng Khí

Trải nghiệm, tuyến nhiệm vụ, bình cảnh, khảo nghiệm và điều kiện xuất hành được đề xuất tại [Đặc tả Hằng Nhạc — Ngưng Khí v0.4](HANG-NHAC-NGUNG-KHI-SPEC.md). [Gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md) xác định bộ khởi đầu và luật skill; [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) bổ sung ngưỡng, nền vận hành, vật tư/idle; [đối thủ và HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đề xuất AI, ba pha, checkpoint và luật kết nối lại. Chi tiết mới cần đánh giá; chưa xác nhận gameplay đã triển khai.

Hằng Nhạc là vùng có thể đi lại, gặp người chơi/NPC, nhận nhiệm vụ, tu luyện và thử chiến đấu. Đồ thị chín node truyện cũ không phải map online đã hoàn thiện.

**Quyết định bổ sung 08/10/2026:** concept hiện tại là khu môn phái sinh hoạt: NPC, nhiệm vụ, tu luyện, luyện thuật và chuẩn bị. Khám phá/đánh quái/thu tài nguyên nằm trong map ngoại vi riêng, nối qua lối ra và cho quay lại môn phái ngay trong giai đoạn Ngưng Khí; không phải đợi hoàn thành Hằng Nhạc. Khảo nghiệm dùng phiên riêng. Lối ra ngoại vi khác với xuất hành HN12 sang hành trình sau nhập môn; quyền mở khu/nhiệm vụ, spawn, loot và hình thức chia sẻ farm vẫn cần thiết kế. Chủ dự án chọn tỷ lệ vật thể/nhân vật tương ứng nền concept 2×, giữ sprite/camera chơi 1×; không lấy hệ số này làm quyết định kích thước map cuối.

Ưu tiên hiện tại là map trước đặc tả vận hành. Chủ dự án đổi quy trình ngày 08/10/2026: trợ lý tạo [map tổng đầy đủ](design/world/hang-nhac-map-v1/README.md) theo GDD, đúng tỷ lệ nhân vật → chủ dự án vẽ luồng đi/chặn và chốt footprint → sản xuất asset rời sau. Bộ concept/nền sạch/ba asset thử đã [xóa](data/hang-nhac-review-reset-2026-10-08.json), không khôi phục. Bản đồ hiện đã có 9 vùng chặn do chủ dự án hoàn tất và lưu, Spawn sân trung tâm đã kiểm hợp lệ; [kế hoạch tích hợp](HANG-NHAC-IMPLEMENTATION-PLAN.md) bắt đầu từ dữ liệu này. Chưa có che người hoặc tích hợp MMO; [bố cục v0.1](HANG-NHAC-MAP-LAYOUT.md) cũ chỉ là tham chiếu.

| Chặng | Nội dung cần học | Kết quả |
| --- | --- | --- |
| Vào Hằng Nhạc | Chọn nhân vật, di chuyển, tương tác, mục tiêu | Biết danh tính và trạng thái nhập môn |
| Chuẩn bị tu luyện | Tài nguyên, công pháp nền, thổ nạp | Hiểu tích lũy; Tư Đồ Nam có diễn giải hồi phục riêng |
| Luyện thuật | Kỹ năng nền, linh lực, khoảng cách, né đòn | Tự vượt khảo nghiệm chiến đấu đơn giản |
| Tiến triển Ngưng Khí | Nhiệm vụ môn phái, luyện tập, đồ/pháp bảo nền | Vận dụng ổn định, đọc được điều kiện bình cảnh |
| Khảo nghiệm cuối | Vận dụng điều đã học, không chỉ kiểm tu vi | Đủ năng lực hoàn thành nhập môn |
| Rời map | Chốt nhập môn, mục tiêu chuẩn bị Trúc Cơ | Bắt đầu tuyến riêng; không tự đột phá chỉ vì qua cổng |

Đạt Ngưng Khí tầng 1 là mốc sớm, không phải kết thúc map. Nguyên tác nêu 15 tầng tại [chương 17](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17). Đề xuất map chuyển thể bao phủ hết 15 tầng, bốn mốc trải nghiệm tương ứng 1/3/9/15; Tư Đồ Nam dùng nhãn hồi phục. Phạm vi này, ngưỡng và số liệu chưa được duyệt chi tiết; không kể đó là hành trình Hằng Nhạc giống nguyên tác.

Cả ba có **Kiếm Khí, Lôi Ấn và Ngự Phong Bộ bản R01** làm skill khởi đầu ngay khi bắt đầu điều khiển. HN03/04 hướng dẫn sử dụng, HN09 luyện phối hợp; không cần làm nhiệm vụ để mới được quyền học ba thuật này. Bộ chung là chuyển thể gameplay, không phải ba class hoặc ba công pháp canon. Cả ba tự hoàn thành được nhiệm vụ đơn lẻ, có lời dẫn/biểu hiện và dấu nhận diện nhẹ; phân hóa sâu sau map đầu. Slot toàn game, tác dụng và số liệu cần đánh giá theo hồ sơ; R02–R05 không tự cấp ở Hằng Nhạc.

Điều kiện hoàn thành đề xuất: tuyến chung và đoạn nhận diện riêng đã xong, đạt mốc Ngưng Khí/hồi phục tương ứng, sử dụng được năng lực nền, vượt khảo nghiệm cuối, hiểu mục tiêu kế tiếp; máy chủ xác nhận mốc và thưởng một lần.

## 6. Sáu phần phát triển tu tiên

| Phần phát triển | Ý nghĩa trong game | Quan hệ |
| --- | --- | --- |
| **Cảnh giới** | Năng lực tu luyện và những khả năng có thể tiếp cận | Điều kiện năng lực; không thay công pháp, thành thạo hoặc điều kiện truyện |
| **Công pháp** | Cách hấp thu, vận hành và sử dụng sức mạnh | Định hướng tu luyện và cách vận dụng các thuật |
| **Thuật pháp** | Bộ kỹ năng chiến đấu, phòng thủ, di chuyển và hỗ trợ | Học, luyện và lựa chọn; cần nền tảng hoặc cơ duyên phù hợp |
| **Pháp bảo** | Công cụ tạo thêm cách chơi, được tìm kiếm, luyện hóa và sử dụng | Bổ sung khả năng; có giới hạn vận dụng và điều kiện sở hữu |
| **Lĩnh ngộ** | Hiểu công pháp, giải quyết bình cảnh và hình thành nhận thức về đạo | Trải nghiệm có nghĩa mở cách dùng hoặc giải yêu cầu đột phá |
| **Hành trình cá nhân** | Cơ duyên, quan hệ, truyền thừa và biến cố quyết định hướng phát triển | Cho ngữ cảnh/quyền tiếp cận và khác biệt giữa nhân vật |

Sáu phần không phải sáu loại EXP hoặc sáu tiền tệ bắt buộc farm. UI mở dần. [CULTIVATION-SYSTEM.md](CULTIVATION-SYSTEM.md) chi tiết hóa trạng thái, cách phát triển, quan hệ và ví dụ.

Khung đầu: **Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần**. Anh Biến/Vấn Đỉnh và giai đoạn sau là định hướng dài hạn; chưa mở đợt sản xuất mới. [Chương 20](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-20), [chương 410](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-410).

| Mốc gameplay | Thay đổi trải nghiệm đề xuất |
| --- | --- |
| Ngưng Khí | Học nền, linh lực, thuật và khảo nghiệm |
| Trúc Cơ | Bắt đầu công pháp/tổ hợp riêng; khám phá/chuẩn bị có trọng tâm |
| Kết Đan | Năng lực chủ đạo rõ, phối hợp công pháp–thuật–pháp bảo |
| Nguyên Anh | Nội dung thần thức/linh hồn phù hợp nhân vật và nguồn |
| Hóa Thần | Lĩnh ngộ/ý cảnh thay đổi cách vận dụng sức mạnh |
| Về sau | Vòng chơi mới theo arc và nguồn sức mạnh; thiết kế riêng |

Đây là mục tiêu gameplay, không tự cấp phân thân/triệu hồi/bất tử từ tên cảnh giới. Cổ Thần/Cực Cảnh của Vương Lâm có hồ sơ riêng khi tới mốc; không biến thành bậc EXP chung của cả ba.

## 7. Tu luyện, bình cảnh và đột phá

Thiết kế cơ sở cho đại đột phá:

1. **Tích lũy:** đủ tu vi/tài nguyên phù hợp; tu vi khác linh lực tiêu trong trận.
2. **Năng lực:** hiểu công pháp, đạt luyện thuật/khảo nghiệm nếu mốc yêu cầu.
3. **Hành trình:** cơ duyên hoặc mốc riêng khi có căn cứ.
4. **Chuẩn bị:** thấy chi phí, điều kiện thiếu, tác dụng và rủi ro đã biết.
5. **Chủ động vượt mốc:** khảo nghiệm/bế quan hoặc hồi phục được xác nhận.
6. **Ổn định:** làm quen năng lực mới, lưu kết quả một lần và mở mục tiêu tiếp.

Không bắt mọi tầng nhỏ trải qua đủ quy trình đại cảnh giới. Không áp xác suất thất bại/thiên kiếp chung; rủi ro nếu có phải có nguyên nhân, cách chuẩn bị và hệ quả rõ. Chưa chốt chết vĩnh viễn, mất cảnh giới hay phá vật phẩm.

Idle không tự đột phá vì đủ thời gian. Mốc hồi phục Tư Đồ Nam không viết lại lịch sử cảnh giới; giới hạn chiến lực hiện dùng được phải cân bằng riêng.

## 8. Phân hóa sau Hằng Nhạc

Mở công pháp đặc trưng, cách vận dụng thuật, pháp bảo và tuyến riêng từ hành trình chuẩn bị Trúc Cơ. Khác biệt nằm ở hành động/lựa chọn/chuẩn bị, không chỉ màu VFX.

| Nhân vật | Vòng phát triển đề xuất | Giới hạn |
| --- | --- | --- |
| Vương Lâm | Khám phá/đấu pháp → cơ duyên/tri thức → vận dụng → giải bình cảnh | Không mở Cực Cảnh/Cổ Thần tùy tiện hoặc cho PvP thắng ngay |
| Tư Đồ Nam | Khôi phục trạng thái → hiện diện/thi triển → phục hồi năng lực/thuật | Kiến thức cao không cấp toàn bộ chiến lực lúc đầu |
| Lý Mộ Uyển | Dược liệu/tri thức → đan/trận → chuẩn bị/kiểm soát → giải yêu cầu riêng | Tự chơi được; không chỉ làm kho đan; thuật/ý cảnh sáng tạo không ghi là canon |

Nguồn nền đan–trận: [chương 143](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-143), [224](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-224). Nguồn trạng thái Tư Đồ Nam: [47](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47). Quãng khắc tượng/lĩnh ngộ Vương Lâm: [271](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-271). Không suy ra cả ba phải làm cùng một thử thách hoặc cùng ý cảnh từ các nguồn này.

## 9. Online, chiến đấu và idle

Hằng Nhạc chung cho thấy nhau, di chuyển và tương tác. Khảo nghiệm/truyện riêng hoặc tổ đội có điều kiện và quyền thưởng riêng; không buộc mọi tài khoản tới cùng chương. Quy mô phòng, quyền loot, ghép nhóm và đồng bộ chương nhóm cần đặc tả.

Máy chủ xác nhận tài nguyên, tu vi, học thuật, pháp bảo, truyện, vị trí, hit/damage và movement/arrival. Gửi lại lệnh/nhiều tab không nhân thời gian, thưởng hay đột phá. Trình duyệt chỉ giữ cache/tùy chọn, không nhập JSON để thay trạng thái hợp lệ.

Idle tiếp tục hoạt động đã chọn, dừng ở thiếu tài nguyên/kho/bình cảnh/cổng tương tác. Không tự hoàn thành truyện, combat, lĩnh ngộ then chốt hoặc đại đột phá. Không mặc định farm combat khi đóng game. Giới hạn 8 giờ cũ chưa được chốt lại cho thiết kế ba nhân vật.

PvP cần hồ sơ riêng: đề xuất nhóm cảnh giới hoặc tỷ thí cân bằng; không áp ngầm luật này cho PvE. Không chuyển khả năng đặc biệt trong truyện thành thắng ngay mọi trận online. Giao dịch đan/pháp bảo và kinh tế còn mở.

## 10. UX và ART

| Khu vực | Nội dung ưu tiên |
| --- | --- |
| Chọn nhân vật | Cả ba từ đầu; danh tính/trạng thái/hướng tương lai; chưa ép build |
| Thế giới | Nhân vật điều khiển, nhiệm vụ, tương tác, thuật đang dùng và linh lực |
| Tu tiên | Mốc cảnh giới/hồi phục, tu vi, công pháp, hoạt động và bình cảnh |
| Thuật/pháp bảo | Nguồn học, điều kiện sử dụng, tổ hợp và lý do khóa |
| Hành trình | Chương riêng, cơ duyên, quan hệ, lĩnh ngộ; nhãn nguyên tác/chuyển thể |
| Tài khoản/cài đặt | Kết nối/lưu, slot nếu có, giảm chuyển động và tùy chọn |

Sáu phần tu tiên mở theo nhiệm vụ; không là sáu menu bắt buộc ngay đầu. Tu vi là tiến triển dài hạn, linh lực là nguồn dùng năng lực. Nhãn Tư Đồ Nam biểu thị hồi phục, không kể ông bắt đầu tu lại từ Ngưng Khí.

Chuẩn VFX hiện có: body tối đa 80 world px, world 960×640, 24 FPS, alpha thường; rìa glow không phải hitbox. Impact dùng cho nhân vật/quái/boss/PvP, không phụ thuộc bia đá. [Bàn giao](design/vfx/STARTER-VFX-HANDOFF.md). Chân dung/diện mạo theo hồ sơ ART đã duyệt; vai gameplay mới không tự đổi nhận diện.

## 11. Phân kỳ kiểm chứng và nghiệm thu

Map qua Ngưng Khí là mục tiêu sản phẩm, không phải cam kết sản xuất toàn map trong một bước. Thay phân kỳ cũ A “không combat, tới tầng 1” / B “thêm một trận” bằng các lát đề xuất:

| Lát | Nội dung | Đánh giá |
| --- | --- | --- |
| A — Lát nhập môn online | Cả ba, Hằng Nhạc, nhiệm vụ/tu luyện đầu và combat đơn giản | Ba lựa chọn vào được; hai tài khoản có tiến trình riêng; hiểu nền |
| B — Hoàn thiện Hằng Nhạc | Ngưng Khí, luyện thuật, pháp bảo nền, khảo nghiệm cuối | Cả ba tự hoàn thành; điều kiện rời map/thưởng nhất quán |
| C — Phân hóa sau map đầu | Chuẩn bị/đột phá Trúc Cơ, công pháp/tổ hợp/tuyến riêng | Khác hành động/lựa chọn; thử/chỉnh hướng đầu được |
| Arc sau | Kết Đan và cao hơn, nội dung nhóm/kinh tế | Vòng chơi, nguồn truyện và ngân sách riêng |

Tên lát, số nhiệm vụ/combat và thứ tự kỹ thuật là đề xuất lập kế hoạch, chưa là lịch phát hành đã duyệt. Một lát dừng ở tầng đầu không được gọi là hoàn tất Hằng Nhạc.

Nghiệm thu toàn map: ba người chơi được từ đầu; vòng chuẩn bị–tu luyện–luyện thuật–combat; dấu nhận diện riêng nhẹ; khảo nghiệm cuối; kết nối lại/lưu riêng; không thưởng/đột phá lặp; rời map có mục tiêu tuyến riêng. Cân bằng cần chơi thử, không suy từ số atlas hoặc test kỹ thuật.

## 12. Hiện trạng, câu hỏi mở và tài liệu

Đã có catalog **6 bộ/136 frame**: bộ ba chibi 60 frame, hai đệ tử chibi 40 frame và Vương Lâm trước 36 frame. [Runtime Hằng Nhạc](HANG-NHAC-RUNTIME.md) nạp nền/navigation owner; [bước hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md) có ba hồ sơ khách SQLite riêng, lưu/khôi phục và thuật luyện thử từ đầu. Fixture online cũ giữ hai avatar đệ tử kỹ thuật. Level Design/Map Editor **0.12.0** lưu dữ liệu biên tập/export; save người chơi ở server. Đăng nhập sản xuất, nhiệm vụ/tu luyện/combat farm còn tiếp tục; xem [trạng thái](PROJECT-STATUS.md). Bản thử số liệu không tự khóa cân bằng GDD.

ART Hằng Nhạc v1/v2/v3 và cả hai walk study đã xóa trong đợt dọn ngày 08/10/2026; [biên bản](data/hang-nhac-art-removal-2026-10-08.json) ghi 203 file, gồm 121 PNG. Đợt concept/nền/asset thử sau đó cũng đã xóa theo chỉ dẫn mới; [map đầy đủ hiện hành](design/world/hang-nhac-map-v1/README.md) phục vụ thiết kế navigation trước, asset rời sau. Editor và dữ liệu biên tập của chủ dự án được giữ.

Đợt ART R01–R05 đã chốt **15 skill / 646 PNG / 76 atlas**, gồm frame dùng lại; các gói duyệt giữ nguyên. ART chủ yếu dùng Vương Lâm, chưa đủ animation chiến đấu ba nhân vật. Quyền dùng bộ R01 chung đã chốt; công pháp/tác dụng/cân bằng và quyền học các giai đoạn sau còn cần hồ sơ gameplay.

Còn mở: slot/đổi nhân vật, phân bổ tầng và thời lượng nhập môn, chi phí/độ khó đột phá, slot công pháp/thuật/pháp bảo, stat/kỹ năng đặc trưng, lời dẫn chuyển thể đầu game, map tiếp, NPC/đối thủ, loot/tổ đội/PvP/giao dịch, idle, monetization và quy mô server. Hồ sơ tiến trình có giá trị thử, chưa khóa. Không kế thừa 480 tu vi, kho 120/30, 10 giây/chu kỳ hoặc 30–45 phút như số liệu đã duyệt.

Tài liệu hiện hành:

- [Đặc tả trải nghiệm Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md): hành trình, nhiệm vụ chung/riêng, bình cảnh, khảo nghiệm và xuất hành.
- [Hồ sơ gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md): bộ R01 chung, trạng thái ba người, luật skill/frame event và baseline thử nghiệm.
- [Tiến trình tu luyện và phần thưởng Hằng Nhạc](HANG-NHAC-PROGRESSION-REWARDS.md): bảng 15 ngưỡng thử, nền vận hành, thưởng nhiệm vụ, vật tư và idle.
- [Đối thủ và khảo nghiệm nhập môn](HANG-NHAC-ENCOUNTERS-TRIAL.md): ba mẫu AI, vùng/timing đòn, ba pha HN10, checkpoint và nghiệm thu.
- [Hệ thống tu tiên](CULTIVATION-SYSTEM.md): sáu phần, trạng thái và quan hệ.
- [Nhân vật](CHARACTERS.md): ba lựa chọn từ đầu và hành trình riêng.
- [Online](ONLINE-DIRECTION.md), [MMORPG](MMORPG-DIRECTION.md): tổ chức thế giới và tiến trình.
- [Backlog](MVP-BACKLOG.md): việc cần đặc tả trước triển khai.
- [Phạm vi MVP RPG](MVP-RPG-A.md), [brief kịch bản nhập môn](STARTER-STORY.md): tổng hợp theo tuyến ba nhân vật; nguyên bản đệ tử/Q01–Q10 giữ trong lịch sử.
- [Nguồn tạo hình bộ ba](CORE-CHARACTER-VISUAL-SPEC.md), [ART](ART-DIRECTION.md), [công nghệ](TECH-STACK.md).

MVP-A-SPEC, UX idle, node WORLD-MAPS và catalog/save minh họa đã được ghi rõ là tham chiếu lịch sử và dẫn đặc tả hiện hành. Bộ UX online ba nhân vật còn cần đặc tả/chơi thử; mapping thành phần không là bộ màn hình mới đã duyệt. Metadata thiết kế có thể ghi hướng mới, nhưng ID/số liệu/schema của snapshot hoặc preview cũ không chứng minh gameplay, tài khoản/lưu đã triển khai.
