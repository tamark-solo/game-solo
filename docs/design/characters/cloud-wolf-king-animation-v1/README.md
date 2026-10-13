# Vân Nha Lang Vương · solo motion01

Gói sản xuất đầu cho `BOSS-VH-CLOUD-WOLF-KING`, theo neutral Đông Nam96px đã được owner chấp nhận. Phạm vi nghiệm thu là **64clip / 384pose action / tám hướng vẽ thật**, cùng **năm sequence VFX / 30frame** tách khỏi thân. Neutral calibration dùng để đo nguồn, không tính vào384pose. Xem [sân solo](index.html), [nhịp chiêu mẫu](kit.json) và [lưu ý ghép gameplay](INTEGRATION-NOTES.md).

| Nhóm | Action / sequence |
| --- | --- |
| Thân · mỗi action tám hướng, sáu pose | idle, move, attack, hit, death, appear, van_nha, hoi_phong |
| Khí thuật · mỗi sequence sáu frame | charge, release, hoi_phong, impact, arrival |

Nam phải nhìn chính diện, Bắc nhìn lưng; Đông/Tây là profile và bốn hướng chéo có góc nhìn riêng. Không mirror hoặc đổi tên clip để lấp hướng thiếu. [Catalog](catalog.json) ghi coverage thực tế; ma trận là công cụ đối chiếu hình, không chứng minh motion đã được duyệt.

## Thân, điểm chân và nguồn

Thân đứng danh nghĩa96px, canvas chung320×176, pivot(160,144). Canvas lớn là khoảng trống cho chồm/ngã; không tăng cơ thể, collider hoặc tỷ lệ camera. Một scale lấy từ median chiều cao neutral của từng nguồn được dùng cho mọi action trong nguồn đó. Không fit bbox từng pose hoặc kéo thân ngã về chiều cao đứng.

Root ngang của loài bốn chân được đo trên **dải16% dưới của neutral**, lấy trung điểm khoảng tiếp xúc trái–phải của các chân đặt đất. Dải hẹp chỉ chứa một bàn chân có thể làm cả thân nhảy ngang khi đổi cột. Lưu witness và root từng cột, kiểm lại chân/tail trên hình; không coi mép đuôi là tiếp xúc đất. Các action dùng lại root neutral; support plane, corpse contact và lift được đăng ký riêng, bóng/depth theo world foot.

[Basis](basis.json) pin nguồn neutral được duyệt. `sources/`, `prompts/`, `inputs/` và `generation/` lưu ảnh gốc, prompt, input/hash và lịch sử sửa nguồn. [Registration](source-registration.json) nối source rect, component sở hữu, scale, root, offset và native bounds với canonical PNG/atlas. Bản nguồn được thay giữ trong lịch sử; không sửa RGB nguồn hoặc khôi phục player/quái cũ để bù pose. Atlas có gutter2px; VFX giữ alpha mềm và chi tiết rời, không áp threshold body lên khí thuật.

## Nhịp solo và kiểm hình

Core lấy tuổi tuyệt đối của clip ở24FPS. `kit.json` khóa nhịp fixture cho Nanh cắn, Vân Nha và Hồi Phong; pose không tự phát damage, movement hoặc hit. Sân có Trúng/Hụt/Hủy trước release, seek theo ms, bật/tắt FX/bóng/neo/neutral và nền Vân Ngọc/sáng/tối ở native1× hoặc nearest2×. Vương Lâm dùng làm đối chiếu tỷ lệ.

Vân Nha giữ điểm đến qua hồi thế, chỉ về điểm xuất phát khi chủ động phát lại lượt thử. Hồi Phong có khe90° phía sau hướng đã khóa; không quay khe để bám player. Impact chỉ hiện khi fixture xác nhận trúng. Release/contact có tuổi và khóa chống lặp riêng; tàn khí hết tuổi độc lập với frame cuối của thân.

Chỉ neutral01 theo hash đã được duyệt. Tám hướng/action mới, VFX, socket và nhịp solo còn chờ owner xem; kiểm kỹ thuật không mở rộng approval đó. Lang Khiếu/gọi đàn làm sau. Gói này chưa nối AI, server, sát thương, loot, catalog phát hành, map owner, DB hoặc bản nháp trình duyệt.

## Lệnh kiểm scoped

Chạy từ workspace, dùng Python có Pillow. Các pack chỉ ghi gói mới này; không gọi owner map builder. [Biên bản kiểm13/10](../../../data/cloud-wolf-king-animation-2026-10-13.json) đã qua: body384 và FX30 tái dựng đúng pixel nguồn/atlas, 11unit, browser384pose/72ca, typecheck398file/23module. 17source body/102neutral và4sourceFX có gutter sạch; 323player, neutral Lang cũ và3171file quái giữ hash. Kết quả này không duyệt motion/VFX hoặc balance.

```powershell
node scripts/analyze-cloud-wolf-king-v1.mjs
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/pack-cloud-wolf-king-v1.py
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/pack-cloud-wolf-fx-v1.py
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/verify-cloud-wolf-king-v1.py
node --import tsx --test tests/unit/cloud-wolf-king-fixture.test.mjs
node --import tsx tests/smoke/cloud-wolf-king-animation-smoke.mjs
npm.cmd run typecheck
```

Smoke dùng Vite fixture riêng, không backend/DB. Cache decoded16MiB là giới hạn của review, chưa là benchmark GPU hoặc tải MMO. Xem source, dải pose và chuyển action tại1× trước khi chốt hình; giữ Player323file, quái và nền map theo hash hiện hành.
