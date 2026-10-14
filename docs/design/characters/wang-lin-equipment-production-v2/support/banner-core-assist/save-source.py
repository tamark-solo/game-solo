"""Preserve actual builtin raw unchanged and measure source bands; no canonical/actor writes."""
from pathlib import Path
from PIL import Image
import hashlib,json,shutil,argparse
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ap=argparse.ArgumentParser()
ap.add_argument('job');ap.add_argument('original');ap.add_argument('--tool-meta',required=True)
args=ap.parse_args()
recordPath=ROOT/'records'/(args.job+'.json')
record=json.loads(recordPath.read_text(encoding='utf8'))
assert record['actualOriginalPath'] is None,'Source already saved; preserve history.'
original=Path(args.original).resolve();assert original.is_file()
target=ROOT/record['raw'];target.parent.mkdir(parents=True,exist_ok=True)
assert not target.exists()
shutil.copy2(original,target)
assert sha(target)==sha(original)
im=Image.open(target);rgba=im.convert('RGBA');alpha=rgba.getchannel('A')
hist=alpha.histogram();physical=alpha.point(lambda x:255 if x>=128 else 0)
w,h=rgba.size
def count_box(p,box):return p.crop(box).histogram()[255]
cells=[]
for row in range(5):
    for col in range(6):
        l=round(col*w/6);r=round((col+1)*w/6);t=round(row*h/5);b=round((row+1)*h/5)
        mask=physical.crop((l,t,r,b));bb=mask.getbbox()
        box=None if bb is None else [bb[0]+l,bb[1]+t,bb[2]+l,bb[3]+t]
        physicalEdges={'left':count_box(physical,(l,t,l+1,b)),'right':count_box(physical,(r-1,t,r,b)),
                       'top':count_box(physical,(l,t,r,t+1)),'bottom':count_box(physical,(l,b-1,r,b))}
        gutter=None if box is None else [box[0]-l,box[1]-t,r-box[2],b-box[3]]
        cells.append({'index':len(cells),'row':row,'col':col,'nominalSourceRect':[l,t,r-l,b-t],
                      'physicalBBox128':box,'physicalPixels128':mask.histogram()[255],'physicalEdges128':physicalEdges,
                      'gutterPhysical128':gutter,'nominalGridOnly':True,
                      'sourceRectFinalRequiresOwnerSegmentation':True})
qa={'schema':'banner-core-assist-source-layout-2','source':record['raw'],'sha256':sha(target),'actualMode':im.mode,'actualSize':[w,h],
    'alpha':{'transparentPixels':hist[0],'opaquePixels':hist[255],'softPixels':sum(hist[1:255]),
             'outerPhysical128':{'left':count_box(physical,(0,0,1,h)),'right':count_box(physical,(w-1,0,w,h)),
                                 'top':count_box(physical,(0,0,w,1)),'bottom':count_box(physical,(0,h-1,w,h))}},
    'requestedGrid':[6,5],'nominalCells':cells,'nominalNonEmptyCells':sum(c['physicalBBox128'] is not None for c in cells),
    'nominalPhysicalEdgeCells':[c['index'] for c in cells if any(c['physicalEdges128'].values())],
    'belowRequested24PxNominalGutter':[c['index'] for c in cells if c['gutterPhysical128'] and min(c['gutterPhysical128'])<24],
    'automaticPassIsNotClaimed':True,
    'limitations':['Nominal equal cell bands are a helper, not final actor sourceRect registration.',
                   'Alpha128 measures physical BODY extent; original RGBA is preserved unchanged.',
                   'Closed hand/dominant-arm/camera/anatomy require visual review; nonempty30 is not choreography proof.',
                   'A/B own final neutral factor, boot/root, manual palm/cuff, source choice and pack.'],
    'ownerApproved':False,'runtimeIntegrated':False}
qap=ROOT/'qa'/(args.job+'.json');qap.parent.mkdir(parents=True,exist_ok=True)
qap.write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
metadata=Path(args.tool_meta).resolve();assert metadata.is_relative_to(ROOT)
record.update({'tool':'image_gen.imagegen','transparentRequested':True,'actualOriginalPath':str(original),
               'rawSha256':sha(target),'originalSha256':sha(original),'actualDimensions':[w,h],'actualMode':im.mode,
               'toolMetadata':metadata.relative_to(ROOT).as_posix(),'toolMetadataSha256':sha(metadata),
               'sourceLayoutQA':qap.relative_to(ROOT).as_posix(),'sourceLayoutQASha256':sha(qap),
               'status':'raw-produced-awaiting-owner-source-assessment','selected':False})
recordPath.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
planPath=ROOT/'plan.json';plan=json.loads(planPath.read_text(encoding='utf8'))
records=[json.loads(p.read_text(encoding='utf8')) for p in (ROOT/'records').glob('*.json')]
plan['actualSources']=sum(x['actualOriginalPath'] is not None for x in records)
planPath.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'id':record['id'],'original':str(original),'raw':str(target),'sha256':sha(target),'actualSize':[w,h],
                  'nominalNonEmptyCells':qa['nominalNonEmptyCells'],'nominalPhysicalEdgeCells':qa['nominalPhysicalEdgeCells'],
                  'below24PxCells':qa['belowRequested24PxNominalGutter']},ensure_ascii=True))
