from pathlib import Path
from PIL import Image
import json,hashlib,math,sys
R=Path(__file__).resolve().parent;V=R.parents[2]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
checks=[]
def check(v,label):
 checks.append({'name':label,'passed':bool(v)})
 if not v:raise AssertionError(label)
def edge(im):
 a=im.getchannel('A');w,h=im.size;return any(a.crop(b).getbbox() for b in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)])
reg=json.loads((R/'registration.json').read_text(encoding='utf-8'));gen=json.loads((R/'generation.json').read_text(encoding='utf-8'));partial='--partial' in sys.argv
if not partial:
 check(len(reg['clips'])==64,'64 true clips');check(reg['socketReviewComplete'] and not reg['manualReviewPending'],'all source manual review complete');check(not reg['pendingMatrix'] and not reg['pendingSourceRegistrations'],'no missing source/actions')
 dirs=['north','northeast','east','southeast','south','southwest','west','northwest'];acts=['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe'];check({(c['direction'],c['action']) for c in reg['clips']}=={(d,a) for d in dirs for a in acts},'direction/action coverage')
check(not reg['ownerApproved'] and not reg['runtimeIntegrated'],'candidate/runtime scope')
for r in gen['records']:
 if not r.get('sha256'):continue
 check(sha(V/r['raw'])==r['sha256'],'raw exact '+r['id']);check(sha(V/r['prompt'])==r['promptSha256'],'call prompt immutable '+r['id']);check(r['tool']=='built-in-imagegen' and r['transparentRequested'],'built-in transparent '+r['id']);check(sha(Path(r['original']))==r['sha256'],'original exact '+r['id'])
 for p in r['inputs']:check(sha(V/p['file'])==p['sha256'],'input snapshot '+r['id']+p['file'])
raws={};sources={s['id']:s for s in reg['sources']}
for s in reg['sources']:
 check(sha(V/s['file'])==s['sha256'],'selected source '+s['id']);check(s['sourceViewed'] and s['socketReviewComplete'] and s['headTorsoFirstRecoveryReviewed'] and (partial or s['nativeContactViewed']),'selected source/manual native review '+s['id']);check(all(v==0 for v in s['sourceEdges'].values()),'raw edge128 '+s['id']);raws[s['id']]=Image.open(V/s['file']).convert('RGBA')
frame_count=0
for group in reg['calibrations']+reg['clips']:
 isclip='action' in group;atlas=Image.open(V/group['atlas']).convert('RGBA') if isclip else None
 if isclip:
  check(sha(V/group['atlas'])==group['atlasSha256'],'atlas '+group['id']);check(group['durationMs']==sum(f['durationMs'] for f in group['frames']),'holds sum '+group['id']);check(group['sourceScale']==sources[group['sourceId']]['scale'],'clip/source scale '+group['id'])
 for f in group['frames']:
  frame_count+=1;im=Image.open(V/f['file']).convert('RGBA');check(sha(V/f['file'])==f['sha256'],'frame sha '+f['file']);check(list(im.size)==f['canvas'],'native canvas '+f['file']);check(im.getchannel('A').getbbox() and not edge(im),'native complete '+f['file']);check(set(im.getchannel('A').getdata())<=set([0,255]),'binary body alpha '+f['file'])
  if isclip:
   x,y,w,h=f['atlasRect'];check(atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes(),'exact atlas RGBA '+f['file']);aa=atlas.getchannel('A');check(not any(aa.crop(b).getbbox() for b in [(x-2,y-2,x+w+2,y),(x-2,y+h,x+w+2,y+h+2),(x-2,y,x,y+h),(x+w,y,x+w+2,y+h)]),'gutter2 '+f['file'])
  check(f['sourceScale']==sources[f['sourceId']]['scale'] and math.isfinite(f['sourceScale']) and f['sourceScale']>0,'one scale '+f['file']);check(sha(V/f['sourcePartMask'])==f['sourcePartMaskSha256'],'source component mask '+f['file']);raw=raws[f['sourceId']];sx,sy,sw,sh=f['sourceRect'];crop=raw.crop((sx,sy,sx+sw,sy+sh));crop.putalpha(Image.open(V/f['sourcePartMask']).convert('L'));scale=f['sourceScale'];rx,ry=f['root'];px,py=f['pivot'];expected=crop.transform(tuple(f['canvas']),Image.Transform.AFFINE,(1/scale,0,rx-sx-px/scale,0,1/scale,ry-sy-py/scale),Image.Resampling.NEAREST);expected.putalpha(expected.getchannel('A').point(lambda a:255 if a>=128 else 0));check(expected.tobytes()==im.tobytes(),'source reconstruction '+f['file']);check(f['rootMeasurement'].get('manualReviewed') and f['rootMeasurement'].get('semantic'),'semantic root '+f['file'])
  h=f['grip'];point=h['source'];n=h['native'];check(max(abs(n[0]-(px+(point[0]-rx)*scale)),abs(n[1]-(py+(point[1]-ry)*scale)))<=.001,'socket source inverse '+f['file']);check(h['sourcePalmReviewed'] and h['sourceCuffReviewed'] and h['manualConfirmed'],'source hand/cuff manual '+f['file']);check(-180<=h['angleDeg']<=180,'wrist source delta '+f['file'])
  if h['attachmentPolicy']=='held-candidate':check(h['closedGripConfirmed'] and h['visibility']=='closed-grip','actual closed hand claim '+f['file'])
  else:check(h['attachmentPolicy'] in ('ground-planted-command','detach-hover','planted-candidate'),'explicit detached/planted '+f['file'])
 if isclip and group['action'].startswith('cast-'):
  gate=600 if group['action']=='cast-single-target' else 900;end=1560 if gate==600 else 2500;check(sum(f['durationMs'] for f in group['frames'][:3])==gate and group['durationMs']==end,'ART fixture release/end '+group['id'])
report={'schema':'equipment-banner-B-scoped-verification-v1','status':'passed','partial':partial,'checkCount':len(checks),'coverage':reg['coverage'],'canonicalAndCalibrationFrames':frame_count,'registrationSha256':sha(R/'registration.json'),'checks':checks,'ownerApproved':False,'runtimeIntegrated':False}
out=R/'review'/('partial-verification.json' if partial else 'verification.json');out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='checks'}))
