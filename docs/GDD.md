# GDD — Vân Hải Đạo Đồ

**Phiên bản 0.34 · 14/10/2026 · Tái cấu trúc Toàn diện: Một Tuyến Nhân Vật Chính (Huyễn Tâm / Tịch Bạch), Bốn Pháp Bảo Biểu Tượng, Vòng Lặp Sandbox Tu Luyện & Lộ Trình 5 Đại Cảnh Giới.**

> *“Thuận vi phàm, nghịch tắc tiên. Đạo chưa có đường — ta tự mở!”*

---

## 0. Tuyên bố Phạm vi & Trạng thái Phiên bản (14/10/2026)

1. **Bước ngoặt Thiết kế của GDD 0.34 (Dọn dẹp các bản GDD cũ):**
   - Các file GDD phiên bản cũ (`0.24`, `0.26`, `0.32`, `0.33`) đã được dọn bỏ để tránh nhầm lẫn; **`docs/GDD.md` (Phiên bản 0.34 · 14/10/2026) là nguồn GDD duy nhất của dự án**.
   - **Chấm dứt cấu trúc chia 3 nhân vật khởi đầu dùng chung tuyến nhiệm vụ hành chính nhạt nhẽo ("Dấu sai trên vân lộ")**.
   - **Tập trung 100% chiều sâu vào 1 tuyến nhân vật chính duy nhất đi theo con đường Vương Lâm** với 2 tạo hình đã được Owner duyệt ([Approval V5](design/characters/wang-lin-concept-direction-v5/approval.json) & [Pilot V1](design/characters/wang-lin-equipment-production-v1/approval.json)): **Huyễn Tâm (`ID: a` — Nam)** và **Tịch Bạch (`ID: b` — Nữ)** cùng **4 Họ Pháp Bảo Biểu Tượng** (**Kiếm linh · Hứa Lập Quốc, Thập Ức Tôn Hồn Phiên, Xạ Thần Xa, Thiên Nghịch Châu**).
   - **Tư Đồ Nam** và **Lý Mộ Uyển** trở về đúng vai trò kinh điển trong nguyên tác *Tiên Nghịch*: **Tư Đồ Nam** là tàn hồn đại năng thức tỉnh bên trong **Thiên Nghịch Châu** (hệ thống Thức Hải / Chỉ điểm / Giám định cổ bảo); **Lý Mộ Uyển** là nhân vật Nhân Duyên & Đan–Trận trọng tâm từ giai đoạn cuối Ngưng Khí – Trúc Cơ – Kết Đan (Quyết Minh Cốc → Tu Ma Hải).
2. **Ranh giới Bảo toàn Kỹ thuật & Sản xuất (`AGENTS.md`):**
   - Bản GDD 0.34 này là **định hướng thiết kế tổng thể mới** đã chốt cùng Owner ngày 14/10/2026.
   - Tuyến nhiệm vụ hành chính cũ (`HN01–HN12`) và các tài liệu đặc tả cũ của nó đã được dọn bỏ khỏi hệ thống tài liệu và giao diện hiển thị nhiệm vụ để chuyển sang **Mệnh Kiếp Chí (`VG01–VG11`)**.
   - Việc cập nhật GDD **không tự động suy diễn thành duyệt ART/Motion/VFX cho các gói đang sản xuất (V2)**, không sửa SQLite DB, map đã chốt hay bất kỳ file bảo vệ nào trong `basis.json` / `approval.json` / `body-basis.json`.

---

## 1. Bộ Tài Liệu Trụ Cột Của GDD 0.34

| Nhóm | Tài liệu | Nội dung sở hữu |
| --- | --- | --- |
| **Thiết kế Cốt lõi 0.34 (Mới — 14/10)** | **[Thiết kế Lộ trình Giai đoạn, Nhiệm vụ & Nhân vật](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md)** | Kiến trúc 1 tuyến chính (Huyễn Tâm/Tịch Bạch) + Tư Đồ Nam/Lý Mộ Uyển; Vòng lặp 20% Cốt truyện Nghịch thiên + 80% Sandbox; Ma trận 5 Đại Cảnh Giới × 3 Mốc Pháp Bảo; Đặc tả chi tiết Chặng 1 (Ngưng Khí → Trúc Cơ) & Chặng 2 (Kết Đan) |
| **Đặc tả Artwork & Logic Từng Chặng (Mới — 14/10)** | **[Đặc tả Chi tiết Artwork & Logic Theo Từng Chặng](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md)** | Bảng quy chuẩn Canvas/Pivot/Layer; State Machine (`PlayerCultivationState`, `ArtifactLoadoutState`, `StageProgressionLedger`); Phân rã chi tiết **Artwork cần làm × Logic cần code** cho từng Hồi (`VG01 → VG11`) và kiến trúc Chặng 3–5 |
| **Prototype Vòng Lặp G2 (Mới — 14/10)** | **[Prototype Logic Vòng Lặp Tiến Trình & Nhiệm Vụ G2](design/gameplay/wang-lin-progression-loop-prototype-v1/README.md)** | Hiện thực hóa `VG01–VG11` (`Auto-Chain Fact`), 5 Đại Cảnh Giới, 4 Pháp Bảo × 3 Mốc, Nội Giới Tư Đồ Nam, Lò đan Lý Mộ Uyển và 4 Boss Chặng 1 |
| **Nghiên cứu Thị trường & Truyện (Mới — 14/10)** | **[Reference Game Tu Tiên Thị Trường & Nguyên Tác Tiên Nghịch](XIANXIA-MARKET-STORY-REFERENCES-2026-10-14.md)** | Phân tích đối chiếu *Quỷ Cốc Bát Hoang, Mịch Trường Sinh, Đại Hiệp Lập Chí Truyện (`1948980`), Dật Kiếm Phong Vân Quyết (`1876890`), Nhất Niệm Tiêu Dao, Tru Tiên Thế Giới* và bằng chứng chương truyện *Tiên Nghịch* (Ch.8, 17–49, 76, 104, 365–808) |
| **Sản xuất Nhân vật & Pháp Bảo (14/10)** | **[Kế hoạch Triển khai Vương Lâm / Huyễn Tâm – Tịch Bạch](WANG-LIN-IMPLEMENTATION-PLAN.md)** & **[Prototype Cơ chế 4 Pháp Bảo](design/gameplay/wang-lin-equipment-prototype-v1/README.md)** | Lộ trình sản xuất P1–P5 cho Huyễn Tâm (`a`) & Tịch Bạch (`b`), 4 họ Pháp Bảo qua 3 Mốc (I, II, III), thông số kỹ năng ST/AOE và quy tắc thẩm mỹ |
| **Sinh cảnh Thế giới, NPC, Quái & Boss (13/10)** | **[Dàn 14 NPC, 11 Quái/Tinh Anh & 4 Boss Vân Hải](VAN-HAI-LIVING-WORLD-PLAN.md)** & **[Kế hoạch Chiêu thức Boss](BOSS-SKILL-ANIMATION-PLAN.md)** | Roster 14 NPC (Wave A/B), 8 quái thường, 3 tinh anh, 4 Boss (*Vân Nha Lang Vương, Tam Ấn Khôi Lỗi, Cổ Mộc Trấn Khí, Hắc Ấn Chấp Sự*) và [Checklist Cụm Quái](design/characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md) |
| **Hợp đồng Kỹ thuật** | [Kiến trúc](ARCHITECTURE.md) · [Hợp đồng MMORPG](MMORPG-SYSTEM-CONTRACTS.md) | Hợp đồng server-authoritative, quản lý trạng thái và ranh giới module |

---

## 2. Ba Trụ Cột Định Hướng Giải Quyết Tắc Nghẽn Thiết Kế

| Điểm nghẽn ở bản cũ (0.32–0.33) | Giải pháp Đột phá ở GDD 0.34 |
| --- | --- |
| **1. Tắc nghẽn Nhân vật:** Chia 3 nhân vật khởi đầu (Vương Lâm, Tư Đồ Nam, Lý Mộ Uyển) cùng làm đệ tử Ngưng Khí tầng 1 khiến cốt truyện mất chất *Tiên Nghịch* và nhân ba khối lượng việc. | **Một Tuyến Nhân Vật Chính Duy Nhất:** Người chơi hóa thân thành **Huyễn Tâm (Nam)** hoặc **Tịch Bạch (Nữ)** trên hành trình nghịch thiên của Vương Lâm. **Tư Đồ Nam** là đạo sư/tàn hồn trong **Thiên Nghịch Châu**; **Lý Mộ Uyển** là trụ cột Đan–Trận & Nhân Duyên ở Quyết Minh Cốc / Tu Ma Hải. |
| **2. Tắc nghẽn Nhiệm vụ:** Mạch nhiệm vụ *"Dấu sai trên vân lộ"* nặng tính hành chính (kiểm tra kho bãi, báo cáo qua lại), thiếu cảm giác sinh tồn và đoạt thiên cơ. | **Mô hình Lai 20% Cốt Truyện Sinh Tử + 80% Sandbox Mở:**<br>• **20% Tuyến Chính (Mệnh Kiếp Chí):** Ngắn gọn, kịch tính cao (rơi xuống vực nhặt Châu Đá, sát cơ khảo nghiệm, họa diệt môn Hằng Nhạc, huyết chiến Quyết Minh Cốc).<br>• **80% Vòng lặp Sandbox:** Tự do săn Quái/Tinh Anh/Boss, gặp Kỳ ngộ đa nhánh, luyện đan/rèn khí và tiến hóa **4 Họ Pháp Bảo**. |
| **3. Tắc nghẽn Giai đoạn:** Chưa có khung phát triển rõ ràng sau Ngưng Khí, chưa gắn kết 4 Pháp Bảo và 4 Boss mới vào nhịp đột phá cảnh giới. | **Khung 5 Đại Cảnh Giới × 3 Mốc Pháp Bảo:** Nối chặt **Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần** với **Mốc I (Khởi nguyên) → Mốc II (Bản sắc) → Mốc III (Ý cảnh)**. Mỗi cảnh giới có vùng đất mới, hoạt động MMO rõ ràng và Boss Đại Kiếp Nạn gác cổng đột phá. |

---

## 3. Vòng Lặp Gameplay Cốt Lõi (Core Loop)

Người chơi trải nghiệm vòng lặp liên tục, có mục đích rõ ràng ở mọi cảnh giới:

1. **Biến cố / Mục tiêu Cảnh giới:** Nhận diện mối đe dọa hoặc bình cảnh phía trước (ví dụ: cần phá giải *Tam Ấn Khôi Lỗi* hoặc chuẩn bị *Trúc Cơ Đan* trước khi *Hắc Ấn Chấp Sự* ra tay).
2. **Thám hiểm Sandbox & Kỳ ngộ (80% thời lượng):** Ra vùng ngoại vi / rừng sâu / bí cảnh để săn 8 loài yêu thú, 3 tinh anh (*Lang Tuần Sơn, Thiết Giáp Linh Trùng, Phù Sư Hắc Lụa*) và giải quyết các sự kiện Kỳ ngộ đa nhánh.
3. **Chuẩn bị & Luyện hóa:**
   - Dùng **Thiên Nghịch Châu** ngưng tụ lộ thủy, mở Không Gian Nội Giới và nhận chỉ điểm từ **Tư Đồ Nam**.
   - Phối hợp cùng dàn NPC chuyên môn (**Bạch Chỉ / Lý Mộ Uyển** luyện đan, **Tống Thiết** luyện khí, **Tạ Kiếm Sơn** rèn kiếm thức) để nâng cấp trang bị.
   - Tiến hóa và cấu hình **4 Họ Pháp Bảo (Kiếm linh, Hồn phiên, Xạ Thần Xa, Thiên Nghịch Châu)** cùng **3 Khuynh hướng Công pháp**.
4. **Thực chiến Cơ chế & Độ Kiếp:** Đấu với Boss có nhịp báo đòn rõ ràng (*Vân Nha Lang Vương, Tam Ấn Khôi Lỗi, Cổ Mộc Trấn Khí, Hắc Ấn Chấp Sự*), dùng thao tác di chuyển + Pháp bảo để phá cơ chế và **Đột phá Cảnh giới**.

> **Nguyên tắc UX bất di bất dịch:**
> - **Tầng nhỏ tự ổn định:** Khi đủ Tu vi, các tầng nhỏ trong Ngưng Khí tự động tăng và cộng chỉ số ngay; người chơi chỉ bấm đột phá chủ động ở **các mốc mở khóa lớn (Tầng 3, 6, 12)** và **Đại Đột Phá (Trúc Cơ, Kết Đan...)**.
> - **Không chạy việc vặt báo cáo:** Bước nhiệm vụ ngoài thực địa tự động chuyển tiếp; chỉ gặp NPC khi có cốt truyện quan trọng, lựa chọn nhánh nhân duyên hoặc mở tính năng mới.

---

## 4. Hệ Thống Chiến Đấu & Bốn Họ Pháp Bảo Biểu Tượng

Nhân vật chính (**Huyễn Tâm / Tịch Bạch**) làm chủ hệ thống chiến đấu chủ động góc nhìn Isometric, kết hợp **Di chuyển / Lướt né (Dash)** với **Bộ Kỹ Năng Pháp Bảo (ST + AOE)** và **Công Pháp Vận Hành**:

| Họ Pháp Bảo | Kỹ năng Đơn (ST) | Kỹ năng Diện rộng (AOE) | Đặc trưng Cơ chế & Vai trò trong Build |
| --- | --- | --- | --- |
| **Kiếm linh**<br>*(Hứa Lập Quốc)* | `Kiếm Ý Nhất Tuyến`<br>*(Đâm xuyên tuyến 320px)* | `Kiếm Trận Phá Giới`<br>*(Trận kiếm 3 đợt, r=136px)* | **Sát thương bùng nổ & Xuyên thấu:** Tốc độ ra đòn nhanh, tối ưu khi kết liễu mục tiêu đơn lẻ hoặc tỉa máu Boss từ tầm trung. Lên Mốc II có kiếm linh Hứa Lập Quốc mang sát khí tím sẫm. |
| **Hồn phiên**<br>*(Thập Ức Tôn Hồn Phiên)* | `Chủ Hồn Dẫn Lộ`<br>*(Phóng chủ hồn đeo bám)* | `Tam Môn Tụ Hồn`<br>*(Mở 3 cổng hồn, r=168px)* | **Triệu hồi & Rút sinh lực theo nhịp:** Khống chế vùng rộng, gây sát thương duy trì (DoT) và tự hồi phục qua hồn phách thu thập được. Lên Mốc II triệu hồi Chủ Hồn Tinh Anh/Boss. |
| **Xạ Thần Xa**<br>*(Chiến Xa Cổ Tu)* | `Giải Niêm Dẫn Thú`<br>*(Phóng chiến thú húc phá giáp)* | `Lôi Thú Liệt Địa`<br>*(Chiến xa giẫm nát, r=184px)* | **Phá giáp hạng nặng & Làm choáng:** Chuyên trị các đối thủ có khiên dày (*Tam Ấn Khôi Lỗi, Thiết Giáp Linh Trùng*) hoặc phá vỡ đội hình cụm quái đông. |
| **Thiên Nghịch Châu**<br>*(Dị Bảo Bản Mệnh)* | `Dẫn Giới Hộ Thân`<br>*(Khiên hộ thể + Thanh tẩy)* | `Nội Giới Hộ Đạo`<br>*(Trường không gian, r=160px)* | **Hộ đạo, Phản chấn & Không gian riêng:** Bảo toàn tính mạng trước sát chiêu của Boss (*Đạo Ấn / Ấn Hồi* của Hắc Ấn Chấp Sự), hồi linh lực và mở Không Gian Nội Giới gặp **Tư Đồ Nam**. |

---

## 5. Tổng Quan Lộ Trình 5 Đại Cảnh Giới (Stage Progression)

Chi tiết từng bước của Chặng 1 và Chặng 2 được quy định tại **[STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md)**:

1. **Chặng 1 — Ngưng Khí (Tầng 1 → 15) lên Trúc Cơ:**
   - **Bối cảnh:** Hằng Nhạc Ngoại Môn → Tuyến Ngoại Vi → Sân Khảo Nghiệm → Rừng Cổ Mộc → Quyết Minh Cốc.
   - **Tuyến chính (6 Hồi):** *Hồi I: Phế Sài Nhập Môn & Cơ Duyên Châu Đá (Tầng 1–3)* → *Hồi II: Máu Nhuộm Ngoại Vi & Vân Nha Lang Vương (Tầng 4–6)* → *Hồi III: Bí Mật Thức Hải Tư Đồ Nam & Chọn Công Pháp (Tầng 7–9)* → *Hồi IV: Sát Cơ Khảo Nghiệm & Tam Ấn Khôi Lỗi (Tầng 10–12)* → *Hồi V: Rừng Cổ Mộc, Gặp Lý Mộ Uyển & Cổ Mộc Trấn Khí (Tầng 13–15)* → *Hồi VI: Đại Kiếp Nạn Hằng Nhạc, Đấu Hắc Ấn Chấp Sự & Đột Phá Trúc Cơ*.
   - **Mốc Pháp Bảo:** Hoàn thiện **Mốc I (Tự mở đường)** cho cả 4 họ Pháp Bảo.
2. **Chặng 2 — Trúc Cơ lên Kết Đan:**
   - **Bối cảnh:** Quyết Minh Cốc → Hàn Thiết Kiếm Mộ → Vực Ngoại Vân Hải → Cửa ngõ Tu Ma Hải.
   - **Tuyến chính (5 Hồi):** *Hồi VII: Phong Vân Quyết Minh Cốc (Mở Động Phủ/Nội Giới & Hồn Phiên Mốc II)* → *Hồi VIII: Hung Linh Nhập Kiếm (Thu phục Hứa Lập Quốc — Kiếm linh Mốc II)* → *Hồi IX: Hộ Đạo Đan Tâm (Bảo vệ đan thất Lý Mộ Uyển & Mở Xạ Thần Xa Mốc II)* → *Hồi X: Đoạt Mệnh Chân Thân (Tiêu diệt chân thân Hắc Ấn Chấp Sự)* → *Hồi XI: Tiến Vào Tu Ma Hải & Độ Kiếp Kết Đan (Hoàn thiện Thiên Nghịch Châu Mốc II)*.
   - **Mốc Pháp Bảo:** Trọng tâm của gói **Production V2 — Mốc II (Luyện hóa thành bản sắc)**. Mở Bí cảnh tổ đội 2–3 người và Tỷ thí luận đạo.
3. **Chặng 3 — Kết Đan lên Nguyên Anh:**
   - **Bối cảnh:** Tu Ma Hải & Cổ Thần Chi Địa.
   - **Trọng tâm:** Ngưng tụ Đạo Đan chuyên biệt, chiến trường phe phái (Chính – Ma – Tán Tu), săn Boss Thế Giới đoạt nguyên liệu luyện chế Phân Thân và chuẩn bị nhục thân cho **Tư Đồ Nam**.
4. **Chặng 4 — Nguyên Anh lên Hóa Thần:**
   - **Bối cảnh:** Tiên Giới Toái Phiến & Vực Sâu Tinh Không.
   - **Trọng tâm:** Bước vào đại kiếp thọ nguyên của **Lý Mộ Uyển**, lĩnh ngộ **Ý Cảnh Riêng** (*Sinh Tử / Sát Lục / Chân Giả*) và tiến hóa toàn bộ 4 Pháp Bảo lên **Mốc III (Đạo của chính mình)**.

---

## 6. Định Hướng MMORPG & Kinh Tế Bền Vững

- **Solo vẫn sống tốt, Tổ đội thêm chiều sâu:** Toàn bộ mạch truyện chính (Mệnh Kiếp Chí) và nguyên liệu đột phá nền tảng đều có thể hoàn thành Solo nhờ cơ chế phối hợp 4 Pháp Bảo. Các Bí cảnh nhóm 2–3 người (từ Trúc Cơ) và 3–5 người (từ Kết Đan) giúp tăng tốc độ săn nguyên liệu hiếm, mảnh cổ bảo và ngoại trang danh vọng.
- **Kinh tế có điểm tiêu rõ ràng:**
  - *Linh thạch & Linh thảo:* Tiêu hao cho Luyện Đan (**Bạch Chỉ / Lý Mộ Uyển**) và duy trì Trận pháp.
  - *Khoáng thạch & Lõi Khôi Lỗi:* Tiêu hao cho Luyện Khí (**Tống Thiết**) và giải ấn **Xạ Thần Xa**.
  - *Yêu Hồn & Chủ Hồn Boss:* Nguyên liệu độc quyền để nuôi dưỡng **Hồn Phiên** và dung luyện **Kiếm Linh**.
- **Nhân bản Dị Bảo hợp lý trong MMO:** Mỗi người chơi đều sở hữu **Thiên Nghịch Châu** trong hành trình cá nhân của mình; khi bước vào hoạt động chung toàn server, năng lực này được biểu đạt dưới dạng **Nội Giới Hộ Đạo / Ấn Ký Nghịch Thiên** của từng đạo hữu mà không phá vỡ logic thế giới chung.

---

## 7. Phân Kỳ Triển Khai (`G0 → G4`) & Tiêu Chí Nghiệm Thu

1. **G0 (Đã hoàn tất 14/10):** Chốt GDD 0.34, tài liệu Reference thị trường/truyện mới và bản thiết kế chi tiết Chặng 1–2.
2. **G1 (Đang thực hiện theo Plan 14/10):** Sản xuất gói ART/Motion/VFX **Huyễn Tâm & Tịch Bạch × 4 Pháp Bảo (P4–P5)** và hoàn thiện duyệt các gói Quái/Tinh Anh/Boss.
3. **G2 (Prototype Gameplay Chặng 1 trên Fixture):** Chuyển hóa 6 Hồi Chặng 1 (`VG01–VG06`) và vòng lặp Sandbox Ngoại vi lên fixture kiểm thử, nối cùng hợp đồng 4 Pháp Bảo.
4. **G3 (Tích hợp Sinh Cảnh & Boss Chặng 1):** Ghép 14 NPC, 11 Quái/Tinh Anh và 4 Boss vào bản đồ thực địa/khảo nghiệm khi đủ gate duyệt.
5. **G4 (Mở rộng Chặng 2 — Quyết Minh Cốc & Kết Đan):** Đưa gói Pháp Bảo Mốc II, hệ thống Thức Hải Tư Đồ Nam, Đan Thất Lý Mộ Uyển và Bí cảnh tổ đội vào vận hành.
