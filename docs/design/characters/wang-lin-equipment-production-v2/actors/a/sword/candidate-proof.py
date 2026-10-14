from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def candidates(im):
 # Only candidate markings; a human must visually choose the actual palm per frame.
 w,h=im.size;px=im.load();seen=set();out=[]
 def warm(x,y):
  r,g,b,a=px[x,y];return a>=128 and r>g*1.13 and r>b*1.36 and r>=60
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
def main():
 reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));records={}
 for c in reg['clips']:
  if 'reusedFrom' in c:continue
  tilewidth=c['canvas'][0]*3+48;proof=Image.new('RGBA',(3*tilewidth,((len(c['frames'])+2)//3)*384),(28,33,45,255));draw=ImageDraw.Draw(proof)
  for i,f in enumerate(c['frames']):
   im=Image.open(V2/f['file']).convert('RGBA');cc=candidates(im);records[c['id']+':'+str(i+1)]=cc;ox=(i%3)*tilewidth+24;oy=(i//3)*384+32
   p=Image.new('RGBA',im.size,(28,33,45,255));p.alpha_composite(im);proof.paste(p.resize((im.width*3,336),Image.Resampling.NEAREST),(ox,oy));draw.text((ox,oy-22),c['id']+' key'+str(i+1),fill=(210,220,240))
   for k,q in enumerate(cc):
    x=ox+q['native'][0]*3;y=oy+q['native'][1]*3;draw.ellipse((x-2,y-2,x+2,y+2),outline=(20,230,220),width=1);draw.text((x+3,y-5),str(k),fill=(20,230,220))
  proof.save(ROOT/'contact'/(c['id']+'-candidates.png'))
 (ROOT/'candidate-lookup.json').write_text(json.dumps({'role':'Warm-color source islands are candidate marks only, not hand classifications. Final manual.json choices must be visually confirmed per pose; ivory/gold/face islands must not be claimed as hands.','frames':records},indent=2)+'\n',encoding='utf-8')
 print('candidate contacts',len(records))
if __name__=='__main__':main()
