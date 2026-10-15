"""Scoped, resumable ImageGen queue operations. Does not write live assets."""
from pathlib import Path
from PIL import Image
import copy, hashlib, json, shutil, sys
from source_tools import components, isolated_pose, boot_proposal

R = Path(__file__).resolve().parent
W = R.parents[3]
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
write = lambda p,d: p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert not (R/'approval.json').exists(), 'Approved package is read-only'
VIEWS = {
 'southeast':'front three-quarter facing lower RIGHT',
 'south':'strict FRONT, facing screen DOWN, two eyes and front chest',
 'southwest':'front three-quarter facing lower LEFT, nose left and trailing hair right',
 'west':'strict LEFT PROFILE, nose left, only one eye, side torso',
 'northwest':'REAR three-quarter facing upper LEFT, back of head and torso, face hidden',
 'north':'strict REAR, facing screen UP, back of head and torso, no face or eyes',
 'northeast':'REAR three-quarter facing upper RIGHT, back of head and torso, face hidden',
 'east':'strict RIGHT PROFILE, nose right, only one eye, side torso',
}

def clean_enlarge(original,target,factor=8):
 im=Image.open(original).convert('RGBA')
 im.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in im.get_flattened_data()])
 im.resize((im.width*factor,im.height*factor),Image.Resampling.NEAREST).save(target)

def own_input(actor):
 p=R/'inputs'/f'{actor}-clean.png'
 original=R.parent/'gdd-character-concepts-v1'/'native'/f'{actor}.png'
 if not p.exists():clean_enlarge(original,p)
 return {'file':p.relative_to(R).as_posix(),'sha256':sha(p),'original':original.relative_to(W).as_posix(),'originalSha256':sha(original),'role':'own-approved-identity/outfit PRIMARY proportions','nearestIntegerEnlargement':8,'transparentRgbNormalized':True}

def wang_input(direction):
 p=R/'inputs'/f'wang-{direction}-clean.png'
 original=R.parent/'van-hai-npc-visual-standard-v1'/'inputs'/f'wang-lin-live-{direction}-nearest8x.png'
 if not p.exists():clean_enlarge(original,p,1)
 return {'file':p.relative_to(R).as_posix(),'sha256':sha(p),'original':original.relative_to(W).as_posix(),'originalSha256':sha(original),'role':'Wang same-view camera/pixel support only','nearestIntegerEnlargement':1,'transparentRgbNormalized':True}

def candidate_input(actor,direction):
 reg=read(R/'view-masters/registration.json')
 record=next((v for v in reg['records'] if v['actorId']==actor and v['direction']==direction),None)
 if record:
  original=R/record['file'];p=R/record['proxy']
 else:
  m=read(R/'manifest.json');c=next(c for c in m['clips'] if c['actorId']==actor and c['direction']==direction and c['action']=='idle')
  original=R/c['frames'][0]['file'];p=R/'inputs'/f'{actor}-{direction}-idle-same-view8x.png'
  if not p.exists():clean_enlarge(original,p)
 return {'file':p.relative_to(R).as_posix(),'sha256':sha(p),'original':original.relative_to(W).as_posix(),'originalSha256':sha(original),'role':'own same-view neutral candidate PRIMARY camera/motion','nearestIntegerEnlargement':8,'transparentRgbNormalized':True}

mode=sys.argv[1]
if mode=='prepare-view':
 ledger=read(R/'view-masters/generation.json')
 for actor,direction in zip(sys.argv[2::2],sys.argv[3::2]):
  id=f'{actor}-{direction}-neutral'
  if any(j['id']==id for j in ledger['jobs']):continue
  inputs=[wang_input(direction),own_input(actor)]
  for n,i in enumerate(inputs,1):i['index']=n
  prompt=f'''Use case: identity-preserve / stylized-concept. ONE complete full-body pixel-chibi neutral sprite, not a sheet.
Image1: Wang live SAME requested {direction} camera ONLY. Image2: approved OWN {actor}, PRIMARY identity, clothing, hair, skull and slim body proportions. Transfer camera orientation only from Image1 into Image2, never Wang face/build/clothes. Preserve own approved smaller head and slim silhouette.
Requested camera: {VIEWS[direction]}. Copy the exact camera of Image1, independently draw the OWN actor in this view; never mirror a bitmap. Do not revert to the original southeast view of Image2. Keep own clothing details and anatomical occlusion from the requested side/rear.
Empty hands, all hair, attached outfit details and both boots fully visible. Crisp stepped pixel contours and limited shade bands, no 3D or smooth illustration. One standing neutral, nominal80nativepx after one resize. Truly transparent RGBA, large empty margins on all edges, no words, background, floor, shadow, weapons, magic or FX.'''
  pp=R/'prompts'/f'{id}-r1.txt';pp.write_text(prompt,encoding='utf-8')
  ledger['jobs'].append({'id':id,'actorId':actor,'direction':direction,'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':inputs,'references':[str(R/i['file']) for i in inputs],'raw':f'view-masters/sources/{id}-r1.png','status':'planned','purpose':'own independently generated view before action sources'})
 write(R/'view-masters/generation.json',ledger)
elif mode=='record-view':
 id,original=sys.argv[2:4];ledger=read(R/'view-masters/generation.json');job=next(j for j in ledger['jobs'] if j['id']==id)
 assert job['status']=='planned';target=R/job['raw'];assert not target.exists();original=Path(original).resolve()
 assert sha(R/job['prompt'])==job['promptSha256']
 for i in job['inputs']:assert sha(R/i['file'])==i['sha256']
 assert Image.open(original).mode=='RGBA';shutil.copyfile(original,target)
 job.update(original=str(original),sha256=sha(target),size=list(Image.open(target).size),status='generated-awaiting-view-review')
 write(R/'view-masters/generation.json',ledger);print(json.dumps({'id':id,'file':job['raw']}))
elif mode=='register-view':
 id=sys.argv[2];assessment=sys.argv[3];ledger=read(R/'view-masters/generation.json');job=next(j for j in ledger['jobs'] if j['id']==id)
 assert job['status']=='generated-awaiting-view-review'
 image=Image.open(R/job['raw']).convert('RGBA');regions=components(image);large=[p for p in regions if p['large']];assert len(large)==1,'Expected one complete body'
 pose,box=isolated_pose(image,large[0],regions);support=boot_proposal(image,box);assert support['root'][0] is not None
 factor=80/(box[3]-box[1]);size=(max(1,round(pose.width*factor)),max(1,round(pose.height*factor)))
 scaled=pose.resize(size,Image.Resampling.NEAREST);offset=[round(32-(support['root'][0]-box[0])*factor),round(88-(support['root'][1]-box[1])*factor)]
 assert min(offset)>=0 and offset[0]+size[0]<=64 and offset[1]+size[1]<=96,'View needs honest padding contract'
 native=Image.new('RGBA',(64,96));native.paste(scaled,tuple(offset));p=R/'view-masters/native'/f"{job['actorId']}-{job['direction']}-neutral.png";assert not p.exists();native.save(p)
 proxy=R/'inputs'/f"{job['actorId']}-{job['direction']}-neutral-same-view8x.png";clean_enlarge(p,proxy)
 record={'id':id,'actorId':job['actorId'],'direction':job['direction'],'raw':job['raw'],'rawSha256':job['sha256'],'file':p.relative_to(R).as_posix(),'sha256':sha(p),'sourceScale':factor,'sourceRect':box,'sourceSupportProposal':support,'canvas':[64,96],'pivot':[32,88],'proxy':proxy.relative_to(R).as_posix(),'viewReviewedByModel':True,'viewAssessment':assessment,'ownerApproved':False}
 registration=read(R/'view-masters/registration.json');registration['records'].append(record);write(R/'view-masters/registration.json',registration)
 job.update(status='view-candidate-reviewed',native=record['file']);write(R/'view-masters/generation.json',ledger)
elif mode=='use-view':
 actor,direction=sys.argv[2:4];ledger=read(R/'generation.json')
 inputs=[candidate_input(actor,direction),wang_input(direction),own_input(actor)]
 for n,i in enumerate(inputs,1):i['index']=n
 for job in ledger['jobs']:
  if job['actorId']!=actor or job['direction']!=direction or job['status']!='planned':continue
  text=(R/job['prompt']).read_text(encoding='utf-8')
  text+='\nFINAL reference authority: Image1 OWN newly generated SAME VIEW neutral is the primary camera/motion target. Image2 Wang same-view supports pixel/camera only. Image3 approved OWN identity/outfit/proportions. Exact '+VIEWS[direction]+' throughout ALL rows, including run, low poses and hand seal. Never adopt Wang head size or revert to original SE. Preserve all physical boots and hair with ample transparent gutters.\n'
  pp=R/'prompts'/f"{job['id']}-same-view-r1.txt";assert not pp.exists();pp.write_text(text,encoding='utf-8');job.update(prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),inputs=copy.deepcopy(inputs))
 write(R/'generation.json',ledger)
elif mode in ['correction','standalone']:
 actor,direction,action=sys.argv[2:5];ledger=read(R/'generation.json');suffix='fix1' if mode=='correction' else 'wide';id=f'{actor}-{direction}-{action}-{suffix}';assert not any(j['id']==id for j in ledger['jobs'])
 actor_record=next(a for a in read(R/'production-plan.json')['actors'] if a['id']==actor)
 inputs=[candidate_input(actor,direction),wang_input(direction),own_input(actor)]
 for n,i in enumerate(inputs,1):i['index']=n
 sequence={
 'hit':'Ready / small recoil / strongest torso recoil / rebound / settle / ready / quiet standing / final ready hold. Boots remain credible, bent knees recover naturally, no fall or FX.',
 'run':'Left foot contact / compression / flight / right foot contact / compression / flight / next left foot contact / next compression. Opposite arm and leg swings, bent knees and actual alternating support, robe/hair lag. NEVER standing poses in this action group. Keep own head size constant; flight is a small natural lift, not stretching the body.',
 'death':'Struck standing / knees buckle / kneel with hand bracing / near-side fall / body completely lying on ground / final settled corpse / grounded corpse quiet / last corpse hold. After key4 NEVER rise again. Fully complete hair/body/boots; prone shows the requested view with credible near side, not a front portrait.',
 'cast-single-target':'Ready / draw hands inward / compact seal charge / one palm fully extends in facing direction / recoil / lower hands / recover fully standing / final standing neutral hold. All boots fully visible below robes; return to same ready proportions.',
 'gather':'Ready / knees bend / reach low / grasp empty hand / rise / stand / standing recover / final ready hold. No gathered object.'
 }[action]
 prompt=f'''Use case: identity-preserve. {actor_record['name']} standalone {action} body animation, exact {VIEWS[direction]} camera throughout all keys.
Image1 OWN same-view neutral/motion candidate PRIMARY target for camera and character. Image2 Wang same-view pixel camera support ONLY. Image3 OWN approved identity/clothing/proportions authority. Keep own small slim skull, outfit, hair, never Wang face/build. Independently drawn motion, no mirrored view.
Exactly FOUR COLUMNS by FOUR ROWS, 16 complete isolated figures, truly transparent RGBA. Outer transparent margin at least64px on every edge, empty gutters64px between figures; allow width for complete prone bodies. No text/grid/background/shadows/FX/held weapon. All poses kept well within the image, last row ground at least64px above bottom.
ROWS1+2: eight identical standing neutral calibration copies matching Image1. ONE scale for whole source, body80nativepx after common resize. No per-pose sizing.
ROWS3+4: eight ordered {action} keys in reading order: {sequence}
Body/outfit only, crisp stepped pixel clusters matching own master. No magic light/trails or separate shadows. Natural lowered height, no head enlargement. Exact facing and occlusion through all eight action poses.'''
 pp=R/'prompts'/f'{id}-r1.txt';pp.write_text(prompt,encoding='utf-8')
 ledger['jobs'].append({'id':id,'actorId':actor,'name':actor_record['name'],'group':actor_record['group'],'direction':direction,'bodyNominalPx':80,'actions':[action],'grid':[4,4],'calibrationPoses':8,'activeActionIndexes':[0,1,2,3,4,5],'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':inputs,'source':f'sources/{id}-r1.png','status':'planned','corrective':mode=='correction','layoutSpecialization':mode=='standalone','artApproved':False,'motionApproved':False,'runtimeReady':False})
 write(R/'generation.json',ledger)
elif mode=='payload':
 ledger=read(R/('view-masters/generation.json' if sys.argv[2]=='view' else 'generation.json'))
 ids=sys.argv[3:];jobs=[next(j for j in ledger['jobs'] if j['id']==id) for id in ids]
 assert all(j['status']=='planned' and not j.get('supersededPlanned') for j in jobs),'Do not dispatch a superseded planned correction'
 assert not any(j.get('waitingForViewMaster') for j in jobs),'Bind an inspected own same-view master before dispatch; SE fallback is forbidden'
 print(json.dumps([{'id':j['id'],'prompt':(R/j['prompt']).read_text(encoding='utf-8'),'references':j.get('references',[str(R/i['file']) for i in j['inputs']])} for j in jobs],ensure_ascii=True))
else:raise ValueError(mode)
