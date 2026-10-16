# Kế hoạch rebuild sau cleanup · 16/10/2026

## Phạm vi còn giữ

- GDD 0.35 ngày 15/10/2026 và hợp đồng thống nhất.
- Phát triển nguyên liệu, crafting và kế hoạch asset nguyên liệu.
- Thư viện asset nhân vật.
- Thư viện VFX.
- Skill/animation production skill và asset skill.

## Thứ tự xây dựng lại

1. **Canonical identity:** khóa Huyễn Tâm `a` và Tịch Bạch `b` theo concept GDD 15/10; ghi source, native, hash, scale, pivot và hướng.
2. **Character neutral:** kiểm lại neutral trước, sau đó mới mở view/action; mỗi identity giữ source riêng.
3. **Character motion:** dựng animation body theo tám hướng; gear và FX tách khỏi body.
4. **VFX/skill:** kiểm từng effect/skill độc lập, giữ timing là dữ liệu trình bày cho tới khi gameplay được xây lại.
5. **Materials:** lập item → source → recipe → destination theo GDD 0.35; không nối vào runtime cũ.
6. **Runtime mới:** chỉ bắt đầu sau khi character/VFX/skill/material manifest đã ổn định; xây loader và registry mới từ đầu.

## Quy tắc vòng mới

- Không dùng lại runtime, map, DB, save, UI hoặc test đã dọn.
- Không lấy archive cũ làm fallback mặc định.
- Không suy ra approval từ hash/QA; mỗi gate có hồ sơ riêng.
- Mọi asset mới phải có source, prompt/input, hash, native preview và manifest.
- Chỉ giữ một canonical entry cho mỗi identity; bản thử ghi history riêng trong cùng package.
