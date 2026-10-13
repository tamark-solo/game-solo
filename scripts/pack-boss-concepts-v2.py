"""Register only Boss02 refinements; approved wolf and previous ART are read-only."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont
WORKSPACE=Path(__file__).resolve().parents[1]
ROOT=WORKSPACE/'docs/design/characters/van-hai-boss-concepts-v2'
assert ROOT.resolve().is_relative_to(WORKSPACE.resolve())
p=json.loads((ROOT/'production.json').read_text(encoding='utf-8'))
sha=lambda f:hashlib.sha256(Path(f).read_bytes()).hexdigest()
for ref in p['preservedBoss01']:assert sha(WORKSPACE/ref['file'])==ref['sha256'],ref['file']
assert sha(WORKSPACE/p['sourcePlan'])==p['sourcePlanSha256']
old_rows=json.loads((ROOT/'../van-hai-boss-concepts-v1/registration.json').read_text(encoding='utf-8'))['actors']
ROOTS={
 'three-seal-puppet':([479,1110],[420,1030,622,1110],'Nearest planted broad stone boot sole; lowered fist is not support.'),
 'ancient-root':([1156,977],[1080,901,1200,977],'Forward primary root contact tip; branch/leaves and bounding center excluded.'),
 'dark-seal-officer':([503,1220],[451,1160,553,1220],'Nearest planted boot sole, excluding robe hem and mantle.'),
}
rows=[]
for a in p['actors']:
 if a['reusedFromApprovedConcept']:
  for path,key in [(a['raw'],'rawSha256'),(a['sprite'],'spriteSha256'),(a['prompt'],'promptSha256')]:assert sha(ROOT/path)==a[key]
  approval=json.loads((ROOT/a['approval']).read_text(encoding='utf-8'));assert approval['actor']==a['id'] and approval['artApproved']
  rows.append({**next(r for r in old_rows if r['id']==a['id']),'reusedFromApprovedConcept':True,'approval':a['approval']});continue
 for ref in a['inputFiles']:assert sha(WORKSPACE/ref['file'])==ref['sha256'],ref['file']
 source=Image.open(ROOT/a['raw']).convert('RGBA');alpha=source.getchannel('A');mask=alpha.point(lambda v:255 if v>=210 else 0);b=mask.getbbox();assert b
 root,witness,note=ROOTS[a['slug']];assert root[1]==b[3] and b[0]<=root[0]<b[2],(a['slug'],root,b)
 isolated=source.copy();isolated.putalpha(mask);cut=isolated.crop(b);scale=a['bodyHeightPx']/cut.height;size=(round(cut.width*scale),a['bodyHeightPx']);native=cut.resize(size,Image.Resampling.NEAREST)
 nb=native.getchannel('A').getbbox();native_root=[round((root[0]-b[0])*scale),nb[3]];dest=[a['pivot'][0]-native_root[0],a['pivot'][1]-native_root[1]]
 assert min(dest)>=2 and dest[0]+size[0]<=a['canvas'][0]-2 and dest[1]+size[1]<=a['canvas'][1]-2,(a['slug'],dest,size)
 frame=Image.new('RGBA',tuple(a['canvas']));frame.alpha_composite(native,tuple(dest));frame.save(ROOT/a['sprite']);bounds=frame.getchannel('A').getbbox();height=bounds[3]-bounds[1];assert height==a['bodyHeightPx'] and bounds[3]==a['pivot'][1]
 a.update(status='concept-candidate',rawSha256=sha(ROOT/a['raw']),spriteSha256=sha(ROOT/a['sprite']),promptSha256=sha(ROOT/a['prompt']),pixelsResampled=True,nativeBounds=list(bounds),measuredBodyHeightPx=height,presentation={'shadowBaked':False,'vfxBaked':False,'liftPx':0})
 if a.get('refinement'):
  f=a['refinement'];f.update(promptSha256=sha(ROOT/f['prompt']),editTargetSha256=sha(ROOT/f['editTarget']))
 rows.append({'id':a['id'],'slug':a['slug'],'sourceSize':list(source.size),'sourceBounds':list(b),'sourcePivot':root,'sourceSupportWitness':witness,'rootBasis':note,'pivotStatus':'concept-measured-pending-motion-review','sharedNeutralScale':scale,'pixelsResampled':True,'resampling':'nearest','nativeCutoutSize':list(size),'nativeCutoutRoot':native_root,'canvasTranslation':dest,'canvas':a['canvas'],'pivot':a['pivot'],'nativeBounds':list(bounds),'bodyHeightPx':a['bodyHeightPx'],'measuredBodyHeightPx':height,'liftPx':0,'reusedFromApprovedConcept':False,'alphaPolicy':{'sourcePreserved':True,'nativeBodyThreshold':210,'binaryNativeAlpha':True,'lowAlphaSourcePixelsExcluded':sum(1 for v in alpha.get_flattened_data() if 0<v<210),'componentsRemoved':0,'rgbPainted':False},'sourceSha256':a['rawSha256'],'spriteSha256':a['spriteSha256']})
p['status']='wolf-approved-three-concepts-pending'
(ROOT/'production.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'registration.json').write_text(json.dumps({'schema':'boss-concept-registration-2','date':'2026-10-13','artApproved':False,'runtimeConsumable':False,'actors':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',n)
board=Image.new('RGB',(2640,550),'#102321');d=ImageDraw.Draw(board)
d.text((22,14),'VÂN HẢI · BOSS02 / LANG VƯƠNG GIỮ NGUYÊN',font=font(28),fill='#ead6a6');d.text((22,57),'Cùng nearest2× · Tam128 / Cổ Mộc160 là cỡ concept đề xuất · Hắc Ấn80 giữ cỡ người',font=font(18),fill='#c2d1be')
items=[{'name':'Vương Lâm','sprite':str(WORKSPACE/p['approvedPlayerReference']['file']),'pivot':[32,88],'measuredBodyHeightPx':80}]+p['actors']
for i,a in enumerate(items):
 x=16 if i==0 else 272+(i-1)*590;w=240 if i==0 else 574;ground=450;y=98;d.rounded_rectangle((x,y,x+w,y+428),radius=8,fill='#dedbc6')
 im=Image.open(Path(a['sprite']) if i==0 else ROOT/a['sprite']).convert('RGBA');im=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);b=im.getchannel('A').getbbox();px=round(x+w/2-(b[0]+b[2])/2);py=ground-a['pivot'][1]*2
 assert px+b[0]>x and px+b[2]<x+w and py+b[1]>y
 board.paste(im,(px,py),im);d.line((x+10,ground,x+w-10,ground),fill='#91886a')
 for yy,t,n in [(465,a['name'],23),(500,str(a['measuredBodyHeightPx'])+' world px'+(' · đã duyệt' if a.get('artApproved') else ''),15)]:
  box=d.textbbox((0,0),t,font=font(n));d.text((x+(w-box[2]+box[0])/2,yy),t,font=font(n),fill='#263c32')
board.save(ROOT/'review/lineup-2x.png')
print('Boss02 packed: three new sources registered, accepted wolf not written; Boss01 hashes intact.')
