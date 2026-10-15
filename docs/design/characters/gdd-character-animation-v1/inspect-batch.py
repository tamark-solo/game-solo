"""Make native review contacts from complete raw regions; no active publication."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import statistics,json,sys,hashlib
from source_tools import components,rows_of,isolated_pose,boot_proposal,isolated_soft_pose
from soft_extent import bounded_soft_pose
from reviewed_layout import wide_layout_matches
R=Path(__file__).resolve().parent;ledger=json.loads((R/'generation.json').read_text(encoding='utf-8'));font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',12)
for id in sys.argv[1:]:
 j=next(j for j in ledger['jobs'] if j['id']==id);im=Image.open(R/j['source']).convert('RGBA');regions=components(im);large=[p for p in regions if p['large']];cols,nrows=j.get('observedGrid',j['grid']);rows=rows_of(large,nrows,im.height);calrows=2 if j.get('calibrationPoses')==8 else 1
 report={'id':id,'sha256':hashlib.sha256((R/j['source']).read_bytes()).hexdigest(),'largeRegions':len(large),'observedRows':[len(row) for row in rows],'expectedGrid':[cols,nrows],'sourceEdgeRegions':[p['box'] for p in large if p['box'][0]<=0 or p['box'][1]<=0 or p['box'][2]>=im.width or p['box'][3]>=im.height],'sourceViewed':False,'ownerApprovalInferred':False}
 if len(rows)==nrows and all(len(row)==cols for row in rows[:calrows]):
  cal=[p for row in rows[:calrows] for p in row];factor=j['bodyNominalPx']/statistics.mean(p['box'][3]-p['box'][1] for p in cal);report['oneScale']=factor
  cell_width=max(180,j.get('bodyCanvas',[0,0])[0]+24);row_height=max(140,j.get('bodyCanvas',[0,0])[1]+28)
  display_cols=max(len(row) for row in rows) if j.get('sourceLayoutWitness') and wide_layout_matches(j,rows) else cols
  board=Image.new('RGBA',(display_cols*cell_width,nrows*row_height+24),(28,37,45,255));draw=ImageDraw.Draw(board);draw.text((8,5),id,font=font,fill=(230,220,190))
  for row_index,row in enumerate(rows):
   for col,region in enumerate(row):
    if col>=display_cols:continue
    soft=j.get('alphaPolicy')=='preserved-soft-RGBA';pose,box=(bounded_soft_pose(im,region,regions,factor) if j.get('softExtentPolicy')=='alpha8-body-plus-native3px-original-rgba' else isolated_soft_pose(im,region,regions)) if soft else isolated_pose(im,region,regions);proposal=boot_proposal(im,box)
    if row_index<calrows:label='neutral';index=col
    elif calrows==2:label=j['actions'][0];index=sum(len(r) for r in rows[calrows:row_index])+col
    else:label=j['actions'][row_index-calrows];index=col
    if soft:
     cx=cal[index%len(cal)]['box'];root=[(cx[0]+cx[2])/2,max(p['box'][3] for p in row)+4/factor]
    elif label=='death' and index>=1 or label=='meditate' and index>=2:root=[boot_proposal(im,cal[index%len(cal)]['box'])['root'][0],box[3]]
    else:root=proposal['root']
    if root[0] is None:continue
    if label=='run':root=[root[0],max(boot_proposal(im,p['box'])['root'][1] or p['box'][3] for p in row)]
    floor=(row_index+1)*row_height-4
    scaled=pose.resize((max(1,round(pose.width*factor)),max(1,round(pose.height*factor))),Image.Resampling.NEAREST);x=col*cell_width+cell_width//2-round((root[0]-box[0])*factor);y=floor-round((root[1]-box[1])*factor)
    board.alpha_composite(scaled,(x,y));draw.line((col*cell_width+3,floor,(col+1)*cell_width-3,floor),fill=(76,111,122));draw.text((col*cell_width+4,row_index*row_height+26),label+' '+str(index),font=font,fill=(185,196,198))
  contact=R/'review'/f'{id}-source-native2x.png';board.resize((board.width*2,board.height*2),Image.Resampling.NEAREST).save(contact);report['contact']=contact.relative_to(R).as_posix()
 (R/'review'/f'{id}-inspection.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
