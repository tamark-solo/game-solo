"""New one-pose human concept registration, preserving all player/Boss02 inputs."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont
WORKSPACE=Path(__file__).resolve().parents[1]
ROOT=WORKSPACE/'docs/design/characters/van-hai-dark-seal-officer-v3'
if (ROOT/'approval.json').exists():
 raise SystemExit('Officer03 neutral accepted; preserve it and produce new directions/actions in a new versioned package.')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
p=json.loads((ROOT/'production.json').read_text(encoding='utf-8'))
assert ROOT.resolve().is_relative_to(WORKSPACE.resolve())
for f in p['preservedBoss02']:assert sha(WORKSPACE/f['file'])==f['sha256'],f['file']
assert sha(WORKSPACE/p['sourcePlan'])==p['sourcePlanSha256']
ref=p['styleInput'];assert sha(WORKSPACE/ref['file'])==ref['sha256'] and sha(WORKSPACE/ref['source'])==ref['sourceSha256']
im=Image.open(ROOT/p['raw']).convert('RGBA');alpha=im.getchannel('A');mask=alpha.point(lambda v:255 if v>=210 else 0);b=mask.getbbox();assert b
# Foreground planted boot support inspected from the source, not robe/bbox center.
source_root=[405,b[3]];support=[344,b[3]-75,460,b[3]]
assert b[0]<=source_root[0]<b[2]
cut=im.copy();cut.putalpha(mask);cut=cut.crop(b);scale=80/cut.height;size=(round(cut.width*scale),80);native=cut.resize(size,Image.Resampling.NEAREST);nb=native.getchannel('A').getbbox();nr=[round((source_root[0]-b[0])*scale),nb[3]];dest=[32-nr[0],88-nr[1]]
assert min(dest)>=2 and dest[0]+size[0]<=62 and dest[1]+size[1]<=94,(dest,size)
frame=Image.new('RGBA',(64,96));frame.alpha_composite(native,tuple(dest));frame.save(ROOT/p['sprite']);bounds=frame.getchannel('A').getbbox();assert bounds[3]==88 and bounds[3]-bounds[1]==80 and set(frame.getchannel('A').get_flattened_data())=={0,255}
p.update(status='candidate-human-style-reset',rawSha256=sha(ROOT/p['raw']),spriteSha256=sha(ROOT/p['sprite']),nativeBounds=list(bounds),measuredBodyHeightPx=80,pixelsResampled=True,presentation={'shadowBaked':False,'vfxBaked':False,'liftPx':0})
(ROOT/'production.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
registration={'schema':'officer-neutral-registration-3','sourceSize':list(im.size),'sourceBounds':list(b),'sourcePivot':source_root,'sourceSupportWitness':support,'rootBasis':'Nearest planted foreground boot sole; robe hem, hair and bbox center excluded. Concept support to verify again during motion.','sharedNeutralScale':scale,'pixelsResampled':True,'resampling':'nearest','nativeCutoutSize':list(size),'nativeCutoutRoot':nr,'canvasTranslation':dest,'canvas':[64,96],'pivot':[32,88],'nativeBounds':list(bounds),'bodyHeightPx':80,'liftPx':0,'alphaPolicy':{'sourcePreserved':True,'nativeBodyThreshold':210,'binaryNativeAlpha':True,'lowAlphaSourcePixelsExcluded':sum(1 for v in alpha.get_flattened_data() if 0<v<210),'rgbPainted':False,'componentsRemoved':0},'sourceSha256':p['rawSha256'],'spriteSha256':p['spriteSha256'],'artApproved':False,'runtimeConsumable':False}
(ROOT/'registration.json').write_text(json.dumps(registration,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Comparison uses identical integer display scale; no creative raster changes.
board=Image.new('RGB',(1120,520),'#142622');d=ImageDraw.Draw(board);font=lambda n:ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',n)
d.text((22,16),'HẮC ẤN03 · ĐỐI CHIẾU PIXEL02',font=font(27),fill='#eed8aa');d.text((22,59),'Cùng body80 / chân88 · nearest4× · thân riêng, không khí tức',font=font(16),fill='#c4d0be')
items=[('Vương Lâm · chuẩn',WORKSPACE/p['approvedPlayerReference']['file'],[32,88]),('Hắc Ấn02 · trước',ROOT/p['previousConcept']['sprite'],p['previousConcept']['pivot']),('Hắc Ấn03 · mới',ROOT/p['sprite'],[32,88])]
for i,(name,f,pivot) in enumerate(items):
 x=16+i*368;ground=444;d.rounded_rectangle((x,102,x+352,502),radius=8,fill='#e1ddc7');im=Image.open(f).convert('RGBA');im=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST);b=im.getchannel('A').getbbox();xx=round(x+176-(b[0]+b[2])/2);yy=ground-pivot[1]*4;board.paste(im,(xx,yy),im);d.line((x+14,ground,x+338,ground),fill='#9b9271');box=d.textbbox((0,0),name,font=font(21));d.text((x+(352-box[2]+box[0])/2,462),name,font=font(21),fill='#263b31')
board.save(ROOT/'review/style-4x.png')
print('Packed one officer neutral64x96/32,88; previous Boss02 and approved player unchanged.')
