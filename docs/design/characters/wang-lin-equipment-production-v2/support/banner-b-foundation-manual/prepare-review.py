"""Snapshot actor-B assigned geometry and render true-alpha inspection aids."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1];ACTOR=PACK/'actors/b/banner'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=ACTOR/'review/foundation-proposals.json';all=json.loads(p.read_text(encoding='utf8'))
ids=['banner-b-'+d+'-'+g+'-r1' for d in ['west','northwest'] for g in ['damage','practice']]
sources={k:all[k] for k in ids}
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
for sid,s in sources.items():
    source=ACTOR/'sources'/(sid+'.png');assert sha(source)==s['sourceSha256'];s['sourceFile']=source.relative_to(PACK).as_posix()
    im=Image.open(source).convert('RGBA')
    for start in range(0,len(s['entries']),9):
        page=Image.new('RGB',(1980,1980),(234,236,229));draw=ImageDraw.Draw(page)
        for local,e in enumerate(s['entries'][start:start+9]):
            l,t,w,h=e['sourceRect'];crop=im.crop((l,t,l+w,t+h));bg=Image.new('RGBA',crop.size,(244,245,240,255));bg.alpha_composite(crop)
            x=(local%3)*660;y=(local//3)*660
            page.paste(bg.convert('RGB').resize((w*2,h*2),Image.Resampling.NEAREST),(x+12,y+50))
            draw.text((x+12,y+8),sid+' raw '+str(e['rawIndex']),font=font,fill=(10,10,10))
            draw.text((x+12,y+29),'sourceRect '+str(e['sourceRect'])+' root '+str(e['rootProposal']),font=font,fill=(10,10,10))
            for wi,warm in enumerate(e['warmProposals']):
                cx=x+12+(warm['center'][0]-l)*2;cy=y+50+(warm['center'][1]-t)*2
                draw.ellipse((cx-3,cy-3,cx+3,cy+3),outline=(0,150,180),width=2)
                draw.text((cx+5,cy-7),str(wi),font=font,fill=(0,90,150),stroke_width=1,stroke_fill=(255,255,255))
        target=ROOT/'review'/(sid+'-source-'+str(start).zfill(2)+'.png');target.parent.mkdir(parents=True,exist_ok=True);page.save(target)
(ROOT/'snapshot.json').write_text(json.dumps({'schema':'banner-b-foundation-manual-snapshot-1','upstream':str(p),'upstreamSHA':sha(p),
    'sources':sources,'sourceFigureCount':sum(len(s['entries']) for s in sources.values()),'ownerApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'sources':len(sources),'actualFigures':sum(len(s['entries']) for s in sources.values())}))
