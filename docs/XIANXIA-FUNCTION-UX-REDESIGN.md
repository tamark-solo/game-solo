# Thiết kế lại chức năng và HUD tu tiên — 04

**Tiếp nối tab Nhân vật:** [Nhân vật 04](CHARACTER-SHEET-UX-V4.md) làm rõ nền đã xác nhận, bộ đang dùng và mục tiêu; thêm reader thuật cùng luồng quay lại từ nhiệm vụ. HUD và 38 lối giữ cấu trúc 04.

**11/10/2026 · Theo yêu cầu owner.** Owner nhận xét bộ icon 03 khó nhìn, cách đặt/ghép chức năng khó sử dụng, muốn nghiên cứu game tu tiên và làm lại. Owner cũng làm rõ GDD hiện chưa đủ: cần thiết kế thêm thông tin và luồng, rồi dùng kết quả để phát triển GDD. Tài liệu này là **bản thiết kế để đối chiếu**, không sửa luật GDD hoặc tự xác nhận các hệ đã có backend.

[Bản thử tương tác](http://127.0.0.1:5174/ui-material-review.html): HUD 04, Chức năng → tìm/ghim, chi tiết hệ và đối chiếu icon mới/cũ ở 24/32/40 px. Các màn nhập môn đã làm được giữ làm nền; map và hình nhân vật thuộc bản owner hiện hành.

## 1. Reference và điều đã quan sát

| Nguồn chính thức | Bằng chứng đọc được | Áp dụng cho Vân Hải |
| --- | --- | --- |
| [Tru Tiên PC · hướng dẫn giao diện, 18/09/2009](https://zhuxian.wanmei.com/infostation/xszn/xssl/20090918/25103.shtml) | Tài liệu phân vị trí nhân vật, map, chat, chức năng; nhóm chính gồm thuộc tính/túi/kỹ năng/nhiệm vụ, các hệ sâu đi qua chức năng khác/giao tiếp/hệ thống | Lối chính theo tần suất, nhóm sâu theo nhiệm vụ; tách skill thi triển khỏi nút mở màn quản lý |
| [Vấn Đạo · giới thiệu giao diện](https://wd.gyyx.cn/oper/jm.htm) | Đọc bảng chức năng và xem ảnh chú thích gốc: nút mở túi/đội/quan hệ/nhiệm vụ/map và các điều khiển trong cửa sổ chat có vai trò khác nhau | Phân biệt mở màn, đổi kênh và hành động gameplay; map/nhật ký có lối riêng. Đây là game theo lượt, chỉ học tổ chức thông tin |
| [Blade & Soul Revolution · Main Screen](https://guide.netmarble.com/bnsmasia/215) | Đọc hướng dẫn và xem hai ảnh gốc: biểu tượng menu sáng đơn giản; quick menu có nhóm và cấu hình mục thường dùng; menu đầy đủ tách character/skills/adventure/battlefield/clan | Icon ít chi tiết khi nhỏ, menu đầy đủ khác shortcut, cho ghim lựa chọn. BNS là reference võ hiệp bổ trợ cho thao tác MMORPG/mobile |
| [Tru Tiên 2 · chuyên đề hệ thống, 26/03/2026](https://zx2.wanmei.com/net/260326show/index.html) | Đọc mô tả động phủ, sản xuất, kho và hoạt động tiên xã: có điều kiện, quyền, nguồn–chi, kết quả và xác nhận trước hành động quan trọng | Mỗi icon phải dẫn tới một luồng có mục đích và trạng thái. Động phủ/hoạt động cộng đồng là ứng viên phát triển dài hạn |

Ảnh BNS đã xem: [menu cơ bản](https://sgimage.netmarble.com/images/netmarble/bnsmasia/20211027/8pad1635293656021.jpg), [menu mở nhanh](https://sgimage.netmarble.com/images/netmarble/bnsmasia/20211027/mvyi1635293678079.jpg). Ảnh Vấn Đạo: [bố cục có chú thích](https://wd.gyyx.cn/oper/image/image011.jpg). Ảnh minh họa Tru Tiên PC/2 không xác minh được trong lần này; phần nhận xét dựa trên văn bản chính thức. Không sao chép icon, logo, ảnh hay bảng số liệu của game khác vào sản phẩm. Các hướng dẫn có tuổi đời/bản test khác nhau; dùng làm reference có ngày, không tuyên bố là UI live hiện tại.

## 2. Vấn đề bản 03 và thay đổi 04

| Vấn đề quan sát | Thay đổi thiết kế |
| --- | --- |
| Icon ngọc/đồng/vải nhiều chi tiết, màu gần map; túi/ngọc bài/pháp bảo khó phân biệt | Navigation dùng ký hiệu gốc có mảng hình lớn, khoảng trống rộng, sáng trên nền tối; ART vật phẩm và thuật vẫn là tranh riêng |
| Cố chia 24 mục thành bốn nhóm có đúng sáu mục; nhiệm vụ nằm ở giao tiếp, map ở vật phẩm | Bảy nhóm theo việc cần làm, số mục không ép bằng nhau |
| PvE/PvP/giao dịch/thành tựu/thư đều đứng ở trên, cạnh tranh chú ý với mục tiêu chiến đấu | Hoạt động và tổ đội là lối chuẩn bị; thư/thông báo/thiết lập đi cạnh map, chi tiết ở menu |
| Trang bị mở lại Tổng quan; tọa kỵ mở tab phối hình nên không thể hiện điều kiện sử dụng | Trang bị và tọa kỵ có trang thiết kế riêng; diện mạo chỉ quản lý hình, liên kết sang chức năng vận dụng |
| Mỗi mục là điểm kết thúc, phải quay HUD rồi mở menu lần nữa | Trang hệ có liên kết bước tiếp; đóng trang mở từ menu trở lại menu, giữ lọc/tìm; trả focus hợp lệ |
| Lối mở cố định cho mọi người chơi/chặng | Desktop ghim tối đa 5 lối; mobile giữ Nhân vật/Túi/Nhiệm vụ/Map/Menu. Ghim chỉ thay vị trí UI |

Icon nhỏ là **ngôn ngữ điều hướng**, không miniature của vật phẩm. Bản 04 dùng SVG nguyên bản trong `ui/dao-hud-glyph.ts`, 38 hình; cùng nhận diện trên Tu Đạo/Đọa Ma, khác màu/vật liệu. Không tạo raster mới, không phủ filter lên pack 03. Pack cũ giữ để so trực tiếp, không xóa nguồn.

## 3. Những thông tin cần thiết kế trước khi viết thêm GDD

| Trụ trải nghiệm | Người chơi cần thấy và làm | Phần cần quyết định qua thiết kế/playtest |
| --- | --- | --- |
| **Tu sĩ đang trở thành ai?** | Hồ sơ, cảnh giới đã xác nhận, tu vi, nguồn hiệu lực, bước tiếp, hình đang hiển thị | Vai trò cảnh giới, cách đọc mạnh/yếu, hướng ba nhân vật; phân biệt năng lực với hình |
| **Tu đạo** | Công pháp đang dùng, thuật đã biết, pháp bảo, tổ hợp; điều kiện bình cảnh/đột phá | Công pháp thay cách vận dụng thế nào; chi phí, đánh đổi, điều kiện đổi bộ; Đọa Ma từ quyền Hóa Thần theo quyết định đã có |
| **Kiếm đồ để làm gì?** | Món/nguyên liệu đích, nơi kiếm, điều kiện, lượng còn thiếu, công thức và nguồn chi | Farm nguồn nào có ý nghĩa, thời gian mục tiêu, binding, quyền loot; định nghĩa power pilot trước bảng rarity |
| **PvE** | Hoạt động solo/đội, độ khó, chuẩn bị, vai trò, luật kết quả | Lát boss/bí cảnh đầu, credit/loot/instance/reconnect; phần lặp khác main quest |
| **PvP** | Luật vùng/chế độ, đối thủ, đồng ý tỷ thí, hậu quả và kết quả | Chênh lệch có thể chơi, consent, vùng an toàn/tranh chấp, ghép phù hợp, luật rời trận |
| **Sưu tập và khoe nhân vật** | Đang sở hữu/đang thử/đang dùng; nguồn nhận, tọa kỵ, ngự khí, danh vị | Quyền dùng hình, chuyển động/tỷ lệ với nhân vật mới, cách người khác đọc đòn và thành quả |
| **Cộng đồng** | Tổ đội, đạo hữu, tông môn người chơi, chat, lời mời, hồ sơ public | Quyền thành viên, đóng góp, phân phối nhóm và quyền riêng tư; môn phái NPC khác guild người chơi |
| **Đời sống tu sĩ** | Đan/khí, thu thập, kho, động phủ; đồ sưu tập có nơi dùng/trưng bày | Động phủ là hướng đề xuất; chọn vai trò hữu ích trước khi thêm sản xuất/buff/nâng cấp |
| **Tri thức và cơ duyên** | Đạo đồ ghi điều đã làm/đã biết, nội dung đã gặp và nguồn tiếp | Cơ duyên tạo lựa chọn gì; bằng chứng nào server ghi, giới hạn công khai, cách nối arc |

Luyện thể, thần thức/thần hồn, phù lục, trận pháp có thể trở thành **nhánh nội dung** bên trong Tu đạo/Luyện chế sau khi xác định được hành động và nơi dùng. Không mặc định mỗi tên cần một icon HUD, một thanh EXP hoặc hệ stat độc lập. Đây là khoảng thiết kế mở, không ranh giới cứng từ GDD cũ.

## 4. Cấu trúc 38 lối chức năng

Đây là inventory UX ứng viên, **không 38 hệ phải code cùng lúc**. 24 lối cũ được phân lại; 14 lối bổ sung là brief mới có trường thông tin, luồng thao tác và liên kết. Mục chưa triển khai mở trang thiết kế, không cấp gameplay.

| Nhóm | Lối chức năng và mục đích |
| --- | --- |
| **Nhân vật · 6** | Nhân vật: danh tính/nguồn sức mạnh; Ba lô: đồ mang; Trang bị: món đang mặc; Diện mạo: phối hình; Tọa kỵ: quyền di chuyển/triệu hồi; Linh thú: đồng hành/điều kiện dùng |
| **Tu đạo · 6** | Tu luyện: tu vi/mốc; Công pháp: nền vận dụng; Thuật pháp: hành động/chi phí; Pháp bảo: sở hữu/luyện hóa/vận dụng; Đột phá: bình cảnh/chuẩn bị; Bộ vận dụng: tổ hợp cho một mục tiêu |
| **Đồ & Luyện chế · 6** | Luyện chế: tra hướng đan/khí; Luyện đan: đan phương/nguồn chi; Luyện khí: công thức/hiệu lực; Thu thập: nguồn nguyên liệu; Kho đồ: đồ cất/quyền chuyển; Giao dịch: giá/binding/xác nhận |
| **Thế giới & PvE · 7** | Bản đồ: khu/điểm đích; Nhiệm vụ: mục tiêu tiến trình; Hoạt động: chọn việc phù hợp; PvE: nguồn/chuẩn bị; Bí cảnh: phiên riêng; Boss thế giới: mục tiêu chung/credit; Ủy thác: việc chọn thêm/nguồn thành quả |
| **Đấu pháp · 3** | PvP: chế độ/luật; Tỷ thí: lời mời/đồng ý; Danh bảng: thành tích/phạm vi/bằng chứng |
| **Cộng đồng · 6** | Tổ đội: tìm/mời/sẵn sàng; Đạo hữu: quan hệ/hồ sơ public; Tông môn: guild/quyền/đóng góp; Chat: kênh; Thư: nội dung/đính kèm; Động phủ: trưng bày/tiếp khách/quyền |
| **Tiện ích · 4** | Thành tựu: điều kiện/danh vị; Đạo đồ: tri thức/hành trình; Thông báo: việc cần chú ý; Thiết lập: điều khiển/hiển thị/phiên |

Danh mục ID, nhãn, trường thông tin, luồng và liên kết ở `client/src/core/dao-hud-system.ts`. Mỗi lối có một ý nghĩa chính. Một màn có nhiều tab được phép có shortcut trực tiếp vào tab; quan hệ cùng họ không biến chúng thành một quyền gameplay.

## 5. HUD: nhận biết → chuẩn bị → hành động

| Vùng | Thiết kế 04 |
| --- | --- |
| Trái trên | Thông tin nhân vật có nền đọc; tu vi và lối Tu đạo; khi tích hợp sẽ đọc tên/mốc thật |
| Giữa trên | Target và phản hồi đòn, vùng trung tâm map thoáng |
| Phải trên | Minimap; cạnh đó có Hoạt động/Tổ đội để chuẩn bị; Thư/Thông báo/Thiết lập nằm sát map trên desktop |
| Phải giữa | Tracker có nền, tên bài, việc còn thiếu, sổ và lối hướng dẫn |
| Trái dưới | Nhật ký có nền tối tiết chế; giao tiếp dạng nút chữ + ký hiệu nhỏ |
| Giữa dưới | HUD tài nguyên/kỹ năng hiện có; ba thuật hoạt động mẫu, bảy ô chưa gán |
| Phải dưới | Năm ghim cá nhân + Chức năng. Mặc định Nhân vật/Túi/Tu luyện/Pháp bảo/Diện mạo |
| Menu đầy đủ | Tìm không dấu/có dấu, bảy nhóm, mô tả mục đích, ghim/bỏ ghim và lối mở chi tiết |

Phím bản thử: C nhân vật, B hoặc I túi, V tu đạo, K thuật, J nhiệm vụ, M map. Phím quản lý tách khỏi 1/2/3 thi triển; khi đang nhập chữ hoặc cửa sổ mở, không phát đòn. Esc/nút đóng trả về nơi mở; liên kết bước tiếp không buộc về HUD. Desktop pin lưu trong state của phiên review; chưa lưu setting thật. Mobile tìm mọi hệ từ Menu; các tiện ích nhỏ không chen ba target chạm vào minimap hẹp.

Các vùng thích nghi ở **board thiết kế**. Bước tích hợp sẽ kiểm viewport toàn màn hình thực và mobile landscape; tăng chiều cao board không được xem là chứng minh game native đã đạt.

## 6. Năm luồng để kiểm thiết kế

1. **Tôi cần mạnh hơn:** Nhân vật → Trang bị → Ba lô / Luyện khí → nguồn nguyên liệu → PvE/Thu thập → món đủ → so và xác nhận trang bị. Mỗi bước biết lý do và đích dùng.
2. **Tôi cần vượt bình cảnh:** Tu luyện → Đột phá → điều kiện thiếu → Công pháp/Đạo đồ/Nguyên liệu → chuẩn bị → đọc xác nhận → kết quả/ổn định. Không đồng nhất đủ tu vi với đã đột phá.
3. **Tôi muốn farm bí cảnh:** Hoạt động → PvE → Bí cảnh → nguồn đồ/luật phiên → Bộ vận dụng → Tổ đội nếu cần → sẵn sàng → vào phiên → kết quả có receipt.
4. **Tôi muốn tỷ thí:** Hoạt động → PvP → Tỷ thí → đọc đối thủ/luật → chuẩn bị bộ → hai bên đồng ý → trận → kết quả. Hủy/rời/reconnect phải có đường UI rõ.
5. **Tôi muốn đẹp hơn:** Diện mạo → thử hình đã sở hữu / tra nguồn chưa có → Thành tựu/Hoạt động → áp dụng quyền hợp lệ; Tọa kỵ có lối riêng để đọc điều kiện di chuyển, rồi liên kết sang hình.

Bản thử hiện kiểm được mở trang, liên kết giữa hệ, ghim/tìm và quay lại. Các bước server, sở hữu, trao vật tư, xác nhận vào trận và kết quả ở trên là yêu cầu thiết kế tiếp; không có nút nhận đồ/đột phá/đấu giả để minh họa.

## 7. Contract chung cho từng màn khi đặc tả

Mỗi brief cần đi từ **mục tiêu người chơi → dữ liệu nhìn thấy → lựa chọn/hậu quả → xác nhận → kết quả → bước tiếp**. Chốt cùng một bộ trạng thái:

- Chưa biết/chưa mở: lý do và nguồn đạt điều kiện; có nơi tra tiếp.
- Chưa sở hữu/rỗng: biết kiếm ở đâu; khác đã có món nhưng chưa luyện hóa hoặc chưa chọn dùng.
- Thiếu điều kiện: chỉ ra phần thiếu, nguyên liệu đích, nơi/hoạt động hợp lệ.
- Có thể thao tác: nêu chi phí/kết quả/đánh đổi; hành động có mất mát dùng xác nhận cụ thể.
- Đang gửi/đang thực hiện: khóa thao tác trùng và có tiến trình có nguồn; không nhận thưởng từ animation.
- Thành công: snapshot/receipt, phần đã đổi và bước tiếp; retry/reconnect đọc lại kết quả.
- Lỗi/hết hạn/mất kết nối/không đủ quyền: dữ liệu nào còn tin được, cách phục hồi; không replay lệnh đã tiêu đồ.

Khi nối backend theo [Core](ARCHITECTURE.md), UI chỉ đọc view/snapshot và gửi intent; application kiểm character/realm/permission/eligibility; persistence/room sở hữu state và receipt theo từng hệ. FeatureId UI không là quyền server. Debug cần requestId/characterId/realmId/content release/snapshot version và mã lý do; bảng nguồn hiệu lực nối tới definition/owned instance/ledger phù hợp. Preview không thêm definition vào catalog 48 record hoặc đổi schema save.

## 8. Từ thiết kế này tới GDD

**Tiếp nối owner đã yêu cầu:** [Linh Đài 03](CHARACTER-INVENTORY-UX-V3.md) hoàn thiện trước cụm Nhân vật–Hành trang–Trang bị; lối Trang bị của HUD 04 nay mở màn chọn vị trí/món. Những con số/route trong verification 04 bên dưới là snapshot trước đợt này; bản Linh Đài có bằng chứng riêng.

| Gói thiết kế tiếp | Đầu ra để đánh giá | Sau đánh giá cập nhật GDD |
| --- | --- | --- |
| D04-A · Nhận diện/thông tin | HUD/menu/icon, mục đích 38 lối, trạng thái và đường đi | UX/navigation và phạm vi hệ |
| D04-B · Farm–build đầu tiên | Một mục tiêu đồ, một nguồn lặp, một recipe/lựa chọn, màn chuẩn bị/kết quả | Vòng gameplay, nguồn–chi, power pilot |
| D04-C · Tu đạo/đột phá | Một bình cảnh, bằng chứng/chuẩn bị, hành động/kết quả và bộ vận dụng | Cảnh giới/công pháp/thuật/pháp bảo |
| D04-D · PvE/PvP | Một bí cảnh hoặc boss, một tỷ thí, eligibility/credit/loot/reconnect | Luật phiên, sức mạnh, PvE/PvP |
| D04-E · Hiện diện/cộng đồng | Một diện mạo, một dấu thành tựu, đội/public profile; ý tưởng động phủ | Sưu tập/hiện diện/social, chặng tiếp |

Làm mỗi lát đủ hành trình để chơi thử và điều chỉnh. GDD nhận **kết luận được chấp nhận**, còn wireframe/biến thể/giả thuyết có hồ sơ thiết kế riêng. Thiết kế 04 mở rộng tập thông tin cần nghiên cứu; chưa tự chốt stat/chi phí/loot rate/cảnh giới mở từng chức năng, gacha/VIP hoặc bonus sưu tập.

## 9. Trạng thái bàn giao

Đã có index 38 lối, 38 glyph SVG gốc, menu theo mục đích, tìm kiếm, năm ghim desktop, liên kết hệ, trả về menu và bảng so icon cũ/mới. Giữ nền đọc identity/tracker của 03.2, hai theme, HUD skill và các màn nhập môn. Các điều chỉnh chỉ ở review, chưa đổi runtime/map/DB/nhân vật/GDD. Duyệt hình và usability với người chơi vẫn là bước đối chiếu, khác kiểm kỹ thuật.

Kiểm tại [verification 04](data/dao-system-hud-v4-verification.json): **249 cấu hình trình bày / 152 lượt mở hệ / 587 assertion browser**, thêm **96 kiểm tương tác** và **8 bố cục ghim tên dài**. Hai theme, chín viewport từ 320 đến 1600px; không lỗi/tràn chữ/chồng vùng hoặc yêu cầu gameplay. Kiểm tìm không dấu, rỗng, giới hạn/thay/giữ thứ tự ghim, route riêng trang bị/tọa kỵ, liên kết hệ, quay menu/focus và phím mở/đóng kể cả khi nút đang có focus. Hồi quy nhân vật/hành trang 60 cấu hình/55 kiểm, HUD/layer fixture, typecheck/boundary và direct Vite build qua. Build giữ cảnh báo chunk renderer lớn đã có.
