"""Snapshot four root-reserved Banner Core jobs; never write actors."""
from pathlib import Path
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parent
V2=ROOT.parents[1]
JOBS=[('a','west'),('a','northwest'),('b','west'),('b','northwest')]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,j):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def main():
    if (ROOT/'plan.json').exists():raise RuntimeError('Support snapshots already exist; preserve them.')
    jobs=[]
    for identity,direction in JOBS:
        jid=f'banner-{identity}-{direction}-core-r1'
        generation=V2/'actors'/identity/'banner'/'generation.json'
        original=next(x for x in json.loads(generation.read_text(encoding='utf8'))['records'] if x['id']==jid)
        prompt=V2/original['prompt']
        assert sha(prompt)==original['promptSha256']
        dst=ROOT/'prompts'/prompt.name;dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(prompt,dst)
        inputs=[]
        for i,item in enumerate(original['inputs'],1):
            src=V2/item['file'];assert sha(src)==item['sha256']
            target=ROOT/'inputs'/jid/f'{i}.png';target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(src,target)
            inputs.append({**item,'index':i,'sourceSnapshot':str(src),'file':target.relative_to(ROOT).as_posix(),'sha256':sha(target)})
        job={**original,'upstreamGeneration':str(generation),'upstreamGenerationSha256':sha(generation),
             'upstreamRecord':original,'prompt':dst.relative_to(ROOT).as_posix(),'promptSha256':sha(dst),
             'inputs':inputs,'raw':f'sources/{jid}.png','actualOriginalPath':None,'rawSha256':None,
             'status':'reserved-prepared-for-built-in-call','selected':False,'ownerApproved':False,'runtimeIntegrated':False}
        write(ROOT/'records'/f'{jid}.json',job);jobs.append(job)
    write(ROOT/'plan.json',{'schema':'banner-core-assist-plan-2','date':'2026-10-14','scope':'support-only; actors remain owned by A/B',
                            'reservedJobs':[x['id'] for x in jobs],'sourceCallsRequested':4,'generationAllowedByRoot':True,
                            'builtInOnly':True,'transparentRequested':True,'actorWriteAllowed':False,
                            'actualSources':0,'ownerApproved':False,'runtimeIntegrated':False})
    print(json.dumps([{'id':x['id'],'prompt':(ROOT/x['prompt']).read_text(encoding='utf8'),
                       'promptAbsolute':str(ROOT/x['prompt']),'inputPaths':[str(ROOT/i['file']) for i in x['inputs']]} for x in jobs],ensure_ascii=True))
if __name__=='__main__':main()
