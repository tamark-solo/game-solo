from pathlib import Path
import shutil,json,hashlib
ROOT=Path(__file__).resolve().parent
history=ROOT/'history/provisional-r0';history.mkdir(parents=True,exist_ok=True)
if not (history/'manual.json').exists():
 shutil.copyfile(ROOT/'manual.json',history/'manual.json')
 for clip,key in [('north-death',3),('north-death',4),('north-death',5),('southeast-meditate',1),('southeast-meditate',2),('southeast-meditate',6)]:
  p=ROOT/'review/poses'/('banner-a-'+clip+'-'+str(key).zfill(2)+'.png');shutil.copyfile(p,history/p.name)
 (history/'assessment.json').write_text(json.dumps({'superseded':True,'selectedForImport':False,
  'reason':'Enlarged marked crop review corrected N death3/5 ivory-cuff proposal centroids to actual fingers, three SE meditation islands merged with hem were corrected to actual joined palms; prone wrist coordinates are disclosed estimates behind sleeve. No source or canonical image was edited.',
  'rawUnchanged':True},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
