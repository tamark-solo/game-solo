# Kiếm linh: FX pilot cho Huyễn Tâm và Tịch Bạch

Ngày 14/10/2026 · P3 · 10 sequence / 60 frame · Candidate ART, chưa ghép runtime.

Kit Kiếm linh dùng chung palette mực–ngà–cổ đồng cho cả hai identity. Nguồn [AOE đã duyệt](../../characters/wang-lin-concept-direction-v5/sources/sword-aoe.png) và [tiến hóa](../../characters/wang-lin-concept-direction-v5/sources/sword-progression.png) chỉ cung cấp hình ý, nét và palette. Body, trang bị, điểm cầm và gameplay giữ lớp riêng.

## Mười chuỗi

| ID | Lớp/anchor | Hình và mục đích |
| --- | --- | --- |
| st-warning | Ground | Khe mực mảnh, ánh ngà báo tuyến. Geometry do Core vẽ theo origin/aim đã khóa. |
| st-charge | Hand | Hạt kiếm ý tụ thành lõi ngà và vòng khí mực tại socket cổ tay. |
| st-release | Projectile | Kiếm khí hướng đông, lõi sáng và đuôi mực; quỹ đạo theo release fixture. |
| st-resolve | Target | Vỡ mực và contact core ngà, chỉ khi có fact trúng. |
| st-tail | Projectile | Sợi khí đứt/tan ở điểm kết thúc, có thể dùng cho hụt và dư khí. |
| aoe-warning | Ground | Một cọc kiếm ngủ; renderer đặt tại sáu anchor của ba hành lang song song. |
| aoe-deploy | Ground | Một cọc kiếm trồi lên, cao khoảng 184 px ở peak. |
| aoe-active | Caster/rear | Linh thể tu sĩ cổ khổng lồ, khoảng 280 px, thân trên tan thành mực. |
| aoe-contact | Target | Mỗi contact xác nhận có một đợt kiếm ý phun ngà–mực riêng. |
| aoe-collapse | Ground | Cọc kiếm vỡ và chìm vào mực tại anchor ban đầu. |

Mỗi sequence có một sheet 3×2 riêng và sáu frame vẽ khác nhau. Không dịch/scale một ảnh tĩnh để giả animation. Tư thế linh thể là frontal cố định của field, không chứng minh tám view phối cảnh. Ba linh kiếm trang trí nằm cùng artwork linh thể; chúng không thay stake anchor, collision, pulse hoặc thêm hit.

Nguồn built-in ImageGen gồm 12 lượt: 10 nguồn ban đầu và hai correction artwork. st-charge r1 có hai frame giao hàng; st-resolve r1 có hai frame giao cột. Hai raw/prompt r1 được giữ nguyên trong generation history và không được chọn. Hai r2 đã bỏ lỗi; không gọi router hoặc retry POST dịch vụ.

## Đăng ký và alpha

[manifest.json](manifest.json) cung cấp canvas/pivot/frame duration/atlas/rect/hash. [registration.json](registration.json) ghi bbox nguồn, scale, emitter đo và sampling. Một scale chung mỗi sequence lấy từ extent vật lý lớn nhất của cả sáu frame, không fit từng frame. Phép đo dùng alpha ≥16; payload giữ mọi alpha được nearest sampling, không binary alpha hoặc vẽ lại bitmap.

Emitter được đo ở nút sáng, điểm contact/cọc hoặc chân mây tan của linh thể. Mỗi frame có source emitter riêng để sửa sai lệch vị trí trong raw; tất cả được đăng ký vào cùng native pivot. Scale không đổi theo frame. Canvas nở theo padding cần để giữ soft alpha; không tăng extent vật lý theo kích thước canvas.

Preview strip nền sáng/tối ở [review](review/pack-verification.json), cùng contact và silhouette theo đúng native pixel. Tất cả source selected có biên cell alpha dưới 16; điều này kết hợp kiểm raw bằng mắt. Native padding/zero clipping tự nó không chứng minh source hoàn chỉnh.

## Nối facts và clock

ST/AOE có năm phase riêng. durationMs/hold là nhịp artwork để playback, không gây damage, control hoặc đổi release/cooldown. Contact lấy cast/pulse/target/spawnLife/effectId từ [P2](../../gameplay/wang-lin-equipment-prototype-v1/README.md); event tới trễ tiếp tục ở tuổi thực. Source sprite được instanced theo anchor, không bake whole arena/target/body vào FX.

Linh thể nằm sau body; cọc kiếm depth theo ground point; charge theo socket riêng từng nhân vật. Khi seek/paused, render descriptor từ clock tuyệt đối, không phát hit callback. Khi hụt/hủy, renderer giữ luật stop/collapse/residual theo facts của fixture.

## Kiểm scoped

    python docs/design/vfx/wang-lin-sword-pilot-v1/pack.py
    python docs/design/vfx/wang-lin-sword-pilot-v1/verify.py

Verifier kiểm nguồn/prompt/input hash, 60 frame khác nhau, toàn payload RGBA so nguồn đã sample, native alpha, canvas/pivot, atlas/gutter và 86 pin V5 nguyên byte. [Report](review/verification.json) ghi decoded byte count; đây không phải benchmark cache/MMO. Browser/Three và ghép body/gear tiếp tục ở sân pilot chung.

[Nhận xét hình](review/visual-assessment.json) ghi phần đã xem ở native. Proof Three riêng chưa có kết quả do timeout; theo điều phối root, 60 FX canonical/atlas được chuyển sang lượt kiểm chung production-v1. Không suy kiểm PNG thành GPU pass.

Gói mới không thay ART đã duyệt, không mở balance/runtime approval và không sửa engine/server/save/map/navigation/DB/draft hoặc receipt.
