# Tịch Bạch · Hồn phiên · tám hướng

Bộ body candidate mốcII có **64 clip / 382 key**, tám hướng thật × idle/run/hit/death/meditate/gather/ST/AOE. 24 nguồn chọn có532 hình thật;144 neutral calibration và382 motion key được đóng, sáu hình dư giữ ở raw. Năm nguồn sai camera/choreography/clipping nằm trong history, toàn29 call có prompt/input snapshots/hash/original built-in ImageGen. Không mirror, vá mặt Wang hoặc fit từng pose.

Own Banner P1 giữ nhận diện/phục trang PRIMARY: tóc bạc dài buộc cao, áo ngà–than–plum với ba tấm triện lớn. Wang cùng hướng chỉ hỗ trợ tỷ lệ/anatomy/nét pixel/camera. Form riêng thon và đầu nhỏ hơn Wang đã được chốt từ concept/P1; xem đối chiếu thật tám hướng tại [own/Wang2×](review/own-versus-Wang-8views-2x.png).

| Hướng | Clip | Motion key | Source chọn |
|---|---:|---:|---:|
| Bắc / Đông Bắc / Đông Nam / Nam / Tây / Tây Bắc | 8 mỗi hướng | 48 mỗi hướng | 3 mỗi hướng |
| Đông / Tây Nam | 8 mỗi hướng | 47 mỗi hướng | 3 mỗi hướng |
| Tổng | 64 | 382 | 24 |

Một factor nguồn =80/median tóc→đế giày thật của sáu neutral; tất cả pose nguồn dùng cùng factor. Canvas112×112/pivot56,104 và death192×128/pivot96,112 chỉ là padding. Riêng deathTây mở224×128/pivot112,112 sau khi terminal hair chạm mép192; source/root/factor nguyên. Lift0 là fixture/support projection, không chứng minh floor/bone chính xác. N/NE/E/SE prone root có uncertainty5px; tay bị che/cuff ước lượng được ghi rõ và không claim cầm.

Nguồn Tây Bắc damage trả22 hình: rowColumns4,4,4,4,3,3. Sáu cal0..5, hit8/9/10/11/14/15, death16..21; extra6/7/12/13 không giả thành action. RunĐông/TâyNam bỏ standingterminal, còn năm stride thật. GatherNE vàSW đổi thứ tự các hình thật để tránh đứng rồi lại quỳ; không clone recovery. [Assessment](assessment.json) ghi mapping, camera repair và giới hạn gesture.

Idle/run giữ một fist thật ở trước ngực để ghép pole rời. Cast trồng pole xuống đất từ chargekey2, tay rảnh kết ấn/command; SWready đã clasp thì planted ngaykey1. Một SWrun palm mở dùng commanded/grounded. **36 socket cal/hit E/SE** đã sửa từ free hand thấp sang fist cao đúng arm của core, với [source proof](review/front-arm-role-corrections.json); nguồn và hồ sơ helper giữ byte. Source wrist axes tương đối own neutral, cuff bị che có angle basis ước lượng minh bạch.

Đã xem24 full native contact1×, selected contact2×, toàn8view đầu–hồi2× và từng palm/cuff nguồn qua evidence riêng/pinned helper. Full marked contact giữ canvas/pivot thật; hai [form grid core](review/core-first-recovery-8views-2x.png) và [foundation](review/foundation-first-recovery-8views-2x.png) chỉ crop padding để so anatomy ở nearest2×. 526 canonical+cal có0 opaque magenta/cyan/red suspect pixels theo phép đo; RGB fringe mềm trong raw vẫn giữ.

`python pack.py` chỉ ghi root BannerB này; `python verify.py` kiểm64 coverage, raw/prompt/input/original hash, source reconstruction, onefactor, pivot/socket inverse, exact atlasRGBA/gutter2, holds và600/900ms ART release fixture. Scoped **7.564 checks/526 frames qua** tại [verification](review/verification.json). Root ghép gear/FX và kiểm browser/Three riêng; kiểm kỹ thuật chưa duyệt ART/motion/runtime/balance. Không sửa Sword đã khóa, actor live, map, DB, receipt hoặc owner draft.
