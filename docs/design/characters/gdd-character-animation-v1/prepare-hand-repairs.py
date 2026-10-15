"""Create targeted hand-size/shape edits identified in the visual limb audit."""
from pathlib import Path
import json,hashlib,copy
R=Path(__file__).resolve().parent;W=R.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=json.loads((R/'generation.json').read_text(encoding='utf-8'))
for actor in ['huyen-tam-entry','tich-bach-entry']:
 old=next(j for j in ledger['jobs'] if j['id']==actor+'-south-aoe');id=actor+'-south-aoe-hands-r2'
 if any(j['id']==id for j in ledger['jobs']):continue
 inputs=[{'file':old['source'],'sha256':old['sourceSha256'],'original':(R/old['source']).relative_to(W).as_posix(),'originalSha256':old['sourceSha256'],'role':'edit target: own AOE source, preserve all body/camera/costume except hand shapes'},copy.deepcopy(old['inputs'][0])]
 for n,i in enumerate(inputs,1):i['index']=n
 prompt=f'''Use case: precise-object-edit / identity-preserve. Edit Image1 only at the hands and immediate wrist transitions. Preserve its exact 4 columns x 4 rows layout, all 16 bodies, fixed front camera, character identity, face/hair, costume, legs/boots, scale, pose sequence and transparency. Image2 is the approved OWN identity, for hand size relative to body. No other character design changes.
The opening/release palms in the lower two rows have overlarge spiky star-shaped fingers. Replace them with small, compact natural human pixel hands proportionate to the neutral fists. Keep every palm attached to its wrist/cuff, slim wrist continuous with forearm. Open palm is only slightly wider than a closed fist: one short thumb beside a compact grouped four-finger silhouette with subtly staggered fingertips, no starburst, widely radiating spikes, extra fingers, long claws or mitten balls. At native body80, wrist about2-3px and open palm about4-5px wide. Keep crisp pixel clustering matching original, not photoreal fingers.
Keep hand gesture readable: gather/seal -> two open palms command -> relaxed hands -> standing recovery. Both arms remain naturally bent and connected to shoulders, no extra hands. Leave the first eight neutral calibration poses at the top unchanged. Hands in the lower eight action poses should have consistent small anatomy. Generous transparent gutters, complete feet and hair, true RGBA. No labels, background, shadows, aura, FX, weapons or objects.'''
 pp=R/'prompts'/f'{id}.txt';pp.write_text(prompt,encoding='utf-8');new=copy.deepcopy(old)
 for k in ['original','originalSha256','sourceSha256','sourceSize','sourceViewed','sourcePackingAllowed','sourceAssessment','observedGrid']:
  new.pop(k,None)
 new.update(id=id,source=f'sources/{id}.png',prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),inputs=inputs,status='planned',corrective=True,correctsSource=old['id'],repairReason='native palm size/finger silhouette and wrist connection audit')
 ledger['jobs'].append(new)
(R/'generation.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'prepared':2}))
