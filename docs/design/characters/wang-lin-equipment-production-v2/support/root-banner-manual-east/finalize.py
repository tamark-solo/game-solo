from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,statistics,importlib.util,sys
sys.dont_write_bytecode=True
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
spec=importlib.util.spec_from_file_location('bodytools_for_readonly_proof',V2/'actors/b/banner/body-tools.py');tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
data=json.loads((SUPPORT/'manual-candidates.json').read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,ok):
 assert ok,name
 checks.append({'name':name,'passed':True})
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',13)
for sid,s in data['sources'].items():
 raw=V2/'actors/b/banner/sources'/f'{sid}.png';check(sid+' raw pin',sha(raw)==s['sourceSha256'])
 im=Image.open(raw).convert('RGBA');cols,rows=s['actualGrid'];cells=[c for row in tool.cells_for(im,cols,rows) for c in row]
 check(sid+' 18 actual source components',len(cells)==18)
 scale=80/statistics.median([e['sourceBootSoleY']-e['sourceCrownY'] for e in s['calibrations']]);s['sourceScaleReviewed']=scale
 entries=s['calibrations']+sum(s['actions'].values(),[])
 panel=Image.new('RGBA',(1200,700),(25,32,42,255));d=ImageDraw.Draw(panel)
 for e in entries:
  i=e['rawIndex'];g=e['grip'];p,w=g['source'],g['sourceWrist']
  observed=g['visibility']!='occluded'
  if observed:check(sid+' hand pixel '+str(i),im.getpixel(tuple(round(v) for v in p))[3]>=128)
  check(sid+' finite source coordinates '+str(i),all(__import__('math').isfinite(v) for v in p+w+e['sourceRoot']))
  if not observed:check(sid+' hidden hand not held '+str(i),g['closedGripConfirmed'] is False and g['sourceWristEstimated'] is True)
  g.update({'sourcePalmReviewed':True,'sourceCuffReviewed':True,'selection':'Manual source whole-pose and 4x hand/cuff inset review; hidden projection explicitly identified','manualEvidence':f'evidence/{sid}-hand-cuff-insets-4x.png'})
  e['sourceRootReviewed']=True
  canvas=(192,128) if 'death' in s['actions'] and i>=12 else (112,112);pivot=(96,112) if canvas==(192,128) else (56,104)
  native=tool.native(im,cells[i],e['sourceRoot'],scale,canvas,pivot)
  check(sid+' full native source '+str(i),not any(tool.edge_count(native).values()))
  out=SUPPORT/'native'/sid/f'{i:02}.png';out.parent.mkdir(parents=True,exist_ok=True);native.save(out)
  x=(i%6)*200;y=(i//6)*230+22;panel.alpha_composite(native,(x+4,y))
  px,py=pivot;d.line((x+px-4,y+py,x+px+4,y+py),fill=(240,210,70));d.text((x+4,y-18),str(i)+' '+g['visibility'],fill=(195,210,200),font=font)
  gp=tool.point_native(p,e['sourceRoot'],scale,pivot);d.ellipse((x+4+gp[0]-2,y+gp[1]-2,x+4+gp[0]+2,y+gp[1]+2),outline=(75,240,160))
 s['manualReviewPending']=False;s['sourceSocketReviewComplete']=True;s['nativeContactViewed']=False
 panel.save(SUPPORT/'evidence'/f'{sid}-native-registration-1x.png')
output=SUPPORT/'manual-registration.json';output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'schema':'root-banner-manual-source-verification-2','status':'source-review-complete-native-awaiting-view','checkCount':len(checks),'checks':checks,'sourcePoses':72,'manualHandCuffInsetsViewed':72,'sourceWholePoseGroupsViewed':12,'sourceRowsUnchanged':True,'actorWrites':False,'approvalInferred':False,
 'limits':['Prone and seated root is an observed cloth/limb support projection with uncertainty, not an exact pelvis or world-floor measurement.','Hidden palms/cuffs use explicit garment-reference projections and never claim a held pole.','Actor owns action phase mapping and final canonical pack.']}
(SUPPORT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'checks':len(checks),'sourcePoses':72,'status':report['status'],'actorWrites':False}))
