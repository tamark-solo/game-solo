"""Seal the R01-R05 V2 source and preview library; existing releases are immutable."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
name = 'hoa-than-kit-2.0.0'
library = json.loads((root / 'library.json').read_text(encoding='utf8'))
names = ['library.json', 'README.md', 'NGUNG-KHI-KIT.md', 'TRUC-CO-KIT.md', 'KET-DAN-KIT.md', 'NGUYEN-ANH-KIT.md', 'HOA-THAN-KIT.md', 'HOA-THAN-KIT-V1.md',
         'skill-library.html', 'kiem-khi-preview.html', 'kiem-khi-preview-v3.mjs',
         'ngung-khi-kit.html', 'ngung-khi-kit-preview.mjs', 'truc-co-kit.html',
         'truc-co-kit-preview.mjs', 'ket-dan-kit.html', 'ket-dan-kit-preview.mjs', 'nguyen-anh-kit.html', 'nguyen-anh-kit-preview.mjs', 'hoa-than-kit.html', 'hoa-than-kit-preview.mjs',
         'serve-preview.py', 'sect-courtyard-game-reference-v1.png',
         'pvp-target-stand-west-native-v1.png', 'wanglin-chibi-stand-east-native-v1.png',
         'ngung-khi-approved-art-v1.png', 'releases/kiem-khi-r01-1.0.0/manifest.json',
         'releases/skill-packs/index.json', 'releases/truc-co-approval-1.0.1.json', 'releases/ket-dan-approval-1.0.1.json', 'releases/nguyen-anh-approval-2.0.1.json']
names += [f'review-{pair}-{family}.png' for pair in ['r01-r02', 'r02-r03', 'r03-r04', 'r04-r05']
          for family in ['sword', 'thunder', 'wind']]
names += [f'review-r04-spirit-redesign-{family}.png' for family in ['sword','thunder','wind']]
names += [f'review-r05-force-{family}.png' for family in ['sword','thunder','wind']]
files = {root / n for n in names}
for folder in [s['path'] for s in library['skills']] + ['r04-sword-v1', 'r04-thunder-v1', 'r04-wind-v1', 'r05-sword-v1', 'r05-thunder-v1', 'r05-wind-v1', 'production', 'milestones']:
    files.update(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
files.update((root / 'releases' / 'skill-packs').glob('*.manifest.json'))
entries = [{'file': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
realms = {realm: {'frames': sum(s['frames'] for s in library['skills'] if s['id'].startswith(realm)),
                  'atlases': sum(s['atlases'] for s in library['skills'] if s['id'].startswith(realm)),
                  'artStatus': 'owner_approved' if realm != 'R05' else 'redesigned_pending_owner_motion_review'}
          for realm in ['R01', 'R02', 'R03', 'R04', 'R05']}
manifest = {'id': 'HOA-THAN-UPGRADE-KIT', 'version': '2.0.0', 'date': '2026-10-07',
            'primaryRealm': 'R05', 'realms': realms, 'newR05Frames': 42, 'reusedR05Frames': 70,
            'archiveFrames': 918, 'archiveAtlases': 109, 'activeLibraryFrames': 644, 'activeLibraryAtlases': 76, 'runtimeReady': False,
            'automatedTestsPassed': 72, 'browserInteractionVerified': False, 'files': entries}
release = root / 'releases'
mf = release / (name + '.manifest.json')
zf = release / (name + '.zip')
if mf.exists() or zf.exists():
    raise RuntimeError('Release already sealed; use a new version')
mf.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
with ZipFile(zf, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for p in sorted(files):
        archive.write(p, name + '/' + p.relative_to(root).as_posix())
    archive.write(mf, name + '/PACK-MANIFEST.json')
with ZipFile(zf) as archive:
    assert archive.testzip() is None
    for e in entries:
        assert hashlib.sha256(archive.read(name + '/' + e['file'])).hexdigest() == e['sha256'], e['file']
    assert sum('/frames/' in n and n.endswith('.png') for n in archive.namelist()) == 918
    assert sum('/atlases/' in n and n.endswith('.png') for n in archive.namelist()) == 109
digest = hashlib.sha256(zf.read_bytes()).hexdigest()
(release / (name + '.sha256')).write_text(digest + '  ' + zf.name + '\n', encoding='utf8')
print(json.dumps({'archive': str(zf), 'bytes': zf.stat().st_size, 'files': len(entries),
                  'frames': 918, 'atlases': 109, 'verifiedSha256': digest}, indent=2))
