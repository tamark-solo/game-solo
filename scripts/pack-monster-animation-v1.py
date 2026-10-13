"""Register measured creature sheets with a single neutral scale per source.

New version only. No RGB repaint, per-pose fit, mirroring or animation synthesis.
"""
from pathlib import Path
import hashlib,json,statistics,sys
from PIL import Image,ImageDraw,ImageFont
from monster_sheet_tools import support_x
WORKSPACE=Path(__file__).resolve().parents[1]
ROOT=WORKSPACE/'docs/design/characters/van-hai-monster-animation-v1'
PLAN=json.loads((ROOT/'production-plan.json').read_text(encoding='utf-8'))
ACTORS={a['id']:a for a in PLAN['actors']}
ACTIONS=['idle','move','attack','hit','death']
def sha(file):return hashlib.sha256(Path(file).read_bytes()).hexdigest()
def write(file,data):Path(file).parent.mkdir(parents=True,exist_ok=True);Path(file).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def font(size,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),size)
all_clips={};registrations=[];sources=[];masters={};warnings=[]
for job in PLAN['jobs']:
    af=ROOT/'generation'/f"{job['id']}.analysis.json"
    if not af.exists():continue
    analysis=json.loads(af.read_text(encoding='utf-8'));a=ACTORS[job['actor']]
    if not (ROOT/job['source']).exists() or sha(ROOT/job['source'])!=analysis['sourceSha256']:continue
    frames=analysis['frames'];neutral=frames[:6]
    scale=a['bodyHeightPx']/statistics.median(f['sourceRect']['height'] for f in neutral)
    roots=[];supports=[]
    for f in neutral:
        im=Image.open(ROOT/f['file']).convert('RGBA');bounds=im.getchannel('A').getbbox()
        x,witness=support_x(im.getchannel('A'),bounds)
        roots.append(f['sourceRect']['left']+x);supports.append(witness)
    rows=[frames[i*6:(i+1)*6] for i in range(6)]
    floors=[]
    for row,values in enumerate(rows):
        grounded=[0,2,5] if row==3 else [0,5] if row==4 else range(6)
        floors.append(statistics.median(values[i]['sourceRect']['top']+values[i]['sourceRect']['height'] for i in grounded))
    # Choose one padded contract for ALL actions/directions of this actor. A
    # larger canvas is padding only and cannot alter source/body scale.
    canvas=[a['canvas'][0]+96,a['canvas'][1]+32];pivot=[a['pivot'][0]+48,a['pivot'][1]+16]
    mappings=[]
    def extract(row,col):
        f=rows[row][col];rect=f['sourceRect'];im=Image.open(ROOT/f['file']).convert('RGBA')
        size=[max(1,round(im.width*scale)),max(1,round(im.height*scale))]
        native=im.resize(tuple(size),Image.Resampling.NEAREST)
        floor=floors[row];ground_method='Fixed row support plane from planted calibration / ready and recovery; airborne pose is not recentered.'
        # Explicit corpse support plane; once lying, the floor is torso/ribbon
        # contact, not the boot rule or the center of the short corpse bbox.
        if row==5 and col>=2:
            floor=rect['top']+rect['height'];ground_method='Fallen body contact plane; same scale and column world-root, no height normalization.'
        ox=round(pivot[0]+(rect['left']-roots[col])*scale)
        oy=round(pivot[1]+(rect['top']-floor)*scale)
        if row==5 and col>=2:oy=pivot[1]-native.getchannel('A').getbbox()[3]
        if not(ox>=2 and oy>=2 and ox+size[0]<=canvas[0]-2 and oy+size[1]<=canvas[1]-2):
            raise ValueError(f"{job['id']} {row}/{col}: padded contract overflow {ox,oy,size,canvas}; do not resize the pose")
        out=Image.new('RGBA',tuple(canvas));out.alpha_composite(native,(ox,oy));bounds=out.getchannel('A').getbbox()
        lift=a['liftPx']
        if row==5 and lift:lift=([16,12,7,2,0,0] if a['slug']=='ink-bat' else [8,5,2,0,0,0])[col]
        elif row==2 and lift:lift+=([0,1,2,1,0,-1][col])
        mapping={**f,'scale':scale,'sourcePivot':[roots[col],floor],'supportMethod':ground_method,
                 'nativeOffset':[ox,oy],'bounds':list(bounds),'liftPx':lift,'pixelsResampled':True}
        mappings.append(mapping);return out,mapping
    for col in range(6):
        im,m=extract(0,col);file=f"calibration/{job['id']}/{col+1:02}.png";(ROOT/file).parent.mkdir(parents=True,exist_ok=True);im.save(ROOT/file)
        if col==0:masters[job['id']]={'file':file,'sha256':sha(ROOT/file),'frameSize':canvas,'pivot':pivot,'bounds':m['bounds'],'direction':job['direction'],'actor':a['id']}
    for row,action in enumerate(ACTIONS,1):
        id=a['slug']+'-'+action+'-'+job['direction'];folder=ROOT/'frames'/id;folder.mkdir(parents=True,exist_ok=True)
        canonical=[];atlas=Image.new('RGBA',((canvas[0]+4)*6,canvas[1]+4))
        for col in range(6):
            im,m=extract(row,col);file=f"frames/{id}/{col+1:03}.png";im.save(ROOT/file)
            rect={'x':2+col*(canvas[0]+4),'y':2,'w':canvas[0],'h':canvas[1]};atlas.alpha_composite(im,(rect['x'],rect['y']))
            canonical.append({'file':file,'sha256':sha(ROOT/file),'rect':rect,'bounds':m['bounds'],'liftPx':m['liftPx'],'sourceMapping':len(mappings)-1})
        afile='atlases/'+id+'.png';(ROOT/'atlases').mkdir(exist_ok=True);atlas.save(ROOT/afile)
        durations={'idle':[6]*6,'move':[3]*6,'attack':[4,4,3,2,3,4],'hit':[1,1,2,1,2,1],'death':[2,2,3,3,4,6]}[action]
        if action=='attack' and a['rank']=='elite':durations=[5,5,4,2,4,5]
        phases=[{'at':0,'label':action}]
        if action=='attack':phases=[{'at':0,'label':'ready'},{'at':durations[0]*1000/24,'label':'warning'},{'at':sum(durations[:3])*1000/24,'label':'release'},{'at':sum(durations[:4])*1000/24,'label':'recovery'}]
        all_clips[id]={'id':id,'actor':a['id'],'slug':a['slug'],'action':action,'direction':job['direction'],
            'frameSize':canvas,'pivot':pivot,'frames':canonical,'atlas':afile,'atlasSize':list(atlas.size),'atlasSha256':sha(ROOT/afile),
            'fps':24,'durations':durations,'phases':phases,'loop':action in ['idle','move'],'holdLast':action=='death',
            'uniqueFrames':len({f['sha256'] for f in canonical}),'registrationSource':job['id'],
            'artApproved':False,'runtimeImplemented':False,'gameplayTimingApproved':False,'origin':'new-imagegen'}
    neutral_heights=[m['bounds'][3]-m['bounds'][1] for m in mappings[:6]]
    if max(neutral_heights)-min(neutral_heights)>max(4,a['bodyHeightPx']*.10):warnings.append(job['id']+': neutral size variation needs visual review')
    registrations.append({'id':job['id'],'actor':a['id'],'direction':job['direction'],'scale':scale,'scaleBasis':'Median of six neutral bodies, one scale for all five actions',
      'neutralSourceHeights':[f['sourceRect']['height'] for f in neutral],'neutralNativeHeights':neutral_heights,'neutralSupportWitnesses':supports,
      'columnRoots':roots,'actionSupportPlanes':floors,'frameSize':canvas,'pivot':pivot,'frames':mappings,'mirrored':False,'source':analysis['source'],'sourceSha256':analysis['sourceSha256']})
    sources.append({'id':job['id'],'actor':job['actor'],'direction':job['direction'],'file':job['source'],'sha256':sha(ROOT/job['source']),
        'prompt':job['prompt'],'promptSha256':sha(ROOT/job['prompt']),'inputFiles':[{'file':p,'sha256':sha(WORKSPACE/p)} for p in job['references']],
        'sourceSize':analysis['sourceSize'],'analysis':str(af.relative_to(ROOT)).replace('\\','/'),'pixelsResampled':True,'rgbPainted':False})
required=[a['slug']+'-'+action+'-'+d for a in PLAN['actors'] for d in PLAN['directions'] for action in ACTIONS]
missing=[id for id in required if id not in all_clips]
actors=[{k:a[k] for k in ['id','name','slug','rank','bodyHeightPx','canvas','pivot','liftPx','role','stage']}|{'frameSize':[a['canvas'][0]+96,a['canvas'][1]+32],'worldFoot':[a['pivot'][0]+48,a['pivot'][1]+16],'actions':ACTIONS,'clipsProduced':sum(c['actor']==a['id'] for c in all_clips.values()),'conceptBasis':a['conceptRoot']+'/production.json'} for a in PLAN['actors']]
catalog={'version':1,'id':'van-hai-monster-animation-v1','date':'2026-10-13','status':'candidate-motion-review' if not missing else 'production-in-progress',
    'tool':'built-in ImageGen','pixelsResampled':True,'artApproved':False,'ownerApproved':False,'runtimeConsumable':False,
    'directions':PLAN['directions'],'actions':ACTIONS,'actors':actors,'clips':all_clips,'sources':sources,'masters':masters,
    'coverage':{'required':required,'missing':missing,'clips':len(all_clips),'poses':len(all_clips)*6,'fullPlayerActions':False},
    'registration':'source-registration.json','basis':'basis.json','warnings':warnings,'socketStatus':'presentation-candidate; dedicated source measurements required before gameplay binding'}
write(ROOT/'catalog.json',catalog);write(ROOT/'source-registration.json',{'version':1,'artApproved':False,'registration':registrations})
# Per-actor matrices show neutral + five rows and every independently drawn view.
for a in PLAN['actors']:
    views=[d for d in PLAN['directions'] if a['slug']+'-idle-'+d in all_clips]
    if not views:continue
    radius=max(max(abs(f['bounds'][0]-c['pivot'][0]),abs(f['bounds'][2]-c['pivot'][0])) for c in all_clips.values() if c['actor']==a['id'] for f in c['frames'])
    cell=max(160,2*radius+40)
    w=110+len(views)*cell;h=6*128+40;board=Image.new('RGB',(w,h),'#183129');draw=ImageDraw.Draw(board)
    for i,d in enumerate(views):draw.text((110+i*cell,9),d,font=font(12),fill='#dfd1ac')
    for row,action in enumerate(['neutral']+ACTIONS):
        draw.text((8,70+row*128),action,font=font(15,True),fill='#d5c292');draw.line((0,126+row*128,w,126+row*128),fill='#587563')
        for i,d in enumerate(views):
            c=all_clips[a['slug']+'-idle-'+d] if action=='neutral' else all_clips[a['slug']+'-'+action+'-'+d]
            file=masters[a['slug']+'-'+d]['file'] if action=='neutral' else c['frames'][3 if action in ['move','attack'] else 5 if action=='death' else 0]['file']
            im=Image.open(ROOT/file).convert('RGBA');x=110+cell//2+i*cell-c['pivot'][0];y=126+row*128-c['pivot'][1];board.paste(im,(x,y),im)
    (ROOT/'review').mkdir(exist_ok=True);board.save(ROOT/'review'/f"{a['slug']}-native-matrix.png")
print(json.dumps({'clips':len(all_clips),'poses':len(all_clips)*6,'sources':len(sources),'missingClips':len(missing),'warnings':warnings,'artApproved':False},ensure_ascii=False))
