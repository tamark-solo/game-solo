// Explicitly confirm selected, manually reviewed measurements. This is not ART approval.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root = dirname(fileURLToPath(import.meta.url));
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-motion-v2');
const args = process.argv.slice(2);
assert.ok(args.every(arg => !arg.startsWith('--') || ['--ids', '--confirm'].includes(arg)), 'Unknown option');
assert.ok(args.includes('--confirm'), 'Explicit --confirm after visual root/strip review is required');
const ids = [...new Set(args.filter(arg => !arg.startsWith('--')).flatMap(arg => arg.split(',')).filter(Boolean))];
assert.ok(ids.length && ids.every(id => /^[a-z0-9-]+$/.test(id)), 'Explicit slug-direction IDs required; no all/default selection');
function local(file) {
  const path = resolve(root, file), rel = relative(root, path);
  assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'Outside new motion pack');
  return path;
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async file => JSON.parse(await readFile(local(file), 'utf8'));
const optionalJson = async file => {try {return await json(file);} catch (e) {if (e.code === 'ENOENT') return null; throw e;}};
assert.equal(await optionalJson('approval.json'), null, 'Approved pack is immutable; create a new version');
const plan = await json('production-plan.json'), assessments = await json('review/source-assessment.json');
const registration = await optionalJson('registration-input.json') ?? {schema: 'npc-motion-registration-input-2', date: '2026-10-13', sources: []};
assert.ok(Array.isArray(registration.sources));
const confirmed = [], skipped = [], additions = [];
for (const id of ids) {
  const request = plan.requests.find(r => r.slug + '-' + r.direction === id);
  assert.ok(request, 'Unknown explicit ID: ' + id);
  const bytes = await readFile(local(request.source)), sourceSha256 = hash(bytes);
  const existing = registration.sources.find(s => s.slug === request.slug && s.direction === request.direction);
  if (existing) {
    assert.equal(existing.sourceSha256, sourceSha256, 'Existing registration source changed; explicit source revision is required');
    skipped.push(id); continue;
  }
  const proposalFile = 'review/' + id + '-root-review.json', proposal = await json(proposalFile);
  assert.equal(proposal.source, request.source); assert.equal(proposal.sourceSha256, sourceSha256, 'Root proposal source changed');
  assert.equal(proposal.slug, request.slug); assert.equal(proposal.direction, request.direction);
  assert.equal(proposal.proposalOnly, true, 'Expected a measurement review proposal');
  assert.equal(proposal.needsManualAdjustment, false, 'Native root proposal clips opaque pixels; manually correct the proposal and review strip first');
  const assessment = assessments.sources.find(s => s.slug === request.slug && s.direction === request.direction && s.sourceSha256 === sourceSha256);
  assert.ok(assessment && assessment.source === request.source, 'Visual source assessment for exact hash required');
  assert.equal(assessment.status, 'review-candidate', 'Source flagged for correction must not be confirmed');
  assert.equal(assessment.orientation.pass, true); assert.equal(assessment.identity.pass, true); assert.equal(assessment.anatomy.pass, true);
  assert.equal(proposal.frames.length, 18);
  assert.deepEqual(new Set(proposal.frames.map(f => f.index)), new Set(Array.from({length: 18}, (_, i) => i)));
  assert.ok(Math.abs(proposal.scale - 80 / proposal.neutralHeight) < 1e-9, 'One neutral-derived scale required');
  for (const frame of proposal.frames) {
    assert.ok(Number.isFinite(frame.rootX) && Number.isFinite(frame.rootY), 'Explicit root coordinates required');
    assert.ok(frame.rootX >= frame.left && frame.rootX <= frame.left + frame.width && frame.rootY >= frame.top && frame.rootY <= frame.top + frame.height, 'Root outside manually measured pose');
  }
  const rootBasis = 'Reviewed planted boot-pair contact band against source and native strip; manually confirmed world root; no bbox centre or per-pose fitting';
  const entry = {...proposal, schema: undefined, proposalOnly: false, visuallyReviewed: true,
    frames: proposal.frames.map(frame => ({...frame, rootBasis: frame.manualRootBasis ?? rootBasis})),
    rootBasis, rootReviewProposal: proposalFile, rootReviewProposalSha256: hash(await readFile(local(proposalFile))),
    sourceAssessment: 'review/source-assessment.json', sourceAssessmentSha256: hash(await readFile(local('review/source-assessment.json'))),
    measurementConfirmation: {date: '2026-10-13', explicitId: id, scope: 'World-root, component selection and shared neutral scale only; no ART/runtime approval'},
    artApproved: false, ownerApproved: false, runtimeImported: false};
  additions.push(entry); confirmed.push(id);
}
registration.sources.push(...additions);
await writeFile(local('registration-input.json'), JSON.stringify(registration, null, 2) + '\n');
console.log(JSON.stringify({confirmed, skippedExistingPreserved: skipped, totalSources: registration.sources.length, artApprovalGranted: false, runtimeImported: false}));
