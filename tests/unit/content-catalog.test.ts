import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateContentCatalog,contentNeighbors,filterContentRecords,type ContentCatalogDocument} from '../../shared/content/catalog';
import {ContentCatalogService} from '../../server/src/application/content-catalog-service';
import {FileContentCatalog} from '../../server/src/persistence/content-catalog-file';
const path=resolve('docs/design/systems/content-registry-v1/catalog.json');
const fixture=async()=>JSON.parse(await readFile(path,'utf8')) as ContentCatalogDocument;

test('catalog indexes legacy IDs and proposed records without becoming gameplay definitions',async()=>{
  const result=validateContentCatalog(await fixture());assert.ok(result.catalog);assert.equal(result.catalog.records.length,96);
  assert.equal(result.catalog.runtimeConsumable,false);assert.equal(result.issues.some(v=>v.severity==='error'),false);
  assert.deepEqual(result.catalog.records.filter(r=>r.domain==='item'&&r.status.implementation==='implemented-local').map(r=>r.id).sort(),['plain-robe','recovery','wood-sword']);
  assert.equal(result.catalog.records.find(r=>r.id==='HN05')?.status.implementation,'unreleased');
  const appearances=result.catalog.records.filter(r=>r.domain==='cosmetic');
  assert.equal(appearances.length,8);
  assert.ok(appearances.every(r=>r.status.implementation==='unreleased'&&r.source.collection==='records'));
});
test('duplicate typed IDs, unsupported subtype and malformed scopes fail closed',async()=>{
  for(const mutate of [(c:ContentCatalogDocument)=>c.records.push(c.records[0]),(c:ContentCatalogDocument)=>c.records[0].classification.subtype='infinite-power',(c:ContentCatalogDocument)=>(c as unknown as {runtimeConsumable:boolean}).runtimeConsumable=true]){
    const c=await fixture();mutate(c);const result=validateContentCatalog(c);assert.equal(result.catalog,undefined);assert.ok(result.issues.some(v=>v.severity==='error'));
  }
});
test('typed references distinguish domains and enforce item/source relationship kinds',async()=>{
  const c=await fixture(),r=c.records.find(r=>r.domain==='source')!;
  r.relations.push({domain:'quest',id:'HN05',relation:'grants'});let result=validateContentCatalog(c);assert.equal(result.catalog,undefined);assert.ok(result.issues.some(v=>v.code==='reference_type'));
  r.relations.pop();r.relations.push({domain:'item',id:'HN05',relation:'grants'});result=validateContentCatalog(c);assert.equal(result.catalog,undefined);assert.ok(result.issues.some(v=>v.code==='missing_reference'));
});
test('catalog refuses paths escaping the workspace and executable/approval fields',async()=>{
  for(const bad of ['../server/data/profiles.sqlite','server/data/profiles.sqlite','docs/binary.exe','C:/private/catalog.json','https://example.com/a','docs/../../private','docs\\file.json']){
    const c=await fixture();c.records[0].source.path=bad;assert.equal(validateContentCatalog(c).catalog,undefined);
  }
  const c=await fixture();Object.assign(c.records[0],{script:'throw new Error()'});assert.equal(validateContentCatalog(c).catalog,undefined);
  const d=await fixture();d.records[0].status.art='owner_approved';assert.equal(validateContentCatalog(d).catalog,undefined);
});
test('lookup supports Vietnamese accents and reverse source/use relationships',async()=>{
  const c=await fixture();assert.equal(filterContentRecords(c.records,{query:'ngoc',domain:'item',implementation:''}).length,3);
  assert.equal(filterContentRecords(c.records,{query:'',domain:'item',implementation:'implemented-local'}).length,3);
  assert.equal(filterContentRecords(c.records,{query:'phap bao',domain:'item',implementation:'',subtype:'artifact'}).length,1);
  const graph=contentNeighbors(c.records,'item:hn-training-jade');assert.ok(graph.record);assert.ok(graph.incoming.some(v=>v.from==='recipe:hn-refine-training-jade'&&v.relation==='transforms-same-instance'));assert.ok(graph.incoming.some(v=>v.from==='source:hn08-first-blank'));
});
test('filesystem reader checks source pointers and can recover after malformed data',async()=>{
  const folder=await mkdtemp(resolve('artifacts','catalog-unit-')),copy=resolve(folder,'catalog.json'),c=await fixture(),reader=new FileContentCatalog(resolve('.'),copy);
  await writeFile(copy,JSON.stringify(c));let result=await reader.read();assert.equal(result.catalog?.records.length,96);assert.ok(result.hash);
  c.records[0].source.path='docs/not-existing-catalog-source.md';await writeFile(copy,JSON.stringify(c));result=await reader.read();assert.equal(result.catalog,undefined);assert.ok(result.issues.some(v=>v.code==='source_pointer'));
  await writeFile(copy,'{');result=await reader.read();assert.equal(result.catalog,undefined);assert.equal(result.issues[0].code,'catalog_read');
  await writeFile(copy,JSON.stringify(await fixture()));assert.equal((await reader.read()).catalog?.records.length,96);
});
test('application denies player reads before accessing the source',async()=>{
  let calls=0;const service=new ContentCatalogService({read:async()=>{calls++;return {hash:null,checkedAt:0,source:'fixture',issues:[]};}});
  assert.throws(()=>service.read('player'),/admin_required/);assert.equal(calls,0);await service.read('admin');assert.equal(calls,1);
});
