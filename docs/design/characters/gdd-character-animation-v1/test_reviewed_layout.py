"""Offline safeguards for the single inspected 17-body source."""
import copy,unittest
from reviewed_layout import TARGET,wide_layout_matches

class LayoutWitnessTests(unittest.TestCase):
 def setUp(self):
  self.rows=[[{'box':[10+100*x,10+100*y,70+100*x,90+100*y]} for x in range(n)] for y,n in enumerate([4,4,5,4])]
  self.job={'id':TARGET,'actions':['hit'],'grid':[4,4],'calibrationPoses':8,'supportMode':'stone-foot','alphaPolicy':'body-binary-alpha128-after-nearest','sourceSha256':'raw-fixture','poseSelections':{'hit':[0,1,2,3,5,6]}}
  self.witness={'sourceSha256':'raw-fixture','modelViewedAllRegions':True,'assessment':'All regions explicitly inspected','rowCounts':[4,4,5,4],'regionBounds':[[p['box'][:] for p in row] for row in self.rows]}
 def witnessed(self):
  job=copy.deepcopy(self.job);job['sourceLayoutWitness']=copy.deepcopy(self.witness);return job
 def test_regular_layout_unchanged(self):self.assertTrue(wide_layout_matches(self.job,[r[:4] for r in self.rows]))
 def test_unreviewed_extra_body_rejected(self):self.assertFalse(wide_layout_matches(self.job,self.rows))
 def test_exact_inspected_source_accepted(self):self.assertTrue(wide_layout_matches(self.witnessed(),self.rows))
 def test_other_actor_cannot_borrow_witness(self):
  job=self.witnessed();job['id']='another-actor'
  with self.assertRaises(AssertionError):wide_layout_matches(job,self.rows)
 def test_changed_source_rejected(self):
  job=self.witnessed();job['sourceSha256']='different-raw'
  with self.assertRaises(AssertionError):wide_layout_matches(job,self.rows)
 def test_changed_regions_rejected(self):
  rows=copy.deepcopy(self.rows);rows[2][0]['box'][0]+=1
  with self.assertRaises(AssertionError):wide_layout_matches(self.witnessed(),rows)
 def test_different_keys_rejected(self):
  job=self.witnessed();job['poseSelections']['hit']=[0,1,2,3,4,5]
  with self.assertRaises(AssertionError):wide_layout_matches(job,self.rows)

if __name__=='__main__':unittest.main()
