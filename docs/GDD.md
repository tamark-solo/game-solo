# GDD — Vân Hải Đạo Đồ

> **Thống nhất 15/10:** [Hợp đồng GDD 0.35](GDD-035-UNIFIED-CONTRACT.md) quy định điều kiện mở khóa, hai nhánh Trúc Cơ, kế thừa và trạng thái ART. Các con số balance/thời lượng là mục tiêu fixture, chưa phải kết quả playtest. Logic bản chạy chưa phát hành có thể refactor theo yêu cầu owner; tái dùng ART hiện có, chỉ bổ sung phần thiếu.

**Phiên bản 0.35 · 15/10/2026 · Mở Rộng Chiều Sâu Tu Tiên RPG MMO: Một Tuyến Nhân Vật Chính (Huyễn Tâm / Tịch Bạch), Bốn Pháp Bảo Biểu Tượng (Tế Luyện 10 Bậc / Mốc), Tam Trụ Tu Luyện Nội Tại, Trang Bị 6 Ô & Tứ Nghệ, Nhịp Độ "Thiên Đạo Phong Ấn" & Lộ Trình 5 Đại Cảnh Giới Dài Hạn.**

> *“Thuận vi phàm, nghịch tắc tiên. Đạo chưa có đường — ta tự mở!”*

---

## 0. Tuyên bố Phạm vi & Trạng thái Phiên bản (15/10/2026)

1. **Bước ngoặt Thiết kế của GDD 0.34 → 0.35 (Chuẩn hóa Chiều sâu & Nhịp độ Tu Tiên RPG MMO):**
   - Các file GDD phiên bản cũ (`0.24`, `0.26`, `0.32`, `0.33`) cùng 13 tài liệu `HN01–HN12` cũ đã được dọn bỏ; **`docs/GDD.md` (Phiên bản 0.35 · 15/10/2026) là nguồn GDD duy nhất của dự án**.
   - **Tập trung 100% chiều sâu vào 1 tuyến nhân vật chính duy nhất đi theo con đường Vương Lâm** với 2 tạo hình theo gói GDD mới ([neutral approval](design/characters/gdd-character-concepts-v1/approval.json) & [animation handoff](design/characters/gdd-character-animation-v1/README.md)): **Huyễn Tâm (`ID: a` — Nam)** và **Tịch Bạch (`ID: b` — Nữ)** cùng **4 Họ Pháp Bảo Biểu Tượng** (**Kiếm linh · Hứa Lập Quốc, Thập Ức Tôn Hồn Phiên, Xạ Thần Xa, Thiên Nghịch Châu**).
   - **Tư Đồ Nam** và **Lý Mộ Uyển** giữ đúng vai trò kinh điển trong nguyên tác *Tiên Nghịch*: **Tư Đồ Nam** là tàn hồn đại năng thức tỉnh bên trong **Thiên Nghịch Châu** (hệ thống Thức Hải / Chỉ điểm / Giám định cổ bảo / Truyền thụ Cổ Cảnh); **Lý Mộ Uyển** là nhân vật Nhân Duyên & Đan–Trận trọng tâm từ giai đoạn cuối Ngưng Khí – Trúc Cơ – Kết Đan (Quyết Minh Cốc → Tu Ma Hải).
   - **Bổ sung Trọng tâm ở Bản 0.35 (15/10/2026 — Khắc phục triệt để cảm giác "Game Feel ngắn, tu luyện quá nhanh"):**
     - Chấm dứt lối thiết kế *"xong 1 bước nhiệm vụ là nhảy 2–3 tầng cảnh giới"* vốn chỉ dùng cho bản thử nghiệm nhanh.
     - Mở rộng thời lượng tu luyện theo **Ngân Sách Thời Gian Mục Tiêu (chưa kiểm chứng bằng playtest)** (*Ngưng Khí: 40–65 giờ; Trúc Cơ: 80–120 giờ; Kết Đan: 150–250 giờ; Nguyên Anh – Hóa Thần: 300+ giờ*) kết hợp cơ chế **"Thiên Đạo Phong Ấn" (`Server World Epoch`)**.
     - Thiết lập **Tam Trụ Tu Luyện Nội Tại**: **Tu Vi Khí Hải (Lượng)** × **Độ Thuần Linh Lực & Đan Độc (Chất)** × **Chu Thiên Kinh Mạch & Khẩu Quyết Tầng Cao (`[Nguyên tác Ch.33]`)**.
     - Mở rộng **Chiều sâu RPG Dài hạn**: Mỗi Mốc Pháp Bảo có **10 Bậc Tế Luyện (`+1 → +10`) + Nuôi Khí Linh + 3 Ô Cổ Ấn**; Công pháp có **5 Tầng Lĩnh Ngộ (`Sơ Khởi → Hóa Cảnh`) + 3 Ô Tâm Pháp Phụ**; bổ sung **6 Ô Trang Bị Tu Sĩ (Set Bonus)** và **Tứ Nghệ Tu Tiên (`Đan – Khí – Phù – Trận`)**.
2. **Ranh giới Bảo toàn Kỹ thuật & Sản xuất (`AGENTS.md`):**
   - Tuyến nhiệm vụ chính sử dụng hệ thống **Mệnh Kiếp Chí (`VG01–VG11`)** và giao diện [Đạo Ấn UI/HUD V3](HANG-NHAC-DAO-AN-V3.md).
   - Việc mở rộng GDD 0.35 **không tự động suy diễn thành duyệt ART/Motion/VFX cho các gói đang sản xuất (V2)**, không tự sửa SQLite DB/map của Owner hoặc nguồn ART/approval đã pin. Owner cho phép refactor logic bản chạy chưa phát hành; baseline runtime trong các basis cũ là bằng chứng lịch sử, cần biên bản delta khi thay, không sửa lại pin cũ.

---

## 1. Bộ Tài Liệu Trụ Cột Của GDD 0.35

| Nhóm | Tài liệu | Nội dung sở hữu |
| --- | --- | --- |
| **Đặc tả Chiều sâu & Nhịp độ MMO (Mới — 15/10)** | **[Đặc Tả Chiều Sâu Tu Luyện, Nhịp Độ Thời Gian & Hệ Sinh Thái RPG MMO](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md)** | Ngân sách thời lượng từng cảnh giới (40h → 300h+), cơ chế *Thiên Đạo Phong Ấn*, Tam Trụ Tu Luyện (*Chu Thiên, Độ Thuần Khí/Đan Độc, Khẩu Quyết*), Tế luyện Pháp Bảo 10 bậc/mốc, Công pháp 5 tầng, 6 Ô Trang bị Tu sĩ, Tứ Nghệ & 6 Vòng lặp MMORPG |
| **Thiết kế Lộ trình & Nhiệm vụ (Cập nhật 15/10)** | **[Thiết kế Lộ trình Giai đoạn, Nhiệm vụ & Nhân vật](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md)** | Kiến trúc 1 tuyến chính (`Huyễn Tâm / Tịch Bạch`) + Tư Đồ Nam/Lý Mộ Uyển; Vòng lặp 20% Cốt truyện Nghịch thiên + 80% Sandbox MMO; Ma trận 5 Đại Cảnh Giới × 3 Mốc Pháp Bảo; Đặc tả chi tiết Chặng 1 & Chặng 2 |
| **Đặc tả Artwork & Logic Từng Chặng (Cập nhật 15/10)** | **[Đặc tả Chi tiết Artwork & Logic Theo Từng Chặng](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md)** | Bảng quy chuẩn Canvas/Pivot/Layer; State Machine (`PlayerCultivationState`, `ArtifactLoadoutState`, `StageProgressionLedger`); Phân rã chi tiết **Artwork cần làm × Logic cần code** cho từng Hồi (`VG01 → VG11`) và kiến trúc Chặng 3–5 |
| **Giao diện & Trải nghiệm Đạo Ấn V3 (15/10)** | **[Đặc tả Giao diện Đạo Ấn UI/HUD V3](HANG-NHAC-DAO-AN-V3.md)** | Phong cách mực than/đồng mảnh/ngà, cầu HP/MP, Hotbar `F + 1–7`, 6 Tab menu điều hướng chung và Đạo Thư theo dõi `VG01–VG11` |
| **Prototype Vòng Lặp G2 (14/10)** | **[Prototype Logic Vòng Lặp Tiến Trình & Nhiệm Vụ G2](design/gameplay/wang-lin-progression-loop-prototype-v1/README.md)** | Hiện thực hóa `VG01–VG11` (`Auto-Chain Fact`), 5 Đại Cảnh Giới, 4 Pháp Bảo × 3 Mốc, Nội Giới Tư Đồ Nam, Lò đan Lý Mộ Uyển và 4 Boss Chặng 1 trên nhánh fixture (`955 checks PASS` của baseline nhanh 0.34, chưa kiểm cơ chế 0.35) |
| **Nghiên cứu Thị trường & Truyện (14/10)** | **[Reference Game Tu Tiên Thị Trường & Nguyên Tác Tiên Nghịch](XIANXIA-MARKET-STORY-REFERENCES-2026-10-14.md)** | Phân tích đối chiếu *Quỷ Cốc Bát Hoang, Mịch Trường Sinh, Đại Hiệp Lập Chí Truyện (`1948980`), Dật Kiếm Phong Vân Quyết (`1876890`), Nhất Niệm Tiêu Dao, Tru Tiên Thế Giới* và bằng chứng chương truyện *Tiên Nghịch* |
| **Sản xuất Nhân vật & Pháp Bảo (14/10)** | **[Kế hoạch Triển khai Vương Lâm / Huyễn Tâm – Tịch Bạch](WANG-LIN-IMPLEMENTATION-PLAN.md)** & **[Prototype Cơ chế 4 Pháp Bảo](design/gameplay/wang-lin-equipment-prototype-v1/README.md)** | Lộ trình sản xuất P1–P5 cho Huyễn Tâm (`a`) & Tịch Bạch (`b`), 4 họ Pháp Bảo qua 3 Mốc (I, II, III), thông số kỹ năng ST/AOE và quy tắc thẩm mỹ |
| **Sinh cảnh Thế giới, NPC, Quái & Boss (13/10)** | **[Dàn 14 NPC, 11 Quái/Tinh Anh & 4 Boss Vân Hải](VAN-HAI-LIVING-WORLD-PLAN.md)** & **[Kế hoạch Chiêu thức Boss](BOSS-SKILL-ANIMATION-PLAN.md)** | Roster 14 NPC (Wave A/B), 8 quái thường, 3 tinh anh, 4 Boss (*Vân Nha Lang Vương, Tam Ấn Khôi Lỗi, Cổ Mộc Trấn Khí, Hắc Ấn Chấp Sự*) và [Checklist Cụm Quái](design/characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md) |
| **Hợp đồng Kỹ thuật** | [Kiến trúc](ARCHITECTURE.md) · [Hợp đồng MMORPG](MMORPG-SYSTEM-CONTRACTS.md) | Hợp đồng server-authoritative, quản lý trạng thái và ranh giới module |

---

## 2. Bốn Trụ Cột Định Hướng Giải Quyết Tắc Nghẽn Thiết Kế

| Điểm nghẽn ở các bản trước | Giải pháp Đột phá ở GDD 0.34 – 0.35 |
| --- | --- |
| **1. Tắc nghẽn Nhân vật:** Chia 3 nhân vật khởi đầu (Vương Lâm, Tư Đồ Nam, Lý Mộ Uyển) cùng làm đệ tử Ngưng Khí tầng 1 khiến cốt truyện mất chất *Tiên Nghịch* và nhân ba khối lượng việc. | **Một Tuyến Nhân Vật Chính Duy Nhất:** Người chơi hóa thân thành **Huyễn Tâm (Nam)** hoặc **Tịch Bạch (Nữ)** trên hành trình nghịch thiên của Vương Lâm. **Tư Đồ Nam** là đạo sư/tàn hồn trong **Thiên Nghịch Châu**; **Lý Mộ Uyển** là trụ cột Đan–Trận & Nhân Duyên ở Quyết Minh Cốc / Tu Ma Hải. |
| **2. Tắc nghẽn Nhiệm vụ:** Mạch nhiệm vụ cũ nặng tính hành chính (kiểm tra kho bãi, báo cáo qua lại), thiếu cảm giác sinh tồn và đoạt thiên cơ. | **Mô hình Lai 20% Cốt Truyện Sinh Tử + 80% Sandbox MMO Mở:**<br>• **20% Tuyến Chính (`Mệnh Kiếp Chí VG01–VG11`):** Đóng vai trò mở cổng biến cố sinh tử.<br>• **80% Vòng lặp Sandbox MMO:** Săn Tinh Anh/Boss, Vấn Đạo Đài, Bí cảnh tổ đội 1–3 người, Ủy thác Huyết Lệnh, Kỳ ngộ đa nhánh và Tứ Nghệ chế tác. |
| **3. Tắc nghẽn Giai đoạn:** Chưa có khung phát triển rõ ràng sau Ngưng Khí, chưa gắn kết 4 Pháp Bảo và 4 Boss mới vào nhịp đột phá cảnh giới. | **Khung 5 Đại Cảnh Giới × 3 Mốc Pháp Bảo:** Nối chặt **Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần** với **Mốc I (Khởi nguyên) → Mốc II (Bản sắc) → Mốc III (Ý cảnh)**. Mỗi cảnh giới có vùng đất mới, hoạt động MMO rõ ràng và Boss Đại Kiếp Nạn gác cổng đột phá. |
| **4. Tắc nghẽn Nhịp độ ("Game Feel ngắn, tu luyện quá nhanh" — Giải quyết ở 0.35):** Nhảy 2–3 tầng cảnh giới chỉ sau 1 bước nhiệm vụ khiến tu tiên quá dễ, thiếu chiều sâu cày cuốc dài hạn của một game RPG MMO. | **Tam Trụ Tu Luyện + Đa Trục Nuôi Dưỡng + "Thiên Đạo Phong Ấn":**<br>• Chia nhỏ mỗi tầng thành **Chu Thiên Kinh Mạch (9 → 36 nấc)**; yêu cầu **Độ Thuần Linh Lực (kiểm soát Đan Độc)** và **Khẩu Quyết Tầng Cao (`[Ch.33]`)** trước khi Xung Mạch.<br>• Mở rộng **Tế Luyện Pháp Bảo 10 bậc/mốc**, **Công Pháp 5 tầng lĩnh ngộ**, **6 Ô Trang Bị Tu Sĩ (Set Bonus)** và ngân sách thời lượng hàng trăm giờ chơi theo lịch mở phong ấn máy chủ. |

---

## 3. Hệ Thống Tu Luyện Chiều Sâu & Nhịp Độ Thời Gian MMORPG

Chi tiết đầy đủ được quy định tại **[MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md)**:

### 3.1. Tam Trụ Tu Luyện Nội Tại (Chấm dứt kiểu nhảy cấp tự động đơn giản)
Một tu sĩ muốn đột phá cảnh giới vững chắc phải đồng thời tu luyện cả **3 trụ cột**:
1. **Chu Thiên Kinh Mạch & Tu Vi Khí Hải (`Cultivation EXP & Meridian Sub-cycles`):**
   - Mỗi tầng Ngưng Khí gồm **3 → 9 Chu Thiên Kinh Mạch**; mỗi Tiểu Cảnh Giới từ Trúc Cơ trở lên (*Sơ – Trung – Hậu – Viên Mãn*) gồm **9 Trọng Thiên (Tổng 36 nấc mỗi Đại Cảnh Giới)**.
   - Các nấc Chu Thiên nhỏ tự động đả thông mượt mà ngoài thực địa, nhưng khi chạm đỉnh mỗi Tầng, người chơi phải chủ động ngồi **Vận Khí Xung Mạch (`Breakthrough Meditation`)** tại nơi an toàn hoặc trong Không Gian Nội Giới.
2. **Độ Thuần Linh Lực & Cơ Chế Đan Độc (`Qi Purity & Pill Toxicity`):**
   - Dùng đan dược liên tục để ép Tu Vi sẽ làm tích tụ **Đan Độc (`0 → 100`)** và giảm **Độ Thuần Linh Lực (`100% → 50%`)**, gây trạng thái *"Linh Lực Hư Phù"* (giảm sát thương thực chiến và dễ bị phản phệ khi Xung Mạch).
   - Người chơi phải kết hợp **Thực chiến Lịch luyện ngoài thực địa**, uống **Lộ Thủy Thiên Nghịch Châu**, hoặc nhờ **Bạch Chỉ / Lý Mộ Uyển** luyện *Thượng Phẩm Đan / Thanh Tâm Tẩy Tủy Đan* để gột rửa tạp chất, giữ Độ Thuần Linh Lực $\ge 95\%$ nhằm mở khóa **Cổ Cảnh Ngưng Khí 13–15** và **Thiên Đạo Trúc Cơ**.
3. **Bình Cảnh Khẩu Quyết & Nghi Thức Độ Kiếp (`Layer Chants & Tribulations`):**
   - Bám sát nguyên tác `[Tiên Nghịch Ch.33]`: Đệ tử mới chỉ có khẩu quyết tầng 1–3. Khi chạm đỉnh tầng 3, 6, 9, 12, thanh Tu Vi sẽ gặp **Bình Cảnh Công Pháp** — bắt buộc phải tích lũy *Công Huân Tông Môn / Tàn Quyển Cổ Tịch* đổi khẩu quyết tầng cao hơn tại Tàng Kinh Các (**Lục Văn**), và có thể nhận **Cổ Quyết Cực Cảnh 13–15** từ **Tư Đồ Nam** để chọn đường Thiên Đạo. Nhánh đột phá tầng 12 và nhánh Cổ Cảnh đều hoàn tất VG05–VG06 rồi nhập VG07; Cổ Cảnh là cơ chế chuyển thể của game.

### 3.2. Ngân Sách Thời Lượng & Cơ Chế "Thiên Đạo Phong Ấn" (`Server World Epoch`)

| Giai Đoạn Cảnh Giới | Cấu Trúc Nấc Tu Luyện | Ngân Sách Thời Gian Chơi | Lịch Mở "Thiên Đạo Phong Ấn" | Trọng Tâm Cày Cuốc & Đột Phá |
| --- | --- | --- | --- | --- |
| **Ngưng Khí Sơ Kỳ (1 → 3)** | 3 Tầng × 3 Chu Thiên (9 nấc) | **2.5 – 4 giờ** | Ngày 1 Máy chủ | Nhặt Châu Đá, học thổ nạp, hái dược luyện đan đầu tay, rèn phi kiếm phàm, vượt Trận Dẫn Khí. |
| **Ngưng Khí Trung – Hậu (4 → 9)** | 6 Tầng × 6 Chu Thiên (36 nấc) | **12 – 20 giờ** | Ngày 1 – Ngày 4 | Làm Ủy thác đổi Khẩu quyết tầng 4–9, gom 100 Du Hồn dệt Hồn Phiên, vượt Vấn Đạo Đài, hạ Lang Vương. |
| **Ngưng Khí Đỉnh Phong & Cổ Cảnh (10 → 15 → Trúc Cơ)** | 6 Tầng × 9 Chu Thiên (54 nấc) | **26 – 41 giờ**<br>*(Tổng tuyến Cổ Cảnh: **40.5–65h**, khoảng 40–65h)* | Ngày 6 – Ngày 10 (lịch mô phỏng)<br>*(Tuần 1–2)* | Mở Cổ Cảnh 13–15 trong Châu Đá, săn Tam Ấn & Cổ Mộc, luyện Trúc Cơ Đan cùng Lý Mộ Uyển, hạ Hắc Ấn Chấp Sự. |
| **Đại Cảnh Giới Trúc Cơ**<br>*(Sơ → Trung → Hậu → Viên Mãn)* | 4 Tiểu Cảnh Giới × 9 Trọng (36 nấc) | **80 – 120 giờ** | Tuần 2 – Tuần 5 | Bí cảnh tổ đội 2–3 người (Kiếm Mộ), nuôi 4 Pháp Bảo từ Mốc I (+10) lên Mốc II (+10), Hộ Đạo Đan Thất, Độ Kiếp Kết Đan. |
| **Đại Cảnh Giới Kết Đan**<br>*(Sơ → Trung → Hậu → Kim Đan)* | 4 Tiểu Cảnh Giới × 9 Trọng (36 nấc) | **150 – 250 giờ** | Tháng 2 – Tháng 3 | Tu Ma Hải, Động Phủ cá nhân, Chiến trường Chính–Ma–Tán Tu, săn Boss Hải Đảo 5 người, thu Chủ Hồn Kết Đan. |
| **Nguyên Anh & Hóa Thần** | 36 Nấc Nguyên Anh + Lĩnh Ngộ Ý Cảnh | **300+ giờ (Endgame)** | Tháng 4 – Tháng 6+ | Cổ Thần Chi Địa, Vực Sâu Tinh Không, đại kiếp thọ nguyên Lý Mộ Uyển, Pháp Bảo Mốc III & Đạo Vực Tranh Phong. |

> **Nén Khí Hải:** Pool cá nhân có dung lượng/ngân sách chi hữu hạn theo epoch; dùng hỗ trợ độ thuần/mastery/khí linh, không thay vật tư mở mốc và không chuyển thành EXP để nhảy tầng khi mở trần. Khi đầy, dừng cộng và báo rõ trên HUD. Lịch và tỷ lệ đổi còn chờ fixture theo [hợp đồng mục 7](GDD-035-UNIFIED-CONTRACT.md#7-epoch-và-chân-khí-nén).

---

## 4. Hệ Thống Chiến Đấu, Bốn Họ Pháp Bảo, Công Pháp & Trang Bị RPG MMO

### 4.1. Bốn Họ Pháp Bảo Biểu Tượng & Chiều Sâu Nuôi Dưỡng 3 Lớp
Nhân vật chính (**Huyễn Tâm / Tịch Bạch**) làm chủ hệ thống chiến đấu chủ động góc nhìn Isometric. Mỗi họ Pháp Bảo không chỉ có 3 Mốc tiến hóa hình thái lớn (**Mốc I → Mốc II → Mốc III**) mà còn sở hữu **10 Bậc Tế Luyện (`+1 → +10`) trong từng Mốc**, **Cơ chế Nuôi Khí Linh riêng biệt** và **3 Ô Khảm Cổ Ấn**:

| Họ Pháp Bảo | Kỹ năng Đơn (ST) & Diện rộng (AOE) | Đặc trưng Chiến đấu | Cơ chế Cày Cuốc & Nuôi Dưỡng Chiều Sâu (RPG MMO Grind) |
| --- | --- | --- | --- |
| **Kiếm linh**<br>*(Hứa Lập Quốc)* | • **ST:** `Kiếm Ý Nhất Tuyến` *(Đâm xuyên 320px)*<br>• **AOE:** `Kiếm Trận Phá Giới` *(3 đợt sóng kiếm, r=136px)* | **Sát thương bùng nổ & Xuyên thấu:** Tốc độ xuất chiêu nhanh, kết liễu mục tiêu dưới 50% HP cực mạnh ở Mốc II. | • **Tế luyện `+1 → +10`:** Mốc I dùng *Huyền Thiết/Đá Mài Kiếm sơ cấp*; Mốc II dùng *Hàn Thiết Tinh Kim*.<br>• **Nuôi Hung Linh Hứa Lập Quốc:** Cho kiếm thôn phệ *Mảnh Kiếm Cổ* & *Huyết Tinh Boss* để giữ thanh **Hung Tính (`0–100`)**, tăng mạnh tỷ lệ Bạo kích. |
| **Hồn phiên**<br>*(Thập Ức Tôn Hồn Phiên)* | • **ST:** `Chủ Hồn Dẫn Lộ` *(Phóng chủ hồn đeo bám)*<br>• **AOE:** `Tam Môn Tụ Hồn` *(Mở 3 cổng hồn, r=168px)* | **Triệu hồi & Rút sinh lực (DoT):** Khống chế vùng rộng và tự hồi phục qua hồn phách thu thập được. | • **Tế luyện `+1 → +10`:** Mốc I dùng *Mảnh Hắc Phù/Mộc Linh Dịch*; Mốc II dùng *Huyết Văn Lụa/Âm Mộc*.<br>• **Túi Hồn Phách Thực Chiến:** Farm quái thường tích lũy **Du Hồn (`100 → 10.000`)** tăng sát thương nền; săn Tinh Anh/Boss bắt giữ **Chủ Hồn Biến Dị (Lam/Tím/Vàng)** có kỹ năng phụ riêng. |
| **Xạ Thần Xa**<br>*(Chiến Xa Cổ Tu)* | • **ST:** `Giải Niêm Dẫn Thú` *(Chiến thú húc phá giáp)*<br>• **AOE:** `Lôi Thú Liệt Địa` *(Chiến xa giẫm nát, r=184px)* | **Phá giáp hạng nặng & Làm choáng:** Chuyên trị Boss/Tinh anh có khiên ấn dày (*Tam Ấn Khôi Lỗi, Thiết Giáp Linh Trùng*). | • **Tế luyện `+1 → +10`:** Mốc I dùng *Mảnh Khôi Lỗi/Giáp Ngọc Trùng*; Mốc II dùng *Thiên Lôi Thiết*.<br>• **Giải 9 Khóa Niêm Phong Cổ Phù:** Mỗi Mốc gồm **3 Khóa Nhỏ** cần săn *Mảnh Phù Giải Niêm* trong Bí cảnh cơ quan để mở dần uy lực Lôi Thú. |
| **Thiên Nghịch Châu**<br>*(Dị Bảo Bản Mệnh)* | • **ST:** `Dẫn Giới Hộ Thân` *(Khiên hộ thể + Thanh tẩy)*<br>• **AOE:** `Nội Giới Hộ Đạo` *(Trường không gian, r=160px)* | **Hộ đạo, Phản chấn & Không gian riêng:** Cứu mạng trước sát chiêu Boss, hồi linh lực và mở Không Gian Nội Giới. | • **Tế luyện Châu:** tổng bậc kế thừa 0–30 như ba họ khác.<br>• **Nâng cấp Nội Giới `Cấp 1 → 10` (trục riêng):** Hấp thụ **Tinh Hoa Ngũ Hành (`Kim – Mộc – Thủy – Hỏa – Thổ`)**.<br>• **Kinh doanh Nội Giới:** Tăng tốc độ ngưng tụ *Lộ Thủy*, mở tối đa **5 Ô Linh Điền theo tiến trình + 1 ô thẻ tháng (trần 6)** trồng thảo dược quý hiếm và tăng tốc độ Bế Quan. |

### 4.2. Công Pháp 5 Tầng Lĩnh Ngộ, Trang Bị Tu Sĩ 6 Ô & Tứ Nghệ Tu Tiên
1. **Công Pháp Chủ Đạo (5 Tầng) & Tâm Pháp Phụ (3 Ô):**
   - Mỗi Khuynh hướng Công pháp (*Kiếm Sát Quyết, Ngự Hồn Quyết, Trấn Nhạc Quyết*) có **5 Tầng Lĩnh Ngộ (`Sơ Khởi 60% → Tiểu Thành 75% → Đại Thành 90% → Viên Mãn 100% → Hóa Cảnh 120%`)**, nâng cấp bằng **Độ Thuần Thục Thực Chiến + Ghép Tàn Quyển Bí Tịch**.
   - Đi kèm **3 Ô Tâm Pháp Bị Động** (*Thổ Nạp, Thân Pháp, Bí Thuật*) sưu tầm từ Tàng Kinh Các, Kỳ ngộ và Bí cảnh.
2. **Sáu Ô Trang Bị Tu Sĩ (`6-Slot Cultivator Gear`):**
   - Nhân vật có 6 ô trang bị phòng cụ & phụ kiện: **Pháp Y (Áo), Hộ Uyển (Tay), Linh Ngoa (Giày), Yêu Đái (Đai), Ngọc Bội, Linh Giới (Nhẫn)** với các **Hiệu ứng Bộ (Set Bonus 2/4/6 món)** như *Bộ Thanh Vân, Bộ Vân Nha Sát Lục, Bộ Huyền Thiết Trấn Ấn, Bộ Hàn Thiết Kiếm Ma*.
   - Thiết kế này tạo chiều sâu săn đồ/rèn đồ chuẩn RPG MMO mà **giữ nguyên diện mạo sprite `Huyễn Tâm / Tịch Bạch` đã duyệt**.
3. **Tứ Nghệ Tu Tiên (`Đan – Khí – Phù – Trận`):**
   - **Đan Đạo (Bạch Chỉ / Lý Mộ Uyển):** Trồng linh thảo trong Châu + Khống hỏa luyện đan 4 phẩm chất (*Hạ → Trung → Thượng → Đan Văn*), trực tiếp quyết định lượng Đan Độc nhiều hay ít.
   - **Khí Đạo (Tống Thiết):** Rèn bộ 6 trang bị tu sĩ, tẩy luyện dòng phụ và đúc đá tế luyện Pháp Bảo.
   - **Phù Đạo (Lục Văn):** Vẽ phù chiến thuật (*Phá Cấm Phù, Thần Hành Phù, Tị Lôi Phù*).
   - **Trận Đạo (Lý Mộ Uyển / Tư Đồ Nam):** Chế tạo Trận Bàn đặt trước trận Boss hoặc dùng để Hộ Pháp Độ Kiếp.

---

## 5. Tổng Quan Lộ Trình 5 Đại Cảnh Giới & 11 Hồi `VG01–VG11`

Chi tiết từng bước của Chặng 1 và Chặng 2 được quy định tại **[STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md)** và **[MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md)**:

1. **Chặng 1 — Ngưng Khí lên Trúc Cơ (nhánh tầng 12 hoặc Cổ Cảnh 15; tuyến Cổ Cảnh khoảng `40–65 giờ mục tiêu`):**
   - **Bối cảnh:** Hằng Nhạc Ngoại Môn → Tuyến Ngoại Vi → Sân Khảo Nghiệm (Vấn Đạo Đài) → Rừng Cổ Mộc → Quyết Minh Cốc.
   - **Tuyến chính (6 Hồi `VG01–VG06`) đan xen Khổ Tu & Sandbox:**
     - *Hồi I (`VG01` · Tầng 1–3 · 2.5–4h):* Phế Sài Nhập Môn, Cơ Duyên Châu Đá, đả thông 9 Chu Thiên & Trận Dẫn Khí.
     - *Hồi II (`VG02` · Tầng 4–6 · 6–10h):* Đổi Khẩu quyết tầng 4–6, gom 100 Du Hồn + 5 Yêu Hồn Lang Tuần Sơn luyện Hồn Phiên Mốc I & hạ **Vân Nha Lang Vương**.
     - *Hồi III (`VG03` · Tầng 7–9 · 6–10h):* Thức Hải Tư Đồ Nam, rèn Công Pháp lên Tiểu Thành, vượt Vấn Đạo Đài & giải mã Hắc Ấn.
     - *Hồi IV (`VG04` · Tầng 10–12 · 10–15h):* Khẩu quyết tầng 10–12, săn Tinh anh Khe Đá, phá **Tam Ấn Khôi Lỗi** & mở **Xạ Thần Xa Mốc I**.
     - *Hồi V (`VG05` · Tầng 12–15 · 10–16h tuyến Cổ Cảnh):* Gặp **Lý Mộ Uyển**, hạ **Cổ Mộc Trấn Khí** và luyện Trúc Cơ Đan ngay từ tầng 12; tùy chọn Cổ Cảnh 13–15 cần độ thuần $\ge 95\%$ và khẩu quyết Tư Đồ Nam.
     - *Hồi VI (`VG06` · Đột Phá Trúc Cơ · 6–10h):* Ít nhất hai Pháp Bảo đạt `Mốc I +10`, Công pháp Đại Thành, quyết chiến **Hắc Ấn Chấp Sự** (lách khe `90°` của *Ấn Hồi*) & dựng **Phàm/Địa/Thiên Đạo Đài** theo điều kiện riêng; cả hai đường tầng 12 và tầng 15 sang VG07.
2. **Chặng 2 — Trúc Cơ (36 Trọng Chu Thiên) lên Kết Đan (`80 – 120 giờ chơi`):**
   - **Bối cảnh:** Quyết Minh Cốc → Hàn Thiết Kiếm Mộ (Bí cảnh 1–3 người) → Vực Ngoại Vân Hải → Cửa ngõ Tu Ma Hải.
   - **Tuyến chính (5 Hồi `VG07–VG11`) & Tiến hóa Pháp Bảo Mốc II:**
     - *Hồi VII (`VG07` · Trúc Cơ Sơ Kỳ · 15–25h):* Mở Không Gian Nội Giới & Linh Điền, đả thông 9 Trọng Sơ Kỳ, nạp **1.000 Tinh Hồn Trúc Cơ + 2 Chủ Hồn khảo nghiệm Trúc Cơ (Lang Tuần Sơn/Phù Sư Hắc Lụa)** lên **Hồn Phiên Mốc II**; hồn Chấp Sự bổ sung tại VG10.
     - *Hồi VIII (`VG08` · Trúc Cơ Trung Kỳ · 20–30h):* Cày Bí cảnh Hàn Thiết Kiếm Mộ, đả thông 9 Trọng Trung Kỳ, thu phục **Hứa Lập Quốc (Kiếm linh Mốc II)**.
     - *Hồi IX (`VG09` · Trúc Cơ Hậu Kỳ · 20–30h):* Mở khóa 4–6 để có **Xạ Thần Xa Mốc II trước trận giữ lò**, bày trận bảo vệ đan thất Lý Mộ Uyển trước Âm Thi Tông & nhận *Thiên Ly Đan*.
     - *Hồi X (`VG10` · Trúc Cơ Viên Mãn · 15–20h):* Gom Ngũ Hành và mở **Thiên Nghịch Châu Mốc II trước trận**, tế luyện bốn họ `Mốc II +10`, tiêu diệt chân thân **Hắc Ấn Chấp Sự (Giả Đan)** rồi bổ sung chủ hồn thứ ba cho Phiên.
     - *Hồi XI (`VG11` · Độ Kiếp Kết Đan · 10–15h):* Chọn NPC/khí linh Hộ Pháp mặc định khi solo hoặc mời 1–2 đạo hữu, chống 3 đạo Thiên Lôi tại cửa ngõ **Tu Ma Hải** để ngưng tụ **Bổn Mệnh Kim Đan**.
3. **Chặng 3 — Kết Đan lên Nguyên Anh (`150 – 250 giờ chơi`):**
   - **Bối cảnh:** Tu Ma Hải & Cổ Thần Chi Địa.
   - **Trọng tâm:** 36 Trọng Đan Văn, Động Phủ cá nhân, Chiến trường phe phái (Chính – Ma – Tán Tu), săn Boss Thế Giới 5 người đoạt nguyên liệu luyện Phân Thân và tái tạo nhục thân cho **Tư Đồ Nam**.
4. **Chặng 4 & 5 — Nguyên Anh lên Hóa Thần (`300+ giờ chơi — Endgame`):**
   - **Bối cảnh:** Tiên Giới Toái Phiến & Vực Sâu Tinh Không.
   - **Trọng tâm:** Đại kiếp thọ nguyên của **Lý Mộ Uyển**, lĩnh ngộ **Ý Cảnh Riêng** (*Sinh Tử / Sát Lục / Chân Giả*), tiến hóa toàn bộ 4 Pháp Bảo lên **Mốc III (Đạo Vực)** và tranh bá liên tông môn.

---

## 6. Sáu Luồng Phát Triển Nhân Vật, Hệ Thống Nhiệm Vụ & Vòng Lặp Content MMORPG

Chi tiết toàn bộ ma trận phát triển nhân vật, nhiệm vụ và content được quy định tại **[MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md)** (Mục 8 & Mục 9):

1. **Sáu Luồng Phát Triển Nhân Vật Đan Xen Xuyên Suốt 5 Đại Cảnh Giới (`Kế Thừa Giá Trị 100%`):**
   - **Luồng 1 — Tu Vi Cảnh Giới & Đạo Cơ Nội Tại:** Ngưng Khí 15 tầng Cổ Cảnh → Trúc Cơ 36 Trọng → Kết Đan 36 Đan Văn → Nguyên Anh → Hóa Thần; tích hợp Kinh mạch Chu Thiên, Độ Thuần Khí & Đan Độc.
   - **Luồng 2 — Tứ Đại Pháp Bảo Bản Mệnh (`Kiếm – Phiên – Xa – Châu`):** Tế luyện `+1 → +10` mỗi Mốc, Nuôi Dưỡng Khí Linh (Hung Tính / Du Hồn & Chủ Hồn / Giải 9 Khóa Cổ Phù / Linh Điền Nội Giới) và 3 Ô Khắc Ấn Cổ Phù. **Lưu tổng bậc tế luyện 0–30, trần 10/20/30 theo mốc: I +10 (tổng 10) → II +0 (tổng 10) → II +10 (tổng 20). Bonus đã kiếm, linh tính và cổ ấn giữ nguyên; không áp bonus hai lần.**
   - **Luồng 3 — Công Pháp Chủ Đạo (5 Tầng) & Tâm Pháp Phụ (3 Ô):** 3 Khuynh hướng (*Kiếm Sát / Ngự Hồn / Trấn Nhạc*) nâng qua 5 tầng lĩnh ngộ bằng Độ Thuần Thục + Tàn Quyển; kết hợp tự do với 3 Ô Tâm Pháp bị động.
   - **Luồng 4 — Trang Bị Tu Sĩ 6 Ô & Cường Hóa Ô Trang Bị (`Slot-Bound Enhancement`):** 6 ô (*Pháp Y, Hộ Uyển, Linh Ngoa, Yêu Đái, Ngọc Bội, Linh Giới*) kích hoạt Set Bonus 2/4/6 món. **Cấp cường hóa Khí Đạo gắn trực tiếp vào Ô Trang Bị trên người**, thay đồ cảnh giới mới không mất cấp cường hóa cũ.
   - **Luồng 5 — Tứ Nghệ Tu Tiên (`Đan – Khí – Phù – Trận`):** 4 nghề chế tạo trụ cột phục vụ trực tiếp đột phá, khử đan độc, rèn đồ, phá cơ quan và giao dịch Phường Thị.
   - **Luồng 6 — Nhân Duyên, Danh Vọng & Linh Thú / Khôi Lỗi Hộ Đạo:** Mở khóa đan phương độc quyền (**Lý Mộ Uyển**), thần thức chỉ điểm (**Tư Đồ Nam**), pháp bảo tông môn và trợ chiến thực địa.
2. **Sáu Tuyến Nhiệm Vụ Đa Tầng & Cơ Chế Content *"Thù Đồ Đồng Quy"* (`Paths Converge`):**
   - **6 Tuyến Nhiệm Vụ:** (1) *Mệnh Kiếp Chí (`VG01–VG11`)*, (2) *Đạo Cơ Tu Hành Lục* (Sổ tay hướng dẫn mở khóa hệ thống), (3) *Tông Môn Ủy Thác & Huyết Lệnh* (5 nhiệm vụ/ngày + chuỗi tuần), (4) *Vân Hải Kỳ Ngộ* (Sự kiện ẩn theo thời tiết/thời辰/địa hình), (5) *Hồng Trần Nhân Duyên* (Chuỗi nhiệm vụ đồng hành NPC), (6) *Thiên Đạo Chinh Phục Lệnh* (Mốc thành tựu toàn server).
   - **Triết lý *"Thù Đồ Đồng Quy"* (học tập *Sword of Justice / Nghịch Thủy Hàn*):** Tổng quãng thưởng cốt lõi mỗi tuần được gom chung vào một **Quỹ Thưởng Tuần (`Thiên Đạo Chu Lục`)**. Dù người chơi thuộc nhóm **Hardcore PvE** (Bí cảnh 1–3 người, Vấn Đạo Đài), **Cày Cuốc Bản Đồ Mở** (Săn Tinh anh, Dị tượng linh mạch), **Điền Viên Chế Tạo PVX** (Trồng Linh Điền, Luyện Đan, Rèn Khí) hay **PvP Phe Phái** (Luận Đạo Đài, Chiến trường), họ đều có thể đạt tối đa quỹ thưởng tuần theo lối chơi yêu thích.

---

## 7. Hệ Sinh Thái Vật Phẩm (Tier 1 → Tier 5) & Kinh Tế "Cày Cuốc Lẫn Nạp"

Chi tiết bảng phân loại 8 nhóm vật phẩm/nguyên liệu và mô hình kinh tế cộng sinh được quy định tại **[MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md)** (Mục 10 & Mục 11):

1. **Tám Nhóm Vật Phẩm & Nguyên Liệu Xuyên Suốt 5 Cảnh Giới (`Cơ Chế Hợp Thành 5:1`):**
   - Hệ thống vật phẩm chia làm **8 Nhóm lớn** (*Đan Dược & Lộ Thủy; Linh Thảo & Hạt Giống; Khoáng Thạch & Đá Tế Luyện; Yêu Đan – Hồn Phách – Huyết Tinh; Phù Lục – Trận Bàn – Cổ Ấn; Bí Tịch & Tàn Quyển; Trang Bị 6 Ô & Phôi Rèn; Tín Vật Đột Phá & Kỳ Trân*) trải dài từ **Tier 1 (Ngưng Khí) → Tier 5 (Hóa Thần)**.
   - **Luật Hợp Thành `5:1` trong Thiên Nghịch Châu:** Chỉ recipe cùng họ trong danh sách cho phép được dung luyện `5 hợp 1`, cần cảnh giới/Nội Giới/nghề tương ứng; không đổi chứng đạo, chủ hồn có danh tính, khẩu quyết hoặc giải niêm theo luật chung. Đầu ra Khóa nếu có bất kỳ đầu vào Khóa. Vật liệu cũ còn dùng cho nuôi dưỡng/chế tác.
2. **Kiến Trúc 3 Tầng Tiền Tệ & Sàn Giao Dịch Phường Thị:**
   - **Linh Thạch (Hạ/Trung/Thượng phẩm):** Tiền tệ tiêu hao nội tại (*In-game Sink Currency*), cày từ quái/nhiệm vụ/bán đồ, dùng cho Đan–Khí–Phù–Trận và tế luyện.
   - **Tiên Ngọc Khóa & Công Huân Tông Môn:** Tiền tệ tiến trình cá nhân (*Bound Progression Currency*), nhận miễn phí từ Mệnh Kiếp Chí, Vấn Đạo Đài, Kỳ Ngộ và Thẻ Tháng để mua Khẩu quyết và nguyên liệu bảo hiểm.
   - **Tiên Ngọc Không Khóa (Unbound Tiên Ngọc):** Tiền tệ nạp & lưu thông trên **Phường Thị** (*chịu thuế giao dịch 5–8%*).
3. **Vòng Tuần Hoàn Cộng Sinh giữa Dân Cày (F2P Grinder) và Người Nạp (Spender):**
   - **Tách biệt nguyên liệu Khóa và Không Khóa:** Hoạt động ngày/tuần cơ bản rơi nguyên liệu **Khóa** (đảm bảo tự cường hóa). Các hoạt động đòi hỏi kỹ năng & công sức thực địa (*Bí cảnh Địa Ngục, Boss Thế Giới, Đan Văn thượng phẩm do Đan Sư luyện, Phôi trang bị cực phẩm*) rơi vật phẩm **Không Khóa (Unbound)** có thể treo bán trên Phường Thị lấy **Tiên Ngọc Không Khóa**.
   - **Bốn Trụ Cột Doanh Thu & Cơ Chế Bảo Hiểm (*Hard Pity*):** Tập trung vào (1) *Thẻ Tháng Linh Mạch & Thiên Đạo Lệnh (Battle Pass)*, (2) *Ngoại Trang Cổ Phong, Skin Pháp Bảo & Cảnh Sắc Nội Giới (không cộng chỉ số)*, (3) *Tiện Ích Tu Luyện* và (4) *Giao Dịch Phường Thị*. Tuyệt đối **không bán trực tiếp Tu Vi Cảnh Giới hay trang bị hoàn chỉnh trong Cash Shop**, tế luyện ngẫu nhiên có **Điểm Chúc Phúc không giảm và số lần thất bại tối đa hữu hạn được công bố**; đột phá xét điều kiện và thử thách, không thêm xúc xắc sau khi vượt thử thách và **không bao giờ rớt cấp hay vỡ đồ**.

---

## 8. Phân Kỳ Triển Khai (`G0 → G4`) & Tiêu Chí Nghiệm Thu

1. **G0 (Đã hoàn tất 14–15/10):** Chốt GDD 0.34 → 0.35, tài liệu Reference thị trường/truyện (10 tựa game RPG/MMO), bản thiết kế chi tiết Chặng 1–2 và đặc tả Chiều sâu Tu luyện, 6 Luồng Phát triển Nhân vật, 8 Nhóm Vật phẩm & Kinh tế Cày cuốc lẫn Nạp.
2. **G1 (Đang thực hiện theo Plan 14/10):** Sản xuất gói ART/Motion/VFX **Huyễn Tâm & Tịch Bạch × 4 Pháp Bảo (P4–P5)** và hoàn thiện duyệt các gói Quái/Tinh Anh/Boss.
3. **G2 (Đã hoàn tất Prototype Vòng Lặp & Ghép Đạo Ấn UI V3 14–15/10):** Hiện thực hóa `VG01–VG11` trên nhánh fixture G2 (`955 checks PASS` của baseline nhanh 0.34, chưa kiểm cơ chế 0.35) và ghép giao diện [Đạo Ấn UI/HUD V3](HANG-NHAC-DAO-AN-V3.md) (`123 checks PASS` UI lịch sử). Các hệ thống 0.35 cần fixture và nghiệm thu mới, không suy từ hai mốc này.
4. **G3 (Tích hợp Sinh Cảnh, Chiều Sâu Tu Luyện & Boss Chặng 1):** Đưa Tam Trụ Tu Luyện (*Chu Thiên, Độ Thuần Khí/Đan Độc, Khẩu Quyết*), Tế luyện Pháp Bảo `+1 → +10`, 14 NPC, 11 Quái/Tinh Anh và 4 Boss vào vận hành thực địa khi đủ gate duyệt.
5. **G4 (Mở rộng Chặng 2 — Quyết Minh Cốc, Bí Cảnh Tổ Đội & Kết Đan):** Đưa gói Pháp Bảo Mốc II, hệ thống Nội Giới – Linh Điền, Đan Thất Lý Mộ Uyển, 6 Ô Trang bị Bộ, Phường Thị và Bí cảnh 1–3 người vào vận hành.
