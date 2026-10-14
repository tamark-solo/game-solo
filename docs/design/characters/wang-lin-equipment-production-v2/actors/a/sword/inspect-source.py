# Source geometry inspection; avoid the stdlib module name inspect.
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,statistics
from collections import deque
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);tmp=p.with_name(p.name+'.next');tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(p)
def mask(im):return im.getchannel('A').point(lambda a:255 if a>=128 else 0)
def spans(vals):
 out=[];start=None
 for i,v in enumerate(vals+[0]):
  if v and start is None:start=i
  if not v and start is not None:out.append((start,i));start=None
 return out
def proj(a,axis):
 w,h=a.size
 return [sum(a.crop((0,y,w,y+1)).get_flattened_data()) for y in range(h)] if axis=='y' else [sum(a.crop((x,0,x+1,h)).get_flattened_data()) for x in range(w)]
def cells(im,columns=6,rows=5):
 a=mask(im);ys=spans(proj(a,'y'))
 if len(ys)!=rows:return component_cells(im,columns,rows)
 out=[]
 for row,(top,bot) in enumerate(ys):
  xs=spans(proj(a.crop((0,top,im.width,bot)),'x'))
  if len(xs)!=columns:return component_cells(im,columns,rows)
  y0=0 if row==0 else (ys[row-1][1]+top)//2;y1=im.height if row==rows-1 else (bot+ys[row+1][0])//2
  poses=[]
  for col,(left,right) in enumerate(xs):
   x0=0 if col==0 else (xs[col-1][1]+left)//2;x1=im.width if col==columns-1 else (right+xs[col+1][0])//2
   bb=a.crop((x0,y0,x1,y1)).getbbox();core=[x0+bb[0],y0+bb[1],x0+bb[2],y0+bb[3]]
   poses.append({'row':row,'col':col,'rect':[x0,y0,x1-x0,y1-y0],'core':core})
  out.append(poses)
 return out
def component_cells(im,columns,rows):
 # A projection can overlap because different columns have different hair/boot heights.
 # Use intact connected body bounds only when each real character is isolated.
 a=mask(im);w,h=im.size;px=a.load();seen=bytearray(w*h);cc=[]
 for y in range(h):
  for x in range(w):
   if seen[y*w+x] or not px[x,y]:continue
   q=deque([(x,y)]);seen[y*w+x]=1;l=r=x;t=b=y;size=0
   while q:
    cx,cy=q.popleft();size+=1;l=min(l,cx);r=max(r,cx);t=min(t,cy);b=max(b,cy)
    for nx,ny in ((cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1),(cx-1,cy-1),(cx+1,cy-1),(cx-1,cy+1),(cx+1,cy+1)):
     if 0<=nx<w and 0<=ny<h and not seen[ny*w+nx] and px[nx,ny]:seen[ny*w+nx]=1;q.append((nx,ny))
   if size>1000:cc.append([l,t,r+1,b+1])
 assert len(cc)==columns*rows,('isolatedBodyCount',len(cc),columns*rows)
 cc.sort(key=lambda c:(c[1]+c[3])/2);grid=[sorted(cc[i*columns:(i+1)*columns],key=lambda c:(c[0]+c[2])/2) for i in range(rows)];out=[]
 for row,bodies in enumerate(grid):
  poses=[]
  for col,core in enumerate(bodies):
   l,t,r,b=core;x0=0 if col==0 else (bodies[col-1][2]+l)//2;x1=w if col==columns-1 else (r+bodies[col+1][0])//2
   prev=grid[row-1][col] if row else None;next=grid[row+1][col] if row<rows-1 else None
   y0=0 if prev is None else (prev[3]+t)//2;y1=h if next is None else (b+next[1])//2
   assert x0<=l and r<=x1 and y0<=t and b<=y1,('bodyBoundingBoxesOverlap',row,col,core,[x0,y0,x1,y1])
   bb=a.crop((x0,y0,x1,y1)).getbbox();actual=[x0+bb[0],y0+bb[1],x0+bb[2],y0+bb[3]]
   assert actual==core,('neighborOrDetachedPixelsInRect',row,col,core,actual)
   poses.append({'row':row,'col':col,'rect':[x0,y0,x1-x0,y1-y0],'core':core,'geometryMethod':'isolated connected body bounds + per-column gutter; no pixels removed','gutterToNextRow':None if next is None else next[1]-b})
  out.append(poses)
 return out
def bootroot(im,core):
 l,t,r,b=core;h=b-t;bandtop=b-max(5,round(h*.05));bands=spans(proj(mask(im).crop((l,bandtop,r,b)),'x'));bands=[(x,y) for x,y in bands if y-x>=3]
 assert bands,('no boots',core)
 centers=[l+(x+y-1)/2 for x,y in bands]
 return [(centers[0]+centers[-1])/2,b],{'sourceFootBand':[l,bandtop,r-l,b-bandtop],'soleSegments':[[l+x,l+y] for x,y in bands]}
def native(im,cell,root,scale,canvas=(112,112),pivot=(56,104)):
 x,y,w,h=cell['rect'];out=im.crop((x,y,x+w,y+h)).transform(tuple(canvas),Image.Transform.AFFINE,(1/scale,0,root[0]-x-pivot[0]/scale,0,1/scale,root[1]-y-pivot[1]/scale),Image.Resampling.NEAREST)
 out.putalpha(out.getchannel('A').point(lambda a:255 if a>=128 else 0));return out
def edges(im):
 a=mask(im);w,h=a.size;return {k:sum(v>0 for v in a.crop(rect).get_flattened_data()) for k,rect in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}
def main():
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));sources=[];failed=[]
 for rec in gen['records']:
  if not rec['selected']:continue
  im=Image.open(ROOT/rec['raw']).convert('RGBA');columns,rows=rec.get('grid',[6,5])
  try:grid=cells(im,columns,rows)
  except AssertionError as e:failed.append({'id':rec['id'],'reason':str(e)});continue
  flat=[p for row in grid for p in row];calheights=[p['core'][3]-p['core'][1] for p in flat[:6]];scale=80/statistics.median(calheights);contact=Image.new('RGBA',(columns*116,rows*128),(31,36,49,255));draw=ImageDraw.Draw(contact);src={'id':rec['id'],'file':rec['raw'],'sha256':rec['sha256'],'direction':rec['direction'],'group':rec['group'],'actions':rec['actions'],'grid':[columns,rows],'sourceSize':list(im.size),'neutralHeights':calheights,'scale':scale,'sourceEdges':edges(im),'rows':[],'requiresNoPoseFit':True}
  for row,poses in enumerate(grid):
   outposes=[]
   for col,p in enumerate(poses):
    root,basis=bootroot(im,p['core']);n=native(im,p,root,scale);contact.alpha_composite(n,(col*116+2,row*128+16));draw.text((col*116+2,row*128+2),str(row)+':'+str(col),fill=(180,180,190))
    outposes.append(p|{'root':root,'rootBasis':basis,'nativeBounds':n.getbbox(),'nativeEdges':edges(n)})
    if row==0 and col==0:
     file=ROOT/'inputs'/(rec['id']+'-neutral-native.png');n.save(file);n.resize((896,896),Image.Resampling.NEAREST).save(file.with_name(file.name.replace('native','nearest8x')));src['masterNative']=str(file.relative_to(ROOT));src['masterInputSha256']=sha(file.with_name(file.name.replace('native','nearest8x')))
   src['rows'].append(outposes)
  flat=[p for row in src['rows'] for p in row];src['calibrations']=flat[:6];src['actionCells']={action:[flat[k] for k in rec.get('actionIndices',{}).get(action,list(range(6+i*6,12+i*6)))] for i,action in enumerate(src['actions'])};src['recoverySilhouetteDeltaPct']={action:round(((poses[-1]['core'][3]-poses[-1]['core'][1])/statistics.median(calheights)-1)*100,2) for action,poses in src['actionCells'].items()}
  out=ROOT/'contact'/(rec['id']+'-inspection-2x.png');contact.resize((contact.width*2,contact.height*2),Image.Resampling.NEAREST).save(out);src['contact']=str(out.relative_to(ROOT));sources.append(src)
 write(ROOT/'source-geometry.json',{'schema':'huyen-tam-sword-source-geometry-v2','sources':sources,'geometryPending':failed,'registeredMotionClips':0,'note':'Inspection geometry only; manual palms and semantic death/seat roots still required before canonical production.'})
 print(json.dumps([{'id':s['id'],'scale':s['scale'],'recoveryDeltas':s['recoverySilhouetteDeltaPct'],'edges':s['sourceEdges']} for s in sources]))
 print(json.dumps({'geometryPending':failed}))
if __name__=='__main__':main()

