# Bàn giao ART quái và boss · 13/10/2026

Nhánh đích bàn giao là **`_MMO`**. Commit ART **`36eb453a`** bắt đầu từ `82bc389a`, được tạo trong worktree riêng rồi fast-forward vào checkout `_MMO` theo yêu cầu owner. Commit lưu các gói ART, nguồn/prompt/registration, sân review Core, kiểm kỹ thuật và hồ sơ duyệt đã làm trong đợt này.

Trước khi ghép, bản ART chưa commit trong thư mục chính đã được đối chiếu với gói bàn giao và lưu stash dự phòng với nhãn `Backup ART working copy before integrating 36eb453a into _MMO (2026-10-13)`. Giữ snapshot này để khôi phục bản cũ nếu cần; không apply toàn bộ lên bản mới vì sẽ đưa lại tài liệu/metadata cũ. DB, output và draft bị ignore không đưa vào commit hoặc stash này.

## Phạm vi và trạng thái

| Gói | Nội dung | Quyết định hiện hành |
| --- | --- | --- |
| [Quái/tinh anh Pixel01](design/characters/van-hai-monster-animation-v1/README.md) | 11 actor,440clip/2640pose action, tám hướng thật; source, calibration, socket candidate và bóng/prop/FX riêng | Đang ở ART review; chưa thay actor/AI/loot runtime |
| [VFX quái02](design/vfx/van-hai-monster-vfx-v2/README.md) | 33sequence/198frame,11kit có silhouette riêng; giữ01 để A/B | ART review riêng; test hoặc nhận xét tốt về body không tự duyệt cả FX/live |
| [Review cụm](design/characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md) | Cùng loài/hỗn hợp/escort,3–18con, full/managed FX và nhịp fixture | Phải ghép AI giãn vị trí, dàn nhịp và quota FX trong encounter thật |
| [Concept boss01/02](design/characters/van-hai-boss-concepts-v2/README.md) | Bốn identity, so cùng họ/Player/camera; Hắc03 dùng style người riêng | Lang neutral01 và Hắc neutral03 duyệt riêng; Tam/Cổ còn gate hình/prototype |
| [Lang Vương Motion01](design/characters/cloud-wolf-king-animation-v1/approval.json) | 64clip/384pose, tám hướng,5FX/30frame | Owner duyệt ART/motion/VFX theo556hash; root khóa ghi |
| [Hắc Ấn Motion01](design/characters/dark-seal-officer-animation-v1/README.md) | 72clip/432pose, tám hướng, body80/canvas160×112/chân80,104;6FX01/36frame | Body/view/motion/socket mới vẫn có phạm vi duyệt riêng |
| [Hắc Ấn Triện Thuật02](design/vfx/dark-seal-officer-vfx-v2/approval.json) | 8sequence/48frame, ba cặp tụ/phát riêng, contact, cổng phù và tan dư ảnh, vòng có khe | Owner duyệt ART/VFX/presentation theo106hash; root khóa ghi. Không suy duyệt body hoặc âm production |

Catalog/generation/delivery cũ giữ trạng thái lúc tạo. File `approval.json` theo hash là quyết định duyệt hình hiện hành; không đổi các flag lịch sử để giả thành runtime release. Dàn NPC vẫn là brief, chưa thêm NPC ART hoặc thoại vào room trong commit này.

## Lưu ý khi ghép gameplay

1. Dùng facts server/Core về castId/lifeId, thời điểm khóa/phát/resolve/cancel, vị trí và kết quả hit. Animation callback không tạo damage, movement, contact hoặc loot. VFX có tuổi/expiry/dedup riêng; snapshot trễ không reset tuổi.
2. Giữ một scale theo calibration nguồn, chân/depth/bóng riêng và camera1×. Canvas là padding, không phải body/collider. VFX giữ alpha mềm/gutter2; không fit từng pose hoặc áp mask body lên FX.
3. Phân Phù hiện có hai dư ảnh/cổng phù trình bày. Chúng không entity, targetability, damage hoặc loot. Gameplay ảo ảnh sau này cần contract riêng.
4. Khe90° của Ấn Hồi/Hồi Phong theo hướng đã khóa. Warning/footprint/collision do Core/server quyết định, không suy theo glow hoặc bitmap. Timing/size fixture không là cân bằng đã chốt.
5. Với nhóm: giãn điểm đứng/tiếp cận theo vai trò, chừa đường né; dàn warning/release bằng Core/server; giới hạn FX chồng theo vùng và mức nguy hiểm. Giảm FX phụ/dư ảnh trước, giữ body/warning/contact đã xác nhận.
6. Ghép live trên fixture riêng với writer/receipt/save hiện hành. Kiểm hit/miss/cancel, reconnect, checkpoint/thưởng chống trùng và tải encounter. Giữ navigation,9blocker, map, DB và draft của owner.

Commit chưa mở AI/server mới, HP/damage/loot/progression, party/PvP, farm vô hạn hoặc catalog phát hành. Các âm WebAudio là cue thử mặc định tắt; cache16MiB chỉ decoded actor/FX của review, không tổng GPU/browser RAM hoặc benchmark MMO.

## Kiểm và nguồn

[Biên bản Triện Thuật02](data/dark-seal-officer-vfx-v2-2026-10-13.json):13unit,432pose browser,192ca A/B hit/miss/cancel,96render khe, typecheck413file/23module. [Duyệt02](data/dark-seal-officer-vfx-v2-approval-2026-10-13.json) ghi106hash và guard khóa root. Các gói khác có biên bản scoped trong `docs/data/` và lệnh kiểm trong README tương ứng.

`.gitattributes` giữ exact bytes cho các gói nguồn mới; checkout Windows không được đổi newline làm sai hash. Không chạy builder đã khóa để tái đóng gói một ART đã duyệt. Sửa tiếp bằng version mới. Chỉ dùng pack/verify/test scoped; không full assets/build vì có owner map builder.

Sau khi merge/cherry-pick, cài dependencies ở checkout mới rồi chạy typecheck, kiểm hash và smoke phù hợp. Không dùng lại đường dẫn tuyệt đối của server review worktree cũ; mở `index.html` thuộc checkout đang dùng. Nguồn ART/prompt/canonical được lưu trong Git; `artifacts/`, cache, backend DB và output tạm không thuộc bàn giao.
