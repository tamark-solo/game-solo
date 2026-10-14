import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import { CONTRACTS, createPrototype, exampleWorld, geometryFor, createFactInbox, restorePrototype } from './core.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, '../../../..');
const approvalRoot = path.resolve(root, '../../characters/wang-lin-concept-direction-v5');
const checks = [];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const check = (name, condition) => { assert.ok(condition, name); checks.push({ name, pass: true }); };
const contracts = JSON.parse(await readFile(path.join(root, 'contracts.json'), 'utf8'));
assert.deepEqual(contracts.contracts, Object.values(CONTRACTS)); check('Contract JSON parity', true);
check('Exactly four families and eight contracts', Object.keys(CONTRACTS).length === 8 && new Set(Object.values(CONTRACTS).map(c => c.family)).size === 4);
check('Fixture-only contract status', contracts.runtimeIntegrated === false && Object.values(CONTRACTS).every(c => c.status === 'experimental-fixture-only'));
const fixture = JSON.parse(await readFile(path.join(root, 'fixtures.json'), 'utf8'));
assert.deepEqual(fixture.default.targets, exampleWorld().targets); check('Example roster parity', true);

const approvalBytes = await readFile(path.join(approvalRoot, 'approval.json'));
const approval = JSON.parse(approvalBytes.toString('utf8'));
check('Both approved concept identities', approval.conceptApproved === true && approval.requestedProductionIdentities.join(',') === 'a,b');
for (const record of approval.files) check(`V5 unchanged: ${record.file}`, hash(await readFile(path.join(approvalRoot, record.file))) === record.sha256);

const examples = [];
for (const c of Object.values(CONTRACTS)) {
  const e = createPrototype(exampleWorld());
  const accepted = e.cast({ castId: `verify-${c.id}`, actorId: 'caster', family: c.family, mode: c.mode, startedAt: 1000, origin: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, targetId: c.family === 'bead' ? 'ally-1' : 'enemy-1' });
  check(`${c.id} accepted`, accepted.accepted);
  e.advance(1000 + c.timing.endMs);
  check(`${c.id} absolute completion`, e.facts.at(-1).at === 1000 + c.timing.endMs && e.facts.at(-1).type === 'complete');
  check(`${c.id} unique fact IDs`, new Set(e.facts.map(f => f.key)).size === e.facts.length);
  const resumed = restorePrototype(JSON.stringify(e.snapshot()));
  check(`${c.id} terminal reconnect does not replay`, resumed.advance(5000).length === 0);
  const inbox = createFactInbox(); inbox.ingest(e.facts, 5000);
  check(`${c.id} late effects expired`, inbox.effectsAt(5000).length === 0);
  if (c.family === 'bead') check(`${c.id} no damage or hit credit`, !e.facts.some(f => f.type === 'hit') && e.facts.filter(f => ['support', 'control'].includes(f.type)).every(f => !f.creditPolicy.startsWith('fixture-damage')));
  examples.push({ contractId: c.id, geometry: geometryFor(e.casts[0]), facts: e.facts });
}

const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', path.join(workspace, 'tests/unit/wang-lin-equipment-prototype.test.mjs')], { encoding: 'utf8', cwd: workspace });
check('Scoped unit command passed', run.status === 0);
const passMatch = run.stdout.match(/# pass (\d+)/), testsMatch = run.stdout.match(/# tests (\d+)/);
const unitTests = { command: 'node --test tests/unit/wang-lin-equipment-prototype.test.mjs', total: Number(testsMatch?.[1]), passed: Number(passMatch?.[1]), exitCode: run.status };
check('Every scoped unit passed', unitTests.total > 0 && unitTests.total === unitTests.passed);

const sourceFiles = ['core.mjs', 'contracts.json', 'fixtures.json', 'README.md', 'verify.mjs'];
const files = [];
for (const file of sourceFiles) files.push({ file, sha256: hash(await readFile(path.join(root, file))) });
files.push({ file: '../../../../tests/unit/wang-lin-equipment-prototype.test.mjs', sha256: hash(await readFile(path.join(workspace, 'tests/unit/wang-lin-equipment-prototype.test.mjs'))) });
const report = { schema: 'wang-lin-equipment-prototype-verification-1', date: '2026-10-14', status: 'passed', fixtureOnly: true, runtimeIntegrated: false, gameplayBalanceApproved: false, generationCalls: 0, baseline: { approvalFile: '../../characters/wang-lin-concept-direction-v5/approval.json', approvalSha256: hash(approvalBytes), unchangedPinnedFiles: approval.files.length }, coverage: { contracts: 8, families: 4, checks: checks.length, unitTests }, checks, files };
await mkdir(path.join(root, 'review'), { recursive: true });
await writeFile(path.join(root, 'review/verification.json'), JSON.stringify(report, null, 2) + '\n');
await writeFile(path.join(root, 'review/example-facts.json'), JSON.stringify({ schema: 'wang-lin-equipment-example-facts-1', fixtureOnly: true, examples }, null, 2) + '\n');
console.log(JSON.stringify({ pass: true, checks: checks.length, unitTests, unchangedV5Pins: approval.files.length, contracts: 8 }));
