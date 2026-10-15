// Read-only consistency checks for the current GDD documents, not runtime/balance tests.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'docs/GDD-035-UNIFIED-CONTRACT.md',
  'docs/GDD.md',
  'docs/MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md',
  'docs/STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md',
  'docs/STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md',
  'docs/XIANXIA-MARKET-STORY-REFERENCES-2026-10-14.md',
  'docs/UI-UX-HUD-REFERENCE-DIRECTION-2026-10-15.md',
  'docs/WANG-LIN-IMPLEMENTATION-PLAN.md',
  'docs/HANG-NHAC-DAO-AN-V3.md',
  'docs/REVIEW-GDD-0.35-2026-10-15.md',
  'docs/ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md',
  'docs/ASSET-PLAN.md',
  'docs/README.md',
  'docs/design/README.md',
  'docs/ITEM-PRODUCTION-PLAN.md',
  'docs/ITEM-CRAFTING-DESIGN.md',
  'docs/HANG-NHAC-VAN-NGOC-ASSET-PLAN.md',
  'docs/design/systems/items-v1/README.md',
  'docs/archive/asset-plans-before-gdd-035-2026-10-15/README.md',
  'docs/archive/asset-plans-before-gdd-035-2026-10-15/ASSET-PLAN.md',
  'docs/archive/asset-plans-before-gdd-035-2026-10-15/ITEM-PRODUCTION-PLAN.md',
  'docs/archive/asset-plans-before-gdd-035-2026-10-15/ITEM-CRAFTING-DESIGN.md',
  'docs/archive/asset-plans-before-gdd-035-2026-10-15/HANG-NHAC-VAN-NGOC-ASSET-PLAN.md',
  'docs/design/systems/item-material-catalog-gdd035-v1/README.md',
  'docs/design/systems/item-material-catalog-gdd035-v1/item-coverage-notes.md',
  'docs/design/systems/item-material-catalog-gdd035-v1/asset-audit-notes.md',
  'docs/design/systems/item-material-catalog-gdd035-v1/recipes-source-notes.md',
];
const read = p => fs.readFileSync(path.resolve(root, p), 'utf8').replace(/\r\n/g, '\n');
const texts = new Map(files.map(p => [p, read(p)]));
let checks = 0, links = 0, anchors = 0;
function check(ok, label) { assert.ok(ok, label); checks++; }
const slug = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
function headings(text) {
  const found = new Set(), seen = new Map();
  let inFence = false;
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence || !/^#{1,6} /.test(line)) continue;
    const base = slug(line.replace(/^#{1,6} /, ''));
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1); found.add(n ? `${base}-${n}` : base);
  }
  return found;
}
for (const [file, text] of texts) {
  check((text.match(/^```/gm)?.length ?? 0) % 2 === 0, `${file}: unclosed code fence`);
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
    const url = m[1];
    if (/^[a-z][a-z\d+.-]*:/i.test(url)) continue;
    const [target, fragment] = url.split('#');
    const dest = target ? path.resolve(root, path.dirname(file), decodeURIComponent(target)) : path.resolve(root, file);
    check(fs.existsSync(dest), `${file}: broken link ${url}`); links++;
    // Validate anchors in the edited set; historical linked packages own their anchors.
    const rel = path.relative(root, dest).replaceAll('\\', '/');
    if (fragment && texts.has(rel)) {
      check(headings(texts.get(rel)).has(decodeURIComponent(fragment)), `${file}: broken anchor ${url}`);
      anchors++;
    }
  }
}
const master = texts.get(files[0]);
const acts = s => s.split('\n').filter(l => /^\| VG\d{2} \|/.test(l));
const canonical = acts(master);
check(canonical.length === 11, 'canonical table must contain exactly 11 acts');
check(new Set(canonical.map(l => l.split('|')[1].trim())).size === 11, 'duplicate act');
canonical.forEach((l, i) => check(l.startsWith(`| VG${String(i + 1).padStart(2, '0')} |`), `act order ${i + 1}`));
assert.deepEqual(acts(texts.get(files[2])), canonical, 'pacing act table drift'); checks++;
assert.deepEqual(acts(texts.get(files[3])), canonical.slice(0, 6), 'stage 1 act table drift'); checks++;
const hours = canonical.map(l => {
  const cells = l.split('|').map(x => x.trim());
  const min = Number(cells.at(-3)), max = Number(cells.at(-2));
  check(Number.isFinite(min) && min > 0 && Number.isFinite(max) && max >= min, `${cells[1]} invalid hours`);
  return [min, max];
});
const sum = rows => rows.reduce((s, r) => [s[0] + r[0], s[1] + r[1]], [0, 0]);
assert.deepEqual(sum(hours.slice(0, 6)), [40.5, 65], 'stage 1 hours'); checks++;
assert.deepEqual(sum(hours.slice(6)), [80, 120], 'stage 2 hours'); checks++;
assert.deepEqual(sum(hours.slice(3, 6)), [26, 41], 'late stage 1 hours'); checks++;

const gdd = texts.get(files[1]), pacing = texts.get(files[2]), stage = texts.get(files[3]), art = texts.get(files[4]);
for (const [name, text] of [['GDD', gdd], ['pacing', pacing], ['stage', stage], ['art', art]]) {
  check(text.includes('GDD-035-UNIFIED-CONTRACT.md'), `${name}: missing contract link`);
  check(!/3–4 Ô Cổ Ấn|2\.\.4 slots|qiPurity \(0\.50\.\.1\.20\)/.test(text), `${name}: stale seal/purity schema`);
  check(!/\*\*1\.000 Tinh Hồn \+ 3 Chủ Hồn|300 Du Hồn/.test(text), `${name}: stale banner gate`);
}
check(/hai nhánh Trúc Cơ|hai đường tầng 12/.test(gdd), 'GDD lacks both foundation routes');
check(/ít nhất hai pháp bảo I \+10/i.test(canonical[5]), 'foundation common refinement gate');
check(/tầng 12/.test(canonical[4]) && /Tùy chọn Cổ Cảnh/.test(canonical[4]), 'VG05 route common access');
check(/1\.000 Tinh Hồn Trúc Cơ/.test(canonical[6]) && /hai chủ hồn/.test(canonical[6]), 'VG07 banner contract');
check(/trước trận/.test(canonical[8]) && /Xa II/.test(canonical[8]), 'VG09 chariot is not available before its encounter');
check(/Châu II trước trận/.test(canonical[9]) && /thứ ba/.test(canonical[9]), 'VG10 pre/post rewards');
check(/mặc định khi solo/.test(canonical[10]), 'VG11 missing guaranteed solo protection');
check(!/72 clip Motion01 \+ Triện Thuật VFX02 đã duyệt/.test(stage), 'overstated Motion01 approval');
check(/Motion01 72 clip còn candidate\/chờ duyệt/.test(stage), 'missing Motion01 scope');
check(!/Tự động lên Ngưng Khí Tầng 2/.test(art), 'old VG01 level grant');
check(art.includes('refinementTotalRank (0..30)'), 'missing inherited refinement schema');
check(master.includes('72 Chu Thiên') && master.includes('99'), 'route cycle totals');
check(master.includes('bất kỳ đầu vào Khóa'), 'binding propagation');
check(master.includes('không chuyển pool thành Tu vi'), 'compression bypass');
check(master.includes('không giảm') && master.includes('hữu hạn'), 'pity guarantee');
const assetPlan = 'ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md';
check(texts.get(`docs/${assetPlan}`).includes('Owner đã đồng ý'), 'asset master plan acceptance missing');
for (const entry of ['docs/README.md', 'docs/design/README.md', 'docs/ASSET-PLAN.md', 'docs/ITEM-PRODUCTION-PLAN.md', 'docs/ITEM-CRAFTING-DESIGN.md', 'docs/HANG-NHAC-VAN-NGOC-ASSET-PLAN.md']) {
  check(texts.get(entry).includes(assetPlan), `${entry}: asset master plan entry missing`);
}
for (const legacy of ['ITEM-PRODUCTION-PLAN.md', 'ITEM-CRAFTING-DESIGN.md', 'HANG-NHAC-VAN-NGOC-ASSET-PLAN.md']) {
  const text = texts.get(`docs/${legacy}`);
  check(text.includes('Ngừng dùng kế hoạch cũ') && text.includes(`archive/asset-plans-before-gdd-035-2026-10-15/${legacy}`), `${legacy}: missing historical redirect`);
}
console.log(JSON.stringify({ status: 'passed', scope: 'document-consistency-only', checks, localLinks: links, checkedAnchors: anchors, acts: 11, stage1Hours: sum(hours.slice(0, 6)), stage2Hours: sum(hours.slice(6)), runtimeIntegrated: false, balanceVerified: false }, null, 2));
