"""Immutable source/native QA snapshot; no actor mutation or art editing."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent
code=(ROOT.parent/'banner-a-core-manual/prepare-review.py').read_text(encoding='utf8')
code=code.replace("('north','northeast') and c['action'] in ('idle','run','cast-single-target','cast-aoe')", "('north','northeast','east','southeast') and c['action'] in ('hit','death','meditate','gather')")
code=code.replace('assert len(clips)==8','assert len(clips)==16')
code=code.replace("resize((224,224),Image.Resampling.NEAREST),(x+410,y+618)","resize((body.width*2,body.height*2),Image.Resampling.NEAREST),(x+550,y+740)")
code=code.replace('3*660,2*880','3*1000,2*1000').replace('(fi%3)*660','(fi%3)*1000').replace('(fi//3)*880','(fi//3)*1000')
code=code.replace('y+630','y+725')
code=code.replace('banner-a-core-review-snapshot-1','banner-a-foundation-hands-review-snapshot-1')
code=code.replace('48 fixed N/NE core frames reserved by actor A; raw source and existing native shown, no ART edits.','96 N/NE/E/SE foundation palms reserved by actor A; roots are read-only reference proposals assigned to other workers. Raw source and current native shown, no ART edits.')
exec(compile(code,str(ROOT/'prepare-review.py'),'exec'),{'__file__':str(ROOT/'prepare-review.py'),'__name__':'__main__'})
