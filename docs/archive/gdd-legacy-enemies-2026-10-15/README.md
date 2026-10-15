# Kho ART quái / tinh anh / Boss GDD cũ · 15/10/2026

Owner duyệt tạo hình GDD mới và yêu cầu dọn các bộ đối thủ thuộc hệ GDD cũ để tránh lẫn. [Tạo hình hiện hành đã duyệt](../../design/characters/gdd-character-concepts-v1/index.html) · [Manifest/hash](manifest.json) · [Kiểm chứng](verification.json) · [Biên bản](../../GDD-LEGACY-ENEMY-ASSET-CLEANUP-2026-10-15.md).

**10 gói, 10.584 file được rút khỏi luồng active**, gồm 67 tool/test. 12 snapshot hồ sơ trước cleanup được sao chép thêm để giữ lịch sử. Tổng 10,596 entry / 760,616,202 byte, 16 ZIP độc lập; mỗi entry được đọc lại và so SHA-256. Source, prompt, input, native, atlas, registration, approval và evidence trong ZIP nguyên byte; không đổi hash approval cũ.

| Gói cũ | Trạng thái |
| --- | --- |
| `docs/design/characters/van-hai-monster-concepts-v1` | Đã lưu trữ |
| `docs/design/characters/van-hai-monster-animation-v1` | Đã lưu trữ |
| `docs/design/characters/van-hai-boss-concepts-v1` | Đã lưu trữ |
| `docs/design/characters/van-hai-boss-concepts-v2` | Đã lưu trữ |
| `docs/design/characters/van-hai-dark-seal-officer-v3` | Đã lưu trữ |
| `docs/design/characters/cloud-wolf-king-animation-v1` | Đã lưu trữ |
| `docs/design/characters/dark-seal-officer-animation-v1` | Đã lưu trữ |
| `docs/design/vfx/van-hai-monster-vfx-v1` | Đã lưu trữ |
| `docs/design/vfx/van-hai-monster-vfx-v2` | Đã lưu trữ |
| `docs/design/vfx/dark-seal-officer-vfx-v2` | Đã lưu trữ |

## Cách phục hồi khi cần đối chiếu lịch sử

Chạy `python scripts/verify-gdd-legacy-enemy-cleanup.py` từ workspace để kiểm part/entry hash, round trip trên đĩa của một witness mỗi part và biên source/runtime được giữ.

Giải nén toàn bộ `part-001.zip` đến `part-016.zip` vào **một thư mục độc lập trống**. Từng ZIP là file chuẩn tự đọc được; không nối binary các part. Entry chứa đường dẫn workspace gốc để đối chiếu provenance và approval. Không giải nén đè workspace hiện hành. Tool/test trong archive có cwd và đường dẫn của hệ cũ, chỉ chạy khi dựng fixture lịch sử độc lập đủ dependency.

Bốn bitmap input mà concept mới từng tham khảo được verification đọc trực tiếp từ ZIP đúng original path/hash. Đây là kiểm lineage, không tải asset cũ vào renderer hoặc runtime.

## Phần còn giữ

Main V5/P1/Pilot/V2 và NPC không thuộc yêu cầu cleanup. `docs/art_reference`, catalog/roster/logic GDD, nguồn `sect-encounter-actors-v2`, toàn bộ public assets đang chạy và 11 pin runtime/map giữ nguyên. Vòng chơi cũ có Lang/Khôi Lỗi được giữ cho tới migration runtime được yêu cầu riêng. 24 notice HTML/Markdown ở URL cũ chỉ dẫn về bộ GDD mới và hồ sơ này; không giữ payload ART cũ ở `docs/design`.

Kho này là lịch sử và nguồn học kỹ thuật. Approval lịch sử không tự biến thành approval/ART basis của GDD mới. Concept main/story/NPC/quái/boss mới có [approval riêng](../../design/characters/gdd-character-concepts-v1/approval.json).

## Cache ngoài luồng active

Lệnh xóa bản sao cache bị công cụ chặn theo policy. Bản sao nguyên byte vẫn giữ ở `artifacts/archive/gdd-legacy-enemies-2026-10-15/retired-working-copy`, Git ignored và không được loader/tool active sử dụng. Các ZIP tại đây là nguồn lưu trữ bền vững; không báo đã giảm dung lượng ổ đĩa.
