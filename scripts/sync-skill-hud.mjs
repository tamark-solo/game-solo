import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(root, 'client/public/assets/skill-hud');
await mkdir(target, { recursive: true });
await copyFile(resolve(root, 'docs/design/ui/desktop-skill-hud-v2/skill-icons-v2.webp'), resolve(target, 'skill-icons-v2.webp'));
await copyFile(resolve(root, 'docs/design/ui/desktop-skill-hud-v3/cultivation-frame-v3.webp'), resolve(target, 'cultivation-frame-v3.webp'));
await copyFile(resolve(root, 'docs/design/ui/desktop-skill-hud-v3/qi-v2/orb-textures-v2.webp'), resolve(target, 'orb-textures-v2.webp'));
console.log('Đã chuẩn bị icon, khung Vân Ngọc và texture ngọc cầu cho bản HUD desktop.');
