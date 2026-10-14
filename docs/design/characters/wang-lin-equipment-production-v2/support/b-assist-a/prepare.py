import json, hashlib, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
V2 = ROOT.parents[1]
A = V2 / 'actors/a/sword'
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
ids = [f'sword-a-{direction}-{group}-r1' for direction in ['west','northwest'] for group in ['damage','practice']]
planned = {item['id']: item for item in json.loads((A/'planned-jobs.json').read_text(encoding='utf-8'))}
if (ROOT/'generation.json').exists():
    raise RuntimeError('Immutable support preparation already exists')
items=[]
for sid in ids:
    job=planned[sid]
    for sub in ['prompts','sources',f'inputs/{sid}','review']:
        (ROOT/sub).mkdir(parents=True,exist_ok=True)
    prompt=A/'sources'/f'{sid}.prompt.txt'
    copy=ROOT/'prompts'/f'{sid}.txt'
    shutil.copy2(prompt,copy)
    inputs=[]
    for index in range(1,4):
        source=A/'inputs'/sid/f'{index}.png'
        target=ROOT/'inputs'/sid/f'{index}.png'
        shutil.copy2(source,target)
        actual=sha(target)
        assert actual==job['inputSha256'][index-1],sid
        inputs.append({'file':str(target.relative_to(ROOT)).replace('\\','/'),'original':str(source),'sha256':actual,'role':job['inputRoles'][index-1]})
    items.append({'id':sid,'direction':job['dir'],'actions':job['actions'],'requestedGrid':job['grid'],'requestedCount':18,'prompt':str(copy.relative_to(ROOT)).replace('\\','/'),'originalPrompt':str(prompt),'promptSha256':sha(copy),'inputs':inputs,'tool':'built-in image_gen.imagegen','transparentBackground':True,'status':'planned','ownerApproved':False,'runtimeIntegrated':False})
(ROOT/'generation.json').write_text(json.dumps({'schema':'wang-lin-a-sword-raw-assist-v1','ownership':'Raw/prompt/input/provenance only; actors/a is read-only and imported by its owner.','items':items},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('prepared 4 immutable support jobs')
