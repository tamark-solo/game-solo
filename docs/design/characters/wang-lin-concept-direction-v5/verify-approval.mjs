import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async file => JSON.parse(await readFile(resolve(root, file), 'utf8'));
const [approval, basis, generation, manifest] = await Promise.all([json('approval.json'), json('basis.json'), json('generation.json'), json('manifest.json')]);
const failures = [], checks = [];
function check(id, passed, detail) { checks.push({ id, passed, detail }); if (!passed) failures.push({ id, detail }); }
const hashFile = async (file, expected) => { try { return sha(await readFile(resolve(root, file))) === expected; } catch { return false; } };
check('explicit-concept-scope', approval.ownerApproved === true && approval.conceptApproved === true && approval.artApproved === true && approval.approvedArtScope.includes('static') && approval.motionApproved === false && approval.vfxProductionApproved === false && approval.runtimeApproved === false && approval.productionArtApproved === false, approval.approvedArtScope);
check('two-approved-identities', approval.identities.map(i => i.id).join('/') === 'a/b' && approval.identities[0].name === 'Huyễn Tâm' && approval.identities[0].sourceName === 'Huyền Tâm' && approval.identities[1].name === 'Tịch Bạch', 'Stable a/b IDs; owner spelling is display alias only.');
check('four-approved-families', approval.families.map(f => f.id).join('/') === 'sword/banner/chariot/bead', 'Kiếm linh / Hồn phiên / Xạ Thần Xa / Thiên Nghịch Châu');
check('concept-coverage', approval.selectedSources.length === 18 && approval.nativePreviews.length === 10 && approval.coverage.animationClips === 0 && approval.history.length === 1 && approval.history[0].id === 'banner-a' && approval.history[0].artApproved === false, approval.coverage);
for (const file of approval.files) check(`pin:${file.file}`, await hashFile(file.file, file.sha256), file.sha256);
for (const r of generation.requests) {
  check(`source:${r.id}`, await hashFile(r.raw, r.sha256), r.status);
  check(`prompt:${r.id}`, await hashFile(r.prompt, r.promptSha256), r.prompt);
  try { check(`original-copy:${r.id}`, sha(await readFile(r.original)) === r.sha256, 'Original ImageGen source equals retained workspace copy.'); } catch { check(`original-copy:${r.id}`, false, 'Original ImageGen source missing.'); }
  for (const input of r.inputs) check(`input:${r.id}:${input.file}`, await hashFile(input.file, input.sha256), input.sha256);
}
for (const f of basis.files) check(`existing-basis:${f.file}`, await hashFile(f.file, f.sha256), f.sha256);
check('historical-manifest-kept', manifest.ownerApproved === false && manifest.artApproved === false && manifest.motionReady === false && manifest.runtimeReady === false, 'Original generation-time metadata is unchanged; separate approval.json is the current scoped approval.');
for (const file of approval.sourceLock.guardFiles) {
  const r = spawnSync(process.execPath, [resolve(root, file)], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  check(`write-guard:${file}`, r.status !== 0 && !r.error && output.includes('Concept approval locks this V5 source package; create a new production package.'), { exitCode: r.status, expectedEarlyRefusal: true });
}
// Guard probes must not change any pinned source, metadata, report or prior package.
for (const f of approval.files) if (!await hashFile(f.file, f.sha256)) failures.push({ id: `post-guard-pin:${f.file}`, detail: 'Pinned bytes changed during source-write guard verification.' });
for (const f of basis.files) if (!await hashFile(f.file, f.sha256)) failures.push({ id: `post-guard-existing:${f.file}`, detail: 'Prior package or live basis changed during verification.' });
const report = {
  schema: 'wang-lin-concept-approval-check-5', date: '2026-10-14', timezone: 'Asia/Bangkok', passed: failures.length === 0,
  approval: 'approval.json', approvalSha256: sha(await readFile(resolve(root, 'approval.json'))),
  pinnedFiles: approval.files.length, selectedSources: approval.selectedSources.length, nativeConceptPreviews: approval.nativePreviews.length,
  historyExcludedFromArtApproval: approval.history.length, existingBasisFilesUnchanged: basis.files.length,
  sourceRequestsChecked: generation.requests.length, guardedEntryPoints: approval.sourceLock.guardFiles.length,
  technicalVerificationDoesNotExpandApproval: true, browserEvidencePreserved: true,
  liveOrPriorPackageWrites: false, checks, failures
};
await writeFile(resolve(root, 'review/approval-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, checks: checks.length, pinnedFiles: report.pinnedFiles, selectedSources: report.selectedSources, nativeConceptPreviews: report.nativeConceptPreviews, existingBasisFilesUnchanged: report.existingBasisFilesUnchanged, guardedEntryPoints: report.guardedEntryPoints, failures }));
if (failures.length) process.exitCode = 1;
