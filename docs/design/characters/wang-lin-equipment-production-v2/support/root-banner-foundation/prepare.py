from pathlib import Path
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
SUPPORT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
dispatch=ROOT/'actors/b/banner/root-dispatch.json'
assert sha(dispatch)=='1c6f5d7bb38c9effecc69a79542613c4df22df96101ddebfaf2a644f2decafce'
data=json.loads(dispatch.read_text(encoding='utf-8-sig'))
for original in data['jobs']:
 job=json.loads(json.dumps(original));name=job['id']
 target=SUPPORT/'records'/f'{name}.json'
 if target.exists():continue
 prompt=Path(job['promptAbsolute']);assert sha(prompt)==job['promptSha256']
 promptCopy=SUPPORT/'prompts'/f'{name}.txt';promptCopy.parent.mkdir(parents=True,exist_ok=True)
 shutil.copy2(prompt,promptCopy)
 inputs=[]
 for i,item in enumerate(job['inputs']):
  source=Path(job['inputAbsolute'][i]);assert sha(source)==item['sha256']
  output=SUPPORT/'inputs'/name/f'{i+1}.png';output.parent.mkdir(parents=True,exist_ok=True)
  shutil.copy2(source,output);assert sha(output)==item['sha256']
  inputs.append({**item,'file':str(output),'snapshotFrom':str(source)})
 job.update({'prompt':str(promptCopy),'promptAbsolute':str(promptCopy),'raw':str(SUPPORT/'sources'/f'{name}.png'),
  'inputs':inputs,'inputAbsolute':[i['file'] for i in inputs], 'dispatchSha256':sha(dispatch),
  'original':None,'status':'reserved-ready-no-call','selected':False,'actorWrites':False})
 target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(job,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'jobs':len(data['jobs']),'support':str(SUPPORT),'sourcesCreated':0}))
