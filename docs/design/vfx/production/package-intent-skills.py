"""Package one skill per archive, preserve paths for code imports, verify every checksum."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
library = json.loads((root / 'library.json').read_text(encoding='utf8'))
output = root / 'releases' / 'skill-packs'
output.mkdir(parents=True, exist_ok=True)
shared = ['frame-by-frame-r01/sequence-system.mjs', 'production/p2-model.mjs',
          'production/p2-controller.mjs', 'production/r02-model.mjs',
          'production/r02-controller.mjs', 'production/export-sequences.mjs',
          'production/pack-atlases.mjs']
reports = []
for skill in library['skills']:
    folder = root / skill['path']
    if not (folder / 'clips.json').exists():
        continue
    clips = json.loads((folder / 'clips.json').read_text(encoding='utf8'))['clips']
    realm = skill['id'].split('-')[0]
    version = skill.get('packVersion', '1.0.0')
    files = {p for p in folder.rglob('*') if p.is_file() and '__pycache__' not in p.parts}
    skill_shared = shared + (['production/spirit-model.mjs', 'production/r04-model.mjs', 'production/r04-controller.mjs', 'production/export-r04-sequences.mjs'] if realm == 'R04' else [])
    if realm == 'R04' and skill['path'].endswith('-v2'):
        skill_shared += ['production/spirit-sigil-model.mjs', 'production/r04-sigil-model.mjs', 'production/r04-sigil-controller.mjs', 'production/r04-spirit-v2-art-selection.json']
    if realm == 'R05':
        skill_shared += ['production/r05-model.mjs', 'production/r05-controller.mjs', 'production/r05-lighting.mjs', 'production/export-r04-sequences.mjs', 'production/r05-art-selection.json']
    files.update(root / p for p in skill_shared if (root / p).exists())
    entries = [{'file': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
                'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
    manifest = {'id': skill['id'], 'name': skill['name'], 'version': version, 'realm': realm,
                'artStatus': skill['artStatus'], 'runtimeReady': False, 'date': '2026-10-07',
                'assetPath': skill['path'], 'frames': sum(len(c['frames']) for c in clips.values()),
                'atlases': len(clips), 'sourceOfTruth': 'individual_RGBA_PNG_frames',
                'files': entries, 'previewIncluded': False,
                'approval': skill.get('approval'),
                'integration': 'presentation_helpers_only_host_owns_damage_and_movement'}
    filename = skill['id'].lower() + '-' + version
    manifest_file = output / (filename + '.manifest.json')
    # A sealed pack cannot be overwritten; create a new version for changed deliverables.
    if manifest_file.exists():
        previous = json.loads(manifest_file.read_text(encoding='utf8'))
        if previous != manifest:
            raise RuntimeError('Existing sealed pack differs: ' + filename)
        archive_file = output / (filename + '.zip')
        digest = hashlib.sha256(archive_file.read_bytes()).hexdigest()
        assert digest == (output / (filename + '.sha256')).read_text().split()[0]
        reports.append({'id': skill['id'], 'archive': archive_file.name, 'frames': manifest['frames'],
                        'atlases': manifest['atlases'], 'bytes': archive_file.stat().st_size,
                        'sha256': digest, 'artStatus': manifest['artStatus'], 'unchanged': True})
        continue
    manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    archive_file = output / (filename + '.zip')
    with ZipFile(archive_file, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
        for p in sorted(files):
            archive.write(p, skill['id'] + '/' + p.relative_to(root).as_posix())
        archive.write(manifest_file, skill['id'] + '/PACK-MANIFEST.json')
        archive.writestr(skill['id'] + '/PACK-README.txt',
                        'Skill: ' + skill['name'] + '\nAsset path: ' + skill['path'] +
                        '\nSource of truth: frames/<clip>/001.png. Atlas is a build output.\n' +
                        'clips.json: FPS, holds, pivot, atlas rects. skill.json: timeline and host contract.\n' +
                        'Art approval is recorded in PACK-MANIFEST; original source metadata is preserved.\n' +
                        'No web preview in this individual pack; use the complete cultivation skill kit.\n' +
                        '24 FPS. East-facing Wang Lin chibi, body ~80 world px.\n' +
                        'Presentation helpers only; host controls damage, hit, projectile pose and movement.\n' +
                        'No runtime integration, other actor directions, audio or crowd LOD yet.\n' +
                        'Repacking PNG frames needs Node + Sharp; do not re-extract over edited frames.\n')
    with ZipFile(archive_file) as archive:
        assert archive.testzip() is None
        for entry in entries:
            assert hashlib.sha256(archive.read(skill['id'] + '/' + entry['file'])).hexdigest() == entry['sha256']
        assert sum('/frames/' in p and p.endswith('.png') for p in archive.namelist()) == manifest['frames']
    digest = hashlib.sha256(archive_file.read_bytes()).hexdigest()
    (output / (filename + '.sha256')).write_text(digest + '  ' + archive_file.name + '\n', encoding='utf8')
    reports.append({'id': skill['id'], 'archive': archive_file.name, 'frames': manifest['frames'],
                    'atlases': manifest['atlases'], 'bytes': archive_file.stat().st_size, 'sha256': digest})
(output / 'index.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps(reports, ensure_ascii=False, indent=2))
