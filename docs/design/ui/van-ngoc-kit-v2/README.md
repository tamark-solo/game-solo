# Vân Ngọc 02 — khung mỹ thuật, nút ngọc và giấy lụa

**Phản hồi sau sửa 10/10/2026:** owner xác nhận UI “nhìn ổn rồi”, rồi “tốt rồi” sau khi xử lý chữ nhiệm vụ. [Trạng thái UI hiện hành](../../../HANG-NHAC-VAN-NGOC-UI.md#trạng-thái-chốt-ngày-10102026) ghi phạm vi đã xử lý và kiểm chứng. Đoạn 09/10 và các trường approval trong manifest nguồn bên dưới giữ thông tin tại thời điểm sản xuất, không thay bằng kết quả test.

**09/10/2026.** Owner phản hồi bộ UI trước thô sơ, chưa đúng chất tu tiên và chỉ có một chi tiết từ HUD. Bản này thay phần trang trí của các màn hiện có bằng asset vẽ đầy đủ: khung bốn góc sen/mây/đồng/ngọc, mặt nút ngọc và giấy lụa có thủy mặc ở mép. Không coi phản hồi này là duyệt mỹ thuật cho bộ mới; `artApproved`/`ownerApproved` tiếp tục false.

## Nguồn và sản phẩm

| Asset | Nguồn / prompt | Runtime |
| --- | --- | --- |
| Khung cửa sổ | [PNG nguồn](window-frame-source-v2.png), [prompt](window-frame.prompt.txt) | [WebP](window-frame-v2.webp), 1024 × 1026, 252.898 byte, alpha |
| Mặt nút ngọc | [PNG nguồn](jade-button-source-v2.png), [prompt](jade-button.prompt.txt) | [WebP](jade-button-v2.webp), 900 × 189, 69.362 byte, alpha |
| Giấy lụa | [PNG nguồn](silk-paper-source-v2.png), [prompt](silk-paper.prompt.txt) | [WebP](silk-paper-v2.webp), 1024 × 1024, 135.290 byte |

Tổng WebP mới: **457.550 byte**. Built-in ImageGen sinh ba asset riêng. [HUD gốc](../desktop-skill-hud-v3/cultivation-frame-v3.webp) chỉ là tham chiếu chất liệu cho khung/nút, không là ảnh sửa đích. Giấy lụa là hình mới từ mô tả. PNG nguồn giữ nguyên; crop/export/hash và trạng thái trong [assets.json](assets.json).

## Hợp đồng trình bày

**Sửa lỗi nền lộ khỏi khung:** [aperture SVG/metadata](frame-aperture.json) được suy ra từ alpha của WebP này. Nền và viền dùng chung kích thước góc nine-slice; [bàn giao và test resize](../../../HANG-NHAC-UI-FRAME-RESIZE.md) ghi chi tiết. Đây là tài nguyên clipping code-native; ảnh nguồn và ART đã xuất không bị sửa.

- Khung dùng nine-slice **36%** để giữ các góc chạm, còn đoạn viền co giãn theo cửa sổ. Nút dùng **24% fill**, mặt ngọc nằm sau chữ thật. Không có chữ/số hoặc vùng bấm bake vào ảnh.
- Khung dialog là border-image trực tiếp để đứng yên khi nội dung cuộn. Khung trang trí của bảng nhỏ dùng pseudo-element `pointer-events:none`. Không dùng pointer của artwork làm hit target.
- Giấy lụa làm vùng đọc và màn chọn; phần thủy mặc ở mép, chữ mực trên vùng sáng. Các bảng phủ map giữ màu tối với viền chạm tương ứng.
- Không dùng crest 01 làm chi tiết trang trí duy nhất trên các cửa sổ. Nguồn 01 giữ làm lịch sử; HUD đã duyệt giữ nguyên.
- Các nút/slot của hotbar nằm ngoài bộ quy tắc companion. Desktop tiếp tục 760 × 140, ô 36 px; native sprite thế giới/camera không đổi.

Xuất lại: `node scripts/build-van-ngoc-ui-v2.mjs` (Sharp). Build thường chỉ copy WebP đã có qua `sync-skill-hud.mjs`.

Khung có các điểm alpha=1 rải rác ở vùng rỗng; script giữ nguồn và kiểm vùng giữa không có alpha lớn hơn 1. Crop nút lấy vùng alpha>1 kèm 8 px nguồn quanh mép để bỏ lề xa chỉ có nhiễu alpha=1. Không tô lại, mask, đổi màu, blur hoặc scale riêng nội dung nguồn. Downsample Lanczos3 đồng đều và WebP alpha 100; ảnh nguồn không bị sửa.

## Bản ghép

`client/src/van-ngoc-art.css` là lớp artwork 02 trên layout/hành vi đang dùng. Link trong HTML để trình bày có mặt trước JavaScript. Không đổi server, lệnh NPC, save/receipt, gameplay hoặc authored map.

Ảnh thử: [màn chơi](../../../../artifacts/van-ngoc-ui/playing-1366.png), [chọn nhân vật](../../../../artifacts/van-ngoc-ui/entry-desktop.png), [hội thoại](../../../../artifacts/van-ngoc-ui/npc-intro.png), [sổ nhiệm vụ](../../../../artifacts/van-ngoc-ui/journal-active.png), [menu](../../../../artifacts/van-ngoc-ui/settings-desktop.png), [mobile](../../../../artifacts/van-ngoc-ui/playing-390.png).

Test `test:hang-nhac-ui` đợi decode các background/border image và hai frame trước khi chụp, để ảnh QA không nhầm hình chưa tải xong thành lỗi mỹ thuật. Bằng chứng kiểm kỹ thuật vẫn tách khỏi owner duyệt hình.
