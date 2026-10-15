"""Offline checks for paid-POST limits. No network or real credentials used."""
from pathlib import Path
import hashlib,json,subprocess,sys,tempfile,unittest
SCRIPT=Path(__file__).with_name('api_source_ops.py')
class PostGuards(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(prefix='gdd-post-guard-')
  self.base=Path(self.tmp.name).resolve();self.r=self.base/'a/b/c/package';self.r.mkdir(parents=True)
  self.script=self.r/'api_source_ops.py';self.script.write_bytes(SCRIPT.read_bytes())
  self.prompt=self.r/'prompt.txt';self.prompt.write_text('fixture only',encoding='utf-8')
  self.folder=self.r/'enemy-production/api-sources/fixture';self.folder.mkdir(parents=True)
  self.count=self.base/'dispatch-count.txt'
  self.job={'id':'fixture','status':'planned','prompt':'prompt.txt','promptSha256':hashlib.sha256(self.prompt.read_bytes()).hexdigest(),'inputs':[]}
  self.write(self.r/'generation.json',{'jobs':[self.job]})
  code="from pathlib import Path;import json;Path("+repr(str(self.count))+").write_text('1');print(json.dumps({'generationVerified':True,'files':[{'dimensions':{'width':1,'height':1}}]}))"
  self.request={'promptSha256':self.job['promptSha256'],'argv':[sys.executable,'-c',code]}
  self.write(self.folder/'request.json',self.request);self.write(self.folder/'mcp-plan.json',{'offlineFixture':True})
 def tearDown(self):
  assert self.r.resolve().is_relative_to(self.base) and self.base.name.startswith('gdd-post-guard-')
  self.tmp.cleanup()
 def write(self,p,d):p.write_text(json.dumps(d),encoding='utf-8')
 def run_step(self,*args):return subprocess.run([sys.executable,str(self.script),'run','motion','fixture',*args],capture_output=True,text=True)
 def reject(self,*args):
  r=self.run_step(*args);self.assertNotEqual(r.returncode,0);self.assertFalse(self.count.exists())
 def authorize(self):
  self.write(self.folder/'generation-result.json',{'status':'failed-no-retry'})
  self.write(self.folder/'retry-authorization.json',{'jobId':'fixture','ownerAuthorized':True,'maxAdditionalPosts':1})
  child=self.folder/'retry-1';child.mkdir();self.write(child/'request.json',self.request);self.write(child/'mcp-plan.json',{'offlineFixture':True});return child
 def authorize_second(self):
  child=self.authorize()
  self.write(child/'generation-result.json',{'status':'failed-no-retry'})
  self.write(child/'dispatch-receipt.json',{'postLimit':1,'attempt':'retry-1','ownerAuthorizedRetry':True})
  self.write(self.folder/'retry-2-authorization.json',{'jobId':'fixture','ownerAuthorized':True,'maxAdditionalPosts':1,'attempt':'retry-2','previousFailedAttempt':'retry-1'})
  child=self.folder/'retry-2';child.mkdir();self.write(child/'request.json',self.request);self.write(child/'mcp-plan.json',{'offlineFixture':True});return child
 def test_existing_dispatch_never_resubmits(self):
  self.write(self.folder/'dispatch-receipt.json',{'postLimit':1});self.reject()
 def test_failed_result_never_resubmits(self):
  self.write(self.folder/'generation-result.json',{'status':'failed-no-retry'});self.reject()
 def test_retry_needs_explicit_matching_authorization(self):self.reject('--attempt','retry-1')
 def test_retry_cannot_expand_limit(self):
  self.authorize();self.write(self.folder/'retry-authorization.json',{'jobId':'fixture','ownerAuthorized':True,'maxAdditionalPosts':2});self.reject('--attempt','retry-1')
 def test_authorized_retry_dispatches_once_only(self):
  child=self.authorize();first=self.run_step('--attempt','retry-1');self.assertEqual(first.returncode,0,first.stderr)
  self.assertEqual(self.count.read_text(),'1');self.assertTrue((child/'dispatch-receipt.json').exists())
  # Simulate interrupted completion: the dispatch receipt alone still stops a POST.
  (child/'generation-result.json').unlink()
  second=self.run_step('--attempt','retry-1');self.assertNotEqual(second.returncode,0);self.assertEqual(self.count.read_text(),'1')
 def test_missing_plan_stops_before_post(self):
  (self.folder/'mcp-plan.json').unlink();self.reject()
 def test_superseded_job_stops_before_post(self):
  self.job['supersededPlanned']=True;self.write(self.r/'generation.json',{'jobs':[self.job]});self.reject()
 def test_second_retry_needs_new_authorization(self):
  self.authorize_second();(self.folder/'retry-2-authorization.json').unlink();self.reject('--attempt','retry-2')
 def test_second_retry_rejects_successful_prior(self):
  self.authorize_second();self.write(self.folder/'retry-1/generation-result.json',{'generationVerified':True});self.reject('--attempt','retry-2')
 def test_second_retry_requires_failed_attempt_receipt(self):
  self.authorize_second();(self.folder/'retry-1/dispatch-receipt.json').unlink();self.reject('--attempt','retry-2')
 def test_second_retry_cannot_expand_single_post(self):
  self.authorize_second();p=self.folder/'retry-2-authorization.json';auth=json.loads(p.read_text());auth['maxAdditionalPosts']=2;self.write(p,auth);self.reject('--attempt','retry-2')
 def test_second_retry_dispatches_once_only(self):
  child=self.authorize_second();first=self.run_step('--attempt','retry-2');self.assertEqual(first.returncode,0,first.stderr)
  self.assertEqual(self.count.read_text(),'1');self.assertTrue((child/'dispatch-receipt.json').exists())
  (child/'generation-result.json').unlink();second=self.run_step('--attempt','retry-2');self.assertNotEqual(second.returncode,0);self.assertEqual(self.count.read_text(),'1')
if __name__=='__main__':unittest.main()
