"""Pin this prepared support package only; no production or generation work."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
report=json.loads((ROOT/'verification.json').read_text(encoding='utf8'))
assert report['passed'] and report['failedChecks']==0
assert report['actualCoverage']=={'imagegenCalls':0,'sources':0,'clips':0,'keys':0}
files=[]
for p in sorted(ROOT.rglob('*')):
    if not p.is_file() or p.name=='delivery.json' or '__pycache__' in p.parts:continue
    files.append({'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p)})
delivery={
    'schema':'p5-next-family-preparation-delivery-2',
    'date':'2026-10-14',
    'status':'ready-guidance-awaiting-root-dispatch-after-Sword-and-Banner',
    'families':['chariot','bead'],
    'plannedJobs':96,
    'plannedClipMatrix':256,
    'coreTripletsSnapshotted':32,
    'foundationTripletsPending':64,
    'actualCoverage':report['actualCoverage'],
    'technicalChecks':report['passedChecks'],
    'verification':'verification.json',
    'verificationSha256':sha(ROOT/'verification.json'),
    'productionV1PinsUnchanged':report['productionV1PinsChecked'],
    'actorWritesPerformed':0,
    'ownerApproved':False,
    'runtimeIntegrated':False,
    'limitations':[
        'Prepared prompt/input plan is not a generation call or source selection.',
        'Foundation primary neutral and same-view Core raw do not exist in this support package.',
        'Source anatomy/sockets/gutters/native/atlas/GPU/ART remain to be reviewed after actual generation.',
        'Requested six-key counts and source dimensions are forecasts; actual coverage follows source evidence.',
        'Core timings and cart 55 px placement are review fixture values, not production balance.'
    ],
    'files':files
}
p=ROOT/'delivery.json'
p.write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'filesPinned':len(files),'deliverySha256':sha(p),'verificationSha256':delivery['verificationSha256'],'actualCoverage':delivery['actualCoverage']}))
