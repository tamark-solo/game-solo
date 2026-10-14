from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
d=json.loads((ROOT/'manual.json').read_text(encoding='utf8'));checks=[]
def check(name,v):checks.append({'id':name,'passed':bool(v)});assert v,name
check('96 assigned actual poses',len(d['frames'])==96)
check('96 unique clip/key pairs',len({(f['clipId'],f['key']) for f in d['frames']})==96)
check('no root edits',d['rootsEdited'] is False)
check('87 observed palms and nine hidden projections',sum(f['sourcePalmPhysicalObserved'] for f in d['frames'])==87 and sum(f['sourcePalmEstimated'] for f in d['frames'])==9)
for f in d['frames']:
 name=f['clipId']+':'+str(f['key']);source=PACK/f['source'];im=Image.open(source).convert('RGBA')
 check(name+' source hash',sha(source)==f['sourceSha256'])
 check(name+' no sourceRoot mutation field','sourceRoot' not in f and f['rootChangeAuthorized'] is False)
 check(name+' marked evidence hash',sha(ROOT/f['evidence'])==f['evidenceSha256'])
 check(name+' honest uncertainty',f['palmUncertaintyNativePx']>0 and f['cuffUncertaintyNativePx']>0)
 check(name+' no exact bone or ART approval',f['exactBoneClaim'] is False and f['ownerApproved'] is False)
 if f['sourcePalmPhysicalObserved']:check(name+' observed source alpha',im.getpixel(tuple(f['sourcePalm']))[3]>=128)
 else:check(name+' hidden is estimate no held',f['sourcePalmEstimated'] is True and not f['heldGripClaim'] and f['sourceOcclusionRect']==[] and f['palmUncertaintyNativePx']>=6)
 check(name+' rest planted policy',not f['heldGripClaim'] if f['action'] in ('death','meditate','gather') else f['heldGripClaim'])
report={'schema':'banner-a-foundation-hands-verification-1','passed':True,'checks':len(checks),'frames':96,'details':checks,
 'scope':'Assigned coverage, source/evidence hashes, alpha locations and honest attachment scope. Source anatomy observations remain manual candidates.'}
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pins=[{'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(ROOT.rglob('*')) if p.is_file() and p.name!='delivery.json' and '__pycache__' not in p.parts]
delivery={'schema':'banner-a-foundation-hands-delivery-1','frames':96,'physicalPalms':87,'hiddenEstimates':9,'checks':len(checks),'pins':pins,'rootsEdited':False,'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'frames':96,'checks':len(checks),'pins':len(pins),'deliverySHA':sha(ROOT/'delivery.json')}))
