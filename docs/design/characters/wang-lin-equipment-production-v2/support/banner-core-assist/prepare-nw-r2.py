"""Prepare actor-B assigned corrective NW source; no actors writes."""
from pathlib import Path
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
job='banner-b-northwest-core-r2';p=ROOT/'records'/(job+'.json');assert not p.exists()
prior=json.loads((ROOT/'records/banner-b-northwest-core-r1.json').read_text(encoding='utf8'))
assert prior['actualOriginalPath'] and sha(ROOT/prior['raw'])==prior['rawSha256']
prompt=ROOT/'prompts'/(job+'.txt')
inputs=[]
for index,(source,role) in enumerate([(ROOT/prior['raw'],'own-B-banner-r1-edit-target-primary'),
    (ROOT/prior['inputs'][1]['file'],'Wang-same-view-style-anatomy-camera-only'),
    (ROOT/prior['inputs'][2]['file'],'own-B-banner-P1-full-source-outfit-support')],1):
    dest=ROOT/'inputs'/job/(str(index)+'.png');dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists()
    shutil.copy2(source,dest);assert sha(dest)==sha(source)
    inputs.append({'file':dest.relative_to(ROOT).as_posix(),'sha256':sha(dest),'original':str(source),
        'sourceSnapshot':str(source),'index':index,'role':role})
record={'id':job,'identityId':'b','familyId':'banner','direction':'northwest','group':'core',
   'actions':['idle','run','cast-single-target','cast-aoe'],'calibrationCells':6,
   'prompt':prompt.relative_to(ROOT).as_posix(),'promptSha256':sha(prompt),'raw':'sources/'+job+'.png',
   'inputs':inputs,'inputSnapshotsReady':True,'dependency':None,'tool':'image_gen.imagegen','transparentRequested':True,
   'requestedGrid':[6,5],'requestedSourcePoses':30,'status':'reserved-prepared-for-built-in-call','selected':False,
   'ownerApproved':False,'runtimeIntegrated':False,'actualOriginalPath':None,'rawSha256':None,
   'previousSourceId':prior['id'],'previousSourceSha256':prior['rawSha256'],
   'correctionReason':'r1 all poses rear-right/NE instead of requested rear-left/NW. Actor B confirmed and explicitly assigned this correction to helper.',
   'promptPolicy':'Exact helper correction prompt approved by actor B scope; all-camera correction, planted ritual cast key2 onward, source identity unchanged.'}
p.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pp=ROOT/'plan.json';plan=json.loads(pp.read_text(encoding='utf8'))
plan.setdefault('correctiveJobs',[]).append(job);pp.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'id':job,'promptSHA':sha(prompt),'inputs':[i['sha256'] for i in inputs]}))
