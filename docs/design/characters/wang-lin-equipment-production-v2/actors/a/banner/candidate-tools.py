from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def candidates(im):
 # Only candidate markings; a human must visually choose the actual palm per frame.
 w,h=im.size;px=im.load();seen=set();out=[]
 def warm(x,y):
  r,g,b,a=px[x,y];return a>=128 and r>=150 and g>=85 and b>=45 and r-g>15 and g-b>10
 for y in range(h):
  for x in range(w):
   if (x,y) in seen or not warm(x,y):continue
   q=deque([(x,y)]);seen.add((x,y));points=[]
   while q:
    cx,cy=q.popleft();points.append((cx,cy))
    for nx,ny in ((cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1)):
     if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and warm(nx,ny):seen.add((nx,ny));q.append((nx,ny))
   if len(points)<2:continue
   out.append({'native':[round(sum(x for x,y in points)/len(points),2),round(sum(y for x,y in points)/len(points),2)],'pixels':len(points),'rect':[min(x for x,y in points),min(y for x,y in points),max(x for x,y in points)-min(x for x,y in points)+1,max(y for x,y in points)-min(y for x,y in points)+1]})
 return out
