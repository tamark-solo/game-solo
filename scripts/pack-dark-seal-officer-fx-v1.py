"""Measured Hắc Ấn FX packing from row sequences or isolated whole sheets.

Keep original RGBA, soft alpha and shards. Use one alpha64 peak scale per
six-frame sequence, never per-pose fit. Write only this new VFX root.
"""
from pathlib import Path
import hashlib,json,math,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from monster_sheet_tools import separators

sys.stdout.reconfigure(encoding='utf-8')
W=Path(__file__).resolve().parents[1]
R=W/'docs/design/characters/dark-seal-officer-animation-v1/vfx'
FRAME_COUNT=6
PHASE_ORDER=['charge','release','impact','phantom','return','arrival']

def read(path):return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def save(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def local(relative):
    path=(R/relative).resolve()
    if not path.is_relative_to(R.resolve()):raise ValueError('FX path escapes root: '+relative)
    return path
def measured_axis(projection,count,label):
    cuts,diagnostics=separators(projection,count)
    for index,diagnostic in enumerate(diagnostics,1):
        # A one-pixel band's rounded midpoint can land on its occupied neighbor.
        band=diagnostic['emptyBand']
        if band is not None:cuts[index]=min(max(cuts[index],band[0]),band[1]-1)
        diagnostic['cut']=cuts[index]
        diagnostic['opaquePixelsAtCut']=int(projection[cuts[index]])
        diagnostic['alphaThreshold']=8
    crossed=[d for d in diagnostics if d['opaquePixelsAtCut']]
    if crossed:raise ValueError(f'{label}: alpha8 source gutter crosses FX; repair source: {crossed}')
    return cuts,diagnostics
def clip_id(job,phase):return phase.get('clipId',job['id']+'-'+phase['id'])

def extract_phase(job,phase,image,alpha,ycuts,horizontal):
    width,height=image.size
    rows,cols=int(job['rows']),int(job.get('cols',6))
    whole=bool(phase.get('wholeSheet',False))
    if whole:
        if rows*cols!=FRAME_COUNT:raise ValueError(job['id']+': wholeSheet needs exactly six frames')
        coordinates=[(index//cols,index%cols) for index in range(FRAME_COUNT)]
    else:
        row=int(phase['row'])
        if cols!=FRAME_COUNT or not 0<=row<rows:raise ValueError(job['id']+': row sequence needs six columns and a valid row')
        coordinates=[(row,col) for col in range(FRAME_COUNT)]
    row_cuts={};vertical=[]
    for row in sorted({row for row,_ in coordinates}):
        row_alpha=alpha[ycuts[row]:ycuts[row+1]]
        cuts,diagnostic=measured_axis((row_alpha>=8).sum(axis=0).tolist(),cols,f"{job['id']}/{phase['id']} row{row}")
        row_cuts[row]=cuts
        vertical.extend({**item,'row':row} for item in diagnostic)
    cells=[]
    for row,col in coordinates:
        xs=row_cuts[row];rect=[xs[col],ycuts[row],xs[col+1],ycuts[row+1]]
        cut=image.crop(tuple(rect));channel=cut.getchannel('A')
        bounds=channel.getbbox();core=channel.point(lambda value:255 if value>=64 else 0).getbbox()
        if bounds is None or core is None:raise ValueError(f"{job['id']}/{phase['id']} row{row} col{col}: empty tile/core")
        # Requested logical grid fixes origin; measured gutters only crop source.
        origin=[(col+.5)*width/cols-rect[0],(row+.5)*height/rows-rect[1]]
        cells.append({'cut':cut,'row':row,'col':col,'sourceRect':rect,'coreBounds':list(core),'alphaBounds':list(bounds),'sourceOrigin':origin})
    target=float(phase['width'])
    if target<=0:raise ValueError(job['id']+': invalid target width')
    scale=target/max(cell['coreBounds'][2]-cell['coreBounds'][0] for cell in cells)
    radius_x=max(max(abs(cell['alphaBounds'][0]-cell['sourceOrigin'][0]),abs(cell['alphaBounds'][2]-cell['sourceOrigin'][0])) for cell in cells)*scale
    radius_y=max(max(abs(cell['alphaBounds'][1]-cell['sourceOrigin'][1]),abs(cell['alphaBounds'][3]-cell['sourceOrigin'][1])) for cell in cells)*scale
    canvas=[math.ceil((2*radius_x+16)/8)*8,math.ceil((2*radius_y+16)/8)*8]
    if max(canvas)>512:raise ValueError(f"{job['id']}/{phase['id']}: soft-alpha canvas {canvas} exceeds512; inspect source")
    anchor=[canvas[0]//2,canvas[1]//2]
    atlas=Image.new('RGBA',((canvas[0]+4)*FRAME_COUNT,canvas[1]+4))
    outputs=[];frames=[];mappings=[];identifier=clip_id(job,phase)
    for index,cell in enumerate(cells):
        bounds,origin=cell['alphaBounds'],cell['sourceOrigin']
        crop=cell['cut'].crop(tuple(bounds));native_size=[max(1,round(crop.width*scale)),max(1,round(crop.height*scale))]
        native=crop.resize(tuple(native_size),Image.Resampling.NEAREST)
        offset=[round(anchor[0]+(bounds[0]-origin[0])*scale),round(anchor[1]+(bounds[1]-origin[1])*scale)]
        if min(offset)<2 or offset[0]+native.width>canvas[0]-2 or offset[1]+native.height>canvas[1]-2:raise ValueError(f'{identifier} frame{index}: native alpha clips padding')
        out=Image.new('RGBA',tuple(canvas));out.alpha_composite(native,tuple(offset))
        file=f'frames/{identifier}/{index+1:03}.png'
        rect={'x':2+index*(canvas[0]+4),'y':2,'w':canvas[0],'h':canvas[1]}
        atlas.alpha_composite(out,(rect['x'],rect['y']))
        core=out.getchannel('A').point(lambda value:255 if value>=64 else 0).getbbox()
        frames.append({'file':file,'rect':rect,'bounds':list(out.getchannel('A').getbbox()),'coreBounds':list(core) if core else None})
        mappings.append({key:value for key,value in cell.items() if key!='cut'}|{'scale':scale,'nativeOffset':offset,'nativeSize':native_size,'shardsRemoved':0,'softAlphaPreserved':True})
        outputs.append((file,out))
    atlas_file='atlases/'+identifier+'.png'
    clip={'id':identifier,'actor':job['actor'],'slug':job['id'],'phase':phase['id'],'phases':[{'at':0,'label':phase['id']}],'kind':phase['kind'],'frameSize':canvas,'anchor':anchor,'frames':frames,'atlas':atlas_file,'atlasSize':list(atlas.size),'fps':24,'durations':[1]*6 if phase['id']=='charge' else [1,1,2,2,2,2],'loop':False,'peakTargetWidth':target,'artApproved':False,'rotationReuse':phase['kind']=='directional','originStatus':'authored logical grid center, candidate emitter'}
    registration={'id':identifier,'source':job['source'],'sourceSize':[width,height],'layout':[cols,rows],'phaseRow':None if whole else coordinates[0][0],'wholeSheet':whole,'xCuts':row_cuts[coordinates[0][0]] if len(row_cuts)==1 else None,'xCutsByRow':{str(row):cuts for row,cuts in row_cuts.items()},'yCuts':ycuts,'verticalGutters':vertical,'horizontalGutters':horizontal,'gutterAlphaThreshold':8,'scale':scale,'scaleBasis':'peak alpha64 core width across six frames; canvas expands for all original soft alpha, never downscales for haze','frames':mappings,'rgbPainted':False,'bodyThresholdApplied':False}
    return {'clip':clip,'registration':registration,'outputs':outputs,'atlasFile':atlas_file,'atlas':atlas}

def draw_board(clips,title,path,font):
    if not clips:return
    cell=max(max(clip['frameSize'])+16 for clip in clips)
    board=Image.new('RGB',(120+FRAME_COUNT*cell,42+len(clips)*cell),'#142b29');draw=ImageDraw.Draw(board)
    draw.text((12,8),title,font=font,fill='#e4ce9c')
    for row,clip in enumerate(clips):
        draw.text((8,42+row*cell+cell//2),clip['phase'],font=font,fill='#d8bb81')
        for index,frame in enumerate(clip['frames']):
            with Image.open(local(frame['file'])) as raw:image=raw.convert('RGBA')
            x=120+index*cell+cell//2-clip['anchor'][0];y=42+row*cell+cell//2-clip['anchor'][1]
            board.paste(image,(x,y),image)
            draw.text((120+index*cell+6,42+row*cell+4),str(index+1),font=font,fill='#c4cfca')
    path.parent.mkdir(parents=True,exist_ok=True);board.save(path)

def main():
    if (R/'approval.json').exists() or (R.parent/'approval.json').exists():raise ValueError('Approved pack is frozen; produce another version')
    plan=read(R/'production-plan.json')
    required=[clip_id(job,phase) for job in plan['jobs'] for phase in job['phases']]
    if len(set(required))!=len(required):raise ValueError('Duplicate output clip ID in FX plan')
    packages=[];sources=[]
    # Validate every available phase before writing any PNG or delivery catalog.
    for job in plan['jobs']:
        source=local(job['source'])
        if not source.exists():continue
        prompt=local(job['prompt'])
        with Image.open(source) as raw:image=raw.convert('RGBA')
        alpha=np.array(image)[:,:,3]
        if alpha.min()!=0:raise ValueError(job['id']+': no transparent background')
        rows,cols=int(job['rows']),int(job.get('cols',6))
        if rows<1 or cols<1:raise ValueError(job['id']+': invalid grid')
        ycuts,horizontal=measured_axis((alpha>=8).sum(axis=1).tolist(),rows,job['id']+' rows')
        horizontal=[{**diagnostic,'betweenRows':[index,index+1]} for index,diagnostic in enumerate(horizontal)]
        for phase in job['phases']:packages.append(extract_phase(job,phase,image,alpha,ycuts,horizontal))
        sources.append({'id':job['id'],'source':job['source'],'sha256':sha(source),'prompt':job['prompt'],'promptSha256':sha(prompt),'sourceSize':list(image.size),'layout':[cols,rows],'inputFiles':[{'file':file,'sha256':sha(W/file)} for file in job.get('references',[])]})
    clips={};registrations=[]
    for package in packages:
        for file,image in package['outputs']:
            path=local(file);path.parent.mkdir(parents=True,exist_ok=True);image.save(path)
        atlas_path=local(package['atlasFile']);atlas_path.parent.mkdir(parents=True,exist_ok=True);package['atlas'].save(atlas_path)
        clip=package['clip']
        for frame in clip['frames']:frame['sha256']=sha(local(frame['file']))
        clip['atlasSha256']=sha(atlas_path);clips[clip['id']]=clip;registrations.append(package['registration'])
    actors=[]
    for actor_id in dict.fromkeys(job['actor'] for job in plan['jobs']):
        jobs=[job for job in plan['jobs'] if job['actor']==actor_id];first=jobs[0]
        actor={key:first[key] for key in ['id','actor','rank','name','palette','description'] if key in first}
        for phase in PHASE_ORDER:
            matching=[clip['id'] for clip in clips.values() if clip['actor']==actor_id and clip['phase']==phase]
            if matching:actor[phase]=matching[0]
        actors.append(actor)
    missing=[identifier for identifier in required if identifier not in clips]
    catalog={'id':plan['id'],'date':'2026-10-13','status':'production-in-progress' if missing else 'candidate-art-review','tool':'built-in ImageGen','actors':actors,'clips':clips,'sources':sources,'bodyBasis':'../basis.json','registration':'registration.json','artApproved':False,'runtimeConsumable':False,'propsBasis':None,'coverage':{'sources':len(sources),'sequences':len(clips),'poses':len(clips)*FRAME_COUNT,'required':required,'missing':missing}}
    save(R/'catalog.json',catalog);save(R/'registration.json',{'artApproved':False,'registration':registrations})
    try:font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',14)
    except OSError:font=ImageFont.load_default()
    ordered=sorted(clips.values(),key=lambda clip:(PHASE_ORDER.index(clip['phase']) if clip['phase'] in PHASE_ORDER else len(PHASE_ORDER),clip['id']))
    draw_board(ordered,'Hắc Ấn Chấp Sự · six separate FX sequences · native1×',R/'review/native-fx-matrix.png',font)
    for actor in actors:draw_board([clip for clip in ordered if clip['actor']==actor['actor']],actor.get('name',actor['actor']),R/'review'/(actor['id']+'-native-phases.png'),font)
    for clip in ordered:draw_board([clip],clip['id']+' · native1×',R/'review'/(clip['id']+'-native.png'),font)
    print(json.dumps(catalog['coverage'],ensure_ascii=False))

if __name__=='__main__':main()
