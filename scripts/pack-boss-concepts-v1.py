"""Register four neutral boss sources in the new package only; no paint/game sync."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

WORKSPACE=Path(__file__).resolve().parents[1]
ROOT=WORKSPACE/'docs/design/characters/van-hai-boss-concepts-v1'
assert ROOT.resolve().is_relative_to(WORKSPACE.resolve())
if (ROOT/'approval-wolf.json').exists():
 raise SystemExit('Boss01 contains an accepted wolf neutral; keep it immutable and use the scoped Boss02 pack.')
manifest=json.loads((ROOT/'production.json').read_text(encoding='utf-8'))
assert len(manifest['actors'])==4
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert sha(WORKSPACE/manifest['sourcePlan'])==manifest['sourcePlanSha256']
THRESHOLD=210
# Source soles/support tips inspected from the generated RGBA, not bbox centers.
ROOTS={
 'cloud-wolf-king':([1046,983],[995,927,1124,983],'Nearest planted forepaw sole; muzzle and tail excluded.'),
 'three-seal-puppet':([529,1143],[453,1070,613,1143],'Nearest planted stone boot support, not lowered fists.'),
 'ancient-root':([1090,998],[1005,936,1146,998],'Forward primary root contact plane; branches/leaves excluded. Concept root, not collider center.'),
 'dark-seal-officer':([535,1215],[486,1132,585,1215],'Nearest planted boot sole; robe/hand do not determine ground.'),
}
rows=[]
for a in manifest['actors']:
 for ref in a['inputFiles']:assert sha(WORKSPACE/ref['file'])==ref['sha256'],ref['file']
 im=Image.open(ROOT/a['raw']).convert('RGBA');alpha=im.getchannel('A')
 mask=alpha.point(lambda v:255 if v>=THRESHOLD else 0);b=mask.getbbox();assert b
 root,witness,note=ROOTS[a['slug']]
 assert root[1]==b[3] and b[0]<=root[0]<b[2]
 body=im.copy();body.putalpha(mask);cut=body.crop(b)
 scale=a['bodyHeightPx']/cut.height
 size=(round(cut.width*scale),a['bodyHeightPx']);native=cut.resize(size,Image.Resampling.NEAREST)
 nb=native.getchannel('A').getbbox();native_root=[round((root[0]-b[0])*scale),nb[3]]
 dest=[a['pivot'][0]-native_root[0],a['pivot'][1]-native_root[1]]
 assert min(dest)>=2 and dest[0]+size[0]<=a['canvas'][0]-2 and dest[1]+size[1]<=a['canvas'][1]-2,(a['slug'],dest,size)
 frame=Image.new('RGBA',tuple(a['canvas']));frame.alpha_composite(native,tuple(dest));frame.save(ROOT/a['sprite'])
 bounds=frame.getchannel('A').getbbox();assert bounds[3]==a['pivot'][1]
 measured=bounds[3]-bounds[1];assert abs(measured-a['bodyHeightPx'])<=1
 assert set(frame.getchannel('A').get_flattened_data())=={0,255}
 a.update(status='concept-candidate',rawSha256=sha(ROOT/a['raw']),spriteSha256=sha(ROOT/a['sprite']),promptSha256=sha(ROOT/a['prompt']),pixelsResampled=True,measuredBodyHeightPx=measured,nativeBounds=list(bounds),presentation={'shadowBaked':False,'vfxBaked':False,'liftPx':0})
 if a.get('refinement'):
  f=a['refinement'];f['promptSha256']=sha(ROOT/f['prompt']);f['editTargetSha256']=sha(ROOT/f['editTarget'])
 rows.append({'id':a['id'],'slug':a['slug'],'sourceSize':list(im.size),'sourceBounds':list(b),'sourcePivot':root,'sourceSupportWitness':witness,'rootBasis':note,'pivotStatus':'concept-measured-pending-motion-review','sharedNeutralScale':scale,'pixelsResampled':True,'resampling':'nearest','nativeCutoutSize':list(size),'nativeCutoutRoot':native_root,'canvasTranslation':dest,'canvas':a['canvas'],'pivot':a['pivot'],'nativeBounds':list(bounds),'bodyHeightPx':a['bodyHeightPx'],'measuredBodyHeightPx':measured,'liftPx':0,'alphaPolicy':{'sourcePreserved':True,'nativeBodyThreshold':THRESHOLD,'binaryNativeAlpha':True,'lowAlphaSourcePixelsExcluded':sum(1 for v in alpha.getdata() if 0<v<THRESHOLD),'componentsRemoved':0,'rgbPainted':False},'sourceSha256':a['rawSha256'],'spriteSha256':a['spriteSha256']})
manifest['status']='concept-candidate'
player='docs/design/characters/wang-lin-pixel-production-v2/masters/southeast.png'
manifest['approvedPlayerReference']={'file':player,'sha256':sha(WORKSPACE/player),'canvas':[64,96],'pivot':[32,88],'bodyHeightPx':80,'modified':False}
(ROOT/'production.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'registration.json').write_text(json.dumps({'schema':'boss-concept-registration-1','date':'2026-10-13','runtimeConsumable':False,'artApproved':False,'actors':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Layout-only comparison of the native frames; no additional ART generation.
font=lambda s:ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',s)
board=Image.new('RGB',(2200,480),'#102321');d=ImageDraw.Draw(board)
d.text((24,14),'VÂN HẢI · BOSS CONCEPT01',font=font(27),fill='#efddaf')
d.text((24,57),'Một neutral Đông Nam / body-only · cùng nearest2× · chiều cao không tính padding',font=font(17),fill='#b9cfc1')
items=[{'name':'Vương Lâm · basis','sprite':str(WORKSPACE/player),'pivot':[32,88],'measuredBodyHeightPx':80}]+manifest['actors']
for i,a in enumerate(items):
 x=18 if i==0 else 266+(i-1)*480;w=232 if i==0 else 464;y=98;ground=390
 d.rounded_rectangle((x,y,x+w,y+360),radius=8,fill='#dedcc8')
 im=Image.open(Path(a['sprite']) if i==0 else ROOT/a['sprite']).convert('RGBA');im=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);b=im.getchannel('A').getbbox()
 px=round(x+w/2-(b[0]+b[2])/2);py=ground-a['pivot'][1]*2
 assert px+b[0]>=x+2 and px+b[2]<=x+w-2 and py+b[1]>=y+2
 board.paste(im,(px,py),im);d.line((x+10,ground,x+w-10,ground),fill='#8a8d76')
 for dy,t,s in [(13,a['name'],22),(44,str(a['measuredBodyHeightPx'])+' world px',15)]:
  box=d.textbbox((0,0),t,font=font(s));d.text((x+(w-(box[2]-box[0]))/2,ground+dy),t,font=font(s),fill='#263c33')
board.save(ROOT/'review/lineup-2x.png')
print('Registered four southeast boss identity concepts; no animation/gameplay/approval changes.')
