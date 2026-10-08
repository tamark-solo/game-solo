"""Read-only checks for native frame data, anchors and the spirit's transparency."""
import hashlib
import importlib.util
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[3]
spec = importlib.util.spec_from_file_location('png_reader', BASE.parent / 'player-avatars-v2/verify_native.py')
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)
models = json.loads((BASE / 'models.json').read_text(encoding='utf-8'))
assert hashlib.sha256((ROOT / models['referenceAtlasPath']).read_bytes()).hexdigest() == models['referenceAtlasSHA256']

def chest_holes(rows, colors):
    visited, result = set(), []
    for sy in range(96):
        for sx in range(64):
            if (sx, sy) in visited or colors[rows[sy][sx]][3]:
                continue
            queue, component = [(sx, sy)], []
            visited.add((sx, sy))
            while queue:
                x, y = queue.pop()
                component.append((x, y))
                for nx, ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                    if 0 <= nx < 64 and 0 <= ny < 96 and (nx, ny) not in visited and not colors[rows[ny][nx]][3]:
                        visited.add((nx, ny)); queue.append((nx, ny))
            xs, ys = [p[0] for p in component], [p[1] for p in component]
            if len(component) >= 4 and 12 <= min(xs) and max(xs) <= 50 and 30 <= min(ys) and max(ys) <= 62:
                result.append({'pixels':len(component),'bounds':[min(xs),min(ys),max(xs),max(ys)]})
    return result

reports = []
for model in models['models']:
    native = BASE / model['folder'] / model['nativeVersion']
    meta = json.loads((native / 'atlas.json').read_text(encoding='utf-8'))
    width, height, colors, atlas = reader.indexed_png(native / 'atlas.png')
    assert (width, height) == (320, 384)
    assert meta['characterId'] == model['characterId'] and len(meta['frames']) == 20
    assert meta['frameSizePx'] == [64, 96] and meta['footAnchorPx'] == [32, 88]
    assert meta['movementKind'] == model['movementKind'] and meta['hoverHeightPx'] == model['hoverHeightPx']
    assert colors[:24] == [tuple(bytes.fromhex(c[1:])) for c in meta['palette']]
    used, heights, holes = set(), [], {}
    for direction in ['south','west','east','north']:
        names = meta['animations'][f'stand_{direction}'] + meta['animations'][f'walk_{direction}']
        assert len(meta['animations'][f'stand_{direction}']) == 1 and len(meta['animations'][f'walk_{direction}']) == 4
        digests, direction_heights = [], []
        for name in names:
            frame = meta['frames'][name]
            fw, fh, fc, rows = reader.indexed_png(native / frame['image'])
            assert (fw, fh) == (64, 96) and fc[:24] == colors[:24]
            assert frame['anchorPx'] == [32, 88]
            pixels = b''.join(rows); used.update(pixels)
            digest = hashlib.sha256(pixels).hexdigest(); assert digest == frame['pixelHash']; digests.append(digest)
            r = frame['frame']
            for y, row in enumerate(rows):
                assert row == atlas[r['y']+y][r['x']:r['x']+64]
            opaque = [(x,y) for y,row in enumerate(rows) for x,p in enumerate(row) if colors[p][3]]
            assert min(x for x,y in opaque) >= 1 and max(x for x,y in opaque) <= 62
            assert min(y for x,y in opaque) >= 1
            assert max(y for x,y in opaque) == 88 - model['hoverHeightPx']
            if model['characterId'] == 'CHR-LI-MUWAN':
                # The old restricted palette mapped her hair into robe purples.
                top = min(y for x,y in opaque)
                crown = [rows[y][x] for y in range(top+2, top+14) for x in range(64) if colors[rows[y][x]][3]]
                # A few accessory/highlight pixels can share robe colors.
                # Catch the previous predominantly purple hair, while allowing
                # the lilac tie and quantized edge accents in the new design.
                purple_pixels = sum(7 <= p <= 13 for p in crown)
                assert crown and purple_pixels / len(crown) <= 0.05, f'Predominantly purple crown in {name}'
            direction_heights.append(max(y for x,y in opaque)-min(y for x,y in opaque)+1)
            if model['movementKind'] == 'glide':
                found = chest_holes(rows, colors); assert found, f'No transparent chest hole in {name}'
                holes[name] = found
        assert len(set(digests)) == 5, f'Duplicate pose in {model["folder"]}/{direction}'
        assert max(direction_heights)-min(direction_heights) <= 3
        heights.extend(direction_heights)
    assert len(list((native / 'frames').glob('*.png'))) == 20
    assert max(used) < 24 and {colors[p][3] for p in used} == {0,255}
    assert max(heights)-min(heights) <= 3
    reports.append({'characterId':model['characterId'],'movementKind':model['movementKind'],'frames':20,'standFrames':4,'movementFrames':16,'heightRangePx':[min(heights),max(heights)],'anchorPx':[32,88],'hoverHeightPx':model['hoverHeightPx'],'paletteEntries':24,'framesMatchAtlas':True,'pngCRCsAndHashesValid':True,'transparentChestFrameCount':len(holes)})
accepted = [m['characterId'] for m in models['models'] if m.get('prototypeAcceptance',{}).get('level') == 'accepted_prototype_baseline']
result = {'passed':True,'newFrames':80,'models':reports,'referenceWangLinPngUnchanged':True,'artMethod':'built_in_image_gen','newArtApproval':'partial_owner_acceptance' if accepted else 'pending_owner_review','acceptedPrototypeCharacterIds':accepted}
(BASE / 'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
