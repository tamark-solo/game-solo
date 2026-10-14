from pathlib import Path
from PIL import Image,ImageDraw
import json,statistics,sys,importlib.util,shutil,hashlib
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parent;V=R.parents[2]
s=importlib.util.spec_from_file_location('bt',R/'body-tools.py');t=importlib.util.module_from_spec(s);s.loader.exec_module(t)
g=json.loads((R/'generation.json').read_text(encoding='utf-8'));prop=json.loads((R/'review/core-proposals.json').read_text(encoding='utf-8'))
lineup=Image.new('RGBA',(8*224,224),(30,40,50,255));dr=ImageDraw.Draw(lineup);count=0
for c in g['records']:
 if c['group']!='core' or not c.get('selected') or c['id'] not in prop:continue
 q=prop[c['id']];assert not any(q['edge128'].values()),'No incomplete raw may control foundation'
 im=Image.open(V/c['raw']).convert('RGBA');cells=t.cells_for(im,6,5);scale=80/statistics.median(e['soleProposal']-e['crownProposal'] for e in q['entries'][:6])
 native=t.native(im,cells[0][0],q['entries'][0]['rootProposal'],scale);assert not any(t.edge_count(native).values())
 p=R/'inputs'/'neutral'/f'banner-b-{c["direction"]}.png';p.parent.mkdir(exist_ok=True);native.save(p);p8=p.with_name(p.stem+'-nearest8x.png');native.resize((896,896),Image.Resampling.NEAREST).save(p8)
 lineup.alpha_composite(native.resize((224,224),Image.Resampling.NEAREST),(count*224,0));dr.text((count*224+5,3),c['direction'],fill=(240,220,190));count+=1
 for group in ['damage','practice']:
  r=next(z for z in g['records'] if z['direction']==c['direction'] and z['group']==group)
  if r.get('sha256') or r.get('inputSnapshotsReady'):continue
  sources=[(p8,'own-same-identity-B-banner-same-view-reviewed-neutral-PRIMARY'),(V/c['inputs'][1]['file'],'Wang-same-view-camera-anatomy-style-only'),(V/c['raw'],'own-B-banner-same-view-core-full-source-support')]
  r['inputs']=[]
  for i,(f,role) in enumerate(sources,1):
   target=R/'inputs'/'foundation'/r['id']/f'{i}.png';target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,target)
   r['inputs'].append({'file':str(target.relative_to(V)).replace('\\','/'),'sha256':t.sha(target),'original':str(f),'role':role})
  r.update(inputSnapshotsReady=True,status='prepared-awaiting-manual-neutral-view-release',dependency=f'{c["id"]} own neutral key1, factor{scale}',basisCoreSha256=c['sha256'],neutralReviewed=False)
lineup.save(R/('review/neutral-foundation-lineup-8views-2x.png' if count==8 else 'review/neutral-foundation-lineup-2x.png'))
(R/'generation.json').write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'neutrals':count,'foundationInputsPrepared':sum(r['group']!='core' and r.get('inputSnapshotsReady') for r in g['records'])}))
