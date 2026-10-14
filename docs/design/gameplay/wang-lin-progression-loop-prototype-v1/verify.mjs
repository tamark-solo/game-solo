import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import {
  PROGRESSION_CONTRACTS,
  IDENTITIES,
  REALMS,
  STANCES,
  ARTIFACT_FAMILIES,
  ACTS,
  SANDBOX_ACTIVITIES,
  BOSS_ENCOUNTERS,
  evaluateAnnularSealSector,
  restoreProgressionPrototype,
  runFullStage1To2Walkthrough,
} from './core.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, '../../../..');
const v5Root = path.resolve(root, '../../characters/wang-lin-concept-direction-v5');
const v1Root = path.resolve(root, '../../characters/wang-lin-equipment-production-v1');
const v2Root = path.resolve(root, '../../characters/wang-lin-equipment-production-v2');

const checks = [];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const check = (name, condition) => {
  assert.ok(condition, name);
  checks.push({ name, pass: true });
};

// Ensure contracts.json matches PROGRESSION_CONTRACTS
const contractsPath = path.join(root, 'contracts.json');
const contractsJson = JSON.parse(await readFile(contractsPath, 'utf8'));
assert.deepEqual(contractsJson, PROGRESSION_CONTRACTS);
check('Progression contracts JSON parity', true);
check('Fixture-only status', PROGRESSION_CONTRACTS.runtimeIntegrated === false && PROGRESSION_CONTRACTS.status === 'experimental-fixture-only');
check('Two identities on Wang Lin line (a, b)', Object.keys(IDENTITIES).join(',') === 'a,b');
check('Five major realms', Object.keys(REALMS).join(',') === 'ngung_khi,truc_co,ket_dan,nguyen_anh,hoa_than');
check('Four artifact families x three milestones', Object.keys(ARTIFACT_FAMILIES).length === 4 && Object.values(ARTIFACT_FAMILIES).every(f => Object.keys(f.milestones).length === 3));
check('Three cultivation stances', Object.keys(STANCES).length === 3);
check('Eleven acts VG01..VG11', ACTS.length === 11 && ACTS[0].id === 'VG01' && ACTS[10].id === 'VG11');

// Check cluster stagger rule (>= 450ms)
for (const activity of Object.values(SANDBOX_ACTIVITIES).filter(a => a.kind === 'monster_cluster')) {
  const offsets = activity.members.map(m => m.attackOffsetMs).sort((a, b) => a - b);
  const minDiff = offsets.slice(1).reduce((min, v, i) => Math.min(min, v - offsets[i]), Infinity);
  check(`Cluster stagger >= 450ms: ${activity.id}`, minDiff >= 450);
}

// Check Boss 4 90-degree safe sector probes
const fixtures = JSON.parse(await readFile(path.join(root, 'fixtures.json'), 'utf8'));
for (const probe of fixtures.scenarios.annular_seal_90deg_sector_probes) {
  const res = evaluateAnnularSealSector(probe.playerPos, probe.bossOrigin, probe.lockedAim, 112, 90);
  check(
    `Annular 90deg sector probe: ${probe.id}`,
    res.inRing === probe.expected.inRing && res.inSafeSector === probe.expected.inSafeSector && res.takesDamage === probe.expected.takesDamage,
  );
}

// Verify V5 concept approval pins (86 files)
const v5ApprovalBytes = await readFile(path.join(v5Root, 'approval.json'));
const v5Approval = JSON.parse(v5ApprovalBytes.toString('utf8'));
for (const record of v5Approval.files) {
  check(`V5 unchanged: ${record.file}`, hash(await readFile(path.join(v5Root, record.file))) === record.sha256);
}

// Verify V1 pilot approval pins (831 files)
const v1ApprovalBytes = await readFile(path.join(v1Root, 'approval.json'));
const v1Approval = JSON.parse(v1ApprovalBytes.toString('utf8'));
for (const record of v1Approval.files) {
  check(`V1 pilot unchanged: ${record.file}`, hash(await readFile(path.join(v1Root, record.file))) === record.sha256);
}

// Verify V2 protected runtime and map files (11 files)
const v2BasisBytes = await readFile(path.join(v2Root, 'basis.json'));
const v2Basis = JSON.parse(v2BasisBytes.toString('utf8').replace(/^\uFEFF/, ''));
for (const record of v2Basis.protectedRuntimeAndMap) {
  check(`Protected runtime/map unchanged: ${record.file}`, hash(await readFile(path.join(v2Root, record.file))) === record.sha256);
}

// Run deterministic Stage 1 -> Stage 2 walkthrough for both identities ('a' and 'b')
const walkthroughSummaries = {};
for (const avatarId of ['a', 'b']) {
  const sim = runFullStage1To2Walkthrough(avatarId);
  check(`Walkthrough (${avatarId}) reaches Kết Đan`, sim.cultivation.realmId === 'ket_dan' && sim.cultivation.subStage === 1);
  check(`Walkthrough (${avatarId}) achieves Heaven Foundation`, sim.cultivation.foundationQuality === 'heaven');
  check(`Walkthrough (${avatarId}) completes all 11 acts`, sim.ledger.completedActs.length === 11);
  check(`Walkthrough (${avatarId}) refines all 4 artifacts to Milestone II`, ['sword', 'banner', 'chariot', 'bead'].every(f => sim.loadout.families[f].milestoneTier === 2));
  const restored = restoreProgressionPrototype(JSON.stringify(sim.snapshot()));
  check(`Walkthrough (${avatarId}) snapshot round-trip`, JSON.stringify(restored.snapshot()) === JSON.stringify(sim.snapshot()));
  walkthroughSummaries[avatarId] = {
    cultivation: sim.cultivation,
    stats: sim.stats,
    loadout: sim.loadout,
    completedActs: sim.ledger.completedActs,
    noiGioi: sim.noiGioi,
    eventCount: sim.events.length,
  };
}

// Run scoped unit test command
const run = spawnSync(
  process.execPath,
  ['--test', '--test-reporter=tap', path.join(workspace, 'tests/unit/wang-lin-progression-loop-prototype.test.mjs')],
  { encoding: 'utf8', cwd: workspace },
);
check('Scoped G2 unit test command passed', run.status === 0);
const passMatch = run.stdout.match(/# pass (\d+)/);
const testsMatch = run.stdout.match(/# tests (\d+)/);
const unitTests = {
  command: 'node --test tests/unit/wang-lin-progression-loop-prototype.test.mjs',
  total: Number(testsMatch?.[1]),
  passed: Number(passMatch?.[1]),
  exitCode: run.status,
};
check('Every scoped G2 unit test passed', unitTests.total > 0 && unitTests.total === unitTests.passed);

const sourceFiles = ['core.mjs', 'contracts.json', 'fixtures.json', 'index.html', 'README.md', 'verify.mjs'];
const files = [];
for (const file of sourceFiles) {
  files.push({ file, sha256: hash(await readFile(path.join(root, file))) });
}
files.push({
  file: '../../../../tests/unit/wang-lin-progression-loop-prototype.test.mjs',
  sha256: hash(await readFile(path.join(workspace, 'tests/unit/wang-lin-progression-loop-prototype.test.mjs'))),
});

const report = {
  schema: 'wang-lin-progression-loop-prototype-verification-1',
  date: '2026-10-14',
  branch: 'G2',
  status: 'passed',
  fixtureOnly: true,
  runtimeIntegrated: false,
  gameplayBalanceApproved: false,
  generationCalls: 0,
  baseline: {
    unchangedV5Pins: v5Approval.files.length,
    unchangedV1PilotPins: v1Approval.files.length,
    unchangedProtectedRuntimeAndMap: v2Basis.protectedRuntimeAndMap.length,
  },
  coverage: {
    identities: 2,
    realms: 5,
    artifactFamilies: 4,
    milestoneTiers: 3,
    stances: 3,
    acts: 11,
    bossEncounters: Object.keys(BOSS_ENCOUNTERS).length,
    checks: checks.length,
    unitTests,
  },
   files,
};

await mkdir(path.join(root, 'review'), { recursive: true });
await writeFile(path.join(root, 'review/verification.json'), JSON.stringify(report, null, 2) + '\n');
await writeFile(
  path.join(root, 'review/example-walkthrough.json'),
  JSON.stringify({ schema: 'wang-lin-progression-loop-walkthrough-1', fixtureOnly: true, walkthroughSummaries }, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    pass: true,
    branch: 'G2',
    checks: checks.length,
    unitTests,
    unchangedV5Pins: v5Approval.files.length,
    unchangedV1PilotPins: v1Approval.files.length,
    unchangedProtectedRuntimeAndMap: v2Basis.protectedRuntimeAndMap.length,
  }),
);
