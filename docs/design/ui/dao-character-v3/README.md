# Linh Đài 03 — hồ sơ bàn giao UX

**11/10/2026.** [Thiết kế, phạm vi, nguồn và Core](../../../CHARACTER-INVENTORY-UX-V3.md); [trang thử](http://127.0.0.1:5174/ui-material-review.html).

[workflow.json](workflow.json) ghi view/scenario/flow/contract, đường dẫn và hash source tại thời điểm kiểm. Không item definition, balance catalog hoặc nguồn dữ liệu mà game đọc. Bản này giữ `ownerApproved=false`, `runtimeIntegrated=false`; test không suy duyệt hình.

Không tạo ART/raster mới. Khung [Dao hai theme](../dao-dual-theme-v1/README.md), [glyph HUD 04](../dao-hud-navigation-v2/README.md) và item ART nhập môn dùng lại nguồn dự án. Vùng hình nhân vật chờ bản owner; không vẽ portrait/sprite để lấp chỗ.

[Verification](../../../data/dao-character-v3-verification.json) giữ layout/chữ, sáu tình huống, luồng trang bị/vật tư/nguồn, theme/focus và HTTP/storage isolation. Ảnh desktop/mobile ở `artifacts/dao-character-v3/`. Code transition trong Core chỉ dành cho review; live game dùng `CharacterView`/`CharacterCommand` cùng session/backend đã có.
