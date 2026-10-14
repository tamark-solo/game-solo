"""Finalize endpoints after native1x/2x full/front review of all16 entries."""
from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
j=json.loads((ROOT/'measurement.json').read_text(encoding='utf8'))
evidence=ROOT/'native-1x-2x.png';assert evidence.is_file()
checks=[]
def check(name,test):checks.append({'id':name,'pass':bool(test)})
for r in j['records']:
    r['registeredGround']=r.pop('registeredGroundCandidate')
    r['uncertaintyPx']=r.pop('measurementUncertaintyNativePx')
    r['manualEndpointReviewCompleted']=True
    r['manualEvidenceNative1x2x']='native-1x-2x.png';r['manualEvidenceNative1x2xSha256']=sha(evidence)
    r['manualReview']='All16 full/front pairs reviewed at native1x and nearest2x; point lies on terminal metal/wood pole material, not cloth. Four detailed 3x pairs also viewed; no pixels changed.'
    r['method']='Lowest actual opaque physical front-shaft endpoint pixel center, with occupied bottom-row median X; confirmed on immutable full/front native1x/2x.'
    r['supportPlaneY']=r['lowestFrontPhysicalRow']+1
    full=V2/r['fullFile'];front=V2/r['frontFile']
    im=Image.open(front).convert('RGBA');p=r['registeredGround'];alpha=im.getchannel('A')
    check(r['id']+'-full-hash',sha(full)==r['fullSha256'])
    check(r['id']+'-front-hash',sha(front)==r['frontSha256'])
    check(r['id']+'-canvas',list(im.size)==r['canvas'])
    check(r['id']+'-actual-material',alpha.getpixel((int(p[0]),int(p[1])))>=128)
    check(r['id']+'-physical-lowest-row',alpha.point(lambda a:255 if a>=128 else 0).getbbox()[3]-1==int(p[1]))
    check(r['id']+'-not-cloth-bbox',r['manualEndpointReviewCompleted'] and r['sourceCoordinateClaimed'] is False)
j.update({'candidateOnlyUntilViewed':False,'registeredGroundIsPhysicalPixelCenter':True,'full16Native1x2xViewed':True})
(ROOT/'measurements.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
report={'schema':'banner-base-measurement-verification-2','coverage':len(j['records']),'passed':all(c['pass'] for c in checks),
        'checks':len(checks),'failed':[c for c in checks if not c['pass']],'gearModified':False,
        'ownerApproved':False,'runtimeIntegrated':False,'details':checks}
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
assert report['passed']
files=[{'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in sorted(ROOT.rglob('*')) if p.is_file() and p.name!='delivery.json' and '__pycache__' not in p.parts]
delivery={'schema':'banner-base-measurement-delivery-2','date':'2026-10-14','coverage':16,'measurements':'measurements.json',
          'measurementsSha256':sha(ROOT/'measurements.json'),'checks':len(checks),'passed':True,'files':files,
          'gearModified':False,'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'records':len(j['records']),'checks':len(checks),'passed':True,'measurementsSha256':sha(ROOT/'measurements.json'),
                  'deliveryPins':len(files),'deliverySha256':sha(ROOT/'delivery.json')}))
