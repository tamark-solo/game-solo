import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';

// Scoped technical packing. No generation, painting, hue filter or runtime write.
const root = dirname(fileURLToPath(import.meta.url));
const previous = resolve(root, '../wang-lin-equipment-story-v2');
const workspace = resolve(root, '../../../..');
const partial = process.argv.includes('--partial');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const canvas = [256, 224], pivot = [96, 200], bodyOffset = [64, 112];
const expectedBodyHash = '78d0fb7e2e159334e65707423d8da2e4608d75e0845dcd3db677a3d1d2a14431';
const liveAtlasFile = 'client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png';
const originalBody = await readFile(resolve(previous, 'inputs/wang-lin-live-southeast-native.png'));
if (hash(originalBody) !== expectedBodyHash) throw new Error('Unexpected pinned live frame');
const liveAtlas = await readFile(resolve(workspace, liveAtlasFile));
const liveBody = await sharp(liveAtlas).extract({ left: 2, top: 2, width: 64, height: 96 }).ensureAlpha().raw().toBuffer();
const originalRaw = await sharp(originalBody).ensureAlpha().raw().toBuffer();
if (!liveBody.equals(originalRaw)) throw new Error('Pinned body differs from current live atlas RGBA');
const previousManifest = await json(resolve(previous, 'manifest.json'));
const previousRegistration = await json(resolve(previous, 'registration.json'));
const generation = await exists(resolve(root, 'generation.json')) ? await json(resolve(root, 'generation.json')) : { requests: [] };
const pending = [];

const bodySpecs = [
  { id: 'sword-jade', equipmentId: 'sword', name: 'Kiếm tu · Vân Ngọc', palette: ['#EAE1C9', '#426C66', '#273D43'], description: 'Áo kiếm tu ngà ngọc, đai gọn, viền thanh ngọc.' },
  { id: 'sword-ink', equipmentId: 'sword', name: 'Kiếm tu · Huyền Mặc', palette: ['#262731', '#A9A4B5', '#8E7953'], description: 'Áo kiếm tu mực trầm, viền bạc/xám và đai cổ kim.' },
  { id: 'banner-ashen', equipmentId: 'banner', name: 'Hồn phiên · Tàn Vân', palette: ['#CCC6B8', '#34313C', '#777487'], description: 'Áo tro cổ, lớp áo tối, mang vẻ phong trần.' },
  { id: 'banner-ritual', equipmentId: 'banner', name: 'Hồn phiên · U Tế', palette: ['#252331', '#813F46', '#C0B291'], description: 'Áo nghi lễ huyền mực, đai/vạt đỏ trầm và dấu hình học chuyển thể.' },
  { id: 'bead-cloud', equipmentId: 'bead', name: 'Thiên nghịch · Vân Bạch', palette: ['#E8E1D2', '#829891', '#465A5C'], description: 'Áo tu hành sáng, vân ngọc mờ, thanh sạch để đá châu vẫn nổi.' },
  { id: 'bead-hermit', equipmentId: 'bead', name: 'Thiên nghịch · Ẩn Tu', palette: ['#747D96', '#C4C7D1', '#D4C8AD'], description: 'Áo ẩn tu lam tro, cổ áo sáng và đai tối, giảm trang sức.' },
  { id: 'chariot-bronze', equipmentId: 'chariot', name: 'Xạ thần · Cổ Kim', palette: ['#313135', '#967E4D', '#C5B78F'], description: 'Áo cổ kim đen đồng, cấu trúc gọn cho pháp khí cạnh người.' },
  { id: 'chariot-thunder', equipmentId: 'chariot', name: 'Xạ thần · Lôi Huyền', palette: ['#343A51', '#8D91B5', '#CBC0A2'], description: 'Áo huyền lam tím trầm, tương phản với thú lôi tách lớp.' }
];
const groups = [
  { id: 'sword', name: 'Tiên kiếm · Hứa Lập Quốc', description: 'Tiên kiếm cổ và kiếm linh tách riêng; màu/vật liệu là lựa chọn chuyển thể.', variants: [
    { id: 'original', name: 'Huyền kim', palette: ['#23232E', '#A08852', '#D9CFAC'], copyPrevious: true },
    { id: 'jade', name: 'Bạch ngọc · thanh kiếm', palette: ['#D8DDCE', '#4F877F', '#8FAD9E'] },
    { id: 'ink', name: 'Huyền mặc · u kiếm', palette: ['#252534', '#75698F', '#B3ABC9'] }
  ] },
  { id: 'banner', name: 'Thập Ức Tôn Hồn Phiên', description: 'Phiên sau người, chủ hồn/khí tách lớp; ba tông trầm dành cho native 1×.', variants: [
    { id: 'original', name: 'Huyền kim', palette: ['#24212C', '#AC905E', '#DED0B3'], copyPrevious: true },
    { id: 'violet', name: 'U tím · hồn cổ', palette: ['#2D263D', '#7A628B', '#B5A9C1'] },
    { id: 'jade', name: 'Mặc ngọc · thanh hồn', palette: ['#233635', '#5C8F85', '#B1C4B0'] }
  ] },
  { id: 'bead', name: 'Thiên Nghịch Châu · làm lại', description: 'Ba thiết kế đá châu mới: châu xám cũ nhỏ, dấu mây và nội quang tách riêng. Không dùng hình châu v2 bị owner chê.', variants: [
    { id: 'stone', name: 'Cổ thạch · ngũ vân', palette: ['#8D8C83', '#585D58', '#C8C8B9'] },
    { id: 'cloud', name: 'Vân ngọc · thanh quang', palette: ['#ADB5A8', '#4C8076', '#D4E3CB'] },
    { id: 'abyss', name: 'Huyền thạch · nội giới', palette: ['#5D6170', '#8B789E', '#C5C2D5'] }
  ] },
  { id: 'chariot', name: 'Xạ Thần Xa', description: 'Form triển khai cô đọng, pháp khí cạnh người và thú lôi riêng; chất liệu/màu là chuyển thể.', variants: [
    { id: 'original', name: 'Cổ đồng', palette: ['#323034', '#9F8351', '#D1BC8E'], copyPrevious: true },
    { id: 'jade', name: 'Huyền kim · thanh ngọc', palette: ['#354547', '#90B4A3', '#C8D0BC'] },
    { id: 'thunder', name: 'Huyền thiết · lôi lam', palette: ['#2F354C', '#7184AD', '#BFCBE1'] }
  ] }
];

// Manual measurements filled only after inspecting each immutable AI source.
// A body uses ONE isotropic source factor from anatomical top/ground, never a pose bbox fit.
export const bodyMeasurements = {
  'sword-jade': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Same 16-source-pixel neutral grid as native reference; source boot soles end1407, world ground1408. Head anchor128 follows unchanged neutral grid rather than soft alpha halo122. Root512 maps original canvas centre32.', assessment: 'Áo ngà/ngọc mới giữ neutral và cỡ người từ grid16×; raw làm hai bàn tay lệch nhẹ nên hai vùng bàn tay/cổ tay được thay bằng pixel live. Đầu/mặt/tóc/da/giày trong mask khớp RGBA live; cổ áo, vai, vạt áo mới vẫn cần owner chọn ở1×, không gọi toàn anatomy đã duyệt.' },
  'sword-ink': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Manual unchanged neutral16× grid, source sole row1407/ground1408; x512 is original root32, hair grid top128. Soft halo122 is excluded from anatomy measurement.', assessment: 'Áo kiếm tu huyền mực với viền bạc/xám và đai cổ kim; neutral/grid16× khớp nguồn người. Vùng hai tay/cổ tay dùng lại live để giữ nắm tay; vai/vạt áo mới được giữ nguyên từ ART AI và chưa chứng minh chuyển động hoặc anatomy toàn bộ.' },
  'banner-ashen': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Manual unchanged neutral16× grid, shoe soles end1407; original head anchor128/root512. Soft fringe126 is not a new anatomical scale.', assessment: 'Áo tro xám và lớp trong tím trầm cho hồn phiên; nguồn giữ grid neutral16× và vai cùng tư thế. Mask live giữ nhận diện/giày/tay; vài pixel cổ tay ngà gốc là giới hạn của bản áo review. Chưa có chuyển động vạt áo hoặc cầm/phất cờ.' },
  'banner-ritual': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Manual unchanged16× grid: source boot soles1407/ground1408, head grid128/root512. Alpha halo121 not used to fit anatomy.', assessment: 'Áo nghi lễ đen và đỏ trầm, có dấu hình học trên vạt là thiết kế mới. Neutral/grid và vai cùng người chuẩn; tay/cổ tay, đầu/mặt/tóc/da và giày lấy pixel live theo mask. Dấu nhỏ/cuff ngà giữ gốc cần lựa ở1×; chưa claim chữ/phù văn canon hoặc animation.' },
  'bead-cloud': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Clothing/head aligned to source16× neutral grid, original source root512 and head grid128. Original world-foot grid1408 retained; AI left shoe extends to1425 and is replaced by exact live lower-leg/boot domain, not used to stretch outfit anatomy.', assessment: 'Áo ngà vân ngọc sáng, vai/cổ cùng neutral16×. Raw giày trái cao/dày thêm khoảng1px native nên phần chân/giày được thay nguyên RGBA live; scale áo vẫn1/16, không fit theo bbox1425. Head/hair/skin và hai nắm tay giữ gốc. Độ rộng vạt/hoạ tiết mới còn candidate ở1×.' },
  'bead-hermit': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Manual fixed16× neutral grid, source soles1407/ground1408 and head grid128/root512. Halo122 excluded.', assessment: 'ART thực ra áo lam tro, viền/cổ sáng và đai tối; palette ghi theo hình được tạo thay vì mô tả rêu/mộc trong brief. Vai/cổ và neutral cùng grid; phần nhận diện, tay/cuff, giày khớp pixel live theo mask. Chưa motion/ART approval.' },
  'chariot-bronze': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Manual same16× neutral grid, original source root512/head128 and source soles1407; world ground1408.', assessment: 'Áo đen/cổ đồng có vai và đai khỏe hơn qua trang trí kim loại, không phóng người. Hình vai/cổ vẫn cùng neutral; face/hair/skin, closed hands/cuffs and boots restored from live mask. Mảng đồng nhỏ ở1× chỉ đọc như trang trí candidate, chưa chứng minh giáp/artifact command/motion.' },
  'chariot-thunder': { sourceSize: [1024, 1536], rootX: 512, headTopY: 128, groundY: 1408, basis: 'Manual same16× neutral clothing/head grid. Original world-ground1408/root512 retained; soft alpha edge on boot row1408 and head119 is not used for fit.', assessment: 'Áo huyền lam, viền bạc và giáp tay nhỏ; cỡ người/vai/cổ giữ neutral theo grid16×. Đầu/mặt/tóc, warm RGBA, nắm tay/cuff và boots được khôi phục đúng live. Sườn áo/vạt mới là candidate, không dùng alpha halo để phóng/thu người hoặc suy motion.' }
};
export const gearMeasurements = {
  'bead-stone': { sourceSize: [1774, 887], gearRegion: [0, 0, 850, 887], fxRegion: [850, 0, 924, 887], target: { width: 18 }, placement: 'centre', centre: [133, 151], fxTarget: { width: 55 }, fxCentre: [133, 151], fxSelected: false, spillCleanup: true, beadExtraSpillCleanup: true, assessment: 'Gray old stone with carved clouds kept as bare core comparison option. Raw right-panel FX is a thick ivory ring and was not selected; its review layer is transparent. New stone source/core, no old v2 bead.', geometryPreserved: false },
  'bead-cloud': { sourceSize: [1774, 887], gearRegion: [0, 0, 850, 887], fxRegion: [850, 0, 924, 887], target: { width: 18 }, placement: 'centre', centre: [133, 151], fxTarget: { height: 40 }, fxCentre: [133, 151], spillCleanup: true, beadExtraSpillCleanup: true, assessment: 'New smooth pale gray bead with light carved cloud marks; separate two green-white wisps/motes placed above/below core. Source gear and FX are independent panels; visual design is a new celestial option, not a canonical colour claim.', geometryPreserved: false }
  , 'bead-abyss': { sourceSize: [1774, 887], gearRegion: [0, 0, 850, 887], fxRegion: [850, 0, 924, 887], target: { width: 18 }, placement: 'centre', centre: [133, 151], fxTarget: { height: 35 }, fxCentre: [133, 151], spillCleanup: true, beadExtraSpillCleanup: true, assessment: 'New gray-violet dark bead with fine cloud marks; violet arcs/motes are a separate layer. Source colour is AI artwork, not a local hue shift or a verified permanent canonical appearance.', geometryPreserved: false }
  , 'sword-jade': { sourceSize: [1536, 1024], gearRegion: [0, 0, 900, 1024], fxRegion: [900, 0, 636, 1024], sourceGrip: [280, 824], target: { height: 65 }, placement: 'grip', fxTarget: { height: 30 }, fxTopLeft: [142, 136], spillCleanup: true, assessment: 'AI colour/material edit from v2 source preserves sword angle, handle and sword-spirit panel placement nominally. New source alpha bounds differ by a few source pixels, so exact geometry is not asserted; existing handle280,824 verified visually, resampled native whole blade65px and original closed fist retained. Palette is ivory/silver/jade.', geometryPreserved: false }
  , 'sword-ink': { sourceSize: [1536, 1024], gearRegion: [0, 0, 900, 1024], fxRegion: [900, 0, 636, 1024], sourceGrip: [280, 824], target: { height: 65 }, placement: 'grip', fxTarget: { height: 30 }, fxTopLeft: [142, 136], spillCleanup: true, assessment: 'AI colour/material edit from v2 source preserves nominal blade angle, handle280,824 and separate sword-spirit panel. Actual artwork is dark violet/silver rather than red; palette/name reflect artwork. Alpha edge differs a few source pixels, exact source geometry not claimed. Native blade65px and original hand occlusion retained.', geometryPreserved: false }
  , 'banner-violet': { sourceSize: [1536, 1024], gearRegion: [0, 0, 890, 1024], fxRegion: [890, 0, 646, 1024], sourceGrip: [726, 847], target: { height: 145 }, placement: 'grip', floor: 200, fxTarget: { height: 75 }, fxTopLeft: [129, 78], spillCleanup: true, assessment: 'AI violet/silver material edit preserves nominal same pole/flag/soul-panel layout. Lower existing pole grip726,847 visually verified; whole flag145px, pole bottom worldfoot200, all gear behind live identity body. Integer source alpha edges slightly differ; no exact source-geometry or flag motion claim.', geometryPreserved: false }
  , 'banner-jade': { sourceSize: [1536, 1024], gearRegion: [0, 0, 890, 1024], fxRegion: [890, 0, 646, 1024], sourceGrip: [726, 847], target: { height: 145 }, placement: 'grip', floor: 200, fxTarget: { height: 75 }, fxTopLeft: [129, 78], spillCleanup: true, assessment: 'AI dark-jade/ivory/bronze edit keeps nominal same flag silhouette and pole. Existing lower pole grip726,847 manually verified,145px complete flag with bottom200; three muted jade soul wisps separated. Source alpha fringe differs, geometry exactness/cloth action unresolved.', geometryPreserved: false }
  , 'chariot-jade': { sourceSize: [1637, 961], gearRegion: [0, 0, 920, 961], fxRegion: [920, 0, 717, 961], target: { width: 110 }, componentCanvas: [110, 93], placement: 'floor', left: 122, floor: 200, fxTarget: { height: 80 }, fxComponentCanvas: [65, 80], fxTopLeft: [155, 55], spillCleanup: true, assessment: 'AI dark metal/jade/silver edit preserves nominal cart wheel/spike/chain geometry and separate thunder-beast panel from v2. Natural complete-cart resample110x92 receives one transparent top row in the baseline110x93 component canvas; source pixels are not stretched and floor remains200. Beast natural64x80 receives one transparent right column in65x80 frame. New edges/fringe vary, not exact geometry or canonical deployment/world scale.', geometryPreserved: false }
  , 'chariot-thunder': { sourceSize: [1637, 961], gearRegion: [0, 0, 920, 961], fxRegion: [920, 0, 717, 961], target: { width: 110 }, componentCanvas: [110, 93], placement: 'floor', left: 122, floor: 200, fxTarget: { height: 80 }, fxComponentCanvas: [65, 80], fxTopLeft: [155, 55], spillCleanup: true, assessment: 'AI dark iron/silver and thunder-blue edit retains nominal v2 cart/chain/spike and beast silhouette. Whole-device width110 and beast height80 are uniform resamples; transparent component padding only retains baseline frame/origin110x93/(122,107) and65x80/(155,55), not stretching pixels. Actual art is blue-gray rather than purple; palette/name reflect source. Static deployment candidate, no exact geometry/footprint/collision/action claim.', geometryPreserved: false }
};

function bounds(data, width, height, threshold = 1) {
  let left = width, top = height, right = -1, bottom = -1, pixels = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] >= threshold) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); pixels++;
  }
  return right < 0 ? null : { left, top, width: right - left + 1, height: bottom - top + 1, pixels };
}
const empty = (width = canvas[0], height = canvas[1]) => Buffer.alloc(width * height * 4);
const rgbaPNG = async (data, width, height, file) => { await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(resolve(root, file)); };
function place(data, width, height, topLeft) {
  if (topLeft[0] < 3 || topLeft[1] < 3 || topLeft[0] + width > canvas[0] - 3 || topLeft[1] + height > canvas[1] - 3) throw new Error('Equipment clipping or canvas margin failure');
  const layer = empty();
  for (let y = 0; y < height; y++) data.copy(layer, ((y + topLeft[1]) * canvas[0] + topLeft[0]) * 4, y * width * 4, (y + 1) * width * 4);
  return layer;
}
function requestFor(kind, id) {
  const ids = kind === 'body' ? [`body-${id}`, id] : [`equipment-${id}`, `gear-${id}`, id];
  return generation.requests?.find(request => ids.includes(request.id) && (!request.kind || request.kind === kind || request.kind === 'equipment'));
}
async function sourceRecord(kind, id) {
  const request = requestFor(kind, id) ?? {};
  const prefix = kind === 'body' ? 'body' : 'equipment';
  const raw = request.raw ?? `sources/${prefix}-${id}-source.png`;
  const prompt = request.prompt ?? `sources/${prefix}-${id}.prompt.txt`;
  if (!await exists(resolve(root, raw))) return null;
  const source = await readFile(resolve(root, raw));
  if (request.sha256 && hash(source) !== request.sha256) throw new Error('AI source hash differs from generation record ' + id);
  const metadata = await sharp(source).metadata();
  const input = request.input ?? generation.input ?? 'inputs/wang-lin-live-southeast-nearest8x.png';
  const inputList = Array.isArray(input) ? input : [input];
  const inputs = [];
  for (const file of inputList) if (typeof file === 'string' && await exists(resolve(root, file))) inputs.push({ file, sha256: hash(await readFile(resolve(root, file))) });
  if (!await exists(resolve(root, prompt))) throw new Error('Missing source prompt ' + id);
  if (inputs.length !== inputList.length) throw new Error('Missing source input provenance ' + id);
  return { source, raw, prompt, sourceSha256: hash(source), sourceSize: [metadata.width, metadata.height], promptSha256: hash(await readFile(resolve(root, prompt))), input: inputList, inputs, generationRequestId: request.id ?? `${prefix}-${id}` };
}

// Manually audited on the CURRENT live southeast Pixel02 frame. Historical south masks are not used.
// Clear-and-copy domains preserve transparent boundary pixels as well as visible identity pixels.
const identityRegions = [
  { left: 0, top: 0, width: 64, height: 49, role: 'head, face, front hair, hair tie and exact transparent boundary; collar starts49' },
  ...Object.entries({ 49: 21, 50: 20, 51: 19, 52: 18, 53: 17, 54: 17, 55: 16, 56: 15, 57: 15, 58: 14, 59: 13, 60: 12, 61: 9, 62: 9, 63: 9, 64: 9 }).map(([y, lastX]) => ({ left: 0, top: Number(y), width: lastX + 1, height: 1, role: 'manually traced left back-hair boundary; sleeve excluded' })),
  { left: 14, top: 65, width: 8, height: 6, role: 'left closed hand, tiny outline and cuff boundary' },
  { left: 40, top: 61, width: 7, height: 8, role: 'right closed fist/cuff and transparent boundary; exactly the pinned gear-occlusion domain, clears small generated-hand shifts' },
  { left: 0, top: 80, width: 64, height: 16, role: 'pant lower edge, boots/soles and exact transparent boundary' }
];
const rightHairRows = { 49: [37, 45], 50: [41, 47], 51: [41, 47], 52: [41, 47], 53: [43, 47], 54: [43, 47], 55: [43, 47], 56: [44, 47] };
const darkRGB = new Set(['31,29,36', '41,39,45', '52,50,58', '59,56,63', '75,72,80', '58,54,60', '81,76,83', '83,83,92', '105,100,106', '114,113,121']);
const skinRGB = new Set(['242,206,166', '204,152,115', '169,104,80', '229,184,143']);
function identityLock(generated) {
  if (!identityRegions.length) throw new Error('Precise current live SE identity mask not yet installed');
  const output = Buffer.from(generated), mask = new Uint8Array(64 * 96);
  for (const region of identityRegions) for (let y = region.top; y < region.top + region.height; y++) for (let x = region.left; x < region.left + region.width; x++) mask[y * 64 + x] = 1;
  for (const [row, range] of Object.entries(rightHairRows)) for (let x = range[0]; x <= range[1]; x++) {
    const p = Number(row) * 64 + x, i = p * 4;
    if (originalRaw[i + 3] && darkRGB.has(`${originalRaw[i]},${originalRaw[i + 1]},${originalRaw[i + 2]}`)) mask[p] = 1;
  }
  let exactSkinPixels = 0;
  for (let p = 0; p < 64 * 96; p++) {
    const i = p * 4;
    if (originalRaw[i + 3] && skinRGB.has(`${originalRaw[i]},${originalRaw[i + 1]},${originalRaw[i + 2]}`)) { mask[p] = 1; exactSkinPixels++; }
    if (mask[p]) originalRaw.copy(output, i, i, i + 4);
  }
  let restoredPixels = 0, visibleRestoredPixels = 0;
  for (let p = 0; p < mask.length; p++) if (mask[p]) {
    restoredPixels++; if (originalRaw[p * 4 + 3]) visibleRestoredPixels++;
    for (let c = 0; c < 4; c++) if (output[p * 4 + c] !== originalRaw[p * 4 + c]) throw new Error('Identity RGBA lock failure');
  }
  return { output, mask, exactSkinPixels, restoredPixels, visibleRestoredPixels, maskSha256: hash(mask) };
}
function sampleNeutral(source, width, height, measurement) {
  const scale = 80 / (measurement.groundY - measurement.headTopY);
  if (!(scale > 0)) throw new Error('Invalid manually measured neutral scale');
  const native = empty(64, 96);
  for (let y = 0; y < 96; y++) for (let x = 0; x < 64; x++) {
    const sx = Math.floor(measurement.rootX + (x + 0.5 - 32) / scale);
    const sy = Math.floor(measurement.groundY + (y + 0.5 - 88) / scale);
    if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
    const from = (sy * width + sx) * 4, to = (y * 64 + x) * 4;
    if (source[from + 3] >= 128) { source.copy(native, to, from, from + 4); native[to + 3] = 255; }
  }
  return { native, scale };
}
async function packBody(spec) {
  const source = await sourceRecord('body', spec.id);
  const measurement = bodyMeasurements[spec.id];
  if (!source || !measurement) { pending.push(`body:${spec.id}:${source ? 'manual-measurement' : 'source'}`); return null; }
  const { data, info } = await sharp(source.source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (measurement.sourceSize && (info.width !== measurement.sourceSize[0] || info.height !== measurement.sourceSize[1])) throw new Error('Unexpected body source dimensions ' + spec.id);
  const sampled = sampleNeutral(data, info.width, info.height, measurement);
  const locked = identityLock(sampled.native);
  let changedPixelsFromLive = 0;
  for (let p = 0; p < 64 * 96; p++) {
    const i = p * 4;
    if (locked.output[i] !== originalRaw[i] || locked.output[i + 1] !== originalRaw[i + 1] || locked.output[i + 2] !== originalRaw[i + 2] || locked.output[i + 3] !== originalRaw[i + 3]) changedPixelsFromLive++;
  }
  if (!changedPixelsFromLive) throw new Error('Outfit option contains no new garment pixels ' + spec.id);
  const file = `body/${spec.id}.png`;
  await rgbaPNG(locked.output, 64, 96, file);
  const diagnosticFile = `review/composites/body-${spec.id}--alignment-4x.png`;
  const diagnostic = await sharp({ create: { width: 208, height: 96, channels: 4, background: { r: 38, g: 43, b: 44, alpha: 1 } } }).composite([
    { input: originalBody, left: 0, top: 0 },
    { input: await sharp(sampled.native, { raw: { width: 64, height: 96, channels: 4 } }).png().toBuffer(), left: 72, top: 0 },
    { input: await readFile(resolve(root, file)), left: 144, top: 0 }
  ]).png().toBuffer();
  await sharp(diagnostic).resize({ width: 832, height: 384, kernel: 'nearest' }).png().toFile(resolve(root, diagnosticFile));
  const identity = { method: 'documented current live SE clear-and-copy regions plus spatial dark-palette right-hair and exact original warm RGBA pixels', reference: 'body/original.png', referenceSha256: expectedBodyHash, regions: identityRegions, rightHairRows, rightHairPalette: [...darkRGB], exactSkinPalette: [...skinRGB], exactSkinPixels: locked.exactSkinPixels, paletteMaskLimitation: 'These exact warm colours include canonical hair-tie/cloth pixels; this is a pixel-preservation mask, not semantic skin segmentation.', restoredPixels: locked.restoredPixels, visibleRestoredPixels: locked.visibleRestoredPixels, maskSha256: locked.maskSha256, maskedRGBAEqualsLive: true, protectedHeadHairSkinBootPixelsRestoredFromLive: true, fullBodyRGBAEqualsLive: false, assessment: measurement.assessment, anatomyApprovalAutomatic: false };
  const result = { ...spec, file, diagnosticFile, canvas: [64, 96], pivot: [32, 88], sha256: hash(await readFile(resolve(root, file))), raw: source.raw, prompt: source.prompt, input: source.input, inputs: source.inputs, sourceSha256: source.sourceSha256, sourceSize: source.sourceSize, promptSha256: source.promptSha256, generationRequestId: source.generationRequestId, status: 'candidate-outfit-neutral-southeast', identity, identityAssessment: identity.assessment, bodyBounds: bounds(locked.output, 64, 96), changedPixelsFromLive, pixelsResampled: true, pixelsModified: true, ownerApproved: false, artApproved: false, runtimeReady: false };
  return { result, registration: { id: spec.id, kind: 'body', source: source.raw, sourceSha256: source.sourceSha256, sourceSize: source.sourceSize, prompt: source.prompt, promptSha256: source.promptSha256, inputs: source.inputs, manualMeasurement: measurement, oneSourceScale: sampled.scale, targetHeadTopY: 8, targetGroundY: 88, targetRootX: 32, sampling: 'isotropic inverse mapping, nearest source pixel, binary alpha128', canvas: [64, 96], pivot: [32, 88], noPerPoseBBoxFit: true, identity, creativePainting: false, hueFilter: false, originalSourcePixelsModified: false, canonicalPixelReplacement: true, bounds: result.bodyBounds, sha256: result.sha256 } };
}
async function extractPart(source, region, type, target, spillCleanup = false, beadExtraSpillCleanup = false) {
  const [left, top, width, height] = region;
  const { data } = await sharp(source).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let removedLowAlphaPixels = 0, removedSpillPixels = 0;
  const removedSpillByClass = { pureGreen: 0, pureBlue: 0, beadNeonMagenta: 0, beadNeonRed: 0 };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    const nearPureGreen = g >= 180 && g - r >= 110 && g - b >= 90 && r <= 90 && b <= 110;
    const nearPureBlue = b >= 180 && b - r >= 110 && b - g >= 100 && r <= 90 && g <= 100;
    const beadNeonMagenta = beadExtraSpillCleanup && r >= 200 && b >= 200 && g <= 50;
    const beadNeonRed = beadExtraSpillCleanup && r >= 200 && g <= 50 && b <= 50;
    const spill = spillCleanup && a > 0 && a < 128 && (nearPureGreen || nearPureBlue || beadNeonMagenta || beadNeonRed);
    if (spill || a < (type === 'gear' ? 128 : 8)) {
      if (spill) {
        removedSpillPixels++;
        if (nearPureGreen) removedSpillByClass.pureGreen++;
        else if (nearPureBlue) removedSpillByClass.pureBlue++;
        else if (beadNeonMagenta) removedSpillByClass.beadNeonMagenta++;
        else if (beadNeonRed) removedSpillByClass.beadNeonRed++;
      } else if (a) removedLowAlphaPixels++;
      data.fill(0, i, i + 4);
    }
    else if (type === 'gear') data[i + 3] = 255;
  }
  const crop = bounds(data, width, height);
  if (!crop) throw new Error('Empty ' + type + ' source region');
  const item = await sharp(data, { raw: { width, height, channels: 4 } }).extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height }).resize({ ...target, kernel: 'nearest' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: item.data, width: item.info.width, height: item.info.height, sourceCrop: { left: left + crop.left, top: top + crop.top, width: crop.width, height: crop.height }, scale: target.width ? target.width / crop.width : target.height / crop.height, actualScale: [item.info.width / crop.width, item.info.height / crop.height], alpha: { method: type === 'gear' ? 'binary-alpha128' : 'preserve-soft-alpha-threshold8', removedLowAlphaPixels, removedSpillPixels, removedSpillByClass, spillRule: spillCleanup ? { alpha: '0<A<128 only', green: 'G>=180;G-R>=110;G-B>=90;R<=90;B<=110', blue: 'B>=180;B-R>=110;B-G>=100;R<=90;G<=100', beadMagenta: beadExtraSpillCleanup ? 'R>=200;B>=200;G<=50 (near #FF00FF only)' : null, beadRed: beadExtraSpillCleanup ? 'R>=200;G<=50;B<=50 (near #FF0000 only)' : null, scope: beadExtraSpillCleanup ? 'new bead FX panel only, never core/body/original copied gear; muted violet/red and alpha>=128 preserved' : 'new FX panel only; source bytes preserved', sourcePixelsModified: false } : null } };
}
function padComponent(part, dimensions, bottomAlign = false) {
  if (!dimensions) return part;
  const [width, height] = dimensions;
  if (part.width > width || part.height > height) throw new Error('Natural source component exceeds fixed padding frame');
  const offset = [0, bottomAlign ? height - part.height : 0], padded = empty(width, height);
  for (let y = 0; y < part.height; y++) part.data.copy(padded, ((y + offset[1]) * width + offset[0]) * 4, y * part.width * 4, (y + 1) * part.width * 4);
  return { ...part, data: padded, naturalDimensions: [part.width, part.height], nativePadding: { method: 'transparent padding only; resampled source pixels unchanged', componentCanvas: dimensions, topLeft: offset }, width, height };
}
async function packGear(group, variant) {
  const id = `${group.id}-${variant.id}`;
  if (variant.copyPrevious) {
    const previousItem = previousManifest.equipment.find(item => item.id === group.id);
    const previousReg = previousRegistration.registration.find(item => item.id === group.id);
    const files = { fullFile: `equipment/${id}.png`, frontFile: `equipment/${id}-front.png`, rearFile: `equipment/${id}-rear.png`, fxRearFile: `equipment/${id}-fx-rear.png` };
    const hashes = {};
    const previousExpected = { fullFile: previousItem.sha256, frontFile: previousItem.layerSha256.front, rearFile: previousItem.layerSha256.rear, fxRearFile: previousItem.layerSha256.fxRear };
    for (const key of Object.keys(files)) {
      const bytes = await readFile(resolve(previous, previousItem[key]));
      if (hash(bytes) !== previousExpected[key]) throw new Error('V2 pinned layer changed ' + id + ':' + key);
      await writeFile(resolve(root, files[key]), bytes); hashes[key] = hash(bytes);
    }
    if (hash(await readFile(resolve(previous, previousItem.raw))) !== previousItem.sourceSha256 || hash(await readFile(resolve(previous, previousItem.prompt))) !== previousItem.promptSha256) throw new Error('V2 pinned source/prompt changed ' + id);
    const originalInput = '../wang-lin-equipment-story-v2/inputs/wang-lin-live-southeast-nearest8x.png';
    const inputs = [{ file: originalInput, sha256: hash(await readFile(resolve(root, originalInput))) }];
    return { result: { ...variant, ...files, file: files.frontFile, fxFile: files.fxRearFile, canvas, pivot, bodyOffset, raw: `../wang-lin-equipment-story-v2/${previousItem.raw}`, prompt: `../wang-lin-equipment-story-v2/${previousItem.prompt}`, input: [originalInput], inputs, sourceSha256: previousItem.sourceSha256, sourceSize: previousItem.sourceSize, promptSha256: previousItem.promptSha256, sha256: hashes.fullFile, layerSha256: { front: hashes.frontFile, rear: hashes.rearFile, fxRear: hashes.fxRearFile }, itemLocal: previousItem.itemLocal, previousPackageBytesUnchanged: true, sourceGeometryPreserved: true, status: 'candidate-static-neutral-with-separate-fx', ownerApproved: false, artApproved: false, runtimeReady: false }, registration: { ...previousReg, id, previousPackage: '../wang-lin-equipment-story-v2', copiedLayersByteExact: true, source: `../wang-lin-equipment-story-v2/${previousReg.source}`, promptFile: `../wang-lin-equipment-story-v2/${previousReg.promptFile}`, inputs, creativePainting: false } };
  }
  const source = await sourceRecord('equipment', id), measurement = gearMeasurements[id];
  if (!source || !measurement) { pending.push(`equipment:${id}:${source ? 'manual-measurement' : 'source'}`); return null; }
  if (measurement.sourceSize && (source.sourceSize[0] !== measurement.sourceSize[0] || source.sourceSize[1] !== measurement.sourceSize[1])) throw new Error('Unexpected gear source dimensions ' + id);
  const gear = padComponent(await extractPart(source.source, measurement.gearRegion, 'gear', measurement.target), measurement.componentCanvas, true);
  const fx = padComponent(await extractPart(source.source, measurement.fxRegion, 'fx', measurement.fxTarget, measurement.spillCleanup, measurement.beadExtraSpillCleanup), measurement.fxComponentCanvas);
  let itemTopLeft, itemGrip = null;
  if (measurement.placement === 'grip') {
    itemGrip = [Math.round((measurement.sourceGrip[0] - gear.sourceCrop.left) * gear.actualScale[0]), Math.round((measurement.sourceGrip[1] - gear.sourceCrop.top) * gear.actualScale[1])];
    itemTopLeft = [107 - itemGrip[0], 176 - itemGrip[1]];
    if (measurement.floor && itemTopLeft[1] + gear.height !== measurement.floor) { itemTopLeft[1] = measurement.floor - gear.height; itemGrip[1] = 176 - itemTopLeft[1]; }
  } else if (measurement.placement === 'centre') itemTopLeft = [measurement.centre[0] - Math.floor(gear.width / 2), measurement.centre[1] - Math.floor(gear.height / 2)];
  else itemTopLeft = [measurement.left, measurement.floor - gear.height];
  const fxTopLeft = measurement.fxTopLeft ?? [measurement.fxCentre[0] - Math.floor(fx.width / 2), measurement.fxCentre[1] - Math.floor(fx.height / 2)];
  const full = place(gear.data, gear.width, gear.height, itemTopLeft), fxRear = measurement.fxSelected === false ? empty() : place(fx.data, fx.width, fx.height, fxTopLeft);
  let rear = empty(), front = Buffer.from(full), occlusionMask = null;
  if (group.id === 'banner') { rear = Buffer.from(full); front = empty(); }
  else if (group.id === 'sword') {
    occlusionMask = { left: 40, top: 61, width: 7, height: 8, basis: 'pinned original SE fist restored byte-exact in every outfit; no invented fingers' };
    for (let y = 61; y < 69; y++) for (let x = 40; x < 47; x++) if (originalRaw[(y * 64 + x) * 4 + 3]) { const i = ((y + bodyOffset[1]) * canvas[0] + x + bodyOffset[0]) * 4; full.copy(rear, i, i, i + 4); front.fill(0, i, i + 4); }
  }
  for (let i = 0; i < full.length; i++) if (Math.max(rear[i], front[i]) !== full[i]) throw new Error('Layer split altered complete source gear');
  const files = { fullFile: `equipment/${id}.png`, frontFile: `equipment/${id}-front.png`, rearFile: `equipment/${id}-rear.png`, fxRearFile: `equipment/${id}-fx-rear.png` };
  for (const [key, data] of [['fullFile', full], ['frontFile', front], ['rearFile', rear], ['fxRearFile', fxRear]]) await rgbaPNG(data, ...canvas, files[key]);
  const hashes = {}; for (const key of Object.keys(files)) hashes[key] = hash(await readFile(resolve(root, files[key])));
  const itemLocal = { placement: measurement.placement, sourceGrip: measurement.sourceGrip ?? null, grip: measurement.placement === 'grip' ? [43, 64] : null, itemGrip, itemTopLeft, dimensions: [gear.width, gear.height], floor: measurement.floor ?? null, fxTopLeft, fxDimensions: measurement.fxSelected === false ? [0, 0] : [fx.width, fx.height], fxSelected: measurement.fxSelected !== false };
  return { result: { ...variant, ...files, file: files.frontFile, fxFile: files.fxRearFile, canvas, pivot, bodyOffset, raw: source.raw, prompt: source.prompt, input: source.input, inputs: source.inputs, sourceSha256: source.sourceSha256, sourceSize: source.sourceSize, promptSha256: source.promptSha256, generationRequestId: source.generationRequestId, sha256: hashes.fullFile, layerSha256: { front: hashes.frontFile, rear: hashes.rearFile, fxRear: hashes.fxRearFile }, itemLocal, fxSelected: measurement.fxSelected !== false, status: 'candidate-static-neutral-with-separate-fx', sourceGeometryAssessment: measurement.assessment, sourceGeometryPreserved: measurement.geometryPreserved ?? false, pixelsResampled: true, hueFilter: false, ownerApproved: false, artApproved: false, runtimeReady: false }, registration: { id, kind: 'equipment', source: source.raw, sourceSha256: source.sourceSha256, sourceSize: source.sourceSize, prompt: source.prompt, promptSha256: source.promptSha256, inputs: source.inputs, canvas, pivot, bodyOffset, manualMeasurement: measurement, gear: { sourceCrop: gear.sourceCrop, scale: gear.scale, actualScale: gear.actualScale, dimensions: [gear.width, gear.height], naturalDimensions: gear.naturalDimensions ?? [gear.width, gear.height], nativePadding: gear.nativePadding ?? null, alpha: gear.alpha }, fx: { sourceCrop: fx.sourceCrop, scale: fx.scale, actualScale: fx.actualScale, dimensions: [fx.width, fx.height], naturalDimensions: fx.naturalDimensions ?? [fx.width, fx.height], nativePadding: fx.nativePadding ?? null, topLeft: fxTopLeft, alpha: fx.alpha, selected: measurement.fxSelected !== false }, itemLocal, occlusionMask, gearBounds: bounds(full, ...canvas), fxBounds: bounds(fxRear, ...canvas), pixelsResampled: true, creativePainting: false, hueFilter: false, sourcePixelsModified: false, layerOrder: ['fxRear', 'equipmentRear', 'bodyOutfit', 'equipmentFront'], quality: 'static southeast candidate; grip/deployment/action motion unresolved', assessment: measurement.assessment } };
}

for (const directory of ['body', 'equipment', 'review/composites']) await mkdir(resolve(root, directory), { recursive: true });
await writeFile(resolve(root, 'body/original.png'), originalBody);
const body = { id: 'original', name: 'Vương Lâm live · nguyên bản', description: 'Frame thật Pixel02 đang dùng trong game, giữ nguyên byte.', file: 'body/original.png', canvas: [64, 96], pivot: [32, 88], sha256: expectedBodyHash, liveAtlas: liveAtlasFile, liveAtlasSha256: hash(liveAtlas), rect: { x: 2, y: 2, w: 64, h: 96 }, pixelsModified: false, rgbaMatchesLiveFrame: true, identityAssessment: 'Nguyên byte/RGBA của frame live; áo mới chỉ là candidate riêng.', status: 'pinned-live-reference' };
const bodies = [body], registration = [], equipmentGroups = [];
for (const spec of bodySpecs) { const packed = await packBody(spec); if (packed) { bodies.push(packed.result); registration.push(packed.registration); } }
for (const group of groups) {
  const variants = [];
  for (const variant of group.variants) { const packed = await packGear(group, variant); if (packed) { variants.push(packed.result); registration.push(packed.registration); } }
  equipmentGroups.push({ id: group.id, name: group.name, description: group.description, variants, bodyIds: ['original', ...bodySpecs.filter(item => item.equipmentId === group.id).map(item => item.id)] });
}
for (const group of equipmentGroups) for (const variant of group.variants) for (const candidateBody of bodies.filter(item => !item.equipmentId || item.equipmentId === group.id)) {
  const file = `review/composites/${group.id}-${variant.id}--${candidateBody.id}.png`;
  await sharp(await readFile(resolve(root, variant.fxRearFile))).composite([{ input: await readFile(resolve(root, variant.rearFile)) }, { input: await readFile(resolve(root, candidateBody.file)), left: bodyOffset[0], top: bodyOffset[1] }, { input: await readFile(resolve(root, variant.frontFile)) }]).png().toFile(resolve(root, file));
  if (!variant.compositeFiles) variant.compositeFiles = {};
  variant.compositeFiles[candidateBody.id] = file;
}
const mapFile = await exists(resolve(root, 'inputs/map-native.png')) ? 'inputs/map-native.png' : '../wang-lin-equipment-story-v2/inputs/map-native.png';
const mapBackground = await exists(resolve(root, mapFile)) ? { file: mapFile, sha256: hash(await readFile(resolve(root, mapFile))) } : null;
if (!pending.length && (bodies.length !== 9 || equipmentGroups.some(group => group.variants.length !== 3))) throw new Error('Unexpected complete coverage');
const manifest = { schema: 'wang-lin-equipment-options-3', date: '2026-10-13', stage: pending.length ? 'technical scaffold; sources and measurements in progress' : 'static outfit and equipment colour candidates', canvas, pivot, bodyOffset, body, bodies, equipmentGroups, mapBackground, generation: { method: 'built-in image_gen edits; original three gear palettes copied byte-exact from v2', routerGenerationUsed: false, creativeRecolorInCode: false, bodyIdentityMethod: 'same neutral anatomy mapping, documented canonical live identity replacement', technicalPostProcess: 'measured source registration, nearest isotropic body mapping, source component extraction, alpha threshold, rear/front separation, live identity RGBA restoration', sourceImagesModified: false }, coverage: { direction: 'southeast', directions: 1, bodyOptions: bodies.length, outfitOptions: bodies.length - 1, equipmentGroups: 4, equipmentVariants: equipmentGroups.reduce((n, group) => n + group.variants.length, 0), animationClips: 0, otherDirections: 0, fx: 'separate static rear layers, no motion timeline' }, readiness: { ownerApproved: false, artApproved: false, runtimeIntegrated: false, gameplayEquipmentImplemented: false }, pending };
await writeFile(resolve(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(resolve(root, 'registration.json'), JSON.stringify({ schema: 'equipment-options-static-registration-3', bodyReference: body, identityRegions, registration }, null, 2) + '\n');
await writeFile(resolve(root, 'inspection.json'), JSON.stringify({ schema: 'equipment-options-technical-inspection-3', date: '2026-10-13', originalBodyMatchesLiveRGBA: true, bodyIdentityChecks: bodies.filter(item => item.identity).map(item => ({ id: item.id, sha256: item.sha256, sourceSize: item.sourceSize, canvas: item.canvas, pivot: item.pivot, maskedRGBAEqualsLive: item.identity.maskedRGBAEqualsLive, exactSkinPixels: item.identity.exactSkinPixels, restoredPixels: item.identity.restoredPixels, changedPixelsFromLive: item.changedPixelsFromLive, maskSha256: item.identity.maskSha256, diagnosticFile: item.diagnosticFile, diagnosticOrder: ['originalLive', 'measuredAIOutfitBeforeIdentityLock', 'finalCandidateWithLiveIdentityPixels'], assessment: item.identity.assessment })), equipmentChecks: registration.filter(item => item.kind === 'equipment').map(item => ({ id: item.id, gearBounds: item.gearBounds, fxBounds: item.fxBounds, dimensions: item.itemLocal.dimensions, grip: item.itemLocal.grip, sourceGrip: item.itemLocal.sourceGrip, fxSelected: item.fx.selected, layerSplitPreservesCompleteGearRGBA: true, clippingDetected: false, assessment: item.assessment })), originalGearCopies: equipmentGroups.flatMap(group => group.variants.filter(item => item.copyPrevious).map(item => ({ id: `${group.id}-${item.id}`, unchanged: item.previousPackageBytesUnchanged, layerSha256: item.layerSha256 }))), coverage: manifest.coverage, pending, ownerApproved: false, artApproved: false, runtimeIntegrated: false }, null, 2) + '\n');
console.log(JSON.stringify({ originalBodyMatchesLiveRGBA: true, coverage: manifest.coverage, pending }));
if (pending.length && !partial) throw new Error('Incomplete v3 source packing: ' + pending.join(', '));
