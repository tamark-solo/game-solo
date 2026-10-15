"""Read exact historical basis bytes from the owner-authorized asset archive.

This is a lineage resolver for verification, never a runtime asset fallback.
Original provenance paths and hashes remain unchanged.
"""
from functools import lru_cache
from pathlib import Path
import hashlib
import json
import zipfile

WORKSPACE = Path(__file__).resolve().parents[1]
ARCHIVE = WORKSPACE / 'docs/archive/gdd-legacy-enemies-2026-10-15'


@lru_cache(maxsize=1)
def archived_entries():
    manifest = json.loads((ARCHIVE / 'manifest.json').read_text(encoding='utf-8'))
    return {x['file']: x for x in manifest['files'] if x['mode'] == 'retire'}


def read_basis_bytes(path):
    path = Path(path).resolve()
    if path.is_file():
        return path.read_bytes()
    relative = path.relative_to(WORKSPACE).as_posix()
    entry = archived_entries().get(relative)
    if entry is None:
        raise FileNotFoundError(path)
    part = (ARCHIVE / entry['part']).resolve()
    if part.parent != ARCHIVE.resolve():
        raise ValueError('Archive part outside the registered archive')
    with zipfile.ZipFile(part) as archive:
        payload = archive.read(relative)
    if len(payload) != entry['bytes'] or hashlib.sha256(payload).hexdigest() != entry['sha256']:
        raise ValueError('Archived basis changed: ' + relative)
    return payload
