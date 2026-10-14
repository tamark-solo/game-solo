"""Preserve original built-in RGBA without repainting; inspect nominal source grid."""
from pathlib import Path
from PIL import Image
import hashlib,json,shutil,argparse
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ap=argparse.ArgumentParser();ap.add_argument('job');ap.add_argument('original');ap.add_argument('--tool-meta',required=True)
args=ap.parse_args();rp=ROOT/'records'/(args.job+'.json');record=json.loads(rp.read_text(encoding='utf8'))
assert record['actualOriginalPath'] is None,'Already produced; preserve history.'
assert sha(ROOT/record['prompt'])==record['promptSha256']
for i in record['inputs']:assert sha(ROOT/i['file'])==i['sha256']
original=Path(args.original).resolve();assert original.is_file()
target=ROOT/record['raw'];target.parent.mkdir(parents=True,exist_ok=True);assert not target.exists()
shutil.copy2(original,target);assert sha(target)==sha(original)
im=Image.open(target);rgba=im.convert('RGBA');a=rgba.getchannel('A');hist=a.histogram();physical=a.point(lambda x:255 if x>=128 else 0)
w,h=im.size;cols,rows=record['requestedGrid'];cells=[]
def count(box):return physical.crop(box).histogram()[255]
for row in range(rows):
    for col in range(cols):
        l,r=round(col*w/cols),round((col+1)*w/cols);t,b=round(row*h/rows),round((row+1)*h/rows)
        mask=physical.crop((l,t,r,b));bb=mask.getbbox();box=None if bb is None else [bb[0]+l,bb[1]+t,bb[2]+l,bb[3]+t]
        edges={'left':count((l,t,l+1,b)),'right':count((r-1,t,r,b)),'top':count((l,t,r,t+1)),'bottom':count((l,b-1,r,b))}
        cells.append({'index':len(cells),'row':row,'col':col,'nominalSourceRect':[l,t,r-l,b-t],
            'physicalBBox128':box,'physicalPixels128':mask.histogram()[255],'physicalEdges128':edges,
            'gutterPhysical128':None if box is None else [box[0]-l,box[1]-t,r-box[2],b-box[3]],
            'nominalGridOnly':True,'sourceRectFinalRequiresActorSegmentation':True})
qa={'schema':'banner-foundation-source-layout-1','source':record['raw'],'sha256':sha(target),'actualMode':im.mode,'actualSize':[w,h],
    'alpha':{'transparentPixels':hist[0],'opaquePixels':hist[255],'softPixels':sum(hist[1:255]),
       'outerPhysical128':{'left':count((0,0,1,h)),'right':count((w-1,0,w,h)),'top':count((0,0,w,1)),'bottom':count((0,h-1,w,h))}},
    'requestedGrid':record['requestedGrid'],'nominalCells':cells,'nominalNonEmptyCells':sum(c['physicalBBox128'] is not None for c in cells),
    'nominalPhysicalEdgeCells':[c['index'] for c in cells if any(c['physicalEdges128'].values())],
    'automaticPassIsNotClaimed':True,'limits':['Equal bands are only source-layout diagnostics. Actual anatomy/camera/choreography requires visual review.',
      'Original RGBA preserved. No silhouette mask is used to hide clipping; actual sourceRects and all sockets/roots owned by actor worker.'],
    'ownerApproved':False,'runtimeIntegrated':False}
qp=ROOT/'qa'/(args.job+'.json');qp.parent.mkdir(parents=True,exist_ok=True);qp.write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
meta=Path(args.tool_meta).resolve();assert meta.is_relative_to(ROOT)
record.update({'actualOriginalPath':str(original),'rawSha256':sha(target),'originalSha256':sha(original),'actualDimensions':[w,h],
    'actualMode':im.mode,'toolMetadata':meta.relative_to(ROOT).as_posix(),'toolMetadataSha256':sha(meta),
    'sourceLayoutQA':qp.relative_to(ROOT).as_posix(),'sourceLayoutQASha256':sha(qp),'status':'raw-produced-awaiting-actor-source-assessment'})
rp.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pp=ROOT/'plan.json';plan=json.loads(pp.read_text(encoding='utf8'));plan['actualSources']=sum(json.loads(p.read_text(encoding='utf8'))['actualOriginalPath'] is not None for p in (ROOT/'records').glob('*.json'))
pp.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'id':record['id'],'raw':str(target),'original':str(original),'sha256':sha(target),'actualSize':[w,h],
    'nonemptyNominalCells':qa['nominalNonEmptyCells'],'nominalEdgeCells':qa['nominalPhysicalEdgeCells'],'outerPhysical128':qa['alpha']['outerPhysical128']}))
