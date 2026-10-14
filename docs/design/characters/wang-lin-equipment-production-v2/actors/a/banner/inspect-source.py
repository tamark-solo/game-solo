from pathlib import Path
from PIL import Image,ImageDraw
import json,statistics,importlib.util
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
spec=importlib.util.spec_from_file_location('own_banner_geometry',ROOT/'body-tools.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
def main():
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));manual=json.loads((ROOT/'source-measurements.json').read_text(encoding='utf-8')) if (ROOT/'source-measurements.json').exists() else {};sources=[];pending=[]
 for r in gen['records']:
  if not r.get('sha256'):continue
  im=Image.open(V2/r['raw']).convert('RGBA');columns,rows=r.get('actualGrid',r['requestedGrid'])
  try:grid=g.cells(im,columns,rows)
  except AssertionError as e:pending.append({'id':r['id'],'reason':str(e),'selected':r.get('selected',False)});continue
  flat=[p for row in grid for p in row];cal=flat[:6];measured=manual.get(r['id'],{});calm=measured.get('calibrations',[]);calheights=[]
  for i,p in enumerate(flat):
   root,basis=g.bootroot(im,p['core']);p.update({'root':root,'rootBasis':basis,'rootReviewed':False})
   if i<6:
    if len(calm)==6:root=calm[i]['bootRoot'];p['root']=root;p['rootReviewed']=True;p['rootBasis']=calm[i]
    calheights.append(root[1]-(calm[i]['crownY'] if len(calm)==6 else p['core'][1]))
  scale=80/statistics.median(calheights);s={'id':r['id'],'file':r['raw'],'sha256':r['sha256'],'direction':r['direction'],'group':r['group'],'actions':r['actions'],'selectedActions':r.get('selectedActions',r['actions']),'selected':r.get('selected',False),'sourceViewed':r.get('sourceViewed',False),'grid':[columns,rows],'sourceSize':list(im.size),'scale':scale,'neutralHeights':calheights,'calibrationRootsReviewed':len(calm)==6,'sourceEdges':g.edges(im),'rows':grid,'calibrations':flat[:6],'actionCells':{},'requiresNoPoseFit':True}
  for i,a in enumerate(r['actions']):s['actionCells'][a]=[flat[k] for k in r.get('actionIndices',{}).get(a,list(range(6+i*6,12+i*6)))];s['recoverySilhouetteDeltaPct']={a:round(((pp[-1]['core'][3]-pp[-1]['core'][1])/statistics.median(calheights)-1)*100,2) for a,pp in s['actionCells'].items()}
  contact=Image.new('RGBA',(columns*196,rows*144),(29,34,45,255));d=ImageDraw.Draw(contact)
  for p in flat:
   n=g.native(im,p,p['root'],scale,(192,128),(96,112));ox=p['col']*196;oy=p['row']*144;contact.alpha_composite(n,(ox+2,oy+16));d.text((ox+2,oy+1),str(p['row'])+':'+str(p['col']),fill='white')
  cf=ROOT/'contact'/(r['id']+'-inspection-2x.png');cf.parent.mkdir(parents=True,exist_ok=True);contact.resize((contact.width*2,contact.height*2),Image.Resampling.NEAREST).save(cf);s['contact']=str(cf.relative_to(V2)).replace('\\','/')
  native=g.native(im,flat[0],flat[0]['root'],scale);nf=ROOT/'inputs'/'measured-neutral'/(r['id']+'-native.png');nf.parent.mkdir(parents=True,exist_ok=True);native.save(nf);eight=nf.with_name(nf.stem+'-nearest8x.png');native.resize((896,896),Image.Resampling.NEAREST).save(eight);s['neutralNative']=str(nf.relative_to(V2)).replace('\\','/');s['neutralNativeSha256']=g.sha(nf);s['neutralNearest8x']=str(eight.relative_to(V2)).replace('\\','/');s['neutralNearest8xSha256']=g.sha(eight);sources.append(s)
 g.write(ROOT/'source-geometry.json',{'schema':'huyen-tam-banner-source-geometry-v2','sources':sources,'geometryPending':pending,'policy':'Actual row/component geometry; six source-neutral factor, measured human boots when reviewed. Candidate roots must be visually confirmed. Alpha128 diagnostics do not establish anatomy or full body completeness.'});print(json.dumps({'sources':len(sources),'selected':sum(s['selected'] for s in sources),'pending':pending}))
if __name__=='__main__':main()
