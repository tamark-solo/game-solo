# Đối chiếu GDD 14/10 và sản xuất tạo hình nhân vật

Ngày15/10/2026 · GDD0.34 · Owner chọn **ART nhân vật theo GDD, làm tạo hình trước**.

[Trang chọn tạo hình mới](design/characters/gdd-character-concepts-v1/index.html) · [Manifest18 neutral](design/characters/gdd-character-concepts-v1/manifest.json) · [Inventory toàn luồng](design/characters/gdd-character-concepts-v1/inventory.json)

## Kết luận từ tài liệu và báo cáo mới

Một tuyến main trên con đường Vương Lâm, hai nhận diện **Huyễn Tâm a / Tịch Bạch b**. Không quay lại mô hình ba nhân vật khởi đầu Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển. Tư Đồ Nam là tàn hồn chỉ điểm trong Châu; Lý Mộ Uyển là Đan–Trận/Nhân Duyên xuất hiện VG05 và nối Quyết Minh Cốc.

Gói V2 MốcII đã đủ512clip/3048key/512track/40FX, delivery vẫn candidate; G2 đã có955checks/9unit trên fixture. Việc thiếu chủ yếu là tạo hình nhập môn, hai nhân vật cốt truyện theo vai mới, bốn NPC WaveB và đối thủ Chặng2. GDD/spec có vài câu còn ghi P4–P5 “đang sản xuất”; báo cáo delivery có timestamp/hash mới là căn cứ coverage. Bộ kế hoạch cũ gộp MốcII ở Kết Đan→Nguyên Anh; GDD0.34 mới đặt luồng mở MốcII tại VG07–VG11 / Trúc Cơ→Kết Đan. Đợt này ghi mapping ART mới, không sửa gói đã khóa hoặc luật game.

## Lớp nhân vật và phương án đã làm

| Lớp | Tài sản đã có | Tạo hình mới trong đợt này |
| --- | --- | --- |
| Main | Hai master V5, tám bộ MốcII đủ tám hướng | Hai áo Ngoại Môn + hai concept áo chung Ý cảnh |
| Nhân vật truyện | Reference Tư Đồ Nam/Lý Mộ Uyển cũ | Tư Đồ Nam tàn hồn/nhục thân; Lý Mộ Uyển Đan sư/kiếp thọ nguyên |
| NPC sinh cảnh | 10 NPC WaveA,240clip; các pilotSE đã duyệt | Lục Văn, A Ly, Mạc Bà, Tiểu Nghiên |
| Quái/Tinh anh | 11 actor Chặng1,440clip/2640pose vàVFX02 | Kiếm Nô Khôi Lỗi, Âm Thi Tu Sĩ, Huyết Phù Sư |
| Boss | Lang Vương motion/VFX duyệt; Hắc neutral03/VFX02 duyệt, motion candidate; Tam/Cổ neutral candidate | Hứa Lập Quốc, Huyết Giáp Khôi Lỗi Thống Lĩnh, Hắc Ấn chân thân |

Tổng **18 phương án neutral mới, tương ứng14 identity/vai với các biến thể tiến triển;21 raw source gồm3 source đã sửa**. Mỗi phương án mới có đúng một góc Đông Nam, body/source/prompt/input/hash và registration. Gói này không phát sinh motion clip hoặc external FX. Những actor có từ trước giữ nguyên và liên kết review; không nhân tên hoặc sao pixels để tuyên bố thêm tài sản.

## Đường tiến triển và gate

1. **Nhập môn / MốcI:** body-only chưa kiếm/châu ở đầuVG01; sau proof mới hiện gear tiền thân. Neutral main ở đây là áo chung đầu chặng, chưa phải tám bộ familyM1.
2. **VG03–VG06:** Tư Đồ Nam tàn hồn, Lý Mộ Uyển Đan sư và bốn NPCWaveB bổ sung rõ nghề/diện mạo. Chọn neutral trước portrait, view/action và FX nghề.
3. **VG07–VG11 / MốcII:** dùng lại bộ player đã sản xuất. Chọn ba quái và ba bossChặng2 mới trước motion và chiêu; linh ảnh không tự là entity/HP/loot.
4. **Chặng4–5 / MốcIII:** các state Tư Đồ Nam nhục thân, Lý Mộ Uyển bạc tóc và main Ý cảnh là concept tương lai. Tám bộ familyMIII, Nguyên Anh48×64, Đạo Đan/Đạo Vực và chuỗi comboF vẫn là sản xuất riêng sau khi chốt tạo hình/cơ chế.

Mọi bước: **neutral owner chọn → view thật → action/gear → FX tách → QA → owner approval theo hash → integration phạm vi riêng**. Không suy duyệt Tam/Cổ hoặc V2 mới từ việc GDD nhắc đến chúng. Không mở registry/save/AI/balance, map/navigation/blocker/DB/draft/receipt.

## Bàn giao và giới hạn

- Main giữ ownidentity PRIMARY; Wang là tỷ lệ/pixel support. NPC người dùng WangImage1 PRIMARY anatomy/style; source nhận diện riêng là input phụ.
- Human80px; Kiếm Nô72, Hứa96, Thống Lĩnh128 là nominal concept mới. Một scale/source, rootboot/stonefoot có witness; linh thể ghi groundprojectionước lượng thay vì giả boot. Softalpha được giữ cho linh thể; không trừ lift hai lần.
- Ba sửa r2: tóc Tư Đồ Nam, tóc Lý Mộ Uyển, tay Kiếm Nô bị cắtsource. Lượt cũ giữhistory và lineage, không active.
- Các delta chưa ép sửa: tóc Tiểu Nghiên/Huyết Phù Sư dài khácbrief, Tịch Bạch Ý cảnh thiênngà/lục. Đây là lựa chọn để owner xem trong gallery.
- Kiểm gói mới: **472CPU/lineage/asset checks**, **50browser checks**, **36ThreeGPU readback** cho18native/atlas. GPU so alpha và màu hiển thị premultiplied với tolerance1.5 vì decode softalpha trong browser; CPU atlas/canonical đối chiếu nguyênRGBAbyte.
- V2delivery cũ đã verify lại read-only:27.445pin,1.227basis,11runtime/map nguyênhash.

Owner đã chấp nhận 18 tạo hình trong lượt15/10. [Approval neutral](design/characters/gdd-character-concepts-v1/approval.json) pin source/native/lineage đúng một hướng Đông Nam; view/action/FX/runtime vẫn là các bước riêng. Concept V5 và các approval pilot cũ tiếp tục đúng phạm vi của chúng.


## Dọn ART đối thủ GDD cũ sau duyệt

10 gói quái/tinh anh/boss cũ được chuyển khỏi danh mục active theo yêu cầu owner. Mọi source, motion, VFX, approval và evidence cũ được bảo toàn trong ZIP; các dòng coverage Chặng1 ở bảng trên là **inventory lịch sử**, không còn là ART basis hiện hành. GDD vẫn giữ các tên/role/logic Chặng1; quyết định tạo hình mới của chúng phải theo scope riêng, không tự khôi phục bộ cũ. Xem [biên bản dọn15/10](GDD-LEGACY-ENEMY-ASSET-CLEANUP-2026-10-15.md).
