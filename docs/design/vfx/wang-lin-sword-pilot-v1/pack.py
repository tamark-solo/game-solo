"""Measured extraction only. No raster painting, alpha thresholding or per-frame scaling."""
from PIL import Image, ImageDraw
from pathlib import Path
import json, hashlib, math

ROOT=Path(__file__).resolve().parent
PLAN=json.loads((ROOT/'plan.json').read_text(encoding='utf8'))
GENERATION=json.loads((ROOT/'generation.json').read_text(encoding='utf8'))
EMITTERS={
 'st-warning':[(248,378),(246,380),(255,390),(266,333),(258,334),(259,335)],
 'st-charge':[(264,263),(240,271),(253,264),(264,206),(248,186),(258,233)],
 'st-release':[(270,317),(254,312),(219,315),(267,253),(266,250),(263,253)],
 'st-resolve':[(266,432),(245,446),(237,452),(267,411),(247,411),(243,417)],
 'st-tail':[(256,280),(256,274),(256,280),(256,276),(256,276),(256,276)],
 'aoe-warning':[(255,449),(257,449),(255,447),(255,445),(257,443),(257,444)],
 'aoe-deploy':[(255,478),(256,482),(262,485),(258,466),(260,466),(258,466)],
 'aoe-active':[(256,466),(258,473),(259,479),(258,474),(257,474),(260,478)],
 'aoe-contact':[(256,463),(262,466),(258,470),(254,452),(256,451),(259,453)],
 'aoe-collapse':[(257,480),(258,478),(260,481),(258,466),(256,468),(256,472)],
}
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def bounds(im, threshold=1):
 bbox=im.getchannel('A').point(lambda v:255 if v>=threshold else 0).getbbox()
 return list(bbox) if bbox else None
def edge_max(im):
 a=im.getchannel('A'); w,h=im.size
 return [a.crop(box).getextrema()[1] for box in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]]
def rgba_hash(im): return hashlib.sha256(im.tobytes()).hexdigest()
def json_write(name,obj): (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

(ROOT/'frames').mkdir(exist_ok=True)
(ROOT/'atlases').mkdir(exist_ok=True)
(ROOT/'review').mkdir(exist_ok=True)
seqs=[]; registrations=[]; assessments=[]; checks=[]; previews=[]
for s in PLAN['sequences']:
 id=s['id']; selected=next((r for r in GENERATION['sources'] if r['id']==id and r['selected']),None)
 source=ROOT/selected['file'] if selected else ROOT/'sources'/f'{id}.png'
 if not source.exists(): continue
 sheet=Image.open(source).convert('RGBA')
 sw,sh=sheet.size
 assert sw%3==0 and sh%2==0, f'{id}: invalid grid'
 cw,ch=sw//3,sh//2
 cells=[sheet.crop((i%3*cw,i//3*ch,(i%3+1)*cw,(i//3+1)*ch)) for i in range(6)]
 # Source emitter coordinates were measured at the generated 512x512 cells.
 emitters=[(round(p[0]*cw/512),round(p[1]*ch/512)) for p in EMITTERS[id]]
 physical=[bounds(cell,16) for cell in cells]
 assert all(physical), f'{id}: blank physical frame'
 widths=[b[2]-b[0] for b in physical]; heights=[b[3]-b[1] for b in physical]
 extent=max(widths) if s['extentAxis']=='width' else max(heights) if s['extentAxis']=='height' else max(widths+heights)
 scale=s['peakExtent']/extent
 resized_size=(max(1,round(cw*scale)),max(1,round(ch*scale)))
 actual_scale=(resized_size[0]/cw,resized_size[1]/ch)
 # Nearest keeps every sampled alpha level; no binary-alpha operation.
 resized=[cell.resize(resized_size,Image.Resampling.NEAREST) for cell in cells]
 scaled_emitters=[(round(x*actual_scale[0]),round(y*actual_scale[1])) for x,y in emitters]
 left=max(x for x,y in scaled_emitters); right=max(resized_size[0]-x for x,y in scaled_emitters)
 top=max(y for x,y in scaled_emitters); bottom=max(resized_size[1]-y for x,y in scaled_emitters)
 px=max(s['pivot'][0],left+4); py=max(s['pivot'][1],top+4)
 nw=max(s['canvas'][0],px+right+4); nh=max(s['canvas'][1],py+bottom+4)
 pivot=[px,py]; canvas=[nw,nh]
 frames=[]; native=[]
 outdir=ROOT/'frames'/id; outdir.mkdir(exist_ok=True)
 for i,im in enumerate(resized):
  image=Image.new('RGBA',(nw,nh),(0,0,0,0))
  offset=(px-scaled_emitters[i][0],py-scaled_emitters[i][1])
  # Copy/paste RGBA payload, never alpha-composite onto transparent.
  image.paste(im,offset)
  file=outdir/f'{i+1:03}.png'; image.save(file)
  bb=bounds(image,1); alpha_data=image.getchannel('A'); soft=sum(0<int(v)<255 for v in (alpha_data.get_flattened_data() if hasattr(alpha_data,'get_flattened_data') else alpha_data.getdata()))
  assert max(edge_max(image))==0, f'{id}/{i}: native clipping'
  native.append(image)
  frames.append({'id':id+'-'+str(i+1),'index':i,'file':f'frames/{id}/{i+1:03}.png','canvas':canvas,'pivot':pivot,'durationMs':s['durations'][i],'bounds':bb,'sourceCell':[i%3*cw,i//3*ch,cw,ch],'sourceEmitter':list(emitters[i]),'nativeOffset':list(offset),'sha256':sha(file),'rgbaSha256':rgba_hash(image),'softAlphaPixels':soft})
 gutter=2; aw=3*(nw+2*gutter); ah=2*(nh+2*gutter)
 atlas=Image.new('RGBA',(aw,ah),(0,0,0,0))
 for i,im in enumerate(native):
  x=i%3*(nw+4)+2; y=i//3*(nh+4)+2
  atlas.paste(im,(x,y)); frames[i]['rect']=[x,y,nw,nh]
 atlaspath=ROOT/'atlases'/f'{id}.png'; atlas.save(atlaspath)
 reg={'id':id,'source':str(source.relative_to(ROOT)).replace('\\','/'),'sourceSize':[sw,sh],'grid':[3,2],'sourceCellSize':[cw,ch],'physicalBoundsThreshold':16,'sourceBounds':physical,'scale':scale,'actualScale':list(actual_scale),'scalePolicy':'ONE uniform sequence scale from maximum physical extent across all six source frames; no per-frame fit','sourceEmitters':emitters,'emitterMethod':'manual measured ivory emitter/contact intersection or spectral dissolution base, per frame; same native pivot','canvas':canvas,'pivot':pivot,'pixelsResampled':True,'resampling':'nearest','alphaPolicy':'preserve sampled RGBA, no threshold; threshold16 only measures extent','sourceSha256':sha(source)}
 registrations.append(reg)
 source_edges=[edge_max(cell) for cell in cells]
 source_edges16=[any(v>=16 for v in edge) for edge in source_edges]
 ass={'id':id,'selected':True,'trueFrameHashes':len(set(rgba_hash(cell) for cell in cells)),'sourceEdgeAlphaMax':source_edges,'sourcePhysicalEdge16':source_edges16,'nativeEdgeAlphaMax':[edge_max(im) for im in native],'sourceFrameCompleteness':'inspect source; technical native padding does not prove raw completeness','notes':[]}
 if any(source_edges16): ass['notes'].append('Source has alpha>=16 at a cell boundary; inspect whether soft glow or cropped physical content.')
 if id=='aoe-active': ass['notes'].append('Three decorative spectral blades travel with the spirit artwork; not Core stake anchors, collision, extra hit or eight perspective views.')
 if id=='st-charge': ass['notes'].append('Charge evolves into an elongated ivory needle. Emitter registered to central bright knot, not bounding-box center.')
 assessments.append(ass)
 total=sum(s['durations'])
 seqs.append({'id':id,'mode':s['mode'],'phase':s['phase'],'anchor':s['anchor'],'source':reg['source'],'sourceSha256':reg['sourceSha256'],'canvas':canvas,'pivot':pivot,'durationMs':total,'loop':False,'timingPolicy':'art playback only; release/contact exclusively fixture/server facts','scale':scale,'frames':frames,'atlas':{'file':f'atlases/{id}.png','size':[aw,ah],'gutter':2,'sha256':sha(atlaspath)},'artApproved':False,'runtimeIntegrated':False})
 # Readable strips on both bright and dark backgrounds, using registered native pixels.
 for color,label in [((221,214,196,255),'light'),((26,27,31,255),'dark')]:
  strip=Image.new('RGBA',(6*nw,nh+24),color)
  draw=ImageDraw.Draw(strip)
  for i,im in enumerate(native):
   strip.alpha_composite(im,(i*nw,24)); draw.text((i*nw+4,4),id+' '+str(i+1),fill=(90,85,77,255) if label=='light' else (210,202,184,255))
  strip.save(ROOT/'review'/f'{id}-{label}-1x.png')
  previews.append({'id':id,'background':label,'file':f'review/{id}-{label}-1x.png'})
 checks.append({'id':id,'frames':6,'uniqueNativeFrames':len(set(rgba_hash(im) for im in native)),'alphaSoft':all(f['softAlphaPixels']>0 for f in frames),'nativeClipped':False,'atlasPixelParity':all(atlas.crop((f['rect'][0],f['rect'][1],f['rect'][0]+nw,f['rect'][1]+nh)).tobytes()==native[i].tobytes() for i,f in enumerate(frames))})

json_write('manifest.json',{'schema':'wang-lin-sword-pilot-vfx-manifest-1','date':'2026-10-14','status':'candidate-production-art','sharedIdentities':['huyen-tam','tich-bach'],'directionPolicy':PLAN['directionPolicy'],'artApproved':False,'runtimeIntegrated':False,'coverage':{'sequences':len(seqs),'frames':sum(len(s['frames']) for s in seqs),'directionalCreatureViews':0},'sequences':seqs})
json_write('registration.json',{'schema':'wang-lin-sword-pilot-vfx-registration-1','sequences':registrations})
json_write('review/source-assessment.json',{'schema':'wang-lin-sword-pilot-vfx-source-assessment-1','selectedSources':len(assessments),'sequences':assessments})
json_write('review/pack-verification.json',{'schema':'wang-lin-sword-pilot-vfx-pack-verification-1','checks':checks,'previews':previews,'artApproved':False,'runtimeIntegrated':False})
print(json.dumps({'sequences':len(seqs),'frames':sum(len(s['frames']) for s in seqs),'sourcePhysicalEdgeFlags':{s['id']:s['sourcePhysicalEdge16'] for s in assessments if any(s['sourcePhysicalEdge16'])},'canvas':{s['id']:s['canvas'] for s in seqs}}))
