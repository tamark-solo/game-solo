from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
def write(n,d):(ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
reg=read('registration.json');lookup=read('candidate-lookup.json')['frames'];manual=read('manual.json');obs=read('manual-selections.json')
choices={
 'south':{'hit':[4,6,6,7,3,4],'death':[5,9,8,8,[100,108],5],'meditate':[11,7,5,9,8,8],'gather':[9,8,[48,100],1,5,5]},
 'southwest':{'hit':[3,4,4,3,4,3],'death':[12,7,12,9,8,7],'meditate':[5,5,5,5,5,6],'gather':[10,15,9,5,3,3]},
 'west':{'hit':[5,6,4,4,3,4],'death':[11,5,4,5,5,4],'meditate':[8,8,7,4,5,6],'gather':[8,13,13,7,7,6]},
 'northwest':{'hit':[1,1,3,1,2,1],'death':[2,3,3,4,1,[55,105]],'meditate':[2,3,3,1,1,1],'gather':[7,7,8,1,2,1]}
}
for c in reg['clips']:
 if c['direction'] not in choices or c['action'] not in choices[c['direction']]:continue
 for i,(f,choice) in enumerate(zip(c['frames'],choices[c['direction']][c['action']])):
  key=c['id']+':'+str(i+1);snap=lookup[key]
  assert snap['frameSha256']==f['sha256'],'Native observation changed: do not reinterpret old candidate points'
  native=choice if isinstance(choice,list) else snap['candidates'][choice]['native'];source=[round(snap['root'][k]+(native[k]-snap['pivot'][k])/snap['sourceScale'],6) for k in range(2)]
  hidden=c['direction']=='northwest' and c['action']=='death' and i==5
  held=c['action']=='hit';visibility='occluded' if hidden else 'visible-closed-fist' if held else 'resting-seal' if c['action']=='meditate' else 'grounded-palm' if c['action']=='death' else 'free-reaching-hand'
  policy='held-empty-pole-grip' if held else 'grounded-pole-no-held-claim' if c['action']=='death' else 'planted-pole-free-hands-no-held-claim'
  dx,dy=(3,-3) if c['action'] in ['meditate','death','gather'] else (3,4)
  cuff=[round(source[0]+dx/snap['sourceScale'],6),round(source[1]+dy/snap['sourceScale'],6)]
  raw=Image.open(V2/f['source']).convert('RGBA')
  manual[key]={'sourceManual':source,'sourcePalm':source,'sourceCuffEstimate':cuff,'cuffEstimate':True,'palmEstimated':hidden,'palmUncertaintyNativePx':5 if hidden else 2,'cuffUncertaintyNativePx':4 if hidden else 3,'sourceId':f['sourceId'],'sourceRect':f['sourceRect'],'sourcePalmReviewed':False,'sourcePalmRGBAAtObservation':list(raw.getpixel(tuple(map(round,source)))),'visibility':visibility,'attachmentPolicy':policy,'closedGripConfirmed':held,'heldGripClaim':held,'dominantGripClosed':held,'angleDeg':0,'angleMeasurement':'Projected cuff direction estimate with3px uncertainty; not an exact wrist/rig angle. Hidden hands are explicitly support projections and never held claims.','selection':'manual-native-point-selected-from-observed-source-and-contact','observationCanonicalSha256':f['sha256'],'manualEvidence':'actors/a/banner/contact/'+c['id']+'-manual-source-native.png','approved':False}
  obs[key]={'candidateIndex':choice if isinstance(choice,int) else None,'nativePointAtObservation':native,'sourceManual':source,'viewedWholeBodyContact':True,'sourcePalmEnlargementPending':True,'frameSha256':f['sha256']}
write('manual.json',manual);write('manual-selections.json',obs);print('Selected96 own foundation source hands; enlargement pending.')
