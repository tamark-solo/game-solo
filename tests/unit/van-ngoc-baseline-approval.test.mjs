import assert from 'node:assert/strict';
import test from 'node:test';
import { validateVanNgocBaselineApproval } from '../../scripts/sync-hang-nhac-van-ngoc-clarity.mjs';

const composition = { master: { sha256: 'a'.repeat(64) }, web: { sha256: 'b'.repeat(64) } };
const accepted = () => ({ schema: 'game-solo-map-art-baseline-approval-1',
  status: 'owner-approved-art-baseline', approvedBy: 'owner',
  evidence: { source: 'owner-chat', statement: 'Save this displayed map as the ART baseline.' },
  scope: 'baked-background-art-baseline', master: { ...composition.master }, web: { ...composition.web },
  worldSize: [3072, 2048], characterFrame: [64, 96], characterAnchor: [32, 88], cameraScale: 1,
  selectedRegionCount: 20, ownerApproved: true, artApproved: true,
  productionLayersApproved: false, exactFootprintVerified: false,
  navigationModified: false, authoredMapsModified: false });

test('direct owner baseline approval accepts exactly the selected images', () => {
  assert.doesNotThrow(() => validateVanNgocBaselineApproval(accepted(), composition));
});
test('an altered master or delivery cannot inherit the baseline approval', () => {
  for (const field of ['master', 'web']) {
    const changed = structuredClone(composition);
    changed[field].sha256 = 'c'.repeat(64);
    assert.throws(() => validateVanNgocBaselineApproval(accepted(), changed), /approval does not cover/);
  }
});
test('baked background acceptance does not grant layers, footprints or gameplay changes', () => {
  for (const field of ['productionLayersApproved', 'exactFootprintVerified', 'navigationModified', 'authoredMapsModified']) {
    const approval = accepted(); approval[field] = true;
    assert.throws(() => validateVanNgocBaselineApproval(approval, composition), /approval does not cover/);
  }
  const approval = accepted(); approval.scope = 'all-production-assets';
  assert.throws(() => validateVanNgocBaselineApproval(approval, composition), /approval does not cover/);
});
test('generation and Codex technical review cannot substitute for owner acceptance', () => {
  for (const patch of [{ approvedBy: 'Codex' }, { ownerApproved: false },
    { status: 'preview-only' }, { evidence: { source: 'test', statement: 'Tests passed.' } }]) {
    assert.throws(() => validateVanNgocBaselineApproval({ ...accepted(), ...patch }, composition), /approval does not cover/);
  }
});
test('approval remains tied to the native camera and character contract', () => {
  for (const patch of [{ characterFrame: [32, 48] }, { characterAnchor: [16, 44] },
    { cameraScale: 2 }, { worldSize: [1536, 1024] }]) {
    assert.throws(() => validateVanNgocBaselineApproval({ ...accepted(), ...patch }, composition), /approval does not cover/);
  }
});
