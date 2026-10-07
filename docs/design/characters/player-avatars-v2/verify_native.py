"""Read-only validation of exported avatar PNGs against their handoff metadata.

Uses only the Python standard library. Does not draw or modify any image.
"""
from pathlib import Path
import hashlib
import json
import struct
import zlib

ROOT = Path(__file__).resolve().parent


def paeth(a, b, c):
    value = a + b - c
    distances = (abs(value - a), abs(value - b), abs(value - c))
    return (a, b, c)[distances.index(min(distances))]


def indexed_png(path):
    encoded = path.read_bytes()
    assert encoded[:8] == b'\x89PNG\r\n\x1a\n', path
    cursor, compressed, palette, alpha = 8, bytearray(), None, None
    while cursor < len(encoded):
        size = struct.unpack_from('>I', encoded, cursor)[0]
        kind = encoded[cursor + 4:cursor + 8]
        payload = encoded[cursor + 8:cursor + 8 + size]
        crc = struct.unpack_from('>I', encoded, cursor + 8 + size)[0]
        assert zlib.crc32(kind + payload) & 0xffffffff == crc, (path, kind)
        if kind == b'IHDR':
            width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', payload)
            assert (depth, color, compression, filtering, interlace) == (8, 3, 0, 0, 0), path
        elif kind == b'PLTE':
            palette = [tuple(payload[i:i+3]) for i in range(0, len(payload), 3)]
        elif kind == b'tRNS':
            alpha = list(payload)
        elif kind == b'IDAT':
            compressed.extend(payload)
        cursor += 12 + size
        if kind == b'IEND':
            break
    assert palette is not None, path
    rgba = [entry + ((alpha[i] if alpha and i < len(alpha) else 255),) for i, entry in enumerate(palette)]
    raw = zlib.decompress(compressed)
    assert len(raw) == (width + 1) * height, path
    rows, previous = [], bytearray(width)
    cursor = 0
    for _ in range(height):
        kind = raw[cursor]
        row = bytearray(raw[cursor + 1:cursor + 1 + width])
        cursor += width + 1
        for x in range(width):
            a = row[x - 1] if x else 0
            b = previous[x]
            c = previous[x - 1] if x else 0
            if kind == 1:
                row[x] = (row[x] + a) & 255
            elif kind == 2:
                row[x] = (row[x] + b) & 255
            elif kind == 3:
                row[x] = (row[x] + (a + b) // 2) & 255
            elif kind == 4:
                row[x] = (row[x] + paeth(a, b, c)) & 255
            else:
                assert kind == 0, (path, kind)
        rows.append(bytes(row))
        previous = row
    return width, height, rgba, rows


def validate_set(gender):
    spec = json.loads((ROOT / gender / 'pixel-spec.json').read_text(encoding='utf-8-sig'))
    native = ROOT / gender / 'native-v2'
    metadata = json.loads((native / 'atlas.json').read_text(encoding='utf-8-sig'))
    javascript = (native / 'atlas-data.js').read_text(encoding='utf-8-sig').strip()
    prefix = 'window.' + spec['dataGlobal'] + ' = '
    assert javascript.startswith(prefix) and javascript.endswith(';')
    assert json.loads(javascript[len(prefix):-1]) == metadata
    assert metadata['identityApprovedByProjectOwner'] is False
    assert metadata['characterId'] == spec['characterId']
    assert metadata['animationStatus'] == 'draft_identity_and_motion_review'
    assert metadata['frameSizePx'] == [64, 96] and metadata['footAnchorPx'] == [32, 88]
    assert metadata['palette'] == spec['palette'] and len(spec['palette']) == 24
    assert len(metadata['frames']) == 28 and len(list((native / 'frames').glob('*.png'))) == 28
    assert spec['runtimeReady'] is False
    expected_rgba = [tuple(bytes.fromhex(color[1:])) for color in spec['palette']]
    width, height, colors, atlas_rows = indexed_png(native / 'atlas.png')
    assert (width, height) == (448, 384) and colors[:24] == expected_rgba
    used, heights, hashes = set(), [], {}
    for name, definition in metadata['frames'].items():
        frame_width, frame_height, frame_colors, rows = indexed_png(native / definition['image'])
        assert (frame_width, frame_height) == (64, 96) and frame_colors == colors, name
        pixels = b''.join(rows)
        used.update(pixels)
        digest = hashlib.sha256(pixels).hexdigest()
        assert digest == definition['pixelHash'], name
        hashes[name] = digest
        assert definition['anchorPx'] == [32, 88] and definition['sourceSize'] == {'w': 64, 'h': 96}
        rectangle = definition['frame']
        assert (rectangle['w'], rectangle['h']) == (64, 96)
        assert rectangle['x'] % 64 == 0 and rectangle['y'] % 96 == 0
        assert 0 <= rectangle['x'] <= 384 and 0 <= rectangle['y'] <= 288
        for y, row in enumerate(rows):
            assert row == atlas_rows[rectangle['y'] + y][rectangle['x']:rectangle['x'] + 64], name
        opaque = [(x, y) for y, row in enumerate(rows) for x, pixel in enumerate(row) if colors[pixel][3]]
        assert len(opaque) >= 400 and max(y for x, y in opaque) == 88, name
        assert min(x for x, y in opaque) >= 1 and max(x for x, y in opaque) <= 62, name
        assert min(y for x, y in opaque) >= 1, name
        heights.append(89 - min(y for x, y in opaque))
    assert max(used) < 24 and {colors[i][3] for i in used} == {0, 255}
    walk_distinct = {}
    for row, direction in enumerate(('south', 'west', 'east', 'north')):
        stand = metadata['animations']['stand_' + direction]
        walk = metadata['animations']['walk_' + direction]
        assert len(stand) == 1 and len(walk) == 6
        assert metadata['frames'][stand[0]]['frame']['x'] == 0
        for column, name in enumerate(stand + walk):
            assert metadata['frames'][name]['frame'] == {'x': column * 64, 'y': row * 96, 'w': 64, 'h': 96}
        walk_distinct[direction] = len({hashes[name] for name in walk})
        assert walk_distinct[direction] == 6, direction
    return {
        'characterId': spec['characterId'], 'nativeDirectory': gender + '/native-v2',
        'frameCount': 28, 'frameSizePx': [64, 96], 'atlasSizePx': [448, 384],
        'paletteEntries': 24, 'activePaletteEntries': len(used), 'alphaValues': [0, 255],
        'heightRangePx': [min(heights), max(heights)], 'bottomPixelY': 88,
        'pngCrcsValid': True, 'hashesMatch': True, 'individualFramesMatchAtlas': True,
        'jsonAndViewerDataMatch': True, 'distinctWalkFrames': walk_distinct,
        'atlasBytes': (native / 'atlas.png').stat().st_size,
        'identityApproval': False, 'motionQuality': 'visual_review_required'
    }


if __name__ == '__main__':
    male = json.loads((ROOT / 'male/pixel-spec.json').read_text(encoding='utf-8-sig'))
    female = json.loads((ROOT / 'female/pixel-spec.json').read_text(encoding='utf-8-sig'))
    assert male['palette'] == female['palette']
    print(json.dumps({'schemaVersion': 'native-verification-1', 'sets': [validate_set('male'), validate_set('female')]}, ensure_ascii=True, indent=2))
