"""Read-only integrity checks for the new indexed atlases and their legacy stands."""
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
module_spec = importlib.util.spec_from_file_location('legacy_png_reader', ROOT.parent/'player-avatars-v2/verify_native.py')
png_reader = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(png_reader)

def verify(actor):
    folder = ROOT/actor/'native-v1'
    meta = json.loads((folder/'atlas.json').read_text(encoding='utf-8-sig'))
    manifest = json.loads((ROOT/(actor+'-manifest.json')).read_text(encoding='utf-8'))
    legacy_file = (ROOT/manifest['legacyAtlasPath']).resolve()
    legacy = json.loads(legacy_file.read_text(encoding='utf-8-sig'))
    width,height,colors,atlas = png_reader.indexed_png(folder/'atlas.png')
    assert (width,height)==(576,384)
    assert meta['characterId']==legacy['characterId']
    assert len(meta['frames'])==36
    assert meta['frameSizePx']==[64,96] and meta['footAnchorPx']==[32,88]
    assert meta['palette']==legacy['palette'] and len(meta['palette'])==24
    assert colors[:24]==[tuple(bytes.fromhex(c[1:])) for c in meta['palette']]
    assert meta['identityApprovedByProjectOwner'] is False
    used=set(); heights=[]; distinct={}; phase_pixels={}
    for name,definition in meta['frames'].items():
        fw,fh,fc,rows=png_reader.indexed_png(folder/definition['image'])
        assert (fw,fh)==(64,96) and fc[:24]==colors[:24]
        data=b''.join(rows)
        assert hashlib.sha256(data).hexdigest()==definition['pixelHash'],name
        used.update(data)
        rect=definition['frame']
        for y,row in enumerate(rows): assert row==atlas[rect['y']+y][rect['x']:rect['x']+64],name
        opaque=[(x,y) for y,row in enumerate(rows) for x,p in enumerate(row) if colors[p][3]]
        assert opaque and max(y for x,y in opaque)==88,name
        assert min(x for x,y in opaque)>=1 and max(x for x,y in opaque)<=62 and min(y for x,y in opaque)>=1,name
        heights.append(89-min(y for x,y in opaque))
        if 'stand_' in name:
            assert (folder/definition['image']).read_bytes()==(legacy_file.parent/legacy['frames'][name]['image']).read_bytes(),name
        else:phase_pixels[name]=data
    for direction in ['south','west','east','north']:
        ids=meta['animations']['walk_'+direction]
        assert len(ids)==8
        assert len({meta['frames'][i]['pixelHash'] for i in ids})==8,direction
        # Region differences prove the redraw changes the hand/lower-leg pixels.
        # They do not prove correct biomechanical timing; visual review remains required.
        a,b=phase_pixels[ids[0]],phase_pixels[ids[4]]
        hands=sum(a[y*64+x]!=b[y*64+x] for y in range(40,68) for x in range(64))
        legs=sum(a[y*64+x]!=b[y*64+x] for y in range(68,90) for x in range(64))
        assert hands>0 and legs>0,direction
        distinct[direction]={'walkFrames':8,'oppositeContactHandRegionChangedPixels':hands,'oppositeContactLegRegionChangedPixels':legs}
    assert max(used)<24 and {colors[p][3] for p in used}=={0,255}
    return {'characterId':meta['characterId'],'frameCount':36,'nativeSizePx':[64,96],'atlasSizePx':[576,384],
            'paletteEntries':24,'alphaValues':[0,255],'standingPngsByteIdentical':True,'heightRangePx':[min(heights),max(heights)],
            'anchorPx':[32,88],'pngCRCsValid':True,'frameHashesMatch':True,'framesMatchAtlas':True,'directions':distinct,
            'motionReview':meta.get('animationStatus','pending_owner_visual_review'),'geometryGeneratedByCode':False}

if __name__=='__main__':
    results=[verify(a) for a in ['male','female','wang-lin'] if (ROOT/a/'native-v1/atlas.json').exists()]
    document={'passed':True,'checkedActors':len(results),'results':results,'visualQualityAutomaticallyApproved':False}
    (ROOT/'verification.json').write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(document,ensure_ascii=False))
