"""Scoped neutral registration; no pose fit, paint, mirror or gameplay writes."""
from pathlib import Path
import json,hashlib,statistics,sys
from PIL import Image,ImageDraw,ImageFont
from monster_sheet_tools import support_x
sys.stdout.reconfigure(encoding='utf-8')
W=Path(__file__).resolve().parents[1]; R=W/'docs/design/characters/dark-seal-officer-animation-v1'
P=json.loads((R/'production-plan.json').read_text(encoding='utf-8')); K=json.loads((R/'kit.json').read_text(encoding='utf-8'))
if (R/'approval.json').exists():raise RuntimeError('Approved pack is frozen. Use a new version root.')
if (R/'source-problems.json').exists():
 assert not json.loads((R/'source-problems.json').read_text(encoding='utf-8'))['problems'],'Repair all source problems before packing.'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def save(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
clips={}; masters={}; reg=[]; sources=[]
canvas=P['frameSize']; pivot=P['pivot']
for j in P['jobs']:
 af=R/'generation'/(j['id']+'.analysis.json')
 if not af.exists():continue
 a=json.loads(af.read_text()); assert sha(R/j['source'])==a['sourceSha256']
 rows=[a['frames'][r*6:r*6+6] for r in range(j['rows'])]
 scale=P['bodyHeightPx']/statistics.median(f['sourceRect']['height'] for f in rows[0]); roots=[]; witness=[]
 for f in rows[0]:
  im=Image.open(R/f['file']).convert('RGBA'); mask=im.getchannel('A');l,t,r,b=mask.getbbox();strip=max(2,__import__('math').ceil((b-t)*.08));points=[x for y in range(b-strip,b) for x in range(l,r) if mask.getpixel((x,y))];x=(min(points)+max(points))/2;w=[min(points),b-strip,max(points)+1,b];roots.append(f['sourceRect']['left']+x);witness.append(w)
 floors=[]
 for row,fs in enumerate(rows):
  action='neutral' if row==0 else j['actions'][row-1]
  grounded=[0,5] if action in ['hit','van_nha','appear'] else [0,2,5] if action=='attack' else range(6)
  floors.append(statistics.median(fs[c]['sourceRect']['top']+fs[c]['sourceRect']['height'] for c in grounded))
 mappings=[]
 def extract(row,col):
  f=rows[row][col]; q=f['sourceRect']; im=Image.open(R/f['file']).convert('RGBA'); size=(round(im.width*scale),round(im.height*scale)); im=im.resize(size,Image.Resampling.NEAREST)
  action='neutral' if row==0 else j['actions'][row-1]; floor=floors[row]; method='Fixed action support plane; column root measured from neutral soles.'
  if action=='death' and col>=2:floor=q['top']+q['height'];method='Corpse contact plane, fixed neutral scale and column root.'
  ox=round(pivot[0]+(q['left']-roots[col])*scale);oy=round(pivot[1]+(q['top']-floor)*scale)
  assert ox>=2 and oy>=2 and ox+size[0]<=canvas[0]-2 and oy+size[1]<=canvas[1]-2,(j['id'],row,col,ox,oy,size)
  out=Image.new('RGBA',tuple(canvas));out.alpha_composite(im,(ox,oy)); bounds=out.getchannel('A').getbbox()
  m={**f,'scale':scale,'sourcePivot':[roots[col],floor],'supportMethod':method+' Neutral boot support uses lower8% band; action roots stay fixed to calibrated columns.','nativeOffset':[ox,oy],'bounds':list(bounds),'liftPx':0,'rgbPainted':False}
  mappings.append(m);return out,m
 for col in range(6):
  im,m=extract(0,col);file=f"calibration/{j['id']}/{col+1:02}.png";(R/file).parent.mkdir(parents=True,exist_ok=True);im.save(R/file)
  if col==0:
   masters[j['id']]={'file':file,'sha256':sha(R/file),'frameSize':canvas,'pivot':pivot,'bounds':m['bounds'],'direction':j['direction']}
   # Mechanical same-view input, not a new identity.
   crop=im.crop((max(0,m['bounds'][0]-8),max(0,m['bounds'][1]-8),min(canvas[0],m['bounds'][2]+8),min(canvas[1],m['bounds'][3]+8)))
   crop.resize((crop.width*6,crop.height*6),Image.Resampling.NEAREST).save(R/'inputs'/('neutral-'+j['direction']+'-6x.png')) if j['group']=='base' else None
 for row,action in enumerate(j['actions'],1):
  id=action+'-'+j['direction']; atlas=Image.new('RGBA',((canvas[0]+4)*6,canvas[1]+4)); frames=[]
  for col in range(6):
   im,m=extract(row,col);file=f'frames/{id}/{col+1:03}.png';(R/file).parent.mkdir(parents=True,exist_ok=True);im.save(R/file);rect={'x':2+col*(canvas[0]+4),'y':2,'w':canvas[0],'h':canvas[1]};atlas.alpha_composite(im,(rect['x'],rect['y']));frames.append({'file':file,'sha256':sha(R/file),'rect':rect,'bounds':m['bounds'],'liftPx':0,'sourceMapping':len(mappings)-1})
  file='atlases/'+id+'.png';atlas.save(R/file)
  dur=K['skills'][action]['durations'] if action in K['skills'] else {'idle':[6]*6,'move':[3]*6,'hit':[2,2,3,2,3,2],'death':[3,3,4,4,5,8],'appear':[8,8,8,5,7,8]}[action]
  phases=[{'at':0,'label':action}]
  if action in K['skills']:
   k=K['skills'][action];phases=[{'at':0,'label':'Báo đòn'},{'at':k['lockTick']*1000/24,'label':'Đã khóa hướng'},{'at':k['releaseTick']*1000/24,'label':'Phát chiêu'},{'at':k['resolveTick']*1000/24,'label':'Hồi thế'}]
  clips[id]={'id':id,'actor':P['actor'],'action':action,'direction':j['direction'],'frameSize':canvas,'pivot':pivot,'frames':frames,'atlas':file,'atlasSize':list(atlas.size),'atlasSha256':sha(R/file),'fps':24,'durations':dur,'phases':phases,'loop':action in ['idle','move'],'holdLast':action=='death','uniqueFrames':len({f['sha256'] for f in frames}),'registrationSource':j['id'],'artApproved':False,'runtimeImplemented':False}
 reg.append({'id':j['id'],'direction':j['direction'],'scale':scale,'scaleBasis':'One median-neutral scale for every pose of this source','columnRoots':roots,'supportWitnesses':witness,'actionSupportPlanes':floors,'frames':mappings,'mirrored':False,'sourceSha256':a['sourceSha256']})
 sources.append({'id':j['id'],'file':j['source'],'sha256':sha(R/j['source']),'prompt':j['prompt'],'promptSha256':sha(R/j['prompt']),'inputs':[{'file':p,'sha256':sha(W/p)} for p in j['references']],'sourceSize':a['sourceSize']})
required=[a+'-'+d for a in P['actions'] for d in P['directions']]; missing=[x for x in required if x not in clips]
save(R/'catalog.json',{'id':P['id'],'date':P['date'],'actor':P['actor'],'name':P['name'],'status':'candidate-motion-review' if not missing else 'production-in-progress','artApproved':False,'ownerApproved':False,'runtimeConsumable':False,'directions':P['directions'],'actions':P['actions'],'bodyHeightPx':80,'frameSize':canvas,'pivot':pivot,'clips':clips,'masters':masters,'sources':sources,'coverage':{'required':required,'missing':missing,'clips':len(clips),'poses':len(clips)*6},'kit':'kit.json','basis':'basis.json'})
save(R/'source-registration.json',{'registration':reg,'rgbPainted':False,'perPoseFit':False,'artApproved':False})
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',16); board=Image.new('RGB',(1920,(len(P['actions'])+1)*140+35),'#28332e');draw=ImageDraw.Draw(board)
for col,d in enumerate(P['directions']):draw.text((100+col*225,8),d,font=font,fill='#e4dbc5')
for row,action in enumerate(['neutral']+P['actions']):
 y=35+(row+1)*140-12;draw.text((6,y-70),action,font=font,fill='#e4dbc5');draw.line((0,y,1920,y),fill='#68776c')
 for col,d in enumerate(P['directions']):
  id=action+'-'+d
  if action=='neutral':m=masters.get('base-'+d);file=m['file'] if m else None
  else:c=clips.get(id);file=c['frames'][3 if action=='move' or action in K['skills'] else 5 if action=='death' else 0]['file'] if c else None
  if file:im=Image.open(R/file);board.paste(im,(110+col*225+105-pivot[0],y-pivot[1]),im)
board.save(R/'review/native-matrix.png')
print(json.dumps({'clips':len(clips),'poses':len(clips)*6,'missing':len(missing),'sources':len(sources)},ensure_ascii=False))
