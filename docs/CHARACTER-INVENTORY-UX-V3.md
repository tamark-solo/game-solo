# Linh Đài 03 — Nhân vật, Hành trang và Trang bị

**Cập nhật màn nhân vật:** [Nhân vật 04](CHARACTER-SHEET-UX-V4.md) thay Tổng quan/Tu luyện và thêm reader Thuật rõ hơn. Luồng quản lý đồ và điều kiện trong tài liệu 03 tiếp tục dùng; ảnh/check 03 giữ làm lịch sử.

**11/10/2026 · Theo yêu cầu owner sau HUD 04.** Owner đồng ý hoàn thiện cụm Nhân vật–Hành trang–Trang bị. Đợt này nối một hành trình sử dụng đồ đầy đủ trong [trang đối chiếu](http://127.0.0.1:5174/ui-material-review.html), giữ hướng Tu Đạo/Đọa Ma và phục vụ thiết kế trước khi mở rộng GDD.

Đọc cùng [HUD/chức năng 04](XIANXIA-FUNCTION-UX-REDESIGN.md), [UI nhân vật 02](CHARACTER-INVENTORY-UI-DESIGN.md), [backend hành trang hiện có](HANG-NHAC-CHARACTER-RUNTIME.md) và [Core](ARCHITECTURE.md). Trang này dùng hồ sơ mẫu, không tài khoản đang đăng nhập; các thay đổi ở đây chưa ghi vào game.

## 1. Hành trình đã nối

```text
Nhân vật → Trang bị → chọn vị trí/món
  → đọc công dụng, điều kiện và nguồn nhận
  → so sánh với món đang mang hoặc vị trí trống
  → Trang bị / Tháo về túi
  → chờ xác nhận → đọc thay đổi
  → Hành trang: Trong túi / Đang mang
  → Nhân vật: số món, nguồn thuộc tính và bước tiếp
```

Hành trình vật tư: **Hành trang → chọn vật tư → đọc công dụng/nguồn HN01 → xem nhiệm vụ → về đúng vật phẩm → dùng một phần → kết quả HP/số lượng → hồi dùng**. Sinh lực đầy giữ vật tư. Hết stack thì trở lại danh sách và hiện trạng thái trống, không để mobile đứng ở chi tiết đã biến mất.

## 2. Các màn và thông tin

| Màn | Thông tin và thao tác hiện có |
| --- | --- |
| **Nhân vật / Tổng quan** | Danh tính mẫu, nhập môn/M01, HP/MP, tu vi/nền vận khí, số món đang mang, ba thuật và lối HN03; chọn món trên người mở đúng chi tiết hành trang |
| **Thuộc tính** | Nền tối đa 100/100, nguồn từ nền nhân vật, tu đạo, trang bị và hiệu ứng; phân biệt sinh lực hiện tại với tối đa; bảng thay đổi gần nhất |
| **Trang bị** | Vũ khí, pháp y, ngọc sức/pháp bảo theo contract hiện có. Chọn vị trí; đọc món phù hợp; mang/tháo, so sánh, bảo vệ. Vị trí trống nói rõ chưa mang/chưa có và đưa lối tra tiếp |
| **Hành trang** | Nhóm đồ, tìm không dấu, sắp xếp tên/nhóm, xem Tất cả/Trong túi/Đang mang, số lượng/bảo vệ, chi tiết và nguồn. Mỗi món chỉ có một bản sở hữu |
| **Chi tiết** | Tên/ART, công dụng, vị trí hoặc điều kiện sử dụng, nguồn ban đầu, dấu bảo vệ, so sánh hai vế, điều kiện thao tác và kết quả vừa xác nhận |
| **Nguồn nhận** | Accordion có thể mở bằng click/chạm; HN01 dẫn tới sổ thật về định nghĩa nhiệm vụ, rồi về đúng món và trả focus |

Nav chung **Nhân vật / Trang bị / Hành trang / Diện mạo** giữ vị trí ở hai theme. Tu luyện/Pháp bảo của bản 02 vẫn có trong Nhân vật. Phím/ghim của HUD 04 dùng lại; icon Trang bị nay mở màn Trang bị thay trang brief.

## 3. Dữ liệu dùng để kiểm luồng

Đọc ba định nghĩa có sẵn từ `shared/character-inventory.ts`, dùng inventory từ `initialProfile` riêng và một nguồn vật tư `state.sect.supplies`:

- **Mộc kiếm nhập môn / Áo vải môn phái:** hai instance ban đầu; mặc định đang mang. Mang/tháo chỉ đổi vị trí, giữ ID và quyền ba thuật R01; max HP/MP 100/100. Không thêm món tăng stat để làm bảng so sánh đẹp hơn.
- **Vật tư hồi phục:** mẫu có hai phần từ HN01. Dùng một hồi 30 HP, chặn khi đầy, hồi dùng 10 giây. Bảo vệ không chặn thao tác dùng vật tư theo luật runtime hiện có.
- Ngọc sức/pháp bảo chưa có instance. UI có lời giải thích và lối Pháp bảo, không tự thêm ô có món hoặc cảnh giới mở khóa giả.
- Nguyên liệu/vật nhiệm vụ chưa có trong fixture: nhóm trống có hướng tra nguồn, không bịa sức chứa/kho/currency/rarity.

So sánh khi đang mang chính món đang chọn hiển thị **cùng món**. Sau tháo, vế đang mang là **vị trí trống**; trước/sau max HP/MP vẫn 100 → 100. Thay đổi mang/tháo được giải thích bằng vị trí và nguồn, không tô một món thành mạnh hơn từ màu icon.

Hình nhân vật đang được owner làm lại, vùng Linh ảnh giữ chỗ để đối chiếu sau. Chưa thay sprite/portrait/tỷ lệ/anchor/camera hoặc ART map. Khung, item ART, glyph HUD đều dùng nguồn dự án hiện có; đợt này không tạo raster mới.

## 4. Trạng thái và phản hồi

Control **Tình huống hành trang** trên review cho thử Có thể thao tác / Đang luyện thuật / Mất kết nối / Chờ xác nhận / Yêu cầu bị từ chối / Hành trang trống. Control HUD Sinh lực thấp tạo tình huống dùng vật tư.

| Trạng thái | Hành vi bản thử |
| --- | --- |
| Có thể thao tác | Nêu món, thao tác và điều kiện trước nút; bảo vệ/so sánh tách mang/tháo |
| Đang luyện thuật | Chặn mang/tháo/dùng; giải thích cần kết thúc bài; bảo vệ vẫn được thử theo policy hiện có |
| Chờ xác nhận | Khóa thao tác trùng; chưa đổi trang bị, số lượng hoặc HP; hoàn tất mẫu sau 450ms |
| Từ chối | Giữ nguyên dữ liệu, báo yêu cầu chưa chấp nhận; không biến animation/nhãn nút thành kết quả |
| Mất kết nối | Chặn lệnh và nói cách phục hồi; đổi tình huống trong lúc chờ hủy request mẫu, callback cũ không replay |
| Sinh lực đầy / hồi dùng | Giữ số lượng, nêu lý do; thời gian hồi đọc từ clock mẫu, nút mở lại khi hết hạn |
| Không có đồ / không tìm thấy | Hiện danh sách trống, hướng bỏ lọc/tìm hoặc tra nguồn; không giữ màn chi tiết vô hiệu |
| Thành công | Bảng vị trí, HP hoặc số lượng trước → sau và feedback ở ngay cửa sổ; đổi theme giữ kết quả |

Trạng thái rỗng là projection để xem bố cục; không xóa hai instance thật trong fixture. Ghim, tìm, lọc, bảo vệ, mặc/tháo và số lượng nằm trong memory riêng. Reload khởi tạo lại mẫu; không có autosave, browser storage, API/room/SQLite hoặc thao tác với DB thật.

## 5. Desktop, mobile và đọc chữ

Desktop giữ danh sách và chi tiết cạnh nhau; thao tác nằm ngoài vùng mô tả cuộn. Cửa sổ tăng vùng đọc, nút chính có nền tối để tương phản với giấy. Status ở trong cửa sổ; bỏ toast lặp che footer ở Nhân vật/Hành trang.

Mobile giữ **danh sách → chi tiết → quay lại**. Khi mở từ Nhân vật còn có lối về đúng tab gốc; nguồn HN01 giữ lựa chọn và focus khi quay lại. Tìm/sắp xếp/bộ lọc vẫn đọc được trên màn hẹp. Gear chọn vị trí rồi đọc món; vùng hình/slot và vùng đọc cùng cuộn khi cần. Các dòng dài xuống hàng, không ép tên đồ vào một dòng hoặc kéo khung khỏi nền.

Quy tắc frame/aperture vẫn dùng chung box đã có. Board review có chiều cao riêng; kết quả này không tự nghiệm thu viewport H5 native của game hoặc hình nhân vật chưa đối chiếu.

## 6. Core và bước nối backend

- `core/ui-material-review-state.ts`: một state fixture — inventory sở hữu/equipment/protection, số lượng ở sect, lọc/vị trí/sắp xếp, request đang chờ, kết quả, nguồn mở và nguồn quay lại. DOM ID control ở Core.
- `core/dao-character-review-model.ts`: view projection và transition để thử UX; đọc shared definition, không framework/DOM/transport. File chỉ dùng bởi review, không được nhập vào live game để thay policy server.
- `ui/dao-character-review.ts` và `dao-character-review-v3.css`: trình bày dữ liệu/điều kiện và các màn, không tự ghi đồ. Adapter `ui-material-review.ts` ghép input, callback mẫu, focus và clock.
- Mô hình `CharacterInventory` đã có version 1 và hai owned gear, equipment theo instance ID. Không thêm counter vật tư thứ hai hoặc migrate save từ thay đổi UI.

Backend thật **đã có** equip/unequip/use/protect, private character snapshot, revision/receipt và persistence. Khi ghép UI mới, thay transition mẫu bằng adapter đọc `CharacterView` và gửi `CharacterCommand` qua session hiện có; server giữ actor/lesson/cooldown/ownership và transaction. Lý do trong UI là hướng dẫn, không quyền được tin từ client. Pending kết thúc theo kết quả và snapshot; reconnect đọc lại, không phát lại lệnh dùng đồ.

## 7. Thông tin để phát triển GDD sau đối chiếu

| Đã có cơ sở để đánh giá | Cần thiết kế tiếp trước mở gameplay |
| --- | --- |
| Người chơi thấy rõ nguồn và thay đổi của món, vị trí, hiện tại/tối đa | Power pilot: món có tác dụng gì, nguồn farm, nơi thử, đánh đổi |
| Slot hiện có: vũ khí/pháp y/ngọc sức–pháp bảo | Danh sách slot dài hạn, quan hệ pháp bảo riêng và vị trí đang mang; không suy từ bố cục paperdoll |
| UI có vùng nguồn thuộc tính và hai vế so sánh | Trục công kích/phòng thủ/kháng/hồi phục và hiệu lực công pháp–thuật–pháp bảo, chỉ sau khi có tình huống combat để đánh giá |
| Dấu bảo vệ, quantity, nguồn nhận và nhóm đồ | Binding, dung lượng/kho, loot, bán/vứt/trao đổi và recipe, mỗi thao tác có nguồn–chi và quyền |
| Hình nhân vật có vùng riêng, liên thông Diện mạo | Hình mới, trang phục/pháp bảo/tọa kỵ và quyền apply; sưu tập khác nguồn power |

Không sửa GDD trong đợt này; hồ sơ UX là cơ sở để chốt kết luận vào GDD. Nhánh Tu đạo/farm–build tiếp theo nối trực tiếp qua lối chức năng của HUD 04.

## 8. Nguồn tham khảo và kiểm chứng

Học cách đọc hai vế **đang mang / đang xem** từ [FFXIV Item Comparison](https://na.finalfantasyxiv.com/uiguide/equipment/equipment-compare/equipment_compare.html), đã kiểm lại nguồn chính thức ngày 11/10. Đối chiếu vai trò màn/shortcut theo [hồ sơ reference tu tiên 04](XIANXIA-FUNCTION-UX-REDESIGN.md). Giữ ART/icon/luật của dự án.

[Verification Linh Đài 03](data/dao-character-v3-verification.json) ghi layout, trạng thái, workflow, HTTP/storage isolation và hồi quy. Source code/UI mới chưa được suy thành ART approval; kết quả kỹ thuật khác đánh giá usability của owner/người chơi.

**Bản cuối qua:** 171 cấu hình trình bày/chữ trên chín viewport × hai theme, gồm đọc 200%; 48 cấu hình sáu tình huống; 108 assertion luồng trên desktop/mobile. Hồi quy HUD 249 cấu hình/152 route/587 assertion, HUD/layer fixture, typecheck/boundary và direct Vite build qua. Không lỗi browser/gameplay request/storage. Build giữ cảnh báo chunk renderer lớn đã có. [Manifest luồng/hash nguồn](design/ui/dao-character-v3/README.md).

Diện Mạo giữ việc thử/bỏ bảng màu có thay đổi hình nền nhìn thấy được: bốn kiểm hồi quy ở hai theme qua. CSS nền Linh Đài 03 chỉ áp dụng ở Nhân vật, không ghi đè bảng phối màu của Diện Mạo.
