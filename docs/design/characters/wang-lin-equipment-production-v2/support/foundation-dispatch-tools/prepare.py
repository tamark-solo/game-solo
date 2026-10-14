from pathlib import Path
import argparse,json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--family',required=True,choices=['chariot','bead']);args=parser.parse_args()
family=args.family;previous='banner' if family=='chariot' else 'chariot'
assert not (ROOT/'approval.json').exists(),'Final delivery is immutable'
checkpoint=ROOT/'checkpoints'/f'{previous}.json';assert checkpoint.exists(),'Previous family technical gate is required'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
gate=json.loads(checkpoint.read_text(encoding='utf-8'))
for pin in gate['files']:assert sha(ROOT/pin['file'])==pin['sha256'],'Previous family changed: '+pin['file']
SUPPORT=ROOT/'support'/f'root-{family}-foundation'
SUPPORT.mkdir(parents=True,exist_ok=True)
for name in ['save-source.py','finalize.py']:
 output=SUPPORT/name
 if not output.exists():
  code=(ROOT/'support/root-banner-foundation'/name).read_text(encoding='utf-8')
  if name=='finalize.py':
   code=code.replace("'actualSourceFiguresObserved':18", "'actualSourceFiguresObserved':meta['actualSourceFiguresObserved']")
   code=code.replace("'actualRawFiguresObserved':72", "'actualRawFiguresObserved':sum(r['actualSourceFiguresObserved'] for r in records)")
   code=code.replace('root-banner-foundation',f'root-{family}-foundation')
  output.write_text(code,encoding='utf-8')
dispatch=ROOT/'actors/b'/family/'root-dispatch.json';data=json.loads(dispatch.read_text(encoding='utf-8-sig'))
for original in data['jobs']:
 job=json.loads(json.dumps(original));name=job['id'];assert family in name
 target=SUPPORT/'records'/f'{name}.json'
 if target.exists():continue
 prompt=Path(job['promptAbsolute']);assert sha(prompt)==job['promptSha256']
 promptCopy=SUPPORT/'prompts'/f'{name}.txt';promptCopy.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(prompt,promptCopy)
 inputs=[]
 for i,item in enumerate(job['inputs']):
  source=Path(job['inputAbsolute'][i]);assert sha(source)==item['sha256']
  output=SUPPORT/'inputs'/name/f'{i+1}.png';output.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,output);assert sha(output)==item['sha256']
  inputs.append({**item,'file':str(output),'snapshotFrom':str(source)})
 job.update({'prompt':str(promptCopy),'promptAbsolute':str(promptCopy),'raw':str(SUPPORT/'sources'/f'{name}.png'),'inputs':inputs,'inputAbsolute':[i['file'] for i in inputs],
  'dispatchSha256':sha(dispatch),'previousFamilyCheckpointSha256':sha(checkpoint),'original':None,'status':'reserved-ready-no-call','selected':False,'actorWrites':False})
 target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(job,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'jobs':len(data['jobs']),'support':str(SUPPORT),'sourcesCreated':0}))
