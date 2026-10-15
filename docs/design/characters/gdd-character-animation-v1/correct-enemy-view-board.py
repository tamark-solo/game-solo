"""Append an inspected visual correction, preserving the first paid source."""
from pathlib import Path
import copy,hashlib,json,sys
from PIL import Image
R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
actor,assessment=sys.argv[1:3];ledger=read(R/'view-masters/generation.json')
old=next(j for j in ledger['jobs'] if j['id']==actor+'-eight-view-neutral-board')
assert old['status']=='generated-awaiting-view-review' and assessment
id=old['id']+'-rear-r2';assert not any(j['id']==id for j in ledger['jobs'])
assert not any((R/'enemy-production/api-sources').rglob('*.imagegen.lock'))
raw=R/old['raw'];im=Image.open(raw).convert('RGBA')
im.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in im.get_flattened_data()])
clean=R/'inputs'/f'{old["id"]}-inspected-r1-clean.png';assert not clean.exists();im.save(clean)
inputs=copy.deepcopy(old['inputs'])
inputs.insert(1,{'file':clean.relative_to(R).as_posix(),'sha256':sha(clean),'original':raw.relative_to(W).as_posix(),'originalSha256':sha(raw),'role':'OWN inspected board identity/clothing; its NE/NW cameras must be corrected','transparentRgbNormalized':True})
for n,i in enumerate(inputs,1):i['index']=n
prompt=(R/old['prompt']).read_text(encoding='utf-8')
prompt=prompt.replace('Image2','Image3')
prompt+='\nImage2 is the inspected own board for same identity/clothing only, with known incorrect rear-diagonal face exposure. Correct camera from Image1 Wang exact corresponding slot. Image3 is own approved identity. Keep own hair, face, age, attire and anatomy; no head transplant.\n'
prompt+='CRITICAL BACK-CAMERA CORRECTION: TOP row slot2 NORTHEAST and BOTTOM row slot4 NORTHWEST show the BACK of head, neck, shoulders, cloak and belt. Entire face plane points away from viewer. ZERO visible eyes, nose, mouth, front collar V or chest seals. The near ear may show, never the front cheek or eye. Preserve diagonal foot orientation upper-right and upper-left respectively, not strict back copies. TOP slot1 NORTH strict back also hides all face. Do not expose face by rotating head toward camera. All eight are newly drawn unmirrored views, one common scale and consistent skull/body size. Maintain complete silhouettes and truly empty gutters.\n'
if actor=='hua-lap-quoc':
 prompt=prompt.replace('silhouette and feet in every sprite','silhouette and spectral hem in every sprite').replace('diagonal foot orientation','diagonal body orientation')
 prompt+='CRITICAL SPECTRAL ANATOMY: Image2 incorrectly invented solid cloth boots copied from Wang. REMOVE ALL boots, shoes, physical feet and walking legs in ALL eight views. Image3 OWN approved spirit is floating with a tapered ragged soft-alpha spectral hem and no shoes. Restore exactly that intrinsic spirit silhouette in each camera. Wang supplies camera/pixel treatment only, NEVER his legs or boots. Complete floating body remains visible; no empty final sprite, detached smoke or aura. Leave true transparent air below the intrinsic hem in every slot. Retain 96px own build and sly mature identity; preserve intrinsic partial alpha inside fabric, not just antialiased outside edges.\n'
pp=R/'prompts'/f'{id}.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8')
new=copy.deepcopy(old)
for k in ['original','sha256','size','apiMetadata','apiRequest','history','attempts']:new.pop(k,None)
new.update(id=id,inputs=inputs,references=[str(R/i['file']) for i in inputs],prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),raw=f'view-masters/sources/{id}.png',status='planned',correctiveOf=old['id'],correctionReason=assessment)
old.update(viewReviewedByModel=True,viewPackingAllowed=False,viewAssessment=assessment)
ledger['jobs'].append(new);write(R/'view-masters/generation.json',ledger)
print(json.dumps({'newJob':id,'priorRawPreserved':True,'paidRequestSent':False}))
