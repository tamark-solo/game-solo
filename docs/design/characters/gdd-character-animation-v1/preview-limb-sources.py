"""Register candidate gait sheets for visual inspection before active replacement."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,statistics,sys
from source_tools import components,rows_of,isolated_pose,boot_proposal
R=Path(__file__).resolve().parent
ledger=json.loads((R/'generation.json').read_text(encoding='utf-8'))
out=R/'review/limb-audit-v1/candidates';out.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',12)
for id in sys.argv[1:]:
 job=next(j for j in ledger['jobs'] if j['id']==id)
 im=Image.open(R/job['source']).convert('RGBA');regions=components(im);large=[p for p in regions if p['large']]
 cols,nrows=job['grid'];rows=rows_of(large,nrows,im.height);assert all(len(r)==cols for r in rows)
 calrows=2 if job.get('calibrationPoses')==8 else 1
 calibration=[p for row in rows[:calrows] for p in row]
 actionrows=rows[calrows:];poses=[p for row in actionrows for p in row]
 factor=80/statistics.mean(p['box'][3]-p['box'][1] for p in calibration)
 board=Image.new('RGBA',(6*144,148),(28,37,45,255));draw=ImageDraw.Draw(board)
 records=[]
 for i,reg in enumerate(poses[:6]):
  pose,box=isolated_pose(im,reg,regions);proposal=boot_proposal(im,box)
  floor=max(boot_proposal(im,p['box'])['root'][1] for p in actionrows[i//cols]) if job['actions']==['run'] else proposal['root'][1]
  root=[proposal['root'][0],floor]
  native=Image.new('RGBA',(112,112));scaled=pose.resize((round(pose.width*factor),round(pose.height*factor)),Image.Resampling.NEAREST)
  offset=[round(56-(root[0]-box[0])*factor),round(104-(root[1]-box[1])*factor)]
  assert min(offset)>=0 and offset[0]+scaled.width<=112 and offset[1]+scaled.height<=112
  native.paste(scaled,tuple(offset));folder=out/id;folder.mkdir(exist_ok=True);native.save(folder/f'{i:02d}.png')
  board.alpha_composite(native,(i*144+16,16));draw.line((i*144+3,120,i*144+141,120),fill=(75,122,137));draw.text((i*144+5,129),str(i+1),font=font,fill=(240,220,180))
  records.append({'sourceRect':box,'rootProposal':proposal,'registeredRoot':root,'lift':(floor-proposal['root'][1])*factor})
 board.resize((board.width*3,board.height*3),Image.Resampling.NEAREST).save(out/f'{id}-3x.png')
 (out/f'{id}.json').write_text(json.dumps({'id':id,'oneScale':factor,'keys':records,'status':'candidate-not-active'},indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'id':id,'scale':factor,'regions':len(large)}))
