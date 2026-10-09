# Hóa Thần wind · 2.0.0

**Hồ sơ nguồn:** Snapshot nguồn r05-wind-v2 lúc sản xuất, giữ dữ liệu/frame nguyên trạng. R05 hiện dùng V3 đã chấp nhận, pack 3.0.1 ghi duyệt; trạng thái chờ bên dưới là ghi nhận lịch sử nguồn. Xem [trạng thái hiện hành](../HOA-THAN-KIT.md) và [bàn giao](../STARTER-VFX-HANDOFF.md).

V2 vẽ lại attack và impact, giữ nguyên PNG pose và nguồn tụ từ V1. Xem HOA-THAN-KIT.md trong gói chung. PNG rời là nguồn chính; atlas là output. Metadata: clips.json, skill.json, export-spec.json. 24 FPS, nhân vật hướng đông tối đa 80 world px. Host cung cấp hit/projectile/movement/arrival. Feedback camera/hit-stop chỉ là hình ảnh; không dừng clock combat.

ART chờ xem motion; chưa có tích hợp runtime, SFX hoặc đầy đủ hướng/LOD.
