"""Verify the bounded, recoverable retirement of legacy enemy ART.

Reads all ZIP entries, writes restoration witnesses into a disposable isolated
directory, checks active callers, and hashes the retained runtime/reference trees.
Never runs a map/asset builder or writes game data.
"""
from pathlib import Path
import hashlib
import json
import tempfile
import zipfile

W = Path(__file__).resolve().parents[1]
A = W / 'docs/archive/gdd-legacy-enemies-2026-10-15'
M = json.loads((A / 'manifest.json').read_text(encoding='utf-8'))
checks = 0


def check(condition, name):
    global checks
    if not condition:
        raise AssertionError(name)
    checks += 1


def sha(payload):
    return hashlib.sha256(payload).hexdigest()


check(M['status'] == 'retired-from-active-design', 'retirement complete')
check(len({e['file'] for e in M['files']}) == len(M['files']), 'unique original paths')
restoration_witnesses = []
with tempfile.TemporaryDirectory(prefix='gdd-legacy-restore-') as temporary:
    restore_root = Path(temporary).resolve()
    for part in M['parts']:
        path = A / part['file']
        check(path.resolve().parent == A.resolve(), 'bounded ZIP part')
        check(sha(path.read_bytes()) == part['sha256'], 'part hash ' + part['file'])
        expected = {e['file']: e for e in M['files'] if e['part'] == part['file']}
        with zipfile.ZipFile(path) as archive:
            check(set(archive.namelist()) == set(expected), 'exact ZIP entries')
            for file, entry in expected.items():
                target = (restore_root / file).resolve()
                check(target.is_relative_to(restore_root), 'bounded restoration entry')
                payload = archive.read(file)
                check(sha(payload) == entry['sha256'] and len(payload) == entry['bytes'], 'entry byte hash ' + file)
            # Actual disk round trip per part; every other entry is also read/hash-checked.
            entry = next(iter(expected.values()))
            target = restore_root / entry['file']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(archive.read(entry['file']))
            check(sha(target.read_bytes()) == entry['sha256'], 'restoration witness')
            restoration_witnesses.append({'part': part['file'], 'file': entry['file'], 'sha256': entry['sha256']})

notices = set(M['retirementNotices'])
for entry in M['files']:
    if entry['mode'] == 'retire':
        path = W / entry['file']
        if entry['file'] in notices:
            check(path.is_file() and 'lưu trữ' in path.read_text(encoding='utf-8'), 'retirement notice ' + entry['file'])
        else:
            check(not path.exists(), 'old payload absent ' + entry['file'])
for root in M['roots']:
    actual = {p.relative_to(W).as_posix() for p in (W / root).rglob('*') if p.is_file()}
    check(actual == {p for p in notices if p.startswith(root + '/')}, 'no old artwork/metadata/tools under ' + root)
for pin in M['protectedFiles']:
    check(sha((W / pin['file']).read_bytes()) == pin['sha256'], 'protected pin ' + pin['file'])
for tree in M['protectedTrees']:
    root = W / tree['root']
    files = sorted(p for p in root.rglob('*') if p.is_file())
    digest = hashlib.sha256()
    for path in files:
        digest.update((path.relative_to(root).as_posix() + '\0' + sha(path.read_bytes()) + '\0' + str(path.stat().st_size) + '\n').encode())
    check(len(files) == tree['files'] and digest.hexdigest() == tree['sha256'], 'protected tree ' + tree['root'])

names = [Path(p).name for p in M['roots']]
for directory in ['scripts', 'tests', 'client', 'server', 'shared', 'core']:
    parent = W / directory
    for path in parent.rglob('*'):
        if path.is_file() and path.suffix in ('.ts', '.js', '.mjs', '.py'):
            check(not any(name in path.read_text(encoding='utf-8') for name in names), 'no active legacy loader/tool ' + path.relative_to(W).as_posix())
for file in ['docs/design/world/van-hai-living-world-v1/index.html', 'docs/design/characters/gdd-character-concepts-v1/review.mjs']:
    check(not any(name in (W / file).read_text(encoding='utf-8') for name in names), 'detached reviewer ' + file)
package = json.loads((W / 'package.json').read_text(encoding='utf-8'))
for command in package['scripts'].values():
    check(not any(Path(f).name in command for f in M['legacyTools']), 'no active old npm command')
    # Only script/test paths: unrelated external command words need no file check.
    import re
    for file in re.findall(r'(?:scripts|tests)/[\w./-]+\.(?:mjs|js|py|ts)\b', command):
        check((W / file).is_file(), 'npm target exists ' + file)
inventory = json.loads((W / 'docs/design/characters/gdd-character-concepts-v1/inventory.json').read_text(encoding='utf-8'))
check('monstersAndElites' not in inventory['existing'] and 'bosses' not in inventory['existing'], 'legacy removed from active ART inventory')
check(inventory['retiredLegacy']['status'] == 'archived-excluded-from-active-art', 'explicit retirement status')
check(not M['runtimeAssetDependenciesFound'], 'no retired dependency in runtime')

report = {'schema': 'gdd-legacy-enemy-cleanup-verification-1', 'date': '2026-10-15', 'status': 'passed', 'checks': checks,
          'archiveParts': len(M['parts']), 'allArchivedEntryHashes': len(M['files']), 'restorationWitnesses': restoration_witnesses,
          'retiredPacks': len(M['roots']), 'retiredToolsAndTests': len(M['legacyTools']), 'activeLegacyPayloadFiles': 0,
          'protectedTrees': M['protectedTrees'], 'protectedPins': len(M['protectedFiles']), 'runtimeModified': False}
(A / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k not in ['restorationWitnesses', 'protectedTrees']}))
