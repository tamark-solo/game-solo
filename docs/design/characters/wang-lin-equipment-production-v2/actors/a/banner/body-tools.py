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
 a=mask(im);w,h=im.size;px=a.load();seen=bytearray(w*h);cc=[];small=[]
 for y in range(h):
  for x in range(w):
   if seen[y*w+x] or not px[x,y]:continue
   q=deque([(x,y)]);seen[y*w+x]=1;l=r=x;t=b=y;size=0;points=[]
   while q:
    cx,cy=q.popleft();size+=1;points.append((cx,cy));l=min(l,cx);r=max(r,cx);t=min(t,cy);b=max(b,cy)
    for nx,ny in ((cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1),(cx-1,cy-1),(cx+1,cy-1),(cx-1,cy+1),(cx+1,cy+1)):
     if 0<=nx<w and 0<=ny<h and not seen[ny*w+nx] and px[nx,ny]:seen[ny*w+nx]=1;q.append((nx,ny))
   c={'core':[l,t,r+1,b+1],'points':points,'opaquePixels':size,'fragments':[]}
   if size>1000:cc.append(c)
   else:small.append(c)
 assert len(cc)==columns*rows,('isolatedBodyCount',len(cc),columns*rows)
 # Retain detached opaque source islands with their nearest intact body. Do not
 # remove fingertips, hair or boots because of an equal-cell crop. Reject distant
 # or ambiguous islands instead of silently changing the original artwork.
 for s in small:
  l,t,r,b=s['core'];dist=[]
  for c in cc:
   cl,ct,cr,cb=c['core'];dist.append((max(cl-r,l-cr,0)+max(ct-b,t-cb,0),c))
  dist.sort(key=lambda q:q[0]);assert dist[0][0]<=8,('detachedSourceIslandNeedsReview',s['core'],dist[0][0])
  assert len(dist)<2 or dist[0][0]<dist[1][0],('ambiguousSourceIsland',s['core'])
  c=dist[0][1];c['points'].extend(s['points']);c['fragments'].append({'bounds':s['core'],'pixels':s['opaquePixels'],'distance':dist[0][0]});cl,ct,cr,cb=c['core'];c['core']=[min(cl,l),min(ct,t),max(cr,r),max(cb,b)];c['opaquePixels']+=s['opaquePixels']
 cc.sort(key=lambda c:(c['core'][1]+c['core'][3])/2);grid=[sorted(cc[i*columns:(i+1)*columns],key=lambda c:(c['core'][0]+c['core'][2])/2) for i in range(rows)];out=[]
 for row,bodies in enumerate(grid):
  poses=[]
  for col,c in enumerate(bodies):
   core=c['core'];l,t,r,b=core;x0=max(0,l-12);x1=min(w,r+12);y0=max(0,t-12);y1=min(h,b+12);byrow={}
   for x,y in c['points']:byrow.setdefault(y,[]).append(x)
   runs=[]
   for y,xs in sorted(byrow.items()):
    xs=sorted(xs);left=previous=xs[0]
    for x in xs[1:]:
     if x!=previous+1:runs.append([y,left,previous+1]);left=x
     previous=x
    runs.append([y,left,previous+1])
   poses.append({'row':row,'col':col,'rect':[x0,y0,x1-x0,y1-y0],'core':core,'componentRuns':runs,'componentOpaquePixels':c['opaquePixels'],'detachedSourceFragments':c['fragments'],'geometryMethod':'exact whole connected alpha128 body plus retained detached islands; bounding boxes may overlap, opaque bodies never merged or clipped','gutterToNextRow':None if row==rows-1 else grid[row+1][col]['core'][1]-b})
  out.append(poses)
 return out
def bootroot(im,core):
 l,t,r,b=core;h=b-t;bandtop=b-max(5,round(h*.05));bands=spans(proj(mask(im).crop((l,bandtop,r,b)),'x'));bands=[(x,y) for x,y in bands if y-x>=3]
 assert bands,('no boots',core)
 centers=[l+(x+y-1)/2 for x,y in bands]
 return [(centers[0]+centers[-1])/2,b],{'sourceFootBand':[l,bandtop,r-l,b-bandtop],'soleSegments':[[l+x,l+y] for x,y in bands]}
def native(im,cell,root,scale,canvas=(112,112),pivot=(56,104)):
 x,y,w,h=cell['rect'];piece=im.crop((x,y,x+w,y+h))
 if cell.get('componentRuns'):
  cm=Image.new('L',(w,h));draw=ImageDraw.Draw(cm)
  for yy,left,right in cell['componentRuns']:draw.line((left-x,yy-y,right-x-1,yy-y),fill=255)
  from PIL import ImageChops
  piece.putalpha(ImageChops.multiply(piece.getchannel('A'),cm))
 out=piece.transform(tuple(canvas),Image.Transform.AFFINE,(1/scale,0,root[0]-x-pivot[0]/scale,0,1/scale,root[1]-y-pivot[1]/scale),Image.Resampling.NEAREST)
 out.putalpha(out.getchannel('A').point(lambda a:255 if a>=128 else 0));return out
def edges(im):
 a=mask(im);w,h=a.size;return {k:sum(v>0 for v in a.crop(rect).get_flattened_data()) for k,rect in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}
