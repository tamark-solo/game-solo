from pathlib import Path
from PIL import Image
import json,statistics,math,hashlib

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bands(values):
 out=[];start=None
 for i,v in enumerate(values+[0]):
  if v and start is None:start=i
  elif not v and start is not None:out.append((start,i));start=None
 return out
def edge_count(im):
 a=im.getchannel('A').point(lambda v:255 if v>=128 else 0);w,h=im.size
 return {n:sum(v>0 for v in a.crop(box).getdata()) for n,box in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}
def vivid_count(im):return sum(1 for r,g,b,a in im.getdata() if a>=128 and ((r>200 and b>160 and g<110) or (b>200 and r<110 and g<110) or (r>230 and g<80 and b<80)))

def components(mask,w,h):
 data=bytearray(mask);out=[]
 for start in range(w*h):
  if not data[start]:continue
  data[start]=0;todo=[start];points=[]
  while todo:
   p=todo.pop();points.append(p);x=p%w
   for q in ((p-1 if x else -1),(p+1 if x<w-1 else -1),p-w,p+w):
    if 0<=q<w*h and data[q]:data[q]=0;todo.append(q)
  xs=[p%w for p in points];ys=[p//w for p in points]
  out.append({'points':points,'area':len(points),'bounds':[min(xs),min(ys),max(xs)+1,max(ys)+1],'center':[sum(xs)/len(xs),sum(ys)/len(ys)]})
 return out

def cells_for(im,columns,rows):
 w,h=im.size;alpha=im.getchannel('A').point(lambda v:255 if v>=128 else 0);raw=alpha.tobytes()
 ys=bands([any(raw[y*w:(y+1)*w]) for y in range(h)])
 assert len(ys)==rows,('raw rows',rows,len(ys),ys)
 result=[]
 for row,(top,bottom) in enumerate(ys):
  mask=alpha.crop((0,top,w,bottom));cs=components(mask.tobytes(),w,bottom-top)
  large=sorted([c for c in cs if c['area']>=500],key=lambda c:c['center'][0])
  expected=columns[row] if isinstance(columns,list) else columns
  assert len(large)==expected,('connected bodies',row,expected,[(c['area'],c['bounds']) for c in large])
  owners=[list(c['points']) for c in large]
  for c in cs:
   if c['area']>=500:continue
   def distance(main):
    l,t,r,b=main['bounds'];cx,cy=c['center'];return max(l-cx,0,cx-r)**2+max(t-cy,0,cy-b)**2
   index=min(range(len(large)),key=lambda n:distance(large[n]));owners[index].extend(c['points'])
  rowcells=[]
  for col,points in enumerate(owners):
   xs=[p%w for p in points];py=[p//w+top for p in points];bounds=[min(xs),min(py),max(xs)+1,max(py)+1]
   l,t,r,b=bounds;rect=[max(0,l-2),max(0,t-2),min(w,r+2)-max(0,l-2),min(h,b+2)-max(0,t-2)]
   part=Image.new('L',(rect[2],rect[3]),0);pixels=part.load()
   for x,y in zip(xs,py):pixels[x-rect[0],y-rect[1]]=255
   rowcells.append({'row':row,'col':col,'rect':rect,'coreBounds':bounds,'part':part,'ownership':'full actual connected body plus each opaque disconnected fragment assigned to nearest same-row body bounds; inspected per-cell, no per-pose paint','opaquePixels':len(points),'rawRowBand':[top,bottom]})
  result.append(rowcells)
 return result

def warm_components(im,cell):
 x,y,w,h=cell['rect'];crop=im.crop((x,y,x+w,y+h)).convert('RGBA');part=cell['part'];mask=[]
 for (r,g,b,a),owned in zip(crop.getdata(),part.getdata()):mask.append(255 if owned and a>=128 and r>175 and g>100 and b>65 and 25<r-g<100 and r-b>60 and g-b>20 else 0)
 out=[]
 for c in components(bytes(mask),w,h):
  if c['area']<7:continue
  l,t,r,b=c['bounds'];out.append({'area':c['area'],'center':[round(x+c['center'][0],3),round(y+c['center'][1],3)],'rect':[x+l,y+t,r-l,b-t]})
 return sorted(out,key=lambda c:-c['area'])

def sole_anchor(im,cell):
 l,t,r,b=cell['coreBounds'];height=b-t;bandtop=b-max(6,round(height*.045));part=cell['part'];x,y,w,h=cell['rect'];p=part.crop((l-x,bandtop-y,r-x,b-y));pw,ph=p.size
 xs=bands([any(p.getpixel((u,v)) for v in range(ph)) for u in range(pw)]);xs=[pair for pair in xs if pair[1]-pair[0]>=3]
 assert xs,('No boot/floor contact',cell['row'],cell['col'])
 centers=[l+(a+z-1)/2 for a,z in xs];root=[(centers[0]+centers[-1])/2,b]
 return root,{'method':'actual lower4.5% sole/contact projection, manually inspected against dark human boot soles for standing/run; kneeling/seated use supported floor contact; prone has separate manually selected dark-boot endpoint measurement','bandRect':[l,bandtop,r-l,b-bandtop],'projectionRuns':[[l+a,l+z] for a,z in xs]}

def prone_boot_anchor(im,cell,side):
 l,t,r,b=cell['coreBounds'];width=r-l
 x0=l if side=='left' else r-round(width*.24);x1=l+round(width*.24) if side=='left' else r
 points=[]
 for y in range(t,b):
  for x in range(x0,x1):
   rr,g,bb,a=im.getpixel((x,y))
   if a>=128 and max(rr,g,bb)<135 and max(rr,g,bb)-min(rr,g,bb)<70:points.append((x,y))
 assert len(points)>20,('No actual dark boot ROI in selected corpse endpoint',side,cell['row'],cell['col'])
 bottom=max(y for x,y in points)+1;last=[x for x,y in points if y>=bottom-3]
 root=[(min(last)+max(last))/2,bottom]
 return root,{'method':'manually selected actual dark-boot side in own prone source, measured opaque charcoal boot-sole pixels within endpoint ROI; excludes ivory hem and silver hair, no bbox fit','manualBootSideSelected':True,'bootSide':side,'sourceRoi':[x0,t,x1-x0,b-t],'solePixelBand':[min(last),bottom-3,max(last)-min(last)+1,3],'opaqueDarkBootPixels':len(points),'manualCandidate':False}

def native(im,cell,root,scale,canvas=(112,112),pivot=(56,104)):
 x,y,w,h=cell['rect'];crop=im.crop((x,y,x+w,y+h)).copy();crop.putalpha(cell['part'])
 inv=(1/scale,0,root[0]-x-pivot[0]/scale,0,1/scale,root[1]-y-pivot[1]/scale)
 result=crop.transform(canvas,Image.Transform.AFFINE,inv,Image.Resampling.NEAREST);result.putalpha(result.getchannel('A').point(lambda a:255 if a>=128 else 0));return result

def point_native(point,root,scale,pivot=(56,104)):return [round(pivot[0]+(point[0]-root[0])*scale,3),round(pivot[1]+(point[1]-root[1])*scale,3)]
