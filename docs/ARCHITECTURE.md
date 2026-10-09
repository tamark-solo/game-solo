# Kiến trúc mã nguồn

**Trạng thái:** đã tách `shared/`, `server/` và `client/` theo ranh giới; `client/src/main.ts` chia theo lớp và tính năng. Nhánh `_MMO` (Hằng Nhạc, Map Editor, skill) đã được gộp vào cấu trúc này. Các tính năng đó vẫn giữ vị trí cũ, xem mục 8.

## 1. Nguyên tắc

- **Một package, nhiều module có ranh giới rõ.** Chưa tách thành service. Khi cần scale, mỗi module đã có đường biên để tách sau.
- **Luật thuần không phụ thuộc framework.** `shared/` và `features/*/model.ts` không dùng Colyseus, Three.js hay DOM, nên test được trực tiếp.
- **Adapter mỏng.** Colyseus (`server/`, `client/src/net/`), Three.js (`client/src/render/`) và DOM (`client/src/core/elements.ts`) chỉ nối luật vào framework.
- **Trạng thái trình duyệt ở một chỗ.** `core/state.ts` định nghĩa `AppState`; các tính năng đọc và ghi qua object này. Mọi id DOM nằm ở `core/elements.ts`.
- **Import tường minh.** Không dùng `index.ts` để gom export, để truy vết lỗi nhanh hơn. Alias `@shared/*` thay cho chuỗi `../../`.

## 2. Luật phụ thuộc

Kiểm tra bằng `npm.cmd run check:boundaries`. Lệnh này chạy trong `npm.cmd run typecheck`, nên `build` cũng kiểm tra. Vi phạm ranh giới hoặc vòng phụ thuộc làm lệnh thất bại.

Client (`client/src/`), mỗi module chỉ được import các module sau:

- `app` (ghép nối, vòng lặp, hook DEV): shared, core, ui, hud, render, assets, net, feature-preview, feature-courtyard
- `ui` (chuyển chế độ, đồng bộ giao diện): shared, core, feature-preview, feature-courtyard
- `feature-preview`: shared, core, render, ui
- `feature-courtyard`: shared, core, render, net
- `hud`: shared, core, render
- `core` (trạng thái, DOM, input, tạo actor): shared, render, assets, net
- `render`: shared, assets
- `assets`, `net`: shared
- `client` (trang gốc `client/src/*.ts` và `skills/`): shared, app, core, ui, hud, render, assets, net, feature-preview, feature-courtyard. Đây là lớp trên cùng; không module nào khác import nó.

Các module khác:

- `server`: shared
- `shared`: chỉ import nội bộ `shared` (và `@colyseus/schema` cho hợp đồng mạng)
- `scripts` (sinh asset, release, API Map Editor): shared
- `config` (`vite.config.ts`): scripts
- `tests`: tất cả

Các tính năng không import nhau. Vòng phụ thuộc lúc chạy bị cấm. `import type` bị bỏ qua khi tìm vòng vì không còn lúc chạy, nhưng vẫn phải đúng luật module ở trên.

Gói bên ngoài bị cấm theo lớp:

- `shared`: three, colyseus, @colyseus/sdk, @colyseus/ws-transport
- `client`: colyseus, @colyseus/ws-transport
- `server`: three, @colyseus/sdk

## 3. Bản đồ thư mục

```
shared/                         luật và hợp đồng dùng chung (không biết client/server)
  protocol/                     hằng số giao thức, MoveInput, schema trạng thái
  world/                        types, map (WORLD, isWalkable), movement (va chạm, di chuyển)
  hang-nhac.ts, navigation.ts   release và va chạm polygon Hằng Nhạc
  map-editor.ts, level-design.ts, asset-extraction.ts, editor-guides.ts, region-spline.ts
  sect.ts, sect-route.ts, profiles.ts, r01.ts, starter-region.ts
  skills/                       luật skill thuần: engine, behaviors, timeline, contracts
  data/hang-nhac.json           bản phát hành Hằng Nhạc (sinh bởi npm run assets)
server/src/
  index.ts                      điểm vào: Colyseus, API hồ sơ, HTTP
  config.ts                     cổng, host, giới hạn phòng, transport
  http/health.ts                route /health
  rooms/courtyard/room.ts       phòng sân chung (adapter Colyseus, có hook cho lớp con)
  HangNhacRoom.ts               phòng Hằng Nhạc, kế thừa phòng sân chung
  sect-progress.ts, profile-store.ts, profile-api.ts   tiến trình môn phái, hồ sơ SQLite, API hồ sơ
client/src/
  main.ts                       điểm vào trang chính
  chibi-pilot.ts, hang-nhac.ts, map-editor*.ts, sect-ui.ts, starter-region.ts, profiles.ts, r01-presentation.ts
                                trang và tính năng `_MMO`, đặt ở gốc client/src
  skills/                       trình bày skill phía client (aim, session, Three.js)
  app/
    boot.ts                     startApp(): gắn sự kiện, nạp catalog và asset
    loop.ts                     vòng lặp khung hình, camera, FPS
    debug.ts                    hook kiểm thử (chỉ DEV)
  core/
    state.ts                    AppState, Mode
    elements.ts                 mọi id DOM của ứng dụng
    actors.ts                   tạo actor từ asset đã nạp
    input.ts                    bàn phím, nút cảm ứng, readInput()
  ui/
    shell.ts                    setMode(), rebuildLocalActors(), sự kiện chế độ và khung xem
    mode-view.ts                updateModeUI(): đồng bộ giao diện theo chế độ
  features/preview/             xem animation và thử trên map
    model.ts                    hướng được phép, lọc input (thuần)
    actors.ts                   actor cục bộ, giá trị mặc định theo asset
    simulation.ts               cập nhật actor cục bộ mỗi khung hình
    view.ts                     trạng thái bảng điều khiển xem
    controls.ts                 sự kiện bảng điều khiển xem
  features/courtyard/           sân chung online
    actors.ts                   actor online từ trạng thái server
    view.ts                     trạng thái kết nối, roster, thông báo
    controls.ts                 vào và rời sân, cửa sổ người chơi thứ hai
  hud/hud.ts                    số đọc trên khung xem
  render/renderer.ts            vẽ bằng Three.js
  render/occlusion.ts           mặt nạ alpha cho phần che khuất
  render/sprite-frame.ts        geometry và UV riêng của từng frame sprite
  assets/atlas.ts               kiểm tra và đọc atlas
  assets/animation.ts           phát animation theo quãng đường
  net/session.ts                kết nối và dự đoán Colyseus
scripts/                        sinh asset, release Hằng Nhạc, API Map Editor, check-boundaries.mjs
tests/unit/                     test thuần (npm test)
tests/smoke/                    test với server và trình duyệt thật
tests/support/                  hàm hỗ trợ cho smoke test
docs/ARCHITECTURE.md            tài liệu này
```

## 4. Luồng dữ liệu chính

**Client**

1. `core/input.ts` đọc phím và nút cảm ứng thành `Input {x, y}`.
2. Chế độ inspector và map: `features/preview/simulation.ts` cập nhật actor cục bộ bằng `shared/world/movement.ts`.
3. Chế độ online: `net/session.ts` gửi `MoveInput` và dự đoán bằng `applyMovement`. `features/courtyard/actors.ts` đồng bộ actor từ trạng thái server.
4. `app/loop.ts` chạy mỗi khung hình: cập nhật actor, `render/renderer.ts` vẽ, `hud/hud.ts` cập nhật số đọc khoảng 90 ms một lần.

**Server**

1. `rooms/courtyard/room.ts` nhận `MoveInput` và kiểm tra bằng `sanitizeMovement`.
2. Mỗi tick áp dụng `applyMovement` lên `CourtyardState`.
3. Colyseus đồng bộ trạng thái về mọi client.

## 5. Khi có lỗi, xem ở đâu

| Triệu chứng | Nơi kiểm tra trước |
| --- | --- |
| Trang báo "Thiếu thành phần" | `client/src/core/elements.ts` (id không khớp `index.html`) |
| Trang không mở, báo "Không mở được preview" | `client/src/app/boot.ts`, `client/src/assets/atlas.ts` |
| Nút chế độ, panel ẩn hiện sai, tiêu đề sân | `client/src/ui/mode-view.ts`, `client/src/ui/shell.ts` |
| Đổi chế độ không reset đúng, zoom, nền, điểm neo | `client/src/ui/shell.ts` |
| Chọn bộ hình, FPS, sải bước, nút hướng | `client/src/features/preview/controls.ts`, `client/src/features/preview/view.ts` |
| Actor cục bộ sai vị trí hoặc hướng ban đầu | `client/src/features/preview/actors.ts` |
| Map đi sai hướng hoặc bị nhận input không được phép | `client/src/features/preview/model.ts`, `client/src/features/preview/simulation.ts` |
| Phím hoặc nút cảm ứng không phản hồi | `client/src/core/input.ts` |
| Vào, rời sân, cửa sổ người chơi thứ hai | `client/src/features/courtyard/controls.ts` |
| Trạng thái kết nối, roster, thông báo sân | `client/src/features/courtyard/view.ts` |
| Người chơi khác giật, lệch hoặc biến mất | `client/src/features/courtyard/actors.ts`, `client/src/net/session.ts` |
| Số đọc FPS, vị trí, frame | `client/src/hud/hud.ts` |
| Hình lệch điểm chân, sai thứ tự che khuất | `client/src/render/renderer.ts`, `client/src/render/occlusion.ts` |
| Frame hoạt hình sai, chân không khớp quãng đường | `client/src/assets/animation.ts`; test `tests/unit/atlas.test.ts` |
| Luật di chuyển, va chạm | `shared/world/map.ts`, `shared/world/movement.ts`; test `tests/unit/world.test.ts` |
| Input bị bỏ, server không cho đi | `shared/protocol/input.ts`, `server/src/rooms/courtyard/room.ts` (`simulate`) |
| Không vào được sân, sai tên phòng | `server/src/config.ts`, `shared/protocol/constants.ts`, `server/src/rooms/courtyard/room.ts` (`onJoin`) |
| Mất kết nối, không vào lại được | `server/src/rooms/courtyard/room.ts` (`onDrop`, `onReconnect`) |
| `/health` thiếu trường hoặc sai số liệu | `server/src/http/health.ts` |
| Hằng Nhạc: vào phòng, hồ sơ, lưu sau reload | `server/src/HangNhacRoom.ts`, `server/src/profile-store.ts` |
| Skill: hướng, ngắm, cast, hiệu ứng | `shared/skills/`, `client/src/skills/` |
| Hook kiểm thử thiếu hoặc sai trường | `client/src/app/debug.ts` |

## 6. Thêm một tính năng phía client

Ví dụ tính năng `cultivation`:

1. `features/cultivation/model.ts`: luật thuần, không chạm DOM. Test đặt trong `tests/unit/`.
2. `features/cultivation/actors.ts` và `view.ts`: đọc và ghi `AppState`. Id DOM mới thêm vào `core/elements.ts`.
3. `features/cultivation/controls.ts`: gắn sự kiện, đăng ký trong `app/boot.ts`.
4. Nếu cần cập nhật mỗi khung hình, thêm vào `app/loop.ts`.
5. Khai báo module mới trong `moduleRoots` và `allowed` của `scripts/check-boundaries.mjs`. Thư mục không khai báo thuộc module `client` chung: chỉ trang gốc và test được import nó, và nó không được import ngược vào `core/` hay `features/`. Khai báo rõ để giữ luật của tính năng.
6. Chạy `npm.cmd run typecheck` và `npm.cmd test`.

## 7. Thêm một module phía server hoặc luật thuần

- Luật thuần: đặt trong `shared/` theo tính năng, không import Colyseus, Three.js hay DOM. Test đặt trong `tests/unit/`.
- Hợp đồng mạng: `shared/protocol/`.
- Adapter server: `server/src/rooms/<tên>/` hoặc thư mục dịch vụ riêng trong `server/src/`.
- Khai báo module mới trong `scripts/check-boundaries.mjs`.

## 8. Việc còn lại

- Chuyển tính năng `_MMO` ở gốc `client/src/` vào `features/<tên>/`, và phòng/hồ sơ Hằng Nhạc ở gốc `server/src/` vào `rooms/` hoặc thư mục riêng. Khi chuyển, cập nhật đầu vào HTML trong `client/`, các import và luật trong `scripts/check-boundaries.mjs`.
- Tách các file `shared/*.ts` của `_MMO` theo tính năng khi tính năng ổn định.
- Luật tu luyện: thêm `shared/game/` khi bắt đầu engine.
- Lưu bền và tài khoản: thêm `server/src/persistence/` khi chọn cơ sở dữ liệu. Hiện hồ sơ dùng SQLite trong `profile-store.ts`.
- Khi thêm tính năng thứ ba, cân nhắc tách `ui/mode-view.ts` để mỗi tính năng tự đồng bộ giao diện của mình.

## 9. Kiểm tra khi đổi cấu trúc

- Luôn chạy: `npm.cmd run assets` (sinh `client/public/`, các test đọc từ đây), `npm.cmd run typecheck` (gồm kiểm tra ranh giới), `npm.cmd test`, `npm.cmd run build`.
- Chạm lifecycle, input, renderer hoặc level design thì chạy các smoke tương ứng trong [PREVIEW-RUNBOOK](PREVIEW-RUNBOOK.md) và [AGENTS.md](../AGENTS.md).
- Smoke test dùng Chrome; đặt `CHROME_PATH` nếu Chrome không ở vị trí mặc định.
- Trên Windows với `core.autocrlf=true`, file dữ liệu có khóa băm (ví dụ `docs/data/authored-maps/*.json`) có thể bị đổi sang CRLF và làm sai hash. Giữ file ở đúng byte đã commit.
