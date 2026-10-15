"""Prepare reference-image router requests; record via existing scoped tools.

No separate HTTP client or credential handling. Each paid POST is dispatched through
scripts/imagegen-router.mjs after an MCP plan has been saved for that source.
"""
from pathlib import Path
import hashlib,json,subprocess,sys

R=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
mode,kind,id=sys.argv[1:4]
assert kind in ['motion','view']
if mode=='batch':
 for job_id in sys.argv[3:]:
  for step in ['run','record']:
   subprocess.run([sys.executable,'-X','utf8',__file__,step,kind,job_id],check=True)
  if kind=='motion':subprocess.run([sys.executable,'-X','utf8',str(R/'inspect-batch.py'),job_id],check=True)
  print(json.dumps({'batchSourceComplete':job_id,'modelSourceReviewPending':True}),flush=True)
 sys.exit(0)
ledger_path=R/('generation.json' if kind=='motion' else 'view-masters/generation.json')
ledger=read(ledger_path);j=next(j for j in ledger['jobs'] if j['id']==id)
assert not (R/'approval.json').exists()
folder=R/'enemy-production/api-sources'/id
attempt=None
if len(sys.argv)>4:
 assert len(sys.argv[4:])==2 and sys.argv[4]=='--attempt' and sys.argv[5] in ['retry-1','retry-2'],'Only a separately authorized bounded retry is supported'
 attempt=sys.argv[5]
 auth_file='retry-authorization.json' if attempt=='retry-1' else 'retry-2-authorization.json'
 auth=read(folder/auth_file);assert auth['jobId']==id and auth['maxAdditionalPosts']==1 and auth['ownerAuthorized']
 assert read(folder/'generation-result.json')['status']=='failed-no-retry'
 if attempt=='retry-2':
  assert auth['attempt']=='retry-2' and auth['previousFailedAttempt']=='retry-1','The prior retry authorization cannot be reused'
  assert read(folder/'retry-1/generation-result.json').get('status')=='failed-no-retry','A successful prior retry must never be repeated'
  prior=read(folder/'retry-1/dispatch-receipt.json')
  assert prior['attempt']=='retry-1' and prior['postLimit']==1 and prior['ownerAuthorizedRetry']
  assert not (folder/'retry-1/source.png').exists(),'An existing image requires review, not another POST'
 folder=folder/attempt
if mode=='prepare':
 assert j['status']=='planned' and not j.get('supersededPlanned')
 assert not j.get('waitingForViewMaster'),'Own same-view missing; SE fallback forbidden'
 assert sha(R/j['prompt'])==j['promptSha256']
 for i in j['inputs']:assert sha(R/i['file'])==i['sha256']
 assert not (folder/'source.png').exists(),'Existing raw must be recorded/reviewed, never re-requested'
 folder.mkdir(parents=True,exist_ok=True)
 size=j.get('requestedSourceSize','1536x1024')
 plan_name=id if len(id)<=64 else id[:55].rstrip('-')+'-'+hashlib.sha256(id.encode()).hexdigest()[:8]
 spec={'assetType':'character-concept','name':plan_name,'prompt':(R/j['prompt']).read_text(encoding='utf-8'),'quality':'high','size':size,'n':1}
 args=['node','scripts/imagegen-router.mjs','edit','--prompt-file',str((R/j['prompt']).resolve())]
 for i in j['inputs']:args+=['--image',str((R/i['file']).resolve())]
 args+=['--quality','high','--size',size,'--background','transparent','--timeout','900','--out',str((folder/'source.png').resolve())]
 request={'kind':kind,'jobId':id,'promptSha256':j['promptSha256'],'inputHashes':j['inputs'],'spec':spec,'argv':args,'folder':str(folder.resolve()),'automaticRetry':False,'actualPromptAuthority':j['prompt'],'mcpProfilePromptTransmitted':False,'mcpUse':'Planning gate only; scoped custom actor prompt and true reference hashes are transmitted by the existing router.'}
 if attempt:request.update(ownerAuthorizedRetry=True,attempt=attempt,maxAdditionalPosts=1)
 write(folder/'request.json',request);print(json.dumps(request))
elif mode=='run':
 request=read(folder/'request.json');assert j['status']=='planned' and not j.get('supersededPlanned')
 assert not j.get('waitingForViewMaster') and not (folder/'source.png').exists()
 assert (folder/'mcp-plan.json').exists(),'Plan before paid request is required'
 assert request['promptSha256']==j['promptSha256']==sha(R/j['prompt'])
 for i in j['inputs']:assert sha(R/i['file'])==i['sha256']
 assert not (folder/'generation-result.json').exists() and not (folder/'dispatch-receipt.json').exists(),'A dispatched or failed POST must never be silently repeated'
 write(folder/'dispatch-receipt.json',{'jobId':id,'postLimit':1,'attempt':attempt or 'initial','automaticRetry':False,'ownerAuthorizedRetry':bool(attempt)})
 result=subprocess.run(request['argv'],cwd=R.parents[3],capture_output=True,encoding='utf-8')
 if result.returncode:
  # The established router redacts its own credentials and image data on error.
  failure={'status':'failed-no-retry','jobId':id,'message':result.stderr[:2000],'automaticRetry':False}
  write(folder/'generation-result.json',failure);print(json.dumps(failure));sys.exit(1)
 result=json.loads(result.stdout);write(folder/'generation-result.json',result)
 print(json.dumps({'jobId':id,'generationVerified':result['generationVerified'],'dimensions':result['files'][0]['dimensions']}))
elif mode=='record':
 request=read(folder/'request.json');assert request['promptSha256']==j['promptSha256']
 assert (folder/'mcp-plan.json').exists(),'Plan before paid request is required'
 metadata=read(folder/'source.json');assert metadata['model']=='gpt-image-2'
 assert metadata['endpoint']=='https://img.aishenji.top/v1/images/edits'
 assert sha(folder/'source.png')==metadata['image']['sha256']
 assert metadata['prompt'].replace('\r\n','\n')==(R/j['prompt']).read_text(encoding='utf-8')
 assert [i['sha256'] for i in metadata['inputImages']]==[i['sha256'] for i in j['inputs']]
 command=[sys.executable,str(R/'record.py'),id,str(folder/'source.png')] if kind=='motion' else [sys.executable,str(R/'production_ops.py'),'record-view',id,str(folder/'source.png')]
 subprocess.run(command,check=True)
 ledger=read(ledger_path);j=next(j for j in ledger['jobs'] if j['id']==id)
 j['apiMetadata']=(folder/'source.json').relative_to(R).as_posix();j['apiRequest']=(folder/'request.json').relative_to(R).as_posix();write(ledger_path,ledger)
else:raise ValueError(mode)
