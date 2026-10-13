"""Measured extraction of 3x6 FX sheets; preserve original soft RGBA/shards.

One native scale per phase, never per-frame-fit or RGB repaint. Widths are ART
targets, not damage geometry. Only the new VFX02 root is written.
"""
from pathlib import Path
import json,hashlib,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from monster_sheet_tools import separators
W=Path(__file__).resolve().parents[1];R=W/'docs/design/vfx/van-hai-monster-vfx-v2'
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def save(p,obj):Path(p).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
plan=read(R/'production-plan.json');clips={};sources=[];regs=[];actors=[]
for j in plan['jobs']:
    file=R/j['source']
    if not file.exists():continue
    im=Image.open(file).convert('RGBA');alpha=np.array(im)[:,:,3];w,h=im.size
    assert alpha.min()==0,j['id']+': no transparent background'
    ys,yg=separators((alpha>=8).sum(axis=1).tolist(),3)
    for phase in j['phases']:
        separate=phase['id']=='release' and 'releaseSource' in j
        releaseFile=R/j.get('releaseSource','')
        if separate and not releaseFile.is_file():continue
        sourceImage=Image.open(releaseFile).convert('RGBA') if separate else im
        sourceAlpha=np.array(sourceImage)[:,:,3];sw,sh=sourceImage.size
        sy,sg=separators((sourceAlpha>=8).sum(axis=1).tolist(),2) if separate else (ys,yg)
        row=phase['row'];rowalpha=alpha[ys[row]:ys[row+1]]
        xs,xg=separators((rowalpha>=8).sum(axis=0).tolist(),6);cells=[]
        for col in range(6):
            rr=col//3 if separate else row;cc=col%3 if separate else col
            if separate:
                xx,xdiag=separators((sourceAlpha[sy[rr]:sy[rr+1]]>=8).sum(axis=0).tolist(),3)
                rect=[xx[cc],sy[rr],xx[cc+1],sy[rr+1]]
                if any(g['opaquePixelsAtCut'] for g in xdiag):raise ValueError(j['id']+': release row overlaps at alpha8; regenerate source')
            else:rect=[xs[col],ys[row],xs[col+1],ys[row+1]]
            cut=sourceImage.crop(tuple(rect));a=cut.getchannel('A')
            core=a.point(lambda v:255 if v>=64 else 0).getbbox();bounds=a.getbbox()
            assert core and bounds,f"{j['id']} row{row} col{col}: empty sequence tile"
            # Grid describes requested logical origin, while measured gutter
            # masks describe extraction. Never recenter each pose's alpha bbox.
            origin=[(cc+.5)*sw/(3 if separate else 6)-rect[0],(rr+.5)*sh/(2 if separate else 3)-rect[1]]
            cells.append({'cut':cut,'sourceRect':rect,'coreBounds':list(core),'alphaBounds':list(bounds),'sourceOrigin':origin})
        scale=phase['width']/max(c['coreBounds'][2]-c['coreBounds'][0] for c in cells)
        radiusX=max(max(abs(c['alphaBounds'][0]-c['sourceOrigin'][0]),abs(c['alphaBounds'][2]-c['sourceOrigin'][0])) for c in cells)*scale
        radiusY=max(max(abs(c['alphaBounds'][1]-c['sourceOrigin'][1]),abs(c['alphaBounds'][3]-c['sourceOrigin'][1])) for c in cells)*scale
        canvas=[int(math.ceil((2*radiusX+16)/8)*8),int(math.ceil((2*radiusY+16)/8)*8)];anchor=[canvas[0]//2,canvas[1]//2]
        if max(canvas)>512:raise ValueError(j['id']+': soft-alpha extent suspicious, inspect source instead of shrinking core')
        id=j['id']+'-'+phase['id'];(R/'frames'/id).mkdir(parents=True,exist_ok=True)
        atlas=Image.new('RGBA',((canvas[0]+4)*6,canvas[1]+4));frames=[];maps=[]
        for col,cell in enumerate(cells):
            b=cell['alphaBounds'];origin=cell['sourceOrigin'];crop=cell['cut'].crop(tuple(b))
            size=[max(1,round(crop.width*scale)),max(1,round(crop.height*scale))];native=crop.resize(tuple(size),Image.Resampling.NEAREST)
            offset=[round(anchor[0]+(b[0]-origin[0])*scale),round(anchor[1]+(b[1]-origin[1])*scale)]
            assert min(offset)>=2 and offset[0]+size[0]<=canvas[0]-2 and offset[1]+size[1]<=canvas[1]-2,(id,col,offset,size,canvas)
            out=Image.new('RGBA',tuple(canvas));out.alpha_composite(native,tuple(offset));file=f"frames/{id}/{col+1:03}.png";out.save(R/file)
            rect={'x':2+col*(canvas[0]+4),'y':2,'w':canvas[0],'h':canvas[1]};atlas.alpha_composite(out,(rect['x'],rect['y']))
            bounds=out.getchannel('A').getbbox();core=out.getchannel('A').point(lambda v:255 if v>=64 else 0).getbbox()
            frames.append({'file':file,'sha256':sha(R/file),'rect':rect,'bounds':list(bounds),'coreBounds':list(core) if core else None})
            maps.append({k:v for k,v in cell.items() if k!='cut'}|{'scale':scale,'nativeOffset':offset,'nativeSize':size,'shardsRemoved':0,'softAlphaPreserved':True})
        af='atlases/'+id+'.png';atlas.save(R/af)
        clips[id]={'id':id,'actor':j['actor'],'slug':j['id'],'phase':phase['id'],'phases':[{'at':0,'label':phase['id']}],'kind':phase['kind'],'frameSize':canvas,'anchor':anchor,'frames':frames,'atlas':af,'atlasSize':list(atlas.size),'atlasSha256':sha(R/af),'fps':24,'durations':[1,1,2,2,2,2] if phase['id']!='charge' else [1]*6,'loop':False,'peakTargetWidth':phase['width'],'artApproved':False,'rotationReuse':phase['kind']=='directional','originStatus':'authored logical grid center, candidate emitter'}
        regs.append({'id':id,'source':j['releaseSource'] if separate else j['source'],'sourceSize':[sw,sh],'layout':[3,2] if separate else [6,3],'phaseRow':row,'xCuts':xs if not separate else None,'yCuts':sy,'verticalGutters':xg if not separate else xdiag,'horizontalGutters':sg,'scale':scale,'scaleBasis':'peak alpha64 core width across six frames; canvas expands for all original soft alpha, never downscales for haze','frames':maps,'rgbPainted':False,'bodyThresholdApplied':False})
    sources.append({'id':j['id'],'source':j['source'],'sha256':sha(R/j['source']),'prompt':j['prompt'],'promptSha256':sha(R/j['prompt']),'inputFiles':[{'file':p,'sha256':sha(W/p)} for p in j['references']]})
    if j.get('releaseSource') and (R/j['releaseSource']).is_file():sources.append({'id':j['id']+'-release','source':j['releaseSource'],'sha256':sha(R/j['releaseSource']),'prompt':j['releasePrompt'],'promptSha256':sha(R/j['releasePrompt']),'inputFiles':[{'file':p,'sha256':sha(W/p)} for p in j['references']]})
    if j['id']+'-release' in clips:actors.append({k:j[k] for k in ['id','actor','rank','name','palette','description']}|{'charge':j['id']+'-charge','release':j['id']+'-release','impact':j['id']+'-impact'})
catalog={'id':plan['id'],'date':'2026-10-13','status':'candidate-art-review','tool':'built-in ImageGen','actors':actors,'clips':clips,'sources':sources,'bodyBasis':'body-basis.json','registration':'registration.json','artApproved':False,'runtimeConsumable':False,'propsBasis':'../van-hai-monster-vfx-v1/catalog.json','coverage':{'sources':len(sources),'sequences':len(clips),'poses':len(clips)*6,'missing':[j['id'] for j in plan['jobs'] if j['id'] not in [a['id'] for a in actors]]}}
save(R/'catalog.json',catalog);save(R/'registration.json',{'artApproved':False,'registration':regs})
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',14)
for a in actors:
    cs=[clips[a[p]] for p in ['charge','release','impact']];cell=max(max(c['frameSize'])+16 for c in cs);board=Image.new('RGB',(120+cell*6,3*cell+42),'#142b29');draw=ImageDraw.Draw(board)
    draw.text((12,8),a['name'],font=font,fill='#e4ce9c')
    for row,c in enumerate(cs):
        draw.text((8,42+row*cell+cell//2),c['phase'],font=font,fill='#d8bb81')
        for i,f in enumerate(c['frames']):
            out=Image.open(R/f['file']).convert('RGBA');board.paste(out,(120+i*cell+(cell-c['frameSize'][0])//2,42+row*cell+(cell-c['frameSize'][1])//2),out)
    board.save(R/'review'/f"{a['id']}-native-phases.png")
print(json.dumps(catalog['coverage']))
