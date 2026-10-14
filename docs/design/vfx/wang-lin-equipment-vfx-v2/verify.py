"""Independent hashes/alpha/atlas/source registration audit in this FX root only."""
from PIL import Image
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def edge(im):
 a=im.getchannel('A');w,h=im.size
 return [a.crop(b).getextrema()[1] for b in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]]
checks=[];families=[];history=0
def check(label,g):checks.append({'label':label,'passed':bool(g)})
for family in ['banner','chariot','bead']:
 base=ROOT/family;gen=read(base/'generation.json');m=read(base/'manifest.json');reg=read(base/'registration.json');plan=read(base/'plan.json');history+=len(gen['sources'])
 check(family+'10/60 coverage',len(m['sequences'])==10 and sum(len(s['frames']) for s in m['sequences'])==60);check(family+' candidate approval',not m['artApproved'] and not m['runtimeIntegrated']);check(family+' decoded within12MiB',m['coverage']['decodedCanonicalBytes']<=12*1048576)
 for raw in gen['sources']:
  p=base/raw['file'];check(family+'/'+raw['file']+' raw hash',sha(p)==raw['sha256']);check(family+'/'+raw['file']+' original copy',sha(Path(raw['originalPath']))==sha(p));check(family+'/'+raw['file']+' prompt hash',sha(base/raw['prompt'])==raw['promptSha256']);check(family+'/'+raw['file']+' transparent requested',raw['transparentRequested'])
  for inp in raw['inputs']:check(family+'/'+raw['file']+' actual input '+inp['file'],sha(base/inp['file'])==inp['sha256'])
  if not raw['selected']:check(family+'/'+raw['file']+' retained source reason',bool(raw.get('supersededReason')));continue
  image=Image.open(p).convert('RGBA');cells=[image.crop((i%3*512,i//3*512,(i%3+1)*512,(i//3+1)*512)) for i in range(6)]
  for i,c in enumerate(cells):check(family+'/'+raw['id']+' raw cell physical edge16 '+str(i),max(edge(c))<16)
  check(family+'/'+raw['id']+'6 actual unique raw keys',len({hashlib.sha256(c.tobytes()).hexdigest() for c in cells})==6)
 for s in m['sequences']:
  r=next(r for r in reg['sequences'] if r['id']==s['id']);p=next(p for p in plan['sequences'] if p['id']==s['id']);atlas=Image.open(base/s['atlas']['file']).convert('RGBA');check(family+'/'+s['id']+' atlas hash',sha(base/s['atlas']['file'])==s['atlas']['sha256']);check(family+'/'+s['id']+' one isotropic scale',r['actualScale']==[s['scale'],s['scale']]);check(family+'/'+s['id']+' timing sum',sum(f['durationMs'] for f in s['frames'])==s['durationMs']==sum(p['durations']));check(family+'/'+s['id']+' emitter canvas/pivot common',all(f['canvas']==s['canvas'] and f['pivot']==s['pivot'] for f in s['frames']))
  source=Image.open(base/s['source']).convert('RGBA');rawKeys=[]
  for f in s['frames']:
   file=base/f['file'];im=Image.open(file).convert('RGBA');rawKeys.append(im.tobytes());check(family+'/'+f['id']+' native hash',sha(file)==f['sha256']);check(family+'/'+f['id']+' native RGBA hash',hashlib.sha256(im.tobytes()).hexdigest()==f['rgbaSha256']);check(family+'/'+f['id']+' native canvas',list(im.size)==f['canvas']);check(family+'/'+f['id']+' native padding edge0',max(edge(im))==0);check(family+'/'+f['id']+' softalpha retained',any(0<v<255 for v in im.getchannel('A').get_flattened_data()))
   x,y,w,h=f['rect'];check(family+'/'+f['id']+' atlas RGBA parity',atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes())
   check(family+'/'+f['id']+'2px atlas gutter',max(atlas.crop((x-2,y-2,x+w+2,y)).getchannel('A').getextrema())==0 and max(atlas.crop((x-2,y+h,x+w+2,y+h+2)).getchannel('A').getextrema())==0 and max(atlas.crop((x-2,y,x,y+h)).getchannel('A').getextrema())==0 and max(atlas.crop((x+w,y,x+w+2,y+h)).getchannel('A').getextrema())==0)
   sx,sy,sw,sh=f['sourceCell'];cell=source.crop((sx,sy,sx+sw,sy+sh));ex,ey=f['sourceEmitter'];px,py=f['pivot'];scale=s['scale'];expected=cell.transform(tuple(f['canvas']),Image.Transform.AFFINE,(1/scale,0,ex-px/scale,0,1/scale,ey-py/scale),Image.Resampling.NEAREST)
   check(family+'/'+f['id']+' original source sampled RGBA unchanged',expected.tobytes()==im.tobytes())
  check(family+'/'+s['id']+'6 unique native keys',len(set(rawKeys))==6)
  if s['id']=='aoe-active':check(family+'/'+s['id']+' no fake8 rotated spirit views',not s['aimRotationAllowed'] and 'camera-facing-fixed' in s['cameraPolicy'])
  if family=='bead':check(family+'/'+s['id']+' support/control fact policy',s['factLifetimePolicy'].startswith('Support/control'))
 families.append({'familyId':family,'coverage':m['coverage'],'manifestSha256':sha(base/'manifest.json'),'registrationSha256':sha(base/'registration.json'),'sourceAssessmentSha256':sha(base/'review/source-assessment.json'),'packReportSha256':sha(base/'review/pack-verification.json')})
 for p in (base/'review').glob('*-1x.png'):
  source=Image.open(p).convert('RGBA');double=p.with_name(p.name.replace('-1x.png','-2x.png'));actual=Image.open(double).convert('RGBA')
  check(str(p.relative_to(ROOT))+'2x nearest native parity',actual.tobytes()==source.resize((source.width*2,source.height*2),Image.Resampling.NEAREST).tobytes())
aggregate=read(ROOT/'manifest.json')
for k in aggregate['kits']:check('aggregate '+k['familyId']+' manifest hash',sha(ROOT/k['file'])==k['sha256'])
fail=[c for c in checks if not c['passed']];report={'schema':'wang-lin-equipment-vfx-verification-2','date':'2026-10-14','checks':len(checks),'passed':len(checks)-len(fail),'failures':fail,'coverage':{'newSequences':30,'newFrames':180,'rawSelectedSources':30,'rawHistoryTotal':history,'totalWithApprovedSword':{'sequences':40,'frames':240}},'families':families,'claims':{'artApproved':False,'runtimeIntegrated':False,'gpuProofOwnedByRoot':True,'semanticFrameReviewSeparateFromHashes':True},'checksDetail':checks}
(ROOT/'review').mkdir(exist_ok=True);(ROOT/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({k:report[k] for k in ['checks','passed','failures','coverage','families']}));raise SystemExit(1 if fail else 0)
