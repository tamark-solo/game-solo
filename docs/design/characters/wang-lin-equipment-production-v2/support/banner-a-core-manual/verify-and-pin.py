from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
data=json.loads((ROOT/'manual.json').read_text(encoding='utf8'));checks=[]
def check(name,value):checks.append({'id':name,'passed':bool(value)});assert value,name
check('48 actually reviewed N/NE core frames',len(data['frames'])==48)
check('unique clip/key',len({(f['clipId'],f['key']) for f in data['frames']})==48)
for f in data['frames']:
    name=f['clipId']+':'+str(f['key'])
    source=PACK/f['source'];check(name+' source hash',sha(source)==f['sourceSha256'])
    check(name+' prior native hash',sha(PACK/f['frameFile'])==f['frameSha256'])
    im=Image.open(source).convert('RGBA');check(name+' actual opaque palm',im.getpixel(tuple(f['sourcePalm']))[3]>=128)
    check(name+' evidence hash',sha(ROOT/f['evidence'])==f['evidenceSha256'])
    check(name+' uncertainty disclosed',f['palmUncertaintyNativePx']>0 and f['sourceRootMeasurement']['uncertaintyNativePx']>0)
    check(name+' no exact bone or ART approval',f['sourceRootMeasurement']['exactBoneClaim'] is False and f['ownerApproved'] is False)
    cast='cast-' in f['clipId']
    check(name+' planted cast scope',f['heldGripClaim']==(not cast or f['key']==1))
report={'schema':'banner-a-core-manual-verification-1','passed':True,'checks':len(checks),'frames':48,'details':checks,
    'scope':'Hash/material locations/assigned coverage/policy only; visual source observations remain manual estimates, not anatomy proof or ART approval.'}
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pins=[{'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(ROOT.rglob('*'))
    if p.is_file() and p.name!='delivery.json' and '__pycache__' not in p.parts]
(ROOT/'delivery.json').write_text(json.dumps({'schema':'banner-a-core-manual-delivery-1','frames':48,'checks':len(checks),'pins':pins,
    'ownerApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'frames':48,'checks':len(checks),'pins':len(pins),'deliverySHA':sha(ROOT/'delivery.json')}))
