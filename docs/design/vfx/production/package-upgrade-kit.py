"""Seal the complete R01 + R02 source/preview kit and verify all archive payloads."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
name = 'truc-co-kit-1.0.0'
library = json.loads((root / 'library.json').read_text(encoding='utf8'))
names = ['library.json', 'README.md', 'NGUNG-KHI-KIT.md', 'TRUC-CO-KIT.md',
         'skill-library.html', 'kiem-khi-preview.html', 'kiem-khi-preview-v3.mjs',
         'ngung-khi-kit.html', 'ngung-khi-kit-preview.mjs', 'truc-co-kit.html',
         'truc-co-kit-preview.mjs', 'serve-preview.py', 'sect-courtyard-game-reference-v1.png',
         'pvp-target-stand-west-native-v1.png', 'wanglin-chibi-stand-east-native-v1.png',
         'ngung-khi-approved-art-v1.png', 'review-r01-r02-sword.png',
         'review-r01-r02-thunder.png', 'review-r01-r02-wind.png',
         'releases/kiem-khi-r01-1.0.0/manifest.json', 'releases/skill-packs/index.json']
files = {root / n for n in names}
for folder in [s['path'] for s in library['skills']] + ['production', 'milestones']:
    files.update(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
# Individual manifests are useful without recursively including release ZIPs.
files.update((root / 'releases' / 'skill-packs').glob('*.manifest.json'))
entries = [{'file': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
manifest = {'id': 'TRUC-CO-UPGRADE-KIT', 'version': '1.0.0', 'date': '2026-10-07',
            'primary': {'realm': 'R02', 'frames': 132, 'atlases': 15, 'newFrames': 48,
                        'reusedFrames': 84, 'artStatus': 'produced_pending_owner_motion_review'},
            'includedBaseline': {'realm': 'R01', 'frames': 114, 'atlases': 13, 'artStatus': 'owner_approved'},
            'archiveFrames': 246, 'archiveAtlases': 28, 'runtimeReady': False,
            'automatedTestsPassed': 31, 'browserInteractionVerified': False, 'files': entries}
release = root / 'releases'
mf = release / (name + '.manifest.json')
zf = release / (name + '.zip')
if mf.exists() or zf.exists():
    raise RuntimeError('Release already sealed; choose a new version instead of overwriting')
mf.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
with ZipFile(zf, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for p in sorted(files):
        archive.write(p, name + '/' + p.relative_to(root).as_posix())
    archive.write(mf, name + '/PACK-MANIFEST.json')
with ZipFile(zf) as archive:
    assert archive.testzip() is None
    for e in entries:
        assert hashlib.sha256(archive.read(name + '/' + e['file'])).hexdigest() == e['sha256'], e['file']
    assert sum('/frames/' in n and n.endswith('.png') for n in archive.namelist()) == 246
    assert sum('/atlases/' in n and n.endswith('.png') for n in archive.namelist()) == 28
digest = hashlib.sha256(zf.read_bytes()).hexdigest()
(release / (name + '.sha256')).write_text(digest + '  ' + zf.name + '\n', encoding='utf8')
print(json.dumps({'archive': str(zf), 'bytes': zf.stat().st_size, 'files': len(entries),
                  'frames': 246, 'atlases': 28, 'verifiedSha256': digest}, indent=2))
