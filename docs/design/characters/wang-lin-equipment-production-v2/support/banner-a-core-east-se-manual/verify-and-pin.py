from pathlib import Path
ROOT=Path(__file__).resolve().parent
code=(ROOT.parent/'banner-a-core-manual/verify-and-pin.py').read_text(encoding='utf8')
code=code.replace('48 actually reviewed N/NE core frames','47 actually reviewed E/SE core frames')
code=code.replace('==48','==47').replace("'frames':48","'frames':47")
code=code.replace('banner-a-core-manual-verification-1','banner-a-core-east-se-manual-verification-1')
code=code.replace('banner-a-core-manual-delivery-1','banner-a-core-east-se-manual-delivery-1')
exec(compile(code,str(ROOT/'verify-and-pin.py'),'exec'),{'__file__':str(ROOT/'verify-and-pin.py'),'__name__':'__main__'})
