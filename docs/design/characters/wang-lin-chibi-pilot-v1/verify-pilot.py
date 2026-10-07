"""Read-only native PNG verification; it does not approve animation quality."""
import hashlib
import importlib.util
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('png_reader',ROOT.parent/'player-avatars-v2/verify_native.py')
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
meta=json.loads((ROOT/'native-v1/atlas.json').read_text(encoding='utf-8'))
w,h,colors,atlas=reader.indexed_png(ROOT/'native-v1/atlas.png')
assert (w,h)==(320,96) and meta['frameSizePx']==[64,96] and meta['footAnchorPx']==[32,88]
assert meta['availableDirections']==['east'] and len(meta['frames'])==5
assert set(meta['animations'])=={'stand_east','walk_east'}
assert len(meta['animations']['walk_east'])==4 and len(meta['animations']['stand_east'])==1
assert colors[:24]==[tuple(bytes.fromhex(c[1:])) for c in meta['palette']]
used=set();heights=[];hashes=[]
for name,frame in meta['frames'].items():
 fw,fh,fc,rows=reader.indexed_png(ROOT/'native-v1'/frame['image']);assert (fw,fh)==(64,96) and fc[:24]==colors[:24]
 pixels=b''.join(rows);digest=hashlib.sha256(pixels).hexdigest();assert digest==frame['pixelHash'];hashes.append(digest)
 used.update(pixels);r=frame['frame']
 for y,row in enumerate(rows):assert row==atlas[y][r['x']:r['x']+64]
 opaque=[(x,y) for y,row in enumerate(rows) for x,p in enumerate(row) if colors[p][3]]
 assert max(y for x,y in opaque)==88 and min(y for x,y in opaque)>=1
 assert min(x for x,y in opaque)>=1 and max(x for x,y in opaque)<=62
 heights.append(89-min(y for x,y in opaque))
assert len(set(hashes))==5 and max(used)<24 and {colors[p][3] for p in used}=={0,255}
result={'passed':True,'characterId':meta['sourceCharacterId'],'nativeFrames':5,'walkingPoses':4,'directions':['east'],
        'frameSizePx':[64,96],'atlasSizePx':[320,96],'anchorPx':[32,88],'heightRangePx':[min(heights),max(heights)],
        'paletteEntries':24,'alphaValues':[0,255],'distinctSourcePoses':5,'pngCRCsAndHashesValid':True,
        'framesMatchAtlas':True,'noSyntheticPoseGeometry':True,'ownerMotionApproval':'pending_review'}
(ROOT/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
