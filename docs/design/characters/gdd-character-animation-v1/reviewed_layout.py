"""Validate one explicitly measured source layout; regular sheets stay strict.

The final Sword Servant hit source contains eight neutral calibration bodies
and nine complete reaction/rest bodies. A source-bound witness preserves every
observed region and the selected reaction keys without reshaping the bitmap.
"""
TARGET='sword-servant-southwest-hit-api4x4-r1-neutral-r2'

def wide_layout_matches(job,rows):
 cols,nrows=job.get('observedGrid',job['grid'])
 witness=job.get('sourceLayoutWitness')
 if not witness:return len(rows)==nrows and all(len(row)==cols for row in rows)
 assert job['id']==TARGET and job['actions']==['hit'],'Layout exception is source/action scoped'
 assert job['grid']==[4,4] and job.get('calibrationPoses')==8
 assert job.get('supportMode')=='stone-foot' and job.get('alphaPolicy')!='preserved-soft-RGBA'
 assert witness['sourceSha256']==job['sourceSha256'],'Stale source layout witness'
 assert witness['modelViewedAllRegions'] is True and witness['assessment']
 assert witness['rowCounts']==[4,4,5,4]==[len(row) for row in rows]
 assert witness['regionBounds']==[[list(p['box']) for p in row] for row in rows],'Measured regions changed'
 assert job['poseSelections']=={'hit':[0,1,2,3,5,6]},'Six explicitly viewed reaction/recovery keys only'
 return True
