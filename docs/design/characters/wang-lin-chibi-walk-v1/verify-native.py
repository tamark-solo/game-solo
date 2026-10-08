"""Read-only checks for frame packing and reuse; visual approval remains separate."""
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('png_reader', ROOT.parent / 'player-avatars-v2/verify_native.py')
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)
NATIVE = ROOT / 'native-v2'
BASE = ROOT / 'native-v1'
CHANGED = 'wanglin_chibi_walk_east_03'
meta = json.loads((NATIVE / 'atlas.json').read_text(encoding='utf-8'))
baseline = json.loads((BASE / 'atlas.json').read_text(encoding='utf-8'))
width, height, colors, atlas = reader.indexed_png(NATIVE / 'atlas.png')
directions = ['south', 'west', 'east', 'north']
assert (width, height) == (320, 384)
assert meta['availableDirections'] == directions
assert meta['frameSizePx'] == [64, 96] and meta['footAnchorPx'] == [32, 88]
assert len(meta['frames']) == 20
assert meta['changedFrameIds'] == [CHANGED]
assert meta['animations'] == baseline['animations']
assert set(meta['animations']) == {f'{state}_{direction}' for direction in directions for state in ['stand', 'walk']}
assert colors[:24] == [tuple(bytes.fromhex(color[1:])) for color in meta['palette']]
east_root = ROOT.parent / 'wang-lin-chibi-pilot-v1/native-v1'
east = json.loads((east_root / 'atlas.json').read_text(encoding='utf-8'))
used, heights, reports = set(), [], {}
for direction in directions:
    stand = meta['animations'][f'stand_{direction}']
    walk = meta['animations'][f'walk_{direction}']
    assert len(stand) == 1 and len(walk) == 4
    hashes, direction_heights = [], []
    for name in stand + walk:
        frame = meta['frames'][name]
        assert frame['anchorPx'] == [32, 88]
        fw, fh, fc, rows = reader.indexed_png(NATIVE / frame['image'])
        assert (fw, fh) == (64, 96) and fc[:24] == colors[:24]
        pixels = b''.join(rows)
        digest = hashlib.sha256(pixels).hexdigest()
        assert digest == frame['pixelHash']
        hashes.append(digest)
        used.update(pixels)
        rect = frame['frame']
        for y, row in enumerate(rows):
            assert row == atlas[rect['y'] + y][rect['x']:rect['x'] + 64]
        opaque = [(x, y) for y, row in enumerate(rows) for x, p in enumerate(row) if colors[p][3]]
        assert max(y for x, y in opaque) == 88
        assert min(y for x, y in opaque) >= 1
        assert min(x for x, y in opaque) >= 1 and max(x for x, y in opaque) <= 62
        direction_heights.append(89 - min(y for x, y in opaque))
        if name != CHANGED:
            assert digest == baseline['frames'][name]['pixelHash']
            assert (NATIVE / frame['image']).read_bytes() == (BASE / baseline['frames'][name]['image']).read_bytes()
        else:
            assert digest != baseline['frames'][name]['pixelHash']
        if direction == 'east' and name != CHANGED:
            assert digest == east['frames'][name]['pixelHash']
            assert (NATIVE / frame['image']).read_bytes() == (east_root / east['frames'][name]['image']).read_bytes()
    assert len(set(hashes)) == 5, f'Duplicate poses: {direction}'
    assert max(direction_heights) - min(direction_heights) <= 2
    reports[direction] = {'standFrames': 1, 'walkFrames': 4, 'distinctPoses': 5, 'heightRangePx': [min(direction_heights), max(direction_heights)]}
    heights.extend(direction_heights)
assert max(heights) - min(heights) <= 2
assert max(used) < 24 and {colors[p][3] for p in used} == {0, 255}
result = {'passed': True, 'nativeFrames': 20, 'newFramesFromOriginalPilot': 16, 'reusedEastFrames': 4, 'directions': directions,
          'frameSizePx': [64, 96], 'atlasSizePx': [320, 384], 'anchorPx': [32, 88], 'paletteEntries': 24,
          'alphaValues': [0, 255], 'heightRangePx': [min(heights), max(heights)], 'eastPixelsPreserved': False,
          'changedFrameIds': [CHANGED], 'preservedOtherFrameCount': 19, 'unchangedDirections': ['south', 'west', 'north'],
          'framesMatchAtlas': True, 'pngCRCsAndHashesValid': True, 'noSyntheticPoseGeometry': True,
          'perDirection': reports, 'ownerNewMotionApproval': 'east_final_frame_fix_pending_review'}
(ROOT / 'verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result))
