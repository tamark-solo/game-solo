import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, '../../../..');
const conceptRoot = path.resolve(root, '../wang-lin-concept-direction-v5');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const checks = [];
const check = (name, passed, detail) => {
  checks.push({ name, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }) });
};
const planBytes = await fs.readFile(path.join(root, 'plan.json'));
const plan = JSON.parse(planBytes);
const approvalBytes = await fs.readFile(path.join(conceptRoot, 'approval.json'));
const approval = JSON.parse(approvalBytes);
const basis = await readJson(path.join(conceptRoot, 'basis.json'));
const pinnedReport = await readJson(path.join(conceptRoot, 'review/approval-verification.json'));
check('both-approved-identities-planned', plan.characters.length === 2 &&
  plan.characters.every(c => approval.identities.some(a => a.id === c.sourceIdentityId && a.name === c.name)));
check('four-approved-families-planned', plan.families.length === 4 &&
  plan.families.every(f => approval.families.some(a => a.id === f.id && a.name === f.name)));
check('approval-is-static-concept', approval.ownerApproved && approval.conceptApproved &&
  !approval.motionApproved && !approval.runtimeIntegrated && !approval.vfxProductionApproved);
check('plan-has-no-generated-production', plan.scheduling.generationStarted === false &&
  plan.pilot.estimatedNotGenerated && !plan.readiness.motionApproved && !plan.readiness.runtimeIntegrated);
check('source-coverage-matches-approval', plan.approval.pinnedFiles === approval.files.length &&
  plan.approval.selectedSources === approval.selectedSources.length &&
  plan.approval.nativeConceptPreviews === approval.nativePreviews.length);
check('approval-guard-verification-passed', pinnedReport.passed && pinnedReport.failures.length === 0 &&
  pinnedReport.approvalSha256 === hash(approvalBytes));

for (const [group, files] of [['approved-concept', approval.files], ['existing-basis', basis.files]]) {
  for (const item of files) {
    const absolute = path.resolve(conceptRoot, item.file);
    check(`${group}:workspace-boundary:${item.file}`, absolute.startsWith(workspace + path.sep));
    try { check(`${group}:hash:${item.file}`, hash(await fs.readFile(absolute)) === item.sha256); }
    catch (error) { check(`${group}:hash:${item.file}`, false, error.message); }
  }
}

const phases = new Map(plan.phases.map(p => [p.id, p]));
check('phase-ids-unique', phases.size === plan.phases.length);
check('concept-phase-complete', phases.get('P0')?.status === 'complete');
check('neutral-and-mechanics-ready-together', ['P1', 'P2'].every(id => phases.get(id)?.status === 'ready'));
for (const phase of plan.phases) {
  check(`phase:${phase.id}:has-deliverables-and-gate`, phase.deliverables.length > 0 && phase.gate.trim().length > 0);
  check(`phase:${phase.id}:dependencies-exist`, phase.dependsOn.every(id => phases.has(id)));
}
const visited = new Set();
const pending = new Set();
let acyclic = true;
function visit(id) {
  if (pending.has(id)) { acyclic = false; return; }
  if (visited.has(id)) return;
  pending.add(id);
  for (const dep of phases.get(id)?.dependsOn ?? []) visit(dep);
  pending.delete(id);
  visited.add(id);
}
for (const id of phases.keys()) visit(id);
check('phase-dependencies-acyclic', acyclic);
check('pilot-needs-neutral-and-prototype', ['P1', 'P2'].every(id => phases.get('P3').dependsOn.includes(id)));
check('integration-needs-complete-sword-and-core', ['P2', 'P4'].every(id => phases.get('P6').dependsOn.includes(id)));

const q = plan.quantities;
const views = q.characters * q.families * q.directions;
check('neutral-and-gear-views', views === q.neutralPosesPerMilestone && views === q.restGearViews);
check('body-core-formula', views * q.coreActions.length === q.coreClips);
check('body-skill-and-gear-formula', views * q.skillActions.length === q.skillClips && q.skillClips === q.gearStAoeTracks);
check('base-body-formula', q.coreClips + q.skillClips === q.baseBodyClips);
check('conditional-combo-formula', views * q.basicComboActionsReserved === q.conditionalComboClips &&
  q.baseBodyClips + q.conditionalComboClips === q.bodyClipsWithCombo);
check('nominal-pose-estimates', q.baseBodyClips * q.nominalKeysPerClip === q.baseNominalPoses &&
  q.bodyClipsWithCombo * q.nominalKeysPerClip === q.nominalPosesWithCombo);
check('fx-estimate-formula', q.families * q.fxSequencesPerFamily === q.fxSequencesPerMilestone &&
  q.fxSequencesPerMilestone * q.nominalKeysPerClip === q.nominalFxKeysPerMilestone);
check('three-milestone-estimates', plan.milestones.length * q.appearancesPerMilestone === q.allThreeMilestonesAppearances &&
  plan.milestones.length * q.baseBodyClips === q.allThreeMilestonesBaseClips &&
  plan.milestones.length * q.bodyClipsWithCombo === q.allThreeMilestonesClipsWithCombo);
const p = plan.pilot;
check('pilot-body-estimate', p.characters * p.directions.length * p.actions.length === p.bodyClips &&
  p.bodyClips * p.nominalKeysPerClip === p.nominalBodyPoses);
check('pilot-gear-and-fx-estimates', p.characters * p.directions.length * q.skillActions.length === p.gearSkillTracks &&
  p.fxSequences * p.nominalKeysPerClip === p.nominalFxKeys);

for (const relative of Object.values(plan.documents).concat(plan.characters.map(c => c.image), plan.families.map(f => f.source))) {
  try { await fs.access(path.resolve(root, relative)); check(`document-or-image:${relative}`, true); }
  catch (error) { check(`document-or-image:${relative}`, false, error.message); }
}
for (const item of plan.architecture) {
  for (const relative of item.modules) {
    try { await fs.access(path.resolve(workspace, relative)); check(`existing-module:${relative}`, true); }
    catch (error) { check(`existing-module:${relative}`, false, error.message); }
  }
}
const markdown = await fs.readFile(path.resolve(root, plan.documents.main), 'utf8');
for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  if (/^https?:/.test(match[1])) continue;
  try { await fs.access(path.resolve(path.dirname(path.resolve(root, plan.documents.main)), match[1])); check(`markdown-link:${match[1]}`, true); }
  catch (error) { check(`markdown-link:${match[1]}`, false, error.message); }
}
const failures = checks.filter(c => !c.passed);
const report = {
  schema: 'wang-lin-implementation-plan-verification-1', date: plan.date,
  status: failures.length === 0 ? 'passed' : 'failed',
  planSha256: hash(planBytes), approvalSha256: hash(approvalBytes),
  checkCount: checks.length, approvedConceptPinsUnchanged: approval.files.length,
  historicalAndLiveBasisPinsUnchanged: basis.files.length,
  productionOrGameplayWrites: false, checks, failures,
};
await fs.mkdir(path.join(root, 'review'), { recursive: true });
await fs.writeFile(path.join(root, 'review/plan-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, checks: checks.length, approvedPins: approval.files.length,
  priorBasisPins: basis.files.length, failures }));
if (failures.length > 0) process.exitCode = 1;
