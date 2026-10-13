"""Verify the isolated Hắc Ấn ART pack; never builds assets or writes game data.

Coverage, hashes and pixels are technical checks. They do not approve morphology,
the eight camera views, motion quality, VFX or gameplay balance.
"""
from pathlib import Path
import hashlib,json,statistics,sys
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
W=Path(__file__).resolve().parents[1]
R=W/'docs/design/characters/dark-seal-officer-animation-v1'
F=R/'vfx'

def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def hashed(p,h):assert sha(p)==h, str(p)+' hash changed'
def rgba(p):return Image.open(p).convert('RGBA')
def margins(im,label):
    a=np.array(im)[:,:,3]
    assert not a[:2,:].any() and not a[-2:,:].any() and not a[:,:2].any() and not a[:,-2:].any(),label+' clips alpha padding'
def atlas_frame(atlas,frame,im):
    r=frame['rect'];assert r['w']==im.width and r['h']==im.height
    box=(r['x'],r['y'],r['x']+r['w'],r['y']+r['h'])
    assert atlas.crop(box).tobytes()==im.tobytes(),frame['file']+' canonical/atlas mismatch'
    # Alpha in the extrinsic two-pixel atlas gutter must stay empty too.
    gutter=atlas.crop((box[0]-2,box[1]-2,box[2]+2,box[3]+2)).getchannel('A')
    assert gutter.getbbox()==tuple(v+2 for v in im.getchannel('A').getbbox()),frame['file']+' atlas gutter contamination'

C=read(R/'catalog.json');P=read(R/'production-plan.json');K=read(R/'kit.json')
REG=read(R/'source-registration.json');FX=read(F/'catalog.json');FR=read(F/'registration.json')
directions=['south','southwest','west','northwest','north','northeast','east','southeast']
actions=['idle','move','attack','hit','death','appear','dao_an','phan_phu','an_hoi']
required={a+'-'+d for a in actions for d in directions}
assert C['directions']==directions and C['actions']==actions
assert set(C['clips'])==required and set(C['coverage']['required'])==required and not C['coverage']['missing']
assert C['coverage']['clips']==72 and C['coverage']['poses']==432
assert C['frameSize']==[160,112] and C['pivot']==[80,104] and C['bodyHeightPx']==80
assert not C['artApproved'] and not C['ownerApproved'] and not C['runtimeConsumable']
assert not K['runtimeImplemented'] and not K['gameplayTimingApproved']
assert len(C['sources'])==24 and len(REG['registration'])==24
assert len({s['sha256'] for s in C['sources']})==24,'direction/action source alias detected'
assert REG['rgbPainted'] is False and REG['perPoseFit'] is False
if (R/'source-problems.json').exists():assert not read(R/'source-problems.json')['problems'],'unresolved body source problem'

basis=read(R/'basis.json');hashed(W/basis['approvalFile'],basis['approvalSha256'])
for t in basis['targets']:hashed(W/t['file'],t['sha256'])
player=read(W/'docs/design/characters/actor-animation-standard-v2/approval.json')['targets']
assert len(player)==323
for t in player:hashed(W/t['file'],t['sha256'])
wolf=read(W/'docs/design/characters/cloud-wolf-king-animation-v1/approval.json')
assert wolf['animationApproved'] and wolf['vfxApproved'] and len(wolf['targets'])==556
for t in wolf['targets']:hashed(W/t['file'],t['sha256'])
hashed(W/'docs/design/world/van-hai-living-world-v1/plan.json','9890bf1589b6efdc2858fcca2f1e1d56d6a5ec4b2e58238ab5c297d4bbefa576')
hashed(W/'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp','4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8')

regs={r['id']:r for r in REG['registration']};source_pixels={};neutral_count=0
for source in C['sources']:
    hashed(R/source['file'],source['sha256']);hashed(R/source['prompt'],source['promptSha256'])
    generated=read(R/'generation'/(source['id']+'.json'))
    assert generated['source']==source['file'] and generated['sourceSha256']==source['sha256']
    assert generated['promptSha256']==source['promptSha256'] and generated['tool']=='built-in-imagegen' and not generated['artApproved']
    for t in source['inputs']:hashed(W/t['file'],t['sha256'])
    raw=rgba(R/source['file']);assert list(raw.size)==source['sourceSize'];source_pixels[source['id']]=raw
    registration=regs[source['id']]
    assert registration['mirrored'] is False
    assert registration['sourceSha256']==source['sha256']
    frames=registration['frames'];assert all(f['rgbPainted'] is False for f in frames)
    assert len({f['scale'] for f in frames})==1
    assert all(abs(f['scale']-registration['scale'])<1e-12 for f in frames)
    neutrals=[f for f in frames if f['row']==0]
    assert len(neutrals)==6,source['id']+' calibration coverage'
    neutral_count+=len(neutrals)
    scale=80/statistics.median(f['sourceRect']['height'] for f in neutrals)
    assert abs(registration['scale']-scale)<1e-12,source['id']+' neutral scale mismatch'
    for f in frames:
        hashed(R/f['file'],f['sha256']);cut=rgba(R/f['file']);q=f['sourceRect']
        assert cut.size==(q['width'],q['height'])
        original=np.array(raw.crop((q['left'],q['top'],q['left']+q['width'],q['top']+q['height'])))
        packed=np.array(cut);owned=packed[:,:,3]>0
        assert (packed[:,:,3][owned]==255).all(),source['id']+' body alpha policy'
        assert (original[:,:,:3][owned]==packed[:,:,:3][owned]).all(),source['id']+' RGB was painted'
        assert (original[:,:,3][owned]>=210).all(),source['id']+' extracted a foreign transparent body pixel'

body_frames=0
for clip in C['clips'].values():
    assert len(clip['frames'])==6 and clip['fps']==24 and len(clip['durations'])==6
    assert all(n>0 for n in clip['durations']) and clip['frameSize']==C['frameSize'] and clip['pivot']==C['pivot']
    assert clip['loop']==(clip['action'] in ['idle','move'])
    assert not clip['artApproved'] and not clip['runtimeImplemented']
    if clip['action'] in K['skills']:
        # Standing ready/recovery must keep human scale across source sheets.
        # This gate never rescales a pose; it rejects the whole source instead.
        for i in [0,5]:
            b=clip['frames'][i]['bounds']
            assert 74<=b[3]-b[1]<=86,(clip['id'],i,b,'standing body drift')
    if clip['action'] in K['skills']:assert clip['durations']==K['skills'][clip['action']]['durations']
    hashed(R/clip['atlas'],clip['atlasSha256']);atlas=rgba(R/clip['atlas']);assert list(atlas.size)==clip['atlasSize']
    registration=regs[clip['registrationSource']]
    for f in clip['frames']:
        hashed(R/f['file'],f['sha256']);im=rgba(R/f['file']);assert list(im.size)==C['frameSize']
        assert list(im.getchannel('A').getbbox())==f['bounds'];margins(im,f['file']);atlas_frame(atlas,f,im)
        mapping=registration['frames'][f['sourceMapping']]
        assert mapping['row']>0 and mapping['bounds']==f['bounds']
        cut=rgba(R/mapping['file']);scale=mapping['scale']
        native=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
        reconstructed=Image.new('RGBA',tuple(C['frameSize']));reconstructed.alpha_composite(native,tuple(mapping['nativeOffset']))
        assert reconstructed.tobytes()==im.tobytes(),f['file']+' changed scale, placement or colors'
        body_frames+=1
assert body_frames==432
sockets=read(R/'socket-registration.json')
assert sockets['status']=='presentation-candidate' and not sockets['gameplayBound']
assert len(sockets['records'])==192
for socket in sockets['records']:
    hashed(R/socket['file'],socket['sha256'])
    c=C['clips'][socket['clip']]
    assert c['sockets'][socket['frame']]==socket['socket']
    r,g,b,a=rgba(R/socket['file']).getpixel(tuple(socket['socket']))
    assert a and r>150 and g>120 and b>90 and r>g+26 and g>b+18,(socket['clip'],'socket not a source skin pixel')
for master in C['masters'].values():
    hashed(R/master['file'],master['sha256']);im=rgba(R/master['file'])
    assert list(im.size)==C['frameSize'] and list(im.getchannel('A').getbbox())==master['bounds']

history=read(R/'generation/history.json')
assert history['bodyGenerations']==29 and history['selectedSources']==24 and history['superseded']==5
for entry in history['entries']:
    hashed(R/entry['source'],entry['sourceSha256']);hashed(R/entry['prompt'],entry['promptSha256'])
    record=read(R/entry['record'])
    assert record['source']==entry['source'] and record['prompt']==entry['prompt']
    assert record['sourceSha256']==entry['sourceSha256'] and record['promptSha256']==entry['promptSha256']
    for t in record['inputs']:hashed(W/t['file'],t['sha256'])

assert len(FX['clips'])==6 and FX['coverage']['sequences']==6 and FX['coverage']['poses']==36 and not FX['coverage']['missing']
assert not FX['artApproved'] and not FX['runtimeConsumable']
for s in FX['sources']:
    hashed(F/s['source'],s['sha256']);hashed(F/s['prompt'],s['promptSha256'])
    generated=read(F/'generation'/(s['id']+'.json'))
    assert generated['source']==s['source'] and generated['sourceSha256']==s['sha256'] and generated['promptSha256']==s['promptSha256']
    assert generated['tool']=='built-in-imagegen' and not generated['artApproved']
    for t in s['inputFiles']:hashed(W/t['file'],t['sha256'])
fxregs={r['id']:r for r in FR['registration']};fx_measurements=[]
for c in FX['clips'].values():
    assert len(c['frames'])==6 and c['fps']==24 and not c['loop'] and not c['artApproved']
    hashed(F/c['atlas'],c['atlasSha256']);atlas=rgba(F/c['atlas']);assert list(atlas.size)==c['atlasSize']
    reg=fxregs[c['id']];assert len({f['scale'] for f in reg['frames']})==1
    assert reg['rgbPainted'] is False and reg['bodyThresholdApplied'] is False
    assert all(g['opaquePixelsAtCut']==0 for g in reg['horizontalGutters']+reg['verticalGutters']),c['id']+' source gutter crosses visible FX'
    source=rgba(F/reg['source']);soft=0;peak=0
    for f,m in zip(c['frames'],reg['frames'],strict=True):
        hashed(F/f['file'],f['sha256']);im=rgba(F/f['file']);assert list(im.size)==c['frameSize']
        assert list(im.getchannel('A').getbbox())==f['bounds'];margins(im,f['file']);atlas_frame(atlas,f,im)
        a=np.array(im)[:,:,3];soft+=int(((a>0)&(a<255)).sum())
        core=im.getchannel('A').point(lambda x:255 if x>=64 else 0).getbbox()
        assert (list(core) if core else None)==f['coreBounds'];peak=max(peak,core[2]-core[0] if core else 0)
        assert m['softAlphaPreserved'] is True and m['shardsRemoved']==0
        cut=source.crop(tuple(m['sourceRect'])).crop(tuple(m['alphaBounds']))
        native=cut.resize(tuple(m['nativeSize']),Image.Resampling.NEAREST)
        rebuilt=Image.new('RGBA',tuple(c['frameSize']));rebuilt.alpha_composite(native,tuple(m['nativeOffset']))
        assert rebuilt.tobytes()==im.tobytes(),f['file']+' soft source pixels changed'
    assert soft>0,c['id']+' lost soft alpha'
    assert abs(peak-c['peakTargetWidth'])<=max(4,c['peakTargetWidth']*.05),(c['id'],peak)
    fx_measurements.append({'id':c['id'],'softPixels':soft,'peakCoreWidth':peak,'frameSize':c['frameSize']})

report={'passed':True,'date':'2026-10-13','clips':72,'poses':432,'directions':8,'actions':9,'bodySources':24,'calibrationPoses':neutral_count,'fxSequences':6,'fxPoses':36,'playerFilesUnchanged':323,'approvedWolfFilesUnchanged':556,'bodyGenerationsRetained':29,'supersededSourcesRetained':5,'socketCandidates':192,'neutralSourceFilesUnchanged':len(basis['targets']),'measurements':fx_measurements,'artApproved':False,'runtimeImplemented':False,'checks':['approved neutral/source/prompt hashes unchanged','556 approved Lang Vuong targets unchanged','29 body generation records and all prompt/input hashes retained','ready/recovery standing height74-86px and192 measured skin socket candidates','323 approved player files and map unchanged','72 complete bindings / 432 action poses','one measured neutral scale per source, original RGB, no mirror or pose fit','canonical PNG / atlas pixel byte parity and empty two-pixel gutters','soft-alpha FX source reconstruction and one scale per sequence','all raw/prompt/input hashes; calibration and provenance retained'],'limits':['technical verification does not approve morphology, eight directional anatomy, motion quality or balance','decoded cache is checked separately; this is not an MMO GPU benchmark']}
delivery_file=R/'delivery.json'
if delivery_file.exists():
    delivery=read(delivery_file)
    assert delivery['artApproved'] is False and delivery['runtimeImplemented'] is False
    assert len({t['file'] for t in delivery['targets']})==len(delivery['targets'])
    for t in delivery['targets']:
        p=(R/t['file']).resolve();assert p.is_relative_to(R.resolve())
        hashed(p,t['sha256'])
    report['deliveryFilesVerified']=len(delivery['targets'])
out=W/'artifacts/dark-seal-officer-animation-v1';out.mkdir(parents=True,exist_ok=True)
(out/'asset-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='measurements'},ensure_ascii=False))
