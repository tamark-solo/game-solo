"""Import an explicitly approved Editor project; never write into owner authoring storage.

Requires Pillow for this one-time packaging step. npm run assets uses the packaged
files only and does not require Python or the original review worktree.
"""
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('project', type=Path)
parser.add_argument('--review', required=True, type=Path)
args = parser.parse_args()
source = args.project.read_bytes()
project = json.loads(source)
level = next(l for l in project['levels'] if l['id'] == project['activeLevelId'])
owner_path = root / 'docs/data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json'
owner_bytes = owner_path.read_bytes()
owner = json.loads(owner_bytes)['levels'][0]
assert level['regions'] == owner['regions'], 'Refusing to change owner navigation.'
assert (level['width'], level['height'], level['spawn'], level['walkPolicy']) == (
    owner['width'], owner['height'], owner['spawn'], owner['walkPolicy'])
assert len(project['assets']) == 22 and len(level['objects']) == 22
out = root / 'docs/design/world/hang-nhac-layered-v1'
(out / 'images').mkdir(parents=True, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
images, image_records = {}, []
for asset in project['assets']:
    for part in asset['parts']:
        mime, encoded = part['file'].split(',', 1)
        assert mime in ('data:image/png;base64', 'data:image/webp;base64')
        raw = base64.b64decode(encoded, validate=True)
        image = Image.open(io.BytesIO(raw)).convert('RGBA')
        assert image.size == (asset['width'], asset['height'])
        packed = io.BytesIO()
        image.save(packed, format='WEBP', lossless=True, exact=True, method=6)
        data, extension = packed.getvalue(), 'webp'
        # Some encoders discard invisible RGB. Preserve all four channels even then.
        if Image.open(io.BytesIO(data)).convert('RGBA').tobytes() != image.tobytes():
            assert mime == 'data:image/png;base64'
            data, extension = raw, 'png'
        name = f'part-{sha(data)[:20]}.{extension}'
        (out / 'images' / name).write_bytes(data)
        url = f'/assets/hang-nhac/layers/{name}'
        images[url] = image
        image_records.append({'assetId': asset['id'], 'partId': part['id'], 'file': 'images/' + name,
            'url': url, 'sha256': sha(data), 'bytes': len(data), 'sourceSha256': sha(raw),
            'rgbaSha256': sha(image.tobytes()), 'size': list(image.size), 'pixelsPreserved': True})
        part['file'] = url

# Small representative image for minimap and the standalone HUD comparison.
# The game renders the independent lossless parts, not this flattened preview.
assets = {a['id']: a for a in project['assets']}
preview = Image.new('RGBA', (level['width'], level['height']), level['background'])
rows = []
for index, obj in enumerate(level['objects']):
    asset = assets[obj['assetId']]
    assert obj['scale'] == 1 and not obj['flipX'] and obj['opacity'] == 1
    pivot = obj.get('pivot', asset['pivot'])
    for part in asset['parts']:
        layer = next(l for l in level['layers'] if l['id'] == (obj['coverLayerId'] if part['cover'] else obj['layerId']))
        if layer['enabled']:
            band = 0 if layer['kind'] == 'ground' else 2 if part['cover'] else 1
            rows.append((band, obj['y'], index, images[part['file']],
                (round(obj['x'] - pivot['x']), round(obj['y'] - pivot['y']))))
for _, _, _, image, position in sorted(rows, key=lambda r: r[:3]):
    preview.alpha_composite(image, position)
preview_data = io.BytesIO()
preview.convert('RGB').save(preview_data, format='WEBP', quality=92, method=6)
preview_bytes = preview_data.getvalue()
(out / 'overview.webp').write_bytes(preview_bytes)
project_bytes = (json.dumps(project, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
(out / 'project.json').write_bytes(project_bytes)
manifest = {'schema': 'game-solo-hang-nhac-layer-package-1',
    'sourceProjectSha256': sha(source), 'sourceReviewSha256': sha(args.review.read_bytes()),
    'sourceReview': 'hang-nhac-layer-split-v1/multipart-review-v4/review.html',
    'sourceRevision': 'main-route-v6 / posts v7 / trees v9',
    'approval': {'scope': ['HUD integration', 'review map layer integration'],
        'source': 'Project owner explicitly requested integration and identified the review page.'},
    'ownerProjectSha256': sha(owner_bytes), 'navigationUnchanged': True,
    'projectPath': 'project.json', 'projectSha256': sha(project_bytes), 'images': image_records,
    'preview': {'file': 'overview.webp', 'sha256': sha(preview_bytes), 'bytes': len(preview_bytes),
        'url': f'/assets/hang-nhac/overview-{sha(preview_bytes)[:20]}.webp'},
    'counts': {'objects': len(level['objects']), 'parts': len(image_records),
        'coverParts': sum(part['cover'] for asset in project['assets'] for part in asset['parts'])}}
(out / 'package.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'packaged': str(out), 'counts': manifest['counts'],
    'imageBytes': sum(i['bytes'] for i in image_records), 'previewBytes': len(preview_bytes),
    'navigationUnchanged': True, 'allRgbaPixelsPreserved': True}, indent=2))
