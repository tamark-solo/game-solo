# Vương Lâm · pháp bảo theo Tiên Nghịch02

**13/10/2026:** sau khi nhận xét bộ kiếm/thương/quạt/hồ lô v1 còn nhạt, owner yêu cầu pháp bảo có dấu ấn trong Tiên Nghịch và thêm reference game tu tiên. Gói v2 đề xuất bốn hướng: **tiên kiếm có kiếm linh Hứa Lập Quốc, Thập Ức Tôn Hồn Phiên, Thiên Nghịch Châu và Xạ Thần Xa**. Đây là artwork chuyển thể mới từ chi tiết truyện đã đọc; chưa phải phục dựng tạo hình donghua hoặc hình đã được owner duyệt.

- [Review](index.html): bốn narrative card có source lớn và composite native1× luôn nhìn thấy; pair mặc định2×/tùy chọn1×/4×, nền sáng/tối/xám, body/artifact/FX/root/canvas controls. Bốn bake trên crop nền600×400 hiển thị native1×, chỉ để so art/scale, chưa kiểm occlusion/collision.
- [Nguồn truyện & reference](canon-study.md): chương/link đã xác minh, tên gốc, phần chưa xác minh, phân biệt form và cách học từ thị trường/source cục bộ.
- [Hướng thiết kế](design-directions.md): bốn loại hiển thị/motion, sáu họ thời trang và ma trận phối hợp. Áo là ý tưởng mới, chưa tạo ART.
- [Manifest](manifest.json) / [registration](registration.json): source/prompt/hash, alpha/crop/nearest scale và đăng ký rear/front.
- [Generation](generation.json): ImageGen built-in, prompt lưu trong `sources/`, đường dẫn nguồn và kích thước thực; source có thể khác kích thước request. Gói này không dùng router trả phí cục bộ.
- [V1](../wang-lin-equipment-study-v1/index.html): giữ đọc được như thử nghiệm kỹ thuật/reference; hình v1 không được owner chọn.

## Một thân live, bốn silhouette pháp bảo

`inputs/wang-lin-live-southeast-native.png` là frame thật Vương Lâm Pixel02 đang dùng trong game:64×96/chân(32,88), giữ nguyên byte. Các composite v2 dùng lại ảnh này, không tái vẽ đầu/mặt/tóc/áo, resize người hoặc tạo armor mới. Canvas pháp bảo256×224/neo(96,200), body đặt tại offset(64,112), nên chân gốc trùng world foot(96,200). Canvas lớn chỉ thêm padding và chỗ cho trang bị.

Ghép **FX tĩnh riêng → rear artifact → body live → front artifact**. Source có panel trái là pháp bảo, panel phải là concept FX; artifact và FX được trích riêng, native FX chỉ là hình tĩnh. Body-only cần tắt cả artifact và FX. Layer đăng ký cho neutral Đông Nam; nó không chứng minh grip/action theo các frame còn thiếu. Xạ Thần Xa nằm cạnh người như form triển khai scene; bản preview thu nhỏ/chuyển thể chưa chốt kích thước triển khai, root riêng, footprint/collider hoặc interaction. Tôn Hồn Phiên trong truyện là món lớn; form native ở đây là cách hiển thị cô đọng cho game, không áp kích thước canon vào map.

Raw giữ nguyên byte. Châu aura/thú linh trong source có fringe màu; cleanup alpha/spill kỹ thuật được ghi ở registration. Cần đọc alpha khi bật/tắt FX trên nền sáng/tối/xám; không dùng cleanup để suy đã có motion hoặc ART approval.

## Canon và thiết kế mới

- **Kiếm:** khí đen/Hứa Lập Quốc từ kiếm có căn cứ chương365/399. Kim loại, guard, màu và hoa văn chưa được các đoạn đọc chốt; hình hiện tại là thiết kế mới. Sheet pháp bảo + FX có panel riêng; concept khí/kiếm linh tĩnh chưa là production motion/FX.
- **Phiên:** tên gốc `十亿尊魂幡` là Thập Ức Tôn Hồn Phiên; chương397/538 mô tả khí đen/hồn/cờ lớn. Đầu cán, viền, rách vải, dấu và tỉ lệ preview là chuyển thể.
- **Châu:** chọn hình ban đầu ở chương8—đá xám cũ, năm mây khắc. Năm mây không là form vĩnh viễn mọi giai đoạn; ch23 có thay đổi. Quỹ đạo/vòng/ánh sáng hoạt hóa là đề xuất riêng, chưa có motion hoặc nội giới.
- **Xa:** tên gốc `射神车` là Xạ Thần Xa; Wuxiaworld dịch God Slaying War Chariot. Xích/thú linh, lôi thú và chiếc thứ ba gai/cổ dữ là các dạng/mốc khác nhau. Một hình tổng hợp các dấu ấn ấy là ý tưởng mới, không chính xác một chiếc canon cố định. Khung, số bánh, vật liệu và màu chưa chốt từ nguồn.

Nguồn cụ thể và giới hạn đọc nằm trong [canon-study](canon-study.md). Mọi wardrobe trong review là brief riêng cho game; không gọi là y phục canon hoặc quyền trang bị đã mở.

## Phạm vi bàn giao và bước tiếp theo

Hiện có bốn artwork pháp bảo và concept FX tĩnh tách riêng, một neutral Đông Nam trên body live; chưa bảy hướng, animation/action/FX motion, wardrobe sprite, gameplay trang bị, quyền sở hữu/save hoặc runtime. Không dùng CSS xoay/nảy để giả motion. Preview HTML/Canvas chỉ đọc file; không backend, storage hoặc command game. Ảnh reference thị trường là remote thuộc chủ sở hữu gốc, kèm bài nguồn; chưa copy thành asset game.

1. Chốt neutral theo hash ở1×: silhouette, alpha, tỉ lệ hiển thị, grip/occlusion và phần actor/scene. Hình tĩnh còn chờ owner review.
2. Dựng bảy view thật với Vương Lâm đúng hướng; giữ scale, đăng ký grip/tip/rear/front theo view. Scene artifact có root/footprint riêng; không mirror để tuyên bố đủ bộ.
3. Sản xuất bốn brief motion khác nhau: cầm/chém/kiếm linh; nắm/phất/triển khai cờ; kết ấn/châu/nội quang; triệu/điều khiển/thu chiến xa. Body, thiết bị, vải, xích, thú linh và FX có clock/timeline/socket rõ.
4. Kiểm native/map1×, đổi hướng/action/món, body-only, mái/tán, lifecycle/cancel/reload bằng fixture; ART/motion approval tách kiểm kỹ thuật. Sau đó mới nối entitlement/equipment/Core theo scope owner chọn.

Giữ nguyên atlas/runtime người, map owner/9blocker/navigation, station/receipt, DB/save và thông số chiến đấu. Không suy `ownerApproved`/`artApproved` từ source generation, alpha, canvas hoặc trang nạp được.

[Verification](review/verification.json) / [scoped verifier](verify.mjs): đã kiểm body khớp RGBA atlas live, 12 layer, 36 tổ hợp bốn món × ba mức zoom × ba nền, toggle body/trang bị/FX, desktop1440px và mobile390px. Không lỗi JavaScript hoặc tài nguyên local; trang mobile rộng390px, canvas cuộn trong vùng riêng. Bốn ảnh map đọc crop nền Vân Ngọc đã pin hash tại camera1×. Kiểm này áp cho art tĩnh; animation, gameplay và collision/occlusion vẫn cần production review riêng.
