# Quy tắc chữ và vùng đọc của game

Ngày 10/10/2026, sau phản hồi chữ trong tab nhiệm vụ bị tràn và khó đọc. Nguồn dùng chung: `client/src/ui-reading.css`, nạp sau lớp mỹ thuật trong H5. Không thay artwork, mask khung, geometry của hotbar hoặc dữ liệu gameplay.

## Hợp đồng để dùng cho màn tiếp theo

| Vai trò | Quy tắc |
| --- | --- |
| Nội dung | `ui-reading`: Segoe UI 15 px, giãn dòng 1,7; tối đa 60ch cho đoạn văn. Không giảm chữ khi cửa sổ hẹp |
| Tiêu đề thẻ | `quest-card-title`: Cambria 20 px, mobile 18 px; xuống dòng đầy đủ, không dấu ba chấm |
| Chữ phụ / tiêu đề nhóm | 12 px; giãn dòng ít nhất 1,5; không dùng màu phụ để trình bày hướng dẫn chính |
| Cột chữ trong flex/grid | `ui-text-stack`: min-width 0, word-break normal, overflow-wrap anywhere; từ tiếng Việt xuống ở khoảng trắng trước, chuỗi không có khoảng trắng vẫn nằm trong cột |
| Nhóm nội dung | `ui-copy-section` + `ui-section-title`: nhãn nhóm, nội dung, khoảng cách 20 px giữa nhóm; đoạn trong nhóm dùng chiều cao tự nhiên |
| Điều kiện | Marker có cột riêng, nội dung có cột minmax(0,1fr), khoảng cách dòng mục tiêu 10 px; các dòng tiếp theo thẳng với nội dung, không thẳng với marker |
| Nút dài | Chiều cao tự nhiên, có padding, xuống dòng; thao tác chạm ít nhất 44 px |
| Vùng đọc dài | Cuộn dọc trong `.vn-frame-scroll`; tiêu đề và nút đóng sticky; không cho khung/nền cuộn theo nội dung |
| Lề mỹ thuật | Tính từ `--vn-frame-size` và `--vn-frame-border`, dành khoảng an toàn giữa chữ và viền; không dùng ảnh nền để định vị chữ |

Biến `--ui-text-body`, `--ui-text-small`, `--ui-text-title`, `--ui-leading`, `--ui-space`, `--ui-copy-measure` là điểm chỉnh chung. Màn mới dùng lớp trên và điều chỉnh token theo vai trò; không đặt height cho đoạn văn, dùng nowrap, cắt dòng hoặc thu nhỏ toàn bộ cửa sổ để vừa chữ. Giữ chữ trong DOM để chọn/copy, đọc bằng trình đọc màn hình và bản địa hóa.

Ví dụ nhóm đọc (phần thưởng/điều kiện vẫn lấy từ snapshot hiện hành):

```html
<div class="ui-reading">
  <section class="ui-copy-section">
    <h4 class="ui-section-title">Bước tiếp theo</h4>
    <p>Nội dung nhiệm vụ do game cung cấp.</p>
  </section>
</div>
```

## Các màn đã áp dụng

Sổ nhiệm vụ có bốn nhóm: Lời dẫn, Mục tiêu, Bước tiếp theo, Phần thưởng. Phần thưởng đã nhận đổi nhãn theo trạng thái completed thực tế. Header của thẻ có ba cột mã bài / tiêu đề và trạng thái / dấu mở, tiêu đề dài không đẩy dấu mở ra khỏi thẻ. Checklist trong sổ giữ đủ điều kiện, kể cả bài đã hoàn thành hoặc đang khóa; tracker chỉ giữ các điều kiện còn thiếu như trước.

Sổ chuyển sang một cột ở chiều rộng tối đa 980 px để dành chỗ đọc; bản đồ xuống dưới. Hội thoại NPC, nhóm thiết lập và hành động dùng chung quy tắc chữ. Tracker đưa tên bài lên trước trạng thái, vùng nội dung cuộn độc lập với nút. Màn ngang thấp dùng hàng nút NPC / E / Sổ; tên thật và nhãn truy cập giữ trong DOM. Không sao chép cả bước tiếp theo vào phần mở đầu của sổ vì bước này đã có nhóm riêng trong bài.

## Kiểm chứng

`npm.cmd run test:hang-nhac-ui` dùng database và trình duyệt fixture riêng. Ngoài hồi quy profile/NPC/accordion/chỉ đường/motion/sáu viewport, kiểm tất cả năm bài ở 18 bố cục: 320, 390, 760, 980, 1024 và 1366 px; token chữ đọc 100%, 150%, 200%. Thêm tiêu đề tiếng Việt dài và chuỗi không có khoảng trắng, đo scrollWidth và từng dòng chữ so với cột đọc, kiểm nút đóng khi cuộn xuống cuối và nền/viền vẫn cùng box. Đây là kiểm tăng cỡ chữ nội dung bằng token, không phải chứng nhận mọi tổ hợp browser zoom hoặc mọi bản dịch trong tương lai.

`npm.cmd run test:hang-nhac-ui-resize` kiểm riêng 28 cấu hình mask khung bằng pixel. Kết quả trong `docs/data/hang-nhac-ui-reading-verification.json`. Màn mới vẫn cần được xem và kiểm bằng nội dung thực tế; các quy tắc không tự giải quyết đoạn viết quá dài hoặc thiếu cấu trúc.
