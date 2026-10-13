"""Read-only byte/source/alpha/radius checks; never an ART approval or MMO benchmark."""
from pathlib import Path
import hashlib,json,sys,numpy as np
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
W=Path(__file__).resolve().parents[1];R=W/'docs/design/vfx/dark-seal-officer-vfx-v2'
read=lambda p:json.loads(Path(p).read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def hashed(p,h):assert sha(p)==h,str(p)+' changed'
rgba=lambda p:Image.open(p).convert('RGBA')
C=read(R/'catalog.json');G=read(R/'registration.json')['registration'];P=read(R/'production-plan.json');B=read(R/'body-basis.json')
assert C['coverage']['sequences']==8 and C['coverage']['poses']==48 and not C['coverage']['missing']
assert not C['artApproved'] and not C['runtimeConsumable'] and not C['experience']['runtimeImplemented']
assert len(B['targets'])==1482
for t in B['targets']:hashed(W/t['file'],t['sha256'])
player=read(W/'docs/design/characters/actor-animation-standard-v2/approval.json')['targets']
wolf=read(W/'docs/design/characters/cloud-wolf-king-animation-v1/approval.json')['targets']
assert len(player)==323 and len(wolf)==556
for t in player+wolf:hashed(W/t['file'],t['sha256'])
hashed(W/'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp','4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8')
hashed(W/'docs/design/world/van-hai-living-world-v1/plan.json','9890bf1589b6efdc2858fcca2f1e1d56d6a5ec4b2e58238ab5c297d4bbefa576')
for s in C['sources']:
 hashed(R/s['source'],s['sha256']);hashed(R/s['prompt'],s['promptSha256'])
 gen=read(R/'generation'/(s['id']+'.json'))
 assert gen['tool']=='built-in-imagegen' and not gen['artApproved'] and gen['sourceSha256']==s['sha256'] and gen['promptSha256']==s['promptSha256']
 assert gen['source']==s['source'] and gen['prompt']==s['prompt']
 for t in s['inputFiles']:hashed(W/t['file'],t['sha256'])
measurements=[];frames=0
for c in C['clips'].values():
 reg=next(r for r in G if r['id']==c['id']);assert len(reg['frames'])==6 and len(c['frames'])==6
 assert len({m['scale'] for m in reg['frames']})==1 and not reg['rgbPainted'] and not reg['bodyThresholdApplied']
 assert all(g['opaquePixelsAtCut']==0 for g in reg['verticalGutters']+reg['horizontalGutters'])
 assert c['fps']==24 and not c['loop'];hashed(R/c['atlas'],c['atlasSha256']);atlas=rgba(R/c['atlas']);source=rgba(R/reg['source']);soft=bright=0;peak=radius=0
 for f,m in zip(c['frames'],reg['frames'],strict=True):
  hashed(R/f['file'],f['sha256']);im=rgba(R/f['file']);a=np.array(im);assert list(im.size)==c['frameSize']
  assert not a[:2,:,3].any() and not a[-2:,:,3].any() and not a[:,:2,3].any() and not a[:,-2:,3].any()
  assert list(im.getchannel('A').getbbox())==f['bounds'];rect=f['rect'];box=(rect['x'],rect['y'],rect['x']+rect['w'],rect['y']+rect['h']);assert atlas.crop(box).tobytes()==im.tobytes()
  gutter=atlas.crop((box[0]-2,box[1]-2,box[2]+2,box[3]+2)).getchannel('A');assert gutter.getbbox()==tuple(v+2 for v in im.getchannel('A').getbbox())
  cropped=source.crop(tuple(m['sourceRect'])).crop(tuple(m['alphaBounds']));native=cropped.resize(tuple(m['nativeSize']),Image.Resampling.NEAREST);rebuilt=Image.new('RGBA',tuple(c['frameSize']));rebuilt.alpha_composite(native,tuple(m['nativeOffset']));assert rebuilt.tobytes()==im.tobytes()
  assert m['softAlphaPreserved'] and m['shardsRemoved']==0
  core=im.getchannel('A').point(lambda v:255 if v>=64 else 0).getbbox();assert list(core)==f['coreBounds'];peak=max(peak,core[2]-core[0]);ys,xs=np.where(a[:,:,3]>=64);radius=max(radius,float(np.hypot(xs-c['anchor'][0],ys-c['anchor'][1]).max()))
  soft+=int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum());bright=max(bright,int(((a[:,:,:3].astype(int).sum(axis=2)>610)&(a[:,:,3]>=128)).sum()));frames+=1
 assert soft>0 and abs(peak-c['peakTargetWidth'])<=4
 if 'peakTargetRadius' in c:assert abs(radius-c['peakTargetRadius'])<=2,(c['id'],radius);assert 'no per-frame fit' in reg['scaleBasis']
 measurements.append({'id':c['id'],'nativeSize':c['frameSize'],'peakCoreWidth':peak,'peakCoreRadius':round(radius,2),'softPixels':soft,'peakBrightPixels':bright})
assert frames==48
delivery=R/'delivery.json'
if delivery.exists():
 for t in read(delivery)['targets']:hashed(R/t['file'],t['sha256'])
approval_file=R/'approval.json'
if approval_file.exists():
 approval=read(approval_file)
 assert approval['ownerApproved'] and approval['vfxApproved'] and approval['vfxAnimationApproved']
 assert not approval['bodyAnimationApproved'] and not approval['gameplayTimingApproved'] and not approval['runtimeImplemented']
 assert len(approval['targets'])==106
 for t in approval['targets']:hashed(W/t['file'],t['sha256'])
report={'passed':True,'date':'2026-10-13','sources':8,'sequences':8,'frames':48,'motion01FilesUnchanged':1482,'playerFilesUnchanged':323,'approvedWolfFilesUnchanged':556,'mapUnchanged':True,'livingPlanUnchanged':True,'measurements':measurements,'checks':['all source/prompt/input hashes','1482 Motion01 body/source/socket/kit/fixture/VFX01 files unchanged','eight six-frame sequences with distinct skill links','soft alpha, shards, nearest reconstruction and atlas gutter2 parity','one scale/sequence, fixed common ring origin and radius112','player323 / wolf556 / map / plan hashes unchanged'],'artApproved':False,'runtimeImplemented':False,'limits':['ring source and hand emitters remain presentation candidates','rendered safe wedge clipped separately; source alpha remains intact','pixel metrics do not approve visual quality or performance']}
out=W/'artifacts/dark-seal-officer-vfx-v2';out.mkdir(parents=True,exist_ok=True);(out/'asset-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='measurements'},ensure_ascii=False))
