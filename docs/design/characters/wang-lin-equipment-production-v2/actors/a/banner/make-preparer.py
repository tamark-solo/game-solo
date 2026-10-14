from pathlib import Path
ROOT=Path(__file__).resolve().parent
source=ROOT.parents[2]/'actors/b/banner/prepare.py'
target=ROOT/'prepare.py'
if target.exists():raise RuntimeError('Prepared A script exists; no overwrite')
text=source.read_text(encoding='utf-8')
for old,new in [('Tịch Bạch identity B','Huyễn Tâm identity A'),('Tịch Bạch','Huyễn Tâm'),('tich-bach','huyen-tam'),('banner-b','banner-a'),('actors/b/banner/','actors/a/banner/'),('own-approved-B-banner','own-approved-A-banner'),('own-B-banner','own-A-banner'),("'identityId':'b'","'identityId':'a'"),('equipment-B-banner-pack-recipe','equipment-A-banner-pack-recipe'),('Prepared Banner B:','Prepared Banner A:')]:
 text=text.replace(old,new)
old='Preserve long silver-white high ponytail with charcoal tie, two long fringe locks, own calm sharp face; ivory robe, charcoal/plum crossed collar and wide underlayers, muted violet-red waist sash and exactly THREE large red-violet seal textile panels on shoulders/robe, charcoal wrist bracers, dark human boots.'
new='Preserve own long charcoal-black high half-tied ponytail with RED hair tie, charcoal bangs and two own fringe locks, cold sharp small face and dark eyes. Own approved ritual robe: charcoal core and crossed collar, broad wine-red outer sleeves and robe panels, ivory inner lapel and hem folds, THREE large muted crimson/violet-red seal textile panels at chest and lower split robe, red sash, muted gold belt buckle/tassel and boot bindings, dark wrist bracers and human boots. No silver-white hair or ivory dominant coat; this is own Huyễn Tâm.'
if old not in text:raise RuntimeError('Own identity specification missing')
text=text.replace(old,new)
target.write_text(text,encoding='utf-8')
print('A-specific preparation script saved; no B pixels or asset/atlas copies')
