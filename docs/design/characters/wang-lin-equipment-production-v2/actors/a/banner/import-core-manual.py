from pathlib import Path
import json,hashlib,math,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
reg=read(ROOT/'registration.json');frames={c['id']+':'+str(i+1):f for c in reg['clips'] for i,f in enumerate(c['frames'])};manual=read(ROOT/'manual.json') if (ROOT/'manual.json').exists() else {};roots=read(ROOT/'root-overrides.json') if (ROOT/'root-overrides.json').exists() else {}
support=V2/'support'/sys.argv[1];d=read(support/'manual.json')
for q in d['frames']:
 key=q['clipId']+':'+str(q['key']);f=frames[key];assert sha(V2/q['source'])==q['sourceSha256'];assert q['sourceScale']==f['sourceScale'];assert q['sourceRect']==f['sourceRect'];assert q['manualSourceViewed']
 root=q['sourceRoot'];source=q['sourcePalm'];delta=[source[i]-q['sourceCuff'][i] for i in range(2)] if q.get('sourceCuff') else [0,0];angle=math.degrees(math.atan2(delta[1],delta[0]))+90 if any(delta) else 0
 m={'sourceManual':source,'sourcePalm':source,'sourceCuff':q.get('sourceCuff'),'sourcePalmReviewed':True,'sourceCuffReviewed':not q.get('cuffEstimate',False),'cuffEstimate':q.get('cuffEstimate',False),'palmUncertaintyNativePx':q['palmUncertaintyNativePx'],'cuffUncertaintyNativePx':q['cuffUncertaintyNativePx'],'sourceId':q['sourceId'],'sourceRect':q['sourceRect'],'visibility':q['visibility'],'attachmentPolicy':q['attachmentPolicy'],'closedGripConfirmed':q['heldGripClaim'],'heldGripClaim':q['heldGripClaim'],'dominantGripClosed':q['heldGripClaim'],'selection':'manual-original-source-observation','angleDeg':round(angle,3),'angleMeasurement':'Projected source palm/cuff vector, no exact rig bone; pole remains upright and planted according to fixture choreography.','semanticNotes':q['semanticNotes'],'sourceOcclusionRect':q['sourceOcclusionRect'],'manualEvidence':str((support/q['evidence']).relative_to(V2)).replace('\\','/'),'manualEvidenceSha256':q['evidenceSha256'],'observationCanonicalSha256':q['frameSha256'],'approved':False}
 manual[key]=m;roots[key]={'root':root,'sourceRoot':root,'sourceRootReviewed':True,'lift':0,'sourceRootMeasurement':q['sourceRootMeasurement'],'sourceSupportPlaneY':q['sourceRootMeasurement']['sourceSupportPlaneY'],'uncertaintyNativePx':q['sourceRootMeasurement']['uncertaintyNativePx'],'sourceEvidence':m['manualEvidence'],'exactBoneClaim':False,'liftBakedOnce':True}
write(ROOT/'manual.json',manual);write(ROOT/'root-overrides.json',roots);print('Imported',len(d['frames']),'actual source palms/cuffs and reviewed projected roots. Native socket recomputed on next pack.')
