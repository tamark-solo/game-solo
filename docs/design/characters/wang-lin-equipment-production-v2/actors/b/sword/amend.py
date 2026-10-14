from pathlib import Path
import json,hashlib,sys,copy
ROOT=Path(__file__).resolve().parent
def run(id,suffix,reason,change):
 p=ROOT/'generation.json';gen=json.loads(p.read_text(encoding='utf-8'));old=next(r for r in gen['records'] if r['id']==id)
 new=copy.deepcopy(old);newid=id+'-'+suffix;new.update({'id':newid,'raw':f'actors/b/sword/sources/{newid}.png','prompt':f'actors/b/sword/prompts/{newid}.txt','selected':False,'status':'planned','replaces':id,'replacementReason':reason})
 for k in ('sha256','size','mode','original','sourceViewed','rawImmutable'):new.pop(k,None)
 prompt=(ROOT/'prompts'/f'{id}.txt').read_text(encoding='utf-8')+'\nCRITICAL CORRECTION: '+change+'\n'
 pp=ROOT/'prompts'/f'{newid}.txt';pp.write_text(prompt,encoding='utf-8');new['promptSha256']=hashlib.sha256(pp.read_bytes()).hexdigest()
 old['selected']=False;old['supersededBy']=newid;old['sourceIssue']=reason;gen['records'].append(new)
 temp=p.with_suffix('.json.next');temp.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(p);print(newid)
if __name__=='__main__':run(*sys.argv[1:])
