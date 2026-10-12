# Vân Ngọc 05 · UI người chơi

13/10/2026 · Thiết kế lại theo phản hồi về ảnh HUD Hằng Nhạc: khung quá nặng, icon chung chung, nhiệm vụ che map và các màn thiếu cùng một ngôn ngữ mỹ thuật.

## Tham khảo và cách sử dụng

Nguồn chính thức bên dưới là hướng dẫn lịch sử; dùng để học tổ chức thông tin, không coi là ảnh client năm 2026 và không sao chép artwork.

| Nguồn | Ý tưởng áp dụng |
| --- | --- |
| [Tru Tiên PC · giao diện, 18/09/2009](https://zhuxian.wanmei.com/infostation/xszn/xssl/20090918/25103.shtml) | Hồ sơ trên trái, minimap trên phải, thông tin dưới trái, chức năng dưới phải. Dành trung tâm cho thế giới và nhân vật. |
| [Tru Tiên mobile · giao diện, 22/07/2016](https://zx.wanmei.com/info/20160722/184617.shtml) | Nhiệm vụ có thể thu gọn, mục tiêu tách riêng, chức năng mở theo tiến trình. |
| [Tru Tiên mobile · vùng chức năng, 28/07/2016](https://zx.wanmei.com/startegy/rm_slg/20160728/185034.shtml) | Phân tầng thao tác thường dùng, bản đồ, nhật ký và hệ thống đầy đủ. |

Hướng mỹ thuật tự thiết kế: **ngọc xanh, đồng ấm, giấy cổ**, dựa trên map Vân Ngọc chuẩn ART và khung kỹ năng hiện hành. SVG gốc mô tả đạo bào, ngọc phù, lư luyện chế, thư quyển, đèn lồng, cặp kiếm và cổng tông môn; không dùng bitmap icon cũ đã dọn.

## Bố cục và thao tác

- Hồ sơ: huy hiệu chân dung và nameplate trong suốt, tên/cảnh giới/tu vi từ snapshot. Nút hồ sơ, tu luyện và đổi nhân vật vẫn có lối vào.
- Mục tiêu: bỏ dòng “Chưa chọn mục tiêu” khỏi phần luôn hiển thị. Hai nút luyện và đánh thường giữ nguyên; mục tiêu đã chọn có tên và tài nguyên xác nhận.
- Minimap: vòng đồng mảnh, nhãn địa danh và các tiện ích gọn. Nút Đạo trình nằm cùng nhóm trên phải, không còn bảng nổi riêng ở trên trái.
- Nhiệm vụ: mặc định chỉ hiện điều kiện đang làm. Nút ⋯ hiện đủ bước tiếp theo, phần thưởng và chi tiết; Gọn/Mở thu phần đọc. Bấm tiêu đề hoặc phím Enter/Space mở sổ. Màn ngang thấp giữ mã bài và ba thao tác; ⋯ mở sổ đầy đủ để đọc. Gặp NPC, E và Sổ dùng callback thật; không tự đi hoặc nhận thưởng.
- Chức năng: dấu ngọc và biểu tượng đồng/ngọc, nhãn trên map, năm lối ghim và danh mục đầy đủ. Màn rộng đặt sát hai góc dưới; màn hẹp đưa lên trên thanh kỹ năng để tránh chồng lấn.
- Cửa sổ: tiêu đề mực ngọc, tab giấy, trang nội dung giấy ấm, đường phân cách đồng. Nhân vật, hành trang, NPC, nhiệm vụ, thiết lập, Đạo trình và luyện chế dùng chung chất liệu.
- Mobile: nút bấm tối thiểu 44 px, dãy chức năng riêng; nội dung nhiệm vụ cuộn, giữ phần thao tác và chừa trung tâm cho người chơi.

## Triển khai

`client/src/ui/dao-player-ux.css` giới hạn style dưới `#game-shell[data-dao-ux="05"]`. `dao-runtime-hud.ts` tiếp tục chiếu snapshot/callback, `dao-hud-glyph.ts` chứa SVG gốc, `quest-ui.ts` chỉ quản lý disclosure và mở sổ. [Đạo trình và Tư Vật Các](PLAYER-WORKSPACE-UI.md) giữ chọn mục, focus, cuộn, trạng thái chờ ACK và lối vào NPC/Hành trang.

Giữ khung kỹ năng native 760 × 140, ba thuật/bảy ô trống, mobile 48 px, nguồn sprite, map/nav/camera, dữ liệu hồ sơ và luật server. Tích hợp UI theo yêu cầu không tự ghi duyệt ART; đánh giá hình riêng với kiểm kỹ thuật.

## Kiểm chứng

Kết quả và ảnh fixture lưu trong `artifacts/hang-nhac-dao-ui/verification.json` và các thư mục chapter/character/HUD-layer/quests/reload. Bộ smoke HUD kiểm tài khoản fixture, disclosure, journal bàn phím, launcher Đạo trình, các màn thật, input modal, ghim/tìm, reload và bảy viewport: 1440×980, 1366×768, 1280×720, 980×780, 390×844, 320×740, 844×390. Dãy chức năng sát góc dưới chỉ áp dụng từ 1366 px, chừa cả khung cầu native. Ảnh đối chiếu cuối dùng nền chuẩn `mapArt=van-ngoc-detail`; ART không thay navigation hoặc scene release.

Biên bản tổng hợp đợt này: [player-ux-v5-verification.json](data/player-ux-v5-verification.json).
