from pathlib import Path
import json,hashlib,subprocess,sys
ROOT=Path(__file__).resolve().parent
V2=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
selections=read(ROOT/'manual-selections.json')
selections['southwest'].update({'hit':[9,4,11,18,12,13],'death':[13,16,19,19,15,18],'meditate':[10,12,9,10,11,8],'gather':[12,8,11,3,3,12,8]})
write(ROOT/'manual-selections.json',selections)
subprocess.run([sys.executable,str(ROOT/'resolve-manual.py')],check=True)
reg=read(ROOT/'registration.json')
frames={c['id']+':'+str(i+1):f for c in reg['clips'] if 'reusedFrom' not in c for i,f in enumerate(c['frames'])}
manual=read(ROOT/'manual.json')
imports=[]
for file,wrapped in [(V2/'support/b-assist-a/manual-west-northwest.json',True),(V2/'support/a-foundation-manual/manual.json',False)]:
 data=read(file); data=data['frames'] if wrapped else data
 for key,m in data.items():
  f=frames[key]
  assert sha(V2/f['file'])==m['frameSha256'],key+' frame changed before import'
  if 'sourceSha256' in m:assert sha(V2/f['source'])==m['sourceSha256'],key+' source mismatch'
  assert f['sourceRect']==m['sourceRect']
  n=dict(m)
  n['sourceManual']=m.get('sourceManual',m.get('sourcePalm',m.get('source')))
  assert isinstance(n['sourceManual'],list),key
  n['importedFrom']=str(file.relative_to(V2)).replace('\\','/')
  n['importedEvidenceSha256']=sha(file)
  n['sourcePalmReviewed']=True
  n['manualReviewCompleted']=True
  manual[key]=n
 imports.append({'file':str(file.relative_to(V2)).replace('\\','/'),'sha256':sha(file),'count':len(data)})
for key,f in frames.items():
 m=manual[key]
 if 'sourceManual' not in m:
  m['sourceManual']=[round(f['root'][k]+(m['native'][k]-f['pivot'][k])/f['sourceScale'],6) for k in range(2)]
 m['sourcePalm']=m['sourceManual']
 m['sourceId']=f['sourceId']
 m['sourceRect']=f['sourceRect']
 m['sourceSha256']=sha(V2/f['source'])
 m['reviewFrameSha256']=f['sha256']
 m['sourcePointPolicy']='Actual source coordinate from visually selected palm or explicitly hidden forearm endpoint; canonical root changes translate from this coordinate, never classify skin again.'
write(ROOT/'manual.json',manual)
write(ROOT/'manual-imports.json',{'imports':imports,'activeNewKeys':len(frames),'allActualSourcePointsFrozen':True})
print('manual active',len(frames),'imports',imports)
