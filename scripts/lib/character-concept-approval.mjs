// Explicit owner decisions apply only to the exact reviewed files, never to a rebuild by itself.
export function applyCharacterConceptApproval(manifest, decision) {
  for (const concept of manifest.concepts) {
    const target = decision.targets.find(target => target.id === concept.id);
    const native = manifest.assets.find(asset => asset.file === concept.native);
    const accepted = decision.approvedBy === 'project-owner' && decision.scope === 'static-concept-art' && !!target
      && target.sourceSha256 === concept.source.sha256
      && target.promptSha256 === concept.promptSha256
      && target.nativeSha256 === native?.sha256
      && target.bodySha256 === concept.body.sha256;
    concept.ownerApproved = accepted;
    concept.artApproved = accepted;
    concept.productionApproved = false;
    concept.status = accepted ? 'concept-art-approved' : 'pending-owner-concept-review';
  }
  const accepted = manifest.concepts.length === decision.targets.length
    && manifest.concepts.every(concept => concept.artApproved);
  manifest.ownerApproved = accepted;
  manifest.artApproved = accepted;
  manifest.productionApproved = false;
  manifest.status = accepted ? 'concept-art-approved' : 'concept-research-pending-review';
  manifest.approval = {date: decision.date, scope: decision.scope, record: 'approval.json'};
  return manifest;
}
