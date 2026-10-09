# Hằng Nhạc — HUD Vân Ngọc và map nhiều layer

**09/10/2026 · nhánh `_MMO`.** Chủ dự án xác nhận HUD demo đã được duyệt, yêu cầu ghép game và chỉ định nguồn map:
`C:/Users/AnhLT/Documents/GM/game-solo/docs/design/world/hang-nhac-layer-split-v1/multipart-review-v4/review.html`.
Trang này hiện hiển thị clone **main-route-v6, cột/đèn v7, cây v9**, không phải project v4 trước cập nhật.

## Chạy

```powershell
cd C:\Users\AnhLT\.codex\worktrees\f2e9\game-solo
npm.cmd run dev
```

Mở **http://127.0.0.1:5173/hang-nhac.html**. Nếu terminal dev đang chạy phiên trước, khởi động lại client/backend rồi tải lại trang để hai phía dùng cùng map version. **Không xóa DB, token khách hoặc save.** Nếu dùng backend riêng, giữ `GAME_DB_PATH` đang dùng.

## HUD thật

- Khung Vân Ngọc 760 × 140, HP trái/MP phải, ba skill R01 và bảy ô chưa gán không tương tác.
- `SkillSession` cấp `HotbarView` từ nhân vật/snapshot server, đồng hồ server, cooldown, cast và mục tiêu cá nhân. Không trừ tài nguyên hoặc khởi động animation từ trang demo.
- Click và phím 1/2/3 dùng cùng protocol `skill:cast` và input sequence hiện có. Thiếu mục tiêu/MP, cooldown, đang cast hoặc offline được giải thích bằng tooltip/feedback.
- Collection schema chưa tới trong handshake giữ HUD khóa; không gọi `.get()` trên collection chưa decode.
- Tương tác cầu/HUD không đổi aim trên map. Tooltip Tab/Escape, Linh quang, reduced motion và dọn FX/timer khi pagehide giữ hoạt động.
- Màn hình nhỏ có fallback chức năng ba nút 48 px; không coi đây là duyệt artwork mobile mới.

## Scene map

[Package tự chứa](design/world/hang-nhac-layered-v1/README.md): **22 object / 32 part / 10 cover**; gồm 6 ground tile, 7 công trình multipart, 6 cột/đèn và 3 cây multipart. Pixel RGBA giữ nguyên sau đóng gói lossless; không tạo ART mới.

- `shared/map-presentation.ts` chuyển object/part/layer thành placement thuần theo native canvas, pivot, scale, flip và cờ hoạt động. Cờ hiện/khóa của editor không tự tắt runtime.
- Renderer nạp part độc lập, ground/decor ở band cố định, thân/mái/tán cùng y-sort với nhân vật. Canvas/pivot chung không dịch riêng từng part.
- Cover chỉ mờ 35% khi nhân vật điều khiển phía sau có alpha thật giao nhau; body giữ opacity. Đi phía trước hoặc giao vùng alpha trống không làm cover mờ.
- 9 region, walk policy, Spawn **(1616,992)**, world **3072 × 2048**, camera 1×, frame **64 × 96**, anchor **(32,88)**, radius **8** và tốc độ giữ nguyên.
- Không sửa authored map, nguồn review `_art`, browser draft hoặc DB thật. Lan can/cây trắng vẫn bake theo nguồn review, không tự tách thêm.
- `background` trong release là ảnh tổng quan cho minimap/demo, không phải nền bake mà game dùng để thay part. Tổng ảnh part **10.358.398 byte**, overview **2.690.422 byte**; nén không phải đo tải/bộ nhớ GPU.

## Build và kiểm

`npm.cmd run assets` kiểm hash owner/project/ảnh, audit và geometry rồi copy package vào public và sinh release client/server. Không cần Python, `file:///` hoặc worktree ART khi build bình thường. Python/Pillow chỉ dành cho import nguồn mới chủ ý; không chạy lại để sửa ART.

Đã kiểm typecheck/boundaries, 100 unit test, build, map online/browser, R01, hướng/input, 36 cast, 300 frame body/ghost, 10 clip FX, NPC/thổ nạp và reload/reconnect/restart. Lệnh mới:

```powershell
npm.cmd run test:hang-nhac-hud-layers
```

Test dùng DB/browser/render fixture riêng, kiểm handshake, snapshot, tooltip, target, phím/nút, desktop/mobile và alpha/y-sort GPU. Tham chiếu [biên bản](data/hang-nhac-hud-layers-verification.json); screenshot/log mới trong `artifacts/`.

Không mở HN03–HN12, farm/loot, portal, khảo nghiệm, offline hoặc đăng nhập production trong đợt này. Thay đổi đã để trong working tree `_MMO`, chưa tạo commit.
