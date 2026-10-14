"""Metadata/provenance verifier for reserved support sources and assigned corrections; no actor writes."""
from pathlib import Path
from PIL import Image
import hashlib,json,sys
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf8'))
checks=[]
def check(name,test):checks.append({'id':name,'pass':bool(test)})
plan=read(ROOT/'plan.json')
originalIds=['banner-a-west-core-r1','banner-a-northwest-core-r1','banner-b-west-core-r1','banner-b-northwest-core-r1']
ids=originalIds+plan.get('correctiveJobs',[])
check('reserved-initial-4',plan['reservedJobs']==originalIds)
check('support-scope',plan['actorWriteAllowed'] is False and plan['builtInOnly'])
produced=0;metadata=[]
for jid in ids:
    record=read(ROOT/'records'/(jid+'.json'))
    prompt=ROOT/record['prompt'];up=record.get('upstreamRecord')
    check(jid+'-exact-stored-call-prompt',sha(prompt)==record['promptSha256'])
    if up:
        check(jid+'-exact-owner-prompt',record['promptSha256']==up['promptSha256'])
    else:
        check(jid+'-corrective-assigned',jid in plan.get('correctiveJobs',[]) and bool(record.get('correctionReason')))
        previous=read(ROOT/'records'/(record['previousSourceId']+'.json'))
        check(jid+'-corrective-own-source-lineage',record['inputs'][0]['sha256']==previous['rawSha256']==record['previousSourceSha256'])
    check(jid+'-inputs-three',len(record['inputs'])==3 and [i['index'] for i in record['inputs']]==[1,2,3])
    for item in record['inputs']:
        src=Path(item['sourceSnapshot']);p=ROOT/item['file']
        check(jid+'-input-'+str(item['index']),sha(p)==item['sha256']==sha(src))
        if up:
            check(jid+'-input-identity-'+str(item['index']),item['sha256']==up['inputs'][item['index']-1]['sha256'])
    check(jid+'-approval-separate',record['ownerApproved'] is False and record['runtimeIntegrated'] is False)
    if record['actualOriginalPath'] is None:
        check(jid+'-not-produced-honest',record['rawSha256'] is None)
        continue
    produced+=1
    raw=ROOT/record['raw'];original=Path(record['actualOriginalPath'])
    check(jid+'-unchanged-raw-original',sha(raw)==record['rawSha256']==record['originalSha256']==sha(original))
    im=Image.open(raw)
    check(jid+'-actual-size',list(im.size)==record['actualDimensions'])
    check(jid+'-RGBA',im.mode=='RGBA')
    check(jid+'-builtin-transparent',record['tool']=='image_gen.imagegen' and record['transparentRequested'] is True)
    for key in ('toolMetadata','sourceLayoutQA'):
        check(jid+'-'+key,sha(ROOT/record[key])==record[key+'Sha256'])
    qa=read(ROOT/record['sourceLayoutQA'])
    check(jid+'-QA-raw-hash',qa['sha256']==record['rawSha256'])
    check(jid+'-alpha-transparent',qa['alpha']['transparentPixels']>0)
    check(jid+'-QA-not-ART',qa['automaticPassIsNotClaimed'] and qa['ownerApproved'] is False)
    metadata.append({'id':jid,'raw':record['raw'],'rawSha256':record['rawSha256'],'dimensions':record['actualDimensions'],
                     'nominalNonEmptyCells':qa['nominalNonEmptyCells'],'nominalPhysicalEdgeCells':qa['nominalPhysicalEdgeCells'],
                     'below24PxCells':qa['belowRequested24PxNominalGutter']})
check('actual-source-count',plan['actualSources']==produced)
failed=[c for c in checks if not c['pass']]
report={'schema':'banner-core-assist-verification-3','date':'2026-10-14','passed':not failed,'checks':len(checks),
        'passedChecks':len(checks)-len(failed),'failedChecks':len(failed),'actualRawSources':produced,
        'rawSources':metadata,'technicalScope':'Metadata/hash/raw-copy/alpha diagnostics only; A/B own source semantic selection and manual registration.',
        'ownerApproved':False,'runtimeIntegrated':False,'failures':failed,'details':checks}
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:report[k] for k in ('passed','checks','passedChecks','failedChecks','actualRawSources')},ensure_ascii=True))
if failed:sys.exit(1)
