# Prototype cơ chế trang bị: Huyễn Tâm và Tịch Bạch

Ngày 14/10/2026 · P2 · Fixture độc lập · Chưa tích hợp runtime.

Gói này triển khai tám hợp đồng ST/AOE cho bốn pháp bảo theo [kế hoạch đã chốt](../../../WANG-LIN-IMPLEMENTATION-PLAN.md). Hai nhân vật dùng chung cơ chế trong prototype; nhận diện, body, grip và palette được sản xuất và kiểm riêng ở P1/P3. Core không dùng texture để quyết định trúng, không thay HP hoặc cấp credit của game.

Concept V5 là căn cứ hình vùng. Toàn bộ range, timing, cap, độ rộng và magnitude ở đây là **số thử nghiệm**, cần kiểm trong encounter trước khi chốt balance. [Approval V5](../../characters/wang-lin-concept-direction-v5/approval.json) chỉ duyệt concept tĩnh; gói này không mở duyệt motion, FX production hoặc runtime.

## Tám hợp đồng

| Họ | ST | AOE | Quy tắc fixture |
| --- | --- | --- | --- |
| Kiếm linh | Kiếm Ý Nhất Tuyến: một hành lang, tối đa một địch | Kiếm Trận Phá Giới: ba hành lang **song song**, ba wave | Tối đa năm địch/wave; một target/life chỉ trúng một lần trong cùng wave dù giao nhiều tuyến. Kiếm linh không tự thêm hit. |
| Hồn phiên | Chủ Hồn Dẫn Lộ: khóa life và điểm mục tiêu, hai pulse | Tam Môn Tụ Hồn: ba gate tạo tam giác và stream hướng vào tâm | Tối đa sáu địch/pulse. Tâm có khoảng mở; viền tam giác chỉ báo vùng. Mục tiêu ST rời điểm khóa có thể hụt. |
| Xạ Thần Xa | Giải Niêm Dẫn Thú: một contact theo tuyến | Lôi Thú Liệt Địa: hai rail và ba node contact tuần tự | Rail là cảnh báo; node gây hit ở pulse tương ứng. Tối đa bốn địch/node; pulse khác có thể tác động lại đúng luật. |
| Thiên Nghịch Châu | Dẫn Giới Hộ Thân: khóa ally hoặc bản thân | Nội Giới Hộ Đạo: ba sanctuary và nếp giới có border | Sanctuary phát support cho ally, border phát control cho địch. Cap ba ally/bốn địch mỗi pulse. Không phát hit, damage hay practice credit. Vòng caster chỉ định vị cảnh. |

ST Kiếm/Xa dùng hướng đã khóa, chọn địch gần nhất đủ điều kiện tại contact. ST Phiên/Châu yêu cầu đúng team, tầm, LOS và life khi chấp nhận cast; điểm hiệu lực được khóa ở lúc đó. AOE xét roster đang sống tại từng pulse, nên một spawn life mới có thể nhận pulse sau. Mọi cap chọn target gần origin trước, rồi theo ID khi bằng khoảng cách.

## API thuần cho Node và browser

[core.mjs](core.mjs) là ESM, không dependency và không I/O. [contracts.json](contracts.json) là bản đọc của các contract đóng băng trong module; verifier kiểm hai bản giống nhau. [fixtures.json](fixtures.json) giữ roster mẫu cục bộ.

```js
import {
  createPrototype, exampleWorld, viewAt, createFactInbox, restorePrototype,
} from './core.mjs';

const origin = { x: 140, y: 250 };
const aim = { x: 1, y: 0 };
const engine = createPrototype(exampleWorld(origin, aim));
const accepted = engine.cast({
  castId: 'fixture-1', actorId: 'caster', family: 'sword', mode: 'aoe',
  startedAt: 0, origin, aim,
});
engine.advance(1120);
const view = viewAt(engine.casts[0], 1120);
const inbox = createFactInbox();
inbox.ingest(engine.facts, 1120);
const effects = inbox.effectsAt(1120);
const resumed = restorePrototype(JSON.stringify(engine.snapshot()));
resumed.advance(2180);
```

- `cast(request)` trả `{accepted, reason?, cast?, facts}`. `targetId` dùng cho ST Phiên/Châu; Châu mặc định ally có ID bằng `actorId` nếu không truyền target. `targetLifeId` tùy chọn để chặn lệnh chọn life cũ.
- `advance(now, worldUpdate?)` trả facts mới, với thời gian tuyệt đối. `updateWorld({targets?, blockers?}, at)` là cùng thao tác khi thay roster/LOS. Target có `{id, lifeId, team, x, y, radius, alive}`; blocker là rectangle `{x,y,width,height}`.
- `cancel(castId, at)` trước release chặn release/contact; đúng timestamp release thì release/contact được giải quyết trước cancel. Sau release, cancel chặn các pulse tương lai và giữ facts đã xác nhận. Support/control đã có tiếp tục duration của mình.
- `geometryFor(cast)` trả shape và anchor khóa: circle, corridor có đầu phẳng, polygon hoặc border. `role` tách damage/support/control/warning; `pulseId` của Xa chọn đúng node.
- `viewAt(cast, now)` dùng cho seek: warning → charge → release → active → residual → complete. Seek chỉ tạo descriptor, không giải quyết hit. `advance` không lùi clock; khi đổi scenario hoặc seek lại simulation, tạo engine mới rồi tiến tới thời điểm cần xem.
- `facts`, `casts`, `world` và `snapshot()` trả bản sao. Core không lấy `Date.now`, callback RAF hoặc trạng thái renderer.

Snapshot roster tại `t` áp trước các event **đúng** `t`; event trước `t` dùng roster cũ. Đây là mô hình piecewise-constant của fixture, không suy đường đi đã xảy ra giữa hai snapshot. Khi cần thử target di chuyển, cập nhật roster ở các timestamp xác định.

## Facts, life và reconnect

Facts có `castId`, `pulseId`, `targetId`, `targetLifeId`, `effectId`, `at`, origin/aim và `key`. Contact dùng khóa `(cast, pulse, target, spawnLife, effectId, type)`; một target giao nhiều shape chỉ tạo một contact trong pulse. Mỗi node/contact có effect ID ổn định. Không dùng `castId:type` để dedup nhiều điểm trúng.

`createFactInbox()` chỉ nhận facts fixture để tạo presentation. Event tới trễ giữ tuổi `now-at`; contact hết lifetime vẫn được đánh dấu đã thấy và không phát lại từ đầu. Event tới trước thời điểm hiệu lực không hiện effect cho đến `at`. Inbox không sửa world, HP hoặc credit.

`snapshot/restorePrototype` chứng minh JSON reconnect tiếp tục cursor pulse và ledger, không phát lại pulse đã giải quyết. Snapshot đã cancel giữ trạng thái terminal; cancel cũ không tác động cast mới. Snapshot này chỉ là fixture cục bộ, không phải schema save hoặc bộ kiểm quyền cho dữ liệu gameplay không tin cậy. Capacity 128 cast/target, 64 blocker và 4.096 facts là giới hạn thử nghiệm để tránh tăng vô hạn, không phải benchmark MMO.

## Kiểm và bàn giao

```powershell
node --test tests/unit/wang-lin-equipment-prototype.test.mjs
node docs/design/gameplay/wang-lin-equipment-prototype-v1/verify.mjs
```

Unit kiểm biên/tangency/tầm/LOS; overlap/cap; đời mục tiêu; hủy trước/sau release; ST trúng/hụt; thứ tự node; support/control; clock nhảy; late/duplicate facts; seek; JSON reconnect và dữ liệu hỏng. Verifier kiểm tám contract, roster, baseline 86 pin V5 và tạo [report](review/verification.json) trong gói mới.

Gói không import live engine/server/avatar/save, không mở registry/quyền equip hoặc reward, không ghi owner map/navigation/DB/draft/receipt và không gọi builder tổng. P3 dùng hình motion/FX mới để nối cùng facts này; P6 sẽ chuyển hợp đồng được chốt sang engine server và schema có version qua fixture riêng.
