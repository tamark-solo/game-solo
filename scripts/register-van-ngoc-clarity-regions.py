"""Register/stitch only the selected 20-region Van Ngoc clarity revision; no API or runtime writes."""
import argparse
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions'
spec = importlib.util.spec_from_file_location('sector_measurement', ROOT / 'scripts/map-sector-registration.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
RECTS = {f'D{row*5+col+1:02}': [x,y,x+704,y+704]
         for row,y in enumerate((0,448,896,1344)) for col,x in enumerate((0,592,1184,1776,2368))}
# Shared measurement gates apply to this explicit map grid.
m.RECTS = RECTS


def register(region, source, output, cfg):
    record = m.analyze_sector(region, source, (3072,2048), BASE, output, cfg)
    if record['status'] != 'registration-passed-awaiting-visual-review':
        return record
    metadata_path = BASE / region['generationMetadata']
    metadata = json.loads(metadata_path.read_text(encoding='utf8'))
    if (metadata.get('model')!='gpt-image-2' or metadata.get('operation')!='edit' or
        metadata.get('image',{}).get('sha256')!=record['raw']['sha256'] or
        metadata.get('prompt')!=(BASE/region['prompt']).read_bytes().decode('utf8') or
        m.sha(BASE/region['prompt'])!=region['inputHashes']['prompt'] or
        [i.get('sha256') for i in metadata.get('inputImages',[])]!=[region['inputHashes']['guide'],region['inputHashes']['style']]):
        raise ValueError(f"{region['id']}: raw generation provenance differs from the prepared plan")
    record['generationMetadata'] = {'path':m.rel(metadata_path,BASE),'sha256':m.sha(metadata_path),'bytes':metadata_path.stat().st_size}
    # The fit is measured in normalized coordinates. Compose normalization and affine
    # into one sampling of RAW pixels so delivery does not receive two softening passes.
    raw = Image.open(BASE / region['generated']).convert('RGB')
    matrix = np.asarray(record['fit']['targetToGeneratedAffine']).copy()
    scales = np.array([raw.width/704, raw.height/704])
    guard = int(np.ceil(cfg['registration']['guardBorderPx'] * scales.max()))
    matrix *= scales[:,None]
    matrix[:,2] += guard
    padded = Image.fromarray(np.pad(np.asarray(raw), ((guard,guard),(guard,guard),(0,0)), mode='edge'))
    result = padded.transform((704,704), Image.Transform.AFFINE, tuple(matrix.flatten()), resample=Image.Resampling.BICUBIC)
    path = output / 'registered' / f"{region['id']}.png"
    result.save(path)
    record['registered'] = m.image_record(path,BASE)
    record['deliverySampling'] = {'method':'single raw-to-world affine bicubic', 'passes':1,
                                  'targetToRawAffine':matrix.tolist(), 'guardRawPx':guard,
                                  'measurementNormalizationIsNotDelivered':True}
    return record


def stitch(records, output, cfg, source_record, manifest_record):
    images = {r['id']:np.asarray(Image.open(BASE/r['registered']['path']).convert('RGB')) for r in records}
    by_id = {r['id']:r for r in records}
    seams, rows, offsets = [], [], {}
    for row in range(4):
        ids = [f'D{row*5+col+1:02}' for col in range(5)]
        current = images[ids[0]]
        offsets[ids[0]] = np.zeros(3)
        for col in range(1,5):
            current, seam = m.stitch_pair(current,images[ids[col]],112,True,cfg['stitch'],f'{ids[col-1]}-{ids[col]}')
            offsets[ids[col]] = np.asarray(seam['rgbOffsetApplied'])
            seam['pathPx'] = [[x,y+row*448] for x,y in seam['pathPx']]
            seams.append(seam)
        if current.shape != (704,3072,3):
            raise ValueError('Row dimensions changed')
        rows.append(current)
    master = rows[0]
    for row in range(1,4):
        row_ids = [f'D{row*5+col+1:02}' for col in range(5)]
        prior = np.asarray([offsets[sid] for sid in row_ids])
        limit = cfg['stitch']['maxRgbOffset']
        bounds = (np.max(-limit-prior,axis=0),np.min(limit-prior,axis=0))
        master,seam = m.stitch_pair(master,rows[row],256,False,cfg['stitch'],f'row{row}-row{row+1}',bounds)
        for sid in row_ids:
            offsets[sid] += np.asarray(seam['rgbOffsetApplied'])
        seams.append(seam)
    if master.shape != (2048,3072,3):
        raise ValueError('World dimensions changed')
    image = Image.fromarray(master)
    image.save(output/'map-master.png')
    # Lossless delivery isolates source clarity from lossy compression.
    image.save(output/'map-web.webp','WEBP',lossless=True,method=6)
    overlay = image.copy()
    draw = ImageDraw.Draw(overlay)
    for seam in seams:
        draw.line([tuple(p) for p in seam['pathPx']],fill='#e855d2' if seam['orientation']=='vertical' else '#54f5f2',width=2)
    overlay.save(output/'seams-overlay.png')
    composition = {'schemaVersion':2,'createdAt':datetime.now(timezone.utc).isoformat(),
        'status':'stitched-awaiting-visual-review','freshCompositionWritten':True,'worldSize':[3072,2048],
        'manifest':manifest_record,'source':source_record,'regionCount':20,'nativeRegionSize':[704,704],
        'processing':cfg,'master':m.image_record(output/'map-master.png',BASE),
        'web':m.image_record(output/'map-web.webp',BASE),'webEncoding':'lossless',
        'seamsOverlay':m.image_record(output/'seams-overlay.png',BASE),'seams':seams,
        'regions':[{**by_id[sid],'netRgbOffsetApplied':offsets[sid].tolist()} for sid in RECTS],
        'decodedRgbaBytes':3072*2048*4,'wholeMapUpscale':False,'wholeMapSharpen':False,'wholeMapBlur':False,
        'ownerApproved':False,'artApproved':False,'exactFootprintVerified':False,
        'navigationModified':False,'authoredMapsModified':False,'caution':m.CAUTION}
    m.write_json(output/'composition.json',composition)
    return composition


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=('analyze','stitch','self-test'))
    parser.add_argument('--ids',help='Comma-separated IDs to analyze; stitch requires all twenty')
    args = parser.parse_args()
    if args.command == 'self-test':
        m.self_test()
        assert len(RECTS)==20 and max(r[2] for r in RECTS.values())==3072 and max(r[3] for r in RECTS.values())==2048
        assert 704-592==112 and 704-448==256
        print('20-region grid/coverage checks passed')
        return 0
    if args.command=='stitch' and args.ids:
        parser.error('Stitch always remeasures all twenty regions')
    manifest_path = BASE/'production.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf8'))
    if manifest.get('worldSize') != [3072,2048] or {r['id']:r['rect'] for r in manifest['regions']} != RECTS:
        raise ValueError('Unexpected map grid')
    source_path = (BASE/manifest['source']['path']).resolve()
    if m.sha(source_path)!=manifest['source']['sha256']:
        raise ValueError('Layout master changed')
    source = Image.open(source_path).convert('RGB')
    source_record = m.image_record(source_path,BASE)
    cfg = json.loads(json.dumps(m.DEFAULTS))
    cfg['stitch']['blendWidthPx'] = 8
    cfg['stitch']['maxRgbOffset'] = 6
    selected = args.ids.split(',') if args.ids else list(RECTS)
    if len(set(selected))!=len(selected) or any(sid not in RECTS for sid in selected):
        raise ValueError('Unknown or duplicate region ID')
    records = [register(r,source,BASE,cfg) for r in manifest['regions'] if r['id'] in selected]
    manifest_record = {'path':'production.json','sha256':m.sha(manifest_path)}
    registration = {'schemaVersion':2,'createdAt':datetime.now(timezone.utc).isoformat(),
        'manifest':manifest_record,'source':source_record,'worldSize':[3072,2048],
        'regions':records,'allTwentyPresent':len(records)==20 and all(r.get('raw') for r in records),
        'allTwentyRegistrationPassed':len(records)==20 and all(r['status']=='registration-passed-awaiting-visual-review' for r in records),
        'ownerApproved':False,'artApproved':False,'navigationModified':False,'authoredMapsModified':False}
    m.write_json(BASE/('registration.json' if not args.ids else 'registration-selected.json'),registration)
    failures = [r for r in records if r['status']!='registration-passed-awaiting-visual-review']
    print(json.dumps([{'id':r['id'],'status':r['status'],'rms':r.get('fit',{}).get('inlierRmsPx'),'blockers':r['blockers']} for r in records],indent=2))
    if args.command=='stitch':
        failures += [r for r in records if r['visualReview']['status']!='accepted']
        if failures:
            m.write_json(BASE/'composition.json',{'schemaVersion':2,'status':'blocked','freshCompositionWritten':False,
                'blockers':[r['id'] for r in failures],'ownerApproved':False,'artApproved':False})
            return 2
        result = stitch(records,BASE,cfg,source_record,manifest_record)
        print(json.dumps({'master':result['master'],'web':result['web'],'seams':len(result['seams'])},indent=2))
    return 2 if failures else 0


if __name__=='__main__':
    raise SystemExit(main())
