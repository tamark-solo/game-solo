"""Bundle existing source files and verify the exported archive, without altering art."""
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
folders = ['frame-by-frame-r01', 'r01-thunder-v1', 'r01-wind-v1', 'production', 'milestones']
names = ['library.json', 'NGUNG-KHI-KIT.md', 'README.md', 'kiem-khi-preview.html',
         'kiem-khi-preview-v3.mjs', 'ngung-khi-kit.html', 'ngung-khi-kit-preview.mjs',
         'serve-preview.py', 'sect-courtyard-game-reference-v1.png',
         'pvp-target-stand-west-native-v1.png', 'wanglin-chibi-stand-east-native-v1.png',
         'ngung-khi-approved-art-v1.png', 'releases/kiem-khi-r01-1.0.0/manifest.json']
files = [root / name for name in names]
for folder in folders:
    files.extend(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
files = sorted(set(files))
entries = []
for file in files:
    data = file.read_bytes()
    entries.append({'file': file.relative_to(root).as_posix(), 'bytes': len(data),
                    'sha256': hashlib.sha256(data).hexdigest()})
manifest = {'id': 'NGUNG-KHI-SKILL-KIT', 'version': '1.1.0', 'date': '2026-10-07',
            'frames': 114, 'atlases': 13, 'swordArtApproved': True,
            'newP2ArtStatus': 'produced_pending_owner_motion_review',
            'runtimeReady': False, 'browserInteractionVerified': False, 'files': entries}
release = root / 'releases'
release.mkdir(exist_ok=True)
manifest_file = release / 'ngung-khi-kit-1.1.0.manifest.json'
manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
zip_file = release / 'ngung-khi-kit-1.1.0.zip'
with ZipFile(zip_file, 'w', compression=ZIP_DEFLATED, compresslevel=6) as archive:
    for file in files:
        archive.write(file, 'ngung-khi-kit-1.1.0/' + file.relative_to(root).as_posix())
    archive.write(manifest_file, 'ngung-khi-kit-1.1.0/releases/' + manifest_file.name)
with ZipFile(zip_file) as archive:
    for entry in entries:
        data = archive.read('ngung-khi-kit-1.1.0/' + entry['file'])
        assert hashlib.sha256(data).hexdigest() == entry['sha256'], entry['file']
    assert sum('/frames/' in name and name.endswith('.png') for name in archive.namelist()) == 114
    assert sum('/atlases/' in name and name.endswith('.png') for name in archive.namelist()) == 13
    assert archive.testzip() is None
checksum = hashlib.sha256(zip_file.read_bytes()).hexdigest()
(release / 'ngung-khi-kit-1.1.0.sha256').write_text(checksum + '  ' + zip_file.name + '\n', encoding='utf8')
print(json.dumps({'zip': str(zip_file), 'bytes': zip_file.stat().st_size,
                  'files': len(entries), 'frames': 114, 'atlases': 13,
                  'verifiedSha256': checksum}, indent=2))
