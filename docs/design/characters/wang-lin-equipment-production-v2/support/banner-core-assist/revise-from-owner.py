"""Snapshot exact actor-owner prompt revisions before a call; preserve older bytes."""
from pathlib import Path
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for path in sorted((ROOT/'records').glob('*.json')):
    record=json.loads(path.read_text(encoding='utf8'))
    if record['actualOriginalPath'] is not None:continue  # Preserve call-time prompt/history forever.
    gen=V2/'actors'/record['identityId']/'banner'/'generation.json'
    upstream=next(x for x in json.loads(gen.read_text(encoding='utf8'))['records'] if x['id']==record['id'])
    src=V2/upstream['prompt']
    assert sha(src)==upstream['promptSha256']
    if sha(src)==record['promptSha256']:continue
    old=ROOT/record['prompt'];folder=ROOT/'history'/'prepared-prompts';folder.mkdir(parents=True,exist_ok=True)
    historic=folder/(record['id']+'-'+record['promptSha256'][:12]+'.txt');shutil.copy2(old,historic)
    record.setdefault('promptHistory',[]).append({'file':historic.relative_to(ROOT).as_posix(),'sha256':sha(historic),'notCalled':True})
    new=ROOT/'prompts'/(record['id']+'-owner-revision-'+upstream['promptSha256'][:12]+'.txt')
    shutil.copy2(src,new)
    record.update({'prompt':new.relative_to(ROOT).as_posix(),'promptSha256':sha(new),'upstreamRecord':upstream,
                   'upstreamGenerationSha256':sha(gen),'upstreamPromptOriginal':str(src)})
    path.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(record['id']+' exact owner prompt revision '+sha(new))
