from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
data=json.loads((ROOT/'manual-sources.json').read_text(encoding='utf8'));checks=[]
def check(name,value):checks.append({'id':name,'passed':bool(value)});assert value,name
count=0;selected=0;unused=0;boots=0
for sid,s in data['sources'].items():
    source=PACK/s['sourceFile'];check(sid+' unchanged source',sha(source)==s['sourceSha256']);im=Image.open(source).convert('RGBA')
    items=s['sourceAllEntries'];count+=len(items);selected+=len(s['calibrations'])+sum(len(x) for x in s['actions'].values());unused+=len(s['unusedEntries'])
    check(sid+' actual selected neutral6',len(s['calibrations'])==6)
    for e in items:
        name=sid+':'+str(e['rawIndex']);g=e['grip'];m=e['sourceRootMeasurement']
        check(name+' selected palm physical',im.getpixel(tuple(g['source']))[3]>=128)
        check(name+' original crop evidence',sha(ROOT/e['evidence'])==e['evidenceSHA'])
        check(name+' positive source factor',e['sourceScaleUnchanged']>0 and e['sourceScaleUnchanged']==s['sourceScaleUnchanged'])
        check(name+' floor projection honest',m['uncertaintyNativePx']>0 and m['exactBoneClaim'] is False)
        check(name+' lift applied once',e['rendererAppliesLift'] is False and e['lift']==0)
        check(name+' new ART candidate',e['ownerApproved'] is False and e['runtimeIntegrated'] is False and g['approved'] is False)
        if e['actionRole'] in ('meditate','gather'):
            check(name+' planted rest no shaft claim',g['closedGripConfirmed'] is False)
        if m['sourceBootEndpoint']:
            b=m['sourceBootEndpoint'];rgba=im.getpixel(tuple(b['source']));boots+=1
            check(name+' actual dark boot pixel',rgba[3]>=128 and max(rgba[:3])<120)
            check(name+' actual boot X projected to support plane',e['sourceRoot']==[b['source'][0],m['observedBodyContactY']])
check('reviewed76 actual figures',count==76);check('selected72 actual entries',selected==72);check('unused4 history preserved',unused==4)
report={'schema':'banner-b-foundation-manual-verification-1','passed':True,'checks':len(checks),'sourceFigures':count,'selectedEntries':selected,
    'unusedEntries':unused,'proneActualBootEndpoints':boots,'details':checks,'scope':'Source/hash/material/policy checks only; manual visual measurements have explicit uncertainty.'}
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pins=[{'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(ROOT.rglob('*')) if p.is_file() and p.name!='delivery.json' and '__pycache__' not in p.parts]
(ROOT/'delivery.json').write_text(json.dumps({'schema':'banner-b-foundation-manual-delivery-1','checks':len(checks),'sourceFigures':count,
    'selectedEntries':selected,'unusedEntries':unused,'proneBootEndpoints':boots,'pins':pins,'ownerApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'checks':len(checks),'figures':count,'selected':selected,'unused':unused,'bootEndpoints':boots,'pins':len(pins),'deliverySHA':sha(ROOT/'delivery.json')}))
