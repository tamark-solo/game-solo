from pathlib import Path
from PIL import Image
import json,hashlib,math
ROOT=Path(__file__).resolve().parent;PACKAGE=ROOT.parents[2]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def resolve(file):return (PACKAGE/file).resolve()
checks=[]
def check(value,name):
 checks.append({'name':name,'passed':bool(value)})
 if not value:raise AssertionError(name)
def edge(im):
 a=im.getchannel('A');w,h=im.size
 return any(a.crop(r).getbbox() for r in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)])
def main():
 reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));check(len(reg['clips'])==64,'64clips');check(reg['socketReviewComplete'] and not reg['manualReviewPending'],'manual review complete');check(not reg['ownerApproved'] and not reg['runtimeIntegrated'],'candidate/runtime boundary')
 dirs=['north','northeast','east','southeast','south','southwest','west','northwest'];acts=['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe']
 check({(c['direction'],c['action']) for c in reg['clips']}=={(d,a) for d in dirs for a in acts},'true direction/action coverage')
 for r in gen['records']:
  if r['status']!='generated':continue
  check(sha(resolve(r['raw']))==r['sha256'],'raw:'+r['id']);check(sha(resolve(r['prompt']))==r['promptSha256'],'prompt:'+r['id']);check(r['tool']=='built-in-imagegen' and r['transparentRequested'],'built-in transparent:'+r['id'])
  for p in r['inputs']:check(sha(resolve(p['file']))==p['sha256'],'input:'+r['id']+p['file'])
 for s in reg['sources']:
  check(sha(resolve(s['file']))==s['sha256'],'source:'+s['id']);check(s['socketReviewComplete'],'source socket review:'+s['id'])
 source_by={s['id']:s for s in reg['sources']}
 allgroups=reg['calibrations']+reg['clips'];frame_count=0
 for group in allgroups:
  isclip=group in reg['clips'];atlas=Image.open(resolve(group['atlas'])).convert('RGBA') if isclip else None
  if isclip:check(sha(resolve(group['atlas']))==group['atlasSha256'],'atlas:'+group['id'])
  for f in group['frames']:
   frame_count+=1;p=resolve(f['file']);im=Image.open(p).convert('RGBA');check(sha(p)==f['sha256'],'frame sha:'+f['file']);check(list(im.size)==f['canvas'],'canvas:'+f['file']);check(im.getchannel('A').getbbox() is not None,'alpha:'+f['file']);check(not edge(im),'edges:'+f['file'])
   if isclip:
    x,y,w,h=f['atlasRect'];check(atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes(),'atlas RGBA:'+f['file']);check(all(v==0 for v in atlas.getchannel('A').crop((x-2,y-2,x+w+2,y)).getdata()) and all(v==0 for v in atlas.getchannel('A').crop((x-2,y+h,x+w+2,y+h+2)).getdata()),'gutter top/bottom:'+f['file']);check(all(v==0 for v in atlas.getchannel('A').crop((x-2,y,x,y+h)).getdata()) and all(v==0 for v in atlas.getchannel('A').crop((x+w,y,x+w+2,y+h)).getdata()),'gutter left/right:'+f['file'])
   if f['file'].startswith('../'):continue
   check(f['grip']['manualConfirmed'],'manual palm:'+f['file']);check(abs(f['sourceScale']-source_by[f['sourceId']]['scale'])<1e-12,'one factor:'+f['file']);check(sha(resolve(f['sourcePartMask']))==f['sourcePartMaskSha256'],'part mask:'+f['file'])
   raw=Image.open(resolve(f['source'])).convert('RGBA');sx,sy,sw,sh=f['sourceRect'];crop=raw.crop((sx,sy,sx+sw,sy+sh));crop.putalpha(Image.open(resolve(f['sourcePartMask'])).convert('L'));scale=f['sourceScale'];rx,ry=f['root'];px,py=f['pivot'];expected=crop.transform(tuple(f['canvas']),Image.Transform.AFFINE,(1/scale,0,rx-sx-px/scale,0,1/scale,ry-sy-py/scale),Image.Resampling.NEAREST);expected.putalpha(expected.getchannel('A').point(lambda v:255 if v>=128 else 0));check(expected.tobytes()==im.tobytes(),'source RGBA reconstruction:'+f['file'])
   point=f['grip']['source'];n=f['grip']['native'];check(max(abs(n[0]-(px+(point[0]-rx)*scale)),abs(n[1]-(py+(point[1]-ry)*scale)))<=.001,'source grip registration:'+f['file']);check(-180<=f['grip']['angleDeg']<=180,'wrist delta:'+f['file'])
   if f['grip']['visibility'] in ('seal','open-palm','occluded'):check(f['grip']['attachmentPolicy']=='detach-hover','detached candidate:'+f['file'])
  if isclip and not group.get('reusedFrom') and group['action'].startswith('cast-'):
   gate=480 if group['action']=='cast-single-target' else 800;check(sum(f['durationMs'] for f in group['frames'][:3])==gate,'Core release gate:'+group['id'])
 check(sum(len(c['frames']) for c in reg['clips'])==364,'actual motion keys364');check(sum(len(c['frames']) for c in reg['calibrations'])==114,'actual calibration114')
 report={'schema':'equipment-body-B-scoped-verify-v2','status':'passed','checkCount':len(checks),'coverage':reg['coverage'],'canonicalAndCalibrationFrames':frame_count,'registrationSha256':sha(ROOT/'registration.json'),'checks':checks,'ownerApproved':False,'runtimeIntegrated':False}
 (ROOT/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':report['status'],'checks':len(checks),'frames':frame_count,'coverage':reg['coverage']}))
if __name__=='__main__':main()
