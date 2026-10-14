"""Reuse source/canonical review renderer for assigned E/SE clips only."""
from pathlib import Path
src=Path(__file__).resolve().parent.parent/'banner-a-core-manual/prepare-review.py'
code=src.read_text(encoding='utf8').replace("('north','northeast')","('east','southeast')").replace('48 fixed N/NE core frames','47 fixed E/SE core frames')
exec(compile(code,str(src),'exec'),globals())
