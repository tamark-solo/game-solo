from pathlib import Path
from PIL import Image
import importlib.util,json,statistics
ROOT=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('candidate_marks',ROOT/'candidate-proof.py');c=importlib.util.module_from_spec(s);s.loader.exec_module(c)
s=importlib.util.spec_from_file_location('source_geometry',ROOT/'inspect-source.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
def measure(im,p,calheight,scale):
 n=g.native(im,p,p['root'],scale);bb=n.getbbox();top=bb[1];height=calheight*scale
 warm=[x for x in c.candidates(n) if top+height*.17<x['native'][1]<top+height*.55]
 face=max(warm,key=lambda x:x['pixels']) if warm else None
 band=n.getchannel('A').crop((0,int(top+height*.16),112,int(top+height*.39))).getbbox()
 return {'silhouetteNative':(p['core'][3]-p['core'][1])*scale,'headHairBandWidthNative':band[2]-band[0] if band else None,'faceWarmIslandWidthNative':face['rect'][2] if face else None,'faceWarmIslandPixels':face['pixels'] if face else 0,'method':'Same-source fixed-height upper head/hair band and warm face-island width proxies; hair flow/face foreshortening can change these. These metrics alone are not anatomy approval.'}
def main():
 out=[]
 for s in json.loads((ROOT/'source-geometry.json').read_text(encoding='utf-8'))['sources']:
  im=Image.open(ROOT/s['file']).convert('RGBA');calheight=statistics.median(s['neutralHeights']);cal=[measure(im,p,calheight,s['scale']) for p in s['calibrations']];actions={a:[measure(im,p,calheight,s['scale']) for p in pp] for a,pp in s['actionCells'].items()};base={k:statistics.median(x[k] for x in cal if x[k] is not None) if any(x[k] is not None for x in cal) else None for k in ('headHairBandWidthNative','faceWarmIslandWidthNative')}
  deltas={a:{k:round((frames[-1][k]/base[k]-1)*100,2) if frames[-1][k] is not None and base[k] else None for k in base} for a,frames in actions.items()}
  out.append({'sourceId':s['id'],'calibration':cal,'actions':actions,'standingRecoveryProxyDeltasPct':deltas,'anatomyApproval':False})
 (ROOT/'anatomy-measurements.json').write_text(json.dumps({'schema':'huyen-tam-source-anatomy-proxies','sources':out},indent=2)+'\n',encoding='utf-8')
 print(json.dumps([{'id':s['sourceId'],'recovery':s['standingRecoveryProxyDeltasPct']} for s in out]))
if __name__=='__main__':main()
