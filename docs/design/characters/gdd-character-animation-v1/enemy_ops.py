"""Prepare/bind new GDD enemy source jobs without generating or publishing art."""
from pathlib import Path
import copy,hashlib,json,sys
from enemy_profiles import IDS,PROFILES,ACTION_NAMES,ROLE_ACTION_NAMES,PHASE_NAMES,sequence,durations
R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert not (R/'approval.json').exists()
mode=sys.argv[1];plan=read(R/'production-plan.json');ledger=read(R/'generation.json');reg=read(R/'view-masters/registration.json');out=R/'enemy-production';out.mkdir(exist_ok=True)
if mode=='prepare':
 if 'cast-decoy' not in next(a for a in plan['actors'] if a['id']=='dark-seal-true-body')['actions']:
  plan.setdefault('coverageHistory',[]).append({'targetBodyClips':plan['targetBodyClips'],'reason':'Dedicated Phan Phu body gesture adds 8 real directional clips; Hua defeat slot becomes subdued hold, not death.'})
  a=next(a for a in plan['actors'] if a['id']=='dark-seal-true-body');a['actions'].insert(a['actions'].index('cast-aoe'),'cast-decoy')
  a=next(a for a in plan['actors'] if a['id']=='hua-lap-quoc');a['actions']=['subdued' if x=='death' else x for x in a['actions']]
 plan['targetBodyClips']=sum(len(a['actions'])*8 for a in plan['actors']);plan['targetBodyKeys']=plan['targetBodyClips']*6;plan['targetKeysAreEstimate']=True;write(R/'production-plan.json',plan)
 selected=IDS
elif mode=='bind':selected=[sys.argv[2]];assert selected[0] in IDS
else:raise ValueError(mode)
for actor in selected:
 a=next(a for a in plan['actors'] if a['id']==actor);profile=PROFILES[actor]
 for direction in plan['directions']:
  if mode=='bind' and direction!=sys.argv[3]:continue
  v=next((v for v in reg['records'] if v['actorId']==actor and v['direction']==direction),None)
  if mode=='bind':assert v and v['viewReviewedByModel'],'Inspect/register the complete own view first'
  own=R/'inputs'/f'{actor}-clean.png';original=R.parent/'gdd-character-concepts-v1'/a['file'];same=R/v['proxy'] if v else own;original_same=R/v['file'] if v else original
  wang=R/'inputs'/f'wang-{direction}-clean.png';wang_original=R.parent/'van-hai-npc-visual-standard-v1/inputs'/f'wang-lin-live-{direction}-nearest8x.png'
  waiting=not v and direction!='southeast'
  inputs=[]
  for n,(file,origin,role) in enumerate([(same,original_same,'OWN inspected SAME-VIEW motion target PRIMARY' if not waiting else 'UNBOUND: own SE identity only; dispatch forbidden'),(wang,wang_original,'Wang camera/pixel support only; OWN enemy anatomy is authoritative'),(own,original,'OWN approved enemy identity/anatomy/outfit PRIMARY')],1):inputs.append({'index':n,'file':file.relative_to(R).as_posix(),'sha256':sha(file),'original':origin.relative_to(W).as_posix(),'originalSha256':sha(origin),'role':role,'nearestIntegerEnlargement':1 if n==2 else 8,'transparentRgbNormalized':True})
  groups=[('g1',['idle','hit'],False),('gait',['move'],False),('attack' if a['group']=='boss-stage2' else 'g2',['attack'],False)]
  if a['group']=='boss-stage2':groups.extend([('g2',['appear','cast-single-target'],False),('aoe',['cast-aoe'],True)])
  groups.append(('subdued' if actor=='hua-lap-quoc' else 'death-wide',['subdued' if actor=='hua-lap-quoc' else 'death'],actor!='hua-lap-quoc'))
  if actor=='dark-seal-true-body':groups.append(('decoy',['cast-decoy'],False))
  for suffix,actions,wide in groups:
   id=f'{actor}-{direction}-{suffix}';old=next((j for j in ledger['jobs'] if j['id']==id),None)
   if mode=='prepare' and old and old.get('enemyRecipeVersion')==3:continue
   if mode=='bind' and old and not old.get('waitingForViewMaster') and old.get('boundViewId')==v['id']:continue
   assert not old or old['status']=='planned','Use a corrective sibling; recorded source is immutable'
   side='LEFT' if direction in ['west','southwest','northwest'] else 'RIGHT'
   if wide:
    steps=sequence(actor,actions[0],side)+(['corpse quiet hold, same head/feet side','final settled corpse hold'] if actions[0]=='death' else ['own neutral settles','own neutral quiet hold'])
    rows='ROWS1+2: eight identical own standing/floating neutral calibration figures. ROWS3+4: eight ordered '+actions[0]+' poses in reading order: '+' / '.join(steps)+'.';grid=[4,4]
   else:
    rows='ROW1: six identical own standing/floating neutral calibration figures.\n'+'\n'.join('ROW'+str(i+2)+': '+action+': '+' / '.join(sequence(actor,action,side))+'.' for i,action in enumerate(actions));grid=[6,len(actions)+1]
   camera={'north':'strict BACK, no eyes or face','northeast':'REAR three-quarter upper RIGHT, face hidden','east':'RIGHT PROFILE, nose right','southeast':'front three-quarter lower RIGHT','south':'strict FRONT toward screen DOWN, two eyes/chest','southwest':'front three-quarter lower LEFT','west':'LEFT PROFILE, nose left','northwest':'REAR three-quarter upper LEFT, face hidden'}[direction]
   prompt=f'''Use case: identity-preserve. New GDD enemy BODY animation: {a['name']}, exact {direction}: {camera} in every pose.
Image1 OWN same-view neutral is the motion/camera target. Image2 Wang same-view supports pixel treatment/camera only. Image3 OWN approved enemy is PRIMARY anatomy, age, identity and materials. Do not adopt Wang face, hair, small humanoid build or costume.
Identity: {profile['identity']}
Exactly {grid[0]} COLUMNS x {grid[1]} ROWS. {rows}
ONE scale for the complete source from the neutral calibration, nominal {a['bodyNominalPx']} native pixels. Keep own skull/armor dimensions throughout. Lean, compression, crouch and fall lower the pose naturally; never fit per-pose height. Keep actual camera and anatomical rear occlusion in all actions. Rear hands do not show through torso, mantle or hair.
Compact attached hands/fingers for human/spirit; complete heavy stone fists for construct. Both actual stone feet/boots stay attached where applicable; spectral character has NO boots or invented walking legs. No mirrored view or flipped costume. All figures isolated by generous transparent gutters, with ample margins for complete hair, fists and prone body on all edges.
Truly transparent RGBA, crisp stepped pixel contours and limited shade bands. Body/outfit only; no floor, shadow, captions, grid, held weapon, projectile, detached shards, duplicate actor, warning ring, spell glow, smoke, aura or external FX. {'Preserve original intrinsic soft spectral alpha, not binary clipping. Each key still has a complete visible body; no empty/fully vanished final slot.' if profile['support']=='spectral-projection' else 'Solid own body, truthful physical foot contact.'}
{'Every falling/prone key has HEAD toward screen '+side+' and feet toward the opposite side; never swap or rise after corpse.' if actions==['death'] else ''}'''
   pp=R/'prompts'/f'{id}-enemy-{"bound-r4" if mode=="bind" else "r3"}.txt'
   if pp.exists():assert pp.read_text(encoding='utf-8')==prompt,'Never overwrite a planned or recorded prompt'
   else:pp.write_text(prompt,encoding='utf-8')
   history=copy.deepcopy(old) if old else None
   data={'id':id,'actorId':actor,'name':a['name'],'group':a['group'],'direction':direction,'bodyNominalPx':a['bodyNominalPx'],'actions':actions,'grid':grid,'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':inputs,'source':f'sources/{id}-enemy-r3.png','status':'planned','alphaPolicy':a['alphaPolicy'],'enemyRecipeVersion':3,'anatomyAuthority':profile['anatomyAuthority'],'supportMode':profile['support'],'bodyCanvas':profile['deathCanvas'] if actions==['death'] else profile['canvas'],'bodyPivot':profile['deathPivot'] if actions==['death'] else profile['pivot'],'waitingForViewMaster':waiting,'requiredViewMaster':f'{actor}-{direction}-neutral' if waiting else None,'boundViewId':v['id'] if v else None,'previewDurationMsByAction':{action:durations(action) for action in actions},'previewTimingsAreBalance':False,'phaseLabels':{action:PHASE_NAMES[action] for action in actions},'artApproved':False,'motionApproved':False,'runtimeReady':False}
   if wide:data.update(calibrationPoses=8,activeActionIndexes=[0,1,2,3,4,5])
   if old:
    old.setdefault('history',[]).append({k:value for k,value in history.items() if k!='history'});old.update(data)
   else:ledger['jobs'].append(data)
write(R/'generation.json',ledger)
previous_brief=read(out/'plan.json') if (out/'plan.json').exists() else None
profiles=[]
for actor in IDS:
 a=next(a for a in plan['actors'] if a['id']==actor)
 # An actor already revised to wide/corrective siblings retains its active queue
 # while another actor is bound. Never resurrect superseded v3 source recipes.
 prior=next((x for x in previous_brief['actors'] if x['actorId']==actor),None) if previous_brief else None
 revised=any(j['actorId']==actor and (j.get('enemyRecipeVersion',0)>3 or j.get('neutralSeeded')) for j in ledger['jobs']) or (previous_brief and actor not in selected)
 if revised:
  assert prior,'Revised active queue must already have a scoped brief'
  jobs=[next(j for j in ledger['jobs'] if j['id']==id) for id in prior['sourceJobs']]
 else:jobs=[j for j in ledger['jobs'] if j['actorId']==actor and j.get('enemyRecipeVersion')==3]
 assert sum(len(j['actions']) for j in jobs)==len(a['actions'])*8
 profiles.append({'actorId':actor,'name':a['name'],'group':a['group'],'master':{k:a[k] for k in ['file','canvas','pivot','nativeSha256','bodyNominalPx','alphaPolicy']},'role':PROFILES[actor]['role'],'equipmentNote':PROFILES[actor]['equipmentNote'],'actions':[{'id':action,'name':ROLE_ACTION_NAMES.get(actor,{}).get(action,ACTION_NAMES[action]),'phaseLabels':PHASE_NAMES[action],'sourcePoseBrief':sequence(actor,action),'draftDurationMs':durations(action),'holdLast':action in ['death','subdued'],'plannedDirections':8} for action in a['actions']],'targetBodyClips':len(a['actions'])*8,'sourceJobs':[j['id'] for j in jobs]})
actual=sum(c['actorId'] in IDS for c in read(R/'manifest.json')['clips'])
brief={'schema':'gdd-new-enemies-art-production-1','date':'2026-10-15','ownerPriority':'Monsters then bosses, before pending story/NPC motion','actors':profiles,'targetEnemyBodyClips':sum(a['targetBodyClips'] for a in profiles),'targetSourceJobs':sum(len(a['sourceJobs']) for a in profiles),'actualEnemyBodyClips':actual,'timingsAreReviewFixture':True,'artApprovalInferred':False,'runtimeIntegrated':False,'generationBlockedBy':'built-in ImageGen usage_limit_reached','currentNextJobs':[f'{actor}-eight-view-neutral-board' for actor in IDS]};write(out/'plan.json',brief)
p=read(R/'progress.json');p.update(targetBodyClips=plan['targetBodyClips'],priorityTargetClips=brief['targetEnemyBodyClips'],remainingBodyClips=plan['targetBodyClips']-p['packedBodyClips'],totalSourceJobs=len(ledger['jobs']),enemyPlan='enemy-production/plan.json');write(R/'progress.json',p)
print(json.dumps({'enemyClipsPlanned':brief['targetEnemyBodyClips'],'enemySourceJobs':brief['targetSourceJobs'],'globalClipTarget':plan['targetBodyClips'],'sourceQueueJobs':len(ledger['jobs']),'missingSameViewSourcesBlocked':sum(j.get('waitingForViewMaster',False) for j in ledger['jobs'])}))
