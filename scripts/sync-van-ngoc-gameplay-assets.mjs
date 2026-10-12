import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=resolve(root,'docs/design/gameplay/van-ngoc-gameplay-assets-v1');
const target=resolve(root,'client/public/assets/van-ngoc-gameplay-v1');
const sha=b=>createHash('sha256').update(b).digest('hex');
const m=JSON.parse(await readFile(resolve(base,'assets.json')));
assert.equal(m.runtimeConsumable,false);assert.equal(m.ownerApproved,false);assert.equal(m.artApproved,false);
assert.equal(m.assets.length,14);assert.equal(m.recipes.length,6);
assert.equal(sha(await readFile(resolve(root,m.sourcePlan.path))),m.sourcePlan.sha256);
const plan=JSON.parse(await readFile(resolve(root,m.sourcePlan.path)));
assert.deepEqual(m.recipes,plan.recipes);assert.deepEqual(m.sources,plan.sources);
const approval=JSON.parse(await readFile(resolve(root,m.styleBaseline.approval)));
assert.equal(m.styleBaseline.masterSha256,approval.master.sha256);
await mkdir(target,{recursive:true});
let bytes=0;
for(const asset of m.assets){
 assert.equal(asset.ownerApproved,false);assert.equal(asset.artApproved,false);
 for(const f of asset.files){
  assert.equal(f.path,`native/${f.filename}`);assert.equal(basename(f.filename),f.filename);
  assert.equal(f.url,`/assets/van-ngoc-gameplay-v1/${f.filename}`);
  const data=await readFile(resolve(base,f.path));assert.equal(sha(data),f.sha256);assert.equal(data.length,f.bytes);
  await copyFile(resolve(base,f.path),resolve(target,f.filename));bytes+=f.bytes;
 }
 if(asset.assetType==='prop'){assert.ok(asset.pivot);assert.equal(asset.pivotMeasurement.nativeSha256,asset.files[0].sha256);}
}
const actor=await readFile(resolve(base,'review/actor-64x96.png'));assert.equal(sha(actor),m.character.sha256);
await copyFile(resolve(base,'review/actor-64x96.png'),resolve(target,'actor-64x96.png'));
for(const filename of ['map-crop.png','icons-native-board.png','props-native-board.png'])await copyFile(resolve(base,'review',filename),resolve(target,filename));
await copyFile(resolve(base,'editor-library.json'),resolve(target,'editor-library.json'));
await writeFile(resolve(target,'review.json'),JSON.stringify({...m,itemDefinitions:plan.items},null,2)+'\n');
console.log(`Synced gameplay ART review: 11 icon states, 3 props, 6 exact recipes; native PNGs ${bytes} bytes. No production library or gameplay release modified.`);
