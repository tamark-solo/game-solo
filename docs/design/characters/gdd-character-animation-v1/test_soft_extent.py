"""Offline checks for exact spectral samples and a fixed source-wide margin."""
import unittest
from PIL import Image
from soft_extent import bounded_soft_pose

class SoftCropTests(unittest.TestCase):
 def fixture(self):
  image=Image.new('RGBA',(100,80))
  for y in range(20,50):
   for x in range(20,40):image.putpixel((x,y),(80,90,100,255))
  image.putpixel((41,35),(100,120,160,60))
  image.putpixel((43,35),(120,130,180,1))
  image.putpixel((90,70),(40,50,60,1))
  region={'box':[20,20,40,50],'large':True}
  return image,region
 def test_keeps_soft_and_faint_fringe_exact(self):
  image,region=self.fixture();before=image.tobytes();pose,box=bounded_soft_pose(image,region,[region],1)
  self.assertEqual(pose.tobytes(),image.crop(box).tobytes())
  self.assertEqual(pose.getpixel((43-box[0],35-box[1])),(120,130,180,1))
  self.assertEqual(image.tobytes(),before)
 def test_excludes_distant_faint_gutter_residue(self):
  image,region=self.fixture();pose,box=bounded_soft_pose(image,region,[region],1)
  self.assertLess(box[2],90);self.assertLess(box[3],70)
 def test_margin_scales_once_per_source(self):
  image,region=self.fixture();image.putpixel((46,35),(80,90,100,1))
  _,small=bounded_soft_pose(image,region,[region],1)
  _,larger=bounded_soft_pose(image,region,[region],.5)
  self.assertLess(small[2],larger[2])
 def test_foreign_body_core_blocks_crop(self):
  image,region=self.fixture();image.putpixel((44,49),(30,40,50,255))
  other={'box':[39,49,45,51],'large':True,'pixels':[49*image.width+44]}
  with self.assertRaisesRegex(AssertionError,'Foreign physical core'):
   bounded_soft_pose(image,region,[region,other],1)

if __name__=='__main__':unittest.main()
