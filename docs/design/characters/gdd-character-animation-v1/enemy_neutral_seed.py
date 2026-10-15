"""Seed undispatched enemy actions from own reviewed neutral view.

Keep original recipes/plans as unexecuted history, remove conflicting SE camera
references, and require a new MCP plan before any paid source request.
"""
from pathlib import Path
import copy,hashlib,json,sys
from enemy_profiles import PROFILES
R=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
actor=sys.argv[1];profile=PROFILES[actor];human=profile['anatomyAuthority']=='own-human'
ledger=read(R/'generation.json');views=read(R/'view-masters/registration.json')['records'];brief=read(R/'enemy-production/plan.json');a=next(a for a in brief['actors'] if a['actorId']==actor);mapping={}
for old in list(ledger['jobs']):
 if old['id'] not in a['sourceJobs'] or old['status']!='planned' or old.get('neutralSeeded') or old.get('corrective'):continue
 assert old.get('enemyRecipeVersion') in [3,4]
 view=next(v for v in views if v['actorId']==actor and v['direction']==old['direction']);assert view['viewReviewedByModel']
 id=old['id']+'-neutral-r2';assert not any(j['id']==id for j in ledger['jobs'])
 inputs=copy.deepcopy(old['inputs'][:2]);inputs[0]['role']='OWN inspected SAME-VIEW neutral PRIMARY camera/action target and identity; approved ancestry retained';inputs[1]['role']='Wang SAME-VIEW PRIMARY human anatomy/pixel standard; retain own face and outfit' if human else 'Wang SAME-VIEW camera/pixel support only; preserve own nonhuman anatomy'
 authority='Image1 OWN inspected SAME-VIEW neutral is PRIMARY motion/camera target and identity. Image2 live Wang is the direct PRIMARY human anatomy/pixel standard; keep OWN face, hair, age, clothing and approved body proportions.' if human else 'Image1 OWN inspected SAME-VIEW neutral is PRIMARY camera, nonhuman anatomy and identity. Image2 Wang supports camera/pixel only.'
 prompt=(R/old['prompt']).read_text(encoding='utf-8');prompt='\n'.join(authority+' Only requested SAME-VIEW images are provided: inherit approved identity through the own-view lineage, never borrow another camera.' if line.startswith('Image1 ') else line for line in prompt.splitlines())
 d=old['direction'];camera='only BACK head, neck, shoulders and back outfit; NO front collar/chest, face or eyes' if d in ['north','northeast','northwest'] else 'the SAME PROFILE camera as Image1, one visible eye, no turn toward a front diagonal' if d in ['east','west'] else 'the exact front/diagonal head and torso from Image1, with correct face/chest, never the other diagonal'
 prompt+='\nFINAL CAMERA AUTHORITY for '+d+': copy Image1 orientation into ALL '+str(old['grid'][0]*old['grid'][1])+' figures, including neutral calibration, recoil, wind-up and low poses. Show '+camera+'. Preserve own hair/skull, material, attached limbs and body build exactly from Image1, including any own hair tuft/tie; descriptive hair shorthand never overrides the actual inspected identity. No mirror, fitting, external prop or FX.\n'
 pp=R/'prompts'/f'{id}.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8');new=copy.deepcopy(old);new.update(id=id,inputs=inputs,prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),source=f'sources/{id}.png',neutralSeeded=True,cameraSeedOf=old['id']);old['supersededPlanned']=True;ledger['jobs'].append(new);mapping[old['id']]=id
a['sourceJobs']=[mapping.get(id,id) for id in a['sourceJobs']];write(R/'generation.json',ledger);write(R/'enemy-production/plan.json',brief);print(json.dumps({'actor':actor,'seededUnexecutedJobs':len(mapping),'paidRequests':0}))
