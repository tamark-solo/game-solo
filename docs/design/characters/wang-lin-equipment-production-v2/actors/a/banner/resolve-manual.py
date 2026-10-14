from pathlib import Path
import json,math
ROOT=Path(__file__).resolve().parent
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def main():
 reg=read('registration.json');selected=read('manual-selections.json');lookup=read('candidate-lookup.json')['frames'];manual=read('manual.json') if (ROOT/'manual.json').exists() else {};frames={c['id']+':'+str(i+1):f for c in reg['clips'] for i,f in enumerate(c['frames'])}
 for key,choice in selected.items():
  f=frames[key];native=choice.get('native')
  if 'sourceManual' in choice:source=choice['sourceManual']
  else:
   if native is None:native=lookup[key]['candidates'][choice['candidateIndex']]['native']
   source=[round(f['root'][k]+(native[k]-f['pivot'][k])/f['sourceScale'],6) for k in range(2)]
  assert 'visibility' in choice and 'attachmentPolicy' in choice,'Never infer held/closed grip from classifier island'
  manual[key]=choice|{'sourceManual':source,'sourcePalm':source,'sourceId':f['sourceId'],'sourceRect':f['sourceRect'],'canonicalSha256AtObservation':f['sha256'],'sourcePalmReviewed':choice.get('sourcePalmReviewed',False),'angleDeg':choice.get('angleDeg',0),'angleMeasurement':choice.get('angleMeasurement','Unmeasured projected wrist;0 is not a camera rotation or proven rig angle'),'manualEvidence':'actors/a/banner/contact/'+key.rsplit(':',1)[0]+'-manual-source-native.png','approved':False}
 (ROOT/'manual.json').write_text(json.dumps(manual,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('manual source keys',len(manual))
if __name__=='__main__':main()
