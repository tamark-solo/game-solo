"""Append a built-in source result; never overwrite an existing raw or neutral."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import shutil
import sys

R = Path(__file__).resolve().parent
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert not (R / 'approval.json').exists(), 'Approved motion source package is immutable'
job_id, original = sys.argv[1:3]
ledger = json.loads((R / 'generation.json').read_text(encoding='utf-8'))
job = next(j for j in ledger['jobs'] if j['id'] == job_id)
assert job['status'] == 'planned', 'Use a corrective sibling revision, never overwrite recorded source'
assert sha(R / job['prompt']) == job['promptSha256']
for image in job['inputs']:
    assert sha(R / image['file']) == image['sha256']
original = Path(original).resolve()
target = R / job['source']
assert not target.exists(), 'Source overwrite refused'
image = Image.open(original)
assert image.mode == 'RGBA', 'True alpha source required'
shutil.copyfile(original, target)
job.update(status='generated-awaiting-source-review', original=str(original), sourceSha256=sha(target), originalSha256=sha(original), sourceSize=list(image.size), sourceViewed=False)
(R / 'generation.json').write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
progress = json.loads((R / 'progress.json').read_text(encoding='utf-8'))
progress['generatedSources'] = sum(j['status'] != 'planned' for j in ledger['jobs'])
(R / 'progress.json').write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'id': job_id, 'sha256': job['sourceSha256'], 'size': job['sourceSize']}))
