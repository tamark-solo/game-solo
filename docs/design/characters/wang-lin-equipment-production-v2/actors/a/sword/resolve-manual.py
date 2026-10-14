from pathlib import Path
import json,math
ROOT=Path(__file__).resolve().parent
lookup=json.loads((ROOT/'candidate-lookup.json').read_text(encoding='utf-8'))['frames']
selected=json.loads((ROOT/'manual-selections.json').read_text(encoding='utf-8'))
old=json.loads((ROOT/'manual.json').read_text(encoding='utf-8')) if (ROOT/'manual.json').exists() else {}
for direction,actions in selected.items():
 for action,ids in actions.items():
  for i,choice in enumerate(ids):
   key='sword-a-'+direction+'-'+action+':'+str(i+1)
   if key in old and 'sourceManual' in old[key]:continue
   if isinstance(choice,int):
    c=lookup[key][choice];native=c['native'];proof={'candidateIndex':choice,'candidateRect':c['rect'],'candidatePixels':c['pixels']}
   else:native=choice['native'];proof={'manualDirectPoint':True}
   seal=action=='cast-single-target' and i==2 or action=='cast-aoe' and i in (0,4)
   casting=action.startswith('cast-')
   visibility='seal' if seal else 'visible-palm';policy='detach-hover' if casting and i<len(ids)-1 else 'held-candidate'
   if action in ('meditate','gather'):policy='stow-hover'
   if action=='death':policy='drop-ground'
   if isinstance(choice,dict):visibility=choice.get('visibility',visibility);policy=choice.get('attachmentPolicy',policy)
   old[key]={'native':native,'visibility':visibility,'attachmentPolicy':policy,'angleDeg':0,'angleMeasurement':'same-view neutral wrist basis; action hover carries no held rotation; per-run visible wrist delta pending','occlusionRect':[max(0,math.floor(native[0])-2),max(0,math.floor(native[1])-2),5,5],'selectionProof':proof,'manualEvidence':'contact/'+key.rsplit(':',1)[0]+'-candidates.png','review':'Each index selected visually on its own per-pose candidate contact. Candidate colors only locate islands; selection distinguishes actual palms from face/ivory/gold islands.'}
   print(key,native,proof)
(ROOT/'manual.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
