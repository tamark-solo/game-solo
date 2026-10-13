# Vương Lâm · hướng thời trang, vũ khí và pháp bảo

**13/10/2026 — đề xuất thiết kế.** Owner muốn cả kiếm, trường thương, linh phiến và hồ lô, đồng thời thêm nhiều góc nhìn về trang phục/trang bị. Hình bốn neutral v1 bị nhận xét còn nhạt và **không được chọn**; gói được giữ như thử nghiệm kỹ thuật/reference. Owner chuyển hướng sang pháp bảo nổi bật trong truyện Tiên Nghịch và thêm reference game tu tiên. Mọi họ áo và các món mở rộng dưới đây vẫn là ý tưởng nghiên cứu của v1. Tên, hình dáng và trải nghiệm là đề xuất riêng cho Vân Hải, chưa phải item/catalog, thông số chiến đấu hoặc quyền sở hữu đã chốt.

Chuẩn người là [frame Vương Lâm live](inputs/wang-lin-live-southeast-native.png), canvas64×96, chân(32,88). Giữ hộp sọ, mặt, tóc, chiều cao và landmark vai–hông–gối–chân; rộng thêm ở vải/phụ kiện hoặc canvas padding không được làm thân phình. Đổi áo, vũ khí và FX là các trục độc lập. Tổ hợp chưa có pose/grip/layer phải ghi thiếu; một neutral không đại diện cho toàn bộ action.

## Điều học từ reference

[Nghiên cứu nguồn](reference-study.md) ghi manifest và 18PNG đã xem trong `docs/art_reference`. Kiếm Tu Luyện Khí có47biến thể kiếm, Thương Tu có22biến thể thương; các biến thể trong cùng họ giữ motion/frame/hướng và layer. Socket grip/tip thay theo từng frame. Kiếm Tu Trúc Cơ có áo choàng rộng; Quyền Tu PixelLab có áo/tay gọn và động tác tụ lực–đưa tay–hồi hữu ích để thiết kế người điều khiển pháp bảo. Bộ `skin` ở một số reference là ảnh toàn thân khác, không chứng minh đổi áo giữ anatomy bất biến. Không có pack quạt/hồ lô trong sáu thư mục đã đọc.

Từ [Tale of Immortal — nguồn chính thức](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/) và [觅长生 — nguồn chính thức](https://store.steampowered.com/app/1189490/?l=tchinese), có thể học cách pháp bảo/công pháp/vật liệu mở ra nhiều kiểu trải nghiệm. Liên hệ với các đề xuất dưới đây là suy luận thiết kế; chưa kiểm gameplay, sprite hoặc wardrobe của hai game này. Không copy nhân vật hay vũ khí nguồn vào runtime.

## Sáu họ dáng thời trang cho cùng một người

Tất cả sáu họ **đề xuất, chưa tạo ART**. Ưu tiên1là họ có thể học giữ anatomy trên áo hiện hành; ưu tiên2/3đợi motion và layer ổn định.

| Họ / ưu tiên | Silhouette, màu và chi tiết | Trải nghiệm nhìn muốn tạo | Motion / part cần sản xuất | Điểm phải giữ khi native1× |
| --- | --- | --- | --- | --- |
| Nhập môn · 1 | Áo xám/ngà hiện hành, viền ngọc nhỏ, đai vải và túi phẳng | Một người mới tu, gọn và gần gũi; nền chung cho mọi món | Vải thân/tay theo pose live; đai/túi chia trước–sau theo hướng | Mặt/tóc và đường vai giống live; viền không thành nhiễu pixel |
| Lữ hành · 2 | Tà áo chia ngắn, áo khoác lệch một vai, khăn cuộn, túi mỏng | Người đi đường lâu; có dấu vải/thắt dây thay cho hào quang | Tà/khăn khi run, đeo hồ lô và túi đổi depth khi xoay; không ghép túi tĩnh xuyên tay | Tà không làm chân ngắn; không che grip và mặt |
| Chiến đấu · 2 | Tay áo thu gọn, hộ thủ nhỏ, giáp vai nhẹ, đai chắc | Ra đòn quyết đoán; phân biệt bằng khối cổ tay/vai, không biến thành người to hơn | Vai/cẳng tay riêng; chém/đâm/block có occlusion; chuyển idle–run–attack | Bảo vệ không làm đầu/vai tăng cỡ; khoảng âm giữa vũ khí và người rõ |
| Luyện đan · 2 | Áo vải nâu/lam, dải đai xanh, túi thảo dược và hộp nhỏ | Nhận diện người luyện chế/thu thập qua dụng cụ bên hông | Rút/giữ/đặt món, squat/collect nếu mở scope; dây/túi theo pose và hướng | Đồ nghề chỉ vài cụm pixel, không phủ cả thân; chân và tay gốc vẫn đọc được |
| Nghi lễ · 3 | Cổ áo đứng rõ, tay áo rộng vừa, tà đối xứng, một dải ngọc | Trang trọng khi kết ấn hoặc đứng chủ trì trận; ít chi tiết nhưng hình rõ | Tay áo mở/khép, vạt dài khi run, chỗ thoát cán thương/quạt; motion riêng nếu vải cản pose | Vải rộng là vải, không đổi anatomy; không giấu mặt bằng cổ/hào quang |
| Ma tu tiết chế · 3 | Đen tro/tím trầm, một điểm đỏ niêm, vạt sờn có nhịp, cổ tay hẹp | Trầm và nguy hiểm qua nhịp màu/chất vải; không cần phủ người bằng khói | Vạt rách theo run/cast; khí sau/trước tách riêng; quyền Đọa Ma do server quyết định về sau | Khi tắt FX vẫn là Vương Lâm; mắt/tóc/da và chiều cao không repaint |

## Tám họ vũ khí

`A`: bốn neutral đầu đã có trong gói để review. `B`: đề xuất tiếp sau khi chốt neutral/motion họ đầu. `C`: đề xuất cần brief riêng và nhiều animation hơn. Bốn mẫu đầu chưa đồng nghĩa có motion hoặc gameplay được duyệt.

| Họ / ưu tiên / trạng thái | Brief riêng cho Vân Hải | Trải nghiệm người chơi dự kiến | Motion bắt buộc | FX / socket / giới hạn |
| --- | --- | --- | --- | --- |
| Kiếm một tay · A · neutral candidate | Thanh kiếm mảnh ngọc–thép, guard nhỏ, tua ngắn; tiếp theo thử thiết kiếm đơn giản và cổ kiếm bản vừa | Nhịp chém chính xác, có lấy thế/phát/hồi rõ; biến thể cùng họ giúp thử đổi trang bị giữ một người | Grip một tay, idle thấp, run chắc, combo1–3, block/hit/death phù hợp | Grip/tip theo frame; chém trail/release/hit riêng. Chưa tăng damage/range hoặc thay R01 |
| Trường thương · A · neutral candidate | Cán tối, mũi dài vừa, tua đỏ nhỏ; biến thể trúc–ngân–hai đầu để học silhouette | Đâm thẳng, giữ cự ly, quét để đổi nhịp; cảm giác khác kiếm nhờ trục cán dài | Bộ thực dùng hai tay cần neutral hai điểm nắm, thu cán/đâm/quét, đổi hướng thật | Hai grip + tip, clearance sau lưng; trail mảnh theo đầu thương. Neutral ghép một tay hiện tại chưa chứng minh kỹ thuật hai tay |
| Linh phiến · A · neutral candidate | Nan ngọc với giấy ngà/mực lam; có form đóng để mang và form mở để thi triển | Chọn mở/khép và hình quạt khiến đòn có nhịp chuẩn bị; nhìn thanh nhã, linh hoạt | Cổ tay xoay, mở nan, phất/quét, khép hồi, run mang form đóng | FX cung quạt tách body; cạnh nan đọc tại1×; form mở không che mặt |
| Trọng đao · B · đề xuất | Lưỡi bản vừa, sống đao màu đồng tối, chỗ mẻ ít; tránh phình bản đến che người | Lấy thế nặng, phát một nhịp rõ và hồi lâu; khác kiếm bằng motion | Hai tay/đổi grip, hạ trọng tâm, vung ngang/dọc, run ôm đao; không tái dùng toàn combo kiếm | Trail ngắn dày, bụi chân riêng; đánh giá canvas rộng/pivot, không scale thân xuống để chứa đao |
| Song đoản kiếm · C · đề xuất | Hai lưỡi ngắn khác màu viền rất nhẹ, chuôi đối xứng; silhouette nhỏ gọn | Nhịp trái–phải, vào/ra khoảng gần; nhận diện bằng hai tay | Hai grip, idle cả hai tay, xen kẽ chém, thu cả hai món, run/hit/death | Hai tip, mỗi trail có phase riêng; không hai món đứng yên trên pose một kiếm |
| Pháp trượng · B · đề xuất | Trượng gỗ đen, đầu vòng ngọc nhỏ và một thẻ niêm | Tụ lực/đặt điểm, đánh dấu trước khi phát; trải nghiệm đọc vị trí thay vì chỉ chém | Một/hai điểm nắm theo action, đặt đầu trượng, chỉ/nghiêng/kết ấn, thu về | Socket đỉnh và chân trượng; glyph ground/rear/front, không bake quầng sáng vào body |
| Linh cung · C · đề xuất | Cung tre–ngọc gọn, dây rõ, bao tên nhỏ | Kéo/giữ/thả có thể nhìn thấy, đổi nhịp ngắm và khoảng cách | Hai tay, nock/draw/hold/release/recover, cả tám hướng; neutral hiện có không đủ | Bowstring/tip/projectile độc lập; release chỉ theo server, không lấy pose làm authority |
| Dây kiếm · C · đề xuất | Đoản kiếm nối dây lụa hoặc xích nhẹ; dây gọn khi đeo | Phóng–thu/đi vòng, tạo hướng tiếp cận khác; đồ trở lại là nhịp nhận biết riêng | Grip, quăng/thu, catch, dây trước/sau người từng frame; nguy cơ che/tự xuyên cần review | Dây/đầu kiếm timeline riêng; giới hạn chiều dài/điểm va chạm là thiết kế sau, không giả đã có |

## Tám họ pháp bảo

Hồ lô `A` là neutral đầu đang review. Các món khác **đề xuất, chưa tạo**. Các trải nghiệm là brief để chốt hướng; chưa mở skill, loot, crafting hoặc quyền trang bị.

| Họ / ưu tiên / trạng thái | Thiết kế nhận diện | Trải nghiệm người chơi dự kiến | Body / artifact motion cần có | FX / dữ liệu tách riêng |
| --- | --- | --- | --- | --- |
| Hồ lô · A · neutral candidate | Bình hai bầu gỗ–ngọc, cổ rõ, dây ngắn; phiên bản đeo hông/cầm tay/bay | Hút–tích–xả, chọn lúc nhả lực; khác vũ khí bằng chu kỳ bình | Nhấc bình/đẩy tay/kết ấn, đeo khi run, trạng thái miệng bình và quỹ đạo nếu bay | Socket miệng bình, luồng hút/xả; nguồn fan/gourd có haze alpha cần đọc trên nền sáng/tối |
| Phù ấn · B · đề xuất | Một phù giấy gấp và dấu ngọc vuông; biểu tượng ít nét | Đặt một dấu rồi kích hoạt/niêm, gắn cảm giác chuẩn bị và vị trí | Rút phù, giữ/niệm, thả hoặc đẩy ấn, tay hồi; form giấy không lấy từ áo | Mark ground + glyph + triggerFX; quyền kích hoạt và mục tiêu do server quyết định về sau |
| Linh kính · B · đề xuất | Gương tròn nhỏ viền bát giác, mặt tối/ngọc, cán rất ngắn | Chọn hướng, tích ánh rồi phản chiếu; cảm giác định hướng rõ | Nâng gương, xoay mặt, giữ một nhịp, hạ; socket normal riêng theo hướng | Flash/reflection tách người; chưa có mechanic phản đạn hay cấp invulnerability |
| Chuông · B · đề xuất | Chuông đồng vừa tay, miệng rõ, dây buộc ngọc | Nhịp rung từng đợt; người chơi đọc pulse và khoảng chờ | Nâng/rung/dừng, cổ tay và thân hồi nhỏ; clapper hoặc rung artifact riêng | Vòng âm ground/rear/front, âm thanh có nhịp; không tạo vòng aura vĩnh viễn che người |
| Linh châu · B · đề xuất | Một châu ngọc lơ lửng sát tay; sau đó thử ba châu có khoảng âm rõ | Vệ tinh/tập trung/phóng–gọi về; chứng minh pháp bảo có timeline riêng | Body kết ấn, châu orbit/aim/release/return và nghỉ; không grip tĩnh | Orbit/root/socket world, trail châu riêng; không đổi hitbox người hay xoay theo CSS giả motion |
| Trận bàn · C · đề xuất | Đĩa ngọc khắc bốn nấc, một dấu hướng; form cầm và form đặt | Bố trận có hướng/điểm neo; trước khi phát phải chuẩn bị không gian | Cầm/đặt/kết ấn/thu, pose đứng không đủ; artifact unfold/activate | Geometry gameplay và ART trận riêng; chưa sửa navigation/map/blocker để minh họa |
| Tiểu đỉnh · C · đề xuất | Đỉnh ba chân nhỏ, nắp kín và hai tai; màu đồng xanh | Nạp–ủ–mở, trải nghiệm tích trữ/biến đổi thay cho bắn liên tục | Đỡ hai tay/đặt/niệm, nắp/trạng thái đỉnh; không ép đỉnh lớn vào một bàn tay | Khói/lửa/nội quang riêng; crafting/cost/reward chưa mở; kiểm scale và lift thật |
| Thẻ ngọc · B · đề xuất | Thẻ dài bằng bàn tay, dây ngắn, một chữ/ngấn ở1× | Gọi/đánh dấu/điều khiển từ xa; pháp bảo kín đáo cho bộ áo lữ hành | Rút thẻ/giơ/thả/kết ấn; form treo bên đai ở run, root của vật gọi tách body | Mark target/remote pulse; không dựng companion hoặc server command ngoài brief |

## Thứ tự làm để mở nhiều tổ hợp có chất lượng

1. **Chốt bốn neutral:** từng món đọc được tại1×, thân live giữ nguyên, tay cầm và layer rõ; lưu nhận xét/duyệt theo hash. Thương một tay neutral là mẫu silhouette; motion hai tay cần tạo pose đúng sau này.
2. **Kiếm làm bằng chứng đổi món:** hai biến thể cùng họ (thiết kiếm tối giản + Thanh Ngọc) cùng grip/clock, kiểm giữ người khi đổi. Sau đó bảy view thật, idle/run/combo/action cần dùng và weapon socket theo frame.
3. **Thương/quạt tạo khác biệt motion:** mỗi họ có pose thật, không tráo PNG trên kiếm. Hồ lô tách đeo/cầm/bay; chọn một cách dùng trước để làm đủ.
4. **Một áo + một pháp bảo bay:** thử họ nhập môn đổi viền/đai trên pose live và một linh châu có timeline riêng. Kiểm tổ hợp áo×vũ khí×pháp bảo tại1×/nền/map/layer trước khi nhân số lượng.
5. **Mở họ B, rồi C:** chọn theo giá trị trải nghiệm và chi phí motion; mỗi họ có bảng có/thiếu rõ, kiểm preview kỹ thuật riêng với review ART. Sau đó mới bàn entitlement/save/Core trên fixture, không dùng DB/map owner làm test.

Nguồn neutral/raw/prompt/hash nằm trong [manifest](manifest.json) và [registration](registration.json). Bản review tĩnh [index.html](index.html) cho bật từng layer, đổi nền và nhìn native; không phát lệnh game hoặc lưu lựa chọn.
