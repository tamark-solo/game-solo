"""Source/canonical comparison aids only; no actor mutation or art repaint."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json
ROOT=Path(__file__).resolve().parent
PACK=ROOT.parents[1];ACTOR=PACK/'actors/a/banner'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=ACTOR/'registration.json';data=json.loads(reg.read_text(encoding='utf8'));lookup=json.loads((ACTOR/'candidate-lookup.json').read_text(encoding='utf8'))['frames']
clips=[c for c in data['clips'] if c['direction'] in ('north','northeast') and c['action'] in ('idle','run','cast-single-target','cast-aoe')]
assert len(clips)==8
out=[]
for c in clips:
    page=Image.new('RGB',(3*660,2*880),(224,226,219));draw=ImageDraw.Draw(page)
    for fi,f in enumerate(c['frames']):
        source=PACK/f['source'];native=PACK/f['file'];assert sha(native)==f['sha256']
        im=Image.open(source).convert('RGBA');l,t,w,h=f['sourceRect'];crop=im.crop((l,t,l+w,t+h))
        bg=Image.new('RGBA',crop.size,(237,238,232,255));bg.alpha_composite(crop)
        # One display factor for all cells. Original raw and canonical are unmodified.
        enlarged=bg.convert('RGB').resize((w*2,h*2),Image.Resampling.NEAREST)
        x=(fi%3)*660;y=(fi//3)*880
        page.paste(enlarged,(x+10,y+48))
        body=Image.open(native).convert('RGBA');n=Image.new('RGBA',body.size,(237,238,232,255));n.alpha_composite(body)
        page.paste(n.convert('RGB').resize((224,224),Image.Resampling.NEAREST),(x+410,y+618))
        draw.text((x+10,y+8),c['id']+' key'+str(fi+1),fill=(10,10,10))
        draw.text((x+10,y+24),'sourceRect '+str(f['sourceRect'])+' factor '+str(round(f['sourceScale'],6)),fill=(10,10,10))
        draw.text((x+10,y+630),'native below-right, 2x; raw above, 2x',fill=(10,10,10))
        rec={'clipId':c['id'],'action':c['action'],'direction':c['direction'],'key':fi+1,'sourceId':f['sourceId'],
           'source':f['source'],'sourceSha256':sha(source),'file':f['file'],'frameSha256':f['sha256'],
           'sourceRect':f['sourceRect'],'sourceScale':f['sourceScale'],'pivot':f['pivot'],'proposedRoot':f['root'],'lift':f['lift'],
           'candidates':lookup[c['id']+':'+str(fi+1)]['candidates']}
        out.append(rec)
    p=ROOT/'review'/('source-'+c['id']+'.png');p.parent.mkdir(parents=True,exist_ok=True);page.save(p)
(ROOT/'snapshot.json').write_text(json.dumps({'schema':'banner-a-core-review-snapshot-1','registration':str(reg),'registrationSHA':sha(reg),'frames':out,
    'scope':'48 fixed N/NE core frames reserved by actor A; raw source and existing native shown, no ART edits.'},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'frames':len(out),'sourcePages':len(clips),'registrationSHA':sha(reg)}))
