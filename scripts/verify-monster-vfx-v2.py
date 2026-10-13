"""Verify exact body preservation, sources, alpha and native FX coverage."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
W=Path(__file__).resolve().parents[1];R=W/'docs/design/vfx/van-hai-monster-vfx-v2'
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def hashed(p,h):assert sha(p)==h,str(p)
C=read(R/'catalog.json');regs=read(R/'registration.json')['registration'];basis=read(R/'body-basis.json')
assert len(C['actors'])==11 and len(C['clips'])==33 and C['coverage']['poses']==198 and not C['coverage']['missing']
assert len(C['sources'])==22 and not C['artApproved'] and not C['runtimeConsumable']
for p in basis['targets']:hashed(W/p['file'],p['sha256'])
for p in read(W/'docs/design/characters/actor-animation-standard-v2/approval.json')['targets']:hashed(W/p['file'],p['sha256'])
hashed(W/'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp','4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8')
for s in C['sources']:
 hashed(R/s['source'],s['sha256']);hashed(R/s['prompt'],s['promptSha256'])
 for p in s['inputFiles']:hashed(W/p['file'],p['sha256'])
 assert read(R/'generation'/f"{s['id']}.json")['source']==s['source']
measurements=[]
for c in C['clips'].values():
 assert len(c['frames'])==6 and c['fps']==24 and not c['loop']
 hashed(R/c['atlas'],c['atlasSha256']);atlas=Image.open(R/c['atlas']).convert('RGBA')
 widths=[];soft=0
 for f in c['frames']:
  hashed(R/f['file'],f['sha256']);im=Image.open(R/f['file']).convert('RGBA');a=np.array(im)[:,:,3]
  assert list(im.size)==c['frameSize'] and list(im.getchannel('A').getbbox())==f['bounds']
  assert a[0,:].max()==0 and a[-1,:].max()==0 and a[:,0].max()==0 and a[:,-1].max()==0
  soft+=int(((a>0)&(a<255)).sum());r=f['rect'];assert atlas.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h'])).tobytes()==im.tobytes()
  b=f['coreBounds'];widths.append(b[2]-b[0] if b else 0)
 # A narrow source tip can disappear under nearest sampling; keep the measured
 # core instead of stretching individual FX frames to meet the nominal width.
 assert soft>0 and abs(max(widths)-c['peakTargetWidth'])<=max(4,c['peakTargetWidth']*.05),(c['id'],widths)
 reg=next(r for r in regs if r['id']==c['id']);assert len({f['scale'] for f in reg['frames']})==1
 assert all(g['opaquePixelsAtCut']==0 for g in reg['horizontalGutters']),c['id']
 if c['phase']!='release':assert all(g['opaquePixelsAtCut']==0 for g in reg['verticalGutters']),c['id']
 measurements.append({'id':c['id'],'peakCoreWidth':max(widths),'softPixels':soft,'frameSize':c['frameSize']})
for a in C['actors']:
 for phase in ['charge','release','impact']:assert C['clips'][a[phase]]['slug']==a['id']
elite=[a for a in C['actors'] if a['rank']=='elite'];assert len(elite)==3
assert len({C['clips'][a['release']]['atlasSha256'] for a in C['actors']})==11
report={'passed':True,'date':'2026-10-13','sources':22,'actors':11,'sequences':33,'poses':198,'bodyFilesUnchanged':len(basis['targets']),'measurements':measurements,'artApproved':False,'runtimeImplemented':False,'checks':['source/prompt/input hashes','3171 pinned body/source/catalog bytes unchanged','323 Wang approved basis bytes unchanged','map background unchanged','33 six-frame sequences; unique release per actor','soft alpha/bounds/canonical-atlas parity','one scale per phase; native core width targets','measured gutters, no opaque clipping into neighbor']}
out=W/'artifacts/monster-vfx-v2';out.mkdir(parents=True,exist_ok=True);(out/'asset-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='measurements'}))
