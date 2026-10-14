from pathlib import Path
from PIL import Image
import json,math
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8')) if (ROOT/n).exists() else {}
def write(n,d):(ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
reg=read('registration.json');lookup=read('candidate-lookup.json')['frames'];manual=read('manual.json');roots=read('root-overrides.json');rlookup=read('root-candidate-lookup.json');observations=read('manual-selections.json')
choices={
 'south':{'idle':[3,3,3,4,3,5],'run':[4,4,4,10,6],'cast-single-target':[3,7,3,3,4,13],'cast-aoe':[8,[57,64],0,2,3,11]},
 'southwest':{'idle':[3,3,3,2,3,3],'run':[4,4,3,7,3,3],'cast-single-target':[3,5,5,3,6,4],'cast-aoe':[3,3,[48,67],0,1,4]},
 'west':{'idle':[4,5,4,4,3,4],'run':[6,4,4,3,3,5],'cast-single-target':[3,5,3,5,3,4],'cast-aoe':[4,4,0,3,1,4]},
 'northwest':{'idle':[3,2,3,2,3,3],'run':[2,3,2,3,3],'cast-single-target':[2,1,2,2,1,1],'cast-aoe':[1,0,1,2,1,3]}
}
for c in reg['clips']:
 if c['direction'] not in choices or c['action'] not in choices[c['direction']]:continue
 seq=choices[c['direction']][c['action']];assert len(seq)==len(c['frames'])
 for i,(f,choice) in enumerate(zip(c['frames'],seq)):
  key=c['id']+':'+str(i+1);native=choice if isinstance(choice,list) else lookup[key]['candidates'][choice]['native'];source=[round(f['root'][k]+(native[k]-f['pivot'][k])/f['sourceScale'],6) for k in range(2)];raw=Image.open(V2/f['source']).convert('RGBA');rgba=raw.getpixel(tuple(map(round,source)))
  # Every selected point is an actual observed palm region. Source proof remains
  # pending until the enlargement is viewed; no classifier automatically approves.
  held=c['action'] in ['idle','run'] or i==0;visibility='visible-closed-fist' if held else 'seal' if i in [1,2] else 'open-command' if i in [3,4] else 'free-ritual-recovery';policy='held-empty-pole-grip' if held else 'planted-pole-command-no-held-claim'
  dx,dy=(3,4) if c['direction'] in ['southwest','west'] else (0,4) if c['direction']=='northwest' else (-2,4)
  if not held:dx,dy=(3,3) if c['direction'] in ['southwest','west','northwest'] else (-3,3)
  cuff=[round(source[0]+dx/f['sourceScale'],6),round(source[1]+dy/f['sourceScale'],6)]
  manual[key]={'sourceManual':source,'sourcePalm':source,'sourceCuffEstimate':cuff,'cuffEstimate':True,'palmUncertaintyNativePx':1.5,'cuffUncertaintyNativePx':3,'sourceId':f['sourceId'],'sourceRect':f['sourceRect'],'sourcePalmReviewed':False,'sourcePalmRGBAAtObservation':list(rgba),'visibility':visibility,'attachmentPolicy':policy,'closedGripConfirmed':held,'heldGripClaim':held,'dominantGripClosed':held,'angleDeg':0,'angleMeasurement':'Upright pole uses source palm only; cuff is a visual projected direction estimate with3px native uncertainty, not an exact wrist or rig angle.','selection':'manual-native-point-selected-from-observed-source-and-contact','observationCanonicalSha256':f['sha256'],'manualEvidence':'actors/a/banner/contact/'+c['id']+'-manual-source-native.png','approved':False}
  observations[key]={'candidateIndex':choice if isinstance(choice,int) else None,'nativePointAtObservation':native,'sourceManual':source,'viewedWholeBodyContact':True,'sourcePalmEnlargementPending':True,'frameSha256':f['sha256']}
  # Confirm actual dark boot footprints on the visual map, not ruby robe tails.
  candidates=rlookup[key]['proposals'];eligible=[p for p in candidates if p['pixels']>=45 and p['nativeYBottom']>=f['bounds'][3]-3]
  if c['action']=='run':eligible=[p for p in candidates if p['pixels']>=45]
  if eligible:
   nx=sum(p['nativeX'] for p in eligible)/len(eligible);root=[round(f['root'][0]+(nx-f['pivot'][0])/f['sourceScale'],6),f['root'][1]]
  else:root=f['root'];nx=f['pivot'][0]
  uncertainty=3 if c['action']=='run' else 2.5
  roots[key]={'root':root,'sourceRoot':root,'sourceRootReviewed':True,'lift':0,'sourceSupportPlaneY':f['root'][1],'observedContactPlaneY':f['root'][1],'uncertaintyNativePx':uncertainty,'exactBoneClaim':False,'liftBakedOnce':True,'method':'Native2x actual dark boots/visible footprint and original full source viewed. Dark lower-body proposals inspected and ruby tails ignored; combined boots may form one connected pants/sole envelope. Raised/occluded boot uses support projection, not exact pelvis bone.','footprintReferences':eligible,'sourceEvidence':'actors/a/banner/contact/root-map-'+c['direction']+'.png','sourceEvidenceFrameSha256':f['sha256']}
write('manual.json',manual);write('root-overrides.json',roots);write('manual-selections.json',observations);print('Selected94 observed core palms; source enlargement review pending, no manual-complete claim.')
