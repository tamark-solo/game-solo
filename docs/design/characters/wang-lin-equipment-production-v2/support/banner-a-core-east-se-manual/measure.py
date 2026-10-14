"""Support-only E/SE source measurements, after manual review of all 47 poses."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parent
code = (ROOT.parent / 'banner-a-core-manual/measure.py').read_text(encoding='utf8')
selection = {
 'east-idle':[5,4,2,4,2,3],
 'east-run':[3,4,2,3,4,4],
 'east-cast-single-target':[3,2,2,3,2,9],
 'east-cast-aoe':[3,2,3,1,4,9],
 'southeast-idle':[4,6,4,6,5,4],
 'southeast-run':[6,3,7,4,6],
 'southeast-cast-single-target':[3,4,2,3,3,14],
 'southeast-cast-aoe':[6,3,0,5,3,13]}
cuffs = {
 'east-idle':[[-2,5]]*6,
 'east-run':[[-2,5]]*6,
 'east-cast-single-target':[[-2,5],[-5,2],[-4,6],[-5,3],[-5,3],[-1,-5]],
 'east-cast-aoe':[[-2,5],[-5,3],[-4,6],[0,7],[-5,3],[-1,-5]],
 'southeast-idle':[[-2,5]]*6,
 'southeast-run':[[-2,5]]*5,
 'southeast-cast-single-target':[[-2,5],[-5,3],[-4,6],[-5,2],[-5,2],[-1,-5]],
 'southeast-cast-aoe':[[5,0],[-3,6],[2,6],[-5,2],[-5,2],[-1,-5]]}
boots = {
 'east-run':[[77,174],[266,385],[476,590],[659,782],[871,989],[1087,1184]],
 'southeast-run':[[81,176],[277,367],[519,548],[684,759],[916,971]]}
code = re.sub(r'selection=\{.*?\}\ncuffDeltas=', 'selection='+repr(selection)+'\ncuffDeltas=', code, flags=re.S)
code = re.sub(r'cuffDeltas=\{.*?\}\n# Source X', 'cuffDeltas='+repr(cuffs)+'\n# Source X', code, flags=re.S)
code = re.sub(r'runReferences=\{.*?\}\nmeasurements=', 'runReferences='+repr(boots)+'\nmeasurements=', code, flags=re.S)
code = code.replace("'frames':48,'directions':['north','northeast']", "'frames':47,'directions':['east','southeast']")
code = code.replace("'sourcePalmMeasurements':48,'sourceCuffLocations':48,'sourceRootReviews':48", "'sourcePalmMeasurements':47,'sourceCuffLocations':47,'sourceRootReviews':47")
code = code.replace("notes+=' Source recovers with a visible closed fist although prompt asked free hands; equipment remains planted through recovery.'", "notes+=' Actual visible hanging palm selected; cuff is above the hand. Equipment remains planted through recovery.'")
code = code.replace("'palmUncertaintyNativePx':1.5", "'palmUncertaintyNativePx':(2.5 if casting and key==6 else 1.5)")
code = code.replace("'banner-a-core-manual-support-1'", "'banner-a-core-east-se-manual-support-1'")
code = code.replace('viewing all 48 raw poses', 'viewing all 47 raw poses')
exec(compile(code, str(ROOT/'measure.py'), 'exec'), {'__file__':str(ROOT/'measure.py'),'__name__':'__main__'})
import hashlib,json
report=json.loads((ROOT/'manual.json').read_text(encoding='utf8'))
report['reusedMeasurementEngine']={'file':'support/banner-a-core-manual/measure.py',
 'sha256':hashlib.sha256((ROOT.parent/'banner-a-core-manual/measure.py').read_bytes()).hexdigest()}
report['castChronologyReview']={'clipId':'banner-a-east-cast-aoe',
 'suggestedSourceKeys':[1,3,4,5,2,6],
 'reason':'Actual overhead charge precedes forward open-palms release; source points remain tied to SHA/sourceRect and must be remapped if actor accepts the chronology.',
 'appliedByHelper':False}
for frame in report['frames']:
 if frame['clipId']=='banner-a-southeast-run' and frame['key']==3:
  measurement=frame['sourceRootMeasurement']
  measurement['uncertaintyNativePx']=4
  measurement['method']='Visible lower dark boot X and partially occluded rear ankle/support X projected to the source ground plane. Rear foot endpoint cannot be measured exactly through robe; this is a disclosed support estimate, not two proven visible soles or a pelvis bone.'
  measurement['sourceBootFootprintReferences'][1]['role']='Partially occluded rear ankle/support projection estimate; exact dark sole not visible.'
  measurement['sourceBootFootprintReferences'][1]['uncertaintySourcePx']=12.5
(ROOT/'manual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
