"""Inspect alpha-isolated body regions without assuming equal cells or repainting."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import sys

R = Path(__file__).resolve().parent
ledger = json.loads((R / 'generation.json').read_text(encoding='utf-8'))
job = next(j for j in ledger['jobs'] if j['id'] == sys.argv[1])
path = R / job['source']
image = Image.open(path).convert('RGBA')
w, h = image.size
alpha = image.getchannel('A')
mask = bytearray(alpha.point(lambda value: 255 if value >= 128 else 0).tobytes())
regions = []
for i, value in enumerate(mask):
    if not value:
        continue
    stack = [i]
    mask[i] = 0
    x0 = x1 = i % w
    y0 = y1 = i // w
    count = 0
    while stack:
        q = stack.pop()
        y, x = divmod(q, w)
        x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
        count += 1
        for n in (q-w if y else -1, q+w if y+1<h else -1, q-1 if x else -1, q+1 if x+1<w else -1):
            if n >= 0 and mask[n]:
                mask[n] = 0
                stack.append(n)
    if count >= 600:
        regions.append({'pixels': count, 'box': [x0, y0, x1+1, y1+1]})
regions.sort(key=lambda region: (region['box'][1], region['box'][0]))
# Assign rows by observed columns, not by guessed fixed cell height.
rows = []
if len(regions) == job['grid'][0]*job['grid'][1]:
    for n in range(job['grid'][1]):
        cols=job['grid'][0]
        row = sorted(regions[n*cols:(n+1)*cols], key=lambda region: region['box'][0])
        rows.append(row)
edge = {name: sum(v>=128 for v in alpha.crop(box).get_flattened_data()) for name, box in {
    'top': (0,0,w,1), 'bottom': (0,h-1,w,h), 'left': (0,0,1,h), 'right': (w-1,0,w,h)}.items()}
rgba = image.get_flattened_data()
fringe = sum(a>=128 and ((red>180 and green<45) or (blue>180 and green<45)) for red,green,blue,a in rgba)
report = {'id': job['id'], 'source': job['source'], 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'size': [w,h],
          'threshold': 128, 'largeRegions': len(regions), 'expected': job['grid'][0]*job['grid'][1], 'sourceEdges': edge,
          'opaqueNeonFringePixels': fringe, 'rows': rows, 'regions': regions, 'measurementStatus': 'region-candidates-not-root-registration',
          'sourceViewed': job.get('sourceViewed', False), 'ownerApprovalInferred': False}
(R / 'review' / (job['id'] + '-source-regions.json')).write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['rows','regions']}))
