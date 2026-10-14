from pathlib import Path
import json,hashlib,shutil
R=Path(__file__).resolve().parent;V=R.parents[2];S=V/'support/p5-next-family-briefs';B=V/'actors/a/banner'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert not (R/'generation.json').exists(),'Non-destructive preparation only'
plan=json.loads((S/'chariot/plan.json').read_text(encoding='utf-8'));records=[]
for directory in ['prompts','inputs/core','sources','tool','review']:(R/directory).mkdir(parents=True,exist_ok=True)
for item in plan['jobs']:
 if item['identityId']!='a':continue
 sid=item['id'].replace('-planned','-r1');text=(S/item['prompt']).read_text(encoding='utf-8');assert sha(S/item['prompt'])==item['promptSha256']
 if item['group']=='core':
  text+='''\nImage4 is same-identity Huyễn Tâm Banner same-direction camera/head support only. It must never transfer Banner robe, seal panels or pole into the Xạ Thần Xa body. Image1 own Huyễn Tâm Cart P1 remains PRIMARY for identity/body proportions/charcoal-bronze Cart outfit; Image3 supports the own outfit. Requested facing overrides any southeast angle in source refs. Redraw every cell for this true direction; no mirror. Keep transparent margins around crown, gauntlets and dark boots. The Cart is a separate world-ground device at caster +55 native; body uses empty command palms/seals and never grips a loop.'''
 prompt=R/'prompts'/f'{sid}.txt';prompt.write_text(text.rstrip()+'\n',encoding='utf-8')
 r={'id':sid,'identityId':'a','familyId':'chariot','direction':item['direction'],'group':item['group'],'actions':item['actions'],'calibrationCells':6,'prompt':str(prompt.relative_to(V)).replace('\\','/'),'promptSha256':sha(prompt),'raw':f'actors/a/chariot/sources/{sid}.png','inputs':[],'inputSnapshotsReady':False,'dependency':None if item['group']=='core' else f'chariot-a-{item["direction"]}-core-r1 actual reviewed own Cart neutral','tool':'built-in-imagegen','transparentRequested':True,'requestedGrid':item['requestedGrid'],'requestedSourcePoses':item['requestedSourcePoses'],'status':'prepared-awaiting-Banner128-technical-gate' if item['group']=='core' else 'prepared-awaiting-own-reviewed-same-view-Cart-neutral','selected':False,'ownerApproved':False,'runtimeIntegrated':False,'preparedPromptBasis':str((S/item['prompt']).relative_to(V)).replace('\\','/'),'preparedPromptBasisSha256':item['promptSha256']}
 if item['group']=='core':
  for i,old in enumerate(item['inputs'],1):
   source=S/old['file'];assert sha(source)==old['sha256'];dst=R/'inputs/core'/sid/f'{i}.png';dst.parent.mkdir(parents=True,exist_ok=True)
   if dst.exists(): assert sha(dst)==old['sha256']
   else: shutil.copy2(source,dst)
   r['inputs'].append({**old,'file':str(dst.relative_to(V)).replace('\\','/'),'original':str(source),'role':['own-approved-A-chariot-P1-PRIMARY','Wang-same-view-camera-anatomy-pixel-support-only','own-approved-A-chariot-P1-full-source-costume-support'][i-1]})
  source=B/'inputs/measured-neutral'/f'banner-a-{item["direction"]}-core-r1-native-nearest8x.png';assert source.exists();dst=R/'inputs/core'/sid/'4.png'
  if dst.exists(): assert sha(dst)==sha(source)
  else: shutil.copy2(source,dst)
  r['inputs'].append({'file':str(dst.relative_to(V)).replace('\\','/'),'sha256':sha(dst),'original':str(source),'role':'own-same-identity-A-same-view-hair-face-camera-support-only-NOT-Banner-outfit','index':4});r['inputSnapshotsReady']=True
 records.append(r)
data={'schema':'equipment-body-generation-v2','identityId':'a','familyId':'chariot','date':'2026-10-14','generationAllowed':False,'requiredGate':'Explicit root release after Banner128 technical gate; preparation is not generation dispatch.','records':records,'forecast':{'sources':24,'clips':64,'motionKeysAtSix':384,'neutralCalibrationsAtSix':144},'actualCoverage':{'generatedSources':0,'clips':0,'motionKeys':0},'ownerApproved':False,'runtimeIntegrated':False,'choreographyPolicy':'Body commands separate world-ground Cart at caster+[55,0] through empty open/seal palms. No physical hand grip, no baked device/chain/beast/FX. Every source actual hands/cuffs/support roots reviewed; one source factor.'}
(R/'generation.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'review/preparation-verification.json').write_text(json.dumps({'status':'passed','jobs':len(records),'coreReadyTripletsPlusOwnViewSupport':8,'actualGeneration':0,'generationAllowed':False,'generationSha256':sha(R/'generation.json'),'ownerApproved':False},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'jobs':len(records),'readyCoreInputs':sum(r['inputSnapshotsReady'] for r in records),'generationAllowed':False,'generationSha256':sha(R/'generation.json')}))
