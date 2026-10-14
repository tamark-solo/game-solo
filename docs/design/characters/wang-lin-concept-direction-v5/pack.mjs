import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';
import { existsSync } from 'node:fs';

if (existsSync(new URL('./approval.json', import.meta.url))) throw new Error('Concept approval locks this V5 source package; create a new production package.');

// This script only registers immutable concept artwork. It never generates,
// paints, restores the old face, changes a palette or writes runtime assets.
const root = dirname(fileURLToPath(import.meta.url));
const partial = process.argv.includes('--partial');
const canvas = [160, 144], pivot = [64, 128], bodyHeight = 80;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const readJSON = async file => JSON.parse(await readFile(resolve(root, file), 'utf8'));
const writeJSON = async (file, data) => { await mkdir(dirname(resolve(root, file)), { recursive: true }); await writeFile(resolve(root, file), JSON.stringify(data, null, 2) + '\n', 'utf8'); };

// Added only after viewing each immutable source. The crown is the anatomical
// top of the head, excluding hair ornaments, gear and aura; ground is the boot
// sole line. One source factor is used for every part of the full concept.
export const measurements = {
  'identity-a': {
    sourceSize: [1024, 1536], crownY: 174, groundY: 1461, rootX: 534,
    basis: 'Viewed immutable source at original resolution. Natural upper hair knot/crown opaque edge174–175; faint fringe171 is not used to choose scale. Lower left/lead sole ends1460, world-ground1461; rear/right sole ends1442 due southeast perspective. Two boot centres about400/668 give root534; not the full alpha/long-hair bbox centre.',
    assessment: 'Nhận diện mới tóc đen buộc nửa, lọn mái lệch và mặt/đôi tay mới; không ghép đầu hoặc pixel da từ live. Áo nền than–ngà và boot neutral. Tóc vẫn chiếm mảng lớn ở1× theo hướng compact; thân/face cần owner chốt, chiều cao80 không chứng minh toàn anatomy đã duyệt. Hai đế giày lệch sâu theo góc Đông Nam, root giữa chân và ground lấy đế thấp. Alpha nguồn mềm quanh tóc/áo được giữ, không vẽ lại.'
  },
  'identity-b': {
    sourceSize: [1024, 1536], crownY: 170, groundY: 1427, rootX: 512,
    basis: 'Viewed immutable source at original resolution. Natural silver upper knot starts169–172; crown170 chosen at dense hair edge. Lower right boot sole ends1426, ground1427; left boot is aboutone source shoe-grid row shallower from southeast view. Boot centres approximately400/624 support root512. Faint alpha1 spill up to48 and down1509 excluded from anatomy anchors but source alpha remains retained.',
    assessment: 'Nhận diện mới tóc bạc buộc cao, hai lọn rủ và mày/mắt sắc; mặt, tay, áo và boot đều từ nguồn mới. Hai đế giày lệch sâu theo Đông Nam, đo ground từ đế thấp. Tóc bạc và áo ngà có tương phản mực giữ silhouette; lớp alpha mềm rất nhạt ngoài hair/boot còn trong raw/native, không dùng để fit cỡ người. Chưa kết luận anatomy/style hay ART được duyệt.'
  },
  'sword-a': {
    sourceSize: [1024, 1536], crownY: 166, groundY: 1464, rootX: 566,
    basis: 'Viewed source original. Natural upper hair knot/crown dense edge166–167, soles: lower/left boot ends1463 at alpha128 (1462 dense), worldground1464. Right/rear boot is a little shallower. Left boot centre about417/right716, root566. Sword tip near1440 is not used to measure boots. Faint alpha spill0..1017/49..1501 retained but excluded from anatomy scale.',
    assessment: 'Tạo hình kiếm tu Huyền Mặc toàn thân mới bám nhận diện tóc đen A, áo xẻ lệch mực–ngà, viền kim trầm và đai cổ; tay trái thực sự cầm kiếm hạ, tay phải riêng. Kiếm và bao/đai được bake vào concept, chưa là body/weapon riêng hoặc socket grip sản xuất. Vạt/chi tiết cổ kim đọc gọn ở1×; không ghép đầu live. Đế thấp dùng để đăng ký người, không lấy mũi kiếm.'
  },
  'chariot-a': {
    sourceSize: [1024, 1536], crownY: 233, groundY: 1446, rootX: 399,
    basis: 'Viewed source original. Dense natural hair/crown233–235; lower/left human boot sole ends1445(alpha128), ground1446. Right/rear boot endsabout1427; human boot centres~222/576 give root399. Device spikes/cast feet are excluded from human anchors; device spike denseedge1016 stays inside rawcanvas (not core clipped). Extremely faint spilltop51 and bottom1535 retained independently of body measurement.',
    assessment: 'Nhân vật Cổ Kim toàn thân mới với một vai đồng cũ, đai niêm lớn, găng/xích và thế chân vững; thiết bị thu gọn đứng cạnh người, không bị cầm một tay. Vật liệu đồng/than hợp A, tóc/mặt mới cùng master. Xích ở găng là đoạn slack nhìn rõ nhưng đường liên tục từ găng tới máy chưa được chứng minh; grip/socket/triển khai cần concept/prototype tiếp. Mũi máy sát biên raw nhưng alpha core vẫn có6px nguồn, native giữ tất cả alpha và cỡ người80 bằng một factor.'
  },
  'banner-a-r2': {
    sourceSize: [1254, 1254], crownY: 327, groundY: 1221, rootX: 552,
    basis: 'Viewed targeted wider-canvas r2 original. Natural hair/crown first dense pixels327 at x471..509; left/lead bootsole ends1220, ground1221. Boot centres about429/675 supportroot552. Pole/flag tip28 and clothbottom are excluded from body measurement. Alpha128 sourcebounds226..1015/28..1220 show completeflag with large rightmargin; all four sourcecoreedges0. A single80/894 scale registers completecharacterandgear; wider rawcanvas is transparent padding, not a smaller human at native.',
    assessment: 'Bản r2 mở đủ khăn cờ và mũi/chuôi phiên, thay nguồn r1 bị cắt thật ở cạnh phải; r1 giữ nguyên lịch sử. Nhân vật U Tế toàn thân A với áo nghi lễ than–đỏ, ba mảng niêm lớn, tay phải giữ cán và vai nghiêng theo phiên. Cờ/nhân vật bake trong concept, chưa phất phiên/motion/socket. Không ghép đầu live, không cắt/đổ lại alpha; có fringe cực nhạt/màu cạnh nguồn ở zoom lớn, native giữ nguồn thật và toàn bộ silhouette.'
  },
  'bead-a': {
    sourceSize: [1024, 1536], crownY: 184, groundY: 1461, rootX: 543,
    basis: 'Viewed immutable original. Natural hair/crown184–187, lower/left bootsole ends1460(alpha128)/1459dense; ground1461. Two boot centres about408/678 give root543. Bead near836,773 is a small stone held at raised right fingers, roughly50sourcepx/3nativepx; it never defines body scale or root. Faint alpha19..1509 and left0 retained but excluded from anatomy measurement.',
    assessment: 'Thạch Châu toàn thân mới A với áo du hành xám–ngọc, nếp vai/khăn lệch và cuff có một vân lớn; bàn tay phải thực sự nâng đá châu xám nhỏ. Châu đọc khoảng3px ở native1×, nên dấu mây nhỏ là gợi hình, không chứng minh đếm được năm vân; xem raw để chọn thiết kế. Châu không phóng thành cầu phát sáng, thân/áo mới không ghép pixel live; nội cảnh/FX sẽ ở board hoặc lớp sản xuất riêng.'
  },
  'sword-b': {
    sourceSize: [1024, 1536], crownY: 122, groundY: 1479, rootX: 494,
    basis: 'Viewed source original. Natural silver upperknot/crown denseedge122–123. Lower/left humanbootsole ends1478(alpha128/220), worldground1479. Humanboot centres~346/642 give root494. Blade tip near1472 is above lower sole and explicitly not used as foot/root. Faint halo57..1487/left0 retained; all source core edges0. One80/1357 factor applies robe, face, hair, boots and sword together.',
    assessment: 'Vân Ngọc toàn thân B với tóc bạc buộc cao, áo ngà/cổ và đai thanh ngọc, cuff/giày lam xám và kiếm thẳng sáng hạ chéo. Tay trái thực sự giữ chuôi, tay phải riêng; mặt/tay/tóc mới từ source matchingmaster, không ghép live. Mũi kiếm gần ground nhưng không phải chân; figure cùng nominal80. Chi tiết guard ngọc/bao kiếm là thiết kế mới, chưa production layer/socket/motion hoặc owner ART.'
  },
  'banner-b': {
    sourceSize: [1024, 1536], crownY: 347, groundY: 1483, rootX: 449,
    basis: 'Viewed raw original. Silver upper hair knot first denseedge347 atx340..347, independently measured below tallflag tip50. Lower/left humanbootsole ends1482, worldground1483; boots span~234..337 and524..700, centres286/612 supportroot449. Polebottom around1410 is explicitly not sole/root. One80/1136 factor retains completeperson andflag; sourcecoreedgesall0, alpha1 fringe0..1009/5..1535 remains retained.',
    assessment: 'Tàn Nguyệt toàn thân B: tóc bạc, áo tro ngà/tím trầm, ba mảng niêm và tay phải thực sự giữ cán. Cờ/đầu phiên/boots đầy đủ, mặt/tay trước không che. Phiên vươn cao làm người đứng thấp trong source; đo body bằng crown/boots, không thu người theo wholeflagbbox hoặc lấy đáy cán làm chân. Nguồn halo tóc bạc còn mềm ở1×; chưa motion/grip/socket tách lớp hoặc ART approval.'
  },
  'chariot-b': {
    sourceSize: [1024, 1536], crownY: 165, groundY: 1444, rootX: 435,
    basis: 'Viewed raw original. Natural silver hair/crown denseedge165–166; lower/left humanbootsole ends1443, worldground1444. Boot spansabout216..323 and526..675, centres270/600 supportroot435. Device spikes/fabricbottom/standingfeet excluded from anatomy; densegearright1011 staysinsidecanvas with12px margin, allsourcecoreedges0. One80/1279 factor applies full armor, person,chain andengine.',
    assessment: 'Lôi Huyền toàn thân B với vải lam xám/huyền thiết, xích bạc nối găng tới pháp khí cạnh người và thế chân vững; xe không cầm/nâng bằng một tay. AI mở giáp từ một vai xuống cả cánh tay và thêm chân giáp, nặng hơn brief một vai; giữ đây là một option tạo hình, cần owner chọn mức giáp. Mặt/tóc/tay mới theo master B, không ghép live. Root lấy đôi boots/người, không dùng bánh/gai/đáy vải của máy; triển khai/thu máy/motion chưa có.'
  },
  'bead-b': {
    sourceSize: [1024, 1536], crownY: 174, groundY: 1487, rootX: 531,
    basis: 'Viewed raw original. Natural silverhair/crown denseedge174–175, lower/left bootsole ends1486, worldground1487. Bootspans346..457 and579..741 supportroot531. Tinycarvedgraystone atpalm near869,813 about75sourcepx/~5nativepx is excluded from human scale. One80/1313 factor preservesperson, cloak and bead; allsourcecoreedges0, faintalpha65..1489/left0 retained.',
    assessment: 'Vân Tịch toàn thân B: tóc bạc, áo ngà/khăn du hành lam xám, đai/thẻ gọn và bàn tay nâng đá châu xám cổ nhỏ. Đá khoảng5px ở1×, vân mây đọc như motif nhưng không chứng minh đủ năm dấu ở native; ảnh lớn để chọn khắc đá. Không cầu laser hoặc FX bake vào body theo yêu cầu, không ghép đầu live. Alpha tóc bạc mềm từ nguồn giữ nguyên; hộ đạo/nội cảnh là directionboard riêng, chưa motion/socket/ART.'
  }
};

const boardAssessments = {
  'sword-aoe': 'Đã xem raw: panel trái minh họa một đòn một mục tiêu; panel lớn có kiếm linh lớn sau người, cọc kiếm hai bên và ba hành lang đen–ngà tác động nhiều địch; bốn panel dưới là báo vùng/cọc dựng/phát/tan. Tuyến trong hình đọc chủ yếu song song chéo, chưa thể hiện rõ ba đường giao nhau như đề xuất. Peak có khoảng bốn địch đọc rõ, panel báo vùng có năm; một số cọc/thân bị che. Đây là concept bố cục/nhịp, không phải bốn frame animation đã đăng ký hoặc bằng chứng collider/timing thực.',
  'banner-aoe': 'Đã xem raw: một dải hồn đơn mục tiêu ở panel trái; peak là ba cổng khăn-hồn bố trí một cao sau/hai thấp trước, linh thể ngà có silhouette người và dòng mực/chỉ đỏ đi qua nhóm năm địch đọc rõ. Tâm có khoảng trống, người phất phiên ở cạnh sân còn thấy tay/face; không chỉ là đám mây hoặc vòng sáng phóng lớn. Bốn panel dưới thể hiện dấu báo vị trí/cổng mở/dòng hội tụ/thu khí. Cấu trúc khung-cổng và niêm đỏ là chuyển thể, không tuyên bố vật thể/canon hoặc collider đã xác nhận; số địch thực trong peak năm thay vì sáu của brief.',
  'chariot-aoe': 'Đã xem raw: ST ở trái nối tay/xích/máy tới một contact; peak là khung xa lớn sau người, thú sừng mực có trọng lượng chạm đất, hai rail xích chéo, ba contact địa lôi giữa nhóm khoảng sáu địch đọc rõ và khe hai bên. Bốn panel dưới phân biệt báo rail/contact, khóa xích/thú, dậm phát, rút thú. Bộ hình tổng hợp cảm hứng dạng Xạ Thần Xa, không khẳng định mọi chi tiết là một dạng nguyên tác; đây là concept vùng/nhiều contact chứ chưa có animation, ground collider, server hit hoặc balancedamage.',
  'sword-progression': 'Đã xem raw: ba nhân vật tóc đen A ở cùng sàn/cỡ tương đối, từ áo vải gọn/kiếm thường tới áo Huyền Mặc + kiếm linh/ba kiếm hỗ trợ rồi áo cô đọng + miền cọc kiếm. Ba study dưới là vải/kiếm-linh/cấu trúc miền. Kiếm linh có silhouette khí dạng long ảnh trong hình; đây là đề xuất động hình kiếm linh, không chân dung người Hứa Lập Quốc canon. Các mốc thị giác và cảnh giới là đề xuất phát triển, không tự cấp trọng bảo sớm hoặc chốt lịch mở khóa.',
  'banner-progression': 'Đã xem raw: tiền thân áo vải/phiên giản dị, sau là U Tế + hai linh ảnh đỏ/ngà, rồi áo nghi lễ cô đọng/khung phiên lớn/ba cổng. Hai linh ảnh stage2 mang dạng long ảnh chứ không là chân dung chủ hồn người; dạng này là đề xuất thị giác, AOE board khác dùng hồn người. Nhân vật stage1 trong board cao ít hơn khoảng20% so stage2/3; các figure là minh họa chặng, chưa registration cùng80px và không đề xuất tăng runtime scale. Native neutral toàn thân giữ80 bằng đo nguồn riêng. Mốc cảnh giới/nhận bảo chưa khóa.',
  'chariot-progression': 'Đã xem raw: tiền thân áo vải/cuốn thẻ gỗ nhỏ, sau là áo một vai đồng/engine thu gọn/xích/thú bị giữ, rồi người điều khiển áo cô đọng trước khung máy lớn có ba linh diện thú. Các figure có cỡ tương đối/cùng nền chân, chưa registered80 trong board. Khung stage3 đọc như trận cơ/đàn máy hơn xe mang theo; đây là đề xuất chuyển thể tổng hợp cần chốt cơ chế triển khai và thu gọn, không xác nhận ba thú entity hoặc một dạng nguyên tác. Ba study dưới gồm vải/thẻ, giáp đồng+xích/thú, cấu trúc máy lớn.',
  'bead-progression': 'Đã xem raw: người A vẫn nâng đá châu nhỏ qua ba chặng áo vải thô, áo du hành xám–ngọc, áo ngà/cloud mantle cô đọng; stage3 môi trường mở rộng với địa hình treo/lá và nội cảnh chồng. Ba study dưới là vải/đá châu+dấu mây chuyểnglyph/không gian nội cảnh. Cỡ người tương đối giữ gần nhau trên sàn, nhưng đây không là native80 registration ba pose. Cloud/glyph chỉ gợi thiết kế, không xác nhận đúng mười dấu hoặc ký tự canon; nội cảnh ngoài sân là đề xuất hộ đạo/control, không gán thành chiêu laser hoặc damage trong truyện.',
  'bead-aoe': 'Đã xem raw: ST ở trái là nếp giới tại một điểm; peak là đường gấp chéo phân sân thường với nội cảnh núi mực, lá treo và nhiều temporal silhouettes của A trong nền. Ba allyanchors có vòng trú, thêm một vòng quanh caster; bốn địch ngoài nếp đọc rõ thay vì năm brief. Bốn panel dưới báo nếp, điểm trú ổn định, nội cảnh mở, khép lại. Đá châu vẫn nhỏ; nhân vật/địch còn đọc được, không cầu laser/explosion. Mọi nếp giới ngoài sân/hộ đạo/timeecho là chuyển thể hỗ trợ/control, chưa là năng lực tấn công ngoài thực tại canon hoặc entity/gameplay đã chốt.'
};

function alphaBounds(data, width, height, threshold = 1) {
  let left = width, top = height, right = -1, bottom = -1, pixels = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] < threshold) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); pixels++;
  }
  return right < 0 ? null : { left, top, width: right - left + 1, height: bottom - top + 1, right, bottom, pixels };
}

function resampleRegistered(data, width, height, measurement) {
  const scale = bodyHeight / (measurement.groundY - measurement.crownY);
  const frameCanvas = measurement.canvas || canvas, framePivot = measurement.pivot || pivot;
  if (!(scale > 0 && scale <= 1)) throw new Error('Invalid anatomical source scale');
  const out = Buffer.alloc(frameCanvas[0] * frameCanvas[1] * 4);
  // Exact isotropic inverse mapping, nearest-neighbour centres. No separate
  // width/height fit and no component/pose fit. Source alpha is retained.
  for (let y = 0; y < frameCanvas[1]; y++) for (let x = 0; x < frameCanvas[0]; x++) {
    const sx = Math.floor((x + 0.5 - framePivot[0]) / scale + measurement.rootX);
    const sy = Math.floor((y + 0.5 - framePivot[1]) / scale + measurement.groundY);
    if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
    data.copy(out, (y * frameCanvas[0] + x) * 4, (sy * width + sx) * 4, (sy * width + sx) * 4 + 4);
  }
  const sourceBounds = alphaBounds(data, width, height);
  if (sourceBounds) {
    const left = (sourceBounds.left - measurement.rootX) * scale + framePivot[0];
    const top = (sourceBounds.top - measurement.groundY) * scale + framePivot[1];
    const right = (sourceBounds.right + 1 - measurement.rootX) * scale + framePivot[0];
    const bottom = (sourceBounds.bottom + 1 - measurement.groundY) * scale + framePivot[1];
    if (left < 1 || top < 1 || right > frameCanvas[0] - 1 || bottom > frameCanvas[1] - 1) {
      throw new Error(`Source does not fit padded canvas without clipping: ${JSON.stringify({ left, top, right, bottom })}`);
    }
  }
  return { data: out, scale, canvas: frameCanvas, pivot: framePivot, bounds: alphaBounds(out, ...frameCanvas), sourceBounds };
}

const plan = await exists(resolve(root, 'plan.json')) ? await readJSON('plan.json') : { identities: [], families: [] };
const generation = await exists(resolve(root, 'generation.json')) ? await readJSON('generation.json') : { requests: [] };
const requests = new Map((generation.requests || []).map(request => [request.id, request]));
const expectedIdentities = plan.identityMasters || plan.identities || [];
const expectedFamilies = plan.families || [];
const pending = [], records = [], sourceInspection = [];
await mkdir(resolve(root, 'concepts/native'), { recursive: true });

function requestFor(spec) {
  const id = spec.requestId || spec.sourceId || (spec.image && basename(spec.image, '.png')) || spec.id;
  return requests.get(id) || { id, raw: `sources/${id}.png`, prompt: `sources/${id}.prompt.txt`, inputs: [] };
}

async function inspectSource(spec, role) {
  const request = requestFor(spec);
  const raw = request.raw || `sources/${request.id}.png`;
  if (!(await exists(resolve(root, raw)))) { pending.push(request.id); return null; }
  const bytes = await readFile(resolve(root, raw));
  if (request.sha256 && sha(bytes) !== request.sha256) throw new Error(`Source hash mismatch: ${request.id}`);
  const metadata = await sharp(bytes).metadata();
  const rgba = await sharp(bytes).ensureAlpha().raw().toBuffer();
  const alpha = { empty: 0, soft: 0, opaque: 0 };
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] === 0) alpha.empty++; else if (rgba[i] === 255) alpha.opaque++; else alpha.soft++;
  }
  const sourceCoreEdges = { top: 0, right: 0, bottom: 0, left: 0 };
  for (let x = 0; x < metadata.width; x++) {
    if (rgba[x * 4 + 3] >= 128) sourceCoreEdges.top++;
    if (rgba[((metadata.height - 1) * metadata.width + x) * 4 + 3] >= 128) sourceCoreEdges.bottom++;
  }
  for (let y = 0; y < metadata.height; y++) {
    if (rgba[(y * metadata.width) * 4 + 3] >= 128) sourceCoreEdges.left++;
    if (rgba[(y * metadata.width + metadata.width - 1) * 4 + 3] >= 128) sourceCoreEdges.right++;
  }
  const inspection = { id: request.id, role, raw, sha256: sha(bytes), sourceSize: [metadata.width, metadata.height], sourceChannels: metadata.channels, hasAlpha: metadata.hasAlpha || false, alpha, sourceBounds: alphaBounds(rgba, metadata.width, metadata.height), sourceCoreEdges, manual: measurements[request.id] || null, boardAssessment: boardAssessments[request.id] || null };
  sourceInspection.push(inspection);
  return { request, bytes, metadata, rgba, inspection };
}

async function packCharacter(spec, role, familyId = null) {
  const source = await inspectSource(spec, role);
  if (!source) return null;
  const { request, metadata, rgba, inspection } = source;
  if (Object.values(inspection.sourceCoreEdges).some(count => count > 0)) { pending.push(`${request.id}:core-source-clipping`); return null; }
  const measured = measurements[request.id];
  if (!measured) { pending.push(`${request.id}:manual-registration`); return null; }
  if (measured.sourceSize[0] !== metadata.width || measured.sourceSize[1] !== metadata.height) throw new Error(`Measured source dimensions changed: ${request.id}`);
  const registered = resampleRegistered(rgba, metadata.width, metadata.height, measured);
  const nativeFile = spec.nativeImage || `concepts/native/${spec.id}.png`;
  await sharp(registered.data, { raw: { width: registered.canvas[0], height: registered.canvas[1], channels: 4 } }).png().toFile(resolve(root, nativeFile));
  const nativeBytes = await readFile(resolve(root, nativeFile));
  const record = {
    ...spec, id: spec.id, familyId, role, requestId: request.id,
    identityId: spec.identityId || spec.identity || null, palette: spec.palette || spec.colors || [],
    file: request.raw, image: request.raw, raw: request.raw, nativeFile, nativeImage: nativeFile,
    prompt: request.prompt, inputs: request.inputs || [], original: request.original || null,
    sourceSha256: inspection.sha256, sha256: inspection.sha256, nativeSha256: sha(nativeBytes),
    sourceSize: inspection.sourceSize, canvas: registered.canvas, pivot: registered.pivot, bodyHeight,
    registration: { crownY: measured.crownY, groundY: measured.groundY, rootX: measured.rootX, scale: registered.scale, measurementBasis: measured.basis, bodyMeasurementIncludesGear: false, nativeCrownY: registered.pivot[1] - bodyHeight, nativeGroundY: registered.pivot[1] },
    bounds: registered.bounds, sourceBounds: registered.sourceBounds,
    assessment: measured.assessment, identityRestoredFromLive: false,
    clothingGearBakedInConcept: true, transparentSourceAlphaPreserved: true,
    pixelsResampled: true, pixelsModified: false,
    status: 'static-concept-candidate', ownerApproved: false, artApproved: false, runtimeReady: false,
    motionReady: false, directionalCoverage: ['southeast'], animationClips: 0
  };
  records.push(record);
  return record;
}

async function packBoard(spec, role, familyId) {
  if (!spec) return null;
  if (typeof spec === 'string') spec = { id: basename(spec, '.png'), image: spec };
  const source = await inspectSource(spec, role);
  if (!source) return null;
  const { request, inspection } = source;
  const record = {
    ...spec, id: spec.id, familyId, role, requestId: request.id,
    file: request.raw, raw: request.raw, image: request.raw, prompt: request.prompt,
    identityId: 'a', illustratedIdentityId: 'a', illustratedIdentityName: 'Huyền Tâm', applicability: 'shared-mechanic-direction; identity A illustrated; identity B progression/battle artwork remains a future adaptation after concept selection',
    inputs: request.inputs || [], sourceSize: inspection.sourceSize, sha256: inspection.sha256,
    status: 'static-direction-board-candidate', ownerApproved: false, artApproved: false,
    runtimeReady: false, animationClips: 0,
    assessment: boardAssessments[request.id] || 'Bảng hướng thị giác tĩnh; cần owner xem và chốt concept trước đặc tả motion, footprint và gameplay.',
    limitations: ['Bảng ý tưởng tĩnh; các cột là thiết kế/mốc phát triển, không phải frame animation.', 'Kích thước phạm vi AOE, nhịp chiến đấu, damage và gameplay chưa được khóa.']
  };
  records.push(record);
  return record;
}

const identities = [];
for (const spec of expectedIdentities) {
  const record = await packCharacter(spec, 'identity-master');
  if (record) identities.push(record);
}
const families = [], options = [], boards = [];
for (const spec of expectedFamilies) {
  const familyOptions = [];
  for (const option of spec.options || []) {
    const record = await packCharacter(option, 'equipment-character-concept', spec.id);
    if (record) { options.push(record); familyOptions.push(record); }
  }
  const progressionBoard = await packBoard(spec.progressionBoard || spec.progression, 'progression-board', spec.id);
  const battleBoard = await packBoard(spec.battleBoard || spec.battle, 'battle-aoe-board', spec.id);
  if (progressionBoard) boards.push(progressionBoard);
  if (battleBoard) boards.push(battleBoard);
  families.push({ ...spec, options: familyOptions, progressionBoard, battleBoard, combatBoard: battleBoard });
}
// Correction requests retain the first immutable source and its real edge
// evidence; they do not overwrite or disguise an incomplete first candidate.
for (const request of generation.requests || []) {
  if (request.status?.startsWith('superseded')) await inspectSource({ id: request.id, sourceId: request.id }, 'superseded-source-history');
}

const manifest = {
  schema: 'wang-lin-concept-direction-5', version: 5, title: plan.title || 'Concept nhân vật và pháp bảo · V5',
  scope: 'character-concepts-and-static-progression-aoe-direction-boards', canvas, pivot, bodyHeight,
  liveReference: plan.liveReference || { file: 'inputs/wang-lin-live-southeast-native.png', nominalBodyHeight: 80 },
  policy: {
    liveUsedFor: ['human scale', 'pixel style', 'anatomy reference'],
    fullCharacterIsNew: true, oldFaceHairPatchAllowed: false,
    characterGearMayBeBakedInStaticConcept: true, productionBodyGearFXSeparationRequiredLater: true,
    uniformScalePerSource: true, canvasIsPadding: true, noRuntimeIntegration: true
  },
  identities, identityMasters: identities, families, options, boards,
  sourceCount: sourceInspection.filter(source => source.role !== 'superseded-source-history').length,
  sourceHistoryCount: sourceInspection.length, generatedSourceCount: (generation.requests || []).filter(request => request.sha256).length,
  nativeCount: identities.length + options.length,
  optionCount: options.length, boardCount: boards.length, pending,
  status: pending.length ? 'partial-concept-review' : 'concept-candidate-ready-for-owner-selection',
  ownerApproved: false, artApproved: false, runtimeReady: false, motionReady: false,
  approvalsInferredFromPreviousPins: false
};
await writeJSON('manifest.json', manifest);
  await writeJSON('registration.json', { schema: 'wang-lin-concept-registration-5', canvas, pivot, bodyHeight, method: 'Manual anatomical crown/boot measurement; one exact isotropic nearest-neighbour factor per source; no pixel identity patch, recolour, component fit or creative edit.', records: records.filter(record => record.nativeFile).map(record => ({ id: record.id, raw: record.raw, nativeFile: record.nativeFile, sourceSha256: record.sourceSha256, nativeSha256: record.nativeSha256, sourceSize: record.sourceSize, canvas: record.canvas, pivot: record.pivot, registration: record.registration, sourceBounds: record.sourceBounds, bounds: record.bounds, assessment: record.assessment })), pending });
await writeJSON('review/source-inspection.json', { schema: 'wang-lin-concept-source-inspection-5', sources: sourceInspection, pending, liveIdentityCopied: false, colorEditsPerformed: false, staticConceptOnly: true });
if (pending.length && !partial) throw new Error(`Pending sources/measurements: ${pending.join(', ')}`);
console.log(JSON.stringify({ sources: manifest.sourceCount, native: manifest.nativeCount, options: options.length, boards: boards.length, pending }, null, 2));
