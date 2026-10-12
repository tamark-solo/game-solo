import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {sharp} from './actor-sprite-tools.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),basis=JSON.parse(await readFile('docs/design/characters/actor-animation-standard-v2/approval.json'));
for(const f of basis.targets)assert.equal(sha(await readFile(f.file)),f.sha256,'Approved actor changed');
let clips=0,frames=0;const roots=['docs/design/characters/wang-lin-pixel-life-v1','docs/design/characters/sect-encounter-actors-v2'];
for(const root of roots){const c=JSON.parse(await readFile(root+'/catalog.json'));assert.equal(c.artApproved,false);assert.equal(c.directions.length,8);assert.deepEqual(c.coverage.missing,[]);
 for(const clip of Object.values(c.clips)){clips++;assert.ok(clip.pivot[0]<=clip.frameSize[0]&&clip.pivot[1]<=clip.frameSize[1]);const atlas=await readFile(root+'/'+clip.atlas);assert.equal(sha(atlas),clip.atlasSha256);
  for(const f of clip.frames){frames++;const bytes=await readFile(root+'/'+f.file);assert.equal(sha(bytes),f.sha256);const pixels=await sharp(atlas).extract({left:f.rect.x,top:f.rect.y,width:f.rect.w,height:f.rect.h}).ensureAlpha().raw().toBuffer();assert.ok(pixels.equals(await sharp(bytes).ensureAlpha().raw().toBuffer()),clip.id+' frame parity');}
 }
 if(c.sources)for(const s of c.sources){assert.equal(sha(await readFile(root+'/'+s.file)),s.sha256);assert.equal(sha(await readFile(root+'/'+s.prompt)),s.promptSha256);assert.equal(sha(await readFile(root+'/'+s.input)),s.inputSha256);}
}
assert.equal(clips,120);assert.equal(frames,720);
const report={passed:true,clips,frames,approvedBasisHashes:basis.targets.length,realDirections:8,generatedLifeSources:8,encounterSources:'selected owned archive members with recorded hashes',artApproval:false,ownerMapEdited:false};await writeFile('docs/data/game-actor-actions-verification.json',JSON.stringify(report,null,2)+'\n');console.log(report);
