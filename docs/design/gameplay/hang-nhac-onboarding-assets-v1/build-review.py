"""Build local art review boards from pinned exports. Never calls a generator."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[3]
read=lambda path:json.loads(path.read_text(encoding='utf-8-sig'))
manifest=read(BASE/'assets.json')
measurements=read(BASE/'pivot-measurements.json')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
font=lambda size,bold=False:ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),size)
for asset,measure in zip(manifest['assets'],measurements['assets']):
    assert asset['id']==measure['id']
    assert sha(BASE/asset['native']['path'])==measure['nativeSha256']
    assert asset['native']['pivot']==measure['pivot']
    grid=Image.open(BASE/'review'/(asset['id']+'-grid.png')).convert('RGB')
    draw=ImageDraw.Draw(grid)
    coords=[(p['x']*6,p['y']*6+32) for p in measure['supportPoints']]
    if len(coords)>1:draw.line(coords,fill='#d554b0',width=2)
    for x,y in coords:draw.ellipse((x-4,y-4,x+4,y+4),outline='#d554b0',width=2)
    px=measure['pivot']['x']*6;py=measure['pivot']['y']*6+32
    draw.line((px-10,py,px+10,py),fill='#df3d21',width=2)
    draw.line((px,py-10,px,py+10),fill='#df3d21',width=2)
    grid.save(BASE/measure['evidence'])

W,H=1440,1040
board=Image.new('RGBA',(W,H),'#f1ead9')
d=ImageDraw.Draw(board)
d.rectangle((0,0,W,145),fill='#143c3d')
d.text((44,23),'HẰNG NHẠC / NHẬP MÔN V2',font=font(17,True),fill='#bdd2b7')
d.text((42,49),'Mẫu vật · Dẫn khí · Đối chứng',font=font(38,True),fill='#fcf5de')
d.text((44,106),'ĐỢT ASSET 01   /   13.10.2026   /   BẢN XEM THỬ CHỜ DUYỆT HÌNH',font=font(15),fill='#d8d1b9')
labels=['Mang mẫu qua trận · HN04','Đọc vị trí dẫn khí · HN04','Nhận mẫu và kiểm chứng · HN06 / HN09']
for i,asset in enumerate(manifest['assets']):
    x=32+i*468
    d.rounded_rectangle((x,169,x+440,616),radius=14,fill='#fbf7ec',outline='#d7cebb',width=1)
    d.text((x+22,186),f'0{i+1}',font=font(14,True),fill='#8b7144')
    d.text((x+22,214),asset['label'],font=font(25,True),fill='#173d3c')
    source=Image.open(ROOT/asset['alpha']['path']).convert('RGBA').crop(asset['crop']['box'])
    source.thumbnail((365,270),Image.Resampling.LANCZOS)
    board.alpha_composite(source,(x+220-source.width//2,256+(270-source.height)//2))
    d.text((x+22,542),labels[i],font=font(16),fill='#355957')
    n=asset['native'];p=n['pivot']
    d.text((x+22,573),f"Native {n['width']} × {n['height']} · Chân ({p['x']},{p['y']})",font=font(15),fill='#756b57')
d.text((36,641),'ĐỐI CHIẾU TRONG THẾ GIỚI · 1×',font=font(17,True),fill='#234d47')
d.text((36,671),'Vương Lâm Pixel02: 64 × 96 / chân (32,88). Hình trên được phóng để xem nét; dải dưới giữ nguyên pixel.',font=font(16),fill='#6b725f')
actor=Image.open(BASE/manifest['actor']['path']).convert('RGBA')
world=Image.open(BASE/manifest['mapCrop']).convert('RGBA')
for i,asset in enumerate(manifest['assets']):
    x=32+i*468
    scene=world.crop((80,25,520,205))
    ap=(145,148); pp=(246,148)
    scene.alpha_composite(actor,(ap[0]-32,ap[1]-88))
    n=asset['native'];p=n['pivot'];prop=Image.open(BASE/n['path']).convert('RGBA')
    scene.alpha_composite(prop,(pp[0]-p['x'],pp[1]-p['y']))
    board.alpha_composite(scene,(x,707))
d.text((36,910),'TRẠNG THÁI MẪU',font=font(16,True),fill='#234d47')
d.text((36,936),'Một nguồn, ba cỡ icon.',font=font(15),fill='#6b725f')
d.text((36,958),'Không thêm vật phẩm vào túi.',font=font(15),fill='#6b725f')
for i,icon in enumerate(manifest['assets'][0]['icons']):
    x=312+i*116;pic=Image.open(BASE/icon['path']).convert('RGBA')
    board.alpha_composite(pic,(x+(64-pic.width)//2,905+(64-pic.height)//2))
    d.text((x+6,978),f"{icon['width']} px",font=font(15),fill='#355957')
d.text((730,914),'Nguồn alpha + prompt + hash được lưu đầy đủ.',font=font(17),fill='#355957')
d.text((730,944),'SVG cảnh báo tách rời, hình dạng đọc được trên sáng/tối.',font=font(16),fill='#6b725f')
d.text((730,974),'Chưa ghép vào gameplay hoặc đặt lên map.',font=font(16),fill='#6b725f')
board.convert('RGB').save(BASE/'review'/'overview.png')
print('Built overview and three hash-verified pivot evidence boards.')
