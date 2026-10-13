import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const folder = dirname(fileURLToPath(import.meta.url));
const circle = (radius, denominator = 128) => ({ type: 'circle', center: [0.5, 0.5], radius: radius / denominator });
const definitions = [
  { id: 'warning-circle', size: [128, 128], usage: 'world-telegraph', geometry: circle(52), visualBounds: [5 / 128, 5 / 128, 123 / 128, 123 / 128], encoding: ['continuous-double-border', 'diagonal-hatch', 'warning-triangle'] },
  { id: 'warning-lane', size: [192, 64], usage: 'world-telegraph', geometry: { type: 'rectangle', min: [10 / 192, 10 / 64], max: [182 / 192, 54 / 64], direction: [1, 0] }, visualBounds: [6 / 192, 6 / 64, 186 / 192, 58 / 64], encoding: ['continuous-double-border', 'diagonal-hatch', 'directional-chevrons'] },
  { id: 'safe-waypoint', size: [128, 128], usage: 'world-waypoint', geometry: circle(48), visualBounds: [11.5 / 128, 11.5 / 128, 116.5 / 128, 116.5 / 128], encoding: ['dashed-ring', 'footprints', 'upward-chevron'] },
  { id: 'sample-status-intact', size: [128, 128], usage: 'status-badge', geometry: circle(52), visualBounds: [9.5 / 128, 9.5 / 128, 118.5 / 128, 118.5 / 128], encoding: ['round-badge', 'solid-crystal', 'check-mark'] },
  { id: 'sample-status-depleted', size: [128, 128], usage: 'status-badge', geometry: { type: 'polygon', vertices: [[43, 12], [85, 12], [116, 43], [116, 85], [85, 116], [43, 116], [12, 85], [12, 43]].map(point => point.map(value => value / 128)) }, visualBounds: [9.5 / 128, 9.5 / 128, 118.5 / 128, 118.5 / 128], encoding: ['octagonal-badge', 'hollow-cracked-crystal', 'minus-mark'] },
];
const assets = [];
for (const definition of definitions) {
  const { size, ...fields } = definition, file = definition.id + '.svg', source = await readFile(resolve(folder, file));
  assets.push({ ...fields, file, mimeType: 'image/svg+xml', viewBox: [0, 0, ...size], displaySize: size, registration: { point: [0.5, 0.5], unit: 'normalized', meaning: 'authored-art-center-not-object-foot' }, geometrySpace: 'normalized-art-coordinates-not-gameplay-collision', bytes: source.length, sha256: createHash('sha256').update(source).digest('hex') });
}
const manifest = {
  id: 'hang-nhac-onboarding-telegraphs-v1', version: 1, createdOn: '2026-10-13', source: 'code-native-svg',
  status: 'candidate-awaiting-owner-review', ownerApproved: false, artApproved: false, runtimeImported: false,
  coordinateConvention: { origin: 'top-left', x: 'right', y: 'down', worldProjection: 'top-down', geometry: 'main-art-border-centerline', visualBounds: 'conservative-art-bounds-including-outline' },
  gameplay: { authoritative: false, timings: null, radius: null, collision: null, damage: null, requirement: 'Adapter must map server-owned shape and state; SVG dimensions do not define gameplay.' },
  palette: { petrol: '#173f42', darkOutline: '#153b3e', ivory: '#f5edda', celadon: '#b6d6b7', amber: '#eeb865' },
  nativeReference: { playerCanvas: [64, 96], playerFoot: [32, 88], cameraScale: 1, note: 'Reference contract only. No actor artwork is embedded, resized or approved by this pack.' },
  assets, preview: 'preview.html', verification: 'verification.json',
};
await writeFile(resolve(folder, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote manifest for ${assets.length} SVG assets.`);
