from pathlib import Path
from PIL import Image,ImageDraw
import importlib.util,json,statistics,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[6]
spec=importlib.util.spec_from_file_location('v1_tools_readonly',REPO/'docs/design/characters/wang-lin-equipment-production-v1/motion-pack.py')
v1=importlib.util.module_from_spec(spec);spec.loader.exec_module(v1)

def main():
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));items=[]
 for r in gen['records']:
  path=ROOT/'sources'/f"{r['id']}.png"
  if not path.exists():continue
  im=Image.open(path).convert('RGBA');grid=v1.cells_for(im)
  assert len(grid)==5 and all(len(row)==6 for row in grid),r['id']
  edge=v1.edge_count(im);heights=[c['coreBounds'][3]-c['coreBounds'][1] for c in grid[0]]
  item={'id':r['id'],'size':list(im.size),'edges':edge,'grid':grid,'heights':heights,'scale':80/statistics.median(heights),'vividOpaque':v1.vivid_count(im)};items.append(item)
  chart=im.copy();draw=ImageDraw.Draw(chart)
  for row,cs in enumerate(grid):
   for col,c in enumerate(cs):
    x,y,w,h=c['rect'];draw.rectangle((x,y,x+w-1,y+h-1),outline=(90,180,120,255));draw.text((x+3,y+3),f'{row}/{col}',fill=(255,210,60,255))
    draw.rectangle(tuple(c['coreBounds']),outline=(180,140,70,255))
  bg=Image.new('RGBA',im.size,(25,34,42,255));bg.alpha_composite(chart);bg.save(ROOT/f"review/{r['id']}-source-cells.png")
  print(json.dumps({k:item[k] for k in ('id','size','edges','heights','scale','vividOpaque')}))
 (ROOT/'source-analysis.json').write_text(json.dumps({'items':items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':main()
