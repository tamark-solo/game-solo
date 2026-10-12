"""Export current approved source without rewriting any sealed release or approval."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
workspace = root.parents[2]
library = json.loads((root / 'library.json').read_text(encoding='utf8'))
output = workspace / 'artifacts' / 'vfx-current-source.zip'
output.parent.mkdir(parents=True, exist_ok=True)
# Root review pages, images and metadata keep current preview links self-contained.
files = {p for p in root.iterdir() if p.is_file() and p.suffix.lower() not in ['.zip', '.7z', '.rar', '.tar', '.gz', '.bz2', '.xz']}
for folder in [s['path'] for s in library['skills']] + ['production', 'milestones']:
    files.update(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
# Sealed manifests are provenance records, never rewritten by this export.
files.update(p for p in (root / 'releases').rglob('*') if p.is_file() and p.suffix in ['.json', '.sha256'])
# Include locally available individual current ZIPs only. The historical aggregate
# contains retired ART and must not be nested into this current-source snapshot.
for name in [s['pack'] for s in library['skills']]:
    candidate = root / name
    if candidate.exists():
        files.add(candidate)
entries = [{'file': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
frame_count = sum('/frames/' in e['file'] and e['file'].endswith('.png') for e in entries)
atlas_count = sum('/atlases/' in e['file'] and e['file'].endswith('.png') for e in entries)
assert (frame_count, atlas_count) == (646, 76), (frame_count, atlas_count)
manifest = {'kind': 'current_workspace_snapshot', 'approvalSource': 'library.json',
            'sealedRelease': library['release'], 'newApprovalGranted': False,
            'frames': frame_count, 'atlases': atlas_count, 'files': entries}
with ZipFile(output, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for p in sorted(files):
        archive.write(p, p.relative_to(root).as_posix())
    archive.writestr('WORKSPACE-MANIFEST.json', json.dumps(manifest, ensure_ascii=False, indent=2))
with ZipFile(output) as archive:
    assert archive.testzip() is None
    for e in entries:
        assert hashlib.sha256(archive.read(e['file'])).hexdigest() == e['sha256'], e['file']
print(json.dumps({'archive': str(output), 'bytes': output.stat().st_size,
                  'frames': frame_count, 'atlases': atlas_count, 'newApprovalGranted': False}, indent=2))
