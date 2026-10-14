from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text(encoding='utf-8'))
reg=read(ROOT/'registration.json');manual=read(ROOT/'manual.json')
frames={c['id']+':'+str(i+1):f for c in reg['clips'] if 'reusedFrom' not in c for i,f in enumerate(c['frames'])}
choices={'sword-a-southeast-hit:2':([55.5,58.5],'partially-occluded-palm','held-candidate'),'sword-a-southeast-death:4':([64,100],'visible-palm','drop-ground'),'sword-a-south-death:5':([68,101],'occluded/fragment','drop-ground'),'sword-a-south-run:3':([55.5,65],'visible-seal-hand','detach-hover'),'sword-a-southwest-cast-single-target:3':([52,64],'visible-seal-hand','detach-hover')}
for key,(native,visibility,policy) in choices.items():
 f=frames[key];m=manual[key];m['native']=native;m['sourceManual']=[round(f['root'][k]+(native[k]-f['pivot'][k])/f['sourceScale'],6) for k in range(2)];m['sourcePalm']=m['sourceManual'];m['visibility']=visibility;m['attachmentPolicy']=policy;m['selectionProof']={'manualDirectPoint':True,'reason':'Refined on original raw hand crop; avoid belt/cuff centroid islands.'}
manual['sword-a-south-run:1']['attachmentPolicy']='detach-hover';manual['sword-a-south-run:1']['handShape']='open-command-palm'
for key,m in manual.items():
 if '-meditate:' in key and m.get('visibility')=='visible-palm':m['visibility']='visible-seal-hand';m['handShape']='joined-lap-hands'
(ROOT/'manual.json').write_text(json.dumps(manual,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
