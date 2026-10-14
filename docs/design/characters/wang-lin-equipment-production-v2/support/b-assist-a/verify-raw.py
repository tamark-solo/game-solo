import json,hashlib
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'))
checks=0
def check(value,label):
    global checks
    assert value,label
    checks+=1
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
results=[]
for item in data['items']:
    p=ROOT/item['prompt']
    check(sha(p)==item['promptSha256'],'prompt hash')
    check(p.read_bytes()==Path(item['originalPrompt']).read_bytes(),'original prompt bytes')
    for entry in item['inputs']:
        p=ROOT/entry['file']
        check(sha(p)==entry['sha256'],'input hash')
        check(p.read_bytes()==Path(entry['original']).read_bytes(),'original input bytes')
    p=ROOT/item['source']
    check(sha(p)==item['sha256'],'source hash')
    check(p.read_bytes()==Path(item['originalOutput']).read_bytes(),'original output bytes')
    im=Image.open(p).convert('RGBA');a=im.getchannel('A')
    check(list(im.size)==item['actualSize'],'actual size')
    alpha_min,alpha_max=a.getextrema()
    check(alpha_min==0 and alpha_max>=250,'true clear alpha background and opaque body')
    solid=a.point(lambda x:255 if x>=128 else 0)
    bb=solid.getbbox()
    check(bb[0]>0 and bb[1]>0 and bb[2]<im.width and bb[3]<im.height,'source silhouette clear of all source edges')
    rows=[]
    for y0,y1 in item['rowBands128']:
        strip=solid.crop((0,y0,im.width,y1))
        cols=[];start=None
        for x in range(im.width):
            live=strip.crop((x,0,x+1,strip.height)).getbbox()
            if live and start is None:start=x
            if not live and start is not None:cols.append([start,x]);start=None
        if start is not None:cols.append([start,im.width])
        check(len(cols)==3,'three actual silhouette bands per source row')
        rows.append({'y':[y0,y1],'x':cols,'horizontalGaps128':[cols[i+1][0]-cols[i][1] for i in range(2)]})
    check(len(rows)==6,'six actual source rows')
    item.update({'actualGrid':[3,6],'actualCount':18,'calibrationCount':6,'actionCounts':{name:6 for name in item['actions']},'rows128':rows,'noSilhouetteEdgeClipping128':True,'headTorsoFirstRecoveryViewed':True,'viewConsistencyViewed':True,'sourceSocketReviewed':False,'nativeRegistrationOwnedBy':'equipment_p1_body','requestedMarginPx':24,'marginDelta':{k:v for k,v in zip(['left','top','right','bottom'],item['outerTransparentMargins128']) if v<24},'sourceLimitations':['Contour gutters below requested 24 px are recorded; opaque bodies remain separate and source silhouettes do not touch image edges.','Native scale, pivot, masks and actual hand sockets are produced/reviewed by actor A owner; raw source review is not motion/ART approval.']})
    results.append({'id':item['id'],'sourceSha256':item['sha256'],'actualGrid':[3,6],'actualCount':18,'noSilhouetteEdgeClipping128':True,'marginDelta':item['marginDelta'],'rowGaps128':[item['rowBands128'][i+1][0]-item['rowBands128'][i][1] for i in range(5)],'rows128':rows})
check(len(results)==4,'four independent generated source sheets')
(ROOT/'generation.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'schema':'wang-lin-a-sword-raw-assist-qa-v1','passed':True,'checks':checks,'generatedSources':4,'sourcePoses':72,'actorAWriteCount':0,'ownerApproved':False,'runtimeIntegrated':False,'results':results}
(ROOT/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'PASS {checks} raw/hash/alpha/grid checks; 4 sources / 72 actual poses')
