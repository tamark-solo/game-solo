# Bộ Kết Đan · 1.0.0

P4 đã sản xuất **Kiếm Luân, Lôi Hạch, Phong Luân** theo chủ đề pháp lực có lõi. Bộ Trúc Cơ đã được chủ dự án chấp nhận; bộ Kết Đan cũng đã được chấp nhận, được ghi duyệt trong pack 1.0.1. Các tên và hình thái chiêu là thiết kế game, không khẳng định thuật pháp nguyên tác.

| Skill | PNG / atlas | Frame FX mới | Dùng lại |
| --- | --- | --- | --- |
| Kiếm Luân · R03-SWORD | 50 / 6 | wheel 8 + flight 6 | pose 12, charge 6, guide 6, impact 12 |
| Lôi Hạch · R03-THUNDER | 40 / 5 | core 8 + pressure impact 8 | pose 12, seal 6, bolt 6 |
| Phong Luân · R03-WIND | 40 / 4 | wheel 8 + compressed trail 8 | pose 12, return curl 12 |
| Tổng R03 | **130 / 15** | **46** | **84 PNG nguyên byte từ R02** |

Vòng kiếm được chọn có năm kiếm đọc rõ ở đỉnh; prompt ban đầu đề xuất sáu, bản xuất và hợp đồng thị giác ghi năm theo artwork thực tế. Số kiếm trang trí không quyết định số hit. Chất lượng hình tăng qua lõi/đội hình và nhịp nén–xả; thân Vương Lâm giữ tối đa khoảng 80 world px. Pose hướng đông và các nguồn R02 phù hợp được dùng lại, chỉ điều chỉnh hold trong metadata R03.

## Xem / lấy bộ nguồn

[Thư viện hiện hành 15 skill](skill-library.html) · [Preview Kết Đan](ket-dan-kit.html?family=sword) · [ZIP chung R01 → R03](releases/ket-dan-kit-1.0.0.zip).

ZIP chung chứa đủ nguồn và các trang preview của ba cảnh giới, tổng **376 PNG / 43 atlas**, có nội dung dùng lại giữa phiên bản. Giải nén, chạy `python serve-preview.py` trong thư mục bộ, mở `http://127.0.0.1:4185/skill-library.html`. Dừng server cũ trước nếu cổng 4185 đang được dùng. ZIP không chứa chính các file ZIP release; tải từng gói ở thư viện workspace gốc.

Mỗi skill có ZIP độc lập, source/prompt, PNG/atlas, metadata, helper và manifest SHA-256. ZIP riêng không có preview web. Ba pack Trúc Cơ được xuất bản **1.0.1 để ghi duyệt**, giữ nguồn ART 1.0.0 nguyên byte; pack/ZIP 1.0.0 lịch sử không bị ghi đè. Trạng thái duyệt chính thức nằm ở `library.json`, `PACK-MANIFEST.json` và `releases/truc-co-approval-1.0.1.json`, độc lập metadata nguồn đã khóa.

## Nhịp và cỡ game

24 FPS, frame event từ 1. World 960×640, orthographic; zoom 1× = một world px trên một CSS px. Viewport nhỏ cắt vùng nhìn. Character nearest, FX linear, alpha blend thông thường; DPR tối đa 2; atlas padding 2 px mỗi cạnh, không mipmap. Canvas có padding tay/tóc, thân và collision không phóng theo cảnh giới.

| Skill | Nhịp tác giả | Tín hiệu host |
| --- | --- | --- |
| Kiếm Luân | F3 dựng vòng, F9 khép, F13 release, F17 hồi, F24 hết pose | vị trí/hướng mũi projectile; contact/expire và hit thật |
| Lôi Hạch | F4 dựng trận, F9 nén hạch, F13 release, F17 hồi, F21 hết pose | chân mục tiêu và vị trí hit; bolt dẫn hai tick rồi pressure impact |
| Phong Luân | F5 tổ chức vòng, F8 ép gọn, F10 yêu cầu lướt, F16 hồi, F21 hết pose | actor snapshot và movement.arrived tại điểm chân thật |

F17/F19 hit trong preview là mô phỏng tùy khoảng cách/trễ, không phải thời điểm damage cố định. Impact theo `combat.hitConfirmed`; lôi không trì hoãn damage để chờ phần hình. Flight kiếm được đăng ký neo tại mũi dẫn, điểm bắt đầu nối cạnh phải formation để tránh giật lùi. Hụt chỉ tan tại cuối đường bay. Return curl tại điểm đáp không kéo nhân vật trở lại. Quái/boss trong preview là vùng chạm thử, chưa phải sprite quái/boss mới.

| Clip mới | Canvas | Anchor | Vùng ảnh cực đại xấp xỉ |
| --- | --- | --- | --- |
| sword-wheel | 192×160 | 96,80 · lõi | 127×115 |
| sword-flight | 208×144 | 174,72 · mũi | 156×73 |
| thunder-core | 176×128 | 88,72 · tâm trận | 132×111 |
| thunder-impact | 160×160 | 80,80 · điểm chạm | 104×85 |
| wind-wheel | 160×112 | 80,56 · chân xuất phát | 108×53 |
| wind-trail | 240×144 | 192,80 · điểm dẫn | 164×91 |

Đây là cỡ trang trí, không phải range hoặc hitbox. Trận/luân và damage volume có dữ liệu riêng. Kết thúc thunder-impact và wind-wheel có `clip.opacities` theo frame để thu sáng gọn; renderer nhân opacity của lớp với giá trị này, không sửa PNG. Các frame khác mặc định 1. Preview và renderer review R03 đã hỗ trợ trường này.

## Pipeline cho ART / programmer

Imagegen tích hợp tạo sáu sheet mới. `source/` giữ sheet nguyên gốc, `prompts/` giữ prompt chính xác và bản sao prompt nguồn dùng lại. `frames/<clip>/001.png` là nguồn frame chuẩn; atlas là build output. `export-spec.json` ghi crop/grid, cỡ, scale và neo từng frame. `provenance.json` và `production/r03-art-selection.json` ghi nguồn đã chọn. Node/Sharp chỉ crop, đăng ký neo, resize đồng nhất mỗi clip và pack.

Initial extraction vào phiên bản mới: `export-sequences.mjs` ba R03 → `build-r03.mjs` dùng lại R02 và đặt hold/opacity → `pack-atlases.mjs` ba R03. Không chạy extraction/merge lên PNG đã chỉnh. Build thường xuyên chỉ pack; Sharp cần cho build, trình xem browser không cần thư viện này.

```powershell
# Từ root repository
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r03-sword-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r03-thunder-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r03-wind-v1
node --test docs/design/vfx/production/r03.test.mjs docs/design/vfx/production/r02.test.mjs docs/design/vfx/production/p2.test.mjs docs/design/vfx/frame-by-frame-r01/sequence-system.test.mjs
```

Tái dùng adapter trình bày `production/r02-controller.mjs` và model preview cùng tên với metadata R03. Host gọi beginCast, setActorFoot/setProjectilePose, confirmHit/expireProjectile hoặc confirmArrival, update và endCast/dispose. Renderer lấy clip/frame/point/angle/layer từ draw record và nhân `sample.clip.opacities?.[sample.index] ?? 1`. Helper không cấp damage, di chuyển, miễn nhiễm, camera hay hit-stop. Chưa nối client/server; pose/formation mới hướng đông, chưa có bộ hướng đầy đủ, SFX, icon, LOD đám đông hoặc benchmark runtime.

## Kiểm và tiến độ

38 kiểm tra đã qua: 31 kiểm cũ cùng bảy kiểm R03. Kiểm mới xác minh 130 PNG, 84 file dùng lại nguyên byte, toàn bộ payload pack R02 1.0.0 giữ nguyên, hold/end, frame event bỏ qua render tick, nối mũi kiếm từ formation sang flight, hit/arrival host và tắt transient FX cuối preview. Có 30 ảnh kiểm R03 từ atlas tại zoom 1×/2× và ba bảng R02/R03. Đây là render cục bộ; tương tác browser mới chưa được xác minh.

P5 đã hoàn thành ART: **Nguyên Anh 156 PNG / 19 atlas** và **Hóa Thần 114 PNG / 14 atlas**, cả hai đã chấp nhận. Thư viện hiện hành 15 skill/646 PNG / 76 atlas đã [đóng bàn giao](STARTER-VFX-HANDOFF.md) ngày 07/10; chưa tích hợp gameplay. [Nguyên Anh](NGUYEN-ANH-KIT.md) · [Hóa Thần](HOA-THAN-KIT.md).

Ba gói R03 1.0.1 ghi duyệt, source và ZIP 1.0.0 giữ nguyên. [Hồ sơ duyệt](releases/ket-dan-approval-1.0.1.json). ZIP chung R01 → R03 1.0.0 là snapshot lịch sử, trạng thái mới ở library/pack 1.0.1.
