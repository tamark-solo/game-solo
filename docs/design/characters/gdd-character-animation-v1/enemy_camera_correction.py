"""Append a same-actor/same-view camera correction using an inspected motion source."""
from pathlib import Path
from PIL import Image
import copy,hashlib,json,sys
R=Path(__file__).resolve().parent;W=R.parents[3];read=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old_id,target_id=sys.argv[1:3];ledger=read(R/'generation.json');old=next(j for j in ledger['jobs'] if j['id']==old_id);target=next(j for j in ledger['jobs'] if j['id']==target_id)
seed='--seed-planned' in sys.argv[3:]
assert (old['status']=='planned' if seed else old['status']!='planned') and target['sourceViewed'] and target['sourcePackingAllowed']
assert old['actorId']==target['actorId'] and old['direction']==target['direction']
id=old_id+('-seed-r2' if seed else '-camera-r2');assert not any(j['id']==id for j in ledger['jobs'])
raw=R/target['source'];clean=R/'inputs'/f'{target_id}-clean-source.png';image=Image.open(raw).convert('RGBA');image.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in image.get_flattened_data()])
if clean.exists():assert Image.open(clean).convert('RGBA').tobytes()==image.tobytes(),'Existing input must stay unchanged'
else:image.save(clean)
first={'index':1,'file':clean.relative_to(R).as_posix(),'sha256':sha(clean),'original':raw.relative_to(W).as_posix(),'originalSha256':sha(raw),'role':'OWN inspected same-actor SAME-VIEW motion source PRIMARY edit target','nearestIntegerEnlargement':1,'transparentRgbNormalized':True,'sourceJob':target_id}
wang=copy.deepcopy(old['inputs'][1]);wang.update(index=2,role='Wang exact camera/pixel support only')
own=copy.deepcopy(old['inputs'][0]);own.update(index=3,role='OWN same-view neutral identity/anatomy authority; lineage retains approved original')
prompt=(R/old['prompt']).read_text(encoding='utf-8');prompt='\n'.join('Image1 OWN inspected SAME-VIEW motion sheet is the edit target and camera authority. Image2 Wang supports exact camera/pixel only. Image3 OWN SAME-VIEW neutral locks identity and nonhuman anatomy. All references show the same requested camera; never substitute another direction.' if line.startswith('Image1 ') else line for line in prompt.splitlines())
camera='BACK armor, NO red front chest tablet, NO front face and NO eyes' if old['direction'] in ['north','northeast','northwest'] else 'a strict side PROFILE, only one eye and a thin side edge of the front tablet, never a frontal chest' if old['direction'] in ['east','west'] else 'the exact requested front/diagonal view and its own visible face/chest, no turn toward a different diagonal'
prompt+='\nCAMERA LOCK: Preserve Image1 exact same-view torso/head in BOTH calibration rows and ALL action poses. This '+old['direction']+' view shows '+camera+'. Never revert to southeast during wind-up or recoil. Retain full stone anatomy, connected fists/feet, requested motion and transparent gutters. Original southeast identity is inherited through lineage, NOT a camera input.\n'
pp=R/'prompts'/f'{id}.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8')
new=copy.deepcopy(old)
for k in ['original','originalSha256','sourceSha256','sourceSize','sourceViewed','sourcePackingAllowed','sourceAssessment','excludedActions','apiMetadata','apiRequest','poseSelections','sourceRowFailures','selectionHistory']:new.pop(k,None)
new.update(id=id,prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),inputs=[first,wang,own],source=f'sources/{id}.png',status='planned',cameraCorrectionOf=old_id,corrective=not seed,seededFromOwnSameViewSource=target_id)
if seed:old['supersededPlanned']=True
else:old.update(sourceViewed=True,sourcePackingAllowed=False,excludedActions=list(old['actions']),sourceAssessment='Inspected all source poses: wrong southeast/front chest calibration and motion in a northwest request. Preserve raw/history; reject complete source, no mirrored or pose-fitted salvage.')
ledger['jobs'].append(new);write(R/'generation.json',ledger)
brief=read(R/'enemy-production/plan.json');a=next(a for a in brief['actors'] if a['actorId']==old['actorId']);a['sourceJobs']=[id if i==old_id else i for i in a['sourceJobs']];write(R/'enemy-production/plan.json',brief)
print(json.dumps({'newJob':id,'sameViewTarget':target_id,'noPaidRequest':True}))
