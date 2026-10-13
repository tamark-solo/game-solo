import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';

// Scoped technical extraction only: AI sources and the approved live body remain byte-exact.
const root = dirname(fileURLToPath(import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bodyFile = 'inputs/wang-lin-live-southeast-native.png';
const bodyBytes = await readFile(resolve(root, bodyFile));
const expectedBodyHash = '78d0fb7e2e159334e65707423d8da2e4608d75e0845dcd3db677a3d1d2a14431';
if (hash(bodyBytes) !== expectedBodyHash) throw new Error('Unexpected live-body source');
const liveAtlas = resolve(root, '../../../../client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png');
const bodyRaw = await sharp(bodyBytes).ensureAlpha().raw().toBuffer();
const liveRaw = await sharp(liveAtlas).extract({ left: 2, top: 2, width: 64, height: 96 }).ensureAlpha().raw().toBuffer();
if (!bodyRaw.equals(liveRaw)) throw new Error('Body RGBA differs from actual live atlas');

const canvas = [256, 224], pivot = [96, 200], bodyOffset = [64, 112], hand = [43, 64];
const specs = [
  { id: 'sword', name: 'Tiên kiếm · Hứa Lập Quốc', description: 'Tiên kiếm cổ sát tay và kiếm linh khí đen riêng; chất liệu đen–vàng là chuyển thể mới.', sourceSize: [1536, 1024], gearRegion: [0, 0, 900, 1024], fxRegion: [900, 0, 636, 1024], sourceGrip: [280, 824], target: { height: 65 }, placement: 'grip', fxTarget: { height: 30 }, fxTopLeft: [142, 136], occlusion: 'original-fist', fxRole: 'separate sword-spirit manifestation', notes: 'Một scale theo chiều cao toàn kiếm; giữ góc nguồn. Grip đo tại chuôi, không vẽ thêm ngón tay. Màu/guard là thiết kế mới, không claim canon.' },
  { id: 'banner', name: 'Thập Ức Tôn Hồn Phiên', description: 'Phiên đen lớn phía sau người, chủ hồn tách riêng; đây là form hiển thị cô đọng cho game.', sourceSize: [1536, 1024], gearRegion: [0, 0, 890, 1024], fxRegion: [890, 0, 646, 1024], sourceGrip: [726, 847], target: { height: 145 }, placement: 'grip', fxTarget: { height: 75 }, fxTopLeft: [129, 78], occlusion: 'all-behind-body', fxRole: 'separate soul stream', floor: 200, notes: 'Grip nằm trên đoạn cán có thật thấp hơn landmark y680 ban đầu để đáy cán ở world foot200. Toàn cờ nằm sau body/hair. Đây là static candidate một tay; chưa chứng minh động tác phất cờ.' },
  { id: 'bead', name: 'Thiên Nghịch Châu', description: 'Châu đá xám mốc đầu truyện và vòng nội không gian chuyển thể riêng; vị trí bay là đề xuất.', sourceSize: [1774, 887], gearRegion: [0, 0, 680, 887], fxRegion: [680, 0, 1094, 887], target: { width: 16 }, placement: 'centre', centreBodyLocal: [69, 39], fxTarget: { width: 55 }, fxCentre: [133, 151], occlusion: 'none', spillCleanup: true, fxRole: 'original time-space visualization, not literal canon appearance', notes: 'Châu lấy một scale chung toàn vật, nổi bên vai phải; không đổi áo/người. Vòng/độ bay là đề xuất hiển thị mới, không có orbit animation.' },
  { id: 'chariot', name: 'Xạ Thần Xa', description: 'Pháp khí cổ có gai/xích triển khai cạnh người và thú lôi riêng; tổng hợp ý tưởng chuyển thể cô đọng.', sourceSize: [1637, 961], gearRegion: [0, 0, 920, 961], fxRegion: [920, 0, 717, 961], target: { width: 110 }, placement: 'floor', left: 122, floor: 200, fxTarget: { height: 80 }, fxTopLeft: [155, 55], occlusion: 'none', spillCleanup: true, fxRole: 'separate original thunder-beast design', notes: 'Device đặt ngoài tay và cạnh phải body, đáy ở world foot200. Thú lôi hiện phía trên/sau device, tránh mặt người. Bánh/chassis/gai/xích/thú cụ thể là chuyển thể tổng hợp, không nguyên world size chiếc thứ ba trong truyện.' }
];

function bounds(data, width, height, threshold = 1) {
  let left = width, top = height, right = -1, bottom = -1, pixels = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] >= threshold) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); pixels++;
  }
  if (right < 0) return null;
  return { left, top, width: right - left + 1, height: bottom - top + 1, pixels };
}
const emptyCanvas = () => Buffer.alloc(canvas[0] * canvas[1] * 4);
function place(data, width, height, topLeft) {
  if (topLeft[0] < 3 || topLeft[1] < 3 || topLeft[0] + width > canvas[0] - 3 || topLeft[1] + height > canvas[1] - 3) throw new Error('Canvas margin/clipping failure');
  const layer = emptyCanvas();
  for (let y = 0; y < height; y++) data.copy(layer, ((y + topLeft[1]) * canvas[0] + topLeft[0]) * 4, y * width * 4, (y + 1) * width * 4);
  return layer;
}
async function extractPart(source, region, type, target, cleanup) {
  const [left, top, width, height] = region;
  const { data } = await sharp(source).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let removedLowAlphaPixels = 0, removedSpillPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    const nearPureGreen = g >= 180 && g - r >= 110 && g - b >= 90 && r <= 90 && b <= 110;
    const nearPureBlue = b >= 180 && b - r >= 110 && b - g >= 100 && r <= 90 && g <= 100;
    const spill = cleanup && a > 0 && a < 128 && (nearPureGreen || nearPureBlue);
    if (spill) removedSpillPixels++;
    const remove = spill || a < (type === 'gear' ? 128 : 8);
    if (remove) { if (a && !spill) removedLowAlphaPixels++; data.fill(0, i, i + 4); }
    else if (type === 'gear') data[i + 3] = 255;
  }
  const crop = bounds(data, width, height);
  if (!crop) throw new Error('Empty ' + type + ' region');
  const item = await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .resize({ ...target, kernel: 'nearest' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const scale = target.width ? target.width / crop.width : target.height / crop.height;
  return { data: item.data, width: item.info.width, height: item.info.height, crop, sourceCrop: { left: left + crop.left, top: top + crop.top, width: crop.width, height: crop.height }, scale, actualScale: [item.info.width / crop.width, item.info.height / crop.height], alpha: { method: type === 'gear' ? 'binary-alpha-128' : 'preserve-soft-alpha-threshold-8', removedLowAlphaPixels, removedSpillPixels, spillRule: cleanup ? 'only alpha<128 and near-pure saturated green/blue RGB; source unchanged' : null } };
}
async function png(data, file) { await sharp(data, { raw: { width: canvas[0], height: canvas[1], channels: 4 } }).png().toFile(resolve(root, file)); }
await mkdir(resolve(root, 'equipment'), { recursive: true });
await mkdir(resolve(root, 'review'), { recursive: true });
const bodyCanvas = await sharp({ create: { width: canvas[0], height: canvas[1], channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: bodyBytes, left: bodyOffset[0], top: bodyOffset[1] }]).png().toBuffer();
const equipment = [], registration = [];
for (const spec of specs) {
  const raw = `sources/${spec.id}-source.png`, prompt = `sources/${spec.id}.prompt.txt`;
  const source = await readFile(resolve(root, raw)), sourceMetadata = await sharp(source).metadata();
  if (sourceMetadata.width !== spec.sourceSize[0] || sourceMetadata.height !== spec.sourceSize[1]) throw new Error('Unexpected source size ' + spec.id);
  const gear = await extractPart(source, spec.gearRegion, 'gear', spec.target, false);
  const fx = await extractPart(source, spec.fxRegion, 'fx', spec.fxTarget, spec.spillCleanup);
  let itemGrip = null, itemTopLeft;
  if (spec.placement === 'grip') {
    itemGrip = [Math.round((spec.sourceGrip[0] - gear.sourceCrop.left) * gear.actualScale[0]), Math.round((spec.sourceGrip[1] - gear.sourceCrop.top) * gear.actualScale[1])];
    itemTopLeft = [bodyOffset[0] + hand[0] - itemGrip[0], bodyOffset[1] + hand[1] - itemGrip[1]];
    // A one-pixel registration rounding adjustment may move the grip, never the source/body.
    if (spec.floor && itemTopLeft[1] + gear.height !== spec.floor) {
      itemTopLeft[1] = spec.floor - gear.height;
      itemGrip[1] = bodyOffset[1] + hand[1] - itemTopLeft[1];
    }
  } else if (spec.placement === 'centre') {
    itemTopLeft = [bodyOffset[0] + spec.centreBodyLocal[0] - Math.floor(gear.width / 2), bodyOffset[1] + spec.centreBodyLocal[1] - Math.floor(gear.height / 2)];
  } else itemTopLeft = [spec.left, spec.floor - gear.height];
  const fxTopLeft = spec.fxTopLeft ?? [spec.fxCentre[0] - Math.floor(fx.width / 2), spec.fxCentre[1] - Math.floor(fx.height / 2)];
  const full = place(gear.data, gear.width, gear.height, itemTopLeft), fxRear = place(fx.data, fx.width, fx.height, fxTopLeft);
  let rear = emptyCanvas(), front = Buffer.from(full), occlusionMask = null;
  if (spec.occlusion === 'all-behind-body') { rear = Buffer.from(full); front = emptyCanvas(); }
  else if (spec.occlusion === 'original-fist') {
    occlusionMask = { left: 40, top: 61, width: 7, height: 8, basis: 'only existing live fist alpha; no invented fingers' };
    for (let y = occlusionMask.top; y < occlusionMask.top + occlusionMask.height; y++) for (let x = occlusionMask.left; x < occlusionMask.left + occlusionMask.width; x++) if (bodyRaw[(y * 64 + x) * 4 + 3]) {
      const i = ((y + bodyOffset[1]) * canvas[0] + x + bodyOffset[0]) * 4; full.copy(rear, i, i, i + 4); front.fill(0, i, i + 4);
    }
  }
  for (let i = 0; i < full.length; i++) if (Math.max(rear[i], front[i]) !== full[i]) throw new Error('Layer split altered gear');
  const fullFile = `equipment/${spec.id}.png`, frontFile = `equipment/${spec.id}-front.png`, rearFile = `equipment/${spec.id}-rear.png`, fxRearFile = `equipment/${spec.id}-fx-rear.png`, compositeFile = `review/${spec.id}-equipped.png`;
  for (const [file, data] of [[fullFile, full], [frontFile, front], [rearFile, rear], [fxRearFile, fxRear]]) await png(data, file);
  await sharp(fxRear, { raw: { width: canvas[0], height: canvas[1], channels: 4 } }).composite([{ input: await readFile(resolve(root, rearFile)) }, { input: bodyCanvas }, { input: await readFile(resolve(root, frontFile)) }]).png().toFile(resolve(root, compositeFile));
  const sourceSha256 = hash(source), promptSha256 = hash(await readFile(resolve(root, prompt)));
  const itemLocal = { placement: spec.placement, handBodyLocal: spec.placement === 'grip' ? hand : null, grip: spec.placement === 'grip' ? hand : null, sourceGrip: spec.sourceGrip ?? null, itemGrip, itemTopLeft, dimensions: [gear.width, gear.height], centreBodyLocal: spec.centreBodyLocal ?? null, floor: spec.floor ?? null, fxTopLeft, fxDimensions: [fx.width, fx.height] };
  equipment.push({ id: spec.id, name: spec.name, description: spec.description, file: frontFile, frontFile, rearFile, fullFile, fxRearFile, fxFile: fxRearFile, compositeFile, canvas, pivot, bodyOffset, raw, prompt, sourceSha256, sourceSize: spec.sourceSize, promptSha256, status: 'candidate-neutral-southeast-with-separate-fx', itemLocal, sha256: hash(await readFile(resolve(root, fullFile))), layerSha256: { front: hash(await readFile(resolve(root, frontFile))), rear: hash(await readFile(resolve(root, rearFile))), fxRear: hash(await readFile(resolve(root, fxRearFile))), composite: hash(await readFile(resolve(root, compositeFile))) }, ownerApproved: false, artApproved: false, runtimeReady: false });
  registration.push({ id: spec.id, source: raw, sourceSha256, sourceSize: spec.sourceSize, promptFile: prompt, promptSha256, canvas, pivot, bodyOffset, gearRegion: spec.gearRegion, fxRegion: spec.fxRegion, sourceGrip: spec.sourceGrip ?? null, sourceGripBasis: spec.sourceGrip ? 'manual visual landmark on existing handle/pole; banner lower grip chosen to align pole base with world foot' : null, rotateDegrees: 0, gear: { sourceCrop: gear.sourceCrop, scale: gear.scale, actualScale: gear.actualScale, dimensions: [gear.width, gear.height], alpha: gear.alpha }, fx: { sourceCrop: fx.sourceCrop, scale: fx.scale, actualScale: fx.actualScale, dimensions: [fx.width, fx.height], topLeft: fxTopLeft, alpha: fx.alpha, role: spec.fxRole }, itemLocal, occlusion: spec.occlusion, occlusionMask, layerOrder: ['fxRear', 'equipmentRear', 'unchangedLiveBody', 'equipmentFront'], gearBounds: bounds(full, ...canvas), fxBounds: bounds(fxRear, ...canvas), pixelsResampled: true, sampling: 'nearest; one uniform factor per complete source component; integer dimension rounding recorded', creativePainting: false, sourcePixelsModified: false, quality: 'static southeast adaptation candidate; grip/action/deployment motion unresolved', scaleMeaning: 'condensed game review form, not canonical world size', notes: spec.notes });
}
const manifest = { schema: 'wang-lin-equipment-story-2', date: '2026-10-13', stage: 'four static story-equipment candidates, southeast body and separate rear FX', generation: { method: 'built-in image_gen', modelChosenByTool: true, inputRole: 'exact live Wang reference, pixel density/palette; artifact-only source sheets, no generated human', transparentBackground: true, routerGenerationUsed: false, technicalPostProcess: 'source region extraction, binary gear alpha, soft FX threshold and low-alpha pure-color spill removal, nearest resample, measured registration; no creative painting' }, body: { file: bodyFile, canvas: [64, 96], pivot: [32, 88], sha256: hash(bodyBytes), liveAtlas: 'client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png', liveAtlasSha256: hash(await readFile(liveAtlas)), rect: { x: 2, y: 2, w: 64, h: 96 }, pixelsModified: false, rgbaMatchesLiveFrame: true }, equipment, coverage: { direction: 'southeast', directions: 1, neutralVariants: 4, animationClips: 0, otherDirections: 0, fx: 'four separated static rear FX layers; no motion timeline' }, readiness: { ownerApproved: false, artApproved: false, runtimeIntegrated: false, gameplayEquipmentImplemented: false } };
await writeFile(resolve(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(resolve(root, 'registration.json'), JSON.stringify({ schema: 'equipment-story-static-registration-2', registration }, null, 2) + '\n');
console.log(JSON.stringify({ bodyMatchesLive: true, canvas, pivot, equipment: equipment.map(item => ({ id: item.id, dimensions: item.itemLocal.dimensions, topLeft: item.itemLocal.itemTopLeft, itemGrip: item.itemLocal.itemGrip, fxDimensions: item.itemLocal.fxDimensions, fxTopLeft: item.itemLocal.fxTopLeft })) }));
