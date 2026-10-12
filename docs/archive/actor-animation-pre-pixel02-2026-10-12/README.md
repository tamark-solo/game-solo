# Nguồn animation trước Pixel02 · lưu trữ

**12/10/2026:** theo yêu cầu owner dọn bộ cũ sau khi chốt Ngự Phong. [Manifest](manifest.json) có2405file/hash và49target dọn. ZIP đã được giải đọc từng entry để đối chiếu SHA256 trước khi xóa bản active; giữ nguyên mọi nguồn/raw PNG/prompt/registration/canonical trong archive.

Gồm pilot01, production01 (cả Vương Lâm/Thanh Nham Lang/Trấn Sơn Khôi Lỗi), study Pixel48pose/hai hướng, bộ demo/UI/scripts cũ, public copies,4source run không chọn và2source Phong sai góc. Các snapshot review/plan trước migration lưu `backupOnly`; không phải tất cả snapshot đều bị xóa khỏi active.

Archive136248757byte, chia ba phần dưới50MiB để version Git: `sources.zip.001/.002/.003`, có hash từng phần và hash ZIP tổng trong manifest. `sources.zip` ghép lại ở local được gitignore; ba phần vàmanifest là nguồn bền vững.

```powershell
node scripts/verify-retired-actor-archive.mjs
node scripts/verify-retired-actor-archive.mjs --materialize
```

ZIP dùng tên member đúng đường dẫn tương đối workspace. Lấy member cần đối chiếu vào thư mục mới; không ghi đè bộ đã chốt hoặc tự khôi phục toàn bộ pipeline cũ. Nguồn quái/boss lịch sử vẫn có thể dùng làm reference cho phiên bản mới.

[Bộ hiện hành40clip/240pose](../../design/characters/actor-animation-standard-v2/README.md) giữ nguyên canonical/source đã chốt. Không dọn nguồn đang dùng bởi game, owner map/navigation/DB/draft, `docs/art_reference` hoặc thư viện trang phục/customization mà owner yêu cầu giữ. Các đường dẫn/demo cũ được đánh dấu retired; review thống nhất dùng bộ mới.
