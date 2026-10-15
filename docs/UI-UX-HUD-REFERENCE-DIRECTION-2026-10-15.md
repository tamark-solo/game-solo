# UI/UX & HUD — Reference và hướng thiết kế Vân Hải Đạo Đồ

> **Thống nhất 15/10:** [Hợp đồng GDD 0.35](GDD-035-UNIFIED-CONTRACT.md) quy định điều kiện mở khóa, hai nhánh Trúc Cơ, kế thừa và trạng thái ART. Các con số balance/thời lượng là mục tiêu fixture, chưa phải kết quả playtest. Logic bản chạy chưa phát hành có thể refactor theo yêu cầu owner; tái dùng ART hiện có, chỉ bổ sung phần thiếu.

Ngày 15/10/2026. Đề xuất thiết kế theo cấu trúc RPG UI SYSTEM do owner cung cấp và [GDD 0.35](GDD.md). Đây là nghiên cứu và brief cho prototype; chưa phải duyệt mỹ thuật hay tích hợp runtime.

## 1. Hướng đề xuất

**Owner yêu cầu bỏ Thanh Ngọc ngày 15/10/2026. Hướng thay thế đề xuất: Mực–Giấy–Chu Sa.** HUD dùng nền mực than, chữ ngà, đường phân cách mảnh; menu dùng giấy dó ấm, chương mục đạo thư và dấu triện chu sa. Bỏ viền ngọc, ngàm đồng, khung đá chạm nổi và cầu tài nguyên trang trí khỏi brief mới. Đây là thay đổi ngôn ngữ hình ảnh, không chỉ đổi màu skin cũ. Actor pixel vẫn là trọng tâm thế giới; chữ UI dùng font rõ dấu tiếng Việt, không ép chữ thành pixel. Hướng thay thế chưa được owner duyệt hình.

Ba lớp từ tài liệu đầu vào được giữ nguyên:

- **Gameplay HUD:** điều người chơi phải biết và làm ngay.
- **Menu UI:** chuẩn bị build, đọc tiến trình, quản lý tài nguyên và lựa chọn hoạt động.
- **UX & Feedback:** điều hướng, focus, phản hồi yêu cầu, trạng thái lỗi và tiếp tục sau gián đoạn.

Điều chỉnh theo game: Tu vi khác Linh lực; không thêm Stamina nếu chưa có cơ chế; 5 Đại Cảnh Giới và 3 Mốc Pháp Bảo là hai trục riêng. Huyễn Tâm/Tịch Bạch là hai tạo hình của một tuyến chính. Tư Đồ Nam thuộc Nội Giới, Lý Mộ Uyển thuộc Đan–Trận/Nhân Duyên. Quest dùng Mệnh Kiếp Chí VG01–VG11.

Client hiện tại là web/TypeScript/DOM/Three với Core và server authority. Cây Unity/uGUI trong tài liệu đầu vào chỉ là tham khảo phân lớp, không phải đề xuất chuyển engine.

## 2. Reference đã tìm

Nguồn truy cập 15/10/2026. Cột áp dụng là diễn giải thiết kế cho Vân Hải; không khẳng định những chức năng đó đã có trong game. Trang Steam cung cấp gallery/trailer để nghiên cứu hình; không thay cho kiểm thử trực tiếp toàn bộ tương tác. Bài Diablo 2020 là tư liệu quá trình thiết kế, không đại diện chính xác mọi chi tiết bản phát hành hiện tại.

| Reference / nguồn | Cơ sở từ nguồn | Học và áp dụng vào Vân Hải |
| --- | --- | --- |
| [Wandering Sword / Dật Kiếm Phong Vân Quyết](https://store.steampowered.com/app/1876890/Wandering_Sword/) | RPG võ hiệp phối pixel art với cảnh 3D; có công pháp, kinh mạch và quan hệ NPC | Ưu tiên nghiên cứu cách nhân vật pixel cùng tồn tại với menu nhiều thông tin. Linh Đài dùng sprite đúng identity; bố cục chia thông tin tổng quan và chi tiết. Không mang luật chiến đấu ô/lượt sang game mình. |
| [Tale of Immortal / Quỷ Cốc Bát Hoang](https://store.steampowered.com/app/1468810/) | Sandbox tu luyện theo thần thoại Trung Hoa | Nghiên cứu cảm giác đạo lộ và lựa chọn hoạt động. Đề xuất trang Tu luyện trả lời “đang ở đâu, thiếu gì, có thể làm gì”, còn HUD chỉ giữ một mục tiêu ghim. Không bê toàn bộ bảng hệ thống lên màn chơi. |
| [Mịch Trường Sinh / 觅长生](https://store.steampowered.com/app/1189490/) | RPG thế giới tu tiên, có công pháp và luyện đan | Reference cho cách tổ chức thông tin chuyên sâu về tu luyện/đan dược. Đề xuất sổ công thức: nguyên liệu có/thiếu → nguồn tìm → kết quả dự kiến → thao tác. Không đưa luật chiến đấu hoặc đan dược của reference thành luật dự án. |
| [Diablo IV — UI design, February 2020](https://news.blizzard.com/en-gb/article/23308274/diablo-iv-quarterly-updatefebruary-2020) | Blizzard mô tả giảm bão hòa nền icon, thêm dấu hiệu rarity ngoài màu, cân bằng inventory, thử vị trí hotbar và hỗ trợ nhiều input | Học phân cấp thông tin, icon nhỏ dễ nhận diện, tooltip so sánh và hotbar gọn. Thể hiện bằng mực, giấy và triện theo hướng mới. |
| [FFXIV — Navigating the Game Screen](https://na.finalfantasyxiv.com/game_manual/view/) và [UI Guide](https://na.finalfantasyxiv.com/uiguide/) | Tài liệu chính thức phân vùng HUD, mục tiêu, nhiệm vụ, hotbar; có thay đổi vị trí/kích thước/hiển thị HUD | Học tổ chức hệ thống, preset và tách journal khỏi tracker. Party chỉ hiện khi có tổ đội; không mặc định nhiều hàng kỹ năng. |
| [Ghost of Tsushima — Beginner’s Guide](https://www.playstation.com/en-us/editorial/ghost-of-tsushima-beginners-guide/) | Guiding Wind dẫn về mục tiêu | Học cách để thế giới tham gia hướng dẫn. Có thể thử tín hiệu khí ngắn khi người chơi yêu cầu chỉ đường; vẫn giữ marker và nhãn đích rõ, không thay tuyến đường hợp lệ bằng FX. |
| [Diablo IV — Accessibility](https://news.blizzard.com/en-gb/article/23954932/combatting-demons-with-accessibility-in-diablo-iv) | Tài liệu chính thức nêu chỉnh cỡ chữ và hỗ trợ đọc/nhìn/thao tác | Đưa cỡ chữ, tương phản, remap và phân biệt trạng thái ngoài màu vào component ngay từ đầu. |

Ảnh đối chiếu cụ thể để xem tiếp: [Wandering Sword — character sheet trong bản demo](https://www.rpgsite.net/preview/13774-wandering-sword-sprinkles-some-live-a-live-on-top-of-its-unique-blend-of-wuxia-and-hd-2d-pixel-art). Ảnh này dùng cho quan sát bố cục, không phải nguồn xác nhận tính năng hiện tại. Không sao chép bitmap/icon thương mại vào assets.

## 3. Ngôn ngữ hình ảnh mới — Mực–Giấy–Chu Sa

| Thành phần | Đặc điểm | Điểm mạnh | Điểm cần kiểm |
| --- | --- | --- | --- |
| HUD mực than | Mảng tối gọn, mép phẳng, nét bút chỉ ở đầu mục; HP/MP dạng thanh | Dành khoảng trống cho thế giới và cảnh báo | Nền đủ đậm để chữ đọc được trên cả cảnh sáng và tối |
| Menu đạo thư | Giấy dó màu ngà ấm, mục lục, đường kẻ mực; texture nhẹ ở lề | Có chất tu hành và phù hợp nội dung dài | Không đặt vết giấy hoặc nét loang dưới chữ/số |
| Điểm nhấn chu sa | Dấu triện nhỏ, gạch chân tab đang chọn, dấu mốc chương | Tạo nhận diện riêng và trạng thái chọn rõ | Không dùng son cho mọi nút; lỗi/nguy hiểm có nhãn và biểu tượng riêng |
| Icon và pháp bảo | Silhouette rõ, nét khắc gọn; artwork pháp bảo có màu riêng trong vùng nội dung | Phân biệt bốn họ ngay ở kích thước nhỏ | Không giản lược tất cả vật phẩm thành cùng một dấu triện |

Hotbar là hàng thẻ thuật gọn, số cooldown và phím dễ đọc; thanh tài nguyên có phần ruột hình học rõ, nét bút chỉ trang trí ngoài vùng đo. Linh Đài đặt actor trên nền giấy trống với mực sơn thủy rất nhạt ở mép. Mệnh Kiếp Chí dùng bố cục trang sách và dấu chương. Menu xuất hiện bằng fade ngắn; dấu triện chỉ nhấn lúc xác nhận, không chờ diễn hoạt mới cho thao tác.

Biến thể Đọa Ma dự kiến dùng giấy ám khói và nét mực đứt, giữ nguyên bố cục và ý nghĩa màu tài nguyên. Đổi theme chỉ theo trạng thái gameplay đã xác nhận. Hướng mới cần mockup kiểm trực tiếp với cảnh và actor hiện có trước khi sản xuất bộ asset.

## 4. Gameplay HUD

| Vùng | Nội dung | Quy tắc |
| --- | --- | --- |
| Trái trên | Tên, cảnh giới/tầng; Tu vi rút gọn | Một điểm mở Linh Đài; tiến trình sâu nằm trong menu |
| Giữa trên | Target hoặc boss, HP và trạng thái liên quan | Chỉ hiện khi có target hợp lệ; không xếp hai khung trùng thông tin |
| Phải trên | Tên vùng, minimap, điểm ghim | Bản đồ từ dữ liệu thật; dấu mục tiêu không ngụ ý có thể auto-path ở mọi khu |
| Phải giữa | Một mục tiêu chính và một ghim sandbox tùy chọn | Mỗi mục tiêu tối đa hai dòng; combat thu gọn, không tự đổi đích người chơi đang ghim |
| Giữa dưới | HP/MP, hành động đang dùng, cooldown, pháp bảo đang vận dụng | HP/MP chỉ có một vị trí chính. F và các binding thật lấy từ runtime; số ô theo loadout đã xác nhận |
| Gần đối tượng tương tác | E + động từ + tên đối tượng | Hiện đúng khoảng cách/LOS/lifecycle; station có ưu tiên hiện hành |
| Trái dưới | Kết quả ngắn; chat/party theo ngữ cảnh | Gộp thông báo liên tiếp; lỗi quan trọng không trôi mất trong loot |
| Phải dưới | Nhân vật, Hành trang, Mệnh Kiếp Chí, Bản đồ, Menu | Icon kèm tooltip/nhãn; không trưng bày tất cả hệ tương lai |

Ba trạng thái trình bày dùng chung vị trí: **khám phá** nhấn định hướng và tương tác; **chiến đấu** nhấn tài nguyên/target/cooldown, thu tracker; **tu luyện** nhấn hoạt động đang chạy, điều kiện và lối dừng. Chuyển trạng thái không xê dịch hotbar hoặc nút khẩn cấp.

Độ nguy hiểm phải đọc được trong thế giới, đặc biệt khe né 90° của Ấn Hồi. Không dùng toast, damage text hay khung mục tiêu đè đường né. Nội dung phase/cast chỉ hiển thị khi được encounter cung cấp.

## 5. Menu UI

| Nhóm màn | Cấu trúc đề xuất | Câu hỏi người chơi cần được trả lời |
| --- | --- | --- |
| Linh Đài | Tổng quan / Tu luyện / Công pháp / Pháp bảo | Tôi mạnh ở đâu và bước chuẩn bị tiếp theo là gì? |
| Trữ Vật Nang | Bộ lọc, grid, chi tiết và so sánh; thao tác đúng loại vật phẩm | Món nào dùng được, vì sao chưa dùng được? |
| Pháp bảo | Bốn họ; chi tiết Mốc I–II–III, ST/AOE, điều kiện sở hữu/nâng mốc | Pháp bảo này phục vụ vai trò gì, có gì thay đổi khi nâng? |
| Công pháp | Ba khuynh hướng; tác dụng, điều kiện và cấu hình đang vận hành | Lựa chọn này ảnh hưởng build thế nào? |
| Mệnh Kiếp Chí | Hồi hiện tại, dấu mốc đã qua, mục tiêu/đích và lịch sử | Điều gì vừa xảy ra, tiếp theo làm gì? |
| Bản đồ & Kỳ ngộ | Vùng đã biết, bộ lọc NPC/nguyên liệu/hoạt động, ghim | Tôi có thể tự chọn hoạt động nào để tiến bộ? |
| Nội Giới | Tư Đồ Nam, chỉ điểm và chức năng Châu theo giai đoạn | Tôi cần biết hoặc chuẩn bị gì? |
| Đan–Trận / Luyện khí | Công thức, nguyên liệu, nguồn tìm, kết quả và yêu cầu | Thiếu gì, kiếm ở đâu, thao tác có thành công không? |
| Hội thoại / Nhân Duyên | Nhân vật, lời thoại, lựa chọn có hệ quả được phép công bố | Tôi đang lựa chọn điều gì? |
| Hệ thống | Cỡ UI/chữ, input, âm, giảm chuyển động, kết nối | Tôi có thể đọc và điều khiển thoải mái không? |

Không coi sở hữu đủ bốn họ là được đổi pháp bảo tức thời trong combat. Không tự dựng cây kỹ năng lớn, stat STR/DEX/INT, mua bán hoặc save/load thủ công nếu domain chưa có hợp đồng. Hệ chưa tích hợp có thể xuất hiện có nhãn trong prototype, không có nút giả như tính năng đang hoạt động trong live.

## 6. Những luồng UX cần dựng trước

1. **Trang bị:** chọn vật phẩm → so sánh nguồn chỉ số → yêu cầu trang bị → chờ kết quả → cập nhật theo snapshot. Thất bại chỉ rõ điều kiện; giữ lựa chọn và scroll. Không tăng stat ngay rồi coi như thành công.
2. **Đột phá:** Tu vi đạt mốc → mở bảng điều kiện → xem mục còn thiếu → ghim nguồn hoạt động → quay lại thử thách/đột phá → nhận kết quả. Chu Thiên nhỏ tự tiến, đổi tầng/tiểu cảnh giới dùng Xung Mạch chủ động 5–15s theo fixture. Bảng chuẩn bị kiểm khẩu quyết, độ thuần, đan độc, epoch và fact; không tự tăng tầng khi xong nhiệm vụ. Tầng 12 cho chọn nhánh Trúc Cơ sớm hoặc tiếp tục Cổ Cảnh, cả hai nhập lại VG07.
3. **Nhiệm vụ:** fact hoàn tất → tracker chuyển bước hợp lệ → thông báo ngắn → người chơi có thể mở lịch sử. Xem mục tiêu, ghim bản đồ và bắt đầu tự tìm đường là các hành động phân biệt. Điều khiển thủ công/modal/lifecycle hủy auto-path theo hợp đồng hiện tại.
4. **Luyện đan:** chọn công thức → kiểm có/thiếu và kết quả → gửi yêu cầu → báo thành công/thất bại → cập nhật vật tư một lần. Không báo đã trừ đồ chỉ dựa trên animation.
5. **Gián đoạn:** mở menu → focus vào tiêu đề/điểm mở phù hợp; Esc đóng lớp trên cùng → trả focus. Mất mạng khóa lệnh cần server và giữ vùng đọc; reconnect không tự phát lại thao tác nguy hiểm. MMO vẫn diễn ra khi menu mở.

## 7. Design system ban đầu

- Palette đề xuất để thử: mực than `#202322`, giấy dó `#E8DECA`, chữ trên nền tối `#F2EBDD`, chữ trên giấy `#292B28`, chu sa `#A94032`; HP `#C85C5C`, MP `#6DAED1`. Chu sa là điểm nhấn tiết chế; focus dùng đường viền rõ theo nền, không dựa vào màu son đơn độc. Chưa là palette được duyệt hay đã kiểm đủ tương phản.
- Chữ nội dung 16px làm điểm bắt đầu trên desktop; tiêu đề 20–24px; thông tin phụ không dưới 14px ở scale chuẩn. Font cần đầy đủ dấu tiếng Việt. Số HP/cooldown dùng tabular numerals nếu font hỗ trợ.
- Chuẩn hóa button, tab, item slot, tooltip comparison, status bar, tracker row, dialog, toast, empty/error/loading state. Mỗi thành phần có hover/focus/pressed/selected/disabled/pending rõ nghĩa.
- Rarity, khóa và cảnh báo có nhãn/hình dạng bổ sung; không dựa riêng vào màu. Không dùng màu pháp bảo thay nghĩa HP/MP.
- Thử UI scale 100/125/150%; đo tương phản trên nền thật. Điểm chạm mobile mục tiêu 44–48px; màn hẹp đổi bố cục, không thu nhỏ desktop. Gamepad cần sơ đồ focus riêng nếu đưa vào phạm vi triển khai.
- Chuyển động mở/đóng ngắn, không chờ animation mới được thao tác; hỗ trợ reduced motion. Không dùng nhấp nháy liên tục để gọi người chơi vào menu.

## 8. Triển khai theo cấu trúc owner cung cấp

**Bước 1 — HUD và trạng thái tương tác:** dựng wireframe khám phá/combat/tu luyện cùng dữ liệu fixture; nối player status, hotbar, target, E prompt và feedback.

**Bước 2 — Quản lý nhân vật:** Linh Đài, Trữ Vật Nang, Pháp bảo, Công pháp và tooltip so sánh. Ưu tiên một luồng trang bị hoàn chỉnh trước khi làm hàng loạt cửa sổ.

**Bước 3 — Thế giới và tiến trình:** Mệnh Kiếp Chí, bản đồ, Nội Giới, Đan–Trận/hội thoại. Nối hành trình “thiếu nguyên liệu → ghim nguồn → hoạt động → quay lại chuẩn bị”.

**Bước 4 — Hoàn thiện:** settings, focus/input, responsive, âm phản hồi, accessibility và hiệu năng. Những yêu cầu nền như focus/cỡ chữ/lifecycle phải có từ bước 1, không để cuối mới sửa.

Luồng kỹ thuật: snapshot/facts → Core view model → presenter DOM/HUD; ý định người chơi → callback/command → authority kiểm tra → kết quả/snapshot. Dùng lại kiến trúc dự án, không để menu sở hữu reward, damage, save hay quyền mở khóa.

## 9. Bộ prototype nên làm tiếp và tiêu chí xem

Năm màn đầu: **HUD khám phá; HUD boss Hắc Ấn; Linh Đài–Pháp bảo; Trữ Vật Nang–so sánh; bảng chuẩn bị đột phá**. Đây là phạm vi đủ để kiểm hình ảnh lẫn vòng lặp chính trước khi mở rộng.

Kiểm ở 1366×768, 1920×1080 và màn hẹp 390px; thử tên dài, dấu tiếng Việt, danh sách rỗng, đầy túi, thiếu MP, cooldown, mất mạng, target chết và combat khi menu mở. Kiểm chữ sau tăng scale; focus không mất; thao tác không gửi trùng; toast không che actor/cảnh báo; vật liệu không làm mất số HP/MP.

Mục tiêu usability đề xuất: người mới nhận ra HP/MP, mục tiêu và hành động tiếp theo sau 5 giây; giải thích được điều kiện thiếu của đột phá mà không cần người hướng dẫn. Đây là mục tiêu cần kiểm bằng thử người dùng, chưa phải kết quả đo.

## 10. Quan hệ với tài liệu cũ

[MAIN-GAME-HUD-UX-DIRECTION](MAIN-GAME-HUD-UX-DIRECTION.md), [FULL-HUD-SYSTEM-DESIGN](FULL-HUD-SYSTEM-DESIGN.md), [CHARACTER-UI-CULTIVATION-DIRECTION](CHARACTER-UI-CULTIVATION-DIRECTION.md) và [DAO-UI-SYSTEM](DAO-UI-SYSTEM.md) cung cấp lịch sử và hợp đồng component đã có. Thanh Ngọc đã bị owner loại khỏi hướng thiết kế mới; tài liệu và asset cũ giữ làm lịch sử, không là chuẩn mỹ thuật cho prototype tiếp theo. Nội dung còn nhắc GDD 0.32/M01 hoặc pháp châu mẫu phải đối chiếu lại GDD 0.35 và hợp đồng thống nhất trước khi tái dùng. Chỉnh brief này chưa thay skin runtime hay các approval ART đã pin.

Bản brief này là lịch sử nghiên cứu hướng hình; [Đạo Ấn V3](HANG-NHAC-DAO-AN-V3.md) sở hữu trạng thái UI đã ghép. Hợp đồng 0.35 mới chưa tự biến các nút 5–7 thành skill thật; slot/binding và hành động chỉ hoạt động khi loadout/server tương ứng đã tích hợp.
