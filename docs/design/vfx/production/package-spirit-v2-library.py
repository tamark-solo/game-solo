"""Seal the R01-R04 source and preview library; existing releases are immutable."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
name = 'nguyen-anh-kit-2.0.0'
library = json.loads((root / 'library.json').read_text(encoding='utf8'))
names = ['library.json', 'README.md', 'NGUNG-KHI-KIT.md', 'TRUC-CO-KIT.md', 'KET-DAN-KIT.md', 'NGUYEN-ANH-KIT.md',
         'skill-library.html', 'kiem-khi-preview.html', 'kiem-khi-preview-v3.mjs',
         'ngung-khi-kit.html', 'ngung-khi-kit-preview.mjs', 'truc-co-kit.html',
         'truc-co-kit-preview.mjs', 'ket-dan-kit.html', 'ket-dan-kit-preview.mjs', 'nguyen-anh-kit.html', 'nguyen-anh-kit-preview.mjs',
         'serve-preview.py', 'sect-courtyard-game-reference-v1.png',
         'pvp-target-stand-west-native-v1.png', 'wanglin-chibi-stand-east-native-v1.png',
         'ngung-khi-approved-art-v1.png', 'releases/kiem-khi-r01-1.0.0/manifest.json',
         'releases/skill-packs/index.json', 'releases/truc-co-approval-1.0.1.json', 'releases/ket-dan-approval-1.0.1.json']
names += [f'review-{pair}-{family}.png' for pair in ['r01-r02', 'r02-r03', 'r03-r04']
          for family in ['sword', 'thunder', 'wind']]
names += [f'review-r04-spirit-redesign-{family}.png' for family in ['sword','thunder','wind']]
files = {root / n for n in names}
for folder in [s['path'] for s in library['skills']] + ['r04-sword-v1', 'r04-thunder-v1', 'r04-wind-v1', 'production', 'milestones']:
    files.update(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
files.update((root / 'releases' / 'skill-packs').glob('*.manifest.json'))
entries = [{'file': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
realms = {realm: {'frames': sum(s['frames'] for s in library['skills'] if s['id'].startswith(realm)),
                  'atlases': sum(s['atlases'] for s in library['skills'] if s['id'].startswith(realm)),
                  'artStatus': 'owner_approved' if realm != 'R04' else 'produced_pending_owner_motion_review'}
          for realm in ['R01', 'R02', 'R03', 'R04']}
manifest = {'id': 'NGUYEN-ANH-UPGRADE-KIT', 'version': '2.0.0', 'date': '2026-10-07',
            'primaryRealm': 'R04', 'realms': realms, 'newR04Frames': 40, 'reusedR04Frames': 116,
            'archiveFrames': 688, 'archiveAtlases': 81, 'activeLibraryFrames': 532, 'activeLibraryAtlases': 62, 'newSpiritFramesThisRevision': 18, 'retainedR04FramesThisRevision': 138, 'runtimeReady': False,
            'automatedTestsPassed': 50, 'browserInteractionVerified': False, 'files': entries}
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
    assert sum('/frames/' in n and n.endswith('.png') for n in archive.namelist()) == 688
    assert sum('/atlases/' in n and n.endswith('.png') for n in archive.namelist()) == 81
digest = hashlib.sha256(zf.read_bytes()).hexdigest()
(release / (name + '.sha256')).write_text(digest + '  ' + zf.name + '\n', encoding='utf8')
print(json.dumps({'archive': str(zf), 'bytes': zf.stat().st_size, 'files': len(entries),
                  'frames': 688, 'atlases': 81, 'verifiedSha256': digest}, indent=2))
