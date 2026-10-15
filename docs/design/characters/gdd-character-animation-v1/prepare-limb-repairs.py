"""Create independently reviewed gait corrections without replacing source bytes."""
from pathlib import Path
from PIL import Image
import hashlib, json
R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=read(R/'generation.json');manifest=read(R/'manifest.json')
views=read(R/'view-masters/registration.json')['records']
plan=read(R/'production-plan.json')
targets=[('tich-bach-entry','north'),('huyen-tam-entry','northwest'),('tich-bach-domain','north'),('huyen-tam-domain','west')]
camera={'north':'strict BACK view, no eyes/nose/front chest, runs away from camera screen UP','northwest':'REAR three-quarter upper LEFT view, face hidden, runs screen upper LEFT','west':'strict LEFT PROFILE, one visible eye, nose left, runs screen LEFT'}
for actor,direction in targets:
 id=f'{actor}-{direction}-run-limbs-r1'
 if any(j['id']==id for j in ledger['jobs']):continue
 own=next((v for v in views if v['actorId']==actor and v['direction']==direction),None)
 original=R/own['file'] if own else R/next(c for c in manifest['clips'] if c['actorId']==actor and c['direction']==direction and c['action']=='idle')['frames'][0]['file']
 proxy=R/'inputs'/f'{id}-own-neutral8x.png'
 im=Image.open(original).convert('RGBA');im.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in im.get_flattened_data()]);im.resize((im.width*8,im.height*8),Image.Resampling.NEAREST).save(proxy)
 wang=R/'inputs'/f'wang-{direction}-clean.png'
 approved=R/'inputs'/f'{actor}-clean.png'
 inputs=[]
 for n,(p,origin,role) in enumerate([(proxy,original,'own same-view neutral PRIMARY identity and camera'),(wang,W/'docs/design/characters/van-hai-npc-visual-standard-v1/inputs'/f'wang-lin-live-{direction}-nearest8x.png','same-view pixel/camera support ONLY'),(approved,W/'docs/design/characters/gdd-character-concepts-v1/native'/f'{actor}.png','own approved identity/outfit proportions')],1):
  inputs.append({'index':n,'file':p.relative_to(R).as_posix(),'sha256':sha(p),'original':origin.relative_to(W).as_posix(),'originalSha256':sha(origin),'role':role,'nearestIntegerEnlargement':1 if n==2 else 8,'transparentRgbNormalized':True})
 name=next(a for a in plan['actors'] if a['id']==actor)['name']
 prompt=f'''Use case: identity-preserve. Production repair of the running arms and legs for {name}. Generate a new sprite sheet, not a concept board.
Image1 OWN same-view neutral is PRIMARY identity, camera and proportions. Image2 Wang is pixel/camera support ONLY. Image3 OWN approved outfit/identity. Preserve exact own hair, face, slim build and small head; do not adopt Wang build.
Camera locked: {camera[direction]} in EVERY pose. Independent drawing, never mirrored sprite.
Exactly THREE COLUMNS by THREE ROWS, NINE complete figures. Truly transparent RGBA. Generous empty gutters and outer margins, no text, labels, grid, floor, shadow, FX, weapons or props. ONE fixed body scale throughout. Row1 has THREE identical standing neutral calibration figures matching Image1. Nominal standing body80 native pixels after one common resize.
Rows2 and3 form ONE full six-key running stride. Row2 is LEFT-leg stance half; row3 is RIGHT-leg stance half. Row3 MUST visibly exchange the roles of both legs and both arms, not repeat row2 with hair changes.
Row2 column1: LEFT foot forward contacts ground, right leg trails bent; RIGHT arm forward, left arm back.
Row2 column2: LEFT planted boot under hip, left knee compresses, RIGHT knee swings forward; opposite arm swing halfway.
Row2 column3: LEFT leg pushes back/off, RIGHT knee forward/up, short flight; RIGHT arm goes back, LEFT arm comes forward.
Row3 column1: RIGHT foot forward contacts ground, LEFT leg trails bent; LEFT arm forward, right arm back. Opposite of row2 column1.
Row3 column2: RIGHT planted boot under hip, right knee compresses, LEFT knee swings forward; opposite arm swing halfway.
Row3 column3: RIGHT leg pushes back/off, LEFT knee forward/up, short flight; LEFT arm goes back, RIGHT arm comes forward. Leads smoothly into row2 column1.
Both anatomical legs remain attached at the hips and each knee/ankle is credible. Show two distinct boots in contact/flight silhouette where camera permits; do not hide the entire far-leg cycle under robe or hair. Slightly separate boots in rear view to make left/right support readable without widening the approved body. Short garment hem may sway but never grow or remove a leg. Exactly two attached arms, small closed fists continuously attached to cuffs, no extra fingers/hands. Feet point consistently along running direction, not backwards. Keep camera fixed through all phases; no idle/standing figures in rows2+3. Each action row shares its own level ground baseline, short natural lift only in column3. Crisp stepped pixel clusters, limited shade bands, no smooth illustration.'''
 pp=R/'prompts'/f'{id}.txt';pp.write_text(prompt,encoding='utf-8')
 ledger['jobs'].append({'id':id,'actorId':actor,'name':name,'group':'main-future' if actor.endswith('domain') else 'main','direction':direction,'bodyNominalPx':80,'actions':['run'],'grid':[3,3],'layoutType':'paired-run-3x3','calibrationPoses':3,'activeActionIndexes':[0,1,2,3,4,5],'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':inputs,'source':f'sources/{id}.png','status':'planned','corrective':True,'repairReason':'limb audit: support leg and contralateral arm alternation must be readable','artApproved':False,'motionApproved':False,'runtimeReady':False})
(R/'generation.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'prepared':[f'{a}-{d}-run-limbs-r1' for a,d in targets]}))
