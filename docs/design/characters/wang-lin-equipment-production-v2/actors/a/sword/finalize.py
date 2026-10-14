from pathlib import Path
import json,subprocess,sys,hashlib
ROOT=Path(__file__).resolve().parent
def run(file):subprocess.run([sys.executable,str(ROOT/file)],check=True)
def read(file):return json.loads((ROOT/file).read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
run('import-ground.py')
reg=read('registration.json');roots=read('root-overrides.json');manual=read('manual.json')
semanticKeys=[c['id']+':'+str(i+1) for c in reg['clips'] if not c.get('reusedFrom') and c['action'] in ['death','meditate'] for i,f in enumerate(c['frames'])]
assert len(semanticKeys)==93
missing=[key for key in semanticKeys if key not in roots or roots[key].get('manualReviewPending',True)]
assert not missing,missing
state=read('review-state.json');state['semanticSourceRootsReviewed']=93;state['sourceSocketReviewComplete']=True;state['technicalCandidateReadyForRootOverlayQA']=True
(ROOT/'review-state.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('pack.py');run('manual-proof.py');run('close-manual.py');run('pack.py');run('assessment.py');run('verify.py')
reg=read('registration.json');check=read('verification.json')
assert reg['manualReviewPending'] is False and check['status']=='passed'
delivery={'schema':'huyen-tam-sword-worker-body-handoff-v2','status':'stable-body-candidate','registration':'actors/a/sword/registration.json','registrationSha256':sha(ROOT/'registration.json'),'verification':'actors/a/sword/verification.json','verificationSha256':sha(ROOT/'verification.json'),'assessment':'actors/a/sword/assessment.json','assessmentSha256':sha(ROOT/'assessment.json'),'clips':64,'bodyPoses':385,'newBodyPoses':336,'reusedV1BodyPoses':49,'calibrationPoses':150,'selectedSources':25,'rawHistorySources':34,'socketSourcePoints':336,'measuredCoreCuffs':100,'semanticSourceRoots':93,'scope':'BODY-only descriptor final; root merges gear/FX and performs browser/GPU review. No further actor A Sword writes after handoff except an explicit scoped correction.','newArtApproved':False,'motionApproved':False,'runtimeIntegrated':False}
(ROOT/'handoff.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(delivery,ensure_ascii=False))
