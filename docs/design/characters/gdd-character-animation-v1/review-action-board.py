"""Join already inspected contacts at native scale for explicit source review.

This creates QA evidence only; it does not alter source pixels, register clips,
or infer an assessment. Missing contacts are labelled rather than fabricated.
"""
from pathlib import Path
import json,sys
from PIL import Image,ImageDraw,ImageFont

R=Path(__file__).resolve().parent
actor,direction=sys.argv[1:3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
brief=next(a for a in read(R/'enemy-production/plan.json')['actors'] if a['actorId']==actor)
jobs={j['id']:j for j in read(R/'generation.json')['jobs']}
selected=[jobs[id] for id in brief['sourceJobs'] if jobs[id]['direction']==direction]
if '--available' in sys.argv[3:]:
 selected=[j for j in selected if (R/'review'/f'{j["id"]}-source-native2x.png').exists()]
if '--unreviewed' in sys.argv[3:]:
 selected=[j for j in selected if not j.get('sourcePackingAllowed')]
assert selected,'No actual contacts available'
cw=max(180,selected[0]['bodyCanvas'][0]+24)
rh=max(140,selected[0]['bodyCanvas'][1]+28)
board=Image.new('RGB',(cw*8,rh*len(selected)+28),(28,37,45))
draw=ImageDraw.Draw(board);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',13)
draw.text((8,5),actor+' / '+direction+' / actual source keys 0..7; QA only',font=font,fill='white')
missing=[]
for row,j in enumerate(selected):
 p=R/'review'/f'{j["id"]}-source-native2x.png'
 inspection=R/'review'/f'{j["id"]}-inspection.json'
 if not p.exists() or not inspection.exists():
  missing.append(j['id']);draw.text((8,row*rh+36),j['actions'][0]+' MISSING',font=font,fill='orange');continue
 report=read(inspection)
 if report['observedRows']!=[4,4,4,4] or report['sourceEdgeRegions']:
  missing.append(j['id']);draw.text((8,row*rh+36),j['actions'][0]+' INVALID LAYOUT/EDGE '+str(report['observedRows']),font=font,fill='orange');continue
 contact=Image.open(p).convert('RGB').resize((cw*4,rh*4+24),Image.Resampling.NEAREST)
 for k in range(8):
  x=(k%4)*cw;y=(2+k//4)*rh
  board.paste(contact.crop((x,y,x+cw,y+rh)),(k*cw,row*rh+28))
out=R/'review'/f'{actor}-{direction}-action-board.png';board.save(out)
print(json.dumps({'file':str(out.resolve()),'sourceJobs':[j['id'] for j in selected],'missing':missing,'sourceReviewInferred':False}))
