from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
reg=read('registration.json');lookup=read('foundation-root-candidate-lookup.json');roots=read('root-overrides.json')
choices={
 'south':{'hit':[[0,2],[0,1],[0,2],[0,2],[0,1],[0,1]],'gather':[[0,2],[0,2],[0,1],[0,2],[0,1],[0,1]]},
 'southwest':{'hit':[[0,2],[0,1],[0,1],67,[0,1],[0,1]],'gather':[53,67,61,52,[0,1],[0,1]]},
 'west':{'hit':[[0,2],[0,2],[0,1],[0,2],[0,1],[0,1]],'gather':[[0,2],65,[0,1],[0,1],[0,1],[0,1]]},
 'northwest':{'hit':[64,64,65,64,65,65],'gather':[64,[0,1],[1,2],[0,2],65,65]}
}
for c in reg['clips']:
 if c['direction'] not in choices or c['action'] not in choices[c['direction']]:continue
 for i,(f,choice) in enumerate(zip(c['frames'],choices[c['direction']][c['action']])):
  key=c['id']+':'+str(i+1);snap=lookup[key];assert snap['frameSha256']==f['sha256']
  proposals=snap['proposals'];selected=[proposals[j] for j in choice] if isinstance(choice,list) else []
  nx=sum(p['nativeX'] for p in selected)/len(selected) if selected else choice
  root=[round(f['root'][0]+(nx-f['pivot'][0])/f['sourceScale'],6),f['root'][1]];uncertainty=4 if not selected or c['action']=='gather' and i<4 else 3
  roots[key]={'root':root,'sourceRoot':root,'sourceRootReviewed':True,'manualReviewed':True,'manualReviewPending':False,'lift':0,'liftBakedOnce':True,'sourceSupportPlaneY':root[1],'observedBodyContactY':root[1],'uncertaintyNativePx':uncertainty,'exactBoneClaim':False,'worldFloorClaimed':False,'exactAnatomicalSoleClaimed':False,'method':'Own full source and all six native poses viewed. Support X from both actual dark boot footprints, or projected own lower-limb stance when one boot merges with pants or is occluded. Ignore ivory/red hem and hanging cuffs. Kneeling gather anchors lower-limb support projection to observed body-contact Y; not exact pelvis/sole/world floor.','footprintReferences':selected,'nativeSupportXAtObservation':nx,'sourceEvidence':'actors/a/banner/contact/foundation-root-map-'+c['direction']+'.png','sourceEvidenceFrameSha256':f['sha256']}
(ROOT/'root-overrides.json').write_text(json.dumps(roots,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('48 own hit/gather support roots manually reviewed.')
