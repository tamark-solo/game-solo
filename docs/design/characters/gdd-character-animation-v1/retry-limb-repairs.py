"""Target only visually rejected gait corrections; keep their source and prompts."""
from pathlib import Path
import json,hashlib,copy
R=Path(__file__).resolve().parent;W=R.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=json.loads((R/'generation.json').read_text(encoding='utf-8'))
for actor,direction,reason in [('huyen-tam-entry','northwest','Near white sleeve/fist stays forward in both half strides; exchange near/far arm depth in the bottom row.'),('tich-bach-domain','north','Bottom row mirrors the hair and jade cloth to the other side. This is invalid. Keep original hair and jade drape on the same screen side throughout.'),('huyen-tam-domain','west','Near arm and leg look too similar in both halves; clearly bend the near knee forward and send the near arm back in bottom-left contact.')]:
 old=next(j for j in ledger['jobs'] if j['id']==f'{actor}-{direction}-run-limbs-r1');old.update(sourceViewed=True,sourcePackingAllowed=False,sourceAssessment=reason,status='rejected-limb-repair-candidate')
 id=f'{actor}-{direction}-run-limbs-r2'
 if any(j['id']==id for j in ledger['jobs']):continue
 inputs=[{'index':1,'file':old['source'],'sha256':old['sourceSha256'],'original':(R/old['source']).relative_to(W).as_posix(),'originalSha256':old['sourceSha256'],'role':'edit target: rejected gait sheet; change action limbs, preserve own identity'},copy.deepcopy(old['inputs'][0]),copy.deepcopy(old['inputs'][2])]
 for n,i in enumerate(inputs,1):i['index']=n
 prompt=f'''Use case: identity-preserve / precise-object-edit. Edit the existing sprite sheet Image1 to repair limb animation. Image2 OWN same-view neutral is primary identity and fixed camera. Image3 own approved outfit supports proportions. Preserve own body size, hair, clothes, identity and all garment asymmetry. No re-costuming or mirroring.
Reason to correct: {reason}
Keep layout THREE columns by THREE rows. Row1 three neutral calibrations; rows2+3 six running phases. Truly transparent RGBA, generous empty gutters and outer margin. No background, floor, shadows, words, FX or props. ONE source scale. All limbs complete, small fists attached to wrist cuffs, exactly two arms and two anatomical legs, readable boot/knee chains.
Critical correction: row2 and row3 are OPPOSITE support halves, not repeated poses. Draw a continuous run: row2 left foot contact, left compression, left push-off/right knee passing; row3 right foot contact, right compression, right push-off/left knee passing. Near/far leg overlaps visibly exchange. Row2 column1 and row3 column1 cannot have identical leg/arm silhouette. Boots always point in facing direction. Do not flip the torso/hair/costume when changing legs.
Arm correction: if the near arm is forward in row2 contact, near arm must be BACK with fist behind waist in row3 contact, showing the other forearm forward across the torso. Swing arms against the legs through compression and passing. Do not leave the same visible white sleeve forward in both halves. Shoulder is attached, bent elbow is inside sleeve; fists are small and cannot detach or merge into hair.
Camera for {direction}: {'strict back, no face/eyes; back hair silhouette stays the same and jade drape stays on screen RIGHT' if direction=='north' else 'rear three-quarter upper LEFT, never front/profile' if direction=='northwest' else 'strict LEFT profile, one eye, nose left; near arm/near knee are in front of torso occlusion'} throughout all nine poses. The fixed camera does NOT alternate with leg choice. Do not mirror any full figure. Retain the compact crisp pixel-chibi art with limited shade bands.'''
 pp=R/'prompts'/f'{id}.txt';pp.write_text(prompt,encoding='utf-8')
 new=copy.deepcopy(old)
 for key in ['originalOutput','sourceSha256','size','sourceViewed','sourcePackingAllowed','sourceAssessment','sourceRowFailures']:
  new.pop(key,None)
 new.update(id=id,prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),inputs=inputs,source=f'sources/{id}.png',status='planned',correctsSource=old['id'])
 ledger['jobs'].append(new)
(R/'generation.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'planned':[f'{a}-{d}-run-limbs-r2' for a,d in [('huyen-tam-entry','northwest'),('tich-bach-domain','north'),('huyen-tam-domain','west')]]}))
