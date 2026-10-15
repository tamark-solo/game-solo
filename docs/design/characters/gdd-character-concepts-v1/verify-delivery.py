"""Read-only verification of the approved neutral package and cleanup evidence."""
from pathlib import Path
import hashlib
import json
import sys

R = Path(__file__).resolve().parent
W = R.parents[3]
sys.path.insert(0, str(W / 'scripts'))
from archived_asset_basis import read_basis_bytes


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(read_basis_bytes(path)).hexdigest()


delivery = read(R / 'review/delivery.json')
approval = read(R / 'approval.json')
basis = read(R / 'basis.json')
assert delivery['status'] == 'neutral-art-approved-review-ready'
assert delivery['coverage']['newNeutralConcepts'] == len(approval['actorIds']) == 18
assert approval['ownerApproved'] and approval['neutralArtApproved']
assert not approval['motionApproved'] and not approval['runtimeApproved']
assert not delivery['runtimeIntegrated']
for pin in delivery['files'] + approval['targets']:
    assert sha(R / pin['file']) == pin['sha256'], pin['file']
for pin in basis['files'] + delivery['externalEvidence']:
    assert sha(W / pin['file']) == pin['sha256'], pin['file']
report = {'schema': 'gdd-character-concept-delivery-verification-2', 'date': '2026-10-15', 'status': 'passed',
          'deliverySha256': sha(R / 'review/delivery.json'), 'newPackagePins': len(delivery['files']),
          'approvalPins': len(approval['targets']), 'basisPins': len(basis['files']),
          'externalEvidencePins': len(delivery['externalEvidence']), 'neutralArtApproved': True,
          'ownerApprovalInferred': False, 'runtimeIntegrated': False}
if '--final' in sys.argv:
    (R / 'review/delivery-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
