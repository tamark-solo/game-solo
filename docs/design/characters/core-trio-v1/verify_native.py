"""Read exported static studies and verify their PNG and handoff metadata."""
from pathlib import Path
import hashlib
import importlib.util
import json

ROOT = Path(__file__).resolve().parent
decoder_spec = importlib.util.spec_from_file_location('avatar_png_reader', ROOT.parent / 'player-avatars-v2/verify_native.py')
decoder = importlib.util.module_from_spec(decoder_spec)
decoder_spec.loader.exec_module(decoder)


def validate(slug, version, expected_identity_approval=False):
    spec = json.loads((ROOT / slug / 'pixel-spec.json').read_text(encoding='utf-8-sig'))
    native = ROOT / slug / version
    meta = json.loads((native / 'atlas.json').read_text(encoding='utf-8-sig'))
    js = (native / 'atlas-data.js').read_text(encoding='utf-8-sig').strip()
    prefix = 'window.' + spec['dataGlobal'] + ' = '
    assert js.startswith(prefix) and js.endswith(';')
    assert json.loads(js[len(prefix):-1]) == meta
    width, height = spec['frameSizePx']
    anchor = spec['anchorPx']
    hover_height = spec.get('hoverHeightPx', 0)
    content_bottom = anchor[1] - hover_height
    assert meta['characterId'] == spec['characterId']
    assert meta['identityApprovedByProjectOwner'] is expected_identity_approval and not meta['runtimeReady']
    assert meta['frameSizePx'] == [width, height] and meta['anchorPx'] == anchor
    assert meta['anchorKind'] == spec['anchorKind'] and len(meta['frames']) == 4
    assert meta.get('hoverHeightPx', 0) == hover_height
    assert meta['directionOrder'] == ['south', 'west', 'east', 'north']
    assert len(list((native / 'frames').glob('*.png'))) == 4
    atlas_width, atlas_height, colors, atlas_rows = decoder.indexed_png(native / 'atlas.png')
    assert (atlas_width, atlas_height) == (width * 4, height)
    assert colors[:24] == [tuple(bytes.fromhex(value[1:])) for value in spec['palette']]
    used, heights, hashes = set(), [], set()
    for index, direction in enumerate(meta['directionOrder']):
        ids = meta['animations']['static_' + direction]
        assert len(ids) == 1
        name = ids[0]
        definition = meta['frames'][name]
        assert definition['frame'] == {'x': index * width, 'y': 0, 'w': width, 'h': height}
        assert definition['anchorPx'] == anchor
        png_width, png_height, palette, rows = decoder.indexed_png(native / definition['image'])
        assert (png_width, png_height) == (width, height) and palette == colors
        raw = b''.join(rows)
        probe = spec.get('transparentChestProbePx', {}).get(direction)
        if probe:
            x, y = probe
            assert colors[rows[y][x]][3] == 0, 'Chest gap must be transparent: ' + direction
            assert any(colors[rows[y][p]][3] for p in range(max(0, x - 8), x))
            assert any(colors[rows[y][p]][3] for p in range(x + 1, min(width, x + 9)))
        digest = hashlib.sha256(raw).hexdigest()
        assert digest == definition['pixelHash']
        hashes.add(digest)
        used.update(raw)
        for y, row in enumerate(rows):
            assert row == atlas_rows[y][index * width:(index + 1) * width]
        solid = [(x, y) for y, row in enumerate(rows) for x, value in enumerate(row) if colors[value][3]]
        assert max(y for x, y in solid) == content_bottom
        assert min(y for x, y in solid) >= 1
        assert min(x for x, y in solid) >= 1 and max(x for x, y in solid) < width - 1
        heights.append(content_bottom - min(y for x, y in solid) + 1)
    assert max(used) < 24 and {colors[value][3] for value in used} == {0, 255}
    assert len(hashes) == 4
    return {'characterId': meta['characterId'], 'directory': slug + '/' + version,
            'frameCount': 4, 'frameSizePx': [width, height], 'atlasSizePx': [atlas_width, atlas_height],
            'anchorPx': anchor, 'anchorKind': spec['anchorKind'], 'paletteEntries': 24,
            'hoverHeightPx': hover_height, 'bottomPixelsAlignWithProjection': True,
            'transparentChestVoidVerified': True if spec.get('transparentChestProbePx') else None,
            'activePaletteEntries': len(used), 'alphaValues': [0, 255], 'heightRangePx': [min(heights), max(heights)],
            'hashesMatch': True, 'individualFramesMatchAtlas': True, 'jsonAndViewerDataMatch': True,
            'crcAndPaddingValid': True, 'fourDistinctDirections': True, 'identityApproval': meta['identityApprovedByProjectOwner'],
            'atlasBytes': (native / 'atlas.png').stat().st_size}


if __name__ == '__main__':
    print(json.dumps({'schemaVersion': 'core-static-verification-1', 'sets': [validate('situ-nan', 'native-v4'), validate('li-muwan', 'native-v2', True)]}, ensure_ascii=True, indent=2))
