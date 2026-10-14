import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async file => JSON.parse(await readFile(resolve(root, file), 'utf8'));
const quote = '- Về nhận vật làm cả 2 nhân vật Huyễn Tâm và Tịch Bạch\n- Còn về cocept của Kiếm linh, Hồn phiên, Xạ Thần Xa, Thiên Ngịch Châu đều đẹp và tốt. tôi duyệt giờ cần bạn có kế hoạch triển khai';
const guardFiles = ['pack.mjs', 'record-source.mjs', 'prepare.mjs', 'correct-banner-framing.mjs', 'finalize-delivery.mjs'];
const guardMessage = 'Concept approval locks this V5 source package; create a new production package.';

if (existsSync(resolve(root, 'approval.json'))) {
  const existing = await json('approval.json');
  if (existing.ownerInstruction !== quote || existing.date !== '2026-10-14') throw new Error('Existing approval differs; never replace a source approval.');
  console.log(JSON.stringify({ recorded: false, existingApproval: true, pinnedFiles: existing.files.length, next: 'verify-approval.mjs' }));
} else {
  const [m, g, delivery, asset, lineage, browser] = await Promise.all([
    json('manifest.json'), json('generation.json'), json('review/delivery.json'),
    json('review/asset-verification.json'), json('review/lineage-verification.json'), json('review/browser-verification.json')
  ]);
  if (m.pending.length || m.identities.length !== 2 || m.optionCount !== 8 || m.boardCount !== 8 || m.nativeCount !== 10 || !asset.passed || !lineage.passed || !browser.passed) throw new Error('Incomplete source delivery.');
  const selected = g.requests.filter(r => r.status === 'generated-preview');
  const history = g.requests.filter(r => r.status === 'superseded-framing');
  if (selected.length !== 18 || history.length !== 1 || history[0].id !== 'banner-a') throw new Error('Unexpected selection or source history.');
  const sources = [];
  for (const r of selected) {
    if (sha(await readFile(resolve(root, r.raw))) !== r.sha256 || sha(await readFile(resolve(root, r.prompt))) !== r.promptSha256) throw new Error(`Source hash mismatch: ${r.id}`);
    for (const input of r.inputs) if (sha(await readFile(resolve(root, input.file))) !== input.sha256) throw new Error(`Input hash mismatch: ${r.id}/${input.file}`);
    sources.push({ id: r.id, kind: r.kind, file: r.raw, sha256: r.sha256, prompt: r.prompt, promptSha256: r.promptSha256, inputs: r.inputs, scope: 'approved-static-concept', ownerApproved: true, conceptApproved: true });
  }
  const nativePreviews = [...m.identities, ...m.options].map(r => ({ id: r.id, file: r.nativeFile, sha256: r.nativeSha256, source: r.raw, sourceSha256: r.sourceSha256, scope: 'approved-concept-scale-preview; not production neutral/view/motion' }));
  if (nativePreviews.length !== 10) throw new Error('Native concept preview coverage differs.');
  const paths = new Set(['basis.json', 'brief.json', 'plan.json', 'manifest.json', 'generation.json', 'registration.json', 'verify-assets.mjs', 'verify-lineage.mjs', 'record-approval.mjs', 'verify-approval.mjs', ...guardFiles]);
  async function walk(dir) {
    for (const d of await readdir(resolve(root, dir), { withFileTypes: true })) {
      const file = `${dir}/${d.name}`;
      if (d.isDirectory()) await walk(file); else paths.add(file);
    }
  }
  for (const dir of ['sources', 'inputs', 'concepts/native', 'review/screenshots']) await walk(dir);
  for (const file of ['review/delivery.json', 'review/source-inspection.json', 'review/asset-verification.json', 'review/lineage-verification.json', 'review/browser-verification.json']) paths.add(file);
  const oldHashes = new Map(delivery.files.map(f => [f.file, f.sha256]));
  const files = [];
  for (const file of [...paths].sort()) {
    const bytes = await readFile(resolve(root, file)), hash = sha(bytes);
    if (oldHashes.has(file) && !guardFiles.includes(file) && oldHashes.get(file) !== hash) throw new Error(`Pre-approval bytes changed: ${file}`);
    if (guardFiles.includes(file) && !bytes.toString('utf8').includes(guardMessage)) throw new Error(`Missing source write guard: ${file}`);
    files.push({ file, sha256: hash, ...(guardFiles.includes(file) ? { preApprovalSha256: oldHashes.get(file), permittedChange: 'source-writing entry point refuses mutation after approval.json exists' } : {}) });
  }
  const approval = {
    schema: 'wang-lin-concept-approval-5', date: '2026-10-14', timezone: 'Asia/Bangkok',
    source: 'explicit owner message in this chat', ownerInstruction: quote,
    ownerApproved: true, conceptApproved: true, artApproved: true,
    approvedArtScope: 'V5 static character, equipment, progression and single-target/AOE visual concepts pinned below',
    identities: [{ id: 'a', name: 'Huyễn Tâm', sourceName: 'Huyền Tâm', nameAliasOnly: true }, { id: 'b', name: 'Tịch Bạch', sourceName: 'Tịch Bạch' }],
    requestedProductionIdentities: ['a', 'b'],
    families: [{ id: 'sword', name: 'Kiếm linh' }, { id: 'banner', name: 'Hồn phiên' }, { id: 'chariot', name: 'Xạ Thần Xa' }, { id: 'bead', name: 'Thiên Nghịch Châu' }],
    coverage: { identityMasters: 2, outfitConcepts: 8, progressionBoards: 4, singleTargetAoeBoards: 4, selectedSources: 18, nativeConceptPreviews: 10, historicalSourcesExcludedFromArtApproval: 1, animationClips: 0, directionalProductionViews: 0 },
    continuity: 'Both identities are to be produced. Existing progression and combat boards illustrate identity a; they approve the shared visual direction, not nonexistent identity b battle/progression artwork.',
    liveRole: 'Vương Lâm Pixel02 is scale, human proportions and pixel style reference only; the two approved characters have their own face, hair, costume and gesture concepts.',
    sourceLock: { immutableBasis: true, useNewPackageForProduction: true, historicalManifestStatusPreserved: true, guardFiles, report: 'review/approval-verification.json' },
    productionArtApproved: false, motionApproved: false, vfxProductionApproved: false, gameplayBalanceApproved: false, runtimeApproved: false, runtimeIntegrated: false,
    scopeLimits: ['Static concept approval does not approve future neutral production, eight directional views, body animation, production FX sequences or sockets.', 'AOE direction is approved; numerical ranges, damage, MP, cooldown, timing, acquisition and progression gates remain implementation work.', 'No automatic live actor replacement, gameplay integration, map, DB or save changes.'],
    selectedSources: sources, nativePreviews,
    history: history.map(r => ({ id: r.id, file: r.raw, sha256: r.sha256, prompt: r.prompt, promptSha256: r.promptSha256, replacedBy: r.replacedBy, retainedForLineage: true, artApproved: false, reason: 'Original banner cloth framing clipped the canvas; approved successor is banner-a-r2.' })),
    evidence: { delivery: 'review/delivery.json', sourceInspection: 'review/source-inspection.json', asset: 'review/asset-verification.json', lineage: 'review/lineage-verification.json', browser: 'review/browser-verification.json', technicalChecksAreNotApproval: true },
    files
  };
  await writeFile(resolve(root, 'approval.json'), JSON.stringify(approval, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ recorded: true, conceptApproved: true, selectedSources: sources.length, nativeConceptPreviews: nativePreviews.length, pinnedFiles: files.length, historyExcludedFromArtApproval: history.length, motionApproved: false, runtimeApproved: false }));
}
