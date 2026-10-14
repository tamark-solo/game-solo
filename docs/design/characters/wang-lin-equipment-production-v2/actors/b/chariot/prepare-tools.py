from pathlib import Path
R=Path(__file__).resolve().parent;B=R.parent/'banner'
assert not (R/'registration.json').exists(),'Preparation cannot replace existing Cart pack'
for name in ['body-tools.py','record.py','pack.py','import-helper.py','import-manual.py','dispatch-foundations.py']:
 target=R/name;assert not target.exists();text=(B/name).read_text(encoding='utf-8').replace('Banner','Chariot').replace('banner','chariot')
 if name=='record.py':
  text=text.replace("file=ROOT/'generation.json';data=json.loads(file.read_text(encoding='utf-8'))","file=ROOT/'generation.json';data=json.loads(file.read_text(encoding='utf-8'))\n gate=V2/'checkpoints/banner.json'\n if data.get('generationAllowed') and (not gate.exists() or sha(gate)!=data.get('releasedGate',{}).get('sha256')):raise RuntimeError('Exact Banner checkpoint must be pinned before Chariot generation')")
 if name=='pack.py':
  text=text.replace("release=600 if action=='cast-single-target' else 900;end=1560 if action=='cast-single-target' else 2500","release=700 if action=='cast-single-target' else 850;end=1480 if action=='cast-single-target' else 2260")
  text=text.replace('ST600/AOE900','ST700/AOE850').replace('ST600/AOE900','ST700/AOE850').replace('closed pole hand','empty command hand').replace('physical pole planted from charge with empty hands free to command','world-ground device with empty hands free to command')
  text=text.replace("policy={'held-empty-pole-grip-candidate':'held-candidate','planted-pole-rest-or-free-gesture-no-held-claim':'ground-planted-command'}.get(source_policy,source_policy) or ('held-candidate' if held else 'detach-hover')","policy='commanded-device' # Physical Cart remains at world ground; body hand only commands it.")
  text=text.replace("'emptyHand':True,'manualConfirmed'","'emptyHand':True,'gripHeld':False,'manualConfirmed'")
 if name=='import-helper.py':text=text.replace("else 'chariot-core-assist'","else 'cart-core-assist'")
 target.write_text(text,encoding='utf-8')
print('Copied standalone Cart-only tooling; no generation or body packing')
