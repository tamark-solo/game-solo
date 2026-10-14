from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json,importlib.util
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
spec=importlib.util.spec_from_file_location('geometry',ROOT/'body-tools.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));lookup={}
for direction in ['north','northeast','east','southeast','south','southwest','west','northwest']:
 out=Image.new('RGBA',(6*240,2*290),(31,35,45,255));draw=ImageDraw.Draw(out)
 for row,action in enumerate(['hit','gather']):
  c=next(c for c in reg['clips'] if c['direction']==direction and c['action']==action)
  for i,f in enumerate(c['frames']):
   key=c['id']+':'+str(i+1);im=Image.open(V2/f['file']).convert('RGBA');b=f['bounds'];yy=b[3]-16;px=im.load();seen=set();cc=[]
   def dark(x,y):
    r,gg,bb,a=px[x,y];return a>=128 and max(r,gg)<100 and bb<115 and r-gg<26
   for y in range(yy,b[3]):
    for x in range(im.width):
     if (x,y) in seen or not dark(x,y):continue
     queue=deque([(x,y)]);seen.add((x,y));points=[]
     while queue:
      cx,cy=queue.popleft();points.append((cx,cy))
      for nx,ny in [(cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1),(cx-1,cy-1),(cx+1,cy+1)]:
       if 0<=nx<im.width and yy<=ny<b[3] and (nx,ny) not in seen and dark(nx,ny):seen.add((nx,ny));queue.append((nx,ny))
     left=min(x for x,y in points);right=max(x for x,y in points)+1;top=min(y for x,y in points);bottom=max(y for x,y in points)+1
     if len(points)>=9 and right-left>=4 and bottom-top>=3 and len(points)/((right-left)*(bottom-top))>=.35:cc.append((left,right,top,bottom,len(points)))
   q=[]
   for left,right,top,bottom,pixels in sorted(cc):
    q.append({'nativeX':(left+right-1)/2,'span':[left,right],'rect':[left,top,right-left,bottom-top],'pixels':pixels,'nativeYBottom':bottom,'sourceX':f['root'][0]+((left+right-1)/2-f['pivot'][0])/f['sourceScale']})
   ox=i*240;oy=row*290;out.alpha_composite(im.resize((224,224),Image.Resampling.NEAREST),(ox+8,oy+20));draw.text((ox+4,oy+2),action+' '+str(i+1),fill='white')
   for j,p in enumerate(q):
    x=ox+8+p['nativeX']*2;draw.line((x,oy+20+yy*2,x,oy+20+b[3]*2),fill=(35,245,240),width=1);draw.text((x-6,oy+20+b[3]*2+3),str(j)+':'+str(p['nativeX']),fill=(35,245,240))
   lookup[key]={'proposals':q,'currentRoot':f['root'],'currentCanonical':f['file'],'frameSha256':f['sha256'],'sourceScale':f['sourceScale'],'floorY':f['root'][1],'mustReviewActualTwoBoots':True};draw.text((ox+4,oy+258),'candidate spans may include cloth.',fill='white')
 p=ROOT/'contact'/('foundation-root-map-'+direction+'.png');out.save(p)
(ROOT/'foundation-root-candidate-lookup.json').write_text(json.dumps(lookup,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Root footprint proposals only; choose actual boot spans after visual review.')
