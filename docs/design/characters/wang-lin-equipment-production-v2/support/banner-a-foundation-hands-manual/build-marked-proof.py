from pathlib import Path
ROOT=Path(__file__).resolve().parent
code=(ROOT.parent/'banner-a-core-east-se-manual/build-marked-proof.py').read_text(encoding='utf8')
code=code.replace("('east','southeast')","('north','northeast','east','southeast')")
exec(compile(code,str(ROOT/'build-marked-proof.py'),'exec'),{'__file__':str(ROOT/'build-marked-proof.py'),'__name__':'__main__'})
