"""Prepare a single action row with a direct approved same-view motion reference."""
from pathlib import Path
from PIL import Image
import json,hashlib,copy
R=Path(__file__).resolve().parent;W=R.parents[3];wr=R.parent/'wang-lin-pixel-production-v2'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=read(R/'generation.json');catalog=read(wr/'catalog.json');pins={p['file']:p['sha256'] for p in read(R.parent/'actor-animation-standard-v2/approval.json')['targets']}
for actor,direction in [('huyen-tam-entry','northwest'),('tich-bach-domain','north'),('huyen-tam-domain','west')]:
 old=next(j for j in ledger['jobs'] if j['id']==f'{actor}-{direction}-run-limbs-r2')
 old.update(sourceViewed=True,sourcePackingAllowed=False,status='rejected-limb-repair-candidate',sourceAssessment='Targeted edit did not resolve repeated arm cycle / costume mirror. Keep excluded, use one action row with approved motion reference.')
 id=f'{actor}-{direction}-run-limbs-r3'
 if any(j['id']==id for j in ledger['jobs']):continue
 clip=catalog['clips']['run-'+direction];proxy=R/'inputs'/f'wang-run-{direction}-motion6-8x.png'
 board=Image.new('RGBA',(6*80,112));source_files=[]
 for i,f in enumerate(clip['frames']):
  p=wr/f['file'];rel=p.relative_to(W).as_posix();assert pins[rel]==sha(p)
  im=Image.open(p).convert('RGBA');im.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in im.get_flattened_data()]);board.alpha_composite(im,(i*80+8,8));source_files.append({'file':rel,'sha256':sha(p)})
 board.resize((board.width*8,board.height*8),Image.Resampling.NEAREST).save(proxy)
 inputs=[copy.deepcopy(old['inputs'][1]),{'file':proxy.relative_to(R).as_posix(),'sha256':sha(proxy),'original':(wr/'catalog.json').relative_to(W).as_posix(),'originalSha256':sha(wr/'catalog.json'),'role':'approved Wang SAME VIEW run six phases, motion/style support ONLY; never transfer head/body/clothes','composedFrom':source_files},copy.deepcopy(old['inputs'][2])]
 for n,i in enumerate(inputs,1):i['index']=n
 facing={'north':'BACK view facing screen UP. No face. Jade hanging cloth always on screen RIGHT; do not reverse costume.','northwest':'REAR three-quarter facing upper LEFT, same back/side silhouette as Image1.','west':'LEFT PROFILE, nose left and one visible eye, same silhouette as Image1.'}[direction]
 prompt=f'''Use case: identity-preserve. Pixel game sprite sheet for OWN {old['name']}: one complete running cycle with correct hands and feet.
Image1 OWN neutral is PRIMARY identity, hair, clothes, small skull and slim body proportions. Image2 shows six approved Wang run phases in the SAME requested view: use it only to understand alternating legs and opposite arm swing. Image3 own approved identity. Never copy Wang head/build/costume.
Exactly 6 COLUMNS x 2 ROWS, 12 complete separate figures, true transparent RGBA, ample empty outer margins and gutters. ROW1: six identical OWN standing neutral calibration figures, one fixed common source scale. ROW2: six continuous OWN running keys, following the six limb phases left-to-right in Image2. Contact, compression, passing/flight, opposite-foot contact, compression, passing/flight. Hands are compact fists attached to sleeve cuffs; two complete knees, ankles and boots, no extra limbs. Same small head and body size all frames. No idle poses in row2.
Fixed camera EVERY figure: {facing} Keep hair part, cloth drape and belt on the same side while legs exchange. Arm near the viewer moves FORWARD for one half and BACK for the other half, showing different silhouette rather than repeating the same arm. Keep boots in the correct camera perspective. Hair/robe sway only a little so legs remain readable. Crisp stepped pixels and few shading bands matching own neutral, nominal body80 after one common resize. No labels, grid, ground, background, shadow, glow, FX, weapons or held objects.'''
 pp=R/'prompts'/f'{id}.txt';pp.write_text(prompt,encoding='utf-8')
 new=copy.deepcopy(old)
 for key in ['originalOutput','sourceSha256','size','sourceViewed','sourcePackingAllowed','sourceAssessment','sourceRowFailures','layoutType']:
  new.pop(key,None)
 new.update(id=id,prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),inputs=inputs,source=f'sources/{id}.png',status='planned',grid=[6,2],calibrationPoses=6,correctsSource=old['id'])
 ledger['jobs'].append(new)
(R/'generation.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'prepared':3,'motionReference':'approved same-view Wang run, six pinned frames per view'}))
