# Tạo hình nhân vật theo GDD 0.34

Sản xuất ngày **15/10/2026**, theo [GDD ngày14/10](../../../GDD.md), [đặc tả ART/logic từng chặng](../../../STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md) và owner chọn “ART nhân vật theo GDD, làm tạo hình trước”.

[Trang chọn tạo hình](index.html) · [Manifest](manifest.json) · [Danh mục GDD và phần cần tiếp nối](inventory.json) · [Bảng native2×](review/lineup-dark-2x.png)

## Phạm vi đã sản xuất

**18 neutral Đông Nam mới / 21 source ImageGen built-in**. Ba source r1 bị loại khỏi lựa chọn active nhưng giữ history: tóc Tư Đồ Nam, tóc Lý Mộ Uyển và nắm tay Kiếm Nô bị cắt mép. Không có animation hoặc external FX mới trong gói này.

| Nhóm | Tạo hình | Chặng / vai trò |
| --- | --- | --- |
| Main nhập môn | Huyễn Tâm, Tịch Bạch · Áo Ngoại Môn | VG01–VG06; body chưa đeo pháp bảo |
| Nhân vật truyện | Tư Đồ Nam tàn hồn; Lý Mộ Uyển Đan sư | VG03 và VG05 trở đi |
| NPC Wave B | Lục Văn, A Ly, Mạc Bà, Tiểu Nghiên | Bổ sung bốn vai còn thiếu của roster14 |
| Quái Chặng2 | Kiếm Nô Khôi Lỗi; Âm Thi Tu Sĩ; Huyết Phù Sư | Kiếm Mộ / Quyết Minh Cốc / Huyết Đàn |
| Boss Chặng2 | Hung Linh Hứa Lập Quốc; Huyết Giáp Khôi Lỗi Thống Lĩnh; Hắc Ấn chân thân | VG08–VG10 |
| Main chặng sau | Huyễn Tâm, Tịch Bạch · Ý cảnh | Concept áo chung MốcIII; chưa đủ bốn bộ family |
| Trạng thái truyện về sau | Tư Đồ Nam nhục thân; Lý Mộ Uyển kiếp thọ nguyên | Chặng4; không là actor mới được mở khóa ngay |

Gói MốcII V2 và 10 NPC WaveA được liên kết read-only trong trang review. 11 quái/tinh anh và bốn boss Chặng1 thuộc bộ GDD cũ đã [lưu trữ](../../../archive/gdd-legacy-enemies-2026-10-15/README.md) theo yêu cầu owner15/10; không còn là bộ ART hiện hành. Đã đọc báo cáo V2 (512clip/3048key) và G2 (955checks/9unit); các câu “đang sản xuất” trong văn bản lịch sử không thay thế trạng thái delivery hiện tại.

## Chuẩn và phân lớp

Main dùng own P1/master V5 làm PRIMARY nhận diện/anatomy; Wang chỉ hỗ trợ nét pixel/camera. NPC người mới dùng Wang Pixel02 cùng hướng ở Image1, reference nhận diện riêng ở input phụ. Tư Đồ Nam/Lý Mộ Uyển giữ căn cứ tạo hình cũ nhưng cập nhật đúng vai và phục trang GDD; không tiếp tục coi họ là hai tuyến người chơi khởi đầu.

Human neutral64×96/(32,88), body80px. Kiếm Nô72px dùng112×112/(56,104); Thống Lĩnh128px dùng192×176/(96,160). Một factor/source, nearest sampling, không mirror hoặc fit pose. Giày/root được ghi bằng hai điểm boot/stone-foot được xem trong source; hai linh thể có **ground projection ước lượng** và uncertainty riêng, không nhận là boot root. Tàn hồn80px và Hứa Lập Quốc96px giữ soft alpha; phần thấp tự tan là intrinsic body, không là kit FX ngoài thân. Renderer không trừ lift lần hai.

Thân/áo và wearable accessory là tạo hình; vật cầm rời, pháp bảo, external soul mist, aura/domain và skill FX làm layer riêng ở bước sau. Không sinh attack/damage bằng artwork. Source RGBA giữ nguyên; binary-alpha128 chỉ áp canonical người/khôi lỗi. Atlas mới là atlas **18 neutral tĩnh**, không giả animation.

## Giới hạn của bộ tạo hình đã duyệt

- Main MốcIII chỉ mới concept áo chung; Tịch Bạch lượt này thiên ngà/lục, chưa theo mantle tối hoàn toàn. Bộ family riêng và Ý Cảnh/AOE chưa sản xuất.
- Tiểu Nghiên và Huyết Phù Sư có đuôi tóc dài hơn/khác bản brief ban đầu; ghi rõ trong source assessment và UI.
- Hứa Lập Quốc là tạo hình game chuyển thể, không tuyên bố chân dung canon. Boss Huyết Giáp chọn nhánh **Khôi Lỗi Thống Lĩnh**, tách khỏi vật trang bị Xạ Thần Xa.
- Thiên Nghịch Châu hỗ trợ/control; ghost/summon, portrait và map/prop vẫn là hạng mục riêng.
- Chặng4–5 trong GDD mới là định hướng. Các mẫu tương lai không mở nhiệm vụ, balance hoặc unlock tương ứng.

## Gate tiếp nối

Chọn neutral/nhận diện → view thật cùng identity → idle/talk/cử chỉ hoặc body/gear/cast → external FX → kiểm native/Three/fixture → owner duyệt theo hash → tích hợp phạm vi riêng. Tạo hình quái/tinh anh/boss Chặng1 cần quyết định scope GDD mới; không tự lấy lại source hoặc motion của kho cũ. MốcI family variants và tám bộ MốcIII còn được ghi trong inventory.

`prepare.py` fail khi ledger tồn tại. `record.py` giữ raw và prompt/input hash; corrective sibling giữ source cũ. `pack.py` chỉ ghi root mới; `verify.py` kiểm source/atlas/native/lineage/basis; `review/browser-verify.mjs` kiểm trang chọn và Three texture/pivot thật. Không full assets/build, map builder, DB, receipt hoặc runtime.

**18 neutral Đông Nam đã được owner duyệt15/10.** [Approval](approval.json) khóa source/native/lineage; helpers không ghi lại bộ đã duyệt. Manifest sản xuất giữ nguyên status tại thời điểm đóng source; approval là hồ sơ bổ sung có hiệu lực. Ghim trong UI chỉ để so sánh. View/action/FX/runtime chưa được mở approval. Verification đọc bốn ảnh basis cũ qua resolver ZIP đúng hash; đây là provenance lịch sử, không runtime fallback.

## Handoff cập nhật 16/10

Gói này là canonical concept basis cho Main theo [kế hoạch tích hợp](../../../CHARACTER-ASSET-INTEGRATION-PLAN-2026-10-16.md). Việc duyệt neutral không tự chuyển asset vào runtime; handoff Main, registry và smoke test là các bước riêng. Cleanup dùng [sổ cleanup](../../../archive/character-asset-cleanup-2026-10-16/README.md), giữ nguyên raw/hash/checkpoint và không xóa archive lịch sử.
