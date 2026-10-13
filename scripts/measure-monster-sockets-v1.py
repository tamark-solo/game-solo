"""Measure native presentation socket candidates without changing any pixels.

Skin/core detections are witnesses, not skeleton reconstruction or server binding.
Occluded hands have an explicitly labelled projection. Artist review is required.
"""
from pathlib import Path
import json,math
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]/'docs/design/characters/van-hai-monster-animation-v1'
C=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
V={'south':(0,1),'southwest':(-.707,.707),'west':(-1,0),'northwest':(-.707,-.707),'north':(0,-1),'northeast':(.707,-.707),'east':(1,0),'southeast':(.707,.707)}

def clusters(mask):
    todo=set(zip(*np.where(mask)));out=[]
    while todo:
        seed=todo.pop();group=[seed];stack=[seed]
        while stack:
            y,x=stack.pop()
            for dy,dx in ((0,1),(0,-1),(1,0),(-1,0)):
                p=(y+dy,x+dx)
                if p in todo:todo.remove(p);stack.append(p);group.append(p)
        if len(group)>=2:out.append(np.array(group))
    return out

def nearest(mask,point):
    ys,xs=np.where(mask);i=np.argmin((xs-point[0])**2+(ys-point[1])**2)
    return [int(xs[i]),int(ys[i])]

def centroid(g):return [int(round(g[:,1].mean())),int(round(g[:,0].mean()))]

records=[]
for c in C['clips'].values():
    vx,vy=V[c['direction']];left=np.array([vy,-vx]);px,py=c['pivot']
    for i,f in enumerate(c['frames']):
        im=Image.open(ROOT/f['file']).convert('RGBA');p=np.array(im).astype(int);mask=p[:,:,3]>0
        x0,y0,x1,y1=f['bounds'];h=y1-y0;w=x1-x0;cx=(x0+x1)/2
        r,g,b=p[:,:,0],p[:,:,1],p[:,:,2]
        witnesses={};sockets={};method='opaque anatomical endpoint candidate'
        if c['slug'] in ['dark-talisman-rogue','black-silk-adept']:
            skin=mask&(r>150)&(g>105)&(b>65)&(r-g>12)&(g-b>9)&(r<g*1.65)
            groups=clusters(skin);hands=[]
            for group in groups:
                x,y=centroid(group)
                if y<y0+h*.26 or y>y0+h*.87:continue
                if y<y0+h*.47 and abs(x-cx)<w*.25:continue
                if abs(x-cx)<w*.13 and y>y0+h*.5:continue
                hands.append((group,[x,y]))
            for side,sign in [('handLeft',1),('handRight',-1)]:
                if hands:
                    group,point=max(hands,key=lambda t:sign*np.dot(np.array(t[1])-[cx,y0+h*.65],left))
                    sockets[side]=point;witnesses[side]={'method':'native warm-skin connected region candidate','pixels':len(group),'bounds':[int(group[:,1].min()),int(group[:,0].min()),int(group[:,1].max()+1),int(group[:,0].max()+1)]}
                else:
                    point=nearest(mask,[cx+sign*left[0]*w*.22,y0+h*.65+sign*left[1]*h*.1])
                    sockets[side]=point;witnesses[side]={'method':'occluded hand anatomical projection onto opaque body','pixels':0}
            sockets['emit']=sockets['handLeft'];method='casting hand candidate; no gameplay binding'
        elif c['slug']=='quiet-wisp':
            core=mask&(g>125)&(g>=r*.9)&(b>90)&(np.indices(mask.shape)[0]<y0+h*.7)
            groups=clusters(core)
            if groups:
                group=max(groups,key=len);sockets['emit']=centroid(group);witnesses['emit']={'method':'native jade core region','pixels':len(group)};method='measured visible core centroid'
        elif c['slug'] in ['cloud-wolf','wolf-caller']:
            eyes=mask&(r>165)&(r-g>22)&(g-b>30)&(np.indices(mask.shape)[0]<y0+h*.65)
            groups=clusters(eyes)
            if groups:
                group=max(groups,key=lambda a:len(a)+vx*(a[:,1].mean()-cx)*.2);point=centroid(group)
                sockets['emit']=nearest(mask,[point[0]+vx*4,point[1]+3]);witnesses['emit']={'method':'native amber eye region plus muzzle projection','pixels':len(group)};method='measured eye / candidate muzzle'
        if 'emit' not in sockets:
            if c['slug']=='spirit-fungus':point=[cx,y0+h*.4];method='cap anatomical projection onto opaque pixels'
            else:
                ys,xs=np.where(mask);score=vx*(xs-cx)+vy*(ys-(y0+h*.55))*.4
                keep=score>=np.quantile(score,.95);point=[float(np.median(xs[keep])),float(np.median(ys[keep]))]
            sockets['emit']=nearest(mask,point)
        f['sockets']=sockets
        records.append({'clip':c['id'],'frame':i,'file':f['file'],'sockets':sockets,'method':method,'witnesses':witnesses,'status':'presentation-candidate','artistApproved':False})
C['socketStatus']='Measured skin/core witnesses and anatomical projections; presentation candidates, not approved gameplay sockets'
C['sockets']='socket-registration.json'
(ROOT/'catalog.json').write_text(json.dumps(C,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'socket-registration.json').write_text(json.dumps({'version':1,'artApproved':False,'rgbPainted':False,'registration':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'framesWithSockets':len(records),'handsAreCandidate':True,'pixelsChanged':False}))
