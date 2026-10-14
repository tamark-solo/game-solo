import json,math,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1];A=V2/'actors/a/sword'
lookup=json.loads((A/'candidate-lookup.json').read_text(encoding='utf-8'))['frames']
reg=json.loads((A/'registration.json').read_text(encoding='utf-8'))
# Indices chosen by viewing actual canonical silhouettes; warm islands themselves do not classify hands.
choices={
 'west-idle':([8,10,7,11,10,10],['visible']*6,[[63,81]]*6),
 'west-run':([6,6,11,6,7,9],['visible']*6,[[77,67],[77,65],[69,66],[74,68],[76,65],[77,68]]),
 'west-cast-single-target':([2,2,6,4,3,5],['open-palm','seal','seal','open-palm','open-palm','visible'],[[29,65],[34,67],[47,70],[25,64],[25,63],[63,80]]),
 'west-cast-aoe':([[51.5,66.5],0,3,4,3,8],['seal','open-palm','open-palm','open-palm','seal','visible'],[[53,70],[70,38],[25,63],[23,61],[52,70],[63,81]]),
 'northwest-idle':([6,7,8,7,9,10],['visible']*6,[[42,79]]*6),
 'northwest-run':([3,4,6,3,2,5],['visible']*6,[[29,65],[36,71],[39,76],[29,69],[32,67],[36,70]]),
 'northwest-cast-single-target':([0,2,4,0,3,9],['open-palm','seal','seal','open-palm','open-palm','visible'],[[28,65],[35,68],[36,68],[25,62],[25,64],[42,79]]),
 'northwest-cast-aoe':([2,0,0,2,2,7],['seal','open-palm','open-palm','open-palm','seal','visible'],[[41,67],[32,46],[28,61],[27,60],[43,67],[42,79]])
}
frames={}
for suffix,(selections,vis,cuffs) in choices.items():
    cid='sword-a-'+suffix;c=next(c for c in reg['clips'] if c['id']==cid)
    out=Image.new('RGBA',(3*560,2*540),(28,33,45,255));draw=ImageDraw.Draw(out)
    for i,f in enumerate(c['frames']):
        key=cid+':'+str(i+1);chosen=selections[i]
        candidate=lookup[key][chosen] if isinstance(chosen,int) else None
        native=candidate['native'] if candidate else chosen
        cuff=cuffs[i];im=Image.open(V2/f['file']).convert('RGBA')
        baseline=90 if suffix.startswith('west-') else 105
        wrist=math.degrees(math.atan2(native[1]-cuff[1],native[0]-cuff[0]))
        delta=(wrist-baseline+180)%360-180
        source=[f['root'][0]+(native[0]-f['pivot'][0])/f['sourceScale'], f['root'][1]+(native[1]-f['pivot'][1]+f.get('lift',0))/f['sourceScale']]
        entry={'clipId':cid,'frameIndex':i,'frameSha256':f['sha256'],'sourceId':f['sourceId'],'sourceRect':f['sourceRect'],'candidateIndex':chosen if candidate else None,'native':native,'source':source,'visibility':vis[i],'attachmentPolicy':'held-candidate' if vis[i]=='visible' else 'detach-hover','manualCuffNative':cuff,'approxWristDeltaDeg':round(delta,2),'wristDeltaBasis':'Manual in-plane cuff-to-palm vector minus approximate rest forearm axis same direction; actor A owner must confirm/refine source cuff pixel before final angle.','manualPalmReviewed':True,'ownerApproved':False,'proof':f'review/{cid}-manual-proposal.png'}
        if candidate:entry['candidateRect']=candidate['rect']
        frames[key]=entry
        ox=(i%3)*560+16;oy=(i//3)*540+36
        b=Image.new('RGBA',im.size,(28,33,45,255));b.alpha_composite(im);out.paste(b.resize((448,448),Image.Resampling.NEAREST),(ox,oy))
        nx=ox+native[0]*4;ny=oy+native[1]*4;cx=ox+cuff[0]*4;cy=oy+cuff[1]*4
        draw.line((cx,cy,nx,ny),fill=(90,215,230),width=1);draw.ellipse((nx-3,ny-3,nx+3,ny+3),outline=(70,255,120),width=2);draw.ellipse((cx-2,cy-2,cx+2,cy+2),outline=(250,175,70),width=1)
        crop=im.crop((int(native[0])-10,int(native[1])-10,int(native[0])+11,int(native[1])+11));bg=Image.new('RGBA',crop.size,(28,33,45,255));bg.alpha_composite(crop);out.paste(bg.resize((84,84),Image.Resampling.NEAREST),(ox+448,oy+272))
        draw.text((ox,oy-25),key+' '+vis[i]+' '+str(chosen),fill=(220,230,245))
    out.save(ROOT/'review'/f'{cid}-manual-proposal.png')
(ROOT/'manual-west-northwest.json').write_text(json.dumps({'schema':'wang-lin-a-sword-manual-assist-v1','role':'Actual palm selections on canonical poses; source/pivot immutable. Cuff and wrist deltas are assist proposals for actor A owner source confirmation. Green palm/orange cuff proofs reviewed.','frameCount':len(frames),'actorAWriteCount':0,'frames':frames},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('48 manual palm proposals / 8 contact sheets saved')
