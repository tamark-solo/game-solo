"""Make native, ground-aligned limb inspection boards from actual clip pixels."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json, sys
R=Path(__file__).resolve().parent
manifest=json.loads((R/'manifest.json').read_text(encoding='utf-8'))
out=R/'review/limb-audit-v1';out.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',12)
actions=['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe']
records=[]
for actor in sorted({c['actorId'] for c in manifest['clips']}):
 for direction in sorted({c['direction'] for c in manifest['clips'] if c['actorId']==actor}):
  clips=[c for c in manifest['clips'] if c['actorId']==actor and c['direction']==direction]
  board=Image.new('RGBA',(6*192,8*132+30),(28,37,45,255));draw=ImageDraw.Draw(board)
  draw.text((8,7),actor+' / '+direction,font=font,fill=(234,222,198))
  for row,action in enumerate(actions):
   clip=next((c for c in clips if c['action']==action),None)
   for col in range(6):
    x=col*192;y=row*132+30
    draw.text((x+5,y+3),action+' '+str(col+1),font=font,fill=(169,188,193))
    draw.line((x+4,y+112,x+188,y+112),fill=(76,111,122))
    draw.line((x+96,y+108,x+96,y+116),fill=(100,160,174))
    if not clip or col>=len(clip['frames']):continue
    f=clip['frames'][col];image=Image.open(R/f['file']).convert('RGBA')
    board.alpha_composite(image,(x+96-f['pivot'][0],y+112-f['pivot'][1]))
    draw.text((x+5,y+117),'src '+str(f['sourcePoseIndex'])+'  lift '+str(round(f['bodyLiftNativePx'],1)),font=font,fill=(186,172,145))
  path=out/f'{actor}-{direction}-2x.png';board.resize((board.width*2,board.height*2),Image.Resampling.NEAREST).save(path)
  records.append({'actorId':actor,'direction':direction,'file':path.relative_to(R).as_posix(),'bodyClips':len(clips),'bodyKeys':sum(len(c['frames']) for c in clips),'manualLimbReview':'pending'})
proposals=[]
for c in manifest['clips']:
 for f in c['frames']:
  if c['action'] in ['idle','run','hit','gather','cast-single-target','cast-aoe']:
   groups=f['bootWitnessProposal']['groups'];proposals.append({'clipId':c['id'],'key':f['index'],'visibleSupportClusters':len(groups),'root':f['sourceRoot'],'supportKind':f['supportKind'],'lift':f['bodyLiftNativePx'],'nativeBottomDelta':f['bounds'][3]-f['pivot'][1]})
report={'status':'audit-in-progress','scope':'All produced main entry/future clips, hands and feet; no ART approval inferred','manifestSha256':hashlib.sha256((R/'manifest.json').read_bytes()).hexdigest(),'coverage':manifest['coverage'],'boards':records,'supportProposals':proposals,'notes':['Cluster counts are inspection candidates, not proof of foot anatomy.','Blue line is proposed world ground; no extra lift is applied in these boards.','No source pixels are painted, mirrored or fitted per pose.']}
(out/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for id in sys.argv[1:]:
 clip=next(c for c in manifest['clips'] if c['id']==id)
 tile_w=max(clip['canvas'][0]+16,144);tile_h=clip['canvas'][1]+28
 board=Image.new('RGBA',(tile_w*2,tile_h*3),(28,37,45,255));draw=ImageDraw.Draw(board)
 for i,f in enumerate(clip['frames']):
  x=(i%2)*tile_w;y=(i//2)*tile_h
  draw.text((x+4,y+4),'key '+str(i)+' / source '+str(f['sourcePoseIndex']),font=font,fill=(220,215,193))
  board.alpha_composite(Image.open(R/f['file']).convert('RGBA'),(x+(tile_w-clip['canvas'][0])//2,y+20))
  draw.line((x+4,y+20+f['pivot'][1],x+tile_w-4,y+20+f['pivot'][1]),fill=(75,122,137))
 board.resize((board.width*4,board.height*4),Image.Resampling.NEAREST).save(out/(id+'-detail4x.png'))
print(json.dumps({'boards':len(records),'clips':len(manifest['clips']),'keys':manifest['coverage']['bodyKeys']}))
