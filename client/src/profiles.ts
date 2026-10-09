import type { PublicProfile, AvatarId } from '../../shared/profiles';

const KEY = 'hang-nhac.guest.v1';
const ACTIVE = 'hang-nhac.active.v1';
export class ProfileSession {
  token = localStorage.getItem(KEY) ?? '';
  profiles: PublicProfile[] = [];
  constructor(private endpoint: string) {}
  async open(): Promise<void> {
    const response = await fetch(`${this.endpoint}/api/profile-session`, { method: 'POST', headers: this.token ? { Authorization: `Bearer ${this.token}` } : {} });
    if (!response.ok) throw new Error(response.status === 401 ? 'Không đọc được hồ sơ đã lưu. Giữ lại dữ liệu trình duyệt và kiểm tra server.' : 'Chưa mở được hồ sơ. Kiểm tra server.');
    const data = await response.json() as { token?: string; profiles: PublicProfile[] };
    if (data.token) { this.token = data.token; localStorage.setItem(KEY, this.token); }
    this.profiles = data.profiles;
  }
  async refresh(): Promise<void> {
    if (!this.token) return;
    const response = await fetch(`${this.endpoint}/api/profiles`, { headers: { Authorization: `Bearer ${this.token}` } });
    if (!response.ok) throw new Error('Chưa đọc được bản lưu mới nhất.');
    this.profiles = (await response.json()).profiles;
  }
  remember(avatarId: AvatarId, reconnectionToken: string): void {
    sessionStorage.setItem(ACTIVE, JSON.stringify({ avatarId, reconnectionToken }));
  }
  active(): { avatarId: AvatarId; reconnectionToken: string } | undefined {
    try { const value = JSON.parse(sessionStorage.getItem(ACTIVE) ?? 'null'); return value && this.token ? value : undefined; } catch { return; }
  }
  clearActive(): void { sessionStorage.removeItem(ACTIVE); }
}
