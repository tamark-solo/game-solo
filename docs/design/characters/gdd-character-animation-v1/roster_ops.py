"""Append-only role-aware neutral boards and motion recipes for the GDD roster."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,statistics,shutil,sys,copy
from source_tools import components,rows_of,isolated_pose,boot_proposal,isolated_soft_pose

R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert not (R/'approval.json').exists()
ORDER=['north','northeast','east','southeast','south','southwest','west','northwest']
VIEWS={'north':'strict back, screen UP; no eyes or face','northeast':'rear three-quarter upper RIGHT; face hidden','east':'RIGHT profile; nose right, one eye','southeast':'front three-quarter lower RIGHT','south':'strict FRONT toward screen DOWN; two eyes and chest','southwest':'front three-quarter lower LEFT','west':'LEFT profile; nose left, one eye','northwest':'rear three-quarter upper LEFT; face hidden'}
DETAILS={
 'li-muwan-alchemist':'Young adult woman, LOW half-tied long dark hair with muted jade ribbon (no high ponytail), ivory/jade robe and small wearable herb pouch. Gentle precise alchemist.',
 'li-muwan-lifespan':'SAME Li Muwan woman in future lifespan state, LOW half-tied dark hair, subtle silver temple streaks and weary gaze, ivory/jade robe. No high ponytail or wholesale elderly redesign.',
 'situ-nan-spirit':'Mature male mentor, SHORT swept-back charcoal hair and gray temples, angular mature face, navy/ivory torn robe with small chest tear. Intrinsic spectral hem is semi-transparent; no boots, no high ponytail, no long hair, no smoke/aura.',
 'situ-nan-restored':'Mature male mentor, SHORT swept-back charcoal hair and gray temples, same mature face as own approved master. Solid navy/ivory robe and cloth boots, chest restored without tear. No high ponytail or long hair.',
 'luc-van':'Older moustached man with jade spectacles, low tied gray hair and wearable bamboo bundle. Slight natural stoop, distinct from young main. Preserve own layered cloth and small hands; no held book in neutral.',
 'a-ly':'Young woman with the exact approved braids, glove, wearable feed bag and small bronze bell. Preserve own earthy cloth colors; no attached beast or mount.',
 'mac-ba':'Older woman, low gray bun, restrained age lines, earth-red apron over linen. Preserve compact human proportions and own mature face; no high ponytail.',
 'tieu-nghien':'Young messenger, approved longer tied hair, earth-red scarf and wearable messenger bag. Preserve own silhouette rather than substituting main costume.',
 'sword-servant':'Broad squat cracked-stone sword-servant construct with its approved jagged stone face and body. Keep its own nonhuman anatomy and 72px body contract; EMPTY stone fists, broken sword is a separate prop. No wheels.',
 'yin-corpse-cultivator':'Gaunt short-dark-haired corpse cultivator with dead-jade body seals and own approved robe. Preserve human joints and corpse identity; no summoned corpse or coffin.',
 'blood-talisman-mage':'Stern blood-talisman cultivator in approved red textiles and high tied hair. Preserve own seals and face; no held talisman projectile or embedded FX.',
 'blood-armor-commander':'Massive broad armored formation-defender CONSTRUCT in blood-red and dark metal/stone, own 128px nonhuman build. Keep complete stone feet and armored fists, no wheels, rails or chariot device.',
 'dark-seal-true-body':'Mature gray-haired seal officer with approved crimson mantle and seal bands; preserve own stern older face, cloth anatomy and broad sleeve layering. No body-baked ring or fake-core aura.',
 'hua-lap-quoc':'Spectral villain with approved long tied hair and sly smirk, distinct from short-haired mentor. Preserve own 96px spectral build and intrinsic translucent fabric, no attached sword or soul mist FX.',
}
def snapshot(file,role):
 return {'file':file.relative_to(R).as_posix(),'sha256':sha(file),'original':file.relative_to(W).as_posix(),'originalSha256':sha(file),'role':role}
def proxy(original,target):
 im=Image.open(original).convert('RGBA');im.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in im.get_flattened_data()]);im.resize((im.width*8,im.height*8),Image.Resampling.NEAREST).save(target)
mode=sys.argv[1];plan=read(R/'production-plan.json');actors={a['id']:a for a in plan['actors']}
if mode=='prepare-boards':
 matrix=R/'inputs/wang-eight-view-camera-matrix.png'
 if not matrix.exists():
  out=Image.new('RGBA',(4*512,2*768));parts=[]
  for n,d in enumerate(ORDER):
   f=R/'inputs'/f'wang-{d}-clean.png';im=Image.open(f).convert('RGBA');out.paste(im,((n%4)*512,(n//4)*768));parts.append({'file':f.relative_to(W).as_posix(),'sha256':sha(f)})
  out.save(matrix);write(R/'inputs/wang-eight-view-camera-matrix-lineage.json',{'order':ORDER,'composedFrom':parts,'sha256':sha(matrix)})
 ledger=read(R/'view-masters/generation.json')
 for actor in sys.argv[2:]:
  a=actors[actor];id=actor+'-eight-view-neutral-board'
  if any(j['id']==id for j in ledger['jobs']):continue
  own=R/'inputs'/f'{actor}-clean.png';inputs=[snapshot(matrix,'Wang PRIMARY human anatomy/pixel, same-view camera matrix'),snapshot(own,'Own approved identity/clothing support')];inputs[0]['composedFrom']=read(R/'inputs/wang-eight-view-camera-matrix-lineage.json')['composedFrom']
  ghost=a['alphaPolicy']=='preserved-soft-RGBA'
  construct=a['rootKind']=='actual-stone-foot-soles'
  if construct or ghost:
   inputs[0]['role']='Wang camera/pixel support ONLY; nonhuman anatomy comes from OWN approved character'
   inputs[1]['role']='OWN approved nonhuman identity and proportions PRIMARY'
  authority=('Image1 supplies camera and pixel treatment ONLY. Image2 OWN approved character is PRIMARY nonhuman anatomy and identity; do not reshape into Wang.' if construct else 'Image1 supplies camera and pixel treatment ONLY for this spectral character; preserve own proportions and intrinsic translucent hem from Image2.' if ghost else 'Image1 Wang live is PRIMARY human anatomy, pixel clusters, shading and camera standard. Image2 supplies own identity/clothing, sex and age. Preserve own recognisable face/hair; do not transplant Wang face or outfit.')
  prompt=f'''Use case: identity-preserve / stylized-concept. Eight independently drawn directional standing neutrals of {a['name']}.
Inputs: Image1 Wang eight-view camera matrix, Image2 OWN approved character. {authority}
Exactly FOUR COLUMNS and TWO ROWS, eight complete separated full-body sprites. Match the corresponding camera in Image1.
ROW1 left to right: NORTH back / NORTHEAST rear-right / EAST right profile / SOUTHEAST front-right.
ROW2 left to right: SOUTH front / SOUTHWEST front-left / WEST left profile / NORTHWEST rear-left.
Every view is newly drawn; NEVER mirror a bitmap. Rear views show back of head/torso and anatomically occluded hands, no eyes or face. Profiles show only one eye and nose on correct side. All eight have exactly the same standing scale and skull size; no pose-based fitting.
Identity invariants: {DETAILS.get(actor,a['sourceAssessment'])}
Empty hands, relaxed neutral arms, complete silhouette and feet in every sprite. Body/outfit only. Crisp pixel-chibi stepped contours and limited shade bands at native {a['bodyNominalPx']}px body height. Truly transparent RGBA. Large transparent outer margins and gutters between all figures. No text, labels, cell lines, floor, shadow, weapon, floating object, magic or FX. {'Preserve intrinsic soft alpha in spectral fabric, no opaque background.' if ghost else 'Solid stone/armored feet exactly like OWN master; no cloth shoes or human feet.' if construct else 'Solid body and cloth boots.'}'''
  pp=R/'prompts'/f'{id}-r1.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8')
  ledger['jobs'].append({'id':id,'actorId':actor,'direction':'eight-view-board','directions':ORDER,'grid':[4,2],'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':inputs,'references':[str(R/i['file']) for i in inputs],'raw':f'view-masters/sources/{id}-r1.png','status':'planned','purpose':'independently drawn same-actor view masters before actions','alphaPolicy':a['alphaPolicy']})
 write(R/'view-masters/generation.json',ledger)
elif mode=='register-board':
 id,assessment=sys.argv[2:4];ledger=read(R/'view-masters/generation.json');j=next(j for j in ledger['jobs'] if j['id']==id);assert j['status']=='generated-awaiting-view-review';a=actors[j['actorId']]
 im=Image.open(R/j['raw']).convert('RGBA');regs=components(im);large=[p for p in regs if p['large']];rows=rows_of(large,2,im.height);assert len(rows)==2 and all(len(row)==4 for row in rows);ordered=[p for row in rows for p in row]
 assert all(p['box'][0]>0 and p['box'][1]>0 and p['box'][2]<im.width and p['box'][3]<im.height for p in ordered)
 factor=a['bodyNominalPx']/statistics.mean(p['box'][3]-p['box'][1] for p in ordered);registration=read(R/'view-masters/registration.json');ghost=a['alphaPolicy']=='preserved-soft-RGBA'
 for direction,region in zip(ORDER,ordered):
  assert not any(v['actorId']==a['id'] and v['direction']==direction for v in registration['records'])
  pose,box=isolated_soft_pose(im,region,regs) if ghost else isolated_pose(im,region,regs)
  if ghost:
   core=region['box'];root=[(core[0]+core[2])/2,core[3]+4/factor];support={'root':root,'confidence':'estimated spectral extent projection; no boots','nativeUncertaintyPx':3,'hoverNativePx':4};canvas,pivot=a['canvas'],a['pivot']
  else:
   support=boot_proposal(im,region['box']);root=support['root'];assert root[0] is not None;canvas,pivot=(a['canvas'],a['pivot']) if a['rootKind']=='actual-stone-foot-soles' else ([80,112],[40,104])
  size=[max(1,round(pose.width*factor)),max(1,round(pose.height*factor))];offset=[round(pivot[0]-(root[0]-box[0])*factor),round(pivot[1]-(root[1]-box[1])*factor)]
  assert min(offset)>=0 and offset[0]+size[0]<canvas[0] and offset[1]+size[1]<canvas[1],(direction,'needs padding',offset,size)
  native=Image.new('RGBA',tuple(canvas));native.paste(pose.resize(tuple(size),Image.Resampling.NEAREST),tuple(offset));f=R/'view-masters/native'/f'{a["id"]}-{direction}-neutral.png';assert not f.exists();native.save(f);p=R/'inputs'/f'{a["id"]}-{direction}-neutral-same-view8x.png';proxy(f,p)
  registration['records'].append({'id':a['id']+'-'+direction+'-neutral','actorId':a['id'],'direction':direction,'boardJob':id,'raw':j['raw'],'rawSha256':j['sha256'],'file':f.relative_to(R).as_posix(),'sha256':sha(f),'sourceScale':factor,'sourceRect':box,'sourceSupportProposal':support,'canvas':canvas,'pivot':pivot,'proxy':p.relative_to(R).as_posix(),'alphaPolicy':a['alphaPolicy'],'viewReviewedByModel':True,'viewAssessment':assessment,'ownerApproved':False})
 write(R/'view-masters/registration.json',registration);j.update(status='view-candidate-reviewed',viewAssessment=assessment);write(R/'view-masters/generation.json',ledger);print(json.dumps({'registered':a['id'],'realViews':8,'oneScale':factor}))
elif mode=='prepare-story-motion':
 ledger=read(R/'generation.json');reg=read(R/'view-masters/registration.json')
 for actor in sys.argv[2:]:
  a=actors[actor];ghost=a['alphaPolicy']=='preserved-soft-RGBA'
  for direction in plan['directions']:
   view=next(v for v in reg['records'] if v['actorId']==actor and v['direction']==direction)
   own=R/'inputs'/f'{actor}-clean.png';same=R/view['proxy'];wang=R/'inputs'/f'wang-{direction}-clean.png'
   inputs=[snapshot(same,'OWN same-view neutral PRIMARY camera/motion target'),snapshot(wang,'Wang same-view direct pixel/anatomy comparison'),snapshot(own,'OWN approved identity/clothing support')]
   inputs[0].update(original=(R/view['file']).relative_to(W).as_posix(),originalSha256=view['sha256'],nearestIntegerEnlargement=8)
   for n,i in enumerate(inputs,1):i['index']=n
   gesture='alchemy' if actor.startswith('li-muwan') else 'point'
   for suffix,actions in [('g1',['idle','talk',gesture]),('gait',['move'])]:
    id=f'{actor}-{direction}-{suffix}';old=next((j for j in ledger['jobs'] if j['id']==id),None)
    if old and old.get('roleRecipeVersion'):continue
    assert old is None or old['status']=='planned'
    if old:old.setdefault('history',[]).append(copy.deepcopy({k:v for k,v in old.items() if k!='history'}))
    sequences={
     'idle':'six subtle breathing keys: rest, inhale, soft blink, exhale, settle, rest; tiny cloth movement, stable skull and feet',
     'talk':'six conversational keys: listen, mouth opens, small near-hand emphasis at waist, gentle head nod, lower hand, close mouth/listen; no exaggerated arm swing',
     'point':'six mentor direction keys: rest, lift near forearm, indicate with compact attached fingers toward facing direction, hold indication, retract forearm, return to rest. No spell attack or FX',
     'alchemy':'six precise alchemy-hand keys: rest, bring both hands near waist, near hand makes a small pinching inspection above opposite cupped palm, careful turn of wrist, hands lower, rest. Hands EMPTY; vessel/herb/formation remain separate props; no projectile or fighting pose',
     'move':('six gliding keys with a restrained lean and intrinsic hem ripple through a full cycle, then matching wrap into first key. Float without boots or invented walking legs; no aura, detached wisp or trail' if ghost else 'six WALKING keys: left-foot contact, left support/right passing, right foot advancing, right-foot contact, right support/left passing, left foot advancing. Slow walking with alternating attached knees/ankles/boots and small reciprocal arms. No sprint or standing reset at last key')}
    rows='\n'.join(f'ROW{i+2}: {action}: {sequences[action]}.' for i,action in enumerate(actions))
    prompt=f'''Use case: identity-preserve. Pixel-chibi body animation of {a['name']}, ONE exact {direction} camera: {VIEWS[direction]} throughout all keys.
Image1 OWN independently generated same-view neutral is PRIMARY motion/camera target. Image2 live Wang same-view provides direct pixel/anatomy comparison only; retain own age, sex and face. Image3 OWN approved identity/outfit reference. {DETAILS[actor]}
Exactly SIX COLUMNS and {len(actions)+1} ROWS, {6*(len(actions)+1)} separated complete figures. ROW1: six identical standing neutral calibration copies matching Image1. ONE scale for entire source, nominal80 nativepx; never enlarge heads or fit individual poses.
{rows}
All actions keep requested side/rear/front camera, especially hand gestures. Rear views hide face and hands behind torso where occluded. Compact hands with short grouped fingers and thumb joined to wrist/cuff; no extra arms or spiky giant palms. {'Preserve intrinsic translucent spectral hem, no shoes or physical ground contact.' if ghost else 'Both physical boots stay attached below robe; keep natural foot contact and bent knees.'}
Truly transparent RGBA, outer empty margins and large clear gutters. All hair, hands, robe and feet must remain INSIDE image and separated from neighboring figures. Crisp stepped pixel clusters, limited shade bands. Body/outfit only: no shadow/floor, text, grid, weapon, cauldron, herb, smoke, aura, spell or FX.'''
    pp=R/'prompts'/f'{id}-role-r2.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8')
    data={'id':id,'actorId':actor,'name':a['name'],'group':a['group'],'direction':direction,'bodyNominalPx':a['bodyNominalPx'],'actions':actions,'grid':[6,len(actions)+1],'prompt':pp.relative_to(R).as_posix(),'promptSha256':sha(pp),'inputs':copy.deepcopy(inputs),'source':f'sources/{id}-role-r2.png','status':'planned','alphaPolicy':a['alphaPolicy'],'roleRecipeVersion':2,'artApproved':False,'motionApproved':False,'runtimeReady':False}
    if old:old.update(data)
    else:ledger['jobs'].append(data)
 write(R/'generation.json',ledger);print(json.dumps({'preparedActors':sys.argv[2:],'sourcesPerActor':16,'actionsPerActor':32,'keysPerClip':6}))
else:raise ValueError(mode)
