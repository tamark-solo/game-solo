# Dọn asset quái / tinh anh / Boss GDD cũ · 15/10/2026

**Đã rút toàn bộ 10 gói ART đối thủ GDD cũ khỏi luồng hiện hành** theo yêu cầu owner sau khi chấp nhận tạo hình mới. [Bộ GDD 0.34 đã duyệt](design/characters/gdd-character-concepts-v1/index.html) là trang ART hiện hành. [Kho lưu trữ](archive/gdd-legacy-enemies-2026-10-15/README.md) giữ nguồn, công cụ và lịch sử nguyên byte.

## Phạm vi dọn

10.584 file cũ được chuyển khỏi đường dẫn active, gồm 10.517 file trong 10 gói và 67 tool/test dành riêng cho chúng. 12 snapshot trước cleanup của README, AGENTS, trạng thái, gallery, inventory và delivery được sao chép thêm để đối chiếu. Tổng **10.596 entry / 16 ZIP độc lập** được kiểm hash và giải đọc lại. Payload gốc gồm snapshot là 760,616,202 byte (~725.4 MiB). Đây là phân tách thư viện, không báo giảm dung lượng Git hoặc ổ đĩa.

- Quái/tinh anh: neutral Pixel01, motion Pixel01/cluster, VFX01 và VFX02.
- Boss: concepts01/02, Hắc03, Lang Vương Motion01/FX, Hắc Motion01/FX và Hắc VFX02.
- Tool/test sản xuất và smoke riêng của các gói trên được đưa vào cùng archive; 9 lệnh npm cũ đã gỡ để không vô tình sản xuất hoặc kiểm bộ đã nghỉ.
- 24 thông báo HTML/Markdown thay các trang lịch sử. URL cũ dẫn về concept mới hoặc archive; không nạp PNG, atlas, production JSON hoặc JS của bộ cũ.
- Trang concept mới bỏ quái/boss cũ khỏi danh mục active. Trang thế giới giữ brief NPC và role/logic lịch sử, gỡ loader và toàn bộ hình quái/boss cũ.

## Duyệt bộ tạo hình mới

Ghi nhận đúng phản hồi owner: “tạo hình của quái/Boss và NPC, tuyến truyên, main đều ổn”. [Approval](design/characters/gdd-character-concepts-v1/approval.json) pin **18 neutral Đông Nam / 103 file source, native, input, prompt và lineage**. Ba source superseded của đợt mới vẫn giữ history. Gói đã khóa entry ghi nguồn/pack; motion/view/FX/runtime không được suy ra từ duyệt neutral.

Bốn ảnh input lịch sử dùng cho Kiếm Nô, Huyết Phù Sư, Thống Lĩnh và Hắc chân thân được verification đọc từ entry ZIP đúng original path/SHA-256. Không sửa basis/generation/registration/manifest hoặc pixel của bộ mới để vượt kiểm hash. Resolver chỉ phục vụ lineage, không là fallback runtime.

## Các biên được giữ

Main V5/P1/Pilot/V2, NPC và `docs/art_reference` giữ nguyên. Bộ live `sect-encounter-actors-v2` và toàn bộ 560 public asset file giữ hash; Lang/Khôi Lỗi đang chơi chưa migration. GDD0.34, world plan, catalog96 record/roster/ID và logic gameplay không đổi. 11 file runtime/map theo basis V2 cùng source/map owner vẫn nguyên byte; không DB/draft/receipt hoặc map builder.

Names/roles đối thủ Chặng1 vẫn trong GDD. ART lịch sử của chúng đã retirement; không tự lấy lại hoặc suy chúng có tạo hình mới trong 18 neutral Chặng2/main/story/NPC của đợt này. Cần scope tạo hình riêng nếu sản xuất lại Chặng1.

## Kiểm chứng

| Kiểm | Kết quả |
| --- | --- |
| ZIP/hash/phục hồi/caller/boundary | 32,438 checks PASS; 10.596 entry; 16 witness round trip trên đĩa |
| Neutral mới, lineage, basis và approval | 578 checks PASS; 19 basis / 103 approval pins |
| Browser gallery, retirement URL và world brief | 85 checks PASS; 11 URL cũ; 0 fetch asset cũ; desktop/mobile |
| Three texture/atlas/pivot mới | 36 GPU readback PASS |
| Main V2 | 27.445 delivery / 1.227 basis / 11 runtime-map pins PASS |
| Runtime actor hiện hành | 120 clip / 720 frame / 323 basis hashes PASS |
| Catalog | 96 record hợp lệ, 0 error; 84 cảnh báo unreleased/pending giữ nguyên |

[Archive verification](archive/gdd-legacy-enemies-2026-10-15/verification.json) · [Neutral verification](design/characters/gdd-character-concepts-v1/review/verification.json) · [Browser verification](design/characters/gdd-character-concepts-v1/review/browser-verification.json).

## Bản sao nội bộ còn giữ

Công cụ chặn lệnh PowerShell `Remove-Item` xóa bản sao cache theo policy. Không thử vòng qua lệnh chặn. Bản sao được giữ ở `artifacts/archive/gdd-legacy-enemies-2026-10-15/retired-working-copy` (Git ignored), ngoài luồng asset/review/build; các ZIP bền vững vẫn được giữ trong `docs/archive`. Không tuyên bố đã xóa hoàn toàn bản sao trên máy hoặc tiết kiệm dung lượng. Kho nguồn cũ vẫn phục hồi được, approval lịch sử nguyên hash.
