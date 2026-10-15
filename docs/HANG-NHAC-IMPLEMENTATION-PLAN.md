# Triển khai Hằng Nhạc từ bản map đã chốt

> **Phân loại tài liệu ·15/10/2026.** Phần kế hoạch/số lượng/roster bên dưới là snapshot trước GDD 0.35, giữ để truy nguồn kỹ thuật và ART; không dùng làm backlog hay yêu cầu sản xuất mới. Nguồn áp dụng: [GDD 0.35](GDD.md), [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md), [kế hoạch asset toàn game đã thống nhất](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md). Tận dụng bộ Huyễn Tâm/Tịch Bạch, quái/boss/NPC hiện có; Tư Đồ Nam và Lý Mộ Uyển không là tuyến playable bổ sung. Các trạng thái “hiện hành/đã chốt” dưới đây chỉ đúng tại ngày ghi mốc.

**Snapshot chơi thử cập nhật 12/10/2026:** theo phạm vi owner chọn, HN05–HN12 và EX01–EX04 từng được ghi là nối vào game, lưu thật, encounter/khảo nghiệm riêng, sáu công thức và bộ pixel Vương Lâm mới. Hồ sơ runtime chương cũ đã dọn; đối chiếu hiện hành tại [lộ trình VG01–VG11](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) và [hợp đồng GDD 0.35](GDD-035-UNIFIED-CONTRACT.md). Map Hằng Nhạc đã chốt giữ nguyên; ngoại vi là nền gameplay thử, ART/native hai nhân vật còn lại và balance tăng chỉ số tiếp tục đánh giá.

**Ưu tiên snapshot 10/10/2026 — trước GDD 0.35:** HN03–HN04 đã có; owner đồng ý chốt [nhân vật](CHARACTER-SYSTEM.md) và [lộ trình VG01–VG11](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) trước mở rộng HN05. [Lộ trình RM0–RM6](DEVELOPMENT-ROADMAP.md) chỉ là lịch sử; điều kiện hiện hành ở [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md). Bảng 1–5 dưới đây giữ phạm vi tích hợp từ map, không yêu cầu làm lại nền đã hoàn thành.

**Ngày 08/10/2026 · GDD 0.28.** Chủ dự án đã hoàn tất vùng chặn, yêu cầu lưu/dọn bản lỗi để bắt đầu triển khai và xác nhận lấy bản mới nhất. Nguồn hiện hành là [dự án owner](data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json), không dùng polygon fixture hoặc tọa độ đề xuất HN-Z cũ thay dữ liệu này.

[Map và bàn giao](design/world/hang-nhac-map-v1/README.md) · [Navigation](design/world/hang-nhac-map-v1/owner-navigation/navigation.json) · [Runtime export](design/world/hang-nhac-map-v1/owner-navigation/runtime-project.json) · [Verification](design/world/hang-nhac-map-v1/owner-navigation/verification.json) · [Biên bản dọn map](data/hang-nhac-map-cleanup-2026-10-08.json).

## Nền triển khai đã chuẩn bị

| Mục | Trạng thái |
| --- | --- |
| Ảnh cuối | access-v5-clean-v1, đúng hash nền owner đang dùng; 3072 × 2048, scale 1 |
| Vùng chặn | 9 vùng do owner vẽ, tất cả có hiệu lực; giữ nguyên anchors/points/layer |
| Spawn | (1616,992), sân trung tâm; điểm mặc định cũ (512,448) bị chặn đã sửa |
| Lưu | Project tổng, mirror level/index và bản bàn giao Editor có navigation |
| Kiểm / xuất | 0 lỗi, 0 lưu ý; runtime và navigation đã xuất bằng exporter hiện có |
| Bản thử lỗi | Dọn khỏi thư mục làm việc; archive có kiểm hash nằm ngoài workspace |
| Bộ ba nhân vật | ART có sẵn; frame 64 × 96, chân (32,88), scale chơi 1× |

Giữ ID project và level hiện có để tiếp tục sửa mà không tạo hai nguồn dữ liệu cạnh tranh. Tên asset trong Editor là tên lịch sử; xác định phiên bản ảnh bằng nội dung/hash. Snapshot authoring giữ spline anchors; runtime chỉ dùng polygon đã lấy mẫu bởi cùng parser/exporter. Navigation đi theo `walkPolicy=full` và trừ blockers; chưa có portal.

## Thứ tự triển khai

| Bước | Công việc cụ thể | Điều kiện hoàn tất |
| --- | --- | --- |
| 1 — Nạp map vào runtime | Đọc nền/navigation đã lưu trong client; cùng dữ liệu blocker cho server. Giữ camera, foot anchor và bán kính chân 8 px. Đóng gói ảnh ngoài JSON runtime khi nạp web để tránh base64 lặp. | Người xuất hiện tại sân trung tâm, di chuyển/chặn giống Editor; client/server không dùng hai bộ collider khác nhau. Hai client nhìn thấy nhau trên cùng Hằng Nhạc; không xuyên vùng chặn khi reconciliation/reconnect. |
| 2 — Ba nhân vật nhập môn | Nối Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển vào hồ sơ điều khiển từ đầu; quyền dùng ba thuật R01 theo GDD. | Cả ba vào được cùng map, tiến trình từng hồ sơ tách; không dùng enum avatar đệ tử thử để xác nhận tính năng playable đã hoàn tất. |
| 3 — Tương tác môn phái | Đặt điểm tương tác NPC/nhiệm vụ/thổ nạp/luyện thuật/chuẩn bị bám khoảng trống thật và dữ liệu owner. Dùng HN01–HN12 làm nội dung đề xuất, không tự coi tọa độ/chi phí/thời lượng cũ là luật khóa. | Tương tác được từ vùng đi, không buộc chân vào blocker; luồng nhận/hướng dẫn/chuẩn bị kiểm theo đặc tả hiện hành. |
| 4 — Ngoại vi và khảo nghiệm | Thiết kế map farm riêng có đường quay về và phiên khảo nghiệm riêng. Lối farm khác xuất hành HN12. Chỉ tạo cửa khi đã có map đích/Spawn/điều kiện thực. | Chuyển cảnh đúng đích, quay lại hợp lệ, server kiểm điều kiện; không đặt quái farm vào sân môn phái. |
| 5 — Asset cần thiết | Làm nền dưới vật và part tán/mái có alpha đúng mép tại các nơi người cần đi trước/sau; giữ pivot/footprint map đã chốt. | Ghép lại khớp nền, occlusion/y-sort đúng ở camera 1×; không dùng polygon collision thay mask ART. |

**Bước 1 đã triển khai:** [runtime Hằng Nhạc](HANG-NHAC-RUNTIME.md) nạp nền/9 blocker owner ở camera 1×, client và server dùng cùng release và luật va chạm. Đã kiểm nhiều client cùng map, prediction sát blocker và reconnect tại vị trí cũ.

**Bước 2 đã có bản thử:** [hồ sơ/lưu/R01](HANG-NHAC-R01-RUNTIME.md) tạo ba hồ sơ riêng cho tài khoản khách local, lưu SQLite, phục hồi reload/restart và dùng Kiếm/Lôi/Phong từ đầu. Server kiểm chi phí/cooldown/hit/đường Phong; mục tiêu luyện không thưởng và không là quái farm. Ngày 09/10 bổ sung [skill core và 36 clip thi triển bộ ba/bốn hướng](SKILL-CORE.md). Số liệu là baseline thử, ART mới cần đánh giá. Ngày 10/10 đã có [entry thật E0–E2 local](GAME-ENTRY-BACKEND.md) và [hành trang nhập môn](HANG-NHAC-CHARACTER-RUNTIME.md); production/recovery/scale còn thiếu, không cần xây lại account/hồ sơ từ đầu.

**Bước 3–4 có vòng chơi thử (snapshot):** [luồng NPC cũ](HANG-NHAC-NPC-RUNTIME.md) giữ phần trình bày HN01–HN04; các hồ sơ lessons/chapter runtime cũ đã dọn. Ngày 12/10 từng ghi HN05–HN12/EX01–EX04 với điều kiện M02–M04, encounter riêng, bình cảnh, ngọc hộ thân, khảo nghiệm ba pha và nguồn vật liệu hữu hạn/luyện chế. Tiến trình/tích lũy/receipt tương thích save cũ; không có farm vô hạn hoặc offline cultivation. Điều kiện VG hiện hành phải đọc từ [hợp đồng 0.35](GDD-035-UNIFIED-CONTRACT.md), không suy từ snapshot.

**HUD/layer đã tích hợp 09/10:** [bàn giao](HANG-NHAC-HUD-LAYERS.md) dùng đúng bản review owner chỉ định, scene 22 object/32 part/10 cover, y-sort/alpha và HUD Vân Ngọc đọc snapshot thật. Giữ nguyên geometry owner; không tự sản xuất thêm ART.

## Nguồn yêu cầu

[GDD 0.35](GDD.md) và [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md) là nguồn hiện hành cho môn phái, ngoại vi, khảo nghiệm và VG01–VG11. Các đặc tả Ngưng Khí/encounter cũ chỉ là lịch sử đã dọn; [backend hiện có](BACKEND-PREVIEW.md) gồm room Hằng Nhạc với hồ sơ SQLite và room fixture RAM để kiểm hồi quy. [Quy trình map](MAP-CONCEPT-SECTOR-WORKFLOW.md) tiếp tục áp dụng cho map ngoại vi sau này.

Kiểm dữ liệu qua parser/audit/export hiện có, hash nền và project/mirror; kiểm online, camera, chuyển cảnh và save tiến trình khi từng bước runtime được thực hiện. Không tự chỉnh các vùng chặn đã chốt để làm test đi qua.
