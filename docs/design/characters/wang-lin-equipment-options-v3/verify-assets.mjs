import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root=fileURLToPath(new URL('./',import.meta.url));
const read=async p=>readFile(resolve(root,p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const m=JSON.parse(await read('manifest.json'));
const generation=JSON.parse(await read('generation.json'));
const reg=JSON.parse(await read('registration.json'));
assert.deepEqual(m.pending,[]);assert.equal(m.bodies.length,9);assert.equal(m.equipmentGroups.length,4);
const original=await read(m.body.file),originalRaw=await sharp(original).ensureAlpha().raw().toBuffer();
assert.equal(hash(original),'78d0fb7e2e159334e65707423d8da2e4608d75e0845dcd3db677a3d1d2a14431');
const live=await sharp(resolve(root,'../../../../client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png')).extract({left:2,top:2,width:64,height:96}).ensureAlpha().raw().toBuffer();
assert(originalRaw.equals(live));
const sourceChecks=[];
assert.equal(generation.requests.length,17);
for(const r of generation.requests){
 assert.equal(r.status,'generated-preview');const bytes=await read(r.raw);assert.equal(hash(bytes),r.sha256);
 assert(bytes.equals(await readFile(r.original)),'Project source must match generated original');
 sourceChecks.push({id:r.id,sha256:r.sha256,size:r.actualDimensions,sourceUnchanged:true});
}
const skin=new Set(['242,206,166','204,152,115','169,104,80','229,184,143']);
const bodies=[];
for(const b of m.bodies){
 const bytes=await read(b.file);assert.equal(hash(bytes),b.sha256);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([info.width,info.height],[64,96]);
 assert.deepEqual(b.pivot,[32,88]);let changed=0,skinPreserved=0;
 for(let y=0;y<96;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4;const a=originalRaw.subarray(i,i+4),v=data.subarray(i,i+4);
  if(!a.equals(v))changed++;
  const canonicalSkin=a[3]&&skin.has(`${a[0]},${a[1]},${a[2]}`);
  if(canonicalSkin){assert(a.equals(v),'Original skin/cloth highlight changed');skinPreserved++;}
  if(y<49||y>=80)assert(a.equals(v),'Head/boots region changed');
 }
 if(b.id!=='original'){
  assert(changed>0,'Outfit must contain real garment changes');assert.equal(b.ownerApproved,false);assert.equal(b.artApproved,false);
  for(const r of b.identity.regions)for(let y=r.top;y<r.top+r.height;y++)for(let x=r.left;x<r.left+r.width;x++){
   const i=(y*64+x)*4;assert(data.subarray(i,i+4).equals(originalRaw.subarray(i,i+4)),'Protected identity mask changed');
  }
  assert.equal(changed,b.changedPixelsFromLive);assert.equal(hash(await read(b.raw)),b.sourceSha256);assert.equal(hash(await read(b.prompt)),b.promptSha256);
 }
 bodies.push({id:b.id,sha256:b.sha256,changedGarmentPixels:changed,skinPreserved,headBootsExact:true});
}
const old=JSON.parse(await read('../wang-lin-equipment-story-v2/manifest.json'));
const gears=[];
for(const g of m.equipmentGroups){
 assert.equal(g.variants.length,3);assert.equal(g.bodyIds.length,3);
 for(const e of g.variants){
  assert.equal(e.ownerApproved,false);assert.equal(e.artApproved,false);assert.deepEqual(e.canvas,[256,224]);assert.deepEqual(e.pivot,[96,200]);
  const originalVariant=e.id==='original';const previous=old.equipment.find(i=>i.id===g.id);
  const hashes=[];
  for(const [field,key]of [['frontFile','front'],['rearFile','rear'],['fxRearFile','fxRear']]){
   const bytes=await read(e[field]);assert.equal(hash(bytes),e.layerSha256[key]);
   if(originalVariant)assert(bytes.equals(await read('../wang-lin-equipment-story-v2/'+previous[field])),'Prior palette changed');
   const{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([info.width,info.height],[256,224]);let clipped=0;
   for(let y=0;y<224;y++)for(let x=0;x<256;x++)if(data[(y*256+x)*4+3]>=128&&(x===0||y===0||x===255||y===223))clipped++;
   assert.equal(clipped,0,'Opaque layer clipped');hashes.push({field,sha256:hash(bytes)});
  }
  if(!originalVariant){assert.equal(hash(await read(e.raw)),e.sourceSha256);assert.equal(hash(await read(e.prompt)),e.promptSha256);}
  gears.push({group:g.id,id:e.id,previousBytesUnchanged:originalVariant,hashes});
 }
}
assert.equal(gears.length,12);assert.equal(hash(await read(m.mapBackground.file)),m.mapBackground.sha256);
const result={date:'2026-10-13',bodyReferenceExactLiveRGBA:true,sourceCount:sourceChecks.length,bodyCount:bodies.length,equipmentVariantCount:gears.length,sources:sourceChecks,bodies,gears,scope:'source integrity, measured identity regions, pivots/layers/alpha; visual anatomy and owner ART approval remain separate',ownerApproved:false,artApproved:false,runtimeIntegrated:false};
await writeFile(root+'review/source-hash-report.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({originalLiveExact:true,generatedSources:17,outfits:8,gearVariants:12,identityRegionsVerified:true,clipping:0}));
