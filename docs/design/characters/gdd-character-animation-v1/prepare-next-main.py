"""Continue the six missing main views, carrying forward the scoped limb fixes."""
from pathlib import Path
from PIL import Image
import copy,hashlib,json
R=Path(__file__).resolve().parent;W=R.parents[3];wr=R.parent/'wang-lin-pixel-production-v2'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=read(R/'generation.json');catalog=read(wr/'catalog.json');pins={p['file']:p['sha256'] for p in read(R.parent/'actor-animation-standard-v2/approval.json')['targets']}
for j in ledger['jobs']:
 if j['actorId'] not in ['huyen-tam-domain','tich-bach-domain'] or j['direction'] not in ['northwest','northeast','east'] or j['status']!='planned' or j.get('supersededPlanned') or j.get('postLimbAuditPrompt'):continue
 old=copy.deepcopy(j);direction=j['direction'];prompt=(R/j['prompt']).read_text(encoding='utf-8')
 if j['actions']==['run']:
  clip=catalog['clips']['run-'+direction];proxy=R/'inputs'/f'wang-run-{direction}-motion6-8x.png';board=Image.new('RGBA',(480,112));parts=[]
  for n,f in enumerate(clip['frames']):
   p=wr/f['file'];rel=p.relative_to(W).as_posix();assert pins[rel]==sha(p);im=Image.open(p).convert('RGBA');im.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in im.get_flattened_data()]);board.alpha_composite(im,(n*80+8,8));parts.append({'file':rel,'sha256':sha(p)})
  if not proxy.exists():board.resize((3840,896),Image.Resampling.NEAREST).save(proxy)
  j['inputs'][1]={'index':2,'file':proxy.relative_to(R).as_posix(),'sha256':sha(proxy),'original':(wr/'catalog.json').relative_to(W).as_posix(),'originalSha256':sha(wr/'catalog.json'),'role':'approved Wang SAME VIEW run: motion support ONLY; own proportions from Image1/3','composedFrom':parts}
  camera={'northwest':'REAR three-quarter upper LEFT, face hidden','northeast':'REAR three-quarter upper RIGHT, face hidden','east':'strict RIGHT PROFILE, nose right, only one eye'}[direction]
  prompt=f'''Use case: identity-preserve. Own {j['name']} six-key running cycle, exact {camera} camera in EVERY figure.
Image1 OWN same-view neutral PRIMARY identity/camera/body proportions. Image2 six Wang run phases SAME view supports limb timing/pixel treatment ONLY. Image3 OWN approved appearance. Never transfer Wang head/build/costume.
Exactly SIX columns by TWO rows,12 isolated figures, genuinely transparent RGBA, complete hair/boots, large transparent margins and gutters. Row1 six identical standing neutral calibration poses, body80 after ONE common resize. Row2 six running phases: contact, compression, passing/flight, opposite-foot contact, compression, passing/flight. Follow relative leg/arm phase of Image2 while keeping OWN slim body and small head. Arms swing against legs, near arm forward for one half and back for the other, two complete boot/knee chains, do not repeat a half-cycle. Keep side details on the same side; never mirror or turn camera when changing legs. Short natural flight only, no stretching body. Crisp pixel clusters, small fists attached to cuffs; no labels/grid/floor/background/shadows/FX/gear. Every action pose is running, no standing reset.'''
  j.update(grid=[6,2],calibrationPoses=6,activeActionIndexes=list(range(6)))
  j.pop('sourceActionPoses',None)
 else:
  prompt+='\nLimb quality carried from the inspected repair: hands stay small relative to the face, wrist continuously attached to cuff, compact grouped fingers/short thumb; no giant spiky star palms. Both knees/ankles/boots stay attached, contact feet follow the requested view. Keep rear occlusion physically correct, do not show hands through hair. Keep all actual core pixels inside the raw image with generous margins.\n'
  if j['actions']==['death']:prompt+='Fall onto ONE consistent side: first knee/brace then body lowering toward the same head/foot side in every prone key. Never flip head and feet mid-fall, no recovery to standing after corpse.\n'
 pp=R/'prompts'/f"{j['id']}-post-limb-audit-r1.txt";assert not pp.exists();pp.write_text(prompt,encoding='utf-8');j.update(prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),postLimbAuditPrompt=True);j.setdefault('history',[]).append(old)
(R/'generation.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'preparedMissingViews':6,'jobs':30}))
