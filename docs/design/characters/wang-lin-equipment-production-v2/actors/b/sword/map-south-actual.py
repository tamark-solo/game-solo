from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent;p=ROOT/'generation.json';gen=json.loads(p.read_text(encoding='utf-8'));r=next(r for r in gen['records'] if r['id']=='sword-b-south-meditate-gather-r2')
r.update({'actualRows':5,'actualColumns':3,'actualSourcePoseMapping':{'neutral':[0,1,2,3,4,5],'meditate':[6,7,8,9],'gather':[12,10,11,13,14]},'actualSourcePoseCount':15,'sourceLayoutDelta':'Requested18; actual15. Four true seated keys form meditation loop. Five gather keys mapped ready,bend,reach,retrieve,recover using actual cells, no duplicate or altered body.','sourceViewed':True})
p.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
