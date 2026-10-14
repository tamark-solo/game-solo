from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
R=Path(__file__).resolve().parent;V=R.parents[2];W=V.parent/'van-hai-npc-visual-standard-v1'
r=json.loads((R/'registration.json').read_text(encoding='utf-8'));dirs=['north','northeast','east','southeast','south','southwest','west','northwest'];by={(c['direction'],c['action']):c for c in r['clips']}
for name,actions in [('core',['idle','run','cast-single-target','cast-aoe']),('foundation',['hit','death','meditate','gather'])]:
 chart=Image.new('RGBA',(8*240,8*248),(31,41,51,255));dr=ImageDraw.Draw(chart)
 for row,d in enumerate(dirs):
  for aindex,a in enumerate(actions):
   c=by[(d,a)]
   for end,f in enumerate([c['frames'][0],c['frames'][-1]]):
    x=(aindex*2+end)*240;y=row*248;im=Image.open(V/f['file']).convert('RGBA');px,py=f['pivot'];scale=2
    # Larger corpse canvas is padding; crop only evidence viewport after source QA guaranteed whole silhouette.
    bounds=im.getbbox();shown=im.crop(bounds).resize(((bounds[2]-bounds[0])*scale,(bounds[3]-bounds[1])*scale),Image.Resampling.NEAREST)
    chart.alpha_composite(shown,(x+max(0,(240-shown.width)//2),y+226-shown.height));dr.text((x+4,y+4),f'{d} {a[:8]} {"first" if end==0 else "last"}',fill=(226,229,204))
 chart.save(R/'review'/f'{name}-first-recovery-8views-2x.png')
neutral=Image.new('RGBA',(8*240,240),(31,41,51,255));dr=ImageDraw.Draw(neutral)
wd=json.loads((W/'directions.json').read_text(encoding='utf-8'))
for i,d in enumerate(dirs):
 f=next(k['frames'][0] for k in r['calibrations'] if k['direction']==d and 'core' in k['sourceId']);own=Image.open(V/f['file']).convert('RGBA');wangrecord=next(p for p in wd['directions'] if p['direction']==d);wp=W/wangrecord['native'];assert hashlib.sha256(wp.read_bytes()).hexdigest()==wangrecord['nativeSha256'];wang=Image.open(wp).convert('RGBA')
 for px,im,pivot in [(i*240+55,own,f['pivot']),(i*240+180,wang,wangrecord['pivot'])]:
  display=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);neutral.alpha_composite(display,(px-pivot[0]*2,216-pivot[1]*2));dr.line((px-4,216,px+4,216),fill=(238,211,80))
 dr.text((i*240+4,5),d+' own / Wang style',fill=(226,229,204))
neutral.save(R/'review/own-versus-Wang-8views-2x.png')
print('8-direction first/recovery2x and own/Wang same-view2x evidence saved; source/actor pixels unchanged')
