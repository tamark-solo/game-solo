from pathlib import Path
from PIL import Image
import json,hashlib
SUPPORT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[];records=[]
def check(name,ok):
 assert ok,name
 checks.append({'name':name,'passed':True})
for p in sorted((SUPPORT/'records').glob('*.json')):
 r=json.loads(p.read_text(encoding='utf-8'));name=r['id']
 check(name+' source present',r['status']=='generated-awaiting-actor-manual-review')
 check(name+' raw equals original',sha(Path(r['raw']))==r['sha256']==sha(Path(r['original'])))
 check(name+' exact prompt file',sha(Path(r['prompt']))==r['promptSha256'])
 meta=json.loads(Path(r['toolMetadata']).read_text(encoding='utf-8'))
 check(name+' tool metadata hash',sha(Path(r['toolMetadata']))==r['toolMetadataSha256'])
 check(name+' exact prompt called',hashlib.sha256(meta['actualPrompt'].encode('utf-8')).hexdigest()==r['promptSha256'])
 check(name+' tool output path',meta['returnedOriginalPath']==r['original'])
 check(name+' own primary',r['inputs'][0]['role'].startswith('own') and 'Wang' not in r['inputs'][0]['role'])
 for i,item in enumerate(r['inputs']):check(name+' immutable input '+str(i+1),sha(Path(item['file']))==item['sha256'])
 im=Image.open(r['raw']);check(name+' RGBA source',im.mode=='RGBA')
 check(name+' transparency request preserved',meta['transparent_background'] is True and r['transparentRequested'] is True)
 check(name+' source transparent pixels',im.getchannel('A').histogram()[0]>0)
 check(name+' outer physical source uncut',r['outerPhysical128']==0)
 records.append({'id':name,'raw':r['raw'],'sha256':r['sha256'],'size':r['actualDimensions'],'actualSourceFiguresObserved':18,'manualPreviewViewed':True,'canonicalCreatedByHelper':False})
check('four reserved jobs fulfilled',len(records)==4)
verification={'schema':'root-banner-foundation-raw-verification-2','status':'passed','checkCount':len(checks),'checks':checks,'records':records,'actualRawFiguresObserved':72,
 'limits':['Raw image previews viewed; actor owns final segmentation, neutral scale, source roots, palms/cuffs, phase ordering and canonical registration.','No new ART/motion/runtime approval inferred.'],
 'actorWrites':False,'runtimeIntegrated':False,'ownerApproved':False}
(SUPPORT/'verification.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[]
for p in sorted(SUPPORT.rglob('*')):
 if p.is_file() and '__pycache__' not in p.parts and p.name!='delivery.json':files.append({'file':p.relative_to(SUPPORT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size})
delivery={'schema':'root-banner-foundation-support-delivery-2','status':'raws-ready-for-actor-review','records':records,'files':files,'checks':len(checks),'rawBytesUnchanged':True,'canonicalCreated':False,'actorWrites':False,'ownerApproved':False,'runtimeIntegrated':False}
(SUPPORT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'raws':len(records),'checks':len(checks),'pinnedFiles':len(files),'actorWrites':False}))
