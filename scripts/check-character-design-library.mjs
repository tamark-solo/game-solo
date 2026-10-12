import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {applyCharacterConceptApproval} from './lib/character-concept-approval.mjs';
const readJson = async path => JSON.parse((await readFile(path,'utf8')).replace(/^\uFEFF/,''));
const library = await readJson('docs/design/characters/character-customization-library-v1/catalog.json');
const manifest = await readJson('docs/design/vfx/hoa-than-aura-concepts-v4/assets.json');
const decision = await readJson(library.approvalRecord);
const catalog = await readJson('docs/design/systems/content-registry-v1/catalog.json');
const checkedFiles = new Set();
async function verify(file){
  assert.ok(file.path.startsWith('docs/') || file.path.startsWith('artifacts/archive/'));
  assert.ok(!file.path.split('/').includes('..'));
  const data = await readFile(file.path);
  assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256,'Retained file changed: '+file.path);
  checkedFiles.add(file.path);
}
assert.equal(library.runtimeConsumable,false);
assert.equal(library.retentionDecision.retain,true);
assert.equal(library.records.length,8);
for(const path of library.retainedPacks)assert.ok((await stat(path)).isDirectory(),'Retained pack missing: '+path);
await verify(library.bodyBaseline);
await verify(library.retainedIdentityReference);
await verify(library.archivedStudies);
for(const record of library.records){
  assert.equal(record.retain,true);
  assert.equal(record.productionReady,false);
  assert.equal(record.creationEnabled,false);
  for(const file of record.files)await verify(file);
  const entry = catalog.records.find(entry=>entry.domain==='cosmetic'&&entry.id===record.id);
  assert.equal(entry?.status.implementation,'unreleased');
  assert.equal(entry?.source.recordId,record.id);
}
const approved=applyCharacterConceptApproval(structuredClone(manifest),decision);
assert.equal(approved.ownerApproved,true);
assert.equal(approved.artApproved,true);
assert.equal(approved.productionApproved,false);
assert.equal(manifest.status,approved.status);
for(const concept of approved.concepts){
  const stored = manifest.concepts.find(c=>c.id===concept.id);
  assert.equal(stored.ownerApproved,true);
  assert.equal(stored.artApproved,true);
  assert.equal(stored.productionApproved,false);
  await verify({path:concept.body.file,sha256:concept.body.sha256});
}
// A different image must not inherit this visual approval from a successful build.
const changed=structuredClone(manifest);
changed.concepts[0].source.sha256='changed';
applyCharacterConceptApproval(changed,decision);
assert.equal(changed.ownerApproved,false);
assert.equal(changed.concepts[0].artApproved,false);
console.log(JSON.stringify({approvedConcepts:approved.concepts.length,retainedAppearances:library.records.length,retainedPacks:library.retainedPacks.length,verifiedFiles:checkedFiles.size,archiveRetained:true,changedSourceLosesApproval:true,productionApproved:false,creationEnabled:false}));
