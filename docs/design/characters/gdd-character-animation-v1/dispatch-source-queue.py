"""Run-only bounded source queue. Each job POSTs once; never mutates shared ledgers.

MCP plans must already exist. No retries/fallbacks; after a failure no additional
queued jobs start, while already submitted independent requests finish normally.
"""
from concurrent.futures import ThreadPoolExecutor,wait,FIRST_COMPLETED
from pathlib import Path
import hashlib,json,subprocess,sys
R=Path(__file__).resolve().parent
queue=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'));assert len(queue)==len(set(queue))
ledger=json.loads((R/'generation.json').read_text(encoding='utf-8'))
jobs={j['id']:j for j in ledger['jobs']}
# Validate the whole queue before the first paid call. The run helper repeats
# these guards immediately before dispatch and writes a one-shot receipt.
for id in queue:
 j=jobs[id];folder=R/'enemy-production/api-sources'/id
 assert j['status']=='planned' and not j.get('supersededPlanned') and not j.get('waitingForViewMaster'),id
 assert (folder/'mcp-plan.json').is_file(),f'Missing MCP plan: {id}'
 request=json.loads((folder/'request.json').read_text(encoding='utf-8'))
 assert request['jobId']==id and request['kind']=='motion',id
 assert request['promptSha256']==j['promptSha256']==hashlib.sha256((R/j['prompt']).read_bytes()).hexdigest(),id
 for i in j['inputs']:assert hashlib.sha256((R/i['file']).read_bytes()).hexdigest()==i['sha256'],id
 for name in ['source.png','generation-result.json','dispatch-receipt.json']:
  assert not (folder/name).exists(),f'Already dispatched or completed: {id}'
kind='motion';index=0;failed=[];complete=[];active={}
def run(id):
 p=subprocess.run([sys.executable,'-X','utf8',str(R/'api_source_ops.py'),'run',kind,id],capture_output=True,text=True)
 return {'jobId':id,'exitCode':p.returncode,'result':p.stdout.strip()[:2200],'diagnostic':p.stderr.strip()[:1200]}
with ThreadPoolExecutor(max_workers=4) as pool:
 while index<len(queue) or active:
  while not failed and index<len(queue) and len(active)<4:
   id=queue[index];index+=1;active[pool.submit(run,id)]=id
  if not active:break
  done,_=wait(active,return_when=FIRST_COMPLETED)
  for future in done:
   row=future.result();active.pop(future)
   (failed if row['exitCode'] else complete).append(row['jobId']);print(json.dumps(row),flush=True)
print(json.dumps({'successfulSources':complete,'failedNoRetry':failed,'notDispatched':queue[index:],'recordsAndVisualReviewPending':True}),flush=True)
sys.exit(1 if failed else 0)
