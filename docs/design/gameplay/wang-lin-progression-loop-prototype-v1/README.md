# Prototype Vòng Lặp Tiến Trình & Nhiệm Vụ: Huyễn Tâm và Tịch Bạch (Nhánh G2)

Ngày 14/10/2026 · Nhánh G2 · Fixture độc lập · Chưa tích hợp runtime.

Gói này hiện thực hóa **Logic Vòng Lặp Cốt Lõi & Kịch Bản Chặng 1–2 (`VG01–VG11`)** theo [GDD 0.35](../../../GDD.md), [hợp đồng thống nhất](../../../GDD-035-UNIFIED-CONTRACT.md), [Thiết kế lại Tiến trình & Nhiệm vụ](../../../STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) và [Đặc tả Artwork & Logic Từng Chặng](../../../STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md), kết nối trực tiếp (read-only) với [core.mjs](../wang-lin-equipment-prototype-v1/core.mjs) của gói P2. Đây vẫn là fixture G2 lịch sử, chưa phải tích hợp runtime đầy đủ.

Toàn bộ con số ngưỡng tu vi, hệ số công pháp, tỷ lệ rơi đồ và thời gian cảnh báo Boss trong gói này là **số thử nghiệm trên nhánh fixture**, dùng để kiểm chứng vòng lặp gameplay trước khi mở migration sang server/runtime chính.

---

## 1. Bốn Hợp Đồng Trạng Thái Cốt Lõi

1. **`PlayerCultivationState`:**
   - Hỗ trợ cả hai danh tính trên một tuyến Vương Lâm duy nhất: **Huyễn Tâm (`a`)** và **Tịch Bạch (`b`)** (`64×96` neutral / `112×112` motion, cao `80px`).
   - **5 Đại Cảnh Giới (`REALMS`):** `ngung_khi` (15 tầng) → `truc_co` (4 tiểu cảnh giới) → `ket_dan` (4 tiểu cảnh giới) → `nguyen_anh` (4 tiểu cảnh giới) → `hoa_than` (4 tiểu cảnh giới).
   - **Quy tắc Tầng Thường vs. Tầng Cột Mốc (`Sub-stage Auto vs. Gate Breakthrough`):**
     - Các tầng thường (`Ngưng Khí 2, 4, 5, 7, 8, 10, 11, 13, 14`) tự động thăng cấp ngay ngoài thực địa khi đủ `totalCultivationExp`.
     - Các tầng cột mốc (`Ngưng Khí 3, 6, 9, 12, 15`) yêu cầu đủ `totalCultivationExp` **VÀ** hoàn thành `requiredBreakthroughFact` tương ứng.
2. **`ArtifactLoadoutState` (4 Pháp Bảo × 3 Mốc Tiến Hóa):**
   - **Kiếm linh (`sword`):** Mốc I (*Thanh Phong Linh Kiếm* — `VG01/VG02`) → Mốc II (*Hung Linh Hứa Lập Quốc* — `VG08`, tăng `25%` sát thương khi mục tiêu `< 50% HP`) → Mốc III (*Tử Kim Ma Kiếm Hóa Hình*).
   - **Hồn phiên (`banner`):** Mốc I (*Tiểu Hồn Phiên* — `VG02`) → Mốc II (*Tam Môn Tôn Hồn Phiên* — `VG07/VG10`, dung nạp Chủ Hồn Giả Đan thứ ba) → Mốc III (*Thập Ức Tôn Hồn Phiên*).
   - **Xạ Thần Xa (`chariot`):** Mốc I (*Giải Ấn Nhất Tầng* — `VG04`, phá `200%` giáp/ấn) → Mốc II (*Giải Ấn Lôi Thú* — `VG09`) → Mốc III (*Tam Ấn Viễn Cổ*).
   - **Thiên Nghịch Châu (`bead`):** Pháp bảo Hộ Đạo / Nội Giới chuyên biệt (`support/control`, không gây sát thương trực tiếp): Mốc I (`Dẫn Giới Hộ Thân` ở `VG01`, `Nội Giới Hộ Đạo` ở `VG05`) → Mốc II (*Mở Không Gian Nội Giới & Ngũ Hành Viên Mãn* ở `VG07/VG10`) → Mốc III (*Thiên Nghịch Đạo Vực*).
3. **`StageProgressionLedger` & Quy Tắc Tự Động Hóa Bước Nhiệm Vụ (`Auto-Chain Fact Rule`):**
   - Thực thi trọn vẹn **11 Hồi (`VG01` → `VG11`)** của **Mệnh Kiếp Chí**.
   - Khi `recordFact(factId)` được ghi nhận ngoài thực địa (nhặt Châu Đá, hạ Boss, phá mắt trận), hệ thống tự động trao thưởng, mở khóa kỹ năng Pháp Bảo, tự động xét thăng tầng và chuyển thẳng sang bước kế tiếp kèm thoại truyền âm (`voiceoverSpeaker` / `voiceoverLine`), loại bỏ hoàn toàn việc chạy bộ về trả nhiệm vụ hành chính.
4. **`NoiGioiState` (Thiên Nghịch Châu & Tư Đồ Nam) + `LiMuwanAlchemyState` (Lò Đan Lý Mộ Uyển):**
   - **Tư Đồ Nam** thức tỉnh trong Châu ở `VG03`, mở bảng **3 Khuynh Hướng Công Pháp (`Stance System`)** đổi tự do ngoài giao chiến:
     - `sword_kill` (*Kiếm Sát Quyết*): `+15%` sát thương Kiếm linh, giảm `1000ms` hồi chiêu `Kiếm Ý Nhất Tuyến`, xuyên `20%` giáp.
     - `soul_command` (*Ngự Hồn Quyết*): `+20%` sát thương Hồn phiên, mỗi nhịp trúng hồi `3% Max HP`.
     - `chariot_bulwark` (*Trấn Nhạc Quyết*): `+18% Max HP`, tăng `30%` lá chắn `Dẫn Giới Hộ Thân`, tăng hệ số phá ấn của Xạ Thần Xa lên `2.5×`.
   - **Lý Mộ Uyển** kết nhân duyên ở `VG05`, mở Lò Đan luyện *Trúc Cơ Đan*, *Thiên Ly Đan* và trao *Ngọc Giản Hộ Mệnh* (`VG09`) tự động đỡ 1 đòn chí mạng.

---

## 2. Cơ Chế Thực Chiến 4 Boss Chặng 1 & Bù Đắp Đạo Cơ Trúc Cơ

- **Boss 1 — Vân Nha Lang Vương (`VG02`):** Nếu người chơi hoàn thành kỳ ngộ phá `3 Cọc Hắc Phù` trước trận, tốc độ công của Lang Vương giảm `15%`; sau cú chồm `Liệt Phong Phác` có cửa hồi thế `1400ms`.
- **Boss 2 — Tam Ấn Khôi Lỗi (`VG04`):** Có 3 lớp giáp ấn tại `100% / 66% / 33% HP`; dùng *Phá Cấm Phù* của Tống Thiết hoặc `Xạ Thần Xa` phá vỡ ấn sẽ mở cửa `Staggered` (`3000ms`, nhận `150%` sát thương).
- **Boss 3 — Cổ Mộc Trấn Khí (`VG05`):** Boss đứng cố định điều khiển địa hình (`stationaryRooted: true`); chặt đứt 3 nhánh rễ nhiễm Hắc Ấn bằng AOE Pháp Bảo sẽ mở `CoreExposed` (`6000ms`, nhận `200%` sát thương).
- **Boss 4 — Hắc Ấn Chấp Sự (`VG06`):**
  - `Phân Phù` tạo 2 dư ảnh mờ tan lệch nhau `80ms`, `mirageIsEntityWithHpOrLoot: false`.
  - `Ấn Hồi` thu vòng ấn bán kính `112px` nhưng luôn mở **khe an toàn 90°** theo hướng khóa (`evaluateAnnularSealSector()`). Với tốc độ chạy bộ `80 px/s` trong `1100ms` báo hiệu (`88px`), người chơi luôn kịp lách vào khe `90°` để miễn thương hoàn toàn.
- **Ba Phẩm Chất Trúc Cơ & Bù Đắp Đạo Cơ (`upgradeFoundationQuality()`):**
  - Hỗ trợ `mortal` (*Phàm Đạo* `+40%`), `earth` (*Địa Đạo* `+55%`), `heaven` (*Thiên Đạo* `+70%`, `-10%` hồi chiêu Pháp Bảo).
  - Người chơi đột phá ở Phàm/Địa Đạo có thể quay lại săn đủ 3 Linh Vật Boss và vượt Hắc Ấn Chấp Sự hoàn mỹ để nâng cấp lên **Thiên Đạo Trúc Cơ** bất cứ lúc nào.

---

## 3. Kiểm thử & Sân chơi

```powershell
node --test tests/unit/wang-lin-progression-loop-prototype.test.mjs
node docs/design/gameplay/wang-lin-progression-loop-prototype-v1/verify.mjs
```

- [core.mjs](core.mjs): Module ESM thuần, không I/O, tích hợp với `../wang-lin-equipment-prototype-v1/core.mjs`.
- [contracts.json](contracts.json): Bản JSON đóng băng của toàn bộ hợp đồng tiến trình, cảnh giới, pháp bảo, công pháp, 11 hồi và Boss.
- [fixtures.json](fixtures.json): Bộ kịch bản kiểm thử tất định.
- [index.html](index.html): Sân chơi trình duyệt tương tác để duyệt nhanh 11 Hồi `VG01–VG11`, 4 Pháp Bảo × 3 Mốc, 3 Công Pháp và kiểm tra hình học khe `90°` của chiêu *Ấn Hồi*.
- [verify.mjs](verify.mjs): Kiểm tra parity JSON, chạy walkthrough `VG01–VG11` cho cả `Huyễn Tâm (a)` và `Tịch Bạch (b)`, đối chiếu toàn bộ pin SHA-256 của V5, P2, V1 và 11 file runtime/map bảo vệ của V2, và xuất [review/verification.json](review/verification.json).
