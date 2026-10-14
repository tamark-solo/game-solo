"""Refresh only un-dispatched support prompts after editorial correction."""
from pathlib import Path
import hashlib,json,runpy
ROOT=Path(__file__).resolve().parent
spec=runpy.run_path(str(ROOT/'prepare.py'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for family in ('chariot','bead'):
    p=ROOT/family/'plan.json'
    j=json.loads(p.read_text(encoding='utf8'))
    for job in j['jobs']:
        assert job['generationAllowed'] is False and job['rawProduced'] is False
        assert job['actualRawSha256'] is None
        path=ROOT/job['prompt']
        path.write_text(spec['prompt'](family,job['identityId'],job['direction'],job['group']),encoding='utf8')
        job['promptSha256']=sha(path)
    p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Refreshed 96 un-dispatched support prompts; no source calls or actor writes.')
