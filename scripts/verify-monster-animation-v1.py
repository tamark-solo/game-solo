"""Asset/provenance verification for the new ART package, no owner data writes."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
W=Path(__file__).resolve().parents[1]
B=W/'docs/design/characters/van-hai-monster-animation-v1'
F=W/'docs/design/vfx/van-hai-monster-vfx-v1'
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def hashed(p,h):assert sha(p)==h,str(p)
C=read(B/'catalog.json');FX=read(F/'catalog.json');R=read(B/'source-registration.json')
assert len(C['actors'])==11 and len(C['clips'])==440 and len(C['sources'])==88
assert C['coverage']['missing']==[] and C['coverage']['poses']==2640 and C['warnings']==[]
assert len(C['directions'])==8 and len(C['actions'])==5
assert not C['artApproved'] and not C['runtimeConsumable'] and not FX['artApproved']
for p in read(B/'basis.json')['targets']+read(W/'docs/design/characters/actor-animation-standard-v2/approval.json')['targets']:hashed(W/p['file'],p['sha256'])
hashed(W/'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp','4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8')
sources={s['id']:s for s in C['sources']};regs={r['id']:r for r in R['registration']}
for s in sources.values():
    hashed(B/s['file'],s['sha256']);hashed(B/s['prompt'],s['promptSha256'])
    for p in s['inputFiles']:hashed(W/p['file'],p['sha256'])
    r=regs[s['id']];assert not r['mirrored'] and len(r['frames'])==36
    assert len({f['scale'] for f in r['frames']})==1
    # Nearest sampling may lose a one-pixel tip at either extremum. Record the
    # measured result; never stretch a body to satisfy the nominal height.
    assert abs(np.median(r['neutralNativeHeights'])-next(a['bodyHeightPx'] for a in C['actors'] if a['id']==r['actor']))<=2
    generation=read(B/'generation'/f"{s['id']}.json");assert generation['source']==s['file']
count=0
for c in C['clips'].values():
    assert len(c['frames'])==6 and len(c['durations'])==6 and c['fps']==24
    assert c['loop']==(c['action'] in ['idle','move']) and c['holdLast']==(c['action']=='death')
    assert not c['artApproved'] and not c['runtimeImplemented']
    hashed(B/c['atlas'],c['atlasSha256']);atlas=Image.open(B/c['atlas']).convert('RGBA')
    for f in c['frames']:
        count+=1;hashed(B/f['file'],f['sha256']);im=Image.open(B/f['file']).convert('RGBA');p=np.array(im)
        assert list(im.size)==c['frameSize'] and set(np.unique(p[:,:,3]))=={0,255}
        assert list(im.getchannel('A').getbbox())==f['bounds']
        assert min(f['bounds'][:2])>=2 and f['bounds'][2]<=im.width-2 and f['bounds'][3]<=im.height-2
        r=f['rect'];crop=atlas.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']))
        assert crop.tobytes()==im.tobytes(),f['file']
        for point in f['sockets'].values():assert 0<=point[0]<im.width and 0<=point[1]<im.height
        m=regs[c['registrationSource']]['frames'][f['sourceMapping']];assert m['bounds']==f['bounds'] and m['liftPx']==f['liftPx']
    # Every atlas gutter remains transparent; adjacent poses cannot bleed.
    for i in range(7):
        x=i*(c['frameSize'][0]+4)
        if x<atlas.width:assert atlas.crop((x,0,min(x+2,atlas.width),atlas.height)).getchannel('A').getbbox() is None
assert count==2640
assert len(read(B/'socket-registration.json')['registration'])==2640
assert read(B/'source-problems.json')['problems']==[]
assert FX['coverage']['missing']==[] and len(FX['clips'])==9 and len(FX['props'])==2
soft=[]
for s in FX['sources']:
    hashed(F/s['source'],s['sourceSha256']);hashed(F/s['prompt'],s['promptSha256'])
    for p in s['inputFiles']:hashed(W/p['file'],p['sha256'])
for c in FX['clips'].values():
    hashed(F/c['atlas'],c['atlasSha256']);atlas=Image.open(F/c['atlas']).convert('RGBA');semi=0
    assert len(c['frames'])==6 and c['fps']==30 and not c['loop']
    for f in c['frames']:
        hashed(F/f['file'],f['sha256']);im=Image.open(F/f['file']).convert('RGBA');p=np.array(im);alpha=p[:,:,3]
        assert list(im.size)==c['frameSize'] and im.getchannel('A').getbbox() is not None
        assert alpha[0,0]==0 and alpha[-1,-1]==0
        semi+=int(((alpha>0)&(alpha<255)).sum())
        r=f['rect'];assert atlas.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h'])).tobytes()==im.tobytes()
    assert semi>0,c['id'];soft.append({'id':c['id'],'semiTransparentNativePixels':semi})
for p in FX['props'].values():
    hashed(F/p['file'],p['sha256']);im=Image.open(F/p['file']).convert('RGBA')
    assert list(im.size)==p['frameSize'] and im.getchannel('A').getbbox()
report={'passed':True,'date':'2026-10-13','bodySources':88,'actors':11,'clips':440,'bodyPoses':2640,'vfxSequences':9,'vfxPoses':54,'heldProps':2,'softAlpha':soft,'checks':['source/prompt/input and accepted concept + Wang basis SHA256','eight genuine source views per actor; no mirroring','one neutral scale across five actions','measured source masks and padded body bounds','canonical/atlas byte parity + transparent gutters','all frame socket candidates inside canvas','FX original soft alpha and sequence scale','no missing poses/sources'],'artApproved':False,'runtimeImplemented':False,'ownerMapEdited':False,'ownerDatabaseUsed':False}
out=W/'artifacts/monster-animation';out.mkdir(parents=True,exist_ok=True)
(out/'asset-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
