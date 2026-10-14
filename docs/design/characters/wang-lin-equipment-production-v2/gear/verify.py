"""Scoped physical-source/native/layer verification. Never writes body or prior roots."""
from PIL import Image
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parent;V1=V2.parent/'wang-lin-equipment-production-v1';REPO=V2.parents[3]
def read(p):return json.loads(p.read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bbox(im,t=1):return im.getchannel('A').point(lambda a:255 if a>=t else 0).getbbox()
def edge(im,t=128):
 a=im.getchannel('A');w,h=im.size
 return any(a.crop(b).getextrema()[1]>=t for b in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)])
def vivid(im):return sum(1 for r,g,b,a in im.get_flattened_data() if a>=128 and ((r>200 and b>160 and g<110)or(b>200 and r<110 and g<110)))
checks=[];warnings=[]
def check(label,good,detail=None):
 checks.append({'label':label,'passed':bool(good),**({'detail':detail} if detail is not None else {})})
gen=read(ROOT/'generation.json');regs=[read(ROOT/f/'registration.json') for f in ['sword','banner','chariot','bead']]
for r in gen['records']:
 raw=V2/r['file'];check(r['file']+' raw hash',sha(raw)==r['sourceSha256']);check(r['file']+' original byte copy',sha(Path(r['original']))==sha(raw));check(r['file']+' prompt hash',sha(V2/r['prompt'])==r['promptSha256'])
 for inp in r['inputs']:check(r['file']+' actual input '+inp['file'],sha(V2/inp['file'])==inp['sha256'])
 check(r['file']+' transparent requested',r.get('transparentRequested',True))
 if not r.get('selected',True):check(r['file']+' history retained',bool(r.get('supersededReason')));continue
 sheet=Image.open(raw).convert('RGBA');rects=[(round(i%3*sheet.width/3),round(i//3*sheet.height/3),round((i%3+1)*sheet.width/3),round((i//3+1)*sheet.height/3)) for i in range(9)];cells=[sheet.crop(c) for c in rects]
 for i,c in enumerate(cells):check(r['id']+' raw physical cell edge '+str(i),not edge(c));check(r['id']+' raw cell nonempty '+str(i),bbox(c,128) is not None)
 check(r['id']+' distinct raw eight views',len({hashlib.sha256(c.tobytes()).hexdigest() for c in cells[:8]})==8)
 # Distinct hashes support separate keys; semantic perspective remains visual assessment.
for data in regs:
 family=data['records'][0]['familyId'];check(family+' identity/view coverage',len(data['records'])==16 and len({(r['identityId'],r['direction']) for r in data['records']})==16)
 check(family+' no automatic approval',not data['ownerApproved'] and not data['runtimeIntegrated'])
 for r in data['records']:
  raw=V2/r['source'];check(r['id']+' source descriptor hash',sha(raw)==r['sourceSha256']);full=Image.open(V2/r['fullFile']).convert('RGBA');check(r['id']+' full hash',sha(V2/r['fullFile'])==r['fullSha256']);check(r['id']+' canvas',list(full.size)==r['canvas']);check(r['id']+' no native clipping',not edge(full,1));check(r['id']+' opaque vivid fringe0',vivid(full)==0)
  layers=[]
  for l in r['layers']:
   check(r['id']+' '+l['role']+' layer hash',sha(V2/l['file'])==l['sha256']);im=Image.open(V2/l['file']).convert('RGBA');check(r['id']+' '+l['role']+' same canvas',im.size==full.size);layers.append(im)
  union=Image.new('RGBA',full.size,(0,0,0,0))
  for im in layers:union=Image.alpha_composite(union,im)
  check(r['id']+' exact visible RGBA layer union',all(a==b if a[3] or b[3] else True for a,b in zip(full.get_flattened_data(),union.get_flattened_data())))
  if not r.get('reusedApprovedPilot'):
   reg=next(s for s in data['sources'] if s['source']==r['source']);check(r['id']+' one source factor',r['scale']==reg['scale']);check(r['id']+' no wearer attachment inferred',r['wearerHandAnchor'] is None);check(r['id']+' no repaint',not r['pixelsRepainted'])
   gx,gy=r['registeredGrip'];ix,iy=int(gx),int(gy);check(r['id']+' actual grip material represented',full.getpixel((ix,iy))[3]>=128);check(r['id']+' grip quantization <=2px',r['gripQuantizationErrorPx']<=2)
   if family=='banner':
    front=next(im for l,im in zip(r['layers'],layers) if l['role']=='front');check(r['id']+' actual metal grip front',front.getpixel((ix,iy))[3]>=128)
   if family=='chariot':check(r['id']+' measured independent wheel ground',len(r['registeredGround'])==2 and r['gripMeaning'].startswith('Actual command'))
  if family=='bead':check(r['id']+' invariant reuse honest',r['sphericalInvariantReuse'] and r['orientationArtworkCount']==1 and not r['newPerspectiveDrawn'])
 for p in (ROOT/family/'review').glob('*-1x.png'):
  source=Image.open(p).convert('RGBA');double=p.with_name(p.name.replace('-1x.png','-2x.png'));actual=Image.open(double).convert('RGBA')
  check(str(p.relative_to(ROOT))+'2x nearest native parity',actual.tobytes()==source.resize((source.width*2,source.height*2),Image.Resampling.NEAREST).tobytes())
for root,label in [(V1,'approved pilot'),(V1.parent/'wang-lin-concept-direction-v5','approved V5')]:
 d=read(root/'approval.json')
 for r in d['files']:check(label+' pin '+r['file'],sha(root/r['file'])==r['sha256'])
basis=read(V1/'basis.json')
for r in basis['protectedRuntimeAndMapFiles']:
 p=V1/r['file'];check('protected runtime/map '+r['file'],sha(p)==r['sha256'])
coverage={'directionBindings':sum(len(r['records']) for r in regs),'newIndependentPerspectiveBindings':sum(not r.get('reusedApprovedPilot') for d in regs for r in d['records']),'approvedArtworkReuseBindings':sum(bool(r.get('reusedApprovedPilot')) for d in regs for r in d['records']),'uniqueSelectedPhysicalFiles':len({r['fullFile'] for d in regs for r in d['records']}),'newRawSelected':sum(bool(r.get('selected',True)) for r in gen['records']),'newRawHistoryTotal':len(gen['records']),'selectedSourceCells':sum(9 for r in gen['records'] if r.get('selected',True)),'pilotPins':len(read(V1/'approval.json')['files']),'v5Pins':86,'protectedRuntimeMapPins':len(basis['protectedRuntimeAndMapFiles'])}
fail=[c for c in checks if not c['passed']];report={'schema':'wang-lin-equipment-physical-verification-2','date':'2026-10-14','checks':len(checks),'passed':len(checks)-len(fail),'failures':fail,'warnings':warnings,'coverage':coverage,'claims':{'artApproved':False,'newViewArtApproved':False,'runtimeIntegrated':False,'semanticViewReviewIsSeparate':True},'checksDetail':checks}
(ROOT/'review').mkdir(exist_ok=True);(ROOT/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({k:report[k] for k in ['checks','passed','failures','coverage']}));raise SystemExit(1 if fail else 0)
