from pathlib import Path
import json,shutil,sys,hashlib,copy
R=Path(__file__).resolve().parent;V=R.parents[2];S=V/('support/'+(sys.argv[2] if len(sys.argv)>2 else 'cart-core-assist'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
sid=sys.argv[1];src=json.loads((S/'records'/f'{sid}.json').read_text(encoding='utf-8'))
original=src.get('actualOriginalPath') or src.get('original');rawsha=src.get('rawSha256') or src.get('sha256')
assert original and rawsha,'Helper output must exist, not reserved'
g=json.loads((R/'generation.json').read_text(encoding='utf-8'));old=next((r for r in g['records'] if r['id']==sid),None)
if old is None:
 basis=next(r for r in g['records'] if r['id']==sid.replace('-r2','-r1'));old=copy.deepcopy(basis)
 old.update(id=sid,raw=f'actors/b/chariot/sources/{sid}.png',supersedes=basis['id'])
 for key in ['original','sha256','size','mode','sourceViewed','rawImmutable','rejection']:old.pop(key,None)
 g['records'].append(old)
 basis.update(selected=False,status='superseded-camera',rejection='NW requested rear-left but original generated rear-right/NE in every cell. Preserve exact history; no mirror.')
assert not old.get('sha256'),'No overwrite of previously generated call'
assert sha(S/src['raw'])==rawsha
dst=V/old['raw'];assert not dst.exists();shutil.copy2(S/src['raw'],dst)
prompt=R/'prompts'/f'{sid}-helper-actual.txt';shutil.copy2(S/src['prompt'],prompt)
old.update({'prompt':str(prompt.relative_to(V)).replace('\\','/'),'promptSha256':sha(prompt),'original':original,'sha256':sha(dst),'size':src.get('size',src['actualDimensions']),'mode':src.get('mode',src.get('actualMode','RGBA')),'status':'generated','selected':True,'sourceViewed':True,'rawImmutable':True,'helperRecord':str((S/'records'/f'{sid}.json').relative_to(V)).replace('\\','/'),'helperRecordSha256':sha(S/'records'/f'{sid}.json')})
inputs=[]
for i,p in enumerate(src['inputs']):
 target=R/'inputs'/'helper'/sid/f'{i+1}.png';target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(S/p['file'],target)
 assert sha(target)==p['sha256'];inputs.append({**p,'file':str(target.relative_to(V)).replace('\\','/')})
old['inputs']=inputs
(R/'tool').mkdir(exist_ok=True);shutil.copy2(S/'tool'/f'{sid}.json',R/'tool'/f'{sid}.json')
g['actualCoverage']['generatedSources']=sum(bool(r.get('sha256')) for r in g['records'])
(R/'generation.json').write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'imported':sid,'sha256':sha(dst)}))
