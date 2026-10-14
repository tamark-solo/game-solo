"""Read-only validation of planned inputs/choreography; writes this support report only."""
from pathlib import Path
from PIL import Image,ImageChops
import hashlib,json,sys

ROOT=Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,condition,detail=None):
    checks.append({'id':name,'pass':bool(condition),**({'detail':detail} if detail is not None else {})})
def here(path):
    p=(ROOT/path).resolve()
    if not p.is_relative_to(ROOT):raise ValueError('Support output path escapes scope: '+str(path))
    return p
def same_pixels(a,b):
    return a.size==b.size and ImageChops.difference(a,b).getbbox() is None

top=read(ROOT/'plan.json');basis=read(ROOT/'basis.json')
check('preparation-not-generation',top['generationAllowed'] is False and top['status']=='prepared-no-generation')
check('no-actual-production',all(x==0 for x in top['actualCoverage'].values()))
check('support-scope',top['supportOnly'] and top['actorWriteAllowed'] is False)
check('order',top['order']==['sword','banner','chariot','bead'])
check('approval-separate',top['ownerApproved'] is False and top['runtimeIntegrated'] is False)
check('own-primary-wang-support',basis['P1OwnPrimary'] and basis['WangSupportOnly'] and basis['allInputsReadOnly'])
for index,item in enumerate(basis['files']):
    p=Path(item['file'])
    check('basis-'+str(index),p.is_file() and sha(p)==item['sha256'],item['role'])
approvalPath=Path(basis['productionV1Approval'])
check('V1-approval-file',sha(approvalPath)==basis['productionV1ApprovalSha256'])
approval=read(approvalPath)
for index,item in enumerate(approval['files']):
    p=(approvalPath.parent/item['file']).resolve()
    check('V1-pinned-'+str(index),p.is_file() and sha(p)==item['sha256'])
corePath=next(Path(i['file']) for i in basis['files'] if i['role']=='experimental-Core-contract-timings-read-only')
core=read(corePath)
directions=['north','northeast','east','southeast','south','southwest','west','northwest']
actions=['idle','run','cast-single-target','cast-aoe','hit','death','meditate','gather']
matrix=set();seenJobs=set();readyTriplets=0;pendingTriplets=0;familyReports=[]
for family in ('chariot','bead'):
    plan=read(ROOT/family/'plan.json');ch=read(ROOT/family/'choreography.json')
    check(family+'-future',plan['generationAllowed'] is False and all(x==0 for x in plan['actualCoverage'].values()))
    check(family+'-unapproved',plan['ownerApproved'] is False and plan['runtimeIntegrated'] is False)
    check(family+'-directions',ch['directions']==directions)
    check(family+'-identities',ch['identities']==['a','b'])
    check(family+'-eight-actions',set(ch['actions'])==set(actions+['neutral']))
    check(family+'-real-count-policy',ch['noFrameCountCoercion'] and ch['allRowsNeedRealSourceKeyCoverage'])
    check(family+'-absolute-clock',ch['absoluteClock'] and ch['timingApproval']=='experimental fixture only')
    expected=[c for c in core['contracts'] if c['family']==family]
    check(family+'-Core-copy',ch['coreContracts']==expected)
    for c in expected:
        action='cast-single-target' if c['mode']=='st' else 'cast-aoe'
        times=ch['timingMs'][action];t=c['timing']
        check(c['id']+'-six-nominal-times',len(times)==6 and all(isinstance(x,int) and x>0 for x in times))
        check(c['id']+'-warning-anchor',times[0]==t['warningMs'])
        check(c['id']+'-release-key4',sum(times[:3])==t['releaseMs'])
        check(c['id']+'-active-end-key6',sum(times[:5])==t['activeEndMs'])
        check(c['id']+'-end-clock',sum(times)==t['endMs'])
        check(c['id']+'-true-six-choreography',len(ch['actions'][action])==6)
    for identity in ('a','b'):
        p1=ROOT/family/'inputs'/identity
        native=Image.open(p1/'p1-native.png').convert('RGBA')
        scaled=Image.open(p1/'p1-nearest8x.png').convert('RGBA')
        expectedPixels=native.resize((native.width*8,native.height*8),Image.Resampling.NEAREST)
        check(family+'-'+identity+'-nearest8x-pixel-parity',same_pixels(expectedPixels,scaled))
        nativeBasis=next(i for i in basis['files'] if i['file'].replace('\\','/').endswith('/body/native/'+family+'-'+identity+'.png'))
        rawBasis=next(i for i in basis['files'] if i['file'].replace('\\','/').endswith('/sources/body/'+family+'-'+identity+'.png'))
        check(family+'-'+identity+'-P1-native-bytecopy',sha(p1/'p1-native.png')==nativeBasis['sha256'])
        check(family+'-'+identity+'-P1-raw-bytecopy',sha(p1/'p1-source.png')==rawBasis['sha256'])
    for job in plan['jobs']:
        jid=job['id'];prefix=jid+':'
        check(prefix+'unique',jid not in seenJobs);seenJobs.add(jid)
        check(prefix+'scope',job['familyId']==family and job['identityId'] in ('a','b') and job['direction'] in directions)
        check(prefix+'future',job['generationAllowed'] is False and job['selected'] is False and job['rawProduced'] is False)
        check(prefix+'no-tool-result',job['actualGeneratedSource'] is None and job['actualOriginalPath'] is None and job['actualRawSha256'] is None)
        check(prefix+'prompt-hash',sha(here(job['prompt']))==job['promptSha256'])
        prompt=here(job['prompt']).read_text(encoding='utf8')
        check(prefix+'body-prop-separation','BODY-ONLY' in prompt and 'separate' in prompt.lower() and 'transparent RGBA' in prompt)
        check(prefix+'actual-motion-policy','actual distinct action poses' in prompt and 'never fit each pose' in prompt)
        check(prefix+'input-order',[x['index'] for x in job['inputs']]==[1,2,3])
        for action in job['actions']:
            key=(family,job['identityId'],job['direction'],action)
            check(prefix+'nonduplicated-action-'+action,key not in matrix)
            matrix.add(key)
        expectedActions={'core':actions[:4],'damage':['hit','death'],'practice':['meditate','gather']}[job['group']]
        check(prefix+'group-action-matrix',job['actions']==expectedActions)
        wang=next(i for i in basis['files'] if i['file'].replace('\\','/').endswith('/wang-lin-live-'+job['direction']+'-nearest8x.png'))
        check(prefix+'same-Wang-direction',job['inputs'][1]['sha256']==wang['sha256'])
        if job['group']=='core':
            readyTriplets+=1
            check(prefix+'core-layout',job['requestedGrid']==[6,5] and job['requestedSize']==[1536,1536] and job['requestedSourcePoses']==30)
            check(prefix+'core-ready',job['inputSnapshotsReady'] and all(x['ready'] for x in job['inputs']))
            check(prefix+'P1-primary','own-P1-native-nearest8x-PRIMARY'==job['inputs'][0]['role'])
            for item in job['inputs']:
                p=here(item['file'])
                check(prefix+'input-'+str(item['index'])+'-snapshot',p.is_file() and sha(p)==item['sha256'] and sha(p)==sha(Path(item['original'])))
                check(prefix+'input-'+str(item['index'])+'-filename',p.name==str(item['index'])+'.png')
        else:
            pendingTriplets+=1
            check(prefix+'foundation-layout',job['requestedGrid']==[3,6] and job['requestedSize']==[1024,1536] and job['requestedSourcePoses']==18)
            check(prefix+'foundation-pending',job['inputSnapshotsReady'] is False)
            check(prefix+'pending-primary',job['inputs'][0]['ready'] is False and job['inputs'][0]['file'] is None and job['inputs'][0]['sha256'] is None)
            check(prefix+'pending-own-raw',job['inputs'][2]['ready'] is False and job['inputs'][2]['file'] is None and job['inputs'][2]['sha256'] is None)
            check(prefix+'same-view-primary',family+'-'+job['identityId']+'-'+job['direction'] in job['inputs'][0]['role'])
            check(prefix+'no-foundation-snapshot-claim',job['inputs'][1]['snapshotMade'] is False and job['inputs'][1]['ready'] is True)
            p=Path(job['inputs'][1]['file'])
            check(prefix+'pending-Wang-known',p.is_file() and sha(p)==job['inputs'][1]['sha256'])
    check(family+'-job-count',len(plan['jobs'])==48)
    familyReports.append({'familyId':family,'plannedJobs':len(plan['jobs']),'actualSources':0,'actualClips':0,'actualKeys':0,'nominalClipForecast':128,'nominalMotionKeyForecastAtSix':768})
check('matrix-2x2x8x8',len(matrix)==256)
check('job-total',len(seenJobs)==96)
check('core-triplets-32',readyTriplets==32)
check('foundation-triplets-64-pending',pendingTriplets==64)
template=read(ROOT/'dispatch-template.json')
check('dispatch-template-unusable-until-assigned',template['generationAllowed'] is False and template['jobId'] is None and template['actualOriginalPath'] is None)
check('builtin-transparent-template',template['tool']=='image_gen.imagegen' and template['toolArguments']['transparent_background'] is True)
check('no-generated-source-folder',not any((ROOT/family/'sources').exists() for family in ('chariot','bead')))
for doc in ('README.md','INPUT-PROVENANCE.md','SOCKET-ROOT-HANDOFF.md','chariot/BRIEF.md','bead/BRIEF.md'):
    check('handoff-'+doc,here(doc).is_file())
failed=[c for c in checks if not c['pass']]
report={
    'schema':'p5-next-family-preparation-verification-2','date':'2026-10-14','passed':not failed,
    'checks':len(checks),'passedChecks':len(checks)-len(failed),'failedChecks':len(failed),
    'basisReferences':len(basis['files']),'productionV1PinsChecked':len(approval['files']),
    'plannedJobs':len(seenJobs),'plannedClipMatrix':len(matrix),'coreTripletsReady':readyTriplets,'foundationTripletsPending':pendingTriplets,
    'actualCoverage':{'imagegenCalls':0,'sources':0,'clips':0,'keys':0},'families':familyReports,
    'semanticAssessment':'Choreography/provenance preparation only; generated anatomy, actual socket, source completeness, native/atlas/GPU and ART quality are not yet tested.',
    'ownerApproved':False,'runtimeIntegrated':False,'scope':'Writes verification.json in this support directory only.',
    'failures':failed,'details':checks
}
here('verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:report[k] for k in ('passed','checks','passedChecks','failedChecks','plannedJobs','plannedClipMatrix','coreTripletsReady','foundationTripletsPending','productionV1PinsChecked','actualCoverage')},ensure_ascii=False))
if failed:sys.exit(1)
