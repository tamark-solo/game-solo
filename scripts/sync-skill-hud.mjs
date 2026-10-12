import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(root, 'client/public/assets/skill-hud');
await mkdir(target, { recursive: true });
await copyFile(resolve(root, 'docs/design/ui/desktop-skill-hud-v2/skill-icons-v2.webp'), resolve(target, 'skill-icons-v2.webp'));
await copyFile(resolve(root, 'docs/design/ui/desktop-skill-hud-v3/cultivation-frame-v3.webp'), resolve(target, 'cultivation-frame-v3.webp'));
await copyFile(resolve(root, 'docs/design/ui/desktop-skill-hud-v3/qi-v2/orb-textures-v2.webp'), resolve(target, 'orb-textures-v2.webp'));
const companion = resolve(root, 'client/public/assets/van-ngoc-ui');
await mkdir(companion, { recursive: true });
await copyFile(resolve(root, 'docs/design/ui/van-ngoc-kit-v1/lotus-crest-v1.webp'), resolve(companion, 'lotus-crest-v1.webp'));
for (const file of ['window-frame-v2.webp', 'jade-button-v2.webp', 'silk-paper-v2.webp']) {
  await copyFile(resolve(root, 'docs/design/ui/van-ngoc-kit-v2', file), resolve(companion, file));
}
for (const part of ['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br']) {
  const file = `frame-aperture-${part}.svg`;
  await copyFile(resolve(root, 'docs/design/ui/van-ngoc-kit-v2', file), resolve(companion, file));
}
console.log('Đã chuẩn bị icon, khung Vân Ngọc và texture ngọc cầu cho bản HUD desktop.');
