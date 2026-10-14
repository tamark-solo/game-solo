# Nguồn hỗ trợ Hồn phiên — Huyễn Tâm và Tịch Bạch

Mười hai nguồn foundation được actor A/B và root giao riêng: A Bắc/Đông Bắc/Đông/Đông Nam và B Tây/Tây Bắc × hit–death và meditate–gather. Built-in ImageGen dùng ba input bất biến theo đúng thứ tự: neutral cùng nhân vật/cùng phục trang/cùng hướng làm PRIMARY, Vương Lâm cùng hướng chỉ anatomy/nét pixel, nguồn P1 riêng hoặc full core source cùng view cung cấp chi tiết áo. Không dùng outfit Kiếm linh.

Mỗi raw RGBA giữ nguyên byte từ output tool; prompt, snapshots, hash, original path, tool receipt và layout diagnostics nằm cùng gói. Mười hai nguồn thực đều 1024×1536. Mười một nguồn có18 hình; B Tây Bắc damage có22 hình thực (8neutral,8hit/recoil,6death): bốn hàng đầu dùng4 cột, hai hàng cuối3 cột. Tổng220 hình nhìn trên nguồn, chưa phải số key active sau actor review. Gói hỗ trợ không pack body, không ghi actor registration/socket/root, không lựa chọn thay worker.

Quan sát nguồn: Bắc giữ phần tóc/lưng là chính và edge tai bên phải giống own neutral. Đông hơi quarter-right giống own neutral, cần actor kiểm delta so với strict profile. Đông Nam front-right, Tây một mắt quay trái, Tây Bắc rear-left đúng hướng. Hit có hồi đứng; death có terminal nằm hoàn toàn. Practice có seated sáu pose; B Tây seated cuối nâng tay kiểm, vẫn ngồi. Gather Bắc bắt đầu cúi chạm đất rồi nhóm kneel/retrieve, kết thúc hồi đứng; actor có thể sắp lại entry/loop theo pose thực. Gather Tây Bắc ba key cuối đứng, cần chọn actual flow. Không nhân bản pose để ép số key hoặc mask giấu clipping.

`qa/*-alpha-light.png` chỉ composite alpha thật lên nền sáng phục vụ kiểm, không thay nguồn. Equal cell bands là chẩn đoán sơ bộ: cờ cạnh nominal xuất hiện do nguồn chia hàng không đều và alpha rìa, không phải đăng ký rect cuối hay chứng minh clipping. Riêng B Tây Bắc damage không dùng grid3×6 nominal để crop nguồn22 hình. Kiểm sourceRect/crown/boots và một scale thực thuộc actors A/B.

Nguồn đầu `banner-a-north-damage-r1` gửi cùng nội dung prompt nhưng trim trailing whitespace; metadata ghi khác biệt này. Ba lượt sau gửi toàn text nguyên. Không có retry API/router, không đổi runtime, bản Sword đã khóa hoặc map/DB.

Các nguồn mới vẫn candidate. Technical delivery chỉ pin hồ sơ nguồn, không ART/motion/runtime approval.
