"""Snapshot explicitly reserved own-actor jobs; support-only writes."""
from pathlib import Path
import hashlib,json,shutil,sys
ROOT=Path(__file__).resolve().parent
PACK=ROOT.parents[1]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
ids=sys.argv[1:] or ['banner-a-north-damage-r1','banner-a-north-practice-r1','banner-a-northeast-damage-r1','banner-a-northeast-practice-r1']
allowed=['banner-a-'+d+'-'+g+'-r1' for d in ['north','northeast','east','southeast'] for g in ['damage','practice']]
allowed+=['banner-b-'+d+'-'+g+'-r1' for d in ['west','northwest'] for g in ['damage','practice']]
assert all(j in allowed for j in ids),'Only explicitly assigned helper jobs.'
for job in ids:
    identity=job.split('-')[1]
    generation=PACK/'actors'/identity/'banner/generation.json'
    data=json.loads(generation.read_text(encoding='utf-8-sig'))
    record=next(r for r in data['records'] if r['id']==job)
    dest=ROOT/'records'/(job+'.json')
    assert not dest.exists(), 'Do not overwrite an existing call record.'
    assert record['inputSnapshotsReady'] and (record.get('neutralBasisReviewed') or record.get('neutralReviewed'))
    upstream=json.loads(json.dumps(record))
    prompt=PACK/record['prompt']
    assert sha(prompt)==record['promptSha256']
    p=ROOT/'prompts'/(job+'.txt');p.parent.mkdir(parents=True,exist_ok=True)
    assert not p.exists();shutil.copy2(prompt,p)
    record['prompt']=p.relative_to(ROOT).as_posix()
    record['upstreamPromptOriginal']=str(prompt)
    for index,input in enumerate(record['inputs'],1):
        source=PACK/input['file'];assert sha(source)==input['sha256']
        p=ROOT/'inputs'/job/(str(index)+'.png');p.parent.mkdir(parents=True,exist_ok=True)
        assert not p.exists();shutil.copy2(source,p);assert sha(p)==input['sha256']
        input['sourceSnapshot']=str(source);input['index']=index
        input['file']=p.relative_to(ROOT).as_posix()
    record.update({'raw':'sources/'+job+'.png','actualOriginalPath':None,'rawSha256':None,
       'tool':'image_gen.imagegen','transparentRequested':True,'status':'reserved-prepared-for-built-in-call',
       'upstreamGeneration':str(generation),'upstreamGenerationSha256':sha(generation),'upstreamRecord':upstream,
       'reservation':'Root/actor explicitly assigned own-view damage/practice to banner_support_resume; A N/NE/E/SE and B W/NW.'})
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'job':job,'promptSha256':record['promptSha256'],'inputSha256':[i['sha256'] for i in record['inputs']]}))
planPath=ROOT/'plan.json'
plan=json.loads(planPath.read_text(encoding='utf8')) if planPath.exists() else {'schema':'banner-foundation-assist-plan-2','jobs':[],
    'scope':'Only source generation/provenance/layout QA; body factor, selection, sockets and roots belong to actors A/B.',
    'ownerApproved':False,'runtimeIntegrated':False}
plan['jobs']+=ids
assert len(plan['jobs'])==len(set(plan['jobs']))
plan['actualSources']=sum(json.loads(p.read_text(encoding='utf8'))['actualOriginalPath'] is not None for p in (ROOT/'records').glob('*.json'))
planPath.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
