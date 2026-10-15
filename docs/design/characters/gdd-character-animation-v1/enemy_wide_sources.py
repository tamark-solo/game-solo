"""Append generous 4x4 source recipes for a broad enemy; never fit/cut touching art."""
from pathlib import Path
import copy,hashlib,json,sys
from enemy_profiles import PROFILES,sequence,durations,PHASE_NAMES
R=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
actor=sys.argv[1];profile=PROFILES[actor];ledger=read(R/'generation.json');plan=read(R/'production-plan.json');a=next(a for a in plan['actors'] if a['id']==actor);views=read(R/'view-masters/registration.json')['records'];ids=[]
assert profile['anatomyAuthority']=='own-construct','This revision is for broad stone constructs only'
if any(j['actorId']==actor and j.get('enemyRecipeVersion')==4 for j in ledger['jobs']):
 print(json.dumps({'actor':actor,'existingWideAndCorrectiveRecipesPreserved':True,'noReset':True}));sys.exit(0)
assert not (R/'approval.json').exists()
for d in plan['directions']:
 view=next(v for v in views if v['actorId']==actor and v['direction']==d)
 previous=[j for j in ledger['jobs'] if j['actorId']==actor and j['direction']==d and not j.get('supersededPlanned') and j.get('enemyRecipeVersion')==3]
 for j in previous:
  if j['status']=='planned':j['supersededPlanned']=True
  else:j.update(sourceViewed=True,sourcePackingAllowed=False,sourceAssessment='Inspected: broad stone fists touch across six-column calibration/action rows. Preserve original; use new 4x4 recipes, no grid cuts or pixel repairs.',excludedActions=list(j['actions']))
 base=next(j for j in ledger['jobs'] if j['actorId']==actor and j['direction']==d and j.get('enemyRecipeVersion')==3)
 for action in a['actions']:
  id=f'{actor}-{d}-{action}-api4x4-r1';ids.append(id)
  if any(j['id']==id for j in ledger['jobs']):continue
  side='LEFT' if d in ['west','southwest','northwest'] else 'RIGHT';steps=sequence(actor,action,side)
  steps+=['settled grounded corpse quiet hold, same head and feet side','same settled corpse hold'] if action=='death' else ['own ready rest, same facing','own ready rest, same facing']
  camera={'north':'strict BACK, no eyes or front face','northeast':'rear three-quarter upper RIGHT, face hidden NO eyes','east':'right PROFILE, nose/face right','southeast':'front three-quarter lower RIGHT','south':'strict FRONT, two eyes and chest','southwest':'front three-quarter lower LEFT','west':'left PROFILE, face left','northwest':'rear three-quarter upper LEFT, face hidden NO eyes'}[d]
  prompt=f'''Use case: identity-preserve. {a['name']} BODY {action}, exact {d}: {camera} in EVERY figure.
Image1 OWN inspected same-view neutral is PRIMARY camera/motion target. Image2 Wang is camera/pixel support ONLY. Image3 OWN approved identity is PRIMARY nonhuman stone anatomy/material. No Wang head, hair, cloth shoes or costume.
Identity: {profile['identity']}
Exactly FOUR COLUMNS and FOUR ROWS, SIXTEEN complete separate figures, on a 2048x1536 transparent source. Each figure is centered in a spacious 512x384 area. At least80px genuinely empty transparent horizontal gutters between all fists/bodies; at least64px vertical gutters. Keep outer margins80px. Do NOT let hands or silhouettes touch another figure. Use one source-wide body/head scale, leave the unused space empty; never expand a body to fill a cell. No drawn grid.
ROWS1+2: eight identical own standing neutral calibration figures, same requested camera.
ROWS3+4: eight ordered {action} poses in reading order: {' / '.join(steps)}.
Keep {a['bodyNominalPx']}px nominal stone anatomy after later ONE common source scale from the eight neutrals. Skull and armor dimensions remain stable, not per-pose fitted. Lowered and prone poses lower naturally. Body-only empty fists, keep actual heavy stone feet, arms and knees attached; no human anatomy. Rear N/NE/NW never expose eyes even while attacking or recoiling. Do not turn a rear head toward camera.
{'Death: head always screen '+side+', feet opposite through all eight poses. After grounded fall never rise or swap sides. Complete prone body and both fists fit generous horizontal gutters.' if action=='death' else 'Subtle heavy idle, actual alternating foot contacts for move, deliberate shoulder-led attack and honest torso recoil as appropriate; no standing-neutral substituted for footfalls.'}
True transparent RGBA, crisp pixel clusters and limited shade bands. No ground, shadow, glow, halo, checkerboard, text, weapon, shard, extra body, projectile or FX. Preserve all margins and physical silhouette. Do not crop any edge.'''
  pp=R/'prompts'/f'{id}.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8')
  inputs=copy.deepcopy(base['inputs']);j={'id':id,'actorId':actor,'name':a['name'],'group':a['group'],'direction':d,'bodyNominalPx':a['bodyNominalPx'],'actions':[action],'grid':[4,4],'calibrationPoses':8,'activeActionIndexes':list(range(6)),'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':inputs,'source':f'sources/{id}.png','status':'planned','alphaPolicy':a['alphaPolicy'],'enemyRecipeVersion':4,'anatomyAuthority':profile['anatomyAuthority'],'supportMode':profile['support'],'bodyCanvas':profile['deathCanvas'] if action=='death' else profile['canvas'],'bodyPivot':profile['deathPivot'] if action=='death' else profile['pivot'],'waitingForViewMaster':False,'boundViewId':view['id'],'previewDurationMsByAction':{action:durations(action)},'phaseLabels':{action:PHASE_NAMES[action]},'previewTimingsAreBalance':False,'artApproved':False,'motionApproved':False,'runtimeReady':False,'requestedSourceSize':'2048x1536'};ledger['jobs'].append(j)
write(R/'generation.json',ledger)
brief=read(R/'enemy-production/plan.json');next(x for x in brief['actors'] if x['actorId']==actor)['sourceJobs']=ids;brief['activeSourceJobs']=sum(len(x['sourceJobs']) for x in brief['actors']);write(R/'enemy-production/plan.json',brief)
print(json.dumps({'actor':actor,'activeWideSourceJobs':len(ids),'bodyClipTargetUnchanged':len(ids)}))
